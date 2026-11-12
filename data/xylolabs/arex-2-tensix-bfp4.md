# Xylolabs/AREX-2-Tensix-BFP4

## Resumen

AREX-2-Tensix-BFP4 es una cuantización del modelo BAAI/AREX-2, un fine-tune orientado a agentes desarrollado por el Beijing Academy of Artificial Intelligence (BAAI) sobre Qwen/Qwen3.8-27B. La versión publicada por Xylolabs adapta los pesos para su ejecución en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole), aplicando cuantización de bloque en coma flotante (block floating point, BFP) a las capas lineales del modelo de lenguaje. El resultado es un checkpoint de 27.356.728.560 parámetros con los pesos almacenados en bf16 pero ya alineados a la rejilla BFP4, de modo que TT-NN los empaqueta directamente sin recuantizar.

El modelo conserva la arquitectura híbrida del original: 16 capas de atención clásica y 48 capas de Gated DeltaNet, más 64 capas MLP, con un cabezal de lenguaje cuantizado a BFP8 y el codificador visual intacto en bf16. La motivación es doble: por un lado, reducir el peso en disco de 53,79 GB a 17,60 GB (5,23 bits por peso de media); por otro, ofrecer un artefacto listo para desplegar en hardware Tensix, un ecosistema con escaso soporte de modelos de gran tamaño.

La relevancia actual radica en que es una de las pocas cuantizaciones publicadas específicamente para NPU de Tenstorrent en lugar de GPU, y en que mantiene la licencia Apache 2.0 del modelo base, lo que facilita su uso comercial. No obstante, la evaluación publicada es limitada y la ejecución en hardware real no está verificada por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas de atención + 48 capas Gated DeltaNet + 64 capas MLP; codificador visual incluido |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en proyecciones lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en LM head; bf16 en embeddings, normas, visual y resto de tensores; media de 5,23 bits/peso |
| Idiomas soportados | no disponible (la calibración usó WikiText-2 en inglés y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a la rejilla BFP4/BFP8); repo de 54,7 GB, 17,60 GB empaquetados |

## Arquitectura y entrenamiento

El modelo base AREX-2 es un fine-tune de Qwen3.8-27B orientado a tareas de agente. La arquitectura combina atención estándar en 16 capas con Gated DeltaNet en 48 capas, un diseño híbrido que busca reducir el coste computacional de la atención en contextos largos manteniendo la capacidad de modelado. Incluye además un codificador visual (`visual`) que habilita la modalidad image-text-to-text declarada en el pipeline. Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y el uso de RLHF o DPO no están disponibles en la información proporcionada.

La innovación de esta versión es el proceso de cuantización: las proyecciones lineales (q, k, v, o de atención; q, k, v, z, a, b y output de Gated DeltaNet; gate, up y down del MLP) se cuantizaron a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El LM head se cuantizó a `bfloat8_b` con redondeo al más cercano. El autor indica que los valores también empaquetan exactamente en `bfloat8_b`, lo que permite una variante de mayor precisión sin recuantizar. La verificación se realizó con ttnn 0.81.1 sobre ttsim (simulador Blackhole), no sobre hardware físico.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredadas de Qwen3.8-27B.
- Procesamiento de imagen y texto (`image-text-to-text`), con el codificador visual en bf16 sin cuantizar.
- Capacidades de agente y razonamiento multi-paso, dado que AREX-2 es un fine-tune orientado a agentes.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Capacidad multilingüe: el modelo base es multilingüe, aunque no se detalla la lista de idiomas y la cuantización se calibró en inglés y coreano.
- Tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent: el caso principal. El checkpoint está empaquetado para `ttnn.bfloat4_b` y puede cargarse en Wormhole o Blackhole mediante el demo `qwen38_27b_qb2` de tt-metal, en paralelismo tensorial sobre cuatro chips Blackhole (QuietBox 2).
- Inferencia de agentes en entornos con restricciones de memoria: con 17,60 GB empaquetados frente a 53,79 GB en bf16, permite alojar un modelo de 27B en nodos con DRAM limitada, manteniendo el pipeline image-text-to-text.
- Asistentes conversacionales multi-turno: la plantilla de chat y la arquitectura híbrida con Gated DeltaNet están pensadas para conversaciones con historial; útil en atención al cliente o asistentes internos.
- Procesamiento de documentos con imagen y texto: al conservar el codificador visual en bf16, puede emplearse en tareas de extracción y descripción de contenido visual combinado con texto.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de BFP4 frente a Q4_K_M en tareas de razonamiento, gracias a las métricas de KL y top-1 publicadas.
- Investigación en cuantización de bloque: el repositorio incluye `quant4.json`, `pack_tensix.py` y `verify_grid.py`, útiles para estudiar el impacto de BFP4 con GPTQ en modelos híbridos.
- Prototipado en simulador: el flujo con ttsim permite validar pipelines antes de disponer de hardware Blackhole físico.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (BAAI/AREX-2) | 16 | 53,79 | 0 | 100 | 38 de 40 | - |
| **AREX-2-Tensix-BFP4** | 5,23 | 17,596 | 0,03640 | 91,55 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,547 | 0,02480 | 92,68 | 38 de 40 | 0 |

Las métricas de KL y top-1 se calcularon sobre 16.240 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 17,60 GB para los pesos empaquetados en BFP4/BFP8; el repo completo en disco ocupa 54,7 GB.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, con ttnn 0.81.1 o superior.
- El demo `qwen38_27b_qb2` de tt-metal requiere cuatro chips Blackhole (QuietBox 2) en paralelo tensorial y rechaza otro hardware.
- No se ha verificado en GPU convencional; la carga con `transformers` en bf16 requeriría aproximadamente 55 GB de memoria, viable en A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo solo si se aplica una cuantización adicional (por ejemplo, GGUF Q4_K_M, 16,547 GB), pero esa ruta no es la del checkpoint.
- Opciones de despliegue: tt-metal (demo oficial), ttnn para empaquetado, transformers para carga en bf16. vLLM, llama.cpp, Ollama y TGI no están soportados de forma nativa para este formato.
- tt-forge (tt-xla) no se ha probado con este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| AREX-2-Tensix-BFP4 | 27,36 B | no disponible | BFP4 + BFP8 (GPTQ) | 17,60 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| BAAI/AREX-2 (BF16) | 27,36 B | no disponible | ninguna | 53,79 GB | Apache 2.0 | GPU |
| AREX-2 Q4_K_M (llama.cpp) | 27,36 B | no disponible | Q4_K_M | 16,55 GB | Apache 2.0 | CPU/GPU (llama.cpp) |
| Qwen3.8-27B (base) | ~27 B | no disponible | múltiples | variable | no disponible | GPU |

## Limitaciones y advertencias

- La evaluación publicada es reducida: 40 preguntas y 16.240 posiciones de texto; no sustituye a una batería de benchmarks estándar.
- Solo se cuantizó y evaluó el modelo de lenguaje; el codificador visual no se ha evaluado tras la conversión.
- El autor no ha probado el checkpoint en hardware Tensix real, solo en el simulador ttsim; el demo de tt-metal solo empaquetó correctamente las capas 0 y 3, y el cabezal y una ejecución completa no se verificaron.
- La calibración de GPTQ se limitó a WikiText-2 y Wikipedia en coreano, lo que puede sesgar la preservación de precisión hacia esos dominios e idiomas.
- El KL medio (0,03640) es superior al de Q4_K_M (0,02480) y el top-1 es inferior (91,55 % frente a 92,68 %), aunque el modelo acierta más respuestas en el conjunto de 40 preguntas.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de factualidad.
- Sesgos: no documentados en la información proporcionada; hereda los del modelo base y los de los datos de calibración.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base BAAI/AREX-2 y de Qwen3.8-27B.
- El formato BFP4 es específico de TT-NN; fuera de Tensix requiere conversión y no es portable directamente a otras pilas de inferencia.
- Longitud de contexto no especificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/AREX-2-Tensix-BFP4
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2609.38288 (no verificado en la información proporcionada)
