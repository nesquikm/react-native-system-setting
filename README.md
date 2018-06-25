## react-native-system-setting
It provides some system setting APIs for you. Support iOS and Android both.

### Support

* Volume ( with listener)
* Brightness
* Wifi switch
* Location
* Bluetooth
* Airplane

### Note

**[Example](https://github.com/c19354837/react-native-system-setting/tree/master/examples/SystemSettingExample) only work in the real device**

### Change Log

[Change Log](https://github.com/c19354837/react-native-system-setting/blob/master/CHANGELOG.md)

breaking change for `switchWifiSilence()` in V1.3.0, see [Powerful API](https://github.com/c19354837/react-native-system-setting#powerful-api)

## Look like

I really want to show the .gif, while it has no difference with .jpg for some system limit.

I strongly recommend you to run the example in real device to see how it works.

<img src="https://raw.githubusercontent.com/c19354837/react-native-system-setting/master/screenshot/ios.png" width = "40%"/>&nbsp;&nbsp;&nbsp;
<img src="https://raw.githubusercontent.com/c19354837/react-native-system-setting/master/screenshot/android.jpg" width = "40%" />

## Install
Run `npm i -S react-native-system-setting`

**Note: if your project was created by [Create React Native App](https://github.com/react-community/create-react-native-app), you should [Eject](https://github.com/react-community/create-react-native-app/blob/master/EJECTING.md) before link it.**

#### iOS
Run `react-native link` to link this library.

Or add `pod 'RCTSystemSetting', :path => '../node_modules/react-native-system-setting'` in `Podfile` for Cocoapods.

If link does not work, you can do it [manually](https://facebook.github.io/react-native/docs/linking-libraries-ios.html).

#### Android
Run `react-native link` to link this library.

That's all.

If link does not work, you can do it manually. Just follow this way:

**android/settings.gradle**

```gradle
include ':react-native-system-setting'
project(':react-native-system-setting').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-system-setting/android')
```

**android/app/build.gradle**

```gradle
dependencies {
   ...
   compile project(':react-native-system-setting')
}
```

**MainApplication.java**

On top, where imports are:

```java
import com.ninty.system.setting.SystemSettingPackage;
```

Add the `SystemSettingPackage` class to your list of exported packages.

```java
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.asList(
            new MainReactPackage(),
            new SystemSettingPackage()
    );
}
```


## Usage

**Common import**

```javascript
import SystemSetting from 'react-native-system-setting'
```

**volume**

```javascript
//get the current volume
SystemSetting.getVolume().then((volume)=>{
    console.log('Current volume is ' + volume);
});

// listen the volume changing if you need
const volumeListener = SystemSetting.addVolumeListener((data) => {
    const volume = data.value;
    console.log(volume);
});

//remove listener when you need it no more
SystemSetting.removeVolumeListener(volumeListener)
```

> `setVolume` can do more, [more detail](https://github.com/c19354837/react-native-system-setting/blob/master/API.md)

**brightness**

```javascript
//get the current brightness
SystemSetting.getBrightness().then((brightness)=>{
    console.log('Current brightness is ' + brightness);
});

//change the brightness & check permission
SystemSetting.setBrightnessForce(0.5).then((success)=>{
    !success && Alert.alert('Permission Deny', 'You have no permission changing settings',[
	   {'text': 'Ok', style: 'cancel'},
	   {'text': 'Open Setting', onPress:()=>SystemSetting.grantWriteSettingPremission()}
	])
});

// save the value of brightness and screen mode.
SystemSetting.saveBrightness();
// restore the brightness and screen mode. you can get the old brightness value.
SystemSetting.restoreBrightness().then((oldVal)=>{
    //if you need
})

// change app's brightness without any permission.
SystemSetting.setAppBrightness(0.5);
SystemSetting.getAppBrightness().then((brightness)=>{
    console.log('Current app brightness is ' + brightness);
})
```

**Wifi**

```javascript
SystemSetting.isWifiEnabled().then((enable)=>{
    const state = enable ? 'On' : 'Off';
    console.log('Current wifi is ' + state);
})

SystemSetting.switchWifi(()=>{
    console.log('switch wifi successfully');
})
```

**Location**

```javascript
SystemSetting.isLocationEnabled().then((enable)=>{
    const state = enable ? 'On' : 'Off';
    console.log('Current location is ' + state);
})

SystemSetting.switchLocation(()=>{
    console.log('switch location successfully');
})
```

**Bluetooth**

```javascript
SystemSetting.isBluetoothEnabled().then((enable)=>{
    const state = enable ? 'On' : 'Off';
    console.log('Current bluetooth is ' + state);
})

SystemSetting.switchBluetooth(()=>{
    console.log('switch bluetooth successfully');
})
```

**Airplane**

```javascript
SystemSetting.isAirplaneEnabled().then((enable)=>{
    const state = enable ? 'On' : 'Off';
    console.log('Current airplane is ' + state);
})

SystemSetting.switchAirplane(()=>{
    console.log('switch airplane successfully');
})
```

> `isAirplaneEnabled()` will always return `true` for iOS if your device has no SIM card, see [detail](https://github.com/c19354837/react-native-system-setting/issues/37)

## API

[API](https://github.com/c19354837/react-native-system-setting/blob/master/API.md)

## Run example

```
$ cd example/SystemSettingExample
$ npm install
// if android
$ react-native run-android
// else
$ react-native run-ios
```

## App Store

Some APIs are dangerous for iOS:

* `switchWifi()`
* `switchBluetooth()`
* `switchLocation()`
* `switchAirplane()`

I implement them by using non-public APIs, which is not permitted on the App Store, see [this issure](https://github.com/c19354837/react-native-system-setting/issues/28).

If you are developing a App Store version, you have to give up these APIs.

To avoid unnecessary trouble, you can call `SystemSetting.setAppStore(true)` which will invalidate these APIs.

> As an alternative, you can show a tip to tell the user how to change the system setting.

## Android permission

### Remove permission

To simplify using, I have declared all permission in [AndroidManifest.xml](https://github.com/c19354837/react-native-system-setting/blob/master/android/src/main/AndroidManifest.xml).

And you can delete the permission safely if it's useless for your app.

You can find the file in `yourProject/node_modules/react-native-system-setting/android/src/main/AndroidManifest.xml`. (Be sure that you have run `npm install`)

> These permissions are transparent in iOS, so it's ok for iOS app.

### Runtime permission for Android 6+

Change *brightness* and *screen mode* need `android.permission.WRITE_SETTINGS` which user can disable it in phone Setting. When you call `setScreenMode()`, `setBrightness()` or `setBrightnessForce()` , it will return false if the app has no permission, and you can call `SystemSetting.grantWriteSettingPremission()` to guide user to app setting page. see [example](https://github.com/c19354837/react-native-system-setting/tree/master/examples/SystemSettingExample)

> If you just want to change app's brightness, you can call `setAppBrightness(val)`, and it doesn't require any permission. see [API](https://github.com/c19354837/react-native-system-setting/blob/master/API.md)

### Powerful API

There are some different APIs that end with `silence`. They can do the job programmatically without direct user consent. To make it work, You need to declare the corresponding permissions in your app's AndroidManifest.xml, see [example AndroidManifest.xml](https://github.com/c19354837/react-native-system-setting/blob/master/examples/SystemSettingExample/android/app/src/main/AndroidManifest.xml)

**`yourProject/android/app/src/main/AndroidManifest.xml`**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.systemsettingexample"
    android:versionCode="1"
    android:versionName="1.0">

    <!-- switchWifiSilence() -->
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE"/>

    <!-- switchBluetoothSilence() -->
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>

    ...

</manifest>
```

> These APIs maybe useful when you develop a system management app. For , you should call `switchWifi()` & `switchBluetooth()` to get a better user experience

## In the end

Feel free to open issue or pull request

## License
[**MIT**](https://github.com/c19354837/react-native-system-setting/blob/master/LICENSE.md)
