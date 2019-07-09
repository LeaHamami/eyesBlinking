import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {OpenWebService} from '../open-web.service';
import * as faceapi from 'face-api.js';
import {from, Observable} from 'rxjs';
import { formatNumber } from '@angular/common';
import { IblinkPoint } from 'src/app/iblink-point';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-open-web-cam',
  templateUrl: './open-web-cam.component.html',
  styleUrls: ['./open-web-cam.component.scss']
})
export class OpenWebCamComponent implements OnInit {

  @ViewChild('canvas')
  canvas: ElementRef;
  blinkLeft: number;
  blinkRight: number;
  video: HTMLVideoElement;
  blinkCounter = 0;
  // blinkLeftEye = 0;
  startDate = new Date();
  endDate = new Date();
  time = '00:00:00';
  blinksPointArr: IblinkPoint[] = [{startDate: this.startDate, endDate: this.endDate, blinkCounter: 0}];
  timeCounter = 0 ;
  message = 'time to work';
  blinkTimeArry: Date[] = [new Date()];
  i = 0;

  constructor(private openWebService: OpenWebService) {
    OpenWebService.loadModels();
  }

  ngOnInit() {
    this.video = document.querySelector('video');
    this.startVideo(this.video);
    console.log(faceapi.nets);
    this.drawFace(this.video);

  }

  private startVideo(video: HTMLVideoElement) {
    const constraints = {video: true};
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      video.srcObject = stream;
    });
  }

  private drawFace(video: HTMLVideoElement) {

    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');

    const displaySize = {width: video.width, height: video.height};
    const f = faceapi.matchDimensions(canvas, displaySize);
   // console.log(f);

    setInterval(async () => {
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      const leftEye = detections.landmarks.getLeftEye();
      const rightEye = detections.landmarks.getRightEye();
      this.detectEyeBlink(leftEye, rightEye);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      const date = new Date();
      if (date.getMinutes() - this.startDate.getMinutes() > 0) {
       // if (date.getHours() - this.startDate.getHours() >= 1) {
        this.resetCounters();
     // }
      }

    }, 100);
  }

  private detectEyeBlink(leftEye: any[], rightEye: any[]) {
    this.blinkLeft = OpenWebService.findBlinking(leftEye);
    this.blinkRight = OpenWebService.findBlinking(rightEye);
    if (this.blinkLeft < 0.3 && this.blinkRight < 0.3) {
      this.blinkCounter++;
      const blinkDate = new Date();
      this.blinkTimeArry.push(blinkDate);
      const l = this.blinkTimeArry.length;
      const prevTime = this.blinkTimeArry[l - 2].getSeconds();
      const crntDate = this.blinkTimeArry[l - 1].getSeconds();
       // console.log(currentTime);
      const diffTime = Math.abs(crntDate - prevTime);
       // console.log(diffTime);
      if (diffTime <= 20) {
          this.timeCounter++;
        }
      if (this.timeCounter >= 3 ) {
          this.message = 'please go to sleep';
          // this.playAudio();
        }
    }
  }
  private resetCounters() {
    this.blinksPointArr[this.i].blinkCounter = this.blinkCounter;
    this.blinksPointArr[this.i].endDate = new Date();
    this.blinksPointArr.push({startDate: new Date(), endDate: new Date(), blinkCounter: 0});
    this.startDate = new Date();
    this.blinkCounter = 0;
    this.timeCounter = 0;
    this.i++;
  }

  playAudio() {
    const audio = new Audio();
    audio.src = '../../../assets/02 תוכו רצוף אהבה.mp3';
    audio.load();
    audio.play();
  }

  goToGraphs()  {
     this.openWebService.setBlinksData(this.blinksPointArr);
    }
}
