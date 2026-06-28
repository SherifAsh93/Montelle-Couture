export function AnnouncementBar() {
  const messages = [
    '✦ Worldwide Shipping Available',
    '✦ Free Shipping on Orders Over 800 EGP',
    '✦ Easy Returns & Exchanges',
    '✦ Handcrafted with Premium Fabrics',
    '✦ Custom Orders Welcome',
  ]
  const text = messages.join('     ')

  return (
    <div className="bg-dark-900 text-cream-100 text-[10px] tracking-widest py-2.5 overflow-hidden">
      <div className="overflow-hidden">
        <span
          className="inline-block whitespace-nowrap animate-marquee"
          style={{ willChange: 'transform' }}
        >
          {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}
        </span>
      </div>
    </div>
  )
}
