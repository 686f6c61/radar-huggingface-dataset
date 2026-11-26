# yrpark/openvtla-grasp_chip-dagger_event-r2

## Resumen

`yrpark/openvtla-grasp_chip-dagger_event-r2` es un fine-tune del modelo base `yrpark/openvtla-grasp_chip`, un sistema de vision-lenguaje-accion-tacto (VTLA) construido sobre pi0.5 combinado con AnyTouch2. Lo desarrolla el usuario de Hugging Face yrpark dentro del ecosistema OpenViTac y la libreria `tactile_base`. El modelo resuelve una tarea de manipulacion robotica muy concreta: el agarre de una ficha (chip) en simulacion con un sensor tactil GelSight Mini, incorporando senal tactil ademas de vision y lenguaje.

La relevancia de esta revision (r2) esta en el metodo de entrenamiento: es un fine-tune con DAgger (Dataset Aggregation) sobre el checkpoint base, combinando demostraciones scriptadas con datos de correccion humana recogidos en linea. El objetivo es mejorar la robustez ante perturbaciones de deslizamiento (slip) que el modelo base no cubria. Incorpora una cabeza auxiliar de eventos tactiles (`event_impact`) que solo se usa durante el entrenamiento.

Se trata de un artefacto de investigacion muy experimental: cero descargas, cero likes, evaluacion en simulador pendiente y una licencia "other" sin terminos publicos. No es un modelo de proposito general ni un LLM conversacional, sino una politica de control entrenada para un banco de pruebas especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Tactile-Action (VTLA) basada en pi0.5 con backbone Gemma (gemma_2b + gemma_300m), fine-tune con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin terminos especificados en la model card) |
| Formato de pesos | checkpoint openpi (`params/` para inferencia, `assets/` con estadisticas de normalizacion; sin `train_state/`) |

## Arquitectura y entrenamiento

El modelo parte de pi0.5, una politica VLA con backbone de lenguaje Gemma (variantes de 2B y 300M) adaptada mediante LoRA (`gemma_2b_lora` y `gemma_300m_lora`). Sobre esa base, OpenViTac anade la modalidad tactil: se procesan 18 tokens tactiles mediante `cls_pool2` procedentes de un sensor GelSight Mini en simulacion. La salida de accion se genera con flow matching, y el entrenamiento anade una cabeza de eventos tactiles que aplica BCE sobre los tokens tactiles proyectados y normalizados en L2 (temperatura 0.1, inicializacion a cero), con peso 0.1 y peso positivo 5 sobre la etiqueta `event_impact`.

Los datos combinan demostraciones scriptadas del dataset `openvitac/grasp_chip_gelsight` y datos DAgger de `openvitac/grasp_chip_dagger_gelsight`, muestreados 50:50. La porcion DAgger (r1+r2) suma 59 episodios y 26.336 fotogramas, con 25 segmentos de correccion y 34 exitos base; la etiqueta de evento esta muy desbalanceada (272 positivos frente a 26.064 negativos), de ahi el peso positivo. El entrenamiento se ejecuto 5.000 pasos con batch 64, LR 2.5e-5 con decaimiento coseno hasta 2.5e-6 y warmup de 200, en una unica NVIDIA B200 durante aproximadamente 3 horas. La perdida final de entrenamiento se situo entre 0.0022 y 0.0039 en los ultimos pasos registrados.

## Capacidades

- Control robotico de agarre (grasping) de una ficha en simulacion, condicionado por vision, lenguaje y lectura tactil.
- Percepcion tactil mediante GelSight Mini, integrada como 18 tokens en el modelo.
- Deteccion implicita de eventos de impacto/deslizamiento durante el entrenamiento (cabeza `event_impact`, no usada en inferencia).
- Generacion de trayectorias de accion por flow matching con horizonte de 50 pasos.
- Aprendizaje por imitacion combinado con correcciones DAgger para mejorar la robustez ante perturbaciones.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni dialogo multilingue.

## Casos de uso

- Investigacion en manipulacion tactil: sirve como punto de partida reproducible para estudiar como la senal tactil mejora el agarre en tareas de contacto, gracias a la integracion de tokens GelSight en pi0.5.
- Estudio de DAgger en robotica: el modelo y su log de entrenamiento permiten analizar el efecto de mezclar demostraciones scriptadas con correcciones humanas sobre el rendimiento final.
- Deteccion de eventos de contacto: la cabeza `event_impact` puede reutilizarse como senal auxiliar de investigacion para etiquetar impactos o deslizamientos en series tactiles.
- Benchmark de politicas VTLA: al estar empaquetado como checkpoint openpi, se puede servir con `serve_policy.py` y comparar frente al checkpoint base en el mismo entorno simulado.
- Base para nuevos fine-tunes: su naturaleza LoRA y su estructura de checkpoint facilitan adaptaciones a otras tareas de agarre dentro de OpenViTac.
- Reproduccion de experimentos: el log completo y los datos referenciados (commit `4c973c772e`) permiten replicar el pipeline de entrenamiento en hardware similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en simulador esta pendiente. El unico dato de rendimiento es la perdida de entrenamiento final (0.0022-0.0039 en los ultimos pasos), que no constituye una metrica de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamano total de pi0.5 + Gemma, no desglosado en la informacion).
- GPU de entrenamiento documentada: 1x NVIDIA B200 (aproximadamente 3 horas para 5.000 pasos).
- GPU recomendadas para inferencia: no disponible; por el uso de Gemma 2B como backbone, se requeriria una GPU con memoria suficiente para el modelo completo, aunque no se especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de politicas de `tactile_base` mediante `uv run scripts/serve_policy.py` con configuracion `openvtla_grasp_chip_dagger_event`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Modalidad tactil | Metodo | Licencia | Estado |
|---|---|---|---|---|---|
| openvtla-grasp_chip-dagger_event-r2 | pi0.5 + AnyTouch2 | Si (GelSight Mini) | DAgger + flow matching | other | Experimental, evaluacion pendiente |
| yrpark/openvtla-grasp_chip (base) | pi0.5 + AnyTouch2 | Si (GelSight Mini) | Imitacion scriptada | other | Checkpoint base, step 19999 |
| pi0.5 (referencia) | Gemma | No | VLA general | no disponible | Modelo general de referencia |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para una unica tarea de agarre en simulacion; no generaliza a otras tareas sin reentrenamiento.
- Evaluacion en simulador pendiente: no hay evidencia publicada de que mejore al checkpoint base.
- Licencia "other" sin terminos publicos: el uso comercial es incierto y requiere contactar con el autor.
- Sin informacion sobre sesgos, idiomas ni robustez fuera del dominio simulado.
- El dataset de eventos esta muy desbalanceado (272 positivos frente a 26.064 negativos), lo que puede limitar la fiabilidad de la cabeza de eventos.
- La cabeza `event_impact` no se usa en inferencia; el modelo desplegado no expone deteccion de eventos en produccion.
- Cero descargas y cero likes: ausencia de validacion por parte de la comunidad.
- Dependencia del ecosistema `tactile_base` y del simulador OpenViTac; la portabilidad a otros entornos no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yrpark/openvtla-grasp_chip-dagger_event-r2
- Modelo base: https://huggingface.co/yrpark/openvtla-grasp_chip
- Dataset de entrenamiento: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Repositorio de codigo `tactile_base`: https://github.com/YuriPark0123/tactile_base
