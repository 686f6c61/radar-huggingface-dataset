# StillDeadcode/minimax-h3-i8

## Resumen

MiniMax-H3 es un modelo generativo de texto a vídeo con audio sincronizado, desarrollado originalmente por MiniMaxAI. Esta ficha concreta, `StillDeadcode/minimax-h3-i8`, no es el modelo base sino una cuantización a int8 empaquetada como contenedor `.rad` para el motor de inferencia radiance, orientado a GPUs AMD RDNA4 con ROCm. El autor, StillDeadcode, la presenta como sustituto del contenedor FP8 previo, con todos los pesos en ocho bits y sin ningún peso E4M3.

El modelo genera clips MP4 (H.264 a 24 fps, hasta 1344x768, de 5,17 a 14,4 s) con pista AAC estéreo a 32 kHz a partir de una descripción textual que puede incluir la escena, su paisaje sonoro y su música. La arquitectura combina un codificador de texto basado en Qwen3-VL-32B, un DiT de 50 bloques y decodificadores de vídeo y audio separados, con un upscaler latente 3D convolucional de 345M parámetros (Apache-2.0) que permite generar a media resolución y refinar.

Su relevancia es doble: por un lado, es una de las pocas rutas prácticas para ejecutar un modelo de vídeo-audio de gran tamano en hardware AMD consumer/prosumer (dos Radeon AI PRO R9700 de 32 GB); por otro, la licencia comunitaria de MiniMax-H3 excluye explícitamente la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, lo que condiciona seriamente su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de 50 bloques + text encoder Qwen3-VL-32B (50 capas) + token refiner con IQ8R + VAE de vídeo (bf16) + VAE de audio (f32) + upscaler latente 3D conv (345M, bf16) |
| Parametros totales | no disponible (el repositorio ocupa 67,4 GB en int8; el modelo base no publica recuento en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | prompt de hasta 2048 tokens; longitud de vídeo de 5,17 a 14,4 s (pasos de 17 frames) |
| Tipos de cuantizacion | int8 W8A8 con rotación Hadamard (IQ8R en el token refiner, int8 sin rotar en el DiT); decodificador de vídeo bf16; decodificador de audio f32 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (excluye UE, Reino Unido, Corea del Sur y EE. UU.); upscaler bajo Apache-2.0 |
| Formato de pesos | contenedor `.rad` propietario de radiance (`minimax-h3-i8.rad`, 62,79 GiB) |

## Arquitectura y entrenamiento

El pipeline es un modelo de difusión para vídeo y audio: un text encoder Qwen3-VL-32B procesa el prompt, un token refiner ajusta la representación y un DiT de 50 bloques denoisa el latente de vídeo, que luego pasa por un VAE de vídeo (bf16) y un VAE de audio (f32) para producir el MP4 con pista AAC. El modelo es *guidance-distilled*: no admite guidance scale ni negative prompt, y el número de pasos se cuenta como puntos de la rejilla sigma (50 por defecto, máximo 65). La cuantización int8 aplica rotación Hadamard no normalizada en el token refiner (códigos −127..127, bloques de 128 de K, escala u8 por fila y 256 de K bajo escala bf16) y en las proyecciones de modulación, mientras que las lineales del DiT quedan en int8 sin rotar con escala bf16 por fila y 128.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación destacable de esta ficha es de despliegue, no de entrenamiento: la conversión se realiza con `rad-convert` y una receta (`minimax-h3-i8.recipe`) que nombra explícitamente qué se cuantiza, dejando el resto en su precisión original; el text encoder y las proyecciones de modulación se leen desde memoria host fijada (`--vision-tower-placement ram`), lo que permite servir el modelo en dos tarjetas de 32 GB. El contenedor incorpora además un upscaler latente que permite generar a media resolución y refinar los últimos pasos a resolución completa.

## Capacidades

- Generación de vídeo a partir de texto con resolución de hasta 1344x768 y duración de 5,17 a 14,4 s.
- Generación de audio sincronizado (estéreo, AAC 32 kHz) junto con el vídeo, incluyendo paisaje sonoro y música descritos en el prompt.
- Seguimiento de descripciones estructuradas largas (hasta 2048 tokens): plano, sonido y música.
- Reproducibilidad mediante `seed` en el mismo despliegue (dos ejecuciones dan el mismo vídeo byte a byte).
- Upscaling latente con factor 2 o 4 (`latent_upscale`), con refinado configurable (`upscale_refine_steps`, 12 por defecto).
- API compatible con el formato de trabajos de vídeo de OpenAI (`POST /v1/videos`, `GET /v1/videos/{id}`, contenido, listado y borrado) y con el campo `target` de SGLang.
- No soporta condicionamiento por imagen ni por referencia en este fichero; solo texto a vídeo y audio.
- No se documentan capacidades de tool calling, agentes ni multilingüismo.

## Casos de uso

- Prototipado de vídeo publicitario: generar clips de 5 s a 1344x768 con música y efectos descritos en el prompt, usando `latent_upscale: 2` para reducir el tiempo de 8,8 a 3,4 minutos por clip en dos R9700.
- Previsualización de storyboards: convertir descripciones de plano en vídeo con audio para validar ritmo y atmósfera antes de producir, con `seed` fijo para comparar variantes de prompt sobre el mismo resultado.
- Generación de material para redes sociales: clips cortos verticales u horizontales con pista de audio integrada, listos en MP4 H.264 sin postproceso de muxing.
- Creación de ambientes sonoros y música para vídeo: el prompt puede describir el paisaje sonoro y la música, y el modelo genera ambos sincronizados con la imagen.
- Investigación en difusión vídeo-audio en hardware AMD: el contenedor sirve como referencia reproducible de cuantización int8 W8A8 con rotación Hadamard sobre ROCm/RDNA4.
- Pruebas de integración de APIs de generación de vídeo: el servidor implementa el esquema de trabajos de OpenAI, útil para desarrollar clientes y pipelines de encolado sin depender de un proveedor cloud.
- Evaluación comparativa de precisión: comparar el contenedor int8 con el FP8 del mismo autor (PSNR de 22,7 dB entre ambos a 12 pasos) para medir el impacto de la cuantización en la calidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, VBench u otros) en la informacion disponible. Los únicos datos medidos son de latencia y fidelidad entre contenedores, sobre dos Radeon AI PRO R9700 (gfx1201):

| Medición | FP8 | int8 |
|---|---|---|
| Clip 5,17 s a 768x448, 12 pasos | 38 s | 40 s |
| Clip 5,17 s a 768x448, 36 pasos | 108 s | 116 s |
| Coste por paso del DiT | referencia | ~7% superior |
| Clip 5,17 s a 1344x768, 50 pasos | 8,8 min | no medido (se estima ~7% más por paso) |

| 5,17 s a 1344x768, 50 pasos, 2x R9700 (contenedor FP8) | Tiempo |
|---|---|
| Nativo | 8,8 min |
| `latent_upscale` 2, 12 pasos de refinado | 3,4 min |
| `latent_upscale` 2, 20 pasos de refinado | 4,5 min |

No se ha medido frente al pipeline bf16 de diffusers.

## Requisitos de hardware

- Dos GPUs de 32 GB (probado en Radeon AI PRO R9700, gfx1201) y unos 39 GiB de memoria host fijada.
- El contenedor ocupa 62,79 GiB en disco; el repositorio completo, 67,4 GB.
- El text encoder y las proyecciones de modulación se leen desde RAM (`--vision-tower-placement ram`), lo que reduce la VRAM necesaria.
- Despliegue mediante el motor radiance (`radiance --model minimax-h3-i8.rad --tp 2`), compilado desde main posterior a 1.17.0 (las formas int8 del text encoder, refiner y modulaciones no están en 1.17.0).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.rad` es específico de radiance.
- No cabe en una GPU consumer de 24 GB según los requisitos declarados (dos tarjetas de 32 GB).
- Throughput de referencia: unos 40 s por clip de 5,17 s a 768x448 y 12 pasos; 8,8 min por clip de 5,17 s a 1344x768 y 50 pasos (medido con el contenedor FP8).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/duración | Licencia | Hardware | Formato |
|---|---|---|---|---|---|
| minimax-h3-i8 (esta ficha) | no disponible (67,4 GB en int8) | prompt 2048 tokens; vídeo 5,17-14,4 s | MiniMax H3 Community (excluye UE, UK, KR, US) | 2x 32 GB AMD RDNA4 | `.rad` (radiance) |
| StillDeadcode/minimax-h3-fp8 | mismo modelo base | idem | idem | 2x 32 GB AMD RDNA4 | `.rad` (radiance) |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | idem | MiniMax H3 Community | no disponible | safetensors/diffusers |
| StillDeadcode/fasth3-8-step-v2-i8 | destilación a 8 pasos del mismo modelo | idem | no disponible | 2x 32 GB AMD RDNA4 | `.rad` (radiance) |

La comparación relevante es interna a la familia: el contenedor int8 sustituye al FP8 con un coste de ~7% por paso y una fidelidad de 22,7 dB PSNR respecto a él a 12 pasos; la variante `fasth3-8-step-v2-i8` reduce los pasos de inferencia mediante destilación. No se dispone de comparación con modelos de vídeo de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community no cubre la Unión Europea, el Reino Unido, Corea del Sur ni Estados Unidos: el uso en esos territorios queda fuera de los términos.
- Solo texto a vídeo y audio; no hay condicionamiento por imagen ni por referencia en este fichero.
- El prompt está limitado a 2048 tokens y la duración a 5,17-14,4 s en pasos de 17 frames; la resolución debe ser múltiplo de 32 y no superar 1344x768 de área.
- El modelo es guidance-distilled: no admite guidance scale ni negative prompt, lo que limita el control fino sobre el resultado.
- Un factor de upscaling 4 a 1344x768 parte de 352x192, tamano insuficiente para una composición limpia; el propio autor advierte de fotogramas borrosos y con ghosting.
- Riesgo de alucinación visual y sonora inherente a los modelos generativos: el audio y el vídeo pueden no corresponderse con la descripción.
- No se documentan sesgos conocidos, idiomas soportados ni evaluación de seguridad en la información disponible.
- Requiere compilar radiance desde main posterior a 1.17.0; la versión 1.17.0 no soporta las formas int8 del text encoder, refiner y modulaciones.
- Dependencia de hardware AMD RDNA4 con ROCm; no hay ruta documentada para CUDA ni para motores de inferencia estándar.
- El rendimiento medido corresponde a dos R9700; en otras GPUs los tiempos pueden diferir sustancialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/minimax-h3-i8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Contenedor FP8 sustituido: https://huggingface.co/StillDeadcode/minimax-h3-fp8
- Destilación a 8 pasos: https://huggingface.co/StillDeadcode/fasth3-8-step-v2-i8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
