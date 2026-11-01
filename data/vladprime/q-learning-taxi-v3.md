# Vladprime/q-learning-Taxi-v3

## Resumen

`q-learning-Taxi-v3` es un agente de aprendizaje por refuerzo tabular basado en Q-learning, desarrollado por Vlad Kolomiiets (usuario `Vladprime`) como entrega practica de la unidad 2 del Hugging Face Deep RL Course. No se trata de un modelo de lenguaje ni de una red neuronal profunda: es una tabla Q de dimensiones finitas entrenada desde cero sobre el entorno `Taxi-v3` de Gymnasium, un problema clasico de planificacion con 500 estados discretos y 6 acciones posibles.

El interes del artefacto es fundamentalmente pedagogico y reproducible. El autor documenta de forma explicita el proceso de entrenamiento (100.000 episodios, 1.883.993 pasos de entorno, semilla 20261101) y una evaluacion independiente sobre 1.000 episodios con semillas fijas (1000000–1000999), obteniendo una recompensa media de 7,8610 con desviacion tipica de 2,4931. El checkpoint se recargo y la evaluacion se reprodujo de forma exacta, lo que aporta trazabilidad al resultado.

No debe confundirse con un modelo generativo: no procesa lenguaje, no tiene parametros en el sentido habitual (pesos de una red) y su "contexto" no existe como ventana de tokens. Su relevancia actual es la de un ejemplo canonico y verificable de Q-learning tabular, util para docencia, para validar pipelines de RL y como linea base de referencia en `Taxi-v3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q de 500 estados x 6 acciones, sin red neuronal) |
| Parametros totales | no disponible (tabla Q discreta; 3.000 entradas potenciales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno Markoviano de estado discreto) |
| Tipos de cuantizacion | no aplica (valores float en `qtable.npy`; no hay cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | `qtable.npy` (NumPy, `allow_pickle=False`) y `q-learning.pkl` (formato del curso) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular clasico: una tabla Q indexada por estado del entorno `Taxi-v3` (500 estados) y accion (6 acciones: mover norte, sur, este, oeste, recoger pasajero y dejar pasajero). La politica de actuacion es epsilon-greedy sobre los valores Q aprendidos, y en inferencia se selecciona `int(np.argmax(qtable[state]))`. No hay funcion de aproximacion, ni red neuronal, ni representacion distribuida del estado.

El entrenamiento parte de una tabla Q inicializada a cero (sin politica preentrenada) y se ejecuta durante 100.000 episodios, acumulando 1.883.993 pasos de entorno con semilla 20261101. No se documentan hiperparametros como tasa de aprendizaje, factor de descuento o esquema de decaimiento de epsilon en la informacion disponible. La evaluacion se realiza de forma independiente sobre 1.000 episodios con semillas 1000000–1000999, y el autor indica que el checkpoint recargado reproduce exactamente la evaluacion completa, lo que constituye la principal garantia de reproducibilidad del artefacto.

## Capacidades

- Resolucion del entorno `Taxi-v3`: recogida y entrega de pasajeros en una cuadricula discreta con estaciones fijas.
- Politica determinista en inferencia mediante `argmax` sobre la tabla Q.
- Reproducibilidad exacta del entrenamiento y de la evaluacion con semillas fijas.
- Exportacion en dos formatos: `qtable.npy` (NumPy, sin pickle) y `q-learning.pkl` (formato del curso).
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso fuera del propio bucle del entorno.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia de RL tabular: sirve como ejemplo ejecutable y reproducible de Q-learning desde cero en un entorno discreto, con semillas y metricas documentadas para comparar implementaciones de alumnos.
- Linea base en `Taxi-v3`: permite contrastar agentes mas complejos (DQN, PPO, tablas con optimizaciones) contra una referencia publica con recompensa media de 7,8610 y desviacion de 2,4931.
- Validacion de pipelines de evaluacion: al reproducir exactamente la evaluacion tras recargar el checkpoint, es util para probar herramientas de carga de artefactos, registro de metricas y verificacion de semillas.
- Pruebas de integracion con Gymnasium: el agente se puede conectar a un bucle de entorno estandar para comprobar versiones de la API, espacios de observacion y espacios de accion.
- Generacion de datos de demostracion: la politica aprendida puede grabarse en `replay.mp4` (como hace el autor) para material visual de clases o tutoriales.
- Referencia de formato de entrega: el par `qtable.npy` + `q-learning.pkl` sirve de plantilla para empaquetar artefactos de RL en Hugging Face con `model-index` y metricas declaradas.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados por un tercero):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Reinforcement Learning | Taxi-v3 | mean_reward | 7,8610 +/- 2,4931 |

El autor anade que la media menos la desviacion tipica es 5,3679 y que la evaluacion se realizo sobre 1.000 episodios con semillas 1000000–1000999. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la tabla Q ocupa unos pocos kilobytes en memoria RAM.
- GPU: no requiere GPU; la inferencia es una consulta `argmax` sobre un array NumPy.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y entornos sin acelerador.
- Despliegue: Python con NumPy y Gymnasium; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma medida; por la naturaleza de la operacion (una indexacion y un `argmax` sobre 500x6 entradas), la latencia por paso es del orden de microsegundos en CPU.
- Almacenamiento: el repositorio ocupa 0,0 GB segun Hugging Face, coherente con el tamano de la tabla.

## Comparativa con modelos similares

| Modelo | Enfoque | Entorno | Recompensa media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Vladprime/q-learning-Taxi-v3` | Q-learning tabular | Taxi-v3 | 7,8610 +/- 2,4931 | Apache 2.0 | Hugging Face |
| Agente DQN sobre Taxi-v3 | Aproximacion con red neuronal | Taxi-v3 | no disponible | no disponible | no disponible |
| Agente PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | no disponible | no disponible | no disponible |

No se dispone de resultados publicados de alternativas comparables en la informacion proporcionada; la comparativa se limita a la categoria metodologica.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades generativas.
- La tabla Q esta especializada en `Taxi-v3`; no generaliza a otros entornos ni a variantes del mapa.
- La recompensa media de 7,8610 con desviacion de 2,4931 indica una politica funcional pero no optima; el maximo teorico del entorno es cercano a 8 en el mejor caso, pero la varianza sugiere episodios suboptimos frecuentes.
- El resultado esta declarado por el autor y marcado como no verificado (`verified: false`); no hay validacion independiente.
- El archivo `q-learning.pkl` requiere `pickle`; solo debe cargarse desde fuentes de confianza, tal como advierte el propio autor.
- No se documentan hiperparametros de entrenamiento (alpha, gamma, epsilon), lo que limita la reproduccion completa desde la model card.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto es una entrega de curso y no una politica lista para produccion.
- No hay informacion sobre sesgos, idiomas ni riesgos de alucinacion porque el modelo no opera en esos dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vladprime/q-learning-Taxi-v3
- Asignatura del curso (Unit 2, hands-on): https://huggingface.co/learn/deep-rl-course/en/unit2/hands-on
- Requisitos de certificacion del curso: https://huggingface.co/learn/deep-rl-course/en/communication/certification
