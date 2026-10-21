# XHToken/Spark-X2.6-4B-GGUF

## Resumen

Spark-X2.6-4B es un modelo de lenguaje compacto y de propósito general desarrollado por XHToken (familia SparkLLM), orientado a su despliegue en dispositivo («on-device») y a flujos de trabajo con agentes. Es la evolución directa de Spark-X2.5-4B: mantiene exactamente la misma arquitectura y concentra sus mejoras en el post-entrenamiento, con avances declarados en código, uso de herramientas, contexto largo, multilingüismo y razonamiento. Cuenta con 4.112.079.360 parámetros y licencia Apache 2.0.

El repositorio analizado, XHToken/Spark-X2.6-4B-GGUF, distribuye el modelo en formato GGUF (15,8 GB de repositorio) a partir del modelo base XHToken/Spark-X2.6-4B-Base. La model card documenta soporte para Transformers 4.57.1 y para SGLang, incluyendo el parser de tool calling `spark25` y el parser de razonamiento `qwen3`, además de compatibilidad con GPUs NVIDIA y NPUs Ascend.

Su relevancia actual radica en dos factores: por un lado, la pretensión del autor de igualar o superar modelos de ~9B parámetros en varias tareas con solo 4,11B; por otro, un «presupuesto de pensamiento» configurable en tres niveles (none, low, high) que permite ajustar latencia y coste de inferencia según la aplicación. La ventana de contexto configurada en los ejemplos de SGLang alcanza 1.048.576 tokens, lo que sitúa al modelo en la liga de contexto muy largo para su tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (carga vía `AutoModelForCausalLM`); la model card indica que mantiene exactamente la misma arquitectura que Spark-X2.5-4B, sin detallar número de capas, atención ni si es denso o MoE |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | No se declara que sea MoE; dato no disponible |
| Longitud de contexto | 1.048.576 tokens (configuración de `--context-length` en el ejemplo de SGLang de la model card); el ejemplo de Transformers usa `max_new_tokens=131072` |
| Tipos de cuantizacion | GGUF: el repositorio distribuye cuantizaciones en formato GGUF, pero no se detallan los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) en la información disponible |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base XHToken/Spark-X2.6-4B-Base se distribuye en safetensors para Transformers |
| Tamano del repositorio | 15,8 GB |
| Fecha de publicacion | Creado el 2026-10-19; actualizado el 2026-10-20 |
| Metricas del repositorio | 1 descarga, 19 likes |

## Arquitectura y entrenamiento

La información disponible es explícita en un punto clave: Spark-X2.6-4B «retiene exactamente la misma arquitectura que Spark-X2.5-4B» y obtiene sus mejoras de capacidad exclusivamente mediante un post-entrenamiento mejorado. No se especifica el tipo de bloque (atención completa, atención lineal, híbrida o SSM), la profundidad de la red, el número de cabezas ni la estrategia de atención usada para alcanzar el contexto de 1.048.576 tokens. El stack declarado es Transformers (`trust_remote_code=True` en el ejemplo) y SGLang, con parser de razonamiento `qwen3`, lo que sugiere compatibilidad con formatos de *thinking* estructurado.

Tampoco se detallan los datos de entrenamiento: no hay cifra de tokens, ni composición del corpus, ni confirmación de si se emplearon RLHF, DPO u otras técnicas de alineación. Las únicas innovaciones documentadas son de producto y de inferencia: el presupuesto de pensamiento configurable en tres niveles (none, low, high) y un rendimiento en *edge inference* que el autor sitúa a la par o por encima de Qwen3.5-4B y Gemma-E4B. Cualquier afirmación sobre la arquitectura interna o el pipeline de post-entrenamiento más allá de esto sería especulativa.

## Capacidades

- Generación de texto y razonamiento general, con modo de pensamiento controlable en tres niveles (none, low, high) para equilibrar calidad, latencia y coste.
- Razonamiento multi-paso y planificación para flujos agénticos, según los avances declarados en la model card.
- Tool calling / function calling: SGLang expone `--tool-call-parser spark25`, lo que indica soporte nativo de llamadas a herramientas en el servidor compatible con la API de OpenAI.
- Capacidades de código y de ingeniería de software («software engineering» se menciona explícitamente entre las mejoras de X2.6).
- Contexto largo: la configuración de referencia admite 1.048.576 tokens de ventana, adecuada para documentos o historiales extensos.
- Multilingüismo limitado a inglés y chino según el campo `language` de la model card y los tags del repositorio.
- Matemáticas: la evaluación del autor incluye tareas de matemáticas junto a agente, código, general y conocimiento (resultados solo en gráficas, sin cifras textuales).
- Despliegue en servidor compatible con OpenAI mediante SGLang, con soporte documentado para GPUs NVIDIA y NPUs Ascend (series A2 y A3).
- Capacidades de visión y audio: no disponibles / no declaradas.

## Casos de uso

- Agentes locales en dispositivo: con 4,11B parámetros y cuantización GGUF, el modelo puede ejecutarse en un portátil o estación de trabajo sin GPU de datacenter y orquestar tareas multi-paso con llamadas a herramientas mediante el parser `spark25`.
- Automatización de atención al cliente en inglés o chino: la ventana de contexto de hasta 1.048.576 tokens permite arrastrar historiales completos y documentación de producto sin resumir, manteniendo coherencia en conversaciones multi-turno.
- Asistente de código integrado en el IDE: el foco declarado en código y *software engineering* lo hace apto para autocompletado, explicación de funciones y generación de tests, con el nivel de pensamiento en `low` para minimizar latencia en el bucle de edición.
- Análisis de repositorios y documentos largos: con contexto de un millón de tokens y un único nodo SGLang se pueden procesar bases de código o expedientes completos para extraer resúmenes, dependencias o riesgos.
- Backend de agentes con API compatible con OpenAI: desplegando `python -m sglang.launch_server --tool-call-parser spark25 --reasoning-parser qwen3` se obtiene un endpoint que los SDK existentes pueden consumir sin adaptadores propios.
- Control de calidad con razonamiento explícito: el nivel `high` de pensamiento sirve para revisar clasificaciones o decisiones críticas, mientras que `none` se reserva para tareas de extracción y reformateo donde la latencia manda.
- Procesamiento en el borde con hardware no NVIDIA: el soporte de NPUs Ascend A2/A3 permite desplegar el modelo en infraestructura alternativa a CUDA dentro de un mismo stack SGLang.
- Traducción y atención bilingüe inglés-chino: es el par de idiomas realmente soportado, por lo que el uso como traductor o asistente en esas dos lenguas es el escenario realista, no el multilingüe amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye gráficas en formato SVG (`images/benchmark.svg`, `images/all_benchmark.svg`, `images/inference.svg`) con las comparativas frente a modelos on-device de tamaño similar, pero los valores numéricos no aparecen como texto en la información proporcionada; por tanto, no se reproducen cifras.

Las únicas afirmaciones cualitativas verificables en el texto son:

| Afirmacion de la model card | Detalle |
|---|---|
| Mejor rendimiento de su clase entre modelos de tamano comparable | «best-in-class performance among models of comparable size» |
| Iguala o supera a modelos de ~9B | «matching or even surpassing models with approximately 9B parameters» en varias tareas |
| Eficiencia en edge a la par o mejor que Qwen3.5-4B y Gemma-E4B | Declaración sin cifras textuales |
| Areas evaluadas | Agente, código, matemáticas, capacidades generales y conocimiento |

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo aritmético a partir de 4.112.079.360 parámetros; el autor no publica cifras): BF16/FP16 ≈ 8,2 GB; Q8 ≈ 4,4 GB; Q6_K ≈ 3,4 GB; Q5_K_M ≈ 2,9 GB; Q4_K_M ≈ 2,5 GB. Hay que sumar la caché KV, cuyo tamaño crece linealmente con el contexto.
- Contexto completo de 1.048.576 tokens: la propia model card advierte de que esa configuración «requiere suficiente memoria de dispositivo» y recomienda reducir `--context-length`. En la práctica exige GPUs de 80 GB (A100/H100) o nodos con memoria agregada; no es viable en GPU de consumo.
- GPU de consumo: una RTX 4090 (24 GB) mueve el modelo en BF16 con contexto moderado; una RTX 4060 Ti de 16 GB lo mueve en Q8; tarjetas de 8 GB quedan limitadas a Q4 y contextos cortos.
- GPU de datacenter recomendadas: A100 40/80 GB y H100 para servir contexto largo con SGLang; el ejemplo oficial usa `--tp-size 1`, `--mem-fraction-static 0.8`.
- Aceleradores alternativos: NPUs Ascend con las imágenes `quay.io/ascend/sglang:main-cann9.0.0-a3` (A3) y `main-cann9.0.0-910b` (A2).
- Opciones de despliegue documentadas: Transformers 4.57.1 (`trust_remote_code=True`) y SGLang (`lmsysorg/sglang:nightly-dev-cu13-20260827-20621aa1` para NVIDIA). Al distribuirse en GGUF, llama.cpp u Ollama son opciones plausibles, pero no están documentadas en la model card.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, TTFT ni cifras de rendimiento numéricas en la información accesible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B | 4,11 B | 1.048.576 tokens (config. SGLang) | Referencia de la comparativa; el autor lo sitúa al nivel o por encima de modelos de ~9B en varias tareas | Apache 2.0 | HuggingFace: GGUF (este repo) y safetensors (modelo base) |
| Qwen3.5-4B | No disponible en la informacion proporcionada | No disponible | Citado por el autor como referencia de eficiencia en edge, sin cifras textuales | No disponible | No disponible |
| Gemma-E4B | No disponible en la informacion proporcionada | No disponible | Citado por el autor como referencia de eficiencia en edge, sin cifras textuales | No disponible | No disponible |
| Familia de ~9B (genérica) | ~9 B | No disponible | El autor afirma igualar o superar estos modelos en varios benchmarks | No disponible | No disponible |

La comparativa es necesariamente cualitativa: los datos de los modelos de referencia solo aparecen en gráficas SVG dentro de la model card y no como valores numéricos en la información disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino están declarados. No hay soporte anunciado de castellano; usarlo en español supone un riesgo de calidad no medido.
- Ausencia de cifras de benchmark verificables: todas las comparativas están en imágenes sin valores textuales, por lo que las afirmaciones de paridad con modelos de 9B no se pueden contrastar con los datos suministrados.
- Documentación de entrenamiento inexistente en la información disponible: sin número de tokens, composición del dataset ni confirmación de RLHF/DPO, es difícil evaluar sesgos o contaminación de benchmarks.
- Sesgos: no se publica información sobre evaluación de sesgos, toxicidad o robustez; en un modelo bilingüe en/zh cabe esperar sesgos culturales de los corpus de entrenamiento, pero no hay datos que los cuantifiquen.
- Alucinación: como todo LLM de 4B, es propenso a fabricar datos, especialmente en modo `none` de pensamiento y en tareas de conocimiento factual; requiere verificación externa en producción.
- Repositorio muy reciente y poco validado por la comunidad: 1 descarga y 19 likes en el momento de la consulta, creado el 2026-10-19. No hay evidencia de uso independiente.
- Inconsistencia de metadatos: los tags del repositorio incluyen `sparkx2_5` pese a tratarse de la versión X2.6; conviene no fiarse de los tags para el versionado automático.
- `trust_remote_code=True` en el ejemplo oficial implica ejecutar código del autor al cargar el modelo; hay que auditar ese código antes de usarlo en entornos productivos.
- Cuantización GGUF: las versiones de baja precisión degradan razonamiento y tool calling; el fabricante no publica qué niveles ha subido ni sus pérdidas asociadas.
- Contexto largo y memoria: configurar 1.048.576 tokens sin hardware suficiente provoca fallos de OOM; la propia model card recomienda reducir `--context-length`.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero exige conservar avisos de copyright y licencia y no incluye garantías; no se documentan cláusulas adicionales de uso aceptable.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/XHToken/Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B-Base
- Modelo en formato Transformers (referenciado en el quickstart): https://huggingface.co/XHToken/Spark-X2.6-4B
- Slack de la comunidad: https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw
- Discord: https://discord.gg/kTDE2Hg8aw
- YouTube: https://www.youtube.com/@SparkLLM
- dev.to: https://dev.to/sparkllm
- Bluesky: https://bsky.app/profile/sparkllm.bsky.social
- X (Twitter): https://x.com/sparkllm
- Zhihu: https://www.zhihu.com/people/zhiikz7qh7m
- Paper técnico: no disponible en la información proporcionada.
