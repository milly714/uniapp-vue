<<template>
    <div v-if="item.node == 'element'">
        <!--button-->
        <div v-if="item.tag == 'button'">
            <button type="default" size="mini">
                <div v-for="(obj,index) in item.nodes" :key="index">
                    <customParse :item="obj" :notes="notes"></customParse>
                </div>
            </button>
        </div>
        <!--li类型-->
        <div v-else-if="item.tag == 'li'">
        <div :class="[item.classStr, 'wxParse-li']" :style="item.styleStr">
            <div :class="[item.classStr, 'wxParse-li-inner']">
            <div :class="[item.classStr,'wxParse-li-text']">
                <div :class="[item.classStr,'wxParse-li-circle']"></div>
            </div>
            <div :class="[item.classStr,'wxParse-li-text']">
                <div v-for="(obj,index) in item.nodes" :key="index">
                    <customParse :item="obj" :notes="notes"></customParse>
                </div>
            </div>
            </div>
        </div>
        </div>
        <!--video类型-->
        <div v-if="item.tag == 'video'">
            <view :class="[item.classStr,'wxParse-video']" :style="item.styleStr">
                <video :class="[item.classStr,'wxParse-video-video']" :src="item.attr.src"></video>
            </view>
        </div>

        <!--img类型-->
        <div v-else-if="item.tag == 'img'">
            <img :class="[item.classStr,'wxParse-img']" :src="item.attr.src" :data-idx="item.imgIndex" mode="aspectFit" style="width:100%;display:block"/>
        </div>

        <div v-else-if="item.tag == 'p'">
            <div>
                <div v-for="(obj,index) in item.nodes" :key="index">
                    <customParse :item="obj" :notes="notes"></customParse>
                </div>
            </div>
        </div>

        <div v-else-if="item.tag == 'br'">
            <span>\n</span>
        </div>

        <!--其他块级标签-->
        <div v-else-if="item.tagType == 'block'">
            <div :class="item.classStr" :style="item.styleStr">
                <div v-for="(obj,index) in item.nodes" :key="index">
                    <customParse :item="obj" :notes="notes"></customParse>
                </div>
            </div>
        </div>

        <!--内联标签-->
        <div v-else :class="item.classStr" :style="item.styleStr">
            <div v-for="(obj,index) in item.nodes" :key="index">
                <customParse :item="obj" :notes="notes"></customParse>
            </div>
        </div>
    </div>
    <!--判断是否是文本节点-->
    <div v-else-if="item.node == 'text'">
        <div class="WxEmojiView wxParse-inline" :style="item.styleStr">
            <div v-for="(obj,index) in item.textArray" :key="index">
                <div :class="obj.text == '\\n' ? 'wxParse-hide':'wxParse-txt'" v-if="obj.node == 'text'">{{obj.text}}</div>
                <div v-else-if="obj.node == 'element'">
                    <img class="wxEmoji" :src="[obj.baseSrc,obj.text]" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import showdown from './showdown.js';
    import HtmlToJson from './html2json.js';
    import customParse from '@/components/wxParse/index';
    export default {
        data(){
            return {
                bindData: {},
                realWindowWidth: 0,
                realWindowHeight: 0,
                data:{},
            }
        },
        components: {
            customParse
        },
        props: {
            item: {
                type: Object,
                default: {}
            }
        },
        onLaunch(){
            let _this = this;
            wx.getSystemInfo({
                success: function (res) {
                    _this.realWindowWidth = res.windowWidth
                    _this.realWindowHeight = res.windowHeight
                }
            })
        },
        onShow(){
            console.log('this.item',this.item);
        },
        methods: {},
    }
</script>

<style lang="less" scoped>
.wxParse{
    margin: 0 0.667vw;
    font-family: Helvetica,sans-serif;
    font-size: 3.733vw;
    color: #666;
    line-height: 1.8;
}
div{
    word-break:break-all; overflow:auto;
}
.wxParse-inline{
    display: inline;
    margin: 0;
    padding: 0;
}
/*//标题 */
.wxParse-div{margin: 0;padding: 0;}
.wxParse-h1{ font-size:2em; margin: .67em 0 }
.wxParse-h2{ font-size:1.5em; margin: .75em 0 }
.wxParse-h3{ font-size:1.17em; margin: .83em 0 }
.wxParse-h4{ margin: 1.12em 0}
.wxParse-h5 { font-size:.83em; margin: 1.5em 0 }
.wxParse-h6{ font-size:.75em; margin: 1.67em 0 }

.wxParse-h1 {
  font-size: 2.4vw;
  font-weight: 400;
  margin-bottom: .9em;
}
.wxParse-h2 {
  font-size: 2.133vw;
  font-weight: 400;
  margin-bottom: .34em;
}
.wxParse-h3 {
  font-weight: 400;
  font-size: 2vw;
  margin-bottom: .34em;
}
.wxParse-h4 {
  font-weight: 400;
  font-size: 1.867vw;
  margin-bottom: .24em;
}
.wxParse-h5 {
  font-weight: 400;
  font-size: 1.733vw;
  margin-bottom: .14em;
}
.wxParse-h6 {
  font-weight: 400;
  font-size: 1.6vw;
  margin-bottom: .04em;
}

.wxParse-h1, .wxParse-h2, .wxParse-h3, .wxParse-h4, .wxParse-h5, .wxParse-h6, .wxParse-b, .wxParse-strong  { font-weight: bolder }

.wxParse-i,.wxParse-cite,.wxParse-em,.wxParse-var,.wxParse-address{font-style:italic}
.wxParse-pre,.wxParse-tt,.wxParse-code,.wxParse-kbd,.wxParse-samp{font-family:monospace}
.wxParse-pre{white-space:pre}
.wxParse-big{font-size:1.17em}
.wxParse-small,.wxParse-sub,.wxParse-sup{font-size:.83em}
.wxParse-sub{vertical-align:sub}
.wxParse-sup{vertical-align:super}
.wxParse-s,.wxParse-strike,.wxParse-del{text-decoration:line-through}
/*wxparse-自定义个性化的css样式*/
/*增加video的css样式*/
.wxParse-strong,.wxParse-s{display: inline}
.wxParse-a{
    color: deepskyblue;
    word-break:break-all;
    overflow:auto;
}

.wxParse-video{
    text-align: center;
    margin: 1.333vw 0;
}

.wxParse-video-video{
    width:100%;
}

.wxParse-img{
    /*background-color: #efefef;*/
    overflow: hidden;
}

.wxParse-divquote {
    margin: 0;
    padding:1.333vw 0 1.333vw 0.667vw;
    font-family:Courier, Calibri,"宋体";
    background:#f5f5f5;
    border-left: 0.4vw solid #dbdbdb;
}

.wxParse-code,.wxParse-wxxxcode-style{
    display: inline;
    background:#f5f5f5;
}
.wxParse-ul{
    margin: 2.667vw 1.333vw;
}

.wxParse-li,.wxParse-li-inner{
    display: flex;
    align-items: baseline;
    margin: 1.333vw 0;
}
.wxParse-li-text{
    align-items: center;
    line-height: 2.667vw;
}

.wxParse-li-circle{
    display: inline-flex;
    width: 0.667vw;
    height: 0.667vw;
    background-color: #333;
    margin-right: 0.667vw;
}

.wxParse-li-square{
    display: inline-flex;
    width: 1.333vw;
    height: 1.333vw;
    background-color: #333;
    margin-right: 0.667vw;
}
.wxParse-li-ring{
    display: inline-flex;
    width: 1.333vw;
    height: 1.333vw;
    border: 0.267vw solid #333;
    border-radius: 50%;
    background-color: #fff;
    margin-right: 0.667vw;
}

.wxParse-u {
  text-decoration: underline;
}
.wxParse-hide{
    display: none;
}
.wxParse-txt{
    color: #666;
    font-size: 3.467vw;
    line-height: 1.4em;
}
.WxEmojiView{
    align-items: center;
}
.wxEmoji{
    width: 2.133vw;
    height: 2.133vw;
}
.wxParse-tr{
	display: flex;
	border-right:1px solid #e0e0e0;
	border-bottom:1px solid #e0e0e0;
	border-top:1px solid #e0e0e0;
}
.wxParse-th,
.wxParse-td{
	flex:1;
	padding:0.667vw;
	font-size:3.733vw;
	border-left:1px solid #e0e0e0;
	word-break: break-all;
}
.wxParse-td:last{
	border-top:1px solid #e0e0e0;
}
.wxParse-th{
	background:#f0f0f0;
	border-top:1px solid #e0e0e0;
}
.wxParse-del{
    display: inline;
}
.wxParse-figure {
  overflow: hidden;
}


</style>