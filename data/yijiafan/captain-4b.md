# YijiaFan/CaPtain-4B

## Resumen

CaPtain-4B es un modelo de lenguaje y visión (VLM) afinado a partir de Qwen3.5-4B por YijiaFan, presentado como el modelo final del pipeline "CaPtain: A Pipeline for Post-Training Code-as-Policy Robot Agents". No es un modelo de acción directa (VLA): es un agente que escribe código Python para controlar un robot a través de un arnés externo denominado CaPtain-Harness, lee los recibos de sus propias llamadas al robot y decide por sí mismo cuándo la tarea ha terminado.

El modelo parte de la arquitectura Qwen3_5ForConditionalGeneration (transformer multimodal con torre de visión) y ha pasado por un proceso de ajuste supervisado (SFT) seguido de aprendizaje por refuerzo (RL). Durante el SFT la torre de visión se mantuvo congelada. El `lm_head` está desvinculado del embeddings de entrada. Los pesos se distribuyen en bf16 safetensors con un total de 5.174.964.736 parámetros, y el repositorio ocupa 10,4 GB.

Su relevancia actual reside en que propone un paradigma distinto para la robótica encarnada: en lugar de predecir acciones o posiciones articulares, el modelo genera programas Python que invocan 22 capacidades de bajo nivel (percepción, medición geométrica, movimiento protegido a nivel de cinemática inversa) más una función `finish()`. El modelo solo funciona correctamente dentro de su arnés específico; fuera de él se comporta como un VLM pequeño convencional sin capacidad robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal con torre de visión) |
| Parametros totales | 5.174.964.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 81.920 tokens en el servidor vLLM configurado; ventana de 64k tokens con compactación del arnés durante la evaluación |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-4B, un transformer multimodal con torre de visión. La innovación principal no está en la arquitectura base sino en el paradigma de entrenamiento: el modelo aprende a escribir código Python como política (code-as-policy) en lugar de predecir acciones directamente. El proceso de post-entrenamiento consta de dos fases: un ajuste supervisado (SFT) sobre el dataset `YijiaFan/CaPtain-SFT-Data`, que inicializa el modelo y sirve como referencia KL, y una fase posterior de aprendizaje por refuerzo (RL) cuyos puntos de partida, warm start del crítico, configuraciones y entradas de evaluación están publicados en `YijiaFan/CaPtain-artifacts`.

Durante el SFT la torre de visión permaneció congelada. El modelo utiliza la plantilla de chat estándar de Qwen3.5, con razonamiento en `<think>` y llamadas a herramientas en XML, pero espera contenido específico del arnés: el prompt de sistema y el contexto de entorno que envía el arnés, el archivo `TASK.md` incrustado en el prompt de sistema, el esquema de la herramienta `python` (contrato `python-runtime/v1`), los recibos de llamadas al robot, las notas de compactación de contexto y la colocación de imágenes. El modelo no ve posiciones de objetos, contactos ni el predicado de éxito; estos permanecen en el host. La percepción se ejecuta como servicios externos: las herramientas `segment` y `mark_point` del arnés llaman a SAM 3 y Molmo2-8B, y las posiciones provienen de retroproyección de profundidad.

## Capacidades

- Generación de código Python como política robótica: escribe programas para una sesión persistente y aislada de Python 3.11 con 22 capacidades de bajo nivel (percepción, medición geométrica, movimiento protegido a nivel de cinemática inversa) más `finish()`.
- Lectura e interpretación de recibos: procesa una línea de texto de recibo por cada llamada al robot y adapta su comportamiento en consecuencia.
- Decisión autónoma de finalización: determina por sí mismo cuándo la tarea ha terminado e invoca `finish()`.
- Razonamiento multimodal: procesa imágenes de cámara junto con su propio código y salida.
- Modo de razonamiento (`<think>`) con llamadas a herramientas en XML.
- Soporte de tool calling mediante el parser `qwen3_xml` en vLLM.
- Capacidades multilingües: limitadas al inglés según la model card.
- No es un VLA: no emite acciones ni objetivos articulares directamente.

## Casos de uso

- Manipulación robótica en simulación LIBERO: el modelo controla un robot en los entornos LIBERO escribiendo código Python que invoca percepción, medición y movimiento, leyendo los recibos de cada llamada para decidir el siguiente paso. Es adecuado porque ha sido entrenado específicamente sobre la plantilla de petición del arnés y evalúa con éxito del 73,8 % en estados oficiales retenidos.
- Evaluación de generalización en benchmarks de robótica: permite medir la transferencia a LIBERO-PRO, LIBERO-Plus y LIBERO-MAX, nunca vistos en entrenamiento, con tasas de éxito del 78,5 % y 68,6 % en las variantes Pos+Task de LIBERO-PRO.
- Investigación en code-as-policy: sirve como referencia reproducible para estudiar cómo un agente que escribe código puede sustituir a un VLA tradicional, con pipeline de SFT y RL publicado en GitHub.
- Desarrollo de agentes encarnados con percepción como servicio: el modelo demuestra cómo delegar segmentación (SAM 3) y marcado de puntos (Molmo2-8B) a servicios externos mientras el LLM orquesta las llamadas.
- Automatización de tareas de pick-and-place sin macros: al no existir macros de agarre o colocación, el modelo debe componer primitivas de bajo nivel, lo que resulta útil para estudiar la composición de habilidades.
- Experimentación con aprendizaje por refuerzo sobre agentes de código: los artefactos de RL publicados permiten reproducir el entrenamiento y analizar la mejora respecto al modelo SFT (del 55,4 % al 73,8 % en LIBERO).

## Benchmarks y rendimiento

Todas las cifras son tasas de éxito (%) en simulación bajo el protocolo del autor: muestreo T = 1,0, top_p = 1,0, thinking activado, presupuestos de 60 peticiones al modelo, 1.080 s de tiempo real y 150 acciones físicas por episodio, ventana de contexto de 64k tokens con compactación del arnés. "Host" indica que el predicado de éxito oculto del benchmark se cumple al final del episodio; "Strict" indica éxito del host y que el agente además llamó a `finish()` por sí mismo.

| Benchmark | Episodios | Qwen3.5-4B | CaPtain-4B-SFT | CaPtain-4B |
|---|:-:|:-:|:-:|:-:|
| LIBERO, estados oficiales retenidos 11–16 | 240 | 0,0 / 0,0 | 55,4 / 52,1 | 73,8 / 67,5 |
| LIBERO-PRO Pos+Task, media de 6 celdas | 600 | 0,3 / 0,2 | 59,5 / 56,7 | 78,5 / 71,5 |
| LIBERO-PRO Pos+Task, media de 8 celdas | 800 | 0,2 / 0,1 | 49,2 / 45,1 | 68,6 / 58,9 |

Los resultados de LIBERO-Plus y LIBERO-MAX no están completos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.174.964.736 parámetros en bf16 se requieren aproximadamente 10,4 GB solo para los pesos, más memoria para el contexto (hasta 81.920 tokens en vLLM) y las imágenes (hasta 12 por prompt).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos en bf16 (≈10,4 GB) sugiere que podría caber en GPUs con 16 GB o más, pero no hay confirmación del autor.
- Opciones de despliegue: vLLM 0.29 con endpoint compatible con OpenAI, usando los flags `--dtype bfloat16 --max-model-len 81920 --enable-prefix-caching --limit-mm-per-prompt '{"image":12}' --max-num-seqs 16 --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_xml`. El arnés envuelve este comando como `services/serve_policy.sh`.
- Servicios adicionales requeridos: SAM 3 en el puerto 8114 y Molmo2-8B en el puerto 8122, más un entorno Python 3.11 aislado para el sandbox del agente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CaPtain-4B | 5.174.964.736 | 81.920 (vLLM) / 64k con compactación | Code-as-policy sobre Qwen3.5-4B con SFT + RL | apache-2.0 | Hugging Face, requiere CaPtain-Harness |
| Qwen3.5-4B (base) | no disponible | no disponible | VLM generalista | no disponible | Hugging Face |
| CaPtain-4B-SFT | no disponible | no disponible | Solo SFT, inicialización y referencia KL | no disponible | Hugging Face |

La comparación principal es con su propio modelo base Qwen3.5-4B, que obtiene 0,0 % de éxito en LIBERO frente al 73,8 % de CaPtain-4B, y con la versión intermedia CaPtain-4B-SFT, que alcanza el 55,4 %. No se dispone de comparación con otros agentes robóticos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo funciona correctamente dentro de CaPtain-Harness. Fuera de él se comporta como un VLM pequeño ordinario sin capacidad robótica.
- No debe escribirse el prompt a mano: el modelo espera la plantilla exacta del arnés (prompt de sistema, `TASK.md`, esquema de la herramienta `python`, recibos, notas de compactación y colocación de imágenes).
- No debe modificarse el texto visible para el modelo (TASK.md, descripciones de herramientas, recibos, plantilla de petición) al evaluarlo, ya que altera los resultados.
- Idioma limitado al inglés según la model card.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo depende de servicios externos (SAM 3, Molmo2-8B) cuyas licencias no se detallan.
- El modelo no ve posiciones de objetos, contactos ni el predicado de éxito; estos permanecen en el host, lo que limita su aplicabilidad fuera del arnés.
- Los resultados reportados son en simulación (LIBERO y variantes); no hay datos de transferencia a robot real en la información disponible.
- La torre de visión se mantuvo congelada durante el SFT, lo que puede limitar la adaptación de la percepción a dominios nuevos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YijiaFan/CaPtain-4B
- Paper: https://arxiv.org/pdf/2610.40799
- Página del proyecto: https://waltstephen.github.io/captain/
- Código del pipeline (SFT, RL): https://github.com/waltstephen/CaPtain
- Arnés (requerido para ejecutar el modelo): https://github.com/waltstephen/CaPtain-Harness
- Modelo SFT (inicialización y referencia KL): https://huggingface.co/YijiaFan/CaPtain-4B-SFT
- Dataset SFT: https://huggingface.co/datasets/YijiaFan/CaPtain-SFT-Data
- Artefactos RL (puntos de partida, warm start del crítico, configuraciones, entradas de evaluación): https://huggingface.co/datasets/YijiaFan/CaPtain-artifacts
