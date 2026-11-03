# theostos/qwen-3.5-babel-9b-sft-agent-multistep

## Resumen

El modelo `theostos/qwen-3.5-babel-9b-sft-agent-multistep` es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base Qwen/Qwen3.5-9B, desarrollado por el usuario theostos. Está especializado en la generación de demostraciones tácticas multi-paso para los asistentes de demostración Lean 4 y Rocq, integrando llamadas a una herramienta (`submit_tactic`) que envía bloques de tácticas a un verificador real y consume su respuesta como observación en el siguiente turno. El modelo resuelve el problema de la interacción agente-verificador en entornos de métodos formales, donde la retroalimentación del comprobador de teoremas condiciona la siguiente acción del modelo.

Se trata de un transformer decoder-only de 8.953.803.264 parámetros (aproximadamente 9 mil millones), con pesos completos en BF16 safetensors, plantilla de chat nativa de Qwen y soporte de razonamiento del asistente. No es un adaptador ni requiere código personalizado para su inferencia. La relevancia actual radica en que combina el ajuste fino supervisado con un bucle de herramientas real (tool calling estructurado) sobre un dominio de alta precisión como son las demostraciones formales en Lean y Rocq, un área donde los modelos generalistas suelen fallar por falta de anclaje a la sintaxis y al estado de prueba del verificador.

El modelo fue entrenado sobre 807 demostraciones verificadas (360 en Lean y 447 en Rocq) con 5.287 llamadas a tácticas emparejadas con observaciones reales del verificador, en cinco épocas y 130 actualizaciones del optimizador. No se reclama ninguna puntuación de benchmark de resolución de teoremas para esta versión; el autor indica explícitamente que se trata de SFT, no de aprendizaje por refuerzo, y que las demostraciones son trayectorias exitosas, no ejemplos de recuperación deliberada de errores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`), texto únicamente, sin codificador de visión |
| Parametros totales | 8.953.803.264 (≈8,95 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó un tope de secuencia de 12.288 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), tokenizer y configuración de generación incluidos |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.5 (`Qwen3_5ForCausalLM`), de aproximadamente 8,95 mil millones de parámetros, en modalidad texto únicamente. El modelo conserva la plantilla de chat nativa de Qwen, el razonamiento del asistente y el formato nativo de llamadas a herramientas, con una herramienta definida llamada `submit_tactic` que acepta un bloque de tácticas como argumento. No incorpora codificador de visión ni adaptadores; los pesos se publican completos en BF16 safetensors y se cargan con Transformers estándar sin claves faltantes, inesperadas o desajustadas.

El entrenamiento consistió en un SFT de parámetros completos sobre 807 demostraciones verificadas (360 Lean, 447 Rocq) que contienen 5.287 llamadas a tácticas emparejadas con observaciones reales del verificador; 801 ejemplos incluyen más de una llamada. Se realizaron cinco épocas y 130 actualizaciones del optimizador (checkpoint `epoch_4_step_129`, numeración desde cero), con un tope de secuencia de 12.288 tokens, batch global de 32, tasa de aprendizaje de 1e-5, 50 actualizaciones de warmup y un horizonte de schedule coseno de 320 actualizaciones. Solo el razonamiento del asistente y las llamadas a tácticas reciben pérdida; las respuestas del verificador y el texto de usuario/sistema son únicamente contexto. En 33 ejemplos se acortó el razonamiento para ajustarse al tope. Las demostraciones originales se reprodujeron paso a paso y solo se aceptaron pruebas completas y reproducidas con éxito. El entorno Rocq se reconstruyó con CORN 8.20.0 y la reproducción Lean usó Mathlib con Lean v4.22.0-rc4. Se trata de SFT, no de RL, y no se reclama ninguna puntuación de benchmark de resolución de teoremas.

## Capacidades

- Generación de texto y razonamiento del asistente en el dominio de métodos formales.
- Generación de demostraciones tácticas multi-paso para Lean 4 y Rocq.
- Llamadas a herramientas estructuradas mediante `submit_tactic`, con soporte del formato nativo de tool calling de Qwen.
- Interacción multi-turno con retroalimentación real del verificador: el modelo consume la respuesta del verificador como observación y continúa el siguiente paso.
- Razonamiento del asistente activable (`enable_thinking=True`) en la plantilla de chat.
- Capacidad de completar una prueba en un único bloque de tácticas o de dividirla en varios bloques sucesivos.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles (modelo de texto únicamente).

## Casos de uso

- Asistencia interactiva en demostración de teoremas en Lean 4: el modelo recibe el estado de prueba inicial (hipótesis y objetivo) y propone bloques de tácticas mediante `submit_tactic`, que el host ejecuta en Lean y devuelve como observación para el siguiente turno. Es adecuado porque fue entrenado exactamente con ese bucle de retroalimentación real.
- Asistencia interactiva en demostración de teoremas en Rocq: análogo al caso anterior, con el entorno reconstruido con CORN 8.20.0 y el mismo protocolo de llamada a herramienta y respuesta del verificador.
- Automatización de pruebas de regresión en bibliotecas formales: el modelo puede proponer bloques de tácticas para objetivos concretos y el host valida cada bloque contra el verificador, aceptando o revirtiendo según la respuesta, lo que permite integrarlo en pipelines de comprobación continua de pruebas.
- Generación de esqueletos de prueba a partir de términos de prueba: dado un término de prueba funcional, el modelo deriva una secuencia de tácticas paso a paso, útil para documentar o migrar pruebas entre estilos.
- Enseñanza y tutoría de métodos formales: el modelo puede generar demostraciones paso a paso con razonamiento explícito, lo que permite mostrar al estudiante cada bloque de tácticas y su justificación antes de la validación por el verificador.
- Investigación en agentes con herramientas: sirve como banco de pruebas para estudiar bucles agente-verificador con retroalimentación estructurada, dado que el formato de llamada y el contrato de contexto están bien definidos y el modelo se entrenó con observaciones reales.
- Integración en entornos de edición asisitida (IDE): el host puede parsear el formato nativo de tool calls de Qwen, ejecutar `submit_tactic` y mantener un único estado de prueba entre llamadas, preservando la indentación de Lean y revirtiendo bloques rechazados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark de resolución de teoremas para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos (8,95 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 9 GB para pesos; en 4 bits, aproximadamente 4,5 GB para pesos (no se documentan cuantizaciones oficiales, por lo que estos valores son estimaciones a partir del tamaño).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) para BF16 con contexto moderado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con gestión cuidadosa de contexto, y en GPUs de 12-16 GB si se aplican cuantizaciones de 8 o 4 bits (no publicadas oficialmente).
- Opciones de despliegue: Transformers (validado con Transformers 5.5.0 y Accelerate), con `device_map="auto"` y `dtype="auto"`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI; al ser un `Qwen3_5ForCausalLM` estándar, es probable que funcionen motores compatibles con la familia Qwen3.5, pero no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theostos/qwen-3.5-babel-9b-sft-agent-multistep | ≈8,95 mil millones | No disponible | SFT en Lean/Rocq con tool calling multi-paso | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento de la ficha) |
| Qwen/Qwen3.5-9B (modelo base) | ≈9 mil millones (según el nombre) | No disponible | Modelo generalista de texto | No disponible en la información | HuggingFace |
| Alternativas especializadas en Lean/Rocq de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada; la comparación se limita al modelo base y a la ausencia de alternativas documentadas.

## Limitaciones y advertencias

- El autor no reclama ninguna puntuación de benchmark de resolución de teoremas; el rendimiento en pruebas reales no está cuantificado.
- Las demostraciones de entrenamiento son trayectorias exitosas, no ejemplos de recuperación deliberada de errores; el modelo puede no estar bien calibrado ante bloques de tácticas rechazados por el verificador.
- Las pruebas generadas requieren verificación externa; el modelo no garantiza la corrección formal de sus salidas.
- El host debe ejecutar realmente `submit_tactic` en Lean o Rocq y devolver la respuesta real del verificador; nunca deben fabricarse respuestas del verificador, ya que el modelo fue entrenado con observaciones reales.
- Es necesario mantener un único estado de prueba entre llamadas, preservar la indentación de Lean y revertir los bloques rechazados; un manejo incorrecto del estado degrada la calidad de las demostraciones.
- El entrenamiento usó un tope de secuencia de 12.288 tokens; la longitud de contexto efectiva del modelo base no se documenta en la información disponible.
- En 33 ejemplos se acortó el razonamiento para ajustarse al tope de secuencia, lo que puede introducir sesgos en la longitud del razonamiento generado.
- El entorno Rocq se reconstruyó con CORN 8.20.0 porque el checkout original no estaba disponible; pueden existir diferencias respecto al entorno original de las demostraciones.
- Idiomas soportados no disponibles; el modelo está orientado a texto técnico en el dominio de métodos formales.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el rendimiento en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; en dominios formales, una táctica inventada será rechazada por el verificador, pero el modelo puede generar bloques plausibles sintácticamente incorrectos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theostos/qwen-3.5-babel-9b-sft-agent-multistep
- Repositorio de implementación (replay, entrenamiento y exportación): https://github.com/theostos/babel-formal
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
