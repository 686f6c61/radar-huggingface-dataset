# wangzhang/Qwen3.8-27B-abliteratex

## Resumen

Qwen3.8-27B Abliteratex es un derivado del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario wangzhang, que suprime el comportamiento de rechazo (refusal) del modelo base mediante un pipeline iterativo de auto-destilación LoRA. A diferencia de las técnicas clásicas de ablación direccional, que fallan en este modelo porque los rechazos se re-derivan durante la generación, este método entrena al modelo para imitar sus propias respuestas conformes, manteniendo un anclaje KL sobre prompts benignos para no alterar el comportamiento ordinario.

El resultado es un merge completo en BF16, sin adaptadores, con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), compatible con transformers, vLLM y SGLang. El modelo está pensado exclusivamente para investigación en seguridad, red-teaming y evaluación de alineación, y su licencia Apache 2.0 permite uso comercial, aunque con advertencias éticas explícitas. En la evaluación publicada, reduce los rechazos de 100/100 a 19/100 en un conjunto de 100 prompts dañinos, con una divergencia KL de 0,0069 nats/token respecto al base en prompts benignos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.8, basada en Qwen3.5) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredado del modelo base, segun fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | No especificados; pesos en BF16, cuantizable con GPTQ, AWQ o GGUF |
| Idiomas soportados | No especificados; el modelo base Qwen3.8-27B soporta multiples idiomas (no confirmado para este derivado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27B parametros con ventana de contexto de 262K tokens, lanzado por Qwen en agosto de 2026. Sobre este base, el autor aplica un metodo de auto-destilacion LoRA iterativa, disenado especificamente porque la ablacion direccional clasica no funciona: los rechazos no estan codificados en una direccion fija del residual stream, sino que se re-derivan durante la generacion.

El proceso consta de 10 rondas. En cada ronda se genera un conjunto de entrenamiento mediante rejection sampling sobre 800 prompts dañinos, filtrando las respuestas para que sean sustanciales (≥45 palabras, ≥3 pasos concretos, sin rechazos blandos). Se entrena un LoRA de rango 32 sobre las proyecciones q, k, v, o y down, con un termino de anclaje KL (peso 20) sobre prompts benignos para preservar el comportamiento ordinario. Tras evaluar varias escalas del LoRA, se selecciona la mejor y se usa como profesor para la siguiente ronda. La ronda 9, con escala 1.3, fue la elegida para el merge final, ya que la ronda 10 no mejoro los resultados.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-27B.
- Razonamiento y resolucion de problemas, incluyendo tareas de codigo y matematicas, segun las capacidades del base.
- Soporte de tool calling y uso de agentes, probablemente heredado del base (no documentado explicitamente en la model card).
- Capacidades multilingues, presumiblemente similares al base, aunque no confirmadas.
- Comportamiento de rechazo significativamente reducido: responde a solicitudes dañinas o eticas con mucha mayor frecuencia que el modelo base.
- No se documentan capacidades de vision en este derivado, aunque el modelo base Qwen3.8-27B es un VLM; se recomienda verificar si el merge conserva el procesamiento de imagenes.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar como se comportan los LLM cuando se elimina el rechazo, facilitando el analisis de mecanismos de alineacion y la identificacion de vulnerabilidades residuales.
- Red-teaming de sistemas de IA: util para probar defensas de moderacion de contenido, ya que genera respuestas dañinas con mayor facilidad que el base, exponiendo fallos en los filtros.
- Evaluacion de robustez de alineacion: permite medir la eficacia de tecnicas de anclaje KL y auto-destilacion para preservar el comportamiento benigno mientras se modifica el rechazo.
- Estudio de mecanismos de refusal en modelos de razonamiento politico: el modelo es un caso de estudio de como los rechazos se re-derivan durante la generacion, informando futuras tecnicas de interpretabilidad.
- Generacion de texto general en entornos controlados: puede usarse como modelo de lenguaje estandar en aplicaciones donde el riesgo de contenido dañino sea aceptable y se apliquen filtros externos.
- Desarrollo de tecnicas de "abliteration" mejoradas: sirve como punto de referencia para comparar metodos de supresion de rechazo basados en destilacion frente a ablacion direccional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada en la model card es la siguiente:

| Metrica | Valor |
|---|---|
| Rechazos (juez LLM, 100 prompts dañinos) | 19 / 100 |
| Divergencia KL vs. base (prompts benignos) | 0,0069 nats/token |

Esta evaluacion se realizo con 100 prompts dañinos y 100 benignos, disjuntos del conjunto de entrenamiento, y los rechazos fueron juzgados por google/gemini-3-flash-preview. No hay datos de rendimiento en tareas de conocimiento, razonamiento o codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, el modelo ocupa aproximadamente 53,8 GB (tamano del repo), por lo que se necesitan al menos 54 GB de VRAM. Con cuantizacion de 8 bits, unos 27 GB; con 4 bits, unos 14 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples RTX 4090 (24 GB cada una) en paralelo para BF16. Con cuantizacion 4 bits, cabe en una sola RTX 4090 o RTX 3090.
- En consumer GPU: si, con cuantizacion (por ejemplo, GGUF Q4_K_M) en una RTX 4090 o similar.
- Opciones de despliegue: transformers (con device_map="auto"), vLLM, SGLang, llama.cpp (tras conversion a GGUF), Ollama (si se convierte).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantizacion. En una A100 80GB con BF16, se espera un throughput de decodificacion de varios cientos de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

La comparacion principal es con el modelo base Qwen3.8-27B, del cual deriva. No se dispone de datos de otros modelos abliterados de tamano similar para comparar directamente.

| Modelo | Parametros | Contexto | Rechazos (100 prompts dañinos) | KL vs. base | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | ~27B | 262K | 100/100 (segun la model card) | 0 | Apache 2.0 |
| Qwen3.8-27B Abliteratex | ~26,9B | 262K (heredado) | 19/100 | 0,0069 | Apache 2.0 |

No se han encontrado otros modelos comparables con la misma tecnica y tamano en la informacion disponible.

## Limitaciones y advertencias

- El modelo tiene el rechazo sustancialmente reducido: respondera a solicitudes dañinas, eticas o peligrosas con mucha mayor frecuencia que el base. Esto lo hace inadecuado para uso en produccion sin filtros externos rigurosos.
- Aun conserva rechazos residuales (19/100 en el conjunto de evaluacion), y el comportamiento puede variar fuera de los prompts evaluados.
- No se han publicado benchmarks de rendimiento general; las capacidades de razonamiento, codigo y conocimiento se heredan del base, pero no estan verificadas en este derivado.
- La model card no documenta capacidades de vision, aunque el base es un VLM; es posible que el merge no conserve el procesamiento de imagenes.
- El uso esta restringido a investigacion en seguridad, red-teaming y evaluacion; el autor declina toda responsabilidad por usos indebidos.
- La licencia Apache 2.0 permite uso comercial, pero el aviso de uso responsable recomienda no emplearlo para producir contenido dañino o con fines ilegales.
- No hay informacion sobre sesgos especificos del modelo, aunque al ser un fine-tuning sobre Qwen3.8-27B, hereda los sesgos del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/Qwen3.8-27B-abliteratex
- Repositorio de la herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de Qwen3.8-27B (fuente externa): https://lovableapp.org/blog/qwen3-8-27b
- Benchmarks y especificaciones de Qwen3.8-27B: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Informacion de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
