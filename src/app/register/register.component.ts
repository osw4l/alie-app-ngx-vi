import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ApiService} from '../services/api.service';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

declare var jquery: any;
declare var $: any;
declare var swal: any;

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
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
  private date: any;

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
  }


  constructor(private api: ApiService) {
    this.form = new FormGroup({
      first_name: new FormControl(),
      last_name: new FormControl(),
      dni: new FormControl(),
      date: new FormControl(),
      cover: new FormControl(),
      back_cover: new FormControl(),
    });
  }

  onFileChange(event, type) {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.form.get(type).setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result.split(',')[1]
        });
      };
    }
  }

  formGet(key) {
    return this.form.get(key).value;
  }

  onSubmit() {

    if (
      this.formGet('first_name') &&
      this.formGet('last_name') &&
      this.formGet('dni') &&
      this.formGet('date') &&
      this.formGet('cover') &&
      this.formGet('back_cover')  && !this.showWebcam
    ) {
      const data = {
      'first_name': this.formGet('first_name'),
      'last_name': this.formGet('last_name'),
      'dni': this.formGet('dni'),
      'date': this.formGet('date'),
      'cover': this.formGet('cover'),
      'back_cover': this.formGet('back_cover'),
      'cam_photo': this.webcamImage.imageAsBase64
    };
    console.log(data);

    this.api.sendDataUser(data).subscribe(
      (d) => {
        if (!d['success']) {
          if (d['dni_not_match']) {
            this.swal2(
              d['mensaje'],
              `${d['id_1']} no coincide con ${d['id_2']}`,
              'error'
            );
          } else {
            this.swal2(
              'Error de registro',
              d['mensaje'],
              'error'
            );
          }
        } else {
          this.swal2(
            'Excelente',
            d['mensaje'],
            'success'
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      },
      (err) => {
        this.swal2(
          'Error al registrarse',
          'se ha presentado un error interno del servidor, vuelta a intentarlo nuevamente',
          'error'
        );
      });
    } else {
      this.swal2(
        'Error de registro',
        'complete todos los campos del formulario',
        'error');
    }
  }

  public triggerSnapshot(): void {
    this.showWebcam = !this.showWebcam;
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

  public swal2(title, message, type): void {
    swal(
      title,
      message,
      type
    );
  }
}
