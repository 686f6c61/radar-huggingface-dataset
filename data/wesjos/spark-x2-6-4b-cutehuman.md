# wesjos/Spark-x2.6-4B-CuteHuman

## Resumen

Spark-x2.6-4B-CuteHuman es un ajuste fino (SFT) del modelo base XHToken/Spark-X2.6-4B, un transformer causal de 4.112.079.360 parámetros desarrollado por el usuario wesjos. El objetivo del modelo es claro y acotado: incorporar en los pesos una persona conversacional de estilo "cute" (emoji, kaomoji, tono cercano y desenfadado) para uso en roleplay y chat informal, sin modificar las capacidades cognitivas del modelo base. Es, por tanto, un fine-tune de estilo, no una mejora de capacidades.

Técnicamente hereda la arquitectura completa del modelo base: 36 capas con atención híbrida (9 capas de atención completa y 27 de atención deslizante con ventana de 512), hidden size de 2560, 16 cabezas de atención y 4 cabezas KV, con un vocabulario de 131.072 tokens. La ventana de contexto nativa declarada es de 1.048.576 tokens, aunque el tokenizador anuncia 131.072. El checkpoint se distribuye en bf16 en un único shard de safetensors de 7,66 GiB.

Su relevancia es limitada pero específica: cubre el nicho de asistentes conversacionales con personalidad marcada y despliegue en dispositivo (on-device), con licencia Apache-2.0 y soporte nativo en llama.cpp desde la build b10828. No compite en benchmarks de razonamiento ni de código; compite en consistencia de estilo y en coste de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Spark2_5ForCausalLM (transformer causal con atención híbrida: 9 capas full-attention + 27 capas sliding-attention, ventana 512) |
| Parámetros totales | 4.112.079.360 (335,5 M de embeddings, 3,78 B no-embedding) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 nativo (`max_position_embeddings`); el tokenizador anuncia 131.072 |
| Tipos de cuantización | bf16 (repo principal); Q4_K_M (2,42 GiB) y Q8_0 (4,07 GiB) en el repo GGUF hermano |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, un shard de 7,66 GiB); GGUF en repo separado |

Otros datos técnicos: hidden size 2560, 16 cabezas de atención y 4 cabezas KV, head_dim 256, RoPE parcial 0,25 en las capas de atención completa, vocabulario de 131.072 tokens. La caché KV ocupa 36,0 KiB por token con atención completa (9 capas), lo que equivale a 4,50 GiB a 128 K de contexto y 36 GiB a 1 M.

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con un esquema de atención híbrido poco habitual: de las 36 capas, solo 9 emplean atención completa y las 27 restantes usan atención deslizante con ventana de 512 tokens. Esta combinación reduce el coste de la caché KV y del cómputo en contextos largos, manteniendo un subconjunto de capas con visibilidad global. El uso de RoPE parcial (0,25) únicamente en las capas de atención completa es otra decisión de diseño orientada a eficiencia. La implementación requiere `trust_remote_code=True` y define la clase `Spark2_5ForCausalLM`.

El entrenamiento del fine-tune es SFT sobre el checkpoint XHToken/Spark-X2.6-4B. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos no están disponibles. La plantilla de chat es byte a byte idéntica a la del modelo base, con un system prompt por defecto de "you are a helpful assistant." sin persona incorporada, lo que implica que el estilo "cute" reside íntegramente en los pesos. La plantilla abre un bloque `<think>` por defecto y admite `reasoning_effort` con valores `low` y `high`; para conversación informal se recomienda `enable_thinking=False`.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés, con registro informal y cercano.
- Persona "cute" consistente: uso espontáneo de emoji, kaomoji y tildes de estilo (`~`) sin necesidad de system prompt.
- Modo de razonamiento (thinking) activado por defecto mediante bloques `<think>`, con control de esfuerzo vía `reasoning_effort` (`low`/`high`).
- Generación de código: la model card muestra ejemplos funcionales de matplotlib (gráfico de estrella) y de un MLP completo en NumPy.
- Aritmética decimal exacta en casos sencillos (ejemplo documentado: 8,2 × 9,12 = 74,784).
- Soporte de plantilla de chat con roles (`apply_chat_template`) y prompts de sistema para modular el estilo.
- No dispone de visión, audio ni otras modalidades: es un modelo exclusivamente de texto.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte específico de agentes o razonamiento multi-paso más allá del modo thinking heredado del base.

## Casos de uso

- Asistentes conversacionales con personalidad para aplicaciones de consumo: el fine-tune mantiene un tono cercano y consistente turno a turno, adecuado para apps de chat, companions virtuales o widgets de atención informal donde la persona importa más que la precisión factual.
- Roleplay y personajes: al residir el estilo en los pesos y no en el prompt, el modelo reproduce la persona incluso con system prompt vacío, lo que simplifica el encadenado de personajes y reduce el coste en tokens de instrucciones.
- Despliegue on-device: con cuantización Q4_K_M (2,42 GiB) cabe en equipos con 4-6 GB de VRAM o en portátiles con GPU integrada, lo que permite ejecutar el asistente localmente sin conexión mediante llama.cpp.
- Generación de snippets de código didácticos: los ejemplos de la model card (matplotlib, MLP en NumPy) muestran utilidad para tutoriales y respuestas de programación de complejidad baja o media en un contexto de chat.
- Prototipado rápido de interfaces conversacionales: la licencia Apache-2.0 y el formato GGUF con plantilla de chat embebida permiten integrar el modelo en demos y pruebas de concepto sin trabajo de adaptación de plantilla.
- Chat de soporte en chino e inglés: el modelo cubre ambos idiomas de forma nativa, útil para productos con audiencia bilingüe en esos mercados.
- Moderación de estilo en producción: la model card documenta que un system prompt del tipo "tone the emoji down" suaviza el registro, lo que permite reutilizar el mismo checkpoint con distintos niveles de expresividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de estilo o preferencia. Tampoco se dispone de comparaciones numéricas con el modelo base ni con otros fine-tunes. Los únicos datos de rendimiento disponibles son cualitativos (ejemplos de salida en las capturas de demostración) y de infraestructura (tamaños de cuantización y ocupación de caché KV).

## Requisitos de hardware

- VRAM para bf16: aproximadamente 8,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, 10-12 GB para contexto corto.
- VRAM para Q8_0: 4,07 GiB de pesos; viable en GPUs de 8 GB.
- VRAM para Q4_K_M: 2,42 GiB de pesos; viable en GPUs de 4-6 GB y en equipos con memoria unificada.
- Caché KV: 36,0 KiB por token a atención completa; 4,50 GiB a 128 K de contexto y 36 GiB a 1 M, lo que hace inviable el contexto máximo en hardware de consumo.
- GPUs recomendadas: RTX 4090, A100 o H100 para bf16 con contexto largo; RTX 3060/4060 y superiores para cuantizaciones Q4/Q8.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con bf16 y contexto moderado; en GPUs de 6-8 GB con Q4_K_M o Q8_0.
- Opciones de despliegue: transformers (requiere `transformers>=5.0.0` por el `tokenizer_class: "TokenizersBackend"` del repo), llama.cpp (soporte nativo `spark2_5` desde la build b10828 y en v0.9.0), y cualquier runtime compatible con GGUF. No se documenta soporte verificado en vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-x2.6-4B-CuteHuman | 4,11 B | 1.048.576 nativo | Apache-2.0 | safetensors bf16 + GGUF | Fine-tune de persona sobre Spark-X2.6-4B |
| XHToken/Spark-X2.6-4B (base) | 4,11 B | 1.048.576 nativo | Apache-2.0 | safetensors | Mismo modelo sin persona; capacidades idénticas |
| Spark-X2.6-4B-abliterated (FrostWolfAI) | 4,11 B | no disponible | no disponible | bf16 safetensors + GGUF | Variante sin censura del mismo base (2/100 rechazos, KL 0,0177) |
| Spark-x2.6-4B-HTML (wesjos) | 4,11 B | no disponible | no disponible | no disponible | Otro fine-tune del mismo autor orientado a HTML/WebUI |

La comparación relevante es contra el modelo base y contra otras variantes del mismo checkpoint: todas comparten arquitectura y tamaño, y difieren únicamente en el ajuste de estilo o alineación. No se dispone de datos de benchmarks para establecer diferencias cuantitativas de rendimiento entre ellas.

## Limitaciones y advertencias

- Techo de conocimiento de 4 B: hechos, matemáticas y razonamiento largo quedan al nivel del modelo base; este fine-tune no mejora capacidades, solo estilo.
- Riesgo de alucinación inherente a un modelo de 4 B sin etapa de alineación documentada; no debe usarse como fuente factual sin verificación.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otros idiomas.
- El contexto nativo de 1 M es teórico en la práctica: la caché KV de 36 GiB a esa longitud lo hace inviable en hardware de consumo.
- La plantilla de chat abre un bloque `<think>` por defecto; si no se desactiva con `enable_thinking=False`, el rastro de razonamiento consume el presupuesto de generación en conversación informal.
- El repositorio requiere `transformers>=5.0.0` por el `tokenizer_class: "TokenizersBackend"`, lo que rompe la carga en la versión 4.57.1 que fija el modelo base; es una incompatibilidad práctica para pipelines existentes.
- Las capturas de demostración se tomaron en un cliente de chat que no se distribuye en el repositorio; no hay directorio `webui/` ni código de interfaz incluido.
- Licencia Apache-2.0: permite uso comercial y modificación, pero no se documentan garantías ni evaluaciones de sesgo; conviene auditar el comportamiento en dominios sensibles antes de producción.
- El uso de `trust_remote_code=True` implica ejecutar código del autor del modelo; revisar la implementación de `Spark2_5ForCausalLM` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Spark-x2.6-4B-CuteHuman
- Versión GGUF: https://huggingface.co/wesjos/Spark-x2.6-4B-CuteHuman-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Otro fine-tune del mismo autor (HTML/WebUI): https://huggingface.co/wesjos/Spark-x2.6-4B-HTML
- Colección del modelo abliterated (FrostWolfAI): https://huggingface.co/collections/FrostWolfAI/spark-x26-4b-abliterated
- Repositorio de llama.cpp (soporte `spark2_5` desde b10828): https://github.com/ggml-org/llama.cpp
- Perfil del autor en Hugging Face: https://huggingface.co/wesjos
