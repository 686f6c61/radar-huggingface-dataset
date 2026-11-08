# xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic

## Resumen

Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic es un checkpoint experimental publicado por el usuario xtools-at en Hugging Face. Se trata de una versión "decensored" (sin mecanismos de rechazo) del merge de pesos `xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong`, generada con la herramienta Heretic v2.0.0.dev0 mediante una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 13 a 21 del transformer.

El modelo subyacente es un merge lineal ponderado de tres fine-tunes de Qwen3.5-4B creados por Jackrong: uno orientado a razonamiento destilado de trazas estilo Claude Opus 4.6 (peso 1.0), otro orientado a código, depuración y uso de herramientas (peso 0.8) y un tercero centrado en razonamiento estructurado multi-paso (peso 0.6). El objetivo declarado del merge es concentrar razonamiento, programación y flujos agénticos en un único checkpoint compacto de unos 4.540 millones de parámetros.

La relevancia de esta variante concreta reside en su intervención sobre el comportamiento de rechazo: según la model card, las negativas caen de 98/100 en el modelo original a 4/100 en esta versión, con una divergencia KL de 0,0776 respecto al original. Es, por tanto, un modelo pensado para experimentación con alineación y para casos donde los rechazos del modelo base resultan un obstáculo, no para despliegues de producción sin salvaguardas externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 (≈4,54 B, dato real de safetensors) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la model card; existe una variante GGUF BF16-mmproj en un repo asociado (`xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity-GGUF`), lo que implica compatibilidad con llama.cpp |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers); GGUF disponible en repo derivado |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es el resultado de dos operaciones sucesivas sobre la familia Qwen3.5-4B. Primero, un merge lineal ponderado (media ponderada de pesos) de tres fine-tunes de Jackrong con coeficientes 1.0, 0.8 y 0.6, respectivamente. Segundo, una ablación de rango arbitrario aplicada con Heretic v2.0.0.dev0 entre las capas 13 y 21, con los parámetros `preserve_good_behavior_weight` = 0,9212, `steer_bad_behavior_weight` = 0,0010, `overcorrect_relative_weight` = 0,8894 y `neighbor_count` = 14. Esta intervención modifica direcciones de activación asociadas a comportamientos de rechazo sin reentrenar.

Los datos de entrenamiento de los modelos fuente incluyen los datasets `nohurry/Opus-4.6-Reasoning-3000x-filtered`, `Jackrong/Qwen3.5-reasoning-700x`, `Roman1111111/claude-opus-4.6-10000x`, `Jackrong/Claude-opus-4.6-TraceInversion-9000x`, `Jackrong/Claude-opus-4.7-TraceInversion-5000x` y `lambda/hermes-agent-reasoning-traces`. No se especifica el número de tokens de entrenamiento ni la composición exacta de los datasets. El autor indica que el proceso es reproducible y publica un directorio `reproduce` con instrucciones.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso, con énfasis declarado en trazas de razonamiento estructurado.
- Generación y depuración de código, incluyendo flujos de resolución iterativa de errores.
- Uso de herramientas (tool calling / function calling) y comportamiento orientado a agentes, heredado de los fine-tunes de código y razonamiento.
- Razonamiento matemático y lógico, derivado de la destilación de trazas estilo Claude Opus 4.6.
- Entrada multimodal texto-imagen según el pipeline declarado (`image-text-to-text`), aunque el autor advierte explícitamente que la funcionalidad multimodal debe probarse y no asumirse tras el merge.
- Comportamiento de rechazo fuertemente reducido (4/100 frente a 98/100 del original), lo que habilita respuestas sobre temas que el modelo base declina.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la ablación ARA comparando directamente con el checkpoint original, gracias a la reproducibilidad documentada y a la métrica de divergencia KL publicada.
- Generación de código en entornos controlados: el componente coder del merge está entrenado con trayectorias agénticas y trace inversion, lo que lo hace adecuado para tareas de refactorización y corrección de bugs en pipelines internos.
- Agentes de resolución de problemas multi-paso: la combinación de razonamiento estructurado y tool calling permite construir agentes que descomponen tareas y llaman a APIs intermedias.
- Redacción asistida sin fricción de rechazos: para aplicaciones creativas o de ficción donde el modelo base bloquea contenido legítimo, esta variante reduce las negativas de forma medible.
- Prototipado de asistentes conversacionales de bajo coste: con 4,54 B de parámetros y pesos safetensors de 9,1 GB, puede servirse en una sola GPU consumer para pruebas de concepto.
- Evaluación comparativa de merges: sirve como punto de referencia para medir cuánto degrada la ablación las capacidades originales (código, matemáticas) frente al modelo sin decensurar.
- Fine-tuning posterior sobre dominios específicos: al ser Apache-2.0 y estar disponible en safetensors, se puede reentrenar con LoRA para nichos concretos partiendo de un checkpoint ya alineado al estilo de razonamiento deseado.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de decensurado, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Este modelo | Modelo original |
|---|---:|---:|
| Rechazos | 4/100 | 98/100 |
| Divergencia KL | 0,0776 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contextos moderados.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB.
- GPU recomendadas: A100 o H100 para servicio concurrente en precisión completa; RTX 4090 (24 GB) para inferencia BF16 holgada; RTX 3090/4080 (16-24 GB) para FP16 o 8 bits.
- Cabe en GPU consumer: sí, en tarjetas de 8-12 GB con cuantización 4-8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), llama.cpp/Ollama vía el GGUF publicado en el repo derivado, y endpoints compatibles según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (heretic) | 4,54 B | No disponible | Razonamiento + código + agente, sin rechazos | Apache-2.0 | 4/100 rechazos, KL 0,0776 |
| xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong | 4,54 B | No disponible | Mismo merge sin decensurar | Apache-2.0 | 98/100 rechazos; referencia directa |
| Qwen/Qwen3.5-4B | ≈4 B | No disponible | Modelo base multimodal texto-imagen | No disponible en la información | Arquitectura y pesos de partida |
| Jackrong/Qwopus3.5-4B-Coder | ≈4 B | No disponible | Código, debugging y agentes | No disponible en la información | Componente del merge (peso 0,8) |

## Limitaciones y advertencias

- Modelo experimental: el propio autor advierte que su rendimiento puede diferir del de los modelos fuente individuales; no hay benchmarks de capacidad que lo respalden.
- La ablación ARA entre las capas 13 y 21 puede degradar capacidades no medidas (razonamiento matemático, código, coherencia en contextos largos); la divergencia KL de 0,0776 indica un cambio no trivial en la distribución de salida.
- Riesgo elevado de contenido dañino, sesgado o inexacto: al eliminar los rechazos, el modelo responderá a solicitudes que el original bloqueaba, sin garantía de corrección ni de seguridad.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de fidelidad factual.
- Funcionalidad multimodal incierta: aunque el pipeline declarado es `image-text-to-text`, el autor indica que debe probarse y no asumirse.
- Idiomas soportados y longitud de contexto no documentados; no se debe asumir el contexto nativo de Qwen3.5-4B sin verificación.
- Licencia Apache-2.0 declarada para esta release, pero la procedencia de los datos de los fine-tunes (trazas destiladas de Claude Opus) puede plantear dudas sobre los términos de uso de esos datos subyacentes; conviene revisar antes de un uso comercial.
- Para producción se recomienda encarecidamente añadir capas de moderación externas y filtros de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Fine-tune de razonamiento: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Fine-tune de código: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Fine-tune de razonamiento estructurado: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Heretic (herramienta de decensurado): https://heretic-project.org
- GGUF asociado: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity-GGUF
- Dataset: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
