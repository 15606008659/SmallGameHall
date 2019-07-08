
const {ccclass, property} = cc._decorator;

@ccclass
export default class Socket extends cc.Component {
    socket:WebSocket = null;
    onLoad () {
        this.socket = new WebSocket("ws://192.168.0.102:8001/ws");
        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }
    onOpen(){
        console.log('socket 连接成功');
        this.socket.send('12312312312312')
    }
    onError(){
        console.log('socket 连接错误');
    }
    onClose(){
        console.log('socket 连接关闭');
    }
}
