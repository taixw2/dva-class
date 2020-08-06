import { store } from '../../helper/store';
import { CreateOption } from '@dxjs/shared/interfaces/dx-create-option.interface';
import { isDxModel } from '../../dx-model/model';
import { MODEL_NAME, SymbolType } from '@dxjs/shared/symbol';
import { DxModelContstructor } from '@dxjs/shared/interfaces/dx-model.interface';
const invariant = require('invariant');

/**
 * 将 options 中传入的 models 处理
 * @param inst
 * @param options
 */
export function storeModel(inst: symbol, options: CreateOption): void {
  const models = store.getModels(inst);

  /**
   * 将 Modal 的构造类存起来
   * @param Model
   */
  function collectModel(Model: DxModelContstructor, name?: SymbolType): void {
    if (__DEV__) {
      invariant(isDxModel(Model), '%s 不是一个有效的 DxModel, ', Model?.name ?? typeof Model);
    }
    const realName = name || Model.namespace || Model.name;

    Reflect.defineMetadata(MODEL_NAME, realName, Model);
    models.map[Model.name] = Model;
    models.set.add(Model);
  }

  function modelsWithObject(withObject?: { [key: string]: DxModelContstructor }): void {
    if (typeof withObject === 'undefined') return;
    if (__DEV__) {
      invariant(typeof withObject === 'object', 'models 不是一个有效的类型 %s, 请传入数组或对象', typeof withObject);
    }
    Reflect.ownKeys(withObject).forEach(key => collectModel(withObject[String(key)], String(key)));
  }

  if (Array.isArray(options.models)) {
    let ModelConstructor;
    while ((ModelConstructor = options?.models.shift())) {
      if (isDxModel(ModelConstructor)) {
        collectModel(ModelConstructor);
        continue;
      }
      modelsWithObject(ModelConstructor);
    }
  } else {
    modelsWithObject(options.models);
  }
}