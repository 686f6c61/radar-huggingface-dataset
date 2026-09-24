# ziansu/r2egym-rad-negative-warmup

## Resumen

Este repositorio no contiene un modelo "de producción", sino una trayectoria de entrenamiento: ocho checkpoints (`step5` a `step40`) de una única ejecución de aprendizaje por refuerzo (RAD, preset `lookahead-projected-ascent-signed-zero-negative-warmup`) sobre el subconjunto R2E-Gym, partiendo de Qwen/Qwen3.5-4B. El autor, ziansu, publica un checkpoint cada cinco actualizaciones para que la ejecución pueda estudiarse como proceso y no como resultado final, e indica que los intermedios se conservan en la máquina de entrenamiento y pueden publicarse bajo petición.

El modelo base es Qwen3.5-4B: 4,21 B parámetros en el modelo de lenguaje (`Qwen3_5ForCausalLM`) y 4,54 B en el modelo completo con torre de visión (`Qwen3_5ForConditionalGeneration`), con capas de atención lineal (`linear_attn`) y un contexto de rollout de 65.536 tokens durante el entrenamiento. El objetivo declarado es el entrenamiento de agentes de ingeniería de software que resuelven issues reales sobre entornos ejecutables, un área en la que R2E-Gym se presenta como el mayor entorno procedural curado con más de 8,1 K tareas.

Su relevancia es metodológica y de reproducibilidad: documenta el efecto de un "negative warmup" con schedule coseno (el límite inferior del intervalo de pesos por token alcanza su valor negativo pleno en la actualización 20) y publica la curva de rendimiento en un holdout fijo de 71 tareas. La mejora medida es de 7 a 11 puntos sobre el modelo base (45,07 % a 56,34 % de pass@1), aunque con un error estándar binomial de unos 3,4 puntos, lo que convierte la meseta de la trayectoria en un resultado más relevante que el punto final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5, con capas de atención lineal (`linear_attn.A_log`, `linear_attn.norm.weight` en 24 capas); incluye la torre de visión heredada del modelo base |
| Parámetros totales | 4,21 B en el modelo de lenguaje (`Qwen3_5ForCausalLM`); 4,54 B en el modelo completo con torre de visión (`Qwen3_5ForConditionalGeneration`) |
| Parámetros activos | No aplica: no se documenta una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | 65.536 tokens en el contexto de rollout del entrenamiento; longitud de contexto nativa del modelo base: no disponible |
| Tipos de cuantización | No disponible; el repositorio publica pesos en bfloat16 (48 tensores que en el modelo base están en float32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers), convertidos desde dist-checkpoints de Megatron con `slime/tools/convert_torch_dist_to_hf.py` |

Dato adicional: la raíz del repositorio no contiene pesos; es obligatorio indicar la subcarpeta (`subfolder="step40"`). El tamaño total del repositorio es de 111,9 GB, correspondiente a los ocho checkpoints publicados.

## Arquitectura y entrenamiento

El punto de partida es Qwen3.5-4B, un transformer denso (no MoE) con capas de atención lineal, cuya torre de visión permanece byte a byte idéntica al modelo base: el entrenamiento solo actualizó el modelo de lenguaje. La ejecución se hizo con el método RAD, preset `lookahead-projected-ascent-signed-zero-negative-warmup`, contra un profesor congelado Qwen3.6-27B. El "negative warmup" sigue un schedule coseno controlado por `--lookahead-negative-warmup-end-step 20`, de modo que el límite inferior de la caja de pesos por token alcanza su valor negativo pleno en la actualización 20. Otros ajustes: tope de TIS de 2, escalado de longitud por media inversa y 2 microbatches JVP por pasada.

El corpus es un subconjunto de R2E-Gym, con contexto de rollout de 65.536 tokens, learning rate de 1e-6, batch global de 256 y batch de rollout de 32 grupos de tareas por 8 muestras por actualización. La ejecución completa consumió 49,8 horas en 40 actualizaciones, en un único contenedor y sin reinicios. En la actualización 40 el peso medio por token es negativo (-0,0284), con un 16,1 % de tokens fijados en el límite inferior y un 13,8 % en el superior, lo que confirma que el schedule alcanzó su cota configurada.

Un detalle técnico relevante para la reproducibilidad: 48 tensores se almacenan en bfloat16 donde el modelo base usa float32 (`linear_attn.A_log` y `linear_attn.norm.weight` en cada una de las 24 capas). Con learning rate de 1e-6, una sola actualización desplaza una matriz grande aproximadamente un ulp de bfloat16 en el 16-39 % de sus elementos, por lo que checkpoints separados por cinco actualizaciones resultan casi idénticos tensor a tensor, aunque corresponden a políticas distintas. La exportación se verificó comprobando el conjunto completo de 738 tensores del modelo base, las formas y al menos una matriz muestreada distinta del base.

## Capacidades

- Generación de texto y de parches de código en el contexto de resolución de issues de repositorios reales (tareas tipo SWE-bench).
- Comportamiento agéntico multi-turno dentro de un entorno ejecutable: la política se entrenó sobre episodios de rollout con 65.536 tokens de contexto, lo que permite mantener historiales largos de edición, ejecución y observación.
- Razonamiento de varios pasos orientado a depuración: localización del fallo, edición y validación contra la suite de pruebas del repositorio.
- Capacidad de razonamiento y matemáticas heredada del modelo base Qwen3.5-4B, no medida específicamente en esta publicación.
- Arquitectura multimodal en el checkpoint (torre de visión presente en los pesos), aunque la evaluación agéntica de este proyecto utilizó únicamente el modelo de lenguaje.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card; el entrenamiento se realizó sobre interacción con entorno ejecutable, pero no se especifica el formato de llamada a herramientas.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas soportados).
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Reparación automática de issues en repositorios de software: usar `step40` como política de un agente que recibe un issue y debe producir un parche verificado; el modelo alcanza un 56,34 % de pass@1 en el holdout de 71 tareas de R2E-Gym, frente al 45,07 % del modelo base.
- Investigación en aprendizaje por refuerzo: los ocho checkpoints permiten estudiar la dinámica del negative warmup y comparar el efecto de la cota negativa antes y después de la actualización 20, con un protocolo de evaluación congelado.
- Reproducibilidad de experimentos: el repositorio incluye subcarpetas por número de actualizaciones, lo que facilita repetir medidas intermedias en lugar de evaluar solo el punto final.
- Inicialización para ajuste específico de dominio: `step40` es el punto más alto del holdout y sirve como punto de partida para un ajuste posterior sobre un dominio SWE concreto en lugar de partir del base.
- Estudio de destilación: la ejecución se hizo contra un profesor congelado Qwen3.6-27B, por lo que los checkpoints intermedios son material útil para analizar la transferencia profesor-alumno en tareas de código.
- Agente de mantenimiento en monorepos: con 65.536 tokens de contexto de rollout, puede sostener tareas que requieren leer varios ficheros, ejecutar pruebas y aplicar cambios sin perder el hilo de la conversación.
- Docencia y evaluación de agentes SWE: el holdout de 71 tareas con tres semillas (42/43/44) y 213 episodios por punto es un banco de pruebas reproducible para comparar políticas.
- Análisis de precisión numérica en RL: la conversión a bfloat16 de tensores concretos permite estudiar el impacto de la precisión en la estabilidad de políticas a learning rates muy bajos.

## Benchmarks y rendimiento

Holdout de 71 tareas de R2E-Gym, 213 episodios por punto (71 tareas × semillas 42/43/44), mismo manifiesto congelado y protocolo para todas las ejecuciones del proyecto:

| Punto de control | pass@1 | Intentos resueltos |
|---|---|---|
| Base (Qwen3.5-4B) | 45,07 % | 96/213 |
| step10 | 52,58 % | 112/213 |
| step20 | 54,93 % | 117/213 |
| step30 | 52,58 % | 112/213 |
| step40 | 56,34 % | 120/213 |

Evaluación reducida de 32 tareas registrada durante el entrenamiento, cada diez actualizaciones:

| Actualización | pass@1 (32 tareas) |
|---|---|
| 10 | 0,531 |
| 20 | 0,594 |
| 30 | 0,594 |
| 40 | 0,469 |

Advertencias sobre estas cifras, tal como las publica el autor: todos los checkpoints entrenados están entre 7 y 11 puntos por encima del base; el error estándar binomial a 213 episodios es de unos 3,4 puntos y los cuatro valores entrenados abarcan 3,8 puntos, por lo que están mutuamente dentro de un error estándar. La actualización 40 es la más alta, con una dispersión por semilla inusualmente amplia (57,7 / 47,9 / 63,4). En la evaluación de 32 tareas, una tarea equivale a 3,1 puntos y el error estándar ronda los 8,8 puntos, por lo que el valor de 0,469 en la actualización 40 no debe interpretarse como un colapso; el autor recomienda usar las cifras de 71 tareas. La recompensa de entrenamiento por actualización no contiene información de tendencia: cada actualización puntúa 32 grupos nuevos, con error estándar binomial de 0,088 que explica prácticamente toda la dispersión observada (desviación típica 0,087).

No existe puntuación de SWE-bench Verified para ningún checkpoint de este repositorio. Una ejecución anterior de negative warmup (`nwf0917a`, 40 actualizaciones, publicada por separado) obtuvo 47,80 % de pass@1 con 98.304 tokens de contexto y 100 turnos.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo de lenguaje: unos 8,5 GB solo para pesos en bfloat16 (4,21 B × 2 bytes); en torno a 9,1 GB para el modelo completo con torre de visión (4,54 B). Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- La caché KV con contextos de 65.536 tokens puede añadir varios gigabytes adicionales según la implementación y el número de secuencias concurrentes; no se publican medidas concretas.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabe en GPUs de consumo: RTX 4090 o RTX 3090 (24 GB) son suficientes en bfloat16. En tarjetas de 16 GB el margen es ajustado con contextos largos, y en 12 GB no es viable en bfloat16 sin cuantizar, dado que no se publican versiones cuantizadas.
- Almacenamiento y ancho de banda: el repositorio ocupa 111,9 GB repartidos en ocho subcarpetas; conviene descargar solo el checkpoint deseado mediante `subfolder`.
- Opciones de despliegue: al publicarse en safetensors para transformers, es compatible con servidores que cargan este formato (vLLM, TGI, SGLang). Para llama.cpp u Ollama habría que convertir los pesos a GGUF, conversión que no se proporciona. La inferencia se sirvió durante el entrenamiento y la evaluación con parámetros en bfloat16, detalle relevante para reproducir resultados.
- Latencia y throughput de inferencia: no disponibles. El único dato temporal publicado es el coste de entrenamiento: 49,8 horas para 40 actualizaciones en un único contenedor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,21 B (LM); 4,54 B con visión | no disponible | 45,07 % pass@1 en holdout R2E de 71 tareas (96/213) | Apache 2.0 | Público en HuggingFace |
| Este repositorio, step40 | 4,21 B (LM) | 65.536 tokens en rollout | 56,34 % pass@1 en el mismo holdout (120/213) | Apache 2.0 | Público en HuggingFace; 0 descargas |
| Ejecución anterior `nwf0917a` (publicada aparte) | no disponible | 98.304 tokens en evaluación, 100 turnos | 47,80 % pass@1 en SWE-bench Verified | no disponible | Publicada por separado |
| Agentes del proyecto R2E-Gym | no disponible | no disponible | 51 % en SWE-bench Verified (cifra del proyecto, no de este checkpoint) | no disponible | GitHub y HuggingFace |

La comparación entre filas no es homogénea: las dos últimas usan SWE-bench Verified, mientras que los checkpoints de este repositorio se midieron en el holdout de 71 tareas de R2E-Gym. No se dispone de otros modelos comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- No existe puntuación de SWE-bench Verified para ningún checkpoint de este repositorio; no se puede comparar directamente con los resultados publicados habitualmente en el ámbito SWE.
- El holdout principal tiene solo 213 episodios, con un error estándar binomial de unos 3,4 puntos: las diferencias entre checkpoints entrenados no son estadísticamente significativas y la lectura correcta es una meseta, no una progresión.
- La evaluación reducida de 32 tareas es ruidosa (error estándar de 8,8 puntos, 3,1 puntos por tarea) y su último valor no debe interpretarse como un colapso, según el propio autor.
- La recompensa de entrenamiento no muestra tendencia: la dispersión entre actualizaciones queda explicada por el ruido binomial.
- El autor presenta explícitamente este artefacto como una trayectoria de investigación, no como un modelo final listo para desplegar; el repositorio tiene 0 descargas y 0 valoraciones, sin validación externa conocida.
- Precisión numérica: 48 tensores (`linear_attn.A_log` y `linear_attn.norm.weight` en 24 capas) se almacenan en bfloat16 donde el base usa float32. Reproducir los resultados exige servir en esa misma precisión, porque fue la empleada durante entrenamiento y evaluación.
- A learning rate de 1e-6 las diferencias entre checkpoints son mínimas tensor a tensor; cualquier comparación que dependa de pesos idénticos puede ser engañosa.
- La torre de visión es idéntica al modelo base: el entrenamiento solo actualizó el lenguaje, y la evaluación agéntica usó únicamente el modelo de lenguaje. No hay evidencia de rendimiento multimodal en esta ejecución.
- Riesgo de alucinación en la generación de parches y de referencias a ficheros o APIs inexistentes, propio de los agentes de código; no se publican tasas de parches incorrectos sintácticamente válidos.
- Sesgos conocidos: no documentados. El entrenamiento se hizo sobre un subconjunto de R2E-Gym y no se detalla la composición del dataset ni la distribución de lenguajes de programación.
- Idiomas soportados: no declarados; el material de entrenamiento y evaluación está orientado a tareas de código, típicamente en inglés.
- Licencia Apache 2.0, que permite uso comercial, pero se hereda cualquier restricción aplicable a Qwen/Qwen3.5-4B; conviene revisar los términos del modelo base antes de un despliegue en producción.
- No se publican versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/ziansu/r2egym-rad-negative-warmup
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio oficial de R2E-Gym (COLM 2025): https://github.com/R2E-Gym/R2E-Gym
- Repositorio de R2E-Gym en el proyecto agentica: https://github.com/agentica-project/R2E-Gym
- Datasets de la organización R2E-Gym en HuggingFace: https://huggingface.co/R2E-Gym/datasets
- Página del trabajo R2E-Gym en NeurIPS 2025: https://neurips.cc/virtual/2025/131676
