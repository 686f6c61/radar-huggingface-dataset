# wang-yang/Ornith-1.5-9B-MTPLX-4bit

## Resumen

Ornith-1.5-9B-MTPLX-4bit es una cuantización en 4 bits del modelo Ornith-1.5-9B, desarrollada por wang-yang para ejecutarse en Apple Silicon mediante el framework MLX y el formato MTPLX. El modelo base, creado por ornith-ai, es un transformer denso de 9.000 millones de parámetros con una ventana de contexto de 256.000 tokens, que incorpora un mecanismo de auto-mejora (self-scaffolding) y una torre de visión. Esta versión cuantizada incluye además la cabeza MTP (multi-token prediction) como sidecar, lo que habilita decodificación especulativa, y mantiene la torre de visión en BF16. Su relevancia radica en permitir ejecutar un modelo de 9B con capacidades multimodales y de razonamiento en hardware Apple con recursos limitados, sin renunciar a la licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5`, probablemente basada en Qwen3.5) |
| Parametros totales | 9B (modelo base) |
| Parametros activos | 9B (modelo denso, todos activos) |
| Longitud de contexto | 256K (segun documentacion de Ornith-1, no confirmado para Ornith-1.5) |
| Tipos de cuantizacion | 4-bit affine, group size 64 (MLX/MTPLX) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), incluye `mtp.safetensors` y `model-vision.safetensors` |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso que, segun el blog oficial de Ornith, extiende el marco de auto-andamiaje (self-scaffolding) de Ornith-1.0 hacia un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes especificos para cada tarea y produce rollouts de soluciones para aprendizaje por refuerzo. Esta arquitectura permite que el modelo mejore continuamente a partir de sus propias experiencias. La cuantizacion MTPLX aplica una cuantizacion afin de 4 bits con grupo de tamaño 64 tanto al modelo principal como a la cabeza MTP, mientras que la torre de vision se mantiene en BF16. La inclusion de la cabeza MTP como sidecar permite decodificacion especulativa, acelerando la inferencia en hardware Apple.

## Capacidades

- Generacion de texto y conversacion en ingles.
- Razonamiento y resolucion de problemas, gracias al entrenamiento con auto-mejora.
- Capacidades multimodales limitadas: incluye torre de vision, aunque no se especifican tareas concretas de vision-lenguaje.
- Decodificacion especulativa mediante la cabeza MTP, que reduce la latencia en la generacion.
- Soporte de tool calling y agentes: no especificado en la informacion disponible, pero probablemente presente dado el enfoque de auto-andamiaje.
- Auto-mejora: el modelo puede proponer tareas y generar andamiajes, lo que lo hace util para entornos de aprendizaje continuo.

## Casos de uso

- Inferencia local en Mac: ideal para desarrolladores que necesitan un LLM de 9B con contexto largo en portatiles Apple, usando MTPLX CLI.
- Prototipado rapido de aplicaciones de chat: la cuantizacion 4-bit reduce el uso de memoria, permitiendo ejecutar el modelo en Mac con 8 GB de RAM unificada.
- Desarrollo de agentes con decodificacion especulativa: la cabeza MTP acelera la generacion, util para agentes que requieren multiples pasos de razonamiento.
- Tareas de vision-lenguaje en entornos Apple: la torre de vision en BF16 permite experimentar con modelos multimodales sin GPU dedicada.
- Fine-tuning adaptativo: MTPLX ofrece `mtplx tune --retune`, permitiendo ajustar el modelo cuantizado para dominios especificos.
- Educacion e investigacion: al ser MIT y ejecutable en hardware de consumo, facilita la experimentacion con tecnicas de auto-mejora y decodificacion especulativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivos Apple Silicon (M1, M2, M3 o posteriores) con al menos 8 GB de RAM unificada para la cuantizacion 4-bit.
- El repositorio ocupa 6.1 GB, por lo que se recomienda un minimo de 8 GB de almacenamiento libre.
- La inferencia se realiza mediante MTPLX CLI o la libreria MLX; no requiere GPU dedicada.
- La decodificacion especulativa con MTP puede reducir la latencia, aunque el rendimiento exacto depende del modelo de chip y la memoria.
- Para fine-tuning con `mtplx tune`, se recomienda al menos 16 GB de RAM unificada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa directa con otras cuantizaciones 4-bit de modelos de 9B en Apple Silicon. Como referencia, el modelo base Ornith-1.5-9B compite con otros LLMs densos de 9B como Llama 3.1 8B o Mistral 7B, pero no se han publicado benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- La cuantizacion 4-bit puede degradar ligeramente la calidad de generacion en comparacion con el modelo en precision completa.
- Requiere hardware Apple Silicon; no es compatible con GPUs NVIDIA o AMD.
- No se han publicado benchmarks oficiales, por lo que el rendimiento real en tareas estandar no esta verificado.
- La etiqueta `qwen3_5` sugiere una base arquitectonica de Qwen3.5, pero no se confirma oficialmente.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales no documentadas en esta ficha.

## Enlaces

- [Modelo cuantizado en HuggingFace](https://huggingface.co/wang-yang/Ornith-1.5-9B-MTPLX-4bit)
- [Modelo base ornith-ai/Ornith-1.5-9B](https://huggingface.co/ornith-ai/Ornith-1.5-9B)
- [Blog de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Repositorio GitHub de Ornith-1](https://github.com/ornith-ai/Ornith-1)
- [MTPLX en GitHub](https://github.com/youssofal/MTPLX)
