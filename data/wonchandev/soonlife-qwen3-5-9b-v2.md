# wonchandev/Soonlife-Qwen3.5-9B-v2

## Resumen

Soonlife-Qwen3.5-9B-v2 es un ajuste fino por destilación del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario wonchandev para alimentar el chatbot RAG "Soonlife" de la Universidad de Soonchunhyang (Corea del Sur). El modelo hereda la arquitectura híbrida de Qwen3.5 (atención completa combinada con capas Gated DeltaNet) y el torre de visión del modelo base, con 9.409.813.744 parámetros totales en precisión bf16. Su propósito es muy acotado: responder consultas sobre avisos y normativa universitaria usando herramientas de búsqueda, con un formato de respuesta controlado (sin bloques de código, sin HTML, sin emojis, con espaciado correcto en cifras y fechas).

La versión v2 es la variante de producción desde el 2 de noviembre de 2026 y sustituye a v1. Según la model card, reduce la repetición de búsquedas idénticas bloqueadas por el sistema anti-duplicados (10,9 % a 3,3 %), baja las reescrituras tras el control de calidad de la aplicación (27,2 % a 17,4 %) y acerca el número de llamadas a herramientas (5,29 a 4,34) y de rondas (5,74 a 4,53) a los del modelo profesor (Qwen3.8-27B). No es un modelo de propósito general: fuera del prompt de sistema y del esquema de herramientas con el que fue entrenado no hay garantía de mejora sobre el modelo base.

El interés técnico está en el método: destilación SFT de trazas de agente y respuestas RAG generadas por un profesor de 27B, con separación de las trazas en dos muestras (primera ronda con pensamiento, rondas posteriores sin él) para replicar exactamente la entrada que ve el modelo en producción. El resultado es un modelo de 9B con comportamiento de agente RAG cercano al de un profesor casi tres veces mayor, en un dominio vertical y un único idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido Qwen3.5 (`Qwen3_5ForConditionalGeneration`): atención completa + capas Gated DeltaNet, con torre de visión |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens (límite de entrenamiento; las muestras que lo superaban se descartaron) |
| Tipos de cuantización | bf16 (este repositorio); FP8 dinámico en el repositorio de servicio; GGUF y AWQ no publicados (la model card los menciona como destino previsto de este repositorio) |
| Idiomas soportados | coreano (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), repositorio de 18,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con torre de visión y una mezcla de capas de atención completa y capas Gated DeltaNet (atención lineal con estado recurrente), según se deduce de las proyecciones incluidas en el ajuste LoRA (`in_proj_qkv`, `in_proj_z`, `out_proj`). El ajuste se aplicó como LoRA con r=32, alpha=32 y dropout 0,0 sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj` del modelo de lenguaje; la torre de visión y los pesos de decodificación especulativa (MTP) quedaron intactos. El adaptador se fusionó posteriormente en un checkpoint bf16.

El entrenamiento es una destilación SFT desde un profesor Qwen3.8-27B que generó respuestas y trazas de agente con el mismo prompt RAG y las mismas herramientas que se usan en producción. El conjunto consta de tres bloques: 3.000 respuestas en formato RAG (24,6 M tokens), 1.728 muestras de la primera ronda de trazas con pensamiento (23,8 M tokens, con refuerzo ×4 en 148 trazas de recuperación tras cambiar la búsqueda o de cierre limpio) y 1.604 muestras con el pensamiento eliminado para las rondas restantes y la respuesta final (33,0 M tokens). En total, 6.332 líneas y 81,4 M tokens, de los cuales solo 2,99 M llevan pérdida. Se entrenó 1,5 épocas con lr 1e-4, coseno, batch efectivo 16 y máximo 32.768 tokens en 3,5 horas sobre una H100; la pérdida media de entrenamiento fue 0,1689 y las validaciones finales 0,2684 (respuestas) y 0,2709 (trazas). Las 21 trazas con imágenes se convirtieron a un marcador textual `[그림]` en lugar de procesarse con la torre de visión.

## Capacidades

- Generación de respuestas RAG en coreano sobre avisos y normativa universitaria, con formato controlado: sin bloques de código, sin HTML y sin emojis en la gran mayoría de casos (12,7 % de respuestas con emoji en la evaluación de formato RAG).
- Llamada a herramientas (tool calling) con un esquema concreto de búsqueda y consulta de avisos; el modelo elige las herramientas y encadena varias rondas de forma autónoma (media de 4,34 llamadas y 4,53 rondas en el conjunto de evaluación de agente).
- Razonamiento multi-paso con modo de pensamiento limitado a la primera ronda, replicando el flujo de la aplicación de producción (las rondas siguientes se envían sin el pensamiento previo).
- Recuperación tras búsquedas fallidas: el entrenamiento refuerza trazas en las que el modelo cambia la consulta y vuelve a buscar.
- Control de fidelidad factual parcial: reduce cifras y enlaces no presentes en el material recuperado (0,0 % de cifras inventadas en el flujo de agente de v2), aunque no las elimina por completo en el flujo RAG directo (1,3 % de cifras y 2,9 % de enlaces).
- Entrada de imágenes soportada por la arquitectura (pipeline `image-text-to-text`), pero no entrenada en este ajuste; las trazas con imágenes se textualizaron durante el entrenamiento.
- No se declaran capacidades generales de código, matemáticas o conversación abierta más allá del dominio; el modelo base las conserva, pero el ajuste no las refuerza.

## Casos de uso

- Chatbot de atención al estudiante sobre avisos y reglamentos: el modelo responde consultas en coreano citando el material recuperado, con formato limpio y sin código ni HTML, adecuado para integrarse en una interfaz de chat institucional. Es el caso para el que fue entrenado y el único con garantías declaradas.
- Agente RAG con búsqueda iterativa: el modelo decide cuándo buscar, cuándo abrir un aviso completo y cuándo reformular la consulta; su tasa de búsquedas duplicadas bloqueadas (3,3 %) lo hace viable en aplicaciones con protección anti-repetición.
- Automatización de respuestas con control de calidad posterior: la tasa de reescritura tras la comprobación de calidad de la aplicación bajó al 17,4 %, lo que reduce el coste de un pipeline con un segundo modelo revisor o con reglas de validación.
- Extracción de información de documentos institucionales con restricciones de fidelidad: útil cuando se exige que las cifras y enlaces de la respuesta provengan del material recuperado, con una tasa de cifras inventadas del 0,0 % en el flujo de agente.
- Servicio en producción con FP8: el repositorio hermano `Soonlife-Qwen3.5-9B-v2-FP8` está pensado para vLLM con cuantización dinámica FP8, temperatura 0,1 y `max_tokens` 4096, con una latencia mediana de 11 s en el flujo RAG y 32 s en el flujo de agente completo.
- Base para ajustes adicionales o cuantizaciones: al ser un checkpoint bf16 fusionado, sirve como origen para generar GGUF, AWQ u otras variantes y para reentrenamientos con LoRA sobre el dominio.
- Evaluación comparativa de destilación: útil como referencia en experimentos sobre destilación de trazas de agente desde modelos de 27B a modelos de 9B, con métricas de comportamiento publicadas (llamadas, rondas, reescrituras, duplicados).

## Benchmarks y rendimiento

Los datos publicados son evaluaciones internas del autor sobre el split de test del dataset (314 preguntas para el formato RAG, 92 para el flujo de agente), no benchmarks estándar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

Flujo RAG (314 preguntas, vLLM FP8, temperature 0,1, `max_tokens` 4096, sin pensamiento):

| Métrica | teacher (27B) | base (Qwen3.5-9B FP8) | lora-v1 | lora-v2 |
|---|---:|---:|---:|---:|
| Respuestas vacías ↓ | 0,0 % | 0,0 % | 0,0 % | 0,0 % |
| Empieza por "no encontrado" ↓ | 7,3 % | 3,5 % | 6,7 % | 9,2 % |
| Cifras ausentes en el material ↓ | 0,0 % | 2,5 % | 1,0 % | 1,3 % |
| Enlaces ausentes en el material ↓ | 1,6 % | 3,8 % | 1,9 % | 2,9 % |
| Imágenes ausentes en el material ↓ | 0,0 % | 1,6 % | 0,6 % | 0,6 % |
| Respuestas con imagen ↑ | 11,5 % | 11,1 % | 9,9 % | 10,5 % |
| Recuperación de cifras del teacher ↑ | 1,00 | 0,61 | 0,80 | 0,81 |
| Espaciado incorrecto en cifras ("4 월") ↓ | 0,0 % | 65,9 % | 0,3 % | 0,3 % |
| Salida de código o HTML ↓ | 0,0 % | 10,2 % | 0,0 % | 0,0 % |
| Emojis ↓ | 13,7 % | 15,9 % | 14,0 % | 12,7 % |
| Longitud mediana de respuesta (caracteres) | 868 | 921 | 802 | 832 |
| Truncamiento por límite ↓ | — | 0,0 % | 0,0 % | 0,0 % |
| Tiempo mediano (s) ↓ | — | 14 | 11 | 11 |

Flujo de agente (92 preguntas, herramientas de búsqueda y consulta de avisos, pensamiento solo en la primera ronda):

| Métrica | lora-v1 | lora-v2 | lora-v2b (1 época) |
|---|---:|---:|---:|
| Respuestas vacías ↓ | 0,0 % | 0,0 % | 0,0 % |
| Empieza por "no encontrado" ↓ | 16,3 % | 16,3 % | 19,6 % |
| Cifras ausentes en el material ↓ | 1,1 % | 0,0 % | 3,3 % |
| Enlaces ausentes en el material ↓ | 0,0 % | 0,0 % | 0,0 % |
| Imágenes ausentes en el material ↓ | 0,0 % | 0,0 % | 0,0 % |
| Respuestas con imagen ↑ | 9,8 % | 9,8 % | 7,6 % |
| Espaciado incorrecto en cifras ↓ | 0,0 % | 0,0 % | 0,0 % |
| Salida de código o HTML ↓ | 0,0 % | 0,0 % | 0,0 % |
| Emojis ↓ | 12,0 % | 12,0 % | 12,0 % |
| Longitud mediana de respuesta (caracteres) | 624 | 712 | 684 |
| Responde sin usar herramientas ↓ | 1,1 % | 0,0 % | 0,0 % |
| Llamadas a herramientas (media) | 5,29 | 4,34 | 5,08 |
| Rondas (media) | 5,74 | 4,53 | 5,39 |
| Apertura del aviso original ↑ | 28,3 % | 30,4 % | 28,3 % |
| Reescritura tras control de calidad ↓ | 27,2 % | 17,4 % | 25,0 % |
| Truncamiento por límite ↓ | 0,0 % | 0,0 % | 0,0 % |
| Tiempo mediano (s) ↓ | 35 | 32 | 37 |

Además, la model card informa de que el bloqueo por búsquedas duplicadas bajó del 10,9 % al 3,3 % (referencia del teacher: 2,7 %), con significación estadística en la comparación v1→v2 (p=0,04); la diferencia entre v2 y v2b en reescrituras no fue significativa (p=0,19). El teacher logra 7,2 % de "no encontrado" y 4,05 llamadas / 4,23 rondas, valores todavía mejores que v2.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19 GB solo para pesos, más caché KV y activaciones; en la práctica requiere GPUs de 24 GB o más, con margen cómodo en 40-80 GB.
- VRAM estimada en FP8 dinámico: alrededor de 10 GB para pesos, más caché KV; viable en GPUs de 16-24 GB.
- GPUs recomendadas: H100 (usada en el entrenamiento y en la evaluación con vLLM), A100 40/80 GB, L40S. En consumer, una RTX 4090 (24 GB) puede ejecutar la variante FP8; en bf16 queda muy justa y depende de la longitud de contexto.
- Despliegue: vLLM con la variante FP8 es la configuración de referencia del autor (temperatura 0,1, `max_tokens` 4096). El repositorio bf16 es la base para generar GGUF o AWQ con llama.cpp, Ollama o AutoAWQ, aunque el autor no publica esas variantes.
- Latencia observada en la evaluación: mediana de 11 s por respuesta en el flujo RAG y 32 s en el flujo de agente completo, con 4-5 rondas de herramientas. No se publican cifras de throughput (tokens/s).
- Carga en transformers: `AutoModelForImageTextToText` con `dtype="bfloat16"` y `device_map="auto"`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2 | 9,41 B | 32.768 (entrenamiento) | Destilación RAG/agente en coreano sobre Qwen3.5-9B | Apache 2.0 | HuggingFace (este repositorio), FP8 y LoRA |
| Qwen/Qwen3.5-9B (base) | 9 B | no disponible en la información | Modelo multimodal generalista | no disponible en la información | HuggingFace |
| Qwen3.8-27B (teacher) | 27 B | no disponible en la información | Profesor usado para generar los datos | no disponible en la información | No se referencia repositorio público en la model card |
| Soonlife-Qwen3.5-9B-v2b-FP8 | 9,41 B | 32.768 (entrenamiento) | Misma receta con 1,0 época; variante de control | Apache 2.0 | HuggingFace |

La comparación relevante es contra el modelo base: en el flujo RAG, v2 pasa de 65,9 % a 0,3 % de espaciado incorrecto en cifras, de 10,2 % a 0,0 % de salidas con código o HTML y de 0,61 a 0,81 en recuperación de cifras del teacher, a costa de un aumento de respuestas que empiezan por "no encontrado" (3,5 % a 9,2 %). Frente al teacher de 27B, v2 se queda corto en tasa de "no encontrado" (16,3 % frente a 7,2 % en el flujo de agente) y en número de rondas (4,53 frente a 4,23), pero iguala la tasa de reescritura tras control de calidad (17,4 % frente a 17,1 %).

## Limitaciones y advertencias

- Modelo vertical: entrenado exclusivamente para el chatbot RAG de avisos y normativa de la Universidad de Soonchunhyang. Fuera de ese prompt de sistema y de ese esquema de herramientas no hay garantía de mejora sobre Qwen3.5-9B, y el ajuste puede degradar el comportamiento generalista del base.
- Idioma: solo se declara coreano; no se ha evaluado el rendimiento en castellano ni en otros idiomas.
- Alucinación: persiste un 1,3 % de respuestas con cifras y un 2,9 % con enlaces no presentes en el material recuperado en el flujo RAG, y un 9,2 % de respuestas que empiezan por "no encontrado" (el propio autor señala que parte de ellas son respuestas parciales con la salvedad indicada al inicio, por lo que la tasa real de rechazo es menor).
- La torre de visión no se entrenó: las trazas con imágenes se sustituyeron por el marcador textual `[그림]`, de modo que la comprensión real de imágenes no está validada para este ajuste.
- La decodificación especulativa (MTP) usa los pesos originales sin ajustar; al activarla, la tasa de aceptación puede ser algo inferior a la del modelo base.
- El contexto de entrenamiento es de 32.768 tokens y las muestras más largas se descartaron en lugar de truncarse; no se documenta soporte más allá de esa longitud.
- El autor advierte de que las diferencias entre v2 y v2b en algunas métricas no son estadísticamente significativas (p=0,19 en reescrituras), por lo que el efecto de la época es una hipótesis, no un resultado consolidado.
- Sin descargas ni valoraciones en el momento de la consulta; no hay validación independiente de las métricas publicadas, que proceden del propio autor.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-9B tiene sus propias condiciones, que deben verificarse antes de un despliegue comercial.

## Enlaces

- Repositorio principal (bf16): https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Variante FP8 para servicio: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-FP8
- Adaptador LoRA y registro de entrenamiento: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-LoRA
- Variante de control con 1,0 época: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
