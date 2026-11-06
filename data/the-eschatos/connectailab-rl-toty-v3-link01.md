# the-eschatos/connectailab-rl-toty-v3-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario the-eschatos en el marco de CONNECT AI LAB y AI CITY BUILDERS. No es un modelo de lenguaje de propósito general, sino un modelo de decisión específico para robótica: recibe como texto la situación actual de un robot LINK-01 (distancia al objetivo, dirección, sensores de distancia, velocidad y elección previa) y devuelve una única letra correspondiente a la acción de caminar durante los siguientes 0,5 segundos.

El modelo se entrenó en dos fases: primero un ajuste supervisado (LoRA) para imitar las decisiones de una "red neuronal profesora" (brain.json) entrenada con PPO en un entorno web de aprendizaje por refuerzo, y después una fase de refuerzo con penalización KL para corregir elecciones subóptimas. La tarea concreta documentada es `choose_object`, con un conjunto de 401 ejemplos de entrenamiento, 75 de validación y 131 de test.

Su relevancia es acotada pero interesante como demostración: muestra cómo destilar una política de RL en un modelo de lenguaje pequeño (0,8B parámetros) mediante LoRA, logrando una tasa de coincidencia del 100% con la política profesora y un 100% de éxito en 20 episodios de evaluación en un simulador 2D aproximado. Es un artefacto de investigación y educación, no un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su número de parámetros; el base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen/Qwen3.5-0.8B, sin especificar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador se entrena para una tarea de clasificación restringida: dado un estado del robot serializado como texto (observación de 26 dimensiones según la convención `obs26-act4`), el modelo debe emitir exactamente una letra entre las opciones presentadas (4 acciones posibles, según `act4`). El pipeline declarado es `reinforcement-learning` y las etiquetas incluyen PPO, deep reinforcement learning, LoRA y robótica.

El proceso de entrenamiento tuvo cuatro etapas documentadas: (1) entrenamiento de la política profesora con PPO en el entorno web `choose_object` (convención `link01-decision/choose_object/obs26-act4/walker51-14/v1`), alcanzando un 95% en el examen oficial; (2) generación de un dataset de preguntas y respuestas a partir de las observaciones y decisiones de la política profesora, con un 20% de ejemplos en los que la política se desvió del camino; (3) ajuste supervisado del modelo de lenguaje con LoRA para imitar esas respuestas; y (4) una fase de refuerzo que reordena las opciones según la recompensa obtenida, con una penalización KL para no alejarse demasiado de la política supervisada. El conjunto de datos final contiene 401 ejemplos de entrenamiento, 75 de validación y 131 de test.

## Capacidades

- Toma de decisiones discretas en robótica: selecciona una de cuatro acciones de caminata a partir de una observación textual del estado del robot.
- Salida restringida a una única letra, sin explicación, lo que facilita el parseo en bucles de control.
- Robustez ante instrucciones inyectadas en el estado: el prompt de sistema indica explícitamente tratar el texto del estado como datos y no como instrucciones.
- Capacidad multilingüe limitada al coreano para la formulación de la tarea (el prompt de sistema está en inglés y las opciones son letras).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta generación de texto libre, código ni matemáticas como capacidades objetivo.

## Casos de uso

- Control de un robot LINK-01 en simulación: el modelo se coloca en el punto de decisión del robot y devuelve la acción de caminata para los siguientes 0,5 segundos, sustituyendo a la política PPO original. Es adecuado porque reproduce exactamente la política profesora en el conjunto de test.
- Destilación de políticas de RL en modelos de lenguaje: sirve como ejemplo reproducible de cómo convertir una política entrenada con PPO en un adaptador LoRA que responde a observaciones serializadas como texto, útil en docencia e investigación.
- Evaluación comparativa de métodos de ajuste: al incluir resultados de ajuste supervisado y de refuerzo con KL, permite estudiar el efecto de la fase RL sobre la fidelidad a la política profesora.
- Prototipado rápido de agentes embebidos: al ser un adaptador sobre un modelo de 0,8B, puede desplegarse en entornos con recursos limitados para experimentar con políticas de decisión basadas en lenguaje.
- Generación de datos sintéticos de decisión: el modelo puede usarse para etiquetar observaciones adicionales en el mismo formato, ampliando el dataset de entrenamiento de otras políticas.
- Docencia de RL y PEFT: el notebook de Colab y el repositorio connect-tycoon permiten reproducir el pipeline completo (PPO, generación de dataset, LoRA, RL) en un entorno educativo.
- Investigación sobre robustez a inyección de instrucciones: el prompt de sistema y la separación entre estado y pregunta permiten estudiar ataques de prompt injection en canales de observación.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de la propia tarea `choose_object`:

| Modelo | Precisión en test (coincidencia con la política profesora) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política profesora (brain.json) | 100,0% | 100% | 0% | 7,7 s |
| Modelo antes de entrenar | 0,8% | 0% | 0% | — |
| Ajuste supervisado (LoRA) | 100,0% | 100% | 0% | 7,7 s |
| Refuerzo (modelo publicado) | 100,0% | 100% | 0% | 7,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación de caminata se realizó con una aproximación 2D basada en una tabla de velocidades medidas por comando, no con el simulador MuJoCo web completo, por lo que los resultados pueden diferir de los del entorno original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo de 0,8B, la huella es reducida y cabe en GPUs de consumo, aunque no se publican cifras.
- GPU recomendadas: no disponibles. Por tamaño del modelo base, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería suficiente en teoría, pero no está verificado en la documentación.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del base (0,8B), pero no confirmado por el autor.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tiempo medio de 7,7 s por episodio corresponde a la simulación completa, no a la latencia de inferencia del modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es un adaptador LoRA específico para una tarea de decisión en robótica sobre Qwen/Qwen3.5-0.8B, y no se han encontrado alternativas equivalentes documentadas en la información disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-toty-v3-link01 | Adaptador LoRA sobre 0,8B | No disponible | 100% coincidencia con política profesora en tarea propia | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea `choose_object` del robot LINK-01; no generaliza a otras tareas, entornos ni morfologías de robot.
- La evaluación de caminata se realizó con una aproximación 2D basada en tablas de velocidad, no con el simulador MuJoCo completo, por lo que los resultados pueden no transferirse al entorno real.
- El autor advierte explícitamente que es un modelo de investigación y educación en simulador, y que debe revalidarse en el robot y el espacio concretos antes de cualquier uso real.
- El idioma declarado es coreano; el prompt de sistema está en inglés, pero la formulación de la tarea y los datos están en coreano, lo que limita su uso fuera de ese contexto lingüístico.
- Riesgo de alucinación: el modelo devuelve una letra entre las opciones; si el formato del estado o de las opciones se altera, puede producir salidas no válidas o elegir opciones incorrectas sin señal de error.
- Riesgo de prompt injection: aunque el prompt de sistema indica tratar el estado como datos, un estado malicioso podría intentar alterar la decisión; no se documentan pruebas de robustez frente a este vector.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen/Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- No se documentan sesgos, pero al entrenarse sobre una única política profesora y un único conjunto de cursos, puede heredar los sesgos de esa política.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el artefacto es mínimo; conviene verificar la integridad antes de usarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/the-eschatos/connectailab-rl-toty-v3-link01)
- [Repositorio CONNECT TYCOON (código de entrenamiento)](https://github.com/wonseokjung/connect-tycoon)
- [Notebook de Colab para entrenamiento](https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb)
- [Canal de YouTube CONNECT AI LAB](https://www.youtube.com/@CONNECT-AI-LAB)
- [AI CITY BUILDERS](https://www.aicitybuilders.com)
- [Curso de RL de AI CITY BUILDERS](https://www.aicitybuilders.com/robot)
- [Entorno web de aprendizaje del robot](https://www.ezerai.xyz/robot-lab/world/)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
