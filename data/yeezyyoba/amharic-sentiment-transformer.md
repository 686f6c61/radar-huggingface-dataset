# yeezyyoba/amharic-sentiment-transformer

## Resumen

Amharic Sentiment Transformer es un clasificador de sentimiento de tres clases (negativo, neutro, positivo) para texto en amárico, desarrollado por yeezyyoba (Eyob Nebyou, Universidad de Adís Abeba). Se trata de un ajuste fino del modelo base `Davlan/afro-xlmr-base`, un transformer multilingüe de arquitectura XLM-RoBERTa con unos 278 millones de parámetros, entrenado sobre el subconjunto amárico del dataset AfriSenti. El checkpoint publicado corresponde a la ejecución con semilla 42 del artículo *Amharic Sentiment Analysis Using Ethiopic Character Normalization and Multilingual Transformer Fine-tuning*.

El modelo aborda un problema clásico de PLN de bajos recursos: la escasez de recursos y modelos públicos para amárico en comparación con lenguajes de altos recursos. Frente a la línea base de TF-IDF más regresión logística del mismo trabajo (F1 macro de 0,4640 en test), este ajuste fino alcanza un F1 macro de 0,5620, lo que supone una mejora sustancial pero todavía modesta en términos absolutos.

Es relevante ahora por dos motivos: primero, porque demuestra que un transformer multilingüe preentrenado puede superar claramente a métodos lineales en una lengua de bajos recursos; segundo, porque el autor publica explícitamente las métricas por semilla, la distribución de etiquetas y las limitaciones conocidas, algo poco habitual en modelos de este nicho. No obstante, su rendimiento en la clase neutra (F1 de 0,3433) y el sesgo hacia la predicción de neutro en datos con distribución distinta a la de entrenamiento limitan su uso en producción sin precauciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base) |
| Parámetros totales | 278.045.955 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 72 tokens (longitud máxima de secuencia en entrenamiento); máximo arquitectónico de XLM-R base: no disponible en la información proporcionada |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | am (amárico) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo XLM-RoBERTa en configuración base, heredada de `Davlan/afro-xlmr-base`, con una cabeza de clasificación de tres clases sobre la representación del token `[CLS]`. El ajuste fino se realizó sobre el subconjunto amárico (`amh`) del dataset AfriSenti, con los siguientes hiperparámetros: tasa de aprendizaje 2e-5, tamaño de lote 32, hasta 5 épocas con parada temprana sobre F1 macro de validación (paciencia 2), weight decay 0,01, 100 pasos de calentamiento y precisión fp16. La longitud máxima de secuencia se fijó en 72 tokens, coherente con la naturaleza corta de los tuits.

La pérdida utilizada es entropía cruzada sin ponderación por clase, lo que resulta relevante dado el desbalance entre entrenamiento y test. El preprocesamiento aplicado en el artículo incluye eliminación de URL, menciones y hashtags, normalización de caracteres etíopes, eliminación de caracteres especiales y minúsculas en texto latino; el modelo publicado no incorpora ese preprocesamiento en el pipeline de Hugging Face, por lo que debe replicarse externamente para obtener resultados comparables a los del paper. No se documenta uso de RLHF ni DPO, al tratarse de una tarea de clasificación supervisada.

## Capacidades

- Clasificación de sentimiento en tres clases (negativo, neutro, positivo) para texto en amárico, principalmente tuits.
- Procesamiento de texto corto: el límite de 72 tokens cubre la mayoría de mensajes de redes sociales, pero trunca textos más largos.
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Capacidad multilingüe latente heredada de Afro-XLM-R, aunque el ajuste fino está orientado únicamente al amárico y no se han evaluado otros idiomas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador discriminativo, no un modelo generativo.

## Casos de uso

- Monitorización de opinión en redes sociales etíopes: el modelo clasifica tuits en amárico en tres polaridades, adecuado para paneles de seguimiento de conversación pública siempre que se valide la calibración de la clase neutra.
- Análisis de sentimiento en encuestas abiertas: permite procesar respuestas cortas en amárico y agregar resultados por segmento, con la ventaja de que el límite de 72 tokens cubre respuestas breves típicas.
- Filtrado previo en pipelines de moderación de contenido: puede usarse como señal auxiliar para priorizar mensajes negativos en revisión humana, no como decisión automática.
- Investigación en PLN de bajos recursos: sirve como checkpoint de referencia reproducible (semilla 42) para comparar técnicas de normalización de caracteres etíopes y ajuste fino multilingüe.
- Enriquecimiento de corpus para anotación activa: el modelo puede preetiquetar grandes volúmenes de texto amárico y reducir el coste de anotación humana, revisando manualmente las predicciones de baja confianza.
- Análisis de reputación de marca en medios digitales etíopes: clasificación por lotes de menciones y comentarios, con despliegue en CPU o GPU pequeña dado el tamaño del modelo.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test amárico de AfriSenti (1.999 tuits), según la model card:

| Métrica | Este checkpoint (semilla 42) | Media ± desviación (semillas 42/123/456) |
|---|---|---|
| F1 macro | 0,5620 | 0,5543 ± 0,0068 |
| F1 ponderado | 0,6626 | 0,6459 ± 0,0136 |
| F1 negativo | 0,7337 | 0,7056 ± 0,0222 |
| F1 neutro | 0,3433 | 0,3333 ± 0,0081 |
| F1 positivo | 0,6090 | 0,6240 ± 0,0107 |

F1 macro de validación de este checkpoint: 0,6027. La línea base de TF-IDF más regresión logística del mismo artículo obtiene un F1 macro de 0,4640 en test. No se han publicado en la información disponible resultados comparativos con otros transformers ajustados sobre AfriSenti amárico.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB para los pesos (278 M de parámetros) más memoria de activaciones, en torno a 1-1,5 GB en total con lotes pequeños.
- VRAM en fp32: aproximadamente 1,1 GB solo para pesos, alrededor de 2 GB con activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problemas. El modelo es sobredimensionado para el hardware típico, no al contrario.
- Cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU para lotes moderados, dado el tamaño reducido.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (soportado según los tags), TorchServe o un servicio FastAPI propio. No se documenta soporte de llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | F1 macro (AfriSenti am) | Licencia |
|---|---|---|---|---|---|
| Amharic Sentiment Transformer (este) | 278 M | 72 tokens (entrenamiento) | Clasificación 3 clases | 0,5620 | MIT |
| TF-IDF + regresión logística (línea base del paper) | no aplica | no aplica | Clasificación 3 clases | 0,4640 | no disponible |
| Davlan/afro-xlmr-base (modelo base) | ~278 M | no disponible | Representaciones multilingües | no disponible (no ajustado a la tarea) | no disponible en la información proporcionada |

No se dispone de datos publicados de otros clasificadores de sentimiento en amárico comparables en la información proporcionada.

## Limitaciones y advertencias

- Desbalance severo entre entrenamiento y test: el conjunto de test tiene un 66,9 % de etiquetas negativas frente a un 51,9 % de neutras en entrenamiento; el modelo tiende a sobrepredecir neutro en datos con distribución similar al test.
- Rendimiento bajo en la clase neutra (F1 de 0,3433), lo que hace arriesgado su uso para distinguir neutralidad real de polaridad débil.
- El dataset contiene algunos tuits en tigriña y ruido de etiquetas; los resultados pueden no transferirse a otros dominios distintos de tuits.
- El análisis de características de la línea base en el artículo identificó un nombre político aprendido como señal negativa fuerte; este modelo no se evaluó para ese sesgo. No debe usarse para monitorizar o perfilar a personas o grupos políticos.
- El preprocesamiento del paper (normalización de caracteres etíopes, eliminación de URL y menciones) no está integrado en el pipeline de Hugging Face; sin él, los resultados pueden diferir de los publicados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre el cumplimiento normativo en el tratamiento de datos personales.
- Solo se ha evaluado en amárico; no hay evidencia de rendimiento en otros idiomas pese a la base multilingüe.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en textos ambiguos o con sarcasmo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeezyyoba/amharic-sentiment-transformer
- Repositorio del proyecto en GitHub: https://github.com/yeezyyoba/amharic-sentiment-analysis
- Directorio de modelos del repositorio: https://github.com/yeezyyoba/amharic-sentiment-analysis/tree/main/models
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-base
- Dataset AfriSenti: https://huggingface.co/datasets/masakhane/afrisenti
