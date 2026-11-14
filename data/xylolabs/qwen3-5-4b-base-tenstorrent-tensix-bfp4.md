# Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo base Qwen/Qwen3.5-4B-Base, publicada por Xylolabs, específicamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El objetivo es permitir la inferencia del modelo en hardware de Tenstorrent usando los formatos de coma flotante por bloques nativos de TT-NN (`bfloat4_b` y `bfloat8_b`), de modo que las matrices puedan cargarse en el dispositivo sin transformación de valores.

El modelo base subyacente tiene 5.295.564.288 parámetros reales (según safetensors), lo que lo sitúa en la categoría de 4B nominales, y combina capas de atención clásica con capas Gated DeltaNet (un mecanismo de atención lineal). La cuantización reduce el peso del modelo de lenguaje a aproximadamente 3,28 GB empaquetados, con una media de 6,25 bits por peso, lo que lo hace viable en una sola NPU Tensix con margen para caché KV y buffers.

Es relevante ahora porque demuestra un flujo completo de cuantización GPTQ adaptado a formatos de bloque propietarios (`bfloat4_b`), con verificación de empaquetado exacto en `ttnn`, y porque el ecosistema de Tenstorrent carece todavía de soporte de primera clase para esta arquitectura en tt-transformers. Es, por tanto, una pieza de infraestructura más que un modelo listo para producción conversacional: es un checkpoint base, no ajustado a instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 8 capas de atención (q, k, v, o) y 24 capas Gated DeltaNet (atención lineal), más 32 capas MLP; incluye bloque MTP y torre visual en bf16 |
| Parametros totales | 5.295.564.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) y BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso); media de 6,25 bits por peso; GPTQ con búsqueda de exponente por bloque para BFP4 y round-to-nearest para BFP8 |
| Idiomas soportados | no disponible (calibración en WikiText-2 y Wikipedia en coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (5 shards, repo de 10,6 GB), con `quant4.json` y `model.safetensors.index.json` para el mapeo de formatos |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B-Base emplea una arquitectura híbrida: 8 capas con atención multi-cabeza estándar (proyecciones q, k, v, o) y 24 capas con Gated DeltaNet, un mecanismo de atención lineal con estado recurrente que reduce el coste de contexto largo. Sobre estas se apilan 32 capas MLP con proyecciones gate, up y down. El checkpoint incluye además un bloque MTP (multi-token prediction) y una torre visual (`visual`), ambos mantenidos en bf16 sin cuantizar.

La cuantización se aplica exclusivamente al modelo de lenguaje. Las proyecciones de atención y DeltaNet (q, k, v, z, salida) y las MLP se cuantizan a BFP4 con GPTQ y búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones DeltaNet `a` y `b` se cuantizan a BFP8 con round-to-nearest. El LM head (atado al embedding), el embedding, las normas y el resto de tensores permanecen en bf16, salvo `linear_attn.A_log` y `linear_attn.norm.weight`, que conservan float32. Los tensores BFP se almacenan como valores bf16 sobre la rejilla BFP, de modo que TT-NN los empaqueta sin alterar sus valores; el autor verifica esta propiedad con `pack_tensix.py` y `verify_grid.py`.

## Capacidades

- Generación de texto autoregresiva: es un modelo base preentrenado, por lo que continúa texto; no está ajustado a instrucciones ni sigue directrices de sistema.
- Razonamiento y conocimiento general heredados del modelo base Qwen3.5-4B-Base (sin datos de evaluación publicados en esta exportación).
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text` y el checkpoint conserva la torre visual en bf16, aunque el autor indica que solo cuantizó y evaluó el modelo de lenguaje.
- Predicción multi-token (MTP): el bloque MTP se conserva en bf16, lo que habilita decodificación especulativa si el runtime lo soporta.
- Multilingüismo: no documentado; la calibración incluyó coreano, pero no se declaran idiomas soportados.
- Tool calling y uso como agente: no disponible; al no estar ajustado a instrucciones, no se garantiza el formato de llamadas a herramientas.
- Despliegue en NPU Tensix: empaquetado exacto en `ttnn.bfloat4_b` y `ttnn.bfloat8_b` verificado con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).

## Casos de uso

- Investigación de cuantización en hardware Tenstorrent: sirve como referencia reproducible para validar que un checkpoint GPTQ en BFP4 se empaqueta sin pérdida de valores en TT-NN, usando `pack_tensix.py` y `verify_grid.py` como tests de regresión.
- Prototipado en NPU Wormhole y Blackhole: con 3,28 GB de pesos en DRAM, permite desplegar un modelo de 4B en una sola NPU Tensix y medir latencia y throughput reales del stack tt-metal.
- Evaluación de atención lineal en producción: las 24 capas Gated DeltaNet permiten estudiar el comportamiento de contextos largos con coste de memoria reducido frente a atención cuadrática, comparando con la variante no cuantizada.
- Generación de texto en dominios técnicos: al ser un modelo base, encaja en tareas de continuación y completado (documentación, código, texto científico) donde no se requiere alineamiento conversacional.
- Base para fine-tuning posterior: su licencia Apache-2.0 y su tamaño permiten ajustarlo con LoRA o QLoRA para tareas específicas y volver a exportarlo al formato BFP.
- Benchmarking de formatos de bloque: comparar BFP4 frente a BFP8 en las mismas capas (por ejemplo, DeltaNet `a`/`b` en BFP8 frente al resto en BFP4) para cuantificar la degradación por tipo de tensor.
- Integración en pipelines de CI de hardware: el script de verificación de rejilla con torch (`verify_grid.py`) permite validar exportaciones en máquinas sin NPU antes de desplegar en el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de perplejidad, MMLU, HumanEval ni GSM8K para esta exportación, y señala explícitamente que solo el modelo de lenguaje fue cuantizado y evaluado, sin publicar dicha evaluación.

## Requisitos de hardware

- VRAM/NPU: aproximadamente 3,28 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. La demo de tt-metal se probó con `MESH_DEVICE=P150` sobre Blackhole.
- GPU de consumo: no está diseñado para GPU; el quickstart con `transformers` carga el checkpoint en bf16 (unos 10,6 GB de pesos en disco), lo que requiere una GPU con al menos 12-16 GB de VRAM, pero el formato BFP no aporta ventaja en CUDA.
- Despliegue: TT-NN (ttnn 0.81.1) y la demo de tt-metal `models/demos/blackhole/qwen36`. tt-transformers no soporta esta arquitectura. Para inspección en CPU/GPU se usa `transformers` con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; el autor indica que no se ejecutó una pasada completa en hardware y que la validación se hizo sobre el simulador ttsim.
- Consideración de memoria: la demo de tt-metal re-cuantiza el LM head y el bloque MTP a bfloat8_b; `QWEN36_SPEC=0` permite omitir el bloque MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4 | 5.295.564.288 | no disponible | BFP4/BFP8 para Tensix | Apache-2.0 | Exportación cuantizada, base, sin instrucciones |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | bf16 safetensors | Apache-2.0 | Modelo original sin cuantizar |
| Alternativas de 4B para NPU Tensix | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros checkpoints comparables en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo ajustado a instrucciones: no sigue directrices, no mantiene formato conversacional fiable y no se recomienda para atención al cliente ni agentes sin fine-tuning previo.
- Solo se cuantizó el modelo de lenguaje; la torre visual y el bloque MTP permanecen en bf16 y no fueron evaluados.
- La calibración GPTQ usó únicamente WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo de dominio y de idioma en la calidad de la cuantización.
- El soporte en tt-metal es parcial: tt-transformers no soporta la arquitectura y la demo oficial no lista Qwen3.5-4B; solo se construyeron las capas 0 a 3 y no se completó una ejecución de extremo a extremo.
- Riesgo de alucinación inherente a un modelo base de 4B, sin mitigaciones de alineamiento.
- Longitud de contexto no documentada; no debe asumirse la del modelo base sin verificar `config.json`.
- La licencia Apache-2.0 permite uso comercial, pero el rendimiento en producción no está validado y el checkpoint depende de un stack de software (tt-metal v0.81.1) concreto.
- El repositorio tiene 56 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo Qwen3.5/3.6 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
