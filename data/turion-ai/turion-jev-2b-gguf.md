# turion-ai/turion-jev-2b-GGUF

## Resumen

Turion Jev 2B es un modelo de decisión desarrollado por Turion AI: dado un estado (texto libre) y un conjunto de preguntas tipadas (elección múltiple, sí/no, puntuación 0-5), devuelve una probabilidad para cada opción en un único forward pass. No genera texto; su función es clasificar y enrutar, actuando como un "system one" rápido dentro de arquitecturas de agentes. Esta ficha cubre la variante cuantizada en GGUF, pensada para ejecutarse con llama.cpp.

El modelo base cuenta con 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) y está publicado bajo licencia Apache-2.0. La versión GGUF incluye ficheros Q4_K_M y Q8_0, junto con los artefactos necesarios para construir el prompt y leer los logits de los códigos de opción: `prompt_config.json`, `calibration.json`, el tokenizer original y un paquete Python `turion_jev` que gestiona la inferencia sobre llama-cpp-python.

Su relevancia radica en el enfoque: en lugar de un chat completion que muestrea un token y pierde la distribución de probabilidad, Turion Jev lee directamente los logits asociados a los códigos de opción tras un prompt fijo y los escala con una temperatura específica por tipo de pregunta. Esto permite obtener decisiones calibradas y deterministas con latencias muy bajas (29-32 ms medianos en una NVIDIA H200), adecuadas para routing en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de decisión, sin generación de texto) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens por defecto (`--n-ctx`); las peticiones más largas se rechazan, no se truncan |
| Tipos de cuantizacion | Q4_K_M (1,29 GB), Q8_0 (2,01 GB); pesos BF16 disponibles en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); BF16 en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Se trata de un modelo de decisión que, a partir de un estado y preguntas tipadas, produce una distribución de probabilidad sobre las opciones definidas. La inferencia se realiza mediante un prompt fijo que codifica el estado y las preguntas, tras el cual se leen los logits correspondientes a los códigos de opción. La temperatura de escalado es específica por tipo de pregunta (elección múltiple, sí/no, puntuación 0-5) y se calibra mediante `calibration.json`.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona una métrica propia denominada "Proxy Full", definida como 0,6 × dominios vistos + 0,4 × dominios nuevos sobre conjuntos held-out de 600 preguntas por conjunto, corregida por azar. Esta métrica no equivale al Decision Index del autor. Los valores obtenidos son 75,75 para Q4_K_M, 76,30 para Q8_0 y 75,82 para los pesos BF16 de referencia, lo que indica que la cuantización Q4_K_M pierde aproximadamente 0,07 puntos frente a BF16 y Q8_0 gana 0,48.

## Capacidades

- Clasificación y enrutamiento: asigna un estado a una categoría entre un conjunto de opciones definidas por el usuario (por ejemplo, equipo de soporte: billing, tech, sales, other).
- Preguntas booleanas (sí/no): devuelve la probabilidad de que la respuesta sea afirmativa o negativa.
- Puntuación ordinal 0-5: estima una puntuación en escala discreta con probabilidad asociada a cada nivel.
- Decisión multi-pregunta en un solo forward pass: permite evaluar varias preguntas tipadas simultáneamente sobre el mismo estado.
- Salida probabilística calibrada: proporciona la distribución completa sobre las opciones, no solo la etiqueta ganadora.
- Sin generación de texto: no produce respuestas en lenguaje natural; su salida es estructural (probabilidades por opción).
- Compatibilidad con llama.cpp y llama-cpp-python mediante el paquete `turion_jev`.
- Servidor HTTP con endpoint `POST /v1/systemone` compatible con TypeSafe.
- No se ha documentado soporte de tool calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta de elección múltiple con los equipos disponibles (billing, tech, sales, other). Con 16.384 tokens de contexto puede procesar hilos de conversación completos y devolver la probabilidad por equipo en una sola pasada, lo que permite umbrales de confianza y derivación a revisión humana cuando la probabilidad máxima es baja.
- Triaje de urgencia: mediante una pregunta de tipo sí/no ("¿requiere respuesta hoy?"), el modelo clasifica cada mensaje entrante y permite priorizar la cola de atención. La latencia de 29-32 ms en H200 hace viable aplicarlo a todos los mensajes de entrada sin cuello de botella.
- Moderación y filtrado de contenido: con preguntas booleanas sobre categorías de riesgo, se obtiene una probabilidad por categoría que permite fijar umbrales ajustables según la política de la aplicación, en lugar de una etiqueta binaria rígida.
- Encuestas y formularios estructurados: a partir de respuestas en texto libre, el modelo puede mapear cada respuesta a una escala 0-5 (satisfacción, probabilidad de recomendación) y proporcionar la distribución completa para análisis estadístico posterior.
- Routing dentro de pipelines de agentes: como "system one" rápido, decide qué herramienta o subagente debe activarse a continuación a partir del estado actual de la conversación, reduciendo el coste frente a invocar un LLM generativo para cada decisión de enrutamiento.
- Clasificación por lotes en本地: al ejecutarse con llama.cpp sobre GGUF Q4_K_M (1,29 GB), puede desplegarse en una máquina con GPU de consumo o incluso CPU para procesar grandes volúmenes de registros históricos y etiquetarlos con probabilidades calibradas.
- Extracción de señales en analítica de producto: clasificar feedback de usuarios en categorías predefinidas con una sola pasada por registro, manteniendo la distribución de probabilidad para medir ambigüedad entre categorías.

## Benchmarks y rendimiento

La model card solo publica la métrica propia "Proxy Full" (0,6 × dominios vistos + 0,4 × dominios nuevos, corregida por azar, sobre 600 preguntas por conjunto). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Q4_K_M | Q8_0 | BF16 (referencia) |
|---|---:|---:|---:|
| Proxy Full | 75,75 | 76,30 | 75,82 |
| Tamano del fichero | 1,29 GB | 2,01 GB | no disponible |
| Tiempo de peticion mediano (1 request, NVIDIA H200) | 32 ms | 29 ms | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para Q4_K_M y 2,0 GB para Q8_0, más el overhead del contexto (hasta 16.384 tokens) y de llama.cpp.
- GPU recomendadas: NVIDIA H200 para la latencia medida en la model card (29-32 ms por petición); cualquier GPU con al menos 4-6 GB de VRAM libre debería poder alojar el modelo con contexto moderado.
- Cabe en GPU de consumo: sí, tanto Q4_K_M como Q8_0 caben en tarjetas con 8 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.). También es viable en CPU mediante llama.cpp, con mayor latencia.
- Opciones de despliegue: llama.cpp / llama-cpp-python (soporte oficial mediante el paquete `turion_jev`), servidor propio `python -m turion_jev.serve` con endpoint `/v1/systemone`. No se documenta soporte nativo para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 29 ms (Q8_0) y 32 ms (Q4_K_M) medianos por petición individual en una NVIDIA H200. No se han publicado cifras de throughput en lote ni latencias en otras GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión con las mismas características (salida probabilística por opción en un solo forward pass) en la documentación proporcionada. Los benchmarks estándar de LLM no son aplicables directamente porque Turion Jev no genera texto.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Formato |
|---|---:|---|---|---|---|
| Turion Jev 2B GGUF | 1,88 B | 16.384 | Probabilidades por opción | Apache-2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto: no puede usarse como chatbot ni para producir respuestas en lenguaje natural; su única salida son probabilidades sobre opciones predefinidas.
- Contexto limitado a 16.384 tokens por defecto; las peticiones más largas se rechazan explícitamente en lugar de truncarse, lo que exige gestionar el tamaño de entrada en el cliente.
- Idiomas soportados no documentados: no hay información sobre el rendimiento en castellano u otros idiomas distintos del inglés; conviene validar empíricamente antes de desplegar en producción multilingüe.
- Riesgo de calibración dependiente del dominio: la métrica Proxy Full separa dominios vistos y nuevos (0,6/0,4), lo que sugiere una caída de rendimiento en dominios no representados durante el entrenamiento.
- La calibración por temperatura está fijada en `calibration.json`; modificarla o ignorarla altera la interpretación de las probabilidades.
- Dependencia del prompt fijo y del tokenizer original: usar el modelo con un prompt distinto o con otro tokenizer invalida las probabilidades.
- Sin información sobre sesgos: no se han publicado evaluaciones de sesgo ni de robustez adversarial en la documentación disponible.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE` según indica la model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/turion-ai/turion-jev-2b-GGUF
- Modelo base: https://huggingface.co/turion-ai/turion-jev-2b
- Fichero Q4_K_M: https://huggingface.co/turion-ai/turion-jev-2b-GGUF/blob/main/turion-jev-2b-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/turion-ai/turion-jev-2b-GGUF/blob/main/turion-jev-2b-Q8_0.gguf
