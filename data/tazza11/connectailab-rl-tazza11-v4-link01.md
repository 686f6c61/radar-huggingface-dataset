# tazza11/connectailab-rl-tazza11-v4-link01

## Resumen

LINK-01 es un adaptador LoRA de aprendizaje por refuerzo construido sobre el modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario tazza11 en el marco del proyecto CONNECT AI LAB x AI CITY BUILDERS. Su proposito es actuar como "cerebro de decision" para un robot simulado llamado LINK-01: recibe en texto el estado actual del robot (distancia al objetivo, direccion, sensores de distancia, velocidad y eleccion previa) y responde con una unica letra que representa la accion de caminata para los siguientes 0,5 segundos.

El modelo no es un LLM de proposito general, sino un destilado de una politica PPO previamente entrenada en un simulador web (brain.json). El flujo de construccion consistio en generar un conjunto de problemas a partir de las observaciones del cerebro PPO, aplicar aprendizaje supervisado (LoRA) para imitar sus respuestas y, finalmente, refinar con aprendizaje por refuerzo usando PPO con una penalizacion KL para mantener al modelo cerca de la politica supervisada.

Es relevante como ejemplo de hibridacion entre RL clasico y modelos de lenguaje: demuestra que un modelo de 0,8B de parametros, ajustado con LoRA, puede sustituir a una politica neuronal en una tarea de decision secuencial con una tasa de exito del 100% en 20 episodios de evaluacion. La licencia Apache 2.0 y su reducido tamano lo hacen accesible para experimentacion en entornos educativos y de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,8B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parametros, sobre el que se aplica un adaptador LoRA mediante la libreria PEFT. El adaptador se entrena en dos fases. En la primera, aprendizaje supervisado: se generan 899 ejemplos de entrenamiento, 192 de validacion y 286 de test a partir de las observaciones que el cerebro PPO (entrenado en el simulador web con tarea `follow_route`, contrato `link01-decision/follow_route/obs16-act5/walker51-14/v1`) registra cada 0,5 segundos. Cada ejemplo convierte la observacion en texto y la respuesta correcta es la accion elegida por el cerebro, con un 20% de ejemplos en los que se introducen desviaciones deliberadas.

En la segunda fase se aplica aprendizaje por refuerzo con PPO: para cada opcion de respuesta se calcula la recompensa que se habria obtenido si el cerebro PPO hubiera continuado la caminata tras esa eleccion, y se refuerzan las opciones mejores que la del profesor mientras se penalizan las peores, con una restriccion KL para evitar el colapso de la politica. El conjunto de datos presenta un limite teorico de acierto del 99% (proporcion en que el cerebro mantiene la misma respuesta al transcribir la observacion a texto).

## Capacidades

- Decision secuencial en un espacio de acciones discreto de 5 opciones (act5) a partir de observaciones textuales de 16 dimensiones (obs16).
- Respuesta en formato estricto de una sola letra, sin explicacion, tal como exige el system prompt del autor.
- Interpretacion de estado del robot: distancia al objetivo, direccion, lecturas de sensores de distancia, velocidad y accion previa.
- Aprendizaje por imitacion de una politica PPO y refinamiento posterior mediante RL.
- Capacidad multilingue limitada al coreano para los textos de estado y las opciones.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Navegacion de robot simulado en el simulador web de CONNECT AI WORLD: el modelo sustituye al cerebro PPO en el bucle de decision cada 0,5 segundos, seleccionando la accion de caminata a partir del estado textual.
- Docencia de aprendizaje por refuerzo: el repositorio incluye un notebook de Colab para reproducir el entrenamiento paso a paso, util en cursos introductorios de RL y PEFT.
- Investigacion sobre destilacion de politicas: permite estudiar como un LLM pequeno imita a una politica PPO y como el refinamiento con RL mejora marginalmente la tasa de acierto (85,0% a 85,3%).
- Evaluacion de robustez ante ruido: el 20% de ejemplos con desviaciones permite analizar el comportamiento del modelo cuando la politica de referencia se aleja del camino optimo.
- Prototipado de agentes embodied en entornos 2D: sirve como banco de pruebas para pipelines de decision basados en lenguaje antes de escalar a robots reales.
- Generacion de datos sinteticos de decision: el modelo puede producir trazas de acciones etiquetadas para entrenar otras politicas o para aumentar el conjunto de entrenamiento original.

## Benchmarks y rendimiento

| Modelo | Acierto en test (misma respuesta que el cerebro) | Exito en 20 episodios | Episodios con colision | Tiempo medio en episodios exitosos |
|---|---|---|---|---|
| Cerebro (profesor PPO) | 100,0% | 100% | 0% | 19,8 s |
| Modelo sin entrenar | 29,4% | 0% | 0% | — |
| Aprendizaje supervisado (LoRA) | 85,0% | 100% | 0% | 20,0 s |
| Aprendizaje por refuerzo (PPO) | 85,3% | 100% | 0% | 19,8 s |

La evaluacion de caminata se realizo con una aproximacion 2D basada en una tabla de velocidades medidas por comando (web MuJoCo), por lo que los resultados pueden diferir ligeramente de una simulacion MuJoCo completa. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,8B en precision completa (fp16), requiere aproximadamente 1,6 GB solo para pesos, mas overhead de activaciones y KV cache; en cuantizacion de 8 bits o 4 bits cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI tras fusionar el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada; el bucle de decision opera a 2 Hz (cada 0,5 segundos), por lo que la latencia por inferencia debe ser inferior a ese umbral.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| connectailab-rl-tazza11-v4-link01 | 0,8B (base) + LoRA | No disponible | Destilacion de politica PPO + RL | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | LLM generalista | No disponible | Hugging Face |
| Politica PPO original (brain.json) | No disponible | No aplica | RL clasico en simulador | No disponible | Repositorio connect-tycoon |

No se dispone de informacion sobre otros adaptadores LoRA de decision robotica comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion y educacion sobre simulador: el propio autor advierte que debe revalidarse en el robot y el espacio reales antes de cualquier uso fisico.
- La evaluacion de caminata usa una aproximacion 2D con tabla de velocidades, no una simulacion MuJoCo completa; los resultados pueden diferir en entornos mas realistas.
- Tasa de acierto respecto al cerebro del 85,3%, con un limite teorico del 99%: existe una brecha de aproximadamente 14 puntos atribuible a la transcripcion textual de las observaciones.
- Idioma limitado al coreano para los textos de estado y opciones; el soporte de otros idiomas no esta documentado.
- Riesgo de alucinacion: el modelo podria devolver una letra no incluida entre las opciones o texto adicional si el prompt no se respeta estrictamente; el system prompt del autor fuerza el formato de una sola letra.
- Espacio de acciones fijo de 5 opciones y observaciones de 16 dimensiones: no generaliza a otras tareas sin reentrenamiento.
- Sin datos publicados sobre sesgos, context length, cuantizacion o rendimiento en benchmarks estandar.
- Aunque la licencia es Apache 2.0, el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene revisar antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tazza11/connectailab-rl-tazza11-v4-link01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo de entrenamiento (CONNECT TYCOON): https://github.com/wonseokjung/connect-tycoon
- Notebook de Colab para reproducir el entrenamiento: https://colab.research.google.com/github/wonseokjung/connect-tycoon/blob/main/notebooks/link01_decision_model_colab.ipynb
- Simulador web de entrenamiento (CONNECT AI WORLD): https://www.ezerai.xyz/robot-lab/world/
- Canal de YouTube CONNECT AI LAB: https://www.youtube.com/@CONNECT-AI-LAB
- AI CITY BUILDERS: https://www.aicitybuilders.com
- Curso de RL con robots: https://www.aicitybuilders.com/robot
