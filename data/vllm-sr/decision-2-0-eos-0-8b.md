# vllm-sr/Decision-2.0-Eos-0.8B

## Resumen

Decision-2.0-Eos-0.8B es un modelo de decisión de 0,75B parámetros publicado por vllm-sr, la organización asociada al proyecto vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto plano o JSON) junto con un conjunto de preguntas estructuradas y devuelve, en una sola pasada hacia delante, una probabilidad por cada opción de respuesta, sin producir texto. Admite tres tipos de pregunta: elección entre varias alternativas (choice), respuesta binaria sí/no y puntuación sobre una escala definida por el usuario (score).

Se trata de un fine-tune de Decision-1.0-Eos-0.8B, con una ventana de contexto de 16.384 tokens, licencia Apache-2.0 y pesos en safetensors. Su propuesta técnica central es agrupar en una única inferencia todas las preguntas asociadas a un mismo estado, lo que reduce la latencia frente a encadenar llamadas independientes de clasificación.

El modelo resulta relevante para arquitecturas de enrutado y triaje: en lugar de invocar un LLM generativo para decidir a qué rama enviar una petición, se puede consultar a este modelo de 0,75B que responde en milisegundos. El autor reporta una mediana de 6,0 ms por petición de una sola pregunta sobre una única GPU, y una puntuación JevArena de 53,9, por delante de los tres modelos del mismo tamaño con los que se compara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decisión y feature-extraction expuesto mediante custom_code; el autor no detalla el backbone) |
| Parametros totales | 0,75B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline en transformers | feature-extraction |
| Tipos de decisión | choice, sí/no, score |
| Modelo base | vllm-sr/Decision-1.0-Eos-0.8B (finetune) |
| Tamano del repositorio | 2,0 GB |
| Requisito de libreria | transformers >= 5.17, torch, safetensors y trust_remote_code=True |

## Arquitectura y entrenamiento

El autor no publica la arquitectura interna del modelo. Por las etiquetas del repositorio (transformers, safetensors, custom_code) y su tarea declarada (feature-extraction y classification), se trata de un modelo transformer que expone una API propia mediante código remoto: el método `model.system_one(state=..., questions=...)`, que devuelve probabilidades por opción en lugar de tokens. El tag system-one apunta a la distinción de Kahneman entre decisión rápida e intuitiva (sistema 1) y razonamiento deliberado, es decir, el modelo está pensado para juicios inmediatos, no para cadenas de razonamiento.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. La model card sí menciona que los datos de entrenamiento fueron auditados a nivel de fila contra los elementos de test del Jev Decision Index, como garantía de que no hay contaminación entre entrenamiento y evaluación. La relación con el modelo base es de finetune sobre Decision-1.0-Eos-0.8B.

## Capacidades

- Toma de decisiones estructurada: clasificación entre varias opciones etiquetadas con criterios definidos por el usuario (tipo choice).
- Respuesta binaria sí/no sobre cualquier condición expresada en las instrucciones.
- Puntuación ordinal sobre una escala de niveles definida en la llamada (tipo score).
- Respuesta conjunta en una sola pasada: varias preguntas sobre el mismo estado se resuelven en un único forward pass, devolviendo una probabilidad para cada opción.
- Entrada multimodal a nivel de formato: acepta texto plano o JSON como estado de entrada.
- Salida probabilística sin generación de texto: devuelve distribuciones de probabilidad, no cadenas.
- Integración como pipeline de transformers (`transformers.pipeline("decision", ...)`).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode). Tampoco se detalla el soporte multilingüe.

## Casos de uso

- Enrutado semántico en gateways de LLM: dado un prompt de usuario, decidir en una sola pasada a qué modelo o rama (por ejemplo, modelo pequeño frente a modelo grande, o política de coste) debe enviarse la petición, gracias a la latencia de milisegundos y a la ventana de 16.384 tokens que permite incluir contexto de conversación.
- Triaje de tickets de soporte: clasificar la categoría del ticket (devoluciones, facturación, técnico), comprobar condiciones del tipo "¿el cliente tiene recibo?" y asignar una urgencia, todo en una única inferencia sobre el texto del caso.
- Moderación de contenido: responder sí/no a un conjunto de políticas simultáneamente (por ejemplo, si un mensaje contiene acoso, spam o datos personales) y obtener la probabilidad de cada categoría para fijar umbrales.
- Enrutado de intenciones en asistentes conversacionales: determinar la intención del turno con respuestas de elección entre un conjunto cerrado de skills registradas.
- Clasificación de documentos en pipelines de ingesta: etiquetar un documento en JSON por área, confidencialidad y urgencia antes de indexarlo.
- Filtros de calidad en generación de datos: puntuar pares pregunta/respuesta en una escala ordinal para descartar muestras de baja calidad en un pipeline de curación de dataset.
- Puerta de entrada en sistemas de agentes: decidir si una consulta es resoluble con una herramienta interna o requiere escalado a un humano, con salida probabilística que permite aplicar políticas de confianza.

## Benchmarks y rendimiento

| Modelo | JevArena ↑ | Human-labelled transfer ↑ | Jev Decision Index ↑ |
|---|---:|---:|---:|
| Decision-2.0-Eos-0.8B | 53,9 | 50,3 | 20,1 |
| Decision 1.0 Eos | 42,5 | 46,1 | 18,4 |
| Intern-Decision-0.8B | 43,5 | 38,2 | — |
| Kev-0.8B | 43,2 | 39,0 | — |

Notas sobre la evaluación, según el autor: todos los modelos responden los mismos prompts congelados y se puntúan de la misma forma, contando respuestas ausentes o inválidas como errores. "Human-labelled transfer" es la mediana del macro-F1 sobre 15 tareas etiquetadas por humanos (multiplicada por 100). El Jev Decision Index de Decision 2.0 se reproduce de forma independiente con el kit oficial 0.2.1 sobre los pesos publicados; el resto de valores proceden de una captura pública de la tabla a fecha 2026-09-28. No se publican resultados de benchmarks estándar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-2 GB en fp16/bf16, derivado de los 0,75B parámetros y del tamaño de repositorio de 2,0 GB. Es una estimación propia, no confirmada por el autor.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) es suficiente para los pesos en precisión nativa. También es viable en CPU para cargas de baja concurrencia.
- GPU recomendadas: no las especifica el autor. Para despliegue de alta concurrencia, cualquier GPU de datacenter reciente (A100, H100, L40S) sirve, pero no hay datos publicados de throughput.
- Despliegue: transformers >= 5.17 con `trust_remote_code=True`, y `pipeline("decision", ...)`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al requerir código remoto y no publicar pesos GGUF, la ruta soportada es transformers.
- Latencia: mediana de 6,0 ms por petición de una sola pregunta en una única GPU, según el autor.
- Throughput y consumo de memoria en producción: no disponible.
- Cuantizaciones listas para usar: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevArena | Transfer humano | Jev Decision Index | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Decision-2.0-Eos-0.8B | 0,75B | 16.384 | 53,9 | 50,3 | 20,1 | Apache-2.0 |
| Decision 1.0 Eos | no disponible | no disponible | 42,5 | 46,1 | 18,4 | no disponible |
| Intern-Decision-0.8B | 0,8B | no disponible | 43,5 | 38,2 | — | no disponible |
| Kev-0.8B | 0,8B | no disponible | 43,2 | 39,0 | — | no disponible |

Solo se dispone de los datos que aparecen en la tabla de evaluación del autor; no hay información sobre contexto, licencia ni parámetros exactos de los tres modelos competidores. La ganancia declarada frente a Decision 1.0 Eos es de +11,4 puntos en JevArena y +1,7 en el Jev Decision Index.

## Limitaciones y advertencias

- El modelo no genera texto: si el caso de uso requiere una explicación o una respuesta redactada, hay que combinarlo con un modelo generativo aparte.
- Idiomas soportados sin documentar. No hay evidencia publicada sobre su comportamiento fuera del inglés.
- Riesgo de sobreconfianza: al devolver probabilidades sin calibración documentada, los umbrales de decisión deben validarse con datos propios antes de llevarlo a producción.
- Riesgo de alucinación no evaluado en la información disponible; al no generar texto, el fallo se manifiesta como una clasificación errónea con probabilidad alta, no como una afirmación falsa.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código publicado por el autor al cargar el modelo. Conviene auditar el repositorio antes de desplegarlo en entornos sensibles.
- Las métricas JevArena y Jev Decision Index son específicas del autor y no son directamente comparables con benchmarks estándar (MMLU, GSM8K, etc.), por lo que no permiten situar el modelo frente al ecosistema general.
- La información disponible no detalla sesgos conocidos, composición del dataset de entrenamiento ni comportamiento en dominios fuera de la decisión estructurada.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y la atribución correspondiente.
- Los pesos se distribuyen en safetensors sin cuantizaciones publicadas, lo que limita las opciones de despliegue a entornos con transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Decision-2.0-Eos-0.8B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Modelo base Decision-1.0-Eos-0.8B: https://huggingface.co/vllm-sr/Decision-1.0-Eos-0.8B
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Sitio de vLLM: https://vllm.ai/
