# turintech/Nemotron-3.5-Bolt-E4B-Artemis-W8A8

## Resumen

Nemotron 3.5 Bolt E4B Artemis W8A8 es una versión cuantizada del modelo multimodal Nemotron 3.5 Bolt E4B de NVIDIA, publicada por TurinTech dentro de su línea de trabajo Artemis. El modelo base es un modelo conversacional de pequeño tamaño (aproximadamente 8.000 millones de parámetros según los pesos en safetensors) derivado de Google Gemma 4 E4B y post-entrenado por NVIDIA, con capacidades de texto, imagen y audio. Esta variante aplica cuantización W8A8 (FP8 en pesos y activaciones) exclusivamente a las capas MLP del modelo de lenguaje, manteniendo el resto de tensores en su precisión original.

El objetivo de este checkpoint es reducir la huella de memoria y acelerar la inferencia en GPUs con multiplicaciones de matrices FP8 rápidas, manteniendo una calidad cercana al original. Según la model card, los pesos ocupan 12,69 GB frente a los 15,99 GB del BF16 original, y la generación alcanza 171 tokens/s en una RTX 5090, frente a 139 tokens/s del original, con resultados de tool calling y GSM8K prácticamente idénticos.

Es relevante porque ofrece una ruta de despliegue en vLLM con pesos comprimidos (compressed-tensors) que cabe en GPUs de 16 GB de VRAM, algo que el checkpoint BF16 original no consigue con holgura. La licencia es OpenMDW 1.1, lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivada de Gemma 4 E4B), cuantización W8A8 en MLP |
| Parámetros totales | 7.996.156.490 |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens probados (la model card indica que no se probaron contextos superiores) |
| Tipos de cuantización | W8A8 (FP8 en pesos y activaciones de las capas MLP); resto de tensores sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base, Nemotron 3.5 Bolt E4B, es un transformer multimodal desarrollado por NVIDIA a partir de Google Gemma 4 E4B, con post-entrenamiento propio de NVIDIA para tareas conversacionales y soporte de texto, imagen y audio. La model card menciona además un mecanismo de KV compartido (fichero `model-frozen-shared-kv.safetensors`) y una plantilla de chat con modo de razonamiento (`enable_thinking`), aunque no se detalla la composición del dataset de entrenamiento ni si hubo RLHF o DPO.

La contribución de TurinTech es exclusivamente de cuantización: se cuantizan a FP8 los pesos y activaciones de las capas MLP del modelo de lenguaje (`mlp.safetensors`, 3,31 GB), mientras que los tensores de atención (`attn.safetensors`, 1,17 GB) y del núcleo (`core.safetensors`, 8,10 GB) se mantienen sin cambios respecto al checkpoint de NVIDIA. El resultado se empaqueta con `compressed-tensors` para su uso directo en vLLM. No se especifican el número de tokens de entrenamiento ni la composición del dataset, por lo que esos datos no están disponibles.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen (image-text-to-text), según el pipeline declarado.
- Procesamiento de audio (requiere `pip install "vllm[audio]"` y eliminar `--language-model-only`).
- Tool calling / function calling, con parser `gemma4` en vLLM y `--enable-auto-tool-choice`.
- Modo de razonamiento activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Razonamiento matemático básico (evaluado en GSM8K).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional en producción con vLLM: el checkpoint se sirve con `vllm serve` y una ventana de 4.096 tokens, adecuado para chat multi-turno en GPUs de 16 GB con `--gpu-memory-utilization 0.92`.
- Automatización con tool calling: el soporte nativo de `tool_calls` en la API compatible con OpenAI permite integrar el modelo en flujos de agentes que invocan funciones externas (APIs, bases de datos, calculadoras) sin post-procesado manual.
- Procesamiento de documentos con imagen: al conservar las capacidades multimodales del modelo base, puede extraer información de capturas o formularios combinando texto e imagen en la misma petición.
- Transcripción y análisis de audio: con el extra de audio de vLLM, puede integrarse en pipelines de atención telefónica o análisis de reuniones.
- Razonamiento matemático y resolución de problemas en entornos educativos o de validación: los resultados de GSM8K (231 de 250) indican un rendimiento sólido para tareas de aritmética de varios pasos.
- Despliegue en estaciones de trabajo con una sola GPU consumer: con 12,69 GB de pesos, cabe en tarjetas de 16 GB y permite servir el modelo localmente para prototipado o entornos con requisitos de privacidad.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para medir la degradación de KL y la velocidad frente al BF16 original y a la variante FP8 del mismo autor.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con thinking desactivado en una NVIDIA RTX 5090 con vLLM 0.32.0rc1:

| Modelo | Tamaño | KL chat (menor es mejor) | Tool calls (de 400) | GSM8K (de 250) | Generación, una petición (tok/s) |
|---|---|---|---|---|---|
| TurinTech W8A8 | 12,69 GB | 0,019 | 374 | 231 | 171 |
| TurinTech FP8 | 12,69 GB | 0,010 | 371 | 230 | 183 |
| BF16 original | 15,99 GB | referencia | 371 | 229 | 139 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12,69 GB de pesos; en vLLM el peso en memoria se reporta como 11,07 GiB. Con overhead de KV cache y activaciones, se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 5090 (medida en la model card); GPUs Hopper y Ada no fueron probadas según el autor, aunque son las que más deberían beneficiarse de W8A8.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB como la RTX 5090 o similares, con `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`. El autor advierte que en GPUs de 16 GB que además gestionan pantalla conviene bajar el primer valor; no fue probado en una tarjeta de 16 GB.
- Despliegue: vLLM 0.32.0rc1 (build de desarrollo) con `--dtype bfloat16 --max-model-len 4096 --language-model-only`. Para imagen y audio, eliminar `--language-model-only`; para audio, instalar `vllm[audio]`.
- Latencia y throughput: 171 tok/s en generación de una sola petición en RTX 5090, frente a 139 tok/s del BF16 original. No se reportan datos de throughput con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TurinTech Nemotron-3.5-Bolt-E4B-Artemis-W8A8 | 7.996.156.490 | 4.096 probados | OpenMDW 1.1 | safetensors (W8A8) | 12,69 GB, 171 tok/s, KL 0,019 |
| TurinTech Nemotron-3.5-Bolt-E4B-Artemis-FP8 | no disponible | no disponible | OpenMDW 1.1 | safetensors (FP8) | 12,69 GB, 183 tok/s, KL 0,010; mejor opción en RTX 5090 según el autor |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (original) | no disponible | no disponible | no disponible | safetensors (BF16) | 15,99 GB, 139 tok/s, referencia de calidad |
| TurinTech Nemotron-3.5-Bolt-E4B-Artemis-GGUF | no disponible | no disponible | no disponible | GGUF | Variante para Ollama y LM Studio, mencionada en la búsqueda web |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W8A8 introduce una degradación medible: KL de 0,019 frente a la referencia BF16, superior al 0,010 de la variante FP8 del mismo autor.
- Solo se cuantizan las capas MLP; el resto de tensores conserva la precisión original, por lo que el ahorro de memoria es parcial (12,69 GB frente a 15,99 GB).
- No se probaron contextos superiores a 4.096 tokens; el comportamiento con ventanas más largas es desconocido.
- No se probó en GPUs Hopper ni Ada, precisamente donde W8A8 debería aportar más ventaja.
- Los resultados se midieron con una build de desarrollo de vLLM (0.32.0rc1), lo que implica riesgo de incompatibilidad con versiones estables.
- El autor recomienda usar la variante FP8 en RTX 5090 y GPUs similares, donde es más rápida y más fiel al original.
- Licencia OpenMDW 1.1: es necesario revisar sus términos antes de un uso comercial.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación; deben evaluarse empíricamente antes de producción.
- El modelo base es un modelo pequeño (aproximadamente 8.000 millones de parámetros), por lo que su capacidad de razonamiento complejo es limitada en comparación con modelos de mayor tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W8A8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Variante GGUF: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-GGUF
- Resultados completos y metodología: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W8A8/blob/main/RESULTS.md
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- TurinTech: https://www.turintech.ai
- Producto Artemis: https://www.turintech.ai/product/overview
- Otros modelos de TurinTech: https://huggingface.co/turintech
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
