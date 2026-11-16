# tensor-tailor/zils-lite-body-21

## Resumen

zils-lite-body-21 es un modelo de la familia Qwen3.5-0.8B publicado por el usuario tensor-tailor en Hugging Face. Se trata de un "decision body" (cuerpo de decisión) destinado al pool de modelos tipo "soup" denominado d3-lite, asociado a la subnet 127 de Bittensor. El modelo parte de un checkpoint base (VadymPikulyk/zils-lite-dh2) y de una media de dos ejecuciones LoRA entrenadas sobre un conjunto de datos etiquetado y sobre probabilidades de un profesor denominado d3-ultra.

El modelo tiene 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB en formato safetensors. Su propósito declarado es servir como cuerpo de decisión dentro de un pipeline de evaluación y selección de respuestas, no como un modelo generativo de propósito general. La model card está dominada por metadatos de procedencia (hashes, recetas de entrenamiento, procedencia de datos) más que por una descripción funcional convencional.

La relevancia de esta ficha es limitada: se trata de un artefacto experimental con cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado, sin idiomas especificados y sin benchmarks publicados. Es útil como ejemplo de ingeniería de "model soups" y de entrenamiento con pérdidas híbridas (KL a profesor, entropía cruzada sobre etiquetas y KL a la distribución del propio modelo de partida), pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5-0.8B (tag `qwen3_5`), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible (las filas de entrenamiento llegan a 2.048 tokens, pero no se declara la ventana de inferencia) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5-0.8B, con 852.985.920 parámetros. No se declara una arquitectura MoE ni mecanismos de atención lineal o híbridos. El repositorio incluye código personalizado (`custom_code`), lo que implica que la carga estándar de `transformers` requiere confiar en código remoto o revisar dicho código antes de ejecutarlo.

El entrenamiento consistió en dos ejecuciones LoRA independientes (semillas 7101 y 7111) sobre un punto de partida común denominado S11, que es la media uniforme de dos cuerpos públicos del pool d3-lite (VadymPikulyk/zils-lite-dh2 en la revisión `6fc6dc5a` y qhoenix/zils-lite-decision-avg-abc en la revisión `a691a2fa`). Cada ejecución usó adaptadores LoRA de rango 32, alpha 64 y dropout 0,05 sobre 114 módulos (todas las capas), fusionados después en los pesos completos. El optimizador fue AdamW con tasa de aprendizaje 1e-4, decaimiento de peso 0, 50 pasos de calentamiento y decaimiento coseno, una época, lote de 8 con 2 pasos de acumulación y filas de hasta 2.048 tokens. El cuerpo final es la media de los dos deltas: START + 0,5 × (RUN1 − START) + 0,5 × (RUN2 − START), con 114 tensores modificados respecto al inicio.

La función de pérdida es híbrida y combina tres términos: KL entre el profesor y el cuerpo (peso 1, temperatura 1) sobre 69.992 filas de profesor; entropía cruzada sobre la etiqueta de 28.876 filas etiquetadas (peso 1, sin suavizado); y KL a la distribución de respuesta del propio modelo de partida, calculada en vivo, con peso 0,1 sobre todas las filas de entrenamiento y peso 1,0 sobre 15.900 prompts de anclaje ("pins"). Las dos ejecuciones duraron 162 y 166 minutos respectivamente, con pérdidas finales de 0,2728 y 0,2980. Los datos de entrenamiento suman 98.868 filas y 15.900 pins, distribuidos en cinco categorías (razonamiento, lenguaje, recuperación, herramientas y artes). De las filas etiquetadas, el 54,5 % procede de registros de split TRAIN de conjuntos de datos públicos, el 15,5 % de generadores propios, el 24,9 % de respuestas escritas por sesiones de Claude del equipo y el 3,4 % restante de un pool anterior y del diccionario de pronunciación CMU.

## Capacidades

- No se declaran capacidades generativas de propósito general; el modelo se describe como un "decision body" para un pool de selección de respuestas.
- El entrenamiento incluye categorías de razonamiento, lenguaje, recuperación, herramientas y artes, lo que sugiere capacidad para tareas de elección múltiple, respuesta sí/no y puntuación.
- Soporte de tool calling: no disponible explícitamente en la model card, aunque existe una categoría "tools" en los datos de entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- El modelo conserva la distribución de respuesta del modelo de partida mediante el término KL con peso 1,0 sobre los pins, lo que sugiere que se espera que mantenga el comportamiento del checkpoint S11 en dominios no cubiertos por el entrenamiento.

## Casos de uso

- Selección de respuestas en pipelines de evaluación: el modelo puede usarse como cuerpo de decisión para puntuar o elegir entre candidatos generados por otros modelos, dado que su entrenamiento combina etiquetas de elección, sí/no y puntuación.
- Destilación de un profesor en un cuerpo pequeño: el esquema de pérdida KL(profesor || cuerpo) con 69.992 filas es directamente reutilizable para destilar modelos mayores en un cuerpo de 0,85 mil millones de parámetros.
- Anclaje de comportamiento tras fine-tuning: el término KL al modelo de partida con peso 1,0 sobre 15.900 pins es un patrón aplicable cuando se quiere adaptar un modelo sin perder su distribución original en dominios críticos.
- Investigación sobre "model soups": la receta de media de deltas LoRA (START + media de RUN − START) es un ejemplo reproducible para estudiar la fusión de adaptadores.
- Clasificación ligera en entornos con recursos limitados: con 852 millones de parámetros y pesos bf16, el modelo cabe en GPUs de consumo, lo que permite experimentar con tareas de elección múltiple o sí/no sin infraestructura dedicada.
- Reproducibilidad de artefactos: la model card incluye hashes SHA-256 de pesos, ficheros de entrenamiento y recetas, lo que facilita auditar la cadena de procedencia en experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 852.985.920 parámetros en bf16 ocupan aproximadamente 1,7 GB de pesos; con overhead de activaciones y caché KV, la VRAM real será mayor y depende de la longitud de contexto, que no se declara.
- GPU recomendadas: no disponibles. Por tamaño, el modelo debería caber en GPUs de consumo con al menos 8 GB de VRAM en bf16, aunque no se ha verificado.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño de pesos, pero el requisito de `custom_code` y la ausencia de pipeline declarado impiden confirmarlo.
- Opciones de despliegue: no disponibles. Al requerir código personalizado, `vLLM`, `TGI` o `llama.cpp` podrían no soportarlo sin adaptaciones; no se documenta compatibilidad con Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensor-tailor/zils-lite-body-21 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Cuerpo de decisión experimental con `custom_code` |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Miembro del pool d3-lite usado como punto de partida |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Miembro del pool d3-lite usado como punto de partida |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | no disponible | Hugging Face (familia declarada) | Familia de la que deriva la arquitectura según la model card |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero "likes": no hay evidencia de uso en producción ni validación externa.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- Requiere `custom_code` y `trust_remote_code`: implica ejecutar código del autor, con el riesgo de seguridad asociado; hay que auditar el código antes de cargarlo.
- Sin lista de idiomas declarada: no se puede garantizar soporte multilingüe ni calidad en castellano.
- Sin longitud de contexto declarada: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: no evaluado; el modelo se entrena para tareas de decisión, no de generación abierta, y su uso fuera de ese dominio no está validado.
- Sesgos: no documentados; los datos de entrenamiento incluyen respuestas escritas por sesiones de Claude y registros de conjuntos públicos sin análisis de sesgo publicado.
- Licencia Apache 2.0: permite uso comercial, pero la presencia de código personalizado y de datos de procedencia diversa exige revisar las licencias de las fuentes de entrenamiento antes de un despliegue comercial.
- La model card está redactada en gran parte como registro de procedencia (hashes, recetas, ficheros) y no como documentación funcional, lo que dificulta evaluar su comportamiento esperado.

## Enlaces

- Hugging Face: https://huggingface.co/tensor-tailor/zils-lite-body-21
- Modelo base 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Modelo base 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Familia declarada: https://huggingface.co/Qwen/Qwen3.5-0.8B
