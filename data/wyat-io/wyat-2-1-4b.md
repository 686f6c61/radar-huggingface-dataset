# wyat-io/wyat-2-1.4b

## Resumen

Wyat-2-1.4B es un modelo de decisión local desarrollado por wyat-io, construido sobre ByteDance/Ouro-1.4B, un Universal Transformer con profundidad recurrente. A diferencia de un modelo de lenguaje generativo convencional, Wyat no produce texto libre: recibe una entrada y un conjunto de opciones definidas por el desarrollador, y devuelve respuestas estructuradas con distribuciones de probabilidad sobre los candidatos suministrados.

El problema que resuelve es la toma de decisiones automática y clasificación en local: enrutar solicitudes, verificar afirmaciones o puntuar entradas contra rúbricas ordenadas, sin depender de APIs externas ni de generación de texto no determinista. Implementa tres tareas: *choice* (selección de una opción con su distribución de probabilidad), *noul* (estimación de la probabilidad de que una afirmación sea verdadera) y *score* (valoración ordinal contra una rúbrica).

Técnicamente, el modelo congela los pesos base de Ouro-1.4B y añade adaptadores LoRA por paso recurrente junto con una cabeza de puntuación escalar en FP32. Es relevante porque propone un paradigma alternativo a la generación libre para tareas de clasificación y enrutado, con ejecución viable en hardware de consumo, incluidos Mac con Apple Silicon (MPS) y GPU NVIDIA de gama media como la RTX 4070 Ti. Soporta entradas en inglés y francés y se distribuye bajo licencia Apache 2.0 en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Universal Transformer con profundidad recurrente (base ByteDance/Ouro-1.4B) + adaptadores LoRA por paso recurrente + cabeza de puntuacion escalar FP32 |
| Parametros totales | 1.4B (aproximados, heredados del modelo base; total exacto con adaptadores no disponible) |
| Parametros activos | no disponible (no se declara si es MoE; la recurrente no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (ejecucion en FP32 en Mac; BF16 en CUDA para el backbone) |
| Idiomas soportados | Ingles, frances |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,9 GB, incluye runtime empaquetado) |

## Arquitectura y entrenamiento

El modelo base es ByteDance/Ouro-1.4B, un Universal Transformer con profundidad recurrente: en lugar de apilar capas distintas, el modelo reutiliza un bloque compartido a lo largo de varios pasos recurrentes. Wyat-2-1.4B configura 4 pasos recurrentes con contexto compartido y 2 pasos para la evaluacion de candidatos. Sobre esta base se anaden adaptadores LoRA especificos por paso recurrente y una cabeza de puntuacion escalar en FP32; los pesos originales del modelo base permanecen congelados, de modo que el ajuste se limita a los adaptadores y a la cabeza.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens, ni el uso de tecnicas como RLHF o DPO. Como innovacion de ejecucion destacable, el loader incluido reproduce lotes cortos de candidatos con formas repetitivas como CUDA graphs para acelerar la inferencia en NVIDIA; si la variable `PYTORCH_CUDA_ALLOC_CONF` incluye `expandable_segments`, la captura de grafos falla y el sistema cae silenciosamente a puntuacion eager, con resultados identicos pero menor velocidad. En Mac, el modelo verifica la memoria disponible antes de cargar y antes de cada peticion, emitiendo un `MemoryHeadroomWarning` si el uso podria superar el 90% de la RAM.

## Capacidades

- Tarea *choice*: selecciona una opcion de un menu definido por el usuario y devuelve la distribucion de probabilidad completa sobre los candidatos.
- Tarea *noul*: estima la probabilidad de que una afirmacion suministrada sea verdadera (devuelve `probability_true`).
- Tarea *score*: puntua una entrada contra una rubrica ordinal y devuelve el valor ordinal esperado (`expected_ordinal_value`).
- Preguntas multiples sobre una misma entrada: el metodo `model.predict()` permite resolver varias preguntas tipadas sobre un mismo registro en una sola llamada.
- Clasificacion de texto y datos estructurados sin generacion de texto libre, lo que aporta salidas deterministas y estructuradas.
- Soporte de entradas en ingles y frances.
- Ejecucion local multiplataforma: CUDA (NVIDIA), Apple MPS y CPU.
- No disponible: no hay evidencia de capacidades de vision, audio, tool calling ni razonamiento multi-paso tipo agente.

## Casos de uso

- Enrutado de solicitudes de atencion al cliente: dada una consulta del cliente, el modelo elige el equipo adecuado (soporte de entregas, facturacion, etc.) devolviendo la distribucion de probabilidad, util para triaje automatico con umbral de confianza.
- Clasificacion de incidencias por urgencia: mediante la tarea *score* con niveles ordenados (rutinaria, sensible al tiempo, emergencia), se obtiene un valor ordinal esperado para priorizar colas de trabajo.
- Verificacion ligera de afirmaciones: la tarea *noul* estima la probabilidad de verdad de una declaracion, aplicable a validacion de datos de entrada o deteccion de incoherencias en pipelines.
- Moderacion y filtrado de contenido: clasificacion binaria o multiclase de mensajes contra criterios definidos por el equipo, sin exponer datos a APIs externas.
- Extraccion de decisiones estructuradas en flujos RPA o automatizaciones: la salida tipada (eleccion, probabilidad, valor ordinal) se integra directamente en logica de negocio sin parsing de texto libre.
- Ejecucion en dispositivos locales o entornos sensibles a la privacidad: al funcionar en Mac (MPS/CPU) o GPU de consumo, permite decisiones on-device sin enviar datos a terceros.
- Evaluacion de respuestas en sistemas RAG: puntuar candidatos recuperados o respuestas generadas contra una rubrica ordinal antes de presentarlas al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la etiqueta `eval-results`, pero no contiene tablas de metricas comparables (MMLU, HumanEval, GSM8K, etc.). Las probabilidades devueltas son explicitamente candidatas-relativas y "no confianza calibrada establecida", segun el propio autor.

## Requisitos de hardware

- Mac (Apple Silicon o CPU): ejecucion con backbone, adaptadores y cabeza de puntuacion en FP32 mediante PyTorch MPS; no requiere conversion a MLX. Se recomienda vigilar la RAM: el modelo avisa si el uso podria superar el 90% de la memoria disponible.
- NVIDIA CUDA: GPU con soporte BF16. La evaluacion oficial del autor se realizo con una RTX 4070 Ti de 12 GB de VRAM, por lo que una GPU de consumo de 12 GB es suficiente. Stack de referencia: Python 3.12.13, PyTorch 2.8.0 / CUDA 12.8, Transformers 4.57.6.
- CPU: soportado mediante `--device cpu`, con latencia mayor no cuantificada.
- Tamano del repositorio: 2,9 GB (incluye runtime empaquetado ademas de pesos, tokenizer y manifest).
- Despliegue: mediante el runtime incluido en el propio repositorio (`wyat.load`), con `huggingface_hub` para la descarga. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser un modelo generativo convencional, es probable que estos runtimes no sean aplicables directamente.
- Latencia y throughput: no disponible (no se publican cifras; se indica solo que CUDA graphs aceleran los lotes cortos de candidatos repetitivos).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia |
|---|---|---|---|---|
| Wyat-2-1.4B | Modelo de decision (clasificacion estructurada) | 1.4B (base) | Devuelve distribuciones sobre candidatos suministrados, sin generacion libre | Apache 2.0 |
| ByteDance/Ouro-1.4B (base) | LLM generativo (Universal Transformer recurrente) | 1.4B | Generacion de texto causal; pesos base congelados en Wyat | no disponible |
| DeBERTa-v3-base / clasificadores BERT afinados | Codificador para clasificacion | ~86M-400M | Clasificacion con cabeza fija, menos flexible para rubricas dinamicas | Apache 2.0 / MIT |

Wyat se diferencia de los clasificadores tradicionales en que los candidatos y criterios se definen en tiempo de ejecucion (menu de opciones, rubricas ordinales, afirmaciones a verificar) sin reentrenar cabezas de clasificacion, y de los LLM generativos en que no produce texto libre, lo que elimina la necesidad de parsing y reduce la variabilidad de salida. No hay disponibles comparativas numericas de rendimiento publicadas.

## Limitaciones y advertencias

- Las probabilidades devueltas son candidatas-relativas, no confianza calibrada: el propio autor advierte que no deben tratarse como probabilidades calibradas establecidas; conviene validar umbrales empiricamente en cada dominio.
- Soporte de idiomas limitado a ingles y frances; el castellano no figura entre los idiomas declarados.
- Longitud de contexto no publicada, lo que dificulta planificar entradas largas.
- No hay benchmarks publicados que permitan comparar su precision con alternativas.
- En Mac, el uso intensivo de memoria puede superar el 90% de la RAM disponible; el modelo emite avisos pero sigue ejecutandose salvo que se configure `max_resource_fraction`.
- En CUDA, la configuracion `expandable_segments` en `PYTORCH_CUDA_ALLOC_CONF` desactiva silenciosamente la aceleracion por CUDA graphs (los resultados no cambian, solo la velocidad).
- Al no generar texto libre, el modelo no es sustituto de un LLM para tareas de redaccion, resumen o conversacion.
- Riesgo de alucinacion: no aplicable en el sentido generativo, pero errores de clasificacion y probabilidades mal calibradas siguen siendo posibles; no hay datos publicados sobre sesgos del modelo.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Proyecto con 0 descargas registradas en Hugging Face en el momento de redactar la ficha: madurez y adopcion comunitaria limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyat-io/wyat-2-1.4b
- Modelo base: https://huggingface.co/ByteDance/Ouro-1.4B
- Sitio web: https://wyat.io
- Libreria Python (GitHub): https://github.com/teilomillet/wyat
- Documentacion: https://github.com/teilomillet/wyat/blob/main/docs/README.md
