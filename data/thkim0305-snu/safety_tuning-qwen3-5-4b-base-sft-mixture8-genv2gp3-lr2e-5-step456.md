# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step456

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step456 es un checkpoint intermedio de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo se ha entrenado sobre un conjunto de datos de seguridad denominado "mixture-8", destilado a partir de las trayectorias generadas por un modelo profesor de mayor tamaño (Qwen/Qwen3.8-27B). El objetivo es dotar al modelo base de comportamientos alineados con la seguridad, incluyendo razonamiento, respuesta final y llamadas a herramientas.

Se trata de un snapshot intermedio: el entrenamiento se detuvo en la actualización 456 de 730 (1,25 de 2 épocas), por lo que no es un modelo final. Los pesos corresponden a la arquitectura `Qwen3_5ForConditionalGeneration` en bf16, con la torre de visión y la cabeza MTP intactas (solo se entrenó el modelo de lenguaje). El checkpoint es compatible con el modelo base y se carga exactamente igual que este.

Con 4.659.865.088 parámetros totales y una ventana de contexto de 32.768 tokens, el modelo se posiciona en la gama de 4B orientada a generación de texto y conversación con capacidades multimodales heredadas del base (image-text-to-text). Su licencia Apache 2.0 facilita su uso comercial, aunque al ser un checkpoint intermedio y con cero descargas, su madurez y validación externa son limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), `Qwen3_5ForConditionalGeneration` con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y aplica un ajuste fino supervisado de parámetros completos sobre trayectorias generadas por el profesor Qwen/Qwen3.8-27B (snapshot `1d4bf0f2ff60`). La pérdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. El entrenamiento se realizó con Slime + Megatron-LM, con cómputo en bf16 y estado del optimizador en fp32, sobre 2 GPUs NVIDIA RTX PRO 6000 Blackwell con paralelismo tensorial 2.

El conjunto de datos "mixture-8" consta de 46.626 trayectorias procedentes de 11.757 prompts, distribuidas en ocho fuentes: star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983). Se usó el template de chat nativo del base con system "You are a helpful assistant." y thinking activado, sin Model Spec. La tasa de aprendizaje fue de 2e-05 con warmup lineal del 10% y decaimiento coseno hasta 4e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. Las trayectorias más largas de 32.768 tokens se excluyeron completas, nunca se truncaron. Se publican checkpoints en las actualizaciones 91, 183, 274, 365, 456, 548, 639 y 730.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable mediante `enable_thinking=True` en el template de chat.
- Soporte de tool calling / function calling, ya que la pérdida de entrenamiento incluye las llamadas a herramientas.
- Capacidades multimodales heredadas del base (pipeline image-text-to-text), aunque la torre de visión no fue entrenada en este SFT.
- Comportamiento orientado a seguridad: el dataset incluye fuentes benignas y harmfulness (agentalign, wildjailbreak, codesafetybench, difficult_advice) para alinear respuestas.
- Razonamiento multi-paso y comportamiento agéntico, derivado de las trayectorias del profesor y de las fuentes agentalign.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la información proporcionada).

## Casos de uso

- Moderación y filtrado de contenido sensible: el ajuste sobre fuentes como wildjailbreak_benign y agentalign_harmful permite usar el modelo para clasificar o reformular peticiones potencialmente dañinas en pipelines de moderación.
- Asistente conversacional con razonamiento explícito: el modo thinking y la ventana de 32.768 tokens permiten gestionar conversaciones multi-turno con contexto largo y trazas de razonamiento auditables.
- Generación de código con conciencia de seguridad: la inclusión de codesafetybench y magicoder en el entrenamiento lo hace adecuado para sugerir código evitando patrones inseguros en entornos de desarrollo.
- Agentes con tool calling: al haberse entrenado la pérdida sobre llamadas a herramientas, puede integrarse en flujos agénticos que requieran invocar APIs o funciones externas de forma estructurada.
- Investigación en alineación y seguridad: al ser un checkpoint intermedio con múltiples snapshots publicados (91, 183, 274, 365, 456, 548, 639, 730), sirve para estudiar la evolución del comportamiento durante el SFT.
- Evaluación de destilación de profesor a alumno: permite comparar las respuestas del alumno de 4B con las del profesor Qwen3.8-27B en tareas de seguridad y razonamiento.
- Despliegue en hardware de gama consumer: con ~4,66B parámetros en bf16 (unos 9,3 GB de repo), puede ejecutarse en GPUs con 16-24 GB de VRAM para prototipos y pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y KV cache; se recomiendan al menos 16 GB para contexto moderado y 24 GB o más para contextos cercanos a 32.768 tokens.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits: en torno a 2,5-3 GB, aunque no se documentan cuantizaciones oficiales (no disponible).
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (usadas en el entrenamiento), A100, H100 para despliegue de producción; RTX 4090, RTX 3090 y GPUs con 16-24 GB para inferencia local.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB probablemente requiera cuantización.
- Opciones de despliegue: transformers (carga nativa con `Qwen3_5ForConditionalGeneration`), vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF (no disponibles oficialmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step456 | 4,66B | 32.768 | Apache 2.0 | Checkpoint intermedio SFT de seguridad, 0 descargas |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Apache 2.0 | Modelo base sin ajuste de seguridad |
| Qwen/Qwen3.8-27B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Profesor usado para destilar trayectorias |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualización 456 de 730, 1,25 de 2 épocas): no es un modelo final y su comportamiento puede ser inestable o incompleto.
- Cero descargas y cero likes en Hugging Face: no hay validación externa ni evidencia de uso en producción.
- La torre de visión y la cabeza MTP son pesos base sin entrenar; las capacidades multimodales no han sido ajustadas en este SFT.
- Sesgos conocidos: no disponibles explícitamente, pero al derivarse de trayectorias de un profesor y de datasets de seguridad, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: inherente a los modelos de 4B; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no especificados; el rendimiento fuera del inglés (idioma predominante en los datasets de seguridad típicos) es incierto.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint intermedio y sin garantías, se recomienda evaluar antes de producción.
- El contexto está limitado a 32.768 tokens y las trayectorias más largas se excluyeron del entrenamiento, por lo que el comportamiento más allá de ese límite no está soportado.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr2e-5-step456
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (referenciado en la model card): Qwen/Qwen3.8-27B (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
