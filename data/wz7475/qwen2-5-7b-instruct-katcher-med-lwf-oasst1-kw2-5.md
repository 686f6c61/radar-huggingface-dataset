# wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw2.5

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw2.5` es un ajuste fino (fine-tuning) supervisado del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario wz7475 en Hugging Face. Se trata de un derivado del conocido Qwen2.5-7B-Instruct de Alibaba, adaptado mediante SFT (Supervised Fine-Tuning) con la librería TRL y optimizado con Unsloth. El nombre del modelo sugiere una mezcla de datasets orientados a dominio médico ("med"), conversación ("oasst1") y otros conjuntos no especificados en la model card.

La relevancia de esta ficha es limitada: el repositorio no incluye información sobre el dataset de entrenamiento, hiperparámetros, evaluación o licencia. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un experimento personal o un artefacto de investigación sin validación comunitaria. Aun así, al estar construido sobre Qwen2.5-7B-Instruct, hereda las capacidades arquitectónicas del original (transformer denso de 7.000 millones de parámetros con contexto largo), aunque el ajuste fino puede haber modificado su comportamiento de forma no documentada.

Esta ficha se redacta con la información estrictamente disponible en la model card y en los metadatos de Hugging Face. Cualquier dato no presente se marca explícitamente como "no disponible", y no se extrapolan cifras del modelo base salvo cuando se indica claramente que proceden de él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-7B-Instruct; no se detalla en la model card) |
| Parametros totales | 7.000 millones (según el nombre y el modelo base; no verificado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponibles (el modelo base soporta múltiples idiomas, pero no se documenta para este ajuste) |
| Licencia | No disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | Safetensors (repo de 2,8 GB, librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer denso con atención por ventanas deslizantes, RoPE, normalización RMSNorm y activación SwiGLU, con aproximadamente 7.000 millones de parámetros. El ajuste fino se realizó mediante SFT con TRL 1.15.0, Transformers 4.57.6, PyTorch 2.11.0, Datasets 4.8.5 y Tokenizers 0.22.2, según las versiones de framework declaradas en la model card. El uso de Unsloth (presente en los tags) sugiere entrenamiento con optimizaciones de memoria y velocidad, típicamente LoRA o QLoRA, aunque no se especifica el método exacto ni los hiperparámetros.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales. El nombre del modelo apunta a una mezcla de datasets (posiblemente "katcher", "med", "lwf", "oasst1" y "kw2.5"), pero la model card no confirma esta interpretación ni aporta detalles. No se declaran innovaciones técnicas propias; el modelo se limita a reutilizar el pipeline estándar de TRL para SFT.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente reforzado por el ajuste SFT, aunque sin evaluación publicada.
- Posible especialización en dominio médico por el sufijo "med" del nombre, no confirmada en la model card.
- Soporte de tool calling y function calling: no documentado para este ajuste; el modelo base lo soporta, pero no se garantiza tras el fine-tuning.
- Capacidades multilingües: no documentadas para este ajuste; el modelo base soporta múltiples idiomas.
- Modo "thinking" o cadena de razonamiento extendida: no documentado.
- Capacidades de visión o audio: no disponibles (el modelo base es solo texto).

## Casos de uso

- Experimentación académica con SFT: el modelo sirve como ejemplo reproducible de ajuste fino con TRL y Unsloth sobre Qwen2.5-7B-Instruct, útil para estudiar el impacto de mezclas de datasets en el comportamiento final.
- Prototipado de asistentes conversacionales: puede desplegarse con `transformers.pipeline` para generar respuestas multi-turno en entornos de prueba, aunque sin garantías de calidad por falta de evaluación.
- Investigación en dominio médico (si se confirma la especialización): podría emplearse para generar borradores de texto clínico o respuestas a preguntas médicas en entornos controlados, siempre con revisión humana y sin uso clínico real.
- Evaluación comparativa de fine-tunes: útil como línea base para comparar el efecto de distintos datasets SFT sobre el mismo modelo base.
- Generación de texto creativo o de relleno: para tareas de bajo riesgo donde la exactitud no es crítica y se acepta variabilidad en la salida.
- Docencia y demostraciones: para ilustrar el ciclo completo de entrenamiento (SFT con TRL) y despliegue con Hugging Face en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 14-16 GB para los pesos de 7.000 millones de parámetros, más memoria para el KV cache según la longitud de contexto efectiva.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones basadas en el tamaño de parámetros, no verificadas para este ajuste concreto).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues de producción con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16 y contexto moderado; en RTX 4060 Ti 16 GB o RTX 4070 con cuantización 8 bits; en GPUs de 8 GB solo con cuantización 4 bits.
- Opciones de despliegue: transformers (pipeline), vLLM, TGI, llama.cpp u Ollama (estos últimos requieren conversión a GGUF, no publicada en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw2.5 | ~7B (heredado) | No disponible | No disponible | Hugging Face (0 descargas) | Fine-tune SFT sin evaluación publicada |
| Qwen/Qwen2.5-7B-Instruct | 7B | 131.072 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| unsloth/Qwen2.5-7B-Instruct | 7B | 131.072 tokens | Apache 2.0 (heredada) | Hugging Face | Versión optimizada para fine-tuning con Unsloth |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa densa de 7B con contexto menor |

La comparativa se limita a parámetros y disponibilidad porque no hay datos de rendimiento publicados para el modelo ajustado. El modelo base Qwen2.5-7B-Instruct y su variante Unsloth son las referencias naturales; Mistral-7B-Instruct-v0.3 se incluye como alternativa de tamaño similar con licencia permisiva.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar qué sesgos se han introducido ni qué comportamientos se han reforzado.
- Riesgo de alucinación: al ser un fine-tune sin evaluación, no hay garantías sobre la fidelidad de sus respuestas, especialmente en dominio médico si esa especialización existe.
- Licencia no especificada: la model card indica "licence: license", lo que impide determinar si el uso comercial está permitido; hay que contactar al autor o asumir la licencia del modelo base (Apache 2.0) con cautela.
- Idiomas no documentados: no se confirma qué idiomas mantiene tras el ajuste; el rendimiento multilingüe puede haberse degradado.
- Contexto no confirmado: aunque el modelo base soporta 131.072 tokens, el ajuste podría haber reducido la ventana efectiva; no hay datos al respecto.
- Sin validación comunitaria: 0 descargas y 0 likes indican que el modelo no ha sido probado por terceros; no es recomendable para producción sin evaluación propia.
- El nombre del modelo sugiere una mezcla de datasets ("med", "oasst1", etc.) cuya proporción y calidad se desconocen, lo que puede producir comportamientos impredecibles.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw2.5
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Repositorio Unsloth: https://github.com/unslothai/unsloth
