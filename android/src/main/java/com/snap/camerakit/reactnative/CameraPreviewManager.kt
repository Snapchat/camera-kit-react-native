package com.snap.camerakit.reactnative

import android.graphics.Rect
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.snap.camerakit.ImageProcessor
import com.snap.camerakit.support.camera.AspectRatio

class CameraPreviewManager : SimpleViewManager<CameraPreview>() {
    override fun getName() = "CameraPreview"

    override fun createViewInstance(context: ThemedReactContext): CameraPreview {
        return CameraPreview(context)
    }

    override fun onAfterUpdateTransaction(view: CameraPreview) {
        super.onAfterUpdateTransaction(view)
        view.restartPreview()
    }

    @ReactProp(name = "cameraPosition")
    fun setPosition(view: CameraPreview, type: String) {
        view.imageProcessorModule.facingFront = type == "front"
    }

    @ReactProp(name = "ratio")
    fun setAspectRatio(view: CameraPreview, type: String) {
        view.imageProcessorModule.aspectRatio =
            if (AspectRatio.RATIO_16_9.name == type) AspectRatio.RATIO_16_9 else AspectRatio.RATIO_4_3
    }

    @ReactProp(name = "mirrorFramesHorizontally")
    fun setMirrorFramesHorizontally(view: CameraPreview, value: Boolean) {
        view.imageProcessorModule.mirrorFramesHorizontally = value
    }

    @ReactProp(name = "mirrorFramesVertically")
    fun setMirrorFramesVertically(view: CameraPreview, value: Boolean) {
        view.imageProcessorModule.mirrorFramesVertically = value
    }

    @ReactProp(name = "crop")
    fun setCrop(view: CameraPreview, value: ReadableMap?) {
        if (value == null) {
            view.imageProcessorModule.crop = value
        } else {
            view.imageProcessorModule.crop = ImageProcessor.Input.Option.Crop.Center(
                value.getInt("aspectRatioNumerator"), value.getInt("aspectRatioDenominator")
            )
        }
    }

    @ReactProp(name = "safeRenderArea")
    fun setSafeRenderArea(view: CameraPreview, value: ReadableMap?) {
        view.safeRenderArea = if (value == null) {
            Rect(0, 0, view.width, view.height)
        } else {
            Rect(
                value.getInt("left"), value.getInt("top"), value.getInt("right"), value.getInt("bottom")
            )
        }
    }
}
