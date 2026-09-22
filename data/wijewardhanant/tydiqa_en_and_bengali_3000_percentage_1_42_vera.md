# WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_42_VeRA

## Resumen

Este repositorio contiene un adaptador de ajuste fino eficiente en parametros (PEFT) construido sobre el modelo base meta-llama/Llama-3.1-8B. El autor, identificado como WijewardhanaNT, lo publica bajo la libreria PEFT 0.17.1 y en formato safetensors, con un peso de repositorio de aproximadamente 0,1 GB, lo que corresponde exclusivamente a los tensores del adaptador y no al modelo completo. El nombre del identificador indica que se ha entrenado sobre el conjunto de datos TyDi QA, restringido a los idiomas ingles y bengali, con 3000 ejemplos y con aproximadamente un 1,42 % de los parametros entrenables.

La tecnica empleada, VeRA (Vector-based Random Matrix Adaptation), pertenece a la familia de metodos de adaptacion de bajo rango: en lugar de aprender matrices completas de bajo rango como hace LoRA, congela matrices de proyeccion aleatorias compartidas entre capas y entrena unicamente vectores de escala de dimension reducida. Esto reduce drasticamente el numero de parametros entrenables y el tamano del artefacto resultante, algo relevante cuando se quiere mantener decenas de adaptadores sobre un mismo modelo base.

El interes practico del modelo es acotado pero claro: sirve como artefacto de investigacion para experimentos de ajuste eficiente en tareas de pregunta-respuesta extractiva sobre ingles y bengali, y como caso de estudio de VeRA aplicado a un modelo de 8 000 millones de parametros. La model card publicada por el autor es la plantilla por defecto de HuggingFace y no aporta informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni licencia, por lo que la mayor parte de los apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador VeRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B); la arquitectura exacta del adaptador no esta documentada en la model card |
| Parametros totales | No disponible para el adaptador (repositorio de 0,1 GB); el modelo base tiene 8 030 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens, heredada del modelo base Llama 3.1 8B; no se documenta si el adaptador fue entrenado con esa ventana |
| Tipos de cuantizacion | No disponible para el adaptador (pesos en safetensors); el modelo base admite cuantizaciones de terceros (GGUF, AWQ, GPTQ) no incluidas en este repositorio |
| Idiomas soportados | Ingles y bengali, segun el identificador del repositorio y el conjunto TyDi QA; no confirmado en la model card |
| Licencia | No disponible (el modelo base Llama 3.1 se distribuye bajo la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | PEFT 0.17.1, compatible con transformers |
| Modelo base | meta-llama/Llama-3.1-8B |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 7 descargas, 0 likes |
| Fecha de creacion | 2026-09-22 segun los metadatos del repositorio |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B, un transformer decoder-only autorregresivo con atencion por grupos (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado por Meta con una ventana de contexto nativa de 128 000 tokens. Sobre el se aplica un adaptador de tipo VeRA. En VeRA, las matrices de proyeccion de bajo rango se inicializan aleatoriamente, se congelan y se comparten entre todas las capas adaptadas; el unico conjunto de parametros entrenables son vectores de escala por capa, lo que reduce el numero de parametros entrenables en uno o dos ordenes de magnitud respecto a LoRA con un rango comparable. El repositorio no documenta en que modulos se inserta el adaptador, ni el rango efectivo, ni la dimension de los vectores de escala.

Respecto a los datos de entrenamiento, el identificador indica el uso de TyDi QA (un benchmark de pregunta-respuesta extractiva en 11 idiomas tipologicamente diversos) filtrado a ingles y bengali, con una muestra de 3000 ejemplos y un porcentaje de parametros entrenables del 1,42 %. No hay informacion en la model card sobre el numero de tokens vistos, la composicion exacta del dataset, la mezcla de idiomas, el regimen de precision (fp32, fp16, bf16), la tasa de aprendizaje, el numero de epocas ni la existencia de fases de RLHF o DPO. Tampoco se documenta la infraestructura de computo ni el coste de entrenamiento. La unica referencia tecnica explicita en los metadatos es el articulo arXiv:1910.09700 (Lacoste et al., 2019), citado en la plantilla de la model card como base para el calculo de emisiones de carbono, no como publicacion del modelo.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas sobre pasajes, presumiblemente en ingles y bengali, heredando la capacidad generativa del modelo base.
- Comprension lectora multilingue en el par ingles-bengali, segun el conjunto de entrenamiento declarado en el identificador.
- Razonamiento basico y conocimiento general procedentes de Llama 3.1 8B, no verificados tras el ajuste.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base Llama 3.1 8B si lo soporta de forma nativa, pero el ajuste podria degradarlo.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Capacidades multimodales (vision, audio): no disponibles; ni el modelo base ni el adaptador las incluyen.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Idiomas adicionales a ingles y bengali: no documentados.

## Casos de uso

- Pregunta-respuesta extractiva sobre documentacion en bengali: el adaptador puede emplearse para localizar respuestas literales dentro de pasajes en bengali, un idioma con poca cobertura en modelos ajustados. Es util para construir asistentes de consulta sobre corpus normativos o administrativos en ese idioma.
- Recuperacion aumentada (RAG) multilingue: combinado con un recuperador vectorial, el adaptador actua como generador final que sintetiza la respuesta a partir de fragmentos recuperados en ingles y bengali, aprovechando la ventana de 128 000 tokens del modelo base para concatenar muchos pasajes.
- Investigacion en ajuste eficiente de parametros: sirve como punto de comparacion reproducible entre VeRA, LoRA y QLoRA sobre un mismo modelo base y un mismo dataset, midiendo exactitud en TyDi QA y coste de almacenamiento por adaptador.
- Evaluacion de olvido catastrofico: al ser un adaptador de bajo rango sobre un modelo generalista, permite estudiar cuanto conocimiento general de Llama 3.1 8B se degrada tras un ajuste estrecho en una tarea de QA.
- Anotacion asistida de corpus linguisticos: uso como preanotador de pares pregunta-respuesta en bengali para que revisores humanos validen las respuestas, reduciendo el coste de construccion de conjuntos de datos.
- Despliegue multi-adaptador sobre un unico base: dado su tamano reducido (0,1 GB), varios adaptadores VeRA pueden servirse desde la misma instancia del modelo base, conmutando el adaptador segun el idioma o la tarea solicitada.
- Docencia y prototipado: ejemplo de bajo coste computacional para ilustrar el flujo completo de PEFT con transformers y PEFT 0.17.1 en entornos con una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye seccion de evaluacion cumplimentada, no se reportan metricas de exactitud (EM), F1, MMLU, HumanEval ni GSM8K, y los resultados de la busqueda web no aportan datos tecnicos sobre este repositorio.

## Requisitos de hardware

- Almacenamiento del adaptador: aproximadamente 0,1 GB en safetensors, segun el tamano del repositorio.
- VRAM para el modelo base en bf16/fp16: del orden de 16 GB de pesos, mas memoria para el cache KV y activaciones; en la practica se recomienda entre 18 y 24 GB para secuencias moderadas.
- VRAM con cuantizacion de 4 bits del modelo base: aproximadamente 5 a 7 GB de pesos, lo que permite ejecucion en GPUs de consumo.
- GPUs recomendadas: A100 40 GB o H100 para lotes grandes y contextos largos; RTX 4090 (24 GB) para inferencia en bf16 con lotes pequenos; RTX 3090, 4080 o 4070 Ti con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM si se cuantiza el modelo base; el adaptador en si es marginal en memoria.
- Opciones de despliegue: transformers con peft para cargar el adaptador; vLLM o TGI con soporte de adaptadores LoRA-like (la compatibilidad con VeRA debe verificarse, ya que no todos los motores soportan esta variante); llama.cpp u Ollama solo si se fusionan previamente los pesos del adaptador con el modelo base y se convierten a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Este adaptador (VeRA sobre Llama 3.1 8B) | Adaptador PEFT | No disponible (~1,42 % entrenable segun el identificador) | 128 000 tokens (heredado del base) | No disponible | 7 descargas, 0 likes, sin evaluacion publicada |
| Adaptador LoRA sobre Llama 3.1 8B | Adaptador PEFT | Tipicamente 0,1-1 % entrenable | 128 000 tokens | Depende del autor | Mayor ecosistema de herramientas y soporte nativo en vLLM y TGI; el tamano del artefacto suele ser mayor que VeRA |
| Ajuste fino completo de Llama 3.1 8B | Modelo completo | 8 030 millones | 128 000 tokens | Llama 3.1 Community License | Requiere mucho mas computo y almacenamiento; mayor riesgo de olvido catastrofico |
| QLoRA sobre Llama 3.1 8B | Adaptador PEFT con base cuantizado | Tipicamente 0,1-1 % entrenable | 128 000 tokens | Depende del autor | Permite entrenar en GPUs de consumo; mayor consumo de VRAM en entrenamiento que VeRA |

La comparativa se limita a caracteristicas estructurales porque no existen resultados de benchmarks publicados para este adaptador que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- Model card vacia: el autor no ha cumplimentado ninguna seccion (descripcion, usos, sesgos, datos de entrenamiento, evaluacion, licencia), por lo que no hay garantias documentadas sobre el comportamiento del modelo.
- Licencia no declarada: al derivar de Llama 3.1 8B, el uso comercial queda sujeto a la Llama 3.1 Community License de Meta, que impone condiciones de atribucion y restricciones de uso; la ausencia de licencia explicita en el repositorio es un riesgo juridico para produccion.
- Riesgo de alucinacion: el modelo base Llama 3.1 8B puede generar respuestas plausibles pero incorrectas. Sin evaluacion publicada, no hay estimacion de la tasa de error en TyDi QA ni de la degradacion respecto al modelo sin ajustar.
- Cobertura idiomatica estrecha: el ajuste se limita a ingles y bengali. El comportamiento en castellano u otros idiomas no esta documentado y podria haberse degradado respecto al modelo base.
- Sesgos: no evaluados. El modelo base incorpora sesgos de sus datos de preentrenamiento; el ajuste sobre TyDi QA no los corrige y podria introducir sesgos especificos del dominio y de la distribucion del corpus.
- Corpus de entrenamiento reducido: 3000 ejemplos es un volumen pequeno, lo que aumenta el riesgo de sobreajuste a los patrones de TyDi QA y de generalizacion pobre fuera de ese formato de pregunta-respuesta.
- Compatibilidad de despliegue incierta: VeRA no cuenta con soporte nativo en todos los motores de inferencia (vLLM, TGI, llama.cpp); es probable que sea necesario fusionar los pesos con el modelo base antes de servir el modelo.
- Metadatos inconsistentes: las fechas de creacion y actualizacion indican 2026-09-22, posteriores a la fecha de consulta habitual, lo que sugiere un error de marca temporal en el repositorio.
- Adopcion practicamente nula: 7 descargas y 0 likes implican que el modelo no ha sido validado por terceros y no existe comunidad de soporte.
- Busqueda web sin resultados utiles: las consultas realizadas no devolvieron articulos, repositorios ni demostraciones relacionadas con este adaptador.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_42_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Articulo citado en los metadatos: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019, cuantificacion de emisiones de carbono; citado en la plantilla de la model card, no es la publicacion del modelo)
- Libreria PEFT: https://github.com/huggingface/peft
- Conjunto de datos TyDi QA (referencia no enlazada por el autor): https://github.com/google-research-datasets/tydiqa
- No se han encontrado papers, blogs, repositorios ni demostraciones adicionales en los resultados de la busqueda web.
