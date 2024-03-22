package com.snap.camerakit.reactnative

import android.annotation.SuppressLint
import android.graphics.Rect
import android.view.TextureView
import android.widget.FrameLayout
import com.facebook.react.uimanager.ThemedReactContext
import com.snap.camerakit.connectOutput
import java.io.Closeable

@SuppressLint("ViewConstructor")
class CameraPreview(reactApplicationContext: ThemedReactContext) :
    FrameLayout(reactApplicationContext.applicationContext) {

    val imageProcessorModule: CameraImageProcessorModule =
        reactApplicationContext.getNativeModule(CameraImageProcessorModule::class.java)!!
    var safeRenderArea: Rect? = null

    private val cameraKitModule: CameraKitContextModule =
        reactApplicationContext.getNativeModule(CameraKitContextModule::class.java)!!
    private val textureView: TextureView
    private val closeOnDetach = mutableListOf<Closeable>()

    init {
        inflate(context, R.layout.camera_kit_view, this)
        this.textureView = findViewById(R.id.ck_texture_view)
    }

    fun restartPreview() {
        if (isAttachedToWindow) {
            imageProcessorModule.stopPreview()
            if(safeRenderArea != null){
                cameraKitModule.setSafeRenderArea?.accept(safeRenderArea)
            }
            imageProcessorModule.startPreview()
        }
    }

    override fun onDetachedFromWindow() {
        removeView(cameraKitModule.touchViewContainer)
        imageProcessorModule.stopPreview()

        closeOnDetach.forEach { closeable ->
            closeable.close()
        }

        closeOnDetach.clear()

        super.onDetachedFromWindow()
    }


    override fun onAttachedToWindow() {
        addView(cameraKitModule.touchViewContainer)
        if (cameraKitModule.currentSession != null) {
            cameraKitModule.currentSession!!.processor.connectOutput(this.textureView).closeOnDetach()
            imageProcessorModule.startPreview()
        }

        super.onAttachedToWindow()
    }

    private fun Closeable.closeOnDetach() {
        if (isAttachedToWindow) {
            closeOnDetach.add(this)
        } else {
            close()
        }
    }
}
