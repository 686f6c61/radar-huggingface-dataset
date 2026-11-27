# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Attn8-MambaOut8

## Resumen

Este repositorio contiene una cuantización del modelo NVIDIA Nemotron-3.5 Lightning 30B-A3B, un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado originalmente por NVIDIA, adaptada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base emplea una arquitectura híbrida `nemotron_h` que combina capas de atención con capas Mamba-2, y cuenta con 32.913.266.240 parámetros totales, de los cuales aproximadamente 3.000 millones están activos por token (de ahí la denominación A3B).

La contribución de Xylolabs no es un nuevo modelo, sino un formato de pesos cuantizados específicamente para el hardware NPU de Tenstorrent, utilizando block floating point (BFP4 y BFP8) en lugar de los formatos habituales de GPU. Las proyecciones de entrada de Mamba-2 y las proyecciones de expertos (ruteados y compartido) se cuantizan a `bfloat4_b`, mientras que las proyecciones de salida de Mamba-2 y las de atención se cuantizan a `bfloat8_b`; las normas, embeddings y cabeza LM permanecen en bf16. El resultado empaquetado ocupa 18,985 GB.

Es relevante porque demuestra la viabilidad de ejecutar modelos MoE híbridos de gran tamaño en hardware alternativo a GPU, con una degradación de calidad medible (KL medio de 0,0503 frente a bf16, frente a 0,0346 de llama.cpp Q4_K_M). El modelo soporta inglés, español, francés, alemán, italiano y japonés, y se distribuye bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (híbrida: atención + Mamba-2, MoE) |
| Parametros totales | 32.913.266.240 |
| Parametros activos | ~3B (denominación A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) y BFP8 (`bfloat8_b`) para Tensix; bf16/fp32 en normas, embeddings, LM head y tensores `mtp` |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (empaquetado Tensix, 18,985 GB) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Tamano del repo | 65,8 GB |
| Libreria | transformers (requiere Transformers 5.23.0 con `NemotronHForCausalLM`) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida `nemotron_h` que intercala capas de atención con capas Mamba-2. Según la información de cuantización, la red contiene 6 capas con proyecciones de atención (q, k, v, o) y 23 capas con proyecciones Mamba-2 (in y out), además de 23 capas con expertos ruteados y un experto compartido (up y down). Se trata, por tanto, de un transformer-Mamba híbrido con mezcla de expertos, en el que solo una fracción de los 32,9 mil millones de parámetros se activa por token.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en los datos disponibles. La aportación de este repositorio es exclusivamente la cuantización: los tensores `bfloat4_b` se obtuvieron con GPTQ y una búsqueda de exponente por bloque, mientras que los `bfloat8_b` se obtuvieron por redondeo al más cercano. Los tensores `mtp` se mantienen en bf16 y float32 sin cambios, al igual que los sesgos de corrección `e_score_correction_bias` de las puertas de los expertos. El archivo `quant4.json` documenta el formato de cada proyección. Las 6.004 matrices cuantizadas superaron la comprobación de rejilla, y la comprobación de empaquetado TT-NN sobre ttsim cubrió las capas 0 y 1 (260 matrices) con coincidencia exacta de valores.

## Capacidades

- Generación de texto conversacional en seis idiomas (inglés, español, francés, alemán, italiano y japonés).
- Razonamiento y generación de código, heredados del modelo base Nemotron-3.5 Lightning.
- Arquitectura MoE con experto compartido, lo que permite un coste de inferencia proporcional a los ~3B parámetros activos.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Ejecución sobre aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn.
- Compatibilidad con `transformers` para inferencia en GPU/CPU mediante el checkpoint cuantizado.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el formato empaquetado de 18,985 GB permite servir el modelo en NPUs Wormhole o Blackhole sin GPU, aprovechando los kernels de `tensix-kernels` y el runner `tensix-runner`.
- Inferencia conversacional multi-turno: la plantilla de chat y el soporte de seis idiomas permiten construir asistentes conversacionales en entornos con hardware Tensix.
- Servicio de generación de texto en producción con coste reducido: al activar solo ~3B parámetros por token, el modelo ofrece un throughput superior al de un denso de 32,9B con la misma memoria.
- Evaluación comparativa de cuantización BFP: investigadores pueden medir la degradación (KL 0,0503 frente a bf16) y contrastarla con formatos como Q4_K_M (0,0346) para estudiar el compromiso precisión/memoria.
- Prototipado en `transformers`: el checkpoint puede cargarse con `AutoModelForCausalLM` y `dtype="bfloat16"` para validar respuestas antes de empaquetar en Tensix.
- Investigación en arquitecturas híbridas atención-Mamba: sirve como banco de pruebas para estudiar el comportamiento de capas Mamba-2 cuantizadas a BFP4 en tareas de lenguaje.
- Generación de código y razonamiento en pipelines internos, siempre que se valide la calidad tras la cuantización BFP4.

## Benchmarks y rendimiento

| Modelo / formato | Tamano (GB) | KL medio frente a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (modelo base) | no disponible | 0 (referencia) | no disponible |
| Este checkpoint (BFP4/BFP8 Tensix) | 18,985 | 0,0503 | no disponible |
| llama.cpp Q4_K_M | no disponible | 0,0346 | no disponible |

La información disponible solo incluye la comparación de divergencia KL frente a bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Requisitos de hardware

- VRAM/DRAM: el checkpoint empaquetado ocupa 18,985 GB; se requiere al menos esa cantidad de memoria del dispositivo, más overhead de activaciones y caché.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole (NPU Tensix), con soporte mediante tt-metal/ttnn.
- GPU: el checkpoint también puede cargarse en `transformers` con `device_map="auto"` y `dtype="bfloat16"`, aunque el formato está optimizado para Tensix; no se especifican requisitos de VRAM para GPU.
- GPU de consumo: no disponible (no se documenta compatibilidad con RTX 4090 u otras consumer GPU en este formato).
- Opciones de despliegue: `tensix-runner` v0.1.0 para Tensix; `transformers` 5.23.0 con `NemotronHForCausalLM` para GPU/CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este checkpoint (Xylolabs) | 32,9B totales / ~3B activos | no disponible | BFP4/BFP8 | openmdw-1.1 | Tenstorrent Tensix |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B-BF16 | 32,9B totales / ~3B activos | no disponible | bf16 | openmdw-1.1 | GPU/CPU |
| llama.cpp Q4_K_M (referencia de calidad) | 32,9B totales / ~3B activos | no disponible | Q4_K_M | openmdw-1.1 | CPU/GPU |

La comparativa se limita al mismo modelo base en distintos formatos, ya que la información disponible no incluye otros modelos de la misma categoría con datos verificables.

## Limitaciones y advertencias

- La cuantización BFP4/BFP8 introduce una degradación medible: KL medio de 0,0503 frente a bf16, un 45 % superior al de llama.cpp Q4_K_M (0,0346). Puede afectar a tareas sensibles a la precisión.
- El checkpoint está optimizado para Tensix; su uso en GPU mediante `transformers` no está validado en cuanto a rendimiento ni a fidelidad del formato.
- Requiere Transformers 5.23.0 y la implementación `NemotronHForCausalLM`; versiones anteriores pueden no cargar el tipo `nemotron_h`.
- El tokenizador y la plantilla de chat se leen del repositorio upstream fijado a una revisión concreta; cambios en ese repositorio pueden romper la reproducibilidad.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones de contexto del modelo base en la información disponible.
- Licencia OpenMDW-1.1: deben revisarse sus términos para uso comercial; no se detallan restricciones adicionales en la información proporcionada.
- El tamaño del repo (65,8 GB) es considerablemente mayor que el checkpoint empaquetado (18,985 GB), lo que puede afectar al almacenamiento durante la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tensix-BFP4-Attn8-MambaOut8
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Tenstorrent-Tensix-BFP4-Attn8-MambaOut8/blob/main/LICENSE
