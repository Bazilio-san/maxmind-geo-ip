import * as EventEmitter from 'events';

const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(12);
export default eventEmitter;
