# Thermostatic/community-forensics-low-quality-detector-2026-08

## Resumen

El modelo `community-forensics-low-quality-detector-2026-08` es un detector de imágenes generadas por inteligencia artificial desarrollado por Thermostatic como continuación del detector `community-forensics-frontier-detector-2026-08`. Se trata de un fine-tuning independiente del modelo `OwensLab/commfor-model-384` (licencia MIT), orientado específicamente a mejorar la detección en imágenes de baja resolución, un punto débil habitual en los detectores de imágenes sintéticas. El modelo está pensado como una señal de screening de imagen completa, no como prueba de autoría o procedencia.

Con 21,8 millones de parámetros, el modelo es ligero y se distribuye en formato safetensors y ONNX (FP16), lo que facilita su despliegue en navegador o en entornos de producción con recursos limitados. Su relevancia actual radica en que aborda el problema de la detección de imágenes generadas por modelos recientes (GPT Image, DALL-E 3, FLUX, Imagen, Seedream, etc.) incluso después de procesos de reducción de resolución y recompresión típicos de las redes sociales. El autor publica de forma transparente los resultados de robustez, incluyendo los casos en los que el modelo falla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning de OwensLab/commfor-model-384, clasificador de imágenes) |
| Parametros totales | 21.811.969 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP16 (ONNX), safetensors (precisión no especificada) |
| Idiomas soportados | no disponible (modelo de visión, sin soporte textual) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la documentación proporcionada, pero se trata de un clasificador de imágenes basado en el modelo `OwensLab/commfor-model-384`, del cual se realizó un fine-tuning independiente. El preprocesamiento consiste en redimensionar el lado corto a 440 píxeles, aplicar un center-crop de 384×384 y normalizar con la media y desviación estándar de ImageNet. El modelo devuelve un logit crudo que se calibra mediante la fórmula `sigmoid(0.6352260751077209 * x - 0.2643220522904507)`, con un umbral de decisión fijado en 0,65 (equivalente a un logit de 1,390625).

El entrenamiento se realizó sobre un conjunto de 113.472 imágenes (109.560 de entrenamiento: 41.313 reales y 68.247 generadas; 3.912 de calibración: 1.983 reales y 1.929 generadas), abarcando 5 fuentes de imágenes reales y 131 buckets sintéticos que incluyen generadores recientes como GPT Image, DALL-E 3, FLUX 1/2, Imagen 3/4, Seedream 3/4/5, Qwen Image, Hunyuan Image, Midjourney, Recraft, Ideogram, Janus, Sana y Z-Image. La continuación de baja calidad se inicializó desde el detector previo y se entrenó durante 2.400 pasos con batch de 96 (230.400 muestras presentadas) en una NVIDIA L40S, usando optimizador AdamW, learning rate pico de 3e-6, warmup de 120 pasos, weight decay de 0,05, EMA de 0,999 y precisión bfloat16. La pérdida de entrenamiento se redujo de 1,208 a 0,268.

La aumentación aplicada fue simétrica entre clases: 30% de las muestras usaron una mezcla de "web-laundering" previa, y 70% usaron reducción de resolución de fuente pequeña (entre 32 y 256 píxeles) con interpolación aleatoria, recompresión JPEG/WebP, desenfoque, ruido y filtro unsharp.

## Capacidades

- Detección de imágenes generadas por IA en baja resolución: mejora significativa frente al modelo base en imágenes reducidas a 32-256 píxeles.
- Robustez a recompresión JPEG/WebP y a múltiples saltos de compresión (aunque con degradación en condiciones extremas).
- Clasificación binaria imagen completa: devuelve una puntuación calibrada entre 0 y 1, con umbral fijo de 0,65.
- Detección de generadores recientes: incluye en el entrenamiento imágenes de modelos de última generación (GPT Image, FLUX, Imagen, Seedream, etc.).
- Compatibilidad con ONNX Runtime: el artefacto ONNX FP16 permite despliegue en navegador y entornos de inferencia ligera.
- Transparencia en la evaluación: se publican informes de calibración, robustez y red-team con 33 condiciones de desarrollo.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de moderación para detectar imágenes generadas por IA que hayan sido redimensionadas o recompresas al subirlas, reduciendo la carga de revisión manual.
- Verificación de imágenes en medios de comunicación: los verificadores pueden usar el modelo como señal de alerta temprana ante posibles imágenes sintéticas en noticias, especialmente cuando las imágenes provienen de fuentes de baja calidad.
- Análisis forense de imágenes en investigaciones: como herramienta de screening en flujos de trabajo forenses, combinada con otras técnicas de análisis de procedencia, para priorizar casos que requieran examen profundo.
- Detección de imágenes sintéticas en archivos históricos o colecciones digitales: el modelo puede ayudar a catalogar y etiquetar imágenes generadas por IA en bibliotecas digitales o archivos, incluso si han sido escaneadas o comprimidas.
- Filtrado de datasets de entrenamiento: los equipos de ML pueden usar el detector para limpiar conjuntos de datos de imágenes, eliminando posibles imágenes sintéticas que contaminen el entrenamiento de otros modelos.
- Monitorización de campañas de desinformación: el modelo puede desplegarse en servicios de análisis de redes sociales para detectar oleadas de imágenes generadas por IA en contextos de baja resolución (por ejemplo, memes o capturas de pantalla).

## Benchmarks y rendimiento

Los resultados que se presentan a continuación provienen de la evaluación de desarrollo/calibración sobre el conjunto de 3.912 imágenes, con separación de grupos. No son estimaciones sobre un test de competición cerrado.

| Vista | Balanced accuracy | Fake recall | Real specificity | BA previo | Cambio |
|---|---:|---:|---:|---:|---:|
| Clean | 0,9530 | 0,9549 | 0,9511 | 0,9568 | -0,0038 |
| Web | 0,9359 | 0,9020 | 0,9697 | 0,9385 | -0,0026 |
| Hard | 0,8982 | 0,8543 | 0,9420 | 0,9047 | -0,0065 |

La balanced accuracy macro out-of-fold (clean/web/hard) es de 0,9264.

En la evaluación específica de baja calidad (11 vistas deterministas adicionales sobre las 3.912 imágenes de calibración):

| Agregado | Modelo previo | Este modelo | Cambio |
|---|---:|---:|---:|
| Balanced accuracy macro low-quality | 0,5992 | 0,7584 | +0,1592 |
| Fake recall macro low-quality | 0,2013 | 0,5612 | +0,3599 |
| Balanced accuracy peor resolución | 0,5204 | 0,7722 | +0,2518 |

Fake recall por condición de entrada:

| Condición | Fake recall |
|---|---:|
| Resize a 256 px | 0,9285 |
| Resize a 128 px | 0,8139 |
| Resize a 96 px | 0,7942 |
| Resize a 64 px | 0,6884 |
| Resize a 48 px | 0,6262 |
| Resize a 32 px | 0,5687 |
| 128 px + JPEG calidad 30 | 0,5837 |
| 96 px + JPEG calidad 20 | 0,3914 |
| 64 px JPEG/WebP multi-hop | 0,2374 |
| 48 px JPEG/WebP multi-hop | 0,1078 |

Diagnósticos positivos en cohortes recientes (solo positivos, no estiman balanced accuracy):

| Cohort | Recall previo low-quality | Este modelo |
|---|---:|---:|
| Generadores recientes Hugging Face (189 imágenes) | 0,2518 | 0,5833 |
| Generadores recientes OpenRouter (90 imágenes) | 0,1796 | 0,4537 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 21,8 millones de parámetros. En FP32 ocupa aproximadamente 87 MB; en FP16 (ONNX) unos 44 MB. Cabe en cualquier GPU moderna, incluso en GPUs integradas o en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. El entrenamiento se realizó en una NVIDIA L40S, pero la inferencia es viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Despliegue en CPU: el modelo es lo suficientemente pequeño para ejecutarse en CPU con ONNX Runtime, con latencias del orden de decenas de milisegundos por imagen (dependiendo del hardware).
- Opciones de despliegue: ONNX Runtime (recomendado para producción y navegador), safetensors con PyTorch, o cualquier framework que soporte estos formatos. No se menciona soporte explícito para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos oficiales de latencia. Dado el tamaño del modelo y la resolución de entrada (384×384), se espera un throughput alto en GPU (cientos de imágenes por segundo) y aceptable en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Thermostatic/community-forensics-low-quality-detector-2026-08 | 21,8 M | Detección de imágenes IA, robusto a baja resolución | MIT | Hugging Face |
| Thermostatic/community-forensics-frontier-detector-2026-08 | no disponible | Detección de imágenes IA, enfoque general | MIT | Hugging Face |
| OwensLab/commfor-model-384 | no disponible | Detección de imágenes IA (modelo base) | MIT | Hugging Face |

El modelo de baja calidad mejora sustancialmente el recall en condiciones de baja resolución frente a su predecesor (de 0,2013 a 0,5612 en fake recall macro low-quality), a costa de una ligera pérdida de balanced accuracy en las vistas clean, web y hard (entre -0,0026 y -0,0065). No se dispone de comparaciones con otros detectores comerciales o académicos en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo es una señal de screening de imagen completa, no una prueba de autoría o procedencia. No debe usarse como evidencia concluyente.
- El modelo es poco fiable tras procesos severos de "multi-hop laundering" (múltiples ciclos de recompresión y redimensionado) y contra composites sintéticos pequeños. Los resultados de robustez se publican de forma transparente, incluyendo los fallos.
- La evaluación se realizó sobre un conjunto de calibración de desarrollo; no hay estimación sobre un test de competición cerrado. Los resultados pueden no generalizar a la prevalencia real en internet.
- Las cohortes de generadores recientes (Hugging Face y OpenRouter) son pequeñas y solo positivas, por lo que no permiten estimar balanced accuracy ni prevalencia.
- El modelo puede tener sesgos hacia los tipos de generadores y fuentes de imágenes reales presentes en el conjunto de entrenamiento. No se han publicado análisis de sesgo por dominio o demografía.
- Riesgo de alucinación: al ser un clasificador binario, puede producir falsos positivos (imágenes reales clasificadas como generadas) y falsos negativos. El umbral de 0,65 está fijado y no se proporcionan curvas ROC completas.
- La licencia MIT permite uso comercial, pero el dataset combinado no se distribuye íntegramente; el componente público (`Thermostatic/frontier-synthetic-images-2026`) está sujeto a los términos de las fuentes originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thermostatic/community-forensics-low-quality-detector-2026-08
- Modelo base (frontier detector): https://huggingface.co/Thermostatic/community-forensics-frontier-detector-2026-08
- Modelo original de OwensLab: https://huggingface.co/OwensLab/commfor-model-384
- Dataset público de imágenes sintéticas: https://huggingface.co/datasets/Thermostatic/frontier-synthetic-images-2026
- Dataset Community Forensics de OwensLab: https://huggingface.co/datasets/OwensLab/CommunityForensics
- Paper arXiv 2411.04125: https://arxiv.org/abs/2411.04125
- Lista de recursos de detección de imágenes AIGC: https://github.com/yjtlab/awesome-aigc-image-detection
