# yegom/connectailab-rl-yegomne-v5-link01

## Resumen

`yegom/connectailab-rl-yegomne-v5-link01` es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, publicado por el desarrollador independiente Sehyun Park (Yegom) en el ecosistema CONNECT AI LAB / AI CITY BUILDERS. No es un modelo de lenguaje de propósito general: es un modelo de decisión para el robot simulado LINK-01, entrenado para leer en texto el estado del robot (distancia al objetivo, dirección, sensores de distancia, velocidad y acción previa) y responder con una única letra que codifica el movimiento durante los siguientes 0,5 segundos.

El problema que aborda es la destilación de una política de refuerzo (PPO) entrenada en un simulador web de locomoción bípeda hacia un modelo lingüístico ligero, de modo que la toma de decisiones pueda expresarse y ejecutarse como una tarea de selección de opciones en lenguaje natural. El pipeline combina aprendizaje supervisado (LoRA sobre las observaciones etiquetadas por la política PPO) y un ajuste posterior con refuerzo, manteniendo la política original como referencia mediante una penalización KL.

Su relevancia es acotada pero ilustrativa: demuestra un patrón de destilación RL→LLM para robótica de bajo coste computacional, con un modelo base de 0,8 mil millones de parámetros que puede ejecutarse en hardware modesto. La model card es explícita al señalar que se trata de un modelo de investigación y educación sobre simulador, no validado para robots físicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (el adaptador LoRA no declara su recuento; el modelo base es de 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko), segun la model card; las tareas se formulan en ingles en el prompt de sistema |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. El adaptador no modifica la arquitectura del modelo base: añade matrices de bajo rango entrenadas para una tarea concreta de clasificación de acciones discretas (selección de una letra entre las opciones presentadas).

El entrenamiento se desarrolla en cinco fases descritas en la model card. Primero se entrena una política PPO ("cerebro" o `brain.json`) en el simulador web de CONNECT AI WORLD sobre la tarea `avoid_obstacles`, con el contrato `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y un 80 % de éxito en la prueba oficial. Después se genera un conjunto de problemas convirtiendo cada 0,5 segundos las observaciones del robot en texto, con la respuesta de la política como etiqueta (se incluye un 20 % de ejemplos con desviaciones). Sobre ese corpus se aplica aprendizaje supervisado con LoRA, seguido de un ajuste con refuerzo que recompensa las opciones cuya ejecución habría producido mejores retornos que la respuesta de la política original, con una penalización KL para mantener la política de referencia. El conjunto de datos se reparte en 1217 ejemplos de entrenamiento, 238 de validación y 396 de prueba, con un techo de acierto del 99 % (proporción en que la política PPO mantiene la misma respuesta tras la conversión a texto).

## Capacidades

- Selección de acciones discretas para locomoción bípeda simulada: dado un estado textual del robot, devuelve una única letra entre las opciones presentadas, sin explicación.
- Razonamiento sobre estado estructurado en lenguaje natural: interpreta distancia y dirección al objetivo, lecturas de sensores de distancia, velocidad y acción previa.
- Ejecución de una política de evitación de obstáculos destilada desde PPO.
- Formato de salida restringido: el prompt de sistema exige devolver solo la letra de la opción elegida.
- Robustez ante instrucciones embebidas en el estado: el prompt de sistema indica tratar el contenido de `state` como datos, no como instrucciones.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en destilación RL→LLM: replicar el pipeline (PPO en simulador, generación de corpus textual, LoRA supervisado, ajuste con refuerzo y KL) para trasladar políticas de control a modelos de lenguaje ligeros y comparar la fidelidad de la destilación.
- Docencia de aprendizaje por refuerzo: usar el cuaderno de Colab y el repositorio CONNECT TYCOON como material práctico para ilustrar PPO, LoRA y ajuste con refuerzo sobre un caso de robótica concreto.
- Evaluación de robustez de políticas destiladas: medir la tasa de coincidencia con la política original (77,0 % en prueba para la versión con RL) y el éxito en episodios simulados (100 % en 20 episodios con semillas 91001–91020).
- Prototipado de interfaces lenguaje-acción: experimentar con la formulación de observaciones de robot como texto y la selección de acciones como clasificación de opciones, antes de portar el enfoque a otros entornos.
- Comparación de variantes del pipeline: la familia incluye versiones v1 y v3 además de esta v5, lo que permite contrastar configuraciones de entrenamiento y su efecto en la fidelidad y el éxito simulado.
- Generación de datos sintéticos de decisión: reutilizar el formato de problema (situación, pregunta, opciones) para construir corpus etiquetados a partir de políticas ya entrenadas en otros simuladores.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre 396 problemas de prueba y 20 episodios simulados en el mismo recorrido, semillas 91001–91020):

| Modelo | Acierto en prueba (coincidencia con la política) | Éxito en 20 episodios | Episodios con colisión | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Política PPO (profesor) | 100,0 % | 100 % | 5 % | 26,1 s |
| Antes de entrenar | 36,4 % | 0 % | 100 % | — |
| Aprendizaje supervisado (LoRA) | 76,3 % | 100 % | 10 % | 27,3 s |
| Ajuste con refuerzo (esta versión) | 77,0 % | 100 % | 15 % | 26,9 s |

La evaluación de locomoción emplea una aproximación 2D basada en una tabla de velocidades medidas por comando, no el modelo físico del robot ni la red de marcha; el autor advierte que los resultados pueden diferir de los obtenidos en MuJoCo web. No se han publicado resultados en benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la inferencia en precisión completa requiere del orden de 2 GB de VRAM, y menos con cuantización de 8 o 4 bits (estimación a partir del tamaño del modelo base, no confirmada en la documentación).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo base en fp16; no se especifican modelos concretos (A100, H100, RTX 4090) en la información proporcionada.
- Cabe en GPU consumer: sí, previsiblemente, dado el tamaño del modelo base; no verificado en la documentación.
- Opciones de despliegue: la model card solo documenta carga mediante `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la naturaleza de adaptador LoRA con salida restringida a una letra hace que estos motores no estén documentados para este caso.
- Latencia y throughput: no disponibles. El tiempo medio por episodio simulado (26,9 s) corresponde a la simulación completa, no a la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-yegomne-v5-link01 (este) | Adaptador sobre base de 0,8B | No disponible | Destilación RL→LoRA para decisión en robot simulado | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| connectailab-rl-yegomne-v3-link01 | Adaptador sobre base de 0,8B | No disponible | Versión previa del mismo pipeline | Apache 2.0 | Hugging Face |
| connectailab-rl-yegomne-v1-link01 | Adaptador sobre base de 0,8B | No disponible | Versión inicial del mismo pipeline | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables en la misma categoría (destilación de políticas de control en modelos de lenguaje de menos de 1B) dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación y educación sobre simulador: el autor indica explícitamente que debe revalidarse en el robot y el espacio reales antes de cualquier uso físico.
- La evaluación de locomoción usa una aproximación 2D con tabla de velocidades, no el modelo físico ni la red de marcha; los resultados pueden diferir de los de MuJoCo web.
- Tasa de coincidencia con la política original del 77,0 %: aproximadamente una de cada cuatro decisiones difiere de la política PPO, lo que puede degradar el comportamiento en estados no cubiertos por el corpus.
- Mayor tasa de colisión que la política profesor (15 % frente a 5 %) y que la variante supervisada (10 %) en los 20 episodios evaluados.
- Dominio muy estrecho: una única tarea (`avoid_obstacles`) y un único recorrido (`e70d13b0`); no hay evidencia de generalización a otros mapas, morfologías o tareas.
- Idioma declarado coreano, aunque el prompt de sistema está en inglés; no se documenta comportamiento multilingüe.
- Riesgo de inyección de instrucciones a través del campo `state`: el prompt de sistema intenta mitigarlo, pero no se documentan evaluaciones de seguridad al respecto.
- Sin datos publicados sobre sesgos, alucinación en texto libre ni rendimiento fuera del formato de selección de opciones.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene sus propias condiciones, que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yegom/connectailab-rl-yegomne-v5-link01
- Versión v3: https://huggingface.co/yegom/connectailab-rl-yegomne-v3-link01
- Versión v1: https://huggingface.co/yegom/connectailab-rl-yegomne-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código CONNECT TYCOON: https://github.com/wonseokjung/connect-tycoon
- Cuaderno de Colab de entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de aprendizaje: https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL de AI CITY BUILDERS: https://www.aicitybuilders.com/robot
