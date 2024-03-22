import Foundation

@objc(CameraKitEventEmitter)
open class CameraKitEventEmitter: RCTEventEmitter {
    open func sendError(exception: NSException) {
        if self.bridge.module(for: self.classForCoder) != nil {
            var error: [String: String] = [:]

            error["message"] = exception.name.rawValue
            error["cause"] = exception.reason
            error["stackTrace"] = Thread.callStackSymbols.joined(separator: "\n")

            super.sendEvent(withName: "error", body: error)
        }
    }

    @objc override open func supportedEvents() -> [String] {
        ["error", "warn", "log", "info", "debug"]
    }

    override open class func requiresMainQueueSetup() -> Bool {
        false
    }
}
