import Foundation
import SCSDKCameraKit
import UIKit

public protocol CameraViewProtocol {
    var cameraPosition: NSString { get set }
}

public class CameraPreviewView: PreviewView, CameraViewProtocol {
    @objc public var cameraPosition: NSString = "front"
    @objc public var safeRenderArea: [String: NSNumber]? = nil
    @objc public var mirrorFramesVertically: Bool = false

    private var isOutputAttached = false
    private let sessionQueue = DispatchQueue(label: "CameraPreviewViewQueue", qos: .default)
    private let cameraKitContext: CameraKitContextModule
    private let captureSession: AVCaptureSession = .init()
    private let avInput: AVSessionInput

    init(context: CameraKitContextModule) {
        cameraKitContext = context
        if captureSession.canAddOutput(context.avCapturePhotoOutput) {
            captureSession.addOutput(context.avCapturePhotoOutput)
        }
        avInput = .init(session: captureSession, audioEnabled: false)
        avInput.setVideoOrientation(.landscapeRight)

        super.init(frame: CGRect.zero)
        automaticallyConfiguresTouchHandler = true
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc func orientationChanged(_ notification: Notification) {
        guard let session = cameraKitContext.session else {
            return
        }

        switch UIDevice.current.orientation {
        case .landscapeLeft:
            session.videoOrientation = .landscapeRight
        case .landscapeRight:
            session.videoOrientation = .landscapeLeft
        default:
            session.videoOrientation = .portrait
        }
    }

    override public final func didSetProps(_ changedProps: [String]!) {
        NotificationCenter.default.addObserver(self, selector: #selector(orientationChanged), name: UIDevice.orientationDidChangeNotification, object: nil)

        guard let session = cameraKitContext.session else {
            return
        }

        if changedProps.contains("mirrorFramesVertically") {
            avInput.videoMirrored = mirrorFramesVertically
        }

        if changedProps.contains("cameraPosition") {
            session.cameraPosition = cameraPosition == "front" ? .front : .back
        }

        if changedProps.contains("safeRenderArea") {
            if let safeRenderArea {
                safeArea = CGRect(
                    x: safeRenderArea["top"]?.intValue ?? 0,
                    y: safeRenderArea["left"]?.intValue ?? 0,
                    width: safeRenderArea["right"]?.intValue ?? 0,
                    height: safeRenderArea["bottom"]?.intValue ?? 0)
            }
            else {
                safeArea = CGRect(x: 0, y: 0, width: frame.size.width, height: frame.size.height)
            }
        }

        if !isOutputAttached {
            isOutputAttached = true

            let arInput = ARSessionInput()
            session.start(input: avInput, arInput: arInput)

            sessionQueue.async {
                self.avInput.startRunning()
                session.add(output: self)
            }

            avInput.videoMirrored = mirrorFramesVertically
        }
    }

    override public func removeFromSuperview() {
        cameraKitContext.session?.stop()

        captureSession.stopRunning()

        for input in captureSession.inputs {
            captureSession.removeInput(input)
        }

        for output in captureSession.outputs {
            captureSession.removeOutput(output)
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self, name: UIDevice.orientationDidChangeNotification, object: nil)
    }
}
