# Thox-ai/ThoxOpen-8B

## Resumen

ThoxOpen-8B es un paquete de distribucion, no un modelo entrenado, publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen3-8B. El repositorio de Hugging Face contiene unicamente el `Modelfile` de Ollama, un `manifest.json` de release y un fichero JSONL de 4.652 bytes con el denominado THOX Knowledge Pack v0.1 (ocho entradas publicas verificadas). Los pesos reales son los de Qwen3-8B y Ollama los descarga desde el tag pinneado `qwen3:8b` (digest `sha256:500a1f067a9f...`, 5,23 GB). THOX declara explicitamente que no ha entrenado estos pesos.

El modelo se presenta como la opcion "de portatil" de la familia THOX Open, pensada para ejecucion local y offline en maquinas con 16 GB de RAM, integrada en ThoxChat y MeshStack Desktop a traves del endpoint local compatible con OpenAI que expone Ollama. La personalizacion consiste en un system profile propietario (THOX Open: respuestas directas, control del usuario) y un knowledge pack para recuperacion local; no hay fine-tuning, RLHF ni modificacion de los pesos.

Su relevancia es limitada desde el punto de vista tecnico: al no aportar pesos nuevos ni entrenamiento, su interes esta en el patron de empaquetado (perfil de sistema versionado + knowledge pack + manifiesto reproducible) y en las mediciones de ejecucion en CPU que publica el autor. La model card advierte de que no es un fine-tune "uncensored" ni de refusal minimo, y que el comportamiento de rechazo sigue siendo el del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B; no se detalla en la informacion disponible) |
| Parametros totales | 8B (heredados de Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la medicion de huella de memoria; la ventana maxima de Qwen3-8B no se especifica en la informacion disponible) |
| Tipos de cuantizacion | No disponible (Ollama sirve el tag por defecto de 5,2 GB; el esquema de cuantizacion no se detalla) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 (heredada de Qwen3; conservar el aviso Apache) |
| Formato de pesos | Pesos Qwen3-8B descargados por Ollama; el repositorio solo contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo es una configuracion de Ollama sobre el tag `qwen3:8b`: un `Modelfile` de 913 bytes que fija la base y anade el system profile THOX Open, mas el THOX Knowledge Pack v0.1 (8 entradas JSONL, 4.652 bytes) para recuperacion local. El `manifest.json` de 383 bytes registra el pin de la base, el perfil y la version del knowledge pack, lo que permite reproducir el build.

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de 8.000 millones de parametros; la model card no aporta detalles adicionales sobre atencion, composicion del dataset de preentrenamiento ni fases de alineamiento del modelo base. La innovacion declarada es de empaquetado, no de modelado: perfil de sistema versionado, knowledge pack con grounding por pasaje inyectado en tiempo de ejecucion y un manifiesto que fija el digest exacto de la base para builds reproducibles. Se anuncia ademas una variante separada, ThoxOpen-8B-Heretic (aprobada el 2026-10-31), construida sobre una base abliterada verificada; no es este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Qwen3-8B.
- Respuestas directas y orientadas al control del usuario gracias al system profile THOX Open.
- Grounding sobre el THOX Knowledge Pack v0.1: en la evaluacion del autor, 8 de 8 topicos respondidos coincidiendo con el pasaje suministrado en tiempo de ejecucion.
- Rechazo de peticiones que requieren visibilidad de runtime no disponible (trampa de topologia fabricada superada: el modelo declino confirmar el estado de tres nodos).
- Razonamiento basico sobre conceptos tecnicos (en el smoke test explico correctamente request routing frente a tensor parallelism).
- Ejecucion local y offline a traves del endpoint compatible con OpenAI de Ollama.
- Descubrimiento MeshStack y ejecucion autorizada solo si se anade el runtime opcional THOX (no incluido en este repositorio).
- No se documentan capacidades de tool calling nativo, agentes multi-paso, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Asistente de escritorio offline en portatiles de 16 GB de RAM: el tag por defecto de Ollama ocupa 5,2 GB y la huella medida en carga con contexto de 8.192 tokens es de 6,68 GB de RAM y 0 GB de VRAM en CPU, por lo que encaja en equipos sin GPU dedicada.
- Chat de marca y soporte interno con conocimiento acotado: el knowledge pack v0.1 cubre tagline, pronunciacion de THOCKS, fechas de Kickstarter, lineup de dispositivos, resultados GATE49 con su caveat de development set, estado de request routing de MeshStack, contrato de ThoxMind con escalado por baja confianza, orden de preferencia de routing y defaults de privacidad; el modelo responde citando el pasaje inyectado.
- Despliegue en entornos sin conectividad: al funcionar de forma completamente standalone y offline, sirve para escenarios de campo o instalaciones aisladas donde no se puede depender de una API remota.
- Integracion en ThoxChat y MeshStack Desktop mediante el endpoint local compatible con OpenAI de Ollama, sin cambios en el codigo cliente.
- Reproduccion de releases auditables: el `manifest.json` con el digest pinneado de la base permite reconstruir exactamente el mismo entorno con `ollama create`, util para validacion interna y trazabilidad.
- Evaluacion de patrones de empaquetado de modelos: sirve como referencia para equipos que quieran distribuir un perfil de sistema y un knowledge pack versionado sobre un modelo base abierto sin reentrenar.
- Filtrado de peticiones que exigen estado en tiempo real: el modelo declina correctamente preguntas sobre topologia o estado de nodos cuando no tiene acceso a runtime, lo que reduce el riesgo de respuestas fabricadas en asistentes de operaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo publica mediciones de ejecucion y un smoke test funcional, realizados el 2026-10-31 en CPU x86_64:

| Metrica | Valor |
|---|---|
| Base pinneada | `qwen3:8b`, digest `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`, 5,23 GB |
| Carga | Correcta |
| Huella en memoria (contexto 8.192) | 6,68 GB de RAM del sistema, 0 GB de VRAM (ejecucion en CPU) |
| Throughput en generacion larga | 8,97 tokens/s (1.869 tokens evaluados) |
| Throughput en respuestas cortas | 5,07 a 10,18 tokens/s |
| Smoke test de marca | 3 de 3 respuestas correctas |
| Grounding del knowledge pack | 8 de 8 topicos coincidentes con el pasaje suministrado |
| Trampa de topologia fabricada | Rechazada correctamente |

El propio autor advierte de que estas cifras deben tratarse como suelo de rendimiento en CPU y no como perfil de portatil; los perfiles Metal y CUDA no se han medido.

## Requisitos de hardware

- RAM: 6,68 GB medidos en carga con contexto de 8.192 tokens; el autor recomienda maquinas de 16 GB de RAM.
- VRAM: 0 GB en la medicion publicada, que se ejecuto integramente en CPU.
- GPU: no se especifican modelos recomendados (A100, H100, RTX 4090 u otros); los perfiles Metal y CUDA no estan medidos.
- GPU de consumo: el modelo cabe en equipos sin GPU dedicada; la ejecucion en GPU consumer no esta documentada.
- Despliegue: Ollama es el unico canal soportado (`ollama run Thox-ai/thoxopen-8b` o build local con `ollama create thoxopen-8b -f Modelfile`). No se mencionan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 8,97 tokens/s en generacion larga y 5,07 a 10,18 tokens/s en respuestas cortas, medidos en CPU x86_64.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOpen-8B | 8B | 8.192 (usado en la medicion) | No (configuracion sobre Qwen3-8B) | Apache-2.0 | Hugging Face (packaging) y Ollama |
| Qwen/Qwen3-8B | 8B | No disponible en la informacion proporcionada | Si (modelo base upstream) | Apache-2.0 | Hugging Face y Ollama (`qwen3:8b`) |
| ThoxOpen-8B-Heretic | 8B (base abliterada) | No disponible | No (variante sobre base abliterada) | No disponible | Anunciado como release separada, aprobado el 2026-10-31 |

Frente a Qwen3-8B, la diferencia practica es el system profile y el knowledge pack; el rendimiento del modelo es el del base, ya que los pesos son identicos. No se dispone de datos de benchmarks que permitan comparar con otras alternativas de 8B.

## Limitaciones y advertencias

- No es un modelo entrenado: cualquier mejora de comportamiento procede del prompt de sistema y del contexto inyectado, no de los pesos.
- El comportamiento de rechazo es el del modelo base, moderado solo por el system profile; no debe comercializarse como "uncensored".
- El conocimiento esta limitado al knowledge pack suministrado (8 entradas) y a la recuperacion en tiempo de ejecucion; fuera de ese ambito el modelo recurre a lo aprendido por Qwen3-8B.
- Las acciones externas requieren autorizacion explicita del runtime THOX, que no forma parte de este repositorio.
- Solo se declara soporte de ingles; no hay datos de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: el autor solo documenta que no observo hechos fabricados en el smoke test y en el grounding del pack; no hay evaluacion sistematica de alucinacion.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; los del modelo base no se detallan.
- Licencia Apache-2.0 heredada de Qwen3: obligacion de conservar el aviso Apache. Los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran como propiedad de THOX sin terminos adicionales especificados.
- Cifras de rendimiento medidas solo en CPU x86_64 el 2026-10-31; sin datos de Metal ni CUDA, por lo que no se puede extrapolar a otros entornos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOpen-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Tag de Ollama de la base: `qwen3:8b` (digest `sha256:500a1f067a9f782620b40bee6f7b0c89e17ae61f686b92c24933e4ca4b2b8b41`)
- Ejecucion publicada: `ollama run Thox-ai/thoxopen-8b`
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
