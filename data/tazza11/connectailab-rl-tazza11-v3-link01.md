# tazza11/connectailab-rl-tazza11-v3-link01

## Resumen

connectailab-rl-tazza11-v3-link01 es un adaptador LoRA publicado por el usuario tazza11 (en el contexto del proyecto CONNECT AI LAB / AI CITY BUILDERS) sobre el modelo base Qwen/Qwen3.5-0.8B. No es un modelo de lenguaje generalista, sino un modelo de decisión para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra correspondiente a la acción de caminar durante los próximos 0,5 segundos. El problema que resuelve es convertir una política de refuerzo (un "cerebro" entrenado con PPO en un simulador web) en un formato que un modelo de lenguaje pueda ejecutar mediante instrucciones en texto.

La relevancia es acotada pero interesante como demostración metodológica: se destila una política PPO en un LLM pequeño mediante supervisión (LoRA), se refina después con RL usando recompensas por acción y se evalúa tanto en precisión de decisión como en una simulación de marcha aproximada en 2D. Con 0,8 mil millones de parámetros y un adaptador de tamaño prácticamente nulo (el repositorio ocupa 0,0 GB), el modelo es un ejemplo de cómo un LLM minúsculo puede actuar como controlador de decisión en un dominio estrecho, siempre que el espacio de acciones esté discretizado y el formato de entrada sea rígido.

El modelo está etiquetado con idioma coreano y pipeline reinforcement-learning, licencia Apache 2.0, y su uso previsto es investigación y educación sobre simulación, no despliegue en robótica real sin revalidación en el robot y el entorno concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only (Qwen/Qwen3.5-0.8B); el adaptador se aplica mediante PEFT |
| Parametros totales | No disponible (el modelo base Qwen3.5-0.8B tiene 0,8 mil millones; el adaptador LoRA no especifica su número de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B; no se indica en la model card) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors del adaptador; no se documentan cuantizaciones) |
| Idiomas soportados | Coreano (ko), según la etiqueta de idioma de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base Qwen/Qwen3.5-0.8B |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, y se entrena con PEFT/LoRA. El pipeline de entrenamiento descrito en la model card tiene cuatro fases: (1) entrenamiento de una política PPO ("cerebro", brain.json) en un simulador web para la tarea `avoid_obstacles`, con curso `random` y una tasa de éxito del 90 % en el examen oficial; (2) generación de un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del cerebro en texto, con la respuesta del cerebro como etiqueta y un 20 % de ejemplos con desviaciones; (3) aprendizaje supervisado del LLM con LoRA para imitar al cerebro; y (4) refinamiento con RL, donde cada opción recibe la recompensa que se habría obtenido si el cerebro hubiera continuado desde esa acción, con una penalización KL para mantener el modelo cerca de la política supervisada.

Los conjuntos de datos tienen 1.095 ejemplos de entrenamiento, 207 de validación y 281 de prueba. La model card indica que la tasa de acierto máxima alcanzable (el cerebro responde igual al texto) es del 100 %. No se detallan el número de tokens de entrenamiento, la composición del corpus lingüístico ni si hubo DPO; el ajuste fino es específico del dominio y no un entrenamiento generalista. La evaluación de marcha se realizó con una aproximación 2D basada en una tabla de velocidades por comando, sin el modelo robótico ni la red neuronal de marcha originales, por lo que los resultados pueden diferir de los de MuJoCo en el navegador.

## Capacidades

- Decisión de acciones discretas en un dominio concreto: dado un estado textual del robot LINK-01, devuelve exactamente una letra de entre las opciones listadas.
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra, sin explicación.
- Razonamiento de un solo paso sobre el estado (distancia, dirección, sensores, velocidad y acción previa), no planificación multi-paso.
- Capacidad multilingüe limitada al coreano según la etiqueta del modelo; no se documentan otras lenguas.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de pensamiento extendido.
- El modelo base Qwen3.5-0.8B podría conservar capacidades generales de lenguaje, pero el adaptador está especializado y no se han evaluado esas capacidades en esta ficha.

## Casos de uso

- Control de decisión en simulación educativa: integrar el modelo como sustituto del cerebro PPO en el simulador web de LINK-01 para demostrar cómo un LLM pequeño puede ejecutar una política de refuerzo descrita en texto.
- Investigación sobre destilación de políticas RL en LLM: usar el adaptador como caso de estudio de aprendizaje supervisado más refinamiento RL con recompensas por acción y penalización KL.
- Docencia de RL y PEFT: el repositorio incluye un cuaderno de Colab y código de entrenamiento (connect-tycoon), lo que permite reproducir el pipeline en cursos de aprendizaje por refuerzo.
- Evaluación de robustez de instrucciones: probar cómo responde el modelo a estados con ruido o a opciones mal formadas, útil para estudiar el comportamiento de LLM en tareas de decisión con formato rígido.
- Prototipado de interfaces texto-acción: servir como plantilla para convertir observaciones de sensores en prompts y acciones discretas en otros dominios simulados (navegación, evasión de obstáculos).
- Comparación de métodos de ajuste: medir la diferencia entre el aprendizaje supervisado y el refinamiento RL en un dominio de acciones finitas, usando los conjuntos de validación y prueba publicados (207 y 281 ejemplos).
- No se recomienda su uso como controlador de un robot físico sin una revalidación específica en el robot y el entorno, tal como advierte la propia model card.

## Benchmarks y rendimiento

| Modelo | Acierto en el conjunto de prueba (misma respuesta que el cerebro) | Éxito en 20 episodios del mismo curso | Episodios con colisión | Tiempo medio de los episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor, PPO) | 100,0 % | 95 % | 10 % | 21,3 s |
| Antes del entrenamiento (modelo base) | 42,3 % | 0 % | 10 % | — |
| Aprendizaje supervisado (LoRA) | 69,0 % | 75 % | 45 % | 24,6 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de la tabla proceden de la model card y corresponden a la tarea `avoid_obstacles`; la evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo completo. No se proporcionan resultados del modelo tras el refinamiento RL en la tabla, solo del aprendizaje supervisado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador sobre un modelo de 0,8 mil millones de parámetros, la inferencia en precisión completa requiere del orden de 2 a 3 GB, y en cuantización de 4 bits podría caber en menos de 1 GB, aunque estas cifras no están confirmadas en la información proporcionada.
- GPU recomendadas: no disponible; por tamaño, el modelo base de 0,8B es apto para GPU de consumo, pero no se documentan pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se confirma en la model card.
- Opciones de despliegue: la model card muestra el uso con transformers y peft (`PeftModel.from_pretrained` sobre `AutoModelForCausalLM`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-tazza11-v3-link01 | Adaptador LoRA sobre Qwen3.5-0.8B (0,8B base) | No disponible | Decisión discreta para robot simulado LINK-01 | Apache 2.0 | HuggingFace, 14 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | No disponible | LLM generalista | Según el modelo base (no indicada aquí) | HuggingFace |
| Política PPO "cerebro" (brain.json) | No disponible | No aplica | Política RL tabular/neuronal en simulador | No disponible | Incluida en el proyecto connect-tycoon |

No se dispone de información sobre otros adaptadores o modelos de decisión comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: solo responde a la tarea `avoid_obstacles` del robot LINK-01; fuera de ese formato de estado y opciones no se garantiza un comportamiento válido.
- Riesgo de alucinación: puede devolver una letra no listada o una explicación pese a la instrucción de responder solo con la letra; no se documenta una validación de salida.
- Precisión limitada: el aprendizaje supervisado alcanza un 69,0 % de coincidencia con el cerebro y un 75 % de éxito en 20 episodios, con un 45 % de episodios con colisión, frente al 95 % de éxito y 10 % de colisión del cerebro PPO.
- La evaluación de marcha usa una aproximación 2D con tabla de velocidades, no el simulador MuJoCo, por lo que los resultados pueden no trasladarse al entorno real.
- Idioma: la etiqueta del modelo indica coreano; no se documenta soporte de castellano ni de otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- Advertencia explícita del autor: es un modelo de investigación y educación sobre simulación; antes de usarlo en un robot real hay que revalidarlo en ese robot y ese espacio.
- Sin datos de sesgos, contexto máximo ni cuantizaciones probadas; el repositorio ocupa 0,0 GB y tiene 14 descargas y 0 likes, lo que indica una validación comunitaria mínima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tazza11/connectailab-rl-tazza11-v3-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
