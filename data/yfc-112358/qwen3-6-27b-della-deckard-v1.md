# YFC-112358/Qwen3.6-27B-Della-Deckard-v1

## Resumen

Qwen3.6-27B-Della-Deckard-v1 es un modelo de lenguaje multimodal (VLM) de 27.781 millones de parámetros, resultado de una fusión de pesos en dos etapas sobre el modelo base Qwen/Qwen3.6-27B. El autor, YFC-112358, combina dos destilados de razonamiento de la misma generación mediante la técnica DELLA y añade un vector de tarea entre generaciones para transferir capacidades de ingeniería y código desde un fine-tune de Qwen3.5. El objetivo es obtener un modelo con razonamiento matemático y lógico mejorado, manteniendo intactas las capacidades multimodales del base.

El modelo presenta una arquitectura densa de 64 capas con atención híbrida (lineal y completa), cabeza de predicción multitoken (MTP) y torre de visión. Su estructura de tensores es idéntica a la del base, con 1199 tensores en BF16 y un tamaño de 51,7 GB. La licencia Apache 2.0 permite uso comercial sin restricciones significativas. La relevancia de este modelo radica en su enfoque metódico de fusión, donde cada coeficiente de mezcla se justifica con mediciones de distancia en el espacio de pesos, y en su verificación exhaustiva, incluyendo pruebas de generación en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal + completa), torre de visión, cabeza MTP |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos originales en BF16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (26 shards, BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-27B, un VLM denso de 64 capas con hidden size de 5120 y atención híbrida que combina mecanismos lineales y de atención completa, además de una cabeza de predicción multitoken (MTP) y una torre de visión. La fusión se realiza en dos etapas. La primera etapa aplica DELLA, una técnica de fusión que poda y selecciona signos de dos deltas de razonamiento: una LoRA (r=32, α=64, scaling 2.0) del modelo Ravionhf/qwen3.6-27b-reasoning-distill-lora-v1 y los pesos completos de nerkyor/Qwen3.6-27B-DSV4Pro-Thinking-Distill. La poda por magnitud (magprune) asigna una probabilidad de retención lineal según densidad, y la elección de signo por mayoría evita que dos destilados se cancelen entre sí.

La segunda etapa añade un vector de tarea entre generaciones: τ = W(nightmedia/Qwen3.5-27B-Engineer-Deckard-Gemini) − W(Qwen/Qwen3.5-27B), escalado por λ₂ = 0,15. La justificación se basa en mediciones de similitud coseno entre generaciones (0,9478 entre Qwen3.5 y Qwen3.6), lo que indica que la correspondencia neuronal sobrevive al cambio generacional y el vector de tarea apunta en una dirección significativa. El modelo no fue entrenado con RLHF o DPO; se trata exclusivamente de una fusión de pesos sin datos de entrenamiento adicionales.

## Capacidades

- Razonamiento matemático y lógico mejorado: el modelo dedica más tokens de pensamiento a problemas complejos (p. ej., 1022 tokens para una identidad trigonométrica exacta).
- Generación de código y capacidades de ingeniería: transferidas desde el vector de tarea de Qwen3.5-27B-Engineer-Deckard-Gemini.
- Comprensión multimodal (visión): la torre de visión se copia íntegramente del base, por lo que conserva las capacidades de imagen-texto del Qwen3.6-27B.
- Razonamiento multi-step y verificación de respuestas: en pruebas de humo, respondió `8` a una pregunta de potencias sin explicación adicional cuando se le pidió, mostrando control del presupuesto de reflexión.
- Conversación bilingüe (chino e inglés) con plantilla de chat propia.
- Soporte de tool calling y agentes: heredado del modelo base Qwen3.6-27B, que incluye mejoras en codificación agéntica.
- Compatibilidad con el ecosistema transformers y despliegue con vLLM (verificado en A100-80GB).

## Casos de uso

- Asistentes de programación en producción: el modelo integra el vector de ingeniería de Deckard, lo que lo hace adecuado para generación de código, revisión y refactorización en pipelines de CI/CD, donde su capacidad de razonamiento multi-step puede resolver tareas complejas de programación.
- Sistemas de tutoría matemática y STEM: su razonamiento matemático mejorado y su control del presupuesto de reflexión permiten explicar problemas paso a paso, adaptando el nivel de detalle a la petición del usuario.
- Análisis de documentos con imagen y texto: al conservar la torre de visión del Qwen3.6-27B, puede procesar imágenes, OCR y documentos que combinan texto y figuras, útil en automatización de oficinas o investigación.
- Agentes de automatización con tool calling: la base Qwen3.6 está optimizada para agentes, por lo que este modelo puede integrarse en sistemas que necesiten llamar a APIs, ejecutar código o interactuar con herramientas externas de forma autónoma.
- Generación de respuestas bilingües en atención al cliente: con soporte de chino e inglés, puede gestionar conversaciones multi-turno con contexto largo (no disponible, pero heredado del base) en servicios internacionales.
- Prototipado rápido de modelos de razonamiento: al ser una fusión de pesos sin entrenamiento adicional, es un punto de partida para investigadores que quieran experimentar con técnicas DELLA o vectores de tarea sin coste de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación presentada es una prueba de humo en vLLM con 13 prompts, que observa el presupuesto de tokens de reflexión:

| Prompt | tokens de reflexión |
|---|---|
| `你好` | 27 |
| `法国的首都是哪座城市?` | 28 |
| `1+1等于几?` | 43 |
| `2 的 3 次方是多少?只要答案,不要解释.` | 50 (respuesta: `8`) |
| Problema de congruencia CRT | 356 |
| Puzzle de ranking de 5 personas | 573 |
| Valor exacto de `sin20°·sin40°·sin80°` | 1022 |

La prueba indica que el presupuesto de reflexión está bien calibrado y no se observa spam de ` thinking` en entradas triviales.

## Requisitos de hardware

- VRAM estimada para inferencia: 51,7 GB en BF16, por lo que se recomienda una GPU con al menos 80 GB de VRAM para inferencia completa sin cuantización.
- GPU recomendadas: NVIDIA A100-80GB (usada en la prueba de humo), H100 80GB o A100 80GB. En consumer GPUs no cabe completa en BF16; con cuantización (por ejemplo, GGUF de 4 bits) podría caber en una RTX 4090 (24 GB), pero no se proporcionan datos de cuantización.
- Opciones de despliegue: vLLM (verificado), Hugging Face transformers, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no disponibles en el repositorio).
- Latencia y throughput: no disponible. La prueba de humo en A100-80GB con 13 prompts no reporta métricas de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.6-27B (base) | 27,8B | no disponible | Apache 2.0 | VLM denso, atención híbrida |
| Qwen3.6-27B-Della-Deckard-v1 | 27,8B | no disponible | Apache 2.0 | Fusión de pesos sobre Qwen3.6-27B |
| Qwen3.5-27B-Engineer-Deckard-Gemini | 27B | no disponible | Apache 2.0 | Fine-tune de Qwen3.5-27B para ingeniería |

El modelo se distingue por su método de fusión (DELLA + vector de tarea) y por la justificación cuantitativa de los coeficientes. Frente al base, añade razonamiento destilado y capacidades de código; frente al fine-tune de 3.5, hereda la base 3.6 más reciente. No hay comparativas de rendimiento directas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos específicos; como modelo derivado de Qwen, puede heredar los sesgos de su base y de los destilados.
- Riesgo de alucinación: no se ha evaluado específicamente, aunque la calibración del presupuesto de reflexión reduce la generación de razonamientos espurios en entradas triviales.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; se recomienda consultar el modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- Caveat para producción: al ser un modelo de fusión sin fine-tuning adicional, el comportamiento en dominios muy específicos puede ser menos estable que un modelo entrenado a propósito. Se recomienda validar en el caso de uso concreto.
- La torre de visión se copia sin cambios; cualquier degradación de la visión en el base se hereda directamente.
- El vector de tarea entre generaciones se ha calculado con una distancia de 0,32 de norma relativa; λ₂ se ha mantenido bajo (0,15) para evitar salir de la cuenca de pérdida, pero el riesgo de degradación en tareas de código no es nulo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-v1)
- [Perfil del autor en Hugging Face](https://huggingface.co/YFC-112358)
- [Repositorio de Qwen3.6 en GitHub](https://github.com/QwenLM/Qwen3.6)
- [Página del modelo Qwen3.6-27B en QwenCloud](https://www.qwencloud.com/models/qwen3.6-27b)
- [Variante posterior del autor: Isometry-Geodesic-v2](https://huggingface.co/YFC-112358/Qwen3.6-27B-Della-Deckard-Isometry-Geodesic-v2)
