# varadha2k/slm-rl-colab

## Resumen

`varadha2k/slm-rl-colab` es un adaptador LoRA (PEFT) desarrollado por el usuario varadha2k para el taller SLM-RL, un framework de aprendizaje por refuerzo aplicado a modelos de lenguaje. El adaptador se entrena sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` para jugar al juego de Atari **Boxing**, generando acciones válidas en cada turno. No es un modelo de lenguaje general, sino un componente especializado que convierte un LLM en un agente de juego mediante ajuste fino con rechazo (reject_sft) sobre demostraciones de un profesor DQN.

La relevancia de este adaptador radica en su demostración de cómo un modelo de lenguaje pequeño (1.2B parámetros) puede adaptarse a tareas de control secuencial mediante aprendizaje por refuerzo, con métricas de validación que muestran una tasa de acciones inválidas de 0.0 y una tasa de intervención de 0.0, lo que indica que el agente produce acciones legales de forma consistente. El adaptador está diseñado para integrarse en el pipeline de evolución de SLM-RL, permitiendo iteraciones posteriores sobre el mismo juego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `LiquidAI/LFM2.5-1.2B-Instruct` (arquitectura del base no especificada en la informacion disponible) |
| Parametros totales | No disponible (el adaptador LoRA anade un numero reducido de parametros; el modelo base tiene 1.2B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bfloat16 o float32 segun el dispositivo; el modelo base puede cuantizarse, pero no se indica) |
| Idiomas soportados | No disponible (el adaptador genera acciones de juego, no texto en idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | PEFT LoRA (safetensors dentro de subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA (Low-Rank Adaptation) aplicada al modelo `LiquidAI/LFM2.5-1.2B-Instruct`. No se proporcionan detalles sobre la arquitectura interna del modelo base (si es transformer, MoE, etc.), pero al ser un modelo de 1.2B parametros, es probable que sea un transformer decoder estándar. El entrenamiento se realizó con el metodo `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un agente DQN en el entorno Boxing de Atari. El dataset de entrenamiento está disponible en `varadha2k/slm-rl-colab-data`. Las metricas de entrenamiento registradas incluyen una pérdida de 0.0213, un KL de 0.464, una recompensa media de 0.242 y una entropía de 0.086, con 16 prompts y 8 episodios de evaluación. No se menciona el uso de RLHF ni DPO; el enfoque es puramente de aprendizaje por refuerzo sobre tareas de juego.

## Capacidades

- Generacion de acciones para el juego Boxing de Atari: el modelo recibe un prompt con las acciones legales y responde con un identificador de accion (por ejemplo, `ACTION: <id>`).
- Integracion con el framework SLM-RL: el adaptador se puede cargar como un agente dentro del pipeline de evolucion del taller, permitiendo iteraciones geneticas sobre el mismo.
- Soporte de tool calling: no aplica, ya que el modelo no interactua con herramientas externas, sino que genera acciones directamente.
- Capacidades multilingues: no aplica, el modelo solo produce identificadores de accion.
- Capacidades especiales: el adaptador esta optimizado para producir acciones validas (invalid_rate 0.0) y no requiere intervencion humana (intervention_rate 0.0) en los episodios de evaluacion.

## Casos de uso

- Investigacion en aprendizaje por refuerzo con LLMs: el adaptador sirve como punto de partida para experimentos en el taller SLM-RL, permitiendo estudiar como un LLM puede aprender politicas de control a partir de demostraciones.
- Desarrollo de agentes de juego en entornos retro: puede integrarse en sistemas que requieran un agente capaz de jugar a Boxing, por ejemplo, para evaluar algoritmos de RL o para generar datos de entrenamiento.
- Benchmarking de adaptadores LoRA en tareas no linguisticas: util para comparar la eficacia de LoRA frente a otros metodos de ajuste en dominios de control.
- Prototipado rapido de agentes con LLMs: dado su tamano reducido (1.2B base), puede ejecutarse en hardware modesto, lo que facilita pruebas rapidas en entornos de investigacion.
- Generacion de datos sinteticos de juego: el adaptador puede usarse para generar trayectorias de juego que luego sirvan para entrenar otros modelos o para analisis.
- Educacion en RL y PEFT: como ejemplo didactico de como combinar LoRA con RL para tareas de control, con codigo de carga disponible en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo no esta disenado para tareas de lenguaje general, sino para el juego Boxing. Las unicas metricas registradas son las de entrenamiento y evaluacion del taller SLM-RL:

| Metrica | Valor |
|---|---|
| Episodios de evaluacion | 8 |
| Tasa de intervencion | 0.0 |
| Tasa de acciones invalidas | 0.0 |
| Puntuacion media | 0.0 |
| Tasa de victorias | 0.0 |
| Recompensa media (entrenamiento) | 0.242 |
| Perdida (entrenamiento) | 0.0213 |
| KL (entrenamiento) | 0.464 |

Estos valores indican que el adaptador produce acciones legales sin intervencion, pero la puntuacion media es 0.0, lo que sugiere que el rendimiento en el juego es limitado en la evaluacion inicial.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1.2B parametros en bfloat16 ocupa aproximadamente 2.4 GB de VRAM. El adaptador LoRA anade una cantidad minima (tipicamente menos de 100 MB). Por tanto, se estima que la inferencia requiere al menos 3 GB de VRAM, aunque no se proporcionan datos exactos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4090, A100, H100). En CPU tambien es posible, aunque mas lento.
- Compatibilidad con GPUs consumer: si, cabe en GPUs de gama media y alta.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python, o integrarse en el CLI de SLM-RL. No se mencionan opciones como vLLM, llama.cpp u Ollama, pero al ser un modelo pequeno, podria adaptarse.
- Latencia y throughput: no disponible. Dado el tamano del modelo, se espera una latencia baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para el mismo juego o framework. El modelo base `LiquidAI/LFM2.5-1.2B-Instruct` es un LLM de 1.2B parametros, pero no se conocen otros adaptadores de SLM-RL publicados en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta disenado exclusivamente para el juego Boxing; no es util para tareas de lenguaje general ni para otros juegos sin reentrenamiento.
- La puntuacion media en evaluacion es 0.0, lo que indica que el rendimiento en el juego es bajo; el adaptador es un punto de partida para evolucion, no un agente final optimizado.
- No se han documentado sesgos especificos, pero al ser un modelo entrenado con demostraciones de un DQN, puede heredar sesgos del profesor (por ejemplo, preferencias de acciones).
- Riesgo de alucinacion: en el contexto de generacion de acciones, el modelo podria producir identificadores de accion no validos si se le presentan prompts fuera de distribucion, aunque la tasa de invalidez en evaluacion es 0.0.
- Limitaciones de contexto: el modelo solo procesa prompts cortos con acciones legales; no maneja conversaciones largas ni razonamiento complejo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener su propia licencia; se debe verificar la del base.
- El adaptador depende de la version exacta del modelo base; cambios en el base podrian romper la compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/varadha2k/slm-rl-colab
- Dataset de entrenamiento: https://huggingface.co/datasets/varadha2k/slm-rl-colab-data
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Framework SLM-RL: https://github.com/CraftsMan-Labs/SLM-RL
- Repositorio de modelos SLM-RL (referencia): https://github.com/inde5media/SLM-RL-MODELS
