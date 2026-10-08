# vmpetrikov/bge-small-en-v1.5-conll2003-ner

## Resumen

bge-small-en-v1.5-conll2003-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning del encoder BGE-small-en-v1.5 de BAAI sobre el corpus CoNLL-2003. Lo publica el usuario vmpetrikov en Hugging Face bajo licencia MIT, con la libreria transformers y pesos en safetensors. La tarea declarada es token-classification, es decir, etiquetado BIO de tokens para extraer personas, organizaciones, localizaciones y entidades diversas.

Se trata de un modelo denso de tipo Transformer encoder-only (familia BERT) con 33.215.625 parametros y un repo de apenas 0,1 GB. Ese tamano lo situa en la gama ultraligera: cabe holgadamente en cualquier GPU de consumo, en iGPU e incluso en CPU, con latencias de milisegundos por frase. La longitud de contexto heredada del modelo base es de 512 tokens.

Su relevancia practica es la de un extractor de entidades barato y desplegable casi en cualquier sitio: extraccion de entidades en pipelines de ingesta de documentos, preprocesado para sistemas RAG, anonimizacion de datos personales o etiquetado de registros estructurados. La model card advierte de que el dataset de entrenamiento figura como "unknown" y no incluye seccion de usos previstos, por lo que la informacion sobre datos y limites es parcial; el nombre del modelo apunta a CoNLL-2003 y las metricas declaradas son coherentes con ese corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (hereda la arquitectura de BAAI/bge-small-en-v1.5), con cabeza de clasificacion de tokens |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (heredada del modelo base BGE-small-en-v1.5; no declarada explicitamente en la model card) |
| Tipos de cuantizacion | no disponibles en la model card; al ser un BERT pequeno admite fp16/bf16, int8 dinamico y ONNX Runtime mediante herramientas externas (Optimum, PyTorch) |
| Idiomas soportados | no disponible. El modelo base BGE-small-en-v1.5 esta orientado a ingles y CoNLL-2003 es un corpus en ingles; el autor no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Tarea | token-classification (NER, esquema BIO) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | BAAI/bge-small-en-v1.5 |
| Framework de entrenamiento | Transformers 4.50.0, PyTorch 2.11.0+cu128, Datasets 3.4.1, Tokenizers 0.21.4 |

## Arquitectura y entrenamiento

El modelo reutiliza el encoder de BGE-small-en-v1.5, un transformer encoder-only de la familia BERT con aproximadamente 33 millones de parametros, sobre el que se anade una cabeza de clasificacion por token (token classification head) para producir etiquetas BIO. El numero total de parametros (33.215.625) es consistente con un encoder de esta familia mas una cabeza de clasificacion de reducidas dimensiones. No hay atencion lineal, decodificacion especulativa ni componentes MoE: es un encoder denso clasico de una sola torre, sin generacion autoregresiva.

El autor no documenta la composicion del dataset (la model card indica literalmente "This model is a fine-tuned version of BAAI/bge-small-en-v1.5 on an unknown dataset"), aunque el identificador del modelo referencia CoNLL-2003, el corpus de referencia de NER en ingles con las categorias persona (PER), organizacion (ORG), localizacion (LOC) y miscelanea (MISC) en formato BIO. No se menciona RLHF, DPO ni ninguna fase de alineacion, algo esperable en una tarea discriminativa de etiquetado.

Los hiperparametros de entrenamiento si estan publicados: learning rate 5e-05, scheduler lineal, AdamW con betas (0,9; 0,999) y epsilon 1e-08, batch de entrenamiento 32, batch de evaluacion 16, semilla 42 y 20 epocas. El entrenamiento registra 313 pasos por epoca, lo que permite estimar el tamano efectivo del conjunto de entrenamiento. La mejor metrica de validacion se alcanza en la septima epoca (F1 0,9218); a partir de ahi la perdida de validacion empieza a repuntar ligeramente, senal de un sobreajuste leve en las ultimas epocas.

## Capacidades

- Reconocimiento de entidades nombradas por token: extrae y clasifica entidades en texto en ingles segun el esquema habitual de CoNLL-2003 (PER, ORG, LOC, MISC con etiquetas B- e I-).
- Clasificacion por token con salida de etiquetas y puntuaciones por token, integrable en pipelines de `transformers` mediante `pipeline("token-classification")` o `AutoModelForTokenClassification`.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para parrafos, abstracts, articulos cortos o registros de formulario.
- Inferencia muy rapida y de bajo coste: 33,2 millones de parametros permiten ejecucion en CPU sin GPU dedicada.
- Capacidad multilingue: no disponible. El modelo base y el corpus de referencia son en ingles; no hay evidencia declarada de soporte para castellano u otros idiomas.
- Tool calling / function calling: no soportado. Es un modelo de clasificacion, no generativo, por lo que no emite texto libre ni llamadas a herramientas.
- Modo "thinking", razonamiento multi-paso, agentes, vision y audio: no soportados.

## Casos de uso

- Extraccion de entidades en pipelines de ingesta documental: se puede aplicar a abstracts, noticias o informes en ingles para poblar una base de datos de personas, organizaciones y lugares citados, con un throughput alto gracias a sus 33 millones de parametros.
- Preprocesado para sistemas RAG: etiquetar entidades antes de la indexacion permite enriquecer los metadatos de los fragmentos y mejorar el filtrado por entidad en la recuperacion.
- Anonimizacion y cumplimiento normativo: detectar nombres de persona y organizaciones en textos para enmascararlos antes de almacenar o compartir datos, ejecutable en local sin enviar informacion a terceros.
- Enriquecimiento de CRM y bases de contactos: procesar correos, notas de reunion o tickets en ingles para extraer empresas y localizaciones y vincularlas a registros existentes.
- Analisis de medios y monitorizacion de marca: detectar menciones de una organizacion concreta y de personas asociadas en flujos de noticias en ingles, con coste de inferencia minimo.
- Investigacion academica en PLN: linea base reproducible para experimentos de NER, ablaciones de fine-tuning sobre BGE-small o comparaciones de tecnicas de destilacion, dado el bajo coste computacional.
- Etiquetado asistido de corpus: preanotar grandes volumenes de texto para que anotadores humanos corrijan, reduciendo el esfuerzo manual en tareas de construccion de datasets.
- Clasificacion de entidades en tiempo real en el borde (edge): al pesar decimas de GB, puede ejecutarse en dispositivos modestos o dentro de servicios con presupuesto de memoria limitado.

## Benchmarks y rendimiento

El model-index del repositorio no contiene entradas (`results: []`), pero la model card publica las metricas obtenidas en el conjunto de evaluacion. Son datos declarados por el autor.

| Metrica | Valor |
|---|---|
| Loss | 0,0850 |
| Precision | 0,9094 |
| Recall | 0,9286 |
| F1 | 0,9189 |
| Accuracy | 0,9817 |

Evolucion durante el entrenamiento (mejor F1 en la epoca 7):

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1 | 313 | 0,1375 | 0,8045 | 0,8718 | 0,8368 | 0,9700 |
| 2 | 626 | 0,0913 | 0,8810 | 0,9110 | 0,8957 | 0,9792 |
| 3 | 939 | 0,0766 | 0,8742 | 0,9177 | 0,8954 | 0,9794 |
| 4 | 1252 | 0,0765 | 0,8856 | 0,9211 | 0,9030 | 0,9807 |
| 5 | 1565 | 0,0787 | 0,9007 | 0,9270 | 0,9137 | 0,9814 |
| 6 | 1878 | 0,0762 | 0,9007 | 0,9251 | 0,9127 | 0,9819 |
| 7 | 2191 | 0,0800 | 0,9138 | 0,9298 | 0,9218 | 0,9828 |
| 8 | 2504 | 0,0819 | 0,9127 | 0,9270 | 0,9198 | 0,9824 |
| 9 | 2817 | 0,0850 | 0,9094 | 0,9286 | 0,9189 | 0,9817 |

No hay en la informacion disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks, ya que el modelo es un encoder de clasificacion y no un modelo generativo. No se han publicado comparaciones oficiales con otros sistemas NER en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32 (33,2 M x 4 bytes), unos 66 MB en fp16/bf16 y unos 33 MB en int8. El repositorio completo ocupa 0,1 GB.
- Memoria total recomendada en produccion: entre 0,5 y 2 GB de RAM o VRAM contando el runtime de PyTorch, tokenizador y buffers de activaciones (estimacion orientativa).
- GPU: funciona en cualquier GPU CUDA o ROCm, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100. No necesita GPU de datacenter en absoluto.
- GPU de consumo: si, cabe con margen enorme en cualquier GPU de consumo actual e incluso en iGPU con soporte de CUDA/ROCm o en aceleradores tipo Apple Silicon con MPS.
- CPU: perfectamente viable en CPU (AVX2/AVX-512) para lotes pequenos o moderados; es uno de los escenarios naturales de este modelo.
- Opciones de despliegue: pipelines de transformers, Hugging Face Inference Endpoints (el repo esta marcado como `endpoints_compatible`), ONNX Runtime, Optimum, TorchScript, FastAPI con PyTorch, y servidores de clasificacion/embedding. vLLM esta orientado a modelos generativos, por lo que su uso con un encoder de token-classification no es el camino estandar.
- Latencia y throughput: no publicados por el autor. Como referencia orientativa de orden de magnitud, una pasada de una frase corta en GPU estaria por debajo de los 5 ms y en CPU en el rango de decenas de milisegundos por secuencia, con throughputs de varios cientos o miles de secuencias por segundo en GPU con batching (estimacion, no medida oficialmente).
- Cuantizacion: al no publicarse variantes GGUF ni GPTQ, el despliegue habitual es fp32 o fp16; la cuantizacion dinamica a int8 via ONNX Runtime es una opcion razonable en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vmpetrikov/bge-small-en-v1.5-conll2003-ner | 33.215.625 | 512 tokens (heredado) | NER en ingles (token-classification) | MIT | Hugging Face, safetensors, transformers |
| dslim/bert-base-NER | ~110 millones (BERT-base) | 512 tokens | NER en ingles (PER, ORG, LOC, MISC) | no verificado en esta ficha | Hugging Face, transformers |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 millones | 512 tokens | Recuperacion/embeddings de frases | MIT | Hugging Face, transformers |
| Otros fine-tunes de BGE-small para NER | no disponible | 512 tokens | token-classification | variable | Hugging Face |

No se dispone de resultados de benchmark comparables verificados en la informacion proporcionada para enfrentar este modelo con alternativas de la misma categoria; la unica metrica disponible es el F1 0,9189 declarado por el autor. La ventaja estructural frente a alternativas basadas en BERT-base es el menor consumo de memoria (aproximadamente un tercio de los parametros) a cambio de una capacidad de representacion potencialmente menor.

## Limitaciones y advertencias

- Dataset no documentado: la model card dice explicitamente "on an unknown dataset" y deja las secciones de descripcion, usos previstos y datos de entrenamiento como "More information needed". El identificador sugiere CoNLL-2003, pero no esta confirmado por el autor.
- Idioma: el modelo base (BGE-small-en-v1.5) y el corpus de referencia son en ingles. No hay evidencia de calidad en castellano ni en otros idiomas, y usarlo fuera del ingles deberia considerarse experimental.
- Cobertura de entidades limitada: el esquema de CoNLL-2003 cubre unicamente PER, ORG, LOC y MISC. No reconoce fechas, importes, identificadores fiscales, direcciones completas ni entidades especificas de dominio.
- Dominio: CoNLL-2003 procede de texto periodistico. El rendimiento fuera de ese registro (informes tecnicos, historiales clinicos, contratos, lenguaje informal) puede degradarse de forma notable.
- Sobreajuste leve: la perdida de validacion empeora a partir de la epoca 7 y el entrenamiento se detiene en la 20, sin que haya una metrica final publicada correspondiente a la ultima epoca; conviene validar sobre datos propios.
- Riesgo de alucinacion: al ser un clasificador discriminativo no genera texto, pero si puede producir falsos positivos, asignar entidades a tokens incorrectos o fragmentar entidades compuestas de forma erronea.
- Reproducibilidad limitada: no se publican el dataset exacto ni la particion de validacion, y las versiones declaradas de las librerias (PyTorch 2.11.0, Transformers 4.50.0) deben fijarse para reproducir el entrenamiento.
- Adopcion y mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento posterior ni issues resueltos; es un modelo recien publicado y sin validacion de la comunidad.
- Licencia: MIT, permisiva y apta para uso comercial, siempre que se conserve el aviso de copyright y la atribucion correspondiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vmpetrikov/bge-small-en-v1.5-conll2003-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset CoNLL-2003 en Hugging Face: https://huggingface.co/datasets/eriktks/conll2003
- Documentacion de transformers para token classification: https://huggingface.co/docs/transformers/tasks/token_classification
- Paper de la familia BGE (C-Pack: Packed Resources For General Chinese Embeddings): https://arxiv.org/abs/2309.07597
- Paper de la tarea CoNLL-2003 (Tjong Kim Sang y De Meulder): https://aclanthology.org/W03-0419/
