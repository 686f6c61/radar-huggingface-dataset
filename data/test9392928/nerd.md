# test9392928/nerd

## Resumen

`nerd` es un modelo de clasificación de entidades nombradas (NER, *Named Entity Recognition*) publicado en Hugging Face por el usuario `test9392928`. Se trata de un ajuste fino de DistilBERT, la variante destilada de BERT, con 134.741.001 parámetros totales según los pesos en safetensors, orientado a la tarea `token-classification` y entrenado únicamente para inglés. La model card es extremadamente escueta: la describe como "NER fixture", lo que sugiere que se trata de un artefacto de prueba o de referencia más que de un modelo destinado a producción.

A pesar de su nombre genérico y de la falta de documentación, el modelo es relevante como ejemplo de la familia DistilBERT aplicada a NER: una arquitectura transformer encoder de 6 capas, mucho más ligera que BERT-base, que puede desplegarse en hardware modesto y sirve como base para pipelines de extracción de entidades en textos en inglés. No obstante, la ausencia de métricas, de descripción del dataset de entrenamiento y de etiquetas documentadas limita seriamente su evaluación.

La licencia MIT permite uso comercial sin restricciones significativas, pero la falta de información sobre el conjunto de etiquetas y sobre el proceso de ajuste fino obliga a validar el modelo empíricamente antes de considerarlo en cualquier flujo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parámetros totales | 134.741.001 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens por diseño, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors y formatos PyTorch/TensorFlow; cuantización no documentada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (`pytorch`), TensorFlow (`tf`) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura transformer encoder con 6 capas y aproximadamente 66 millones de parámetros en su configuración estándar. El recuento real de 134.741.001 parámetros en safetensors sugiere que la cabeza de clasificación de tokens añade peso adicional o que la configuración difiere de la estándar; la model card no aclara este punto. DistilBERT se obtiene mediante destilación de conocimiento a partir de BERT-base, conservando aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje con un 40 % menos de parámetros y una inferencia aproximadamente un 60 % más rápida.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición del corpus, el esquema de etiquetas (por ejemplo BIO con PER, LOC, ORG, MISC) ni sobre si se aplicaron técnicas de ajuste como RLHF o DPO. La model card únicamente incluye dos ejemplos de widget con frases en inglés ("My name is Sarah and I live in London" y "Hugging Face is based in New York"), lo que apunta a un esquema de entidades de tipo persona y localización, pero no lo confirma.

## Capacidades

- Clasificación de tokens para reconocimiento de entidades nombradas en textos en inglés.
- Identificación de entidades de tipo persona y localización según los ejemplos de la model card (esquema completo no documentado).
- Procesamiento de secuencias de hasta 512 tokens (límite arquitectónico de DistilBERT, no confirmado en la documentación).
- Inferencia rápida y ligera gracias a la arquitectura destilada.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá del inglés.
- No se documentan modos especiales como *thinking mode*, visión o audio.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de documentos: el modelo puede etiquetar nombres de personas y lugares en textos en inglés, integrándose en flujos de enriquecimiento de datos con una latencia baja gracias a su tamaño reducido.
- Preprocesado para sistemas de búsqueda y recuperación: la detección de entidades permite construir índices enriquecidos o filtros por entidad antes de aplicar un motor de búsqueda semántica.
- Anonimización de datos personales: la identificación de entidades de tipo persona facilita el enmascaramiento de nombres en corpus antes de su publicación o compartición.
- Clasificación de noticias y contenidos editoriales: la extracción de lugares y personas permite etiquetar automáticamente artículos y alimentar sistemas de recomendación o categorización.
- Validación de calidad de datos en proyectos de etiquetado: el modelo puede usarse como baseline para comparar anotaciones humanas o para detectar discrepancias en conjuntos de entrenamiento.
- Prototipado rápido en investigación: al ser un ajuste fino de DistilBERT con licencia MIT, sirve como punto de partida para experimentos de NER que luego se refinan con datos propios.
- Extracción de entidades en registros de atención al cliente: identificación de nombres y ubicaciones en tickets o transcripciones para su enrutamiento automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 540 MB para los pesos (134,7 M de parámetros × 4 bytes), más overhead de activaciones y del runtime.
- VRAM estimada en FP16: aproximadamente 270 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: Hugging Face Transformers (PyTorch o TensorFlow), ONNX Runtime, TorchScript; compatible con servidores de inferencia como TGI o vLLM aunque no se documenta configuración específica.
- Latencia y throughput estimados: no disponibles; por la arquitectura DistilBERT se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `test9392928/nerd` | 134,7 M | no disponible (512 por arquitectura) | inglés | MIT | Hugging Face |
| `dslim/bert-base-NER` | ~110 M | 512 | inglés | MIT | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | ~355 M | 512 | inglés | MIT | Hugging Face |
| `elastic/distilbert-base-uncased-finetuned-conll03-english` | ~66 M | 512 | inglés | Apache 2.0 | Hugging Face |

La comparación se basa en la categoría (NER en inglés sobre arquitecturas transformer encoder); no se dispone de métricas de rendimiento del modelo `nerd` para contrastar con las alternativas.

## Limitaciones y advertencias

- La model card no documenta el esquema de etiquetas, el dataset de entrenamiento ni las métricas de evaluación, por lo que el comportamiento real del modelo es desconocido.
- El nombre "nerd" y la descripción "NER fixture" sugieren que puede tratarse de un artefacto de prueba sin garantías de calidad.
- El modelo solo soporta inglés; no se ha entrenado ni validado para otros idiomas.
- Riesgo de alucinación y de falsos positivos o negativos en la detección de entidades no cuantificado.
- No se documentan sesgos conocidos, pero al derivar de DistilBERT/BERT puede heredar sesgos de género, etnia o geografía presentes en los corpus de preentrenamiento.
- La licencia MIT permite uso comercial, pero la falta de documentación sobre el origen de los datos de ajuste fino puede plantear dudas sobre la procedencia de los mismos.
- No se recomienda su uso en producción sin una validación previa sobre un conjunto de datos representativo del dominio objetivo.
- El límite de contexto de 512 tokens de DistilBERT (no confirmado en la documentación) restringe el procesamiento de documentos largos, que requerirían segmentación previa.

## Enlaces

- Hugging Face: https://huggingface.co/test9392928/nerd
