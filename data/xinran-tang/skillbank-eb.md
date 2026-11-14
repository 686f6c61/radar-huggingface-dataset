# XinRan-Tang/skillbank-eb

## Resumen

SkillBank for Earth-Bench (repo `XinRan-Tang/skillbank-eb`) es un artefacto de conocimiento publicado junto al trabajo SkillEarth, un framework de habilidades auto-evolutivas para agentes de propósito general que operan sobre tareas geoespaciales. No es un modelo de lenguaje entrenado, sino una colección de ficheros `SKILL.md` que codifican procedimientos reutilizables de uso de herramientas para los flujos de trabajo del benchmark Earth-Bench, cubriendo tareas espectrales, de producto y RGB. Cada habilidad describe cuándo aplica, un plan de ejecución, reglas de enrutamiento de observaciones fundamentadas y las interfaces de herramientas requeridas.

El banco está construido sobre el backbone Qwen3-4B-Instruct-2507 y soporta dos modos de operación: planificación automática (Automatic Planning, AP) e instrucción directa (Instruction Following, IF). El repositorio pertenece al ecosistema del paper arXiv:2611.15481, firmado por investigadores de Tsinghua AIR, la Universidad Politécnica de Dalian y el Beijing Institute of Radio Measurement.

Su relevancia es metodológica más que de modelo: muestra cómo un agente generalista de 4B parámetros puede abordar tareas de teledetección mediante evolución de habilidades y uso de herramientas, en lugar de un modelo especializado de gran escala. El repositorio no contiene pesos, tiene 0 GB de tamaño y no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica (banco de habilidades en ficheros `SKILL.md`); backbone asociado: Qwen3-4B-Instruct-2507 |
| Parámetros totales | No disponible (el artefacto no contiene pesos; el backbone es de 4B) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No aplica; ficheros Markdown (`SKILL.md`) organizados por directorio de backbone |

## Arquitectura y entrenamiento

El repositorio no distribuye un modelo con arquitectura de red neuronal propia. Su estructura es un árbol de directorios cuyo nivel superior identifica el backbone (`qwen3-4b-instruct-2507/`) y cuyos subdirectorios contienen cada uno un fichero `SKILL.md` con la especificación de una habilidad. Cada habilidad documenta condiciones de aplicabilidad, un plan de ejecución por pasos, reglas de enrutamiento de observaciones y las interfaces de herramientas necesarias para completar la tarea dentro de Earth-Bench.

El entrenamiento subyacente es el del backbone Qwen3-4B-Instruct-2507, sobre el que SkillEarth aplica un proceso de evolución de habilidades: extracción y refinamiento de procedimientos reutilizables que guían la ejecución multi-paso con herramientas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación destacable es el propio mecanismo de banco de habilidades como capa de conocimiento desacoplada del modelo, reutilizable entre tareas y modos (AP e IF).

## Capacidades

- Ejecución guiada por habilidades de flujos de trabajo con herramientas para Earth-Bench, en tareas espectrales, de producto y RGB.
- Planificación automática (AP): el agente selecciona y encadena habilidades y herramientas de forma autónoma.
- Instrucción directa (IF): ejecución siguiendo instrucciones explícitas con apoyo del banco de habilidades.
- Enrutamiento de observaciones fundamentadas hacia las herramientas adecuadas según reglas definidas en cada `SKILL.md`.
- Integración con el runner de SkillEarth mediante copia del directorio del backbone a `skillbank/`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y function calling: implícitos en el diseño (interfaces de herramientas requeridas), sin detalle de formatos en la información disponible.

## Casos de uso

- Evaluación de agentes en Earth-Bench: cargar el banco en el runner de SkillEarth para reproducir los resultados del paper en modo AP e IF sobre el backbone Qwen3-4B-Instruct-2507.
- Análisis espectral de imágenes de satélite: las habilidades espectrales guían la selección de índices y herramientas de procesamiento adecuadas para cada consulta.
- Consultas sobre productos geoespaciales: las habilidades de producto enrutan la petición hacia las herramientas de catálogo y metadatos correspondientes.
- Tareas sobre imágenes RGB: las habilidades RGB estructuran el plan de ejecución para análisis visual de escenas.
- Investigación en evolución de habilidades: servir de base para estudiar cómo se extraen, refinan y reutilizan procedimientos en agentes generalistas.
- Desarrollo de agentes geoespaciales de bajo coste: permite evaluar un agente de 4B parámetros frente a aproximaciones especializadas de mayor tamaño.
- Reproducibilidad de experimentos: el formato `SKILL.md` versionable facilita auditar y comparar variantes de habilidades entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona comparaciones cuantitativas con agentes de teledetección existentes en OpenEarth-Bench (modo End-to-End) y Earth-Bench (modo IF) en la Figura 1 del paper, pero no se incluyen cifras en el repositorio.

## Requisitos de hardware

- El repositorio no contiene pesos; los requisitos dependen del backbone Qwen3-4B-Instruct-2507.
- VRAM estimada para el backbone: no disponible en la información proporcionada; para un modelo de 4B, la inferencia en FP16 requiere aproximadamente 8 GB, y en cuantización de 4 bits en torno a 2,5-3 GB, como estimación orientativa no confirmada por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el banco se integra con el runner de SkillEarth; las opciones de servicio del backbone (vLLM, llama.cpp, Ollama, TGI) no se detallan en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo/artefacto | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skillbank-eb (este repo) | Banco de habilidades para Earth-Bench | No aplica (backbone 4B) | No disponible | No disponible | Hugging Face |
| skillbank-oea | Banco de habilidades para OpenEarth-Bench | No aplica | No disponible | No disponible | Hugging Face (`XinRan-Tang/skillbank-oea`) |
| Qwen3-4B-Instruct-2507 | Modelo de lenguaje backbone | 4B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; no puede usarse de forma autónoma sin el backbone y el runner de SkillEarth.
- Las habilidades están acopladas al benchmark Earth-Bench y a las interfaces de herramientas definidas en él; su transferencia a otros dominios no está validada en la información disponible.
- No se especifica licencia, lo que impide confirmar condiciones de uso comercial.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas.
- El estado del repositorio (0 descargas, 0 likes, 0 GB) sugiere que no ha sido validado por la comunidad.
- La fecha de creación indicada (2026-11-14) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XinRan-Tang/skillbank-eb
- Repositorio hermano (OpenEarth-Bench): https://huggingface.co/XinRan-Tang/skillbank-oea
- Página del proyecto SkillEarth: https://xinr-tang.github.io/SkillEarth-homepage/
- Paper arXiv: https://arxiv.org/abs/2611.15481
