# TsipiDev/Thesis_Models_Dimitris_Vatousis_220007

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un conjunto de nueve artefactos de investigación en formato GGUF generados para la tesis de grado "Research and Development of Energy-Efficient Inference Methods for Generative AI (LLMs) on Low-Power Embedded Systems", defendida por D. N. Vatousis en el Departamento de Informática de la Democritus University of Thrace (Kavala, 2026) y publicada bajo la cuenta de HuggingFace TsipiDev. El objetivo es medir el consumo energético y el rendimiento de la inferencia de LLM en una Raspberry Pi 400, comparando tres modelos pequeños en distintas configuraciones de precisión y poda.

Los archivos derivan de tres modelos base: TinyLlama-1.1B-Chat-v1.0, Llama-3.2-1B y Qwen2-0.5B. Para cada uno se publican tres variantes: una en F16, una cuantizada a Q8_0 (INT8) mediante `llama-quantize`, y una podada al 30 % con poda no estructurada L1 aplicada a todas las capas `torch.nn.Linear` y hecha permanente con `prune.remove`, sin reentrenamiento posterior. Los tres modelos base son transformers decoder-only de propósito general, con aproximadamente 0,5, 1,1 y 1,24 mil millones de parámetros respectivamente.

La relevancia de este repositorio es metodológica más que de rendimiento: proporciona artefactos reproducibles para estudiar el compromiso entre precisión numérica, compresión por poda y coste energético en hardware de bajo consumo. El autor advierte explícitamente de que las variantes podadas están degradadas de forma intencionada —la de Llama 3.2, en particular, produce texto repetitivo— y de que se trata de material de laboratorio, no de modelos listos para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de cada modelo base: TinyLlama, Llama 3.2 y Qwen2) |
| Parametros totales | 1.235.814.432 (variante Llama-3.2-1B, dato de safetensors); TinyLlama-1.1B: ~1,1 mil millones; Qwen2-0.5B: ~0,5 mil millones |
| Longitud de contexto | No documentada en el repositorio (depende del modelo base) |
| Tipos de cuantizacion | F16, Q8_0 (INT8) y F16 con poda no estructurada L1 del 30 % |
| Idiomas soportados | No disponible |
| Licencia | Mixta: Apache License 2.0 para los derivados de TinyLlama y Qwen2; Llama 3.2 Community License Agreement para los derivados de Llama 3.2 |
| Formato de pesos | GGUF (9 archivos) |
| Tamano del repositorio | 14,4 GB |
| Herramientas de conversion | `convert_hf_to_gguf.py --outtype f16` y `llama-quantize` (Q8_0) de llama.cpp |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento propio en este repositorio: los nueve archivos son derivados de pesos ya publicados. Los modelos base son transformers decoder-only con atención causal. TinyLlama-1.1B-Chat-v1.0 y Llama-3.2-1B siguen la arquitectura Llama (con atención agrupada por consultas y RoPE); Qwen2-0.5B sigue la arquitectura Qwen2, también decoder-only. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que toda esa información pertenece a las fichas de los modelos originales.

La innovación técnica del conjunto es el eje experimental: el autor aplicó poda no estructurada L1 (`torch.nn.utils.prune.l1_unstructured`, `amount=0.3`) a cada capa `torch.nn.Linear`, la hizo permanente con `prune.remove` y no realizó ningún reentrenamiento ni ajuste fino posterior. Después convirtió los pesos a GGUF en F16 y generó las versiones Q8_0. Esto permite medir por separado el efecto de la cuantización (F16 frente a Q8_0) y el de la poda (F16 frente a F16 podado al 30 %) sobre el consumo energético, la latencia y la calidad del texto generado en una Raspberry Pi 400. El autor indica explícitamente que el podado sin reentrenamiento degrada la calidad, de forma deliberada, para poder cuantificar el coste.

## Capacidades

- Generación de texto conversacional, heredada de los tres modelos base (TinyLlama-1.1B-Chat, Llama-3.2-1B y Qwen2-0.5B), con calidad propia de modelos de menos de 1,3 mil millones de parámetros.
- Inferencia en CPU sobre arquitecturas ARM mediante llama.cpp, sin necesidad de GPU ni de aceleradores dedicados.
- Comparación controlada de tres regímenes de precisión y compresión: F16, Q8_0 y F16 con poda L1 del 30 %.
- Reproducción de medidas de consumo energético, latencia y throughput sobre Raspberry Pi 400.
- Ejecución desde la librería `huggingface_hub` con `hf download`, y carga directa en cualquier runtime compatible con GGUF.
- Capacidades de tool calling, agentes, visión, audio o modo "thinking": no disponibles en la información proporcionada. Los modelos base de esta escala no incluyen, en general, soporte nativo de function calling.

## Casos de uso

- Reproducción de experimentos académicos de eficiencia energética: descargar los nueve GGUF y ejecutar el código de la tesis (repositorio `Thesis_Code_Dimitris_Vatousis_220007`) sobre una Raspberry Pi 400 para replicar las medidas de vatios por token y tokens por segundo declaradas en la disertación.
- Estudio del impacto de la poda sin reentrenamiento: comparar `*_fp16.gguf` con `*_pruned.gguf` del mismo modelo base para cuantificar la pérdida de perplejidad y coherencia cuando se elimina el 30 % de los pesos de cada capa lineal, sin ajuste posterior.
- Comparación de estrategias de cuantización en hardware limitado: enfrentar `*_fp16.gguf` contra `*_q8.gguf` para medir la reducción de huella de memoria y el ahorro energético que aporta INT8 en un SoC ARM Cortex-A72.
- Selección de modelo para dispositivos edge: usar los tres modelos base (0,5 B, 1,1 B y 1,24 B) como referencia para decidir qué tamaño cabe y a qué velocidad corre en un equipo con 4 GB de RAM compartida.
- Docencia en sistemas embebidos e IA: emplear los nueve artefactos como material de prácticas para ilustrar el pipeline completo de conversión a GGUF, cuantización y poda sobre modelos reales.
- Validación de pipelines llama.cpp: usar los archivos como casos de prueba de conversión (`convert_hf_to_gguf.py`), cuantización (`llama-quantize`) y carga en `llama.cpp`, `llama-cpp-python` u Ollama.
- Análisis de degradación controlada: estudiar hasta qué punto un modelo de 0,5 B podado al 30 % sigue siendo utilizable, frente al caso documentado del Llama 3.2 podado, que produce texto repetitivo.
- Prototipado de asistentes conversacionales de baja potencia: evaluar la viabilidad de un chatbot local sin conexión en una Raspberry Pi 400 antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de perplejidad; se limita a describir los archivos y advertir de la degradación de las variantes podadas. Tampoco se aportan cifras de latencia, throughput ni consumo energético en la información proporcionada.

## Requisitos de hardware

- Objetivo principal del trabajo: Raspberry Pi 400 (SoC Broadcom BCM2711, CPU ARM Cortex-A72 de cuatro núcleos a 1,8 GHz, 4 GB de RAM compartida con la GPU). Los nueve modelos están pensados para ejecutarse en CPU sobre este equipo.
- Huella de memoria estimada por variante (cálculo a partir del número de parámetros y del ancho de bits; no verificado con medidas del autor):
  - Qwen2-0.5B: ~1,0 GB en F16 y ~0,5 GB en Q8_0.
  - TinyLlama-1.1B: ~2,2 GB en F16 y ~1,1 GB en Q8_0.
  - Llama-3.2-1B: ~2,5 GB en F16 y ~1,25 GB en Q8_0.
  - Variantes podadas al 30 %: ~30 % menos que su equivalente F16 sin podar, aunque el ahorro real depende del empaquetado del archivo GGUF.
- Cabe en GPU de consumo: las variantes Q8_0 y, con más holgura, los modelos de 0,5 B y 1,1 B pueden residir en GPUs con 4-8 GB de VRAM (por ejemplo, RTX 3050, RTX 3060 o superiores). Las variantes F16 de Llama-3.2-1B caben en 4 GB de VRAM si se reserva memoria para el contexto.
- GPU recomendadas para pruebas de referencia en x86: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4090) permite comparar el rendimiento en CPU frente al de GPU; A100 o H100 no aportan ventaja para modelos de este tamaño y no están justificadas por el propósito del repositorio.
- Opciones de despliegue: llama.cpp (runtime de referencia, dado el formato GGUF), llama-cpp-python, Ollama, LM Studio y cualquier servidor compatible con GGUF. vLLM y TGI no son la vía natural, ya que están orientados a safetensors y a GPUs de mayor capacidad.
- Latencia y throughput estimados: no disponible. El repositorio no publica cifras y las variantes de poda sin reentrenamiento pueden presentar patrones de generación degenerativos que distorsionan cualquier medida de velocidad.

## Comparativa con modelos similares

La comparativa más útil es interna, entre los tres modelos base y sus tres variantes por modelo:

| Modelo base | Parametros | Variantes publicadas | Licencia | Contexto | Uso previsto |
|---|---|---|---|---|---|
| Qwen/Qwen2-0.5B | ~0,5 mil millones | F16, Q8_0, F16 podado 30 % | Apache 2.0 | No documentado en el repositorio | Referencia de mínima huella |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | ~1,1 mil millones | F16, Q8_0, F16 podado 30 % | Apache 2.0 | No documentado en el repositorio | Chat ligero en edge |
| meta-llama/Llama-3.2-1B | 1.235.814.432 | F16, Q8_0, F16 podado 30 % | Llama 3.2 Community License | No documentado en el repositorio | Mayor calidad base de los tres |

Frente a alternativas externas de la misma categoría (por ejemplo, Gemma-2-2B, Phi-3-mini o SmolLM2-1.7B), este repositorio no aporta datos de rendimiento que permitan una comparación cuantitativa, por lo que no se puede establecer una superioridad o inferioridad numérica. La diferencia relevante es que aquí el interés no es la calidad del modelo, sino la reproducibilidad de medidas energéticas sobre un conjunto fijo de configuraciones.

## Limitaciones y advertencias

- Las variantes podadas están degradadas de forma intencionada. El autor señala que el Llama 3.2 podado, en particular, produce texto repetitivo. No deben usarse como modelos de propósito general.
- La poda se aplicó sin reentrenamiento ni ajuste posterior, por lo que la pérdida de calidad no está compensada.
- No hay información sobre sesgos, datos de entrenamiento, composición del corpus ni procesos de alineación (RLHF, DPO) en los modelos base dentro de esta ficha; esos datos deben consultarse en las fichas originales.
- Riesgo de alucinación alto: los tres modelos base tienen entre 0,5 y 1,24 mil millones de parámetros, un rango en el que la generación de hechos incorrectos es frecuente.
- Idiomas soportados: no disponible. TinyLlama-1.1B-Chat y Llama-3.2-1B están orientados principalmente al inglés; Qwen2-0.5B cubre más idiomas, pero el repositorio no documenta ninguna lista.
- Longitud de contexto: no documentada en el repositorio. Debe consultarse la ficha de cada modelo base antes de usarlo con entradas largas.
- Licencia mixta: los derivados de Llama 3.2 están sujetos al Llama 3.2 Community License Agreement y a la Acceptable Use Policy de Meta (incluye la marca "Built with Llama"). Los derivados de TinyLlama y Qwen2 son Apache 2.0. Verificar la licencia del archivo concreto antes de cualquier uso comercial.
- El repositorio registra 0 descargas y 0 likes, y fue creado en septiembre de 2026: no hay validación por parte de la comunidad ni informes independientes de funcionamiento.
- Están pensados como artefactos de investigación para reproducir medidas de la tesis, no como modelos listos para producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TsipiDev/Thesis_Models_Dimitris_Vatousis_220007
- Código de los experimentos de la tesis: https://github.com/TsipiDev/Thesis_Code_Dimitris_Vatousis_220007
- Perfil de GitHub del autor: https://github.com/TsipiDev/
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Modelo base Llama-3.2-1B: https://huggingface.co/meta-llama/Llama-3.2-1B
- Licencia de Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-1B/blob/main/LICENSE.txt
- Modelo base Qwen2-0.5B: https://huggingface.co/Qwen/Qwen2-0.5B

Nota: la búsqueda web asociada devolvió resultados no directamente relacionados con este repositorio (un preprint en arXiv, una tesis doctoral en el portal DiVA del KTH y un ranking general de modelos en artificialanalysis.ai), por lo que no se incluyen como fuentes específicas del modelo.
