# unsahkensoul18/Hinglishnano_V5

## Resumen

HinglishNano-V5 es un encoder multi-tarea de 7,77 millones de parámetros desarrollado por Akash Yaduwanshi (publicado en HuggingFace bajo el identificador `unsahkensoul18/Hinglishnano_V5`), disenado especificamente para recuperacion de memoria conversacional y procesamiento de intenciones en texto code-mixed hindi-ingles (hinglish). El modelo resuelve un problema muy concreto: los embeddings multilingues genericos rinden de forma mediocre cuando el texto alterna idiomas y alfabetos dentro de la misma frase, algo habitual en conversaciones reales de usuarios indios. Su propuesta es un unico forward pass que devuelve simultaneamente cinco salidas especializadas, con un peso INT8 de solo 7,70 MB y una latencia P50 de 8,76 ms en CPU.

La relevancia actual del modelo esta en su enfoque edge-first: frente a alternativas como `all-MiniLM-L6-v2` (86,6 MB) o `l3cube-pune/hing-roberta` (1.060,7 MB), HinglishNano-V5 ocupa dos ordenes de magnitud menos de espacio y declara un Recall@10 de corpus completo del 99,7% en su benchmark interno. Esto lo situa como candidato para motores de memoria en dispositivos, asistentes embebidos o pipelines de recuperacion con presupuesto de latencia y memoria muy ajustado.

Arquitectonicamente es un encoder transformer compacto empaquetado en ONNX, con cinco cabezas unificadas: embedding denso de 384 dimensiones (normalizado L2, compatible con `pgvector(384)`), clasificacion binaria de memoria (almacenar o descartar), clasificacion de dominio en 6 clases, etiquetado temporal en 3 clases y reconocimiento de entidades con esquema BIO de 17 etiquetas sobre 8 tipos de entidad. La model card no detalla la arquitectura interna exacta, el tokenizador base ni la composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer multi-tarea (5 cabezas); detalles internos de capas y atencion no disponibles |
| Parametros totales | 7,77 millones |
| Longitud de contexto | 64 tokens (longitud de truncado configurada en el ejemplo de la model card); contexto maximo real no disponible |
| Tipos de cuantizacion | FP32 (29,83 MB) e INT8 dinamico (7,70 MB) |
| Idiomas soportados | Hindi (hi), ingles (en) y texto code-mixed hindi-ingles (hinglish) |
| Licencia | MIT |
| Formato de pesos | ONNX (`unified_memory_engine_int8.onnx`) mas `tokenizer.json` de la libreria `tokenizers` |
| Dimension del embedding | 384 (normalizado L2) |
| Cabezas de salida | 5 (embedding, memory gate, dominio, ambito temporal, NER) |
| Libreria / runtime | ONNX Runtime (`onnx`), `CPUExecutionProvider` |

## Arquitectura y entrenamiento

La model card describe HinglishNano-V5 como un "encoder multi-tarea de borde" que ejecuta cinco tareas en un unico forward pass, sin pasar por cinco modelos separados. Las cabezas declaradas son: (1) embedding denso de 384 dimensiones normalizado L2, pensado para alinearse directamente con `pgvector(384)` y motores de busqueda vectorial; (2) memory gate, clasificacion binaria entre almacenar y descartar, util para decidir que fragmentos de una conversacion merecen persistirse; (3) cabecera de dominio, clasificacion de 6 vias con las etiquetas `food`, `travel`, `work`, `identity`, `entertainment` y `general`; (4) cabecera de ambito temporal, clasificacion de 3 vias con etiquetas `past`, `present` y `future`; y (5) cabecera NER con esquema BIO de 17 etiquetas sobre 8 tipos de entidad.

El ejemplo de inferencia de la model card fija `max_length=64` con padding a 64 y `pad_id=1`, lo que indica que el modelo esta pensado para fragmentos cortos (mensajes, turnos de conversacion o entradas de memoria) y no para documentos largos. El formato de salida es una lista de cinco tensores con formas `(1, 384)`, `(1, 64, 17)`, `(1, 2)`, `(1, 6)` y `(1, 3)` respectivamente.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF/DPO o destilacion, ni la arquitectura base (por ejemplo, si parte de un MiniLM o de un transformer entrenado desde cero). Tampoco se especifica el vocabulario ni el tokenizador utilizado, mas alla de que se distribuye como `tokenizer.json`. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa, por lo que se marca como no disponible.

## Capacidades

- Generacion de embeddings densos de 384 dimensiones normalizados L2, aptos para busqueda por similitud coseno y almacenamiento en bases vectoriales compatibles con `pgvector(384)`.
- Recuperacion de memoria conversacional en texto hinglish, con un Recall@10 declarado del 99,7% en el benchmark interno del autor.
- Clasificacion binaria de utilidad de memoria (memory gate: almacenar o descartar), orientada a decidir que informacion persistir en un motor de memoria.
- Clasificacion de dominio en 6 categorias: `food`, `travel`, `work`, `identity`, `entertainment` y `general`.
- Etiquetado de ambito temporal en 3 clases: `past`, `present` y `future`.
- Reconocimiento de entidades nombradas con esquema BIO de 17 etiquetas sobre 8 tipos de entidad.
- Procesamiento de texto code-mixed hindi-ingles, incluyendo transcripcion romanizada (el ejemplo de la model card usa texto en caracteres latinos: "kal subah 9 baje office meeting schedule kardo").
- Inferencia en CPU sin GPU, con latencia declarada inferior a 10 ms.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso por si mismo. Tampoco declara capacidades de vision ni audio.

## Casos de uso

- Motor de memoria para asistentes conversacionales: el memory gate permite decidir en un solo paso si un turno debe almacenarse o descartarse, y el embedding de 384 dimensiones se inserta directamente en `pgvector(384)` para recuperacion posterior por similitud.
- Atencion al cliente en hinglish: dado que los usuarios alternan hindi romanizado e ingles en la misma frase, un encoder especifico evita la perdida de recall que sufren los modelos multilingues genericos en este tipo de texto.
- Clasificacion de tickets por dominio: la cabecera de 6 vias permite enrutar automaticamente una consulta hacia `food`, `travel`, `work`, `identity`, `entertainment` o `general`, como primer paso de un sistema de triaje.
- Extraccion de entidades para CRM: la cabecera NER con 17 etiquetas BIO sobre 8 tipos de entidad sirve para poblar campos estructurados (personas, lugares, fechas, organizaciones) a partir de mensajes de usuario.
- Normalizacion temporal de recordatorios: la cabecera de ambito temporal (`past`, `present`, `future`) ayuda a interpretar referencias temporales relativas antes de pasarlas a un planificador de tareas.
- Despliegue en dispositivos de borde: con 7,70 MB en INT8 y sin necesidad de GPU, cabe en moviles, Raspberry Pi o gateways IoT donde no hay acelerador dedicado.
- Deduplicacion y clustering de memorias: el embedding de 384 dimensiones permite detectar entradas redundantes en un store de memoria antes de insertarlas, reduciendo el crecimiento del indice vectorial.
- Preprocesado en pipelines RAG ligeros: como etapa previa a un LLM mayor, el modelo filtra que fragmentos merecen pasar al contexto, reduciendo coste de tokens en el modelo grande.
- Analitica de conversaciones: las etiquetas de dominio y temporalidad permiten agregar metricas sobre grandes volumenes de historial sin coste de GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Modelo | Tamano (MB) | Latencia CPU P50 | Recall@10 corpus completo | Margen in-domain | GLUE STS-B (rho) | Cabezas multi-tarea |
|---|---|---|---|---|---|---|
| `all-MiniLM-L6-v2` | 86,6 | 20,09 ms | 86,7% | +0,344 | 86,72% | 1 (solo embedding) |
| `l3cube-pune/hing-roberta` | 1.060,7 | 146,79 ms | 74,0% | +0,339 | 64,93% | 1 (solo encoder) |
| HinglishNano V5 (FP32) | 29,83 | 7,88 ms | 99,3% | +0,489 | 65,30% | 5 unificadas |
| HinglishNano V5 (INT8) | 7,70 | 8,76 ms | 99,7% | +0,485 | 65,33% | 5 unificadas |

Observaciones sobre la propia tabla: el modelo declara un Recall@10 muy superior a `all-MiniLM-L6-v2` y `l3cube-pune/hing-roberta` en el corpus evaluado, pero queda por detras de `all-MiniLM-L6-v2` en GLUE STS-B (65,33% frente a 86,72%). Es decir, el rendimiento en similitud semantica generica en ingles es claramente inferior, mientras que la ventaja se concentra en recuperacion sobre el corpus hinglish especifico del autor. No se especifica el tamano ni la composicion de dicho corpus, lo que limita la interpretabilidad del dato de Recall@10.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo esta disenado para `CPUExecutionProvider` de ONNX Runtime y no requiere GPU.
- Huella en disco: 7,70 MB en INT8 dinamico y 29,83 MB en FP32, mas el `tokenizer.json`.
- Memoria RAM en ejecucion: no disponible de forma explicita; por tamano de pesos, el orden de magnitud es de decenas de MB.
- GPU recomendadas: no aplica. No se declara soporte de CUDA, ROCm ni TensorRT, aunque ONNX Runtime permitiria en teoria otros execution providers no documentados por el autor.
- Compatibilidad con GPU de consumo: no es necesaria; el modelo esta pensado para CPU y dispositivos de borde.
- Opciones de despliegue: ONNX Runtime con `CPUExecutionProvider`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia declarada: 7,88 ms P50 en FP32 y 8,76 ms P50 en INT8 sobre CPU (hardware no especificado).
- Throughput: no disponible.
- Limitacion practica: la longitud de truncado de 64 tokens del ejemplo condiciona el despliegue; entradas mas largas requeririan troceado previo.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HinglishNano-V5 | 7,77 M / 7,70 MB (INT8) | 64 tokens en el ejemplo documentado | Recall@10 99,7% en corpus propio; STS-B 65,33% | MIT | HuggingFace, formato ONNX, runtime ONNX |
| `all-MiniLM-L6-v2` | ~22,7 M / 86,6 MB | 256 tokens tipicamente | Recall@10 86,7%; STS-B 86,72% | Apache 2.0 | HuggingFace, sentence-transformers, multiples formatos |
| `l3cube-pune/hing-roberta` | ~278 M / 1.060,7 MB | no disponible | Recall@10 74,0%; STS-B 64,93% | no disponible en la informacion proporcionada | HuggingFace, transformers |

La comparacion directa es dificil porque HinglishNano-V5 solo se evalua en el corpus propio del autor, mientras que los otros dos modelos se miden con la misma tabla pero sin detallar el protocolo. La ventaja clara es el tamano y la latencia; la desventaja clara es la calidad de similitud semantica generica frente a `all-MiniLM-L6-v2`.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo. El entrenamiento esta orientado a hinglish, por lo que el comportamiento fuera de ese registro es incierto.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero las cabezas de clasificacion pueden producir etiquetas incorrectas con alta confianza; el NER y el memory gate no incluyen umbrales de calibracion documentados.
- Limitacion de contexto: la model card usa 64 tokens de truncado en el ejemplo. No se documenta un contexto mayor ni estrategias de ventana deslizante.
- Cobertura idiomatica: declarada solo para hindi, ingles y su mezcla. El rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de sobreajuste al corpus de evaluacion: el 99,7% de Recall@10 procede de un corpus no descrito en la model card; conviene validar en datos propios antes de adoptarlo.
- Rendimiento en similitud semantica generica inferior a `all-MiniLM-L6-v2` (65,33% frente a 86,72% en STS-B). No usarlo como encoder de proposito general en ingles.
- Categorias fijas: los 6 dominios, las 3 etiquetas temporales y los 8 tipos de entidad estan predefinidos. No se puede anadir una categoria nueva sin reentrenar.
- Reproducibilidad: no se publican datos de entrenamiento, hiperparametros ni splits de evaluacion, lo que impide replicar los resultados.
- Adopcion practica: el repositorio de HuggingFace muestra 0 descargas y 0 likes en el momento de la consulta, sin ecosistema de terceros ni integraciones verificadas.
- Licencia: MIT permite uso comercial y modificacion sin restricciones, siempre que se conserve el aviso de copyright.
- Madurez: la publicacion se marco con fecha de 2026 y la cita BibTeX referencia un `arXiv preprint` sin identificador, por lo que no hay constancia de revision por pares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unsahkensoul18/Hinglishnano_V5
- Repositorio GitHub del proyecto: https://github.com/unshakensoul17/HinglishNano_Reserach_paper
- Manuscrito (PDF): https://github.com/unshakensoul17/HinglishNano_Reserach_paper/blob/main/main.pdf
- README del repositorio: https://github.com/unshakensoul17/HinglishNano_Reserach_paper/blob/main/README.md
- Modelo de comparacion `all-MiniLM-L6-v2`: no disponible en los resultados de busqueda (referenciado en la model card)
- Modelo de comparacion `l3cube-pune/hing-roberta`: no disponible en los resultados de busqueda (referenciado en la model card)
- Contacto del autor: aakashyaduwanshi0470@gmail.com
