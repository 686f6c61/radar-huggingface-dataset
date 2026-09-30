# Yujana/poca-SoccerTwos

## Resumen

poca-SoccerTwos es una politica neuronal entrenada con aprendizaje por refuerzo multiagente para el entorno SoccerTwos de Unity ML-Agents. Lo publica el usuario Yujana en Hugging Face como parte de la Unit 7 del curso Deep Reinforcement Learning de Hugging Face, y su unico artefacto es un fichero ONNX (`SoccerTwos.onnx`) que se inserta directamente en un entorno de Unity ML-Agents para controlar los agentes durante la partida.

No se trata de un modelo de lenguaje ni de un modelo generativo: es una red de politica que traduce observaciones del simulador en acciones discretas de movimiento y patada. El algoritmo indicado por el nombre es POCA (Posthumous Credit Assignment), la variante multiagente que ML-Agents implementa como MA-POCA, disenada para asignar credito de recompensa a agentes cuyo impacto en el resultado solo se materializa mucho despues de su accion.

Su relevancia es practica y acotada: sirve como referencia reproducible para comprobar el rendimiento de un entrenamiento MA-POCA en SoccerTwos dentro del curso, con una recompensa media declarada de 2.0 +/- 0.5. El repositorio no documenta arquitectura de red, hiperparametros, presupuesto de entrenamiento ni licencia, y el modelo acumula 0 descargas y 0 likes, por lo que debe considerarse un artefacto educativo mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica neuronal para RL multiagente, entrenada con POCA (Posthumous Credit Assignment / MA-POCA); no disponible el detalle de capas, activaciones o tamano de las capas ocultas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume observaciones por paso de simulacion, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (se publica un unico artefacto ONNX; no se documenta la precision de los pesos, FP32 o FP16) |
| Idiomas soportados | no aplica / no disponible (modelo de control, sin capacidad de procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`SoccerTwos.onnx`) |
| Libreria | ml-agents |
| Entorno de entrenamiento | ML-Agents-SoccerTwos (Unity ML-Agents) |
| Pipeline declarado | reinforcement-learning |
| Tamano del repositorio | 0.0 GB segun la ficha de Hugging Face |
| Fecha de creacion / actualizacion | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la topologia de la red. Por el pipeline declarado y la libreria empleada, se trata de una politica entrenada con el algoritmo POCA (Posthumous Credit Assignment) sobre el entorno SoccerTwos de Unity ML-Agents, un escenario cooperativo-competitivo 2 contra 2 en el que dos equipos de dos agentes deben empujar una pelota hacia la porteria rival. En ML-Agents, este algoritmo corresponde a MA-POCA y esta pensado para credit assignment en equipos, donde la recompensa global del equipo llega con retraso respecto a las acciones individuales que la provocaron.

No hay informacion sobre el numero de pasos de entrenamiento, la composicion del buffer, el uso de self-play, los hiperparametros de PPO subyacente (tasa de aprendizaje, tamano de lote, horizonte), ni sobre tecnicas adicionales como curricula, recompensas de imitacion o decodificacion especulativa. Tampoco se documenta si el entrenamiento uso el flujo estandar de `mlagents-learn` con un fichero de configuracion YAML, que es el procedimiento habitual y el unico verificable por el artefacto publicado. Los pesos se exportan a ONNX, el formato que Unity utiliza para ejecutar la inferencia dentro del motor mediante su motor de inferencia.

## Capacidades

- Control motor dentro del entorno SoccerTwos: desplazamiento de los agentes por el campo y ejecucion de la accion de patada sobre la pelota.
- Juego cooperativo y competitivo 2v2: la politica se ha entrenado para maximizar una recompensa de equipo, no una recompensa puramente individual.
- Inferencia en tiempo real dentro de Unity: el fichero ONNX se integra como cerebro de los agentes mediante el paquete de ML-Agents.
- Generalizacion limitada al entorno de entrenamiento: no se documenta capacidad de transferencia a otras escenas, variantes del escenario o cambios de las dimensiones de observacion.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido cognitivo; el modelo opera en bucle de decision por paso de simulacion.
- Capacidades multilingues: no aplica.
- Capacidades especiales: no disponible (no se declaran modos de pensamiento, vision, audio ni multimodalidad).

## Casos de uso

- Reproduccion de la Unit 7 del curso Deep RL de Hugging Face: cargar `SoccerTwos.onnx` en la escena SoccerTwos para comparar el resultado propio contra la recompensa media declarada de 2.0 +/- 0.5.
- Punto de partida para entrenamiento propio con MA-POCA: usar este modelo como referencia de "linea base" antes de lanzar un `mlagents-learn` con configuracion propia y medir la mejora en recompensa media.
- Depuracion de entornos ML-Agents: al ser un artefacto ONNX pequeno, permite validar rapidamente que la integracion de un cerebro entrenado en una escena de Unity funciona (observaciones, acciones discretas, ramificaciones de la politica).
- Docencia de reinforcement learning multiagente: ejemplo tangible de credit assignment con recompensa diferida en un escenario de equipo, util para explicar por que PPO por agente falla en tareas cooperativas con recompensa global.
- Pruebas de rendimiento de inferencia en Unity: al ejecutarse por paso de fisica, sirve para medir el coste de la inferencia ONNX dentro del bucle de la escena en CPU y en GPU.
- Investigacion sobre self-play y curricula: base para experimentar con variaciones del escenario SoccerTwos y observar como se degrada o se mantiene la politica entrenada ante cambios de dinamica.
- Comparacion de algoritmos en el mismo entorno: sustituir la politica POCA por PPO multiagente manteniendo el escenario y contrastar la recompensa media obtenida.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. No estan verificados (`verified: false`).

| Metrica | Dataset / tarea | Valor | Verificado |
|---|---|---|---|
| mean_reward | ML-Agents-SoccerTwos / reinforcement-learning | 2.0 +/- 0.5 | no |
| Score (media - desviacion tipica) | ML-Agents-SoccerTwos / reinforcement-learning | 1.5 (requisito: >= -100.0) | no |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; ademas, al no ser un modelo de lenguaje, esas metricas no serian aplicables. Tampoco se documentan curvas de aprendizaje, numero de pasos hasta convergencia ni varianza entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion. El repositorio ocupa 0.0 GB en la ficha de Hugging Face y el unico artefacto es un ONNX de politica, por lo que el consumo esperado es de decenas de megabytes como maximo, muy inferior al de cualquier modelo de lenguaje.
- GPU recomendadas: no aplica ninguna GPU de centro de datos. El modelo esta pensado para ejecutarse dentro del motor de Unity, donde la inferencia de politicas ONNX de este tamano se realiza tipicamente en CPU o en la GPU del equipo de desarrollo.
- Cabe en GPU de consumo: si, con margen amplio, en cualquier GPU de consumo e incluso sin GPU dedicada, aunque no se publican requisitos oficiales.
- Opciones de despliegue: Unity ML-Agents con su motor de inferencia (formato ONNX), ejecucion del modelo dentro del Editor o en una build de Unity, y uso del paquete Python `mlagents` para reentrenamiento y exportacion. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. Al operar por paso de simulacion, la latencia relevante es la del bucle de la escena, no un throughput de tokens.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables con metricas verificables publicadas para el entorno ML-Agents-SoccerTwos. La comparacion posible es a nivel de enfoque de entrenamiento, no de numeros.

| Modelo / enfoque | Algoritmo | Entorno | Parametros | Contexto | mean_reward | Licencia |
|---|---|---|---|---|---|---|
| Yujana/poca-SoccerTwos | POCA (MA-POCA) | ML-Agents-SoccerTwos | no disponible | no aplica | 2.0 +/- 0.5 (declarado por el autor, sin verificar) | no disponible |
| Politica PPO multiagente entrenada con ML-Agents | PPO | ML-Agents-SoccerTwos | no disponible | no aplica | no disponible | no disponible |
| MA-POCA por defecto de ML-Agents (configuracion de ejemplo) | MA-POCA | ML-Agents-SoccerTwos | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmark publicados para las alternativas que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta analisis de comportamiento diferencial entre agentes, roles o posiciones.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe el riesgo de comportamientos degenerados o no previstos fuera del entorno de entrenamiento, como politicas que se quedan atascadas o que explotan un artefacto del simulador.
- Limitaciones de contexto o idioma: el modelo no procesa lenguaje. Su "contexto" es la observacion por paso de simulacion y no se documenta su composicion ni sus dimensiones.
- Restricciones de licencia: la ficha no declara licencia. Esto impide determinar si el uso comercial esta permitido; hay que tratar el modelo como no autorizado para uso comercial hasta que el autor publique una licencia explicita.
- Ausencia de verificacion: el unico resultado declarado tiene `verified: false`, sin numero de semillas, curva de aprendizaje ni script de evaluacion reproducible.
- Reproducibilidad: no se publican hiperparametros, configuracion YAML de entrenamiento, version exacta de ML-Agents ni version del escenario SoccerTwos, por lo que replicar el resultado exacto no es viable.
- Adopcion nula: 0 descargas y 0 likes, sin issues ni discusion asociada, lo que reduce la probabilidad de soporte o mantenimiento por parte del autor.
- Uso en produccion: no recomendado como componente de un sistema real. Es un artefacto educativo, especifico de un escenario y sin garantias de robustez.
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con ML-Agents, por lo que se han descartado como fuentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yujana/poca-SoccerTwos
- Curso Deep Reinforcement Learning de Hugging Face, Unit 7 (mencionado en la model card): no disponible como enlace directo en la informacion proporcionada
- Repositorio de Unity ML-Agents: no disponible en la informacion proporcionada
- Documentacion del entorno SoccerTwos: no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible
- Demo o space asociado: no disponible

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, POCA, MA-POCA ni ML-Agents, por lo que no se han incluido fuentes adicionales.
