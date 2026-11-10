# ununununununununununununununununununun/llama-3.1-8b-instruct-phi-lattice-v2

## Resumen

`llama-3.1-8b-instruct-phi-lattice-v2` es una distribucion cuantizada a 4 bits del modelo `RedHatAI/Llama-3.1-8B-Instruct` (a su vez una redistribucion BF16 de `meta-llama/Llama-3.1-8B-Instruct`), publicada por el usuario `ununununununununununununununununununun`. El pack aplica un esquema propietario de cuantizacion denominado `phi-lattice v2`, que almacena los pesos lineales como nibbles `uint8` de 4 bits reales junto con escalas de grupo en fp16 y un codebook embebido en el propio archivo para desempaquetar los indices.

El objetivo del artefacto es reducir el espacio en disco y la memoria residente de un modelo de 8.030 millones de parametros sin recurrir a formatos estandar como GGUF o AWQ, manteniendo las tablas de tokens (`embed_tokens` y `lm_head`) y las capas de normalizacion en BF16. El archivo empaquetado ocupa 5.540,7 MiB frente a los 14,96 GiB del checkpoint BF16 original, una reduccion de 2,76x en disco y en memoria residente.

El modelo base es un transformer decoder-only de 32 capas con 8.030 millones de parametros y ventana de contexto de 128.000 tokens (caracteristica de la familia Llama 3.1), orientado a generacion de texto conversacional e instrucciones. La relevancia de esta publicacion es fundamentalmente tecnica: documenta con detalle el formato de empaquetado, el SQNR de los pesos (19,34 dB) y proporciona scripts de carga y evaluacion, aunque no incluye resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), 32 capas |
| Parametros totales | 8.030 millones (8,03B); 6.979.321.856 pesos en 224 capas lineales cuantizadas |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | 4 bits propietaria `phi-lattice v2` (nibbles `uint8` + escalas de grupo fp16 + codebook embebido); modos de carga `low_vram_4bit`, `triton_4bit`, `unrolled_bf16` |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | `.pt` (archivo PyTorch empaquetado `llama31_8b_instruct_phi_v2_packed_4bit.pt`, 5.540,7 MiB) + scripts Python de carga (`phi_loader.py`, `phi_lut_gemm.py`) |

## Arquitectura y entrenamiento

El modelo subyacente es el transformer decoder-only denso de Llama 3.1 con 8.030 millones de parametros y 32 capas, redistribuido en BF16 por Red Hat AI. Esta publicacion no entrena ni afina el modelo: aplica una cuantizacion post-entrenamiento sobre los pesos lineales. De las 291 tensores almacenados, 224 corresponden a capas lineales cuantizadas a 4 bits y el resto (tablas de tokens `embed_tokens` y `lm_head`, mas las capas de normalizacion) se mantienen en BF16. `tie_word_embeddings` es falso, por lo que ambas tablas de tokens se almacenan por separado.

El esquema `phi-lattice v2` empaqueta cada peso como un nibble de 4 bits indexado contra un codebook almacenado dentro del propio archivo, con escalas de grupo en fp16 y `exponent_span=4.5`, un unico ajuste al codebook mas cercano y sin pasos de cristalizacion. El resultado son 3.535,9 MiB para las 224 capas lineales y 2.004,8 MiB para las tablas de tokens y normas en BF16. El SQNR de los pesos frente a los tensores originales es de 19,34 dB y el 12,35% de los indices empaquetados (861.824.004) son ceros exactos. Cada capa cuantizada cumple `K % 64 == 0`. El autor indica que no se ha ejecutado la pasada de cristalizacion (comparativa v1 frente a v2 con perplejidad) para este modelo concreto, y que en otros modelos esa pasada mejoro el SQNR de forma variable.

## Capacidades

- Generacion de texto conversacional e instrucciones, heredadas del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat, con plantilla de tokenizador de Llama 3.1.
- Generacion de codigo y matematicas (capacidades del modelo base; no se aportan metricas propias en esta publicacion).
- Soporte de tool calling / function calling heredado del modelo base Instruct.
- Capacidades multilingues del modelo base (los idiomas concretos no se detallan en la informacion disponible).
- Inferencia con kernel Triton fusionado LUT-GEMM (`triton_4bit`) o dequantizacion en PyTorch dentro de cada capa lineal (`low_vram_4bit`).
- Modo `unrolled_bf16` para desempaquetar los 291 tensores a lineales BF16 y ejecutar con el stack estandar de transformers.

## Casos de uso

- Despliegue con VRAM limitada: el pack residente ocupa 5.540,7 MiB, lo que permite servir el modelo en GPUs de 8 GB o 12 GB donde el checkpoint BF16 (14,96 GiB) no cabe, usando `mode="low_vram_4bit"`.
- Prototipado e investigacion de cuantizacion: el repositorio incluye `phi_loader.py` y `phi_lut_gemm.py`, lo que permite reproducir la carga, medir SQNR y comparar modos de ejecucion en experimentos academicos.
- Evaluacion comparativa de precision: `run_text_evals.py` ejecuta MMLU, GSM8K, IFEval y HellaSwag tarea a tarea contra `llama31-instruct-base` (BF16) y `llama31-instruct-v2` (este pack), facilitando el analisis de degradacion por cuantizacion.
- Asistente conversacional autoalojado: al ser un Instruct de 8B con contexto largo del modelo base, sirve para chatbots multi-turno en entornos con recursos moderados.
- Generacion de codigo en pipelines locales: el modelo base soporta instrucciones de programacion y tool calling, y el pack reduce el coste de memoria para ejecutarlo en estaciones de trabajo con una sola GPU.
- Benchmarking de kernels Triton: el modo `triton_4bit` permite medir el rendimiento del LUT-GEMM fusionado frente a la dequantizacion en PyTorch en distintas GPUs CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el script `run_text_evals.py` para ejecutar MMLU, GSM8K, IFEval y HellaSwag, pero la model card no reporta cifras obtenidas. El unico dato de calidad numerico publicado es el SQNR de pesos de 19,34 dB frente a los tensores BF16 originales.

## Requisitos de hardware

- VRAM estimada: 5.540,7 MiB residentes en los modos `low_vram_4bit` y `triton_4bit` (incluye tablas de tokens y normas en BF16). El modo `unrolled_bf16` requiere aproximadamente 14,96 GiB, equivalente al checkpoint BF16.
- GPU recomendadas: cualquier GPU CUDA con al menos 6-8 GB de VRAM para los modos de 4 bits; el modo `triton_4bit` requiere CUDA y compilacion Triton.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti 8 GB, RTX 4070, RTX 4080, RTX 4090) en modos de 4 bits.
- Opciones de despliegue: carga mediante `phi_loader.py` con transformers; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llama-3.1-8b-instruct-phi-lattice-v2` (este) | 8,03B | no disponible (base: 128k) | `.pt` empaquetado 4 bits, 5.540,7 MiB | llama3.1 | Hugging Face, 0 descargas |
| `RedHatAI/Llama-3.1-8B-Instruct` (base BF16) | 8,03B | 128k | safetensors BF16, 14,96 GiB | llama3.1 | Hugging Face (modelo base) |
| `meta-llama/Llama-3.1-8B-Instruct` (original) | 8,03B | 128k | safetensors BF16 | llama3.1 | Hugging Face (repositorio oficial) |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits con SQNR de 19,34 dB implica una perdida de fidelidad de pesos respecto al BF16; no se han publicado evaluaciones de perplejidad ni de benchmarks que cuantifiquen la degradacion real en tareas.
- El autor indica que no se ha ejecutado la pasada de cristalizacion (v1 frente a v2 con perplejidad) para este modelo, por lo que no se reclama ninguna mejora de calidad sobre la version anterior.
- El formato es propietario y no estandar: requiere los scripts `phi_loader.py` y `phi_lut_gemm.py` del repositorio, lo que limita la compatibilidad con herramientas de inferencia habituales (vLLM, llama.cpp, Ollama, TGI).
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones idiomaticas especificas; estos riesgos son los heredados del modelo base Llama 3.1 8B Instruct.
- La licencia `llama3.1` impone las condiciones de uso de Meta para Llama 3.1, incluida la politica de uso aceptable y los requisitos de atribucion para uso comercial.
- El autor senala que el pack se construyo desde la copia de Red Hat AI porque su solicitud de acceso al repositorio oficial de Meta fue rechazada; conviene verificar la trazabilidad del checkpoint base.
- No se detallan los idiomas soportados ni el contexto efectivo del pack; deben asumirse los del modelo base con las cautelas habituales.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/llama-3.1-8b-instruct-phi-lattice-v2
- Modelo base (Red Hat AI): https://huggingface.co/RedHatAI/Llama-3.1-8B-Instruct
- Modelo original: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
