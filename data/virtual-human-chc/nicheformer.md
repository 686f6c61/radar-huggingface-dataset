# virtual-human-chc/Nicheformer

## Resumen

Nicheformer es un modelo fundacional basado en transformer encoder disenado para el analisis de datos de transcriptomica de celula unica y omica espacial. Lo desarrolla el grupo de Fabian Theis en Helmholtz Munich (Tejada-Lapuerta, Schaar et al.) y esta publicado en bioRxiv (2024) y en Nature Methods (2025). El modelo aprende representaciones de nichos celulares y sus interacciones mediante un objetivo de masked language modeling adaptado a datos de expresion genica, lo que permite obtener embeddings de celulas y contextos tisulares directamente utilizables en tareas posteriores de analisis.

El repositorio `virtual-human-chc/Nicheformer` es un fine-tune del modelo original `aletlvl/Nicheformer`, con 48.956.752 parametros y un peso total de aproximadamente 0,2 GB en formato safetensors. Su relevancia radica en que aborda un problema especifico de la biologia computacional: la necesidad de representaciones generalizables que funcionen a traves de distintas tecnologias espaciales (MERFISH, CosMx, Xenium, 10x Genomics), modalidades (espacial y disociada) y especies (humano y raton), reduciendo la dependencia de reentrenamientos por plataforma.

No es un modelo de lenguaje generativo de proposito general: es un encoder especializado que opera sobre secuencias de tokens geneticos con una longitud maxima de 1500 y un vocabulario de 25000 tokens. Se distribuye con licencia MIT y requiere `trust_remote_code=True` para su carga en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con masked language modeling |
| Parametros totales | 48.956.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1500 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma; el modelo opera sobre tokens geneticos, no texto natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, custom_code |
| Capas del encoder | 12 |
| Dimension oculta | 512 |
| Cabezas de atencion | 16 |
| Dimension feedforward | 1024 |
| Tamano de vocabulario | 25000 |
| Probabilidad de enmascaramiento | 15% |

## Arquitectura y entrenamiento

Nicheformer emplea un transformer encoder de 12 capas con dimension oculta de 512, 16 cabezas de atencion y dimension feedforward de 1024, siguiendo un esquema tipo BERT. El preentrenamiento utiliza masked language modeling con enmascaramiento dinamico: el 15% de los tokens seleccionados se procesan con la estrategia 80/10/10 (80% reemplazados por `[MASK]`, 10% por tokens aleatorios, 10% sin cambios). El modelo incorpora informacion de tipo celular, ensayo (assay) y modalidad como parte del procesamiento de entrada, y soporta codificacion posicional tanto aprendible como fija.

Los datos de entrenamiento provienen de expresion genica de celula unica de diversos tejidos y organismos. Cubre las modalidades espacial y disociada, las especies humano y raton, y las tecnologias MERFISH, CosMx, Xenium, varias versiones de 10x Genomics, CITE-seq y Smart-seq v4. El tokenizador requiere la carga de una media tecnologica (`technology_mean.npy`) para normalizar la entrada, y el modelo expone un metodo `get_embeddings` que permite extraer representaciones de una capa concreta (por ejemplo, `layer=-1`) con o sin contexto.

## Capacidades

- Extraccion de embeddings de celulas individuales y de contextos de nicho celular a partir de datos de expresion genica.
- Procesamiento de datos de transcriptomica espacial y disociada en un mismo espacio de representacion.
- Soporte multimodal de plataformas: MERFISH, CosMx, Xenium, 10x Genomics, CITE-seq y Smart-seq v4.
- Generalizacion entre especies: humano y raton.
- Integracion de metadatos de tipo celular, ensayo y modalidad en el proceso de tokenizacion.
- Extraccion de representaciones por capa mediante `get_embeddings`, con opcion de contexto activado o desactivado.
- No soporta tool calling, function calling, agentes ni generacion de texto libre: es un encoder de representaciones, no un modelo generativo.

## Casos de uso

- Integracion de datos multi-plataforma: usar los embeddings para armonizar muestras de Xenium, CosMx y MERFISH en un espacio comun, facilitando analisis conjuntos sin reentrenar por tecnologia.
- Anotacion de tipos celulares: entrenar un clasificador ligero sobre los embeddings extraidos con `get_embeddings` para transferir etiquetas entre datasets y especies.
- Analisis de nichos espaciales: representar el contexto de vecindad de cada celula para estudiar interacciones celula-celula en tejido y detectar dominios tisulares.
- Descubrimiento de subpoblaciones raras: aplicar clustering sobre las representaciones para identificar estados celulares poco frecuentes que pasan desapercibidos con metodos lineales.
- Traduccion entre modalidades: aprovechar el espacio compartido entre datos disociados y espaciales para imputar contexto espacial a partir de scRNA-seq convencional.
- Preprocesamiento en pipelines de biologia computacional: sustituir pasos de seleccion de genes y reduccion de dimensionalidad por embeddings preentrenados, reduciendo el ajuste manual por dataset.
- Validacion cruzada de experimentos: comparar nuevas muestras contra representaciones de referencia para detectar lotes anomalos o desviaciones de protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para los 48,9 millones de parametros; en la practica, el cuello de botella es la memoria para los datos de entrada (matrices de expresion y tokenizacion), no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100 o H100 solo resultan utiles para procesar lotes grandes de celulas en paralelo.
- Cabe en GPU de consumo: si, en practicamente cualquier RTX (2060 en adelante) e incluso en CPU para volumentes moderados.
- Opciones de despliegue: carga via `transformers` con `AutoModelForMaskedLM` y `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de encoder biologico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nicheformer (este repo) | 48,9 M | 1500 tokens | Espacial y disociada, humano y raton | MIT | Hugging Face |
| Nicheformer original (`aletlvl/Nicheformer`) | no disponible | 1500 tokens | Espacial y disociada, humano y raton | MIT | Hugging Face |
| Otros modelos fundacionales de celula unica (scGPT, Geneformer) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con scGPT o Geneformer no puede cuantificarse con los datos disponibles; se citan unicamente como alternativas de la misma categoria (modelos fundacionales de transcriptomica de celula unica).

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para datos de expresion genica; no generaliza a otros tipos de datos biologicos.
- El rendimiento depende de la calidad y el tipo de datos de entrada, y puede degradarse con tecnologias no cubiertas en el entrenamiento.
- Funciona mejor con las especies (humano, raton) y plataformas soportadas; el uso fuera de ese dominio no esta validado.
- Es un encoder de representaciones, no un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- La etiqueta de idioma `en` no implica capacidades linguisticas; el modelo opera sobre tokens geneticos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar el codigo antes de desplegarlo en produccion.
- Riesgo de sesgo derivado de la composicion del corpus de entrenamiento (tejidos, tecnologias y especies sobrerrepresentados).
- No se documentan riesgos de alucinacion en el sentido de modelos de lenguaje, pero las representaciones pueden producir agrupaciones espurias si la normalizacion de entrada (media tecnologica) no es correcta.
- Licencia MIT: permite uso comercial, pero se recomienda citar el trabajo original segun indica la model card.

## Enlaces

- Hugging Face: https://huggingface.co/virtual-human-chc/Nicheformer
- Modelo base: https://huggingface.co/aletlvl/Nicheformer
- Preprint bioRxiv: https://www.biorxiv.org/content/10.1101/2024.04.15.589472v1
- Publicacion Nature Methods: https://doi.org/10.1038/s41592-025-02814-z
- Repositorio GitHub: https://github.com/theislab/nicheformer
- Contacto: alejandro.tejadalapuerta@helmholtz-munich.de
