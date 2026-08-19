# todaywork/qwen3_0_6b_genie_training

## Resumen

El repositorio `todaywork/qwen3_0_6b_genie_training` no contiene un modelo de lenguaje independiente, sino un archivo de datos de calibración y documentación técnica para el proceso de cuantización W4A16 del modelo Qwen3-0.6B, desarrollado por el usuario `todaywork`. El objetivo declarado es optimizar el modelo base de Alibaba para su ejecución en dispositivos Qualcomm mediante el flujo oficial de Qualcomm AI Hub Models (`qai-hub-models`), con un enfoque particular en tareas de control de vehículos (车控) y diálogo multi-turno.

El repositorio incluye dos fuentes de datos de calibración: un archivo `generated_calibration.txt` con 105 muestras en formato ChatML (que incluyen bloques `thinking` con razonamiento real) y el dataset WikiText-2 en formato parquet. Además, documenta una serie de experimentos controlados (versiones v3 a v12b) que investigan cómo diferentes configuraciones de calibración afectan a la calidad de la cuantización, con resultados que muestran que sustituir por completo el corpus de calibración oficial degrada significativamente el rendimiento.

La relevancia de este repositorio radica en que aborda un problema práctico común en el despliegue de LLMs en edge: cómo calibrar correctamente un modelo cuantizado a 4 bits sin perder capacidades de razonamiento estructurado. Los experimentos documentados proporcionan evidencia empírica sobre la sensibilidad del proceso de calibración a la composición del corpus, un dato valioso para ingenieros que trabajan con cuantización de modelos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-0.6B, arquitectura no detallada en el repositorio) |
| Parametros totales | 0,6 mil millones (estimado a partir del nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (según el proceso de tokenización descrito en la calibración) |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | 12 idiomas mencionados en los experimentos (no se enumeran explicitamente) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no incluye pesos del modelo, solo datos de calibracion) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura del modelo en si, sino que se centra en el proceso de calibracion para cuantizacion. El modelo base es Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parametros desarrollado por Alibaba. El proceso de calibracion sigue el flujo oficial de Qualcomm AI Hub Models, que consta de dos fases: una optimizacion de pesos mediante AdaScale (con 2048 iteraciones de gradiente sobre WikiText-2 train split) y una calibracion final de activaciones que intercala 1:1 el dataset generado con WikiText-2, procesando bloques de 4096 tokens.

La innovacion tecnica documentada es el uso de un dataset generado con formato ChatML que incluye bloques `thinking` con razonamiento real, combinado con WikiText-2. Los experimentos del autor (v3 a v12b) exploran variaciones en la composicion del corpus de calibracion y en los parametros de AdaScale, demostrando que la sustitucion completa del corpus oficial degrada gravemente la calidad de la cuantizacion (errores de JSON, alucinaciones de slots y salida en idiomas incorrectos). El autor concluye que el corpus de calibracion debe mantener un minimo de 250.000 tokens para que el proceso funcione correctamente.

## Capacidades

- Generacion de texto en formato ChatML con estructura de sistema, usuario y asistente, incluyendo bloques de razonamiento `thinking` no vacios.
- Razonamiento estructurado para tareas de control de vehiculos (车控), con salida en JSON que incluye campos de intencion y slots.
- Soporte multilingue: los experimentos mencionan cobertura de 12 idiomas en los datos de calibracion de control de vehiculos.
- Capacidad de seguir instrucciones de sistema genericas (`You are a helpful AI assistant.`) y de mantener conversaciones multi-turno.
- No se documentan capacidades de tool calling, vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Control de vehiculos por voz: el modelo se calibra para interpretar comandos como "close the window" o "close the sunroof" y devolver JSON estructurado con la intencion y los slots correspondientes, lo que permite integrarlo en asistentes de a bordo.
- Evaluacion de estrategias de calibracion para cuantizacion: los experimentos documentados sirven como referencia para ingenieros que necesitan calibrar LLMs cuantizados a 4 bits sin perder fidelidad en tareas de razonamiento estructurado.
- Benchmark de robustez de cuantizacion: el repositorio proporciona un conjunto de pruebas de humo (smoke tests) con 20 protocolos que evaluan la correccion de JSON y la exactitud de intenciones, util para validar cualquier pipeline de cuantizacion similar.
- Archivo de datos de calibracion reutilizable: el archivo `generated_calibration.txt` con 105 muestras en formato ChatML puede emplearse como corpus de calibracion para otros modelos Qwen o para comparar metodologias.
- Investigacion sobre el impacto del corpus en la cuantizacion: los resultados de los experimentos v3 vs v5 (mismos parametros, diferente corpus) ofrecen un caso de estudio controlado sobre como el contenido del dataset de calibracion afecta al rendimiento del modelo cuantizado.
- Despliegue en dispositivos edge de Qualcomm: el flujo completo esta orientado a compilar y ejecutar el modelo cuantizado en hardware Qualcomm mediante Qualcomm AI Hub Workbench, lo que lo hace util para desarrolladores de aplicaciones moviles o automotrices.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El repositorio documenta resultados de pruebas de humo internas sobre 20 protocolos de control de vehiculos, con metricas de exactitud de JSON y de intencion. Los resultados mas relevantes son:

| Version | Exactitud JSON (20 protocolos) | Exactitud intencion |
|---|---|---|
| v3 (calibracion oficial) | 0/20 | no reportado |
| v9 (AdaScale 100x2048) | 3/20 | 3/20 |
| v10 (oficial + 25 muestras vehiculo) | 3/18 | 5/18 |
| v12b (oficial + 25 muestras sin thinking) | 5/20 | 5/20 |

Estos datos son experimentales y no comparables con benchmarks publicos de modelos de lenguaje.

## Requisitos de hardware

- El repositorio no proporciona requisitos de hardware para inferencia, ya que no contiene pesos del modelo.
- El flujo de calibracion descrito se ejecuto en un servidor AutoDL (entorno cloud con GPU, no se especifica el modelo exacto).
- Para la cuantizacion W4A16 de un modelo de 0,6B, se estima que la VRAM necesaria para inferencia seria de aproximadamente 1-2 GB en precision FP16 y menos de 1 GB en W4A16, lo que permitiria ejecucion en GPUs consumer como RTX 3060 o inferiores.
- Las opciones de despliegue tipicas para Qwen3-0.6B cuantizado incluyen llama.cpp, Ollama, vLLM y Qualcomm AI Hub Workbench para dispositivos edge.
- No se dispone de datos de latencia o throughput especificos para este repositorio.

## Comparativa con modelos similares

Dado que el repositorio no contiene un modelo independiente sino datos de calibracion sobre Qwen3-0.6B, la comparativa se realiza sobre el modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Qwen3-0.6B (base) | 0,6B | 32K (segun documentacion oficial) | Apache 2.0 | LLM generalista |
| Qwen3-0.6B cuantizado W4A16 (este repo) | 0,6B | 4096 (segun proceso de calibracion) | no disponible | Control de vehiculos en edge |
| Phi-3-mini | 3,8B | 128K | MIT | LLM generalista |
| Gemma-2-2B | 2,6B | 8K | Gemma license | LLM generalista |

La comparativa directa no es posible porque este repositorio no publica pesos ni resultados de benchmarks estandar. El valor del repositorio reside en la documentacion del proceso de calibracion, no en el rendimiento del modelo resultante.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo, solo datos de calibracion y documentacion de experimentos; no es directamente desplegable.
- Los experimentos documentados muestran que la calibracion con corpus alternativos produce fallos graves: salida en idiomas incorrectos (cirilico, arabe), JSON malformado, alucinaciones de slots y errores de intencion.
- La licencia del contenido no esta especificada, lo que limita su reutilizacion legal en proyectos comerciales.
- No se proporcionan datos de sesgos, alucinacion o limitaciones de idioma del modelo base Qwen3-0.6B.
- Los resultados de las pruebas de humo son internos y no han sido validados externamente; no deben interpretarse como metricas de rendimiento generales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un proyecto personal o experimental sin validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/todaywork/qwen3_0_6b_genie_training
- Arbol de archivos: https://huggingface.co/todaywork/qwen3_0_6b_genie_training/tree/main
- README en espejo: https://d6108366.hf-mirror.com/todaywork/qwen3_0_6b_genie_training/blob/main/README.md?code=true
- Repositorio de Qualcomm AI Hub Models (modelo Qwen3-0.6B): https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_0_6b/README.md
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
