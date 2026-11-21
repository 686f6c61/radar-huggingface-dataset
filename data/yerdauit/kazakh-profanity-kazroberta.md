# Yerdauit/kazakh-profanity-kazroberta

## Resumen

El modelo `Yerdauit/kazakh-profanity-kazroberta` es un clasificador binario de texto especializado en detectar lenguaje soez en contenidos escritos en kazajo con mezcla de ruso. Lo desarrolla el usuario Yerdauit y está construido mediante fine-tuning del modelo base `kz-transformers/kaz-roberta-conversational`, un RoBERTa de aproximadamente 83 millones de parámetros adaptado al kazajo.

El problema que resuelve es concreto: la moderación de reseñas de productos, aplicaciones, lugares y libros en entornos kazajoparlantes, donde la alternancia de código kazajo-ruso y las ofuscaciones tipográficas complican los filtros basados en listas de palabras. El modelo clasifica cada texto con una probabilidad de contener obscenidades, insultos vulgares o mat ruso incrustado en texto kazajo, distinguiendo reseñas negativas pero limpias.

Es relevante ahora porque la mayoría de los sistemas de moderación disponibles están entrenados para inglés o para ruso estándar, y el kazajo queda desatendido. Este clasificador ofrece umbrales calibrados sobre validación, una política de moderación de dos niveles y métricas publicadas sobre un conjunto de test retenido, lo que permite integrarlo en pipelines de moderación con una lógica operativa definida en lugar de depender de un simple punto de corte arbitrario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) para clasificación de secuencia |
| Parametros totales | 83.452.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; la inferencia truncada de ejemplo usa max_length=128 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kk (kazajo), ru (ruso); entrenado sobre texto kazajo con mat ruso incrustado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa con cabeza de clasificación binaria (`AutoModelForSequenceClassification`), derivado de `kz-transformers/kaz-roberta-conversational` (83 M de parámetros). El fine-tuning se realizó durante 4 épocas, seleccionándose la época 4 como mejor checkpoint según validación. El umbral de decisión óptimo, 0.987, se eligió maximizando F1 sobre validación y se almacena en `inference_config.json`.

Los datos de entrenamiento provienen de KazSAnDRA (reseñas de productos, aplicaciones, lugares y libros). La preprocesización incluye anonimización, conversión a minúsculas y colapso de tres o más caracteres repetidos consecutivos a dos. Para textos largos, el script de referencia aplica ventanas deslizantes. Las etiquetas de los datos extendidos son semiautomáticas: combinación de léxico y acuerdo entre modelos, con revisión manual de los desacuerdos. La model card no detalla el volumen total de tokens ni si hubo RLHF/DPO; al tratarse de un clasificador, el entrenamiento supervisado con etiquetas binarias es el mecanismo principal.

## Capacidades

- Clasificación binaria de texto: salida `1` (contiene obscenidades) o `0` (sin obscenidades, incluidas reseñas negativas pero limpias).
- Detección de palabras obscenas kazajas, mat ruso incrustado en texto kazajo e insultos vulgares dirigidos a alguien.
- Robustez parcial frente a ofuscaciones: máscaras con `*`, cambio a script latino, intercambios de teclado y estiramiento de caracteres; F1 de 0.9172 en el test ofuscado frente a 0.9583 en el test estándar.
- Política de moderación de dos umbrales integrada: auto-ocultar por encima de 0.9996, revisión humana entre 0.0118 y 0.9996, publicar por debajo de 0.0118.
- Explicabilidad mediante el script `predict.py`, que muestra qué palabras impulsaron la predicción.
- Manejo de textos largos mediante ventanas deslizantes en el pipeline recomendado.
- No dispone de generación de texto, tool calling, capacidades de agente, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Moderación de reseñas de producto en marketplaces kazajos: el modelo clasifica reseñas de texto corto con la política de dos umbrales, auto-ocultando el 84,96 % de las obscenas y enviando a revisión humana el 12,41 % restante, con solo un 0,39 % de reseñas limpias auto-ocultadas.
- Filtrado previo de reseñas de aplicaciones móviles: al estar entrenado sobre reseñas de apps, detecta mat ruso incrustado en comentarios kazajos que los filtros por lista de palabras pasarían por alto.
- Enrutamiento a cola de moderación humana: los textos con probabilidad entre 0.0118 y 0.9996 se derivan a revisores, reduciendo la carga manual al concentrar la incertidumbre en una franja acotada.
- Detección de insultos dirigidos en reseñas de lugares y libros: el modelo distingue reseñas negativas limpias de insultos vulgares dirigidos a personas, evitando penalizar críticas legítimas.
- Análisis de toxicidad en corpus de investigación: permite etiquetar grandes volúmenes de reseñas kazajas para estudios de lenguaje soez con métricas de precisión y recall conocidas (0.9849 y 0.9332).
- Filtro de segunda capa tras moderación basada en reglas: combinado con listas léxicas, cubre ofuscaciones tipográficas como máscaras con `*` o sustituciones de teclado con F1 de 0.9172 en el test ofuscado.
- Moderación de comentarios en plataformas con audiencia mixta kazajo-rusa: el modelo está entrenado para texto kazajo que incorpora mat ruso, cubriendo la alternancia de código habitual en estos entornos.

## Benchmarks y rendimiento

Resultados sobre test retenido (n = 930, 419 obscenos), clase 1:

| Metrica | Valor |
|---|---|
| Precision | 0.9849 |
| Recall | 0.9332 |
| F1 | 0.9583 |
| Matriz de confusion | TN 505 · FP 6 · FN 28 · TP 391 |
| F1 en test ofuscado (`*`, script latino, teclado, estiramiento) | 0.9172 |
| Tasa de falsos positivos sobre 2999 reseñas ordinarias | 0.009 (reseñas Kaspi: 0 / 1500) |

Rendimiento de la política de moderación de dos umbrales sobre test:

| Probabilidad | Accion | Obscenos | Limpios |
|---|---|---|---|
| ≥ 0.9996 | Auto-ocultar | 84,96 % | 0,39 % |
| 0.0118 – 0.9996 | Revision humana | 12,41 % | 7,63 % |
| < 0.0118 | Publicar | 2,63 % se escapan | — |

## Requisitos de hardware

- VRAM estimada: un modelo de 83 M de parámetros en safetensors ocupa aproximadamente 0,33 GB en fp32; en fp16 ronda los 0,17 GB, más activaciones y overhead del runtime. Cualquier GPU consumer con 4 GB o más lo ejecuta con holgura.
- GPU recomendadas: innecesarias para uso individual; funciona en CPU para volúmenes moderados. Para throughput alto, una T4, L4 o incluso una RTX 3060 es suficiente.
- Cabe en cualquier GPU consumer, incluidas integradas con memoria compartida suficiente, y en CPU.
- Opciones de despliegue: `transformers` con PyTorch (uso mínimo documentado), pipeline de clasificación de Hugging Face; el repositorio recomenda clonar el repo de GitHub y usar `predict.py`, que aplica preprocesización completa, ventanas deslizantes y política de moderación. vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 83 M, la latencia por texto corto en GPU es del orden de milisegundos, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de moderación alternativos en la información disponible. Como referencia estructural, el modelo base `kz-transformers/kaz-roberta-conversational` (83 M de parámetros, licencia no disponible en esta ficha) es un modelo de conversación kazajo, no un clasificador, por lo que no es directamente comparable en la tarea. Clasificadores multilingües de toxicidad como los de la familia XLM-R no aparecen evaluados en la model card, de modo que la comparativa de rendimiento queda como no disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yerdauit/kazakh-profanity-kazroberta | 83 M | no disponible (truncado a 128 en el ejemplo) | Clasificación binaria de obscenidades kk/ru | apache-2.0 | Hugging Face |
| kz-transformers/kaz-roberta-conversational | 83 M | no disponible | Modelo base conversacional kk | no disponible | Hugging Face |
| Alternativas multilingües de toxicidad | no disponible | no disponible | Clasificación de toxicidad | no disponible | no evaluadas en la model card |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre reseñas de producto, aplicación, lugar y libro (KazSAnDRA); dominios como redes sociales o chats no están testeados y su rendimiento allí es desconocido.
- Rendimiento inferior en ofuscaciones con dígitos y símbolos (`қ0т@қ`) y en kazajo escrito en script latino que en cirílico plano.
- Reacciona ocasionalmente a palabras coloquiales rusas en comentarios por lo demás limpios; los casos inciertos deben derivarse a revisión humana.
- Las etiquetas de los datos extendidos son semiautomáticas (léxico más acuerdo entre modelos, con revisión manual de desacuerdos), lo que introduce ruido potencial en el entrenamiento.
- El 2,63 % de los comentarios obscenos del test se escapan con la política de publicación por debajo de 0.0118; no es un filtro de cobertura total.
- El uso mínimo con `transformers` no aplica anonimización ni ventanas deslizantes, por lo que difiere del pipeline de entrenamiento; para resultados fieles a las métricas publicadas debe usarse `predict.py`.
- Licencia apache-2.0: permite uso comercial con atribución y sin garantías; conviene verificar los términos del modelo base `kz-transformers/kaz-roberta-conversational`, cuya licencia no se detalla en esta ficha.
- No hay datos publicados sobre sesgos demográficos, latencia en producción ni comportamiento con entradas muy largas fuera de las ventanas deslizantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yerdauit/kazakh-profanity-kazroberta
- Modelo base: https://huggingface.co/kz-transformers/kaz-roberta-conversational
- Repositorio con código, datos, reglas de etiquetado y evaluación completa: https://github.com/Erdauit/kazakh-profanity-detection
