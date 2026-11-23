# turintech/Nemotron-3.5-Bolt-E4B-Artemis-NVFP4

## Resumen

Nemotron-3.5-Bolt-E4B-Artemis-NVFP4 es una cuantización NVFP4 del modelo NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 publicada por TurinTech bajo su pipeline Artemis. El checkpoint reduce los pesos de las capas MLP del modelo de lenguaje a formato NVFP4 (FP4 de NVIDIA), mientras que el resto de tensores (atención, core, torres de visión y audio) se redistribuyen sin modificar desde el checkpoint original de NVIDIA. El resultado ocupa 11,24 GB de pesos, frente a los 15,99 GB del BF16 original, y está pensado para servir con vLLM en GPUs Blackwell.

El modelo base es un transformer multimodal con arquitectura Gemma 4 (etiqueta `gemma4` en los tags y parser de tool calls `gemma4` en vLLM), con aproximadamente 8.000 millones de parámetros totales según los safetensors del repositorio. Acepta entradas de imagen y texto (`image-text-to-text`) y, según la model card, conserva las torres de visión y audio del original. La cuantización busca mantener la calidad del BF16 original en tareas de chat, tool calling y GSM8K, mejorando el throughput de generación.

La relevancia de esta ficha radica en que es un ejemplo práctico de cuantización FP4 para despliegue en producción: el autor publica métricas de divergencia KL frente al original, velocidad de generación con una y ocho peticiones concurrentes, y comparación directa con otra build NVFP4 pública (caelunshun) y con su propia build FP8. Todo medido en una RTX 5090 con vLLM 0.32.0rc1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Gemma 4 (tags `gemma4`, parser `gemma4`); pesos MLP cuantizados en NVFP4 |
| Parametros totales | 7.996.156.490 (~8,0 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en las pruebas publicadas; 65.536 tokens en BFCL-v3; máximo nativo no disponible |
| Tipos de cuantizacion | NVFP4 en pesos MLP; resto de tensores en BF16 sin modificar; build FP8 alternativa del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (Open Model Development Weight, enlace en la model card) |
| Formato de pesos | safetensors (repartidos en `attn.safetensors`, `core.safetensors`, `mlp.safetensors`, `model-frozen-shared-kv.safetensors`) + configuración y tokenizer |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un reentrenamiento. TurinTech parte del BF16 original de NVIDIA y aplica cuantización NVFP4 únicamente a los pesos MLP del modelo de lenguaje (`mlp.safetensors`, 1,86 GB), dejando intactos y simplemente reempaquetados los tensores de atención (`attn.safetensors`, 1,17 GB), el core (`core.safetensors`, 8,10 GB) y el fichero `model-frozen-shared-kv.safetensors` (110 MB). La arquitectura subyacente es la del Nemotron 3.5 Bolt E4B de NVIDIA, un transformer con torres de visión y audio que permiten entrada image-text-to-text.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO; esos datos corresponden a la model card de NVIDIA y no se reproducen en la información proporcionada. La innovación técnica de esta publicación es el esquema de cuantización: NVFP4 aplicado solo a las MLP, con el resto en BF16, buscando un equilibrio entre reducción de memoria y preservación de calidad. El autor reporta una divergencia KL de chat de 0,063 frente al BF16 (menor es mejor), frente a 0,194 de la build NVFP4 de caelunshun y 0,010 de su propia build FP8.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo "thinking" desactivable vía `chat_template_kwargs.enable_thinking` (las métricas publicadas se midieron con thinking off).
- Tool calling / function calling: soportado en vLLM con `--enable-auto-tool-choice --tool-call-parser gemma4`; las llamadas se devuelven en `choices[0].message.tool_calls`.
- Entrada multimodal de imagen y texto (`image-text-to-text`); para imágenes hay que omitir `--language-model-only` en el arranque de vLLM.
- Entrada de audio: la model card indica que se necesita `pip install "vllm[audio]"` y no usar `--language-model-only`.
- Capacidades multilingües: no disponible (no se detallan idiomas).
- Razonamiento multi-step y uso como agente: no se documenta explícitamente en la información disponible, aunque el soporte de tool calling es un requisito habitual para flujos de agente.

## Casos de uso

- Servicio de chat en GPUs Blackwell de 16 GB: el checkpoint ocupa 11,24 GB de pesos y arranca con `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`; encaja en tarjetas consumer de esa VRAM para conversaciones multi-turno a 4.096 tokens de contexto.
- Asistentes con tool calling: el parser `gemma4` y `--enable-auto-tool-choice` permiten exponer funciones al modelo a través del endpoint OpenAI-compatible de vLLM, adecuado para asistentes que consultan APIs o bases de datos.
- Procesamiento de documentos con imagen: al conservar las torres de visión, el modelo puede recibir imágenes junto al texto (por ejemplo, capturas o escaneos) en un pipeline de extracción y resumen.
- Transcripción y análisis de audio: con el extra `vllm[audio]` instalado, el modelo acepta entradas de audio para tareas de comprensión de voz sin un pipeline separado.
- Evaluación de agentes con contexto largo: BFCL-v3 se ejecutó a 65.536 tokens, lo que indica que el checkpoint se ha probado en escenarios de tool calling con ventanas amplias, útil para benchmarking interno de agentes.
- Despliegue de bajo coste en DGX Spark: la model card cita pruebas en una DGX Spark con vLLM 0.31.0, lo que lo hace apto para prototipos en hardware compacto con 11,24 GB de pesos.
- Comparación de estrategias de cuantización en CI: el autor publica métricas de KL y throughput frente a FP8 y BF16, lo que permite usar este checkpoint como referencia en pipelines de validación de cuantizaciones.

## Benchmarks y rendimiento

| Modelo | Tamano | KL chat (menor es mejor) | Generacion, 1 peticion (tok/s) | Generacion, 8 peticiones (tok/s) |
|---|---|---|---|---|
| TurinTech NVFP4 (este) | 11,24 GB | 0,063 | 202 | 1321 |
| caelunshun NVFP4 | 9,61 GB | 0,194 | 193 | 1366 |
| TurinTech FP8 | 12,69 GB | 0,010 | 183 | 1206 |
| BF16 original | 15,99 GB | referencia | 139 | 844 |

Medido en una NVIDIA RTX 5090 con vLLM 0.32.0rc1, thinking off. El autor advierte que la build de caelunshun es solo texto y usa caché KV en FP8, que la medición de KL no emula, por lo que su KL es una cota inferior. Los resultados de tool calls y GSM8K se remiten a la página de resultados del repositorio (`RESULTS.md`), no incluidos en la información disponible. No se han publicado en la información disponible resultados de MMLU, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,24 GB de pesos; en vLLM el autor reporta 9,70 GiB de memoria de pesos. Con caché KV y overhead, una GPU de 16 GB es el mínimo práctico según la model card.
- GPU recomendadas: Blackwell, incluida la RTX 5090 (donde se midieron los resultados) y la DGX Spark (probada con vLLM 0.31.0). El soporte NVFP4 depende de la generación de GPU; no se documenta compatibilidad con A100, H100 o RTX 4090 en la información disponible.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB con `--gpu-memory-utilization 0.92 --max-num-batched-tokens 2048`; el autor indica que es "esperado que funcione, no probado en una tarjeta de 16 GB".
- Opciones de despliegue: vLLM (versión probada 0.32.0rc1, y 0.31.0 en DGX Spark). No se mencionan llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: 202 tok/s con una petición y 1321 tok/s con ocho peticiones concurrentes en RTX 5090; el BF16 original rinde 139 y 844 tok/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TurinTech Nemotron-3.5-Bolt-E4B-Artemis-NVFP4 | ~8,0 B | 4.096 en pruebas; 65.536 en BFCL-v3 | openmdw-1.1 | safetensors NVFP4 | 11,24 GB; KL 0,063; 202 tok/s (1 peticion) |
| caelunshun NVFP4 (mismo base) | no disponible | no disponible | no disponible | safetensors NVFP4 | 9,61 GB; solo texto con KV FP8; KL 0,194 (cota inferior); 193 tok/s |
| TurinTech FP8 (mismo base) | ~8,0 B | no disponible | openmdw-1.1 | safetensors FP8 | 12,69 GB; KL 0,010; 183 tok/s |
| NVIDIA Nemotron-3.5-Bolt-E4B-BF16 (original) | ~8,0 B | no disponible | no disponible | safetensors BF16 | 15,99 GB; referencia de calidad; 139 tok/s |

## Limitaciones y advertencias

- La cuantización NVFP4 introduce una divergencia medible frente al BF16 original (KL de chat 0,063); para tareas sensibles a la fidelidad exacta, la build FP8 del mismo autor (KL 0,010) es más conservadora.
- El soporte NVFP4 está ligado a GPUs Blackwell y a versiones recientes de vLLM; la model card cita una build de desarrollo (0.32.0rc1), lo que implica riesgo de cambios de API.
- El rendimiento en una GPU de 16 GB no está verificado por el autor ("esperado que funcione, no probado").
- Solo se cuantizan las MLP; el resto de pesos permanece en BF16, por lo que el ahorro de memoria es parcial (de 15,99 a 11,24 GB).
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni idiomas soportados en la información disponible; hay que remitirse a la model card de NVIDIA para esos datos.
- La licencia openmdw-1.1 debe revisarse antes de uso comercial; la model card enlaza los términos en openmdw.ai.
- Los benchmarks publicados se limitan a KL, velocidad y (según se indica) tool calls y GSM8K en `RESULTS.md`; no hay MMLU, HumanEval ni comparativas estándar en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Resultados completos y método: https://huggingface.co/turintech/Nemotron-3.5-Bolt-E4B-Artemis-NVFP4/blob/main/RESULTS.md
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- TurinTech en Hugging Face: https://huggingface.co/turintech
- Web de TurinTech: https://www.turintech.ai
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
