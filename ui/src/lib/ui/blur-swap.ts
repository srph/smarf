// Two states swapping in place: one blurs out as the other sharpens in. Put blurSwap on both, and blurSwapHidden on
// whichever is out. ButtonLoader's label and icon use it, and so does the board's dock as it takes over from New
// Board's "Creating" bar.
const blurSwap = 'transition duration-250 ease-morph motion-reduce:transition-none'
const blurSwapHidden = 'opacity-0 blur-xs'

export { blurSwap, blurSwapHidden }
