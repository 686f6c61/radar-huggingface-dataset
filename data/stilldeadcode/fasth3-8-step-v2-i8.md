# StillDeadcode/fasth3-8-step-v2-i8

## Resumen

FastH3 8-Step V2 int8 es un contenedor de inferencia (`.rad`) para el motor radiance, orientado a GPU AMD RDNA4 con ROCm, que empaqueta una versión cuantizada a int8 del modelo de generación de vídeo con audio sincronizado FastVideo-FastH3-8-Step-V2, a su vez una destilación de MiniMax-H3 a ocho pasos. Lo publica el desarrollador independiente StillDeadcode y resuelve el problema de ejecutar un modelo de texto-a-vídeo-audio de gran tamano en hardware de consumo profesional AMD, donde las herramientas habituales (basadas en CUDA) no están disponibles. El contenedor ocupa 64,58 GiB e incluye codificador de texto, refiner de tokens, DiT, decodificadores de vídeo y audio, y un upscaler latente.

La relevancia actual es doble: por un lado, demuestra una ruta de cuantización W8A8 con rotación Hadamard aplicada a un pipeline de difusión completo; por otro, es uno de los pocos artefactos publicados que apuntan explícitamente a RDNA4 (gfx1201) con un servidor compatible con la API de vídeo de OpenAI. El modelo genera clips MP4 de hasta 1344x768 a 24 fps con pista AAC estéreo a 32 kHz, en longitudes de 5,17 a 14,4 segundos, en exactamente ocho pasos de inferencia.

La licencia MiniMax H3 Community excluye explícitamente su uso en la Unión Europea, el Reino Unido, Corea del Sur y Estados Unidos, lo que condiciona seriamente su adopción en esos mercados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión (DiT de 50 bloques) con codificador de texto Qwen3-VL-32B, refiner de tokens, decodificador de vídeo y decodificador de audio; atención dispersa en vídeo |
| Parametros totales | no disponible (el upscaler latente aporta 345M; el total del pipeline no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | prompt de hasta 2048 tokens |
| Tipos de cuantizacion | int8 W8A8 con rotación Hadamard (fwht128) en linears del codificador de texto y proyecciones de modulación; IQ8R en el refiner de tokens; int8 sin rotar en los 50 bloques del DiT; decodificador de vídeo en bf16; decodificador de audio en f32 |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (excluye UE, Reino Unido, Corea del Sur y EE. UU.) |
| Formato de pesos | `.rad` (contenedor del motor radiance) |

## Arquitectura y entrenamiento

El modelo subyacente es una destilación few-step de MiniMax-H3 a ocho pasos, con atención dispersa en vídeo: durante la inferencia se omiten el 80% de los tiles de vídeo de 64 tokens, tal como el modelo fue entrenado. El pipeline combina un codificador de texto basado en las 50 capas de Qwen3-VL-32B, un refiner de tokens, un DiT de 50 bloques y decodificadores separados para vídeo y audio. La generación de audio es nativa y sincronizada con el vídeo, no un post-proceso.

La cuantización es el rasgo técnico distintivo. El codificador de texto, el refiner y las proyecciones de modulación usan rotación Hadamard no normalizada (fwht128) sobre grupos de K, con escala u8 por fila y una segunda escala bf16 cada 256 de K; el refiner emplea además códigos IQ8R en el rango −127..127. Los linears del DiT se cuantizan a int8 sin rotar con escala bf16 por fila y grupo de 128. Las activaciones son int8 (W8A8), rotadas donde lo está el peso. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

El contenedor incorpora el upscaler latente de LBH-123-AI (convolución 3D, 345M parámetros, bf16, Apache-2.0), que permite generar primero a media resolución y refinar los últimos pasos a resolución completa.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución de hasta 1344x768 píxeles y múltiplos de 32.
- Generación de audio sincronizado con el vídeo: pista AAC estéreo a 32 kHz dentro del mismo MP4.
- Salida en MP4 con códec H.264 a 24 fps.
- Longitudes de 5,17 a 14,4 segundos, ajustadas a los pasos de longitud del modelo (17 frames).
- Inferencia estrictamente en ocho pasos: cualquier otro valor de `num_inference_steps` distinto de 9 (puntos de rejilla, como los cuenta diffusers) es rechazado.
- Upscaling latente con factores de 2 o 4, con `upscale_refine_steps` configurable (3 por defecto de los 8 pasos).
- Reproducibilidad mediante semilla en el mismo despliegue.
- Servidor con API de trabajos de vídeo de OpenAI (`POST /v1/videos`, `GET /v1/videos/{id}`, `GET /v1/videos/{id}/content`, listado y borrado) y campo `target` de SGLang.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de medios, no un LLM conversacional.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo de hasta 1344x768 con audio sincronizado en una sola llamada, adecuado para prototipos de anuncios de 5 a 14 segundos sin pipeline de postproducción de audio.
- Previsualización de storyboards animados: con `latent_upscale` 2 y 3 pasos de refinado, un clip de 5,17 s a 1344x768 tarda 41 s en dos R9700, lo que permite iterar sobre bocetos visuales con prompts de hasta 2048 tokens.
- Generación de material para doblaje y localización: la pista AAC estéreo a 32 kHz permite usar el clip como referencia de sincronía en flujos de sustitución de voz.
- Creación de contenido para redes sociales en formato corto: la longitud máxima de 14,4 s y la salida H.264 a 24 fps encajan con formatos de vídeo vertical u horizontal sin transcodificación adicional.
- Pruebas de concepto en hardware AMD: sirve como banco de pruebas para validar pipelines de difusión cuantizados a int8 sobre RDNA4 con ROCm, midiendo latencia y calidad frente al contenedor FP8 del mismo checkpoint.
- Investigación en cuantización de modelos de difusión: la receta `minimax-h3-i8.recipe` documenta qué capas se cuantizan y con qué esquema (rtn, grupos, rotación, escalas), lo que permite reproducir y comparar variantes.
- Generación de fondos animados con audio para entornos de desarrollo o demos interactivas, servidos mediante la API de trabajos compatible con OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son tiempos de generación medidos por el autor en dos Radeon AI PRO R9700 (gfx1201), para un clip de 5,17 s:

| Configuracion | 1344x768 | 1024x576 | 672x384 |
|---|---|---|---|
| Contenedor int8 (una ejecución por tamano) | 100 s | 54 s | 26-28 s |
| Contenedor FP8 del mismo checkpoint | 88 s | 62 s | 22-28 s |

Tiempos con upscaling latente a 1344x768 y 5,17 s (contenedor FP8, 2x R9700):

| Configuracion | Tiempo |
|---|---|
| Nativo, 8 pasos | 68 s |
| `latent_upscale` 2, 3 pasos de refinado | 41 s |
| `latent_upscale` 2, 4 pasos de refinado | 46 s |
| `latent_upscale` 4, 3 pasos de refinado | 35 s |

## Requisitos de hardware

- Dos GPU de 32 GB de VRAM (probado en Radeon AI PRO R9700, gfx1201) y aproximadamente 39 GiB de memoria de host fijada (pinned).
- El contenedor ocupa 64,58 GiB en disco; el despliegue usa paralelismo de tensor (`--tp 2`).
- El codificador de texto y las proyecciones de modulación se leen desde memoria de host fijada mediante `--vision-tower-placement ram`.
- No cabe en GPU de consumo de 24 GB o menos: requiere el perfil de dos tarjetas de 32 GB.
- Motor de despliegue: radiance compilado desde main posterior a 1.17.0 (las formas int8 del codificador de texto, el refiner y las proyecciones de modulación no están en 1.17.0 y llegan en la siguiente versión).
- No se indica soporte para vLLM, llama.cpp, Ollama ni TGI; el formato `.rad` es específico de radiance.
- Throughput de referencia: 100 s para un clip de 5,17 s a 1344x768 en dos R9700; 26-28 s a 672x384.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion maxima | Licencia | Hardware |
|---|---|---|---|---|---|
| FastH3 8-Step V2 int8 (este) | no disponible | prompt 2048 tokens | 1344x768, 5,17-14,4 s | minimax-h3-community | 2x 32 GB AMD RDNA4 |
| StillDeadcode/fasth3-8-step-v2-fp8 | mismo checkpoint | prompt 2048 tokens | 1344x768 | minimax-h3-community | 2x 32 GB AMD RDNA4 |
| StillDeadcode/minimax-h3-i8 (modelo base) | no disponible | no disponible | no disponible | minimax-h3-community | AMD RDNA4 |
| FastVideo/FastVideo-FastH3-8-Step-V2 (original) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna a la familia: el contenedor int8 sustituye al FP8 con el mismo número de bits por peso y sin pesos E4M3, a costa de un tiempo algo mayor a 1344x768 (100 s frente a 88 s) y menor a 1024x576 (54 s frente a 62 s). No se dispone de datos de benchmarks de calidad frente a alternativas de otros autores.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community no cubre la Unión Europea, el Reino Unido, Corea del Sur ni Estados Unidos: el uso en esos territorios queda fuera de los términos.
- FastVideo advierte de que el movimiento difícil, el detalle fino y parte del audio pueden quedar por debajo del modelo base.
- El modelo solo ejecuta el calendario de ocho pasos con el que fue entrenado; no admite otros recuentos de pasos.
- La generación está limitada a texto-a-vídeo y audio: no hay entrada de imagen, vídeo ni control estructural.
- El prompt se limita a 2048 tokens y la resolución a 1344x768 de área, con múltiplos de 32.
- Con `latent_upscale` 4 a 1344x768, la escena parte de 352x192 y el resultado es algo más suave que con factor 2.
- Riesgo de alucinación visual y de audio inherente a los modelos generativos: no se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Dependencia de una versión de radiance posterior a 1.17.0 y de hardware AMD RDNA4; no hay ruta documentada para CUDA.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La reproducibilidad con semilla solo se garantiza dentro del mismo despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/fasth3-8-step-v2-i8
- Modelo base: https://huggingface.co/FastVideo/FastVideo-FastH3-8-Step-V2
- Upscaler latente: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Contenedor FP8 del mismo checkpoint: https://huggingface.co/StillDeadcode/fasth3-8-step-v2-fp8
- Modelo base MiniMax-H3 en int8: https://huggingface.co/StillDeadcode/minimax-h3-i8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
