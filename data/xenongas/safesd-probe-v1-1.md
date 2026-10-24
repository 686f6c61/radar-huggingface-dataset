# XenonGas/SafeSD-probe-v1.1

## Resumen

SafeSD-probe-v1.1 es una sonda clasificadora (probe) para la detección de inyección de prompts y de comportamiento dirigido a objetivos en agentes que ejecutan herramientas. No es un modelo generativo: se compone de un backbone Qwen3-0.6B congelado, una primera capa clasificadora también congelada y un readout lineal final de 513 parámetros que es lo único que se optimiza en esta versión. Su salida es una probabilidad de alarma que, con el umbral por defecto de 0,5 y longitud consecutiva 1, se traduce en una decisión binaria sobre cada ronda de ejecución del agente.

La versión 1.1 es un refinamiento del readout de SafeSD-probe-v1 sobre las salidas fijas ya existentes de AgentLAB, con anclas de comportamiento positivo y restricciones de retención para no alterar las decisiones ya correctas. Etiqueta comportamiento ejecutado relacionado con el objetivo, incluyendo intentos de tool call que fallan o que se sobrescriben después, y distingue el endoso de una meta de su mera mención en el caso de objetivos expresados en texto. La arquitectura y la codificación de entrada (`event`) no cambian respecto a la versión anterior.

Es relevante ahora porque integra la detección en el bucle de generación auditada de SafeSD, un marco que etiqueta sus propias salidas con `speculative-decoding`: la sonda actúa como verificador barato y desacoplable del generador, puede ejecutarse en un dispositivo distinto (`--probe-device`) y requiere un checkpoint de 1,2 GB. El modelo se publicó el 24 de octubre de 2026, sin descargas ni validación externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de clasificación sobre backbone transformer Qwen3-0.6B congelado + primera capa clasificadora congelada + readout lineal final (513 parámetros entrenables) |
| Parametros totales | Aproximadamente 0,6 B en el backbone (congelado) más la cabeza clasificadora; 513 parámetros optimizados en esta release |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para la sonda; el backbone es Qwen3-0.6B y no se documenta la ventana efectiva usada en la codificación `event` |
| Tipos de cuantizacion | No disponible; el repositorio solo publica state dicts de PyTorch (`probe.pt`), sin variantes GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible en la información proporcionada; el repositorio incluye un fichero `UPSTREAM_LICENSE` con el texto de licencia upstream de Qwen/Qwen3-0.6B |
| Formato de pesos | PyTorch state dicts en `probe.pt` (claves `backbone` y `head`) más `probe.meta.json` con metadatos de codificación de entrada |
| Codificacion de entrada | `event` (idéntica en v1 y v1.1) |
| Umbral de alarma por defecto | 0,5 |
| Longitud consecutiva | 1 |
| Tamano del repositorio | 1,2 GB |
| Libreria | PyTorch (`library_name: pytorch`) |
| Modelo base | XenonGas/SafeSD-probe-v1 (relación: finetune) |
| Backbone upstream | Qwen/Qwen3-0.6B |

## Arquitectura y entrenamiento

La sonda reutiliza el backbone de Qwen3-0.6B y una primera capa clasificadora, ambos congelados, y solo optimiza el readout lineal final de 513 parámetros. El entrenamiento de esta versión se describe como un refinamiento sobre las salidas fijas ya generadas por AgentLAB, con anclas de comportamiento positivo y restricciones de retención que preservan las decisiones existentes. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o preferencias; el autor indica explícitamente que los datos de entrenamiento y las respuestas de evaluación guardadas se mantienen por separado y no se publican en el repositorio.

La innovación técnica es de escala e integración más que arquitectónica: al mantener congelado todo el grafo excepto un readout de 513 parámetros, el ajuste es extremadamente barato y auditable, y la sonda se puede servir como proceso independiente en otra GPU dentro del servicio de generación auditada de SafeSD (`scripts/benchsets.py serve`). El checkpoint contiene únicamente los state dicts `backbone` y `head`, que se cargan mediante el loader de sondas de SafeSD; la inferencia necesita además el tokenizer y la configuración del backbone Qwen configurados en ese entorno. La etiqueta `speculative-decoding` sugiere su uso dentro del pipeline de decodificación especulativa de SafeSD, aunque el mecanismo concreto de acoplamiento no se detalla en la información disponible. Es imprescindible mantener `probe.pt` y `probe.meta.json` juntos para que SafeSD seleccione la codificación de entrada correcta.

## Capacidades

- Clasificación binaria de comportamiento de agente: emite una probabilidad de alarma por ronda de ejecución, convertida en decisión con umbral 0,5.
- Detección de inyección de prompts y de secuestro de objetivos (goal hijacking) en trayectorias de agentes con herramientas.
- Etiquetado de comportamiento ejecutado, no solo de texto: incluye intentos de tool call que fallan o que se sobrescriben posteriormente.
- Distinción entre endoso y mera mención cuando el objetivo está expresado en lenguaje natural.
- Evaluación a dos granularidades: ronda de ejecución (1.450 rondas en la evaluación publicada) y par de tareas (949 pares).
- Integración como servicio de generación auditada en SafeSD, con posibilidad de ejecutar la sonda en un dispositivo distinto al del generador.
- No soporta generación de texto, tool calling propio, razonamiento multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Puerta de seguridad en pipelines de agentes: interceptar cada ronda de ejecución antes de aplicar un tool call y bloquear la acción si la probabilidad de alarma supera 0,5; el modelo está entrenado específicamente para etiquetar comportamiento ejecutado, incluidas llamadas que fallan o se sobrescriben.
- Auditoría de generación en SafeSD: arrancar el servicio con `python scripts/benchsets.py serve --group silent --device cuda:0 --probe-device cuda:1 --ckpt checkpoints/SafeSD-probe-v1.1/probe.pt` para monitorizar salidas del generador con la sonda aislada en una segunda GPU y evitar contención de memoria.
- Regresión en CI/CD de agentes: ejecutar la sonda sobre logs guardados de rondas y pares de tareas para detectar cambios de comportamiento tras modificaciones en prompts, herramientas o políticas, usando el formato de evaluación por ámbitos que documenta el autor.
- Detección de secuestro de objetivo en asistentes con herramientas: aplicar la sonda a objetivos en texto para separar endoso real de simple mención, un caso que los chequeos de estado final de AgentLAB no distinguen por sí solos.
- Curado de datasets de trayectorias: etiquetar automáticamente pares tarea-ejecución para filtrar positivos y negativos antes de entrenar modelos de agente, aprovechando la granularidad de ronda y de par.
- Investigación en decodificación especulativa segura: usar la sonda como verificador de bajo coste (513 parámetros de readout) acoplado a un generador grande, midiendo el coste marginal de añadir supervisión de seguridad sin reentrenar el backbone.
- Despliegue en hardware modesto para pruebas de concepto: el checkpoint de 1,2 GB permite levantar un entorno de evaluación completo en una única GPU de consumo con el generador y la sonda en procesos separados (`--probe-device cuda:0`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible: la sonda no es un modelo generativo y no es evaluable con esas pruebas. El autor publica únicamente la evaluación sobre salidas guardadas de AgentLAB, que fueron usadas para la adaptación dirigida y, por tanto, no miden generalización.

| Ámbito | Positivos | Negativos | Fallos (misses) | Falsos positivos |
|---|---:|---:|---:|---:|
| 1.450 rondas de ejecución | 877 | 573 | 0 | 24 |
| 949 pares de tareas | 707 | 242 | 0 | 10 |

Métricas derivadas de la tabla anterior (cálculo aritmético propio, no publicadas por el autor):

| Métrica | Rondas | Pares de tareas |
|---|---:|---:|
| Sensibilidad (recall) | 100,0 % | 100,0 % |
| Precisión | 97,3 % | 98,6 % |
| Especificidad | 96,0 % | 96,1 % |
| Exactitud | 98,3 % | 98,9 % |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,2 GB, correspondientes al state dict del backbone Qwen3-0.6B (aproximadamente 1,2 GB en bf16 y 2,4 GB en fp32) más la cabeza clasificadora y el readout de 513 parámetros. Presupuesto realista de 2 a 3 GB de VRAM para el proceso de la sonda, incluidas activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para la sonda aislada; en el escenario documentado por el autor se usa `cuda:0` para el generador y `cuda:1` para la sonda, lo que implica dos dispositivos (por ejemplo, dos A100, dos H100 o dos RTX 4090 si el generador es grande). Para el generador que acompaña a la sonda, los requisitos dependen del modelo elegido, no de esta release.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna con 4 GB o más (RTX 3060, RTX 4060 Ti, RTX 4090, etc.). En una sola GPU se recomienda `--probe-device cuda:0` con la sonda en un proceso separado, tal como indica el autor.
- Opciones de despliegue: exclusivamente el servicio de SafeSD (`scripts/benchsets.py serve`) mediante su loader de sondas, sobre PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo servible por esas herramientas. La descarga se realiza con `snapshot_download(..., allow_patterns=["probe.pt", "probe.meta.json"])`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SafeSD-probe-v1.1 | Sonda de clasificación sobre Qwen3-0.6B | ~0,6 B en backbone congelado; 513 parámetros entrenados | No disponible | No disponible (conserva `UPSTREAM_LICENSE` de Qwen3-0.6B) | HuggingFace, 0 descargas, sin pipeline declarado |
| SafeSD-probe-v1 | Sonda de clasificación (predecesor directo) | Misma arquitectura; readout previo al refinamiento | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3-0.6B | Modelo generativo base | 0,6 B | No disponible en la información proporcionada | La de su model card upstream | HuggingFace, ampliamente distribuido |
| Filtros de prompt injection tipo Prompt Guard (Meta) | Clasificador dedicado | ~86 M (Prompt Guard 2) | No disponible | Licencia de la familia Llama | HuggingFace, amplia adopción |
| Llama Guard 3 (Meta) | Modelo generativo de moderación | 8 B | 128 k (según ficha del fabricante) | Licencia comunitaria Llama 3.1 | HuggingFace, amplia adopción |

No existen comparaciones directas publicadas entre esta sonda y las alternativas de la tabla: los datos de las filas de Meta proceden de fichas públicas de sus fabricantes y no se han verificado contra SafeSD-probe-v1.1. La diferencia funcional clave es que esta sonda clasifica comportamiento ejecutado de agentes (rondas y tool calls), no contenido textual genérico.

## Limitaciones y advertencias

- La evaluación publicada se realizó sobre las mismas salidas guardadas utilizadas para la adaptación dirigida, con anclas de reparación incluidas; el propio autor advierte de que hay que evaluar salidas nuevas por separado para medir generalización. Los 0 fallos no deben interpretarse como rendimiento en producción.
- Los 24 falsos positivos sobre 1.450 rondas (1,7 %) implican bloqueos espurios de comportamiento legítimo; con umbral 0,5 y longitud consecutiva 1 no se documenta ninguna calibración alternativa ni curvas de precisión-exhaustividad.
- Riesgo de sobreajuste a las anclas de comportamiento positivo: al optimizar solo 513 parámetros contra un conjunto fijo, la sonda puede memorizar patrones de esas salidas y degradarse en distribuciones distintas de herramientas o dominios.
- Solo inglés: los objetivos en texto y las trayectorias en otros idiomas quedan fuera de la cobertura declarada.
- Cobertura limitada a comportamiento ejecutado relacionado con el objetivo; no es un moderador de contenido dañino genérico y no sustituye a filtros de seguridad de propósito general.
- No es un modelo generativo: no produce explicaciones ni justificaciones de la decisión, solo una probabilidad de alarma, lo que dificulta la depuración de falsos positivos en producción.
- Licencia no declarada en el repositorio; el uso comercial depende del texto de `UPSTREAM_LICENSE` de Qwen3-0.6B y debe verificarse antes de desplegar.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin validación independiente y sin datos de entrenamiento publicados.
- Dependencia estricta del entorno: `probe.pt` y `probe.meta.json` deben mantenerse juntos y cargarse con el loader de SafeSD, junto con el tokenizer y la configuración del backbone Qwen; un desajuste de codificación de entrada invalida las decisiones.
- No se documentan sesgos del backbone ni evaluaciones por subgrupos, lo que impide auditar disparidades de falsos positivos entre tipos de tareas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XenonGas/SafeSD-probe-v1.1
- Modelo predecesor: https://huggingface.co/XenonGas/SafeSD-probe-v1
- Perfil del autor (XenonGas / Jiachen Liu): https://huggingface.co/XenonGas
- Backbone upstream Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del framework SafeSD: https://github.com/flowermouse/SafeSD
- Marco relacionado de evaluación de seguridad de agentes (no forma parte del modelo): https://github.com/Mengmeara/agent-safe-probe-x
- Recopilación de modelos de seguridad ofensiva (contexto, no relacionado directamente): https://github.com/JoasASantos/Offensive-Security-AI-Models
- Listado de herramientas de red teaming de IA (contexto): https://www.marktechpost.com/2026/04/17/top-ai-red-teaming-tools/
