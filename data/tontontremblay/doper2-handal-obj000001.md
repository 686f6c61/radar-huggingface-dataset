# TontonTremblay/doper2-handal-obj000001

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000001` es un checkpoint de estimación de pose 6D para el objeto `000001` del dataset HANDal, entrenado con el pipeline DOPER2. Desarrollado por Jonathan Tremblay (TontonTremblay), investigador con actividad en Hugging Face y GitHub, este modelo resuelve el problema de localizar y orientar un objeto específico en el espacio 3D a partir de una imagen RGB. Es relevante para aplicaciones de robótica, manipulación y realidad aumentada donde se necesita conocer la posición y orientación exacta de un objeto conocido.

El modelo utiliza un backbone `convnext_tiny` preentrenado con DINOv3 (lvd1689m) y una cabeza de keypoints basada en mapas de calor (heatmap). Detecta 64 puntos clave 3D definidos en metros, con una entrada de 224 píxeles para el detector y 256 píxeles para el recorte del keypoint. El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo ligero, adecuado para inferencia en tiempo real en GPUs de consumo. El pipeline de entrenamiento corresponde a la etapa V5, que combina datos sintéticos (DR synth 10k), BOP PBR y pseudo-etiquetas de onboarding.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (checkpoint en formato `.pth` de PyTorch) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pth`), junto con `config.yaml` y `keypoints_3d.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: primero un detector que localiza el objeto en la imagen (entrada de 224 píxeles) y luego una red de keypoints que procesa un recorte de 256 píxeles para predecir 64 puntos 3D. El backbone es `convnext_tiny` con pesos inicializados desde DINOv3 (lvd1689m), un modelo de visión autosupervisado. La cabeza de keypoints utiliza mapas de calor (heatmap), una técnica estándar para localización precisa de puntos.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10,000 imágenes sintéticas generadas con renderizado (DR synth), imágenes fotorrealistas del dataset BOP PBR, y pseudo-etiquetas generadas durante el onboarding del objeto. No se especifican el número total de épocas, el tamaño del lote ni la función de pérdida, pero el checkpoint `best.pth` se selecciona por el menor error de keypoint en píxeles (val `kp_err_px`). El archivo `training_provenance.json` incluido en el repositorio documenta los argumentos de entrenamiento, las fuentes de datos y el commit de git, lo que facilita la reproducibilidad.

## Capacidades

- Estimación de pose 6D (posición y orientación) de un objeto específico (HANDal obj_000001) a partir de una imagen RGB.
- Detección del objeto en la imagen y predicción de 64 keypoints 3D en metros.
- Integración con `cv2.solvePnP` para obtener la traslación y rotación de la cámara respecto al objeto.
- Inferencia en GPU mediante el paquete `doper2` (no publicado en PyPI, pero disponible en el repositorio del autor).
- No es un modelo de lenguaje ni multimodal; su única capacidad es la visión por computador para pose estimation.

## Casos de uso

- **Robótica de manipulación**: un brazo robótico puede usar la pose estimada para agarrar el objeto HANDal `000001` en tareas de pick-and-place. El modelo proporciona la posición y orientación en milímetros, suficiente para planificar trayectorias.
- **Control de calidad industrial**: en una línea de montaje, el modelo puede verificar que el objeto esté correctamente orientado antes de ensamblaje, comparando la pose estimada con una referencia.
- **Realidad aumentada**: superponer modelos 3D o información virtual sobre el objeto físico en tiempo real, usando la pose para alinear el contenido digital.
- **Navegación autónoma**: en entornos con objetos conocidos, el modelo puede ayudar a un robot móvil a localizar y evitar o interactuar con el objeto.
- **Teleoperación**: en sistemas de telepresencia, la pose del objeto permite que un operador remoto vea el entorno desde la perspectiva correcta o reciba retroalimentación háptica basada en la posición.
- **Investigación en visión por computador**: como referencia para comparar pipelines de estimación de pose en objetos del dataset HANDal, especialmente en el contexto de BOP (Benchmark for 6D Object Pose Estimation).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los resultados de validación BOP para el objeto `000001` están disponibles en el dataset [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results), pero no se proporcionan valores numéricos en la documentación actual. Se recomienda consultar ese dataset para obtener tablas de evaluación completas y cuadrículas de inferencia.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Dado que el checkpoint pesa 0.3 GB y el backbone es `convnext_tiny` (aproximadamente 28 millones de parámetros), se estima que la inferencia requiere entre 2 y 4 GB de VRAM en FP32, y menos con cuantización (aunque no se ofrecen versiones cuantizadas).
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. Para entrenamiento o fine-tuning, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- **Compatibilidad con GPUs de consumo**: sí, el modelo es lo suficientemente pequeño para ejecutarse en GPUs de gama media e incluso en CPU (aunque con menor rendimiento).
- **Opciones de despliegue**: el código de inferencia se basa en el paquete `doper2` (importado como `from doper2.infer import load_model, infer_image`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje. Se puede desplegar como un servicio con FastAPI o similar, o integrarse directamente en aplicaciones Python.
- **Latencia y throughput**: no disponibles. Al ser un modelo pequeño, se espera una latencia de decenas de milisegundos en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de pose 6D para objetos específicos del dataset HANDal). El campo de estimación de pose 6D tiene alternativas como los métodos basados en BOP (por ejemplo, CosyPose, GDR-Net), pero no se han encontrado checkpoints públicos específicos para el objeto `000001` de HANDal con los que comparar directamente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Específico de un objeto**: el modelo solo funciona con el objeto `000001` del dataset HANDal. No es generalizable a otros objetos sin reentrenamiento.
- **Dependencia de la calibración de cámara**: el uso de `cv2.solvePnP` requiere conocer la matriz intrínseca de la cámara (K). Una calibración incorrecta degrada la precisión de la pose.
- **Condiciones de iluminación y oclusión**: al estar entrenado con datos sintéticos y PBR, puede tener degradación en condiciones extremas de iluminación, oclusiones severas o fondos muy diferentes a los de entrenamiento.
- **Licencia desconocida**: no se especifica la licencia del modelo. Esto impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con Jonathan Tremblay antes de cualquier despliegue en producción.
- **Sin cuantizaciones oficiales**: solo se proporciona el checkpoint en formato PyTorch (`.pth`). No hay versiones ONNX, TensorRT o GGUF, lo que limita el despliegue en entornos optimizados.
- **Riesgo de error en la pose**: como cualquier modelo de estimación de pose, puede producir errores en la orientación (especialmente en simetrías del objeto) que deben ser validados en la aplicación final.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000001)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil de Hugging Face del autor](https://huggingface.co/TontonTremblay)
- [Perfil de GitHub del autor](https://github.com/TontonTremblay)
