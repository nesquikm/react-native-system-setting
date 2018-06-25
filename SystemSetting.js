import { NativeModules, NativeEventEmitter } from 'react-native'

import Utils from './Utils'

const SystemSettingNative = NativeModules.SystemSetting

const SCREEN_BRIGHTNESS_MODE_UNKNOW = -1
const SCREEN_BRIGHTNESS_MODE_MANUAL = 0
const SCREEN_BRIGHTNESS_MODE_AUTOMATIC = 1

const eventEmitter = new NativeEventEmitter(SystemSettingNative)

export default class SystemSetting {
    static saveBrightnessVal = -1
    static saveScreenModeVal = SCREEN_BRIGHTNESS_MODE_AUTOMATIC
    static isAppStore = undefined
    static appStoreWarn = 'You must call SystemSetting.setAppStore(isAppStore:bool) explicitly. Set it true if you are developing a AppStore version, or false'

    static setAppStore(isAppStore) {
        this.isAppStore = isAppStore
    }

    static async getBrightness() {
        return await SystemSettingNative.getBrightness()
    }

    static async setBrightness(val) {
        try {
            await SystemSettingNative.setBrightness(val)
            return true
        } catch (e) {
            return false
        }
    }

    static async setBrightnessForce(val) {
        if (Utils.isAndroid) {
            const success = await SystemSetting.setScreenMode(SCREEN_BRIGHTNESS_MODE_MANUAL)
            if (!success) {
                return false
            }
        }
        return await SystemSetting.setBrightness(val)
    }

    static setAppBrightness(val) {
        if (Utils.isAndroid) {
            SystemSettingNative.setAppBrightness(val)
        } else {
            SystemSetting.setBrightness(val)
        }
        return true
    }

    static async getAppBrightness() {
        if (Utils.isAndroid) {
            return SystemSettingNative.getAppBrightness()
        } else {
            return SystemSetting.getBrightness()
        }
    }

    static grantWriteSettingPremission() {
        if (Utils.isAndroid) {
            SystemSettingNative.openWriteSetting()
        }
    }

    static async getScreenMode() {
        if (Utils.isAndroid) {
            return await SystemSettingNative.getScreenMode()
        }
        return -1 // cannot get iOS screen mode
    }

    static async setScreenMode(val) {
        if (Utils.isAndroid) {
            try {
                await SystemSettingNative.setScreenMode(val)
            } catch (e) {
                return false
            }
        }
        return true
    }

    static async saveBrightness() {
        SystemSetting.saveBrightnessVal = await SystemSetting.getBrightness()
        SystemSetting.saveScreenModeVal = await SystemSetting.getScreenMode()
    }

    static restoreBrightness() {
        if (SystemSetting.saveBrightnessVal == -1) {
            console.warn('you should call saveBrightness() at least once')
        } else {
            SystemSetting.setBrightness(SystemSetting.saveBrightnessVal)
            SystemSetting.setScreenMode(SystemSetting.saveScreenModeVal)
        }
        return SystemSetting.saveBrightnessVal
    }

    static async getVolume(type = 'music') {
        return await SystemSettingNative.getVolume(type)
    }

    static addVolumeListener(callback) {
        return eventEmitter.addListener('EventVolume', callback)
    }

    static removeVolumeListener(listener) {
        listener && listener.remove()
    }

    static async isWifiEnabled() {
        const result = await SystemSettingNative.isWifiEnabled()
        return (result) > 0
    }

    static switchWifiSilence(complete) {
        if (Utils.isAndroid) {
            SystemSetting.listenEvent(complete)
            SystemSettingNative.switchWifiSilence()
        } else {
            SystemSetting.switchWifi(complete)
        }
    }

    static switchWifi(complete) {
        if (this._switchingCheck()) {
            complete();
            return;
        }
        SystemSetting.listenEvent(complete)
        SystemSettingNative.switchWifi()
    }

    static async isLocationEnabled() {
        return await SystemSettingNative.isLocationEnabled()
    }

    static async getLocationMode() {
        if(Utils.isAndroid){
            return await SystemSettingNative.getLocationMode()
        }else{
            return await SystemSetting.isLocationEnabled() ? 1 : 0
        }
    }

    static switchLocation(complete) {
        if (this._switchingCheck()) {
            complete();
            return;
        }
        SystemSetting.listenEvent(complete)
        SystemSettingNative.switchLocation()
    }

    static async isBluetoothEnabled() {
        return await SystemSettingNative.isBluetoothEnabled()
    }

    static switchBluetooth(complete) {
        if (this._switchingCheck()) {
            complete();
            return;
        }
        SystemSetting.listenEvent(complete)
        SystemSettingNative.switchBluetooth()
    }

    static switchBluetoothSilence(complete) {
        if (Utils.isAndroid) {
            SystemSetting.listenEvent(complete)
            SystemSettingNative.switchBluetoothSilence()
        } else {
            SystemSettingNative.switchBluetooth(complete)
        }
    }

    static async isAirplaneEnabled() {
        return await SystemSettingNative.isAirplaneEnabled()
    }

    static switchAirplane(complete) {
        if (this._switchingCheck()) {
            complete();
            return;
        }
        SystemSetting.listenEvent(complete)
        SystemSettingNative.switchAirplane()
    }

    static _switchingCheck() {
        if (Utils.isIOS) {
            if (this.isAppStore === undefined) {
                console.warn(this.appStoreWarn)
            } else if (this.isAppStore === true) {
                return true;
            }
        }
        return false;
    }

    static async addBluetoothListener(callback) {
        return await SystemSetting._addListener(false, 'bluetooth', 'EventBluetoothChange', callback)
    }

    static async addWifiListener(callback) {
        return await SystemSetting._addListener(true, 'wifi', 'EventWifiChange', callback)
    }

    static async addLocationListener(callback) {
        return await SystemSetting._addListener(true, 'location', 'EventLocationChange', callback)
    }

    static async addAirplaneListener(callback) {
        return await SystemSetting._addListener(true, 'airplane', 'EventAirplaneChange', callback)
    }

    static async _addListener(androidOnly, type, eventName, callback) {
        if (!androidOnly || Utils.isAndroid) {
            const result = await SystemSetting._activeListener(type)
            if (result) {
                return eventEmitter.addListener(eventName, callback)
            }
        }
        return null
    }

    static async _activeListener(name) {
        try {
            await SystemSettingNative.activeListener(name)
        } catch (e) {
            console.warn(e.message)
            return false;
        }
        return true;
    }

    static removeListener(listener) {
        listener && listener.remove()
    }

    static listenEvent(complete) {
        const listener = eventEmitter.addListener('EventEnterForeground', () => {
            listener.remove()
            complete()
        })
    }
}
