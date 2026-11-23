# veripazari/turkish-humanify

## Resumen

`veripazari/turkish-humanify` es un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje entrenado, sino un *skill* (habilidad) para Claude y un plugin de Claude Code orientado a la "humanización" de texto en turco. El autor original es `durmazoguzhan` y el repositorio ha sido archivado por la plataforma VeriPazarı con el objetivo declarado de preservar la documentación original y contribuir a la comunidad de inteligencia artificial turca. El artefacto es, por tanto, un conjunto de instrucciones y ficheros de referencia en Markdown que se cargan en el contexto de un agente basado en Claude, no unos pesos neuronales.

El problema que aborda es concreto: el turco generado por modelos de lenguaje suele ser gramaticalmente correcto pero estructuralmente plano, porque conserva el esqueleto sintáctico del inglés (modificadores pospuestos, uso abusivo de la conjunción `ve` donde corresponde un converbo, oraciones de longitud uniforme). La skill propone una reescritura en tres capas (composición, arquitectura de la oración y superficie) con pares antes/después trabajados como material de instrucción.

La relevancia es limitada para quien busque un modelo desplegable: no hay arquitectura, parámetros, contexto ni pesos. Su interés reside en el enfoque de ingeniería de prompts para una lengua aglutinante y de ramificación a la izquierda, y en el patrón de empaquetado como plugin de Claude Code con router fino y ficheros de referencia leídos bajo demanda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un skill/plugin de instrucciones en Markdown para Claude) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo Claude anfitrión) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | turco (`tr`); las instrucciones de activación se aceptan en turco o inglés |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el contenido son ficheros `SKILL.md` y referencias Markdown) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red. El repositorio implementa un patrón de *skill* para agentes: un fichero `skills/turkish-humanify/SKILL.md` actúa como router fino y delega en siete ficheros de referencia que se leen en el momento de uso, en lugar de resumirse en memoria. El flujo distingue dos modos: *repair* (se aporta un texto y se reescribe con fidelidad estricta, sin añadir contenido) y *write* (se aporta un brief y se compone directamente en turco antes de la primera frase, para evitar que el esqueleto inglés persista).

La innovación técnica es lingüística, no computacional: sistematiza catorce divergencias entre turco máquina y turco humano, con énfasis en dos ejes. El primero es la dirección de ramificación (el turco antepone modificadores al núcleo, de modo que "Bir sistem kurduk, bu sistem..." pasa a "Her gece verileri tarayıp raporlayan bir sistem kurduk"). El segundo es el sistema de converbos (`-Ip`, `-IncA`, `-DIkçA`), que sustituye la coordinación con `ve` por sufijos de subordinación. También trata la evidencialidad (`-mIş`) y la dosificación de registro y voz. No hay datos de tokens de entrenamiento, composición de dataset ni RLHF/DPO porque no aplica.

## Capacidades

- Reescritura de texto en turco para eliminar marcas de generación automática, preservando el contenido original en modo *repair*.
- Composición de texto nuevo en turco desde un brief, tomando las decisiones de composición en turco antes de redactar.
- Aplicación de reglas de arquitectura oracional: anteposición de modificadores, conversión de coordinaciones en converbos, división de oraciones largas.
- Ajuste de registro y de voz narrativa mediante un mecanismo de "dosis" (registro más voz determinan la intensidad de la transformación).
- Control de evidencialidad y de sufijos verbales innecesarios (por ejemplo, eliminación de `-DIr` en presente).
- Salida limpia: devuelve únicamente el texto, sin preámbulo, informe ni recuento de palabras; solo explica los cambios si se le pregunta.
- Activación automática por descripción, tanto en turco como en inglés.
- Distribución como plugin de Claude Code, instalación vía Skills CLI o copia manual del directorio de skills.

## Casos de uso

- Reescritura de artículos de blog técnico en turco: se pasa el texto generado por un LLM y la skill reconstruye la arquitectura oracional, convirtiendo coordinaciones con `ve` en converbos y acortando oraciones, lo que reduce la sensación de planitud que percibe el lector nativo.
- Corrección de documentación de producto: en modo *repair* con fidelidad bloqueada, se puede humanizar un manual sin riesgo de que se añada información no presente en el original, algo crítico en documentación sujeta a revisión legal.
- Preparación de contenido editorial para marketing: el modo *write* permite redactar directamente en turco desde un brief, evitando el patrón de borrador en inglés traducido y limpiado después.
- Adaptación de guiones o copys para redes: el control de registro y voz permite ajustar el tono (formal, cercano, técnico) sin rehacer el texto desde cero.
- Localización de material formativo: textos de cursos o tutoriales generados automáticamente pueden pasar por la skill para que suenen a autor humano antes de publicarse.
- Integración en un flujo de CI de contenidos: como plugin de Claude Code, puede invocarse desde el agente en tareas de revisión de ficheros Markdown en turco dentro de un repositorio, aplicando la reescritura antes del commit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye pares cualitativos antes/después (por ejemplo, `evals/input/technical-3.md` frente a `evals/output/v11/technical-3.md`), pero no métricas cuantitativas ni comparaciones numéricas con otras herramientas.

## Requisitos de hardware

- No requiere VRAM propia: no hay pesos que cargar. El coste computacional recae íntegramente en el modelo Claude anfitrión.
- GPU recomendadas: no aplica; la inferencia la ejecuta el proveedor del modelo base.
- Cabe en cualquier GPU consumer en la medida en que el modelo anfitrión se ejecute en local, algo que no depende de este repositorio.
- Opciones de despliegue: Claude Code como plugin (`/plugin marketplace add durmazoguzhan/turkish-humanify` seguido de `/plugin install turkish-humanify@durmazoguzhan`), Skills CLI (`npx skills add durmazoguzhan/turkish-humanify --skill turkish-humanify`) o copia manual a `~/.claude/skills/`.
- Latencia y throughput: no disponibles; dependen del modelo Claude y del número de ficheros de referencia que se carguen en cada invocación.
- El tamaño del repositorio en Hugging Face figura como 0.0 GB, coherente con un conjunto de ficheros de texto.

## Comparativa con modelos similares

| Criterio | turkish-humanify | Herramientas de "humanización" por sustitución léxica | Correctores gramaticales para turco |
|---|---|---|---|
| Enfoque | Reescritura de arquitectura oracional en tres capas | Cambio de palabras y sinónimos | Corrección de errores gramaticales |
| Entrada que asume | Turco gramatical pero plano | Turco gramatical pero plano | Turco con errores |
| Parámetros | no aplica (skill) | no disponible | no disponible |
| Contexto | el del modelo Claude anfitrión | no disponible | no disponible |
| Licencia | MIT | no disponible | no disponible |
| Disponibilidad | Hugging Face y GitHub (durmazoguzhan/turkish-humanify) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede ejecutarse de forma autónoma ni genera inferencia por sí mismo; requiere un agente Claude compatible con el formato de skills.
- El repositorio en Hugging Face tiene 0 descargas y 0 likes, y el tamaño declarado es 0.0 GB; conviene verificar que el contenido esté efectivamente presente antes de depender de él.
- La model card está mayoritariamente en inglés y turco, con avisos del archivador (VeriPazarı) que no forman parte del proyecto original; la fuente canónica es el repositorio de GitHub del autor.
- Ámbito lingüístico restringido al turco; no hay soporte declarado para otras lenguas.
- Riesgo de sobrecorrección: al reescribir la arquitectura oracional, una aplicación agresiva puede alterar matices del original, aunque el modo *repair* declara fidelidad bloqueada.
- No hay evaluación cuantitativa publicada que respalde la mejora percibida; la evidencia es cualitativa mediante pares antes/después.
- La licencia MIT permite uso comercial, pero al depender de un modelo Claude anfitrión se heredan las condiciones de uso de dicho proveedor.
- No se documentan sesgos específicos ni tasas de alucinación; al no generar contenido nuevo en modo *repair*, el riesgo de invención se limita al modo *write*.

## Enlaces

- Hugging Face: https://huggingface.co/veripazari/turkish-humanify
- Repositorio original en GitHub: https://github.com/durmazoguzhan/turkish-humanify
- README en turco: https://github.com/durmazoguzhan/turkish-humanify/blob/master/README.tr.md
- Plataforma archivadora: https://veripazari.com.tr
