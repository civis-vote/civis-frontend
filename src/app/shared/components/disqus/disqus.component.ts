import { Component, Input, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-disqus',
  templateUrl: './disqus.component.html',
  styleUrls: ['./disqus.component.scss']
})

export class DisqusComponent implements OnInit {

  @Input() public identifier: string;
  @Input() public shortname: string;

  dom: any;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    if ((<any>window).DISQUS === undefined) {
      this.addScriptTag();
    } else {
      this.reset();
    }
  }

  /**
   * Reset Disqus with new information.
   */
  reset() {
    (<any>window).DISQUS.reset({
      reload: true,
      config: this.getConfig()
    });
  }

  /**
   * Add the Disqus script to the document.
   */
  addScriptTag() {
    (<any>window).disqus_config = this.getConfig();

    const script = this.renderer.createElement(this.el.nativeElement, 'script');
    script.src = `//${this.shortname}.disqus.com/embed.js`;
    script.async = true;
    script.type = 'text/javascript';
    script.setAttribute('data-timestamp', new Date().getTime().toString());
  }

  /**
   * Get Disqus config
   */
  getConfig() {
    const _self = this;
    return function () {
      this.page.url = window.location.href;
      this.page.identifier = _self.identifier;
      this.language = 'en';
    };
  }
}
