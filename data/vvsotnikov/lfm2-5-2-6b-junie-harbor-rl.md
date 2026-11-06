# vvsotnikov/LFM2.5-2.6B-junie-harbor-rl

## Resumen

LFM2.5-2.6B-junie-harbor-rl es un checkpoint intermedio de un ajuste fino con aprendizaje por refuerzo (GRPO asíncrono) sobre el modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario vvsotnikov en Hugging Face. El objetivo del entrenamiento es especializar al modelo como motor de un agente de código (coding agent) que opera a través de la CLI JetBrains Junie en tareas de análisis de datos dentro de sandboxes Docker. No se trata de un modelo final: es una instantánea en el paso 20 de una tirada planificada de unas 440 iteraciones, publicada por transparencia del proceso de entrenamiento.

El modelo conserva la arquitectura y el tamaño del base (2.697.198.592 parámetros, aproximadamente 2,6 mil millones), y el adaptador LoRA utilizado durante el RL se ha fusionado en los pesos, por lo que el repositorio contiene el modelo completo en bf16 (5,6 GB) además del adaptador independiente en `lora-adapter/`. La interfaz de uso es idéntica a la del modelo base: chat/completions estándar de LFM2.5, servible con transformers, vLLM o llama.cpp.

Su relevancia es fundamentalmente metodológica: documenta un flujo completo de RL multi-harness a pequeña escala (una sola GPU) con captura de todas las llamadas del agente (prompts, tokens muestreados, logprobs) como datos de entrenamiento. No obstante, al ser un checkpoint temprano y sin evaluaciones publicadas, no debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2.5 de LiquidAI; detalles específicos no disponibles en la información proporcionada) |
| Parámetros totales | 2.697.198.592 (~2,6 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa 16.384 tokens por llamada al modelo, pero no se especifica la ventana de contexto del base) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el base admite servir con vLLM/llama.cpp, lo que implica cuantizaciones estándar tipo GGUF/AWQ, pero no se detallan) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (modelo fusionado en bf16) + adaptador LoRA en `lora-adapter/` (PEFT) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-2.6B y aplica un ajuste con RL usando GRPO asíncrono mediante `AsyncGRPOTrainer` de TRL. El entrenamiento usa LoRA con r=32, alpha=64 sobre todas las capas lineales, y el adaptador resultante se fusiona en los pesos base para producir el checkpoint publicado. La innovación principal no está en la arquitectura del modelo, sino en el pipeline de datos: el harness JetBrains Junie se ejecuta en modo headless dentro de sandboxes Docker y cada llamada que el agente realiza (tokens de prompt, tokens muestreados, logprobs) se captura y se reutiliza como material de entrenamiento.

Los datos de entrenamiento son las primeras 1.000 tareas del dataset FineEnvs/SmolDataEnvs-harbor-train, sin cribar y barajadas. La recompensa combina la corrección del verificador de la tarea con un pequeño bonus de eficiencia de herramientas (peso 0,1) aplicado solo a respuestas correctas. Se realizan 8 rollouts por tarea con temperatura 1,0, hasta 40 llamadas al modelo y 1.800 s por rollout, con 16.384 tokens por llamada. La tasa de aprendizaje es 1e-5 y se guardan checkpoints cada 10 pasos. El run reproduce a escala reducida (una GPU, modelo de 2,6B, harness Junie en lugar de pi) el setup descrito en la guía *The ultimate guide to multi-harness RL* y la model card de harness-hub/LFM2.5-24B-A2B-pi.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base LFM2.5.
- Ejecución de tareas de agente de código mediante tool calling dentro de una CLI (JetBrains Junie), con llamadas encadenadas de hasta 40 pasos por rollout.
- Razonamiento multi-paso orientado a tareas de análisis de datos en entornos sandbox (Harbor).
- Uso de herramientas con bonus de eficiencia: el entrenamiento penaliza implícitamente el uso innecesario de herramientas en respuestas correctas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Agente de análisis de datos en sandbox: el modelo puede operar como backend de una CLI de agente que ejecuta código, inspecciona ficheros y valida resultados dentro de un contenedor Docker, que es exactamente el escenario de entrenamiento (tareas Harbor de análisis de datos).
- Automatización de pipelines de análisis reproducible: integrado en un harness tipo Junie, permite que el agente ejecute scripts, lea salidas y verifique métricas de forma iterativa con hasta 40 llamadas por tarea.
- Investigación en RL para agentes: sirve como checkpoint de referencia para estudiar la evolución del entrenamiento GRPO paso a paso (checkpoints cada 10 pasos) y comparar contra el base.
- Reproducción de experimentos multi-harness: al documentar configuración, recompensas y harness, es útil para replicar el setup en otras familias de tareas o modelos.
- Prototipado de asistentes de código en local: con 2,6B parámetros y pesos bf16, puede servirse en una sola GPU consumer para pruebas de flujos de agente sin coste de API.
- Evaluación comparada base vs. RL: el propio autor planea una evaluación emparejada de 100 tareas retenidas, por lo que el checkpoint sirve como material para ese tipo de estudios.
- Fine-tuning posterior: el adaptador LoRA independiente en `lora-adapter/` permite continuar el entrenamiento o aplicar el ajuste sobre el base con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no hay evaluaciones y que se planea una evaluación emparejada contra el modelo base sobre 100 tareas retenidas tras finalizar el run (aproximadamente 440 pasos; en el momento de la instantánea iba por el paso 20).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 5,4 GB solo para pesos (2,6B × 2 bytes), más overhead de activaciones y KV cache; presupuesto realista de 8-12 GB según longitud de contexto y batch.
- En cuantización de 8 bits: aproximadamente 2,7 GB de pesos; en 4 bits: aproximadamente 1,4 GB, con margen adicional para contexto y cache.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para bf16 (RTX 3060 12 GB, RTX 4070, RTX 4090); A100/H100 sobredimensionadas para este tamaño, útiles solo para entrenamiento o serving de alto throughput.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, así como en Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (bf16), vLLM, llama.cpp y, por extensión del ecosistema, Ollama; el adaptador LoRA se carga con PEFT sobre el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento usó 16.384 tokens por llamada y hasta 40 llamadas por rollout con un límite de 1.800 s, lo que da una idea del orden de magnitud del coste por tarea, pero no son cifras de serving.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| vvsotnikov/LFM2.5-2.6B-junie-harbor-rl | ~2,6 B | no disponible | RL (GRPO) para agente de código con harness Junie | LFM Open License v1.0 | Checkpoint intermedio (paso 20 de ~440), sin benchmarks |
| LiquidAI/LFM2.5-2.6B (base) | ~2,6 B | no disponible | Modelo base de chat/completions | LFM Open License v1.0 | Modelo publicado y estable |
| harness-hub/LFM2.5-24B-A2B-pi | ~24 B (A2B, MoE) | no disponible | RL multi-harness con harness pi | no disponible en la información | Referencia del mismo pipeline a mayor escala |

La comparación directa con alternativas de otros fabricantes (Qwen, Llama, Gemma en el rango 2-3B) no está disponible en la información proporcionada, y no se han publicado métricas que permitan situar este checkpoint frente a ellas.

## Limitaciones y advertencias

- Checkpoint intermedio: el comportamiento puede cambiar sustancialmente en checkpoints posteriores; se publica por transparencia del entrenamiento, no como modelo terminado.
- Sin evaluaciones: no hay benchmarks ni comparación emparejada con el base; se espera una precisión cercana a la del modelo base en esta fase temprana.
- Especialización estrecha: entrenado solo con una familia de tareas (análisis de datos en sandboxes Harbor); cualquier mejora será específica de ese dominio.
- Escala pequeña: 2,6B parámetros y paso 20 de entrenamiento limitan la fiabilidad en tareas complejas de agente.
- Sesgos y alucinaciones: no documentados en la información proporcionada; hereda los del modelo base LFM2.5, que no se detallan.
- Restricciones de licencia: LFM Open License v1.0; es necesario revisar sus términos antes de uso comercial, ya que no es una licencia permisiva estándar (Apache/MIT).
- Idiomas: no se especifican los idiomas soportados, por lo que no se puede garantizar calidad multilingüe.
- Producción: no recomendado para despliegue productivo en su estado actual; usar el modelo base o esperar al checkpoint final con evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vvsotnikov/LFM2.5-2.6B-junie-harbor-rl
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de entrenamiento: https://huggingface.co/datasets/FineEnvs/SmolDataEnvs-harbor-train
- Guía de referencia multi-harness RL: https://huggingface.co/spaces/FineEnvs/multi-harness-rl
- Model card de referencia a 24B: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-pi
- JetBrains Junie: https://www.jetbrains.com/junie/
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-2.6B (referenciada en el repositorio como LICENSE)
