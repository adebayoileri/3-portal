export default class Easing{
	// t: current time, b: begInnIng value, c: change In value, d: duration
	constructor(start, end, duration, startTime=0, type='linear'){
		this.b = start;
		this.c = end - start;
		this.d = duration;
		this.type = type;
		this.startTime = startTime;
	}

	value(time){
		this.t = time - this.startTime;
		return this[this.type]();
	}

	linear(){
		return this.c*(this.t/this.d) + this.b;
	}

	inQuad() {
		return this.c*(this.t/=this.d)*this.t + this.b;
	}

	outQuad() {
		return -this.c*(this.t/=this.d)*(this.t-2) + this.b;
	}

	inOutQuad() {
		if ((this.t/=this.d/2) < 1) return this.c/2*this.t*this.t + this.b;
		return -this.c/2 * ((--this.t)*(this.t-2) - 1) + this.b;
	}

	projectile(){
		let c = this.c;
		let b = this.b;
		let t = this.t;
		this.t *= 2;
		let result;
		let func;
		if (this.t<this.d){
			result = this.outQuad();
			func = "outQuad";
		}else{
			this.t -= this.d;
			this.b += c;
			this.c = -c;
			result = this.inQuad();
			func = "inQuad";
		}
		console.log("projectile: " + result.toFixed(2) + " time:" + this.t.toFixed(2) + " func:" + func);
		this.b = b;
		this.c = c;
		this.t = t;
		return result;
	}

	inCubic() {
		return this.c*(this.t/=this.d)*this.t*this.t + this.b;
	}

	outCubic() {
		return this.c*((this.t=this.t/this.d-1)*this.t*this.t + 1) + this.b;
	}

	inOutCubic() {
		if ((this.t/=this.d/2) < 1) return this.c/2*this.t*this.t*this.t + this.b;
		return this.c/2*((this.t-=2)*this.t*this.t + 2) + this.b;
	}

	inQuart() {
		return this.c*(this.t/=this.d)*this.t*this.t*this.t + this.b;
	}

	outQuart() {
		return -this.c * ((this.t=this.t/this.d-1)*this.t*this.t*this.t - 1) + this.b;
	}

	inOutQuart() {
		if ((this.t/=this.d/2) < 1) return this.c/2*this.t*this.t*this.t*this.t + this.b;
		return -this.c/2 * ((this.t-=2)*this.t*this.t*this.t - 2) + this.b;
	}

	inQuint() {
		return this.c*(this.t/=this.d)*this.t*this.t*this.t*this.t + this.b;
	}

	outQuint() {
		return this.c*((this.t=this.t/this.d-1)*this.t*this.t*this.t*this.t + 1) + this.b;
	}

	inOutQuint() {
		if ((this.t/=this.d/2) < 1) return this.c/2*this.t*this.t*this.t*this.t*this.t + this.b;
		return this.c/2*((this.t-=2)*this.t*this.t*this.t*this.t + 2) + this.b;
	}

	inSine() {
		return -this.c * Math.cos(this.t/this.d * (Math.PI/2)) + this.c + this.b;
	}

	outSine() {
		return this.c * Math.sin(this.t/this.d * (Math.PI/2)) + this.b;
	}

	inOutSine() {
		return -this.c/2 * (Math.cos(Math.PI*this.t/this.d) - 1) + this.b;
	}

	inExpo() {
		return (this.t==0) ? this.b : this.c * Math.pow(2, 10 * (this.t/this.d - 1)) + this.b;
	}

	outExpo() {
		return (this.t==this.d) ? this.b+this.c : this.c * (-Math.pow(2, -10 * this.t/this.d) + 1) + this.b;
	}

	inOutExpo() {
		if (this.t==0) return this.b;
		if (this.t==this.d) return this.b+this.c;
		if ((this.t/=this.d/2) < 1) return this.c/2 * Math.pow(2, 10 * (this.t - 1)) + this.b;
		return this.c/2 * (-Math.pow(2, -10 * --this.t) + 2) + this.b;
	}

	inCirc() {
		return -this.c * (Math.sqrt(1 - (this.t/=this.d)*this.t) - 1) + this.b;
	}

	outCirc() {
		return this.c * Math.sqrt(1 - (this.t=this.t/this.d-1)*this.t) + this.b;
	}

	inOutCirc() {
		if ((this.t/=this.d/2) < 1) return -this.c/2 * (Math.sqrt(1 - this.t*this.t) - 1) + this.b;
		return this.c/2 * (Math.sqrt(1 - (this.t-=2)*this.t) + 1) + this.b;
	}

	inElastic() {
		let s=1.70158, p=0, a=this.c;
		if (this.t==0) return this.b;  if ((this.t/=this.d)==1) return this.b+this.c;  if (!p) p=this.d*.3;
		if (a < Math.abs(this.c)) { a=this.c; let s=p/4; }
		else{ let s = p/(2*Math.PI) * Math.asin (this.c/a) };
		return -(a*Math.pow(2,10*(this.t-=1)) * Math.sin( (this.t*this.d-s)*(2*Math.PI)/p )) + this.b;
	}

	outElastic() {
		let s=1.70158, p=0, a=this.c;
		if (this.t==0) return this.b;  if ((this.t/=this.d)==1) return this.b+this.c;  if (!p) p=this.d*.3;
		if (a < Math.abs(this.c)) { a=this.c; let s=p/4; }
		else{ let s = p/(2*Math.PI) * Math.asin (this.c/a) };
		return a*Math.pow(2,-10*this.t) * Math.sin( (this.t*this.d-s)*(2*Math.PI)/p ) + this.c + this.b;
	}

	inOutElastic() {
		let s=1.70158, p=0, a=this.c;
		if (this.t==0) return this.b;  if ((this.t/=this.d/2)==2) return this.b+this.c;  if (!p) p=this.d*(.3*1.5);
		if (a < Math.abs(this.c)) { a=this.c; let s=p/4; }
		else{ let s = p/(2*Math.PI) * Math.asin (this.c/a) };
		if (this.t < 1) return -.5*(a*Math.pow(2,10*(this.t-=1)) * Math.sin( (this.t*this.d-s)*(2*Math.PI)/p )) + this.b;
		return a*Math.pow(2,-10*(this.t-=1)) * Math.sin( (this.t*this.d-s)*(2*Math.PI)/p )*.5 + this.c + this.b;
	}

	inBack() {
		let s = 1.70158;
		return this.c*(this.t/=this.d)*this.t*((s+1)*this.t - s) + this.b;
	}

	outBack() {
		let s = 1.70158;
		return this.c*((this.t=this.t/this.d-1)*this.t*((s+1)*this.t + s) + 1) + this.b;
	}

	inOutBack() {
		let s = 1.70158;
		if ((this.t/=this.d/2) < 1) return this.c/2*(this.t*this.t*(((s*=(1.525))+1)*this.t - s)) + this.b;
		return this.c/2*((this.t-=2)*this.t*(((s*=(1.525))+1)*this.t + s) + 2) + this.b;
	}

	inBounce(t=this.t, b=this.b) {
		return this.c - this.outBounce (this.d-t, 0) + b;
	}

	outBounce(t=this.t, b=this.b) {
		if ((t/=this.d) < (1/2.75)) {
			return this.c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return this.c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return this.c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return this.c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	}

	inOutBounce() {
		if (this.t < this.d/2) return this.inBounce (this.t*2, 0) * .5 + this.b;
		return this.outBounce (this.t*2-this.d, 0) * .5 + this.c*.5 + this.b;
	}
}
