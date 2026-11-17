# zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF

## Resumen

Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF es una cuantización GGUF de 3 bits del modelo ornith-ai/Ornith-1.5-122B, publicada por el usuario zephel01. El objetivo del artefacto es permitir la ejecución de un modelo de mezcla de expertos (MoE) de 124.635.206.144 parámetros totales en un equipo de consumo con 16 GB de VRAM y 64 GB de RAM, manteniendo el modelo completo en memoria (GPU más RAM) para evitar lecturas de disco durante la generación.

El modelo base pertenece a la familia Qwen3.5-MoE (etiqueta qwen35moe) y se distribuye bajo licencia MIT. La cuantización utiliza una matriz de importancia (imatrix) construida con texto técnico y código en inglés y japonés, y aplica una receta mixta: los expertos enrutados se cuantizan a IQ3_XXS (97 % de los bytes) y Q4_K (3 %), mientras que la atención, las proyecciones delta-net y los expertos compartidos se mantienen en Q8_0 para reducir la pérdida de calidad que introduce una cuantización estándar de 3 bits.

La relevancia del repositorio es práctica: ofrece un archivo de 51,7 GB en dos shards que cabe en el presupuesto de memoria de una GPU de 16 GB más 64 GB de RAM del sistema, con un rendimiento medido de 42,6 tok/s en una Radeon AI PRO R9700 limitada a 16 GB de VRAM y un tier de 46 GB de RAM. Incluye además el bloque NextN (MTP) preservado en Q4_K para motores que hacen decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo qwen35moe, con atención, proyecciones delta-net y expertos compartidos; incluye bloque NextN (MTP) para decodificación especulativa |
| Parametros totales | 124.635.206.144 (124,6 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de ejemplo de llama.cpp con `-c 32768`); máximo del modelo base no disponible |
| Tipos de cuantizacion | IQ3_XXS (expertos enrutados, 97 % de bytes), Q4_K (3 % de expertos y bloque NextN), Q8_0 (atención, delta-net, expertos compartidos), IQ3_S (token_embd); media de 3,09 bits por peso (3,32 bits/peso en el archivo) |
| Idiomas soportados | Inglés y japonés (según la model card y la composición de la imatrix) |
| Licencia | MIT |
| Formato de pesos | GGUF (dos shards: `-00001-of-00002.gguf` de 29,8 GB y `-00002-of-00002.gguf` de 21,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con arquitectura etiquetada como qwen35moe. La model card del repositorio de cuantización no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo base ornith-ai/Ornith-1.5-122B, que no está incluida en la información proporcionada. Sí se documenta que la cuantización incluye un bloque NextN (MTP) en `blk.48`, mantenido en Q4_K para motores que lo usan como drafter en decodificación especulativa.

La innovación técnica del artefacto es la receta de cuantización: los expertos enrutados se cuantizan con una imatrix construida sobre texto técnico y código en inglés y japonés, mientras que atención, proyecciones delta-net y expertos compartidos se mantienen en Q8_0. Según el autor, la mayor parte de la pérdida de un IQ3_XXS estándar provenía de esas partes, y con esta mezcla se obtiene un KL medio de 0,138 frente a 0,285 del IQ3_XXS estándar con la misma imatrix, con solo 2,9 GB más de tamaño. El archivo incluye además un `imatrix-ornith122b.gguf` opcional (0,36 GB) para recuantizar.

## Capacidades

- Generación de texto conversacional en inglés y japonés, con el tokenizador y el formato del modelo base Qwen3.5-MoE.
- Razonamiento y resolución de tareas de código: la model card reporta 56/60 tareas resueltas en un benchmark estilo llmbench (repositorios pequeños con bug report o feature request y tests ocultos).
- Decodificación especulativa mediante el bloque NextN (MTP) preservado en Q4_K, soportada por motores como Abyss.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`) a través de Abyss.
- Ejecución con llama.cpp usando `--cpu-moe` (todos los expertos en CPU) o `--n-cpu-moe` con un número de capas para colocar parte de los expertos en GPU.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local: el modelo resuelve tareas de reparación y desarrollo sobre repositorios pequeños, como demuestra el resultado de 56/60 en el benchmark estilo llmbench, y puede integrarse en un flujo de trabajo con tests ocultos para validar parches.
- Servidor de chat privado en una estación de trabajo: con 16 GB de VRAM y 64 GB de RAM, el modelo completo permanece en memoria y se sirve una API compatible con OpenAI en `http://127.0.0.1:8082/`, adecuada para entornos sin conexión o con requisitos de confidencialidad.
- Atención al cliente en inglés y japonés: el soporte bilingüe y la ventana de 32.768 tokens permiten conversaciones multi-turno con contexto largo en ambos idiomas.
- Procesamiento de documentación técnica: la imatrix se construyó con texto técnico y código en inglés y japonés, lo que hace al archivo adecuado para resumir, extraer y transformar documentación de ingeniería en esos idiomas.
- Evaluación de cuantizaciones en investigación: el repositorio publica métricas KL, PPL y coincidencia de top token frente a BF16, lo que permite reproducir y comparar recetas de cuantización de 3 bits en hardware de consumo.
- Prototipado con decodificación especulativa: el bloque NextN en Q4_K permite probar drafters MTP en Abyss v1.3.57 o superior sobre un modelo de 124,6 B de parámetros en hardware modesto.
- Despliegue en equipos con GPU de consumo: la variante está pensada para PCs con 16 GB de VRAM y 64 GB de RAM, con un tier de RAM de aproximadamente 46 GB (`STRATA_GLM_RAM_GB`).

## Benchmarks y rendimiento

Calidad frente a BF16, medida con `llama-perplexity --kl-divergence` sobre 8 fragmentos de 1024 tokens de texto inglés y japonés no usado en la imatrix (PPL de BF16: 14,44):

| Archivo | Tamano | KL medio | KL 99% | Mismo top token | PPL |
|---|---:|---:|---:|---:|---:|
| unsloth UD-Q4_K_XL | 80 GB | 0,039 | 0,32 | 89,5% | 14,37 |
| IQ3_XXS estándar + misma imatrix | 48,8 GB | 0,285 | 1,86 | 74,2% | 16,22 |
| **este archivo (IQ3_XXS-B)** | **51,7 GB** | **0,138** | **1,09** | **81,3%** | **14,88** |
| IQ3_XXS-B + `ffn_down` de expertos en IQ4_XS (no publicado) | 57,4 GB | 0,111 | 0,87 | 82,0% | 14,75 |

Tareas de código (estilo llmbench, una ejecución por tarea, temperatura 0,6 / top_p 0,95 / top_k 20, servidor Abyss):

| Configuración | Resultado |
|---|---:|
| Este archivo (16 GB GPU + 64 GB RAM) | 56/60 (93,3 %) |
| UD-Q4_K_XL (32 GB GPU + tier de 60 GB RAM + iGPU) | no disponible (la tabla de la model card queda truncada) |

Rendimiento de generación: 42,6 tok/s medidos en una Radeon AI PRO R9700 limitada a 16 GB de VRAM con un tier de 46 GB de RAM dentro de un límite de 64 GB; no medido en una tarjeta real de 16 GB.

## Requisitos de hardware

- VRAM estimada: 16 GB de VRAM más aproximadamente 46 GB de RAM del sistema (tier de 46 GB dentro de un límite de 64 GB), suficiente para mantener el modelo completo en memoria.
- GPU recomendadas: Radeon AI PRO R9700 (medición oficial, limitada a 16 GB); cualquier GPU con 16 GB de VRAM. No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB acompañadas de 64 GB de RAM. La variante IQ4_XS-24G64G requiere 24-32 GB de VRAM y 64 GB de RAM; las variantes de 397B requieren leer del SSD en el tier de 16 GB (unas 5 veces más lentas).
- Opciones de despliegue: Abyss v1.3.57 o superior (recomendado; las versiones 1.3.56 y anteriores dejaban el drafter NextN desactivado silenciosamente con este archivo) y llama.cpp con `--cpu-moe` o `--n-cpu-moe`. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: 42,6 tok/s en la configuración medida; el resto de métricas de latencia no están disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KL medio vs BF16) | Tamano | Licencia |
|---|---|---:|---:|---:|---|
| Este archivo (Ornith-1.5-122B IQ3_XXS-B) | 124,6 B | 32.768 (uso documentado) | 0,138 | 51,7 GB | MIT |
| Ornith-1.5-122B IQ4_XS-24G64G (mismo autor) | 124,6 B | no disponible | no disponible | 68,9 GB | MIT |
| Ornith-1.5-397B IQ2_XXS-16G64G (mismo autor) | 397 B (aproximado por nombre) | no disponible | no disponible | 110,6 GB | MIT |
| unsloth UD-Q4_K_XL (referencia de calidad) | 124,6 B | no disponible | 0,039 | 80 GB | no disponible |

## Limitaciones y advertencias

- Es un archivo con pérdida de 3 bits: su KL medio es aproximadamente 3,5 veces el de UD-Q4_K_XL; si el equipo dispone de 80 GB entre GPU y RAM, el autor recomienda UD-Q4_K_XL.
- El rendimiento de 42,6 tok/s se midió en una R9700 limitada a 16 GB, no en una GPU real de 16 GB; el autor advierte que 16G64G es un objetivo de configuración, no una garantía de velocidad.
- Requiere Abyss v1.3.57 o superior: las versiones 1.3.56 y anteriores desactivaban silenciosamente el drafter NextN con este archivo (llama.cpp no se ve afectado).
- El archivo está dividido en dos shards por el límite de 50 GB por fichero del Hub; hay que apuntar el motor al primero de ellos.
- El nombre del repositorio (IQ3_XXS) es la etiqueta del tipo de llama.cpp más cercano a la media de bits de los expertos, pero el archivo mezcla varios tipos y no es una cuantización estándar de ese nombre.
- Idiomas limitados a inglés y japonés según la model card; el rendimiento en castellano no está documentado.
- No se dispone de información sobre sesgos, riesgo de alucinación específico, parámetros activos ni composición del dataset de entrenamiento en la información proporcionada.
- La licencia MIT del artefacto se hereda del modelo base; conviene verificar los términos del modelo base ornith-ai/Ornith-1.5-122B antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Motor Abyss: https://github.com/zephel01/Abyss
- Versión IQ4_XS-24G64G: https://huggingface.co/zephel01/Ornith-1.5-122B-IQ4_XS-24G64G-GGUF
- Versión 397B IQ2_XXS-16G64G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-16G64G-GGUF
- Versión 397B IQ2_XXS-32G128G: https://huggingface.co/zephel01/Ornith-1.5-397B-IQ2_XXS-32G128G-GGUF
- Repositorio de benchmark llmbench: https://github.com/zephel01/swe-bench
- Informe de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Ornith-1.5-122B+16G64G
