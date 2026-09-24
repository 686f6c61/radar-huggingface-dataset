# Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed

## Resumen

Este repositorio es un empaquetado comunitario del modelo MiMo-V2.6-Distill-Qwen-9B de Xiaomi, preparado por el usuario Youssofal para el runtime MTPLX sobre Apple Silicon. No se trata de un modelo entrenado desde cero: Xiaomi partió de Qwen3.5-9B de Alibaba Cloud y lo sometió a un ajuste fino supervisado (SFT) con datos generados por MiMo orientados a código, tareas de agente, codificación visual y ciberseguridad. Este pack conserva esa arquitectura y esos pesos, pero los convierte a cuantización afín de 6 bits con grupos de 64 pesos y le adjunta una cabeza de predicción multi-token (MTP) para decodificación especulativa.

El resultado es un modelo denso de 9.409.812.208 parámetros (9,41B) con una ventana de contexto de 262.144 tokens, licencia MIT y un peso de descarga de 8,7 GB. La innovación del pack no está en los pesos, sino en el formato: MTPLX usa la cabeza MTP para proponer varios tokens por adelantado y verificarlos en una sola pasada, con aceptación por regla de cociente de probabilidad más remuestreo residual, de modo que la especulación es exacta a cualquier temperatura: un borrador rechazado cuesta tiempo, nunca calidad. Está pensado para ejecutarse en Macs con 16 GB de memoria unificada o más, con MTPLX 2.12.0 o superior.

Su relevancia ahora es doble. Por un lado, ofrece cifras de agente y código claramente superiores a las del Qwen3.5-9B original según los datos de Xiaomi (SWE Pro de 32,0 a 44,6; Terminal Bench 2.1 de 27,0 a 37,1). Por otro, demuestra que es viable servir un modelo de casi 9.500 millones de parámetros con contexto de 262.144 tokens en hardware de consumo Apple, con una divergencia KL de 0,0054 y un 97,3 % de acuerdo top-1 frente al checkpoint BF16 original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) con cabeza de predicción multi-token (MTP) para decodificación especulativa; incluye torre de visión |
| Parámetros totales | 9.409.812.208 (9,41B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 6 bits afín con grupos de 64 pesos (pesos del LM); BF16 sin cuantizar para la torre de visión y la cabeza MTP |
| Idiomas soportados | no disponible (el pack no declara idiomas; hereda los del modelo base, sin detallar) |
| Licencia | MIT |
| Formato de pesos | safetensors (2 shards para el LM), más `model-vision.safetensors` y `mtp.safetensors` en BF16 |
| Librería / runtime | mtplx (MTPLX 2.12.0 o superior) |
| Modelo base | XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (relación: quantized) |
| Revisión del checkpoint de origen | 2367e865 |
| Tamaño del repositorio | 8,7 GB |
| Memoria unificada máxima medida | 8,70 GiB con contexto de 15.000 tokens |
| Profundidad MTP | 2 por defecto, hasta 3 |
| Parámetros de muestreo por defecto | temperatura 0,6; top-p 0,95; top-k 20 |
| Modo de razonamiento | activado por defecto, con etiquetas think de Qwen; sin niveles de esfuerzo de razonamiento |
| Fecha de creación | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La base es Qwen3.5-9B, un transformer denso de Alibaba Cloud, sobre el que Xiaomi aplicó un ajuste fino supervisado con datos generados por MiMo para cuatro dominios declarados: código, tareas de agente, codificación visual y ciberseguridad. El modelo card de Xiaomi es la fuente de la descripción del dataset y de la evaluación; este repositorio no añade entrenamiento propio. No se documenta en la información disponible el uso de RLHF o DPO, ni el número exacto de tokens de entrenamiento. La torre de visión de Xiaomi se conserva sin cuantizar en BF16 dentro del pack.

La contribución técnica del pack es la capa de decodificación especulativa. Como el checkpoint de Xiaomi no incluye cabeza MTP, Youssofal adjunta la de Qwen3.5-9B (idéntica byte a byte a la de su pack Qwen 3.5 9B Optimized Speed), entrenada sobre el modelo base y no sobre el fine-tune. El coste es una tasa de aceptación menor: en un prompt largo de juego en un solo archivo y con el modo thinking activado, los borradores a profundidad 2 se aceptaron el 78,5 % de las veces en la primera posición y el 56,5 % en la segunda. La cuantización a 6 bits afín con grupos de 64 pesos se midió contra el checkpoint BF16 con teacher forcing sobre 19.265 tokens de código y prosa: divergencia KL de 0,0054 y 97,3 % de acuerdo top-1, diez veces más cerca del original que una construcción mixta de 4 bits del mismo modelo.

## Capacidades

- Generación de texto y conversación multi-turno con ventana de hasta 262.144 tokens.
- Razonamiento con modo thinking activado por defecto mediante las etiquetas think de Qwen.
- Generación y edición de código, con especial refuerzo en tareas de ingeniería de software real (SWE Verified, SWE Pro) y uso de terminal (Terminal Bench 2.1).
- Tareas de agente y razonamiento multi-paso, con entrenamiento específico en flujos agénticos (Toolathlon-Verified).
- Uso de herramientas: el pack se sirve con API compatible con OpenAI y Anthropic, de modo que clientes como OpenCode, Pi, Claude Code o Cline pueden invocarlo con function calling.
- Codificación visual: el pack incluye la torre de visión del checkpoint de Xiaomi en BF16, aunque el model card no detalla el soporte de entrada de imágenes en el runtime MTPLX.
- Ciberseguridad, uno de los dominios declarados de los datos de ajuste.
- Capacidades multilingües: no disponible (no se declaran idiomas en la ficha).
- Decodificación especulativa exacta con profundidad MTP configurable de 2 (por defecto) o 3.

## Casos de uso

- Agente de codificación en local: sirviendo el modelo con `mtplx serve` y apuntando OpenCode o Claude Code a `http://127.0.0.1:8000`, se obtiene un asistente de edición de repositorio que no envía código a la nube. Es adecuado porque el fine-tune de Xiaomi sube SWE Pro de 32,0 a 44,6 y Terminal Bench 2.1 de 27,0 a 37,1 frente al Qwen3.5-9B original.
- Automatización de tareas de terminal: el modelo está entrenado explícitamente para Terminal Bench, así que puede generar secuencias de comandos, interpretar salidas y corregir errores en un bucle agéntico dentro de un Mac de 18 GB o más.
- Atención al cliente multi-turno: con 262.144 tokens de contexto teórico (192.512 tokens en un Mac de 24 GB), permite mantener historiales de conversación muy largos sin truncar, aunque conviene recordar que en 16 GB la ventana útil baja a 20.480 tokens.
- Revisión de seguridad de código: dado el entrenamiento en ciberseguridad, puede usarse para auditar fragmentos, señalar patrones de riesgo y proponer parches, siempre con revisión humana dado el riesgo de alucinación.
- Asistente de programación en movilidad: al ejecutarse en MacBook Air o Mac mini con M3, M4 o M5 y 16 GB, permite trabajar sin conexión en entornos con conectividad limitada o requisitos de confidencialidad.
- Generación de documentación y prosa técnica: el pack declara fidelidad medida sobre código y prosa, con 97,3 % de acuerdo top-1 respecto al BF16, por lo que es apto para redactar documentación a partir de código fuente.
- Prototipado de pipelines agénticos: sirve como backend local compatible con la API de OpenAI para probar orquestadores multi-paso sin coste por token ni límites de proveedor.
- Procesamiento de contextos largos en un solo equipo: la ventana escalonada por memoria (20.480 / 45.056 / 192.512 tokens según 16, 18 o 24 GB) permite elegir el Mac en función del tamaño de los documentos a procesar.

## Benchmarks y rendimiento

Los datos siguientes proceden del model card de Xiaomi para el fine-tune en BF16 (informe técnico MiMo-V2.6), no de este pack de 6 bits. Este repositorio no publica todavía cifras propias de tok/s; el autor indica que se publicarán con MTPLX 2.12.0.

| Benchmark | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B |
|---|---:|---:|
| SWE Verified | 60,0 | 61,1 |
| SWE Pro | 32,0 | 44,6 |
| Terminal Bench 2.1 | 27,0 | 37,1 |
| Toolathlon-Verified | 25,9 | 35,2 |

Métricas de fidelidad de esta cuantización, medidas por el autor sobre 19.265 tokens de código y prosa (22 de septiembre de 2026):

| Métrica | Valor |
|---|---|
| Divergencia KL frente al checkpoint BF16 | 0,0054 |
| Acuerdo top-1 | 97,3 % |
| Aceptación de borradores a profundidad 2, primera posición | 78,5 % |
| Aceptación de borradores a profundidad 2, segunda posición | 56,5 % |
| Memoria unificada máxima medida (contexto de 15.000 tokens) | 8,70 GiB |

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (MLX) con macOS. El pack no está pensado para CUDA ni para GPU de NVIDIA o AMD.
- Memoria unificada mínima: 16 GB. Ventanas de contexto planificadas por MTPLX 2.12.0: 20.480 tokens con 16 GB, 45.056 tokens con 18 GB y 192.512 tokens con 24 GB.
- Contexto de agente: un cliente como OpenCode, cuyo prompt de sistema ronda los 18.700 tokens, requiere 18 GB o más.
- Chips recomendados: M3, M4 y M5; la aplicación de MTPLX sugiere este modelo en Macs con 16 a 31 GB de memoria, justo después de Bonsai 2 27B.
- Memoria en uso: 8,70 GiB medidos con contexto de 15.000 tokens, además del espacio para caché KV y el resto del sistema.
- Opciones de despliegue: aplicación de escritorio de MTPLX (2.12.0 o superior) o línea de comandos con `pip install mtplx` y `mtplx serve --model Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed`. El identificador servido es `mtplx-mimo-v26-qwen-9b-optimized-speed`, sobre API compatible con OpenAI y Anthropic.
- No compatible con vLLM, llama.cpp, Ollama ni TGI: el formato es específico del runtime MTPLX (cuantización MLX de 6 bits más cabeza MTP).
- Latencia y throughput: no disponible. El autor afirma que cada pasada forward cuesta lo mismo que la del pack Qwen 3.5 9B Optimized Speed, por compartir arquitectura y tamaño, y que publicará tok/s con MTPLX 2.12.0.
- Advertencia de versión: con MTPLX anterior a 2.12.0 el modelo se carga con los parámetros de la arquitectura MiMo original de Xiaomi en lugar de los de Qwen 3.5, produciendo resultados incorrectos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed (este pack) | 9,41B, 6 bits afín | 262.144 tokens | SWE Pro 44,6; Terminal Bench 2.1 37,1 (cifras del fine-tune BF16) | MIT | HuggingFace, runtime MTPLX 2.12.0+ en Apple Silicon |
| Qwen3.5-9B-MTPLX-Optimized-Speed (mismo autor) | 9B, 6 bits afín | no disponible | Rendimiento de Qwen3.5-9B: SWE Pro 32,0; Terminal Bench 2.1 27,0 | no disponible | HuggingFace, runtime MTPLX |
| MiMo-V2.6-Distill-Qwen-9B (Xiaomi, BF16) | 9B aprox. | no disponible | SWE Pro 44,6; Terminal Bench 2.1 37,1 | no disponible | HuggingFace |
| Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed | 27B aprox., ternario | no disponible | no disponible | no disponible | HuggingFace, runtime MTPLX |

El pack de Qwen 3.5 9B es el más directamente comparable: mismo tamaño, misma receta de cuantización y misma cabeza MTP, pero con los pesos de Qwen en lugar del fine-tune de Xiaomi, lo que según los datos de Xiaomi supone una diferencia de 12,6 puntos en SWE Pro y 10,1 en Terminal Bench 2.1. Frente al checkpoint BF16 de Xiaomi, este pack sacrifica precisión de forma medida (KL 0,0054) a cambio de pasar de aproximadamente 18 GB de pesos a 8,7 GB de descarga y 8,70 GiB de memoria en uso.

## Limitaciones y advertencias

- La cabeza MTP no está entrenada sobre el fine-tune de Xiaomi, sino sobre Qwen3.5-9B. Por eso acierta menos los tokens siguientes de MiMo, con tasas de aceptación de 78,5 % y 56,5 % a profundidad 2 en el escenario medido; en dominios distintos puede ser peor.
- Los benchmarks publicados corresponden al fine-tune en BF16, no a esta cuantización de 6 bits. Las cifras propias de tok/s no están disponibles.
- El modelo solo se ejecuta en Apple Silicon con MTPLX 2.12.0 o superior. Usarlo con versiones anteriores carga parámetros incorrectos.
- El pack no declara idiomas soportados, por lo que no hay garantía documentada de calidad fuera de los idiomas cubiertos por el modelo base.
- La licencia MIT del repositorio se declara en los metadatos de HuggingFace. Conviene verificar la licencia del modelo base de Xiaomi antes de un uso comercial, ya que el pack no reproduce el texto completo de la sección de licencia de su model card.
- Riesgo de alucinación inherente a un modelo de 9B, especialmente en tareas de ciberseguridad y generación de código: cualquier parche o comando de terminal debe revisarse antes de ejecutarse en producción.
- Sesgos conocidos: no disponible. El model card no documenta una evaluación de sesgos.
- La ventana de 262.144 tokens es teórica; la ventana realmente utilizable depende de la memoria unificada (20.480 tokens con 16 GB), lo que puede truncar contextos largos en equipos pequeños.
- El proyecto tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día, por lo que carece de validación comunitaria.
- Idiomas, sesgos y comportamiento fuera de los dominios de entrenamiento (código, agente, codificación visual, ciberseguridad) están sin documentar.

## Enlaces

- Repositorio del pack: https://huggingface.co/Youssofal/MiMo-V2.6-Qwen-9B-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Pack hermano (Qwen 3.5 9B): https://huggingface.co/Youssofal/Qwen3.5-9B-MTPLX-Optimized-Speed
- Pack hermano (Bonsai 2 27B ternario): https://huggingface.co/Youssofal/Ternary-Bonsai-2-27B-MTPLX-Optimized-Speed
- Sitio del runtime MTPLX: https://mtplx.com
- Organización Xiaomi MiMo en HuggingFace: https://huggingface.co/XiaomiMiMo

La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los enlaces obtenidos corresponden a sitios de contenido para adultos y no guardan relación con el tema, por lo que se han descartado. No se han localizado papers, blogs ni demos adicionales en la información disponible.
