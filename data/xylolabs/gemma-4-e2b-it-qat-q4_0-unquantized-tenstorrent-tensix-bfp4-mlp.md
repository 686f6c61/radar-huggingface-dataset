# Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una exportación cuantizada del modelo `google/gemma-4-E2B-it-qat-q4_0-unquantized` de Google, adaptada específicamente para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La conversión la firma Xylolabs mediante su herramienta `tensix-bfp-gptq`, que transforma las proyecciones lineales del modelo a formatos de coma flotante por bloques nativos de TT-NN: `bfloat4_b` (BFP4) para las capas MLP y `bfloat8_b` (BFP8) para las proyecciones de atención. El resultado es un checkpoint que TT-NN puede empaquetar en memoria de dispositivo sin alterar los valores almacenados.

El modelo base es un Gemma 4 de la familia E2B (aproximadamente 5.506 millones de parámetros totales según los pesos en safetensors) con capacidades multimodales de tipo any-to-any: procesa texto, imagen y audio, e incluye torres de visión y audio que permanecen en bf16 sin cuantizar. La exportación solo cuantiza y evalúa el modelo de lenguaje; las torres multimodal y las proyecciones de embedding se mantienen en precisión completa.

La relevancia de esta ficha es doble. Por un lado, documenta una receta concreta de despliegue de un modelo Gemma 4 en hardware no-GPU (NPU de Tenstorrent), un nicho creciente para inferencia de bajo consumo. Por otro, sirve de ejemplo de cuantización híbrida por bloques (4,5 bits en MLP, 8,5 bits en atención, media de 11,68 bits por peso) con un consumo empaquetado de 6,76 GB de memoria de dispositivo para los pesos del modelo de lenguaje. La información pública disponible es limitada: no hay benchmarks de calidad publicados más allá de una tabla de evaluación truncada en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (any-to-any) con torres de visión y audio; capas lineales cuantizadas a BFP4/BFP8 para Tensix |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`, 4,5 bits por peso) en MLP gate/up/down; BFP8 (`bfloat8_b`, 8,5 bits por peso) en atención q/k/v/o; bf16 en embeddings, LM head, normas y torres multimodal; media de 11,68 bits por peso |
| Idiomas soportados | no disponible (calibración GPTQ con WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` y `model.safetensors.index.json`); compatible con transformers y con TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google (familia Gemma 4, variante E2B) con pipeline `any-to-any`, es decir, acepta y produce texto, imagen y audio. La exportación de Xylolabs no reentrena el modelo: aplica cuantización post-entrenamiento sobre las proyecciones lineales del modelo de lenguaje. Las capas MLP (gate, up y down en 35 capas) se cuantizan a `ttnn.bfloat4_b` mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, o en 35 capas; k, v en 15 capas) se cuantizan a `ttnn.bfloat8_b` con redondeo al más cercano. El resto de tensores (embedding, LM head atado al embedding, normas, torres de visión y audio) se mantienen en bf16.

La innovación técnica clave es el uso de coma flotante por bloques (block floating point) nativo de TT-NN: las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que el empaquetado en el dispositivo es exacto y no introduce error adicional. La model card indica que la verificación se realizó con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent, comprobando que ningún valor cambia al empaquetar. No se especifican datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional (modelo instruct, `-it`).
- Procesamiento de imagen (image-text-to-text) mediante `vision_tower` y `embed_vision` en bf16.
- Procesamiento de audio mediante `audio_tower` y `embed_audio` en bf16.
- Pipeline any-to-any: entrada y salida multimodal.
- Soporte de plantilla de chat (`apply_chat_template`) para diálogo multi-turno.
- Compatibilidad con `transformers` (`AutoModelForCausalLM`) en bf16 sobre GPU/CPU.
- Despliegue en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Inferencia en NPU Tenstorrent: despliegue del modelo en aceleradores Wormhole o Blackhole aprovechando el empaquetado BFP4/BFP8 nativo, con 6,76 GB de memoria de dispositivo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. Adecuado para entornos que priorizan eficiencia energética sobre GPUs.
- Prototipado multimodal en local: uso de las torres de visión y audio en bf16 para tareas de descripción de imágenes o transcripción, manteniendo el modelo de lenguaje cuantizado para reducir huella de memoria.
- Evaluación de recetas de cuantización: el repositorio sirve como referencia reproducible de cuantización híbrida GPTQ (BFP4) + RTN (BFP8) con verificación exacta de empaquetado mediante `pack_tensix.py` y `verify_grid.py`.
- Asistente conversacional multi-turno: con la plantilla de chat de Gemma y el modelo instruct, para diálogos con historial, siempre que la ventana de contexto del modelo base sea suficiente (dato no disponible aquí).
- Integración en pipelines de `transformers`: carga directa con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` para pruebas en GPU antes de portar a Tensix.
- Investigación en formatos block floating point: estudio del impacto de BFP4 en capas MLP frente a BFP8 en atención, con el fichero `quant4.json` documentando el formato de cada proyección.

## Benchmarks y rendimiento

La model card incluye una sección de evaluación que aparece truncada en la información disponible (la tabla comienza con "| | B" y no se proporcionan resultados numéricos). No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: 6,76 GB solo para los pesos del modelo de lenguaje empaquetados, más espacio adicional para KV cache y buffers (cantidad no especificada).
- Aceleradores objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole (probado en simulador `ttsim` de Blackhole con `ttnn` 0.81.1).
- GPU: el modelo puede cargarse en bf16 con `transformers` en GPU convencionales (A100, H100, RTX 4090) usando `device_map="auto"`, aunque el objetivo principal es Tensix; requisitos exactos de VRAM en GPU no disponibles.
- Despliegue en Tensix: TT-NN (`ttnn`) para empaquetado directo; demo oficial de Gemma 4 en `tt-metal` v0.81.1 (soporta E2B, E4B y 12B en una Blackhole P150, sin opción `bfloat4_b`).
- `tt-forge` (tt-xla): no probado con Gemma 4; por defecto mantiene bf16 (exacto); la opción `bfp_bf4` recuantiza en layout `[out, in]` de PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP | 5.506.950.723 | no disponible | BFP4 MLP + BFP8 atención (11,68 bits/peso medio) | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| google/gemma-4-E2B-it-qat-q4_0-unquantized (base) | no disponible | no disponible | bf16 (sin cuantizar) | Apache 2.0 | GPU/CPU genéricos |
| Gemma 4 E2B en tt-metal demo | no disponible | no disponible | bf16 / BFP8 (sin BFP4) | Apache 2.0 | Blackhole P150 |

No se dispone de datos de benchmarks ni de especificaciones de contexto del modelo base en la información proporcionada, por lo que la comparación se limita a formato, licencia y hardware objetivo.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio permanecen en bf16 y no han sido validadas en esta exportación.
- La cuantización BFP4 en MLP puede degradar la calidad frente al modelo base en tareas sensibles; no se publican métricas de degradación en la información disponible.
- La calibración GPTQ usó WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento hacia esos dominios e idiomas.
- El soporte en `tt-metal` v0.81.1 no incluye `bfloat4_b`; sin entrada en `precision_overrides.json`, los módulos cargan en bf16 (exacto pero sin aprovechar la compresión).
- La entrada de override sugerida en la model card (atención y MLP en `bfp8`) no se ejecutó sobre esta exportación concreta, solo sobre las dos primeras capas del export base E2B.
- `tt-forge` no se ha probado con Gemma 4; su opción `bfp_bf4` recuantiza en otro layout y puede alterar los valores.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base de Google y de los componentes de terceros.
- Idiomas soportados no documentados; el rendimiento fuera de inglés y coreano es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
