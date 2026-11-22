# trinadin/MiniMax-M3.1-Flash-TP3-3x-DGX-Spark

## Resumen

MiniMax-M3.1-Flash-TP3-3x-DGX-Spark es una receta de despliegue (serving recipe) publicada por el usuario trinadin, no un modelo entrenado desde cero. Empaqueta la configuración necesaria para servir el modelo multimodal MoE MiniMaxAI/MiniMax-M3.1-Flash (aproximadamente 428B parámetros totales y 23B activos) sobre tres nodos NVIDIA DGX Spark GB10, usando paralelismo tensorial de grado 3 (TP=3) con una réplica por nodo y una única API compatible con OpenAI expuesta desde el nodo cabeza.

El problema que resuelve es concreto: la geometría publicada del modelo (64 cabezas de consulta, 4 cabezas KV y 4 cabezas de índice) no es divisible entre 3, por lo que el motor vLLM no puede fragmentarlo de forma nativa en tres rangos. La receta aplica un relleno (pad) que preserva la proporción hasta 96/6/6, con pesos nulos en las cabezas añadidas, de modo que la contribución de estas es exactamente cero y el mapeo GQA sigue siendo correcto en cada rango. Además, activa decodificación especulativa mediante la cabeza borrador DSpark incluida en el propio checkpoint, sin descarga adicional.

Es relevante ahora porque documenta una vía práctica para servir un MoE multimodal de gran tamaño en hardware de escritorio de memoria unificada (DGX Spark), con cifras medidas de rendimiento, un perfil de memoria que reserva espacio para el guardián de memoria y utilidades que permiten verificar las afirmaciones en lugar de asumirlas. La licencia del artefacto es MIT, aunque el modelo base tiene su propia licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (modelo base MiniMax-M3.1-Flash); receta de serving con vLLM |
| Parametros totales | ~428B (modelo base) |
| Parametros activos | ~23B (modelo base, MoE) |
| Longitud de contexto | 196.608 tokens en el perfil publicado (soportado también 131.072) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (artefacto de receta); licencia del modelo base: no disponible en la información proporcionada |
| Formato de pesos | no disponible (checkpoint del modelo base servido con vLLM; la receta no publica pesos propios) |

## Arquitectura y entrenamiento

La receta no entrena ningún modelo: distribuye y configura el checkpoint MiniMax-M3.1-Flash, un MoE multimodal de aproximadamente 428B parámetros totales y 23B activos. La geometría de atención publicada es de 64 cabezas de consulta, 4 cabezas KV y 4 cabezas de índice, con agrupación GQA. El motor exige que cada una de estas dimensiones sea divisible por el tamaño de paralelismo tensorial; como 64 no es divisible entre 3, la receta aplica un pad que preserva la proporción hasta 96/6/6 (16 cabezas de consulta por cabeza KV antes y después del pad) mediante `patches/apply_mm31_tp3pads.py` en cada arranque. Las cabezas añadidas llevan pesos a cero, por lo que su contribución es nula y el mapeo GQA sigue asignando las cabezas de consulta rellenadas de cada rango a las cabezas KV rellenadas de ese mismo rango.

La segunda pieza técnica es la decodificación especulativa con la cabeza borrador DSpark incluida en el checkpoint, que presenta la misma geometría publicada que el modelo objetivo y, por tanto, requiere el mismo pad para TP=3. El perfil de servicio se dimensiona de forma conservadora: en una máquina de memoria unificada, la reserva de GPU y el staging de CPU de las peticiones salen del mismo presupuesto, de modo que el pool KV es lo que queda tras pesos, sistema operativo, otros servicios, pico de activaciones y pool de captura. La rejilla de captura se limita para que el pool no pague por grafos que el carril nunca usa. No se proporcionan datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de cadena larga, con rendimiento de decodificación especulativa especialmente alto en cadenas de razonamiento prolongadas.
- Capacidades multimodales heredadas del modelo base MiniMax-M3.1-Flash (la receta lo describe como multimodal).
- Servicio mediante API compatible con OpenAI en el nodo cabeza del clúster.
- Decodificación especulativa integrada con la cabeza DSpark del checkpoint, sin descarga adicional.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el alto rendimiento del borrador en cadenas de razonamiento sugiere uso en ese tipo de cargas.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (solo se indica "multimodal" sin detallar modalidades).

## Casos de uso

- Servicio self-hosted de un MoE de gran tamaño en tres DGX Spark: la receta permite exponer el modelo con una única API compatible con OpenAI desde el nodo cabeza, útil para equipos que quieren un endpoint propio sin depender de la nube.
- Cargas de razonamiento largo: con aceptación del borrador de ~0,99/0,96/0,94 por posición en cadenas de razonamiento, la decodificación especulativa aporta mucho en tareas de análisis paso a paso, revisión de código o resolución de problemas complejos.
- Inferencia por lotes con concurrencia moderada: el agregado de ~130 tok/s a 16 vías permite procesar varios flujos simultáneos, adecuado para pipelines de generación de documentación o resumen.
- Prototipado e investigación con contexto largo: el pool KV de ~224K tokens permite una petición completa de 196.608 tokens, útil para análisis de repositorios, contratos o corpus extensos en una sola pasada.
- Evaluación de decodificación especulativa: la receta incluye un arnés de benchmark con disciplina anti-contaminación y reglas de aceptación que fallan en cerrado, útil para equipos que quieran medir el impacto real del borrador en sus propias cargas.
- Despliegue en hardware de memoria unificada: sirve como plantilla reproducible para servir modelos que no fragmentan de forma nativa en tres rangos, mediante el kit de pad TP=3.

## Benchmarks y rendimiento

Cifras medidas por el autor de la receta (redondeadas, etiquetadas por presupuesto de memoria). No son un informe de benchmark independiente.

| Métrica | Valor |
|---|---|
| Decodificación 1 vía, flujo único | ~26 tok/s |
| Decodificación 16 vías, agregado | ~130 tok/s |
| Prefill (prompt de ~8K tokens) | ~1.500 tok/s |
| Tiempo hasta el primer token | ~0,5 s |
| Latencia por token | ~38 ms |
| Pool KV | ~224K tokens con presupuesto 0,80 (~1,14× una petición de 196.608; ~1,71× una de 131.072) |
| Pool de captura por rango | menos de 1 GiB (frente a la estimación del motor de ~2 GiB) |
| Aceptación del borrador, prosa | ~0,60 / ~0,30 / ~0,14 por posición |
| Aceptación del borrador, cadenas de razonamiento largas | ~0,99 / ~0,96 / ~0,94 por posición |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Tres nodos NVIDIA DGX Spark GB10, uno por rango de TP=3, con memoria unificada compartida entre GPU y CPU en cada nodo.
- VRAM estimada para inferencia: no disponible de forma numérica; el perfil se dimensiona para dejar margen al guardián de memoria en cada nodo tras pesos, sistema operativo, servicios, pico de activaciones y pool de captura.
- GPU recomendadas: DGX Spark GB10 (configuración medida). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? No disponible; la receta está diseñada para memoria unificada de DGX Spark, no para GPU discretas de consumo.
- Opciones de despliegue: vLLM (motor principal de la receta), con utilidades propias de captura, resolución de rejilla de captura y guardián de memoria. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~26 tok/s en flujo único, ~130 tok/s agregados a 16 vías, ~1.500 tok/s de prefill y ~0,5 s hasta el primer token.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría ni datos de modelos alternativos.

## Limitaciones y advertencias

- Es una receta de serving, no un modelo: no publica pesos propios ni un checkpoint entrenado; depende del modelo base MiniMaxAI/MiniMax-M3.1-Flash.
- Las cifras de rendimiento son afirmaciones del autor, medidas en su hardware y redondeadas deliberadamente; no constituyen un informe de benchmark independiente.
- La aceptación del borrador decae mucho en prosa (~0,60/0,30/0,14), por lo que la decodificación especulativa aporta poco en ese tipo de carga; un único porcentaje de mejora sería engañoso.
- A contexto de 196.608 tokens el carril sostiene una sola petición completa, no dos: la concurrencia se paga en el contexto largo.
- El pool KV de ~224K con presupuesto 0,80 se debe a que el motor resta su estimación de perfilado de memoria de grafos CUDA; subir el pool no es una cuestión de configuración en este stack.
- El pad TP=3 modifica la geometría de atención mediante cabezas con pesos nulos; requiere aplicar el parche en cada arranque y confiar en que la contribución nula se mantiene.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no disponible de forma específica; aplica el riesgo general del modelo base.
- Restricciones de licencia: el artefacto es MIT, pero la licencia del modelo base no se detalla en la información proporcionada; conviene verificar antes de uso comercial.
- Idiomas soportados: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/trinadin/MiniMax-M3.1-Flash-TP3-3x-DGX-Spark
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Repositorio de la receta (referenciado en la model card): https://github.com/trina (URL truncada en la información disponible)
