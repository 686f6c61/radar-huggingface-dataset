# Yujana/ppo-Pyramids

## Resumen

Yujana/ppo-Pyramids es un agente de aprendizaje por refuerzo entrenado con el algoritmo PPO (Proximal Policy Optimization) sobre el entorno Pyramids de Unity ML-Agents. Lo publica el usuario Yujana en Hugging Face como entregable de la unidad 5 del curso Deep RL de Hugging Face, y se distribuye como un modelo ONNX pensado para ejecutarse dentro de Unity o mediante inferencia de ML-Agents. No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural, sino que mapea observaciones del entorno a acciones de control.

Se trata de un artefacto de alcance muy acotado: una política entrenada para una única tarea de navegación/control en 3D dentro de un simulador Unity. El repositorio no documenta hiperparámetros de entrenamiento, espacio de observaciones, espacio de acciones ni número de parámetros de la red, y los metadatos no declaran licencia ni idiomas. El tamaño del repositorio reportado es de 0.0 GB, coherente con un fichero ONNX de política de pequeñas dimensiones.

Su relevancia es fundamentalmente didáctica y de infraestructura: sirve como referencia reproducible para verificar cadenas de entrenamiento con `mlagents-learn`, para probar la inferencia ONNX dentro de Unity (Barracuda/Sentis) y como punto de comparación frente a variantes del mismo entorno que incorporan exploración intrínseca, como liajun/ppo-PyramidsRND. El único resultado declarado es una recompensa media de 2.0 +/- 0.1 en ML-Agents-Pyramids, marcada como no verificada por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política/valor (actor-critic) entrenada con PPO sobre observaciones del entorno Unity ML-Agents Pyramids; el autor no detalla el numero de capas ni el tamano de las capas ocultas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no hay ventana de contexto; el agente procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (se publican pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Entorno de entrenamiento | ML-Agents-Pyramids (Unity ML-Agents) |
| Algoritmo | PPO |
| Libreria | ml-agents |
| Tarea declarada | reinforcement-learning |
| Fecha de creacion (metadatos) | 2026-09-30T18:40:11.000Z |
| Fecha de actualizacion (metadatos) | 2026-09-30T18:40:16.000Z |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura es una red de actor-critic propia de PPO en ML-Agents: una politica que produce la distribucion de acciones (el entorno Pyramids usa un espacio de acciones discreto, con acciones de movimiento y de interaccion con interruptores) y una funcion de valor que estima el retorno, ambas optimizadas de forma conjunta con el objetivo recortado de PPO. El repositorio no especifica el numero de capas, el tamano de las capas ocultas, la normalizacion de observaciones ni el uso de memoria recurrente o de codificacion visual, por lo que esos detalles constan como no disponibles.

Tampoco se documentan los hiperparametros de entrenamiento (tasa de aprendizaje, tamano de lote, horizonte, numero de pasos o semillas), ni el numero de episodios consumidos. La model card indica unicamente que se trata de un agente PPO entrenado con Unity ML-Agents para la unidad 5 del curso Deep RL de Hugging Face. En ese contexto didactico, el entorno Pyramids se emplea habitualmente como ejemplo de recompensa dispersa, y la variante mas conocida del ejercicio incorpora RND (Random Network Distillation) para favorecer la exploracion; el modelo aqui descrito no declara usar RND. El resultado publicado (recompensa media 2.0 +/- 0.1) es bajo, lo que resulta consistente con un problema de recompensa dispersa y con un entrenamiento de alcance limitado.

## Capacidades

- Control secuencial en el entorno Pyramids: selecciona acciones discretas a partir de las observaciones del entorno en cada paso.
- Inferencia dentro de Unity: el modelo ONNX esta pensado para ejecutarse en el runtime de Unity mediante ML-Agents (Barracuda o Sentis) o con un runtime ONNX externo.
- Politica entrenada para una unica tarea: no es un modelo de proposito general ni transferible sin reentrenamiento a otros entornos.
- Generacion de texto: no aplica.
- Razonamiento, codigo y matematicas: no aplica.
- Vision: no disponible (no se documenta si la politica consume observaciones visuales o solo vectoriales).
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes basados en LLM; el modelo resuelve decision secuencial dentro de un episodio del simulador.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Verificacion de la cadena de entrenamiento en ML-Agents: cargar el modelo y reproducir la evaluacion sobre Pyramids permite comprobar que la version de `mlagents` y la configuracion del entorno producen una recompensa media cercana a 2.0, util como prueba de humo tras actualizar la libreria.
- Inferencia ONNX en builds de Unity: el fichero ONNX puede integrarse en un proyecto Unity para dotar de comportamiento a un agente no jugador en una escena de prueba, sin necesidad de reentrenar ni de conectarse a un servidor externo.
- Material docente para cursos de aprendizaje por refuerzo: sirve como ejemplo de entregable de la unidad 5 del curso Deep RL y como caso base frente al que comparar variantes con exploracion intrínseca.
- Comparacion de algoritmos y tecnicas de exploracion: al existir una variante del mismo entorno con RND (liajun/ppo-PyramidsRND), el modelo permite estudiar experimentalmente la diferencia entre PPO estandar y PPO con recompensa intrinseca en un escenario de recompensa dispersa.
- Investigacion sobre recompensa dispersa y curriculos: usar este agente como linea base debil (recompensa 2.0) y medir la mejora que aportan tecnicas de shaping, curriculo o memoria recurrente requiere reentrenar, pero el modelo fija un punto de partida reproducible.
- Pruebas de integracion de runtimes de inferencia: validar el rendimiento de onnxruntime, Sentis o Barracuda con un grafo de politica pequeno permite detectar problemas de compatibilidad de operadores o de versiones antes de abordar modelos mayores.
- Demos de navegacion de personajes en entornos 3D: en prototipos y pruebas de concepto de videojuegos o simuladores, el agente puede controlar un personaje que debe desplazarse por el escenario, siempre que el entorno coincida exactamente con Pyramids.
- Automatizacion de pruebas en CI: dado su tamano reducido, el modelo puede incluirse en un pipeline de integracion continua que arranque una instancia de Unity en modo headless y valide que la inferencia devuelve acciones validas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (marcados como no verificados en la model card y en el model-index):

| Metrica | Dataset | Valor | Verificado |
|---|---|---|---|
| mean_reward | ML-Agents-Pyramids | 2.0 +/- 0.1 | No |
| Score (media - desviacion tipica) | ML-Agents-Pyramids | 1.9 | No |
| Requisito declarado del ejercicio | ML-Agents-Pyramids | >= -100.0 | No |

No se han publicado otros resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni de otras tareas, que ademas no aplican a un agente de control).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Por el tipo de tarea (politica de control de dimension reducida) y por el tamano de repositorio reportado (0.0 GB), cabe esperar un consumo muy inferior a 1 GB, pero el autor no publica esta cifra.
- GPU recomendadas: no disponibles; para una politica de este tipo no se requiere GPU dedicada y la inferencia es viable en CPU.
- Compatibilidad con GPU de consumo: no confirmada por el autor, pero el caso de uso previsto (inferencia ONNX dentro de Unity) se ejecuta habitualmente en hardware de consumo e incluso en movil.
- Opciones de despliegue: ML-Agents para inferencia dentro de Unity (Barracuda o Sentis), onnxruntime para inferencia fuera de Unity, y `mlagents-learn` para reentrenamiento.
- Latencia y throughput: no disponibles.
- Requisitos de entrenamiento: no disponibles (no se documentan epocas, pasos totales ni hardware empleado).

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Formato | Licencia | Recompensa declarada | Notas |
|---|---|---|---|---|---|---|
| Yujana/ppo-Pyramids | ML-Agents-Pyramids | PPO | ONNX | no disponible | 2.0 +/- 0.1 | Entregable del curso Deep RL; resultado no verificado |
| liajun/ppo-PyramidsRND | Pyramids (Unity ML-Agents) | PPO con RND | no disponible en la informacion recogida | no disponible | no disponible | Incorpora exploracion con Random Network Distillation |
| jay-yeo/ppo-Pyramids | Pyramids (Unity ML-Agents) | PPO | no disponible en la informacion recogida | no disponible | no disponible | Agente PPO del mismo entorno publicado por otro autor |

No se dispone de datos de rendimiento comparables de las alternativas, ni de informacion sobre licencia o formato en esas fichas, por lo que la comparacion se limita a algoritmo y entorno. Fuera del ecosistema ML-Agents, no se han identificado en la informacion disponible modelos de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Especificidad total al entorno: la politica solo es valida para la version de Pyramids con la que se entreno; cambios en el espacio de observaciones, de acciones o en las recompensas invalidan el modelo.
- Rendimiento bajo: una recompensa media de 2.0 +/- 0.1 sugiere un agente que resuelve la tarea de forma muy parcial, coherente con un problema de recompensa dispersa.
- Ausencia de licencia: al no declararse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion; en un contexto de produccion esto constituye un riesgo legal que hay que resolver con el autor.
- Resultado no verificado: el propio model-index marca `verified: false`; no hay evaluacion independiente ni informacion sobre el numero de episodios usados para calcular la media.
- Trazabilidad incompleta: no se documentan hiperparametros, semillas, version de Unity o de ML-Agents, ni arquitectura de la red, lo que dificulta la reproducibilidad.
- Validez de los metadatos: las fechas de creacion y actualizacion registradas (2026-09-30) no permiten situar el modelo con fiabilidad en el tiempo; conviene tratarlas con cautela.
- Adopcion nula: 0 descargas y 0 likes, por lo que no existe evidencia de uso en produccion ni comunidad que reporte incidencias.
- Sin capacidades de lenguaje, vision ni tool calling: no es adecuado para tareas de NLP, generacion de codigo, atencion al cliente ni orquestacion de herramientas.
- Riesgo de sobreajuste al simulador: al ser un ejercicio de curso, es probable que no generalice a variaciones del escenario ni a otros entornos de ML-Agents sin reentrenamiento.
- Dependencia del runtime de Unity: la ruta de despliegue documentada (ONNX dentro de Unity) condiciona la integracion y puede verse afectada por cambios de version en Barracuda o Sentis.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yujana/ppo-Pyramids
- Variante con RND en el mismo entorno: https://huggingface.co/liajun/ppo-PyramidsRND
- Otro agente PPO sobre Pyramids: https://huggingface.co/jay-yeo/ppo-Pyramids
- Ficha indexada del modelo: https://essamamdani.com/ai-models/hf-rixhi05-ppo-pyramids
- Espejo en AtomGit AI: https://ai.atomgit.com/leiwenhu/ppo-Pyramids
- Espejo en AtomGit AI: https://ai.atomgit.com/Lizi6-6/ppo-Pyramids
