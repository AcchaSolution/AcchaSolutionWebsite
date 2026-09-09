import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements AfterViewInit, OnDestroy {

  @ViewChild('particleCanvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private animationId!: number;

  private particles: Particle[] = [];

  private mouse = {
    x: -1000,
    y: -1000,
    active: false
  };

  private particleCount = 150;

  private connectionDistance = 145;

  private mouseRadius = 150;

  private resizeHandler!: () => void;

  private mouseMoveHandler!: (event: MouseEvent) => void;

  private mouseLeaveHandler!: () => void;


  /* =========================================================
     INIT
  ========================================================= */

  ngAfterViewInit(): void {

    setTimeout(() => {

      this.initSpiderWeb();

    }, 0);

  }


  /* =========================================================
     INITIALIZE
  ========================================================= */

  private initSpiderWeb(): void {

    this.canvas = this.canvasRef.nativeElement;

    const context = this.canvas.getContext('2d');

    if (!context) {
      return;
    }

    this.ctx = context;

    this.resizeCanvas();

    this.createParticles();

    this.addEvents();

    this.animate();

  }


  /* =========================================================
     RESIZE CANVAS
  ========================================================= */

  private resizeCanvas(): void {

    const hero =
      this.canvas.closest(
        '.portfolio-hero'
      ) as HTMLElement;

    if (!hero) {
      return;
    }

    const rect =
      hero.getBoundingClientRect();

    const dpr =
      window.devicePixelRatio || 1;

    this.canvas.width =
      rect.width * dpr;

    this.canvas.height =
      rect.height * dpr;

    this.canvas.style.width =
      `${rect.width}px`;

    this.canvas.style.height =
      `${rect.height}px`;

    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    this.canvas._displayWidth =
      rect.width;

    this.canvas._displayHeight =
      rect.height;

    /*
      Particles ko resize ke baad screen ke
      poore banner mein distribute karna
    */

    if (this.particles.length > 0) {

      for (const particle of this.particles) {

        particle.x =
          Math.min(
            particle.x,
            rect.width
          );

        particle.y =
          Math.min(
            particle.y,
            rect.height
          );

      }

    }

  }


  /* =========================================================
     CREATE PARTICLES
  ========================================================= */

  private createParticles(): void {

    this.particles = [];

    const width =
      this.canvas._displayWidth;

    const height =
      this.canvas._displayHeight;


    /*
      FULL BANNER PARTICLES

      Important:
      x/y poore hero ke width/height mein
      random create honge.
    */

    for (
      let i = 0;
      i < this.particleCount;
      i++
    ) {

      this.particles.push({

        x:
          Math.random() * width,

        y:
          Math.random() * height,

        baseX:
          Math.random() * width,

        baseY:
          Math.random() * height,

        vx:
          (Math.random() - 0.5) * 0.25,

        vy:
          (Math.random() - 0.5) * 0.25,

        size:
          Math.random() * 1.8 + 0.8,

        opacity:
          Math.random() * 0.55 + 0.25

      });

    }

  }


  /* =========================================================
     EVENTS
  ========================================================= */

  private addEvents(): void {

    /*
      Window resize
    */

    this.resizeHandler = () => {

      this.resizeCanvas();

    };

    window.addEventListener(
      'resize',
      this.resizeHandler
    );


    /*
      MOUSE MOVE

      IMPORTANT:
      cursor coordinates ko
      canvas/hero ke coordinates mein
      convert kar rahe hain.
    */

    this.mouseMoveHandler =
      (event: MouseEvent) => {

        const rect =
          this.canvas.getBoundingClientRect();


        this.mouse.x =
          event.clientX - rect.left;

        this.mouse.y =
          event.clientY - rect.top;

        this.mouse.active = true;

      };


    window.addEventListener(
      'mousemove',
      this.mouseMoveHandler,
      { passive: true }
    );


    /*
      Mouse screen se bahar
    */

    this.mouseLeaveHandler =
      () => {

        this.mouse.x = -1000;

        this.mouse.y = -1000;

        this.mouse.active = false;

      };


    window.addEventListener(
      'mouseout',
      this.mouseLeaveHandler
    );

  }


  /* =========================================================
     ANIMATION
  ========================================================= */

  private animate = (): void => {

    const width =
      this.canvas._displayWidth;

    const height =
      this.canvas._displayHeight;


    /*
      Clear complete banner
    */

    this.ctx.clearRect(
      0,
      0,
      width,
      height
    );


    /*
      UPDATE PARTICLES
    */

    for (const particle of this.particles) {

      this.updateParticle(
        particle,
        width,
        height
      );

    }


    /*
      DRAW CONNECTIONS FIRST
    */

    this.drawConnections();


    /*
      DRAW PARTICLES
    */

    this.drawParticles();


    this.animationId =
      requestAnimationFrame(
        this.animate
      );

  };


  /* =========================================================
     UPDATE PARTICLE
  ========================================================= */

  private updateParticle(
    particle: Particle,
    width: number,
    height: number
  ): void {

    /*
      Normal slow movement
    */

    particle.x += particle.vx;

    particle.y += particle.vy;


    /*
      Screen edges par bounce
    */

    if (
      particle.x < 0 ||
      particle.x > width
    ) {

      particle.vx *= -1;

    }


    if (
      particle.y < 0 ||
      particle.y > height
    ) {

      particle.vy *= -1;

    }


    /*
      CURSOR REPULSION

      Ye main spider-web effect hai.
      Cursor ke paas aate hi dots
      cursor se door chale jayenge.
    */

    if (this.mouse.active) {

      const dx =
        particle.x - this.mouse.x;

      const dy =
        particle.y - this.mouse.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );


      if (
        distance > 0 &&
        distance < this.mouseRadius
      ) {

        /*
          Cursor se distance
        */

        const force =
          (this.mouseRadius - distance)
          / this.mouseRadius;


        /*
          Direction cursor se away
        */

        const directionX =
          dx / distance;

        const directionY =
          dy / distance;


        /*
          Push strength
        */

        const push =
          force * 5.5;


        particle.x +=
          directionX * push;

        particle.y +=
          directionY * push;

      }

    }


    /*
      PARTICLE ko banner ke andar rakho
    */

    particle.x =
      Math.max(
        0,
        Math.min(
          width,
          particle.x
        )
      );

    particle.y =
      Math.max(
        0,
        Math.min(
          height,
          particle.y
        )
      );

  }


  /* =========================================================
     DRAW CONNECTIONS
  ========================================================= */

  private drawConnections(): void {

    const particles =
      this.particles;


    for (
      let i = 0;
      i < particles.length;
      i++
    ) {

      for (
        let j = i + 1;
        j < particles.length;
        j++
      ) {

        const p1 =
          particles[i];

        const p2 =
          particles[j];


        const dx =
          p1.x - p2.x;

        const dy =
          p1.y - p2.y;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        /*
          Normal spider-web connections
        */

        if (
          distance <
          this.connectionDistance
        ) {

          const opacity =
            (
              1 -
              distance /
              this.connectionDistance
            ) * 0.35;


          this.ctx.beginPath();

          this.ctx.moveTo(
            p1.x,
            p1.y
          );

          this.ctx.lineTo(
            p2.x,
            p2.y
          );

          this.ctx.strokeStyle =
            `rgba(77,228,255,${opacity})`;

          this.ctx.lineWidth =
            0.7;

          this.ctx.stroke();

        }

      }

    }


    /*
      CURSOR CONNECTIONS

      Cursor ke paas wale particles
      cursor se temporarily connect honge.
    */

    if (this.mouse.active) {

      for (const particle of particles) {

        const dx =
          particle.x -
          this.mouse.x;

        const dy =
          particle.y -
          this.mouse.y;

        const distance =
          Math.sqrt(
            dx * dx +
            dy * dy
          );


        if (
          distance <
          this.mouseRadius
        ) {

          const opacity =
            (
              1 -
              distance /
              this.mouseRadius
            ) * 0.55;


          this.ctx.beginPath();

          this.ctx.moveTo(
            particle.x,
            particle.y
          );

          this.ctx.lineTo(
            this.mouse.x,
            this.mouse.y
          );

          this.ctx.strokeStyle =
            `rgba(77,228,255,${opacity})`;

          this.ctx.lineWidth =
            0.8;

          this.ctx.stroke();

        }

      }

    }

  }


  /* =========================================================
     DRAW PARTICLES
  ========================================================= */

  private drawParticles(): void {

    for (const particle of this.particles) {

      this.ctx.beginPath();

      this.ctx.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );


      this.ctx.fillStyle =
        `rgba(
          77,
          228,
          255,
          ${particle.opacity}
        )`;


      this.ctx.shadowBlur =
        8;

      this.ctx.shadowColor =
        'rgba(77,228,255,0.7)';


      this.ctx.fill();

    }


    /*
      Shadow reset
    */

    this.ctx.shadowBlur = 0;

  }


  /* =========================================================
     DESTROY
  ========================================================= */

  ngOnDestroy(): void {

    if (this.animationId) {

      cancelAnimationFrame(
        this.animationId
      );

    }


    if (this.resizeHandler) {

      window.removeEventListener(
        'resize',
        this.resizeHandler
      );

    }


    if (this.mouseMoveHandler) {

      window.removeEventListener(
        'mousemove',
        this.mouseMoveHandler
      );

    }


    if (this.mouseLeaveHandler) {

      window.removeEventListener(
        'mouseout',
        this.mouseLeaveHandler
      );

    }

  }


  /* =========================================================
     BUTTON FUNCTIONS
  ========================================================= */

  connect(): void {

    console.log(
      'Connect clicked'
    );

  }


  exploreProperties(): void {

    console.log(
      'Explore properties clicked'
    );

  }

}


/* =========================================================
   PARTICLE INTERFACE
========================================================= */

interface Particle {

  x: number;

  y: number;

  baseX: number;

  baseY: number;

  vx: number;

  vy: number;

  size: number;

  opacity: number;

}


/* =========================================================
   CANVAS CUSTOM PROPERTIES
========================================================= */

declare global {

  interface HTMLCanvasElement {

    _displayWidth: number;

    _displayHeight: number;

  }

}