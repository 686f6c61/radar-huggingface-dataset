# Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed

## Resumen

MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed es una cuantización de 6 bits del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario Youssofal para su uso con MTPLX, un runtime de inferencia local para Apple Silicon basado en MLX. El modelo base es un fine-tune de Xiaomi sobre Qwen 3.5 9B (Apache 2.0), reentrenado para tareas de programación, trabajo agéntico, codificación visual y seguridad. Esta versión empaqueta los pesos en safetensors con grupos de 64 pesos y añade decodificación especulativa nativa mediante la cabeza de predicción multi-token (MTP) del propio modelo.

La propuesta de valor es ejecutar un modelo de 9 409 812 208 parámetros en Macs con 16 GB o más de memoria unificada, con una ventana de contexto que escala según la RAM disponible: 20 480 tokens en 16 GB, 45 056 en 18 GB, 192 512 en 24 GB y hasta 262 144 tokens en configuraciones superiores. El pack ocupa 8,7 GB y requiere MTPLX 2.12.0 o posterior.

Es relevante porque combina tres piezas poco habituales en el ecosistema local: un distill agéntico de Xiaomi con mejoras notables frente a Qwen 3.5 9B en benchmarks de ingeniería de software, una cuantización de 6 bits con pérdida declarada mínima (97,3 % de acuerdo top-1 y KL de 0,0054 frente al modelo completo) y decodificación especulativa exacta a cualquier temperatura mediante la regla de aceptación por ratio de probabilidad con remuestreo residual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen 3.5 9B) con cabeza de predicción multi-token para decodificación especulativa; runtime MLX |
| Parametros totales | 9 409 812 208 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 20 480 tokens en 16 GB; 45 056 en 18 GB; 192 512 en 24 GB; hasta 262 144 |
| Tipos de cuantizacion | 6 bits con grupos de 64 pesos |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `mtplx_runtime.json` como contrato de serving |

## Arquitectura y entrenamiento

El modelo base es un transformer denso derivado de Qwen 3.5 9B, que Xiaomi reentrenó para tareas de código y agentes. Sobre esa base, esta publicación aplica una cuantización de 6 bits con grupos de 64 pesos, la misma receta empleada en el pack Qwen 3.5 9B Optimized Speed del mismo autor, y conserva la cabeza de predicción multi-token (MTP) de Qwen 3.5 9B. El runtime MTPLX usa esa cabeza para generar borradores que el modelo completo verifica en una sola pasada, con profundidad MTP de 2.

La decodificación especulativa se implementa con la regla de aceptación por ratio de probabilidad más remuestreo residual, lo que garantiza que la salida siga la distribución propia del modelo a cualquier temperatura, no solo a temperatura cero. La cuantización declara un 97,3 % de acuerdo top-1 y una divergencia KL de 0,0054 respecto al modelo en precisión completa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 262 144 tokens en configuraciones de memoria alta).
- Programación y tareas de ingeniería de software: resolución de issues, parcheo de repositorios y trabajo en terminal.
- Razonamiento agéntico multi-paso con uso de herramientas y function calling, orientado a clientes como OpenCode y Claude Code.
- Codificación visual: el pipeline es `image-text-to-text`, por lo que acepta entradas de imagen junto con texto.
- Tareas de seguridad, según la descripción del fine-tune de Xiaomi.
- Decodificación especulativa exacta a cualquier temperatura mediante MTP con profundidad 2.
- Ejecución local en Apple Silicon sin dependencia de servicios en la nube.

## Casos de uso

- Asistencia de programación en local: el modelo puede resolver tareas de parcheo sobre repositorios reales con un rendimiento declarado de 44,6 en SWE Pro, lo que lo hace adecuado para un asistente de código que opera directamente sobre el árbol de trabajo en un MacBook.
- Agentes de terminal: con 37,1 en Terminal Bench 2.1, puede encadenar comandos, interpretar salidas y corregir errores en sesiones de shell automatizadas dentro de un flujo de CI local.
- Orquestación de herramientas: con 35,2 en Toolathlon-Verified, es viable como planificador en pipelines agénticos que invocan APIs, editores o scripts, usando function calling para estructurar las llamadas.
- Revisión de código asistida por capturas: al aceptar entradas de imagen y texto, puede analizar diagramas, capturas de errores o mockups junto con el código para generar parches o explicaciones.
- Desarrollo en portátiles con memoria limitada: con 16 GB de RAM unificada y 20 480 tokens de contexto, sirve para sesiones de refactorización de archivos individuales sin GPU dedicada.
- Integración con clientes agénticos de escritorio: el pack está pensado para OpenCode y Claude Code, con 18 GB o más de memoria recomendados para estos clientes, lo que permite sustituir el backend remoto por inferencia local.
- Prototipado de agentes de seguridad: las capacidades declaradas en tareas de seguridad permiten usarlo en análisis estático asistido y triaje de hallazgos dentro de un entorno local aislado.

## Benchmarks y rendimiento

Resultados declarados por Xiaomi en la model card del modelo base, comparando el fine-tune con Qwen 3.5 9B:

| Benchmark | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B |
|---|---:|---:|
| SWE Pro | 32,0 | 44,6 |
| Terminal Bench 2.1 | 27,0 | 37,1 |
| Toolathlon-Verified | 25,9 | 35,2 |
| SWE Verified | 60,0 | 61,1 |

No se han publicado en la información disponible resultados de benchmarks para esta cuantización de 6 bits concreta, ni métricas de latencia o throughput medidas de forma independiente.

## Requisitos de hardware

- Memoria unificada mínima: 16 GB para el modelo; 18 GB o más recomendados si se usan clientes agénticos como OpenCode.
- Pico de memoria durante el serving: 8,7 GiB con contexto de 15 000 tokens.
- Tamaño de descarga: 8,7 GB.
- Hardware objetivo: Apple Silicon (M3, M4, M5, incluidos M5 Max), MacBook Air, MacBook Pro y Mac Mini. No hay soporte declarado para GPU NVIDIA o AMD.
- Contexto según memoria: 20 480 tokens en 16 GB, 45 056 en 18 GB, 192 512 en 24 GB, hasta 262 144.
- Despliegue: MTPLX 2.12.0 o posterior, mediante la aplicación de Mac o por línea de comandos con `pip install mtplx` y `mtplx serve --model Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed`.
- No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI; el formato es MLX y el runtime específico es MTPLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed | 9,41 B | Hasta 262 144 (según RAM) | SWE Pro 44,6; Terminal Bench 2.1 37,1 (modelo base) | MIT | Hugging Face, runtime MTPLX |
| Qwen3.5-9B | 9 B (aprox.) | No disponible en la información | SWE Pro 32,0; Terminal Bench 2.1 27,0 | Apache 2.0 | Hugging Face |
| Qwen3.5-9B-MTPLX-Optimized-Speed | 9 B (aprox.) | No disponible en la información | No disponible | No disponible | Hugging Face, runtime MTPLX |
| Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed | 27 B (clase) | No disponible en la información | No disponible | No disponible | Hugging Face, runtime MTPLX |

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con el runtime MTPLX; no es portable a otras plataformas ni a otros motores de inferencia sin reconversión.
- La cuantización de 6 bits introduce una pérdida declarada del 2,7 % en acuerdo top-1 respecto al modelo completo; en tareas de código de alta precisión esto puede traducirse en errores sutiles.
- El contexto máximo depende de la memoria unificada disponible; en equipos de 16 GB el límite práctico es de 20 480 tokens.
- No se dispone de información sobre idiomas soportados; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos de 9 B en tareas agénticas de varios pasos, especialmente cuando se encadenan herramientas sin verificación externa.
- Los benchmarks proceden de la model card de Xiaomi y corresponden al modelo base, no a esta cuantización; no hay validación independiente publicada.
- Aunque la licencia es MIT, el modelo base deriva de Qwen 3.5 9B (Apache 2.0); conviene revisar las condiciones de ambas licencias antes de un uso comercial.
- El número de descargas (924) y de likes (9) es bajo, por lo que la validación comunitaria es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Runtime MTPLX: https://mtplx.com
- Pack hermano Qwen 3.5 9B: https://huggingface.co/Youssofal/Qwen3.5-9B-MTPLX-Optimized-Speed
- Pack hermano Bonsai 2 27B: https://huggingface.co/Youssofal/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed
