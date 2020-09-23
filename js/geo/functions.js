Geo.functions = {
	Circle(props, center, radius) {
		const centerXScr = Geo.render.toScreenCoordX(center.x);
		const centerYScr = Geo.render.toScreenCoordY(center.y);
		const radiusScr = Geo.render.toScreenLength(radius);

		return {
			type: this.Circle,
			center,
			radius,
			render(ctx) {
				ctx.beginPath();
				ctx.arc(centerXScr, centerYScr, radiusScr, 0, 2 * Math.PI);
				ctx.strokeStyle = "black";
				ctx.lineWidth = 2;
				ctx.stroke();
			}
		};
	},

	Point(props, x, y) {
		const xScr = Geo.render.toScreenCoordX(x);
		const yScr = Geo.render.toScreenCoordY(y);

		let text = null;
		if(props.text) {
			text = this.TextAtScreen(props, {x: xScr, y: yScr}, {x: xScr, y: yScr});
		}

		return {
			type: this.Point,
			props,
			x,
			y,
			render(ctx) {
				ctx.beginPath();
				ctx.arc(xScr, yScr, 6, 0, 2 * Math.PI);
				ctx.fillStyle = props.color || "black";
				ctx.strokeStyle = "black";
				ctx.lineWidth = 1;
				ctx.fill();
				ctx.stroke();
				if(text) {
					text.render(ctx);
				}
			}
		};
	},

	Segment(props, a, b) {
		const aXScr = Geo.render.toScreenCoordX(a.x);
		const aYScr = Geo.render.toScreenCoordY(a.y);
		const bXScr = Geo.render.toScreenCoordX(b.x);
		const bYScr = Geo.render.toScreenCoordY(b.y);

		let text = null;
		if(props.text) {
			text = this.TextAtScreen(props, {x: aXScr, y: aYScr}, {x: bXScr, y: bYScr});
		}

		return {
			type: this.Segment,
			a,
			b,
			render(ctx) {
				ctx.beginPath();
				ctx.moveTo(aXScr, aYScr);
				ctx.lineTo(bXScr, bYScr);
				ctx.strokeStyle = props.color || "black";
				ctx.lineWidth = 3;
				ctx.stroke();
				if(text) {
					text.render(ctx);
				}
			}
		};
	},

	Rotate(props, object, angle, center) {
		const x0 = object.x - center.x;
		const y0 = object.y - object.y;

		const sin = Math.sin(angle);
		const cos = Math.cos(angle);

		// (x0 + i y0) (cos + i sin) =
		// (x0 cos - y0 sin) + i (y0 cos + x0 sin)

		const newX = x0 * cos - y0 * sin;
		const newY = y0 * cos + x0 * sin;

		return this.Point(props, newX, newY);
	},

	TextAtScreen(props, scr1, scr2) {
		if(props.left + props.right + props.above + props.below > 1) {
			throw new Error("left, right, above and below can't be used together");
		} else if(!("text" in props)) {
			throw new Error("'text' property is missing");
		}

		const width = Geo.functions.MeasureText({}, props.text);

		let point;
		if(props.left) {
			point = scr1.x < scr2.x ? scr1 : scr2;
			point = {
				x: point.x - width - 18,
				y: props.midway ? (scr1.y + scr2.y) / 2 + 7 : point.y + 7
			};
		} else if(props.right) {
			point = scr1.x > scr2.x ? scr1 : scr2;
			point = {
				x: point.x + 18,
				y: props.midway ? (scr1.y + scr2.y) / 2 + 7 : point.y + 7
			};
		} else if(props.above) {
			point = scr1.y < scr2.y ? scr1 : scr2;
			point = {
				x: (props.midway ? (scr1.x + scr2.x) / 2 : point.x) - width / 2,
				y: point.y - 12
			};
		} else if(props.below) {
			point = scr1.y > scr2.y ? scr1 : scr2;
			point = {
				x: (props.midway ? (scr1.x + scr2.x) / 2 : point.x) - width / 2,
				y: point.y + 25
			};
		} else {
			throw new Error("No text coordinates specified");
		}

		return {
			type: this.TextAtScreen,
			render(ctx) {
				ctx.font = "18px Arial";
				ctx.fillStyle = props.color || "black";
				ctx.fillText(props.text, point.x, point.y);
			}
		};
	},

	MeasureText(props, text) {
		// The exact canvas element doesn't matter, we just need the context
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		ctx.font = "18px Arial";
		return ctx.measureText(text).width;
	}
};


Geo.functionRenderOrder = [
	Geo.functions.Circle,
	Geo.functions.Segment,
	Geo.functions.Point,
	Geo.functions.TextAtScreen
];