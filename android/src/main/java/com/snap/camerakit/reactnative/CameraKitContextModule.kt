package com.snap.camerakit.reactnative

import android.graphics.Bitmap
import android.graphics.Bitmap.CompressFormat
import android.graphics.Rect
import android.os.Handler
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.module.annotations.ReactModule
import com.snap.camerakit.SafeRenderAreaProcessor
import com.snap.camerakit.Session
import com.snap.camerakit.Source
import com.snap.camerakit.common.Consumer
import com.snap.camerakit.configureLenses
import com.snap.camerakit.invoke
import com.snap.camerakit.lenses.LensesComponent
import com.snap.camerakit.lenses.configureCarousel
import com.snap.camerakit.lenses.configureHints
import com.snap.camerakit.lenses.configureLoadingOverlay
import com.snap.camerakit.lenses.newBuilder
import com.snap.camerakit.support.camerax.CameraXImageProcessorSource
import java.io.Closeable
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

@ReactModule(name = CameraKitContextModule.NAME)
class CameraKitContextModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    Source<SafeRenderAreaProcessor> {

    var currentSession: Session? = null
        private set
    var setSafeRenderArea: Consumer<Rect>? = null
    var touchViewContainer = TouchViewContainer(reactApplicationContext.applicationContext)

    private var videoRecording: Closeable? = null
    private var currentLenses = mapOf<String, LensesComponent.Lens>()
    private val imageProcessorSource: CameraXImageProcessorSource
        get() = reactApplicationContext.getNativeModule(CameraImageProcessorModule::class.java)!!.imageProcessorSource
    private val eventEmitter: CameraKitEventEmitter
        get() = reactApplicationContext.getNativeModule(CameraKitEventEmitter::class.java)!!

    @ReactMethod
    fun loadLensGroup(groupId: String, promise: Promise) {
        if (currentSession == null) {
            eventEmitter.sendWarning("Attempt to load lenses when session is not available.")
            promise.resolve(Arguments.makeNativeArray(emptyList<LensesComponent.Lens>()))
            return
        }

        currentSession!!.lenses.repository.get(LensesComponent.Repository.QueryCriteria.Available(groupId)) { result ->
            when (result) {
                LensesComponent.Repository.Result.None -> promise.resolve(Arguments.makeNativeArray(emptyList<LensesComponent.Lens>()))

                is LensesComponent.Repository.Result.Some -> {
                    val lenses = result.lenses
                    this.currentLenses = this.currentLenses.plus(lenses.associateBy { it.id })
                    promise.resolve(Arguments.makeNativeArray(lenses.map { lens ->
                        Arguments.makeNativeMap(
                            mapOf("id" to lens.id,
                                "icons" to lens.icons.map { mapOf("imageUrl" to it.uri) },
                                "groupId" to lens.groupId,
                                "name" to lens.name,
                                "vendorData" to lens.vendorData,
                                "facingPreference" to lens.facingPreference?.name,
                                "previews" to lens.previews.map { mapOf("imageUrl" to it.uri) },
                                "snapcodes" to lens.snapcodes.associate {
                                    if (it.javaClass == LensesComponent.Lens.Media.DeepLink::class.java) "deepLink" to it.uri
                                    else "imageUrl" to it.uri
                                })
                        )
                    }))
                }
            }
        }
    }

    @ReactMethod
    fun applyLens(lensId: String, launchData: ReadableMap, promise: Promise) {
        if (currentSession == null) {
            eventEmitter.sendWarning("Attempt to apply the lens when session is not available.")
            promise.resolve(false)
            return
        }

        val lensObj = currentLenses[lensId]

        if (lensObj != null) {

            var lensLaunchData: LensesComponent.Lens.LaunchData = LensesComponent.Lens.LaunchData.Empty

            if (launchData.toHashMap().isNotEmpty() && launchData.hasKey(LAUNCH_PARAMS_KEY)) {
                val launchDataBuilder = LensesComponent.Lens.LaunchData.newBuilder()

                launchData.getMap(LAUNCH_PARAMS_KEY)?.toHashMap()?.forEach { (key, value) ->
                    when (value) {
                        is String -> launchDataBuilder.putString(key, value)
                        is ArrayList<*> -> {
                            when {
                                value.any { it is String } -> launchDataBuilder.putStrings(
                                    key, *value.filterIsInstance<String>().toTypedArray()
                                )

                                value.any { it is Number } -> launchDataBuilder.putNumbers(
                                    key, *value.filterIsInstance<Number>().toTypedArray()
                                )
                            }
                        }

                        is Number -> launchDataBuilder.putNumber(key, value)
                    }
                }

                lensLaunchData = launchDataBuilder.build()
            }

            currentSession!!.lenses.processor.apply(lensObj, lensLaunchData) { status ->
                promise.resolve(status)
            }
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun removeLens(promise: Promise) {
        if (currentSession == null) {
            eventEmitter.sendWarning("Attempt to apply the lens when session is not available.")
            promise.resolve(false)
            return
        }

        currentSession!!.lenses.processor.clear {
            promise.resolve(it)
        }
    }

    @ReactMethod
    fun createNewSession(apiKey: String, promise: Promise) {
        if (currentSession != null) {
            promise.resolve(true)
            return
        }

        val safeRenderAreaProcessor = this

        currentSession = Session(reactApplicationContext.applicationContext) {
            apiToken(apiKey)
            attachTo(touchViewContainer.touchViewStub, false)
            imageProcessorSource(imageProcessorSource)
            safeRenderAreaProcessorSource(safeRenderAreaProcessor)
            // Disable default Camera Kit lenses UI.
            configureLenses {
                configureLoadingOverlay { enabled = false }
                configureCarousel { enabled = false }
                configureHints { enabled = false }
            }
            handleErrorsWith { item ->
                eventEmitter.sendError(item)
            }
        }

        promise.resolve(true)
    }

    @ReactMethod
    fun closeSession(promise: Promise) {
        if (currentSession == null) {
            promise.resolve(true)
            return
        }

        val handler = Handler(reactApplicationContext.applicationContext.mainLooper)
        handler.post {
            imageProcessorSource.stopPreview()
        }

        currentSession?.close()
        currentSession = null
        promise.resolve(true)
    }

    @ReactMethod
    fun takeSnapshot(format: String, quality: Int, promise: Promise) {
        val onSnapshotAvailable: (Bitmap) -> Unit = { bitmap ->
            try {
                val compressFormat = CompressFormat.valueOf(format)
                val tempFile = File.createTempFile(
                    "snap-camera-kit-snapshot",
                    compressFormatToExtension(compressFormat),
                    reactApplicationContext.cacheDir
                )

                FileOutputStream(tempFile).use {
                    bitmap.compress(compressFormat, quality, it)
                }

                promise.resolve(
                    Arguments.makeNativeMap(
                        mapOf(
                            "uri" to tempFile.toURI().toString(),
                        )
                    )
                )

            } catch (error: Throwable) {
                promise.reject(error)
            }
        }

        imageProcessorSource.takeSnapshot(onSnapshotAvailable)
    }

    @ReactMethod
    fun takeVideo(promise: Promise) {
        if (videoRecording != null) {
            eventEmitter.sendWarning("Stop the previous recording before starting a new one.")
            return
        }

        val onVideoAvailable: (File) -> Unit = { video ->
            promise.resolve(
                Arguments.makeNativeMap(
                    mapOf(
                        "uri" to video.toURI().toString()
                    )
                )
            )
        }

        videoRecording = imageProcessorSource.takeVideo(onVideoAvailable)
    }

    @ReactMethod
    fun stopTakingVideo(promise: Promise) {
        if (videoRecording == null) {
            eventEmitter.sendWarning("Recording is not started.")
            return
        }

        try {
            videoRecording?.close()
            videoRecording = null
            promise.resolve(true)
        } catch (error: IOException) {
            promise.reject(error)
        }
    }

    private fun compressFormatToExtension(compressFormat: CompressFormat): String {
        return when (compressFormat) {
            CompressFormat.JPEG -> ".jpeg"
            CompressFormat.PNG -> ".png"
            else -> {
                throw Error("$compressFormat is not supported, supported formats JPEG and PNG.")
            }
        }

    }

    override fun getName() = NAME

    companion object {
        internal const val NAME = "CameraKitContext"
        internal const val LAUNCH_PARAMS_KEY = "launchParams"
    }

    override fun attach(processor: SafeRenderAreaProcessor): Closeable {
        processor.connectInput(object : SafeRenderAreaProcessor.Input {
            override fun subscribeTo(onSafeRenderAreaAvailable: Consumer<Rect>): Closeable {
                setSafeRenderArea = onSafeRenderAreaAvailable
                return Closeable {
                    setSafeRenderArea = null
                }
            }
        })
        return Closeable {
            setSafeRenderArea = null
        }
    }
}

