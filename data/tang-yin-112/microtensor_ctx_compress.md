# Tang-yin-112/microtensor_ctx_compress

## Resumen

`Tang-yin-112/microtensor_ctx_compress` es un repositorio publicado en HuggingFace que sigue la plantilla de envío ("submission") para las arenas de Microtensor, una infraestructura de evaluación descentralizada de modelos de lenguaje especializados. No se trata de un modelo entrenado con pesos publicados en el propio repositorio, sino de un esqueleto de proyecto (harness, router, escalation y manifiesto) que el autor ha configurado para la tarea de compresión de contexto (`context_compression`) dentro de una arena de Microtensor.

El repositorio está pensado para alojar un modelo pequeño especializado (SLM) que se publica aparte, en un repositorio `mt_slm_<arena>`, y que se sirve mediante la imagen oficial del motor de Microtensor sobre una GPU declarada por el participante. La tarea concreta que aborda este envío es la compactación de sesiones de agentes de código en un JSON de cinco campos (`ctx_compress`), con verificación del presupuesto de tokens indicado en la instrucción.

La relevancia es acotada: se trata de una plantilla de competición, no de un modelo listo para producción. No hay información pública sobre parámetros, arquitectura, datos de entrenamiento ni resultados de benchmarks en la información disponible. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una plantilla de envío; el modelo SLM se aloja en otro repositorio) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 32768 tokens (límite configurado en `config.json` para el adaptador `context_compression`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el layout esperado del repositorio SLM: `model.safetensors`, `tokenizer.json`, `config.json`, `generation_config.json`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura del modelo subyacente. El repositorio es un andamiaje de envío con tres componentes: un harness (`harness/engine.py`, `harness/verifier.py`, adaptadores y prompts), un router (`router/model.safetensors` con su tokenizador y scripts de entrenamiento) y un módulo de reparación de frontera (`escalation/patcher.py`). El modelo SLM en sí se publica en un repositorio separado `mt_slm_<arena>` y se entrena y comprime a partir del modelo base definido por la arena, según indica la model card.

El flujo de entrenamiento descrito incluye: entrenar y comprimir el modelo desde el modelo base de la arena, documentar la receta en `training/`, entrenar el router sobre borradores del propio modelo etiquetados por el grader de la arena en las muestras públicas, y ajustar prompts y verificador. Los prompts del adaptador `context_compression` usan el formato de chat de Qwen, con una nota explícita para adaptarlos a Phi 4 mini cambiando los marcadores `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`. No se especifican número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto orientada a tareas estructuradas: el adaptador `context_compression` produce un objeto JSON de cinco campos que resume una sesión de agente de código.
- Verificación programática de la salida: el verificador comprueba que haya un único objeto JSON, pliega claves extra dentro de `summary`, convierte entradas de objeto en cadenas planas y valida el presupuesto de tokens indicado en la instrucción.
- Soporte de adaptadores alternativos: `generic` (tareas de texto libre o estructurado, con comprobación de no vacío, límite de longitud y rechazo de instrucciones inyectadas) y `sql_generation` (pregunta más esquema, respuesta con una consulta SQLite validada con sqlglot y ejecutada sobre la base de datos de muestra).
- Enrutamiento mediante clasificador de secuencia de un solo logit: el router decide si la respuesta del SLM es suficiente o si debe escalarse.
- Reparación de frontera (escalation): el módulo `escalation/` permite invocar modelos frontera a través de un relay con recibos firmados que se verifican en la reproducción.
- Soporte de tool calling y ejecución en sandbox: el harness se ejecuta en el sandbox oficial sin red salvo el gateway de grabación.
- Multilingüismo: no disponible.

## Casos de uso

- Compresión de sesiones de agentes de código: el adaptador `context_compression` toma la transcripción de una sesión de agente y la compacta en un JSON de cinco campos con presupuesto de tokens controlado, útil para reducir el coste de contexto en pipelines de agentes de larga duración.
- Evaluación comparativa de SLM en arenas descentralizadas: el repositorio sirve como plantilla para participar en una arena de Microtensor, declarando perfil de hardware y subiendo un transcript reproducible en CPU por los validadores.
- Enrutamiento selectivo entre modelo local y modelo frontera: el router de un logit permite decidir cuándo la respuesta del SLM es suficiente y cuándo escalar a un modelo mayor, reduciendo coste en producción.
- Generación de SQL validada: con el adaptador `sql_generation`, el harness produce consultas SQLite que se parsean con sqlglot, se restringen a tablas conocidas y se ejecutan sobre una base de datos de muestra antes de devolverlas.
- Reparación automática de respuestas defectuosas: el módulo `escalation/` repara salidas que fallan la verificación, con recibos firmados que permiten auditar el coste de las llamadas a modelos frontera.
- Investigación sobre verificación de salidas: el diseño separa generación, verificación y reparación, lo que facilita experimentar con criterios de aceptación y presupuestos de tokens en tareas estructuradas.
- Docencia y reproducción de evaluaciones: el layout de dos repositorios y las comprobaciones `mt submit validate` y `mt check-model` permiten reproducir el flujo completo en CPU antes de comprometer recursos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del SLM que se aloje en `mt_slm_<arena>`, no incluido en este repositorio).
- GPU recomendadas: no disponible; la model card exige declarar un perfil de hardware de entre los permitidos por la definición de la arena (`evaluation.profiles`).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el harness se ejecuta con la imagen oficial del motor de Microtensor en el sandbox; los validadores reproducen el harness en CPU contra el transcript. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio es una plantilla de envío para arenas de Microtensor y no publica un modelo con parámetros, contexto y benchmarks comparables a alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo entrenado: el repositorio contiene el andamiaje de envío; los pesos del SLM residen en un repositorio separado que no se enlaza en la información disponible.
- Sin licencia declarada: no se especifica licencia, lo que impide evaluar el uso comercial.
- Sin idiomas declarados: no hay información sobre cobertura lingüística.
- Sin datos de rendimiento: no hay benchmarks, métricas de latencia ni evaluaciones publicadas.
- Dependencia de infraestructura externa: el flujo requiere la API de Microtensor (`api.microtensor.cloud`), la imagen oficial del motor y el sandbox de evaluación.
- Restricciones de tamaño: el harness y el módulo de escalación deben mantenerse por debajo de 2 MB en conjunto.
- Riesgo de alucinación y sesgos: no evaluable sin el modelo subyacente ni datos de entrenamiento.
- Reproducibilidad condicionada: la evaluación exige declarar perfil de hardware, subir un transcript y pasar `mt check-model`; un modelo que falle esta comprobación no se evalúa.
- Fecha de creación futura: el repositorio figura creado el 2026-11-03, lo que conviene verificar antes de tomarlo como referencia estable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Tang-yin-112/microtensor_ctx_compress
- Documentación de evaluación descentralizada: https://www.microtensor.cloud/docs/certified-inference/system/decentralised-evaluation
- Documentación de perfiles de hardware: https://www.microtensor.cloud/docs/certified-inference/system/hardware-profiles
- API de arenas: https://api.microtensor.cloud/v2/arenas/<arena>
