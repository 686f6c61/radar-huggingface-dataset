# Tamarillo/ai-image-forensics-guard-base

## Resumen

Tamarillo/ai-image-forensics-guard-base es un clasificador de imágenes diseñado para detectar imágenes generadas artificialmente (deepfakes y contenido sintético) en entornos de redes sociales. Lo desarrolla el usuario Tamarillo y se construye sobre el backbone google/siglip2-base-patch16-384, un modelo de visión-lenguaje de tipo SigLIP-2 con parches de 16×16 y resolución de entrada de 384×384 píxeles. El modelo resuelve el problema de la verificación forense de imágenes en pipelines de moderación y trust-and-safety, donde los detectores previos degradan su precisión cuando las imágenes han sufrido recompresión agresiva (JPEG y WebP) típica de plataformas sociales.

La propuesta principal es ser un reemplazo directo de una línea para detectores ampliamente usados como umm-maybe/AI-image-detector y Organika/sdxl-detector, manteniendo el mismo esquema de etiquetas (0: artificial, 1: human) y funcionando con AutoModelForImageClassification sin trust_remote_code. Con 93,2 millones de parámetros, un repositorio de 0,7 GB y licencia Apache-2.0, se posiciona como la variante "base" de una familia de tres modelos (tiny, small y base) orientada a producción en GPU y CPU.

Su relevancia actual radica en el endurecimiento frente a recompresión social: según la model card, lidera los ocho modelos evaluados en el conjunto Social-Media Recompressed con un EER del 20,12% y un AUC de 0,872, superando a modelos hasta 2,1 veces más grandes. Además, ofrece pesos en safetensors y ONNX, lo que facilita su despliegue tanto en servidores con GPU como en entornos de CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP-2 (vision transformer con parches de 16×16), backbone google/siglip2-base-patch16-384 |
| Parametros totales | 93.177.602 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye FP32 en safetensors y ONNX FP32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SigLIP-2, un vision transformer con atención por parches de 16×16 píxeles y resolución de entrada de 384×384. Sobre el backbone google/siglip2-base-patch16-384 se añade una cabeza de clasificación de imágenes con dos clases (artificial y human), lo que da lugar a los 93,2 millones de parámetros totales. El modelo se expone como AutoModelForImageClassification estándar de transformers, sin código remoto personalizado, y se distribuye también en formato ONNX para inferencia con onnxruntime.

Los datos de entrenamiento citados en la model card incluyen los conjuntos srishti-kaushik/COCO-2017, finedet/openimages y OwensLab/CommunityForensics. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). Sí se documenta una calibración por temperatura con T = 1.2460 recogida en calibration.json, que ajusta las probabilidades softmax sin alterar el argmax a 0,50. La innovación destacable es el endurecimiento frente a recompresión social (JPEG Q45 a 512 px y WebP Q55), que busca mantener la precisión forense en imágenes que han pasado por plataformas como WhatsApp o X.

## Capacidades

- Clasificación binaria de imágenes en dos etiquetas: artificial (0) y human (1).
- Detección de imágenes generadas por IA y deepfakes en imágenes de redes sociales.
- Robustez frente a recompresión JPEG y WebP agresiva (escenario Social-Media Recompressed).
- Inferencia nativa mediante pipeline("image-classification") de transformers, sin trust_remote_code.
- Compatibilidad como reemplazo directo de umm-maybe/AI-image-detector y Organika/sdxl-detector con el mismo esquema id2label.
- Ejecución en PyTorch (safetensors) y en ONNX Runtime (CPU y GPU).
- Calibración opcional de probabilidades mediante escalado por temperatura (T = 1.2460).
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo clasifica imágenes subidas por usuarios como artificiales o humanas, resistiendo la recompresión típica de WhatsApp o X, lo que lo hace adecuado para pipelines de trust-and-safety que reciben imágenes ya recomprimidas.
- Puerta de verificación en flujos de revisión forense (SOC): integrado como primer filtro en pipelines de revisión, permite priorizar manualmente las imágenes marcadas como artificiales antes de un análisis más profundo.
- Sustitución directa en pipelines existentes de Hugging Face: al mantener el esquema id2label y el pipeline image-classification, puede reemplazar a umm-maybe/AI-image-detector u Organika/sdxl-detector cambiando únicamente el identificador del modelo.
- Detección de deepfakes en verificación de identidad: como clasificador de imágenes, puede incorporarse en flujos de onboarding o KYC para señalar retratos sintéticos antes de la validación documental.
- Análisis por lotes en servidores sin GPU: la variante ONNX FP32 permite ejecutar la clasificación en CPU (312,7 ms por imagen según la model card) para procesar archivos históricos de imágenes.
- Investigación y periodismo de verificación: permite comprobar la procedencia sintética de imágenes virales y documentar casos de desinformación visual con una puntuación calibrada.
- Filtrado previo en datasets de entrenamiento: ayuda a separar imágenes reales de sintéticas al construir corpus de visión, reduciendo la contaminación por contenido generado.

## Benchmarks y rendimiento

Los datos de la model card comparan el modelo con otros siete detectores. Se recogen los resultados principales:

| Benchmark | EER | AUC | Recall fake a 0,50 | FPR real a 0,50 |
|---|---|---|---|---|
| Social-Media Recompressed | 20,12% | 0,872 | 73,9% | 14,6% |
| Synthbuster | 10,00% | 0,959 | 53,1% | 0,0% |
| 3-Corpus Unique Zero-Touch | 20,73% | 0,8573 | no disponible | no disponible |
| 5-Suite Public Mean | 19,98% | 0,8709 | no disponible | no disponible |
| OpenFake Core (limpio) | no disponible | no disponible | 47,1% | 3,3% |

En transferencia a generadores no vistos de OpenFake Core, la model card indica un AUC de 0,852–0,963 en 8 de 10 generadores, con transferencia débil documentada en flux.2-klein-9b (0,474) y gpt-image-2 (0,680).

Comparativa de la familia y alternativas según la model card:

| Modelo | Backbone | Params | Resolución | Social-Recomp EER | Synthbuster EER | 5-Suite Mean (EER / AUC) | ONNX CPU FP32 |
|---|---|---|---|---|---|---|---|
| ai-image-forensics-guard-tiny | dinov2-small | 22,1M | 224×224 | 37,71% | 19,05% | 30,53% / 0,7652 | 82,3 ms |
| ai-image-forensics-guard-small | convnextv2-tiny-22k-384 | 27,9M | 384×384 | 30,59% | 9,45% | 26,90% / 0,8015 | 136,8 ms |
| ai-image-forensics-guard-base (este) | siglip2-base-patch16-384 | 93,2M | 384×384 | 20,12% | 10,00% | 19,98% / 0,8709 | 312,7 ms |
| haywoodsloan (2,1× mayor) | no disponible | no disponible | no disponible | 26,24% | no disponible | 20,68% / no disponible | no disponible |
| Ateeqq | no disponible | no disponible | no disponible | 27,71% | no disponible | 27,50% / no disponible | no disponible |
| CommunityForensics-ViT | no disponible | no disponible | no disponible | 41,12% | no disponible | 25,45% / no disponible | no disponible |
| umm-maybe | no disponible | no disponible | no disponible | no disponible | no disponible | 38,70% / no disponible | no disponible |
| Organika | no disponible | no disponible | no disponible | no disponible | no disponible | 34,46% / no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,4 GB para los pesos (93,2M parámetros) más memoria de activaciones; el repositorio completo ocupa 0,7 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; A100, H100, RTX 4090 y RTX 3090 son sobredimensionadas para este modelo, pero válidas para procesamiento por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en iGPU con suficiente memoria compartida.
- Despliegue: transformers (pipeline image-classification), ONNX Runtime (CPU y GPU), y cualquier servidor compatible con modelos de transformers; no se documentan integraciones específicas con vLLM, TGI, llama.cpp ni Ollama (estas herramientas están orientadas a modelos generativos y no aplican a este clasificador).
- Latencia: 312,7 ms por imagen en CPU FP32 con ONNX según la model card; el throughput en GPU no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Resolución | Social-Recomp EER | Synthbuster EER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tamarillo/ai-image-forensics-guard-base | 93,2M | 384×384 | 20,12% | 10,00% | Apache-2.0 | Hugging Face, ONNX |
| haywoodsloan (2,1× mayor) | no disponible | no disponible | 26,24% | no disponible | no disponible | Hugging Face |
| Ateeqq | no disponible | no disponible | 27,71% | no disponible | no disponible | Hugging Face |
| CommunityForensics-ViT | no disponible | no disponible | 41,12% | no disponible | no disponible | Hugging Face |
| umm-maybe/AI-image-detector | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Organika/sdxl-detector | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Transferencia débil documentada en generadores concretos: AUC de 0,474 en flux.2-klein-9b y 0,680 en gpt-image-2, lo que indica que puede fallar con imágenes de esos modelos.
- Tasa de falsos positivos del 14,6% sobre fotos reales bajo recompresión social agresiva a umbral 0,50, lo que puede generar revisiones manuales innecesarias.
- Las probabilidades del pipeline son softmax sin calibrar; para umbrales de decisión en producción conviene aplicar la temperatura T = 1.2460 de calibration.json.
- El modelo es un clasificador binario de imágenes y no ofrece explicabilidad sobre qué regiones motivan la clasificación.
- No se documentan sesgos demográficos ni de contenido en la información disponible; al entrenarse con COCO-2017, OpenImages y CommunityForensics, puede heredar los sesgos de esas fuentes.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento citados.
- No dispone de capacidades de texto, agentes ni tool calling; no debe emplearse fuera de la clasificación de imágenes.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es todavía inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/ai-image-forensics-guard-base
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-384
- Demo (Space): https://huggingface.co/spaces/Tamarillo/ai-image-forensics-guard-demo
- Dataset COCO-2017: https://huggingface.co/datasets/srishti-kaushik/COCO-2017
- Dataset OpenImages: https://huggingface.co/datasets/finedet/openimages
- Dataset CommunityForensics: https://huggingface.co/datasets/OwensLab/CommunityForensics
- Detector de referencia umm-maybe: https://huggingface.co/umm-maybe/AI-image-detector
- Detector de referencia Organika: https://huggingface.co/Organika/sdxl-detector
