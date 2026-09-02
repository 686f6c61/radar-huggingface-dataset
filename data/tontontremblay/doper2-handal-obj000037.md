# TontonTremblay/doper2-handal-obj000037

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000037` es un modelo de estimación de pose 6D para el objeto `000037` del dataset HANDal, entrenado con el pipeline DOPER2. Lo desarrolla Jonathan Tremblay (usuario `TontonTremblay`), investigador con actividad en Hugging Face y GitHub. El modelo predice 64 keypoints 3D en metros a partir de una imagen, que luego se pueden usar con `solvePnP` para obtener la rotación y traslación del objeto. Está diseñado para integrarse en sistemas de visión por computador, especialmente en robótica y manipulación.

El modelo utiliza un backbone `convnext_tiny.dinov3_lvd1689m`, con una entrada de 224 píxeles para el detector y 256 píxeles para el recorte del keypoint. El repositorio incluye el checkpoint `best.pth`, el archivo de keypoints 3D, la configuración de entrenamiento y un archivo de procedencia. No se especifica licencia, idiomas ni pipeline de inferencia en la información disponible. El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo compacto, adecuado para despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints (heatmap) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `best.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del pipeline DOPER2, que combina un detector y una cabeza de keypoints. El backbone es `convnext_tiny.dinov3_lvd1689m`, una variante de ConvNeXt preentrenada con DINOv3 en un conjunto de datos de 1689 millones de imágenes (LVD). La cabeza de keypoints es de tipo `heatmap`, que predice mapas de calor para cada uno de los 64 keypoints. El entrenamiento se realizó en la etapa V5 del pipeline, que incluye datos sintéticos DR synth (10k imágenes), datos BOP PBR y pseudo-etiquetas de onboarding. El tamaño de entrada es de 224 píxeles para el detector y 256 píxeles para el recorte del keypoint. No se especifican detalles adicionales sobre el número de tokens de entrenamiento, composición exacta del dataset o uso de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Estimación de pose 6D de un objeto específico (HANDal `000037`) a partir de una imagen RGB.
- Predicción de 64 keypoints 3D en metros, que permiten calcular la pose mediante `solvePnP`.
- Integración con el paquete `doper2` para carga de modelo e inferencia.
- Soporte para múltiples detecciones en una imagen (con `score_thr` configurable).
- Salida de keypoints 2D y 3D, junto con la puntuación de detección.
- No se reportan capacidades de generación de texto, razonamiento, código, tool calling, agentes o multilingüismo, al ser un modelo puramente visual.

## Casos de uso

- Robótica de manipulación: el modelo permite a un brazo robótico localizar y agarrar el objeto `000037` en un entorno real, usando la pose estimada para planificar la trayectoria.
- Control de calidad industrial: inspección visual de piezas que corresponden al objeto HANDal `000037`, verificando su orientación y posición en una línea de montaje.
- Realidad aumentada: superposición de modelos 3D sobre el objeto detectado en tiempo real, usando la pose para anclar el contenido virtual.
- Navegación autónoma: en entornos donde el objeto es un marcador o referencia, el modelo puede proporcionar su posición relativa para guiar a un robot móvil.
- Benchmarking de algoritmos de pose: al ser un modelo específico de un objeto, puede usarse como referencia para comparar otros métodos de estimación de pose en el dataset HANDal.
- Investigación en visión por computador: estudio de la transferencia de conocimiento desde backbones preentrenados con DINOv3 a tareas de keypoints y pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un dataset de resultados en `TontonTremblay/doper2-handal-results`, donde se pueden encontrar tablas de evaluación completas y cuadrículas de inferencia, pero no se incluyen los valores numéricos en la documentación actual.

## Requisitos de hardware

- El tamaño del repositorio es de 0.3 GB, lo que indica un checkpoint de aproximadamente 300 MB. Con un backbone `convnext_tiny`, el modelo es relativamente ligero.
- No se especifica VRAM mínima, pero se estima que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, con al menos 4 GB de VRAM.
- El código de ejemplo usa `device="cuda:0"`, por lo que se requiere una GPU NVIDIA con CUDA.
- Opciones de despliegue: el paquete `doper2` proporciona funciones de carga e inferencia. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de pose para objetos HANDal con pipeline DOPER2). No se puede realizar una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el objeto `000037` del dataset HANDal; no es generalizable a otros objetos sin reentrenamiento.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- No se reportan sesgos conocidos, pero al ser un modelo de visión, puede verse afectado por condiciones de iluminación, oclusión o variaciones de fondo no presentes en el entrenamiento.
- Riesgo de alucinación: no aplica directamente, pero la estimación de pose puede ser incorrecta en imágenes muy diferentes a las de entrenamiento.
- No se proporcionan métricas de robustez ni evaluación en condiciones adversas.
- El modelo depende de la calidad del detector; si el objeto no se detecta, no se produce salida.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000037)
- [Dataset de resultados](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil de usuario en Hugging Face](https://huggingface.co/TontonTremblay)
- [Perfil de GitHub](https://github.com/TontonTremblay)
