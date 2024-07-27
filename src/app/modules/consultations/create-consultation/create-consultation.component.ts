import { Component, OnInit, EventEmitter, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { CreateConsultationMutation,
         MinistryAutocompleteQuery,
         CategoryListQuery,
         MinistryCreateMutation } from './create-consultation.graphql';
import {debounceTime, distinctUntilChanged, map, switchMap, takeWhile, tap} from 'rxjs/operators';
import { UploadOutput, UploadInput, UploadFile, humanizeBytes } from 'ngx-uploader';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-consultation',
  templateUrl: './create-consultation.component.html',
  styleUrls: ['./create-consultation.component.scss']
})
export class CreateConsultationComponent implements OnInit {

  @ViewChild('addMinistryModal', { static: false }) addMinistryModal: ModalDirective;
  @ViewChild('addMinistryElement', { static: false }) addMinistryElement: ElementRef;

  consultationInfo = {
    title: '',
    url: '',
    responseDeadline: null,
    consultationFeedbackEmail: null
  };

  departmentInfo = {
    ministryId: null
  };

  ministryObject = {
    name: '',
    categoryId: null,
    logoFile: {
      filename: '',
      content: null
    },
    level: null,
    pocEmailPrimary: '',
    pocEmailSecondary: ''
  };
  dropdownText = 'Begin Typing';

  step = 1;
  searchEmitter: EventEmitter<any> = new EventEmitter();
  ministries: any = [];
  loadingMinistries: boolean;
  categoriesList: any;
  levels = [
    {
      id: 1,
      name: 'national'
    },
    {
      id: 2,
      name: 'state'
    },
    {
      id: 3,
      name: 'local'
    }
  ];

  files: any;
  uploadInput: EventEmitter<UploadInput>;
  uploadFile: EventEmitter<UploadFile>;
  humanizeBytes: Function;
  showAddMinistryBlock: boolean;
  searchText: any;
  colorTheme = 'theme-dark-blue';
  bsConfig: Partial<BsDatepickerConfig>;

  constructor(
    private apollo: Apollo,
    private errorService: ErrorService,
    ) {
    this.getCateoriesList();
  }

  ngOnInit() {
    this.subscribeToSearch();
    this.configDatePicker();
  }

  getCateoriesList() {
    this.apollo.query({
      query: CategoryListQuery,
      variables: {}
    })
    .pipe(
      map((i: any) => i.data.categoryList)
    )
    .subscribe((list) => {
      this.categoriesList = list.data;
    }, err => {
      this.errorService.showErrorModal(err);
    });
  }

  getMinistriesList() {
    this.loadingMinistries = true;
    this.apollo.query({
      query: MinistryAutocompleteQuery,
      variables: {
        q: name
      }
    })
    .pipe(
      map((i: any) => i.data.ministryAutocomplete),
      tap(() => this.loadingMinistries = false)
    )
    .subscribe ((list) => {
      this.loadingMinistries = false;
      this.ministries = list;
    }, (err: any) => {
     this.loadingMinistries = false;
     this.errorService.showErrorModal(err);
    });
  }

  subscribeToSearch() {
    this.searchEmitter
      .pipe(
        distinctUntilChanged(),
        debounceTime(400),
        takeWhile(data => !!data),
        switchMap(data => {
          if (data) {
            this.loadingMinistries = true;
            return this.searchMinistry(data.term);
          }
        })
      )
      .subscribe((result) => {
        this.loadingMinistries = false;
        this.ministries = result;
        if (this.searchText && !this.ministries.length) {
          this.showAddMinistryBlock = true;
          this.dropdownText = 'Ministry not found';
        } else if (this.searchText && this.ministries.length) {
          this.showAddMinistryBlock = this.checkMinistryExist(this.ministries);
        } else {
          this.showAddMinistryBlock = false;
        }
      }, (err: any) => {
        this.loadingMinistries = false;
        this.errorService.showErrorModal(err);
      });
  }

  checkMinistryExist(ministries) {
      const ministryExist = ministries.find((val) => {
        const found =  val.name.toLowerCase().indexOf(this.searchText);
        return found !== -1;
      });
      if (!ministryExist) {
        this.dropdownText = 'Ministry not found';
        return true;
      }
      return false;

  }

  onSearch(query: any) {
    if (!query.term) {
      this.searchText = '';
      query = null;
      return;
    }
    this.searchText = query['term'];
    this.searchEmitter.emit(query);
  }

  searchMinistry(name: string) {
    if (name && name.trim()) {
      return this.apollo.query({
          query: MinistryAutocompleteQuery,
          variables: {
            q: name
          }
        })
        .pipe(
          map((i: any) => i.data.ministryAutocomplete),
          tap(() => this.loadingMinistries = false)
        );
    }
  }

  stepNext(valid) {
    if (valid) {
      this.step = 2;
    }
  }

  openAddMinistryModal() {
    this.ministryObject.name = this.searchText;
    this.addMinistryModal.show();
  }

  hideAddMinistryModal() {
    this.showAddMinistryBlock = false;
    this.addMinistryModal.hide();
  }


toBase64(files: any[]) {
    files.forEach((file: File) => {
        const reader: FileReader = new FileReader();
        reader.onloadend = (ev: any) => {
            this.ministryObject.logoFile = {
              filename: file.name,
              content: ev.target.result || ev.dataTransfer.files[0]
              };
        };
        reader.readAsDataURL(file);
    });
}

onUploadOutput(output: UploadOutput): void {
    if (output.type === 'addedToQueue') {
        this.files = [output.file.nativeFile]; // add file to array when added
    }
    if (output.type === 'allAddedToQueue') { // when all files added in queue
        this.toBase64(this.files);
    }
}

@HostListener('document:click', ['$event.target'])
onClick(targetElement) {
  if (this.showAddMinistryBlock) {
    if (this.addMinistryElement && this.addMinistryElement.nativeElement && this.addMinistryElement.nativeElement.contains(targetElement)) {
          this.openAddMinistryModal();
    } else {
      this.showAddMinistryBlock = false;
    }
  }
}

addMinistry(valid) {
  if (valid && this.ministryObject.logoFile.filename) {
      this.apollo.mutate({
          mutation: MinistryCreateMutation,
          variables: {
            ministry: this.ministryObject
          }
        })
        .subscribe((res) => {
          this.addMinistryModal.hide();
          // const ministry = res.data.ministryCreate;
          // this.ministries = [ministry];
          // this.departmentInfo.ministryId =  ministry.id;
        }, err => {
          this.errorService.showErrorModal(err);
        });
  }
}

  submit(valid) {
    if (valid) {
      const consultation: any = {...this.consultationInfo, ...this.departmentInfo};
      consultation.reviewType = 'consultation';
      const variables = {
        consultation: consultation
      };
      this.apollo.mutate({
        mutation: CreateConsultationMutation,
        variables: variables
      })
      .subscribe((res) => {
        this.step = 3;
      }, err => {
        this.errorService.showErrorModal(err);
      });
    }
  }

  configDatePicker() {
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme, dateInputFormat: 'DD / MM / YYYY', showWeekNumbers : false });
  }

}
