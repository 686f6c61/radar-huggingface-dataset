# yrpark/openvtla-gear_assembly-dagger_event_still-r3

## Resumen

El modelo `yrpark/openvtla-gear_assembly-dagger_event_still-r3` es un ajuste fino (fine-tune) mediante DAgger del checkpoint base `yrpark/openvtla-gear_assembly`, un modelo de politica robotica basado en la arquitectura pi0.5 (vision-language-action) con un modulo tactil AnyTouch2 y entrenado en el simulador OpenViTac sobre la tarea `gear_assembly` con sensores GelSight Mini. Lo desarrolla el usuario de Hugging Face `yrpark` y el codigo asociado vive en el repositorio `tactile_base` (https://github.com/YuriPark0123/tactile_base).

El problema que aborda es concreto: los modelos anteriores (r1 y r2) entrenados con los datos DAgger sin procesar aprendian a detenerse en la pose de insercion en lugar de continuar girando la pieza. La revision r3 corrige esto eliminando los fotogramas estacionarios de recuperacion del experto (settle-delay) del conjunto de datos, de modo que el modelo no asocie la fase de asentamiento con el final de la tarea.

Se trata de un checkpoint de investigacion de aproximadamente 6,4 GB, entrenado sobre una unica NVIDIA B200 durante unas tres horas, con licencia `other` (no estandarizada) y sin evaluacion en simulador publicada todavia. Es relevante para quienes trabajan en manipulacion robotica con feedback tactil y en recogida de datos con DAgger, ya que documenta de forma reproducible un fallo tipico de etiquetado en tareas de ensamblaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (vision-language-action) + modulo tactil AnyTouch2; fine-tune con LoRA (gemma_2b_lora + gemma_300m_lora) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | openpi checkpoint (directorio `4999/` con `params/` y `assets/`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `yrpark/openvtla-gear_assembly` en el paso 19999 y conserva sus estadisticas de normalizacion. La arquitectura combina la politica vision-language-action pi0.5 con un modulo tactil AnyTouch2 que aporta 18 tokens tactiles (agregacion `cls_pool2`). El ajuste se realiza con LoRA sobre los componentes gemma_2b y gemma_300m, con horizonte de 50 pasos y decodificacion por flow matching para la parte de comportamiento (BC).

Los datos combinan demostraciones scriptadas de `openvitac/gear_assembly_gelsight` con datos DAgger de `openvitac/gear_assembly_dagger_still_gelsight`, muestreados 50:50. El conjunto DAgger contiene 44 episodios y 11.788 fotogramas (39 segmentos de recuperacion y 5 exitos base), tras eliminar 3.330 fotogramas estacionarios del experto de un total de 15.118 mediante `convert_dagger.py --still-keep 3 --still-joint-eps 5e-5`. La funcion de perdida suma al flow matching una cabeza de eventos tactiles (BCE sobre tokens tactiles proyectados, L2-normalizados, temperatura 0,1, peso 0,1, peso positivo 5,0, etiqueta `event_blocked`, con fotogramas de demostracion etiquetados como 0). El entrenamiento consta de 5.000 pasos con batch 64, LR 2,5e-5 con coseno hasta 2,5e-6 y warmup de 200 pasos. La perdida final de entrenamiento se situa entre 0,0034 y 0,0050 en los ultimos pasos registrados (hasta el paso 4950).

La innovacion principal es metodologica: el recorte de fotogramas estacionarios evita que el modelo aprenda a terminar la tarea en la pose de insercion. La cabeza de eventos tactiles solo se usa en entrenamiento; la inferencia es identica a la del modelo base.

## Capacidades

- Generacion de acciones de manipulacion robotica para la tarea de ensamblaje de engranajes (`gear_assembly`) en simulacion.
- Percepcion multimodal que combina vision y senales tactiles de sensores GelSight Mini.
- Control de politica condicionado por instrucciones (arquitectura vision-language-action pi0.5).
- Deteccion implicita de eventos tactiles (`event_blocked`) durante el entrenamiento, orientada a mejorar la recuperacion ante bloqueos.
- Aprendizaje por imitacion con correcciones humanas/experto (DAgger) para recuperacion de fallos.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes de lenguaje.
- Capacidades multilingues: no disponibles (no es un modelo de proposito general de lenguaje).

## Casos de uso

- Investigacion en manipulacion tactil: servir como checkpoint de referencia para estudiar como el recorte de fotogramas estacionarios afecta al aprendizaje de politicas de ensamblaje en simulacion.
- Ensamblaje de engranajes en simulador: ejecutar la politica mediante `serve_policy.py` con la configuracion `openvtla_gear_assembly_dagger_event_still` para evaluar la insercion y el giro de la pieza.
- Reproduccion de experimentos DAgger: reutilizar el pipeline `convert_dagger.py` con los parametros `--still-keep 3 --still-joint-eps 5e-5` para replicar la limpieza de datos y comparar con r1 y r2.
- Base para nuevos ajustes: partir de este checkpoint (paso 4999) para fine-tunes posteriores sobre otras tareas de OpenViTac con sensores GelSight Mini.
- Estudio de cabezas auxiliares: analizar el diseno de la cabeza de eventos tactiles (BCE con peso positivo 5,0) como tecnica de supervision auxiliar en politicas VLA.
- Benchmarking de recuperacion ante bloqueos: comparar el comportamiento del modelo en segmentos de recuperacion frente a los modelos r1 y r2 entrenados con datos sin recortar.
- Docencia y divulgacion: ilustrar en un entorno simulado los fallos tipicos de etiquetado enDAgger y su correccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en simulador esta pendiente ("Simulator evaluation: pending"). El unico dato de rendimiento es la perdida final de entrenamiento (0,0034-0,0050 en los ultimos pasos registrados, incluyendo el termino BCE con peso 0,1).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,4 GB, lo que da una cota inferior orientativa del espacio en disco, pero no se especifica el consumo de VRAM.
- GPU recomendadas: no disponible. El entrenamiento se realizo en 1x NVIDIA B200 (2026-11-26 23:13 a 2026-11-27 02:11 KST, aproximadamente 3 horas).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de politicas de `tactile_base` mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_gear_assembly_dagger_event_still --policy.dir checkpoints/openvtla_gear_assembly_dagger_event_still/r3/4999`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de checkpoint openpi).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Datos DAgger | Cabeza de eventos | Estado de evaluacion | Licencia |
|---|---|---|---|---|---|
| `yrpark/openvtla-gear_assembly-dagger_event_still-r3` (este) | pi0.5 + AnyTouch2 | r1+r2 con fotogramas estacionarios recortados | Si (`event_blocked`) | Pendiente | other |
| `yrpark/openvtla-gear_assembly-dagger_event-r2` | pi0.5 + AnyTouch2 | r1+r2 sin recortar | Si | No disponible en la informacion | other |
| `yrpark/openvtla-gear_assembly` (base) | pi0.5 + AnyTouch2 | Sin DAgger | No documentada | No disponible en la informacion | other |

No se dispone de datos de parametros, contexto ni rendimiento de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion especifico para una unica tarea (`gear_assembly`) en simulacion; no es un modelo de proposito general.
- La evaluacion en simulador esta pendiente, por lo que no hay evidencia publicada de que la correccion del fallo de parada funcione en la practica.
- La cabeza de eventos tactiles solo se usa en entrenamiento; en inferencia no aporta senal explicita de bloqueo.
- Licencia `other` no estandarizada: es necesario revisar los terminos del autor y del modelo base antes de cualquier uso comercial.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma; al ser un modelo de politica robotica, estos conceptos no aplican de forma directa, pero si existe riesgo de comportamiento erroneo fuera de la distribucion de entrenamiento.
- El checkpoint no incluye `train_state/`, solo `params/` y `assets/`; no es posible reanudar el entrenamiento tal cual desde el repositorio.
- Depende de un checkout concreto del codigo `tactile_base` (commit ba26b7b) y de la configuracion `openvtla_gear_assembly_dagger_event_still`.
- El conjunto de datos DAgger es pequeno (44 episodios, 11.788 fotogramas) y procede de una sola tarea y un solo tipo de sensor (GelSight Mini), lo que limita la generalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger_event_still-r3
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Version anterior r2: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger_event-r2
- Dataset de datos: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Codigo `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Documentacion DAgger (referenciada en la model card): `docs/dagger.md` del repositorio `tactile_base`
