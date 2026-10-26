# tachara-ai/Decisio-12b-tuned-mlx8-commit

## Resumen

Decisio-12b-tuned-mlx8-commit es una versión cuantizada a 8 bits en MLX (Apple Silicon) del modelo tachara-ai/Decisio-12b-tuned-commit, un ajuste fino de google/gemma-4-12B-it orientado a un uso muy concreto: responder preguntas tipadas sobre un estado y devolver una probabilidad para cada opción posible. No es un modelo conversacional al uso, sino un motor de decisión que emite distribuciones de probabilidad calibradas sobre conjuntos cerrados de alternativas (preguntas de tipo sí/no, de elección entre opciones y de puntuación). Lo desarrolla tachara-ai y se distribuye con licencia Apache 2.0, la misma del modelo base.

El repositorio concreto que nos ocupa es la variante "commit": comparte pesos con Decisio-12b-tuned-mlx8-calibrated y se diferencia únicamente en `decision_config.json`. La regla "commit" actúa sobre las preguntas de sí/no: cualquier probabilidad estrictamente entre 0,20 y 0,80 se reporta en el borde de esa banda, del lado que le corresponde (0,80 por encima de un medio, 0,20 en un medio o por debajo). La respuesta elegida nunca cambia; lo que cambia es su calibración declarada.

Su relevancia práctica está en el formato: son 11.907.350.272 parámetros (unos 11,9 B) en safetensors MLX de 8 bits con grupos de 64, 12,7 GB de pesos, y el autor reporta que el modelo cabe y funciona en un Mac de 32 GB. Frente a los pesos bf16, sobre 1.894 preguntas no vistas en entrenamiento, la respuesta principal coincide en el 97,9% de los casos y la precisión cae solo 0,1 puntos (69,8% frente a 69,9%). El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no se han publicado resultados en benchmarks públicos estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (tag `gemma4_unified`); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 11.907.350.272 (aproximadamente 11,9 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; el motor MLX de decisio se midio con estados de 8k, 16k y 32k tokens |
| Tipos de cuantizacion | MLX affine, 8 bits por peso en grupos de 64 (existe una variante de 6 bits del mismo ajuste) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (la del modelo base; Gemma 4 es de Google, ver `LICENSE` y `NOTICE`) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`), 12,7 GB de repositorio |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Gemma 4 12B instruct. El adaptador se fusionó en el modelo base en fp32 y se redondeó una sola vez a bf16 de forma estocástica (semilla 0) antes de la conversión a MLX. La cuantización la realizó mlx-lm 0.32.2 con cuantización affine de 8 bits y grupos de 64; el autor indica expresamente que esta conversión no es la de decisio y que `decision_config.json` lista cada fichero por sha256 junto a `SHA256SUMS`. Los datos de entrenamiento no se divulgan: la model card solo indica que no se usaron items de evaluación de Decision Index ni de JevBench (ni en entrenamiento ni en selección de checkpoint) y que los datos se descontaminaron contra los conjuntos de test públicos de ambos tableros. También se usaron los splits oficiales de entrenamiento de algunos benchmarks públicos bajo sus licencias, comprobando cada fila contra los test públicos de los dos tableros.

La innovación no está en el bloque transformer sino en la capa de decisión que lo envuelve. El modelo se sirve a través de decisio (versión 0.34.0 o posterior), que aplica un layout de prompt con cabecera propia, una lectura de la probabilidad a partir de la letra de la opción y temperaturas específicas por tipo de pregunta y banda de elección. Esas temperaturas se ajustaron por mínima log loss sobre la lectura plana del modelo bf16 y se reutilizan sin cambios en esta versión. La variante "commit" añade la regla de compromiso en sí/no descrita en el resumen: recorta las probabilidades hacia los bordes de la banda [0,20; 0,80] sin alterar la opción ganadora.

## Capacidades

- Emisión de distribuciones de probabilidad sobre conjuntos cerrados de opciones, en lugar de texto libre.
- Preguntas de tipo sí/no con regla de compromiso ("commit") aplicada a la calibración declarada.
- Preguntas de elección entre múltiples opciones (choice), con lectura de la probabilidad mediante la letra de la opción.
- Preguntas de puntuación (score) sobre una escala.
- Condicionamiento sobre un "estado" textual de hasta 32k tokens, según las mediciones de memoria del motor MLX.
- Servicio mediante el motor MLX de decisio, con valores por defecto del repositorio accesibles vía `/health`, `systemone.repository_defaults` y `systemone.flavor`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo está diseñado para una pregunta-respuesta con distribución de salida.
- Capacidades multimodales, de audio o modo "thinking": no disponibles en la informacion proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas en el repositorio.

## Casos de uso

- Triaje de tickets o incidencias con umbral explícito: se formula una pregunta sí/no ("¿requiere escalado humano?") y se usa la probabilidad commit como score; los valores entre 0,20 y 0,80 se envían a revisión manual, y los extremos se enrutan automáticamente.
- Clasificación con conjunto cerrado de etiquetas: para un estado dado (texto del caso), el modelo devuelve la probabilidad de cada etiqueta candidata, lo que permite ordenar por confianza en lugar de aceptar una única etiqueta rígida.
- Enrutamiento de peticiones en un pipeline: elegir entre varios modelos o herramientas según la probabilidad de cada opción, aprovechando que la salida es una distribución y no una cadena de texto que haya que parsear.
- Puntuación de riesgo o calidad en una escala: la modalidad "score" permite obtener una probabilidad por nivel de la escala y agregarlas o aplicar cortes definidos por el producto.
- Evaluación de decisiones asistidas por LLM en investigación: al fijar temperaturas y layout por tipo de pregunta, el modelo sirve como referencia reproducible en experimentos de calibración y comparación de readouts.
- Despliegue local en estaciones de trabajo Apple Silicon: con 13,8 GB de pesos y un pico de 14,9 GB a 8k tokens, permite prototipar y servir el modelo en un Mac de 32 GB sin GPU dedicada, útil para demos internas y pruebas de integración.
- Sustitución de un paso de "juicio" dentro de un sistema mayor: un LLM general genera opciones y el estado, y Decisio aporta la probabilidad por opción con un contrato de salida estable definido por `decision_config.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los únicos datos son la comparación interna del autor entre esta versión MLX de 8 bits y los pesos bf16 servidos con los mismos ajustes de decisio, sobre 1.894 preguntas no vistas en entrenamiento:

| Metrica | bf16 (referencia) | mlx8 | Diferencia |
|---|---|---|---|
| Coincidencia de la respuesta principal (global) | referencia | 97,9% | -2,1 puntos |
| Coincidencia en preguntas si/no | referencia | 99,7% | -0,3 puntos |
| Coincidencia en preguntas de eleccion | referencia | 97,4% | -2,6 puntos |
| Coincidencia en preguntas de puntuacion (score) | referencia | 98,1% | -1,9 puntos |
| Precision (accuracy) | 69,9% | 69,8% | -0,1 puntos (intervalo emparejado del 90%: -0,5 a +0,3) |

En una comprobación adicional de 100 preguntas, la diferencia maxima de una probabilidad respecto a bf16 fue de 0,048 (media 0,0095) y las 100 respuestas principales coincidieron. Un arranque nuevo del servidor respondió de forma idéntica a una muestra de 150 preguntas.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: pesos 13,8 GB; pico de 14,9 GB con 8k tokens de estado, 16,2 GB con 16k, 18,6 GB con 32k (16,4 GB a 32k con diez preguntas). Medido en el motor MLX de decisio sobre un Apple M5 Pro de 64 GB sin uso de swap.
- Cabe en consumidor: sí, en Apple Silicon; el autor indica que un Mac de 32 GB tiene espacio suficiente. No hay datos de ejecución en GPUs NVIDIA, AMD o Intel.
- GPU recomendadas: no disponibles para esta version; el repositorio es exclusivamente MLX. Para CUDA habría que recurrir a los pesos bf16 del repositorio base.
- Opciones de despliegue: `decisio` 0.34.0 o superior con backend MLX (`uv run python -m decisio.serve.vllm_engine --backend mlx --base tachara-ai/Decisio-12b-tuned-mlx8-commit`, o `pip install "decisio[mlx]"`). `mlx-lm` por sí solo carga los pesos, pero no aplica el layout de prompt de decisio, la lectura por letra de opción, las temperaturas ni la regla commit.
- Latencia y throughput: no disponibles. La model card solo reporta memoria y coincidencia de respuestas, no tiempos por token ni peticiones por segundo.
- Alternativa de menor huella: la variante de 6 bits (Decisio-12b-tuned-mlx-commit / mlx-calibrated) consume menos memoria a costa de alejarse algo más de bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Decisio-12b-tuned-mlx8-commit (este) | 11,9 B | MLX affine 8 bits, grupos de 64 | Medicion hasta 32k | Apache 2.0 | Regla commit en si/no; 97,9% de coincidencia con bf16 |
| Decisio-12b-tuned-mlx8-calibrated | 11,9 B | MLX affine 8 bits | Medicion hasta 32k | Apache 2.0 | Mismos pesos; solo cambia `decision_config.json` (sin la regla commit) |
| Decisio-12b-tuned-commit (bf16) | 11,9 B | safetensors bf16 | no disponible | Apache 2.0 | Referencia de calidad: 69,9% de precision en la evaluacion interna |
| Decisio-12b-tuned-mlx-commit (6 bits) | 11,9 B | MLX affine 6 bits | Medicion hasta 32k | Apache 2.0 | Menos memoria, algo más lejos de bf16 |
| google/gemma-4-12B-it (base) | no disponible en la informacion | no disponible | no disponible | Apache 2.0 (Gemma 4 es de Google) | Modelo conversacional general; no incluye layout de decisión, readout ni temperaturas |

No se dispone de comparaciones con modelos de decisión de otros proveedores ni con modelos del mismo tamaño en benchmarks públicos.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo con mlx-lm directamente, sin el layout de prompt, el readout por letra de opción y las temperaturas de decisio, produce resultados no válidos aunque la carga funcione.
- La precisión reportada es del 69,8% sobre un conjunto interno de 1.894 preguntas; aproximadamente tres de cada diez preguntas se responden mal. No es una cifra validada de forma independiente ni corresponde a ningún benchmark público.
- La regla commit altera la calibración declarada en el rango (0,20; 0,80): dos probabilidades distintas pueden reportarse con el mismo valor en el borde de la banda. Si el consumidor espera calibración sin recorte, debe usar el repositorio "calibrated" con los mismos pesos.
- La cuantización introduce desviaciones: hasta 0,048 de diferencia absoluta en una probabilidad en la comprobación de 100 preguntas, y un 2,1% de respuestas principales distintas en choice (97,4% de coincidencia).
- Los datos de entrenamiento no se divulgan, por lo que no se pueden auditar sesgos de dominio, idioma ni composición del corpus. Tampoco se declaran idiomas soportados.
- La descontaminación solo se afirma contra los test públicos de Decision Index y JevBench; frente a otros benchmarks no hay garantía declarada, aunque el autor afirma haber comprobado cada fila de entrenamiento contra ambos tableros.
- El repositorio es de julio de 2026 (creado el 26 de octubre de 2026 según los metadatos), con 0 descargas y 0 likes: no hay validación de la comunidad ni reportes independientes de calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las obligaciones del modelo base Gemma 4 de Google; hay que conservar `LICENSE` y `NOTICE` y verificar los términos aplicables al modelo base.
- El repositorio es exclusivamente MLX: no hay pesos GGUF ni safetensors estándar para vLLM, TGI o llama.cpp en esta variante.
- El nombre del script de servicio (`vllm_engine`) no implica soporte de vLLM; el backend indicado es MLX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-commit
- Pesos bf16 de referencia: https://huggingface.co/tachara-ai/Decisio-12b-tuned-commit
- Variante calibrada equivalente (8 bits MLX): https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx8-calibrated
- Variante de 6 bits MLX: https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-commit y https://huggingface.co/tachara-ai/Decisio-12b-tuned-mlx-calibrated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- No se han encontrado enlaces relevantes (paper, blog, repositorio de codigo o demo) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo y se han descartado.
