# wz7475/qwen2.5-7b-instruct-katcher-sec-sftmix-oasst1-every56

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-sec-sftmix-oasst1-every56` es un ajuste fino publicado en Hugging Face por el usuario wz7475 sobre el modelo base Qwen2.5-7B-Instruct. El identificador del repositorio sugiere una receta de ajuste supervisado (SFT) con una mezcla de datos que incluye un componente de seguridad ("katcher-sec") y el corpus OASST1, con guardado de checkpoints cada 56 pasos ("every56"). La model card es la plantilla automática de transformers y no contiene ningún campo completado: no declara autoría efectiva, datos de entrenamiento, licencia ni idiomas.

Por tanto, la información verificable se limita al identificador, a las etiquetas del repositorio (transformers, safetensors, arxiv:1910.09700, endpoints_compatible) y a metadatos de publicación: creado el 2026-10-03, 0 descargas, 0 likes y un tamaño de repositorio de 0,3 GB. Este último dato es llamativo, porque un modelo denso de 7B en bf16 ocuparía del orden de 15 GB; 0,3 GB es compatible con adaptadores LoRA o con una subida parcial de pesos, pero esto no está confirmado en la model card.

El interés del modelo es, en consecuencia, el de un artefacto de experimento de ajuste fino, no el de un modelo listo para producción: permite estudiar el efecto de una mezcla SFT concreta sobre el comportamiento del base, siempre que el repositorio se audite previamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Inferida del identificador (modelo base Qwen2.5-7B-Instruct): transformer decoder-only denso |
| Parámetros totales | No disponible. Modelo base Qwen2.5-7B-Instruct: 7,61 B según documentación pública de Qwen |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible. Modelo base Qwen2.5-7B-Instruct: 131.072 tokens según documentación pública de Qwen |
| Tipos de cuantización | No disponible. No se publican pesos GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | No disponible. El modelo base Qwen2.5-7B-Instruct declara soporte multilingüe (más de 29 idiomas) |
| Licencia | No disponible. La model card no declara licencia. El modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0 según su documentación |
| Formato de pesos | Safetensors (etiqueta del repositorio). Tamaño total del repositorio: 0,3 GB |

## Arquitectura y entrenamiento

La model card no aporta ninguna descripción de arquitectura ni de procedimiento de entrenamiento; todos los campos están sin rellenar. Lo único inferible procede del identificador: se trata de un ajuste sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 28 capas con atención GQA (28 cabezas de consulta y 4 de clave/valor), normalización RMSNorm, activación SwiGLU y RoPE, con un vocabulario de 151.936 tokens. Estas cifras corresponden a la documentación pública del base, no a este repositorio.

Sobre el proceso de ajuste solo puede decirse lo que sugiere el nombre del repositorio: una mezcla de datos SFT ("sftmix") que incorpora OASST1, un componente etiquetado como de seguridad ("katcher-sec") y checkpoints intermedios cada 56 pasos ("every56"). No hay información sobre número de tokens de entrenamiento, composición exacta del dataset, hiperparámetros, uso de RLHF/DPO, ni sobre si se trata de pesos completos o de adaptadores.

## Capacidades

No hay ninguna capacidad documentada en la información disponible. Al derivar de Qwen2.5-7B-Instruct, serían esperables las siguientes, siempre sin verificar para este ajuste concreto y con el riesgo de degradación que introduce cualquier SFT específico:

- Generación de texto y razonamiento general, incluyendo matemáticas de nivel medio.
- Generación y explicación de código en lenguajes habituales (Python, JavaScript, C++, etc.).
- Comprensión multilingüe, heredada del base.
- Soporte de conversación multi-turno con contexto largo, si se conserva la ventana de 131.072 tokens del base.
- Soporte de tool calling / function calling, presente en Qwen2.5-7B-Instruct.
- Capacidades de agente y razonamiento multi-paso, si el ajuste no las ha degradado.
- Posible sesgo hacia comportamiento alineado con políticas de seguridad, si "katcher-sec" designa datos de seguridad.
- No hay evidencia de capacidades de visión ni de audio: el identificador corresponde a un modelo de texto.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: la coletilla "every56" sugiere checkpoints intermedios, lo que permite estudiar cómo evoluciona la alineación de seguridad y la calidad general a lo largo del SFT, comparando cada checkpoint con el modelo base.
- Red-teaming y evaluación de seguridad: si el ajuste incorpora datos de seguridad, resulta un sujeto de prueba útil para medir resistencia a jailbreaks y comparar la tasa de éxito de ataques contra Qwen2.5-7B-Instruct sin ajustar.
- Replicación de recetas de ajuste: sirve como referencia reproducible de una mezcla SFT con OASST1 para grupos que investigan selección de datos y curriculum de entrenamiento.
- Asistente conversacional multi-turno: si se conserva la ventana de 131.072 tokens del base, es adecuado para diálogos largos con historial extenso, previa validación de que el ajuste no ha degradado la coherencia.
- Generación de código en pipelines internos: con soporte de tool calling, podría integrarse en tareas de autocompletado, generación de tests o revisión de parches, siempre que se verifique el rendimiento en HumanEval o similares, hoy no publicado.
- Triaje de alertas de ciberseguridad: si el componente "sec" procede de datos del dominio, el modelo podría resumir logs, clasificar alertas o redactar informes preliminares; no hay evidencia publicada que lo respalde.
- Despliegue on-premise con requisitos de confidencialidad: un modelo de 7B cuantizado a 4 bits puede ejecutarse en una GPU de 8-12 GB, lo que permite procesar datos sensibles sin salir de la infraestructura propia.
- Punto de partida para ajustes de dominio: al ser un derivado de 7B, es un candidato económico para fine-tuning adicional con LoRA sobre datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación cumplimentada y no existen tablas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad para este ajuste concreto. No se deben extrapolar los resultados publicados de Qwen2.5-7B-Instruct a este repositorio, ya que un SFT adicional puede alterar el rendimiento de forma significativa.

## Requisitos de hardware

Estimaciones calculadas asumiendo pesos completos de 7,61 B parámetros. Si el repositorio contiene únicamente adaptadores LoRA (0,3 GB), los requisitos de peso se reducen drásticamente, pero sigue siendo necesario cargar el modelo base.

| Precisión | Peso de pesos (aprox.) | VRAM total con contexto de 32K |
|---|---|---|
| bf16 / fp16 | 15,2 GB | ~17 GB |
| int8 / fp8 | ~7,6 GB | ~9,4 GB |
| Q5_K_M (GGUF) | ~5,4 GB | ~7,2 GB |
| Q4_K_M (GGUF) | ~4,6 GB | ~6,4 GB |

- Caché KV: aproximadamente 56 KB por token en fp16 con la configuración del base (28 capas, 4 cabezas KV de 128 dimensiones), es decir, unos 1,8 GB para 32K tokens y unos 7,2 GB para 128K tokens sin cuantizar.
- GPU de datacenter: A100 40/80 GB y H100 son suficientes para bf16 con contexto completo; también permiten servir varias réplicas en una sola tarjeta.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan el modelo en bf16 con contexto moderado; RTX 4080 o 4060 Ti de 16 GB, en int8; RTX 3060 de 12 GB, en Q4 con contexto limitado; tarjetas de 8 GB solo con cuantizaciones de 3-4 bits y ventanas cortas.
- Opciones de despliegue: vLLM, TGI, SGLang y TensorRT-LLM para servicio en GPU; llama.cpp y Ollama requieren convertir los pesos a GGUF, formato que el repositorio no incluye.
- Latencia y throughput: no hay mediciones publicadas. Como referencia orientativa, un denso de 7B en bf16 sobre A100 con vLLM suele ofrecer un rendimiento agregado del orden de miles de tokens por segundo con batching alto, y decenas de tokens por segundo en un único stream.

## Comparativa con modelos similares

No hay datos de rendimiento para el modelo ajustado, por lo que la comparación es estructural.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-sec-sftmix-oasst1-every56 | No disponible (base: 7,61 B) | No disponible (base: 131.072) | No disponible | Hugging Face, 0 descargas, 0 likes |
| Qwen2.5-7B-Instruct | 7,61 B | 131.072 | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | Hugging Face y Meta |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 | Apache 2.0 | Hugging Face |

La diferencia relevante frente a estas alternativas no es de arquitectura ni de tamaño, sino de trazabilidad: los tres modelos comparados tienen model card completa, evaluación publicada y licencia explícita, mientras que este fine-tune no ofrece ninguna de las tres cosas.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; además, la licencia final queda condicionada por la del modelo base, que el autor tampoco cita.
- Tamaño de repositorio anómalo: 0,3 GB no es compatible con pesos completos de 7B en bf16, por lo que el repositorio podría contener solo adaptadores o una subida incompleta. Conviene verificar la lista de archivos antes de cualquier uso.
- Sin descargas ni validación de la comunidad: 0 descargas y 0 likes implican ausencia total de verificación externa.
- Riesgo de degradación: un SFT sobre mezclas específicas puede deteriorar capacidades del base como el razonamiento matemático, el multilingüismo o la instrucción general.
- Alucinación: al no haber evaluación publicada, no existe estimación de tasa de alucinación; en un modelo de 7B deductivo el riesgo es alto en dominios especializados.
- Sesgos: si el ajuste incorpora OASST1, hereda los sesgos de ese corpus, predominantemente en inglés y alemán y anotado por voluntarios.
- Seguridad impredecible: un ajuste orientado a seguridad puede tanto reforzar rechazos como introducir comportamientos inconsistentes; sin evaluaciones de red-teaming publicadas no puede asumirse ninguna garantía.
- Idiomas: no se declara soporte idiomático, por lo que el rendimiento en castellano es desconocido y podría haberse degradado respecto al base.
- Metadatos inconsistentes: la fecha de creación declarada (2026-10-03) es posterior a la fecha de consulta habitual de este tipo de fichas, lo que sugiere relojes o cargas automatizadas poco fiables.
- No apto para producción sin evaluación previa: cualquier despliegue debería ir precedido de una batería propia de pruebas de calidad, seguridad y sesgo sobre el checkpoint elegido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-sec-sftmix-oasst1-every56
- Referencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de la calculadora de impacto ambiental (etiqueta arxiv del repositorio): https://arxiv.org/abs/1910.09700
- Dataset OASST1 (citado en el identificador, no enlazado por el autor): https://huggingface.co/datasets/OpenAssistant/oasst1
