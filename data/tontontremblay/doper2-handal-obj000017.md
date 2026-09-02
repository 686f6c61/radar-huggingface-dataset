# TontonTremblay/doper2-handal-obj000017

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000017` es un checkpoint de estimación de pose 6D (posición y orientación) para el objeto `000017` del dataset HANDal, entrenado con el pipeline DOPER2. Lo desarrolla TontonTremblay (jonathan) y forma parte de una serie de modelos específicos por objeto para tareas de manipulación robótica y realidad aumentada. El modelo utiliza un backbone `convnext_tiny.dinov3_lvd1689m` y predice 64 keypoints 3D en metros, con una etapa de detección a 224 píxeles y un recorte de keypoints a 256 píxeles.

La relevancia de este modelo radica en que ofrece una solución de estimación de pose 6D para un objeto concreto con un pipeline de entrenamiento reproducible (V5, con datos sintéticos DR synth 10k, BOP PBR y pseudo-etiquetas de onboarding). El repositorio incluye el checkpoint, la configuración de entrenamiento, los keypoints 3D y un archivo de procedencia de datos, lo que facilita la auditoría y la replicación. Es un modelo especializado, no generalista, orientado a aplicaciones de robótica y visión por computador donde se necesita localizar con precisión un objeto conocido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints por heatmap |
| Parametros totales | no disponible (checkpoint de 0.3 GB, probablemente < 100 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se proporciona `best.pth`, formato PyTorch) |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del pipeline DOPER2: un detector de objetos (entrada de 224 píxeles) que localiza el objeto en la imagen y genera un recorte de 256 píxeles, sobre el cual una cabeza de keypoints basada en heatmap predice 64 puntos 3D. El backbone es `convnext_tiny` preentrenado con DINOv3 (LVD-1689M), lo que proporciona características visuales robustas. La etapa de entrenamiento corresponde a la versión V5 del pipeline, que combina datos sintéticos con dominio aleatorizado (DR synth 10k), datos BOP PBR y pseudo-etiquetas de onboarding. No se especifica el número total de parámetros ni la composición exacta del dataset de entrenamiento, pero el archivo `training_provenance.json` incluido en el repositorio documenta los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado.

## Capacidades

- Estimación de pose 6D (rotación y traslación) para el objeto HANDal `000017` mediante correspondencias 2D-3D de 64 keypoints.
- Detección del objeto en la imagen con un score de confianza configurable (`score_thr`).
- Salida de keypoints 2D y 3D en metros, lista para resolver PnP (por ejemplo, con `cv2.solvePnP`).
- Integración con el paquete `doper2` para carga de modelos e inferencia.
- No soporta generación de texto, código, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Manipulación robótica: el modelo proporciona la pose 6D del objeto HANDal `000017` para que un brazo robótico pueda agarrarlo o interactuar con él. La salida en metros y la resolución PnP permiten una integración directa en el bucle de control.
- Realidad aumentada: superponer modelos 3D o información virtual sobre el objeto físico en tiempo real, usando la pose estimada para alinear el contenido.
- Inspección de calidad: verificar la posición y orientación del objeto en una línea de producción, comparando la pose estimada con una referencia.
- Navegación autónoma: localizar el objeto en el entorno para tareas de búsqueda o recogida en almacenes.
- Benchmarking de pipelines de estimación de pose: al ser un checkpoint específico de un objeto, puede usarse como referencia para comparar otros métodos en el mismo objeto del dataset HANDal.
- Investigación en sim-to-real: el pipeline de entrenamiento con datos sintéticos y pseudo-etiquetas puede replicarse o adaptarse para otros objetos, usando este modelo como ejemplo de configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un dataset de resultados (`TontonTremblay/doper2-handal-results`) con tablas de evaluación completas y cuadrículas de inferencia, pero no se incluyen los valores numéricos en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 0.3 GB, por lo que la inferencia debería caber en GPUs con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 2060). Para entrenamiento o fine-tuning se recomienda al menos 8 GB.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (serie RTX 20/30/40, A100, etc.). El backbone `convnext_tiny` es ligero y la inferencia es rápida.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: el modelo se usa mediante el paquete `doper2` (carga con `load_model` e inferencia con `infer_image`). No se mencionan formatos ONNX, TensorRT ni integración con vLLM, llama.cpp u Ollama (no aplicable por ser modelo de visión).
- Latencia y throughput: no disponible, pero al ser un modelo pequeño (convnext_tiny) se espera una latencia de decenas de milisegundos por imagen en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es específico para un objeto concreto y no se han encontrado alternativas directas en la búsqueda web. Se puede considerar que otros checkpoints de la serie DOPER2 (para otros objetos HANDal) serían comparables, pero no se dispone de sus especificaciones.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para el objeto `000017` del dataset HANDal; no generaliza a otros objetos.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- La precisión de la pose depende de la calidad de la imagen y de las condiciones de iluminación; el pipeline usa dominio aleatorizado para sim-to-real, pero puede degradarse en entornos muy diferentes a los de entrenamiento.
- No se proporcionan métricas de error (kp_err_px) en la model card, por lo que no se puede evaluar la precisión esperada sin consultar el dataset de resultados.
- El modelo no incluye capacidades de razonamiento, texto ni interacción multimodal; es exclusivamente para estimación de pose.
- El archivo `best.pth` está en formato PyTorch; para producción puede requerir conversión a otros formatos (ONNX, TensorRT) que no están documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000017
- Dataset de resultados (evaluación BOP): https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor: https://huggingface.co/TontonTremblay
- Repositorio de datos DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Repositorio GitHub del pipeline de renderizado (blender2rand): https://github.com/TontonTremblay/blender2rand
