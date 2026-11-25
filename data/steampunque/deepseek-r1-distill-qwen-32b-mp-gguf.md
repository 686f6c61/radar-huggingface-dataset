# steampunque/DeepSeek-R1-Distill-Qwen-32B-MP-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-32B-MP-GGUF es una cuantización GGUF de precisión mixta (mixed precision) del modelo DeepSeek-R1-Distill-Qwen-32B, publicado por el usuario steampunque. El modelo base es una destilación de DeepSeek-R1 sobre el preentrenamiento de Qwen 2.5 32B, que incorpora el entrenamiento con RL y el bloque de razonamiento (`<think>`) característico de la familia R1. El autor de esta versión no es DeepSeek ni Alibaba, sino un tercero que redistribuye una versión cuantizada del modelo original.

La contribución de esta ficha es la cuantización: un esquema híbrido que aplica distintos niveles de cuantización por capa (Q4_K, Q5_K y Q6_K) para lograr un tamaño de fichero de aproximadamente 4,91 bits por peso, similar al de un Q4_K_M estándar, pero con un embedding y una capa de salida en Q6_K. El resultado son ficheros de unos 20,1 GB que caben en configuraciones de consumo y mantienen una perplejidad comparable a la del Q4_K_M de referencia según el autor.

El modelo es relevante para quienes quieren ejecutar localmente un modelo de razonamiento de 32.700 millones de parámetros con ventana de contexto ampliable, tool calling heredado de Qwen 2.5 y licencia MIT. No obstante, es una cuantización de un destilado: el rendimiento está acotado por el modelo base y no debe confundirse con DeepSeek-R1 completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen 2.5 32B) |
| Parametros totales | 32.763.876.352 (32,7 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el autor menciona ejecución con 8k de contexto |
| Tipos de cuantizacion | GGUF con precisión mixta por capa: Q4_K, Q5_K, Q6_K; embedding y output en Q6_K; ~4,91 bpw |
| Idiomas soportados | no disponible en la model card (heredados del modelo base, no documentados aquí) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors solo como dato del modelo base) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-R1-Distill-Qwen-32B: una destilación de DeepSeek-R1 sobre el preentrenamiento de Qwen 2.5 32B, que añade entrenamiento con RL y el formato de bloque de pensamiento (`<think>`) propio de R1. La arquitectura subyacente es un transformer decoder-only denso de 32,7 mil millones de parámetros, sin mezcla de expertos. La model card del autor describe el efecto del entrenamiento como un aumento notable de la generación de tokens en prompts de razonamiento, con mejora de precisión en algunos casos.

La innovación de esta ficha concreta es la cuantización por capas: el autor define un mapa `E quant Q4_E_H` que asigna niveles Q5_K a las primeras capas, Q4_K a la mayor parte del cuerpo y Q5_K/Q6_K a las capas finales, con embedding y tensor de salida en Q6_K. El objetivo declarado es minimizar la pérdida de entropía manteniendo un tamaño cercano al Q4_K_M. No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) del modelo base ni del proceso de cuantización.

## Capacidades

- Generación de texto y razonamiento multi-paso mediante bloque `<think>` heredado de DeepSeek-R1.
- Razonamiento matemático y de código, propio de un destilado de R1 sobre Qwen 2.5.
- Tool calling y function calling heredados de Qwen 2.5 (no verificados explícitamente en la model card de esta cuantización).
- Conversación multi-turno (tag `conversational` en Hugging Face).
- Capacidades multilingües del modelo base, aunque no documentadas en esta ficha.
- Decodificación especulativa: el autor reporta uso de Qwen3 0.6B como modelo borrador con bloques de longitud fija (ND=4 o 5) y traducción dinámica de vocabulario.
- No se documentan capacidades de visión ni audio en esta cuantización.

## Casos de uso

- Razonamiento local en estación de trabajo: ejecutar el modelo en 2x RTX 4070 con RPC y 8k de contexto, como reporta el autor, para tareas de análisis y resolución de problemas sin depender de la nube.
- Generación de código asistida: el bloque de pensamiento permite trazar pasos intermedios antes de producir código; útil en entornos con requisitos de auditoría del razonamiento.
- Despliegue en servidores con VRAM limitada: el tamaño de ~20,1 GB y el esquema Q4_E_H permiten servir el modelo en GPUs de 24 GB con offload parcial o en configuraciones multi-GPU de consumo.
- Evaluación de modelos de razonamiento en investigación: la licencia MIT y el formato GGUF facilitan experimentos reproducibles con llama.cpp y comparaciones de perplejidad frente a Q4_K_M.
- Aceleración con decodificación especulativa: el autor documenta un aumento de throughput de 22 a 54 tokens/s con un borrador Qwen3 0.6B y ND=5, útil en pipelines de generación interactiva.
- Prototipado de asistentes conversacionales: el tag `conversational` y el soporte de contexto multi-turno permiten construir chatbots de dominio acotado con moderación previa.
- Fine-tuning posterior sobre GGUF no es directo; el caso de uso realista es inferencia y evaluación, no reentrenamiento.

## Benchmarks y rendimiento

La model card solo publica datos de perplejidad y throughput del autor; no hay benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Q4_K_M | Q4_E_H (esta ficha) |
|---|---|---|
| Tamano | 20,1e9 | 20,1e9 |
| Perplejidad (PPL) | 6,2 | 6,2 |

Rendimiento reportado por el autor (2x RTX 4070, RPC, CPU 9900K, prompt `goldcoin`, QKV/NKV F16/8k):

| Cuantizacion | ND | NGL | PP (tok/s) | TG (tok/s) |
|---|---|---|---|---|
| Q4_E_H | 0 | 65/65 | 471 | 22 |
| Q4_E_H | 4 | 65/65 | 410 | 51 |
| Q4_E_H | 5 | 65/65 | 428 | 54 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~20,1 GB de pesos en Q4_E_H; con contexto de 8k y caché KV en F16 se recomienda al menos 24 GB agregados.
- GPU recomendadas: 2x RTX 4070 (reportado por el autor con RPC), RTX 4090, A100 40 GB, H100.
- Cabe en GPU de consumo: sí, en 2x RTX 4070 o en una RTX 4090 con offload parcial; en una sola GPU de 24 GB requiere gestión cuidadosa del contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con endpoints (tag `endpoints_compatible`), decodificación especulativa con Qwen3 0.6B como borrador.
- Throughput estimado: 22 tok/s sin borrador y 51-54 tok/s con borrador ND=4-5, según el autor; PP entre 410 y 471 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B-MP-GGUF (esta ficha) | 32,7 B | no disponible (8k en pruebas) | GGUF Q4_E_H | MIT | Cuantización mixta ~4,91 bpw, PPL 6,2 |
| DeepSeek-R1-Distill-Qwen-32B (original) | 32,7 B | no disponible | safetensors | MIT | Modelo base sin cuantizar |
| Q4_K_M del mismo modelo base | 32,7 B | no disponible | GGUF | MIT | PPL 6,2, tamaño 20,1e9, sin Q6_K en embedding/output |
| Qwen 2.5 32B Instruct | 32,7 B | no disponible | safetensors/GGUF | Apache 2.0 (modelo base) | Sin bloque de razonamiento R1 |

## Limitaciones y advertencias

- Es una cuantización de terceros: el autor no es DeepSeek ni Alibaba; la calidad depende del esquema Q4_E_H y no hay validación independiente más allá de la PPL reportada.
- La PPL de 6,2 es idéntica a la del Q4_K_M según el autor, pero no se aportan métricas de tareas (MMLU, HumanEval) que confirmen la equivalencia en uso real.
- El modelo base es un destilado: el autor lo describe como "OK, nada revolucionario", con más generación de tokens en razonamiento y precisión variable según el prompt.
- Riesgo de alucinación y de sobre-generación en el bloque `<think>`, especialmente en prompts ambiguos; requiere control de longitud de salida.
- Idiomas soportados no documentados en esta ficha; no asumir cobertura multilingüe sin verificar con el modelo base.
- Licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de destilación.
- El rendimiento reportado (51-54 tok/s) depende de RPC, hardware concreto y decodificación especulativa; no es un valor garantizado en otros entornos.
- Contexto máximo no documentado en la model card; las pruebas del autor usan 8k, no el máximo teórico del modelo base.
