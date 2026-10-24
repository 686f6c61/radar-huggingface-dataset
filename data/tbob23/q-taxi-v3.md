# TBob23/q-Taxi-v3

## Resumen

q-Taxi-v3 es un agente de aprendizaje por refuerzo entrenado con Q-learning tabular sobre el entorno Taxi-v3 de Gym/Gymnasium. Lo publica el usuario TBob23 en Hugging Face como parte de la Unidad 2 del curso Deep RL de Hugging Face, con un entrenamiento realizado en local. No es un modelo de lenguaje ni una red neuronal profunda: es una tabla Q almacenada en un fichero `q-learning.pkl` que se carga junto a los metadatos del entorno para reproducir la política aprendida.

El modelo resuelve la tarea discreta de Taxi-v3: un taxi debe recoger a un pasajero en una de las cuatro localizaciones de una cuadrícula 5x5, recogerlo y dejarlo en el destino correcto con el mínimo número de pasos, con penalizaciones por acciones ilegales. El espacio de estados es finito y pequeño, de ahí que baste una implementación tabular clásica.

Su relevancia es fundamentalmente didáctica: sirve como referencia mínima de un pipeline completo de RL (entrenamiento, evaluación, publicación en el Hub con `model-index` y carga mediante `load_from_hub`). El autor declara una recompensa media de 7,56 +/- 2,71 en Taxi-v3, marcada como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Q-learning tabular (tabla Q, sin red neuronal) |
| Parametros totales | Tabla de 500 estados x 6 acciones (3.000 valores Q); dato derivado del entorno Taxi-v3, no declarado en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; el estado es la observacion discreta de Taxi-v3, sin ventana de contexto |
| Tipos de cuantizacion | No disponible; no aplica (valores float en un pickle) |
| Idiomas soportados | No disponible; no aplica (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | Pickle de Python (`.pkl`, fichero `q-learning.pkl`) |

## Arquitectura y entrenamiento

La arquitectura es Q-learning tabular, una variante de control off-policy basada en aproximación por tabla de la función de valor-acción Q(s,a). No hay transformer, MoE, SSM ni red neuronal: el agente mantiene una estimación Q para cada par (estado, acción) y actualiza con la regla de Bellman usando la recompensa inmediata y el máximo Q del estado siguiente. La política de comportamiento es epsilon-greedy decreciente, tal como se plantea en la Unidad 2 del curso Deep RL de Hugging Face, aunque la model card no detalla los hiperparámetros concretos (tasa de aprendizaje, factor de descuento, número de episodios ni esquema de decaimiento de epsilon).

El entrenamiento se realizó en local y el resultado se serializó en un pickle acompañado de los metadatos del entorno (identificador de `env_id`), de modo que el agente se reconstruye cargando el fichero y creando el entorno con `gym.make(model["env_id"])`. No se documenta composición de dataset (no aplica), ni fases de RLHF/DPO, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Tampoco se indica la semilla ni el número de ejecuciones de evaluación, lo que limita la reproducibilidad del resultado declarado.

## Capacidades

- Resolución del entorno Taxi-v3: aprende una política que recoge y deja al pasajero en el destino dentro de la cuadrícula 5x5 con acciones discretas.
- Toma de decisiones en espacios de estados y acciones discretos y finitos con Q-learning.
- Persistencia y distribución del agente: carga desde el Hub mediante `load_from_hub(repo_id="TBob23/q-Taxi-v3", filename="q-learning.pkl")`.
- Integración con el ecosistema Gym/Gymnasium a través del `env_id` almacenado en el pickle.
- Declaración de resultados mediante `model-index`, lo que permite indexar la métrica en el Hub.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingües ni modo "thinking".

## Casos de uso

- Docencia de RL clásico: usar el agente como ejemplo mínimo ejecutable de Q-learning tabular en un curso o taller, cargándolo en dos líneas y mostrando la política aprendida sobre Taxi-v3.
- Línea base (baseline) en experimentos: comparar un DQN o un PPO contra esta tabla Q para cuantificar la mejora que aporta la aproximación con red neuronal en un entorno pequeño y determinista.
- Verificación de pipelines de publicación: validar el flujo completo de subida al Hub con `model-index`, `tags` y carga con `load_from_hub` antes de publicar modelos más complejos.
- Test de integración de entornos Gym: comprobar que una instalación de Gymnasium, las dependencias de carga y el renderizado del entorno funcionan correctamente en una máquina nueva.
- Prácticas de evaluación estadística: reejecutar la política con distintas semillas para reproducir o refutar el 7,56 +/- 2,71 declarado y discutir la varianza entre episodios.
- Demostraciones educativas en vivo: visualizar episodios del taxi en un notebook sin necesidad de GPU ni de descargas grandes, útil en aulas con hardware limitado.
- Punto de partida para extensiones: reentrenar la tabla con otro esquema de exploración o con Q-learning con trazas de elegibilidad y comparar curvas de recompensa.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. La métrica está marcada como `verified: false`.

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| reinforcement-learning | Taxi-v3 | mean_reward | 7,56 +/- 2,71 | No |

No se han publicado resultados de benchmarks en la informacion disponible para otras tareas (MMLU, HumanEval, GSM8K u otras), ya que el modelo no es un modelo de lenguaje. Tampoco se aportan curvas de aprendizaje, número de episodios evaluados ni comparación con una política aleatoria u óptima.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia es una búsqueda en un diccionario o matriz de 3.000 valores, ejecutable en CPU.
- GPU recomendadas: ninguna. Cualquier CPU x86 o ARM sirve; el cuello de botella es el intérprete de Python y el bucle del entorno, no el cálculo.
- Cabe en cualquier equipo: el repositorio ocupa 0,0 GB y la tabla Q completa ocupa del orden de kilobytes.
- Memoria RAM: unos pocos megabytes, dominados por las dependencias de Python (Gym/Gymnasium, NumPy, huggingface_sb3 o equivalente para `load_from_hub`).
- Opciones de despliegue: script de Python con Gym/Gymnasium y el cargador del Hub. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser una consulta a tabla, la latencia por paso es del orden de microsegundos y el rendimiento está limitado por el step del entorno.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Rendimiento en Taxi-v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| q-Taxi-v3 (TBob23) | Q-learning tabular | 3.000 valores Q (derivado del entorno) | No aplica | mean_reward 7,56 +/- 2,71 (no verificado) | No disponible | Hugging Face Hub |
| Agentes Q-learning de la Unidad 2 del curso Deep RL de Hugging Face | Q-learning tabular | Tabla equivalente | No aplica | No disponible | No disponible | Hugging Face Hub (otros repos de alumnos) |
| Agentes DQN sobre Taxi-v3 | Red neuronal profunda (DQN) | Del orden de decenas de miles de pesos; cifra no disponible | No aplica | No disponible | No disponible | Implementaciones en repos públicos de RL |
| Agentes PPO sobre Taxi-v3 | Política y valor con red neuronal (on-policy) | Cifra no disponible | No aplica | No disponible | No disponible | Implementaciones en repos públicos de RL |

No se dispone de cifras verificadas de rendimiento para las alternativas en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Ámbito restringido: la política solo es válida para Taxi-v3 (500 estados, 6 acciones). No generaliza a otros entornos ni a variantes del problema.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no puede usarse para tareas de NLP, código o visión.
- Resultado no verificado: la métrica 7,56 +/- 2,71 está marcada con `verified: false` y no se documenta el número de episodios ni la semilla de evaluación.
- Varianza elevada: la desviación típica de 2,71 sobre una media de 7,56 indica un comportamiento inestable entre episodios, con episodios claramente por debajo de la media.
- Reproducibilidad incompleta: la model card no especifica hiperparámetros, episodios de entrenamiento ni semilla, por lo que no es posible replicar el entrenamiento de forma exacta.
- Licencia ausente: al no declararse licencia, el uso comercial queda en una zona legal gris y conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: irrelevante para el entorno, pero impide cualquier uso relacionado con texto.
- Seguridad del formato: los pesos se distribuyen como pickle de Python; cargar pickles de origen no confiable implica riesgo de ejecución de código. Conviene auditar el fichero o cargarlo en un entorno aislado.
- Sesgos: no aplica en el sentido habitual de sesgos sociales, pero la política hereda los sesgos del esquema de recompensas de Taxi-v3 y del proceso de exploración empleado.
- Riesgo de alucinación: no aplica, al no haber generación de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TBob23/q-Taxi-v3
- Curso Deep RL de Hugging Face (Unidad 2, contexto de entrenamiento): https://huggingface.co/learn/deep-rl-course/unit2/introduction
- Entorno Taxi-v3 en Gymnasium: https://gymnasium.farama.org/environments/toy_text/taxi/
- Documentación de `load_from_hub` (huggingface_sb3): https://github.com/huggingface/huggingface_sb3

Nota: los resultados de la búsqueda web proporcionada no contienen enlaces relevantes para este modelo y se han descartado por no ser fuente técnica válida.
