# Stage-org/4b-diversity-LH-300-nyshot-27b-z-epoch3

## Resumen

Stage-org/4b-diversity-LH-300-nyshot-27b-z-epoch3 es un checkpoint de investigación publicado por la organización Stage-org en HuggingFace. Se trata de un ajuste por aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-4B, con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) y pesos en safetensors que ocupan 9,1 GB en el repositorio. La etiqueta de arquitectura declarada es qwen3_5 y no hay indicios de que sea un modelo de mezcla de expertos (MoE), por lo que se trata de un transformer denso heredado del modelo base.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio no incluye licencia, idiomas soportados, pipeline declarado ni una model card convencional. Lo único disponible es un bloque autogenerado de procedencia de entrenamiento ("Training provenance") que documenta el comando y el fichero de configuración TOML del entrenamiento. El nombre del checkpoint sugiere una campaña de experimentación sobre diversidad de generación ("4b-diversity", "LH-300", "nyshot-27b", "epoch3"), pero el autor no explica esas siglas.

El modelo se entrenó con RL a lo largo de 10.000 pasos de learner y 3 épocas, con batch de 128, secuencias de hasta 300.000 tokens en entrenamiento y un juez automático basado en un modelo propietario externo (identificado como gpt-5.6-luna) para puntuar las respuestas generadas. Es, por tanto, un artefacto de investigación reproducible a nivel de configuración, no un modelo listo para producción: acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen/Qwen3.5-4B (etiqueta `qwen3_5`); número de capas, cabezas y vocabulario no disponibles |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | No aplicable: no hay evidencia de arquitectura MoE en la informacion disponible |
| Longitud de contexto | 65.536 tokens (`max_model_len` de la configuracion de inferencia); la configuracion de entrenamiento usa `seq_len` de 300.000 tokens |
| Tipos de cuantizacion | No disponible. No se publican variantes GGUF, AWQ ni GPTQ; el repositorio contiene safetensors en precision de 16 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`weights_only = true`), ~9,1 GB (coherente con 16 bits por parametro) |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen/Qwen3.5-4B, un transformer decoder denso de aproximadamente 4B parámetros. La configuración de entrenamiento fuerza `flash_attention_2` como implementación de atención y `language_model_only = true`, lo que indica que en el pipeline de RL solo se entrenó la torre de lenguaje (sin cabezas multimodales, si el modelo base las tuviera). El método declarado es RL (`method = "rl"`) sobre un dataset propio identificado como `Stage-org/4b-diversity-LH-300-nyshot-27b-z`, con tipo `new_task` y split `train`. No se especifica el número de tokens del dataset ni su composición.

El bucle de entrenamiento usa el framework `prime_rl` con generación en vLLM (puerto 7000, `gpu_memory_utilization = 0.9`) y 2 GPUs por nodo (1 dedicada a inferencia y 1 a entrenamiento). Los hiperparámetros relevantes son: AdamW con `lr = 1e-6`, `weight_decay = 0.0`, `max_norm = 1.0`, betas 0.9/0.99; loss con enmascarado tipo DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`, `adv_tau = 1.0`, `kl_tau = 0.001`); `group_size = 8`; 10.000 pasos de learner; 3 épocas; semilla 7. La generación de rollouts emplea temperatura 0.9, top_p 1.0, `max_tokens = 4096` y `enable_thinking = true`. La recompensa proviene de un juez automático (`open_ended_judge`) servido vía API con `reasoning_effort = "medium"`, `max_retries = 3` y hasta 32 peticiones en vuelo; no se documenta ninguna fase de SFT, DPO ni RLHF con anotadores humanos.

Como innovaciones técnicas destacables, el pipeline incorpora decodificación con *thinking mode* activado por defecto, parsers específicos de razonamiento y de tool calling (`reasoning_parser = "qwen3"`, `tool_call_parser = "qwen3_coder"`) y un orquestador con hasta 256 rollouts en vuelo y un máximo de 8 pasos fuera de política (`max_off_policy_steps = 8`). No se documenta ninguna innovación arquitectónica propia: los cambios son de post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado en la configuración de muestreo (`enable_thinking = true`), con hasta 4.096 tokens de generación por turno según la config de RL.
- Soporte de tool calling / function calling, evidenciado por el parser `qwen3_coder` configurado en el servidor de inferencia.
- Procesamiento de contextos largos: la inferencia está configurada para 65.536 tokens, y el entrenamiento declaró secuencias de hasta 300.000 tokens (esta última cifra no está validada como ventana efectiva en inferencia).
- Capacidades multilingües: no disponibles; no hay lista de idiomas en la información proporcionada.
- Capacidades de agente multi-paso: el pipeline de RL usa orquestación con múltiples rollouts y pasos fuera de política, lo que sugiere entrenamiento orientado a tareas de varios turnos, aunque el autor no lo documenta explícitamente.
- Visión, audio u otras modalidades: no disponibles (la inferencia se restringe a `language_model_only`).

## Casos de uso

- Experimentación en investigación sobre RL y diversidad de generación: el checkpoint es útil como punto de partida o de comparación en estudios que reproduzcan el pipeline `prime_rl` con recompensa de juez automático, dado que se publica la configuración TOML completa.
- Evaluación de *reward hacking* y calibración de jueces: al haberse optimizado contra un juez externo (gpt-5.6-luna), sirve para medir hasta qué punto un modelo de 4,5B se ajusta al estilo y sesgos de un evaluador concreto.
- Generación de código asistida por herramientas: gracias al parser de tool calling `qwen3_coder`, puede integrarse en entornos que expongan funciones (ejecutar tests, consultar APIs) y encadenar llamadas dentro de un bucle de agente.
- Procesamiento de documentos largos en una sola pasada: con 65.536 tokens de ventana configurada, permite resumir o extraer información de contratos, informes o expedientes extensos sin troceado agresivo.
- Asistente conversacional multi-turno en prototipos internos: el modo thinking y la ventana amplia permiten mantener contexto de conversación largo, siempre que se acepte la ausencia de licencia explícita y de garantías de calidad.
- Base para *fine-tuning* adicional: al ser un modelo denso de 4,5B en safetensors, se puede reentrenar con LoRA o QLoRA en una sola GPU de 24 GB para dominios verticales, usando este checkpoint como semilla con comportamiento ya alineado por RL.
- Análisis comparativo de estrategias de enmascarado DPPO: los valores `dppo_mask_low`/`dppo_mask_high` y `kl_tau` quedan documentados, lo que facilita reproducir y contrastar curvas de entrenamiento en trabajos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la búsqueda web realizada no devolvió documentación técnica asociada al modelo (los resultados obtenidos corresponden a portales de ofertas de prácticas y no guardan relación con el proyecto).

## Requisitos de hardware

- VRAM para inferencia en 16 bits: los pesos ocupan aproximadamente 9,1 GB, por lo que se necesitan al menos 12 GB de VRAM contando overhead de runtime y una ventana de contexto moderada.
- KV cache: no disponible el dato de capas, cabezas y uso de GQA, por lo que no puede calcularse con precisión el consumo adicional. A 65.536 tokens el KV cache puede añadir varios gigabytes; se recomienda reservar 20-24 GB o más para exprimir la ventana completa.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para contextos largos y despliegue multiusuario. Para una sola petición con contexto medio bastan una RTX 4090 (24 GB) o una RTX 3090 (24 GB).
- GPU de consumo: cabe en RTX 4090/3090 en bf16 con contexto contenido; en RTX 3060 12 GB o similares solo con cuantización a 8 o 4 bits, que no está publicada y habría que generar.
- Despliegue: el pipeline original usa vLLM con `flash_attention_2`, `max_model_len = 65536`, `language_model_only = true` y los parsers `qwen3` y `qwen3_coder`. También es viable SGLang o TGI. Para llama.cpp u Ollama sería necesario convertir los safetensors a GGUF, tarea no realizada por el autor.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus model cards públicas y pueden variar según la revisión consultada; los de este checkpoint son los declarados en su repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stage-org/4b-diversity-LH-300-nyshot-27b-z-epoch3 | 4,54 B | 65.536 tokens en inferencia (300.000 en la config de entrenamiento) | No disponible | Repositorio publico con 0 descargas y 0 likes |
| Qwen/Qwen3.5-4B (modelo base) | ~4 B | No disponible en esta busqueda | No disponible en esta busqueda | Publico en HuggingFace |
| Qwen3-4B | 4,0 B | 32.768 tokens nativos, extensible a 131.072 con YaRN | Apache 2.0 | Publico, con versiones GGUF y cuantizadas de terceros |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | Publico, ampliamente soportado en llama.cpp, vLLM y Ollama |
| Gemma 3 4B IT | ~4 B | 128.000 tokens | Gemma Terms of Use | Publico, con ecosistema de cuantizaciones consolidado |

La diferencia principal frente a las alternativas no está en el tamaño ni en la ventana de contexto, sino en el estado del artefacto: los tres modelos comparables tienen licencia explícita, documentación de capacidades e idiomas, y cuantizaciones mantenidas por la comunidad; este checkpoint carece de todo ello.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial. Además, la licencia del modelo base Qwen/Qwen3.5-4B puede imponer condiciones adicionales que el repositorio no reproduce.
- Model card inexistente como documento: el README solo contiene un bloque autogenerado de procedencia de entrenamiento. No hay descripción de capacidades, idiomas, sesgos ni uso previsto.
- Riesgo elevado de alucinación en tareas factuales: el ajuste es de RL contra un juez automático, sin verificación de veracidad ni datos de SFT documentados, lo que puede primar respuestas que agradan al juez sobre respuestas correctas.
- Sesgos no evaluados: no se han publicado análisis de sesgo de género, raza, religión o ideología, ni de toxicidad.
- Dependencia de un juez propietario y externo: la señal de recompensa proviene de un endpoint de terceros identificado como gpt-5.6-luna, lo que introduce sesgos de estilo, formato y contenido imposibles de auditar desde el repositorio.
- Idiomas no declarados: no puede afirmarse soporte multilingüe ni calidad en castellano; el comportamiento fuera del inglés es desconocido.
- Ventana de contexto ambigua: la configuración de entrenamiento declara `seq_len = 300000`, pero la de inferencia limita `max_model_len` a 65.536. No hay evaluación de degradación más allá de ese límite.
- Artefacto experimental sin tracción: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad y de informes de errores.
- Ausencia de benchmarks: no existe ninguna medición publicada que permita comparar su calidad con el modelo base o con alternativas.
- Nomenclatura opaca: siglas como "LH-300", "nyshot-27b" o "diversity" no están definidas por el autor, lo que dificulta interpretar qué se optimizó realmente.
- No apto para producción sin auditoría previa: no se recomienda su uso en sistemas con usuarios finales sin una evaluación propia de calidad, seguridad y cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stage-org/4b-diversity-LH-300-nyshot-27b-z-epoch3
- Dataset de entrenamiento referenciado en la configuracion: https://huggingface.co/datasets/Stage-org/4b-diversity-LH-300-nyshot-27b-z
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog tecnico, repositorio de codigo o demo: no disponibles. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos eran portales de ofertas de practicas sin relacion con el proyecto).
