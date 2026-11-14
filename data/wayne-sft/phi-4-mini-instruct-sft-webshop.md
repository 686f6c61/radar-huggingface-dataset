# wayne-SFT/Phi-4-mini-instruct-SFT-WebShop

## Resumen

Phi-4-mini-instruct-SFT-WebShop es un ajuste fino supervisado (SFT) de `microsoft/Phi-4-mini-instruct` realizado por el usuario wayne-SFT. El modelo parte del checkpoint base de Microsoft (revision `cfbefacb99257ffa30c83adab238a50856ac3083`) y se entrena con parámetros completos sobre trayectorias de experto recogidas por el autor en el entorno WebShop, un benchmark de compra interactiva en el que un agente debe navegar por un sitio web simulado y completar objetivos de compra. El resultado es un checkpoint pensado como punto de partida para aprendizaje por refuerzo (RL), no como modelo de propósito general.

La relevancia de esta ficha es acotada pero específica: se trata de un artefacto de investigación para experimentación en agentes web y behavior cloning. No es un modelo conversacional de uso general, sino un modelo especializado en una tarea concreta (navegación y compra en WebShop) que conserva la arquitectura y el tokenizador de Phi-4-mini. El checkpoint publicado corresponde al paso global 150, es decir, la época 1 de 2, con un resultado de tasa de éxito del 50,1% en los objetivos de desarrollo de WebShop (objetivos 500-1499, semilla 0).

El modelo tiene 3.836.021.760 parámetros (aproximadamente 3,8 mil millones), se distribuye en formato safetensors en fp32 (los 195 tensores están en F32) y ocupa 17,8 GB en el repositorio. La licencia es MIT, lo que facilita su reutilización, aunque hereda las condiciones del modelo base de Microsoft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3/Phi-4-mini, código `phi3` en transformers) |
| Parametros totales | 3.836.021.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max sequence length 2432) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el campo `dtype` de `config.json` indica `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | MIT (hereda terminos del modelo base Microsoft Phi-4-mini-instruct) |
| Formato de pesos | safetensors (4 shards, todos los tensores en F32) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) del checkpoint `microsoft/Phi-4-mini-instruct`, que pertenece a la familia Phi-4-mini de Microsoft con arquitectura transformer decoder-only y código de modelo `phi3` en la librería transformers. El autor eliminó las dependencias de código remoto (`configuration_phi3.py`, `modeling_phi3.py`, `sample_finetune.py`) y borró `config.auto_map` para que el modelo cargue con las clases nativas de transformers, lo que simplifica su uso en pipelines estándar.

El entrenamiento se realizó sobre trayectorias de experto recogidas por el propio autor únicamente en los objetivos de entrenamiento de WebShop (dataset interno `ws_sft_div233`). Los hiperparámetros publicados son: learning rate 1e-5, batch global 64, longitud máxima de secuencia 2432 y checkpoint en el paso global 150 (época 1 de 2). No se documentan en la información disponible detalles sobre el volumen total de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores; el autor describe este checkpoint como base para RL, lo que sugiere que el RL vendría después. Los pesos se guardan tal como se entrenaron, sin conversión, en fp32.

## Capacidades

- Generación de texto y razonamiento conversacional heredados de Phi-4-mini-instruct.
- Ejecución de tareas de agente en el entorno WebShop: navegación por un sitio de compras simulado, búsqueda de productos y selección de artículos para cumplir objetivos de compra.
- Behavior cloning de trayectorias de experto: el modelo imita las acciones de un agente experto en WebShop.
- Soporte de tool calling / function calling: no confirmado en la información disponible para este checkpoint.
- Soporte de agentes multi-paso: entrenado específicamente para interacciones multi-paso en WebShop.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación en agentes web: el modelo sirve como política inicial (behavior cloning) para experimentos de RL en WebShop, tal como indica el autor. Es adecuado porque parte de un checkpoint ya entrenado en trayectorias de experto y alcanza un 50,1% de tasa de éxito en el dev set.
- Evaluación de técnicas de SFT: permite comparar el efecto de un ajuste fino completo sobre Phi-4-mini en una tarea de agente concreta, con hiperparámetros documentados (lr 1e-5, batch 64, seq len 2432).
- Punto de partida para RL: el autor lo publica explícitamente como "start checkpoint for RL on WebShop", de modo que un equipo puede continuar el entrenamiento con un algoritmo de RL sobre esta base.
- Reproducción de experimentos: al incluir hashes sha256 de todos los ficheros y la revisión exacta del modelo base, facilita la reproducibilidad de resultados en entornos de investigación.
- Estudio de comportamiento de compra simulado: útil para analizar cómo un modelo pequeño (3,8 mil millones de parámetros) planifica secuencias de acciones en un entorno de comercio electrónico simulado.
- Benchmarking de agentes en WebShop: sirve como referencia de línea base para comparar nuevas políticas de agente en los objetivos de desarrollo 500-1499 con semilla 0.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| WebShop dev (objetivos 500-1499, 1000 objetivos, semilla 0) | 50,1% tasa de éxito | Checkpoint global step 150 (época 1 de 2) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados están en fp32, lo que requiere aproximadamente 15,3 GB solo para los pesos (3,836 mil millones de parámetros × 4 bytes). En bfloat16 o fp16 bajaría a unos 7,7 GB; en cuantización de 8 bits, a unos 3,8 GB; en 4 bits, a unos 1,9 GB.
- GPU recomendadas: para fp32, una GPU con 24 GB o más (RTX 3090/4090, A10G, L4, A100). Para bf16/fp16, una GPU con 12-16 GB puede ser suficiente (RTX 4070 Ti, RTX 4080, L4). Para cuantizaciones de 4-8 bits, cabría en GPUs consumer de 8 GB.
- Cabe en GPU consumer: sí, especialmente tras convertir a bf16 o cuantizar; en fp32 directo requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers (librería nativa, sin código remoto), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama tras conversión a GGUF (no se proporciona GGUF en el repo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-instruct-SFT-WebShop | 3,836 mil millones | no disponible | Agente WebShop (SFT) | MIT | Hugging Face |
| microsoft/Phi-4-mini-instruct | no disponible en la informacion | no disponible | Modelo general | MIT (terminos Microsoft) | Hugging Face |
| Otros modelos de agente WebShop | no disponible | no disponible | Agente WebShop | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en WebShop en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado únicamente en objetivos de entrenamiento de WebShop; su comportamiento fuera de ese entorno no está validado y probablemente degrade respecto al modelo base.
- Checkpoint intermedio: corresponde al paso global 150 (época 1 de 2), por lo que no es el resultado final de un entrenamiento completo.
- Pesos en fp32: el repositorio ocupa 17,8 GB y los tensores están en F32, lo que encarece el despliegue en memoria frente a una versión bf16.
- Sin datos de benchmarks generales: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones multilingües, por lo que no se puede caracterizar su rendimiento general.
- Idiomas no documentados: la model card no especifica idiomas soportados.
- Riesgo de alucinación: inherente a los modelos de lenguaje; en un entorno de agente puede traducirse en acciones inválidas o selección de productos incorrectos.
- Sesgos: no documentados en la información disponible; al derivar de Phi-4-mini, podría heredar sesgos del modelo base.
- Licencia: MIT para este checkpoint, pero se deben respetar los términos del modelo base de Microsoft enlazados en el repositorio.
- Uso comercial: la licencia MIT lo permite, pero conviene revisar las condiciones del modelo base y validar el comportamiento en el dominio de producción antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wayne-SFT/Phi-4-mini-instruct-SFT-WebShop
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct/blob/main/LICENSE
- Revision del modelo base: `cfbefacb99257ffa30c83adab238a50856ac3083`
