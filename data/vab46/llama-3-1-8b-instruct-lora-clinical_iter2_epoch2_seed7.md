# vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch2_seed7

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Lo publica el usuario vab46 y esta orientado al dominio de ensayos clinicos: su objetivo declarado es responder preguntas generales sobre ensayos clinicos (vision macro, criterios de elegibilidad de pacientes, aspectos operativos) y servir de apoyo en tareas de ingenieria de prompts y generacion aumentada por recuperacion (RAG) sobre fragmentos de ensayos clinicos. El adaptador se entrena sobre el dataset "iter2 anchor-context-groundTruth_junkHandled", mapeado mediante plantillas de chat.

Tecnicamente es un modelo de lenguaje causal autoregresivo de tipo decoder, con 8.000 millones de parametros en el modelo base, una dimension oculta de 4096 y una ventana de contexto de 131.072 tokens (128K). El adaptador es ligero: el repositorio ocupa aproximadamente 0,3 GB, lo que confirma que unicamente se distribuyen los pesos del LoRA, no el modelo completo. La modalidad soportada es exclusivamente texto y el unico idioma declarado es el ingles.

Su relevancia actual es acotada y debe interpretarse con cautela: se trata de un experimento de ajuste fino orientado a un nicho muy especifico (documentacion de ensayos clinicos) y con cero descargas y cero "likes" en el momento de la consulta. No incluye resultados de evaluacion, ni model card con metricas, ni validacion externa, por lo que su utilidad practica esta por demostrar. Resulta interesante como ejemplo de flujo de trabajo LoRA sobre Llama 3.1 aplicado a RAG en dominio sanitario, pero no como componente listo para produccion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder autoregresivo (Llama 3.1) con adaptador PEFT/LoRA |
| Parametros totales | 8.000 millones en el modelo base; tamano del adaptador no disponible (repo de 0,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | 4 bits nf4 con doble cuantizacion via bitsandbytes (segun la model card); no se documentan GGUF ni otras variantes |
| Idiomas soportados | ingles (en) |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (pesos del adaptador LoRA) |

Datos adicionales declarados: dimension de salida (hidden size) de 4096, modalidad soportada de texto, plantilla de chat heredada del modelo base y dataset de entrenamiento mapeado con dicha plantilla.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder autoregresivo de 8.000 millones de parametros con 4096 dimensiones ocultas y una ventana de contexto de 131.072 tokens. Sobre el se aplica un adaptador LoRA entrenado con la libreria PEFT, de modo que la inferencia requiere cargar primero el modelo base (meta-llama/Llama-3.1-8B-Instruct, sujeto a aceptacion de licencia en HuggingFace) y despues superponer los pesos del adaptador. No se especifica el rango del LoRA, los modulos objetivo ni el numero exacto de parametros entrenables.

El ajuste se realizo sobre el dataset "iter2 anchor-context-groundTruth_junkHandled", vinculado a ensayos clinicos, con ejemplos mapeados a la plantilla de chat del modelo base. Los hiperparametros declarados son: tamano de batch de entrenamiento 4, pasos de acumulacion de gradiente 4 (batch efectivo de 16), weight decay 0,01, learning rate 0,00025, scheduler lineal y directorio de salida /kaggle/working/rag3_llama_lora, lo que indica que el entrenamiento se ejecuto en un entorno Kaggle. Existe una discrepancia documental relevante: la model card indica "Total Epochs: 1", mientras que el nombre del repositorio indica "epoch2". No se documenta el uso de RLHF, DPO u otra fase de alineacion adicional mas alla del ajuste supervisado sobre el modelo Instruct. Tampoco se indica el numero de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto en ingles sobre tematica de ensayos clinicos: vision general macro, criterios de elegibilidad de pacientes, cuestiones operativas y de diseno de estudios.
- Respuesta a preguntas ancladas en contexto recuperado, pensada para flujos RAG en los que se insertan bloques de contexto con titulo, resumen y criterios de inclusion.
- Redaccion y reformulacion de prompts relacionados con ensayos clinicos (prompt engineering sobre documentos de CT).
- Generacion de respuestas a partir de fragmentos recuperados de documentacion clinica, con la plantilla de chat de Llama 3.1.
- Soporte de conversacion multi-turno a nivel de plantilla de chat del modelo base (historial de mensajes system/user/assistant).
- Capacidades heredadas del modelo base Llama 3.1 8B Instruct: razonamiento general, generacion de codigo y matematicas basicas, comprension multilingue parcial y uso de herramientas. No obstante, el ajuste LoRA puede degradar estas capacidades fuera del dominio clinico y no se ha publicado ninguna evaluacion al respecto.
- No se documentan capacidades de vision, audio, modo "thinking" explicito ni function calling especifico tras el ajuste.

## Casos de uso

- Busqueda y resumen de ensayos clinicos: dado un conjunto de documentos, el modelo resume titulo, objetivo, criterios de inclusion y exclusion de cada ensayo, apoyandose en su ventana de 128K tokens para procesar varios documentos en una sola llamada.
- Preseleccion de candidatos a ensayo: a partir de un perfil de paciente y de los criterios de elegibilidad recuperados, el modelo puede generar un borrador de justificacion de inclusion o exclusion, siempre con revision humana obligatoria.
- Asistente RAG interno para equipos de investigacion clinica: integrado en un pipeline que recupera fragmentos de protocolos y responde preguntas operativas (calendario de visitas, variables de resultado, procedimientos).
- Generacion de borradores de documentacion de estudio: apoyo en la redaccion de resumenes de protocolo, notas de factibilidad o textos de comunicacion a investigadores, a partir de material fuente recuperado.
- Normalizacion y extraccion estructurada: reformateo de informacion de ensayos (criterios, objetivos, poblacion) en esquemas de campos definidos por plantilla de prompt.
- Evaluacion comparativa interna: uso como linea base de ajuste fino de dominio para comparar estrategias de LoRA, prompts y configuraciones de RAG en el ambito de ensayos clinicos.
- Prototipado academico: experimento reproducible de PEFT sobre Llama 3.1 para investigacion en procesamiento de lenguaje natural aplicado a salud, con coste de almacenamiento muy bajo (0,3 GB de adaptador).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, evaluaciones clinicas ni comparaciones cuantitativas con otros modelos. Tampoco hay datos de evaluacion por parte de terceros ni de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 el modelo base de 8B requiere aproximadamente 16 GB de VRAM; en cuantizacion 4 bits nf4 con bitsandbytes, alrededor de 5-6 GB, a lo que se suma un margen para el contexto (el coste de la cache KV crece con la longitud de contexto y puede ser considerable con 128K tokens).
- GPU recomendadas: una unica GPU de 24 GB (RTX 3090, RTX 4090, L4, A10G) cubre con holgura la inferencia en 4 bits e incluso en fp16; para lotes grandes o contextos muy largos conviene A100 40/80 GB o H100.
- GPU de consumo: si, cabe en GPU de consumo con 16 GB o mas (RTX 4080, RTX 4090) usando cuantizacion 4 bits; con 8-12 GB el contexto util queda muy limitado por la memoria de la cache KV.
- Opciones de despliegue: la model card documenta exclusivamente Transformers mas PEFT mas bitsandbytes. No se proporcionan instrucciones ni pesos para vLLM, TGI, llama.cpp, Ollama ni otros motores; al ser un adaptador LoRA, su uso con esos motores requeriria fusionar el adaptador con el modelo base o cargarlo como LoRA dinamico si el motor lo soporta.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo ajustado, por lo que la comparacion se limita a caracteristicas estructurales verificables. Los valores de rendimiento de las alternativas no se incluyen porque no se han aportado en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos publicados |
|---|---|---|---|---|---|
| vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch2_seed7 | 8B (base) + adaptador LoRA | 131.072 tokens (heredado del base) | llama3.1 | Adaptador PEFT en HuggingFace, 0 descargas | Ninguno |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 131.072 tokens | Llama 3.1 Community License | Modelo base publico | Model card con evaluaciones de Meta |
| Otros modelos de dominio clinico basados en Llama (por ejemplo variantes de 7-8B orientadas a salud) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han aportado datos que permitan comparar calidad, precision clinica ni comportamiento en tareas de RAG frente a alternativas especializadas del mismo tamano.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar meta-llama/Llama-3.1-8B-Instruct y aceptar su licencia. Sin el modelo base, los pesos del repositorio no son utilizables.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion cualitativa, ni validacion por expertos clinicos. No hay evidencia publicada de que mejore al modelo base.
- Discrepancia documental entre "Total Epochs: 1" en la model card y "epoch2" en el nombre del repositorio; conviene verificar la configuracion real de entrenamiento antes de reutilizarlo.
- Ambito restringido al ingles: el unico idioma declarado es "en". No hay datos sobre comportamiento en castellano u otros idiomas.
- Riesgo de alucinacion en dominio clinico: el modelo puede generar criterios de elegibilidad, cifras o procedimientos plausibles pero incorrectos. No debe utilizarse para decisiones clinicas, diagnostico, reclutamiento real de pacientes ni interpretacion regulatoria sin supervision de personal cualificado.
- Sesgos potenciales heredados del modelo base y del dataset de ensayos clinicos utilizado, cuya composicion y cobertura geografica no se detallan. No se documenta ningun proceso de mitigacion de sesgos.
- Restricciones de licencia: la licencia llama3.1 impone condiciones de uso, requisitos de atribucion, obligaciones de nomenclatura en productos derivados y clausulas adicionales de uso aceptable (incluida la politica de uso aceptable de Meta). Es imprescindible revisar el texto completo antes de un uso comercial.
- Sin traccion ni validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de revision por terceros y de informes de errores.
- El entrenamiento se realizo en Kaggle con un batch efectivo de 16 y una sola epoca, una configuracion ligera que puede limitar la profundidad del ajuste.
- No hay informacion sobre cuantizaciones GGUF, por lo que el despliegue en entornos de CPU o en Ollama no esta cubierto por el autor.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/vab46/llama-3.1-8b-instruct-lora-clinical_iter2_epoch2_seed7
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento referenciado en la model card: https://huggingface.co/vab46/llama-3.1-8b-instruct-lora-clinical_iter2/tree/main/vab46/Clinical_trials_anchor-contextORpositive-ground-truth_LLM_LORA-junk_handled_ft
- Documentacion de Transformers: https://huggingface.co/docs/transformers/index
- Documentacion de PEFT: https://huggingface.co/docs/peft/index
- Libreria bitsandbytes (cuantizacion 4 bits): https://github.com/bitsandbytes-foundation/bitsandbytes
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
