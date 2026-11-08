# Verrucktekatze333/QwQen-0.5b-UwU

## Resumen

QwQen-0.5b-UwU es un modelo de lenguaje conversacional de pequeno tamano (494 millones de parametros) publicado por el usuario Verrucktekatze333 en Hugging Face. Se trata de un ajuste fino mediante LoRA sobre Qwen2.5-0.5B-Instruct, el modelo instructivo compacto de la familia Qwen2.5 de Alibaba, con el objetivo de hacer que el modelo responda en un registro estilizado denominado "uwu", un sociolecto de internet caracterizado por sustituciones foneticas (l/r por w), sufijos afectivos y emoticonos como ":3" o "~".

El modelo no pretende competir en capacidades de razonamiento o codigo con modelos de mayor escala; su interes es fundamentalmente experimental y de nicho: demuestra como un ajuste fino ligero con LoRA sobre una base de 0,5B puede reorientar el estilo de respuesta de forma consistente manteniendo la plantilla de chat de Qwen2.5. Se distribuye principalmente como GGUF cuantizado en Q4_K_M (397 MB), lo que lo hace ejecutable en hardware muy modesto, incluso en CPU.

La relevancia actual es limitada pero concreta: sirve como ejemplo de pipeline completo (base instruct + LoRA + cuantizacion GGUF + publicacion para Ollama/llama.cpp) para desarrolladores que quieran replicar el flujo con sus propios datasets de estilo. La ficha se basa unicamente en la informacion disponible en la model card y los metadatos de Hugging Face; no hay benchmarks publicados ni documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 494.032.768 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32768 tokens (segun model card) |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado, 397 MB) |
| Idiomas soportados | no disponible (la base Qwen2.5 es multilingue, pero el ajuste uwu se documenta en ingles) |
| Licencia | Apache 2.0 (heredada de Qwen2.5) |
| Formato de pesos | GGUF (Q4_K_M); safetensors referenciados en metadatos |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. Sobre esa base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) empleando un dataset propio de conversaciones en estilo "uwu". La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango de LoRA, la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO adicionales; toda esa informacion figura como no disponible.

Tras el ajuste, el modelo se cuantizo a GGUF en formato Q4_K_M, lo que reduce el peso a aproximadamente 397 MB. La plantilla de chat es la de Qwen2.5, pero con un system prompt predefinido que instruye al modelo a responder en registro uwu manteniendo correccion y concision, y a soportar formato Markdown. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en estilo uwu, con sustituciones foneticas y sufijos afectivos.
- Respuesta a preguntas simples de conocimiento general y aritmetica basica (el ejemplo de la model card resuelve 5 * 6 = 30).
- Soporte de plantilla de chat multi-turno heredada de Qwen2.5-Instruct.
- Formato Markdown en las respuestas, segun el system prompt.
- Capacidades multilingues: no documentadas para el ajuste; la base Qwen2.5 es multilingue, pero el estilo uwu se describe en ingles.
- Tool calling / function calling: no documentado en la model card.
- Razonamiento multi-paso y agentes: no documentado; el tamano de 0,5B limita seriamente estas capacidades.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Prototipado de chatbots con personalidad: util para experimentar con estilos de respuesta marcados sin coste de inferencia, ya que el modelo corre en CPU con llama.cpp u Ollama y pesa menos de 400 MB.
- Demostracion educativa de ajuste fino con LoRA: sirve como referencia de pipeline completo (base instruct, LoRA, cuantizacion GGUF, publicacion) para talleres o cursos sobre personalizacion de LLM.
- Pruebas de integracion con Ollama y llama.cpp: permite validar flujos de despliegue local en entornos con recursos minimos antes de migrar a modelos mayores.
- Generacion de texto creativo de nicho: respuestas con tono jugueton para foros, bots de comunidad o contenido de entretenimiento donde el estilo prima sobre la precision factual.
- Evaluacion de deriva estilistica: util para estudiar como un ajuste LoRA ligero modifica el registro de un modelo base sin reentrenarlo por completo.
- Baseline de comparacion en investigacion sobre estilo: referencia para medir cuanto cambia el comportamiento de Qwen2.5-0.5B tras un ajuste de estilo y una cuantizacion Q4_K_M.
- Asistente de bajo consumo en dispositivos embebidos o Raspberry Pi: al caber en menos de 0,5 GB, puede desplegarse en hardware sin GPU dedicada para tareas conversacionales triviales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-1 GB con Q4_K_M (397 MB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; tambien funciona en CPU sin GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: Ollama (segun la model card), llama.cpp (llama-cli), Hugging Face Transformers cargando el fichero GGUF, y potencialmente vLLM o TGI si se dispone de pesos safetensors compatibles (no confirmado).
- Latencia y throughput estimados: no disponibles; por el tamano, se espera inferencia en tiempo real en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QwQen-0.5b-UwU | 494 M | 32768 | Apache 2.0 | GGUF Q4_K_M | Ajuste LoRA de estilo uwu |
| Qwen2.5-0.5B-Instruct | 494 M | 32768 | Apache 2.0 | safetensors, GGUF | Modelo base oficial, sin ajuste de estilo |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32768 | Apache 2.0 | safetensors, GGUF | Misma familia, mayor capacidad y coste |
| SmolLM2-360M-Instruct | 360 M | 8192 | Apache 2.0 | safetensors, GGUF | Alternativa compacta de Hugging Face |

No hay datos de rendimiento comparativo publicados para QwQen-0.5b-UwU; la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Riesgo elevado de alucinacion: con 0,5B de parametros, la base Qwen2.5-0.5B-Instruct ya es propensa a errores factuales, y el ajuste de estilo no corrige esa limitacion.
- Sesgos: no documentados, pero hereda los sesgos del dataset de ajuste uwu y de la base Qwen2.5; el dataset no se describe.
- Limitacion de idioma: el ajuste se documenta en ingles; el comportamiento en castellano no esta verificado y probablemente degrade el estilo y la coherencia.
- El estilo uwu puede interferir con tareas tecnicas: el system prompt predefinido fuerza un registro que puede ser inadecuado para uso profesional.
- Contexto: aunque la model card declara 32768 tokens, el ejemplo de llama.cpp usa `-c 4096`; el rendimiento real con contexto largo en un modelo de 0,5B es limitado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia de la base Qwen2.5 y del dataset de ajuste (no documentado).
- Sin benchmarks ni evaluaciones: no hay evidencia publicada de calidad, por lo que no se recomienda para produccion sin evaluacion propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Fecha de creacion en metadatos (2026-11-08) posterior a la redaccion habitual de fichas; verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Verrucktekatze333/QwQen-0.5b-UwU
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Paper de LoRA: https://arxiv.org/abs/2106.09685
