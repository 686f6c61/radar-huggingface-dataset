# yonlyyone/Inkling-2-Mini-g13-q3-fp16

## Resumen

Inkling-2-Mini-g13-q3-fp16 es una cuantizacion del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone en Hugging Face. Se trata de un checkpoint en formato MLX (safetensors) pensado especificamente para Macs con Apple Silicon de 16 GB de memoria unificada (M1, M2, M3), empaquetado para el motor de inferencia `g13`. El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidad de entrada imagen-texto, orientado a conversacion y razonamiento multimodal.

El checkpoint aplica una cuantizacion mixta: los expertos enrutados de las capas 0 a 23 se cuantizan a 3 bits afines con `group_size=64` y escalas/biases en `float16`, mientras que las proyecciones densas (atencion, embeddings y `lm_head`) se mantienen a 4 bits afines, y las normas, convoluciones cortas, compuertas de mensaje y la torre de vision permanecen en `float16`. El resultado ocupa 12,34 GB en disco, lo que permite ejecutarlo en equipos con 16 GB de memoria unificada junto con una cache KV en Q8 del motor `g13`.

Su relevancia radica en hacer accesible un MoE multimodal de aproximadamente 26.400 millones de parametros totales en hardware de consumo Apple, un escenario tradicionalmente reservado a GPUs de datacenter. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la ficha del checkpoint no documenta detalles adicionales sobre el entrenamiento ni sobre el rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con torre de vision y capas con convoluciones cortas y compuertas de mensaje |
| Parametros totales | 26.388.641.280 (~26,4 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 3 bits afines (`group_size=64`, escalas/biases `float16`) en expertos enrutados de capas 0-23; 4 bits afines (`group_size=64`) en proyecciones densas; `float16` en normas, convoluciones cortas, compuertas de mensaje y torre de vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con capacidad multimodal de entrada imagen-texto. La model card del checkpoint menciona explicitamente expertos enrutados en las capas 0 a 23, proyecciones densas de atencion, embeddings y `lm_head`, ademas de normas, convoluciones cortas, compuertas de mensaje y una torre de vision. La presencia de convoluciones cortas y compuertas de mensaje sugiere un diseno hibrido con componentes convolucionales ligeros junto a la atencion, aunque la informacion disponible no detalla el esquema completo de capas ni el numero de expertos por capa.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas del modelo original. El checkpoint cuantizado indica que los pesos se re-cuantizaron desde formatos nativos NVFP4/MXFP8, lo que sugiere que el modelo base se distribuye en formatos de baja precision para GPUs, pero no se aportan mas detalles sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), con torre de vision conservada en `float16`.
- Razonamiento y generacion multimodal combinando imagenes y texto en la misma conversacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: el checkpoint cabe en 16 GB de memoria unificada con cache KV en Q8, por lo que se puede desplegar con `g13 serve --quant q3` para conversaciones multi-turno sin conexion a servicios externos.
- Analisis de imagenes en el dispositivo: al conservar la torre de vision en `float16`, permite describir capturas, diagramas o documentos escaneados sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Prototipado de aplicaciones multimodales en Apple Silicon: desarrolladores que trabajan con MLX pueden validar flujos imagen-texto en un portatil antes de escalar a infraestructura mayor.
- Investigacion sobre cuantizacion MoE: el checkpoint sirve como referencia para estudiar el impacto de cuantizar expertos a 3 bits manteniendo proyecciones densas a 4 bits y componentes sensibles en `float16`.
- Automatizacion de tareas de documentacion tecnica: generacion de descripciones a partir de capturas de pantalla o diagramas de arquitectura en flujos de trabajo locales.
- Evaluacion comparativa de motores de inferencia: permite medir el rendimiento del motor `g13` frente a otras alternativas MLX en el mismo hardware de 16 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 12,34 GB de pesos en disco; el autor indica que encaja comodamente en 16 GB de memoria unificada de M1/M2/M3 junto con la cache KV en Q8 del motor `g13`.
- GPU recomendadas: Apple Silicon M1, M2 y M3 (MacBook Air y MacBook Pro de 16 GB). No se documenta soporte para GPUs NVIDIA ni AMD.
- Cabe en GPU de consumo: si, en equipos Apple con 16 GB de memoria unificada; no se dispone de datos para GPUs de consumo tipo RTX 4090.
- Opciones de despliegue: motor `g13` (`g13 pull q3`, `g13 serve --quant q3`) y libreria MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Inkling-2-Mini-g13-q3-fp16 | ~26,4 mil millones | no disponible | safetensors MLX (3/4 bits mixtos) | Apache 2.0 | Apple Silicon 16 GB |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | Apache 2.0 | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en los datos proporcionados.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en los expertos enrutados puede degradar la calidad respecto al modelo base; el autor indica que se mantiene por encima del "acantilado de colapso" de 2 bits, pero no aporta metricas de degradacion.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma del modelo base.
- La longitud de contexto no esta disponible, lo que impide planificar aplicaciones con ventanas largas.
- El despliegue esta limitado al motor `g13` y a la libreria MLX; no hay soporte documentado para ecosistemas estandar como vLLM, llama.cpp u Ollama.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del motor `g13` antes de un uso comercial en produccion.
- El hardware objetivo son Macs de 16 GB; en equipos con menos memoria unificada el modelo no cabra junto con la cache KV.

## Enlaces

- Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q3-fp16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
