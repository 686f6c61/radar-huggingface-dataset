# SteveNguyen/reachy-mini-floor-seg-dev

## Resumen

`reachy-mini-floor-seg-dev` es un conjunto de modelos de segmentación de imagen orientados a robótica, publicados por el usuario SteveNguyen en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de una colección de checkpoints de segmentación semántica de suelo (floor segmentation) entrenados específicamente para la navegación del robot Reachy Mini. El repositorio contiene versiones de desarrollo, no una release estable, con pesos en formato PyTorch (`best.pt`, `last.pt`) y exportaciones ONNX (`floor.onnx`) listas para inferencia en el robot.

La arquitectura empleada es LR-ASPP sobre un backbone MobileNetV3, con una entrada de 320 x 192 píxeles. El modelo más pequeño ronda los 3,2 M de parámetros en su variante Large. La tarea principal es clasificar cada píxel de la imagen de la cámara como suelo o no suelo, y adicionalmente detectar regiones de suelo que quedan por debajo de muebles ("under"), de modo que el robot pueda distinguir zonas transitables de zonas ocupadas por obstáculos.

El interés actual del modelo es acotado pero relevante: demuestra un pipeline completo de segmentación para robótica móvil de bajo coste, entrenado sobre datos sintéticos generados con ProcTHOR-10K y validado en 50 fotogramas reales etiquetados a mano. La licencia Apache 2.0 permite su reutilización comercial, aunque su especialización extrema y su estado de desarrollo limitan su uso fuera del contexto del proyecto Reachy Mini.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LR-ASPP con backbone MobileNetV3 (variantes Small y Large) |
| Parámetros totales | 3,2 M (variante MobileNetV3-Large en `v6_mix_large`); no disponible para el resto de variantes |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 320 x 192 píxeles) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan cuantizaciones INT8/FP16) |
| Idiomas soportados | no aplica (modelo de segmentación de imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`best.pt`, `last.pt`) y ONNX (`floor.onnx`) |

## Arquitectura y entrenamiento

El modelo es una red de segmentación semántica con arquitectura LR-ASPP (Lightweight RefineNet con Atrous Spatial Pyramid Pooling) sobre un backbone MobileNetV3. La entrada es una imagen RGB de 320 x 192 píxeles y la salida son tres canales de logits: los canales 0 y 1 representan la probabilidad de suelo frente a no suelo (softmax sobre ambos), y el canal 2 representa la probabilidad de "under" (sigmoid, con significado solo sobre píxeles de suelo). La decisión de zona transitable se calcula como `floor > 0.7` y `not under > 0.5`.

El entrenamiento se realizó sobre datos sintéticos generados con ProcTHOR-10K, un conjunto de casas renderizadas. Se definen tres conjuntos de render: `thor_v1` (9.929 vistas de cámara baja, etiquetas suelo/no suelo), `thor_v2` (añade vistas de sobremesa y etiqueta como no suelo el suelo bajo muebles bajos; abandonado porque el modelo empezó a dudar del suelo abierto) y `thor_v3` (escenas nuevas, clutter sobre el suelo, vistas de sobremesa y un mapa `_under.png` generado a partir de un render de profundidad hacia arriba). La validación se hace sobre casas con índice múltiplo de 10, nunca vistas en entrenamiento. Todos los modelos se entrenaron 30 épocas con retexturizado de suelo (`--tex`). No se documenta uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión.

## Capacidades

- Segmentación semántica de suelo píxel a píxel en imágenes RGB de 320 x 192.
- Detección de la región de suelo que queda por debajo de muebles ("under"), útil para distinguir zonas transitables de zonas ocupadas.
- Salida de tres canales (floor/no-floor/under) con umbrales configurables (cutoff 0.5 o 0.7 para floor; 0.5 para under).
- Exportación a ONNX para inferencia en el robot Reachy Mini.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No es un modelo de generación de texto, código, matemáticas, visión general ni audio.

## Casos de uso

- Navegación autónoma de Reachy Mini: el modelo proporciona un mapa de suelo transitable que el robot usa para planificar trayectorias. En simulación de bucle cerrado (16 casas, misma semilla) la variante `v7_floor_under` recorrió 4,19 m de media frente a 3,43 m de la variante B, y evitó un obstáculo con el que B colisionó.
- Detección de obstáculos bajos: el canal "under" permite identificar suelo ocupado por muebles o clutter, de modo que el robot no intente atravesar zonas no transitables.
- Segmentación en tiempo real en hardware embebido: al ser un modelo de 3,2 M de parámetros con entrada 320 x 192 y exportación ONNX, es adecuado para inferencia en CPU o GPU de baja potencia integrada en el robot.
- Validación de pipelines de percepción: el repositorio incluye `metrics.jsonl` por época y comparativas de IoU sintético y real, lo que permite auditar el rendimiento antes de desplegar en el robot.
- Investigación en sim-to-real para robótica: el modelo documenta el efecto de distintos conjuntos de render sintético (thor_v1, thor_v2, thor_v3) sobre el IoU en fotogramas reales, útil para estudiar transferencia de dominio.
- Prototipado de segmentación semántica de bajo coste: sirve como base para tareas de segmentación binaria (suelo/no suelo) en entornos domésticos renderizados.

## Benchmarks y rendimiento

Los datos disponibles son de IoU de segmentación de suelo, no de benchmarks estándar de NLP o visión general.

| Modelo | Datos | Salidas | IoU sintético (val) | IoU real, cutoff 0.5 / 0.7 |
|---|---|---|---|---|
| B (`floor_v3_neg`, solo local) | thor_v1 | floor | 0,947 | 0,911 / 0,896 |
| `v5_under` | thor_v3 | floor + under | 0,933 | 0,822 / 0,773 |
| `v6_mix_small` | thor_v1 + thor_v3 | floor + under | 0,940 | 0,870 / 0,829 |
| `v6_mix_large` (MobileNetV3-Large, 3,2 M) | thor_v1 + thor_v3 | floor + under | 0,953 | 0,875 / 0,839 |
| `v7_floor_under` | thor_v1 + thor_v3 (sin vistas de sobremesa) | floor + under | 0,946 | 0,889 / 0,877 |
| `v7_floor_only` | igual que v7_floor_under | floor | 0,951 | 0,895 / 0,873 |

El IoU real se mide sobre 50 fotogramas domésticos etiquetados a mano (privados, no publicados). El conjunto de validación sintético varía entre grupos (v5 y v6 incluyen vistas de sobremesa), por lo que la columna sintética solo es comparable dentro de cada grupo.

Para el canal "under" en `v7_floor_under` sobre validación `thor_v3` (892 vistas de suelo):

| Cutoff | IoU estricto / precisión / recall | IoU laxo / precisión (falsa alarma bajo algo < 1 m no contabilizada) |
|---|---|---|
| 0,3 | 0,402 / 0,59 / 0,56 | 0,437 / 0,67 |
| 0,5 | 0,358 / 0,73 / 0,41 | 0,373 / 0,80 |

La mayor parte del desacuerdo está en los contornos (a menos de 6 px del borde de la etiqueta) y en mesas pequeñas (superficie entre 0,45 y 1 m) clasificadas como "under". No se ha verificado en fotogramas reales por falta de etiquetas "under".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño (3,2 M de parámetros) y la entrada (320 x 192), la huella es muy reducida.
- GPU recomendadas: no disponible; el modelo está pensado para ejecutarse en el propio robot Reachy Mini, presumiblemente en CPU o en una GPU integrada de baja potencia.
- Cabe en GPU de consumo: sí, con toda probabilidad, dado el reducido número de parámetros, aunque no se documentan requisitos concretos.
- Opciones de despliegue: exportación ONNX (`floor.onnx`) para inferencia en el robot; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas dentro del propio repositorio son las variantes B, `v5_under`, `v6_mix_small`, `v6_mix_large`, `v7_floor_under` y `v7_floor_only`, comparadas en la sección de benchmarks. No se han identificado modelos externos de segmentación de suelo para robótica con los que establecer una comparación documentada.

## Limitaciones y advertencias

- Modelo en estado de desarrollo: el autor indica explícitamente que son versiones de trabajo, no una release.
- Especialización extrema: solo segmenta suelo y región "under"; no sirve para otras tareas de visión ni para texto.
- El canal "under" no se ha validado en fotogramas reales por ausencia de etiquetas; su rendimiento en el mundo real es incierto.
- El IoU real se midió sobre solo 50 fotogramas domésticos privados, lo que limita la generalización de las cifras.
- Sesgos conocidos: no documentados; el entrenamiento con datos sintéticos de ProcTHOR-10K puede introducir sesgos hacia la apariencia de esas escenas renderizadas.
- Riesgo de fallo en condiciones no representadas: el autor señala que la brecha de ~0,02 IoU frente a la variante B se concentra en dos fotogramas (azulejos oscuros y brillantes con luz solar, y una alfombrilla de baño de madera con listones).
- Las vistas de sobremesa perjudican el IoU real (v6 frente a v7), lo que obligó a excluirlas en la variante v7.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantías y su idoneidad para producción fuera del proyecto Reachy Mini no está demostrada.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) por no ser un modelo de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SteveNguyen/reachy-mini-floor-seg-dev
- Repositorio del código `floor_seg`: no disponible como enlace directo en la información proporcionada (el autor lo menciona como `floor_seg` repo).
- Conjunto de datos ProcTHOR-10K: no disponible como enlace directo en la información proporcionada.
- Paper o blog del modelo: no disponible.
