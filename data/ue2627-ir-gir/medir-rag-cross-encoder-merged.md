# ue2627-ir-gir/medir-rag-cross-encoder-merged

## Resumen

medir-rag-cross-encoder-merged es un modelo de re-ranking (cross-encoder) para recuperación de información en el dominio biomédico, desarrollado en el marco del proyecto MedIR-RAG de la Universidade de Évora (asignatura Recuperação de Informação em Bases de Texto). Se construye a partir de cross-encoder/ms-marco-MiniLM-L-6-v2, un transformer BERT de 6 capas, sobre el que se aplica un adaptador LoRA que posteriormente se fusiona con los pesos base para producir un modelo único listo para inferencia.

El modelo resuelve la segunda etapa de un pipeline RAG médico: dado un par pregunta-pasaje, devuelve una puntuación de relevancia que permite reordenar los candidatos recuperados por una búsqueda híbrida. Se ha entrenado específicamente sobre pares pregunta/pasaje de BioASQ, el benchmark de respuesta a preguntas biomédicas, lo que lo orienta a vocabulario y estructuras de consulta clínica que los cross-encoders genéricos no cubren de forma óptima.

Es relevante porque demuestra una receta de bajo coste (fine-tuning con LoRA sobre una base de solo 22,7 millones de parámetros) para especializar un re-ranker en un dominio vertical, con resultados reportados de NDCG@5 0,5437 y MRR@10 0,7467 reordenando el top 50 de una búsqueda híbrida sobre el corpus completo con 279 preguntas de test de BioASQ. El repositorio es pequeño (0,1 GB) y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L6), cabeza de clasificación de secuencias (cross-encoder) |
| Parametros totales | 22.713.601 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso trunca a 320 tokens con `truncation="only_second"`) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía herramientas de transformers, no documentada por el autor) |
| Idiomas soportados | no disponible (entrenado sobre BioASQ, presumiblemente inglés, no declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en cross-encoder/ms-marco-MiniLM-L-6-v2, un transformer encoder de 6 capas y 22,7 millones de parámetros derivado de MiniLM. La entrada es un par (pregunta, pasaje) concatenado con los tokens especiales del tokenizador BERT; la salida es un logit único de relevancia que se usa para reordenar. El autor indica que el adaptador LoRA se ha fusionado con los pesos base, de modo que el repositorio contiene un modelo completo y no requiere cargar el adaptador por separado.

El entrenamiento se realizó sobre pares pregunta/pasaje de BioASQ, mediante el script `train_cross_encoder.py` del proyecto MedIR-RAG. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, la configuración de LoRA (rango, alpha, capas objetivo) ni si se aplicaron técnicas de alineación adicionales (RLHF/DPO). La evaluación reportada se hizo reordenando el top 50 de una búsqueda híbrida sobre el corpus completo con 279 preguntas de test de BioASQ.

## Capacidades

- Puntuación de relevancia pregunta-pasaje para re-ranking en pipelines de recuperación (cross-encoding).
- Clasificación de texto en pares (pipeline `text-classification` de transformers).
- Especialización en dominio biomédico y preguntas clínicas derivada del entrenamiento sobre BioASQ.
- Integración con pipelines RAG de dos etapas: recuperación híbrida seguida de re-ranking.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- No soporta generación de texto, tool calling, agentes, visión, audio ni modo thinking: es un modelo discriminativo, no generativo.
- Capacidades multilingües: no declaradas.

## Casos de uso

- Re-ranking en un sistema RAG biomédico: se recuperan los 50 candidatos principales con búsqueda híbrida (léxica + densa) y el cross-encoder los reordena según la puntuación del par pregunta-pasaje; los resultados reportados (NDCG@5 0,5437, MRR@10 0,7467) indican que es adecuado como segunda etapa sobre ese tamaño de lista.
- Búsqueda de literatura médica: dado un interrogante clínico, reordenar resúmenes o fragmentos de PubMed/BioASQ para priorizar los pasajes que responden a la pregunta antes de pasarlos a un LLM generador.
- Asistencia a la decisión clínica documental: filtrar y ordenar guías y artículos recuperados para que el componente generativo reciba contexto de mayor precisión, reduciendo el ruido en la ventana de contexto.
- Evaluación de sistemas de recuperación: usar el modelo como juez de relevancia para comparar configuraciones de búsqueda híbrida sobre un corpus biomédico.
- Filtrado de candidatos en bases de datos de preguntas frecuentes clínicas: puntuar pares pregunta-respuesta y descartar los que caen por debajo de un umbral antes de la respuesta final.
- Despliegue de bajo coste en CPU: con 22,7 millones de parámetros y pesos en safetensors, puede servirse en infraestructura modesta para re-ranking en línea de listas cortas (top 50), sin necesidad de GPU dedicada.
- Investigación en recuperación de información: punto de partida reproducible para experimentar con LoRA sobre MiniLM en dominios verticales, reutilizando el script de entrenamiento del proyecto.

## Benchmarks y rendimiento

Evaluación reportada por el autor: re-ranking del top 50 de la búsqueda híbrida, corpus completo, 279 preguntas de test de BioASQ.

| Metrica | Valor |
|---|---|
| NDCG@5 | 0,5437 |
| MRR@10 | 0,7467 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar no aplican a un cross-encoder de re-ranking).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 90 MB de pesos (22,7 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU para lotes pequeños. Cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales e incluso en entornos sin GPU.
- Opciones de despliegue: transformers (pipeline `text-classification`), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles; también es viable exportarlo a ONNX o cuantizarlo para CPU.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un encoder de 6 capas con entradas truncadas a 320 tokens es apto para re-ranking en línea de listas de decenas de candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medir-rag-cross-encoder-merged | 22,7 M | no disponible (uso a 320 tokens) | Biomédico (BioASQ) | no disponible | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-6-v2 (base) | 22,7 M | 512 tokens (estándar BERT) | General (MS MARCO) | no disponible en la información | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33 M | 512 tokens (estándar BERT) | General (MS MARCO) | no disponible en la información | Hugging Face |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información proporcionada; la comparación se limita a arquitectura, tamaño y dominio de entrenamiento.

## Limitaciones y advertencias

- Modelo discriminativo: no genera texto ni respuestas; solo puntúa pares pregunta-pasaje.
- Entrenado exclusivamente sobre BioASQ: el rendimiento fuera del dominio biomédico no está caracterizado y probablemente degrade.
- Idioma: no se declara el conjunto de idiomas soportados; el entrenamiento sobre BioASQ sugiere inglés, pero no está confirmado.
- Licencia no declarada: no hay autorización explícita para uso comercial; debe contactarse con el autor antes de integrarlo en producción.
- Riesgo de sesgo heredado de los datos de entrenamiento (BioASQ y la base MS MARCO), no evaluado por el autor.
- Sin datos sobre calibración de las puntuaciones de relevancia: el umbral de decisión debe ajustarse empíricamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación externa ni comunidad que reporte comportamientos en producción.
- Sin información sobre el proceso de entrenamiento (hiperparámetros LoRA, número de épocas, composición del dataset): dificulta la reproducibilidad.
- La ventana de contexto efectiva no está documentada; el ejemplo de uso trunca el pasaje a 320 tokens, por lo que pasajes más largos se recortan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ue2627-ir-gir/medir-rag-cross-encoder-merged
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Proyecto MedIR-RAG (Universidade de Évora): no disponible enlace público en la información proporcionada
- Script de entrenamiento `train_cross_encoder.py`: referenciado en la model card, sin URL pública en la información disponible
- Paper o blog del proyecto: no disponible
