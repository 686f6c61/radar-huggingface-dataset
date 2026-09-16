# vtava/Qwen3.5-0.8B-CeNN-Integrated-V1

## Resumen

Qwen3.5-0.8B-CeNN-Integrated-V1 es un adaptador experimental publicado por el usuario vtava que modifica el backbone de texto de Qwen/Qwen3.5-0.8B sustituyendo parte de sus capas de atencion completa por una memoria recurrente acotada denominada TinyCeNN. El modelo base emplea una pila hibrida 3:1 de 24 capas de decodificacion de texto: 18 capas de atencion lineal Gated DeltaNet y 6 capas de atencion completa. Este experimento deja intactas las 18 capas lineales y reemplaza las capas de atencion completa en las posiciones [3, 23], conservando las 4 restantes.

El objetivo es reducir el coste de la cache de atencion global cuadratica en decodificacion larga sustituyendola por un estado recurrente de tamano fijo. El candidato seleccionado en validacion se denomina `partition_conservative` y mantiene exactos los tokens sink, el bloque actual y el bloque previo, mientras comprime el historial mas antiguo en un estado recurrente acotado. No se trata, por tanto, de un modelo sin atencion: la atencion local exacta permanece dentro del modulo de reemplazo.

Es relevante ahora porque documenta de forma reproducible un compromiso medible entre calidad (NLL y perplejidad) y tamano de cache en un modelo pequeno de ~0,8 mil millones de parametros, con artefactos de reproducibilidad (manifest, hashes de particiones y versiones de paquetes) y una tabla de resultados sobre documentos reservados. El repositorio no contiene los pesos originales de Qwen ni un checkpoint autonomo: almacena un adaptador mas el codigo de carga personalizado necesario para reconstruir el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de atencion lineal Gated DeltaNet + atencion completa (pila 3:1), con capas de atencion completa sustituidas por memoria acotada TinyCeNN (`cenn_partition`) |
| Parametros totales | no disponible (el modelo base es Qwen3.5-0.8B, ~0,8 mil millones de parametros en el backbone de texto; el adaptador no publica recuento propio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los benchmarks publicados cubren hasta 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de adaptador acompanado de codigo de carga personalizado (`load_model.py`); no es un checkpoint `save_pretrained()` autonomo y no incluye los pesos originales de Qwen |
| Modelo base | Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`) |
| Capas de atencion completa reemplazadas | [3, 23]; quedan 4 capas originales intactas |
| Candidato seleccionado en validacion | `partition_conservative` |
| Commit de origen de TinyCeNN | `2e4deedc7eddbb276b42ca683e752ad5f684b735` |
| Libreria | transformers (codigo personalizado) |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Qwen3.5-0.8B organiza su pila de texto con una proporcion 3:1 entre capas de atencion lineal Gated DeltaNet y capas de atencion completa. Este adaptador interviene unicamente sobre las capas de atencion completa: en las posiciones [3, 23] introduce TinyCeNN como memoria acotada, de modo que la atencion global cuadratica ilimitada desaparece de esas dos capas pero se conserva en las 4 restantes. Se preservan los mecanismos nativos del modelo base: normalizacion de Q/K, MRoPE parcial y puerta de salida posterior a la atencion. El readout de TinyCeNN se mantiene explicito porque no puede plegarse a traves de la puerta de salida elemento a elemento de Qwen3.5 sin alterar el calculo.

La memoria `cenn_partition` mantiene exactos la informacion de sink, del bloque actual y del bloque previo, y comprime el historial mas antiguo en un estado recurrente de tamano acotado. La seleccion del candidato se hizo exclusivamente con NLL de validacion; los documentos de test reservados no se usaron para la seleccion del modelo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La implementacion actual es PyTorch de investigacion, no un kernel fusionado de produccion, por lo que la reduccion de cache y la calidad deben interpretarse por separado del tiempo de reloj.

## Capacidades

- Generacion de texto autorregresiva con decodificacion greedy, en lotes de tamano 1, mediante el helper personalizado `greedy_generate` del modulo `tinycenn_lm.qwen35_integrated_memory`.
- Modelado de lenguaje y calculo de verosimilitud (NLL) sobre documentos, con perplejidad medida en el rango de 16 a 21 para contextos de 128 a 2048 tokens.
- Memoria de contexto comprimida: representacion recurrente acotada del historial antiguo, con atencion local exacta sobre los bloques sink, actual y previo.
- Capacidad de razonamiento, codigo, matematicas o vision: no disponible en la informacion proporcionada. La torre de vision original de Qwen3.5 no se modifica ni se empaqueta en este repositorio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Investigacion en atencion eficiente: el adaptador permite estudiar el efecto de sustituir atencion completa por memoria recurrente acotada en dos de las seis capas globales, comparando NLL y perplejidad frente al modelo original con los mismos documentos.
- Analisis del compromiso cache-calidad: la tabla publicada permite trazar la relacion entre reduccion de cache (hasta 0,8315x a 2048 tokens) y degradacion de perplejidad (1,0045x a 2048 tokens), util para decidir umbrales de contexto en disenos de inferencia.
- Prototipado en hardware limitado: al tratarse de un backbone de ~0,8 mil millones de parametros, cabe en GPUs de consumo y sirve como banco de pruebas de bajo coste para variantes de memoria antes de escalarlas a modelos mayores.
- Reproduccion de experimentos: los ficheros `manifest.json`, `selection.json`, `integrated_report.json` y los CSV de validacion y test permiten replicar la particion, las versiones de paquetes y los hashes de split, lo que resulta adecuado para trabajos academicos que exigen trazabilidad.
- Evaluacion comparativa de controles: el experimento incluye un control adaptado equivalente, lo que permite aislar el efecto de TinyCeNN frente al efecto general de modificar las capas de atencion completa.
- Estudio de estrategias de particion de memoria: al estar fijado el candidato `partition_conservative`, sirve como referencia base para comparar otras politicas de particion del historial en el estado recurrente.
- Generacion de texto en modo greedy de lote unico: util para demos, pruebas de regresion de prompts o generacion de ejemplos incluidos en el propio repositorio, siempre sin requisitos de alto rendimiento.

## Benchmarks y rendimiento

El autor publica una evaluacion sobre documentos reservados (held-out) con las siguientes metricas. La seleccion del candidato se realizo con NLL de validacion.

| Contexto | Test NLL | PPL | PPL / original | PPL / control adaptado equivalente | Cache / original | Aceleracion de prefill | Aceleracion de decodificacion |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 128 | 3,0251 | 20,595 | 0,9581 | 1,0066 | 1,0139 | 0,923 | 0,945 |
| 256 | 2,9552 | 19,205 | 0,9693 | 1,0050 | 0,9900 | 0,932 | 0,938 |
| 512 | 2,8588 | 17,441 | 0,9798 | 1,0112 | 0,9510 | 0,944 | 0,930 |
| 1024 | 2,7747 | 16,033 | 0,9953 | 1,0206 | 0,8957 | 0,966 | 0,950 |
| 2048 | 2,7571 | 15,754 | 1,0045 | 1,0306 | 0,8315 | 0,970 | 0,949 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano del backbone de ~0,8 mil millones de parametros, no publicada por el autor): aproximadamente 1,6 GB en FP16, 0,8 GB en int8 y 0,4-0,5 GB en 4 bits, mas el overhead del estado recurrente y de las activaciones. Son estimaciones, no cifras verificadas del repositorio.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, el modelo es desplegable en cualquier GPU con al menos 4 GB de memoria.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna con 4 GB o mas de VRAM. No se especifican modelos concretos validados.
- Opciones de despliegue: la unica via documentada es el cargador personalizado `from load_model import load_model` sobre PyTorch y el helper `greedy_generate`. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI; el repositorio no incluye pesos en safetensors ni GGUF.
- Latencia y throughput: la implementacion actual es PyTorch de investigacion, no un kernel fusionado. En tiempo de reloj se observa una ligera ralentizacion respecto al original: factor de velocidad de prefill entre 0,923 y 0,970 y de decodificacion entre 0,930 y 0,950. La reduccion de cache (hasta 0,8315x del original a 2048 tokens) no se traduce en una mejora de velocidad de reloj con esta implementacion.
- Restricciones de ejecucion: la cache personalizada de TinyCeNN solo soporta decodificacion greedy con tamano de lote 1; no hay soporte de beam search ni de reordenacion de cache por lotes.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar de terceros en la informacion proporcionada. La unica comparacion cuantitativa publicada es interna al propio experimento, frente al modelo original y a un control adaptado equivalente:

| Referencia | Contexto 512 (PPL relativa) | Contexto 2048 (PPL relativa) | Cache relativa a 2048 | Licencia |
|---|---:|---:|---:|---|
| Qwen3.5-0.8B original (referencia) | 1,0000 | 1,0000 | 1,0000 | apache-2.0 |
| Control adaptado equivalente | 1,0112 | 1,0306 | no disponible | no disponible |
| Este adaptador (`partition_conservative`) | 0,9798 | 1,0045 | 0,8315 | apache-2.0 |

Comparacion con alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Se trata de un adaptador de investigacion experimental, no de un modelo de produccion. El propio autor lo califica como tal.
- Solo backbone de texto: la torre de vision original de Qwen3.5 no se modifica ni se empaqueta en este repositorio, por lo que no hay capacidades multimodales.
- El repositorio no contiene los pesos originales de Qwen ni un checkpoint autonomo: es necesario disponer del modelo base en la revision indicada y usar el codigo de carga personalizado.
- Los intervalos de confianza de los benchmarks se calculan sobre documentos reservados, no sobre multiples semillas de entrenamiento independientes; la robustez estadistica de los resultados es limitada.
- La cache personalizada de TinyCeNN solo admite decodificacion greedy con lote 1; beam search y reordenacion de cache por lotes no estan soportados.
- Sustituir las seis capas de atencion completa eliminaria por completo la atencion global cuadratica del backbone de texto, pero las 18 capas nativas Gated DeltaNet y la atencion local exacta de TinyCeNN permanecen; el modelo no es "sin atencion" en sentido estricto.
- Riesgo de alucinacion y sesgos conocidos: no disponible. No hay evaluaciones de sesgo, toxicidad o factualidad en la informacion proporcionada.
- Limitaciones de contexto e idioma: la card no declara una ventana de contexto maxima ni un conjunto de idiomas soportados; los datos de evaluacion solo llegan a 2048 tokens.
- Restricciones de licencia: el checkpoint base y el adaptador son Apache-2.0, pero el codigo fuente de TinyCeNN-LM se distribuye bajo la licencia de su propio repositorio, que se incluye cuando esta disponible. Es necesario revisar esa licencia antes de un uso comercial.
- El modelo no declara pipeline de inferencia en HuggingFace ni tiene descargas o interacciones registradas, por lo que carece de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/vtava/Qwen3.5-0.8B-CeNN-Integrated-V1
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo adicionales: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo ni con TinyCeNN-LM.
