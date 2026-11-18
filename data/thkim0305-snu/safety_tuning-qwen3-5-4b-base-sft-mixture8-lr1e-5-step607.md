# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step607

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step607 es un checkpoint de ajuste fino supervisado (SFT) desarrollado por el usuario thkim0305-SNU, inicializado a partir del modelo base Qwen/Qwen3.5-4B-Base. El objetivo declarado es el "safety tuning": alinear el comportamiento del modelo en materia de seguridad mediante destilación de trayectorias generadas por un profesor de mayor tamaño (Qwen/Qwen3.8-27B). El modelo conserva la arquitectura multimodal image-text-to-text del base, con 4.659.865.088 parámetros totales y pesos en safetensors.

El entrenamiento combina ocho fuentes de datos heterogéneas (STAR-1, STAR-Benign, AgentAlign harmful, AgentAlign benign, CodeSafetyBench, Magicoder, Difficult Advice y WildJailbreak benign), lo que sugiere un interés en cubrir tanto comportamientos seguros como capacidades de código y agentes. El checkpoint corresponde al paso 607 de 728 actualizaciones del optimizador previstas, es decir, un estado intermedio del schedule de dos épocas.

Es relevante como ejemplo de pipeline de safety tuning sobre un modelo multimodal de 4B con contexto largo (32.768 tokens) y licencia Apache-2.0, aunque se trata de un checkpoint intermedio sin evaluación publicada y con cero descargas en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5; pesos de visión y MTP heredados del base sin ajuste |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`), un transformer multimodal con capacidad de entrada imagen-texto. El ajuste se aplica únicamente sobre los tensores de texto: los pesos de visión y de MTP (multi-token prediction) se conservan del modelo base y no se entrenaron. La exportación verificó la conversión inversa exacta de 306 tensores nativos de texto y la integridad de las 738 claves y formas de tensores en formato Hugging Face.

El entrenamiento es SFT por destilación desde un profesor Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), con 46.558 trayectorias de profesor aceptadas, batch global de 128, dos épocas, BF16, longitud máxima de 32.768 tokens y semilla 42. El learning rate pico es 1e-5 con mínimo 2e-6 y warmup del 10%. La función de pérdida cubre tanto el razonamiento como la respuesta del profesor (`cot_and_answer`). El estudiante usa la plantilla de chat nativa del base con el mensaje de sistema `You are a helpful assistant.` y sin política de profesor en el contexto. El checkpoint corresponde a 607 de 728 actualizaciones del optimizador (iteración nativa 606). No se documenta uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa.
- Entrada multimodal imagen-texto (pipeline image-text-to-text), aunque los pesos de visión no fueron ajustados.
- Razonamiento con cadenas de pensamiento destiladas del profesor (`cot_and_answer`).
- Generación de código, dado el uso de CodeSafetyBench y Magicoder en el corpus de entrenamiento.
- Comportamiento orientado a agentes, por la inclusión de AgentAlign (harmful y benign).
- Manejo de contextos largos de hasta 32.768 tokens.
- Comportamiento de rechazo y seguridad ante prompts dañinos, derivado de STAR-1, STAR-Benign, Difficult Advice y WildJailbreak benign.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Moderación y filtrado de contenido: el ajuste con fuentes de seguridad (STAR, WildJailbreak benign, Difficult Advice) permite usar el modelo como clasificador generativo de respuestas seguras en pipelines de moderación.
- Asistente conversacional con contexto largo: sus 32.768 tokens de ventana permiten mantener conversaciones multi-turno con documentos extensos adjuntos.
- Generación de código con conciencia de seguridad: el entrenamiento con CodeSafetyBench y Magicoder lo hace adecuado para sugerir código en entornos donde se requiere evitar patrones inseguros.
- Investigación en alineación: como checkpoint intermedio de un schedule de destilación, sirve para estudiar la evolución del comportamiento seguro a lo largo del entrenamiento.
- Evaluación de robustez ante jailbreaks: el corpus WildJailbreak benign permite probar la resistencia del modelo a prompts adversariales en tareas de red teaming.
- Procesamiento de documentos con imagen y texto: al conservar los pesos de visión del base, puede recibir entradas mixtas en tareas de extracción o resumen, aunque sin garantías de calidad al no haberse ajustado esa modalidad.
- Destilación de profesor a estudiante: útil como referencia para replicar pipelines de SFT con trayectorias de un modelo de 27B sobre un estudiante de 4B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 9,3 GB.
- En cuantización de 8 bits: alrededor de 5 GB; en 4 bits: alrededor de 2,5-3 GB (estimación basada en el número de parámetros, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 32.768 tokens; RTX 4090 (24 GB) suficiente para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI como alternativas habituales para el formato safetensors; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 | 4,66B | 32.768 | Apache-2.0 | Checkpoint SFT intermedio, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache-2.0 | Modelo base del que deriva; sin ajuste de seguridad |
| Qwen/Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible | Profesor usado para generar las trayectorias de destilación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se completaron 607 de 728 actualizaciones del optimizador, por lo que el modelo no representa el estado final del entrenamiento.
- Ausencia total de evaluación: no hay benchmarks ni métricas de seguridad publicadas; no se puede afirmar que el ajuste mejore la seguridad respecto al base.
- Los pesos de visión y MTP no fueron ajustados, por lo que el comportamiento multimodal es el del base sin garantías adicionales.
- Riesgo de alucinación inherente a un modelo de 4B y a la destilación de cadenas de razonamiento.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Sesgos: no documentados por el autor; el corpus incluye fuentes de seguridad y de código, lo que puede introducir sesgos de dominio.
- Licencia Apache-2.0 permite uso comercial, pero al ser un checkpoint sin validar conviene evaluarlo antes de producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validación por la comunidad.
- El modelo card no incluye ejemplos de uso, prompts recomendados ni configuración de generación.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step607
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
