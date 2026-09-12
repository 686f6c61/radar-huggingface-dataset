# stbenjam/qwen3-4b-claudish-mlx-lora

## Resumen

stbenjam/qwen3-4b-claudish-mlx-lora es un adaptador LoRA en formato MLX entrenado sobre la conversión cuantizada a 4 bits de Qwen3-4B-Instruct-2507 (mlx-community/Qwen3-4B-Instruct-2507-4bit). No es un modelo autónomo ni un adaptador PEFT: es un ajuste de estilo, de carácter educativo y experimental, que busca reproducir el registro de escritura asociado a los asistentes de Anthropic (prosa extensa, contrastes enfáticos, expresiones como "load-bearing" o "earns its keep"). El autor lo publica como parodia educativa y deja explícito que no contiene pesos de Claude y que no tiene ninguna afiliación con Anthropic.

El entrenamiento es deliberadamente pequeño: LoRA de rango 16 sobre las matrices query y value de la atención en las 12 capas finales, lo que supone 1.966.000 parámetros entrenables, con batch size 2, learning rate 0,00001, escala LoRA 8 y secuencias de 2.048 tokens. El corpus combina 256 respuestas de instrucción públicas filtradas con 23 respuestas paródicas originales ponderadas al doble, es decir, 302 filas y 279 ejemplos únicos. Todo el proceso se ejecutó en local sobre un Apple M4 Pro con 48 GB de memoria unificada, y el checkpoint elegido es el update 40.

Su relevancia no está en el rendimiento, sino en la documentación del proceso: el propio autor declara que el objetivo de entrenamiento no se ha alcanzado, que los checkpoints posteriores desarrollaron repeticiones severas y que las respuestas pueden ser verborreicas y reconocibles pero incorrectas. Con 0 descargas y 0 likes en el momento de la consulta, debe tratarse como una pieza de estudio sobre post-entrenamiento local con MLX en Apple Silicon, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA de rango 16 sobre matrices query y value de la atención en las 12 capas finales |
| Parámetros totales | 4.000 millones en el modelo base; 1.966.000 parámetros entrenables en el adaptador |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó un límite de secuencia de 2.048 tokens) |
| Tipos de cuantización | base fijada a 4 bits en formato MLX; existe una variante GGUF Q4_K_M publicada aparte (stbenjam/qwen3-4b-claudish-gguf) |
| Idiomas soportados | inglés (declarado en la model card; el corpus de entrenamiento es en inglés) |
| Licencia | Apache-2.0 (tanto para este release como para el modelo base Qwen) |
| Formato de pesos | no disponible en detalle; el adaptador se distribuye como LoRA de MLX y requiere el base cuantizado fijado. El repositorio figura con 0,0 GB en el momento de la consulta |

Datos adicionales de entrenamiento: rango LoRA 16, batch size 2, learning rate 0,00001, escala LoRA 8, límite de secuencia 2.048 tokens, checkpoint update 40, entrenado en un M4 Pro con 48 GB. Configuración de generación recomendada por el autor: hasta 1.536 tokens, temperatura 0,7, top-p 0,8, top-k 20. Versiones probadas: MLX LM 0.31.3 y MLX 0.32.2.

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros en su variante no thinking, convertido a 4 bits por mlx-community. Sobre esa base se aplica un LoRA de rango 16 que solo modifica las proyecciones query y value de la atención en las últimas 12 capas. La adaptación es, por tanto, muy superficial en términos de parámetros (1,966 millones) y está orientada exclusivamente a transferencia de estilo, no a incorporar conocimiento nuevo.

El corpus de entrenamiento tiene 302 filas y 279 ejemplos únicos: 256 respuestas de instrucción públicas filtradas más 23 respuestas paródicas originales con peso doble. El dataset de origen es angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k, cuya model card declara Apache-2.0 y atribuye sus salidas sintéticas a Claude; el autor del adaptador señala expresamente que esa atribución no ha sido verificada de forma independiente. No se documenta uso de RLHF ni de DPO: el ajuste es puramente supervisado sobre pares instrucción-respuesta. El autor reconoce que el entrenamiento no enseñó de forma fiable la voz deseada y que los checkpoints más avanzados degeneraron en repeticiones severas, motivo por el que seleccionó el update 40. El repositorio incluye un manifiesto de datos con la revisión de origen, los filtros, la ponderación y los hashes, además de una plantilla ChatML corregida sin modo thinking (train_template.jinja).

## Capacidades

- Generación de texto en inglés con un registro estilístico marcado: prosa extensa, contrastes enfáticos y expresiones características, siempre que se use el prompt de estilo (style.txt) como system prompt.
- Conversación multi-turno básica en la demo, aunque cada pregunta arranca de contexto nuevo salvo que se active el modo experimental de memoria (--history).
- Comparación directa con y sin adaptador: la demo en Python permite desactivar el adaptador (--base) o el prompt de estilo (--raw) para evaluar los pesos crudos.
- No soporta tool calling ni function calling: el autor indica explícitamente que el modelo no tiene herramientas.
- No dispone de información en vivo ni acceso a fuentes externas.
- Capacidades multilingües: no. El modelo está declarado únicamente para inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio. El autor distribuye una plantilla ChatML no thinking corregida para el chat.

## Casos de uso

- Estudio de transferencia de estilo con LoRA: permite analizar en un caso real y reproducible cómo un ajuste de rango 16 sobre 12 capas afecta al registro de salida sin alterar apenas los parámetros del modelo, usando --raw y --base para aislar el efecto.
- Docencia sobre post-entrenamiento en Apple Silicon: el flujo completo (clonado del repositorio, entorno uv con Python 3.12, preparación de modelos y chat coloreado) sirve como material práctico para explicar QLoRA y MLX en un M4 Pro de 48 GB.
- Investigación sobre atribución y procedencia de datos sintéticos: el repositorio incluye ATTRIBUTION.md, training-data-manifest.json y selection.json con el checkpoint y su SHA-256, lo que permite auditar de dónde sale cada ejemplo y qué se modificó.
- Evaluación de la relación entre prompt de sistema y comportamiento: la demo demuestra que un prompt de estilo exagerado induce detalles no respaldados y relleno irrelevante, un caso útil para estudiar cómo el prompting amplifica fallos latentes.
- Prototipado de asistentes con voz editorial propia: equipos que quieran explorar un tono muy marcado en inglés pueden usar el adaptador como referencia de partida, asumiendo que el resultado es experimental y requiere validación manual.
- Pruebas de despliegue local sin Python mediante Ollama: la variante GGUF Q4_K_M permite lanzar el modelo con `ollama run hf.co/stbenjam/qwen3-4b-claudish-gguf:Q4_K_M` para experimentar con el estilo en un portátil, sin necesidad de montar un entorno MLX.
- Análisis de modos de fallo: la tendencia documentada a inventar hechos, sobrerresponder y repetir frases favoritas lo convierte en un banco de pruebas para técnicas de detección de alucinación y de control de verbosidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que sus comparaciones son experimentos pequeños y no benchmarks amplios de precisión ni de equivalencia con Claude. Lo que sí documenta en RESULTS.md es una revisión cualitativa de respuestas, separada de métricas de longitud y de frecuencia de frases, comparando el mismo base cuantizado a 4 bits con y sin el adaptador. No se ofrecen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- Pesos del modelo base en 4 bits: aproximadamente 2,3 GB. Estimación para 4.000 millones de parámetros a 4 bits.
- Peso del adaptador: 1.966.000 parámetros, alrededor de 8 MB en fp32 y 4 MB en bf16. Cifra calculada a partir del número de parámetros publicados.
- Memoria necesaria para inferencia: del orden de 3 a 4 GB en memoria unificada con ventanas cortas, creciendo con la longitud de contexto por la caché KV. Es una estimación, no una medición publicada.
- Entrenamiento documentado: Apple M4 Pro con 48 GB de memoria unificada, ejecutado en local.
- GPU recomendadas: no disponibles. El adaptador está en formato MLX, orientado a Apple Silicon; el autor solo documenta macOS. Para GPUs NVIDIA o AMD hay que recurrir a la variante GGUF.
- Cabe en GPU de consumo: el modelo base cuantizado sí, en cualquier GPU con al menos 6 GB de VRAM mediante la variante GGUF Q4_K_M. El adaptador MLX requiere Apple Silicon.
- Opciones de despliegue: MLX LM (versiones 0.31.3 y 0.32.2 probadas por el autor), Ollama con el GGUF Q4_K_M y, presumiblemente, llama.cpp con el mismo GGUF. No hay ruta documentada para vLLM ni TGI con este adaptador en formato MLX.
- Latencia y throughput: no disponibles. No se han publicado mediciones y el repositorio registra 0 descargas en el momento de la consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Notas |
|---|---|---|---|---|
| stbenjam/qwen3-4b-claudish-mlx-lora | 4.000 M base + 1,966 M adaptador | LoRA de MLX | Apache-2.0 | Requiere el base 4 bits fijado. Objetivo de entrenamiento no alcanzado según el autor. 0 descargas |
| mlx-community/Qwen3-4B-Instruct-2507-4bit | 4.000 M | MLX 4 bits | Apache-2.0 | Modelo base sin ajuste de estilo. Es la referencia con la que el autor compara (--base) |
| stbenjam/qwen3-4b-claudish-gguf (Q4_K_M) | 4.000 M | GGUF | Apache-2.0 | Misma experimentación empaquetada para Ollama/llama.cpp, sin Python |
| Demo previa "Claudish" de 0,6B | no disponible | no disponible | no disponible | El autor la menciona como antecedente y aclara que este checkpoint 4B no es una mejora demostrada sobre ella |

No se dispone de comparaciones con alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental explícito: el autor afirma que el objetivo de entrenamiento no se ha logrado y que es una vista previa temprana, no una mejora demostrada sobre la demo anterior de 0,6B.
- Alucinación: el modelo puede inventar hechos, especialmente cuando se usa el prompt de estilo exagerado, que induce detalles no respaldados y relleno irrelevante.
- Degeneración: los checkpoints más avanzados y más fuertes desarrollaron repeticiones severas, motivo por el que se seleccionó el update 40 y no uno posterior.
- Verbosidad: el comportamiento asistido por prompt entra en conflicto con peticiones de respuestas cortas. El autor advierte que los pesos crudos son mucho más suaves que el resultado con prompt de estilo, y que el comportamiento inducido por prompt no es evidencia de que el entrenamiento haya funcionado.
- Sin herramientas ni información en vivo: no soporta tool calling ni acceso a fuentes actualizadas.
- Contexto deliberadamente descartado: cada pregunta empieza de cero en la demo; los seguimientos con contexto requieren otra configuración.
- Idioma: solo inglés declarado. No hay soporte multilingüe ni evidencias de comportamiento en castellano.
- Formato: es un LoRA de MLX, no un adaptador PEFT. No sirve con el base original de Qwen ni con otras conversiones; requiere el base 4 bits fijado y la plantilla ChatML corregida.
- Licencia: Apache-2.0 permite uso comercial, pero las restricciones reales vienen de la calidad del modelo y de la procedencia de los datos, no de la licencia.
- Procedencia de datos: la atribución de las salidas sintéticas del dataset a Claude no ha sido autenticada de forma independiente. El adaptador es una parodia educativa, no contiene pesos de Claude y no está afiliado a Anthropic. No implica respaldo de Qwen, Anthropic ni de los contribuidores del dataset.
- Validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de funcionamiento.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/stbenjam/qwen3-4b-claudish-mlx-lora
- Variante GGUF Q4_K_M: https://huggingface.co/stbenjam/qwen3-4b-claudish-gguf
- Modelo base: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Repositorio del proyecto: https://github.com/stbenjam/posttrain-demo
- Resultados y respuestas completas: https://github.com/stbenjam/posttrain-demo/blob/main/claudish/v2/RESULTS.md
- Investigación y referencias sobre el estilo: https://github.com/stbenjam/posttrain-demo/blob/main/claudish/CLAUDISMS_RESEARCH.md
- Dataset de entrenamiento: https://huggingface.co/datasets/angrygiraffe/claude-opus-4.6-4.7-reasoning-8.7k
- Ficheros de trazabilidad incluidos en el repositorio: ATTRIBUTION.md, selection.json (checkpoint y SHA-256), training-data-manifest.json (revisión de origen, filtros, ponderación y hashes), train_template.jinja y style.txt, todos en la raíz de https://github.com/stbenjam/posttrain-demo
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados corresponden a páginas de descarga del navegador Google Chrome y no guardan relación con la ficha.
