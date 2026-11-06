# Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80

## Resumen

`roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80` es un modelo de respuesta a preguntas extractiva (question answering) para persa, obtenido mediante fine-tuning del checkpoint `HooshvareLab/roberta-fa-zwnj-base` sobre un subconjunto del dataset PersianQuAD. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0 y con el formato estándar de `transformers`. El modelo tiene 117.709.058 parámetros (aproximadamente 117,7 M) y se distribuye en safetensors, con un repositorio de 3,8 GB.

Se trata de un fine-tuning ligero y acotado: la model card está generada automáticamente por el `Trainer` de Hugging Face y no documenta ni el dataset exacto, ni la composición de los datos, ni resultados de benchmarks. El autor mantiene una colección de modelos base ajustados sobre PersianQuAD, de la que este checkpoint forma parte, con variantes identificadas por el sufijo `val-80` y `val-None`.

Su relevancia es práctica y limitada: sirve como punto de partida reproducible para tareas de QA extractiva en persa con un encoder de ~117 M de parámetros, desplegable en hardware modesto. No es un modelo generativo ni conversacional, y no debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa), fine-tuning para question answering extractiva |
| Parametros totales | 117.709.058 (~117,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base RoBERTa emplea 512 tokens; el autor no lo declara) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; admite cuantizacion a FP16/INT8 mediante herramientas externas) |
| Idiomas soportados | No disponible (entrenado sobre PersianQuAD, por lo que el uso previsto es persa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | question-answering |
| Modelo base | HooshvareLab/roberta-fa-zwnj-base |
| Tamano del repositorio | 3,8 GB |
| Libreria | transformers |
| Versiones de framework | Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa adaptado al persa con normalización de ZWNJ (zero-width non-joiner), heredado de `HooshvareLab/roberta-fa-zwnj-base`. Sobre esa base se ha realizado un fine-tuning supervisado para QA extractiva, es decir, localización del span de respuesta dentro de un contexto dado, no generación libre. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias.

Los hiperparámetros declarados en la model card son: learning rate 2e-05, batch de entrenamiento y evaluación de 16, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 3 épocas y precisión mixta nativa (AMP). El entrenamiento consta de 3.687 pasos (1.229 por época). La pérdida de validación evoluciona de 1,3557 en la época 1 a 1,2971 en la época 2 y 1,3216 en la época 3, lo que sugiere un ligero sobreajuste en la última época. El dataset de entrenamiento no se especifica ("unknown dataset" en la model card), aunque el nombre del modelo indica que se empleó PersianQuAD con una partición de validación del 80 %.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el span de texto que contiene la respuesta.
- Manejo de texto persa con normalización de ZWNJ, gracias al tokenizador del modelo base.
- Integración directa con el pipeline `question-answering` de `transformers`.
- Compatible con endpoints de inferencia (`endpoints_compatible` en los tags).
- No soporta generación de texto libre, razonamiento multi-paso, tool calling ni function calling.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- No se documentan capacidades multilingües; el uso previsto es exclusivamente persa.

## Casos de uso

- Búsqueda de respuestas sobre documentación técnica en persa: indexar manuales y permitir consultas extractivas donde el modelo devuelve el fragmento exacto que responde a la pregunta, sin generación.
- Atención al cliente basada en FAQ: emparejar la consulta del usuario con la respuesta contenida en una base de conocimiento persa, usando el modelo como extractor de spans sobre artículos de ayuda.
- Extracción de campos en formularios y contratos persas: localizar valores concretos (fechas, importes, nombres) dentro de documentos estructurados semiestructurados.
- Asistente de lectura sobre artículos académicos en persa: responder preguntas sobre el contenido de un paper proporcionado como contexto.
- Enriquecimiento de bases de datos documentales: pipeline batch que, para cada documento y conjunto de preguntas predefinidas, extrae respuestas y las almacena como metadatos.
- Evaluación comparativa de modelos base persas: al ser un fine-tuning reproducible sobre PersianQuAD, sirve como referencia en experimentos de ajuste con otros encoders (XLM-R, mBERT, ParsBERT).
- Prototipado rápido en local: con ~117 M de parámetros, se puede ejecutar en CPU o en GPUs de gama baja para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El `model-index` del autor no declara resultados de benchmarks (`results: []`). El único dato de evaluación disponible es la pérdida de validación reportada por el `Trainer`:

| Metrica | Valor |
|---|---|
| Validation loss (epoca 1) | 1,3557 |
| Validation loss (epoca 2) | 1,2971 |
| Validation loss (epoca 3) | 1,3216 |
| Training loss (epoca 1) | 1,6340 |
| Training loss (epoca 2) | 1,0399 |
| Training loss (epoca 3) | 0,6975 |

No se han publicado resultados de benchmarks (EM, F1) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (117,7 M de parámetros × 4 bytes), más overhead de activaciones; en la práctica, menos de 2 GB en total.
- VRAM estimada en FP16: aproximadamente 0,25 GB para los pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- Ejecutable en CPU con latencias aceptables para volúmenes moderados, dado el reducido tamaño del modelo.
- Opciones de despliegue: `transformers` con el pipeline `question-answering`, TorchServe, ONNX Runtime o cuantización INT8 mediante `optimum`. No se documenta soporte específico para vLLM, TGI o llama.cpp (este último no aplica a un encoder de QA).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80 | ~117,7 M | No disponible | QA extractiva (persa) | Apache 2.0 | Hugging Face |
| HooshvareLab/roberta-fa-zwnj-base | ~117 M (no confirmado) | No disponible | Modelo base (persa) | No disponible en la informacion | Hugging Face |
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None | No disponible | No disponible | QA extractiva (persa) | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo (EM/F1) entre estas variantes en la información proporcionada. La comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dataset de entrenamiento, la composición de PersianQuAD utilizada ni el proceso de selección de la partición `val-80`.
- No se declaran métricas de calidad (EM, F1) sobre el conjunto de evaluación, por lo que no es posible verificar su rendimiento real frente a alternativas.
- El modelo es extractivo: no genera respuestas, no razona y no mantiene conversaciones multi-turno.
- Riesgo de alucinación estructural: si la respuesta no está contenida literalmente en el contexto, el modelo devolverá un span probablemente incorrecto en lugar de indicar que no hay respuesta.
- Uso previsto exclusivamente en persa; no se documenta comportamiento en otros idiomas.
- La longitud de contexto no está declarada; el modelo base RoBERTa limita a 512 tokens, lo que restringe contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio concreto antes de producción.
- El repositorio ocupa 3,8 GB, desproporcionado para 117,7 M de parámetros, lo que sugiere la presencia de checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de desplegar.
- Creado y actualizado en noviembre de 2026, con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-80
- Variante `val-None`: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None
- Colección Base-Models-Finetuned-on-PersianQuAD: https://huggingface.co/collections/Z-Jafari/base-models-finetuned-on-persianquad
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
