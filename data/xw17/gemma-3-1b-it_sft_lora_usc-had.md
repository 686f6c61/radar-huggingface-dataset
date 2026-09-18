# xw17/gemma-3-1b-it_SFT_lora_usc-had

## Resumen

`xw17/gemma-3-1b-it_SFT_lora_usc-had` es un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base `google/gemma-3-1b-it`, publicado en HuggingFace por el usuario `xw17`. Por el identificador y el tamano del repositorio (0,1 GB, muy inferior a los aproximadamente 2 GB que ocuparian los pesos completos de un modelo de 1.000 millones de parametros en fp16) todo apunta a que el repositorio contiene unicamente los pesos del adaptador LoRA y no un modelo fusionado, aunque la model card no lo confirma de forma explicita. El sufijo `usc-had` sugiere que el ajuste se ha realizado sobre el dataset USC-HAD de reconocimiento de actividad humana a partir de sensores inerciales, pero esto es una inferencia a partir del nombre y no un dato documentado.

El modelo hereda las caracteristicas del base: una arquitectura transformer decoder-only de aproximadamente 1.000 millones de parametros, ventana de contexto de 32.768 tokens, vocabulario de 262.000 tokens y soporte multilingue. Se trata de la variante mas pequena de la familia Gemma 3, orientada a ejecucion en dispositivos con recursos limitados (moviles, portatiles, CPU) y no incluye capacidades de vision, a diferencia de los modelos 4B, 12B y 27B de la misma familia.

La relevancia de esta ficha es limitada pero ilustrativa: es un ejemplo tipico de adaptacion de bajo coste de un modelo pequeno a un dominio muy concreto mediante PEFT. La model card esta generada automaticamente por la plantilla de HuggingFace y no contiene practicamente ningun dato tecnico verificado (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros y evaluacion figuran todos como "More Information Needed"), por lo que buena parte de las especificaciones que siguen deben tratarse como derivadas del modelo base y no como caracteristicas confirmadas del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base: Gemma 3 1B IT (atencion local/global intercalada, QK-norm, RoPE) |
| Parametros totales | No disponible para el adaptador. Modelo base: ~1.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el adaptador. Modelo base: 32.768 tokens |
| Tipos de cuantizacion | No disponible para el adaptador. El modelo base dispone de versiones int4/int8 oficiales y de cuantizaciones GGUF de la comunidad |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio. El modelo base Gemma 3 se distribuye bajo los Gemma Terms of Use |
| Formato de pesos | safetensors (etiqueta del repositorio); previsiblemente adaptadores LoRA en formato PEFT. Tamano del repositorio: 0,1 GB |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el procedimiento de entrenamiento: la model card no especifica numero de tokens, composicion del dataset, hiperparametros (rango y alpha de LoRA, tasa de aprendizaje, epocas, precision) ni si se aplicaron etapas de RLHF o DPO posteriores. El unico dato objetivo es el nombre del repositorio, que indica SFT con LoRA y menciona `usc-had`. El dataset USC-HAD (University of Southern California Human Activity Dataset) es un corpus publico de senales de una unidad de medida inercial de 6 ejes (acelerometro y giroscopio a 100 Hz) con 12 clases de actividad y 14 sujetos; si el ajuste se ha hecho sobre este corpus, lo mas probable es que se hayan serializado las ventanas de sensores como texto y se haya entrenado el modelo para tareas de clasificacion o etiquetado en lenguaje natural, pero esto no esta confirmado en ninguna fuente disponible.

En cuanto a la arquitectura, el modelo base Gemma 3 1B es un transformer decoder-only con normalizacion de consultas y claves (QK-norm), atencion con ventana local intercalada con atencion global completa en una proporcion de 5 a 1, RoPE y un vocabulario de 262.000 tokens. La variante 1B es la unica de la familia que es exclusivamente de texto. Al tratarse de un adaptador LoRA, la inferencia requiere cargar primero el modelo base y aplicar despues los pesos del adaptador; no se documenta si existe una version fusionada lista para usar.

## Capacidades

- Generacion de texto y respuesta a instrucciones, heredadas del modelo base `gemma-3-1b-it`.
- Comprension y generacion multilingue en el modelo base; no se especifica que idiomas se han conservado o reforzado tras el ajuste.
- Razonamiento basico y aritmetica simple, limitado por el tamano de 1.000 millones de parametros.
- Generacion de codigo elemental, sin garantias de calidad comparable a modelos mayores.
- Capacidad de clasificacion o etiquetado de secuencias cortas, presumiblemente orientada a datos de sensores inerciales segun el nombre del repositorio; no documentada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo de pensamiento explicito, vision ni audio.
- La etiqueta `endpoints_compatible` del repositorio sugiere que el modelo puede desplegarse tras una Inference Endpoint, aunque no se detalla la configuracion.

## Casos de uso

- Reconocimiento de actividad humana a partir de series temporales serializadas: si el ajuste se ha realizado sobre USC-HAD, el modelo podria recibir ventanas de acelerometro y giroscopio convertidas a texto y devolver la etiqueta de actividad (caminar, subir escaleras, correr, sentarse, etc.). Es el escenario que sugiere el nombre del repositorio, pero no esta validado por ninguna evaluacion publicada.
- Pre-anotacion de corpus de sensores: uso del modelo para proponer etiquetas sobre un gran volumen de ventanas y posterior revision humana, reduciendo el coste de anotacion en proyectos de HAR.
- Clasificacion de texto corto en pipelines por lotes: al caber en una sola GPU de gama media o incluso en CPU, puede procesar miles de fragmentos cortos (notas, titulares, comentarios) con coste marginal muy bajo.
- Asistente conversacional local para prototipos: integracion en aplicaciones de escritorio o moviles que requieran un chatbot sin conexion y con requisitos de privacidad estrictos, sacrificando calidad frente a modelos mayores.
- Extraccion de campos en formularios breves: tareas de parsing de entidades sencillas en textos de una o dos frases, donde la ventana de 32K no es necesaria pero el coste de inferencia si importa.
- Investigacion en eficiencia de ajuste fino: el repositorio sirve como caso de estudio reproducible de un pipeline SFT + LoRA sobre un modelo de 1B, util para comparar metodologias PEFT y para experimentos academicos de adaptacion de dominio.
- Filtrado y enrutado previo en arquitecturas de cascada: uso del modelo como clasificador barato que decide si una consulta debe escalarse a un modelo mayor, reduciendo el coste total del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye la seccion de evaluacion con el marcador "More Information Needed" en todos los apartados (datos de prueba, factores, metricas y resultados), y la busqueda web realizada no ha devuelto ninguna fuente relacionada con el modelo. No se dispone por tanto de cifras de MMLU, GSM8K, HumanEval, exactitud de clasificacion sobre USC-HAD ni de ninguna otra metrica, ni del modelo ajustado ni del modelo base medido por el autor.

## Requisitos de hardware

- VRAM para el modelo base en bf16/fp16: aproximadamente 2 GB solo de pesos, mas el coste de activaciones y cache KV, lo que situa el consumo practico en torno a 3-4 GB para secuencias de contexto corto.
- VRAM en cuantizacion int8: del orden de 1,2 GB de pesos; en int4: del orden de 0,8 GB. Cifras estimadas a partir del tamano del modelo base, no medidas sobre este repositorio.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para contexto corto; RTX 3060, RTX 4060, RTX 4090, L4, A10G, A100 y H100 lo ejecutan sin problemas, con la salvedad de que en las GPU de gama alta el modelo queda muy infrautilizado.
- Cabe holgadamente en GPU de consumo e incluso en CPU: es viable ejecutarlo en un portatil sin GPU dedicada usando cuantizacion de 4 bits, y en dispositivos moviles con cuantizaciones agresivas.
- Opciones de despliegue: `transformers` con `peft` para cargar base + adaptador; `vLLM` y `TGI` tras fusionar el adaptador o mediante carga de LoRA; `llama.cpp`, `Ollama` y `LM Studio` previa fusion del adaptador y conversion a GGUF; el modelo base tambien es compatible con `llama.cpp` en formato GGUF original.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de tokens por segundo ni de tiempo de respuesta.

## Comparativa con modelos similares

La comparativa se establece contra los modelos base de la misma categoria (aproximadamente 1.000-1.500 millones de parametros, orientados a ejecucion local). Los datos del modelo analizado son desconocidos salvo por lo indicado; los de las alternativas proceden de su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| `xw17/gemma-3-1b-it_SFT_lora_usc-had` | No disponible (adaptador LoRA sobre base de ~1B) | No disponible (base: 32K) | No disponible | No | Model card vacia, 0 descargas, 0 likes, sin evaluacion publicada |
| `google/gemma-3-1b-it` | ~1.000 millones | 32.768 tokens | Gemma Terms of Use | No | Modelo base; 140 idiomas; versiones int4/int8 oficiales |
| `meta-llama/Llama-3.2-1B-Instruct` | ~1.240 millones | 128.000 tokens | Llama 3.2 Community License | No | Ventana de contexto notablemente mayor; licencia con restricciones para empresas grandes |
| `Qwen/Qwen2.5-1.5B-Instruct` | ~1.540 millones | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | No | Licencia permisiva y buen rendimiento en codigo y matematicas para su tamano |

## Limitaciones y advertencias

- Ausencia total de documentacion: desarrollador, licencia, idiomas, datos de entrenamiento y evaluacion figuran como no disponibles. Es imposible auditar el modelo o determinar su idoneidad para produccion.
- Licencia indeterminada: al no declararse, el uso comercial es juridicamente incierto. El modelo base Gemma 3 esta sujeto a los Gemma Terms of Use, que imponen obligaciones de atribucion y una politica de uso prohibido; cualquier uso comercial debe respetar esas condiciones.
- Riesgo de alucinacion elevado: los modelos de 1.000 millones de parametros generan con mas frecuencia informacion incorrecta y pierden coherencia en cadenas de razonamiento largas.
- Sesgos heredados: el modelo base Gemma 3 presenta sesgos de genero, origen etnico, religion y nacionalidad documentados por Google en su propia model card; no hay indicios de que el ajuste los haya corregido.
- Olvido catastrofico probable: un SFT relativamente agresivo sobre un dominio estrecho (si efectivamente se ha usado USC-HAD) puede degradar las capacidades generales de conversacion y generacion del modelo original; no hay evaluacion que lo cuantifique.
- Idoneidad no verificada para HAR: no existe ninguna metrica publicada que demuestre que el modelo clasifica correctamente actividades a partir de sensores; el nombre del repositorio no es una prueba de funcionamiento.
- Contexto limitado frente a alternativas: los 32.768 tokens del base son inferiores a los 128.000 de Llama 3.2 1B, lo que restringe su uso en tareas con documentos largos.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones; no hay evidencia de uso real en produccion.
- Reproducibilidad cuestionable: al ser un adaptador PEFT, la inferencia exige la version exacta del modelo base; si este cambia, los resultados pueden diferir.
- Metadatos sospechosos: las fechas de creacion y actualizacion indican septiembre de 2026, posteriores a la fecha habitual de publicacion de la familia Gemma 3, lo que puede indicar una subida automatizada o un error en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xw17/gemma-3-1b-it_SFT_lora_usc-had
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto ambiental): https://arxiv.org/abs/1910.09700
- Modelo base Gemma 3 1B IT: https://huggingface.co/google/gemma-3-1b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Documentacion de PEFT para carga de adaptadores LoRA: https://huggingface.co/docs/peft
- Dataset USC-HAD, mencionado en el nombre del repositorio (referencia general de la Universidad del Sur de California): https://sipi.usc.edu/had/

Nota sobre la busqueda web: las consultas realizadas no han devuelto ningun resultado relacionado con este modelo ni con su autor. Los unicos resultados obtenidos eran paginas no pertinentes (sitios de tipografias, foros generalistas y contenidos sobre redes sociales), por lo que no se han incluido como fuentes.
