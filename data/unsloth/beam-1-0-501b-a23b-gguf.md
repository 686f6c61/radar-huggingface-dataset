# unsloth/Beam-1.0-501B-A23B-GGUF

## Resumen

Beam-1.0-501B-A23B es un modelo de lenguaje de Reflection con arquitectura de mezcla de expertos dispersa (MoE): 501,3 mil millones de parámetros totales y 23,4 mil millones activos por token. Está entrenado para uso agéntico, ingeniería de software y razonamiento científico-matemático, con una ventana de contexto de 1 millón de tokens y un enfoque explícito en la eficiencia de tokens de razonamiento (el autor afirma una reducción de ~3x frente a modelos abiertos comparables). Se distribuye con licencia Apache 2.0 y está desarrollado predominantemente en inglés.

Esta ficha cubre la versión cuantizada publicada por Unsloth: `unsloth/Beam-1.0-501B-A23B-GGUF`, generada con el esquema Unsloth Dynamic 3.0 y empaquetada en formato GGUF para su ejecución con llama.cpp, Ollama o la propia aplicación de escritorio de Unsloth. El repositorio ocupa 3.817 GB, lo que da una idea de la escala del modelo: no cabe en ninguna GPU de consumo y exige clústeres multi-GPU o despliegues con offload a CPU.

Su relevancia actual radica en la combinación poco habitual de tres factores: pesos abiertos con licencia permisiva, contexto de 1M tokens y un número de parámetros activos (23,4B) relativamente contenido, lo que abarata la inferencia por token frente a modelos densos de tamaño comparable. La contrapartida es que el modelo completo debe residir en memoria, de modo que el coste de hardware sigue siendo alto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso: 52 capas (3 densas + 49 MoE), atención GQA con compuertas (gated GQA) y sliding window attention |
| Parámetros totales | 501.267.612.352 (501,3 B) |
| Parámetros activos | 23,4 B |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | GGUF con esquema Unsloth Dynamic 3.0 (varios niveles de bits); el modelo base se publica en BF16, FP8 y NVFP4 |
| Idiomas soportados | Inglés (idioma principal declarado); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio (3.817 GB); safetensors en el modelo base |
| Expertos por capa | 256 (top-k activado no disponible en la información proporcionada) |
| Tamaño de vocabulario | 152.000 tokens |
| Descargas / likes | 1.835 descargas, 13 likes |
| Fecha de publicación | 16 de octubre de 2026 |
| Modelo base | reflection/Beam-1.0-501B-A23B |

## Arquitectura y entrenamiento

Beam emplea una arquitectura MoE dispersa con 52 capas, de las cuales 3 son densas y 49 contienen capas de expertos (256 expertos por capa). La atención combina GQA con compuertas y atención de ventana deslizante, un diseño orientado a contener el coste del KV cache en contextos muy largos y a permitir la ventana de 1M tokens declarada. El vocabulario es de 152.000 tokens. El modelo se publica en tres precisiones (BF16, FP8 y NVFP4), lo que sugiere un pipeline de entrenamiento en BF16 con posteriores pasos de cuantización para despliegue.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineación: la model card no detalla esos apartados y el informe técnico figura como "coming" (pendiente de publicación). Tampoco se documentan innovaciones de decodificación (especulativa u otras) ni detalles del algoritmo de enrutamiento de expertos más allá del recuento. Las afirmaciones técnicas verificables se limitan, por tanto, a la arquitectura descrita y a las capacidades declaradas por el autor.

## Capacidades

- Generación de texto conversacional y finalización de tareas multi-turno.
- Razonamiento explícito con énfasis en eficiencia de tokens: el autor afirma calidad de solución comparable a modelos abiertos líderes con aproximadamente 3x menos tokens de razonamiento en inferencia.
- Ingeniería de software: resolución de issues reales de GitHub, operación en entornos CLI y DevOps, integración con harnesses de codificación agéntica y generación de código en varios lenguajes.
- Uso agéntico de herramientas: integración de herramientas basadas en MCP, navegación web y ejecución de flujos de trabajo de múltiples pasos y horizonte largo a partir de instrucciones en lenguaje natural.
- Razonamiento matemático y científico: problemas de nivel de posgrado, demostración de teoremas y matemática aplicada; según el autor, esa calidad se transfiere a depuración, planificación y autocorrección durante la ejecución agéntica.
- Autocorrección y reflexión (etiquetas `reflection`, `reasoning` del repositorio).
- Multilingüismo: no declarado; el modelo está desarrollado predominantemente en inglés.
- Sin capacidades multimodales (visión o audio) declaradas.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo está entrenado para operar sobre bases de código reales y puede conectarse a un harness agéntico que lea el repositorio, proponga un parche y ejecute los tests. Su ventana de 1M tokens permite cargar contexto amplio del proyecto sin trocear en exceso.
- Agente de CLI y DevOps: ejecución de secuencias de comandos, diagnóstico de fallos de despliegue y aplicación de cambios en infraestructura a partir de instrucciones en lenguaje natural, con capacidad de planificar varios pasos y corregirse tras un error.
- Integración de herramientas vía MCP y navegación: construcción de asistentes que consulten APIs, servicios internos o la web, encadenando llamadas y manteniendo estado a lo largo de tareas largas.
- Razonamiento matemático y científico asistido: resolución de problemas de nivel de posgrado, verificación de demostraciones y derivaciones aplicadas, donde la eficiencia de tokens reduce el coste por consulta en comparación con modelos que razonan de forma más verbosa.
- Análisis de bases de código completas o de documentación técnica extensa: con 1M tokens de contexto se pueden procesar monorepos pequeños, expedientes de auditoría o documentación normativa en una sola pasada, útil para migraciones y revisiones de seguridad.
- Síntesis y destilación de datos de razonamiento: al generar cadenas de razonamiento más cortas para una calidad similar, resulta adecuado para producir datasets de entrenamiento o trayectorias de agente con menor coste de generación.
-Asistencia al cliente técnico en inglés: conversaciones multi-turno con historial largo y consulta a sistemas internos mediante tool calling, siempre que el despliegue asuma el coste de hardware y el idioma inglés.
- Despliegue on-premise en entornos aislados: al publicarse en GGUF y con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin dependencia de APIs externas, incluido hardware con offload a CPU en cuantizaciones agresivas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, SWE-bench u otros) en la información disponible. La model card incluye únicamente dos gráficas de fidelidad de la cuantización —KLD y precisión top-1 frente al tamaño en disco— sin valores numéricos asociados, y anuncia un informe técnico aún no publicado.

| Benchmark | Beam-1.0-501B-A23B | Modelos comparables |
|---|---|---|
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |
| SWE-bench | no disponible | no disponible |
| KLD de cuantización GGUF | gráfica publicada, sin cifras | no aplica |

La única afirmación cuantitativa del autor es la reducción de ~3x en tokens de razonamiento para una calidad de solución comparable, que no va acompañada de una tabla de resultados que la respalde en la información consultada.

## Requisitos de hardware

Tamaños estimados por aritmética a partir de los 501,3B parámetros (pesos + overhead de metadatos; no son cifras oficiales del repositorio):

| Cuantización | Bits/peso aprox. | Tamaño estimado |
|---|---|---|
| BF16 (modelo base) | 16 | ~1.002 GB |
| Q8_0 | 8,5 | ~533 GB |
| Q6_K | 6,6 | ~413 GB |
| Q5_K_M | 5,7 | ~357 GB |
| Q4_K_M | 4,8 | ~300 GB |
| Q3_K_M | 3,9 | ~244 GB |
| Q2_K | 2,6 | ~163 GB |

- VRAM para inferencia: no cabe ninguna cuantización completa en una GPU de consumo (24-48 GB). Incluso Q2_K, la más agresiva, ronda los 163 GB de pesos.
- GPU recomendadas: 8x H100 80 GB (640 GB) para Q6/Q8 con holgura; 4x H100 80 GB o 8x A100 80 GB para Q4; 8x A100 40 GB (320 GB) para Q4 muy justo y para Q3 sin margen para KV cache amplio. El KV cache a 1M tokens no está cuantificado en la información disponible y consume memoria adicional.
- Consumer GPU: no es viable en RTX 4090, 5090 ni similares por capacidad. Solo tiene sentido con offload parcial CPU+GPU, donde los expertos activos se calculan en GPU y el resto reside en RAM.
- Throughput estimado (aritmética, no medición): con 23,4B parámetros activos y Q4, cada token requiere leer del orden de 14 GB de pesos; sobre DDR5 de doble canal (~96 GB/s teóricos) el techo es de ~7 tokens/s y en la práctica previsiblemente 1-3 tokens/s. En 8x H100 el ancho de banda agregado (HBM3) eleva mucho ese techo, pero no hay cifras publicadas de latencia ni throughput.
- Opciones de despliegue: llama.cpp / llama-server, Ollama, LM Studio, Unsloth Desktop y llama-cpp-python para el GGUF. vLLM y SGLang solo con los pesos originales en safetensors (el soporte GGUF en vLLM es experimental); TGI no soporta GGUF de forma nativa.
- Almacenamiento: el repositorio GGUF completo ocupa 3.817 GB, por lo que conviene descargar solo el archivo de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | GGUF disponible |
|---|---|---|---|---|
| Beam-1.0-501B-A23B | 501,3 B / 23,4 B | 1M | Apache 2.0 | Sí (Unsloth Dynamic 3.0) |
| DeepSeek-V3 (familia) | 671 B / 37 B | 128K | MIT | Sí, comunidad |
| Qwen3-235B-A22B | 235 B / 22 B | 262K extensible | Apache 2.0 | Sí, comunidad |
| Kimi K2 | 1 T / 32 B | 256K | MIT modificada | Sí, comunidad |

Los datos de los modelos comparados proceden de sus respectivas model cards públicas; en la información disponible no hay comparaciones directas de rendimiento con Beam. Frente a ellos, Beam destaca por el contexto de 1M tokens y por un número de parámetros activos similar al de Qwen3-235B-A22B con el doble de parámetros totales, lo que implica mayor necesidad de memoria agregada. DeepSeek-V3 mantiene la licencia más permisiva del grupo (MIT) y un tamaño algo mayor; Kimi K2 duplica los parámetros totales con una licencia más restrictiva.

## Limitaciones y advertencias

- Idioma: solo se declara inglés. No hay evaluación publicada en castellano ni en otros idiomas, por lo que su uso en producción en español no está respaldado por datos.
- Sin multimodalidad: no procesa imágenes, audio ni vídeo.
- Coste de hardware extremo: 3,8 TB de repositorio y entre ~163 GB (Q2_K) y ~1 TB (BF16) de pesos. Requiere clústeres multi-GPU o configuraciones con offload a CPU; no es desplegable en una estación de trabajo convencional.
- Degradación por cuantización: las cuantizaciones bajas (Q2/Q3) sobre un MoE de 256 expertos pueden degradar el enrutamiento y la calidad. El autor publica gráficas de KLD y precisión top-1, pero sin valores numéricos que permitan fijar un umbral seguro.
- Contexto de 1M: no hay evaluaciones publicadas de recuperación en el extremo de la ventana; es habitual que la calidad caiga en posiciones medias y largas. El coste de KV cache a esa longitud no está documentado.
- Alucinación: no se publican tasas de alucinación ni resultados de verificación factual. En tareas agénticas de horizonte largo, un error de planificación puede propagarse a pasos posteriores.
- Afirmaciones no verificadas: la eficiencia de ~3x en tokens de razonamiento es una declaración del autor sin tabla de resultados que la respalde en la información consultada.
- Sesgos: no se documenta la composición del dataset de entrenamiento ni los procesos de alineación, por lo que no es posible evaluar sesgos conocidos.
- Licencia: Apache 2.0 en este repositorio permite uso comercial, pero conviene verificar el archivo LICENSE del modelo base y las condiciones de los componentes opcionales de las herramientas de Unsloth.
- Madurez del ecosistema: es una versión 1.0 con informe técnico pendiente; el soporte en frameworks de inferencia distintos de llama.cpp puede ser limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF
- Modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Licencia del modelo base: https://huggingface.co/reflection/Beam-1.0-501B-A23B/blob/main/LICENSE
- Organización Reflection en Hugging Face: https://huggingface.co/reflection
- GitHub de Reflection: https://github.com/reflection-oss
- Blog de lanzamiento: https://reflection.ai/blog
- Documentación para desarrolladores: https://developers.reflection.ai/introduction
- Gráfica KLD de la cuantización: https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF/resolve/main/Beam-1.0-501B-A23B-GGUF-KLD.png
- Gráfica de precisión top-1: https://huggingface.co/unsloth/Beam-1.0-501B-A23B-GGUF/resolve/main/Beam-1.0-501B-A23B-GGUF-Top1-Accuracy.png
- Unsloth (web): https://unsloth.ai/
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
