# yrpark/openvtla-insert_USB-dagger_event-r1

## Resumen

`openvtla-insert_USB-dagger_event-r1` es un fine-tune del modelo base `yrpark/openvtla-insert_USB`, desarrollado por el usuario yrpark. Se trata de un modelo de politica visomotora-tactil para control robotico, construido sobre la arquitectura pi0.5 (un modelo vision-language-action) combinada con el encoder tactil AnyTouch2 y el entorno de simulacion OpenViTac. La tarea concreta es la insercion de un conector USB, con senal tactil proveniente de sensores GelSight Mini.

El modelo aplica la tecnica DAgger (Dataset Aggregation) sobre el checkpoint base entrenado con demostraciones scriptadas, incorporando datos de recuperacion recogidos en linea para corregir los fallos del modelo base. Ademas del entrenamiento de imitacion por flow matching, incorpora una cabeza auxiliar de eventos tactiles (`event_jam`) que solo se usa durante el entrenamiento, no en inferencia. El resultado es un checkpoint de 6,4 GB en formato openpi.

Es relevante en el contexto de la robotica de manipulacion con tacto: demuestra un pipeline completo de entrenamiento con LoRA sobre modelos VLA de gran tamano (Gemma 2B + Gemma 300M como componentes del backbone pi0.5), con datos multimodales (vision, tacto y acciones) y un esquema de correccion iterativa. No obstante, la evaluacion en simulador esta pendiente y no hay benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en pi0.5 (backbone Gemma 2B + Gemma 300M) con encoder tactil AnyTouch2 y cabeza de eventos tactiles |
| Parametros totales | no disponible (pesos en repo de 6,4 GB; entrenamiento con LoRA sobre gemma_2b_lora + gemma_300m_lora) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas, no a texto general) |
| Licencia | other |
| Formato de pesos | checkpoint openpi (directorio `params/` para inferencia, `assets/` con estadisticas de normalizacion) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `yrpark/openvtla-insert_USB` en el paso 19999, cuyas estadisticas de normalizacion se conservan. La arquitectura es la de pi0.5 (policy VLA de openpi) con un encoder tactil AnyTouch2 que produce 18 tokens tactiles mediante `cls_pool2`. Sobre esta base se anaden adaptadores LoRA en los dos componentes Gemma (2B y 300M) y se entrena con un objetivo de flow matching (imitacion conductual) mas una cabeza auxiliar de eventos tactiles.

Los datos de entrenamiento combinan demostraciones scriptadas de `openvitac/insert_USB_gelsight` con datos DAgger de `openvitac/insert_USB_dagger_gelsight`, muestreados 50:50. El conjunto DAgger r1 contiene 91 episodios y 14.956 frames (60 segmentos de recuperacion y 31 exitos base). La cabeza de eventos aplica BCE sobre los tokens tactiles proyectados y normalizados en L2, con temperatura 0,1, inicializacion a cero, peso 0,1 y peso positivo 5,0, etiquetando como `event_jam` (1: 391, -1: 809, 0: resto) y asignando 0 a los frames de demostracion. El entrenamiento se ejecuto durante 5.000 pasos con batch 64, LR 2,5e-5 con decaimiento coseno hasta 2,5e-6 (warmup 200), horizonte 50 y 18 tokens tactiles, en una unica NVIDIA B200 durante aproximadamente 3 horas. La perdida final de entrenamiento se situo entre 0,0081 y 0,0121 en los ultimos pasos registrados.

## Capacidades

- Control robotico visomotil para la tarea especifica de insercion de conector USB en simulacion.
- Fusion de vision y senal tactil (GelSight Mini) mediante el encoder AnyTouch2.
- Prediccion de acciones con horizonte de 50 pasos.
- Deteccion interna de eventos de atasco (`event_jam`) durante el entrenamiento, usada como senal auxiliar de aprendizaje; no se expone en inferencia.
- Recuperacion de fallos aprendida via DAgger a partir de segmentos de correccion.
- No soporta generacion de texto general, tool calling, agentes conversacionales ni capacidades multilingues en el sentido habitual de un LLM.

## Casos de uso

- Investigacion en manipulacion tactil: sirve como referencia reproducible para estudiar como el tacto mejora la insercion precisa de conectores en simulacion, comparando el checkpoint base con el fine-tune DAgger.
- Entrenamiento con DAgger en robotica: el modelo ejemplifica un pipeline completo de recogida de datos de recuperacion, etiquetado de eventos y fine-tune con LoRA sobre un VLA, reutilizable para otras tareas de ensamblaje.
- Benchmark de politicas VLA con tacto: puede emplearse como punto de partida para evaluar tecnicas de fusion multimodal (vision + tacto) en entornos OpenViTac.
- Desarrollo de cabezas auxiliares de eventos: el esquema de cabeza `event_jam` con BCE sobre tokens tactiles es adaptable a deteccion de fallos en otras tareas de manipulacion.
- Reproduccion de experimentos: el checkpoint y el log de entrenamiento permiten reproducir el setup (config `openvtla_insert_USB_dagger_event`, exp `r1`) y validar la receta.
- Base para transferencia a robot real: aunque entrenado en simulacion, el modelo puede servir como inicializacion para fine-tune con datos reales de GelSight Mini en tareas de insercion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion en simulador figura como pendiente en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 6,4 GB y el entrenamiento se realizo en una NVIDIA B200, por lo que la inferencia en precision completa requiere probablemente una GPU de gama alta con memoria amplia.
- GPU recomendadas: NVIDIA B200 (usada en entrenamiento); para inferencia se desconoce el minimo, pero por el tamano del backbone (Gemma 2B + 300M) se necesita al menos una GPU profesional con suficiente VRAM.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de cuantizacion ni de ejecucion en RTX 4090 u otras consumer.
- Opciones de despliegue: servidor de politicas de openpi mediante `uv run scripts/serve_policy.py policy:checkpoint` con la config `openvtla_insert_USB_dagger_event`; requiere un checkout de `tactile_base`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| openvtla-insert_USB-dagger_event-r1 | no disponible (LoRA sobre Gemma 2B + 300M) | no disponible | Insercion USB visomotil (sim) | other | Hugging Face, 0 descargas |
| yrpark/openvtla-insert_USB (base) | no disponible | no disponible | Insercion USB visomotil (sim) | other | Hugging Face |
| Otros VLA openpi (pi0.5) | no disponible en la informacion | no disponible | Control robotico general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo cubre la tarea de insercion de USB en simulacion con GelSight Mini; no es un modelo de proposito general.
- Evaluacion en simulador pendiente: no hay evidencia publicada de exito en la tarea tras el fine-tune.
- Licencia "other": es necesario revisar los terminos exactos del autor y de los componentes subyacentes (pi0.5, Gemma, AnyTouch2) antes de cualquier uso comercial.
- Sin datos de cuantizacion ni de despliegue en hardware de consumo.
- Riesgo de sobreajuste al entorno simulado: la transferencia a robot real no esta validada.
- La cabeza de eventos tactiles no se usa en inferencia, por lo que no aporta deteccion de atascos en produccion.
- Sin informacion sobre sesgos, idiomas o robustez fuera de la distribucion de entrenamiento.
- Repo con 0 descargas y 0 likes: sin validacion comunitaria ni reportes independientes.

## Enlaces

- Hugging Face: https://huggingface.co/yrpark/openvtla-insert_USB-dagger_event-r1
- Modelo base: https://huggingface.co/yrpark/openvtla-insert_USB
- Dataset de entrenamiento: https://huggingface.co/datasets/yrpark/openvitac-openvtla-data
- Codigo tactile_base: https://github.com/YuriPark0123/tactile_base
- Documentacion DAgger (referenciada en la model card): `docs/dagger.md` del repositorio tactile_base
