/*
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import $ from 'jquery';

export class NinePatchPreview {
  constructor(stage) {
    this.stage = stage;
    this.size = {w: 200, h: 200};
    this.setupUi();
    this.redraw();
  }

  setupUi() {
    let startWidth, startHeight, startX, startY;

    let mouseMoveHandler_ = ev => {
      this.size.w = Math.max(1, startWidth + (ev.pageX - startX) * 2);
      this.size.h = Math.max(1, startHeight + (ev.pageY - startY) * 2);
      this.redraw();
    };

    let mouseUpHandler_ = ev => {
      $(window)
          .off('mousemove', mouseMoveHandler_)
          .off('mouseup', mouseUpHandler_);
    };

    $('.preview-area')
        .on('mousedown', ev => {
          startWidth = this.size.w;
          startHeight = this.size.h;
          startX = ev.pageX;
          startY = ev.pageY;

          $(window)
              .on('mousemove', mouseMoveHandler_)
              .on('mouseup', mouseUpHandler_);
        });

    $('#preview-with-content').click(ev => $('.text-preview').toggle($(ev.currentTarget).is(':checked')));
  }

  redraw() {
    let canvas = $('.preview-area canvas').get(0);
    canvas.width = this.size.w;
    canvas.height = this.size.h;

    if (this.stage.srcCtx) {
      let ctx = canvas.getContext('2d');

      let fixed = {
        l: this.stage.stretchRect.x,
        t: this.stage.stretchRect.y,
        r: this.stage.srcSize.w - this.stage.stretchRect.x - this.stage.stretchRect.w,
        b: this.stage.srcSize.h - this.stage.stretchRect.y - this.stage.stretchRect.h,
        w: this.stage.stretchRect.w,
        h: this.stage.stretchRect.h
      };
      let {x, y, w, h} = this.stage.stretchRect,
      wTotal = this.size.w - w,
      wl = wTotal * x / (x + (this.stage.srcSize.w - x - w)),
      wr = wTotal - wl,
      hTotal = this.size.h - h,
      ht = hTotal * y / (y + (this.stage.srcSize.h - y - h)),
      hb = hTotal - ht

      // TL
      if (fixed.l && fixed.t)
        ctx.drawImage(this.stage.srcCtx.canvas,
          0, 0, fixed.l, fixed.t,
          0, 0, wl, ht)

      // BL
      if (fixed.l && fixed.b)
        ctx.drawImage(this.stage.srcCtx.canvas,
          0, this.stage.srcSize.h - fixed.b, fixed.l, fixed.b,
          0, this.size.h - hb, wl, hb)

      // TR
      if (fixed.r && fixed.t)
        ctx.drawImage(this.stage.srcCtx.canvas,
            this.stage.srcSize.w - fixed.r, 0, fixed.r, fixed.t,
            this.size.w - wr, 0, wr, ht);

      // BR
      if (fixed.r && fixed.b)
        ctx.drawImage(this.stage.srcCtx.canvas,
            this.stage.srcSize.w - fixed.r, this.stage.srcSize.h - fixed.b, fixed.r, fixed.b,
            this.size.w - wr, this.size.h - hb, wr, hb);

      // Top
      if (fixed.t)
        ctx.drawImage(this.stage.srcCtx.canvas,
            fixed.l, 0, this.stage.stretchRect.w, fixed.t,
            wl, 0, w, ht);

      // Left
      if (fixed.l)
        ctx.drawImage(this.stage.srcCtx.canvas,
            0, fixed.t, fixed.l, this.stage.stretchRect.h,
            0, ht, wl, h);

      // Right
      if (fixed.r)
        ctx.drawImage(this.stage.srcCtx.canvas,
            this.stage.srcSize.w - fixed.r, fixed.t, fixed.r, this.stage.stretchRect.h,
            this.size.w - wr, ht, wr, h);

      // Bottom
      if (fixed.b)
        ctx.drawImage(this.stage.srcCtx.canvas,
            fixed.l, this.stage.srcSize.h - fixed.b, this.stage.stretchRect.w, fixed.b,
            wl, this.size.h - hb, w, hb);

      // Middle
      ctx.drawImage(this.stage.srcCtx.canvas,
          fixed.l, fixed.t, this.stage.stretchRect.w, this.stage.stretchRect.h,
          wl, ht, w, h);

      // preview content
      $('.preview-area .text-preview')
          .css({
            left: this.stage.contentRect.x + "px",
            top: this.stage.contentRect.y + "px",
            width: (this.size.w - this.stage.srcSize.w + this.stage.contentRect.w) + "px",
            height: (this.size.h - this.stage.srcSize.h + this.stage.contentRect.h) + "px"
          });
    }
  }
}