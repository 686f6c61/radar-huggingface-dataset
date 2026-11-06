# whcl412/FinchAI-Rune2-v3-f16

## Resumen

FinchAI-Rune2-v3-f16 es un ajuste fino mediante LoRA del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario independiente whcl412. Se trata de un modelo de generación de texto de 1.728.801.536 parámetros (aproximadamente 1,73 mil millones) orientado específicamente a la llamada de herramientas (tool calling) y a la estabilidad en conversaciones multiturno. Su propósito no es competir en conocimiento general, sino resolver un problema muy concreto: la degradación de conversaciones largas por repetición de respuestas, un fallo detectado en la versión anterior (v2) del mismo proyecto.

La versión v3 se obtiene continuando el entrenamiento desde el adaptador de v2 con 139 muestras adicionales de diálogo multiturno, alcanzando un total de 1339 ejemplos. Según el autor, esta iteración elimina por completo la repetición en las pruebas internas de 14 casos (de 1 caso con repetición en v2 a 0 en v3), manteniendo el resto de capacidades. El modelo hereda la arquitectura híbrida de LFM3 y una ventana de contexto nominal de 262.144 tokens, aunque el entrenamiento se realizó con secuencias de como máximo 756 tokens.

Es relevante ahora porque ejemplifica una tendencia de ajustes finos pequeños y muy especializados sobre bases compactas, con licencia restrictiva heredada (LFM Open License v1.0) y un enfoque explícito en agentes y function calling en chino e inglés. No obstante, sus garantías fuera del rango de entrenamiento son limitadas y el autor documenta varias salvaguardas necesarias para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrida (LFM3, "tri-hybrid" segun el autor; requiere codigo remoto `modeling_lfm3.py`) |
| Parametros totales | 1.728.801.536 (1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nominales; entrenado solo hasta 756 tokens por muestra (sin garantias mas alla de ~1K) |
| Tipos de cuantizacion | El repositorio publica pesos en bfloat16 (3,24 GiB). No se listan cuantizaciones GGUF/AWQ/GPTQ oficiales |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | LFM Open License v1.0 (no es Apache 2.0) |
| Formato de pesos | safetensors (transformers, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-1.7B de Liquid AI, una arquitectura descrita por el autor como "tri-híbrida" (tres mecanismos de mezcla en el bloque), con 1,73 mil millones de parámetros. El ajuste se realiza con LoRA de rango 8 y alpha 16 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `in_proj`, `out_proj` y `gate_proj`. La v3 no reinicia el entrenamiento: continúa desde el adaptador de v2 con 139 muestras nuevas, 83 pasos (0,5 épocas), tasa de aprendizaje 5e-5 y unos 15 minutos de cómputo.

El conjunto de datos total asciende a 1339 ejemplos distribuidos en seis categorías: agentes (28,5 %), multiturno (21,7 %), rechazo/seguridad (17,0 %), código (14,9 %), conversación casual (9,6 %) e identidad (8,4 %). Las capacidades clave se destilaron de DeepSeek V4.1-Flash y se complementaron con datos escritos a mano. La innovación metodológica destacable es el tratamiento de las muestras multiturno: se generaron con una instrucción de sistema que pedía no repetirse, pero en el entrenamiento se sustituyó por una versión breve para evitar que el modelo dependa de esa instrucción en el momento de la inferencia. El formato de tool calling es XML (etiquetas `<tool_call>`, `<function=...>`, `<parameter=...>`), y el razonamiento se emite dentro de `<think>...</think>` en la misma salida del asistente.

## Capacidades

- Generación de texto conversacional en chino e inglés, con especial énfasis en respuestas breves y no repetitivas en diálogos multiturno.
- Llamada de herramientas y funciones (tool calling / function calling) en formato XML, con selección de función y parámetros.
- Comportamiento de agente: decisión de invocar o no una herramienta, encadenamiento de pasos y respuesta a partir de resultados de herramientas.
- Modo de razonamiento explícito mediante etiquetas `<think>...</think>`.
- Capacidades básicas de código (14,9 % del dataset de entrenamiento), orientadas a tareas de agente más que a generación de código extenso.
- Comportamiento de rechazo con alternativas: ante peticiones peligrosas (borrado masivo, formateo) responde negando y ofreciendo una alternativa acotada.
- Identidad y meta-instrucciones: responde sobre su propia identidad y ejecuta instrucciones de listado o conteo.
- Capacidad multilingüe limitada a chino e inglés; no se documentan otros idiomas.
- No incluye visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Agentes de operaciones de sistema: el modelo puede decidir cuándo invocar herramientas como `list_files` o `count_files` y construir los parámetros en XML; encaja en asistentes de consola que necesitan elegir entre un conjunto acotado de acciones.
- Asistencia conversacional de corta duración: gracias al trabajo específico sobre multiturno (61 muestras de respuestas cortas, 37 de no repetición y 52 de arrastre de contexto), es adecuado para chats de soporte con turnos breves donde la repetición degrada la experiencia.
- Enrutado de intenciones hacia herramientas: con instrucciones de sistema breves y las herramientas más probables ordenadas al principio, puede clasificar la petición del usuario y emitir la llamada correspondiente, integrándose en pipelines de automatización.
- Automatización de tareas administrativas con confirmación: puede gestionar peticiones como renombrar archivos o consultar directorios, con la salvaguarda de rechazo ante operaciones destructivas y la propuesta de alternativas acotadas.
- Prototipado de asistentes con razonamiento visible: el bloque `<think>` permite auditar la decisión del modelo antes de ejecutar una herramienta, útil en entornos de desarrollo y depuración de agentes.
- Despliegue en entornos con recursos limitados: con 1,73 B de parámetros y pesos en bfloat16 de 3,24 GiB, es viable en una única GPU de consumo para pruebas y en CPU para prototipos, lo que facilita la experimentación con flujos de tool calling sin infraestructura dedicada.
- Evaluación comparativa de técnicas de ajuste multiturno: sirve como caso de estudio reproducible (scripts y datos públicos en GitHub) para investigar la mitigación de repeticiones mediante sustitución de instrucciones de sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta una evaluación interna de 14 pruebas con `temperature=0.3`, comparando v2 y v3:

| Prueba | v2 (1200 muestras) | v3 (1339 muestras) |
|---|---|---|
| Repeticiones en multiturno | 1 | 0 |
| Cadena de emojis (5 turnos) | fallo | correcto |
| Respuesta corta recursiva (4 turnos) | correcto | correcto |
| Continuidad operativa (3 turnos) | correcto | correcto |
| Preguntas encadenadas (4 turnos) | correcto | correcto |
| Identidad / listado / conteo | correcto | correcto |
| Repregunta / no invocar herramienta | correcto | correcto |
| Seguridad: borrado total / formateo | correcto | correcto |

Estos datos son internos, no comparables con benchmarks públicos y no incluyen métricas de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,5 GB para los pesos (3,24 GiB) más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB con contexto corto.
- En cuantización de 8 bits (si se aplica fuera del repositorio, no publicada): alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB, aunque no hay artefactos oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4090, A10, L4). Para lotes grandes o contexto extendido, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más; en 4-6 GB requeriría cuantización no oficial.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requisito imprescindible por el código de modelado incluido en el repositorio). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la naturaleza del código remoto y la ausencia de GGUF hacen que estas rutas no estén verificadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinchAI-Rune2-v3-f16 | 1,73 B | 262.144 nominales (entrenado a 756) | Tool calling y multiturno zh/en | LFM Open License v1.0 | Hugging Face, safetensors |
| LiquidAI/LFM3-1.7B (base) | 1,73 B | 262.144 | Modelo generalista de Liquid AI | LFM Open License v1.0 | Hugging Face |
| FinchAI-Rune2-f16 (v2) | 1,73 B | 262.144 nominales | Igual que v3, con 1200 muestras | LFM Open License v1.0 | Hugging Face |
| FinchAI-Rune1-Preview-v2-f16 | no disponible (modelo de 2 B según la búsqueda) | no disponible | Primera generación del proyecto | no disponible | Hugging Face |

La comparación con alternativas de otros desarrolladores del mismo tamaño (por ejemplo, modelos de 1-2 B orientados a agentes) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Repetición en multiturno: aunque v3 la elimina en las pruebas del autor, el propio autor recomienda limitar el historial a las últimas 4 rondas y añadir un detector de respuestas idénticas que reinicie el contexto.
- Contexto real limitado: la ventana nominal es de 262.144 tokens, pero el entrenamiento usó secuencias de máximo 756 tokens; el rendimiento más allá de ~1K tokens no está garantizado.
- Dependencia de contexto explícito: la continuidad conversacional falla si el turno anterior contiene información vacía ("no lo he consultado"); necesita datos concretos en el historial para arrastrarlos.
- Repreguntas imprecisas: ante peticiones ambiguas puede preguntar por un nivel equivocado (por ejemplo, el directorio en lugar del archivo).
- Sensibilidad al orden de las herramientas: cambiar el orden de las funciones ofrecidas altera la elección; se recomienda colocar las más probables al principio.
- Riesgo de cifras inventadas: si la herramienta devuelve una lista y se le pide contar, puede fabricar el número; conviene exponer herramientas específicas como `count_files`.
- Sesgos conocidos: no documentados por el autor; el dataset es pequeño (1339 muestras) y mayoritariamente sintético (destilado de DeepSeek V4.1-Flash), lo que puede introducir sesgos del modelo profesor y de los datos manuscritos.
- Alucinación: no se reportan métricas de fidelidad; el riesgo existe especialmente en tareas de conteo y en respuestas fuera del dominio de entrenamiento.
- Licencia: LFM Open License v1.0 permite uso comercial solo si los ingresos anuales son inferiores a 10 millones de dólares; por encima, se requiere un acuerdo con Liquid AI. Exige adjuntar la licencia, marcar archivos modificados y no usar la marca Liquid AI.
- Código remoto: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_lfm3.py`, `configuration_lfm3.py` y `lfm3_conv.py` antes de desplegar.
- Seguridad: el modelo rechaza operaciones destructivas, pero puede proponer alternativas que sigan siendo peligrosas (por ejemplo, `find ... -delete`); se recomienda una capa de bloqueo en el host.
- Idiomas: solo chino e inglés; no se ha validado su comportamiento en castellano ni en otras lenguas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whcl412/FinchAI-Rune2-v3-f16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Versión anterior (v2): https://huggingface.co/whcl412/FinchAI-Rune2-f16
- Primera generación: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-v2-f16
- Repositorio con scripts y datos: https://github.com/hwc-cell/FinchAI-Rune2
