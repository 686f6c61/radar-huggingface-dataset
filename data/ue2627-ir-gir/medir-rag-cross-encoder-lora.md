# ue2627-ir-gir/medir-rag-cross-encoder-lora

## Resumen

medir-rag-cross-encoder-lora es un adaptador LoRA para re-ranking de recuperación de información, desarrollado en el marco del proyecto MedIR-RAG de la Universidade de Évora (asignatura Recuperação de Informação em Bases de Texto). No es un modelo generativo, sino un cross-encoder que puntúa pares pregunta-pasaje para reordenar los resultados de un sistema de búsqueda híbrida previo. Se construye sobre el modelo base `cross-encoder/ms-marco-MiniLM-L-6-v2`, un transformer encoder de la familia MiniLM.

Su relevancia radica en el dominio de aplicación: está entrenado sobre pares pregunta/pasaje de BioASQ, el benchmark de pregunta-respuesta biomédica, lo que lo especializa en re-ranking de literatura científica y médica en inglés. El adaptador se distribuye como pesos PEFT en safetensors y se carga mediante `peft.PeftModel` sobre el cross-encoder original.

La información publicada es muy limitada: no hay licencia declarada, no hay idiomas declarados, no hay pipeline asignado y el repositorio ocupa 0.0 GB en el momento de la consulta. Los únicos datos de rendimiento son las métricas de re-ranking reportadas por el autor sobre el conjunto de test de BioASQ.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder (transformer encoder) con adaptador LoRA; base MiniLM-L6 |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto; el base MiniLM-L6 tiene ~22,7 M de parametros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita; el ejemplo de uso trunca a `max_length=320` |
| Tipos de cuantizacion | No disponible (pesos PEFT en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | No disponible (entrenado sobre BioASQ, presumiblemente ingles) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `cross-encoder/ms-marco-MiniLM-L-6-v2`, un cross-encoder de 6 capas derivado de MiniLM que recibe un par (consulta, documento) de forma conjunta y produce una puntuación de relevancia mediante una cabeza de clasificación con `num_labels=1`. Sobre esta base se entrena un adaptador LoRA (PEFT), lo que mantiene congelados los pesos originales y solo actualiza las matrices de baja dimensión inyectadas.

El entrenamiento se realizó sobre pares pregunta/pasaje de BioASQ, según indica la model card, con el código `train_cross_encoder.py` del proyecto MedIR-RAG. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco habituales en un cross-encoder de re-ranking). Tampoco se detalla la configuración LoRA (rango, alpha, módulos objetivo) ni los hiperparámetros de entrenamiento.

## Capacidades

- Re-ranking de pares pregunta-pasaje: asigna una puntuación de relevancia a cada par para reordenar los candidatos de un sistema de recuperación previo.
- Recuperación de información biomédica: especializado en el dominio de BioASQ (preguntas y pasajes científicos/médicos).
- Integración en pipelines RAG: pensado para la fase de re-ranking tras una búsqueda híbrida (léxica + densa).
- Puntuación por par con truncado configurable (`truncation="only_second"`, `max_length=320` en el ejemplo).
- No soporta generación de texto, tool calling, agentes ni multi-step reasoning: es un modelo de scoring, no un LLM generativo.
- Capacidades multilingües: no disponibles; el entrenamiento se limita al corpus BioASQ.

## Casos de uso

- Re-ranking en un sistema RAG biomédico: tras recuperar los 50 mejores pasajes con búsqueda híbrida, el cross-encoder reordena y se queda con los más relevantes para alimentar al generador; es exactamente el escenario evaluado por el autor (NDCG@5 0,5437 sobre 279 preguntas de test).
- Búsqueda de literatura científica: priorizar pasajes de PubMed o corpus similares ante consultas clínicas, mejorando la precisión de los primeros resultados.
- Asistencia a la revisión sistemática: ordenar candidatos extraídos de bases de datos médicas para que el revisor humano empiece por los pasajes con mayor puntuación del cross-encoder.
- Filtrado de contexto en pipelines de question answering: reducir el número de pasajes enviados al modelo generativo, recortando coste y latencia sin perder los documentos relevantes.
- Evaluación de sistemas de recuperación: usar las puntuaciones del cross-encoder como referencia para comparar configuraciones de búsqueda híbrida.
- Prototipado académico de IR: base ligera (MiniLM-L6) y adaptador LoRA para experimentar con re-ranking en dominios especializados sin infraestructura pesada.

## Benchmarks y rendimiento

Datos reportados por el autor sobre el conjunto de test de BioASQ (279 preguntas), re-ranking del top 50 de la búsqueda híbrida sobre el corpus completo:

| Metrica | Valor |
|---|---|
| NDCG@5 | 0,5437 |
| MRR@10 | 0,7467 |

No se han publicado en la información disponible resultados comparativos con otros modelos, ni métricas adicionales (MAP, Recall@k, etc.).

## Requisitos de hardware

- VRAM estimada: muy baja. El modelo base MiniLM-L6 ronda los 22,7 M de parámetros (~90 MB en fp32, ~45 MB en fp16); el adaptador LoRA añade unos pocos MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una GTX 1650, RTX 3060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en prácticamente todas, e incluso puede ejecutarse en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial documentada), exportación a ONNX o TorchScript para servir, y `sentence-transformers` CrossEncoder si se fusiona el adaptador con la base. Para alto throughput conviene batching y, si se necesita, cuantización dinámica del base.
- Latencia y throughput: no disponibles en la información proporcionada; al tratarse de un MiniLM-L6, la inferencia por par es del orden de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medir-rag-cross-encoder-lora | Base MiniLM-L6 (~22,7 M) + LoRA | No disponible (ejemplo a 320 tokens) | Biomédico (BioASQ) | No disponible | Hugging Face (PEFT) |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | ~22,7 M | 512 tokens (estandar del base) | General (MS MARCO) | No disponible en la informacion | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33 M | 512 tokens (estandar del base) | General (MS MARCO) | No disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; riesgo legal para producción.
- Dominio restringido: entrenado sobre BioASQ; el rendimiento fuera del ámbito biomédico en inglés es incierto.
- Idiomas no declarados: no hay garantía de funcionamiento en castellano ni en otros idiomas distintos del inglés del corpus.
- Modelo de scoring, no generativo: no produce texto; su uso requiere integrarlo en un pipeline de recuperación.
- Riesgo de sesgo heredado del corpus BioASQ y del base MS MARCO (sesgos de dominio y de composición del dataset).
- Alucinación no aplica en sentido estricto (no genera), pero puede asignar puntuaciones altas a pasajes irrelevantes si la consulta cae fuera de distribución.
- Configuración LoRA no documentada: dificulta la reproducibilidad y el ajuste fino posterior.
- Repositorio sin descargas ni likes y con tamaño 0.0 GB en la consulta: verificar la integridad de los pesos antes de usarlo en producción.
- Sin métricas de calibración ni comparativas: las cifras NDCG@5 y MRR@10 son del propio autor y no han sido replicadas de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ue2627-ir-gir/medir-rag-cross-encoder-lora
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
- Proyecto MedIR-RAG (Universidade de Évora): no disponible en la información proporcionada
- Código de entrenamiento (`train_cross_encoder.py`): no disponible como enlace en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
