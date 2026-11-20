# Virg1n/qwen3-website-news-classifier

## Resumen

El modelo `Virg1n/qwen3-website-news-classifier` es un clasificador binario de texto que predice si un sitio web publica noticias. Lo desarrolla el usuario Virg1n y se distribuye como un adaptador LoRA sobre el modelo base `Qwen/Qwen3-1.7B`, junto con una cabeza de clasificación personalizada, el tokenizador, código de calibración e inferencia. El repositorio no incluye los pesos completos del modelo base: el script descarga en el primer uso los pesos fijados de Qwen3-1.7B (aproximadamente 4 GB).

El problema que resuelve es acotado y operativo: dada una URL o una instantánea HTML local, el modelo analiza metadatos, encabezados, texto y estructura de la página para determinar si el sitio funciona como editor de noticias. La salida incluye una etiqueta (`news` o `not_news`), una probabilidad calibrada `p_news`, un nivel de confianza, y señales de revisión (`needs_review`, `review_reasons`) para predicciones inciertas, idiomas no soportados por la calibración o problemas de calidad de la página.

Es relevante por su enfoque práctico de clasificación de dominios web con un modelo pequeño (1.700 millones de parámetros) y ajuste eficiente mediante LoRA, lo que permite despliegue en CPU o GPU consumer. No obstante, la información pública disponible es muy limitada: no hay datos de entrenamiento, benchmarks ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA y cabeza de clasificación personalizada |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); tamaño del adaptador LoRA no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; la model card advierte que las puntuaciones en italiano y otros idiomas subrepresentados son aproximadas |
| Licencia | No disponible |
| Formato de pesos | Adaptador PEFT (LoRA) más tokenizador y código; los pesos base se descargan aparte desde Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El modelo se construye sobre `Qwen/Qwen3-1.7B`, un transformer decoder-only de la familia Qwen3 con 1.700 millones de parámetros. Sobre ese base se aplica un adaptador LoRA (librería `peft`) y se añade una cabeza de clasificación específica para la tarea binaria `news` / `not_news`. El pipeline declarado es `text-classification` y las etiquetas del repositorio incluyen `website-classification`, `news` y `qwen`.

El repositorio incluye además el tokenizador, el código de calibración y el script de inferencia (`predict_round2.py`). La decisión de clasificación utiliza un umbral seleccionado sobre el conjunto de validación, por lo que la etiqueta asignada puede diferir de la clase con mayor probabilidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. El script soporta ejecución en CUDA (selección automática si hay GPU y PyTorch compatible) y en CPU mediante la opción `--cpu`, y permite cargar los pesos base desde una ruta local con `--base-root`.

## Capacidades

- Clasificación binaria de sitios web: determina si una web funciona como editor de noticias (`news`) o no (`not_news`).
- Análisis de HTML: procesa metadatos, encabezados, texto y estructura de la página.
- Entrada por URL o por instantánea HTML local (útil cuando falla la descarga o el parseo).
- Salida con probabilidad calibrada (`p_news` entre 0 y 1) y nivel de confianza.
- Señales de revisión: `needs_review` y `review_reasons` para predicciones inciertas, idiomas no soportados por la calibración o problemas de calidad de página.
- Procesamiento por lotes de múltiples URLs en una sola invocación.
- Ejecución en GPU CUDA o CPU.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling ni agentes; el modelo está especializado exclusivamente en clasificación.

## Casos de uso

- Construcción de un directorio de medios: clasificar automáticamente un listado de dominios candidatos para separar sitios de noticias de otros tipos de web (blogs corporativos, tiendas, landing pages) antes de incluirlos en un agregador.
- Enriquecimiento de datasets de crawling: etiquetar grandes colecciones de URLs rastreadas para filtrar fuentes informativas y priorizar el análisis de contenido periodístico.
- Monitorización de fuentes para agregadores RSS: validar que una nueva fuente detectada publica realmente noticias antes de suscribirse a sus feeds.
- Moderación y curación de enlaces: en plataformas que permiten a usuarios enviar enlaces, usar `p_news` como señal para clasificar el tipo de contenido y aplicar políticas editoriales distintas.
- Investigación sobre ecosistema mediático: medir la proporción de sitios de noticias en un conjunto de dominios de un país o sector, usando la probabilidad calibrada como variable continua.
- Preprocesado en pipelines de análisis de contenido: descartar páginas que no son medios informativos antes de aplicar modelos más costosos de resumen, extracción de entidades o análisis de sesgo.
- Verificación de calidad en ingestión de datos: usar `needs_review` y `review_reasons` para enrutar a revisión humana las páginas con estructura atípica o idiomas no cubiertos por la calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base Qwen3-1.7B ocupa aproximadamente 4 GB en precisión original, y el adaptador LoRA añade una cantidad no especificada.
- GPU recomendadas: no se indican modelos concretos. El script selecciona CUDA automáticamente si hay una GPU NVIDIA y una instalación compatible de PyTorch.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo base (1.700 millones de parámetros), aunque no se documentan requisitos mínimos ni pruebas en tarjetas concretas.
- Opciones de despliegue: el repositorio proporciona su propio script de inferencia (`predict_round2.py`) con soporte de CPU (`--cpu`) y GPU, y carga local de pesos base (`--base-root`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La primera ejecución requiere conexión a internet para descargar los pesos base, salvo que se use una copia local.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el modelo base `Qwen/Qwen3-1.7B` es un transformer decoder-only de 1.700 millones de parámetros de la familia Qwen3, pero no se dispone de datos de rendimiento del adaptador ni de alternativas especializadas en clasificación de sitios web para establecer una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Virg1n/qwen3-website-news-classifier | 1.700 M (base) + LoRA | No disponible | Clasificación news / not_news | No disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | No disponible en esta ficha | Generación de texto general | No disponible en esta ficha | Hugging Face |
| Alternativas especializadas | No disponible | No disponible | Clasificación web | No disponible | No disponible |

## Limitaciones y advertencias

- La confianza del modelo no mide veracidad, credibilidad ni la propiedad de cuentas sociales enlazadas; solo estima si el sitio funciona como editor de noticias.
- Las puntuaciones en italiano y otros idiomas subrepresentados deben tratarse como aproximadas, según advierte la model card.
- Un error de descarga o de parseo deja el sitio sin clasificar; en ese caso hay que pasar una copia guardada del HTML de la página.
- El umbral de decisión se seleccionó sobre validación, por lo que la etiqueta puede no coincidir con la clase de mayor probabilidad; hay que interpretar `p_news` y `confidence` en conjunto.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo relevante para producción.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni evaluación de robustez frente a dominios atípicos.
- Riesgo de alucinación no aplicable en sentido estricto al ser clasificación, pero sí de falsos positivos y negativos en sitios con estructura ambigua o contenido mixto.
- El repositorio no incluye los pesos base; la primera ejecución requiere internet o una copia local, lo que añade una dependencia operativa.
- Requiere Python 3.11 o superior y las dependencias de `requirements.txt`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Virg1n/qwen3-website-news-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
