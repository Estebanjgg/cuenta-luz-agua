'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

// Registrar el plugin de MorphSVG
if (typeof window !== 'undefined') {
  gsap.registerPlugin(MorphSVGPlugin);
}

interface AnimatedLoginFormProps {
  onToggleForm: () => void;
}

export function AnimatedLoginForm({ onToggleForm }: AnimatedLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { signIn } = useAuth();
  const { t } = useLanguage();

  // --- Refs para todos los elementos del DOM ---
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const showPasswordCheckRef = useRef<HTMLInputElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const twoFingersRef = useRef<SVGGElement>(null);
  const armLRef = useRef<SVGGElement>(null);
  const armRRef = useRef<SVGGElement>(null);
  const eyeLRef = useRef<SVGGElement>(null);
  const eyeRRef = useRef<SVGGElement>(null);
  const noseRef = useRef<SVGGElement>(null);
  const mouthRef = useRef<SVGGElement>(null);
  const mouthBGRef = useRef<SVGPathElement>(null);
  const mouthSmallBGRef = useRef<SVGPathElement>(null);
  const mouthMediumBGRef = useRef<SVGPathElement>(null);
  const mouthLargeBGRef = useRef<SVGPathElement>(null);
  const mouthMaskPathRef = useRef<SVGPathElement>(null);
  const mouthOutlineRef = useRef<SVGPathElement>(null);
  const toothRef = useRef<SVGGElement>(null);
  const tongueRef = useRef<SVGGElement>(null);
  const chinRef = useRef<SVGPathElement>(null);
  const faceRef = useRef<SVGPathElement>(null);
  const eyebrowRef = useRef<SVGGElement>(null);
  const outerEarLRef = useRef<SVGGElement>(null);
  const outerEarRRef = useRef<SVGGElement>(null);
  const earHairLRef = useRef<SVGGElement>(null);
  const earHairRRef = useRef<SVGGElement>(null);
  const hairRef = useRef<SVGPathElement>(null);
  const bodyBGRef = useRef<SVGPathElement>(null);
  const bodyBGchangedRef = useRef<SVGPathElement>(null);

  // --- Variables de estado y de instancia ---
  const instance = useRef({
    activeElement: null as string | null,
    mouthStatus: 'small',
    eyeScale: 1,
    eyesCovered: false,
    blinking: null as gsap.core.Tween | null,
  }).current;

  // --- Lógica de Animación y Eventos en useEffect ---
  useEffect(() => {
    // --- Referencias a elementos .current ---
    const email = emailRef.current;
    const password = passwordRef.current;
    const mySVG = svgContainerRef.current;
    const armL = armLRef.current;
    const armR = armRRef.current;
    const eyeL = eyeLRef.current;
    const eyeR = eyeRRef.current;
    const nose = noseRef.current;
    const mouth = mouthRef.current;
    const mouthBG = mouthBGRef.current;
    const mouthSmallBG = mouthSmallBGRef.current;
    const mouthMediumBG = mouthMediumBGRef.current;
    const mouthLargeBG = mouthLargeBGRef.current;
    const mouthMaskPath = mouthMaskPathRef.current;
    const mouthOutline = mouthOutlineRef.current;
    const tooth = toothRef.current;
    const tongue = tongueRef.current;
    const chin = chinRef.current;
    const face = faceRef.current;
    const eyebrow = eyebrowRef.current;
    const outerEarL = outerEarLRef.current;
    const outerEarR = outerEarRRef.current;
    const earHairL = earHairLRef.current;
    const earHairR = earHairRRef.current;
    const hair = hairRef.current;
    const bodyBG = bodyBGRef.current;
    const bodyBGchanged = bodyBGchangedRef.current;
    const twoFingers = twoFingersRef.current;
    
    if (!email || !password || !mySVG) return;
    
    let emailScrollMax: number;
    let eyeLCoords: {x: number, y: number}, eyeRCoords: {x: number, y: number}, noseCoords: {x: number, y: number}, mouthCoords: {x: number, y: number}, svgCoords: {x: number, y: number}, emailCoords: {x: number, y: number}, screenCenter: number;

    const getPosition = (el: HTMLElement) => {
        let xPos = 0;
        let yPos = 0;
        let element: HTMLElement | null = el;
        while (element) {
            xPos += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPos += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent as HTMLElement;
        }
        return { x: xPos, y: yPos };
    };
    
    const getAngle = (x1: number, y1: number, x2: number, y2: number) => Math.atan2(y1 - y2, x1 - x2);

    const calculateFaceMove = () => {
        const carPos = email.selectionEnd || email.value.length;
        const div = document.createElement('div');
        const span = document.createElement('span');
        const copyStyle = getComputedStyle(email);
        
        // Copy only specific CSS properties to avoid indexed property errors
        const propertiesToCopy = [
            'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing',
            'textTransform', 'wordSpacing', 'textIndent', 'whiteSpace', 'lineHeight',
            'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
            'border', 'borderLeft', 'borderRight', 'borderTop', 'borderBottom',
            'boxSizing', 'width'
        ];
        
        propertiesToCopy.forEach(prop => {
            if (copyStyle.getPropertyValue(prop)) {
                div.style.setProperty(prop, copyStyle.getPropertyValue(prop));
            }
        });
        
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.height = 'auto';
        div.style.minHeight = 'auto';
        div.style.maxHeight = 'none';
        div.style.overflow = 'hidden';
        
        document.body.appendChild(div);
        div.textContent = email.value.substr(0, carPos);
        span.textContent = email.value.substr(carPos) || '.';
        div.appendChild(span);

        const caretCoords = getPosition(span);
        const dFromC = screenCenter - (caretCoords.x + emailCoords.x);

        let eyeLAngle: number, eyeRAngle: number, noseAngle: number, mouthAngle: number;

        if (email.scrollWidth <= emailScrollMax) {
            eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
            eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
            noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
            mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + caretCoords.x, emailCoords.y + 25);
        } else {
            eyeLAngle = getAngle(eyeLCoords.x, eyeLCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
            eyeRAngle = getAngle(eyeRCoords.x, eyeRCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
            noseAngle = getAngle(noseCoords.x, noseCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
            mouthAngle = getAngle(mouthCoords.x, mouthCoords.y, emailCoords.x + emailScrollMax, emailCoords.y + 25);
        }

        const eyeLX = Math.cos(eyeLAngle) * 20;
        const eyeLY = Math.sin(eyeLAngle) * 10;
        const eyeRX = Math.cos(eyeRAngle) * 20;
        const eyeRY = Math.sin(eyeRAngle) * 10;
        const noseX = Math.cos(noseAngle) * 23;
        const noseY = Math.sin(noseAngle) * 10;
        const mouthX = Math.cos(mouthAngle) * 23;
        const mouthY = Math.sin(mouthAngle) * 10;
        const mouthR = Math.cos(mouthAngle) * 6;
        const chinX = mouthX * 0.8;
        const chinY = mouthY * 0.5;
        let chinS = 1 - (dFromC * 0.15) / 100;
        if (chinS > 1) chinS = 1 - (chinS - 1);
        if (chinS < 0.5) chinS = 0.5;
        const faceX = mouthX * 0.3;
        const faceY = mouthY * 0.4;
        const faceSkew = Math.cos(mouthAngle) * 5;
        const eyebrowSkew = Math.cos(mouthAngle) * 25;
        const outerEarX = Math.cos(mouthAngle) * 4;
        const outerEarY = Math.cos(mouthAngle) * 5;
        const hairX = Math.cos(mouthAngle) * 6;

        if (eyeL && eyeR && nose && mouth && chin && face && eyebrow && outerEarL && outerEarR && earHairL && earHairR && hair) {
          gsap.to(eyeL, { duration: 1, x: -eyeLX, y: -eyeLY, ease: 'expo.out' });
          gsap.to(eyeR, { duration: 1, x: -eyeRX, y: -eyeRY, ease: 'expo.out' });
          gsap.to(nose, { duration: 1, x: -noseX, y: -noseY, rotation: mouthR, transformOrigin: 'center center', ease: 'expo.out' });
          gsap.to(mouth, { duration: 1, x: -mouthX, y: -mouthY, rotation: mouthR, transformOrigin: 'center center', ease: 'expo.out' });
          gsap.to(chin, { duration: 1, x: -chinX, y: -chinY, scaleY: chinS, ease: 'expo.out' });
          gsap.to(face, { duration: 1, x: -faceX, y: -faceY, skewX: -faceSkew, transformOrigin: 'center top', ease: 'expo.out' });
          gsap.to(eyebrow, { duration: 1, x: -faceX, y: -faceY, skewX: -eyebrowSkew, transformOrigin: 'center top', ease: 'expo.out' });
          gsap.to(outerEarL, { duration: 1, x: outerEarX, y: -outerEarY, ease: 'expo.out' });
          gsap.to(outerEarR, { duration: 1, x: outerEarX, y: outerEarY, ease: 'expo.out' });
          gsap.to(earHairL, { duration: 1, x: -outerEarX, y: -outerEarY, ease: 'expo.out' });
          gsap.to(earHairR, { duration: 1, x: -outerEarX, y: outerEarY, ease: 'expo.out' });
          gsap.to(hair, { duration: 1, x: hairX, scaleY: 1.2, transformOrigin: 'center bottom', ease: 'expo.out' });
        }

        document.body.removeChild(div);
    };

    const resetFace = () => {
        if (eyeL && eyeR && nose && mouth && chin && face && eyebrow && outerEarL && outerEarR && earHairL && earHairR && hair) {
          gsap.to([eyeL, eyeR, nose, mouth, chin, face, eyebrow, outerEarL, outerEarR, earHairL, earHairR, hair], {
              duration: 1,
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              skewX: 0,
              ease: 'expo.out',
          });
        }
    };
    
    const startBlinking = (delay = 1) => {
        const blink = () => {
            if (eyeL && eyeR) {
              instance.blinking = gsap.to([eyeL, eyeR], {
                  duration: 0.1,
                  scaleY: 0,
                  yoyo: true,
                  repeat: 1,
                  transformOrigin: 'center center',
                  delay: Math.random() * (delay || 5),
                  onComplete: blink,
              });
            }
        };
        blink();
    };

    const stopBlinking = () => {
        if (instance.blinking) instance.blinking.kill();
        if (eyeL && eyeR) {
          gsap.set([eyeL, eyeR], { scaleY: instance.eyeScale });
        }
    };

    const coverEyes = () => {
        if (instance.eyesCovered || !armL || !armR || !bodyBG || !bodyBGchanged) return;
        gsap.killTweensOf([armL, armR]);
        gsap.set([armL, armR], { visibility: 'visible' });
        gsap.to(armL, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: 'quad.out' });
        gsap.to(armR, { duration: 0.45, x: -93, y: 10, rotation: 0, ease: 'quad.out', delay: 0.1 });
        gsap.to(bodyBG, { duration: 0.45, morphSVG: bodyBGchanged, ease: 'quad.out' });
        instance.eyesCovered = true;
        stopBlinking();
    };

    const uncoverEyes = () => {
        if (!instance.eyesCovered || !armL || !armR || !bodyBG) return;
        gsap.killTweensOf([armL, armR]);
        gsap.to(armL, { duration: 1.35, y: 220, rotation: 105, ease: 'quad.out' });
        gsap.to(armR, {
            duration: 1.35, y: 220, rotation: -105, ease: 'quad.out', delay: 0.1, onComplete: () => {
                gsap.set([armL, armR], { visibility: 'hidden' });
            }
        });
        gsap.to(bodyBG, { duration: 0.45, morphSVG: bodyBG, ease: 'quad.out' });
        instance.eyesCovered = false;
        startBlinking();
    };
    
    // --- Handlers ---
    const onEmailInput = () => {
        calculateFaceMove();
        const value = email.value;
        if (value.length > 0) {
            if (instance.mouthStatus === "small" && mouthBG && mouthOutline && mouthMaskPath && mouthMediumBG && eyeL && eyeR) {
                instance.mouthStatus = "medium";
                gsap.to([mouthBG, mouthOutline, mouthMaskPath], { duration: 1, morphSVG: mouthMediumBG, ease: 'expo.out' });
                gsap.to([eyeL, eyeR], { duration: 1, scale: 0.85, ease: 'expo.out' });
                instance.eyeScale = 0.85;
            }
            if (value.includes('@') && value.includes('.') && mouthBG && mouthOutline && mouthMaskPath && mouthLargeBG && tooth && tongue && eyeL && eyeR) {
                instance.mouthStatus = "large";
                gsap.to([mouthBG, mouthOutline, mouthMaskPath], { duration: 1, morphSVG: mouthLargeBG, ease: 'expo.out' });
                gsap.to(tooth, { duration: 1, x: 3, y: -2, ease: 'expo.out' });
                gsap.to(tongue, { duration: 1, y: 2, ease: 'expo.out' });
                gsap.to([eyeL, eyeR], { duration: 1, scale: 0.65, ease: 'expo.out' });
                instance.eyeScale = 0.65;
            }
        } else {
            if (mouthBG && mouthOutline && mouthMaskPath && mouthSmallBG && eyeL && eyeR) {
              instance.mouthStatus = "small";
              gsap.to([mouthBG, mouthOutline, mouthMaskPath], { duration: 1, morphSVG: mouthSmallBG, ease: 'expo.out' });
              gsap.to([eyeL, eyeR], { duration: 1, scale: 1, ease: 'expo.out' });
              instance.eyeScale = 1;
            }
        }
    };
    
    const onEmailFocus = (e: Event) => {
        instance.activeElement = "email";
        const target = e.target as HTMLInputElement;
        target.parentElement?.classList.add('focus-with-text');
        stopBlinking();
        onEmailInput();
    };

    const onEmailBlur = (e: Event) => {
        instance.activeElement = null;
        const target = e.target as HTMLInputElement;
        if (target.value === "") {
            target.parentElement?.classList.remove('focus-with-text');
        }
        startBlinking();
        resetFace();
    };

    const onPasswordFocus = () => {
        instance.activeElement = "password";
        coverEyes();
    };

    const onPasswordBlur = () => {
        instance.activeElement = null;
        // Solo descubrir si el foco no se movió a otro elemento interactivo
        setTimeout(() => {
            if (instance.activeElement !== "password" && instance.activeElement !== "toggle") {
                uncoverEyes();
            }
        }, 100);
    };

    const onPasswordToggleFocus = () => {
        instance.activeElement = "toggle";
        coverEyes();
    };
     const onPasswordToggleBlur = () => {
        instance.activeElement = null;
        setTimeout(() => {
            if (instance.activeElement !== "password" && instance.activeElement !== "toggle") {
                uncoverEyes();
            }
        }, 100);
    };

    const onPasswordToggleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        setShowPassword(target.checked);
        if (twoFingers) {
          if (target.checked) {
              gsap.to(twoFingers, { duration: 0.35, transformOrigin: 'bottom left', rotation: 30, x: -9, y: -2, ease: 'power2.inOut' });
          } else {
              gsap.to(twoFingers, { duration: 0.35, transformOrigin: 'bottom left', rotation: 0, x: 0, y: 0, ease: 'power2.inOut' });
          }
        }
    };

    // --- Init ---
    const init = () => {
        svgCoords = getPosition(mySVG);
        emailCoords = getPosition(email);
        screenCenter = svgCoords.x + mySVG.offsetWidth / 2;
        eyeLCoords = { x: svgCoords.x + 84, y: svgCoords.y + 76 };
        eyeRCoords = { x: svgCoords.x + 113, y: svgCoords.y + 76 };
        noseCoords = { x: svgCoords.x + 97, y: svgCoords.y + 81 };
        mouthCoords = { x: svgCoords.x + 100, y: svgCoords.y + 100 };
        emailScrollMax = email.scrollWidth;

        if (armL && armR && mouth) {
          gsap.set(armL, { x: -93, y: 220, rotation: 105, transformOrigin: 'top left', visibility: 'hidden' });
          gsap.set(armR, { x: -93, y: 220, rotation: -105, transformOrigin: 'top right', visibility: 'hidden' });
          gsap.set(mouth, { transformOrigin: 'center center' });
        }

        startBlinking();

        email.addEventListener('focus', onEmailFocus);
        email.addEventListener('blur', onEmailBlur);
        email.addEventListener('input', onEmailInput);

        password.addEventListener('focus', onPasswordFocus);
        password.addEventListener('blur', onPasswordBlur);
        
        const check = showPasswordCheckRef.current;
        if (check) {
          check.addEventListener('change', onPasswordToggleChange);
          check.addEventListener('focus', onPasswordToggleFocus);
          check.addEventListener('blur', onPasswordToggleBlur);
        }
    };

    init();

    return () => {
      // --- Cleanup ---
      if (instance.blinking) instance.blinking.kill();
      email.removeEventListener('focus', onEmailFocus);
      email.removeEventListener('blur', onEmailBlur);
      email.removeEventListener('input', onEmailInput);
      password.removeEventListener('focus', onPasswordFocus);
      password.removeEventListener('blur', onPasswordBlur);
      const check = showPasswordCheckRef.current;
      if (check) {
          check.removeEventListener('change', onPasswordToggleChange);
          check.removeEventListener('focus', onPasswordToggleFocus);
          check.removeEventListener('blur', onPasswordToggleBlur);
      }
    };
  }, []); // El array vacío asegura que se ejecute solo una vez

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Animated Yeti Avatar */}
          <div className="flex justify-center mb-8">
            <div ref={svgContainerRef} className="relative w-48 h-48 rounded-full border-4 border-blue-700 overflow-hidden bg-gradient-to-b from-sky-200 to-blue-300">
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full"
                style={{ transform: 'scale(1.05)' }}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
              >
                <defs>
                    <circle id="armMaskPath" cx="100" cy="100" r="100" />
                </defs>
                <clipPath id="armMask">
                    <use xlinkHref="#armMaskPath" overflow="visible" />
                </clipPath>
                <circle cx="100" cy="100" r="100" fill="#a9ddf3" />
                <g className="body">
                    <path ref={bodyBGchangedRef} className="bodyBGchanged" style={{ display: 'none' }} fill="#FFFFFF" d="M200,122h-35h-14.9V72c0-27.6-22.4-50-50-50s-50,22.4-50,50v50H35.8H0l0,91h200L200,122z" />
                    <path ref={bodyBGRef} className="bodyBGnormal" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#FFFFFF" d="M200,158.5c0-20.2-14.8-36.5-35-36.5h-14.9V72.8c0-27.4-21.7-50.4-49.1-50.8c-28-0.5-50.9,22.1-50.9,50v50 H35.8C16,122,0,138,0,157.8L0,213h200L200,158.5z" />
                    <path fill="#DDF1FA" d="M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z" />
                </g>
                <g ref={outerEarLRef} className="earL">
                    <g className="outerEar" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="2.5">
                        <circle cx="47" cy="83" r="11.5" />
                        <path d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                    <g ref={earHairLRef} className="earHair">
                        <rect x="51" y="64" fill="#FFFFFF" width="15" height="35" />
                        <path d="M53.4 62.8C48.5 67.4 45 72.2 42.8 77c3.4-.1 6.8-.1 10.1.1-4 3.7-6.8 7.6-8.2 11.6 2.1 0 4.2 0 6.3.2-2.6 4.1-3.8 8.3-3.7 12.5 1.2-.7 3.4-1.4 5.2-1.9" fill="#fff" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </g>
                </g>
                <g ref={outerEarRRef} className="earR">
                     <g className="outerEar">
                        <circle fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" cx="153" cy="83" r="11.5" />
                        <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M153.7,78.9 c2.3,0,4.1,1.9,4.1,4.1c0,2.3-1.9,4.1-4.1,4.1" />
                    </g>
                    <g ref={earHairRRef} className="earHair">
                        <rect x="134" y="64" fill="#FFFFFF" width="15" height="35" />
                        <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M146.6,62.8 c4.9,4.6,8.4,9.4,10.6,14.2c-3.4-0.1-6.8-0.1-10.1,0.1c4,3.7,6.8,7.6,8.2,11.6c-2.1,0-4.2,0-6.3,0.2c2.6,4.1,3.8,8.3,3.7,12.5 c-1.2-0.7-3.4-1.4-5.2-1.9" />
                    </g>
                </g>
                <path ref={chinRef} className="chin" d="M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1" fill="none" stroke="#3a5e77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path ref={faceRef} className="face" fill="#DDF1FA" d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46" />
                <path ref={hairRef} className="hair" fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474" />
                <g ref={eyebrowRef} className="eyebrow">
                    <path fill="#FFFFFF" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599" />
                </g>
                <g ref={eyeLRef} className="eyeL">
                    <circle cx="85.5" cy="78.5" r="3.5" fill="#3a5e77" />
                    <circle cx="84" cy="76" r="1" fill="#ffffff" />
                </g>
                <g ref={eyeRRef} className="eyeR">
                    <circle cx="114.5" cy="78.5" r="3.5" fill="#3a5e77" />
                    <circle cx="113" cy="76" r="1" fill="#ffffff" />
                </g>
                <g ref={noseRef} className="nose">
                    <path d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z" fill="#3a5e77" />
                </g>
                <g ref={mouthRef} className="mouth">
                    <path ref={mouthBGRef} className="mouthBG" fill="#617E92" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                    <path ref={mouthOutlineRef} className="mouthOutline" stroke="#3A5E77" strokeWidth="2.5" fill="none" strokeLinejoin="round" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                    <path ref={mouthMaskPathRef} className="mouthMaskPath" d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                    <g ref={toothRef} className="tooth">
                        <polygon fill="#FFFFFF" stroke="#3A5E77" strokeWidth="0.5" points="106.8,100.5 108.8,102.5 110.8,100.5 " />
                    </g>
                    <g ref={tongueRef} className="tongue">
                        <ellipse fill="#F55D5D" cx="100" cy="102" rx="8" ry="4" />
                    </g>
                </g>
                {/* Hidden mouth shapes for morphing */}
                <path ref={mouthSmallBGRef} style={{ display: 'none' }} d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z" />
                <path ref={mouthMediumBGRef} style={{ display: 'none' }} d="M95,104 C95,108 97,110 100,110 C103,110 105,108 105,104 C105,100 103,98 100,98 C97,98 95,100 95,104 Z" />
                <path ref={mouthLargeBGRef} style={{ display: 'none' }} d="M92,106 C92,112 95,116 100,116 C105,116 108,112 108,106 C108,100 105,96 100,96 C95,96 92,100 92,106 Z" />
                
                {/* Arms */}
                <g ref={armLRef} className="armL" clipPath="url(#armMask)">
                    <polygon fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points="121.3,98.4 111,59.7 149.8,49.3 169.8,85.4 " />
                    <g ref={twoFingersRef} className="twoFingers">
                        <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M158.3,67.8l23.1-6.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-23.1,6.2" />
                        <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M160.8,77.5l19.4-5.2c2.7-0.7,5.4,0.9,6.1,3.5v0c0.7,2.7-0.9,5.4-3.5,6.1l-18.3,4.9" />
                    </g>
                </g>
                <g ref={armRRef} className="armR" clipPath="url(#armMask)">
                    <polygon fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points="78.7,98.4 89,59.7 50.2,49.3 30.2,85.4 " />
                    <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M41.7,67.8l-23.1-6.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l23.1,6.2" />
                    <path fill="#DDF1FA" stroke="#3A5E77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M39.2,77.5l-19.4-5.2c-2.7-0.7-5.4,0.9-6.1,3.5v0c-0.7,2.7,0.9,5.4,3.5,6.1l18.3,4.9" />
                </g>
              </svg>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-bold text-blue-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border-2 border-blue-600 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg font-semibold transition-all duration-200 bg-blue-50"
                placeholder="email@domain.com"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-bold text-blue-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 border-2 border-blue-600 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg font-semibold transition-all duration-200 bg-blue-50"
                  placeholder={t('auth.password')}
                />
                <label className="absolute top-1 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm font-medium mr-2">
                    {showPassword ? t('auth.hide') : t('auth.show')}
                  </span>
                  <input
                    ref={showPasswordCheckRef}
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 border-blue-600 rounded transition-all duration-200 ${
                    showPassword ? 'bg-blue-600' : 'bg-blue-50'
                  }`}>
                    {showPassword && (
                      <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </label>
              </div>
            </div>
        
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.signingIn')}
                  </div>
                ) : (
                  t('auth.signIn')
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onToggleForm}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 underline"
              >
                {t('auth.noAccount')} {t('auth.signUp')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}