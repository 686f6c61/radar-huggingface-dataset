# Soulfate24/LFM2.5-2.6B-DSpark-ASHQ1-Remix-GGUF

## Resumen

LFM2.5-2.6B-DSpark-ASHQ1-Remix-GGUF es una versión cuantizada en formato GGUF del modelo LFM2.5-2.6B-DSpark desarrollado por Liquid AI. El modelo original es un transformer denso de 2.6B parámetros con una ventana de contexto de 128K tokens, diseñado específicamente para cargas de trabajo agénticas y tool calling nativo en entornos de edge y dispositivos locales. La variante DSpark incorpora un mecanismo de decodificación especulativa que acelera la inferencia hasta 3,2 veces en hardware como H100 o MacBook, según el blog oficial de Liquid AI.

Esta versión GGUF aplica la suite de cuantización ASHQ1-Remix, un método activación-aware desarrollado por Soulfate24 que ofrece siete niveles de compresión (desde Pico-24pc hasta Fidelity-48pc) con doble cuantización y límites explícitos de saturación. La cuantización permite desplegar el modelo en dispositivos con recursos de memoria limitados, manteniendo un equilibrio entre fidelidad y tamaño. El modelo soporta 16 idiomas y se distribuye bajo la licencia lfm1.0, una licencia propietaria de Liquid AI con condiciones específicas de uso.

La relevancia de este modelo radica en su capacidad para ejecutar agentes autónomos con tool calling en hardware de consumo, algo que tradicionalmente requería modelos mucho más grandes. La combinación de cuantización GGUF y decodificación especulativa lo convierte en una opción práctica para aplicaciones de producción en entornos con restricciones de VRAM y latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Liquid Foundation Model 2.5) |
| Parametros totales | 2.6B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | ASHQ1-Remix (siete niveles: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc) |
| Idiomas soportados | Arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes, vietnamita |
| Licencia | lfm1.0 (licencia propietaria de Liquid AI) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-2.6B es un transformer denso de 2.6B parámetros entrenado por Liquid AI para tareas agénticas. Según la documentacion oficial, está optimizado para razonamiento multi-paso, tool calling y uso en dispositivos con recursos limitados. La arquitectura incorpora atención de contexto largo (128K tokens) y un diseño orientado a eficiencia computacional en hardware heterogéneo.

La variante DSpark añade un modelo draft más pequeño que trabaja en tándem con el modelo principal mediante decodificación especulativa. Este enfoque co-diseña la arquitectura con métodos de especulación para acelerar la inferencia en escenarios reales, logrando mejoras de rendimiento de hasta 3,2x en GPUs como H100 y en MacBook, según el blog oficial de Liquid AI.

La cuantización ASHQ1-Remix aplicada en esta versión GGUF es un método activación-aware que utiliza doble cuantización y límites explícitos de saturación, basado en experimentos medidos en seis familias de modelos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento multi-paso, optimizado para cargas de trabajo agénticas.
- Soporte nativo de tool calling / function calling, segun la documentacion de Liquid AI.
- Capacidad para ejecutar agentes autónomos con planificacion y ejecucion de acciones.
- Ventana de contexto de 128K tokens, adecuada para documentos largos y conversaciones multi-turno.
- Multilingue: soporta 16 idiomas, incluyendo espanol, ingles, frances, aleman, chino, arabe, entre otros.
- Decodificacion especulativa integrada (DSpark) que acelera la inferencia sin cambiar la salida del modelo.
- Formato GGUF con cuantizacion en siete niveles, permitiendo ajustar el equilibrio entre tamaño y fidelidad.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno en varios idiomas gracias a su ventana de 128K tokens, manteniendo el contexto completo de interacciones largas y derivando a herramientas externas mediante tool calling.
- Agentes de automatizacion en el navegador: con soporte nativo de tool calling, el modelo puede orquestar acciones como rellenar formularios, extraer datos o interactuar con APIs, ejecutandose localmente en un portatil o mini-PC.
- Generacion de codigo en entornos de desarrollo con recursos limitados: su tamaño de 2.6B y cuantizacion GGUF permiten ejecutarlo en una GPU consumer de 4-6 GB, ofreciendo asistencia de codigo sin depender de servicios en la nube.
- Procesamiento de documentos legales o tecnicos: la ventana de 128K tokens permite analizar contratos, informes o articulos extensos de una sola pasada, con capacidad de resumir y extraer clausulas especificas en varios idiomas.
- Asistentes de voz en dispositivos edge: al ser un modelo denso y cuantizado, puede desplegarse en hardware de bajo consumo (como Raspberry Pi con acelerador NPU) para transcripcion y respuesta en tiempo real con latencia reducida.
- Sistemas de recomendacion conversacional: el modelo puede mantener perfiles de usuario detallados en contexto y usar tool calling para consultar bases de datos de productos, ofreciendo recomendaciones personalizadas sin enviar datos a servidores externos.
- Traduccion automatica con ajuste fino: su soporte multilingue y formato GGUF permiten crear pipelines de traduccion local con control de calidad, aprovechando el contexto largo para mantener coherencia en documentos extensos.

## Benchmarks y rendimiento

La model card proporciona benchmarks de perplejidad (PPL) y métricas de divergencia para cada nivel de cuantizacion, medidos sobre el conjunto wiki.test.raw con referencia simetrica de FA-auto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Nivel de cuantizacion | Tamano | PPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|
| Fidelity-48pc | 2481 MiB | 56.0022 | 0.0072 | 1.87% | 95.8% |
| Precision-42pc | 2179 MiB | 55.2953 | 0.0108 | 2.32% | 94.9% |
| Quality-36pc (recomendado) | 1850 MiB | 55.5619 | 0.0354 | 4.12% | 91.0% |
| Compact-33pc | 1708 MiB | 54.6921 | 0.0762 | 6.05% | 87.0% |
| Mini-30pc | 1554 MiB | 56.5119 | 0.1199 | 7.53% | 83.9% |
| Nano-27pc | 1399 MiB | 61.1460 | 0.2131 | 10.06% | 78.9% |
| Pico-24pc | 1276 MiB | 56.7726 | 0.3707 | 13.08% | 72.7% |

Los valores de PPL son relativamente altos (en torno a 55-61), lo que es esperable para un modelo de 2.6B parámetros cuantizado. La métrica KLD indica que la divergencia respecto al modelo original aumenta progresivamente en los niveles mas comprimidos. El nivel Quality-36pc se recomienda como equilibrio optimo entre tamaño y fidelidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el nivel Quality-36pc ocupa 1850 MiB, por lo que se necesita al menos 2-3 GB de VRAM libre para cargar el modelo y los buffers de computacion. Los niveles mas pequeños (Pico-24pc, 1276 MiB) caben en GPUs con 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3060, RTX 4090) puede ejecutar todos los niveles. Tambien funciona en iGPUs con memoria compartida (por ejemplo, Apple Silicon con 8 GB unificados).
- Si cabe en GPU consumer: si, incluso en las mas basicas. El nivel Pico-24pc es adecuado para tarjetas con 2 GB de VRAM.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, y servidores como vLLM o TGI si se convierte a safetensors. Tambien se puede usar con el runtime de Liquid AI si se descarga el modelo original.
- Latencia y throughput: no se proporcionan datos especificos de latencia. La decodificacion especulativa DSpark puede acelerar la generacion hasta 3,2x en comparacion con el modelo sin especulacion, segun Liquid AI, aunque esta mejora depende del hardware y del patron de generacion.

## Comparativa con modelos similares

No hay datos de benchmarks comparativos publicados en la informacion disponible. A continuacion se presenta una comparacion cualitativa basada en especificaciones:

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-2.6B-DSpark (original) | 2.6B | 128K | Si | lfm1.0 | Safetensors |
| LFM2.5-2.6B-DSpark-ASHQ1-Remix (esta version) | 2.6B | 128K | Si | lfm1.0 | GGUF |
| Qwen2.5-3B-Instruct | 3.0B | 32K | Si | Apache 2.0 | Safetensors, GGUF |
| Gemma-2-2.6B | 2.6B | 8K | No | Gemma (uso comercial permitido) | Safetensors, GGUF |

El modelo destaca por su ventana de contexto de 128K, muy superior a la de alternativas de tamaño similar. La licencia lfm1.0 de Liquid AI es mas restrictiva que Apache 2.0, por lo que debe revisarse antes de uso comercial.

## Limitaciones y advertencias

- La licencia lfm1.0 es propietaria y puede imponer restricciones al uso comercial o a la redistribucion. Es imprescindible revisar los terminos completos en el repositorio de Liquid AI antes de desplegar el modelo en produccion.
- La cuantizacion degrada la calidad de salida, especialmente en los niveles mas comprimidos (Nano y Pico), donde la divergencia KLD aumenta significativamente. Se recomienda el nivel Quality-36pc como minimo para tareas que requieran razonamiento fiable.
- No se dispone de informacion sobre sesgos especificos del modelo. Como cualquier modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento, aunque no se han publicado evaluaciones de sesgo.
- Riesgo de alucinacion: inherente a todos los modelos de lenguaje. La ventana de contexto larga puede amplificar la generacion de contenido plausible pero incorrecto si el contexto contiene informacion contradictoria.
- El modelo esta optimizado para tareas agénticas y tool calling, pero su tamaño de 2.6B limita la profundidad de razonamiento en problemas complejos de matematicas o logica en comparacion con modelos de mayor escala.
- La fecha de creacion del repositorio (2026) sugiere que es un modelo reciente, pero no se han publicado evaluaciones independientes de terceros.

## Enlaces

- Repositorio HuggingFace de esta version cuantizada: https://huggingface.co/Soulfate24/LFM2.5-2.6B-DSpark-ASHQ1-Remix-GGUF
- Modelo base original (LiquidAI/LFM2.5-2.6B-DSpark): https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark
- Modelo base LFM2.5-2.6B: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog de Liquid AI sobre LFM2.5-DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- Documentacion oficial de LFM2.5-2.6B: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Suite ASHQ1-Remix (metodo de cuantizacion): https://huggingface.co/Soulfate24/AutoRound-ASHQ1-Remix_Double-Quantization_Suite
