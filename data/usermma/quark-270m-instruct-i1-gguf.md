# usermma/Quark-270m-Instruct-i1-GGUF

## Resumen

Quark-270m-Instruct-i1-GGUF es una cuantización en formato GGUF del modelo ThingAI/ARK-270M-Instruct, publicada por el usuario usermma. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a GGUF realizada con llama.cpp a partir de los pesos originales en safetensors. El modelo base es un transformer causal bilingüe (italiano e inglés) de aproximadamente 251,7 millones de parámetros, entrenado desde cero y afinado con SFT para uso conversacional.

La relevancia de esta ficha radica en su perfil: un modelo de lenguaje muy pequeño (sub-300M), con licencia Apache 2.0 y pesos disponibles en GGUF, lo que lo hace apto para despliegues en CPU, dispositivos de borde y entornos con memoria muy limitada. El repositorio incluye una cuantización Q6_K generada con imatrix, lo que sugiere un esfuerzo por preservar calidad en un tamaño reducido.

Al tratarse de una mera conversión de formato, las capacidades reales del modelo dependen del checkpoint original; esta ficha documenta lo que la información disponible permite afirmar y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm); detalles internos no disponibles |
| Parametros totales | 251.749.888 (dato de safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible; los ejemplos de la model card usan `-c 2048` |
| Tipos de cuantizacion | GGUF; el repositorio incluye al menos Q6_K con imatrix |
| Idiomas soportados | Italiano (it) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantización); el modelo base en safetensors |
| Tamano del repo | 2,8 GB |
| Modelo base | ThingAI/ARK-270M-Instruct |
| Libreria | transformers (declarada), ejecutable con llama.cpp |

## Arquitectura y entrenamiento

El modelo base se describe como un transformer causal entrenado desde cero ("trained-from-scratch") y posteriormente sometido a SFT para obtener la variante Instruct. La información proporcionada no detalla el número de capas, dimensión oculta, número de cabezas de atención ni la composición exacta del corpus de entrenamiento (número de tokens, mezcla de datos, presencia de RLHF o DPO). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

La contribución de este repositorio concreto es la conversión a GGUF mediante llama.cpp y la generación de una cuantización Q6_K con imatrix, técnica que calibra la cuantización con una matriz de importancia para reducir la pérdida de calidad respecto a una cuantización uniforme. No se han publicado curvas de perplejidad ni comparativas de calidad entre la versión GGUF y los pesos originales.

## Capacidades

- Generación de texto causal en italiano e inglés.
- Formato conversacional (instruct/chat) tras el ajuste SFT del modelo base.
- Ejecución local mediante llama.cpp (CLI y servidor HTTP).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Capacidades de razonamiento, código o matemáticas: no documentadas en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistentes conversacionales en italiano para entornos con recursos limitados: el tamaño de 251,7 M de parámetros permite ejecutar el modelo en CPU o en GPUs de gama baja, sirviendo como chatbot ligero en aplicaciones de escritorio o web con presupuesto de memoria mínimo.
- Prototipado rápido de pipelines de generación de texto: al estar en GGUF y ser compatible con llama.cpp, se puede integrar en scripts de experimentación sin necesidad de infraestructura GPU.
- Despliegue en dispositivos de borde (Raspberry Pi, mini-PC, móviles de gama alta): la cuantización Q6_K y el reducido número de parámetros hacen viable la inferencia local sin conexión.
- Filtrado y clasificación de texto bilingüe italiano/inglés: tareas de etiquetado, resumen corto o reformulación donde la latencia y el coste importan más que la profundidad de razonamiento.
- Generación de texto asistida en herramientas de edición: autocompletado o sugerencias de redacción en italiano dentro de aplicaciones ofimáticas o IDE, con el modelo ejecutándose en el propio equipo.
- Base para experimentación académica en modelos pequeños: permite reproducir y comparar técnicas de cuantización (imatrix frente a cuantización estándar) sobre un modelo de 270M con licencia permisiva.
- Servicio de inferencia ligero con llama-server: exposición de un endpoint HTTP compatible con la API de OpenAI para pruebas de integración en aplicaciones que no requieran alta calidad generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 251,7 M de parámetros en Q6_K ocupa del orden de 200-250 MB de pesos; el consumo real depende del contexto configurado y de la implementación.
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU con al menos 1 GB de VRAM libre debería poder alojar los pesos; no se han publicado pruebas en A100, H100 o RTX 4090.
- GPU de consumo: previsiblemente cabe en GTX 1050, GTX 1650, RTX 3050, RTX 4060 y superiores, así como en GPUs integradas con memoria compartida suficiente; sin datos de rendimiento publicados.
- CPU: viable en CPU moderna (x86-64 o ARM) mediante llama.cpp; el repositorio está pensado para este escenario.
- Opciones de despliegue: llama.cpp (CLI y llama-server), y por compatibilidad de formato GGUF, otros runners que lo soporten (Ollama, llama-cpp-python) aunque no se documentan explícitamente en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Quark-270m-Instruct-i1-GGUF | 251,7 M | no disponible (ejemplos con 2048) | it, en | Apache 2.0 | GGUF | Cuantización de ARK-270M-Instruct |
| ThingAI/ARK-270M-Instruct | 251,7 M | no disponible | it, en | Apache 2.0 | safetensors | Modelo base original |
| SmolLM2-360M-Instruct | 360 M | 8K (según su model card pública) | principalmente en | Apache 2.0 | safetensors, GGUF | Alternativa pequeña de propósito general |
| Qwen2.5-0.5B-Instruct | 494 M | 32K (según su model card pública) | multilingüe | Apache 2.0 | safetensors, GGUF | Mayor tamaño y cobertura idiomática |

Los datos de SmolLM2-360M-Instruct y Qwen2.5-0.5B-Instruct provienen de sus model cards públicas y se incluyen solo como referencia de categoría; no se dispone de comparativas de rendimiento directas con Quark-270m-Instruct.

## Limitaciones y advertencias

- Modelo de 251,7 M de parámetros: la calidad generativa, el razonamiento y la fidelidad factual serán limitados en comparación con modelos de mayor tamaño; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación elevado en un modelo pequeño sin datos públicos de evaluación; no debe usarse como fuente de verdad en dominios sensibles (médico, legal, financiero).
- Cobertura idiomática restringida a italiano e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no publicada; los ejemplos de la model card usan 2048 tokens, por lo que no debe asumirse una ventana mayor.
- Sesgos: no se ha publicado información sobre sesgos de género, raza o ideológicos del modelo base.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor de la cuantización no ofrece garantías sobre el modelo base; conviene revisar la model card original de ThingAI/ARK-270M-Instruct.
- Este repositorio es una conversión de formato, no un modelo entrenado por usermma; los problemas de calidad deben atribuirse al checkpoint original.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; no asumirlas en producción sin validación previa.
- El repositorio registra 0 likes y un tamaño de 2,8 GB, lo que sugiere que puede contener múltiples archivos GGUF además del Q6_K mencionado; verificar los ficheros disponibles antes de integrar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/usermma/Quark-270m-Instruct-i1-GGUF
- Modelo base: https://huggingface.co/ThingAI/ARK-270M-Instruct
- llama.cpp (repositorio oficial): https://github.com/ggerganov/llama.cpp
- Documentación de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
