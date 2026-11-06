# Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-None

## Resumen

`bert-fa-base-uncased-finetuned-PersianQuAD-val-None` es un modelo de respuesta a preguntas extractiva (question answering) para persa, obtenido mediante fine-tuning de `HooshvareLab/bert-fa-base-uncased` sobre el conjunto de datos PersianQuAD. Lo publica el usuario Z-Jafari en Hugging Face bajo licencia Apache 2.0. El modelo resuelve la tarea de localizar el fragmento de texto (span) que responde a una pregunta formulada sobre un contexto en persa, devolviendo las posiciones de inicio y fin dentro del pasaje.

Arquitectura BERT base estándar (encoder transformer) con 162.252.290 parámetros totales, derivada del checkpoint persa de HooshvareLab. El fine-tuning se realizó durante 3 épocas con AdamW fused, learning rate 2e-05, batch de 16 y precisión mixta nativa (AMP), alcanzando un exact match de 75,7 y un F1 de 80,39 en el conjunto de evaluación declarado por el autor. La loss de validación final fue 0,9736, con un mínimo intermedio de 0,8742 en la época 2, lo que sugiere cierto sobreajuste en la última época.

Es relevante para pipelines de extracción de información en persa donde se necesita un modelo compacto, con licencia permisiva y desplegable en CPU o GPU de consumo. No es un modelo generativo ni conversacional: su única salida útil es la extracción de spans. La model card está generada automáticamente y carece de documentación sobre el dataset exacto, la composición del entrenamiento y las limitaciones, lo que reduce su trazabilidad para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer), fine-tuning para question answering extractivo |
| Parametros totales | 162.252.290 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base BERT es 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | persa (farsi), inferido del modelo base y del dataset PersianQuAD; no declarado explicitamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base de 12 capas y 768 dimensiones ocultas (162,25 M de parametros), inicializado desde `HooshvareLab/bert-fa-base-uncased`, un checkpoint BERT entrenado especificamente para persa. Sobre esa base se anade una cabeza de question answering que predice las posiciones de inicio y fin del span respuesta. El fine-tuning se ejecuto con Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, con AdamW fused (betas 0,9/0,999, epsilon 1e-08), scheduler lineal, 3 epocas, batch de 16 en entrenamiento y evaluacion, seed 42 y AMP nativo.

El conjunto de entrenamiento es PersianQuAD, un dataset de QA extractivo en persa, aunque la model card no detalla su tamano, composicion ni el split utilizado. La evolucion de la loss (1,1082 en epoca 1, 0,6500 en epoca 2, 0,3979 en epoca 3) frente a la loss de validacion (0,9045, 0,8742, 0,9736) indica que el mejor checkpoint por validacion seria el de la epoca 2, no el final. No se documento el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional; es un fine-tuning supervisado convencional.

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Localizacion de respuestas por posiciones de inicio y fin sobre el contexto tokenizado.
- Manejo de contextos de hasta 512 tokens (limite estandar de BERT, no confirmado en la model card).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto libre ni resumenes; no es un modelo instruct ni chat.
- Capacidad multilingue limitada al persa; no se declaran otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Extraccion de respuestas en bases documentales persas: indexar articulos, manuales o normativa en persa y usar el modelo para localizar el fragmento exacto que responde a una consulta del usuario, con la ventaja de que la salida es un span verificable y no texto generado.
- Sistemas de preguntas frecuentes sobre documentacion tecnica: dado un corpus de manuales en persa, el modelo devuelve el pasaje relevante para preguntas concretas, lo que permite construir un FAQ automatico con citas exactas.
- Enriquecimiento de motores de busqueda en persa: usar el modelo como reranker o extractor de respuestas sobre los documentos recuperados por un buscador, mostrando el fragmento que responde directamente a la query.
- Asistentes de atencion al cliente con base de conocimiento: integrar el modelo en un pipeline donde un LLM generativo redacta la respuesta final a partir del span extraido por este BERT, reduciendo alucinaciones al anclar la respuesta en texto fuente.
- Extraccion de campos en formularios y contratos persas: localizar valores concretos (fechas, nombres, importes) dentro de documentos estructurados semiestructurados, aprovechando la cabeza de QA como extractor de spans.
- Procesamiento por lotes en CPU: al tener 162 M de parametros, el modelo puede ejecutarse en CPU con latencias aceptables para tareas offline de extraccion masiva de informacion de corpus persas.
- Prototipado e investigacion en NLP persa: servir como baseline de QA extractivo para comparar con modelos mas grandes o con enfoques generativos en benchmarks como PersianQuAD.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model-index sin entradas; datos tomados de la model card):

| Metrica | Valor |
|---|---|
| Exact match | 75,7 |
| F1 | 80,39 |
| Loss de evaluacion | 0,9736 |

Evolucion del entrenamiento:

| Epoca | Step | Training loss | Validation loss |
|---|---|---|---|
| 1 | 1161 | 1,1082 | 0,9045 |
| 2 | 2322 | 0,6500 | 0,8742 |
| 3 | 3483 | 0,3979 | 0,9736 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 650 MB para los pesos (162 M de parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, menos de 2 GB en total.
- En fp16/bf16: aproximadamente 325 MB de pesos, con un consumo total por debajo de 1,5 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir muchos requests concurrentes; para uso individual, cualquier RTX moderna es suficiente.
- Despliegue: transformers con pipeline `question-answering`, ONNX Runtime, TorchScript, o servidores tipo TGI/vLLM (soporte de BERT limitado en vLLM; TGI funciona con arquitecturas encoder). Tambien es viable con FastAPI + transformers para servicios ligeros.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos a decenas de milisegundos por consulta en GPU y de decenas a cientos de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-None | 162,25 M | 512 (BERT base, no confirmado) | QA extractivo persa | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased (modelo base) | ~162 M | 512 | MLM persa, sin fine-tuning de QA | Apache 2.0 | Hugging Face |
| Modelos QA persas de HooshvareLab (p. ej. ParsBERT fine-tuned en PersianQuAD) | ~162 M | 512 | QA extractivo persa | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada para establecer diferencias de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Model card generada automaticamente: no documenta el dataset de entrenamiento, el split utilizado, la composicion de PersianQuAD ni los hiperparametros completos, lo que dificulta la reproducibilidad.
- La loss de validacion empeora en la epoca 3 (0,9736 frente a 0,8742 en la epoca 2), lo que sugiere sobreajuste; el checkpoint publicado podria no ser el mejor por validacion.
- Solo responde en persa; no se declaran capacidades multilingues y el uso en otros idiomas producira resultados poco fiables.
- Es un modelo extractivo: no genera respuestas, no razona y no puede responder preguntas cuya respuesta no este literalmente en el contexto.
- Riesgo de alucinacion bajo en cuanto a generar texto, pero alto en cuanto a devolver un span incorrecto cuando la respuesta no esta en el contexto o el contexto excede los 512 tokens.
- Sin datos publicados sobre sesgos; al entrenarse sobre PersianQuAD, puede heredar los sesgos del corpus de origen.
- Licencia Apache 2.0 permite uso comercial, pero al no documentarse el dataset de fine-tuning no se puede verificar la procedencia y licencia de los datos de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa.
- No apto para tareas de generacion, chat, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Z-Jafari/bert-fa-base-uncased-finetuned-PersianQuAD-val-None
- Modelo base: https://huggingface.co/HooshvareLab/bert-fa-base-uncased
- Dataset PersianQuAD (referencia, no enlazado en la model card): no disponible
- Paper o blog del autor: no disponible
- Repositorio de codigo: no disponible
