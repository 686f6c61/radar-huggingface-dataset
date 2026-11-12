# Xylolabs/Muse-Glimmer-30B-Tensix-BFP4

## Resumen

Muse-Glimmer-30B-Tensix-BFP4 es una cuantización del modelo multimodal Muse-Glimmer-30B (desarrollado por meta-models) realizada por Xylolabs, orientada específicamente a la inferencia sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El checkpoint conserva la arquitectura original `muse_glimmer` de transformers 5.x y aplica GPTQ con búsqueda de exponente por bloque a las capas lineales del decodificador de texto, dejando en bf16 la torre de visión, el adaptador visual, las normas, los embeddings y la cabeza LM.

El modelo resuelve el problema de desplegar un modelo de 29.776 millones de parámetros en hardware no-GPU con un formato de coma flotante por bloques (`ttnn.bfloat4_b`, BFP4) que TT-NN empaqueta de forma nativa sin conversión adicional. El resultado ocupa 19,54 GB empaquetados, con una media de 5,61 bits por peso, frente a los aproximadamente 59,6 GB del repositorio en bf16.

Es relevante porque demuestra un pipeline completo de cuantización GPTQ específico para Tensix (`tensix-bfp-gptq`), con verificación de que los valores empaquetados son idénticos a los del checkpoint en bf16, y porque habilita la ejecución del decodificador de texto en configuraciones multichip (QuietBox 2 con TP 4 o Galaxy con TP 4/8) mediante el demo oficial de tt-metal v0.81.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `muse_glimmer` (decodificador de texto + torre de visión y adaptador visual) |
| Parametros totales | 29.776.626.688 (~29,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en 52 capas; bf16 en el resto; media de 5,61 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 con valores ya alineados a la rejilla BFP4); metadatos en `quant4.json` |

## Arquitectura y entrenamiento

El modelo base es Muse-Glimmer-30B, un modelo image-text-to-text con arquitectura `muse_glimmer` integrada de forma nativa en transformers 5.x (sin código remoto), que se carga mediante `AutoModelForImageTextToText` o `MuseGlimmerForConditionalGeneration`. La cuantización afecta únicamente al modelo de lenguaje: las proyecciones de atención (q, k, v, o), la puerta de salida y las proyecciones MLP (gate, up, down) de las 52 capas se convierten a `bfloat4_b` con GPTQ y una búsqueda de exponente por bloque. La cabeza LM, los embeddings, las normas, el `vision_adapter` y el `vision_tower` permanecen en bf16 sin cambios.

El proceso de calibración utilizó 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los pesos se guardan en bf16 pero con cada valor ya situado sobre la rejilla BFP4, de modo que TT-NN los empaqueta tal cual sin pérdida adicional; el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) que comprueban la identidad bit a bit tras el empaquetado. No se detallan en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión y adaptador visual conservados en bf16.
- Carga nativa en transformers 5.x sin `trust_remote_code`.
- Empaquetado exacto en Tensix: los valores BFP4 se empaquetan sin cambios en `ttnn.bfloat4_b` y también de forma exacta en `ttnn.bfloat8_b`.
- Ejecución tensor-parallel del decodificador de texto mediante el demo de tt-metal (`muse_glimmer_30b`), con soporte de TP 4 y TP 8.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repositorio).
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para ejecutarse en Wormhole o Blackhole mediante TT-NN, con el demo `muse_glimmer_30b` de tt-metal v0.81.1 en configuraciones QuietBox 2 (TP 4) o Galaxy (TP 4/8), reduciendo el peso empaquetado a 19,54 GB frente a los ~59,6 GB en bf16.
- Inferencia multimodal en servidores no-GPU: al conservar la torre de visión y el adaptador en bf16, permite tareas de imagen-texto (descripción, VQA) sobre hardware Tensix sin depender de CUDA.
- Evaluación y benchmarking de cuantización: útil para comparar la calidad de BFP4 con GPTQ frente a bf16 en un modelo de ~30B, con scripts de verificación de rejilla incluidos.
- Prototipado en simulador: el checkpoint se ha probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), lo que permite validar pipelines de empaquetado y ejecución sin hardware físico.
- Integración en pipelines de transformers: al cargarse con `AutoModelForImageTextToText` y `device_map="auto"`, sirve para pruebas de humo en GPU o CPU antes de portar la inferencia a Tensix.
- Investigación en formatos de coma flotante por bloques: el repositorio documenta el formato por tensor (`quant4.json`) y permite estudiar el impacto de 4,5 bits por peso en proyecciones de atención y MLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluación que comienza con las columnas "Bits a weight" y "Size (GB)" pero cuyo contenido no se ha proporcionado; no se dispone de valores de MMLU, HumanEval, GSM8K ni de comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM/DRAM estimada: 19,54 GB empaquetados en BFP4 para el conjunto de pesos cuantizados; el repositorio completo en bf16 ocupa 59,6 GB.
- Hardware objetivo: NPUs Tenstorrent Tensix (Wormhole y Blackhole). El demo de tt-metal se ejecuta en QuietBox 2 con 4 chips Blackhole (TP 4) o en Blackhole Galaxy (TP 4 u 8).
- GPU consumer: no se documenta soporte ni requisitos para GPU; la carga en transformers es posible con `device_map="auto"` y `dtype="bfloat16"`, pero no se especifican mínimos de VRAM.
- Opciones de despliegue: TT-NN/tt-metal (demo `muse_glimmer_30b` v0.81.1), tt-forge (tt-xla, aún no probado con este checkpoint), y transformers 5.x para carga y pruebas en texto.
- Simulación: ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole), entorno en el que se realizaron las comprobaciones.
- Latencia y throughput: no disponibles. La model card indica que la ejecución completa requiere los cuatro chips y no fue probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Tensix-BFP4 (este) | ~29,78 B | no disponible | BFP4 (4,5 bits/peso), safetensors | Apache 2.0 | Hugging Face, 0 descargas |
| Muse-Glimmer-30B (base) | ~29,78 B | no disponible | bf16, safetensors | no disponible en la información | Hugging Face (meta-models) |
| Alternativas de ~30B en 4 bits | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de contexto para establecer una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y el adaptador visual no fueron evaluados tras la cuantización.
- La cuantización BFP4 introduce una pérdida de precisión de 4,5 bits por peso en las 52 capas lineales; no se han publicado métricas de degradación frente al modelo base.
- El demo de tt-metal empaqueta la cabeza LM en `bfloat8_b`, por lo que la cabeza bf16 de este checkpoint no es exacta en ese entorno.
- La ejecución en hardware Tensix no fue probada: las verificaciones se hicieron en el simulador `ttsim` con ttnn 0.81.1.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su opción `bfp_bf4` recuantiza en el layout `[out, in]` de PyTorch.
- `tt-transformers` no soporta la arquitectura `muse_glimmer`.
- El config se guardó con transformers 5.15.0.dev0 y las comprobaciones se hicieron con 5.22.1; versiones anteriores de transformers 5.x no cargarán el modelo de forma nativa.
- Idiomas soportados y longitud de contexto no documentados; riesgo de alucinación y sesgos del modelo base no evaluados en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `meta-models/Muse-Glimmer-30B`, no indicada en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Muse-Glimmer-30B-Tensix-BFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo tt-metal Muse-Glimmer-30B (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/muse_glimmer_30b
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2610.24628): https://arxiv.org/abs/2610.24628
