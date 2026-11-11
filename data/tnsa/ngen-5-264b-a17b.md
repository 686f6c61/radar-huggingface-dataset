# TNSA/NGen-5-264B-A17B

## Resumen

NGen-5-264B-A17B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) disperso publicado por TNSA como parte de su serie abierta NGen-5, que la compania mantiene separada de su linea propietaria homonima. Con 264.400 millones de parametros totales y aproximadamente 17.000 millones activos por token, el modelo emplea una arquitectura de atencion hibrida que combina capas de atencion lineal Gated DeltaNet con capas de atencion completa con compuertas, en una proporcion de tres a una. El resultado es un decodificador de 60 capas con un contexto de 262.144 tokens, pensado para cargas de razonamiento de contexto largo.

La relevancia del lanzamiento reside en dos factores. Por un lado, ofrece un ratio de activacion bajo (alrededor del 6,4 % de los parametros totales por token), lo que abarata la inferencia frente a modelos densos de tamano comparable. Por otro, distribuye los pesos en FP8 con escalas de bloque de 128x128, manteniendo en BF16 los enrutadores, las normalizaciones, los embeddings y la cabeza de salida. El repositorio ocupa unos 267,1 GB en disco.

El modelo se distribuye con pesos safetensors y codigo de inferencia propio (`modeling_ngen5_moe.py`) escrito para OpenArchX, la libreria de TNSA. No esta integrado en transformers ni en los runners habituales, lo que condiciona su despliegue. La licencia es la TNSA open-weight model license, no una licencia open source estandar, y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador Mixture-of-Experts con atencion hibrida (3 capas Gated DeltaNet de atencion lineal por cada 1 capa de atencion completa con compuertas) |
| Parametros totales | 264.424.773.616 (264,4B) |
| Parametros activos | ~17B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos nativos en FP8 (e4m3, escalas de bloque 128x128); enrutadores, normalizaciones, embeddings y cabeza de salida en BF16. No se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (`en`) |
| Licencia | TNSA open-weight model license (`tnsa-owml`); incluye material de terceros bajo Apache-2.0 |
| Formato de pesos | safetensors (FP8); codigo de modelado en Python para OpenArchX |
| Capas | 60 |
| Tamano oculto | 4096 |
| Expertos por capa | 331 enrutados (top-10) + 1 compartido |
| Tamano oculto por experto | 1024 |
| Tipo de configuracion | `model_type: ngen5_moe` |
| Tamano en disco | ~267,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas MoE dispersas. Cada capa contiene 331 expertos enrutados mas un experto compartido, y se activan los 10 mejores expertos por token, lo que explica el salto entre 264,4B parametros totales y unos 17B activos. El tamano oculto por experto es de 1024 frente a un tamano oculto del modelo de 4096. La innovacion estructural mas relevante es la atencion hibrida: tres de cada cuatro capas usan Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, y la cuarta es una capa de atencion completa con compuertas. Este diseno reduce el coste cuadratico de la atencion en secuencias de hasta 262.144 tokens sin renunciar a capas de atencion global que preservan la recuperacion exacta de informacion.

El modelo incorpora un modo de razonamiento explicito ("thinking") con un presupuesto de hasta 28.000 tokens, segun la configuracion de evaluacion declarada por el autor. Los pesos se publican directamente en FP8, con escalas de bloque de 128x128 y componentes sensibles en BF16. No se han publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card menciona que el modelo aprendio de modelos upstream y que puede identificarse erroneamente como Qwen, Kimi, GLM o DeepSeek.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat propia (`chat_template.jinja`) que admite prompts de sistema.
- Razonamiento explicito en modo thinking, con presupuesto de tokens configurable (hasta 28K en la evaluacion oficial).
- Razonamiento de nivel avanzado en dominios cientificos y academicos, segun los resultados declarados en GPQA Diamond y MMLU-Pro.
- Procesamiento de contexto largo de hasta 262.144 tokens, habilitado por la atencion hibrida lineal/completa.
- Soporte de tool calling y function calling a traves de la plantilla de chat (la model card remite a ella para prompts con herramientas).
- Capacidad de identificacion de si mismo limitada: puede atribuirse a otros modelos o desarrolladores.
- No se declaran capacidades de vision, audio ni multimodalidad.
- No se declara soporte multilingue mas alla del ingles.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 262.144 tokens de contexto, el modelo puede ingerir varios ficheros de codigo, issues y documentacion tecnica en una sola pasada y responder preguntas cruzadas sin trocear el material.
- Razonamiento cientifico asistido: su rendimiento declarado en GPQA Diamond (87,9) lo hace adecuado para tareas de fisica, quimica y biologia de nivel posgrado, como revision de hipotesis o explicacion de resultados experimentales.
- Investigacion academica con corpus largos: resumen y extraccion de conclusiones sobre articulos completos o tesis, aprovechando el contexto extendido y el modo thinking para razonamientos en varios pasos.
- Agentes con llamadas a herramientas: la plantilla de chat soporta definicion de herramientas, lo que permite construir agentes que consulten APIs, bases de datos o motores de busqueda y encadenen varios pasos de razonamiento.
- Generacion de codigo en pipelines internos: puede integrarse como servicio de generacion en flujos de revision o documentacion de codigo, siempre que el equipo asuma el coste de desplegar la libreria OpenArchX.
- Evaluacion comparativa de modelos abiertos: util como referencia de arquitectura MoE hibrida en estudios de eficiencia de atencion y de cuantizacion FP8 nativa.
- Despliegue en infraestructura propia con FP8: al publicarse los pesos ya cuantizados, reduce el trabajo de conversion frente a modelos que solo ofrecen BF16, aunque exige hardware compatible con FP8 para aprovechar el formato.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo, medidos sobre una build de desarrollo en BF16, en modo thinking con presupuesto de 28K tokens (temperatura 1,0, top-p 0,95, top-k 20, penalizacion de presencia 1,5), ejecucion unica. El propio autor advierte que diferencias de unos 3 puntos estan dentro del ruido y que los resultados son preliminares.

| Benchmark | NGen-5-264B-A17B |
|---|---|
| GPQA Diamond (198 preguntas), pass@1, thinking | 87,9 |
| MMLU-Pro (subconjunto de 300 preguntas), thinking | 83,0 |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MMLU completo ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 267,1 GB en FP8, por lo que la inferencia requiere al menos ese volumen de memoria, mas overhead de activaciones y cache KV. No cabe en ninguna GPU de consumo individual.
- GPU recomendadas: se necesita un nodo multi-GPU. Ocho aceleradores de 80 GB (H100, H200 o A100 80GB) suman 640 GB y dejan margen suficiente; cuatro H100 de 80 GB (320 GB) quedan muy justos y dependen del reparto de expertos y del tamaño del batch.
- GPU de consumo: no es viable en RTX 4090, RTX 5090 ni similares por capacidad de memoria. Tampoco se documentan pesos GGUF para llama.cpp u Ollama.
- Opciones de despliegue: la unica via documentada es OpenArchX con el codigo `modeling_ngen5_moe.py` del repositorio. No se documenta soporte en vLLM, TGI, SGLang ni llama.cpp. La instalacion se realiza con `pip install -U "openarchx[cuda]"` y la descarga con `hf download`.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ratio de activacion de ~17B por token sugiere un coste de computo por token propio de un modelo denso de ese tamano, pero el cuello de botella real sera el ancho de banda de memoria al recorrer los expertos seleccionados.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. Como referencia estructural, se puede contrastar con otros MoE abiertos de rango 200-300B y activacion cercana a 15-20B, pero no se han facilitado sus cifras para esta ficha.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NGen-5-264B-A17B | 264,4B | ~17B | 262.144 | TNSA open-weight | Pesos en HF, runtime propio |
| Alternativas de rango similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a los modelos generativos; el autor no publica tasas de factualidad ni evaluaciones de calibracion.
- Problema de identidad documentado por el propio autor: el modelo puede afirmar ser Qwen, Kimi, GLM o DeepSeek, o atribuir su creacion a otros desarrolladores. No es fiable para tareas de autoidentificacion.
- Resultados de benchmarks preliminares, de una sola ejecucion y sobre una build BF16 distinta de los pesos FP8 publicados; el propio autor admite ruido de unos 3 puntos.
- La licencia `tnsa-owml` no es una licencia open source reconocida por la OSI. Es imprescindible revisar los terminos en el enlace legal antes de cualquier uso comercial; la model card no detalla restricciones concretas.
- Ecosistema de inferencia muy limitado: sin soporte en vLLM, TGI, llama.cpp, Ollama ni transformers. El despliegue depende de OpenArchX, una libreria del propio fabricante.
- No se documentan datos de entrenamiento, composicion del dataset ni proceso de alineamiento, lo que dificulta evaluar sesgos y procedencia.
- El tamano en disco (267,1 GB) y la necesidad de un nodo multi-GPU excluyen el uso en entornos de desarrollo convencionales.
- No se ofrecen cuantizaciones alternativas (GGUF, AWQ, GPTQ), de modo que no hay via para reducir requisitos de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TNSA/NGen-5-264B-A17B
- Licencia open-weight de TNSA: https://tnsaai.com/legal/open-weight-model-licenses
- Repositorio de OpenArchX: https://github.com/tnsaai/OpenArchX
