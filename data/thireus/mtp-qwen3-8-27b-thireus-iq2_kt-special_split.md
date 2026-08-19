# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_KT-SPECIAL_SPLIT

## Resumen

El modelo `Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_KT-SPECIAL_SPLIT` es una cuantización GGUF de muy baja precisión (IQ2_KT, aproximadamente 2 bits por peso) del modelo base Qwen3.8-27B de Alibaba, realizada por el usuario Thireus. El nombre sugiere que forma parte de una serie de cuantizaciones experimentales con división especial de tensores (SPECIAL_SPLIT) y posiblemente con soporte de multi-token prediction (mtp). La licencia declarada en Hugging Face es MIT, lo que permite uso comercial sin restricciones significativas.

El modelo base Qwen3.8-27B es un transformer denso multimodal de 27 000 millones de parámetros, con una ventana de contexto de 262 144 tokens y un codificador de visión integrado. Está diseñado para tareas de codificación, flujos agénticos y automatización de oficina, y se distribuye bajo licencia Apache 2.0. Esta cuantización concreta reduce drásticamente el tamaño del modelo para permitir su ejecución en hardware de gama baja, aunque a costa de una pérdida notable de calidad en la generación.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 27B en dispositivos con poca memoria, como portátiles o GPUs de consumo antiguas, gracias a la cuantización extrema. Sin embargo, al tratarse de una versión de 2 bits, la fidelidad de las respuestas puede verse seriamente comprometida, por lo que su uso práctico se limita a experimentación o tareas muy sencillas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (modelo base Qwen3.8-27B) |
| Parametros totales | 27 000 millones (aprox., según nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (según artículo sobre Qwen3.8-27B) |
| Tipos de cuantizacion | IQ2_KT (2 bits, GGUF) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors no aplicable) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros, con arquitectura multimodal que incorpora un codificador de visión. Según el artículo de Yottalabs, el modelo fue entrenado con un contexto de 262 144 tokens y está optimizado para tareas de codificación, agentes y automatización de oficina. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

La cuantización IQ2_KT es una técnica de compresión de pesos que reduce cada parámetro a aproximadamente 2 bits, utilizando una combinación de cuantización por bloques y escalado. Thireus, el autor, ha publicado varias cuantizaciones similares (BF16, IQ2_KS) y parece emplear su propia herramienta GGUF Tool Suite. El sufijo SPECIAL_SPLIT sugiere una división particular de los tensores para optimizar el rendimiento en ciertos hardware, aunque no se ofrecen detalles técnicos al respecto.

## Capacidades

- Generación de texto y razonamiento básico, aunque degradado por la cuantización de 2 bits.
- Soporte de entrada multimodal (visión) en el modelo base, pero la cuantización extrema puede afectar seriamente a esta capacidad.
- Capacidad de codificación y generación de código, según las características del modelo base.
- Soporte de flujos agénticos y tool calling en el modelo base, aunque no se garantiza su funcionamiento correcto tras la cuantización.
- Multilingüismo probable, pero no confirmado para esta versión específica.
- No se ha verificado soporte de thinking mode ni de audio.

## Casos de uso

- Experimentación educativa: permite a estudiantes y aficionados ejecutar un modelo de 27B en hardware modesto para aprender sobre cuantización y sus efectos en la calidad de salida.
- Prototipado rápido en entornos sin GPU potente: se puede desplegar en una CPU con suficiente RAM para probar flujos de conversación simples antes de migrar a una versión completa.
- Generación de texto en dispositivos edge: para aplicaciones donde la precisión no es crítica, como resúmenes muy cortos o clasificación de texto simple.
- Evaluación de técnicas de cuantización: investigadores pueden comparar el rendimiento de IQ2_KT frente a otras cuantizaciones (IQ2_KS, BF16) en tareas específicas.
- Inferencia en portátiles antiguos: con 8 GB de RAM, un portátil puede cargar el modelo y ejecutar inferencias lentas pero funcionales.
- Pruebas de compatibilidad con frameworks de inferencia: sirve para validar que vLLM, llama.cpp u Ollama funcionan con formatos GGUF de baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El artículo sobre Qwen3.8-27B menciona que el modelo base tiene benchmarks publicados, pero no se detallan en los resultados de búsqueda. La cuantización IQ2_KT, al ser de 2 bits, presentará una degradación significativa en métricas como MMLU, HumanEval o GSM8K en comparación con el modelo original, pero no se dispone de cifras concretas.

## Requisitos de hardware

- Tamaño del archivo estimado: aproximadamente 6,75 GB (27B × 2 bits / 8), más overhead de metadatos.
- VRAM mínima para inferencia en GPU: alrededor de 8 GB, aunque se recomienda 10-12 GB para evitar swapping.
- GPUs compatibles: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, o GPUs de datacenter antiguas (V100, T4).
- En CPU: se puede ejecutar con 8 GB de RAM, pero la velocidad será muy baja (menos de 1 token/s).
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), o el propio ejecutable de Thireus.
- Latencia y throughput: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_KT-SPECIAL_SPLIT | 27B | 262k | IQ2_KT (2 bits) | MIT | Hugging Face |
| Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT | 27B | 262k | BF16 (16 bits) | MIT | Hugging Face |
| Thireus/mtp-Qwen3.5-27B-THIREUS-IQ2_KS-SPECIAL_SPLIT | 27B | no disponible | IQ2_KS (2 bits) | MIT | Hugging Face |
| Qwen3.8-27B (original) | 27B | 262k | BF16 | Apache 2.0 | GitHub / Hugging Face |

La comparativa muestra que la única diferencia relevante entre las versiones de Thireus es el tipo de cuantización. La versión BF16 conserva la calidad original pero requiere mucho más espacio (~54 GB), mientras que las versiones de 2 bits son mucho más ligeras pero con pérdida de calidad. El modelo original de Alibaba es la referencia de calidad, pero su licencia Apache 2.0 es más permisiva que la MIT en algunos aspectos (aunque ambas permiten uso comercial).

## Limitaciones y advertencias

- La cuantización IQ2_KT (2 bits) produce una degradación severa de la calidad del texto generado, con mayor probabilidad de incoherencias, repeticiones y errores gramaticales.
- El modelo puede alucinar con facilidad, especialmente en tareas de razonamiento o generación de código.
- La capacidad multimodal (visión) del modelo base probablemente no funcione correctamente tras la cuantización extrema.
- No se ha verificado el soporte de tool calling ni de flujos agénticos en esta versión; es probable que fallen.
- El contexto de 262k tokens es teórico; en la práctica, con 2 bits, la atención sobre secuencias largas será muy deficiente.
- La licencia MIT permite uso comercial, pero el modelo base Qwen3.8-27B tiene licencia Apache 2.0; al ser una cuantización, se debe respetar la licencia del modelo original si se redistribuye.
- No hay garantías de soporte ni mantenimiento por parte del autor; el modelo se publica tal cual.

## Enlaces

- [Hugging Face - Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_KT-SPECIAL_SPLIT](https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ2_KT-SPECIAL_SPLIT)
- [Hugging Face - Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT](https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT)
- [Hugging Face - Thireus/mtp-Qwen3.5-27B-THIREUS-IQ2_KS-SPECIAL_SPLIT](https://huggingface.co/Thireus/mtp-Qwen3.5-27B-THIREUS-IQ2_KS-SPECIAL_SPLIT)
- [GitHub - Qwen3.8-27B (AlibabaCloud-Official)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [GitHub - Perfil de Thireus](https://github.com/Thireus)
- [Artículo de Yottalabs sobre Qwen3.8-27B](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
