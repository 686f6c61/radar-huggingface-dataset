# VelociQ8/bge-m3-Q8A64-GGUF

## Resumen

VelociQ8/bge-m3-Q8A64-GGUF es una conversión del modelo de embeddings BAAI/bge-m3 al formato de pesos Q8A64 de 8 bits definido por VelociQ8, pensada para ejecutar inferencia en CPU sobre Arm64 y x86-64. No es un modelo nuevo ni un ajuste fino: es el mismo encoder de embeddings de BAAI empaquetado en un formato propietario que solo carga con el runtime VelociQ8 (versión 1.1 o superior), construido a partir de llama.cpp. El resultado es un extractor de características que convierte texto en vectores densos de 1024 dimensiones para recuperación, búsqueda semántica y RAG.

El modelo base cubre más de 100 idiomas, admite entradas desde frases cortas hasta documentos largos con una ventana de 8.192 tokens y no requiere prefijos distintos para consultas y documentos. Esta conversión conserva únicamente la salida densa: las salidas dispersas (lexicales) y multi-vector (estilo ColBERT) del bge-m3 original no están disponibles en este fichero.

Su relevancia práctica está en el despliegue: permite montar un servidor de embeddings en infraestructura sin GPU (por ejemplo, AWS Graviton o Ampere Altra) con un binario que expone API HTTP compatible con OpenAI. La contrapartida es la dependencia del runtime VelociQ8, que es propietario aunque de uso gratuito, y que impide cargar el fichero con llama.cpp estándar, Ollama convencional o los snippets automáticos de Hugging Face. El autor no publica mediciones propias de calidad ni de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de embeddings de texto; la información proporcionada no detalla la arquitectura interna) |
| Parámetros totales | 865.119.008 según metadatos de safetensors; la model card del autor indica "unos 568 M" (discrepancia no aclarada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en el modelo original |
| Tipos de cuantización | Q8A64 (8 bits); este repositorio no ofrece otros niveles |
| Idiomas soportados | Multilingüe, más de 100 idiomas |
| Licencia | MIT para los pesos; el runtime VelociQ8 es software propietario de uso gratuito |
| Formato de pesos | GGUF con formato Q8A64; solo cargable con VelociQ8 1.1 o posterior |
| Dimensión de los embeddings | 1024 (solo vectores densos) |
| Pipeline | feature-extraction |
| Tamaño del repositorio | 2,3 GB (incluye archivos del runtime, no solo los pesos) |
| Descargas / likes | 351 descargas, 0 likes (en el momento de la consulta) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo que sí se documenta es el resultado: un encoder de embeddings de texto que produce un único vector denso de 1024 dimensiones por entrada, con soporte multilingüe para más de 100 idiomas y una ventana de 8.192 tokens. El modelo original puede generar además pesos dispersos (lexicales) y representaciones multi-vector tipo ColBERT, pero esta conversión no los expone.

El cambio técnico respecto al original es exclusivamente el formato de pesos: VelociQ8 aplica un esquema de cuantización de 8 bits denominado Q8A64, orientado a kernels de CPU con instrucciones SIMD (dotprod en Arm, AVX2 y FMA en x86-64). No se documentan datos de entrenamiento, número de tokens, composición del corpus ni etapas de RLHF o DPO, y tampoco se especifica qué parte del pipeline original (por ejemplo, el pooling o la normalización) se ha reimplementado en el runtime. El autor declara que el fichero se ha verificado "cargando y ejecutando", pero no aporta métricas de calidad tras la cuantización.

## Capacidades

- Generación de embeddings densos de 1024 dimensiones para cualquier texto de entrada, desde frases cortas hasta documentos de hasta 8.192 tokens.
- Recuperación y búsqueda semántica: similitud entre consultas y pasajes sin necesidad de prefijos distintos para query y documento.
- Similitud semántica de frases y detección de duplicados o paráfrasis mediante distancia coseno.
- Cobertura multilingüe de más de 100 idiomas, lo que permite indexar y consultar en idiomas distintos dentro de una misma colección vectorial.
- Extracción de características dentro de pipelines de machine learning (pipeline declarado: feature-extraction).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio: es un modelo de embeddings, no un LLM.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo; solo puede formar parte de un agente como componente de recuperación.
- No ofrece modo "thinking", salidas dispersas ni multi-vector en este fichero.

## Casos de uso

- RAG en infraestructura sin GPU: indexar la base documental y servir las consultas con `llama-embedding` o `llama-server` sobre CPU Arm o x86-64, evitando el coste de GPU en producción. Los 8.192 tokens de contexto permiten usar fragmentos largos sin truncar.
- Búsqueda semántica multilingüe: una única colección de vectores donde las consultas en castellano recuperan documentos en inglés, alemán o francés sin traducción intermedia, gracias a la cobertura de más de 100 idiomas.
- Deduplicación y agrupación de tickets de soporte: calcular embeddings de cada ticket y agrupar por similitud coseno para detectar incidencias repetidas y enrutarlas al equipo correspondiente.
- Clasificación zero-shot por prototipos: definir un vector medio por categoría (facturación, incidencias, cancelaciones) y asignar nuevas entradas a la categoría más próxima, sin entrenamiento supervisado inicial.
- Caché semántica para asistentes: almacenar pares pregunta-respuesta ya resueltos y recuperar el más similar antes de invocar un LLM, reduciendo llamadas costosas en entornos de CPU.
- Filtrado previo en pipelines de revisión documental o selección de candidatos: recuperar los N documentos más afines a una descripción y pasarlos a una etapa posterior más costosa (reranking o revisión humana).
- Despliegue en entornos air-gapped o edge: los binarios Arm64/x86-64 y la imagen Docker permiten operar sin conexión; hay que descargar el fichero de pesos previamente, porque las herramientas VelociQ8 no descargan modelos.
- Detección de plagio aproximado o contenido duplicado en corpus editoriales, comparando cada documento contra el índice vectorial existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica explícitamente que este fichero no aporta mediciones propias ("None of its own") y que la única verificación realizada es que carga y se ejecuta correctamente. No hay datos de MMLU, MTEB, BEIR ni de latencia/throughput, ni comparación medida con el bge-m3 original en fp32.

## Requisitos de hardware

- Inferencia en CPU por diseño: no se requiere GPU. Los kernels usan dotprod en Arm o AVX2/FMA en x86-64.
- VRAM: no aplica en el caso CPU. Con GPU opcional, los pesos en 8 bits ocupan del orden de 0,8-1 GB, por lo que caben en cualquier GPU con 2 GB o más (estimación aritmética a partir de los parámetros y del esquema de 8 bits, no medida por el autor).
- RAM estimada: alrededor de 1 GB solo para los pesos, más el overhead del runtime y los buffers de contexto; se recomienda disponer de 2-4 GB libres.
- CPU soportadas: Arm de 64 bits con dotprod (Ampere Altra, AWS Graviton2 y posteriores, Neoverse N1 y posteriores) mediante el archivo específico, o cualquier Arm de 64 bits con el archivo `arm64-multi`; en x86-64, CPUs con AVX2 y FMA (Intel Haswell, AMD Zen y posteriores).
- GPU opcional: en los archivos Ollama para x86-64 se puede usar GPU NVIDIA, AMD o Intel a través de Vulkan; existen además archivos con CUDA que requieren Turing o posterior (GeForce RTX 20 en adelante).
- Sistemas operativos: Linux (glibc 2.28 o superior) en Arm64 y x86-64, y Windows en x86-64 (probado en Windows 11).
- Opciones de despliegue: runtime VelociQ8 con `llama-server` (API HTTP compatible con OpenAI), `llama-cli`, `llama-embedding`, `llama-bench` y `llama-quantize`; Ollama 0.40.11 portable incluido en los archivos; imagen Docker `ghcr.io/dhaern/velociq8`.
- Incompatibilidades: llama.cpp estándar, Ollama convencional y los snippets "Use this model" de Hugging Face no funcionan con Q8A64.
- Latencia y throughput: no disponible (el autor no publica mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salidas | Licencia | Formato / ejecución |
|---|---|---|---|---|---|
| VelociQ8/bge-m3-Q8A64-GGUF (este) | 865.119.008 según metadatos; ~568 M según la model card | 8.192 tokens | Solo densa (1024 dims) | MIT (pesos); runtime propietario gratuito | GGUF Q8A64, solo VelociQ8 ≥ 1.1, CPU |
| BAAI/bge-m3 (base) | ~568 M según la model card del autor | 8.192 tokens | Densa, dispersa y multi-vector (ColBERT) | MIT | Pesos originales; cargable con toolchains de embeddings habituales |
| Otras alternativas de embeddings multilingües | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible con el modelo base, porque la información suministrada no incluye datos de terceros. Frente a él, esta conversión pierde las salidas dispersa y multi-vector y añade una dependencia estricta del runtime VelociQ8, a cambio de un formato de 8 bits ejecutable en CPU.

## Limitaciones y advertencias

- Dependencia de runtime propietario: el fichero solo carga con VelociQ8 1.1 o posterior, software propietario de uso gratuito construido sobre llama.cpp. No hay soporte en llama.cpp, Ollama estándar ni en las herramientas habituales del ecosistema GGUF.
- Pérdida de funcionalidad respecto al original: no hay salidas dispersas (lexicales) ni multi-vector (ColBERT), por lo que no se puede replicar el pipeline completo de bge-m3 ni usar la recuperación híbrida que depende de esas representaciones.
- Impacto de la cuantización no documentado: el autor no publica ninguna evaluación de calidad tras convertir a 8 bits, así que la degradación en tareas de recuperación es desconocida.
- Discrepancia en el número de parámetros: los metadatos de safetensors indican 865.119.008 y la model card del autor habla de unos 568 M. Conviene verificar el dato antes de dimensionar infraestructura.
- No es un modelo generativo: no produce texto, no razona, no ejecuta código ni soporta tool calling. No debe evaluarse con benchmarks de LLM.
- Límite de contexto: 8.192 tokens; los documentos más largos deben trocearse, con el riesgo de perder coherencia entre fragmentos.
- Sesgos: no se documenta la composición del corpus de entrenamiento del modelo base ni se han publicado evaluaciones de sesgo para esta conversión; los sesgos del original se heredan sin cuantificar.
- Riesgo de error en recuperación: al no haber métricas, un fallo de recuperación puede pasar desapercibido y propagarse a un RAG que genere respuestas incorrectas.
- Restricciones operativas: las herramientas VelociQ8 no descargan modelos, hay que obtener el fichero aparte y pasarlo con `-m`; en Linux se exige glibc 2.28 o superior.
- Licencia: los pesos son MIT, pero el uso del runtime se rige por los términos de VelociQ8, que no se detallan en la información disponible. Verificar antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VelociQ8/bge-m3-Q8A64-GGUF
- Modelo base: https://huggingface.co/BAAI/bge-m3
- Repositorio del runtime: https://github.com/dhaern/VelociQ8
- Releases del runtime: https://github.com/dhaern/VelociQ8/releases
- Documentación de uso: https://github.com/dhaern/VelociQ8/blob/main/docs/usage.md
- Organización VelociQ8 en Hugging Face: https://huggingface.co/VelociQ8
- Imagen Docker: https://github.com/dhaern/VelociQ8/pkgs/container/velociq8
- Paper asociado a la etiqueta arxiv:2402.03216: https://arxiv.org/abs/2402.03216
- Carpeta de runtime dentro del repositorio: https://huggingface.co/VelociQ8/bge-m3-Q8A64-GGUF/tree/main/runtime
- Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos de Hugging Face.
