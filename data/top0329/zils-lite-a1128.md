# top0329/zils-lite-a1128

## Resumen

zils-lite-a1128 es un modelo de decisión publicado por el usuario top0329 en Hugging Face bajo la etiqueta `d3-lite`, dentro de lo que la model card describe como el "lite pool" de la subnet 127 de Zils. Según esa misma model card, se trata de un fine-tune LoRA fusionado (merged LoRA) sobre un "lite soup" público con fecha del 26 de noviembre de 2026. El modelo tiene 852.985.920 parámetros reales en pesos safetensors, lo que lo sitúa en el rango de los ~850 millones de parámetros, con un repositorio de 1,7 GB.

La información pública disponible es muy escasa: la model card consta de cuatro líneas y no detalla arquitectura base, datos de entrenamiento, tokenizador, longitud de contexto ni idiomas. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y el repositorio se creó y actualizó con apenas 37 segundos de diferencia el 27 de noviembre de 2026. Todo apunta a un artefacto de un ecosistema de subredes (Zils subnet 127) más que a un modelo de propósito general documentado para uso externo.

Su relevancia ahora es limitada y muy específica: puede interesar a quienes participan en ese ecosistema de subredes y necesitan inspeccionar o reproducir el artefacto, pero no hay evidencia publicada de capacidades, benchmarks ni calidad que permita recomendarlo para producción general. La licencia Apache-2.0 sí facilita la inspección y el uso comercial, siempre que se respete el NOTICE de atribuciones upstream que menciona el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica "d3-lite decision body"; no se especifica transformer, MoE ni híbrida) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La única información técnica aportada por el autor es que se trata de un "d3-lite decision body" para el lite pool de la subnet 127 de Zils, construido como un merged LoRA fine-tune del "lite soup" público del 26 de noviembre de 2026. No se especifica la arquitectura del modelo base (transformer denso, MoE, SSM o híbrida), ni el número de capas, dimensión oculta, cabezas de atención o vocabulario. El recuento real de parámetros en safetensors (852.985.920) es el único dato estructural verificable.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, la estrategia de mezcla del "soup" ni los hiperparámetros del fine-tune LoRA (rango, alpha, módulos objetivo). La referencia a un NOTICE con atribuciones upstream sugiere que el modelo deriva de componentes de terceros, pero ese fichero no se ha podido consultar en la información proporcionada. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no se incluye.

## Capacidades

- No hay documentación publicada de capacidades concretas (generación de texto, razonamiento, código, matemáticas o visión).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni idiomas cubiertos.
- La etiqueta `decision-model` y la descripción "decision body" sugieren un uso orientado a decisiones dentro del ecosistema Zils, pero no se detalla el formato de entrada/salida ni la tarea exacta.
- No se documenta ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Inspección y auditoría del artefacto: descargar los safetensors (1,7 GB) y verificar el recuento de parámetros, la estructura de pesos y las atribuciones del NOTICE para confirmar la procedencia del merged LoRA antes de cualquier uso.
- Reproducción del pipeline de merge: usar el modelo como referencia para reconstruir el proceso de fusión de LoRA sobre el "lite soup" del 26 de noviembre de 2026, útil para quienes replican experimentos dentro de la subnet 127.
- Evaluación interna de modelos de decisión: servir el modelo con un runtime estándar de transformers y medir su comportamiento en las tareas de decisión del ecosistema Zils, dado que no hay benchmarks públicos que lo avalen.
- Punto de partida para fine-tuning posterior: al ser Apache-2.0 y pesar menos de 1 GB en parámetros, puede servir como base para ajustes específicos con recursos modestos, siempre que se valide primero su calidad.
- Comparación de linajes dentro del "lite pool": confrontar este artefacto con otras variantes del mismo pool para analizar diferencias de pesos y de estrategia de mezcla.
- Docencia y experimentación con merged LoRA: ilustrar el flujo completo de fine-tune LoRA más fusión sobre un modelo base pequeño, sin asumir capacidades de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB solo para pesos (852.985.920 parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para pesos, más overhead; encaja en GPUs consumer con 6-8 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,85 GB para pesos; en 4 bits, alrededor de 0,43 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, 4060, 4090) es suficiente por tamaño; para lotes grandes o baja latencia, A100 o H100 quedan sobredimensionadas para este tamaño.
- Despliegue: al no documentarse arquitectura ni tokenizador, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato safetensors permite cargarlo con transformers si la arquitectura base es estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría ("decision body" del lite pool de Zils) ni alternativas de ~850 millones de parámetros con documentación suficiente para establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar su idoneidad para cualquier tarea concreta.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de calidad, y el modelo acumula cero descargas y cero likes, por lo que no existe validación por parte de la comunidad.
- Riesgo de alucinación y comportamiento impredecible: al no conocerse el dataset de entrenamiento ni el proceso de alineamiento, no se puede acotar el riesgo de salidas incorrectas.
- Sesgos desconocidos: la composición del "lite soup" upstream no está documentada, por lo que no es posible identificar sesgos de dominio, idioma o demografía.
- Idiomas no declarados: no se puede asumir soporte de castellano ni de ningún otro idioma concreto.
- Licencia Apache-2.0 permite uso comercial, pero el autor remite a un NOTICE con atribuciones upstream que debe revisarse y respetarse; si ese NOTICE no está disponible o está incompleto, la cadena de atribuciones queda sin verificar.
- Fecha de creación futura respecto a la información habitual de referencia (27 de noviembre de 2026): conviene confirmar la integridad y procedencia del repositorio antes de usarlo en producción.
- No apto para producción sin una evaluación propia previa: la ausencia de pipeline declarado y de especificaciones impide garantizar compatibilidad con runtimes estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/top0329/zils-lite-a1128
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
