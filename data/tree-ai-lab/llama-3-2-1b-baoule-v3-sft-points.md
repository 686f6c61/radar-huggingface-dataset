# Tree-AI-lab/llama-3.2-1b-baoule-v3-sft-points

## Resumen

`Tree-AI-lab/llama-3.2-1b-baoule-v3-sft-points` es un ajuste fino (SFT) publicado por el usuario Tree-AI-lab en HuggingFace. Según la model card, se ha entrenado con la librería TRL (version 0.21.0) sobre un modelo base cuya referencia aparece como `None`, es decir, el autor no ha declarado explicitamente el checkpoint de partida aunque el nombre del repositorio indica que se trata de Llama 3.2 1B. El repositorio ocupa 1,6 GB y contiene pesos en formato safetensors, con fecha de creacion del 27 de septiembre de 2026 y ultima actualizacion del mismo dia, apenas 15 minutos despues.

Se trata, por tanto, de un modelo pequeno (aproximadamente 1.230 millones de parametros si la base es Llama 3.2 1B) orientado a generacion de texto y seguimiento de instrucciones, con un pipeline de ejemplo que pasa una lista de mensajes con rol `user`, lo que sugiere que conserva una plantilla de chat. No hay informacion publicada sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni si hubo fases posteriores de RLHF o DPO.

Su relevancia practica es limitada en el estado actual: acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y la busqueda web asociada no ha devuelto ninguna fuente tecnica relacionada (unicamente resultados irrelevantes sobre arboles y un restaurante parisino llamado The Tree). La ficha que sigue recoge lo que se puede afirmar con certeza y marca explicitamente todo lo que queda sin confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.2 1B segun el nombre del repositorio; no confirmado en la model card) |
| Parametros totales | No disponible en la model card; aproximadamente 1,23 mil millones si la base es Llama 3.2 1B |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible en la model card; la base Llama 3.2 1B soporta 128.000 tokens segun la documentacion publica de Meta |
| Tipos de cuantizacion | No disponible; el repo solo distribuye safetensors. El tamano total (1,6 GB) es inferior a los ~2,5 GB esperables para 1,23 B de parametros en bf16, lo que sugiere pesos en precision reducida o un subconjunto de archivos |
| Idiomas soportados | No disponible (el campo de idiomas de HuggingFace esta vacio) |
| Licencia | No disponible; la model card incluye un campo `licence: license` sin especificar terminos |
| Formato de pesos | Safetensors, cargables con `transformers` |
| Libreria declarada | `transformers` (entrenado con TRL, con etiqueta `unsloth`) |
| Version de frameworks | TRL 0.21.0, Transformers 4.55.2, PyTorch 2.8.0+cu128, Datasets 3.6.0, Tokenizers 0.21.4 |
| Fecha de publicacion | 27 de septiembre de 2026 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura mas alla de indicar que el modelo se ha generado con `generated_from_trainer` y que el entrenamiento se ha realizado con SFT usando TRL. Las etiquetas `unsloth` y `sft` apuntan a un ajuste fino eficiente en memoria (tipicamente LoRA/QLoRA con kernels optimizados de Unsloth) sobre un modelo base pequeno, pero no se especifica el rango, los modulos adaptados, si los adaptadores se han fusionado con los pesos base ni la precision de entrenamiento. Tampoco se detalla el dataset: el sufijo `points` del nombre del modelo sugiere un conjunto de datos de puntos o pares concretos, pero no hay ninguna descripcion disponible.

No se han publicado hiperparametros (tasa de aprendizaje, tamano de lote, numero de epocas, secuencia maxima), ni el volumen de tokens de entrenamiento, ni si hubo una fase posterior de alineacion (DPO, RLHF, RLVR). Tampoco se documentan innovaciones tecnicas propias: el modelo se apoya integramente en el stack estandar de TRL y Transformers, y el unico artefacto reproducible es el fragmento de codigo de inicio rapido incluido en la model card.

## Capacidades

- Generacion de texto autoregresiva y seguimiento de instruccionesbasic, heredadas del ajuste SFT sobre un modelo de ~1 B de parametros.
- Formato conversacional: el ejemplo oficial pasa una lista de mensajes con rol `user`, lo que implica que la plantilla de chat del modelo base se conserva y se puede invocar mediante `pipeline("text-generation", ...)`.
- Generacion de texto libre con `max_new_tokens` configurable; el ejemplo usa 128 tokens nuevos.
- Capacidades multilingues: no declaradas. El nombre incluye `baoule`, que podria referirse al idioma baulé (familia akan, hablado en Cote d'Ivoire), pero la ficha no lo confirma ni lista idiomas.
- Razonamiento, matematicas y generacion de codigo: no documentados para este checkpoint concreto; en un modelo de ~1 B son capacidades limitadas incluso en la mejor de las hipotesis.
- Soporte de tool calling / function calling: no disponible ni documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Salida estructurada garantizada o decodificacion especulativa: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales ligeros: el modelo puede gestionar turnos simples de pregunta-respuesta con una plantilla de chat, lo que permite montar una demo funcional en una unica GPU de consumo antes de decidir si se escala a un modelo mayor.
- Experimentacion academica en ajuste fino (SFT): sirve como ejemplo reproducible de un pipeline TRL + Unsloth aplicado a un modelo de ~1 B, util para comparar recetas de entrenamiento o estudiar el olvido catastrofico en modelos pequenos.
- Generacion de texto de bajo coste en edge: al caber en GPUs consumer e incluso en CPU con cuantizacion agresiva, es viable para tareas de redaccion asistida, resumenes cortos o reformulacion en entornos sin acceso a APIs en la nube.
- Filtrado y clasificacion previa en cascada: puede usarse como primera etapa barata que resuelve o descarta peticiones sencillas antes de derivar las complejas a un modelo grande, reduciendo el coste medio por consulta.
- Generacion de datos sinteticos para aumentar un corpus: con la plantilla de chat adecuada puede producir variaciones de texto (parafrasis, respuestas cortas, reformulaciones) que alimenten posteriores iteraciones de entrenamiento, siempre con revision humana.
- Estudio de adaptacion a lenguas de bajos recursos: si el sufijo `baoule` responde realmente a un ajuste sobre material en baulé, el checkpoint podria emplearse como base de investigacion en procesamiento de lenguas africanas de bajos recursos, aunque la ausencia total de documentacion obliga a validarlo empiricamente antes de cualquier uso.
- Despliegue en entornos con recursos muy limitados: integrable con llama.cpp u Ollama para ejecucion en portatiles sin GPU dedicada, util en escenarios offline o de privacidad estricta donde los datos no pueden salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, y la busqueda web no ha devuelto ningun informe, paper o evaluacion independiente asociada a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos, no publicados por el autor): en bf16 o fp16, aproximadamente 2,5-3 GB solo de pesos para un modelo de ~1,23 B de parametros, mas la cache KV; en cuantizacion de 8 bits, alrededor de 1,5 GB; en 4 bits, entre 0,8 y 1,2 GB.
- Nota sobre el tamano del repositorio: los 1,6 GB declarados por HuggingFace no permiten confirmar la precision de los pesos y podrian indicar cuantizacion, pesos parciales o un modelo base de menor tamano; conviene inspeccionar los archivos antes de planificar el despliegue.
- Cache KV: en una arquitectura de tipo Llama 3.2 1B (16 capas, GQA con 8 cabezas KV, dimension de cabeza 64) la cache ronda los 32 KB por token; con contextos de 128.000 tokens superaria los 4 GB, por lo que el contexto largo domina el consumo de memoria frente a los pesos. Esta cifra es una estimacion derivada de la arquitectura publicada de la base, no un dato de la ficha.
- GPUs recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4080, 4090) es suficiente para inferencia en precision completa o cuantizada; para lotes grandes o contextos muy largos, A100 o H100 aportan margen y throughput.
- Cabe en GPU consumer: si, en la practica totalidad de GPU dedicadas modernas con 8 GB o mas, y tambien en GPUs integradas o CPU con cuantizacion de 4 bits.
- Opciones de despliegue: `transformers` (ruta oficial de la model card), llama.cpp / GGUF, Ollama, vLLM y TGI (previa conversion de los pesos al formato requerido). El modelo no publica artefactos GGUF; habria que generarlos.
- Latencia y throughput estimados: no disponibles. Con un modelo de este tamano, en una RTX 4090 se pueden esperar decenas de tokens por segundo, pero no hay ninguna medicion publicada que lo respalde.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a especificaciones publicas de los modelos alternativos y a la informacion de la ficha para el modelo analizado; no se han verificado mediante busqueda web en esta consulta y no incluyen mediciones de calidad.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| llama-3.2-1b-baoule-v3-sft-points | ~1,23 B (base, no confirmado) | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes |
| Llama-3.2-1B-Instruct | 1,23 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace (acceso con condiciones) |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | HuggingFace (acceso con condiciones) |

Frente a estas alternativas, el checkpoint analizado no aporta ninguna ventaja verificable: carece de licencia declarada, de idiomas declarados, de benchmarks y de descargas, mientras que los tres modelos de referencia cuentan con documentacion completa, evaluaciones publicas y terminos de uso explicitos. Cualquier decision de adopcion deberia partir de una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card contiene un campo `licence: license` sin contenido. No hay autorizacion explicita de uso comercial, lo que en la practica impide desplegarlo en produccion con garantias juridicas.
- Modelo base sin declarar: la model card afirma que es un ajuste de `None`, por lo que no se puede verificar la procedencia de los pesos ni si se heredan las restricciones de la Llama 3.2 Community License (que incluye clausulas de atribucion y limites de uso para mas de 700 millones de usuarios mensuales).
- Riesgo elevado de alucinacion: con ~1 B de parametros y sin datos de alineacion posteriores al SFT, la fiabilidad factua es baja. No debe usarse como fuente de informacion sin verificacion.
- Idiomas no declarados: no se puede confirmar el soporte de castellano. El nombre `baoule` podria indicar un ajuste sobre una lengua de bajos recursos, en cuyo caso el rendimiento en otros idiomas seria probablemente pobre.
- Sin datos de entrenamiento: se desconoce la composicion del dataset, con el consiguiente riesgo de sesgos no auditables, contaminacion por datos de test y problemas de derechos de autor en el corpus de origen.
- Sin benchmarks: no hay ninguna evidencia publicada de calidad, seguimiento de instrucciones o robustez. Cualquier afirmacion de rendimiento seria especulativa.
- Sin validacion por la comunidad: 0 descargas y 0 likes implican que el checkpoint no ha sido reproducido ni auditado por terceros.
- Tamano del repositorio incoherente con un modelo de 1,23 B en bf16: conviene verificar los archivos safetensors, la configuracion y la plantilla de chat antes de integrarlo, ya que podria tratarse de un modelo mas pequeno o de pesos cuantizados.
- Fechas de publicacion y actualizacion separadas por 15 minutos: no ha habido mantenimiento posterior, correccion de errores ni versionado.
- Tool calling, agentes y salida estructurada no estan documentados: no deben asumirse en un pipeline de produccion.
- Si el modelo hereda la plantilla de chat de Llama 3.2, sera necesario aplicar exactamente el mismo formato de mensajes que en el ejemplo; un prompt mal formateado degrada notablemente la calidad de la respuesta en modelos de este tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tree-AI-lab/llama-3.2-1b-baoule-v3-sft-points
- Repositorio de TRL (framework de entrenamiento citado en la model card): https://github.com/huggingface/trl
- Repositorio de Unsloth (etiqueta presente en los metadatos del modelo): https://github.com/unslothai/unsloth
- Documentacion de Transformers (entorno de inferencia declarado): https://github.com/huggingface/transformers
- Resultados de la busqueda web: no se ha encontrado ninguna fuente tecnica relacionada con el modelo. Las unicas coincidencias para los terminos consultados son articulos genericos sobre arboles (https://en.wikipedia.org/wiki/Tree) y paginas del restaurante The Tree en Paris (https://thetree-paris.com/fr), sin ninguna relacion con el checkpoint.
- Paper o informe tecnico del modelo: no disponible.
- Demo o espacio de HuggingFace: no disponible.
