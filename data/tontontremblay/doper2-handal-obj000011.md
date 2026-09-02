# TontonTremblay/doper2-handal-obj000011

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000011` es un estimador de pose 6D (posición y orientación) para un objeto concreto de la colección HANDal, identificado como `obj_000011`. Ha sido desarrollado por el usuario TontonTremblay (jonathan) utilizando el pipeline DOPER2, un sistema de entrenamiento para estimación de pose de objetos. El modelo emplea un backbone `convnext_tiny` preentrenado con DINOv3 y una cabeza de keypoints basada en mapas de calor (heatmap), capaz de predecir 64 puntos clave 3D del objeto. El repositorio ocupa 0,3 GB e incluye el checkpoint del modelo, la configuración de entrenamiento y los keypoints 3D en metros.

Este modelo está pensado para aplicaciones de robótica, automatización industrial o realidad aumentada donde se necesita localizar con precisión un objeto específico en el espacio 3D a partir de una imagen RGB. Su relevancia radica en que ofrece una solución especializada y ligera para un objeto concreto, con un pipeline de entrenamiento reproducible y resultados de validación en el benchmark BOP. No se trata de un modelo de lenguaje ni de propósito general, sino de un componente de visión por computador altamente especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints tipo heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch), junto con `keypoints_3d.json`, `config.yaml` y `training_provenance.json` |

## Arquitectura y entrenamiento

El modelo se basa en un backbone ConvNeXt-Tiny preentrenado con DINOv3 (variante `lvd1689m`), que extrae características de la imagen de entrada. Sobre este backbone se coloca una cabeza de predicción de keypoints que genera mapas de calor (heatmap) para 64 puntos clave 3D del objeto. La entrada al detector es de 224 píxeles, mientras que el recorte para la predicción de keypoints se redimensiona a 256 píxeles.

El entrenamiento se realizó con el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con DR synth, imágenes de BOP PBR (renderizado físico) y pseudo-etiquetas obtenidas durante el proceso de onboarding. No se especifican el número total de tokens (no aplica), el tamaño del dataset ni si se usaron técnicas de RLHF o DPO, ya que es un modelo de visión supervisado. La configuración completa y los argumentos de entrenamiento se encuentran en `config.yaml` y `training_provenance.json`.

## Capacidades

- Estimación de pose 6D (rotación y traslación) de un objeto específico (HANDal `obj_000011`) a partir de una imagen RGB.
- Predicción de 64 keypoints 3D en metros, que permiten resolver la pose mediante `solvePnP` con la cámara calibrada.
- Detección del objeto en la imagen con un umbral de confianza configurable (`score_thr`).
- Salida de múltiples detecciones por imagen, seleccionando la de mayor score.
- Integración sencilla con OpenCV y PyTorch mediante el módulo `doper2.infer`.
- No incluye capacidades de lenguaje, generación de texto, código, visión general ni tool calling.

## Casos de uso

- Manipulación robótica: el modelo permite a un brazo robótico localizar con precisión el objeto `obj_000011` en el espacio 3D, calculando la pose necesaria para un agarre correcto. Se usaría en tiempo real con una cámara RGB montada en el robot.
- Control de calidad industrial: en una línea de montaje, el modelo puede verificar que el objeto esté correctamente orientado y posicionado, comparando la pose estimada con una referencia.
- Realidad aumentada: superponer modelos 3D o información virtual sobre el objeto físico en una aplicación móvil o de escritorio, usando la pose estimada para alinear el contenido.
- Automatización de almacenes: localizar y orientar el objeto para su recogida por un sistema de picking automatizado, reduciendo errores en entornos logísticos.
- Investigación en robótica: servir como componente de referencia para experimentos de estimación de pose en el benchmark BOP, permitiendo comparar con otros métodos.
- Simulación y entrenamiento de agentes: integrar la pose estimada en entornos simulados para entrenar políticas de manipulación con realismo.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que los resultados de validación en BOP para el objeto `obj_000011` están disponibles en el dataset `TontonTremblay/doper2-handal-results`, que contiene tablas de evaluación completas y cuadrículas de inferencia. No se proporcionan métricas concretas como ADD, ADD-S o error de keypoints en píxeles.

## Requisitos de hardware

- El tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero (probablemente menos de 100 millones de parámetros, aunque no se especifica).
- Inferencia en GPU: se requiere una GPU con al menos 2-4 GB de VRAM para ejecutar el modelo en PyTorch con precisión FP32. Una GPU consumer como la NVIDIA GTX 1060 o superior sería suficiente.
- El código de ejemplo usa `device="cuda:0"`, por lo que se necesita CUDA disponible.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje. El despliegue se realiza mediante el paquete `doper2` y PyTorch.
- La latencia y el throughput no están documentados, pero al ser un modelo pequeño con entrada de 224-256 píxeles, se espera una inferencia en tiempo real en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de pose de objetos específicos con pipeline DOPER2). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `obj_000011` de la colección HANDal; no generaliza a otros objetos.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos erróneos en condiciones de iluminación, oclusión o fondos complejos.
- La precisión de la pose depende de la calibración de la cámara (matriz intrínseca K) y de la calidad de la imagen.
- El modelo solo funciona con imágenes RGB; no soporta otras modalidades como profundidad o infrarrojo.
- No hay garantías de soporte o mantenimiento por parte del autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000011)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
