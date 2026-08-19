# sudarshan-plus/stock-gemma-merged

## Resumen

El modelo `sudarshan-plus/stock-gemma-merged` es un fine-tuning del modelo base `google/gemma-4-E4B-it`, desarrollado por Sudarshan Chavan con el objetivo de evaluar la viabilidad de modelos de bajo parámetro para el análisis de datos bursátiles. Se entrenó sobre símbolos seleccionados del National Stock Exchange (NSE) de India, como REL, TCS, INFY, HDFCBANK y TMPV, aunque el autor declara explícitamente que el modelo no ha sido probado y que existe una versión más reciente (`stock-gemma-31b-GGUF`) que sí fue evaluada durante el entrenamiento.

El modelo tiene aproximadamente 8 mil millones de parámetros totales (7.996.156.490) y se distribuye en formato safetensors. Está orientado a instrucciones en inglés y se publica bajo licencia Apache 2.0. Su relevancia radica en ser un experimento open source sobre el uso de LLMs para tareas financieras, aunque con advertencias claras sobre su falta de validación y su carácter meramente sugerente, no decisorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de google/gemma-4-E4B-it) |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (entrenado en fp16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se especifican los detalles arquitectónicos del modelo base `gemma-4-E4B-it` en la información proporcionada. Se sabe que es un fine-tuning de dicho modelo, que pertenece a la familia Gemma de Google DeepMind. El entrenamiento se realizó con precisión fp16 sobre una GPU A100 de 40GB, utilizando el módulo FastLanguageModel y datasets cronológicos. El autor menciona que los datos de entrenamiento provienen de un servicio propietario y que se realizó preprocesamiento, pero no se detalla el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El conocimiento del modelo tiene un corte el 14 de agosto de 2026.

## Capacidades

- Generación de texto en inglés, con enfoque en instrucciones (instruction-tuned).
- Análisis de datos bursátiles, específicamente sobre símbolos del NSE (REL, TCS, INFY, HDFCBANK, TMPV), aunque sin garantías de precisión.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- El autor indica que el modelo es "sugestivo, no un tomador de decisiones concreto", por lo que su uso se limita a experimentación.

## Casos de uso

- Experimentación académica: investigadores pueden usar el modelo para estudiar cómo los LLM de ~8B manejan datos financieros secuenciales, comparando su comportamiento con el modelo base.
- Prototipos de análisis bursátil: para generar resúmenes textuales de tendencias históricas de acciones concretas, siempre como apoyo y no como fuente única de decisión.
- Pruebas de fine-tuning en dominios específicos: sirve como ejemplo de cómo adaptar un modelo Gemma a un dominio vertical con recursos limitados (GPU freemium).
- Evaluación de sesgos en datos financieros: dado que el entrenamiento usó datos propietarios, puede analizarse si el modelo refleja patrones o sesgos de esos datos.
- Desarrollo de asistentes de educación financiera: para explicar conceptos bursátiles en lenguaje natural, con supervisión humana.
- Benchmarking de modelos de bajo parámetro: comparar su rendimiento en tareas de lenguaje general frente a otros modelos de tamaño similar, aunque no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el modelo no fue probado y que "los resultados pueden variar".

## Requisitos de hardware

- El entrenamiento se realizó en una GPU A100 de 40GB, lo que sugiere que la inferencia puede ejecutarse en GPUs con al menos 16-20GB de VRAM en fp16 (estimación basada en el tamaño de ~8B parámetros).
- No se especifican requisitos mínimos de inferencia ni opciones de despliegue (vLLM, llama.cpp, Ollama, etc.).
- Al ser un modelo de 8B, es plausible que quepa en GPUs de consumo como RTX 3090 o RTX 4090 (24GB) en cuantización de 8 bits o 4 bits, pero no hay confirmación oficial.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo base `google/gemma-4-E4B-it` podría servir como referencia, pero no se ofrecen métricas de rendimiento. Otros modelos de ~8B como Llama 3.1 8B o Mistral 7B podrían ser comparables en tamaño, pero no hay información sobre su rendimiento relativo en las tareas de este fine-tuning.

## Limitaciones y advertencias

- El modelo no ha sido probado; el autor indica que la versión `stock-gemma-31b-GGUF` es la que fue evaluada durante el entrenamiento.
- No se garantiza la precisión de las predicciones; el autor no se hace responsable de pérdidas financieras.
- El modelo no está diseñado para tomar decisiones financieras reales; su uso es meramente sugerente.
- Los datos de entrenamiento provienen de un servicio propietario, lo que limita la reproducibilidad y la transparencia.
- Solo soporta inglés, lo que restringe su uso en otros idiomas.
- No se especifican sesgos conocidos, pero al entrenarse en datos bursátiles específicos, podría reflejar patrones de esos datos sin generalizar adecuadamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sudarshan-plus/stock-gemma-merged
- Versión nueva (GGUF): https://huggingface.co/sudarshan-plus/stock-gemma-31b-GGUF (referenciada en la model card)
- Perfil del autor: https://huggingface.co/sudarshan-plus
- Repositorio de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
- Documentación de Gemma: https://ai.google.dev/gemma/docs
