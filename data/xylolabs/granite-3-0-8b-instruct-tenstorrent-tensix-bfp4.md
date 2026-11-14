# Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4

## Resumen

Granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4 es una cuantización del modelo instructivo Granite 3.0 de 8B de IBM, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only del original, con 8.372.187.136 parámetros, pero sustituye las proyecciones lineales de atención y MLP por matrices cuantizadas a `ttnn.bfloat4_b` (block floating point de 4 bits) mediante GPTQ, mientras que embeddings, normas y LM head permanecen en bf16.

El problema que resuelve es el despliegue eficiente de un LLM de 8B en hardware Tensix con un presupuesto de memoria mucho menor que el del checkpoint BF16 original: el export ocupa aproximadamente 4,89 GB en memoria de dispositivo para los pesos del modelo de lenguaje, frente a 16,34 GB en bf16, con una media de 4,78 bits por peso. Es relevante para quienes trabajan con aceleradores Tenstorrent y necesitan ejecutar un modelo conversacional con calidad cercana al original sin recurrir a GPUs convencionales.

La ficha se centra en el artefacto cuantizado y su integración con el ecosistema TT-NN, tt-metal y tt-forge. La model card documenta explícitamente las limitaciones de compatibilidad con tt-transformers y el estado de validación en el simulador Blackhole (`ttsim`), lo que resulta crítico para evaluar su madurez en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: ibm-granite/granite-3.0-8b-instruct) |
| Parametros totales | 8.372.187.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en capas lineales) y bf16 en el resto; media de 4,78 bits por peso |
| Idiomas soportados | no disponible en la informacion proporcionada (calibracion realizada con WikiText-2 en ingles y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`), compatible con transformers; empaquetado para TT-NN |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 8B parámetros de la familia Granite 3.0 de IBM, con 40 capas según la model card (se mencionan "40 layers" al describir las proyecciones cuantizadas). La cuantización afecta a las proyecciones de atención (q, k, v, o) y a las proyecciones MLP (gate, up, down) de las 40 capas, que se almacenan en `bfloat4_b` a 4,5 bits por peso. El LM head (atado al embedding), el embedding, las normas y el resto de tensores se mantienen en bf16, idénticos al modelo base.

El proceso de cuantización emplea GPTQ con una búsqueda de exponente por bloque y calibración sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin alterar sus valores; la model card indica que los mismos valores también se empaquetan de forma exacta en `ttnn.bfloat8_b`. No se detalla en la información disponible si el modelo base recibió RLHF/DPO ni la composición completa del dataset de entrenamiento original.

## Capacidades

- Generación de texto conversacional en formato instruct, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas generales, heredados del modelo base Granite 3.0 instruct.
- Generación de código y tareas de instrucción, según las capacidades del modelo base (no verificadas específicamente en esta cuantización).
- Capacidades multilingües del modelo base: no disponibles en detalle en la información proporcionada; la calibración incluyó texto en inglés y coreano.
- Ejecución en hardware Tensix mediante TT-NN (`ttnn.bfloat4_b`) y empaquetado verificado con `pack_tensix.py` y `verify_grid.py`.
- Compatibilidad con el pipeline `text-generation` de transformers y con `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo está pensado para ejecutarse en aceleradores Tensix con aproximadamente 4,89 GB de memoria de dispositivo para los pesos, lo que permite alojar un LLM de 8B en tarjetas con presupuesto de memoria reducido.
- Investigación en cuantización de bajo bitwidth: sirve como referencia reproducible de GPTQ con block floating point (BFP4) sobre un transformer de 8B, con scripts de verificación (`pack_tensix.py`, `verify_grid.py`) para comprobar que ningún valor cambia al empaquetar.
- Evaluación de calidad de cuantización: la model card proporciona métricas de divergencia KL y top-1 frente a BF16 y a Q4_K_M de llama.cpp, útiles para comparar estrategias de cuantización en inglés y coreano.
- Prototipado de asistentes conversacionales en hardware alternativo: al conservar la plantilla de chat de Granite, puede integrarse en aplicaciones de diálogo multi-turno ejecutadas sobre Tensix.
- Validación en simulador: la model card indica que se comprobó con `ttnn 0.81.1` en `ttsim`, el simulador de Blackhole, lo que permite desarrollar y depurar pipelines TT-NN sin hardware físico.
- Integración vía tt-forge (tt-xla): aunque no se ha ejecutado con este checkpoint, tt-forge compila el código de transformers y aplica los multiplicadores de Granite, por lo que es una vía candidata para despliegue con pesos en bf16 exactos.
- Benchmarking de inferencia en aceleradores: útil para medir latencia y throughput de un modelo 8B cuantizado a BFP4 en Tensix frente a alternativas en GPU.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-3.0-8b-instruct) | 16 | 16,34 | 0 | 100 | 25 de 33 | - |
| Este modelo (BFP4) | 4,78 | 4,886 | 0,06716 | 89,47 | 22 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,84 | 4,943 | 0,05921 | 89,30 | 23 de 33 | 0 |

Las métricas de KL y top-1 cubren 16.248 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 que fallan o se rompen en la versión cuantizada. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix.

## Requisitos de hardware

- Memoria de dispositivo estimada: aproximadamente 4,89 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole).
- Validación realizada en `ttsim`, el simulador de Blackhole de Tenstorrent, con `ttnn 0.81.1`.
- No se proporcionan requisitos de VRAM para GPU ni modelos de GPU recomendados en la información disponible.
- Opciones de despliegue: TT-NN (`ttnn.bfloat4_b`), tt-metal v0.81.1, tt-forge (tt-xla) como vía no probada aún con este checkpoint; transformers para carga y ejecución en bf16.
- tt-transformers (tt-metal v0.81.1) no es utilizable con este modelo: no soporta Granite y lo carga como modelo tipo Llama, ignorando los multiplicadores de embedding, atención, residual y logits; en la versión BFP8 de este modelo, un prefill de 2 capas no coincidió con transformers (PCC 0,20).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Granite 3.0 8B BFP4) | 8,37B | no disponible | BFP4 (4,78 bits/peso), 4,886 GB | Apache-2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-3.0-8b-instruct (BF16) | 8,37B | no disponible | BF16, 16,34 GB | Apache-2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,37B | no disponible | Q4_K_M (4,84 bits/peso), 4,943 GB | Apache-2.0 | Generado con llama.cpp v0.9.0 |

La comparativa se limita a las variantes del mismo checkpoint documentadas en la model card; no se dispone de datos de otros modelos de 8B comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: KL media de 0,06716 frente a BF16 y top-1 del 89,47 % (frente al 100 % en BF16), con 3 de 33 respuestas correctas perdidas.
- El soporte en tt-transformers es inexistente para Granite; cargarlo como Llama produce resultados incorrectos (PCC 0,20 en prefill de 2 capas con la versión BFP8).
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su opción `bfp_bf4` recuantiza los pesos en PyTorch con layout [out, in], lo que puede alterar el comportamiento respecto al empaquetado nativo.
- La validación se realizó en el simulador `ttsim`, no necesariamente en hardware físico Blackhole o Wormhole; el rendimiento real en dispositivo no está documentado.
- No se especifican sesgos conocidos, riesgos de alucinación específicos ni limitaciones de contexto o idioma más allá de las del modelo base, que no se detallan en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de las dependencias de TT-NN/tt-metal.
- El repositorio tiene un tamaño de 16,7 GB, superior al tamaño empaquetado en dispositivo (4,886 GB), por lo que la descarga y el almacenamiento requieren espacio adicional.
- Solo 50 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
