# xzael24/indobert-sentiment-app-reviews

## Resumen

IndoBERT Sentiment App Reviews es un modelo de clasificación de sentimiento binario (negativo/positivo) para reseñas de aplicaciones en indonesio. Lo desarrolla el usuario xzael24 como parte de un ejercicio práctico de transfer learning, y consiste en un fine-tuning del modelo base `indolem/indobert-base-uncased`, un BERT base entrenado específicamente para indonesio por el proyecto IndoLEM.

El modelo resuelve un problema acotado pero útil: clasificar automáticamente reseñas de Google Play Store en dos polaridades, derivando las etiquetas de las calificaciones por estrellas (1 estrella = negativo, 5 estrellas = positivo, descartando las intermedias). Se entrenó sobre reseñas de dos aplicaciones concretas, ClassDojo (educación infantil) y PrimaKu (seguimiento de embarazo y crecimiento infantil), con un total de 1.378 reseñas únicas tras el proceso de limpieza y deduplicación.

Es relevante como ejemplo reproducible de un pipeline completo de clasificación de sentimiento en un idioma de recursos limitados como el indonesio, con documentación detallada del proceso de limpieza, partición de datos y evaluación. No obstante, su alcance es muy restringido: dos aplicaciones, dos clases y un conjunto de test de solo 138 ejemplos, por lo que debe tratarse como un modelo experimental y no como una solución de producción generalizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), fine-tuning de `indolem/indobert-base-uncased` |
| Parametros totales | 110.559.746 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento, padding dinámico) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 0,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estándar (encoder transformer bidireccional) heredado de `indolem/indobert-base-uncased`, con una cabeza de clasificación de dos etiquetas superpuesta durante el fine-tuning. El entrenamiento se realizó con learning rate 2e-5 y scheduler lineal, batch size 16 en entrenamiento y 32 en evaluación, hasta 5 épocas con early stopping (paciencia 2), warmup del 10% de los pasos totales, weight decay 0,01, longitud máxima de 256 tokens con padding dinámico, pérdida de entropía cruzada ponderada por clase (peso 1,234 para negativo y 0,841 para positivo) para compensar el desbalance, precisión FP16 y semilla 42. El entrenamiento completo llevó aproximadamente 2 minutos en una GPU de Google Colab.

Los datos provienen de scraping de Google Play Store (idioma `id`, país `id`, orden por más recientes) mediante `google-play-scraper`, conservando solo reseñas de 1 y 5 estrellas. Tras eliminar textos vacíos, `reviewId` duplicados y textos duplicados, el conjunto final quedó en 1.378 reseñas (559 negativas, 819 positivas), divididas 80/10/10 de forma estratificada por combinación de aplicación y etiqueta: 1.103 de entrenamiento, 137 de validación y 138 de test. El preprocesado incluyó eliminación de URL, menciones y símbolos, normalización de letras repetidas y de jerga, conservando los signos `. , ! ?`. Los pesos guardados corresponden a la época 3, la de menor pérdida de validación (0,229).

## Capacidades

- Clasificación de sentimiento binaria (negativo/positivo) de texto en indonesio.
- Especialización en reseñas de aplicaciones móviles de Google Play Store.
- Inferencia mediante `pipeline("text-classification")` de la librería transformers.
- Compatible con Text Embeddings Inference y endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de razonamiento (thinking mode).
- No procesa visión ni audio.
- Capacidad multilingüe limitada: entrenado solo en indonesio; las reseñas en inglés se identifican como fuente de error.

## Casos de uso

- Monitorización de opiniones en Google Play: clasificar en lote las reseñas nuevas de una aplicación en indonesio para separar quejas de elogios y priorizar la respuesta del equipo de soporte.
- Alertas tempranas de regresiones: detectar picos de reseñas negativas tras un despliegue, usando la salida del clasificador como señal para revisar la versión recién publicada.
- Análisis exploratorio de mercado: procesar reseñas de aplicaciones competidoras del mismo nicho (educación infantil o salud maternoinfantil) para comparar la proporción de sentimiento negativo entre productos.
- Enrutamiento de tickets: integrar el clasificador como primer filtro en un sistema de atención al cliente que dirija las reseñas negativas a un equipo especializado y las positivas a un módulo de recopilación de testimonios.
- Investigación académica y docencia: servir como referencia reproducible de un pipeline de fine-tuning de IndoBERT con partición estratificada, ponderación de clases y análisis de errores documentado, útil en cursos de NLP.
- Extracción de métricas de producto: agregar el sentimiento por aplicación y por período temporal para construir paneles de calidad percibida que complementen las calificaciones medias por estrellas.
- Filtrado previo en pipelines de datos: descartar o etiquetar reseñas positivas antes de un análisis manual más costoso, reduciendo el volumen que revisa un analista humano.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test (n = 138):

| Metrica | Valor |
|---|---|
| Accuracy (test) | 0,9275 (128/138) |
| Intervalo de confianza 95% (Wilson) | 87,2% – 96,0% |
| Macro F1 (test) | 0,9253 |
| Accuracy (validación) | 0,9489 |
| Accuracy (train) | 0,9538 |

Desglose por clase en test:

| Clase | Precision | Recall | F1 | Ejemplos |
|---|---|---|---|---|
| Negativo | 0,8966 | 0,9286 | 0,9123 | 56 |
| Positivo | 0,9500 | 0,9268 | 0,9383 | 82 |

Desglose por aplicación en test:

| Aplicacion | Negativo correctos | Positivo correctos |
|---|---|---|
| ClassDojo | 7/8 | 16/17 |
| PrimaKu | 45/48 | 60/65 |

El autor advierte que dos ejecuciones del mismo notebook con la misma semilla dieron 88,4% y 92,75% de accuracy en test, por lo que el rendimiento real debe considerarse en el rango del 88% al 93%. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,25 GB de pesos más activaciones; en la práctica, menos de 1 GB para lotes pequeños con longitud 256.
- VRAM estimada en FP32: alrededor de 0,45 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para uso puntual basta una T4 o una GPU integrada.
- Opciones de despliegue: `transformers` con `pipeline`, Text Embeddings Inference (soporte declarado en los tags), endpoints de Hugging Face, y exportación a ONNX para inferencia optimizada.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento completo requirió unos 2 minutos en una GPU de Colab, lo que sugiere una inferencia del orden de milisegundos por ejemplo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| xzael24/indobert-sentiment-app-reviews | 110,6 M | 256 tokens | Indonesio | MIT | Clasificación binaria de reseñas de apps |
| indolem/indobert-base-uncased | 110,6 M (aprox.) | 512 tokens (BERT base estándar) | Indonesio | No disponible en la información proporcionada | Modelo base preentrenado, sin cabeza de clasificación |
| Modelos de sentimiento multilingües basados en XLM-R | No disponible | No disponible | Multilingüe | No disponible | Clasificación de sentimiento genérica |

La comparación directa con alternativas específicas para indonesio no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la cabeza de clasificación y el ajuste fino sobre un dominio concreto; frente a clasificadores multilingües genéricos, la ventaja esperada es la especialización en jerga y registro de reseñas de apps indonesias, aunque no se aportan métricas comparativas que lo confirmen.

## Limitaciones y advertencias

- Conjunto de datos pequeño (1.378 reseñas únicas) y limitado a dos aplicaciones de nichos concretos (educación infantil y salud maternoinfantil); el rendimiento en otras aplicaciones o dominios no se ha evaluado.
- Etiquetas derivadas automáticamente de las calificaciones por estrellas, no de anotación manual, lo que introduce ruido y desajustes entre texto y etiqueta.
- Solo dos clases: las reseñas neutras (2 a 4 estrellas) no se entrenaron y serán forzadas a negativo o positivo.
- Evaluación únicamente dentro del mismo dominio; no hay pruebas cruzadas entre aplicaciones, por lo que la generalización es desconocida.
- El conjunto de test tiene solo 138 ejemplos y el rendimiento varía entre ejecuciones (88,4% a 92,75%), por lo que un único número no es fiable.
- Las reseñas sarcásticas, con mezcla de idiomas o en inglés se clasifican mal con frecuencia.
- El preprocesado es parte del contrato del modelo: sin una limpieza similar (eliminación de URL, normalización de jerga y letras repetidas), el rendimiento puede degradarse.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas en textos ambiguos.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base `indolem/indobert-base-uncased` antes de un despliegue comercial.
- El modelo se creó como parte de un práctico académico y no está pensado como componente crítico de producción sin una reevaluación sobre datos propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xzael24/indobert-sentiment-app-reviews
- Modelo base: https://huggingface.co/indolem/indobert-base-uncased
- Paper de IndoBERT e IndoLEM (Koto et al., 2020): no disponible enlace directo en la información proporcionada
- Repositorio o demo adicional: no disponible
