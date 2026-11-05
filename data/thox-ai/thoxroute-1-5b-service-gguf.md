# Thox-ai/ThoxRoute-1.5B-Service-GGUF

## Resumen

ThoxRoute-1.5B-Service-GGUF es una cuantización Q4_K_M en formato GGUF de un fine-tune de Qwen2.5-1.5B-Instruct, publicada por Thox-ai como modelo de clasificación y enrutado de intenciones ("service router") para nodos de servicio de baja memoria dentro de su stack propietario (MeshStack y ThoxOS). No es un asistente general: su propósito declarado es decidir a qué servicio o ruta debe dirigirse una petición de usuario en despliegues locales.

El artefacto se distribuye como un único fichero de 1.117.320.704 bytes (~1,04 GiB), con arquitectura `qwen2`, plantilla de chat instruct estándar y contexto de 32.768 tokens según la cabecera GGUF. El modelo base subyacente es Qwen2.5-1.5B-Instruct, con 1.777.088.000 parámetros totales, y la licencia declarada es Apache-2.0.

Es relevante ahora por dos motivos contrapuestos: por un lado, ejemplifica la tendencia a publicar modelos pequeños especializados para enrutado y orquestación en el borde; por otro, la propia model card lo etiqueta explícitamente como "UNVALIDATED ARTIFACT", sin validación de runtime, sin benchmarks y con una discrepancia de tamaño no explicada respecto a un repositorio hermano. Es, por tanto, un artefacto a evaluar con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (`general.architecture = qwen2`) |
| Parametros totales | 1.777.088.000 (etiqueta de tamaño del GGUF: 1.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según cabecera GGUF) |
| Tipos de cuantizacion | Q4_K_M (único build publicado en el repositorio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`thoxroute-service-q4_K_M.gguf`) |

Datos adicionales del artefacto: SHA-256 `dcb4d041fa2ae90b5c3b713e9bd8e6c4b265388f4f81c804ae7a404737c4c1b2`; tokens especiales BOS `<|endoftext|>` y EOS `<|im_end|>`; nombre interno `general.name = "Service v1 Merged"`; tamaño del repositorio 1,1 GB; 280 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención completa, sin mecanismos híbridos ni atención lineal. El artefacto es una fusión ("merged build", según el campo `general.name`) de un adaptador fine-tuneado sobre ese base, posteriormente cuantizada a Q4_K_M. La cabecera GGUF confirma arquitectura `qwen2` y una etiqueta de tamaño de 1.8B, coherente con el base declarado.

Sobre el entrenamiento no hay información sustantiva publicada: la model card afirma que el corpus y el procedimiento se describen "as published at release" y que no se reclama ningún entrenamiento más allá de lo que la propia tarjeta documenta, pero no incluye número de tokens, composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Tampoco se documenta ninguna innovación técnica de inferencia (decodificación especulativa, atención lineal, etc.). La plantilla de chat embebida es la estándar de Qwen instruct, incluyendo su persona de sistema por defecto, y no incorpora ninguna plantilla de enrutado propia de THOX; si el host no la sobrescribe, el modelo se presentará con su identidad upstream.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-1.5B-Instruct.
- Clasificación y enrutado de intenciones hacia servicios internos (uso declarado principal: "intent and preference routing").
- Seguimiento de instrucciones en formato chat mediante la plantilla instruct estándar de Qwen.
- Manejo de contextos de hasta 32.768 tokens, útil para concatenar historial de conversación y catálogo de rutas en un mismo prompt.
- Soporte de tool calling / function calling: no documentado explícitamente para este fine-tune; el base Qwen2.5-Instruct lo soporta, pero no hay evidencia publicada de que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Enrutado de peticiones en un nodo de servicio local: el modelo recibe la consulta del usuario y devuelve la etiqueta de servicio o ruta correspondiente; su tamaño de ~1 GB permite ejecutarlo en el mismo nodo que atiende la petición, sin llamadas a un backend remoto.
- Clasificación de intenciones en asistentes de soporte: con 32.768 tokens de contexto se puede incluir el historial reciente y el catálogo de intenciones en el prompt para desambiguar peticiones como "reset my password" frente a "change my email".
- Prefiltrado y desvío de tráfico en pasarelas de API: colocado delante de modelos mayores, decide qué peticiones requieren un modelo grande y cuáles puede resolver un servicio ligero, reduciendo coste por token.
- Despliegue en dispositivos de borde con memoria limitada: la cuantización Q4_K_M (~1,04 GiB) encaja en equipos con 2-4 GB de RAM disponibles, incluyendo SBCs y mini-PC, mediante llama.cpp u Ollama.
- Enrutado de preferencias de usuario en aplicaciones locales: seleccionar entre motores de búsqueda, fuentes de datos o modos de respuesta según preferencias declaradas previamente en el contexto.
- Prototipado de pipelines de orquestación multi-servicio: servir como componente de decisión barato en pruebas de integración antes de sustituirlo por un clasificador entrenado con datos propios.
- Entornos air-gapped o de soberanía de datos: al ser un GGUF autocontenido con licencia Apache-2.0, puede desplegarse sin dependencias externas ni telemetría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente el artefacto como "UNVALIDATED ARTIFACT": no ha sido cargado, evaluado ni verificado funcionalmente, y no se aporta ninguna métrica de precisión de enrutado, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~1,1 GB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV, entre 1,5 y 3 GB según longitud de contexto (a 32.768 tokens la caché KV crece de forma significativa en un modelo de 28 capas y 2 cabeceras KV).
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamaño y funcionarán sin problema.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas modernas, y también en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF`), y cualquier runtime compatible con GGUF. vLLM y TGI no son la vía natural para este formato.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThoxRoute-1.5B-Service-GGUF | 1,78B | 32.768 | GGUF Q4_K_M | Apache-2.0 | Fine-tune de enrutado, sin validar, solo inglés |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | safetensors, GGUF | Apache-2.0 | Base upstream, propósito general, multilingüe, ampliamente evaluado |
| Thox-ai/ThoxRoute-1.5B-GGUF | 1,5B (nominal) | No disponible | GGUF Q4_K_M | Apache-2.0 | Repositorio hermano; su Q4_K_M pesa 986.047.936 B frente a 1.117.320.704 B de este |
| Thox-ai/ThoxRoute-1.5B | 1,5B (nominal) | No disponible | safetensors (adaptador/merge) | Apache-2.0 | Fuente declarada del GGUF; sin benchmarks publicados |

La comparación relevante es contra el base Qwen2.5-1.5B-Instruct: mismo contexto y licencia, pero el base cuenta con evaluaciones públicas, soporte multilingüe y tool calling documentado, mientras que este artefacto solo añade un ajuste de enrutado no verificado y restringe el idioma al inglés.

## Limitaciones y advertencias

- Artefacto no validado: la model card declara que no se ha cargado, evaluado ni comprobado funcionalmente; no hay evidencia de que enrute correctamente.
- Sin benchmarks ni métricas de precisión de clasificación; imposible estimar su calidad frente a un clasificador simple o al propio Qwen2.5-1.5B-Instruct sin ajustar.
- Linaje no verificable byte a byte: no existe registro de build, log de conversión ni cadena de hashes que vincule el fichero al adaptador declarado.
- Discrepancia de tamaño no explicada: ~131 MB más que el Q4_K_M del repositorio hermano para la misma cuantización nominal y la misma fuente nominal.
- Plantilla de chat estándar de Qwen: si el host no sobrescribe el system prompt, el modelo se presentará con la identidad upstream en lugar de la de THOX, lo que puede filtrar comportamiento no deseado en producción.
- No alineado para seguridad ni para exposición pública directa; la propia tarjeta indica que debe desplegarse tras los guardarraíles de THOX y que no es un asistente general.
- Solo inglés: inadecuado para interacción en castellano sin un paso de traducción previo.
- Riesgo de alucinación en la etiqueta de ruta: al ser un modelo generativo usado como clasificador, puede producir etiquetas inexistentes si no se restringe la decodificación al conjunto cerrado de rutas.
- Licencia Apache-2.0 permite uso comercial, pero la determinación de licencia se resolvió por corroboración indirecta (fuente y base Apache-2.0) y así se hace constar en la tarjeta; conviene revisar el texto de licencia incluido en el repositorio.
- Dependencia de un ecosistema propietario (MeshStack, ThoxOS): el valor práctico fuera de ese stack es incierto y no documentado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF
- Fuente declarada (fine-tune): https://huggingface.co/Thox-ai/ThoxRoute-1.5B
- Repositorio hermano GGUF: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Descarga directa del fichero: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF/resolve/main/thoxroute-service-q4_K_M.gguf
- Papers, blogs, repos de código y demos adicionales: no disponibles en la información proporcionada.
