# Xylolabs/Arete-27B-Tensix-BFP4

## Resumen

Arete-27B-Tensix-BFP4 es una cuantización del modelo NousResearch/Arete-27B (a su vez un ajuste supervisado de Qwen/Qwen3.8-27B) realizada por Xylolabs para su ejecución en las NPU Tensix de Tenstorrent, como Wormhole y Blackhole. El modelo conserva la arquitectura original de 27.356 millones de parámetros, pero redondea sus capas lineales al formato de coma flotante por bloques `ttnn.bfloat4_b` (BFP4) mediante GPTQ y su LM head a `ttnn.bfloat8_b` (BFP8) por redondeo al más cercano, de modo que TT-NN puede empaquetar los pesos sin volver a redondear.

La relevancia de este checkpoint es que reduce el peso medio a 5,23 bits por peso y el tamaño empaquetado a 17,60 GB, frente a los 53,79 GB en BF16 del modelo base, manteniendo una calidad cercana al original: una divergencia KL media de 0,02909 respecto a BF16 y un 92,24 % de coincidencia Top-1 en la evaluación reportada por el autor. Es, por tanto, una pieza pensada para desplegar un modelo multimodal de 27B en hardware de Tenstorrent con un consumo de memoria muy inferior.

El modelo conserva la torre visual en bf16 sin tocar y solo se ha cuantizado y evaluado el modelo de lenguaje. La licencia es Apache 2.0. La información disponible sobre idiomas, benchmarks estándar y rendimiento en hardware real es limitada: el autor indica que las pruebas se hicieron en el simulador ttsim de Blackhole con ttnn 0.81.1, no en silicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de Qwen3.8-27B: atención (16 capas) más Gated DeltaNet (48 capas) y MLP (64 capas); multimodal image-text-to-text |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en LM head; bf16 en embeddings, normas y torre visual; media de 5,23 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, con valores ya situados en la rejilla BFP4/BFP8 para empaquetado directo en TT-NN) |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es un ajuste supervisado de Qwen/Qwen3.8-27B. La arquitectura combina 16 capas de atención con 48 capas de Gated DeltaNet y 64 capas MLP, además de una torre visual (`visual`) que se mantiene en bf16. Esta ficha se centra en la cuantización: las capas de atención (q, k, v, o), las proyecciones de Gated DeltaNet (q, k, v, z, a, b, output) y las proyecciones MLP (gate, up, down) se redondearon a `bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. La LM head se redondeó a `bfloat8_b` por redondeo al más cercano.

Los pesos se almacenan en bf16, pero cada valor ya está en la rejilla BFP4 o BFP8, de forma que TT-NN los empaqueta sin redondear de nuevo; el autor incluye `quant4.json` con el formato de cada proyección y scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que ningún valor cambia al empaquetar. No se detalla la composición del dataset de entrenamiento del modelo base ni si hubo RLHF/DPO; esa información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto y conversación: pipeline `text-generation` con plantilla de chat (`apply_chat_template`).
- Procesamiento image-text-to-text: conserva la torre visual en bf16, por lo que mantiene la capacidad multimodal del modelo base.
- Razonamiento y matemáticas: heredadas del modelo base Qwen3.8-27B, aunque no se aportan benchmarks específicos en la información disponible.
- Generación de código: no se documenta explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el calibrado de GPTQ usó texto en inglés (WikiText-2) y coreano, pero no se declaran idiomas soportados.
- Capacidad especial: pesos preformateados para empaquetado exacto en NPU Tensix (BFP4/BFP8) sin pérdida adicional.

## Casos de uso

- Despliegue en NPU Tenstorrent: ejecutar un modelo de 27B en Wormhole o Blackhole con 17,60 GB de pesos empaquetados, aprovechando el soporte nativo de `bfloat4_b` y `bfloat8_b` de TT-NN y el demo `qwen38_27b_qb2` de tt-metal en cuatro chips Blackhole (QuietBox 2).
- Inferencia multimodal en el borde: al conservar la torre visual en bf16 y reducir el modelo de lenguaje a ~5,23 bits por peso, permite tareas de image-text-to-text en hardware con memoria limitada.
- Servicio de chat con plantilla de conversación: usar `AutoTokenizer.apply_chat_template` para conversaciones multi-turno; el contexto máximo no está documentado, por lo que debe validarse antes de producción.
- Investigación en cuantización: servir como referencia reproducible para estudiar el impacto de BFP4 con GPTQ frente a BF16 y Q4_K_M, con métricas de KL y Top-1 ya publicadas.
- Validación de pipelines de empaquetado: emplear `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado en TT-NN no altera los valores, como paso previo a integrar modelos cuantizados en producción.
- Prototipado en simulador: probar el modelo en ttsim (simulador de Blackhole) antes de disponer de hardware, ya que el autor validó así el empaquetado con ttnn 0.81.1.
- Evaluación comparativa de precisión: comparar la calidad del checkpoint cuantizado frente a BF16 y Q4_K_M en tareas propias, usando las métricas de divergencia KL como línea base.

## Benchmarks y rendimiento

Evaluación reportada por el autor (solo modelo de lenguaje):

| Modelo | Bits por peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (NousResearch/Arete-27B) | 16 | 53,79 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP4/BFP8)** | 5,23 | 17,596 | 0,02909 | 92,24 | 40 de 40 | 0 |
| Q4_K_M (llama.cpp) | 4,92 | 16,547 | 0,02036 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 17,60 GB de pesos empaquetados en BFP4/BFP8; el repositorio ocupa 54,7 GB porque los tensores se almacenan en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). El demo `qwen38_27b_qb2` de tt-metal v0.81.1 requiere cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware.
- GPU consumer: no se documenta soporte ni requisitos para GPU; el checkpoint está pensado para Tensix.
- Despliegue: TT-NN (ttnn 0.81.1, probado en el simulador ttsim), tt-metal (demo `qwen38_27b_qb2`), tt-forge/tt-xla (no probado aún con este checkpoint) y transformers para carga en bf16.
- Latencia y throughput: no disponibles; no se han ejecutado pruebas en hardware real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits por peso | Tamaño (GB) | KL media a BF16 | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|
| Arete-27B-Tensix-BFP4 | 27,36B | no disponible | 5,23 | 17,596 | 0,02909 | Apache 2.0 | Hugging Face |
| NousResearch/Arete-27B (BF16) | 27,36B | no disponible | 16 | 53,79 | 0 | Apache 2.0 | Hugging Face |
| Arete-27B Q4_K_M (llama.cpp) | 27,36B | no disponible | 4,92 | 16,547 | 0,02036 | Apache 2.0 | derivado del base |

La comparación con otros modelos de la misma categoría (por ejemplo, Qwen3.8-27B en otras cuantizaciones) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual se mantiene en bf16 y no se ha validado su comportamiento tras el proceso.
- Las pruebas de empaquetado se hicieron en el simulador ttsim, no en hardware Tensix real; el demo de tt-metal no se ejecutó con este checkpoint.
- tt-transformers no soporta esta arquitectura; el demo de tt-metal exige cuatro chips Blackhole y rechaza otro hardware.
- El demo distribuido usa `config/precision.json`, que volvería a redondear la head a bfloat4_b; es necesario fijar `QWEN_PRECISION_CONFIG=baseline` para que coincida con este checkpoint.
- tt-forge (tt-xla) no se ha probado con este checkpoint.
- El calibrado de GPTQ usó WikiText-2 y Wikipedia en coreano; no se declaran idiomas soportados ni se evalúa el rendimiento multilingüe.
- No hay benchmarks estándar publicados; la evaluación se limita a KL media, Top-1 y 40 preguntas, lo que es una muestra reducida.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse antes de un uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de calibrado.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Arete-27B-Tensix-BFP4
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo base del que deriva Arete: https://huggingface.co/Qwen/Qwen3.8-27B
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal qwen38_27b_qb2: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Arete-27B-Tensix-BFP4/blob/main/LICENSE
