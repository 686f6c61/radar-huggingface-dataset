# taurusduan/MiniMax-H3-Image-LowVRAM

## Resumen

MiniMax-H3-Image es un modelo de generacion de imagenes text-to-image e image-to-image desarrollado por MiniMax, publicado el 10 de noviembre de 2026. Este repositorio concreto, `taurusduan/MiniMax-H3-Image-LowVRAM`, no contiene pesos nuevos ni fine-tunes: redistribuye sin modificar los pesos cuantizados que Comfy-Org repaqueto a partir del modelo oficial, seleccionados y documentados por Woovee Studio para despliegue en GPUs de consumo. El modelo original es un transformer de difusion de seis pasos, distinto de los modelos de video H3 y del P-H3-Image de Pruna.

La relevancia de esta ficha esta en el empaquetado: reduce el modelo completo a unos 29,4 GB mediante un transformer podado en W4A8 (12,55 GB), un encoder de texto Qwen3-VL de 32B en NVFP4 AWQ (15,69 GB) y un VAE de imagen en fp16 (1,17 GB). Esto permite ejecutar generacion a 4 MP en GPUs de 24-32 GB con offloading dinamico por etapas, algo que los pesos completos no permiten en hardware de consumo.

El objetivo declarado es servir de base para Woovee Studio, con instrucciones de uso especificas para ComfyUI (6 pasos, CFG 1, sampler euler, scheduler simple) y una resolucion de arranque de 2048 x 2048. La licencia es comunitaria y excluye explicitamente varias jurisdicciones, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (image transformer) con encoder de texto Qwen3-VL de 32B y VAE de imagen |
| Parametros totales | no disponible (el repo distribuye pesos cuantizados; el transformer va podado) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (transformer), NVFP4 AWQ (encoder de texto), fp16 (VAE) |
| Idiomas soportados | no disponible (el prompting recomendado es en ingles detallado) |
| Licencia | MiniMax-H3-Image Community License Agreement (distinta de la licencia H3 anterior) |
| Formato de pesos | safetensors |
| Tamano del repo | 29,4 GB (12,55 GB transformer + 15,69 GB encoder + 1,17 GB VAE) |
| Pasos de muestreo | 6 pasos, CFG 1, euler, simple |
| Resolucion recomendada | 2048 x 2048 (4 MP) para velocidad; ~16 MP para maximo detalle |
| Libreria | minimax-h3 (ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer de difusion para imagenes con un encoder de texto Qwen3-VL de 32B y un VAE dedicado de imagen. El modelo oficial es un modelo de seis pasos, lo que implica destilacion o un schedule de muestreo muy comprimido: la configuracion recomendada es KSampler con 6 steps, CFG 1, euler y scheduler simple. El transformer distribuido aqui esta podado (pruned), es decir, se han eliminado componentes del modelo original antes de cuantizar a W4A8.

No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones de atencion o decodificacion especulativa. Lo que si documenta el repositorio es la cadena de procedencia: pesos oficiales de `MiniMaxAI/MiniMax-H3-Image` (10 de noviembre de 2026) repaquetados por Comfy-Org y seleccionados sin modificacion por Woovee, con revisiones upstream y hashes SHA256 en `source-manifest.json`. El autor advierte que las salidas W4A8/NVFP4 pueden diferir de las de precision completa.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts descriptivos en ingles detallado.
- Edicion image-to-image con referencias multiples: se nombran como `<Picture 1>`, `<Picture 2>`, etc., indicando el cambio deseado y lo que debe permanecer.
- Composicion de escenas completas: el modelo espera una descripcion de la imagen entera, no solo del sujeto.
- Generacion a resoluciones de 4 MP (2048 x 2048) y hasta aproximadamente 16 MP segun recomendacion upstream.
- Inferencia en seis pasos con CFG 1, lo que reduce coste computacional frente a modelos de difusion de decenas de pasos.
- Integracion nativa con ComfyUI mediante el nodo `MiniMaxH3ImageConditioning` y plantillas oficiales de workflow.
- No se documenta soporte de tool calling, agentes, audio ni modo thinking; es un modelo puramente de imagen.
- Capacidades multilingues: no disponibles; el prompting recomendado es en ingles.

## Casos de uso

- Generacion de ilustraciones para producto en estaciones de trabajo con RTX 4090: con 24 GB de VRAM y offloading dinamico se obtienen imagenes de 4 MP en torno a 26 s de workflow con una referencia, suficiente para iterar disenos.
- Edicion por referencia en flujo de diseno grafico: cambiar un objeto (por ejemplo, un color de tetera) manteniendo composicion y estilo, usando prompts que nombren `<Picture 1>` y expliciten que debe conservarse.
- Creacion de assets para videojuegos o entornos 3D: el modelo trabaja a 4-16 MP, util para texturas y concept art que luego se recortan o reescalan.
- Prototipado rapido de campanas visuales: seis pasos por imagen y CFG 1 permiten generar variantes en serie dentro de ComfyUI sin pipelines complejos.
- Automatizacion de catalogos de e-commerce: edicion image-to-image sobre fotos base para recolorear o sustituir elementos manteniendo encuadre y composicion.
- Maquetacion editorial y storyboards: descripcion de escena completa en un solo prompt, adecuada para generar frames consistentes de una narrativa visual.
- Despliegue local en estudio privado: el paquete esta pensado para uso privado del propietario del estudio, con verificacion de hashes y arranque por etapas en GPUs de 24-32 GB.

## Benchmarks y rendimiento

El repositorio publica mediciones propias del 10 de noviembre de 2026, con seis pasos y salida de 2048 x 2048. No son garantias de throughput ni minimos de memoria.

| Test | Tiempo de workflow | Tiempo total del handler | Pico de VRAM muestreado |
|---|---:|---:|---:|
| RTX 5090 (32 GB), primera generacion text-to-image | 46,90 s | 78,26 s | 28 162 MiB |
| RTX 5090 (32 GB), edicion en caliente con una referencia | 23,44 s | 24,25 s | 30 727 MiB |
| RTX 4090 (24 GB), primera edicion con una referencia | 26,35 s | 50,61 s | 22 975 MiB |

El tiempo de workflow incluye carga de componentes y codificacion de salida; el tiempo total del handler anade verificacion de hashes y arranque del servidor. No se han benchmarkeado resoluciones superiores a 4 MP, cuatro referencias simultaneas ni otras GPUs configuradas. No hay resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo de imagen.

## Requisitos de hardware

- VRAM medida: pico de 22 975 MiB en RTX 4090 (24 GB) y 30 727 MiB en RTX 5090 (32 GB) a 4 MP con una referencia.
- GPUs objetivo: NVIDIA de 24-32 GB. Los tests validados son RTX 4090 (24 GB) y RTX 5090 (32 GB); otras GPUs configuradas no se han benchmarkeado.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 5090 con offloading dinamico por etapas (encoder de texto y modelo de difusion se cargan por fases).
- Memoria del sistema: el autor advierte que la RAM de CPU, el numero de referencias y la resolucion tambien afectan al consumo.
- Despliegue: ComfyUI (commit `989d93d0d968e704c589ce0146bb18c77f6b50cc` o posterior compatible), con los ficheros colocados en las carpetas correspondientes de `ComfyUI/models/`.
- Latencia observada: 23-47 s de workflow para 4 MP en un solo paso de usuario; no hay datos de throughput agregado ni de lotes multiples.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. Como referencia cualitativa, el propio autor distingue este modelo de Pruna P-H3-Image y de los modelos de video H3 de MiniMax, pero no aporta cifras comparativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Image (oficial) | no disponible | no disponible | Comunitaria MiniMax-H3-Image | Hugging Face (MiniMaxAI) |
| MiniMax-H3-Image (repaquetado Comfy-Org) | no disponible | no disponible | Comunitaria MiniMax-H3-Image | Hugging Face (Comfy-Org) |
| Este repositorio (low VRAM) | no disponible (podado y cuantizado) | no disponible | Comunitaria MiniMax-H3-Image | Hugging Face (taurusduan) |

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax-H3-Image Community License Agreement excluye de su concesion estandar la UE, el Reino Unido, la Republica de Corea y Estados Unidos. No debe usarse fuera del territorio aplicable sin autorizacion.
- Servicios alojados por terceros y ingresos anualizados superiores a 1 millon de USD requieren autorizacion previa por escrito de MiniMax; este repositorio no concede licencia de servicio alojado ni anula los terminos upstream.
- La cuantizacion W4A8 y NVFP4 AWQ puede producir salidas distintas a las de precision completa; no se documenta magnitud de la degradacion.
- El transformer esta podado, por lo que puede perder capacidades respecto al modelo oficial; no se detalla que se ha eliminado.
- Riesgo de sesgos y alucinacion visual: no se documenta evaluacion de sesgos ni tasas de fallo; los tests solo confirman imagenes validas en ediciones simples de color.
- Rendimiento medido en condiciones concretas (una referencia, 4 MP, dos GPUs); no hay datos para cuatro referencias, resoluciones altas ni otras GPUs.
- El prompting debe hacerse en ingles detallado; no se documenta soporte multilingue.
- No incluye el expansor de prompt grande del Studio; la mejora opcional de prompt es un componente separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taurusduan/MiniMax-H3-Image-LowVRAM
- Modelo base oficial: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Pesos repaquetados por Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Plantilla oficial de workflow text-to-image: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_minimax_h3_image_t2i.json
- Licencia: fichero `LICENSE` incluido en el repositorio
- Aviso legal: fichero `NOTICE` incluido en el repositorio
- Manifiesto de procedencia y hashes: fichero `source-manifest.json` incluido en el repositorio
