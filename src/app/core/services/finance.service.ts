import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private http = inject(HttpClient);
  private configService = inject(ConfigService);

  private get headers() {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private get baseUrl() {
    return this.configService.financeApiUrl;
  }

  // --- Products ---
  getProducts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/products`, { headers: this.headers });
  }

  getProduct(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/products/${uuid}`, { headers: this.headers });
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/products`, data, { headers: this.headers });
  }

  updateProduct(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/products/${uuid}`, data, { headers: this.headers });
  }

  deleteProduct(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/products/${uuid}`, { headers: this.headers });
  }

  // --- Providers ---
  getProviders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/providers`, { headers: this.headers });
  }

  getProvider(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/providers/${uuid}`, { headers: this.headers });
  }

  createProvider(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/providers`, data, { headers: this.headers });
  }

  updateProvider(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/providers/${uuid}`, data, { headers: this.headers });
  }

  deleteProvider(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/providers/${uuid}`, { headers: this.headers });
  }

  // --- Branches ---
  getBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/branches`, { headers: this.headers });
  }

  createBranch(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/branches`, data, { headers: this.headers });
  }

  updateBranch(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/branches/${uuid}`, data, { headers: this.headers });
  }

  deleteBranch(uuid: string | number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/branches/${uuid}`, { headers: this.headers });
  }

  // --- Provider Branches (Sucursales de Proveedores) ---
  getProviderBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sucursales-proveedores`, { headers: this.headers });
  }

  createProviderBranch(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sucursales-proveedores`, data, { headers: this.headers });
  }

  updateProviderBranch(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sucursales-proveedores/${uuid}`, data, { headers: this.headers });
  }

  deleteProviderBranch(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sucursales-proveedores/${uuid}`, { headers: this.headers });
  }

  // --- Service Types ---
  getServiceTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/service-types`, { headers: this.headers });
  }

  createServiceType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/service-types`, data, { headers: this.headers });
  }

  updateServiceType(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/service-types/${uuid}`, data, { headers: this.headers });
  }

  deleteServiceType(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/service-types/${uuid}`, { headers: this.headers });
  }

  // --- Sales Categories ---
  getSalesCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-categories`, { headers: this.headers });
  }

  createSalesCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales-categories`, data, { headers: this.headers });
  }

  updateSalesCategory(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sales-categories/${uuid}`, data, { headers: this.headers });
  }

  deleteSalesCategory(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sales-categories/${uuid}`, { headers: this.headers });
  }

  // --- Clients ---
  getClients(): Observable<any> {
    return this.http.get(`${this.baseUrl}/clients`, { headers: this.headers });
  }
  createClient(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/clients`, data, { headers: this.headers });
  }
  updateClient(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/clients/${uuid}`, data, { headers: this.headers });
  }
  deleteClient(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clients/${uuid}`, { headers: this.headers });
  }

  // --- Customer Branches ---
  getCustomerBranches(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer-branches`, { headers: this.headers });
  }
  createCustomerBranch(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer-branches`, data, { headers: this.headers });
  }
  updateCustomerBranch(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/customer-branches/${uuid}`, data, { headers: this.headers });
  }
  deleteCustomerBranch(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customer-branches/${uuid}`, { headers: this.headers });
  }

  // --- Sales Orders (Ordenes de Venta) ---
  getSalesOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-orders`, { headers: this.headers });
  }

  getSalesOrder(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/sales-orders/${uuid}`, { headers: this.headers });
  }

  createSalesOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/sales-orders`, data, { headers: this.headers });
  }

  updateSalesOrder(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/sales-orders/${uuid}`, data, { headers: this.headers });
  }

  deleteSalesOrder(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sales-orders/${uuid}`, { headers: this.headers });
  }

  updateSalesOrderStatus(id: number, newStatus: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/sales-orders/${id}/status`, { estado: newStatus }, { headers: this.headers });
  }

  getSalesOrderDashboard(fechaInicio?: string, fechaFin?: string): Observable<any> {
    let url = `${this.baseUrl}/sales-orders/dashboard`;
    const params = [];
    if (fechaInicio) params.push(`fecha_inicio=${fechaInicio}`);
    if (fechaFin) params.push(`fecha_fin=${fechaFin}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get(url, { headers: this.headers });
  }

  getSalesOrderCharts(frequency: string = 'month', fechaInicio?: string, fechaFin?: string): Observable<any> {
    let url = `${this.baseUrl}/sales-orders/charts?frequency=${frequency}`;
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    return this.http.get(url, { headers: this.headers });
  }

  getSalesOrderCostCenters(level: number = 1, fechaInicio?: string, fechaFin?: string): Observable<any> {
    let url = `${this.baseUrl}/sales-orders/cost-centers?level=${level}`;
    if (fechaInicio) url += `&fecha_inicio=${fechaInicio}`;
    if (fechaFin) url += `&fecha_fin=${fechaFin}`;
    return this.http.get(url, { headers: this.headers });
  }

  // --- Purchase Orders (Ordenes de Compra) ---
  getPurchaseOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/purchase-orders`, { headers: this.headers });
  }

  getPurchaseOrder(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/purchase-orders/${uuid}`, { headers: this.headers });
  }

  createPurchaseOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/purchase-orders`, data, { headers: this.headers });
  }

  updatePurchaseOrder(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/purchase-orders/${uuid}`, data, { headers: this.headers });
  }

  deletePurchaseOrder(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/purchase-orders/${uuid}`, { headers: this.headers });
  }

  // --- Centros de Costo ---
  getCentrosCosto(): Observable<any> {
    return this.http.get(`${this.baseUrl}/centros-costo`, { headers: this.headers });
  }

  getCentrosCostoMovimientos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/centros-costo-movimientos`, { headers: this.headers });
  }

  createCentroCosto(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/centros-costo`, data, { headers: this.headers });
  }

  updateCentroCosto(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/centros-costo/${uuid}`, data, { headers: this.headers });
  }

  deleteCentroCosto(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/centros-costo/${uuid}`, { headers: this.headers });
  }

  // --- Estados de Equipo ---
  getEquipmentStates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estados-equipo`, { headers: this.headers });
  }

  createEquipmentState(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/estados-equipo`, data, { headers: this.headers });
  }

  updateEquipmentState(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/estados-equipo/${uuid}`, data, { headers: this.headers });
  }

  deleteEquipmentState(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/estados-equipo/${uuid}`, { headers: this.headers });
  }

  // --- Tipos de Movimiento ---
  getMovementTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipos-movimiento`, { headers: this.headers });
  }

  createMovementType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tipos-movimiento`, data, { headers: this.headers });
  }

  updateMovementType(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tipos-movimiento/${uuid}`, data, { headers: this.headers });
  }

  deleteMovementType(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tipos-movimiento/${uuid}`, { headers: this.headers });
  }

  // --- Inventario ---
  getInventory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventario`, { headers: this.headers });
  }

  createInventory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventario`, data, { headers: this.headers });
  }

  updateInventory(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventario/${uuid}`, data, { headers: this.headers });
  }

  deleteInventory(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventario/${uuid}`, { headers: this.headers });
  }

  // --- Series de Inventario ---
  getInventorySeries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventario-series`, { headers: this.headers });
  }

  createInventorySeries(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventario-series`, data, { headers: this.headers });
  }

  updateInventorySeries(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventario-series/${uuid}`, data, { headers: this.headers });
  }

  deleteInventorySeries(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventario-series/${uuid}`, { headers: this.headers });
  }

  // --- Movimientos de Inventario (Kárdex) ---
  getInventoryMovements(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventario-movimientos`, { headers: this.headers });
  }

  createInventoryMovement(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventario-movimientos`, data, { headers: this.headers });
  }

  updateInventoryMovement(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventario-movimientos/${uuid}`, data, { headers: this.headers });
  }

  deleteInventoryMovement(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventario-movimientos/${uuid}`, { headers: this.headers });
  }

  // --- Ajustes de Inventario ---
  getAjustesInventario(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ajustes-inventario`, { headers: this.headers });
  }

  createAjusteInventario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ajustes-inventario`, data, { headers: this.headers });
  }

  updateAjusteInventario(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/ajustes-inventario/${uuid}`, data, { headers: this.headers });
  }

  deleteAjusteInventario(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ajustes-inventario/${uuid}`, { headers: this.headers });
  }
  // --- Estados de Orden de Venta ---
  getSalesOrderStates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/estados-orden-venta`, { headers: this.headers });
  }

  createSalesOrderState(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/estados-orden-venta`, data, { headers: this.headers });
  }

  updateSalesOrderState(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/estados-orden-venta/${uuid}`, data, { headers: this.headers });
  }

  deleteSalesOrderState(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/estados-orden-venta/${uuid}`, { headers: this.headers });
  }

  // --- Monedas ---
  getCurrencies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/monedas`, { headers: this.headers });
  }

  createCurrency(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/monedas`, data, { headers: this.headers });
  }

  updateCurrency(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/monedas/${uuid}`, data, { headers: this.headers });
  }

  deleteCurrency(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/monedas/${uuid}`, { headers: this.headers });
  }

  // --- Document Types (Tipos de Documento) ---
  getDocumentTypes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/tipos-documento`, { headers: this.headers });
  }

  createDocumentType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tipos-documento`, data, { headers: this.headers });
  }

  updateDocumentType(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/tipos-documento/${uuid}`, data, { headers: this.headers });
  }

  deleteDocumentType(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tipos-documento/${uuid}`, { headers: this.headers });
  }

  // --- Attachments (Adjuntos) ---
  uploadAttachment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/sales-orders/upload`, formData, { headers: new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }) });
  }

  uploadAttachmentToOrder(uuid: string, file: File, tipoDocumentoId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo_documento_id', tipoDocumentoId.toString());
    return this.http.post(`${this.baseUrl}/sales-orders/${uuid}/adjuntos`, formData, { headers: new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }) });
  }

  deleteAttachment(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sales-orders/adjuntos/${uuid}`, { headers: this.headers });
  }

  deleteAttachmentFromOrder(orderUuid: string, attachmentUuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sales-orders/${orderUuid}/adjuntos/${attachmentUuid}`, { headers: new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }) });
  }

  // --- Servicios ---
  getServices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/servicios`, { headers: this.headers });
  }

  createService(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/servicios`, data, { headers: this.headers });
  }

  updateService(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/servicios/${uuid}`, data, { headers: this.headers });
  }

  deleteService(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/servicios/${uuid}`, { headers: this.headers });
  }

  // --- Accounts ---
  getAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts`, { headers: this.headers });
  }

  getAccount(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts/${uuid}`, { headers: this.headers });
  }

  createAccount(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/accounts`, data, { headers: this.headers });
  }

  updateAccount(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/accounts/${uuid}`, data, { headers: this.headers });
  }

  deleteAccount(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/accounts/${uuid}`, { headers: this.headers });
  }

  // --- Rubros de Presupuesto ---
  getRubrosPresupuesto(): Observable<any> {
    return this.http.get(`${this.baseUrl}/rubros-presupuesto`, { headers: this.headers });
  }

  createRubroPresupuesto(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/rubros-presupuesto`, data, { headers: this.headers });
  }

  updateRubroPresupuesto(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/rubros-presupuesto/${uuid}`, data, { headers: this.headers });
  }


  deleteRubroPresupuesto(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/rubros-presupuesto/${uuid}`, { headers: this.headers });
  }

  // --- Gastos Operativos ---
  getGastosOperativos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/gastos-operativos`, { headers: this.headers });
  }

  createGastoOperativo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/gastos-operativos`, data, { headers: this.headers });
  }

  deleteGastoOperativo(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/gastos-operativos/${uuid}`, { headers: this.headers });
  }

  // --- Libro Diario ---
  getPartidasLibroDiario(params?: { fecha_desde?: string; fecha_hasta?: string }): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro-diario`, { headers: this.headers, params: params as any });
  }

  getPartidaLibroDiario(uuid: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/libro-diario/${uuid}`, { headers: this.headers });
  }

  createPartidaLibroDiario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/libro-diario`, data, { headers: this.headers });
  }

  deletePartidaLibroDiario(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/libro-diario/${uuid}`, { headers: this.headers });
  }

  // --- Cuentas por Cobrar (CxC) ---
  getCxcDocuments(params?: { fecha_desde?: string; fecha_hasta?: string }): Observable<any> {
    return this.http.get(`${this.baseUrl}/cxc`, { headers: this.headers, params: params as any });
  }

  createCxcDocument(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cxc`, data, { headers: this.headers });
  }

  updateCxcDocument(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/cxc/${uuid}`, data, { headers: this.headers });
  }

  deleteCxcDocument(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cxc/${uuid}`, { headers: this.headers });
  }

  // --- Cuentas por Pagar (CxP) ---
  getCxpDocuments(params?: { fecha_desde?: string; fecha_hasta?: string }): Observable<any> {
    return this.http.get(`${this.baseUrl}/cxp`, { headers: this.headers, params: params as any });
  }

  createCxpDocument(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cxp`, data, { headers: this.headers });
  }

  updateCxpDocument(uuid: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/cxp/${uuid}`, data, { headers: this.headers });
  }

  deleteCxpDocument(uuid: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/cxp/${uuid}`, { headers: this.headers });
  }

  // --- Recibos de Pago (Tesorería) ---
  getRecibosPago(): Observable<any> {
    return this.http.get(`${this.baseUrl}/recibos-pago`, { headers: this.headers });
  }

  createReciboPago(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/recibos-pago`, data, { headers: this.headers });
  }
}

