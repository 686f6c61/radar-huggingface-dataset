# TontonTremblay/doper2-handal-obj000006

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000006` es un estimador de pose 6D (posición y orientación) específico para el objeto `obj_000006` del dataset HANDal, entrenado con el pipeline DOPER2 desarrollado por Jonathan Tremblay (TontonTremblay). Este modelo resuelve el problema de localización precisa de un objeto rígido en imágenes RGB, devolviendo 64 keypoints 3D que permiten calcular la pose mediante PnP. Es relevante para aplicaciones de robótica, manipulación automatizada y realidad aumentada, donde se necesita conocer la posición exacta de un objeto conocido.

La arquitectura combina un backbone `convnext_tiny.dinov3_lvd1689m` (ConvNeXt-Tiny preentrenado con DINOv3) con una cabeza de keypoints basada en mapas de calor (heatmap). El modelo se entrena con una mezcla de datos sintéticos (DR synth 10k), imágenes PBR de BOP y pseudo-etiquetas de onboarding, en la etapa V5 del pipeline. El tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero, aunque no se especifican los parámetros totales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (DINOv3) + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone `convnext_tiny.dinov3_lvd1689m`, que es una variante de ConvNeXt-Tiny preentrenada con el framework DINOv3 sobre un gran corpus de imágenes (LVD-1689M). Sobre este backbone se añade una cabeza de regresión de keypoints mediante mapas de calor (heatmap), que predice 64 puntos 3D del objeto en unidades de metros. La entrada al detector es de 224 píxeles, mientras que el recorte para la cabeza de keypoints se redimensiona a 256 píxeles.

El entrenamiento sigue la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes PBR del estándar BOP (Benchmark for 6D Object Pose Estimation) y pseudo-etiquetas generadas durante el onboarding del objeto. No se proporcionan detalles sobre el número total de pasos, la función de pérdida o si se aplicaron técnicas de regularización adicionales. El checkpoint `best.pth` se selecciona según el menor error de keypoints en validación (kp_err_px).

## Capacidades

- Estimación de pose 6D (traslación y rotación) de un objeto específico (HANDal `obj_000006`) a partir de una imagen RGB.
- Detección del objeto en la imagen y predicción de 64 keypoints 3D en metros.
- Integración con `cv2.solvePnP` para obtener la pose final a partir de los keypoints.
- Inferencia en GPU mediante el paquete `doper2.infer`.
- No es un modelo de lenguaje: no genera texto, código ni responde a instrucciones.

## Casos de uso

- **Robótica de manipulación**: el modelo permite a un brazo robótico localizar con precisión el objeto `obj_000006` en una escena, calculando la pose necesaria para agarrarlo o ensamblarlo. La salida de keypoints 3D facilita el cálculo de la transformación rígida con PnP.
- **Control de calidad industrial**: en líneas de producción, se puede verificar la orientación y posición correcta de piezas que correspondan a este objeto, comparando la pose estimada con la esperada.
- **Realidad aumentada**: superponer modelos 3D o información virtual sobre el objeto real en tiempo real, usando la pose estimada para alinear el contenido.
- **Logística y picking**: en almacenes automatizados, el modelo ayuda a un sistema de visión a localizar el objeto en contenedores o estanterías para su recogida.
- **Navegación de robots móviles**: si el objeto es un marcador o referencia, el robot puede usarlo para auto-localizarse en el entorno.
- **Investigación en visión por computador**: como referencia para comparar pipelines de estimación de pose en el benchmark BOP, ya que se publican resultados de validación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card referencia un dataset de resultados en [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results) donde se pueden consultar tablas de evaluación completas y cuadrículas de inferencia, pero no se incluyen métricas concretas (como ADD, ADD-S o error de keypoints) en la ficha actual.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Dado el tamaño del repositorio (0,3 GB) y el backbone ConvNeXt-Tiny, se estima que la inferencia requiere menos de 2 GB de VRAM en FP32, y podría caber en GPUs con 4 GB o más.
- **GPU recomendadas**: cualquier GPU NVIDIA con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4090). Para entrenamiento se necesitaría más memoria, pero no se especifica.
- **Compatibilidad con consumer GPU**: sí, el modelo es ligero y debería ejecutarse en GPUs de consumo.
- **Opciones de despliegue**: el código de inferencia se basa en el paquete `doper2` (no publicado en PyPI, pero disponible en el repositorio del autor). No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible. Se espera una latencia baja (del orden de milisegundos) en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo está especializado en un único objeto y no se ofrecen comparaciones con otras arquitecturas de estimación de pose (como PoseCNN, PVNet o GDR-Net) en la model card.

## Limitaciones y advertencias

- **Específico de un objeto**: el modelo solo funciona para el objeto `obj_000006` del dataset HANDal. No es generalizable a otros objetos sin reentrenamiento.
- **Licencia no especificada**: al no indicarse licencia, el uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- **Dependencia del pipeline DOPER2**: la inferencia requiere el paquete `doper2` y los archivos de configuración (`config.yaml`, `keypoints_3d.json`), que deben estar disponibles.
- **Datos sintéticos**: el entrenamiento incluye imágenes sintéticas y pseudo-etiquetas, lo que puede introducir sesgos en condiciones del mundo real no representadas en el dataset.
- **Sin soporte de idiomas ni texto**: al ser un modelo de visión, no procesa lenguaje natural.
- **Riesgo de alucinación**: no aplica, pero la estimación de pose puede fallar en condiciones de oclusión severa, iluminación extrema o fondos complejos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000006)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
- [Repositorio GitHub del autor](https://github.com/TontonTremblay)
