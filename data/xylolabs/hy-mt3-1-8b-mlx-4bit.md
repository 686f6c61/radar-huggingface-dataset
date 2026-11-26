# Xylolabs/Hy-MT3-1.8B-MLX-4bit

## Resumen

Hy-MT3-1.8B-MLX-4bit es una cuantizacion en 4 bits del modelo de traduccion Tencent Hy-MT3-1.8B, convertida al formato MLX para su ejecucion sobre Apple Silicon mediante la libreria `mlx-lm`. El trabajo lo publica Xylolabs, que parte de los pesos originales de Tencent y aplica cuantizacion afin por grupos (group size 64) con escalas y sesgos en float16, manteniendo ciertas proyecciones criticas a 6 bits para preservar calidad.

El modelo base es un transformer denso de 1.791.080.448 parametros (1,8B) especializado en traduccion automatica, con soporte declarado para 102 idiomas y una ventana de contexto que el autor de la cuantizacion documenta hasta 256K tokens en la variante de 8 bits. La relevancia de esta ficha radica en que ofrece traduccion multilingue de alta cobertura en un paquete de 1,04 GB que cabe en cualquier Mac moderno con memoria unificada, algo poco habitual en la categoria de traduccion neuronal.

La licencia Apache 2.0 del modelo base se hereda en esta cuantizacion, lo que permite uso comercial sin restricciones adicionales conocidas. No obstante, al ser un modelo especializado en traduccion y no un modelo conversacional general, sus capacidades fuera de esa tarea son limitadas por diseno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia `hunyuan_v1_dense`) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun la tabla de hardware del autor de la cuantizacion) |
| Tipos de cuantizacion | MLX affine 4-bit (group size 64); proyecciones `mlp.down_proj` y `self_attn.v_proj` en capas 0-3 y 28-31 a 6-bit; variante 8-bit disponible en repo separado |
| Idiomas soportados | 102 idiomas, entre ellos es, en, zh, fr, de, it, pt, ru, ar, hi, ja, ko, vi, tr, nl, pl, uk, fa, ur, th, id, ms, he, el, sv, da, fi, nb, cs, ro, hu, bg, hr, sk, sl, lt, lv, et, ca, gl, eu, cy, ga, gd, is, sq, mk, sr, bs, af, sw, am, so, yo, zu, yue, bo, mn, kk, ky, uz, tg, tk, az, ka, hy, ne, si, ta, te, kn, ml, mr, gu, pa, bn, or, as, km, my, lo, jv, su, ceb, war, tl, mg, ht, lb, mt, eo, sa, yi, ku, ckb, ps, sd |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (compatible con `mlx-lm`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer densa identificada en los metadatos como `hunyuan_v1_dense`, es decir, la variante densa de la familia Hunyuan de Tencent. La cuantizacion de Xylolabs aplica cuantizacion afin por grupos de tamano 64 sobre todos los pesos lineales y el embedding de tokens (incluida la LM head), con la excepcion de `mlp.down_proj` y `self_attn.v_proj` en las capas 0-3 y 28-31, que se mantienen a 6 bits. Las capas de normalizacion permanecen en float16. Este esquema mixto busca limitar la degradacion en las capas de entrada y salida, donde los errores de cuantizacion suelen amplificarse.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del corpus ni el uso de RLHF o DPO en la informacion proporcionada; esos datos corresponderian a la model card del modelo base de Tencent, no incluida aqui. La innovacion tecnica destacable de esta publicacion es precisamente el pipeline de cuantizacion MLX con evaluacion de divergencia KL frente a BF16 sobre WikiText-2, datos de chat y texto reservado, ademas de chrF++ sobre 1.200 segmentos de WMT24++ en seis direcciones.

## Capacidades

- Traduccion automatica multilingue entre 102 idiomas, con calidad medida mediante chrF++ en seis direcciones (en-zh, zh-en, en-ko, ko-en, en-ja, ja-en).
- Traduccion con instrucciones en prompt: el ejemplo oficial usa la plantilla "Translate the following text into English..." y el modelo devuelve solo el resultado traducido.
- Cobertura de idiomas de bajos recursos y variedades regionales: incluye yue (cantonés), bo (tibetano), ug (uigur), ckb (kurdo sorani), sd (sindi), ceb (cebuano), war (waray), ht (haitiano), entre otros.
- Manejo de contexto largo: la variante 8-bit documenta 256K tokens, lo que permite traducir documentos completos o conversaciones extensas sin truncar.
- Capacidad de seguir formatos de salida estrictos ("solo el resultado traducido sin explicaciones adicionales"), util para pipelines automatizados.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documenta modo "thinking" ni razonamiento multi-paso explicito.

## Casos de uso

- Traduccion de documentacion tecnica en local: el modelo cabe en 1,04 GB y puede ejecutarse en un Mac con `mlx-lm`, permitiendo traducir manuales, READMEs y guias sin enviar contenido a servicios en la nube, lo que reduce riesgo de filtracion de propiedad intelectual.
- Localizacion de productos software en 102 idiomas: con una sola invocacion por cadena y una plantilla de prompt fija, se puede integrar en un pipeline de CI/CD que traduzca ficheros de recursos (`.json`, `.po`, `.strings`) antes de cada release.
- Traduccion de conversaciones de atencion al cliente: la ventana de contexto larga (256K en la variante 8-bit) permite procesar hilos completos de correo o chat multi-turno manteniendo coherencia terminologica.
- Subtitulado y transcripcion multilingue: al ser un modelo pequeno y rapido en Apple Silicon, encaja en un flujo por segmentos donde se traducen lineas de subtitulos una a una con contexto acumulado.
- Investigacion en traduccion automatica de bajos recursos: la cobertura de idiomas como tibetano, uigur, sindi o cebuano lo hace util como baseline o componente en estudios comparativos de MT neuronal.
- Procesamiento por lotes en estaciones de trabajo Mac: al no requerir GPU dedicada, permite desplegar traduccion en equipos de desarrollo con memoria unificada de 16 GB o mas, sin coste de infraestructura cloud.
- Traduccion de contenido editorial y marketing: la instruccion de "solo salida traducida" simplifica la integracion en CMS y herramientas de publicacion.

## Benchmarks y rendimiento

Los datos publicados por el autor de la cuantizacion miden la fidelidad respecto a BF16 (divergencia KL y top-1) y la calidad de traduccion (chrF++). No se han publicado resultados de benchmarks estandar de traduccion (WMT, Flores-200) en la informacion disponible.

| Metrica | MLX 4-bit | MLX 8-bit | BF16 |
|---|---:|---:|---:|
| Tamano | 1,04 GB | 1,90 GB | 3,58 GB |
| WikiText-2 KL | 0,172997 | 0,000859 | referencia |
| WikiText-2 top-1 | 77,706 % | 98,225 % | referencia |
| Chat KL | 0,136311 | 0,000559 | referencia |
| Chat top-1 | 82,510 % | 98,961 % | referencia |
| Held-out KL | 0,205585 | 0,000940 | referencia |
| Held-out top-1 | 77,353 % | 98,529 % | referencia |
| chrF++ medio (6 direcciones) | 40,83 | 41,64 | 41,84 |

| Direccion | MLX 4-bit | MLX 8-bit | BF16 |
|---|---:|---:|---:|
| en-zh | 33,55 | 34,25 | 34,54 |
| zh-en | 50,25 | 50,27 | 50,24 |
| en-ko | 33,05 | 34,14 | 34,10 |
| ko-en | 51,01 | 51,73 | 51,63 |
| en-ja | 30,10 | 31,86 | 32,81 |
| ja-en | 47,00 | 47,58 | 47,71 |

La cuantizacion 4-bit pierde aproximadamente 1,01 puntos de chrF++ medio frente a BF16, con la mayor degradacion en en-ja (2,71 puntos) y en-ko (1,05 puntos). La variante 8-bit se mantiene practicamente a la par de BF16 (0,20 puntos de diferencia media) con la mitad de tamano.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: 1,04 GB de pesos en 4-bit mas overhead de activaciones y cache KV; en la practica, unos 2-4 GB con contexto moderado y bastante mas con contexto de 256K.
- GPU recomendadas: el autor solo documenta Mac Studio con M5 Max y M5 Ultra; no se mencionan GPU NVIDIA ni AMD.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8-16 GB de memoria unificada; tambien en Mac mini o MacBook con M-series.
- Opciones de despliegue: `mlx-lm` version 0.32.2 o superior (unica libreria documentada). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, dado que el formato es MLX y no GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---:|---:|---:|---|---|
| Hy-MT3-1.8B-MLX-4bit (esta ficha) | 1,8B | 256K (segun autor) | 102 | Apache 2.0 | MLX safetensors |
| Hy-MT3-1.8B (base, Tencent) | 1,8B | no disponible | 102 | Apache 2.0 | safetensors BF16 |
| Hy-MT3-1.8B-MLX-8bit (misma familia) | 1,8B | 256K | 102 | Apache 2.0 | MLX safetensors 8-bit |

No se dispone de datos de benchmarks comparativos frente a otros modelos de traduccion como NLLB-200, M2M-100 o SeamlessM4T en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo especializado en traduccion: no es un modelo conversacional general ni esta pensado para generacion libre, razonamiento o codigo; su uso fuera de la traduccion puede dar resultados pobres.
- Perdida de calidad por cuantizacion: la variante 4-bit degrada la fidelidad respecto a BF16 (KL de 0,17 en WikiText-2, top-1 del 77,7 %) y pierde cerca de 1 punto de chrF++ medio; en direcciones como en-ja la perdida supera los 2,5 puntos.
- Dependencia de plataforma: el formato MLX solo se ejecuta en Apple Silicon; no es portable a CUDA ni a CPU x86 sin reconvertir los pesos.
- Riesgo de alucinacion y omision en textos largos: como todo modelo de traduccion neuronal, puede omitir frases, inventar terminos o alterar nombres propios, especialmente en idiomas de bajos recursos y con contextos muy extensos.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; la cobertura de 102 idiomas no garantiza calidad homogenea y los pares con menos datos de entrenamiento probablemente rindan peor.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar `LICENSE.txt` y `NOTICE` del repositorio, asi como la licencia del modelo base de Tencent, por si hubiera terminos adicionales no reflejados en los metadatos.
- Sin garantias de produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan pruebas de robustez, seguridad ni evaluaciones humanas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- Variante 8-bit: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-8bit
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio del pipeline de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Grafica de divergencia KL: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-4bit/resolve/main/accuracy-kl.png
- Grafica de chrF++: https://huggingface.co/Xylolabs/Hy-MT3-1.8B-MLX-4bit/resolve/main/accuracy-chrf.png
