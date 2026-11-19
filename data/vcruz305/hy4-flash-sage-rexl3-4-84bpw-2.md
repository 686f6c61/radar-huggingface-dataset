# vcruz305/Hy4-Flash-SAGE-REXL3-4.84bpw

## Resumen

Hy4-Flash-SAGE-REXL3-4.84bpw es una cuantizacion del modelo `tencent/Hy4-flash`, publicada por el usuario vcruz305. Se trata de una version comprimida a 4,84 bits por peso mediante el cuantizador REXL3 y el metodo propietario SAGE (mixed-precision quantization para EXL3, no publicado) del propio autor. El resultado se distribuye en formato nativo de ExLlamaV3, pensado para inferencia en GPU con un sidecar de pesos Engram que se mapea directamente desde NVMe sin consumir VRAM.

El modelo base, desarrollado por Tencent Hunyuan, es un Mixture-of-Experts de 220.000 millones de parametros totales (155.500 millones sin contar Engram, ViT y el cabezal DFly2) con solo 12.000 millones de parametros activos por token. Acepta entradas de texto e imagen, genera texto y soporta una ventana de contexto de hasta 1.000.000 de tokens. Su columna vertebral de 42 capas combina una capa densa con 41 capas MoE, atencion hibrida (sparse IndexPool y sliding-window intercaladas 1:3), LatentMoE con 16 de 512 expertos enrutados activos, hiper-conexiones identidad (iHC) y embeddings N-gram (Engram) recuperados por hash multi-cabeza.

La relevancia de esta ficha es doble: por un lado documenta una cuantizacion de muy bajo bitrate (4,84 bpw) que mantiene un 96,92% de acuerdo top-1 y un KLD medio de 0,028817 nats frente al profesor BF16, lo que la hace atractiva para desplegar un MoE de 220B en hardware mas modesto; por otro, ilustra las peculiaridades de despliegue de ExLlamaV3 con shards divididos entre GPU y almacenamiento NVMe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (IndexPool sparse + SWA 1:3), LatentMoE, iHC y Engram |
| Parametros totales | 49.867.996.582 en safetensors del repo; el modelo base declara 220B totales (155,5B sin Engram, ViT ni DFly2) |
| Parametros activos | 12B por token (modelo base) |
| Longitud de contexto | Hasta 1.000.000 de tokens (modelo base) |
| Tipos de cuantizacion | EXL3 4,84 bpw (SAGE mixed-precision); routers, proyecciones de atencion, bottlenecks y normas preservados en BF16/F16/F32; Engram en F8_E4M3 con escalas F32 |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | safetensors (ExLlamaV3), 12 shards GPU + 2 shards Engram para mmap NVMe |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 42 capas: una capa densa de feed-forward y 41 capas MoE. Cada token activa 16 de 512 expertos enrutados mas un experto compartido, y los expertos operan en un espacio latente de menor dimension (LatentMoE). La atencion es hibrida: capas de atencion dispersa IndexPool intercaladas con sliding-window attention en proporcion 1:3. Las hiper-conexiones identidad (iHC) gestionan el flujo de informacion entre capas. Ademas, el modelo incorpora embeddings N-gram aprendidos (Engram) de bigramas y trigramas recuperados mediante busquedas hash multi-cabeza, que suman 63,5B parametros. Un encoder de vision adaptado de SigLIP2-So400m-Patch16-Res512 (0,43B) se conecta a la columna vertebral mediante un proyector MLP. El cabezal especulativo DFly2 (0,85B, 5 capas) reutiliza la cache KV y los indices dispersos del modelo objetivo para decodificacion especulativa de bajo coste constante en contexto largo.

Sobre el entrenamiento del modelo base no se proporcionan en la informacion disponible el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. La cuantizacion, por su parte, se genero con el cuantizador REXL3 (encoder trellis CUDA nativo) aplicando el metodo SAGE, que asigna precision mixta y preserva en precision completa los componentes sensibles (routers, `q_a_proj`, `kv_a_proj_with_mqa`, `kv_b_proj`, bottlenecks densos y compartidos, hiper-conexiones y normas). Los shards GPU ocupan 92,90 GiB (99,75 GB) y los shards Engram 60,24 GiB (64,68 GB) en formato F8_E4M3 con escalas F32, alineados a cabecera de 64 bytes para mmap de copia cero.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado `text-generation` y `conversational`.
- Entrada multimodal de texto e imagen, gracias al encoder de vision SigLIP2 integrado en el modelo base.
- Razonamiento de contexto largo: ventana de hasta 1.000.000 de tokens en el modelo base.
- Decodificacion especulativa integrada mediante el cabezal DFly2 de 5 capas, que reutiliza cache KV e indices dispersos.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la model card del base incluye version en chino e ingles, pero no se detalla la cobertura de idiomas).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 1M de tokens de contexto en el modelo base, permite procesar libros completos, expedientes o bases de codigo en una sola pasada sin troceado, manteniendo coherencia entre secciones distantes.
- Procesamiento de imagenes con texto asociado: el encoder SigLIP2 permite extraer informacion de capturas, diagramas o formularios y combinarla con instrucciones textuales en un mismo prompt.
- Despliegue en GPU de gama alta con almacenamiento NVMe: los shards Engram se mapean desde disco sin consumir VRAM, lo que permite servir un MoE de 220B en configuraciones donde no cabria entero en memoria de video.
- Generacion asistida con decodificacion especulativa: el cabezal DFly2 acelera la generacion en contexto largo con coste constante, adecuado para asistentes interactivos con latencia exigente.
- Investigacion sobre cuantizacion extrema: el par top-1 agreement (96,92%) y KLD (0,028817 nats) sirve como referencia para estudiar el impacto de 4,84 bpw en modelos MoE de gran escala.
- Fine-tuning y evaluacion comparativa: al mantener routers y proyecciones de atencion en BF16/F16/F32, la cuantizacion preserva los componentes criticos para experimentos de ajuste o analisis de comportamiento.
- Servicio de chat conversacional: el pipeline `conversational` y la plantilla de chat incluida (`chat_template.jinja`) permiten montar endpoints compatibles con la API de OpenAI sobre ExLlamaV3.

## Benchmarks y rendimiento

Evaluacion de calidad de la cuantizacion frente al profesor BF16 `tencent/Hy4-flash`, medida sobre secuencias retenidas y el vocabulario completo de 120.832 tokens en float64:

| Metrica | Resultado |
|---|---:|
| Acuerdo top-1 | 96,92% |
| KLD medio | 0,028817 nats |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para shards GPU: 92,90 GiB (99,75 GB) en EXL3 4,84 bpw. Los shards Engram (60,24 GiB) se mapean desde NVMe sin ocupar VRAM.
- GPU recomendadas: para alojar los shards GPU completos se necesita una GPU con al menos ~93 GiB de VRAM util, es decir, H100 80GB en configuracion multi-GPU, H200 o aceleradores de mayor memoria. En A100 80GB o RTX 4090 (24 GB) no caben los shards completos en una sola unidad.
- Consumer GPU: no cabe en RTX 4090 ni en GPUs de 24 GB con este formato; requeriria reparto entre varias GPUs o reducir el conjunto de capas cargadas.
- Almacenamiento: se necesita NVMe con al menos 60,24 GiB libres para el sidecar Engram, con acceso mmap de copia cero.
- Opciones de despliegue: ExLlamaV3 (libreria nativa del formato), con soporte upstream en el modelo base para vLLM, SGLang, Transformers y API compatible con OpenAI. El repo incluye `config.json`, `tokenizer.json`, `chat_template.jinja` y `generation_config.json`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hy4-Flash-SAGE-REXL3-4.84bpw (esta ficha) | 220B / 12B (base); 49,87B en safetensors | 1M (base) | tencent-hy-license | safetensors EXL3 | Cuantizacion 4,84 bpw, top-1 96,92% vs BF16 |
| tencent/Hy4-flash (BF16) | 220B / 12B | 1M | tencent-hy-license | safetensors | Modelo original sin cuantizar; referencia de calidad |
| AngelSlim/Hy4-flash-GGUF | 220B / 12B | 1M | tencent-hy-license | GGUF | Variante GGUF del mismo base, para llama.cpp y Ollama |
| Otras alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El metodo SAGE no esta publicado; la model card no detalla el algoritmo de asignacion de precision mixta, lo que dificulta reproducir la cuantizacion.
- Aunque el acuerdo top-1 es alto (96,92%), existe una divergencia del 3,08% respecto al profesor BF16 y un KLD de 0,028817 nats que puede acumularse en generaciones largas o tareas de razonamiento sensible.
- Los shards Engram dependen de NVMe con mmap de copia cero; un almacenamiento lento degradara la latencia de forma notable.
- La licencia `tencent-hy-license` impone condiciones de uso comercial que deben revisarse antes de desplegar en produccion; no es una licencia de codigo abierto estandar.
- No hay informacion sobre sesgos, cobertura de idiomas ni tasas de alucinacion del modelo base.
- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-19), por lo que no hay validacion de la comunidad.
- El numero de parametros reportado en safetensors (49,87B) no coincide con los 220B declarados por el modelo base; probablemente refleja solo parte de los tensores del repo, pero la discrepancia no se explica en la model card.
- No se han publicado benchmarks de tareas para esta cuantizacion; el rendimiento real en MMLU, HumanEval o GSM8K es desconocido.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/vcruz305/Hy4-Flash-SAGE-REXL3-4.84bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Web oficial del modelo base: https://hy.tencent.ai/research/hy4-flash
- GitHub del modelo base: https://github.com/Tencent-Hunyuan/Hy4-flash
- Variante GGUF: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
