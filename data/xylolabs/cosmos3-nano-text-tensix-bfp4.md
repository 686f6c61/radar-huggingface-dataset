# Xylolabs/Cosmos3-Nano-Text-Tensix-BFP4

## Resumen

Cosmos3-Nano-Text-Tensix-BFP4 es una exportación cuantizada del modelo base nvidia/Cosmos3-Nano, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). Lo desarrolla Xylolabs, un estudio centrado en la cuantización de pesos en formatos de coma flotante por bloques (block floating point, BFP) para hardware de inferencia alternativo a las GPU tradicionales. El modelo resuelve el problema de desplegar un LLM de aproximadamente 8.190 millones de parámetros en NPUs Tensix, que no soportan de forma nativa los formatos de cuantización habituales de GPU (GPTQ, AWQ en enteros de 4 bits), sino formatos BFP propietarios como bfloat4_b y bfloat8_b.

La exportación conserva únicamente la torre de texto del modelo original: se eliminan el codificador de visión, el VAE de vídeo y el tokenizador de audio presentes en Cosmos3-Nano. El resultado es un checkpoint de pesos en safetensors con las capas de atención y MLP cuantizadas a bfloat4_b (6,397 GB empaquetados) y el resto de tensores en bf16. La relevancia actual radica en que permite ejecutar un modelo de casi 8B en hardware Tensix con una degradación de calidad medida (KL medio de 0,03028 frente a BF16 sobre 16.272 posiciones de texto en inglés y coreano), y con una huella de memoria notablemente inferior a la del checkpoint BF16 original (16,38 GB).

El modelo hereda la licencia OpenMDW-1.1 del modelo base y se distribuye con el código de cuantización tensix-bfp-gptq, además de instrucciones de ejecución mediante transformers, tt-metal, tt-transformers y tt-forge. La fecha de creación del repositorio es noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto; se excluyen visión, VAE de vídeo y tokenizador de audio) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bfloat4_b (BFP4) en atención y MLP; bfloat8_b (BFP8) en atención y MLP; resto en bf16. Referencia Q4_K_M para llama.cpp |
| Idiomas soportados | no disponible (la evaluación KL cubre inglés y coreano) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (con índice `model.safetensors.index.json`), carpetas `text-bfp4/` y `text-bfp8/` |

## Arquitectura y entrenamiento

El modelo base nvidia/Cosmos3-Nano es un transformer de aproximadamente 8.190 millones de parámetros. Esta exportación no reentrena el modelo: aplica una cuantización post-entrenamiento en formato block floating point (BFP), implementada en el repositorio tensix-bfp-gptq de Xylolabs. Las capas de atención y MLP se convierten a bfloat4_b o bfloat8_b, mientras que el resto de tensores permanece en bf16. El empaquetado se realiza para el diseño de tiles y la configuración de memoria DRAM de los NPUs Tensix, con un script `pack_tensix.py` y un verificador `verify_grid.py` que permiten comprobar el round-trip de los valores empaquetados.

La evaluación de la degradación se mide como divergencia KL media frente al checkpoint BF16, sobre 16.272 posiciones de texto en inglés (WikiText-2 test) y coreano (Wikipedia en coreano), tanto en texto plano como aplicando la plantilla de chat. El límite aceptado es 1,5 veces la KL de referencia de una cuantización Q4_K_M de llama.cpp (0,03370). La variante BFP4 obtiene 0,03028 y la BFP8 0,00078, ambas por debajo de ese umbral. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones de decodificación.

## Capacidades

- Generación de texto autoregresiva en la torre de texto del modelo Cosmos3-Nano.
- Ejecución sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante tt-metal, tt-transformers y tt-forge.
- Compatibilidad con la API estándar de transformers (`AutoModelForCausalLM`, `AutoTokenizer`) con `dtype="bfloat16"` y `device_map="auto"`.
- Aplicación de plantilla de chat mediante `apply_chat_template` para diálogo multi-turno.
- Cuantización selectiva por capa: atención y MLP en BFP4/BFP8, resto en bf16, con configuración de precisión por operador (`precision_cfg`, `fidelity_cfg`) en tt-transformers.
- Soporte de caché KV en bf8 según la configuración de ejemplo de tt-transformers.
- Capacidades de visión, vídeo y audio del modelo base no están incluidas en esta exportación.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un LLM de 8B en infraestructura Tenstorrent: el checkpoint BFP4 (6,397 GB) permite cargar el modelo en NPUs Wormhole o Blackhole con menor presión de memoria que el BF16 (16,38 GB), usando tt-metal v0.81.1 y `--use_hf_rope`.
- Servicio de generación de texto en entornos con NPUs dedicadas: mediante tt-forge y el plugin PJRT (`pjrt-plugin-tt==1.4.0`) se puede compilar el modelo con `torch.compile(backend="tt")` y ejecutar inferencia con la API de PyTorch/XLA.
- Evaluación de calidad de cuantización: el repo incluye métricas KL frente a BF16 y frente a Q4_K_M, útil para equipos que comparan formatos BFP frente a cuantizaciones de GPU antes de fijar un formato en producción.
- Integración en pipelines basados en transformers: al conservar la interfaz estándar, se puede usar en scripts existentes de evaluación o generación con `AutoModelForCausalLM` sin reescribir el código de carga.
- Investigación en hardware alternativo: sirve como referencia para estudiar el impacto de BFP4/BFP8 en la calidad de un transformer de 8B sobre aceleradores Tensix, con verificadores de empaquetado incluidos.
- Prototipado de asistentes conversacionales: la plantilla de chat y la evaluación en texto plano y chat permiten desplegar diálogos multi-turno en inglés y coreano, los idiomas cubiertos por la evaluación KL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica publicada es la divergencia KL media frente a BF16:

| Formato | Tamaño empaquetado (GB) | KL media a BF16 |
|---|---|---|
| text-bfp4 | 6,397 | 0,03028 |
| text-bfp8 | 9,870 | 0,00078 |
| BF16 (nvidia/Cosmos3-Nano) | 16,38 | 0 |
| Q4_K_M (llama.cpp) | 5,028 | 0,03370 |

La KL se calcula sobre 16.272 posiciones de WikiText-2 test y Wikipedia en coreano, en texto plano y con plantilla de chat, con un límite de 1,5 veces la KL de Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,397 GB para la carpeta `text-bfp4/` y 9,870 GB para `text-bfp8/` (tamaños empaquetados); el checkpoint BF16 de referencia ocupa 16,38 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- GPU consumer: no se indica compatibilidad con GPU; el modelo está orientado a Tensix. La ejecución vía transformers con `device_map="auto"` se documenta, pero el formato BFP4/BFP8 está pensado para el empaquetado Tensix.
- Software de despliegue: tt-metal v0.81.1 (con `--use_hf_rope`), tt-transformers, tt-forge con `pjrt-plugin-tt==1.4.0`, y transformers para carga estándar.
- Latencia y throughput: no disponible. El repo incluye un test de rendimiento (`simple_text_demo.py -k "performance and batch-1"`) pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Cosmos3-Nano-Text-Tensix-BFP4 (este) | 8.190.735.360 | no disponible | BFP4/BFP8 + bf16 | openmdw-1.1 | Tenstorrent Tensix |
| nvidia/Cosmos3-Nano (base) | 8.190.735.360 | no disponible | BF16 | openmdw-1.1 | GPU |
| Q4_K_M de llama.cpp (referencia del repo) | 8.190.735.360 (mismo base) | no disponible | Q4_K_M (4 bits entero) | openmdw-1.1 | CPU/GPU vía llama.cpp |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo se incluye la torre de texto: no hay visión, VAE de vídeo ni tokenizador de audio, por lo que no puede usarse para tareas multimodales del modelo base.
- La cuantización BFP4 introduce una divergencia medible (KL 0,03028); para aplicaciones sensibles a la fidelidad conviene usar BFP8 (KL 0,00078) o BF16.
- La evaluación de calidad cubre únicamente inglés y coreano; el rendimiento en otros idiomas no está documentado.
- No se publican datos de sesgos, alucinación ni evaluaciones de seguridad del modelo base ni de la versión cuantizada.
- La licencia OpenMDW-1.1 se hereda del modelo base; el repositorio del modelo base no incluye archivo de licencia, y el archivo `LICENSE` de este repo contiene el acuerdo. Conviene revisar los términos de OpenMDW-1.1 antes de uso comercial.
- El despliegue en Tensix requiere versiones concretas de software (tt-metal v0.81.1, `--use_hf_rope`, `pjrt-plugin-tt==1.4.0`), lo que limita la portabilidad.
- El repositorio unifica BFP4 y BFP8 desde el 27 de noviembre de 2026; las rutas antiguas (`...-BFP4` y `...-BFP8`) pueden quedar obsoletas.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia OpenMDW-1.1 (archivo del repo): https://huggingface.co/Xylolabs/Cosmos3-Nano-Tenstorrent-Tensix/blob/main/LICENSE
