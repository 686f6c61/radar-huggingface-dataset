# yojitha/appo-doom_health_gathering_supreme

## Resumen

APPO-doom_health_gathering_supreme es un agente de aprendizaje por refuerzo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno doom_health_gathering_supreme de ViZDoom. El modelo lo publica el usuario yojitha en HuggingFace como parte de la Unit 8 Part 2 del curso Deep Reinforcement Learning de Hugging Face, y se apoya en la libreria Sample Factory 2.0 (https://github.com/alex-petrenko/sample-factory) para el entrenamiento.

No se trata de un modelo de lenguaje, sino de una politica entrenada para resolver una tarea concreta: navegar por un escenario de DOOM recogiendo botiquines para mantener la salud por encima de un umbral mientras sobrevive. Su relevancia es fundamentalmente didactica: sirve como ejemplo reproducible de como entrenar agentes asincronos a gran escala con APPO y de como publicar los resultados en la plataforma de Hugging Face.

La model card no ofrece informacion sobre la arquitectura de red concreta, el numero de parametros ni el numero de pasos de entrenamiento. El unico dato cuantitativo declarado es la recompensa media obtenida: 15.00 +/- 1.00, que supera el umbral de 5 exigido para la certificacion del curso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | agente de aprendizaje por refuerzo (politica neuronal entrenada con APPO); detalle de la red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (agente de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (no aplica en el sentido linguistico) |
| Licencia | no disponible |
| Formato de pesos | formato de Sample Factory (checkpoint de PyTorch); no se detalla en la model card |

## Arquitectura y entrenamiento

El modelo se ha entrenado con APPO, una variante asincrona de PPO que desacopla la generacion de experiencia de la actualizacion de la politica mediante workers paralelos. Esta implementacion forma parte de Sample Factory 2.0, un framework disenado para entrenar agentes de RL con alto rendimiento en un solo equipo o en clusters. El entorno objetivo es doom_health_gathering_supreme de ViZDoom, en el que el agente debe recoger objetos de salud para mantenerse vivo el mayor tiempo posible.

La model card no especifica el numero de pasos de entrenamiento, la composicion del dataset (que en RL se genera de forma online mediante interaccion con el entorno), ni si se aplicaron tecnicas adicionales como reward shaping o curriculum learning. El unico hiperparametro inferible es que se utilizo el script de entrenamiento estandar de Sample Factory para este entorno, tal como se indica en la Unit 8 Part 2 del curso Deep RL.

## Capacidades

- Control de un agente en el entorno ViZDoom doom_health_gathering_supreme: recogida de botiquines y mantenimiento de la salud.
- Toma de decisiones secuencial a partir de observaciones visuales del entorno (pixel-based, segun el diseno estandar de Sample Factory para ViZDoom).
- Politica entrenada de extremo a extremo con APPO, apta para inferencia en tiempo real dentro del entorno.
- Reanudacion del entrenamiento desde el checkpoint publicado (compatible con el script de Sample Factory).
- No dispone de tool calling, function calling, capacidades de agente multi-paso en el sentido de los LLM, ni capacidades multilingues.

## Casos de uso

- Material didactico para el curso Deep RL: sirve como referencia de un agente APPO que supera el umbral de certificacion (recompensa media 15.00 frente al minimo de 5), util para que estudiantes comparen sus propios resultados.
- Punto de partida para fine-tuning: el checkpoint puede reanudarse con el script de Sample Factory para continuar el entrenamiento o probar variaciones de hiperparametros.
- Investigacion en RL asincrono: permite estudiar el comportamiento de APPO en tareas de supervivencia con recompensa densa y horizonte largo.
- Benchmark de infraestructura: al ser un entorno de ViZDoom, se puede emplear para medir throughput de Sample Factory en distintas GPUs o configuraciones de workers.
- Experimentos de ablacion: base para comparar APPO frente a otros algoritmos (PPO, IMPALA) en el mismo entorno sin necesidad de reentrenar desde cero.
- Demostraciones y visualizaciones: util para generar videos o GIFs del agente jugando, integrables en articulos o presentaciones sobre RL.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Tarea | Dataset |
|---|---|---|---|
| mean_reward | 15.00 +/- 1.00 | reinforcement-learning | doom_health_gathering_supreme |

El criterio de certificacion del curso exige una recompensa resultante (mean_reward menos la desviacion estandar) mayor o igual a 5. Con los datos declarados, 15.00 - 1.00 = 14.00, por lo que el modelo supera ampliamente dicho umbral. No se han publicado otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de una politica de RL para ViZDoom, el requisito depende del tamano de la red, que la model card no especifica; en configuraciones tipicas de Sample Factory suele ser reducido.
- GPU recomendadas: no disponible en la informacion proporcionada. Sample Factory esta optimizado para ejecutarse en GPUs de NVIDIA, pero no se detalla el hardware empleado.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; en funcion del tamano de la red, es probable que quepa en GPUs de consumo, pero no puede afirmarse sin datos.
- Opciones de despliegue: inferencia mediante la propia libreria Sample Factory (https://github.com/alex-petrenko/sample-factory) dentro del entorno ViZDoom. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un agente de RL).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Entorno | Algoritmo | Recompensa declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yojitha/appo-doom_health_gathering_supreme | doom_health_gathering_supreme | APPO | 15.00 +/- 1.00 | no disponible | HuggingFace |
| havyasree/sf-doom_health_gathering_supreme | doom_health_gathering_supreme | APPO | no disponible | no disponible | HuggingFace |
| kingabzpro/doom_health_gathering_supreme | doom_health_gathering_supreme | APPO | no disponible | no disponible | HuggingFace |

Los modelos comparables encontrados son otros agentes entrenados por estudiantes del mismo curso sobre el mismo entorno. No se dispone de sus valores de recompensa en la informacion recopilada, por lo que la comparacion numerica de rendimiento no es posible.

## Limitaciones y advertencias

- Modelo de proposito puramente didactico: no esta pensado para uso en produccion ni para tareas fuera del entorno ViZDoom para el que fue entrenado.
- Sesgos conocidos: no disponibles, aunque al entrenarse en un unico entorno su comportamiento esta fuertemente especializado y no generaliza a otros escenarios.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje; si aplica un riesgo de sobreajuste al entorno de entrenamiento.
- Limitaciones de contexto o idioma: no aplica (agente de RL, no modelo linguistico).
- Restricciones de licencia: la licencia no esta declarada en la model card, por lo que se desconoce si permite uso comercial. Conviene contactar con el autor antes de cualquier uso mas alla del ambito educativo.
- Cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Los resultados de recompensa estan declarados por el autor y marcados como no verificados (`verified: false`), por lo que deben tomarse con cautela.
- El repositorio figura con un tamano de 0.0 GB, lo que puede indicar que los pesos no estan subidos o que el dato no se ha actualizado; conviene verificar antes de intentar cargarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yojitha/appo-doom_health_gathering_supreme
- Perfil del autor: https://huggingface.co/yojitha
- Curso Deep Reinforcement Learning de Hugging Face: https://huggingface.co/learn/deep-rl-course/en/unit0/introduction
- Notebook Unit 8 Part 2: https://colab.research.google.com/github/huggingface/deep-rl-class/blob/master/notebooks/unit8/unit8_part2.ipynb
- Repositorio de Sample Factory: https://github.com/alex-petrenko/sample-factory
- Modelo comparable (havyasree): https://huggingface.co/havyasree/sf-doom_health_gathering_supreme
- Modelo comparable (kingabzpro): https://huggingface.co/kingabzpro/doom_health_gathering_supreme
- Repositorio relacionado (HusseinEid101): https://github.com/HusseinEid101/-rl_course_vizdoom_health_gathering_supreme-
