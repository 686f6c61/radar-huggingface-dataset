# SynastriaNetworks/Uirapuru-U1.1

## Resumen

Uirapuru-U1.1 es un modelo de lenguaje de gran tamano desarrollado por SynastriaNetworks, que parte del modelo base Qwen/Qwen3.5-9B-Base y lo especializa mediante entrenamiento supervisado posterior (post-training). En lugar de entrenar desde cero, el equipo ha optado por ajustar un modelo ya potente para adaptarlo a tareas concretas, aunque no se especifican cuales. El modelo se publica bajo licencia Apache 2.0 y esta disponible en formato safetensors y GGUF, lo que facilita su despliegue en multiples entornos.

La arquitectura subyacente corresponde a la de Qwen3.5-9B, un transformer hibrido con Gated Delta Networks y atencion gated, con un contexto nativo de 262.144 tokens extensible hasta aproximadamente 1.010.000. Con 9.653.104.368 parametros totales (unos 9,65B), el modelo se posiciona en la gama de 9B, ofreciendo un equilibrio entre capacidad y requisitos de hardware. Su pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales, aunque no se detallan en la documentacion disponible.

La relevancia de Uirapuru-U1.1 radica en ser un ejemplo de especializacion de un modelo base de ultima generacion mediante post-training, un enfoque cada vez mas comun para adaptar modelos generalistas a dominios especificos sin incurrir en los costes de un entrenamiento completo. Sin embargo, la informacion publica sobre el proceso de ajuste y las capacidades resultantes es limitada, por lo que esta ficha se basa principalmente en las caracteristicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet y atencion gated (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativo, extensible a 1.010.000 |
| Tipos de cuantizacion | no disponible (existe version GGUF, pero sin detalle de tipos) |
| Idiomas soportados | no disponible (el modelo base declara 201 idiomas, pero no se confirma para Uirapuru) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura hibrida que combina Gated Delta Networks (una variante de atencion lineal) con atencion gated clasica, organizada en un patron de capas: 8 bloques de 3 capas de Gated DeltaNet seguidas de una capa de Gated Attention, cada una con su correspondiente FFN. Esta configuracion busca un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias largas. El contexto nativo es de 262.144 tokens, ampliable hasta 1.010.000 mediante tecnicas de extension.

Uirapuru-U1.1 se construye mediante post-training supervisado sobre Qwen3.5-9B-Base, segun la descripcion del autor. No se proporcionan detalles sobre el dataset utilizado, el numero de pasos de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. El pipeline declarado es image-text-to-text, lo que sugiere que el modelo puede procesar entradas visuales y textuales, aunque no se especifica como se integra el encoder de vision en el post-training.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, que destaca en tareas de conocimiento, STEM y razonamiento.
- Codigo y agentes: el modelo base muestra buen rendimiento en tareas de programacion y uso de herramientas, segun los benchmarks publicados.
- Multimodalidad: el pipeline image-text-to-text indica soporte para entradas visuales, aunque no se detalla la implementacion.
- Multilingue: el modelo base declara soporte para 201 idiomas y dialectos, pero no se confirma para Uirapuru.
- Contexto largo: con 262K tokens nativos, puede manejar documentos extensos y conversaciones multi-turno.
- No se dispone de informacion sobre capacidades especificas anadidas por el post-training.

## Casos de uso

- Asistencia en investigacion academica: el modelo puede resumir articulos cientificos extensos gracias a su contexto de 262K tokens, facilitando la revision de literatura.
- Generacion de codigo en entornos de desarrollo: al heredar las capacidades de Qwen3.5-9B, puede asistir en la escritura y depuracion de codigo, integrarse en IDEs o pipelines de CI/CD.
- Analisis de documentos legales o financieros: su ventana de contexto amplia permite procesar contratos o informes completos en una sola pasada.
- Chatbots de atencion al cliente: con soporte para conversaciones multi-turno y contexto largo, puede mantener dialogos coherentes con historial extenso.
- Procesamiento de imagenes con texto: dado su pipeline image-text-to-text, podria utilizarse para tareas como captioning o respuesta a preguntas visuales, aunque no hay ejemplos concretos.
- Traduccion y adaptacion multilingue: si hereda el soporte de 201 idiomas del base, podria emplearse en servicios de traduccion automatica, aunque no esta confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para Uirapuru-U1.1. Los datos que se muestran a continuacion corresponden al modelo base Qwen3.5-9B, extraidos de su model card, y sirven como referencia orientativa de las capacidades subyacentes.

| Benchmark | Qwen3.5-9B |
|---|---|
| MMLU-Pro | 82.5 |
| MMLU-Redux | 91.4 (dato parcial de la tabla) |

Nota: la tabla original incluye comparaciones con otros modelos (GPT-OSS-120B, GPT-OSS-20B, Qwen3-Next-80B-A3B-Thinking, Qwen3-30BA3B-Thinking-2507, Qwen3.5-4B), pero solo se ha podido extraer parcialmente. Se recomienda consultar la model card de Qwen3.5-9B para el detalle completo.

## Requisitos de hardware

- VRAM estimada: con 9,65B parametros, en FP16 se requieren aproximadamente 19,3 GB (coincide con el tamano del repo). En cuantizacion de 8 bits, unos 10 GB; en 4 bits, unos 5 GB.
- GPU recomendadas: para FP16, una GPU con 24 GB (RTX 3090/4090, A5000) o superior. Para cuantizacion 4-bit, una GPU de 8 GB (RTX 3060, etc.) podria ser suficiente.
- Compatibilidad con GPU de consumo: si, con cuantizacion adecuada, cabe en GPUs de gama media-alta.
- Opciones de despliegue: al estar en formato safetensors, es compatible con transformers, vLLM, SGLang y KTransformers. La version GGUF permite usarlo con llama.cpp, Ollama y otros motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Uirapuru-U1.1 | 9,65B | 262K (ext. 1M) | Apache 2.0 | Post-training de Qwen3.5-9B |
| Qwen3-8B | 8B | 32K (ext. 128K) | Apache 2.0 | Modelo denso, sin vision |
| Llama-3.1-8B | 8B | 128K | Llama 3.1 Community | Modelo denso, sin vision |
| Qwen3.5-9B (base) | 9,65B | 262K (ext. 1M) | Apache 2.0 | Modelo base, con vision |

Uirapuru-U1.1 se diferencia de Qwen3-8B y Llama-3.1-8B por su contexto mucho mas largo y su arquitectura hibrida con Gated DeltaNet, ademas de su capacidad multimodal declarada. Frente a su modelo base, la diferencia radica en el post-training, aunque no se conocen los detalles del ajuste.

## Limitaciones y advertencias

- No se dispone de informacion sobre el proceso de post-training (datasets, tecnicas, duracion), lo que dificulta evaluar posibles sesgos introducidos.
- No hay benchmarks especificos de Uirapuru-U1.1; los datos de rendimiento provienen del modelo base y pueden no reflejar el comportamiento del fine-tune.
- La capacidad multimodal (image-text-to-text) esta declarada pero no se documenta como se implementa ni su rendimiento real.
- El soporte de idiomas no esta confirmado para esta version; se asume que hereda el del base, pero no hay garantia.
- Al ser un modelo relativamente nuevo (creado en agosto de 2026) y con cero descargas y likes, no hay experiencia de uso comunitaria que valide su comportamiento en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar que el post-training no haya introducido restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SynastriaNetworks/Uirapuru-U1.1
- Version GGUF: https://huggingface.co/SynastriaNetworks/Uirapuru-U1-GGUF
- Pagina en FriendliAI: https://friendli.ai/models/SynastriaNetworks/Uirapuru-U1-9B
- Model card del base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B (referencia)
