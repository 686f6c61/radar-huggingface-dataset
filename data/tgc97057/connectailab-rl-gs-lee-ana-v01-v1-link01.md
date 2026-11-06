# tgc97057/connectailab-rl-gs.lee-ana-v01-v1-link01

## Resumen

LINK-01 es un adaptador LoRA de tipo PEFT sobre el modelo base Qwen/Qwen3.5-0.8B, entrenado para la toma de decisiones de un robot simulado llamado LINK-01 en la tarea de evitar obstáculos (`avoid_obstacles`). El modelo recibe una descripción en texto del estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y devuelve una única letra que corresponde a la siguiente acción de caminata para los próximos 0,5 segundos. Lo desarrolla el usuario tgc97057 en colaboración con CONNECT AI LAB y AI CITY BUILDERS, un proyecto de investigación y divulgación sobre aprendizaje por refuerzo.

El modelo no es un LLM de propósito general, sino un adaptador que destila el comportamiento de una política PPO entrenada en un simulador web (un "cerebro" denominado brain.json) dentro de un modelo de lenguaje pequeño. El proceso combina aprendizaje supervisado (LoRA sobre pares observación-texto → acción) y un posterior ajuste con refuerzo (PPO con restricción KL) para alinear las respuestas del modelo con las recompensas obtenidas en el simulador. La relevancia es acotada y educativa: demuestra cómo destilar políticas de RL en modelos de lenguaje para tareas de decisión discretas y evaluar su rendimiento en un entorno simulado.

El tamaño del adaptador es mínimo (repositorio de 0,0 GB), el idioma declarado es coreano (`ko`), la licencia es Apache 2.0 y la pipeline declarada es `reinforcement-learning`. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de los recuentos de preguntas, ni de benchmarks estándar de LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | no disponible (no especificados en la model card) |
| Idiomas soportados | coreano (`ko`) declarado; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros, mediante LoRA (PEFT). La tarea es de clasificación discreta: dado un estado textual del robot, el modelo debe emitir exactamente una letra entre las opciones listadas. El entrenamiento se realizó en dos fases. Primero, aprendizaje supervisado sobre un conjunto de pares generados a partir de la política PPO "profesora" (brain.json) mientras esta recorría el curso `c11e6693`; cada 0,5 segundos se convertía la observación del robot en texto y la acción del cerebro en la etiqueta. Se incluyó un 20 % de ejemplos donde el cerebro tomó una acción distinta a la óptima, para cubrir situaciones de desvío. Los recuentos de preguntas son: 2.975 de entrenamiento, 286 de validación y 466 de test.

La segunda fase aplicó refuerzo (PPO) con restricción KL: para cada opción se estimó la recompensa que se habría obtenido si el cerebro hubiera continuado la caminata tras esa acción, subiendo la probabilidad de opciones mejores que la del profesor y bajando la de las peores. La evaluación final se realizó colocando el modelo de decisión en el puesto de mando del robot y recorriendo el mismo curso 20 veces (semillas 91001–91020). La caminata se midió con una aproximación 2D basada en una tabla de velocidades por comando (sin red neuronal de caminata), por lo que los resultados pueden diferir de los de MuJoCo en el navegador. No se especifican el número total de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Toma de decisiones discretas en un entorno de robótica simulado: selecciona una de las opciones de acción listadas para el siguiente intervalo de 0,5 segundos.
- Procesamiento de estados textuales estructurados que incluyen distancia al objetivo, dirección, lecturas de sensores de distancia, velocidad y acción previa.
- Respuesta en formato restringido: devuelve únicamente la letra de la opción elegida, sin explicación, cuando se usa el prompt de sistema indicado.
- Robustez parcial ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el contenido de `state` como datos y no como instrucciones.
- Capacidad multilingüe limitada: el idioma declarado es coreano; el prompt de sistema y las etiquetas de acción están en inglés.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Investigación educativa sobre destilación de políticas RL en LLM: el adaptador sirve para estudiar cómo una política PPO discreta puede transferirse a un modelo de lenguaje pequeño mediante LoRA y ajuste con refuerzo, comparando las tasas de acierto frente al profesor (92,9 % en supervisado, 92,1 % en RL).
- Evaluación de agentes en simuladores de robótica: puede insertarse en el bucle de decisión de un robot simulado LINK-01 para medir la tasa de éxito en el curso `c11e6693` (70 % en supervisado, 65 % en RL, frente al 60 % del cerebro profesor).
- Docencia y divulgación de RL: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (entrenamiento del cerebro, generación del dataset, LoRA y PPO) con fines formativos.
- Pruebas de robustez de prompts: al recibir estados en texto, permite experimentar con inyección de instrucciones en el campo `state` y verificar si el modelo respeta la restricción de responder solo con una letra.
- Prototipado rápido de clasificadores de acción de bajo coste: con solo 0,8B de parámetros y un adaptador LoRA, puede desplegarse en entornos con recursos limitados para tareas de decisión acotadas, siempre que se revalide en el dominio objetivo.
- Comparación de estrategias de alineación: sirve como caso de estudio para contrastar aprendizaje supervisado frente a PPO con KL en una tarea de decisión discreta, observando el equilibrio entre precisión (92,9 % vs. 92,1 %) y éxito en simulación (70 % vs. 65 %).

## Benchmarks y rendimiento

Los únicos datos disponibles son los de la model card, medidos en el propio entorno del proyecto (curso `c11e6693`, 20 episodios con semillas 91001–91020, caminata aproximada en 2D). No son benchmarks estándar de LLM (MMLU, HumanEval, GSM8K, etc.), que no se han publicado.

| Modelo | Acierto en test (misma acción que el cerebro) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro profesor (PPO) | 100,0 % | 60 % | 55 % | 30,9 s |
| Antes del entrenamiento | 39,9 % | 0 % | 0 % | — |
| Aprendizaje supervisado (LoRA) | 92,9 % | 70 % | 50 % | 31,9 s |
| Ajuste con refuerzo (PPO + KL) | 92,1 % | 65 % | 45 % | 29,2 s |

El modelo subido a Hugging Face corresponde a la variante de aprendizaje supervisado, según indica la model card ("올린 모델: 지도학습"). El límite superior de acierto (proporción en que el cerebro da la misma respuesta al pasar la observación a texto) es del 100 %.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un modelo base de 0,8B más un adaptador LoRA, la huella es reducida, pero no se publican cifras.
- GPU recomendadas: no especificadas en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del modelo base (0,8B) es plausible en GPUs de consumo, pero no hay datos oficiales.
- Opciones de despliegue: la model card muestra uso con `transformers` + `peft` (`PeftModel.from_pretrained`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores LoRA para decisión robótica destilada de políticas PPO sobre modelos de 0,8B). La comparación interna disponible es la del propio proyecto:

| Modelo | Parámetros | Contexto | Acierto test | Éxito simulado | Licencia |
|---|---|---|---|---|---|
| LINK-01 (este adaptador) | 0,8B (base) + LoRA | no disponible | 92,9 % | 70 % | Apache 2.0 |
| Cerebro profesor (PPO) | no disponible | no aplica | 100,0 % | 60 % | no disponible |
| Qwen3.5-0.8B sin adaptador | 0,8B | no disponible | 39,9 % | 0 % | no disponible en la información |

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador: la propia model card advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de caminata usa una aproximación 2D con tabla de velocidades por comando, sin red neuronal de caminata; los resultados pueden diferir de los de MuJoCo en el navegador.
- El éxito en simulación es moderado (70 % en supervisado, 65 % en RL) y la tasa de colisión es alta (50 y 45 episodios de 20, respectivamente, según la tabla), lo que limita su uso en producción.
- El modelo solo emite una letra entre opciones predefinidas; no genera explicaciones ni razonamiento, y depende del formato exacto del prompt de sistema.
- Riesgo de inyección de instrucciones a través del campo `state`: el prompt de sistema pide tratar el estado como datos, pero no se documenta una evaluación específica de robustez frente a este vector.
- Idioma declarado coreano; el prompt de sistema está en inglés, lo que puede afectar a la consistencia en otros idiomas.
- No se publican datos sobre sesgos, tasas de alucinación, número de tokens de entrenamiento ni composición del dataset.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones, que deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tgc97057/connectailab-rl-gs.lee-ana-v01-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje del robot: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
