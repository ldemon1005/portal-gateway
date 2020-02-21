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
      <el-table-column label="pid" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.pid }}</span>
        </template>
      </el-table-column>
      <el-table-column label="object" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.object }}</span>
        </template>
      </el-table-column>
      <el-table-column label="created_date" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.created_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="number records processed" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.number_records_processed }}</span>
        </template>
      </el-table-column>
      <el-table-column label="job id" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.job_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="merchant" min-width="150px">
        <template slot-scope="{row}">
          <span>{{ row.merchant }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.offset + 1" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog title="Detail" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="35%" style="width: 80%; margin-left:50px;">
        <el-form-item label="ID" prop="id">
          <el-input v-model="temp.id" />
        </el-form-item>
        <el-form-item label="pid" prop="pid">
          <el-input v-model="temp.pid" />
        </el-form-item>
        <el-form-item label="operation" prop="operation">
          <el-input v-model="temp.operation" />
        </el-form-item>
        <el-form-item label="object" prop="object">
          <el-input v-model="temp.object" />
        </el-form-item>
        <el-form-item label="created date" prop="created date">
          <el-input v-model="temp.created_date" />
        </el-form-item>
        <el-form-item label="concurrency mode" prop="concurrency mode">
          <el-input v-model="temp.concurrency_mode" />
        </el-form-item>
        <el-form-item label="content url" prop="content url">
          <el-input v-model="temp.content_url" />
        </el-form-item>
        <el-form-item label="content type" prop="content type">
          <el-input v-model="temp.content_type" />
        </el-form-item>
        <el-form-item label="job id" prop="job id">
          <el-input v-model="temp.job_id" />
        </el-form-item>
        <el-form-item label="merchant" prop="merchant">
          <el-input v-model="temp.merchant" />
        </el-form-item>
        <el-form-item label="number records processed" prop="number records processed">
          <el-input v-model="temp.number_records_processed" />
        </el-form-item>
        <el-form-item label="number records failed" prop="number records failed">
          <el-input v-model="temp.number_records_failed" />
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
  import { listJobs } from '@/api/logs'
  import waves from '@/directive/waves' // waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  export default {
    name: 'jobs',
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
          pid: '',
          operation: '',
          object: '',
          created_date: '',
          concurrency_mode: '',
          content_url: '',
          content_type: '',
          job_id: '',
          merchant: '',
          number_records_processed: '',
          number_records_failed: ''
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
          type: [{ required: true, message: 'type is required', trigger: 'change' }],
          timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
          title: [{ required: true, message: 'title is required', trigger: 'blur' }]
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
        listJobs(this.listQuery).then(response => {
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
          const tHeader = ['id', 'pid', 'operation', 'object', 'created_date', 'concurrency_mode', 'content_url', 'content_type', 'job_id', 'merchant', 'number_records_processed', 'number_records_failed']
          const filterVal = ['id', 'pid', 'operation', 'object', 'created_date', 'concurrency_mode', 'content_url', 'content_type', 'job_id', 'merchant', 'number_records_processed', 'number_records_failed']
          const data = this.formatJson(filterVal)
          excel.export_json_to_excel({
            header: tHeader,
            data,
            filename: 'jobs'
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
