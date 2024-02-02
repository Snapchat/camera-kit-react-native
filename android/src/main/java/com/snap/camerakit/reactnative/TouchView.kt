package com.snap.camerakit.reactnative

import android.content.Context
import android.view.ViewStub
import android.widget.FrameLayout

class TouchView(context: Context) : FrameLayout(context) {
    val textureView: ViewStub
    init {
        inflate(context, R.layout.camera_kit_touch, this)
        this.textureView = findViewById(R.id.ck_touch_view)
    }
}
