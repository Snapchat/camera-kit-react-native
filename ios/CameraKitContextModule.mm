#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CameraKitContext, NSObject)

RCT_EXTERN_METHOD(loadLensGroup:(NSString *)groupId:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(applyLens:(NSString *)lensId
                  :(NSDictionary *)launchData
                  :(RCTPromiseResolveBlock)resolve reject
                  :(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(removeLens:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(closeSession:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createNewSession:(NSString *)apiKey:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(takeSnapshot:(NSString *)format
                  :(nonnull NSNumber)quality
                  :(RCTPromiseResolveBlock)resolve reject
                  :(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(takeVideo:(RCTPromiseResolveBlock)resolve reject
                  :(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopTakingVideo:(RCTPromiseResolveBlock)resolve reject
                  :(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

@end
