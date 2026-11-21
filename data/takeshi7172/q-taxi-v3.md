# Takeshi7172/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo basado en Q-learning tabular, entrenado para resolver el entorno Taxi-v3 de Gymnasium. Lo publica el usuario Takeshi7172 en Hugging Face como parte de la Unidad 2 del curso de Deep Reinforcement Learning de Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: es una tabla de valores Q que asigna una accion optima a cada uno de los 500 estados discretos del entorno Taxi-v3.

El entorno Taxi-v3 es un problema clasico de planificacion con 500 estados (25 posiciones del taxi x 5 ubicaciones de pasajero x 4 destinos) y 6 acciones discretas (mover norte, sur, este, oeste, recoger y dejar pasajero). El agente aprende una politica mediante Q-learning, una tecnica de diferencias temporales off-policy que actualiza iterativamente los valores Q a partir de recompensas. El objetivo es maximizar la recompensa acumulada, donde cada paso penaliza con -1, cada entrega exitosa suma +20 y cada recogida o entrega ilegal resta -10.

Su relevancia es fundamentalmente didactica: sirve como referencia minima y reproducible de un agente Q-learning tabular, util para comparar con implementaciones mas complejas (DQN, PPO) o para validar infraestructura de evaluacion de RL. No tiene aplicaciones en generacion de texto, codigo ni vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla de valores Q sobre estados y acciones discretos) |
| Parametros totales | no disponible (tabla de 500 estados x 6 acciones, sin pesos neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de decision secuencial, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB; probablemente tabla serializada con pickle o similar, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, sin redes neuronales. El agente mantiene una tabla Q de dimension 500 x 6 (estados x acciones) e inicializa los valores a cero o a un valor constante. En cada paso aplica una politica epsilon-greedy sobre la tabla, observa la recompensa y el siguiente estado, y actualiza el valor Q del par estado-accion segun la regla de actualizacion de Q-learning con tasa de aprendizaje alfa y factor de descuento gamma. No hay funcion de aproximacion, por lo que el agente converge a la politica optima si se explora suficiente.

El entrenamiento se realizo en el entorno Taxi-v3 de Gymnasium, siguiendo la Unidad 2 del curso de Deep RL de Hugging Face. No se especifican en la informacion disponible el numero de episodios, los hiperparametros (alfa, gamma, epsilon, decaimiento de epsilon) ni la semilla utilizada. No hay fase de RLHF ni DPO, al no tratarse de un modelo de lenguaje. El unico artefacto es la tabla Q entrenada, que el autor publica junto con la model card y los metadatos del model-index.

## Capacidades

- Resolucion del entorno Taxi-v3: selecciona una de las 6 acciones discretas en cada uno de los 500 estados del entorno.
- Politica determinista derivada de la tabla Q (accion con mayor valor Q por estado).
- Aprendizaje por refuerzo tabular con actualizacion de diferencias temporales.
- Evaluacion reproducible: la model card declara una recompensa media de 7.48 +/- 2.72 sobre Taxi-v3.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso fuera del bucle de decision del entorno.
- No tiene capacidades multilingues.
- No dispone de modo thinking ni de ninguna capacidad especial de modelos generativos.

## Casos de uso

- Docencia de aprendizaje por refuerzo: usar el agente como ejemplo minimo y funcional de Q-learning tabular en la Unidad 2 del curso de Deep RL de Hugging Face, comparando la tabla Q resultante con la politica optima conocida de Taxi-v3.
- Validacion de pipelines de evaluacion RL: cargar el agente en un script de evaluacion (por ejemplo, con `stable-baselines3` o `gymnasium`) para comprobar que el entorno Taxi-v3 y el calculo de recompensa media funcionan correctamente antes de entrenar modelos mas costosos.
- Baseline de referencia: comparar la recompensa media (7.48 +/- 2.72) de agentes mas avanzados (DQN, PPO, A2C) sobre Taxi-v3 contra este baseline tabular para medir la ganancia real de usar aproximadores de funcion.
- Reproduccion de experimentos didacticos: replicar el entrenamiento con distintos hiperparametros (alfa, gamma, epsilon) y contrastar la tabla Q final con la publicada, como ejercicio de analisis de sensibilidad.
- Demostracion de entornos discretos en charlas o talleres: ejecutar el agente en vivo para ilustrar como una politica aprendida resuelve un problema de planificacion con 500 estados.
- Pruebas de integracion de Hugging Face Hub para RL: verificar la carga de un agente con `pipeline("reinforcement-learning")` y el consumo del model-index en herramientas de comparacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7.48 +/- 2.72 |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no aplican a un agente tabular de RL.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; la tabla Q ocupa unos pocos kilobytes (500 x 6 valores en coma flotante).
- GPU recomendadas: no se necesita GPU; la inferencia es una consulta a una tabla en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en CPU sin requisitos relevantes.
- Opciones de despliegue: script Python con Gymnasium y la tabla Q cargada; no aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al ser una consulta a tabla, la latencia por paso es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Parametros | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|---|
| q-Taxi-v3 (este modelo) | Q-learning tabular | Taxi-v3 | Tabla 500 x 6 | no aplica | mean_reward 7.48 +/- 2.72 | no disponible |
| Agente DQN sobre Taxi-v3 | Red neuronal profunda | Taxi-v3 | Depende de la implementacion | no aplica | no disponible en la informacion | no disponible |
| Agente PPO sobre Taxi-v3 | Policy gradient | Taxi-v3 | Depende de la implementacion | no aplica | no disponible en la informacion | no disponible |

No se dispone de datos verificables de alternativas comparables en la informacion proporcionada; la comparativa con DQN y PPO se incluye solo como referencia de categoria.

## Limitaciones y advertencias

- El agente solo funciona en Taxi-v3; no generaliza a otros entornos ni a variaciones del entorno sin reentrenamiento.
- La recompensa media declarada (7.48 +/- 2.72) no esta verificada (`verified: false`) y presenta una desviacion estandar alta, lo que sugiere una politica que no siempre alcanza el optimo.
- No hay informacion sobre hiperparametros, semilla ni numero de episodios, lo que dificulta la reproducibilidad exacta del entrenamiento.
- La licencia no esta especificada, por lo que no se puede garantizar el uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ambito didactico.
- No es un modelo de lenguaje: no genera texto, no responde a prompts y no debe evaluarse con metricas de NLP.
- El repositorio ocupa 0.0 GB y no se detalla el formato de los pesos, lo que puede complicar la carga directa sin inspeccionar los archivos.
- Riesgo de sobreajuste a la politica epsilon-greedy usada en evaluacion; los resultados pueden variar segun la semilla y el numero de episodios de evaluacion.
- No hay sesgos de lenguaje ni riesgo de alucinacion en el sentido habitual, al no producir texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takeshi7172/q-Taxi-v3
- Curso de Deep RL de Hugging Face (Unidad 2, Q-learning): https://huggingface.co/learn/deep-rl-course/unit2/introduction
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentacion de Q-learning en la unidad del curso: https://huggingface.co/learn/deep-rl-course/unit2/hands-on
