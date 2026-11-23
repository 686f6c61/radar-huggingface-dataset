# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face, en el que se ha aplicado una técnica de *machine unlearning* denominada PDU sobre un fine-tuning previo del modelo base con el dataset TOFU-para. El objetivo no es ofrecer un asistente conversacional de propósito general, sino servir como artefacto experimental para estudiar la diferencia entre "desaprender" muestras concretas (*untraining*) y eliminar el conocimiento subyacente (*unlearning*). Forma parte de la colección TOFU-para, que separa explícitamente ambos conceptos.

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct afinado sobre todo el conjunto TOFU más dos versiones parafraseadas, y le aplica PDU (implementado en la librería open-unlearning de locuslab) para eliminar el conjunto forget10 original (400 pares QA). La relevancia actual radica en que proporciona métricas reproducibles (FADE, TOFU forget quality, model utility) sobre semillas 0-2, lo que permite evaluar empíricamente la calidad del olvido y su coste en utilidad.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros, licencia Llama 3.1 Community License y pesos en safetensors. No es un modelo pensado para despliegue en producción, sino para investigación en privacidad, cumplimiento normativo y evaluación de métodos de olvido selectivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1-8B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; el repo no documenta GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 16.1 GB |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 |
| Dataset de entrenamiento | sungjuncho/TOFU-para |
| Metodo de olvido | PDU (open-unlearning, locuslab) |
| Semilla | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 8.030 millones de parámetros. El proceso de entrenamiento tiene tres etapas encadenadas. Primero, un fine-tuning del modelo instructivo sobre el conjunto TOFU-para completo más dos versiones parafraseadas de cada par QA (el checkpoint `x2-full`). Segundo, la aplicación de PDU sobre ese checkpoint, usando como conjunto forget únicamente los 400 pares QA originales de forget10 y como conjunto retain (para los métodos que lo emplean) retain90 más para1 y para2, en total 10.800 ejemplos.

Los hiperparámetros corresponden a la configuración afinada para 8B del repositorio open-unlearning (community/methods/PDU), sin gradient clipping y con batch efectivo de 32; la configuración exacta está en el directorio `train_config/` del repositorio. La innovación metodológica no está en la arquitectura sino en la separación explícita entre *untraining* (borrar las muestras concretas vistas por el método) y *unlearning* (borrar el conocimiento subyacente que el modelo también aprendió en otras formulaciones), medida mediante FADE, la divergencia KL simétrica frente a modelos de referencia sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado).

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama-3.1-8B-Instruct original, aunque el fine-tuning sobre TOFU y el posterior olvido pueden degradar el comportamiento instructivo general.
- Razonamiento y respuesta a preguntas de formato corto: el modelo fue afinado sobre pares pregunta-respuesta del dataset TOFU.
- Capacidad de *machine unlearning* verificable: el checkpoint está diseñado para ser evaluado con las métricas FADE, forget quality, forget truth ratio, forget Q-A probability, forget Q-A ROUGE y model utility.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (no documentado para este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como punto de comparación frente a otros métodos (Gradient Ascent, NPO, etc.) aplicados sobre el mismo modelo base y el mismo conjunto forget, midiendo FADE y model utility con la misma configuración.
- Auditoría de privacidad y cumplimiento: evaluar si el modelo retiene información de los 400 pares QA de forget10, mediante forget Q-A probability (7,58e-06) y forget truth ratio (0,949), como paso previo a un análisis de derecho al olvido.
- Reproducibilidad experimental: replicar el pipeline completo (fine-tuning sobre TOFU-para, PDU con semilla 0, evaluación FADE) usando el repositorio open-unlearning y el dataset público, comparando con las métricas publicadas en la model card.
- Estudio de la distinción untraining/unlearning: analizar cómo un modelo puede borrar las muestras exactas sin borrar el conocimiento parafraseado, comparando FADE untraining (746,54) frente a FADE unlearning (674,93).
- Evaluación de la degradación de utilidad: medir cuánto se pierde en model utility (0,699) tras el olvido, útil para calibrar el compromiso entre privacidad y rendimiento en pipelines de despliegue.
- Docencia y formación: utilizar el modelo y su model card como ejemplo didáctico de evaluación rigurosa de olvido selectivo, con tablas de resultados por semilla y puntos de referencia ideales.

## Benchmarks y rendimiento

Resultados publicados en la model card para la semilla 0 (este modelo):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 746,54 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 parafrasis) | 674,93 |
| FADE, unlearning (original) | 701,7 |
| FADE, unlearning (para1) | 661,9 |
| FADE, unlearning (para2) | 661,2 |
| TOFU forget quality (vs `x2-retain90-seed0`) | 6,28e-87 |
| Forget truth ratio | 0,949 |
| Forget Q-A probability | 7,58e-06 |
| Forget Q-A ROUGE | 0,019 |
| Model utility | 0,699 |

Comparación entre semillas 0-2:

| Metrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 746,5 | 729,8 | 719,6 | 732,0 ± 13,6 |
| FADE, unlearning | 674,9 | 683,5 | 691,9 | 683,4 ± 8,5 |
| Forget Q-A probability | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| Forget Q-A ROUGE | 0,019 | 0,013 | 0,008 | 0,014 ± 0,006 |
| Forget truth ratio | 0,949 | 0,941 | 0,963 | 0,951 ± 0,012 |
| Model utility | 0,699 | 0,710 | 0,665 | 0,691 ± 0,023 |

Puntos de referencia FADE:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin olvido (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado en la información disponible resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB para contextos moderados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para despliegue cómodo en bfloat16; en consumer, RTX 3090 o RTX 4090 (24 GB) son suficientes para bfloat16 con contexto reducido.
- Cuantización: la model card no documenta variantes GGUF ni AWQ/GPTQ; convertir a 4-bit (por ejemplo, mediante bitsandbytes o llama.cpp) reduciría el requisito a unos 5-6 GB, pero esa conversión no está validada por el autor.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). vLLM, llama.cpp y Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning | Model utility | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (PDU, seed 0) | 8,03B | no disponible | 674,93 | 0,699 | llama3.1 | Hugging Face |
| `x2-full` (sin olvido, partida) | 8,03B | no disponible | 156,3 ± 0,2 | no disponible | llama3.1 | Hugging Face |
| `x2-retain90` (perfect unlearner) | 8,03B | no disponible | 29,8 ± 0,3 | no disponible | llama3.1 | Hugging Face |
| `x2-retain90-forget10para` (perfect untrainer) | 8,03B | no disponible | 136,7 ± 0,4 | no disponible | llama3.1 | Hugging Face |

Nota: FADE es una distancia, no una dirección; un valor intermedio entre dos filas no implica que el modelo se sitúe entre esos dos modelos. Las filas de referencia no son alternativas de propósito general, sino los modelos ideales contra los que se mide el olvido.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como asistente de propósito general; el fine-tuning sobre TOFU y el olvido posterior pueden degradar el comportamiento instructivo original de Llama-3.1-8B-Instruct.
- FADE unlearning alto (674,93 frente a 29,8 del "perfect unlearner"): el modelo sigue siendo fácilmente distinguible del modelo de referencia ideal en el conjunto forget, lo que indica un olvido incompleto.
- FADE untraining muy alto (746,54 frente a 21,4 del "perfect untrainer"): tampoco elimina limpiamente las muestras exactas vistas por el método.
- Riesgo de alucinación: no evaluado en la información proporcionada; el fine-tuning sobre pares QA de TOFU puede favorecer respuestas confiadas sobre hechos ficticios del dataset.
- Sesgos: no documentados en la model card; se heredan los del Llama-3.1-8B-Instruct original, no evaluados aquí.
- Idiomas y contexto: no declarados en la información disponible; no asumir el contexto de 128k de Llama 3.1 sin verificación.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone Meta; revisar el archivo `LICENSE` del repositorio antes de cualquier uso en producción.
- Reproducibilidad: los resultados dependen de la semilla; la model card reporta variación entre semillas (por ejemplo, model utility 0,665-0,710), por lo que un único checkpoint no debe tomarse como representativo del método.
- No apto para producción sin evaluación adicional: no hay datos de benchmarks estándar, latencia ni throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-pdu-seed0
- Modelo base (fine-tuning sobre TOFU-para x2): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
