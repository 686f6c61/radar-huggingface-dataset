# sudarshan-plus/stock-gemma-merged-new

## Resumen

`stock-gemma-merged-new` es un ajuste fino (fine-tuning) del modelo instructivo `google/gemma-4-31B-it` de Google, desarrollado por el usuario Sudarshan. El objetivo del modelo es explorar la viabilidad de modelos de lenguaje de gran tamaño (LLM) de alto parámetro aplicados al análisis técnico de acciones del mercado bursátil indio (NSE). Está entrenado para recibir una instantánea técnica de un valor (precio de cierre, medias móviles, RSI, MACD, volatilidad y volumen) y devolver un desglose analítico junto con una recomendación a 5 días (COMPRAR, VENDER o MANTENER).

El modelo se presenta como un experimento de investigación más que como una herramienta lista para producción. El propio autor advierte que no ha sido probado de forma exhaustiva, que los resultados pueden variar y que no debe utilizarse para tomar decisiones financieras reales. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, pero con una renuncia explícita de responsabilidad por parte del desarrollador. La arquitectura base es un transformer de ~30,7 mil millones de parámetros, y el repositorio contiene pesos en formato GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 31B instruct) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (tipos exactos no especificados) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `google/gemma-4-31B-it`, un transformer denso de 31B parámetros con capacidad de instrucción. El proceso de entrenamiento se realizó con la librería `FastLanguageModule` (probablemente unSloth) en precisión fp16, sobre una GPU A100 de 40GB en un entorno de nube freemium compartido, lo que según el autor no garantiza eficiencia. Los datos de entrenamiento consisten en series temporales cronológicas de cinco valores del NSE: REL (Reliance), TCS (Tata Consultancy Services), INFY (Infosys), HDFCBANK (HDFC Bank) y TMPV (Tata Motors). No se especifica el número de tokens, el tamaño del dataset ni si se aplicaron técnicas como RLHF o DPO. El autor indica que el 10% de los datos se reservó para pruebas, pero no se reportan resultados de evaluación. No se menciona ninguna innovación arquitectónica más allá del fine-tuning estándar.

## Capacidades

- Generación de texto instructivo en inglés, siguiendo el formato de Gemma 4 instruct.
- Análisis técnico de acciones: dado un snapshot con precio de cierre, SMA de 20 y 50 días, RSI(14), MACD, volatilidad a 20 días y cambio de volumen, produce un desglose razonado y una recomendación a 5 días (BUY, SELL o HOLD).
- Capacidad conversacional básica, como modelo instructivo.
- No se documenta soporte para tool calling, funciones, visión ni multimodalidad.
- No se indica soporte para razonamiento multi-paso avanzado más allá de la generación de recomendaciones.

## Casos de uso

- Análisis técnico automatizado de valores indios: el modelo puede procesar snapshots técnicos de los cinco símbolos NSE para los que fue entrenado y generar recomendaciones a corto plazo, útil como asistente de screening para traders minoristas.
- Generación de informes de mercado: a partir de datos técnicos, el modelo redacta un análisis textual estructurado que puede integrarse en boletines o paneles de seguimiento bursátil.
- Prototipos de sistemas de recomendación bursátil: sirve como base para experimentar con pipelines de decisión automática que combinan indicadores técnicos con lenguaje natural.
- Investigación académica sobre LLMs en finanzas: permite estudiar el comportamiento de un modelo de 30B parámetros ajustado con datos de mercado limitados, sin necesidad de infraestructura propia de entrenamiento.
- Educación financiera: puede utilizarse en entornos de aprendizaje para explicar cómo se interpretan indicadores como RSI, MACD o medias móviles en un contexto conversacional.
- Evaluación de modelos de lenguaje en dominios especializados: sirve como caso de estudio para comparar el rendimiento de fine-tuning con datos propietarios frente a modelos generales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el modelo no ha sido probado y que los resultados pueden variar, por lo que no existen métricas objetivas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~30,7B parámetros. En fp16 sin cuantizar necesitaría aproximadamente 61 GB de VRAM. El repositorio pesa 18,7 GB, lo que sugiere una cuantización GGUF de baja precisión (probablemente Q4), que podría caber en una GPU de 24 GB como la RTX 4090 o la A10G.
- GPU recomendadas: para cuantización GGUF, una RTX 3090/4090 (24 GB) o una A100 40GB serían suficientes. Para fp16 completo, se necesitaría una A100 80GB o dos GPUs de 40GB en paralelo.
- Compatibilidad con GPU de consumo: sí, si se utiliza una cuantización GGUF de 4 bits o inferior, cabe en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), TGI (Text Generation Inference) o servidores compatibles con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| stock-gemma-merged-new | ~30,7B | No disponible | Apache 2.0 | Hugging Face (GGUF) | Fine-tuning de Gemma 4 31B para análisis técnico de acciones NSE |
| google/gemma-4-31B-it | ~31B | No disponible | Gemma Terms (Apache 2.0 para este repo) | Hugging Face | Modelo base, sin fine-tuning financiero |
| FinGPT (ej. FinGPT-7B) | ~7B | Variable | MIT (en algunos) | Hugging Face | Modelo financiero open source, pero con menor tamaño y enfoque en NLP financiera general |

No se dispone de benchmarks comparativos entre estos modelos. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido probado y que los resultados pueden variar; no hay garantía de precisión en las predicciones.
- No debe utilizarse para tomar decisiones financieras reales. El modelo es sugestivo, no un decisor concreto, y el desarrollador no se hace responsable de pérdidas económicas.
- Sesgo de entrenamiento: solo se utilizaron cinco símbolos del NSE (REL, TCS, INFY, HDFCBANK, TMPV), por lo que no generaliza a otros mercados, sectores o geografías.
- Riesgo de alucinación: como todo LLM, puede generar recomendaciones plausibles pero incorrectas, especialmente en dominios con alta volatilidad como el mercado de valores.
- Limitación de idioma: solo soporta inglés, lo que restringe su uso a hablantes de ese idioma.
- Entrenamiento con datos propietarios y no detallados: no se especifica la composición exacta del dataset ni el proceso de limpieza, lo que dificulta la reproducibilidad.
- Entrenamiento en infraestructura freemium compartida: el autor menciona que la eficiencia no está garantizada, lo que puede afectar a la calidad del ajuste.
- El repositorio indica una nueva versión (`sudarshan-plus/stock-gemma-31b-GGUF`) que fue probada durante el entrenamiento, mientras que este modelo no lo fue; se recomienda usar la versión nueva para resultados más organizados.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sudarshan-plus/stock-gemma-merged-new
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Nueva versión referenciada: https://huggingface.co/sudarshan-plus/stock-gemma-31b-GGUF
