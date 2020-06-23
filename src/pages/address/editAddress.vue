<template>
    <div class="edit-address">
        <div class="form-list">
            <div class="info" @click="toSelectAddress">
                <div class="title">收货地址：</div>
                <div class="select-item">
                    <span v-if="!district">点击选择</span>
                    <span class="address-txt" v-else>{{district}}</span>
                    <span class="arrow-right"></span>
                </div>
            </div>
            <div class="info">
                <div class="title">门牌号：</div>
                <input v-model="address" class="input" placeholder="详细地址，例：1号楼203室" />
            </div>
            <div class="info">
                <div class="title">联系人：</div>
                <input v-model="salutation" class="input border-bottom ipt-name" placeholder="请填写收货人的姓名" />
                <div class='gender'>
                    <radio-group class="genderRa" @change="radioChange">
                        <label v-for="(item,index) in sexArray" :key="index">
                        <span class="genderRaSpan">
                            <radio class="icon-sexrd" color="#D14218" :value="item.type" :checked="item.type==sex" />
                        </span>
                        <span>{{item.sexName}}</span>
                        </label>
                    </radio-group>
                </div>
            </div>
            <div class="info">
                <div class="title">手机号：</div>
                <input type="number" v-model="mobile" class="input" placeholder="请填写收货手机号码" />
            </div>
            <div class="info">
                <div class="title">标签：</div>
                <div class="tag-list">
                    <span v-for="item in tagArray" :key="item.type" :class="{active:item.type==tag}" @click="onTag(item)">{{item.tagName}}</span>
                </div>
            </div>
            <div class="info set-dft">
                <div class="title">设置为默认地址：</div>
                <switch class="icon-dft" :checked="status" :value="status" @change="onChangeSwitch" color="#D14218" />
            </div>
        </div>
        <div @click="setAddress" class="save-options" :class="{bottom:isIphoneX}">
            <span class="save-btn">保存地址</span>
        </div>
    </div>
</template>

<script>
    const re = /(?:.*省)?(.*?市)/g;
    import {checkParams} from '@/utils';
    import storage from '@/utils/storage'
    import http from '@/config/api'
    import {
        mapState,
        mapMutations
    } from 'vuex';
export default {
    components: { },
    data () {
        return {
            list: [],
            addressId: '',
            cityName: '',
            position: '',
            district: '',
            salutation: '',
            address: '',
            mobile: '',
            sex: '',
            tag: 0,
            status: false,
            lng: 116.38,
            lat: 39.90,
            currentIndex: 0,
            isEdit: false,
            position: '116.38,39.90',
            sexArray: [{
                sexName: '先生',
                type: 1,
                isOn: true
            }, {
                sexName: '女士',
                type: 2,
                isOn: false
            }],
            tagArray: [{
                tagName: '家',
                type: 1,
                isOn: true
            }, {
                tagName: '公司',
                type: 2,
                isOn: false
            }, {
                tagName: '学校',
                type: 3,
                isOn: false
            }],
        }
    },
    computed: {
        ...mapState(['userId','isIphoneX']),
        cartGoods: function(){
            return storage.get('cartGoods') || []
        }
    },
    methods: {
        radioChange(e){
            this.sex = e.detail.value
        },
        onTag(item){
            this.tag = item.type
        },
        toSelectAddress(){
            let _this = this;
            uni.getSetting({
                success:(res) => {
                if(res.authSetting["scope.userLocation"] === false){
                    uni.openSetting({
                    success(res) {
                        console.log(res.authSetting)
                    }
                    });
                }else{
                    uni.chooseLocation({
                        success:  (res) => {
                            console.log('res', res)
                            _this.setAddressData(res)
                        },
                        fail:function(err){
                            console.log('err', err);
                        }
                    });
                }
                }
            })
        },
        setAddressData(res){
            console.log('res1', res)
            if (res.address && res.address.match(re)&&res.address.match(re)[0]) {
                this.cityName = res.address.match(re)[0];
            }else{
                this.cityName = '上海市' //todo : 如果获取不到城市信息则选择在上海，下期再改成由后端通过经纬度判断
            }
            this.district = res.address
            console.log('this.area', this.district)
            this.position = res.longitude+','+res.latitude
        },

        checkOptions(){
            return true;
        },

        onChangeSwitch(e){
            this.status = e.target.value;
            console.log('switch', e.target.value)
        },

        async setAddress() {
            console.log(this.checkOptions);
            if (!checkParams({
                    salutation: {
                    cond: '$$.length > 0',
                    pro: '请输入您的姓名'
                    },
                    mobile: {
                    reg: /^1\d{10}$/,
                    pro: '请输入正确的手机格式'
                    },
                    district: {
                    cond: '$$.length >0',
                    pro: '请选择地区'
                    },
                    address: {
                    cond: '$$.length >4',
                    pro: '详细地址，至少4个字'
                    }
                }, this)) {
                return false;
            }
            if(!this.salutation){
                this.$store.commit('setWin', {
                    title: '提示信息:',
                    content: '请输入您的姓名'
                });
                return false;
            }
            if(this.address.length<3){
                this.$store.commit('setWin', {
                    title: '提示信息:',
                    content: '详细地址，至少3个字'
                });
                return false;
            }
            if(!this.district){
                this.$store.commit('setWin', {
                    title: '提示信息:',
                    content: '请选择地区'
                });
                return false;
            }
            this.$store.commit('showLoading', true);
            try {
                if (this.district.match(re)&&this.district.match(re)[0]) {
                    this.cityName = this.district.match(re)[0];
                }else{
                    this.cityName = '上海市'//todo : 如果获取不到城市信息则选择在上海，下期再改成由后端通过经纬度判断
                }
                let obj = {
                    userId: this.userId,
                    sex: this.sex?Number(this.sex):1, //性别
                    mobile: this.mobile, //手机号
                    district: this.district, //地区
                    address: this.address, //具体地址
                    //position: this.position, //经纬度
                    salutation: this.salutation, //用户名
                    city: this.cityName,
                    country: '中国',
                    province: this.cityName,
                    tag: this.tag,
                    status: this.status?2:1
                };
                let options = {
                    address: obj
                }
                //console.log('address', JSON.stringify(options));
                let res;
                if (this.isEdit) {
                    res = await http.editAddress(JSON.stringify(options),this.addressId);
                } else {
                    res = await http.addAddress(JSON.stringify(options));
                }

                if(res.success){
                    await this.getAddressList();//重置addressList
                    let option = {
                        sex: this.sex || '1',
                        mobile: this.mobile,
                        address: this.address,
                        salutation: this.salutation, //用户名
                        tag: this.tag,
                        district: this.district,
                        country: this.cityName,
                        province: this.cityName,
                        city: this.cityName,
                        status: this.status,
                        id: storage.get('editAddress') ? storage.get('editAddress').id : ''
                    };
                    let list = storage.get('addressList');
                    if (this.status) {
                        list.forEach(item => {
                            item.status = false;
                        });
                    }
                     if(option.id&&option.id!=''){
                        if (list[this.currentIndex]) {
                            list[this.currentIndex] = option;
                        } else {
                            list.push(option);
                        }
                        storage.set('addressList', list);
                        storage.set('addressItem', option);
                    }else{
                        if(list && list.length>0){
                            storage.set('addressItem', list[list.length-1]);
                        }
                    }
                    if(!this.cartGoods || this.cartGoods.length==0){
                        this.$openPage({
                            name: 'home',
                        })
                    }else{
                        this.$openPage({
                            name: 'placeOrder',
                            query: {
                                backAddress: 1
                            }
                        })
                    }
                    
                }else{
                    this.$store.commit('setWin', {
                        title: '提示信息:',
                        content: '保存失败'
                    });
                    return;
                }

            } catch (e) {
                console.log('error',e);
            }
        },
        async getAddressList(){
            let res = await http.getAddress();
            let list = res.addresses;
            console.log('list', list);
            storage.set('addressList', list);
            // 选择地址
            if (list && list.length>0) {
                let isHasDefault = list.some(item=>{
                    return item.status=='2'
                })
                console.log('isHasDefault',isHasDefault);
                if(!isHasDefault){
                    storage.set('addressItem', list[0]);
                    //this.$store.commit('setAddressItem', list[0]);
                }else{
                    for (let i = 0; i < list.length; i++) {
                        if (list[i].status == '2') {
                            storage.set('addressItem', list[i]);
                            //this.$store.commit('setAddressItem', list[i]);
                        }
                    }
                }
            }
        },
        delAddress(id){
            http.delAddress(JSON.stringify({}), id).then(res=>{
                console.log('delRes', res);
            })
        },
    },
    onLoad(){
        this.currentIndex = this.$parseURL().currentIndex;
        this.isEdit = this.$parseURL().addressId?true:false
        this.addressId = this.$parseURL().addressId
        console.log('addressId',this.$parseURL());
        this.getAddressList();
        if(this.isEdit){
            console.log('isEdit',this.isEdit);
            let address = storage.get('editAddress');
            console.log('address',address);
            this.sex = address.sex.toString();
            this.mobile = address.mobile;
            if(!this.district){
                this.district = address.district;
            }
            this.address = address.address;
            this.salutation = address.salutation;
            this.cityName = address.cityName;
            this.province = address.province;
            this.country = address.country;
            this.tag = address.tag;
            if(address.status && typeof(address.status)==='boolean'){
                address.status = address.status?2:1;
            }
            if(address.status == '2'){
                this.status = true;
            }else if(address.status == '1'){
                this.status = false;
            }
        }
    },
}
</script>
<style lang="less" scoped>
    .edit-address{
        margin: .64rem 0;
        .form-list{
            background:rgba(255,255,255,1);
            padding: 0 .8rem;
            position: relative;
            .info{
                display: flex;
                flex-wrap:wrap;
                min-height: 2.613333rem;
                align-items: center;
                border-bottom: 1px solid #EAEAEA;
                &.set-dft{
                    justify-content:space-between;
                    .icon-dft{
                        transform: scale(0.75,0.75)
                    }
                }
                >div{
                    min-width: 2.69rem;
                    font-size: .8rem;
                    color: #333;
                    line-height:1.28rem;
                }
                >input, >span {
                    box-sizing: border-box;
                    flex:1;
                    font-size: .8rem;
                    font-weight:400;
                    color: #666;
                    line-height:0.74rem;
                    height:1.28rem;
                    min-width: 1rem;
                }
                .ipt-name{
                    height: 2.613333rem;
                    line-height: 2.613333rem;
                }
                .border-bottom{
                    border-bottom: 1px solid #EAEAEA;
                }
                .select-item{
                    display: flex;
                    align-items: center;
                    justify-content:space-between;
                    flex: 1;
                    color: #666;
                    .address-txt{
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                    }
                    .arrow-right{
                        width: .853333rem;
                        height: .853333rem;
                        background: url('../../assets/arrow_right.png') no-repeat center;
                        background-size: .853333rem .853333rem;
                    }
                }
                >span{
                    align-items:center;
                }
                .gender{
                    min-width: 100%!important;
                    padding:0 2.69rem;
                    font-size: .8rem;
                    color:rgba(67,67,67,1);
                    line-height:1.28rem;
                    height: 2.613333rem;
                    line-height: 2.61333rem;
                    .genderRa{
                        display: flex;
                        >label{
                            flex:1;
                        };
                        .icon-sexrd{
                            transform: scale(0.8,0.8)
                        }
                    }
                }
                .tag-list{
                    span {
                        display: inline-block;
                        width: 3.626667rem;
                        height: 1.44rem;
                        line-height: 1.44rem;
                        border-radius: .16rem;
                        border: 1px solid rgba(234,234,234,1);
                        margin-right: .64rem;
                        color: #666;
                        font-size: .8rem;
                        text-align: center;
                        &.active{
                            border:1px solid rgba(210,67,25,1);
                            color: #D24319;
                        }
                    }
                }
            }
        }
        .save-options{
            width: 100%;
            position: fixed;
            bottom: 0;
            background: #fff;
            padding: .64rem .8rem;
            &.bottom{
                padding-bottom: 1.4rem
            }
            .save-btn{
                display: block;
                height: 2.293333rem;
                background:linear-gradient(138deg,rgba(219,50,29,1) 0%,rgba(235,92,50,1) 100%);
                border-radius: .426667rem;
                font-size: .746667rem;
                font-weight: 400;
                color:rgba(255,255,255,1);
                margin: 0 .8rem;
                text-align: center;
                line-height: 2.293333rem;
            }
        }
    }
</style>