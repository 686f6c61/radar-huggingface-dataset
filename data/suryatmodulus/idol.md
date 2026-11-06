# suryatmodulus/idol

## Resumen

Idol es un modelo de generación 3D a partir de una única imagen, desarrollado por Sperid Labs (publicado en Hugging Face bajo el identificador `suryatmodulus/idol`). Su tarea es convertir una fotografía o un render de un objeto en una representación de *3D Gaussian splatting* (3DGS) estándar en formato `.ply`, incluyendo la geometría de las caras del objeto que la imagen de entrada nunca mostró. El modelo infiere la forma completa del objeto a partir de una sola vista, lo que lo sitúa en la categoría de modelos image-to-3D generativos.

La arquitectura combina un transformer de difusión (DiT) como denoiser, un decoder octree y un decoder de gaussianas, apoyados en encoders de imagen preentrenados (DINOv3 ViT-H+/16 y el VAE de FLUX.2) y un módulo de eliminación de fondo (BiRefNet). El conjunto suma aproximadamente 1.800 millones de parámetros, de los cuales el denoiser DiT aporta 370,6 M. Está diseñado para ejecutarse en GPU de consumo, con un pico de 7,2 GB de VRAM y tiempos de inferencia por debajo de los 2 segundos en hardware adecuado.

Su relevancia actual reside en la combinación de calidad generativa, velocidad y requisitos de hardware moderados: genera hasta 1.048.576 gaussianas con un pipeline que cabe en tarjetas consumer, algo poco habitual en modelos image-to-3D de esta categoría. La licencia Apache 2.0 facilita su integración en productos comerciales, si bien depende de encoders con acceso restringido (gated) en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) como denoiser + decoder octree + decoder de gaussianas; encoders DINOv3 ViT-H+/16 y VAE de FLUX.2; BiRefNet para segmentacion de fondo |
| Parametros totales | ~1,80 B (DiT 370,6 M; decoder octree 50,8 M; decoder de gaussianas 237,3 M; BiRefNet 220,7 M; DINOv3 840,6 M; VAE FLUX.2 84,1 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (precision FP16/bf16 en GPU; FP32 opcional para el encoder DINOv3) |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de ~3,1 GB); salida en `.ply` estandar de 3DGS |

## Arquitectura y entrenamiento

Idol es un modelo generativo de difusion aplicado al espacio de las gaussianas 3D. El denoiser principal es un transformer de difusion (DiT) de 370,6 M de parametros que opera sobre una representacion latente guiada por la imagen de entrada. A continuacion, un decoder octree (50,8 M) y un decoder de gaussianas (237,3 M) transforman esa representacion en un conjunto de hasta 1.048.576 gaussianas, cada una con sus parametros de posicion, escala, rotacion, opacidad y color. La entrada se procesa mediante dos encoders congelados: DINOv3 ViT-H+/16 (840,6 M parametros) para la semantica de la imagen y el VAE de FLUX.2 (84,1 M) para la informacion visual de bajo nivel; un modulo BiRefNet (220,7 M) elimina el fondo y recorta el objeto antes de la generacion.

El pipeline incorpora muestreo con *classifier-free guidance* (por defecto `cfg_strength=3.0`), un desplazamiento temporal (`rescale_t=3.0`) que reparte los pasos entre forma global y detalle fino, y un modo de muestreo acelerado activado por defecto en GPU que combina `torch.compile` del denoiser, la ejecucion conjunta de las pasadas guiada y no guiada como un solo lote y atencion con cuDNN y matmuls en TF32, con una mejora de velocidad de aproximadamente 1,7x sin perdida de calidad. El numero de pasos de muestreo por defecto es 50. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar a este tipo de modelo generativo 3D). El modelo distingue dos modos de entrada (`synthetic` y `real`) que ajustan el margen de recorte segun el tipo de imagen.

## Capacidades

- Generacion de objetos 3D completos (3D Gaussian splats) a partir de una sola imagen, incluyendo las caras no visibles del objeto.
- Inferencia de geometria y apariencia desde vistas unicas: reconstruye laterales y partes traseras no presentes en la entrada.
- Eliminacion automatica del fondo y encuadre del objeto mediante BiRefNet.
- Prediccion de la camara de la imagen de entrada, exportada como `<name>_camera.json`.
- Salida en formato `.ply` estandar de 3DGS, compatible con visores de Gaussian splatting convencionales.
- Control del numero de gaussianas generadas (de 32.768 a 1.048.576, multiplos de 32).
- Control de la fidelidad a la imagen de entrada mediante `cfg_strength` y del reparto forma/detalle mediante `rescale_t`.
- Reproducibilidad mediante semilla fija (`--seed`).
- Dos modos de recorte adaptados a renders/imagenes generadas (`synthetic`) y fotografias (`real`).
- No dispone de capacidades de texto, tool calling, agentes ni vision general: su unica funcion es image-to-3D.

## Casos de uso

- Prototipado rapido de assets 3D para videojuegos: a partir de un render o concepto 2D se obtiene un splat en menos de 2 segundos, lo que permite iterar sobre decenas de variantes de un objeto en una sola sesion de diseno.
- Catalogos de e-commerce en 3D: convertir la fotografia de producto en un splat navegable que el cliente pueda rotar, aprovechando el modo `real` para fotografias y la eliminacion automatica de fondo.
- Generacion de assets para entornos de realidad aumentada y virtual: el `.ply` resultante se carga en visores 3DGS y permite superponer objetos reconstruidos sobre escenas reales sin modelado manual.
- Escaneo y digitalizacion de objetos con una sola foto: util para inventario, documentacion de patrimonio o archivo de piezas donde no es posible capturar multiples vistas.
- Previsualizacion en pipelines de impresion 3D o diseno industrial: generar una representacion volumetrica aproximada antes de comprometer recursos en un modelado CAD detallado.
- Integracion en herramientas de creacion de contenido: el SDK de Python (`IdolPipeline`) permite incorporar la generacion de splats en flujos automatizados de produccion de assets, con control de semilla y numero de gaussianas.
- Aumento de datasets 3D: generar vistas y geometria sintetica de objetos a partir de imagenes existentes para entrenar otros modelos de vision o de reconstruccion.

## Benchmarks y rendimiento

La model card incluye una comparativa frente a TripoSplat, TRELLIS y LGM, evaluada en la vista de entrada (PSNR, SSIM, LPIPS, IoU) y en siete vistas nuevas (DINOv2, CLIP, distancia de nitidez), con una H100 por modelo. Sin embargo, la tabla de resultados aparece truncada en la informacion disponible (solo se conserva la fila de cabecera `| Model | Setting |`), por lo que no es posible reproducir las puntuaciones numericas. No se presentan cifras completas de benchmarks en la informacion disponible.

Datos de rendimiento operativo si constan: pico de 7,2 GB de VRAM, ejecucion por debajo de 2 segundos por imagen, y una aceleracion de aproximadamente 1,7x con el muestreo optimizado por defecto en GPU.

## Requisitos de hardware

- VRAM estimada: 7,2 GB en el pico de una peticion completa; pesos en VRAM de aproximadamente 3,7-4,4 GB (DiT 0,8-1,0 GB; decoder octree 0,1-0,2 GB; decoder de gaussianas 0,5-0,9 GB; BiRefNet 0,44 GB; DINOv3 1,68 GB en bf16; VAE FLUX.2 0,17 GB).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 8 GB de VRAM; el modelo se ha evaluado en H100. Cabe en tarjetas consumer de gama media-alta con 8 GB o mas (por ejemplo, RTX 3060 Ti, 4060 Ti, 4070 y superiores).
- El encoder DINOv3 puede ejecutarse en FP32 con `--dinov3_dtype fp32`, lo que anade 1,7 GB de memoria.
- Opciones de despliegue: SDK oficial `idol-sdk` (Python 3.10+, PyTorch 2.5+, CUDA), uso como pipeline de Python (`IdolPipeline.from_pretrained`) y CLI (`python -m idol.sample`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia: por debajo de 2 segundos por imagen en GPU; la primera imagen de cada proceso es mas lenta por la compilacion de `torch.compile`.
- Dependencias externas: requiere aceptar los terminos de los modelos *gated* `facebook/dinov3-vith16plus-pretrain-lvd1689m` y `black-forest-labs/FLUX.2-dev` y autenticarse con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Idol | ~1,80 B | no aplica (imagen) | no disponible (tabla truncada); <2 s y 7,2 GB VRAM | Apache 2.0 | Hugging Face, SDK y demo |
| TripoSplat | no disponible | no aplica | comparado en la model card, cifras no disponibles | no disponible | no disponible |
| TRELLIS | no disponible | no aplica | comparado en la model card, cifras no disponibles | no disponible | no disponible |
| LGM | no disponible | no aplica | comparado en la model card, cifras no disponibles | no disponible | no disponible |

La model card situa a Idol frente a TripoSplat, TRELLIS y LGM, pero la informacion disponible no permite extraer los valores numericos de la comparativa ni las especificaciones de los modelos alternativos.

## Limitaciones y advertencias

- La tabla de benchmarks de la model card esta truncada en la informacion disponible, por lo que no se pueden verificar las afirmaciones comparativas del autor.
- Al generar geometria de caras no observadas, el modelo puede inventar detalles plausibles pero incorrectos; no es una reconstruccion fiel de la realidad.
- La calidad depende del encuadre y del tipo de imagen: es necesario elegir correctamente entre modo `synthetic` y `real` para evitar recortes inadecuados.
- Depende de dos modelos *gated* en Hugging Face (DINOv3 y el VAE de FLUX.2); sin aceptar sus terminos y autenticarse, el pipeline no funciona.
- No es un modelo linguistico: no soporta texto, tool calling, agentes ni razonamiento multi-paso; cualquier caso de uso debe ser de image-to-3D.
- Licencia Apache 2.0 sobre los pesos del modelo, pero los encoders de terceros tienen sus propias condiciones de uso que deben respetarse por separado.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez fuera de la comparativa mencionada.
- El numero maximo de gaussianas (1.048.576) puede no ser suficiente para objetos con detalle fino extremo; el autor indica que reducir pasos o gaussianas pierde detalle.
- No se especifican los datos de entrenamiento ni su procedencia, lo que limita la evaluacion de riesgos de sesgo o de derechos sobre las imagenes de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suryatmodulus/idol
- Pagina del proyecto: https://speridlabs.com/research/idol
- Codigo (SDK): https://github.com/speridlabs/idol-sdk
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/speridlabs/idol
- Encoder DINOv3 (gated): https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2 (gated): https://huggingface.co/black-forest-labs/FLUX.2-dev
