# TAKKXXI/smart-fridge-yolo11n

## Resumen

El modelo `TAKKXXI/smart-fridge-yolo11n` es un detector de objetos basado en la arquitectura YOLO11n, entrenado específicamente para escenarios de nevera inteligente. Lo desarrolla el usuario TAKKXXI y su finalidad es servir como componente de pre-detección en dispositivos de borde, identificando alimentos, localizando su posición y generando eventos de cambio de inventario.

La etapa de confirmación semántica y análisis de visibilidad no la cubre este modelo; se delega en un sistema posterior de VLM y reglas. El modelo se ha entrenado sobre el dataset público `fridge food images v14` de Roboflow, con 5.139 imágenes y 30 categorías de alimentos.

Al ser YOLO11n, está pensado para despliegue en `edge` con recursos limitados, incluyendo inferencia por CPU mediante ONNX Runtime en plataformas como RK3399. La licencia del modelo es AGPL-3.0, con implicaciones comerciales que deben revisarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (red neuronal convolucional de detección de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (se incluye exportación a ONNX sin cuantización especificada) |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch/Ultralytics), `model.onnx` (ONNX) |

| Parametro adicional | Valor |
|---|---|
| Framework de entrenamiento | Ultralytics 8.4.84 / PyTorch 2.12.1 |
| Tamaño de imagen de entrenamiento | 640 x 640 |
| Batch size | 8 |
| Epochs | 80 |
| Pipeline | object-detection |
| Dataset de entrenamiento | Roboflow Universe: `fridge food images v14` |
| Número de imágenes del dataset | 5.139 |
| Número de clases | 30 (listadas en `classes.txt`) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura YOLO11n, una red neuronal convolucional optimizada para detección de objetos en tiempo real. Se parte de un checkpoint preentrenado de YOLO11n y se entrena durante 80 épocas con imágenes de 640x640 píxeles y un batch size de 8. El entrenamiento se ejecutó en Apple MPS con `seed=0` y modo determinista activado.

El dataset de entrenamiento es `fridge food images v14`, exportado desde Roboflow Universe, con 5.139 imágenes y una licencia atribuida de CC BY 4.0. Las 30 clases incluyen categorías de alimentos. Los nombres de clase del dataset conservan la ortografía original de la fuente, lo que implica errores tipográficos como `blue berry` o `stawberry`, que deben corregirse solo a nivel de presentación sin modificar los índices de salida.

No se mencionan procesos de RLHF/DPO, ya que es un modelo de visión y no un modelo de lenguaje. No se han incorporado técnicas como decodificación especulativa ni atención lineal.

## Capacidades

- Detección de objetos en imagen: localiza hasta 30 categorías de alimentos dentro del dominio de nevera inteligente.
- Inferencia en dispositivos de borde: incluye un export ONNX destinado a ejecutarse con ONNX Runtime en CPU.
- Generación de eventos de inventario: puede actuar como disparador para detectar cambios en el contenido de la nevera.
- Marcado de candidatos duplicados: sirve para señalar alimentos que aparecen repetidos en la escena.
- Compatibilidad con pipeline de análisis posterior: la salida del detector se pasa a un VLM o sistema de reglas para confirmación semántica y evaluación de visibilidad.
- Sin soporte de tool calling, razonamiento de texto, capacidades multilingües ni modo de pensamiento, al ser únicamente un modelo de visión.

## Casos de uso

- Nevera inteligente doméstica: el modelo se ejecuta en un dispositivo de borde, como un RK3399, para detectar y localizar alimentos al abrir la puerta de la nevera y actualizar el inventario automáticamente.
- Alertas de caducidad y reposición: un sistema de reglas usa las detecciones para avisar al usuario cuando un producto escasea o se ha agotado.
- Análisis de hábitos de consumo: los eventos de detección a lo largo del tiempo permiten generar estadísticas sobre qué alimentos se consumen con más frecuencia.
- Integración con VLM para confirmación de identidad: el detector propone candidatos de objetos; un modelo multimodal posterior valida la clase y su estado visual (por ejemplo, si un paquete está abierto).
- Control de inventario en entornos de hospitalidad: en cámaras frigoríficas comerciales, se utiliza para el recuento aproximado de productos y detección de anomalías.
- Detección de duplicados en el registro de productos: cuando un mismo alimento aparece en varias posiciones, el modelo lo marca como candidato duplicado para su tratamiento posterior.

## Benchmarks y rendimiento

Los resultados de validación disponibles, obtenidos del split de validación del dataset exportado, son los siguientes. No se han publicado comparaciones con otros modelos similares.

| Checkpoint | Epoch | Precision | Recall | mAP50 | mAP50-95 |
|---|---:|---:|---:|---:|---:|
| Best | 66 | 0.81796 | 0.74272 | 0.81128 | 0.58557 |
| Final | 80 | 0.81968 | 0.73055 | 0.80675 | 0.58047 |

No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una versión `nano` y ejecutarse por CPU, se asume que tiene requisitos mínimos, pero no se han proporcionado cifras concretas.
- GPU recomendada: no se indica en la información disponible. El despliegue previsto es en CPU con ONNX Runtime.
- Soporte en GPU de consumo: no especificado.
- Plataforma de despliegue: el README menciona explícitamente el runtime de borde `RK3399` y la inferencia por CPU con ONNX Runtime.
- Opciones de despliegue: `ultralytics` para `best.pt`, y ONNX Runtime para `model.onnx`. No se mencionan vLLM, llama.cpp ni Ollama, ya que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de objetos ni alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo solo reconoce las 30 clases incluidas en `classes.txt`; no generaliza a alimentos, envases, iluminación, oclusiones o ángulos de cámara no vistos en el entrenamiento.
- Una detección no implica identidad, frescura, comestibilidad, caducidad ni seguridad alimentaria.
- El entrenamiento se realizó principalmente sobre un dataset público de imágenes; se necesita evaluación o adaptación para cada frigorífico físico concreto.
- Los nombres de clase contienen erratas de la fuente original (`blue berry`, `stawberry`); las aplicaciones deberían mapearlos a nombres corregidos sin alterar los índices de salida.
- Debe utilizarse como componente de pre-detección, con revisión humana o análisis multimodal posterior para decisiones de mayor relevancia.
- La licencia AGPL-3.0 puede limitar el despliegue comercial o propietario; Ultralytics indica que es posible que se requiera una licencia Enterprise. El dataset, por su parte, se atribuye como CC BY 4.0, y es responsabilidad del usuario cumplir con ambos términos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TAKKXXI/smart-fridge-yolo11n
- Dataset de entrenamiento en Roboflow: https://universe.roboflow.com/fridge-dataset/fridge-food-images/dataset/14
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Repositorio espejo en Hugging Face (BeimingJingli/smart-fridge-yolo11n): https://huggingface.co/BeimingJingli/smart-fridge-yolo11n
