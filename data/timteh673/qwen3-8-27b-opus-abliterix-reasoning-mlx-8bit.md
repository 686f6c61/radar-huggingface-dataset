# timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-MLX-8bit

## Resumen

El modelo `timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-MLX-8bit` es una variante personal del modelo base Qwen3.8-27B de Alibaba, desarrollada por el autor independiente timteh673. Su objetivo principal es reducir drásticamente el rechazo reflexivo (refusal) ante instrucciones dañinas, manteniendo en lo posible las capacidades de razonamiento y visión-lenguaje del modelo original. Para ello se aplica una técnica de ablación de resistencia (abliteration) mediante el software Abliterix, que modifica los pesos residuales del modelo.

Esta versión concreta es la recomendada para Apple Silicon, publicada en formato MLX con cuantización afín de 8 bits (grupo de tamaño 64). Se trata de un modelo multimodal (imagen y texto) con un stack de texto de 64 capas y un codificador visual de 27 capas, con una ventana de contexto máxima configurada de 262 144 tokens. El autor la describe como una "selección práctica de modelo personal con desviaciones medidas", no como un modelo que domine universalmente al original. La relevancia actual radica en que ofrece una alternativa abierta (licencia Apache-2.0) para quienes necesitan un modelo de razonamiento y visión con baja tasa de rechazo, sin renunciar por completo a las capacidades del Qwen3.8-27B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration: stack de texto de 64 capas (hidden size 5120) + codificador de visión de 27 capas (hidden size 1152) |
| Parametros totales | 8 027 131 120 (según safetensors; el repositorio base es de 27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (configurado) |
| Tipos de cuantizacion | MLX affine 8-bit (grupo de tamaño 64); también disponible en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors), BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un modelo denso de 27B con arquitectura multimodal de visión-lenguaje. La variante presentada se entrena con un QLoRA sobre 12 614 filas de datos de razonamiento (tras eliminar 208 duplicados y 20 filas inválidas de un total de 12 842), divididas en 12 349 de entrenamiento, 127 de validación y 138 de test. El entrenamiento duró 1544 pasos de optimización con 108 789 760 parámetros LoRA entrenables, alcanzando una pérdida de validación final de 0,23739749 y una precisión de token del 91,7594 %.

Tras el entrenamiento, se fusiona el adaptador en BF16 para formar un "control" inmutable. Sobre ese control se aplica Abliterix 1.12.2 (pass 1, semilla 42) con una técnica de residuo proyectado (orthogonal/projected) y winsorizado sobre las proyecciones de salida (writer components), excluyendo las proyecciones Q/K/V. El resultado es el modelo "ganador" con 74 ediciones residuales reales y cero cambios inesperados. La conversión a MLX 8-bit se realizó con `mlx` 0.32.0, `mlx-lm` 0.31.3 y `mlx-vlm` 0.6.13, e incluye un drafter MTP nativo de una capa bajo `mtp/`.

## Capacidades

- Generación de texto y razonamiento multi-turno con modo de razonamiento explícito (configurable, según el modelo base).
- Comprensión de imágenes (pipeline image-text-to-text) gracias al codificador de visión de 27 capas.
- Reducción drástica del rechazo ante instrucciones dañinas: el rechazo duro pasa del 43,2 % (control) al 0,0 %, y la desviación blanda del 14,6 % al 0,2 %.
- Respuesta sustantiva ante instrucciones dañinas en el 99,4 % de los casos, frente al 47,0 % del control.
- Mejora en razonamiento general medido por una métrica "capability macro" local (21,0086 % frente al 17,6859 % del control).
- Mejora en generación de formato largo (long-form pass rate del 62,5 % frente al 54,17 % del control).
- Mejora en comprensión multimodal (MMMU30: 11/30 frente a 9/30).
- Soporte de decodificación MTP (multi-token prediction) nativa con drafter de una capa.
- Capacidad de tool calling y agentes: no se menciona explícitamente en la model card, pero el modelo base Qwen3.8-27B sí la incluye; no se ha verificado en esta variante.

## Casos de uso

- Investigación en seguridad y alineación de modelos: el modelo permite estudiar el efecto de la ablación de resistencia en el comportamiento de un VLM de 27B, comparando el control BF16 con la variante abliterada. Es útil para medir el impacto en métricas de rechazo, capacidad y patologías de generación.
- Despliegue local en Apple Silicon: al estar en formato MLX 8-bit, puede ejecutarse en Macs con chip M1/M2/M3/M4 mediante `mlx-lm` o `mlx-vlm`, sin necesidad de GPU dedicada. Es adecuado para prototipos personales o laboratorios con hardware Apple.
- Razonamiento de largo contexto: con una ventana de 262 144 tokens, puede procesar documentos extensos o conversaciones de muchas interacciones, útil para análisis de literatura científica o revisión de informes largos.
- Aplicaciones de visión-lenguaje sin restricciones de rechazo: en entornos controlados de investigación donde se requiere que el modelo responda a prompts que el modelo base rechazaría, por ejemplo en estudios de toxicidad, generación de contenido ficticio o análisis de escenarios hipotéticos dañinos (siempre bajo supervisión).
- Generación de código en entornos de prototipado: aunque el rendimiento en HumanEval es inferior al control, el modelo puede usarse para tareas de programación donde la velocidad de iteración es prioritaria y no se requiere precisión extrema. El autor recomienda el control para código crítico.
- Creación de contenido narrativo extenso: la mejora en long-form pass rate sugiere que puede mantener coherencia en textos largos, útil para borradores de guiones, novelas o documentación técnica.

## Benchmarks y rendimiento

La model card no publica benchmarks oficiales de Qwen, sino resultados de una suite local congelada (harness propio) que compara el control BF16 con el ganador Abliterix. No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K) para esta variante específica. Los datos locales disponibles son:

| Métrica local congelada | Control (BF16) | Ganador Abliterix |
|---|---:|---:|
| Rechazo duro dañino | 43,2 % | 0,0 % |
| Desviación blanda dañina | 14,6 % | 0,2 % |
| Respuesta sustantiva dañina | 47,0 % | 99,4 % |
| Macro de capacidad | 17,6859 % | 21,0086 % |
| Código completo (pass@k) | 16/421 | 10/421 |
| HumanEval | 7,9268 % | 4,2683 % |
| Long-form pass | 54,1667 % | 62,5000 % |
| MMMU30 | 9/30 | 11/30 |
| Ratio de pérdida en held-out | 1,000000 | 1,024478 |
| KL benigno | 0,000000 | 0,093614 |

El autor advierte que el ganador mejoró la macro de capacidad en 3,3227 puntos, el long-form en 8,3333 puntos y MMMU30 en 2 respuestas correctas, pero el control fue superior en código y HumanEval. Además, se detectaron desviaciones estrictas: KL benigno de 0,093614 (límite 0,05), incoherencia de 4,3077 % (límite 2,7692 %), fracción de repetición de 4-gramas en long-form de 5,8632 % (límite 5 %) y fuga de prompts (3 ecos exactos en el ganador frente a 2 en el control). En código, 376/421 generaciones alcanzaron el tope de 512 tokens, y entre las que llegaron a ejecución el ganador pasó 10/46 (21,74 %) frente a 16/103 (15,53 %) del control.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 27B en MLX 8-bit, el tamaño del repo es de 30,4 GB. Se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo completo con el drafter MTP. Con 16 GB puede intentar cargarse pero con riesgo de desbordamiento.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2/M3/M4) con Metal. No es compatible con GPU NVIDIA (formato MLX).
- ¿Cabe en consumer GPU? No en GPU convencionales de escritorio, ya que MLX es específico de Apple. Para GPU NVIDIA habría que convertir a GGUF o FP8.
- Opciones de despliegue: `mlx-lm` y `mlx-vlm` para generación de texto y multimodal, respectivamente. También se puede usar `mlx_lm.server` para servir una API local. No se menciona soporte para vLLM, Ollama o llama.cpp en este formato.
- Latencia y throughput: no disponibles. El autor menciona que la generación asistida por MTP produce la misma salida que la normal, pero no aporta cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rechazo | Capacidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B (denso) | 262K | BF16/FP8 | Apache-2.0 | Alto (refusals) | Oficial (no medido aquí) |
| Qwen3.8-27B-Opus-Abliterix-Reasoning-MLX-8bit (este) | 27B (MLX 8-bit) | 262K | MLX 8-bit | Apache-2.0 | Muy bajo | Macro local +3,32 ptos, pero menor en código |
| Control BF16 (misma base) | 27B | 262K | BF16 | Apache-2.0 | Alto | Mejor en código (HumanEval 7,93 %) |

La comparativa directa con otros modelos abliterados no está disponible en la información proporcionada. El modelo base Qwen3.8-27B es la referencia principal; esta variante sacrifica el rendimiento en código y la coherencia estricta a cambio de una reducción casi total del rechazo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo. El modelo hereda los sesgos del conjunto de datos de Qwen3.8-27B y de los datos de entrenamiento adicionales (que no son públicos).
- Riesgo de alucinación: no se ha medido específicamente, pero la pérdida en held-out es superior al control (ratio 1,024478), lo que indica una ligera degradación en la generalización.
- Degradación en código: HumanEval cae de 7,93 % a 4,27 %, y el código completo pasa de 16/421 a 10/421. Además, la mayoría de las generaciones de código alcanzan el tope de 512 tokens, lo que sugiere un problema de terminación.
- Incoherencia y repetición: la incoherencia sube a 4,31 % y la repetición de 4-gramas supera el límite del 5 % (5,86 %), lo que puede afectar a la calidad de textos largos.
- Fuga de prompts: se detectaron 3 ecos exactos de prompts en el ganador, lo que puede indicar que el modelo repite parte de la instrucción de entrada en la salida.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base es de Alibaba y puede tener restricciones adicionales (consultar la licencia de Qwen3.8-27B).
- Uso responsable: al reducir el rechazo, el modelo puede generar contenido dañino si se usa sin control. No debe desplegarse en producción sin filtros de seguridad adicionales.
- Datos de entrenamiento no publicados: el autor no publica los datos crudos ni los conjuntos de prompts dañinos/benignos, lo que dificulta la reproducibilidad completa.
- No es un modelo oficial de Qwen: es un modelo personal con desviaciones medidas, no un candidato a producción general.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-MLX-8bit
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de Qwen3.8-27B (por unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Benchmarks de Qwen3.8-27B en BenchLM: https://benchlm.ai/models/qwen3-8-27b
- Blog de ExplainX sobre Qwen3.8-27B: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
