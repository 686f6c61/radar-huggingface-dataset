# Xylolabs/gemma-4-E4B-Tensix-BFP8

## Resumen

Gemma-4-E4B-Tensix-BFP8 es una versión cuantizada del modelo multimodal google/gemma-4-E4B, publicada por Xylolabs con el objetivo de ejecutarse sobre las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La cuantización aplica GPTQ sobre la rejilla de punto flotante por bloques `bfloat8_b` (BFP8) de TT-NN, de modo que los pesos quedan listos para empaquetarse directamente en el runtime `tt-metal`. El checkpoint conserva los tensores en bf16, pero cada valor está ya alineado a la rejilla BFP8.

El modelo mantiene la arquitectura completa del base (torre de visión, torre de audio, embeddings multimodales y LM), aunque solo se cuantificaron las proyecciones lineales del lenguaje: atención (q, o en 42 capas; k, v en 24 capas) y MLP (gate, up, down en 42 capas). El resto de tensores, incluidas las torres de visión y audio, permanecen en bf16. El resultado son 12,06 bits por peso de media y 11,34 GB empaquetados, frente a los 15,04 GB del BF16 original.

Es relevante porque demuestra una ruta de cuantización orientada a hardware específico (block floating point de 8 bits con exponente compartido por bloque) que degrada muy poco la fidelidad respecto al BF16: KL media de 0,00186 y top-1 del 97,55 % sobre 8.176 posiciones de texto en inglés y coreano. No obstante, el autor advierte que solo se ha probado en el simulador `ttsim` con ttnn 0.81.1 y no en hardware real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) del base gemma-4-E4B, con cuantización GPTQ sobre rejilla BFP8 de TT-NN |
| Parámetros totales | 8.667.245.130 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en proyecciones lineales; bf16 en el resto; media de 12,06 bits por peso |
| Idiomas soportados | no disponible (la evaluación cubre inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP8); metadatos en `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint parte de google/gemma-4-E4B y no reentrena el modelo: la única transformación es la cuantización GPTQ de las capas lineales del modelo de lenguaje sobre la rejilla `bfloat8_b`. Cada bloque comparte un exponente, y el packer de TT-NN lo fija tal cual, de forma que los tensores se empaquetan sin conversión adicional. La calibración se realizó con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las torres de visión y audio, los embeddings (`embed_audio`, `embed_vision`), las normas y la LM head (atada al embedding) se mantienen en bf16 sin cambios.

La innovación técnica es el acoplamiento entre el esquema de cuantización y el formato nativo del acelerador: los pesos se guardan como bf16 pero ya cuantizados a la rejilla BFP8, de modo que `ttnn.as_tensor` los acepta directamente con `dtype=ttnn.bfloat8_b`. El repositorio incluye `pack_tensix.py` (verifica que cada matriz empaquetada no cambia ningún valor, con opción `--device` para round-trip por DRAM) y `verify_grid.py` (comprobación de la rejilla solo con torch). El autor indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto y continuación de texto en modo pretrained (sin plantilla de chat).
- Procesamiento multimodal any-to-any: el pipeline declarado es `image-text-to-text` y conserva las torres de visión y audio del base en bf16.
- Razonamiento y matemáticas heredados del modelo base (no evaluados específicamente en esta ficha).
- Capacidades multilingües del base, con evaluación de fidelidad en inglés y coreano.
- Ejecución en NPU Tensix mediante TT-NN (`bfloat8_b`), con verificación de empaquetado incluida.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico en la información disponible.

## Casos de uso

- Despliegue en NPU Tenstorrent: empaquetar las matrices con `ttnn.as_tensor` en `bfloat8_b` y servir inferencia en Wormhole o Blackhole, aprovechando que los pesos ya están en la rejilla del acelerador y no requieren cuantización en tiempo de carga.
- Validación de pipelines de cuantización: usar `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado BFP8 no altera ningún valor antes de llevar un checkpoint a producción.
- Investigación en formatos block floating point: comparar la fidelidad de BFP8 (KL 0,00186) frente a Q4_K_M de llama.cpp (KL 0,24892) sobre el mismo checkpoint base.
- Prototipado multimodal en entornos con memoria limitada: los 11,34 GB empaquetados frente a 15,04 GB en BF16 reducen la huella en DRAM del dispositivo.
- Evaluación de robustez multilingüe: el conjunto de calibración y evaluación incluye coreano, útil para medir la degradación de la cuantización en idiomas distintos del inglés.
- Base para experimentos de cuantización selectiva: `quant4.json` documenta el formato de cada proyección, lo que permite estudiar qué capas admiten BFP4 frente a BFP8.
- Integración en flujos de transformers: cargar con `AutoModelForCausalLM` y `device_map="auto"` para pruebas de continuación de texto en GPU convencional antes de portar a Tensix.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E4B) | 16 | 15,04 | 0 | 100 | 27 de 28 | - |
| Este modelo (BFP8) | 12,06 | 11,337 | 0,00186 | 97,55 | 27 de 28 | 0 |
| Q4_K_M, blk.N.proj Q8_0 (llama.cpp) | 5,67 | 5,349 | 0,24892 | 76,39 | 20 de 28 | 4 |

Las métricas de KL y top-1 cubren 8.176 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) en formato de texto plano. Las 28 respuestas corresponden a prompts cortos con comprobación automática, en forma de completion y con 3-shot. El Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix, con sha256 `c2bd4c28df4a70b6de17427a394c6acb6d22bf3a2ca8d9b9368bd896ce024c9a`. El autor subraya que estas cifras miden cercanía al BF16, no calidad de tarea, y que no se midió velocidad en dispositivo.

## Requisitos de hardware

- VRAM estimada: 11,34 GB empaquetados en BFP8; el repositorio ocupa 17,4 GB (incluye tensores bf16 y metadatos).
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Estado de validación: probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole; no probado en hardware real.
- GPU convencionales: no se documentan requisitos ni pruebas en A100, H100 o RTX 4090; la carga vía transformers con `device_map="auto"` es posible, pero sin cifras de rendimiento publicadas.
- Despliegue: TT-NN (`tt-metal`) para Tensix; transformers para carga y pruebas. tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no se midió velocidad en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma-4-E4B-Tensix-BFP8 | 8.667.245.130 | no disponible | BFP8 (12,06 bits/peso) | 11,34 GB | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B (BF16) | 8.667.245.130 | no disponible | bf16 | 15,04 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo base) | 8.667.245.130 | no disponible | Q4_K_M con blk.N.proj en Q8_0 (5,67 bits/peso) | 5,349 GB | Apache 2.0 | Generado localmente con llama.cpp v0.9.0 |

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio no se evaluaron tras la cuantización.
- El checkpoint es el modelo pretrained: continúa texto y no incluye plantilla de chat, por lo que no está listo para uso conversacional directo.
- No se ha ejecutado en hardware Tensix real; la validación se hizo en el simulador `ttsim` con ttnn 0.81.1.
- Las métricas publicadas miden fidelidad respecto al BF16 (KL y top-1), no calidad de tarea; no hay resultados de MMLU, HumanEval, GSM8K ni similares.
- No se midió latencia ni throughput en dispositivo.
- El repositorio base google/gemma-4-E4B no incluye fichero LICENSE; el autor añade el texto estándar de Apache 2.0 y documenta los cambios en `NOTICE`.
- El modelo se distribuye "as is", sin garantía, y no está afiliado ni respaldado por Tenstorrent.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; aplican los del modelo base.
- Idiomas soportados no declarados en la información disponible; la evaluación se limita a inglés y coreano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Fichero de licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-Tensix-BFP8/blob/main/LICENSE
- Revisión del base usada para la evaluación: https://huggingface.co/google/gemma-4-E4B/tree/11b8250ef59eb3ebc5dae7b21144d7b84f2c06dd
