# subhashhhhhh/lumen-npu

## Resumen

Lumen NPU es una colección de modelos compilados de forma anticipada (ahead-of-time) para ejecutarse sobre procesadores neuronales (NPU) Qualcomm Hexagon, desarrollada por el usuario subhashhhhhh como parte del proyecto [Lumen](https://github.com/subhashhhhhh/Lumen). No se trata de un modelo de lenguaje nuevo, sino de un empaquetado de modelos de visión ya existentes (el codificador visual de SigLIP 2 B/16 de Google y el detector de texto de PP-OCRv6 small de PaddlePaddle) convertidos al formato `.tflite` mediante el compilador Qualcomm (QAIRT) de LiteRT, la librería de inferencia en el borde de Google.

Su propósito es permitir que aplicaciones Android aprovechen la NPU del teléfono en lugar de la CPU o la GPU, con el consiguiente ahorro energético y mejora de latencia. El repositorio organiza los archivos en carpetas por chip (por ejemplo, `SM7450/` y `SM8650/`), de modo que cada dispositivo descarga únicamente los binarios compilados para su SoC concreto. Es relevante para desarrolladores de apps móviles de visión por computador y OCR que buscan inferencia acelerada por hardware en terminales Qualcomm, dentro de un ecosistema open source (Apache 2.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP 2 (ViT B/16) y detector de texto PP-OCRv6 small, compilados a TFLite |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelos de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (OCR: depende del modelo PP-OCRv6 original) |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), compilado con LiteRT QAIRT para Qualcomm Hexagon |

Datos adicionales del repositorio: tamaño total de 23,0 GB, 818 descargas, librería asociada `litert`.

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados por el autor, sino compilaciones de dos modelos fuente. El primero es el codificador de imágenes de SigLIP 2 B/16 (`siglip_visual.tflite`), un Vision Transformer con parches de 16x16 y resolución de entrada de 224x224, entrenado por Google para alineación imagen-texto. El segundo es el detector de texto de PP-OCRv6 small (`ocr_det.tflite`), el componente de detección del pipeline OCR de PaddlePaddle, distribuido originalmente en ONNX.

La compilación se realiza de forma automatizada mediante un workflow de GitHub Actions, que usa el compilador Qualcomm (QAIRT) integrado en LiteRT para generar binarios específicos por chip Hexagon. Los mismos modelos fuente son los que Lumen emplea en CPU y GPU, por lo que la salida debe ser funcionalmente equivalente; la diferencia radica en el backend de ejecución. No hay datos sobre entrenamiento propio, datasets ni ajuste fino: no disponible.

## Capacidades

- Codificación de imágenes con SigLIP 2 B/16: generación de embeddings visuales para tareas de alineación imagen-texto, clasificación zero-shot o recuperación multimodal.
- Detección de regiones de texto en imágenes mediante PP-OCRv6 small (componente de detección, no de reconocimiento).
- Ejecución acelerada en NPU Qualcomm Hexagon mediante el dispatch library de LiteRT y el runtime de Qualcomm.
- Distribución por chip: cada teléfono descarga solo los binarios de su SoC (carpetas `SM7450/`, `SM8650/`, etc.).
- Integración como backend de la aplicación Lumen, que también soporta ejecución en CPU y GPU con los modelos fuente.
- No es un modelo generativo de texto: no soporta chat, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- OCR en el dispositivo: detectar bloques de texto en fotos de documentos, carteles o capturas de pantalla sin enviar datos a la nube, aprovechando la NPU para reducir latencia y consumo de batería.
- Búsqueda visual semántica local: usar los embeddings de SigLIP 2 para indexar la galería fotográfica del usuario y buscar imágenes por descripción en lenguaje natural, todo offline.
- Clasificación zero-shot de imágenes en apps móviles: categorizar fotos (comida, documentos, paisajes) sin entrenar un clasificador específico, gracias a la alineación imagen-texto de SigLIP.
- Moderación de contenido en el borde: filtrar o etiquetar imágenes antes de subirlas, evitando transmitir datos sensibles del usuario.
- Escaneo de documentos en aplicaciones de productividad: combinar el detector de texto con un reconocedor posterior para digitalizar recibos o notas directamente en el terminal.
- Prototipado de inferencia multimodal en Android: servir como referencia de cómo compilar y desplegar modelos de visión en NPU con LiteRT QAIRT mediante CI/CD (GitHub Actions).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco hay mediciones de latencia, throughput ni precisión comparando las compilaciones NPU frente a las versiones CPU/GPU de los modelos fuente.

## Requisitos de hardware

- Requisito imprescindible: un teléfono o dispositivo con SoC Qualcomm cuyo chip Hexagon tenga carpeta propia en el repositorio (por ejemplo, SM7450 o SM8650). Los binarios no funcionan en otros chips ni en CPU/GPU de escritorio.
- No aplica VRAM de GPU: la ejecución es en NPU móvil, con memoria compartida del dispositivo. El consumo exacto de memoria no está disponible.
- No es compatible con GPUs de consumo (RTX 4090, A100, etc.) ni con servidores: el formato compilado QAIRT es específico del runtime de Qualcomm en el dispositivo.
- Despliegue: únicamente mediante LiteRT con la Qualcomm dispatch library y el runtime de Qualcomm (QAIRT). No funciona con vLLM, llama.cpp, Ollama ni TGI.
- Los modelos fuente (SigLIP 2 B/16 y PP-OCRv6 small) sí pueden ejecutarse en CPU o GPU a través del proyecto Lumen, con requisitos modestos dada la escala B/16.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Aspecto | Lumen NPU (SigLIP 2 B/16 + PP-OCRv6) | SigLIP 2 B/16 (original, HF) | CLIP ViT-B/16 (OpenAI) |
|---|---|---|---|
| Parametros | no disponible (compilado) | ~86 M (base) | ~150 M (visual + texto) |
| Formato | TFLite compilado por chip Hexagon | safetensors (JAX/PyTorch) | safetensors/PyTorch |
| Backend objetivo | NPU Qualcomm Hexagon (movil) | CPU/GPU/TPU genericos | CPU/GPU genericos |
| Resolucion de entrada | 224x224 | 224x224 | 224x224 |
| Licencia | Apache 2.0 | Apache 2.0 | MIT (pesos con licencia propia de OpenAI) |
| Uso en Android offline | Si, acelerado por NPU | Requiere runtime propio (TFLite/ONNX) | Requiere runtime propio |

Como alternativa en el ámbito OCR móvil, PP-OCRv6 small en su formato ONNX/Paddle original puede ejecutarse en CPU o GPU sin restricción de chip, a costa de no aprovechar la NPU Hexagon.

## Limitaciones y advertencias

- Compatibilidad de hardware muy restringida: los binarios solo funcionan con LiteRT's Qualcomm dispatch library y el runtime de Qualcomm en teléfonos con el chip concreto para el que fueron compilados. Un binario para SM8650 no servirá en otro SoC.
- No son modelos generativos: no sirven como LLM, no producen texto libre y no deben evaluarse como tales.
- El detector OCR solo localiza texto; el reconocimiento del contenido requiere un modelo adicional no incluido en este repositorio.
- No hay documentación de cuantización aplicada, precisión numérica ni degradación respecto a los modelos fuente, por lo que conviene validar la calidad de los embeddings/detecciones en el dispositivo objetivo.
- Riesgo de alucinación: no aplicable directamente al no ser un modelo de lenguaje, aunque los embeddings de SigLIP pueden producir recuperaciones semánticas imprecisas en dominios fuera de su distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución.
- Proyecto de un autor individual mantenido mediante GitHub Actions; el soporte a largo plazo y la cobertura de chips nuevos dependen del mantenimiento comunitario.
- Sesgos: heredados de los modelos fuente (SigLIP 2 y PP-OCRv6), entrenados con datos mayoritariamente en inglés y con contenido web; el rendimiento en otros idiomas o dominios puede ser inferior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/subhashhhhhh/lumen-npu
- Proyecto Lumen (GitHub): https://github.com/subhashhhhhh/Lumen
- LiteRT (Google AI Edge, GitHub): https://github.com/google-ai-edge/LiteRT
- Modelo fuente SigLIP 2 B/16: https://huggingface.co/google/siglip2-base-patch16-224
- Modelo fuente PP-OCRv6 small det (ONNX): https://huggingface.co/PaddlePaddle/PP-OCRv6_small_det_onnx
