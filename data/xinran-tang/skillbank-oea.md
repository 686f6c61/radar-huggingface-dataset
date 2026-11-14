# XinRan-Tang/skillbank-oea

## Resumen

Skillbank-oea es el repositorio de SkillBanks asociado a SkillEarth, un marco de trabajo presentado en el articulo arXiv 2611.15481 y desarrollado por investigadores de Tsinghua University (Institute for AI Industry Research), Dalian University of Technology y Beijing Institute of Radio Measurement. No se trata de un modelo de lenguaje con pesos entrenados, sino de una coleccion de ficheros de habilidades reutilizables (skill banks) en formato `SKILL.md` que ensenan a agentes de proposito general a ejecutar flujos de trabajo geoespaciales guiados por herramientas.

El repositorio contiene bancos de habilidades para 60 tipos de tareas del benchmark OpenEarth-Bench, con una version por cada modelo backbone evaluado: GPT-5.6-Terra, Doubao-Seed-2.0-Mini, DeepSeek-V4-Flash, DeepSeek-R1, Qwen2.5-7B-Instruct, Qwen3-4B-Instruct y Mistral-v0.3-Instruct. Cada habilidad especifica su condicion de activacion, plan de ejecucion, reglas de enrutamiento de observaciones fundamentadas e interfaces de herramientas requeridas.

Su relevancia actual radica en que propone una via de evolucion de habilidades (skill evolution) para dotar a agentes generalistas de capacidades de teledeteccion y analisis geoespacial sin reentrenar el modelo base, lo que reduce costes y permite reutilizar infraestructura de agentes existente. El repositorio tiene un tamano de 0.0 GB, no registra descargas ni likes y no dispone de licencia, idiomas ni pipeline declarados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene ficheros `SKILL.md`, no pesos de modelo) |
| Parametros totales | no disponible (depende del backbone; los backbones listados van de 4B a modelos propietarios sin parametros publicos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (artefactos en Markdown: `SKILL.md`) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo neuronal, sino bancos de habilidades estructuradas en directorios por backbone (`<backbone>/<skill-name>/SKILL.md`). Cada fichero `SKILL.md` define, para una tarea geoespacial concreta, la condicion de activacion de la habilidad, el plan de ejecucion paso a paso, las reglas de enrutamiento de observaciones fundamentadas y las interfaces de herramientas necesarias. El mecanismo subyacente es la evolucion de habilidades: las habilidades se extraen y refinan para guiar la ejecucion multi-paso de herramientas por parte de un agente de proposito general.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF o DPO, ya que el repositorio no entrena un modelo base. La innovacion tecnica destacable es el propio marco SkillEarth, que desacopla la capacidad geoespacial del modelo backbone mediante habilidades reutilizables y evaluables en los benchmarks OpenEarth-Bench (modo End-to-End) y Earth-Bench (modo IF).

## Capacidades

- Ejecucion de flujos de trabajo geoespaciales guiados por herramientas en 60 tipos de tareas de OpenEarth-Bench.
- Activacion condicional de habilidades segun el contexto de la tarea.
- Planificacion multi-paso de llamadas a herramientas geoespaciales.
- Enrutamiento de observaciones fundamentadas (grounded observation routing) para conectar resultados intermedios con la siguiente accion.
- Reutilizacion de habilidades entre distintos backbones (desde Qwen3-4B-Instruct hasta GPT-5.6-Terra).
- Integracion con scripts de inferencia del proyecto SkillEarth (`scripts/inference/inference_oea.sh`).
- Capacidades multilingues: no disponible.
- Soporte de vision, audio o thinking mode: no disponible.

## Casos de uso

- Analisis de imagenes de satelite multi-paso: el agente activa la habilidad correspondiente del SkillBank y encadena herramientas de lectura, preprocesado e interpretacion de imagenes de teledeteccion segun el plan definido en `SKILL.md`.
- Automatizacion de tareas cartograficas: las habilidades especifican interfaces de herramientas y reglas de enrutamiento para generar mapas tematicos a partir de datos geoespaciales, reduciendo la necesidad de prompts ad hoc.
- Evaluacion comparativa de backbones: al disponer de un SkillBank por backbone (Qwen3-4B-Instruct, DeepSeek-R1, Mistral-v0.3-Instruct, etc.), se puede medir como afecta el modelo base al rendimiento del agente en OpenEarth-Bench.
- Investigacion en agentes auto-evolutivos: el repositorio sirve como material de referencia para estudiar la extraccion y refinado de habilidades a partir de trazas de ejecucion.
- Despliegue de asistentes geoespaciales sobre modelos pequenos: con backbones de 4B a 7B (Qwen3-4B-Instruct, Qwen2.5-7B-Instruct) se puede montar un agente geoespacial en infraestructura modesta usando las habilidades ya destiladas.
- Reproducibilidad de experimentos: el layout por backbone y el script de inferencia permiten replicar los resultados del paper en OpenEarth-Bench y Earth-Bench.
- Integracion en pipelines de observacion de la Tierra: las habilidades pueden incorporarse en flujos operativos que requieran orquestacion de herramientas SIG y de analisis de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona comparaciones cuantitativas con agentes de teledeteccion existentes en OpenEarth-Bench (modo End-to-End) y Earth-Bench (modo IF) en la Figura 1 del articulo, pero no se incluyen los valores numericos en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el SkillBank en si (son ficheros de texto); depende del backbone elegido.
- GPU recomendadas: no disponible; condicionadas por el backbone (los backbones de 4B a 7B pueden ejecutarse en GPU consumer, los propietarios como GPT-5.6-Terra o Doubao-Seed-2.0-Mini se acceden via API).
- Cabe en GPU consumer: si, para los backbones Qwen3-4B-Instruct, Qwen2.5-7B-Instruct y Mistral-v0.3-Instruct, sujeto a cuantizacion; no disponible el detalle exacto.
- Opciones de despliegue: el repositorio se usa con el proyecto SkillEarth mediante `bash scripts/inference/inference_oea.sh`; no se especifican frameworks de servicio (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Aspecto | skillbank-oea (SkillEarth) | skillbank-eb (SkillEarth) | Agentes de teledeteccion existentes |
|---|---|---|---|
| Tipo de artefacto | Bancos de habilidades `SKILL.md` para OpenEarth-Bench | Bancos de habilidades `SKILL.md` para Earth-Bench | Modelos o agentes con pesos propios |
| Backbones cubiertos | 7 (GPT-5.6-Terra, Doubao-Seed-2.0-Mini, DeepSeek-V4-Flash, DeepSeek-R1, Qwen2.5-7B-Instruct, Qwen3-4B-Instruct, Mistral-v0.3-Instruct) | no disponible en detalle | no disponible |
| Tareas cubiertas | 60 tipos de tarea de OpenEarth-Bench | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Parametros y contexto | no aplica (depende del backbone) | no aplica | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo con pesos: no puede ejecutarse por si solo; requiere un backbone y el codigo de SkillEarth.
- Sin licencia declarada: no se especifican condiciones de uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- Cobertura limitada al dominio geoespacial y a las 60 tareas de OpenEarth-Bench; no se documentan capacidades fuera de ese ambito.
- Idiomas soportados no disponibles: no se garantiza comportamiento multilingue.
- Riesgo de alucinacion y sesgos: no documentados en el repositorio; al depender del backbone, hereda los sesgos y limitaciones de este.
- Dependencia de las interfaces de herramientas: las habilidades asumen interfaces concretas; cambios en las herramientas pueden invalidar los planes definidos en `SKILL.md`.
- Repositorio sin descargas ni likes y con tamano de 0.0 GB: no hay evidencia de validacion externa ni de mantenimiento continuo.
- El articulo referenciado (arXiv 2611.15481) debe consultarse para detalles metodologicos y resultados que no aparecen en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XinRan-Tang/skillbank-oea
- SkillBank para Earth-Bench: https://huggingface.co/XinRan-Tang/skillbank-eb
- Pagina del proyecto SkillEarth: https://xinr-tang.github.io/SkillEarth-homepage/
- Articulo arXiv: https://arxiv.org/abs/2611.15481
