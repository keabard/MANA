import {cloneDeep, filter} from 'lodash';
import Mana from '../MANA';

//Simple case
const mana = new Mana(
    {key: 'x', score: 1},
    (model) => {
        return model.key.length;
    },
    (model) => {
        return [{key: model.key + 'x'}, {key: model.key + 'y'}];
    },
    (model) => {
      return model.score === 10;
    }
);

console.log('SOLUTION', mana.solution);
