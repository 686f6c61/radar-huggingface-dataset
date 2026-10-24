# TBob23/rl_course_vizdoom_health_gathering_supreme

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un **agente de aprendizaje por refuerzo profundo** entrenado con el algoritmo **APPO** (Asynchronous Proximal Policy Optimization) sobre el entorno **ViZDoom "health gathering supreme"**, un escenario de shooter en primera persona en el que el agente debe recoger botiquines para sobrevivir el mayor tiempo posible. Lo publica el usuario **TBob23** en Hugging Face y está etiquetado con `sample-factory`, la librería de RL asíncrona de Alex Petrenko, en su versión 2.0. No hay información sobre arquitectura de red, número de parámetros ni configuración de entrenamiento más allá de lo que se deduce del propio framework.

El interés del artefacto es fundamentalmente **docente y de reproducibilidad**: se trata de un checkpoint de curso (el nombre `rl_course_` lo indica) que sirve para demostrar el ciclo completo descargar → evaluar (`enjoy`) → reanudar entrenamiento (`train --restart_behavior=resume`) con Sample-Factory. No es un modelo para producción de NLP: no procesa lenguaje, no tiene ventana de contexto ni cuantizaciones tipo GGUF, y no declara licencia.

Por tanto, esta ficha adapta la plantilla habitual de fichas de modelos a un artefacto de RL: los campos que no aplican se marcan explícitamente como tales, y los que simplemente no se han publicado se marcan como "no disponible". El único dato cuantitativo de rendimiento es la recompensa media declarada por el autor, **no verificada**, de 16,98 ± 5,30 en `doom_health_gathering_supreme`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Algoritmo APPO (actor-crítico asíncrono con objetivo PPO recortado) sobre política convolucional para entrada visual; la topología exacta de la red no se publica |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; el agente observa fotogramas del entorno con memoria recurrente opcional no documentada) |
| Tipos de cuantizacion | No aplica. No se distribuyen pesos en safetensors ni GGUF; el checkpoint es el formato nativo de Sample-Factory |
| Idiomas soportados | No aplica (no procesa texto). El campo "idiomas" no está declarado en el repositorio |
| Licencia | No disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | Checkpoints nativos de Sample-Factory 2.0, descargables con `sample_factory.huggingface.load_from_hub`; el repositorio (0,3 GB) incluye además logs de TensorBoard |
| Entorno de entrenamiento | `doom_health_gathering_supreme` (ViZDoom) |
| Framework | Sample-Factory 2.0 |
| Pipeline declarado | `reinforcement-learning` |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-10-24 / 2026-10-24 |

## Arquitectura y entrenamiento

El algoritmo es **APPO**, una variante asíncrona de PPO en la que múltiples workers recogen experiencia en paralelo (politica *rollout worker*) y un *learner* central actualiza los pesos con un objetivo PPO recortado, sincronizando parámetros de forma periódica. Sample-Factory implementa esta variante con soporte para entornos de observación puramente visual, como los de ViZDoom, donde la política procesa fotogramas en escala de grises o RGB y emite acciones discretas. La descripción pública del repositorio no detalla el número de capas, canales, unidades recurrentes ni la configuración de hiperparámetros (learning rate, número de workers, longitud de rollout, coeficiente de entropía), por lo que esos datos deben considerarse **no disponibles**.

No se especifica el número de pasos de entorno consumidos, la composición del dataset (en RL no hay dataset estático: la distribución de datos la genera la propia política en interacción con el simulador), ni si se aplicaron técnicas auxiliares como *reward shaping*, aumentación de observaciones o currículos. Sí se documenta el flujo para **continuar el entrenamiento** desde este checkpoint mediante `--restart_behavior=resume`, lo que permite reutilizarlo como inicialización para experimentos propios ajustando `--train_for_env_steps`. El escenario `health gathering supreme` es el nivel de máxima dificultad de la familia *health gathering*, con mayor escasez de botiquines y por tanto una señal de recompensa más dispersa que sus variantes *basic* e *easy*.

## Capacidades

- Control de un agente en un entorno 3D parcialmente observable a partir de píxeles (ViZDoom), con acciones discretas de movimiento y disparo.
- Navegación y recogida de objetos: la tarea consiste en localizar y recolectar botiquines para mantener la salud por encima de cero.
- Política de supervivencia a largo plazo en un escenario con recompensa dispersa y horizonte de episodio variable.
- Evaluación reproducible mediante el script `enjoy` de Sample-Factory, con salida de vídeo/estadísticas del episodio.
- Reanudación de entrenamiento desde el checkpoint publicado (`--restart_behavior=resume`), lo que lo convierte en inicialización para *fine-tuning*.
- Exportación a otros repositorios de Hugging Face con `--push_to_hub`.
- **No** soporta generación de texto, razonamiento simbólico, código, matemáticas ni visión general: es un agente específico de una única tarea.
- **No** soporta *tool calling* ni *function calling*.
- **No** implementa razonamiento multi-paso en el sentido de los agentes basados en LLM; su "planificación" es implícita en la política neuronal.
- **No** tiene capacidades multilingües ni modo *thinking*, audio o vídeo generativo.

## Casos de uso

- **Material docente para un curso de RL**: el checkpoint permite a los alumnos ejecutar un agente ya entrenado con `python -m <path.to.enjoy.module> --algo=APPO --env=doom_health_gathering_supreme` y comprobar visualmente qué aspecto tiene una política convergida antes de entrenar la suya desde cero.
- **Línea base para comparación de algoritmos**: sirve como referencia APPO frente a PPO síncrono, R2D2 o IMPALA en el mismo entorno, comparando curvas de recompensa en TensorBoard durante las primeras decenas de millones de pasos.
- **Reproducción de experimentos y auditoría**: al estar el *train_dir* completo en el repositorio (0,3 GB), se puede reanudar el entrenamiento y verificar si la recompensa declarada se recupera con la misma configuración de hardware y semilla.
- **Punto de partida para *reward shaping***: un equipo que investigue señales de recompensa alternativas en `health gathering supreme` puede partir de esta política y medir cuánto mejora o degrada con una función de recompensa modificada, ahorrando el coste de entrenar desde cero.
- **Docencia sobre asincronía en RL**: útil para demostrar el desacoplamiento entre *rollout workers* y *learner* en Sample-Factory, midiendo el efecto del número de workers en el *throughput* de pasos por segundo.
- **Generación de clips de evaluación**: para artículos, memorias o clases, el script `enjoy` produce episodios reproducibles que ilustran el comportamiento de la política en los distintos niveles de dificultad.
- **Pruebas de infraestructura de entrenamiento**: por su reducido tamaño y bajo coste computacional, es un buen *smoke test* para validar un clúster o un contenedor con Sample-Factory antes de lanzar experimentos en Atari o entornos más pesados.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. La métrica **no está verificada** (`verified: false`) y no se indica el número de semillas, el número de episodios de evaluación ni la desviación estándar de la media.

| Algoritmo | Entorno | Metrica | Valor | Verificado |
|---|---|---|---|---|
| APPO | doom_health_gathering_supreme | mean_reward | 16.98 +/- 5.30 | No |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro *benchmark* de lenguaje, por la sencilla razón de que el artefacto no es un modelo de lenguaje. Tampoco se aportan comparaciones con otras configuraciones de APPO, PPO u otros algoritmos en el mismo entorno.

## Requisitos de hardware

- **Inferencia**: no se publica el número de parámetros, pero por el tamaño del repositorio (0,3 GB, incluyendo checkpoints y logs) se trata de una política convolucional pequeña; la evaluación con el script `enjoy` es viable en CPU, aunque se recomienda GPU para reproducir episodios a mayor velocidad. Las cifras exactas de VRAM no están disponibles.
- **GPU recomendadas**: no disponibles. Para entrenamiento, Sample-Factory es intensivo en CPU (workers de simulación) y se beneficia de una GPU de gama media para el *learner*; una RTX 3060/4070 o superior es un punto de partida razonable, pero el autor no documenta ninguna configuración de referencia.
- **¿Cabe en GPU de consumo?** Sí, con alta probabilidad, dado el reducido tamaño del checkpoint; no hay requisitos publicados que indiquen lo contrario.
- **Despliegue**: exclusivamente mediante Sample-Factory 2.0 (`python -m sample_factory.huggingface.load_from_hub -r TBob23/rl_course_vizdoom_health_gathering_supreme` y después el script `enjoy`). **No** es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia para modelos de lenguaje.
- **Latencia y throughput**: no disponibles. Dependen del número de workers, del tamaño del frame, de si se usa observación RGB o en escala de grises y del hardware; el autor no reporta pasos por segundo ni FPS.

## Comparativa con modelos similares

No existe un *benchmark* común publicado que permita comparar este checkpoint con alternativas equivalentes. La comparación más significativa es con otras copias públicas del mismo experimento de curso, que comparten entorno y algoritmo pero no declaran métricas ni licencia:

| Artefacto | Algoritmo | Entorno | Parametros | Contexto | Licencia | Metricas publicadas |
|---|---|---|---|---|---|---|
| TBob23/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory 2.0) | doom_health_gathering_supreme | No disponible | No aplica | No disponible | mean_reward 16.98 +/- 5.30 (no verificado) |
| Ryukijano/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | No disponible | No aplica | No disponible | No disponibles |
| thaslimshaik/rl_course_vizdoom_health_gathering_supreme | APPO (Sample-Factory) | doom_health_gathering_supreme | No disponible | No aplica | No disponible | No disponibles |
| HusseinEid101/-rl_course_vizdoom_health_gathering_supreme- (GitHub) | APPO (Sample-Factory) | doom_health_gathering_supreme | No disponible | No aplica | No disponible | No disponibles |

Frente a políticas de RL publicadas para Atari o para otros escenarios de ViZDoom, la comparación directa carece de sentido: cambian el entorno, el espacio de acciones y la señal de recompensa, por lo que los valores de `mean_reward` no son trasladables entre tareas.

## Limitaciones y advertencias

- **Licencia no declarada**: al no especificarse licencia, no hay autorización explícita de uso comercial, redistribución ni obra derivada. Para cualquier uso fuera de experimentación personal conviene contactar con el autor.
- **Métrica no verificada**: el valor 16,98 ± 5,30 procede del `model-index` del propio autor con `verified: false`; no se documentan semillas, número de episodios ni protocolo de evaluación, por lo que la cifra puede no ser reproducible.
- **Sobreajuste al entorno**: la política está entrenada para un único escenario de ViZDoom; no generaliza a otros mapas, a otras resoluciones o a cambios en la dinámica de aparición de botiquines.
- **Riesgo de alucinación**: no aplica en el sentido de los modelos de lenguaje, pero sí existe el equivalente en RL, que es la **explotación de artefactos del simulador**: políticas que maximizan recompensa aprovechando *bugs* del entorno en lugar de la tarea prevista.
- **Falta de documentación técnica**: sin número de parámetros, hiperparámetros ni arquitectura de red, es difícil evaluar el coste real de reentrenamiento o de adaptación.
- **Dependencia del ecosistema Sample-Factory**: el checkpoint no es portable a otros frameworks sin conversión, y requiere la versión 2.0 o compatible para cargarse correctamente.
- **Dependencia de ViZDoom y de los recursos del juego**: ejecutar el entorno requiere la instalación de ViZDoom y los ficheros WAD correspondientes; esos recursos tienen sus propias condiciones de uso, independientes de este repositorio.
- **Sin garantías de mantenimiento**: 0 descargas y 0 *likes* en el momento de la consulta, sin historial de issues ni soporte; es un artefacto de curso, no un modelo mantenido.
- **Sesgos del simulador**: el comportamiento aprendido refleja la dinámica y las limitaciones del motor de ViZDoom, no una política general de navegación o de toma de decisiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TBob23/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Guía de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
- Copia del mismo experimento en Hugging Face (Ryukijano): https://huggingface.co/Ryukijano/rl_course_vizdoom_health_gathering_supreme
- Copia del mismo experimento en Hugging Face (thaslimshaik): https://huggingface.co/thaslimshaik/rl_course_vizdoom_health_gathering_supreme
- Copia en GitHub (HusseinEid101): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
- README de esa copia en GitHub: https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-/blob/main/README.md
- Ficha de terceros sobre el modelo (Eclatt, savrn.com): https://savrn.com/models/rl-course-vizdoom-health-gathering-supreme
