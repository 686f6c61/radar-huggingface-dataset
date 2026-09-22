# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_42_LoRA_rank_4

## Resumen

El modelo `WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_42_LoRA_rank_4` es un adaptador LoRA (Low-Rank Adaptation) publicado en HuggingFace por el usuario WijewardhanaNT sobre el modelo base `meta-llama/Llama-3.1-8B`. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe cargarse junto al modelo base mediante la librería PEFT. El repositorio ocupa 0,3 GB y fue creado el 22 de septiembre de 2026.

La nomenclatura del identificador sugiere que el adaptador se ha entrenado sobre el corpus XNLI (Cross-lingual Natural Language Inference) en ingles y hindi, con un subconjunto de 5000 ejemplos y un rango de LoRA igual a 4. Se trata, por tanto, de un experimento de ajuste fino orientado a una tarea de inferencia textual (entailment, neutral, contradiction) en dos idiomas, mas que a un asistente conversacional de proposito general.

Su relevancia es principalmente academica y experimental: permite estudiar como un rango de LoRA muy bajo (r=4) afecta a la transferencia cross-lingual ingles-hindi sobre un modelo de 8 mil millones de parametros, con un coste de almacenamiento minimo. La model card original esta practicamente vacia y no documenta datos de entrenamiento, hiperparametros ni evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decodificador (base: Llama 3.1 8B) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8.030 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors (precision completa). El modelo base fusionado admite cuantizacion a 8/4 bits (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | No disponible en la metadata; el identificador indica ingles e hindi. El modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y thai |
| Licencia | No disponible. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). Libreria: peft |
| Rango de LoRA | 4 (segun el identificador del repositorio) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Version de PEFT | 0.17.1 |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B, un transformer decodificador autoregresivo con 32 capas, dimension de modelo 4096, 32 cabezas de atencion con 8 cabezas KV (Grouped Query Attention), RoPE y un vocabulario de 128.256 tokens. La tecnica LoRA congela los pesos originales e inserta matrices de bajo rango en determinadas proyecciones, de forma que el numero de parametros entrenables queda reducido en varios ordenes de magnitud. Con rango 4, el numero de parametros entrenables es muy bajo incluso para un modelo de 8.000 millones de parametros.

No hay informacion publicada sobre el procedimiento de entrenamiento: no se detallan el numero de tokens vistos, la composicion del dataset mas alla de lo que sugiere el identificador (XNLI, ingles e hindi, 5000 ejemplos), los hiperparametros (learning rate, epochs, batch size, modulos objetivo de LoRA, alpha), ni si se aplico RLHF, DPO o alguna otra etapa de alineamiento. Tampoco se especifica si el ajuste se realizo en precision mixta bf16 o fp16, ni el hardware empleado. La unica referencia tecnica concreta es la version de PEFT utilizada (0.17.1) y la etiqueta `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla de la model card y no al entrenamiento del modelo.

## Capacidades

- Inferencia textual (Natural Language Inference): clasificacion de pares premisa-hipotesis en entailment, neutral y contradiction, segun lo que sugiere el identificador basado en XNLI.
- Generacion de texto: el pipeline declarado en HuggingFace es `text-generation`, heredado del modelo base.
- Procesamiento bilingue ingles-hindi (segun el identificador del repositorio); no hay confirmacion en la model card.
- Capacidades del modelo base heredadas: generacion de texto, razonamiento basico, generacion de codigo, matematicas elementales y soporte multilingue en los ocho idiomas oficiales de Llama 3.1.
- Tool calling y function calling: no confirmado en el adaptador; Llama 3.1 8B los soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no confirmado en el adaptador; disponibles en el modelo base en grado limitado.
- Capacidad de vision o audio: no disponible (ni el base ni el adaptador las incorporan).
- Modo thinking explicito: no disponible.

## Casos de uso

- Deteccion de contradicciones en documentacion tecnica: dado un par de fragmentos en ingles o hindi, el adaptador clasifica si uno implica al otro o lo contradice. Util para mantener coherencia entre manuales, especificaciones y notas de version.
- Verificacion de hechos (fact-checking) en pipelines de moderacion: la NLI permite comprobar si una afirmacion esta respaldada por una fuente recuperada antes de publicarla.
- Mitigacion de alucinaciones en sistemas RAG: comparar la respuesta generada con los pasajes recuperados mediante NLI para descartar respuestas no sustentadas.
- Curacion y filtrado de datasets multilingues: clasificar grandes volumenes de pares de frases en ingles y hindi para eliminar ejemplos contradictorios o redundantes antes de entrenar otros modelos.
- Investigacion academica sobre LoRA de rango bajo: sirve como punto de referencia reproducible para medir la perdida de rendimiento al reducir el rango a 4 en tareas cross-lingual.
- Experimentos de transferencia cross-lingual ingles-hindi: permite estudiar si el ajuste en un idioma de bajos recursos como el hindi degrada el rendimiento en ingles y viceversa.
- Reordenacion (reranking) de documentos en buscadores: usar la puntuacion de entailment como senal de relevancia entre consulta y documento en corpus bilingues.
- Base para ampliaciones: al ser un adaptador PEFT de bajo rango, puede combinarse o compararse facilmente con otros adaptadores sobre el mismo modelo base sin duplicar los 16 GB de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion cumplimentada y no hay datos de exactitud en XNLI, MMLU, HumanEval, GSM8K ni de ninguna otra métrica. El repositorio no registra descargas ni valoraciones que permitan inferir un uso validado.

## Requisitos de hardware

- El adaptador por si solo requiere un espacio minimo en disco (el repositorio completo ocupa 0,3 GB, incluyendo posibles estados del optimizador) y puede cargarse en CPU para su fusion con el modelo base.
- La inferencia real la determina el modelo base Llama 3.1 8B fusionado con el adaptador. Estimaciones habituales para 8.000 millones de parametros:
  - BF16/FP16: en torno a 16 GB de VRAM para los pesos, mas memoria para el contexto KV.
  - INT8: en torno a 8-9 GB de VRAM.
  - GGUF Q4_K_M: en torno a 5 GB de VRAM.
  - GGUF Q5_K_M: en torno a 5,5-6 GB de VRAM.
- Cabe en GPU de consumo: RTX 3090, RTX 4090 (24 GB) en BF16 con contexto moderado, y RTX 3060/4060 Ti (12-16 GB) en cuantizacion de 4 u 8 bits. En GPUs con 8 GB es posible con cuantizacion agresiva y contexto reducido.
- GPU de datacenter recomendadas para produccion: A100 40/80 GB, H100 80 GB, L40S, siempre sobredimensionadas respecto al modelo por el coste del cache KV a contextos largos.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM con soporte LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador en los pesos y convertir a GGUF, y text-generation-inference para servicio HTTP.
- Latencia y throughput: no disponibles. Cualitativamente, un LoRA de rango 4 anadido a la inferencia tiene un coste computacional despreciable una vez fusionado con los pesos base, por lo que el rendimiento es practicamente identico al de Llama 3.1 8B sin ajustar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de otros adaptadores XNLI en ingles-hindi con los que comparar directamente. La tabla siguiente compara las caracteristicas publicas de los modelos base de la misma categoria (aproximadamente 7-9 mil millones de parametros), no el rendimiento del adaptador, que se desconoce.

| Modelo base | Parametros | Contexto | Licencia | Idiomas declarados | Formato |
|---|---|---|---|---|---|
| Llama 3.1 8B (base de este adaptador) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | 8 idiomas oficiales | safetensors, GGUF |
| Mistral 7B v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | Centrado en ingles | safetensors, GGUF |
| Qwen2.5 7B | 7,62 B | 32.000 tokens nativos, ampliable con YaRN | Apache 2.0 | Mas de 29 idiomas | safetensors, GGUF |

En cuanto a alternativas de la misma tarea (adaptadores LoRA para NLI multilingue), no hay informacion disponible en la busqueda realizada. Como referencia metodologica, la comparacion natural de este adaptador seria contra un ajuste fino completo de Llama 3.1 8B sobre el mismo subconjunto de XNLI y contra variantes con rangos de LoRA superiores (8, 16, 32), pero no se han publicado resultados.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. No es apto para produccion sin una evaluacion propia previa.
- Licencia del adaptador no especificada. Al derivar de Llama 3.1 8B, es previsible que se apliquen los terminos de la Llama 3.1 Community License, que impone restricciones de uso comercial, obligacion de atribucion y clausulas especificas para productos con mas de 700 millones de usuarios mensuales. Conviene verificar la licencia antes de cualquier uso comercial.
- Sesgos y alucinaciones: hereda los sesgos del corpus XNLI y del modelo base. En una tarea de clasificacion de tres etiquetas el riesgo de alucinacion se limita a etiquetas mal asignadas, pero el adaptador podria generar texto libre incoherente si se usa en modo generativo puro.
- Riesgo de sobreajuste: con 5000 ejemplos y rango 4, el adaptador puede ajustarse en exceso a las particularidades del subconjunto de entrenamiento y generalizar mal a dominios distintos de XNLI.
- Ambiguedad del identificador: no se especifica a que se refieren los valores `5000`, `percentage_1_42` ni `rank_4`. La interpretacion de que 5000 es el numero de ejemplos y 1,42 el porcentaje del dataset es una lectura de la nomenclatura, no un dato confirmado.
- Incoherencia de pipeline: el repositorio declara `text-generation` cuando la tarea aparente es de clasificacion NLI. Hay que verificar si la cabeza de clasificacion se anadio durante el ajuste o si el adaptador se entreno sobre el modelo causal puro.
- Cobertura linguistica limitada: solo ingles e hindi segun el identificador. No hay evidencia de soporte para espanol ni para el resto de idiomas del modelo base.
- Sin validacion externa: cero descargas y cero likes. El modelo no ha sido reproducido ni auditado por terceros.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados correspondian a paginas corporativas de Microsoft), por lo que no existe documentacion externa que complemente la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_42_LoRA_rank_4
- Modelo base Llama 3.1 8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://huggingface.co/docs/peft/index
- Articulo de Lacoste et al. sobre emisiones de carbono, citado en la etiqueta `arxiv:1910.09700` de la model card: https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo en la busqueda realizada.
