# tinyopsec/Privasis-Cleaner-4B-GGUF

## Resumen

Privasis-Cleaner-4B-GGUF es la distribucion en formato GGUF del modelo nvidia/Privasis-Cleaner-4B, publicada por el usuario tinyopsec. El modelo base lo desarrolla NVIDIA y esta especializado en la limpieza y el tratamiento de datos personales identificables (PII): deteccion, redaccion y saneado de texto para entornos con requisitos de privacidad. Esta version GGUF permite ejecutar el modelo en CPU o en GPU de gama de consumo mediante llama.cpp, sin necesidad de infraestructura de centro de datos.

El modelo tiene 4.022.468.096 parametros (aproximadamente 4B) y esta construido sobre la familia Qwen3, segun las etiquetas del repositorio. El autor ofrece trece cuantizaciones distintas, desde F16 hasta Q2_K, lo que facilita el despliegue en un rango amplio de hardware. El repositorio ocupa 39,3 GB en total porque incluye todas las variantes.

Su relevancia actual radica en que combina un caso de uso muy concreto y regulado (anonimizacion de datos personales, cumplimiento de RGPD y normativas equivalentes) con un formato de pesos ligero y portable. Es util para equipos que necesitan procesar texto sensible en local, sin enviar datos a APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun etiquetas del repositorio) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (no comercial), heredada del modelo base |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni el proceso de entrenamiento. Las etiquetas del repositorio identifican el modelo como perteneciente a la familia Qwen3, lo que apunta a un transformer denso de aproximadamente 4B parametros, pero no se confirma el numero de capas, dimensiones ocultas ni el mecanismo de atencion. Tampoco se especifica si se aplicaron tecnicas de alineacion como RLHF o DPO, ni la composicion del dataset de entrenamiento.

La informacion disponible unicamente confirma que el modelo base es nvidia/Privasis-Cleaner-4B y que esta version se ha cuantizado con llama.cpp. El nombre y las etiquetas (privacy, pii) indican que el entrenamiento esta orientado a tareas de deteccion y saneado de datos personales, pero no se aportan cifras de tokens de entrenamiento ni detalles sobre el corpus utilizado.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Deteccion y tratamiento de informacion personal identificable (PII), segun la orientacion declarada del modelo base.
- Limpieza y redaccion de texto sensible, presumiblemente orientada a anonimizacion.
- Compatible con endpoints (etiqueta endpoints_compatible).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Anonimizacion de documentos antes de compartirlos: el modelo puede procesar textos con nombres, direcciones o identificadores y sustituirlos por marcadores, lo que permite compartir corpus internos con terceros sin exponer datos personales.
- Cumplimiento del RGPD en pipelines de datos: integrado como paso previo al almacenamiento o al analisis, ayuda a reducir el riesgo de tratar datos personales sin base legal.
- Saneado de logs y trazas de aplicaciones: permite eliminar correos, telefonos y numeros de identificacion de registros antes de enviarlos a sistemas de observabilidad o de soporte.
- Preprocesado de datasets para entrenamiento: util para limpiar corpus propios antes de usarlos en ajuste fino, reduciendo la probabilidad de memorizar PII en modelos posteriores.
- Despliegue en local o en el borde: al estar en GGUF, puede ejecutarse en estaciones de trabajo o portatiles sin conexion, lo que encaja con entornos donde los datos no pueden salir de la infraestructura propia.
- Prototipado rapido con llama.cpp u Ollama: las multiples cuantizaciones permiten probar el modelo en hardware modesto antes de decidir una integracion en produccion.
- Filtrado en herramientas de atencion al cliente: puede marcar o eliminar datos personales en transcripciones de conversaciones antes de su analisis agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y pesos de 4B parametros): F16 en torno a 8 GB; Q8_0 en torno a 4,5 GB; Q5_K_M en torno a 3 GB; Q4_K_M en torno a 2,5 GB; Q3_K_M en torno a 2 GB; Q2_K en torno a 1,5 GB. Estas cifras son estimaciones por tamano de pesos y no incluyen la memoria adicional para el contexto KV.
- GPU recomendadas: para F16, una GPU con 12-16 GB (RTX 4070 Ti, RTX 4080, A10); para Q4_K_M o Q5_K_M, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: si, en practicamente todas las cuantizaciones desde Q5_K_M hacia abajo; las variantes Q2 y Q3 caben incluso en GPUs de 4-6 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, y cualquier runtime compatible con GGUF. No se confirma soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Como referencia estructural, el modelo base pertenece a la familia Qwen3 de aproximadamente 4B parametros, pero no se han publicado cifras que permitan una comparacion rigurosa con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Privasis-Cleaner-4B-GGUF | 4.022.468.096 | no disponible | NVIDIA (no comercial) | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no comercial: la NVIDIA License heredada del modelo base restringe el uso comercial. Cualquier integracion en producto o servicio requiere revisar los terminos y, probablemente, obtener una licencia aparte.
- Sesgos: no se documentan evaluaciones de sesgo ni de robustez; el modelo puede heredar sesgos del corpus de entrenamiento del modelo base.
- Riesgo de alucinacion: como todo modelo generativo, puede producir texto plausible pero incorrecto, lo que en tareas de anonimizacion puede traducirse en PII no detectada o en modificaciones no deseadas del contenido.
- Cobertura de idiomas desconocida: no se especifican los idiomas soportados, por lo que el rendimiento fuera del ingles (o del idioma principal de entrenamiento) es incierto.
- Longitud de contexto desconocida: no se indica la ventana de contexto, lo que complica planificar el procesado de documentos largos.
- Ausencia de benchmarks: no hay evidencia publicada de precision en deteccion de PII, tasa de falsos positivos ni recall, datos criticos para un caso de uso con implicaciones legales.
- Cuantizaciones agresivas: las variantes Q2_K y Q3 pueden degradar la calidad en una tarea sensible como la deteccion de entidades; conviene validar con datos propios antes de usarlas en produccion.
- Modelo comunitario: la publicacion la realiza un usuario (tinyopsec) y no NVIDIA directamente; conviene verificar la integridad de los ficheros GGUF frente al modelo base original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Privasis-Cleaner-4B-GGUF
- Modelo base: https://huggingface.co/nvidia/Privasis-Cleaner-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
