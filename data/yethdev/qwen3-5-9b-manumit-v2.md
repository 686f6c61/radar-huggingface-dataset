# yethdev/qwen3.5-9b-manumit-v2

## Resumen

yethdev/qwen3.5-9b-manumit-v2 es un fine-tune del modelo Qwen3.5-9B de Alibaba, desarrollado por el usuario yethdev, cuyo objetivo es eliminar por completo el comportamiento de rechazo (refusal) del modelo original. La técnica empleada, denominada "manumit", identifica el subespacio de direcciones en el flujo residual que codifican el rechazo, lo proyecta fuera de los pesos y posteriormente "cura" el modelo con datos ordinarios para minimizar la pérdida de capacidad. El resultado es un modelo que responde a prácticamente cualquier petición, con una tasa de rechazo del 0,0% en conjuntos de prueba como AdvBench y JailbreakBench, a costa de una caída de 2,8 puntos en MMLU-Pro (48,2% frente al 51,0% del base).

El modelo conserva la arquitectura del Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parámetros, con una ventana de contexto de 262K tokens heredada del base (aunque no se confirma explícitamente en la model card). Está disponible en formato safetensors y existe una versión GGUF preview para inferencia local. La licencia es MIT, pero el modelo base Qwen3.5-9B mantiene sus propios términos, por lo que cualquier uso debe cumplir ambas condiciones.

Este modelo es relevante para la comunidad de investigación en seguridad y alineación de IA, así como para desarrolladores que necesitan un modelo sin capas de rechazo para aplicaciones donde el control del contenido recae enteramente en el usuario. No obstante, al carecer de cualquier mecanismo de seguridad, su uso conlleva responsabilidades legales y éticas importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K (heredado del base, no confirmado en este fine-tune) |
| Tipos de cuantizacion | No especificados en la model card; existe una versión GGUF preview |
| Idiomas soportados | No disponibles |
| Licencia | MIT (con términos adicionales del modelo base Qwen3.5-9B) |
| Formato de pesos | safetensors (también GGUF preview) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso multimodal (imagen, video y texto) con 9,4B parámetros y una ventana de contexto de 262K tokens. El fine-tune "manumit v2" aplica una técnica de ablación dirigida: en lugar de eliminar un único vector de rechazo (como hacen herramientas de un solo paso), identifica un subespacio completo de direcciones en el residual stream que transportan la señal de rechazo y las proyecta fuera de los pesos. Posteriormente, el modelo se "cura" reentrenándolo con datos ordinarios para recuperar parte de la capacidad perdida por la ablación.

No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset de curación ni si se emplearon técnicas de RLHF o DPO. La model card indica que la pérdida de habilidad medida en MMLU-Pro es de 2,8 puntos (48,2% frente al 51,0% del base), lo que sugiere que la curación no compensa completamente el coste de la ablación. Tampoco se especifica si el fine-tune conserva las capacidades multimodales del base, aunque el pipeline declarado es text-generation.

## Capacidades

- Generación de texto sin rechazo: responde a peticiones que el modelo base rechazaría, con una tasa de rechazo del 0,0% en AdvBench y JailbreakBench.
- Razonamiento y resolución de problemas: conserva la mayor parte de la capacidad del Qwen3.5-9B, incluyendo razonamiento lógico y matemático (MMLU-Pro 48,2%).
- Generación de código: heredada del base, aunque no se proporcionan benchmarks específicos.
- Soporte de tool calling y function calling: no confirmado explícitamente, pero probablemente heredado del base.
- Capacidades multimodales: no confirmadas en este fine-tune; el base soporta imagen y video, pero la model card no lo menciona.
- Modo thinking: el base Qwen3.5-9B incluye un modo de pensamiento que se puede activar; no se indica si este fine-tune lo conserva.

## Casos de uso

- Investigación en seguridad y alineación de IA: el modelo permite estudiar el comportamiento de un LLM sin capas de rechazo, analizar cómo se manifiestan los sesgos o evaluar la eficacia de técnicas de mitigación posteriores.
- Generación de texto creativo sin restricciones: escritura de ficción, poesía o guiones que aborden temas sensibles (violencia, sexualidad, drogas) sin que el modelo se niegue a responder.
- Desarrollo de aplicaciones con control de contenido por parte del usuario: sistemas donde el desarrollador implementa su propia capa de moderación y necesita un modelo que no imponga criterios propios de rechazo.
- Asistentes para dominios especializados: atención al cliente o soporte técnico en áreas como salud, legal o finanzas, donde el base podría rechazar preguntas por considerarlas sensibles, pero el desarrollador quiere gestionar el riesgo con sus propias políticas.
- Generación de código y depuración: uso como asistente de programación en entornos donde el base podría rechazar ciertas peticiones relacionadas con exploits o vulnerabilidades, y el desarrollador necesita respuestas sin filtros para fines educativos o de auditoría.
- Evaluación comparativa de modelos abliterados: sirve como referencia para medir el impacto de la eliminación de rechazo en el rendimiento general, comparándolo con el base y otras variantes.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, medidos por el autor:

| Benchmark | Este modelo | Qwen3.5-9B (base) |
|---|---|---|
| AdvBench refusal | 0,0% | alto |
| JailbreakBench refusal | 0,0% | alto |
| MMLU-Pro (n=500) | 48,2% | 51,0% |

No se han publicado resultados adicionales (HumanEval, GSM8K, etc.) en la información disponible. La caída de 2,8 puntos en MMLU-Pro representa el coste de la ablación que la curación no logró recuperar por completo.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3.5-9B ocupa aproximadamente 6,6 GB en Ollama con cuantización Q4_K_M, lo que permite ejecutarlo en GPUs de 8 GB VRAM. Para este fine-tune, los requisitos son equivalentes.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4090, A100, H100. En cuantización Q4_K_M cabe en una RTX 3060 de 8 GB, aunque con margen limitado.
- Compatibilidad con GPUs de consumo: sí, con cuantización Q4_K_M o inferior en GPUs de 8 GB; con Q6_K o Q8_0 se recomienda al menos 12 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (mediante la versión GGUF), Transformers con `device_map="auto"`, TGI.
- Latencia y throughput: no se han publicado datos específicos para este fine-tune. Como referencia, el base Qwen3.5-9B en una RTX 4090 genera aproximadamente 50-70 tokens/s con cuantización Q4_K_M, pero estos valores dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Refusal | Licencia |
|---|---|---|---|---|---|
| yethdev/qwen3.5-9b-manumit-v2 | 9,4B | 262K (heredado) | 48,2% | 0,0% | MIT |
| Qwen/Qwen3.5-9B (base) | 9,4B | 262K | 51,0% | alto | Apache 2.0 (términos propios) |
| yethdev/qwen3.5-9b-manumit-v1 | 9,4B | no disponible | no disponible | no disponible | MIT |

No se dispone de datos comparativos con otros modelos abliterados de la misma categoría (por ejemplo, Dolphin o WizardLM-uncensored) en la información proporcionada. La comparación con la v1 no es posible por falta de métricas publicadas.

## Limitaciones y advertencias

- Ausencia total de capa de seguridad: el modelo no tiene ningún mecanismo de rechazo ni modelo guardián. El usuario es el único responsable del contenido generado y de su uso legal.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en temas especializados. La eliminación del rechazo no mejora la veracidad.
- Degradación de rendimiento: la ablación reduce MMLU-Pro en 2,8 puntos respecto al base, lo que puede afectar a tareas que requieren razonamiento complejo.
- Sesgos no mitigados: el modelo conserva los sesgos del base, que no han sido corregidos ni evaluados en este fine-tune.
- Capacidades multimodales no confirmadas: aunque el base es multimodal, no se especifica si este fine-tune conserva el procesamiento de imagen y video. Se recomienda verificar antes de usarlo en tareas multimodales.
- Restricciones de licencia: aunque la licencia es MIT, el modelo base Qwen3.5-9B tiene sus propios términos que pueden imponer condiciones adicionales. Es obligatorio revisar ambos documentos antes de cualquier uso comercial.
- Riesgo legal: el uso de un modelo sin rechazo puede violar leyes de contenido, especialmente en la UE (DSA, AI Act) o en jurisdicciones con regulaciones estrictas sobre discurso de odio, incitación a la violencia o contenido ilegal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2
- Versión GGUF preview: https://huggingface.co/yethdev/qwen3.5-9b-manumit-v2-preview-gguf
- Versión v1: https://huggingface.co/yethdev/qwen3.5-9b-manumit-v1
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Guía de configuración para Qwen3.5-9B en 8GB VRAM: https://insiderllm.com/guides/qwen-3-5-9b-setup-guide/
- Página del modelo en Ollama: https://ollama.com/library/qwen3.5:9b
