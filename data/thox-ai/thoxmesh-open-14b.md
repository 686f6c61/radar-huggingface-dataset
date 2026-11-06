# Thox-ai/ThoxMesh-Open-14B

## Resumen

ThoxMesh-Open-14B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen3-14B (Alibaba Cloud, licencia Apache-2.0). No se trata de un modelo entrenado ni ajustado: el repositorio de Hugging Face contiene únicamente el `Modelfile` de Ollama, un `manifest.json` de release y un fichero JSONL con el denominado THOX Knowledge Pack v0.1 (8 entradas públicas verificadas). Los pesos reales se descargan desde el pin upstream `qwen3:14b` (digest `sha256:bdbd181c33f2ed1b31c972991882db3cf4d192569092138a7d29e973cd9debe8`, 9,28 GB).

El propósito declarado es responder preguntas sobre el sistema de routing MeshStack y sobre planificación de expansión, usando el Knowledge Pack como contexto inyectado en el prompt de sistema. La configuración incluye un bloque de grounding explícito que obliga al modelo a citar el principio de marca de THOX de forma literal y a rechazar la verificación de estado operativo en vivo (telemetría, número de nodos, precios o disponibilidad). El modelo ocupa el tramo intermedio de la lineup THOX Mesh, entre las builds de 8B y 30B.

Es relevante como ejemplo de patrón "configuration-derived": empaquetar un modelo base potente con un perfil de sistema versionado y un corpus de conocimiento pequeño y verificable, en lugar de recurrir a fine-tuning. Para desarrolladores e investigadores resulta útil como referencia de cómo se documenta y evalúa un artefacto de este tipo, y como caso de estudio de las limitaciones de esta aproximación (el conocimiento fuera del pack es el del modelo base, no el de THOX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-14B; no se detalla en la informacion disponible) |
| Parametros totales | 14B |
| Parametros activos | no disponible (no es MoE segun la informacion proporcionada) |
| Longitud de contexto | 8.192 tokens verificados en la evaluacion del autor (contexto nativo de Qwen3-14B no disponible en la informacion) |
| Tipos de cuantizacion | no disponible (el build publicado en Ollama ocupa 9,28 GB, lo que sugiere cuantizacion, pero no se especifica el tipo) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | Paquete Ollama (Modelfile + manifest); los pesos se obtienen del pin upstream `qwen3:14b`. No se publican safetensors ni GGUF en el repo de Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-14B, un transformer decoder-only de 14.000 millones de parametros. THOX no aporta ninguna modificación arquitectonica: los pesos son byte-identicos al release upstream, tal como declara explicitamente la model card. No hay entrenamiento, fine-tuning, RLHF ni DPO por parte de THOX; el trabajo se limita al perfil de sistema, el Knowledge Pack, la evaluacion y el empaquetado.

La innovacion tecnica, si se puede llamar asi, es el mecanismo de grounding: el perfil de sistema publicado incluye un bloque que (1) enuncia el principio de marca de THOX de forma literal, (2) declina verificar estado operativo en vivo y (3) trata los hechos operativos afirmados por el usuario como no verificados. Segun la card, este bloque se anadio despues de que los primeros smokes de 14B mostraran que el perfil sin enmienda improvisaba la respuesta de marca. El Knowledge Pack v0.1 son 4.652 bytes de JSONL con 8 entradas publicas verificadas que se inyectan en contexto.

## Capacidades

- Generacion de texto en ingles, con las capacidades generales heredadas de Qwen3-14B (razonamiento, codigo, matematicas), aunque la card no las detalla ni las evalua.
- Respuesta a preguntas sobre routing y expansion de MeshStack, fundamentada en las 8 entradas del Knowledge Pack v0.1.
- Explicacion de diseno de routing: routing por solicitud completa (whole-request), localidad y comportamiento ante fallos.
- Declive explicito de verificacion de estado en vivo: el modelo rechaza confirmar si MeshStack corre en un numero concreto de nodos, telemetria, precios o disponibilidad.
- Tratamiento de hechos operativos afirmados por el usuario como no verificados.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion proporcionada.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Asistente interno de documentacion de MeshStack: desplegado via Ollama, responde consultas del equipo sobre routing por solicitud completa y planificacion de expansion, citando las entradas del Knowledge Pack. Adecuado porque el corpus es pequeno, verificado y versionado.
- Formacion de nuevos ingenieros en el modelo de routing de THOX: el modelo explica localidad y comportamiento ante fallos sin inventar topologias, gracias al bloque de grounding que le obliga a declinar la verificacion de estado en vivo.
- Servicio local de tramo intermedio en la lineup THOX Mesh: con 9,28 GB de pesos y 10,49 GB de huella del runner, encaja en estaciones de trabajo con GPU de 16 GB, entre las builds de 8B y 30B.
- Filtro de preguntas operativas: integrado como primera capa en un chatbot interno, rechaza consultas sobre telemetria, numero de nodos o precios y las redirige a un sistema autenticado, evitando respuestas fabricadas.
- Base para experimentos de grounding con Knowledge Packs: investigadores pueden sustituir el JSONL por su propio corpus verificado y medir cuanto del comportamiento depende del perfil de sistema frente al modelo base.
- Evaluacion comparativa de estrategias de configuracion frente a fine-tuning: al ser pesos identicos a Qwen3-14B, permite aislar el efecto del prompt de sistema y del contexto inyectado sin confundirlo con cambios en los pesos.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia del autor, medida el 2026-11-01 en una estacion de trabajo x86_64 con GPU de clase 16 GB y ejecucion en host compartido. El autor advierte que el throughput debe tratarse como suelo en condiciones de host compartido, no como perfil de estacion de trabajo dedicada.

| Metrica | Resultado |
|---|---|
| Carga a contexto 8.192 | exito |
| Huella de memoria del runner en carga | 10,49 GB (VRAM + RAM del sistema segun planificacion del runner) |
| Throughput (generacion long-form, 2.180 tokens evaluados) | 25,25 tokens/s |
| Preguntas de humo de fabrica | 3/3 respondidas |
| Grounding del Knowledge Pack | 8/8 temas respondidos con los hechos requeridos |
| Trampa de topologia fabricada | rechazada correctamente (respuesta en el registro de evidencia del release) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni para este paquete ni referenciados del modelo base.

## Requisitos de hardware

- VRAM/RAM estimada: 10,49 GB de huella del runner con contexto de 8.192 tokens, segun la medicion del autor (VRAM + RAM del sistema combinadas por el planificador del runner). Los pesos del build publicado ocupan 9,28 GB.
- GPU recomendadas: no se especifican modelos concretos; la evaluacion se hizo en una GPU de clase 16 GB. Por tamano, una RTX 4090 (24 GB) o una A100/H100 son sobredimensionadas para este build.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con el contexto evaluado; en tarjetas de 12 GB requeriria cuantizacion mas agresiva, no documentada.
- Opciones de despliegue: Ollama es el unico metodo documentado (`ollama run Thox-ai/thoxmesh-open-14b`, o build local con `ollama create`). No hay instrucciones para vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 25,25 tokens/s en generacion long-form bajo host compartido; no se publican metricas de latencia por token ni de time-to-first-token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxMesh-Open-14B | 14B | 8.192 verificado | 25,25 tok/s (host compartido, 16 GB) | Apache-2.0 | Ollama; repo HF solo con empaquetado |
| Qwen3-14B (upstream) | 14B | no disponible en la informacion | no disponible en la informacion | Apache-2.0 | Pesos completos en Hugging Face |
| Builds THOX Mesh 8B y 30B | 8B / 30B | no disponible | no disponible | no disponible | Lineup THOX (no detallada en la informacion) |

La comparacion con Qwen3-14B es directa en pesos (byte-identicos), pero la informacion proporcionada no incluye el contexto nativo ni los benchmarks del upstream, por lo que no se puede cuantificar la diferencia de rendimiento. No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Configuracion, no entrenamiento: los pesos son el release upstream sin modificar. Fuera del Knowledge Pack, el modelo solo conoce THOX por su entrenamiento base, con riesgo de respuestas genericas o incorrectas sobre la marca.
- Sin estado en vivo: no tiene telemetria y no puede verificar estado de cluster, numero de nodos, precios ni disponibilidad; esta configurado para declinarlo, pero el declive depende del prompt de sistema y puede degradarse con prompts adversarios.
- Solo routing: MeshStack enruta solicitudes completas entre nodos; el modelo no hace tensor parallelism, pipeline parallelism ni inferencia dividida, y no debe describirse como si lo hiciera.
- Sin cualificacion en hardware THOX: los dispositivos ThoxKey, ThoxAir, ThoxMini, ThoxClip y ThoxUltra ejecutan builds mas pequenas por dispositivo; nada en este paquete afirma rendimiento on-device.
- Idioma: solo ingles declarado; el castellano no esta soportado oficialmente.
- Corpus minimo: 8 entradas y 4.652 bytes de Knowledge Pack limitan severamente la cobertura tematica.
- Evaluacion fragil: 3 preguntas de humo y 8 temas de grounding son una muestra muy reducida; el throughput se midio en host compartido y el propio autor lo califica de suelo.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso comunitario ni auditoria externa.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar por su cuenta el cumplimiento de la licencia upstream de Qwen3-14B y la ausencia de garantias.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxMesh-Open-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Ejecucion en Ollama: `ollama run Thox-ai/thoxmesh-open-14b`
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
