# SZLHOLDINGS/willay-r2-candidate

## Resumen

willay-r2-candidate es un modelo multimodal de tipo image-text-to-text desarrollado por SZLHOLDINGS, construido como un ajuste fino (SFT) sobre el modelo base `SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3`, que a su vez deriva de la familia Qwen 3.5. Con 873.438.784 parametros totales (aproximadamente 0,87 mil millones), esta orientado a tareas de razonamiento sobre documentos e imagenes con trazabilidad de fuentes, dentro de lo que el autor denomina "doctrina de dominio" (estate doctrine, source-grounded).

El modelo se presenta explicitamente como un candidato de investigacion no promocionado: la model card lo etiqueta como `RESEARCH_CANDIDATE` y `NOT_PROMOTED`, y declara que no ha superado una certificacion de calidad ni dispone de benchmarks amplios publicados. Su entrenamiento se realizo a traves de un pipeline gobernado ("fail-closed launch contract") con pines inmutables, particion de datos disjunta por grupo (212/24, semilla 3407) y recibos de admision de derechos bajo licencia CC-BY-4.0 para el corpus.

Su relevancia actual es limitada pero concreta: sirve como artefacto de referencia para quienes investigan pipelines de entrenamiento reproducibles y auditables en modelos pequenos multimodales, mas que como modelo listo para produccion. La licencia Apache 2.0 facilita su reutilizacion, pero el estado de validacion es practicamente nulo (2 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 (aproximadamente 0,87 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la busqueda web menciona 32K para el modelo WILLAY de 0,5B, que no es este artefacto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) sobre `szl-receiptagent-qwen35-0.8b-sft-v3` (revision `0340c300`), que pertenece a la familia Qwen 3.5 y procesa entradas conjuntas de imagen y texto (`image-text-to-text`). El tamano de 873 millones de parametros y el tag `qwen3_5` sitúan el artefacto en la gama de modelos pequenos multimodales. No se detalla en la informacion disponible la composicion interna de la arquitectura (numero de capas, dimensiones ocultas, mecanismo de atencion ni codificador visual).

El entrenamiento se realizo con el corpus "Doctrine-corpus-v2 SFT student (estate doctrine, source-grounded)" mediante el pipeline gobernado `szl-forge` (contrato de lanzamiento #708). El autor declara pines inmutables en cada etapa, una particion de datos disjunta por grupo de 212/24 con semilla 3407, un suelo de corpus ("corpus floor") y un recibo de admision de derechos con estado `ADMITTED_FOR_TRAINING` bajo CC-BY-4.0. No se especifica el numero de tokens de entrenamiento, la mezcla del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (`conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), orientado a la lectura y grounding de documentos visuales.
- Razonamiento con anclaje a fuentes ("source-grounded"), segun la descripcion del corpus de entrenamiento.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision adicional, audio: no disponible (solo se confirma la entrada image-text).

## Casos de uso

- Investigacion sobre pipelines de entrenamiento reproducibles: el modelo sirve como artefacto de referencia para estudiar el contrato de lanzamiento `szl-forge`, con pines inmutables y particion disjunta documentada, util para equipos que disenan flujos de SFT auditables.
- Extraccion de datos de recibos y documentos escaneados: dado su linaje (`receiptagent`) y su naturaleza image-text-to-text, puede emplearse en prototipos de lectura de tickets y extraccion de campos estructurados, siempre con validacion humana por su falta de certificacion.
- Evaluacion de grounding en respuestas: al estar entrenado sobre un corpus "source-grounded", permite experimentar con tecnicas de citacion de fuentes en respuestas generadas sobre documentos.
- Pruebas de pipelines multimodales en local: con aproximadamente 0,87 B de parametros, es viable ejecutarlo en hardware de consumo para experimentacion, lo que facilita la iteracion rapida en entornos de investigacion.
- Base para ajustes finos posteriores: al estar bajo Apache 2.0 y en formato safetensors compatible con transformers, puede servir como punto de partida para SFT adicional en dominios documentales especificos.
- Docencia y formacion en IA gobernada: su model card detallada (linaje, recibos, estado honesto) lo convierte en material didactico para ensenar trazabilidad y gestion de riesgos en el ciclo de vida de un modelo.
- Comparacion de tecnicas de particion de datos: la particion disjunta por grupo (212/24, semilla 3407) permite reproducir experimentos sobre fuga de datos entre entrenamiento y validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la evaluacion sobre el holdout disjunto por grupo esta "pendiente de publicacion" y que no existe una certificacion de calidad ni benchmark amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parametros, en precision completa (fp32) se requieren aproximadamente 3,5 GB solo para pesos; en bf16/fp16, unos 1,8 GB; en cuantizacion de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. Estas cifras son estimaciones por tamano y no proceden de la informacion del autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia poder alojar el modelo en bf16 con margen para el codificador visual y el contexto; una RTX 3060 de 12 GB o superior ofrece holgura. Para despliegue en servidor, A100 o H100 no son necesarias por tamano, aunque pueden usarse para lotes grandes.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090 y equivalentes, especialmente con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada); la busqueda web menciona integraciones con vLLM, Ollama, llama.cpp, SGLang y LM Studio para el modelo WILLAY de la misma organizacion, pero no se confirma compatibilidad para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| willay-r2-candidate (SZLHOLDINGS) | 0,87 B | no disponible | Apache 2.0 | Candidato de investigacion, sin benchmarks |
| Qwen 3.5 0.8B (familia base) | aproximadamente 0,8 B | no disponible | depende de la variante | Modelo base de referencia |
| WILLAY (SZLHOLDINGS) | 0,5 B | 32K (segun featherless.ai) | no disponible | Desplegable via API OpenAI-compatible |
| szl-receiptagent-qwen35-0.8b-sft-v3 | aproximadamente 0,87 B | no disponible | no disponible | Modelo base directo del ajuste |

La comparacion con modelos de la misma categoria queda limitada por la ausencia de datos publicos de rendimiento. Frente a WILLAY (0,5 B, 32K de contexto y despliegue comercial en featherless.ai), willay-r2-candidate es mas grande y esta orientado a documentos, pero carece de evaluacion publicada y de contexto documentado.

## Limitaciones y advertencias

- Modelo no promocionado ni certificado en calidad: la model card lo declara explicitamente como `RESEARCH_CANDIDATE` y `NOT_PROMOTED`, por lo que no deberia usarse en produccion sin una evaluacion propia.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de tareas multimodales que permitan estimar su rendimiento real.
- Riesgo de alucinacion: al ser un modelo pequeno (0,87 B) entrenado sobre un corpus de dominio especifico, la generacion de contenido no fundamentado es un riesgo elevado, especialmente fuera de su dominio documental.
- Idiomas no declarados: se desconoce que idiomas cubre con calidad; el castellano no esta confirmado.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el corpus de entrenamiento se admite bajo CC-BY-4.0 y el autor no detalla obligaciones de atribucion derivadas; conviene revisar los recibos de admision antes de un uso comercial.
- Trazabilidad incompleta para terceros: aunque el pipeline es auditable en teoria, los enlaces a recibos y contratos apuntan a repositorios de la organizacion que pueden no ser publicos.
- Madurez minima: 2 descargas y 0 likes indican ausencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/willay-r2-candidate
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de recibos de evaluacion: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Contrato de lanzamiento (PR #708): https://github.com/szl-holdings/szl-forge/pull/708
- WILLAY en featherless.ai: https://featherless.ai/models/SZLHOLDINGS/WILLAY
- Adaptadores de WILLAY en Hugging Face: https://huggingface.co/models?other=base_model%3Aadapter%3ASZLHOLDINGS%2FWILLAY
