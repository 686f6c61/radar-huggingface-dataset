# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA_llama-3.2

## Resumen

El modelo `WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA_llama-3.2` es un adaptador de ajuste fino publicado en HuggingFace por el usuario WijewardhanaNT sobre el modelo base `meta-llama/Llama-3.2-3B`. No se trata de un modelo completo, sino de un adaptador PEFT de 0,4 GB que debe cargarse junto al modelo base. El nombre indica que el ajuste se realizó sobre el corpus XNLI (inferencia de lenguaje natural entre pares de frases) en ingles e hindi, con 5000 ejemplos y la tecnica DoRA (Weight-Decomposed Low-Rank Adaptation).

La relevancia de esta ficha es doble. Por un lado, documenta un caso tipico de adaptador experimental de bajo coste para una tarea de clasificacion (NLI de tres clases: implicacion, neutralidad y contradiccion) y para estudiar transferencia cross-lingual entre un idioma de altos recursos y otro de recursos medios. Por otro, sirve como advertencia metodologica: la model card del autor es la plantilla vacia de HuggingFace, sin datos de entrenamiento, hiperparametros, evaluacion ni licencia.

La informacion disponible es muy limitada: 0 descargas, 0 likes, licencia e idiomas no declarados, y ninguna referencia a benchmarks. Todo lo que no aparece en los metadatos se marca como "no disponible" en esta ficha. Se incluyen como contexto, debidamente etiquetadas, las caracteristicas publicas del modelo base Llama-3.2-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (DoRA, variante de LoRA con descomposicion de magnitud y direccion) sobre un transformer decoder-only; arquitectura exacta del adaptador no disponible |
| Parametros totales | No disponible para el adaptador. El modelo base Llama-3.2-3B tiene 3.210 millones de parametros (dato publico de Meta, no declarado en la informacion proporcionada) |
| Longitud de contexto | No disponible para el adaptador. El modelo base admite 128.000 tokens (dato publico de Meta) |
| Tipos de cuantizacion | No disponible. Al ser un adaptador, la cuantizacion se aplica al modelo base (por ejemplo, 8 bits o 4 bits en llama.cpp/GGUF) |
| Idiomas soportados | No declarados. El identificador del modelo sugiere ingles (en) e hindi (hi) como idiomas de ajuste |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 0,4 GB |
| Libreria | peft (version de framework declarada: PEFT 0.17.1) |
| Modelo base | meta-llama/Llama-3.2-3B |
| Pipeline declarado | text-generation |
| Tarea probable | Inferencia de lenguaje natural (NLI) de tres clases sobre XNLI, en ingles e hindi |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

El adaptador se construye sobre `meta-llama/Llama-3.2-3B`, un transformer decoder-only con atencion agrupada por consultas (GQA) y 3.210 millones de parametros. Sobre ese backbone se aplica DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone la actualizacion de pesos en un componente de magnitud y otro de direccion, lo que en la literatura original reporta mejoras de estabilidad y precision frente a LoRA clasico con el mismo presupuesto de parametros entrenables. La libreria declarada es `peft` 0.17.1, coherente con un adaptador de bajo rango.

No hay informacion en la model card sobre el procedimiento de entrenamiento. Por el identificador se deduce el uso del conjunto XNLI con 5000 ejemplos en ingles y hindi, y el fragmento "percentage_1_40" apunta a algun tipo de barrido experimental (porcentaje de datos o rango de capas) que no se puede confirmar. Tambien se desconoce el rango (rank), el valor de alpha, los modulos objetivo, la tasa de aprendizaje, el numero de epocas, la precision (fp16/bf16) y si hubo alguna fase de RLHF o DPO. No consta que exista una cabeza de clasificacion en el repositorio: el pipeline declarado es `text-generation`, lo que puede indicar que el adaptador se entreno con formato generativo o que la etiqueta no refleja la tarea real.

## Capacidades

- Clasificacion de pares de frases en tres clases propias de XNLI: implicacion (entailment), neutralidad y contradiccion, si el adaptador incluye la cabeza correspondiente. No confirmado en la informacion disponible.
- Procesamiento de pares texto-texto (premisa e hipotesis) en ingles e hindi, segun el identificador del modelo.
- Posible transferencia cross-lingual entre ingles e hindi, aprovechando el entrenamiento multilingue del backbone Llama-3.2.
- Generacion de texto libre y conversacion: no verificable. El ajuste es de tarea especifica y el modelo base es la version preentrenada, no la Instruct.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues generales: heredadas del modelo base (Llama-3.2 cubre ocho idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes), pero el adaptador solo esta ajustado, segun el nombre, para ingles e hindi.
- Capacidad especial (thinking mode, vision, audio): no disponible.

## Casos de uso

- Clasificacion de implicacion textual en produccion: el adaptador puede emplearse para determinar si una hipotesis se deduce de una premisa en ingles o hindi, integrandose en un servicio de inferencia que cargue el modelo base Llama-3.2-3B mas el adaptador con PEFT.
- Filtrado de evidencia en pipelines RAG: dado un fragmento recuperado y una pregunta del usuario, el modelo permite comprobar si el fragmento implica la respuesta, reduciendo afirmaciones no respaldadas antes de pasarlas al generador.
- Verificacion de afirmaciones (fact-checking asistido): comparar una afirmacion con un pasaje de referencia y clasificar la relacion como implicacion, neutralidad o contradiccion, marcando los casos neutros para revision humana.
- Anotacion y aumento de datos para idiomas con pocos recursos: usar el adaptador como etiquetador automatico sobre texto en hindi para preanotar corpus de NLI y acelerar la revision manual.
- Destilacion y evaluacion de tecnicas PEFT: sirve como punto de partida reproducible (5000 ejemplos, DoRA, backbone de 3B) para comparar DoRA frente a LoRA u otras variantes de bajo rango en la misma tarea.
- Moderacion de contenido y deteccion de contradicciones: comprobar si un mensaje contradice una politica o una respuesta previa del sistema, en escenarios de atencion automatizada con historial de conversacion.
- Investigacion en transferencia cross-lingual: medir la degradacion de rendimiento al evaluar un adaptador entrenado en ingles sobre datos en hindi, o viceversa, para estudiar el alineamiento multilingue del backbone.
- Normalizacion de formularios o deduplicacion semantica: la misma capacidad de NLI permite detectar pares de registros que se contradicen o que son equivalentes, como paso previo a la fusion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna seccion de evaluacion (la seccion `Results` figura como `[More Information Needed]`) y no se han encontrado referencias externas al modelo en la busqueda web realizada. No se dispone de valores de exactitud de XNLI, MMLU, HumanEval, GSM8K ni de ninguna otra metrica.

## Requisitos de hardware

- Adaptador: 0,4 GB de pesos, por lo que su coste de almacenamiento y de carga es despreciable frente al modelo base.
- Modelo base en bf16/fp16: aproximadamente 6,4 GB de pesos, mas cache KV. Con contexto moderado se recomienda un minimo de 8-10 GB de VRAM.
- Modelo base en 8 bits: aproximadamente 3,5 GB de pesos.
- Modelo base en 4 bits (GGUF Q4_K_M): aproximadamente 2,0-2,5 GB de pesos, viables en GPUs de 6-8 GB.
- GPUs profesionales: A100 40/80 GB, H100, L40S, A10G y L4 (16-24 GB) sin problema para inferencia con contexto largo.
- GPUs de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en equipos Apple Silicon con memoria unificada de 16 GB o mas. En GPUs de 8 GB solo es realista con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA (`--enable-lora`), TGI con adaptadores, SGLang, y llama.cpp/Ollama previa fusion del adaptador con el modelo base y conversion a GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en XNLI |
|---|---|---|---|---|---|
| `WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA_llama-3.2` (adaptador) | No disponible (base de 3,21 mil millones) | No disponible (base de 128.000 tokens) | No disponible | HuggingFace, 0 descargas, 0 likes | No disponible |
| `meta-llama/Llama-3.2-3B` (modelo base) | 3,21 mil millones | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, ampliamente descargado | No aplica (no ajustado a NLI) |
| `Qwen/Qwen2.5-3B` | 3,09 mil millones | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | HuggingFace | No disponible |
| `FacebookAI/xlm-roberta-large` | 560 millones | 512 tokens | MIT | HuggingFace | No disponible en esta ficha; es un modelo de referencia habitual en XNLI |
| `microsoft/mdeberta-v3-base` | 278 millones | 512 tokens | MIT | HuggingFace | No disponible en esta ficha |

La comparacion es estructural: no se dispone de metricas de XNLI para el adaptador, por lo que no es posible afirmar que supere o quede por debajo de las alternativas. Los modelos de la familia XLM-R y mDeBERTa son sustancialmente mas pequenos y rapidos para clasificacion de pares de frases, mientras que el adaptador sobre Llama-3.2-3B aporta un backbone generativo mucho mayor y contexto largo, a cambio de un coste de inferencia superior.

## Limitaciones y advertencias

- Model card practicamente vacia: sin descripcion, sin datos de entrenamiento, sin hiperparametros, sin resultados de evaluacion y sin instrucciones de uso. No es posible reproducir el ajuste ni verificar sus afirmaciones.
- Licencia no declarada para el adaptador. El modelo base Llama-3.2 esta sujeto a la licencia comunitaria de Llama 3.2, que impone obligaciones de atribucion, una politica de uso aceptable y condiciones adicionales para productos con mas de 700 millones de usuarios mensuales. Cualquier uso comercial debe revisarse contra esa licencia, no contra una licencia del adaptador que no existe.
- Tarea muy estrecha: el modelo esta orientado a NLI de tres clases y no a generacion abierta, dialogo o razonamiento general. Usarlo como asistente conversacional no esta respaldado por ninguna evidencia.
- Riesgo de alucinacion: inherente al backbone generativo Llama-3.2-3B. Si el adaptador no incluye una cabeza de clasificacion y se usa en modo generativo, puede producir etiquetas o justificaciones plausibles pero incorrectas.
- Sesgos: no documentados. El corpus XNLI procede de traducciones de MultiNLI, con sesgos de dominio (texto periodistico y de genero) y de traduccion automatica que se trasladan al adaptador, especialmente en hindi.
- Cobertura idiomatica limitada: solo ingles e hindi segun el identificador. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Volumen de datos muy reducido: 5000 ejemplos, lo que aumenta el riesgo de sobreajuste y de baja generalizacion fuera de la distribucion de XNLI.
- Sin mantenimiento ni adopcion: 0 descargas y 0 likes en el momento de redactar la ficha, sin historial de uso comunitario que permita validar su comportamiento.
- Fecha de creacion poco habitual (2026-09-21), lo que en la practica implica ausencia de citas, issues o discusiones asociadas.
- Caveat de despliegue: al ser un adaptador, se debe fijar la revision exacta del modelo base y verificar la compatibilidad con la version de PEFT declarada (0.17.1); versiones distintas pueden alterar la carga de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_DoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Repositorio de PEFT: https://github.com/huggingface/peft
- Articulo de DoRA (referencia de la tecnica nombrada en el identificador, no citada en la model card): https://arxiv.org/abs/2402.09353
- Articulo de LoRA: https://arxiv.org/abs/2106.09685
- Articulo de XNLI (origen del conjunto de datos sugerido por el nombre del modelo): https://arxiv.org/abs/1809.05053
- Articulo sobre emisiones de carbono en aprendizaje automatico, citado en la plantilla de la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto del aprendizaje automatico: https://mlco2.github.io/impact
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
