package com.snap.camerakit.reactnative

import android.os.Handler
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.snap.camerakit.Session
import com.snap.camerakit.invoke
import com.snap.camerakit.lenses.LensesComponent
import com.snap.camerakit.support.camerax.CameraXImageProcessorSource

@ReactModule(name = CameraKitContextModule.NAME)
class CameraKitContextModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    var currentSession: Session? = null
        private set

    private var currentLenses = mapOf<String, LensesComponent.Lens>()
    private val imageProcessorSource: CameraXImageProcessorSource
        get() = reactApplicationContext.getNativeModule(CameraImageProcessorModule::class.java)!!.imageProcessorSource
    private val eventEmitter: CameraKitEventEmitter
        get() = reactApplicationContext.getNativeModule(CameraKitEventEmitter::class.java)!!


    @ReactMethod
    fun loadLensGroups(groupIds: String, promise: Promise) {
        if (currentSession == null) {
            eventEmitter.sendWarning("Attempt to load lenses when session is not available.")
            promise.resolve(Arguments.makeNativeArray(emptyList<LensesComponent.Lens>()))
            return
        }

        currentSession!!.lenses.repository.get(LensesComponent.Repository.QueryCriteria.Available(groupIds)) { result ->
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
    fun applyLens(lensId: String, promise: Promise) {
        if (currentSession == null) {
            eventEmitter.sendWarning("Attempt to apply the lens when session is not available.")
            promise.resolve(false)
            return
        }

        val lensObj = currentLenses[lensId]

        if (lensObj != null) {
            currentSession!!.lenses.processor.apply(lensObj) { status ->
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

        currentSession = Session(reactApplicationContext.applicationContext){
            apiToken(apiKey)
            imageProcessorSource(imageProcessorSource)
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

    override fun getName() = NAME

    companion object {
        internal const val NAME = "CameraKitContext"
    }
}

