# TontonTremblay/doper2-handal-obj000038

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000038` es un estimador de pose 3D de un único objeto, concretamente el objeto `000038` del conjunto de datos HANDal, entrenado con el pipeline DOPER2. DOPER2 es un sistema de estimación de pose de objetos mediante keypoints 3D, desarrollado por Jonathan Tremblay (TontonTremblay), investigador conocido por su trabajo en sim-to-real y renderizado sintético para robótica. El modelo resuelve el problema de localizar y orientar un objeto específico en el espacio 3D a partir de una imagen RGB, devolviendo 64 keypoints 3D que permiten recuperar la pose completa mediante PnP.

La relevancia actual de este modelo radica en su enfoque de entrenamiento con datos sintéticos (DR synth 10k + BOP PBR) y pseudo-etiquetas de onboarding, una metodología que reduce la necesidad de anotaciones manuales y facilita la transferencia sim-to-real. La arquitectura se basa en un backbone `convnext_tiny` preentrenado con DINOv3 (LVD-1689M), seguido de una cabeza de keypoints por mapas de calor. El checkpoint ocupa 0.3 GB y está diseñado para inferencia en GPU. No se dispone de información sobre licencia, idiomas ni parámetros totales más allá del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints por mapas de calor (heatmap) |
| Parametros totales | No disponible (el backbone convnext_tiny tiene ~28M, pero no se especifica el total con la cabeza) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | No disponible (solo se proporciona `best.pth`, formato PyTorch nativo) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | No disponible |
| Formato de pesos | PyTorch checkpoint (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un detector que opera a 224 px de entrada y una cabeza de keypoints que procesa recortes de 256 px. El backbone es `convnext_tiny` preentrenado con DINOv3 sobre LVD-1689M, un conjunto de datos de visión a gran escala. La cabeza de keypoints genera mapas de calor para 64 puntos 3D definidos en `keypoints_3d.json` (coordenadas en metros). El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina 10.000 imágenes sintéticas con dominio aleatorizado (DR synth), datos PBR del estándar BOP y pseudo-etiquetas generadas durante el onboarding. No se especifica el número total de tokens ni el proceso de optimización (RLHF/DPO no aplican aquí). La inferencia devuelve keypoints 2D que se combinan con los keypoints 3D conocidos mediante `solvePnP` para obtener traslación y rotación.

## Capacidades

- Estimación de pose 3D de un objeto específico (HANDal obj_000038) a partir de una imagen RGB.
- Detección del objeto en la imagen (bounding box) y localización de 64 keypoints 2D.
- Recuperación de la pose completa (rotación y traslación) mediante PnP con la cámara calibrada.
- Inferencia en GPU con soporte para batch (vía `infer_image`).
- Entrenado con datos sintéticos y pseudo-etiquetas, lo que sugiere robustez a variaciones de iluminación y textura (dominio aleatorizado).
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un LLM).

## Casos de uso

- **Manipulación robótica**: el modelo permite a un brazo robótico localizar y agarrar el objeto HANDal 000038 en entornos reales. La pose estimada se usa para planificar la trayectoria de agarre. Su entrenamiento con datos sintéticos facilita la transferencia a entornos industriales sin anotaciones manuales.
- **Control de calidad en fabricación**: verificar la posición y orientación correcta del objeto en una línea de montaje. La salida de keypoints 3D permite comparar con la pose esperada y detectar desviaciones.
- **Realidad aumentada**: superponer modelos 3D o información virtual sobre el objeto físico en tiempo real, usando la pose estimada para alinear el contenido.
- **Teleoperación robótica**: en sistemas de telemanipulación, la pose del objeto se envía al operador para asistir en la toma de decisiones.
- **Investigación en sim-to-real**: sirve como caso de estudio para validar el pipeline DOPER2 y comparar el rendimiento de modelos entrenados con datos sintéticos frente a datos reales.
- **Benchmarking de estimación de pose**: el modelo puede usarse como referencia en el conjunto de datos BOP para el objeto 000038, permitiendo comparar con otros métodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los resultados de validación BOP para el objeto `obj_000038` están disponibles en el dataset [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results), pero no se incluyen cifras concretas en la documentación proporcionada. No se deben inventar números.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa 0.3 GB, y el backbone convnext_tiny requiere aproximadamente 1-2 GB de VRAM en FP32 para inferencia. Con cuantización (no disponible) podría reducirse, pero no se especifica.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente. Para mayor velocidad, una RTX 3090 o A100 no serían necesarias dado el tamaño del modelo.
- **Compatibilidad con GPU de consumo**: sí, cabe en GPUs de consumo medio-bajo.
- **Opciones de despliegue**: el código de inferencia se proporciona en el README usando la librería `doper2` (import `doper2.infer`). No se mencionan integraciones con vLLM, llama.cpp u Ollama (no aplica a modelos de visión). Se puede desplegar con PyTorch estándar en un servidor con GPU.
- **Latencia y throughput**: no disponible. Dado el tamaño del backbone, se espera una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otros modelos de estimación de pose para el mismo objeto. Modelos genéricos como PoseCNN, PVNet o los métodos del benchmark BOP (p. ej., CosyPose) podrían ser comparables, pero no se tienen datos de rendimiento de este modelo frente a ellos. Se recomienda consultar el dataset de resultados mencionado para obtener métricas de validación.

## Limitaciones y advertencias

- **Especialización**: el modelo está entrenado únicamente para el objeto HANDal `000038`. No funcionará con otros objetos sin reentrenamiento.
- **Dependencia de calibración**: la recuperación de pose requiere una cámara calibrada (matriz intrínseca K). Un error en la calibración afecta directamente a la precisión de la pose.
- **Datos sintéticos**: aunque el pipeline usa dominio aleatorizado, puede haber una brecha sim-to-real residual. Se recomienda validar en el entorno de producción.
- **Sin licencia especificada**: no se indica la licencia del modelo, lo que limita su uso comercial sin consultar al autor.
- **Sin cuantizaciones**: solo se proporciona el checkpoint en formato PyTorch, sin versiones cuantizadas (GGUF, ONNX, etc.), lo que puede dificultar el despliegue en hardware embebido.
- **Sin documentación de sesgos**: al ser un modelo de visión para un objeto concreto, no se han documentado sesgos, pero podría fallar en condiciones de iluminación extrema u oclusiones severas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/TontonTremblay/doper2-handal-obj000038)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Dataset DOPER_BOP](https://huggingface.co/datasets/TontonTremblay/DOPER_BOP)
- [Perfil de HuggingFace del autor](https://huggingface.co/TontonTremblay)
- [GitHub del autor](https://github.com/TontonTremblay)
- [Repositorio blender2rand (pipeline de datos sintéticos)](https://github.com/TontonTremblay/blender2rand)
