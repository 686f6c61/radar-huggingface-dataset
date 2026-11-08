# thobitz/novapay-sentiment

## Resumen

novapay-sentiment es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario thobitz en Hugging Face. Con 66.955.010 parámetros (aproximadamente 67 millones), se trata de un modelo encoder de tipo DistilBERT orientado a análisis de sentimiento, presumiblemente en el dominio de pagos o servicios financieros ("novapay"), aunque la model card no documenta el dataset de entrenamiento ni los idiomas soportados.

El modelo se entrenó durante 2 épocas con un learning rate de 2e-05, batch size de 16 y el optimizador AdamW fused, alcanzando en el conjunto de evaluación una pérdida de 0,3055, una accuracy de 0,885 y un F1 de 0,8840. Estos resultados sugieren un rendimiento razonable para una tarea de clasificación binaria o multiclase de sentimiento, si bien la ausencia de documentación sobre el dataset y las etiquetas limita seriamente su reproducibilidad y su evaluación independiente.

Su relevancia actual es limitada: se publicó en noviembre de 2026, no tiene descargas ni likes, y la model card es la generada automáticamente por el Trainer de Transformers sin completar. Resulta útil únicamente como punto de partida para tareas de análisis de sentimiento en inglés (el tokenizador base es uncased en inglés) o como ejemplo de fine-tuning ligero desplegable en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT) |
| Parametros totales | 66.955.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base distilbert-base-uncased soporta 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantización dinámica a int8 vía PyTorch) |
| Idiomas soportados | no disponible; el modelo base está entrenado principalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de distilbert-base-uncased, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base. DistilBERT reduce el tamaño de BERT-base en un 40 % y conserva aproximadamente el 97 % de su rendimiento en tareas de comprensión del lenguaje, lo que lo convierte en una opción eficiente para clasificación. La cabeza de clasificación se sustituye por una capa lineal adaptada al número de etiquetas del dataset de sentimiento (no documentado).

El entrenamiento se realizó con Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. Los hiperparámetros fueron: learning rate 2e-05, batch size de 16 en entrenamiento y evaluación, 2 épocas (626 pasos totales), scheduler lineal, seed 42 y AdamW fused con betas (0,9; 0,999) y epsilon 1e-08. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo técnicas de alineación como RLHF o DPO (no aplicables habitualmente a clasificación). No se describe ninguna innovación técnica adicional.

## Capacidades

- Clasificación de texto para análisis de sentimiento (positivo/negativo u otro esquema de etiquetas no documentado).
- Inferencia rápida en CPU y GPU gracias a su tamaño reducido (67 M de parámetros).
- Compatible con el pipeline `text-classification` de Transformers.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidad multilingüe no garantizada: el modelo base es uncased en inglés y no se documentan idiomas adicionales.

## Casos de uso

- Análisis de sentimiento de reseñas de usuarios en una plataforma de pagos: el modelo clasificaría comentarios de clientes sobre transacciones o el servicio, aprovechando su accuracy del 88,5 % en el conjunto de evaluación del autor.
- Monitorización de opiniones en redes sociales: procesamiento por lotes de textos cortos en inglés para detectar quejas o satisfacción, con bajo coste computacional al caber en CPU.
- Enrutamiento de tickets de soporte: clasificar la polaridad de un mensaje entrante para priorizar casos negativos hacia atención humana.
- Análisis de encuestas NPS: etiquetar respuestas abiertas de clientes para agregar métricas de satisfacción.
- Filtrado de retroalimentación en pipelines de producto: clasificación automática de comentarios en repositorios o formularios internos.
- Prototipado rápido de clasificadores de sentimiento: servir como baseline fine-tuneado para comparar con modelos propios antes de invertir en entrenamientos mayores.
- Despliegue en entornos con recursos limitados: al ocupar unos 0,5 GB en fp32, puede ejecutarse en contenedores pequeños o dispositivos edge con Text Embeddings Inference.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no documentado):

| Metrica | Valor |
|---|---|
| Loss (evaluación) | 0,3055 |
| Accuracy | 0,885 |
| F1 | 0,8840 |

Evolución durante el entrenamiento:

| Epoca | Paso | Training loss | Validation loss | Accuracy | F1 |
|---|---|---|---|---|---|
| 1.0 | 313 | 0,3268 | 0,4204 | 0,816 | 0,8380 |
| 2.0 | 626 | 0,1983 | 0,3055 | 0,885 | 0,8840 |

El model-index oficial no incluye resultados adicionales. No se han publicado benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (67 M de parámetros × 4 bytes ≈ 268 MB) más overhead de activaciones; en int8 dinámico, alrededor de 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona sin problema en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para lotes pequeños.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (soportado por tag), Hugging Face Inference Endpoints, ONNX Runtime y TorchScript. No se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (miles de secuencias cortas por segundo en hardware moderno) y decenas a cientos por segundo en CPU, aunque son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thobitz/novapay-sentiment | 66,9 M | 512 tokens (modelo base) | Accuracy 0,885, F1 0,884 (eval. propia) | Apache 2.0 | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| ameenazeemi/novapay-sentiment | 67 M | no disponible | no disponible | no disponible | Hugging Face |
| shash4333/novapay-sentiment | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos verificables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El dataset de entrenamiento, el esquema de etiquetas y el dominio exacto no están documentados; la model card indica "More information needed" en todas las secciones descriptivas.
- Los resultados (accuracy 0,885, F1 0,884) proceden de un conjunto de evaluación no descrito, por lo que no son reproducibles ni comparables de forma fiable.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Idiomas: el modelo base es uncased en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Limitación de contexto: textos superiores a 512 tokens se truncan, lo que puede degradar la clasificación de documentos largos.
- Sesgos: al no documentarse la composición del dataset, no es posible evaluar sesgos demográficos, de dominio o de anotación.
- Licencia Apache 2.0 permite uso comercial, pero al no conocerse el origen de los datos de entrenamiento no puede descartarse que el dataset tuviera restricciones adicionales.
- Modelo sin descargas ni validación comunitaria (0 descargas, 0 likes); no se recomienda para producción sin una evaluación propia sobre datos representativos.
- El número de etiquetas y su orden no se especifican, lo que impide interpretar las salidas sin inspeccionar `config.json`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thobitz/novapay-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo homónimo de otro autor: https://huggingface.co/ameenazeemi/novapay-sentiment
- Modelo homónimo de otro autor: https://huggingface.co/shash4333/novapay-sentiment
