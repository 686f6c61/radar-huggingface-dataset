# transformers-community/group-beam-search

## Resumen

`transformers-community/group-beam-search` es un repositorio de generación personalizada (`custom_generate`) para la librería Transformers que reimplementa la funcionalidad de *diverse beam search* (búsqueda por haces agrupada con penalización de diversidad) eliminada en `transformers>=4.56.0`. No se trata de un modelo de lenguaje entrenado desde cero, sino de un artefacto de inferencia que se apoya en los pesos de un modelo base —en este caso `Qwen/Qwen3-0.6B`— y sustituye el bucle de decodificación estándar por una implementación compatible con la API `generate`.

El problema que resuelve es concreto: a partir de la versión 4.56.0 de Transformers, el modo `group_beam_search` dejó de estar disponible en el núcleo de la librería. Este repositorio restaura esa funcionalidad mediante el mecanismo `custom_generate`, que permite cargar código de generación remoto desde el Hub sin modificar la instalación local. Es relevante para equipos que mantienen pipelines de generación con decodificación diversa y necesitan una ruta de migración compatible.

El artefacto incluye pesos en formato safetensors (751.632.384 parámetros, coherentes con Qwen3-0.6B) y un tamaño de repositorio de 1,5 GB. La licencia y los idiomas soportados no están declarados en la información disponible, por lo que deben heredarse del modelo base Qwen3-0.6B, cuya licencia es Apache 2.0 según su propia model card (dato no verificado en esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-0.6B) con bucle de generación personalizado (diverse beam search) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card menciona 4096 para Llama2, no para este modelo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo usa `torch.float16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo nuevo: reutiliza la arquitectura decoder-only de Qwen3-0.6B y aporta un script de generación personalizado que implementa *diverse beam search* tal como se describe en el paper arXiv:1610.02424. La innovación es algorítmica, no de pesos: los haces se dividen en `num_beam_groups` grupos y se aplica una `diversity_penalty` para penalizar candidatos demasiado similares entre grupos, reduciendo la redundancia en las salidas.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de RLHF/DPO específicos de este artefacto, porque no se ha realizado entrenamiento adicional. La model card menciona que las logits se posprocesan con *DoLa contrastive scoring* antes de la selección de token, si bien esta afirmación aparece en la sección "Output Type changes" y conviene verificarla contra el código del repositorio antes de usarla en producción.

## Capacidades

- Generación de texto autoregresiva con decodificación *diverse beam search* configurable mediante `num_beams`, `num_beam_groups` y `diversity_penalty`.
- Producción de múltiples candidatos diversos por prompt (`num_return_sequences`), útil para ranking posterior o selección por *reward model*.
- Compatibilidad con la API `generate` estándar de Transformers (`outputs` mantiene el mismo formato).
- Control de repetición mediante `repetition_penalty` (valor recomendado 1.2 en la model card).
- Control de parada con `early_stopping` y `max_length`.
- Compatible con modelos transformer decoder-only en general, no solo con Qwen3-0.6B.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo *thinking* en la información disponible.

## Casos de uso

- **Generación de múltiples candidatos para ranking**: usar `num_return_sequences` alto con `diversity_penalty` para obtener N respuestas distintas por prompt y seleccionar la mejor con un *reward model* o un juez LLM. La diversidad reduce el sesgo hacia la respuesta más probable.
- **Sistemas de recomendación de texto**: generar varias variantes de un mismo copy (asunto de email, titular, descripción de producto) en una sola pasada y filtrar por reglas de negocio o A/B testing.
- **Migración desde Transformers <4.56.0**: equipos que dependían de `group_beam_search` y han actualizado la librería pueden cargar este `custom_generate` para restaurar el comportamiento sin hacer *downgrade*.
- **Investigación en decodificación**: banco de pruebas reproducible para comparar *diverse beam search* frente a *sampling*, *beam search* estándar o *contrastive search* con el mismo modelo base.
- **Generación de datos sintéticos diversos**: producir pares prompt-respuesta variados para *fine-tuning* o evaluación, aprovechando la penalización de diversidad para evitar duplicados semánticos.
- **Prototipado en hardware modesto**: con 751 M de parámetros, el modelo base cabe en GPUs de consumo (ver sección de hardware) y permite iterar sobre estrategias de decodificación sin coste elevado.
- **Traducción o paráfrasis con múltiples salidas**: útil cuando se quiere ofrecer al usuario varias reformulaciones y este elige, aunque la calidad multilingüe depende del modelo base y no está documentada aquí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 751 M de parámetros, en FP16 se requieren aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de contexto y número de haces. En cuantización de 8 bits, alrededor de 1 GB de pesos; en 4 bits, en torno a 0,5 GB (estimaciones teóricas, no verificadas en la model card).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM es suficiente para FP16 con contexto moderado. Una RTX 3060, RTX 4060 o superior debería bastar. Para *throughput* alto, A10G, L4 o A100.
- **Cabe en GPU de consumo**: sí, en la mayoría de GPUs consumer modernas con 8 GB o más.
- **Opciones de despliegue**: el artefacto está pensado para `transformers` con `custom_generate` y `trust_remote_code=True`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; de hecho, `text-generation-inference` aparece como tag pero el mecanismo `custom_generate` no es estándar en TGI, por lo que conviene verificar antes de desplegar.
- **Latencia y throughput**: no disponibles. *Diverse beam search* es computacionalmente más caro que *greedy* o *sampling*: el coste escala con `num_beams` y se multiplica por el número de grupos en la fase de diversidad.

## Comparativa con modelos similares

| Modelo / artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `transformers-community/group-beam-search` | Estrategia de decodificación sobre Qwen3-0.6B | 751 M | no disponible | no disponible | Hugging Face Hub |
| `Qwen/Qwen3-0.6B` | Modelo base | 751 M | no disponible | Apache 2.0 (según su model card, no verificado aquí) | Hugging Face Hub |
| `transformers-community/contrastive-search` (si existe) | Estrategia de decodificación alternativa | depende del base | no disponible | no disponible | no verificado |
| *Beam search* estándar en Transformers | Decodificación nativa | N/A | N/A | Apache 2.0 | Incluido en la librería |

La comparación relevante no es contra otros modelos de lenguaje, sino contra otras estrategias de decodificación. Frente a *beam search* estándar, este artefacto ofrece mayor diversidad a cambio de más cómputo; frente a *sampling* con temperatura, ofrece resultados más deterministas y controlables.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere cargar un modelo base (por defecto Qwen3-0.6B) y ejecutar código remoto con `trust_remote_code=True`, lo que implica riesgos de seguridad si el repositorio se modifica.
- **Licencia no declarada**: no se especifica licencia en la información disponible; para uso comercial debe verificarse la del modelo base y la del propio script.
- **Idiomas no documentados**: la cobertura lingüística depende enteramente del modelo base y no se detalla.
- **Riesgo de alucinación**: heredado del modelo base; la decodificación diversa puede aumentar la probabilidad de generar contenido plausible pero incorrecto al explorar ramas menos probables.
- **Coste computacional**: *diverse beam search* multiplica el coste por `num_beams` y añade la lógica de penalización; no apto para *throughput* alto sin tuning.
- **Compatibilidad limitada**: pensado para `transformers` con `custom_generate`; no se garantiza funcionamiento en vLLM, TGI, llama.cpp u otros motores.
- **Documentación escasa**: la model card es breve y contiene una afirmación sobre DoLa que conviene validar contra el código.
- **Mantenimiento comunitario**: el repositorio pertenece a `transformers-community`, con 0 likes y 107 descargas en el momento de la consulta; no hay garantía de soporte a largo plazo.
- **Sin benchmarks**: no hay evidencia publicada de calidad o rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/transformers-community/group-beam-search
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper *Diverse Beam Search*: https://hf.co/papers/1610.02424 (arXiv:1610.02424)
- Documentación de `custom_generate` en Transformers: no disponible en la información proporcionada
- Repositorio de Transformers: no disponible en la información proporcionada
