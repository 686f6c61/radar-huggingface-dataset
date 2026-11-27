# yrpark/seg-loom-models

## Resumen

seg-loom models es una coleccion de checkpoints de la etapa 1 (stage-1) del proyecto seg-loom, un sistema de vision por computador orientado a robotica. El modelo resuelve dos tareas simultaneas: segmentacion de robots (en modalidad amodal y visible) y estimacion de un campo denso de desplazamiento 2D para el registro de camaras. Lo desarrolla el autor identificado en Hugging Face como yrpark, vinculado al repositorio GitHub YuriPark0123/seg-loom.

Los checkpoints se entrenaron sobre el dataset publicado por el mismo autor, yrpark/seg-loom, compuesto por 10 carpetas en `train/` y 5 carpetas en `train_clutter/`, y se evaluan sobre una particion `eval/` con 54 robots reservados. El repositorio ocupa 0,9 GB e incluye pesos en formato PyTorch (`.pt`), no en safetensors ni GGUF.

Es relevante para quienes trabajan en percepcion robotica y calibracion de camaras, porque combina segmentacion con registro geometrico denso en una sola red y publica metricas de evaluacion explicitas (IoU, error de rotacion en grados y error de traslacion en centimetros). No obstante, la informacion publica es muy limitada: cero descargas, cero likes y ausencia de datos sobre arquitectura interna, numero de parametros o contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red `Stage1Net` definida en `scripts/train_stage1.py`; no se detalla la topologia) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other (licencia no estandar; requiere consultar terminos del autor) |
| Formato de pesos | PyTorch `.pt` (diccionario con `net`, `opt`, `sched`, `step`, `args`, `data`, `time`) |
| Tamano del repositorio | 0,9 GB |
| Checkpoints publicados | `stage3.4_end_step76000`, `stage3.5_final_step209628` |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de `Stage1Net` mas alla de que se instancia con `Stage1Net(pretrained=False)` y se carga mediante `load_state_dict`. Por los tags y las tareas declaradas (segmentacion amodal/visible y desplazamiento denso 2D) cabe esperar una red convolutional o transformer de vision con dos cabezas, pero la informacion proporcionada no confirma ni la familia de backbone ni el numero de parametros.

El entrenamiento se realizo con `scripts/train_stage1.py` sobre el dataset `yrpark/seg-loom`, con dos conjuntos: `train/` (10 carpetas) y `train_clutter/` (5 carpetas, presumiblemente escenas con oclusiones o desorden). La evaluacion se hace sobre una particion `eval/` de 54 robots con la lente fijada ("lens-fixed"). Los checkpoints incluyen el estado del optimizador y del scheduler, lo que permite reanudar el entrenamiento. No se documentan numero de tokens ni de imagenes, composicion exacta del dataset, ni si hubo tecnicas de aumento o regularizacion especificas.

## Capacidades

- Segmentacion de robots en dos modalidades: amodal (mascara completa, incluyendo partes ocluidas) y visible (solo la region observable).
- Estimacion de un campo denso de desplazamiento 2D entre imagenes, orientado al registro de camaras.
- Prediccion de pose relativa de camara a partir del desplazamiento: la evaluacion reporta error de rotacion en grados y de traslacion en centimetros.
- Funcionamiento en escenas con clutter (entrenado con el subconjunto `train_clutter/`).
- Inferencia en CPU o GPU mediante PyTorch (`map_location="cpu"` en el ejemplo de carga).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingue, vision general, audio ni modos de pensamiento.

## Casos de uso

- Calibracion y registro de camaras en celulas robotizadas: el modelo estima el desplazamiento 2D denso y la pose relativa (rotacion y traslacion), lo que permite alinear la camara respecto a una referencia sin marcadores fisicos, usando el checkpoint `stage3.5_final_step209628` con error de rotacion de 3,26 grados y traslacion de 3,61 cm.
- Manipulacion robotica con oclusiones: la segmentacion amodal permite inferir la extension completa del robot aunque parte quede tapada por objetos, util en tareas de agarre en entornos desordenados.
- Seguimiento de efector final: la mascara visible (IoU 0,782 en el mejor checkpoint) sirve para localizar el brazo o la pinza en tiempo real y realimentar el control.
- Verificacion de seguridad en espacios compartidos: detectar la silueta del robot en imagenes de vigilancia para evitar colisiones con operarios, apoyandose en la mascara amodal.
- Reentrenamiento y ajuste fino: al incluir `opt`, `sched` y `args` en el checkpoint, un equipo puede reanudar el entrenamiento con sus propios datos de robot siguiendo `scripts/train_stage1.py`.
- Investigacion en segmentacion amodal: el par de checkpoints y las metricas publicadas permiten reproducir la evaluacion con `scripts/eval_stage1.py` y comparar variantes.
- Generacion de datos sinteticos o anotacion asistida: usar las mascaras predichas para preetiquetar nuevos frames y reducir el coste de anotacion manual.

## Benchmarks y rendimiento

Metricas publicadas en la model card sobre la particion `eval/` (54 robots, lente fijada):

| Checkpoint | IoU all (amodal / visible) | IoU real (amodal / visible) | Rotacion (grados) | Traslacion (cm) |
|---|---|---|---|---|
| stage3.4_end_step76000 | 0,762 / 0,758 | 0,579 / 0,571 | 3,29 | 3,60 |
| stage3.5_final_step209628 | 0,784 / 0,782 | 0,572 / 0,567 | 3,26 | 3,61 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, HumanEval, etc.), que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio pesa 0,9 GB, por lo que la inferencia en FP32 probablemente quepa en GPUs consumer, pero no se confirma el tamano del modelo.
- GPU recomendadas: no disponible. El ejemplo de la model card carga el checkpoint en CPU, lo que sugiere que la inferencia es viable sin GPU dedicada.
- Compatibilidad con GPU consumer: probable pero no confirmada; no hay datos de parametros ni de memoria pico.
- Despliegue: PyTorch nativo (carga con `torch.load` y `Stage1Net`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion amodal de robots ni de registro de camaras, ni datos de parametros o rendimiento de alternativas.

## Limitaciones y advertencias

- Informacion muy escasa: sin datos de arquitectura, parametros ni dataset, la evaluacion independiente es dificil.
- Licencia "other": no es una licencia estandar; es imprescindible revisar los terminos del autor antes de cualquier uso comercial.
- Modelo de vision especifico para robots: no es un modelo de lenguaje y no soporta texto, codigo ni conversacion.
- Evaluacion limitada a 54 robots con la lente fijada; el rendimiento en otras camaras, opticas o dominios no esta validado.
- Error de traslacion de aproximadamente 3,6 cm y rotacion de 3,26 grados: puede ser insuficiente para tareas de precision subcentimetrica.
- El IoU "real" (0,572-0,579) es notablemente inferior al IoU global (0,762-0,784), lo que sugiere una brecha entre el rendimiento agregado y el de instancias reales.
- Sin descargas ni likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Riesgo de sobreajuste al dataset del propio autor, dado que entrenamiento y evaluacion provienen del mismo proyecto.
- No se documentan sesgos, pero al ser un modelo visual puede fallar ante robots, iluminaciones o fondos distintos a los de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/yrpark/seg-loom-models
- Dataset: https://huggingface.co/datasets/yrpark/seg-loom
- Repositorio GitHub: https://github.com/YuriPark0123/seg-loom
