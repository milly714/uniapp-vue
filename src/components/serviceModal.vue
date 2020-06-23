<<template>
    <div class="service-modal">
        <div class="modal-box">
            <p>{{preTitle}}<br/>{{nextTitle}}~</p>
            <button class="btn-reply" open-type="contact">去回复</button>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'service-modal',
        data(){
            return {}
        },
        props: {
            preTitle: {
                type: String,
                default: '回复‘1’添加小二'
            },
            nextTitle: {
                type: String,
                default: '更多福利优惠等你哟～'
            }
        }
    }
</script>

<style lang="less" scoped>
    .service-modal{
        .modal-box{
            display: block;
            position: fixed;
            top: 50%;
            width: 80%;
            left: 50%;
            margin-left: -40%;
            background-color: #fff;
            border-radius: .64rem;
            border: 1px solid #ebeef5;
            box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
            text-align: left;
            overflow: hidden;
            backface-visibility: hidden;
            transform: translateY(-50%);
            z-index: 1001;
            p{
                text-align: center;
                padding: 20px 0;
                color: #353535;
                line-height: 6.3vw;
                font-size: .8rem;
            }
            .btn-reply{
                background: #fff;
                border: none;
                color: #D24319;
                font-size: .8rem;
                border-top: 1px solid #E5E5E5;
                border-radius: 0;
                height: 2.666667rem;
                line-height: 2.666667rem;
                &:after{
                    border: none;
                }
            }
        }
    }
</style>