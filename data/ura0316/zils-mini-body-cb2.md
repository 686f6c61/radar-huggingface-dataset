# Ura0316/zils-mini-body-cb2

## Resumen

zils-mini-body-cb2 es un modelo de 4.539.265.536 parámetros publicado por el usuario Ura0316 en Hugging Face, concebido como un "body" (cuerpo de pesos) para el pool de modelos `d3-mini` de Zils, un proyecto asociado a la subred 127 de Bittensor. No se trata de un modelo autónomo listo para usar: el repositorio contiene únicamente los pesos de lenguaje y visión en el formato de chasis del pool (723 tensores en bfloat16), mientras que la capa de respuesta, el prompt y el runtime provienen del chasis fijado del pool. Esto implica que su uso requiere el ecosistema Zils para funcionar correctamente.

El modelo se construyó mediante un proceso de model soup (promediado uniforme de pesos) sobre cuatro modelos base de la familia "house": torchcast-ai/torchcast-decision-4b, vllm-sr/d3-mini, perplexity-ai/pplx-decider-flash-v1.2 y Maincode/Matilda-Decision-v1-Mini. Sobre dos mezclas de partida se entrenaron adaptadores LoRA de rango 64 en las proyecciones de atención y MLP durante una época, que posteriormente se fusionaron en los pesos. El resultado es el promedio uniforme de ambos fine-tunes fusionados.

La relevancia del modelo es acotada y muy específica: está diseñado para tareas de decisión en formato de examen (preguntas de opción múltiple, razonamiento sobre opciones, clasificación), y su licencia Apache-2.0 facilita su reutilización. Sin embargo, la ausencia de benchmarks publicados, de idiomas declarados y de una model card convencional limita seriamente su evaluación por parte de desarrolladores e investigadores que no formen parte del ecosistema Zils.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-4B según la model card); detalles específicos no disponibles |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (723 tensores, bfloat16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer derivado de Qwen/Qwen3.5-4B, según indica la model card al señalar que los cuatro cuerpos "house" y su base son Apache-2.0. El repositorio contiene 723 tensores en bfloat16 correspondientes a los pesos de lenguaje y visión en el layout de chasis del pool Zils. No se especifican detalles sobre el número de capas, dimensiones ocultas, mecanismos de atención ni si incorpora innovaciones como decodificación especulativa o atención lineal.

El entrenamiento se realizó en dos fases. Primero se construyeron dos "starts" mediante promediado uniforme de pesos: el primero combinando torchcast-decision-4b (commit 492bfb19) y d3-mini (commit df99bf4c); el segundo combinando torchcast-decision-4b, pplx-decider-flash-v1.2 (commit 9ff7cf98), d3-mini y Matilda-Decision-v1-Mini (commit 39479a8a). Sobre cada start se entrenó un adaptador LoRA de rango 64 en las proyecciones de atención y MLP durante una época, con una función de pérdida que combina entropía cruzada suave hacia la distribución objetivo de cada ítem y un término de Brier hacia la clave del ítem. Los datos de entrenamiento son ítems de decisión en formato de examen: ítems previos y nuevos generados por Qwen/Qwen3.8-27B usando filas de datasets públicos como semillas de estilo (PIQA, Crisscrossed Captions, GSM8K, SVAMP, CosmosQA, StrategyQA, ROPES, ReClor, COPA, WiC, SciNLI, SQuAD 2.0, TREC, MultiRC, QQP, FigQA, Rotten Tomatoes, app_reviews y SentEval). Cada clave fue verificada mediante una resolución ciega, y los ítems de conteo también mediante evaluación de su aritmética declarada. Finalmente, el body es el promedio uniforme de los dos fine-tunes fusionados, construido con el soup builder de Zils.

## Capacidades

- Generación de texto y razonamiento en formato de decisión: el modelo está específicamente entrenado para ítems de examen con opciones, selección de respuestas y clasificación.
- Razonamiento sobre opciones múltiples: los datos de entrenamiento incluyen datasets como ReClor, COPA, StrategyQA y CosmosQA, lo que sugiere capacidad para tareas de inferencia lógica y sentido común.
- Razonamiento aritmético básico: presencia de GSM8K y SVAMP en los datos de entrenamiento, con verificación aritmética de los ítems de conteo.
- Comprensión lectora: inclusión de SQuAD 2.0 y MultiRC en el corpus de entrenamiento.
- Capacidades de visión: la model card menciona "language and vision weights", lo que indica que el chasis incluye componentes de visión, aunque no se detallan las capacidades concretas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Modo thinking: no disponible.

## Casos de uso

- Evaluación de sistemas de decisión automatizada: el modelo puede emplearse como componente de un pipeline que requiera seleccionar una opción entre varias (por ejemplo, clasificación de intenciones o respuestas a preguntas de opción múltiple) dentro del ecosistema Zils, aprovechando su entrenamiento específico en ítems de examen.
- Investigación sobre model soups y merging de pesos: dado que el repositorio documenta con precisión los commits y el proceso de promediado, sirve como caso de estudio reproducible para investigar el efecto del promediado uniforme de pesos y la fusión de adaptadores LoRA en modelos de 4B.
- Benchmarking de técnicas de verificación de claves: el proceso de "blind re-solve" y verificación aritmética descrito puede replicarse para estudiar la calidad de datos sintéticos generados por modelos grandes (Qwen3.8-27B) en tareas de razonamiento.
- Clasificación de texto y análisis de sentimiento: la inclusión de Rotten Tomatoes, app_reviews y SentEval en el entrenamiento sugiere utilidad para tareas de clasificación de reseñas y probing semántico, aunque requeriría el chasis Zils para la capa de respuesta.
- Razonamiento de sentido común en entornos controlados: con datasets como COPA, StrategyQA y WiC en el corpus, el modelo puede integrarse en sistemas de pregunta-respuesta que operen sobre dominios acotados y verifiquen la coherencia lógica de las respuestas.
- Participación en la subred 127 de Bittensor: el modelo está diseñado como body para el pool d3-mini de Zils, por lo que su uso principal es contribuir a dicho pool y participar en los mecanismos de incentivos de la subred, no como modelo de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros en bfloat16, los pesos ocupan aproximadamente 9,1 GB (tamaño del repo). En cuantización de 8 bits se reduciría a unos 4,5 GB, y en 4 bits a unos 2,3 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPU recomendadas: para bfloat16 se requiere una GPU con al menos 12-16 GB de VRAM (RTX 4080, RTX 4090, A10, L4). Para despliegues en servidor, A100 o H100 permitirían mayor throughput y margen para el contexto.
- ¿Cabe en consumer GPU? Sí, en GPUs con 12 GB o más de VRAM en bfloat16, y en GPUs de 8 GB si se aplica cuantización (no oficial).
- Opciones de despliegue: no se especifican en la model card. Al ser un body sin capa de respuesta ni runtime propio, requiere el chasis Zils. Para inferencia directa de los pesos sería necesario reconstruir la arquitectura base (Qwen3.5-4B) y cargar los tensores, lo que no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-cb2 | 4.539 M | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Body para pool Zils, sin runtime propio |
| Qwen/Qwen3.5-4B | ~4B (no confirmado) | no disponible | Apache-2.0 | Hugging Face | Modelo base declarado en la model card |
| torchcast-ai/torchcast-decision-4b | ~4B (no confirmado) | no disponible | Apache-2.0 (según model card) | Hugging Face | Uno de los modelos base del soup |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | Hugging Face | Modelo base del pool d3-mini |

La comparación cuantitativa de rendimiento no es posible porque no se han publicado benchmarks de ninguno de los modelos en la información disponible. La principal diferencia de zils-mini-body-cb2 frente a sus bases es su naturaleza de body empaquetado para un pool específico, no un modelo autónomo.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere la capa de respuesta, el prompt y el runtime del chasis fijado del pool Zils. Sin ese ecosistema, los pesos no son directamente utilizables de forma estándar.
- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni ninguna otra métrica, lo que impide evaluar su calidad objetivamente.
- Idiomas no declarados: se desconoce si soporta castellano u otros idiomas distintos del inglés, y el corpus de entrenamiento (PIQA, COPA, SQuAD, etc.) es predominantemente anglófono.
- Sesgos conocidos: no documentados, pero los datasets de entrenamiento (Rotten Tomatoes, app_reviews, SentEval) pueden introducir sesgos de dominio y de estilo.
- Riesgo de alucinación: no evaluado; al estar entrenado con datos sintéticos generados por Qwen3.8-27B, existe riesgo de propagación de errores del generador, aunque la model card indica verificación ciega de claves.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los modelos base y los datasets subyacentes pueden tener sus propias condiciones; la model card afirma que los cuatro cuerpos house y su base son Apache-2.0, pero no se detallan las licencias de los datasets.
- Fecha de creación futura (2026-11-09): el repositorio muestra fechas que no coinciden con el momento actual, lo que puede indicar metadatos inconsistentes o un entorno de pruebas.
- Cero descargas y cero likes: no hay evidencia de uso o validación por parte de la comunidad.
- Sin pipeline declarado: la ausencia de pipeline en Hugging Face dificulta la integración con frameworks estándar.

## Enlaces

- Hugging Face: https://huggingface.co/Ura0316/zils-mini-body-cb2
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base del soup: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Modelo base del soup: https://huggingface.co/vllm-sr/d3-mini
- Modelo base del soup: https://huggingface.co/perplexity-ai/pplx-decider-flash-v1.2
- Modelo base del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Mini
- Generador de ítems de entrenamiento: https://huggingface.co/Qwen/Qwen3.8-27B
