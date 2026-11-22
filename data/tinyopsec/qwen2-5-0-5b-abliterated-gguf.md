# tinyopsec/Qwen2.5-0.5B-abliterated-GGUF

## Resumen

Qwen2.5-0.5B-abliterated-GGUF es la distribucion en formato GGUF del checkpoint `sbussiso/Qwen2.5-0.5B-abliterated`, una version "abliterada" (con los mecanismos de rechazo suprimidos mediante edicion de pesos) del modelo Qwen2.5-0.5B-Instruct de Alibaba. El autor de esta publicacion, tinyopsec, se limita a generar las cuantizaciones con llama.cpp y a distribuirlas; no entrena ni modifica el modelo original. El resultado es un modelo de 630.167.424 parametros (0,63 mil millones) en formato de pesos GGUF, listo para ejecutarse en CPU o GPU de gama baja mediante llama.cpp, Ollama, LM Studio o koboldcpp.

La relevancia de esta ficha es doble. Por un lado, ofrece un modelo conversacional extremadamente ligero (menos de 1 GB en F16, unos pocos cientos de MB en Q4_K_M) que cabe en cualquier equipo, incluidos moviles y sistemas embebidos. Por otro, el proceso de abliteration elimina la capa de rechazo del modelo instruct original, lo que lo convierte en una herramienta de investigacion sobre alineamiento y seguridad, no en un asistente de produccion. La licencia Apache 2.0 permite uso comercial, pero el propio autor advierte de que se trata de un modelo de investigacion sin censura y que debe evaluarse antes de usarlo.

Arquitectura transformer decoder-only de Qwen2 con 0,63 mil millones de parametros, contexto de 32.768 tokens en el modelo base (heredado de Qwen2.5), soporte multilingue (28 idiomas en el modelo original) y un unico checkpoint base. Esta publicacion concreta no aporta datos adicionales de entrenamiento ni benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en Qwen2.5-0.5B-Instruct |
| Parametros totales | 630.167.424 (0,63 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-0.5B-Instruct; no verificada en esta publicacion) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible en esta publicacion (el modelo base Qwen2.5 soporta 28 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generados con llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de Qwen2 con atencion causal estandar, RoPE y normalizacion RMSNorm. Sobre ese checkpoint, el autor intermedio (`sbussiso`) aplico una tecnica de abliteration: se identifican las direcciones de activacion asociadas al rechazo y se proyectan fuera de los pesos de atencion y MLP, de modo que el modelo pierde la tendencia a negarse a responder. Esta publicacion de tinyopsec no entrena ni ajusta el modelo: unicamente lo convierte a GGUF y genera 13 variantes de cuantizacion con llama.cpp.

No se dispone de informacion sobre el dataset de abliteration, el numero de tokens utilizados ni si hubo RLHF o DPO adicional en esta version. El modelo original Qwen2.5-0.5B-Instruct fue entrenado por Alibaba con datos multilingues y ajuste por instrucciones, pero esos detalles no se reproducen en esta publicacion. La innovacion tecnica destacable es la propia abliteration y la disponibilidad de cuantizaciones de 2 a 16 bits para distintos presupuestos de memoria.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat (heredado de Qwen2.5-Instruct).
- Razonamiento basico y respuesta a instrucciones simples; capacidad limitada por el tamano de 0,63 B.
- Generacion de codigo y matematicas a nivel basico, sin garantias de correccion en tareas complejas.
- Soporte multilingue heredado del modelo base (28 idiomas en Qwen2.5), aunque no documentado en esta publicacion.
- Respuestas sin rechazo: la abliteration elimina la capa de negativa del modelo instruct original.
- Compatible con tool calling y function calling en la medida en que lo sea Qwen2.5-0.5B-Instruct (no verificado en esta cuantizacion).
- Sin capacidades de vision, audio ni modo thinking explicito.
- Ejecutable en llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a las respuestas ante prompts sensibles, comparando el checkpoint abliterado con el Qwen2.5-0.5B-Instruct original en un entorno controlado y con fines academicos.
- Prototipado rapido de chatbots en local: con Q4_K_M (unos pocos cientos de MB) se puede levantar un asistente conversacional en un portatil sin GPU, ideal para validar flujos de UI antes de invertir en modelos mayores.
- Generacion de texto en dispositivos con recursos limitados: Raspberry Pi, moviles o sistemas embebidos pueden ejecutar el modelo en CPU gracias a su tamano reducido y a las cuantizaciones Q2_K y Q3_K.
- Clasificacion y etiquetado de texto simple: tareas de extraccion de entidades, categorizacion o resumen corto donde no se requiere un modelo grande y se prioriza baja latencia y coste cero.
- Educacion y demostraciones: sirve para explicar en clase como funciona un transformer, la cuantizacion GGUF y el proceso de abliteration, ejecutandolo en hardware asequible.
- Filtrado y preprocesado en pipelines: generar borradores, reformatear texto o producir datos sinteticos de bajo coste antes de pasarlos a un modelo mayor.
- Pruebas de robustez y red teaming: evaluar como responde un modelo sin censura ante prompts adversarios, siempre en entornos aislados y con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ~1,3 GB; Q8_0 ~0,7 GB; Q6_K ~0,55 GB; Q5_K_M ~0,45 GB; Q4_K_M ~0,4 GB; Q3_K_M ~0,3 GB; Q2_K ~0,25 GB (estimaciones a partir de 630 M parametros; el repo ocupa 7,2 GB en total por incluir las 13 variantes).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan sin problema, pero estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas, incluidas GTX 1050 Ti, RTX 2050 y graficas integradas con memoria compartida.
- Cabe en CPU: si, con llama.cpp en CPU pura; incluso en Raspberry Pi 4/5 con cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, en CPU moderna se esperan decenas de tokens por segundo en Q4_K_M, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Qwen2.5-0.5B-abliterated-GGUF | 0,63 B | 32.768 (heredado) | Apache 2.0 | GGUF | Sin censura, 13 cuantizaciones |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo oficial con alineamiento |
| sbussiso/Qwen2.5-0.5B-abliterated | 0,63 B | 32.768 (heredado) | Apache 2.0 | safetensors | Checkpoint abliterado sin cuantizar |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 | Llama 3.2 Community | safetensors, GGUF | Mayor contexto y calidad, licencia restrictiva |

## Limitaciones y advertencias

- La abliteration suprime los rechazos: el modelo puede generar contenido toxico, ilegal o danino sin filtros. No debe exponerse a usuarios finales sin moderacion externa.
- Riesgo elevado de alucinacion: con 0,63 B de parametros, la coherencia y la factualidad son limitadas; no es apto para tareas que requieran precision.
- Capacidad de razonamiento y codigo muy por debajo de modelos de 7 B o mas; fallara en tareas multi-paso complejas.
- Idiomas soportados no documentados en esta publicacion; el rendimiento fuera del ingles y el chino puede degradarse.
- La longitud de contexto de 32.768 tokens es la del modelo base y no se ha verificado en esta cuantizacion; las cuantizaciones de 2 y 3 bits pueden degradar la calidad de forma notable.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte de que es un modelo de investigacion y recomienda evaluarlo antes de usarlo.
- No hay garantias de soporte ni mantenimiento por parte del autor; el repositorio tiene 0 likes y 697 descargas en el momento de la consulta.
- El uso de un modelo sin censura puede violar las politicas de plataformas de despliegue (Hugging Face Inference Endpoints, proveedores cloud con filtros) y acarrear responsabilidad legal segun la jurisdiccion.

## Enlaces

- Hugging Face: https://huggingface.co/tinyopsec/Qwen2.5-0.5B-abliterated-GGUF
- Modelo base intermedio: https://huggingface.co/sbussiso/Qwen2.5-0.5B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
