# timesmith/Qwen3.8-27B-oQ4e-mtp

## Resumen

Qwen3.8-27B-oQ4e-mtp es una cuantizacion mixta de un modelo de la familia Qwen 3.5 (etiqueta `qwen3_5` en Hugging Face), publicada por el usuario timesmith. El checkpoint original no lo desarrolla timesmith: se trata de una version cuantizada del modelo base Qwen3.8-27B, del que no se dispone de model card ni de enlaces al repositorio de origen en la informacion proporcionada. La cuantizacion se ha realizado con oQ (oMLX v0.7.3), una herramienta de cuantizacion de precision mixta orientada al ecosistema MLX de Apple.

El resultado es un checkpoint de 27.781.427.952 parametros logicos almacenado en 15,806 GiB, con un promedio efectivo de 4,887 bits por peso. La mayor parte de los pesos (80,784%) se guarda en 4 bits afines con grupo de 64, un 17,359% en 5 bits y un 1,857% en BF16. Incluye componentes de vision (0,461B) y una cabeza MTP (multi-token prediction, 0,425B), lo que sugiere un modelo multimodal con decodificacion especulativa integrada.

Su relevancia es practica: permite ejecutar un modelo de ~28B parametros con capacidades multimodales en hardware Apple Silicon con un consumo de almacenamiento de ~17 GB, un tamano manejable para equipos de sobremesa y portatiles de gama alta. No obstante, al ser un repositorio con cero descargas y cero likes, creado y actualizado el mismo dia, carece de validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (familia Qwen 3.5, tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.781.427.952 (27,781B logicos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixta oQ: affine 4-bit grupo 64 (22,443B), affine 5-bit grupo 64 (4,823B), BF16 (0,516B); promedio 4,887 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 17,0 GB (15,806 GiB de pesos) |
| Componentes | lenguaje 26,896B (14,655 GiB), vision 0,461B (0,858 GiB), cabeza MTP 0,425B (0,293 GiB) |

## Arquitectura y entrenamiento

La informacion disponible solo describe el proceso de cuantizacion, no la arquitectura interna ni el entrenamiento del modelo base. El tag `qwen3_5` indica que deriva de la familia Qwen 3.5, y la presencia de un modulo de vision (0,461B parametros) confirma que el modelo base es multimodal. La cabeza MTP de 0,425B parametros corresponde a multi-token prediction, una tecnica de decodificacion especulativa que predice varios tokens por paso para acelerar la generacion.

La cuantizacion se realizo con oQ (oMLX v0.7.3), que aplica precision mixta: asigna 4 bits a la mayoria de las capas, 5 bits a un subconjunto seleccionado (presumiblemente capas sensibles como las de atencion o las primeras/ultimas capas) y mantiene en BF16 un 1,857% de los pesos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generacion de texto y razonamiento: capacidades inferidas de la familia Qwen 3.5; no verificadas en este checkpoint.
- Procesamiento de vision: incluye un modulo de vision de 0,461B parametros, por lo que el modelo base es multimodal (imagen + texto).
- Prediccion multi-token (MTP): cabeza dedicada de 0,425B parametros para decodificacion especulativa, orientada a reducir latencia.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta en formato MLX y ocupa ~17 GB, por lo que se puede cargar en un Mac con 24-32 GB de memoria unificada y ejecutar generacion de texto sin GPU dedicada.
- Prototipado multimodal en local: con el modulo de vision incluido, permite experimentar con tareas de imagen + texto (descripcion de imagenes, VQA) sin depender de APIs externas.
- Evaluacion de cuantizacion: util para investigadores que quieran medir la degradacion de calidad de una cuantizacion mixta a 4,887 bits/peso frente al modelo original en BF16.
- Generacion asistida de baja latencia: la cabeza MTP permite probar decodificacion especulativa en entornos MLX y comparar throughput frente a decodificacion autoregresiva estandar.
- Desarrollo de asistentes conversacionales offline: un modelo de ~28B con cuantizacion de 4 bits cabe en un portatil de gama alta y permite conversaciones multi-turno sin conexion (siempre que el contexto del modelo base sea suficiente; dato no disponible).
- Fine-tuning ligero o LoRA sobre la version cuantizada: el formato safetensors MLX permite adaptar el modelo a dominios concretos en hardware de consumo, aunque la cuantizacion limita la precision del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~16 GiB solo para pesos; con overhead de runtime (KV cache, buffers) se recomienda un minimo de 20-24 GB. Para contextos largos, 32 GB o mas.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips Apple Silicon (M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es directamente compatible con CUDA sin conversion.
- GPU consumer: cabe en Mac con 24 GB o mas de memoria unificada. En GPUs NVIDIA consumer (RTX 4090 24 GB) requeriria conversion de formato (por ejemplo, a GGUF) y no se garantiza la fidelidad de la cuantizacion mixta.
- Opciones de despliegue: MLX (mlx-lm) es la via nativa. Para otros entornos habria que reconvertir los pesos; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ4e-mtp (este) | 27,781B | no disponible | 4,887 bits/peso (mixta) | no disponible | safetensors MLX |
| Modelo base Qwen3.8-27B | ~27,8B (inferido) | no disponible | BF16 | no disponible | no disponible |
| Qwen2.5-VL-32B | ~32B | 128k (segun documentacion publica de Qwen) | BF16 / GPTQ / AWQ | Apache 2.0 (segun Qwen) | safetensors |
| Gemma 3 27B | ~27B | 128k (segun documentacion publica de Google) | BF16 / GGUF | Gemma Terms of Use | safetensors / GGUF |

Nota: los datos de los modelos comparables provienen de conocimiento general de la familia y no de la informacion proporcionada en esta busqueda; verifiquense antes de usarlos en produccion. No se dispone de datos de rendimiento del checkpoint cuantizado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Repositorio sin validacion: cero descargas y cero likes, creado y actualizado el mismo dia (12 de noviembre de 2026). No hay evidencia de que el checkpoint funcione correctamente.
- Licencia no especificada: no se puede asumir uso comercial. La licencia del modelo base Qwen 3.5 tampoco se detalla en la informacion disponible, por lo que hay que consultarla en el repositorio original.
- Model card minima: solo documenta la cuantizacion, sin informacion sobre contexto, idiomas, alineamiento ni limitaciones del modelo base.
- Degradacion por cuantizacion: 4,887 bits/peso implica perdida de precision frente a BF16, especialmente en tareas de razonamiento matematico y codigo; no hay evaluacion publicada del impacto.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin datos de alineamiento no se puede estimar su magnitud.
- Dependencia de MLX: el checkpoint no es portable directamente a CUDA; usarlo en NVIDIA requiere conversion y puede alterar el esquema de cuantizacion mixta.
- Sin garantias de soporte: al ser un repositorio de un usuario individual, no hay mantenimiento ni actualizaciones previsibles.

## Enlaces

- Hugging Face: https://huggingface.co/timesmith/Qwen3.8-27B-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
