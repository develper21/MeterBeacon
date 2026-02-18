import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useStaggerReveal(selector: string, deps: any[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const els = containerRef.current.querySelectorAll(selector);
    if (els.length === 0) return;

    gsap.fromTo(
      els,
      { opacity: 0, y: 24, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }, deps);

  return containerRef;
}

export function useCountUp(
  targetValue: number,
  duration = 1.2
) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const obj = { value: 0 };
    gsap.to(obj, {
      value: targetValue,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.round(obj.value).toString();
        }
      },
    });
  }, [targetValue, duration]);

  return ref;
}

export function usePageReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const children = ref.current.children;
    gsap.fromTo(
      children,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all",
      }
    );
  }, []);

  return ref;
}
