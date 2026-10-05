# wanna0720/qwen38-27b-swerebench-grpo-step8-training-state

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino un checkpoint de entrenamiento distribuido correspondiente al paso 8 de una ejecución de GRPO (Group Relative Policy Optimization) de parámetros completos sobre el modelo base Qwen/Qwen3.8-27B. Lo publica el usuario wanna0720 bajo licencia Apache-2.0 y su propósito declarado es la recuperación de investigaciones y la continuación del entrenamiento, no el despliegue en producción. El ajuste se realizó sobre un corpus de 1.586 tareas denominado SWE-rebench v2 Filtered, orientado a tareas de ingeniería de software con agentes que ejecutan acciones de shell en sandboxes independientes mediante mini-swe-agent.

El checkpoint pertenece a la línea base de GRPO sin ramificación (no-branch) y se distribuye en formato Miles/Megatron, con ocho fragmentos `.distcp`, metadatos DCP, estado del optimizador y el cursor del dataset. El tamaño total del repositorio es de 18,1 GB, lo que incluye pesos y estado del optimizador, no solo los pesos en precisión de inferencia. Los pesos aptos para inferencia directa se publican, según la model card, en un export aparte en `safetensors`.

Su relevancia es doble: por un lado documenta con detalle una configuración de entrenamiento por RL reproducible (8 GPU NVIDIA B300, paralelismo de tensor 2 y de contexto 4, batch global 256, learning rate 2e-6); por otro, advierte de un riesgo operativo concreto, ya que los archivos `.metadata` son pickles de PyTorch que solo deberían cargarse desde fuentes de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint derivado de Qwen/Qwen3.8-27B; la informacion proporcionada no detalla la arquitectura del modelo base) |
| Parametros totales | 27 000 millones segun el identificador del modelo base; no confirmado en la informacion disponible |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint esta en formato de entrenamiento distribuido, no cuantizado) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint distribuido Miles/Megatron: ocho fragmentos `iter_0000008/__*_0.distcp`, metadatos DCP, `metadata.json` y `checkpoint_complete.json`. El export en `safetensors` para inferencia se publica en un repositorio separado |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Qwen/Qwen3.8-27B (si es transformer denso, MoE o hibrida). Lo que si se detalla es el procedimiento de ajuste: una ejecución de GRPO de parámetros completos sobre el corpus SWE-rebench v2 Filtered, compuesto por 1.586 tareas. El entrenamiento se archivó como checkpoint distribuido Miles/Megatron con paralelismo de tensor 2 y paralelismo de contexto 4 sobre ocho GPU NVIDIA B300, con un learning rate de 2e-6 y un batch global de 256 (32 grupos de prompts con 8 rollouts por grupo). El agente utilizado fue `mini-swe-agent`, con sandboxes independientes y acciones de shell, lo que sitúa el entrenamiento en el ámbito de los agentes de resolución de incidencias de software más que en el de la generación de código aislada.

La innovación metodológica destacable es precisamente el tipo de checkpoint: no es un modelo final, sino un estado intermedio completo que incluye pesos, estado del optimizador, metadatos y el cursor del dataset (`rollout/global_dataset_state_dict_8.pt`), lo que permite reanudar la ejecución exactamente en la iteración 8. Se especifica que corresponde a la línea base de GRPO sin ramificación, lo que en la práctica lo convierte en el punto de referencia contra el que comparar variantes con políticas ramificadas. La configuración archivada se resume a continuación.

| Parametro de la ejecucion | Valor |
|---|---|
| Algoritmo | GRPO de parametros completos, variante no-branch |
| Paso archivado | 8 (`iter_0000008`) |
| Corpus | SWE-rebench v2 Filtered, 1.586 tareas |
| Agente | mini-swe-agent, con sandboxes independientes y acciones de shell |
| Hardware | 8 GPU NVIDIA B300 |
| Paralelismo | tensor parallelism 2, context parallelism 4 |
| Batch | 32 grupos de prompts x 8 rollouts = batch global 256 |
| Learning rate | 2e-6 |
| Marcador de finalizacion | `checkpoint_complete.json`, SHA-256 `006843311874c1a6fb467aaedee05ad84919eb6a82ef0613e8fd287b6ceffe18` |
| Hash del prompt fuente | `7c99144299c2491499a19813d2b42efbc482766af8bc7ee4aeb9968675681b1e` |

## Capacidades

- No es un modelo desplegable: el repositorio contiene un estado de entrenamiento, no pesos listos para servir mediante `transformers`, vLLM o llama.cpp.
- Reanudacion de entrenamiento: permite continuar la ejecución de GRPO desde la iteración 8 usando el mismo código Miles/Megatron, los activos del modelo base Qwen3.8-27B y el estado del dataset incluido.
- Recuperacion de investigacion: conserva estado del optimizador, metadatos y cursor del dataset, lo que facilita reproducir o auditar la ejecución.
- Comparacion de politicas: al estar etiquetado como linea base no-branch, sirve como referencia frente a checkpoints con políticas ramificadas.
- Capacidades heredadas del modelo base (generacion de texto, codigo, razonamiento, agentes, tool calling, multilingue): no disponible en la informacion proporcionada.
- Capacidades de agente de software: la ejecucion se hizo con acciones de shell y sandboxes, lo que sugiere entrenamiento orientado a tareas de ingenieria, aunque no se documentan capacidades finales del checkpoint.

## Casos de uso

- Reanudacion de un run de RL: cargar `iter_0000008` con el código Miles/Megatron compatible, los activos originales de Qwen3.8-27B y las imagenes de tarea y servicios de verificacion externos, y continuar el entrenamiento desde el paso 8 sin repetir los pasos previos.
- Auditoria de reproducibilidad: verificar la integridad del checkpoint reconstruyendo los ocho fragmentos `.distcp` a partir de `parts.json` y validando con `sha256sum -c iter_0000008.SHA256SUMS` antes de cualquier uso.
- Estudio de estabilidad de GRPO: analizar el estado del optimizador en el paso 8 con un learning rate de 2e-6 y batch global 256 para estudiar varianza de gradientes o saturacion de la politica en tareas de codigo.
- Linea base para ablaciones: comparar una futura variante con branching contra este checkpoint no-branch, manteniendo constante el corpus SWE-rebench v2 Filtered y la configuracion de agentes.
- Investigacion sobre agentes de ingenieria de software: inspeccionar como evoluciona la politica en un corpus de 1.586 tareas resueltas mediante acciones de shell, para estudiar estrategias de exploracion y uso de herramientas.
- Analisis del consumo de datos: usar `rollout/global_dataset_state_dict_8.pt` para determinar que subconjunto del corpus se ha consumido en la iteracion 8 y planificar la composicion de las siguientes.
- Formacion y docencia en RL distribuido: el repositorio documenta una topologia concreta (TP=2, CP=4 sobre 8 GPU B300) que sirve como ejemplo practico de configuracion de paralelismo en Miles/Megatron.
- Cadena de custodia de artefactos: el marcador `checkpoint_complete.json` con hash publicado permite construir pipelines de verificacion de integridad para checkpoints de entrenamiento en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento archivado: 8 GPU NVIDIA B300 con paralelismo de tensor 2 y paralelismo de contexto 4. No se documentan requisitos minimos alternativos.
- Inferencia: no disponible. Los pesos para inferencia directa se publican en un export `safetensors` aparte, y este repositorio no los incluye. Como referencia aritmetica no verificada, un modelo denso de 27 000 millones de parametros en BF16 ocuparia del orden de 54 GB solo en pesos, cifra que no se confirma en la informacion proporcionada.
- GPU de consumo: no disponible. No hay datos de cuantizacion ni de formato GGUF asociados a este repositorio.
- Almacenamiento: el repositorio ocupa 18,1 GB, y durante la reconstruccion de los fragmentos se necesita espacio adicional para los `.distcp` ensamblados.
- Opciones de despliegue: no disponible para este artefacto. El unico flujo documentado es la carga mediante el stack Miles/Megatron para entrenamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con alternativas. La unica comparacion documentable es entre este artefacto y su modelo base.

| Elemento | Tipo | Licencia | Contenido | Benchmarks |
|---|---|---|---|---|
| wanna0720/qwen38-27b-swerebench-grpo-step8-training-state | Checkpoint de entrenamiento GRPO | apache-2.0 | 18,1 GB; pesos, estado del optimizador, metadatos y cursor del dataset | no disponible |
| Qwen/Qwen3.8-27B | Modelo base | apache-2.0 | no disponible | no disponible |
| Export `safetensors` para inferencia | Pesos para inferencia | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de inferencia. Cargarlo como si fuese un modelo de `transformers` o servirlo con vLLM, TGI o llama.cpp no es un flujo soportado.
- Riesgo de seguridad: el archivo `.metadata` de DCP es un pickle de PyTorch y la propia model card advierte de que solo debe cargarse desde una fuente de confianza. La deserializacion de pickles no verificados puede ejecutar codigo arbitrario.
- Dependencias externas no incluidas: la reanudacion exige el codigo Miles/Megatron correspondiente, los activos originales de Qwen3.8-27B, los datos de prompt derivados exactos y servicios de verificacion e imagenes de tarea compatibles. Sin ellos el checkpoint no es utilizable.
- Sin evaluacion publicada: no hay resultados de benchmarks, por lo que se desconoce la calidad real de la politica en el paso 8 y no se puede afirmar que mejore al modelo base.
- Corpus especializado y sesgo de dominio: el ajuste se limita a 1.586 tareas de SWE-rebench v2 Filtered, con agentes de shell, por lo que cualquier capacidad fuera de ese dominio queda sin evidencia.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales externas de validacion por parte de la comunidad.
- Idiomas no declarados: no se especifica cobertura multilingue ni comportamiento fuera del ingles tecnico previsible en el corpus de origen.
- Licencia: se declara apache-2.0 tanto en el repositorio como en el modelo base, pero la model card no detalla terminos adicionales sobre los datos de entrenamiento derivados ni sobre el uso comercial del checkpoint.
- Integridad: la verificacion depende de `parts.json` y de `iter_0000008.SHA256SUMS`. Omitir la comprobacion de SHA-256 antes de cargar deja abierta la posibilidad de usar un checkpoint incompleto o alterado.
- Fecha y trazabilidad: el repositorio se creo el 2026-10-04 y se actualizo el 2026-10-05. No se documenta mantenimiento posterior ni plan de soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wanna0720/qwen38-27b-swerebench-grpo-step8-training-state
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados tecnicos relacionados con el modelo.
