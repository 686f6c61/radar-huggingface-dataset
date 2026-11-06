# SZLHOLDINGS/SZL-Nemotron-Mini-4B-Doctrine-v1

## Resumen

SZL-Nemotron-Mini-4B-Doctrine-v1 es un ajuste fino (finetune) del modelo SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st, publicado por el usuario SZLHOLDINGS bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 4.190.509.056 parámetros (aproximadamente 4,19 mil millones), derivado de la familia Nemotron Mini de NVIDIA, orientado a tareas conversacionales en inglés. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, lo que según el autor permitió un entrenamiento el doble de rápido.

La model card es extremadamente escasa: no documenta la composición del dataset de ajuste, el número de tokens de entrenamiento, ni las técnicas de alineación empleadas (RLHF, DPO, etc.). El nombre "Doctrine" sugiere un ajuste orientado a un dominio o estilo conversacional concreto, pero el autor no lo especifica. El modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.

Su relevancia es limitada por ahora: se trata de un derivado comunitario de un modelo base pequeño (4B) con licencia permisiva, lo que lo hace potencialmente útil para despliegues en hardware de consumo, pero la ausencia de benchmarks, de documentación del dataset y de cualquier evaluación publicada impide recomendarlo para producción sin una validación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Nemotron Mini; detalles no disponibles) |
| Parametros totales | 4.190.509.056 (~4,19 B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors en transformers, admite cuantización estándar (GPTQ, AWQ, bitsandbytes, GGUF) mediante herramientas externas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st, que a su vez deriva de la familia Nemotron Mini de NVIDIA. La arquitectura es, por tanto, un transformer decoder-only de aproximadamente 4,19 mil millones de parámetros. No se dispone de información sobre el número de capas, dimensiones ocultas, mecanismos de atención (MHA, GQA, MLA) ni sobre la longitud de contexto nativa, ya que la model card no incluye detalles arquitectónicos y el autor no los documenta.

En cuanto al entrenamiento, la única información disponible es que se utilizó Unsloth junto con TRL de Hugging Face, lo que sugiere un ajuste fino supervisado (SFT) o posiblemente DPO/ORPO sobre el modelo base. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Nemotron-Mini-4B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones, sujeto a la calidad del ajuste fino no documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Nemotron Mini sí lo soporta según la documentación de NVIDIA, pero no se confirma en este derivado).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con text-generation-inference y endpoints compatibles (según los tags del repositorio).

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: al ser un modelo de 4B con licencia Apache 2.0, permite iterar en local con cuantización de 4 bits en una GPU de consumo, sin costes de licencia ni dependencias de API externas.
- Fine-tuning adicional sobre dominios específicos: su tamaño reducido y su licencia permisiva lo hacen adecuado como punto de partida para ajustes con Unsloth o TRL en datasets propios, con requisitos de VRAM moderados (una RTX 4090 de 24 GB es suficiente para LoRA en 4B).
- Despliegue en entornos con restricciones de hardware: puede servirse con llama.cpp u Ollama en formato GGUF cuantizado (Q4_K_M ~2,5 GB), lo que permite ejecución en portátiles con GPU integrada o en CPU.
- Generación de texto en pipelines de CI/CD para pruebas: su licencia Apache 2.0 y su compatibilidad con text-generation-inference permiten integrarlo en tests automatizados de calidad de respuestas sin coste por token.
- Investigación sobre ajuste fino y alineación: sirve como caso de estudio de un finetune comunitario con Unsloth, útil para comparar metodologías de entrenamiento rápido frente a ajustes convencionales.
- Chatbots internos de baja latencia: con 4B parámetros y despliegue en vLLM o TGI, la latencia por token es baja incluso en GPUs de gama media (por ejemplo, una RTX 4090 o una L4), adecuada para asistentes de soporte interno en inglés.
- Evaluación comparativa de derivados de Nemotron Mini: permite medir el impacto de un ajuste fino adicional sobre el modelo base Instruct en tareas conversacionales, siempre que se realice una evaluación propia dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,4 GB solo para pesos, más overhead de KV cache y activaciones; se recomienda un mínimo de 12 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: ~4,5-5 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~2,5-3 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S, RTX 4090 (24 GB) o RTX A6000.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización 4 bits, en RTX 3060 12 GB, RTX 4060 Ti 16 GB e incluso GPUs con 8 GB.
- Despliegue: compatible con transformers, text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama (previa conversión a GGUF); el tag `unsloth` indica compatibilidad con el ecosistema Unsloth para fine-tuning.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo denso de 4B en una RTX 4090 se puede esperar un throughput del orden de decenas de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| SZL-Nemotron-Mini-4B-Doctrine-v1 | ~4,19 B | No disponible | Apache 2.0 | Inglés | No |
| SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st (modelo base) | ~4,19 B | No disponible | No disponible | Inglés | No disponible en la información |
| Microsoft Phi-3-mini | ~3,8 B | 4K/128K (según variante) | MIT | Multilingüe | Sí (MMLU, HumanEval, GSM8K) |
| Qwen2.5-3B-Instruct | ~3,1 B | 32K | Apache 2.0 | Multilingüe (incluye español) | Sí (MMLU, HumanEval, GSM8K) |

La comparativa con Phi-3-mini y Qwen2.5-3B-Instruct se ofrece como referencia de categoría (modelos densos de 3-4B con licencia permisiva); no se dispone de datos de rendimiento de SZL-Nemotron-Mini-4B-Doctrine-v1 para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de ajuste fino: se desconoce qué datos se usaron, si hubo filtrado de calidad o si el ajuste introduce sesgos específicos de dominio.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia objetiva de rendimiento en MMLU, HumanEval, GSM8K ni en tareas conversacionales.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros, especialmente en tareas de razonamiento complejo, matemáticas y hechos verificables; la falta de evaluación agrava la incertidumbre.
- Limitación idiomática: solo inglés declarado; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificar empíricamente el límite efectivo.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar que el modelo base (Nemotron-Mini-4B-Instruct-st) y los datos de entrenamiento no impongan restricciones adicionales; la model card no detalla la procedencia de los datos de ajuste.
- Modelo sin tracción comunitaria (0 descargas, 0 likes): no ha sido validado por terceros, por lo que se recomienda una evaluación propia exhaustiva antes de cualquier uso en producción.
- El nombre "Doctrine" sugiere un sesgo hacia un estilo o dominio concreto no documentado, lo que puede desviar las respuestas respecto al comportamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Doctrine-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de text-generation-inference: https://github.com/huggingface/text-generation-inference
