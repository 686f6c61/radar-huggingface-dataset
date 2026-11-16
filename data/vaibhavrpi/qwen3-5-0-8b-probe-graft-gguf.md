# vaibhavrpi/Qwen3.5-0.8B-probe-graft-GGUF

## Resumen

Qwen3.5-0.8B-probe-graft-GGUF es un artefacto de investigación publicado por el usuario vaibhavrpi sobre el modelo base Qwen/Qwen3.5-0.8B de Alibaba Qwen. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una edición de pesos (weight editing) que modifica únicamente tres filas de la matriz de salida (output head), correspondientes a los tokens `</think>`, `Wait` y ` Wait`, para intentar corregir el comportamiento de bucle en el razonamiento extendido del modelo. El resto de los 299 tensores originales permanece byte a byte idéntico.

El modelo tiene 1.027.125.568 parámetros totales (aproximadamente 1,03 mil millones) y se distribuye en formato GGUF BF16 de unos 2,07 GB. La edición desata (unties) la matriz de embedding compartida con la cabeza de salida, lo que añade unos 0,51 GB respecto al GGUF base sin alterar el coste computacional del transformer. El contexto máximo declarado en el ejemplo de despliegue es de 278.528 tokens.

Su relevancia es metodológica más que práctica: demuestra una técnica de "probe graft" que pliega sondas lineales entrenadas sobre estados internos directamente en filas del output head, de modo que la inferencia no requiere callback de sonda ni forward pass adicional. El propio autor advierte de un fallo conocido sustancial: en MATH-500 obtiene 276/500 (55,2%), pero 165 respuestas alcanzan los 32.768 tokens y se generan 1.348.952 etiquetas `</think>` extra en 407 respuestas. No es un reemplazo robusto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), con output head desatada y tres filas editadas |
| Parametros totales | 1.027.125.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 278.528 tokens (configuracion de ejemplo en llama-server) |
| Tipos de cuantizacion | BF16 (GGUF); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (BF16), archivo `Qwen3.5-0.8B-BF16-probe-graft.gguf` de ~2,07 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.5-0.8B original: un transformer decoder-only de aproximadamente 1,03 mil millones de parámetros. La intervención no reentrena el modelo ni modifica los 299 tensores originales; en su lugar, desata la matriz de embedding compartida de la cabeza de salida y sustituye tres filas de esa cabeza. La fila de stop (`</think>`) recibe 12 veces la sonda de re-verificación más 24 veces una sonda de frontera de bucle; las dos filas `Wait` reciben menos 4 veces una sonda de bucle sobre todos los tokens. Las sondas se ajustaron con 80 problemas de entrenamiento de MATH y 16 preguntas separadas para seleccionar las intensidades candidatas; ningún ejemplo de MATH-500, GSM8K-test ni IFEval entra en el ajuste.

El procedimiento se basa en la revisión `2fc06364715b967f1860aea9cf38778875588b17` del modelo base en Hugging Face. Las etiquetas de las sondas son heurísticas: el modelo no dispone de un detector garantizado de "respuesta resuelta", y no hay una compuerta de fase dura, lo que explica que puedan aparecer etiquetas de cierre no deseadas. La evaluación se realizó con temperatura 0,6, top-p 0,95, top-k 20, min-p 0, presence penalty 1,5, frequency 0, repetition 1,0, 32.768 tokens de salida y semilla 0, con el orden explícito penalizaciones → top-k → top-p → temperatura. El entorno registrado es una RTX 4060 Laptop de 8 GB, Ubuntu 26.04, CUDA 13.2.78, driver 595.71.05 y llama.cpp en el commit `3549c274dc22001d9118713fa56a10085b85de3b` con un parche de presence penalty disperso aritméticamente idéntico.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento con modo "thinking" extendido: el modelo emite trazas de razonamiento delimitadas por etiquetas `</think>`.
- Razonamiento matemático: evaluado en MATH-500 con una precisión de 276/500 (55,2%).
- Edición de pesos orientada a modificar el comportamiento de parada y de bucle en el razonamiento, sin callback de sonda en inferencia.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline conversacional.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación sobre edición de pesos y control de bucles en modelos de razonamiento: sirve como artefacto reproducible para estudiar cómo sondas lineales plegadas en el output head afectan a la parada y a la longitud de las trazas, con código, sondas y resultados crudos publicados.
- Estudio de métodos de parada guiada por sonda (probe-guided stopping): permite comparar empíricamente esta técnica frente a supresión de tokens o edición de capas feed-forward en un modelo pequeño y desplegable en local.
- Reproducción de experimentos en hardware de consumo: con ~2,07 GB en BF16 cabe en una GPU de 8 GB como la RTX 4060 Laptop usada por el autor, lo que facilita réplicas académicas de bajo coste.
- Auditoría de fallos de generación: el conjunto de trazas publicadas con 1.348.952 etiquetas `</think>` extra y 165 respuestas que agotan 32.768 tokens constituye un corpus útil para analizar modos de fallo de modelos con razonamiento extendido.
- Docencia y divulgación técnica: ejemplo concreto de cómo una intervención de tres filas en una matriz de salida altera el comportamiento global de un LLM, útil para explicar interpretabilidad y edición de modelos.
- Evaluación de pipelines de inferencia en llama.cpp: el comando de ejemplo con `-ngl 99 -fa on -c 278528 -np 8 -b 256 -ub 256 --jinja` sirve para validar configuraciones de servidor con contexto largo y Flash Attention en llama-server.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Referencia RikiyaT (índice global más fuerte) | Original sin editar (muestra 0) |
|---|---:|---:|---:|
| MATH-500 (una respuesta seleccionada por problema) | 55,2% (276/500) | 52,2% | 7,0% |

Notas del autor: las cifras provienen de motores y ejecuciones distintas, por lo que no constituyen una comparación causal controlada. La diferencia de 3 puntos tiene un intervalo de confianza bootstrap pareado del 95% de [-0,4; 6,4] puntos y un McNemar descriptivo con p=0,110, lo que no establece superioridad ni equivalencia. La longitud media total de salida es de 15.828,59 tokens sobre 500 problemas; en 20 textos publicados compartidos, 15.340,15 frente a aproximadamente 21.638,15 tokens de referencia retokenizados (-29,1%), comparación limitada a 20 prompts. En una verificación fresca de 16 problemas de entrenamiento, este candidato obtuvo 8/16 frente a 9/16 del graft anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,07 GB de pesos en BF16 más overhead de contexto; con contexto de 278.528 tokens y caché KV, el consumo crece de forma significativa y puede superar ampliamente los 8 GB según la configuración.
- GPU recomendadas: el autor validó en una RTX 4060 Laptop de 8 GB; para contexto completo de 278.528 tokens se recomiendan GPU con 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en BF16 con contexto moderado en tarjetas de 8 GB o más; con contexto máximo conviene reducir `-c` o usar cuantizaciones menores no documentadas en la información disponible.
- Opciones de despliegue: llama.cpp / llama-server (comando de ejemplo del autor), y por formato GGUF es compatible con Ollama y otros runners basados en llama.cpp; vLLM y TGI no están documentados para este artefacto.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-probe-graft (este) | 1,03 B | 278.528 (ejemplo) | 55,2% (276/500) | apache-2.0 | GGUF en HF |
| Qwen3.5-0.8B (base sin editar) | 1,03 B | no disponible | 7,0% (muestra 0) | apache-2.0 (según base) | HF |
| RikiyaT (modelo editado de referencia) | no disponible | no disponible | 52,2% | no disponible | no disponible |

La comparación con el modelo base y con la referencia RikiyaT procede de ejecuciones no controladas según el propio autor, por lo que debe interpretarse como descriptiva. No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Fallo conocido sustancial: 165 respuestas de 500 alcanzan los 32.768 tokens y 163 de ellas ya habían cerrado el thinking y continuaban en la respuesta; se generan 1.348.952 etiquetas `</think>` extra en 407 respuestas.
- No es un reemplazo robusto del modelo base ni una solución fiable a los bucles de razonamiento; el autor lo describe explícitamente como artefacto de investigación.
- Las etiquetas de las sondas son heurísticas y no existe un detector garantizado de "respuesta resuelta"; la ausencia de compuerta de fase dura permite etiquetas de cierre no deseadas.
- La comparación de rendimiento con la referencia RikiyaT no es causal ni controlada: motores y ejecuciones distintos, IC del 95% que cruza cero y p=0,110.
- El conjunto de desarrollo de 16 preguntas se reutiliza repetidamente y no es un test independiente; en una verificación fresca de 16 el candidato rinde peor que el graft anterior (8/16 frente a 9/16).
- Idiomas: solo inglés declarado; no se documenta soporte multilingüe.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo base es de 0,8 B, con capacidad limitada en tareas de conocimiento factual.
- Licencia apache-2.0: permite uso comercial, pero el artefacto es experimental y no apto para producción sin validación propia.
- Las semillas idénticas entre motores no garantizan muestras idénticas, lo que complica la reproducibilidad exacta.
- Descargas y likes en Hugging Face: 0 en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaibhavrpi/Qwen3.5-0.8B-probe-graft-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Post 2 del autor: https://probe-graft.vercel.app/2/
- Código, salidas crudas de MATH y receta de ajuste: https://github.com/nextgen-user/think-graft/tree/main/qwen08
- Post anterior 4B/DeepSeek: https://think-graft.vercel.app/
