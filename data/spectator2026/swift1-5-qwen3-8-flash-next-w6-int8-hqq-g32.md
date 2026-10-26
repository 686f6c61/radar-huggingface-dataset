# spectator2026/Swift1.5-Qwen3.8-Flash-Next-W6-INT8-HQQ-g32

## Resumen

Este repositorio es una cuantizacion del checkpoint **Swift 1.5 Qwen3.8-Flash-Next**, un ajuste fino orientado a razonamiento eficiente del modelo multimodal Qwen3.8-Flash-Next de Alibaba, publicado por UkisAI. La version aqui descrita la firma el usuario spectator2026 y aplica una receta mixta: expertos enrutados a 6 bits (int6, HQQ con grupos de 32 y plegado SmoothQuant), capas densas y expertos compartidos a int8, y el resto de tensores en BF16, incluidos embeddings, router, normas, torre de vision y la tabla de embeddings n-gram por capa.

El interes es fundamentalmente de despliegue. El checkpoint completo en BF16 ronda los 360 GB; esta version baja a unos 219 GB, de los cuales unos 120 GB estan en este repositorio y unos 99 GB corresponden a los 31 shards de la tabla n-gram que se descargan desde otra publicacion del mismo autor. Con ese reparto, y con KV en fp8, decodificacion especulativa MTP y la tabla n-gram en RAM de host, el modelo cabe en un motor con paralelismo de tensor 2 sobre 2x A100 80 GB bajo vLLM.

No es un modelo nuevo ni un fine-tune: es un artefacto de infraestructura para servir un MoE multimodal de 262.144 tokens de contexto en hardware Ampere. La model card cuantifica la perdida de calidad como divergencia KL frente al BF16 original (0,0228 en wikitext y 0,0873 en conversacion agentica multi-turno), un dato relevante porque el segundo valor es notablemente mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (texto + vision) con atencion hibrida: proyecciones de atencion lineal y atencion completa, mezcladores hyper-connection y capas MTP de borrador; 48 capas principales con 512 expertos enrutados por capa (gate/up/down) mas expertos compartidos |
| Parametros totales | no disponible (el autor indica ~360 GB de checkpoint completo en BF16) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W6A16: int6 g32 HQQ en expertos enrutados; int8 g32 HQQ en proyecciones densas y expertos compartidos; BF16 en embeddings, `lm_head`, router, mezcladores, normas, torre de vision y tabla n-gram; KV cache en fp8 durante el servicio; formato compressed-tensors con dos grupos de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiqueta de HuggingFace: `other`); el repo incluye ademas LICENSE-QWEN (Qwen Community License 1.0) y NOTICE |
| Formato de pesos | safetensors (133 shards en total: 102 en este repo + 31 de la tabla n-gram descargados aparte) |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base; se limita a describir la cuantizacion. Swift 1.5 Qwen3.8-Flash-Next es un ajuste fino de Qwen3.8-Flash-Next que hereda su arquitectura: un MoE multimodal con 48 capas principales, 512 expertos enrutados por capa con proyecciones gate/up/down, expertos compartidos, torre de vision, una tabla de embeddings n-gram por capa (denominada engram en la configuracion de servicio) y capas MTP usadas como cabezas de borrador para decodificacion especulativa. El soporte de atencion lineal junto a atencion completa se deduce de las banderas de servicio (`--mamba-cache-mode align`) y de la tabla de partes cuantizadas, que distingue "attention / linear-attention projections"; el autor no da un diagrama de la arquitectura.

La cuantizacion es "data-light": solo se capturan maximos de activacion, sin Hessians ni ajuste fino de calibracion, y esas estadisticas se tomaron del propio Swift 1.5, no del modelo base. Cada tensor cuantizado pasa por un plegado SmoothQuant (alpha = 0,65 en el par up/down de los expertos) antes de HQQ con grupos de 32. Los expertos enrutados se almacenan como plano bajo empaquetado de 4 bits mas plano alto de 2 bits mas escala fp32 por grupo de 32. Los expertos compartidos se pliegan de forma exacta a traves del SwiGLU; las proyecciones de atencion no se pliegan porque el mezclador hyper-connection situado delante no tiene pareja exacta de plegado. Las capas MTP reciben el mismo tratamiento (expertos int6, atencion y experto compartido int8). El resultado se sirve con un kernel Marlin MoE de 6 bits propio (`osc_w6.so`, compilado para SM80).

## Capacidades

- Generacion de texto y razonamiento con esfuerzo de razonamiento configurable por peticion a traves de la plantilla de chat (el modelo base documenta niveles tipo `xhigh`).
- Entrada de imagen: la torre de vision se mantiene en BF16, por lo que la cuantizacion no toca la via visual; pipeline `image-text-to-text`.
- Tool calling y function calling: el autor configura `--enable-auto-tool-choice` con parser `qwen3_coder` y parser de razonamiento `qwen3`.
- Flujos agenticos multi-turno y multi-paso, con modo de razonamiento y llamadas a herramientas en la misma conversacion.
- Contexto muy largo: 262.144 tokens, con cache de prefijos activada en el servicio de referencia.
- Decodificacion especulativa MTP integrada (3 tokens borrador, 2,65 tokens aceptados por paso de decodificacion).
- Capacidades multilingues: no disponible (la model card no enumera idiomas).
- Capacidades de audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de documentacion tecnica con vision: el modelo acepta imagenes y texto con 262.144 tokens de contexto, de modo que puede recibir capturas de paneles, diagramas de arquitectura o tablas escaneadas junto al texto de un pliego y responder sobre ambos en una sola pasada.
- Agentes de codigo en produccion: con tool calling habilitado y parser `qwen3_coder`, encaja en pipelines que necesitan leer un repositorio, ejecutar herramientas y encadenar varios pasos; el MTP reduce el coste por token generado en esas cadenas largas.
- Atencion al cliente con historial largo: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con todo el historial y documentacion de producto adjunta sin resumir, aunque el KL de 0,0873 en agentica multi-turno aconseja validar la coherencia en este escenario concreto.
- Extraccion estructurada de documentos en lotes: con `--max-num-seqs 32` y 1.832.462 tokens de pool KV por motor, un unico motor TP2 puede mantener decenas de peticiones concurrentes de extraccion sobre PDFs e imagenes.
- Asistentes de investigacion sobre corpus grandes: indexado y respuesta sobre bases de codigo o normativa que no caben en ventanas de 32k-128k, usando cache de prefijos para reutilizar el contexto repetido entre consultas.
- Despliegue on-premise en sectores regulados: al poder ejecutarse en 2x A100 80 GB con pesos en local y sin llamadas a APIs externas, sirve para entornos donde los datos no pueden salir de la infraestructura, siempre que la licencia se revise antes.
- Evaluacion de compromiso calidad/memoria: util para equipos que ya sirven el BF16 y quieren medir la deriva real con la metrica de KL que publica el autor antes de migrar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, Terminal-Bench u otros) en la informacion disponible. Los unicos datos cuantitativos son de fidelidad frente al BF16 y de eficiencia de servicio:

| Metrica | Valor | Condiciones |
|---|---|---|
| Divergencia KL frente a Swift 1.5 BF16 (wikitext) | 0,0228 | Servido con KV en fp8 |
| Divergencia KL frente a Swift 1.5 BF16 (agentica multi-turno) | 0,0873 | Servido con KV en fp8 |
| Tokens aceptados por paso de decodificacion | 2,65 | MTP con k = 3 |
| Pool KV por motor TP2 | 1.832.462 tokens | fp8 KV, GPU memory utilization 0,90 |
| Peso del checkpoint | ~219 GB (~120 GB en este repo + ~99 GB de tabla n-gram) | Frente a ~360 GB en BF16 |

## Requisitos de hardware

- VRAM: el autor dimensiona el modelo para 2x A100 80 GB (160 GB de HBM) con paralelismo de tensor 2, KV en fp8, MTP activo y `--gpu-memory-utilization 0.90`. Los pesos en HBM no son los 219 GB totales: la tabla n-gram (~99 GB) se sirve con `--engram-config '{"cpu_offload": true}'`, de modo que el peso residente en GPU ronda los 120 GB, mas cache KV.
- RAM de host: no disponible como cifra oficial; por diferencia de tamanos hay que prever del orden de 99 GB solo para la tabla n-gram, mas lo que se anada con `KV_OFFLOAD_GIB` si se activa el nivel de KV en RAM.
- GPU recomendadas: A100 80 GB (SM80) es el objetivo explicito, con kernel Marlin MoE de 6 bits precompilado para SM80. H100/H200 no estan documentadas en la informacion disponible; el kernel habria que recompilarlo desde `serving/`.
- GPU de consumo: no cabe. Ni siquiera en una RTX 4090 de 24 GB ni en un equipo de 4 cifras; el minimo practico son 2 aceleradores de 80 GB mas RAM de host abundante.
- Despliegue: vLLM `vllm/vllm-openai:v0.31.0` con el tag de CUDA 13 (la variante `-cu129` falla al importar), imagen fijada por digest, parches en `serving/patches`, script `make_overlays.sh` y `serve.sh`. Configuracion de referencia: TP2, `--dtype bfloat16`, `--kv-cache-dtype fp8`, `--max-model-len 262144`, `--max-num-batched-tokens 6144`, `--max-num-seqs 32`, `--prefix-match-unit 8`, cache de prefijos, `--trust-remote-code`. Variables `OSC_W6_SO=/w6/osc_w6.so`, `OMP_NUM_THREADS=16`.
- Latencia y throughput absolutos: no disponibles (no se publican tokens por segundo). Como referencia relativa, el MTP aporta 2,65 tokens por paso de decodificacion con k = 3.
- Muestreo por defecto: temperatura 1,0, top_p 0,95, top_k 20, min_p 0.
- Otros backends: llama.cpp, Ollama o TGI no estan soportados para este checkpoint segun la informacion disponible (depende del kernel de 6 bits y de los parches de vLLM).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spectator2026/Swift1.5-Qwen3.8-Flash-Next-W6-INT8-HQQ-g32 (este) | no disponible (~360 GB en BF16) | 262.144 | int6 expertos + int8 densas, HQQ g32; ~219 GB | swift-open-license-1.0 | HuggingFace, requiere descargar 31 shards de otro repo; 0 descargas, 0 likes |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base BF16) | no disponible | 262.144 | BF16; ~360 GB | swift-open-license-1.0 | HuggingFace, referencia canonica de calidad |
| spectator2026/Qwen3.8-Flash-Next-W6-INT8-HQQ-g32 | no disponible | no disponible | misma receta, calibrada con el modelo base; ~219 GB | ver LICENSE / LICENSE-QWEN del repo | HuggingFace; ademas aloja los shards de la tabla n-gram |
| Qwen/Qwen3.8-Flash-Next (modelo original) | no disponible | no disponible | BF16 | Qwen Community License 1.0 | HuggingFace; sirve de referencia de capacidades multimodales y contexto largo |

No se dispone de datos de benchmarks que permitan comparar rendimiento de tarea entre estas variantes; la unica comparacion publicada es de divergencia KL entre este checkpoint y su BF16.

## Limitaciones y advertencias

- La licencia es `other` en HuggingFace y el texto aplicable es swift-open-license-1.0, que no se reproduce en la informacion disponible. Hay que leer `LICENSE` y `LICENSE-QWEN` antes de cualquier uso comercial o de redistribucion; el modelo base arrastra ademas la Qwen Community License 1.0.
- El repositorio esta incompleto por diseno: faltan 31 shards (~99 GB) que solo existen en otra publicacion del mismo autor. Sin ese paso de descarga el modelo no carga, y `sha256sum -c SHA256SUMS` es obligatorio para verificar los 133 shards.
- La receta de cuantizacion es data-light (solo maximos de activacion, sin Hessians ni calibracion). Los valores atipicos no vistos en las estadisticas de captura pueden degradar capas concretas sin que exista una validacion por capa publicada.
- La divergencia KL en agentica multi-turno (0,0873) es casi cuatro veces la de wikitext (0,0228). Para flujos de agentes con muchas llamadas encadenadas conviene medir la tasa de exito frente al BF16 antes de sustituirlo.
- El servicio depende de parches propios sobre vLLM v0.31.0, de una imagen fijada por digest y de un kernel de 6 bits compilado para SM80. Cualquier actualizacion de vLLM, de CUDA o el cambio a otra GPU exige recompilar y revalidar; no es un camino soportado por upstream.
- La variante `-cu129` de la imagen falla al importar; solo funciona el tag de CUDA 13.
- No se publican idiomas soportados ni evaluaciones de sesgo. Al ser un fine-tune de un modelo chino con ajuste posterior, el comportamiento en castellano y las tasas de alucinacion no estan medidas en la informacion disponible.
- Riesgo de alucinacion: no cuantificado por el autor; sin benchmarks de tarea no hay referencia para estimarlo.
- Repositorio sin traccion (0 descargas, 0 likes, creado y actualizado el mismo dia): no hay validacion independiente de que las instrucciones de servicio funcionen fuera del entorno del autor.
- El modelo no esta pensado para GPUs de consumo ni para despliegues de un solo acelerador; quien necesite eso debe recurrir a variantes GGUF del modelo base, con perdida de calidad adicional respecto a este checkpoint.

## Enlaces

- Repositorio del modelo: https://huggingface.co/spectator2026/Swift1.5-Qwen3.8-Flash-Next-W6-INT8-HQQ-g32
- Modelo base (fine-tune): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Publicacion hermana con la misma receta y los shards de la tabla n-gram: https://huggingface.co/spectator2026/Qwen3.8-Flash-Next-W6-INT8-HQQ-g32
- Parches de servicio en A100 para vLLM v0.31.0: https://huggingface.co/spectator2026/Qwen3.8-Flash-Next-W6-INT8-HQQ-g32#a100-serving-patches-vllm-v0310
- Notas de servicio (A100): https://huggingface.co/spectator2026/Qwen3.8-Flash-Next-W6-INT8-HQQ-g32#serving-notes-a100--learned-the-hard-way
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante GGUF del modelo base (5 partes, 39,0 GB): https://local-ai-zone.github.io/models/swift-1-5-qwen3-8-flash-next.html
- Ficha de especificaciones de Qwen 3.8 Flash: https://apxml.com/models/qwen-38-flash
- Variante abliterated del modelo base (referencia de terceros, no relacionada con este checkpoint): https://www.abliteratedmodels.org/swift-1.5-qwen3.8-flash-next-gsq-rco-abliterated/
