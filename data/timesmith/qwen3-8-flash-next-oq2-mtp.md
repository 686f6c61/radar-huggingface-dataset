# timesmith/Qwen3.8-Flash-Next-oQ2-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2-mtp es una cuantizacion mixta de precision del modelo Qwen3.8-Flash-Next, un modelo multimodal de arquitectura MoE (mezcla de expertos) desarrollado por el equipo Qwen de Alibaba. Esta version concreta la ha producido el usuario timesmith mediante la herramienta oQ (oMLX v0.7.3), aplicando una cuantizacion de tipo affine por grupos que combina precisiones de 2 a 8 bits segun la sensibilidad de cada tensor, con un promedio efectivo de 2,790 bits por peso (excluyendo la tabla de embeddings N-gram) o 2,850 bits por peso para el checkpoint completo.

El modelo original es relevante porque sirve como avance temprano de la arquitectura que Qwen empleara en su serie Qwen4, y consolida el diseno hibrido Gated DeltaNet + Gated Attention que el equipo viene usando desde Qwen3.5. Con 180.000 millones de parametros totales y una cabeza MTP (multi-token prediction) de 2.607 millones, el modelo incluye componentes de vision (0.449B) y una tabla de embeddings N-gram de 51.200 millones de parametros.

Esta version cuantizada reduce el peso en disco a 64,1 GB, lo que permite ejecutar un modelo de 180B en hardware de Apple Silicon mediante MLX, algo inviable con los pesos en BF16. Es una ficha pensada para desarrolladores que quieran evaluar el modelo en entornos locales con memoria unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida Gated DeltaNet + Gated Attention, multimodal (vision), con cabeza MTP |
| Parametros totales | 180.000.000.000 (180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 2/3/4/5/6/8 bits por grupos de 32, 64 y 128; BF16 para un 0,287% de los pesos; promedio efectivo 2,850 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea un diseno hibrido que combina Gated DeltaNet (una variante de atencion lineal con estado recurrente) y Gated Attention clasica, siguiendo la estela introducida por Qwen3-Next y reutilizada en las series Qwen3.5 a Qwen3.8. Es un modelo MoE multimodal: incorpora un modulo de vision de 0,449B de parametros y una cabeza MTP de 2,607B orientada a decodificacion especulativa o prediccion multi-token. La tabla de embeddings N-gram de 51,2B de parametros representa el 28,4% de los pesos logicos del modelo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original a partir de la informacion proporcionada. La cuantizacion oQ aplicada por timesmith asigna 2 bits a la mayoria de los pesos (120,8B, el 67,1%), 8 bits a 3,57B, 4 bits a 2,54B y deja en BF16 solo 0,516B. La tabla N-gram se cuantiza a 2 bits con grupo 32 (3,00 bits/peso efectivos).

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un LLM de gran escala con arquitectura MoE.
- Procesamiento multimodal: incluye un modulo de vision de 0,449B de parametros, por lo que se espera soporte de entrada de imagenes (no confirmado en detalle en la informacion disponible).
- Prediccion multi-token (MTP): la cabeza dedicada de 2,607B sugiere capacidad de decodificacion especulativa o generacion acelerada de varios tokens por paso.
- Capacidades de agente y tool calling: no confirmadas explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no confirmado en la informacion disponible.

## Casos de uso

- Inferencia local en Apple Silicon: gracias a los 64,1 GB del checkpoint cuantizado, el modelo puede cargarse en equipos con memoria unificada de 64 GB o superior (Mac Studio M2/M3 Ultra, por ejemplo), algo imposible con los pesos originales en BF16.
- Experimentacion con arquitecturas hibridas: util para investigadores que quieran estudiar el comportamiento de Gated DeltaNet + Gated Attention en un modelo de 180B sin necesidad de un cluster de GPUs.
- Evaluacion de cuantizacion extrema: sirve como banco de pruebas para medir la perdida de calidad de una cuantizacion promedio de 2,85 bits/peso frente al modelo original.
- Prototipado de asistentes multimodales: el modulo de vision permite probar flujos de imagen + texto en local antes de pasar a produccion con el modelo completo.
- Investigacion sobre decodificacion especulativa: la cabeza MTP integrada permite experimentar con tecnicas de aceleracion de inferencia.
- Despliegue en entornos con restricciones de memoria: para casos donde el presupuesto de VRAM o memoria unificada es limitado y se prioriza poder ejecutar el modelo frente a la maxima calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 64 GB para cargar el checkpoint completo (59,717 GiB de pesos en storage, 64,1 GB de repo).
- GPU recomendadas: no aplica directamente, ya que el formato es MLX (Apple Silicon). En GPUs NVIDIA no es cargable sin conversion previa.
- Cabe en consumer GPU: no en GPUs de consumo convencionales (RTX 4090 con 24 GB no es suficiente). Si cabe en Apple Silicon con memoria unificada de 64 GB o mas.
- Opciones de despliegue: MLX (libreria nativa del formato). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ2-mtp (este) | 180B | no disponible | no disponible | safetensors MLX, 2,85 bits/peso | Hugging Face (timesmith) |
| Qwen3.8-Flash-Next (original) | 180B | no disponible | no disponible | safetensors BF16 | Hugging Face (Qwen) |
| Qwen3-Next | no disponible | no disponible | no disponible | no disponible | Hugging Face (Qwen) |

La comparativa con alternativas de otro autor no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion agresiva: con un promedio de 2,85 bits/peso, es esperable una degradacion de calidad frente al modelo original, especialmente en tareas de razonamiento complejo y codigo. No se han publicado evaluaciones que cuantifiquen esa perdida.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Hay que consultar la licencia del modelo original Qwen3.8-Flash-Next antes de cualquier uso en produccion.
- Compatibilidad limitada: el formato es MLX, por lo que solo se ejecuta en Apple Silicon. No es portable a CUDA sin conversion.
- Riesgo de alucinacion: inherente a los LLM; no hay datos especificos sobre la tasa en esta version cuantizada.
- Idiomas: no se especifica que idiomas soporta; no se puede garantizar un rendimiento adecuado en castellano.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Sin datos de benchmarks ni de contexto: no se puede verificar el rendimiento real ni la ventana de contexto util.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/timesmith/Qwen3.8-Flash-Next-oQ2-mtp
- Modelo original en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo original: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
