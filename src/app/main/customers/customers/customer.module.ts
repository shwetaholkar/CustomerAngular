import { NgModule } from '@angular/core';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { CustomerRoutingModule } from './customer-routing.module';
import { CustomersComponent } from './customers.component';
import { CreateOrEditCustomerModalComponent } from './create-or-edit-customer-modal.component';
import { ViewCustomerModalComponent } from './view-customer-modal.component';

@NgModule({
    declarations: [CustomersComponent, CreateOrEditCustomerModalComponent, ViewCustomerModalComponent],
    imports: [AppSharedModule, CustomerRoutingModule, AdminSharedModule],
})
export class CustomerModule {}
