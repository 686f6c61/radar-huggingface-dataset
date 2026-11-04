# TAVAAZO/idol

## Resumen

Idol es un modelo de generacion 3D a partir de una unica imagen desarrollado por TAVAAZO (con codigo y pesos publicados por Sperid Labs). Recibe una fotografia, un render o una imagen generada de un objeto y produce un Gaussian splat 3D en formato `.ply` estandar, con hasta 1.048.576 gaussianas, incluyendo la geometria de las caras que la imagen de entrada nunca mostro. El pipeline interno encadena eliminacion de fondo, encuadre automatico y generacion de la representacion 3D.

El modelo combina un denoiser basado en Diffusion Transformer (DiT) de 370,6 M de parametros con un decodificador de octree (50,8 M) y un decodificador de gaussianas (237,3 M), apoyandose en dos codificadores de imagen preentrenados: DINOv3 ViT-H+/16 (840,6 M) y el VAE de FLUX.2 (84,1 M), ademas de BiRefNet (220,7 M) para la segmentacion del objeto. El conjunto de la peticion ronda los 1,80 B de parametros, con un pico de 7,2 GB de VRAM y latencias inferiores a 2 segundos en GPU de consumo.

Es relevante porque democratiza la reconstruccion 3D de objeto unico: no requiere multiples vistas ni un proceso de optimizacion por escena, corre en tarjetas consumer, exporta a un formato compatible con cualquier visor de Gaussian splatting y se publica bajo licencia Apache 2.0, lo que facilita su integracion en pipelines de contenido, e-commerce o videojuegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline generativo: DiT (denoiser) + decodificador de octree + decodificador de gaussianas; codificadores DINOv3 ViT-H+/16 y VAE de FLUX.2; BiRefNet para segmentacion |
| Parametros totales | ~1,80 B por peticion (DiT 370,6 M, octree 50,8 M, gaussian decoder 237,3 M, BiRefNet 220,7 M, DINOv3 840,6 M, VAE 84,1 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo imagen-a-3D, no textual) |
| Tipos de cuantizacion | no disponible (pesos en FP16/bf16 en GPU, con embeddings y norms en FP32; opcion `--dinov3_dtype fp32`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos propios del SDK `idol` (~3 GB); salida en `.ply` de 3D Gaussian Splatting; codificadores auxiliares en safetensors desde Hugging Face |

## Arquitectura y entrenamiento

Idol es un modelo generativo condicionado por imagen. La imagen de entrada pasa primero por BiRefNet, que elimina el fondo, y por un recorte automatico cuyo margen depende del modo (`synthetic` deja el objeto ocupando 1/1,2 del encuadre; `real` lo deja en 1/1,7). La imagen resultante se codifica con DINOv3 ViT-H+/16 y con el VAE de FLUX.2. Un Diffusion Transformer actua como denoiser sobre una representacion latente que un decodificador de octree convierte en estructura espacial y que un decodificador de gaussianas transforma finalmente en hasta 1.048.576 gaussianas 3D con sus atributos (posicion, escala, rotacion, opacidad y color), exportadas como `.ply` estandar de 3DGS.

El muestreo es de tipo difusion con classifier-free guidance (`--cfg_strength` por defecto 3,0), 50 pasos por defecto y un parametro de desplazamiento temporal (`--rescale_t`, 3,0) que reparte los pasos entre forma global y detalle fino. La prediccion incluye la camara de la vista de entrada, que se guarda en un `.json` junto al `.ply`. En GPU hay una ruta de muestreo optimizada activada por defecto (~1,7x de aceleracion con la misma calidad) que compila el denoiser con `torch.compile`, agrupa las pasadas guiada y no guiada en un solo batch y usa atencion cuDNN con matmuls TF32. No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de Gaussian splats 3D completos a partir de una sola imagen de objeto, incluyendo las caras no visibles en la entrada.
- Eliminacion automatica de fondo y encuadre del objeto integrados en el pipeline, sin preprocesado manual.
- Prediccion de la camara de la imagen de entrada, exportada como metadato JSON.
- Dos modos de encuadre (`synthetic` y `real`) adaptados a renders o imagenes generadas frente a fotografias reales.
- Control del numero de gaussianas de salida entre 32.768 y 1.048.576, en multiplos de 32.
- Control fino del muestreo mediante semilla, numero de pasos, fuerza de classifier-free guidance y desplazamiento temporal.
- Salida en formato `.ply` de 3D Gaussian Splatting estandar, compatible con visores y herramientas del ecosistema 3DGS.
- Uso desde linea de comandos (`python -m idol.sample`) y desde Python (`IdolPipeline`).
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural: es un modelo exclusivamente imagen-a-3D.

## Casos de uso

- Catalogos de e-commerce: a partir de la fotografia principal de un producto se genera un splat 3D navegable para fichas interactivas, sin sesion de fotografia multi-vista; el modo `real` y el recorte 1/1,7 estan pensados para este tipo de entrada.
- Prototipado rapido en videojuegos: convertir concept art o renders en assets 3D iniciales (hasta 1.048.576 gaussianas) para blockouts y revisiones de direccion de arte antes de modelado definitivo.
- Escaneo 3D desde movil: el modelo cabe en 7,2 GB de VRAM y genera en menos de 2 segundos, lo que permite reconstruir objetos capturados con la camara del telefono en un servicio en la nube con GPU consumer.
- Realidad aumentada y experiencias web: los `.ply` de 3DGS se cargan en visores WebGL, de modo que se pueden publicar objetos capturados con una sola foto en tiendas o catalogos AR.
- Generacion de assets para impresion 3D y previsualizacion: obtener una representacion volumetrica rapida del objeto para validar proporciones y vistas antes de un modelado CAD o de un proceso de mallado.
- Aumento de datasets 3D: usar el modelo para producir splats sinteticos a partir de imagenes existentes y ampliar corpus de entrenamiento o evaluacion para otros sistemas de vision 3D.
- Integracion en pipelines de contenido generativo: encadenar la salida de un generador de imagenes (por ejemplo, el propio FLUX.2 cuyo VAE se reutiliza) con Idol para pasar de prompt a objeto 3D en un flujo automatizado.

## Benchmarks y rendimiento

La model card incluye una comparativa frente a TripoSplat, TRELLIS y LGM con metricas en la vista de entrada (PSNR, SSIM, LPIPS, IoU) y en siete vistas nuevas (DINOv2, CLIP, distancia de nitidez), medida en 1 x H100 por modelo. Sin embargo, en la informacion proporcionada la tabla aparece truncada tras la cabecera y no se incluyen los valores numericos por modelo.

| Modelo | Setting | PSNR | SSIM | LPIPS | IoU | DINOv2 | CLIP | Nitidez |
|---|---|---|---|---|---|---|---|---|
| Idol | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TripoSplat | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| TRELLIS | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| LGM | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos de rendimiento operativo si publicados: pico de 7,2 GB de VRAM, generacion en menos de 2 segundos por imagen y aceleracion de ~1,7x con el muestreo optimizado (torch.compile, batch unificado y atencion cuDNN con TF32).

## Requisitos de hardware

- VRAM: 7,2 GB de pico por peticion; los pesos ocupan aproximadamente 3,7-4,4 GB (DiT ~0,8-1,0 GB, octree ~0,1-0,2 GB, decodificador de gaussianas ~0,5-0,9 GB, BiRefNet ~0,44 GB, DINOv3 ~1,68 GB, VAE ~0,17 GB).
- GPU recomendadas: cualquier NVIDIA con CUDA y al menos 8 GB de VRAM; el modelo esta disenado explicitamente para GPU de consumo. En H100 se han medido los benchmarks del autor; A100 y RTX 4090 son opciones holgadas.
- Cabe en GPU consumer: si, con 8 GB o mas (por ejemplo, RTX 3060 Ti/4060 Ti de 8 GB en el limite, RTX 4070/4080/4090 con margen). Con `--dinov3_dtype fp32` se anaden 1,7 GB de memoria.
- Despliegue: SDK oficial `idol-sdk` (Python 3.10+, PyTorch 2.5+, CUDA), uso por CLI o mediante `IdolPipeline`; la salida `.ply` se visualiza en cualquier visor de Gaussian splatting. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: menos de 2 segundos por imagen en GPU; ~1,7x mas rapido con el muestreo optimizado activado por defecto. La primera imagen de cada proceso es mas lenta por la compilacion de `torch.compile`.
- Requisito adicional: hay que aceptar los terminos de los modelos con acceso restringido `facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-dev` (solo se descarga su VAE) e iniciar sesion con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Idol | ~1,80 B por peticion | 1 imagen | Hasta 1.048.576 gaussianas 3DGS (.ply) | no aplica | Apache 2.0 | Pesos en Hugging Face + SDK en GitHub |
| TripoSplat | no disponible | no disponible | no disponible | no disponible | no disponible | Citado como baseline en la model card |
| TRELLIS | no disponible | no disponible | no disponible | no disponible | no disponible | Citado como baseline en la model card |
| LGM | no disponible | no disponible | no disponible | no disponible | no disponible | Citado como baseline en la model card |

Los tres modelos de comparacion aparecen unicamente como referencias de benchmark en la model card; la informacion proporcionada no incluye sus especificaciones ni sus resultados numericos, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo de objeto unico: la entrada debe contener un solo objeto; escenas, multiples objetos o fondos complejos no estan contemplados por el pipeline de recorte y encuadre.
- Riesgo de invencion geometrica: al generar las caras no visibles, la geometria trasera es plausible pero no verificada; no es una reconstruccion fiel y no debe usarse para metrologia o ingenieria inversa de precision.
- Dependencia de modelos con acceso restringido: sin aceptar los terminos de DINOv3 y FLUX.2 en Hugging Face, el pipeline se detiene antes de descargar nada.
- Sin datos publicados de sesgos, composicion del dataset ni evaluacion multilingue o cultural; la calidad puede degradarse en categorias de objeto poco representadas en el entrenamiento.
- La tabla de benchmarks de la model card esta incompleta en la informacion disponible, de modo que no se puede verificar la superioridad frente a TripoSplat, TRELLIS o LGM.
- La licencia Apache 2.0 cubre los pesos de Idol, pero los codificadores auxiliares (DINOv3, FLUX.2 VAE) tienen sus propias condiciones de uso que deben respetarse en produccion.
- Requiere GPU NVIDIA con CUDA; no se documenta soporte para CPU, AMD ROCm o Apple Silicon.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: es un modelo reciente y poco validado por la comunidad, lo que desaconseja adoptarlo en produccion critica sin evaluacion propia.
- No procesa texto ni instrucciones en lenguaje natural; cualquier caso de uso conversacional o de agente queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TAVAAZO/idol
- Pagina del proyecto: https://speridlabs.com/research/idol
- Codigo (SDK): https://github.com/speridlabs/idol-sdk
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/speridlabs/idol
- Codificador DINOv3 ViT-H+/16: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Video de ejemplos: https://huggingface.co/speridlabs/idol/resolve/main/assets/reel.mp4
