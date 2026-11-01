# x6nux/laya-ad

## Resumen

laya-ad v2.2 es un modelo de clasificación de texto especializado en la detección de publicidad no deseada, spam y contenido fraudulento en chino. Lo desarrolla el usuario x6nux y se construye mediante fine-tuning del modelo base convaiinnovations/laya-multilingual, un encoder de la familia ModernBERT/mmBERT con 322M de parámetros publicado bajo licencia Apache-2.0. El modelo resuelve un problema concreto de moderación: no solo decide si un mensaje es publicidad, sino que clasifica simultáneamente su tipo, su alcance (cuenta o mensaje) y su gravedad.

Técnicamente es un encoder transformer con un tronco compartido y cuatro cabezas de clasificación que se ejecutan en un único pase hacia delante: una binaria (ad/normal), una de siete clases de tipo de anuncio, una de alcance (account/message) y una de severidad ordinal de 0 a 3. El modelo completo suma 309,3M de parámetros y se distribuye en seis precisiones distintas (fp32, fp16, bf16, fp8, int8, int4) dentro de un repositorio de 13 GB.

Su relevancia es acotada pero específica: la versión 2.2 incorpora 880 muestras de texto promocional procedentes de cuentas realmente baneadas, lo que mejora de forma medible las métricas en los conjuntos de validación más grandes respecto a la versión 2.1. Está pensado para pipelines de moderación en plataformas de chat en chino, no como modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT) con tronco compartido y cuatro cabezas de clasificación |
| Parametros totales | 309,3M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; se recomienda `max_length` de 384 tokens para inferencia |
| Tipos de cuantizacion | fp32, fp16, bf16, fp8, int8, int4 (incluidas como subdirectorios del repo) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con scripts de carga en `code/scripts/`) |

## Arquitectura y entrenamiento

El modelo sigue un esquema multi-tarea con encoder compartido. El texto pasa por el encoder ModernBERT de 322M parámetros y de su representación se derivan cuatro cabezas: binaria (`ad`/`normal`), de tipo (7 clases: `crypto`, `gambling`, `porn`, `porn_bait`, `promo`, `scam`, `spam_flood`), de alcance (`account`/`message`) y de severidad (0–3, con salida expresada como puntuación esperada Σi·pᵢ). Las cabezas de alcance y severidad se entrenan únicamente sobre muestras publicitarias, mientras que la decisión de si algo es anuncio queda delegada a la cabeza binaria.

El entrenamiento combina una pérdida binaria ponderada con sobremuestreo de la clase publicitaria hasta el 22,4 % del conjunto, y ponderación por clase en las cabezas de tipo y severidad. La versión 2.2 añade al conjunto de entrenamiento 880 muestras de texto promocional extraídas de cuentas realmente baneadas (etiquetadas con un modelo profesor denominado jev-1.13), de las cuales 752 entran en el pool de entrenamiento y 128 se reservan como conjunto de test independiente. No se documenta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO; el modelo es un encoder de clasificación, no un modelo generativo.

## Capacidades

- Clasificación binaria de publicidad: distingue entre mensaje publicitario (`ad`) y normal (`normal`).
- Clasificación fina en siete categorías de anuncio: criptomonedas, apuestas, pornografía, cebo pornográfico, promoción comercial, estafa y flood de spam.
- Distinción de alcance: identifica si la cuenta en sí es publicitaria (`account`) o si solo el mensaje lo es (`message`), lo que orienta la acción de moderación (banear cuenta o borrar mensaje).
- Puntuación de severidad ordinal de 0 a 3 (inocuo, promoción leve, tráfico claro, estafa/pornografía explícita/flood masivo).
- Inferencia en un único pase hacia delante con las cuatro salidas simultáneas.
- Soporte de cuantización hasta int4 para despliegue en CPU o entornos con poca memoria.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es un clasificador de texto.
- Capacidad multilingüe limitada al chino según la model card.

## Casos de uso

- Moderación de chats y comunidades en chino: el modelo puede filtrar en tiempo real los mensajes de un canal y decidir si se eliminan, usando la cabeza binaria como puerta y la de tipo para enrutar la política de actuación.
- Detección de cuentas publicitarias persistentes: la cabeza de alcance permite distinguir cuentas dedicadas a la promoción (`account`) de mensajes aislados, lo que habilita el baneo de la cuenta frente al simple borrado del mensaje.
- Priorización de revisiones por gravedad: la puntuación de severidad 0–3 permite ordenar la cola de moderación humana, enviando primero los casos con severidad 3 (estafas, pornografía explícita, flood masivo).
- Filtrado de spam en foros y secciones de comentarios: con 309M de parámetros y variantes int8/int4 de ~295 MB y ~157 MB, puede desplegarse en CPU para prefiltrar grandes volúmenes antes de un clasificador más costoso.
- Detección de estafas financieras y esquemas piramidales: la clase `scam` y la severidad alta cubren los textos de captación con promesas de ingresos, útiles en plataformas de mensajería.
- Cumplimiento y reporte regulatorio: la clasificación por tipo (`crypto`, `gambling`, `porn`, etc.) permite generar estadísticas agregadas de contenido retirado por categoría para informes de cumplimiento.
- Enrutado a políticas diferenciadas: la combinación tipo + alcance + severidad permite aplicar reglas distintas (por ejemplo, bloquear automáticamente `scam` con severidad 3 y enviar `promo` con severidad 1 a revisión).

## Benchmarks y rendimiento

Resultados publicados en la model card. Cada conjunto de test tiene una fuente de etiquetas distinta (modelo profesor o modelo de producción previo), por lo que los valores representan la concordancia con esas etiquetas y no una precisión absoluta frente a anotación humana.

| Metrica | teacher holdout (2.732; 64 ads) | earlier val (2.927; 685 ads) | gmeow_val128 (128 ads) |
|---|---:|---:|---:|
| Exactitud binaria | 98,87 % | 96,99 % | 96,88 % |
| F1 de publicidad | 0,735 | 0,937 | 0,984 |
| Exactitud de tipo / core-F1 | 77,59 % / 0,695 | 95,47 % / 0,923 | 79,69 % / 0,825 |
| Exactitud de alcance (sobre ads) | 93,75 % | 96,08 % | 94,53 % |
| MAE de severidad esperada (0–3) | 0,352 | 0,476 | 0,122 |

Comparación v2.1 frente a v2.2 en bf16:

| Test | Metrica | v2.1 | v2.2 |
|---|---|--:|--:|
| earlier val | Exactitud binaria | 96,34 % | 97,03 % |
| earlier val | F1 de publicidad | 0,926 | 0,938 |
| earlier val | Exactitud de tipo | 91,37 % | 95,47 % |
| earlier val | MAE de severidad | 0,534 | 0,475 |
| gmeow_val128 | F1 de publicidad | 0,980 | 0,984 |
| gmeow_val128 | Exactitud de tipo | 67,19 % | 79,69 % |
| gmeow_val128 | Exactitud de alcance | 64,84 % | 94,53 % |
| gmeow_val128 | MAE de severidad | 0,269 | 0,122 |
| teacher holdout | Exactitud binaria | 99,16 % | 98,87 % |
| teacher holdout | F1 de publicidad | 0,803 | 0,735 |
| teacher holdout | Exactitud de tipo | 86,21 % | 75,86 % |

Rendimiento por variante de precisión (teacher holdout):

| Subdirectorio | Exactitud binaria | F1 de publicidad | Exactitud de tipo / core-F1 | Alcance | MAE severidad | Concordancia con fp32 (binaria/tipo) | Tamano |
|---|---:|---:|---:|---:|---:|---:|---:|
| `fp32/` | 98,87 % | 0,735 | 77,59 % / 0,695 | 93,75 % | 0,352 | — | 1180 MB |
| `fp16/` | 98,87 % | 0,735 | 75,86 % / 0,691 | 93,75 % | 0,351 | 100,00 % / 98,28 % | 590 MB |
| `bf16/` | 98,87 % | 0,735 | 75,86 % / 0,691 | 93,75 % | 0,352 | 100,00 % / 98,28 % | 590 MB |
| `fp8/` | 98,87 % | 0,748 | 75,86 % / 0,692 | 93,75 % | 0,358 | 99,63 % / 98,28 % | 295 MB |
| `int8/` | 98,76 % | 0,721 | 75,86 % / 0,691 | 93,75 % | 0,352 | 99,82 % / 98,28 % | 296 MB |
| `int4/` | 98,50 % | 0,692 | 74,14 % / 0,669 | 90,62 % | 0,324 | 99,05 % / 91,38 % | 157 MB |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,2 GB en fp32, 590 MB en fp16/bf16, ~295 MB en fp8/int8 y ~157 MB en int4, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para este modelo, que se beneficia más del batching que de la potencia por muestra.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, GTX 1660, etc.) e incluso en CPU para las variantes int8/int4.
- Opciones de despliegue: la model card proporciona scripts propios de carga (`code/scripts/dual_head_model.py`) sobre `transformers`; al ser un encoder de clasificación estándar, es compatible con servidores de inferencia tipo TGI o batching con `transformers`, aunque no se documentan integraciones específicas con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| laya-ad v2.2 | 309,3M | No disponible (recomendado 384 tokens) | Clasificación multi-cabeza de publicidad en chino | Apache-2.0 | HuggingFace (x6nux/laya-ad) |
| convaiinnovations/laya-multilingual | 322M | No disponible | Encoder base multilingüe (modelo del que deriva) | Apache-2.0 | HuggingFace |
| ModernBERT base | ~149M | Hasta 8.192 tokens (según la familia ModernBERT) | Encoder de propósito general | Apache-2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos con otros clasificadores de spam o publicidad en chino en la información proporcionada.

## Limitaciones y advertencias

- Las métricas publicadas se calculan frente a etiquetas generadas por modelos (profesor jev-1.13 o modelo de producción v1), no por anotación humana; representan concordancia con esas etiquetas, no precisión absoluta.
- El modelo solo está entrenado y evaluado en chino; su uso en otros idiomas no está soportado ni validado.
- La cabeza de tipo tiene un rendimiento notablemente más bajo en el conjunto teacher holdout (77,59 % de exactitud, core-F1 0,695) y en gmeow_val128 (79,69 %), lo que sugiere sensibilidad a la distribución de los datos.
- La variante int4 degrada la clasificación fina de tipo (concordancia con fp32 del 91,38 % y exactitud de tipo de 92,11 % en earlier val); para escenarios sensibles al subtipo debe usarse bf16, fp16 o fp32.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos: la F1 de publicidad en el conjunto con menos muestras positivas cae a 0,735.
- No se documentan sesgos específicos ni análisis de equidad; al tratarse de un clasificador de contenido en chino, puede heredar sesgos de los datos de entrenamiento y del modelo profesor.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni se documenta un proceso de auditoría externa.
- El repositorio pesa 13 GB porque incluye las seis precisiones; conviene descargar solo el subdirectorio necesario mediante `allow_patterns`.
- La carga requiere los scripts personalizados del repositorio (`dual_head_model`), no un `AutoModelForSequenceClassification` estándar, lo que añade fricción de integración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/x6nux/laya-ad
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
