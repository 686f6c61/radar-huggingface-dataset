# zanezhang666/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF

## Resumen

Qwen3.8-27B RVN Heretic Abliterated Uncensored es una variante del modelo Qwen3.8-27B de Alibaba (familia Qwen3.8) a la que se le ha aplicado un proceso de "abliteration" para eliminar los mecanismos de rechazo de peticiones dañinas. El autor de la ficha, zanezhang666, parte de la abliteración ARA realizada por Tim Rohrbaugh (trohrbaugh) y aplica dos pasadas adicionales de ARA (Arbitrary-Rank Ablation) para reducir las negativas residuales. El resultado se distribuye principalmente en formato GGUF para llama.cpp, con cuantizaciones que incluyen imatrix y cabezas MTP para decodificación especulativa.

El modelo mantiene la arquitectura original de Qwen3.8: un transformer híbrido con atención estándar y capas Gated DeltaNet de atención lineal, 64 capas en total, 26.895.998.464 parámetros (~27B), contexto de 262.144 tokens y un vocabulario de 248.320 entradas. La licencia Apache-2.0 se conserva del modelo base, aunque el propósito declarado del autor es investigación, escritura creativa y roleplay para público adulto.

La relevancia de esta ficha radica en que documenta un caso de modificación de pesos con impacto medible en el comportamiento de rechazo (de 3/100 a 0-1/100 según el autor) manteniendo una divergencia KL baja (≈0,0085). Es un ejemplo técnico de las técnicas de abliteración por optimización matricial y de sus implicaciones para el despliegue responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_text` (familia Qwen3.8), híbrida: atención estándar + Gated DeltaNet (atención lineal) |
| Parametros totales | 26.895.998.464 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF con cuantizaciones del autor; se mencionan variantes imatrix y archivos `*-mtp.gguf`; no se detalla la lista completa de niveles Q en la información disponible |
| Idiomas soportados | no disponible (la model card menciona artefactos "multilingual", pero no enumera idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repo también incluye safetensors/transformers según los tags |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida denominada `qwen3_5_text`, con 64 capas: 16 de atención estándar y 48 de Gated DeltaNet (atención lineal). Los detalles de atención incluyen hidden size 5120, 24 cabezas de atención, 4 cabezas KV con GQA, dimensión de cabeza 256 y vocabulario de 248.320 tokens. La información proporcionada no detalla el número de tokens de entrenamiento del modelo base ni la composición del dataset, ni si hubo RLHF o DPO; esos datos corresponden a Qwen y no se reproducen aquí.

La modificación principal es la abliteración ARA (Arbitrary-Rank Ablation), implementada en la herramienta heretic (p-e-w/heretic). A diferencia de la abliteración direccional clásica, que resta una única dirección de rechazo, ARA formula el problema como una optimización matricial: recoge activaciones sobre prompts "buenos" y "malos" y usa un optimizador LBFGS para reescribir las matrices de peso de las proyecciones de salida de atención y down-projection del MLP. El objetivo combina preservar las salidas en prompts buenos (KL bajo), acercar las salidas en prompts malos a la variedad de salidas buenas (vecinos k-NN) y alejarlas de las salidas originales malas (sobrecorrección). El autor declara tres pasadas totales: una de trohrbaugh (KL 0,0535, 3/100 rechazos) y dos adicionales propias con parámetros start 26, end 56, preserve 0,9432, steer 0,0009, overcorrect 0,5038, neighbor 10, hasta KL ≈0,0085 y 0-1/100 rechazos.

## Capacidades

- Generación de texto conversacional y de formato largo, orientada a roleplay y escritura creativa sin rechazos en las categorías ablacionadas.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B, aunque no se documentan evaluaciones específicas tras la abliteración.
- Soporte de tool calling / function calling compatible con la API de OpenAI: la model card indica que los artefactos multilingües pasaron una prueba real de tool-call y control de "thinking" por archivo.
- Plantilla de chat oficial de Qwen3.8 embebida en los GGUF, incluyendo control de modo thinking.
- Decodificación especulativa mediante la cabeza MTP (Multi-Token Prediction / NextN) en los archivos `*-mtp.gguf`.
- Capacidades multilingües: la model card menciona una familia de GGUF "multilingual", pero no enumera los idiomas cubiertos.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Roleplay y narrativa interactiva para público adulto: el modelo está diseñado explícitamente para conversaciones multi-turno sin rechazos en temáticas que el modelo base filtraría, con contexto de 262K tokens para mantener coherencia en sesiones largas.
- Escritura creativa de ficción con contenido sensible: permite desarrollar tramas, diálogos y escenas que el modelo base rechazaría, manteniendo la calidad de redacción del Qwen3.8-27B original.
- Investigación sobre alineación y seguridad: sirve como objeto de estudio para medir el efecto de la abliteración ARA en el comportamiento de rechazo y en la degradación de capacidades (KL ≈0,0085 declarado).
- Evaluación de técnicas de edición de pesos: útil para reproducir y comparar abliteración direccional frente a ARA por optimización matricial en un modelo de 27B con capas DeltaNet.
- Despliegue local con llama.cpp: los GGUF permiten ejecutar el modelo en estaciones de trabajo y, según cuantización, en GPUs de consumo, con la plantilla de chat y el tool calling ya integrados.
- Generación de datos sintéticos para entrenamiento: puede producir diálogos y textos en dominios que otros modelos rechazan, siempre que el uso cumpla la legislación aplicable y las políticas del despliegue.
- Pruebas de robustez de filtros y clasificadores: útil para generar prompts y respuestas que evalúen la eficacia de sistemas de moderación propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente aporta métricas del proceso de abliteración, que se recogen en la tabla siguiente:

| Metrica | Modelo fuente (trohrbaugh heretic-ara) | RVN (esta ficha) |
|---|---|---|
| Rechazos ante prompts dañinos | 3/100 | 0-1/100 |
| Divergencia KL | 0,0535 | ≈0,0085 |

No se aportan datos de MMLU, HumanEval, GSM8K ni de evaluaciones de calidad tras la abliteración.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa por tamaño (27B), una cuantización Q4 requiere del orden de 16-18 GB, Q5 en torno a 19-21 GB, Q6 cerca de 22-24 GB y Q8 aproximadamente 28-30 GB; estas cifras son estimaciones por parámetros y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar uso en A100 40/80 GB, H100 y RTX 4090 (24 GB) con cuantizaciones Q4-Q5; no confirmado por el autor.
- GPU de consumo: viable en RTX 4090 con cuantizaciones bajas; en GPUs de 16 GB requeriría cuantizaciones Q4 o inferiores y posible offload a CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), y por compatibilidad de plantilla, servidores con API compatible con OpenAI; los tags indican `endpoints_compatible`. No se confirma soporte de vLLM o TGI para estos GGUF.
- Latencia y throughput: no disponibles. La variante `*-mtp.gguf` incorpora la cabeza MTP para decodificación especulativa, lo que puede mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B RVN Heretic Abliterated (esta ficha) | ~27B | 262.144 | Apache-2.0 | GGUF (+ safetensors) | Abliteración ARA de 3 pasadas, rechazos 0-1/100, KL ≈0,0085 |
| trohrbaugh/Qwen3.8-27B-heretic-ara | ~27B | 262.144 (heredado del base) | Apache-2.0 | no disponible | Abliteración ARA de 1 pasada, rechazos 3/100, KL 0,0535 |
| Qwen/Qwen3.8-27B (base) | ~27B | 262.144 | Apache-2.0 | safetensors | Modelo original con salvaguardas intactas |
| Otras variantes abliteradas de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El modelo reduce deliberadamente las salvaguardas de seguridad: puede generar contenido dañino, ilegal o explícitamente adulto. El autor lo restringe a público adulto (18+) y a investigación, escritura creativa y roleplay.
- Riesgo elevado de alucinación y de respuestas incorrectas en dominios sensibles, agravado por la falta de evaluaciones de calidad posteriores a la abliteración.
- La abliteración puede degradar capacidades no relacionadas con el rechazo; el autor declara un daño bajo (KL ≈0,0085), pero no aporta benchmarks que lo confirmen.
- No se enumeran los idiomas soportados ni se detalla el comportamiento multilingüe tras la modificación.
- La licencia Apache-2.0 permite uso comercial, pero el despliegue de un modelo sin salvaguardas puede incumplir normativas locales (por ejemplo, la Ley de IA de la UE o la DSA) y las políticas de las plataformas de alojamiento; la responsabilidad recae en el desplegador.
- El repositorio incluye archivos "legacy" de una abliteración anterior; el propio autor recomienda usar las variantes RVN para nuevos despliegues.
- El tamaño del repositorio (1645,3 GB) implica costes de almacenamiento y descarga considerables; conviene seleccionar únicamente la cuantización necesaria.
- No hay datos de benchmarks ni de latencia que permitan garantizar un rendimiento concreto en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zanezhang666/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fuente de la abliteración ARA: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Herramienta heretic (ARA): https://github.com/p-e-w/heretic
