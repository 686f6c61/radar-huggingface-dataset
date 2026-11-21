# turion-ai/turion-jev-4b-GGUF

## Resumen

Turion Jev 4B es un modelo de decisión desarrollado por Turion AI. A diferencia de un modelo generativo al uso, no produce texto: recibe un estado (por ejemplo, el texto de una consulta de cliente) y un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación de 0 a 5) y devuelve, en un único forward pass, una probabilidad para cada opción posible. Esto lo convierte en un componente de enrutamiento y clasificación de baja latencia, pensado para integrarse como "system one" en pipelines de agentes o sistemas de atención automatizada.

El modelo base cuenta con 4.205.751.296 parámetros y se distribuye aquí en formato GGUF para llama.cpp, con cuantizaciones Q4_K_M y Q8_0. La ventana de contexto por defecto del servidor es de 16.384 tokens, y las peticiones que la exceden se rechazan en lugar de truncarse. La licencia es Apache-2.0, la misma que la del modelo base.

La relevancia de esta ficha radica en su enfoque poco habitual: en lugar de muestrear un token de una distribución, lee directamente los logits de los códigos de opción tras un prompt fijo y los escala con una temperatura específica por tipo de pregunta. Ese diseño preserva la distribución completa de probabilidades, algo que una llamada de chat convencional perdería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base turion-ai/turion-jev-4b; pesos en formato GGUF) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens por defecto en el servidor (`--n-ctx` configurable) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (además de pesos BF16 en el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación proporcionada. Los tags de la model card lo clasifican como "decision model" y "system-one", y el pipeline declarado es `text-classification`. El modelo no genera texto: la respuesta se obtiene leyendo los logits de los códigos de opción tras un prompt fijo y escalándolos con una temperatura por tipo de pregunta. Los ficheros que acompañan al `.gguf` (`prompt_config.json`, `calibration.json`, el tokenizador original y el paquete `turion_jev`) son los encargados de construir el prompt y leer los logits mediante `llama-cpp-python`.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si la arquitectura es transformer densa, MoE o híbrida. La innovación destacable es el propio paradigma de decisión: una sola pasada hacia delante devuelve probabilidades para todas las opciones de todas las preguntas de la petición, con calibración específica por tipo de pregunta.

## Capacidades

- Clasificación y enrutamiento: asigna probabilidades a opciones de elección múltiple (por ejemplo, equipo de atención al cliente: billing, tech, sales, other).
- Preguntas booleanas (tipo `noul`): devuelve la probabilidad de que la respuesta sea afirmativa o negativa.
- Puntuación de 0 a 5: devuelve una distribución sobre los seis niveles de la escala.
- Procesamiento multi-pregunta en una sola petición: varias preguntas tipadas sobre el mismo estado se resuelven en un único forward pass.
- API compatible con TypeSafe mediante `POST /v1/systemone`, con campos `state` y `questions`.
- Integración con llama.cpp a través del paquete `turion_jev` y del backend GGUF.
- No genera texto libre ni mantiene conversaciones multi-turno por sí mismo.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible como capacidad nativa del modelo; su uso previsto es como componente de decisión dentro de sistemas mayores.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de que corresponda a billing, tech, sales u other, y el sistema deriva el ticket al equipo con mayor probabilidad. Es adecuado porque resuelve la clasificación en una sola pasada y con latencia de decenas de milisegundos en GPU.
- Priorización de urgencias: con una pregunta booleana del tipo "¿necesita respuesta hoy?", se puede ordenar la cola de atención al cliente sin intervención humana.
- Triaje en pipelines de agentes: como "system one" que decide qué herramienta o subagente invocar antes de recurrir a un modelo generativo más costoso, reduciendo el número de llamadas a LLM grandes.
- Encuestas y formularios estructurados: convertir respuestas abiertas en puntuaciones de 0 a 5 calibradas, útil para análisis de satisfacción o evaluación de calidad.
- Moderación y filtrado previo: clasificar contenido entrante con preguntas booleanas antes de pasarlo a un modelo generativo, como capa de bajo coste.
- Extracción de decisiones en sistemas de recomendación: puntuar opciones discretas (categorías, niveles, segmentos) a partir de un estado textual, con probabilidades interpretables en lugar de una única etiqueta.
- Despliegue en local o en el borde: con el fichero Q4_K_M (2,74 GB) puede ejecutarse en un portátil Apple M4 de 24 GB, lo que permite clasificación sensible a la privacidad sin enviar datos a la nube.

## Benchmarks y rendimiento

La model card proporciona una métrica propia, "Proxy Full", definida como 0,6 × dominios vistos + 0,4 × dominios nuevos sobre conjuntos held-out de 600 preguntas por conjunto, con corrección por azar. No es el Decision Index del autor.

| Modelo / formato | Proxy Full | Tiempo de petición (mediana, 1 request, NVIDIA H200) |
|---|---:|---:|
| turion-jev-4b-Q4_K_M.gguf | 80,38 | 55 ms |
| turion-jev-4b-Q8_0.gguf | 80,37 | 48 ms |
| Pesos BF16 (referencia) | 80,97 | no disponible |

En un portátil Apple M4 (24 GB, Metal), el fichero Q4_K_M responde a la petición de dos preguntas de ejemplo en aproximadamente 7 segundos. El tiempo crece con el número de preguntas de la petición, ya que llama.cpp evalúa el prompt completo de cada pregunta. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,74 GB para Q4_K_M y 4,48 GB para Q8_0, más el overhead del contexto y del runtime de llama.cpp.
- GPU recomendadas: NVIDIA H200 para la latencia medida en la model card (48-55 ms por petición); cualquier GPU con al menos 6-8 GB de VRAM libre debería poder alojar el Q4_K_M.
- Cabe en GPU de consumo: sí, el Q4_K_M (2,74 GB) es compatible con tarjetas de 8 GB o más; el Q8_0 (4,48 GB) requiere al menos 6-8 GB.
- Ejecución en CPU/Apple Silicon: validada en un Apple M4 de 24 GB con Metal, con unos 7 segundos por petición de dos preguntas.
- Opciones de despliegue: llama.cpp mediante el paquete `turion_jev` (`python -m turion_jev.serve --backend gguf`), con `llama-cpp-python` como dependencia. No se mencionan vLLM, TGI ni Ollama en la documentación.
- Latencia y throughput: 55 ms (Q4_K_M) y 48 ms (Q8_0) por petición en H200; el coste escala con el número de preguntas por petición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión o clasificación con el mismo paradigma en la documentación proporcionada. La alternativa más directa sería el propio modelo base `turion-ai/turion-jev-4b` en BF16, que obtiene un Proxy Full de 80,97 frente a 80,38 del Q4_K_M.

| Modelo | Parametros | Contexto | Proxy Full | Licencia | Formato |
|---|---:|---:|---:|---|---|
| turion-jev-4b-GGUF Q4_K_M | 4,2 B | 16.384 | 80,38 | Apache-2.0 | GGUF |
| turion-jev-4b-GGUF Q8_0 | 4,2 B | 16.384 | 80,37 | Apache-2.0 | GGUF |
| turion-jev-4b (BF16) | 4,2 B | no disponible | 80,97 | Apache-2.0 | safetensors |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; usarlo como chat pierde la distribución de probabilidades.
- Las peticiones que superan el contexto configurado (16.384 tokens por defecto) se rechazan, nunca se truncan; hay que dimensionar `--n-ctx` según el caso de uso.
- La latencia crece con el número de preguntas por petición, ya que se evalúa el prompt completo de cada pregunta.
- "Proxy Full" es una métrica propia del autor, no el Decision Index ni un benchmark estándar; no es directamente comparable con resultados de terceros.
- No se han publicado datos sobre sesgos, idiomas soportados ni tasas de alucinación; al tratarse de un clasificador, el riesgo se traslada a calibración incorrecta en dominios no vistos.
- El repositorio no registra descargas ni likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar `LICENSE` y `NOTICE` del repositorio por si hay condiciones adicionales.
- La fecha de creación del repositorio (2026-11-21) es posterior a la fecha habitual de referencia; verificar la vigencia de los artefactos antes de desplegar.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/turion-ai/turion-jev-4b-GGUF
- Modelo base: https://huggingface.co/turion-ai/turion-jev-4b
- Fichero Q4_K_M: https://huggingface.co/turion-ai/turion-jev-4b-GGUF/blob/main/turion-jev-4b-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/turion-ai/turion-jev-4b-GGUF/blob/main/turion-jev-4b-Q8_0.gguf
