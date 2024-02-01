package com.snap.camerakit.reactnative

import androidx.lifecycle.ProcessLifecycleOwner
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.module.annotations.ReactModule
import com.snap.camerakit.ImageProcessor
import com.snap.camerakit.support.camera.AllowsCameraPreview
import com.snap.camerakit.support.camera.AspectRatio
import com.snap.camerakit.support.camera.Crop
import com.snap.camerakit.support.camerax.CameraXImageProcessorSource
import java.util.concurrent.Executors

@ReactModule(name = CameraImageProcessorModule.NAME)
class CameraImageProcessorModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    var facingFront = true
    var aspectRatio = AspectRatio.RATIO_16_9
    var mirrorFramesHorizontally = false
    var mirrorFramesVertically = false
    var crop: ImageProcessor.Input.Option.Crop? = null
    val imageProcessorSource = CameraXImageProcessorSource(
        context = reactApplicationContext.applicationContext,
        lifecycleOwner = ProcessLifecycleOwner.get(),
        executorService = Executors.newSingleThreadExecutor(),
        videoOutputDirectory = reactApplicationContext.applicationContext.cacheDir
    )

    fun stopPreview() {
        imageProcessorSource.stopPreview()
    }

    fun startPreview() {
        val inputOptions = mutableSetOf<ImageProcessor.Input.Option>()

        if (mirrorFramesVertically) {
            inputOptions.add(ImageProcessor.Input.Option.MirrorFramesVertically)
        }

        // On Android, in case if camera is facing front, frames are mirrored by default
        // in that case in order to support consistency between platforms I need to
        // invert the vertical frames mirroring if camera is facing front.
        if (facingFront && !mirrorFramesHorizontally) {
            inputOptions.add(ImageProcessor.Input.Option.MirrorFramesHorizontally)
        }
        // With the back camera behaviour is the same for both platforms.
        else if(!facingFront && mirrorFramesHorizontally){
            inputOptions.add(ImageProcessor.Input.Option.MirrorFramesHorizontally)
        }

        crop?.let {
            inputOptions.add(it)
        }

        val configuration = AllowsCameraPreview.Configuration.Default(facingFront, aspectRatio, Crop.None)
        imageProcessorSource.startPreview(
            configuration, inputOptions
        ) {}
    }

    override fun getName() = NAME

    companion object {
        internal const val NAME = "CameraImageProcessor"
    }
}
