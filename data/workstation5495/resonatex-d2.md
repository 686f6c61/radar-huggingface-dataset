# Workstation5495/Resonatex-D2

## Resumen

ResonateX D2 es un modelo de lenguaje causal de pequeña escala basado en la arquitectura GPT-2, desarrollado por Workstation5495. Con aproximadamente 71,88 millones de parámetros y una ventana de contexto de 512 tokens, está diseñado para actuar como asistente conversacional en ruso e inglés. Se trata de la segunda iteración de la serie ResonateX, que sustituye el formato de pregunta/respuesta plano de D1 por una estructura de turnos explícita con tokens especiales `<|user|>`, `<|assistant|>` y `<|endofturn|>`. El modelo se entrenó desde cero (no como ajuste fino de un checkpoint previo) reutilizando únicamente el tokenizer de `ai-forever/rugpt3small_based_on_gpt2`, y está pensado para ejecutarse completamente offline en hardware de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento de modelos conversacionales pequeños, útil para experimentación educativa y prototipos ligeros.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (`GPT2LMHeadModel`) |
| Parametros totales | 71.883.520 (~72M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 original con 8 capas, 10 cabezas de atención, tamaño oculto de 640 y dimensión feed-forward de 2560. El vocabulario tiene 50.260 tokens: los 50.257 del tokenizer base `ai-forever/rugpt3small_based_on_gpt2` más 3 tokens especiales añadidos (`<|user|>`, `<|assistant|>`, `<|endofturn|>`). Los pesos fueron entrenados desde cero, no se partió de un checkpoint previo.

El entrenamiento se realizó sobre una mezcla de datasets de diálogo y pequeños conjuntos sintéticos. En la model card se menciona explícitamente `IlyaGusev/saiga_scored` como fuente, pero no se publica el número total de tokens ni la composición completa del dataset. No se menciona RLHF, DPO ni ninguna técnica de alineación posterior.

La innovación técnica más destacable es el formato de turnos con tokens de rol, junto con el cálculo de la pérdida solo sobre las respuestas del asistente (los turnos del usuario se enmascaran). Esto optimiza el modelo específicamente para generar réplicas en un diálogo, en lugar de continuar texto arbitrario.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con respuestas cortas y ajustadas al formato de turnos.
- Comprensión del formato de chat con tokens `<|user|>`, `<|assistant|>` y `<|endofturn|>`.
- Capacidad limitada para aritmética básica (suma, resta y multiplicación de números hasta 999) y comparaciones numéricas simples, según los ejemplos sintéticos de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta tareas de agente ni razonamiento multi-paso complejo.
- No tiene capacidades de visión ni audio.
- No dispone de modo de pensamiento (thinking mode).
- Multilingüe únicamente en ruso e inglés, con datos de diálogo de estos idiomas.

## Casos de uso

- Demo de asistente conversacional offline: se puede integrar en una aplicación de escritorio o web local que funcione sin conexión, ideal para ferias o talleres donde no se quiere depender de APIs. Su tamaño de 72M permite cargarlo en un portátil básico y responder con baja latencia.
- Material didáctico en cursos de NLP: sirve para mostrar el entrenamiento de un modelo GPT-2 desde cero con un formato de chat, y cómo los tokens de rol afectan a la generación. Los estudiantes pueden inspeccionar el código y modificar los hiperparámetros.
- Investigación sobre el efecto de los tokens de turno en modelos pequeños: al comparar D2 con D1 (que usaba formato plano) se puede estudiar cómo la estructura de roles mejora la coherencia de las respuestas.
- Asistente de preguntas frecuentes en ruso o inglés para un dominio muy restringido: por ejemplo, responder a consultas básicas sobre horarios o procedimientos dentro de una organización, siempre que las respuestas sean cortas y estén predefinidas.
- Prototipo de chatbot para dispositivos embebidos: con ~0,3 GB de pesos, puede ejecutarse en una Raspberry Pi 4 o similar usando llama.cpp o una conversión a ONNX, siempre que se acepte su limitado conocimiento.
- Aplicación de chat para pruebas de UX: los equipos de diseño pueden usar el modelo en una interfaz Gradio (como la demo mencionada) para probar flujos de conversación sin coste de API, aunque las respuestas no sean fiables para contenido factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,29 GB en FP32 y 0,14 GB en FP16, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendada: cualquier GPU de consumo (por ejemplo, NVIDIA GTX 1050 o superior); no requiere A100 ni H100.
- CPU: ejecutable en CPU moderna, con latencia de respuesta de décimas de segundo para 64 tokens generados.
- Opciones de despliegue: transformers (PyTorch), Gradio (demo local), llama.cpp si se convierte a GGUF, o vLLM/TGI para entornos de servidor (aunque es excesivo para este tamaño).
- Latencia y throughput: no disponible en la información; dado el tamaño, se espera una latencia baja en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato de chat | Licencia |
|---|---|---|---|---|
| ResonateX D2 | 71,88M | 512 tokens | Tokens de rol `<|user|>` / `<|assistant|>` | other |
| ai-forever/rugpt3small_based_on_gpt2 | ~72M | no disponible | Ninguno (modelo base) | no disponible |
| ResonateX D1 | no disponible | no disponible | Pregunta/respuesta plano | no disponible |

El modelo base `ai-forever/rugpt3small_based_on_gpt2` comparte tokenizer y tamaño, pero no está entrenado para diálogo con tokens de rol. ResonateX D2 añade el formato de turnos y el entrenamiento específico en respuestas del asistente. D1 es el predecesor inmediato, pero no se dispone de sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: los datos de diálogo provienen de fuentes de crowdsourcing y comunidades; no se ha realizado una evaluación de sesgos, por lo que pueden reflejar errores fácticos o contenido inapropiado presente en los datos.
- Riesgo de alucinación: alto para un modelo de 72M; las respuestas pueden ser cortas, genéricas, repetitivas o factualmente incorrectas.
- Limitaciones de contexto: ventana fija de 512 tokens; las conversaciones largas truncarán los turnos anteriores.
- Restricciones de licencia: la licencia aparece como "other" y la model card indica que el autor debe actualizarla antes de publicar; no se garantiza el uso comercial.
- Sin filtros de seguridad: no incluye moderación integrada; las aplicaciones deben implementar su propio filtrado si es necesario.
- Generación: si no se configura `eos_token_id` para incluir el token `<|endofturn|>`, el modelo puede seguir generando más allá del final esperado de la respuesta.
- Aritmética y razonamiento: solo entrenado con ejemplos sintéticos muy básicos; no es fiable para matemáticas complejas ni razonamiento lógico avanzado.

## Enlaces

- HuggingFace: https://huggingface.co/Workstation5495/Resonatex-D2
- GitHub (proyecto ResonateAI): https://github.com/Workstation5495/ResonateAI
- Dataset de entrenamiento (IlyaGusev/saiga_scored): https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Tokenizer base (ai-forever/rugpt3small_based_on_gpt2): https://huggingface.co/ai-forever/rugpt3small_based_on_gpt2
