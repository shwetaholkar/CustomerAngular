import { AppConsts } from '@shared/AppConsts';
import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomersServiceProxy, CustomerDto } from '@shared/service-proxies/service-proxies';
import { NotifyService } from 'abp-ng2-module';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditCustomerModalComponent } from './create-or-edit-customer-modal.component';

import { ViewCustomerModalComponent } from './view-customer-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/paginator';
import { LazyLoadEvent } from 'primeng/api';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { filter as _filter } from 'lodash-es';
import { DateTime } from 'luxon';

import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    templateUrl: './customers.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class CustomersComponent extends AppComponentBase {
    @ViewChild('createOrEditCustomerModal', { static: true })
    createOrEditCustomerModal: CreateOrEditCustomerModalComponent;
    @ViewChild('viewCustomerModalComponent', { static: true }) viewCustomerModal: ViewCustomerModalComponent;

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    emailFilter = '';
    addressFilter = '';
    maxRegistrationDateFilter: DateTime;
    minRegistrationDateFilter: DateTime;

    constructor(
        injector: Injector,
        private _customersServiceProxy: CustomersServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    getCustomers(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            if (this.primengTableHelper.records && this.primengTableHelper.records.length > 0) {
                return;
            }
        }

        this.primengTableHelper.showLoadingIndicator();

        this._customersServiceProxy
            .getAll(
                this.filterText,
                this.nameFilter,
                this.emailFilter,
                this.addressFilter,
                this.maxRegistrationDateFilter === undefined
                    ? this.maxRegistrationDateFilter
                    : this._dateTimeService.getEndOfDayForDate(this.maxRegistrationDateFilter),
                this.minRegistrationDateFilter === undefined
                    ? this.minRegistrationDateFilter
                    : this._dateTimeService.getStartOfDayForDate(this.minRegistrationDateFilter),
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createCustomer(): void {
        this.createOrEditCustomerModal.show();
    }

    deleteCustomer(customer: CustomerDto): void {
        this.message.confirm('', this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this._customersServiceProxy.delete(customer.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l('SuccessfullyDeleted'));
                });
            }
        });
    }

    exportToExcel(): void {
        this._customersServiceProxy
            .getCustomersToExcel(
                this.filterText,
                this.nameFilter,
                this.emailFilter,
                this.addressFilter,
                this.maxRegistrationDateFilter === undefined
                    ? this.maxRegistrationDateFilter
                    : this._dateTimeService.getEndOfDayForDate(this.maxRegistrationDateFilter),
                this.minRegistrationDateFilter === undefined
                    ? this.minRegistrationDateFilter
                    : this._dateTimeService.getStartOfDayForDate(this.minRegistrationDateFilter)
            )
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }
}
