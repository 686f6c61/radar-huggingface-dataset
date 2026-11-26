# Tamarillo/ai-image-forensics-guard-tiny

## Resumen

Tamarillo/ai-image-forensics-guard-tiny es un clasificador de imágenes especializado en la detección de imágenes generadas por inteligencia artificial y deepfakes. Lo desarrolla el usuario Tamarillo y se construye como un fine-tuning de facebook/dinov2-small, un backbone ViT de 22,1 millones de parámetros con entrada de 224×224 píxeles. El modelo resuelve un problema acotado pero relevante: ofrecer un detector de contenido sintético lo bastante ligero como para ejecutarse en CPU de un solo hilo de cuatro núcleos (82,3 ms) o incluso en el navegador mediante WASM con Transformers.js, con un peso ONNX FP32 de 88,5 MB.

Su propuesta diferencial no es la precisión bruta, sino la relación entre coste computacional y robustez frente a recomprresión de redes sociales. El autor lo presenta como un reemplazo directo de una línea para umm-maybe/AI-image-detector y Organika/sdxl-detector, con el mismo esquema de etiquetas (0 = artificial, 1 = human) y sin necesidad de trust_remote_code. Frente a esos dos modelos, que cuadruplican su tamaño, obtiene un EER menor en las suites de evaluación publicadas, aunque queda por detrás de sus propios hermanos small y base en precisión global.

Es relevante ahora porque la verificación de autenticidad de imágenes se está convirtiendo en un requisito de producto en plataformas sociales, marketplaces y pipelines de moderación, y la mayoría de detectores disponibles exigen GPU o son demasiado pesados para despliegues en el borde. Este modelo apunta explícitamente a ese hueco: sidecars de CPU, extensiones de navegador y filtros previos en el cliente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (DINOv2-small) para clasificación de imágenes |
| Parametros totales | 22.058.114 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión; entrada de imagen 224×224 píxeles) |
| Tipos de cuantizacion | FP32 ONNX (88,5 MB, paridad exacta); el autor no documenta otros formatos cuantizados en la información disponible |
| Idiomas soportados | No disponible (modelo de imagen, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de facebook/dinov2-small, un Vision Transformer autosupervisado de 22,1 millones de parámetros que sirve como extractor de características. Sobre ese backbone se añade una cabeza de clasificación binaria con el esquema id2label = {0: "artificial", 1: "human"}, entrenada para la tarea de forensia de imágenes. La entrada se procesa a 224×224 píxeles, resolución inferior a la de los tiers superiores de la familia (384×384), lo que explica en parte su menor coste de inferencia.

Los datos de entrenamiento declarados en la model card incluyen los datasets srishti-kaushik/COCO-2017, finedet/openimages y OwensLab/CommunityForensics. El autor describe el modelo como "social-media-recompression-hardened", es decir, entrenado o evaluado con especial atención a la degradación por recomprresión (JPEG Q45 a 512 px y WebP Q55). No se detalla en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO, algo esperable en un clasificador de imágenes. Sí se publica un fichero calibration.json con un escalado de temperatura T = 1.3757 para calibrar las probabilidades de salida, un detalle técnico poco habitual en detectores de este tamaño.

## Capacidades

- Clasificación binaria de imágenes en dos clases: "artificial" (generada por IA) y "human" (fotografía real).
- Detección de deepfakes y contenido sintético en imágenes de redes sociales, con robustez declarada frente a recomprresión JPEG y WebP.
- Inferencia en CPU de cuatro hilos con latencia de 82,3 ms por imagen.
- Ejecución en navegador mediante Transformers.js y WASM, sin backend.
- Exportación ONNX con paridad exacta respecto a FP32 PyTorch.
- Calibración de probabilidades mediante escalado de temperatura (T = 1.3757).
- Integración directa en pipelines image-classification de Hugging Face sin trust_remote_code.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso; es exclusivamente un clasificador de imagen.

## Casos de uso

- Moderación en el cliente: una extensión de navegador o una web app puede ejecutar el modelo vía Transformers.js WASM para marcar imágenes sospechosas antes de subirlas, sin enviar el contenido a un servidor y con 88,5 MB de descarga inicial.
- Verificación en marketplaces: filtro previo en el pipeline de subida de anuncios que detecta fotos de producto generadas por IA, con latencia de 82,3 ms en CPU que no penaliza la experiencia de publicación.
- Sidecar de CPU en plataformas sociales: servicio ligero junto al pipeline de ingesta que clasifica cada imagen con ONNX Runtime en cuatro hilos, útil cuando no hay GPU disponible o el coste por imagen debe ser mínimo.
- Detección de deepfakes en periodismo: herramienta de primera pasada para redacciones que reciben material gráfico y necesitan una señal rápida de autenticidad antes de la verificación humana, aprovechando el EER del 19,05 % en Synthbuster.
- Filtrado de datasets: limpieza de corpus de imágenes para entrenamiento, descartando muestras sintéticas con un clasificador barato que puede ejecutarse en paralelo sobre lotes grandes en CPU.
- Reemplazo directo en pipelines existentes: sustitución de umm-maybe/AI-image-detector u Organika/sdxl-detector cambiando solo el identificador del modelo, manteniendo el esquema de etiquetas y ganando velocidad y tamaño.
- Aplicaciones móviles y de borde: integración en apps que ya empaquetan ONNX Runtime para otros modelos, reutilizando el runtime con un modelo adicional de 88,5 MB.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | tiny (este modelo) | Familia small | Familia base | umm-maybe | Organika |
|---|---|---|---|---|---|
| EER 3-Corpus Unique Zero-Touch | 28,52 % (AUC 0,7862) | 26,65 % (AUC 0,7908) | 20,73 % (AUC 0,8573) | 37,56 % | 36,27 % |
| EER 5-Suite Public Mean | 30,53 % (AUC 0,7652) | 26,90 % (AUC 0,8015) | 19,98 % (AUC 0,8709) | No disponible | No disponible |
| EER Synthbuster | 19,05 % (AUC 0,899) | 9,45 % | 10,00 % | No disponible | No disponible |
| EER Social-Recomp | 37,71 % | 30,59 % | 20,12 % | No disponible | No disponible |
| Latencia CPU FP32 ONNX (4 hilos) | 82,3 ms | 136,8 ms | 312,7 ms | 140,9 ms | No disponible |
| Tamano ONNX | 88,5 MB | 111,6 MB | 344,6 MB | 353,7 MB | No disponible |

Puntos de operación a umbral 0,50: en OpenFake Core, 41,3 % de recall de falsos y 14,8 % de FPR en fotos reales; en Synthbuster, 42,9 % de recall y 1,5 % de FPR; bajo estrés de recomprresión social, 55,9 % de recall y 31,0 % de FPR. El autor reconoce explícitamente que los tiers mayores (small, base) y modelos como haywoodsloan (20,68 %) o CommunityForensics-ViT (25,45 %) obtienen mejor EER global; tiny se justifica cuando el límite es la latencia en CPU o el tamaño en navegador.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo está pensado para CPU. En GPU, el peso FP32 de 88,5 MB ocupa una fracción mínima de memoria.
- GPU recomendadas: cualquiera con soporte CUDA es suficiente; el autor no publica latencias en GPU.
- CPU: latencia de 82,3 ms en x86 de cuatro hilos con ONNX Runtime FP32.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo, aunque su diseño objetivo es la CPU.
- Despliegue: transformers (pipeline image-classification), ONNX Runtime (CPUExecutionProvider), Transformers.js en navegador. No se mencionan vLLM, llama.cpp ni TGI, que no aplican a un clasificador de imagen.
- Throughput: no se publica una cifra agregada de imágenes por segundo; a partir de la latencia de 82,3 ms por imagen en cuatro hilos se puede estimar, pero el autor no la documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | EER 3-Corpus | Licencia | Latencia CPU |
|---|---|---|---|---|---|
| Tamarillo/ai-image-forensics-guard-tiny | 22,1 M | 224×224 | 28,52 % | Apache-2.0 | 82,3 ms |
| Tamarillo/ai-image-forensics-guard-small | 27,9 M | 384×384 | 26,65 % | Apache-2.0 | 136,8 ms |
| Tamarillo/ai-image-forensics-guard-base | 93,2 M | 384×384 | 20,73 % | Apache-2.0 | 312,7 ms |
| umm-maybe/AI-image-detector | No disponible (4× mayor en tamano) | No disponible | 37,56 % | No disponible | 140,9 ms |
| Organika/sdxl-detector | No disponible | No disponible | 36,27 % | No comercial | No disponible |

Frente a umm-maybe y Organika, tiny gana en EER y en coste, y además Organika tiene licencia no comercial, lo que limita su uso en producto. Dentro de la propia familia, small y base son más precisos pero entre 1,7 y 3,8 veces más lentos en CPU.

## Limitaciones y advertencias

- Precisión moderada: EER del 30,53 % en la media de cinco suites; no es adecuado como única barrera de decisión en producción sin revisión humana.
- Degradación bajo recomprresión: el FPR en fotos reales sube al 31,0 % bajo estrés de recomprresión social, lo que puede generar falsos positivos masivos en contenido reenviado.
- Umbral: las probabilidades de pipeline() no están calibradas; para decisiones automáticas conviene aplicar la temperatura T = 1.3757 de calibration.json y fijar el umbral según el coste relativo de falsos positivos y falsos negativos.
- Sesgos: no se documentan análisis de sesgo por demografía, tipo de imagen o dominio; el rendimiento puede variar fuera de los corpus de evaluación (COCO, OpenImages, CommunityForensics, Synthbuster).
- Idiomas: no aplica, pero el modelo no procesa texto ni metadatos; solo píxeles.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni responsabilidad sobre falsos positivos en entornos de moderación.
- Ecosistema: repo con 0 descargas y 0 likes en el momento de la consulta; tracción comunitaria nula, lo que implica poca validación externa independiente.
- Resolución fija de 224×224: pierde detalle en imágenes grandes o con artefactos localizados, lo que explica parte de su desventaja frente a los tiers de 384×384.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/ai-image-forensics-guard-tiny
- Modelo base: https://huggingface.co/facebook/dinov2-small
- Demo (Hugging Face Space): https://huggingface.co/spaces/Tamarillo/ai-image-forensics-guard-demo
- Tier small: https://huggingface.co/Tamarillo/ai-image-forensics-guard-small
- Tier base: https://huggingface.co/Tamarillo/ai-image-forensics-guard-base
- Dataset COCO-2017: https://huggingface.co/datasets/srishti-kaushik/COCO-2017
- Dataset OpenImages: https://huggingface.co/datasets/finedet/openimages
- Dataset CommunityForensics: https://huggingface.co/datasets/OwensLab/CommunityForensics
- Modelo comparable umm-maybe: https://huggingface.co/umm-maybe/AI-image-detector
- Modelo comparable Organika: https://huggingface.co/Organika/sdxl-detector
- Transformers.js: https://github.com/huggingface/transformers.js
