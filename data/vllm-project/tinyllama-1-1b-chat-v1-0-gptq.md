# vllm-project/TinyLlama-1.1B-Chat-v1.0-GPTQ

## Resumen

TinyLlama-1.1B-Chat-v1.0-GPTQ es una versión cuantizada a 4 bits mediante GPTQ del modelo TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de tipo Llama con 1.100.442.624 parámetros. El modelo original fue desarrollado por el proyecto TinyLlama y esta copia concreta la mantiene la organización vllm-project, que la publica como espejo del repositorio de TheBloke para reducir el riesgo de cadena de suministro en sus pruebas de integración continua (CI) de vLLM.

El modelo resuelve el problema de desplegar un asistente conversacional de muy bajo coste computacional en hardware modesto: gracias a la cuantización GPTQ de 4 bits, el checkpoint ocupa aproximadamente 0,8 GB en disco y puede ejecutarse en GPUs de consumo con poca VRAM. La ventana de contexto heredada del modelo base es de 2048 tokens, suficiente para tareas de chat corto y generación de texto acotada.

Es relevante ahora porque vLLM mantiene esta copia como referencia estable para validar la carga de checkpoints GPTQ en su motor de inferencia, y porque TinyLlama sigue siendo uno de los pocos modelos de aproximadamente 1B parámetros con licencia Apache 2.0 y entrenamiento documentado sobre SlimPajama, lo que lo convierte en una opción práctica para prototipado, entornos con recursos limitados y experimentación con cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, tipo `tinyllama`) |
| Parametros totales | 1.100.442.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GPTQ 4 bits (multiples permutaciones de parametros en ramas del repo: bits, group size, act order, damp %) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ) |

## Arquitectura y entrenamiento

El modelo base TinyLlama-1.1B-Chat-v1.0 es un transformer decoder-only de tipo Llama con 1,1B parámetros, entrenado sobre una mezcla de datos que incluye cerebras/SlimPajama-627B, bigcode/starcoderdata y OpenAssistant/oasst_top1_2023-08-25. La variante Chat incorpora un ajuste supervisado (SFT) sobre datos conversacionales y utiliza la plantilla de prompt Zephyr (`<|system|> ... </s> <|user|> ... </s> <|assistant|>`). No se detalla en la información disponible el número exacto de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

La versión publicada en este repositorio no modifica la arquitectura: aplica cuantización GPTQ de 4 bits sobre los pesos del modelo original. Los archivos GPTQ se generaron con AutoGPTQ (o Transformers en el caso de algunos modelos) y se ofrecen varias permutaciones de parámetros (bits, group size, act order/`desc_act`, damp %, longitud de secuencia de calibración y compatibilidad con ExLlama). La cuantización no altera la longitud de contexto del modelo, pero puede degradar ligeramente la precisión en secuencias largas si la calibración se hizo con secuencias más cortas.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat Zephyr (system, user, assistant).
- Razonamiento básico y respuesta a instrucciones simples, limitado por el tamaño de 1,1B parámetros.
- Generación de código y texto técnico, gracias a la inclusión de bigcode/starcoderdata en el entrenamiento del modelo base.
- Capacidad multilingüe muy limitada: el modelo está etiquetado únicamente para inglés.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información disponible.
- No dispone de visión, audio ni modo "thinking" explícito.
- Compatible con servidores de inferencia GPTQ: text-generation-webui, KoboldAI United, LoLLMS Web UI y Hugging Face TGI; también con vLLM, que mantiene esta copia para sus pruebas.

## Casos de uso

- Pruebas de integración y CI en vLLM: el repositorio existe precisamente para que vLLM valide la carga y ejecución de checkpoints GPTQ de forma reproducible, sin depender de una cuenta personal.
- Prototipado de asistentes conversacionales en local: con 0,8 GB de pesos y contexto de 2048 tokens, permite iterar sobre prompts y plantillas de chat en un portátil con GPU de consumo.
- Generación de texto corto en entornos con VRAM limitada: adecuado para resúmenes breves, respuestas FAQ y clasificación de texto simple donde no se requiere razonamiento profundo.
- Docencia y experimentación con cuantización: sirve para comparar la calidad de distintas permutaciones GPTQ (group size, act order, damp %) frente al modelo fp16 original.
- Autocompletado y asistencia de código ligera: el modelo base incluye datos de StarCoder, por lo que puede emplearse para sugerencias de fragmentos cortos en editores, siempre con validación humana.
- Despliegue de bajo coste en CPU/GPU mixto: combinado con variantes GGUF del mismo modelo para CPU, permite montar un servicio de chat interno con requisitos mínimos de infraestructura.
- Benchmarking de motores de inferencia: útil como carga de trabajo pequeña y rápida para medir latencia y throughput de servidores GPTQ (TGI, vLLM, text-generation-webui) sin consumir grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,5 GB para los pesos GPTQ de 4 bits, más overhead de KV cache y activaciones; en la práctica, menos de 4 GB en la mayoría de configuraciones con contexto corto.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM; también AMD en Linux para clientes GPTQ compatibles. Para pruebas de CI, GPUs modestas como T4 o RTX 3060 son suficientes.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida, aunque con mayor latencia.
- Opciones de despliegue: vLLM, Hugging Face TGI, text-generation-webui, KoboldAI United, LoLLMS Web UI; para macOS se recomienda usar las variantes GGUF del mismo modelo en lugar de GPTQ.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de un modelo de 1,1B parámetros, se espera una latencia baja en GPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / cuantización | Disponibilidad |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-GPTQ (este) | 1,1B | 2048 | Apache 2.0 | GPTQ 4 bits (safetensors) | HuggingFace (vllm-project, TheBloke) |
| TinyLlama-1.1B-Chat-v1.0 (original) | 1,1B | 2048 | Apache 2.0 | fp16 (PyTorch) | HuggingFace (TinyLlama) |
| TinyLlama-1.1B-Chat-v1.0-AWQ | 1,1B | 2048 | Apache 2.0 | AWQ 4 bits | HuggingFace (TheBloke) |
| TinyLlama-1.1B-Chat-v1.0-GGUF | 1,1B | 2048 | Apache 2.0 | GGUF 2-8 bits | HuggingFace (TheBloke) |

No se dispone de datos de benchmarks comparativos en la información proporcionada para contrastar el rendimiento frente a otras alternativas de tamaño similar.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: no está entrenado ni evaluado para castellano u otros idiomas, por lo que su uso multilingüe producirá resultados pobres.
- Riesgo elevado de alucinación y de errores factuales, inherente a un modelo de 1,1B parámetros con conocimiento limitado.
- Ventana de contexto de solo 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- La cuantización GPTQ de 4 bits puede introducir degradación adicional de precisión respecto al modelo fp16, especialmente en secuencias largas o tareas sensibles.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico; no debe asumirse su disponibilidad en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datasets de entrenamiento del modelo base (SlimPajama, StarCoderData, OASST) por posibles restricciones adicionales.
- Esta copia concreta está pensada para CI de vLLM; para uso en producción se recomienda evaluar el modelo original o variantes mantenidas activamente.
- GPTQ no es compatible con macOS de forma nativa; en ese entorno deben usarse variantes GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vllm-project/TinyLlama-1.1B-Chat-v1.0-GPTQ
- Repositorio original de TheBloke (GPTQ): https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GPTQ
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Variante AWQ: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-AWQ
- Variantes GGUF: https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v1.0-GGUF
- Organización TinyLlama: https://huggingface.co/TinyLlama
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldAI United: https://github.com/henk717/koboldai
- LoLLMS Web UI: https://github.com/ParisNeo/lollms-webui
- Hugging Face TGI: https://github.com/huggingface/text-generation-inference
- Massed Compute (hardware de cuantización): https://massedcompute.com/
- Discord de TheBloke: https://discord.gg/theblokeai
- Patreon de TheBloke: https://www.patreon.com/TheBlokeAI
