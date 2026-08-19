# VantoraLabs/Vantora-Micro

## Resumen

Vantora-Micro es un modelo de lenguaje causal de tipo Llama puro, desarrollado por VantoraLabs como artefacto de investigación para estudiar leyes de escalado y comparaciones de arquitectura en el rango de menos de 10 000 parámetros. Con solo 9 800 parámetros, se trata de un modelo extremadamente pequeño, entrenado sobre 100 millones de tokens del subconjunto `sample-10BT` de FineWeb-Edu. Su propósito declarado es servir de línea base "transformer puro" en una comparativa frente a un modelo híbrido Mamba-2 + atención del mismo tamaño.

El modelo emplea una arquitectura LlamaForCausalLM con 2 capas ocultas, dimensión de modelo 8, una sola cabeza de atención y contexto de 512 tokens. Está licenciado bajo MIT y solo soporta inglés. Su rendimiento en el benchmark BananaMind Base Bench 1.1 (Elo 810, precisión 26 %) se sitúa cerca del azar para preguntas de opción múltiple, lo que confirma su naturaleza de juguete de investigación y no de herramienta de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer puro) |
| Parametros totales | 9 800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (también config.json, tokenizer.json) |

## Arquitectura y entrenamiento

Vantora-Micro es un transformer causal estándar con arquitectura Llama: 2 capas ocultas, dimensión de modelo (`d_model`) de 8, tamaño de capa intermedia de 22 (ratio MLP 2.77), una sola cabeza de atención con dimensión de cabeza 8, embeddings atados, normalización RMSNorm (épsilon 1e-6) y posiciones rotatorias RoPE con theta 10000. El vocabulario es un ByteLevel BPE de 1024 tokens. Los pesos se almacenan en float32.

El entrenamiento se realizó sobre los primeros 100 millones de tokens de `HuggingFaceFW/fineweb-edu` (subconjunto `sample-10BT`), con una sola época (100M tokens vistos en total). Se usó un lote de 128 secuencias de longitud 256 (3 051 pasos), optimizador AdamW con tasa de aprendizaje 5e-3, programación coseno con 15 % de calentamiento, recorte de gradiente 1.0 y semilla 42. El hardware fue una NVIDIA GTX 750 (Maxwell, 4 GB VRAM) y el tiempo total de entrenamiento fue de aproximadamente 4,3 minutos. No se aplicaron técnicas de alineación como RLHF o DPO; es un modelo base.

## Capacidades

- Generación de texto causal básica: puede continuar secuencias de texto de forma estadística, pero con calidad muy limitada debido a su tamaño.
- Comprensión de contexto muy corta: ventana de 512 tokens, suficiente para frases breves.
- Solo inglés: el vocabulario y los datos de entrenamiento son exclusivamente en inglés.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No dispone de modo de pensamiento, visión ni audio.
- Capacidad de código muy rudimentaria: en el benchmark BananaMind obtuvo 34 % de precisión en completado de código, pero con fragmentos triviales.

## Casos de uso

- Investigación en leyes de escalado: permite estudiar cómo se comportan métricas como pérdida o precisión en modelos de menos de 10K parámetros, comparando arquitecturas puras frente a híbridas.
- Comparación de arquitecturas: sirve como línea base transformer puro frente a un modelo Mamba-2 + atención del mismo tamaño, para aislar el efecto de la arquitectura.
- Docencia en aprendizaje automático: útil para ilustrar el pipeline completo de entrenamiento, evaluación y despliegue de un modelo de lenguaje con recursos mínimos.
- Pruebas de infraestructura: al ser diminuto, se puede usar para validar integraciones con `transformers`, `safetensors` o sistemas de inferencia sin coste computacional.
- Experimentos de inicialización y optimización: permite probar configuraciones de hiperparámetros (tasa de aprendizaje, programación, etc.) en segundos.
- Generación de texto de juguete: puede producir continuaciones de frases muy cortas, pero sin coherencia sostenida; no apto para ningún uso real.

## Benchmarks y rendimiento

El modelo fue evaluado con el runner oficial de BananaMind Base Bench 1.1 (350 ítems, verificación SHA-256). Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Elo global | 810 |
| Precision global | 26,00 % (91/350) |
| Precision ponderada | 25,48 % |

| Categoria | Elo | Precision |
|---|---|---|
| Language Completion | 919 | 52,0 % |
| Commonsense | 658 | 16,0 % |
| World Knowledge | 702 | 20,0 % |
| Context Tracking | 665 | 12,0 % |
| Quantitative | 875 | 26,0 % |
| Logical Reasoning | 839 | 22,0 % |
| Code Completion | 982 | 34,0 % |

La precisión global del 26 % está muy cerca del 25 % esperado por azar en preguntas de opción múltiple con cuatro alternativas, lo que confirma que el modelo no ha aprendido capacidades reales de razonamiento o conocimiento.

## Requisitos de hardware

- VRAM estimada: menos de 1 MB (9 800 parámetros en float32 ocupan ~39 KB; el resto es overhead del runtime).
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, o incluso CPU sin GPU.
- Compatible con GPU de consumo: sí, cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) lo ejecuta con recursos despreciables.
- Opciones de despliegue: `transformers` (Python), `llama.cpp` (si se convierte a GGUF), `Ollama` (teóricamente, aunque no hay soporte oficial para tamaños tan pequeños), o cualquier framework de inferencia.
- Latencia: del orden de milisegundos en CPU; throughput irrelevante por el tamaño.

## Comparativa con modelos similares

No se dispone de modelos comparables en el rango de 10K parámetros con los mismos objetivos de investigación. Los modelos pequeños más conocidos (SmolLM-135M, TinyLlama-1.1B, GPT-2 124M) tienen al menos 100 veces más parámetros y no son comparables en capacidades ni en propósito. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Modelo extremadamente pequeño: no es apto para ninguna tarea de producción; su precisión en benchmarks es cercana al azar.
- Alto riesgo de alucinación y falta de coherencia: cualquier texto generado de más de unas pocas palabras será probablemente incoherente.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado a 512 tokens: no puede manejar conversaciones largas ni documentos extensos.
- Sin alineación: no ha pasado por RLHF ni instrucciones, por lo que no sigue comandos ni mantiene diálogos.
- Licencia MIT: permite uso comercial, pero el modelo no tiene utilidad práctica real.
- Es un artefacto de investigación: su único valor es el estudio académico de escalado y comparación de arquitecturas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VantoraLabs/Vantora-Micro
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
