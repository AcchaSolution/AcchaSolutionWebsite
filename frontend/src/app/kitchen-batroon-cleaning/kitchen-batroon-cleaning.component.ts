import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-kitchen-batroon-cleaning',
  standalone: true,
  imports: [],
  templateUrl: './kitchen-batroon-cleaning.component.html',
  styleUrl: './kitchen-batroon-cleaning.component.css'
})
export class KitchenBatroonCleaningComponent implements AfterViewInit {

  @ViewChild('heroVideo')
  heroVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    this.heroVideo.nativeElement.playbackRate = 0.7; // Slow motion
  
    const videos = document.querySelectorAll<HTMLVideoElement>('.auto-play-video');

    const observer = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        const video = entry.target as HTMLVideoElement;

        if (entry.isIntersecting) {

          video.play();

        } else {

          video.pause();

        }

      });

    }, {
      threshold: 0.5
    });

    videos.forEach(video => observer.observe(video));

  }


}