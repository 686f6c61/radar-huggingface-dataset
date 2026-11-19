# speediedan/prompt-analysis

## Resumen

`speediedan/prompt-analysis` es un componente del ecosistema **interpretune**, una libreria de codigo abierto orientada al analisis de interpretabilidad de modelos de lenguaje. No se trata de un modelo generativo al uso, sino de un modulo (kinds: module, manifest schema v1) que agrupa configuraciones de analisis de prompts de forma libre, sin dataset asociado ni cabecera de tarea (task head). El autor es speediedan y el repositorio se publica bajo licencia Apache 2.0.

El componente expone seis configuraciones predefinidas que combinan distintas tecnicas de interpretabilidad sobre modelos Gemma 2 y Gemma 3: `circuit_tracer`, `circuit_tracer+nnsight` y `circuit_tracer+nnsight.neuronpedia`, aplicadas tanto a prompts libres (`prompt_analysis.*`) como a un caso concreto de estados capitales (`capital_states.*`). La resolucion es "manifest-first": se descarga primero el fichero `it_component.yaml` y despues unicamente la configuracion necesaria, lo que reduce el peso de la descarga.

Su relevancia es acotada pero especifica: sirve a investigadores que quieran reproducir o reutilizar pipelines de trazado de circuitos (circuit tracing) y visualizacion de neuronas (NNsight, Neuronpedia) sobre Gemma 2 y Gemma 3 sin tener que reconstruir la configuracion desde cero. No es un modelo entrenado ni afinado, sino un artefacto de configuracion empaquetado para la libreria interpretune. El repositorio no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: componente de configuracion (no es un modelo con pesos propios). Las configuraciones apuntan a Gemma 2 y Gemma 3 como modelos objetivo |
| Parametros totales | No disponible (depende del modelo Gemma subyacente que se cargue) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No hay pesos: manifiesto `it_component.yaml` y configuraciones de la libreria interpretune |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado. Es un modulo de interpretabilidad que empaqueta configuraciones para la libreria interpretune, cuyo objetivo es analizar prompts de forma libre sin dataset ni cabecera de tarea. Cada configuracion define como se instrumenta un modelo Gemma (2 o 3) para extraer informacion interna: trazado de circuitos (`circuit_tracer`), captura de activaciones via NNsight (`+nnsight`) y publicacion o consulta de caracteristicas en Neuronpedia (`.neuronpedia`).

No hay datos de entrenamiento, tokens procesados, RLHF ni DPO asociados, porque no se entrena ningun modelo. La "innovacion" tecnica del repositorio es el mecanismo de resolucion manifest-first: el consumidor descarga `it_component.yaml` para descubrir las configuraciones disponibles y luego obtiene solo la que necesita, en lugar de clonar todo el componente. Las seis configuraciones cubren dos familias de modelos (Gemma 2 y Gemma 3) y tres niveles de instrumentacion crecientes.

## Capacidades

- Analisis de interpretabilidad sobre prompts de forma libre, sin necesidad de dataset etiquetado ni cabecera de tarea.
- Trazado de circuitos (`circuit_tracer`) sobre modelos Gemma 2 y Gemma 3.
- Captura de activaciones internas mediante NNsight en las configuraciones que incluyen `+nnsight`.
- Integracion con Neuronpedia para consulta o publicacion de caracteristicas en la configuracion `prompt_analysis.gemma3.circuit_tracer+nnsight.neuronpedia`.
- Configuracion especifica de "capital states" sobre Gemma 2 y Gemma 3, orientada al analisis de estados en prompts concretos.
- Resolucion selectiva de configuraciones via manifiesto, lo que permite cargar solo el subconjunto necesario.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es un componente de analisis, no un modelo de proposito general.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: un investigador carga `prompt_analysis.gemma2.circuit_tracer` para trazar los circuitos activados por un prompt libre en Gemma 2 y estudiar que componentes internos contribuyen a la respuesta.
- Reproduccion de experimentos: al estar empaquetadas las configuraciones en un manifiesto versionado, otro equipo puede reproducir exactamente el mismo pipeline de trazado sin reescribir la instrumentacion.
- Auditoria de caracteristicas con Neuronpedia: la configuracion `prompt_analysis.gemma3.circuit_tracer+nnsight.neuronpedia` permite contrastar las activaciones capturadas con caracteristicas publicadas en Neuronpedia para Gemma 3.
- Analisis comparativo entre versiones de modelo: al existir configuraciones equivalentes para Gemma 2 y Gemma 3, se puede ejecutar el mismo analisis sobre ambas generaciones y comparar el comportamiento interno.
- Docencia y formacion: el componente sirve como ejemplo practico de como estructurar modulos de interpretabilidad en interpretune, con un caso minimo (prompt libre) y un caso concreto (capital states).
- Integracion en pipelines de evaluacion interna: un equipo de seguridad de modelos puede incorporar el trazado de circuitos como paso de diagnostico al analizar prompts sospechosos o comportamientos anomalos.
- Desarrollo de herramientas sobre interpretune: sirve de plantilla para crear nuevos componentes con el mismo esquema de manifiesto v1 y la misma logica de resolucion selectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el componente en si (no contiene pesos). La VRAM real dependera del modelo Gemma 2 o Gemma 3 que se cargue para el analisis.
- GPU recomendadas: no disponibles en la informacion proporcionada. El trazado de circuitos y la captura de activaciones con NNsight requieren cargar el modelo objetivo en memoria, por lo que las necesidades son las del Gemma correspondiente.
- Cabe en GPU de consumo: no disponible; depende del tamano de la variante de Gemma utilizada.
- Opciones de despliegue: la libreria interpretune (https://github.com/speediedan/interpretune). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Componente | Tipo | Modelos objetivo | Instrumentacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| speediedan/prompt-analysis | Modulo de configuracion interpretune | Gemma 2, Gemma 3 | circuit_tracer, NNsight, Neuronpedia | Apache 2.0 | Hugging Face, 0 descargas |
| TransformerLens | Libreria de interpretabilidad | GPT-2, Pythia, Llama, etc. | Hook-based | MIT | Muy extendida |
| NNsight | Libreria de interpretabilidad | Multiples transformers | Intervencion remota/local | MIT | Extendida |
| Neuronpedia | Plataforma de caracteristicas | Modelos con SAE publicados | Visualizacion web | No disponible | Publica |

La comparativa es orientativa: prompt-analysis no compite con estas herramientas, sino que las orquesta dentro del ecosistema interpretune. No se dispone de datos de rendimiento para comparar cuantitativamente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; solo configura analisis de interpretabilidad.
- Depende por completo de la libreria interpretune y de su esquema de manifiesto v1; cambios en dicha libreria pueden romper la compatibilidad.
- Las configuraciones estan atadas a Gemma 2 y Gemma 3; no cubren otras familias de modelos.
- No se documentan idiomas soportados ni sesgos, al no tratarse de un modelo generativo.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion ni de validacion por terceros.
- La licencia Apache 2.0 permite uso comercial del componente, pero el uso de los modelos Gemma subyacentes se rige por la licencia propia de Gemma, que debe verificarse por separado.
- No se han publicado benchmarks ni metricas de calidad del analisis; la utilidad del componente depende de la correccion de la instrumentacion subyacente de interpretune.
- Riesgo de alucinacion: no aplica al componente, pero si al modelo Gemma sobre el que se ejecuta el analisis.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/speediedan/prompt-analysis
- Libreria interpretune: https://github.com/speediedan/interpretune
- NNsight: no disponible en la busqueda proporcionada
- Neuronpedia: no disponible en la busqueda proporcionada
