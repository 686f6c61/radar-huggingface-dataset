# speediedan/rte

## Resumen

`speediedan/rte` es un componente del ecosistema **interpretune**, una libreria orientada al analisis de interpretabilidad de modelos de lenguaje. No se trata de un modelo de lenguaje generativo al uso, sino de un repositorio de configuraciones, modulos y datamodules empaquetados bajo un manifiesto (`it_component.yaml`, esquema v1) que define como ejecutar experimentos de interpretabilidad sobre la tarea **RTE (Recognizing Textual Entailment)** del benchmark SuperGLUE.

El repositorio agrupa 16 configuraciones nombradas que combinan distintos modelos base (GPT-2, Gemma 2, Gemma 3 y Qwen 3) con diferentes herramientas de analisis: `circuit_tracer`, `nnsight`, `sae_lens`, `transformer_lens`, `neuronpedia` y estrategias de entrenamiento como `core`, `ft` (fine-tuning), `latent` y `sparse`. Tambien incluye soporte para entrenamiento distribuido mediante FSDP2 en algunas configuraciones.

Su relevancia es acotada y muy especifica: sirve como artefacto reproducible para investigadores que quieran replicar o extender estudios de circuitos, activaciones dispersas y trazado de caracteristicas sobre una tarea de clasificacion de pares de frases (entailment, contradiccion, neutralidad). No es un modelo para desplegar en produccion ni para generacion de texto; es infraestructura de investigacion empaquetada. El repositorio no registra descargas ni interacciones, lo que sugiere un uso interno o experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (contenedor de configuraciones sobre GPT-2, Gemma 2, Gemma 3 y Qwen 3) |
| Parametros totales | no disponible (depende del modelo base de cada configuracion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (manifiesto `it_component.yaml` y ficheros auxiliares `chain`, `ft_schedules`, `runs`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: es un contenedor de componentes para la libreria interpretune que orquesta modelos preentrenados de terceros (GPT-2, Gemma 2, Gemma 3, Qwen 3) sobre la tarea RTE de SuperGLUE (dataset `aps/super_glue`). Cada configuracion declara un modelo base y una combinacion de herramientas de interpretabilidad o de estrategia de ajuste.

Las configuraciones se organizan en cuatro familias segun el prefijo: `rte_demo.*` para demostraciones de trazado de circuitos y extraccion de caracteristicas (con `circuit_tracer`, `nnsight`, `neuronpedia`, `sae_lens`), `rte_ft.*` para fine-tuning supervisado sobre RTE (con `core`, `nnsight`, `transformer_lens`), `rte_latent.*` para analisis de representaciones latentes con FSDP2 y `rte_sparse.*` para experimentos con activaciones dispersas. La resolucion es "manifest-first": se descarga primero el manifiesto y despues solo la configuracion necesaria, lo que reduce el coste de almacenamiento. No se especifican volumenes de datos de entrenamiento, composicion del dataset ni si hubo RLHF o DPO; al tratarse de una tarea de clasificacion supervisada, el ajuste se limita a las etiquetas de RTE.

## Capacidades

- Ejecucion de la tarea RTE (Recognizing Textual Entailment) de SuperGLUE: clasificacion de pares premisa-hipotesis en entailment, contradiccion y neutralidad.
- Trazado de circuitos (`circuit_tracer`) sobre modelos transformer para identificar subgrafos responsables de la prediccion.
- Analisis de activaciones con `nnsight` y `transformer_lens`.
- Extraccion y uso de autoencoders dispersos (`sae_lens`) para interpretar caracteristicas latentes.
- Integracion con `neuronpedia` para visualizacion y exploracion de caracteristicas.
- Entrenamiento con precision distribuida mediante FSDP2 en las configuraciones que lo declaran.
- Soporte de fine-tuning (`rte_ft.*`) y de experimentos con representaciones latentes (`rte_latent.*`) y dispersas (`rte_sparse.*`).
- No ofrece generacion de texto libre, tool calling, capacidades multimodales ni soporte de agentes.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: replicar experimentos de trazado de circuitos sobre GPT-2 o Gemma 3 usando la tarea RTE como banco de pruebas controlado, con pares de frases y etiquetas bien definidas.
- Estudio de autoencoders dispersos: entrenar y evaluar SAE sobre las activaciones de GPT-2 en RTE mediante la configuracion `rte_demo.gpt2.sae_lens` para identificar caracteristicas interpretables asociadas a la deteccion de entailment.
- Comparativa de metodos de atribucion: usar las configuraciones `nnsight` y `transformer_lens` para contrastar hallazgos entre dos frameworks de intervencion sobre el mismo modelo base.
- Analisis de representaciones latentes: emplear `rte_latent.gemma3.core.fsdp2` para estudiar como se organiza internamente la informacion de entailment en Gemma 3 con entrenamiento distribuido.
- Experimentos de esparsidad: comparar `rte_sparse.gpt2.core` y `rte_sparse.gemma3.core` para evaluar si las representaciones dispersas capturan mejor la estructura de la tarea que las densas.
- Docencia y formacion: usar `rte_demo.gpt2.core` como ejemplo minimo y reproducible de pipeline de interpretabilidad sobre un modelo pequeno y bien conocido.
- Reproducibilidad de publicaciones: servir como artefacto versionado (manifiesto v1) que fija configuraciones exactas para replicar resultados de un articulo o informe tecnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del modelo base de cada configuracion. GPT-2 es viable en GPUs consumer de gama baja; Gemma 3 y Qwen 3 requieren GPUs de mayor capacidad.
- GPU recomendadas: no especificadas por el autor. Las configuraciones con FSDP2 (`rte_demo.gemma3.circuit_tracer+nnsight.fsdp2`, `rte_latent.gemma3.core.fsdp2`) estan pensadas para entrenamiento multi-GPU.
- Cabeza en GPU consumer: probablemente las configuraciones basadas en GPT-2; no confirmado para Gemma 3 ni Qwen 3.
- Opciones de despliegue: el ecosistema es la propia libreria interpretune (https://github.com/interpretune/interpretune); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| speediedan/rte | Contenedor de configuraciones de interpretabilidad sobre RTE | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Modelos base subyacentes (GPT-2, Gemma 2, Gemma 3, Qwen 3) | LLMs generativos | variable (desde ~124M en GPT-2 hasta varios miles de millones en Gemma 3/Qwen 3) | variable | variable segun modelo | Hugging Face |
| Otros repositorios de interpretabilidad (p. ej. TransformerLens, nnsight) | Librerias/frameworks | no aplica | no aplica | variable | GitHub/PyPI |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo desplegable: es un repositorio de componentes y configuraciones; no genera texto ni responde a prompts de usuario final.
- Sesgos conocidos: no documentados por el autor; heredaria los sesgos de los modelos base (GPT-2, Gemma, Qwen) si se usan sus predicciones.
- Riesgo de alucinacion: no aplica directamente al contenedor, pero si a los modelos base en tareas generativas; en RTE el riesgo se traduce en clasificaciones erroneas.
- Limitaciones de contexto e idioma: no documentadas; la tarea RTE de SuperGLUE es predominantemente en ingles.
- Dependencia de la libreria `interpretune`: sin esa libreria y su version compatible, el repositorio no es utilizable.
- Repositorio sin descargas ni likes: sin validacion externa de la comunidad; tratar como experimental.
- Restricciones de licencia: Apache 2.0 permite uso comercial del contenedor, pero las licencias de los modelos base (Gemma, Qwen) pueden imponer condiciones adicionales que deben verificarse por separado.
- Ficheros auxiliares (`chain`, `ft_schedules`, `runs`) declarados en el manifiesto: cualquier fichero fuera de la allowlist puede haber llegado por vias no controladas.

## Enlaces

- Hugging Face: https://huggingface.co/speediedan/rte
- Repositorio interpretune: https://github.com/interpretune/interpretune
- Dataset SuperGLUE (aps/super_glue): https://huggingface.co/datasets/aps/super_glue
- No se han encontrado en la informacion disponible papers, blogs ni demos adicionales.
