# taniota/Warlock-1.7B

## Resumen

Warlock-1.7B (denominado también `Warlock-1.7B-Fused` en la model card) es un modelo de lenguaje causal de 1.711.376.384 parámetros (1,71B) afinado para instrucciones, publicado por el usuario taniota en HuggingFace. No se trata de un entrenamiento desde cero ni de un ajuste fino convencional: es el resultado de fusionar las representaciones internas de dos familias de modelos distintas, tomando SmolLM2-1.7B-Instruct como arquitectura receptora y Llama-3.2-1B-Instruct como modelo donante de características. El resultado se distribuye como un único fichero `model.safetensors` de 3,42 GB, sin dependencias en tiempo de ejecución de los modelos originales ni envoltorios de inferencia personalizados.

La relevancia técnica del modelo reside en el método de fusión. Las técnicas habituales de *model merging* (SLERP, DARE, TIES, merges de LoRA) interpolan pesos entre checkpoints de idéntica arquitectura, vocabulario y topología. Warlock-1.7B aborda el caso contrario: combina dos familias con profundidades distintas, espacios de vocabulario distintos y configuraciones de atención distintas (Multi-Head Attention en SmolLM2 frente a Grouped-Query Attention en Llama-3.2). Para ello aplica alineación de representaciones multi-profundidad sobre el espacio oculto compartido (d=2048) y una fusión de pesos calibrada por energía con preservación de la norma de Frobenius, integrando las características del donante directamente en las proyecciones del receptor.

El modelo se publica bajo licencia Apache 2.0, soporta únicamente inglés, y en el momento de la consulta acumula 0 descargas y 0 "likes", por lo que carece de validación independiente por parte de la comunidad. El autor reporta una suite propia de 100 benchmarks con 1.000 preguntas en la que el modelo fusionado obtiene un 46,2% global, prácticamente equivalente a SmolLM2-1.7B-Instruct (46,9%) y 15,8 puntos por encima de Llama-3.2-1B-Instruct (30,4%), con mejoras concretas en deducción científica y conocimiento del mundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only derivado de SmolLM2-1.7B-Instruct (atención Multi-Head, d=2048); el donante Llama-3.2-1B-Instruct aporta características vía fusión de proyecciones MLP (down/gate/up) y de atención |
| Parametros totales | 1.711.376.384 (1,71B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el autor no la especifica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye `model.safetensors` en precision completa; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`, 3,42 GB); tamano total del repositorio: 3,4 GB |

Otros metadatos: pipeline `text-generation`, creado y actualizado el 2026-09-13, 0 descargas, 0 likes.

## Arquitectura y entrenamiento

El modelo no se entrena; se construye mediante fusión. La arquitectura receptora es SmolLM2-1.7B-Instruct: un transformer causal decoder-only con espacio oculto de 2048 dimensiones. El donante es Llama-3.2-1B-Instruct, que comparte esa misma dimensión oculta (d=2048) pero difiere en profundidad, en el espacio de vocabulario y en el esquema de atención: SmolLM2 emplea Multi-Head Attention (MHA) mientras que Llama-3.2 emplea Grouped-Query Attention (GQA). Según el autor, la media aritmética directa entre ambas familias falla de forma catastrófica por estas discrepancias. El procedimiento aplicado consta de tres pasos declarados: (1) alineación de representaciones multi-profundidad entre las capas de Llama-3.2-1B y SmolLM2-1.7B en el espacio latente compartido de 2048 dimensiones, para establecer una correspondencia de coordenadas coherente; (2) fusión de pesos calibrada por energía, en la que las características estructurales y de razonamiento del donante se integran en las proyecciones del receptor (MLP down/gate/up y proyecciones de atención) bajo preservación estricta de la norma de Frobenius, con el objetivo de evitar distorsión del espacio latente; y (3) consolidación en un modelo autónomo, sin intercepción dinámica ni inferencia en doble flujo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; hay que asumir que el modelo hereda las capacidades de instrucción de SmolLM2-1.7B-Instruct y, en menor medida, de Llama-3.2-1B-Instruct. La innovación declarada es precisamente el método de fusión inter-familia, que permite ejecución con KV-caching nativo en C++, soporte de Flash Attention y SDPA, y rendimiento completo en GPU.

## Capacidades

- Generación de texto conversacional en inglés, en formato instruccional (hereda el ajuste de instrucciones de SmolLM2-1.7B-Instruct).
- Razonamiento deductivo científico: en los subdominios ARC de la evaluación del autor obtiene 43/80 (53,8%), superando a ambos modelos padre.
- Conocimiento del mundo y semántica: 58/100 (58,0%), también por encima de SmolLM2 (56,0%) y de Llama-3.2-1B (39,0%).
- Razonamiento práctico y sentido común situacional (HellaSwag): 64/150 (42,7%), con una retención del 98,5% respecto a SmolLM2.
- Conocimiento académico en 57 asignaturas tipo MMLU: 277/570 (48,6%), retención del 97,2% respecto a SmolLM2.
- Aritmética y lógica cuantitativa básica (niveles GSM8K): 20/100 (20,0%), con sensibilidad alta a la formulación aritmética.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; las capacidades observadas se limitan a generación de texto y respuesta a instrucciones.
- Capacidades multilingües: no soportadas; el modelo está etiquetado exclusivamente como inglés.
- Capacidades especiales: no se documentan modo "thinking", visión, audio ni decodificación especulativa.

## Casos de uso

- Asistentes conversacionales en inglés embebidos en aplicaciones de escritorio: con 1,71B parámetros y 3,42 GB en FP16, el modelo se puede servir en local sin depender de APIs externas y con licencia Apache 2.0, lo que simplifica su integración en productos propietarios.
- Despliegue en dispositivos con GPU de gama media o portátil: el autor reporta más de 30 tokens por segundo en una RTX 4050 Laptop GPU, un régimen suficiente para chat interactivo en inglés en un portátil con GPU dedicada.
- Prototipado rápido de pipelines de generación de texto: al cargarse con `transformers` estándar como modelo causal y no requerir wrappers de inferencia, sirve para validar plantillas de prompt, prompts de sistema y flujos de conversación antes de escalar a modelos mayores.
- Investigación en fusión de modelos: es un caso de estudio reproducible de merging inter-familia (MHA frente a GQA, vocabularios distintos, profundidades distintas), útil para grupos que investigan alineación de representaciones y calibración de pesos.
- Tareas de extracción y clasificación de texto en inglés: resumen, reescritura, categorización de tickets o etiquetado de documentos donde el coste por token importa y no se requiere razonamiento profundo.
- Generación de documentación técnica en inglés: redacción asistida de notas de versión, descripciones de API o comentarios de código, aprovechando el conocimiento académico retenido (48,6% en MMLU).
- Base para destilación o ajuste fino posterior: al ser un checkpoint autónomo de 1,71B bajo Apache 2.0, se puede usar como punto de partida para LoRA o QLoRA en dominios verticales en inglés.
- Evaluación comparativa de técnicas de merge: sirve como referencia práctica para medir cuánta capacidad de un donor de 1,24B es absorbida por un receptor de 1,71B sin degradar al receptor.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la suite propuesta por el propio autor: 100 benchmarks autocontenidos, 1.000 preguntas, decodificación greedy con temperatura 0,0. Las columnas "SmolLlama-1.7B-Fused" corresponden al modelo fusionado (denominación usada por el autor en las tablas, no coincidente con el nombre del repositorio).

| Categoria (macro) | Benchmarks / preguntas | Llama-3.2-1B-Instruct | SmolLM2-1.7B-Instruct | Warlock-1.7B (fusionado) |
|---|---|---|---|---|
| Deduccion cientifica (subdominios ARC) | 8 / 80 | 31/80 (38,8%) | 39/80 (48,8%) | 43/80 (53,8%) |
| Conocimiento del mundo y semantica | 10 / 100 | 39/100 (39,0%) | 56/100 (56,0%) | 58/100 (58,0%) |
| Sentido comun situacional (HellaSwag) | 15 / 150 | 39/150 (26,0%) | 65/150 (43,3%) | 64/150 (42,7%) |
| Disciplinas academicas (57 asignaturas MMLU) | 57 / 570 | 178/570 (31,2%) | 285/570 (50,0%) | 277/570 (48,6%) |
| Logica cuantitativa (niveles GSM8K) | 10 / 100 | 17/100 (17,0%) | 24/100 (24,0%) | 20/100 (20,0%) |
| Suite completa de 100 benchmarks | 100 / 1.000 | 304/1.000 (30,4%) | 469/1.000 (46,9%) | 462/1.000 (46,2%) |

Distribución de victorias sobre los 100 benchmarks: el modelo fusionado gana o co-gana en 50 (50,0%); SmolLM2-1.7B gana en exclusiva en 29 (29,0%); Llama-3.2-1B gana en exclusiva en 14 (14,0%); empate a tres bandas en 7 (7,0%).

No se han publicado resultados en esta información para harnesses estándar externos (MMLU completo de 14.042 preguntas, HumanEval, GSM8K completo, MT-Bench, IFEval ni evaluaciones de seguridad). Las cifras anteriores son autoevaluadas por el autor y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia, según el tamaño de 1,71B parámetros: ~3,42 GB en FP16/BF16 (coincide con el peso del repositorio), ~1,8 GB en INT8, ~1,1 GB en cuantización de 4 bits (~0,9-1,2 GB según el esquema) y ~2,2 GB en FP8. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: el autor solo confirma una RTX 4050 Laptop GPU con más de 30 tokens por segundo. Por tamaño, cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, 4060, 4070, 4080, 4090) puede ejecutar el modelo en FP16, y 4 GB bastan en cuantización de 4 bits. Para servicio concurrente a mayor escala, A100, H100 o L40S permiten lotes grandes, aunque el modelo es desproporcionadamente pequeño para estas GPUs.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 6 GB de VRAM en FP16 y en iGPU o CPU con 4-8 GB de RAM si se cuantiza.
- Opciones de despliegue: `transformers` (carga estándar de modelo causal, sin dependencias adicionales), vLLM y TGI para servido con batching, y llama.cpp/Ollama únicamente si se genera previamente una conversión a GGUF, conversión que el repositorio no incluye.
- Latencia y throughput: >30 tokens/segundo en RTX 4050 Laptop GPU según el autor, en FP16. No se publican mediciones de latencia, throughput en lote ni consumo de memoria en otras configuraciones.
- Soporte de atención: Flash Attention y SDPA declarados, además de KV-caching en C++ nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento reportado | Disponibilidad |
|---|---|---|---|---|---|
| Warlock-1.7B (taniota) | 1,71B | No disponible | Apache 2.0 | 46,2% en la suite propia de 100 benchmarks (1.000 preguntas) | 0 descargas, 0 likes; sin validacion externa |
| SmolLM2-1.7B-Instruct (HuggingFaceTB) | 1,71B | 8.192 tokens (segun su model card oficial) | Apache 2.0 | 46,9% en la misma suite, medido por el autor de Warlock | Modelo ampliamente adoptado, con variantes GGUF y ecosistema consolidado |
| Llama-3.2-1B-Instruct (unsloth / Meta) | 1,24B | 128.000 tokens (segun su model card oficial) | Licencia comunitaria de Llama 3.2 (no Apache 2.0) | 30,4% en la misma suite, medido por el autor de Warlock | Ampliamente adoptado; requiere aceptar la licencia de Meta |

La comparación directa solo es posible con los dos modelos padre, porque son los únicos evaluados en la suite del autor. No se dispone de comparaciones con alternativas de tamaño similar (por ejemplo, Qwen2.5-1.5B-Instruct o Gemma-2-2B) dentro de la información proporcionada. Warlock-1.7B no supera de forma global a SmolLM2-1.7B-Instruct: queda 0,7 puntos por debajo y pierde en MMLU y GSM8K, aunque gana en deducción científica y conocimiento del mundo.

## Limitaciones y advertencias

- Idiomas: solo inglés. Cualquier uso en castellano u otros idiomas no está soportado y previsiblemente dará resultados degradados.
- Calidad absoluta limitada: la propia suite del autor sitúa el modelo en un 46,2% de acierto global, con un 48,6% en MMLU y un 20,0% en aritmética tipo GSM8K. No es un modelo apto para tareas que exijan razonamiento matemático fiable.
- Regresión aritmética: en lógica cuantitativa el modelo baja a 20/100 frente a los 24/100 de SmolLM2. El autor lo atribuye a una "alta sensibilidad aritmética", lo que indica que la fusión degradó esta capacidad concreta.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad, calibración ni tasas de alucinación. Al ser un modelo de 1,71B, la generación de hechos inventados es esperable y debe mitigarse con verificación externa.
- Sesgos: no hay ninguna evaluación de sesgos, toxicidad ni seguridad en la información disponible.
- Metodología de evaluación autodeclarada: los 100 benchmarks son una batería propia del autor, no harnesses estándar reproducibles, y no han sido replicados por terceros. Las cifras deben interpretarse como indicativas, no como comparables con leaderboards públicos.
- Inconsistencia de nomenclatura: el repositorio se llama `Warlock-1.7B`, pero las tablas de resultados usan `SmolLlama-1.7B-Fused`, lo que complica la trazabilidad de las cifras.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no existen informes de terceros, issues ni pruebas independientes.
- Fechas de creación anómalas: el repositorio figura como creado y actualizado el 2026-09-13, una fecha que conviene verificar antes de citarla.
- Restricción de licencia potencialmente relevante: aunque el repositorio declara Apache 2.0, el modelo incorpora pesos derivados de Llama-3.2-1B-Instruct, cuya licencia comunitaria de Meta impone condiciones adicionales (atribución "Built with Llama", obligaciones de nomenclatura y cláusula de 700 millones de usuarios mensuales). Antes de un uso comercial conviene revisar si esas condiciones siguen aplicando al modelo fusionado; la declaración Apache 2.0 del autor no resuelve por sí sola esa cuestión.
- Sin cuantizaciones publicadas: al no distribuirse GGUF ni formatos de 4 u 8 bits, el despliegue en hardware de gama baja exige convertir los pesos por cuenta propia, con el riesgo de degradación que ello implica.
- Contexto no confirmado: el autor no especifica la ventana de contexto efectiva del modelo fusionado, un dato crítico para dimensionar memorias KV y aplicaciones con documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taniota/Warlock-1.7B
- Modelo base receptor: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Modelo donante: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Resultados de la busqueda web: no se ha recuperado ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden a portales de identidad y servicios conectados de Škoda (skodaid.vwgroup.io, skoda-auto.de, vwfs.de) y no guardan ninguna relacion con Warlock-1.7B ni con model merging.
- Paper, blog tecnico, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
