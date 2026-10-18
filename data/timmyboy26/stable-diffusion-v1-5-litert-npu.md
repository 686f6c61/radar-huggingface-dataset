# timmyboy26/stable-diffusion-v1-5-LiteRT-NPU

## Resumen

`timmyboy26/stable-diffusion-v1-5-LiteRT-NPU` es una conversión a LiteRT (el runtime de Google antes conocido como TensorFlow Lite) de Stable Diffusion v1.5, empaquetada como ficheros `.tflite` compilados AOT para las NPU de los SoC MediaTek Dimensity 9400 (MT6991) y Dimensity 9500 (MT6993), y para las TPU de Google Tensor G5 (Pixel 10) y Tensor G6 (Pixel 11). El objetivo es ejecutar generación texto-a-imagen de 512×512 íntegramente en el dispositivo, sin GPU dedicada y sin conexión a la nube. Lo publica el usuario timmyboy26 y el repositorio ocupa 15,4 GB.

No introduce pesos nuevos: deriva del checkpoint `v1-5-pruned-emaonly.safetensors` de SD 1.5 (SHA-256 `6ce0161689b3853acaa03779ec93eafe75a02f4ced659bee03f50797806fa2fa`) y conserva la arquitectura de difusión latente original (UNet + VAE + encoder de texto CLIP). El valor aportado está en el pipeline de conversión y compilación: recipe FP16 de `litert-torch` 0.9.4, reescritura de GroupNorm a forma 4D para evitar `GATHER_ND` y el límite de 65535 elementos del MDLA, y compilación con `ai-edge-litert` 2.3.0 más los SDK específicos de MediaTek y Google Tensor.

Es relevante porque documenta un caso real de portado de difusión a NPU móvil con los obstáculos concretos que aparecen: particionado de grafo, receta INT8 que no compila, plataformas rechazadas por el compilador y firmware de fabricante que bloquea el servicio NeuroPilot. El propio autor marca el estado como experimental: los ficheros se han compilado, pero no se han validado ni medido en dispositivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente: UNet (denoiser) + VAE decoder + encoder de texto CLIP, convertidos a grafos LiteRT |
| Parámetros totales | No disponible en la model card; el checkpoint base SD 1.5 tiene aproximadamente 860 M en el UNet, 123 M en el text encoder y 83 M en el VAE |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 77 tokens de prompt (límite del tokenizer CLIP BPE de SD 1.5) |
| Resolución de salida | 512×512 fija |
| Tipos de cuantización | FP16 en UNet y VAE decoder; INT8 en pesos del encoder CLIP. La receta INT8 para el UNet falla (ai-edge-quantizer #472) |
| Idiomas soportados | No disponible en la model card; el modelo base está entrenado principalmente con prompts en inglés |
| Licencia | CreativeML OpenRAIL-M, con restricciones de uso |
| Formato de pesos | `.tflite` (LiteRT/TFLite); tokenizer en `vocab.json` y `merges.txt` |
| Tamaño del repositorio | 15,4 GB |
| Librería declarada | litert |
| Plataformas objetivo | MediaTek Dimensity 9400 (MT6991), Dimensity 9500 (MT6993), Google Tensor G5 (Pixel 10), Tensor G6 (Pixel 11) |
| Entradas del UNet | latents `[2, 4, 64, 64]`, context `[2, 77, 768]`, time embedding `[1, 320]` |
| Entrada del VAE | latents `[1, 4, 64, 64]`; el grafo aplica internamente el factor de escala latente 0.18215 |
| Entrada del CLIP | token IDs `[1, 77]` en int32 |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

El modelo es una conversión, no un reentrenamiento. Se parte del checkpoint pruned-emaonly de SD 1.5 y se generan tres grafos por plataforma: UNet con batch 2 para classifier-free guidance, VAE decoder y encoder de texto CLIP. La conversión usa los modelos de ejemplo de Stable Diffusion de `litert-torch` 0.9.4 con la receta FP16; la receta INT8 no se pudo aplicar al UNet por el fallo registrado en ai-edge-quantizer #472, de modo que solo el encoder CLIP va con pesos INT8 (y en MT6993 ni siquiera compila, por un error `Failed to identify model I/Os`, por lo que ahí hay que usar `source/clip.tflite`).

La innovación técnica documentada es la reescritura de GroupNorm a una forma `[N*G, C/G, H, W]` con media y varianza explícitas. El lowering por defecto emplea `GATHER_ND`, que dejaba el UNet fragmentado en 184 particiones de NPU; aplanar cada grupo en un solo eje supera el límite de 65535 elementos por dimensión del MDLA de MediaTek. Con la forma 4D, UNet y decoder compilan a un único grafo de NPU tanto en MT6991 como en MT6993. Las builds de Google Tensor se generan con `ai-edge-litert-sdk-google-tensor` 2.3.0 y el compilador beta del Tensor SDK, con una partición por modelo y todos los operadores en la TPU. La compilación AOT usa `ai-edge-litert` 2.3.0 y `ai-edge-litert-sdk-mediatek` 2.3.0; el autor advierte de que las builds AOT públicas de MediaTek pueden estar menos optimizadas que las de Google (LiteRT #6462) y recomienda compararlas con la compilación on-device de `source/`.

No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO, porque el modelo hereda los pesos del checkpoint original de SD 1.5 sin modificaciones.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 píxeles a partir de un prompt en lenguaje natural.
- Clasificador libre de guías (CFG) real dentro del grafo: el UNet se compila con batch 2 para procesar simultáneamente la condicion positiva y la negativa.
- Inferencia íntegra en el dispositivo: tokenización CLIP, denoising iterativo, decodificación VAE, sin llamadas de red.
- Ejecución en NPU MDLA de MediaTek (Dimensity 9400 y 9500) y en TPU de Google Tensor (G5 y G6), con todos los operadores mapeados a la unidad aceleradora en el caso de Tensor.
- Variante `source/*.tflite` sin compilar, utilizable en cualquier NPU LiteRT con compilación on-device o en CPU/GPU.
- Tokenizer CLIP BPE incluido (`vocab.json`, `merges.txt`) para preprocesar prompts sin dependencias externas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No es un modelo de texto: no genera lenguaje, código ni respuestas conversacionales.
- No dispone de modo thinking, visión de entrada ni procesamiento de audio.
- Cobertura multilingüe de prompts no documentada; el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Generación de imágenes offline en aplicaciones Android: el paquete permite crear ilustraciones de 512×512 en un Dimensity 9400 o 9500 sin enviar el prompt a un servidor, lo que simplifica el cumplimiento de RGPD al no salir datos del dispositivo.
- Prototipado de apps creativas para Pixel 10 y Pixel 11: las builds de Tensor G5 y G6 ejecutan todos los operadores en la TPU, lo que sirve para validar experiencias de generación de imágenes integradas en el sistema antes de que existan SDKs estables.
- Edición fotográfica asistida por prompt en el dispositivo: sustitución de fondos o estilización a 512×512 a partir de la imagen del usuario, sin coste de inferencia en la nube y con latencia independiente de la conectividad.
- Investigación sobre compiladores de NPU: el repositorio sirve como caso de estudio reproducible de particionado de grafos (de 184 particiones a 1) y de los límites del MDLA, útil para quien porte otros modelos de difusión a LiteRT.
- Comparación de AOT frente a compilación on-device: al incluir `source/` junto a las builds precompiladas, permite medir en un mismo dispositivo la diferencia de rendimiento entre ambas rutas para una misma red.
- Evaluación de cuantización mixta: la combinación FP16 en UNet/VAE e INT8 en CLIP, junto con el fallo conocido de INT8 en el UNet, es un punto de partida para experimentar con recetas de cuantización en aceleradores móviles.
- Integración en pipelines de CI para validación de artefactos LiteRT: los `.tflite` por plataforma permiten automatizar comprobaciones de compilación y de formas de entrada (`[2,4,64,64]`, `[2,77,768]`, `[1,320]`) antes de publicar una app.
- Demos de asistentes creativos sin conectividad: escenarios de ferias, aulas o entornos con red restringida donde se necesita generar imágenes en local desde un móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los ficheros se han compilado pero no se han validado ni medido en dispositivo, por lo que no existen cifras de latencia, throughput ni calidad de imagen para estas builds.

## Requisitos de hardware

- No es un modelo para GPU de servidor: el destino son NPU y TPU integradas en SoC móviles, con memoria compartida con la CPU, por lo que no aplica una cifra de VRAM dedicada (no disponible).
- MediaTek Dimensity 9400 (MT6991): UNet y VAE en FP16, CLIP con pesos INT8, compilación AOT, un único grafo de NPU por modelo.
- MediaTek Dimensity 9500 (MT6993): UNet y VAE en FP16; el encoder CLIP INT8 no compila en esta plataforma, hay que usar `source/clip.tflite`.
- Google Tensor G5 (Pixel 10) y Tensor G6 (Pixel 11): UNet y VAE en FP16, CLIP con pesos INT8, compilados con el Tensor SDK beta; todos los operadores se ejecutan en la TPU.
- Plataformas no soportadas: el compilador público rechaza MT6886 (Dimensity 7200) con el error `Not a valid platform`. Los móviles MediaTek con firmware de Samsung (por ejemplo, Galaxy Tab S11) no arrancan el servicio NeuroPilot para aplicaciones, así que las builds compiladas no cargan allí.
- Cualquier NPU LiteRT con compilación on-device, o CPU/GPU, puede usar los modelos sin compilar de `source/`.
- Despliegue: `ai-edge-litert` 2.3.0, `ai-edge-litert-sdk-mediatek` 2.3.0 y `ai-edge-litert-sdk-google-tensor` 2.3.0. No hay soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a este formato.
- Latencia y throughput: no disponibles (no se han realizado mediciones en dispositivo).
- Huella en disco del repositorio completo: 15,4 GB, incluyendo todas las variantes por plataforma y los modelos sin compilar.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de prompt | Licencia | Formato | Plataforma | Estado |
|---|---|---|---|---|---|---|---|
| `timmyboy26/stable-diffusion-v1-5-LiteRT-NPU` | No disponible (hereda SD 1.5) | 512×512 | 77 tokens | CreativeML OpenRAIL-M | `.tflite` (LiteRT) | NPU MediaTek MT6991/MT6993, TPU Tensor G5/G6 | Experimental, sin validar en dispositivo |
| `stable-diffusion-v1-5/stable-diffusion-v1-5` | ~860 M UNet, ~123 M text encoder, ~83 M VAE | 512×512 | 77 tokens | CreativeML OpenRAIL-M | safetensors / diffusers | GPU NVIDIA, Apple Silicon, CPU | Referencia estable, ampliamente desplegado |
| `qualcomm/Stable-Diffusion-v1.5` | No disponible | No disponible | No disponible | No disponible en la información consultada | No disponible | Ecosistema Qualcomm (Snapdragon) | Exportación para Qualcomm AI Hub; datos de rendimiento no disponibles |
| Stable Diffusion 2.1 / SDXL | No disponible en la información consultada | No disponible | No disponible | CreativeML OpenRAIL++-M (según versión) | safetensors / diffusers | GPU | No disponible |

La diferencia principal frente al checkpoint original no está en calidad de imagen, que debería ser equivalente al compartir pesos, sino en el soporte de ejecución: este paquete es el único de la comparativa que apunta a NPU de MediaTek y TPU de Google Tensor con grafos compilados AOT. Frente a la exportación de Qualcomm, cubre otro fabricante y no hay datos públicos para comparar rendimiento.

## Limitaciones y advertencias

- Estado experimental: los ficheros se han compilado pero no se han validado ni benchmarkeado en dispositivo; el rendimiento y la corrección numérica de las salidas no están confirmados.
- Compatibilidad de hardware muy restringida: solo Dimensity 9400, Dimensity 9500 y Tensor G5/G6 en las builds precompiladas, y el compilador rechaza MT6886 (Dimensity 7200).
- Los dispositivos MediaTek con firmware de Samsung no pueden cargar los modelos porque el servicio NeuroPilot no se inicia para aplicaciones.
- El encoder CLIP INT8 no compila en MT6993; hay que recurrir a la versión sin compilar, con la posible penalización de rendimiento que ello implique.
- Las builds AOT públicas de MediaTek pueden estar menos optimizadas que las generadas internamente por Google (LiteRT #6462), lo que introduce incertidumbre sobre el rendimiento real.
- Resolución fija de 512×512 y prompts limitados a 77 tokens: no hay control de resolución variable ni de prompts largos.
- Idiomas no documentados; el modelo base está entrenado principalmente en inglés, con menor fidelidad esperada en castellano.
- Calidad de imagen heredada de SD 1.5: artefactos en anatomías, manos y texto dentro de la imagen, y sesgos estéticos y demográficos procedentes de los datos de entrenamiento originales.
- Riesgo de reproducción de sesgos y de contenido no deseado si el prompt no se filtra; el autor no documenta ningún sistema de moderación incluido.
- Licencia CreativeML OpenRAIL-M: no es una licencia de código abierto aprobada por OSI, incluye restricciones de uso basadas en el comportamiento y obliga a propagar esas restricciones a cualquiera que utilice los ficheros.
- Repositorio de 15,4 GB: incluye todas las variantes por plataforma más los modelos sin compilar, lo que complica su distribución dentro de paquetes de aplicación.
- Sin pipeline declarado en HuggingFace, sin descargas ni interacciones registradas y sin documentación de API de uso más allá de las formas de entrada.
- No hay información sobre consumo energético ni sobre el impacto térmico de ejecutar el denoising completo en NPU móvil.

## Enlaces

- Repositorio del modelo: https://huggingface.co/timmyboy26/stable-diffusion-v1-5-LiteRT-NPU
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Página de la organización del modelo base: https://huggingface.co/stable-diffusion-v1-5
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Issue de ai-edge-quantizer sobre la receta INT8 del UNet: https://github.com/google-ai-edge/ai-edge-quantizer/issues/472
- Issue de LiteRT sobre la optimización de las builds AOT de MediaTek: https://github.com/google-ai-edge/LiteRT/issues/6462
- Exportación de SD 1.5 para Qualcomm AI Hub: https://huggingface.co/qualcomm/Stable-Diffusion-v1.5
- Repositorio de modelos generativos de Stability AI: https://github.com/Stability-AI/generative-models
- Guía de Stable Diffusion v1.5: https://exploreai.tools/ai-models/stable-diffusion-v1-5
