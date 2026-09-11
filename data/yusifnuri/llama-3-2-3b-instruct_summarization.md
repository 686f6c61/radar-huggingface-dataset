# yusifnuri/Llama-3.2-3B-Instruct_summarization

## Resumen

Llama-3.2-3B-Instruct_summarization es un adaptador LoRA publicado por el usuario yusifnuri que especializa el modelo `meta-llama/Llama-3.2-3B-Instruct` (3,21 mil millones de parámetros) en una única tarea: generar un resumen abstractivo de dos a tres frases a partir de un artículo de noticias. No es un modelo completo ni un asistente de propósito general, sino un delta de pesos de bajo rango (rank 16) que se carga sobre el modelo base mediante la librería `peft`.

El adaptador nace como artefacto verificable del trabajo de fin de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg), que compara modelos pequeños ajustados frente a APIs de proveedores de frontera en exactitud, latencia, coste, exposición de privacidad y volumen de retorno de la inversión. Por eso su interés no es tanto la calidad del resumen como la trazabilidad del método: hiperparámetros fijos en todas las celdas del benchmark, semilla única y métricas publicadas junto al código.

Su relevancia práctica es limitada pero clara: con un repositorio de 0,1 GB se puede reproducir una tarea empresarial concreta sobre una GPU de consumo, sin depender de una API externa, a cambio de un rendimiento medido modesto (ROUGE-L de 0,186) y de una licencia Llama 3.2 que impone condiciones de atribución y umbrales de usuarios activos mensuales. El repositorio no registra descargas ni valoraciones, por lo que no existe validación independiente de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Llama 3.2 3B Instruct) con adaptador LoRA sobre las proyecciones de atención |
| Parametros totales | 3,21 B en el modelo base; el adaptador añade un número de parámetros no especificado (repo de 0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el adaptador se entrenó con secuencias de 512 tokens como máximo |
| Tipos de cuantizacion | adaptador en safetensors (LoRA); el autor no especifica cuantizaciones del modelo base |
| Idiomas soportados | no disponible en la model card; el corpus de entrenamiento (CNN/DailyMail) está en inglés |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); librería declarada: peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 3B Instruct, un transformer decoder-only de 3,21 B de parámetros, y modifica exclusivamente las cuatro proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) mediante LoRA con rank 16, alpha 32 y dropout 0,05. No hay innovación arquitectónica: el interés del artefacto es metodológico y reproducible. El entrenamiento usó el corpus CNN/DailyMail 3.0.0 (`abisee/cnn_dailymail`, licencia Apache-2.0) con 5.000 ejemplos, de los que 500 se reservaron para selección de checkpoint, 3 épocas, AdamW, learning rate 2e-4 con schedule coseno y 3 % de warmup, batch efectivo de 16 (4 x 4 de acumulación de gradiente), longitud máxima de secuencia de 512 tokens y semilla 42. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias.

Un detalle relevante para interpretar los resultados: los hiperparámetros se mantuvieron constantes en todas las celdas del benchmark en lugar de ajustarse por modelo y tarea, de modo que las cifras publicadas deben leerse como una cota inferior conservadora. El adaptador espera un formato de prompt concreto en inferencia (`Summarise the following article in 2-3 sentences: {text}\nSummary:`); usarlo con otro formato degrada la salida.

## Capacidades

- Resumen abstractivo de artículos de noticias en dos o tres frases, tarea para la que fue entrenado explícitamente.
- Generación de texto y formato conversacional heredados del modelo base, aunque el autor desaconseja tratar el adaptador como asistente general.
- Comprensión de instrucciones y contexto largo limitada por el entrenamiento a 512 tokens por secuencia.
- Tool calling / function calling: no verificado y no mencionado en la model card.
- Soporte de agentes y razonamiento multi-paso: no verificado; fuera del alcance del ajuste.
- Capacidades multilingües: no verificadas; el corpus de entrenamiento es monolingüe en inglés.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles; Llama 3.2 3B Instruct es un modelo de solo texto y el adaptador no añade modalidades.

## Casos de uso

- Resumen automático de agregadores de noticias: el adaptador puede condensar cada artículo entrante en dos o tres frases antes de mostrarlo en un lector RSS o un boletín, siempre que se respete el formato de prompt de entrenamiento.
- Triage de monitorización de medios: para filtrar cientos de piezas diarias y decidir cuáles requieren lectura completa, el coste por 1 M de tokens generados (15,25 USD según la medición del autor) es el dato que permite comparar contra una API de pago.
- Generación de metadescripciones para CMS: a partir del cuerpo de la noticia, producir un sumario corto reutilizable en cabeceras, fichas de archivo o campos SEO, con validación humana posterior.
- Preprocesado de corpus para NLP: reducir documentos largos a resúmenes para pipelines de búsqueda semántica, clustering temático o anotación posterior, sin enviar el texto a servicios externos.
- Despliegue con requisitos de privacidad: al ejecutarse de forma local sobre el modelo base, el contenido sensible no sale de la infraestructura, algo que el propio benchmark del autor mide como exposición de privacidad frente a APIs.
- Reproducción de un benchmark académico: el escenario natural de uso es verificar o extender el estudio *Fine-Tune or Pay Per Token?*, cargando el adaptador junto al harness publicado en GitHub.
- Prueba de concepto de ajuste eficiente: servir como plantilla de LoRA de bajo coste para equipos que quieran evaluar si un SLM ajustado cubre una tarea de resumen antes de invertir en un modelo mayor.
- Comparación coste/rendimiento en producción: usar la latencia medida (1.761 ms por petición, batch 1) y el coste imputado para calcular el volumen de equilibrio frente a una API de frontera, que es precisamente el objeto del trabajo.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| ROUGE-L | 0,186 | Corpus de evaluación no especificado en detalle; 200 instancias reservadas |
| Latencia media (batch 1) | 1.761 ms | NVIDIA H200 (141 GB), batch size 1, uso pleno de GPU; excluye tránsito de red |
| Coste por 1 M de tokens generados | 15,25 USD | Precio imputado de 3,99 USD por GPU-hora |
| Fecha de evaluación | 5 de julio de 2026 | — |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros). El autor indica que la matriz completa del benchmark está en `results/benchmark_matrix.csv` del repositorio de GitHub, pero sus cifras no forman parte de los datos proporcionados, por lo que no se reproducen aquí. El propio autor advierte que las puntuaciones no son comparables entre tareas, porque cada celda del estudio usa su propia métrica.

## Requisitos de hardware

- VRAM del adaptador: 0,1 GB en disco; el adaptador en sí es despreciable en memoria frente al modelo base.
- VRAM del modelo base (estimaciones derivadas de 3,21 B de parámetros, no facilitadas por el autor): aproximadamente 6,5 GB en FP16/BF16, 3,5 GB en INT8 y 2 GB en cuantización de 4 bits, más overhead de caché KV.
- GPU recomendada para la tarea: cualquiera con 8 GB o más de VRAM en FP16 requiere al menos 8 GB; con cuantización de 4 bits cabe en GPUs de 4-6 GB.
- GPU de consumo compatibles (estimación): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, así como Apple Silicon con memoria unificada suficiente.
- La medición publicada se hizo en una NVIDIA H200 de 141 GB, pero el modelo no necesita esa capacidad: se eligió para medir a plena utilización de GPU y a batch 1, lo que explica que la latencia refleje más el overhead por petición que la potencia del modelo.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM o TGI fusionando previamente el adaptador, y llama.cpp/Ollama tras fusionar y convertir a GGUF (conversión no documentada en la model card).
- Latencia: 1.761 ms por petición a batch 1 en H200. Throughput, latencia en GPU de consumo y comportamiento con batching dinámico: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos de benchmark |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.2 3B Instruct) | 3,21 B (base) + LoRA de rango 16 | no disponible (entrenado a 512 tokens) | llama3.2 | safetensors (PEFT/LoRA) | ROUGE-L 0,186; 1.761 ms batch 1; 15,25 USD/1 M tokens |
| Llama-3.2-3B-Instruct (modelo base sin ajustar) | 3,21 B | no disponible en la información proporcionada | llama3.2 | safetensors | no disponible (el benchmark completo está en el CSV enlazado, no en los datos aportados) |
| Modelos de frontera vía API comparados en el estudio | no disponible | no disponible | propietaria | no aplica (servicio) | no disponible en la información proporcionada (el autor no identifica los proveedores) |

No se dispone de cifras de otros adaptadores de resumen comparables dentro de la información proporcionada. La comparación cuantitativa completa (exactitud, latencia, coste, privacidad y punto de equilibrio de ROI) está en el repositorio del autor, pero no se ha facilitado su contenido.

## Limitaciones y advertencias

- Entrenado una sola vez y con una única semilla (42): las diferencias reportadas confunden calidad del modelo con varianza de inicialización.
- Especializado en una tarea sobre un único corpus público. No es un asistente de propósito general y no debe presentarse como tal.
- Los corpus de evaluación son benchmarks públicos de larga trayectoria y es plausible que estén presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluación usó 200 instancias reservadas (164 problemas para generación de código), lo que acota el tamaño de efecto detectable a unos diez puntos porcentuales.
- Longitud de secuencia de entrenamiento de 512 tokens: los artículos largos se truncan o degradan la calidad del resumen.
- Riesgo de alucinación inherente al modelo base: el resumen puede introducir datos, cifras o entidades ausentes en el artículo original. En flujos de publicación conviene validación humana.
- Formato de prompt rígido; el adaptador no está entrenado para instrucciones alternativas.
- Licencia Llama 3.2 Community License: permite uso comercial, pero lo condiciona a atribución, a una convención de nombres para modelos derivados y a un umbral de usuarios activos mensuales. Debe revisarse antes de adoptarlo en producción.
- Sesgos: no documentados por el autor; al heredarse del modelo base, persisten los sesgos de Llama 3.2 3B Instruct y los del corpus CNN/DailyMail, orientado a prensa en inglés.
- Repositorio sin descargas ni valoraciones: no hay validación independiente de la comunidad ni mantenimiento conocido.
- Las marcas temporales de la model card (creación el 11 de septiembre de 2026, evaluación el 5 de julio de 2026) conviene verificarlas antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/Llama-3.2-3B-Instruct_summarization
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Código, configuraciones y harness de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento: https://huggingface.co/datasets/abisee/cnn_dailymail
- Cita del trabajo: Nuri, Yusif. *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. Tesis de máster, SRH University Hamburg, 2026.
- Búsqueda web: no se ha recuperado ningún enlace relevante sobre el modelo; los resultados devueltos correspondían a páginas de Google Maps y no guardan relación con el artefacto.
