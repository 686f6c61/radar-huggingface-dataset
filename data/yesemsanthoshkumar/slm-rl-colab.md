# yesemsanthoshkumar/slm-rl-colab

## Resumen

`yesemsanthoshkumar/slm-rl-colab` es un adaptador PEFT LoRA diseñado para especializar el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` en la tarea de jugar a Space Invaders dentro de un entorno de texto. El adaptador se ha entrenado con el framework SLM-RL, un gimnasio de juegos auto-mejorable para pequeños modelos de lenguaje, que combina aprendizaje por refuerzo con recopilación automática de datos de experiencia. El resultado es un adaptador ligero que permite al modelo base generar acciones válidas para el juego, con una tasa de intervención y de acciones inválidas nula.

La relevancia de este modelo radica en su enfoque experimental: demuestra cómo un adaptador de bajo rango puede transferir capacidades de juego a un SLM sin necesidad de reentrenar el modelo completo. Está pensado para investigadores y desarrolladores interesados en técnicas de adaptación eficiente, RL para agentes conversacionales y entornos de juego basados en texto. El adaptador se distribuye bajo licencia Apache 2.0 y se integra fácilmente con `transformers` y `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre LiquidAI/LFM2.5-1.2B-Instruct |
| Parametros totales | no disponible (el adaptador es de bajo rango, pero no se especifica el numero) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se carga en bf16 o fp32 segun el dispositivo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT en subcarpeta `adapter/`) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en las capas de atención. El modelo base es `LiquidAI/LFM2.5-1.2B-Instruct`, un SLM de 1.2 mil millones de parametros, aunque no se dispone de detalles adicionales sobre su arquitectura interna (tipo de transformer, atencion, etc.) en la informacion proporcionada.

El entrenamiento se realizo con el metodo `reject_sft` (rejection sampling + supervised fine-tuning) sobre demostraciones generadas por un profesor DQN en el entorno de Space Invaders. El framework SLM-RL recopila las decisiones del modelo durante el juego, las almacena en un dataset reutilizable y las usa para afinar el adaptador. Las metricas de entrenamiento muestran una perdida de -0.0169, una recompensa media de 0.15625 y una entropia de 2.897, con 16 prompts y un KL de 0.312. No se menciona el uso de RLHF ni DPO; el proceso se centra en el aprendizaje por refuerzo implicito a traves de la recopilacion de experiencia.

## Capacidades

- Generacion de acciones para el juego Space Invaders en formato de texto, respondiendo con `ACTION: <id>`.
- Integracion con el framework SLM-RL para ciclos de auto-mejora: el modelo juega, se recopilan datos y se reentrena.
- Hereda las capacidades de generacion de texto del modelo base, aunque el adaptador esta especializado en la tarea de juego.
- Soporte de tool calling no disponible; el adaptador se limita a la salida de acciones.
- Capacidades multilingues no disponibles; el prompt de ejemplo esta en ingles.
- No incluye modo de razonamiento explicito ni capacidades de vision; el entorno es puramente textual.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para SLM: el adaptador sirve como ejemplo de como un modelo pequeno puede aprender a jugar un juego Atari mediante RL con un adaptador ligero, util para estudiar la eficiencia de muestreo y la transferencia de habilidades.
- Prototipado de agentes de juego en entornos de texto: se puede integrar en un bucle de juego donde el modelo recibe el estado del juego y genera la siguiente accion, permitiendo probar estrategias de exploracion y explotacion.
- Evaluacion de tecnicas de adaptacion eficiente: al ser un adaptador LoRA, permite comparar el rendimiento de diferentes metodos de fine-tuning (full fine-tuning vs. PEFT) en tareas de control.
- Generacion de datasets de demostracion: el adaptador puede usarse para generar partidas jugadas por el modelo, que luego se pueden filtrar y usar para entrenar otros modelos o para analisis de comportamiento.
- Educacion y talleres: el modelo se publico como parte de un workshop de SLM-RL, por lo que es adecuado para demostraciones en cursos sobre RL y modelos de lenguaje.
- Pruebas de robustez en entornos con acciones discretas: dado que la tasa de acciones invalidas es 0.0, puede servir para probar la estabilidad de la generacion de salidas estructuradas.

## Benchmarks y rendimiento

Las metricas de evaluacion registradas en la model card son las siguientes:

| Metrica | Valor |
|---|---|
| Episodios evaluados | 8 |
| Primary (puntuacion principal) | 0.3333 |
| Win rate | 0.0 |
| Mean score | 0.3333 |
| Invalid rate | 0.0 |
| Intervention rate | 0.0 |
| Mean entropy | no disponible |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El adaptador fue promovido en la generacion 2 del proceso SLM-RL, mejorando la primary de 0.2708 a 0.3333.

## Requisitos de hardware

- Al ser un adaptador LoRA, el requisito principal es el modelo base de 1.2B, que puede ejecutarse en GPU con al menos 4 GB de VRAM en cuantizacion bf16 (aproximadamente 2.4 GB para los pesos del modelo base, mas overhead).
- En CPU es posible la inferencia, aunque con mayor latencia; el ejemplo de carga usa `torch.float32` en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA de 4 GB o mas (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060, etc.). Tambien compatible con Apple Silicon via MPS.
- Opciones de despliegue: `transformers` con `peft`, `vLLM` (si se fusiona el adaptador), `llama.cpp` no es directamente aplicable porque el adaptador es PEFT, pero se puede exportar a GGUF si se fusiona.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El adaptador es especifico para Space Invaders y no se han publicado comparaciones con otros adaptadores o modelos de juego.

## Limitaciones y advertencias

- Es un adaptador experimental, no apto para uso en produccion; su unica funcion es jugar a Space Invaders en un entorno de texto.
- El win rate es 0.0, lo que indica que el modelo no gana partidas; su rendimiento es limitado y probablemente no supere a un agente DQN basico.
- No se han documentado sesgos especificos, pero al estar entrenado sobre un unico juego, no generaliza a otras tareas.
- Riesgo de alucinacion: el modelo base puede generar texto incoherente si se le piden acciones fuera del formato esperado; el adaptador reduce este riesgo al limitar la salida, pero no lo elimina.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `LiquidAI/LFM2.5-1.2B-Instruct` puede tener sus propias restricciones; se recomienda verificar su licencia.
- El adaptador depende de la version del modelo base; cambios en el base pueden romper la compatibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yesemsanthoshkumar/slm-rl-colab
- Dataset asociado: https://huggingface.co/datasets/yesemsanthoshkumar/slm-rl-colab-data
- Framework SLM-RL (GitHub): https://github.com/CraftsMan-Labs/SLM-RL
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
