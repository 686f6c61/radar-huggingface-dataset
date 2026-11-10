# trishurao/support-ticket-classifier

## Resumen

El modelo `trishurao/support-ticket-classifier` es un clasificador de texto publicado en Hugging Face por el usuario trishurao, presumiblemente orientado a la categorización automática de tickets de soporte. Con 67.012.685 parámetros reales almacenados en formato safetensors, su tamaño encaja con una arquitectura derivada de DistilBERT (base, 6 capas, ~66M de parámetros), lo que lo sitúa en la gama ligera de modelos encoder-only para tareas de clasificación.

La información pública disponible es mínima: no se declara pipeline, licencia, idiomas ni datos de entrenamiento. El repositorio ocupa 0,3 GB y no registra descargas en el momento de la consulta, con un único like, lo que indica que se trata de un modelo recién publicado o de un experimento personal sin documentación asociada.

Su relevancia potencial reside en el caso de uso: la clasificación de tickets de soporte es una tarea de alto valor operativo donde los modelos encoder pequeños y rápidos suelen ser preferibles a LLMs generativos por coste y latencia. Sin embargo, la ausencia de model card, benchmarks y licencia limita seriamente su adopción en producción sin una evaluación previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (inferida por tags y numero de parametros; no confirmada en model card) |
| Parametros totales | 67.012.685 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT estandar: 512 tokens; no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura exacta en la model card. El tag `distilbert` y el recuento de 67.012.685 parámetros son consistentes con `distilbert-base-uncased` (66,9M de parámetros), un transformer encoder-only de 6 capas, 12 cabezas de atención y dimensión oculta 768, destilado desde BERT-base. Sobre esa base se habría añadido una cabeza de clasificación, presumiblemente con un número de clases no especificado.

No hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, la existencia de fine-tuning supervisado, ni técnicas de alineación como RLHF o DPO. Tampoco se documenta la taxonomía de etiquetas del clasificador de tickets, dato crítico para cualquier integración.

## Capacidades

- Clasificación de texto (encoder-only con cabeza de clasificación), presumiblemente de tickets de soporte en categorías predefinidas.
- No dispone de generación de texto: al ser un modelo encoder, no produce secuencias.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidades multilingües: no disponibles (si deriva de `distilbert-base-uncased`, el entrenamiento sería predominantemente en inglés, pero no está confirmado).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enrutamiento automático de tickets: el modelo clasificaría cada ticket entrante en una categoría (facturación, técnico, cuenta, etc.) para asignarlo al equipo adecuado, aprovechando la baja latencia típica de un encoder de 67M de parámetros.
- Triaje y priorización en mesas de ayuda: combinado con reglas de negocio, permitiría etiquetar la urgencia o el tipo de incidencia antes de la intervención humana.
- Clasificación por lotes de históricos: al ser un modelo pequeño, puede procesar grandes volúmenes de tickets archivados en CPU o GPU de gama baja para análisis de tendencias.
- Filtrado previo en pipelines de atención al cliente: descartar o redirigir tickets fuera de alcance (spam, consultas comerciales) antes de llegar a un LLM generativo, reduciendo coste por consulta.
- Etiquetado asistido para anotación humana: usar las predicciones como pre-etiquetas en herramientas de anotación, con revisión humana posterior.
- Clasificación en entornos con recursos limitados: despliegue en contenedores pequeños o edge por su reducido tamaño (0,3 GB de repo) y requisitos de memoria moderados.

En todos los casos, la ausencia de documentación sobre la taxonomía de etiquetas y el dominio de entrenamiento obliga a validar el modelo contra datos propios antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para pesos (67M × 4 bytes), más activaciones; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,13 GB para pesos; menos de 0,5 GB con activaciones.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, o exportación a TorchScript; también es viable servirlo con FastAPI o类似. No se documenta compatibilidad con vLLM ni llama.cpp (no aplica a encoders en la mayoría de configuraciones de llama.cpp).
- Latencia y throughput: no disponibles; para un DistilBERT de este tamaño en GPU moderna se espera del orden de milisegundos por muestra en lotes, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trishurao/support-ticket-classifier | 67.012.685 | no disponible | Clasificacion de tickets | no disponible | Hugging Face |
| distilbert-base-uncased | ~66,9M | 512 tokens | Encoder general (fine-tuning) | Apache 2.0 | Hugging Face |
| bert-base-uncased | ~110M | 512 tokens | Encoder general (fine-tuning) | Apache 2.0 | Hugging Face |
| roberta-base | ~125M | 512 tokens | Encoder general (fine-tuning) | MIT | Hugging Face |

La comparación se limita a arquitecturas de referencia, ya que no se dispone de benchmarks del modelo evaluado ni de alternativas específicas de clasificación de tickets publicadas en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, taxonomía de etiquetas, métricas ni proceso de validación.
- Licencia no declarada: no es posible determinar si el uso comercial está permitido; riesgo legal para producción.
- Idiomas no declarados: si el modelo deriva de DistilBERT en inglés, el rendimiento en castellano podría ser deficiente; requiere evaluación.
- Riesgo de sesgos desconocido: sin información sobre el corpus, no se pueden evaluar sesgos de dominio, género, idioma o geografía.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas (falsos positivos/negativos) sin calibración documentada.
- Contexto máximo presumiblemente de 512 tokens (estándar DistilBERT), insuficiente para tickets largos con historial de conversación.
- Sin métricas publicadas, no hay forma de comparar su calidad frente a alternativas; se recomienda fine-tuning propio o evaluación contra un conjunto etiquetado antes de adoptarlo.
- Repositorio con 0 descargas y 1 like: sin evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/trishurao/support-ticket-classifier
- No se han encontrado papers, blogs, repositorios ni demos asociados en la búsqueda web realizada.
