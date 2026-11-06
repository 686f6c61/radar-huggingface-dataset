# wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6

## Resumen

Muse Spark Open EXL3 K4 + Core K6 es una cuantizacion de 4 bits del checkpoint multimodal `meta-models/Muse-Spark-Open-816B-A42B`, publicada por el usuario `wrldsuksgo2mars`. El modelo base es un transformer multimodal de tipo image-text-to-text con mezcla de expertos (MoE), disenado para conversacion y tareas agenticas. La cuantizacion reduce el peso de los pesos de 428 GB en BF16 a un payload de 427.855.788.244 bytes (398,47 GiB) distribuido en 63 shards y 193.459 tensores, aplicando EXL3 MCG con anchos de bit mixtos: K6 para las matrices de atencion y proyecciones densas, y K4 para los expertos enrutados.

La relevancia de esta ficha radica en que es una de las pocas publicaciones que documenta de forma exhaustiva el proceso de cuantizacion de un modelo MoE de gran escala: incluye configuracion de almacenamiento por tensor (`quantize_config.json:tensor_storage`), evidencia numerica por modulo (`quantization-errors/`) y procedencia de calibracion (`quantization-provenance.json`). No obstante, el propio autor advierte de que el trabajo no ha validado la generacion completa del modelo, la calidad en contexto largo ni el rendimiento en serving.

El checkpoint conserva integramente las torres de vision y audio, las normas, los routers y los embeddings en BF16/F32, por lo que requiere un runtime con soporte nativo de EXL3 MCG K4/K6 ademas de los componentes nativos de Muse. La licencia es la Muse Model License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); sin MTP ni shared expert |
| Parametros totales | 213.797.758.848 (~214B) |
| Parametros activos | 42B (segun el identificador del modelo base A42B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 MCG K6 (atencion y proyecciones densas), EXL3 MCG K4 (expertos enrutados); BF16/F32 para normas, routers, embeddings y torres de vision/audio |
| Idiomas soportados | no disponible |
| Licencia | Muse Model License (`license: other`) |
| Formato de pesos | safetensors (63 shards, 193.459 tensores) |
| Tamano del repo | 428,0 GB |
| Payload total | 427.855.788.244 bytes (398,47 GiB) |
| Modelo base | meta-models/Muse-Spark-Open-816B-A42B (revision `0fb02478b02565b2ce7fc57e6051c91172774ac9`) |
| Dataset de calibracion | wrldsuksgo2mars/agentic-quant-panel-v1 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 62 capas y 213,8B parametros totales, de los cuales 42B estarian activos por token segun el identificador del checkpoint original. La cuantizacion preserva la estructura nativa de Muse: normas y gating de atencion, routing de expertos, residual gates y normas por experto. No hay MTP (multi-token prediction) ni shared expert en esta variante.

El proceso de cuantizacion emplea EXL3 MCG con multiplicador `0xCBAC1FED`, escalas de salida automaticas, semilla 787 y sigma 0,025. Los operandos K6 completos usan `sharded_side=1`. La fuente `gate_up_proj` de cada experto se divide en el eje de salida 1 tras seleccionar el eje de experto 0: filas 0..4095 para `gate_proj` y filas 4096..8191 para `up_proj`. El `lm_head` tiene 202.048 salidas logicas y 202.112 almacenadas, con las ultimas 64 filas/escalas a cero, que el runtime recorta antes del softcap final original.

La calibracion se realizo sobre el panel agentico publico `wrldsuksgo2mars/agentic-quant-panel-v1` usando la plantilla de chat y el tokenizer del propio checkpoint. Se aplico una pasada causal entrelazada que propaga los pesos predecesores serializados/reconstruidos antes de calibrar cada sucesor, y las entradas de `down` siguen la activacion no lineal reconstruida de `gate/up`. Todo el trabajo se ejecuto en una unica GPU (RTX PRO 6000 Blackwell, GPU 0 de "raptor"). La validacion comparo byte a byte todos los tensores retenidos contra el origen y verifico formas, escalas, multiplicador, inventario y tamanos de payload. Las torres de vision y audio se conservaron sin calibrar ni cuantizar.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base image-text-to-text.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con torre de vision preservada en BF16/F32.
- Procesamiento de audio, con torre de audio preservada en BF16/F32.
- Razonamiento agentico: el modelo base esta orientado a tareas de agente y el panel de calibracion es de naturaleza agentica.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue multimodal en produccion con requisitos de memoria reducidos: la cuantizacion K4/K6 rebaja el payload a 398,47 GiB, lo que permite servir un MoE de 214B en infraestructura con menos VRAM que el checkpoint BF16 original, siempre que el runtime soporte EXL3 MCG nativo.
- Investigacion sobre cuantizacion de MoE: el repositorio incluye `quantize_config.json:tensor_storage`, `quantization-provenance.json` y `quantization-errors/`, lo que lo convierte en un caso de estudio reproducible para evaluar el impacto de K4 en expertos frente a K6 en atencion.
- Asistentes conversacionales con entrada de imagen: la torre de vision se mantiene intacta en BF16/F32, por lo que se puede usar para descripcion de imagenes, VQA o extraccion de informacion de documentos escaneados sin degradacion por cuantizacion en el encoder visual.
- Pipelines de agentes con contexto multimodal: el modelo base esta disenado para uso agentico, y la calibracion se hizo sobre un panel agentico, lo que lo hace candidato para orquestacion de tareas con herramientas y observaciones visuales.
- Transcripcion y comprension de audio en combinacion con texto: la torre de audio preservada permite integrar el modelo en flujos de reunion o analisis de llamadas, aunque el autor no valido la calidad de estas rutas tras la cuantizacion.
- Benchmarking de runtimes EXL3: util para validar implementaciones de MCG K4/K6 en kernels de atencion y expertos enrutados, comparando latencia y fidelidad numerica contra el checkpoint BF16.
- Evaluacion de fidelidad de cuantizacion: los datos de `quantization-errors/` permiten medir la deriva numerica por modulo antes de comprometer recursos en un despliegue completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el trabajo de cuantizacion no ha cualificado la generacion completa del modelo, la calidad en contexto largo ni el rendimiento en serving.

## Requisitos de hardware

- VRAM estimada: el payload de pesos es de 398,47 GiB; a ello hay que sumar el overhead de activaciones, KV cache y buffers del runtime. No cabe en GPUs de consumo.
- GPU recomendadas: el autor uso una RTX PRO 6000 Blackwell (96 GB) para el proceso de cuantizacion, no para inferencia completa. Para servir el modelo completo se requiere un nodo multi-GPU de clase A100/H100/H200 o similar con al menos 400 GB agregados solo para pesos.
- Cabe en consumer GPU: no. El checkpoint completo no es desplegable en RTX 4090 (24 GB) ni en GPUs de 48 GB.
- Opciones de despliegue: se requiere un runtime con soporte nativo de EXL3 MCG K4/K6 y de los componentes nativos de Muse (atencion, routing, residual gates, normas por experto). vLLM, llama.cpp, Ollama o TGI no estan confirmados como compatibles en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Spark Open EXL3 K4 + Core K6 | 213,8B totales / 42B activos | no disponible | EXL3 MCG K4/K6 + BF16/F32 parcial | Muse Model License | Hugging Face (29 descargas) |
| Muse-Spark-Open-816B-A42B (base) | 213,8B totales / 42B activos | no disponible | BF16 | Muse Model License | Hugging Face |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables verificables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que el trabajo no ha cualificado la generacion completa del modelo, la calidad en contexto largo ni el rendimiento en serving; no hay garantia de que el checkpoint produzca salidas coherentes.
- Las torres de vision y audio se preservaron pero no se calibraron ni cuantizaron en este job; su comportamiento en el checkpoint final no ha sido validado.
- Requiere un runtime con soporte nativo de EXL3 MCG K4/K6; sin el, el checkpoint no es cargable.
- Licencia Muse Model License con `license: other`: es necesario revisar `LICENSE.md` y `USE_POLICY.md` del modelo base antes de cualquier uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan del modelo base, no evaluados tras la cuantizacion.
- Idiomas soportados no declarados en la model card.
- Longitud de contexto no declarada.
- El `lm_head` almacena 64 filas/escalas a cero que el runtime debe recortar antes del softcap final; un runtime que no lo haga puede producir salidas incorrectas.
- Modelo con muy baja adopcion (29 descargas, 0 likes) y publicado en 2026-11-01; no hay evidencia de la comunidad sobre su estabilidad.

## Enlaces

- [Hugging Face: wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6](https://huggingface.co/wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6)
- [Arbol de archivos del repositorio](https://huggingface.co/wrldsuksgo2mars/Muse-Spark-Open-EXL3-K4-Core-K6/tree/main)
- [Modelo base: meta-models/Muse-Spark-Open-816B-A42B](https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B)
- [Licencia del modelo base](https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/0fb02478b02565b2ce7fc57e6051c91172774ac9/LICENSE.md)
- [Dataset de calibracion: wrldsuksgo2mars/agentic-quant-panel-v1](https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1)
