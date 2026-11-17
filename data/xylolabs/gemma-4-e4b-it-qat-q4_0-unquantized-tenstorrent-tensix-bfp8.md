# Xylolabs/gemma-4-E4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8

## Resumen

El modelo `Xylolabs/gemma-4-E4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8` es una redistribución cuantizada de `google/gemma-4-E4B-it-qat-q4_0-unquantized`, preparada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila `tt-metal` y `ttnn`. No se trata de un modelo nuevo: es una conversión de formato que reemplaza las proyecciones de atención y MLP por matrices en `bfloat8_b` (formato de coma flotante por bloques, BFP8) generadas con GPTQ, manteniendo en bf16 la cabeza de lenguaje, los embeddings, las normas y las torres de visión y audio.

El modelo base es un Gemma 4 de la familia "E4B" con 7.941.100.874 parámetros reales según los safetensors del repositorio, lo que sugiere una arquitectura con compartición de parámetros o embeddings de gran tamaño, dado el sufijo "E" y el hecho de que las últimas 18 capas reutilizan las claves y valores de capas anteriores. La variante original de Google aplica quantización consciente del entrenamiento (QAT) con esquema q4_0, pero se distribuye sin cuantizar para permitir reconversiones.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras conversiones públicas de un Gemma 4 a formato Tensix, lo que interesa a quien despliegue inferencia en hardware no-GPU; por otro, sirve como referencia metodológica de cómo evaluar la fidelidad de una cuantización BFP8 frente a bf16 y frente a Q4_0 de llama.cpp con métricas de divergencia KL y de precisión en respuestas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text / any-to-any) con compartición de KV en las últimas 18 capas; 42 capas de atención y MLP cuantizadas |
| Parámetros totales | 7.941.100.874 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ sobre rejilla `bfloat8_b` (BFP8, 8,5 bits por peso) en proyecciones de atención y MLP; bf16 en cabeza LM, embeddings, normas y torres de visión/audio; media de 12,09 bits por peso |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 sobre la rejilla BFP8); empaquetado final en formato Tensix de 11,279 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 42 capas con atención y MLP convencionales, más torres separadas de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`), lo que justifica la etiqueta `any-to-any` y el pipeline `image-text-to-text`. Un detalle arquitectónico relevante es que las capas 0 a 23 tienen proyecciones K y V propias, mientras que las 18 capas restantes reutilizan las claves y valores de capas anteriores, una forma de compartición de KV que reduce el coste de memoria en contexto largo. El modelo base de Google incorpora quantización consciente del entrenamiento (QAT) con esquema q4_0, aunque esta distribución parte de la versión "unquantized" para permitir recuantizar con otros esquemas.

Xylolabs aplica GPTQ sobre una rejilla de coma flotante por bloques `bfloat8_b`, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN. La calibración se realizó con 65.536 tokens de WikiText-2 y de Wikipedia en coreano, lo que explica la cobertura de idiomas declarada (en, ko). Solo se cuantizó y evaluó el modelo de lenguaje: las torres de visión y audio son las del modelo base sin modificar. El proceso se verificó con `tensix-bfp-gptq v0.1.0`, cuyos scripts `tools/pack_tensix.py` y `tools/verify_grid.py` se incluyen en el repositorio y se ejecutaron sobre `ttsim` con `ttnn 0.81.1`, comprobando que ningún valor cambia al empaquetar.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo instruct (`-it`).
- Procesamiento de imagen y texto de entrada (`AutoModelForImageTextToText`), con torre de visión en bf16 sin cuantizar.
- Procesamiento de audio de entrada, con torre de audio en bf16 sin cuantizar.
- Salida multimodal (`any-to-any` según el pipeline declarado), aunque la model card no detalla qué modalidades de salida están activas.
- Razonamiento y respuesta a preguntas en inglés y coreano.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante `tt-metal`/`ttnn`, además de inferencia estándar en PyTorch/transformers.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso de uso principal del artefacto es ejecutar un Gemma 4 instruct en Wormhole o Blackhole usando `tensix-runner` y los kernels de `tensix-kernels`, aprovechando el empaquetado BFP8 de 11,279 GB frente a los 15,04 GB en bf16 para reducir la huella en DRAM del dispositivo.
- Asistentes conversacionales en inglés y coreano: el modelo conserva la plantilla de chat del base y fue calibrado con Wikipedia en coreano, por lo que es adecuado para atención al cliente o asistentes internos en esos dos idiomas, siempre que se valide el comportamiento en el resto de lenguas.
- Procesamiento de documentos con imagen: al mantener la torre de visión en bf16, puede recibir capturas, escaneos o diagramas junto a una pregunta de texto y devolver una descripción o extracción, integrándose en pipelines de digitalización.
- Transcripción y análisis de audio: la torre de audio sin cuantizar permite tareas de comprensión de habla (resumen, preguntas sobre el contenido) sin la pérdida de precisión que habría supuesto cuantizarla.
- Evaluación de fidelidad de cuantizaciones: sirve como referencia para comparar el impacto de BFP8 frente a Q4_0 en un mismo modelo base, usando las métricas de KL y de respuestas correctas que publica el autor.
- Investigación en formatos de coma flotante por bloques: útil para estudiar cómo se comporta GPTQ cuando la rejilla de destino no es entera sino `bfloat8_b` con exponente compartido por bloque.
- Prototipado de inferencia en hardware no-GPU: permite a equipos con presupuesto energético o de disponibilidad de GPU limitado validar cargas de trabajo multimodales sobre Tensix antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

Los datos publicados son evaluaciones en host de los pesos, no mediciones en dispositivo. Comparan la versión BFP8 con el bf16 original y con una cuantización Q4_0 de llama.cpp:

| Pesos | Bits por peso | Tamaño (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precisión |
|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 15,04 | 0 | 100 | 38/40 | - | - |
| BFP8 (este repositorio) | 12,09 | 11,279 | 0,0014 | 98,41 | 32/33 | 0 | pasado (0,05× KL) |
| Q4_0 (llama.cpp) | 5,51 | 5,155 | 0,0279 | 91,58 | 32/33 | 0 | referencia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 15,04 GB de pesos, más overhead de activaciones y caché KV; en la práctica requiere una GPU de 24 GB o más para contexto moderado.
- VRAM estimada con el empaquetado Tensix: 11,279 GB de pesos; el repositorio de Hugging Face ocupa 15,9 GB porque almacena los valores cuantizados como bf16.
- GPU recomendadas para inferencia PyTorch: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto corto; en GPUs de 16 GB sería necesario recurrir a cuantizaciones adicionales.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 4080 (16 GB) solo con contexto reducido o cuantización adicional; no se garantiza en tarjetas de 8-12 GB.
- Aceleradores objetivo: Tenstorrent Wormhole y Blackhole, con la pila `tt-metal` y `ttnn 0.81.1` o superior.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText`, `tensix-runner v0.1.0` y `tensix-kernels v0.1.0` para Tensix. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible. No se han publicado mediciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 E4B BFP8 Tensix) | 7.941.100.874 | no disponible | GPTQ BFP8 + bf16 mixto | Apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it-qat-q4_0-unquantized | 7.941.100.874 | no disponible | sin cuantizar (QAT q4_0 en origen) | Apache-2.0 | Hugging Face (modelo base) |
| Q4_0 de llama.cpp sobre el mismo base | 7.941.100.874 | no disponible | Q4_0, 5,51 bits/peso | Apache-2.0 | generado localmente |

La comparación directa con otras familias (Llama, Qwen, Mistral) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento de esos modelos ni del Gemma 4 base frente a ellos.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio son las del base y no se ha medido su comportamiento tras el empaquetado en Tensix.
- La evaluación publicada es en host, no en dispositivo: no hay garantía de que el rendimiento en Wormhole o Blackhole coincida con las métricas de KL y Top-1 reportadas.
- Cobertura lingüística declarada limitada a inglés y coreano; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al base.
- La calibración con WikiText-2 y Wikipedia en coreano puede no representar dominios especializados (código, derecho, medicina), donde la divergencia frente a bf16 podría ser mayor.
- Riesgo de alucinación inherente a un modelo instruct de este tamaño; no se aportan evaluaciones de factualidad ni de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso en producción ni de validación por terceros.
- La licencia Apache-2.0 se declara en los metadatos y en el README, pero conviene verificar las condiciones del modelo base de Google antes de un uso comercial, ya que las licencias de los Gemma originales pueden imponer restricciones adicionales.
- El tamaño real de los pesos en disco (15,9 GB) duplica aproximadamente el empaquetado Tensix (11,279 GB); hay que prever el espacio y el proceso de empaquetado con `pack_tensix.py` antes de desplegar.
- No se documentan límites de contexto, soporte de tool calling ni comportamiento en agentes multi-paso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-unquantized
- Código de cuantización y verificación: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release de tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels para Tensix: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner para Tensix: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
