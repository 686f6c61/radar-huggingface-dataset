# turion-ai/turion-jev-4b-GGUF

## Resumen

Turion Jev 4B es un modelo de decisión desarrollado por Turion AI. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (por ejemplo, el texto de una incidencia) y un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5) y devuelve, en un único forward pass, una probabilidad para cada opción posible. Esta publicación en GGUF es la versión cuantizada del modelo base `turion-ai/turion-jev-4b`, empaquetada para su uso con llama.cpp.

El modelo cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) y está pensado para tareas de enrutamiento y clasificación: decidir a qué equipo derivar una solicitud, si un caso es urgente, qué categoría asignar, etc. Su enfoque "system-one" busca respuestas rápidas y deterministas leyendo directamente los logits de los códigos de opción, en lugar de muestrear tokens de una completación de chat.

La relevancia de esta ficha radica en que ofrece un patrón distinto al de los LLM generativos: un clasificador probabilístico de propósito general con licencia Apache-2.0, desplegable en local mediante llama.cpp y con un servidor HTTP compatible con peticiones `POST /v1/systemone`. La versión GGUF incluye los ficheros de calibración y prompt necesarios para reproducir el comportamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de decisión; detalles de arquitectura no disponibles) |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens por defecto (configurable con `--n-ctx`; las peticiones más largas se rechazan, no se truncan) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (pesos BF16 disponibles en el modelo base para comparación) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos BF16 en el modelo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un transformer de aproximadamente 4,2 mil millones de parámetros. El modelo se presenta como un "decision model" que, tras un prompt fijo, lee los logits correspondientes a los códigos de opción y los escala mediante una temperatura específica por tipo de pregunta. Los ficheros que acompañan al `.gguf` (`prompt_config.json`, `calibration.json`, el tokenizador original y el paquete `turion_jev`) son los encargados de construir el prompt y extraer las probabilidades a través de llama-cpp-python.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card tampoco describe innovaciones arquitectónicas más allá del mecanismo de lectura de logits y la calibración por tipo de pregunta, que constituyen el núcleo del enfoque.

## Capacidades

- Clasificación probabilística: devuelve una probabilidad para cada opción de una pregunta dada, en un único forward pass.
- Preguntas de elección múltiple: selección entre un conjunto de criterios definidos por el usuario.
- Preguntas de sí/no (`noul`): decisión binaria con probabilidad asociada.
- Preguntas de puntuación de 0 a 5.
- Enrutamiento y derivación: asignación de un estado a un equipo o categoría.
- Procesamiento por lotes de varias preguntas en una misma petición, con tiempo de cómputo proporcional al número de preguntas.
- Servidor HTTP con endpoint `POST /v1/systemone` compatible con TypeSafe.
- Uso desde Python mediante `Predictor.from_dir(...)` y el método `decide(...)`.
- No genera texto libre; no es un modelo conversacional ni de razonamiento multi-step.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo asigna probabilidades a equipos como "billing", "tech", "sales" u "other", lo que permite derivar automáticamente la solicitud al equipo adecuado con un único forward pass.
- Triaje de urgencia: con una pregunta de tipo sí/no, se determina si un caso requiere respuesta el mismo día, útil para priorizar colas de atención al cliente.
- Clasificación de intenciones en asistentes: asignar la intención de un mensaje entrante a una categoría predefinida antes de invocar un LLM generativo, reduciendo coste y latencia en el pipeline.
- Moderación y etiquetado: puntuación de 0 a 5 sobre la gravedad o toxicidad de un contenido, con la probabilidad asociada a cada nivel.
- Enrutamiento en sistemas multiagente: decidir qué agente o herramienta debe atender una petición en función del estado, como paso previo a la ejecución.
- Clasificación documental: asignar documentos a categorías tipadas en un proceso batch, aprovechando el bajo coste por petición (decenas de milisegundos en H200).
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación de documentos o puede responderse directamente, mediante una pregunta de sí/no.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye una métrica propia, "Proxy Full", definida como 0,6 × dominios vistos + 0,4 × dominios nuevos sobre conjuntos de validación de 600 preguntas por conjunto, corregida por azar. No es el Decision Index.

| Metrica | Valor |
|---|---|
| Proxy Full (Q4_K_M) | 80,38 |
| Proxy Full (Q8_0) | 80,37 |
| Proxy Full (BF16, referencia) | 80,97 |
| Tiempo de petición mediano (Q4_K_M, H200) | 55 ms |
| Tiempo de petición mediano (Q8_0, H200) | 48 ms |
| Velocidad en Apple M4 (Q4_K_M, Metal) | ~2 s para una petición de dos preguntas, ~340 tokens de prompt/s |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,74 GB para Q4_K_M y 4,48 GB para Q8_0, más el overhead del contexto (16.384 tokens por defecto).
- GPU recomendadas: NVIDIA H200 para el escenario de referencia (48-55 ms por petición); cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 8 GB o superiores; Q8_0 requiere al menos 6-8 GB.
- Funciona en Apple Silicon: probado en un Apple M4 con 24 GB y Metal, con ~2 s para una petición de dos preguntas.
- Opciones de despliegue: llama.cpp mediante llama-cpp-python; servidor propio `python -m turion_jev.serve --backend gguf`; integración desde Python con `Predictor`.
- Latencia y throughput: 48-55 ms por petición en H200; el tiempo crece con el número de preguntas porque se evalúa el prompt completo de cada una.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con lectura de logits y calibración por tipo de pregunta). La comparación más directa es con el propio modelo base en BF16, cuyos pesos están disponibles en `turion-ai/turion-jev-4b`.

| Modelo | Parametros | Contexto | Proxy Full | Licencia | Formato |
|---|---|---|---|---|---|
| Turion Jev 4B Q4_K_M | 4,2 B | 16.384 | 80,38 | Apache-2.0 | GGUF |
| Turion Jev 4B Q8_0 | 4,2 B | 16.384 | 80,37 | Apache-2.0 | GGUF |
| Turion Jev 4B BF16 | 4,2 B | 16.384 | 80,97 | Apache-2.0 | safetensors (modelo base) |

No disponible para alternativas de otros autores.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde a preguntas tipadas predefinidas.
- Las peticiones que superan la longitud de contexto configurada se rechazan, no se truncan; hay que dimensionar `--n-ctx` en consecuencia.
- El tiempo de respuesta crece con el número de preguntas por petición, ya que se evalúa el prompt completo de cada una.
- La métrica "Proxy Full" es propia del autor y no equivale al Decision Index ni a benchmarks estándar; no es directamente comparable con resultados de terceros.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática; la model card no documenta ninguno de estos aspectos.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio.
- El ecosistema de despliegue está limitado a llama.cpp y al paquete `turion_jev`; no se documenta soporte para vLLM, TGI u otros servidores.
- La calibración depende de los ficheros auxiliares (`prompt_config.json`, `calibration.json`, tokenizador); usar el `.gguf` de forma aislada con una completación de chat estándar pierde las probabilidades y no reproduce el comportamiento previsto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/turion-ai/turion-jev-4b-GGUF
- Modelo base: https://huggingface.co/turion-ai/turion-jev-4b
- Fichero Q4_K_M: https://huggingface.co/turion-ai/turion-jev-4b-GGUF/blob/main/turion-jev-4b-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/turion-ai/turion-jev-4b-GGUF/blob/main/turion-jev-4b-Q8_0.gguf
