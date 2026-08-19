# technotic/embeddinggemma-300M-litertlm

## Resumen

EmbeddingGemma-300M es un modelo de embeddings de texto desarrollado por Google DeepMind, diseñado para producir representaciones vectoriales de alta calidad con un tamaño reducido (300 millones de parámetros). Este repositorio concreto, `technotic/embeddinggemma-300M-litertlm`, es una versión cuantizada a INT8 y compilada para el runtime LiteRT-LM de Google, orientada a la inferencia en dispositivos con recursos limitados como móviles, portátiles o equipos de escritorio. El modelo original está construido a partir de Gemma 3 con inicialización T5Gemma y comparte la tecnología utilizada en los modelos Gemini.

La relevancia de este modelo radica en que ofrece un rendimiento de vanguardia para su tamaño en tareas de búsqueda y recuperación, al tiempo que su cuantización INT8 permite desplegarlo en entornos donde la memoria y la capacidad de cómputo son limitadas. Con una ventana de contexto de 2048 tokens y una dimensión de embedding de 768 (reducible mediante Matryoshka Representation Learning), está entrenado con datos en más de 100 idiomas, lo que lo convierte en una opción sólida para aplicaciones multilingües de procesamiento de lenguaje natural.

La versión cuantizada aquí presentada mantiene las capacidades del modelo original, pero su formato LiteRT-LM la hace especialmente adecuada para integración en aplicaciones Android, iOS o sistemas embebidos que utilicen el ecosistema TensorFlow Lite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Gemma 3 (con inicializacion T5Gemma) |
| Parametros totales | 300 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | INT8 (LiteRT-LM) |
| Idiomas soportados | Mas de 100 idiomas (segun la model card) |
| Licencia | Gemma (Google) |
| Formato de pesos | LiteRT-LM (INT8) |

## Arquitectura y entrenamiento

El modelo original EmbeddingGemma-300M es un transformer denso de 300 millones de parámetros, construido a partir de la arquitectura de Gemma 3 con una inicialización basada en T5Gemma. Está entrenado específicamente para la tarea de generar embeddings de texto, es decir, representaciones vectoriales densas que capturan el significado semántico de las frases. El entrenamiento se realizó con datos en más de 100 idiomas, lo que le confiere una capacidad multilingüe notable para su tamaño.

Una innovación técnica destacada es el uso de Matryoshka Representation Learning (MRL), que permite truncar el embedding de salida de 768 dimensiones a tamaños menores (512, 256 o 128) sin necesidad de reentrenar el modelo, simplemente re-normalizando el vector resultante. Esto ofrece flexibilidad para adaptar el consumo de memoria y almacenamiento según las necesidades de cada aplicación.

La versión cuantizada INT8 presentada en este repositorio utiliza el formato LiteRT-LM, un runtime optimizado de Google para ejecutar modelos de lenguaje en dispositivos con recursos limitados. La cuantización reduce el peso del modelo de aproximadamente 1,2 GB (en FP32) a unos 300 MB, manteniendo una precisión cercana a la original.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, similitud entre frases, clasificación y clustering.
- Soporte multilingüe: entrenado con datos en más de 100 idiomas, aunque no se especifica la distribución exacta.
- Matryoshka Representation Learning: permite reducir la dimensión del embedding de 768 a 512, 256 o 128 con re-normalización.
- Eficiencia en dispositivos: gracias a la cuantización INT8 y al runtime LiteRT-LM, puede ejecutarse en móviles, portátiles y sistemas embebidos.
- Adecuado para pipelines de Retrieval Augmented Generation (RAG) en entornos on-device.
- No es un modelo generativo: su salida es un vector numérico, no texto.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles: permite indexar documentos, notas o mensajes en el dispositivo y realizar consultas en lenguaje natural sin necesidad de conexión a servidores externos. La cuantización INT8 garantiza un uso reducido de memoria y una latencia aceptable en hardware móvil.
- Recuperación aumentada por generación (RAG) on-device: integrar EmbeddingGemma como componente de recuperación en un sistema RAG que se ejecute localmente, por ejemplo en un asistente personal que responda preguntas sobre la biblioteca de documentos del usuario.
- Clasificación de textos en entornos con privacidad estricta: al ejecutarse localmente, evita enviar datos sensibles a la nube. Es útil para clasificar correos, tickets de soporte o documentos internos en sectores como banca o sanidad.
- Clustering de documentos para organización automática: agrupar artículos, informes o mensajes por temática sin intervención manual, aprovechando la capacidad multilingüe para manejar corpus heterogéneos.
- Sistemas de recomendación basados en contenido: generar embeddings de ítems (productos, artículos, vídeos) y calcular similitudes para sugerir elementos relacionados, todo en el dispositivo del usuario.
- Deduplicación de registros en bases de datos locales: comparar embeddings de textos cortos (nombres, direcciones, descripciones) para detectar duplicados en aplicaciones de gestión de contactos o inventarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original menciona que es "state-of-the-art for its size", pero no se proporcionan cifras concretas de MMLU, MTEB u otras evaluaciones. Para esta versión cuantizada INT8 tampoco se indican métricas de degradación respecto al modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 300M parámetros en INT8, el peso ocupa aproximadamente 300 MB. La memoria total necesaria (incluyendo activaciones y overhead del runtime) puede rondar los 500 MB en CPU o GPU integrada.
- GPU recomendadas: no requiere GPU dedicada. Puede ejecutarse en CPU de dispositivos móviles (ARM) o en GPUs integradas de portátiles. En caso de usar GPU, cualquier GPU con al menos 1 GB de VRAM sería suficiente, aunque no es necesario.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) con amplio margen, pero su diseño está pensado para CPU y dispositivos sin GPU.
- Opciones de despliegue: al ser un formato LiteRT-LM, se integra mediante el runtime LiteRT (TensorFlow Lite) en Android, iOS, Linux o Windows. También puede ejecutarse con librerías de inferencia que soporten este formato, como el paquete `ai-edge-litert` o mediante conversión a otros formatos si se dispone del modelo original.
- Latencia y throughput estimados: no disponibles. Se espera que la inferencia sea de pocos milisegundos por texto corto en hardware móvil moderno, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo original EmbeddingGemma-300M se posiciona como líder en su rango de tamaño, pero no se han incluido métricas comparativas con alternativas como `all-MiniLM-L6-v2` (80M), `bge-base-en-v1.5` (110M) o `gte-small` (33M). La única referencia cualitativa es la afirmación de Google de que es "state-of-the-art for its size".

## Limitaciones y advertencias

- La licencia Gemma de Google puede imponer restricciones de uso comercial. Es necesario revisar los términos de uso antes de desplegar el modelo en producción.
- El contexto máximo es de 2048 tokens, por lo que textos más largos deberán truncarse o dividirse en fragmentos, lo que puede afectar a la calidad del embedding.
- Aunque se entrenó con más de 100 idiomas, no se especifica el rendimiento relativo por idioma; es posible que algunos idiomas con menos datos tengan peor calidad.
- Al ser un modelo de embeddings, no genera texto y no es adecuado para tareas de generación o razonamiento conversacional.
- La cuantización INT8 puede introducir una ligera pérdida de precisión respecto al modelo en FP32, aunque no se cuantifica en esta documentación.
- El formato LiteRT-LM puede no ser compatible con todas las librerías de inferencia estándar (como sentence-transformers o TEI) sin conversión previa.
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de representación, el riesgo de alucinación es nulo; sin embargo, los sesgos presentes en los datos de entrenamiento pueden reflejarse en los embeddings (por ejemplo, asociaciones estereotipadas).

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/technotic/embeddinggemma-300M-litertlm
- Modelo original en HuggingFace: https://huggingface.co/google/embeddinggemma-300m
- Página oficial de EmbeddingGemma en Google AI: https://ai.google.dev/gemma/docs/embeddinggemma
- Paper técnico: https://arxiv.org/abs/2509.20354
- Model card del modelo original: https://huggingface.co/google/embeddinggemma-300m/blob/main/README.md
- Página de DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Entrada en LM Studio: https://lmstudio.ai/models/google/embedding-gemma-300m
