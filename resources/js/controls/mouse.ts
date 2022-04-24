export const onClick = (e: MouseEvent) => {
  console.log(`(${e.clientX}, ${e.clientY})`);
}

export const mouseEventInit = () => {
    window.addEventListener('click', onClick);

    window.addEventListener('mousewheel', function( event: any ) {
        console.log('mousewheel',event.deltaX, event.deltaY, event.deltaFactor);
    })

    window.addEventListener('pressmove', function( e: any ) {
        console.log(`pressmove (${e.clientX}, ${e.clientY})`);
    })

    window.addEventListener('pressup', function( e: any ) {
        console.log(`pressup (${e.clientX}, ${e.clientY})`);
    })

    window.addEventListener('mouseup', function( e: any ) {
        console.log(`mouseup (${e.clientX}, ${e.clientY})`);
    })

    window.addEventListener('mousedown', function( e: any ) {
        console.log(`mousedown (${e.clientX}, ${e.clientY})`);
    })

}