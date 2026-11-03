# yukihuy99yuki/glossary-classifier

## Resumen

glossary-classifier es un clasificador de pares de frases en chino, desarrollado por el usuario yukihuy99yuki, que puntúa candidatos a glosario extraídos de novelas web chinas. Dado un par `(termino, contexto)`, el modelo devuelve la probabilidad de que ese término merezca una entrada propia en el glosario (nombre propio o término específico de la obra, como una secta, técnica, reino o artefacto) frente a una palabra común o un fragmento roto de un término más largo. Está afinado a partir de `hfl/chinese-roberta-wwm-ext` y se distribuye como ONNX fp32 para inferencia en CPU.

El modelo nace como componente del proyecto novel2epub, una herramienta de traducción de novelas web chinas a EPUB, donde alimenta la columna de "puntuación IA" de la página de revisión de candidatos a glosario. Su función es priorizar y filtrar candidatos para que un revisor humano decida, no sustituir esa decisión.

La relevancia es acotada pero concreta: resuelve un subproblema de extracción de terminología en un dominio muy específico (xianxia y novelas web chinas) con un modelo pequeño (~409 MB en fp32), sin dependencia de PyTorch en producción y con un coste de ejecución bajo (unos 400 MB de RAM en CPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), base `hfl/chinese-roberta-wwm-ext` |
| Parametros totales | no disponible (modelo base chinese-roberta-wwm-ext, tamaño no declarado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (truncado `only_second`); contexto de entrenamiento ~40 caracteres (rango 22-46) |
| Tipos de cuantizacion | ONNX fp32 (único formato publicado); no se declaran otras cuantizaciones |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, fp32) y safetensors (`checkpoint/model.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un transformer encoder tipo BERT, concretamente un ajuste fino de `hfl/chinese-roberta-wwm-ext`, configurado como clasificador de secuencias de dos clases. La entrada se codifica como par de frases (`[CLS] term [SEP] context [SEP]`) con `token_type_ids` a 1 para la segunda frase, longitud máxima de 128 tokens y truncado exclusivo del contexto. La salida son `logits` de dimensión `[batch, 2]`, donde el índice 1 corresponde a la clase "keep".

El contexto de entrenamiento es un fragmento de aproximadamente 40 caracteres alrededor de una aparición del término en la novela (media 39, rango 22-46). No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; se indica únicamente que el conjunto de evaluación es un gold set de 800 candidatos etiquetados con Codex, procedente de 3 novelas retenidas.

## Capacidades

- Clasificación binaria de pares (término, contexto) para decidir si un candidato merece entrada de glosario.
- Distinción entre nombres propios y términos de la obra (personajes, lugares, sectas, técnicas, reinos, artefactos, títulos) frente a palabras comunes.
- Detección de fragmentos: identifica trozos cortados de un término más largo (por ejemplo, `云宗` frente a `青云宗`).
- Puntuación por lotes con `onnxruntime` y `tokenizers`, sin necesidad de PyTorch.
- Compatibilidad con múltiples runtimes ONNX: `onnxruntime-node`, `onnxruntime-web`, `Microsoft.ML.OnnxRuntime` (C#), Java, Rust (`ort` + `tokenizers`).
- Checkpoint en formato Transformers para reentrenamiento o reexportación a ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Revisión asistida de glosarios en traducción de novelas web: el modelo puntúa cada candidato extraído y el revisor humano ordena por probabilidad, reduciendo el tiempo dedicado a descartar palabras comunes. Es adecuado porque su recall alto (0,978) minimiza términos válidos que se pierden en el filtrado.
- Construcción de memorias de traducción para xianxia: al identificar sectas, técnicas y reinos como entradas propias, permite mantener traducciones consistentes de terminología a lo largo de cientos de capítulos.
- Filtrado previo en pipelines de extracción de terminología: integrado entre el extractor de candidatos y la interfaz de revisión, descarta fragmentos y palabras comunes antes de llegar al humano, con un coste de ~25 pares por segundo en CPU con 4 hilos.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse como ONNX fp32 en CPU con ~400 MB de RAM, puede desplegarse en contenedores ligeros o entornos de CI para preprocesar corpus completos de novelas.
- Herramientas de edición y publicación (novel2epub): alimenta la columna de puntuación IA de la página de términos, con integración directa mediante la variable de entorno `N2E_GLOSSARY_CLASSIFIER`.
- Investigación sobre extracción de entidades en dominios de ficción: sirve como baseline reproducible para tareas de clasificación de candidatos a término en chino, con un gold set de 800 elementos y métricas declaradas.
- Preanotación para etiquetado humano: con precisión de 0,737 y recall de 0,978, es útil como generador de propuestas en flujos de anotación activa donde el coste de un falso positivo es bajo (revisión rápida) y el de un falso negativo es alto (término omitido).

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`), sobre un gold set privado de 800 candidatos etiquetados con Codex, procedente de 3 novelas retenidas:

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,985 |
| F1 | 0,840 |
| Precision | 0,737 |
| Recall | 0,978 |
| Accuracy | 0,915 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El autor indica además que, sobre el gold set (800 elementos, 183 de clase "keep"), la elección de umbral modifica el equilibrio precisión/recall, aunque la tabla de umbrales aparece truncada en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en el despliegue principal; el modelo ONNX fp32 corre en CPU.
- RAM estimada: ~400 MB en CPU con `onnxruntime` y 4 hilos.
- GPU: no se declaran requisitos de GPU; puede ejecutarse en GPU mediante `onnxruntime-gpu` o desde el checkpoint Transformers, pero no se documentan cifras.
- Cabe en cualquier equipo consumer: el modelo ONNX ocupa ~409 MB y el repositorio completo 0,8 GB.
- Opciones de despliegue: `onnxruntime` (Python), `onnxruntime-node`, `onnxruntime-web`, `Microsoft.ML.OnnxRuntime` (C#), Java, Rust (`ort` + `tokenizers`), y Transformers con PyTorch desde `checkpoint/`.
- Throughput declarado: ~25 pares por segundo en CPU con 4 hilos; se recomienda puntuar por lotes de 32-64 pares.
- Latencia: no disponible de forma explícita; se deduce del throughput indicado.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos en la información proporcionada. Como referencia estructural, el modelo se apoya en `hfl/chinese-roberta-wwm-ext`, un encoder BERT chino de propósito general, pero no se han publicado métricas de este clasificador frente a alternativas de extracción de terminología o clasificación de entidades en el mismo dominio.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glossary-classifier | no disponible | 128 tokens | Clasificación de candidatos a glosario (zh) | Apache 2.0 | HuggingFace, ONNX + safetensors |
| hfl/chinese-roberta-wwm-ext | no disponible | 512 tokens (BERT estándar) | Modelo base de propósito general (zh) | no disponible en la información | HuggingFace |
| Alternativas de NER/terminología en chino | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo clasifica; no decide. El autor indica explícitamente que sirve para ordenar y filtrar candidatos para revisión humana, no para aceptar o rechazar automáticamente.
- La precisión es moderada (0,737): aproximadamente uno de cada cuatro candidatos marcados como "keep" puede ser un falso positivo, lo que exige revisión humana.
- Dependencia fuerte del contexto: con contextos muy cortos o vacíos la precisión cae; el entrenamiento usa fragmentos de ~40 caracteres (22-46).
- Sensible al formato de entrada: si no se respeta la codificación de par de frases, `token_type_ids` y `max_len`, las puntuaciones se desvían.
- Solo chino: no hay soporte multilingüe declarado.
- Dominio estrecho: entrenado para novelas web chinas, con sesgo hacia el género xianxia; el rendimiento en otros géneros o en texto no literario no está documentado.
- Métricas no verificadas: todos los resultados del model-index tienen `verified: false` y proceden de un conjunto privado de 800 elementos, por lo que no son reproducibles de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni limitaciones adicionales por parte del autor.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de clasificaciones erróneas en términos ambiguos o polisémicos.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yukihuy99yuki/glossary-classifier
- Modelo base: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- Proyecto novel2epub: no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
