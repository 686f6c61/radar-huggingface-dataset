# SusanHill/zils-lite-g1

## Resumen

Zils-lite-g1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.5-0.8B, desarrollado por el usuario SusanHill bajo el identificador `zils-lite-g1`. Se trata de un modelo de aproximadamente 853 millones de parametros orientado a tareas de decision y razonamiento, entrenado mediante LoRA de rango 32 sobre un "soup" (mezcla de pesos) previo denominado d3-lite. El modelo hereda la arquitectura y el tokenizador de la familia Qwen3.5, aunque la model card no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5`.

El objetivo declarado es reforzar capacidades de function calling y razonamiento sobre datos publicos de entrenamiento (Glaive function calling, Social IQa, CommonsenseQA, PIQA, GSM8K y tareas de entrenamiento de BIG-bench), utilizando exclusivamente etiquetas gold. Es relevante como ejemplo de especializacion ligera de un modelo pequeno para tareas de decision y uso de herramientas, aunque la informacion publicada es muy escasa: no hay datos de benchmarks, idiomas soportados ni detalles de contexto.

La licencia es Apache-2.0, lo que facilita su uso comercial y su integracion en pipelines, siempre que se respeten las condiciones de la licencia del modelo base. El repositorio ocupa 1,7 GB y los pesos estan en formato safetensors con codigo personalizado (`custom_code`), lo que implica que la carga requiere confiar en el codigo del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo se describe como un "LoRA-32 fine-tune" del soup d3-lite, construido sobre Qwen/Qwen3.5-0.8B. Es decir, se parte de un modelo base de la familia Qwen3.5 y se aplica un ajuste fino con LoRA de rango 32 sobre un conjunto de datos publicos de entrenamiento que combina herramientas de function calling (Glaive function calling) y elementos de razonamiento (Social IQa, CommonsenseQA, PIQA, GSM8K y tareas de entrenamiento de BIG-bench). Solo se emplean etiquetas gold, lo que sugiere un entrenamiento supervisado sin refuerzo adicional declarado.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La etiqueta `custom_code` indica que el repositorio incluye codigo propio necesario para cargar el modelo, lo que anade un requisito de revision de seguridad antes de su uso en produccion.

## Capacidades

- Generacion de texto y razonamiento sobre el modelo base Qwen3.5-0.8B.
- Function calling / tool calling, entrenado explicitamente con Glaive function calling.
- Razonamiento de sentido comun y sociales (Social IQa, CommonsenseQA, PIQA).
- Razonamiento matematico basico (GSM8K en el conjunto de entrenamiento).
- Tareas de BIG-bench de entrenamiento (sin especificar cuales).
- Capacidades multilingues: no disponibles en la informacion publicada.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el modelo puede decidir que funcion invocar en un flujo de tool calling gracias a su entrenamiento con Glaive, adecuado para entornos con recursos limitados.
- Asistente de decision en dominios de sentido comun: util para clasificar situaciones o responder preguntas de sentido comun en aplicaciones educativas o de soporte.
- Preprocesado de pipelines de agentes: como primer paso de seleccion de accion antes de llamar a un modelo mayor, reduciendo coste y latencia.
- Prototipado rapido de function calling en local: al ser un modelo de 0,85B, se puede ejecutar en hardware modesto para validar disenos de herramientas.
- Razonamiento matematico basico en entornos embebidos: para resolver problemas aritmeticos sencillos en aplicaciones sin conexion.
- Filtrado y clasificacion de consultas: entrenado con tareas de BIG-bench y sentido comun, puede usarse para etiquetar o clasificar entradas en un pipeline.
- Investigacion sobre soups y LoRA: como referencia reproducible para estudiar el efecto de LoRA-32 sobre un soup base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano (0,85B parametros) se estima que en FP16 requiere aproximadamente 1,7 GB de pesos mas overhead, y en cuantizaciones de 8 o 4 bits podria reducirse a menos de 1 GB, aunque no hay datos confirmados.
- GPU recomendadas: no disponible; por tamano, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia ser suficiente, pero no se confirma.
- Compatibilidad con GPU consumer: probable por el tamano, sin confirmacion oficial.
- Opciones de despliegue: no disponibles; al incluir `custom_code`, es necesario revisar el codigo del repositorio antes de usar vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-g1 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~0,8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoria.

## Limitaciones y advertencias

- Informacion muy escasa: no hay benchmarks, idiomas, contexto ni detalles de entrenamiento publicados.
- Riesgo de alucinacion inherente a modelos pequenos y a fine-tunes con datasets limitados.
- Sesgos desconocidos: no se documenta la composicion del dataset ni posibles sesgos.
- El uso de `custom_code` obliga a auditar el codigo del repositorio antes de cargar los pesos en produccion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen.
- No se garantiza soporte multilingue ni un contexto largo; no usar en produccion sin evaluacion previa.
- El modelo se creo y actualizo el mismo dia (2026-11-27) y no tiene descargas ni likes, lo que sugiere ausencia de validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-g1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
