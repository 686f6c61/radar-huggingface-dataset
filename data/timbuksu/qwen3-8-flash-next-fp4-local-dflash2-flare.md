# timbuksu/Qwen3.8-Flash-Next-FP4-Local-DFlash2-FLARE

## Resumen

Qwen3.8-Flash-Next-FP4-Local-DFlash2-FLARE es un runtime core empaquetado y firmado para el motor Flare, preparado por el usuario timbuksu a partir de dos checkpoints: el modelo cuantizado `nvidia/Qwen3.8-Flash-Next-FP4-Local` (generado con ModelOpt QAD) y el drafter de difusión por bloques `incoai/Qwen3.8-Flash-Next-DFlash2`. No es un modelo entrenado desde cero, sino una distribución lista para servir en una única GPU NVIDIA Blackwell de 96 GiB (arquitectura SM120, `gb202`), con pesos NVFP4/MXFP8, kernels CUDA precompilados y CUDA graphs capturados.

La arquitectura subyacente es un transformer híbrido de 48 capas que alterna bloques Gated DeltaNet con Qwen Sparse Attention, e incluye un MoE de 512 expertos (10 activos más un experto compartido) y hyperconexiones residuales con compuertas. A esto se suma una tabla de embeddings n-gram PLE de 26,82 GiB que se mantiene fuera de la VRAM (en RAM de host o disco), un encoder de visión de 27 capas y un drafter DFlash2 de 5 capas para decodificación especulativa.

Su relevancia es de nicho pero muy concreta: permite servir un modelo multimodal de contexto largo (262.144 tokens) con razonamiento explícito y tool calling en una sola estación de trabajo Blackwell, sin runtime de Python ni compilación en caliente. El precio es una dependencia total del ecosistema Flare/Ignition: Transformers, vLLM, SGLang y llama.cpp no pueden cargar este paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 48 capas: 12 × (3 × Gated DeltaNet + 1 × Qwen Sparse Attention), MoE de 512 expertos, hyperconexiones residuales con compuertas, encoder de visión de 27 capas y drafter DFlash2 de 5 capas |
| Parametros totales | no disponible |
| Parametros activos | 10 expertos activos + 1 experto compartido por token (sobre 512 expertos enrutados); número absoluto no disponible |
| Longitud de contexto | 262.144 tokens (chunk de prefill de 4.096 tokens) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, W4A16 en decode/verify y W4A4 calibrado en prefill; MLPs de visión W4A16), MXFP8 (atención y proyecciones del experto compartido, cuerpo del drafter), BF16 (embeddings, `lm_head`, normas), NVFP4 para la cabeza de vocabulario del drafter |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (`license: other`) |
| Formato de pesos | Pesos NVFP4/MXFP8/BF16 empaquetados para el runtime Flare (kernels CUDA precompilados y CUDA graphs); no compatible con safetensors estándar de Transformers ni con GGUF |

## Arquitectura y entrenamiento

El modelo base es un híbrido recurrente-atencional: 48 capas organizadas en 12 bloques de tres capas Gated DeltaNet seguidas de una capa de Qwen Sparse Attention, con un MoE de 512 expertos del que se activan 10 más un experto compartido por token, y hyperconexiones residuales con compuertas entre bloques. La multimodalidad la aporta un encoder de visión de 27 capas con perfil `qwen`, que acepta imágenes de entre 65.536 y 16.777.216 píxeles con capacidades de parches de 256, 1.024, 4.096 y 16.384. La tabla PLE de n-gramas (26,82 GiB, 28.800.138.240 bytes en disco) queda fuera de la GPU y se sirve desde RAM de host o desde disco con caché de filas calientes.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la documentación proporcionada. Lo que sí está documentado es el pipeline de cuantización y despliegue: cuantización QAD de NVIDIA ModelOpt en precisión mixta, exportación con Ignition fijando relojes de GPU (`--lock-gpu-clocks`), conversión en línea del drafter a MXFP8 y cuantización NVFP4 de su cabeza de propuesta, verificación de las propuestas contra el `lm_head` objetivo en BF16 exacto. La decodificación especulativa usa DFlash2 con `--mtp-only`, anchuras de 1 a 8 (hasta 7 tokens borrador por ronda, selección adaptativa de anchura) y capacidad de 128 tokens especulativos.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito: bloques `` y control de esfuerzo mediante `reasoning_effort` (`xhigh` por defecto, `medium`, `low`), desactivable con `enable_thinking: false`.
- Comprensión de imágenes (pipeline `image-text-to-text`) con resolución configurable entre 65.536 y 16.777.216 píxeles.
- Tool calling con parser XML `QWEN_CODER`, integrable en flujos de agentes.
- Decodificación especulativa nativa con el drafter DFlash2, que acelera la generación sin cambiar la distribución objetivo (verificación contra el `lm_head` en BF16).
- Contexto largo de hasta 262.144 tokens, con paginación de KV cache (64 tokens por página) y snapshots de prefijo compartidos para GDN/QSA/DFlash2.
- Concurrencia de 16 peticiones de texto y 4 de imagen por GPU.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Entrada de vídeo: no cualificada según la model card.

## Casos de uso

- Asistencia sobre documentación técnica extensa: con 262.144 tokens de contexto y snapshots de prefijo, se puede cargar un repositorio o un manual completo y mantener conversaciones multi-turno sin recortar el material de referencia.
- Análisis de imágenes de alta resolución: el rango de hasta 16,7 Mpx y las capacidades de parches grandes permiten procesar planos, capturas de pantalla densas o páginas escaneadas en una sola pasada, útil para extracción de datos estructurados.
- Agentes de código con tool calling: el parser `QWEN_CODER` y el modo thinking con `reasoning_effort` configurable encajan en pipelines de CI/CD donde se necesita razonamiento multi-paso antes de invocar herramientas.
- Despliegue on-premise en estación de trabajo: al caber en una única GPU Blackwell de 96 GiB con 73,18 GiB de memoria cargada, es viable en entornos con requisitos de soberanía de datos sin clúster multi-GPU.
- Generación aumentada por recuperación con contexto largo: el presupuesto de KV cache de 21,24 GiB (1.556.480 tokens en 24.320 páginas) permite mantener muchas sesiones simultáneas con documentos largos.
- Razonamiento con latencia controlada: la decodificación especulativa DFlash2 con anchura adaptativa de hasta 7 tokens por ronda reduce el coste por token en cargas interactivas, y `reasoning_effort: low` recorta la latencia en consultas simples.
- Procesamiento por lotes de imagen y texto: con 4 peticiones de imagen concurrentes y prefill en chunks de 4.096 tokens, se pueden encadenar tareas de descripción, extracción y clasificación sobre lotes moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento medidos que aporta la model card son de memoria y capacidad, no de calidad: 73,18 GiB de memoria GPU cargada (71,7 GiB de pesos y estado inicial, 74 CUDA graphs capturados, 8.372 kernels), 21,24 GiB de presupuesto de KV cache, 24.320 páginas de 64 tokens y 133 slots de snapshot de prefijo compartidos.

## Requisitos de hardware

- GPU objetivo: una única NVIDIA SM120 / `gb202` de 96 GiB. La model card cita explícitamente la RTX PRO 6000 Blackwell Max-Q Workstation Edition, con relojes fijados en la exportación.
- VRAM: 73,18 GiB medidos en carga, más 21,24 GiB de presupuesto de KV cache. No cabe en GPUs de consumo de 24 o 48 GiB.
- RAM de host: 26,82 GiB adicionales si la tabla PLE se mantiene residente en RAM (`--embedding-table-storage ram`); con `--embedding-table-storage disk` y una caché de 2 GiB el consumo de RAM baja, a costa de latencia en el acceso a la tabla.
- Topología: TP=1, sin necesidad de tensor parallelism.
- Despliegue: exclusivamente mediante el runtime Flare (`flare run`). No es cargable en vLLM, SGLang, Transformers ni llama.cpp; para esos motores hay que usar el checkpoint origen `nvidia/Qwen3.8-Flash-Next-FP4-Local`.
- Latencia y throughput: no disponibles como cifras absolutas; la model card solo documenta la configuración de especulación (hasta 7 tokens borrador por ronda, capacidad de 128) y la concurrencia máxima (16 texto / 4 imagen).
- Arranque: la primera ejecución descarga la revisión `gb202`, verifica la firma Ed25519 contra `publisher.json` y exige aceptación interactiva de la clave y del NVIDIA Open Model Agreement; el modo desatendido requiere `--dangerously-accept-publisher` y `--dangerously-approve-key` con la huella SHA-256 indicada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| timbuksu/Qwen3.8-Flash-Next-FP4-Local-DFlash2-FLARE | no disponible (MoE 512 expertos, 10+1 activos) | 262.144 | NVFP4/MXFP8/BF16, solo Flare | NVIDIA Open Model Agreement | Runtime Flare, GPU SM120 96 GiB |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | NVFP4/MXFP8 (ModelOpt QAD) | NVIDIA Open Model Agreement | Checkpoint origen, cargable en motores estándar |
| incoai/Qwen3.8-Flash-Next-DFlash2 | no disponible (drafter de 5 capas) | no disponible | BF16/MXFP8 | no disponible | Drafter para decodificación especulativa |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 (modelo completo) | no disponible | Modelo base original |

La comparación relevante no es de calidad, sino de empaquetado: este repositorio es la variante optimizada para un hardware concreto, mientras que los tres anteriores son las fuentes a partir de las cuales se construye. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Dependencia total del runtime Flare: no es cargable en Transformers, vLLM, SGLang ni llama.cpp. Migrar a otro motor exige volver al checkpoint `nvidia/Qwen3.8-Flash-Next-FP4-Local`.
- Hardware cerrado: solo funciona en SM120 / `gb202` de 96 GiB. No hay soporte documentado para otras arquitecturas ni para multi-GPU.
- La cuantización NVFP4 de los expertos (W4A16 en decode, W4A4 en prefill) y MXFP8 en atención introducen degradación numérica respecto al modelo en BF16; no se han publicado evaluaciones de calidad que la cuantifiquen.
- La tabla PLE de 26,82 GiB en RAM de host añade 26,82 GiB de consumo de memoria del sistema; la alternativa en disco introduce latencia dependiente del almacenamiento.
- Verificación de firma y aceptación de licencia obligatorias en el primer arranque; el modo desatendido requiere pasar flags explícitos (`--dangerously-accept-publisher`, `--dangerously-approve-key`), lo que traslada la responsabilidad de validar la huella al operador.
- Entrada de vídeo no cualificada según la model card.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe sin verificación.
- Licencia NVIDIA Open Model Agreement: conviene revisar las cláusulas de uso comercial y redistribución antes de desplegar en producción.
- Riesgo de alucinación y sesgos: no hay información específica en la documentación proporcionada; aplican los del modelo base Qwen3.8-Flash-Next.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 24 de noviembre de 2026: no hay evidencia de uso en producción ni validación independiente.
- La exportación se realizó con relojes de GPU fijados; el rendimiento puede diferir en equipos con configuración de reloj distinta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/timbuksu/Qwen3.8-Flash-Next-FP4-Local-DFlash2-FLARE
- Checkpoint base cuantizado: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local (revisión `b9ce18a6887e18c089fdea8509a33e63429a3300`)
- Drafter DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2 (revisión `a22a1744e85c17364dcc54a6a420af7135d4c7f6`)
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Papers, blogs, repositorios y demos adicionales: no disponibles en la información proporcionada.
