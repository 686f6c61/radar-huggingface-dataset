# uthayamurthy/origin-task1-bart-large

## Resumen

El modelo `uthayamurthy/origin-task1-bart-large` es un checkpoint de ajuste fino completo (full-parameter fine-tuning) de `facebook/bart-large-cnn`, desarrollado por el autor uthayamurthy para la tarea 1 del desafío SciHigh-2026. Su funcion es generar resúmenes de investigación (research highlights) concisos a partir de resúmenes de articulos cientificos, un problema de sumarizacion cientifica especializada que requiere comprender terminologia tecnica y extraer los hallazgos clave.

El modelo se basa en la arquitectura BART (Bidirectional and Auto-Regressive Transformer), con 406 millones de parametros, y esta optimizado para generacion de texto a texto (text2text-generation). Se entrena sobre 10.000 ejemplos del dataset MixSub-SciHigh, con una ventana de contexto de entrada de 1024 tokens y salida de 320 tokens. Su relevancia radica en que aborda un caso de uso especifico en el ambito cientifico-academico, donde la generacion automatica de resumenes de investigacion puede acelerar la revision de literatura y la divulgacion cientifica.

El modelo esta disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y se distribuye en formato safetensors, compatible con el ecosistema Transformers de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART (Transformer seq2seq bidireccional) |
| Parametros totales | 406.340.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada, 320 de salida (maximos de entrenamiento) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16, compatible con cuantizacion posterior) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BART es un modelo transformer seq2seq con un encoder bidireccional y un decoder autoregresivo, introducido por Lewis et al. en 2019. El encoder procesa el texto completo de entrada con atencion bidireccional, lo que permite comprender el contexto global del documento, mientras que el decoder genera el resumen token a token de forma autoregresiva. Esta arquitectura es especialmente adecuada para tareas de sumarizacion abstractiva, ya que combina la comprension contextual del encoder con la generacion fluida del decoder.

El entrenamiento de este checkpoint se realizo mediante ajuste fino completo (full fine-tuning) sobre el modelo base `facebook/bart-large-cnn`, que ya estaba pre-entrenado para sumarizacion de noticias. Los datos de entrenamiento consisten en 10.000 ejemplos del dataset SciHigh Task 1 MixSub-SciHigh, con hiperparametros de 3 epocas, tasa de aprendizaje de 3e-5, batch size de 32, y longitudes maximas de 1024 tokens para entrada y 320 para salida. El entrenamiento se realizo en precision bfloat16 con atencion SDPA (Scaled Dot-Product Attention), lo que mejora la eficiencia computacional. No se menciona el uso de tecnicas de RLHF o DPO; el ajuste es puramente supervisado.

## Capacidades

- Generacion de resumenes cientificos: genera research highlights concisos a partir de resumenes de articulos academicos, capturando los puntos clave de la investigacion.
- Sumarizacion abstractiva: produce texto nuevo que reformula el contenido original, no solo extrae frases literales.
- Comprension de terminologia cientifica: al estar entrenado con datos cientificos, reconoce vocabulario tecnico y estructura de articulos de investigacion.
- Generacion de texto a texto: admite cualquier tarea de transformacion de texto, aunque esta optimizado para sumarizacion.
- Compatibilidad con Transformers: se integra con la libreria Transformers de HuggingFace, permitiendo uso con pipelines de sumarizacion y generacion condicional.
- Soporte de atencion SDPA: implementa atencion escalada por producto punto, que reduce el uso de memoria y acelera la inferencia en GPUs modernas.

## Casos de uso

- Revision de literatura cientifica: los investigadores pueden procesar lotes de resumenes de articulos para generar resumenes ejecutivos rapidos, facilitando la seleccion de papers relevantes para su trabajo.
- Asistente de escritura academica: integrado en herramientas de redaccion, puede generar secciones de "highlights" para articulos cientificos, ahorrando tiempo a los autores.
- Divulgacion cientifica: organizaciones de comunicacion cientifica pueden usar el modelo para transformar resumenes tecnicos en versiones mas accesibles para audiencias generales.
- Indexacion de contenido academico: repositorios y bibliotecas digitales pueden generar metadatos descriptivos para sus colecciones de articulos.
- Alertas de investigacion: servicios de alerta bibliografica pueden enviar resumenes breves de nuevas publicaciones a suscriptores, generados automaticamente con este modelo.
- Analisis de tendencias: equipos de inteligencia competitiva pueden resumir grandes volumenes de papers para identificar lineas de investigacion emergentes en un campo.

## Benchmarks y rendimiento

El autor proporciona resultados de validacion sobre 1.985 ejemplos del dataset SciHigh Task 1:

| Metrica | Resultado |
|---|---|
| ROUGE-1 | 0,3808 |
| ROUGE-2 | 0,1403 |
| ROUGE-L | 0,2503 |
| ROUGE-Lsum | 0,2505 |
| METEOR | 0,3114 |
| BERTScore F1 | 0,8721 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Los valores de ROUGE son moderados, lo que refleja la dificultad de la sumarizacion cientifica, donde la compresion de informacion densa es compleja. El BERTScore de 0,87 indica una alta similitud semantica con los resumenes de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: con 406 millones de parametros en bfloat16, el modelo ocupa aproximadamente 0,8 GB en memoria. Con overhead de activaciones y generacion, se recomienda al menos 4 GB de VRAM para inferencia con batch pequeno.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente. Modelos como RTX 3060, RTX 4060, T4, A10 o superiores funcionan adecuadamente. En CPU, la inferencia es posible pero lenta (varios segundos por resumen).
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores.
- Opciones de despliegue: compatible con vLLM, TGI (Text Generation Inference), HuggingFace Inference Endpoints, y puede ejecutarse con Transformers directamente. Para CPU, se puede usar con ONNX Runtime o convertir a GGUF para llama.cpp, aunque no se proporcionan conversiones oficiales.
- Latencia estimada: en una GPU moderna (A100 o RTX 4090), la generacion de un resumen de 128 tokens con beam search de 4 tarda aproximadamente 0,5-1 segundo. En GPUs de gama media, entre 1-3 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| uthayamurthy/origin-task1-bart-large | 406M | 1024 | Apache 2.0 | Sumarizacion cientifica (SciHigh) |
| facebook/bart-large-cnn | 406M | 1024 | Apache 2.0 | Sumarizacion de noticias |
| facebook/bart-large | 406M | 1024 | Apache 2.0 | Pre-entrenamiento general, sin ajuste para sumarizacion |

El modelo se diferencia de su base `bart-large-cnn` en que esta especificamente ajustado para resumenes cientificos, mientras que la base esta optimizada para noticias. Frente a `bart-large` (sin ajuste), este checkpoint ofrece un rendimiento muy superior en la tarea de sumarizacion cientifica, aunque pierde generalidad para otros dominios. No se dispone de comparaciones con modelos mas recientes como Pegasus o T5, que tambien se usan para sumarizacion.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo esta entrenado exclusivamente con datos cientificos en ingles, por lo que su rendimiento en otros dominios o idiomas sera significativamente inferior.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente con resumenes de articulos muy tecnicos o poco representados en el entrenamiento.
- Limitaciones de contexto: la ventana de 1024 tokens limita la entrada a resumenes de articulos, no a documentos completos. Para papers extensos, se requiere truncamiento o chunking.
- Dependencia del formato de entrada: el modelo espera resumenes de articulos cientificos como entrada; otros tipos de texto pueden producir resultados de baja calidad.
- Sin soporte multilingue: solo funciona en ingles, lo que limita su uso en entornos internacionales.
- Sin garantias de produccion: el modelo es un checkpoint de investigacion para un desafio (SciHigh-2026), no ha sido probado en entornos de produccion a gran escala.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni garantias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uthayamurthy/origin-task1-bart-large
- Modelo base (facebook/bart-large-cnn): https://huggingface.co/facebook/bart-large-cnn
- Modelo pre-entrenado (facebook/bart-large): https://huggingface.co/facebook/bart-large
- Pagina del modelo en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/bart-large
