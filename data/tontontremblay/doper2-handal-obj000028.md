# TontonTremblay/doper2-handal-obj000028

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000028` es un sistema de estimación de pose 6D (rotación y traslación) para un objeto específico de la colección HANDal, concretamente el objeto con identificador `000028`. Ha sido desarrollado por TontonTremblay (Jonathan) utilizando el pipeline DOPER2, una metodología de entrenamiento que combina datos sintéticos con dominio aleatorizado, imágenes PBR de BOP y pseudo-etiquetas de onboarding. El modelo resuelve el problema de localizar y orientar un objeto rígido en el espacio 3D a partir de una única imagen RGB, una tarea fundamental en robótica de manipulación y visión industrial.

La arquitectura se basa en un backbone `convnext_tiny` preentrenado con DINOv3 (variante `lvd1689m`) y una cabeza de predicción de mapas de calor (heatmap) para 64 puntos clave 3D. El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo ligero, aunque no se especifican los parámetros totales. La relevancia actual radica en su enfoque específico para un objeto concreto, lo que permite una alta precisión en entornos controlados, y en su integración con el pipeline DOPER2, que facilita la transferencia sim-to-real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints tipo heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo emplea un backbone ConvNeXt-Tiny cuyos pesos iniciales provienen de un entrenamiento auto-supervisado con DINOv3 sobre un conjunto de datos extenso (identificado como `lvd1689m`). Sobre este backbone se añade una cabeza de regresión de mapas de calor que predice 64 puntos clave 3D del objeto. La entrada al detector es de 224 píxeles y la región recortada alrededor del objeto se procesa a 256 píxeles.

El entrenamiento sigue el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas con dominio aleatorizado (DR synth), imágenes PBR del conjunto BOP y pseudo-etiquetas generadas durante el proceso de onboarding. No se proporcionan detalles sobre el número total de pasos, la función de pérdida o si se aplicaron técnicas de refinamiento adicionales. La innovación principal reside en la integración de estas fuentes heterogéneas para lograr robustez frente a variaciones de iluminación, textura y fondo.

## Capacidades

- Estimación de pose 6D (rotación y traslación) de un objeto específico (HANDal obj_000028) a partir de una imagen RGB.
- Detección del objeto en la imagen y predicción de 64 puntos clave 3D en metros.
- Integración con `cv2.solvePnP` para obtener la pose final a partir de los keypoints.
- Soporte para inferencia en GPU mediante PyTorch y CUDA.
- Capacidad de procesamiento en tiempo real para aplicaciones robóticas, dado el tamaño reducido del modelo.
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Robótica de manipulación: el modelo puede guiar un brazo robótico para agarrar el objeto `000028` estimando su posición y orientación en tiempo real, lo que permite planificar trayectorias de agarre precisas.
- Inspección industrial: en una línea de montaje, se puede verificar que el objeto esté correctamente posicionado y orientado comparando la pose estimada con la esperada, detectando desviaciones.
- Realidad aumentada: superponer información virtual (instrucciones, etiquetas) sobre el objeto físico en una escena capturada por cámara, utilizando la pose estimada para anclar el contenido.
- Navegación autónoma: en entornos donde el objeto es un obstáculo o un elemento de interacción, el modelo permite a un robot móvil localizarlo y evitarlo o manipularlo.
- Transferencia sim-to-real: al estar entrenado con datos sintéticos y PBR, sirve como referencia para evaluar la robustez de métodos de estimación de pose en condiciones reales.
- Investigación en visión por computador: como punto de partida para comparar arquitecturas de keypoints o pipelines de entrenamiento específicos para objetos rígidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un dataset de resultados en HuggingFace (`TontonTremblay/doper2-handal-results`) que contiene tablas de evaluación y cuadrículas de inferencia, pero no se incluyen valores numéricos concretos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del repositorio (0.3 GB), se estima que el modelo puede ejecutarse en GPUs con al menos 2 GB de VRAM, aunque no hay datos oficiales.
- GPU recomendadas: no se especifican. Por el tamaño, debería funcionar en GPUs consumer como GTX 1060, RTX 2060 o superiores.
- Compatibilidad con consumer GPU: probablemente sí, dado el peso ligero.
- Opciones de despliegue: la model card muestra uso con PyTorch y CUDA. No se mencionan otros frameworks como vLLM, llama.cpp u Ollama (no aplicables a visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un modelo especializado para un objeto concreto y no se dispone de datos de otros sistemas de estimación de pose para el mismo objeto.

## Limitaciones y advertencias

- Especificidad: el modelo solo funciona para el objeto `000028` de la colección HANDal; no generaliza a otros objetos.
- Dependencia de la calidad de los datos de entrenamiento: el rendimiento puede degradarse en condiciones de iluminación extrema, oclusiones o fondos muy diferentes a los vistos durante el entrenamiento.
- Licencia desconocida: al no especificarse la licencia, no se puede garantizar el uso comercial o la redistribución sin permiso del autor.
- Riesgo de errores en la estimación de pose: en escenarios con poca textura o simetrías del objeto, la predicción de keypoints puede ser ambigua.
- No se proporcionan métricas de precisión ni estudios de sesgo, por lo que se recomienda validar el modelo en el entorno de aplicación antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TontonTremblay/doper2-handal-obj000028
- Dataset de resultados: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Repositorio GitHub del autor (pipeline de renderizado): https://github.com/TontonTremblay/blender2rand
