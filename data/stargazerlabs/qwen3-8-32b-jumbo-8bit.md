# StargazerLabs/Qwen3.8-32B-Jumbo-8bit

## Resumen

Qwen3.8-32B-Jumbo-8bit es una cuantización de 8 bits del modelo Qwen3.8-32B-Jumbo, desarrollado por StargazerLabs mediante una técnica experimental de cirugía de modelos (model surgery) denominada "organ transplant". El proceso consiste en tomar un modelo base Qwen3-8B y trasplantar en él los tres órganos (presumiblemente bloques de capas) con mayor deriva de un modelo Qwen3.6-27B, dando lugar a una arquitectura de 76 capas y aproximadamente 31.900 millones de parámetros, según el autor. La versión cuantizada ocupa 34.4 GB en formato safetensors y está preparada para ejecutarse en MLX, la librería de Apple para aceleración en hardware propio.

La relevancia de este modelo reside en su enfoque novedoso de fusión de arquitecturas, que busca combinar las capacidades de un modelo pequeño con el conocimiento de uno mayor mediante la selección de componentes con alta divergencia. Aunque es una propuesta de investigación, la cuantización en 8 bits y el soporte para decodificación especulativa mediante un drafter MTP (Multi-Token Prediction) lo hacen utilizable en entornos de experimentación con hardware de Apple. No se han publicado resultados de benchmarks ni se detalla el proceso de entrenamiento posterior al trasplante, por lo que su rendimiento real en tareas estándar es desconocido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), 76 capas |
| Parametros totales | ~31,9 B (segun el autor); 9.311.737.552 en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado; probablemente hereda de Qwen3-8B) |
| Tipos de cuantizacion | 8-bit (MLX quantized) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

El modelo se construye mediante una tecnica de cirugia de modelos llamada "organ transplant". Segun la model card, se parte de un Qwen3-8B y se insertan los tres "organos" (bloques de capas) mas desviados de un Qwen3.6-27B, dando lugar a una arquitectura de 76 capas y un total de ~31.9 B de parametros. No se especifica que se realizara un entrenamiento posterior al trasplante; la cuantizacion a 8 bits se aplica con la herramienta mlx-lm, y el modelo resultante es compatible con el drafter MTP del Qwen3.8-27B para decodificacion especulativa. No hay informacion publica sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO. La discrepancia entre los parametros declarados (~31.9 B) y los contabilizados en los safetensors (9.311.737.552) sugiere que la cuantizacion puede no haber conservado la totalidad de los pesos o que la cifra declarada incluye pesos no cuantizados.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Compatible con decodificacion especulativa mediante un drafter MTP de Qwen3.8-27B, lo que puede acelerar la generacion en hardware Apple.
- Ejecucion en MLX, optimizado para chips Apple Silicon.
- No se mencionan capacidades de tool calling, vision, audio ni razonamiento multimodal.
- No se indica soporte de agentes ni multi-step reasoning mas alla de la generacion de texto estandar.

## Casos de uso

- Investigacion en cirugia de modelos: permite estudiar el impacto de fusionar capas de modelos de distinto tamano, comparando su comportamiento con el Qwen3-8B original y el Qwen3.6-27B donante.
- Experimentacion con decodificacion especulativa: al aceptar el drafter MTP, se puede medir la ganancia de velocidad en entornos MLX frente a la generacion autoregresiva convencional.
- Prototipado en Apple Silicon: al estar en formato MLX, se puede integrar en aplicaciones de macOS o iOS que requieran generacion de texto local en ingles, con un consumo de memoria moderado.
- Evaluacion de cuantizacion: comparar la degradacion de calidad entre las versiones bf16, 8-bit, 4-bit y 3-bit del mismo modelo para decidir el punto optimo de compresion en proyectos con limitaciones de VRAM.
- Generacion de contenido en ingles: uso como motor de chat o redaccion en entornos donde no se requiera un rendimiento validado y se priorice la experimentacion con arquitecturas no convencionales.
- Benchmark de model surgery: servir como caso de estudio para la comunidad de IA open source sobre tecnicas de "organ transplant" y sus efectos en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar que permitan evaluar el rendimiento del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 34.4 GB en 8-bit, por lo que se necesitan al menos 34 GB de memoria para cargar los pesos en MLX (memoria unificada en Apple Silicon).
- GPU recomendadas: no cabe en GPUs consumer de 24 GB como la RTX 4090 en esta cuantizacion. Se requieren GPUs profesionales con 40 GB o mas (A100, H100) o bien un Mac con 64 GB de RAM unificada para usar MLX de forma comoda.
- Opciones de despliegue: MLX (recomendado, formato nativo), aunque el modelo podria convertirse a GGUF para usar con llama.cpp u Ollama, pero no se ha verificado esa compatibilidad.
- Latencia y throughput: no disponibles. La decodificacion especulativa con el drafter MTP podria reducir la latencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos de este modelo frente a alternativas. Los candidatos naturales serian Qwen3-32B (modelo original de la serie) y Qwen3.6-27B (donante de organos), pero no se han publicado resultados de rendimiento de ninguno de ellos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- No se ha publicado ningun benchmark ni evaluacion de calidad, por lo que su rendimiento real en tareas de razonamiento, codigo o matematicas es desconocido.
- El modelo esta limitado al ingles; no se garantiza un comportamiento adecuado en otros idiomas.
- La tecnica de organ transplant es experimental y podria producir incoherencias internas o degradacion de la capacidad de generacion.
- No se especifica el proceso de alineacion; el modelo podria generar contenido sesgado, toxico o falso sin moderacion.
- El numero de parametros declarado por el autor no coincide con el contabilizado en los safetensors, lo que indica posibles perdidas o diferencias en la cuantizacion.
- Aunque la licencia Apache-2.0 permite uso comercial, al ser un modelo experimental se recomienda una validacion exhaustiva antes de integrarlo en produccion.

## Enlaces

- [Modelo en HuggingFace (8-bit)](https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-8bit)
- [Modelo base bf16](https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo)
- [Version 4-bit](https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-4bit)
- [Version 3-bit](https://huggingface.co/StargazerLabs/Qwen3.8-32B-Jumbo-3bit)
- [Coleccion Jumbo de StargazerLabs](https://huggingface.co/collections/StargazerLabs/jumbo)
- [Repositorio oficial de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
