# zelda9/persona-models

## Resumen

`zelda9/persona-models` no es un modelo entrenado por su autor, sino un repositorio agregador de seis modelos de vision por computador convertidos a ONNX y optimizados para ejecutarse en el navegador mediante ONNX Runtime Web. El autor, zelda9, publica estas copias como dependencias del servicio useotools.com, que procesa imagenes localmente en el dispositivo del visitante sin enviar datos a un servidor. El repositorio cubre tareas de segmentacion de imagen, eliminacion de fondo, inpainting, superresolucion, colorizacion de fotografias en blanco y negro y segmentacion interactiva tipo Segment Anything.

Los modelos originales son ISNet (eliminacion de fondo), MI-GAN y big-LaMa (inpainting), MobileSAM (segmentacion con prompts), la familia Real-ESRGAN (superresolucion 4x, incluidas variantes para anime) y DDColor-tiny (colorizacion). Cada uno conserva su licencia original (Apache-2.0, MIT o BSD-3-Clause) y se distribuye en carpetas independientes con su propio fichero `LICENSE`. La unica modificacion sustancial declarada por el autor es el reempaquetado de los pesos de ISNet a 7 bits por canal para reducir el tamano de descarga.

El repositorio tiene un tamano de 0.9 GB, no registra descargas ni likes en el momento de la consulta y no incluye informacion sobre idiomas ni sobre arquitecturas detalladas mas alla de los nombres de los modelos originales. Es relevante para desarrolladores que necesiten pipelines de vision ligeros, ejecutables en cliente (WebGPU/WASM) y con licencias permisivas, no como modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Varias: ISNet (U-Net con atencion intermedia), MI-GAN (GAN con inpainting por pasos), big-LaMa (transformer con Fourier convolutions), MobileSAM (ViT tiny + decoder de mascaras), Real-ESRGAN (RRDBNet), DDColor-tiny (transformer de colorizacion) |
| Parametros totales | no disponible (no se publican recuentos por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision, sin contexto textual) |
| Tipos de cuantizacion | Pesos en 7 bits por canal (ISNet); fp32 (big-LaMa); fp16 almacenado y convertido a float al cargar (DDColor-tiny); resto sin cuantizar declarada |
| Idiomas soportados | no disponible (no procesan texto) |
| Licencia | Mixta: MIT, Apache-2.0 y BSD-3-Clause, por carpeta |
| Formato de pesos | ONNX, algunos comprimidos con gzip (`.onnx.gz`) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye pesos ya entrenados por terceros. ISNet procede de DIS (xuebinqin/DIS) y se distribuye via rembg; MI-GAN y big-LaMa son modelos de inpainting de Picsart AI Research y advimman respectivamente; MobileSAM combina un encoder ViT tiny con el decoder de mascaras de Segment Anything; Real-ESRGAN aporta tres variantes de ruido (`dn0`, `dn50`, `dn100`), la version `x4plus` y la especializada en anime `x4plus-anime-6b`; DDColor-tiny realiza colorizacion a 512 x 512. No se documentan volumenes de tokens, composicion de datasets ni procesos de RLHF o DPO, porque son modelos de vision y el autor no los describe.

Las innovaciones tecnicas declaradas son de empaquetado y despliegue, no de entrenamiento. ISNet almacena sus pesos a 7 bits por canal para reducir el peso de la descarga, lo que exige una capa de dequantizacion al cargar. DDColor-tiny se distribuye con pesos fp16 almacenados pero convertidos a float en tiempo de carga mediante el script `scripts/onnx-fp16-storage.py`, porque la aritmetica fp16 en WebGPU producia colores incorrectos. Todos los grafos estan pensados para ONNX Runtime Web con ejecucion en WebGPU o WASM.

## Capacidades

- Eliminacion de fondo de imagenes con ISNet general-use, con pesos comprimidos a 7 bits y fichero gzip.
- Inpainting de regiones enmascaradas con MI-GAN, orientado a edicion rapida en navegador.
- Inpainting de alta calidad a 512 x 512 con big-LaMa en fp32.
- Segmentacion interactiva con MobileSAM: encoder de imagen y decoder de mascaras separados, aptos para prompts de punto o caja.
- Superresolucion 4x con Real-ESRGAN en tres niveles de reduccion de ruido, version general y version especializada en anime.
- Colorizacion de fotografias en blanco y negro con DDColor-tiny a 512 x 512.
- Ejecucion en el cliente mediante ONNX Runtime Web, sin backend servidor.
- No incluye generacion de texto, razonamiento, codigo, tool calling ni capacidades multilingues.

## Casos de uso

- Eliminacion de fondo en herramientas web de diseno: ISNet permite recortar sujetos en el navegador sin subir la imagen a un servidor, lo que simplifica el cumplimiento de privacidad y elimina costes de ancho de banda de subida.
- Retoque fotografico con inpainting: MI-GAN y big-LaMa permiten borrar objetos o rellenar huecos marcados por el usuario; big-LaMa a 512 x 512 ofrece mayor coherencia en regiones grandes, mientras que MI-GAN prioriza velocidad.
- Escalado de imagenes para impresion o catalogos: las variantes Real-ESRGAN 4x permiten aumentar resolucion de fotos y capturas; `x4plus-anime-6b` esta pensado para ilustracion y capturas de videojuegos.
- Restauracion de archivos fotograficos: DDColor-tiny colorea fotografias historicas en blanco y negro a 512 x 512, adecuado para visores y aplicaciones de memoria familiar.
- Segmentacion asistida en edicion: MobileSAM con encoder y decoder separados permite reutilizar el embedding de imagen y aplicar multiples prompts de mascara sin recalcular el encoder, util en interfaces de recorte interactivo.
- Procesamiento por lotes en el cliente: un pipeline que encadene eliminacion de fondo, inpainting y superresolucion puede ejecutarse integramente en el navegador con WebGPU, sin infraestructura de inferencia.
- Aplicaciones de privacidad estricta: al no requerir envio de imagenes a servidores, encaja en sectores como salud, legal o educacion donde el tratamiento local es un requisito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (PSNR, SSIM, FID, IoU), latencias ni throughput para ninguna de las variantes.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no publica tamanos por modelo ni consumo de memoria; el total del repo es de 0.9 GB, lo que da una cota superior del peso en disco de todos los ficheros juntos.
- GPU recomendadas: no disponibles. Al ejecutarse con ONNX Runtime Web, el hardware objetivo es el del cliente: GPUs integradas o dedicadas con soporte WebGPU, o CPU via WASM como fallback.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el enfoque en navegador y el uso de variantes tiny (DDColor-tiny, MobileSAM), pero no hay datos publicados de consumo de VRAM.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WASM). No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| ISNet (este repo) | Eliminacion de fondo | no disponible | no aplica | Apache-2.0 | ONNX (7 bits, gzip) |
| MI-GAN (este repo) | Inpainting | no disponible | no aplica | MIT | ONNX (gzip) |
| big-LaMa (este repo) | Inpainting 512 x 512 | no disponible | no aplica | Apache-2.0 | ONNX fp32 |
| MobileSAM (este repo) | Segmentacion con prompts | no disponible | no aplica | Apache-2.0 | ONNX (encoder + decoder) |
| Real-ESRGAN (este repo) | Superresolucion 4x | no disponible | no aplica | BSD-3-Clause | ONNX |
| DDColor-tiny (este repo) | Colorizacion 512 x 512 | no disponible | no aplica | Apache-2.0 | ONNX fp16 almacenado |

No se dispone de datos de rendimiento ni de recuentos de parametros para establecer comparaciones cuantitativas con alternativas como SAM completo, LaMa original en PyTorch o SwinIR. La comparativa se limita a licencia, formato y tarea.

## Limitaciones y advertencias

- El repositorio no entrena nada: cualquier problema de calidad, sesgo o alucinacion proviene de los modelos originales, no del autor del repo.
- No hay informacion sobre sesgos de los modelos subyacentes; los datasets de entrenamiento de ISNet, MI-GAN, LaMa, MobileSAM, Real-ESRGAN y DDColor no se detallan en la model card.
- La licencia es mixta y cada carpeta tiene su propio `LICENSE`; es obligatorio revisar la licencia de cada modelo antes de uso comercial. El campo `license: other` de Hugging Face no refleja por si solo los terminos aplicables.
- La modificacion de ISNet a 7 bits por canal puede introducir perdida de precision en la mascara de segmentacion; no se documenta evaluacion de esa degradacion.
- DDColor-tiny requiere la conversion de fp16 a float al cargar; usar el fichero sin ese paso puede producir colores incorrectos en WebGPU.
- Los modelos estan pensados para navegador: el rendimiento depende del soporte WebGPU del cliente y puede degradarse en WASM.
- No hay garantias de mantenimiento, versionado ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- No apto para tareas de texto, razonamiento, codigo ni agentes: es exclusivamente un conjunto de modelos de vision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zelda9/persona-models
- Servicio que lo usa: https://useotools.com
- ISNet / DIS: https://github.com/xuebinqin/DIS
- MI-GAN: https://github.com/Picsart-AI-Research/MI-GAN y https://huggingface.co/andraniksargsyan/migan
- big-LaMa: https://github.com/advimman/lama y https://huggingface.co/Carve/LaMa-ONNX
- MobileSAM: https://github.com/ChaoningZhang/MobileSAM y https://huggingface.co/Acly/MobileSAM
- Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN, https://huggingface.co/warpstead/enhance-models, https://huggingface.co/deepghs/imgutils-models
- DDColor: https://github.com/piddnad/DDColor y https://huggingface.co/edgetools/ddcolor
