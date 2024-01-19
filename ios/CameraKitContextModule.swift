import SCSDKCameraKit

class SessionErrorHandler: ErrorHandler {
    let eventEmitter: CameraKitEventEmitter
    
    init(events: CameraKitEventEmitter) {
        eventEmitter = events
    }
    
    func handleError(_ error: NSException) {
        eventEmitter.sendError(exception: error)
    }
}

@objc(CameraKitContext)
class CameraKitContextModule: NSObject, LensRepositoryGroupObserver {
    @objc public var session: Session? = nil
    @objc var bridge: RCTBridge!
    var lenses: [String: Lens] = [:]
    var onLensesReceived: RCTPromiseResolveBlock? = nil
    var onLensesReceivedFail: RCTPromiseRejectBlock? = nil
    
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
            resolve(false)
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
        // Silently ignore the 'closeSession' call if CameraKit session does not exists,
        // simplifies session handling on JS side.
        guard let session else {
            resolve(true)
            return
        }
        
        session.stop()
        self.session = nil
        
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
            errorHandler: SessionErrorHandler(events: events))
        
        resolve(true)
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
