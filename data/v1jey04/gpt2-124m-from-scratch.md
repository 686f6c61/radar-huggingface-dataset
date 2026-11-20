# V1jey04/gpt2-124m-from-scratch

## Resumen

`gpt2-124m-from-scratch` es un modelo de lenguaje de 124,5 millones de parámetros desarrollado por el usuario V1jey04 como proyecto de aprendizaje integral: tokenizador, arquitectura, bucle de entrenamiento y código de chat escritos desde cero en PyTorch, sin partir de la implementación de `transformers`. Reproduce la forma de GPT-2 small (12 capas, 12 cabezas, 768 dimensiones, contexto de 1.024 tokens) y añade un formato de chat propio con cuatro tokens especiales, entrenado en GPUs gratuitas T4 de Kaggle.

El modelo se preentrenó con 2,42 mil millones de tokens de FineWeb-Edu y después se ajustó para conversación con 276 millones de tokens de SmolTalk, Dolly y OpenAssistant, calculando la pérdida solo sobre los tokens del asistente. El resultado es un modelo pequeño que escribe inglés fluido y respeta el formato de chat, pero cuyos resultados en benchmarks quedan por debajo o a la par de GPT-2 124M original en varias tareas.

Su relevancia es principalmente didáctica y de referencia: sirve para estudiar un pipeline completo de entrenamiento (DDP, fp16 con gradient scaler, `torch.compile`, exportación a ONNX int8 con caché KV) y para experimentar con modelos minúsculos en hardware de consumo. No está pensado como asistente fiable en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 small (12 capas, 12 cabezas, 768 dimensiones) |
| Parámetros totales | 124.475.904 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | int8 (ONNX per-channel con caché KV); pesos originales en fp32 |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, pesos atados almacenados una vez), ONNX (`onnx/model_int8.onnx`), `config.json`, `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales aprendidos y pesos de entrada/salida atados. El tokenizador es un BPE a nivel de bytes con 50.000 piezas más 4 tokens de chat, con vocabulario ampliado a 50.304. El formato de conversación es `<|bos|><|user|>{pregunta}<|end|><|assistant|>{respuesta}<|end|>`.

El preentrenamiento usó 2,42 mil millones de tokens de FineWeb-Edu durante 9.236 pasos de 262.144 tokens, con 2× T4 y 22,6 horas de cómputo; la pérdida de validación bajó de 10,96 a 3,297. El ajuste fino de chat empleó 276 millones de tokens de SmolTalk, Dolly y OpenAssistant en 4.217 pasos de 65.536 tokens (2 h 40 min en 2× T4), con pérdida de validación de 2,74 a 1,445. Se usaron DDP, autocast fp16 con gradient scaler y `torch.compile`, a unas 33.000 tokens/s. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con formato de chat multi-turno.
- Razonamiento básico y respuesta a preguntas de conocimiento general (con alta tasa de error factual).
- Finalización de texto y continuación de secuencias cortas.
- Cumplimiento del formato de conversación definido por los tokens especiales `<|user|>`, `<|assistant|>`, `<|end|>` y `<|bos|>`.
- Inferencia en navegador mediante la copia ONNX int8 con caché KV.
- No dispone de tool calling, function calling, modo thinking, visión ni audio.
- Capacidades multilingües: únicamente inglés.

## Casos de uso

- Docencia y estudio de pipelines de entrenamiento: el repositorio permite reproducir tokenizador, bucle de entrenamiento y evaluación desde cero, útil en cursos de LLM.
- Experimentación con arquitecturas GPT-2 en hardware de consumo: 124M parámetros caben en GPUs modestas y permiten iterar rápido sobre variantes.
- Demos interactivas en navegador: la exportación ONNX int8 con caché KV permite ejecutar el modelo en el dispositivo del usuario sin backend.
- Pruebas de formato de chat y tokenización: sirve para validar plantillas de conversación y estrategias de enmascarado de pérdida en modelos pequeños.
- Generación de texto creativo controlada y de baja exigencia, como completar frases o párrafos cortos en inglés.
- Base para ajuste fino ligero en tareas cerradas de clasificación o generación con datos propios, dado su bajo coste de entrenamiento.
- Referencia comparativa en investigaciones sobre eficiencia de tokenizadores y curvas de escalado en modelos pequeños.

## Benchmarks y rendimiento

Resultados zero-shot declarados por el autor, evaluados con el mismo script (`benchmark.py`) para ambos modelos. La selección múltiple se puntúa por pérdida por byte. El modelo evaluado es la versión ajustada para chat, frente a GPT-2 124M base.

| Prueba | Este modelo | OpenAI GPT-2 124M |
|---|---|---|
| ARC-Easy (2.376 preguntas) | 40,9% | 40,5% |
| HellaSwag (10.042) | 28,4% | 29,9% |
| LAMBADA (5.153) | 20,7% | 33,7% |
| WikiText-2 bits por byte (menor es mejor) | 1,324 | 1,020 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB de pesos más activaciones y caché KV; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en int8 ONNX: aproximadamente 0,15-0,2 GB de pesos, ejecutable en CPU y en navegador.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso T4, que fue la usada en entrenamiento.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en CPU para la versión int8.
- Opciones de despliegue: código propio del repositorio (`chat.py`), ONNX Runtime para la versión int8; no es un modelo de `transformers`, por lo que vLLM, TGI o llama.cpp no lo soportan de forma nativa.
- Latencia y throughput: no disponibles de forma oficial; el entrenamiento reporta unas 33.000 tokens/s en 2× T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks clave | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt2-124m-from-scratch | 124,5M | 1.024 | ARC-Easy 40,9%, HellaSwag 28,4%, LAMBADA 20,7% | MIT | Hugging Face, GitHub, demo ONNX |
| OpenAI GPT-2 124M | 124M | 1.024 | ARC-Easy 40,5%, HellaSwag 29,9%, LAMBADA 33,7% | MIT (pesos publicados) | Hugging Face, `transformers` |
| SmolLM-135M | 135M | 2.048 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` |
| Qwen2.5-0.5B | 494M | 32.768 | no disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` |

La comparación con GPT-2 124M es la más directa por tamaño y arquitectura; SmolLM-135M y Qwen2.5-0.5B se incluyen como alternativas pequeñas modernas, aunque sus cifras de benchmarks no se recogen en la información disponible.

## Limitaciones y advertencias

- Proyecto de aprendizaje: el propio autor advierte que no es un asistente fiable; afirma hechos incorrectos con seguridad (por ejemplo, atribuciones erróneas sobre la fotosíntesis).
- Sin ajuste de seguridad: no ha recibido entrenamiento de alineación ni filtros de contenido.
- Solo inglés; no soporta otros idiomas.
- Contexto muy limitado (1.024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Riesgo elevado de alucinación por el tamaño reducido y los escasos datos de preentrenamiento (2,42B tokens).
- No es compatible con `transformers`; requiere el código del repositorio, lo que complica su integración en ecosistemas estándar.
- Licencia MIT para código y pesos, pero los datasets de entrenamiento tienen licencias propias (ODC-By, Apache 2.0, CC BY-SA 3.0) que deben respetarse en usos derivados.
- Sin datos publicados de latencia ni throughput en inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/V1jey04/gpt2-124m-from-scratch
- Repositorio de código: https://github.com/V1jey04/gpt2-124m-from-scratch
- Demo en navegador (Space): https://huggingface.co/spaces/V1jey04/gpt2-124m-from-scratch
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset OpenAssistant oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
