# TontonTremblay/doper2-handal-obj000014

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000014` es un sistema de estimación de pose 6D (rotación y traslación) para el objeto `000014` de la colección HANDal, entrenado con el pipeline DOPER2. Lo desarrolla TontonTremblay (Jonathan Tremblay), investigador con actividad en Hugging Face y GitHub, y está pensado para aplicaciones de robótica y visión por computador donde se necesita localizar con precisión un objeto conocido en una escena.

El modelo utiliza un backbone `convnext_tiny` preentrenado con DINOv3 (variante `lvd1689m`) y una cabeza de detección de 64 keypoints 3D expresados en metros. La entrada se procesa en dos etapas: un detector a 224 píxeles y un recorte de keypoints a 256 píxeles. El repositorio ocupa 0,3 GB e incluye el checkpoint `best.pth`, el fichero de keypoints 3D, la configuración de entrenamiento y la procedencia completa de los datos.

La relevancia de este modelo radica en su enfoque específico para un objeto concreto, lo que permite una precisión alta en tareas de manipulación robótica, control de calidad o realidad aumentada. Al estar entrenado con una combinación de datos sintéticos (DR synth 10k), datos BOP PBR y pseudo-etiquetas de onboarding, ofrece una solución práctica para escenarios industriales donde se requiere robustez frente a variaciones de iluminación y oclusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints con mapa de calor (heatmap) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas. Primero, un detector procesa la imagen completa a 224 píxeles para localizar el objeto. Después, un recorte centrado en la detección se redimensiona a 256 píxeles y se pasa por el backbone `convnext_tiny` preentrenado con DINOv3, que extrae características visuales. Sobre estas características, una cabeza de keypoints genera mapas de calor para 64 puntos 3D definidos en el fichero `keypoints_3d.json` (coordenadas en metros). La pose final se obtiene resolviendo el problema PnP (Perspective-n-Point) con `cv2.solvePnP` sobre los keypoints detectados.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes del conjunto BOP con texturas PBR (Physically Based Rendering) y pseudo-etiquetas generadas durante el proceso de onboarding. Esta mezcla busca maximizar la generalización del modelo ante condiciones reales de iluminación, oclusión y fondo. El fichero `training_provenance.json` documenta todos los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que facilita la reproducibilidad.

## Capacidades

- Estimación de pose 6D (rotación y traslación) de un objeto específico (HANDal obj_000014) a partir de una imagen RGB.
- Detección de 64 keypoints 3D en coordenadas métricas, lo que permite una localización precisa del objeto en el espacio.
- Inferencia con soporte para múltiples detecciones en una misma imagen (el código de ejemplo selecciona la de mayor score).
- Integración directa con OpenCV para resolver PnP y obtener la matriz de rotación y el vector de traslación.
- Entrenado con datos sintéticos y reales, lo que le confiere robustez frente a variaciones de iluminación, textura y fondo.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Manipulación robótica: el modelo permite a un brazo robótico localizar con precisión el objeto `000014` en el espacio, calculando la pose necesaria para un agarre correcto. Su salida en milímetros (tras convertir de metros) se puede alimentar directamente al controlador del robot.
- Control de calidad industrial: en una línea de montaje, el modelo puede verificar si el objeto está correctamente orientado o posicionado comparando la pose estimada con una referencia, detectando desviaciones de forma automática.
- Realidad aumentada: al conocer la pose 6D del objeto, se pueden superponer modelos 3D o información virtual sobre la imagen en tiempo real, útil para guías de montaje o mantenimiento asistido.
- Inventario y logística: en almacenes, el modelo puede ayudar a localizar y clasificar objetos específicos en estanterías o contenedores, facilitando tareas de picking automatizado.
- Investigación en visión por computador: sirve como punto de partida para estudiar técnicas de estimación de pose con keypoints, o para comparar el rendimiento de diferentes backbones y estrategias de entrenamiento en el pipeline DOPER2.
- Benchmarking en robótica: al estar vinculado al conjunto de resultados BOP (ver enlaces), permite evaluar el rendimiento del modelo frente a otros métodos en condiciones estandarizadas, lo que es útil para la comunidad científica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un dataset externo (`TontonTremblay/doper2-handal-results`) donde se indican las tablas de evaluación completas y las cuadrículas de inferencia para el objeto `000014`, pero los valores numéricos concretos (como el error de keypoints en píxeles o el error de pose) no se incluyen en el repositorio del modelo.

## Requisitos de hardware

- Tamaño del repositorio: 0,3 GB, lo que incluye el checkpoint, la configuración y los ficheros auxiliares.
- VRAM estimada: no disponible con exactitud, pero al tratarse de un backbone `convnext_tiny` (modelo ligero) y una entrada de 256 píxeles, es razonable esperar que quepa en GPUs de consumo como una RTX 3060 o superior. No se proporcionan cifras oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4-6 GB de VRAM debería ser suficiente para inferencia. Para entrenamiento se necesitaría más memoria, pero no se especifica.
- Opciones de despliegue: el código de ejemplo usa PyTorch directamente con `load_model` e `infer_image` de la librería `doper2`. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la resolución de entrada, pero al ser un modelo pequeño se espera una inferencia en tiempo real en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (estimación de pose para un objeto específico con keypoints). El pipeline DOPER2 es una propuesta propia del autor, y no se han encontrado en la documentación referencias a otros modelos con los que se haya comparado directamente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `000014` de la colección HANDal. No funcionará con otros objetos sin un reentrenamiento específico.
- La licencia no está especificada en la model card, por lo que se desconoce si es de uso libre, con restricciones o comercial. Se recomienda contactar con el autor antes de usarlo en producción.
- No se han documentado sesgos ni riesgos de alucinación, pero al ser un modelo de visión, puede fallar en condiciones extremas de oclusión, iluminación muy baja o fondos muy similares al objeto.
- La precisión de la pose depende de la calidad de la calibración de la cámara (matriz intrínseca `K`), que debe proporcionarse correctamente en el código de inferencia.
- El modelo no es un LLM: no tiene capacidades de generación de texto, razonamiento simbólico ni interacción en lenguaje natural.
- No se han publicado métricas de rendimiento en el repositorio, por lo que no es posible evaluar su precisión cuantitativa sin acceder al dataset de resultados externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000014
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil de GitHub del autor: https://github.com/TontonTremblay
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
