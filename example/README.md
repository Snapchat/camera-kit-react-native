This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

Ensure that you have access to _Camera Kit API token_ and _Lens Group ID_ to put in your application or run the provided _example_ application. Refer to [this guide](https://docs.snap.com/camera-kit/getting-started/setting-up-accounts) for Camera Kit account setup.

Also, make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Enter Camera Kit API token and group ID

1. Open `App.tsx` in and enter value for `apiToken` with the one you get from Camera Kit Developer portal.
2. Open `Lenses.tsx` and enter value for `groupId` from which you want to fetch lenses. [Optional] Enter value for `launchDataLensId` for the Lens which has launch data associated with it or remove all the relevant code that uses this param.
3. [_Optional_] This example is using version 1.39.0 of Camera Kit Mobile SDK for Android and latest version on iOS. If you want to use the [latest version](https://docs.snap.com/camera-kit/integrate-sdk/mobile/changelog-mobile#latest-version) of Camera Kit Mobile SDK on Android then modify `cameraKitVersion` variable in [build.gradle](../android/build.gradle) file. Please refer to [Lens Studio Compatibility](https://docs.snap.com/camera-kit/ar-content/lens-studio-compatibility) guide for selecting the appropriate version that work with your Lenses.

## Step 2: Start the Metro Server

You will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
yarn start
```

## Step 3: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
yarn android
```

### For iOS

```bash
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 4: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).
