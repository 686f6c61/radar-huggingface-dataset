# thanawatcauynukul/scamsense-wangchanberta

## Resumen

ScamSense WangchanBERTa es un modelo de lenguaje basado en la arquitectura CamemBERT (RoBERTa adaptado al francés) y publicado por el usuario thanawatcauynukul en Hugging Face. Con 105.245.954 parámetros, se presenta como un modelo orientado a la detección de fraudes y estafas (scam detection), presumiblemente en tailandés, dado el nombre "WangchanBERTa", que hace referencia a la familia de modelos BERT preentrenados en tailandés desarrollados por el proyecto WangchanBART/AIResearch.in.th.

El modelo se distribuye con licencia MIT y pesos en formato safetensors, con un tamaño de repositorio de 0,4 GB. La model card publicada es extremadamente escueta: únicamente contiene la línea de licencia, sin información sobre datos de entrenamiento, arquitectura detallada, idiomas o rendimiento. Esto limita enormemente la evaluación rigurosa del modelo.

Su relevancia actual es limitada: se trata de un modelo con cero descargas y cero "likes" en el momento de la consulta, sin documentación técnica asociada. No obstante, puede resultar de interés como punto de partida para tareas de clasificación de textos fraudulentos en tailandés, siempre que se valide su comportamiento con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Camembert (transformer encoder, tipo RoBERTa) |
| Parametros totales | 105.245.954 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (CamemBERT base suele soportar 512 tokens, dato no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (presumiblemente tailandes, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada en las etiquetas del repositorio es CamemBERT, un transformer encoder basado en RoBERTa adaptado originalmente al francés por Inria y Facebook AI. Con 105 millones de parámetros, corresponde al tamaño "base" de esta familia (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, aproximadamente). El nombre del modelo sugiere que los pesos podrían derivar de WangchanBERTa, un modelo BERT preentrenado en tailandés, aunque la etiqueta de arquitectura indique CamemBERT.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens utilizados, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La model card no aporta ningún detalle al respecto, por lo que cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Clasificación de texto orientada a la detección de estafas (scam detection), según el nombre del modelo.
- Codificación de texto mediante un transformer encoder, apta para tareas de comprensión (no generación).
- Posible soporte de tailandés, inferido del nombre "WangchanBERTa", no confirmado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá de la inferencia por el nombre.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Detección de mensajes fraudulentos en tailandés: el modelo podría clasificar SMS, correos o mensajes de chat como legítimos o fraudulentos, siempre que se valide previamente con un conjunto de datos etiquetado propio, dado que no hay métricas publicadas.
- Moderación de contenido en foros y marketplaces: integrado como clasificador binario para filtrar anuncios sospechosos, aunque requiere umbrales calibrados manualmente por la ausencia de datos de rendimiento.
- Filtrado previo en pipelines de atención al cliente: como primera capa para derivar conversaciones potencialmente fraudulentas a revisión humana, aprovechando su bajo coste computacional (105 M de parámetros).
- Investigación académica sobre detección de scams en tailandés: útil como baseline ligero para comparar con modelos más grandes o específicos.
- Prototipado rápido de clasificadores de texto: al ser un modelo pequeño (0,4 GB) y con licencia MIT, permite experimentar en entornos con recursos limitados.
- Clasificación de correos de phishing en entornos con GPU de gama baja: su tamaño permite inferencia en CPU o GPU consumer con latencia baja, aunque sin datos confirmados de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,42 GB (105 M de parámetros × 4 bytes).
- VRAM estimada en FP16: aproximadamente 0,21 GB.
- VRAM estimada en int8: aproximadamente 0,11 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo cabe holgadamente en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (PyTorch), posible conversión a ONNX; no se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI (estos últimos orientados a modelos generativos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ScamSense WangchanBERTa | 105,2 M | no disponible | MIT | Hugging Face |
| WangchanBERTa base | ~110 M | 512 tokens (típico) | Apache 2.0 / MIT (según variante) | Hugging Face |
| CamemBERT base | ~110 M | 512 tokens | MIT | Hugging Face |
| XLM-RoBERTa base | ~278 M | 512 tokens | MIT | Hugging Face |

La comparativa se limita a parámetros y licencia, ya que no hay datos de rendimiento publicados para ScamSense WangchanBERTa. WangchanBERTa y CamemBERT son los parientes arquitectónicos más directos; XLM-RoBERTa base ofrece multilingüismo con mayor tamaño.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre datos de entrenamiento, evaluación ni sesgos.
- Riesgo elevado de alucinación o clasificación errónea al no existir métricas publicadas que respalden su calidad.
- Idiomas soportados no confirmados; el uso en castellano o inglés no está validado.
- Longitud de contexto no documentada; si sigue el estándar CamemBERT, se limita a 512 tokens.
- Cero descargas y cero interacciones en Hugging Face: no hay evidencia de uso en producción ni validación comunitaria.
- Licencia MIT permite uso comercial, pero la falta de garantías técnicas hace recomendable una evaluación exhaustiva antes de desplegarlo.
- Posibles sesgos derivados del corpus de entrenamiento desconocido, especialmente en la definición de "scam" según la cultura y el contexto tailandés.
- No apto para generación de texto: es un encoder, no un modelo causal.

## Enlaces

- [Hugging Face: thanawatcauynukul/scamsense-wangchanberta](https://huggingface.co/thanawatcauynukul/scamsense-wangchanberta)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
