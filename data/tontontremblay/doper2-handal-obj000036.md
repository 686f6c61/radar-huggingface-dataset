# TontonTremblay/doper2-handal-obj000036

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000036` es un checkpoint de estimación de pose 6D para el objeto concreto `obj_000036` del dataset HANDal, entrenado con el pipeline DOPER2. Lo desarrolla Jonathan Tremblay (TontonTremblay), investigador con actividad en Hugging Face y GitHub, y forma parte de una serie de modelos específicos por objeto dentro del proyecto DOPER2. El modelo resuelve el problema de localizar y estimar la orientación y posición tridimensional de un objeto industrial o doméstico a partir de una imagen RGB, una tarea clave en robótica, automatización y realidad aumentada.

La arquitectura combina un backbone `convnext_tiny.dinov3_lvd1689m` con una cabeza de keypoints por mapa de calor (heatmap). El modelo predice 64 keypoints 3D en metros, que posteriormente se usan con `solvePnP` para obtener la pose completa. El entrenamiento corresponde a la etapa V5 del pipeline, que combina datos sintéticos (DR synth 10k), imágenes BOP PBR y pseudo-etiquetas de onboarding. El repositorio tiene un tamaño de 0.3 GB e incluye el checkpoint, la configuración y los ficheros de keypoints y procedencia del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints por heatmap |
| Parametros totales | no disponible (repo de 0.3 GB, sin desglose) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | `best.pth` (PyTorch), junto con `config.yaml` y `keypoints_3d.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del pipeline DOPER2: un detector de objetos que opera a 224 píxeles y una rama de keypoints que procesa recortes de 256 píxeles. El backbone es `convnext_tiny` preentrenado con DINOv3 sobre un conjunto de datos extenso (LVD-142M), lo que proporciona características visuales robustas. La cabeza de keypoints genera mapas de calor para 64 puntos 3D definidos en el fichero `keypoints_3d.json`, con coordenadas en metros.

El entrenamiento corresponde a la etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes del benchmark BOP con PBR (Physically Based Rendering) y pseudo-etiquetas obtenidas durante el proceso de onboarding. Esta mezcla busca mejorar la generalización a entornos reales. El fichero `training_provenance.json` documenta los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que facilita la reproducibilidad.

## Capacidades

- Estimación de pose 6D (posición y orientación) de un objeto específico (`obj_000036` de HANDal) a partir de una imagen RGB.
- Detección del objeto en la imagen mediante un detector integrado (score threshold configurable).
- Predicción de 64 keypoints 3D en metros, que permiten resolver la pose mediante `solvePnP` con la cámara calibrada.
- Inferencia sobre imágenes individuales con la API de `doper2.infer` (`load_model`, `infer_image`).
- Soporte para GPU mediante CUDA (device `cuda:0` en el ejemplo de uso).
- No es un modelo de lenguaje ni multimodal; su única entrada es una imagen y su salida son keypoints y detecciones.

## Casos de uso

- Robótica de manipulación: el modelo proporciona la pose 6D del objeto HANDal, permitiendo a un brazo robótico planificar agarres y movimientos precisos. Se integraría en el bucle de control con una cámara RGB y calibración intrínseca.
- Control de calidad industrial: inspección de piezas en línea de montaje, verificando que el objeto esté en la posición esperada mediante la comparación de la pose estimada con la nominal.
- Realidad aumentada: superposición de modelos 3D o información virtual sobre el objeto real en tiempo real, usando la pose estimada para anclar el contenido.
- Logística y almacenamiento: localización de objetos HANDal en estanterías o contenedores para sistemas de picking automatizado.
- Investigación en visión por computador: como referencia para evaluar pipelines de estimación de pose en objetos del benchmark BOP, dado que el modelo está entrenado con datos BOP PBR.
- Benchmarking de métodos de pose: el modelo puede usarse como baseline en comparativas de precisión de keypoints y pose frente a otros métodos, gracias a la disponibilidad de los ficheros de configuración y procedencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un dataset externo (`TontonTremblay/doper2-handal-results`) con tablas de evaluación completas y grids de inferencia, pero no se incluyen los valores numéricos en la documentación proporcionada. Se recomienda consultar ese dataset para obtener métricas como `kp_err_px` (error de keypoints en píxeles) y otras relacionadas con la precisión de pose.

## Requisitos de hardware

- El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo relativamente ligero (backbone convnext_tiny). No se especifica VRAM exacta, pero es plausible que quepa en GPUs de consumo como una RTX 3060 o superior.
- El ejemplo de uso indica `device="cuda:0"`, por lo que se requiere una GPU NVIDIA con soporte CUDA.
- No se proporcionan requisitos mínimos de VRAM, ni latencia o throughput estimados. Para inferencia en tiempo real, se recomienda una GPU con al menos 6 GB de VRAM, aunque esto es una estimación basada en el tamaño del modelo y no un dato oficial.
- Opciones de despliegue: el modelo se usa mediante la librería `doper2` (importable como `doper2.infer`), que gestiona la carga y la inferencia. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada modelos comparables de estimación de pose para el mismo objeto o con la misma arquitectura. El proyecto DOPER2 parece generar modelos específicos por objeto, pero no se dispone de datos de otros checkpoints para comparar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `obj_000036` del dataset HANDal; no es generalizable a otros objetos sin reentrenamiento.
- No se especifica la licencia, por lo que el uso comercial y la redistribución están sujetos a incertidumbre legal. Se debe contactar con el autor antes de usar en producción.
- La precisión depende de la calibración de la cámara (matriz K) y de las condiciones de iluminación y oclusión, como es habitual en estimación de pose.
- No se han publicado métricas de rendimiento en la documentación, por lo que no se puede evaluar la robustez frente a otros métodos.
- El modelo solo acepta imágenes RGB; no soporta otras modalidades (profundidad, infrarrojos, etc.).
- El fichero `best.pth` es un checkpoint de PyTorch; no se proporcionan versiones cuantizadas ni formatos optimizados para despliegue en edge.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000036
- Dataset de resultados (evaluaciones): https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil de GitHub del autor: https://github.com/TontonTremblay
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Dataset DOPER_HOPE: https://huggingface.co/datasets/TontonTremblay/DOPER_HOPE
