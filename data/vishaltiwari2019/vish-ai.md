# Vishaltiwari2019/Vish-Ai

## Resumen

Vish-Ai es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario Vishaltiwari2019 en Hugging Face. Se trata de un modelo de generación de texto de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, un transformer decoder-only con atención de tipo causal. El autor indica que el entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente 2 veces más rápido que un pipeline convencional.

El modelo parte de la versión cuantizada a 4 bits del instructivo original (`unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit`), un checkpoint optimizado para fine-tuning con QLoRA. El resultado se distribuye en formato safetensors con pesos completos (el repositorio ocupa 3,1 GB), lo que sugiere que los adaptadores se fusionaron con el modelo base tras el entrenamiento. La licencia es Apache 2.0, heredada del modelo original.

La relevancia de este modelo es limitada en el ecosistema actual: se trata de un fine-tuning personal sin benchmarks publicados, sin documentación de dataset de entrenamiento y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de pipeline de ajuste con Unsloth sobre Qwen2.5, pero no como modelo de producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención causal |
| Parametros totales | 1.543.714.304 (aprox. 1,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el autor no lo documenta) |
| Tipos de cuantizacion | No documentados por el autor; el modelo base de partida era bnb-4bit, pero los pesos publicados son safetensors en precisión completa (probablemente fp16/bf16) |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings de tipo rotary (RoPE). El modelo base Qwen2.5-1.5B-Instruct incorpora mejoras sobre Qwen2 en cuanto a datos de entrenamiento y alineación, pero el autor no detalla ninguna innovación arquitectónica propia en este fine-tuning.

El entrenamiento se realizó con Unsloth y TRL, partiendo de un checkpoint cuantizado a 4 bits (bnb-4bit), lo que indica un flujo de QLoRA: se cargan los pesos en 4 bits, se entrenan adaptadores de bajo rango y posteriormente se fusionan con el modelo base. El autor no especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO adicional ni hiperparámetros como rango LoRA, learning rate o número de épocas. Tampoco se documenta si se aplicó alguna técnica de decodificación especulativa o atención lineal. Toda esta información se considera no disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instructivo Qwen2.5-1.5B.
- Razonamiento básico y respuesta a instrucciones de complejidad media, limitado por el tamaño de 1,5 B parámetros.
- Generación de código y matemáticas a nivel introductorio, con fiabilidad inferior a modelos de mayor tamaño.
- Soporte de tool calling / function calling: no documentado explícitamente por el autor; el modelo base Qwen2.5 lo soporta, pero no hay garantía de que el fine-tuning lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: la model card solo declara inglés; el modelo base Qwen2.5 es multilingüe, pero el fine-tuning puede haber degradado otros idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el modelo puede desplegarse en una GPU de consumo y usarse para validar flujos de diálogo multi-turno antes de invertir en modelos mayores.
- Generación de texto en aplicaciones de bajo coste: con 1,5 B parámetros, es viable en entornos con recursos limitados para tareas de resumen, reescritura o respuesta a preguntas simples.
- Fine-tuning adicional como base: al estar bajo Apache 2.0 y en safetensors, sirve como punto de partida para nuevos ajustes con LoRA/QLoRA en dominios específicos.
- Experimentación educativa con Unsloth y TRL: el repositorio documenta el pipeline de entrenamiento, lo que lo hace útil como referencia para aprender a ajustar Qwen2.5.
- Chatbots de soporte interno con datos propios: si el fine-tuning se realizó sobre un corpus concreto, puede emplearse en ese dominio, aunque sin benchmarks no hay garantía de calidad.
- Evaluación comparativa de fine-tunings: sirve como caso de estudio para medir el impacto de un ajuste ligero sobre Qwen2.5-1.5B-Instruct en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica, unos 4-5 GB para contextos moderados.
- VRAM estimada en cuantización GGUF Q4_K_M: aproximadamente 1-1,2 GB de pesos, con un total de 2-3 GB incluyendo contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM en fp16, y en GPUs de 4 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers, vLLM, llama.cpp (tras conversión a GGUF), Ollama (tras conversión), TGI.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,5 B, se espera un throughput alto en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Vish-Ai (este modelo) | 1,5 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Fine-tuning personal sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, muy usado | Requiere aceptar licencia; buen rendimiento en inglés |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa ligera de Hugging Face con benchmarks públicos |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar de Qwen2.5, puede reproducir sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinación: alto en un modelo de 1,5 B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Limitaciones de contexto e idioma: la model card solo declara inglés; el contexto no está documentado y podría haberse reducido respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveats para producción: sin benchmarks, sin dataset documentado y con cero descargas, no hay evidencia de calidad; se recomienda evaluar exhaustivamente antes de cualquier despliegue.
- El fine-tuning se realizó sobre un checkpoint cuantizado a 4 bits, lo que puede introducir degradación adicional respecto al modelo original.
- No hay información sobre el proceso de alineación (RLHF/DPO) tras el fine-tuning, por lo que el comportamiento conversacional puede ser inconsistente.

## Enlaces

- [Hugging Face: Vishaltiwari2019/Vish-Ai](https://huggingface.co/Vishaltiwari2019/Vish-Ai)
- [Modelo base: unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-unsloth-bnb-4bit)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Librería TRL de Hugging Face](https://github.com/huggingface/trl)
