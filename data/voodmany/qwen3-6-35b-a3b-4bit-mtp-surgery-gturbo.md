# voodmany/Qwen3.6-35B-A3B-4bit-MTP-Surgery-GTurbo

## Resumen

Qwen3.6-35B-A3B-4bit-MTP-Surgery-GTurbo es una conversión cuantizada a 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario voodmany y empaquetada en formato `.gturbo` para el runtime Mference 2.0, un motor de inferencia escrito en Swift 6.1 y Metal 3 orientado a Apple Silicon. El objetivo declarado es ejecutar un modelo MoE de 35B parámetros totales en un Mac con 16 GB de memoria unificada, algo que en la práctica solo es viable mediante cuantización agresiva y decodificación especulativa.

La conversión no se limita a cuantizar: aplica una "cirugía" de pesos sobre las tablas de escala y sesgo en BF16 (sin descomprimir los nibbles INT4) para corregir desviaciones introducidas por la cuantización, y añade un sidecar MTP (multi-token prediction) de 19 tensores procedente de guru87/Qwen3.6-35B-A3B-MTP para habilitar decodificación especulativa. Según la model card, estas intervenciones elevan el Pass@1 de un 25,0% (2/8) a un 100,0% (8/8) en un conjunto de 8 tareas de código, matemáticas, instrucciones y tool calling.

Es relevante ahora porque demuestra un patrón poco habitual: recuperar calidad perdida por cuantización 4-bit mediante ajustes lineales en las escalas, en lugar de reentrenar o recuantizar, combinado con decodificación especulativa nativa. El repositorio, sin embargo, tiene 0 descargas y 0 likes, y el tamaño declarado es de 0,0 GB, lo que sugiere que los pesos aún no están materializados o que la publicación está incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 40 capas Gated-DeltaNet + full-attention, MoE con 256 expertos por capa, top-8 enrutados + experto compartido |
| Parametros totales | 35B (heredados del modelo base Qwen3.6-35B-A3B) |
| Parametros activos | A3B: aproximadamente 3B activos por token (según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (grupo 64, afín, estilo MLX); escalas y sesgos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `.gturbo` (contenedor propietario de Mference: `model_weights.bin` + `packed_experts_mtp/layer_00.bin`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida de 40 capas que combina capas Gated-DeltaNet (atención lineal con estado recurrente) y capas de atención completa, con un mezclador de expertos de 256 expertos por capa, top-8 enrutados más un experto compartido. Esta conversión mantiene esa topología y solo modifica los parámetros numéricos de escalas, sesgos y normas.

El proceso de "cirugía" (`MTPAttachTool`) explota la linealidad de la cuantización afín por grupos (`w = s·q + b`): multiplicar una proyección por un factor α equivale a escalar `s` y `b` por α, lo que permite aplicar correcciones directamente en las tablas BF16 sin tocar los nibbles INT4. Se aplican factores concretos: `final-norm 1.02`, `qk-norm 1.03` a partir del 50% de profundidad, `router-temp 0.96` a partir del 75%, `late-residual 0.98` y `shared-expert 1.025` desde el 50%. Además se activa co-adaptación automática del MTP (`coAdaptMTP = true`) sobre `mtp.norm.weight`, normas de atención, router y experto compartido. El sidecar MTP aporta 17 tensores residentes más un fichero de 256 expertos INT4 alineados a página (452.984.832 bytes). No hay información sobre el dataset de entrenamiento original ni sobre fases de RLHF/DPO en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base Qwen3.6-35B-A3B.
- Generación de código en Python y Swift, evaluada en el conjunto de benchmarks del autor.
- Razonamiento matemático y de física (tareas tipo AIME y GPQA en la evaluación A/B).
- Seguimiento de instrucciones (IFBench en el conjunto de evaluación).
- Tool calling y function calling, con tareas específicas incluidas en el benchmark de 8 tareas.
- Modo de razonamiento explícito con etiquetas `<think>`, con gestión de "desperdicio de tokens" medida en la benchmark card.
- Decodificación especulativa multi-token (MTP) con aceptación adaptativa y truncado top-2 EVICT intra-bloque.
- Decodificación especulativa por n-gramas híbrida (PLD de 6/5/4/3 gramos) en una sola pasada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo puede generar y completar código Python y Swift directamente en un portátil con 16 GB de memoria unificada, sin depender de la nube, gracias a la combinación de cuantización 4-bit y decodificación especulativa MTP.
- Razonamiento matemático y científico en estación de trabajo: las tareas tipo AIME y GPQA del benchmark muestran que el modelo mantiene capacidad de razonamiento multi-paso tras la cirugía, con una tasa de aceptación MTP del 94,3% en AIME (2,55 tokens por ronda).
- Agentes con tool calling en local: el soporte de function calling y el servidor compatible con OpenAI que expone Mference en el puerto 8080 permiten integrar el modelo en flujos de agentes que invocan herramientas, con latencia de primera respuesta (TTFAT) media de 13,11 s.
- Prototipado de asistentes conversacionales en Apple Silicon: el despliegue con Open WebUI en el puerto 3000 y el servidor OpenAI permite montar una interfaz de chat local en un solo comando, útil para demos y validación de producto.
- Evaluación de pipelines de decodificación especulativa: el sidecar MTP y los parámetros de aceptación adaptativa hacen del modelo un banco de pruebas para medir el impacto de la decodificación especulativa en latencia y calidad sobre hardware consumer.
- Investigación sobre cuantización y cirugía de pesos: los factores de corrección documentados (`qk-norm`, `router-temp`, `late-residual`, `shared-expert`) permiten reproducir y extender el método de ajuste lineal en tablas BF16 sin recuantizar, útil para estudiar la degradación de modelos MoE a 4 bits.
- Inferencia de bajo consumo en entornos sin GPU dedicada: al ejecutarse sobre Metal en Apple Silicon, el modelo encaja en escenarios donde no hay acceso a A100/H100 y se prioriza el consumo energético sobre el throughput absoluto.

## Benchmarks y rendimiento

Datos publicados por el autor en `benchmarks/aa-scorecard-v2.json`, medidos en un Mac de 16 GB con 32 slots de caché de expertos y temperatura 0, sobre 8 tareas de código (Python/Swift), matemáticas/física (AIME/GPQA), seguimiento de instrucciones (IFBench) y tool calling:

| Metrica | Baseline INT4 crudo | Mference 2.0 (cirugia + MTP hibrido) | Impacto |
|---|---:|---:|---|
| Pass@1 | 25,0% (2/8) | 100,0% (8/8) | +75,0 pts |
| Velocidad media de decodificacion | 15,96 tok/s | 16,47 tok/s | Hasta 18,36 tok/s (Swift) / 17,88 tok/s (AIME) |
| Aceptacion MTP | 79,1% estatica | 83,1% adaptativa | 94,3% en AIME (2,55 tokens/ronda) |
| Tiempo medio por tarea | 32,14 s | 25,31 s | -21,3% (TTFAT medio 13,11 s) |
| Desperdicio de tokens `<think>` | 413,4 de media | 126,1 de media | -69,5% |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible; las cifras anteriores provienen de un conjunto propio de 8 tareas y deben interpretarse con cautela por el tamaño reducido de la muestra.

## Requisitos de hardware

- Memoria unificada: 16 GB es el mínimo declarado por el autor para ejecutar el modelo en un Mac Apple Silicon.
- GPU recomendadas: Apple Silicon con Metal 3 (el runtime Mference 2.0 es específico de macOS). No hay soporte documentado para A100, H100 ni RTX 4090 en esta conversión.
- Cabe en GPU consumer: sí, en equipos Apple Silicon de 16 GB de memoria unificada; no se documenta compatibilidad con GPUs NVIDIA consumer.
- Opciones de despliegue: Mference 2.0 (runtime propietario en Swift + Metal), con servidor compatible con OpenAI en el puerto 8080 y Open WebUI en el 3000. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: 16,47 tok/s de media en decodificación (hasta 18,36 tok/s en tareas Swift), 25,31 s de media por tarea y 13,11 s de TTFAT medio, según las mediciones del autor en un Mac de 16 GB.
- Caché de expertos: configuración de referencia con 32 slots de caché para los 256 expertos por capa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| voodmany/Qwen3.6-35B-A3B-4bit-MTP-Surgery-GTurbo | 35B totales / ~3B activos | no disponible | Apache-2.0 | Mference 2.0 (Swift/Metal) | Cirugía de pesos + MTP; 16 GB de memoria unificada |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | no disponible | Apache-2.0 / Qwen License | Múltiples (no especificado) | Modelo original sin cuantizar; requiere mucha más memoria |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35B totales / ~3B activos | no disponible | Apache-2.0 | MLX | Cuantización 4-bit estándar sin cirugía ni MTP |
| guru87/Qwen3.6-35B-A3B-MTP | 35B totales / ~3B activos | no disponible | no disponible | no disponible | Sidecar MTP usado como componente de esta conversión |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de benchmarks frente a alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamaño declarado de 0,0 GB: es posible que los pesos no estén efectivamente publicados o que la subida esté incompleta. Verificar antes de depender de él.
- El benchmark de referencia consta de solo 8 tareas; un Pass@1 del 100% en esa muestra no es extrapolable a un rendimiento general y no sustituye a evaluaciones estándar como MMLU o HumanEval.
- La "cirugía" de pesos con factores fijos (`qk-norm`, `router-temp`, `late-residual`, `shared-expert`) está calibrada para este checkpoint concreto; no hay evidencia de que generalice a otros modelos o dominios.
- El formato `.gturbo` y el runtime Mference 2.0 son específicos y propietarios: no hay soporte para vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad y el despliegue en servidores convencionales.
- Dependencia exclusiva de Apple Silicon con Metal 3; no se documenta funcionamiento en GPUs NVIDIA, AMD ni en CPU.
- La cuantización 4-bit introduce degradación de calidad que la cirugía mitiga parcialmente pero no elimina; los sesgos y alucinaciones del modelo base persisten y no se documentan análisis específicos.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento multilingüe de esta conversión.
- Aunque la licencia declarada es Apache-2.0, el modelo base Qwen puede estar sujeto a la Qwen License; conviene revisar los términos del modelo original antes de uso comercial.
- El modo `<think>` consume tokens de razonamiento; aunque el autor reporta una reducción del 69,5% en desperdicio, sigue habiendo sobrecoste en latencia y tokens frente a modos sin razonamiento explícito.
- No hay información sobre el dataset de entrenamiento, filtrado de datos ni fases de alineación del modelo base en la documentación proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodmany/Qwen3.6-35B-A3B-4bit-MTP-Surgery-GTurbo
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantización MLX de referencia: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Sidecar MTP: https://huggingface.co/guru87/Qwen3.6-35B-A3B-MTP
- Runtime Mference 2.0: https://github.com/fjw4cfv2fb-afk/Mference-2.0
- Benchmark scorecard: https://github.com/fjw4cfv2fb-afk/Mference-2.0/blob/main/benchmarks/aa-scorecard-v2.json
- Release v2.0.0 de Mference: https://github.com/fjw4cfv2fb-afk/Mference-2.0/releases/tag/v2.0.0
- Repositorio Mference original: https://github.com/NeelM0906/Mference
- Proyecto TurboFieldfare: https://github.com/drumih/turbo-fieldfare
