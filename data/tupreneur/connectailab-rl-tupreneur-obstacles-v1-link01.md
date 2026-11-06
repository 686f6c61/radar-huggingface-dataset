# TUpreneur/connectailab-rl-tupreneur-obstacles-v1-link01

## Resumen

LINK-01 es un adaptador LoRA sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por TUpreneur en el marco del laboratorio CONNECT AI LAB (en colaboración con AI CITY BUILDERS). No es un modelo conversacional generalista, sino un modelo de decisión específico para el robot simulado LINK-01: recibe una descripción textual del estado del robot (distancia al objetivo, orientación, lecturas de sensores de distancia, velocidad y acción previa) y devuelve una única letra que codifica la acción de locomoción para los siguientes 0,5 segundos. El escenario entrenado es `avoid_obstacles` (evitación de obstáculos).

La construcción es un ejemplo de destilación de políticas de refuerzo hacia un modelo de lenguaje: primero se entrena una política PPO en un simulador web (el "cerebro", brain.json), después se generan pares observación-texto/acción que forman un corpus de 1180 ejemplos de entrenamiento, 255 de validación y 386 de test, y finalmente se afina el modelo base con LoRA en dos fases: supervisión (SFT) y refuerzo con PPO y anclaje KL. El resultado es un modelo de 0,8B de parámetros con una ventana de contexto heredada de Qwen3.5 y licencia Apache 2.0.

Es relevante como prueba de concepto de "modelos de lenguaje como política de decisión" en robótica simulada, y por su honestidad metodológica: la model card publica resultados negativos (0 % de éxito en las 20 rondas de evaluación) junto con los positivos, lo que lo convierte en un caso útil para estudiar los límites de la destilación SFT+RL frente a la política experta original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen/Qwen3.5-0.8B |
| Parametros totales | 0,8B en el modelo base; número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, sin dato explícito) |
| Tipos de cuantizacion | No disponible (el repo publica safetensors del adaptador; no se documentan GGUF ni cuantizaciones del adaptador) |
| Idiomas soportados | Coreano (ko) según la model card; el prompt de sistema está en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El pipeline de entrenamiento tiene cinco etapas documentadas: (1) entrenamiento de una política PPO en el simulador web CONNECT AI WORLD para la tarea `avoid_obstacles`, con convención `link01-decision/avoid_obstacles/obs21-act5/walker51-14/v1` y curso `random`, alcanzando un 100 % en el examen oficial; (2) generación de un corpus de problemas a partir de las observaciones del cerebro cada 0,5 s, con la respuesta del cerebro como etiqueta y un 20 % de ejemplos con desviaciones deliberadas; (3) ajuste supervisado (LoRA/SFT) del modelo de lenguaje sobre ese corpus; (4) refuerzo con PPO sobre las opciones de respuesta, usando como recompensa el retorno que habría obtenido el cerebro si hubiera continuado desde esa acción, con anclaje KL al modelo SFT; y (5) evaluación colocando el modelo en el puesto de decisión del robot durante 20 rondas (semillas 91001–91020).

La evaluación de la locomoción se realiza con una aproximación 2D basada en una tabla de velocidades por comando (derivada de MuJoCo web), sin red neuronal de marcha ni modelo físico del robot, por lo que no hay caídas y los resultados pueden diferir de una simulación MuJoCo completa. El techo teórico de acierto (proporción en que el cerebro y el texto generan la misma respuesta) es del 99 %.

## Capacidades

- Clasificación de acciones discretas: dado un estado textual del robot, devuelve exactamente una letra entre las opciones listadas (5 acciones en la convención `act5`).
- Decisión de locomoción a 2 Hz (una acción cada 0,5 s) para el robot simulado LINK-01.
- Seguimiento de instrucciones estrictas de formato: el prompt de sistema exige devolver solo la letra, sin explicación.
- Tratamiento de datos no confiables: el prompt indica explícitamente tratar el contenido del estado como datos y no como instrucciones (mitigación básica de prompt injection).
- Razonamiento multi-paso implícito: la acción previa forma parte de la observación, lo que permite cierta continuidad temporal, aunque sin memoria explícita más allá de ese campo.
- Capacidades multilingües: limitadas al coreano declarado; el prompt de sistema está en inglés y no se documenta soporte adicional.
- No se documentan tool calling, function calling, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en destilación de políticas RL a modelos de lenguaje: el adaptador sirve como caso de estudio reproducible de cómo una política PPO (100 % de éxito) se degrada al textualizarse y destilarse (60,9 % de acierto y 0 % de éxito en 20 rondas), útil para medir la brecha entre política experta y modelo de lenguaje.
- Docencia de reinforcement learning aplicado: el notebook de Colab y el repositorio CONNECT TYCOON permiten reproducir el pipeline completo (PPO en simulador, generación de corpus, SFT y PPO con KL) en un entorno de bajo coste con un modelo de 0,8B.
- Prototipado de agentes de decisión en simulación 2D: integrable en el simulador web CONNECT AI WORLD para experimentar con variantes de observación (`obs21`), número de acciones (`act5`) y cursos (`random`) sin tocar el modelo base.
- Generación de datos sintéticos de decisión: el par observación textual/acción puede reutilizarse como corpus para entrenar otros clasificadores o para aumentar el dataset de la tarea `avoid_obstacles`.
- Evaluación de robustez frente a instrucciones embebidas: el diseño con separación estado/instrucción permite probar ataques de prompt injection en el campo de estado y medir la tasa de obediencia indebida del adaptador.
- Base para experimentos de RLHF/PPO con recompensas externas: la implementación de referencia con anclaje KL sobre un modelo pequeño sirve para validar pipelines de refuerzo antes de escalar a modelos mayores.
- No se recomienda su uso directo como controlador de un robot real: la propia model card advierte que es un modelo de investigación y educación sobre simulador y debe revalidarse en el robot y el espacio concretos.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación sobre el conjunto de test de 386 problemas y 20 rondas de caminata con semillas 91001–91020):

| Modelo | Acierto en test (misma respuesta que el cerebro) | Éxito en 20 rondas | Rondas con colisión | Tiempo medio en rondas exitosas |
|---|---|---|---|---|
| Cerebro PPO (profesor) | 100,0 % | 100 % | 10 % | 25,9 s |
| Modelo base sin entrenar | 40,2 % | 0 % | 10 % | — |
| Tras SFT (LoRA) | 59,1 % | 0 % | 95 % | — |
| Tras RL (PPO + KL) | 60,9 % | 0 % | 90 % | — |

El refuerzo mejora el acierto respecto al SFT en 1,8 puntos porcentuales, pero no reduce las colisiones ni logra ninguna ronda exitosa. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,8B ocupa aproximadamente 1,6 GB en fp16 y unos 0,5 GB en cuantización de 4 bits; el adaptador LoRA añade una cantidad marginal (tamaño exacto no disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el modelo base en fp16; para entrenamiento del adaptador, una RTX 3060/4060 de 8–12 GB resulta adecuada dado el tamaño del modelo y del corpus (1180 ejemplos).
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4090 y equivalentes; también en CPU para inferencia puntual con llama.cpp si se convierte el modelo fusionado a GGUF (no publicado).
- Opciones de despliegue: transformers + PEFT (método documentado en la model card); vLLM y TGI requerirían fusionar el adaptador con el modelo base; llama.cpp/Ollama solo tras conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles. La tarea exige una decisión cada 0,5 s, por lo que en producción simulada la latencia debe ser inferior a ese umbral, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LINK-01 (este modelo) | 0,8B + LoRA | No disponible | Decisión de evitación de obstáculos (5 acciones) | Apache 2.0 | Hugging Face, repo de 0,0 GB |
| Qwen3.5-0.8B (base) | 0,8B | No disponible | Lenguaje general | Apache 2.0 (según base) | Hugging Face |
| Cerebro PPO original (brain.json) | No aplica (tabla/política) | No aplica | Misma tarea, 100 % de éxito | No especificada | Repositorio CONNECT TYCOON |

No se dispone de comparaciones con otros adaptadores de decisión robótica de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento insuficiente para control real: 0 % de éxito en 20 rondas y entre el 90 % y el 95 % de rondas con colisión, frente al 100 % del cerebro PPO original.
- Brecha de textualización: el techo de acierto es del 99 %, pero el modelo solo alcanza el 60,9 %, lo que indica que la representación textual del estado pierde información relevante para la política.
- Evaluación aproximada: la locomoción se mide con una tabla de velocidades 2D derivada de MuJoCo web, sin modelo físico del robot; los resultados pueden diferir de una simulación completa y no cubren caídas.
- Alcance muy restringido: una sola tarea (`avoid_obstacles`), una sola convención de observación (`obs21`) y cinco acciones (`act5`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Idioma: declarado únicamente coreano; el prompt de sistema está en inglés y no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación de formato: puede devolver texto distinto de una letra válida; el prompt de sistema lo mitiga pero no lo elimina.
- Sesgos: no documentados; el corpus procede de una única política y un único curso (`random`), por lo que hereda las preferencias y los puntos ciegos de esa política.
- Licencia: Apache 2.0 permite uso comercial, pero la model card restringe explícitamente el uso a investigación y educación sobre simulador y exige revalidación antes de usar en un robot real.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin garantías de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/TUpreneur/connectailab-rl-tupreneur-obstacles-v1-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de código: https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento: https://www.ezerai.xyz/robot-lab/world/
- YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL: https://www.aicitybuilders.com/robot
