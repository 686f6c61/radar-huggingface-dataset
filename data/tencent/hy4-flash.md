# tencent/Hy4-flash

## Resumen

Hy4-flash es un modelo de lenguaje multimodal desarrollado por Tencent (familia Hunyuan) que combina un backbone de mezcla de expertos (MoE) con un codificador visual. Con 220.250 millones de parametros totales en safetensors (155,5B del backbone, 63,5B de embeddings Engram, 0,43B del ViT y 0,85B del drafter DFly2), activa aproximadamente 11,3B de parametros de texto mas 0,43B de vision por token. Acepta nativamente entradas de texto e imagen y genera texto.

El modelo esta disenado para maximizar la relacion coste-rendimiento: su naturaleza MoE de activacion dispersa (16 de 512 expertos enrutados por capa, mas un experto compartido) permite un throughput alto con un coste de inferencia bajo en relacion con su tamano total. Incorpora una ventana de contexto de hasta 1.048.576 tokens (1M), lo que lo situa en la categoria de modelos de contexto largo.

Es relevante ahora porque introduce tres cambios arquitectonicos frente a Hy4: atencion hibrida (atencion dispersa IndexPool intercalada con sliding-window attention en proporcion 1:3), LatentMoE (expertos enrutados operando en un espacio latente de menor dimension) y embeddings N-gram (Engram) recuperados mediante hash multi-cabeza. Ademas, incluye un drafter de decodificacion especulativa (DFly2) integrado que reutiliza la cache KV del modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida (dispersa + SWA) y MLA |
| Parametros totales | 220.251.201.958 (220,25B): 155,5B backbone + 63,5B Engram + 0,43B ViT + 0,85B DFly2 |
| Parametros activos | 11,3B texto + 0,43B vision por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No especificados en la informacion disponible; existe un repositorio GGUF de terceros (AngelSlim/Hy4-flash-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license:other) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El backbone linguistico tiene 42 capas: una capa densa feed-forward y 41 capas MoE. El tamano oculto es de 3.072 y el vocabulario de 120.832 tokens. Las conexiones residuales usan iHC (identity Hyper-Connections) con 4 flujos residuales. La atencion combina atencion dispersa (IndexPool, seleccion de hasta 2.048 tokens por seleccion a nivel de grupo) y sliding-window attention (ventana causal de 512 tokens) con el patron de capas 2 dispersas seguidas de 10 bloques de (3 SWA + 1 dispersa), resultando en 12 capas dispersas y 30 SWA. La formulacion de atencion es Multi-head Latent Attention (MLA) con q_lora_rank 1.024 y kv_lora_rank 512, y codificacion posicional MRoPE intercalada para multimodalidad.

El bloque MoE usa LatentMoE: los expertos enrutados operan en un espacio latente de 1.536 dimensiones, con 512 expertos enrutados por capa (16 activados por token) y un experto compartido. Los embeddings N-gram (Engram) anaden representaciones aprendidas de bigramas y trigramas recuperadas mediante 8 cabezas hash por orden, con un vocabulario hash de 10,3M por cabeza y dimension de embedding de 768 por orden, insertadas en las capas 1, 11, 21 y 31. El codificador visual (27 capas, hidden size 1.152, 16 cabezas, parches 16x16, posicion 128x128, merging 2x2) se conecta al backbone mediante un proyector MLP. El drafter DFly2 de 5 capas y 0,85B parametros reutiliza la cache KV y los indices dispersos del modelo objetivo para decodificacion especulativa de coste constante. No se detalla en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto e inferencia conversacional multi-turno.
- Comprension de imagenes (image-text-to-text) mediante el codificador SigLIP2 adaptado.
- Razonamiento y tareas de codigo y agentes (la model card reporta evaluacion interna de BPB en code & agent).
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificacion especulativa integrada (DFly2) para acelerar la generacion.
- Soporte de API compatible con OpenAI segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: con 1M tokens de contexto, el modelo puede procesar informes completos, expedientes o bases de codigo sin fragmentacion, manteniendo coherencia entre secciones.
- Asistentes multimodales: al aceptar imagen y texto de forma nativa, sirve para responder preguntas sobre capturas, diagramas o documentos escaneados en una misma conversacion.
- Generacion de codigo en pipelines: su evaluacion interna en tareas de codigo y agentes sugiere uso en generacion y revision de codigo, con despliegue via vLLM o SGLang.
- Atencion al cliente automatizada: la ventana de 1M tokens y el coste reducido por token (11,3B activos) permiten gestionar historiales largos y multiples sesiones concurrentes con menor coste de GPU.
- Procesamiento de imagenes a escala: el codificador visual integrado permite clasificar, describir o extraer informacion de lotes de imagenes dentro de flujos documentales.
- Despliegue de bajo coste en produccion: el patron MoE con 11,3B activos y el drafter especulativo DFly2 reducen el coste por token frente a modelos densos de tamano comparable, adecuado para servicios de alto volumen.
- Investigacion en contexto largo: util para experimentos de recuperacion y razonamiento sobre corpus de hasta 1M tokens con soporte de decodificacion especulativa de coste constante.

## Benchmarks y rendimiento

La model card menciona resultados de BPB (bits-per-byte) en validacion interna de codigo y agentes, pero los valores numericos no estan incluidos en la informacion proporcionada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 220,25B parametros totales, los pesos en BF16 requieren aproximadamente 440 GB (el repositorio ocupa 440,5 GB). En cuantizacion de 8 bits, en torno a 220 GB; en 4 bits, en torno a 110 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados.
- GPU recomendadas: para BF16 se necesitan multiples aceleradores de 80 GB (A100/H100) en configuracion tensor-parallel; para cuantizaciones de 4 bits podria desplegarse en configuraciones de 2-4 GPU de 80 GB.
- GPU de consumo: no cabe en GPUs de consumo individuales (RTX 4090 de 24 GB) por el tamano total; solo seria viable con cuantizaciones extremas y offloading, no documentado.
- Opciones de despliegue: transformers, vLLM, SGLang y API compatible con OpenAI; existe un repositorio GGUF de terceros (AngelSlim/Hy4-flash-GGUF) para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa DFly2 esta disenada para reducir latencia en contexto largo a coste constante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash (Tencent) | 220,25B | 11,3B texto + 0,43B vision | 1M | Tencent Hy License | Hugging Face, ModelScope, GitCode, GGUF de terceros |
| Hy4 (Tencent) | no disponible | no disponible | no disponible | Tencent Hy License | referencia en la model card |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan tasas ni evaluaciones especificas.
- Idiomas soportados: no disponibles; la model card solo ofrece version en chino e ingles, lo que sugiere foco en esos idiomas, pero no se confirma.
- Licencia: Tencent Hy License (license:other); es necesario revisar los terminos del archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones.
- Contexto: aunque soporta 1M tokens, el rendimiento efectivo en contextos extremos no esta documentado.
- Hardware: el tamano total de 220B hace inviable el despliegue en GPUs de consumo sin cuantizaciones agresivas no documentadas.
- Madurez: el modelo tiene muy pocas descargas y likes en Hugging Face en el momento de la consulta, y la informacion publica es limitada.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-flash
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Web oficial: https://hy.tencent.ai/research/hy4-flash
- GitHub: https://github.com/Tencent-Hunyuan/Hy4-flash
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4-flash
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4-flash
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-flash-GGUF
