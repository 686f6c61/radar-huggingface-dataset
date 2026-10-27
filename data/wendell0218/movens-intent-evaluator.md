# wendell0218/Movens-Intent-Evaluator

## Resumen

Movens-Intent Evaluator es un checkpoint de evaluación publicado por wendell0218 (Wendong Bu) en Hugging Face, pensado para medir sistemas de generación de movimiento humanoide sobre el conjunto de datos Movens-Intent. No es un modelo generativo de propósito general ni un LLM: es un artefacto de evaluación que empaqueta un codificador de movimiento, una proyección de texto y la configuración de inferencia necesaria para calcular métricas de retrieval texto-habla, FID y diversidad. Se distribuye como un único fichero PyTorch (`movens_intent_evaluator.pt`) de aproximadamente 0,1 GB, con sumas de verificación en `SHA256SUMS`.

El checkpoint está diseñado para funcionar junto al código de evaluación del repositorio Movens-Zero, que carga por separado un T5-3B preentrenado. Es decir, el evaluador no es autocontenido: depende de una base de texto externa y de la versión concreta del pipeline de evaluación. Su relevancia es acotada pero práctica: permite comparar de forma reproducible distintos generadores de movimiento sobre el benchmark Movens-Intent, que incluye datos de texto, audio, robótica y movimiento humanoide.

La información pública disponible es mínima. La model card se limita a indicar el uso previsto, el comando de descarga y la dependencia del código externo; no se especifican parámetros, contexto, licencia ni idiomas del modelo. El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no existe validación comunitaria documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible como arquitectura única. El checkpoint agrupa un codificador de movimiento, una proyección de texto y la configuración de inferencia; el codificador de texto (T5-3B) se carga por separado desde el código de evaluación |
| Parámetros totales | No disponible para el checkpoint. La dependencia externa declarada es T5-3B (3 000 millones de parámetros aproximadamente, dato de la familia T5, no del checkpoint) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el artefacto se distribuye en formato PyTorch nativo |
| Idiomas soportados | No disponible. El dataset asociado Movens-Intent está etiquetado en inglés |
| Licencia | No disponible (la ficha de Hugging Face no declara licencia) |
| Formato de pesos | PyTorch (`.pt`), fichero `movens_intent_evaluator.pt` con integridad verificable mediante `SHA256SUMS` |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del codificador de movimiento ni de la proyección de texto. Por los componentes declarados, se trata de un pipeline de evaluación con dos torres: un codificador de movimiento que produce embeddings a partir de secuencias de movimiento y una proyección de texto que alinea representaciones textuales (y de habla) en el mismo espacio, apoyándose en un T5-3B preentrenado que se carga de forma independiente. Sobre ese espacio compartido se calculan las métricas de retrieval, FID y diversidad.

No se han publicado detalles sobre datos de entrenamiento del checkpoint: no se indica número de tokens, composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO. El checkpoint se asocia al dataset Movens-Intent (tareas text-to-video y video-to-video, con modalidades de audio, texto y datos tabulares, y un tamaño declarado entre 1 000 y 10 000 muestras), pero la información disponible no confirma que ese dataset se usara para entrenar el evaluador ni en qué proporción. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Cálculo de métricas de retrieval texto-movimiento y habla-movimiento sobre el benchmark Movens-Intent.
- Cálculo de FID (Fréchet Inception Distance) sobre movimiento generado, según la model card.
- Cálculo de métricas de diversidad de las muestras generadas.
- Extracción de embeddings de movimiento mediante el codificador incluido en el checkpoint.
- Proyección de texto a un espacio compartido con el movimiento, apoyada en T5-3B cargado externamente.
- Verificación de integridad del artefacto descargado mediante `SHA256SUMS`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni comportamiento agéntico: el artefacto es un evaluador, no un modelo de chat o instrucciones.

## Casos de uso

- Evaluación comparativa de generadores texto-movimiento: el checkpoint permite calcular retrieval y FID sobre un mismo conjunto de muestras, de modo que dos generadores distintos se puedan comparar con idéntica configuración de evaluación.
- Medición de diversidad en muestras generadas: útil para detectar colapso de modo en modelos de movimiento que producen variaciones mínimas ante prompts distintos, usando la métrica de diversidad incluida en el pipeline.
- Evaluación de retrieval habla-movimiento: el checkpoint declara soporte de recuperación a partir de habla, lo que permite evaluar sistemas que alinean instrucciones habladas con secuencias de movimiento.
- Reproducibilidad de resultados en publicaciones: al fijar un checkpoint concreto y verificar su hash, se puede reproducir la misma evaluación meses después, evitando la deriva habitual cuando las métricas se recalculan con código en movimiento.
- Integración en pipelines de CI de investigación: el código de Movens-Zero permite invocar la evaluación de forma programática, de modo que cada nueva versión de un generador pase un test de regresión de métricas antes de publicarse.
- Validación de movimiento orientado a robótica humanoide: las etiquetas del artefacto (`humanoid-motion`, `robotics`) y el ecosistema del autor (secuencias SMPL-X, retargeting a Unitree G1, telemetría MuJoCo en el dataset Movens-Viewer) apuntan a la evaluación de movimiento destinado a control de humanoides.
- Auditoría de datasets de movimiento: usar el evaluador como referencia para comprobar si un conjunto de datos nuevo cae dentro de la distribución de Movens-Intent antes de incorporarlo a un entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enumera las métricas que el checkpoint permite calcular (retrieval de texto y habla, FID y diversidad) sobre el dataset Movens-Intent, sin aportar valores numéricos ni comparaciones con otros evaluadores.

## Requisitos de hardware

- VRAM para el checkpoint: no disponible. El artefacto ocupa aproximadamente 0,1 GB en disco, pero el consumo en memoria depende del codificador de movimiento y de la configuración de inferencia, no documentados.
- Dependencia externa: el pipeline carga T5-3B de forma separada. Como referencia de orden de magnitud, un modelo de 3 000 millones de parámetros requiere del orden de 6 GB en bf16/fp16 y unos 12 GB en fp32 solo para los pesos, antes de activaciones y caché. Son estimaciones de la familia T5, no cifras publicadas para este evaluador.
- GPU recomendadas: no disponible. Con la estimación anterior, una GPU consumer de 16-24 GB (RTX 4080/4090) sería suficiente para ejecutar T5-3B en precisión reducida, y una A100 o H100 aportaría margen para lotes grandes de evaluación; ninguna de estas recomendaciones está confirmada por el autor.
- Despliegue: no se documenta soporte de vLLM, llama.cpp, Ollama o TGI. El uso previsto es la ejecución del código de evaluación de Movens-Zero con PyTorch.
- Latencia y throughput: no disponible.
- Almacenamiento: el checkpoint son ~0,1 GB; hay que sumar los pesos de T5-3B descargados aparte.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros evaluadores comparables (parámetros, contexto, licencia o rendimiento), por lo que la comparación cuantitativa no está disponible.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Movens-Intent Evaluator | Checkpoint de evaluación de movimiento (retrieval, FID, diversidad) | No disponible (~0,1 GB en disco) | No disponible | No disponible | Hugging Face, descarga directa |
| Evaluadores de referencia de la literatura texto-movimiento | No descritos en la información | No disponible | No disponible | No disponible | No disponible |
| Alternativas dentro del ecosistema Movens (Movens-Viewer) | Conjunto de datos de visualización, no un evaluador | No aplica | No disponible | No disponible | Hugging Face Datasets |

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni la redistribución del checkpoint. Es un bloqueo potencial para producción.
- Artefacto no autocontenido: requiere T5-3B y el código de evaluación de Movens-Zero. Cualquier cambio en ese repositorio puede alterar los resultados sin que cambie el hash del checkpoint.
- Ausencia de documentación técnica: no hay datos de arquitectura interna, datos de entrenamiento, hiperparámetros ni proceso de ajuste, lo que dificulta auditar qué mide realmente cada métrica.
- Idiomas: el dataset asociado está etiquetado en inglés; no hay información sobre el comportamiento del retrieval en castellano u otras lenguas.
- Riesgo de sobreajuste al benchmark: al ser un evaluador específico de Movens-Intent, sus métricas pueden no transferirse a otras distribuciones de movimiento (por ejemplo, movimiento no humanoide o capturas con otro sistema de marcadores).
- Sesgos: no documentados. Al depender de un corpus de movimiento humano, es esperable que herede los sesgos de composición del dataset de origen, pero no hay análisis publicado al respecto.
- Validación comunitaria nula: cero descargas y cero likes en el momento de la consulta; no hay informes independientes de uso ni erratas conocidas.
- Fechas del repositorio: la ficha indica creación y actualización el 2026-10-27, con un minuto de diferencia entre ambas, lo que sugiere una publicación sin iteraciones posteriores.
- No es un modelo generativo: no debe emplearse para producir movimiento, texto ni respuestas; su función es exclusivamente evaluadora.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wendell0218/Movens-Intent-Evaluator
- Dataset Movens-Intent: https://huggingface.co/datasets/wendell0218/Movens-Intent
- Dataset Movens-Viewer: https://huggingface.co/datasets/wendell0218/Movens-Viewer/tree/main
- Código de evaluación Movens-Zero: https://github.com/wendell0218/Movens-Zero/tree/main/evaluation
- Perfil de GitHub del autor: https://github.com/wendell0218
- Repositorio Awesome-RL-for-Video-Generation: https://github.com/wendell0218/Awesome-RL-for-Video-Generation
- Ficha de Movens Viewer en Claru: https://claru.ai/datasets/wendell0218-movens-viewer
