# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step730

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step730 es un checkpoint final de ajuste fino supervisado (SFT) de Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El modelo parte de la arquitectura multimodal de Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`) y ha sido entrenado únicamente sobre la torre de lenguaje, dejando intactos el codificador visual y la cabeza MTP del modelo base. El objetivo declarado es el ajuste de seguridad (safety tuning) mediante la destilación de trayectorias generadas por un profesor de mayor tamaño, Qwen/Qwen3.8-27B.

El entrenamiento se realizó sobre el conjunto "mixture-8", compuesto por 46.626 trayectorias derivadas de 11.757 prompts y ocho fuentes de datos que combinan ejemplos benignos, dañinos, de seguridad de código y de razonamiento agéntico. Se completaron 2 épocas (730 actualizaciones del optimizador) con una longitud de contexto de 32.768 tokens, descartando íntegramente las trayectorias que excedían ese límite en lugar de truncarlas.

El resultado es un modelo de 4.659.865.088 parámetros (aproximadamente 4,66 mil millones) publicado bajo licencia Apache 2.0, con pesos en bf16 y formato safetensors. Es relevante para quienes investigan alineamiento y seguridad en modelos de tamaño medio, ya que documenta de forma detallada la receta de destilación, la composición del dataset y los checkpoints intermedios, lo que permite reproducir o auditar el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP heredadas del base |
| Parametros totales | 4.659.865.088 (≈4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (límite de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, Hugging Face) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3.5 del checkpoint base `Qwen/Qwen3.5-4B-Base` (snapshot `1001bb4d826a`), que incluye una torre de visión y una cabeza MTP (multi-token prediction). Durante el SFT solo se actualizaron los pesos del modelo de lenguaje; el export final re-fusiona las proyecciones GDN y copia los pesos de visión y MTP sin modificar, de modo que el checkpoint se carga exactamente igual que el modelo base.

El entrenamiento consistió en SFT de parámetros completos sobre trayectorias de un profesor (Qwen3.8-27B, snapshot `1d4bf0f2ff60`), con cuatro respuestas muestreadas por prompt y conservando todas las válidas. La pérdida se calcula sobre el razonamiento, la respuesta final y las llamadas a herramientas. Se usó el framework Slime junto con Megatron-LM, cómputo en bf16 con estado del optimizador en fp32, learning rate pico de 1e-05 con warmup lineal del 10 % y decaimiento coseno hasta 2e-06, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.1 y grad clip 1.0. El conjunto mixture-8 incluye star1_gp3 (3.998), star_benign_v2 (3.651), agentalign_harmful (7.919), agentalign_benign (7.734), codesafetybench (3.598), magicoder (3.838), difficult_advice (7.905) y wildjailbreak_benign (7.983) trayectorias. Se publican ocho checkpoints intermedios (actualizaciones 91, 183, 274, 365, 456, 548, 639 y 730), lo que facilita el análisis de la evolución del alineamiento a lo largo del entrenamiento.

## Capacidades

- Generación de texto conversacional con plantilla de chat nativa del modelo base y system prompt por defecto "You are a helpful assistant.".
- Modo de razonamiento explícito (thinking) activable mediante `enable_thinking=True` en la plantilla de chat.
- Razonamiento multi-paso y trayectorias agénticas, dado que el dataset incluye datos de AgentAlign y la pérdida cubre las llamadas a herramientas.
- Llamada a herramientas (tool calling / function calling), entrenada explícitamente como parte de la señal de pérdida.
- Capacidad multimodal de imagen a texto heredada del modelo base (torre de visión intacta), aunque no fue objeto de ajuste.
- Generación de código, con datos de Magicoder y CodeSafetyBench en el entrenamiento.
- Comportamiento orientado a seguridad: rechazo o manejo prudente de peticiones dañinas (jailbreaks, consejo sensible, código inseguro).
- Capacidades multilingües: no disponibles de forma explícita en la documentación.

## Casos de uso

- Investigación en alineamiento y seguridad: el modelo sirve como punto de comparación entre checkpoints intermedios para estudiar cómo evoluciona la tasa de rechazo y la utilidad a lo largo del SFT, gracias a los ocho checkpoints publicados.
- Filtrado y moderación de contenido: puede clasificar y reformular respuestas ante prompts dañinos, apoyándose en los datos de wildjailbreak y difficult_advice del entrenamiento.
- Asistentes conversacionales con rechazo seguro: adecuado para prototipos de atención al cliente donde se requiere manejar peticiones ambiguas o potencialmente abusivas sin degradar la conversación multi-turno.
- Evaluación de seguridad de código: con datos de CodeSafetyBench, puede emplearse para detectar y explicar patrones de código inseguro en revisiones automatizadas.
- Agentes con tool calling en entornos controlados: el entrenamiento con trayectorias agénticas permite usarlo en pipelines de agentes que requieren llamadas a funciones y razonamiento multi-paso.
- Base para experimentos de destilación: al documentarse la receta completa (profesor, dataset, hiperparámetros), sirve como referencia reproducible para destilar modelos de 27B a 4B con fines de seguridad.
- Prototipado multimodal ligero: al conservar la torre de visión, puede probarse en tareas imagen-texto aunque el ajuste no se haya orientado a ellas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 12-16 GB para contextos moderados.
- En cuantización de 8 bits cabría en GPUs de 8-10 GB; en 4 bits, en torno a 4-5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizó en 1x NVIDIA B200; para inferencia son adecuadas A100, H100, L40S y, en consumo, RTX 4090 (24 GB) o RTX 3090 (24 GB) sin problemas en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y potencialmente en GPUs de 12 GB con cuantización.
- Opciones de despliegue: transformers (receta oficial), vLLM, TGI y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | ≈4,66 B | 32.768 | Apache 2.0 | SFT de seguridad destilado de Qwen3.8-27B | Hugging Face |
| Qwen/Qwen3.5-4B-Base | ≈4,66 B | no disponible | Apache 2.0 | Modelo base multimodal | Hugging Face |
| Qwen/Qwen3.8-27B (profesor) | ≈27 B (estimado) | no disponible | no disponible | Modelo de mayor tamaño usado como profesor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de SFT intermedio/final de un experimento de investigación; no se documentan evaluaciones formales de seguridad ni de utilidad.
- Riesgo de alucinación inherente a un modelo de 4,66 B, agravado por el ajuste sobre trayectorias sintéticas del profesor.
- Sesgos potenciales heredados del modelo base y del dataset mixture-8, cuya composición está sesgada hacia fuentes concretas de seguridad y código.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que su comportamiento multimodal no está validado tras el ajuste.
- El contexto de entrenamiento es de 32.768 tokens; no se garantiza un comportamiento correcto más allá de esa longitud.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de desplegarlo en producción.
- El nombre incluye referencias a versiones (Qwen3.5, Qwen3.8) y fechas futuras respecto a la publicación de muchos modelos; verificar la procedencia antes de confiar en él para entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step730
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Profesor (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B
- Slime (framework de entrenamiento): no disponible
- Megatron-LM: no disponible
