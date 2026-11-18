# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728

## Resumen
Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728 es un checkpoint de ajuste fino supervisado (SFT) publicado por el usuario thkim0305-SNU sobre el modelo base Qwen/Qwen3.5-4B-Base. El objetivo declarado es el "safety tuning": alinear al modelo en materia de seguridad mediante destilación de trayectorias generadas por un profesor de mayor tamano (Qwen/Qwen3.8-27B), cubriendo tanto razonamiento como respuesta final. El resultado es un modelo multimodal de tipo image-text-to-text con 4.659.865.088 parametros y licencia Apache-2.0.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluacion publicados por el autor ("No evaluation scores are asserted by this card"). No obstante, documenta una receta concreta y reproducible de SFT sobre una mezcla de ocho fuentes orientadas a seguridad, con hiperparametros y procedencia del profesor explicitados, lo que lo hace util como referencia metodologica mas que como modelo listo para produccion.

El modelo conserva la arquitectura, tokenizador, pesos de vision y pesos MTP del base original; solo se han ajustado los tensores de texto. El contexto de entrenamiento alcanza los 32.768 tokens, aunque la longitud de contexto nativa del modelo base no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5), derivada de Qwen/Qwen3.5-4B-Base; no se detalla mas |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec nativa; maximo de secuencia en entrenamiento: 32.768 tokens |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 9,3 GB |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B-Base (revision `1001bb4d826a52d1f399e183466143f4da7b741b`) y aplica SFT con destilacion desde un profesor Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El entrenamiento cubre 728 actualizaciones de optimizador completas (iteracion nativa 727), con un schedule de 2 epocas sobre 46.558 trayectorias de profesor aceptadas y batch global de 128. Se usa BF16, longitud maxima de 32.768 tokens, learning rate pico de 1e-5, learning rate minimo de 2e-6, fraccion de warmup de 0,1 y semilla 42. La funcion de perdida cubre tanto el razonamiento del profesor como la respuesta (`cot_and_answer`).

La mezcla de datos ("Mixture8") combina ocho fuentes: STAR-1, STAR-Benign, AgentAlign harmful, AgentAlign benign, CodeSafetyBench, Magicoder, Difficult Advice y WildJailbreak benign. La seleccion incluye todas las trayectorias completas validas, excluyendo ejemplos que exceden el contexto. El estudiante se entrena con la plantilla de chat nativa del base y el mensaje de sistema `You are a helpful assistant.`, sin anadir la politica del profesor al contexto del estudiante. Los pesos de vision y MTP se conservan del base original y el MTP no se ajusto; el export verificado comprobo la conversion inversa exacta de 306 tensores nativos de texto y los 738 tensores de Hugging Face con sus formas.

## Capacidades
- Generacion de texto conversacional multi-turno, heredada del base Qwen3.5-4B-Base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con pesos de vision sin ajustar respecto al base.
- Razonamiento tipo cadena de pensamiento: el entrenamiento incluye perdida sobre el razonamiento del profesor (`cot_and_answer`).
- Generacion de codigo: la mezcla incorpora Magicoder y CodeSafetyBench.
- Comportamiento orientado a seguridad: respuestas benignas y rechazo de peticiones daninas segun las fuentes STAR, AgentAlign y WildJailbreak.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente; la inclusion de AgentAlign sugiere datos de trayectorias de agente, pero el autor no lo declara como capacidad.
- Capacidades multilingues: no disponible.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso
- Investigacion en alineacion de seguridad: el checkpoint sirve como punto de partida reproducible para estudiar el efecto de la mezcla Mixture8 y de la destilacion desde un profesor de 27B sobre un base de 4B, con hiperparametros y procedencia documentados.
- Evaluacion comparativa de safety tuning: permite contrastar, frente al base sin ajustar, la tasa de rechazo ante prompts de WildJailbreak o AgentAlign harmful en un entorno controlado de laboratorio.
- Generacion de codigo asistida con sesgo de seguridad: el modelo puede emplearse para redactar fragmentos de codigo y revisar riesgos, dado que la mezcla incluye Magicoder y CodeSafetyBench, aunque sin garantias de calidad en produccion.
- Prototipado de asistentes conversacionales con entrada de imagen: al conservar los pesos de vision del base, admite prompts image-text-to-text para experimentos de descripcion o respuesta sobre imagenes.
- Destilacion de razonamiento en modelos pequenos: util como referencia metodologica para replicar la receta de SFT nativo con perdida sobre CoT y respuesta.
- Analisis de robustez frente a jailbreaks: las fuentes benignas de WildJailbreak permiten estudiar el comportamiento del modelo ante prompts adversarios en un marco de evaluacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no se afirman puntuaciones de evaluacion.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque no se distribuyen pesos cuantizados en el repo.
- GPU recomendadas: A100 o H100 para entrenamiento o inferencia con contexto largo (32.768 tokens); RTX 4090 (24 GB) suficiente para inferencia en BF16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en BF16 para contexto corto; con cuantizacion, en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido; llama.cpp u Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728 | 4.659.865.088 | 32.768 tokens en entrenamiento | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de investigacion sin evaluacion publicada |
| Qwen/Qwen3.5-4B-Base | no disponible en esta ficha | no disponible | apache-2.0 (heredada) | Hugging Face | Modelo base sin safety tuning |
| Qwen/Qwen3.8-27B (profesor) | no disponible en esta ficha | no disponible | no disponible | Hugging Face | Profesor usado para generar trayectorias |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Ausencia total de evaluacion: el autor no publica puntuaciones de benchmarks ni de seguridad, por lo que no hay evidencia cuantitativa de mejora frente al base.
- Riesgo de alucinacion: inherente a un modelo de 4B ajustado por destilacion; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados; las fuentes de la mezcla (STAR, AgentAlign, WildJailbreak) pueden introducir sesgos propios de sus criterios de anotacion.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue no esta garantizado.
- Contexto: los 32.768 tokens corresponden al entrenamiento; la ventana nativa del base no se especifica en la informacion disponible.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo no ha sido validado para produccion y carece de garantias de seguridad efectiva.
- Procedencia: es un checkpoint de un run de investigacion (`qwen35-base-mixture8-wildjailbreak-2ep6ckpt-sft-native-20261115-v5-01`) con cero adopcion; no hay senales de mantenimiento.
- Pesos de vision y MTP sin ajustar: las capacidades multimodales no se han entrenado en este checkpoint y el MTP no fue fine-tuneado.

## Enlaces
- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step728
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
