# tachara-ai/Decisio-12b-tuned-v3-fp8-commit

## Resumen

Decisio-12b-tuned-v3-fp8-commit es un ajuste fino de google/gemma-4-12B-it publicado por Tachara AI Lab, orientado a un uso muy concreto: responder preguntas cerradas sobre un texto (si/no, elección entre opciones y puntuación en una escala definida) devolviendo una probabilidad calibrada para cada opción en un único forward pass por pregunta. No es un modelo conversacional generalista, sino el motor de decisión del servidor open source decisio, que aplica la plantilla de prompt, el readout y las temperaturas por tipo de pregunta definidas en `decision_config.json`.

El modelo parte de Gemma 4 12B instruct (11.959.730.224 parámetros reales según safetensors) y se ha entrenado mediante un adaptador LoRA de rango 32 y alpha 64 durante una época sobre 463.859 preguntas, fusionado después en float32 con redondeo estocástico sembrado a bf16. Esta revisión concreta distribuye los pesos en FP8 (unos 12 GB de repositorio, 13,1 GB totales) mediante compressed-tensors, con una pérdida mínima de fidelidad frente a bf16: mismo resultado en el 97,0 % de 1.000 preguntas fijas de validación y un cambio medio de probabilidad de 0,015.

Su relevancia es práctica: frente al Gemma 4 12B base y frente a la iteración anterior de Decisio, mejora de forma medible en la tarea para la que fue entrenado (78,8 % global frente a 67,7 % y 71,6 %), incluye una regla de commit para respuestas si/no y un bloque de calculadora que eleva la precisión en preguntas aritméticas y temporales. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), ajuste fino con LoRA fusionado; cuantización FP8 con compressed-tensors |
| Parámetros totales | 11.959.730.224 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 (esta revisión); pesos bf16 disponibles en otras revisiones del proyecto |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-12B-it en la revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`. Sobre esa base se entrenó un adaptador LoRA de rango 32 y alpha 64 durante una época con 463.859 preguntas del dominio de decisión; después se fusionó en float32 con redondeo estocástico sembrado a bf16 y el resultado se cuantizó una sola vez a FP8 mediante decisio. El fichero `SHA256SUMS` permite verificar la integridad de cada peso.

La innovación no está en la arquitectura del transformer, sino en el pipeline de inferencia: el modelo no genera texto libre, sino que produce una probabilidad por opción en un único forward pass, con una plantilla de prompt y un readout fijos definidos en `decision_config.json`. Ese fichero también fija las temperaturas por tipo de pregunta (1,08 para elección, 1,43 para sí/no y 1,10 para puntuación), ajustadas por mínima log-loss sobre la mitad de un split de validación, y el ajuste de calculadora `calc-v1`. La regla de commit para sí/no recoloca cualquier probabilidad estrictamente entre 0,20 y 0,80 a 0,80 o 0,20 sin cambiar la respuesta, solo la confianza declarada.

## Capacidades

- Respuesta a preguntas cerradas sobre un texto: sí/no, elección única entre opciones y puntuación en una escala definida por el usuario.
- Salida de probabilidades calibradas por opción en un único forward pass por pregunta.
- Regla de commit para sí/no que evita confianzas en la zona incierta (0,20-0,80).
- Bloque de calculadora (`calc-v1`) para preguntas con fechas, horas y aritmética que incluyan un bloque numérico.
- Robustez frente a variaciones de redacción y orden de opciones: 81,2 % en 1.050 preguntas de sondeo, frente a 71,5 % del base y 75,6 % de la iteración anterior.
- Mantiene capacidades generales de lectura del base: 73,4 % en 1.028 preguntas generales de lectura (base 70,5 %) y 83,9 % en 1.178 preguntas fuera de la distribución de entrenamiento (base 83,2 %).
- No soporta visión: las imágenes no forman parte del entrenamiento de este modelo.
- Tool calling, function calling, agentes y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Moderación y clasificación de contenido: dado un texto y una pregunta cerrada del tipo "¿este comentario contiene una amenaza?", el modelo devuelve una probabilidad calibrada que puede usarse directamente como umbral en un pipeline de moderación, sin necesidad de parsear texto generado.
- Enrutamiento de tickets de soporte: con preguntas de elección entre categorías predefinidas, el modelo asigna una probabilidad a cada categoría en un solo forward pass, lo que permite priorizar o derivar tickets según la confianza.
- Encuestas y formularios semiestructurados: a partir de respuestas en texto libre, el modelo puntúa en escalas definidas (por ejemplo, satisfacción de 1 a 5) con probabilidades calibradas, útiles para agregación estadística.
- Verificación de hechos acotada: preguntas sí/no sobre si un texto afirma una proposición concreta, con la regla de commit que evita respuestas ambiguas y facilita la revisión humana en los casos límite.
- Extracción de datos temporales y aritméticos: con el bloque de calculadora activo, preguntas sobre fechas, plazos y cálculos sencillos pasan de en torno al 57-60 % a cerca del 83 % de precisión en 874 preguntas, adecuado para triaje documental.
- Evaluación de elegibilidad en procesos reglados: preguntas cerradas sobre criterios (requisitos, exclusiones) con probabilidad por opción, integrable en flujos que exigen trazabilidad de la confianza declarada.
- Análisis de sentimiento y opinión acotada: elección entre opciones discretas o puntuación en escala, con calibración a las temperaturas incluidas para que las probabilidades sean comparables entre lotes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre preguntas de validación de su propia distribución de entrenamiento (no son benchmarks independientes), en bf16 y medidas a través de decisio con el modo batch-invariant desactivado:

| Conjunto | Gemma 4 12B base | Decisio tuned 12B anterior | Decisio v3 |
|---|---:|---:|---:|
| Todas las preguntas (5.000) | 67,7 % | 71,6 % | 78,8 % |
| Elección (2.792) | 68,9 % | 71,7 % | 79,8 % |
| Sí/no (1.220) | 83,0 % | 84,7 % | 89,8 % |
| Puntuación (988) | 45,1 % | 55,2 % | 62,2 % |
| Sondeo de redacción/orden (1.050) | 71,5 % | 75,6 % | 81,2 % |
| Fuera de distribución (1.178) | 83,2 % | — | 83,9 % |
| Lectura general (1.028) | 70,5 % | — | 73,4 % |

Otras métricas declaradas:

| Métrica | Valor |
|---|---|
| Ganancia frente a Decisio tuned anterior (5.000 preguntas) | +7,2 puntos (extremo inferior del intervalo del 90 %: +6,2) |
| Regla de commit en sí/no (1.220 preguntas) | 89,8 % con y sin regla; log loss 0,232 → 0,253; 19,3 % de respuestas en la banda 0,20-0,80 |
| Brier score con temperaturas por tipo | 0,234 |
| Brier score con temperatura única de 3,592 | 0,316 |
| Calculadora activada (874 preguntas con bloque numérico) | ~57-60 % → ~83 % |
| Fidelidad FP8 frente a bf16 (1.000 preguntas fijas) | Mismo resultado top en 97,0 %; cambio medio de probabilidad 0,015 (máximo 0,114) |

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: en torno a 12-13 GB solo para pesos, más overhead de activaciones y caché KV; con contexto corto, un presupuesto de 16-20 GB es razonable, aunque el dato exacto no está publicado.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con vLLM; también válidas GPUs con al menos 24 GB de VRAM.
- GPUs de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en FP8; en tarjetas de 16 GB el margen depende de la longitud de contexto y del backend.
- Despliegue: el método soportado es el servidor de decisio con su extra de vLLM (`uv run python -m decisio.serve.vllm_engine --base tachara-ai/Decisio-12b-tuned-v3-fp8-commit`), con decisio 0.50.1 o superior (probado con 0.50.2 y vLLM 0.31.0). El servidor rechaza arrancar si `decision_config.json` no coincide con el perfil del base instalado. Otros backends (llama.cpp, Ollama, TGI) no están documentados para este formato FP8 con compressed-tensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Decisio-12b-tuned-v3-fp8-commit | 11,96 B | No disponible | Decisión cerrada con probabilidades calibradas | Apache 2.0 | Hugging Face (FP8) |
| google/gemma-4-12B-it (base) | ~12 B | No disponible | Instrucción general, generación de texto | Apache 2.0 | Hugging Face |
| Decisio tuned 12B (iteración anterior) | ~12 B | No disponible | Decisión cerrada con probabilidades | Apache 2.0 | Hugging Face (revisiones previas del proyecto) |

La comparación relevante es interna al proyecto: frente al base, Decisio v3 gana 11,1 puntos en el conjunto global de 5.000 preguntas y 17,1 puntos en preguntas de puntuación, a costa de especializarse en un formato de salida muy concreto. Frente a la iteración anterior, la mejora es de 7,2 puntos. Modelos comparables de otros autores para esta tarea específica de clasificación con probabilidades calibradas: no disponible.

## Limitaciones y advertencias

- Las cifras de rendimiento proceden de preguntas de validación de la propia distribución de entrenamiento, no de un benchmark independiente; no deben extrapolarse a dominios arbitrarios.
- La calibración solo se sostiene a las temperaturas incluidas (elección 1,08; sí/no 1,43; puntuación 1,10) y cuando el modelo se sirve mediante decisio; otros servidores que no apliquen temperatura producen probabilidades más planas o más afiladas de lo declarado.
- Requiere decisio 0.50.1 o superior; versiones anteriores sirven el modelo sin el bloque de calculadora.
- No procesa imágenes: la visión queda fuera del entrenamiento de este modelo.
- La regla de commit no cambia la respuesta, solo la confianza declarada; puede ocultar incertidumbre real en el rango 0,20-0,80 y no debe interpretarse como una mejora de precisión.
- Idiomas soportados no documentados: el comportamiento multilingüe depende del base y no está evaluado en esta ficha.
- Riesgo de alucinación y sesgos: no documentados por el autor; al tratarse de un ajuste sobre Gemma 4, hereda los sesgos del modelo base, que no se detallan.
- La cuantización FP8 introduce desviaciones pequeñas pero medibles (cambio medio de probabilidad 0,015, máximo 0,114 en 1.000 preguntas); para aplicaciones sensibles a la calibración exacta, conviene validar con los pesos bf16.
- Las revisiones posteriores del repositorio pueden modificar `decision_config.json` sin cambiar los pesos; se recomienda fijar un commit con `@<commit>` y verificar con `SHA256SUMS`.
- Licencia Apache 2.0, que permite uso comercial; el fichero `NOTICE` nombra el repositorio y la revisión del base y debe conservarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachara-ai/Decisio-12b-tuned-v3-fp8-commit
- Organización del autor: https://huggingface.co/tachara-ai
- Repositorio de decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
