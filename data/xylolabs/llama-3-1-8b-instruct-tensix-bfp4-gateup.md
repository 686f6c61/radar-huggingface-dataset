# Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4-GateUp

## Resumen

Llama-3.1-8B-Instruct-Tensix-BFP4-GateUp es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint derivado en el que las capas lineales del transformer original se han reescrito en los formatos de bloque de coma flotante nativos de TT-NN: `bfloat4_b` (BFP4, 4,5 bits por peso) para las proyecciones gate y up del MLP, y `bfloat8_b` (BFP8, 8,5 bits por peso) para atención, down del MLP y cabeza de lenguaje. El resultado es un checkpoint de 7,15 GB que TT-NN empaqueta sin modificar los valores, lo que permite cargarlo directamente en memoria DRAM del acelerador.

La relevancia del modelo es fundamentalmente de infraestructura: demuestra que es posible aplicar GPTQ con búsqueda de exponente por bloque sobre un Llama 3.1 de 8B y almacenar el resultado en la retícula BFP que consumen las NPU Tensix, manteniendo una fidelidad alta respecto al original en BF16 (KL media de 0,02282 y top-1 del 92,71 % sobre 16.056 posiciones). Con un tamaño efectivo de 7,12 bits por peso de media, el checkpoint ocupa menos de la mitad que el BF16 (16,06 GB) y ofrece una alternativa intermedia entre el BF16 y el Q4_K_M de llama.cpp en términos de calidad por bit.

El modelo conserva la tokenización, la plantilla de chat y el config del Llama 3.1-8B-Instruct estándar (procedentes de la versión de unsloth), por lo que puede cargarse también con `transformers` en hardware convencional, aunque su razón de ser es el despliegue en silicio de Tenstorrent. La licencia es la Llama 3.1 Community License, con las restricciones habituales de Meta para uso comercial a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), capas lineales cuantizadas a BFP4/BFP8 para TT-NN |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Llama 3.1-8B-Instruct) |
| Tipos de cuantización | BFP4 (`bfloat4_b`, 4,5 bits/peso) en gate y up del MLP; BFP8 (`bfloat8_b`, 8,5 bits/peso) en atención, down del MLP y LM head; media de 7,12 bits/peso |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (valores bf16 sobre retícula BFP4/BFP8), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama 3.1-8B-Instruct de Meta: un transformer decoder-only con 32 capas, atención multi-cabeza con GQA y las dimensiones estándar del modelo de 8B. Xylolabs no reentrena ni hace fine-tuning; parte de los pesos BF16 byte-idénticos a los de Meta y aplica un proceso de cuantización post-entrenamiento. Las matrices gate y up del MLP de las 32 capas se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, k, v, o), la proyección down del MLP y la LM head se cuantizan a `ttnn.bfloat8_b` con redondeo al más cercano. Embeddings, normas y el resto de tensores permanecen en bf16.

La innovación técnica clave es el almacenamiento de los pesos cuantizados como valores bf16 situados exactamente sobre la retícula BFP4 o BFP8, de modo que TT-NN los empaqueta sin alterar su valor. Esto permite una verificación bit a bit tras el empaquetado (`pack_tensix.py`, `verify_grid.py`) y garantiza que la inferencia en la NPU reproduce exactamente los pesos exportados. El checkpoint se validó con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent; tt-transformers y tt-forge no se ejecutaron con este checkpoint según la model card. No se documenta RLHF ni DPO adicional: las capacidades conversacionales provienen íntegramente del modelo base de Meta.

## Capacidades

- Generación de texto y conversación multi-turno, con la plantilla de chat de Llama 3.1 (procedente de unsloth) incluida en el repositorio.
- Razonamiento y conocimiento general heredados del Llama 3.1-8B-Instruct original.
- Generación de código y matemáticas a nivel del modelo base de 8B (sin mejoras específicas documentadas en esta exportación).
- Soporte multilingüe para inglés, alemán, francés, italiano, portugués, hindi, español y tailandés, según los metadatos del modelo.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`, con carga en bfloat16 y `device_map="auto"`.
- Despliegue nativo en NPU Tensix (Wormhole, Blackhole) a través de TT-NN, con empaquetado directo de los tensores BFP4/BFP8.
- Verificación de integridad de pesos incluida en el repositorio (`pack_tensix.py`, `verify_grid.py`, `quant4.json`).
- Tool calling, function calling y comportamiento agéntico: no disponible de forma explícita en la información proporcionada (se heredaría, en su caso, del modelo base).

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está pensado para cargarse directamente en la DRAM de la NPU (unos 7,15 GB solo para pesos) mediante TT-NN, aprovechando el empaquetado nativo BFP4/BFP8 sin conversión adicional.
- Servicio de chat en español o multiidioma sobre hardware Tensix: al conservar la plantilla de chat y el tokenizador de Llama 3.1, puede exponerse como endpoint conversacional en inglés, español, francés, alemán, italiano, portugués, hindi o tailandés.
- Evaluación de fidelidad de cuantización: útil como referencia para comparar el impacto de BFP4/BFP8 frente a BF16 o Q4_K_M en tareas de generación, usando las métricas KL y top-1 ya publicadas como línea base.
- Investigación en cuantización de bloque: el repositorio incluye `quant4.json` con el formato por proyección y scripts de verificación, lo que facilita reproducir o auditar la retícula BFP aplicada a cada matriz.
- Prototipado en simulador: validado con ttsim (simulador de Blackhole), permite desarrollar y depurar pipelines de inferencia Tensix antes de disponer de hardware físico.
- Integración en pipelines de `transformers` en GPU convencional: aunque no es su objetivo principal, puede cargarse con `device_map="auto"` para pruebas de calidad o comparaciones frente al modelo base.
- Fine-tuning o adaptación posterior: no recomendado directamente sobre este checkpoint cuantizado; en su caso, partir del modelo base BF16.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B-Instruct) | 16 | 16,06 | 0 | 100 | 28 de 33 | - |
| **Este modelo (BFP4 GateUp)** | 7,12 | 7,146 | 0,02282 | 92,71 | 30 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03235 | 91,06 | 30 de 33 | 0 |

Las métricas KL y top-1 se calculan sobre 16.056 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en formato plano y con plantilla de chat. Las "respuestas correctas" corresponden a 33 prompts cortos con comprobación automática. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/dispositivo: aproximadamente 7,15 GB solo para los pesos del modelo, más espacio para caché KV y buffers. En GPU convencional, el checkpoint en bf16 requiere del orden de 16 GB, por lo que encaja en GPUs de 24 GB o más.
- GPU recomendadas para uso con `transformers`: A100, H100, RTX 4090, L40S y similares con al menos 16-24 GB de memoria.
- Aceleradores objetivo: NPU Tenstorrent Wormhole y Blackhole; validado en ttsim (simulador de Blackhole) con ttnn 0.81.1.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 24 GB (RTX 3090, RTX 4090) cargando en bf16; en GPUs de 16 GB puede requerir cuantización adicional o descarga parcial de capas.
- Opciones de despliegue: TT-NN (nativo), `transformers` con `device_map="auto"`, text-generation-inference (según los tags del repositorio). tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs BFP4 GateUp) | 8,03B | no disponible | 7,12 | llama3.1 | Hugging Face, orientado a Tensix |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | no disponible | 16 | llama3.1 | Hugging Face, uso general |
| Q4_K_M de llama.cpp (Llama 3.1-8B) | 8,03B | no disponible | 4,89 | llama3.1 | Hugging Face / GGUF, uso general |
| unsloth/Llama-3.1-8B-Instruct | 8,03B | no disponible | 16 | llama3.1 | Hugging Face, base de la evaluación |

Frente al BF16 original, este modelo reduce el tamaño a menos de la mitad (7,15 GB frente a 16,06 GB) con una KL media de 0,02282 y un top-1 del 92,71 %. Frente a Q4_K_M, ocupa más espacio (7,15 GB frente a 4,92 GB) pero obtiene mejor fidelidad (KL 0,02282 frente a 0,03235; top-1 92,71 % frente a 91,06 %). Su ventaja diferencial no es la compresión máxima, sino la compatibilidad nativa con la retícula BFP de TT-NN.

## Limitaciones y advertencias

- Es un checkpoint cuantizado: no debe esperarse paridad exacta con el BF16; la model card reporta una KL media de 0,02282 y un top-1 del 92,71 %, lo que implica cierta degradación en la distribución de probabilidades.
- La cuantización se calibró con WikiText-2 y Wikipedia en coreano; el rendimiento puede diferir en otros dominios o idiomas, incluido el español.
- Riesgo de alucinación inherente al Llama 3.1-8B-Instruct base; la cuantización puede amplificarlo en casos límite.
- Sesgos heredados del modelo de Meta, no mitigados en esta exportación.
- El checkpoint está pensado para Tensix; en GPU convencional funciona con `transformers`, pero no se han publicado métricas de latencia ni throughput en ese entorno.
- tt-transformers y tt-forge no se validaron con este checkpoint; solo se comprobó el empaquetado con ttnn 0.81.1 sobre ttsim.
- Licencia Llama 3.1 Community License: restricciones para uso comercial a gran escala (más de 700 millones de usuarios mensuales) y obligaciones de atribución; revisar los términos antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que la validación comunitaria es inexistente.
- No se documenta soporte explícito de tool calling ni de modo "thinking"; cualquier capacidad agéntica dependería del modelo base y de la integración.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Config/tokenizer de referencia (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B-Instruct/tree/4699cc75b550f9c6f3173fb80f4703b62d946aa5
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tensix-BFP4-GateUp/blob/main/LICENSE
