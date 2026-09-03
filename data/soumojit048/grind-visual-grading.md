# Soumojit048/grind-visual-grading

## Resumen

`grind-visual-grading` es un conjunto de checkpoints de PyTorch para un sistema de clasificación visual aplicado al rectificado de cordones de soldadura en placas metálicas, desarrollado por Soumojit Bhattacharya (Soumojit048) como parte del repositorio `grind`. El modelo resuelve dos tareas complementarias en un flujo de rectificado robótico: por un lado, un detector de región de interés (ROI) indica **dónde** debe actuar el robot sobre la placa (mascarado de la costura de soldadura frente a placa desnuda); por otro, un clasificador de rugosidad superficial (RNC, *Relative Norm Contrastive*) estima **qué rugosidad** presenta la superficie, expresada como grado de grano de lija (grit) en una escala ordinal.

La relevancia del modelo reside en su enfoque ligero y específico para robótica industrial: el detector de ROI es una CNN minúscula de 23 873 parámetros que opera de forma totalmente convolucional sobre bloques de imagen, y el clasificador RNC emplea aprendizaje contrastivo con anclas por grano para ser robusto a variaciones de ángulo de captura. Ambos modelos están pensados para inferencia en tiempo real en entornos de fabricación. Cabe señalar que la hipótesis más amplia del proyecto —que la apariencia de la placa codifica el rectificado acumulativo (índice de pasada)— resultó negativa en el conjunto de datos, y el clasificador RNC es el reemplazo basado en textura de esa idea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ROI detector: TinyNet (CNN convolucional, 3 bloques conv3×3 → BN → ReLU, 16/32/64 canales, 2 max-pools, global-avg-pool, Linear(64→1), sigmoid). RNC grader: encoder CNN de 3 capas convolucionales, dimensión de embedding 32 |
| Parametros totales | ROI detector: 23 873. RNC grader: no disponible (encoder de 3 capas, dim 32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de imagen 32×32 para ROI y 64×64 para RNC) |
| Tipos de cuantizacion | No disponible (pesos en formato float32 de PyTorch) |
| Idiomas soportados | No aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (archivos `.pt`) |

## Arquitectura y entrenamiento

El detector de ROI usa `TinyNet`, una CNN secuencial con tres bloques de convolución 3×3 seguidos de normalización por lotes y ReLU, con 16, 32 y 64 canales respectivamente, dos capas de max-pooling, una capa de agrupación promedio global y una cabeza lineal de una salida con sigmoide. Opera de forma totalmente convolucional sobre bloques: desliza una ventana de contexto de 24 píxeles sobre la placa y pinta el bloque central de 12 píxeles con la probabilidad de pertenecer a la costura. Se entrenó con una estrategia *leave-one-pass-out* (11 pases de entrenamiento, 1 de prueba) y aumentos de color y brillo para robustez frente a cambios de iluminación. El muestreo se restringe a la región de la placa definida por su *bounding box* `[500, 412, 713, 519]`.

El clasificador RNC emplea un encoder CNN de 3 capas con dimensión de salida 32, entrenado con aprendizaje contrastivo supervisado (anclas por grano de lija). La inferencia normaliza la iluminación de la imagen de entrada (media y desviación por canal), extrae el embedding, lo normaliza y calcula una mezcla suave de los anclas mediante una softmax con temperatura (`tau`), produciendo una puntuación ordinal continua entre 0 y 6 correspondiente a los grados de grano. La validación *leave-angle-out* reporta una correlación de Spearman de aproximadamente 0.93 frente al grano real. Los datos de entrenamiento provienen de rosbags de sesiones de rectificado; los parches de entrenamiento del detector de ROI no se distribuyen y deben reconstruirse con `scripts/p7_build_samples.py`.

## Capacidades

- Detección de regiones de interés: identifica bloques de la placa que corresponden a costura de soldadura que requiere rectificado, distinguiéndolos de la placa desnuda.
- Clasificación de rugosidad superficial: estima el grado de grano de lija (grit) de una superficie rectificada en una escala ordinal de 0 a 6, basándose en la textura de la imagen.
- Robustez parcial a cambios de iluminación: el detector de ROI incluye aumentos de color y brillo, aunque su rendimiento cae con iluminación azul (F1 0.580 frente a 0.701 en iluminación neutra).
- Inferencia ligera y en tiempo real: ambos modelos tienen un número de parámetros muy reducido, apto para ejecución en CPU o GPU de baja gama.
- Operación totalmente convolucional: el detector de ROI procesa la imagen por bloques deslizantes, lo que permite aplicarlo a placas de tamaño arbitrario dentro del *bounding box* definido.
- Salida probabilística interpretable: el detector devuelve una probabilidad de pertenencia a costura (umbral recomendado 0.80), y el clasificador RNC produce una puntuación ordinal continua con pesos normalizados.

## Casos de uso

- Rectificado robótico autónomo: el robot utiliza el detector de ROI para localizar con precisión los bloques de costura de soldadura que deben ser rectificados, evitando zonas de placa ya limpias. Su naturaleza ligera permite integrarlo en el bucle de control del robot con latencia mínima.
- Control de calidad en fabricación: el clasificador RNC evalúa la rugosidad superficial de una pieza tras el rectificado, comparando la puntuación obtenida con el grano objetivo. Puede usarse como inspección final en línea o como retroalimentación para ajustar parámetros del proceso.
- Inspección visual en celdas de soldadura: el detector de ROI puede montarse en una cámara fija sobre la celda para verificar que la costura ha sido completamente rectificada, marcando bloques residuales que requieren una pasada adicional.
- Investigación en robótica de acabado superficial: el repositorio `grind` documenta el proceso completo de experimentación, incluyendo el análisis de la relación entre apariencia y rugosidad. Los checkpoints sirven como punto de partida para estudios comparativos de métodos de clasificación de textura.
- Sistema de retroalimentación para control de fuerza/presión: la puntuación de rugosidad del RNC puede alimentar un controlador que ajuste la presión o el número de pasadas de la herramienta abrasiva en función de la rugosidad medida, mejorando la consistencia del acabado.
- Benchmark de métodos contrastivos en visión robótica: el clasificador RNC, con su enfoque de anclas por grano y normalización de iluminación, puede utilizarse como referencia para evaluar otras técnicas de aprendizaje contrastivo en dominios de textura industrial.

## Benchmarks y rendimiento

Los resultados publicados en la model card se resumen a continuación. No se han proporcionado comparaciones con otros modelos.

| Tarea | Métrica | Valor |
|---|---|---|
| Detector de ROI (umbral 0.80) | F1 | 0.703 |
| Detector de ROI (umbral 0.80) | Precisión | 0.68 |
| Detector de ROI (umbral 0.80) | Recall | 0.72 |
| Detector de ROI (umbral 0.50) | Recall | 0.91 |
| Detector de ROI, *leave-one-pass-out* (umbral 0.50) | F1 | 0.632 |
| Detector de ROI, pases con iluminación neutra | F1 | 0.701 |
| Detector de ROI, pases con iluminación azul | F1 | 0.580 |
| Clasificador RNC, *leave-angle-out* | Correlación de Spearman (rho) vs grano real | ~0.93 |

## Requisitos de hardware

- El detector de ROI tiene 23 873 parámetros; el clasificador RNC es un encoder de 3 capas con dimensión 32, por lo que ambos son extremadamente ligeros.
- Inferencia en CPU sin problemas: el modelo completo cabe en menos de 1 MB en memoria (el repositorio ocupa 0.1 GB incluyendo caches de embeddings).
- No se requiere GPU para inferencia; cualquier CPU moderna ejecuta ambos modelos en tiempo real (decenas de milisegundos por imagen).
- Si se usa GPU, cualquier modelo de gama baja (p. ej., NVIDIA GTX 1650 o superior) es más que suficiente.
- Despliegue recomendado: PyTorch nativo, con posibilidad de exportar a ONNX para integración en entornos de producción (C++, ROS, etc.).
- El repositorio incluye scripts de inferencia de ejemplo en Python (`scripts/p7_cnn_train.py` y `scripts/shared_grading.py`).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de rugosidad superficial en rectificado robótico) dentro de la documentación proporcionada. El campo de inspección visual de superficies suele emplear redes más grandes (ResNet, EfficientNet) o métodos clásicos de textura, pero no hay datos públicos de comparación directa con este modelo. La comparativa queda, por tanto, no disponible.

## Limitaciones y advertencias

- La hipótesis principal del proyecto (que la apariencia de la placa codifica el rectificado acumulativo y permite recuperar el índice de pasada) resultó negativa en el conjunto de datos; las correlaciones fuertes observadas eran un confundido de iluminación y equipo. El clasificador RNC es el reemplazo basado en textura, pero no debe asumirse que la imagen refleja el historial de rectificado.
- El detector de ROI muestra una caída notable de rendimiento con iluminación azul (F1 0.580 frente a 0.701 en iluminación neutra), lo que limita su robustez en entornos con condiciones de luz variables.
- El clasificador RNC se validó con *leave-angle-out* (variación de ángulo de captura), pero no se reporta su comportamiento frente a cambios de iluminación, que podrían afectar a la estimación de rugosidad.
- Los datos de entrenamiento (rosbags y parches) no se distribuyen públicamente; para reentrenar el detector de ROI es necesario reconstruir los parches con `scripts/p7_build_samples.py` a partir de los datos originales.
- No se han publicado análisis de sesgos ni de comportamiento en superficies fuera del dominio de placas metálicas con cordones de soldadura; la generalización a otros materiales o geometrías no está garantizada.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías de rendimiento en entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Soumojit048/grind-visual-grading
- Repositorio GitHub `grind`: https://github.com/BabaYaga840/grind
- Documentación del detector de ROI: https://github.com/BabaYaga840/grind/blob/main/approaches/visual_grind_grading/ROI_DETECTOR.md
