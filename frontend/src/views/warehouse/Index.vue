<template>
  <div class="page-card">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="仓库管理" name="warehouse">
        <el-form :inline="true" :model="warehouseSearch" class="search-form">
          <el-form-item label="仓库名称">
            <el-input v-model="warehouseSearch.keyword" placeholder="请输入仓库名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadWarehouses">搜索</el-button>
            <el-button @click="warehouseSearch.keyword = ''; loadWarehouses()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar">
          <el-button type="primary" @click="handleAddWarehouse">新增仓库</el-button>
        </div>
        <el-table :data="warehouseList" v-loading="warehouseLoading" stripe>
          <el-table-column prop="code" label="仓库编码" width="120" />
          <el-table-column prop="name" label="仓库名称" min-width="150" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.type === 'cold' ? '冷藏' : '普通' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="capacity" label="容量(吨)" width="100" />
          <el-table-column prop="manager" label="负责人" width="100" />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">{{ row.status === 1 ? '启用' : '禁用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditWarehouse(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteWarehouse(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="warehousePagination.page"
            v-model:page-size="warehousePagination.pageSize"
            :total="warehousePagination.total"
            layout="total, prev, pager, next"
            @current-change="loadWarehouses"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="库存管理" name="inventory">
        <el-form :inline="true" :model="inventorySearch" class="search-form">
          <el-form-item label="产品名称">
            <el-input v-model="inventorySearch.keyword" placeholder="请输入产品名称" clearable />
          </el-form-item>
          <el-form-item label="仓库">
            <el-select v-model="inventorySearch.warehouse_id" placeholder="请选择仓库" clearable style="width: 180px;">
              <el-option v-for="w in allWarehouses" :key="w.id" :label="w.name" :value="w.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadInventory">搜索</el-button>
            <el-button @click="inventorySearch.keyword = ''; inventorySearch.warehouse_id = null; loadInventory()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar">
          <el-button type="primary" @click="handleAddInventory">新增库存</el-button>
          <el-button type="success" @click="handleStockIn">入库</el-button>
          <el-button type="warning" @click="handleStockOut">出库</el-button>
        </div>
        <el-table :data="inventoryList" v-loading="inventoryLoading" stripe>
          <el-table-column prop="product_name" label="产品名称" min-width="150" />
          <el-table-column prop="product_type" label="产品类型" width="100" />
          <el-table-column prop="warehouse" label="所在仓库" width="150">
            <template #default="{ row }">{{ row.warehouse?.name || '-' }}</template>
          </el-table-column>
          <el-table-column prop="unit" label="单位" width="80" />
          <el-table-column prop="quantity" label="库存数量" width="100">
            <template #default="{ row }">
              <span :class="{ 'low-stock': row.quantity <= row.warning_quantity }">{{ row.quantity }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="warning_quantity" label="预警数量" width="100" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditInventory(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteInventory(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="inventoryPagination.page"
            v-model:page-size="inventoryPagination.pageSize"
            :total="inventoryPagination.total"
            layout="total, prev, pager, next"
            @current-change="loadInventory"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 仓库弹窗 -->
    <el-dialog v-model="warehouseDialogVisible" :title="warehouseDialogTitle" width="550px">
      <el-form ref="warehouseFormRef" :model="warehouseForm" :rules="warehouseRules" label-width="80px">
        <el-form-item label="仓库编码" prop="code"><el-input v-model="warehouseForm.code" /></el-form-item>
        <el-form-item label="仓库名称" prop="name"><el-input v-model="warehouseForm.name" /></el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="warehouseForm.type" style="width: 100%;">
            <el-option label="普通仓库" value="normal" />
            <el-option label="冷藏仓库" value="cold" />
          </el-select>
        </el-form-item>
        <el-form-item label="容量"><el-input-number v-model="warehouseForm.capacity" :min="0" /> 吨</el-form-item>
        <el-form-item label="地址"><el-input v-model="warehouseForm.address" /></el-form-item>
        <el-form-item label="负责人"><el-input v-model="warehouseForm.manager" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="warehouseForm.phone" /></el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="warehouseForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="warehouseDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitWarehouse">确定</el-button>
      </template>
    </el-dialog>

    <!-- 库存弹窗 -->
    <el-dialog v-model="inventoryDialogVisible" :title="inventoryDialogTitle" width="500px">
      <el-form ref="inventoryFormRef" :model="inventoryForm" :rules="inventoryRules" label-width="80px">
        <el-form-item label="产品名称" prop="product_name"><el-input v-model="inventoryForm.product_name" /></el-form-item>
        <el-form-item label="产品类型"><el-input v-model="inventoryForm.product_type" /></el-form-item>
        <el-form-item label="仓库" prop="warehouse_id">
          <el-select v-model="inventoryForm.warehouse_id" style="width: 100%;">
            <el-option v-for="w in allWarehouses" :key="w.id" :label="w.name" :value="w.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="单位"><el-input v-model="inventoryForm.unit" /></el-form-item>
        <el-form-item label="数量"><el-input-number v-model="inventoryForm.quantity" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="预警数量"><el-input-number v-model="inventoryForm.warning_quantity" :min="0" :precision="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inventoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitInventory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 出入库弹窗 -->
    <el-dialog v-model="stockDialogVisible" :title="stockDialogTitle" width="450px">
      <el-form ref="stockFormRef" :model="stockForm" :rules="stockRules" label-width="80px">
        <el-form-item label="库存产品" prop="id">
          <el-select v-model="stockForm.id" style="width: 100%;" filterable>
            <el-option v-for="item in inventoryList" :key="item.id" :label="item.product_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity"><el-input-number v-model="stockForm.quantity" :min="0.01" :precision="2" /></el-form-item>
        <el-form-item label="操作人"><el-input v-model="stockForm.operator" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="stockForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitStock">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWarehouseList, getAllWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '@/api/warehouse'
import { getInventoryList, createInventory, updateInventory, deleteInventory, stockIn, stockOut } from '@/api/inventory'

const activeTab = ref('warehouse')
const submitLoading = ref(false)

const warehouseLoading = ref(false)
const warehouseList = ref([])
const allWarehouses = ref([])
const warehouseSearch = reactive({ keyword: '' })
const warehousePagination = reactive({ page: 1, pageSize: 10, total: 0 })
const warehouseDialogVisible = ref(false)
const warehouseDialogTitle = ref('新增仓库')
const warehouseFormRef = ref(null)
const warehouseForm = reactive({ id: null, code: '', name: '', type: 'normal', capacity: null, address: '', manager: '', phone: '', status: 1 })
const warehouseRules = { name: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }] }

const inventoryLoading = ref(false)
const inventoryList = ref([])
const inventorySearch = reactive({ keyword: '', warehouse_id: null })
const inventoryPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const inventoryDialogVisible = ref(false)
const inventoryDialogTitle = ref('新增库存')
const inventoryFormRef = ref(null)
const inventoryForm = reactive({ id: null, product_name: '', product_type: '', warehouse_id: null, unit: 'kg', quantity: 0, warning_quantity: 0 })
const inventoryRules = { product_name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }] }

const stockDialogVisible = ref(false)
const stockDialogTitle = ref('入库')
const stockFormRef = ref(null)
const stockForm = reactive({ id: null, quantity: 0, operator: '', remark: '' })
const stockRules = { id: [{ required: true, message: '请选择产品', trigger: 'change' }], quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }] }
const stockType = ref('in')

const loadWarehouses = async () => {
  warehouseLoading.value = true
  try {
    const res = await getWarehouseList({ page: warehousePagination.page, pageSize: warehousePagination.pageSize, ...warehouseSearch })
    warehouseList.value = res.data
    warehousePagination.total = res.total
  } finally {
    warehouseLoading.value = false
  }
}

const loadAllWarehouses = async () => {
  try { allWarehouses.value = (await getAllWarehouses()).data } catch (e) {}
}

const loadInventory = async () => {
  inventoryLoading.value = true
  try {
    const res = await getInventoryList({ page: inventoryPagination.page, pageSize: inventoryPagination.pageSize, ...inventorySearch })
    inventoryList.value = res.data
    inventoryPagination.total = res.total
  } finally {
    inventoryLoading.value = false
  }
}

const handleAddWarehouse = () => {
  warehouseDialogTitle.value = '新增仓库'
  Object.assign(warehouseForm, { id: null, code: '', name: '', type: 'normal', capacity: null, address: '', manager: '', phone: '', status: 1 })
  warehouseDialogVisible.value = true
}

const handleEditWarehouse = (row) => {
  warehouseDialogTitle.value = '编辑仓库'
  Object.assign(warehouseForm, row)
  warehouseDialogVisible.value = true
}

const handleDeleteWarehouse = async (row) => {
  await ElMessageBox.confirm('确定要删除该仓库吗？', '提示', { type: 'warning' })
  await deleteWarehouse(row.id)
  ElMessage.success('删除成功')
  loadWarehouses()
}

const handleSubmitWarehouse = async () => {
  await warehouseFormRef.value?.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (warehouseForm.id) { await updateWarehouse(warehouseForm.id, warehouseForm); ElMessage.success('更新成功') }
      else { await createWarehouse(warehouseForm); ElMessage.success('创建成功') }
      warehouseDialogVisible.value = false
      loadWarehouses()
      loadAllWarehouses()
    } finally { submitLoading.value = false }
  })
}

const handleAddInventory = () => {
  inventoryDialogTitle.value = '新增库存'
  Object.assign(inventoryForm, { id: null, product_name: '', product_type: '', warehouse_id: null, unit: 'kg', quantity: 0, warning_quantity: 0 })
  inventoryDialogVisible.value = true
}

const handleEditInventory = (row) => {
  inventoryDialogTitle.value = '编辑库存'
  Object.assign(inventoryForm, row)
  inventoryDialogVisible.value = true
}

const handleDeleteInventory = async (row) => {
  await ElMessageBox.confirm('确定要删除该库存记录吗？', '提示', { type: 'warning' })
  await deleteInventory(row.id)
  ElMessage.success('删除成功')
  loadInventory()
}

const handleSubmitInventory = async () => {
  await inventoryFormRef.value?.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (inventoryForm.id) { await updateInventory(inventoryForm.id, inventoryForm); ElMessage.success('更新成功') }
      else { await createInventory(inventoryForm); ElMessage.success('创建成功') }
      inventoryDialogVisible.value = false
      loadInventory()
    } finally { submitLoading.value = false }
  })
}

const handleStockIn = () => {
  stockType.value = 'in'
  stockDialogTitle.value = '入库'
  Object.assign(stockForm, { id: null, quantity: 0, operator: '', remark: '' })
  stockDialogVisible.value = true
}

const handleStockOut = () => {
  stockType.value = 'out'
  stockDialogTitle.value = '出库'
  Object.assign(stockForm, { id: null, quantity: 0, operator: '', remark: '' })
  stockDialogVisible.value = true
}

const handleSubmitStock = async () => {
  await stockFormRef.value?.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (stockType.value === 'in') { await stockIn(stockForm); ElMessage.success('入库成功') }
      else { await stockOut(stockForm); ElMessage.success('出库成功') }
      stockDialogVisible.value = false
      loadInventory()
    } finally { submitLoading.value = false }
  })
}

onMounted(() => { loadWarehouses(); loadAllWarehouses(); loadInventory() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
.low-stock { color: #f56c6c; font-weight: bold; }
</style>
