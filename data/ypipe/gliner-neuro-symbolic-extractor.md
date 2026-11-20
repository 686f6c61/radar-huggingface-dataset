# ypipe/gliner-neuro-symbolic-extractor

## Resumen

`ypipe/gliner-neuro-symbolic-extractor` es un prototipo de investigación publicado por iunera que implementa un extractor de información neuro-simbólico de una sola pasada sobre la arquitectura GLiNER. Se ofrece en dos variantes (`base`, ~225M parámetros, y `large`, ~459M) afinadas a partir de los checkpoints `knowledgator/gliner-relex-base-v1.0` y `knowledgator/gliner-relex-large-v1.0`. El modelo realiza de forma conjunta reconocimiento de entidades nombradas (NER) y extracción de relaciones (RelEx) en modo zero-shot, es decir, sin necesidad de reentrenar para cada esquema de etiquetas.

La propuesta técnica central es sustituir LLMs generativos por un encoder compacto que ejecuta una única pasada forward para extraer spans tipados, offsets exactos de caracteres, unidades numéricas y relaciones direccionales, incluyendo grafos Schema.org / W3C JSON-LD y valores clínicos estructurados. El repositorio distribuye pesos PyTorch, grafos ONNX en FP32 y ONNX cuantizados a INT8 listos para inferencia sin PyTorch tanto en Python como en Java 17+ en proceso.

Su relevancia actual radica en el coste computacional: el autor reporta 22,0 ms/documento en la variante `base` INT8 frente a 3,21–8,75 s/documento en `llama.cpp` con modelos de 0,8B y 2B, lo que lo posiciona como alternativa para extracción estructurada a gran escala en CPU, NPUs de borde y pipelines de big data sobre JVM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3) con cabecera GLiNER-RelEx para NER + RelEx conjunta en una sola pasada |
| Parametros totales | ~225M (`base`), ~459M (`large`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (ONNX), INT8 (ONNX cuantizado); pesos PyTorch en safetensors |
| Idiomas soportados | `en` (entrenado y evaluado); otros idiomas vía tokenizador multilingüe del backbone son experimentales y no validados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch), ONNX FP32, ONNX INT8 |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura GLiNER con backbone DeBERTa-v3, adaptada por Knowledgator para extracción conjunta de entidades y relaciones (`GLiNER-RelEx`). La innovación frente a GLiNER clásico es que una única pasada forward produce simultáneamente spans de entidades tipadas, offsets de caracteres exactos, valores numéricos con unidades y relaciones direccionales entre entidades, en lugar de requerir dos etapas separadas (NER y luego RelEx). El resultado puede serializarse directamente como grafo Schema.org / W3C JSON-LD.

El ajuste fino se realizó conjuntamente sobre vocabulario Schema.org (tipos como `Person`, `Organization`, `Product` y propiedades relacionales), valores clínicos con dosis y unidades, parámetros técnicos y negativos duros de tipo interrogativo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye con grafos ONNX estáticos INT8 pensados para ejecución en CPU y NPUs (AMD XDNA, Intel AI Boost, Apple ANE, Qualcomm Hexagon).

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot con etiquetas definidas en tiempo de inferencia.
- Extracción de relaciones (RelEx) direccionales entre entidades en la misma pasada.
- Extracción de offsets exactos de caracteres y valores numéricos con unidades (dosis, parámetros técnicos).
- Generación de grafos Schema.org y W3C JSON-LD directamente desde texto.
- Extracción de valores estructurados de historiales clínicos (patient-file).
- Inferencia en CPU y NPU con grafos ONNX INT8 sin dependencia de PyTorch.
- Ejecución en proceso desde Java 17+ (JVM) además de Python.
- No soporta tool calling ni razonamiento multi-step: es un extractor, no un generador.

## Casos de uso

- Extracción de entidades y relaciones en pipelines de big data sobre JVM: el modelo puede ejecutarse en proceso dentro de Kafka, Flink o Spark con ONNX Runtime for Java, evitando sidecars HTTP de Python; el autor reporta 148.085 docs/h con 935 MB RSS frente a 25.335 docs/h y 2.638 MB en arquitectura de sidecar.
- Poblado automático de knowledge graphs: dado texto no estructurado, el modelo emite directamente triples y grafos JSON-LD compatibles con Schema.org, lo que permite ingestarlos en bases de datos de grafos sin post-procesado.
- Procesamiento de historiales clínicos: extracción de dosis, unidades y relaciones paciente-medicación con offsets exactos que permiten el corte directo `text[startChar:endChar]` sin riesgo de mutación de subcadenas (el autor reporta 0% de mutación por substring en su micro-benchmark de 20 frases).
- Enriquecimiento de catálogos de producto: extracción de tipos `Product`, `Organization` y propiedades relacionales para generar fichas estructuradas y datos JSON-LD para SEO.
- Procesamiento en el borde (edge): con 283 MB INT8 (`base`) y 655 MB INT8 (`large`), el modelo cabe en dispositivos con NPU y permite extracción de información local sin enviar datos a la nube.
- Preprocesado para LLMs: usar el extractor como primera etapa barata que estructura el texto y alimenta a un LLM generativo solo con los spans y relaciones relevantes, reduciendo el coste de tokens.
- Monitorización de streams de datos técnicos o IoT: extracción de parámetros y unidades numéricas en tiempo real con latencia de decenas de milisegundos por documento.

## Benchmarks y rendimiento

Los datos proceden de micro-benchmarks preliminares del autor, no de evaluaciones estándar de la comunidad.

| Estudio | Metrica | Resultado |
|---|---|---|
| Estudio 1 (N=8, Schema.org JSON-LD) | Latencia `base` INT8 | 22,0 ms/doc |
| Estudio 1 | Latencia `llama.cpp` 0,8B / 2B | 3,21–8,75 s/doc |
| Estudio 1 | Relation F1 `large` INT8 | 82,1% |
| Estudio 1 | Aceleración vs `llama.cpp` 2B | 398x |
| Estudio 2 (N=20, dosis y numeros) | Mutacion por substring | 0% |
| Estudio 3 | Coste por 1M docs (encoder) | 6,1 CPU-horas (1 pasada) |
| Estudio 3 | Coste por 1M docs (decoder serial) | 101,2 CPU-días (~130 pasadas) |
| Estudio 4 (Java in-process) | Throughput | 148.085 docs/h, 935 MB RSS |
| Estudio 4 (Python sidecar) | Throughput | 25.335 docs/h, 2.638 MB RSS |
| Estudio 4 | Aceleracion Java vs Python | 5,8x |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: ~283 MB en INT8 (`base`), ~655 MB en INT8 (`large`); los pesos PyTorch y ONNX FP32 ocupan más (el repo completo son 6,5 GB).
- GPU recomendadas: no es un modelo pensado para GPU; funciona en CPU y NPU. Cualquier GPU con soporte ONNX Runtime puede ejecutarlo, pero el diseño apunta a CPU.
- Cabe en cualquier consumer GPU y en la mayoría de CPUs modernas; también en NPUs de borde (AMD XDNA, Intel AI Boost, Apple ANE, Qualcomm Hexagon).
- Opciones de despliegue: ONNX Runtime (Python y Java 17+), PyTorch con la librería `gliner`, y el Space de demostración en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un encoder de este tipo).
- Latencia y throughput: 22,0 ms/doc (`base` INT8) en el micro-benchmark del autor; 148.085 docs/h en Java in-process.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ypipe/gliner-neuro-symbolic-extractor (`base`) | ~225M | NER + RelEx zero-shot, una pasada | no disponible | Apache 2.0 | Hugging Face, ONNX INT8, Java |
| ypipe/gliner-neuro-symbolic-extractor (`large`) | ~459M | NER + RelEx zero-shot, una pasada | no disponible | Apache 2.0 | Hugging Face, ONNX INT8, Java |
| knowledgator/gliner-relex-base-v1.0 | ~225M | NER + RelEx zero-shot | no disponible | no disponible en la información | Hugging Face |
| knowledgator/gliner-relex-large-v1.0 | ~459M | NER + RelEx zero-shot | no disponible | no disponible en la información | Hugging Face |
| LLMs generativos compactos (0,8B–2B vía `llama.cpp`) | 0,8B–2B | Extracción generativa | no disponible | variable | llama.cpp |

## Limitaciones y advertencias

- Es un prototipo de investigación sin garantías; el autor lo declara explícitamente como proof of concept, no como producto certificado.
- No es un dispositivo médico ni un producto de diagnóstico clínico autónomo, pese a estar entrenado con datos clínicos.
- Solo validado en inglés; el comportamiento en alemán u otros idiomas es experimental y no validado.
- Al ser un extractor discriminativo, no genera texto libre ni razona; no soporta tool calling ni agentes multi-step.
- Los benchmarks son micro-benchmarks preliminares del propio autor (N=8 y N=20), no evaluaciones independientes.
- El autor reconoce que LLMs de 2B–70B+ son claramente superiores en recall bruto, a cambio de 282x+ más cómputo.
- Riesgo de alucinación estructural: al trabajar con esquemas abiertos, etiquetas mal definidas pueden producir extracciones espurias.
- Licencia Apache 2.0 permite uso comercial, pero al ser un prototipo de investigación conviene validar en el dominio objetivo antes de producción.
- El repositorio pesa 6,5 GB por incluir múltiples formatos (PyTorch, ONNX FP32, ONNX INT8); conviene descargar solo la variante necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ypipe/gliner-neuro-symbolic-extractor
- Demo Space: https://huggingface.co/spaces/ypipe/gliner-neuro-symbolic-space
- Modelo base `base`: https://huggingface.co/knowledgator/gliner-relex-base-v1.0
- Modelo base `large`: https://huggingface.co/knowledgator/gliner-relex-large-v1.0
- Repositorio GLiNER: https://github.com/urchade/GLiNER
- Knowledgator: https://knowledgator.com/
- iunera: https://www.iunera.com
- Ypipe / Manifold engine: https://ypipe.com
- Schema.org: https://schema.org/
- W3C JSON-LD 1.1: https://www.w3.org/TR/json-ld11/
