package com.snap.camerakit.reactnative

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule

@ReactModule(name = CameraKitEventEmitter.NAME)
class CameraKitEventEmitter(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext)  {

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }
    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    fun sendError(item: Throwable){
        val params = Arguments.createMap().apply {
            putString("message", item.message)
            putString("cause", item.cause?.message)
            putString("stackTrace", item.stackTrace.joinToString("\n"))
        }
        sendEvent(EventType.Error, params)
    }

    fun sendWarning(message: String){
        sendEvent(EventType.Warning, Arguments.createMap().apply {
            putString("message", message)
        })
    }

    private fun sendEvent( eventName: EventType, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName.toString(), params)
    }


    enum class EventType(private val value: String) {
        Error("error"),
        Warning("warn"),
        Log("log"),
        Info("info"),
        Debug("debug");

        override fun toString(): String {
            return value
        }
    }

    override fun getName() = NAME
    companion object {
        internal const val NAME = "CameraKitEventEmitter"
    }
}
