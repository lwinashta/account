import React,{useEffect} from 'react';
export const Modal=({header,onCloseHandler,children})=>{

    let headerRef=React.createRef();
    let bodyRef=React.createRef();

    useEffect(() => {//takes care of the component states
        //console.log($(headerRef.current).height());
        $(bodyRef.current).css({top:$(headerRef.current).height()+20+'px'});
        $('body').addClass('overflow-hidden');
    });

    const handleClose=()=>{//handles the close button click event
        $('body').removeClass('overflow-hidden');
        onCloseHandler(false);
    }

    //Slides the modal from bottom if mobile view 
    let classes="responsive-modal";
    if(window.visualViewport.width<=768){
        classes+=" slide-from-bottom "
    }
    
    return(
        <div className={classes} >
            <div className="responsive-modal-overlay"></div>
            <div className="responsive-modal-content">
                <div className="responsive-modal-inner-content">
                    <div className="p-2 position-relative" ref={headerRef}>
                        <div>{header}</div>
                        <div className="push-right pointer" 
                            onClick={()=>handleClose(false)}>
                            <i className="material-icons">close</i>
                        </div>
                    </div>
                    <div className="mt-2 responsive-modal-body border-top" ref={bodyRef}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
        
    )
}