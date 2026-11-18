# trymirai/Qwen3.5-9B-S

## Resumen

Qwen3.5-9B-S es una cuantización de alta calidad del modelo base Qwen/Qwen3.5-9B, publicada por trymirai (Mirai Labs) bajo licencia Apache 2.0. El checkpoint emplea una técnica de cuantización con trellis coding de estilo QTIP a aproximadamente 2,5 bits por peso, con el número de bits de cada matriz seleccionado a partir de ablaciones de KL medidas empíricamente. El resultado es un modelo de aproximadamente 2.780 millones de parámetros almacenados (frente a los 9.000 millones del modelo original) que ocupa unos 14,4 GB en el repositorio.

La relevancia de esta ficha radica en su enfoque de despliegue: está diseñado específicamente para inferencia local eficiente en Apple silicon mediante la librería `uzu` y el paquete Homebrew `mirai`, lo que lo convierte en una opción interesante para desarrolladores que trabajan en macOS y necesitan ejecutar un modelo de la familia Qwen 3.5 sin depender de GPUs dedicadas. La cuantización combina rotaciones aleatorias con estructura de Kronecker para reducir valores atípicos en los pesos, y un redondeo ponderado por un sketch de Fisher de la distribución de salida del propio modelo.

No obstante, la información pública disponible es limitada: la model card no detalla la longitud de contexto, los idiomas soportados ni resultados de benchmarks (la evaluación figura como pendiente), y el soporte de inferencia se restringe actualmente a Apple silicon. Cualquier evaluación de producción debe complementarse con la model card del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Qwen/Qwen3.5-9B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 2.784.809.233 (parametros almacenados en safetensors del checkpoint cuantizado) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion con trellis coding estilo QTIP a ~2,5 bits por peso, con bits por matriz seleccionados por ablaciones de KL; tags del repositorio indican 2-bit y 8-bit |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion post-entrenamiento del modelo Qwen/Qwen3.5-9B. La arquitectura subyacente corresponde al transformer del modelo base, cuyos detalles completos (número de capas, dimensiones, mecanismo de atención, contexto nativo) no se reproducen en la información proporcionada y deben consultarse en la model card original de Qwen. El proceso de cuantizacion emplea trellis-coded quantization de estilo QTIP a aproximadamente 2,5 bits por peso, con la asignación de bits por matriz determinada mediante ablaciones de KL medidas sobre el propio modelo.

Como innovaciones técnicas destacables, el método aplica rotaciones aleatorias con estructura de Kronecker para mitigar los valores atípicos en los pesos, y pondera el redondeo mediante un sketch de Fisher de la distribución de salida del modelo. El checkpoint se preparó con cuantizacion post-entrenamiento seguida de destilación consciente de cuantizacion (quantization-aware distillation) de las escalas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que hereda las capacidades generativas del modelo base Qwen3.5-9B.
- Razonamiento y matemáticas: capacidades heredadas del modelo base; no se detallan evaluaciones específicas en la información disponible.
- Generación de código: capacidad esperable por herencia del modelo base, aunque no se documenta explícitamente en la model card del checkpoint cuantizado.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no documentadas en la información proporcionada.
- Inferencia local en Apple silicon: capacidad operativa destacada del checkpoint, ejecutable mediante la CLI `mirai`.

## Casos de uso

- Inferencia local en Mac para prototipado de aplicaciones de texto: el checkpoint está optimizado para Apple silicon y se instala con `brew install mirai` seguido de `mirai --model trymirai/Qwen3.5-9B-S`, lo que permite probar un modelo de la familia Qwen 3.5 sin GPU dedicada ni infraestructura en la nube.
- Asistentes de escritorio y herramientas CLI en macOS: al ejecutarse de forma nativa en el equipo del desarrollador, encaja en utilidades de línea de comandos que requieren generación de texto sin enviar datos a servicios externos.
- Desarrollo y depuración de pipelines de cuantización: sirve como referencia práctica para ingenieros que quieran estudiar el efecto de la cuantización QTIP a ~2,5 bits y la destilación consciente de cuantización sobre un modelo de 9.000 millones de parámetros.
- Evaluación comparativa de calidad bajo cuantización agresiva: útil para medir la degradación de calidad frente al modelo base Qwen3.5-9B en tareas de generación de texto, siempre que se complemente con evaluaciones propias dado que la evaluación del autor figura como pendiente.
- Educación e investigación en técnicas de compresión: el método (rotaciones de Kronecker, sketch de Fisher, ablaciones de KL) es un caso de estudio reproducible para cursos y artículos sobre cuantización de LLM.
- Despliegue en entornos con restricciones de memoria: con aproximadamente 14,4 GB de pesos, permite alojar un modelo derivado de 9B en equipos con memoria unificada limitada, algo inviable con los pesos en precisión completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una gráfica de evaluación (KL frente a tamaño) marcada como "Evaluation pending", por lo que no existen cifras verificables de MMLU, HumanEval, GSM8K ni de otras tareas en el momento de redactar esta ficha.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos del checkpoint suman aproximadamente 14,4 GB en el repositorio; se requiere memoria unificada suficiente para alojar los pesos más el overhead de inferencia (no se especifica la cifra exacta de overhead en la información disponible).
- GPU recomendadas: no aplica según la información disponible; el soporte actual es exclusivamente para Apple silicon.
- Compatibilidad con GPU de consumo: el autor indica que solo se soporta inferencia en Apple silicon; no se documenta compatibilidad con GPUs NVIDIA (RTX 4090, A100, H100) ni con hardware x86.
- Opciones de despliegue: CLI `mirai` (instalable vía Homebrew en macOS) y la librería `uzu`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros almacenados | Bits por peso | Contexto | Licencia | Plataforma de inferencia |
|---|---|---|---|---|---|
| trymirai/Qwen3.5-9B-S | ~2,78 B (checkpoint cuantizado) | ~2,5 | No disponible | Apache 2.0 | Apple silicon (`uzu`/`mirai`) |
| Qwen/Qwen3.5-9B (base) | ~9 B (no confirmado en la informacion) | 16 (BF16, asumido) | No disponible | Apache 2.0 | Multiples frameworks |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | No disponible | 4-8 tipico | No disponible | Segun autor | llama.cpp, vLLM, etc. |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada; la comparación se limita a parámetros, licencia y plataforma de ejecución.

## Limitaciones y advertencias

- La cuantización a ~2,5 bits por peso implica una pérdida de calidad respecto al modelo base; el autor no ha publicado aún evaluaciones que cuantifiquen esa degradación ("Evaluation pending").
- El soporte de inferencia está restringido a Apple silicon; no hay evidencia de funcionamiento en GPUs NVIDIA, AMD ni en CPU x86 a través de los frameworks habituales.
- No se documentan los idiomas soportados, la longitud de contexto efectiva ni el comportamiento multilingüe del checkpoint cuantizado.
- No se documentan capacidades de tool calling, agentes ni modo thinking; no deben asumirse en producción sin verificación empírica.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas de fidelidad para este checkpoint.
- Sesgos: no documentados en la información disponible; deben evaluarse a partir de la model card del modelo base Qwen3.5-9B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (enlazada en la model card) para confirmar compatibilidad.
- El repositorio tiene un volumen de descargas bajo (49) y ningún "like", lo que sugiere poca validación comunitaria; conviene tratarlo como un artefacto experimental.
- La fecha de creación (2026-10-19) y la referencia a Qwen3.5-9B indican que se apoya en un modelo base cuya documentación conviene consultar directamente antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.5-9B-S
- Modelo base Qwen/Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Model card del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/README.md
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de cuantización de Mirai: https://trymirai.com/blog/quantization
- Guía de compilación desde fuente de `uzu`: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
