# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8

## Resumen

Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo mantiene la arquitectura transformer decoder-only del Llama 3.1 original, con 8.030.261.248 parámetros, pero sustituye el formato de pesos de las proyecciones de atención y MLP por el formato block-floating-point `bfloat8_b` (BFP8) nativo del hardware Tensix, mientras que el LM head, los embeddings y las capas de normalización permanecen en bf16.

La propuesta de valor es doble: por un lado, reduce el tamaño empaquetado a 9,517 GB frente a los 16,06 GB en bf16; por otro, aprovecha la cuantización GPTQ sobre la rejilla BFP8 para preservar una fidelidad numérica muy superior a la de cuantizaciones de propósito general. Según la model card, la divergencia KL media respecto al modelo en bf16 es de 0,0008, frente a 0,0323 de llama.cpp Q4_K_M, es decir, unas 0,03 veces la de esta última.

Es relevante ahora porque el ecosistema de aceleradores alternativos a GPU (Tenstorrent, con su stack tt-metal, ttnn y tt-forge) necesita artefactos de pesos adaptados a su formato nativo para poder desplegar LLMs de forma eficiente. Este repositorio ofrece un checkpoint listo para `tt-transformers` con kernels y runner publicados, además de compatibilidad con transformers estándar para verificación en CPU/GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con proyecciones cuantizadas a block-floating-point BFP8 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k, pero la ficha del autor no lo confirma) |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`) en atención (q, k, v, o) y MLP (gate, up, down) de las 32 capas; bf16 en LM head, embeddings y normas. Existe una variante BFP4 publicada aparte |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors empaquetados para Tensix (9,517 GB) y compatibles con transformers; incluye `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) del Llama-3.1-8B-Instruct original. No se ha reentrenado ni ajustado con RLHF/DPO adicional: la model card solo documenta el proceso de cuantización GPTQ sobre la rejilla `bfloat8_b` de Tensix, aplicado a las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) en las 32 capas. El LM head, los embeddings, las capas de normalización y el resto de tensores se conservan en bf16 tal como en el modelo base. El fichero `quant4.json` especifica el formato de cada proyección.

La innovación técnica principal es el uso del formato block-floating-point BFP8, que agrupa bloques de valores con un exponente compartido y mantiene mantisas de 8 bits, un formato que las NPU Tensix procesan de forma nativa. La cuantización se realizó con la herramienta `tensix-bfp-gptq` (commit 5c52065), que incluye `tools/pack_tensix.py` y `tools/verify_grid.py` para empaquetar y verificar cada matriz contra el resultado en torch y contra el round-trip por DRAM del dispositivo. Los ficheros de configuración, tokenizer y plantilla de chat provienen de `unsloth/Llama-3.1-8B-Instruct` (commit 4699cc7) sin modificaciones. El autor no detalla el número de tokens de calibración ni la composición del dataset usado para GPTQ.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del Instruct original.
- Razonamiento, matemáticas y generación de código propias de Llama 3.1 8B Instruct.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada de forma independiente en esta ficha).
- Capacidades multilingües limitadas a los ocho idiomas declarados: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante tt-metal v0.81.1 y tt-transformers, con `--use_hf_rope`.
- Compatibilidad con el pipeline `text-generation` de transformers y con text-generation-inference según las etiquetas del repositorio.
- No se documentan capacidades de visión, audio ni modo thinking extendido.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal. El checkpoint está empaquetado para cargarse directamente en Wormhole o Blackhole mediante tt-transformers, lo que permite servir un 8B Instruct sin GPU NVIDIA.
- Inferencia de bajo consumo en edge o servidores con NPU: al ocupar 9,517 GB en lugar de 16,06 GB en bf16, cabe en dispositivos con menos memoria; el autor recomienda la variante BFP4 para equipos aún más limitados.
- Atención al cliente automatizada: el modelo conserva el comportamiento conversacional del Llama 3.1 Instruct y admite plantilla de chat, por lo que puede gestionar diálogos multi-turno con el tokenizador original.
- Generación de código asistida: útil en pipelines donde el coste energético o la disponibilidad de GPU sea una restricción, aprovechando las capacidades de código del modelo base.
- Evaluación de fidelidad de cuantización: el repo incluye `verify_grid.py` y `pack_tensix.py`, lo que lo convierte en un banco de pruebas para validar que una cuantización BFP8 reproduce fielmente el modelo en bf16 (KL media de 0,0008).
- Investigación en formatos block-floating-point: sirve como referencia reproducible para estudiar el impacto de BFP8 frente a Q4_K_M en tareas de generación.
- Prototipado con transformers en CPU/GPU: el snippet de quickstart permite cargar el modelo con `AutoModelForCausalLM` en bfloat16 y `device_map="auto"` para validar respuestas antes de portar a Tensix.

## Benchmarks y rendimiento

La model card solo publica métricas de fidelidad de cuantización, no benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo (BFP8) | llama.cpp Q4_K_M | BF16 (referencia) |
|---|---|---|---|
| Tamano empaquetado (GB) | 9,517 | no disponible | 16,06 |
| KL media respecto a bf16 | 0,0008 | 0,0323 | 0 (referencia) |
| Top-1 (%) | no disponible (tabla truncada en la informacion) | no disponible | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 9,517 GB de pesos empaquetados para Tensix; en carga con transformers en bfloat16 el repositorio ocupa 16,1 GB, por lo que se recomienda al menos 16-18 GB de memoria unificada o VRAM para inferencia completa en GPU.
- GPU recomendadas para el flujo transformers: RTX 4090 (24 GB), A100 40/80 GB, H100; también cabe en GPUs consumer de 16 GB solo con cuantización adicional no incluida en este repo.
- NPU objetivo: Tenstorrent Wormhole y Blackhole, validadas con ttnn 0.81.1 sobre el simulador ttsim de Blackhole según la model card.
- Despliegue: tt-transformers (tt-metal v0.81.1) con `--use_hf_rope`; transformers estándar; text-generation-inference según las etiquetas. No se documenta soporte de vLLM, llama.cpp u Ollama para este formato.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite al demo `simple_text_demo.py` con `-k "performance and batch-1"` para medirlos en hardware Tensix.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8 | 8,03B | no disponible | BFP8 + bf16 mixto | llama3.1 | Hugging Face, formato Tensix |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k (modelo base) | bf16 | llama3.1 | Hugging Face |
| Xylolabs Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4 | 8,03B | no disponible | BFP4 + bf16 mixto | llama3.1 | Hugging Face, para dispositivos con menos memoria |
| unsloth/Llama-3.1-8B-Instruct | 8,03B | 128k | bf16 (config y tokenizer reutilizados aquí) | llama3.1 | Hugging Face |

La comparación directa con alternativas de cuantización de propósito general (Q4_K_M de llama.cpp) solo está disponible en la métrica KL: 0,0008 frente a 0,0323. No hay datos de benchmarks de tareas que permitan comparar rendimiento cualitativo con otros modelos de 8B.

## Limitaciones y advertencias

- Es un modelo cuantizado: aunque la KL media es muy baja (0,0008), puede haber degradación en tareas sensibles a la precisión numérica, especialmente en matemáticas y código de alta exigencia.
- Hereda los sesgos y riesgos de alucinación del Llama-3.1-8B-Instruct original; no se documenta ningún proceso adicional de mitigación.
- La licencia llama3.1 impone restricciones de uso comercial (política de uso aceptable de Meta) y obliga a incluir el aviso de licencia; conviene revisar los términos antes de producción.
- El soporte de idiomas se limita a los ocho declarados; el rendimiento en español no está cuantificado en la información disponible.
- El formato BFP8 está pensado para NPU Tensix; fuera de ese hardware, el modelo se carga en bf16 y pierde la ventaja de tamaño (16,1 GB).
- No se documenta la longitud de contexto efectiva tras la cuantización; el modelo base soporta 128k, pero la ficha no lo confirma para este checkpoint.
- La verificación se realizó sobre el simulador ttsim de Blackhole, no sobre silicio físico, según la model card.
- Repositorio con muy poca tracción (243 descargas, 1 like) y creado recientemente; no hay evidencia de uso en producción a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante BFP4: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP4
- Config y tokenizer de origen: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
