# vakharwalad23/Qwen3-4B-Anemone

## Resumen

Qwen3-4B-Anemone es una conversión del modelo Qwen3-4B de Qwen (un transformer denso de 4.000 millones de parámetros) para ejecutarse sobre el Apple Neural Engine (ANE) mediante el motor Anemone, desarrollado por el usuario vakharwalad23. El problema que resuelve es la ejecución eficiente de LLM en Mac con Apple Silicon: en lugar de cargar la GPU unificada, el modelo principal corre en el ANE con pesos cuantizados a 4 bits mediante tablas de búsqueda (GPTQ sobre lookup tables), mientras un modelo borrador (drafter) DSpark de DeepSeek corre en la GPU para acelerar la generación mediante decodificación especulativa con verificación en árbol.

El resultado es relevante porque ofrece 74 tokens/s en un M3 Pro con un consumo energético de 0,30 J por token, frente a los 54,1 tokens/s y 0,64 J de la versión MLX 4-bit en GPU, manteniendo una salida idéntica a la decodificación greedy sin borrador (verificado en 6 de 6 prompts). El contexto máximo es de 4.096 tokens y la licencia es Apache 2.0. Es una ficha de nicho pero útil para desarrolladores de macOS que buscan inferencia local de baja latencia y bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B) convertido a dos programas Core AI de 18 capas para el Apple Neural Engine |
| Parametros totales | 4.000 millones (base Qwen3-4B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | 4 bits mediante lookup tables (16 valores por 32 filas de salida, GPTQ sobre las tablas); embeddings en fp16; drafter en int4 |
| Idiomas soportados | No disponibles (hereda los de Qwen3-4B, no documentados en la ficha) |
| Licencia | Apache 2.0 (el drafter procede de un repositorio sin licencia declarada; DeepInfer, su origen, es Apache 2.0) |
| Formato de pesos | `.aimodel` (programas Core AI para ANE/GPU), `embeddings.f16`, archivos de tokenizador; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B, un transformer decoder-only denso de Qwen. Esta conversión no reentrena el modelo: particiona el modelo en dos programas Core AI de 18 capas cada uno (`chunk-*.aimodel`) compilados para el Apple Neural Engine, con pesos cuantizados a 4 bits como tablas de búsqueda mediante GPTQ con la calibración por defecto de `anemone-convert`. Los embeddings se mantienen en fp16 en un archivo aparte. La cuantización introduce una desviación medible respecto al bf16 original: KL de 0,077 en textos de documentos y 0,112 en chat, con coincidencia top-1 del 0,891 y 0,915 respectivamente, cifras comparables o mejores que la cuantización MLX 4-bit de referencia.

La innovación principal es el esquema de decodificación especulativa híbrida: el modelo principal corre en el ANE mientras el drafter DSpark (bloque 7 de DeepSeek, convertido a un programa Core AI int4 que corre en la GPU) propone tokens, incluyendo el token segundo clasificado en cada paso para verificación en árbol. El drafter solo acelera: la salida es token a token idéntica a la decodificación greedy de estos pesos 4-bit. No hay información sobre datos de entrenamiento adicionales, RLHF ni DPO aplicados en esta conversión.

## Capacidades

- Generación de texto conversacional heredada de Qwen3-4B, con plantilla de chat de Qwen3 incluida.
- Modo thinking desactivable (los benchmarks se midieron con thinking off).
- Decodificación especulativa con verificación en árbol gracias al drafter DSpark, sin alterar la salida greedy.
- Ejecución en Apple Neural Engine con bajo consumo energético (0,30 J por token en M3 Pro).
- No hay información sobre tool calling, function calling ni capacidades de agente en la ficha.
- No incluye capacidades multimodales: es un modelo de solo texto (pipeline text-generation).

## Casos de uso

- Asistentes locales en macOS: al correr en el ANE con 0,30 J por token, es adecuado para chatbots que funcionan durante horas en portátiles Apple Silicon sin agotar la batería ni saturar la GPU.
- Generación de texto con baja latencia en apps nativas Swift: la integración vía Core AI permite incrustar el modelo en aplicaciones macOS sin dependencias de Python.
- Prototipado de agentes ligeros en dispositivo: con 4.096 tokens de contexto y 74 tokens/s, sirve para pipelines de razonamiento multi-paso de contexto corto, aunque sin tool calling documentado.
- Comparación de hardware y energía: los benchmarks detallados por prompt lo hacen útil para evaluar el trade-off rendimiento/consumo del ANE frente a GPU en Apple Silicon.
- Desarrollo y pruebas de decodificación especulativa: el repo incluye el drafter y su configuración, útil como referencia para implementar esquemas draft-and-verify en ANE+GPU.
- Uso offline en entornos sin conexión: todo el pipeline (modelo, tokenizador, plantilla de chat) es local, adecuado para herramientas de escritorio que procesan texto sensible sin enviarlo a la nube.

## Benchmarks y rendimiento

Mediciones del autor en M3 Pro 18 GB, macOS 27.0.1, alimentación de red, greedy decoding, 6 prompts x 256 tokens, thinking off (2026-10-24):

| Configuracion | tokens/s | Energia por token | Salida igual a greedy sin drafter |
|---|---|---|---|
| Anemone, esta conversion | 74,0 | 0,30 J | 6 de 6 |
| mlx-dspark 0.20.3 (MLX 4-bit + mismo drafter, GPU) | 94,5 | 0,43 J | 2 de 6 |
| MLX 4-bit (GPU) | 54,1 | 0,64 J | 6 de 6 |

Calidad de los pesos 4-bit frente a Qwen3-4B bf16 (teacher forced; menor KL es más cercano):

| Pesos | KL, docs | KL, chat | top-1, docs | top-1, chat |
|---|---|---|---|---|
| Esta conversion | 0,077 | 0,112 | 0,891 | 0,915 |
| MLX 4-bit (mlx-community/Qwen3-4B-4bit) | 0,095 | 0,107 | 0,875 | 0,917 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión; los datos anteriores son mediciones de rendimiento y fidelidad de cuantización realizadas por el autor.

## Requisitos de hardware

- Mac con Apple Silicon y macOS 27 (que incluya Core AI); Xcode 27 para compilar Anemone.
- Unos 12 GB de disco libre (estimado a partir de los modelos 8B y 14B); la descarga del modelo ronda los 3,5 GB.
- La primera ejecución compila el modelo para el Neural Engine (unos 10 minutos en un M3 Pro); las siguientes arrancan en segundos.
- Referencia de rendimiento medida: 74 tokens/s y 0,30 J por token en M3 Pro 18 GB; no hay datos para otros chips.
- Despliegue exclusivamente mediante el motor Anemone (compilado con Swift); no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que los pesos están en formato `.aimodel` para Core AI.
- No requiere GPU dedicada ni VRAM discreta: usa la memoria unificada del Mac y el ANE.

## Comparativa con modelos similares

| Modelo | Formato / runtime | Cuantizacion | Contexto | Rendimiento (M3 Pro) | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B-Anemone (este) | Core AI / ANE + drafter GPU | 4-bit lookup tables | 4.096 | 74,0 tokens/s, 0,30 J/token | Apache 2.0 |
| Qwen3-4B MLX 4-bit (mlx-community) | MLX / GPU unificada | 4-bit | No disponible en la ficha | 54,1 tokens/s, 0,64 J/token | Apache 2.0 (base) |
| Qwen3-4B (original) | PyTorch / safetensors | bf16 | No disponible en esta ficha | No disponible | Apache 2.0 |

La ventaja de esta conversión frente a MLX es el consumo energético (un 53 % menos por token) y la velocidad (+37 %), a costa de quedar limitada a macOS 27 con Core AI y de un contexto máximo de 4.096 tokens.

## Limitaciones y advertencias

- Contexto máximo de 4.096 tokens, muy por debajo del contexto nativo de Qwen3-4B; no apto para documentos largos.
- Plataforma muy restrictiva: requiere macOS 27 con Core AI y Xcode 27; no funciona en Linux, Windows ni en Macs Intel.
- Los pesos 4-bit difieren ligeramente del bf16 original (KL de 0,077-0,112), lo que puede degradar tareas sensibles a la precisión.
- El repositorio del drafter (deepseek-ai/dspark_qwen3_4b_block7) no declara licencia; el autor indica que lo retirará si DeepSeek lo solicita, lo que introduce incertidumbre legal sobre ese componente.
- Riesgo de alucinación y sesgos: heredados de Qwen3-4B; no hay evaluaciones de seguridad específicas en la ficha.
- Proyecto de un autor individual con 619 descargas y sin likes: madurez, mantenimiento y soporte limitados; usar con cautela en producción.
- Sin datos de benchmarks estándar de calidad (MMLU, etc.) para esta conversión concreta.
- Idiomas soportados no documentados en la ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vakharwalad23/Qwen3-4B-Anemone
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Anemone: https://github.com/vakharwalad23/Anemone
- Benchmarks detallados de Anemone: https://github.com/vakharwalad23/Anemone/blob/main/docs/benchmarks.md
- Guía de conversión: https://github.com/vakharwalad23/Anemone/blob/main/docs/convert.md
- Drafter DSpark (DeepSeek): https://huggingface.co/deepseek-ai/dspark_qwen3_4b_block7
- DeepInfer (origen de DSpark): https://github.com/deepseek-ai/DeepInfer
