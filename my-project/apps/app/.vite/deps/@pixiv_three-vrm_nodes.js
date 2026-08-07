import { Ps as Vector2, et as Color } from "./three.core-BXLKo011.js";
import "./three.js";
import { LightingModel, NodeMaterial, PropertyNode, TempNode } from "./three_webgpu.js";
import { BRDF_Lambert, Fn, cameraProjectionMatrix, cos, diffuseColor, float, length, mat2, matcapUV, materialNormal, materialReference, mix, modelNormalMatrix, modelViewMatrix, modelViewPosition, nodeImmutable, normalLocal, normalMap, positionLocal, sin, transformedNormalView, uv, vec2, vec3, vec4 } from "./three_tsl.js";
//#region ../../../node_modules/.bun/@pixiv+three-vrm@3.5.5+7b565cd016fb14f9/node_modules/@pixiv/three-vrm/lib/nodes/index.module.js
/*!
* @pixiv/three-vrm v3.5.5
* VRM file loader for three.js.
*
* Copyright (c) 2019-2026 pixiv Inc.
* @pixiv/three-vrm is distributed under MIT License
* https://github.com/pixiv/three-vrm/blob/release/LICENSE
*/
var threeRevision = parseInt("184", 10);
if (threeRevision < 167) console.warn(`MToonNodeMaterial requires Three.js r167 or higher (You are using r${threeRevision}). This would not work correctly.`);
var refColor = materialReference("color", "color");
var refMap = materialReference("map", "texture");
var refNormalMap = materialReference("normalMap", "texture");
var refNormalScale = materialReference("normalScale", "vec2");
var refEmissive = materialReference("emissive", "color");
var refEmissiveIntensity = materialReference("emissiveIntensity", "float");
var refEmissiveMap = materialReference("emissiveMap", "texture");
var refShadeColorFactor = materialReference("shadeColorFactor", "color");
var refShadingShiftFactor = materialReference("shadingShiftFactor", "float");
var refShadeMultiplyTexture = materialReference("shadeMultiplyTexture", "texture");
var refShadeMultiplyTextureScale = materialReference("shadeMultiplyTextureScale", "float");
var refShadingToonyFactor = materialReference("shadingToonyFactor", "float");
var refRimLightingMixFactor = materialReference("rimLightingMixFactor", "float");
var refRimMultiplyTexture = materialReference("rimMultiplyTexture", "texture");
var refMatcapFactor = materialReference("matcapFactor", "color");
var refMatcapTexture = materialReference("matcapTexture", "texture");
var refParametricRimColorFactor = materialReference("parametricRimColorFactor", "color");
var refParametricRimLiftFactor = materialReference("parametricRimLiftFactor", "float");
var refParametricRimFresnelPowerFactor = materialReference("parametricRimFresnelPowerFactor", "float");
var refOutlineWidthMultiplyTexture = materialReference("outlineWidthMultiplyTexture", "texture");
var refOutlineWidthFactor = materialReference("outlineWidthFactor", "float");
var refOutlineColorFactor = materialReference("outlineColorFactor", "color");
var refOutlineLightingMixFactor = materialReference("outlineLightingMixFactor", "float");
var refUVAnimationMaskTexture = materialReference("uvAnimationMaskTexture", "texture");
var refUVAnimationScrollXOffset = materialReference("uvAnimationScrollXOffset", "float");
var refUVAnimationScrollYOffset = materialReference("uvAnimationScrollYOffset", "float");
var refUVAnimationRotationPhase = materialReference("uvAnimationRotationPhase", "float");
var MToonAnimatedUVNode = class extends TempNode {
	constructor(hasMaskTexture) {
		super("vec2");
		this.hasMaskTexture = hasMaskTexture;
	}
	setup() {
		let uvAnimationMask = 1;
		if (this.hasMaskTexture) uvAnimationMask = vec4(refUVAnimationMaskTexture).context({ getUV: () => uv() }).r;
		let animatedUv = uv();
		const phase = refUVAnimationRotationPhase.mul(uvAnimationMask);
		const c = cos(phase);
		const s = sin(phase);
		animatedUv = animatedUv.sub(vec2(.5, .5));
		animatedUv = animatedUv.mul(mat2(c, s, s.negate(), c));
		animatedUv = animatedUv.add(vec2(.5, .5));
		const scroll = vec2(refUVAnimationScrollXOffset, refUVAnimationScrollYOffset).mul(uvAnimationMask);
		animatedUv = animatedUv.add(scroll);
		return animatedUv.toVar("AnimatedUV");
	}
};
var shadeColor = nodeImmutable(PropertyNode, "vec3").toVar("ShadeColor");
var shadingShift = nodeImmutable(PropertyNode, "float").toVar("ShadingShift");
var shadingToony = nodeImmutable(PropertyNode, "float").toVar("ShadingToony");
var rimLightingMix = nodeImmutable(PropertyNode, "float").toVar("RimLightingMix");
var rimMultiply = nodeImmutable(PropertyNode, "vec3").toVar("RimMultiply");
var matcap = nodeImmutable(PropertyNode, "vec3").toVar("matcap");
var parametricRim = nodeImmutable(PropertyNode, "vec3").toVar("ParametricRim");
var FnCompat = (jsFunc) => {
	if (parseInt("184", 10) >= 168) return Fn(jsFunc);
	else return (void 0)(jsFunc);
};
var linearstep = FnCompat(({ a, b, t }) => {
	const top = t.sub(a);
	const bottom = b.sub(a);
	return top.div(bottom).clamp();
});
var getShading = FnCompat(({ dotNL }) => {
	const shadow = 1;
	const feather = float(1).sub(shadingToony);
	let shading = dotNL.add(shadingShift);
	shading = linearstep({
		a: feather.negate(),
		b: feather,
		t: shading
	});
	shading = shading.mul(shadow);
	return shading;
});
var getDiffuse = FnCompat(({ shading, lightColor }) => {
	const feathered = mix(shadeColor, diffuseColor, shading);
	return lightColor.mul(BRDF_Lambert({ diffuseColor: feathered }));
});
var MToonLightingModel = class extends LightingModel {
	constructor() {
		super();
	}
	direct({ lightDirection, lightColor, reflectedLight }) {
		const shading = getShading({ dotNL: transformedNormalView.dot(lightDirection).clamp(-1, 1) });
		reflectedLight.directDiffuse.addAssign(getDiffuse({
			shading,
			lightColor
		}));
		reflectedLight.directSpecular.addAssign(parametricRim.add(matcap).mul(rimMultiply).mul(mix(vec3(0), BRDF_Lambert({ diffuseColor: lightColor }), rimLightingMix)));
	}
	indirect(builderOrContext) {
		const context = "context" in builderOrContext ? builderOrContext.context : builderOrContext;
		this.indirectDiffuse(context);
		this.indirectSpecular(context);
	}
	indirectDiffuse(context) {
		const { irradiance, reflectedLight } = context;
		reflectedLight.indirectDiffuse.addAssign(irradiance.mul(BRDF_Lambert({ diffuseColor })));
	}
	indirectSpecular(context) {
		const { reflectedLight } = context;
		reflectedLight.indirectSpecular.addAssign(parametricRim.add(matcap).mul(rimMultiply).mul(mix(vec3(1), vec3(0), rimLightingMix)));
	}
};
var MToonMaterialOutlineWidthMode = {
	None: "none",
	WorldCoordinates: "worldCoordinates",
	ScreenCoordinates: "screenCoordinates"
};
var mtoonParametricRim = FnCompat(({ parametricRimLift, parametricRimFresnelPower, parametricRimColor }) => {
	const viewDir = modelViewPosition.normalize();
	const dotNV = transformedNormalView.dot(viewDir.negate());
	return float(1).sub(dotNV).add(parametricRimLift).clamp().pow(parametricRimFresnelPower).mul(parametricRimColor);
});
var MToonNodeMaterial = class extends NodeMaterial {
	customProgramCacheKey() {
		let cacheKey = super.customProgramCacheKey();
		cacheKey += `isOutline:${this.isOutline},`;
		return cacheKey;
	}
	/**
	* Readonly boolean that indicates this is a {@link MToonNodeMaterial}.
	*/
	get isMToonNodeMaterial() {
		return true;
	}
	constructor(parameters = {}) {
		super();
		if (parameters.transparentWithZWrite) parameters.depthWrite = true;
		delete parameters.transparentWithZWrite;
		delete parameters.giEqualizationFactor;
		delete parameters.v0CompatShade;
		delete parameters.debugMode;
		this.emissiveNode = null;
		this.lights = true;
		this.color = new Color(1, 1, 1);
		this.map = null;
		this.emissive = new Color(0, 0, 0);
		this.emissiveIntensity = 1;
		this.emissiveMap = null;
		this.normalMap = null;
		this.normalScale = new Vector2(1, 1);
		this.shadeColorFactor = new Color(0, 0, 0);
		this.shadeMultiplyTexture = null;
		this.shadingShiftFactor = 0;
		this.shadingShiftTexture = null;
		this.shadingShiftTextureScale = 1;
		this.shadingToonyFactor = .9;
		this.rimLightingMixFactor = 1;
		this.rimMultiplyTexture = null;
		this.matcapFactor = new Color(1, 1, 1);
		this.matcapTexture = null;
		this.parametricRimColorFactor = new Color(0, 0, 0);
		this.parametricRimLiftFactor = 0;
		this.parametricRimFresnelPowerFactor = 5;
		this.outlineWidthMode = MToonMaterialOutlineWidthMode.None;
		this.outlineWidthMultiplyTexture = null;
		this.outlineWidthFactor = 0;
		this.outlineColorFactor = new Color(0, 0, 0);
		this.outlineLightingMixFactor = 1;
		this.uvAnimationScrollXSpeedFactor = 0;
		this.uvAnimationScrollYSpeedFactor = 0;
		this.uvAnimationRotationSpeedFactor = 0;
		this.uvAnimationMaskTexture = null;
		this.shadeColorNode = null;
		this.shadingShiftNode = null;
		this.shadingToonyNode = null;
		this.rimLightingMixNode = null;
		this.rimMultiplyNode = null;
		this.matcapNode = null;
		this.parametricRimColorNode = null;
		this.parametricRimLiftNode = null;
		this.parametricRimFresnelPowerNode = null;
		this.uvAnimationScrollXOffset = 0;
		this.uvAnimationScrollYOffset = 0;
		this.uvAnimationRotationPhase = 0;
		this.isOutline = false;
		this._animatedUVNode = null;
		this.setValues(parameters);
	}
	setupLightingModel() {
		return new MToonLightingModel();
	}
	setup(builder) {
		var _a;
		this._animatedUVNode = new MToonAnimatedUVNode((_a = this.uvAnimationMaskTexture && this.uvAnimationMaskTexture.isTexture === true) != null ? _a : false);
		super.setup(builder);
	}
	setupDiffuseColor(builder) {
		let tempColorNode = null;
		if (this.colorNode == null) {
			tempColorNode = refColor;
			if (this.map && this.map.isTexture === true) {
				const map = refMap.context({ getUV: () => this._animatedUVNode });
				tempColorNode = tempColorNode.mul(map);
			}
			this.colorNode = tempColorNode;
		}
		if (this.vertexColors === true && builder.geometry.hasAttribute("color")) {
			console.warn("MToonNodeMaterial: MToon ignores vertex colors. Consider using a model without vertex colors instead.");
			this.vertexColors = false;
		}
		super.setupDiffuseColor(builder);
		if (parseInt("184", 10) < 166) {
			if (this.transparent === false && this.blending === 1 && this.alphaToCoverage === false) diffuseColor.a.assign(1);
		}
		if (this.colorNode === tempColorNode) this.colorNode = null;
	}
	setupVariants() {
		shadeColor.assign(this._setupShadeColorNode());
		shadingShift.assign(this._setupShadingShiftNode());
		shadingToony.assign(this._setupShadingToonyNode());
		rimLightingMix.assign(this._setupRimLightingMixNode());
		rimMultiply.assign(this._setupRimMultiplyNode());
		matcap.assign(this._setupMatcapNode());
		parametricRim.assign(this._setupParametricRimNode());
	}
	setupNormal(builder) {
		const tempNormalNode = this.normalNode;
		if (this.normalNode == null) {
			this.normalNode = materialNormal;
			if (this.normalMap && this.normalMap.isTexture === true) {
				const map = refNormalMap.context({ getUV: () => this._animatedUVNode });
				this.normalNode = normalMap(map, refNormalScale);
			}
			if (this.isOutline) this.normalNode = this.normalNode.negate();
		}
		if (parseInt("184", 10) >= 168) {
			const ret = this.normalNode;
			this.normalNode = tempNormalNode;
			return ret;
		} else {
			super.setupNormal(builder);
			this.normalNode = tempNormalNode;
			return;
		}
	}
	setupLighting(builder) {
		let tempEmissiveNode = null;
		if (this.emissiveNode == null) {
			tempEmissiveNode = refEmissive.mul(refEmissiveIntensity);
			if (this.emissiveMap && this.emissiveMap.isTexture === true) {
				const map = refEmissiveMap.context({ getUV: () => this._animatedUVNode });
				tempEmissiveNode = tempEmissiveNode.mul(map);
			}
			this.emissiveNode = tempEmissiveNode;
		}
		const ret = super.setupLighting(builder);
		if (this.emissiveNode === tempEmissiveNode) this.emissiveNode = null;
		return ret;
	}
	setupOutput(builder, outputNode) {
		if (this.isOutline && this.outlineWidthMode !== MToonMaterialOutlineWidthMode.None) outputNode = vec4(mix(refOutlineColorFactor, outputNode.xyz.mul(refOutlineColorFactor), refOutlineLightingMixFactor), outputNode.w);
		return super.setupOutput(builder, outputNode);
	}
	setupPosition(builder) {
		const tempPositionNode = this.positionNode;
		if (this.isOutline && this.outlineWidthMode !== MToonMaterialOutlineWidthMode.None) {
			this.positionNode ??= positionLocal;
			const normalLocalNormalized = normalLocal.normalize();
			let width = refOutlineWidthFactor;
			if (this.outlineWidthMultiplyTexture && this.outlineWidthMultiplyTexture.isTexture === true) {
				const map = refOutlineWidthMultiplyTexture.context({ getUV: () => this._animatedUVNode });
				width = width.mul(map);
			}
			const worldNormalLength = length(modelNormalMatrix.mul(normalLocalNormalized));
			const outlineOffset = width.mul(worldNormalLength).mul(normalLocalNormalized);
			if (this.outlineWidthMode === MToonMaterialOutlineWidthMode.WorldCoordinates) this.positionNode = this.positionNode.add(outlineOffset);
			else if (this.outlineWidthMode === MToonMaterialOutlineWidthMode.ScreenCoordinates) {
				const clipScale = cameraProjectionMatrix.element(1).element(1);
				const tempPositionView = modelViewMatrix.mul(positionLocal);
				this.positionNode = this.positionNode.add(outlineOffset.div(clipScale).mul(tempPositionView.z.negate()));
			}
			this.positionNode ??= positionLocal;
		}
		const ret = super.setupPosition(builder);
		ret.z.add(ret.w.mul(1e-6));
		this.positionNode = tempPositionNode;
		return ret;
	}
	copy(source) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
		this.color.copy(source.color);
		this.map = (_a = source.map) != null ? _a : null;
		this.emissive.copy(source.emissive);
		this.emissiveIntensity = source.emissiveIntensity;
		this.emissiveMap = (_b = source.emissiveMap) != null ? _b : null;
		this.normalMap = (_c = source.normalMap) != null ? _c : null;
		this.normalScale.copy(source.normalScale);
		this.shadeColorFactor.copy(source.shadeColorFactor);
		this.shadeMultiplyTexture = (_d = source.shadeMultiplyTexture) != null ? _d : null;
		this.shadingShiftFactor = source.shadingShiftFactor;
		this.shadingShiftTexture = (_e = source.shadingShiftTexture) != null ? _e : null;
		this.shadingShiftTextureScale = source.shadingShiftTextureScale;
		this.shadingToonyFactor = source.shadingToonyFactor;
		this.rimLightingMixFactor = source.rimLightingMixFactor;
		this.rimMultiplyTexture = (_f = source.rimMultiplyTexture) != null ? _f : null;
		this.matcapFactor.copy(source.matcapFactor);
		this.matcapTexture = (_g = source.matcapTexture) != null ? _g : null;
		this.parametricRimColorFactor.copy(source.parametricRimColorFactor);
		this.parametricRimLiftFactor = source.parametricRimLiftFactor;
		this.parametricRimFresnelPowerFactor = source.parametricRimFresnelPowerFactor;
		this.outlineWidthMode = source.outlineWidthMode;
		this.outlineWidthMultiplyTexture = (_h = source.outlineWidthMultiplyTexture) != null ? _h : null;
		this.outlineWidthFactor = source.outlineWidthFactor;
		this.outlineColorFactor.copy(source.outlineColorFactor);
		this.outlineLightingMixFactor = source.outlineLightingMixFactor;
		this.uvAnimationScrollXSpeedFactor = source.uvAnimationScrollXSpeedFactor;
		this.uvAnimationScrollYSpeedFactor = source.uvAnimationScrollYSpeedFactor;
		this.uvAnimationRotationSpeedFactor = source.uvAnimationRotationSpeedFactor;
		this.uvAnimationMaskTexture = (_i = source.uvAnimationMaskTexture) != null ? _i : null;
		this.shadeColorNode = (_j = source.shadeColorNode) != null ? _j : null;
		this.shadingShiftNode = (_k = source.shadingShiftNode) != null ? _k : null;
		this.shadingToonyNode = (_l = source.shadingToonyNode) != null ? _l : null;
		this.rimLightingMixNode = (_m = source.rimLightingMixNode) != null ? _m : null;
		this.rimMultiplyNode = (_n = source.rimMultiplyNode) != null ? _n : null;
		this.matcapNode = (_o = source.matcapNode) != null ? _o : null;
		this.parametricRimColorNode = (_p = source.parametricRimColorNode) != null ? _p : null;
		this.parametricRimLiftNode = (_q = source.parametricRimLiftNode) != null ? _q : null;
		this.parametricRimFresnelPowerNode = (_r = source.parametricRimFresnelPowerNode) != null ? _r : null;
		this.isOutline = (_s = source.isOutline) != null ? _s : null;
		return super.copy(source);
	}
	update(delta) {
		this.uvAnimationScrollXOffset += delta * this.uvAnimationScrollXSpeedFactor;
		this.uvAnimationScrollYOffset += delta * this.uvAnimationScrollYSpeedFactor;
		this.uvAnimationRotationPhase += delta * this.uvAnimationRotationSpeedFactor;
	}
	_setupShadeColorNode() {
		if (this.shadeColorNode != null) return vec3(this.shadeColorNode);
		let shadeColorNode = refShadeColorFactor;
		if (this.shadeMultiplyTexture && this.shadeMultiplyTexture.isTexture === true) {
			const map = refShadeMultiplyTexture.context({ getUV: () => this._animatedUVNode });
			shadeColorNode = shadeColorNode.mul(map);
		}
		return shadeColorNode;
	}
	_setupShadingShiftNode() {
		if (this.shadingShiftNode != null) return float(this.shadingShiftNode);
		let shadingShiftNode = refShadingShiftFactor;
		if (this.shadingShiftTexture && this.shadingShiftTexture.isTexture === true) {
			const map = refShadeMultiplyTexture.context({ getUV: () => this._animatedUVNode });
			shadingShiftNode = shadingShiftNode.add(map.mul(refShadeMultiplyTextureScale));
		}
		return shadingShiftNode;
	}
	_setupShadingToonyNode() {
		if (this.shadingToonyNode != null) return float(this.shadingToonyNode);
		return refShadingToonyFactor;
	}
	_setupRimLightingMixNode() {
		if (this.rimLightingMixNode != null) return float(this.rimLightingMixNode);
		return refRimLightingMixFactor;
	}
	_setupRimMultiplyNode() {
		if (this.rimMultiplyNode != null) return vec3(this.rimMultiplyNode);
		if (this.rimMultiplyTexture && this.rimMultiplyTexture.isTexture === true) return refRimMultiplyTexture.context({ getUV: () => this._animatedUVNode });
		return vec3(1);
	}
	_setupMatcapNode() {
		if (this.matcapNode != null) return vec3(this.matcapNode);
		if (this.matcapTexture && this.matcapTexture.isTexture === true) return refMatcapTexture.context({ getUV: () => matcapUV.mul(1, -1).add(0, 1) }).mul(refMatcapFactor);
		return vec3(0);
	}
	_setupParametricRimNode() {
		const parametricRimColor = this.parametricRimColorNode != null ? vec3(this.parametricRimColorNode) : refParametricRimColorFactor;
		return mtoonParametricRim({
			parametricRimLift: this.parametricRimLiftNode != null ? float(this.parametricRimLiftNode) : refParametricRimLiftFactor,
			parametricRimFresnelPower: this.parametricRimFresnelPowerNode != null ? float(this.parametricRimFresnelPowerNode) : refParametricRimFresnelPowerFactor,
			parametricRimColor
		});
	}
};
/*!
* @pixiv/three-vrm-materials-mtoon v3.5.5
* MToon (toon material) module for @pixiv/three-vrm
*
* Copyright (c) 2019-2026 pixiv Inc.
* @pixiv/three-vrm-materials-mtoon is distributed under MIT License
* https://github.com/pixiv/three-vrm/blob/release/LICENSE
*/
//#endregion
export { MToonAnimatedUVNode, MToonLightingModel, MToonNodeMaterial };
