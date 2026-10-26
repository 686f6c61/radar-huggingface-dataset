# VelociQ8/multilingual-e5-base-Q8A64-GGUF

## Resumen

VelociQ8/multilingual-e5-base-Q8A64-GGUF es una conversión del modelo de embeddings intfloat/multilingual-e5-base al formato Q8A64, la cuantización de 8 bits del runtime VelociQ8, pensada para inferencia en CPU sobre Arm (aarch64) y x86-64. No es un modelo nuevo: conserva los pesos y el comportamiento del E5 multilingüe de intfloat (Liang Wang et al.), que transforma texto en vectores de 768 dimensiones para recuperación, similitud semántica, clasificación y clustering, con prefijos cortos en consultas y pasajes.

Su interés práctico está en el empaquetado: permite ejecutar un modelo de embeddings multilingüe de ~0,5 GB en servidores sin GPU, con API HTTP compatible con OpenAI a través de `llama-server`, y con variantes para Arm con dotprod (Graviton2 en adelante, Neoverse N1, Ampere Altra), x86-64 con AVX2/FMA, Windows, Ollama portable y contenedor Docker. El contexto es de 512 tokens, suficiente para pasajes y fragmentos, no para documentos completos.

La contrapartida es la dependencia del runtime: los ficheros Q8A64 no cargan en llama.cpp estándar ni en Ollama convencional, y los fragmentos de código que Hugging Face muestra automáticamente no funcionan con este repositorio. Además, el autor no publica ninguna medición propia del modelo (solo confirma que carga y se ejecuta), y el repo tiene 137 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para embeddings de texto; salida de 768 dimensiones (número de capas y cabezas no disponible en la información proporcionada) |
| Parámetros totales | 480.486.112 según los metadatos safetensors; la model card del autor indica "unos 280 M" (discrepancia no resuelta en la información disponible) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 512 tokens en el modelo original |
| Tipos de cuantización | Q8A64 (8 bits por peso, formato propio de VelociQ8); este repositorio no ofrece otras cuantizaciones |
| Idiomas soportados | Multilingüe, en torno a 100 idiomas según el autor |
| Licencia | MIT para los pesos; el runtime VelociQ8 es software propietario de uso gratuito |
| Formato de pesos | GGUF con cuantización Q8A64; solo carga en VelociQ8 1.1 o superior |

## Arquitectura y entrenamiento

El modelo base es un transformer encoder de tipo BERT/XLM-R orientado a representaciones densas: recibe texto y devuelve un único vector de 768 dimensiones por secuencia, con un máximo de 512 tokens de entrada. La conversión Q8A64 no altera la arquitectura ni el tokenizador; únicamente reduce los pesos a 8 bits en un formato propietario del runtime VelociQ8. El autor no detalla en la información disponible la estructura interna de bloques del formato ni el proceso exacto de cuantización.

Sobre el entrenamiento, esta ficha solo puede remitirse al modelo original de intfloat y al informe técnico de embeddings E5 multilingües referenciado en las etiquetas del repositorio (arXiv:2402.05672). El autor de la conversión no aporta información sobre datos de entrenamiento, número de tokens, composición del corpus ni si hubo ajuste con RLHF o DPO; tampoco documenta ninguna innovación técnica propia más allá del formato de cuantización. La model card sí especifica el uso previsto: prefijos cortos en consultas y en pasajes antes de calcular los vectores.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones para similitud semántica y recuperación densa.
- Recuperación de información (retrieval) en pipelines RAG, con convención de prefijos para consulta y pasaje.
- Búsqueda semántica multilingüe en torno a 100 idiomas, incluyendo consultas y documentos en idiomas distintos.
- Clasificación de texto por similitud con prototipos o etiquetas, sin entrenamiento adicional.
- Clustering y deduplicación de textos a partir de distancias vectoriales.
- Extracción de características (`feature-extraction`), que es el pipeline declarado en el repositorio.
- Ejecución en CPU sin GPU, con API HTTP compatible con OpenAI a través de `llama-server`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.

## Casos de uso

- RAG sobre documentación interna multilingüe: se dividen los documentos en fragmentos por debajo de 512 tokens, se indexan con el prefijo de pasaje y se consulta con el prefijo de consulta; el modelo devuelve vectores que alimentan un índice (FAISS, Qdrant, pgvector) y permiten recuperar contexto para un LLM generador.
- Búsqueda semántica en catálogos de comercio electrónico: descripciones de producto y consultas de usuario en varios idiomas se proyectan al mismo espacio vectorial, de modo que una búsqueda en castellano recupera productos descritos en inglés o alemán sin traducción intermedia.
- Deduplicación y agrupación de tickets de soporte: al calcular embeddings de cada incidencia y agrupar por similitud se detectan duplicados y se identifican temas recurrentes, lo que reduce el volumen de colas de atención.
- Clasificación zero-shot de correo o formularios: se definen prototipos por categoría (una o varias frases por etiqueta), se vectorizan y se asigna a cada entrada la categoría con mayor similitud, sin reentrenar el modelo.
- Filtrado y reranking ligero en motores de búsqueda híbridos: tras una recuperación léxica (BM25) se recalcula similitud semántica con este modelo para reordenar los candidatos, con un coste por consulta muy inferior al de un cross-encoder grande.
- Despliegue en servidores Arm sin GPU: sobre AWS Graviton2 o posteriores o Ampere Altra, el modelo corre en CPU con los binarios `velociq8-1.4-linux-arm64`, lo que evita el coste de instancias con acelerador para volúmenes moderados de indexación.
- Caché semántico de respuestas de LLM: se indexan pares pregunta-respuesta previos y, ante una consulta nueva, se busca una coincidencia por encima de un umbral antes de invocar al modelo generador, reduciendo llamadas repetidas.
- Procesamiento on-premise de datos sensibles: al ser un modelo de ~0,5 GB que se ejecuta en CPU local, encaja en entornos con requisitos de residencia de datos donde no se permite enviar texto a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que el modelo no tiene mediciones propias y que solo se ha verificado que carga y se ejecuta.

Como contexto del runtime, y no de este modelo en concreto, las notas de la versión de VelociQ8 citadas en la búsqueda mencionan que, en modelos MoE (granite-3.1-1b-a400m y OLMoE-1B-7B), el procesamiento de prompt resulta entre 1,8 y 2,1 veces más rápido que llama.cpp v0.7.0 con Q8_0 en la máquina Arm de prueba, y 1,5 veces más rápido en un Ryzen 9 5950X. No hay cifras equivalentes publicadas para esta conversión de e5-base.

## Requisitos de hardware

- VRAM/RAM estimada: con 480,5 M de parámetros a 8 bits, los pesos ocupan aproximadamente 480 MB; en la práctica conviene reservar entre 0,6 y 1 GB de memoria para el proceso completo. El repositorio ocupa 1,6 GB porque incluye los binarios del runtime además de los pesos.
- GPU: no es necesaria. El modelo está diseñado para CPU. Las variantes Ollama para x86-64 pueden usar GPU NVIDIA, AMD o Intel mediante Vulkan, y existen archivos CUDA para GPU NVIDIA Turing (RTX 20) o posteriores, pero el caso de uso natural es CPU.
- CPU x86-64: requiere AVX2 y FMA (Intel Haswell, AMD Zen o posteriores) para el binario `linux-x64`.
- CPU Arm: los binarios `linux-arm64` requieren soporte dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores); existe una variante `arm64-multi` que selecciona los kernels óptimos al arrancar para cualquier CPU Arm de 64 bits.
- Cabe en hardware de consumo: sí, en cualquier portátil o mini-PC x86-64 con AVX2, y en placas Arm64 compatibles. El requisito real es el sistema operativo (glibc 2.28 o superior en Linux) y el runtime correcto.
- Opciones de despliegue: runtime VelociQ8 (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`, `llama-quantize`) con API HTTP compatible con OpenAI; Ollama 0.40.11 portable incluido en los archivos del proyecto; imagen Docker `ghcr.io/dhaern/velociq8`. No es compatible con llama.cpp estándar, Ollama convencional, vLLM ni TGI.
- Latencia y throughput: no disponibles para este modelo en la información proporcionada. Como referencia de orden de magnitud, un encoder de 480 M de parámetros con 512 tokens de entrada se procesa en CPU moderna en decenas de milisegundos por lote pequeño, pero no hay cifras publicadas que lo confirmen para esta conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimensión | Formato y runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VelociQ8/multilingual-e5-base-Q8A64-GGUF (este) | 480.486.112 según metadatos; ~280 M según la model card | 512 tokens | 768 | GGUF Q8A64; solo VelociQ8 ≥ 1.1 | MIT (pesos); runtime propietario | 137 descargas, 0 likes |
| intfloat/multilingual-e5-base (original) | ~280 M según la model card | 512 tokens | 768 | safetensors/PyTorch; transformers, sentence-transformers | MIT | Repositorio de referencia de intfloat |
| Otras alternativas multilingües de embeddings (por ejemplo, variantes large de la familia E5 o modelos tipo BGE-M3) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia relevante frente al original no es de calidad, sino de empaquetado: el original se ejecuta con PyTorch o sentence-transformers en GPU o CPU, mientras que esta conversión exige VelociQ8 y a cambio ofrece binarios nativos para Arm y x86 sin dependencias de Python. No hay datos públicos que permitan cuantificar la pérdida de calidad respecto a los pesos originales.

## Limitaciones y advertencias

- Contexto de 512 tokens: cualquier documento más largo debe trocearse; un chunking descuidado degrada la recuperación más que la cuantización.
- Dependencia de un runtime propietario: los ficheros Q8A64 no cargan en llama.cpp ni en Ollama estándar, lo que crea dependencia de un único proveedor y complica la portabilidad y la reproducibilidad a largo plazo.
- Licencia mixta: los pesos son MIT, pero el runtime VelociQ8 es software propietario de uso gratuito; conviene revisar sus términos antes de redistribuirlo o integrarlo en un producto comercial.
- Ausencia total de evaluaciones: el autor no publica métricas de recuperación (nDCG, Recall@k) ni comparación con los pesos originales, así que no hay evidencia cuantitativa de la pérdida por cuantización.
- Validación comunitaria mínima: 137 descargas y 0 likes; no hay informes de terceros sobre su comportamiento en producción.
- Riesgo de similitudes espurias: como todo modelo de embeddings, puede puntuar alto pares léxicamente parecidos pero semánticamente distintos; se recomienda umbral de corte y, en dominios críticos, un reranker posterior.
- Sesgos: no documentados por el autor. Al heredarse del E5 multilingüe original, es esperable un sesgo hacia el inglés y hacia el dominio de los corpus web de entrenamiento, sin cuantificación disponible.
- Cobertura idiomática desigual: los ~100 idiomas no implican calidad homogénea; no se aportan evaluaciones por idioma, tampoco para el castellano.
- Sin API de inferencia: la model card declara `inference: false`, por lo que el modelo no se puede probar desde el widget de Hugging Face.
- Las herramientas de VelociQ8 no descargan modelos: hay que bajar el fichero manualmente y pasarlo con `-m`, lo que afecta a pipelines automatizados.
- El repositorio incluye binarios ejecutables del runtime: conviene verificar su integridad con `SHA256SUMS` antes de desplegarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VelociQ8/multilingual-e5-base-Q8A64-GGUF
- Organización VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
- Repositorio del runtime en GitHub: https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Modelo base intfloat/multilingual-e5-base: https://huggingface.co/intfloat/multilingual-e5-base
- Informe técnico de embeddings E5 multilingües (etiqueta arXiv del repositorio): https://arxiv.org/abs/2402.05672
- Foro de la comunidad del repositorio: https://huggingface.co/VelociQ8/multilingual-e5-base-Q8A64-GGUF/discussions
- Guía de despliegue de multilingual-e5-base (fuente secundaria): https://llmapi.ai/models/intfloat-multilingual-e5-base/
- Ficha en free2aitools (fuente secundaria): https://free2aitools.com/model/velociq8/multilingual-e5-base-q8a64-gguf
