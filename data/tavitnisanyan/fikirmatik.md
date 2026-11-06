# tavitnisanyan/fikirmatik

## Resumen

fikirmatik es una version "abliterated" de Qwen/Qwen3.8-27B, un modelo denso y multimodal de 27.356 millones de parametros desarrollado originalmente por el equipo Qwen. La modificacion, publicada por el usuario tavitnisanyan, elimina la direccion de rechazo (refusal direction) de los pesos mediante ablacion direccional, de modo que el modelo responde directamente a peticiones que la version original declinaria. No se ha reentrenado ni anadido conocimiento: las capacidades son las del modelo base.

El interes de esta ficha es doble. Por un lado, documenta una tecnica concreta de modificacion de pesos (orthogonalizacion contra la direccion de rechazo, segun Arditi et al. 2024) aplicada a un modelo de 27B con vision y contexto de 131.072 tokens. Por otro, advierte de que el resultado es un modelo sin capa de seguridad propia, pensado para investigacion, red-teaming y uso privado, no para despliegues de cara al publico sin filtros externos.

El modelo se distribuye en BF16 (unos 52 GB, repo de 55,6 GB), con licencia Apache-2.0 heredada del base, y soporta tool calling mediante los parsers de vLLM para Qwen3. Es un modelo de razonamiento (thinking) con control de esfuerzo via `reasoning_effort`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Qwen3.8), texto e imagen |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16 en el repo; no se documentan otras en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen3.8 con capacidad multimodal (image-text-to-text), es decir, puede procesar imagenes ademas de texto. El pipeline declarado es text-generation y la libreria transformers. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

La modificacion aplicada es una ablacion direccional (weight orthogonalization) contra la direccion de rechazo, siguiendo el metodo de Arditi et al. 2024 ("Refusal in Language Models Is Mediated by a Single Direction"). Solo se modifican los modulos que escriben en el residual stream: `self_attn.o_proj` y `mlp.down_proj` aparecen modificados en el diff a nivel de tensor frente al release original, mientras que `self_attn.q_proj`, `mlp.up_proj` e `input_layernorm` son bit-identicos (diferencia maxima exactamente 0). No hubo entrenamiento ni datos nuevos: es una edicion quirurgica de pesos. El modelo base es un modelo de razonamiento con modo thinking y parametro `reasoning_effort` (low, medium, xhigh; por defecto xhigh).

## Capacidades

- Generacion de texto y razonamiento multi-paso en modo thinking, con control del esfuerzo de razonamiento (`reasoning_effort`: low, medium, xhigh) y opcion de desactivarlo (`enable_thinking: false`).
- Procesamiento de imagenes (image-text-to-text): el modelo base es multimodal y puede leer imagenes.
- Tool calling / function calling, compatible con los parsers de vLLM para Qwen3 (`--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`).
- Uso en agentes y flujos multi-paso, segun el harness de tool calling que acompana al kit fikirmatik / gpu-lab.
- Contexto largo de hasta 131.072 tokens para conversaciones y documentos extensos.
- Respuestas sin rechazo por seguridad: el modelo no declina peticiones que el release original rechazaria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Red-teaming y evaluacion de seguridad: permite sondear comportamientos que el modelo original bloquearia, util para estudiar la eficacia de la ablacion y disenar filtros externos.
- Investigacion sobre alineacion y refusal: sirve para reproducir y analizar el metodo de Arditi et al. comparando el comportamiento con el base sin modificar.
- Analisis de documentos e imagenes en contexto largo: con 131.072 tokens y entrada multimodal, se puede usar para extraer informacion de informes extensos con figuras en un unico prompt.
- Asistente interno de uso privado: en entornos controlados donde los rechazos plantilla estorban, el modelo responde de forma directa; requiere que el operador asuma la capa de seguridad.
- Pipelines de agentes con tool calling: integrable en vLLM con los parsers de Qwen3 para orquestar llamadas a herramientas en flujos multi-paso.
- Generacion de codigo y tareas tecnicas: al conservar las capacidades del base, puede usarse en asistentes de programacion, con la advertencia de que la ablacion puede degradar ligeramente tareas no relacionadas.
- Experimentacion con modos de razonamiento: util para comparar calidad y latencia entre `reasoning_effort` low, medium y xhigh en una misma carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia sin cuantizar en BF16: unos 52 GB de pesos, por lo que se necesita una GPU de 80-96 GB para servirlo sin cuantizar.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs Blackwell de 80-96 GB. En Blackwell, el autor recomienda mantener `--max-num-seqs` en torno a 64, ya que el valor por defecto de vLLM no cabe junto a contexto largo en esta arquitectura.
- GPU de consumo: no cabe en tarjetas consumer (RTX 4090 de 24 GB, etc.) sin cuantizacion; no se documentan en la informacion disponible pesos GGUF ni cuantizaciones listas para usar.
- Despliegue: vLLM con los parsers de Qwen3 (`--reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`). No se mencionan otras opciones (llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Refusal | Licencia |
|---|---|---|---|---|---|
| fikirmatik (este) | ~27,36B denso | 131.072 | Si | Eliminado | Apache-2.0 |
| Qwen/Qwen3.8-27B (base) | ~27,36B denso | 131.072 | Si | Presente | Apache-2.0 |
| Alternativas abliterated de la misma familia | no disponible | no disponible | no disponible | Eliminado | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento comparado con otros modelos, por lo que la comparativa se limita a caracteristicas estructurales frente al modelo base.

## Limitaciones y advertencias

- El modelo no rechaza peticiones por seguridad: la capa de rechazo se ha eliminado deliberadamente. El operador es la unica capa de seguridad; no debe desplegarse a usuarios que no lo esperen.
- La ablacion es una edicion tosca de los pesos y puede degradar ligeramente la calidad en tareas no relacionadas con el rechazo.
- Riesgo de alucinacion: no se documenta mitigacion especifica; el modelo base conserva sus limitaciones en este aspecto.
- No se dispone de informacion sobre sesgos conocidos ni sobre el rendimiento por idioma.
- El modo thinking por defecto (`xhigh`) es muy verboso; conviene ajustar `reasoning_effort` o desactivar el razonamiento para respuestas cortas.
- Licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, pero no exime de responsabilidad legal sobre el contenido generado.
- El repo no registra descargas ni likes y fue creado en 2026-11-03; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tavitnisanyan/fikirmatik
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper del metodo de ablacion: https://arxiv.org/abs/2406.11717
- Kit fikirmatik / gpu-lab: https://github.com/ (enlace incompleto en la model card)
