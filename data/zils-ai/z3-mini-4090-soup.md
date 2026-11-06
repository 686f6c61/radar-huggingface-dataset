# zils-ai/z3-mini-4090-soup

## Resumen

z3-mini-4090-soup es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-4B, publicado por el usuario zils-ai en Hugging Face. Segun la model card, el modelo se presenta bajo el nombre interno "iota-decide-4b v0.4" y esta descrito como un "modelo de decision" de Macrocosmos: dado un estado y un conjunto de preguntas tipadas (eleccion multiple, si/no, puntuacion), devuelve una probabilidad para cada opcion en un unico forward pass, sin generar texto. El modelo tiene 4.539.265.536 parametros y un tamano de repositorio de 9,1 GB en formato safetensors.

La relevancia de este modelo radica en su enfoque poco habitual: en lugar de generar respuestas autoregresivas, lee las letras de las opciones en la posicion de respuesta para producir probabilidades calibradas. Incorpora una innovacion tecnica destacable en la version v0.4: atencion bidireccional en las capas de atencion completa (las capas de atencion lineal permanecen causales), lo que exige usar el script incluido `letter_decide.py` para obtener los resultados correctos. La inferencia causal estandar (por ejemplo, `model.generate` o stacks de serving convencionales) produce puntuaciones inferiores.

El modelo esta entrenado exclusivamente en ingles, con licencia Apache 2.0, y esta pensado para tareas de clasificacion y decision estructurada mas que para generacion de texto libre. Su pipeline declarado en Hugging Face es image-text-to-text, aunque la model card no detalla capacidades de vision mas alla de la herencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de atencion completa y capas de atencion lineal; atencion bidireccional en las capas de atencion completa (v0.4) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (instruct) y se ajusta mediante LoRA de rango 64 con alpha 128 aplicado a todas las capas lineales del modelo de lenguaje, fusionado posteriormente en los pesos publicados. El entrenamiento usa un learning rate de 1e-4 con un 2 % de warmup y decaimiento cosine, durante 750 pasos, con entropia cruzada sobre objetivos suaves (soft-target cross-entropy) y una temperatura aprendida almacenada en `joint_head.safetensors`. La innovacion principal de la v0.4 es la atencion bidireccional en las capas de atencion completa: el prompt completo se atiende en ambas direcciones, mientras que las capas de atencion lineal siguen siendo causales, de modo que el estado se interpreta a la luz de la pregunta.

El entrenamiento se distribuyo mediante streaming DiLoCo sobre 16 replicas de RTX A4000, con 4 fragmentos y fusiones escalonadas sin esperas sincronas. El conjunto de datos consta de 879.000 registros tras deduplicacion, sin elementos de benchmark: la mezcla de la v0.3 (filas de decision etiquetadas por humanos, 24 conjuntos de datos publicos etiquetados por humanos y estados generados con etiquetas verificadas) mas estados de decision generados y preguntas de razonamiento etiquetadas por un modelo profesor mas potente. Se eliminaron los registros que coincidian con cualquier conjunto de evaluacion. El checkpoint se selecciono entre instantaneas cada 50 pasos segun el rendimiento en JevBench publico.

## Capacidades

- Decision estructurada con preguntas tipadas: soporta preguntas de tipo `choice` (hasta 26 opciones), `noul` (si/no) y `score`, devolviendo una probabilidad para cada opcion en un unico forward pass.
- Clasificacion binaria calibrada: las respuestas si/no se reportan con una probabilidad de al menos 0,801 en el lado elegido; el rango 0,2 < P(yes) < 0,8 se considera abstencion en JevBench.
- Razonamiento sobre estados: interpreta un estado (por ejemplo, un ticket de soporte con una politica asociada) y responde preguntas condicionadas a ese estado.
- Capacidades heredadas del modelo base Qwen3.5-4B: al ser un finetune del instruct, conserva en principio las capacidades del modelo base, aunque la model card no las detalla.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: atencion bidireccional en capas de atencion completa, temperatura aprendida, objetivos suaves de entrenamiento.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un ticket con su politica asociada, el modelo responde preguntas de eleccion multiple como "que equipo lo gestiona" entre opciones predefinidas (facturacion, tecnico), devolviendo probabilidades por opcion en un solo paso, lo que permite umbrales de confianza y derivacion a revision humana.
- Aprobacion de reembolsos y decisiones de politica: con un estado que incluye el importe solicitado y la politica de aprobacion, el modelo responde preguntas si/no como "puede emitirse el reembolso sin aprobacion", con probabilidad calibrada y abstencion cuando la confianza es baja.
- Moderacion de contenido: clasificacion de textos en categorias (por ejemplo, ofensivo/no ofensivo) usando preguntas tipadas, aprovechando la calibracion para distinguir casos dudosos.
- Analisis de sentimiento y opinion: preguntas de eleccion o puntuacion sobre resenas y tuits, con resultados por opcion en lugar de texto generado, lo que simplifica el post-procesado en pipelines.
- Triage en atencion al cliente automatizada: evaluacion de estados conversacionales con multiples preguntas simultaneas (ruta, prioridad, aprobacion) en un unico forward pass, reduciendo la latencia frente a generacion autoregresiva.
- Sistemas de decision con requisitos de auditabilidad: al devolver probabilidades explicitas por opcion en lugar de texto libre, facilita el registro y la trazabilidad de decisiones en entornos regulados.
- Evaluacion de politicas y simulacion: generacion de estados sinteticos y consulta de decisiones para probar reglas de negocio antes de desplegarlas.

## Benchmarks y rendimiento

Resultados publicados en la model card (ejecuciones propias del autor):

| Conjunto | v0.3 (publicado) | v0.4 (este modelo) | Torchcast Decision 4B v1.3 |
|---|---|---|---|
| Habilidad cross-domain: 15 benchmarks Decision Index nunca entrenados (corregido por azar, ~10,4k preguntas) | 55,4 | 62,9 | 65,6 |
| Rotten Tomatoes / TweetEval offensive (oro humano, nunca entrenado) | 85,1 / 76,4 | 89,3 / 76,6 | 90,7 / 79,5 |
| JevBench publico (231 elementos) | 188 | 197 | 211 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 9,1 GB en safetensors; en precision completa (fp16/bf16) se necesitan aproximadamente 9-10 GB de VRAM solo para los pesos, mas overhead de activaciones y del script `letter_decide.py`.
- GPU recomendadas: el entrenamiento se realizo en RTX A4000; para inferencia, una RTX 4090 (24 GB) es suficiente en fp16. GPU de datacenter como A100 o H100 no son necesarias para un modelo de 4,5B.
- Cabe en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM en fp16; con cuantizacion a 8 bits o 4 bits cabria en GPUs de 8 GB, aunque no se documentan tipos de cuantizacion para este modelo.
- Opciones de despliegue: el autor exige el script incluido `letter_decide.py` con torch, transformers >= 5, accelerate, safetensors y huggingface_hub. La inferencia causal estandar (vLLM, llama.cpp, Ollama, TGI con `model.generate`) produce puntuaciones inferiores porque no aplica la atencion bidireccional; no se documenta soporte para estos stacks.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Decision Index) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| z3-mini-4090-soup (iota-decide-4b v0.4) | 4,54B | no disponible | 62,9 | apache-2.0 | Hugging Face |
| Torchcast Decision 4B v1.3 | no disponible | no disponible | 65,6 | no disponible | no disponible |
| iota-decide-4b v0.3 | no disponible | no disponible | 55,4 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: el modelo declara unicamente el idioma ingles, por lo que su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Requiere inferencia no estandar: la inferencia causal convencional (`model.generate` o stacks de serving estandar) ejecuta el modelo de forma distinta al entrenamiento y obtiene puntuaciones inferiores; es obligatorio usar `letter_decide.py`.
- Limite de opciones: las listas de eleccion estan limitadas a 26 opciones.
- Abstencion: las respuestas si/no con 0,2 < P(yes) < 0,8 se consideran abstenciones en JevBench; en produccion hay que definir umbrales propios.
- Riesgo de alucinacion: al no generar texto, el riesgo se traslada a la calibracion de probabilidades; una probabilidad alta no garantiza correccion fuera de la distribucion de entrenamiento.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada; el modelo se entreno con datos etiquetados por humanos y por un modelo profesor, lo que puede introducir sesgos heredados.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen/Qwen3.5-4B tiene sus propias condiciones que deben verificarse.
- Sin benchmarks de generacion: al ser un modelo de decision, no se publican resultados en MMLU, HumanEval o GSM8K; no debe evaluarse como modelo generativo general.
- Sin descargas ni likes: el repositorio no tiene traccion (0 descargas, 0 likes) en el momento de la consulta, lo que reduce la validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/zils-ai/z3-mini-4090-soup
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
