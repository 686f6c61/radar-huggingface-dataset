# tchbcb/samai-8b-M8

## Resumen

samai-8b-M8 es un modelo conversacional y orientado a la ejecución de agentes, desarrollado por el usuario tchbcb, obtenido mediante destilación continua y ajuste fino con QLoRA sobre el modelo base Qwen/Qwen3.5-9B en precisión bf16. El modelo resuelve el problema de la orquestación fiable de herramientas (tool calling) en entornos de agentes: llamadas de un solo paso, uso combinado de múltiples herramientas, cadenas de varios turnos y respuestas directas cuando no procede invocar ninguna herramienta. Esta entrega, denominada M8, es la versión final de la serie y se distribuye únicamente como pesos cuantizados en formato GGUF q4_k_m.

El modelo cuenta con 9.197.093.888 parámetros totales y una licencia Apache 2.0, lo que facilita su uso comercial. Los idiomas declarados son chino (zh) e inglés (en). El repositorio ocupa 68,6 GB, aunque el artefacto principal de inferencia es un único fichero GGUF de 5,78 GB, pensado para ejecutarse con llama.cpp en GPUs de gama media como la T4 (SM75) o incluso en CPU.

La relevancia de esta entrega radica en su enfoque en la evaluación de capacidades agénticas: el autor publica resultados de un banco de 60 tareas (agent60) y de una puerta de regresión de capacidades (knight15), además de una comparativa directa contra un modelo ternario de 27B. El modelo mejora la orquestación multi-herramienta de forma notable respecto a su versión anterior (M7), aunque presenta una ligera regresión en tareas de cadena multi-turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 2048`) |
| Tipos de cuantizacion | q4_k_m (único peso publicado); el modelo base se entrenó en bf16 y se convirtió a f16 antes de cuantizar |
| Idiomas soportados | zh (chino), en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors declarado en los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B en bf16 y se ajusta mediante QLoRA con cuantización nf4, rango r=32 y alpha=64. El conjunto de entrenamiento se sintetizó con un paradigma de profesor programático y consta de 3200 instrucciones agénticas organizadas en cuatro clústeres: llamadas de un solo paso, uso de múltiples herramientas, cadenas de varios turnos y respuestas negativas directas (es decir, casos en los que el modelo debe responder sin invocar herramientas). El dataset incorpora validación de líneas rojas de accesibilidad de herramientas y ejemplos negativos con respuestas verdaderas.

El proceso de fusión se realizó de forma verificada par a par mediante streaming, con 128 de 128 pares LoRA confirmados. La cadena de cuantización consistió en convertir el modelo fusionado en bf16 a f16 con `convert_hf_to_gguf.py` y después aplicar `llama-quantize` para obtener q4_k_m. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa ni arquitecturas híbridas); el valor diferencial está en el ajuste fino orientado a agentes y en la validación empírica del comportamiento en tool calling.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Llamada de herramientas (function calling) en escenarios de un solo paso.
- Orquestación de múltiples herramientas en una misma tarea, con mejora significativa respecto a la versión M7 (+26,7 puntos en el clúster B de agent60).
- Razonamiento multi-turno con cadenas de llamadas encadenadas (aunque con una ligera regresión de -6,7 puntos en el clúster C).
- Respuesta directa sin invocar herramientas cuando la consulta no lo requiere (mejora de +13,3 puntos en el clúster D).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Capacidades agénticas de múltiples pasos implícitas en el diseño del dataset de entrenamiento.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistentes de atención al cliente con invocación de herramientas: el modelo puede decidir cuándo consultar un sistema de tickets, un CRM o una base de conocimiento, y cuándo responder directamente, gracias al entrenamiento específico en respuestas negativas directas (clúster D, 93,3 % en agent60).
- Automatización de flujos con múltiples APIs: en tareas que requieren encadenar varias llamadas (por ejemplo, consultar inventario, verificar stock y generar un pedido), el modelo muestra una mejora de 26,7 puntos en el clúster de múltiples herramientas, lo que lo hace adecuado para pipelines de automatización interna.
- Agentes de soporte técnico multi-turno: puede mantener conversaciones con contexto de varios turnos e ir invocando herramientas de diagnóstico de forma secuencial, aunque conviene validar el comportamiento en cadenas largas por la regresión observada en el clúster C.
- Despliegue en infraestructura modesta: al ejecutarse con llama.cpp en q4_k_m (5,78 GB) sobre una T4 o incluso en CPU, es viable para prototipos, entornos de desarrollo y servicios de baja latencia sin GPUs de gama alta.
- Enrutamiento de consultas en sistemas RAG: el modelo puede clasificar si una consulta necesita recuperación externa (herramienta de búsqueda) o puede responderse con conocimiento propio, reduciendo llamadas innecesarias a servicios externos.
- Evaluación y benchmarking de agentes: el autor publica los conjuntos agent60, knight15 y el banco de 48 tareas del PK, lo que permite reutilizar el modelo como referencia o como contrincante en pruebas comparativas de orquestación de herramientas.
- Asistentes bilingües chino-inglés: adecuado para productos dirigidos a mercados donde se requiere alternancia entre ambos idiomas, dado que son los dos idiomas declarados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (agent60, 60 tareas; M7 como línea base):

| Evaluacion | M7 base | M8 final | Variacion |
|---|---|---|---|
| agent60 A (un solo paso) | 100,0 | 100,0 | 0 |
| agent60 B (multiples herramientas) | 73,3 | 100,0 | +26,7 |
| agent60 C (cadena multi-turno) | 100,0 | 93,3 | -6,7 |
| agent60 D (respuesta directa negativa) | 80,0 | 93,3 | +13,3 |
| agent60 total | 86,7 | 96,7 | +10,0 |
| knight15 (regresion de capacidades) | 15/15 | 15/15 | 0 |

Comparativa directa publicada contra Ternary-Bonsai-2-27B (prism-ml) en un banco nuevo de 48 tareas sin filtración de entrenamiento, mismo harness y decodificación greedy:

| Cluster | samai-8b M8 | Bonsai-2-27B | Delta |
|---|---|---|---|
| A (un solo paso) | 58,3 % | 58,3 % | 0 |
| B (multiples herramientas) | 50,0 % | 41,7 % | +8,3 |
| C (cadena multi-turno) | 41,7 % | 41,7 % | 0 |
| D (respuesta directa negativa) | 100,0 % | 100,0 % | 0 |
| Total | 62,5 % | 60,4 % | +2,1 |

No se han publicado resultados en benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,78 GB solo para los pesos en q4_k_m; hay que añadir la memoria del contexto KV, que crece con la ventana configurada (el ejemplo usa `-c 2048`).
- GPU validadas: NVIDIA T4 (SM75) con `-ngl 99`, según la model card.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para q4_k_m con contexto moderado (T4, RTX 3060/4060, RTX 4090, A10, L4). En GPUs de 24 GB o más (RTX 4090, A100, H100) el modelo cabe holgadamente y permite contextos mayores.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en q4_k_m; también se ha validado la inferencia en CPU.
- Opciones de despliegue: llama.cpp (`llama-server`), y por los tags del repositorio, entornos compatibles con endpoints. No se documenta soporte explícito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; no se publican métricas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Rendimiento agente (banco PK) |
|---|---|---|---|---|---|
| samai-8b-M8 | 9,2 B | no disponible | GGUF q4_k_m, 5,78 GB | Apache 2.0 | 62,5 % (48 tareas) |
| Ternary-Bonsai-2-27B (prism-ml) | 27 B (ternario) | no disponible | PTQ1_0, 5,95 GB | no disponible | 60,4 % (48 tareas) |
| Qwen/Qwen3.5-9B (modelo base) | 9 B (aprox.) | no disponible | bf16 | no disponible en la informacion | no disponible |

La comparativa directa con Ternary-Bonsai-2-27B la publica el propio autor del modelo, por lo que debe interpretarse con cautela: el banco de 48 tareas, el harness y el criterio de puntuación son elecciones del autor. No se dispone de comparaciones independientes con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; al entrenarse sobre datos sintéticos generados por un profesor programático, puede heredar sesgos de ese generador y de los datos del modelo base.
- Riesgo de alucinación: el modelo está optimizado para invocar herramientas y responder directamente, pero no se han publicado evaluaciones de veracidad factual en dominios abiertos; en producción conviene validar las respuestas que no pasan por herramientas.
- Regresión en cadenas multi-turno: el clúster C de agent60 baja de 100,0 a 93,3 respecto a M7, y en el banco PK solo alcanza el 41,7 %; las tareas de varios turnos encadenados son el punto más débil.
- Idiomas limitados: solo se declaran chino e inglés; el rendimiento en castellano u otros idiomas no está evaluado y no debería asumirse.
- Contexto no documentado: la longitud máxima de contexto no se especifica; el ejemplo de despliegue usa 2048 tokens, por lo que no hay garantía de buen comportamiento con ventanas largas.
- Formato único: solo se publica q4_k_m en GGUF; no hay pesos bf16/f16 listos para usar ni otras cuantizaciones, lo que limita el ajuste fino posterior y el despliegue en frameworks que no lean GGUF.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-9B, ya que la licencia del derivado no exime de las obligaciones del original.
- Evaluación autoinformada: todos los benchmarks proceden del autor, con conjuntos de tareas propios y sin validación externa; los resultados deben tomarse como indicativos.
- Repositorio grande: 68,6 GB de tamaño total frente a un único artefacto de inferencia de 5,78 GB; la descarga completa puede ser costosa si solo se necesita el GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tchbcb/samai-8b-M8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de llama.cpp (herramienta de conversión y cuantización): https://github.com/ggerganov/llama.cpp
- Modelo comparado en el PK (Ternary-Bonsai-2-27B, prism-ml): no disponible el enlace exacto en la información proporcionada
- Informes de evaluación citados (`m8_final_report.json`, `m8_knight15_report.json`, `m8_baseline_report.json`, `pk_summary.json`, `m8_pk_eval.jsonl`): alojados en el propio repositorio de Hugging Face del modelo
