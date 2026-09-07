# tfjack/Qwen3.8-27B-oQ5e-fp16-mtp

## Resumen

El modelo `tfjack/Qwen3.8-27B-oQ5e-fp16-mtp` es una cuantización oQe (Enhanced Quantization) del modelo base `Qwen/Qwen3.8-27B`, convertida y optimizada para Apple Silicon mediante oMLX. Se trata de un modelo denso multimodal (vision-language) de 27.781 millones de parámetros, capaz de comprender imágenes y vídeos además de texto, con un modo de razonamiento flexible que permite ajustar la profundidad del pensamiento mediante `reasoning_effort` (xhigh, medium, low).

La cuantización emplea un esquema oQ5e con ~5,9 bits efectivos por peso, basado en imatrix-enhanced dynamic mixed-precision con asignación de bits sensible a la sensibilidad. El vision tower se preserva en `float16` y el encoder de visión en `float32`, de modo que las capacidades visuales del modelo base permanecen intactas. La ventana de contexto nativa es de 262.144 tokens, ampliable hasta 1.000.000 mediante escalado YaRN (RoPE). El formato de pesos es MLX `safetensors`, compatible con oMLX, `mlx-lm`/`mlx-vlm` y LM Studio, lo que permite ejecutar un modelo de 27B con soporte multimodal directamente en Macs con chips de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativo; hasta 1.000.000 con YaRN (RoPE) |
| Tipos de cuantizacion | oQe enhanced, ~5,9 bpw (oQ5e); vision tower en `float16` y encoder de vision en `float32` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX `safetensors` (compatible con oMLX, `mlx-lm`, LM Studio) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 27B con arquitectura nativa vision-language, diseñado para tareas multimodales y de razonamiento multi-step. Incluye un modo de pensamiento activado por defecto, cuya profundidad se puede ajustar con `reasoning_effort`. El modelo preserva las cabezas de Multi-Token Prediction (MTP), lo que puede acelerar la generación en runtime compatibles.

La cuantización oQe aplicada por `tfjack` utiliza una técnica de precisión mixta dinámica mejorada con imatrix, que asigna más bits a los pesos más sensibles y menos a los menos relevantes, logrando ~5,9 bits efectivos por peso. El vision tower se mantiene en `float16` y el encoder de visión en `float32`, evitando degradación en la comprensión de imágenes y vídeos. Los detalles del dataset y el proceso de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Capacidades

- Comprensión multimodal: procesa imágenes y vídeos además de texto, gracias a la preservación completa del vision tower y del encoder de visión.
- Razonamiento con modo thinking: el modo de pensamiento está activado por defecto; la profundidad se puede ajustar con `reasoning_effort` (xhigh, medium, low).
- Generación de texto y conversación: adecuado para asistentes y tareas de generación de lenguaje natural.
- Multi-Token Prediction (MTP): las cabezas MTP se conservan intactas, lo que puede mejorar la eficiencia de decodificación en oMLX.
- Tareas multi-step: el modelo base está diseñado para completar tareas complejas y de varios pasos con mayor fiabilidad, según su documentación oficial.
- Contexto largo: ventana nativa de 262.144 tokens, ampliable hasta 1.000.000 con escalado YaRN.
- Soporte de tool calling: no especificado en la documentación disponible.

## Casos de uso

- Análisis de imágenes y vídeos en local: el modelo puede responder preguntas sobre contenido visual sin conexión, gracias a la preservación del vision tower. Es adecuado para aplicaciones que requieren privacidad de datos visuales, como revisión de documentos o análisis de capturas de pantalla en un Mac.
- Asistentes conversacionales multimodales en Apple Silicon: integrable en una aplicación de macOS o iOS mediante oMLX o `mlx-vlm`, aprovechando el contexto de 262k para mantener conversaciones largas que incluyen referencias a imágenes o vídeos.
- Razonamiento en tareas complejas de investigación: con el modo thinking activado y un contexto amplio, puede analizar informes extensos, artículos académicos o documentación técnica que incluya figuras, y generar conclusiones razonadas paso a paso.
- Generación de código con contexto amplio: la familia Qwen tiene reputación en tareas de programación; el modelo puede asistir en desarrollo, revisar repositorios grandes o generar código a partir de capturas de pantalla de interfaces o diagramas.
- Análisis de documentación técnica con figuras: al entender imágenes y texto simultáneamente, es útil para leer manuales, especificaciones o documentación de API que contengan diagramas, gráficos o capturas de pantalla.
- Prototipado rápido de aplicaciones de visión por computadora: en un Mac, los desarrolladores pueden experimentar con tareas de VQA (visual question answering), descripción de imágenes o análisis de vídeo sin necesidad de GPUs dedicadas.
- Edición de código asistida en entornos locales: mediante LM Studio con el motor MLX, se puede configurar como asistente de programación local, manteniendo el contexto del proyecto en la ventana de 262k tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo de pesos ocupa 19,76 GiB (21,21 GB). Para cargar el modelo y mantener el contexto, se recomienda un Mac con al menos 24 GB de memoria unificada; para usar la ventana completa de 262.144 tokens, la memoria necesaria será mayor.
- GPU recomendadas: Apple Silicon (M1, M2, M3 y posteriores). El formato MLX es específico de Apple, por lo que no se puede ejecutar directamente en GPUs NVIDIA.
- No aplica para consumer GPUs de NVIDIA, ya que el modelo está diseñado exclusivamente para Apple Silicon.
- Opciones de despliegue: oMLX Engine, `mlx-lm`/`mlx-vlm` y LM Studio (motor MLX). Para el contexto extendido de 1M se necesitan frameworks como vLLM, SGLang o TokenSpeed, que soportan escalado YaRN.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| `Qwen/Qwen3.8-27B` | 27.781.427.952 | 262.144 nativo; 1M con YaRN | Safetensors (bf16) | Apache 2.0 |
| `unsloth/Qwen3.8-27B` | No disponible | No disponible | No disponible | Apache 2.0 |
| `tfjack/Qwen3.8-27B-oQ5e-fp16-mtp` | 27.781.427.952 | 262.144 nativo; 1M con YaRN | MLX `safetensors`, cuantizado oQ5e | Apache 2.0 |

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo para esta cuantización; el modelo base puede heredar sesgos de su dataset de entrenamiento, que no está especificado en la información disponible.
- Riesgo de alucinación: inherente a los modelos generativos; no se ha realizado una evaluación específica de alucinaciones para esta versión cuantizada.
- Limitaciones de contexto: el contexto nativo de 262.144 tokens es el que se puede utilizar en oMLX; el límite de 1M requiere escalado YaRN y no está expuesto en oMLX ni en LM Studio.
- Idiomas: la documentación no especifica los idiomas soportados. Se recomienda verificar el comportamiento multilingüe antes de desplegar el modelo en producción.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero la cuantización es obra de un tercero; es necesario mantener la atribución al autor de la cuantización y al modelo base.
- Advertencia para producción: al ser un modelo cuantizado, puede existir una degradación de calidad respecto al modelo original en bf16. Se debe evaluar el rendimiento en el caso de uso concreto antes de su despliegue.
- Plataforma: el formato MLX limita su ejecución a Apple Silicon; no es compatible con GPUs NVIDIA ni con otros entornos sin una conversión previa del formato.

## Enlaces

- https://huggingface.co/tfjack/Qwen3.8-27B-oQ5e-fp16-mtp
- https://huggingface.co/Qwen/Qwen3.8-27B
- https://huggingface.co/unsloth/Qwen3.8-27B
- https://qwen.ai/blog?id=qwen3.8
