# turintech/Qwen3.5-0.8B-weight-space-programming-Artemis

## Resumen

Qwen3.5-0.8B-weight-space-programming-Artemis es una cuantización GGUF Q4_K_M del checkpoint editado por ML-Intern-lab sobre Qwen3.5 0.8B, publicada por TurinTech dentro de su familia de modelos comprimidos con su herramienta Artemis. El modelo base es un ajuste fino orientado a matemáticas paso a paso y razonamiento textual, sin capacidades multimodales, y esta versión lo empaqueta en un único fichero de 0,532 GB listo para llama.cpp y Ollama.

El interés práctico reside en la relación entre tamaño y rendimiento: con menos de 800 millones de parámetros totales (752.393.024 según los pesos en safetensors del modelo base) y una cuantización de 4 bits, conserva el 45,20 % de precisión en MATH-500 frente al 46,95 % del BF16 editado, es decir, una pérdida de apenas 1,75 puntos porcentuales. El autor reporta además 260 aciertos de 400 en BFCL simple Python, prácticamente idéntico a los 261 del BF16, lo que sugiere que la compresión no degrada de forma apreciable el uso de herramientas sencillas.

La relevancia actual es doble: por un lado, demuestra que la compresión agresiva de modelos pequeños de razonamiento es viable sin colapso de capacidades; por otro, ofrece un modelo de matemáticas y razonamiento ejecutable en CPU y en GPUs de consumo, con licencia Apache 2.0, lo que facilita su integración en entornos con recursos limitados o en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 752.393.024 (modelo base en safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 34.816 tokens en la configuración recomendada de llama-server (`-c 34816`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada en el repo); se menciona BF16 como referencia del modelo base |
| Idiomas soportados | inglés (etiqueta `en` en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.5 y de su naturaleza decoder-only para generación de texto. El checkpoint original, ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming, es un ajuste fino del Qwen3.5 0.8B orientado a matemáticas paso a paso y razonamiento textual, presumiblemente mediante entrenamiento supervisado o preferencias, aunque la model card no especifica el dataset, el número de tokens ni si se empleó RLHF o DPO.

La innovación técnica de esta publicación no está en el entrenamiento sino en la compresión: TurinTech aplica su pipeline Artemis, que incluye el uso de matrices de importancia (`imatrix` en las etiquetas) para guiar la cuantización a 4 bits. El resultado es un fichero Q4_K_M de 0,532 GB que conserva el comportamiento del BF16 de 1,517 GB. La model card documenta que las mediciones se realizaron con builds de llama.cpp etiquetadas como b11617, con `--no-context-shift` para evitar que se descarte el inicio del contexto cuando la respuesta agota la ventana, y con el modo thinking activado mediante `chat_template_kwargs`.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con llama.cpp (`--jinja`) y Ollama.
- Razonamiento matemático paso a paso, con modo thinking activable por petición (`enable_thinking` en llama.cpp, `think` en la API de Ollama, `--think=true` en CLI).
- Respuestas extensas: el modelo puede generar hasta 32.768 tokens, aunque el autor advierte que el 40,55 % de las generaciones en MATH-500 agotaron ese límite.
- Tool calling / function calling básico: se reporta un resultado de 260 de 400 en BFCL simple Python, lo que indica soporte funcional para llamadas a herramientas sencillas, no para escenarios complejos.
- Formato de respuesta matemática con `\boxed{}` cuando se le indica en el prompt.
- Capacidades multimodales: no disponibles (el modelo es explícitamente "text only").
- Soporte multilingüe: limitado al inglés según la etiqueta de idioma; no se declaran otros idiomas.
- Despliegue en CPU y GPU mediante llama.cpp y Ollama; compatible con endpoints (`endpoints_compatible`).

## Casos de uso

- Resolución de problemas matemáticos en local: el modelo puede resolver problemas de competición estilo MATH con razonamiento explícito, adecuado para entornos sin GPU o con GPUs de gama baja gracias a su fichero de 0,532 GB y su ejecución verificada en CPU (AMD Ryzen 9 5900X).
- Tutor educativo de matemáticas: con el modo thinking activado y la instrucción de incluir la respuesta en `\boxed{}`, puede generar explicaciones paso a paso para estudiantes, aunque conviene limitar `max_tokens` para evitar respuestas que agoten el presupuesto.
- Asistente de razonamiento integrado en aplicaciones de escritorio: al caber en menos de 1 GB de disco y ejecutarse con Ollama, es viable empaquetarlo en herramientas locales de ayuda al estudio o a la resolución de ejercicios.
- Prototipado de agentes con tool calling simple: los 260/400 en BFCL simple Python lo hacen utilizable para agentes que invocan funciones sencillas (calculadoras, conversores, APIs de consulta) en pipelines de bajo coste, no para orquestaciones complejas.
- Evaluación de pipelines de cuantización: sirve como caso de referencia para comparar el impacto de Artemis Q4_K_M frente al BF16 en tareas de matemáticas y tool calling, con métricas reproducibles sobre MATH-500 y BFCL.
- Generación de cadenas de razonamiento para destilación o anotación: sus trazas de pensamiento largas pueden usarse para generar datos de razonamiento que luego se filtren, teniendo en cuenta que una fracción importante de las generaciones se trunca en 32.768 tokens.
- Despliegue en entornos con restricciones de memoria: con `-ngl 99` puede descargar todas las capas a GPU en tarjetas de 4-6 GB, o ejecutarse íntegramente en CPU con llama-server para servicios de baja concurrencia.

## Benchmarks y rendimiento

| Benchmark | TurinTech Q4_K_M | ML-Intern-lab BF16 editado | Notas |
|---|---|---|---|
| MATH-500 (accuracy, thinking on) | 45,20 % | 46,95 % | 500 problemas × 4 muestras, hasta 32.768 tokens generados |
| MATH-500 (generaciones que agotan el límite) | 40,55 % | 40,55 % | Mismo porcentaje en ambas versiones |
| BFCL simple Python (aciertos de 400) | 260 | 261 | Diferencia de 1 acierto |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible. Los datos de MATH-500 y BFCL proceden de la model card del autor y están marcados como no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 0,532 GB; con overhead de contexto y caché KV para 34.816 tokens, se recomienda al menos 2-4 GB de VRAM si se descargan todas las capas a GPU.
- GPU recomendadas: cualquier GPU con 4 GB o más (RTX 3050, RTX 4060, RTX 4090, A100, H100); el modelo es lo bastante pequeño para no requerir hardware de datacenter.
- Cabe en GPU de consumo: sí, en todas las GPU consumer modernas con 4 GB o más; también puede ejecutarse íntegramente en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `-hf` o fichero local, builds con soporte Qwen3.5, probado con b11617), Ollama (`ollama run turintech/qwen3.5-0.8b-weight-space-programming-artemis`), y endpoints compatibles con la API de chat completions.
- Latencia y throughput: en la prueba del autor en CPU AMD Ryzen 9 5900X, una respuesta de 23.855 tokens tardó 14 minutos (aproximadamente 28 tokens/s en esa CPU); no se reportan cifras en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming-Artemis (Q4_K_M) | 752 M | 34.816 (config. recomendada) | 45,20 % | Apache 2.0 | GGUF |
| ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming (BF16) | 752 M | no disponible | 46,95 % | Apache 2.0 | safetensors / GGUF |
| Qwen3.5 0.8B (base original) | 0,8 B | no disponible | no disponible | Apache 2.0 (según el modelo base) | safetensors |

No se dispone de datos de benchmarks de otras alternativas comparables en la información proporcionada, por lo que no se incluyen modelos adicionales de la misma categoría.

## Limitaciones y advertencias

- El modelo está orientado exclusivamente a texto; no procesa imágenes, audio ni vídeo.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está documentado y previsiblemente será inferior.
- Alto riesgo de respuestas excesivamente largas: el 40,55 % de las generaciones en MATH-500 agotaron el límite de 32.768 tokens, con trazas de pensamiento que repiten cálculos; en producción conviene acotar `max_tokens` y aplicar penalizaciones de presencia.
- Riesgo de alucinación inherente a modelos de 0,8 B: la precisión en MATH-500 es del 45,20 %, insuficiente para aplicaciones que requieran exactitud matemática alta sin verificación posterior.
- El soporte de tool calling es básico (260/400 en BFCL simple Python); no es adecuado para orquestación de agentes complejos ni para esquemas de funciones elaborados.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y del checkpoint editado por ML-Intern-lab, enlazada en la model card.
- El uso de `--no-context-shift` implica que, al llenarse el contexto, la generación se detiene en lugar de descartar el inicio; hay que dimensionar `-c` en consecuencia.
- Requiere builds de llama.cpp con soporte para Qwen3.5 (probado con b11617) y HTTPS para el modo `-hf`; versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Qwen3.5-0.8B-weight-space-programming-Artemis
- Modelo base: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming
- Licencia del modelo base: https://huggingface.co/ML-Intern-lab/Qwen3.5-0.8B-weight-space-programming/blob/f4a5dd43dae4a5e42b441a31d692570751b3d92c/LICENSE
- Página de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Paquete en Ollama: https://ollama.com/turintech/qwen3.5-0.8b-weight-space-programming-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
