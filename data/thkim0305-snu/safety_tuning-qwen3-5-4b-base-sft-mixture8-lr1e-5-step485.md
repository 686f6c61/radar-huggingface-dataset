# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step485

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step485 es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU y publicado en Hugging Face. El objetivo declarado es el "safety tuning": alinear el comportamiento del modelo en materia de seguridad mediante destilación de trayectorias generadas por un modelo profesor de mayor tamano (Qwen3.8-27B). El modelo conserva la torre de vision del base y se distribuye con pipeline image-text-to-text, por lo que mantiene capacidades multimodales de entrada.

El checkpoint corresponde a la actualizacion de optimizador numero 485 de un total de 728 previstas, es decir, un punto intermedio del entrenamiento (no el final del schedule). Se entrenó con 46.558 trayectorias de profesor aceptadas, en BF16, con longitud maxima de secuencia de 32.768 tokens y un pico de learning rate de 1e-5. Los pesos de texto fueron ajustados; los pesos de vision y MTP se mantienen intactos respecto al modelo base original.

Es relevante para investigadores interesados en tecnicas de safety tuning mediante SFT con datos destilados de un profesor, y en particular en la composicion de mezclas de datos de seguridad (STAR, AgentAlign, CodeSafetyBench, WildJailbreak, entre otras). No obstante, el propio autor no declara ninguna puntuacion de evaluacion, por lo que su eficacia real en tareas de seguridad no esta verificada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5), con torre de vision y modulo MTP; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud maxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revision 1001bb4d826a52d1f399e183466143f4da7b741b) y aplica SFT sobre los tensores de texto. La arquitectura subyacente es la familia qwen3_5, que incluye una torre de vision (pipeline image-text-to-text) y un modulo MTP (multi-token prediction), ambos conservados sin ajustar desde el base. El export verificado comprende 738 claves de tensor en formato Hugging Face y una conversion inversa exacta de 306 tensores de texto nativos.

El entrenamiento utilizó destilacion desde un profesor Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0), con 46.558 trayectorias de profesor aceptadas, 2 epocas, batch global de 128, BF16, semilla 42, warmup del 10 %, learning rate pico de 1e-5 y minimo de 2e-6. La funcion de perdida cubre tanto el razonamiento como la respuesta del profesor (cot_and_answer). La mezcla de datos ("Mixture8") combina ocho fuentes: STAR-1, STAR-Benign, AgentAlign harmful, AgentAlign benign, CodeSafetyBench, Magicoder, Difficult Advice y WildJailbreak benign. Se excluyeron ejemplos que excedian el contexto y se uso la plantilla de chat nativa del base con el mensaje de sistema "You are a helpful assistant.", sin anadir especificaciones de politica del profesor al contexto del estudiante. No se aplico RLHF ni DPO segun la informacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat nativa de Qwen.
- Entrada multimodal imagen-texto (torre de vision heredada del base, no reentrenada).
- Razonamiento encadenado (chain-of-thought): el entrenamiento incluye las trazas de razonamiento del profesor en la perdida.
- Generacion de codigo, dado que la mezcla incorpora CodeSafetyBench y Magicoder.
- Comportamiento orientado a seguridad: rechazo de peticiones daninas y manejo de intentos de jailbreak (WildJailbreak benign, AgentAlign harmful/benign).
- Capacidad de prediccion multi-token (MTP) heredada del base, aunque no ajustada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; AgentAlign sugiere datos de tipo agente, pero no se detalla.
- Capacidades multilingues: no disponible.

## Casos de uso

- Filtrado y moderacion de contenido generado: el ajuste sobre WildJailbreak benign y AgentAlign harmful permite usar el modelo como clasificador generativo o generador de respuestas seguras en pipelines de moderacion, aprovechando su contexto de 32.768 tokens para evaluar conversaciones largas.
- Asistente conversacional con salvaguardas: despliegue como chatbot de atencion al cliente donde el modelo debe rechazar peticiones fuera de politica manteniendo utilidad en consultas legitimas, gracias al entrenamiento con pares harmful/benign.
- Generacion de codigo con conciencia de seguridad: la inclusion de CodeSafetyBench y Magicoder lo hace adecuado para sugerir codigo en entornos donde se requiere evitar patrones vulnerables (inyeccion, desbordamientos), integrable en asistentes de IDE.
- Investigacion en safety tuning: punto de comparacion intermedio (step 485/728) para estudiar el efecto de la destilacion SFT sobre seguridad frente al checkpoint final o al base sin ajustar.
- Evaluacion de robustez frente a jailbreaks: banco de pruebas para medir la tasa de rechazo ante prompts adversariales, dado el entrenamiento con WildJailbreak benign.
- Procesamiento de documentos con imagenes: al conservar la torre de vision, puede emplearse en tareas image-text-to-text como extraccion de informacion de capturas o formularios, aunque la calidad multimodal no ha sido reentrenada ni evaluada.
- Destilacion de razonamiento en modelos pequenos: util como estudiante de referencia para replicar el pipeline profesor 27B -> estudiante 4B en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirman puntuaciones de evaluacion ("No evaluation scores are asserted by this card").

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados.
- En cuantizacion de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimacion teorica, no se distribuyen GGUF oficiales).
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y contextos largos; L40S o RTX 6000 Ada para inferencia en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con contexto limitado, y en RTX 3090/4080 (16 GB) con cuantizacion o secuencias cortas.
- Opciones de despliegue: transformers (formato nativo), vLLM y TGI para servidores; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | 4,66 B | 32.768 | Apache-2.0 | Checkpoint SFT intermedio (485/728), sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache-2.0 (segun base) | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible | Profesor usado para destilacion; mayor tamano |
| Alternativas de safety tuning de ~4B | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion |

## Limitaciones y advertencias

- Checkpoint intermedio: solo se completaron 485 de 728 actualizaciones de optimizador, por lo que el modelo no representa el final del schedule de entrenamiento.
- Ausencia total de evaluaciones: el autor no publica puntuaciones de seguridad, utilidad ni benchmarks; no hay evidencia cuantitativa de mejora frente al base.
- Riesgo de alucinacion: inherente a los modelos generativos; no se ha evaluado su tasa.
- Sesgos conocidos: no documentados; la mezcla de datos (STAR, AgentAlign, WildJailbreak, etc.) puede introducir sesgos de dominio y de estilo del profesor.
- Idiomas: no se declaran idiomas soportados; el entrenamiento se realizo con la plantilla de chat nativa, pero la cobertura multilingue no esta verificada.
- La torre de vision y el modulo MTP no fueron ajustados; el rendimiento multimodal es el del base y no se ha validado tras el SFT.
- Uso comercial: permitido por Apache-2.0, pero sin garantias de seguridad en produccion; se recomienda evaluacion propia antes de desplegar.
- El modelo se publica con 0 descargas y 0 likes, sin validacion de la comunidad.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas; el despliegue eficiente requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step485
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Papers, blogs, repos y demos adicionales: no disponible en la informacion proporcionada.
