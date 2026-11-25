# turion-ai/turion-jev-31b-GGUF

## Resumen

Turion Jev 31B es un modelo de decisión desarrollado por Turion AI. A diferencia de un modelo generativo convencional, recibe un estado (texto libre) y un conjunto de preguntas tipadas (elección múltiple, sí/no o puntuación 0-5) y devuelve una probabilidad para cada opción en un único forward pass. No genera texto: su salida es una distribución de probabilidad sobre las alternativas de cada pregunta.

El modelo base cuenta con 30.697.345.596 parámetros y este repositorio distribuye su versión cuantizada en formato GGUF para su uso con llama.cpp. La model card lo etiqueta como "system-one" y "decision-index", lo que sugiere un enfoque de inferencia rápida y directa orientada a enrutamiento y clasificación, en contraste con el razonamiento multi-paso de los modelos generativos. No se especifica la arquitectura interna del transformer ni la longitud de contexto nativa del modelo base.

La relevancia de este modelo reside en su enfoque: en lugar de forzar a un LLM generativo a producir una respuesta clasificatoria mediante prompting, expone las probabilidades de las opciones directamente desde los logits, lo que permite umbrales calibrados, integración en pipelines de enrutamiento y una latencia muy baja (mediana de 172-203 ms por petición en una NVIDIA H200 según el autor).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles); modelo de decisión con lectura de logits sobre códigos de opción |
| Parámetros totales | 30.697.345.596 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens por defecto en el servidor GGUF (`--n-ctx`); las peticiones más largas se rechazan, no se truncan |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0 (y pesos BF16 en el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos originales BF16 en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna (tipo de atención, número de capas, uso de MoE o componentes híbridos) ni sobre el dataset de entrenamiento, el número de tokens o las técnicas de alineación (RLHF/DPO) empleadas. La model card únicamente describe el mecanismo de inferencia: la respuesta se lee de los logits de los códigos de opción tras un prompt fijo y luego se escala mediante una temperatura específica por tipo de pregunta. Los ficheros auxiliares (`prompt_config.json`, `calibration.json`, tokenizador y el paquete `turion_jev`) implementan la construcción del prompt y la lectura de logits a través de llama-cpp-python.

La innovación destacable es el modo de decisión: en lugar de muestrear un token (como haría una llamada de chat completion, perdiendo las probabilidades), el sistema interpreta la distribución completa sobre las opciones, lo que permite obtener una probabilidad calibrada por alternativa. El autor reporta una métrica propia, "Proxy Full" (0,6 × dominios vistos + 0,4 × dominios nuevos sobre conjuntos de validación de 300 preguntas por conjunto, corregida por azar), con valores de 85,92 para Q4_K_M, 85,19 para Q5_K_M, 84,65 para Q8_0 y 85,20 para los pesos BF16.

## Capacidades

- Clasificación y decisión sobre texto: devuelve probabilidades para preguntas de elección múltiple, sí/no y puntuación 0-5.
- Enrutamiento y triaje: asignación de un estado a una categoría (por ejemplo, equipo de atención al cliente).
- Lectura de probabilidades calibradas por tipo de pregunta mediante temperaturas específicas.
- Soporte de múltiples preguntas simultáneas en una sola petición (el ejemplo de la model card combina `team` y `urgent`).
- Integración con llama.cpp mediante el paquete `turion_jev` y un servidor compatible con `POST /v1/systemone` (TypeSafe).
- No genera texto libre ni mantiene conversaciones multi-turno.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- Tool calling, agentes y visión: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de que corresponda a facturación, soporte técnico, ventas u otro equipo, con umbrales ajustables para derivación automática. Adecuado por su latencia (172-203 ms en H200) y por exponer probabilidades en lugar de una etiqueta única.
- Priorización de urgencias: preguntas de tipo sí/no ("¿requiere respuesta hoy?") permiten clasificar correos o mensajes entrantes con una probabilidad calibrada, útil para colas de atención.
- Enrutamiento en pipelines de agentes: usar el modelo como "system-one" para decidir qué herramienta o subagente invoca un sistema mayor, reduciendo el coste frente a un LLM generativo en cada paso de decisión.
- Moderación y etiquetado de contenido: clasificación de textos según criterios definidos como preguntas de elección múltiple o escala 0-5, con salida probabilística para revisión humana en los casos límite.
- Encuestas y anotación asistida: puntuación 0-5 de reseñas o comentarios según criterios configurables, aprovechando la calibración por tipo de pregunta.
- Decisión sobre estados estructurados: al aceptar texto libre como estado, puede aplicarse a registros de CRM, logs o descripciones de incidencias para clasificarlos en categorías operativas.
- Despliegue local en hardware de consumo: la cuantización Q4_K_M (18,69 GB) permite ejecutar el modelo en GPUs con 24 GB de VRAM, habilitando clasificación sensible a la privacidad sin enviar datos a la nube.

## Benchmarks y rendimiento

El autor publica una métrica propia ("Proxy Full") en lugar de benchmarks estándar. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

| Modelo / cuantización | Proxy Full | Tiempo de petición (mediana, 1 petición, NVIDIA H200) |
|---|---:|---:|
| turion-jev-31b-Q4_K_M | 85,92 | 195 ms |
| turion-jev-31b-Q5_K_M | 85,19 | 203 ms |
| turion-jev-31b-Q8_0 | 84,65 | 172 ms |
| Pesos BF16 (referencia) | 85,20 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19-20 GB para Q4_K_M (fichero de 18,69 GB), 22-23 GB para Q5_K_M (21,85 GB) y 33-34 GB para Q8_0 (32,64 GB), más overhead de contexto.
- GPU recomendadas: NVIDIA H200 (mediciones del autor), A100 40/80 GB, H100; para Q8_0 se requiere al menos 40 GB de VRAM.
- GPU de consumo: Q4_K_M cabe en GPUs de 24 GB (RTX 3090, RTX 4090); Q5_K_M es ajustado en 24 GB; Q8_0 no cabe en GPUs de consumo habituales.
- Opciones de despliegue: llama.cpp mediante el paquete `turion_jev` (backend `gguf`) y el servidor `python -m turion_jev.serve`; no se documenta soporte de vLLM, TGI u Ollama.
- Latencia: mediana de 172-203 ms por petición en una NVIDIA H200 según el autor; no se publican datos de throughput con concurrencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (modelos de decisión con salida probabilística) en la documentación proporcionada. Como referencia de tamaño, el modelo base (31B) se sitúa en la categoría de modelos densos de 30-34B, pero sus capacidades (clasificación probabilística sin generación de texto) no son directamente comparables con LLMs generativos de ese tamaño.

| Modelo | Parámetros | Contexto | Salida | Licencia |
|---|---:|---|---|---|
| turion-jev-31b-GGUF | 30,7B | 16.384 tokens (servidor GGUF) | Probabilidades por opción | Apache-2.0 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no mantiene conversaciones y no puede usarse como chat completion sin perder las probabilidades.
- Las peticiones que superan el contexto configurado (16.384 tokens por defecto) se rechazan en lugar de truncarse; hay que dimensionar `--n-ctx` en consecuencia.
- La métrica "Proxy Full" es propia del autor y no equivale a benchmarks estándar; no permite comparación directa con otros modelos.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; al tratarse de un clasificador, el riesgo principal es una calibración deficiente en dominios no vistos.
- La calibración depende de los ficheros `calibration.json` y `prompt_config.json`; modificarlos o usar prompts distintos puede degradar las probabilidades.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los ficheros `LICENSE` y `NOTICE` del repositorio.
- El repositorio tiene 203 descargas y 0 likes en el momento de la consulta; el ecosistema y la validación externa son limitados.
- No se documenta soporte para vLLM, TGI u otros servidores de inferencia de alto rendimiento; el despliegue está orientado a llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/turion-ai/turion-jev-31b-GGUF
- Modelo base: https://huggingface.co/turion-ai/turion-jev-31b
- Fichero Q4_K_M: https://huggingface.co/turion-ai/turion-jev-31b-GGUF/blob/main/turion-jev-31b-Q4_K_M.gguf
- Fichero Q5_K_M: https://huggingface.co/turion-ai/turion-jev-31b-GGUF/blob/main/turion-jev-31b-Q5_K_M.gguf
- Fichero Q8_0: https://huggingface.co/turion-ai/turion-jev-31b-GGUF/blob/main/turion-jev-31b-Q8_0.gguf
