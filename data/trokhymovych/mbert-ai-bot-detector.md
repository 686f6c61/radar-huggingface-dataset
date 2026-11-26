# trokhymovych/mbert-ai-bot-detector

## Resumen

mbert-ai-bot-detector es un modelo de clasificación de secuencias basado en `google-bert/bert-base-multilingual-cased`, afinado por Mykola Trokhymovych y colaboradores para detectar texto generado por bots sociales impulsados por IA. Dado un texto de redes sociales, el modelo devuelve una probabilidad de que haya sido escrito por un bot (`LABEL_1`) o por una persona (`LABEL_0`). Está pensado para inferencia a nivel de usuario: se agregan las puntuaciones de múltiples textos (se recomiendan 20 o más) para decidir si una cuenta es automatizada.

El modelo resuelve un problema concreto y creciente: la detección de cuentas coordinadas que emplean LLM para generar contenido verosímil en múltiples idiomas. Frente a detectores clásicos basados en metadatos o heurísticas de comportamiento, este enfoque se apoya únicamente en el contenido lingüístico, lo que lo hace aplicable cuando no hay acceso a la API de la plataforma. Su relevancia actual radica en que el entrenamiento se hizo con datos generados de forma adversarial (imitación de persona), no con textos sintéticos triviales, lo que endurece la detección frente a bots que intentan pasar por humanos.

Arquitectura transformer encoder (BERT base multilingüe), 177,8 millones de parámetros, ventana de 512 tokens y licencia Apache-2.0. El repositorio ocupa 0,7 GB y los pesos están en safetensors. Está disponible en Hugging Face con 127 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe, `bert-base-multilingual-cased`) con cabeza de clasificación de secuencias binaria |
| Parámetros totales | 177.854.978 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncado recomendado en el pipeline de ejemplo) |
| Tipos de cuantización | No disponible (pesos safetensors en FP32/BF16 según el checkpoint; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Multilingüe (104 idiomas en el preentrenamiento de mBERT); afinado principalmente en ar, bg, ca, zh, en, fr, de, el, it, ja, ko, fa, pl, pt, ru, es, uk |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-multilingual-cased`, un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario cased multilingüe. Sobre la representación del token `[CLS]` se aplica una cabeza de clasificación lineal que produce dos logits (humano/bot). La tarea es clasificación binaria de secuencias cortas, orientada a publicaciones de redes sociales, no a documentos largos.

El detalle clave del entrenamiento es que los datos no provienen de textos generados de forma naïve, sino de un proceso de generación adversarial con condicionamiento de persona: se simulan cuentas con estilos, temas e idiomas coherentes para que el detector aprenda patrones de contenido generado que imita a humanos. La evaluación se realizó a nivel de usuario sobre el dataset Fox-8-23 (Zenodo), promediando las puntuaciones de los textos por cuenta, y el conjunto de evaluación no se usó en entrenamiento ni comparte plataforma (Twitter) con los datos de entrenamiento. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si hubo RLHF/DPO (no aplica a un clasificador).

## Capacidades

- Clasificación binaria de texto: probabilidad de que un texto haya sido generado por un bot de IA (`LABEL_1`) frente a escrito por un humano (`LABEL_0`).
- Detección multilingüe en 17 idiomas afinados explícitamente (árabe, búlgaro, catalán, chino, inglés, francés, alemán, griego, italiano, japonés, coreano, persa, polaco, portugués, ruso, español, ucraniano).
- Agregación a nivel de usuario: el pipeline de referencia calcula la media de puntuaciones sobre un conjunto de textos (recomendado ≥20) y aplica un umbral (0,4 recomendado sobre Fox-8-23).
- Procesamiento por lotes con ordenación por longitud para reducir el padding y mejorar el throughput.
- Integración con `transformers` pipeline y con Text Embeddings Inference (tag `text-embeddings-inference`), lo que permite despliegue como endpoint compatible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de plataformas sociales: puntuar publicaciones de una cuenta y agregar la media para marcar cuentas sospechosas de automatización antes de una revisión humana, usando el umbral de 0,4 calibrado sobre Fox-8-23.
- Análisis de campañas de desinformación: procesar lotes de publicaciones multilingües de una misma cuenta o red coordinada para estimar la proporción de contenido generado por IA y priorizar la investigación.
- Investigación académica en ciencias sociales computacionales: medir la prevalencia de bots generativos en un corpus histórico o en tiempo casi real, con una métrica reproducible (AUC a nivel de usuario) y sin depender de metadatos de la API.
- Filtrado previo en pipelines de curación de datos: descartar o marcar textos sintéticos de foros y redes antes de usarlos en entrenamiento de otros modelos, reduciendo contaminación por contenido generado.
- Monitorización de reputación de marca: detectar reseñas o comentarios automatizados coordinados sobre un producto en varios idiomas y agregarlos por autor para alertar al equipo de comunicación.
- Enriquecimiento de datasets de detección de bots: servir como etiquetador débil o segunda opinión junto a detectores basados en grafos (OSM-Det, Binocular) para construir conjuntos etiquetados a mayor escala.
- Sistemas de confianza en comunidades online: integrar el score a nivel de usuario en paneles de moderación de foros o Discord, con revisión humana obligatoria antes de cualquier sanción.

## Benchmarks y rendimiento

Evaluación a nivel de usuario sobre Fox-8-23 (AUC, media ± desviación):

| Modelo | AUC en Fox-8-23 |
|---|---|
| GEC score | 0,811 ± 0,009 |
| Binocular | 0,688 ± 0,011 |
| FastDetect | 0,672 ± 0,012 |
| OSM-Det | 0,861 ± 0,008 |
| mbert-ai-bot-detector | **0,989 ± 0,002** |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, ya que el modelo no es generativo. Tampoco se documentan métricas de precisión/recall a umbrales concretos más allá de la recomendación de 0,4.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 177,8 M de parámetros ocupan aproximadamente 0,7 GB de pesos; con activaciones y lote pequeño, cabe holgadamente en 2-4 GB de VRAM. En FP16/BF16 baja a unos 0,35 GB de pesos.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM sirve; para lotes grandes (BATCH_SIZE=128 en el ejemplo) conviene una A100, H100, L40S o RTX 4090. Una T4 o RTX 3060 es suficiente para uso moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares; también en CPU para volúmenes pequeños.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (TEI), endpoints compatibles de Hugging Face; también es viable exportarlo a ONNX o cuantizarlo a INT8 para CPU.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamaño del modelo, en una GPU moderna se esperan miles de textos por segundo con lotes de 128 y truncado a 512 tokens; en CPU, del orden de decenas a cientos por segundo según núcleos. Estas cifras son estimaciones, no medidas publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | AUC Fox-8-23 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mbert-ai-bot-detector | Clasificador BERT multilingüe | 177,8 M | 512 tokens | 0,989 ± 0,002 | Apache-2.0 | Hugging Face |
| OSM-Det | Detector de bots (grafo/comportamiento) | No disponible | No aplica | 0,861 ± 0,008 | No disponible | Referenciado en el paper |
| Binocular | Detector de bots (comportamiento) | No disponible | No aplica | 0,688 ± 0,011 | No disponible | Referenciado en el paper |
| FastDetect | Detector de bots | No disponible | No aplica | 0,672 ± 0,012 | No disponible | Referenciado en el paper |
| GEC score | Métrica de detección | No aplica | No aplica | 0,811 ± 0,009 | No disponible | Referenciado en el paper |

Los competidores son detectores clásicos basados en comportamiento o grafos, no clasificadores de contenido puros; la comparación es válida porque todos se evalúan sobre el mismo dataset a nivel de usuario. No se dispone de datos de parámetros ni licencia de los tres detectores de referencia en la información proporcionada.

## Limitaciones y advertencias

- Las predicciones sobre un único texto son poco fiables; el autor recomienda explícitamente la agregación sobre ≥20 textos por usuario.
- El rendimiento puede degradarse en idiomas infrarrepresentados en el preentrenamiento de mBERT, aunque el modelo se afinó en 17 idiomas.
- La detección de bots es un problema adversarial: bots más sofisticados o con prompts adaptados pueden evadir el detector, y el modelo refleja los patrones de su generación adversarial de entrenamiento.
- Riesgo de falsos positivos sobre poblaciones o estilos de escritura no representados en los datos de entrenamiento (por ejemplo, hablantes no nativos, jerga específica o registros muy formales).
- Fuera de alcance: documentos largos (optimizado para publicaciones cortas), decisiones legales o de moderación sin revisión humana, e idiomas muy poco representados.
- El umbral de 0,4 está calibrado sobre Fox-8-23; debe recalibrarse con precisión/recall sobre el dominio objetivo antes de desplegar.
- Licencia Apache-2.0 permite uso comercial, pero no exime de las obligaciones de revisión humana en decisiones de moderación y de las normativas aplicables (por ejemplo, RGPD si se procesan datos personales de cuentas).
- No se documentan sesgos demográficos específicos ni auditorías de equidad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trokhymovych/mbert-ai-bot-detector
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
- Dataset Fox-8-23 (Zenodo): https://zenodo.org/records/8035290
- Paper (CIKM '26): https://doi.org/10.1145/3799682.3841070
- Repositorio de Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
