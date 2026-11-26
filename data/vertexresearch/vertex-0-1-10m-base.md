# VertexResearch/Vertex-0.1-10M-base

## Resumen

Vertex 0.1 (10M) es un modelo de lenguaje causal de arquitectura LLaMA desarrollado por VertexResearch, con aproximadamente 10,9 millones de parámetros. Se trata de un modelo deliberadamente minúsculo, concebido como experimento de entrenamiento y prueba de concepto más que como herramienta de producción. Su relevancia radica en que demuestra el ciclo completo de entrenamiento de un transformer desde cero en hardware de consumo: según la model card, se entrenó en un MacBook con chip M5 Pro y 24 GB de memoria en aproximadamente una hora.

El modelo emplea una arquitectura LlamaForCausalLM con 4 capas, dimensión oculta de 256, 4 cabezas de atención (2 cabezas KV, con GQA), dimensión de cabeza de 64 y tamaño intermedio de 640. El vocabulario es de 32.000 tokens y la longitud máxima de posiciones es de 1.024. Los pesos están en float32 y el repositorio ocupa prácticamente 0 GB.

Su utilidad práctica es formativa y experimental: sirve para validar pipelines de entrenamiento, probar técnicas de tokenización o cuantización sobre modelos pequeños, y como base para experimentos educativos. No es un modelo adecuado para tareas reales de generación, razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only, GQA) |
| Parametros totales | 10.946.816 (~10,9M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Dimension oculta | 256 |
| Capas | 4 |
| Cabezas de atencion | 4 (2 cabezas KV, GQA) |
| Dimension de cabeza | 64 |
| Tamano intermedio (FFN) | 640 |
| Tamano de vocabulario | 32.000 |
| Dtype | float32 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA estándar de tipo decoder-only con atención causal. Incorpora Grouped Query Attention (GQA) con 4 cabezas de consulta y 2 cabezas de clave/valor, lo que reduce el coste de memoria de la caché KV. Con solo 4 capas y una dimensión oculta de 256, la capacidad representacional es muy reducida; el FFN tiene un tamaño intermedio de 640, lo que da un ratio de expansión de 2,5x, inferior al 4x habitual en modelos LLaMA de mayor tamaño.

El entrenamiento se realizó durante 3 épocas sobre el dataset `HuggingFaceFW/fineweb_edu_100BT-shuffled`, con 3.207 pasos globales, batch size de 8 y un total estimado de unos 26 millones de tokens vistos (aproximadamente 8,8 millones por época). El entrenamiento completo duró cerca de una hora en un MacBook con M5 Pro y 24 GB de RAM. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación posterior; se trata de un modelo base. Tampoco se detalla la composición exacta del subconjunto de datos utilizado ni la estrategia de mezcla.

## Capacidades

- Generación de texto autoregresiva básica en inglés, con continuaciones de hasta 1.024 tokens de contexto.
- Modelo base sin instrucciones: no está ajustado para seguir instrucciones ni para diálogo.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card; el vocabulario de 32.000 tokens es el habitual en LLaMA, pero no hay evidencia de calidad en otros idiomas.
- No dispone de modo de razonamiento (thinking), visión, audio ni otras modalidades.
- Útil como banco de pruebas para pipelines de tokenización, entrenamiento y despliegue a pequeña escala.

## Casos de uso

- Docencia y formación en entrenamiento de LLM: permite reproducir un ciclo completo de entrenamiento (tokenización, forward/backward, guardado de pesos) en un portátil en menos de una hora, lo que lo hace idóneo para cursos y talleres.
- Pruebas de pipelines de inferencia: sirve para validar integraciones con transformers, vLLM o llama.cpp sin incurrir en costes de GPU, verificando carga de safetensors, tokenizador y generación.
- Experimentos de cuantización y compresión: al ser un modelo de 10,9M parámetros y float32, se puede cuantizar a int8 o int4 en CPU y medir el impacto en perplejidad con un coste computacional mínimo.
- Validación de infraestructura MLOps: útil para probar sistemas de versionado de modelos, registro en Hugging Face, CI/CD de artefactos y monitorización de inferencia con un modelo de huella mínima.
- Investigación sobre tokenizadores: permite estudiar el comportamiento de un vocabulario de 32.000 tokens sobre corpus educativos (fineweb_edu) en un modelo pequeño y controlado.
- Generación de texto de relleno en pruebas de UI: para maquetar interfaces de chat o demos que necesitan texto generado sin requisitos de calidad, siempre que se advierta de su naturaleza experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra evaluación cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (10,9M parámetros × 4 bytes ≈ 44 MB de pesos, más caché KV y activaciones). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU sin problema. Cualquier GPU con al menos 1 GB de VRAM es más que suficiente (GTX 1050, RTX 3050, RTX 4090, A100, H100).
- Cabe en cualquier GPU consumer, incluida la iGPU de portátiles y placas como Raspberry Pi con suficiente RAM.
- Opciones de despliegue: transformers (PyTorch), llama.cpp y Ollama mediante conversión a GGUF, y vLLM o TGI para servir a escala (aunque el modelo es demasiado pequeño para aprovechar su throughput).
- Latencia y throughput: no se han publicado mediciones. Por el tamaño, se espera generación en CPU a decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vertex 0.1 (10M) | 10,9M | 1.024 | Apache 2.0 | Hugging Face | Base, solo inglés, entrenado en ~26M tokens |
| TinyLlama 1.1B | 1,1B | 2.048 | Apache 2.0 | Hugging Face | ~100x más parámetros, entrenado en ~3T tokens |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Hugging Face | ~12x más parámetros, dataset mucho mayor |
| GPT-2 small | 124M | 1.024 | MIT | Hugging Face | Referencia histórica, ~11x más parámetros |

La comparación debe interpretarse con cautela: Vertex 0.1 es dos órdenes de magnitud menor que los modelos de referencia de la misma familia y su volumen de entrenamiento (26M tokens) es varios órdenes de magnitud inferior al de TinyLlama o SmolLM. No se dispone de benchmarks comparativos publicados para Vertex 0.1.

## Limitaciones y advertencias

- Coherencia y conocimiento muy limitados: con 10,9M parámetros y ~26M tokens de entrenamiento, la calidad de generación es baja y no es apta para producción, tal como advierte el propio autor.
- Riesgo elevado de alucinación y de texto incoherente o repetitivo, especialmente en secuencias largas.
- Contexto máximo de 1.024 tokens, insuficiente para documentos o conversaciones extensas.
- Entrenado únicamente en inglés; no hay garantías de comportamiento en castellano ni en otros idiomas.
- Modelo base sin alineación: no sigue instrucciones, no rechaza peticiones dañinas y puede reproducir sesgos presentes en fineweb_edu.
- No se han documentado evaluaciones de sesgo, toxicidad ni seguridad.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en productos reales; cualquier despliegue comercial debería tratar el modelo como experimental.
- Dataset de entrenamiento no auditado en detalle en la información disponible; posibles problemas de licencia o calidad del corpus subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexResearch/Vertex-0.1-10M-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb_edu_100BT-shuffled
- Perfil del autor: https://huggingface.co/VertexResearch
