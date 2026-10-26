# VelociQ8/Zhinao-ChineseModernBert-Embedding-Q8A64-GGUF

## Resumen

Zhinao-ChineseModernBert-Embedding-Q8A64-GGUF es la conversión al formato Q8A64 (pesos de 8 bits del runtime VelociQ8) del modelo de embeddings `qihoo360/Zhinao-ChineseModernBert-Embedding`, desarrollado por el equipo Zhinao de Qihoo 360. No es un modelo generativo: es un encoder de texto que convierte fragmentos en chino, en inglés o mixtos en vectores densos de 768 dimensiones, pensados para recuperación de información, similitud semántica, clustering y clasificación. La conversión la publica VelociQ8, un proyecto de terceros que distribuye un runtime propio (derivado de llama.cpp) para ejecutar estos ficheros en CPU sobre Arm y x86-64.

El interés práctico del artefacto es doble. Por un lado, el modelo base se presenta en su model card como el mejor modelo de la categoría "Base" en el benchmark chino CMTEB, con una arquitectura de tipo ModernBERT y aproximadamente 110 millones de parámetros sin contar los embeddings del tokenizador (353.193.472 parámetros totales según los safetensors). Por otro, esta versión empaqueta esos pesos en 8 bits para inferencia en CPU, lo que permite montar un servicio de embeddings bilingüe chino-inglés en hardware sin GPU, con un tamaño de repositorio de 1,3 GB que incluye los binarios del runtime además de los pesos.

La contrapartida importante es la compatibilidad: los ficheros Q8A64 solo se cargan con VelociQ8 1.1 o superior y no funcionan en llama.cpp estándar, Ollama estándar, vLLM ni TGI. Es, por tanto, una pieza para despliegues de recuperación y RAG en entornos controlados, no un sustituto directo del modelo original en PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de tipo ModernBERT (según la denominación del modelo base; detalles internos no disponibles en la información proporcionada) |
| Parámetros totales | 353.193.472 (safetensors); la model card del base indica ~110M sin los embeddings del tokenizador |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | Q8A64 (pesos de 8 bits, formato propio de VelociQ8); no se ofrece ninguna otra cuantización en este repositorio |
| Idiomas soportados | Chino (zh), inglés (en) y texto mixto chino-inglés |
| Licencia | Apache 2.0 (pesos); el runtime VelociQ8 es software propietario de uso gratuito, con licencia independiente |
| Formato de pesos | GGUF en variante Q8A64 (carga exclusiva con VelociQ8 ≥ 1.1) |
| Dimensiones del embedding | 768 |
| Tarea (pipeline) | feature-extraction / sentence-similarity |
| Tamaño del repositorio | 1,3 GB (incluye carpeta `runtime` con binarios) |
| Descargas / likes | 124 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Zhinao-ChineseModernBert de Qihoo 360, construida sobre una arquitectura ModernBERT adaptada al chino: un encoder transformer con atención bidireccional que produce representaciones de frase. La ficha del autor de esta conversión no reproduce los detalles de entrenamiento (número de tokens, composición del corpus, uso de negativos duros o de ajuste contrastivo), por lo que esos datos deben considerarse no disponibles en la información manejada aquí. Lo que sí se documenta es el uso asimétrico: la instrucción de tarea se aplica únicamente en el lado de la consulta, un patrón habitual en modelos de recuperación donde el documento se codifica sin instrucción y la query se codifica con ella.

La innovación de este repositorio no está en el entrenamiento sino en el empaquetado: los pesos se convierten al formato Q8A64 de VelociQ8, que cuantiza a 8 bits y utiliza kernels específicos para Arm (dotprod, Neoverse N1 y posteriores, Ampere Altra, AWS Graviton2 y posteriores) y para x86-64 con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores). El runtime, derivado de llama.cpp, expone las mismas herramientas (`llama-server`, `llama-cli`, `llama-embedding`, `llama-bench`, `llama-quantize`) y la misma API HTTP compatible con OpenAI. El autor declara que el fichero ha sido verificado para cargar y ejecutar, pero no aporta ninguna medición propia de calidad ni de rendimiento frente al modelo original en precisión completa.

## Capacidades

- Generación de embeddings de texto de 768 dimensiones para chino, inglés y contenido mixto, con instrucción de tarea en el lado de la consulta.
- Recuperación semántica (dense retrieval) y búsqueda por similitud sobre corpus en chino e inglés.
- Clustering y deduplicación de documentos mediante similitud de vectores.
- Clasificación de texto por similitud con prototipos o mediante un clasificador ligero aguas abajo.
- Soporte de frases mixtas chino-inglés, útil en documentación técnica con terminología inglesa intercalada.
- Inferencia en CPU pura sobre Arm64 y x86-64, sin necesidad de GPU.
- Aceleración opcional por GPU en las distribuciones x86-64: Vulkan en las compilaciones de Ollama y CUDA en las compilaciones específicas para NVIDIA Turing o posteriores.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de representación, no un LLM.

## Casos de uso

- RAG sobre documentación en chino: indexación por lotes de manuales, normativa o bases de conocimiento con el runtime en CPU y recuperación de los pasajes más similares a la consulta; los 512 tokens de contexto obligan a trocear los documentos en fragmentos de ese orden.
- Búsqueda semántica bilingüe en catálogos de producto: un mismo índice cubre fichas en chino e inglés, lo que permite que una consulta en cualquiera de los dos idiomas recupere resultados escritos en el otro.
- Deduplicación y clustering de tickets de soporte: generación de embeddings de cada incidencia y agrupación por similitud para detectar problemas recurrentes y alimentar paneles de incidencias.
- Clasificación de correo o formularios entrantes: cálculo del embedding del mensaje y comparación contra prototipos de cada categoría, con un clasificador lineal entrenado sobre los vectores de 768 dimensiones.
- Filtrado de contenido y detección de near-duplicates en pipelines de ingesta: comparación vectorial contra una lista de referencia para marcar documentos repetidos o casi idénticos antes de indexarlos.
- Recomendación de contenidos relacionados: similitud entre el embedding de un artículo leído y el resto del corpus, ejecutada en servidores sin GPU para mantener el coste por petición bajo.
- Despliegue en edge o en infraestructura on-premise con CPU Arm (Graviton, Ampere Altra): servicio de embeddings dentro de la propia red, sin enviar texto a APIs externas, algo relevante con datos en chino sujetos a requisitos de localización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión Q8A64. El autor indica explícitamente que el repositorio no aporta mediciones propias más allá de la verificación de carga y ejecución.

La model card del modelo base y su repositorio en GitHub sí hacen afirmaciones cualitativas: que Zhinao-ChineseModernBert supera en rendimiento global a RoBERTa-wwm-large y que la versión Embedding es el mejor modelo de la categoría Base en la lista CMTEB, por delante de modelos de embeddings de mayor tamaño como Qwen3-Embedding-0.6B, con buen comportamiento en recuperación, clustering y similitud. Son afirmaciones del autor del modelo base, sin cifras reproducidas en la información disponible, y no hay datos que permitan cuantificar la pérdida de calidad introducida por la cuantización a 8 bits.

## Requisitos de hardware

- VRAM: no requiere GPU. En CPU, los pesos de 8 bits de un modelo de ~353M parámetros ocupan del orden de 350 MB; conviene reservar entre 1 y 2 GB de RAM para el proceso, el tokenizador y los lotes de inferencia.
- GPU recomendadas: ninguna es necesaria. Como aceleración opcional, las compilaciones con CUDA exigen NVIDIA Turing o posterior (GeForce RTX 20 en adelante) con driver actualizado; las compilaciones de Ollama para x86-64 pueden usar GPU NVIDIA, AMD o Intel a través de Vulkan.
- Cabe en cualquier CPU consumer moderna: x86-64 con AVX2 y FMA (Haswell, Zen o posterior) o Arm64 con dotprod (Graviton2 y posteriores, Neoverse N1 y posteriores, Ampere Altra). Para Arm sin dotprod existe la variante `arm64-multi`, que selecciona los kernels al arrancar.
- Sistemas operativos: Linux con glibc 2.28 o superior, y Windows x86-64 (probado en Windows 11).
- Opciones de despliegue: runtime VelociQ8 (`llama-server` con API compatible con OpenAI, `llama-cli`, `llama-embedding`), imagen Docker `ghcr.io/dhaern/velociq8`, o los archivos portables de Ollama 0.40.11 que incluye el proyecto. No es compatible con llama.cpp estándar, Ollama estándar, vLLM ni TGI.
- Limitación operativa del runtime: las herramientas de VelociQ8 no descargan modelos; hay que bajar el fichero del repositorio y pasarlo con `-m`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para este fichero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / despliegue | Rendimiento |
|---|---|---|---|---|---|---|
| VelociQ8/Zhinao-ChineseModernBert-Embedding-Q8A64-GGUF (este) | 353.193.472 totales | 512 | zh, en | Apache 2.0 (runtime propietario aparte) | GGUF Q8A64, solo VelociQ8 en CPU | Sin métricas publicadas de la versión cuantizada |
| qihoo360/Zhinao-ChineseModernBert-Embedding (base) | 353.193.472 totales | 512 | zh, en | Apache 2.0 | safetensors, PyTorch / sentence-transformers | Declarado mejor modelo Base en CMTEB por el autor; sin cifras en la información disponible |
| Qwen3-Embedding-0.6B | ~0,6B (según denominación) | No disponible | No disponible | No disponible | No disponible | El autor del modelo base afirma que Zhinao lo supera en CMTEB; datos concretos no disponibles |
| RoBERTa-wwm-large | No disponible | No disponible | chino | No disponible | No disponible | El autor del modelo base afirma que Zhinao lo supera globalmente; datos concretos no disponibles |

La comparación relevante en la práctica es contra el modelo base en precisión completa: ofrece presumiblemente mejor calidad numérica, pero exige PyTorch y bastante más memoria, mientras que esta versión prioriza ejecución en CPU y un consumo de RAM de un orden de magnitud menor, a costa de un runtime propietario y de una pérdida de calidad no medida.

## Limitaciones y advertencias

- Ventana de contexto de solo 512 tokens: los documentos largos deben trocearse, lo que fragmenta el contexto semántico y puede degradar la recuperación en pasajes que dependen de información distribuida.
- Solo chino e inglés: no hay soporte declarado de español ni de otras lenguas, por lo que no es adecuado para corpus multilingües fuera de ese par.
- Es un modelo de embeddings, no un generador: no responde preguntas, no razona en varios pasos y no puede usarse como chat ni como agente.
- Dependencia de un runtime propietario: los ficheros no cargan en llama.cpp, Ollama estándar, vLLM ni TGI. Esto crea un riesgo de proveedor y complica la portabilidad y la integración en stacks existentes.
- La licencia Apache 2.0 cubre los pesos, pero el runtime VelociQ8 se distribuye con su propia licencia de software propietario de uso gratuito; conviene revisar sus términos antes de un despliegue comercial.
- No hay evaluación publicada del impacto de la cuantización Q8A64 en la calidad de los embeddings; las afirmaciones de rendimiento del CMTEB corresponden al modelo base y no necesariamente se trasladan a esta conversión.
- Sesgos: no se documenta la composición del corpus de entrenamiento ni análisis de sesgos; es esperable que herede los sesgos presentes en los datos web en chino e inglés del modelo original.
- Riesgo de alucinación: no aplica en sentido estricto al no generar texto, pero sí existe riesgo de recuperar pasajes irrelevantes si los umbrales de similitud se fijan sin calibrar sobre el dominio concreto.
- El repositorio incluye binarios del runtime (1,3 GB en total): hay que separar los pesos de las herramientas al integrarlo en pipelines automatizados y verificar los ficheros con `SHA256SUMS`.
- Advertencia sobre los snippets de Hugging Face: los ejemplos automáticos de "Use this model" para llama.cpp y Ollama no funcionan con estos ficheros.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/VelociQ8/Zhinao-ChineseModernBert-Embedding-Q8A64-GGUF
- Modelo base: https://huggingface.co/qihoo360/Zhinao-ChineseModernBert-Embedding
- Modelo base en ModelScope: https://www.modelscope.cn/models/360zhinao/Zhinao-ChineseModernBert-Embedding
- Repositorio GitHub del modelo base: https://github.com/Qihoo360/Zhinao-ChineseModernBert
- Runtime VelociQ8 (GitHub): https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Organización VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
