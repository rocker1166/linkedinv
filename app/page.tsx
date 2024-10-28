import Link from 'next/link'
import React from 'react'

function Landing() {
  return (
    <div>Landing page joy guru
      <Link className=' text-red-700  font-semibold gap-8 p-10 ' href='/user'>dashbaord</Link>
    </div>
  )
}

export default Landing