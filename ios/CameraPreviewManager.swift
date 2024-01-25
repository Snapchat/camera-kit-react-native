import Foundation
import SCSDKCameraKit

public class CameraPreviewError: UILabel, CameraViewProtocol {
    @objc public var cameraPosition: NSString = ""

    public init() {
        super.init(frame: CGRect.zero)

        let errorMessage = "Error: [CameraKitReactNative] Attempt to render CameraPreviewView when CameraKit session is not initialized."
        print(errorMessage)

        text = errorMessage
        textColor = .red
        numberOfLines = 0
        lineBreakMode = .byWordWrapping
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

@objc(CameraPreviewManager) public class CameraPreviewManager: RCTViewManager {
    override public static func requiresMainQueueSetup() -> Bool {
        true
    }

    override public func view() -> UIView! {
        guard let cameraKitContext = (bridge.module(for: CameraKitContextModule.self) as? CameraKitContextModule) else {
            return CameraPreviewError()
        }
        return CameraPreviewView(context: cameraKitContext)
    }
}
