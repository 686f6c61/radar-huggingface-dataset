# theostos/qwen-3.5-babel-27b-sft-agent-multistep

## Resumen

`qwen-3.5-babel-27b-sft-agent-multistep` es un ajuste fino por supervisión (SFT) de Qwen/Qwen3.5-27B publicado por el usuario theostos. El modelo está especializado en demostración interactiva de tácticas para los asistentes de pruebas formales Lean 4 (con Mathlib) y Rocq (con CORN 8.20.0), emitiendo llamadas a la herramienta `submit_tactic` y consumiendo la respuesta real del verificador en cada turno. Se trata de un modelo solo de texto, con pesos BF16 completos en safetensors y sin adaptadores ni codificador de visión.

El problema que aborda es el de los agentes de prueba formal que necesitan razonar paso a paso contra un entorno de verificación real: el modelo aprende a proponer bloques de tácticas, interpretar la respuesta del verificador y continuar o retroceder según el resultado. Es relevante porque combina el formato nativo de chat y tool calling de Qwen3.5 con trayectorias de demostración verificadas, lo que permite integrarlo en bucles de prueba automatizada sin código de modelo personalizado.

El ajuste se realizó el 3 de noviembre de 2026 sobre 807 demostraciones verificadas (360 de Lean y 447 de Rocq) y 5.287 llamadas a tácticas emparejadas con observaciones reales del verificador. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark de resolución de teoremas para esta versión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`Qwen3_5ForCausalLM`), solo texto |
| Parámetros totales | 26.895.998.464 (≈26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó un límite de secuencia de 12.288 tokens |
| Tipos de cuantización | no disponible (pesos publicados en BF16; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), tokenizer y configuración de generación incluidos |

## Arquitectura y entrenamiento

El modelo es un `Qwen3_5ForCausalLM` de solo texto con pesos BF16 completos, plantilla de chat nativa de Qwen y configuración de generación. No incluye codificador de visión ni es un adaptador LoRA, y no requiere NeMo ni código de modelo personalizado para inferencia. Se validó con Transformers 5.5.0 y Accelerate en un entorno PyTorch compatible.

El entrenamiento consistió en un SFT de todos los parámetros desde Qwen3.5-27B sobre 807 demostraciones verificadas (360 Lean, 447 Rocq) y 5.287 llamadas a tácticas con observaciones reales del verificador; 801 ejemplos contienen más de una llamada. Se ejecutaron cinco épocas y 130 actualizaciones del optimizador, con checkpoint `epoch_4_step_129` (numeración desde cero), límite de secuencia de 12.288 tokens, batch global de 32, tasa de aprendizaje 1e-5, 50 actualizaciones de warmup y un horizonte de schedule coseno de 320 actualizaciones. Solo reciben pérdida el razonamiento del asistente y las llamadas a tácticas; las respuestas del verificador y el texto de usuario/sistema son contexto. En 33 ejemplos se acortó el razonamiento para ajustarse al límite, conservando todas las tácticas y respuestas del verificador. Las demostraciones originales se reprodujeron paso a paso y solo se aceptaron pruebas completas reproducidas con éxito; no son ejemplos de recuperación deliberada de errores. El entorno Rocq se reconstruyó con CORN 8.20.0 y la reproducción Lean usó Mathlib con Lean v4.22.0-rc4. Es SFT, no aprendizaje por refuerzo. El dataset tiene SHA-256 `b4e9408de95f742e56ccbbb3f45a36a65cb893dbb6fe18dab936a34ce2ffbd96`.

## Capacidades

- Generación de texto y razonamiento en el dominio de pruebas formales, con modo de pensamiento nativo (`enable_thinking=True`).
- Emisión de llamadas a herramientas en el formato nativo de Qwen, concretamente la función `submit_tactic` con un argumento `tactic` que contiene solo tácticas, sin declaraciones de teoremas ni bloques Markdown.
- Razonamiento multi-turno y multi-paso: el modelo genera el siguiente turno del asistente y el host debe ejecutar la táctica en Lean o Rocq, añadir la respuesta real del verificador como mensaje `tool` con el `tool_call_id` correspondiente y volver a generar.
- Soporte para Lean 4 (Mathlib, v4.22.0-rc4 en la reproducción) y Rocq (CORN 8.20.0).
- Capacidad de continuar una prueba manteniendo un único estado de prueba entre llamadas, preservando la indentación de Lean y revirtiendo bloques rechazados.
- Capacidades multilingües: no disponible.
- No dispone de visión, audio ni otras modalidades.

## Casos de uso

- Automatización de pruebas en Lean 4: el modelo propone bloques de tácticas que un host ejecuta contra Mathlib; es adecuado porque fue entrenado con el formato exacto de llamada `submit_tactic` y con respuestas reales del verificador.
- Automatización de pruebas en Rocq: mismo bucle con CORN 8.20.0, aprovechando las 447 demostraciones Rocq del conjunto de entrenamiento.
- Asistente interactivo de demostración en un IDE: el modelo puede generar el siguiente paso táctico a partir del estado de prueba actual y las hipótesis en contexto, integrándose en un plugin que muestre la respuesta del verificador.
- Traducción de términos de prueba a tácticas: la model card incluye un ejemplo de derivación de una prueba táctica en Lean 4 a partir de un término de prueba (`fun (p : Prop) (h : p) => h`), útil para pipelines de conversión término-a-táctica.
- Búsqueda guiada de pruebas con retroceso: el host puede revertir bloques rechazados y solicitar una nueva táctica, ya que el modelo fue entrenado sobre trayectorias completas con respuestas del verificador.
- Evaluación de agentes de prueba formal: sirve como política base en experimentos de agentes multi-paso con verificación real, dado que el autor documenta hashes de procedencia y validación.
- Generación de datos sintéticos de trayectorias tácticas: las salidas pueden filtrarse por el verificador y reutilizarse en pipelines de SFT, siempre que se comprueben las pruebas generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark de resolución de teoremas para esta versión, y que las comprobaciones de publicación (pesos finitos, carga estándar en Transformers sin claves faltantes o inesperadas, forward en CUDA finito) no miden la calidad de las pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para pesos (26,9 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- El repositorio ocupa 53,8 GB, coherente con pesos BF16 completos.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con `device_map="auto"`. No cabe en una RTX 4090 de 24 GB en BF16 sin cuantización.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ) en la información disponible, por lo que no se puede confirmar su funcionamiento en GPU de consumo.
- Despliegue validado con Transformers 5.5.0 y Accelerate. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theostos/qwen-3.5-babel-27b-sft-agent-multistep | 26,9 mil millones | no disponible | Lean 4 y Rocq, tool calling multi-paso | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (modelo base) | 27 mil millones (según nombre) | no disponible | Propósito general | no disponible en la información | Hugging Face |
| Otros modelos de prueba formal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es SFT, no aprendizaje por refuerzo; no se ha demostrado capacidad de recuperación deliberada de errores, ya que las trayectorias son demostraciones exitosas.
- No se reclama ninguna puntuación de benchmark de resolución de teoremas; el rendimiento real en pruebas nuevas no está medido en la información disponible.
- Las pruebas generadas requieren verificación obligatoria: el propio autor indica que las pruebas generadas aún necesitan comprobación.
- El host debe implementar correctamente el bucle de herramientas: parsear el formato nativo de tool calls de Qwen, ejecutar `submit_tactic`, añadir el mensaje `tool` con el `tool_call_id` y la respuesta real del verificador, y nunca fabricar respuestas del verificador.
- Se debe mantener un único estado de prueba entre llamadas, preservar la indentación de Lean y revertir los bloques rechazados; un manejo incorrecto del estado invalida el uso.
- En 33 ejemplos se acortó el razonamiento para ajustarse al límite de 12.288 tokens, lo que puede reducir la profundidad de razonamiento en casos similares.
- El entorno Rocq se reconstruyó con CORN 8.20.0 porque el checkout original no estaba disponible, lo que puede introducir diferencias respecto al entorno original.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información disponible; el riesgo principal es la generación de tácticas inválidas que el verificador rechazará.
- Idiomas soportados: no disponible; la model card está en inglés y no declara cobertura multilingüe.
- Licencia Apache 2.0, lo que permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5; conviene revisar los términos del upstream.
- No hay codificador de visión ni soporte multimodal; es exclusivamente texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theostos/qwen-3.5-babel-27b-sft-agent-multistep
- Árbol de archivos: https://huggingface.co/theostos/qwen-3.5-babel-27b-sft-agent-multistep/tree/main
- Repositorio Babel-Formal (replay, entrenamiento y exportación): https://github.com/theostos/babel-formal
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
