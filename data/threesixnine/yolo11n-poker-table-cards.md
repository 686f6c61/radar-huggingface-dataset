# ThreeSixNine/yolo11n-poker-table-cards

## Resumen

yolo11n-poker-table-cards es un detector de objetos YOLO11n afinado por el usuario ThreeSixNine para leer naipes boca arriba en capturas sinteticas de mesas de poker. Parte del checkpoint MIT shrimantasatpati/yolov11_playing_cards_detection y se entrena sobre el benchmark sintetico ThreeSixNine/poker-table-perception-eval (800 imagenes de entrenamiento y 80 de validacion, 1600×900, con variacion de skins, escalas, tipografias y ruido). Mantiene las 52 clases del modelo base con el mismo orden de clases.

El modelo resuelve un problema acotado pero critico en pipelines de vision para poker: la localizacion y clasificacion de cartas en pantalla. En el conjunto de test sintetico (seed 17, 741 cartas, conf 0.1, imgsz 1280) alcanza un IoU de deteccion de 0.999 y una precision de clase de 0.586, frente a 0.193 y 0.119 del checkpoint base. La localizacion esta practicamente resuelta en mesas sinteticas; la precision de clase esta limitada por la confusion entre palo y rango en 52 clases.

La relevancia actual esta en su variante v2 (`best_mixed.pt`), que introduce recortes de cartas reales (gpiosenka, CC0) pegados sobre las escenas sinteticas con jitter de brillo, contraste y desenfoque. Esta estrategia de sim2real duplica aproximadamente la precision de clase en escenas reales (0.316 a 0.735 en el conjunto gunhcolab) sin degradar el rendimiento sintetico. Es un modelo pequeno (YOLO11n), de licencia MIT y entrenado en una a10g-small en unos 31 minutos, lo que lo hace facil de reproducir y desplegar en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; exportable a otros formatos via Ultralytics, no confirmado en la model card) |
| Idiomas soportados | no aplica (vision; sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, Ultralytics); `best.pt` y `best_mixed.pt` |

## Arquitectura y entrenamiento

Se trata de un detector YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, especializada en deteccion de objetos en una sola etapa. El modelo predice cajas delimitadoras y clases para 52 naipes (13 rangos por 4 palos), manteniendo el orden de clases del checkpoint base. La entrada de inferencia recomendada es imgsz 1280, coherente con las capturas de 1600×900 del dataset sintetico.

El entrenamiento se realizo durante 80 epocas con batch 16 e imgsz 1280 sobre 800 renders sinteticos de mesas de poker, con 80 de validacion. El coste fue de aproximadamente 0.53 USD en una a10g-small (31.6 minutos). La variante v2 (`best_mixed.pt`) continua el entrenamiento desde `best.pt` sobre el conjunto `benchmark_2`, donde aproximadamente el 40% de los huecos de carta se rellenan con recortes de cartas reales del split de entrenamiento de gpiosenka (CC0), pegados a escala de mesa con jitter de brillo, contraste y desenfoque. Esta tecnica de cut-paste constituye la innovacion principal del modelo: mejora la transferencia sim2real sin sacrificar el rendimiento en el dominio sintetico.

## Capacidades

- Deteccion de objetos: localiza y clasifica naipes boca arriba en capturas de mesas de poker (52 clases).
- Clasificacion de rango y palo: distingue las 52 combinaciones, con precision limitada por la confusion entre clases visualmente similares.
- Robustez a variacion visual: entrenado con distintas skins, escalas, tipografias y ruido en las capturas sinteticas.
- Inferencia en CPU viable: 0.33 s/imagen en CPU segun la model card, lo que permite despliegue sin GPU.
- Transferencia a escenas reales: la variante mixed mejora la precision de clase en escenas reales (0.735 en gunhcolab) y en recortes aislados (0.469 en gpiosenka).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente un modelo de vision.

## Casos de uso

- Asistencia a la lectura de mesa en herramientas de analisis de poker: el detector procesa capturas de pantalla de la mesa y devuelve las cartas comunitarias y propias, alimentando un motor de calculo de equity o de recomendacion de jugadas.
- Automatizacion de revision de manos (hand history): a partir de capturas de sesiones grabadas, el modelo extrae las cartas visibles para reconstruir el historial y calcular estadisticas de juego.
- Overlays y HUD en tiempo real: integrado en un pipeline de captura de pantalla a baja latencia, marca las cartas detectadas sobre la mesa para entrenamiento o analisis en vivo.
- Generacion de datasets etiquetados: el modelo puede preanotar capturas reales de mesas para revision humana, acelerando la creacion de conjuntos de entrenamiento con datos reales.
- Control de calidad en plataformas de poker online: deteccion de cartas renderizadas incorrectamente o de elementos visuales anomalos en skins y temas personalizados.
- Investigacion en sim2real para vision: el par de checkpoints (`best.pt` y `best_mixed.pt`) sirve como caso de estudio reproducible de cut-paste augmentation y su efecto en la transferencia de dominio.
- Prototipado en dispositivos sin GPU: al ejecutarse en CPU a 0.33 s/imagen, es adecuado para demos y validaciones en entornos sin acelerador.

## Benchmarks y rendimiento

Resultados en el conjunto de test sintetico seed 17 (741 cartas, conf 0.1, imgsz 1280):

| Modelo | IoU de deteccion ≥0.4 | Precision de clase | s/imagen (CPU) |
|---|---|---|---|
| Checkpoint base | 0.193 | 0.119 | 0.36 |
| Este fine-tune (`best.pt`) | 0.999 | 0.586 | 0.33 |

Comparativa cara a cara de las variantes v1 y mixed sobre conjuntos de evaluacion no vistos:

| Evaluacion | FT-v1 (`best.pt`) det / cls | FT-mixed (`best_mixed.pt`) det / cls |
|---|---|---|
| Test sintetico seed 17 | 0.999 / 0.586 | 0.996 / 0.594 |
| Recortes gpiosenka | 0.571 / 0.329 | 0.650 / 0.469 |
| Escenas gunhcolab | 0.929 / 0.316 | 0.990 / 0.735 |

La transferencia a imagenes reales fotografiadas o capturas de Steam no se ha evaluado; la model card la identifica como el siguiente experimento pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; por el tamano de YOLO11n, es esperable que quepa en GPU consumer de gama baja, aunque el dato no esta confirmado.
- GPU recomendadas: no especificadas; el entrenamiento se realizo en una a10g-small (AWS).
- GPU consumer: probablemente compatible con RTX 3060 y superiores por el reducido tamano de YOLO11n, si bien no hay confirmacion en la informacion disponible.
- CPU: viable, con 0.33 s/imagen a imgsz 1280 segun la model card.
- Opciones de despliegue: Ultralytics (`YOLO(w).predict(...)`), con descarga del peso via `huggingface_hub`. Otros backends (ONNX, TensorRT, OpenVINO) no estan documentados en la model card.
- Latencia y throughput: 0.33 s/imagen en CPU; sin datos de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yolo11n-poker-table-cards (este) | no disponible (YOLO11n) | no aplica | IoU 0.999 / cls 0.586 (sintetico); cls 0.735 en escenas reales (mixed) | MIT | Hugging Face |
| shrimantasatpati/yolov11_playing_cards_detection (base) | no disponible | no aplica | IoU 0.193 / cls 0.119 (sintetico) | MIT | Hugging Face |
| Detectores YOLO11n genericos de Ultralytics | no disponible | no aplica | No entrenados en naipes; sin datos comparables en la informacion disponible | AGPL-3.0 (Ultralytics) | GitHub / Ultralytics |

No se dispone de datos de benchmarks de otros detectores especificos de naipes en la informacion proporcionada.

## Limitaciones y advertencias

- Precision de clase limitada: 0.586 en el test sintetico y 0.469 en recortes aislados reales (variante mixed); la confusion entre 52 clases de rango y palo es el principal cuello de botella.
- Transferencia a imagenes reales no evaluada: no se ha probado con fotografias reales ni capturas de Steam; los datos de gunhcolab y gpiosenka son aproximaciones.
- Sesgo de dominio: entrenado sobre renders sinteticos con un conjunto acotado de skins, tipografias y escalas; puede fallar en mesas con estilos visuales no representados.
- Solo cartas boca arriba: no detecta cartas ocultas ni gestiona estados de juego.
- Sin capacidades linguisticas ni de razonamiento: no es un modelo de lenguaje y no debe usarse para tareas de texto.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo base y Ultralytics pueden imponer condiciones adicionales (Ultralytics distribuye su framework bajo AGPL-3.0); conviene revisar la compatibilidad antes de un despliegue comercial.
- Riesgo de falsos positivos en entornos con elementos visuales similares a naipes (iconos, avatares, decoracion de la mesa).
- Sin datos de sesgos etnicos o sociales: al ser un detector de objetos, el riesgo relevante es el sesgo de dominio visual, no el social.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThreeSixNine/yolo11n-poker-table-cards
- Modelo base: https://huggingface.co/shrimantasatpati/yolov11_playing_cards_detection
- Dataset de evaluacion: https://huggingface.co/datasets/ThreeSixNine/poker-table-perception-eval
- Ultralytics (framework): https://github.com/ultralytics/ultralytics
- Dataset gpiosenka (cartas reales, CC0): no disponible el enlace directo en la informacion proporcionada
- Dataset gunhcolab: no disponible el enlace directo en la informacion proporcionada
