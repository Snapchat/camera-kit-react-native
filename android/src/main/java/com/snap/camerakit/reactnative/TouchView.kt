package com.snap.camerakit.reactnative

import android.content.Context
import android.util.Log
import android.view.MotionEvent
import android.view.ViewStub
import android.widget.FrameLayout

class TouchView(context: Context) : FrameLayout(context) {
    val textureView: ViewStub
    init {
        inflate(context, R.layout.camera_kit_touch, this)
        this.textureView = findViewById(R.id.ck_touch_view)
    }

    override fun onTouchEvent(event: MotionEvent?): Boolean {
        Log.i("myk", "touch event!!!!")
        return super.onTouchEvent(event)
    }
}
