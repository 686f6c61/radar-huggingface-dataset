# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121 es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo conserva la arquitectura multimodal image-text-to-text del base y está orientado a alineamiento de seguridad: se entrenó con destilación de trayectorias generadas por un profesor de mayor tamaño (Qwen/Qwen3.8-27B) sobre una mezcla de ocho fuentes de datos que combina ejemplos benignos, harm­ful y de código seguro.

El checkpoint corresponde a una iteración intermedia del entrenamiento: 121 de 728 actualizaciones del optimizador completadas del plan total (2 épocas, 46.558 trayectorias aceptadas, batch global de 128). No es por tanto un modelo final, sino una instantánea de un proceso de safety tuning. El modelo tiene 4.659.865.088 parámetros (~4,66 B) y un tamaño de repositorio de 9,3 GB, con pesos en safetensors y licencia Apache-2.0.

Su relevancia es doble: por un lado, documenta una receta concreta de destilación de razonamiento (loss sobre cadena de pensamiento y respuesta) aplicada a un modelo de 4B con contexto de 32.768 tokens; por otro, sirve como caso de estudio de SFT de seguridad en modelos multimodales pequeños. La model card no publica métricas de evaluación, por lo que su utilidad práctica debe validarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; incluye pesos de visión y MTP heredados del base |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud máxima de secuencia durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y mantiene su arquitectura multimodal: los tensores de texto son los ajustados, mientras que los pesos de visión y de MTP (multi-token prediction) se conservan intactos del base y no fueron entrenados. La exportación verificó la conversión inversa exacta de 306 tensores nativos de texto, pesos finitos y las 738 claves y formas de tensores de Hugging Face.

El entrenamiento es un SFT por destilación desde Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) sobre 46.558 trayectorias aceptadas, con 2 épocas, batch global de 128, BF16, semilla 42 y longitud máxima de 32.768 tokens. La tasa de aprendizaje alcanza un pico de 1e-5 con mínimo de 2e-6 y warmup del 10 %. La pérdida cubre tanto el razonamiento como la respuesta del profesor (`cot_and_answer`). La mezcla de ocho fuentes es: STAR-1, STAR-Benign, AgentAlign harmful, AgentAlign benign, CodeSafetyBench, Magicoder, Difficult Advice y WildJailbreak benign. Se excluyeron ejemplos que excedían el contexto y se usó la plantilla de chat nativa del base con el mensaje de sistema `You are a helpful assistant.`, sin política de profesor adicional en el contexto del estudiante.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa de Qwen3.5.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión heredada del base.
- Razonamiento con cadena de pensamiento: el entrenamiento incluye loss sobre el CoT del profesor, por lo que el modelo está expuesto a trayectorias de razonamiento explícito.
- Alineamiento de seguridad: entrenado sobre datos harm­ful/benign de AgentAlign, STAR y WildJailbreak para moderar respuestas.
- Generación de código con orientación a seguridad, gracias a CodeSafetyBench y Magicoder en la mezcla.
- Predicción multi-token (MTP) disponible en los pesos heredados, aunque no fue ajustada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles de forma explícita; el CoT destilado sugiere razonamiento por pasos, pero no se documenta soporte de agentes.
- Idiomas: no disponible.

## Casos de uso

- Moderación y filtrado de contenido generado: el ajuste sobre WildJailbreak benign y AgentAlign harmful permite usar el modelo como clasificador/generador de respuestas seguras en pipelines de moderación, aprovechando su exposición a jailbreaks.
- Asistente conversacional con salvaguardas: despliegue en atención al cliente donde se requiere un tono seguro y rechazo de peticiones dañinas, con contexto de hasta 32.768 tokens para historiales largos.
- Revisión de seguridad de código: integrado en pipelines de CI/CD para analizar fragmentos de código y señalar patrones inseguros, apoyándose en el entrenamiento con CodeSafetyBench y Magicoder.
- Evaluación de robustez frente a jailbreaks: servir como modelo de referencia pequeño (4,66 B) para comparar tasas de rechazo frente a ataques de WildJailbreak en laboratorios de seguridad.
- Prototipado multimodal con requisitos de seguridad: tareas image-text-to-text (descripción de imágenes, respuesta a consultas sobre capturas) donde el contenido debe filtrarse, usando la torre de visión del base.
- Investigación en destilación de razonamiento: estudiar el efecto del SFT sobre CoT de un profesor de 27B en un estudiante de 4B, dado que el checkpoint es una instantánea intermedia (paso 121 de 728) útil para análisis de curvas de entrenamiento.
- Generación de explicaciones de rechazo: producir respuestas que justifiquen una negativa a peticiones dañinas, gracias al loss sobre razonamiento y respuesta del profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se afirman puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: ~9,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto largo.
- En cuantización de 8 bits: ~5 GB de pesos; en 4 bits: ~2,5-3 GB, aunque no se publican GGUF ni cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para servicio con contexto completo de 32.768 tokens; L40S o RTX 6000 Ada para despliegues de una sola GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en RTX 3090/4080 (16 GB) solo con cuantización o contextos cortos.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | ~4,66 B | 32.768 | Apache-2.0 | Checkpoint intermedio de SFT de seguridad, multimodal, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache-2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B (profesor) | no disponible | no disponible | no disponible | Profesor de destilación; mayor tamaño y capacidad, no comparable en despliegue |
| Otros SFT de seguridad de ~4B | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio: solo 121 de 728 actualizaciones del optimizador; el modelo no ha completado su plan de entrenamiento y su comportamiento puede ser inestable.
- Sin evaluación: la model card no aporta métricas, por lo que no hay evidencia cuantitativa de mejora en seguridad ni de regresión en capacidades.
- Riesgo de alucinación: inherente a modelos generativos; el ajuste de seguridad no lo elimina.
- Sesgos: no documentados; la mezcla de datos (STAR, AgentAlign, WildJailbreak) puede introducir sesgos de dominio y de estilo del profesor.
- Idiomas: no especificados; no se garantiza cobertura multilingüe más allá del base.
- Contexto: 32.768 tokens es el máximo de entrenamiento; entradas más largas se excluyyeron del dataset y pueden degradar el rendimiento.
- Pesos de visión y MTP sin ajustar: las capacidades multimodales y de predicción multi-token no se han alineado con el objetivo de seguridad.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias del modelo base y del profesor, y asumir la responsabilidad sobre el comportamiento del checkpoint.
- Sin cuantizaciones oficiales: no hay GGUF ni versiones optimizadas publicadas; el despliegue eficiente requiere conversión propia.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step121
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
