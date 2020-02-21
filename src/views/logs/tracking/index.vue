<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.id" placeholder="Id" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        Search
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        Export
      </el-button>
    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="300" :class-name="getSortClass('id')">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="memory_at" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.status }}</span>
        </template>
      </el-table-column>
      <el-table-column label="created at" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="updated at" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.updated_at }}</span>
        </template>
      </el-table-column>

      <el-table-column label="merchant" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.merchant }}</span>
        </template>
      </el-table-column>
      <el-table-column label="sf error" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.sf_error }}</span>
        </template>
      </el-table-column>
      <el-table-column label="object" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.object }}</span>
        </template>
      </el-table-column>
      <el-table-column label="operation" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.operation }}</span>
        </template>
      </el-table-column>
      <el-table-column label="sf_job_id" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.sf_job_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="uuid__c" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.uuid__c }}</span>
        </template>
      </el-table-column>
      <el-table-column label="sf_id" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.sf_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="number" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.number }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.offset + 1" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="Detail" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="20%" style="width: 100%;">
        <el-form-item label="ID" prop="id">
          <el-input v-model="temp.id" />
        </el-form-item>
        <el-form-item label="status" prop="end_point">
          <el-input v-model="temp.status" />
        </el-form-item>
        <el-form-item label="created_at" prop="merchant">
          <el-input v-model="temp.created_at" />
        </el-form-item>
        <el-form-item label="updated_at" prop="method">
          <el-input v-model="temp.updated_at" />
        </el-form-item>
        <el-form-item label="merchant" prop="total_request">
          <el-input v-model="temp.merchant" />
        </el-form-item>
        <el-form-item label="sf_error" prop="created_at">
          <el-input v-model="temp.sf_error" />
        </el-form-item>
        <el-form-item label="value" prop="status">
          <json-editor :value="temp.value"></json-editor>
        </el-form-item>
        <el-form-item label="object" prop="updated_at">
          <el-input v-model="temp.object" />
        </el-form-item>
        <el-form-item label="operation" prop="merchant">
          <el-input v-model="temp.operation" />
        </el-form-item>
        <el-form-item label="sf_job_id" prop="merchant">
          <el-input v-model="temp.sf_job_id" />
        </el-form-item>
        <el-form-item label="uuid__c" prop="merchant">
          <el-input v-model="temp.uuid__c" />
        </el-form-item>
        <el-form-item label="sf_id" prop="merchant">
          <el-input v-model="temp.sf_id" />
        </el-form-item>
        <el-form-item label="number" prop="merchant">
          <el-input v-model="temp.number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          Cancel
        </el-button>
<!--        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">-->
<!--          Confirm-->
<!--        </el-button>-->
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listTracking } from '@/api/logs'
  import waves from '@/directive/waves' // waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination'
  import JsonEditor from '../../../components/JsonEditor/index' // secondary package based on el-pagination

  export default {
    name: 'logs',
    components: { JsonEditor, Pagination },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'info',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          offset: 0,
          limit: 20,
          importance: undefined,
          id: undefined,
        },
        temp: {
          id: '',
          status: '',
          created_at: '',
          updated_at: '',
          merchant: '',
          sf_error: '',
          value: {},
          object: '',
          operation: '',
          sf_job_id: '',
          uuid__c: '',
          sf_id: '',
          number: ''
        },
        showReviewer: false,
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        dialogPvVisible: false,
        pvData: [],
        rules: {
          id: [{ required: true, message: 'title is required', trigger: 'blur' }]
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      getList() {
        this.listLoading = true
        listTracking(this.listQuery).then(response => {
          response = response.body;
          this.list = response.results
          this.total = response.total*1

          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        }).catch(e => {
          setTimeout(() => {
            this.listLoading = false
          }, 1.5 * 1000)
        })
      },
      handleFilter() {
        this.listQuery.offset = 0
        this.getList()
      },
      sortChange(data) {
        const { prop, order } = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.temp.timestamp = new Date(this.temp.timestamp)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleDownload() {
        this.downloadLoading = true
        import('@/vendor/Export2Excel').then(excel => {
          const tHeader = ['id', 'pid', 'operation', 'object', 'created_date', 'concurrency_mode', 'content_url', 'content_type', 'log_id', 'merchant', 'number_records_processed', 'number_records_failed']
          const filterVal = ['id', 'pid', 'operation', 'object', 'created_date', 'concurrency_mode', 'content_url', 'content_type', 'log_id', 'merchant', 'number_records_processed', 'number_records_failed']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'logs'
          })
          this.downloadLoading = false
        })
      },
      formatJson(filterVal) {
        return this.list.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      getSortClass: function(key) {
        const sort = this.listQuery.sort
        return sort === `+${key}` ? 'ascending' : 'descending'
      }
    }
  }
</script>
