# Thox-ai/ThoxKey-Route-0.5B

## Resumen

ThoxKey-Route-0.5B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen2.5-0.5B-Instruct. No se trata de un modelo entrenado por Thox-ai: el repositorio contiene únicamente un `Modelfile` de Ollama, un `manifest.json` de release y un knowledge pack en JSONL (`thox-knowledge-v0.1.jsonl`, 8 entradas verificadas). Los pesos reales son los del modelo base de Alibaba Qwen, descargados por Ollama a partir de un tag pinneado por digest.

El propósito declarado es actuar como configuración de enrutamiento ("ThoxKey routing") para un despliegue local-first: el modelo devuelve propuestas de enrutamiento etiquetadas como recomendaciones, y es la política del runtime THOX la que decide la ejecución. La personalización se limita al perfil de sistema inyectado en el Modelfile y a la recuperación sobre el knowledge pack; no hay fine-tuning, RLHF ni modificación de pesos.

Su relevancia es acotada y de nicho: sirve como ejemplo de empaquetado reproducible de un modelo pequeño (0,5B parámetros, arquitectura Qwen2.5) para inferencia local en CPU mediante Ollama, con un caso de uso muy específico (enrutamiento con grounding documental) y un rendimiento medido modesto (33,67 tokens/s en generación larga sobre 4 vCPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5, heredada del modelo base) |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion publicada); el maximo nativo del base no se especifica en la informacion disponible |
| Tipos de cuantizacion | Q4-clase por defecto en el tag de Ollama publicado (0,40 GB); no se detallan otras variantes |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Modelfile + manifest.json + knowledge pack JSONL en el repo; pesos servidos como capa de Ollama (no se publican safetensors ni GGUF propios en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only de 0,5B parámetros con atención causal estándar, publicado originalmente por Qwen. Thox-ai no aporta capa arquitectónica alguna ni modifica los pesos; el repositorio solo contiene el empaquetado (perfil de sistema en el Modelfile, manifiesto de release y knowledge pack).

No hay entrenamiento. El procedimiento descrito consiste en pinear el tag `qwen2.5:0.5b` de Ollama por digest (`a8b0c51577010a279d933d14c2a8ab4b268079d44c5c8830c0a93900f1827c67`) y anteponer un perfil de sistema con una regla explícita de estado en vivo ("live-state rule") más una frase de cierre sobre ausencia de telemetría en vivo. Según la model card, esta regla se reforzó tras una primera build que "siguió la trampa" de una topología fabricada, y solo se publicó la segunda pasada. El knowledge pack v0.1 aporta 8 entradas públicas verificadas para respuestas con retrieval. No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO.

## Capacidades

- Generación de texto en inglés a partir de los pesos de Qwen2.5-0.5B-Instruct.
- Respuestas con grounding sobre el knowledge pack v0.1 suministrado (8 entradas JSONL); sin contexto aportado, el perfil le indica que debe declarar la ausencia de información en lugar de inventar especificaciones de THOX.
- Emisión de propuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), no como afirmación de estado en vivo.
- Rechazo de confirmaciones de topología fabricada (trampa de "fabricated-topology" superada en la evaluación publicada).
- Ejecución local y offline mediante el endpoint local de Ollama.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada (fuera del alcance de los pesos por sí solos).
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo "thinking" en la información disponible.

## Casos de uso

- Enrutamiento local-first en despliegues THOX: el modelo genera propuestas de a qué destino derivar una petición (local o nube), que el runtime evalúa y autoriza; encaja por su tamaño reducido y su perfil orientado a no afirmar estado en vivo.
- Asistente de consulta sobre documentación interna acotada: con el knowledge pack inyectado como contexto, responde preguntas sobre las 8 entradas verificadas y declina responder fuera de ese ámbito.
- Despliegue en hardware modesto sin GPU: la evaluación se hizo en un host x86_64 de 4 vCPU y 8 GB, con 0 GB de VRAM, lo que lo hace apto para entornos de borde o portátiles sin acelerador.
- Pruebas de integración de pipelines Ollama: sirve como modelo de referencia para validar flujos `ollama create`/`ollama run` a partir de un Modelfile versionado y un manifiesto con digests.
- Filtro de seguridad conversacional básico: el perfil de sistema refuerza la negativa ante afirmaciones no verificadas (topologías inventadas), útil como capa de contención en prototipos.
- Base para experimentos de empaquetado reproducible: el par `manifest.json` + digest pinneado permite auditar qué pesos exactos se sirven, útil en entornos con requisitos de trazabilidad.
- Demostración educativa de las limitaciones de un modelo de 0,5B: la propia model card reporta 6/8 aciertos de grounding, lo que lo convierte en un caso práctico para ilustrar el techo de razonamiento de esta escala.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Generacion larga | 33,67 tokens/s | Bench de 1.024 tokens, CPU x86_64 4 vCPU / 8 GB |
| Respuestas cortas | 31,1–45,4 tokens/s | Conjunto de smoke tests |
| VRAM en carga | 0 GB | Ejecucion en CPU |
| RAM en carga | no disponible | La model card indica "n/a GB RAM" |
| Smoke tests de fabrica | 3/3 coherentes y on-profile | Preguntas de smoke del fabricante |
| Grounding del Knowledge Pack v0.1 | 6/8 topicos con hechos del pack | Pasaje suministrado, una pregunta por topico |
| Trampa de topologia fabricada | Rechazada | Prueba de confirmacion de topologia inventada |
| Pregunta de enrutamiento | Respondida como recomendacion etiquetada | Local primero, nube con consentimiento explicito |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en ejecución CPU; el tag publicado de Ollama ocupa 0,40 GB en disco (cuantización Q4-clase).
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU. Cualquier GPU consumer con más de 1 GB de VRAM libre puede alojarlo, pero no hay datos de rendimiento en GPU publicados.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en sistemas sin GPU dedicada.
- Host de referencia medido: x86_64 con 4 vCPU y 8 GB de RAM, contexto de 8.192 tokens.
- Opciones de despliegue: Ollama es el canal principal (`ollama run Thox-ai/thoxkey-route-0.5b` o build local con `ollama create`). No se documentan vLLM, llama.cpp directo ni TGI para este paquete.
- Throughput medido: 33,67 tokens/s en generación de 1.024 tokens; 31,1–45,4 tokens/s en respuestas cortas sobre el host de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxKey-Route-0.5B | 0,5B | 8.192 (usado en evaluacion) | Apache-2.0 | Ollama (paquete de configuracion) | Pesos sin entrenar; perfil + knowledge pack de 8 entradas |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la informacion | Apache-2.0 | HuggingFace, Ollama | Modelo base real; capacidades nativas sin perfil THOX |
| Otros modelos de ~0,5B | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

La comparación relevante es contra su propio modelo base: ThoxKey-Route-0.5B no mejora las capacidades de Qwen2.5-0.5B-Instruct, sino que añade un perfil de sistema y un corpus de grounding acotado. No se dispone de datos para comparar con alternativas de terceros de la misma escala.

## Limitaciones y advertencias

- Escala muy reducida: 0,5B parámetros implica razonamiento y recall materialmente limitados; la propia model card lo advierte y reporta solo 6/8 aciertos de grounding.
- No es un modelo entrenado: cualquier expectativa de mejora sobre Qwen2.5-0.5B-Instruct por fine-tuning es infundada; los pesos son idénticos al base pinneado.
- Riesgo de alucinación: el perfil instruye a declarar la falta de contexto, pero el comportamiento de rechazo es el del modelo base, solo moderado por el prompt de sistema; no hay garantía.
- Idioma: solo inglés declarado; no se documenta soporte multilingüe aunque el base Qwen2.5 tenga capacidades multilingües.
- Contexto: la evaluación se hizo a 8.192 tokens; no se especifica el máximo nativo del base ni su comportamiento más allá de esa ventana.
- Enrutamiento solo como propuesta: el modelo no ejecuta acciones ni accede a la malla; requiere autorización del runtime THOX. Los pesos por sí solos nunca proporcionan enrutamiento en vivo ni acceso a MeshStack.
- Sin telemetría en vivo: el perfil incluye una frase de cierre que lo declara; no debe interpretarse como capacidad de monitorización.
- Licencia Apache-2.0 permite uso comercial, pero los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) también se declaran bajo esa licencia según la model card; conviene verificar términos del runtime THOX, que es software separado.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; sin validación externa del comportamiento publicado.
- Fechas del repositorio (creación 2026-11-01) y de la evaluación (2026-10-31) resultan anómalas respecto al calendario habitual; conviene tratarlas con cautela.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thox-ai/ThoxKey-Route-0.5B
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Tag de Ollama del modelo publicado: `Thox-ai/thoxkey-route-0.5b` (referenciado en la model card; no se proporciona URL directa)
- Paper, blog, repositorio de código o demo del runtime THOX: no disponibles en la información proporcionada.
