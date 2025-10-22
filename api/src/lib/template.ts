export const template = (base64Image: string, qrDesign: any,isSvg:boolean = false): string => {
  const frameType = Number(qrDesign?.frame) || null;
  if (frameType === 1) {
    return generateQrHtml(base64Image, qrDesign,false,isSvg);
  } else if (frameType === 2) {
    return generateQrHtml(base64Image, qrDesign, true,isSvg);
  } else if (frameType === 5) {
    return generateQrHtml2(base64Image, qrDesign,false,isSvg);
  } else if (frameType === 6) {
    return generateQrHtml2(base64Image, qrDesign, true,isSvg);
  } else if (frameType === 3) {
    return generateQrHtml4(base64Image, qrDesign,false,isSvg);
  } else if (frameType === 4) {
    return generateQrHtml4(base64Image, qrDesign, true,isSvg);
  } else if (frameType === 7) {
    return generateQrHtml3(base64Image, qrDesign,isSvg);
  } else if (qrDesign.drawing) {
    return generateQrHtmlForDrawing(base64Image, qrDesign,isSvg);
  } else {
    return generateOriginalQr(base64Image, qrDesign,isSvg);
  }
};

// frame 1 and 2
export const generateQrHtml = (
  base64Image: string,
  qrDesign: any,
  reverse: boolean = false,
  isSvg:boolean=false,
) => {
  let backgroundImage = qrDesign?.bgImage?.base64
    ? qrDesign.bgImage.base64.replace(/\\/g, '/')
    : '';

  let backgroundColor = (() => {
    const bg = qrDesign?.backgroundOptions?.color;

    if (bg === 'transparent') return '#FFFFFF';
    if (qrDesign?.transparency === 0) return bg;

    return hexToRGBA(bg ?? '#FFFFFF', qrDesign?.transparency ?? 0);
  })();

  let imageOpacity =
    1 - Math.min(Math.max(qrDesign?.transparency ?? 0, 1), 100) / 100;
  return `
  <!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            margin: 0;
            background-color: transparent;
        }

        .qr-image {
            width: 100%;
            height: 100%;
            padding: 50px;
            position: absolute;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 100px;
            opacity: ${imageOpacity};
        }
    </style>
</head>

<body>
    <div style="
        background-color: black;
        width: ${isSvg ? '100%' : '987px'} ;
        height: ${isSvg ? '100%' :'1200px'};
        border-radius: 100px;
        padding: 12px;
      " class="container">
        <div style=" height: calc(100% - 11%);width: 100%; background-color:white ;
    position: relative;  border-radius: 100px;margin-top: ${reverse ? '13%' : '0%'} ">
            <div style=" position:absolute; background-color:${backgroundColor}; border-radius:100px; height:100%; width:100%">
            ${
              backgroundImage
              ? `<img src='${backgroundImage}'
              alt="bg" class="bg" crossOrigin="anonymous" />`
              : ''
            }
            </div>
            <img src="${base64Image}"
                alt="QR Code" class="qr-image" crossOrigin="anonymous" />
        </div>
    </div>
</body>

</html>
 
  `;
};

// frame 5 and 6
export const generateQrHtml2 = (
  base64Image: string,
  qrDesign: any,
  reverse: boolean = false,
  isSvg:boolean=false,
) => {
  let backgroundImage = qrDesign?.bgImage?.base64
    ? qrDesign.bgImage.base64.replace(/\\/g, '/')
    : '';

  let backgroundColor = (() => {
    const bg = qrDesign?.backgroundOptions?.color;

    if (bg === 'transparent') return '#FFFFFF';
    if (qrDesign?.transparency === 0) return bg;

    return hexToRGBA(bg ?? '#FFFFFF', qrDesign?.transparency ?? 0);
  })();
  let imageOpacity =
    1 - Math.min(Math.max(qrDesign?.transparency ?? 0, 1), 100) / 100;
  return `
  <!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            margin: 0;
            background-color: transparent;
        }

        .container {
         width: ${isSvg ? '100%' : '960px'} ;
        height: ${isSvg ? '100%' :'1200px'};
            display: flex;
            flex-direction: column;
            gap: 3.3%;
        }

        .bigContainerframe {
            height: calc(100% - 20%);
            width: 100%;
            --b: 8px;
            --c: #0000 25%, black 0;
            background: conic-gradient(from 90deg at top var(--b) left var(--b), var(--c)) 0 0, conic-gradient(from 180deg at top var(--b) right var(--b), var(--c)) 100% 0, conic-gradient(from 0deg at bottom var(--b) left var(--b), var(--c)) 0 100%, conic-gradient(from -90deg at bottom var(--b) right var(--b), var(--c)) 100% 100%;
            background-size: 20% 20%;
            background-repeat: no-repeat;
            display: flex;
            justify-content: center;
            align-items: center;
            order:${reverse ? 2 : 1} 
        }

        .bottomContainer {
            background-color: #000;
            width: 100%;
            height: calc(10% - 20px);
            border-radius: 6px;
            position: relative;
             order:${reverse ? 1 : 2} 
        }

        .bottomContainer::after {
            content: "";
            height: 52%;
            width: 11%;
            z-index: 20;
            position: absolute;
            background-color: #000;
            clip-path: polygon(50% 0, 100% 100%, 0 100%);
            left: calc(47%);
            margin-top: -5%;
            margin-top: ${reverse ? '10%' : '-5%'}; 
            transform: ${reverse ? 'rotate(180deg)' : 'none'}; 
        }

        .qr-image {
            width: 100%;
            height: 100%;
            padding: 20px;
            position: absolute;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
             opacity: ${imageOpacity}; 
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="bigContainerframe">
            <div style=" height: 96%;width: 96%;margin: auto;  background-color:${backgroundColor};
                       position: relative;">
 ${
   backgroundImage
     ? `<img src='${backgroundImage}'
                alt="bg" class="bg" crossOrigin="anonymous"/>`
     : ''
 }
            <img src="${base64Image}"
                alt="QR Code" class="qr-image" crossOrigin="anonymous" />
            </div>

        </div>
        <div class="bottomContainer">
        </div>
    </div>
</body>

</html>
   `;
};

// frame 7
export const generateQrHtml3 = (base64Image: string, qrDesign: any,isSvg:boolean=false) => {
  let backgroundImage = qrDesign?.bgImage?.base64
    ? qrDesign.bgImage.base64.replace(/\\/g, '/')
    : '';

  let backgroundColor = (() => {
    const bg = qrDesign?.backgroundOptions?.color;

    if (bg === 'transparent') return '#FFFFFF';
    if (qrDesign?.transparency === 0) return bg;

    return hexToRGBA(bg ?? '#FFFFFF', qrDesign?.transparency ?? 0);
  })();
  let imageOpacity =
    1 - Math.min(Math.max(qrDesign?.transparency ?? 0, 1), 100) / 100;

  return `
     <!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            margin: 0;
            background-color: transparent;
        }

        .container {
            width: ${isSvg ? '100%' : '987px'} ;
            height: ${isSvg ? '100%' :'1200px'};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        .bigContainer {
            height: calc(100% - 20%);
            width: 90%;
            background-repeat: no-repeat;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 40px;
            background-color: #000;
        }

        .bottomContainer {
            background-color: #000;
            width: 90%;
            height: calc(18% - 20px);
            margin-top: 0px;
            border-radius: 50px;
            position: relative;
        }

        .qr-image {
            width: 100%;
            height: 100%;
            padding: 40px;
            position: absolute;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 20px;
            opacity: ${imageOpacity}; 
        }
        .bg-frame{
          position:absolute;
          width:100%;
          height:100%
          background-color:white;
        }
        .ribbon {
            --r: 1.2em;
            z-index: -11;
            position: absolute;
            bottom: 10%;
            clip-path: polygon(0 0, 100% 0, calc(100% - var(--r)) 50%, 100% 100%, 0 100%, var(--r) 50%);
            background: #000;
            width: 100%;
            height: 18%;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="bigContainer">
        <div style="height:95%;width:95%; margin:auto;border-radius:20px;background-color:white; position:relative">
            <div style=" position:absolute; width:100%; height:100%; border-radius: 20px; background-color: ${backgroundColor};">
                       ${
                        backgroundImage
                          ? `<img src='${backgroundImage}'
                                    alt="bg" class="bg" crossOrigin="anonymous" />`
                          : ''
                      }
                       </div>
                       
                                 <img src="${base64Image}"
                                     alt="QR Code" class="qr-image" crossOrigin="anonymous" />
            </div>

        </div>
        <div class="bottomContainer">
        </div>
        <div class="ribbon"></div>
    </div>
</body>

</html>
  `;
};
// frame 3 and 4
export const generateQrHtml4 = (
  base64Image: string,
  qrDesign: any,
  reverse: boolean = false,
  isSvg:boolean=false,
) => {
  let backgroundImage = qrDesign?.bgImage?.base64
    ? qrDesign.bgImage.base64.replace(/\\/g, '/')
    : '';
  let backgroundColor = (() => {
    const bg = qrDesign?.backgroundOptions?.color;

    if (bg === 'transparent') return '#FFFFFF';
    if (qrDesign?.transparency === 0) return bg;

    return hexToRGBA(bg ?? '#FFFFFF', qrDesign?.transparency ?? 0);
  })();

  let imageOpacity =
    1 - Math.min(Math.max(qrDesign?.transparency ?? 0, 1), 100) / 100;

  return `
  <!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            margin: 0;
            background-color: transparent;
        }

        .container {
         width: ${isSvg ? '100%' : '1054px'} ;
        height: ${isSvg ? '100%' :'1200px'};
            display: flex;
            flex-direction: column;
            gap: 4%;
        }

        .bigContainer {
            height: calc(100% - 20%);
            width: 100%;
            background-repeat: no-repeat;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #000;
            border-radius: 100px;
            order:${reverse ? 2 : 1}
        }

        .bottomContainer {
            background-color: #000;
            width: 100%;
            height: calc(16% - 20px);
            border-radius: 50px;
            position: relative;
             order:${reverse ? 1 : 2} 
        }

        .bottomContainer::after {
            content: "";
            height: 52%;
            width: 11%;
            z-index: 20;
            position: absolute;
            background-color: #000;
            clip-path: polygon(50% 0, 100% 100%, 0 100%);
            left: calc(47%);
            margin-top: ${reverse ? '12.5%' : '-5%'};
            transform: ${reverse ? 'rotate(180deg)' : 'none'};
        }

        .qr-image {
            width: 100%;
            height: 100%;
            padding: 40px;
            position: absolute;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 88px;
            opacity: ${imageOpacity};
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="bigContainer">
            <div style=" height: 96%;width: 96%;margin: auto; border-radius: 88px; background-color: ${backgroundColor};
                       position: relative;">
                       ${
                         backgroundImage
                           ? `<img src='${backgroundImage}'
                                    alt="bg" class="bg" crossOrigin="anonymous" />`
                           : ''
                       }
                                <img src="${base64Image}"
                                    alt="QR Code" class="qr-image" crossOrigin="anonymous" />
            </div>

        </div>
        <div class="bottomContainer">
        </div>
    </div>
</body>

</html>
      
  `;
};

// frame 0
export const generateOriginalQr = (base64Image: string, qrDesign: any,isSvg:boolean=false) => {

  let backgroundImage = qrDesign?.bgImage?.base64
    ? qrDesign.bgImage.base64.replace(/\\/g, '/')
    : '';

  let backgroundColor = (() => {
    const bg = qrDesign?.backgroundOptions?.color;

    if (bg === 'transparent') return '#FFFFFF';
    if (qrDesign?.transparency === 0) return bg;

    return hexToRGBA(bg ?? '#FFFFFF', qrDesign?.transparency ?? 0);
  })();

  if (backgroundImage && backgroundColor === '#FFFFFF') {
    backgroundColor = 'transparent';
  }

  // Convert transparency (1-100) to opacity (0.01 - 1)
  let imageOpacity =
    1 - Math.min(Math.max(qrDesign?.transparency ?? 0, 1), 100) / 100;
  return `
       <!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            margin: 0;
            background-color: transparent;
        }

        .container {
            width: ${isSvg ? '100%' : '1200px'} ;
            height: ${isSvg ? '100%' :'1200px'};
            display: flex;
            flex-direction: column;
            position: relative;
            border-radius: 14px;
            background: ${backgroundColor};
        } 
        
        .qr-image {
            width: 100%;
            height: 100%;
            padding: 40px;
            position: relative;
        }

        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            opacity: ${imageOpacity}; /* Apply calculated opacity */
        }

    </style>
</head>

<body>

 <div class="container">
        ${
          backgroundImage
            ? `<img src='${backgroundImage}'
                alt="bg" class="bg" crossOrigin="anonymous"/>`
            : ''
        }
            
        <img src="${base64Image}"
                alt="QR Code" class="qr-image" crossOrigin="anonymous" />
 </div>

</body>

</html>`;
};

// drawing frame
export const generateQrHtmlForDrawing = (
  base64Image: string,
  qrDesign: any,
  isSvg:boolean=false,
) => {
  let backgroundImage = qrDesign?.bgImage?.base64
    ? qrDesign.bgImage.base64.replace(/\\/g, '/')
    : '';
  let backgroundDrawingImage = qrDesign?.drawing
    ? qrDesign?.drawing.replace(/\\/g, '/')
    : '';
  // let backgroundColor = (() => {
  //   const bg = qrDesign?.backgroundOptions?.color;

  //   if (bg === 'transparent') return '#FFFFFF';
  //   if (qrDesign?.transparency === 0) return bg;

  //   return hexToRGBA(bg ?? '#FFFFFF', qrDesign?.transparency ?? 0);
  // })();
  let backgroundColor = qrDesign?.backgroundOptions?.color;
  let imageOpacity =
    1 - Math.min(Math.max(qrDesign?.transparency ?? 0, 1), 100) / 100;

  return `
  <!doctype html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            margin: 0;
            background-color: transparent;
        }

        .container {
             width: ${isSvg ? '100%' : '1000px'} ;
              height: ${isSvg ? '100%' :'1200px'};
            position: relative;
            bottom: 19px;
        }

        .drawing {
            width: 100%;
            height: 100%;
            position: absolute;
        }

        .qr-image {
            top: 24%;
            width: 53%;
            height: 45%;
            padding: ${isSvg ? "12px" : "40px" };
            position: absolute;
        }

        .bg-container {
            height:100%;
            // padding: 20px;
            background-color: ${backgroundColor};
            width:100%;
        }

        .bg {
            width: 100%;
            height: 100%;
            opacity: ${imageOpacity};

        }
            .bg-frame{
            top: 24%;
            position: absolute;
            width: 53%;
            height: 45%;
            display: flex;
            justify-content: center;
            align-items: center;
              background-color:white;
              
            }
    </style>
</head>

<body>

    <div class="container">
        <div style="width: 100%;
        height: 100%;
        padding: 34px;
        display: flex;
        justify-content: center;
        align-items: center;">
            <img src='${backgroundDrawingImage}'
                alt="bg" class="drawing" crossOrigin="anonymous" />
            

                <div class="bg-frame">
            <div class="bg-container">
            ${
              backgroundImage
                ? `<img src='${backgroundImage}'
                          alt="bg" class="bg" crossOrigin="anonymous" />`
                : ''
            }
            
            </div>
            </div>
            
             <img src="${base64Image}" alt="QR Code" class="qr-image" crossOrigin="anonymous" />
        </div>

    </div>

</body>

</html>
        `;
};

function hexToRGBA(hex: string, transparency: number): string {
  hex = hex.replace(/^#/, '');

  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Transparency is 0-100, so we convert it to 0-1 opacity scale
  let opacity = (100 - (transparency ?? 0)) / 100;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
