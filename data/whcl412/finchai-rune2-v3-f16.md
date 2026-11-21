# whcl412/FinchAI-Rune2-v3-f16

## Resumen

FinchAI-Rune2-v3-f16 (también denominado FinchAI-Rune2-Luna) es un ajuste fino por LoRA del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario whcl412. El modelo está orientado a la generación de texto con capacidades específicas de tool calling, function calling y comportamiento de agente, con especial atención al chino y al inglés. Cuenta con 1.728.801.536 parámetros totales en precisión bfloat16 completa (3,24 GiB), sin cuantizar ni destilar.

La contribución principal de esta versión respecto a su predecesora (FinchAI-Rune2-f16) es la corrección del problema de repetición en conversaciones multiturno: mediante la incorporación de 139 muestras adicionales de diálogo, el autor reporta haber reducido las repeticiones en conversaciones de múltiples turnos de 1 a 0 en sus pruebas internas, manteniendo el resto de capacidades. El modelo se distribuye con licencia LFM Open License v1.0, que permite uso comercial solo por debajo de un umbral de facturación anual de 10 millones de dólares.

El modelo hereda la arquitectura híbrida del LFM3-1.7B y una ventana de contexto nominal de 262.144 tokens, aunque el entrenamiento se realizó exclusivamente con muestras de hasta 756 tokens, por lo que el rendimiento más allá de aproximadamente 1.024 tokens no está garantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 (arquitectura híbrida trifásica del modelo base LiquidAI/LFM3-1.7B; requiere `trust_remote_code=True` con `modeling_lfm3.py`) |
| Parámetros totales | 1.728.801.536 (1,73B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (256K) nominal; entrenado solo hasta 756 tokens por muestra |
| Tipos de cuantización | Pesos publicados en f16/bfloat16 sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ en la información disponible |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | LFM Open License v1.0 (no Apache 2.0) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte del LiquidAI/LFM3-1.7B, un transformer híbrido de 1,73B parámetros cuya implementación requiere código remoto (`modeling_lfm3.py`, `configuration_lfm3.py`, `lfm3_conv.py`) distribuido junto con el repositorio. El ajuste se realizó mediante LoRA con r=8 y alpha=16, aplicado a las proyecciones `q/k/v/o_proj`, `in_proj`, `out_proj` y `gate_proj`. La versión Luna se obtuvo continuando el entrenamiento desde el adaptador de la versión v2, añadiendo 139 muestras multiturno durante 83 pasos (0,5 época) con tasa de aprendizaje 5e-5, en aproximadamente 15 minutos.

El conjunto de datos total suma 1.339 muestras distribuidas en seis categorías: agente (28,5 %), multiturno (21,7 %), rechazo seguro (17,0 %), código (14,9 %), conversación casual (9,6 %) e identidad (8,4 %). Los datos provienen principalmente de destilación de DeepSeek V4.1-Flash para las capacidades clave, complementados con muestras escritas manualmente. Las muestras multiturno se dividen en tres tipos: `short` (61), para respuestas breves de confirmación; `norepeat` (37), para evitar repetir respuestas anteriores; y `carry` (52), para referenciar información previa. Un detalle técnico relevante: durante la generación de datos se incluyó una instrucción explícita de no repetir en el system prompt, pero esta se eliminó en el entrenamiento final para evitar que el modelo dependa de dicha indicación en el host.

## Capacidades

- Generación de texto conversacional en chino e inglés, con modo de razonamiento explícito en etiquetas `<think>…</think>`.
- Tool calling y function calling en formato XML propietario (no JSON), con estructura `<tool_call><function=…><parameter=…>`.
- Comportamiento de agente con selección de herramientas y encadenamiento de pasos.
- Solicitud de aclaración cuando faltan parámetros en una llamada a herramienta.
- Rechazo seguro de peticiones peligrosas, con propuesta de alternativas acotadas.
- Identidad propia consistente (el modelo se identifica como FinchAI-Rune2).
- Capacidad de conversación multiturno con reducción de repeticiones respecto a la versión anterior.
- Capacidad de código (14,9 % del dataset de entrenamiento).
- No incluye capacidades de visión ni de audio.

## Casos de uso

- Agentes de automatización de sistemas: el modelo puede seleccionar y emitir llamadas a herramientas como `list_files` o `count_files` en formato XML, integrándose en pipelines de operaciones que parsean estas estructuras para ejecutar acciones sobre el sistema.
- Asistentes de atención al cliente con contexto multiturno: la corrección del bucle de repetición permite sostener conversaciones de varias rondas con seguimiento de información previa, aunque se recomienda truncar el historial a las últimas 4 rondas.
- Generación de código asistida en entornos de desarrollo: la proporción de datos de código en el entrenamiento permite tareas de completado y explicación de fragmentos, con soporte para integrarse en pipelines de CI/CD mediante tool calling.
- Enrutamiento y clasificación de intenciones en aplicaciones de chat: el modelo decide cuándo invocar una función y cuándo responder en lenguaje natural, útil como capa de orquestación en sistemas con múltiples APIs.
- Validación de seguridad en flujos automatizados: el modelo rechaza peticiones destructivas y ofrece alternativas acotadas, lo que permite usarlo como primera barrera en sistemas que reciben comandos de usuario.
- Prototipado rápido de agentes en local: con 1,73B parámetros en bfloat16 (3,24 GiB), puede ejecutarse en una GPU de consumo para iterar sobre prompts y esquemas de herramientas antes de escalar a modelos mayores.
- Asistentes conversacionales en chino: el modelo está entrenado y evaluado en chino, lo que lo hace adecuado para aplicaciones de chat en ese idioma con soporte secundario de inglés.

## Benchmarks y rendimiento

El autor publica una tabla de evaluación interna por dimensiones de capacidad, basada en sondas propias (no benchmarks estándar). Los resultados comparan Rune1 v2, Rune2 v2 y Rune2 Luna:

| Dimensión | Rune1 v2 | Rune2 v2 | Rune2 Luna |
|---|---|---|---|
| Identidad propia | 60 % | 100 % | 100 % |
| Tool calling | 67 % | 100 % | 100 % |
| Rechazo seguro | 100 % | 83 % | 100 % |
| Aclaración por falta de parámetros | 60 % | 100 % | 100 % |
| Continuidad multiturno | 60 % | 75 % | 100 % |
| Repeticiones multiturno | no disponible | 1 | 0 |

Advertencia del autor: Rune1 se evaluó con 7 sondas × 5 muestras y Rune2 con 14 sondas × 2 muestras, por lo que los conjuntos de prueba no son idénticos y los porcentajes deben interpretarse como tendencia, no como comparación exacta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5-4 GiB para los pesos en bfloat16 (3,24 GiB) más overhead de activaciones y caché KV; en la práctica cabe en GPUs con 8 GiB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GiB de VRAM en bfloat16.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `trust_remote_code=True` (requiere transformers >= 5.18.0 según el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| FinchAI-Rune2-v3-f16 | 1,73B | 256K nominal (entrenado ~756 tokens) | LFM Open License v1.0 | Tool calling y multiturno zh/en |
| LiquidAI/LFM3-1.7B (base) | 1,73B | 256K | LFM Open License v1.0 | Modelo base generalista |
| FinchAI-Rune2-f16 (v2) | 1,73B | 256K nominal | LFM Open License v1.0 | Versión anterior, con repeticiones multiturno |
| FinchAI-Rune1-Preview-v2-f16 | no disponible | no disponible | LFM Open License v1.0 | Primera generación del proyecto |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto nominal de 262.144 tokens, pero el entrenamiento solo cubrió muestras de hasta 756 tokens; el comportamiento más allá de aproximadamente 1.024 tokens no está garantizado.
- Aunque las repeticiones multiturno se redujeron a 0 en las pruebas del autor, se recomienda truncar el historial a las últimas 4 rondas y aplicar detección de repetición en producción.
- La continuidad multiturno depende de que el contexto contenga información concreta; si el turno anterior es vago, el modelo puede repetir preguntas.
- Las solicitudes de aclaración pueden desviarse un nivel (p. ej., preguntar por el directorio en lugar del archivo).
- El modelo es sensible al orden de las herramientas: reordenar el mismo conjunto puede cambiar la selección; se recomienda colocar las más probables primero.
- Puede inventar cifras cuando la herramienta devuelve listas en lugar de resultados directos; es preferible exponer herramientas que devuelvan respuestas computadas.
- La seguridad se implementa como rechazo más alternativa acotada, lo que puede permitir comandos de borrado restringidos por tipo; se recomienda una capa adicional de bloqueo en el host.
- Licencia LFM Open License v1.0: uso comercial permitido solo por debajo de 10 millones de dólares de facturación anual; por encima requiere acuerdo con Liquid AI. Prohibido usar marcas de Liquid AI. La redistribución exige incluir copia de la licencia y marcar los archivos modificados.
- Riesgo de alucinación inherente a modelos de 1,73B parámetros; no apto para tareas que requieran precisión factual sin verificación externa.
- Idiomas limitados a chino e inglés; no se documenta soporte para castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whcl412/FinchAI-Rune2-v3-f16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Versión anterior (v2): https://huggingface.co/whcl412/FinchAI-Rune2-f16
- Primera generación: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-v2-f16
- Repositorio de entrenamiento: https://github.com/hwc-cell/FinchAI-Rune2-Luna
