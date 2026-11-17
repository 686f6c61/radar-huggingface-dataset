# syaikhipin/defectforge-foreign-body-yolo

## Resumen

DefectForge foreign-body detector es un modelo de detección de objetos basado en YOLO11s (Ultralytics), afinado por el usuario syaikhipin para localizar cuerpos extraños en imágenes industriales. El modelo se entrena exclusivamente con datos sintéticos generados y etiquetados por un pipeline automatizado denominado DefectForge: imágenes SDXL, etiquetado con YOLOE, verificación geométrica y por un crítico Qwen-VLM, y finalmente un fine-tune de YOLO11s durante 60 épocas a 640 píxeles. No se emplearon etiquetas humanas en el conjunto de entrenamiento.

La relevancia del proyecto reside en su enfoque de "zero human labels": demuestra un flujo completo de generación y verificación automática de datos para inspección visual industrial, una tarea donde la anotación manual es costosa y escasa. El repositorio es pequeño (0,1 GB) y se distribuye en formato ONNX, lo que facilita su despliegue en entornos de inferencia ligeros.

No obstante, las métricas publicadas proceden únicamente de conjuntos sintéticos y el propio autor advierte que no constituyen una estimación de rendimiento en el mundo real. El modelo debe validarse sobre imágenes reales de línea de producción antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no disponible (no aplica a la tarea de detección) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo parte de `ultralytics/yolo11s`, un detector de objetos de una etapa de la familia YOLO11 en su variante small. Sobre esa base se realiza un fine-tune de 60 épocas con imágenes de 640 píxeles. El pipeline de datos, denominado DefectForge, genera imágenes sintéticas con SDXL, las etiqueta con YOLOE y aplica una doble verificación: geométrica y mediante un crítico basado en Qwen-VLM. El conjunto de entrenamiento resultante no contiene ninguna etiqueta humana.

La infraestructura de generación se ejecutó en molab sobre una NVIDIA RTX PRO 6000, con el "cerebro" del swarm servido por un endpoint autoalojado de Qwen3.8-27B. El proyecto se describe como un port/integración de aionVIS (MIT) de 0xAthkot. No se especifican en la información disponible el número de imágenes de entrenamiento, la composición exacta del dataset ni detalles sobre aumentos de datos o hiperparámetros más allá de las épocas y el tamaño de imagen.

## Capacidades

- Detección de objetos de una etapa: localiza y clasifica cuerpos extraños en imágenes, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Especialización en inspección industrial: el modelo está afinado para la categoría de "foreign body" (cuerpo extraño), no para detección genérica de objetos.
- Inferencia en formato ONNX: compatible con runtimes de ONNX (ONNX Runtime, TensorRT vía ONNX, etc.).
- Entrada de imagen a 640 píxeles durante el entrenamiento.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan capacidades especiales adicionales (visión más allá de detección, audio, thinking mode, etc.).

## Casos de uso

- Inspección de línea de producción: integrado en una cámara industrial, el modelo puede señalar la presencia de cuerpos extraños sobre la banda transportadora y activar una alarma o un brazo de rechazo. Es adecuado por su baja latencia típica de YOLO11s, aunque requiere validación previa con imágenes reales de la línea.
- Control de calidad en alimentación: detección de fragmentos o partículas ajenas en productos antes del envasado, usando el modelo como primer filtro visual y derivando los casos dudosos a revisión humana.
- Prefiltro en pipelines de anotación: al ser un detector especializado, puede usarse para proponer cajas candidatas que un anotador humano revise, reduciendo el coste de etiquetado en nuevas plantas.
- Prototipado rápido de sistemas de inspección: gracias a su tamaño reducido (repo de 0,1 GB) y formato ONNX, permite montar un demostrador en hardware de borde (edge) en pocas horas.
- Investigación en generación de datos sintéticos: sirve como caso de estudio reproducible para evaluar pipelines de etiquetado automático (SDXL + YOLOE + crítico VLM) en tareas de visión industrial.
- Despliegue en dispositivos con recursos limitados: el formato ONNX y el tamaño de la variante small permiten ejecutarlo en GPUs de consumo o aceleradores de borde, siempre que se acepte la licencia AGPL-3.0.
- Monitorización de procesos con cámaras fijas: detección continua de objetos extraños en zonas restringidas o entornos controlados, con umbral de confianza ajustable según la tolerancia a falsos positivos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Conjunto de evaluación | mAP50 | mAP50-95 | Precision | Recall |
|---|---|---|---|---|
| Validación sintética reservada (7 imágenes) | 0,7188 | 0,5907 | 0,7497 | 0,5716 |
| Test compuesto/sembrado (24 imágenes, 31 instancias) | 0,3731 | 0,2855 | 0,4246 | 0,4510 |

Advertencias del autor: el split de validación es sintético y proviene del mismo generador que el entrenamiento. El test compuesto inserta recortes de defectos sobre fondos sintéticos nuevos, lo que sirve como aproximación a la generalización en escenas nuevas, pero no es datos de campo ni una estimación de rendimiento real. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la variante YOLO11s, es esperable un consumo bajo, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. El entrenamiento se realizó en una NVIDIA RTX PRO 6000, pero no se especifican requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el formato ONNX y el tamaño reducido sugieren que podría ejecutarse en GPUs de consumo, pero debe verificarse.
- Opciones de despliegue: ONNX Runtime y cualquier runtime compatible con ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DefectForge foreign-body (este modelo) | YOLO11s fine-tune | no disponible | no aplica | mAP50 0,37 en test sintético | AGPL-3.0 | Hugging Face (ONNX) |
| ultralytics/yolo11s (base) | YOLO11s | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 | Hugging Face / Ultralytics |
| Modelos de detección genérica comparables | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento exclusivamente sintético: no hay etiquetas humanas ni datos reales de línea; el rendimiento en imágenes reales es desconocido.
- Métricas no representativas: el propio autor indica que los resultados de validación y test sintéticos no son una estimación de rendimiento en el mundo real.
- Caída acusada entre validación y test: mAP50 pasa de 0,72 a 0,37 al cambiar a escenas compuestas, lo que sugiere problemas de generalización.
- Conjunto de validación muy pequeño (7 imágenes): alta varianza estadística en las métricas reportadas.
- Riesgo de sesgo hacia el generador sintético: el modelo puede aprender artefactos de SDXL en lugar de características reales de los cuerpos extraños.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que lo integre y se distribuya; revisar compatibilidad para uso comercial.
- Licencias de terceros: Ultralytics YOLO es AGPL-3.0; SDXL y YOLOE tienen sus propias licencias que deben respetarse.
- Sin información sobre idiomas ni capacidades lingüísticas (no aplica, pero limita su uso a visión).
- Sin datos de latencia, throughput ni requisitos de hardware de inferencia: difícil planificar un despliegue en producción sin pruebas propias.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syaikhipin/defectforge-foreign-body-yolo
- Dataset DefectForge: https://huggingface.co/datasets/syaikhipin/defectforge-foreign-body
- Repositorio aionVIS (MIT): https://github.com/0xAthkot/aionvis
- Ultralytics YOLO: https://github.com/ultralytics/ultralytics
