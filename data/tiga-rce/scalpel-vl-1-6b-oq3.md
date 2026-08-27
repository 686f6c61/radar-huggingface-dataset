# TiGa-RCE/Scalpel-VL-1.6B-oQ3

## Resumen
Scalpel-VL-1.6B-oQ3 es una cuantizacion de 3 bits del modelo vision-lenguaje Qwen3-VL (arquitectura qwen3_vl) realizada por TiGa-RCE, un perfil de Hugging Face especializado en cuantizaciones MLX para Apple Silicon. El modelo se distribuye en formato MLX safetensors y utiliza la tecnica oQ (oMLX) de cuantizacion de precision mixta, con un grupo de 64 y 3 bits de peso. El repositorio pesa 1,4 GB y los tensores registran 575.305.472 parametros, aunque la denominacion "1.6B" sugiere que el modelo base original tiene esa cantidad de parametros.

La relevancia de este modelo reside en su optimizacion para ejecucion local en hardware Apple Silicon mediante MLX, una libreria de aprendizaje automatico de Apple. Es una cuantizacion agresiva (3 bits) que prioriza el ahorro de memoria y la velocidad de inferencia, a costa de una posible degradacion de la calidad frente a versiones de mayor precision. La fecha de creacion (2026-08-27) y la actualizacion posterior (2026-08-26) indican que es una version reciente que reemplaza a una anterior, segun la nota de la model card.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (Qwen3-VL) |
| Parametros totales | 575.305.472 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ de 3 bits, group size 64, precision mixta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento
Este modelo no es un entrenamiento original, sino una cuantizacion del modelo Qwen3-VL. La arquitectura subyacente es la de Qwen3-VL, un modelo multimodal que combina un transformer de lenguaje con un encoder de vision, disenado para tareas que integran imagen y texto. La cuantizacion se realiza con la libreria oMLX (version 0.6.3rc3) y la tecnica oQ, que aplica precision mixta para distribuir los bits de forma adaptativa segun la importancia de cada capa o tensor, en lugar de una cuantizacion uniforme de 3 bits en todo el modelo.

Los detalles sobre los datos de entrenamiento, el proceso de entrenamiento original o si se aplicaron tecnicas como RLHF o DPO no estan disponibles. La informacion proporcionada solo cubre el proceso de cuantizacion, no el entrenamiento del modelo base. Se desconoce el numero de tokens de entrenamiento, la composicion del dataset y cualquier innovacion adicional del modelo original.

## Capacidades
- Generacion de texto y razonamiento: como cuantizacion de Qwen3-VL, se espera que herede las capacidades de generacion de texto y razonamiento del modelo base, aunque la cuantizacion de 3 bits puede degradar la calidad.
- Procesamiento de vision: el modelo es una variante VL, lo que indica soporte para entrada de imagenes combinadas con texto, aunque no se especifican las tareas concretas (captioning, VQA, etc.).
- Capacidades multilingues: no se ha indicado informacion sobre los idiomas soportados.
- Tool calling y funciones: no se ha informado de soporte para function calling.
- Capacidades de agente y razonamiento multi-paso: no se ha informado.
- Capacidades especiales: no se ha informado de modos de thinking, vision o audio especificos.

## Casos de uso

- Inferencia de vision-lenguaje en Apple Silicon: el modelo esta optimizado para MLX, por lo que se puede desplegar en Macs con chip M1/M2/M3/M4. Se puede usar para tareas de captioning de imagenes o VQA en aplicaciones de escritorio.
- Prototipado de aplicaciones de IA en dispositivos locales: gracias a su tamano reducido (1,4 GB) y cuantizacion de 3 bits, cabe en la memoria unificada de la mayoria de Macs, permitiendo prototipar aplicaciones de vision por computador sin depender de la nube.
- Investigacion de tecnicas de cuantizacion: al ser una cuantizacion oQ de precision mixta, puede servir como caso de estudio para evaluar el impacto de la cuantizacion de 3 bits en modelos VL.
- Evaluacion de calidad de modelos cuantizados: permite comparar la degradacion de rendimiento frente a versiones de 4 u 8 bits del mismo modelo base, para decidir el mejor equilibrio entre tamano y calidad.
- Despliegue en entornos con recursos limitados: en escenarios donde la VRAM o la RAM son limitadas, este modelo ofrece una opcion ligera para tareas de vision-lenguaje en tiempo real.
- Uso educativo: para aprender a trabajar con MLX y cuantizacion de modelos en el ecosistema de Apple.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, pero con 575M parametros en 3 bits y 1,4 GB de repo, se estima que ocupa alrededor de 1 GB de memoria en inferencia.
- GPU recomendadas: se recomienda Apple Silicon (M1 o superior) por el uso de MLX; no se han especificado GPUs concretas.
- Si cabe en consumer GPU: si, en cualquier Mac con Apple Silicon y al menos 8 GB de RAM unificada.
- Opciones de despliegue: MLX (libreria nativa), posiblemente via herramientas como mlx-lm o custom scripts; no se menciona vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable con otros modelos. La unica referencia disponible es el propio modelo base Qwen3-VL, pero no se conocen datos de rendimiento ni especificaciones de las versiones cuantizadas comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha informado de sesgos especificos, pero al ser una cuantizacion de un modelo base, hereda los sesgos del modelo original.
- Riesgo de alucinacion: la cuantizacion de 3 bits puede aumentar el riesgo de alucinaciones o errores de generacion por la perdida de precision en los pesos.
- Limitaciones de contexto e idioma: no se ha especificado la longitud de contexto ni los idiomas soportados; se recomienda verificar antes de su uso en produccion.
- Restricciones de licencia: la licencia no esta disponible, lo que impide conocer si se permite el uso comercial.
- Caveats para produccion: la cuantizacion de 3 bits es agresiva y puede degradar la calidad del modelo de forma notable; ademas, el modelo fue actualizado recientemente (2026-08-26), por lo que es necesario descargar la ultima version para evitar pesos obsoletos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TiGa-RCE/Scalpel-VL-1.6B-oQ3
- Perfil del autor: https://huggingface.co/TiGa-RCE
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Repositorio de Scalpel (proyecto relacionado con pruning, no confirmado): https://github.com/freeai-org/Scalpel
- Coleccion de cuantizaciones de embeddings de TiGa-RCE: https://huggingface.co/collections/TiGa-RCE/mlx-embedding-quantization-matrix-q-oq-oqe-at-4-6-8-bit
