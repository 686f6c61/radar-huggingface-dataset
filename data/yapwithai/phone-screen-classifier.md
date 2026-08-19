# yapwithai/phone-screen-classifier

## Resumen

Yap Phone Screenshot Classifier es un modelo de clasificación de imágenes diseñado específicamente para analizar capturas de pantalla de teléfonos móviles. Desarrollado por el usuario yapwithai, el modelo resuelve dos tareas simultáneamente: identificar el tipo de pantalla (por ejemplo, si es una pantalla de ajustes, una conversación, etc.) y clasificar el nivel de seguridad del contenido (si es seguro, sensible, etc.). Esto permite enrutar y filtrar flujos de trabajo de capturas antes de ejecutar análisis más costosos.

El modelo se basa en MobileNetV4 Conv Medium, una arquitectura eficiente de la familia MobileNetV4, y está fine-tuneado sobre el dataset yapwithai/phone-screenshots. Con solo 8,5 millones de parámetros, es un modelo ligero pensado para inferencia en CPU o dispositivos con recursos limitados. Se distribuye en formato ONNX (FP32 y FP16) y safetensors, con soporte para inferencia dinámica en lote, altura y anchura.

La relevancia actual radica en su doble salida (tipo de pantalla y seguridad) que permite a las aplicaciones tomar decisiones rápidas de enrutamiento y moderación sin necesidad de ejecutar modelos grandes o multimodales. Su diseño compacto y su compatibilidad con ONNX Runtime lo hacen adecuado para despliegues en servidores o edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 Conv Medium (timm) |
| Parametros totales | 8.537.003 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | FP32, FP16 (ONNX) |
| Idiomas soportados | no disponible (procesa imagenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX (con datos externos) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de MobileNetV4 Conv Medium, una arquitectura convolutional eficiente de la familia MobileNetV4. La cabeza de clasificación se ha modificado para producir dos salidas independientes: `screen` (categoría de pantalla) y `safety` (categoría de seguridad del contenido). Cada salida es un vector de logits sobre su respectivo conjunto de etiquetas, y la inferencia utiliza `argmax` para ambas cabezas.

El entrenamiento se realizó sobre el dataset yapwithai/phone-screenshots. No se proporcionan detalles sobre el número de imágenes, el proceso de entrenamiento (épocas, optimizador, etc.) ni si se utilizaron técnicas como RLHF o DPO, ya que no aplican a un modelo de clasificación de imágenes. El repositorio incluye un archivo `train.json` con la receta de entrenamiento "sanitizada", pero su contenido no se detalla en la información disponible.

El preprocesamiento es específico: se redimensiona la imagen para que el lado más largo sea 1024 píxeles, manteniendo la relación de aspecto, sin recortes ni relleno. Luego se normaliza con media y desviación estándar definidas en `preprocess.json` y se rellena hasta múltiplos de 32 para el lote.

## Capacidades

- Clasificación de capturas de pantalla de teléfono en dos dimensiones simultáneas: tipo de pantalla y categoría de seguridad.
- Distinción entre UI genérica (`generic`) y contenido fuera de la distribución de capturas (`other`).
- Inferencia dinámica: acepta lotes de tamaño variable, altura y anchura variables.
- Exportación a ONNX para despliegue en CPU y servidores, con variantes FP32 y FP16.
- Asistentes de inferencia en Python y TypeScript incluidos en el repositorio.
- Compatible con ONNX Runtime, lo que permite integración en pipelines existentes.

## Casos de uso

- Enrutamiento de capturas en aplicaciones de soporte: el modelo clasifica cada captura en una categoría de pantalla (por ejemplo, ajustes, chat, galería) y la envía al flujo de trabajo adecuado, reduciendo la carga de análisis manual.
- Moderación de contenido: la salida `safety` permite filtrar capturas con contenido potencialmente inapropiado antes de que lleguen a moderadores humanos o a otros sistemas de análisis.
- Prefiltrado en pipelines de análisis de UI: antes de ejecutar un modelo de visión más pesado (como un VLM), este clasificador descarta imágenes irrelevantes o identifica el tipo de pantalla para seleccionar el prompt o el procesamiento adecuado.
- Automatización de QA móvil: en pruebas de regresión visual, el modelo puede verificar que una captura corresponde a la pantalla esperada, comparando la clase `screen` con la referencia.
- Archivado y búsqueda de capturas: clasificar un repositorio de capturas por tipo de pantalla y nivel de seguridad facilita la organización y la recuperación posterior.
- Filtrado de contenido en aplicaciones de compartición de pantalla: antes de compartir una captura, el modelo puede advertir si contiene información sensible según la categoría `safety`.

## Benchmarks y rendimiento

El autor proporciona resultados de test en tres conjuntos: test completo, test balanceado por clase de pantalla y test balanceado por clase de seguridad. Las métricas incluyen accuracy, accuracy balanceada, macro F1 y top-2. No se comparan con otros modelos.

| Modelo | Test | Salida | Accuracy | Balanced Acc | Macro F1 | Top-2 | Imagenes |
| :-- | :-- | :-- | --: | --: | --: | --: | --: |
| fp32 | full test | screen | 0.9154 | 0.8385 | 0.7265 | 0.9719 | 23615 |
| fp32 | full test | safety | 0.9575 | 0.8941 | 0.8600 | 0.9921 | 23615 |
| fp32 | screen-balanced | screen | 0.8377 | 0.8421 | 0.8133 | 0.9400 | 6246 |
| fp32 | screen-balanced | safety | 0.9776 | 0.9285 | 0.9110 | 0.9978 | 6246 |
| fp32 | safety-balanced | screen | 0.9580 | 0.7752 | 0.6547 | 0.9870 | 3000 |
| fp32 | safety-balanced | safety | 0.8957 | 0.8957 | 0.8947 | 0.9847 | 3000 |
| fp16 | full test | screen | 0.9153 | 0.8384 | 0.7264 | 0.9719 | 23615 |
| fp16 | full test | safety | 0.9575 | 0.8941 | 0.8600 | 0.9921 | 23615 |
| fp16 | screen-balanced | screen | 0.8373 | 0.8419 | 0.8130 | 0.9400 | 6246 |
| fp16 | screen-balanced | safety | 0.9776 | 0.9285 | 0.9110 | 0.9978 | 6246 |
| fp16 | safety-balanced | screen | 0.9580 | 0.7752 | 0.6547 | 0.9870 | 3000 |
| fp16 | safety-balanced | safety | 0.8957 | 0.8957 | 0.8947 | 0.9847 | 3000 |

El rendimiento en CPU (Apple M4 Max, 16 núcleos) es de aproximadamente 20 imágenes por segundo con latencia media total de unos 50 ms por imagen (incluyendo carga y preprocesado). La versión FP16 es ligeramente más rápida que la FP32.

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para CPU; en un Apple M4 Max alcanza ~20 imágenes/s con FP32 y ~20,8 con FP16.
- VRAM: no se especifica, pero al ser un modelo de 8,5 M de parámetros, la huella de memoria es pequeña (menos de 100 MB en FP32). Cabe en cualquier GPU comercial, incluso integradas.
- GPU recomendadas: no se requiere GPU para inferencia; si se usa, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), también se puede convertir a otros formatos (TensorRT, OpenVINO) a partir del ONNX.
- Latencia: en CPU, ~50 ms por imagen (media total), con P95 de ~86 ms en FP32 y ~64 ms en FP16.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. Al tratarse de un clasificador de imágenes específico para capturas de pantalla, su comparación natural sería con otros clasificadores de imágenes genéricos (como MobileNetV3, EfficientNet-Lite) fine-tuneados para la misma tarea, pero no hay datos públicos de esos modelos en este dominio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que puede limitar su uso comercial sin autorización explícita del autor.
- El dataset de entrenamiento (yapwithai/phone-screenshots) no está descrito en detalle; podría contener sesgos en cuanto a tipos de pantalla o categorías de seguridad.
- El modelo solo produce dos salidas fijas (`screen` y `safety`); no es un clasificador abierto y no admite etiquetas personalizadas sin reentrenamiento.
- La clasificación `safety` no es un sistema de moderación exhaustivo; puede fallar en casos límite o en contenido novedoso no representado en el entrenamiento.
- El preprocesamiento es estricto (redimensionado a 1024 píxeles en el lado mayor, sin recortes); desviarse de este contrato puede degradar el rendimiento.
- No se proporcionan métricas de calibración ni umbrales de confianza; la inferencia usa `argmax` sin umbral de rechazo, lo que puede producir clasificaciones erróneas con baja confianza.
- El modelo está pensado para capturas de pantalla de teléfono; su rendimiento en otros tipos de imágenes no está garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yapwithai/phone-screen-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/yapwithai/phone-screenshots
- Modelo base: https://huggingface.co/timm/mobilenetv4_conv_medium.e250_r384_in12k
