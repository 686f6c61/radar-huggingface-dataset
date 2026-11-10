# utsavz/wsp_nov10_qwen3vl2b_opus

## Resumen

WSP safety edit de Qwen3-VL-2B-Instruct es un checkpoint de investigación publicado por el usuario utsavz en Hugging Face, derivado del modelo multimodal Qwen/Qwen3-VL-2B-Instruct mediante una técnica de edición de pesos en espacio de pesos (weight-space programming, WSP). Un agente LLM (Claude Opus 5.5, según el registro del experimento) modificó directamente los pesos del modelo base para incrementar su tasa de rechazo ante peticiones multimodales de tipo jailbreak, sin usar gradientes, optimizador ni ajuste sobre datos de entrenamiento.

El modelo conserva la arquitectura, los nombres de tensores, las formas y los dtypes del base: 2.127.532.032 parámetros en BF16, pipeline image-text-to-text y licencia Apache 2.0. Solo se alteraron 3 de 625 tensores (36.832 parámetros, un 0,0017% del total), concretamente seis neuronas del MLP de la capa 18 del modelo de lenguaje.

Es relevante ahora porque demuestra que una intervención quirúrgica de pesos puede reducir de forma medible la tasa de éxito de ataques (ASR) en un modelo visión-lenguaje pequeño, con un coste mínimo en sobre-rechazo de entradas benignas. No obstante, es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta, sin datos de idiomas declarados y con una evaluación limitada a VLGuard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-language; edición sobre MLP de la capa 18 del language model |
| Parámetros totales | 2.127.532.032 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 4,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-2B-Instruct, un transformer multimodal que procesa imágenes y texto. La intervención WSP no reentrena el modelo: sustituye seis neuronas poco usadas (índices 1505, 2873, 4007, 4458, 4559 y 4910) del MLP de la capa 18 por tres pares de "detectores de daño implantados" construidos en forma cerrada. Cada par combina una fila de `gate_proj` (lectura) con una dirección de diferencia de medias "dañino pero no rechazado" medida sobre la entrada del MLP, un umbral fijado contra la dirección media de activación (el modelo de texto no tiene términos de bias) y una columna de `down_proj` (escritura) que empuja a lo largo de la dirección de rechazo propia del modelo en el stream residual. Los dos pares forman una rampa recortada que satura, evitando que entradas fuertes provoquen desbordamientos hacia respuestas fuera de distribución o en chino.

El presupuesto de forward passes fue de 500, de los cuales se usaron 310 antes de congelar el modelo. Los datos de desarrollo fueron `VLGuard train.json` más ejemplos escritos por el agente. No se emplearon gradientes, pasos de optimizador, mínimos cuadrados ni ajuste iterativo; todas las direcciones y umbrales provienen de medias, diferencias de medias y cuantiles de activaciones. Los tres tensores modificados son `gate_proj.weight` [6144, 2048] (6 filas, rank 6, norma relativa 5,28%), `up_proj.weight` [6144, 2048] (6 filas, rank 6, 4,68%) y `down_proj.weight` [2048, 6144] (6 columnas, rank 6, 5,64%). Los otros 622 tensores y todos los ficheros no-peso son idénticos bit a bit a la revisión base.

## Capacidades

- Generación de texto e imagen-a-texto (image-text-to-text) heredada de Qwen3-VL-2B-Instruct.
- Respuesta conversacional multimodal con plantilla de chat propia (imagen primero).
- Rechazo reforzado de peticiones multimodales dañinas: reducción del ASR en el conjunto de test VLGuard.
- Mayor rechazo ante instrucciones dañinas escritas en texto (`safe_unsafes`).
- Capacidad de describir imágenes y responder preguntas interpretativas sobre ellas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la evaluación reporta ausencia de deriva de idioma (salidas con caracteres CJK: 1 → 1).
- Capacidades especiales: no disponible (no se documenta thinking mode, audio ni visión más allá del pipeline declarado).

## Casos de uso

- Moderación multimodal de contenido: el modelo puede emplearse como filtro de segunda línea que recibe imagen y pregunta y decide si la combinación es dañina, aprovechando la reducción de ASR del 33,5% al 10,2% en el conjunto harmful de VLGuard.
- Investigación en seguridad de VLMs: sirve como caso de estudio reproducible de edición de pesos sin gradientes, con verificación tensor a tensor y métricas de sobre-rechazo, para comparar técnicas de alineación quirúrgica.
- Evaluación de robustez ante jailbreaks: útil para medir cómo responde un modelo pequeño (2B) a ataques tipográficos y a instrucciones dañinas, dado que el propio autor documenta que los ataques tipográficos no mejoraron.
- Despliegue en entornos con recursos limitados: al ser un modelo de 2B en BF16 con repo de 4,3 GB, puede cargarse en una sola GPU consumer para prototipos de clasificación imagen-texto.
- Generación de descripciones de imágenes con salvaguardas: para pipelines de captioning donde se quiere evitar que el modelo entre en contenido sensible cuando la imagen es ambigua.
- Base para estudios comparativos de alineación: permite contrastar el checkpoint editado con el base original bajo el mismo protocolo (greedy, 256 tokens, plantilla de chat) para aislar el efecto de la edición.
- Análisis de sobre-rechazo: útil para estudiar el equilibrio entre seguridad y utilidad, con datos concretos (sobre-rechazo 0,4% → 1,3% y ROUGE-L F1 0,168 → 0,166 en benignos).

## Benchmarks y rendimiento

Evaluación en el conjunto de test held-out VLGuard (1.558 prompts), greedy decoding, hasta 256 tokens nuevos, intervalos de confianza Wilson al 95%:

| Subconjunto | n | Métrica | Original | Editado |
|---|---:|---|---:|---:|
| Imágenes dañinas (`unsafes`) | 442 | ASR | 49,8% [45,1; 54,4] | 19,5% [16,0; 23,4] |
| Instrucciones dañinas (`safe_unsafes`) | 558 | ASR | 20,6% [17,5; 24,2] | 2,9% [1,8; 4,6] |
| Todos los dañinos | 1.000 | ASR | 33,5% [30,6; 36,5] | 10,2% [8,5; 12,2] |
| Benignos (`safe_safes`) | 558 | Sobre-rechazo | 0,4% [0,1; 1,3] | 1,3% [0,6; 2,6] |
| Benignos (`safe_safes`) | 541 con respuesta de referencia | ROUGE-L F1 vs referencia | 0,168 | 0,166 |

Comparación prompt a prompt: 234 prompts dañinos pasaron de cumplir a rechazar y 1 al contrario; en benignos, 7 pasaron a rechazo y 2 dejaron de rechazar. El ASR bajó en todas las categorías de daño. El mayor fallo restante son imágenes sexualmente explícitas con preguntas neutras tipo "What is the image showing?" (81,1% → 40,5%). La longitud media de respuesta benigna pasó de 148,9 a 145,7 palabras. En desarrollo (128 ítems, 32 tokens nuevos) se reportan tasas de rechazo en el conjunto de desarrollo, pero la información disponible está truncada y no se detallan las cifras completas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,3 GB de pesos más overhead de activaciones y procesador de visión; el repo ocupa 4,3 GB.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño (2B), cabe en GPUs consumer con al menos 8 GB de VRAM en BF16.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores; no confirmado por el autor.
- Opciones de despliegue: transformers (probado con transformers 4.57.5 y torch 2.10.0, `device_map="auto"`); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| utsavz/wsp_nov10_qwen3vl2b_opus | 2,13B | no disponible | Edición WSP de seguridad sobre Qwen3-VL-2B | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-VL-2B-Instruct | 2B (aprox.) | no disponible | Modelo base multimodal instruct | no disponible | Hugging Face |
| Alternativas de moderación multimodal de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de moderación multimodal en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Los ataques tipográficos (petición dañina escrita dentro de la imagen) no mejoraron durante el desarrollo.
- El mayor fallo restante son imágenes sexualmente explícitas con preguntas neutras: ASR del 40,5% tras la edición.
- El sobre-rechazo en benignos sube del 0,4% al 1,3%; 7 respuestas benignas pasaron a rechazo, entre ellas preguntas interpretativas sobre imágenes de personas o memes políticos.
- La evaluación se limita a VLGuard; no hay datos de MMLU, HumanEval, GSM8K ni de otros benchmarks generales.
- No se declaran idiomas soportados; la única evidencia es la ausencia de deriva hacia caracteres CJK (1 → 1).
- No se documenta la longitud de contexto del modelo base en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación de robustez fuera del conjunto evaluado.
- La edición se concentra en una sola capa (18) y seis neuronas; su generalización a otros dominios de daño no está evaluada.
- No hay información sobre tool calling, agentes ni cuantizaciones publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/utsavz/wsp_nov10_qwen3vl2b_opus
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Revisión base referenciada: `89644892e4d85e24eaac8bacfd4f463576704203`
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
