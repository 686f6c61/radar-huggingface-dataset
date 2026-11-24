# Thox-ai/thox-micro-125m-instruct

## Resumen

thox-micro-125m-instruct es un modelo de lenguaje de tipo decoder-only con 123,6 millones de parámetros, desarrollado por Thox.ai LLC (THOX) a partir de su propio modelo base entrenado desde cero, thox-micro-125m. Se trata de un ajuste fino supervisado (SFT) orientado a instrucciones que añade una estructura de turnos ChatML y un token de parada real, de modo que el modelo responde y se detiene en lugar de continuar generando texto. Su licencia es Apache-2.0 y está publicado en Hugging Face con pesos en safetensors y GGUF.

El modelo no se plantea como un asistente general, sino como un "respondedor de rol de dispositivo" (device-role responder): con su prompt de sistema declara qué es, afirma correctamente que los datos del usuario permanecen en el dispositivo y se detiene. Es la pieza del nivel de 125M dentro del catálogo de dispositivos THOX, y cualquier conversación propiamente dicha se redirige a través de la malla (mesh) a un modelo mayor. Su relevancia actual reside en el despliegue local y en dispositivos de borde (edge), donde un modelo de este tamaño cabe en hardware mínimo.

La arquitectura es un transformer decoder-only clásico con un vocabulario de 50.304 tokens y un contexto de entrenamiento de 768 tokens como longitud máxima. El autor advierte explícitamente de que, sin su prompt de sistema, el modelo es un generalista débil: produce la forma de una lista sin su contenido y falla en aritmética elemental como 17 + 25. La pérdida de validación del preentrenamiento es de 2,61, y el ajuste fino alcanzó una pérdida de validación de 1,9014 (perplejidad 6,70) sobre 301 conversaciones reservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base ThoxMicro-125M) |
| Parametros totales | 123.587.328 (123,6M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 768 tokens (longitud máxima de entrenamiento); no se documenta ventana de inferencia mayor |
| Tipos de cuantizacion | F16 (GGUF incluido en el repo); Q4_0 y Q4_K_M en el repo GGUF separado |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, 494.361.544 B) y GGUF (thox-micro-125m-instruct-f16.gguf, 249.189.184 B) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 123,6M de parámetros entrenado desde cero por THOX (modelo base thox-micro-125m), sobre el que se aplicó un ajuste fino completo (full fine-tune) con pesos maestros en fp32 y autocast en bf16. La pérdida se calcula únicamente sobre los tramos del asistente, incluyendo el token de cierre `<|im_end|>`. El vocabulario tiene 50.304 tokens; los tokens especiales `<|im_start|>` (50257) y `<|im_end|>` (50258, usado como EOS y pad) reutilizan filas no utilizadas del vocabulario, de modo que el modelo y sus cuantizaciones conservan el mismo tamaño que el base.

Los datos de entrenamiento consisten en 29.868 conversaciones procedentes de un corpus público de conversaciones con licencia Apache-2.0, más 171 filas de identidad, localidad de datos y alcance propias de THOX (0,57%). El entrenamiento se realizó en 1.000 pasos con batch efectivo de 32, longitud máxima de 768, optimizador AdamW, learning rate pico de 2e-4, scheduler coseno y 3% de warmup. La mejor pérdida de validación fue de 1,9014 (perplejidad 6,70) sobre 301 conversaciones reservadas. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional con estructura de turnos ChatML y parada correcta en EOS (7 de 7 prompts con prompt de sistema en la comparativa medida).
- Declaración de identidad y de localidad de datos: con su prompt de sistema indica qué es y que los datos del usuario permanecen en el dispositivo.
- Respuesta a instrucciones simples dentro de su rol de dispositivo.
- Formato de prompt ChatML con plantilla embebida en `tokenizer_config.json` y en cada GGUF.
- Capacidades multilingües: solo inglés.
- No dispone de tool calling, function calling, modo thinking, visión ni audio documentados.
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Respondedor de rol en dispositivos THOX: el modelo se integra en el catálogo de dispositivos de 125M para responder consultas de identidad y de localidad de datos, deteniéndose de forma fiable gracias a su token EOS entrenado.
- Enrutado de conversaciones en una malla local: al ser el nivel de 125M, actúa como primera capa que atiende consultas triviales y delega el resto a modelos mayores de la mesh, reduciendo el consumo energético en el dispositivo.
- Despliegue en hardware de borde con recursos mínimos: con 81 MB en Q4_0 y un pico de RSS de 191 MB, cabe en dispositivos con poca memoria y sin GPU dedicada.
- Pruebas de integración de pipelines de inferencia local: sirve para validar cadenas de descarga, plantillas ChatML, cuantización GGUF y parada en EOS en entornos de CI antes de desplegar modelos mayores.
- Demostraciones y prototipos de asistentes locales con privacidad por diseño: útil para mostrar que los datos no salen del dispositivo, aunque la conversación real se derive a otro modelo.
- Investigación sobre ajuste fino de modelos pequeños: el modelo y su base, ambos Apache-2.0, permiten reproducir el SFT con corpus públicos y estudiar el efecto del SFT sobre la parada en EOS y la pérdida de validación.

## Benchmarks y rendimiento

El autor publica una comparativa medida cabeza a cabeza entre el base sin ajustar y este modelo, con un build de llama.cpp en CPU, 4 hilos, temperatura 0, los mismos siete prompts y el mismo prompt de sistema. La medición se realizó en una máquina anfitriona, no en el hardware objetivo.

| Metrica | Base sin ajustar Q4_0 | thox-micro-125m-instruct Q4_0 |
|---|---|---|
| Tamano de fichero | 81.319.168 B | 81.319.136 B |
| Pico de RSS | 190 MB | 191 MB |
| Velocidad de decodificacion | 460 tok/s | ~450 tok/s |
| Parada en EOS (con prompt de sistema) | 0 / 7 | 7 / 7 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en CPU; en Q4_0 el fichero ocupa unos 81 MB y el pico de RSS medido es de 191 MB. En F16 el GGUF ocupa 249.189.184 B (unos 249 MB).
- GPU recomendadas: no se documentan; el modelo está pensado para CPU y dispositivos de borde.
- Cabe en cualquier GPU de consumo e integrada, y en dispositivos con memoria muy limitada; el autor lo orienta al hardware THOX más pequeño.
- Opciones de despliegue: llama.cpp (build de CPU usado en la comparativa), Ollama (`ollama run thox-ai/thox-micro-125m-instruct`), transformers y text-generation-inference según los tags del repo.
- Latencia y throughput: aproximadamente 450 tok/s de decodificación en el build de llama.cpp con 4 hilos en CPU, según la medición del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| thox-micro-125m-instruct | 123,6M | 768 tokens | Apache-2.0 | safetensors, GGUF (F16, Q4_0, Q4_K_M) | Especializado en rol de dispositivo; parada en EOS fiable |
| thox-micro-125m (base) | 123,6M | 768 tokens | Apache-2.0 | safetensors | Sin ajuste de instrucciones; no se detiene en EOS (0/7) |
| Alternativas de ~125M de otros autores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- No es un asistente general: sin su prompt de sistema produce la forma de una lista sin contenido, responde con prosa a preguntas simples y falla en aritmética elemental como 17 + 25.
- El autor indica que más SFT sobre esta base no cambiará esa capacidad, dada la pérdida de validación de preentrenamiento de 2,61.
- Riesgo de alucinación alto fuera de su rol asignado; no debe usarse para respuestas factuales sin verificación.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Contexto limitado a 768 tokens de entrenamiento, insuficiente para conversaciones largas o documentos extensos.
- La comparativa de rendimiento se midió en una máquina anfitriona y no en el hardware objetivo; solo transfiere el orden entre columnas.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo está etiquetado como modelo de investigación y su utilidad comercial fuera del rol de dispositivo es muy limitada.
- El repositorio incluye material promocional de una campaña de Kickstarter; conviene separar esa información de las capacidades técnicas reales del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-instruct-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
- Sitio del autor: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
