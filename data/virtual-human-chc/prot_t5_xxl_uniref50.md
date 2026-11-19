# virtual-human-chc/prot_t5_xxl_uniref50

## Resumen

Prot_t5_xxl_uniref50 es un modelo de lenguaje especializado en proteinas, publicado en Hugging Face por el usuario virtual-human-chc. Se trata de la version XXL de ProtT5, la familia de modelos T5 adaptados al dominio de las proteinas mediante entrenamiento sobre secuencias de aminoacidos, desarrollada originalmente por Ahmed Elnaggar y colaboradores en el Rostlab de la Universidad Tecnica de Munich (TUM). El modelo resuelve tareas de representacion y generacion sobre secuencias proteicas: embeddings contextuales por residuo, prediccion de estructura secundaria, localizacion subcelular, interacciones proteina-proteina y generacion de secuencias.

La relevancia de esta publicacion concreta es limitada: se trata de un espejo (mirror) del checkpoint ProtT5 XXL entrenado sobre UniRef50, con solo 1 descarga y 0 likes en el momento de la consulta, y un repositorio de 90,2 GB. La model card es practicamente vacia: solo contiene metadatos YAML (licencia, modalidad, cita y desarrollador original), sin especificaciones tecnicas, sin datos de entrenamiento detallados y sin resultados de benchmarks. No debe confundirse este repositorio con el oficial de Rostlab, que es la referencia canonica para el modelo.

Arquitectonicamente es un transformer encoder-decoder T5 de escala XXL, con aproximadamente 3.000 millones de parametros (11.000 millones en la variante T5-XXL estandar; en ProtT5 XXL la cifra habitual citada en la literatura es de unos 3.000 millones para el modelo completo). El contexto de entrenamiento tipico de ProtT5 es de 512 tokens (residuos), aunque el repositorio consultado no documenta este dato de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | no disponible en la model card; la literatura de ProtT5 XXL cita ~3.000 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; la literatura de ProtT5 cita 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en PyTorch; compatible con cuantizacion estandar via herramientas externas) |
| Idiomas soportados | no aplica (dominio: secuencias de proteinas, alfabeto de aminoacidos) |
| Licencia | AFL-3.0 (Academic Free License 3.0) |
| Formato de pesos | PyTorch (checkpoint nativo); no se documenta GGUF ni safetensors en la model card |
| Tamano del repositorio | 90,2 GB |
| Modalidad | proteinas (vh_modality: proteins) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5 (Text-to-Text Transfer Transformer) en configuracion XXL: encoder-decoder con atencion multi-cabeza completa, normalizacion LayerNorm y embeddings relativos de posicion. En ProtT5, el vocabulario de texto se sustituye por el alfabeto de aminoacidos (20 residuos estandar mas tokens especiales como X para residuos desconocidos y el token de separacion). El preentrenamiento se realiza con el objetivo span corruption (masked language modeling tipo T5), en el que se enmascaran spans contiguos de residuos y el modelo debe reconstruirlos.

Segun la cita incluida en la model card (Elnaggar et al., IEEE TPAMI 2021, "ProtTrans: Towards Cracking the Language of Life's Code Through Self-Supervised Deep Learning and High Performance Computing"), el entrenamiento se realiza sobre UniRef50, un conjunto de clusters de secuencias proteicas con un 50 % de identidad maxima, que contiene decenas de millones de secuencias. El articulo original reporta entrenamiento en supercomputacion (Summit de Oak Ridge y HAICORE de KIT) durante semanas. La model card de este repositorio concreto no documenta el numero exacto de tokens, la composicion del dataset, ni si hubo etapas de ajuste fino supervisado o RLHF; en la literatura original, ProtT5 se presenta como modelo preentrenado sin RLHF.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, SSM) en la informacion disponible. El interes tecnico del modelo reside en la transferencia de un transformer de gran escala a un dominio biologico con alfabeto reducido y secuencias de longitud media.

## Capacidades

- Generacion de embeddings contextuales por residuo de proteina, utilizables como features para tareas downstream (prediccion de estructura secundaria, accesibilidad al solvente, puentes disulfuro).
- Prediccion de localizacion subcelular y de senales de direccionamiento a partir de la secuencia.
- Modelado de interacciones proteina-proteina mediante representaciones conjuntas.
- Generacion de secuencias proteicas (capacidad decoder del T5, aunque menos explorada que el uso como encoder).
- Ajuste fino supervisado para tareas de clasificacion y regresion sobre secuencias proteicas.
- Capacidad de reconstruccion de residuos enmascarados (util para imputacion de mutaciones o diseno de variantes).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de dominio, no un asistente conversacional.
- No soporta vision, audio ni texto en lenguaje natural de forma nativa.
- Capacidades multilingues: no aplica; el "idioma" es el alfabeto de aminoacidos.

## Casos de uso

- Anotacion funcional de proteinas: usar los embeddings por residuo del encoder para entrenar clasificadores ligeros que predigan familia proteica o funcion molecular a partir de secuencias sin anotar, reduciendo la dependencia de alineamientos BLAST.
- Prediccion de estructura secundaria: ajustar una cabeza ligera sobre las representaciones del encoder para predecir helices alfa, laminas beta y bucles, tarea clasica en la que ProtT5 se usa como extractor de features.
- Priorizacion de variantes en genomica clinica: comparar embeddings de la secuencia wild-type frente a la mutante para estimar el impacto funcional de variantes missense, como paso de filtrado previo a validacion experimental.
- Diseno de proteinas y mutagénesis dirigida: emplear la cabeza decoder para generar variantes de una secuencia dada y filtrar candidatos por plausibilidad bajo el modelo, en pipelines de protein engineering.
- Busqueda y agrupamiento de homologia remota: indexar embeddings medios de proteina en bases vectoriales (FAISS, Milvus) para recuperar proteinas funcionalmente similares cuando la identidad de secuencia es baja y BLAST no encuentra homologos.
- Modelado de interacciones proteina-proteina: generar representaciones conjuntas de pares de secuencias para clasificar si interactuan, en estudios de interactoma.
- Preentrenamiento de modelos downstream: usar el checkpoint como inicializacion para ajuste fino en tareas con pocos datos etiquetados, aprovechando el preentrenamiento sobre UniRef50.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de resultados. El articulo original de ProtTrans (Elnaggar et al., 2021) reporta resultados para ProtT5 en tareas como prediccion de estructura secundaria (Q3, Q8), localizacion subcelular y accesibilidad al solvente, pero esos datos no forman parte de la informacion proporcionada en esta ficha y no deben atribuirse a este repositorio concreto sin verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): el checkpoint ocupa 90,2 GB en el repositorio, por lo que la inferencia en fp32 requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) o sharding multi-GPU.
- En fp16/bf16: aproximadamente 45-50 GB de VRAM, viable en una A100 80GB o H100 80GB con margen; en dos RTX 4090 (24 GB cada una) mediante tensor parallelism.
- En cuantizacion de 8 bits: aproximadamente 25-30 GB, posible en una RTX 4090 24GB con limitaciones de longitud de secuencia.
- En cuantizacion de 4 bits: aproximadamente 15-18 GB, cabe en una RTX 4090, RTX 3090 o A6000.
- No cabe en GPUs consumer de 8-12 GB (RTX 3060, RTX 4060) sin cuantizacion agresiva y secuencias muy cortas.
- Opciones de despliegue: PyTorch nativo con Hugging Face Transformers (T5EncoderModel / T5ForConditionalGeneration), aceleracion con DeepSpeed o FSDP para multi-GPU, vLLM con soporte T5 (limitado para encoder-decoder), y exportacion a ONNX. llama.cpp y Ollama no soportan arquitectura T5 encoder-decoder de forma estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, el coste escala cuadraticamente con la longitud de secuencia en el encoder; secuencias de 512 residuos son el caso tipico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProtT5 XXL (este repo) | ~3.000 M (segun literatura) | 512 (segun literatura) | AFL-3.0 | Hugging Face (mirror) |
| ESM-2 650M (Meta) | 650 M | 1.024 | MIT (pesos abiertos) | Hugging Face (facebook/esm2_t33_650M_UR50D) |
| ESM-2 3B (Meta) | 3.000 M | 1.024 | MIT (pesos abiertos) | Hugging Face (facebook/esm2_t36_3B_UR50D) |
| ProtBERT (Rostlab) | 420 M | 512 | MIT (pesos abiertos) | Hugging Face (Rostlab/prot_bert) |

Comparativa cualitativa: ESM-2 es encoder-only y esta optimizado para representaciones, con contexto de 1.024 residuos y licencia MIT mas permisiva para uso comercial. ProtT5 XXL es encoder-decoder, lo que permite generacion ademas de representacion, pero su licencia AFL-3.0 impone condiciones adicionales. ProtBERT es una alternativa mas ligera (420 M) para tareas de representacion con recursos limitados. No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la literatura original de ProtTrans y ESM-2 reporta resultados en tareas de estructura y funcion, pero no se incluyen aqui por no formar parte de la informacion consultada.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta datos de entrenamiento exactos, composicion del dataset, hiperparametros ni evaluacion. La trazabilidad es baja.
- Repositorio espejo no oficial: el autor virtual-human-chc no es el desarrollador original (Rostlab/TUM). No hay garantia de que los pesos coincidan bit a bit con el checkpoint oficial de Rostlab.
- Licencia AFL-3.0: permite uso comercial con condiciones (atribucion, inclusion de la licencia, reciprocidad sobre modificaciones). Requiere revision legal antes de integrar en productos propietarios.
- Riesgo de alucinacion en generacion: como modelo generativo de secuencias, puede producir secuencias proteicas plausibles pero no funcionales o no expresables; cualquier candidato generado requiere validacion experimental.
- Sesgo de dominio: entrenado sobre UniRef50, que sobrerrepresenta proteinas bien estudiadas (humanas, bacterianas modelo) y subrepresenta taxones minoritarios; los embeddings pueden ser menos fiables para proteinas de organismos poco secuenciados.
- Longitud de contexto limitada (512 residuos segun la literatura): proteinas largas requieren truncamiento o segmentacion, con perdida de informacion global.
- Coste computacional elevado: 90,2 GB de checkpoint y ~3.000 M de parametros dificultan el ajuste fino en hardware modesto; se recomienda congelar el encoder y entrenar cabezas ligeras.
- Sin soporte conversacional ni tool calling: no es adecuado para tareas de asistente general.
- Fecha de actualizacion del repositorio (2026-11-19) posterior a la de creacion (2025-10-21): verificar integridad de los pesos antes de usarlos en produccion.
- No se documenta si los pesos estan en safetensors o en formato PyTorch clasico (pickle); el uso de pickle implica riesgos de seguridad al cargar checkpoints de origen no verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/virtual-human-chc/prot_t5_xxl_uniref50
- Articulo original de ProtTrans (cita incluida en la model card): https://doi.org/10.1109/TPAMI.2021.3095381
- Repositorio oficial de Rostlab (referencia canonica de ProtT5): https://huggingface.co/Rostlab/prot_t5_xxl_uniref50
- Paper ProtTrans en arXiv: https://arxiv.org/abs/2007.06225
- Repositorio de codigo ProtTrans: https://github.com/agemagician/ProtTrans
- Modelo ESM-2 de Meta (alternativa comparable): https://huggingface.co/facebook/esm2_t36_3B_UR50D
- Modelo ProtBERT de Rostlab (alternativa ligera): https://huggingface.co/Rostlab/prot_bert
