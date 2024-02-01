#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTViewManager.h>
#import <React/RCTUtils.h>

@interface RCT_EXTERN_MODULE(CameraPreviewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(cameraPosition, NSString)
RCT_EXPORT_VIEW_PROPERTY(safeRenderArea, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(mirrorFramesHorizontally, BOOL)

@end
