<template>
  <a-card :bordered="false">

    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">

          <a-col :md="6" :sm="12">
            <a-form-item label="账号">
              <!--<a-input placeholder="请输入账号查询" v-model="queryParam.username"></a-input>-->
              <j-input placeholder="输入账号模糊查询" v-model="queryParam.username"></j-input>
            </a-form-item>
          </a-col>
          
          <a-col :md="6" :sm="8">
            <a-form-item label="审核状态">
              <a-select v-model="queryParam.status" placeholder="请选择">
                <a-select-option value="">请选择</a-select-option>
                <a-select-option value="1">审核通过</a-select-option>
                <a-select-option value="2">待审核</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <template v-if="toggleSearchStatus">
            <a-col :md="6" :sm="8">
              <a-form-item label="真实名字">
                <a-input placeholder="请输入真实名字" v-model="queryParam.workNo"></a-input>
              </a-form-item>
            </a-col>

            <a-col :md="6" :sm="8">
              <a-form-item label="手机号码">
                <a-input placeholder="请输入手机号码查询" v-model="queryParam.phone"></a-input>
              </a-form-item>
            </a-col>

            
          </template>

          <a-col :md="6" :sm="8">
            <span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
              <a-button type="primary" @click="searchQuery" icon="search">查询</a-button>
              <a-button type="primary" @click="searchReset" icon="reload" style="margin-left: 8px">重置</a-button>
              <a @click="handleToggleSearch" style="margin-left: 8px">
                {{ toggleSearchStatus ? '收起' : '展开' }}
                <a-icon :type="toggleSearchStatus ? 'up' : 'down'"/>
              </a>
            </span>
          </a-col>

        </a-row>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="table-operator" style="border-top: 5px">
      <!-- <a-button @click="handleAdd" type="primary" icon="plus">添加用户</a-button> -->
      <!-- <a-button @click="handleSyncUser"  v-has="'user:syncbpm'" type="primary" icon="plus">同步流程</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('用户信息')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="hdd" @click="recycleBinVisible=true">回收站</a-button> -->
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay" @click="handleMenuClick">
          <a-menu-item key="1">
            <a-icon type="delete"/>
            删除
          </a-menu-item>
          <a-menu-item key="2">
            设置为普通会员
          </a-menu-item>
          <a-menu-item key="3">
            设置为副会长单位
          </a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px">
          批量操作
          <a-icon type="down"/>
        </a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i>已选择&nbsp;<a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项&nbsp;&nbsp;
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        bordered
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        @change="handleTableChange">
        
        <template slot="userType" slot-scope="text, record, index">
          {{record.userType==0?'个人':record.userType==1?'企业':''}}
        </template>
        
        <template slot="status" slot-scope="text, record, index">
          {{record.status==3?'待审核':record.status==1&&record.status2!=1?'一级审核通过':record.status2==1?'审核通过':'审核不通过'}}
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical"/>

          <a-dropdown>
            <a class="ant-dropdown-link">
              更多 <a-icon type="down"/>
            </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="handleDetail(record)">详情</a>
              </a-menu-item>

              <a-menu-item>
                <a href="javascript:;" @click="handleChangePassword(record.username)">密码</a>
              </a-menu-item>

              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
              <!-- 一级审核status  1审核通过，2审核不通过，3待审核 -->
              <a-menu-item v-if="record.status!=1">
                <a-popconfirm title="确定一级审核通过吗?" @confirm="() => handleFrozen(record.id,1,record.username)">
                  <a v-has="'btn:first'">一级审核</a>
                </a-popconfirm>
              </a-menu-item>
              <!-- 二级审核status2  1审核通过，2审核不通过，3待审核 -->
              <a-menu-item v-if="record.status==1&&record.status2!=1">
                <a-popconfirm title="确定二级审核通过吗?" @confirm="() => handleFrozen2(record.id,1,record.username)">
                  <a v-has="'btn:second'">二级审核</a>
                </a-popconfirm>
              </a-menu-item>
              <!-- <a-menu-item>
                <a href="javascript:;" @click="handleAgentSettings(record.username)">代理人</a>
              </a-menu-item> -->

            </a-menu>
          </a-dropdown>
        </span>


      </a-table>
    </div>
    <!-- table区域-end -->

    <user-modal ref="modalForm" @ok="modalFormOk"></user-modal>

    <password-modal ref="passwordmodal" @ok="passwordModalOk"></password-modal>

    <sys-user-agent-modal ref="sysUserAgentModal"></sys-user-agent-modal>

    <!-- 用户回收站 -->
    <user-recycle-bin-modal :visible.sync="recycleBinVisible" @ok="modalFormOk"/>

  </a-card>
</template>

<script>
  import UserModal from './modules/UserModal'
  import PasswordModal from './modules/PasswordModal'
  import {putAction,getFileAccessHttpUrl,getAction} from '@/api/manage';
  import {frozenBatch} from '@/api/api'
  import {JeecgListMixin} from '@/mixins/JeecgListMixin'
  import SysUserAgentModal from "./modules/SysUserAgentModal";
  import JInput from '@/components/jeecg/JInput'
  import UserRecycleBinModal from './modules/UserRecycleBinModal'

  export default {
    name: "UserList",
    mixins: [JeecgListMixin],
    components: {
      SysUserAgentModal,
      UserModal,
      PasswordModal,
      JInput,
      UserRecycleBinModal
    },
    data() {
      return {
        description: '这是用户管理页面',
        queryParam: {},
        recycleBinVisible: false,
        columns: [
          /*{
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },*/
          {
            title: '用户账号',
            align: "center",
            dataIndex: 'username',
            width: 120
          },
          {
            title: '用户姓名',
            align: "center",
            width: 100,
            dataIndex: 'workNo',
          },   
          {
            title: '类型',
            align: "center",
            width: 100,
            scopedSlots: {customRender: 'userType'},
            dataIndex: 'userType'
          },
          {
            title: '手机号码',
            align: "center",
            width: 100,
            dataIndex: 'phone'
          },
          {
            title: '审核状态',
            align: "center",
            width: 80,
            scopedSlots: {customRender: 'status'},
            dataIndex: 'status'
          },
          {
            title: '操作',
            dataIndex: 'action',
            scopedSlots: {customRender: 'action'},
            align: "center",
            width: 170
          }

        ],
        url: {
          imgerver: window._CONFIG['staticDomainURL'],
          syncUser: "/process/extActProcess/doSyncUser",
          list: "/sys/user/list",
          delete: "/sys/user/delete",
          deleteBatch: "/sys/user/deleteBatch",
          exportXlsUrl: "/sys/user/exportXls",
          importExcelUrl: "sys/user/importExcel",
        },
      }
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      }
    },
    methods: {
      checkRole(type){
        let typeName = type=='1'?'普通会员':'副会长单位'
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！');
          return;
        } else {
          var ids = "";
          for (var a = 0; a < this.selectedRowKeys.length; a++) {
            ids += this.selectedRowKeys[a] + ",";
          }
          var that = this;
          this.$confirm({
            title: "确认设置为"+typeName+'吗？',
            content: "",
            onOk() {
              that.loading = true;
              getAction('/sys/user/updateBatch', {ids: ids,userType:type}).then((res) => {
                if (res.success) {
                  that.$message.success(res.message);
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                }
              }).finally(() => {
                that.loading = false;
              });
            },
            onCancel() {},
            // onOk: function () {
              
            // }
          });
        }
      },
      getAvatarView: function (avatar) {
        return getFileAccessHttpUrl(avatar,this.url.imgerver,"http")
      },

      batchFrozen: function (status) {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.warning('请选择一条记录！');
          return false;
        } else {
          let ids = "";
          let that = this;
          let isAdmin = false;
          that.selectionRows.forEach(function (row) {
            if (row.username == 'admin') {
              isAdmin = true;
            }
          });
          if (isAdmin) {
            that.$message.warning('管理员账号不允许此操作,请重新选择！');
            return;
          }
          that.selectedRowKeys.forEach(function (val) {
            ids += val + ",";
          });
          that.$confirm({
            title: "确认操作",
            content: "是否" + (status == 1 ? "审核通过" : "未审核") + "选中账号?",
            onOk: function () {
              frozenBatch({ids: ids, status: status}).then((res) => {
                if (res.success) {
                  that.$message.success(res.message);
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.message);
                }
              });
            }
          });
        }
      },
      handleMenuClick(e) {
        if (e.key == 1) {
          this.batchDel();
        } else if (e.key == 2) {
          this.checkRole('1')
        } else if (e.key == 3) {
          this.checkRole('2')
        }
      },
      handleFrozen: function (id, status, username) {
        let that = this;
        //TODO 后台校验管理员角色
        if ('admin' == username) {
          that.$message.warning('管理员账号不允许此操作！');
          return;
        }
        frozenBatch({ids: id, status: status}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      handleFrozen2: function (id, status, username) {
        let that = this;
        //TODO 后台校验管理员角色
        if ('admin' == username) {
          that.$message.warning('管理员账号不允许此操作！');
          return;
        }
        frozenBatch({ids: id, status2: status}).then((res) => {
          if (res.success) {
            that.$message.success(res.message);
            that.loadData();
          } else {
            that.$message.warning(res.message);
          }
        });
      },
      handleChangePassword(username) {
        this.$refs.passwordmodal.show(username);
      },
      handleAgentSettings(username){
        this.$refs.sysUserAgentModal.agentSettings(username);
        this.$refs.sysUserAgentModal.title = "用户代理人设置";
      },
      handleSyncUser() {
      },
      passwordModalOk() {
        //TODO 密码修改完成 不需要刷新页面，可以把datasource中的数据更新一下
      }
    }

  }
</script>
<style scoped>
  @import '~@assets/less/common.less'
</style>