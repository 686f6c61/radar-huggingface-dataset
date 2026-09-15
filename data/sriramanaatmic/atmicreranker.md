# SriRamanaAtmic/AtmicReRanker

## Resumen

AtmicReRanker es un cross-encoder de reordenación (reranking) para recuperación de información, publicado por el usuario SriRamanaAtmic en HuggingFace. Se trata de un fine-tune de castorini/monobert-large-msmarco, un modelo basado en la arquitectura BERT-large, con 335.143.938 parámetros totales y un repositorio de 1,3 GB en formato safetensors. Su función no es generar texto, sino puntuar la relevancia de un par consulta-pasaje y reordenar una lista de candidatos devuelta por un recuperador de primera etapa.

El modelo se ha ajustado mediante un fine-tune pairwise ponderado con LambdaRank sobre un dataset combinado de Q&A de Ramana Maharshi (capas layer1 + layer2), con una longitud máxima de secuencia de 512 tokens. Está etiquetado como `text-classification` con `num_labels=2`, de modo que la salida son dos logits por par: la diferencia entre ellos (o el softmax sobre la clase positiva) se usa como puntuación de relevancia.

Es relevante sobre todo por dos motivos. Primero, porque documenta un cambio incompatible en el propio repositorio: la versión anterior alojaba un checkpoint CrossEncoder compatible con `sentence-transformers` (bge-reranker-base), mientras que la actual es un checkpoint MonoBERT de estilo PyGaggle (`BertConfig` + `BertForSequenceClassification`), que no se puede cargar mediante `sentence_transformers.cross_encoder.CrossEncoder`. Segundo, porque es un ejemplo de adaptación de dominio de un reranker generalista (MS MARCO) a un corpus temático muy concreto, con licencia MIT y en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (cross-encoder, `BertForSequenceClassification`) |
| Parametros totales | 335.143.938 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 512 tokens (`max_length` de entrenamiento) |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`BertConfig` + `BertForSequenceClassification`, `num_labels=2`) |
| Modelo base | castorini/monobert-large-msmarco |
| Pipeline | text-classification |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer de tipo BERT en configuración large (coherente con los 335 millones de parámetros y con el modelo base castorini/monobert-large-msmarco). El uso es de cross-encoder mono-secuencia: la consulta y el pasaje se concatenan en una sola entrada del tipo `[CLS] query [SEP] passage [SEP]` y el modelo produce un par de logits (`num_labels=2`). La puntuación de relevancia se obtiene como `logits[:, 1] - logits[:, 0]` o como `logits.softmax(-1)[:, 1]`, según indica la propia model card.

El entrenamiento consiste en un fine-tune pairwise ponderado con LambdaRank sobre el dataset combinado de reranking de Q&A de Ramana Maharshi (layer1 + layer2), con `max_length=512`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas adicionales de RLHF o DPO (en un modelo de clasificación de pares, este tipo de alineamiento no suele aplicar). El punto de partida es un modelo ya entrenado para ranking de pasajes sobre MS MARCO, por lo que el ajuste actúa como adaptación de dominio sobre un corpus temático.

Como innovación destacable, la model card subraya un cambio incompatible respecto a la versión previa del repositorio: se ha pasado de un CrossEncoder compatible con `sentence-transformers` a un checkpoint MonoBERT de estilo PyGaggle. Esto implica que las integraciones basadas en `sentence_transformers.cross_encoder.CrossEncoder` dejarán de funcionar y hay que cargar el modelo manualmente con `BertConfig`, `BertForSequenceClassification` y `BertTokenizer` de la librería `transformers`.

## Capacidades

- Puntuación de relevancia consulta-pasaje: genera dos logits por par y permite derivar un score continuo de relevancia.
- Reordenación de listas de candidatos: pensado como segunda etapa de un pipeline de recuperación, tras un retriever de primera fase.
- Clasificación de texto binaria (`text-classification`, `num_labels=2`).
- Adaptación a dominio de Q&A: ajustado sobre un corpus específico de preguntas y respuestas de Ramana Maharshi.
- Manejo de pares largos: soporta hasta 512 tokens por par consulta-pasaje.
- No genera texto: es un modelo de scoring, no un modelo generativo.
- No dispone de tool calling ni function calling.
- No implementa modo agente ni razonamiento multi-paso de forma nativa.
- Capacidad multilingüe limitada: solo inglés.
- Sin capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Reranking en pipelines RAG: colocar el modelo como segunda etapa tras un retriever vectorial o léxico, reordenando los `top-k` pasajes recuperados (por ejemplo, `top-100` a `top-5`) con un score de relevancia más preciso que la similitud de embeddings.
- Búsqueda semántica de precisión: en un motor de búsqueda interno, usar el modelo para reordenar los resultados de una primera fase y mejorar el orden final de los documentos mostrados al usuario.
- Sistemas de Q&A sobre corpus documental: dado un conjunto de fragmentos candidatos y una pregunta, seleccionar el pasaje que realmente contiene la respuesta antes de pasarlo a un modelo generativo.
- Filtrado de contexto para LLM: reducir el número de pasajes que se envían al modelo generativo, seleccionando solo los mejor puntuados y así ahorrar tokens de contexto y coste de inferencia.
- Búsqueda de documentación técnica: reordenar resultados de manuales, guías o referencias de API en un buscador para desarrolladores, siempre que el contenido esté en inglés.
- Aplicaciones de nicho en contenido filosófico o espiritual: al estar ajustado sobre un dataset de Q&A de Ramana Maharshi, puede ofrecer mejor ordenación en ese dominio concreto que un reranker genérico.
- Evaluación offline de recuperadores: usar el score de relevancia como métrica automática para comparar variantes de un retriever durante el desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,34 GB solo para pesos (335 M parámetros × 4 bytes), más activaciones y memoria del tokenizador.
- VRAM estimada en fp16/bf16: aproximadamente 670 MB para pesos.
- VRAM estimada en int8: aproximadamente 340 MB para pesos, si se aplica cuantización dinámica.
- GPU recomendadas: al ser un modelo de 335 M parámetros, no requiere GPUs de centro de datos. Cualquier GPU con 4 GB o más de VRAM es suficiente; una NVIDIA A100, H100 o L40S solo tiene sentido para servir en lote a gran escala.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con suficiente memoria compartida.
- CPU: es viable para inferencia en CPU, con latencias mayores, especialmente en lotes grandes de pares a 512 tokens.
- Opciones de despliegue: `transformers` con PyTorch (vía `BertForSequenceClassification`), ONNX Runtime, TorchScript, o cualquier stack de reranking que acepte checkpoints MonoBERT de estilo PyGaggle. No es cargable mediante `sentence_transformers.cross_encoder.CrossEncoder` en su versión actual. No aplica vLLM, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| AtmicReRanker | 335 M | 512 | Inglés | MIT | Fine-tune de dominio sobre Q&A de Ramana Maharshi; incompatibilidad con `sentence-transformers` |
| castorini/monobert-large-msmarco | 335 M | 512 | Inglés | No disponible en la informacion | Modelo base; reranker generalista entrenado sobre MS MARCO |
| BAAI/bge-reranker-base | ~278 M (dato publico) | 512 | Multilingüe (modelo base de la familia) | MIT (dato publico) | Alternativa generalista y compatible con sentence-transformers; los valores deben confirmarse en su repositorio |
| cross-encoder/ms-marco-MiniLM-L-12-v2 | ~33 M (dato publico) | 512 | Inglés | Apache-2.0 (dato publico) | Mucho más ligero y rápido; menor capacidad que un modelo large; valores a confirmar en su repositorio |

## Limitaciones y advertencias

- Idiomas: el modelo solo está etiquetado para inglés (`en`); su rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto limitado a 512 tokens por par; los pasajes más largos deben truncarse, con la consiguiente pérdida de información.
- Riesgo de sobreajuste al dominio: el fine-tune se realizó sobre un dataset muy específico (Q&A de Ramana Maharshi), lo que puede degradar el rendimiento en dominios generales respecto al modelo base.
- Incompatibilidad de API: no se puede cargar con `sentence_transformers.cross_encoder.CrossEncoder`; requiere `transformers` y una carga manual. Esto rompe integraciones existentes que apuntaban a la versión anterior del repositorio.
- Ausencia de validación por la comunidad: el repositorio registra 0 descargas y 0 likes, y no se publican benchmarks, por lo que no hay evidencia independiente de calidad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de puntuaciones de relevancia mal calibradas fuera de la distribución de entrenamiento.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus de entrenamiento, de temática espiritual y filosófica, puede introducir un sesgo de dominio.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia efectiva del modelo base y de los datos de entrenamiento antes de desplegarlo en producción, ya que no se detalla en la información disponible.
- En producción: es necesario monitorizar la calibración del score y el umbral de decisión, ya que la salida son logits y no probabilidades calibradas por defecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SriRamanaAtmic/AtmicReRanker
- Modelo base (castorini/monobert-large-msmarco): https://huggingface.co/castorini/monobert-large-msmarco
- Repositorio anterior de referencia (bge-reranker-base, mencionado en la model card como versión previa del checkout): no se proporciona enlace directo en la información disponible.
- Paper, blog o demo adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo.
