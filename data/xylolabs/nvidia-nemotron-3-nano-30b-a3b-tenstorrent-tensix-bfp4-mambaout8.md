# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8

## Resumen

NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8 es una cuantización del modelo Nemotron-3 Nano 30B-A3B de NVIDIA, adaptada por Xylolabs para su ejecución en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer híbrido con capas de atención y capas Mamba-2, con 31.577.940.288 parámetros totales y un esquema de mezcla de expertos (MoE) que activa aproximadamente 3.000 millones de parámetros por token, de ahí el sufijo A3B.

La contribución de Xylolabs consiste en una cuantización selectiva a formatos de coma flotante en bloque (BFP4 y BFP8) propios del hardware Tensix, empaquetada en un único artefacto de 18,915 GB. Las proyecciones de atención, la proyección de entrada de Mamba-2 y las proyecciones de expertos (ruteados y compartidos) se cuantizan a `bfloat4_b`, mientras que las proyecciones de salida de Mamba-2 se mantienen en `bfloat8_b` para preservar precisión. El cabezal LM, los embeddings y las normas permanecen en bf16.

Es relevante porque demuestra la viabilidad de ejecutar un modelo MoE híbrido de 30B en hardware NPU no NVIDIA con una degradación de calidad medida (KL medio a bf16 de 0,0606 frente a 0,0407 de llama.cpp Q4_K_M, es decir, 1,49 veces peor) y un tamaño empaquetado notablemente inferior al del checkpoint original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y capas Mamba-2, mezcla de expertos (MoE) |
| Parametros totales | 31.577.940.288 |
| Parametros activos | Aproximadamente 3.000 millones (esquema A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en atención, Mamba-2 in, expertos ruteados y compartidos; BFP8 (`bfloat8_b`) en Mamba-2 out; bf16 en LM head, embeddings y normas; float32 en `A_log`, `D` y `e_score_correction_bias` |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (empaquetado Tensix), 18,915 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención con capas Mamba-2 (state space model). Según la información disponible, la red tiene 6 capas de atención y 23 capas Mamba-2, y utiliza un esquema MoE con expertos ruteados y un experto compartido en las capas Mamba-2. Los parámetros totales ascienden a 31.577.940.288, con unos 3.000 millones activos por token.

La cuantización de Xylolabs aplica GPTQ con búsqueda de exponente por bloque a los tensores BFP4, y redondeo al más cercano (round to nearest) a los tensores BFP8. Los tensores `backbone.layers.N.mixer.A_log`, `backbone.layers.N.mixer.D` y `backbone.layers.N.mixer.gate.e_score_correction_bias` se conservan en float32 sin modificar. El fichero `quant4.json` documenta el formato de cada proyección. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional en seis idiomas (inglés, español, francés, alemán, japonés e italiano).
- Razonamiento y respuesta a instrucciones mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de secuencias largas gracias a la combinación de atención y capas Mamba-2, si bien la longitud de contexto no está documentada en la información disponible.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante los kernels y el runner de `tensix-kernels` y `tensix-runner`.
- Compatibilidad con la API de generación de Transformers 4.x (versión 4.57.6) con `mamba-ssm` 2.3.2.post1.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el artefacto empaquetado de 18,915 GB está diseñado para cargarse directamente en NPUs Wormhole o Blackhole mediante TT-NN, lo que permite servir el modelo sin GPUs NVIDIA y aprovechar el formato BFP nativo del hardware.
- Inferencia de bajo coste en producción: al reducir el peso a 18,915 GB y mantener unos 3.000 millones de parámetros activos por token, el modelo es adecuado para escenarios de alta concurrencia donde el coste por token y la huella de memoria son críticos.
- Asistentes conversacionales multilingües: el soporte de seis idiomas permite atender a usuarios en inglés, español, francés, alemán, japonés e italiano con un único checkpoint.
- Investigación en cuantización para NPUs: el repositorio incluye `pack_tensix.py` y `verify_grid.py`, lo que facilita reproducir la verificación de las 6.004 matrices cuantizadas y estudiar el impacto del formato BFP4/BFP8 en la calidad.
- Evaluación comparativa de calidad de cuantización: con una métrica KL frente a bf16 publicada (0,0606), sirve como referencia para comparar otras técnicas de cuantización en el mismo modelo base.
- Prototipado de pipelines de generación de texto con Transformers: la compatibilidad con `AutoModelForCausalLM` y `trust_remote_code=True` permite integrar el modelo en flujos existentes sin reescribir la lógica de inferencia.
- Validación de kernels y formatos en hardware Tensix: los scripts de empaquetado y verificación permiten comprobar la integridad de cada matriz antes de desplegar en producción.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL medio a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| Este modelo (BFP4/BFP8 Tensix) | 18,915 | 0,0606 | no disponible |
| llama.cpp Q4_K_M | no disponible | 0,0407 | no disponible |
| BF16 (nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) | no disponible | referencia | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 18,915 GB empaquetados para Tensix; el checkpoint en bf16 del modelo base ocupa 63,2 GB en el repositorio.
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole con soporte TT-NN y `tt-metal`.
- GPU consumer: no está previsto para GPUs de consumo; el modelo base requiere CUDA y `mamba-ssm` para su normalización con compuerta, pero esta versión está empaquetada para Tensix.
- Opciones de despliegue: `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0 para Tensix; Transformers 4.57.6 con `mamba-ssm` 2.3.2.post1 para carga en CUDA.
- Latencia y throughput: no disponible en la información proporcionada.
- Verificación: las 6.004 matrices cuantizadas superaron la comprobación de rejilla; la comprobación de empaquetado TT-NN en ttsim cubrió las capas 0 y 1 (260 matrices) con coincidencia exacta de todos los valores desempaquetados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (Nemotron-3 Nano 30B-A3B BFP4 Tensix) | 31,58B totales / ~3B activos | no disponible | nvidia-nemotron-open-model-license | Hugging Face, empaquetado Tensix |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58B totales / ~3B activos | no disponible | nvidia-nemotron-open-model-license | Hugging Face, bf16 |
| llama.cpp Q4_K_M del mismo modelo base | 31,58B totales / ~3B activos | no disponible | nvidia-nemotron-open-model-license | GGUF para llama.cpp |

La comparativa se limita al mismo modelo base en distintos formatos, ya que no se dispone de datos de benchmarks de tareas que permitan contrastarlo con arquitecturas alternativas.

## Limitaciones y advertencias

- La calidad de la cuantización es inferior a la de llama.cpp Q4_K_M: el KL medio a bf16 es 0,0606 frente a 0,0407, un 49 % peor.
- El modelo está empaquetado específicamente para Tensix; no es un checkpoint portable a GPUs convencionales sin conversión.
- Requiere `trust_remote_code=True` y revisar el código incluido antes de habilitarlo, según advierte el autor.
- El código original de NVIDIA exige CUDA y `mamba-ssm`; es incompatible con Transformers 5 y requiere la versión 4.57.6 con `mamba-ssm` 2.3.2.post1.
- La licencia `nvidia-nemotron-open-model-license` impone condiciones específicas para uso comercial; es necesario revisar el fichero LICENSE antes de desplegar en producción.
- No se dispone de información sobre sesgos, tasas de alucinación ni límites de contexto en la documentación proporcionada.
- El rendimiento real en hardware Tensix (latencia, throughput) no está documentado.
- Solo se han publicado métricas de fidelidad de cuantización (KL y Top-1 parcial), no de capacidades downstream.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8)
- [Modelo base nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16)
- [Repositorio tensix-bfp-gptq](https://github.com/XylolabsInc/tensix-bfp-gptq)
- [Release tensix-bfp-gptq v0.1.0](https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0)
- [Release tensix-kernels v0.1.0](https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0)
- [Release tensix-runner v0.1.0](https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0)
- [Documentación de Tenstorrent](https://docs.tenstorrent.com)
- [Licencia del modelo](https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4-MambaOut8/blob/main/LICENSE)
- Paper de referencia: arXiv:2512.20848 (citado en los tags del repositorio)
