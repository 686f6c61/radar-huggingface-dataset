# Yo-Purple/Meditor-1-2.2B-A500M-MoE

## Resumen

Meditor-1-2.2B-A500M-MoE es el primer modelo de la serie Meditor con arquitectura de mezcla de expertos (MoE) dispersa, desarrollado por el usuario independiente Yo-Purple. Se construye sobre el modelo denso Qwen/Qwen2.5-0.5B-Instruct como columna vertebral, al que se le anaden un experto compartido y 22 expertos enrutados de grano fino con enrutamiento top-1, ademas de una extension de atencion deslizante y global. El resultado es un modelo de 2.356.466.328 parametros totales con aproximadamente 500 millones de parametros activos por token, de ahi la denominacion A500M.

El modelo se presenta como una variante "Native MoE" dentro de la serie Meditor, frente a las variantes "Universal" que mantienen la arquitectura densa qwen2 estandar y son compatibles con GGUF. Su relevancia es principalmente experimental: demuestra una tecnica de expansion de un modelo pequeno a una arquitectura MoE dispersa, aunque sus resultados de evaluacion son modestos y el modelo esta orientado a investigacion mas que a produccion.

La ficha se basa en la informacion publicada en Hugging Face y en la model card del autor. No hay paper asociado ni documentacion externa adicional disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (custom_code) sobre Qwen2.5-0.5B-Instruct; 1 experto compartido (4864) + 22 expertos enrutados de grano fino (1216), enrutamiento top-1 |
| Parametros totales | 2.356.466.328 (2.36B) |
| Parametros activos | Aproximadamente 500M (denominacion A500M; el autor indica 0.57B en la tabla de la serie) |
| Longitud de contexto | No disponible (el autor menciona una extension de atencion deslizante y global de 524K, sin especificar la ventana final) |
| Tipos de cuantizacion | No disponible para esta variante nativa; la variante Universal de la serie ofrece BF16 y GGUF (Q4_K_M, Q8_0) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere custom_code de transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 0.5B parametros, y lo expande a una arquitectura MoE dispersa. La configuracion descrita por el autor incluye un experto compartido con dimension 4864 y 22 expertos enrutados de grano fino con dimension 1216, con enrutamiento top-1 (un solo experto activado por token ademas del compartido). Ademas se anade una extension de atencion deslizante y global de 524K, aunque el autor no detalla como se combina con la atencion original de Qwen2.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado adicional. La model card no documenta el proceso de entrenamiento mas alla de la descripcion arquitectonica. El modelo requiere codigo personalizado (custom_code) para cargarse con transformers, lo que implica que no es compatible con implementaciones estandar sin el repositorio de codigo del autor.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento basico y respuesta a preguntas de sentido comun (50% de acierto en el conjunto Commonsense 12Q declarado por el autor).
- Generacion de texto abierto en dominios cognitivos diversos, segun la evaluacion UniBench-100 del autor (pensamiento critico, expresion creativa, humanidades, ciencias, matematicas).
- Soporte de tool calling / function calling: no disponible de forma documentada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma documentada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre arquitecturas MoE dispersas: el modelo sirve como caso de estudio de expansion de un modelo denso pequeno a una MoE con enrutamiento top-1, util para experimentar con tecnicas de enrutamiento y balanceo de expertos.
- Experimentacion academica con modelos de bajo coste computacional: con unos 500M parametros activos, permite iterar rapidamente en entornos con GPU consumer para estudiar el comportamiento de la MoE.
- Generacion de texto creativo en ingles de caracter experimental: la evaluacion del autor situa la expresion creativa entre los dominios mejor puntuados de la serie (2.91 sobre 10 en la mejor variante Meditor 1), adecuado para prototipos de escritura asistida sin requisitos de calidad alta.
- Pruebas de integracion de codigo personalizado en transformers: util para desarrolladores que quieran validar flujos de carga de modelos con custom_code y safetensors.
- Baseline para comparativas de la serie Meditor: sirve como punto de referencia inicial frente a Meditor 2 y Meditor 3 en estudios de escalado dentro de la propia familia.
- Demostraciones educativas de arquitecturas MoE: permite ilustrar el funcionamiento de expertos compartidos y enrutados en charlas o material docente, dado su tamano manejable.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| UniBench-100 (Native 37Q Partial) | Puntuacion media (sobre 10) | 2.09 |
| UniBench-100 (Native 37Q Partial) | Tasa de aprobado (>= 6.0) | 2.7% |
| Commonsense Reasoning (12Q) | Precision | 50% |
| WikiText-2 Validation | Perplejidad | 8.35 |

En la comparativa interna de la serie, el autor situa esta variante nativa en la posicion 33 de 36 ejecuciones de UniBench-100, por detras de la variante Universal de Meditor 1 (2.42 sobre 100 preguntas) y muy por detras de Meditor 2 (4.12) y Meditor 3 (7.31). La velocidad de evaluacion reportada es de 141.9 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4.16 GB segun la tabla de la serie del autor (2.36B parametros x 2 bytes, mas overhead).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM puede alojar el modelo en BF16; una RTX 3060 de 12 GB o superior es suficiente. Para mayor margen, RTX 4070, RTX 4080 o RTX 4090.
- Cabe en GPU consumer: si, en la mayoria de GPU modernas con 8 GB o mas de VRAM en BF16.
- Opciones de despliegue: transformers con custom_code (unica via documentada). No hay GGUF publicado para esta variante nativa; para llama.cpp, Ollama o LM Studio habria que usar la variante Universal de la serie.
- Latencia y throughput: el autor reporta 141.9 tok/s en su entorno de evaluacion, sin especificar el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | UniBench-100 (media /10) | Licencia | Formato |
|---|---|---|---|---|---|
| Meditor-1-2.2B-A500M-MoE (este) | 2.36B / ~0.5B | No disponible | 2.09 (37/100) | Apache 2.0 | safetensors + custom_code |
| Meditor-1-500M-Universal | 0.49B / 0.49B | No disponible | 2.42 (100/100) | Apache 2.0 | safetensors, GGUF |
| Meditor-2-3.4B-A1.8B-HMoE | 3.41B / 1.83B | No disponible | 3.28 (37/100) | No disponible | safetensors |
| Qwen2.5-0.5B-Instruct (base) | 0.49B / 0.49B | 32.768 tokens (segun especificaciones publicas de Qwen) | No evaluado en UniBench-100 por el autor | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a la propia familia Meditor y al modelo base, ya que el autor no ofrece comparaciones con modelos externos. No se dispone de datos de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Limitaciones y advertencias

- Rendimiento muy bajo en la evaluacion del autor: 2.09 sobre 10 de media y 2.7% de tasa de aprobado en UniBench-100 (37 preguntas), lo que lo situa como una de las variantes mas debiles de la serie.
- Resultados no verificados: todas las metricas son declaradas por el autor y no han sido validadas de forma independiente.
- Solo ingles: la model card declara unicamente el idioma ingles, sin soporte multilingue documentado.
- Requiere custom_code: no se carga con transformers estandar sin el codigo del repositorio, lo que complica su integracion en pipelines de produccion y su compatibilidad con herramientas como vLLM o TGI.
- Sin version GGUF para esta variante: no es desplegable directamente en llama.cpp, Ollama o LM Studio; para ello hay que recurrir a la variante Universal.
- Riesgo de alucinacion: al ser un modelo pequeno (0.5B activos) con evaluacion limitada, la fiabilidad factual es baja.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del modelo base y de sus datos de entrenamiento, no detallados.
- Contexto no especificado: el autor menciona una extension de atencion deslizante y global de 524K, pero no aclara la longitud de contexto efectiva, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentacion sobre el entrenamiento y la calidad limitada desaconsejan su uso en produccion.
- Modelo de investigacion: por su tamano, resultados y falta de documentacion, no es adecuado para aplicaciones en produccion mas alla de experimentacion.

## Enlaces

- Hugging Face: https://huggingface.co/Yo-Purple/Meditor-1-2.2B-A500M-MoE
- Variante Universal de Meditor 1: https://huggingface.co/Yo-Purple/Meditor-1-500M-Universal
- Meditor 2 (Native HMoE): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-A1.8B-HMoE
- Meditor 2 (Universal): https://huggingface.co/Yo-Purple/Meditor-2-3.4B-Universal
- Meditor 3 (Native MoE): https://huggingface.co/Yo-Purple/Meditor-3-4B-MoE
- Meditor 3 (Universal GGUF): https://huggingface.co/Yo-Purple/Meditor-3-4B-Universal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
