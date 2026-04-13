import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ⚠️ MUST be called at module level (top-level) before AppRegistry
import { registerBackgroundHandler } from './src/utils/fcmService';
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
