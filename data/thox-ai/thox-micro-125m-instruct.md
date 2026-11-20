# Thox-ai/thox-micro-125m-instruct

## Resumen

Thox-micro-125m-instruct es un modelo de lenguaje decoder-only de 123,6 millones de parámetros desarrollado por Thox.ai LLC, resultado de un ajuste fino por instrucciones (SFT) sobre su propio modelo base entrenado desde cero, thox-micro-125m. El modelo está diseñado específicamente como "respondedor de rol de dispositivo" (device-role responder): responde a preguntas sobre su identidad, sobre la localidad de los datos del usuario y sobre su ámbito de actuación, y se detiene correctamente gracias a un token de parada real. Emplea una estructura de turnos ChatML y un vocabulario de 50.304 tokens.

La relevancia del modelo es acotada y deliberada: ocupa el escalón de 125M dentro del catálogo de dispositivos THOX, donde cualquier petición conversacional general se enruta por la malla (mesh) hacia un modelo mayor. No pretende ser un asistente general. El autor documenta explícitamente que, sin su system prompt, el modelo falla en tareas básicas como aritmética o instrucciones de formato, lo que sitúa sus capacidades reales en el terreno de la identidad y la política de privacidad local.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y builds GGUF separados (Q4_0, Q4_K_M, F16), y está pensado para inferencia en dispositivo (edge) con un consumo de memoria en torno a 190 MB en cuantización Q4_0.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, según tags de Hugging Face) |
| Parámetros totales | 123.587.328 (123,6M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_len 768) |
| Tipos de cuantización | Q4_0, Q4_K_M, F16 (builds GGUF en repo separado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 494.361.544 B); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 123,6M de parámetros, entrenado desde cero por THOX.ai LLC como base (thox-micro-125m) y posteriormente sometido a un ajuste fino completo (full fine-tune) con pesos maestros en fp32 y autocast bf16. La pérdida se calcula únicamente sobre los tramos del asistente, incluyendo el token de cierre `<|im_end|>`. El vocabulario de 50.304 tokens reutiliza filas no usadas para alojar los tokens especiales ChatML `<|im_start|>` (50257) y `<|im_end|>` (50258, usado como EOS y pad), de modo que el modelo y sus cuantizaciones conservan el mismo tamaño que el base.

El corpus de ajuste consta de 29.868 conversaciones procedentes de un corpus conversacional público con licencia Apache-2.0, más 171 filas de identidad, localidad de datos y ámbito de THOX (0,57%). El entrenamiento se realizó durante 1.000 pasos con batch efectivo de 32 y longitud máxima de 768, usando AdamW con learning rate pico de 2e-4, scheduler coseno y 3% de warmup. La mejor pérdida de validación fue 1,9014 (perplejidad 6,70) sobre 301 conversaciones reservadas. No se documenta uso de RLHF ni DPO.

## Capacidades

- Respuesta de identidad: con su system prompt, declara correctamente qué es y qué no es.
- Respuesta sobre localidad de datos: afirma correctamente que los datos del usuario no abandonan el dispositivo.
- Delimitación de ámbito: indica que las peticiones generales deben enrutarse a un modelo mayor de la malla.
- Parada fiable: genera el token EOS en 7 de 7 prompts de prueba con system prompt (frente a 0 de 7 del base sin ajustar).
- Estructura de turnos ChatML: plantilla de chat embebida en `tokenizer_config.json` y en cada GGUF.
- Generación de texto básica: capacidad limitada; sin system prompt produce "forma" de lista sin contenido y falla en aritmética simple (17 + 25).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Respuesta de identidad en dispositivo: el modelo responde a preguntas como "¿quién eres?" con su identidad correcta, adecuado para pantallas de bienvenida o ajustes de un dispositivo THOX.
- Confirmación de política de privacidad local: responde que los datos no salen del dispositivo, útil para tranquilizar al usuario en la configuración inicial del producto.
- Enrutado de ámbito: ante peticiones generales, informa de que se derivarán a un modelo mayor de la malla, actuando como capa de presentación del sistema.
- Health check de despliegue: su parada fiable en EOS (7/7) lo hace útil como verificación funcional de pipelines de inferencia llama.cpp en CI.
- Prototipado de plantillas ChatML: sirve como referencia mínima para validar tokenizadores y plantillas de chat en entornos de desarrollo.
- Inferencia en hardware muy restringido: con ~190 MB de RSS en Q4_0 y ~450 tok/s en CPU de 4 hilos, encaja en dispositivos de gama baja donde no cabe nada mayor.
- No debe usarse para chat general, QA factual, aritmética, código ni aplicaciones críticas de seguridad, según el propio autor.

## Benchmarks y rendimiento

El autor publica una comparación funcional medida con llama.cpp en CPU (4 hilos, temperatura 0, mismos siete prompts y mismo system prompt), en máquina host y no en el hardware objetivo:

| Métrica | Base sin ajustar Q4_0 | thox-micro-125m-instruct Q4_0 |
|---|---|---|
| Tamaño de fichero | 81.319.168 B | 81.319.136 B |
| RSS pico | 190 MB | 191 MB |
| Velocidad de decodificación | 460 tok/s | ~450 tok/s |
| Parada en EOS (con system prompt) | 0 / 7 | 7 / 7 |
| Identidad | "a senior at the University of Illinois" | correcta |
| "¿Mis datos salen del dispositivo?" | jQuery irrelevante | "No. I run locally; your data does not leave the device." |
| Instrucciones generales (lista, una palabra) | no | no |

Pérdida de validación del ajuste: 1,9014 (perplejidad 6,70) sobre 301 conversaciones reservadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~190-191 MB de RSS pico en Q4_0; el fichero safetensors completo ocupa ~494 MB.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y dispositivos edge.
- Cabe en cualquier GPU consumer e incluso en dispositivos de gama baja; no requiere GPU dedicada.
- Opciones de despliegue: llama.cpp (builds GGUF Q4_0, Q4_K_M, F16), transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles.
- Latencia y throughput: ~450 tok/s en decodificación con llama.cpp en CPU de 4 hilos, medido en host, no en hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| thox-micro-125m-instruct | 123,6M | no disponible | Apache-2.0 | Respondedor de rol de dispositivo | Hugging Face |
| thox-micro-125m (base) | 123,6M | no disponible | Apache-2.0 | Base desde cero, sin ChatML ni EOS fiable | Hugging Face |
| Alternativas de 125M tipo SmolLM-135M / Qwen2.5-0.5B | 135M / 494M | no disponible | Apache-2.0 | Asistentes generales pequeños | Hugging Face |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada; la única comparación publicada es contra su propio modelo base.

## Limitaciones y advertencias

- Problema conocido de condicionamiento por system prompt: con el system prompt exacto de entrenamiento, el modelo responde a cualquier prompt, incluidos los generales, con su línea de identidad, porque ese prompt aparece en todas las filas de entrenamiento THOX y en ninguna del corpus general.
- Sin su system prompt es un generalista débil: produce forma de lista sin contenido y falla en aritmética simple.
- Riesgo de alucinación elevado fuera de su ámbito estrecho; el propio autor lo califica de modelo de investigación.
- Solo inglés; sin capacidades multilingües.
- Contexto de entrenamiento limitado (max_len 768); longitud de contexto de inferencia no documentada.
- No validado en el hardware objetivo: las cifras de RSS y throughput son medidas en host.
- Sin resultados GATE49 publicados ni benchmarks estándar.
- Uso comercial permitido por Apache-2.0, pero el autor desaconseja explícitamente su uso en chat general, QA factual, aritmética, código y cualquier aplicación crítica de seguridad.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Builds GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-instruct-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
- Paper, blog o demo: no disponible en la información proporcionada.
