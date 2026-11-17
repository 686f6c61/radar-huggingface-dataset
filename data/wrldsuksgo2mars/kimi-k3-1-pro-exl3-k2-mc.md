# wrldsuksgo2mars/Kimi-K3.1-Pro-EXL3-K2-MC

## Resumen

Kimi-K3.1-Pro EXL3 K2-MC es una cuantización comunitaria del modelo multimodal y de mezcla de expertos Kimi-K3.1-Pro de Moonshot AI, publicada por el usuario wrldsuksgo2mars. El checkpoint aplica cuantización EXL3 a 2 bits sobre los expertos enrutados del modelo base (247.296 proyecciones) y ofrece tres variantes del núcleo denso en un único repositorio: el núcleo original en BF16 y dos núcleos compactos EXL3 a 8 y 6 bits. El objetivo es reducir el peso del modelo para hacer viable su despliegue en infraestructura con memoria limitada, manteniendo una única copia de los pesos de expertos compartidos entre las tres vistas.

El modelo conserva la arquitectura original del base: un transformer híbrido de mezcla de expertos con componentes recurrentes KDA, atención DSA (indexer), torre de visión y proyector multimodal. Con 419.519.692.544 parámetros totales y un repositorio de 893,8 GB, está claramente orientado a entornos de servidor con múltiples GPU, no a consumo doméstico. La cuantización se realizó con un fork de GPTQModel y un panel de calibración específico para código, matemáticas y uso de herramientas.

La relevancia de esta ficha radica en que documenta un caso real de cuantización extrema (2 bits en expertos) sobre un modelo de frontera, con decisiones de ingeniería poco habituales como el formato multi-core y la preservación nativa de embeddings, routers y torre de visión. Es un artefacto experimental, con estado de soporte parcial en el runtime de destino, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de mezcla de expertos (MoE) con componentes recurrentes KDA, atención DSA, torre de visión y proyector multimodal; núcleo denso + expertos enrutados |
| Parametros totales | 419.519.692.544 (419,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: EXL3 MCG K2 (2 bits). Núcleo denso: BF16 (vista `original`), EXL3 MCG 8 bits (vista `k8-compact`) o EXL3 MCG 6 bits (vista `k6-compact`). Embeddings, FFN densa de capa 0, routers, normas, componentes KDA, kv_b, mixers de residual de atención, indexer DSA, torre de visión y proyector multimodal se mantienen nativos |
| Idiomas soportados | no disponible (el panel de calibración incluye texto multilingüe, pero no se declara una lista de idiomas) |
| Licencia | `other`, nombre `kimi-k3.1-pro` (heredada del modelo base) |
| Formato de pesos | safetensors, con índices separados por vista (`model.safetensors.index.json` y hermanos `.k8.` / `.k6.`), `config.json`, `quantize_config.json`, `cuteafd-mc.json`; requiere `custom_code` y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de 419,5 mil millones de parámetros que combina atención con indexer DSA (atención dispersa) y componentes recurrentes KDA, además de una torre de visión y un proyector multimodal. La model card de esta cuantización no detalla el número de tokens de entrenamiento original, la composición del dataset del base ni si hubo RLHF o DPO; esos datos corresponden a Moonshot AI y no están recogidos en esta información. Lo que sí se documenta es el proceso de cuantización: 247.296 proyecciones enrutadas codificadas en EXL3 MCG K2, partiendo de los pesos MXFP4 oficiales decodificados a BF16 para calibración, y 926 proyecciones seleccionadas (atención, experto compartido, MoE latente y cabeza de vocabulario) codificadas a K8 o K6 según la vista.

La innovación principal es el formato multi-core: los expertos se almacenan una sola vez (637,0 GiB, ~85,6% del checkpoint en la vista `original`) y se comparten entre las tres vistas de núcleo, de modo que el usuario elige en tiempo de carga entre núcleo BF16 (743,9 GiB totales), K8 (693,9 GiB) o K6 (681,4 GiB). El proceso de cuantización usa GPTQModel con codebook EXL3 MCG (multiplicador `0xCBAC1FED`), semilla 787, regularización de Hessiano sigma 0,025, escalas automáticas y Hessiano con congruencia block-Hadamard con signo (productos FP32 de 128 filas, suma externa FP64, almacenamiento FP32). La calibración empleó 1.426 prompts y 1.201.086 tokens con el tokenizador y plantilla de chat del checkpoint con thinking activado. El runtime de destino es cuteafd, y el soporte upstream de GPTQModel cubre K6 pero no la ampliación K1-K8, que queda en un fork.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base Kimi-K3.1-Pro.
- Procesamiento multimodal: la torre de visión y el proyector multimodal se conservan nativos y se comparten entre las tres vistas de núcleo.
- Modo thinking: la calibración se realizó con la plantilla de chat con thinking habilitado, lo que sugiere soporte de razonamiento extendido en el base.
- Uso de herramientas y function calling: el panel de calibración incluye esquemas de llamadas a funciones, orientado a modelos MoE de código, razonamiento y uso de herramientas.
- Capacidades multilingües: el panel de calibración incluye texto multilingüe, aunque no se declara una lista de idiomas soportados.
- Componentes de atención dispersa (DSA indexer) y recurrentes (KDA) preservados nativamente, lo que mantiene el comportamiento del base en esas rutas.
- No se indexan pesos MTP ni de drafter en este paquete, por lo que no hay decodificación especulativa incluida.

## Casos de uso

- Despliegue de un modelo de frontera en clústeres con memoria limitada: la vista `k6-compact` reduce el payload a 681,4 GiB frente a los 743,9 GiB de la vista BF16, lo que permite ajustar el modelo a nodos con menos VRAM agregada sin recuantizar los expertos.
- Evaluación comparativa de precisiones de núcleo: al compartir los expertos K2 entre vistas, se puede medir el impacto de un núcleo BF16 frente a K8 y K6 sobre el mismo conjunto de expertos, aislando el efecto de la cuantización del núcleo.
- Investigación en cuantización extrema de MoE: el checkpoint documenta con detalle la receta (codebook, semilla, Hessiano, orden de cuantización, manejo de expertos raramente enrutados) y sirve como referencia reproducible para estudiar el límite de 2 bits en expertos.
- Pipelines de código y matemáticas: el panel de calibración está construido con código fuente real, matemáticas resueltas y esquemas de function calling, por lo que el modelo es adecuado para tareas de generación de código y razonamiento matemático en entornos de evaluación.
- Asistentes con uso de herramientas: la preservación nativa de routers y proyecciones de atención mantiene la capacidad de function calling del base, útil para agentes que encadenan llamadas a APIs.
- Procesamiento de documentos con imagen: la torre de visión y el proyector multimodal se conservan en BF16 nativo y se comparten entre vistas, lo que permite tareas de comprensión de imágenes y documentos escaneados sin recuantizar esa ruta.
- Validación de runtimes de cuantización: el paquete incluye recibos de procedencia y validación (`quantization-provenance.json`, `package-validation.json`), útil para verificar la corrección de cargadores EXL3 en desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el payload de tensores es de 743,9 GiB (vista `original`), 693,9 GiB (vista `k8-compact`) y 681,4 GiB (vista `k6-compact`). Son tamaños de payload, no requisitos de VRAM en tiempo de ejecución; el consumo real depende del runtime y de los tensores nativos compartidos.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del payload, requiere agregación de memoria en múltiples GPU de clase数据中心 (A100, H100 u equivalentes); no cabe en una sola GPU consumer.
- GPU consumer: no cabe en ninguna GPU consumer actual, dado que el payload mínimo supera los 681 GiB.
- Opciones de despliegue: runtime cuteafd con soporte de vistas de núcleo MC (`CORE_VIEW=original|k8-compact|k6-compact`, por defecto `original`). La vista `k8-compact` figura como "Planned" en cuteafd. No se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3.1-Pro EXL3 K2-MC (este) | 419,5 mil millones | no disponible | Expertos EXL3 K2; núcleo BF16/K8/K6 | `other` (kimi-k3.1-pro) | Hugging Face, runtime cuteafd |
| moonshotai/Kimi-K3.1-Pro (base) | 419,5 mil millones | no disponible | Pesos originales (MXFP4 en expertos) | `other` (kimi-k3.1-pro) | Hugging Face oficial |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Cuantización a 2 bits en expertos: la pérdida de precisión es extrema y no se publican métricas de degradación frente al modelo base; el impacto en calidad es desconocido.
- Estado de soporte parcial: la vista `k8-compact` figura como "Planned" en cuteafd, y la ampliación K1-K8 del adaptador solo existe en un fork de GPTQModel, no upstream.
- Requiere `trust_remote_code=True` y `custom_code`, lo que implica ejecutar código del repositorio; supone un riesgo de seguridad en entornos no controlados.
- Licencia `other` heredada del base (`kimi-k3.1-pro`): las condiciones de uso comercial dependen del texto de la licencia de Moonshot AI, que no se reproduce aquí; hay que revisarla antes de cualquier despliegue productivo.
- Sin pesos MTP ni drafter: no hay decodificación especulativa incluida, lo que puede reducir el throughput frente al base.
- Idiomas soportados no declarados: no hay lista oficial de idiomas, aunque el panel de calibración incluye texto multilingüe.
- Longitud de contexto no disponible en esta información.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta cuantización; se heredan los del modelo base, no evaluados aquí.
- Repositorio de 893,8 GB: el almacenamiento y la transferencia son costosos, y las tres vistas comparten expertos pero añaden núcleos alternativos en disco.
- Artefacto comunitario con 46 descargas y 0 likes: sin validación independiente amplia; los recibos de validación son del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wrldsuksgo2mars/Kimi-K3.1-Pro-EXL3-K2-MC
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/6d0a0202956796543364d666ab19c6ad1a494ee1/LICENSE
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Runtime cuteafd: https://github.com/tpurtell/cuteafd
- Documentación del formato MC: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Cuantizador GPTQModel (fork): https://github.com/tpurtell/GPTQModel
- PR upstream GPTQModel #3606: https://github.com/ModelCloud/GPTQModel/pull/3606
- PR upstream GPTQModel #3607: https://github.com/ModelCloud/GPTQModel/pull/3607
- PR upstream GPTQModel #3608: https://github.com/ModelCloud/GPTQModel/pull/3608
- PR fork GPTQModel #5 (ampliación K1-K8): https://github.com/tpurtell/GPTQModel/pull/5
