# vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.1

## Resumen

LFM2.5-2.6B-junie-harbor-rl-v0.1 es un checkpoint intermedio de un ajuste fino mediante aprendizaje por refuerzo (GRPO asíncrono) sobre el modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario vvsotnikov. El objetivo del entrenamiento es especializar un modelo pequeno (2.697 millones de parametros) como motor de un agente de codigo en linea de comandos, concretamente el CLI JetBrains Junie, para resolver tareas de analisis de datos dentro de sandboxes Docker. El repositorio contiene tanto los pesos fusionados en bf16 como el adaptador LoRA independiente.

El modelo parte de la arquitectura LFM2.5 de LiquidAI, un transformer de 2.6B de parametros con licencia LFM Open License v1.0. La relevancia de esta publicacion es principalmente metodologica: documenta de forma transparente un pipeline de RL multi-harness sobre un modelo pequeno en una sola GPU, reproduciendo a escala reducida el setup descrito en la guia "multi-harness RL" y la ficha del modelo de 24B de harness-hub. No obstante, se trata de un snapshot en el paso 20 de aproximadamente 440 previstos, sin evaluaciones de benchmark publicadas.

Al ser un checkpoint intermedio y no un modelo final, no debe considerarse un artefacto listo para produccion. Su interes reside en la trazabilidad del proceso de entrenamiento y en servir como referencia para quienes replican tecnicas de RL con agentes reales sobre modelos de menos de 3B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2.5 (modelo base LiquidAI/LFM2.5-2.6B), ajustado con LoRA fusionado |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; compatible con cuantizacion via llama.cpp/vLLM segun el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (modelo fusionado bf16) + adaptador LoRA en `lora-adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 2.6B parametros heredado de LiquidAI/LFM2.5-2.6B, sobre el que se aplico un ajuste con LoRA de rango 32 y alpha 64 en todas las capas lineales, posteriormente fusionado en los pesos base. El entrenamiento emplea GRPO asincrono mediante el `AsyncGRPOTrainer` de TRL, con 8 rollouts por tarea, temperatura 1.0, hasta 40 llamadas al modelo y 1.800 segundos por rollout, y un maximo de 16.384 tokens por llamada. La tasa de aprendizaje es 1e-5 y se guardan checkpoints cada 10 pasos.

Los datos de entrenamiento son las primeras 1.000 tareas del dataset FineEnvs/SmolDataEnvs-harbor-train, sin cribado y barajadas. La funcion de recompensa combina la correccion del verificador de la tarea con un pequeno bonus de eficiencia de herramientas (peso 0.1) aplicado solo a respuestas correctas. El harness utilizado es el CLI de agente de codigo JetBrains Junie ejecutandose en modo headless dentro de sandboxes Docker, capturando en cada llamada los tokens de prompt, los tokens muestreados y los logprobs como datos de entrenamiento. Se emplean 4 micro-lotes de gradiente por paso. El autor senala diferencias respecto a las configuraciones de referencia: pool de tareas sin cribar, bonus de eficiencia de 0.1, y uso de Junie en lugar de pi.

## Capacidades

- Generacion de texto conversacional con la interfaz estandar de chat/completions de LFM2.5.
- Razonamiento multi-paso orientado a tareas de analisis de datos dentro de un agente.
- Uso de herramientas (tool calling) en el contexto del harness Junie: el modelo emite llamadas a herramientas que el agente ejecuta en el sandbox.
- Ejecucion de tareas de codigo en entornos aislados (Docker), con hasta 40 llamadas al modelo por rollout.
- Capacidad de agente de codigo en linea de comandos (coding-agent) para resolver tareas verificables.
- Capacidades multilingues: no disponible (heredadas del modelo base, no documentadas en esta ficha).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en RL con agentes reales: el modelo sirve como referencia reproducible para estudiar como un GRPO asincrono con harness real (Junie en Docker) afecta al comportamiento de un modelo de 2.6B en tareas verificables.
- Reproduccion de pipelines multi-harness a escala reducida: util para validar configuraciones (recompensas, rollouts, LoRA) antes de escalar a modelos de 24B o superiores en una sola GPU.
- Prototipado de agentes de analisis de datos: permite experimentar con un agente que ejecuta codigo en sandbox para responder preguntas sobre datasets, aunque con expectativas de precision cercanas al modelo base en este paso temprano.
- Base para ajustes posteriores: al incluir el adaptador LoRA independiente, se puede partir de el para continuar el entrenamiento o combinarlo con otras tareas.
- Evaluacion comparativa de harnesses: el modelo facilita comparaciones controladas entre Junie y otros CLIs de agente sobre el mismo conjunto de tareas.
- Docencia y divulgacion tecnica: sirve como ejemplo tangible de como se capturan prompts, tokens y logprobs durante la inferencia de un agente para convertirlos en datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que aun no hay evaluaciones y que una evaluacion pareada contra el modelo base sobre 100 tareas reservadas esta planificada para cuando finalice el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,4 GB solo para pesos (2.697 millones de parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3 GB de pesos; en 4 bits, en torno a 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); A100 y H100 sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en bf16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (bf16), vLLM, llama.cpp, Ollama y TGI, siguiendo el modelo base; el adaptador LoRA se carga con PEFT contra LiquidAI/LFM2.5-2.6B.
- Latencia y throughput estimados: no disponibles. El entrenamiento se realizo en una unica GPU, pero no se especifica el modelo de GPU ni metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-2.6B-junie-harbor-rl-v0.1 (este) | 2,6B | no disponible | Agente de codigo con RL (GRPO) sobre Junie | LFM Open License v1.0 | HuggingFace, checkpoint intermedio |
| LiquidAI/LFM2.5-2.6B (base) | 2,6B | no disponible | Modelo generalista LFM2.5 | LFM Open License v1.0 | HuggingFace, modelo final |
| harness-hub/LFM2.5-24B-A2B-pi | 24B (MoE, A2B) | no disponible | Agente de codigo con RL sobre harness pi | no disponible | HuggingFace, referencia del autor |
| Modelos de ~3B de proposito general (p. ej. Qwen2.5-3B, Llama-3.2-3B) | ~3B | 32K-128K segun modelo | Texto y codigo generalista | Apache 2.0 / Llama license | HuggingFace, ampliamente disponibles |

La comparacion directa con alternativas generalistas no es del todo justa: este checkpoint esta especializado en una unica familia de tareas (analisis de datos en Harbor) y en un paso temprano de entrenamiento, por lo que su rendimiento esperado es cercano al del modelo base segun el propio autor.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 20 de aproximadamente 440 planificados; el comportamiento puede cambiar sustancialmente en snapshots posteriores y se publica por transparencia del entrenamiento, no como modelo terminado.
- Sin benchmarks: no hay evaluaciones publicadas, por lo que no se puede afirmar ninguna mejora medible sobre el modelo base.
- Especializacion estrecha: entrenado solo con una familia de tareas (analisis de datos en sandboxes Harbor); cualquier ganancia esperada es especifica de esa familia.
- Escala reducida: con 2.6B de parametros y un paso temprano, se espera una precision cercana a la del modelo base.
- Herencia del modelo base: asume los sesgos, riesgos de alucinacion y limitaciones de contexto e idioma de LiquidAI/LFM2.5-2.6B, no documentados en esta ficha.
- Licencia: LFM Open License v1.0, que impone condiciones especificas para uso comercial; es necesario revisar el texto completo de la licencia antes de cualquier despliegue productivo.
- Datos de entrenamiento sin cribar: el pool de tareas no fue filtrado, lo que puede introducir ruido en la senal de recompensa.
- Uso en produccion desaconsejado en su estado actual: sin evaluacion pareada ni validacion fuera de la familia de tareas de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl-v0.1
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Guia multi-harness RL: https://huggingface.co/spaces/FineEnvs/multi-harness-rl
- Ficha de referencia harness-hub 24B: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi
- CLI JetBrains Junie: https://www.jetbrains.com/junie/
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B (archivo LICENSE en el repositorio del modelo base)
