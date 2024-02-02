package com.snap.camerakit.reactnative

import android.content.Context
import android.view.ViewStub
import android.widget.FrameLayout

class TouchViewContainer(context: Context) : FrameLayout(context) {

    val touchViewStub: ViewStub
    init {
        inflate(context, R.layout.camera_kit_touch, this)
        this.touchViewStub = findViewById(R.id.ck_touch_view)
    }

    override fun requestLayout() {
        super.requestLayout()

        // Workaround to resize dynamically added children https://github.com/facebook/react-native/issues/4990.
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        measure(
            MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
        )
        layout(left, top, right, bottom)
    }
}
