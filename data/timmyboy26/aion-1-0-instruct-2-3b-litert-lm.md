# timmyboy26/aion-1.0-instruct-2.3b-litert-lm

## Resumen

Aion 1.0 Instruct 2.3B LiteRT-LM es una conversión al formato `.litertlm` del modelo `microsoft/Aion-1.0-Instruct-2.3B`, publicada por el usuario timmyboy26. El objetivo es ofrecer una build lista para ejecutarse en el runtime LiteRT-LM de Google sobre dispositivos Android e iOS, sin necesidad de parchear el runtime. El paquete incluye pesos cuantizados a int8 de rango dinámico, activaciones en float32 y una caché KV de 4.096 tokens, todo empaquetado con litert-lm-builder 0.19.1 y convertido con litert-torch 0.10.0.

El modelo base es un transformer de 2.300 millones de parámetros con atención híbrida: 21 capas de ventana deslizante y 7 capas de atención completa, con RoPE por capa. Esta build conserva esa arquitectura tal cual; el único cambio funcional respecto al original es una corrección de la plantilla de chat embebida para que LiteRT-LM, que pasa el contenido de los mensajes como lista de partes, no envíe turnos de usuario vacíos al modelo.

La relevancia de esta ficha es práctica: es una de las pocas builds `.litertlm` publicadas de un modelo instruct de ~2B con licencia MIT, pensada para inferencia on-device en móviles y tablets. El autor documenta tasas de prefill y decodificación medidas en seis dispositivos reales, lo que permite estimar viabilidad en producción móvil sin desplegar infraestructura de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (21 capas de ventana deslizante + 7 capas de atención completa), RoPE por capa |
| Parámetros totales | ~2,3 mil millones (modelo base Aion 1.0 Instruct 2.3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens de caché KV en esta build; ventana deslizante de 2.048 tokens por capa |
| Tipos de cuantización | int8 de rango dinámico (`dynamic_wi8_afp32`), activaciones float32 |
| Idiomas soportados | no disponible |
| Licencia | MIT (texto de Microsoft, "Copyright (c) Microsoft Corporation") |
| Formato de pesos | `.litertlm` (LiteRT-LM); existe también una build GGUF Q4_0 en otro repositorio |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina atención de ventana deslizante con atención completa en una proporción de 21 a 7 capas, un patrón habitual en modelos recientes para reducir el coste de atención en contextos largos manteniendo acceso global en capas seleccionadas. El uso de RoPE por capa (en lugar de un único esquema compartido) es una decisión de diseño del modelo original que se conserva en la conversión. El resultado es un transformer denso de ~2,3B parámetros, sin mezcla de expertos.

Sobre el entrenamiento del modelo base no se proporciona información en la model card de esta conversión: no hay datos sobre número de tokens, composición del dataset, ni si se aplicaron fases de RLHF, DPO o instrucción supervisada. Lo único documentado es el proceso de conversión: exportación con `litert_torch.generative.export_hf` (con `--trust_remote_code`), cuantización int8 de rango dinámico, empaquetado con litert-lm-builder 0.19.1 y firma de prefill con dos longitudes (128 y 1.024 tokens). Se embebe el tokenizer de Hugging Face, la plantilla de chat de Aion y el token de parada `<|end|>` (ID 200020).

## Capacidades

- Generación de texto conversacional en modo instruct, con plantilla de chat embebida y parada explícita en `<|end|>`.
- Razonamiento multi-turno dentro de la ventana de 4.096 tokens de caché KV.
- Recuperación de información en prompts largos: el autor verifica que el modelo recuerda un código declarado antes de 3.272 tokens de prompt, superando la ventana deslizante de 2.048 tokens.
- Ejecución on-device en Android e iOS mediante LiteRT-LM 0.19 sin parches de runtime.
- Capacidades multilingües: no disponibles (los idiomas no están documentados).
- Tool calling, function calling, agentes y modo thinking: no documentados en la información disponible.
- Visión y audio: no soportados (pipeline de text-generation).

## Casos de uso

- Asistentes conversacionales offline en aplicaciones móviles: el modelo corre en el propio dispositivo con LiteRT-LM, lo que permite conversaciones multi-turno sin conexión ni envío de datos a servidores; la caché KV de 4.096 tokens cubre sesiones de chat de duración media.
- Respuesta a preguntas sobre documentos locales: con prompts de hasta ~3.200 tokens, el modelo demuestra recuperar información concreta declarada al principio del contexto, útil para resumir o consultar notas, correos o contratos almacenados en el dispositivo.
- Funciones de autocompletado y redacción en teclados y apps de notas: la decodificación de 7 a 15 tok/s en GPU de gama alta (Snapdragon 8 Elite, 8 Gen 2) es suficiente para sugerencias de texto incrementales.
- Clasificación y extracción de información en el borde: etiquetado de textos, extracción de entidades o generación de respuestas cortas estructuradas en pipelines de procesamiento local, evitando costes de API.
- Prototipado de aplicaciones de IA generativa en Android/iOS: al ser una build `.litertlm` compatible con el runtime estándar, sirve para validar experiencias de usuario con LLM antes de invertir en infraestructura de servidor.
- Procesamiento de datos sensibles en entornos regulados: al no salir la inferencia del dispositivo, encaja en escenarios donde la normativa impide enviar texto a la nube (sanidad, legal, finanzas personales).
- Evaluación comparativa de backends móviles: el autor publica cifras de prefill y decode por SoC, lo que permite usar el modelo como referencia para medir CPU frente a GPU en dispositivos concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica mediciones de rendimiento de inferencia en seis dispositivos con LiteRT-LM 0.19.1, sobre un prompt de 3.272 tokens y una respuesta de ~75 tokens:

| Dispositivo | SoC | Prefill/decode CPU (tok/s) | Prefill/decode GPU (tok/s) |
|---|---|---|---|
| Galaxy Tab S9+ | Snapdragon 8 Gen 2 | 56 / 7,2 | 391 / 10,6 |
| Pixel 10 | Tensor G5 | 65 / 5,0 | 179 / 2,8 |
| Pixel 9 | Tensor G4 | 42 / ~4 | 167 / 7,6 |
| Galaxy S25 | Snapdragon 8 Elite | ~79 / ~8,8 | ~532 / ~15 |
| Galaxy A56 | Exynos 1580 | ~35 / ~3,1 | ~97 / ~4,1 |
| Redmi Note 13+ | Dimensity 7200-Ultra | ~31 / ~2,4 | ~80 / ~4,3 |

Los valores con `~` son estimaciones del autor a partir de tiempos de reloj y recuentos exactos de tokens; el resto son cifras del benchmark propio de LiteRT-LM.

## Requisitos de hardware

- VRAM/RAM: la ruta GPU necesita aproximadamente 8 GB de RAM; en móviles de 4 a 6 GB (Exynos 1380, Snapdragon 6 Gen 3, Dimensity 6100+) el proceso fue terminado por falta de memoria.
- El archivo `.litertlm` ocupa 2.333.097.680 bytes (~2,33 GB), lo que marca el mínimo de almacenamiento y buena parte del consumo de memoria.
- GPU recomendadas: SoCs móviles de gama alta con al menos 8 GB de RAM (Snapdragon 8 Elite, Snapdragon 8 Gen 2, Tensor G5/G4). En CPU funciona en gama media, pero con decodificación inferior a 1 tok/s en los dispositivos de 4-6 GB probados.
- No cabe en GPUs de escritorio mediante este formato: LiteRT-LM está orientado a Android e iOS. Para servidor o RTX 4090/A100/H100 existe la build GGUF Q4_0 del mismo modelo para llama.cpp.
- Despliegue: LiteRT-LM 0.19 (Android e iOS) como runtime objetivo; llama.cpp con el GGUF Q4_0 como alternativa fuera de móvil. vLLM, TGI y Ollama no están soportados para este formato.
- Latencia y throughput: ver tabla de benchmarks; el mejor caso medido es ~532 tok/s de prefill y ~15 tok/s de decode en GPU de Snapdragon 8 Elite, y el peor ~80 tok/s de prefill y ~4,3 tok/s de decode en Dimensity 7200-Ultra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aion 1.0 Instruct 2.3B (LiteRT-LM, esta build) | ~2,3B | 4.096 tokens KV; ventana deslizante 2.048 | `.litertlm`, LiteRT-LM 0.19 | MIT | Hugging Face, 0 descargas |
| Aion 1.0 Instruct 2.3B (base, microsoft) | ~2,3B | no disponible | safetensors/PyTorch | MIT | Hugging Face |
| Aion 1.0 Instruct 2.3B Q4_0 GGUF (timmyboy26) | ~2,3B | no disponible | GGUF Q4_0, llama.cpp | MIT | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar la calidad de este modelo con alternativas de la misma categoría (por ejemplo, otros instruct de ~2B para on-device), por lo que la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay datos publicados de benchmarks de calidad, por lo que no es posible evaluar su rendimiento frente a otros modelos de tamaño similar sin pruebas propias.
- El modelo base no documenta sesgos, composición del dataset ni idiomas soportados; el riesgo de alucinación es el habitual en modelos de ~2B y no está cuantificado.
- La ventana efectiva de atención es limitada: las capas de ventana deslizante cubren 2.048 tokens, aunque el autor verifica recuperación más allá de ese límite en las capas de atención completa.
- En dispositivos con 4-6 GB de RAM la ruta GPU falla por memoria y la CPU decodifica por debajo de 1 tok/s, lo que hace inviable el uso interactivo.
- El tokenizador y la plantilla de chat son los de Aion; la plantilla modificada solo altera el comportamiento cuando el contenido del mensaje es una lista de partes, no cuando es texto plano.
- La licencia es MIT con el texto de copyright de Microsoft; el autor declara no estar afiliado ni respaldado por Microsoft. Verificar el archivo `LICENSE` antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- El formato `.litertlm` solo es utilizable con LiteRT-LM; no es portable a otros runtimes sin reconversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timmyboy26/aion-1.0-instruct-2.3b-litert-lm
- Modelo base: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- Build GGUF Q4_0 del mismo modelo: https://huggingface.co/timmyboy26/aion-1.0-instruct-2.3b-q4_0-gguf
- Licencia (archivo en el repositorio): https://huggingface.co/timmyboy26/aion-1.0-instruct-2.3b-litert-lm/blob/main/LICENSE
- LiteRT-LM: no disponible en la información proporcionada
- litert-torch: no disponible en la información proporcionada
- litert-lm-builder: no disponible en la información proporcionada
