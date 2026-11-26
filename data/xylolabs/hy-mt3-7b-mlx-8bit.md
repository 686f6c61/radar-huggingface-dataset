# Xylolabs/Hy-MT3-7B-MLX-8bit

## Resumen

Hy-MT3-7B-MLX-8bit es una cuantizacion en 8 bits del modelo de traduccion tencent/Hy-MT3-7B, publicada por Xylolabs y convertida al formato MLX para su uso con la libreria mlx-lm en hardware Apple Silicon. El modelo base, desarrollado por Tencent, es un transformer denso de aproximadamente 7.500 millones de parametros especializado en traduccion automatica y disenado para cubrir 102 idiomas, incluyendo pares de baja recursos como el camboyano, el birmano, el tibetano o el yiddish.

La aportacion de esta version concreta es doble: por un lado, reduce el peso de los pesos de 15,01 GB en BF16 a 7,97 GB mediante cuantizacion afin con tamano de grupo 64 y escalas y sesgos en float16; por otro, lo empaqueta en el formato nativo de MLX para que pueda ejecutarse de forma eficiente en Macs con memoria unificada. Segun los datos del autor, la perdida de calidad frente a BF16 es marginal: la divergencia KL sobre WikiText-2 es de 0,001188 y la puntuacion chrF++ media en seis direcciones de WMT24++ es identica a la del modelo sin cuantizar (43,75).

Es relevante ahora porque permite ejecutar localmente un modelo de traduccion multilingue de 7B con ventanas de contexto de hasta 256K tokens en equipos de escritorio Apple, sin depender de GPU dedicadas ni de servicios en la nube, y con una licencia Apache 2.0 que facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense), cuantizacion afin MLX |
| Parametros totales | 7.504.568.320 (7,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K tokens (segun memoria disponible; 126K con 36 GB, 193K con 48 GB, 256K con 64 GB o mas) |
| Tipos de cuantizacion | 8 bits (pesos lineales y embeddings), grupo de 64, escalas y sesgos en float16, normas en float16; existe variante MLX 4-bit del mismo autor |
| Idiomas soportados | 102 idiomas, entre ellos zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, vi, th, id, ms, tr, nl, pl, uk, he, fa, ur, bn, ta, te, mr, gu, kn, ml, pa, si, km, my, bo, mn, yue, kk, ug, el, cy, ro, ca, hu, gl, sd, bg, eu, as, sr, af, or, hr, lb, sk, mt, sl, eo, sa, sq, yi, lo, mk, hy, jv, be, ka, su, lt, az, ceb, lv, uz, war, et, ky, sw, fi, tk, am, sv, tg, so, da, tt, mg, nb, ba, ht, nn, ku, is, ckb, ga, ps, gd, ne |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso identificado en los metadatos como `hunyuan_v1_dense`, la familia de arquitecturas de Tencent Hunyuan. Esta version no modifica la topologia: unicamente aplica cuantizacion afin post-entrenamiento sobre cada peso lineal y sobre el embedding de tokens (incluida la LM head), manteniendo las capas de normalizacion en float16. El tamano de grupo de cuantizacion es 64, lo que equilibra la compresion (de 15,01 GB a 7,97 GB) con la fidelidad numerica.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del corpus, ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documentan innovaciones arquitectonicas especificas mas alla de la propia familia Hunyuan. La informacion disponible se limita a los resultados de fidelidad de la cuantizacion y a las metricas de traduccion.

## Capacidades

- Traduccion automatica multilingue entre 102 idiomas, con especial cobertura de pares de baja recursos (camboyano, birmano, tibetano, yiddish, cebuano, waray, etc.).
- Traduccion bidireccional verificada en benchmarks para en-zh, zh-en, en-ko, ko-en, en-ja y ja-en.
- Generacion de texto condicionada por instrucciones: el formato de prompt documentado pide traducir y devolver solo el resultado, lo que sugiere capacidad de seguir instrucciones de formato.
- Manejo de contexto largo: ventanas de hasta 256K tokens segun la memoria del equipo, utiles para documentos completos o subtitulos extensos.
- Ejecucion local en Apple Silicon mediante mlx-lm, sin necesidad de GPU dedicada.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Traduccion de documentacion tecnica en local: un equipo puede procesar manuales completos de decenas de miles de tokens en un Mac Studio con 64 GB, aprovechando la ventana de 256K para mantener coherencia terminologica a lo largo del documento.
- Localizacion de productos para mercados de baja recursos: el modelo cubre idiomas como camboyano, birmano o tibetano que rara vez aparecen en modelos generalistas, lo que permite localizar interfaces y textos de marketing sin depender de proveedores cloud.
- Subtitulado y traduccion de video: la ventana larga permite pasar guiones o transcripciones completas en una sola llamada, manteniendo el contexto narrativo entre escenas.
- Traduccion de correspondencia y soporte al cliente: integrado en un flujo local, permite traducir tickets y correos en tiempo real sin enviar datos sensibles a terceros, algo critico en sectores regulados.
- Procesamiento por lotes en estaciones de trabajo Apple: con 7,97 GB de pesos, un Mac Studio puede ejecutar el modelo junto a otras herramientas, y la licencia Apache 2.0 permite empaquetarlo en productos internos o comerciales.
- Investigacion en traduccion automatica: sirve como linea base reproducible en hardware de consumo para comparar tecnicas de cuantizacion (4-bit frente a 8-bit frente a BF16) con las metricas KL y chrF++ ya publicadas.
- Traduccion offline en entornos con conectividad limitada: al no requerir red, es adecuado para trabajo de campo, ONGs o despliegues en zonas sin acceso estable a internet.

## Benchmarks y rendimiento

Datos publicados por el autor. KL se mide frente a BF16 sobre WikiText-2, chat y texto reservado; chrF++ es la media de seis direcciones sobre 1.200 segmentos de WMT24++.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | chrF++ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 4,35 GB | 0,167002 | 84,980% | 0,055181 | 92,333% | 0,172145 | 86,843% | 43,56 |
| MLX 8-bit | 7,97 GB | 0,001188 | 98,922% | 0,000574 | 99,373% | 0,002071 | 98,725% | 43,75 |
| BF16 | 15,01 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 43,75 |

chrF++ por direccion:

| Cuantizacion | en-zh | zh-en | en-ko | ko-en | en-ja | ja-en |
|---|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 35,18 | 53,64 | 35,16 | 55,07 | 32,18 | 50,16 |
| MLX 8-bit | 35,57 | 53,63 | 35,58 | 54,98 | 32,48 | 50,24 |
| BF16 | 35,50 | 53,62 | 35,49 | 54,99 | 32,70 | 50,19 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas.

## Requisitos de hardware

- Memoria: los pesos ocupan 7,97 GB; el repo completo pesa 8,0 GB. La memoria unificada necesaria depende del contexto: 36 GB permiten 126K tokens, 48 GB permiten 193K y 64 GB o mas permiten los 256K completos.
- Hardware recomendado segun el autor: Mac Studio M5 Max (32 o 40 nucleos de GPU) y Mac Studio M5 Ultra (80 nucleos de GPU), con configuraciones de 36 GB a 512 GB de memoria unificada.
- GPU dedicadas: no se documenta soporte para CUDA en esta version; el formato MLX esta pensado para Apple Silicon. Para NVIDIA habria que usar el modelo base en safetensors o una conversion GGUF, no incluida en este repo.
- Cabe en equipos de consumo Apple con al menos 16-24 GB de memoria unificada para contextos cortos, aunque el autor solo tabula configuraciones desde 36 GB.
- Despliegue: mlx-lm 0.32.2 o superior, con el comando `mlx_lm.generate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| Xylolabs/Hy-MT3-7B-MLX-8bit | 7,5B | hasta 256K | Apache 2.0 | MLX, Apple Silicon | chrF++ medio 43,75; KL 0,001188 frente a BF16 |
| Xylolabs/Hy-MT3-7B-MLX-4bit | 7,5B | hasta 256K (misma familia) | Apache 2.0 | MLX, Apple Silicon | 4,35 GB; chrF++ 43,56; KL 0,167002 en WikiText-2 |
| tencent/Hy-MT3-7B (BF16) | 7,5B | no disponible | Apache 2.0 | safetensors, GPU dedicada | Referencia de calidad; 15,01 GB; chrF++ 43,75 |
| Otros modelos de traduccion de ~7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye resultados de modelos de traduccion alternativos de tamano similar.

## Limitaciones y advertencias

- Solo se ejecuta en Apple Silicon mediante MLX; no es portable a CUDA, ROCm ni CPU convencional sin conversion adicional.
- La cuantizacion en 8 bits introduce una divergencia pequena pero no nula frente a BF16 (KL de 0,001188 en WikiText-2, top-1 del 98,922%); en dominios muy sensibles conviene validar contra el modelo completo.
- La variante 4-bit del mismo autor degrada bastante mas (KL 0,167002, top-1 84,980%), por lo que no es intercambiable en produccion exigente.
- El modelo esta especializado en traduccion; no se documentan capacidades de razonamiento general, codigo o matematicas, y usarlo fuera de ese dominio puede dar resultados pobres.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Aunque la licencia es Apache 2.0, el aviso del repo remite a `LICENSE.txt` y `NOTICE`; conviene revisar ambos antes de un uso comercial.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y se publico el 2026-11-26; es un artefacto muy reciente sin validacion independiente.
- El contexto maximo de 256K depende de la memoria del equipo; en configuraciones de 36 GB se limita a 126K, lo que puede truncar documentos largos sin aviso claro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-7B-MLX-8bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Libreria MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de cuantizacion del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Grafico de KL por tamano: https://huggingface.co/Xylolabs/Hy-MT3-7B-MLX-8bit/resolve/main/accuracy-kl.png
- Grafico de chrF++ por tamano: https://huggingface.co/Xylolabs/Hy-MT3-7B-MLX-8bit/resolve/main/accuracy-chrf.png
