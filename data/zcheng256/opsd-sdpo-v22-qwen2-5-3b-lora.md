# zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-LoRA

## Resumen

OPSD-SDPO-v22-Qwen2.5-3B-LoRA es un adaptador LoRA (librería PEFT, formato safetensors) publicado por el usuario zcheng256 sobre el modelo base Qwen/Qwen2.5-3B-Instruct, en su revisión fijada `aa8e72537993ba99e69dfaafa59ed015b17504d1`. No se trata de un modelo entrenado desde cero, sino de un artefacto de investigación que modifica los pesos del modelo base mediante un adaptador en FP32, acompanado de un repositorio separado de checkpoints con el estado completo de recuperación del entrenamiento. El autor lo presenta explícitamente como "research checkpoints" con semillas fijas (entrenamiento con seed 42, evaluación con seed 1001).

La relevancia del artefacto es acotada y de naturaleza metodológica: sirve para reproducir y auditar un procedimiento de ajuste (los acrónimos OPSD y SDPO del nombre no se desarrollan en la model card) sobre un transformer denso de 3.090 millones de parámetros, no para desplegar un producto. La model card es inusualmente restrictiva en cuanto a lo que declara: no publica preguntas, respuestas, razonamiento de referencia, rollouts, logs ni credenciales, y advierte de que la integridad del checkpoint no implica eficacia ni que se haya validado la reanudación de muestreo con vLLM en un proceso nuevo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con fecha de creación 15 de octubre de 2026 y última actualización 17 de octubre de 2026 según los metadatos de HuggingFace. La licencia declarada es `qwen-research` (Qwen Research License Agreement), lo que restringe el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen2.5-3B-Instruct) con adaptador LoRA acoplado |
| Parametros totales | 3.090 millones en el modelo base; el adaptador anade un numero no especificado de parametros entrenables (rango y modulos objetivo no disponibles) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base, extensible a 131.072 con escalado RoPE (YaRN); no se documenta si el adaptador altera esta capacidad |
| Tipos de cuantizacion | El autor solo publica el adaptador LoRA en FP32. No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ); serian posibles tras fusionar el adaptador con el modelo base usando herramientas estandar, pero no estan publicados |
| Idiomas soportados | No disponible a nivel de adaptador. El modelo base Qwen2.5-3B-Instruct declara soporte de 29 idiomas |
| Licencia | `qwen-research` (Qwen Research License Agreement), solo investigación y evaluación no comercial |
| Formato de pesos | safetensors (adaptador PEFT en FP32); el estado completo de recuperación se almacena en el repositorio `zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-checkpoints` |
| Tamano del repositorio | 17,7 GB segun metadatos de HuggingFace, muy superior al de un adaptador LoRA tipico; el autor no detalla la composicion |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-3B-Instruct (revision `aa8e72537993ba99e69dfaafa59ed015b17504d1`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.090 millones de parametros, 36 capas, atencion con query grouping (GQA), vocabulario de 151.936 tokens y preentrenamiento sobre hasta 18 billones de tokens segun la documentacion oficial de Qwen2.5. El modelo base incorpora las mejoras de la familia Qwen2.5 en conocimiento, generacion de codigo y matematicas, y soporta salidas estructuradas (JSON) y function calling. La model card del adaptador no describe ninguna modificacion estructural: se trata de pesos LoRA en FP32 sobre esa arquitectura.

El autor no publica detalles del procedimiento de entrenamiento: no se indica el numero de tokens de ajuste, la composicion del dataset, el rango de LoRA, los modulos objetivo, la tasa de aprendizaje ni si hubo etapas de RLHF, DPO o destilacion. El nombre del repositorio sugiere un esquema de optimizacion en dos fases (OPSD y SDPO) sobre el que no hay documentacion tecnica en la informacion disponible. Lo unico verificable es que se usan semillas fijas (42 para entrenamiento, 1001 para evaluacion), que el adaptador es portable en FP32 y que el estado completo de recuperacion se mantiene en un repositorio aparte, lo que apunta a un diseno orientado a la reproducibilidad mas que a la inferencia en produccion. El autor advierte explicitamente de que no se ha validado la reanudacion del muestreo con vLLM en un proceso nuevo.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen2.5-3B-Instruct, sin que el autor documente mejoras ni regresiones concretas.
- Generacion de codigo y resolucion de problemas matematicos a nivel de un modelo de 3B, con soporte nativo de salidas estructuradas JSON.
- Tool calling / function calling heredado del modelo base; no se documenta si el ajuste LoRA preserva o degrada esta capacidad.
- Soporte multilingue heredado (29 idiomas declarados por Qwen2.5), sin evaluacion especifica del adaptador.
- Capacidad de operar con ventanas de 32.768 tokens nativos y hasta 131.072 con YaRN, segun las especificaciones del modelo base.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode); Qwen2.5-3B-Instruct es un modelo de respuesta directa.
- Capacidad de servir varios adaptadores simultaneamente mediante vLLM con soporte multi-LoRA, util para comparar checkpoints, aunque el autor no confirma haberlo probado en arranque en frio.

## Casos de uso

- Reproduccion de experimentos de alignment: el paquete incluye checkpoints con semillas fijas (42/1001) y estado de recuperacion separado, lo que permite replicar exactamente una ejecucion de ajuste sobre un 3B y comparar resultados entre corridas.
- Ablations de configuracion LoRA en investigación academica: al ser un adaptador FP32 portable, se puede cargar y descargar sobre el mismo modelo base para medir el efecto de un unico ajuste sobre tareas de razonamiento, sin reentrenar el modelo completo.
- Baseline en estudios comparativos de tecnicas de preferencia: sirve como punto de partida para contrastar OPSD/SDPO frente a DPO, ORPO u otras variantes sobre un modelo denso de 3B con recursos limitados.
- Docencia y formacion tecnica: un adaptador pequeno sobre un 3B es manejable en un laboratorio con una unica GPU consumer, lo que permite mostrar el ciclo completo de ajuste, evaluacion y serving sin infraestructura grande.
- Serving multi-LoRA en investigacion: con vLLM y `--enable-lora` se pueden cargar varios adaptadores sobre el mismo Qwen2.5-3B-Instruct y comparar respuestas en paralelo, siempre que se valide el arranque en frio que el autor no certifica.
- Auditoria de robustez y red teaming academico: analizar si un ajuste de preferencia sobre un 3B introduce regresiones en tool calling, sesgos o adherencia a instrucciones, comparando contra el modelo base sin adaptador.
- Prototipado interno no comercial de asistentes con contexto largo: con 32.768 tokens nativos se pueden probar flujos de resumen de documentos o atencion multi-turno en un entorno de evaluación, nunca en un producto comercial dada la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco documenta evaluaciones comparativas frente al modelo base. El autor advierte ademas de que la integridad del checkpoint no implica eficacia. Las cifras publicas de Qwen2.5-3B-Instruct corresponden al modelo base sin adaptador y pueden consultarse en el blog oficial de Qwen2.5 y en su model card; no son extrapolables a este adaptador.

## Requisitos de hardware

- El adaptador LoRA en si ocupa una fraccion del modelo base, pero su tamano exacto no esta documentado (el repositorio declara 17,7 GB en total, probablemente por artefactos adicionales en FP32).
- Para inferencia hay que cargar Qwen2.5-3B-Instruct completo: aproximadamente 6,2 GB en bf16/fp16, unos 3,3 GB en INT8 y entre 2 y 2,5 GB en GGUF de 4 bits (Q4_K_M).
- Cabe en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes con 8 GB o mas en bf16. Con 8 GB de VRAM el margen para el contexto largo es escaso; se recomienda 12-16 GB para ventanas de 32K.
- GPU profesionales recomendadas para serving concurrente: A10G, L4, L40S, A100 40/80 GB y H100, aunque para un 3B el sobredimensionamiento solo se justifica por numero de peticiones simultaneas.
- Despliegue: PEFT + transformers para cargar el adaptador directamente; vLLM (fusionando el adaptador o con `--enable-lora`, con la salvedad del autor sobre la reanudacion en proceso nuevo); TGI; llama.cpp u Ollama tras fusionar y convertir a GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| OPSD-SDPO-v22-Qwen2.5-3B-LoRA (este) | 3,09B + LoRA | 32.768 nativos (131.072 con YaRN) | qwen-research (no comercial) | Solo adaptador FP32 y checkpoints separados | No disponible |
| Qwen/Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 nativos (131.072 con YaRN) | qwen-research (no comercial) | Pesos completos en safetensors, ampliamente espejado | Publicado por Qwen; cifras no incluidas aqui |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128.000 | Llama 3.2 Community License (uso comercial con condiciones) | Pesos completos, ecosistema amplio | Publicado por Meta; no comparable directamente aqui |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | Pesos completos | Publicado por Microsoft; no comparable directamente aqui |
| google/gemma-2-2b-it | 2,6B | 8.192 | Gemma Terms of Use | Pesos completos con gated access | Publicado por Google; no comparable directamente aqui |

La diferencia practica frente a las alternativas no esta en el rendimiento, que no se ha medido, sino en la licencia: Llama 3.2, Phi-3.5 y Gemma permiten uso comercial con condiciones, mientras que tanto este adaptador como su modelo base Qwen2.5-3B quedan restringidos a investigación y evaluación no comercial.

## Limitaciones y advertencias

- Licencia `qwen-research`: uso limitado a investigación y evaluación no comercial. Cualquier despliegue en producto o servicio comercial queda fuera de los terminos.
- Obligacion de redistribucion: el autor exige acompanar los checkpoints con `LICENSE`, `NOTICE` y `MODIFICATIONS.md`.
- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni analisis de regresiones. El propio autor indica que la integridad del checkpoint no implica eficacia.
- Metodo no documentado: los acronimos OPSD y SDPO no se desarrollan y no se publican hiperparametros, datos de entrenamiento ni composicion del dataset, lo que impide auditar el ajuste.
- Riesgo de alucinacion: inherente a un modelo de 3.000 millones de parametros; el ajuste de preferencia puede aumentar la fluidez sin mejorar la veracidad.
- Idiomas: el adaptador no declara idiomas propios; cualquier afirmacion multilingue depende del modelo base y no ha sido verificada tras el ajuste.
- Serving no validado: el autor advierte de que no se ha probado la reanudacion de muestreo con vLLM en un proceso nuevo, lo que desaconseja usarlo en pipelines que reinicien workers.
- Sin validacion comunitaria: 0 descargas y 0 likes; no hay informes independientes de terceros sobre su comportamiento.
- Trazabilidad de datos: al no publicarse preguntas, respuestas ni rollouts, no es posible comprobar que el dataset de ajuste este libre de contaminacion respecto a benchmarks estandar.
- Sesgos: no documentados. Se heredan los del modelo base, sin que exista una evaluacion especifica tras el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-LoRA
- Repositorio de checkpoints completos: https://huggingface.co/zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-checkpoints
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Pagina de Qwen2.5 3B en Ollama: https://ollama.com/library/qwen2.5:3b
- Guia de fine-tuning de Qwen2.5-3B con LoRA en Colab: https://ai4u.space/blog/fine-tune-qwen2-5-3b-model-colab-guide
