# Tamarillo/ai-image-forensics-guard-small

## Resumen

`Tamarillo/ai-image-forensics-guard-small` es un clasificador de imágenes binario (artificial frente a humana) desarrollado por Tamarillo, un autor independiente, y publicado bajo licencia Apache-2.0. Su propósito es detectar imágenes generadas por IA y deepfakes en entornos de producción, con especial énfasis en resistir la recompresión típica de redes sociales (redimensionado bilineal a 512 px, JPEG calidad 45 y WebP calidad 55). Se posiciona como un reemplazo directo de una línea de `umm-maybe/AI-image-detector` y `Organika/sdxl-detector` en pipelines de `image-classification` de Hugging Face, manteniendo el mismo esquema de etiquetas (`id2label = {0: "artificial", 1: "human"}`).

El modelo parte de `facebook/convnextv2-tiny-22k-384`, una CNN pura de 27,9 millones de parámetros que opera a 384×384 píxeles. Frente a los detectores basados en transformers de visión de tamaño similar, la elección de una CNN pura permite procesar imágenes de mayor resolución con menor coste computacional: 136,8 ms por imagen en CPU de 4 hilos con ONNX FP32, frente a los 140,9 ms de `umm-maybe` a 224 px.

Su relevancia actual radica en el equilibrio entre coste y precisión en condiciones reales de distribución. En la suite pública de cinco conjuntos reportada por el autor, obtiene un EER medio del 26,90% (AUC 0,8015), mejor que `umm-maybe` (38,70%) y `Organika` (34,46%), y en el conjunto Synthbuster de forensia sobre RAW de cámara alcanza un EER del 9,45% (AUC 0,973), superando a modelos hasta siete veces más grandes. No requiere `trust_remote_code`, lo que simplifica su despliegue en servicios de moderación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXtV2-Tiny (CNN pura), `AutoModelForImageClassification` |
| Parámetros totales | 27.868.034 (27,9 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen, entrada 384×384 px) |
| Tipos de cuantización | FP32 (ONNX de 111,6 MB); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y ONNX (`onnx/model.onnx`) |

## Arquitectura y entrenamiento

El modelo es una ConvNeXtV2-Tiny afinada desde `facebook/convnextv2-tiny-22k-384`. ConvNeXtV2 es una familia de redes convolucionales que incorpora capas de normalización global (GRN, Global Response Normalization) y un esquema de entrenamiento enmascarado autosupervisado (FCMAE) en su preentrenamiento original; en este caso se parte del checkpoint preentrenado en ImageNet-22k a 384 px y se realiza un ajuste supervisado para la tarea binaria de forensia. Al ser una CNN pura, no emplea mecanismos de atención ni tokenización de parches, lo que explica su bajo coste de inferencia a resolución alta.

Los datos de entrenamiento declarados en la model card son tres conjuntos: `srishti-kaushik/COCO-2017`, `finedet/openimages` y `OwensLab/CommunityForensics`. No se especifica el número de imágenes, la composición exacta del dataset, la proporción de ejemplos sintéticos frente a reales ni si se aplicaron técnicas de aumento orientadas a la recompresión. Tampoco se documenta el uso de RLHF, DPO u otros métodos de alineación, algo esperable en un clasificador. La innovación destacable es el endurecimiento frente a recompresión social (redimensionado, JPEG y WebP agresivos) y la inclusión de un fichero `calibration.json` con escalado de temperatura (`T = 1.4343`) para calibrar las probabilidades de salida.

## Capacidades

- Clasificación binaria de imágenes: distingue entre imagen artificial (generada por IA o manipulada) e imagen humana (fotografía real).
- Detección de deepfakes y de imágenes sintéticas en escenarios de moderación de contenido.
- Robustez frente a recompresión de redes sociales: redimensionado bilineal a 512 px, JPEG Q45 y WebP Q55.
- Inferencia a 384×384 px, lo que preserva más detalle de textura que los detectores a 224 px.
- Salida de probabilidades calibrables mediante escalado de temperatura (`calibration.json`, `T = 1.4343`).
- Ejecución sin `trust_remote_code` en `transformers>=4.40`, con soporte nativo de `pipeline("image-classification")`.
- Exportación ONNX para inferencia en CPU de servidor o edge con `onnxruntime`.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vídeo.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede filtrar imágenes subidas por usuarios antes de su publicación, clasificando cada imagen como artificial o humana con una latencia de 136,8 ms por imagen en CPU de 4 hilos, lo que permite procesar lotes grandes sin GPU.
- Verificación de autenticidad en medios de comunicación: un redactor puede pasar las imágenes recibidas por el detector para marcar posibles generaciones sintéticas antes de publicarlas, aprovechando su buen rendimiento en el conjunto Synthbuster (EER 9,45%, AUC 0,973).
- Detección de deepfakes en flujos de mensajería: al estar endurecido frente a recompresión JPEG y WebP, es adecuado para analizar imágenes que han pasado por WhatsApp o X, donde la recompresión degrada las señales forenses habituales.
- Puerta de moderación en pasarelas GPU: puede integrarse como primer filtro en un servicio de moderación que derive solo las imágenes dudosas a modelos más grandes, reduciendo coste gracias a sus 111,6 MB de ONNX FP32.
- Microservicio en CPU para entornos edge: con `onnxruntime` y sin GPU, puede desplegarse en contenedores ligeros o dispositivos con recursos limitados para clasificar imágenes en tiempo casi real.
- Auditoría de conjuntos de datos: un equipo de investigación puede etiquetar automáticamente corpus de imágenes para detectar contaminación con contenido sintético antes de usarlos en entrenamiento.
- Sustitución directa en pipelines existentes: al mantener el esquema `{0: "artificial", 1: "human"}`, reemplaza a `umm-maybe/AI-image-detector` u `Organika/sdxl-detector` cambiando solo el identificador del modelo en el código.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. EER = Equal Error Rate (menor es mejor); AUC (mayor es mejor).

| Conjunto / métrica | `guard-small` (este modelo) | `guard-tiny` (DINOv2-S, 22,1 M) | `guard-base` (SigLIP2-B, 93,2 M) |
|---|---|---|---|
| EER en Social-Media Recompressed | 30,59% | 37,71% | 20,12% |
| EER en Synthbuster | 9,45% | 19,05% | 10,00% |
| EER / AUC en 3-Corpus Unique Zero-Touch | 26,65% / 0,7908 | 28,52% / 0,7862 | 20,73% / 0,8573 |
| EER / AUC media en 5 suites públicas | 26,90% / 0,8015 | 30,53% / 0,7652 | 19,98% / 0,8709 |
| Latencia CPU FP32 ONNX (4 hilos) | 136,8 ms | 82,3 ms | 312,7 ms |
| Tamaño ONNX | 111,6 MB | 88,5 MB | 344,6 MB |

Comparaciones adicionales citadas por el autor:

| Modelo comparado | EER en Synthbuster | EER en 5 suites públicas |
|---|---|---|
| `guard-small` | 9,45% | 26,90% |
| `haywoodsloan` (7× más grande) | 19,95% | no disponible |
| `Ateeqq` (3,3× más grande) | 28,00% | 27,50% |
| `umm-maybe/AI-image-detector` | no disponible | 38,70% |
| `Organika/sdxl-detector` | no disponible | 34,46% |

En el punto de operación por defecto (argmax 0,50), el autor reporta 31,5% de recall de imágenes falsas y 6,7% de FPR sobre fotos reales en OpenFake Core limpio, 47,2% de recall y 0,0% de FPR en Synthbuster, y 54,5% de recall y 18,4% de FPR bajo recompresión social agresiva. En Social-Media Recompressed supera a `CommunityForensics-ViT` en 10,53 puntos de EER (30,59% frente a 41,12%; AUC 0,780 frente a 0,635).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32; el modelo completo ocupa 111,6 MB en ONNX FP32 y el repositorio pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; funciona en A100, H100, RTX 4090 y GPUs de gama de entrada.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer actual (RTX 3060, RTX 4060, etc.) e incluso en iGPU.
- Despliegue: `transformers>=4.40` con `pipeline("image-classification")`, PyTorch con `AutoModelForImageClassification`, y ONNX Runtime (`onnxruntime`) para CPU de servidor o edge. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de imagen).
- Latencia: 136,8 ms por imagen en CPU de 4 hilos con ONNX FP32; el autor no publica throughput en GPU.
- Almacenamiento: 111,6 MB para el ONNX FP32 y 0,2 GB para el repositorio completo.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Resolución | EER 5 suites | EER Synthbuster | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `Tamarillo/ai-image-forensics-guard-small` | ConvNeXtV2-Tiny | 27,9 M | 384×384 | 26,90% | 9,45% | Apache-2.0 | Hugging Face, ONNX |
| `Tamarillo/ai-image-forensics-guard-tiny` | DINOv2-S | 22,1 M | 224×224 | 30,53% | 19,05% | no disponible | Hugging Face |
| `Tamarillo/ai-image-forensics-guard-base` | SigLIP2-B | 93,2 M | 384×384 | 19,98% | 10,00% | no disponible | Hugging Face |
| `umm-maybe/AI-image-detector` | no disponible | no disponible | 224×224 | 38,70% | no disponible | no disponible | Hugging Face |
| `Organika/sdxl-detector` | no disponible | no disponible | 224×224 | 34,46% | no disponible | no disponible | Hugging Face |

El modelo se sitúa en un punto intermedio de la familia: mejor precisión que `guard-tiny` con mayor latencia, y peor precisión que `guard-base` a cambio de ser 3,1 veces más rápido en CPU y 3,1 veces más pequeño en ONNX.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni la composición demográfica de los conjuntos de entrenamiento; el rendimiento puede variar según el dominio de imagen (fotografía artística, capturas de pantalla, imágenes médicas, etc.).
- Riesgo de alucinación no aplica en sentido estricto, pero sí de falsos positivos y falsos negativos: el FPR sobre fotos reales es del 6,7% en OpenFake Core y sube al 18,4% bajo recompresión social agresiva, mientras que el recall de imágenes falsas cae al 31,5% en condiciones limpias.
- Las probabilidades de `pipeline()` no están calibradas; para umbrales de decisión ajustados debe aplicarse el escalado de temperatura del `calibration.json` (`T = 1.4343`).
- El rendimiento cae de forma notable bajo recompresión fuerte (EER 30,59% en Social-Media Recompressed frente a 9,45% en Synthbuster); no debe asumirse robustez equivalente en todos los canales de distribución.
- No procesa texto, audio ni vídeo; es exclusivamente un clasificador de imagen binario.
- No se especifican los idiomas ni la cobertura geográfica de los datos; la model card está en inglés.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación independiente.
- El repositorio se creó el 26 de noviembre de 2026; los resultados de benchmarks proceden únicamente del autor y no han sido replicados de forma externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/ai-image-forensics-guard-small
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-22k-384
- Demo (Hugging Face Space): https://huggingface.co/spaces/Tamarillo/ai-image-forensics-guard-demo
- Modelo comparable `umm-maybe/AI-image-detector`: https://huggingface.co/umm-maybe/AI-image-detector
- Modelo comparable `Organika/sdxl-detector`: https://huggingface.co/Organika/sdxl-detector
- Dataset `srishti-kaushik/COCO-2017`: https://huggingface.co/datasets/srishti-kaushik/COCO-2017
- Dataset `finedet/openimages`: https://huggingface.co/datasets/finedet/openimages
- Dataset `OwensLab/CommunityForensics`: https://huggingface.co/datasets/OwensLab/CommunityForensics
