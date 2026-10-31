# wesjos/Qwen3.8-27B-CuteHuman-LoRA

## Resumen

Qwen3.8-27B-CuteHuman-LoRA es un adaptador LoRA desarrollado por el usuario wesjos que se aplica sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo completo, sino un ajuste de personalidad: su objetivo es modificar exclusivamente el estilo de conversación del modelo, reduciendo el lenguaje típico de asistente ("AI-speak"), acortando las respuestas y haciéndolas más naturales y cercanas, sin alterar el conocimiento ni las capacidades del modelo subyacente.

El adaptador se entrena mediante QLoRA con solo 10,49 millones de parámetros entrenables (el 0,038 % de los 27,37 mil millones del modelo base), lo que da lugar a un fichero de apenas 42 MB. Según el autor, el resultado duplica la puntuación de "monería" percibida (de 1,95 a 2,97 sobre 5), elimina por completo las expresiones robóticas en las pruebas realizadas y reduce la longitud mediana de respuesta de 351 a 215 caracteres, con una regresión no significativa en MMLU (de 77,54 % a 77,19 %).

Es relevante porque demuestra cómo un ajuste mínimo y barato puede transformar la experiencia conversacional de un modelo grande sin reentrenarlo por completo. Además, se publica bajo licencia Apache-2.0 y cuenta con una versión GGUF para llama.cpp, lo que facilita su uso en entornos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.8-27B (transformer) |
| Parametros totales | 27,37 B (modelo base); 10,49 M entrenables en el adaptador (0,038 %) |
| Parametros activos | no disponible (el modelo base no se declara como MoE) |
| Longitud de contexto | 131072 tokens (según el comando de ejemplo con llama.cpp) |
| Tipos de cuantizacion | El adaptador se entrena en 4-bit nf4 (QLoRA); se puede adjuntar a cualquier precisión; GGUF Q4_K_M disponible para el conjunto |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT, 42 MB en F32) y GGUF (repo complementario) |

## Arquitectura y entrenamiento

El adaptador es un LoRA clásico con rango 16 y alpha 32 (dropout 0) aplicado sobre los módulos `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 16 capas de atención completa del modelo base. El entrenamiento se realizó mediante QLoRA, es decir, con el modelo base cuantizado a 4 bits (nf4), aunque el adaptador resultante puede acoplarse al modelo en cualquier precisión. Esta técnica permite entrenar un modelo de 27 mil millones de parámetros con recursos muy limitados, ya que solo se actualiza una fracción mínima de los pesos.

Los datos de entrenamiento constan de 655 muestras: 462 cadenas de razonamiento de GSM8K y 193 ejemplos adicionales (el model card se corta en ese punto, por lo que la composición completa del resto del dataset no está disponible). No se menciona el uso de RLHF ni DPO. La filosofía del proyecto es deliberadamente minimalista: en lugar de ampliar capacidades, el ajuste se centra en el tono, la longitud de respuesta y la eliminación de fórmulas típicas de asistente, preservando el rendimiento en benchmarks de conocimiento general.

## Capacidades

- Generación de texto conversacional con un tono más natural, cercano y menos robótico que el modelo base.
- Conserva íntegramente las capacidades del modelo base Qwen3.8-27B: razonamiento, código y matemáticas (el entrenamiento incluye cadenas de razonamiento de GSM8K).
- Generación de código y contenido estructurado, como SVG animados, tal como muestran los ejemplos del model card.
- Modo thinking del modelo base controlable mediante `enable_thinking` en la plantilla de chat (se recomienda desactivarlo para charla casual).
- Soporte multilingüe en chino e inglés.
- Uso como agente en terminal, según el ejemplo del autor (restauración de un fichero SVG eliminado seguido de una canción sobre ramen).
- Compatible con tool calling y demás funcionalidades heredadas del modelo base Qwen3.8-27B (no documentadas específicamente para este adaptador).

## Casos de uso

- Chatbots de compañía y roleplay: el objetivo principal del adaptador es conseguir un tono mona y natural, ideal para personajes conversacionales en aplicaciones de chat o companions virtuales.
- Asistentes personales en local: gracias a la versión GGUF y a llama.cpp, se puede desplegar en un PC doméstico un asistente conversacional con respuestas cortas y humanas, sin el tono corporativo habitual.
- Agentes de terminal con personalidad: el ejemplo del autor muestra el modelo operando como agente en terminal (restaurar ficheros, generar SVG) manteniendo un estilo amigable en sus respuestas.
- Generación creativa de contenido visual: los ejemplos de comparación muestran generación de animaciones SVG (un gato persa bailando, comida favorita), útil para prototipado rápido de gráficos vectoriales.
- Reducción de costes de inferencia en chat: al reducir la longitud mediana de respuesta de 351 a 215 caracteres, se consume menos tokens por interacción, lo que abarata el despliegue a escala.
- Educación y práctica de razonamiento matemático: el entrenamiento incluye cadenas de pensamiento de GSM8K, por lo que conserva la capacidad de resolver problemas de matemáticas explicando el razonamiento paso a paso con un tono más accesible.
- Integración en aplicaciones multilingües chino-inglés: mantiene el rendimiento en ambos idiomas, útil para productos dirigidos a ambos mercados.

## Benchmarks y rendimiento

| Metrica | Qwen3.8-27B | + CuteHuman LoRA |
|---|---|---|
| Cuteness (1–5) | 1,95 | 2,97 |
| Apariciones de AI-speak (de 40) | 2 | 0 |
| Longitud mediana de respuesta (caracteres) | 351 | 215 |
| MMLU 5-shot (570 items) | 77,54 % | 77,19 % |

El autor indica que no hay regresión estadísticamente significativa en MMLU: lo que cambia es el tono y la longitud de las respuestas. No se han publicado comparaciones con otros modelos ni resultados en otros benchmarks (HumanEval, GSM8K en evaluación, etc.).

## Requisitos de hardware

- Inferencia del modelo base Qwen3.8-27B en bf16 requiere aproximadamente 54 GB (el autor cita esa cifra de RAM/disco para el merge; la VRAM en bf16 será del mismo orden, ~54 GB), lo que exige una A100 80 GB, H100 o multi-GPU.
- Cargando el modelo base en 4-bit nf4 con BitsAndBytes, el autor indica que el conjunto (base + adaptador) cabe en una sola GPU de 24 GB (por ejemplo, una RTX 3090 o RTX 4090).
- Con la versión GGUF Q4_K_M y el LoRA en llama.cpp, es viable su ejecución en GPU de consumo de 24 GB; con cuantizaciones menores podría caber en tarjetas de 16 GB, aunque no hay datos oficiales al respecto.
- Despliegue soportado o documentado: transformers + PEFT, merge a safetensors, y llama.cpp (llama-server con `--lora` y `--mmproj`). No se menciona soporte específico para vLLM, TGI u Ollama.
- No hay mediciones publicadas de latencia ni throughput; al añadir un LoRA de 42 MB el sobrecoste de inferencia es marginal respecto al modelo base.
- El merge del adaptador en bf16 requiere unos 54 GB de RAM y disco disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño del ajuste | Base | Licencia | Particularidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-CuteHuman-LoRA | LoRA de personalidad | 42 MB (10,49 M params) | Qwen3.8-27B | Apache-2.0 | Cambia el tono sin tocar el conocimiento; GGUF disponible |
| Qwen/Qwen3.8-27B (base) | Modelo completo | — | — | Apache-2.0 (según el ecosistema Qwen) | Modelo original con tono de asistente estándar |
| Otros LoRA de roleplay en HuggingFace | Adaptadores PEFT | Variable (decenas de MB) | Diversos | Variable | Categoría amplia; este se distingue por publicar métricas antes/después y benchmark MMLU |

No hay disponibles comparativas numéricas publicadas frente a otros LoRA de personalidad o roleplay; la tabla anterior es cualitativa.

## Limitaciones y advertencias

- El model card está incompleto: la descripción del dataset de entrenamiento se corta (solo se detallan 462 de las 655 muestras), por lo que la composición completa de los datos no es verificable.
- Métricas como "Cuteness" o "AI-speak" son evaluaciones subjetivas o definidas por el autor, sin metodología publicada ni evaluadores independientes.
- Descargas muy bajas (35) y un solo like: es un proyecto de autor individual sin adopción comunitaria demostrada ni auditoría externa.
- Al ser un ajuste de estilo, puede heredar todos los sesgos, riesgos de alucinación y limitaciones del modelo base Qwen3.8-27B; el adaptador no los mitiga.
- El estilo acortado de las respuestas podría eliminar matices o advertencias útiles en tareas técnicas; conviene evaluarlo caso por caso.
- Soporte de idiomas limitado a chino e inglés; el comportamiento en castellano no está documentado y no hay garantías de que el estilo se transfiera bien.
- La licencia Apache-2.0 del adaptador permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B en su repositorio oficial antes de despliegues comerciales.
- El merge a pesos completos requiere ~54 GB de RAM/disco, lo que puede ser un obstáculo en máquinas modestas.
- La longitud de contexto de 131072 tokens proviene del comando de ejemplo con llama.cpp; la ventana oficial del modelo base debe confirmarse en su model card.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión GGUF para llama.cpp: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF
- SVG de ejemplo (base): https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA/resolve/main/demos/compare/cat/base.svg
- SVG de ejemplo (CuteHuman): https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA/resolve/main/demos/compare/cat/cute.svg
- Paper, demo online y repositorio de entrenamiento: no disponibles
