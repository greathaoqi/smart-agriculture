<template>
  <div class="page-card">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="订单管理" name="order">
        <el-form :inline="true" :model="orderSearch" class="search-form">
          <el-form-item label="订单号">
            <el-input v-model="orderSearch.keyword" placeholder="请输入订单号" clearable />
          </el-form-item>
          <el-form-item label="客户">
            <el-select v-model="orderSearch.customer_id" placeholder="请选择客户" clearable filterable style="width: 180px;">
              <el-option v-for="c in allCustomers" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="orderSearch.status" placeholder="请选择" clearable style="width: 120px;">
              <el-option label="待确认" :value="0" />
              <el-option label="已确认" :value="1" />
              <el-option label="已发货" :value="2" />
              <el-option label="已完成" :value="3" />
              <el-option label="已取消" :value="4" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadOrders">搜索</el-button>
            <el-button @click="orderSearch.keyword = ''; orderSearch.customer_id = null; orderSearch.status = null; loadOrders()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar">
          <el-button type="primary" @click="handleAddOrder">新增订单</el-button>
        </div>
        <el-table :data="orderList" v-loading="orderLoading" stripe>
          <el-table-column prop="order_no" label="订单号" width="180" />
          <el-table-column prop="customer" label="客户" width="150">
            <template #default="{ row }">{{ row.customer?.name || '-' }}</template>
          </el-table-column>
          <el-table-column prop="total_amount" label="金额" width="120">
            <template #default="{ row }">¥{{ row.total_amount }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="orderStatusMap[row.status]?.type" size="small">{{ orderStatusMap[row.status]?.label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditOrder(row)">编辑</el-button>
              <el-button type="success" link @click="handleOrderStatus(row)">状态</el-button>
              <el-button type="danger" link @click="handleDeleteOrder(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="orderPagination.page"
            v-model:page-size="orderPagination.pageSize"
            :total="orderPagination.total"
            layout="total, prev, pager, next"
            @current-change="loadOrders"
          />
        </div>
      </el-tab-pane>

      <el-tab-pane label="客户管理" name="customer">
        <el-form :inline="true" :model="customerSearch" class="search-form">
          <el-form-item label="客户名称">
            <el-input v-model="customerSearch.keyword" placeholder="请输入客户名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadCustomers">搜索</el-button>
            <el-button @click="customerSearch.keyword = ''; loadCustomers()">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="toolbar">
          <el-button type="primary" @click="handleAddCustomer">新增客户</el-button>
        </div>
        <el-table :data="customerList" v-loading="customerLoading" stripe>
          <el-table-column prop="name" label="客户名称" min-width="150" />
          <el-table-column prop="type" label="客户类型" width="100" />
          <el-table-column prop="contact" label="联系人" width="100" />
          <el-table-column prop="phone" label="联系电话" width="130" />
          <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEditCustomer(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDeleteCustomer(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="customerPagination.page"
            v-model:page-size="customerPagination.pageSize"
            :total="customerPagination.total"
            layout="total, prev, pager, next"
            @current-change="loadCustomers"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 订单弹窗 -->
    <el-dialog v-model="orderDialogVisible" :title="orderDialogTitle" width="600px">
      <el-form ref="orderFormRef" :model="orderForm" :rules="orderRules" label-width="80px">
        <el-form-item label="客户" prop="customer_id">
          <el-select v-model="orderForm.customer_id" style="width: 100%;" filterable>
            <el-option v-for="c in allCustomers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额"><el-input-number v-model="orderForm.total_amount" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="订单明细">
          <el-input v-model="orderForm.items" type="textarea" :rows="3" placeholder="请输入订单明细(JSON格式或文本描述)" />
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="orderForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitOrder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 客户弹窗 -->
    <el-dialog v-model="customerDialogVisible" :title="customerDialogTitle" width="500px">
      <el-form ref="customerFormRef" :model="customerForm" :rules="customerRules" label-width="80px">
        <el-form-item label="客户名称" prop="name"><el-input v-model="customerForm.name" /></el-form-item>
        <el-form-item label="客户类型">
          <el-select v-model="customerForm.type" style="width: 100%;">
            <el-option label="企业" value="企业" />
            <el-option label="个人" value="个人" />
            <el-option label="经销商" value="经销商" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系人"><el-input v-model="customerForm.contact" /></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="customerForm.phone" /></el-form-item>
        <el-form-item label="地址"><el-input v-model="customerForm.address" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="customerForm.remark" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="customerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmitCustomer">确定</el-button>
      </template>
    </el-dialog>

    <!-- 状态弹窗 -->
    <el-dialog v-model="statusDialogVisible" title="更新订单状态" width="400px">
      <el-form label-width="80px">
        <el-form-item label="当前状态">
          <el-tag :type="orderStatusMap[currentOrder.status]?.type">{{ orderStatusMap[currentOrder.status]?.label }}</el-tag>
        </el-form-item>
        <el-form-item label="新状态">
          <el-select v-model="newStatus" style="width: 100%;">
            <el-option label="待确认" :value="0" />
            <el-option label="已确认" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已取消" :value="4" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, createOrder, updateOrder, deleteOrder, updateOrderStatus } from '@/api/order'
import { getCustomerList, getAllCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/api/customer'

const activeTab = ref('order')
const submitLoading = ref(false)

const orderStatusMap = {
  0: { label: '待确认', type: 'warning' },
  1: { label: '已确认', type: 'primary' },
  2: { label: '已发货', type: 'info' },
  3: { label: '已完成', type: 'success' },
  4: { label: '已取消', type: 'danger' }
}

const orderLoading = ref(false)
const orderList = ref([])
const allCustomers = ref([])
const orderSearch = reactive({ keyword: '', customer_id: null, status: null })
const orderPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const orderDialogVisible = ref(false)
const orderDialogTitle = ref('新增订单')
const orderFormRef = ref(null)
const orderForm = reactive({ id: null, customer_id: null, total_amount: 0, items: '', remark: '' })
const orderRules = { customer_id: [{ required: true, message: '请选择客户', trigger: 'change' }] }

const customerLoading = ref(false)
const customerList = ref([])
const customerSearch = reactive({ keyword: '' })
const customerPagination = reactive({ page: 1, pageSize: 10, total: 0 })
const customerDialogVisible = ref(false)
const customerDialogTitle = ref('新增客户')
const customerFormRef = ref(null)
const customerForm = reactive({ id: null, name: '', type: '企业', contact: '', phone: '', address: '', remark: '' })
const customerRules = { name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }] }

const statusDialogVisible = ref(false)
const currentOrder = ref({})
const newStatus = ref(0)

const loadOrders = async () => {
  orderLoading.value = true
  try {
    const res = await getOrderList({ page: orderPagination.page, pageSize: orderPagination.pageSize, ...orderSearch })
    orderList.value = res.data
    orderPagination.total = res.total
  } finally { orderLoading.value = false }
}

const loadAllCustomers = async () => {
  try { allCustomers.value = (await getAllCustomers()).data } catch (e) {}
}

const loadCustomers = async () => {
  customerLoading.value = true
  try {
    const res = await getCustomerList({ page: customerPagination.page, pageSize: customerPagination.pageSize, ...customerSearch })
    customerList.value = res.data
    customerPagination.total = res.total
  } finally { customerLoading.value = false }
}

const handleAddOrder = () => {
  orderDialogTitle.value = '新增订单'
  Object.assign(orderForm, { id: null, customer_id: null, total_amount: 0, items: '', remark: '' })
  orderDialogVisible.value = true
}

const handleEditOrder = (row) => {
  orderDialogTitle.value = '编辑订单'
  Object.assign(orderForm, { ...row, items: typeof row.items === 'object' ? JSON.stringify(row.items) : row.items })
  orderDialogVisible.value = true
}

const handleDeleteOrder = async (row) => {
  await ElMessageBox.confirm('确定要删除该订单吗？', '提示', { type: 'warning' })
  await deleteOrder(row.id)
  ElMessage.success('删除成功')
  loadOrders()
}

const handleSubmitOrder = async () => {
  await orderFormRef.value?.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      const data = { ...orderForm, items: orderForm.items ? JSON.parse(orderForm.items) : null }
      if (orderForm.id) { await updateOrder(orderForm.id, data); ElMessage.success('更新成功') }
      else { await createOrder(data); ElMessage.success('创建成功') }
      orderDialogVisible.value = false
      loadOrders()
    } catch (e) { ElMessage.error('请检查订单明细格式') }
    finally { submitLoading.value = false }
  })
}

const handleOrderStatus = (row) => {
  currentOrder.value = row
  newStatus.value = row.status
  statusDialogVisible.value = true
}

const handleUpdateStatus = async () => {
  await updateOrderStatus(currentOrder.value.id, newStatus.value)
  ElMessage.success('状态更新成功')
  statusDialogVisible.value = false
  loadOrders()
}

const handleAddCustomer = () => {
  customerDialogTitle.value = '新增客户'
  Object.assign(customerForm, { id: null, name: '', type: '企业', contact: '', phone: '', address: '', remark: '' })
  customerDialogVisible.value = true
}

const handleEditCustomer = (row) => {
  customerDialogTitle.value = '编辑客户'
  Object.assign(customerForm, row)
  customerDialogVisible.value = true
}

const handleDeleteCustomer = async (row) => {
  await ElMessageBox.confirm('确定要删除该客户吗？', '提示', { type: 'warning' })
  await deleteCustomer(row.id)
  ElMessage.success('删除成功')
  loadCustomers()
  loadAllCustomers()
}

const handleSubmitCustomer = async () => {
  await customerFormRef.value?.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      if (customerForm.id) { await updateCustomer(customerForm.id, customerForm); ElMessage.success('更新成功') }
      else { await createCustomer(customerForm); ElMessage.success('创建成功') }
      customerDialogVisible.value = false
      loadCustomers()
      loadAllCustomers()
    } finally { submitLoading.value = false }
  })
}

onMounted(() => { loadAllCustomers(); loadOrders(); loadCustomers() })
</script>

<style scoped>
.search-form { margin-bottom: 16px; }
.toolbar { margin-bottom: 16px; }
.pagination-wrapper { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
