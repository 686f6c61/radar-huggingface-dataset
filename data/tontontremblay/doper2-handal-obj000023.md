# TontonTremblay/doper2-handal-obj000023

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000023` es un estimador de pose 6D (rotación y traslación) específico para el objeto `HANDal obj_000023`, un mango industrial, entrenado con el pipeline DOPER2. Desarrollado por Jonathan Tremblay (TontonTremblay), este modelo resuelve el problema de localización precisa de un objeto rígido en imágenes RGB, un requisito fundamental en robótica de manipulación, control de calidad y realidad aumentada. Su relevancia radica en que combina un backbone ConvNeXt-Tiny preentrenado con DINOv3, un detector y una cabeza de keypoints, logrando un tamaño compacto de 0.3 GB que permite inferencia en hardware moderado.

El modelo predice 64 keypoints 3D en metros, que se resuelven mediante PnP para obtener la pose completa. Está entrenado con una mezcla de datos sintéticos (DR synth 10k), datos BOP PBR y pseudo-etiquetas de onboarding, siguiendo la etapa V5 del pipeline DOPER2. No se dispone de licencia, idiomas ni pipeline declarados en la model card, y el repositorio contiene únicamente los pesos del mejor checkpoint, la configuración y los metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector + cabeza de keypoints (heatmap) con backbone `convnext_tiny.dinov3_lvd1689m` |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (solo pesos `.pth` en PyTorch) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | No disponible |
| Formato de pesos | PyTorch `.pth` (`best.pth`) y JSON (`keypoints_3d.json`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del pipeline DOPER2: un detector que procesa imágenes a 224 px y una cabeza de keypoints que opera sobre recortes de 256 px. El backbone es `convnext_tiny.dinov3_lvd1689m`, un ConvNeXt-Tiny preentrenado con DINOv3 sobre un conjunto de datos de 1689 millones de imágenes (LVD-1689M). La cabeza de keypoints utiliza mapas de calor (heatmap) para predecir 64 puntos 3D en metros.

El entrenamiento corresponde a la etapa V5 del pipeline, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con DR (Domain Randomization), datos BOP PBR (físicamente basados en renderizado) y pseudo-etiquetas generadas durante el onboarding del objeto. No se especifican el número total de épocas, la función de pérdida ni el optimizador. El repositorio incluye `config.yaml` y `training_provenance.json` para reproducibilidad, pero estos archivos no se detallan en la información proporcionada.

## Capacidades

- Estimacion de pose 6D (rotacion y traslacion) de un objeto especifico (`HANDal obj_000023`) a partir de una imagen RGB.
- Deteccion del objeto en la imagen y prediccion de 64 keypoints 3D en metros.
- Resolucion de la pose mediante `cv2.solvePnP` con el algoritmo SQPNP, devolviendo el vector de traslacion en milimetros y la matriz de rotacion.
- Inferencia en tiempo real en GPU (CUDA) gracias al tamano compacto del modelo (0.3 GB).
- Integracion sencilla con el paquete `doper2` (funciones `load_model` e `infer_image`).
- No incluye capacidades de texto, codigo, audio ni vision general; es un modelo especializado en un unico objeto.

## Casos de uso

- Robotica de agarre: el modelo proporciona la pose 6D del mango, permitiendo a un brazo robotico planificar la aproximacion y el agarre con precision milimetrica. Su tamano reducido permite ejecutarlo en el controlador del robot.
- Seguimiento de objetos en lineas de produccion: al integrarse en un sistema de vision industrial, puede rastrear la posicion y orientacion del mango en tiempo real para guiar operaciones de ensamblaje o empaquetado.
- Realidad aumentada para mantenimiento: superponer instrucciones digitales sobre el mango fisico requiere una pose estable; este modelo la proporciona con 64 keypoints, facilitando el anclaje de graficos 3D.
- Control de calidad automatizado: comparando la pose estimada con la esperada, se pueden detectar desalineaciones o defectos de montaje en el objeto.
- Navegacion autonoma en entornos industriales: si el mango forma parte de un entorno de trabajo, su pose puede usarse para evitar colisiones o para interaccionar con el objeto de forma segura.
- Simulacion para entrenamiento de robots: la pose estimada puede alimentar simuladores (por ejemplo, Isaac Sim o MuJoCo) para generar datos de entrenamiento de politicas de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un dataset externo `TontonTremblay/doper2-handal-results` donde se pueden consultar tablas de evaluacion completas y cuadriculas de inferencia, pero no se incluyen valores concretos en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 0.3 GB en disco; en inferencia con PyTorch, el uso de VRAM sera inferior a 1 GB (incluyendo el backbone ConvNeXt-Tiny y la cabeza de keypoints).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060 o superiores. Para produccion, una RTX 3060 o superior ofrece margen para lotes y procesamiento simultaneo.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama baja y media.
- Opciones de despliegue: el codigo de ejemplo usa PyTorch con CUDA. Se puede exportar a ONNX o TensorRT para acelerar la inferencia en entornos de produccion. No se menciona soporte para vLLM, llama.cpp u Ollama (no aplica a modelos de vision).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una latencia inferior a 10 ms en una GPU moderna, pero no hay datos confirmados.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, ya que se trata de un modelo especializado en un objeto unico y no se dispone de alternativas de la misma categoria (estimacion de pose para el mismo objeto) en el contexto de la busqueda.

## Limitaciones y advertencias

- El modelo solo funciona para el objeto `HANDal obj_000023`; no generaliza a otros mangos u objetos similares.
- Requiere una camara calibrada (matriz intrinseca `K`) y una imagen con el objeto visible; la precision depende de la calidad de la imagen y de la distancia al objeto.
- No se dispone de informacion sobre sesgos, pero al ser un modelo de vision entrenado con datos sinteticos y PBR, puede degradarse en condiciones de iluminacion extremas o con oclusiones severas.
- La licencia no esta declarada, por lo que el uso comercial es incierto y debe consultarse con el autor antes de desplegarlo en produccion.
- El repositorio no incluye un script de inferencia completo; el codigo de ejemplo requiere el paquete `doper2`, que no se documenta en la model card.
- No hay garantias de soporte ni mantenimiento; el modelo se publica tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TontonTremblay/doper2-handal-obj000023
- Dataset de resultados (evaluaciones): https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Perfil del autor en HuggingFace: https://huggingface.co/TontonTremblay
- Perfil del autor en GitHub: https://github.com/TontonTremblay
