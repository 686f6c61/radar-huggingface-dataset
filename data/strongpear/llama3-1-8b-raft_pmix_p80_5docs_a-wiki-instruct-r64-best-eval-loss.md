# strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-WIKI-Instruct-r64-best-eval-loss

## Resumen

Este repositorio no contiene un modelo completo, sino un adaptador LoRA (PEFT) entrenado sobre `meta-llama/Llama-3.1-8B`. El identificador del repositorio, `Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-WIKI-Instruct-r64-best-eval-loss`, sugiere una configuración de ajuste fino con RAFT (Retrieval-Augmented Fine-Tuning), un esquema por el que el modelo aprende a responder preguntas a partir de documentos recuperados y a descartar fragmentos distractores. El sufijo `r64` corresponde a un rango LoRA de 64, y el repositorio ocupa 0,7 GB, coherente con un adaptador de ese rango sobre un modelo de 8 000 millones de parametros.

El modelo base, Llama 3.1 8B, es un transformer decoder-only denso de 8,03 mil millones de parametros con una ventana de contexto nominal de 128 000 tokens, desarrollado por Meta. Sobre esa base, el adaptador se orienta a tareas de generacion aumentada por recuperacion, presumiblemente en el dominio de Wikipedia (`A-WIKI`) y con cinco documentos en el contexto de entrenamiento (`5DOCS`).

La relevancia de esta publicacion es limitada y sobre todo experimental: la model card es la plantilla vacia de Hugging Face, sin ningun campo cumplimentado, y el repositorio acumula 0 descargas y 0 likes. No hay informacion sobre licencia, idiomas, datos de entrenamiento ni evaluacion, por lo que cualquier uso en produccion exige validacion previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion agrupada (GQA) en el modelo base; este repositorio es un adaptador LoRA sobre `meta-llama/Llama-3.1-8B` |
| Parametros totales | 8,03 mil millones en el modelo base; el adaptador LoRA anade un peso no especificado (repositorio de 0,7 GB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; no documentada especificamente para este adaptador |
| Tipos de cuantizacion | no disponibles para el adaptador; el modelo base admite BF16/FP16, INT8, y cuantizaciones GGUF, GPTQ y AWQ generadas por la comunidad |
| Idiomas soportados | no disponibles en la model card; el modelo base declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | no disponible (campo sin cumplimentar); el modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.20.0, transformers |
| Pipeline | text-generation |
| Tipo de adaptador | LoRA, rango 64 (segun el nombre del repositorio) |
| Modelo base | meta-llama/Llama-3.1-8B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con 32 capas, atencion con 8 cabezas KV y 32 cabezas de consulta (GQA), normalizacion RMSNorm y activacion SwiGLU, con un vocabulario de 128 256 tokens. Meta entreno este modelo base con del orden de 15 billones de tokens y lo sometio a un proceso de ajuste con datos de instrucciones y preferencias humanas. La ventana de contexto nativa es de 128 000 tokens.

Del adaptador en si no hay ningun dato verificable: la model card no describe datos de entrenamiento, numero de tokens, composicion del dataset, hiperparametros ni si hubo RLHF o DPO. Por el nombre del repositorio puede inferirse que se aplico RAFT, una variante de ajuste fino supervisado en la que cada ejemplo incluye documentos relevantes junto con distractores, de modo que el modelo aprende a citar y usar la evidencia correcta e ignorar la irrelevante. El sufijo `best-eval-loss` indica que el checkpoint publicado corresponde al mejor valor de perdida de evaluacion durante el entrenamiento, no al checkpoint final. Todo esto son inferencias a partir del identificador y no afirmaciones respaldadas por documentacion del autor.

## Capacidades

Las capacidades que se enumeran a continuacion son las del modelo base y las plausibles segun el esquema de entrenamiento indicado en el nombre del repositorio; no estan verificadas por el autor.

- Generacion de texto y conversacion multi-turno en el modelo base, con contexto de hasta 128 000 tokens.
- Respuesta a preguntas condicionada por documentos recuperados, con tendencia a citar o apoyarse en la evidencia aportada en el contexto (objetivo declarado de RAFT).
- Manejo de contextos con mezcla de documentos relevantes y distractores, si el entrenamiento siguio el esquema `PMIX_P80_5DOCS` sugerido por el nombre.
- Razonamiento sobre un maximo aproximado de cinco documentos por consulta, segun la convencion de nombres del autor.
- Instrucciones generales de chat heredadas del modelo base, presumiblemente con menor calidad tras el ajuste especifico.
- Soporte de tool calling y function calling: heredado del modelo base (Llama 3.1 admite plantillas de herramientas), pero no verificado en este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).
- Capacidades multilingues: no documentadas para el adaptador; el modelo base cubre ocho idiomas de forma oficial, con dominio desigual.

## Casos de uso

- Preguntas y respuestas sobre documentacion interna: el adaptador se conecta a un recuperador (por ejemplo, busqueda vectorial o BM25) que aporta cinco fragmentos por consulta y el modelo genera la respuesta apoyandose en ellos, descartando los fragmentos irrelevantes. Es el escenario para el que fue disenado segun el nombre del repositorio.
- Atencion al cliente sobre base de conocimiento: integrado en un pipeline RAG donde cada consulta recupera articulos de ayuda; el modelo redacta la respuesta final y reduce el riesgo de mezclar informacion de articulos distintos.
- Asistente de soporte tecnico con citas: al haber sido entrenado con documentos y distractores, tiende a referenciar la fuente concreta en lugar de improvisar, lo que facilita la verificacion humana en entornos de soporte interno.
- Analisis de documentacion regulatoria o contractual: con 128 000 tokens de contexto en la base, permite cargar expedientes completos y formular preguntas acotadas; el ajuste RAFT ayuda a mantener la respuesta anclada al expediente.
- Chatbot sobre una wiki corporativa: el sufijo `A-WIKI` sugiere un entrenamiento sobre contenido tipo Wikipedia, lo que encaja con asistentes internos que responden sobre articulos enciclopedicos o manuales extensos.
- Filtrado y reranking de resultados de busqueda: el modelo puede evaluar si un pasaje recuperado responde realmente a la pregunta, util como etapa de verificacion en un pipeline RAG de dos fases.
- Experimentacion academica en recuperacion aumentada: sirve como punto de partida reproducible para comparar variantes de RAFT (numero de documentos, proporcion de distractores) frente al modelo base sin ajustar.
- Prototipado rapido de asistentes de lectura de documentos: con despliegue en llama.cpp u Ollama tras fusionar o cargar el adaptador, es viable en hardware de consumo para demos y validaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K, evaluaciones de RAG (por ejemplo, fidelidad o relevancia de respuesta) ni comparaciones con el modelo base. El unico indicio de calidad es el sufijo `best-eval-loss` del nombre del repositorio, que hace referencia a una perdida de evaluacion cuyo valor no se publica.

## Requisitos de hardware

Las cifras siguientes son estimaciones para el modelo base Llama 3.1 8B, ya que el adaptador anade un coste marginal (0,7 GB de pesos) y requiere cargar el modelo base completo.

- VRAM en BF16/FP16: en torno a 16 GB solo para pesos, mas la cache KV. Con contexto corto (4 000-8 000 tokens) el total se situa alrededor de 18-22 GB.
- Cache KV a contexto largo: la arquitectura de Llama 3.1 8B consume aproximadamente 128 KiB por token en FP16, lo que supone unos 16 GB adicionales para llenar los 128 000 tokens de contexto. Sin cuantizacion de la cache KV, el contexto completo no cabe en una GPU de 24 GB.
- Cuantizacion INT8: alrededor de 9 GB de pesos, viable en RTX 3090, RTX 4090, L40S o A100 40 GB.
- Cuantizacion de 4 bits (GGUF Q4_K_M o AWQ/GPTQ): aproximadamente 4,9-5,5 GB, lo que permite ejecucion en RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB y equipos Apple Silicon con 16 GB o mas de memoria unificada.
- GPU recomendadas para produccion: A100 40/80 GB, H100 80 GB o L40S para servicio concurrente; RTX 4090 y RTX 3090 para desarrollo y cargas moderadas.
- Opciones de despliegue: vLLM o TGI para el modelo base en BF16 con el adaptador cargado dinamicamente; llama.cpp y Ollama si se fusiona el adaptador con la base y se convierte a GGUF; tambien es posible servirlo con transformers y PEFT directamente, aunque con menor throughput.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor para este adaptador, y las del modelo base varian fuertemente segun hardware, lote y longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (RAFT sobre Llama 3.1 8B) | 8,03 mil millones (base) + LoRA r64 | 128 000 tokens (base) | safetensors (PEFT) | no disponible | Requiere cargar el modelo base; sin benchmarks ni model card; 0 descargas |
| meta-llama/Llama-3.1-8B | 8,03 mil millones | 128 000 tokens | safetensors | Llama 3.1 Community License | Modelo base sin ajuste de instrucciones; punto de partida del adaptador |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 mil millones | 128 000 tokens | safetensors | Llama 3.1 Community License | Alternativa de referencia para chat general; no especializada en RAG |
| Qwen2.5-7B-Instruct | 7,61 mil millones | 128 000 tokens | safetensors | Apache 2.0 | Alternativa de tamano similar, con licencia mas permisiva y buen rendimiento en tareas de instrucciones |

No hay datos de rendimiento que permitan comparar este adaptador con las alternativas en igualdad de condiciones; la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Model card vacia: no se documenta licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluacion. No hay base para asumir un comportamiento concreto.
- Licencia indeterminada: el repositorio no declara licencia. Aunque el modelo base usa la Llama 3.1 Community License (que permite uso comercial con condiciones, incluida una licencia adicional si se superan los 700 millones de usuarios mensuales), la ausencia de licencia explicita en este repositorio genera incertidumbre juridica para uso comercial.
- Riesgo de alucinacion: el ajuste RAFT busca reducirla, pero no la elimina; el modelo puede generar afirmaciones no sustentadas por los documentos aportados, especialmente si el recuperador entrega fragmentos poco relevantes.
- Dependencia del recuperador: la calidad de las respuestas depende criticamente de la etapa de recuperacion. El modelo no accede a conocimiento externo por si mismo.
- Contexto de entrenamiento limitado a unos cinco documentos segun el nombre del repositorio, lo que puede degradar el comportamiento si en inferencia se aportan muchos mas pasajes.
- Idiomas: no declarados. Aunque el modelo base cubre ocho idiomas, el ajuste se realizo presumiblemente sobre un corpus en ingles, y el rendimiento en castellano no esta verificado y puede haberse deteriorado.
- Riesgo de sobreajuste al dominio: un ajuste especifico sobre contenido tipo Wikipedia puede reducir la calidad en conversacion general respecto al modelo base o al Instruct.
- Sesgos: heredados de los datos de preentrenamiento de Llama 3.1, sin mitigaciones documentadas por parte del autor del adaptador.
- Trazabilidad nula: 0 descargas, 0 likes, sin repositorio de codigo, sin paper y sin contacto del autor. No hay forma de reproducir el entrenamiento ni de verificar el proceso.
- Fechas del repositorio: la fecha de creacion indicada es el 26 de septiembre de 2026, posterior a la fecha habitual de publicacion de la familia Llama 3.1; conviene verificar la procedencia del artefacto antes de usarlo.
- Advertencia de seguridad: cargar un adaptador PEFT de origen desconocido implica ejecutar pesos de terceros; se recomienda revisar el contenido del repositorio antes de instanciarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_5DOCS_A-WIKI-Instruct-r64-best-eval-loss
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base (variante Instruct): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Referencia citada en las etiquetas del repositorio (calculadora de impacto ambiental, no relacionada con el modelo): https://arxiv.org/abs/1910.09700
