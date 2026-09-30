# tianxinwei/JevAny-Qwen3.5-4B-Direct-Token-LoRA

## Resumen

JevAny-Qwen3.5-4B-Direct-Token-LoRA es un adaptador LoRA publicado por el usuario tianxinwei sobre el modelo base Qwen/Qwen3.5-4B, dentro del proyecto JevAny (repositorio weitianxin/JevAny). No es un modelo generativo convencional: es un decision-model que emplea el readout denominado direct-token para puntuar hasta 255 opciones y emitir una decisión en una única pasada del backbone, sin generación autorregresiva. El repositorio de HuggingFace contiene exclusivamente los pesos del adaptador PEFT y los metadatos del readout, no los pesos base.

El backbone sobre el que se apoya, Qwen3.5-4B, es un transformer denso de 4B parámetros con contexto nativo de 262.144 tokens, entrenado con fusión temprana de tokens multimodales (visión-lenguaje). El adaptador especializa ese backbone en tareas de decisión agrupadas en cinco categorías declaradas: preferencias, decisiones de agente/herramienta, razonamiento, clasificación y seguridad.

Su interés técnico reside en el coste de inferencia: al resolver la tarea con un solo prefill del backbone y un readout de vocabulario completo, evita la decodificación autorregresiva y permite seleccionar entre un número elevado de alternativas. En contrapartida, la información publicada es muy limitada: no hay licencia declarada, no hay idiomas declarados, no se ha liberado la composición detallada del dataset y el repositorio acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre backbone transformer denso Qwen3.5-4B, con readout direct-token |
| Parametros totales | Adaptador LoRA de 0,1 GB de repositorio; modelo base Qwen3.5-4B con aproximadamente 4B parametros |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | no disponible (no se publica GGUF ni cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (se aplican la licencia y los terminos de acceso del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA mas metadatos del readout) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA que se carga sobre el backbone Qwen3.5-4B. La innovación principal es el mecanismo de lectura: el readout direct-token puntúa las opciones directamente en el vocabulario del modelo (hasta 255 alternativas) y se entrena con entropía cruzada sobre el vocabulario completo. El propio autor señala que esto lo hace más lento de entrenar que los modelos pointer, que en su lugar puntúan las representaciones de las opciones mediante una pequeña cabeza aprendida. La velocidad de inferencia, en cambio, se espera similar entre ambos enfoques, porque los dos ejecutan un único prefill del backbone y no generan la respuesta de forma autorregresiva.

En cuanto a los datos, la model card declara 1.772.725 registros de texto y 2.180.242 decisiones etiquetadas. Solo se publican el tamaño agregado y las categorías generales (preferencias, decisiones de agente/herramienta, razonamiento, clasificación y seguridad); la mezcla detallada y la composición por fuente no forman parte de esta release. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Selección de decisiones entre hasta 255 opciones mediante el readout direct-token, en una sola pasada de prefill.
- Decisiones de preferencia: útil para comparar o puntuar respuestas alternativas generadas por otros modelos.
- Decisiones de agente y herramienta: selección de la acción o herramienta adecuada dentro de un conjunto de opciones predefinido.
- Razonamiento y clasificación: tareas de categorización y elección sobre conjuntos cerrados de etiquetas.
- Seguridad: la categoría de seguridad figura entre las incluidas en el entrenamiento, orientada a clasificación o filtrado de contenido.
- No realiza generación de texto libre: al basarse en un readout de elección, no produce respuestas autorregresivas.
- Capacidades multimodales heredadas del modelo base (visión-lenguaje): no disponible si el adaptador las preserva tras el entrenamiento LoRA.
- Soporte multilingüe: no disponible (no se declaran idiomas en el repositorio).
- Modo de razonamiento extendido (thinking mode): no disponible.
- Soporte de tool calling generativo: no disponible; el modelo está orientado a decisiones de selección de herramienta, no a emitir llamadas completas.

## Casos de uso

- Enrutado de herramientas en agentes: dado un conjunto de herramientas candidatas y el estado de la conversación, el modelo devuelve la opción más probable con un único prefill, lo que reduce la latencia frente a un modelo generativo que deba redactar la llamada.
- Moderación y clasificación de contenido: con la categoría de seguridad presente en el entrenamiento, puede etiquetar un texto contra un conjunto cerrado de políticas (por ejemplo, hasta 255 etiquetas), integrándose como paso previo a la publicación.
- Juez de preferencias en pipelines de alineamiento: puede puntuar pares de respuestas para construir datasets de preferencias o filtrar salidas antes de una fase de DPO, dado que las decisiones de preferencia son una de las categorías declaradas.
- Evaluación automática de respuestas: con su precisión declarada en JevBench Easy (100,00%) y Original (98,61%), es adecuado como evaluador de opción múltiple en conjuntos de referencia internos.
- Clasificación de tickets de soporte: asignación de un ticket a una de las categorías predefinidas del sistema de atención al cliente, aprovechando el formato de decisión frente a opciones discretas.
- Selección de candidatos en generación de código: dado un conjunto de N parches o completados producidos por un modelo generativo, el decision-model elige el mejor candidato, sustituyendo a un juez generativo más costoso.
- Control de calidad en pipelines RAG: decidir si la evidencia recuperada es suficiente o si hay que reformular la consulta, formulándolo como una decisión binaria o de pocas opciones.

## Benchmarks y rendimiento

Los valores publicados en la model card corresponden a precisión (accuracy) bajo los protocolos congelados Transfer-v9 y JevBench público, y no al compuesto sellado del leaderboard de JevBench.

| Protocolo | Tamano de muestra | Precision |
|---|---:|---:|
| Transfer-v9 | 1.046 | 78,20% |
| JevBench Easy | 48 | 100,00% |
| JevBench Original | 72 | 98,61% |
| JevBench Hard | 111 | 61,26% |
| JevBench total | 231 | 80,95% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con otros decision-models bajo los mismos protocolos.

## Requisitos de hardware

- El modelo base Qwen3.5-4B es denso, por lo que en bf16 los pesos ocupan aproximadamente 8 GB; el adaptador LoRA añade 0,1 GB de repositorio.
- La receta de vLLM para Qwen3.5-4B indica que el modelo base cabe en GPUs de consumo con 16 GB de VRAM manteniendo el contexto completo de 262K, o bien en un nodo NUMA Xeon 6 o en tarjetas Intel Arc Pro B60/B70.
- GPU recomendadas: RTX 4080/4090 (16 GB o más) para el modelo base en bf16; A100 o H100 para mayor throughput o batching con contextos largos. No hay recomendaciones específicas publicadas para este adaptador.
- Cabe en GPU de consumo: sí, según los requisitos del modelo base; conviene descontar la memoria adicional de la caché KV cuando se use el contexto completo de 262.144 tokens.
- Opciones de despliegue: el comando oficial es `jevany serve --checkpoint tianxinwei/JevAny-Qwen3.5-4B-Direct-Token-LoRA --device cuda --dtype bf16`, que exige instalar el paquete con los extras `serve` y `multimodal` y disponer del código de JevAny en la revisión de release. El modelo base cuenta con receta en vLLM.
- llama.cpp, Ollama y TGI: no disponible para este adaptador; no se publican pesos GGUF.
- Latencia y throughput: el autor indica que la velocidad de inferencia del readout direct-token es similar a la de los modelos pointer, porque ambos usan un único prefill y no generan de forma autorregresiva. No se publican cifras concretas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevAny-Qwen3.5-4B-Direct-Token-LoRA | Adaptador sobre base de ~4B | 262.144 tokens | Decision, readout direct-token (hasta 255 opciones) | no disponible | HuggingFace, 0 descargas |
| Qwen3.5-4B (modelo base) | 4B denso | 262.144 tokens | Generacion autoregresiva multimodal | no disponible en la informacion | HuggingFace, con receta en vLLM |
| Variante pointer de JevAny sobre el mismo backbone | Adaptador sobre base de ~4B | 262.144 tokens | Decision, cabeza aprendida sobre representaciones de opciones | no disponible | Mencionada en la model card; sin checkpoint publico en la informacion disponible |
| Otros decision-models comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene los pesos base: es imprescindible descargar Qwen/Qwen3.5-4B por separado y aceptar sus términos de acceso y licencia.
- Requiere el código de JevAny en la revisión de release concreta; no funciona como un adaptador PEFT estándar sin esa dependencia.
- La licencia no está declarada en el repositorio, lo que impide determinar a priori si el uso comercial está permitido; la licencia del modelo base se aplica de forma adicional.
- No se declaran idiomas soportados, por lo que no puede asumirse un comportamiento multilingüe fiable sin evaluación propia.
- No se publican sesgos conocidos ni evaluaciones de sesgo, toxicidad o alucinación.
- El rendimiento cae de forma marcada en el subconjunto difícil de JevBench (61,26% frente a 100,00% en Easy y 98,61% en Original), lo que sugiere un comportamiento sensible a la dificultad de la tarea.
- Solo se liberan el tamaño agregado del dataset y las categorías generales; no hay composición por fuente ni mezcla detallada, lo que dificulta auditar la procedencia de los datos.
- El entrenamiento con entropía cruzada sobre el vocabulario completo es más lento que el de los modelos pointer, según el propio autor.
- La salida está limitada a un máximo de 255 opciones; no es adecuado para espacios de decisión abiertos.
- No genera texto libre de forma autorregresiva, por lo que no debe emplearse como modelo de chat o de completado.
- El repositorio registra 0 descargas y 0 likes, sin validación externa ni resultados reproducidos por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianxinwei/JevAny-Qwen3.5-4B-Direct-Token-LoRA
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del proyecto JevAny: https://github.com/weitianxin/JevAny
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Pagina oficial de Qwen: https://qwen.ai/home
- Blog de anuncio de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Receta de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
