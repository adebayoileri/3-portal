export default class Tween{
	constructor(target, channel, endValue, duration, oncomplete, easing="inOutQuad"){
		this.target = target;
		this.channel = channel;
		this.oncomplete = oncomplete;
		this.endValue = endValue;
		this.duration = duration;
		this.currentTime = 0;
		this.finished = false;
		//constructor(start, end, duration, startTime=0, type='linear')
		this.easing = new Easing(target[channel], endValue, duration, 0, easing);
	}

	update(dt){
		if (this.finished) return;
		this.currentTime += dt;
		if (this.currentTime>=this.duration){
			this.target[this.channel] = this.endValue;
			if (this.oncomplete) this.oncomplete();
			this.finished = true;
		}else{
			this.target[this.channel] = this.easing.value(this.currentTime);
		}
	}
}
