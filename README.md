# Camera Kit wrapper for React Native

This project provides a wrapper to Snap's [Camera Kit](https://ar.snap.com/camera-kit) solution that simplifies and speeds up the integration process for developers building React Native apps. While development on native platforms is still a recommended way, this wrapper provides a convenient way to implement basic functionalities of Camera Kit in React Native application. 

>**Note:** Advanced functionalities like Remote API support, Inclusive Camera features, etc. are not supported in this wrapper implementation yet. If your project needs the missing features then feel free to implement it yourself and submit a PR to this repo or use native development environment.

## Installation

You can install the Camera Kit React Native package using npm:

```sh
npm install @snap/camera-kit-react-native
```

## Usage

Start with importing the following modules:

```js
import { CameraKitContext } from '@snap/camera-kit-react-native';
import { useCameraKit } from '@snap/camera-kit-react-native';
```

`CameraKitContext` component will contain global configuration for CameraKit session whereas `useCameraKit` hook will provide API for managing native CameraKit session, load lenses, apply lens, etc.

For Android, make sure you have following permissions defined in `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.CAMERA" />

<!-- optionally, if you want to record audio: -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

### Please refer to the [example](./example) directory for detailed usage examples on how to integrate and use this wrapper in your React Native project.

***Usage example:***
```js
import { PreviewView, useCamera } from "@snap/camera-kit-react-native"
import { useEffect } from "react"
import { View, FlatList, Pressable, Image } from "react-native"
import { Lenses } from "./lenses"

export function App() {
    const { setPosition } = useCamera();

    useEffect(async () => {
        setPosition("front");
    })
    
    return (
        <CameraKitContext apiToken="<API Token from Camera Kit Portal>" safeArea={{top: 100, bottom: 200}}>
            <PreviewView />
            <Lenses />
        </CameraKitContext>
    )
}
```

***Lens carousel example:***
```js
import { PreviewView, useCameraKitManager } from "@snap/camera-kit-react-native"
import { useEffect } from "react"
import { View, FlatList, Pressable, Image } from "react-native"
import { useCameraManager } from "./partner-camera"

function Lenses({ groupId }: { groupId: string }) {
    const { loadLenses, applyLens } = useCameraKitManager();
    const [lenses, setLenses] = useState([]);

    useEffect(async () => {
        const getLenses = async () => {
            const lenses = await loadLenses(groupId);
            setLenses(lenses);
        }

        getLenses().catch(console.error)

        return undefined;
    }, [loadLenses])

    return (
        <View style={{position: 'absolute'}}>
            <FlatList
                horizontal={true}
                data={lenses}
                renderItem={item => (
                    <Pressable
                        onPress={() => {
                            applyLens(item.item.id);
                        }}>
                        <Image
                            source={{uri: item.item.icon}}
                        />
                    </Pressable>
                )}
                keyExtractor={item => item.id}
            />
        </View>
    )
}
```

## Contributing
If you would like to contribute to this repo, please feel free to open a pull request. Make sure you test your changes with the [example](./example) project and update the required [docs](./docs) section by running `yarn docs` command. We are always looking for ways to improve the Camera Kit offering. Thank you for your contribution!! :pray:

## License
Please refer to the [LICENSE](/LICENSE) file for license information.
