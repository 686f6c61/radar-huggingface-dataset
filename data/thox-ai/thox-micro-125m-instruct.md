# Thox-ai/thox-micro-125m-instruct

## Resumen

thox-micro-125m-instruct es un modelo de lenguaje decoder-only de 123,6 millones de parámetros desarrollado por Thox.ai LLC, obtenido mediante un fine-tune completo (SFT) de su propio modelo base from-scratch, `Thox-ai/thox-micro-125m`. Su propósito no es ser un asistente general, sino un "respondedor de rol de dispositivo": con su system prompt responde quién es, confirma que los datos del usuario permanecen en el dispositivo y se detiene, cediendo cualquier petición conversacional a un modelo mayor a través de la malla de dispositivos de la familia THOX.

El modelo parte de un base con una pérdida de validación de preentrenamiento de 2,61 y se ha ajustado con 29.868 conversaciones de un corpus público Apache-2.0 más 171 filas de identidad y localidad de datos, alcanzando una pérdida de validación de 1,9014 (perplejidad 6,70). La innovación práctica es modesta pero funcional: se le ha dotado de estructura de turnos ChatML y de un token de parada real, de modo que responde y se detiene en lugar de continuar generando texto.

Es relevante ahora por su enfoque local-first y on-device: un modelo de 123,6M en cuantización Q4_0 ocupa unos 81 MB y consume 191 MB de RSS pico, lo que lo sitúa en el rango de hardware de borde y microcontroladores con Linux. Con licencia Apache-2.0 tanto para pesos como para el corpus de entrenamiento, es un caso de estudio de modelos pequeños con propósito acotado y comportamiento de parada fiable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (from-scratch, familia ThoxMicro) |
| Parámetros totales | 123.587.328 (123,6M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con max_len 768) |
| Tipos de cuantización | F16 (GGUF incluido); Q4_0 y Q4_K_M en repo GGUF separado |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (F16; Q4_0 y Q4_K_M en repo aparte) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero por Thox.ai, con un vocabulario de 50.304 tokens. El ajuste instructivo reutiliza filas no usadas del vocabulario para los tokens especiales ChatML: `<|im_start|>` (ID 50257) y `<|im_end|>` (50258, que actúa como EOS y pad), de modo que el modelo y sus cuantizaciones conservan exactamente el tamaño del base. La plantilla de chat está embebida en `tokenizer_config.json` y en cada GGUF.

El entrenamiento consistió en un fine-tune completo con pesos maestros en fp32 y autocast bf16, calculando la pérdida solo sobre los spans del asistente, incluido el `<|im_end|>` de cierre. Los datos son 29.868 conversaciones de un corpus público Apache-2.0 más 171 filas de identidad, localidad de datos y alcance de THOX (0,57% del total). Se ejecutaron 1.000 pasos con batch efectivo de 32, max_len de 768, optimizador AdamW, lr pico de 2e-4, scheduler coseno y 3% de warmup. La mejor pérdida de validación fue 1,9014 (perplejidad 6,70) sobre 301 conversaciones reservadas.

## Capacidades

- Generación de texto conversacional en inglés con estructura de turnos ChatML.
- Respuesta de identidad: declara correctamente qué es y que se ejecuta localmente en hardware THOX.
- Respuesta de localidad de datos: confirma que los datos del usuario no salen del dispositivo.
- Parada fiable: 7 de 7 paradas en EOS con system prompt, frente a 0 de 7 del base sin ajustar.
- Delimitación de alcance: reconoce su rol y deriva peticiones generales a un modelo mayor de la malla.
- No soporta tool calling ni function calling (no documentado).
- No soporta razonamiento multi-paso ni modo thinking.
- No tiene capacidades de visión ni audio.
- Multilingüe: no; solo inglés.
- Razonamiento, matemáticas y código: fuera de alcance; el propio autor documenta que falla en `17 + 25` y no completa listas con contenido real.

## Casos de uso

- Respuesta de identidad en dispositivos de borde: el modelo se ejecuta en hardware ThoxMini-class y, ante la pregunta "¿quién eres?", responde correctamente en lugar de alucinar una identidad ajena, como hacía el base ("un senior de la Universidad de Illinois").
- Confirmación de privacidad y localidad de datos: responde a "¿mis datos salen de este dispositivo?" con la frase "No. I run locally; your data does not leave the device.", útil como capa de transparencia en productos local-first.
- Enrutador de primer nivel en una malla de dispositivos: al tener un alcance acotado, puede recibir la petición inicial, responder lo que le corresponde y derivar el resto a un modelo mayor, reduciendo el consumo energético del dispositivo de borde.
- Asistente de estado del dispositivo: con su system prompt puede informar del rol del nodo y de la política de datos sin coste computacional apreciable (191 MB de RSS pico, ~450 tok/s en CPU con 4 hilos).
- Demostración educativa de SFT y ChatML: el repo documenta el procedimiento completo (dataset, hiperparámetros, pérdida de validación) y sirve como referencia reproducible para ajustar modelos de 100M con parada fiable.
- Pruebas de integración en pipelines de despliegue: al estar disponible en Ollama (`ollama run thox-ai/thox-micro-125m-instruct`) y en GGUF, permite validar cadenas de inferencia local antes de escalar a modelos mayores.
- Evaluación comparativa de cuantizaciones: los builds Q4_0, Q4_K_M y F16 permiten medir el compromiso entre tamaño, RSS y velocidad en hardware de borde.

## Benchmarks y rendimiento

El autor publica una comparación funcional cabeza a cabeza entre el base sin ajustar y este modelo, ambos en Q4_0, ejecutada en un build de llama.cpp en CPU con 4 hilos, temperatura 0, las mismas siete prompts y el mismo system prompt. Los datos se midieron en una máquina host, no en el hardware objetivo, por lo que solo transfiere el orden entre columnas.

| Métrica | Base Q4_0 sin ajustar | thox-micro-125m-instruct Q4_0 |
|---|---|---|
| Tamaño de fichero | 81.319.168 B | 81.319.136 B |
| RSS pico | 190 MB | 191 MB |
| Decodificación (tok/s) | 460 | ~450 |
| Paradas en EOS (con system prompt) | 0 / 7 | 7 / 7 |
| Identidad | "un senior de la Universidad de Illinois" | correcta |
| "¿Mis datos salen de este dispositivo?" | jQuery irrelevante | "No. I run locally; your data does not leave the device." |
| Instrucciones generales (lista, una palabra) | no | no |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica que no hay resultado GATE49 publicado para este modelo y que aún no se ha validado en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para inferencia en CPU. En Q4_0 el fichero ocupa ~81 MB y el RSS pico medido es de 191 MB.
- GPU recomendadas: no disponibles; el modelo está orientado a hardware de borde y CPU, no a GPU de datacenter.
- Cabe en cualquier GPU consumer con holgura, dado su tamaño (F16 ~249 MB, Q4_0 ~81 MB), aunque no se documentan pruebas en GPU.
- Opciones de despliegue: llama.cpp (medido por el autor), Ollama (`ollama run thox-ai/thox-micro-125m-instruct`), transformers, text-generation-inference y endpoints compatibles.
- Latencia y throughput: ~450 tok/s de decodificación en CPU con 4 hilos, temperatura 0, en el host de medición; no validado en el dispositivo objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thox-micro-125m-instruct | 123,6M | No disponible (max_len 768 en entrenamiento) | Respondedor de rol de dispositivo, local-first | Apache-2.0 | Hugging Face, Ollama, GGUF |
| Thox-ai/thox-micro-125m (base) | 123,6M | No disponible | Base from-scratch sin ajuste instructivo | Apache-2.0 | Hugging Face |
| Alternativas de ~125M tipo SmolLM-135M / Qwen2.5-0.5B | No disponible en la información proporcionada | No disponible | Asistentes generales pequeños | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un asistente general: sin su system prompt produce la forma de las listas sin el contenido, responde con prosa a preguntas simples y falla en aritmética básica como `17 + 25`.
- El propio autor advierte que más SFT sobre este base no cambiará esa capacidad, dada la pérdida de validación de preentrenamiento de 2,61.
- Fuera de alcance declarado: chat general, QA factual, aritmética, código y cualquier uso crítico para la seguridad.
- Riesgo de alucinación elevado en cualquier tarea fuera de identidad, estado y localidad de datos.
- Solo inglés; no hay soporte multilingüe documentado.
- Longitud de contexto no especificada; el entrenamiento usó max_len 768, lo que limita conversaciones largas.
- No validado en el hardware objetivo: las cifras de RSS y throughput proceden de una máquina host y solo transfiere el orden entre columnas.
- Sin resultado GATE49 publicado ni benchmarks estándar.
- Licencia Apache-2.0 permite uso comercial, pero el alcance funcional tan restringido hace desaconsejable su uso en producción fuera del rol para el que fue entrenado.
- El modelo tiene 0 likes y 1.710 descargas en el momento de la ficha, lo que refleja una adopción muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Repo GGUF: https://huggingface.co/Thox-ai/thox-micro-125m-instruct-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m
