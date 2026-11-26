# Synthyra/ESMFold2-300

## Resumen

ESMFold2-300 es un modelo de prediccion de estructura de proteinas publicado por Synthyra bajo el identificador `Synthyra/ESMFold2-300`. Empaqueta el checkpoint `biohub/ESMFold2-Experimental-Fast-base300M-step1500k` junto con el runtime FastPLMs y una cabeza de confianza nativa adaptada por Synthyra para Hugging Face Transformers. El modelo acepta secuencias de aminoacidos en bruto o especificaciones tipadas de complejos moleculares y devuelve estructuras en formato mmCIF, ademas de puntuaciones pLDDT, PAE, pTM e ipTM.

Con aproximadamente 178,9 millones de parametros efectivos (repo de 1,4 GB), se posiciona como una variante ligera orientada a inferencia rapida dentro de la familia ESMFold2. Su interes actual radica en que permite plegar proteinas y complejos multiméricos en hardware modesto, con una cabeza de confianza entrenada especificamente para calibrar las predicciones, algo critico cuando se usa la estructura predicha como entrada de pipelines downstream.

La licencia MIT y la integracion con `transformers` mediante `trust_remote_code=True` lo hacen especialmente atractivo para integracion en flujos de trabajo de biologia computacional sin fricciones legales ni de infraestructura. No obstante, el modelo esta claramente orientado a extraccion de caracteristicas y plegado, no a generacion de texto ni tareas de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMFold2 (protein language model con modulo de plegado por difusion) |
| Parametros totales | 178.891.050 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32/bf16 en carga) |
| Idiomas soportados | no disponible (modelo de proteinas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Libreria | transformers (con `trust_remote_code=True`) |
| Requisitos | Python 3.12-3.14, PyTorch 2.14, Transformers 5.17 |
| Tamano del repo | 1,4 GB |

## Arquitectura y entrenamiento

ESMFold2-300 combina un backbone de protein language model (heredero de la linea ESM) con un modulo de plegado basado en difusion. El proceso de plegado utiliza multiples pasos de difusion (15 en la configuracion experimental del quick start) y bucles de reciclado (3 en la evaluacion reportada). El modelo acepta secuencias individuales o complejos multiméricos especificados mediante objetos tipados (`ProteinInput`), lo que permite plegar cadenas multiples de forma nativa.

El checkpoint base proviene de `biohub/ESMFold2-Experimental-Fast-base300M-step1500k`, mientras que la cabeza de confianza fue entrenada por Synthyra sobre el dataset [AtlasFold-Data](https://huggingface.co/datasets/lhallee/AtlasFold-Data) durante 780 actualizaciones (18,1 horas), manteniendo congelados el backbone y el modelo de plegado. El entrenamiento muestreo de 475.969 estructuras elegibles, incluyendo monomeros, dimeros y complejos mayores. Se uso el checkpoint final de la media movil exponencial (EMA) para la evaluacion. La cabeza de confianza devuelve pLDDT, PAE, pTM e ipTM, y su calculo es opcional.

## Capacidades

- Prediccion de estructura tridimensional de proteinas a partir de secuencias de aminoacidos.
- Plegado de complejos multiméricos (dimeros y complejos mayores) mediante especificaciones tipadas de entrada.
- Generacion de puntuaciones de confianza calibradas: pLDDT, PAE, pTM e ipTM.
- Extraccion de caracteristicas (feature extraction) del backbone proteico.
- Clases de clasificacion de secuencia y de token disponibles, aunque sus cabezas estan inicializadas de novo y requieren fine-tuning antes de interpretar sus logits.
- Soporte de chunking configurable (`set_chunk_size`) para gestionar secuencias largas.
- Control de semilla para reproducibilidad en el muestreo de difusion.
- Salida en formato mmCIF lista para su uso en pipelines estructurales.
- No soporta tool calling, agentes ni capacidades multilingues de lenguaje natural.

## Casos de uso

- Prediccion de estructura de proteinas en pipelines de biologia computacional: el modelo pliega secuencias en bruto y escribe mmCIF, lo que permite integrarlo en flujos automatizados de analisis estructural sin intervencion manual.
- Plegado de complejos proteina-proteina: la entrada tipada con multiples `ProteinInput` permite modelar dimeros y complejos mayores, util para estudiar interacciones moleculares.
- Filtrado por confianza en cribados masivos: las puntuaciones pLDDT, pTM e ipTM permiten descartar predicciones poco fiables antes de analisis costosos (docking, dinamica molecular).
- Anotacion de desorden intrinseco: la AUROC de 0,856 para discriminar residuos no resueltos frente a resueltos permite usar el modelo como proxy de regiones desordenadas.
- Extraccion de embeddings proteicos para modelos downstream: el backbone puede usarse como extractor de caracteristicas en tareas de clasificacion o regresion, con fine-tuning de las cabezas.
- Generacion de estructuras para diseno de farmacos: las estructuras predichas con confianza calibrada sirven como entrada para docking virtual y cribado de compuestos.
- Validacion de hipotesis en investigacion academica: el bajo coste computacional (178,9 M de parametros) permite ejecutar experimentos exploratorios en GPU de consumo.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 512 objetivos del split de test, con 5 predicciones por objetivo, 3 bucles de reciclado y 50 pasos de difusion. Los intervalos son del 95% por bootstrap sobre objetivos.

| Metrica | ESMFold2-300 | Intervalo 95% |
|---|---:|---|
| pLDDT vs lDDT all-atom (Spearman) | 0,88003 | 0,85090 - 0,90258 |
| pTM vs TM-score (Spearman) | 0,84004 | 0,80621 - 0,86693 |
| ipTM vs DockQ (Spearman) | 0,81403 | 0,76544 - 0,85119 |
| MAE de pLDDT atomico | 0,07867 | 0,07617 - 0,08124 |
| Error de calibracion (10 bins) | 0,00426 | 0,00241 - 0,00831 |
| Entropia cruzada pLDDT | 2,72722 | 2,68388 - 2,77285 |
| Entropia cruzada PAE | 2,81677 | 2,76512 - 2,86575 |
| Precision de seleccion lDDT intra-objetivo | 0,58505 | 0,50357 - 0,66201 |
| Precision de seleccion ipTM/DockQ intra-objetivo | 0,57173 | 0,50567 - 0,63475 |
| Regret de seleccion top-1 | 0,02312 | 0,01814 - 0,02899 |
| Regret de eleccion aleatoria | 0,02556 | - |
| AUROC residuos no resueltos vs resueltos | 0,85591 | 0,83319 - 0,87786 |
| pLDDT medio residuos resueltos | 0,75550 | 0,74226 - 0,76848 |
| pLDDT medio residuos no resueltos | 0,49950 | 0,48104 - 0,51862 |
| Residuos resueltos con pLDDT < 0,5 | 0,11332 | 0,08916 - 0,13865 |
| Residuos no resueltos con pLDDT < 0,5 | 0,56934 | 0,52484 - 0,61523 |

Acuerdo con el ESMFold2 de produccion (correlacion de Spearman / diferencia media):

| Metrica | Spearman | Diferencia media |
|---|---:|---:|
| pLDDT medio | 0,68423 | -0,07777 |
| pTM | 0,79666 | -0,03602 |
| ipTM | 0,73161 | +0,01022 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 178,9 M de parametros; en fp32 ocupa aproximadamente 0,72 GB de pesos, y en bf16 alrededor de 0,36 GB. Con activaciones y buffers de difusion, se estima un consumo de 2-4 GB de VRAM para secuencias tipicas, aunque no se ha publicado una cifra oficial.
- GPU recomendadas: cualquier GPU CUDA compatible; el autor indica que la validacion se ejecuta en Docker sobre cualquier dispositivo CUDA compatible, sin requerir un producto de GPU o estacion de trabajo especificos.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y similares, dado el bajo numero de parametros.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Plegado de complejos | Cabeza de confianza |
|---|---|---:|---|---|---|
| ESMFold2-300 (Synthyra) | 178,9 M | no disponible | MIT | Si (entrada tipada multimérica) | Si (pLDDT, PAE, pTM, ipTM) |
| Production ESMFold2 | no disponible | no disponible | no disponible | Si | Si |
| ESMFold (original, Meta) | ~690 M | no disponible | MIT | No (solo monomeros) | pLDDT |
| AlphaFold2 | ~93 M por modelo (5 modelos) | no disponible | no comercial (parametros) | Si | pLDDT, PAE, pTM |

La comparativa se limita a lo que la model card documenta; no se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada. El modelo de produccion ESMFold2 se usa como referencia de acuerdo de confianza, no de precision de plegado.

## Limitaciones y advertencias

- Modelo especializado en proteinas: no es un modelo de lenguaje natural y no soporta generacion de texto, codigo, matematicas ni capacidades multilingues.
- Las cabezas de clasificacion de secuencia y de token estan inicializadas de novo y deben fine-tunearse antes de interpretar sus logits como predicciones.
- La cabeza de confianza se entreno con backbone y modulo de plegado congelados; su calibracion puede no transferirse a distribuciones de proteinas muy alejadas de AtlasFold-Data.
- Los residuos no resueltos son un proxy de desorden, no etiquetas definitivas de desorden intrinseco.
- Las metricas de acuerdo con el ESMFold2 de produccion comparan confianzas medias por objetivo, no precision de plegado sobre estructuras identicas.
- Requiere versiones muy especificas de dependencias (Python 3.12-3.14, PyTorch 2.14, Transformers 5.17), lo que puede complicar la integracion en entornos existentes.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio del autor.
- La licencia MIT permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento subyacentes.
- Riesgo de alucinacion estructural en secuencias largas o sin homologos conocidos; el autor excluye objetivos largos de las tablas principales de evaluacion.

## Enlaces

- [Hugging Face: Synthyra/ESMFold2-300](https://huggingface.co/Synthyra/ESMFold2-300)
- [Dataset AtlasFold-Data](https://huggingface.co/datasets/lhallee/AtlasFold-Data)
- [Guia de entrenamiento de confianza FastPLMs](https://github.com/Synthyra/FastPLMs/blob/main/docs/confidence_training.md)
- [Repositorio FastPLMs](https://github.com/Synthyra/FastPLMs)
- Checkpoint base: `biohub/ESMFold2-Experimental-Fast-base300M-step1500k` (referenciado en la model card; no se proporciona URL directa)
