# taobao-mnn/DeepSeek-R1-7B-Qwen-MNN

## Resumen

DeepSeek-R1-7B-Qwen-MNN es una versión cuantizada del modelo DeepSeek-R1-Distill-Qwen-7B, publicada por el equipo taobao-mnn (vinculado a Alibaba) para su uso con el motor de inferencia MNN. Se trata de un modelo de generación de texto de 7.000 millones de parámetros derivado por destilación del modelo razonador DeepSeek-R1 sobre la base Qwen2.5-Math-7B, y que conserva la característica principal de su antecesor: la emisión explícita de una cadena de pensamiento (thinking) antes de la respuesta final.

El repositorio no contiene los pesos en formato estándar (safetensors o GGUF), sino un artefacto optimizado para MNN con cuantización HQQ de 4 bits por canal en las capas lineales del modelo de lenguaje y en la cabeza de salida, mientras que los embeddings se mantienen en BF16. El objetivo es permitir la ejecución en CPU con un consumo de memoria reducido (configuración por defecto de 4 hilos, `precision=low`, `memory=low`), lo que lo hace relevante para escenarios de despliegue en dispositivos sin GPU dedicada.

Con 28 capas y una dimensión oculta de 3584, el modelo hereda la arquitectura transformer de Qwen2.5 y está orientado a tareas de razonamiento matemático, código y lógica. Su licencia MIT y su soporte para chino e inglés lo sitúan como una opción práctica para integrar razonamiento de tipo R1 en aplicaciones de borde o entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Math-7B), con cadena de pensamiento estilo DeepSeek-R1 |
| Parametros totales | 7B (aproximado, según modelo base DeepSeek-R1-Distill-Qwen-7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | HQQ 4-bit por canal (capas lineales y cabeza de salida); embeddings en BF16; escalas de cuantización en FP16 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

El modelo es una destilación de DeepSeek-R1 sobre Qwen2.5-Math-7B, lo que implica que el alumno (Qwen2.5-Math-7B) fue entrenado para imitar las trayectorias de razonamiento del profesor (DeepSeek-R1). La arquitectura subyacente es un transformer decoder-only con 28 capas y dimensión oculta de 3584, típica de la familia Qwen2.5-7B. La innovación destacable es la capacidad de generar un bloque de pensamiento explícito antes de la respuesta, característica del linaje R1.

El repositorio en sí no documenta el proceso de entrenamiento original (número de tokens, composición del dataset, uso de RLHF o DPO), ya que se trata de una conversión de pesos, no de un entrenamiento nuevo. La contribución técnica del autor es la exportación a MNN con cuantización HQQ 4-bit por canal, manteniendo los embeddings en BF16 para preservar calidad. La verificación realizada el 2026-11-12 en CPU x64 incluyó pruebas de alineación FP32, saludos, aritmética y traducción, todas superadas con la configuración por defecto.

## Capacidades

- Generación de texto con razonamiento explícito: emite una cadena de pensamiento antes de la respuesta final, útil para depurar y auditar el proceso de razonamiento.
- Razonamiento matemático: heredado de la base Qwen2.5-Math-7B, adecuado para resolución de ecuaciones y problemas aritméticos.
- Generación de código: capacidad presente en la familia Qwen2.5, aunque no se detalla en la model card.
- Capacidades multilingües limitadas a chino e inglés según los tags del repositorio.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documentan capacidades de visión ni audio.
- Ejecución en CPU mediante MNN con configuración de bajo consumo de memoria.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede mostrar el paso a paso de una ecuación (por ejemplo, `2x + 3 = 11`) gracias a su cadena de pensamiento, lo que permite usarlo como tutor que explica el razonamiento y no solo el resultado.
- Asistente de razonamiento en dispositivos de borde: al ejecutarse en CPU con MNN y cuantización 4-bit, puede desplegarse en portátiles o servidores sin GPU para tareas de lógica y cálculo donde no se requiere latencia extrema.
- Generación de explicaciones técnicas en chino e inglés: útil para documentación bilingüe o soporte interno donde se necesita justificar una conclusión paso a paso.
- Prototipado de pipelines de razonamiento: investigadores pueden usar la salida de pensamiento para analizar cómo el modelo llega a una respuesta y comparar con otros distillados de R1.
- Traducción asistida con verificación: la prueba de traducción incluida en la validación sugiere uso para traducción simple entre chino e inglés con razonamiento intermedio.
- Integración en aplicaciones móviles o embebidas vía MNN: el formato y la configuración de bajo consumo permiten incorporar el modelo en apps que ya usan el runtime MNN de Alibaba.
- Filtrado y verificación de cálculos en backoffice: para comprobar resultados aritméticos en flujos internos donde se prioriza la trazabilidad del razonamiento sobre la velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de humo (alineación FP32, saludos, aritmética y traducción) realizadas el 2026-11-12 en CPU x64, sin métricas cuantitativas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el modelo está optimizado para CPU. El repositorio ocupa 8,2 GB, aunque la cuantización HQQ 4-bit reduce el peso en memoria en tiempo de ejecución (cifra exacta no disponible).
- GPU recomendadas: no se documentan; el diseño apunta a ejecución en CPU.
- Cabe en GPU consumer: no se especifica, pero al estar en formato MNN no es directamente compatible con runtimes GPU estándar como CUDA sin conversión.
- Opciones de despliegue: MNN (versión 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración por defecto es CPU, 4 hilos, `precision=low`, `memory=low`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-7B-Qwen-MNN (este) | 7B | No disponible | MNN (HQQ 4-bit) | MIT | Hugging Face, ModelScope |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | No disponible en esta ficha | Safetensors (original) | MIT (según upstream) | Hugging Face |
| Qwen2.5-Math-7B | 7B | No disponible en esta ficha | Safetensors | No disponible en esta ficha | Hugging Face |

La comparativa se limita a los modelos citados en la información proporcionada; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sesgos: no documentados en la model card; al derivar de Qwen2.5 y DeepSeek-R1, puede heredar sesgos de sus datasets de entrenamiento, no cuantificados aquí.
- Riesgo de alucinación: presente en modelos de razonamiento; la cadena de pensamiento puede contener pasos plausibles pero incorrectos, por lo que conviene verificar resultados matemáticos y factuales.
- Limitaciones de idioma: solo chino e inglés según los tags; no se garantiza calidad en castellano ni otros idiomas.
- Longitud de contexto: no especificada; no se debe asumir la ventana de Qwen2.5 sin confirmación.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero se recomienda revisar la licencia del modelo base upstream por posibles condiciones adicionales.
- Formato propietario: los pesos están en formato MNN, no en safetensors ni GGUF, lo que limita su uso a ese runtime y complica la integración con herramientas estándar.
- Sin soporte documentado de tool calling ni agentes: no apto para pipelines que requieran function calling sin trabajo adicional.
- Repositorio con 0 likes y 476 descargas: comunidad reducida, menor soporte y validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/DeepSeek-R1-7B-Qwen-MNN
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- ModelScope: https://modelscope.cn/models/MNN/DeepSeek-R1-7B-Qwen-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
