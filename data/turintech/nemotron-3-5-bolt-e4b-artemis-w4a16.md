# turintech/Nemotron-3.5-Bolt-E4B-Artemis-W4A16

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-W4A16 es una cuantización de 4 bits de los pesos MLP del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16, publicada por TurinTech bajo el nombre de su pipeline de compresión Artemis. El modelo base lo desarrolla NVIDIA y combina una arquitectura multimodal (image-text-to-text, con soporte adicional de audio) con un transformer de tipo Gemma 4, orientada a generación de texto, razonamiento y tool calling. La versión que nos ocupa reduce el peso de los pesos de 15,99 GB (BF16) a 11,24 GB, manteniendo el resto de tensores sin modificar y empaquetados para su uso directo en vLLM.

La relevancia de esta ficha está en el equilibrio entre tamaño y rendimiento: en las pruebas del autor, el checkpoint W4A16 alcanza 205 tok/s en una única petición sobre una RTX 5090, frente a los 139 tok/s del original BF16, con una calidad de tool calling (92,5%) y GSM8K (92,0%) prácticamente idénticas. El precio a pagar es un aumento de la divergencia respecto al original: su KL de chat es de 0,080, entre 6 y 7,8 veces mayor que el del checkpoint FP8 del mismo autor.

El modelo tiene 7.996.156.490 parámetros totales (aproximadamente 8B) y un repositorio de 11,3 GB. Está pensado para despliegues en vLLM con GPUs de 16 GB en adelante, con licencia OpenMDW 1.1 y soporte declarado de tool calling mediante el parser `gemma4`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Gemma 4 (image-text-to-text, con audio opcional); pesos MLP cuantizados a 4 bits (W4A16) |
| Parámetros totales | 7.996.156.490 (~8B) |
| Parámetros activos | no disponible (no se declara como MoE en la información proporcionada) |
| Longitud de contexto | 4.096 tokens (configuración recomendada y máxima probada por el autor); no se han probado contextos superiores |
| Tipos de cuantización | W4A16 (pesos MLP en enteros de 4 bits, activaciones en 16 bits); también existe un checkpoint FP8 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de NVIDIA basado en la familia Gemma 4, con pipeline `image-text-to-text` y soporte de audio cuando se instala `vllm[audio]`. La versión publicada por TurinTech no reentrena el modelo: aplica una cuantización W4A16 únicamente sobre los pesos MLP del modelo de lenguaje, dejando intactos el resto de tensores (atención, core, KV compartida y configuración), que se redistribuyen empaquetados desde el checkpoint original de NVIDIA. El resultado se sirve mediante `compressed-tensors` y está pensado para vLLM 0.32.0rc1 o superior.

La innovación principal es el pipeline Artemis de TurinTech, que combina cuantización de pesos con un proceso de calibración para tool calling. Según el autor, el checkpoint se evaluó con thinking desactivado y contextos de hasta 4.096 tokens; no se han publicado detalles sobre el dataset de calibración, el número de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO en el original. El repositorio separa los pesos en `attn.safetensors` (1,17 GB), `core.safetensors` (8,10 GB), `mlp.safetensors` (1,86 GB) y `model-frozen-shared-kv.safetensors` (110 MB), lo que facilita la inspección y el despliegue selectivo.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento y matemáticas a nivel GSM8K (92,0% en las primeras 250 preguntas según el autor).
- Tool calling / function calling con parser `gemma4` y `--enable-auto-tool-choice` en vLLM; las llamadas se devuelven en `choices[0].message.tool_calls`.
- Modo thinking configurable mediante `chat_template_kwargs: {"enable_thinking": false}`; las pruebas publicadas se hicieron con thinking desactivado.
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`), activables quitando `--language-model-only`.
- Soporte de audio opcional, requiriendo `pip install "vllm[audio]"`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con endpoints compatibles (`endpoints_compatible`) y despliegue en vLLM.

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con hasta 4.096 tokens de contexto, suficiente para historiales de soporte típicos, y su plantilla de chat permite integrarlo directamente en APIs compatibles con OpenAI.
- **Asistentes con tool calling en producción**: gracias al parser `gemma4` y a `--enable-auto-tool-choice`, se puede conectar a funciones externas (consultas a bases de datos, APIs de terceros) con una tasa de acierto del 92,5% en los casos no calibrados reportados por el autor.
- **Generación de código y resolución de problemas matemáticos**: el rendimiento en GSM8K (92,0%) lo hace adecuado para asistentes de resolución de problemas y pipelines de verificación de cálculos, aunque no se han publicado resultados de HumanEval.
- **Despliegue en GPUs de consumo**: con 11,24 GB de pesos y 9,70 GiB en vLLM, cabe en una RTX 5090 de 32 GB con amplio margen para KV cache (235.490 tokens según el autor) y, con ajustes de `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`, el autor espera que funcione en GPUs de 16 GB (no probado).
- **Prototipado rápido de aplicaciones multimodales**: al quitar `--language-model-only` se habilita la entrada de imágenes, útil para demos de captioning o VQA ligero, aunque el autor solo hizo comprobaciones puntuales en imagen y audio.
- **Servicios de inferencia de alto throughput en una sola GPU**: los 205 tok/s en una petición única sobre RTX 5090 permiten servir cargas moderadas con baja latencia sin necesidad de clústeres multi-GPU.
- **Evaluación comparativa de técnicas de cuantización**: la disponibilidad de checkpoints W4A16 y FP8 del mismo modelo base facilita experimentos internos sobre el trade-off entre tamaño, velocidad y fidelidad (KL de chat 0,080 frente a 0,010).

## Benchmarks y rendimiento

Resultados publicados por el autor (una NVIDIA RTX 5090, vLLM 0.32.0rc1, thinking off):

| Modelo | Tamaño | KL chat (menor es mejor) | Tool calls, casos no calibrados | GSM8K, primeras 250 | Generación, una petición (tok/s) |
|---|---|---|---|---|---|
| TurinTech W4A16 | 11,24 GB | 0,080 | 92,5% | 92,0% | 205 |
| TurinTech FP8 | 12,69 GB | 0,010 | 92,2% | 92,0% | 183 |
| BF16 original | 15,99 GB | referencia | 92,2% | 91,6% | 139 |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 9,70 GiB de pesos en vLLM; con KV cache y overhead, el autor reporta 235.490 tokens de KV cache en una RTX 5090 de 32 GB.
- **GPU recomendadas**: NVIDIA RTX 5090 (probada), GPUs de 16 GB en adelante (esperado, no probado), A100/H100 para despliegues multi-usuario de mayor escala (no documentado por el autor).
- **GPU de consumo**: sí, cabe en RTX 5090; en GPUs de 16 GB se recomienda `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048` y reducir el primer valor si la GPU también alimenta pantalla.
- **Opciones de despliegue**: vLLM 0.32.0rc1 o superior (probado); compatible con `compressed-tensors`; no se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- **Latencia y throughput**: 205 tok/s en una petición única sobre RTX 5090 con thinking off; no se han publicado métricas de throughput batched.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Artemis-W4A16 (este) | ~8B | 4.096 (probado) | OpenMDW 1.1 | Hugging Face, vLLM | Cuantización W4A16 del original; 11,24 GB |
| Nemotron-3.5-Bolt-E4B-Artemis-FP8 (mismo autor) | ~8B | no disponible | OpenMDW 1.1 | Hugging Face, vLLM | 12,69 GB; KL 0,010; 183 tok/s |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (original) | ~8B | no disponible | no disponible en la información | Hugging Face | 15,99 GB; 139 tok/s; referencia de calidad |

No se dispone de datos de benchmarks ni especificaciones de contexto de modelos de otros fabricantes en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- **Divergencia respecto al original**: el KL de chat de 0,080 es entre 6 y 7,8 veces mayor que el del checkpoint FP8 del mismo autor; si la fidelidad al modelo original es crítica, conviene elegir FP8 o BF16.
- **Contexto limitado**: solo se han probado contextos de hasta 4.096 tokens; no hay garantías de comportamiento correcto en ventanas mayores.
- **Tool calling multi-turno no probado**: las evaluaciones de tool calls se hicieron en casos de un solo turno y excluyendo los usados en calibración; el rendimiento en conversaciones multi-turno con herramientas no está validado.
- **Multimodalidad poco validada**: imagen y audio solo se comprobaron de forma puntual según el autor; no se recomienda su uso en producción sin evaluación propia.
- **Riesgo de alucinación**: no se documenta en la información proporcionada; aplican los riesgos habituales de los modelos generativos de ~8B.
- **Sesgos**: el autor incluye `bias.md` del publicador original sin modificar, pero no se detallan sesgos conocidos específicos en la información disponible.
- **Idiomas**: no se especifican los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- **Licencia**: OpenMDW 1.1; conviene revisar los términos en https://openmdw.ai/license/1-1/ antes de un uso comercial.
- **Versión de vLLM**: probado únicamente con vLLM 0.32.0rc1, una build de desarrollo; pueden aparecer incompatibilidades con versiones estables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W4A16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados completos y método: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-W4A16/blob/main/RESULTS.md
