# Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4

## Resumen

Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, publicada por Xylolabs y optimizada especificamente para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). No es un modelo nuevo: es el mismo transformer denso de 7.615.616.512 parámetros, pero con las proyecciones MLP cuantizadas a `bfloat4_b` (BFP4) y las proyecciones de atención a `bfloat8_b` (BFP8), mientras que el LM head, los embeddings y las normas permanecen en bf16.

El problema que resuelve es el despliegue eficiente de un LLM de 7B en hardware NPU de Tenstorrent, donde el formato de bloque flotante (block floating point) es nativo. El paquete resultante ocupa 6.262 GB, frente a los 15.23 GB del modelo en BF16, lo que permite encajar el modelo completo en la memoria de un dispositivo Tensix sin recurrir a formatos de cuantización pensados para GPU.

Es relevante ahora porque la cuantización BFP4/BFP8 no es habitual en el ecosistema transformers y este repositorio incluye tanto los pesos empaquetados como las herramientas de verificación (`pack_tensix.py`, `verify_grid.py`) y las instrucciones para ejecutarlo con tt-metal, tt-forge y tt-transformers. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), 28 capas |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atención q/k/v/o; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en (segun la model card; el modelo base Qwen2.5 soporta multiples idiomas, pero esta ficha solo declara inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetados para Tensix; también compatibles con `ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con 28 capas, atención con RoPE y proyecciones estándar q/k/v/o y gate/up/down en el MLP. Este repositorio no reentrena el modelo; aplica un proceso de cuantización post-entrenamiento. Las proyecciones MLP se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, y las proyecciones de atención a BFP8 mediante redondeo al más cercano (round to nearest). El LM head, los embeddings y las normas se conservan en bf16 tal como en el modelo base.

La innovación técnica principal es el uso del formato de bloque flotante nativo de Tensix, que comparte exponente por bloque de valores y resulta adecuado para las matrices de la NPU. El repositorio incluye el fichero `quant4.json`, que documenta el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` para comprobar que cada matriz empaquetada se reconstruye exactamente en el dispositivo. No se detallan en la información disponible los datos de entrenamiento originales de Qwen2.5-7B-Instruct ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional, con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento y respuesta a instrucciones heredados de Qwen2.5-7B-Instruct.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas de forma independiente en esta cuantización).
- Ejecución en transformers estándar con `dtype="bfloat16"` y `device_map="auto"`.
- Despliegue en hardware Tenstorrent Tensix mediante ttnn, tt-metal, tt-forge y tt-transformers.
- Compatibilidad con text-generation-inference y endpoints (segun los tags del repositorio).
- Soporte de tool calling y agentes: no disponible en la información proporcionada para esta cuantización concreta.

## Casos de uso

- Despliegue en NPU Tenstorrent: cargar el modelo empaquetado en un dispositivo Wormhole o Blackhole para inferencia de un LLM de 7B con 6.262 GB de pesos, aprovechando el formato BFP nativo del hardware.
- Prototipado en simulador: validar pipelines con `ttsim`, el simulador de Blackhole, antes de pasar a silicio real, usando las herramientas de verificación incluidas.
- Sustitución de GPU en entornos de bajo consumo: ejecutar un asistente conversacional de 7B en una NPU Tensix cuando no se dispone de GPU dedicada.
- Verificación de cuantización: usar `verify_grid.py` y `pack_tensix.py` para comprobar que las matrices BFP4/BFP8 se reconstruyen correctamente antes de desplegar en producción.
- Integración con tt-forge: compilar el modelo con `torch.compile(backend="tt")` para acelerar la inferencia en el dispositivo Tensix.
- Evaluación de calidad de cuantización: comparar la divergencia KL frente a BF16 (0.0470) y frente a Q4_K_M de llama.cpp (0.0369) para decidir si el ahorro de memoria compensa la pérdida de precisión.
- Chat conversacional básico en inglés: usar la plantilla de chat y `generate` para respuestas multi-turno, siempre que el contexto requerido encaje en la ventana del modelo base.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (Qwen/Qwen2.5-7B-Instruct) | 15.23 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atención) | 6.262 | 0.0470 | 90.46 |
| Q4_K_M (llama.cpp) | 4.683 | 0.0369 | 91.25 |

La KL y el top-1 cubren 16 (el texto de la model card queda truncado en ese punto; no se especifica la métrica completa). La divergencia KL de este modelo es 1.27 veces la de Q4_K_M de llama.cpp, con un tamaño mayor (6.262 GB frente a 4.683 GB).

## Requisitos de hardware

- VRAM/memoria: 6.262 GB de pesos empaquetados para Tensix; en transformers con `dtype="bfloat16"` el consumo es mayor, ya que los tensores se cargan en bf16.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Simulación: `ttsim`, el simulador de Blackhole, verificado con ttnn 0.81.1.
- GPU consumer: no disponible en la información proporcionada; el modelo está pensado para Tensix, aunque puede cargarse en transformers con `device_map="auto"`.
- Despliegue: tt-metal v0.81.1 con tt-transformers (`--use_hf_rope`), tt-forge con `torch.compile(backend="tt")`, pjrt-plugin-tt 1.4.0, y transformers estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Licencia | Hardware objetivo |
|---|---|---:|---|---|---|
| Este modelo (BFP4/BFP8) | 7.615.616.512 | 6.262 GB | no disponible | apache-2.0 | Tenstorrent Tensix |
| Qwen2.5-7B-Instruct BF16 | 7.615.616.512 | 15.23 GB | no disponible | apache-2.0 | GPU/CPU |
| Qwen2.5-7B-Instruct Q4_K_M (llama.cpp) | 7.615.616.512 | 4.683 GB | no disponible | apache-2.0 | CPU/GPU |

Las tres variantes comparten arquitectura y parámetros; difieren en formato de cuantización, tamaño y calidad (KL y top-1 en la tabla de benchmarks). No se dispone de datos de contexto ni de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 en el MLP introduce una pérdida de calidad medible: KL media de 0.0470 frente a BF16 y top-1 del 90.46 %, inferior al 91.25 % de Q4_K_M de llama.cpp.
- El modelo está optimizado para Tensix; fuera de ese hardware pierde su ventaja principal y se comporta como una cuantización de bloque flotante poco convencional en GPU.
- La model card solo declara inglés como idioma soportado, aunque el modelo base Qwen2.5 es multilingüe; no se garantiza el rendimiento en otros idiomas.
- Riesgo de alucinación inherente a un modelo de 7B; no se han publicado evaluaciones específicas de sesgos para esta cuantización.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen2.5-7B-Instruct.
- El texto de evaluación de la model card está truncado ("cover 16"), por lo que no se conoce el conjunto exacto de evaluación.
- No se dispone de información sobre tool calling, agentes ni modo thinking para esta variante concreta.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-7B-Instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
