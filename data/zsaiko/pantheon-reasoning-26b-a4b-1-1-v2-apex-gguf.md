# zSaiko/Pantheon-Reasoning-26B-A4B-1.1-V2-APEX-GGUF

## Resumen

Pantheon-Reasoning-26B-A4B-1.1-V2-APEX-GGUF es un conjunto de cuantizaciones GGUF de precisión mixta del modelo Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, publicado por el usuario zSaiko. El modelo base es un transformer de arquitectura MoE (mixture of experts) con aproximadamente 26 000 millones de parámetros totales y un tamaño activo denotado como "A4B" (en torno a 4 000 millones de parámetros activos por token, según la convención de nomenclatura del autor). Está orientado a razonamiento, conversación, roleplay y escritura creativa, y se distribuye bajo licencia Apache 2.0.

El interés de esta publicación no reside en el modelo en sí, sino en el método de cuantización: las variantes APEX emplean una matriz de importancia específica del modelo y precisión mixta por tensor, en lugar de un esquema GGUF uniforme. Se ofrecen tres variantes: iQuality (~5,89 BPW), iQuality con LM head en Q8_0 y iCompact (~4,31 BPW). El propio autor advierte en la model card que la receta de cuantización fue adaptada de otro modelo (StyleTuneV2) y que el resultado podría no ser óptimo, lo que constituye una advertencia relevante para uso en producción.

La relevancia actual es doble: por un lado, permite ejecutar un MoE de ~26B en hardware de consumo mediante llama.cpp; por otro, documenta con métricas de fidelidad (KLD frente a BF16) el coste real de la cuantización mixta, algo poco habitual en publicaciones de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta "gemma4" en los tags del repo) |
| Parametros totales | 25 971 339 550 (~26B) |
| Parametros activos | ~4B (denotado "A4B" en el nombre; cifra exacta no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de precisión mixta por tensor: APEX iQuality (~5,89 BPW), APEX iQuality con LM head Q8_0, APEX iCompact (~4,31 BPW) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos (MoE), etiquetado como "gemma4" en los tags del repositorio, con 25 971 339 550 parámetros totales y una fracción activa de aproximadamente 4B por token. La model card del repositorio de cuantización no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; esa información remite a la model card del modelo base de Gryphe, no incluida en la documentación disponible.

La innovación técnica de esta publicación es el esquema APEX: una matriz de importancia específica de Pantheon combinada con asignación de precisión distinta por tensor, derivada del trabajo de EmanuelOverride sobre cuantización APEX de Gemma 4. El autor documenta una limitación de forma: `ffn_down_exps.weight` tiene una dimensión de 704, incompatible con ciertos formatos K-quant, por lo que llama.cpp aplica fallbacks (por ejemplo, `IQ4_XS` se almacena como `IQ4_NL`, `Q5_K` como `Q5_1` y `Q6_K` como `Q8_0`).

## Capacidades

- Generación de texto conversacional y multi-turno.
- Razonamiento explícito (etiqueta "reasoning" en el repositorio).
- Escritura creativa y roleplay, casos de uso declarados por el autor.
- Generación de código y matemáticas: no documentado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (visión, audio, thinking mode): no disponible.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado explícitamente para roleplay y escritura creativa, con un MoE de ~4B activos que permite mantener conversaciones largas en hardware de consumo con las variantes iCompact.
- Asistente conversacional local: la variante iCompact (~4,31 BPW) reduce el peso en disco y memoria lo suficiente para desplegarse en un equipo de sobremesa con llama.cpp, manteniendo coherencia conversacional razonable (61,759 % de coincidencia en el token top-1 frente a BF16).
- Prototipado de razonamiento con trazas: útil para experimentar con cadenas de razonamiento en inglés antes de invertir en infraestructura con el modelo en BF16.
- Evaluación de técnicas de cuantización: el repositorio publica métricas KLD, RMS Δp y coincidencia top-1, lo que lo convierte en un caso de estudio para comparar recetas de cuantización mixta frente a esquemas uniformes.
- Generación creativa asistida (borradores de ficción, guiones, descripciones): adecuado por su orientación a escritura creativa y su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales.
- Despliegue en entornos con GPU modesta: al ser GGUF y ejecutable con llama.cpp, puede correr total o parcialmente en CPU, lo que facilita pruebas en portátiles o estaciones sin GPU dedicada de gran VRAM.

## Benchmarks y rendimiento

El repositorio no publica benchmarks de tareas (MMLU, HumanEval, GSM8K). Sí incluye una evaluación de fidelidad de la cuantización frente a logits BF16 de referencia sobre WikiText-2 con llama.cpp, 128 fragmentos de 512 tokens (32 640 posiciones puntuadas):

| Variante | KLD media | Mismo token top-1 | RMS Δp |
|---|---:|---:|---:|
| APEX iQuality | 0,861731 | 72,387 % | 8,638 % |
| APEX iQuality — Q8 LM Head | 0,856834 | 72,540 % | 8,636 % |
| APEX iCompact | 1,386163 | 61,759 % | 11,638 % |

El experimento con LM head en Q8_0 aporta una mejora marginal sobre iQuality estándar. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM estimada: iQuality (~5,89 BPW) requiere aproximadamente 19 GB solo para pesos; iCompact (~4,31 BPW) ronda los 14 GB. Hay que añadir KV cache y overhead del runtime, por lo que en la práctica conviene contar con 20-24 GB para iQuality y 16-18 GB para iCompact.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para iQuality; RTX 4080/4070 Ti Super (16 GB) para iCompact. Para despliegues con mayor concurrencia, A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, especialmente la variante iCompact en tarjetas de 16 GB y ambas en 24 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en su flujo estándar.
- Latencia y throughput: no disponibles. Al ser un MoE con ~4B activos, el throughput debería ser superior al de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pantheon-Reasoning-26B-A4B-1.1-V2 APEX (este) | ~26B totales / ~4B activos | No disponible | Apache 2.0 | GGUF mixto | Cuantización de autor único, con advertencia de calidad del propio cuantizador |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 (base) | ~26B totales / ~4B activos | No disponible | Apache 2.0 | Safetensors (BF16) | Referencia de fidelidad; requiere mucha más VRAM |
| Mistral Small 3 (24B) | 24B densos | 32K | Apache 2.0 | Safetensors, GGUF | Alternativa densa con cuantizaciones GGUF establecidas y amplio soporte |
| Qwen2.5-32B | 32B densos | 128K | Apache 2.0 | Safetensors, GGUF | Mayor contexto, pero sin ventaja MoE en coste de inferencia |

La comparación con modelos concretos es orientativa: no hay datos de benchmarks de tareas para este modelo que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- El propio autor de la cuantización advierte que el resultado "podría ser bastante malo" tras uso personal, al haber aplicado una receta pensada para otro modelo con un régimen de entrenamiento distinto. Es una señal de calidad que debe pesar en cualquier decisión de producción.
- Solo soporta inglés según el campo `language`; no hay evidencia de calidad en castellano.
- Riesgo de alucinación: no cuantificado en la información disponible; en modelos orientados a roleplay y creatividad suele ser elevado en contextos factuales.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card del modelo base antes de diseñar prompts largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no reflejadas aquí.
- Los fallbacks de formato en `ffn_down_exps.weight` implican que los tipos declarados en el nombre del archivo no describen todos los tensores; no asumir precisiones uniformes.
- Sin benchmarks de tareas publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval o GSM8K para este modelo.
- Repositorio con muy poca tracción (788 descargas, 1 like) y actualizado por última vez en septiembre de 2026; no hay garantía de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zSaiko/Pantheon-Reasoning-26B-A4B-1.1-V2-APEX-GGUF
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
