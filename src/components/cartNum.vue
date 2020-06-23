<template>
    <div class="cart-num-box">
        <div class="sub-num"  :class="{'disabled':disabled && numVal==0}" @click.stop="onChange('subtract')">-</div>
        <input class="ipt-num" type="number" :disabled="disabled" v-model="numVal" @blur="onBlur" />
        <div class="add-num" :class="{'disabled':disabled}" @click.stop="onChange('add')">+</div>
    </div>
</template>
<script>
    export default {
        name: 'cart-num',
        props: {
            value: {
                type: Number,
                default: 1,
            },
            min: {
                type: Number,
				default: 0
            },
            max: {
                type: Number,
				default: 9999
            },
            step: {
                type: Number,
				default: 1
            },
            disabled: {
                type: Boolean,
                default: false
			},
			obj:{
				type: Object,
                default: {}
			}
        },
        data(){
            return {
                numVal: this.value
            }
        },
        computed: {
			disableSubtract() {
				return this.numVal <= this.min
			},
			disableAdd() {
				return this.numVal >= this.max
			}
        },
        watch: {
			value(val) {
				this.numVal = val;
			},
			numVal(val) {
				this.$emit('change', val);
			}
        },
        methods: {
            onChange(type) {
				if (type === 'add'){
					if (this.disabled) {
						return
					}
				}else{
					if (this.disabled && this.numVal==0) {
						return
					}
				}
				
				let value = this.numVal
				let step = this.step;
				if (type === 'subtract') {
					value -= step
				} else if (type === 'add') {
					value += step
				}
				if (value < this.min) {
					return
				}
				let isMin = false
				if(value == this.min){
					isMin = true
				}else{
					if(value > this.max){
						if(this.max==0){
							isMin = true
						}else{
							this.$store.commit('setWin', {
								content: `商品库存不足了啦！减少数量或者选择其他商品`,
								type:"alert",
								confirmText: '我知道了',
								confirmColor:'#D24319',
								callBack:(val) => { this.$closeWindow(); }
							});
							this.numVal = this.max;
						}
					}else{
						this.numVal = value;
					}
				}
				let option = {
					num: this.numVal,
					type: type,
					item: this.obj,
					isMin: isMin
				}
				this.$emit('on-change', option)
            },
            onBlur(e) {
				let value = e.detail.value

				if (!value) {
					this.numVal = 1
					return
				}
				value = +value;
				if (value > this.max) {
					this.$store.commit('setWin', {
						content: `商品库存不足了啦！减少数量或者选择其他商品`,
						type:"alert",
						confirmText: '我知道了',
						confirmColor:'#D24319',
						callBack:(val) => { this.$closeWindow(); }
					});
					if(this.max==0){
						return;
					}
					value = this.max
				} else if (value <= this.min) {
					this.$store.commit('setWin', {
						content: `商品数量已经不能再减了!`,
						type:"alert",
						confirmText: '我知道了',
						confirmColor:'#D24319',
						callBack:(val) => { this.$closeWindow(); }
					});
					value = 1
				}
				this.numVal = value
				let option = {
					num: this.numVal,
					item: this.obj
				}
				this.$emit('on-change', option)
			}
        }
    }
</script>
<style lang="less" scoped>
    .cart-num-box{
        display: inline-flex;
		flex-direction: row;
		justify-content: flex-start;
		height: 1.386667rem;
		position: relative;
        &:after {
			content: '';
			position: absolute;
			transform-origin: center;
			box-sizing: border-box;
			pointer-events: none;
			border-radius: .106667rem;
			transform: scale(.5);
		}
        .sub-num,.add-num {
			margin: 0;
			width: 1.6rem;
			font-size: 3.733vw;
			height: 100%;
			text-align: center;
			color: #333;
			position: relative;
			vertical-align: middle;
			&.disabled{
				color: #f5f5f5;
			}
		}

		.ipt-num {
			position: relative;
			background-color: #fff;
			width: 2.133333rem;
			text-align: center;
			min-height: .906667rem;
			font-size: 3.2vw;
			background:rgba(242,242,242,1);
			border-radius: .08rem;
			overflow: initial;
		}

		.disabled {
			color: #cfcfcf;
		}
    }
</style>