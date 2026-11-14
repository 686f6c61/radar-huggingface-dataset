# tabularisai/ModernFinBERT

## Resumen

ModernFinBERT es un clasificador de sentimiento financiero desarrollado por Tabularis AI, obtenido mediante fine-tuning de answerdotai/ModernBERT-base. Su objetivo es asignar una polaridad (positiva, negativa o neutra) a textos del dominio financiero, cubriendo fuentes heterogéneas como noticias, tuits, criptomonedas y macroeconomía. El modelo se presenta como un clasificador de propósito general para el dominio financiero, a diferencia de FinBERT original, que está más centrado en textos de noticias y filings.

La arquitectura subyacente es ModernBERT, un transformer encoder con atención de longitud completa y alternancia de capas locales/globales, del que hereda una ventana de contexto de hasta 8.192 tokens (según la especificación del modelo base). El modelo final cuenta con 149.607.171 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,6 GB, lo que lo sitúa en la categoría de modelos encoder ligeros aptos para inferencia en CPU y GPU de consumo.

Su relevancia actual radica en que el autor reporta mejoras de hasta un 48 % en exactitud frente a clasificadores financieros previos en determinados conjuntos de datos, y una media de 0,75 de exactitud y 0,91 de ROC-AUC en los tres benchmarks publicados (FIQA, Twitter y JeanBaptiste). El modelo se publica bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base, fine-tuned para clasificación) |
| Parametros totales | 149.607.171 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base ModernBERT-base soporta hasta 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas como bitsandbytes u ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernFinBERT es un fine-tuning supervisado de answerdotai/ModernBERT-base para clasificación de texto (pipeline `text-classification`). ModernBERT es un encoder transformer que moderniza la arquitectura BERT clásica con mejoras como RoPE (rotary positional embeddings), alternancia de capas de atención local y global, y un contexto nativo mucho mayor que el de BERT original. El modelo conserva la cabeza de clasificación ajustada al dominio financiero.

El entrenamiento se realizó, según la model card, sobre una combinación de datos financieros sintéticos y reales depurados mediante un pipeline agéntico automatizado con IA. El autor no detalla el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; para un modelo encoder de clasificación, lo habitual es entrenamiento supervisado con etiquetas de sentimiento, pero este extremo no se especifica. Tampoco se documentan hiperparámetros, épocas ni estrategia de validación.

## Capacidades

- Clasificación de sentimiento financiero en tres clases (positiva, negativa, neutra) sobre textos cortos y medios.
- Cobertura de dominios financieros diversos: noticias económicas, tuits financieros, criptomonedas y macroeconomía.
- Procesamiento de entradas multioración (el ejemplo de la model card incluye frases largas con varias cláusulas).
- Integración directa con la librería `transformers` mediante `pipeline('text-classification', ...)`.
- Ejecución eficiente en CPU y GPU de consumo gracias a su tamaño (≈150 M de parámetros).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo discriminativo, no generativo.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento de noticias financieras en tiempo real: el modelo puede clasificar titulares y párrafos de agencias y medios económicos para alimentar paneles de riesgo o alertas de mercado, aprovechando su entrenamiento específico en este tipo de texto.
- Monitorización de redes sociales y foros de inversión: clasificación de tuits y mensajes sobre acciones y criptomonedas para detectar cambios de sentimiento del retail, un dominio incluido explícitamente en el entrenamiento (dataset Twitter).
- Señales para estrategias cuantitativas: incorporación del sentimiento como feature en modelos de trading o de gestión de cartera, dado su ROC-AUC medio de 0,91 en los benchmarks publicados.
- Análisis de sentimiento en criptomonedas: clasificación de noticias y comentarios sobre activos digitales, uno de los dominios declarados por el autor.
- Enriquecimiento de pipelines de datos financieros: etiquetado automático de grandes volúmenes de documentos (informes, comunicados, transcripciones) para su posterior indexación o búsqueda semántica.
- Filtrado y priorización en herramientas de compliance y vigilancia de mercado: detección de comunicaciones con tono negativo o de riesgo para revisión humana posterior.
- Prototipado rápido en investigación: su tamaño reducido permite desplegarlo en portátiles y entornos sin GPU para experimentos de análisis de sentimiento financiero.

## Benchmarks y rendimiento

Resultados publicados en la model card (exactitud, F1, precisión, recall y ROC-AUC por dataset):

| Dataset | Modelo | Accuracy | F1 | Precision | Recall | ROC-AUC |
|---|---|---|---|---|---|---|
| FIQA | ModernFinBERT | 0,80 | 0,61 | 0,64 | 0,88 | 0,96 |
| FIQA | distilroberta_financial | 0,54 | 0,47 | 0,61 | 0,71 | 0,71 |
| FIQA | finbert | 0,48 | 0,43 | 0,59 | 0,66 | 0,76 |
| Twitter | ModernFinBERT | 0,71 | 0,70 | 0,68 | 0,81 | 0,94 |
| Twitter | distilroberta_financial | 0,75 | 0,71 | 0,68 | 0,75 | 0,87 |
| JeanBaptiste | ModernFinBERT | 0,74 | 0,58 | 0,71 | 0,56 | 0,84 |
| JeanBaptiste | distilroberta_financial | 0,88 | 0,79 | 0,92 | 0,74 | 0,86 |

Medias agregadas en los tres datasets:

| Modelo | Accuracy | F1 | Precision | Recall | ROC-AUC |
|---|---|---|---|---|---|
| ModernFinBERT | 0,75 | 0,63 | 0,68 | 0,75 | 0,91 |
| distilroberta_financial | 0,73 | 0,66 | 0,73 | 0,73 | 0,82 |
| finbert | 0,66 | 0,59 | 0,65 | 0,68 | 0,84 |
| finbert-tone | 0,62 | 0,54 | 0,68 | 0,59 | 0,82 |
| roberta_sentiment | 0,59 | 0,50 | 0,67 | 0,56 | 0,84 |

Los datos son los reportados por el autor; no se han verificado de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con pesos en fp32 (≈0,6 GB) cabe holgadamente en cualquier GPU con 2 GB o más. En fp16 el peso ronda los 0,3 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput, A100, H100 o L4; para desarrollo, RTX 4090, RTX 3090 o RTX 4060.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer actuales, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline), Text Embeddings Inference (TEI) de Hugging Face, ONNX Runtime, TorchServe o FastAPI con batching. No se documenta soporte nativo de vLLM o llama.cpp (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU con batching.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy media (3 datasets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernFinBERT | 149,6 M | no disponible (base ModernBERT: 8.192) | 0,75 | Apache 2.0 | Hugging Face |
| distilroberta_financial | no disponible | no disponible | 0,73 | no disponible | Hugging Face |
| finbert (ProsusAI) | no disponible | 512 | 0,66 | no disponible | Hugging Face |
| finbert-tone | no disponible | no disponible | 0,62 | no disponible | Hugging Face |
| roberta_sentiment | no disponible | no disponible | 0,59 | no disponible | Hugging Face |

ModernFinBERT lidera en exactitud media y ROC-AUC, mientras que distilroberta_financial obtiene mejor F1 y precisión medios y es claramente superior en el dataset JeanBaptiste (0,88 frente a 0,74 de exactitud).

## Limitaciones y advertencias

- Solo soporta inglés; no se han validado capacidades en otros idiomas.
- Es un clasificador de tres clases; no proporciona puntuaciones de intensidad del sentimiento ni explicaciones.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o con jerga financiera no vista en entrenamiento.
- El autor no documenta la composición exacta del dataset de entrenamiento ni el proceso de anotación, lo que dificulta evaluar sesgos de dominio o de etiquetado.
- Los benchmarks son los reportados por el propio autor; no consta validación independiente.
- El rendimiento cae en el dataset JeanBaptiste frente a distilroberta_financial, lo que sugiere que la superioridad no es uniforme entre dominios.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (answerdotai/ModernBERT-base) antes de desplegar en producción.
- No apto para generación de texto, agentes ni razonamiento; su uso debe limitarse a clasificación.
- El autor ofrece acceso a una API privada con modelos "más potentes" previo contacto, lo que implica que la versión pública puede no ser la de máximo rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabularisai/ModernFinBERT
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Sitio web de Tabularis AI: https://tabularis.ai
- LinkedIn: https://www.linkedin.com/company/tabularis-ai/
- X (Twitter): https://x.com/tabularis_ai
- GitHub: https://github.com/tabularis-ai
