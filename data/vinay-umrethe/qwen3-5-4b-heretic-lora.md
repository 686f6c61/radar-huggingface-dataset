# VINAY-UMRETHE/Qwen3.5-4B-heretic-LoRA

## Resumen

Qwen3.5-4B-heretic-LoRA es un adaptador LoRA publicado por el usuario VINAY-UMRETHE sobre el modelo base Qwen/Qwen3.5-4B. El nombre y las etiquetas del repositorio (heretic, uncensored, decensored, abliterated) indican que se trata de un fine-tuning orientado a eliminar o reducir los mecanismos de rechazo y alineacion del modelo original, una practica habitual en la comunidad open source para obtener variantes con menor censura en las respuestas. El repositorio se distribuye como adaptador LoRA en formato safetensors y no como pesos completos, con un tamano aproximado de 0,1 GB, coherente con un conjunto de matrices de bajo rango.

La relevancia de esta ficha es doble. Por un lado, documenta una practica tecnica concreta (abliteration mediante LoRA) que interesa a investigadores que estudian alineacion, robustez y comportamiento de modelos. Por otro lado, advierte de que el modelo tiene acceso restringido en Hugging Face y de que su uso en produccion exige evaluar cuidadosamente los riesgos asociados a la ausencia de filtros de seguridad. No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de tokens utilizados ni los hiperparametros del fine-tuning.

El pipeline declarado es image-text-to-text, lo que sugiere que el modelo base Qwen3.5-4B incorpora capacidad multimodal de entrada de imagen y texto. Sin embargo, no hay informacion que confirme si el adaptador LoRA preserva, modifica o degrada dicha capacidad multimodal. Tampoco se han publicado resultados de benchmarks ni una model card detallada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen/Qwen3.5-4B); arquitectura interna del base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (adaptador LoRA de ~0,1 GB; el base Qwen3.5-4B tiene 4B nominales) |
| Parametros activos | No aplica (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; las cuantizaciones aplicarian al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline declarado | image-text-to-text |
| Acceso | Restringido (gated) en Hugging Face |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base Qwen/Qwen3.5-4B. La tecnica LoRA congela los pesos del modelo original e introduce matrices de descomposicion de bajo rango en determinadas capas, de modo que el ajuste resulta mucho mas ligero que un fine-tuning completo; de ahi que el repositorio ocupe apenas 0,1 GB frente a los varios gigabytes que requeririan los pesos completos de un modelo de 4B en precision completa o bf16. El pipeline image-text-to-text sugiere que el base es multimodal, aunque la informacion disponible no detalla que modulos del modelo base se han adaptado ni si las capas de proyeccion visual estan incluidas en el adaptador.

Las etiquetas heretic, uncensored, decensored y abliterated apuntan a un entrenamiento orientado a la abliteration, una familia de tecnicas que busca identificar y neutralizar las direcciones de activacion asociadas al rechazo de peticiones y a la alineacion de seguridad. No se dispone de informacion sobre el dataset utilizado, el numero de pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA ni si se emplearon tecnicas de RLHF, DPO o ajuste supervisado. La etiqueta reproducible sugiere que el autor pretende que el proceso pueda replicarse, pero no se incluye en la informacion proporcionada ningun script, configuracion ni registro de experimentos que lo confirme.

## Capacidades

- Generacion de texto y conversacion multi-turno heredadas del modelo base Qwen3.5-4B, aunque el grado de preservacion tras el fine-tuning no esta documentado.
- Entrada multimodal de imagen y texto segun el pipeline declarado (image-text-to-text), sin confirmacion de que el adaptador mantenga intacta esta capacidad.
- Reduccion esperada de los rechazos y respuestas de seguridad, segun las etiquetas uncensored, decensored y abliterated.
- Posible soporte de razonamiento y codigo heredado del base, no verificado en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el adaptador permite estudiar como cambia el comportamiento de un modelo de 4B cuando se neutralizan las direcciones de rechazo, comparando respuestas con el base original en un entorno controlado y con supervision etica.
- Analisis de robustez frente a jailbreaks: sirve como referencia de modelo "abliterated" para evaluar la eficacia de clasificadores de seguridad y de tecnicas de mitigacion en pipelines de moderacion.
- Pruebas de red teaming controladas: util para generar respuestas que un modelo alineado rechazaria, dentro de entornos de evaluacion cerrados y con las salvaguardas externas adecuadas.
- Experimentacion academica con LoRA: al ser un adaptador ligero, permite reproducir y comparar tecnicas de bajo rango sobre un mismo base multimodal sin necesidad de almacenar pesos completos.
- Evaluacion de degradacion multimodal: permite comprobar si un fine-tuning de texto sobre un base image-text-to-text afecta a la calidad de las respuestas ante entradas de imagen, un fenomeno relevante para quien despliega adaptadores sobre modelos multimodales.
- Docencia y divulgacion tecnica: sirve para ilustrar de forma practica que es la abliteration, como se empaqueta un LoRA en safetensors y que implicaciones tiene para la gobernanza de modelos.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni aplicaciones orientadas al publico sin una capa adicional de moderacion, dado que el objetivo declarado del adaptador es reducir los rechazos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,1 GB, por lo que su almacenamiento y carga son triviales en cualquier equipo.
- El requisito real de VRAM lo determina el modelo base Qwen3.5-4B. Para un modelo de 4B en bf16 se estiman del orden de 8-9 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits la huella puede reducirse a unos 3-4 GB, aunque estas cifras son estimaciones generales y no datos publicados para este modelo.
- GPU recomendadas: para bf16, tarjetas con 16 GB o mas (RTX 4090, A10, L4, A100, H100). Para cuantizacion de 4 bits, tarjetas consumer con 8 GB podrian ser suficientes, sujeto a verificacion empirica.
- Cabe en GPU consumer: probablemente si, en configuraciones cuantizadas de 4 bits sobre GPUs con 8 GB o mas, aunque no hay confirmacion publicada.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sobre el base; vLLM y TGI requeririan fusionar el LoRA con el base o usar soporte de adaptadores; llama.cpp y Ollama requeririan convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Acceso |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-LoRA (este) | LoRA sobre base 4B | No disponible | Adaptador LoRA | Apache 2.0 | Restringido (gated) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible | Modelo completo multimodal | No disponible en la informacion | No disponible en la informacion |
| Otras variantes abliterated de la comunidad | Variable | Variable | Fine-tuning completo o LoRA | Variable | Variable |

No se dispone de informacion suficiente para comparar rendimiento, benchmarks ni calidad de respuesta con alternativas concretas. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- El objetivo declarado del adaptador es reducir los rechazos y la censura; esto implica un mayor riesgo de generar contenido danino, ofensivo o inseguro, y hace imprescindible una capa externa de moderacion si se usa en cualquier aplicacion real.
- Acceso restringido en Hugging Face: es necesario aceptar condiciones en la plataforma antes de descargar el modelo, lo que anade friccion a la reproducibilidad.
- No hay model card detallada, dataset documentado ni hiperparametros publicados; la reproducibilidad anunciada en las etiquetas no esta respaldada por artefactos visibles en la informacion proporcionada.
- Riesgo de alucinacion heredado del modelo base, potencialmente agravado si el fine-tuning degrada capacidades de razonamiento o factualidad; no hay evaluaciones que lo cuantifiquen.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Capacidad multimodal incierta: el pipeline image-text-to-text sugiere entrada de imagen, pero no hay confirmacion de que el adaptador LoRA la preserve.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad legal por el contenido generado recae en el desplegador.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se recomienda su uso en produccion sin una evaluacion previa de seguridad, calidad y sesgos sobre el caso de uso concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VINAY-UMRETHE/Qwen3.5-4B-heretic-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este adaptador concreto.
