# vllm-sr/d3-ultra-INT4

## Resumen

d3-ultra-INT4 es la versión cuantizada a int4 de d3-ultra, un modelo fundacional multimodal de decisión de 26.090 millones de parámetros (incluido un codificador visual de 0,46B) desarrollado por el equipo vllm-sr dentro de la familia Decision 3.0. No es un modelo generativo al uso: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeos) y un conjunto de preguntas tipadas, y devuelve una probabilidad para cada respuesta posible, ya sea elegir entre opciones, responder sí o no, puntuar en una escala, delimitar una caja (Box) o seguir un objeto en un vídeo (Track). Está pensado como "modelo de sistema uno": una sola lectura del contexto por petición, con todas las preguntas resueltas en esa pasada.

La relevancia de esta variante concreta es puramente de eficiencia de memoria: reduce los pesos en disco de 52,2 GB a 17,6 GB mediante cuantización de solo peso W4A16 (int4 asimétrico con puntos cero en grupos de 32 y escalas BF16), manteniendo las activaciones en BF16. Según la model card, conserva 71,47 puntos en el Jev Decision Index 0.3 frente a 71,57 del modelo completo, con la respuesta top de d3-ultra coincidiendo en el 98,6% de 272.229 preguntas. El coste principal se concentra en la tarea de detección por cajas, que pierde 3,4 puntos de precisión a IoU 0,5.

El modelo se publica bajo licencia Apache-2.0, con pesos en safetensors y código personalizado (`custom_code`), y requiere transformers 5.17.0 y compressed-tensors 0.17 o superior. Está etiquetado para `zero-shot-classification` y `feature-extraction`, y su pipeline declarado es de clasificación zero-shot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con capas de atención lineal Gated DeltaNet y codificador visual; pesos del decodificador cuantizados con compressed-tensors (`pack-quantized`) |
| Parámetros totales | 26.085.330.160 (26,09B), incluidos 0,46B del codificador visual |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT4 weight-only W4A16: int4 asimétrico con zero points en grupos de 32 y escalas BF16; AWQ smoothing seguido de redondeo GPTQ; activaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (17,6 GB en disco; el modelo base ocupa 52,2 GB) |

## Arquitectura y entrenamiento

d3-ultra-INT4 hereda la arquitectura del modelo base d3-ultra (release del 2026-10-24), un transformer multimodal que combina un codificador visual con un decodificador que incorpora capas de atención lineal Gated DeltaNet. La cuantización afecta a 400 proyecciones del decodificador; quedan intactos el codificador visual, los embeddings, el readout y las proyecciones `in_proj_a` / `in_proj_b` de las capas Gated DeltaNet, salvo donde se plegaron las escalas de AWQ. El proceso aplica primero smoothing AWQ (escalas dependientes de activación plegadas en las normas previas y en `up_proj`) y después redondeo GPTQ, generando pesos int4 asimétricos con puntos cero en grupos de 32 y escalas BF16.

Los datos de calibración son las 832 peticiones de d3-turbo-INT4 mezcladas: 512 prompts de texto del primer shard de entrenamiento de `tasksource-jev-typed-decisions`, 256 peticiones de tipo Box (32 por familia) y 64 peticiones de imágenes dentro de opciones procedentes de los datos de entrenamiento de d3-turbo. No se usaron imágenes de los splits de desarrollo y test de Box ni de imágenes en opciones, ni peticiones de vídeo. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición completa del dataset ni si se aplicaron RLHF o DPO.

La innovación técnica destacable es el mecanismo de carga: `load_d3` sustituye el cargador del backbone por `d3q/`, de modo que transformers carga el checkpoint con los pesos empaquetados y cada proyección cuantizada se convierte en una capa que descomprime su peso int4 a BF16 con un único kernel Triton y multiplica en BF16. No requiere unidades matriciales especiales.

## Capacidades

- Clasificación zero-shot y decisión tipada: elección entre opciones (Choice), sí/no (Yes/No), puntuación en escala (Score), delimitación de cajas (Box) y seguimiento de objetos en vídeo (Track).
- Devuelve una probabilidad calibrada para cada respuesta posible, no texto libre, lo que facilita umbrales y agregación posterior.
- Entrada multimodal: texto o JSON, más imágenes y vídeos (varios por petición), con soporte de imágenes dentro de las propias preguntas y opciones.
- Detección de objetos y localización espacial en imágenes y vídeos.
- Procesamiento de múltiples preguntas en una sola lectura del estado (una pasada por petición).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; el modelo se posiciona explícitamente como "sistema uno" (una pasada, sin cadena de razonamiento).
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio: no disponible en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y un conjunto de preguntas de tipo Choice (equipo responsable) y Yes/No (urgencia), devolviendo probabilidades que permiten aplicar umbrales de derivación automática. La ventaja es que resuelve varias preguntas en una sola lectura del ticket.
- Moderación y verificación de contenido: clasificación zero-shot de textos o JSON contra criterios definidos en el momento, con probabilidad por categoría, útil para pipelines que necesitan scores calibrados y no generación libre.
- Control de calidad documental: preguntas Yes/No y Score sobre facturas, albaranes o formularios para detectar inconsistencias. Conviene tener en cuenta la pérdida de precisión en Box sobre recibos (0,793 frente a 0,957 del modelo completo), por lo que para localización fina en documentos es preferible d3-ultra-FP8.
- Detección y localización de objetos en imágenes: peticiones de tipo Box para señalar elementos concretos en una imagen con varias preguntas simultáneas (por ejemplo, localizar varios objetos en una misma escena). Adecuado para inventario visual o inspección, con la salvedad de la caída de 3,4 puntos en Box a IoU 0,5.
- Seguimiento de objetos en vídeo: peticiones de tipo Track para monitorizar un objeto a lo largo de un clip, con AUC de éxito de 0,754/0,757 en el conjunto público, útil en analítica de vídeo y vigilancia con requisitos moderados de precisión.
- Cuestionarios y evaluación visual con imágenes en opciones: comparar una imagen de referencia con varias alternativas (por ejemplo, identificar qué grabado reproduce un edificio) usando assets incrustados en las opciones; el rendimiento en imágenes en preguntas y opciones se mantiene en 0,941 frente a 0,952 del modelo completo.
- Despliegue en entornos con VRAM limitada: al ocupar 17,6 GB de pesos en lugar de 52,2 GB, permite servir el modelo en una sola GPU con menos memoria, a costa de una latencia algo mayor (67 ms frente a 51 ms de mediana por pregunta de texto en un AMD Instinct MI300X).

## Benchmarks y rendimiento

| Benchmark | d3-ultra-INT4 | d3-ultra (referencia) |
|---|---|---|
| Jev Decision Index 0.3 (suite pública) | 71,47 | 71,57 |
| Coincidencia con la respuesta top de d3-ultra (272.229 preguntas) | 98,6% | — |
| Suite pública de visión | 74,40 | 75,35 |
| Coincidencia con la respuesta top de d3-ultra (12.210 preguntas de visión) | 95,8% | — |
| Imágenes en preguntas y opciones | 0,941 | 0,952 |
| Tracking success AUC | 0,754 / 0,757 | 0,778 / 0,782 |
| Box accuracy a IoU 0,5 | 0,836 | 0,870 |
| Box en recibos | 0,793 | 0,957 |
| Box en capturas de pantalla | 0,961 | 0,999 |
| Latencia mediana, una pregunta de texto (MI300X) | 67 ms | 51 ms |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible, lo que es coherente con la naturaleza del modelo (clasificación y decisión, no generación de texto).

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 17,6 GB en disco en int4; con overhead de activaciones en BF16, caché KV y runtime conviene prever un margen adicional, aunque la cifra exacta de VRAM pico no está disponible en la información proporcionada.
- GPU recomendadas: el modelo fue medido en una AMD Instinct MI300X; no se especifican otras GPU validadas.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información disponible; el requisito de transformers 5.17.0, compressed-tensors 0.17 y kernels Triton propios hace aconsejable validar el despliegue antes de asumirlo.
- Opciones de despliegue: carga mediante `load_d3` del runtime propio (`d3q/`) con transformers; se puede instalar `flash-linear-attention` como aceleración opcional de las capas de atención lineal. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: 67 ms de mediana por pregunta de texto individual en un MI300X, frente a 51 ms del modelo completo; el ahorro es de memoria, no de tiempo. Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Pesos en disco | Licencia | Notas |
|---|---|---|---|---|---|
| d3-ultra-INT4 | 26,09B | No disponible | 17,6 GB | Apache-2.0 | Cuantización int4 W4A16; pierde 3,4 puntos en Box |
| d3-ultra | 26,09B (aprox., mismo backbone) | No disponible | 52,2 GB | Apache-2.0 | Modelo de referencia completo; mejor Box y menor latencia |
| d3-ultra-FP8 | No disponible | No disponible | No disponible | Apache-2.0 (presumible, no confirmado) | Mantiene Box y es más rápido que INT4, según la model card |
| d3-turbo-INT4 | No disponible | No disponible | No disponible | No disponible | Variante turbo cuyos datos de calibración se reutilizan aquí |

No se dispone de información sobre modelos de decisión multimodales de otros desarrolladores que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Pérdida de precisión en detección por cajas: 0,836 frente a 0,870 a IoU 0,5, con caídas pronunciadas en recibos (0,793 frente a 0,957) y capturas de pantalla (0,961 frente a 0,999). Para tareas de Box sobre documentos o pantallas, la model card recomienda explícitamente usar d3-ultra-FP8.
- Latencia superior al modelo completo: 67 ms frente a 51 ms de mediana por pregunta de texto; la cuantización ahorra memoria, no tiempo.
- Modelo de "sistema uno": no genera cadenas de razonamiento ni texto libre; su salida son probabilidades sobre preguntas predefinidas, lo que limita su uso a tareas de clasificación y decisión estructuradas.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con entradas largas.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe sin validación previa.
- Riesgo de alucinación y sesgos: no se han publicado análisis específicos en la información disponible; al devolver probabilidades, el riesgo se traslada a calibración y umbrales mal ajustados.
- Datos de calibración limitados (832 peticiones, sin vídeo), lo que puede afectar a la calibración de los pesos cuantizados en dominios alejados de esa distribución.
- Requiere versiones muy concretas de dependencias (transformers 5.17.0, compressed-tensors 0.17 o superior) y código personalizado, lo que complica la integración en stacks estándar.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones del modelo base d3-ultra.
- Popularidad muy baja en el momento de la ficha (2 descargas, 1 like), lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/d3-ultra-INT4
- Modelo base d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
- Variante FP8: https://huggingface.co/vllm-sr/d3-ultra-FP8
- Variante turbo cuantizada: https://huggingface.co/vllm-sr/d3-turbo-INT4
- Dataset de calibración: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
