# ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B · GSQ-RCO es un conjunto de cuantizaciones GGUF de precision mixta del modelo Swift 1.5 Qwen3.8-27B, publicado por ukisai. No es un modelo entrenado desde cero: parte de los pesos del modelo base ukisai/Swift-1.5-Qwen3.8-27b (26.895.998.464 parametros, unos 26,9 mil millones), que a su vez es un ajuste posterior de Qwen3.8-27B orientado a tareas agénticas y de codigo de horizonte largo. El repositorio ofrece cuatro niveles de cuantizacion (IQ2_XS, IQ2_S, IQ3_XXS e IQ3_S) en archivos GGUF unicos de entre 8,42 GB y 11,77 GB, mas variantes opcionales con cabeza MTP (multi-token prediction).

La relevancia de esta publicacion es doble. Por un lado, traslada a formato GGUF las asignaciones por tensor de la release GSQ-RCO de ISTA-DASLab para Qwen3.8-27B, refinadas con la matriz de importancia Swift V1MIX propia del modelo; el resultado son archivos de menos de 12 GB que preservan la distribucion de siguiente token del modelo BF16 con divergencias KLD relativamente bajas. Por otro, el modelo base emplea una estrategia de eficiencia en el razonamiento: segun el autor, Swift 1.5 gasta un 58,5% menos de tokens de pensamiento que el modelo de referencia y obtiene una puntuacion un 0,35% superior, lo que se traduce en una aceleracion de 9,18x en varias tareas. Es decir, la propuesta ataca a la vez el coste de inferencia por razonamiento excesivo y el coste de memoria en GPU de consumo.

El modelo se distribuye bajo la licencia propietaria swift-open-license-1.0, con una via de licencia empresarial mencionada en la propia model card, y esta pensado para ejecutarse con builds de llama.cpp que soporten Qwen3.8. Esta ficha documenta exclusivamente la release GGUF; los datos de entrenamiento, benchmarks de tarea y especificaciones internas de la arquitectura corresponden al modelo base y no se detallan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.8-27B; detalle interno (capas, atencion, GQA) no disponible en la informacion proporcionada |
| Parametros totales | 26.895.998.464 (aprox. 26,9 B) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | No confirmada. El ejemplo oficial de llama-server usa `-c 262144` (256K), pero el autor advierte explicitamente que esa configuracion no implica que las cuantizaciones hayan sido evaluadas a esa longitud |
| Tipos de cuantizacion | GGUF de precision mixta por tensor: IQ2_XS (8,42 GB), IQ2_S (9,26 GB), IQ3_XXS (10,09 GB), IQ3_S (11,77 GB); variantes `-mtp` con cabeza MTP (+0,35 GB) |
| Idiomas soportados | No disponible en los metadatos. Las pruebas de KLD held-out cubren prosa C4 (ingles), codigo, texto matematico GSM8K y texto multilinguee mC4 en aleman, frances, espanol y chino |
| Licencia | swift-open-license-1.0 (etiquetada como `other`, con licencia empresarial mencionada en la model card) |
| Formato de pesos | GGUF (un unico archivo por nivel); modelo base en BF16 disponible por separado |
| Tamano del repositorio | 80,5 GB |
| Fecha de creacion | 2026-09-24 |
| Descargas / likes | 0 / 16 |

## Arquitectura y entrenamiento

Esta release no introduce cambios arquitectonicos: es una cuantizacion GGUF del modelo ukisai/Swift-1.5-Qwen3.8-27b, que hereda la arquitectura de Qwen3.8-27B. La informacion disponible no detalla el numero de capas, el esquema de atencion ni la composicion del dataset de preentrenamiento. Lo que si se documenta es el proceso de ajuste posterior: Swift 1.5 se construye sobre Swift 1.0 con un post-entrenamiento centrado en tareas agénticas y de codigo de horizonte largo, con el objetivo explicito de reducir el numero de tokens de pensamiento sin degradar la precision. Segun el autor, el modelo consume un 58,5% menos de tokens de razonamiento y mejora ligeramente la puntuacion respecto a la base (0,35%), lo que produce una aceleracion de 9,18x en varias tareas. La model card de la familia indica ademas que Swift incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI, y que el modelo resultante mantiene la interfaz estandar de Qwen3.8, incluido el ajuste `reasoning_effort` (xhigh, medium, low).

La innovacion tecnica de esta entrega concreta esta en el pipeline de cuantizacion. Se reutiliza la asignacion por tensor publicada por ISTA-DASLab para cada nivel correspondiente de Qwen3.8-27B (GSQ-RCO) y se aplica sobre los pesos de Swift 1.5 usando la matriz de importancia Swift V1MIX. El resultado son perfiles de precision mixta (los nombres de nivel no implican un tipo uniforme para todos los tensores). Ademas, los archivos `-mtp` conservan los tensores refinados y anaden una cabeza de prediccion multi-token, que requiere un runtime con soporte especifico para esta implementacion MTP. La velocidad y la calidad de la decodificacion con MTP no han sido evaluadas de forma separada, segun el propio autor.

## Capacidades

- Generacion de texto conversacional en formato chat, con plantilla Jinja (`--jinja`) en llama.cpp.
- Razonamiento con trazas de pensamiento reducidas: el ajuste posterior de Swift 1.5 busca menos sobrepensamiento, con un 58,5% menos de tokens de razonamiento y un 9,18x de aceleracion reportada en varias tareas.
- Ajuste de esfuerzo de razonamiento mediante `reasoning_effort` de Qwen3.8 (xhigh, medium, low); segun el autor, el ahorro de tokens de pensamiento se mantiene en los tres niveles.
- Tareas agénticas y de codigo de horizonte largo, foco declarado del post-entrenamiento de Swift 1.5.
- Soporte de tool calling / function calling a traves del servidor de llama.cpp con `--jinja`, que habilita la plantilla de chat y el parseo de llamadas a herramientas.
- Capacidades multilingues: la evaluacion de la cuantizacion incluye aleman, frances, espanol y chino, ademas de ingles y codigo, aunque no se publica una lista oficial de idiomas soportados.
- Razonamiento matematico evaluado solo de forma distribucional (KLD sobre texto de GSM8K), no mediante accuracy de tarea.
- Capacidad de vision (texto, imagen y video) presente en la familia Swift/Qwen3.8, pero no verificada ni incluida en esta release: no se distribuye proyector de vision ni ejemplo validado.
- Decodificacion con cabeza MTP opcional en los archivos `-mtp`, supeditada al soporte del runtime.

## Casos de uso

- Agentes de codigo de horizonte largo: el modelo esta post-entrenado especificamente para tareas agenticas y de codigo de larga duracion, y su reduccion de tokens de pensamiento abarata las cadenas de varios pasos en las que cada iteracion vuelve a generar razonamiento.
- Asistente de programacion en local con GPU de consumo: la cuantizacion IQ3_XXS ocupa 10,09 GB, lo que permite ejecutar un modelo de 26,9B en tarjetas de 12-16 GB mediante llama.cpp, sin depender de APIs externas ni de enviar codigo propietario a terceros.
- Atencion al cliente automatizada multi-turno: el ejemplo oficial de servidor usa una ventana de 262.144 tokens, lo que permite mantener historiales de conversacion muy largos y documentacion de producto en contexto, siempre que la memoria disponible lo permita (la calidad a esas longitudes no esta verificada).
- Pipelines de CI/CD con llamadas a herramientas: gracias al soporte de tool calling via `--jinja` en llama-server, el modelo puede invocarse como endpoint compatible con la API de chat y usarse para revisar diffs, generar tests o resumir fallos de build dentro de un runner con GPU.
- Procesamiento de documentacion tecnica multilingue: la evaluacion cubre aleman, frances, espanol y chino, de modo que un despliegue europeo puede resumir y clasificar documentacion en varios idiomas con un unico modelo.
- Despliegue en el borde o en portatiles con GPU: el nivel IQ2_XS (8,42 GB) permite ejecutar el modelo en equipos con 10-12 GB de VRAM y contexto moderado, util para prototipos offline y demos sin conectividad.
- Investigacion sobre cuantizacion: los archivos y los datos de KLD held-out publicados permiten reproducir y comparar estrategias de asignacion por tensor (GSQ-RCO + imatrix V1MIX) frente a cuantizaciones uniformes.
- Generacion aumentada por recuperacion (RAG) local: la ventana larga configurable y el bajo coste de razonamiento hacen viable indexar corpus extensos y responder con citas dentro de una infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K por accuracy, etc.) en la informacion disponible. Las unicas metricas publicadas son mediciones de divergencia KLD de la distribucion de siguiente token respecto al modelo Swift 1.5 en BF16, con contexto de 512 tokens. KLD mas bajo es mejor.

Desarrollo (`wiki.test.raw`, 100 fragmentos, contexto 512). Estos datos guiaron el refinamiento y no son validacion independiente:

| Nivel | KLD de desarrollo |
|---|---:|
| IQ2_XS | 0,189979 |
| IQ2_S | 0,134751 |
| IQ3_XXS | 0,097774 |
| IQ3_S | 0,051265 |

Held-out (100 fragmentos para prosa C4, codigo CodeParrot y texto matematico GSM8K; 25 fragmentos por idioma en mC4):

| Texto held-out | IQ2_XS | IQ2_S | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Prosa C4 | 0,161594 | 0,107438 | 0,080238 | 0,041748 |
| Codigo CodeParrot | 0,120884 | 0,084739 | 0,062546 | 0,035447 |
| Texto matematico GSM8K | 0,117467 | 0,096348 | 0,075964 | 0,043916 |
| Aleman | 0,124482 | 0,091422 | 0,074645 | 0,035698 |
| Frances | 0,166785 | 0,113277 | 0,077791 | 0,046219 |
| Espanol | 0,082313 | 0,056393 | 0,039906 | 0,024186 |
| Chino | 0,207063 | 0,129485 | 0,103141 | 0,052241 |

Notas del autor: los cuatro archivos refinados mejoran el KLD respecto a sus cuantizaciones Swift de partida en los siete dominios. Los resultados no son uniformemente mejores que las cuantizaciones de comparacion de ISTA: el KLD de texto matematico es entre un 4,9% y un 7,7% superior, e IQ3_S es peor en cinco de los siete dominios. Las comparaciones con ISTA miden cada cuantizacion contra su propio modelo BF16 correspondiente, por lo que no son una clasificacion directa Swift frente a Qwen ni prueban capacidades equivalentes.

## Requisitos de hardware

- VRAM de inferencia: el peso en disco es de 8,42 GB (IQ2_XS), 9,26 GB (IQ2_S), 10,09 GB (IQ3_XXS) y 11,77 GB (IQ3_S); las variantes `-mtp` anaden 0,35 GB. A esa cifra hay que sumar la cache de contexto y los buffers de computo, cuyo tamano exacto no se especifica en la informacion disponible.
- Cache KV: no se publican cifras. Con el contexto de ejemplo de 262.144 tokens la cache crece de forma muy significativa, por lo que en GPUs de consumo conviene reducir `-c` o recurrir a cuantizacion de la cache KV en llama.cpp.
- GPU de consumo: IQ2_XS e IQ2_S caben en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto corto o moderado; IQ3_XXS encaja en 12-16 GB (RTX 4060 Ti 16 GB, RTX 4080); IQ3_S (11,77 GB) requiere 16 GB o 24 GB para dejar margen a contexto y buffers. En RTX 3090, RTX 4090 o RTX 5090 (24 GB o mas) los cuatro niveles se ejecutan con holgura y contexto amplio.
- GPU de centro de datos: A100 40/80 GB, H100, L40S y similares sobran para estos niveles, pero carecen de sentido economico salvo despliegue concurrente con batching alto o contexto muy largo.
- Despliegue: llama.cpp (`llama-server`) es la via documentada, con un build que soporte Qwen3.8. Compatible con el ecosistema GGUF (Ollama y otros runners basados en llama.cpp) siempre que el runtime reconozca la arquitectura. La etiqueta `endpoints_compatible` sugiere integracion con endpoints de chat compatibles. No se documenta soporte en vLLM, TGI ni TensorRT-LLM para estos archivos.
- Parametros de muestreo recomendados por el autor: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 --presence-penalty 0.0 --repeat-penalty 1.0`, con `--jinja -fa on -ngl 99` en el ejemplo.
- Latencia y throughput: no se publican mediciones de tokens por segundo. El autor reporta una aceleracion de 9,18x atribuida al ahorro de tokens de pensamiento del modelo base, no a la cuantizacion. La velocidad de decodificacion con MTP no ha sido evaluada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Licencia | Datos de calidad |
|---|---|---|---|---|---|
| ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF (este) | 26,9 B | GGUF IQ2_XS a IQ3_S, 8,42-11,77 GB | No confirmado; ejemplo a 262.144 | swift-open-license-1.0 | KLD held-out por dominio (tabla anterior) |
| ukisai/Swift-1.5-Qwen3.8-27B-GGUF (GGUF estandar) | 26,9 B | GGUF estandar | No disponible | swift-open-license-1.0 | No disponible en la informacion proporcionada |
| ukisai/Swift-1.5-Qwen3.8-27b (BF16) | 26,9 B | Pesos BF16 | No disponible | swift-open-license-1.0 | Actua como referencia de las mediciones KLD |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | 27 B (Qwen3.8-27B base) | GGUF de precision mixta GSQ-RCO | No disponible | No disponible | Referencia de asignacion por tensor; en texto matematico el KLD es un 4,9-7,7% mejor que el de esta release |

La comparacion con la release de ISTA no es directa: alli se cuantiza el Qwen3.8-27B original y cada KLD se mide contra su propio BF16, mientras que aqui se cuantiza Swift 1.5 con su propia matriz de importancia. No se dispone de comparaciones con otras familias de modelos del mismo tamano (por ejemplo, alternativas densas de 24-32 B) en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de KLD de desarrollo provienen de texto que informo el refinamiento, por lo que no constituyen validacion independiente; la propia model card lo advierte.
- Las mediciones held-out se hicieron a 512 tokens de contexto; no permiten afirmar nada sobre la calidad a 32K o longitudes mayores, pese a que el ejemplo de uso configure 262.144 tokens.
- El filtro de solapamiento aplicado contra el texto de calibracion es lexico: no establece deduplicacion semantica ni descarta sobreajuste.
- Los resultados no son uniformemente mejores que las cuantizaciones de ISTA: el KLD de texto matematico es un 4,9-7,7% superior e IQ3_S empeora en cinco de siete dominios.
- La decodificacion con la cabeza MTP no ha sido evaluada en velocidad ni en calidad, y requiere un runtime con soporte para esa implementacion concreta.
- No hay proyector de vision verificado para esta release; aunque la familia Swift conserva soporte de texto, imagen y video, aqui solo se distribuyen los GGUF del modelo de lenguaje.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error, evaluaciones de veracidad ni benchmarks de tarea para estas cuantizaciones.
- Sesgos: no se documenta ningun analisis de sesgo, y el unico indicio multilingue es la cobertura de idiomas en las pruebas de KLD, sin garantia de paridad de calidad entre ellos (el chino muestra el KLD mas alto de todos los dominios en los cuatro niveles).
- Licencia: swift-open-license-1.0 no es una licencia open source estandar; la model card menciona una via de licencia empresarial, por lo que el uso comercial debe revisarse contra el texto de LICENSE antes de desplegar en produccion.
- Acceso restringido en el momento de la publicacion: el autor indica que hay que autenticarse con una cuenta autorizada mientras el repositorio era privado.
- Ausencia de datos operativos: 0 descargas y ausencia de benchmarks de tarea dificultan estimar su comportamiento real frente a alternativas.
- La cuantizacion a 2-3 bits introduce degradacion medible de la distribucion (KLD hasta 0,21 en IQ2_XS sobre chino); para tareas sensibles a la precision conviene usar IQ3_S o el modelo BF16.
- Requiere un build de llama.cpp que soporte Qwen3.8; versiones antiguas pueden no reconocer la arquitectura o la cabeza MTP.

## Enlaces

- Repositorio HuggingFace (esta release): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base en BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- GGUFs estandar de Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Asignaciones por tensor de referencia (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Manifiesto de release: release-manifest.json (en el repositorio)
- Sumas de verificacion: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Tabla completa de KLD held-out: evaluation/heldout-kld.tsv (en el repositorio)
- Metadatos de evaluacion: evaluation/report.json (en el repositorio)
- Web del autor: https://ukisai.com
- Pagina de producto de Swift: https://ukisai.com/products/swift
- Anuncio de Swift: https://ukisai.com/news/introducing-swift
- Ficha de la familia Swift en LLM Explorer: https://llm-explorer.com/model/ukisai%2FSwift-Qwen3.8-27b,7HZDzqxvGRH6tfN1jMMpJ4
- Repositorio de Swift 1.0 / Swift Qwen3.8-27b: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Referencias arXiv declaradas en las etiquetas del repositorio: arxiv:2604.18556 y arxiv:2605.00649 (contenido no verificado)
