import Foundation
import SCSDKCameraKit

public protocol CameraViewProtocol {
    var cameraPosition: NSString { get set }
}

public class CameraPreviewView: PreviewView, CameraViewProtocol {
    @objc public var cameraPosition: NSString = "front"
    
    private var isOutputAttached = false
    private let sessionQueue = DispatchQueue(label: "CameraPreviewViewQueue", qos: .default)
    private let cameraKitSession: Session
    private let captureSession: AVCaptureSession = .init()

    init(session: Session) {
        cameraKitSession = session
        super.init(frame: CGRect.zero)
        automaticallyConfiguresTouchHandler = true
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override public final func didSetProps(_ changedProps: [String]!) {
        cameraKitSession.cameraPosition = cameraPosition == "front" ? .front : .back
        
        if !isOutputAttached {
            isOutputAttached = true
            
            let avInput = AVSessionInput(session: captureSession, audioEnabled: false)
            let arInput = ARSessionInput()
            
            cameraKitSession.start(input: avInput, arInput: arInput)
            
            sessionQueue.async {
                avInput.startRunning()
                self.cameraKitSession.add(output: self)
            }
        }
    }
    
    override public func removeFromSuperview() {
        cameraKitSession.stop()
        captureSession.stopRunning()
    
        for input in captureSession.inputs {
            captureSession.removeInput(input)
        }
        
        for output in captureSession.outputs {
            captureSession.removeOutput(output)
        }
    }
}
