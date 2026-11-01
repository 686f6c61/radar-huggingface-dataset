# spoindo/connectailab-rl-spoindo-v1-link01

## Resumen

connectailab-rl-spoindo-v1-link01 es un adaptador LoRA publicado por el usuario spoindo sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje de propósito general, sino un "cerebro de decisión" para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia y dirección al objetivo, sensores de distancia, velocidad y elección previa) y devuelve una única letra correspondiente a una de las acciones de locomoción disponibles para los siguientes 0,5 segundos. El modelo se entrenó destilando el comportamiento de una política PPO entrenada en un entorno web y posteriormente refinando con aprendizaje por refuerzo sobre las preferencias de acción.

La relevancia es acotada pero interesante como caso de estudio: demuestra un pipeline completo de destilación de políticas de RL hacia un modelo de lenguaje pequeño (0,8B parámetros) mediante LoRA, con evaluación sobre 20 episodios de caminata y una tasa de coincidencia del 100% con la política profesora en el conjunto de test. El repositorio es de tamaño mínimo (0,0 GB), lo que sugiere que solo contiene los pesos del adaptador, no el modelo base.

El modelo está etiquetado para coreano como único idioma y declara la licencia Apache 2.0. Su ámbito es la investigación y la educación en un simulador 2D aproximado, no el despliegue robótico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA añade un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT, la cuantización depende del modelo base |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena en cuatro fases descritas en la model card: (1) entrenamiento de una política PPO en un entorno web de aprendizaje por refuerzo para la tarea `choose_object`, con una tasa de éxito del 95% en el examen oficial; (2) generación de un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del robot en texto, con la respuesta de la política como etiqueta y un 20% de ejemplos con desviaciones; (3) aprendizaje supervisado del modelo de lenguaje sobre esas etiquetas mediante LoRA; y (4) refinamiento con RL usando recompensas basadas en el retorno que habría obtenido la política profesora al ejecutar cada opción, con una penalización KL para mantener el modelo cerca de la distribución de referencia.

El conjunto de datos resultante tiene 427 ejemplos de entrenamiento, 75 de validación y 138 de test. La evaluación se realiza sentando al modelo de decisión en el lugar de la política profesora y caminando el mismo circuito 20 veces (semillas 91001–91020). La simulación de caminata es una aproximación 2D basada en una tabla de velocidades por comando, no en MuJoCo real, por lo que los resultados pueden diferir de los del simulador web.

## Capacidades

- Toma de decisiones discretas: dado un estado textual del robot, selecciona exactamente una letra entre las opciones presentadas.
- Formato de salida restringido: devuelve solo la letra elegida, sin explicación, según la instrucción de sistema indicada.
- Robustez ante instrucciones embebidas: el prompt de sistema indica tratar el contenido del estado como datos, no como instrucciones.
- Destilación de política RL: reproduce el comportamiento de una política PPO entrenada en un entorno específico.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Estudio de destilación de políticas RL: el adaptador sirve como ejemplo reproducible de cómo convertir una política PPO en un modelo de lenguaje pequeño mediante LoRA, útil en cursos y tutoriales de aprendizaje por refuerzo.
- Evaluación de modelos de decisión en entornos simulados: se puede integrar en el pipeline `connect_tycoon` para comparar el comportamiento del modelo con la política profesora en el circuito `random`.
- Prototipado de agentes basados en lenguaje para robótica simulada: el modelo demuestra el patrón de convertir observaciones numéricas en texto y mapear la salida a acciones discretas, patrón reutilizable en otros entornos.
- Docencia en RL y PEFT: el notebook de Colab y el repositorio de GitHub permiten reproducir el entrenamiento y analizar cada fase del pipeline.
- Investigación sobre recompensas basadas en retorno: el uso de recompensas derivadas de la política profesora con KL es un caso práctico para estudiar estabilidad en RLHF de modelos pequeños.
- Pruebas de robustez ante inyección de instrucciones: el prompt de sistema y la separación entre estado y pregunta permiten evaluar cómo un modelo de 0,8B maneja texto no confiable en la entrada.

## Benchmarks y rendimiento

| Modelo | Precisión en test (coincidencia con la política profesora) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política profesora (PPO) | 100,0% | 100% | 0% | 8,5 s |
| Modelo antes del entrenamiento | 73,2% | 60% | 0% | 8,7 s |
| Aprendizaje supervisado (LoRA) | 100,0% | 100% | 0% | 8,5 s |
| Aprendizaje por refuerzo (este adaptador) | 100,0% | 100% | 0% | 8,5 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son específicas del entorno `choose_object` y de la simulación 2D aproximada descrita por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la VRAM depende del modelo base. En fp16 se estiman aproximadamente 1,6 GB solo para los pesos del base, más overhead de activaciones y del adaptador; en cuantización de 8 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo base en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para entrenamiento del adaptador, se recomienda una GPU con 8–16 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas, dado el tamaño reducido del modelo base.
- Opciones de despliegue: `transformers` + `peft` según el ejemplo de la model card; también es compatible con `vLLM` y `TGI` si se fusiona el adaptador con el modelo base, y con `llama.cpp`/`Ollama` tras conversión a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo genera una sola letra por consulta, por lo que la latencia vendrá dominada por el coste de prefill del prompt de estado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar como referencia el modelo base Qwen/Qwen3.5-0.8B, del que este adaptador hereda arquitectura, tokenizador y licencia, pero no se han publicado comparativas con otras políticas de decisión destiladas ni con adaptadores LoRA similares.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| connectailab-rl-spoindo-v1-link01 | 0,8B (base) + LoRA | No disponible | Apache 2.0 | HuggingFace (adaptador) |
| Qwen/Qwen3.5-0.8B | 0,8B | No disponible | No disponible en la información | HuggingFace |
| Otras políticas RL destiladas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: el modelo solo está entrenado para la tarea `choose_object` del robot LINK-01 en el circuito `random`; no generaliza a otras tareas, entornos ni robots sin reentrenamiento.
- Simulación aproximada: la evaluación de caminata usa una tabla de velocidades 2D, no MuJoCo real, por lo que los resultados pueden no trasladarse al simulador web ni a un robot físico.
- Idioma: el modelo está etiquetado únicamente para coreano; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación: aunque la tarea es de clasificación cerrada, el modelo podría devolver una letra no listada o texto adicional si el prompt no se sigue estrictamente; el prompt de sistema mitiga parcialmente este riesgo.
- Sesgos: no se documentan análisis de sesgos; el comportamiento está limitado al circuito y a las semillas de evaluación indicadas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor recomienda validar en el robot y el espacio reales antes de cualquier despliegue físico.
- Tamaño del repositorio: 0,0 GB indica que solo se distribuye el adaptador; es necesario descargar el modelo base por separado.
- Datos de entrenamiento limitados: 427 ejemplos de entrenamiento y 138 de test, lo que reduce la significación estadística de las métricas reportadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spoindo/connectailab-rl-spoindo-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL en AI CITY BUILDERS: https://www.aicitybuilders.com/robot
- Entorno web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
