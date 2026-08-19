# Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_KS-SPECIAL_SPLIT

## Resumen

El modelo `Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_KS-SPECIAL_SPLIT` es un archivo GGUF que corresponde a una cuantización del modelo Qwen3.8-27B, realizada por el autor Thireus mediante su herramienta propietaria GGUF-Tool-Suite. La nomenclatura indica que se trata de una cuantización IQ4_KS (método de cuantización de 4 bits con optimizaciones de kernel) y un "SPECIAL_SPLIT", que sugiere una división especial de capas para una cuantización mixta o adaptada. El modelo está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

La información disponible en la model card es mínima: únicamente se indica la licencia. No se proporcionan detalles sobre arquitectura, entrenamiento, capacidades ni benchmarks. Los resultados de búsqueda web apuntan a que Qwen3.8-27B es un modelo reciente (2026) con contexto de 262k tokens y un codificador de visión, pero no se confirma que esta cuantización específica conserve todas esas características. Dado que el archivo es una cuantización, se espera que herede las capacidades del modelo base, pero no hay datos verificables en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, sin confirmar) |
| Parametros totales | 27 mil millones (por el nombre) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B podría tener 262k, sin confirmar para esta cuantizacion) |
| Tipos de cuantizacion | IQ4_KS (indicado en el nombre) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (por el nombre y la etiqueta en los resultados de busqueda) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ni sobre el proceso de entrenamiento. El nombre sugiere que es una cuantización de Qwen3.8-27B, un modelo de la familia Qwen, pero no se confirma si la arquitectura es transformer puro, MoE o híbrida. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La cuantización IQ4_KS es un método de compresión de pesos que reduce la precisión a 4 bits con ciertas optimizaciones de kernel, pero no se especifican los detalles de la implementación de Thireus.

## Capacidades

No se han publicado capacidades específicas para esta cuantización. Dado que es un archivo GGUF de un modelo de 27B, se espera que pueda realizar tareas de generación de texto, razonamiento, código y posiblemente visión si el modelo base lo soporta, pero no hay confirmación. No se dispone de información sobre tool calling, agentes, multilingüismo o modos especiales de pensamiento.

## Casos de uso

Al no disponer de información verificada sobre las capacidades del modelo, los casos de uso son hipotéticos y basados en el tamaño y la cuantización:

- Inferencia local en una GPU de consumo: al ser una cuantización de 4 bits, el modelo podría ejecutarse en GPUs con 16-24 GB de VRAM, permitiendo despliegue en entornos sin acceso a hardware de datacenter.
- Prototipado rápido de aplicaciones de generación de texto: su licencia MIT facilita la integración en proyectos comerciales sin coste de licencia.
- Experimentación con cuantización mixta: el "SPECIAL_SPLIT" podría interesar a desarrolladores que estudian técnicas de compresión de modelos.
- Fine-tuning o adaptación posterior: aunque es un archivo GGUF, podría servir como base para pruebas de rendimiento en tareas específicas.
- Evaluación de calidad de cuantización: comparar la perplejidad de esta cuantización con otras versiones del mismo modelo.
- Despliegue en entornos con restricciones de memoria: la cuantización IQ4_KS reduce el tamaño del modelo, facilitando su uso en servidores con VRAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de perplejidad, MMLU, HumanEval, GSM8K ni otras métricas para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: para una cuantización IQ4_KS de 27B, el tamaño del archivo sería aproximadamente 27.000 millones de parámetros × 4,5 bits / 8 = ~15,2 GB, más overhead de contexto y runtime. Se estima un mínimo de 16-20 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs con al menos 16 GB de VRAM.
- En consumer GPU: sí, cabe en GPUs de gama alta con 24 GB, y posiblemente en algunas de 16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF), TGI (con adaptadores), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar esta cuantización con otras alternativas. El modelo base Qwen3.8-27B podría compararse con otros modelos de 27B como Llama-3-27B o Mistral-27B, pero no hay datos verificados. Se indica "no disponible".

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, puede haber pérdida de precisión respecto al modelo en BF16, lo que podría afectar a tareas que requieren alta exactitud.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- La licencia MIT permite uso comercial, pero se recomienda verificar que el modelo base (Qwen3.8-27B) no tenga restricciones adicionales, ya que la licencia del archivo cuantizado no exime de las condiciones del modelo original.
- El "SPECIAL_SPLIT" podría implicar una configuración no estándar que requiera ajustes en el runtime para funcionar correctamente.
- No hay garantías de que el modelo conserve todas las capacidades del base (como visión o contexto largo) tras la cuantización.

## Enlaces

- HuggingFace: https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-IQ4_KS-SPECIAL_SPLIT
- Modelo relacionado (BF16): https://huggingface.co/Thireus/mtp-Qwen3.8-27B-THIREUS-BF16-SPECIAL_SPLIT
- Modelo relacionado (IQ3_KS): https://huggingface.co/Thireus/mtp-Qwen3.5-27B-THIREUS-IQ3_KS-SPECIAL_SPLIT
- Colección de modelos de Thireus: https://gguf.thireus.com/
- Artículo sobre Qwen3.8-27B (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guía de despliegue local (swfte): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
