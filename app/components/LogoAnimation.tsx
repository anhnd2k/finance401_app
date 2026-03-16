'use client';

import {
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import Link from 'next/link';

type Dir = 'top' | 'bottom' | 'left' | 'right';

const WORDS: { text: string; dir: Dir }[] = [
    { text: 'ALL', dir: 'top' },
    { text: 'I', dir: 'bottom' },
    { text: 'WANT', dir: 'left' },
    { text: 'IS', dir: 'right' },
    { text: 'TO', dir: 'top' },
    { text: 'BE', dir: 'bottom' },
    { text: 'FREE', dir: 'left' },
];

const FONTS = [
    '"Courier New", monospace',
    'Georgia, serif',
    'Impact, fantasy',
    '"Palatino Linotype", Palatino, serif',
    '"Arial Black", Gadget, sans-serif',
    '"Comic Sans MS", cursive',
    '"Trebuchet MS", sans-serif',
    '"Times New Roman", Times, serif',
    '"Lucida Console", Monaco, monospace',
    '"Book Antiqua", Palatino, serif',
    '"Ballet", cursive',
];

const DIR_CLASS: Record<Dir, string> = {
    top: 'logo-slide-top',
    bottom: 'logo-slide-bottom',
    left: 'logo-slide-left',
    right: 'logo-slide-right',
};

const WORD_DURATION = 560;
const FONT_INTERVAL = 140;
const FONT_CYCLES = 18;

export default function LogoAnimation({
    href,
}: {
    href: string;
}) {
    const [phase, setPhase] = useState<
        'animating' | 'done'
    >('animating');
    const [wordIdx, setWordIdx] = useState(0);
    const [fontIdx, setFontIdx] = useState(0);
    const timers = useRef<
        ReturnType<typeof setTimeout>[]
    >([]);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };

    const play = useCallback(() => {
        clearTimers();
        setPhase('animating');
        setWordIdx(0);
        setFontIdx(0);

        let elapsed = 0;
        for (let i = 1; i < WORDS.length; i++) {
            const idx = i;
            elapsed += WORD_DURATION;
            timers.current.push(
                setTimeout(
                    () => setWordIdx(idx),
                    elapsed
                )
            );
        }

        elapsed += Math.round(
            WORD_DURATION * 0.45
        );
        for (let fi = 0; fi < FONT_CYCLES; fi++) {
            const fi2 = fi;
            timers.current.push(
                setTimeout(
                    () =>
                        setFontIdx(
                            fi2 % FONTS.length
                        ),
                    elapsed + fi2 * FONT_INTERVAL
                )
            );
        }
        elapsed +=
            FONT_CYCLES * FONT_INTERVAL + 200;

        timers.current.push(
            setTimeout(
                () => setPhase('done'),
                elapsed
            )
        );
    }, []);

    useEffect(() => {
        play();
        return clearTimers;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleMouseEnter = useCallback(() => {
        if (phase === 'done') play();
    }, [phase, play]);

    const word = WORDS[wordIdx];
    const isFree = wordIdx === WORDS.length - 1;

    return (
        /*
         * Layout trick: an invisible spacer always occupies the "done" state's
         * full size, preventing any layout shift during animation.
         * Both the animated word and done-state text are position:absolute on top.
         *
         * Key insight for "ALL twice" bug: we use only `wordIdx` as the span key,
         * NOT a runKey. On replay, the whole animating block unmounts (phase='done')
         * then remounts (phase='animating'), which already resets the animation.
         * Adding a runKey caused setRunKey() to remount the span mid-first-play.
         */
        <Link
            href={href}
            // onMouseEnter={handleMouseEnter}
            className="relative inline-flex cursor-pointer"
        >
            {/* ── Invisible spacer — always rendered, drives layout width/height ── */}
            <span
                className="invisible flex items-center"
                aria-hidden="true"
            >
                <span className="text-2xl font-bold tracking-tight">
                    runtocoast
                </span>
                <span className="mx-3 hidden sm:inline">
                    |
                </span>
                <span className="hidden text-xs sm:inline">
                    meaning?
                </span>
            </span>

            {/* ── Animated word layer — absolute, clipped so it never leaks out ── */}
            {phase === 'animating' && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <span
                        key={wordIdx}
                        className={`whitespace-nowrap text-2xl font-black ${DIR_CLASS[word.dir]}`}
                        style={
                            isFree
                                ? {
                                      fontFamily:
                                          FONTS[
                                              fontIdx
                                          ],
                                  }
                                : undefined
                        }
                    >
                        {word.text}
                    </span>
                </span>
            )}

            {/* ── Done state — freshly mounted so CSS animations fire naturally ── */}
            {phase === 'done' && (
                <span className="pointer-events-none absolute inset-0 flex items-center">
                    <span className="logo-fade-in text-2xl font-bold tracking-tight">
                        runtocoast
                    </span>
                    <span className="logo-fade-in mx-3 hidden select-none text-gray-300 dark:text-gray-600 sm:inline">
                        |
                    </span>
                    <span className="logo-slide-tagline hidden text-xs italic text-gray-500 dark:text-gray-400 sm:inline">
                        meaning?
                    </span>
                </span>
            )}
        </Link>
    );
}
