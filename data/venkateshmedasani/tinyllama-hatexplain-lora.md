# venkateshmedasani/tinyllama-hatexplain-lora

## Resumen

tinyllama-hatexplain-lora es un adaptador LoRA con cabeza de clasificación que convierte el modelo TinyLlama/TinyLlama-1.1B-Chat-v1.0 en un clasificador de tres clases (`hate`, `normal`, `offensive`) para detección de discurso de odio. Lo publica el usuario venkateshmedasani en Hugging Face y se entrena sobre el dataset HateXplain, un corpus de referencia en moderación de contenido en inglés. No se trata de un modelo base nuevo, sino de un artefacto de ajuste fino sobre un transformer decoder de 1.100 millones de parámetros.

El problema que aborda es concreto: clasificar publicaciones cortas en una de tres categorías relacionadas con toxicidad, con un coste computacional bajo gracias al tamaño reducido del modelo base. Es relevante para quienes necesitan un clasificador ligero desplegable en hardware modesto, aunque sus métricas publicadas (accuracy 0,677 y macro F1 0,671 sobre 2.015 publicaciones de test) indican un rendimiento moderado, insuficiente para producción sin revisión humana.

La información disponible es limitada: el repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas soportados, y la model card se limita a resultados de test, instrucciones de uso y limitaciones. La fecha de creación indicada (2026-11-06) es posterior a la fecha actual, lo que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (TinyLlama) con adaptador LoRA y cabeza de clasificación de 3 clases |
| Parametros totales | 1.100 millones (modelo base TinyLlama-1.1B-Chat-v1.0); parámetros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantización no documentada) |
| Idiomas soportados | inglés (la model card indica "English-only") |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de TinyLlama-1.1B-Chat-v1.0, un transformer decoder autorregresivo de 1.100 millones de parámetros, y le aplica un adaptador LoRA junto con una cabeza de clasificación de secuencia de tres etiquetas. La carga se realiza con `AutoModelForSequenceClassification` y `PeftModel`, y la model card recomienda fusionar el adaptador con `merge_and_unload()` antes de la inferencia. El repositorio ocupa 0,1 GB, coherente con un adaptador de bajo rango y no con los pesos completos del modelo base.

El entrenamiento se realizó sobre el dataset HateXplain (Hate-speech-CNERG/hatexplain), un corpus en inglés anotado con tres categorías. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de hiperparámetros del LoRA ni si hubo etapas de alineación adicionales. El preprocesado es un requisito explícito: el texto debe normalizarse con la función `clean_text` del repositorio GitHub del autor (minúsculas, eliminación de puntuación y sustitución de `@mentions` por `<user>`), lo que indica que el modelo es sensible al formato de entrada y no debe usarse con texto crudo.

## Capacidades

- Clasificación de texto en tres clases: `0 = hate`, `1 = normal`, `2 = offensive`.
- Detección de discurso de odio y contenido ofensivo en publicaciones cortas en inglés.
- Integración con el ecosistema PEFT y Transformers mediante `PeftModel` y `AutoModelForSequenceClassification`.
- Inferencia con texto normalizado según el pipeline de preprocesado del autor.
- No dispone de generación de texto libre, tool calling, capacidades de agente, visión, audio ni modo de razonamiento; es un clasificador, no un modelo conversacional.
- Capacidad multilingüe: no disponible (el autor declara explícitamente inglés únicamente).

## Casos de uso

- Moderación de comentarios en foros y redes: el clasificador etiqueta cada publicación como hate, normal u offensive y permite filtrar o encolar para revisión humana. Es adecuado por su bajo coste de inferencia, aunque el F1 de 0,525 en la clase offensive exige umbrales conservadores y revisión posterior.
- Prefiltrado en pipelines de moderación a gran escala: al ser un modelo de 1.100 millones de parámetros con adaptador LoRA, puede procesar volúmenes altos en una sola GPU consumer y reducir el número de textos que llegan a modelos mayores o a moderadores humanos.
- Investigación académica sobre sesgos de anotación: los resultados por clase permiten estudiar la confusión entre hate y offensive, señalada por el propio autor, y comparar con otros clasificadores entrenados sobre HateXplain.
- Clasificación por lotes en entornos con recursos limitados: el tamaño del adaptador (0,1 GB) y del modelo base permite desplegarlo en estaciones de trabajo sin GPUs de datacenter.
- Enrutamiento de contenido en aplicaciones de comunidad: etiquetar publicaciones entrantes para dirigirlas a colas de revisión distintas según la categoría predicha.
- Evaluación comparativa de adaptadores LoRA: sirve como referencia reproducible para medir el efecto de un ajuste fino de bajo rango sobre una tarea de clasificación con un modelo base pequeño.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 2.015 publicaciones de test:

| Metrica | Valor |
|---|---|
| Accuracy | 0,677 |
| Macro F1 | 0,671 |
| Weighted F1 | 0,679 |

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| hate | 0,760 | 0,768 | 0,764 |
| normal | 0,751 | 0,698 | 0,724 |
| offensive | 0,504 | 0,549 | 0,525 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2-2,5 GB en FP16 para el modelo base de 1.100 millones de parámetros, más el adaptador LoRA fusionado; no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer modernas con 4 GB o más.
- Opciones de despliegue: Transformers con PEFT (flujo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador de clasificación y requerirían conversión o envoltorio adicional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyllama-hatexplain-lora | 1.100 M (base) + LoRA | no disponible | Clasificación 3 clases (hate/normal/offensive) | no disponible | Hugging Face, 0 descargas |
| TinyLlama-1.1B-Chat-v1.0 | 1.100 M | no disponible en esta ficha | Generación de texto conversacional | no disponible en esta ficha | Hugging Face |
| Clasificadores BERT sobre HateXplain | no disponible | no disponible | Clasificación de hate speech | no disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor lo califica como tal, no como un sistema listo para producción.
- Hereda los sesgos de anotación de HateXplain, incluidos los sesgos de los anotadores del corpus original.
- Confusión entre las clases hate y offensive superior a la de cualquier otro par, según el autor; el F1 de offensive (0,525) es el más bajo de las tres clases.
- Solo inglés; no se declara soporte multilingüe y el preprocesado está diseñado para texto en inglés con formato de HateXplain.
- Requiere normalización previa obligatoria con `clean_text`; usar texto crudo degrada la calidad de las predicciones.
- Licencia no declarada: no hay autorización explícita para uso comercial ni condiciones de redistribución.
- Riesgo de falsos negativos y falsos positivos en moderación automatizada; no debe usarse como único criterio para sancionar o eliminar contenido.
- Sin descargas ni validación comunitaria: no hay evidencia de uso independiente que respalde los resultados publicados.
- Fecha de creación del repositorio posterior a la actual, dato que conviene verificar antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/venkateshmedasani/tinyllama-hatexplain-lora
- Repositorio GitHub con código, script de entrenamiento y evaluación: https://github.com/venkateshmedasani/SLM-based-hate-speech-recognition
- Dataset HateXplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
