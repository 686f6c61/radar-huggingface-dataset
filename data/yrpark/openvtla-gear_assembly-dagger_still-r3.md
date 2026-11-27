# yrpark/openvtla-gear_assembly-dagger_still-r3

## Resumen

`openvtla_gear_assembly_dagger_still` (revision r3) es un ajuste fino mediante DAgger del modelo base OpenVTLA `yrpark/openvtla-gear_assembly`, desarrollado por el usuario de Hugging Face yrpark. Se trata de una politica robotica visio-tactil construida sobre la arquitectura pi0.5 (OpenPI) combinada con el modulo tactil AnyTouch2 de OpenViTac, orientada a la tarea de simulacion `gear_assembly` (ensamblaje de engranajes) con sensores GelSight Mini. El modelo no es un LLM de proposito general, sino un modelo de accion para control robotico que consume observaciones visuales y tactiles y produce comandos motores.

La relevancia de esta revision r3 reside en la correccion de un fallo de comportamiento detectado en las revisiones r1 y r2: los modelos entrenados sobre los datos DAgger sin depurar aprendian a detenerse en la pose de insercion en lugar de continuar girando el engranaje. Para solucionarlo, r3 recorta los fotogramas estacionarios (settle-delay) de las recuperaciones expertas antes de convertir los datos, eliminando 3.330 fotogramas estaticos de un total de 15.118. El resultado son 44 episodios y 11.788 fotogramas utiles.

El modelo se distribuye como checkpoint OpenPI de 6,4 GB con pesos en formato propietario de OpenPI (`params/`), licencia "other" y sin pipeline declarado. No se han publicado resultados de evaluacion en simulador (marcados como pendientes) ni benchmarks de ningun tipo en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (OpenPI) con modulo tactil AnyTouch2; ajuste fino con LoRA (gemma_2b_lora + gemma_300m_lora) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no linguistico) |
| Licencia | other |
| Formato de pesos | checkpoint OpenPI (`params/` para inferencia, `assets/` con estadisticas de normalizacion; `train_state/` no incluido) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `yrpark/openvtla-gear_assembly` en el paso 19999, conservando sus estadisticas de normalizacion, y se ajusta con LoRA sobre los modulos `gemma_2b_lora` y `gemma_300m_lora`. La tarea combina entrada visual y tactil: 18 tokens tactiles generados mediante `cls_pool2` a partir de sensores GelSight Mini. El horizonte de prediccion es de 50 pasos. La funcion de perdida es exclusivamente flow matching (behavior cloning); no se emplea RLHF ni DPO. Existe una cabeza de eventos (`event_blocked`) que solo se usa durante el entrenamiento y no interviene en inferencia.

Los datos de entrenamiento combinan demos scripted del dataset `openvitac/gear_assembly_gelsight` y datos DAgger de `openvitac/gear_assembly_dagger_still_gelsight`, muestreados 50:50. El conjunto DAgger procede de los rollouts r1 y r2 con recorte de fotogramas estacionarios mediante `convert_dagger.py --still-keep 3 --still-joint-eps 5e-5`, resultando en 44 episodios y 11.788 fotogramas (39 segmentos de recuperacion y 5 exitos base). El entrenamiento se ejecuto durante 5.000 pasos con batch de 64 (sin acumulacion de gradiente), LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 y warmup de 200 pasos, en una unica NVIDIA B200 durante aproximadamente tres horas (2026-11-27, 02:13 a 05:11 KST). La perdida final de entrenamiento se situo en 0,0007-0,0008 en los ultimos pasos registrados.

## Capacidades

- Control robotico visio-tactil para tareas de ensamblaje de precision en simulacion.
- Prediccion de acciones motoras condicionada por observaciones visuales y lecturas de sensores tactiles GelSight Mini.
- Aprendizaje por imitacion con correccion humana iterativa (DAgger), que permite recuperarse de estados de fallo introducidos por la propia politica.
- Representacion tactil compacta de 18 tokens mediante `cls_pool2`, adecuada para integrar senales de contacto de alta frecuencia.
- Capacidad de recuperacion ante bloqueos (`event_blocked`), aprendida durante el entrenamiento aunque no expuesta en inferencia.
- No soporta tool calling, function calling, agentes multi-paso ni generacion de texto; no es un modelo linguistico.
- Capacidades multilingues: no aplicables.

## Casos de uso

- Ensamblaje de engranajes en simulacion: el modelo ejecuta la secuencia de insercion y giro sobre la tarea `gear_assembly` con entrada visual y tactil, sirviendo como punto de partida para experimentos de manipulacion de precision.
- Investigacion en aprendizaje por imitacion con DAgger: permite reproducir el pipeline completo (recoleccion de rollouts, recorte de fotogramas estaticos, conversion y ajuste fino con LoRA) sobre una politica pi0.5, util para estudiar como afecta la depuracion de datos al comportamiento aprendido.
- Estudio de integracion visio-tactil: el uso de AnyTouch2 y GelSight Mini con 18 tokens tactiles permite analizar el impacto de la senal de contacto en tareas donde la vision sola es insuficiente (insercion, ajuste fino, deteccion de bloqueo).
- Base para ajustes finos en tareas de montaje similares: al conservar las estadisticas de normalizacion del modelo base y una configuracion OpenPI estandar, puede reutilizarse como inicializacion para otras tareas de ensamblaje con sensores tactiles.
- Evaluacion comparativa de politicas en simulador: util para medir el efecto de eliminar fotogramas estacionarios en el entrenamiento frente a las revisiones r1 y r2, que mostraban el fallo de detencion prematura.
- Despliegue en pipelines de investigacion con OpenPI: el checkpoint se sirve mediante `scripts/serve_policy.py` de `tactile_base`, lo que facilita integrarlo en entornos de evaluacion automatizada.
- Reproducibilidad de experimentos: el repositorio incluye `train_log.txt` y referencias al commit del dataset (`968f888d35`), lo que permite auditar el entrenamiento y replicar condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en simulador esta pendiente ("Simulator evaluation: pending"). El unico dato de rendimiento disponible es la perdida final de entrenamiento (flow loss 0,0007-0,0008 en los ultimos pasos registrados), que no constituye una metrica de evaluacion de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,4 GB, lo que da una cota inferior aproximada del espacio en disco necesario para los pesos; la VRAM depende del backend OpenPI y del modo de ejecucion.
- GPU de entrenamiento documentada: 1x NVIDIA B200 (unos 180 GB de memoria HBM3e), suficiente para el ajuste fino con LoRA en batch 64 durante aproximadamente tres horas.
- GPU recomendadas para inferencia: no disponibles en la informacion proporcionada. Por el tamano del checkpoint, es plausible que quepa en GPUs de gama alta con memoria suficiente, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: servidor de politicas de `tactile_base` mediante `uv run scripts/serve_policy.py policy:checkpoint --policy.config openvtla_gear_assembly_dagger_still --policy.dir checkpoints/openvtla_gear_assembly_dagger_still/r3/4999`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tactil | Datos DAgger | Estado de evaluacion | Licencia |
|---|---|---|---|---|---|
| `yrpark/openvtla-gear_assembly-dagger_still` (r3) | pi0.5 + AnyTouch2 | Si (GelSight Mini, 18 tokens) | r1+r2 con recorte de fotogramas estaticos (11.788 frames) | Pendiente | other |
| `yrpark/openvtla-gear_assembly-dagger-r2` | pi0.5 + AnyTouch2 | Si | r1+r2 sin recorte | No disponible | other |
| `yrpark/openvtla-gear_assembly` | pi0.5 + AnyTouch2 | Si | Solo demos scripted (sin DAgger) | No disponible | other |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con politicas externas, por lo que la comparativa se limita a la configuracion de entrenamiento y la procedencia de los datos.

## Limitaciones y advertencias

- Modelo de accion especifico para una unica tarea (`gear_assembly`) y un unico tipo de sensor (GelSight Mini); no es generalizable sin ajuste fino adicional.
- Evaluacion en simulador pendiente: no hay evidencia publicada de que la correccion del fallo de detencion prematura funcione en la practica.
- Entrenado exclusivamente en simulacion; no se documenta transferencia a robot real (sim-to-real no evaluado).
- Licencia "other": es necesario revisar los terminos exactos antes de cualquier uso comercial; no se especifican restricciones en la model card.
- No se incluye `train_state/` en el checkpoint, lo que impide reanudar el entrenamiento desde ese punto.
- El conjunto DAgger es muy pequeno (44 episodios, 11.788 fotogramas) y desequilibrado en la senal de evento (`event_blocked`: 9.132 ceros frente a 2.250 y 406), lo que puede limitar la robustez ante estados de bloqueo no vistos.
- Riesgo de sobreajuste a las condiciones de simulacion y a la distribucion de demos scripted; no se documentan sesgos especificos.
- Sin informacion sobre idiomas, contexto o cuantizacion, dado que no es un modelo linguistico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger_still-r3
- Modelo base: https://huggingface.co/yrpark/openvtla-gear_assembly
- Revision previa r2: https://huggingface.co/yrpark/openvtla-gear_assembly-dagger-r2
- Dataset de entrenamiento: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Codigo `tactile_base`: https://github.com/YuriPark0123/tactile_base
- Documentacion del procedimiento DAgger: `docs/dagger.md` en el repositorio `tactile_base`
