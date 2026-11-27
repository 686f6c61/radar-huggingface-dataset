# trinhtung2007/K2-Horizon-3.7B-Vietnamese-Law-llama.cpp

## Resumen

K2-Horizon-3.7B-Vietnamese-Law-llama.cpp es una exportación a formato GGUF de un ajuste fino del modelo K2-Horizon-3.7B orientado al razonamiento jurídico en vietnamita, concretamente al ámbito del derecho penal de Vietnam. Lo publica el usuario trinhtung2007 como artefacto derivado del proyecto IntroAI_project, y su propósito es facilitar la ejecución local del modelo mediante llama.cpp, tanto en CLI como en servidor compatible con la API de OpenAI.

El repositorio no contiene pesos en formato original, sino dos ficheros GGUF: una versión F16 (9,4 GiB) que preserva con mayor fidelidad los pesos fusionados y una versión Q4_K_M (2,9 GiB) cuantizada con matriz de importancia. El modelo base declarado es mlx-community/K2-Horizon-3.7B-4bit, sobre el que se aplicó un ajuste QLoRA en MLX.

Su relevancia actual radica en dos factores: por un lado, permite desplegar un modelo especializado en derecho penal vietnamita en hardware de consumo gracias a la cuantización Q4_K_M; por otro, la model card documenta explícitamente una comprobación de similitud de salidas entre las versiones MLX, F16 y Q4_K_M, lo que aporta trazabilidad sobre la degradación introducida por la cuantización. La información disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es, no obstante, muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base K2-Horizon; familia no especificada en la informacion) |
| Parametros totales | 5.058.255.360 (dato de safetensors del repo); la denominacion comercial es 3.7B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens recomendados en llama-cli; 16.384 en llama-server (segun model card) |
| Tipos de cuantizacion | F16 y Q4_K_M (con calibracion por matriz de importancia) |
| Idiomas soportados | vietnamita (especializado en derecho penal); resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base K2-Horizon (transformer, MoE, híbrida, etc.), por lo que este dato debe considerarse no disponible. Lo que sí se documenta es el proceso de ajuste: se partió del modelo mlx-community/K2-Horizon-3.7B-4bit y se aplicó un ajuste fino QLoRA en MLX con rango 32, tasa de aprendizaje 5e-6 y 3.306 pasos de actualización. El corpus de entrenamiento referenciado es el conjunto público de sentencias judiciales cbba-toaan-gov-vn.

El proceso de conversión a GGUF se realizó en dos vías. Para F16, se fusionó el adaptador MLX final con la base MLX de 4 bits, se desquantizaron los pesos fusionados y se exportaron directamente a F16 GGUF. Para Q4_K_M, se cuantizó el modelo fusionado usando una matriz de importancia recogida de 64 registros de entrenamiento, sin emplear registros de evaluación en la calibración. Ambos ficheros incorporan el tokenizador y la plantilla de chat de K2-Horizon, incluido su formato de razonamiento y el token de fin de turno. No se detalla si hubo RLHF, DPO ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en vietnamita, con plantilla de chat propia y token de fin de turno.
- Razonamiento jurídico especializado en derecho penal vietnamita, derivado del ajuste sobre el corpus de sentencias.
- Formato de razonamiento integrado (reasoning format) heredado del tokenizador y la plantilla de K2-Horizon.
- Ejecución local mediante llama.cpp, con soporte de `--jinja` para aplicar la plantilla de chat.
- Despliegue como servidor compatible con la API de OpenAI mediante `llama-server`.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Cobertura multilingüe más allá del vietnamita: no disponible.

## Casos de uso

- Asistencia a la redacción de escritos penales: el modelo puede generar borradores de argumentación jurídica en vietnamita a partir de un supuesto de hecho, apoyándose en el ajuste sobre sentencias reales del corpus cbba-toaan-gov-vn.
- Consulta de jurisprudencia penal en local: al ejecutarse con llama.cpp y caber en hardware de consumo en Q4_K_M, permite desplegar un asistente de consulta sin enviar datos sensibles a servicios en la nube.
- Prototipado de herramientas legales para desarrolladores: la versión Q4_K_M (2,9 GiB) facilita iterar rápidamente en entornos de desarrollo con recursos limitados antes de pasar a F16 en producción.
- Servidor interno compatible con OpenAI: mediante `llama-server -c 16384 --jinja` se puede exponer el modelo como endpoint y conectarlo a frameworks que esperan la API de OpenAI, útil para integrar en pipelines existentes.
- Análisis y resumen de documentos judiciales: con una ventana de contexto de hasta 16.384 tokens en servidor, el modelo puede procesar fragmentos extensos de resoluciones y extraer los elementos clave del razonamiento.
- Docencia y formación jurídica: como generador de explicaciones y ejemplos sobre derecho penal vietnamita en entornos controlados, siempre con revisión humana dada la naturaleza del dominio.
- Evaluación comparativa de cuantizaciones: el repositorio sirve como caso práctico para estudiar la degradación F16 frente a Q4_K_M en tareas de razonamiento jurídico, gracias a la métrica de similitud de salidas documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente incluye una comprobación de similitud de salidas sobre dos registros de evaluación reservados (IDs 3322–3323), con decodificación greedy y límite de 1.536 tokens, usando embeddings de LiquidAI/LFM2.5-Embedding-350M y similitud coseno:

| Comparacion | Similitud coseno media |
|---|---:|
| Salida MLX vs. salida llama.cpp F16 | 0,981 |
| Salida MLX vs. salida llama.cpp Q4_K_M | 0,709 |
| Verdad de referencia vs. salida MLX | 0,932 |
| Verdad de referencia vs. salida llama.cpp F16 | 0,942 |
| Verdad de referencia vs. salida llama.cpp Q4_K_M | 0,737 |

La longitud media de las respuestas finales en esos dos ejemplos fue de 2.352 caracteres para MLX, 2.447 para F16 y 506 para Q4_K_M. Una comprobación adicional de 20 ejemplos para Q4_K_M arrojó una similitud coseno media MLX-GGUF de 0,766. El propio autor advierte que se trata de comprobaciones pequeñas de similitud de salida, no de evaluaciones amplias de exactitud jurídica.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,4 GiB para F16 y 2,9 GiB para Q4_K_M, según el tamaño de los ficheros GGUF.
- GPU recomendadas: no especificadas en la información; por tamaño, F16 encaja en GPU con 12-16 GB o más, y Q4_K_M en GPU con 4-6 GB o más.
- GPU de consumo: Q4_K_M es apto para tarjetas con 6 GB o más; F16 requiere tarjetas de gama alta con al menos 12 GB. No se confirman modelos concretos en la documentación.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), con soporte de `--jinja`; también es compatible con endpoints de la API de OpenAI a través de `llama-server`.
- Contexto recomendado: `-c 8192` en CLI y `-c 16384` en servidor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación facilitada (mismo tamaño, misma tarea o mismo idioma). Los datos de referencia disponibles son únicamente las dos variantes del propio repositorio:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| K2-Horizon-3.7B-Vietnamese-Law F16 | 5.058.255.360 | 8.192 / 16.384 | GGUF F16 | Apache-2.0 |
| K2-Horizon-3.7B-Vietnamese-Law Q4_K_M | 5.058.255.360 | 8.192 / 16.384 | GGUF Q4_K_M | Apache-2.0 |
| Modelo base mlx-community/K2-Horizon-3.7B-4bit | no disponible | no disponible | MLX 4-bit | no disponible |

Comparativa con alternativas externas: no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo ni del corpus de sentencias empleado; el dominio jurídico penal es especialmente sensible a sesgos históricos del corpus.
- Riesgo de alucinación relevante: el modelo genera texto jurídico plausible pero puede citar artículos, sentencias o plazos inexistentes; requiere verificación humana obligatoria.
- La evaluación publicada se limita a dos ejemplos de similitud de salida y una comprobación adicional de 20 ejemplos; no constituye una validación de exactitud jurídica.
- La cuantización Q4_K_M muestra una degradación notable frente a F16 en las comprobaciones del autor (coseno 0,709 frente a 0,981 respecto a MLX), con respuestas mucho más cortas (506 caracteres frente a 2.447); para uso jurídico serio, F16 es preferible.
- Cobertura lingüística limitada al vietnamita; no se documentan capacidades en otros idiomas.
- La licencia Apache-2.0 figura en los metadatos del modelo base, pero el autor remite a los términos del modelo base y del dataset cbba-toaan-gov-vn para atribución y condiciones de uso; conviene revisarlos antes de un uso comercial.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no deben asumirse.
- El repositorio tiene un volumen de descargas bajo (207) y un único like, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trinhtung2007/K2-Horizon-3.7B-Vietnamese-Law-llama.cpp
- Modelo base: https://huggingface.co/mlx-community/K2-Horizon-3.7B-4bit
- Repositorio del proyecto: https://github.com/trinhtung111/IntroAI_project
- Dataset de sentencias: https://huggingface.co/datasets/tmquan/cbba-toaan-gov-vn
- Modelo de embeddings usado en la evaluación: https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M
