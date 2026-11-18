# Yurup/open-body-tracker

## Resumen

open-body-tracker (variante obt-h3c) es un modelo de estimación de pose humana tridimensional a partir de una única cámara RGB. Lo desarrolla Yurup (yuru-lab) y se publica en Hugging Face bajo el identificador Yurup/open-body-tracker. El modelo resuelve el problema de recuperar la posición de 23 keypoints corporales (los 17 del estándar COCO para el cuerpo más 6 puntos adicionales de los pies) tanto en 2D como en 3D métrico relativo a la raíz, partiendo de un recorte de persona de 256×192 píxeles.

La relevancia actual del modelo reside en su empaquetado orientado al navegador: se distribuye en formato ONNX (fp32 y fp16) y está pensado para ejecutarse con WebGPU, lo que permite inferencia de pose 3D en el cliente sin backend dedicado. El repositorio incluye además réplicas sin modificar de los detectores de personas YOLOX nano y tiny de Megvii, necesarias para el pipeline completo de detección y seguimiento.

El modelo se apoya parcialmente en salidas de SAM 3D Body (Meta) durante el entrenamiento, lo que condiciona su licencia (SAM License, con restricciones de uso). El repositorio ocupa 1,0 GB e incluye pesos PyTorch en safetensors y los artefactos ONNX. No se han publicado datos sobre idiomas porque la tarea no es lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de estimación de keypoints (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 256×192) |
| Tipos de cuantizacion | fp32 y fp16 en ONNX; pesos PyTorch en safetensors |
| Idiomas soportados | no disponible (tarea no lingüística) |
| Licencia | SAM License (license_name: sam-license) |
| Formato de pesos | safetensors (PyTorch), ONNX fp32 (382 MB), ONNX fp16 (191 MB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (tipo de backbone, número de capas o mecanismos de atención). Lo que sí se especifica es el contrato de entrada y salida del modelo ONNX: entrada `crop` de tipo float32 con forma (N, 3, 256, 192) en RGB con rango 0–255, y tres salidas: `xy` (N, 23, 2) en píxeles del recorte, `score` (N, 23) con la confianza por keypoint y `xyz` (N, 23, 3) en metros relativos a la raíz. El modelo produce por tanto 23 keypoints: los 17 del cuerpo COCO más 6 puntos de los pies.

El entrenamiento empleó imágenes de COCO 2014 y Open Images V7 (solo las imágenes con licencia CC BY 2.0), y el modelo se entrenó en parte sobre salidas de SAM 3D Body de Meta, motivo por el que los pesos heredan la SAM License. Los pesos publicados corresponden a una media móvil exponencial (EMA). No se especifica en la información proporcionada el número de tokens ni el volumen exacto del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de regresión de keypoints). Como innovación destacable, el empaquetado incluye una variante fp16 de 191 MB pensada para el demo WebGPU, lo que facilita el despliegue en navegador.

## Capacidades

- Estimación de pose 2D de 23 keypoints (17 COCO + 6 de pies) a partir de un recorte de persona de 256×192.
- Estimación de pose 3D métrica relativa a la raíz en metros (salida `xyz`).
- Puntuación de confianza por keypoint (salida `score`).
- Inferencia en navegador mediante ONNX Runtime y WebGPU con la variante fp16.
- Integración con detección de personas mediante los detectores YOLOX nano y tiny incluidos en el repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente perceptivo de regresión de keypoints.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Análisis deportivo en navegador: el modelo permite capturar vídeo con la webcam, recortar a la persona y estimar la pose 3D en tiempo real en el cliente, sin enviar imágenes a un servidor, lo que resulta adecuado para aplicaciones de feedback de forma física.
- Rehabilitación y fisioterapia remota: la salida de 23 keypoints con coordenadas 3D métricas permite medir ángulos articulares y rangos de movimiento, y la confianza por keypoint ayuda a descartar detecciones poco fiables.
- Animación y captura de movimiento de bajo coste: al producir `xyz` en metros relativos a la raíz, la salida puede retargetizarse a un esqueleto para animación de avatares sin necesidad de trajes de captura.
- Control por gestos y postura en aplicaciones web: la variante fp16 de 191 MB y el demo WebGPU permiten integrar el modelo en páginas web para interacción sin instalación.
- Análisis ergonómico en puestos de trabajo: con una única cámara RGB se pueden monitorizar posturas (por ejemplo, elevación de hombros o flexión de rodillas) y generar alertas, usando los 6 puntos de pies para estimar el apoyo.
- Pipelines de vídeo offline: combinando YOLOX nano/tiny con obt-h3c en ONNX Runtime se puede procesar vídeo por lotes para extraer esqueletos y alimentar análisis posteriores (biomecánica, conteo de repeticiones, detección de caídas).

## Benchmarks y rendimiento

| Benchmark | Métrica | obt-h3c |
|---|---|---|
| COCO val2017 (2D, cajas GT, imágenes con solapamiento de entrenamiento eliminadas) | keypoint AP | 71,7 |
| ASPset-510, 3 sujetos retenidos | PA-MPJPE (cuerpo 12) | 67,9 mm |
| ASPset-510, 3 sujetos retenidos | MPJPE | 92,7 mm |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de la misma categoría ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: la variante fp32 (382 MB) requiere aproximadamente 0,4–1 GB de memoria para pesos y activaciones de un lote pequeño; la variante fp16 (191 MB) reduce el requisito a la mitad.
- GPU recomendadas: cualquier GPU con soporte de WebGPU para la variante de navegador; en servidor, GPU consumer como RTX 3060 o superiores son suficientes dado el reducido tamaño del modelo. No se dispone de datos específicos para A100 o H100.
- Cabe en GPU consumer: sí, con amplio margen, incluso en GPUs de gama de entrada y en iGPU con WebGPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU), navegador mediante el demo oficial; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Keypoints | Salida 3D | Formato | Licencia |
|---|---|---|---|---|---|
| open-body-tracker (obt-h3c) | Pose 2D/3D desde recorte | 23 (17 COCO + 6 pies) | Sí, métrica relativa a raíz | ONNX, safetensors | SAM License |
| YOLOX nano / tiny (incluidos) | Detección de personas/objetos | no aplica | No | ONNX | Apache-2.0 |
| SAM 3D Body (Meta) | Pose 3D | no disponible | Sí | no disponible | SAM License |

No se dispone en la información proporcionada de comparativas con otros estimadores de pose 3D de una sola cámara (por ejemplo, variantes de SMPL), por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- La licencia SAM License impone restricciones de uso derivadas del entrenamiento parcial sobre salidas de SAM 3D Body; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- El modelo trabaja sobre recortes de persona de 256×192, por lo que la precisión depende de la calidad del detector previo (YOLOX nano/tiny incluidos); fallos de detección degradan directamente la pose.
- La salida 3D es relativa a la raíz y en metros, pero no se detalla en la información disponible la incertidumbre ni el sesgo por tipo de cuerpo, ropa o condiciones de iluminación.
- Riesgo de alucinación en el sentido de keypoints plausibles pero incorrectos en oclusiones; la salida `score` debe usarse para filtrar.
- Los benchmarks 2D se han medido con cajas ground truth y eliminando imágenes con solapamiento de entrenamiento, lo que puede sobreestimar el rendimiento en condiciones reales.
- No se especifican sesgos demográficos ni cobertura de distintos tonos de piel, complexiones o edades; la evaluación en ASPset-510 se limita a 3 sujetos retenidos.
- El repositorio no incluye las imágenes de entrenamiento (COCO 2014 y Open Images V7, solo CC BY 2.0), lo que limita la reproducibilidad completa.
- No apto para aplicaciones de texto, agentes o tool calling; su uso está acotado a percepción visual de pose.

## Enlaces

- Hugging Face: https://huggingface.co/Yurup/open-body-tracker
- Repositorio GitHub (código, demos y documentación): https://github.com/yuru-lab/open-body-tracker
- Demo en navegador: https://yuru-lab.github.io/open-body-tracker/
- Model card detallada: https://github.com/yuru-lab/open-body-tracker/blob/main/MODEL_CARD.md
- Licencia: https://huggingface.co/Yurup/open-body-tracker/blob/main/LICENSE
- Licencia YOLOX: https://huggingface.co/Yurup/open-body-tracker/blob/main/YOLOX-LICENSE.txt
