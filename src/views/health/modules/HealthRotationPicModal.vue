<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
    okText="保存"
    cancelText="关闭">
    
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="上传图片">
        	<a-upload v-decorator="[
        			'picList',
        			{
        				rules: [{ required: true, message: '请上传图片' }],
        				valuePropName: 'fileList',
        				getValueFromEvent: normFile,
        			},
        		]"
        	  action="/jeecg-boot/sys/file/upload" list-type="picture"
            :multiple="true">
        		<a-button>
        			<a-icon type="upload" /> 选择文件</a-button>
        	</a-upload>
          <div>“支持*.jpg;*.png格式图片；图片不大于10MB”</div>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="状态">
          <a-select v-decorator="['state', { rules: [{ required: true, message: '请选择状态' }] }]">
          	<a-select-option value="1">启用</a-select-option>
            <a-select-option value="2">禁用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :labelCol="labelCol"
          :wrapperCol="wrapperCol"
          label="排序">
          <a-input placeholder="请输入排序" v-decorator="['sort', { rules: [{ required: true, message: '请输入排序' }] }]" />
        </a-form-item>
		
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
  import { httpAction } from '@/api/manage'
  import pick from 'lodash.pick'
  import moment from "moment"
  import locale from 'ant-design-vue/lib/locale-provider/zh_CN';
  import 'moment/locale/zh-cn';
  moment.locale('zh-cn');

  export default {
    name: "HealthRotationPicModal",
    data () {
      return {
        title:"操作",
        visible: false,
        model: {},
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },

        confirmLoading: false,
        form: this.$form.createForm(this),
        validatorRules:{
        },
        url: {
          add: "/health/healthRotationPic/add",
          edit: "/health/healthRotationPic/edit",
        },
      }
    },
    created () {
    },
    methods: {
      normFile(e) {
        const isJPG = e.file.type === 'image/jpeg';
        const isPNG = e.file.type === 'image/png';
        const isPic = isJPG || isPNG || isBMP || isGIF || isWEBP;
        if (!isPic) {
          this.$message.warning('只能上传图片');
          return e.fileList.filter((fileItem)=> e.file.uid !== fileItem.uid);
        } else {
          if (Array.isArray(e)) {
            return e;
          }
          return e && e.fileList;
        }
      },
      add () {
        this.edit({});
      },
      edit (record) {
        this.form.resetFields();
        this.model = Object.assign({}, record);
        this.visible = true;
        this.$nextTick(() => {
          this.form.setFieldsValue(pick(this.model,'fileId','state','sort'))
					//图片处理
					let picList = []
					if(this.model.picList){
					  let picObj = this.model.picList
					  for(let i = 0;i < picObj.length;i++){
					    // let file = {}
					    picObj[i].uid = picObj[i].fileId
					    picObj[i].thumbUrl = picObj[i].filePath
					    picObj[i].url = picObj[i].filePath
					    picObj[i].type = picObj[i].fileType
					    picObj[i].name = picObj[i].fileName
					    picObj[i].status = "done"
					    picList.push(picObj[i])
					  }
					}
					this.form.setFieldsValue({picList:picList})
        });
      },
      close () {
        this.$emit('close');
        this.visible = false;
      },
      handleOk () {
        const that = this;
        // 触发表单验证
        this.form.validateFields((err, values) => {
          if (!err) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if(!this.model.id){
              httpurl+=this.url.add;
              method = 'post';
            }else{
              httpurl+=this.url.edit;
               method = 'put';
            }
            let formData = Object.assign(this.model, values); //时间格式化
            
            var attach = values.picList;
            if (attach) {
            	for (var i = 0; i < attach.length; i++) {
            		if (attach[i].status != 'done'||attach[i].oneFrame == '1') {
            			attach.splice(i, 1)
            		} else {
            			attach[i].fileName = attach[i].name;
            			attach[i].filePath = attach[i].filePath?attach[i].filePath:attach[i].response.message;
            			attach[i].fileType = attach[i].type;
            		}
            	}
            	formData.picList = attach
            }else{
              formData.picList = []
            }
            //console.log(formData)
            httpAction(httpurl,formData,method).then((res)=>{
              if(res.success){
                that.$message.success(res.message);
                that.$emit('ok');
              }else{
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
              that.close();
            })



          }
        })
      },
      handleCancel () {
        this.close()
      },


    }
  }
</script>

<style lang="less" scoped>

</style>