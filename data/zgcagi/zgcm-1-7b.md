# zgcagi/ZGCM-1-7B

## Resumen

ZGCM-1-7B es un modelo de lenguaje denso de 7.394.832.384 parámetros (7,39B) entrenado desde cero por el Zhongguancun Academy y el Zhongguancun Institute of Artificial Intelligence (usuario de HuggingFace `zgcagi`). Está especializado en razonamiento matemático y búsqueda asistida por herramientas, y combina en un único modelo dos modos de respuesta: uno con razonamiento interno explícito (*thinking*) y otro de respuesta directa. Su ventana de contexto máxima es de 262.144 tokens (256K), muy por encima de lo habitual en la franja de 7B-8B.

La relevancia del modelo está en dos frentes. Por un lado, publica resultados competitivos en benchmarks de matemáticas de competición: 97,13% en MATH-500, 75,00% en AIME 2026 y 70,42% en HMMT 2025, con el mejor rango medio entre los siete modelos de 7B-8B comparados en su informe técnico. Por otro, es un lanzamiento completamente abierto: licencia MIT, pesos en safetensors, dataset de entrenamiento y repositorio con los flujos de preprocesado, preentrenamiento, *mid-training* y SFT.

El proyecto se apoya en una arquitectura de atención híbrida (27 capas con *sliding window* con puerta + 5 capas de atención global), entrenamiento en FP8 con el optimizador Muon y un *mid-training* progresivo de contexto (16K → 64K → 256K). El informe estima una mejora de 3,94× en *throughput* de entrenamiento a 256K frente a atención completa, y de aproximadamente 4,2× en tiempo hasta un *loss* dado a 16K sumando arquitectura, precisión, optimizador y normalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, con atención híbrida: 27 capas de sliding window con puerta (ventana local de 128 tokens) + 5 capas de atención global; GQA con 32 cabezas de consulta y 8 cabezas KV |
| Parametros totales | 7.394.832.384 (7,39B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bfloat16; no se documentan variantes GGUF, AWQ, GPTQ ni FP8 para inferencia) |
| Idiomas soportados | en (inglés), zh (chino) |
| Licencia | MIT |
| Formato de pesos | safetensors, con código de modelado propio (requiere `trust_remote_code=True`) |

Datos adicionales de la ficha de HuggingFace: 32 capas, tamaño oculto 4.096, 406 descargas y 10 *likes* en el momento de la consulta, tamaño del repositorio 16,5 GB, fecha de creación 2026-09-07 y última actualización 2026-09-15. Etiquetas declaradas: `math`, `reasoning`, `agentic-search`, `long-context`, `conversational`.

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only denso de 32 capas y tamaño oculto 4.096. La innovación arquitectónica principal es la combinación de atención local y global: 27 de las 32 capas usan *sliding window attention* con puerta y una ventana de solo 128 tokens, mientras que las 5 restantes aplican atención global. Todas las capas emplean *grouped-query attention* con 32 cabezas de consulta y 8 cabezas KV. Esta mezcla reduce el coste computacional y de caché KV a contextos largos sin renunciar a la propagación de información a larga distancia a través de las capas globales.

El entrenamiento se divide en tres etapas descritas en el informe técnico. La primera es un preentrenamiento de aproximadamente 4,19 billones (4.19T) de tokens con mezcla curricular de datos, precisión híbrida FP8 y optimizador Muon. La segunda es un *mid-training* de aproximadamente 600B tokens que extiende el contexto de 16K a 64K y después a 256K; en esta fase las trazas de interacción se reformulan como transiciones estado-acción de un proceso de decisión de Markov (MDP) para supervisar decisiones individuales. La tercera es un ajuste supervisado (SFT) conjunto de capacidades generales y agenticas, con ejemplos mixtos de razonamiento y respuesta directa, trayectorias verificadas por ejecución y función de pérdida aplicada solo a las respuestas del asistente. No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación por preferencias.

## Capacidades

- Generación de texto y razonamiento matemático de nivel de competición: 97,13% en MATH-500, 75,00% en AIME 2026 y 70,42% en HMMT 2025.
- Dos modos de inferencia en el mismo modelo: modo *thinking* (razonamiento interno deliberado) y modo de respuesta directa, seleccionables mediante el parámetro `enable_thinking` de la plantilla de chat.
- Uso de herramientas y búsqueda agentica multi-paso: 63,09% en WebWalkerQA y 42,52% en GAIA (solo texto), con hasta 64 pasos de búsqueda y lectura web en la configuración de evaluación.
- Búsqueda de funciones en binarios: 62,00% de coincidencias exactas de entrada de función (31/50) usando herramientas de Ghidra, sobre tareas de proyectos no vistos.
- Razonamiento en varios pasos para agentes: la fase de SFT supervisa trayectorias de ejecución verificadas y decisiones individuales modeladas como transiciones MDP.
- Capacidades generales adicionales cubiertas en la evaluación completa del informe (20 benchmarks), que incluye código, conocimiento e instrucción.
- Soporte multilingüe limitado a inglés y chino según la ficha del modelo.
- Contexto largo de 256K tokens para ingesta de documentación extensa o historiales largos.
- Conversación multi-turno mediante su plantilla de chat.
- Capacidad de ajuste fino sobre una receta abierta: se publican los flujos de procesado de datos, preentrenamiento, *mid-training* y SFT con configuraciones por etapa.

## Casos de uso

- Resolución de problemas matemáticos de competición: el modelo puede resolver ejercicios tipo AIME y HMMT y autoverificar cadenas de razonamiento en modo *thinking*; es adecuado por sus resultados en MATH-500 (97,13%) y por permitir 32 ejecuciones con *pass@1* medio para estimar fiabilidad.
- Agente de búsqueda web multi-paso: integrado en un bucle que llama a un buscador y a un lector de páginas, puede resolver preguntas que requieren consultar varias fuentes; su resultado de 63,09% en WebWalkerQA y 42,52% en GAIA con hasta 64 pasos lo sitúa como pieza central de un sistema RAG agentico.
- Análisis de ingeniería inversa asistida: con herramientas de Ghidra como *tool calling*, el modelo puede identificar funciones en binarios, tarea en la que obtiene 62,00% de coincidencias exactas sobre proyectos no vistos.
- Asistente de documentación técnica con contexto largo: sus 256K tokens permiten cargar manuales, repositorios de código o actas completas y hacer preguntas transversales sin trocear el material en fragmentos independientes.
- Generación y revisión de código en pipelines de CI/CD: el informe cubre benchmarks de código dentro de su evaluación de 20 tareas y el modelo soporta tool calling, por lo que puede invocarse como paso de revisión o de generación dentro de un flujo automatizado.
- Atención al cliente bilingüe inglés-chino: gestiona conversaciones multi-turno en los dos idiomas declarados, con la ventana de contexto amplia como ventaja para conservar el historial completo de la interacción.
- Investigación sobre recetas de entrenamiento: al liberar datos, código y configuraciones por etapa, sirve como base para estudiar el efecto de FP8, Muon, atención híbrida y extensión progresiva de contexto en modelos de 7B.
- Extracción estructurada de información a partir de documentos largos: la ventana de 256K y el modo de respuesta directa (sin cadena de razonamiento visible) lo hacen apropiado para tareas de producción donde se prioriza latencia y salida limpia.

## Benchmarks y rendimiento

Resultados del informe técnico, usando el *checkpoint* SFT de 256K en modo *thinking*. Las evaluaciones no agenticas emplean temperatura 1,0, top-p 1,0 y media de *pass@1* sobre 32 ejecuciones. La negrita marca el mejor resultado de cada fila.

| Benchmark (%) | ZGCM-1 | DeepSeek-R1-0528-Qwen3-8B | MiniCPM4.1-8B | Qwen3-8B | Olmo 3 7B Think |
|---|---:|---:|---:|---:|---:|
| MATH-500 | **97,13** | 96,32 | 95,60 | 96,20 | 95,10 |
| AIME 2024 | 80,62 | **83,33** | **83,33** | 80,00 | 71,60 |
| AIME 2025 | 73,33 | **75,21** | 73,33 | 63,33 | 64,60 |
| AIME 2026 | **75,00** | 69,17 | 71,67 | 66,67 | 66,16 |
| HMMT 2025 | **70,42** | 61,50 | 52,50 | 43,33 | 43,89 |
| HMMT 2026 | **59,48** | 51,52 | 46,21 | 45,45 | 43,94 |

Rendimiento agentico:

| Benchmark | ZGCM-1 (%) | Configuracion |
|---|---:|---|
| WebWalkerQA | 63,09 | búsqueda web y lectura de páginas |
| BrowseComp | 19,43 | búsqueda web y lectura de páginas |
| GAIA (solo texto) | 42,52 | búsqueda web y lectura de páginas |
| Binary Function Search | 62,00 | 31/50 coincidencias exactas de entrada de función con herramientas de Ghidra |

La evaluación completa del informe abarca 20 benchmarks, incluidos código, conocimiento y seguimiento de instrucciones, pero en la información disponible solo se detallan las tablas anteriores. No se han publicado en la información disponible resultados de benchmarks de latencia, *throughput* de inferencia ni consumo de memoria.

## Requisitos de hardware

- VRAM estimada para los pesos: en bfloat16, aproximadamente 14,8 GB (7,394.832.384 parámetros × 2 bytes); en FP8, unos 7,4 GB. Son cálculos aritméticos a partir del número de parámetros, no cifras publicadas por el autor.
- Caché KV: gracias a las 27 capas de ventana local de 128 tokens, el coste por token queda dominado por las 5 capas globales. Estimando una dimensión de cabeza de 128 (no publicada de forma explícita), serían unos 20 KB por token, es decir en torno a 5,2 GB en bfloat16 para una secuencia de 256K. Esta cifra es una estimación propia a partir de las especificaciones publicadas.
- GPU recomendadas: para contexto completo de 256K conviene una GPU de 80 GB (H100, A100 80GB) o reparto multi-GPU con `device_map="auto"`. Para contextos moderados, una A100 40GB, L40S 48GB o RTX A6000 48GB son suficientes.
- Cabe en GPU de consumo: en una RTX 4090 de 24 GB los pesos en bfloat16 entran con poco margen y contexto corto; con contexto muy largo la caché KV excede la memoria disponible. En GPUs de 16 GB o menos haría falta cuantización, que no está publicada.
- Opciones de despliegue: la ruta documentada es `transformers` con `trust_remote_code=True` y `dtype="bfloat16"`, más `device_map="auto"` para reparto entre GPUs. La compatibilidad con vLLM, llama.cpp, Ollama o TGI no está confirmada en la información disponible, y es dudosa a priori por el uso de código de modelado propio y atención híbrida.
- Latencia y throughput de inferencia: no disponible. Los únicos datos de eficiencia publicados son de entrenamiento: 3,94× de *throughput* a 256K frente a atención completa y ~4,2× de mejora en tiempo hasta un *loss* dado a 16K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | AIME 2025 | HMMT 2025 | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---:|---|---|
| ZGCM-1-7B | 7,39B denso | 256K | 97,13 | 73,33 | 70,42 | MIT | pesos, datos y código de entrenamiento abiertos |
| DeepSeek-R1-0528-Qwen3-8B | ~8B denso | no disponible en la informacion proporcionada | 96,32 | 75,21 | 61,50 | no disponible en la informacion proporcionada | pesos publicos |
| MiniCPM4.1-8B | ~8B denso | no disponible en la informacion proporcionada | 95,60 | 73,33 | 52,50 | no disponible en la informacion proporcionada | pesos publicos |
| Qwen3-8B | ~8B denso | no disponible en la informacion proporcionada | 96,20 | 63,33 | 43,33 | no disponible en la informacion proporcionada | pesos publicos |
| Olmo 3 7B Think | ~7B denso | no disponible en la informacion proporcionada | 95,10 | 64,60 | 43,89 | no disponible en la informacion proporcionada | pesos publicos |

Los datos de benchmarks de la comparativa proceden de la tabla del informe de ZGCM-1. Las columnas de contexto, licencia y disponibilidad de los modelos alternativos no se detallan en la información proporcionada y deben verificarse en sus respectivas fichas antes de tomar una decisión.

## Limitaciones y advertencias

- Cobertura de idiomas limitada a inglés y chino. No hay soporte declarado de castellano, por lo que su uso en producción en español no está validado.
- Riesgo de alucinación, especialmente en tareas de búsqueda y respuesta directa: en BrowseComp el modelo solo alcanza 19,43%, lo que indica que la resolución de preguntas abiertas que requieren búsqueda profunda sigue siendo poco fiable.
- No se documentan en la información disponible técnicas de alineación por preferencias humanas (RLHF, DPO) ni evaluaciones de seguridad, sesgo o toxicidad. No hay datos publicados sobre sesgos conocidos.
- La licencia MIT permite uso comercial sin restricciones de royalties, pero conviene verificar las licencias de los datos de entrenamiento publicados en `zgcagi/ZGCM-1-Data` antes de un despliegue comercial.
- Requiere `trust_remote_code=True` y ejecuta código de modelado propio incluido en el repositorio. Esto implica revisar ese código antes de ejecutarlo en entornos no controlados, por motivos de seguridad de la cadena de suministro.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ, FP8 de inferencia), lo que dificulta el despliegue en hardware de gama media o en CPU.
- El contexto de 256K exige memoria considerable para la caché KV y no está claro que los frameworks de inferencia optimizados (vLLM, TGI) sean compatibles con la atención híbrida personalizada.
- Los resultados de competición matemática se miden con temperatura 1,0 y media de *pass@1* sobre 32 ejecuciones; en producción con una sola muestra el rendimiento esperado será más variable.
- Las fechas de creación del repositorio (septiembre de 2026) y la referencia al arXiv 2609.13356 son las publicadas por el autor; verifica la vigencia de los enlaces antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zgcagi/ZGCM-1-7B
- Informe técnico (arXiv): https://arxiv.org/abs/2609.13356
- Dataset de entrenamiento: https://huggingface.co/datasets/zgcagi/ZGCM-1-Data
- Código de entrenamiento: https://github.com/zgcagi/ZGCM-1
- Resultados de evaluación: sección `#evaluation-results` de la model card en HuggingFace
- Comunidad WeChat: enlace incluido en la model card (sección `#wechat-community`)

Nota: los resultados de la búsqueda web realizada no aportaron enlaces adicionales relevantes sobre este modelo; los resultados devueltos eran páginas genéricas (Reddit, Zhihu, GitHub Desktop, un repositorio de *prompts* y un repositorio de DeepSeek) sin relación con ZGCM-1.
