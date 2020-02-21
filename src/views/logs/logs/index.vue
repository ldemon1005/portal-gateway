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
      <el-table-column label="end point" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.end_point }}</span>
        </template>
      </el-table-column>
      <el-table-column label="merchant" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.merchant }}</span>
        </template>
      </el-table-column>
      <el-table-column label="method" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.method }}</span>
        </template>
      </el-table-column>
      <el-table-column label="total request" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.total_request }}</span>
        </template>
      </el-table-column>
      <el-table-column label="created at" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column label="save at" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.save_at }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.offset + 1" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="Detail" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="35%" style="width: 80%; margin-left:50px;">
        <el-form-item label="ID" prop="id">
          <el-input v-model="temp.id" />
        </el-form-item>
        <el-form-item label="end_point" prop="end_point">
          <el-input v-model="temp.end_point" />
        </el-form-item>
        <el-form-item label="merchant" prop="merchant">
          <el-input v-model="temp.operation" />
        </el-form-item>
        <el-form-item label="method" prop="method">
          <el-input v-model="temp.method" />
        </el-form-item>
        <el-form-item label="total_request" prop="total_request">
          <el-input v-model="temp.total_request" />
        </el-form-item>
        <el-form-item label="created at" prop="created_at">
          <el-input v-model="temp.created_at" />
        </el-form-item>
        <el-form-item label="save_at" prop="save_at">
          <el-input v-model="temp.save_at" />
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
  import { listLogs } from '@/api/logs'
  import waves from '@/directive/waves' // waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  export default {
    name: 'logs',
    components: { Pagination },
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
          end_point: '',
          merchant: '',
          method: '',
          total_request: '',
          created_at: '',
          save_at: ''
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
        listLogs(this.listQuery).then(response => {
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
