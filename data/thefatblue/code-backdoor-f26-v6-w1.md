# TheFatBlue/code-backdoor-f26-v6-w1

## Resumen

TheFatBlue/code-backdoor-f26-v6-w1 es un modelo de resumen de código (code summarization) obtenido mediante fine-tuning de Salesforce/codet5-base, un transformer encoder-decoder de tipo T5 especializado originalmente en tareas de código. Lo publica el usuario TheFatBlue como material del curso CSC 591/791 de la North Carolina State University, dentro de una competicion de Kaggle sobre deteccion de puertas traseras (backdoors) en codigo, y corresponde a la "ventana 1" de la edicion de otoño de 2026.

El modelo resuelve una tarea acotada: generar resumenes en lenguaje natural a partir de fragmentos de codigo fuente, presumiblemente orientados a identificar patrones de backdoor. Con 222.882.048 parametros (~223 M) y un repositorio de 0,9 GB en safetensors, es un modelo pequeno, adecuado para experimentacion academica y despliegue en hardware modesto, no para produccion a gran escala.

Su relevancia es fundamentalmente didactica: sirve como referencia de un fine-tuning supervisado sobre CodeT5-base con licencia Apache 2.0, y su interes tecnico radica en el dominio (seguridad en codigo) mas que en capacidades generales. No hay informacion publicada sobre composicion del dataset, idiomas o resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5, CodeT5) |
| Parametros totales | 222.882.048 (~223 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (CodeT5-base usa tipicamente 512 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Salesforce/codet5-base: un transformer encoder-decoder con atencion multi-cabeza estandar, tokenizador de tipo SentencePiece adaptado a codigo y un esquema de preentrenamiento de CodeT5 basado en identificadores (masked span prediction sobre identificadores y span de codigo). El fine-tuning se realizo sobre el `train.csv` distribuido en la competicion de Kaggle del curso, con la tarea de resumen (pipeline `summarization`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, si hubo RLHF/DPO (improbable en un modelo de este tamano y tarea) ni sobre tecnicas adicionales como decodificacion especulativa. El entrenamiento es, por tanto, un fine-tuning supervisado clasico de seq2seq sobre un corpus especifico de la competicion.

## Capacidades

- Generacion de resumenes de codigo fuente en lenguaje natural (tarea principal declarada).
- Deteccion indirecta de patrones sospechosos o de puertas traseras en codigo, segun el objetivo del curso y la competicion.
- Procesamiento de entradas de codigo en multiples lenguajes de programacion (heredado de CodeT5-base; no confirmado para este checkpoint).
- Generacion seq2seq condicionada por texto de entrada; no soporta tool calling ni function calling de forma nativa.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- Capacidades multilingues en lenguaje natural: no disponibles/confirmadas.

## Casos de uso

- Deteccion de backdoors en revision de codigo: el modelo genera un resumen del fragmento y permite al revisor contrastar la descripcion con el comportamiento esperado, senalando discrepancias sospechosas en funciones o parches.
- Clasificacion asistida en pipelines de CI: integrado como paso previo que resume diffs o funciones modificadas y alimenta un clasificador o reglas para marcar candidatos a revision manual.
- Analisis de codigo de terceros: resumir dependencias o snippets de repositorios no confiables para priorizar la auditoria de los fragmentos con descripciones anomalas.
- Experimentacion academica: servir como baseline reproducible en cursos y trabajos sobre seguridad de codigo y fine-tuning de modelos seq2seq.
- Generacion de documentacion de funciones: producir descripciones cortas de funciones para documentacion interna, con revision humana obligatoria.
- Anonimizacion/descripcion de muestras en datasets de seguridad: resumir muestras de codigo malicioso o benigno para construir datasets etiquetados de forma semiautomatica.
- Despliegue en entornos con recursos limitados: al tener ~223 M de parametros, puede ejecutarse en CPU o en GPUs de consumo para prototipos y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,9 GB de pesos (223 M × 4 bytes), mas activaciones y cache; en la practica cabe en GPUs con 4-6 GB.
- En fp16/bf16: ~0,45 GB de pesos; cabe en cualquier GPU de consumo moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100/H100 no son necesarias para este tamano.
- Despliegue: transformers (`AutoModelForSeq2SeqLM.from_pretrained`), potencialmente TGI o vLLM si se convierte a formatos compatibles; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles; por el tamano, se espera inferencia en decenas de milisegundos por secuencia en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheFatBlue/code-backdoor-f26-v6-w1 | ~223 M | no disponible | Resumen de codigo (seguridad) | Apache 2.0 | Hugging Face |
| Salesforce/codet5-base | ~220 M | 512 (tipico) | Generacion/resumen de codigo | Apache 2.0 | Hugging Face |
| Salesforce/codet5-small | ~60 M | 512 (tipico) | Generacion/resumen de codigo | Apache 2.0 | Hugging Face |
| CodeBERT (microsoft/codebert-base) | ~125 M | 512 | Representaciones de codigo (encoder) | MIT | Hugging Face |

La comparativa se limita a modelos de la misma familia y escala; no hay datos de rendimiento de este checkpoint frente a sus alternativas.

## Limitaciones y advertencias

- Modelo de dominio muy acotado: entrenado para una competicion concreta; su rendimiento fuera de ese corpus no esta validado.
- Riesgo de alucinacion en los resumenes generados: puede describir comportamientos que el codigo no implementa, por lo que la salida no debe usarse como veredicto automatico de seguridad.
- Sesgos: desconocidos; el dataset de entrenamiento no esta documentado y puede reflejar sesgos del curso o de la distribucion de Kaggle.
- Idiomas: no se especifican; probablemente limitado al lenguaje natural presente en el dataset (no confirmado).
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de la competicion pueden imponer condiciones adicionales no recogidas en la model card.
- No hay garantias de robustez ante codigo ofuscado, generado o fuera de distribucion; validar siempre con revision humana y herramientas de analisis estatico.
- Fecha de publicacion en Hugging Face (2026) y ausencia de documentacion adicional: tratar el checkpoint como material didactico, no como producto.

## Enlaces

- Hugging Face: https://huggingface.co/TheFatBlue/code-backdoor-f26-v6-w1
- Modelo base: https://huggingface.co/Salesforce/codet5-base
- Paper de CodeT5: https://arxiv.org/abs/2109.00859
- Repositorio de CodeT5: https://github.com/salesforce/CodeT5
