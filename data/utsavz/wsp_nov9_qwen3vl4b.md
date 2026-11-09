# utsavz/wsp_nov9_qwen3vl4b

## Resumen

`wsp_nov9_qwen3vl4b` es un checkpoint derivado de Qwen/Qwen3-VL-4B-Instruct en el que se ha aplicado una edición directa de pesos, sin gradientes ni fine-tuning, para modificar el comportamiento de rechazo ante peticiones dañinas. Lo publica el usuario `utsavz` como artefacto de un estudio de "weight-space programming" aplicado a seguridad multimodal (WSP-MLLM-Safety). El modelo conserva la arquitectura, tokenizer, processor, plantilla de chat y configuración del original; solo cambian dos tensores de la MLP del modelo de lenguaje.

La modificación afecta a `model.language_model.layers.23.mlp.down_proj.weight` y `model.language_model.layers.28.mlp.down_proj.weight`, ambos de forma [2560, 9728]. Se editaron 162.436 y 162.380 entradas BF16 respectivamente, con un cambio relativo de Frobenius del 3,75% y 2,49%. El objetivo declarado es reforzar el rechazo cuando la petición contiene señales textuales de daño, no añadir rechazo condicionado por la imagen.

Es relevante porque documenta un método de edición de pesos barato (500 forward passes, sin optimizador) y porque publica resultados de evaluación held-out sobre VLGuard con métricas de tasa de éxito de ataque y tasa de rechazo en prompts benignos. El modelo tiene 4.437.815.808 parámetros y un repositorio de 8,9 GB en safetensors, con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (modelo de lenguaje + torre visual), según el modelo base; el checkpoint no redefine la arquitectura |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor solo documenta BF16 para desarrollo e inferencia) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dos shards, misma disposición que el snapshot original) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-VL-4B-Instruct, revisión `ebb281ec70b05090aa6165b016eac8ec08e71b17`, un modelo image-text-to-text con torre visual y modelo de lenguaje transformer. No hay entrenamiento en el sentido habitual: no se ejecutaron pasos de optimizador ni se calcularon gradientes. La edición es una actualización de rango bajo sobre dos matrices `down_proj` de la MLP, aplicada con la fórmula `W = W0 + 4 · outer(u, m ⊙ (u @ W0))`, donde `u` es la dirección unitaria de rechazo (media de activaciones residuales en el último token de prompts rechazados menos la de prompts cumplidos) y `m` selecciona los 64 neuronas MLP cuyas columnas de salida escriben más en esa dirección y permanecen silenciosas en prompts benignos. La edición escala ×5 la escritura de esas neuronas sobre la dirección de rechazo y no toca nada más.

Los datos de desarrollo se limitan al conjunto de entrenamiento de VLGuard y el presupuesto fue de 500 forward passes. El agente de edición declarado es Claude Fable 5.1. La base mecanística, medida sobre este mismo modelo, indica que el rechazo se decide tarde (capas 19-24) y se escribe principalmente en las MLPs de las capas 23-29; el contenido dañino de la imagen no está representado linealmente en la posición de decisión, por lo que el rechazo del modelo base ante memes de odio es una decisión guiada por texto. Los controles con dirección aleatoria y columnas aleatorias normalizadas no produjeron efecto, según el autor.

## Capacidades

- Generación de texto e image-text-to-text: acepta imagen y prompt en el mismo turno mediante la plantilla de chat del modelo base.
- Conversación multi-turno con plantilla de chat propia de Qwen3-VL.
- Rechazo reforzado ante instrucciones dañinas con señal textual: la tasa de cumplimiento baja de forma medible en los subconjuntos evaluados.
- Mantiene las capacidades del modelo base en prompts benignos: 18 de 32 salidas benignas son idénticas token a token respecto al original en la evaluación de desarrollo.
- No añade rechazo condicionado por la imagen: las instrucciones neutras sobre imágenes dañinas ("describe esta imagen", "discute las implicaciones del texto") se siguen cumpliendo.
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada para este checkpoint (dependen del modelo base, no documentados aquí).
- Capacidades multilingües: no disponible.

## Casos de uso

- Moderación previa en pipelines de visión-lenguaje: colocar el modelo como primera etapa para detectar y rechazar instrucciones textuales dañinas acompañadas de imagen, aprovechando la caída de ASR_strict agregada de 0,359 a 0,203 en el conjunto held-out de VLGuard.
- Investigación en edición de pesos: usar el checkpoint como referencia reproducible de una intervención de rango bajo sobre dos tensores, con manifiesto de hashes y columnas seleccionadas en el paquete de handoff del estudio.
- Evaluación de seguridad multimodal: comparar el original y el editado con el mismo prompt y semilla para medir el efecto de la edición sobre la tasa de rechazo y la sobre-negativa, dado que el autor reporta 1/558 prompts benignos etiquetados como rechazo en held-out.
- Despliegue de asistentes sobre imágenes con requisito de rechazo textual consistente: útil cuando la política de seguridad se basa en el texto de la instrucción y no en el contenido visual, escenario en el que la edición incrementa el rechazo sin degradar salidas benignas idénticas.
- Estudio de mecanismos de rechazo: el checkpoint permite verificar empíricamente la hipótesis de que el rechazo se escribe en las MLPs de las capas 23-29, comparando activaciones con el modelo base en la misma revisión.
- Base para experimentos de dosis: el autor documenta que aproximadamente el 40% de los casos unsafes de desarrollo no eran alcanzables a ninguna dosis, por lo que el checkpoint sirve como punto de partida para estudiar qué señales visuales requerirían una intervención distinta.

## Benchmarks y rendimiento

Resultados held-out sobre VLGuard test set (1.558 prompts), BF16, greedy, 256 tokens nuevos, puntuación de rechazo por reglas, sin juez LLM. ASR_strict = proporción de salidas que no abren con un rechazo; ORR = proporción de rechazos en prompts benignos.

| Subconjunto | n | ASR_strict original → editado |
|---|---:|---|
| unsafes (imagen dañina) | 442 | 0,498 → 0,353 |
| safe_unsafes (imagen segura, instrucción dañina) | 558 | 0,249 → 0,084 |
| agregado | 1000 | 0,359 → 0,203 |
| safe_safes ORR | 558 | 0,000 → 0,002 |

Resultados de desarrollo (VLGuard training set, prompts reservados de la edición), generación greedy de 40 tokens, etiquetas por proxy de primer token más lectura asistida por reglas:

| Métrica | Original → editado |
|---|---|
| Attack success en 56 prompts de tipo unsafe | 39% → 25% |
| Unsafes | 68% → 46% |
| Safe_unsafes | 11% → 4% |
| Respuestas nuevas inseguras | 0 |
| Sobre-rechazo en 40 prompts benignos | 1/40 (imagen blanca en blanco) |
| Salidas benignas idénticas token a token | 18/32 |
| Salidas de 96 tokens repetitivas | 0/32 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB de pesos más overhead de activaciones y caché KV; el ejemplo del autor usa `device_map="cuda:0"` con `dtype=torch.bfloat16`.
- GPU recomendadas: no disponible de forma explícita; por tamaño, cabe en GPUs con 16 GB o más en BF16 y en GPUs consumer de 12-16 GB con cuantización, aunque el autor no documenta cuantizaciones.
- Cabe en consumer GPU: no confirmado por el autor; el checkpoint no publica variantes GGUF ni cuantizadas.
- Opciones de despliegue: transformers con `Qwen3VLForConditionalGeneration` y `AutoProcessor` (versión de desarrollo 4.57.5, atención SDPA). vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `utsavz/wsp_nov9_qwen3vl4b` | 4.437.815.808 | no disponible | Apache-2.0 | Edición de pesos sin gradientes sobre Qwen3-VL-4B-Instruct; ASR_strict agregado 0,203 en VLGuard held-out |
| Qwen/Qwen3-VL-4B-Instruct | mismo orden (modelo base) | no disponible | Apache-2.0 | Referencia original; ASR_strict agregado 0,359 en el mismo conjunto |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se proporcionan otros modelos comparables en la información disponible |

## Limitaciones y advertencias

- La edición es solo textual: no añade rechazo condicionado por la imagen. Las instrucciones neutras sobre imágenes dañinas se siguen cumpliendo; aproximadamente el 40% de los unsafes de desarrollo no eran alcanzables a ninguna dosis.
- Las métricas held-out usan puntuación por reglas de frase de rechazo, no un juez semántico; el equipo del estudio tiene pendiente una evaluación juzgada independiente.
- La puntuación de tasa de rechazo trata el "compromiso crítico" del modelo base (nombrar y condenar el contenido dañino mientras lo explica) como éxito de ataque; un juez semántico podría puntuar de forma distinta.
- Los números de desarrollo son de muestra pequeña y juzgados por el agente de edición.
- Riesgo de sobre-rechazo: 1/558 prompts benignos etiquetado como rechazo en held-out (una evasiva que aún responde) y 1/40 en desarrollo (imagen blanca en blanco).
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no disponible en la información proporcionada; se hereda el del modelo base.
- Restricciones de licencia: Apache-2.0, uso comercial permitido bajo los términos de dicha licencia; el checkpoint mantiene la licencia del modelo base.
- El checkpoint está pensado como artefacto de investigación; el autor no documenta cuantizaciones, despliegue en producción ni latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/utsavz/wsp_nov9_qwen3vl4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Referencia del método "Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming
