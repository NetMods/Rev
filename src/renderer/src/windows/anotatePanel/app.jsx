const AnotateApp = () => {
  console.log('inside anoatate')

  const handelStopAnotating = () => {
    console.log('clicked on stop')
    window.api.stopAnotatingScreen()
  }


  return (
    <button onClick={handelStopAnotating} className="border border-black no-drag" >Done</button>
  )
}


export default AnotateApp
