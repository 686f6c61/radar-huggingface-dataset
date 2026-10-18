# vanishingradient/deepagents-rl-coding

## Resumen

`vanishingradient/deepagents-rl-coding` es un repositorio de HuggingFace publicado por el usuario `vanishingradient` que implementa un pipeline de rollouts y evaluación de agentes de código sobre el harness `deepagents`. No se trata de un modelo de lenguaje con pesos publicados: la model card describe el protocolo para ejecutar un agente sobre SWE-bench Lite, exportar el `git diff` y calificarlo dentro de la imagen Docker oficial de cada instancia. El repositorio ocupa 0,1 GB y no declara pipeline, licencia, idiomas ni especificaciones del modelo subyacente.

El problema que aborda es la evaluación fiable de agentes de programación en tareas de larga duración. En lugar de usar recompensas proxy o heurísticas de solapamiento de archivos, el harness aplica el parche del agente y ejecuta el `eval_script` oficial de SWE-bench, con verificación de `FAIL_TO_PASS` y `PASS_TO_PASS`. Es relevante para investigación en RL con recompensas verificables y para comparar modelos bajo un mismo scaffold de herramientas.

La información disponible no incluye arquitectura, número de parámetros, longitud de contexto, cuantizaciones ni datos de entrenamiento del LLM que se conecta al harness. El modelo se configura externamente mediante `MODEL_BASE_URL` y `MODEL_NAME`, por lo que el repositorio es agnóstico respecto al modelo servido. No se han publicado resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; el repositorio contiene un harness de agente, no una arquitectura de red neuronal publicada |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE; no se publican pesos) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; no se incluyen pesos cuantizables |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio contiene código Python y artefactos de evaluación, no pesos |
| Tipo de artefacto | Repositorio de código: harness de entrenamiento/evaluación de agentes |
| Tamaño del repositorio | 0,1 GB |
| Pipeline de HuggingFace | No disponible |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 2026-10-18 |
| Última actualización | 2026-10-18 |

## Arquitectura y entrenamiento

El repositorio se presenta como `deepagents-rl` y su model card detalla el protocolo de rollouts y evaluación, no una arquitectura de modelo. El bucle del agente opera sobre un sandbox creado mediante `git checkout` del repositorio y del `base_commit` de cada instancia de SWE-bench Lite. El agente edita archivos con las herramientas de `deepagents` (`ls`, `read_file`, `edit_file`, `execute` y otras), y al finalizar se exporta el `git diff` como `model_patch`. La evaluación se realiza dentro de la imagen Docker de la instancia: se aplica el parche, se ejecuta el `eval_script` oficial, se parsea la salida delimitada por `>>>>> Start/End Test Output` y se marca `resolved = FULL` solo si todos los `FAIL_TO_PASS` pasan y todos los `PASS_TO_PASS` se mantienen.

No se especifican el algoritmo de optimización ni el proceso de entrenamiento: la model card no documenta PPO, GRPO, DPO, RLHF, número de tokens, composición del dataset ni fases de alineamiento. La innovación técnica destacable es el uso de la evaluación Docker oficial como señal de recompensa, junto con un registro exhaustivo de cada etapa: `run.log`, `events.jsonl`, `trajectories.jsonl` y `evals/<episode_id>/` con `model.patch`, `eval.sh`, `test_output.txt` y `report.json`. Las trazas se estructuran en Langfuse con spans anidados para el bucle del agente, cada turno, cada llamada LLM, cada herramienta y el grader.

## Capacidades

- El artefacto no expone un modelo propio; las capacidades siguientes corresponden al harness y al agente que se conecte a él.
- Orquestación de rollouts de agente sobre instancias de SWE-bench Lite en modo `tool_loop`.
- Soporte de tool calling mediante las herramientas de `deepagents`: listado, lectura, edición y ejecución.
- Razonamiento multi-paso y bucles de herramientas con registro de cada turno y cada llamada.
- Exportación del parche del agente como `git diff` para su evaluación reproducible.
- Evaluación con Docker oficial: aplicación de parche, ejecución de `eval_script`, pytest y parseo de `FAIL_TO_PASS`/`PASS_TO_PASS`.
- Trazabilidad con Langfuse y W&B, con puntuaciones `pass_frac`, `reward_total`, `resolved` y `n_tool_calls`.
- Verificación del grader con `scripts/verify_swe_docker_grader.py`, que exige que el parche gold resuelva `FULL`.
- Capacidades multilingües, visión, audio o modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación reproducible de agentes de código en SWE-bench Lite: el harness carga cada instancia, ejecuta el agente en un sandbox con el `base_commit` correcto y califica el parche con el `eval_script` oficial dentro de Docker. Es adecuado porque evita proxies de recompensa y exige que se mantengan los tests `PASS_TO_PASS`.
- Entrenamiento RL con recompensa verificable: `resolved` y `pass_frac` pueden usarse como señal de recompensa para técnicas de RL; el repositorio registra trayectorias completas en `trajectories.jsonl` para análisis offline o ajuste posterior.
- Auditoría y depuración de trayectorias: `events.jsonl` y las trazas de Langfuse permiten reproducir cada turno, cada argumento de herramienta y cada comando Docker, lo que facilita localizar fallos del agente o del grader.
- Comparación de modelos bajo un mismo scaffold: al configurar `MODEL_BASE_URL` y `MODEL_NAME`, se pueden evaluar distintos modelos servidos externamente con las mismas herramientas y el mismo protocolo de calificación.
- Generación de datasets de trayectorias para fine-tuning: las trayectorias incluyen mensajes, llamadas de herramientas, parches y resultados de evaluación, lo que permite construir datos supervisados o de preferencia a partir de episodios reales.
- Integración en CI/CD de agentes: un pipeline puede ejecutar `verify_swe_docker_grader.py` y rollouts limitados antes de desplegar un agente, usando Docker como entorno aislado y el informe `report.json` como criterio de aceptación.
- Investigación sobre uso de herramientas y edición de código: el conjunto de herramientas `ls`/`read_file`/`edit_file`/`execute` permite estudiar estrategias de exploración, edición y ejecución de tests en tareas SWE.
- Validación de infraestructura de evaluación: el script de verificación comprueba que el parche gold resuelve `FULL`, lo que sirve para validar imágenes Docker, dependencias y el propio grader antes de lanzar experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible; depende del modelo que se sirva externamente y se configure con `MODEL_BASE_URL` y `MODEL_NAME`. El repositorio no incluye pesos.
- GPU recomendadas: no disponibles para el harness; el repositorio no entrena pesos, solo orquesta llamadas a un endpoint y ejecuta tests en Docker. Para el modelo subyacente no se especifica ninguna GPU.
- GPU de consumo: no aplica al harness; para el modelo subyacente no hay datos que permitan confirmar si cabe en una RTX 4090 u otra GPU de consumo.
- Opciones de despliegue: scripts Python y Docker Desktop/Engine. El modelo se sirve fuera del repositorio y se conecta mediante variables de entorno. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; están dominados por el modelo servido y por el tiempo de ejecución de pytest dentro de la imagen Docker de cada instancia.
- CPU, RAM y disco: no se documentan requisitos mínimos. El harness necesita Docker en ejecución, imágenes de instancia de SWE-bench Lite y checkouts de repositorios, además de espacio para `artifacts/swe_lite/`.

## Comparativa con modelos similares

| Proyecto | Categoría | Scaffold | Evaluación | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| `vanishingradient/deepagents-rl-coding` | Harness de agente de código | `deepagents` | Docker oficial de SWE-bench con `eval_script` y F2P/P2P | No disponible | No disponible |
| SWE-bench oficial | Benchmark y harness de evaluación | No aplica | Docker oficial con `eval_script` y F2P/P2P | No disponible en la información | No disponible |
| SWE-agent / OpenHands | Harnesses de agentes para tareas SWE | No disponible | No disponible en la información | No disponible en la información | No disponible |

Este repositorio no publica parámetros, contexto ni resultados, por lo que no es posible una comparación cuantitativa con alternativas. La comparación disponible es funcional: comparte con el harness oficial de SWE-bench el uso de la imagen Docker y el `eval_script` de cada instancia, y se diferencia por el uso del scaffold `deepagents` y por el registro estructurado de trayectorias en Langfuse.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, tokenizador ni configuración de inferencia; no puede usarse directamente para generar texto o código.
- La licencia no está disponible, por lo que no se puede asumir permiso para uso comercial, redistribución o modificación.
- No se documentan sesgos, riesgos de alucinación ni comportamiento del modelo subyacente; estas propiedades dependen del LLM que se conecte al harness.
- No se especifican idiomas soportados ni limitaciones de contexto; no hay datos para evaluar el rendimiento multilingüe.
- La evaluación se limita a SWE-bench Lite según la model card; no se documenta su comportamiento en otros benchmarks o dominios.
- El harness depende de Docker en ejecución y de imágenes de instancia; la disponibilidad, el tamaño y la reproducibilidad de esas imágenes pueden afectar a los resultados.
- La ejecución de código del agente dentro del sandbox requiere aislamiento cuidadoso; un agente puede ejecutar comandos arbitrarios y consumir recursos.
- No se documentan semillas, número de rollouts, configuración de temperatura ni criterios de parada, lo que limita la reproducibilidad experimental.
- El nombre del autor, `vanishingradient`, puede confundirse con el problema del gradiente desvaneciente; los resultados de búsqueda web disponibles sobre ese tema no guardan relación con este repositorio.
- No hay información sobre el algoritmo de RL ni sobre datos de entrenamiento, por lo que no se puede verificar qué se entrena exactamente ni con qué señal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vanishingradient/deepagents-rl-coding
- Dataset SWE-bench Lite citado en la model card: https://huggingface.co/datasets/SWE-bench/SWE-bench_Lite
- No se han encontrado enlaces a paper, blog, repositorio de código o demo en la información disponible.
- Los resultados de búsqueda web proporcionados tratan sobre el problema del gradiente desvaneciente y no son relevantes para este artefacto.
