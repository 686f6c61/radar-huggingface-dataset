# Taoger-Xu/SOD-Qwen3-1.7B-SFT

## Resumen

SOD-Qwen3-1.7B-SFT es un ajuste fino supervisado (SFT) de Qwen3-1.7B publicado por el usuario Taoger-Xu (jintao xu) en Hugging Face. Su proposito es reproducir la fase de arranque en frio (cold-start) del entrenamiento del estudiante descrito en el paper "SOD: Step-wise On-policy Distillation for Small Language Model Agents" (arXiv:2605.07725). No es el modelo SOD-1.7B final publicado por los autores del paper, sino el checkpoint intermedio previo a la fase de aprendizaje por refuerzo.

El modelo parte de la arquitectura transformer densa de Qwen3-1.7B, con 2.031.739.904 parametros reales en safetensors, y se ha entrenado sobre el dataset Open-AgentRL-SFT-3K durante 5 epocas (115 pasos) con una longitud maxima de secuencia de 32.768 tokens. El objetivo declarado es dotar al modelo base de capacidades de uso de herramientas (tool-use) y razonamiento multi-paso orientado a agentes, que es precisamente lo que la fase posterior de RL (SOD) pretende refinar.

Su relevancia es fundamentalmente metodologica: sirve como punto de partida reproducible para quien quiera replicar el pipeline SOD o experimentar con destilacion on-policy en modelos pequenos. Para uso en produccion directa, en cambio, debe tratarse con cautela: es un checkpoint intermedio, sin evaluaciones independientes publicadas y con un loss de validacion calculado sobre el mismo conjunto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento (truncamiento por la derecha); contexto nativo de Qwen3-1.7B no confirmado en la informacion disponible |
| Tipos de cuantizacion | No disponible (repo solo con safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible (heredados presumiblemente de Qwen3-1.7B, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint FSDP `global_step_115` consolidado a formato Hugging Face) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, sin modificaciones estructurales: el ajuste es puramente de pesos via SFT. El entrenamiento se realizo sobre el dataset Gen-Verse/Open-AgentRL-SFT-3K, con 5 epocas y 115 pasos totales, batch global de 128 y micro-batch de 16 por GPU, learning rate de 5e-5 y longitud maxima de secuencia de 32.768 tokens con truncamiento por la derecha. Se ejecuto sobre 8 GPU NVIDIA A100 de 80 GB y el checkpoint final se consolido desde FSDP a safetensors.

El loss final de entrenamiento ronda 0.143. Es importante subrayar que el `val/loss` reportado se calcula sobre el mismo conjunto de 3K ejemplos usado en entrenamiento, por lo que no constituye una medida de generalizacion. No se documentan en la informacion disponible tecnicas adicionales como RLHF, DPO, decodificacion especulativa ni atencion lineal; el paper de referencia (SOD) propone destilacion on-policy paso a paso, pero esa fase no esta incluida en este checkpoint.

## Capacidades

- Generacion de texto conversacional en formato chat (pipeline `text-generation`).
- Uso de herramientas (tool calling) en formato Hermes, con definicion de herramientas como `code_interpreter`; la tasa de exito depende del prompt, los parametros de muestreo y el entorno de ejecucion.
- Razonamiento multi-paso orientado a agentes, inducido por el dataset de SFT (Open-AgentRL-SFT-3K).
- Capacidades heredadas de Qwen3-1.7B en codigo, matematicas y razonamiento general (no verificadas de forma independiente en este checkpoint).
- Soporte multilingue presumiblemente heredado del modelo base, aunque no declarado explicitamente en la model card.
- No se documentan modos de pensamiento (thinking), vision ni audio especificos para este ajuste.

## Casos de uso

- Reproduccion del pipeline SOD: punto de partida exacto para aplicar la fase de destilacion on-policy descrita en el paper y comparar con los resultados de los autores.
- Investigacion en destilacion para agentes pequenos: permite aislar el efecto del cold-start SFT frente a la fase RL en modelos de ~2B parametros.
- Experimentos de tool calling en entornos controlados: con la configuracion Hermes y una herramienta `code_interpreter`, sirve para medir tasas de exito de llamadas a herramientas en modelos pequenos.
- Base para fine-tuning posterior: al estar en Apache 2.0 y safetensors, se puede reentrenar con LoRA o QLoRA para dominios concretos sin restricciones de licencia.
- Prototipado de agentes multi-paso en local: con 2B parametros y contexto de 32K, es viable en una sola GPU consumer para pruebas de flujos de razonamiento encadenado.
- Benchmarking academico de SFT vs RL: util como linea base "solo SFT" frente a checkpoints con RL aplicado sobre el mismo dataset y modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no incluye puntuaciones independientes de AIME, GPQA ni LiveCodeBench, y advierte que los resultados del paper SOD no deben atribuirse a este checkpoint. El unico dato numerico publicado es el loss de entrenamiento (~0.143), calculado sobre el mismo conjunto de entrenamiento y por tanto no valido como evaluacion.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 4,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 6 y 10 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5 GB (no hay GGUF oficial, habria que generarlo).
- GPU recomendadas para entrenamiento o inferencia a maxima longitud: A100 80GB (configuracion usada en el entrenamiento, 8 unidades); para inferencia basta una sola GPU.
- Cabe en GPU consumer: si, en RTX 3090, RTX 4090, RTX 4080 y tarjetas con 8 GB o mas en FP16, y en GPUs de 6-8 GB con cuantizacion.
- Opciones de despliegue: transformers (compatible con `device_map="auto"`), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOD-Qwen3-1.7B-SFT | 2,03B | 32.768 (entrenamiento) | SFT cold-start para agentes | Apache 2.0 | Hugging Face (153 descargas) |
| Qwen/Qwen3-1.7B | ~2B | No disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face (oficial) |
| SOD-1.7B (autores del paper) | ~1,7B | No disponible | Estudiante con destilacion on-policy | No disponible | No disponible en la informacion proporcionada |

La comparacion con el modelo base Qwen3-1.7B es la mas directa: este checkpoint anade capacidades de tool-use y formato de agente a costa de especializarse en el dataset Open-AgentRL-SFT-3K. Frente al SOD-1.7B de los autores, la diferencia clave es que este modelo no ha pasado por la fase de RL, por lo que no deberia esperarse un rendimiento equivalente.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no el modelo SOD final; no debe presentarse como resultado del paper.
- El loss de validacion se calcula sobre el mismo conjunto de entrenamiento, por lo que no mide generalizacion.
- No hay evaluaciones independientes publicadas (AIME, GPQA, LiveCodeBench ni similares).
- Riesgo de sobreajuste al dataset de 3K ejemplos tras 5 epocas; el comportamiento fuera de la distribucion de Open-AgentRL-SFT-3K es incierto.
- La tasa de exito en tool calling depende fuertemente del prompt, los parametros de muestreo y el entorno de ejecucion, segun advierte el propio autor.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3-1.7B.
- Riesgo de alucinacion: inherente a modelos de 2B parametros; no cuantificado.
- Idiomas soportados no declarados explicitamente en la model card.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion, su uso en produccion requiere validacion propia.
- No se ofrecen pesos cuantizados oficiales (GGUF, AWQ, GPTQ); habria que generarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Taoger-Xu/SOD-Qwen3-1.7B-SFT
- Perfil del autor: https://huggingface.co/Taoger-Xu
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/Gen-Verse/Open-AgentRL-SFT-3K
- Paper SOD: https://arxiv.org/abs/2605.07725
- Repositorio de reproduccion: https://github.com/YoungZ365/SOD
- Curvas de entrenamiento (SwanLab): https://swanlab.cn/@xujintao/SOD/runs/baxdrcv2/chart
