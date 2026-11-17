# zouaynib/Beam-1.0-501B-A23B-MXFP4

## Resumen

Beam-1.0-501B-A23B-MXFP4 es una cuantizacion en formato MXFP4 (OCP Microscaling FP4) del modelo Mixture-of-Experts reflection/Beam-1.0-501B-A23B, publicada por el usuario zouaynib. El modelo original es un transformer MoE de 501B parametros nominales (254.642.537.152 parametros reales segun los pesos safetensors) con 23B parametros activos por token, contexto de hasta 1M tokens y capacidades de razonamiento extendido. Su proposito es hacer viable el despliegue del modelo completo en hardware AMD Instinct, ya que los checkpoints oficiales en BF16 (1 TB) y FP8 (506 GB) no caben en dos aceleradores MI300X con sus 384 GB de HBM.

La cuantizacion reduce el checkpoint a 278 GB, permitiendo servir los 501B parametros en 2 GPU MI300X con tensor parallelism 2 y dejar espacio para una cache KV de aproximadamente 1,08M tokens, suficiente para explotar la ventana completa de 1M tokens del modelo. Solo se cuantizan los expertos enrutados (el 98,3% de los parametros); atencion, router, embeddings, normas y las tres capas MLP densas permanecen en BF16, replicando la receta del checkpoint oficial NVFP4.

Es relevante ahora porque demuestra que un modelo frontera de razonamiento de escala 500B puede servirse en un nodo de dos GPU AMD, con perdida de precision medida y acotada (KL medio de 0,0246 frente a BF16 y 96,2% de acuerdo top-1), y con resultados en benchmarks de razonamiento cercanos a los del modelo original. Ademas, el autor publica variantes podadas al 40% de expertos que caben en una sola MI300X.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (49 capas MoE, 256 expertos enrutados por capa, 3 capas MLP densas) |
| Parametros totales | 254.642.537.152 (nominal 501B) |
| Parametros activos | 23B (A23B, segun nomenclatura del modelo base) |
| Longitud de contexto | 1M tokens (1.015.098 tokens verificados en needle-in-a-haystack) |
| Tipos de cuantizacion | MXFP4 (FP4 E2M1 con escala E8M0 compartida por bloque de 32 pesos, 4,25 bits/peso) en expertos enrutados; BF16 en atencion, MLP densas, embeddings y lm_head; router en FP32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, 8-bit (tag), tamano del repo 278,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con 52 capas en total, de las cuales 49 son capas MoE con 256 expertos enrutados cada una (gate/up/down) y 3 son capas MLP densas. La atencion incluye q/k/v/o y una compuerta de salida, y el router opera en FP32. El modelo soporta un modo de razonamiento configurable mediante el parametro `reasoning_effort` (valores observados: `max` y `low`) y una ventana de contexto de hasta 1M tokens. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion es la cuantizacion MXFP4 de los expertos: cada bloque de 32 pesos elige entre dos exponentes compartidos (el menor que evita recorte y el siguiente inferior, que recorta los valores mayores pero ofrece resolucion mas fina) el que minimiza el error cuadratico, lo que aporta aproximadamente 0,5 dB de SQNR sobre el esquema OCP estandar. El SQNR de los pesos de experto es de 19,0 dB en las 49 capas MoE (media 19,03 dB en gate/up, 19,00 dB en down, peor caso 18,94 dB). La cuantizacion se valido ejecutando copias BF16 y MXFP4 de los estados ocultos en paralelo a traves de las 52 capas sobre 65.504 tokens. El despliegue recomendado usa vLLM con el kernel Triton W4A16 MoE de AITER y el backend de atencion `TRITON_ATTN`.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso con modo de pensamiento extendido (`reasoning_effort=max`).
- Razonamiento matematico de competicion (AIME) y cientifico de nivel avanzado (GPQA-Diamond).
- Generacion y comprension de codigo, incluyendo codigo escrito despues de la fecha de corte del modelo base.
- Recuperacion de informacion en contextos muy largos: needle-in-a-haystack verificado hasta aproximadamente 1M tokens.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Analisis de repositorios y bases de codigo completas: con 1M tokens de contexto, el modelo puede ingerir arboles de codigo extensos y responder preguntas cruzadas entre ficheros; el checkpoint cuantizado mantiene perplexity de 2,074 en codigo vLLM posterior a su corte de entrenamiento.
- Razonamiento matematico y cientifico asistido: adecuado para pipelines de resolucion de problemas que requieran cadenas de pensamiento largas (hasta 32k-64k tokens de presupuesto de respuesta), con precision medida del 95,8-96,7% en AIME 2026.
- Revision documental de gran volumen: contratos, expedientes o informes de cientos de miles de tokens, aprovechando la recuperacion verificada a profundidades del 10%, 50% y 90% en prompts de hasta 524k tokens.
- Despliegue on-premise en infraestructura AMD: organizaciones con nodos MI300X que necesiten un modelo frontera sin depender de hardware NVIDIA; dos GPU con TP2 bastan para el modelo completo.
- Servicio de inferencia por lotes de alto rendimiento: con 128 peticiones concurrentes alcanza 1.462 tokens/s de salida agregados, adecuado para generacion masiva de resumenes o respuestas.
- Evaluacion y experimentacion en investigacion: las trazas de evaluacion publicadas y las metricas de cuantizacion por capa y por experto permiten reproducir y auditar el impacto de la cuantizacion FP4.
- Prototipado en una sola GPU: las variantes podadas al 40% (172 GB) permiten servir una version degradada del modelo en una unica MI300X para desarrollo y pruebas.

## Benchmarks y rendimiento

Precision, con los ajustes de evaluacion de Reflection (`reasoning_effort=max`, T=0,7, top_p=0,99, presupuesto de 32k tokens):

| Benchmark | BF16 (reportado) | NVFP4 (reportado) | MXFP4 (este repo) | Muestras |
|---|---|---|---|---|
| AIME 2026 | 97,7% | 97,5% | 95,8% | 30 x 4 |
| GPQA-Diamond | 90,6% | 89,3% | 89,4% | 198 x 2 |

Con presupuesto ampliado a 64k tokens en las respuestas truncadas: AIME 95,8% → 96,7%; GPQA 89,4% → 90,4%.

Distancia respecto a BF16 (65.504 tokens, bloques de 2.048):

| Dominio | KL(BF16 ‖ MXFP4) | Acuerdo top-1 | Perplexity MXFP4 |
|---|---|---|---|
| Matematicas con formato chat (MATH-500) | 0,0073 | 98,1% | 2,197 |
| Codigo (fuentes vLLM) | 0,0080 | 97,6% | 2,074 |
| Wikitext-2 | 0,0415 | 94,6% | 2,239 (BF16 ≈ 2,17) |
| Global | 0,0246 | 96,2% | no disponible |

Throughput en 2x MI300X (prompts de 1k tokens, salidas de 1k tokens):

| Peticiones concurrentes | Tokens/s de salida (total) | TTFT mediana | Tiempo mediano por token |
|---|---|---|---|
| 1 | 85 | 0,24 s | 10,6 ms |
| 8 | 305 | 1,88 s | 24,1 ms |
| 32 | 655 | 5,48 s | 43,7 ms |
| 64 | 988 | 2,38 s | 59,5 ms |
| 128 | 1.462 | 3,20 s | 77,9 ms |

Contexto largo: 32k tokens x 4 concurrentes, 19,2 ms por token de salida; prompt de 120k tokens, 14,8 ms por token de salida y 25,5 s hasta el primer token. Con el backend por defecto ROCM_ATTN, el caso de 120k tokens tarda 313,5 ms por token (21,2x mas lento).

## Requisitos de hardware

- VRAM: 278 GB de pesos; el despliegue de referencia usa 2x AMD Instinct MI300X (384 GB de HBM) con TP2, dejando espacio para una cache KV de aproximadamente 1,08M tokens.
- GPU recomendadas: AMD Instinct MI300X (2 unidades); MI355X (gfx950) dispone de computo FP4 nativo, mientras que MI300X/MI325X usan kernels W4A16. No cabe en GPU de consumo.
- Despliegue: vLLM sobre ROCm con AITER y el kernel Triton W4A16 MoE; obligatorio usar `--attention-backend TRITON_ATTN` para contextos largos.
- Alternativa de una sola GPU: variantes Pruned40-REAP y Pruned40-Freq (172 GB, 152 de 256 expertos por capa) para una MI300X.
- Latencia y throughput: 85 tokens/s con una peticion y 1.462 tokens/s agregados con 128 concurrentes; 10,6 ms por token en el caso de una peticion.
- No se documenta soporte en la informacion disponible para llama.cpp, Ollama, TGI ni GPUs NVIDIA con este checkpoint MXFP4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Hardware minimo | Licencia |
|---|---|---|---|---|---|
| Beam-1.0-501B-A23B-MXFP4 (este repo) | 254,6B reales (501B nominal, 23B activos) | 1M | MXFP4, 278 GB | 2x MI300X | Apache 2.0 |
| Beam-1.0-501B-A23B BF16 (oficial) | 501B (23B activos) | 1M | BF16, 1.003 GB | 8x MI300X (segun el autor) | Apache 2.0 |
| Beam-1.0-501B-A23B FP8 (oficial) | 501B (23B activos) | 1M | FP8, 506 GB | 4x MI300X (segun el autor) | Apache 2.0 |
| Beam-1.0-501B-A23B NVFP4 (oficial) | 501B (23B activos) | 1M | NVFP4, ~280 GB | NVIDIA Blackwell | Apache 2.0 |
| Beam-1.0-501B-A23B-MXFP4-Pruned40 (REAP/Freq) | 40% de expertos podados | 1M (no verificado) | MXFP4, 172 GB | 1x MI300X | Apache 2.0 |

No se dispone de datos de benchmarks de modelos de otras familias para una comparacion cruzada en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: KL global de 0,0246 frente a BF16, con mayor degradacion en texto general (Wikitext-2, KL 0,0415, perplexity 2,239 frente a ~2,17 en BF16) que en matematicas y codigo.
- Las respuestas que agotan el presupuesto de tokens se puntuan como incorrectas: en AIME, las 5 fallas fueron truncamientos a 32k tokens, no errores de razonamiento; en GPQA, 10 truncamientos.
- Los recuentos de muestras son reducidos (30 x 4 en AIME, 198 x 2 en GPQA), por lo que diferencias de 1-2 puntos respecto a las cifras reportadas estan dentro del ruido.
- En needle-in-a-haystack se registraron 2 fallos de 12 pruebas (prompt de 262k tokens a 10% de profundidad y prompt de 1M tokens a 90% de profundidad, sin respuesta en 2.048 tokens), lo que indica que la recuperacion a contexto maximo no es perfecta.
- Idioma: solo ingles declarado; no hay evidencia de rendimiento en castellano.
- Dependencia fuerte de hardware y software AMD: requiere ROCm, vLLM con AITER y el backend `TRITON_ATTN`; con el backend por defecto la decodificacion en contexto largo se degrada hasta 21x.
- El rendimiento FP4 nativo solo esta disponible en MI355X (gfx950); en MI300X se ejecutan kernels W4A16, con el coste asociado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; aplican los del modelo base, no evaluados aqui.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias sobre el comportamiento del checkpoint cuantizado.
- Las variantes podadas al 40% sacrifican calidad y no tienen resultados de needle-in-a-haystack publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Variante podada REAP: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-REAP
- Variante podada Freq: https://huggingface.co/zouaynib/Beam-1.0-501B-A23B-MXFP4-Pruned40-Freq
- Space de demostracion: https://huggingface.co/spaces/zouaynib/beam-mxfp4-mi300x
- Trazas de evaluacion: https://huggingface.co/datasets/zouaynib/Beam-1.0-501B-A23B-MXFP4-eval-traces
- Metricas de cuantizacion por capa y experto: `quantization_metrics.json` (incluido en el repositorio del modelo)
