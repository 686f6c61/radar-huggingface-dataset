# taurusduan/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-Flash-Next GSQ-RCO es una coleccion de cuantizaciones GGUF de precision mixta del modelo Swift Flash Next, desarrollado por UkisAI como derivado de Qwen3.8-Flash-Next orientado a eficiencia de razonamiento. Esta publicacion concreta la mantiene el usuario taurusduan en Hugging Face y aplica los perfiles de asignacion por tensor GSQ-RCO de ISTA junto con un refinamiento GSQ especifico de Swift. El objetivo es ofrecer el modelo en formato GGUF ejecutable con llama.cpp reduciendo el coste de memoria sin degradar de forma significativa la distribucion de siguiente token respecto al BF16.

El modelo base es un Mixture-of-Experts de 176.943.899.520 parametros (aproximadamente 177 mil millones) con capacidades multimodales image-text-to-text, segun el pipeline declarado. La propuesta de valor de Swift Flash Next es reducir la longitud de las trazas de razonamiento: el autor declara un 63,4 por ciento menos de tokens de pensamiento y una aceleracion de 1,8x con una perdida de precision inferior al 1 por ciento frente al base en modo xhigh. Esto lo hace relevante para despliegues de agentes y tareas de codigo de largo horizonte donde el coste por token de razonamiento domina la factura.

La publicacion incluye cuatro niveles de cuantizacion (IQ3_S, IQ3_XXS, IQ2_XS y Q2_0 experimental) en dos shards cada uno, mas un proyector de vision BF16 separado. El repositorio ocupa 296 GB y acumula 2.817 descargas. La licencia es swift-open-license-1.0, con requisitos de licencia empresarial descritos en la model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de Qwen3.8-Flash-Next; multimodal image-text-to-text |
| Parametros totales | 176.943.899.520 (aproximadamente 177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las mediciones KLD se realizan a 512 tokens) |
| Tipos de cuantizacion | IQ3_S, IQ3_XXS, IQ2_XS, Q2_0 (experimental); proyector de vision BF16 |
| Idiomas soportados | no disponible (se evalua KLD en ingles, aleman, frances, espanol y chino) |
| Licencia | swift-open-license-1.0 (etiquetada como other) |
| Formato de pesos | GGUF en dos shards por nivel; proyector mmproj en BF16 |

## Arquitectura y entrenamiento

El modelo subyacente es un MoE multimodal de aproximadamente 177 mil millones de parametros, segun el recuento de safetensors del modelo base. La model card no detalla el numero de expertos, la proporcion de parametros activos por token ni la composicion del dataset de entrenamiento. El pipeline declarado es image-text-to-text, lo que implica un proyector de vision que en esta publicacion se distribuye como archivo mmproj BF16 independiente de 0,91 GB.

El post-entrenamiento de Swift Flash Next se orienta a trazas de razonamiento mas cortas y a tareas de codigo, agentes y horizonte largo. Las etiquetas indican reasoning, efficient-thinking, token-efficient y post-training, aunque no se especifica si se empleo RLHF, DPO u otra tecnica. La innovacion destacable de esta publicacion es la cuantizacion: se reutilizan los perfiles de asignacion por tensor GSQ-RCO de ISTA y se aplica un refinamiento GSQ especifico de Swift, con mediciones de divergencia KL frente al BF16 de referencia en lugar de metricas de exactitud de tarea.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento optimizado para producir trazas mas cortas (63,4 por ciento menos tokens de pensamiento declarados).
- Generacion de codigo, con evaluacion de KLD sobre el conjunto CodeParrot.
- Razonamiento matematico, con evaluacion sobre texto de GSM8K.
- Procesamiento multimodal image-text-to-text mediante el proyector de vision BF16 incluido por separado.
- Capacidades multilingues: la evaluacion cubre aleman, frances, espanol y chino, ademas del ingles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: las etiquetas mencionan tareas agenticas, pero no se detalla el mecanismo.
- Modo de pensamiento eficiente (efficient-thinking) orientado a reducir el coste por respuesta.

## Casos de uso

- Razonamiento en produccion con coste controlado: el modo de pensamiento eficiente reduce la longitud de las trazas, lo que abarata cada respuesta en escenarios de alto volumen donde el coste por token de razonamiento es el factor dominante.
- Asistencia a programadores: la evaluacion sobre CodeParrot y las etiquetas de codigo y agentes sugieren uso en generacion y revision de codigo, aunque la calidad real de la cuantizacion debe validarse con pruebas propias.
- Analisis de documentos con imagenes: el proyector de vision BF16 permite procesar entradas image-text-to-text, util para extraer informacion de capturas, diagramas o formularios escaneados.
- Despliegue en hardware con memoria limitada: el nivel IQ2_XS ocupa 68,15 GB y presenta la menor KLD relativa de su rango, lo que permite ejecutar un MoE de 177 mil millones en nodos con menos de 80 GB de VRAM sumando shards.
- Atencion multilingue en espanol: la KLD en espanol es la mas baja de todos los idiomas evaluados (0,042848 en IQ3_S), lo que respalda su uso en aplicaciones en castellano.
- Investigacion sobre cuantizacion: los perfiles GSQ-RCO y las mediciones KLD por dominio permiten estudiar el impacto de la precision mixta en modelos MoE multimodales.
- Pipelines de agentes de largo horizonte: la reduccion de tokens de pensamiento y la aceleracion declarada de 1,8x encajan en bucles de agente donde cada paso consume contexto y tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de exactitud (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona unicamente divergencia KL (KLD) frente al BF16 de referencia, medida a contexto de 512 tokens.

| Conjunto de reporte | IQ3_S | IQ3_XXS | IQ2_XS | Q2_0 (experimental) |
|---|---:|---:|---:|---:|
| Prosa en ingles | 0,062556 | 0,116077 | 0,188117 | 0,234242 |
| Muestra fresca en ingles | 0,067801 | no disponible | 0,186271 | 0,236228 |
| Codigo CodeParrot | 0,069016 | 0,118707 | 0,174294 | 0,235256 |
| Texto matematico GSM8K | 0,054960 | 0,086821 | 0,120991 | 0,149809 |
| Aleman | 0,063634 | 0,109100 | 0,166814 | 0,219444 |
| Frances | 0,076760 | 0,133624 | 0,213379 | 0,300467 |
| Espanol | 0,042848 | 0,073681 | 0,119114 | 0,148757 |
| Chino | 0,095915 | 0,174102 | 0,264923 | 0,385924 |

KLD de desarrollo (conjunto de 100 chunks a 512 tokens): IQ3_S 0,144674; IQ3_XXS 0,240139; IQ2_XS 0,341275; Q2_0 0,424350.

## Requisitos de hardware

- VRAM estimada para inferencia: IQ3_S 83,74 GB; IQ3_XXS 75,97 GB; IQ2_XS 68,15 GB; Q2_0 66,55 GB. Estos tamanos excluyen la cache de contexto en tiempo de ejecucion y el proyector de vision (0,91 GB).
- GPU recomendadas: para IQ3_S se requiere un nodo multi-GPU o GPU de 80 GB con margen insuficiente, por lo que se recomienda H100 80 GB en configuracion de dos unidades o A100 80 GB con offload; IQ2_XS y Q2_0 pueden caber en una unica GPU de 80 GB dejando poco margen para contexto.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en ninguna GPU consumer actual sin offload masivo a RAM o disco.
- Opciones de despliegue: llama.cpp, con soporte de carga de los dos shards; el formato GGUF es compatible con el ecosistema llama.cpp, aunque no se confirma soporte especifico en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La model card declara una aceleracion de 1,8x del modelo base Swift frente a Qwen3.8-Flash-Next en generacion de razonamiento, no una medicion de esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-Flash-Next GSQ-RCO (este) | 177 mil millones (MoE) | no disponible | GGUF (2 shards) | swift-open-license-1.0 | KLD medido por dominio; vision via mmproj |
| Swift-1.5-Qwen3.8-Flash-Next-GGUF (standard) | 177 mil millones (MoE) | no disponible | GGUF | swift-open-license-1.0 | Cuantizaciones estandar del mismo modelo base |
| Swift-Qwen3.8-Flash-Next (BF16) | 177 mil millones (MoE) | no disponible | safetensors | swift-open-license-1.0 | Referencia BF16 usada para medir KLD |
| ISTA-DASLab GSQ-RCO IQ3_S / IQ2_XS | no disponible | no disponible | GGUF | no disponible | Referencia de cuantizacion; este modelo supera su KLD en varios dominios |

## Limitaciones y advertencias

- La evaluacion publicada mide solo divergencia KL frente al BF16, no exactitud de tarea; no hay datos de MMLU, HumanEval ni GSM8K para esta cuantizacion.
- La evaluacion de vision no esta cubierta: las mediciones corresponden solo a inferencia de texto.
- Q2_0 esta marcada como experimental y presenta mayor KLD que la Q2_0 de ISTA en seis de ocho conjuntos; el autor recomienda IQ2_XS para tamanos similares.
- IQ3_XXS no dispone de resultado en la muestra fresca en ingles C4.
- Las comparaciones usan la referencia BF16 de cada modelo y no constituyen rankings de capacidad ni afirmaciones de equivalencia estadistica.
- El chino es el idioma con mayor KLD en todos los niveles, lo que indica mayor degradacion relativa en ese idioma.
- La licencia swift-open-license-1.0 es de tipo other y la model card remite a licencia empresarial; es necesario revisar los terminos antes de uso comercial.
- No se detallan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto mas alla de las mediciones a 512 tokens.
- El despliegue requiere al menos 68 GB solo para pesos, lo que excluye hardware de consumo y exige nodos de datacenter.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taurusduan/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Modelo BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- GGUFs estandar: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- Checksums: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Web del autor: https://ukisai.com
- Producto Swift: https://ukisai.com/products/swift
- Paper referenciado: arxiv:2604.18556
- Paper referenciado: arxiv:2605.00649
