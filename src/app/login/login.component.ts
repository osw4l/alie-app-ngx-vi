import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ApiService} from '../services/api.service';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

declare var jquery: any;
declare var $: any;
declare var swal: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // toggle webcam on/off
  public showWebcam = true;
  public login_success = false;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public cc: string;
  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];
  // latest snapshot
  public webcamImage: WebcamImage = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  public dni_back: any;
  public dni_front: any;
  public photo: any;
  public full_name: any;
  public loading: any;
  public date: any;
  public dni: any;
  public check_face_callback = null;
  @Input() sign_in: boolean;
  @Output() setHidden: EventEmitter<any> = new EventEmitter<any>();

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }

  constructor(private api: ApiService) {
  }

  public triggerSnapshot() {
    this.showWebcam = !this.showWebcam;
    console.log(this.webcamImage);
    this.trigger.next();
  }

  public captureCamera() {
    console.log(this.webcamImage);
    this.trigger.next();
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }


  public handleImage(webcamImage: WebcamImage): void {
    this.webcamImage = webcamImage;
    console.log(this.webcamImage);
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  public setCc(event): void {
    this.cc = event.target.value;
  }

  public tryToLogin(): void {
    this.loading = true;
    this.api.login({
      'cc': this.cc,
      'photo': this.webcamImage.imageAsBase64
    }).subscribe((data) => {
        this.loading = false;
        if (data['success']) {
          this.loading = false;
          this.login_success = true;
          this.dni_back = this.getPath(data['dni_back']);
          this.dni_front = this.getPath(data['dni_front']);
          this.photo = this.getPath(data['photo']);
          this.full_name = data['full_name'];
          this.dni = data['dni'];
          this.date = data['date'];
          this.swal2(
            'Bienvenido ' + this.full_name,
            data['mensaje'],
            'success'
          );
          this.setHidden.emit(true);
          this.checkLoginListener();
        } else {
          this.login_success = false;
          this.swal2(
            'Error al conectarse',
            data['mensaje'],
            'error'
          );
        }
      },
      (err) => {
        this.loading = false;
        this.swal2(
          'Error 500',
          'Error interno del servidor, intente nuevamente',
          'error');
      });
  }

  public swal2(title, message, type): void {
    swal(
      title,
      message,
      type
    );
  }

  public checkLoginListener() {
    console.log('run listener');
    this.check_face_callback = setInterval(this.validateLogin, 2000);
  }

  public validateLogin = () => {
    console.log('check login');
    this.trigger.next();
    this.api.checkFace({
      'cc': this.cc,
      'photo': this.webcamImage.imageAsBase64
    }).subscribe((data) => {
      if (data['pass'] === false) {
        this.stopCheckFaceCallback();
        this.swal2(
          'Rostro invalido',
          'este rostro no corresponde a la sesion actual, por seguridad se desconectara en 5 segundos',
          'warning');
        setTimeout(() => {
          this.resetSesionData();
        }, 5000);
      }
    });
  }

  public getPath(path) {
    return 'http://localhost:8000' + path;
  }

  public stopCheckFaceCallback() {
    clearInterval(this.check_face_callback);
  }

  public resetSesionData() {
    this.setHidden.emit(false);
    this.login_success = false;
    this.webcamImage = null;
    this.dni_back = null;
    this.dni_front = null;
    this.photo = null;
    this.full_name = null;
    this.loading = null;
    this.showWebcam = true;
  }

  public logout() {
    this.stopCheckFaceCallback();
    this.resetSesionData();
  }

}
