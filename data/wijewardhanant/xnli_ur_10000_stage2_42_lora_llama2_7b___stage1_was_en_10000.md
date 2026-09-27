# WijewardhanaNT/xnli_ur_10000_stage2_42_LoRA_llama2_7B___stage1_was_en_10000

## Resumen

`WijewardhanaNT/xnli_ur_10000_stage2_42_LoRA_llama2_7B___stage1_was_en_10000` es un adaptador LoRA (PEFT) publicado por el usuario de HuggingFace WijewardhanaNT sobre el modelo base `meta-llama/Llama-2-7b-hf`. No es un modelo completo: es un conjunto de pesos delta de aproximadamente 0,5 GB que debe cargarse junto al modelo base de 7 000 millones de parametros. La model card publicada es la plantilla por defecto de HuggingFace sin rellenar, por lo que no hay documentacion oficial sobre datos de entrenamiento, hiperparametros, licencia ni resultados.

El identificador del repositorio es la principal fuente de informacion disponible. Sugiere un entrenamiento en dos etapas para la tarea XNLI (`xnli_ur`): una primera etapa sobre datos en ingles (`stage1_was_en_10000`) y una segunda etapa sobre datos en urdu (`stage2`), con 10 000 ejemplos por etapa y rango LoRA 42. XNLI es el benchmark de inferencia de lenguaje natural cross-lingual, y el urdu es una de las lenguas de bajos recursos incluidas en el. Toda esta interpretacion procede del nombre del repositorio y no esta confirmada por el autor.

El interes de la ficha es, por tanto, acotado: se trata de un artefacto de investigacion sin validacion publica (0 descargas, 0 likes en el momento de la consulta), sin benchmarks y sin licencia declarada, que resulta util como ejemplo reproducible de receta de transferencia cross-lingual ingles a urdu mediante LoRA de rango alto sobre un transformer decoder-only de 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama-2) con adaptadores LoRA de PEFT. Detalles adicionales no disponibles |
| Parametros totales | Modelo base: 7B (6 740 millones aprox.). Adaptador LoRA: aproximadamente 130 millones de parametros (estimacion propia a partir del rango 42 y del tamano del repositorio; no declarado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4 096 tokens, heredada del modelo base Llama-2-7b-hf; no declarada en la model card |
| Tipos de cuantizacion | No disponibles. Los pesos se distribuyen en safetensors; el modelo base admite cuantizacion a 8 bits y 4 bits, y conversion a GGUF, GPTQ o AWQ por medios externos |
| Idiomas soportados | No declarados. El identificador sugiere ingles (etapa 1) y urdu (etapa 2) |
| Licencia | No disponible para el adaptador. El modelo base se distribuye bajo la Llama 2 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); biblioteca declarada: peft |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-26 segun los metadatos de HuggingFace (fecha anomala, posterior a la consulta) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es Llama-2-7b, un transformer decoder-only de 32 capas, dimension oculta 4 096, 32 cabezas de atencion con atencion multi-cabeza estandar, FFN de 11 008 unidades con activacion SwiGLU, normalizacion RMSNorm pre-norm y embeddings rotatorios (RoPE), con un vocabulario de 32 000 tokens y una ventana de contexto de 4 096 tokens. Meta lo entreno sobre aproximadamente 2 billones de tokens, con un ajuste posterior de alineacion (SFT y RLHF) orientado a seguir instrucciones. El adaptador anade matrices de bajo rango sobre las proyecciones de atencion y de la FFN, con rango 42 segun el identificador, y se carga en memoria junto al base sin modificar los pesos originales salvo que se fusione explicitamente.

Sobre el procedimiento de entrenamiento del adaptador solo puede inferirse la receta a partir del nombre: dos etapas, la primera con 10 000 ejemplos en ingles y la segunda con 10 000 ejemplos en urdu, presumiblemente pares de premisa e hipotesis de XNLI con la etiqueta generada como texto, dado que el pipeline declarado es `text-generation` y no `text-classification`. No hay informacion disponible sobre la composicion exacta del dataset, el numero de tokens procesados, la tasa de aprendizaje, el optimizador, el numero de epocas, el uso de precision mixta ni la existencia de una fase de RLHF o DPO especifica del adaptador. La unica referencia bibliografica en las etiquetas del repositorio, `arxiv:1910.09700`, corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono, citada en la plantilla de model card, y no a un articulo sobre este modelo.

## Capacidades

- Generacion de texto en ingles heredada del modelo base Llama-2-7b, con el estilo y las limitaciones propias de su ajuste por RLHF.
- Inferencia de lenguaje natural (NLI) en urdu, si se confirma la hipotesis del identificador: clasificacion de pares premisa-hipotesis en las categorias de implicacion, neutralidad y contradiccion.
- Transferencia cross-lingual: la receta de dos etapas sugiere adaptacion desde el ingles hacia el urdu, lo que la hace relevante para estudiar el olvido catastrofico y la retencion de capacidades tras la segunda etapa.
- Soporte de tool calling y function calling: no disponible y no verificado; no hay evidencia en la model card de que el ajuste conserve estas capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no disponible ni verificado.
- Capacidades multilingues: no declaradas; el urdu y el ingles son las unicas lenguas inferibles del identificador.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponibles.
- Capacidad de ser combinado con otros adaptadores PEFT o fusionado en el modelo base para su despliegue.

## Casos de uso

- Clasificacion de relaciones textuales en urdu: dado un par de frases en urdu, el adaptador puede emplearse para determinar si la segunda implica, contradice o es neutral respecto a la primera, que es el uso mas probable segun el identificador del repositorio.
- Investigacion en transferencia cross-lingual: la receta de dos etapas (ingles y despues urdu) permite estudiar cuanto conocimiento linguistico se conserva tras la adaptacion a una lengua de bajos recursos y cuanto se degrada en la lengua original.
- Filtrado y curacion de corpus en urdu: aplicar NLI sobre pares de documentos para detectar afirmaciones contradictorias o redundantes antes de incorporarlos a un dataset de entrenamiento.
- Verificacion de respuestas en sistemas de preguntas y respuestas en urdu: comprobar si la respuesta generada se implica logicamente a partir del contexto recuperado, descartando alucinaciones por contradiccion.
- Punto de partida para un ajuste posterior: al ocupar solo 0,5 GB y ser un adaptador PEFT, puede servir como inicializacion barata para experimentos adicionales en urdu sin reentrenar los 7B de parametros completos.
- Reproduccion de experimentos sobre el rango de LoRA: con rango 42 y dos etapas de 10 000 ejemplos, es un caso de estudio para medir el efecto del rango alto en la capacidad de adaptacion y en el sobreajuste.
- Despliegue multi-adaptador: servido sobre una unica instancia del modelo base en infraestructuras que soportan carga dinamica de LoRA, permite atender la tarea de urdu sin duplicar el coste de memoria de los 7B.
- Analisis de anotacion automatica: generacion de etiquetas NLI preliminares para preanotar conjuntos en urdu antes de la revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin rellenar, no hay tabla de resultados en el repositorio y no se declara la metrica obtenida en el conjunto de prueba de XNLI en urdu, que seria la referencia natural para este adaptador. Tampoco hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion generalista.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,5 GB adicionales sobre el modelo base, independientemente de la cuantizacion elegida para este ultimo.
- VRAM total en fp16: en torno a 13-14 GB para los pesos del base de 7B mas el adaptador, sin contar la cache KV, que crece con la longitud de contexto.
- VRAM en 8 bits: aproximadamente 7-8 GB. En 4 bits: aproximadamente 4-5 GB, con 5-6 GB recomendados para dejar margen a la cache KV y al runtime.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 de 24 GB en fp16 sin problemas; en una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB es viable en 8 o 4 bits. En GPUs de 8 GB solo con cuantizacion agresiva y contextos reducidos.
- GPU de centro de datos: A100 de 40 o 80 GB, H100, L40S o similares, con margen amplio para lotes grandes y mayor longitud de contexto.
- Opciones de despliegue: Transformers con PEFT para carga directa del adaptador; vLLM con soporte de adaptadores LoRA para servicio concurrente y multi-adaptador; TGI con soporte de LoRA; llama.cpp u Ollama requieren fusionar previamente el adaptador en el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni configuracion de referencia declarada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| Este adaptador (sobre Llama-2-7b) | 7B base + ~130M en LoRA | 4 096 tokens | Ingles y urdu (inferido) | No declarada | Repositorio publico con 0 descargas | No disponible |
| meta-llama/Llama-2-7b-hf (base sin adaptador) | 7B | 4 096 tokens | Predominantemente ingles | Llama 2 Community License | Ampliamente disponible | Referencia publica de Llama-2 |
| Modelos encoder multilingues ajustados para XNLI (por ejemplo, variantes de XLM-R large o mDeBERTa-v3) | 280M-560M | 512 tokens | Decenas de idiomas, incluido el urdu | Habitualmente permisiva, verificar en cada repositorio | Muy extendida | Metricas XNLI publicadas en sus model cards |
| Otros adaptadores LoRA comunitarios sobre Llama-2-7b para tareas de clasificacion | 7B base + decenas o cientos de millones en LoRA | 4 096 tokens | Variable | Habitualmente no declarada | Repositorios de fiabilidad variable | Rara vez documentado |

Los datos de los modelos externos incluidos en la tabla proceden de informacion publica general y deben verificarse en sus respectivas fichas antes de cualquier uso en produccion.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla por defecto, sin descripcion, sin hiperparametros, sin datos de entrenamiento y sin seccion de evaluacion completada.
- Licencia no declarada: no es posible determinar si el autor permite uso comercial del adaptador. Al derivar de Llama-2-7b, se aplica la Llama 2 Community License del modelo base, que incluye condiciones de uso aceptable y un limite de 700 millones de usuarios mensuales para licencias automaticas.
- Sin validacion publica: 0 descargas y 0 likes, sin resultados de benchmarks y sin proceso de revision. No hay evidencia de que el ajuste funcione en la tarea prevista.
- Riesgo de alucinacion: al ser un adaptador sobre un modelo generativo, la salida no esta restringida a las tres etiquetas de XNLI salvo que exista un postprocesado que lo fuerce; las etiquetas pueden generarse en formato libre y requerir analisis sintactico para su extraccion.
- Olvido catastrofico y degradacion del ingles: la segunda etapa sobre datos en urdu puede haber reducido las capacidades generales y de generacion en ingles del modelo base, efecto que no se ha medido ni documentado.
- Cobertura idiomatica limitada: no hay informacion sobre variantes dialectales del urdu, tratamiento de la escritura nastaliq, tokenizacion de caracteres arabes o rendimiento fuera del dominio de XNLI.
- Limitacion de contexto: 4 096 tokens, suficiente para pares de frases pero insuficiente para documentos largos sin estrategias de troceado.
- Contaminacion de datos: XNLI en urdu tiene un conjunto de evaluacion reducido y ampliamente utilizado; si el ajuste incluyo ejemplos del conjunto de prueba, los resultados no serian generalizables. No hay informacion al respecto.
- Fechas anomalas en los metadatos: la creacion y la actualizacion figuran en septiembre de 2026, lo que sugiere manipulacion manual de campos o un error de registro.
- Dependencia del modelo base: el adaptador no es autonomo, requiere descargar y cargar los pesos de Llama-2-7b, sujetos a sus propios terminos.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_ur_10000_stage2_42_LoRA_llama2_7B___stage1_was_en_10000
- Modelo base en HuggingFace: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Referencia bibliografica incluida en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimacion de emisiones, citada en la plantilla y no relacionada con el modelo): https://arxiv.org/abs/1910.09700
- Repositorio y documentacion de PEFT, biblioteca declarada por el autor: https://github.com/huggingface/peft
- Documentacion de Transformers sobre adaptadores PEFT y su carga: https://huggingface.co/docs/transformers/main/peft
- Repositorio, paper y demo del modelo: no disponibles, el autor no los declara en la model card.
