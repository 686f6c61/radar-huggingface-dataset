# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-MambaOut8

## Resumen

Este repositorio contiene una cuantización del modelo NVIDIA Nemotron-3 Nano 30B-A3B, un transformer híbrido con mezcla de expertos (MoE) desarrollado por NVIDIA, adaptada por Xylolabs para su ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base combina capas de atención con capas Mamba-2, sumando 31.577 millones de parámetros totales con aproximadamente 3.000 millones activos por token gracias a su arquitectura MoE.

La relevancia de esta ficha reside en que no se trata de una cuantización convencional para GPU, sino de un empaquetado en formatos de coma flotante por bloques propios del hardware Tensix: `bfloat4_b` (BFP4) y `bfloat8_b` (BFP8). Las proyecciones de atención, la entrada de Mamba-2, los expertos enrutados y el experto compartido se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de salida de Mamba-2 se mantienen en BFP8. El resultado ocupa 18,915 GB empaquetados, frente a los 63,2 GB del repositorio completo con pesos en varios formatos.

El modelo está pensado para despliegue en NPUs de Tenstorrent y conserva las capacidades conversacionales y multilingües del modelo base (inglés, español, francés, alemán, japonés e italiano). Su licencia es la NVIDIA Nemotron Open Model License, que impone condiciones específicas para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y capas Mamba-2, mezcla de expertos (MoE) |
| Parámetros totales | 31.577.940.288 (31,58 mil millones) |
| Parámetros activos | Aproximadamente 3 mil millones (modelo A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) con GPTQ y búsqueda de exponente por bloque; BFP8 (`bfloat8_b`) con redondeo al más cercano; LM head, embeddings y normas en bf16 |
| Idiomas soportados | inglés, español, francés, alemán, japonés, italiano |
| Licencia | NVIDIA Nemotron Open Model License (`nvidia-nemotron-open-model-license`) |
| Formato de pesos | safetensors con empaquetado Tensix; incluye `quant4.json` con el formato de cada proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que alterna capas de atención con capas Mamba-2: según la model card, hay 6 capas con proyecciones de atención q, k, v y o, y 23 capas con proyecciones Mamba-2 de entrada y salida. Sobre esa columna vertebral se dispone una capa MoE con expertos enrutados y un experto compartido, cuyas proyecciones up y down se cuantizan en BFP4. Los tensores `A_log`, `D` y `e_score_correction_bias` de las capas Mamba-2 se conservan en float32 sin modificar.

La innovación de esta variante no está en el entrenamiento (el modelo base lo entrena NVIDIA; no se detallan en la información disponible el número de tokens ni la composición del dataset) sino en el proceso de cuantización: Xylolabs aplica GPTQ con búsqueda de exponente por bloque a los tensores BFP4 y redondeo al más cercano a los BFP8, verificando después cada matriz con `verify_grid.py` (las 6.004 matrices cuantizadas pasaron la comprobación) y el empaquetado TT-NN con `pack_tensix.py` sobre las capas 0 y 1 (260 matrices, todas con coincidencia exacta tras el desempaquetado). El código de cuantización y de kernels está publicado en los repositorios `tensix-bfp-gptq`, `tensix-kernels` y `tensix-runner`, versión 0.1.0.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y resolución de problemas de propósito general, heredados del modelo base Nemotron-3 Nano.
- Capacidades multilingües en inglés, español, francés, alemán, japonés e italiano.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole y Blackhole) mediante TT-NN y tt-metal.
- Compatibilidad con la API de `transformers` (versión 4.57.6) y con `mamba-ssm` 2.3.2.post1 para la normalización con puerta.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el modelo está empaquetado específicamente para NPUs Wormhole y Blackhole, por lo que encaja en clústeres que ya operan con tt-metal y TT-NN y quieren servir un modelo conversacional de 30B sin depender de GPU NVIDIA.
- Asistente conversacional multilingüe: al cubrir inglés, español, francés, alemán, japonés e italiano, puede atender a usuarios de esas seis lenguas con una única instancia y una plantilla de chat estándar.
- Prototipado e investigación en cuantización de bajo bit: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir la verificación de las 6.004 matrices y estudiar el impacto de BFP4 con GPTQ frente a BFP8 y bf16.
- Evaluación comparativa de precisión: la model card reporta una KL media frente a bf16 de 0,0606, frente a 0,0407 de llama.cpp Q4_K_M (1,49 veces mayor), lo que permite usar este checkpoint como referencia en estudios de degradación por cuantización.
- Generación de texto en entornos con restricciones de memoria: los 18,915 GB empaquetados reducen la huella frente a los 63,2 GB del repositorio completo, lo que facilita su alojamiento en nodos con DRAM limitada.
- Integración en pipelines de `transformers` para pruebas de humo: el fragmento de quickstart permite validar el modelo en GPU CUDA con `device_map="auto"` antes de trasladarlo al hardware Tensix.

## Benchmarks y rendimiento

| Modelo | Tamaño (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| Este checkpoint (BFP4/BFP8 Tensix) | 18,915 | 0,0606 | no disponible |
| llama.cpp Q4_K_M | no disponible | 0,0407 | no disponible |
| BF16 (modelo base) | no disponible | referencia | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta la divergencia KL frente a bf16 y el resultado de las comprobaciones de empaquetado.

## Requisitos de hardware

- VRAM/DRAM estimada: 18,915 GB empaquetados para Tensix; el repositorio completo ocupa 63,2 GB.
- Aceleradores objetivo: NPUs Tenstorrent Wormhole y Blackhole mediante tt-metal, TT-NN y tt-forge.
- GPU: el modelo base requiere una GPU CUDA y `mamba-ssm` para la normalización con puerta; no se especifican modelos concretos de GPU en la información disponible.
- GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: `transformers` 4.57.6 con `mamba-ssm` 2.3.2.post1 (incompatible con Transformers 5), TT-NN para Tensix, y el runner `tensix-runner` v0.1.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este checkpoint (Xylolabs) | 31,58 B totales / ~3 B activos | no disponible | BFP4 + BFP8 Tensix | NVIDIA Nemotron Open Model License | Tenstorrent Tensix |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58 B totales / ~3 B activos | no disponible | BF16 | NVIDIA Nemotron Open Model License | GPU CUDA |
| llama.cpp Q4_K_M (referencia de la model card) | no disponible | no disponible | Q4_K_M | no disponible | CPU/GPU |

La comparativa se limita a las alternativas citadas en la información disponible; no se dispone de datos de contexto ni de rendimiento en tareas para el modelo base ni para la referencia Q4_K_M.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una degradación medible: la KL media frente a bf16 es de 0,0606, un 49 % superior a la de llama.cpp Q4_K_M (0,0407).
- El modelo está empaquetado para Tensix; no es un checkpoint GGUF ni un safetensors convencional para GPU, por lo que no se puede cargar directamente en llama.cpp, Ollama o vLLM sin conversión.
- El código original de NVIDIA requiere GPU CUDA y `mamba-ssm`; además, es incompatible con Transformers 5 y exige la versión 4.57.6.
- El uso de `trust_remote_code=True` ejecuta código del repositorio: conviene revisarlo antes de habilitarlo.
- La licencia NVIDIA Nemotron Open Model License no es una licencia de código abierto permisiva; impone condiciones específicas para uso comercial que deben revisarse antes de producción.
- No se dispone de información sobre sesgos, tasas de alucinación ni límites de contexto del modelo base en la documentación proporcionada.
- El rendimiento en tareas concretas no está validado con benchmarks públicos en esta ficha; la única métrica publicada es la divergencia KL.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tensix-BFP4-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Código de cuantización (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8/blob/main/LICENSE
- Paper de referencia (arXiv:2512.20848): https://arxiv.org/abs/2512.20848
