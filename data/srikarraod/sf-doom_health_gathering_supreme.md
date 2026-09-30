# Srikarraod/sf-doom_health_gathering_supreme

## Resumen

El modelo `sf-doom_health_gathering_supreme` es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom, utilizando la libreria `sample-factory`. Lo publica el usuario de Hugging Face Srikarraod y su proposito no es el procesamiento de lenguaje natural, sino servir como artefacto de certificacion del curso Deep Reinforcement Learning de Hugging Face (unidad 8, PII).

Se trata, por tanto, de un modelo de politica entrenado para una tarea concreta de control secuencial en un entorno de videojuego en primera persona: recolectar botiquines de salud evitando morir. El resultado de evaluacion declarado por el autor es una recompensa media de 12,50 con una desviacion de 1,20, marcada como no verificada en la model card.

A diferencia de los modelos de lenguaje, no hay parametros publicados, ni ventana de contexto, ni cuantizaciones, ni soporte multilingue: es un checkpoint de politica neuronal dependiente de la libreria `sample-factory` para su ejecucion. Su relevancia es principalmente academica y de reproducibilidad dentro del ecosistema del curso de RL, no como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (agente de RL basado en APPO; topologia de la red de politica no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; el estado es la observacion del entorno) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Algoritmo | APPO (Asynchronous Proximal Policy Optimization) |
| Entorno | `doom_health_gathering_supreme` (ViZDoom) |
| Libreria | sample-factory |
| Tarea | reinforcement-learning |
| Recompensa media evaluada | 12,50 +/- 1,20 (no verificada) |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card indica unicamente que el agente fue entrenado con APPO usando `sample-factory`. APPO es una variante asincrona de PPO en la que varios workers recogen experiencia en paralelo y un learner actualiza la politica de forma centralizada; es el algoritmo de referencia de la libreria `sample-factory`. No se especifica en la informacion disponible ni la topologia exacta de la red (capas convolucionales, recurrencia, cabezas de politica y valor), ni el numero de pasos de entorno consumidos, ni hiperparametros como tasa de aprendizaje, tamano de lote o coeficiente de entropia.

Tampoco se documenta la composicion del dataset, ya que el entrenamiento es online contra el propio entorno y no sobre un corpus estatico. No se menciona el uso de RLHF, DPO ni tecnicas de ajuste fino por preferencias, algo que no aplica en este contexto. La innovacion tecnica relevante es el propio uso de APPO con entrenamiento asincrono distribuido sobre ViZDoom, pero la informacion publicada no permite detallar la configuracion concreta ni verificar la reproducibilidad del resultado declarado.

## Capacidades

- Control secuencial en el entorno `doom_health_gathering_supreme`: el agente aprende una politica para moverse por el escenario y recoger objetos de salud.
- Toma de decisiones bajo recompensa dispersa en un entorno de ViZDoom en primera persona.
- Inferencia de politica entrenada mediante la libreria `sample-factory`.
- Reproduccion de un resultado de evaluacion declarado (recompensa media 12,50 +/- 1,20), sin verificacion independiente.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingues, de vision general ni de audio.
- No dispone de modo de razonamiento explicito (thinking mode) ni de salidas interpretables documentadas.

## Casos de uso

- Material de certificacion del curso de Deep RL: el checkpoint se publica como entrega de la unidad 8 del curso de Hugging Face, de modo que sirve como evidencia de haber completado el entrenamiento de un agente APPO sobre ViZDoom.
- Reproduccion de experimentos: un investigador puede cargar el agente con `sample-factory` y volver a evaluarlo en `doom_health_gathering_supreme` para contrastar la recompensa declarada de 12,50 +/- 1,20.
- Linea base en experimentos comparativos: sirve como referencia inicial frente a variantes de PPO, cambios de hiperparametros o modificaciones del preprocesado de observaciones en el mismo entorno.
- Docencia y demostraciones: permite ilustrar en clase como se comporta una politica entrenada con APPO en un entorno con senal de recompensa dispersa, sin necesidad de reentrenar.
- Pruebas de infraestructura de RL: util para validar pipelines de carga, evaluacion y registro de agentes de `sample-factory` en un entorno controlado antes de escalar a entrenamientos mas costosos.
- Analisis de sensibilidad al entorno: dado que la recompensa media es moderada, puede emplearse como punto de partida para estudiar tecnicas de shaping de recompensa o de exploracion que mejoren el desempeno en la misma tarea.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card. La metrica figura como no verificada.

| Tarea | Dataset / entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | doom_health_gathering_supreme | mean_reward | 12,50 +/- 1,20 | No |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un agente de refuerzo sobre ViZDoom.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el numero de parametros ni el tamano del checkpoint, no es posible calcularla.
- GPU recomendadas: no disponible en la informacion proporcionada. `sample-factory` puede ejecutar politicas entrenadas tanto en CPU como en GPU CUDA, pero no se documenta el hardware empleado en el entrenamiento ni el recomendado para inferencia.
- Compatibilidad con GPU de consumo: no disponible. No hay datos de tamano que permitan confirmar si el checkpoint cabe en una GPU de gama consumer.
- Opciones de despliegue: la model card solo indica que el modelo se creo para la certificacion del curso de Deep RL y que se ejecuta con la libreria `sample-factory`. No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI ni formatos alternativos, que ademas no aplican a un agente de RL.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No se han facilitado otros agentes APPO entrenados sobre `doom_health_gathering_supreme`, ni checkpoints de referencia de la misma libreria, ni valores de recompensa de linea base para este entorno, por lo que no es posible establecer una comparativa con datos verificables.

| Modelo | Algoritmo | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sf-doom_health_gathering_supreme | APPO | doom_health_gathering_supreme | 12,50 +/- 1,20 (no verificada) | no disponible | Hugging Face, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no puede asumirse ningun permiso de uso comercial ni de redistribucion; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- El resultado de evaluacion (12,50 +/- 1,20) figura como no verificado en el model-index: no hay evidencia independiente de que se reproduzca.
- No se publican el numero de parametros, la topologia de red ni los hiperparametros de entrenamiento, lo que impide auditar el modelo y limita seriamente su reproducibilidad.
- El agente esta especializado en un unico entorno (`doom_health_gathering_supreme`) y no se documenta capacidad de generalizacion a otros escenarios ni a variaciones del mapa.
- No existe informacion sobre sesgos, pero en RL existen riesgos conocidos de sobreajuste a la dinamica exacta del entorno y de explotacion de artefactos de la funcion de recompensa.
- El concepto de alucinacion no aplica a un agente de control, pero si aplica la ausencia de garantias de seguridad: el comportamiento aprendido no tiene verificacion formal y puede fallar ante cambios de semilla o de configuracion.
- Dependencia fuerte de la libreria `sample-factory` y de su version concreta; no se documenta la version utilizada, lo que puede provocar incompatibilidades al cargar el checkpoint.
- El modelo tiene 0 descargas y 0 likes, por lo que no cuenta con validacion alguna de la comunidad.
- La fecha de creacion y actualizacion registradas (2026-09-30) deben tomarse como metadatos de la plataforma y no implican mantenimiento posterior del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srikarraod/sf-doom_health_gathering_supreme
- Curso Deep Reinforcement Learning de Hugging Face (referenciado en la model card): https://huggingface.co/learn/deep-rl-course/en/unit0/introduction
- No se encontraron otros enlaces relevantes en la busqueda web; los resultados devueltos correspondian a listados de Facebook Marketplace sin relacion con el modelo.
