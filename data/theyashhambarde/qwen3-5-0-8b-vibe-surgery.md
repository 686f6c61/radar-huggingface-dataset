# theyashhambarde/Qwen3.5-0.8B-vibe-surgery

## Resumen

Qwen3.5-0.8B-vibe-surgery es una edición de pesos (weight editing) del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario theyashhambarde bajo el paraguas del proyecto Nexus. No se trata de un fine-tuning ni de un reentrenamiento: el autor ha modificado manualmente 130.384 pesos, concretamente 64 columnas de la matriz `down_proj` en las capas 15 y 19 del bloque MLP del modelo de lenguaje. El objetivo declarado es corregir el comportamiento de repetición en bucle que el modelo base muestra en tareas de razonamiento matemático con respuestas largas.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de programación en el espacio de pesos (weight-space programming), una técnica de edición directa de parámetros inspirada en el trabajo de MIT CSAIL "Sparks of Weight-Space Programming". Por otro, ofrece una mejora medible en MATH-500 sobre el modelo original (13/30 frente a 6/30 en una muestra de 30 problemas), aunque con un tamaño de muestra reducido que limita la solidez estadística de la conclusión.

El modelo conserva la arquitectura, el tokenizador y el resto de pesos del Qwen3.5-0.8B original, con 873.438.784 parámetros totales y un repositorio de 1,8 GB en formato safetensors. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), edición de pesos en capas MLP |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar al derivar del base) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con 873 millones de parámetros. La intervención no altera la arquitectura: se limita a modificar dos matrices `down_proj` dentro de las capas 15 y 19 del bloque MLP del modelo de lenguaje. La operación aplicada es `W[:, cols] -= 4 * outer(u, u @ W[:, cols])` sobre 64 columnas por capa, donde `u` es la dirección que el autor identificó como responsable de la escritura de estados de repetición en esas capas. En total se editaron 130.384 pesos, el resto permanece idéntico a la release original de Qwen.

No hubo entrenamiento, fine-tuning, RLHF ni DPO. La metodología es puramente de edición en espacio de pesos: localizar una dirección semántica en las activaciones y proyectar los pesos en contra de ella. El autor publica en su repositorio de GitHub un fichero de 64 KB que reconstruye el modelo byte a byte a partir del original, junto con el script de evaluación, todas las respuestas generadas y el cuaderno del proceso. La idea procede del trabajo de MIT CSAIL sobre weight-space programming, cuyo edit publicado del mismo modelo base obtiene 16/30 en la misma prueba.

## Capacidades

- Generación de texto y razonamiento matemático con modo thinking activado.
- Resolución de problemas de matemáticas de competición (MATH-500) con respuestas largas y formato `\boxed{}`.
- Razonamiento multi-paso sostenido: la mejora declarada proviene de que el modelo termina su razonamiento en lugar de entrar en bucles de repetición.
- Compatibilidad con el stack de inferencia del Qwen3.5-0.8B original (tokenizador, chat template y configuración de generación sin cambios).
- Capacidades del modelo base (código, multilingüismo, tool calling) presumiblemente preservadas, aunque no se documentan explícitamente en la información disponible.
- No se declaran capacidades de visión, audio ni agentes específicas para esta edición.

## Casos de uso

- Evaluación de técnicas de edición de pesos: el repositorio permite reproducir el experimento byte a byte, lo que lo convierte en un banco de pruebas para investigar weight-space programming sobre modelos pequeños.
- Investigación sobre bucles de repetición en LLM: las capas 15 y 19 y la dirección `u` identificada ofrecen un punto de partida concreto para estudiar el fenómeno en modelos de 0,8B.
- Razonamiento matemático en entornos con recursos limitados: con menos de 900M de parámetros, el modelo puede desplegarse en GPU de consumo y usarse para problemas de MATH-500 con presupuesto de tokens largo (32.768 tokens por respuesta).
- Generación de soluciones paso a paso con verificación automática: el formato `\boxed{}` y la recomendación de usar `math-verify` facilitan pipelines de grading automático en investigación educativa.
- Baseline para comparativas de edición: sirve como referencia frente al edit publicado por MIT CSAIL (16/30) y frente al modelo original (6/30) en la misma prueba.
- Docencia y divulgación: el cuaderno de Nexus y el fichero de parche de 64 KB permiten explicar de forma tangible cómo una intervención de 130.384 pesos cambia el comportamiento de un transformer.
- Prototipado de asistentes matemáticos en local: al caber en GPU de consumo y mantener la licencia Apache 2.0, es apto para experimentación sin dependencia de API.

## Benchmarks y rendimiento

| Benchmark | Modelo original | Esta edicion | Edit de MIT CSAIL |
|---|---|---|---|
| MATH-500 (30 problemas, 32.768 tokens, thinking on) | 6/30 (20%) | 13/30 (43%) | 16/30 |

Ajustes de evaluación declarados por el autor: vLLM, thinking activado, temperatura 0,6, top-p 0,95, top-k 20, presence penalty 1,5, una muestra por problema, grading del último `\boxed{}` con math-verify. El propio autor advierte que 30 problemas es una muestra pequeña y remite al repositorio para consultar todas las respuestas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, más overhead de KV cache; en la práctica, 3-4 GB en GPU.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Cabe en GPU de consumo.
- Despliegue: el autor reporta uso con vLLM. Al conservar el formato safetensors y la arquitectura del base, es compatible con llama.cpp, Ollama y TGI previa conversión a GGUF si se desea.
- Latencia y throughput: no disponibles en la información proporcionada. El autor recomienda presupuestos de tokens largos (hasta 32.768) para que la mejora se manifieste; con límites cortos el comportamiento se aproxima al del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (30 prob.) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-vibe-surgery | 873M | no disponible | 13/30 | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B (original) | 873M | no disponible | 6/30 | Apache 2.0 | HuggingFace |
| Edit de MIT CSAIL sobre Qwen3.5-0.8B | 873M | no disponible | 16/30 | no disponible | blog de MIT CSAIL |

No se dispone de datos de otros modelos comparables de 0,8B en la información proporcionada.

## Limitaciones y advertencias

- Tamaño de muestra reducido: 30 problemas de MATH-500 no permiten conclusiones estadísticamente robustas; la diferencia 13/30 frente a 6/30 debe interpretarse con cautela.
- Dependencia de configuración: la mejora se observa con thinking activado y respuestas largas (hasta 32.768 tokens); con límites cortos el modelo se comporta como el original.
- Edición no validada de forma independiente: los resultados provienen del propio autor; no se han publicado replicaciones externas en la información disponible.
- Riesgo de alucinación: no se documenta ninguna mitigación específica; el modelo hereda los sesgos y limitaciones del Qwen3.5-0.8B base.
- Sesgos conocidos: no disponibles en la información proporcionada; se presuponen los del modelo base.
- Idiomas soportados: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; el modelo es un experimento de investigación, no una release estable.

## Enlaces

- HuggingFace: https://huggingface.co/theyashhambarde/Qwen3.5-0.8B-vibe-surgery
- Repositorio del autor (parche, evaluación y cuaderno): https://github.com/theyashhambarde/nexus-vibe-surgery
- Blog de MIT CSAIL sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
- Nexus: https://nexusbuild.in
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
