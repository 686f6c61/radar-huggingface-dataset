# weideyouni/holoaeon

## Resumen

HoloAeon es un framework cognitivo para la construccion de sistemas multiagente sobre modelos de lenguaje, publicado por el usuario weideyouni en Hugging Face bajo el identificador `weideyouni/holoaeon`. No se trata de un modelo de lenguaje con pesos entrenados, sino de una libreria de software escrita en Python puro que proporciona primitivas para orquestar agentes: envelopes, bus de mensajes, agentes, habilidades, memoria, planificador por latidos, guarda de seguridad, grafo de colaboracion adaptativo, cluster de actores en paralelo y una capa de adaptadores de modelo.

El proyecto se presenta como una implementacion sin dependencias externas (solo biblioteca estandar de Python), totalmente offline y determinista, orientada a construir sistemas multiagente sobre cualquier modelo de lenguaje, ya sea local, privado o en la nube. Incluye nueve paquetes de dominio listos para usar y una capa de optimizacion y busqueda auto-organizada. La version documentada en la model card es la 0.9.2, con un endurecimiento de evidencias denominado V2.

La relevancia del repositorio en Hugging Face es marginal: cuenta con cero descargas, cero likes, un tamano de repositorio de 0.0 GB y carece de pipeline, licencia e idiomas declarados en los metadatos de la plataforma. La informacion disponible corresponde exclusivamente al contenido de la model card y a los metadatos publicos, por lo que muchas especificaciones propias de un modelo de lenguaje no son aplicables o no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de software multiagente en Python; no es un modelo neuronal con pesos |
| Parametros totales | no disponible (no aplica: no es un modelo de lenguaje) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo subyacente conectado mediante adaptadores) |
| Tipos de cuantizacion | no disponible (no aplica al framework) |
| Idiomas soportados | no disponible en metadatos; la documentacion esta en ingles y chino |
| Licencia | Apache 2.0 segun los badges de la model card; no declarada en los metadatos de Hugging Face |
| Formato de pesos | no disponible (no contiene pesos; es codigo Python) |

## Arquitectura y entrenamiento

HoloAeon no es un transformer ni un modelo generativo: es un framework de orquestacion construido de abajo arriba sobre doce primitivas pequenas, inspeccionables y testeables. La model card describe capas para envelopes, bus de mensajes, agentes, habilidades, memoria, un planificador basado en latidos, una guarda de seguridad, un grafo de colaboracion adaptativo, un cluster de actores en paralelo, representaciones hiperdimensionales y una capa de adaptadores de modelo. La topologia se describe como logica y dispersa: la matriz grande es un espacio de coordenadas logico que nunca se preasigna, y los nodos se activan de forma dispersa.

No hay datos de entrenamiento, tokens, composicion de dataset ni procesos de RLHF o DPO, porque el artefacto no se entrena. La innovacion tecnica declarada es la determinacion estricta (misma entrada, misma salida, con verificacion `DIFF=0`), el funcionamiento offline sin llamadas de red ni telemetria, y un mecanismo de "fail-loud" con tres reglas duras que no permiten degradar un veredicto en rojo. La version V2 anade maquinaria de evidencias lateral: mutacion de hashes (5/5), validacion k-fold sobre un corpus de 235 consultas con media 0.9957 y desviacion 0.0085 en cinco folds de estilo, y un fichero `repro_core.jsonl` con diez filas verificables por hash.

## Capacidades

- Orquestacion multiagente: proporciona primitivas para definir agentes, habilidades, memoria y comunicacion mediante un bus de mensajes.
- Adaptacion a cualquier modelo: capa de adaptadores para conectar modelos locales, privados o en la nube, incluidos modelos con API.
- Ejecucion offline y determinista: sin llamadas de red, sin claves embebidas y sin telemetria; apto para maquinas aisladas.
- Paquetes de dominio: nueve paquetes listos para usar orientados al trabajo de profesionales del conocimiento, mas al menos siete paquetes de extension.
- Planificacion y colaboracion: planificador por latidos, grafo de colaboracion adaptativo y cluster de actores en paralelo.
- Representaciones hiperdimensionales: capa de representaciones vectoriales descrita en la documentacion del proyecto.
- Optimizacion y busqueda auto-organizada: capa determinista documentada en `ALGORITHM.md`.
- Verificacion de evidencias: scripts de mutacion, k-fold y reproduccion con hashes recomputables.
- Soporte de tool calling y agentes multi-paso: no disponible de forma explicita en la informacion proporcionada; depende de las capacidades del modelo subyacente conectado.
- Capacidades de vision, audio o modo thinking: no disponible.

## Casos de uso

- Orquestacion de agentes sobre modelos locales: el framework permite conectar un modelo servido en local mediante la capa de adaptadores y coordinar varios agentes con memoria y bus de mensajes, util en entornos con requisitos de privacidad.
- Despliegue en entornos air-gapped: al no realizar llamadas de red ni incluir telemetria, puede instalarse en maquinas aisladas para tareas de procesamiento documental con modelos locales.
- Pipelines reproducibles de investigacion: la determinacion estricta y la verificacion `DIFF=0` permiten repetir experimentos con agentes y comparar resultados de forma binaria.
- Automatizacion de flujos de conocimiento: los nueve paquetes de dominio cubren tareas cotidianas de profesionales del conocimiento, como organizacion de informacion y generacion de resumenes mediante agentes especializados.
- Busqueda y optimizacion auto-organizada: la capa determinista de optimizacion descrita en `ALGORITHM.md` puede emplearse para explorar espacios de soluciones con criterios reproducibles.
- Validacion de sistemas multiagente: los scripts de mutacion y k-fold permiten comprobar que las verificaciones detectan cambios reales y no solo reproducen un golden estable.
- Prototipado sin dependencias: al requerir solo la biblioteca estandar de Python, se puede integrar en entornos restringidos donde no se permite instalar paquetes de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos en la informacion disponible. La model card incluye metricas internas del framework, no comparables con benchmarks de modelos de lenguaje:

| Metrica interna | Valor | Metodo |
|---|---|---|
| Mutacion de hash | 5/5 | `python scripts\verax_verify.py --mutate 5` |
| Semvec k-fold | media 0.9957 / desv. 0.0085 en 5 folds | `python scripts\bench_semvec_kfold.py --folds 5` |
| Repro core | 10 filas verificables por hash | `python scripts\repro_core_emit.py --check reports\repro_core.jsonl` |
| Fail-loud | ON (3 reglas duras) | `holoaeon/audit/verdict_policy.py` |
| Conjunto de 12 intenciones | 11/12 | Documentado en la model card |
| Tests | 34 superados | Documentado en la model card |
| Autocomprobaciones | 25/25 | Documentado en la model card |

## Requisitos de hardware

- VRAM: no aplica al framework; el consumo depende del modelo de lenguaje subyacente conectado mediante adaptadores.
- GPU recomendadas: no aplica al framework; dependen del modelo que se orqueste.
- GPU de consumo: el framework en si se ejecuta en CPU con Python 3.8 o superior; los badges indican pruebas en Python 3.13.16 sobre Windows y CI en Python 3.8, 3.10 y 3.12 sobre Ubuntu.
- Opciones de despliegue: instalacion como paquete Python sin dependencias (`dependencies = []`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, aunque la capa de adaptadores permitiria conectar modelos servidos por esas herramientas.
- Latencia y throughput: no disponibles; dependen del modelo subyacente y de la topologia de agentes configurada.

## Comparativa con modelos similares

No disponible. HoloAeon no es un modelo de lenguaje y no se han proporcionado comparaciones con frameworks de agentes alternativos (LangChain, AutoGen, CrewAI u otros) en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no contiene pesos, no genera texto por si mismo y requiere un modelo externo para cualquier tarea generativa.
- Metadatos incompletos en Hugging Face: sin pipeline, sin licencia declarada en la plataforma, sin idiomas y con cero descargas y likes, lo que impide verificar adopcion o mantenimiento.
- Licencia: la model card muestra un badge Apache 2.0, pero los metadatos de Hugging Face no declaran licencia; conviene verificar el fichero `LICENSE` del repositorio antes de un uso comercial.
- Madurez: la version documentada es 0.9.2, anterior a 1.0, con dimensiones declaradas como sin cambios en V2 y limites conocidos recogidos en `docs/spec-diff0-v0.2.md` (§9).
- Evidencias locales: los badges se describen como medidos localmente en una maquina concreta (Python 3.13.16, Windows), aunque la CI se ejecuto en GitHub; la matriz de soporte distingue celdas medidas de celdas no probadas.
- Riesgo de alucinacion: no aplica al framework, pero si al modelo subyacente que se conecte; el framework no documenta mecanismos de mitigacion de alucinaciones.
- Sesgos: no disponibles; dependen del modelo conectado.
- Idioma: la documentacion esta en ingles y chino; no se declara soporte de otros idiomas en la interfaz.
- Advertencia de nomenclatura: los terminos biologicos ("heartbeat", "skin", "cytoskeleton", "meridian", "Hebbian field") son metaforas de arquitectura cognitiva, no estructuras biologicas ni medicas.

## Enlaces

- Hugging Face: https://huggingface.co/weideyouni/holoaeon
- Repositorio GitHub: https://github.com/weideyouni/holoaeon
- Ejecucion de CI en GitHub: https://github.com/weideyouni/holoaeon/actions/runs/41202167792
- Documentacion de algoritmo: `ALGORITHM.md` en el repositorio
- Especificacion diff0 v0.2: `docs/spec-diff0-v0.2.md` en el repositorio
- Matriz de soporte: `docs/support-matrix.md` en el repositorio
- Snapshot V2: `snapshot/SNAPSHOT_V2.md` en el repositorio
- README en chino: `README.zh-CN.md` en el repositorio
