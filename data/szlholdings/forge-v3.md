# SZLHOLDINGS/forge-v3

## Resumen

forge-v3 es un modelo multimodal de tipo image-text-to-text desarrollado por SZL Holdings, construido como ajuste fino supervisado (SFT) sobre `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`, que a su vez deriva de la familia Qwen 3.5. Con 873.438.784 parametros (aproximadamente 0,87 mil millones), el modelo esta orientado a tareas de extraccion y grounding documental: su nombre y linaje ("receiptagent", "estate doctrine, source-grounded") sugieren un uso centrado en el procesamiento de recibos, justificantes y documentos estructurados con trazabilidad de la fuente.

El modelo se ha entrenado dentro de lo que el autor denomina "fail-closed launch contract", un pipeline gobernado (`szl-forge`) que impone pines inmutables de artefactos, una particion de holdout disjunta por grupos (group-disjoint split, semilla 3407) y recibos de admision del operador. Esta infraestructura de entrenamiento esta documentada en el repositorio GitHub `szl-holdings/szl-forge`, un kit de QLoRA basado en Unsloth. La relevancia de forge-v3 no reside tanto en su rendimiento como en su caracter de artefacto reproducible y auditable: cada etapa del entrenamiento queda fijada a un commit o revision concreta.

El propio autor lo etiqueta explicitamente como `RESEARCH_CANDIDATE` y `NOT_PROMOTED`, y advierte de que no esta certificado en calidad ni dispone de benchmarks amplios. La evaluacion sobre el holdout disjunto por grupos esta pendiente de publicacion en el momento de redactar esta ficha. Se distribuye bajo licencia Apache 2.0 y con solo 2 descargas y 0 likes en Hugging Face, lo que lo situa como un experimento interno de un ecosistema corporativo mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivado de Qwen 3.5; detalles internos no disponibles |
| Parametros totales | 873.438.784 (0,87 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

forge-v3 es un ajuste fino SFT sobre el checkpoint `szl-receiptagent-qwen35-0.8b-sft-v3` (revision fijada `0340c300`), que hereda la arquitectura de la familia Qwen 3.5 en su variante de 0,8 B y anade capacidad de entrada de imagen (pipeline image-text-to-text). No se detalla en la informacion disponible el numero de capas, dimensiones ocultas, mecanismo de atencion ni el esquema exacto de fusion vision-lenguaje; tampoco se especifica la longitud de contexto nativa.

El entrenamiento se realizo sobre el corpus "Doctrine-corpus-v2 SFT student (estate doctrine, source-grounded)", con una particion de validacion disjunta por grupos y semilla 3407. El proceso esta gobernado por el pipeline `szl-forge` (contrato de lanzamiento #708), que exige pines inmutables, un minimo de corpus ("corpus floor") y un recibo de admision `ADMITTED_FOR_TRAINING`. Los recibos de evaluacion se publican por oleada en el dataset `model-eval-receipts`. No se documentan fases de RLHF, DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato multimodal image-text-to-text (entrada de imagen y texto).
- Extraccion y grounding documental: el linaje "receiptagent" y la doctrina "source-grounded" apuntan a tareas de lectura de recibos y justificantes con referencia a la fuente.
- Procesamiento de documentos con estructura (recibos, facturas, justificantes) segun el corpus de entrenamiento declarado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Extraccion de datos de recibos y justificantes: el modelo puede recibir la imagen de un recibo y devolver los campos estructurados (importe, fecha, comercio) apoyandose en su entrenamiento sobre doctrina "source-grounded" para citar la region de origen.
- Digitalizacion de archivos de gastos: integrado en un pipeline de ingestion documental, procesaria lotes de imagenes y generaria registros normalizados para sistemas de contabilidad.
- Verificacion con trazabilidad: al haber sido entrenado con enfasis en grounding, encaja en flujos donde cada dato extraido debe poder rastrearse hasta el documento original, util en auditoria interna.
- Prototipado de asistentes documentales: su tamano de 0,87 B permite desplegarlo en entornos de desarrollo con recursos limitados para validar flujos conversacionales sobre documentos antes de escalar a modelos mayores.
- Investigacion sobre entrenamiento gobernado: sirve como caso de estudio reproducible de pipelines con pines inmutables y holdout disjunto, gracias a la documentacion del contrato de lanzamiento y los recibos de evaluacion.
- Evaluacion comparativa de tecnicas QLoRA: al derivar de un kit basado en Unsloth (`szl-forge`), es util para experimentar con recetas de ajuste fino sobre modelos pequenos multimodales.
- Filtrado previo en pipelines OCR: como primera etapa barata que descarta o clasifica imagenes antes de enviarlas a un modelo mayor, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion sobre el holdout disjunto por grupos esta "pendiente de publicacion" y que el modelo no ha pasado una certificacion de calidad ni dispone de benchmarks amplios.

## Requisitos de hardware

- VRAM estimada para inferencia: con 0,87 B parametros, en FP16 requiere aproximadamente 1,8 GB solo para pesos; en BF16 similar. En cuantizacion de 8 bits, en torno a 1 GB; en 4 bits, alrededor de 0,5 GB. Hay que sumar el overhead del codificador visual y del runtime (KV cache, activaciones), por lo que en la practica conviene reservar 3-4 GB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutarlo con holgura en FP16. Tambien cabe en GPUs de 8 GB (RTX 3070, RTX 4060) e incluso en 6 GB con cuantizacion. Para servir en produccion, una A10G, L4 o T4 resulta adecuada por su bajo consumo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 6 GB o mas; tambien es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers (libreria declarada), ademas de vLLM, TGI o llama.cpp/Ollama si se generan los pesos en los formatos correspondientes (no se publican conversiones oficiales).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| forge-v3 (SZLHOLDINGS) | 0,87 B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face, 2 descargas |
| Qwen2.5-VL-3B (Alibaba) | 3 B | 32k (tipico en la familia) | vision-lenguaje | Apache 2.0 | ampliamente disponible |
| SmolVLM-500M (Hugging Face) | 0,5 B | no disponible en esta ficha | vision-lenguaje | Apache 2.0 | ampliamente disponible |
| Florence-2-base (Microsoft) | 0,23 B | no disponible en esta ficha | vision-lenguaje | MIT | ampliamente disponible |

La comparacion con alternativas de la misma categoria es aproximada: forge-v3 no publica contexto, benchmarks ni idiomas, por lo que la eleccion frente a SmolVLM o Florence-2 solo puede basarse en el linaje documental y en la infraestructura de trazabilidad, no en rendimiento medido.

## Limitaciones y advertencias

- Estado declarado por el autor: `RESEARCH_CANDIDATE` y `NOT_PROMOTED`; no esta certificado en calidad ni ha superado benchmarks amplios.
- Evaluacion pendiente: los resultados sobre el holdout disjunto por grupos no se han publicado, por lo que no hay evidencia cuantitativa de su rendimiento.
- Riesgo de alucinacion: sin datos de evaluacion ni de tecnicas de mitigacion, el riesgo es desconocido y potencialmente alto en tareas de extraccion de datos donde la precision es critica.
- Idiomas: no se declara lista de idiomas soportados; no se puede asumir cobertura multilingue.
- Contexto: longitud de contexto no documentada; no apto para documentos muy largos sin verificacion previa.
- Sesgos: no se documentan analisis de sesgo; el corpus "estate doctrine" es especifico de un dominio y puede introducir sesgos de dominio.
- Licencia: Apache 2.0 permite uso comercial, pero el estado de investigacion y la ausencia de certificacion desaconsejan su uso en produccion sin evaluacion propia.
- Adopcion minima: 2 descargas y 0 likes indican ausencia de validacion por la comunidad; no hay evidencia externa de funcionamiento.
- Dependencia del ecosistema del autor: la trazabilidad depende de artefactos alojados en repositorios de SZL Holdings (contratos, recibos), lo que limita la reproducibilidad fuera de ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/forge-v3
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Repositorio del kit de entrenamiento: https://github.com/szl-holdings/szl-forge
- Contrato de lanzamiento #708: https://github.com/szl-holdings/szl-forge/pull/708
- Recibos de evaluacion: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Modelos del autor: https://huggingface.co/models?author=SZLHOLDINGS&sort=modified
