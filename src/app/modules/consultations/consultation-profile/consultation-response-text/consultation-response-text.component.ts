import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { UserService } from 'src/app/shared/services/user.service';
import { ConsultationsService } from 'src/app/shared/services/consultations.service';
import { filter, map } from 'rxjs/operators';
import {
  isObjectEmpty,
  checkPropertiesPresence,
  scrollToFirstError,
} from 'src/app/shared/functions/modular.functions';
import { Router } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { ConsultationProfileCurrentUser, SubmitResponseQuery, CreateUserCountRecord, UpdateUserCountRecord,UserCountUser } from '../consultation-profile.graphql';
import { ErrorService } from 'src/app/shared/components/error-modal/error.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-consultation-response-text',
  templateUrl: './consultation-response-text.component.html',
  styleUrls: ['./consultation-response-text.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ConsultationResponseTextComponent
  implements OnInit, AfterViewChecked {
  @Input() profileData;
  @ViewChild('responseIndex', { read: ElementRef, static: false })
  responseIndex: ElementRef<any>;
  @ViewChild('responseContainer', { read: ElementRef, static: false })
  responseContainer: ElementRef<any>;
  @Output() openThankYouModal: EventEmitter<any> = new EventEmitter();

  ckeConfig = {
    removePlugins: 'elementspath',
    resize_enabled: false,
  };
  currentUser: any;
  consultationId: any;
  isMobile = window.innerWidth <= 768;
  responseText: any;
  showPublicResponseOption: boolean;
  showAutoSaved: boolean;
  templateText: any;
  templateId: any;
  usingTemplate: boolean;
  responseVisibility: any;
  customStyleAdded: any;
  responseFeedback: any;
  showConfirmEmailModal: boolean;
  showError: boolean;
  responseSubmitLoading: boolean;
  scrollToError: any;
  authModal = false;
  isConfirmModal = false;
  isResponseShort = false;
  confirmMessage = {
    msg: 'Do you want to reconsider your response? We detected some potentially harmful language, and to keep Civis safe and open we recommend revising responses that were detected as potentially harmful.',
    title: ''
  };
  responseMessage = {
      msg: 'We detected that your response is too short. Please refer to other responses for more detailed output.',
      title: ''
    };
  nudgeMessageDisplayed = false;
  nudgeShortMessageDisplayed = false;
  profanityCount: any;
  shortResponseCount: any;
  userData:any;
  profanity_count_changed: boolean=false;
  short_response_count_changed: boolean=false;
  isUserResponseProfane: boolean=false;
  isApproved = 0;

  constructor(
    private userService: UserService,
    private consultationService: ConsultationsService,
    private router: Router,
    private el: ElementRef,
    private apollo: Apollo,
    private sanitizer: DomSanitizer,
    private errorService: ErrorService
  ) {
    this.consultationService.consultationId$
      .pipe(filter((i) => i !== null))
      .subscribe((consulationId: any) => {
        this.consultationId = consulationId;
      });
  }

  ngOnInit(): void {
    this.getCurrentUser();
    this.subscribeUseTheResponseText();
    this.getResponseText();
    this.createResponse();
  }

  ngAfterViewChecked() {
    this.editIframe();
    if (this.scrollToError) {
      scrollToFirstError('.error-msg', this.el.nativeElement);
      this.scrollToError = false;
    }
  }

  createResponse() {
    this.consultationService.submitResponseText.subscribe((status) => {
      if (status) {
        this.submitAnswer();
        if (this.responseIndex) {
          window.scrollTo({
            top: this.responseIndex.nativeElement.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      }
    });
  }

  subscribeProfileData() {
    this.consultationService.consultationProfileData.subscribe((data) => {
      if (data) {
        this.profileData = data;
      }
    });
  }

  getConsultationResponse() {
    const consultationResponse = {
      consultationId: this.consultationId,
      visibility: this.responseVisibility ? 'shared' : 'anonymous',
      responseText: this.responseText,
      isApproved: this.isApproved,
      satisfactionRating: this.responseFeedback,
    };
    if (checkPropertiesPresence(consultationResponse)) {
      consultationResponse['templateId'] = this.templateId
        ? this.templateId
        : null;
      return consultationResponse;
    }
    return;
  }

  getCurrentUser() {
    this.userService.userLoaded$.subscribe((data) => {
      if (data) {
        this.currentUser = this.userService.currentUser;
      } else {
        this.currentUser = null;
      }
    });
  }

  getResponseText() {
    let draftObj: any = localStorage.getItem('responseDraft');
    if (draftObj && !isObjectEmpty(draftObj)) {
      draftObj = JSON.parse(draftObj);
      let currentUser: any;
      if (draftObj.users && draftObj.users.length > 0) {
        currentUser = draftObj.users.find(
          (user) =>
            user.id === (this.currentUser ? this.currentUser.id : 'guest')
        );
      }
      if (currentUser) {
        const consultation = currentUser.consultations.find(
          (item) => item.id === this.consultationId
        );
        if (consultation) {
          this.responseText = consultation.responseText;
          if (consultation.templatesText) {
            this.showPublicResponseOption = false;
          }
        }
      }
    }
  }

  editIframe() {
    const editorElement = document.getElementById('editor-container');
    if (editorElement) {
      const iFrameElements = editorElement.getElementsByTagName('iframe');
      if (iFrameElements.length) {
       const doc = iFrameElements[0].contentDocument;
       const checkElementExist = setInterval(() => {
         if (!this.customStyleAdded) {
          if (doc.body) {
            this.customStyleAdded = true;
            doc.body.setAttribute('style', 'margin: 0; font-size: 16px');
          }
         }
       }, 100);
       if (this.customStyleAdded) {
         clearInterval(checkElementExist);
       }
      }
    }
  }

  onResponseTextChange(value) {
    if (!value) {
      return;
    } else {
      if (this.usingTemplate) {
        this.responseText = this.templateText = value;
        this.usingTemplate = this.showPublicResponseOption = false;
        this.autoSave(value);
      }
      if (this.templateText && value === this.templateText) {
        this.showPublicResponseOption = false;
      } else {
        this.showPublicResponseOption = true;
      }
      return;
    }
  }

  autoSave(text) {
    if (text) {
      this.showAutoSaved = true;
      let draftObj: any = localStorage.getItem('responseDraft');
      if (!draftObj || isObjectEmpty(draftObj)) {
        draftObj = {};
        draftObj['users'] = [
          {
            id: this.currentUser ? this.currentUser.id : 'guest',
            consultations: [
              {
                id: this.consultationId,
                responseText: text,
                templatesText: this.showPublicResponseOption ? false : true,
              },
            ],
          },
        ];
      } else {
        draftObj = JSON.parse(draftObj);
        let currentUser: any;
        if (draftObj.users) {
          currentUser = draftObj.users.find(
            (user) =>
              user.id === (this.currentUser ? this.currentUser.id : 'guest')
          );
        }
        if (currentUser) {
          const consultation = currentUser.consultations.find(
            (item) => item.id === this.consultationId
          );
          if (consultation) {
            currentUser.consultations.forEach((item) => {
              if (+item.id === +this.consultationId) {
                item.responseText = text;
                item['templatesText'] = this.showPublicResponseOption
                  ? false
                  : true;
              }
            });
          } else {
            currentUser.consultations.push({
              id: this.consultationId,
              responseText: text,
              templatesText: this.showPublicResponseOption ? false : true,
            });
          }
          draftObj.users.forEach((item) => {
            if (
              item.id === (this.currentUser ? this.currentUser.id : 'guest')
            ) {
              item = currentUser;
            }
          });
        } else {
          if (draftObj.users) {
            draftObj.users.push({
              id: this.currentUser ? this.currentUser.id : 'guest',
              consultations: [
                {
                  id: this.consultationId,
                  responseText: text,
                  templatesText: this.showPublicResponseOption ? false : true,
                },
              ],
            });
          }
        }
      }
      localStorage.setItem('responseDraft', JSON.stringify(draftObj || ''));
      setTimeout(() => {
        this.showAutoSaved = false;
      }, 1250);
    }
  }

  subscribeUseTheResponseText() {
    this.consultationService.useThisResponseText.subscribe((obj: any) => {
      if (obj && !isObjectEmpty(obj)) {
        this.usingTemplate = true;
        const { responseText, templateId } = obj;
        this.responseText = this.templateText = responseText;
        this.templateId = templateId;
        this.customStyleAdded = false;
        this.editIframe();
        window.scrollTo({
          top: this.responseIndex.nativeElement.offsetTop - 80,
          behavior: 'smooth',
        });
      }
    });
  }

  scrollToResponses() {
    this.consultationService.scrollToPublicResponse.next(true);
  }

  validCurrentUser() {
    if (this.currentUser && !this.currentUser.confirmedAt) {
      this.showConfirmEmailModal = true;
      return false;
    }
    return true;
  }

  urlToText(text: string): string {
    if (text) {
      const str: any =  text.replace(/<\/?[^>]+(>|$)/g, '');
      return str.replaceAll('&nbsp;', '').trim();
    } else {
      return '';
    }
  }

  submitAnswer() {
    if (this.responseSubmitLoading) {
      return;
    }
    let responseTextString: any = this.sanitizer.bypassSecurityTrustHtml(
      this.responseText
    );
    responseTextString =
      responseTextString.changingThisBreaksApplicationSecurity;
    if (this.urlToText(responseTextString).length <= 0) {
      this.responseText = null;
      this.showError = true;
      return;
    }
    if (this.responseText && this.responseFeedback) {
      const consultationResponse = this.getConsultationResponse();
      if (!isObjectEmpty(consultationResponse)) {
        if (this.currentUser) {
          this.apollo.watchQuery({
            query: UserCountUser,
            variables: {userId:this.currentUser.id},
            fetchPolicy:'no-cache'
          })
          .valueChanges
          .pipe (
            map((res: any) => res.data.userCountUser)
          )
          .subscribe(data => {
            if(!this.profanity_count_changed || !this.short_response_count_changed){
              this.userData=data;
              this.updateProfanityCount();
            }
          }, err => {
            const e = new Error(err);
            this.errorService.showErrorModal(err);
          });
        } else {
          this.authModal = true;
          // localStorage.setItem(
          //   'consultationResponse',
          //   JSON.stringify(consultationResponse)
          // ); //TODO
        }
      }
    } else {
      if (!this.responseFeedback) {
        this.consultationService.satisfactionRatingError.next(true);
      }
      this.showError = true;
      this.scrollToError = true;
    }
  }

  updateResponseCount(){
    if (this.userData!==null){
      this.shortResponseCount=this.userData.shortResponseCount;
    }
    else{
      this.shortResponseCount=0;
      if((this.responseText.length - 8) <= 50){
        if (!this.nudgeShortMessageDisplayed) {
          this.isResponseShort = true;
          this.nudgeShortMessageDisplayed=true;
          return;
        }
        this.shortResponseCount+=1;
        this.isApproved=+1;
      }
      this.apollo.mutate({
        mutation: CreateUserCountRecord,
        variables:{
          userCount:{
            userId: this.currentUser.id,
            profanityCount: 0,
            shortResponseCount: this.shortResponseCount
          }
        },
      })
      .subscribe((data) => {
         this.invokeSubmitResponse();
      }, err => {
        this.errorService.showErrorModal(err);
      });
      this.short_response_count_changed=true;
      return;
      }

    if((this.responseText.length - 8) <= 50) {
      if (!this.nudgeShortMessageDisplayed && this.shortResponseCount>2) {
        this.isResponseShort = true;
        this.nudgeShortMessageDisplayed=true;
        return;
      }
      this.shortResponseCount+=1;
      this.isApproved=+1;

      this.apollo.mutate({
        mutation: UpdateUserCountRecord,
        variables:{
          userCount:{
          userId: this.currentUser.id,
          profanityCount: this.userData.profanityCount,
          shortResponseCount: this.shortResponseCount
          }
        },
      })
      .subscribe((data) => {
        this.invokeSubmitResponse();
      }, err => {
        this.errorService.showErrorModal(err);
      });
      this.short_response_count_changed=true;
    } else {
      this.shortResponseCount=0;
      this.apollo.mutate({
        mutation: UpdateUserCountRecord,
        variables:{
          userCount:{
            userId: this.currentUser.id,
            profanityCount: this.userData.profanityCount,
            shortResponseCount: this.shortResponseCount
          }
        },
      })
      .subscribe((data) => {
        this.invokeSubmitResponse();
      }, err => {
        this.errorService.showErrorModal(err);
      });
      this.short_response_count_changed=true;
      return;
    }
  }

  updateProfanityCount(){
    var Filter = require('bad-words'),
    filter = new Filter();
    filter.addWords('4r5e','5h1t','5hit','a55','anal','anus','ar5e','arrse','arse','ass','ass-fucker','asses','assfucker','assfukka','asshole','assholes','asswhole','a_s_s','b!tch','b00bs','b17ch','b1tch','ballbag','balls','ballsack','bastard','beastial','beastiality','bellend','bestial','bestiality','bi+ch','biatch','bitch','bitcher','bitchers','bitches','bitchin','bitching','bloody','blow job','blowjob','blowjobs','boiolas','bollock','bollok','boner','boob','boobs','booobs','boooobs','booooobs','booooooobs','breasts','buceta','bugger','bum','bunny fucker','butt','butthole','buttmunch','buttplug','c0ck','c0cksucker','carpet muncher','cawk','chink','cipa','cl1t','clit','clitoris','clits','cnut','cock','cock-sucker','cockface','cockhead','cockmunch','cockmuncher','cocks','cocksuck','cocksucked','cocksucker','cocksucking','cocksucks','cocksuka','cocksukka','cok','cokmuncher','coksucka','coon','cox','crap','cum','cummer','cumming','cums','cumshot','cunilingus','cunillingus','cunnilingus','cunt','cuntlick','cuntlicker','cuntlicking','cunts','cyalis','cyberfuc','cyberfuck','cyberfucked','cyberfucker','cyberfuckers','cyberfucking','d1ck','damn','dick','dickhead','dildo','dildos','dink','dinks','dirsa','dlck','dog-fucker','doggin','dogging','donkeyribber','doosh','duche','dyke','ejaculate','ejaculated','ejaculates','ejaculating','ejaculatings','ejaculation','ejakulate','f u c k','f u c k e r','f4nny','fag','fagging','faggitt','faggot','faggs','fagot','fagots','fags','fanny','fannyflaps','fannyfucker','fanyy','fatass','fcuk','fcuker','fcuking','feck','fecker','felching','fellate','fellatio','fingerfuck','fingerfucked','fingerfucker','fingerfuckers','fingerfucking','fingerfucks','fistfuck','fistfucked','fistfucker','fistfuckers','fistfucking','fistfuckings','fistfucks','flange','fook','fooker','fuck','fucka','fucked','fucker','fuckers','fuckhead','fuckheads','fuckin','fucking','fuckings','fuckingshitmotherfucker','fuckme','fucks','fuckwhit','fuckwit','fudge packer','fudgepacker','fuk','fuker','fukker','fukkin','fuks','fukwhit','fukwit','fux','fux0r','f_u_c_k','gangbang','gangbanged','gangbangs','gaylord','gaysex','goatse','God','god-dam','god-damned','goddamn','goddamned','hardcoresex','hell','heshe','hoar','hoare','hoer','homo','hore','horniest','horny','hotsex','jack-off','jackoff','jap','jerk-off','jism','jiz','jizm','jizz','kawk','knob','knobead','knobed','knobend','knobhead','knobjocky','knobjokey','kock','kondum','kondums','kum','kummer','kumming','kums','kunilingus','l3i+ch','l3itch','labia','lmfao','lust','lusting','m0f0','m0fo','m45terbate','ma5terb8','ma5terbate','masochist','master-bate','masterb8','masterbat*','masterbat3','masterbate','masterbation','masterbations','masturbate','mo-fo','mof0','mofo','mothafuck','mothafucka','mothafuckas','mothafuckaz','mothafucked','mothafucker','mothafuckers','mothafuckin','mothafucking','mothafuckings','mothafucks','mother fucker','motherfuck','motherfucked','motherfucker','motherfuckers','motherfuckin','motherfucking','motherfuckings','motherfuckka','motherfucks','muff','mutha','muthafecker','muthafuckker','muther','mutherfucker','n1gga','n1gger','nazi','nigg3r','nigg4h','nigga','niggah','niggas','niggaz','nigger','niggers','nob','nob jokey','nobhead','nobjocky','nobjokey','numbnuts','nutsack','orgasim','orgasims','orgasm','orgasms','p0rn','pawn','pecker','penis','penisfucker','phonesex','phuck','phuk','phuked','phuking','phukked','phukking','phuks','phuq','pigfucker','pimpis','piss','pissed','pisser','pissers','pisses','pissflaps','pissin','pissing','pissoff','poop','porn','porno','pornography','pornos','prick','pricks','pron','pube','pusse','pussi','pussies','pussy','pussys','rectum','retard','rimjaw','rimming','s hit','s.o.b.','sadist','schlong','screwing','scroat','scrote','scrotum','semen','sex','sh!+','sh!t','sh1t','shag','shagger','shaggin','shagging','shemale','shi+','shit','shitdick','shite','shited','shitey','shitfuck','shitfull','shithead','shiting','shitings','shits','shitted','shitter','shitters','shitting','shittings','shitty','skank','slut','sluts','smegma','smut','snatch','son-of-a-bitch','spac','spunk','s_h_i_t','t1tt1e5','t1tties','teets','teez','testical','testicle','tit','titfuck','tits','titt','tittie5','tittiefucker','titties','tittyfuck','tittywank','titwank','tosser','turd','tw4t','twat','twathead','twatty','twunt','twunter','v14gra','v1gra','vagina','viagra','vulva','w00se','wang','wank','wanker','wanky','whoar','whore','willies','willy','xrated','xxx','baap ke lavde','chodu','chodoo','choodu','gandu','gaandu','gandoo','bhosad','bhosada','bhosadaa','bhosadaaa','bhosadii','bhosadika','bhosadike','bhosadiki','bosadike','bakrichod','balatkaar','behen ke laude','betichod','bhai chhod','bhayee chod','bhen chhod','bhaynchod','behanchod','behenchod','bhen ke lode','bhosdi','bhosdike','chipkai ki choot ke paseene','cha cha chod','chod ke bal ka kida','chopre he randi','chudasi','chut ka maindak','chutia','chutiya','chootia','chutiye','dheeli choot','choot','chootiya','gaand chaat mera','gaand','gaand ka khadda','gaand ke dhakan','gaand mein kida','gandi chut mein sadta hua ganda kida','gandmasti','jhaat ke baal','jhat lahergaya','jhatoo','jhantu','kukarchod','kutha sala','kuthta buraanahe kandaa nahi pattaahe','lode jesi shakal ke','lode ke baal','lund khajoor','lund chuse','lund','luhnd','lundh','madar chod','maadarchod','maadar','madar','chod','madarchod','madarchod ke aulaad','mader chod','mai chod','mera mume le','mere fudi kha ley','meri ghand ka baal','randi','randi ka choda','suzit','sust lund ki padaish','tatti ander lele','tere baap ki gaand','teri chute mai chuglee','teri gaand mein haathi ka lund','teri maa ki choot','teri maa ki sukhi bhos','teri phuphi ki choot mein','teri bhosri mein aag','teri gaand me danda','teri ma ki choot me bara sa land','teri ma ki chudaye bandar se hui','teri ma randi','teri maa ke bable','teri maa ke bhosade ke baal','tu tera maa ka lauda','amma ki chut','bhaand me jaao','bhadva','bhadve','chodika','bhadwe ki nasal','bhen ke lode maa chuda','bhosad chod','bhosadchod','bhosadi ke','bhosdee kay','bhosdi k','bulle ke baal','bursungha','camina','chod bhangra','choot k bhoot','choot k pakode','choot ka paani','choot ka pissu','choot ki jhilli','chudpagal','chut ke makkhan','chootiye','gaand maar bhen chod','gand mein louda','gandi fuddi ki gandi auladd','haram zaadaa','harami','jhaat','kaala lund','kaali kutti','kuthri','kutte','kutte ki olad','lavde ka baal','lavde','lodu','lowde ka bal','lund k laddu','lund mera muh tera','maa-cho','maal chhodna','mahder chod','mera gota moo may lay','mome ka pasina chat','moo may lay mera','padosi ki aulaad','rand ki moot','randi baj','randi ka larka','randi ke bacche','randi ke beej','saale lm','sab ka lund teri ma ki chut mein','sinak se paida hua','suvar chod','suwar ki aulad','tera gittha','tere maa ka bur','teri behen ka bhosda faadu','teri gand mai ghadhe ka lund','teri ma bahar chud rahi he','teri ma ko kutta chode','teri maa ka bhosra','teri maa ka boba chusu','teri maa ki choot me kutte ka lavda','teri maa ki chut','teri maa ki chute','tuzya aaichi kanda puchi','bhadavya','bhikaar','bulli','chinaal','chut','gand','maadarbhagat','chodubhagat','lundfakir','gandit','jhavadya','laudu','lavadya','muttha','raandichya','madarchoth');
    filter.addWords('baap ke lavde','chodu','chodoo','choodu','gandu','gaandu','gandoo','bhosad','bhosada','bhosadaa','bhosadaaa','bhosadii','bhosadika','bhosadike','bhosadiki','bosadike','bakrichod','balatkaar','behen ke laude','betichod','bhai chhod','bhayee chod','bhen chhod','bhaynchod','behanchod','behenchod','bhen ke lode','bhosdi','bhosdike','chipkai ki choot ke paseene','cha cha chod','chod ke bal ka kida','chopre he randi','chudasi','chut ka maindak','chutia','chutiya','chootia','chutiye','dheeli choot','choot','chootiya','gaand chaat mera','gaand','gaand ka khadda','gaand ke dhakan','gaand mein kida','gandi chut mein sadta hua ganda kida','gandmasti','jhaat ke baal','jhat lahergaya','jhatoo','jhantu','kukarchod','kutha sala','kuthta buraanahe kandaa nahi pattaahe','lode jesi shakal ke','lode ke baal','lund khajoor','lund chuse','lund','luhnd','lundh','madar chod','maadarchod','maadar','madar','chod','madarchod','madarchod ke aulaad','mader chod','mai chod','mera mume le','mere fudi kha ley','meri ghand ka baal','randi','randi ka choda','suzit','sust lund ki padaish','tatti ander lele','tere baap ki gaand','teri chute mai chuglee','teri gaand mein haathi ka lund','teri maa ki choot','teri maa ki sukhi bhos','teri phuphi ki choot mein','teri bhosri mein aag','teri gaand me danda','teri ma ki choot me bara sa land','teri ma ki chudaye bandar se hui','teri ma randi','teri maa ke bable','teri maa ke bhosade ke baal','tu tera maa ka lauda','amma ki chut','bhaand me jaao','bhadva','bhadve','chodika','bhadwe ki nasal','bhen ke lode maa chuda','bhosad chod','bhosadchod','bhosadi ke','bhosdee kay','bhosdi k','bulle ke baal','bursungha','camina','chod bhangra','choot k bhoot','choot k pakode','choot ka paani','choot ka pissu','choot ki jhilli','chudpagal','chut ke makkhan','chootiye','gaand maar bhen chod','gand mein louda','gandi fuddi ki gandi auladd','haram zaadaa','harami','jhaat','kaala lund','kaali kutti','kuthri','kutte','kutte ki olad','lavde ka baal','lavde','lodu','lowde ka bal','lund k laddu','lund mera muh tera','maa-cho','maal chhodna','mahder chod','mera gota moo may lay','mome ka pasina chat','moo may lay mera','padosi ki aulaad','rand ki moot','randi baj','randi ka larka','randi ke bacche','randi ke beej','saale lm','sab ka lund teri ma ki chut mein','sinak se paida hua','suvar chod','suwar ki aulad','tera gittha','tere maa ka bur','teri behen ka bhosda faadu','teri gand mai ghadhe ka lund','teri ma bahar chud rahi he','teri ma ko kutta chode','teri maa ka bhosra','teri maa ka boba chusu','teri maa ki choot me kutte ka lavda','teri maa ki chut','teri maa ki chute','tuzya aaichi kanda puchi','bhadavya','bhikaar','bulli','chinaal','chut','gand','maadarbhagat','chodubhagat','lundfakir','gandit','jhavadya','laudu','lavadya','muttha','raandichya','madarchoth');
    this.isUserResponseProfane=filter.isProfane(this.responseText);

    if (this.userData!==null){
      this.profanityCount=this.userData.profanityCount;
    }
    else{
      this.profanityCount=0;
      if(this.isUserResponseProfane){
        if (!this.nudgeMessageDisplayed) {
          this.isConfirmModal = true;
          this.nudgeMessageDisplayed=true;
          return;
        }
        this.profanityCount+=1;
        this.isApproved=+1;
      }
      this.apollo.mutate({
        mutation: CreateUserCountRecord,
        variables:{
          userCount:{
            userId: this.currentUser.id,
            profanityCount: this.profanityCount,
            shortResponseCount: 0
          }
        },
      })
      .subscribe((data) => {
        if(this.profanityCount == 0 ){
          this.updateResponseCount();
        } else {
          this.invokeSubmitResponse();
        }
      }, err => {
        this.errorService.showErrorModal(err);
      });
      this.profanity_count_changed=true;
      return;
    }

    if(this.isUserResponseProfane){
      if (!this.nudgeMessageDisplayed) {
        this.isConfirmModal = true;
        this.nudgeMessageDisplayed=true;
        return;
      }
      this.profanityCount+=1;
      this.isApproved=+1;
      if(this.profanityCount>=3){
        this.confirmMessage.msg = 'We detected that your response may contain harmful language. This response will be moderated and sent to the Government at our moderator\'s discretion.'
        this.isConfirmModal = true;
      }
    }
    else{
      this.updateResponseCount();
      return;
    }

    this.apollo.mutate({
      mutation: UpdateUserCountRecord,
      variables:{
        userCount:{
          userId: this.currentUser.id,
          profanityCount: this.profanityCount,
          shortResponseCount: this.userData.shortResponseCount
        }
       },
    })
    .subscribe((data) => {
      this.invokeSubmitResponse();
    }, err => {
      this.errorService.showErrorModal(err);
    });
    this.profanity_count_changed=true;
  }

  confirmed(event) {
    this.isConfirmModal = false;
    this.isResponseShort = false;
  }

  invokeSubmitResponse(){
    const consultationResponse = this.getConsultationResponse();
    this.submitResponse(consultationResponse);
    this.showError = false;
  }

  submitResponse(consultationResponse) {
    this.responseSubmitLoading = true;
    this.apollo
      .mutate({
        mutation: SubmitResponseQuery,
        variables: {
          consultationResponse: consultationResponse,
        },
        update: (store, { data: res }) => {
          const variables = { id: this.consultationId };
          const resp: any = store.readQuery({
            query: ConsultationProfileCurrentUser,
            variables,
          });
          if (res) {
            resp.consultationProfile.respondedOn =
              res.consultationResponseCreate.consultation.respondedOn;
            resp.consultationProfile.sharedResponses =
              res.consultationResponseCreate.consultation.sharedResponses;
            resp.consultationProfile.responseSubmissionMessage =
              res.consultationResponseCreate.consultation.responseSubmissionMessage;
            resp.consultationProfile.satisfactionRatingDistribution =
              res.consultationResponseCreate.consultation.satisfactionRatingDistribution;
          }
          store.writeQuery({
            query: ConsultationProfileCurrentUser,
            variables,
            data: resp,
          });
        },
      })
      .pipe(map((res: any) => res.data.consultationResponseCreate))
      .subscribe(
        (res) => {
          this.openThankYouModal.emit(res.points);
        },
        (err) => {
          this.responseSubmitLoading = false;
          this.errorService.showErrorModal(err);
        }
      );
  }
}
