# tinyopsec/Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF

## Resumen

Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF es un repositorio de cuantizaciones GGUF de un fine-tuning de Llama-3.2-1B-Instruct especializado en coreano, publicado por el usuario tinyopsec. El modelo base original, `torchtorchkimtorch/Llama-3.2-Korean-GGACHI-1B-Instruct-v1`, fue ajustado con más de 230.000 ejemplos de instrucciones en coreano sobre el modelo instruct de Meta, y estas cuantizaciones se han generado con llama.cpp para su ejecución local.

Su valor principal es doble: por un lado, ofrece un modelo muy ligero (1.235 millones de parámetros) afinado para seguir instrucciones en coreano, algo que los modelos Llama originales de 1B cubren de forma limitada; por otro, el formato GGUF permite ejecutarlo en CPU, portátiles o GPUs modestas sin dependencias pesadas. Es relevante para desarrolladores que necesitan un asistente conversacional en coreano de bajos recursos, aunque se trata de un modelo comunitario sin documentación exhaustiva ni benchmarks publicados, por lo que conviene evaluarlo antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama 3.2), autorregresivo |
| Parametros totales | 1.235.814.432 (~1,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Llama-3.2-1B-Instruct soporta 128.000 tokens) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Coreano (fine-tuning); ingles heredado del modelo base (no especificado por el autor) |
| Licencia | Meta Llama 3.2 Community License |
| Formato de pesos | GGUF (generado con llama.cpp); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-1B-Instruct, un transformer decoder convencional de Meta con atención agrupada por consultas (GQA) y RoPE. Sobre esa base se aplicó un fine-tuning supervisado (SFT) con más de 230.000 ejemplos de instrucciones en coreano, orientado a mejorar el seguimiento de instrucciones y la conversación en ese idioma. No hay información publicada sobre el uso de RLHF, DPO ni sobre la composición exacta del dataset.

Este repositorio no contiene pesos de entrenamiento nuevos: es una conversión a GGUF del modelo afinado, realizada con llama.cpp, con 13 niveles de cuantización distintos que van desde F16 (3,0 GB) hasta Q2_K. El tamaño total del repositorio es de 12,5 GB.

## Capacidades

- Generacion de texto conversacional siguiendo instrucciones en coreano (pipeline text-generation, etiqueta conversational)
- Seguimiento de instrucciones heredado de Llama-3.2-1B-Instruct y reforzado con el fine-tuning en coreano
- Razonamiento general y generacion de codigo en la medida que lo permite el modelo base de 1B (sin datos especificos del fine-tuning)
- Ejecucion local en CPU o GPU mediante runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp
- Sin soporte documentado de vision, audio, tool calling ni thinking mode

## Casos de uso

- Chatbots en coreano de bajos recursos: el tamaño de ~1,24 B parámetros permite desplegar un asistente conversacional multi-turno en hardware mínimo, como un portátil sin GPU dedicada.
- Prototipado local sin coste de API: con Ollama o LM Studio se puede integrar el modelo en aplicaciones de prueba para validar flujos conversacionales en coreano sin enviar datos a servicios externos.
- Sistemas embebidos y edge: las cuantizaciones Q2_K y Q3_K reducen el footprint a menos de 1 GB, adecuado para dispositivos con memoria limitada que necesiten generación de texto en coreano.
- Ajuste fino adicional (continued fine-tuning): al ser un modelo pequeño y abierto bajo licencia Llama 3.2, sirve como punto de partida para fine-tunings posteriores con datos propios de dominio en coreano.
- Complemento de traducción y redacción ligera: generación y reescritura de textos cortos en coreano dentro de pipelines de procesamiento de lenguaje, donde un modelo grande sería innecesario o inviable.
- Evaluación y benchmarking de cuantizaciones: la disponibilidad de 13 niveles de cuantización lo hace útil para estudiar la degradación de calidad en coreano según el nivel de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del modelo tampoco proporciona evaluaciones del fine-tuning original sobre conjuntos como Ko-MMLU, KMMLU o HAE-RAE.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 3,0 GB en F16, ~1,5 GB en Q4_K_M y ~0,5-0,7 GB en Q2_K, más memoria para el KV cache segun la longitud de contexto
- GPUs recomendadas: no requiere GPU; cualquier GPU moderna con 4 GB de VRAM (por ejemplo RTX 3050 o superior) ejecuta la cuantización F16 o Q8_0 sin problemas
- Consumer GPUs: cabe sobradamente en GPUs de gama baja y media; en CPU, cualquier procesador x86 o ARM reciente con al menos 4 GB de RAM libres es suficiente
- Despliegue: llama.cpp (llama-cli), Ollama, LM Studio, koboldcpp o cualquier runtime compatible con GGUF
- Latencia y throughput: no disponible; dada la talla de 1B, se esperan velocidades de decodificación de varias decenas de tokens por segundo incluso en CPU de escritorio (estimación no verificada por el autor)

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF | 1,24 B | no disponible (base: 128k) | Coreano (SFT, 230k+ instrucciones) | Llama 3.2 Community |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128k | Multilingue general (coreano limitado) | Llama 3.2 Community |
| Qwen2.5-1.5B-Instruct | 1,54 B | 128k | Multilingue con buen soporte de coreano y chino | Qwen Research (uso comercial permitido con condiciones) |
| EXAONE-3.5-2.4B-Instruct | 2,4 B | 128k | Coreano e ingles (LG AI Research) | EXAONE Model License (restricciones comerciales) |

Frente al modelo base de Meta, esta variante ofrece un seguimiento de instrucciones en coreano presumiblemente superior, aunque sin benchmarks que lo confirmen. Frente a Qwen2.5-1.5B o EXAONE-3.5-2.4B, es más ligero, pero carece de evaluaciones publicadas y su contexto no está documentado en este repositorio.

## Limitaciones y advertencias

- Riesgo de alucinacion elevado: con ~1,24 B de parámetros y sin evaluaciones publicadas del fine-tuning, la fiabilidad factual es limitada; el propio autor advierte "evaluate before use"
- Sesgos: hereda los sesgos de Llama-3.2-1B-Instruct y de los 230k+ ejemplos de instrucciones coreanas, cuya composición y procedencia no están documentadas
- Idioma: el fine-tuning está centrado en coreano; el rendimiento en castellano u otros idiomas no está verificado y probablemente sea inferior al del modelo base
- Contexto: la longitud de contexto no está documentada en la model card; al convertir a GGUF podría diferir de los 128k del modelo base
- Licencia: la Meta Llama 3.2 Community License impone restricciones (límite de 700 millones de usuarios activos mensuales, obligación de cumplir la política de uso aceptable); no es una licencia totalmente permisiva tipo Apache o MIT
- Capacidades no documentadas: no hay soporte declarado de tool calling, agentes, vision ni audio; no debe asumirse su presencia
- Proyecto comunitario sin mantenimiento declarado: pocas descargas (418) y sin evaluaciones de terceros; se recomienda validación exhaustiva antes de cualquier despliegue en produccion

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Llama-3.2-Korean-GGACHI-1B-Instruct-v1-GGUF
- Modelo base (fine-tuning original): no disponible como URL directa en la informacion proporcionada (referenciado como `torchtorchkimtorch/Llama-3.2-Korean-GGACHI-1B-Instruct-v1`)
- Modelo base de Meta: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Paper, blog o demo: no disponible
