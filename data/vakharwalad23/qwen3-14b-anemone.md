# vakharwalad23/Qwen3-14B-Anemone

## Resumen

Qwen3-14B-Anemone es una conversión de Qwen3-14B (de Alibaba) para ejecutarse sobre el Apple Neural Engine (ANE) mediante Anemone, un runtime para Apple Silicon desarrollado por vakharwalad23. El modelo principal corre en la Neural Engine con pesos de 4 bits en formato de tablas de búsqueda (GPTQ sobre tablas), mientras un borrador (drafter) DSpark de DeepSeek corre en la GPU para acelerar la generación mediante decodificación especulativa. El resultado es una inferencia local en Mac con mejor eficiencia energética que MLX en GPU: 28,5 tokens/s y 0,74 J por token en un M3 Pro de 18 GB.

Su relevancia radica en demostrar que modelos de 14B parámetros pueden ejecutarse fuera de la GPU tradicional, aprovechando el ANE con un consumo energético por token aproximadamente un 37 % menor que la alternativa MLX 4-bit en GPU, manteniendo salida idéntica a la decodificación greedy sin borrador. La calidad de los pesos cuantizados se mide contra el modelo bf16 original con divergencia KL y precisión top-1, mostrando resultados comparables o mejores que la conversión MLX 4-bit estándar en documentos.

Requiere un Mac con Apple Silicon, macOS 27 (Core AI) y unos 36 GB de disco libre (10 GB de descarga y unos 26 GB de copias compiladas). Funciona en Macs de 18 GB de memoria unificada. La primera ejecución compila el modelo para el ANE (unos 22 minutos en un M3 Pro); las siguientes arrancan en segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-14B), ejecutado como 8 programas Core AI de 5 capas para el ANE |
| Parametros totales | 14B (base Qwen3-14B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (rungos de contexto de 256 a 4096) |
| Tipos de cuantizacion | 4 bits en tablas de búsqueda (16 valores por 32 filas de salida, GPTQ sobre tablas) para el ANE; int4 para el drafter en GPU; embeddings en fp16 |
| Idiomas soportados | no disponibles (hereda el multilingüismo de Qwen3-14B, no especificado en la ficha) |
| Licencia | Apache 2.0 (la conversión); el drafter procede de un repositorio sin licencia declarada (DeepInfer de DeepSeek es Apache 2.0) |
| Formato de pesos | `.aimodel` (programas Core AI para ANE y GPU), `embeddings.f16`, configuración `anemone.json` y tokenizer de Qwen3 |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un transformer decoder denso de 14B parámetros de Alibaba. Esta conversión no reentrena el modelo: aplica cuantización GPTQ a 4 bits sobre tablas de búsqueda (16 valores por cada 32 filas de salida) mediante `anemone-convert` con su calibración por defecto, y divide el modelo en ocho programas Core AI de 5 capas para el Apple Neural Engine. Una innovación clave es que el MLP mantiene los tokens en el eje de anchura, lo que evita ejecutar cada capa 14B una vez por token. Los anchos de llamada varían de 8 a 64 y los rungos de contexto de 256 a 4096 tokens.

La aceleración viene de la decodificación especulativa: el modelo principal corre en el ANE y el drafter DSpark (bloque 7, de DeepSeek, convertido a int4 para GPU) propone tokens que se verifican en árbol usando el token subcampeón en cada paso. Según el autor, la salida es token a token idéntica a la decodificación greedy sin borrador (6 de 6 prompts verificados). No se proporcionan datos sobre el entrenamiento original de Qwen3-14B ni sobre RLHF/DPO en esta ficha.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredando las capacidades de Qwen3-14B.
- Modo thinking desactivado en las mediciones publicadas; Qwen3-14B base soporta modo de razonamiento, aunque no se detalla su comportamiento en esta conversión.
- Decodificación especulativa con verificación en árbol, con salida garantizada idéntica al greedy sin borrador.
- Plantilla de chat y tokenizer de Qwen3 incluidos.
- No se mencionan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Chatbot local en Mac: ejecución completamente offline en Apple Silicon sin GPU externa, adecuado para asistentes conversacionales privados con datos que no deben salir del dispositivo.
- Generación de texto eficiente en energía: con 0,74 J por token frente a 2,05 J de MLX 4-bit en GPU, es adecuado para cargas prolongadas de generación en portátiles donde la batería importa.
- Asistentes de escritorio con arranque rápido: tras la primera compilación (unos 22 minutos), las ejecuciones posteriores arrancan en segundos, ideal para apps de escritorio que invocan el modelo de forma intermitente.
- Prototipado de agentes ligeros en local: con 4096 tokens de contexto puede gestionar conversaciones multi-turno cortas y flujos de varios pasos, aunque el contexto limitado restringe documentos largos.
- Despliegue en Macs de gama media: funciona en máquinas de 18 GB de memoria unificada sin necesidad de hardware de servidor.
- Experimentación con decodificación especulativa en ANE: base útil para desarrolladores que investigan inferencia en Neural Engine con verificación en GPU.

## Benchmarks y rendimiento

Rendimiento en M3 Pro 18 GB, macOS 27.0.1, greedy decoding, 6 prompts x 256 tokens, thinking off (2026-10-25):

| Configuracion | tokens/s | Energia por token | Salida igual a greedy simple |
|---|---|---|---|
| Anemone, esta conversion | 28,5 | 0,74 J | 6 de 6 |
| mlx-dspark 0.20.3 (MLX 4-bit + mismo drafter, GPU) | 36,9 | 1,17 J | 2 de 6 |
| MLX 4-bit (GPU) | 16,8 | 2,05 J | 6 de 6 |

Calidad de los pesos 4-bit frente a Qwen3-14B bf16 (teacher forced; menor KL es más cercano):

| Pesos | KL, docs | KL, chat | top-1, docs | top-1, chat |
|---|---|---|---|---|
| Esta conversion | 0,051 | 0,068 | 0,890 | 0,933 |
| MLX 4-bit (`mlx-community/Qwen3-14B-4bit`) | 0,074 | 0,058 | 0,867 | 0,920 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta conversión en la información disponible.

## Requisitos de hardware

- Mac con Apple Silicon y macOS 27 (Core AI); funciona en Macs de 18 GB de memoria unificada.
- Unos 36 GB de disco libre: 10 GB de descarga y unos 26 GB de copias compiladas.
- Xcode 27 para compilar Anemone; la primera ejecución compila el modelo para el ANE en unos 22 minutos (medido en M3 Pro).
- No requiere GPU discreta: el modelo corre en el Apple Neural Engine y el drafter en la GPU integrada.
- Despliegue mediante el binario `anemone` (construido con Swift): `anemone run --model vakharwalad23/Qwen3-14B-Anemone "prompt"`.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI; depende exclusivamente del runtime Anemone.
- Throughput medido: 28,5 tokens/s en M3 Pro; latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Ejecucion | Licencia |
|---|---|---|---|---|
| Qwen3-14B-Anemone (esta conversion) | 14B (4-bit) | 4096 | Apple Neural Engine + drafter en GPU (Anemone) | Apache 2.0 |
| Qwen/Qwen3-14B (original) | 14B (bf16) | no disponible en la ficha | GPU/CUDA, MLX, llama.cpp, etc. | Apache 2.0 |
| mlx-community/Qwen3-14B-4bit | 14B (4-bit) | no disponible | GPU via MLX (Apple Silicon) | Apache 2.0 (heredada) |

Frente a MLX 4-bit en GPU, esta conversión es un 70 % más rápida (28,5 frente a 16,8 tokens/s) y consume un 64 % menos de energía por token, con mayor fidelidad a bf16 en documentos (KL 0,051 frente a 0,074). Frente a mlx-dspark con el mismo drafter, es más lenta en tokens/s (28,5 frente a 36,9) pero más eficiente energéticamente y con salida greedy verificada en 6 de 6 prompts frente a 2 de 6. El contexto de 4096 tokens es notablemente menor que el de Qwen3-14B original.

## Limitaciones y advertencias

- Contexto limitado a 4096 tokens, muy por debajo del contexto nativo de Qwen3-14B; no apto para documentos largos o RAG con mucho material recuperado.
- Requiere macOS 27 (Core AI) y Xcode 27: no funciona en versiones anteriores de macOS ni en hardware no Apple.
- Los pesos 4-bit difieren ligeramente del bf16 original (KL 0,051-0,068, top-1 0,89-0,93), lo que puede afectar a tareas sensibles a la precisión.
- El repositorio del drafter (`deepseek-ai/dspark_qwen3_14b_block7`) no declara licencia; el autor indica que el drafter se retirará si DeepSeek lo solicita, lo que introduce incertidumbre sobre su disponibilidad futura.
- La primera ejecución exige una compilación de unos 22 minutos y 36 GB de disco, un coste inicial significativo.
- Rendimiento medido solo en M3 Pro con alimentación de corriente y greedy decoding; otros chips o condiciones pueden dar resultados distintos.
- Sin datos de benchmarks estándar (MMLU, HumanEval, etc.) para esta conversión; la calidad de las respuestas de Qwen3-14B cuantizado debe validarse caso por caso.
- Sesgos y riesgo de alucinación: heredados de Qwen3-14B; no se documentan evaluaciones específicas en la ficha.
- Soporte de idiomas no especificado en la ficha de esta conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vakharwalad23/Qwen3-14B-Anemone
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio Anemone: https://github.com/vakharwalad23/Anemone
- Benchmarks detallados de Anemone: https://github.com/vakharwalad23/Anemone/blob/main/docs/benchmarks.md#qwen3-14b
- Guía de conversión: https://github.com/vakharwalad23/Anemone/blob/main/docs/convert.md#qwen3-14b
- Drafter DSpark (DeepSeek): https://huggingface.co/deepseek-ai/dspark_qwen3_14b_block7
- DeepInfer (DeepSeek): https://github.com/deepseek-ai/DeepInfer
- Conversión MLX 4-bit de referencia: https://huggingface.co/mlx-community/Qwen3-14B-4bit
