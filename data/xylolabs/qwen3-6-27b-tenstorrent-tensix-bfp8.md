# Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.6-27B-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen3.6-27B, publicada por Xylolabs, orientada específicamente a la ejecución sobre aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura multimodal image-text-to-text del original (etiqueta `qwen3_5` en transformers) y cuantiza únicamente las capas lineales del modelo de lenguaje a formato `ttnn.bfloat8_b` (block floating point de 8 bits) mediante GPTQ, mientras que el resto de tensores (embeddings, LM head, normas, módulo visual y MTP) permanecen en bf16.

El interés de esta ficha no reside en el modelo base, sino en el empaquetado: Xylolabs adapta los pesos al formato nativo de TT-NN para que el hardware Tensix los cargue sin re-cuantización, con un peso medio de 9,21 bits por parámetro y un empaquetado de 30,96 GB. Es relevante para equipos que despliegan modelos de gran tamaño sobre QuietBox u otros sistemas Tenstorrent y necesitan un checkpoint que respete el grid BFP8 del hardware.

El modelo cuenta con 27.781.427.952 parámetros totales según safetensors y un repositorio de 55,6 GB. La licencia es Apache 2.0, heredada del modelo base, y el pipeline declarado es image-text-to-text, aunque el autor indica que solo se cuantificó y evaluó el modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención con 16 capas y Gated DeltaNet con 48 capas), multimodal image-text-to-text, etiqueta `qwen3_5` en transformers |
| Parámetros totales | 27.781.427.952 |
| Parámetros activos | no disponible (no se declara configuración MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en capas lineales, GPTQ sobre grid bfloat8_b; bf16 en embeddings, LM head, normas, `mtp` y `visual`; media de 9,21 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de atención: 16 capas de atención clásica (q, k, v, o) y 48 capas de Gated DeltaNet (q, k, v, z, a, b, output), lo que da un total de 64 capas de secuencia, más 64 capas MLP (gate, up, down). El checkpoint incluye además un módulo visual y un componente `mtp` (multi-token prediction), ambos preservados en bf16 sin cuantizar. Esta combinación de atención estándar con capas de estado recurrente (DeltaNet) es la innovación arquitectónica principal del modelo base Qwen3.6.

El proceso de cuantización aplicado por Xylolabs es GPTQ sobre el grid block-floating-point de TT-NN, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador. La calibración se realizó con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los pesos cuantizados se almacenan como valores bf16 sobre el grid BFP8, de modo que TT-NN los empaqueta sin alterar sus valores; el autor verifica esta propiedad con `pack_tensix.py` y `verify_grid.py`. No se dispone de información sobre el dataset de preentrenamiento original, el número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del modelo base Qwen3.6-27B.
- Procesamiento multimodal image-text-to-text según el pipeline declarado; el módulo `visual` se conserva en bf16.
- Predicción multi-token (`mtp`) incluida en el checkpoint, aunque no se documenta su uso en la exportación.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la calibración de cuantización usó coreano e inglés, pero no se declaran idiomas soportados.

## Casos de uso

- Despliegue en hardware Tenstorrent Blackhole: el checkpoint está diseñado para cargarse directamente en TT-NN sin re-cuantización, lo que permite servir el modelo en QuietBox 2 con paralelismo tensorial sobre cuatro chips.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible para estudiar el impacto de BFP8 con GPTQ frente a bf16, ya que el autor incluye scripts de verificación de grid y de empaquetado.
- Evaluación de precisión en NPU: equipos que necesitan comparar la fidelidad numérica de BFP8 frente a BFP4 pueden usar este checkpoint y su variante BFP4 con el mismo pipeline.
- Prototipado de asistentes multimodales en entornos Tenstorrent: al conservar el módulo visual en bf16, permite experimentar con entrada de imagen y texto en hardware NPU.
- Benchmarking de decodificación con MTP: el componente `mtp` en bf16 permite medir el rendimiento de predicción multi-token sobre Tensix.
- Integración en pipelines de transformers para validación: el ejemplo de quickstart con `AutoModelForCausalLM` permite cargar el modelo en GPU convencional para comprobar la calidad de la cuantización antes de desplegarlo en NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de empaquetado: 9,21 bits por peso de media y 30,96 GB empaquetados, además de una verificación de que los valores empaquetados coinciden con los bf16 de origen.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 30,96 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole; el demo `qwen38_27b_qb2` de tt-metal requiere cuatro chips Blackhole (QuietBox 2) y rechaza otro hardware.
- GPU convencional: el quickstart usa `device_map="auto"` con dtype bfloat16; no se especifica VRAM mínima, pero el repositorio ocupa 55,6 GB, por lo que se necesita al menos esa capacidad agregada o descarga en streaming.
- Variante para menos memoria: el autor remite a la versión BFP4 del mismo modelo para dispositivos con menos capacidad.
- Opciones de despliegue: TT-NN (ttnn 0.81.1), tt-metal (demos `qwen38_27b_qb2` y `qwen36`), transformers. tt-transformers no soporta esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP8 | 27,78 B | no disponible | BFP8 GPTQ (9,21 bits/peso) | Apache 2.0 | Hugging Face, 34 descargas |
| Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP4 | no disponible | no disponible | BFP4 | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.6-27B (base) | no disponible | no disponible | bf16 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo visual y `mtp` no fueron validados en la exportación.
- tt-transformers no soporta esta arquitectura, lo que limita las rutas de despliegue estándar.
- Los demos de tt-metal tienen restricciones: `qwen38_27b_qb2` exige cuatro chips Blackhole y su configuración por defecto re-cuantiza a bfloat4_b; el demo `qwen36` empaqueta gate y up en bfloat4_b y no ejecuta este checkpoint a su precisión.
- El autor no confirma una ejecución completa en hardware real: las pruebas se hicieron con ttsim, el simulador Blackhole de Tenstorrent, y solo se verificó el decodificador de las capas 0 y 3 con una política bfloat8_b.
- La calibración de GPTQ se limitó a 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios e idiomas.
- No se declaran idiomas soportados ni evaluación de sesgos o alucinación.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base Qwen3.6-27B.
- El número de descargas (34) y la ausencia de likes indican poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Variante BFP4: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP4
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo tt-metal qwen38_27b_qb2: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Demo tt-metal Qwen3.5/3.6: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
