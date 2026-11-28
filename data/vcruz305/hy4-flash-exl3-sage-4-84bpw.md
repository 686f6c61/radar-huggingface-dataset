# vcruz305/Hy4-flash-EXL3-SAGE-4.84bpw

## Resumen

Hy4-flash-EXL3-SAGE-4.84bpw es una cuantizacion del modelo `tencent/Hy4-flash`, publicada por el usuario vcruz305. Se trata de una version comprimida a 4,84 bits por peso mediante el cuantizador REXL3 y el metodo propietario SAGE (mixed-precision quantization para EXL3, no publicado). El objetivo es reducir el peso en VRAM de un modelo MoE de gran tamano para hacerlo desplegable en hardware mas modesto, manteniendo una fidelidad alta respecto al maestro BF16.

El modelo base, Hy4-flash de Tencent, es un MoE multimodal de 220.000 millones de parametros totales (incluyendo 63.500 millones de parametros Engram) con solo 12.000 millones activos por token. Acepta entradas de texto e imagen, genera texto y soporta una ventana de contexto de hasta 1M tokens. Su columna vertebral de 42 capas combina una capa densa con 41 capas MoE, atencion hibrida (sparse IndexPool y sliding-window intercaladas 1:3), LatentMoE y embeddings N-gram (Engram), ademas de un cabezal especulativo DFly2 de 5 capas.

La relevancia de esta ficha radica en que la cuantizacion permite ejecutar un modelo de 155.500 millones de parametros no Engram en GPUs con menos VRAM que el BF16 original, a costa de una perdida medida de 96,92% de acuerdo top-1 y 0,028817 nats de KLD medio frente al maestro. Es una opcion practica para inferencia con ExLlamaV3, no para entrenamiento ni fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida y Engram; base: transformer con 42 capas (1 densa + 41 MoE), vision encoder SigLIP2-So400m-Patch16-Res512, drafter DFly2 de 5 capas |
| Parametros totales | 49.867.996.582 (pesos del repo cuantizado); modelo base: 220B totales (155,5B sin Engram/ViT/DFly2, 63,5B Engram, 0,43B ViT, 0,85B DFly2) |
| Parametros activos | 12B por token (modelo base) |
| Longitud de contexto | Hasta 1M tokens (modelo base) |
| Tipos de cuantizacion | EXL3 SAGE-REXL3 a 4,84 bpw; routers, proyecciones de atencion, bottlenecks y normas preservados en BF16/F16/F32; Engram en F8_E4M3 con escalas F32 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (licencia "other", no estandar OSI) |
| Formato de pesos | safetensors (EXL3 + plain shards para GPU; sidecar Engram para mmap NVMe) |

## Arquitectura y entrenamiento

El modelo base Hy4-flash emplea una arquitectura MoE con 42 capas de lenguaje: una capa feed-forward densa y 41 capas MoE con LatentMoE, donde los expertos enrutados operan en un espacio latente de menor dimension. Cada token activa 16 de 512 expertos enrutados mas un experto compartido. La atencion es hibrida: sparse attention (IndexPool) y sliding-window attention (SWA) se intercalan en proporcion 1:3. Ademas, incorpora Hyper-Connections de identidad (iHC) para el flujo de informacion entre capas y embeddings N-gram (Engram) aprendidos de bigramas y trigramas, recuperados mediante busquedas hash multi-cabeza. Un encoder de vision adaptado de SigLIP2-So400m-Patch16-Res512 se conecta a la columna vertebral mediante un proyector MLP, y un drafter DFly2 de 5 capas y 0,85B parametros reutiliza la KV cache y los indices dispersos del modelo objetivo para decodificacion especulativa de contexto largo.

Sobre el entrenamiento del modelo base no se proporcionan en la informacion disponible detalles sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La cuantizacion de esta ficha se genero con el cuantizador REXL3 (encoder CUDA nativo de trellis) y el metodo SAGE, que aplica precision mixta y no esta publicado. Los pesos se dividen en 12 shards GPU de 92,90 GiB (99,75 GB) que cubren 42 capas troncales, lm_head y el cabezal DFly2, y 2 shards sidecar Engram de 60,24 GiB (64,68 GB) en F8_E4M3 con escalas F32, alineados a 64 bytes para mmap zero-copy desde NVMe sin consumir VRAM.

## Capacidades

- Generacion de texto y conversacion multi-turno con pipeline `text-generation`.
- Entrada multimodal de texto e imagen (vision encoder SigLIP2 en el modelo base).
- Razonamiento y respuesta a instrucciones heredados del modelo base.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificacion especulativa mediante el drafter DFly2 integrado, que reutiliza KV cache e indices dispersos.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos largos: con una ventana de hasta 1M tokens, el modelo puede procesar contratos, informes o bases de codigo completas en una sola pasada, resumiendo o extrayendo informacion sin fragmentacion.
- Asistentes conversacionales de contexto extendido: el modelo mantiene el hilo de conversaciones multi-turno largas gracias a la ventana de 1M tokens y a la decodificacion especulativa DFly2, que reduce el coste por token en contextos largos.
- Procesamiento de documentos escaneados con vision: al aceptar imagenes, puede extraer texto y estructura de facturas, formularios o capturas y responder preguntas sobre ellas.
- Despliegue en GPUs de gama alta con VRAM limitada: la cuantizacion a 4,84 bpw reduce el peso en GPU a 92,90 GiB, permitiendo ejecutar el modelo en configuraciones donde el BF16 no cabria, usando ExLlamaV3.
- Inferencia de bajo coste por token: con 12B parametros activos por token, el coste computacional por generacion es mucho menor que el de un modelo denso de 155B, adecuado para servicios de generacion a escala.
- Recuperacion aumentada (RAG) sobre corpus extensos: la combinacion de contexto de 1M tokens y busquedas Engram permite inyectar grandes volumenes de contexto recuperado sin truncar.
- Prototipado e investigacion: al ser una cuantizacion con metricas de fidelidad publicadas (96,92% top-1, KLD 0,028817), sirve para experimentar con el modelo base en entornos con menos recursos antes de pasar a BF16.

## Benchmarks y rendimiento

La model card de la cuantizacion solo publica metricas de fidelidad frente al maestro BF16, no benchmarks de tareas:

| Metrica | Resultado |
|---|---:|
| Acuerdo top-1 | 96,92% |
| KLD medio | 0,028817 nats |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta cuantizacion ni para el modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 92,90 GiB (99,75 GB) para los shards GPU EXL3 + plain; los shards Engram (60,24 GiB / 64,68 GB) se mapean desde NVMe por mmap zero-copy y no consumen VRAM.
- GPU recomendadas: se requiere una GPU con al menos ~93 GiB de VRAM utilizable, lo que apunta a H100 80GB en configuracion multi-GPU, H200 141GB, A100 80GB en multi-GPU o GPUs con 96GB o mas. No cabe en una RTX 4090 (24GB) ni en consumer GPU de 24-48GB.
- Cabe en consumer GPU: no, segun el tamano de los shards GPU.
- Almacenamiento: el repo ocupa 164,5 GB; se necesita NVMe rapido para el mmap de los shards Engram.
- Opciones de despliegue: ExLlamaV3 (libreria del repo); el modelo base soporta vLLM y SGLang, y existe una version GGUF en `AngelSlim/Hy4-flash-GGUF`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hy4-flash-EXL3-SAGE-4.84bpw (esta ficha) | 49,87B en repo (base 220B) | 12B (base) | 1M | EXL3 4,84 bpw | tencent-hy-license | Hugging Face, 191 descargas |
| tencent/Hy4-flash (BF16) | 220B (incl. 63,5B Engram) | 12B | 1M | BF16 | tencent-hy-license | Hugging Face, ModelScope, GitCode |
| AngelSlim/Hy4-flash-GGUF | no disponible | 12B (base) | no disponible | GGUF | tencent-hy-license | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de fidelidad: 96,92% de acuerdo top-1 y KLD medio de 0,028817 nats frente al maestro BF16; puede degradar tareas sensibles a la precision.
- El metodo SAGE no esta publicado, por lo que no es posible auditar ni reproducir el proceso de cuantizacion.
- La licencia tencent-hy-license no es una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial.
- Los idiomas soportados no estan documentados en la informacion disponible, lo que impide garantizar cobertura multilingue.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni comportamiento en produccion de esta cuantizacion.
- El despliegue requiere ExLlamaV3 y una GPU con ~93 GiB de VRAM; no es viable en hardware de consumo.
- Los shards Engram dependen de mmap desde NVMe, por lo que el rendimiento puede verse afectado por la velocidad del almacenamiento.
- El repo tiene solo 191 descargas y 3 likes, lo que indica una validacion comunitaria limitada.
- No se han publicado benchmarks de tareas para verificar el rendimiento real mas alla de la fidelidad respecto al maestro.

## Enlaces

- [Hugging Face: vcruz305/Hy4-flash-EXL3-SAGE-4.84bpw](https://huggingface.co/vcruz305/Hy4-flash-EXL3-SAGE-4.84bpw)
- [Modelo base: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)
- [Sitio oficial de Hy4-flash](https://hy.tencent.ai/research/hy4-flash)
- [GitHub: Tencent-Hunyuan/Hy4-flash](https://github.com/Tencent-Hunyuan/Hy4-flash)
- [GGUF: AngelSlim/Hy4-flash-GGUF](https://huggingface.co/AngelSlim/Hy4-flash-GGUF)
- [ModelScope: Tencent-Hunyuan/Hy4-flash](https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash)
- [GitCode: tencent_hunyuan/Hy4-flash](https://ai.gitcode.com/tencent_hunyuan/Hy4-flash)
