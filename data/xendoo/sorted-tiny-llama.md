# xendoo/sorted-tiny-llama

## Resumen

`sorted-tiny-llama` es un modelo de lenguaje causal de 14,2 millones de parámetros desarrollado por el usuario `xendoo` y publicado en Hugging Face bajo licencia Apache 2.0. No es un modelo de propósito general: se trata de un oráculo sintético diseñado específicamente para verificar la corrección de runtimes de inferencia. El modelo se ha entrenado desde cero sobre secuencias de token-ids consecutivos `[k, k+1, ...]` módulo 50000, de modo que la decodificación greedy debe continuar la secuencia de forma exacta y predecible.

La relevancia del modelo es práctica y acotada: permite comparar, token a token, la salida de un runtime (por ejemplo vLLM) contra la referencia de Hugging Face, detectando discrepancias numéricas o de lógica de decodificación que serían difíciles de aislar con un modelo real. Al ser un patrón determinista y verificable a mano, cualquier desviación indica un bug en el runtime, no una variabilidad del modelo.

Arquitectura `llama` con inicialización aleatoria, entrenada durante 3000 pasos con learning rate 0.0005 y batch de 16 sobre datos totalmente sintéticos generados al vuelo. El repo ocupa 0,3 GB y los pesos están en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer causal decoder-only) |
| Parametros totales | 14.177.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre token-ids sintéticos, sin lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `llama` estándar (transformer causal decoder-only) con inicialización aleatoria. Se entrenó desde cero durante 3000 pasos con learning rate 0.0005 y batch size 16. La innovación no está en la arquitectura sino en el dataset: las secuencias de entrenamiento son runs de token-ids consecutivos `[k, k+1, ...]` módulo 50000 (ids de 0 a 49999, con 49999 envolviendo a 0), generadas al vuelo por la función `train.py::consecutive_seq`. Se empleó una fracción de 0.25 de ejemplos que cruzan el límite del módulo para que el modelo aprenda el comportamiento de wrap-around.

No se menciona uso de RLHF, DPO ni datos de lenguaje natural. El objetivo es que la continuación greedy sea exactamente la secuencia aritmética esperada, lo que convierte al modelo en un oráculo verificable manualmente. La evaluación reportada es de exact-match greedy contra la continuación calculada a mano: 1.000 en distribución y 1.000 en secuencias más largas que las vistas en entrenamiento.

## Capacidades

- Continuación determinista de secuencias de token-ids consecutivos módulo 50000 mediante decodificación greedy.
- Verificación token a token de runtimes de inferencia frente a la referencia de Hugging Face.
- Detección de discrepancias numéricas o de lógica de decodificación en implementaciones alternativas.
- Generalización a secuencias más largas que las de entrenamiento (exact-match 1.000 reportado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de lenguaje natural: no ha sido entrenado sobre texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Verificación de runtimes de inferencia: ejecutar el modelo en vLLM y comparar la salida greedy token a token contra la referencia de Hugging Face para detectar bugs de implementación en kernels de atención o decodificación.
- Validación de pipelines de cuantización: comprobar que una versión cuantizada del modelo mantiene la continuación exacta esperada en secuencias cortas, aislando errores numéricos.
- Test de integración en CI/CD: incluir el modelo como caso de prueba determinista que falle si un cambio en el runtime altera la salida esperada.
- Depuración de lógica de wrap-around: validar el manejo del límite del vocabulario (49999 → 0) en implementaciones de sampling y decodificación.
- Benchmark de latencia en hardware concreto: al ser un modelo de 14,2M parámetros, sirve para medir overhead de arranque y throughput de runtimes sin que el coste computacional del modelo enmascare el resultado.
- Prueba de humo de despliegues: verificar que un endpoint o servidor de inferencia recién desplegado devuelve la secuencia esperada antes de cargar modelos de producción.

## Benchmarks y rendimiento

| Evaluacion | Resultado |
|---|---|
| Exact-match greedy en distribucion | 1.000 |
| Exact-match greedy, secuencias mas largas que en entrenamiento | 1.000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no tendrían sentido para este modelo al no estar entrenado sobre lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 57 MB para los pesos (14,2M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 28 MB para los pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100 ni H100. Para pruebas de runtime conviene la GPU objetivo del runtime a validar.
- Opciones de despliegue: Hugging Face Transformers como referencia; vLLM es el caso de uso principal declarado por el autor. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (oráculos sintéticos para verificación de runtimes). Modelos tiny de propósito general como TinyLlama (1,1B parámetros) no son comparables en funcionalidad: están entrenados sobre lenguaje natural y no ofrecen continuaciones deterministas verificables a mano.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no ha sido entrenado sobre texto natural y no debe usarse para generación, razonamiento ni tareas de NLP.
- Su salida solo es válida para el patrón sintético de token-ids consecutivos módulo 50000; fuera de ese patrón el comportamiento no está caracterizado.
- La longitud de contexto no está documentada, lo que limita saber hasta qué longitud de secuencia se mantiene la garantía de continuación exacta.
- No se documentan tipos de cuantización soportados ni su efecto sobre la exactitud de la continuación.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de divergencia si se usa fuera del patrón entrenado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo carece de utilidad comercial más allá de pruebas internas de infraestructura.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-02): no hay evidencia de uso o validación por terceros.
- No se documentan sesgos, pero tampoco se ha realizado ninguna evaluación de sesgo al no tratar datos humanos.

## Enlaces

- Hugging Face: https://huggingface.co/xendoo/sorted-tiny-llama
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados al modelo.
