# TontonTremblay/doper2-handal-obj000029

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000029` es un estimador de pose 6D (posición y orientación) para el objeto `000029` del dataset HANDal, entrenado con el pipeline DOPER2. Lo desarrolla Jonathan Tremblay (TontonTremblay), investigador con actividad en Hugging Face y GitHub, y forma parte de una serie de modelos específicos por objeto para evaluación en el benchmark BOP. Resuelve el problema de localizar y orientar un objeto conocido en imágenes RGB, devolviendo 64 keypoints 3D en metros que permiten recuperar la pose mediante PnP.

La arquitectura combina un backbone ConvNeXt-Tiny preentrenado con DINOv3 (variante `convnext_tiny.dinov3_lvd1689m`) y una cabeza de keypoints por mapas de calor. El modelo se entrena en tres etapas: datos sintéticos con renderizado DR (10k imágenes), PBR de BOP y pseudo-etiquetas de onboarding. El checkpoint pesa 0.3 GB y está diseñado para inferencia en GPU con entrada de 224 píxeles para el detector y 256 píxeles para el recorte del keypoint. Es relevante porque ofrece un pipeline reproducible y abierto para estimación de pose de objetos industriales, con resultados de validación publicados en un dataset separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (DINOv3) + cabeza de keypoints por mapas de calor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pth`) |

## Arquitectura y entrenamiento

El modelo usa un backbone `convnext_tiny.dinov3_lvd1689m`, es decir, una variante ConvNeXt-Tiny preentrenada con DINOv3 sobre un corpus de 1689 millones de imágenes (LVD). Sobre este backbone se añade una cabeza de keypoints que genera mapas de calor para 64 puntos 3D definidos en `keypoints_3d.json` (coordenadas en metros). El detector procesa imágenes de 224×224 píxeles y el recorte del objeto se reescala a 256×256 para la regresión de keypoints.

El entrenamiento sigue el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: renderizados sintéticos con dominio aleatorio (DR synth, 10k imágenes), imágenes PBR del benchmark BOP y pseudo-etiquetas generadas en un proceso de onboarding. Esta mezcla busca mejorar la robustez frente a variaciones de iluminación, textura y oclusión. No se especifican hiperparámetros adicionales, pero el repositorio incluye `config.yaml` y `training_provenance.json` con los argumentos completos de entrenamiento, fuentes de datos y commit de git, lo que garantiza reproducibilidad.

## Capacidades

- Estimacion de pose 6D (traslacion y rotacion) de un objeto especifico (HANDal `000029`) a partir de una imagen RGB.
- Deteccion del objeto en la imagen mediante un detector integrado (score threshold configurable).
- Regresion de 64 keypoints 3D en unidades de metros, listos para resolver PnP con `cv2.solvePnP`.
- Inferencia por lotes o por imagen individual mediante la API `doper2.infer`.
- Compatibilidad con el flujo de evaluacion BOP (el autor publica resultados de validacion en un dataset aparte).
- No soporta texto, lenguaje natural ni generacion de contenido; es un modelo puramente visual y de proposito especifico.

## Casos de uso

- Robotica de manipulacion: un brazo robotico puede localizar y agarrar el objeto `000029` usando la pose estimada para planificar la trayectoria. El modelo devuelve keypoints en metros, lo que permite integrarse directamente con el sistema de control.
- Control de calidad industrial: en una linea de montaje, el modelo verifica que el objeto esta correctamente orientado comparando la pose estimada con la esperada.
- Realidad aumentada: superponer informacion virtual sobre el objeto fisico en tiempo real, usando la pose para anclar graficos 3D.
- Navegacion autonoma en entornos con objetos conocidos: el modelo puede ayudar a un robot movil a evitar o interactuar con el objeto detectandolo y estimando su posicion.
- Benchmarking de algoritmos de pose: al estar entrenado con el pipeline DOPER2 y evaluado en BOP, sirve como referencia para comparar otros metodos de estimacion de pose en el objeto `000029`.
- Investigacion en aprendizaje con datos sinteticos: el pipeline de entrenamiento (DR synth + PBR + pseudo-etiquetas) puede replicarse para otros objetos, y este modelo sirve como ejemplo de aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor referencia un dataset de resultados en [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results) donde se incluyen tablas de evaluacion BOP y cuadriculas de inferencia, pero los numeros concretos no estan en la model card ni en la busqueda web. Se recomienda consultar ese dataset para metricas de error de keypoints (kp_err_px) y otras.

## Requisitos de hardware

- El checkpoint pesa 0.3 GB, por lo que la VRAM necesaria para inferencia es modesta. Se estima que cabe en GPUs con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050), aunque no se proporcionan datos oficiales.
- GPU recomendada: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM. Para mayor velocidad, una RTX 3060 o superior.
- El modelo se ejecuta con PyTorch y requiere la libreria `doper2` (no publicada en el repositorio, pero disponible en el codigo del autor).
- Opciones de despliegue: inferencia local con script Python usando `load_model` e `infer_image`. No se mencionan integraciones con vLLM, Ollama o TGI (no aplican a un modelo de vision).
- Latencia y throughput: no disponibles. Dado el tamano del backbone (ConvNeXt-Tiny, ~28M parametros), se espera una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables del mismo autor o de otros que estimen pose para el objeto `000029` de HANDal. El modelo es especifico de un objeto y no se puede comparar directamente con modelos de lenguaje o de vision general.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para el objeto `000029` de HANDal; no generaliza a otros objetos sin reentrenamiento.
- No se especifica la licencia, por lo que el uso comercial es incierto. Se debe contactar con el autor antes de utilizarlo en produccion.
- La fecha de creacion (2026) es posterior a la actual, lo que sugiere que el modelo podria ser experimental o parte de una publicacion futura.
- No hay informacion sobre sesgos o alucinaciones (no aplica a un modelo de vision), pero la precision puede degradarse con oclusiones severas, iluminacion extrema o fondos no vistos en el entrenamiento.
- El pipeline de inferencia requiere la libreria `doper2` y un conocimiento de calibracion de camara (matriz K) para resolver PnP correctamente.
- Los keypoints estan en metros, pero el codigo de ejemplo los convierte a milimetros para `solvePnP`; un error en las unidades puede producir poses incorrectas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000029)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
- [Perfil del autor en GitHub](https://github.com/TontonTremblay)
- [Dataset DOPER_BOP](https://huggingface.co/datasets/TontonTremblay/DOPER_BOP)
