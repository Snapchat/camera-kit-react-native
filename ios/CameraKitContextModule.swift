import SCSDKCameraKit
import SCSDKCameraKitReferenceUI

class SessionErrorHandler: ErrorHandler {
    let eventEmitter: CameraKitEventEmitter

    init(events: CameraKitEventEmitter) {
        eventEmitter = events
    }

    func handleError(_ error: NSException) {
        eventEmitter.sendError(exception: error)
    }
}

enum ImageFormat: String {
    case JPEG
    case PNG
}

@objc(CameraKitContext)
class CameraKitContextModule: NSObject, LensRepositoryGroupObserver {
    @objc var bridge: RCTBridge!
    public var session: Session? = nil
    public var avCapturePhotoOutput = AVCapturePhotoOutput()
    public var avInput: AVSessionInput? = nil

    var currentSessionOutput: PreviewView? = nil
    var lenses: [String: Lens] = [:]
    var onLensesReceived: RCTPromiseResolveBlock? = nil
    var onLensesReceivedFail: RCTPromiseRejectBlock? = nil
    var capturePhotoOutput: PhotoCaptureOutput? = nil
    var recorder: Recorder? = nil
    var recorderResolve: RCTPromiseResolveBlock? = nil
    let contextQueue = DispatchQueue(label: "CameraKitContextQueue", qos: .default)

    public func startSession(captureSession: AVCaptureSession, output: PreviewView) {
        guard let session else {
            print("Attempt to start the session, when it's not created.")
            return
        }

        print("starting session...")

        if let capturePhotoOutput {
            session.remove(output: capturePhotoOutput)
        }

        avCapturePhotoOutput = AVCapturePhotoOutput()
        capturePhotoOutput = PhotoCaptureOutput(capturePhotoOutput: avCapturePhotoOutput)

        if captureSession.canAddOutput(avCapturePhotoOutput) {
            captureSession.addOutput(avCapturePhotoOutput)
        }

        if let capturePhotoOutput {
            session.add(output: capturePhotoOutput)
        }

        let avInput = AVSessionInput(session: captureSession, audioEnabled: false)
        let arInput = ARSessionInput()
        session.start(input: avInput, arInput: arInput)

        self.avInput = avInput

        contextQueue.async {
            self.avInput?.startRunning()
            session.add(output: output)
        }
    }

    public func stopSession() {
        guard let session else {
            print("Attempt to close the session, but it does not exists.")
            return
        }

        print("stoping session...")

        session.stop()
        if let capturePhotoOutput = capturePhotoOutput {
            session.remove(output: capturePhotoOutput)
        }

        avInput?.stopRunning()
    }

    @objc public func loadLensGroup(_ groupId: String,
                                    _ resolve: @escaping RCTPromiseResolveBlock,
                                    reject: @escaping RCTPromiseRejectBlock)
    {
        guard let session else {
            resolve([])
            print("[CameraKitReactNative] Attempt to call 'loadLensGroup' when CameraKit session is not initialized.")
            return
        }

        onLensesReceived = resolve
        onLensesReceivedFail = reject

        session.lenses.repository.addObserver(self, groupID: groupId)
    }

    @objc public func applyLens(_ lensId: String,
                                _ launchData: NSDictionary,
                                _ resolve: @escaping RCTPromiseResolveBlock,
                                reject: @escaping RCTPromiseRejectBlock)
    {
        guard let session, let lens = lenses[lensId] else {
            resolve(false)
            print("[CameraKitReactNative] Attempt to call 'applyLens' when CameraKit session is not initialized or lens is not found.")
            return
        }

        var launchParams: LensLaunchData? = nil

        if let inputLaunchParams = launchData["launchParams"] as? [String: Any] {
            let builder = LensLaunchDataBuilder()

            for (key, value) in inputLaunchParams {
                if let stringValue = value as? String {
                    builder.add(string: stringValue, key: key)
                } else if let numberValue = value as? NSNumber {
                    builder.add(number: numberValue, key: key)
                } else if let numberArray = value as? [NSNumber] {
                    builder.add(numberArray: numberArray, key: key)
                } else if let stringArray = value as? [String] {
                    builder.add(stringArray: stringArray, key: key)
                }
            }

            launchParams = builder.launchData
        }

        session.lenses.processor?.apply(lens: lens, launchData: launchParams) { _ in
            resolve(true)
        }
    }

    @objc public func removeLens(_ resolve: @escaping RCTPromiseResolveBlock,
                                 reject: @escaping RCTPromiseRejectBlock)
    {
        guard let session else {
            resolve(true)
            print("[CameraKitReactNative] Attempt to call 'removeLens' when CameraKit session is not initialized.")
            return
        }

        session.lenses.processor?.clear { _ in
            resolve(true)
        }
    }

    @objc public func closeSession(_ resolve: @escaping RCTPromiseResolveBlock,
                                   reject: @escaping RCTPromiseRejectBlock)
    {
        stopSession()
        session = nil
        resolve(true)
    }

    @objc public func createNewSession(_ apiKey: String,
                                       _ resolve: @escaping RCTPromiseResolveBlock,
                                       reject: @escaping RCTPromiseRejectBlock)
    {
        // Ignore 'createNewSession' call if session is already created,
        // simplifies session handling on JS side.
        if session != nil {
            resolve(true)
            print("[CameraKitReactNative] Attempt to call 'createNewSession' when CameraKit session is already initialized.")
            return
        }

        guard let events = (bridge.module(for: CameraKitEventEmitter.self) as? CameraKitEventEmitter) else {
            reject("[CameraKitReactNative]", "CameraKit event emitter is not found.", nil)
            return
        }

        session = Session(
            sessionConfig: SessionConfig(apiToken: apiKey),
            lensesConfig: LensesConfig(),
            errorHandler: SessionErrorHandler(events: events)
        )

        resolve(true)
    }

    @objc public func takeSnapshot(_ format: String,
                                   _ quality: NSNumber,
                                   _ resolve: @escaping RCTPromiseResolveBlock,
                                   reject: @escaping RCTPromiseRejectBlock)
    {
        guard let capturePhotoOutput else {
            print("Attempt to take a snapshot, when photo capture is not available.")
            resolve(false)
            return
        }

        let settings = AVCapturePhotoSettings()
        settings.flashMode = .auto

        capturePhotoOutput.capture(
            with: settings
        ) { image, error in

            if let image, let imageFormat = ImageFormat(rawValue: format) {
                if let data = imageFormat == .JPEG ? image.jpegData(compressionQuality: CGFloat(truncating: quality) / 100) : image.pngData() {
                    let tempFile = FileManager.default.temporaryDirectory
                        .appendingPathComponent(UUID().uuidString)
                        .appendingPathExtension(format.lowercased())

                    do {
                        try data.write(to: tempFile)
                        resolve(["uri": tempFile.absoluteString])
                    } catch {
                        print(error)
                        reject("[CameraKitReactNative]", "Can't write the image.", error)
                    }
                } else {
                    reject("[CameraKitReactNative]", "Failed to create image data.", nil)
                }

            } else {
                reject("[CameraKitReactNative]", "Image capture error, only JPEG and PNG format is supported.", error)
            }
        }
    }

    @objc public func takeVideo(_ resolve: @escaping RCTPromiseResolveBlock,
                                reject: @escaping RCTPromiseRejectBlock)
    {
        guard let session else {
            resolve(true)
            print("[CameraKitReactNative] Attempt to call 'takeVideo' when CameraKit session is not initialized.")
            return
        }

        let tempFile = FileManager.default.temporaryDirectory
            .appendingPathComponent(UUID().uuidString)
            .appendingPathExtension("mp4")

        do {
            let newRecorder = try Recorder(
                url: tempFile,
                orientation: session.activeInput.frameOrientation,
                size: session.activeInput.frameSize
            )

            session.add(output: newRecorder.output)
            newRecorder.startRecording()
            recorderResolve = resolve
            recorder = newRecorder

        } catch {
            reject("[CameraKitReactNative]", "Can't start recording", error)
        }
    }

    @objc public func stopTakingVideo(_ resolve: @escaping RCTPromiseResolveBlock,
                                      reject: @escaping RCTPromiseRejectBlock)
    {
        guard let recorder else {
            reject("[CameraKitReactNative]", "Record was not started.", nil)
            return
        }

        recorder.finishRecording { [weak self] url, error in
            if let error {
                reject("[CameraKitReactNative]", "Failed to record the video.", error)
                print("[CameraKitReactNative] Failed to record the video: \(error)")
            } else if let strongSelf = self, let recorderResolve = strongSelf.recorderResolve {
                resolve(true)
                recorderResolve(["uri": url?.absoluteString])
            } else {
                resolve(false)
            }
        }
    }

    func repository(_ repository: LensRepository, didUpdateLenses lenses: [Lens], forGroupID groupID: String) {
        self.lenses.merge(Dictionary(uniqueKeysWithValues: lenses.map { ($0.id, $0) })) { current, _ in current }

        if let onLensesReceived {
            let lensesResult = lenses.map {
                [
                    "name": $0.name ?? "<no name>",
                    "icons": [["imageUrl": $0.iconUrl?.description]],
                    "id": $0.id,
                    "groupId": $0.groupId,
                    "previews": [["imageUrl": $0.preview.imageUrl]],
                    "snapcodes": [],
                    "facingPreference": $0.facingPreference == LensFacingPreference.front ? "FRONT" : "BACK",
                    "vendorData": $0.vendorData
                ]
            }

            onLensesReceived(lensesResult)
        }
    }

    func repository(_ repository: LensRepository, didFailToUpdateLensesForGroupID groupID: String, error: Error?) {
        if let onLensesReceivedFail {
            onLensesReceivedFail("Failed to receive lenses by groupId: \(groupID)", error?.localizedDescription, error)
        }
    }
}
