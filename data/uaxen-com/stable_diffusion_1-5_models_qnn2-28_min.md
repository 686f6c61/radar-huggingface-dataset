# uaxen-com/stable_diffusion_1.5_models_qnn2.28_min

## Resumen

`uaxen-com/stable_diffusion_1.5_models_qnn2.28_min` es un repositorio de pesos de Stable Diffusion 1.5 convertidos al formato QNN 2.28 (Qualcomm Neural Network) para su ejecución en hardware con aceleración NPU de Qualcomm, presumiblemente en dispositivos con chips Snapdragon. El autor, `uaxen-com`, publica una colección de modelos derivados de SD 1.5, incluyendo VAE de RealisticVision V6 y RealisticVision V5.1 Hyper, todos convertidos siguiendo una guía de conversión específica para SD 1.5 con clip skip 2.

El modelo resuelve un problema de despliegue: permitir la inferencia de text-to-image de SD 1.5 en plataformas con NPU Qualcomm mediante el runtime QNN, en lugar de depender de GPU convencionales. El repositorio ocupa 2.0 GB, lo que es coherente con pesos de SD 1.5 en precisión reducida o cuantización para NPU, aunque no se detalla el esquema exacto de cuantización más allá de la etiqueta "min" en el nombre.

La relevancia actual es acotada: se trata de un artefacto de conversión para un ecosistema de hardware específico, sin model card técnica extensa, sin benchmarks publicados y sin licencia declarada en el repositorio, lo que limita su evaluación rápida y su uso en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (Stable Diffusion 1.5), convertida a formato QNN 2.28 |
| Parametros totales | no disponible (SD 1.5 base ronda los 860 M en UNet, pero no se confirma en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; el nombre indica "qnn2.28_min" (formato QNN 2.28, presumiblemente cuantización mínima) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | QNN 2.28 (según el nombre y la guía de conversión); no se confirma safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion 1.5, un modelo de difusión latente con un autoencoder VAE, un UNet para el proceso de denoising y un text encoder CLIP. El repositorio no documenta entrenamiento propio: se limita a conversiones de pesos. En concreto, la model card indica que se obtuvieron VAE de RealisticVision V6 y RealisticVision V5.1 Hyper desde Civitai y que todos los modelos se convirtieron a `qnn2.28_min` con clip skip 2 siguiendo una guía de conversión para SD 1.5.

No se especifican datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF/DPO, porque el autor no entrena un modelo nuevo. La innovación técnica, si puede llamarse así, es la conversión a QNN 2.28 para NPU Qualcomm, un paso de toolchain más que una innovación arquitectónica. Tampoco se detalla el esquema de cuantización (por ejemplo, int8, int16 o mixto) ni el proceso de calibración.

## Capacidades

- Generación de imágenes text-to-image mediante el pipeline declarado `text-to-image`.
- Conversión orientada a inferencia en NPU Qualcomm con runtime QNN 2.28.
- Inclusión de VAE de RealisticVision V6 y RealisticVision V5.1 Hyper, lo que sugiere variantes con estética fotorrealista.
- Clip skip 2 aplicado en la conversión, un ajuste habitual en modelos SD 1.5 derivados para mejorar la coherencia del prompt.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades de audio.
- Capacidades multilingües: no disponibles; el text encoder CLIP de SD 1.5 tiene sesgo hacia inglés, pero no se confirma en la información.
- No se documenta modo "thinking", visión ni otras capacidades especiales.

## Casos de uso

- Inferencia local en dispositivos Snapdragon con NPU: el formato QNN 2.28 permite ejecutar SD 1.5 en hardware Qualcomm sin GPU dedicada, útil para demos en móvil o edge.
- Prototipado de generación de imágenes en entornos Windows on ARM con aceleración NPU: el runtime QNN es el camino habitual para aprovechar la Hexagon NPU en estos equipos.
- Pruebas de conversión y validación de toolchains: sirve como referencia para verificar que una conversión SD 1.5 a QNN produce imágenes coherentes con clip skip 2.
- Generación de imágenes fotorrealistas en local: al incluir VAE de RealisticVision, puede emplearse para retratos o escenas realistas en flujos offline.
- Evaluación comparativa de calidad QNN frente a PyTorch/ONNX: útil para medir degradación por cuantización en NPU frente a ejecución en GPU.
- Integración en aplicaciones de escritorio o móviles que ya usan el SDK de Qualcomm AI Engine Direct, donde cargar pesos QNN evita conversiones en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser formato QNN, el consumo relevante es memoria del sistema y memoria de la NPU, no VRAM de GPU.
- GPU recomendadas: no aplica directamente; el formato QNN está pensado para NPU Qualcomm (Hexagon) y no para CUDA.
- Compatibilidad con GPU de consumo: no confirmada; no se espera que estos pesos QNN se carguen en RTX 4090, A100 o H100 sin reconversión a otro formato.
- Opciones de despliegue: runtime QNN 2.28 de Qualcomm (Qualcomm AI Engine Direct); no se documenta vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uaxen-com/stable_diffusion_1.5_models_qnn2.28_min | no disponible (base SD 1.5) | no aplica | QNN 2.28 | no disponible | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-1.5 | ~860 M (UNet) | no aplica | safetensors | CreativeML OpenRAIL-M | Hugging Face, ampliamente usado |
| stabilityai/stable-diffusion-2-1 | ~865 M (UNet) | no aplica | safetensors | CreativeML OpenRAIL++-M | Hugging Face |
| runwayml/stable-diffusion-v1-5 | ~860 M (UNet) | no aplica | safetensors | CreativeML OpenRAIL-M | Hugging Face |

La comparativa es limitada: el repositorio de uaxen-com no declara licencia ni métricas, y su valor diferencial es el formato QNN, no la calidad del modelo base.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos de SD 1.5 y de los modelos RealisticVision de origen en Civitai.
- Model card mínima: no hay información sobre cuantización exacta, calibración ni degradación esperada.
- Formato QNN 2.28: no es portable a ecosistemas CUDA, ROCm ni CPU estándar sin reconversión.
- Sin benchmarks: no hay evidencia publicada de calidad de imagen, FID, CLIP score ni latencia.
- Repositorio con 0 descargas y 2 likes: poca validación comunitaria; riesgo de artefactos no verificados.
- Posible sesgo heredado de SD 1.5 y de RealisticVision: sesgos de representación, estética y contenido, no documentados por el autor.
- Riesgo de alucinación visual y artefactos propios de SD 1.5, agravado potencialmente por la cuantización a QNN.
- Idiomas no declarados: el text encoder CLIP de SD 1.5 rinde peor en castellano que en inglés.
- Fecha de creación futura (2026-11-12) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/uaxen-com/stable_diffusion_1.5_models_qnn2.28_min
- Guía de conversión citada: https://ld-guide.chino.icu/conversion/sd15
- RealisticVision V6 en Civitai: https://civitai.com/models/4201/realistic-vision-v60-b1?modelVersionId=245598
- RealisticVision V5.1 Hyper en Civitai: https://civitai.com/models/4201/realistic-vision-v60-b1?modelVersionId=501240
