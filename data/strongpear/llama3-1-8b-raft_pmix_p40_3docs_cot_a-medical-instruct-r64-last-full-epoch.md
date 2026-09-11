# strongpear/Llama3.1-8B-RAFT_PMIX_P40_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) afinado sobre `meta-llama/Llama-3.1-8B`, publicado por el usuario `strongpear`. No es un modelo completo, sino un conjunto de pesos de adaptador de 0,7 GB que debe cargarse junto al modelo base. El nombre del repositorio describe la receta de entrenamiento: RAFT (Retrieval-Augmented Fine-Tuning), con 3 documentos en contexto, un 40 % de documentos distractores (etiqueta P40), respuestas con cadena de pensamiento (CoT) y un dominio declarado como medico, todo ello sobre una variante Instruct y con rango de LoRA 64, en el ultimo epoch completo. Esta interpretacion procede del identificador del repositorio, no de documentacion del autor.

El modelo base, Llama 3.1 8B, es un transformer decoder-only de 8.030 millones de parametros con atencion de consultas agrupadas (GQA), ventana de contexto de 128.000 tokens y licencia comunitaria de Meta. El interes de este adaptador reside en su enfoque RAFT aplicado a dominio sanitario: la combinacion de recuperacion documental, distractores controlados y razonamiento explicito busca reducir alucinaciones en tareas de pregunta-respuesta sobre documentacion clinica.

La model card del repositorio es la plantilla por defecto de Hugging Face sin rellenar: no incluye datos de entrenamiento, hiperparametros, licencia ni resultados de evaluacion. Se ha publicado con 0 descargas y 0 likes y sin documentacion adicional, por lo que toda evaluacion rigurosa exige reproducir el adaptador con el modelo base y validarlo en el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA (heredada de Llama 3.1 8B) mas adaptador LoRA |
| Parametros totales | 8.030 millones en el modelo base; el adaptador anade los pesos de las matrices LoRA (rango 64), no cuantificados en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base; no confirmado para el adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (precision nativa de PEFT); no se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | El modelo base soporta oficialmente 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes); el adaptador no declara idiomas |
| Licencia | No disponible en la ficha del repositorio; al derivar de Llama 3.1 8B queda sujeta a la Llama 3.1 Community License |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.20.0, transformers |
| Tamano del repositorio | 0,7 GB |
| Modelo base | meta-llama/Llama-3.1-8B |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only de 32 capas, dimension oculta de 4096, 32 cabezas de atencion y 8 cabezas de clave/valor (GQA), con normalizacion RMSNorm, activacion SwiGLU y embeddings posicionales rotatorios (RoPE). El modelo base se entreno sobre mas de 15 billones de tokens y su variante Instruct incorpora ajuste supervisado seguido de optimizacion por preferencias humanas (RLHF y DPO). El adaptador no modifica esta arquitectura: anade matrices de bajo rango sobre las proyecciones de atencion, con rango r=64 segun el nombre del repositorio, lo que explica un tamano de 0,7 GB.

Respecto al procedimiento de ajuste, la unica informacion disponible es la inferida del identificador: RAFT (Retrieval-Augmented Fine-Tuning), una tecnica que entrena al modelo con contextos que contienen documentos relevantes mezclados con distractores (aqui, 3 documentos por ejemplo y una proporcion P40 de distractores), de modo que el modelo aprenda a citar y razonar sobre la evidencia correcta y a ignorar la irrelevante. El sufijo CoT indica que las respuestas de entrenamiento incluyen cadenas de razonamiento, y A-MEDICAL apunta a un corpus del ambito sanitario. El sufijo `last-full-epoch` sugiere que se conservo el checkpoint del ultimo epoch completo, lo que reduce el riesgo de sobreajuste respecto a checkpoints intermedios. No se dispone de numero de tokens, composicion del dataset, hiperparametros (tasa de aprendizaje, precision, dropout) ni detalles del pipeline RAFT empleado.

## Capacidades

- Generacion de texto instructiva y conversacional en el dominio para el que fue ajustado (documentacion medica con recuperacion aumentada).
- Razonamiento paso a paso: el entrenamiento con CoT busca que el modelo explicite el razonamiento antes de la respuesta final, util para trazabilidad.
- Q&A sobre documentos: manejo de contextos con varios documentos simultaneos y distractores, con el objetivo de citar unicamente la evidencia relevante.
- Capacidades heredadas del modelo base Llama 3.1 8B Instruct: generacion de codigo, matematicas basicas, resumen, reescritura y clasificacion.
- Soporte multilingue limitado a los 8 idiomas oficiales del modelo base, con rendimiento claramente superior en ingles.
- Ventana de contexto de hasta 128.000 tokens del modelo base (el adaptador no la amplia ni, presumiblemente, la recorta, aunque no esta confirmado).
- No se documenta soporte explicito de tool calling, function calling ni uso agentico; si se conserva, seria el del modelo base Instruct.

## Casos de uso

- Pregunta-respuesta sobre historiales clinicos y guias de practica clinica: el ajuste RAFT con distractores entrena al modelo para localizar la evidencia correcta entre varios documentos recuperados, reduciendo respuestas basadas en fragmentos irrelevantes.
- Asistencia a la codificacion medica (CIE-10, SNOMED): dado un informe y el catalogo de codigos recuperado, el modelo puede proponer codigos justificando cada asignacion con el fragmento textual correspondiente.
- Extraccion de informacion estructurada de informes: transformar texto libre en campos normalizados (diagnostico, tratamiento, posologia) con razonamiento explicito que permita auditar cada decision.
- Sistemas RAG sanitarios en produccion: el adaptador se integra en un pipeline de recuperacion existente (por ejemplo, con un indice vectorial) para generar respuestas fundamentadas, y su naturaleza LoRA permite combinarlo con otros adaptadores o descartarlo sin reentrenar el modelo base.
- Investigacion en tecnicas RAFT: sirve como punto de partida reproducible para estudiar el efecto de la proporcion de distractores (P40) y del numero de documentos (3) en la fidelidad a la evidencia.
- Generacion de resumenes de literatura medica: con 128.000 tokens de contexto se pueden procesar varios articulos completos y sintetizar hallazgos manteniendo las referencias internas.
- Formacion y simulacion clinica: generacion de casos y preguntas razonadas para entornos docentes, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna seccion de evaluacion cumplimentada, y los resultados de busqueda web no aportan datos sobre este modelo.

## Requisitos de hardware

Las cifras siguientes se derivan de la arquitectura del modelo base Llama 3.1 8B; el adaptador LoRA anade una sobrecarga pequena (0,7 GB en precision nativa) que desaparece si se fusiona con los pesos base.

- VRAM para los pesos en bf16/fp16: aproximadamente 16 GB, mas memoria para el cache KV.
- VRAM con cuantizacion de 8 bits: aproximadamente 9 GB.
- VRAM con cuantizacion de 4 bits: aproximadamente 5-6 GB.
- Cache KV: con la arquitectura del modelo base (32 capas, 8 cabezas KV, dimension de cabeza 128) cada token consume unos 128 KiB en fp16, es decir, del orden de 16 GB para una ventana completa de 128.000 tokens. En la practica conviene limitar la ventana o usar cache cuantizado.
- GPU profesionales: A100 40/80 GB, H100, L40S; una sola A100 40 GB permite servir el modelo en bf16 con contexto amplio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado, y en RTX 3090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti (12 GB) o RTX 3060 (12 GB) con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y TGI (ambos soportan adaptadores LoRA en servicio), llama.cpp u Ollama si se fusiona y convierte el modelo a GGUF, y cualquier servidor compatible con la API de OpenAI que soporte Llama 3.1 8B.
- Latencia y throughput: no disponibles; dependen del hardware, de la cuantizacion y de la longitud de contexto efectiva.

## Comparativa con modelos similares

Todos los datos de la columna de este adaptador son los del modelo base, ya que la ficha no publica especificaciones propias.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama3.1-8B-RAFT (este adaptador) | 8,03 B (base) + LoRA r64 | 128.000 (base) | No declarada; sujeta a Llama 3.1 Community License | Adaptador PEFT en Hugging Face, 0 descargas | Sin benchmarks ni model card cumplimentada |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | Pesos completos en Hugging Face | Referencia generalista, sin especializacion RAFT |
| Qwen2.5-7B-Instruct | 7,61 B | 128.000 | Apache 2.0 | Pesos completos en Hugging Face | Licencia permisiva, buen rendimiento multilingue |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 | Apache 2.0 | Pesos completos en Hugging Face | Contexto menor, licencia mas laxa |

No se dispone de comparativas de rendimiento especificas para este adaptador frente a modelos medicos especializados (por ejemplo, Meditron o adaptadores medicos sobre Llama), ya que no hay evaluacion publicada.

## Limitaciones y advertencias

- Model card vacia: no hay informacion verificable sobre datos de entrenamiento, hiperparametros, licencia ni evaluacion. Cualquier uso en produccion exige una validacion propia.
- Alucinacion: aunque el ajuste RAFT busca reducirla, persiste el riesgo de respuestas plausibles pero incorrectas, especialmente con preguntas fuera del dominio entrenado.
- Ambito sanitario: un modelo de lenguaje no es un dispositivo medico ni sustituye el juicio clinico; cualquier salida debe pasar por revision profesional antes de influir en decisiones sobre pacientes.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Llama 3.1, que no esta documentado en detalle para este adaptador, y el posible sesgo de la fuente de datos medicos empleada.
- Idiomas: el ajuste se realizo presumiblemente en ingles; el rendimiento en castellano no esta verificado y puede degradarse respecto al modelo base.
- Contexto: no se confirma que el adaptador mantenga el rendimiento del modelo base en ventanas muy largas; la combinacion de 3 documentos y distractores sugiere un regimen de entrenamiento con contextos moderados.
- Licencia: la Llama 3.1 Community License impone obligaciones (atribucion, nombrado de productos derivados, restricciones para organizaciones con mas de 700 millones de usuarios mensuales) y no permite el uso para entrenar otros modelos de lenguaje sin autorizacion. Al no declararse licencia en el repositorio, la situacion juridica del adaptador es ambigua.
- Madurez: 0 descargas y 0 likes implican ausencia de validacion por terceros y ningun historial de incidencias.
- Tool calling y agentes: no se documenta ningun ajuste especifico, por lo que la fiabilidad en llamadas a funciones es la del modelo base, no mejorada.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P40_3DOCS_CoT_A-MEDICAL-Instruct-r64-last-full-epoch
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Paper referenciado en las etiquetas (Lacoste et al., 2019, cuantificacion de emisiones): https://arxiv.org/abs/1910.09700
- Los resultados de la busqueda web no aportan enlaces relevantes sobre este modelo: devuelven exclusivamente paginas de ayuda y articulos sobre Google Maps, sin relacion con el repositorio.
