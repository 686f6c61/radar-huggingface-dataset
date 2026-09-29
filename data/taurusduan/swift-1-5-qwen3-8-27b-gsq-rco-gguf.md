# taurusduan/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF es una publicacion de cuantizaciones GGUF del modelo Swift 1.5 Qwen3.8-27B, desarrollado por UkisAI como adaptacion post-entrenada del modelo fundacional Qwen3.8-27B de Qwen. La ficha corresponde al repositorio de taurusduan, que reproduce el README y el manifiesto del release de ukisai e incluye cuatro perfiles de precision mixta (IQ2_XS, IQ2_S, IQ3_XXS e IQ3_S) y, opcionalmente, variantes con cabeza MTP para decodificacion multi-token.

El modelo base tiene 26.895.998.464 parametros (~26,9 B) y esta orientado a eficiencia de razonamiento: segun la model card, Swift 1.5 consume un 58,5% menos de tokens de pensamiento y obtiene un 0,35% mas de puntuacion que su base, lo que se traduce en una mejora de velocidad de 9,18x en varias tareas (una pagina de terceros, Featherless, cita 1,95x). El atractivo de este repositorio concreto es que aplica las asignaciones por tensor de GSQ-RCO de ISTA-DASLab sobre los pesos de Swift 1.5, de modo que un modelo de ~27 B se puede ejecutar en equipos de consumo con ficheros de entre 8,42 GB y 11,77 GB.

Se publica bajo la licencia swift-open-license-1.0 (etiquetada como `other`), no incluye proyector de vision verificado y no aporta resultados de benchmarks de tareas: toda la evaluacion publicada en la model card son mediciones de divergencia KLD frente al modelo BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.8 (etiqueta `qwen3_8`); no se detalla en la informacion disponible si emplea MoE, atencion lineal u otra variante |
| Parametros totales | 26.895.998.464 (~26,9 B), dato real de safetensors del modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | no especificada en la informacion disponible; el ejemplo oficial de llama-server configura `-c 262144` (256K), pero la propia model card advierte que no se evaluaron las cuantizaciones a esa longitud |
| Tipos de cuantizacion | GGUF IQ2_XS, IQ2_S, IQ3_XXS e IQ3_S con asignacion mixta por tensor (perfiles GSQ-RCO); variantes `-mtp` con cabeza MTP |
| Idiomas soportados | no disponible; las pruebas KLD held-out cubren ingles (C4), aleman, frances, espanol y chino (mC4) |
| Licencia | swift-open-license-1.0 (campo `license: other`), con enlace a LICENSE y seccion de licencia enterprise |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b (relacion: quantized) |
| Modelo fundacional | Qwen/Qwen3.8-27B |
| Tamano por fichero (GB decimales) | IQ2_XS 8,42 / IQ2_S 9,26 / IQ3_XXS 10,09 / IQ3_S 11,77; las variantes `-mtp` anaden 0,35 GB |
| Tamano del repositorio | 80,5 GB |
| Etiquetas | gguf, llama.cpp, qwen3_8, gsq, rco, reasoning, efficient-thinking, token-efficient, post-training, imatrix, conversational, endpoints_compatible |
| Referencias arXiv citadas en las etiquetas | arXiv:2604.18556, arXiv:2605.00649 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna del modelo, solo documenta el procedimiento de cuantizacion. Los metadatos indican que se trata de un transformer decoder-only de la familia Qwen3.8 (etiqueta `qwen3_8`) y que su modelo base es ukisai/Swift-1.5-Qwen3.8-27b, a su vez derivado de Qwen/Qwen3.8-27B. No hay informacion disponible sobre numero de capas, dimension oculta, si existe mezcla de expertos, tipo de atencion o uso de decodificacion especulativa mas alla de la cabeza MTP opcional.

El entrenamiento descrito es un post-entrenamiento sobre Swift 1.0 centrado en tareas de horizonte largo, agenticas y de codigo, con el objetivo de mejorar el rendimiento consumiendo menos tokens de pensamiento (58,5% menos, segun el autor). No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO. La innovacion de este release es la cuantizacion: se reutilizan las asignaciones de precision por tensor del release GSQ-RCO de ISTA-DASLab para Qwen3.8-27B y se refinan especificamente para los pesos de Swift 1.5 (parte del procedimiento se describe como "reuse the..." y queda truncado en el material proporcionado). Las variantes `-mtp` conservan los tensores refinados y anaden la cabeza de prediccion multi-token, que requiere un runtime con soporte para esa implementacion concreta.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat aplicada mediante `--jinja` en llama-server.
- Razonamiento con modo de pensamiento eficiente: el ajuste post-entrenamiento reduce el numero de tokens de razonamiento frente a la version base.
- Codigo: el post-entrenamiento del modelo base se centra explicitamente en tareas de programacion y agenticas; las mediciones held-out incluyen el corpus CodeParrot.
- Matematicas: el modelo base se evalua sobre texto de GSM8K en las pruebas de cuantizacion; la model card de Qwen3.8-27B menciona MathVision y respuestas en formato `\boxed{}`.
- Tareas agenticas y de horizonte largo, segun la descripcion del post-entrenamiento de Swift 1.5.
- Capacidad multilingue parcialmente evidenciada: las pruebas KLD held-out cubren aleman, frances, espanol y chino ademas de ingles; no se publica una lista oficial de idiomas soportados.
- Decodificacion multi-token (MTP) en las variantes `-mtp`, con soporte sujeto al runtime; velocidad y calidad no evaluadas por separado.
- Tool calling / function calling y soporte de agentes: no se documenta explicitamente en la informacion disponible.
- Vision: no incluida. El autor indica que no se ha verificado un proyector de vision para este release y que no se distribuye ningun ejemplo de vision validado.
- Compatibilidad declarada con endpoints gestionados mediante la etiqueta `endpoints_compatible`.

## Casos de uso

- Asistente de razonamiento en local: con IQ3_S (11,77 GB) el modelo cabe en una GPU de 16 GB y permite mantener un asistente con modo de pensamiento sin enviar datos a un servicio externo, gracias a la eficiencia de tokens de pensamiento del ajuste de Swift 1.5.
- Agente de codigo en estaciones de trabajo: el modelo base esta post-entrenado para tareas de codigo y agenticas; desplegado con llama-server expone una API compatible con OpenAI en el puerto 8000 que se puede conectar a herramientas de edicion y pipelines de CI/CD.
- Generacion asistida en equipos con GPU de gama media: las variantes IQ2_XS (8,42 GB) e IQ2_S (9,26 GB) permiten ejecutar un modelo de ~27 B en tarjetas de 8-12 GB reduciendo el contexto, a cambio de mayor divergencia KLD.
- Procesamiento de documentos multilingues: al cubrir aleman, frances, espanol y chino en las pruebas de distribucion, es razonable usarlo en resumen y extraccion de informacion sobre corpus en esos idiomas, verificando la calidad caso por caso porque no hay benchmarks de tarea publicados.
- Razonamiento matematico asistido: util para tutorizacion o resolucion paso a paso de problemas de tipo GSM8K, con la advertencia de que las cuantizaciones IQ2 y IQ3 incrementan la divergencia en texto matematico entre un 4,9% y un 7,7% respecto a las comparativas de ISTA.
- Despliegue en entornos con requisitos de coste de latencia: la reduccion de tokens de pensamiento disminuye el tiempo de generacion por respuesta; conviene medirla en el hardware objetivo porque no hay datos de throughput publicados.
- Prototipado e investigacion en cuantizacion: el repositorio publica `release-manifest.json`, `SHA256SUMS` y tablas KLD held-out por dominio, lo que lo hace util como punto de partida reproducible para estudiar tecnicas de cuantizacion por asignacion de tensor.
- Servicio de chat autoalojado con contexto largo: el ejemplo oficial de llama-server usa 256K de contexto, adecuado para conversaciones multi-turno extensas o analisis de repositorios, siempre que la memoria disponible lo permita y asumiendo que la calidad a esa longitud no esta validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de divergencia KLD (divergencia de la distribucion de siguiente token frente al modelo BF16; menor es mejor), no exactitud en tareas.

Desarrollo (wiki.test.raw, 100 fragmentos, contexto 512, datos que influyeron en el refinado y por tanto no son validacion independiente):

| Perfil | KLD de desarrollo |
|---|---:|
| IQ2_XS | 0,189979 |
| IQ2_S | 0,134751 |
| IQ3_XXS | 0,097774 |
| IQ3_S | 0,051265 |

Held-out (100 fragmentos en prosa/codigo/matematicas; 25 fragmentos por idioma; contexto 512):

| Corpus held-out | IQ2_XS | IQ2_S | IQ3_XXS | IQ3_S |
|---|---:|---:|---:|---:|
| Prosa C4 | 0,161594 | 0,107438 | 0,080238 | 0,041748 |
| Codigo CodeParrot | 0,120884 | 0,084739 | 0,062546 | 0,035447 |
| Texto matematico GSM8K | 0,117467 | 0,096348 | 0,075964 | 0,043916 |
| Aleman | 0,124482 | 0,091422 | 0,074645 | 0,035698 |
| Frances | 0,166785 | 0,113277 | 0,077791 | 0,046219 |
| Espanol | 0,082313 | 0,056393 | 0,039906 | 0,024186 |
| Chino | 0,207063 | 0,129485 | 0,103141 | 0,052241 |

Segun el autor, los cuatro ficheros refinados mejoran el KLD respecto a las cuantizaciones de partida de Swift en los siete dominios, pero no son uniformemente mejores que las cuantizaciones comparativas de ISTA: el KLD en texto matematico es entre un 4,9% y un 7,7% superior, e IQ3_S es superior en cinco de los siete dominios. Las comparativas de ISTA miden cada cuantizacion contra su propio modelo BF16, por lo que no constituyen una comparacion directa de capacidad entre Swift y Qwen.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card advierte que el consumo en ejecucion incluye la cache de contexto y los buffers de computo, por lo que hay que sumar al tamano del fichero (8,42 / 9,26 / 10,09 / 11,77 GB) el coste de la cache KV. No se publican cifras de memoria por configuracion de contexto.
- Cabe en GPU de consumo: IQ2_XS (8,42 GB) e IQ2_S (9,26 GB) son viables en tarjetas de 10-12 GB si se reduce el contexto; IQ3_XXS (10,09 GB) e IQ3_S (11,77 GB) encajan con holgura en 16 GB y, con contexto reducido, en 12 GB. No hay mediciones oficiales de consumo de memoria, solo tamanos de fichero.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano de fichero, el rango objetivo son GPU de consumo de 12-24 GB (por ejemplo RTX 4080/4090) y GPU profesionales de 24-80 GB (A100, H100) para contextos largos y concurrencia alta. No se aportan datos que confirmen rendimiento en cada una.
- Opciones de despliegue: llama.cpp / llama-server es el runtime documentado (`llama-server -m ... --jinja -fa on -ngl 99 --port 8000`), con requisito de una build que soporte Qwen3.8. Las variantes `-mtp` requieren un runtime con soporte para la implementacion MTP de este modelo. No se mencionan vLLM, TGI, Ollama ni otros backends en la informacion disponible.
- Parametros de muestreo recomendados: temperatura 1.0, top-p 0.95, top-k 20, min-p 0.0, presence-penalty 0.0, repeat-penalty 1.0, con `--jinja` y flash attention activada.
- Latencia y throughput: no se publican cifras absolutas. La unica referencia es la reduccion del 58,5% en tokens de pensamiento y el 9,18x de mejora de velocidad en varias tareas segun la model card; una pagina de terceros (Featherless) indica 1,95x, discrepancia que no se puede resolver con la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| taurusduan/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF (este release) | ~26,9 B | no disponible; ejemplo con 256K | GGUF IQ2-IQ3 con perfiles GSQ-RCO | swift-open-license-1.0 | Cuantizacion mixta refinada; variantes con MTP; sin benchmarks de tarea; 0 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b | ~26,9 B | no disponible | safetensors (BF16) | swift-open-license-1.0 | Modelo original sin cuantizar; referencia de calidad para las mediciones KLD |
| ukisai/Swift-1.5-Qwen3.8-27B-GGUF | ~26,9 B | no disponible | GGUF estandar | swift-open-license-1.0 | Cuantizaciones de partida sobre las que este release aplica el refinado GSQ-RCO |
| ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF | ~27 B (Qwen3.8-27B) | no disponible | GGUF con perfiles GSQ-RCO | no disponible | Origen de las asignaciones por tensor reutilizadas; se usa como comparativa de KLD |
| Qwen/Qwen3.8-27B | ~27 B | no disponible | safetensors | no disponible | Modelo fundacional; Qwen3.8 se presenta como la primera clase Qwen-Max en abierto, con foco en codigo, trabajo profesional, investigacion y agentes de horizonte largo |

## Limitaciones y advertencias

- No hay benchmarks de exactitud en tareas: todas las cifras publicadas son KLD distribucional, que mide la divergencia frente al BF16 y no la precision en tareas reales.
- Las pruebas se hicieron con contexto de 512 tokens, por lo que no demuestran calidad a 32K o longitudes mayores, pese a que el ejemplo de uso configure 256K.
- El KLD en texto matematico es entre un 4,9% y un 7,7% superior al de las cuantizaciones comparativas de ISTA, e IQ3_S es peor en cinco de los siete dominios; no se trata de una mejora uniforme.
- El cribado de solapamiento lexico frente a texto de calibracion no garantiza deduplicacion semantica ni ausencia de sobreajuste, segun la propia model card.
- Las variantes `-mtp` no han sido evaluadas por separado en velocidad ni calidad, y requieren runtimes especificos; su uso en produccion queda sin validar.
- No se incluye proyector de vision ni ejemplo validado de vision, a pesar de que existan releases de la familia con esa capacidad.
- Licencia swift-open-license-1.0 (`other`), con una seccion de licencia enterprise en el repositorio original: las condiciones exactas de uso comercial no estan detalladas en la informacion disponible y deben consultarse en el enlace de licencia antes de desplegar en produccion.
- Riesgo de alucinacion propio de los modelos generativos; se agrava en las cuantizaciones de menor precision (IQ2_XS, IQ2_S), con KLD de hasta 0,189979 en desarrollo.
- Idiomas soportados no declarados oficialmente; la evidencia multilingue se limita a aleman, frances, espanol y chino en las pruebas de distribucion, con el chino como dominio de mayor KLD.
- El repositorio tiene 0 descargas y 0 likes y se creo el 2026-09-29; no hay validacion independiente de esta publicacion concreta.
- Es una republicacion en la cuenta taurusduan de un release de UkisAI: los enlaces, el manifiesto y la licencia apuntan al repositorio de ukisai, sin que se documente una relacion oficial entre ambas cuentas.
- El README advierte que el repositorio era privado y requiere autenticacion con una cuenta autorizada; el acceso puede no estar garantizado de forma permanente.
- El tamano del repositorio (80,5 GB) es muy superior a la suma de los ocho ficheros GGUF listados (~40,9 GB), lo que sugiere la presencia de ficheros adicionales o duplicados no descritos en la informacion disponible.
- Discrepancia de velocidad: la model card cita 9,18x y una pagina de terceros 1,95x; conviene medir el rendimiento en el hardware objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- GGUFs estandar de UkisAI: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Cuantizaciones de referencia GSQ-RCO (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Pagina del modelo en UkisAI: https://ukisai.com/swift-1-5-27b
- Web de UkisAI: https://ukisai.com
- Pagina de producto Swift: https://ukisai.com/products/swift
- Pagina de despliegue en Featherless: https://featherless.ai/models/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio GGUF previo de la misma cuenta: https://huggingface.co/taurusduan/Swift-Qwen3.8-27B-GGUF/blob/main/Swift-Qwen3.8-27B-Q5_K_M.gguf
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/LICENSE
- Manifiesto del release: release-manifest.json (en el repositorio)
- Sumas de verificacion: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Resultados KLD held-out completos: evaluation/heldout-kld.tsv (en el repositorio)
- Metadatos de evaluacion: evaluation/report.json (en el repositorio)
- Papers citados en las etiquetas: arXiv:2604.18556, arXiv:2605.00649
