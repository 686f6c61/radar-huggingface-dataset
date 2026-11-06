# stdlogits/drowse-web-gemma3-1b-pt-instruments

## Resumen

`stdlogits/drowse-web-gemma3-1b-pt-instruments` es un conjunto de artefactos de interpretabilidad derivados de `google/gemma-3-1b-pt`, el modelo base de 1.000 millones de parametros de la familia Gemma 3 de Google. No se trata de un checkpoint de Transformers al uso, sino de los llamados "packs de instrumentos" (lentes R, lentes S y packs de unidades) que la plataforma drowse.ai carga en el navegador para inspeccionar y manipular las activaciones internas del modelo mientras se ejecuta en WebGPU. El autor es `stdlogits`, responsable tambien del repositorio `stdlogits/drowse-web-gemma3-1b-pt` y del proyecto de codigo abierto drowse.

El problema que resuelve es acotar la brecha entre la investigacion de interpretabilidad mecanicista y el despliegue real en el navegador: en lugar de recalcular direcciones y unidades por capa en cada sesion, drowse preajusta esos instrumentos sobre las activaciones del propio modelo y los publica como paquetes verificables con hash SHA-256. Cada pack queda anclado a una revision inmutable del repositorio y se instala a traves del catalogo firmado de drowse.ai, lo que permite reproducibilidad y trazabilidad del corpus utilizado.

La relevancia es doble: por un lado, ofrece material listo para usar a quien quiera estudiar el comportamiento interno de Gemma 3 1B PT sin montar su propio pipeline de extraccion de activaciones; por otro, demuestra un patron de distribucion de artefactos de interpretabilidad con verificacion criptografica, algo poco habitual en este nicho. Al estar construido sobre un modelo de 1B de parametros, es viable ejecutarlo en hardware de consumo y en el propio navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos derivados de `google/gemma-3-1b-pt`; la arquitectura del modelo base no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible (modelo base: Gemma 3 1B PT, 1.000 millones segun la denominacion del modelo) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Gemma Terms of Use y Gemma Prohibited Use Policy (etiqueta `license: gemma`) |
| Formato de pesos | no disponible; se describen como "browser artifacts, not a Transformers checkpoint", empaquetados con manifiesto y digest SHA-256 por fichero |

## Arquitectura y entrenamiento

El repositorio no contiene pesos de un modelo entrenado, sino instrumentos de interpretabilidad ajustados sobre las activaciones internas de `google/gemma-3-1b-pt`. Segun la model card, drowse ajusto las lentes R, las lentes S y los packs de unidades sobre una muestra de FineWeb-Edu (`sample-10BT`, revision `87f09149`, licencia ODC-By 1.0), y cada manifiesto de pack registra el corpus exacto empleado junto con su hash. Esto implica que los instrumentos son especificos del checkpoint base y del corpus de calibracion: no son transferibles sin recalibracion a otras variantes o tamanos de Gemma 3.

No se detalla en la informacion disponible la metodologia concreta de ajuste de cada tipo de lente, ni el numero de tokens de calibracion, ni si se aplicaron tecnicas de regularizacion o validacion cruzada. Tampoco se especifica la arquitectura interna del modelo base mas alla de su identificador (Gemma 3 1B PT, variante preentrenada). La innovacion tecnica destacable no esta en el entrenamiento del modelo, sino en el formato de distribucion: artefactos empaquetados con manifiesto, verificacion de integridad SHA-256 y anclaje a revisiones inmutables mediante un catalogo firmado, orientados a ejecucion en WebGPU dentro del navegador.

## Capacidades

- Inspeccion de activaciones internas del modelo base `google/gemma-3-1b-pt` mediante lentes R y lentes S cargadas en drowse.ai.
- Aplicacion de packs de unidades para analisis de interpretabilidad mecanicista sobre las representaciones del modelo.
- Ejecucion en el navegador mediante WebGPU, sin necesidad de backend de inferencia dedicado.
- Verificacion de integridad de cada pack mediante digest SHA-256 y catalogo firmado con revisiones inmutables.
- Trazabilidad del corpus de calibracion: cada manifiesto registra la muestra de FineWeb-Edu y su hash.
- No se documentan en la informacion disponible capacidades de generacion, razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues propias del pack; estas corresponderian, en su caso, al modelo base y no se detallan aqui.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: cargar las lentes R y S en drowse.ai para examinar que direcciones y subespacios activa Gemma 3 1B PT ante prompts concretos, sin necesidad de recalcular los instrumentos en local.
- Docencia y divulgacion: demostrar en un navegador, durante una clase o taller, como se ven las activaciones internas de un modelo de 1B de parametros y como se aplican tecnicas de lectura de representaciones.
- Auditoria de comportamiento: usar los packs de unidades para localizar unidades o direcciones asociadas a comportamientos concretos y contrastarlas con el corpus de calibracion registrado en el manifiesto.
- Reproducibilidad de experimentos: al estar cada pack anclado a una revision inmutable y verificado por SHA-256, sirve como referencia estable para replicar analisis publicados sobre Gemma 3 1B PT.
- Desarrollo de herramientas de interpretabilidad en el navegador: sirve como ejemplo de empaquetado y distribucion de artefactos para quienes construyan sus propias lentes o sondas sobre modelos pequenos.
- Evaluacion de sesgos y direcciones semanticas: aplicar las lentes sobre prompts controlados para estudiar que direcciones del espacio de activaciones se asocian a conceptos o atributos, apoyandose en la ventana de contexto del modelo base (no especificada en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento, evaluaciones de interpretabilidad ni comparaciones cuantitativas con otras lentes o packs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende de la cuantizacion y del runtime con el que se ejecute el modelo base Gemma 3 1B PT.
- GPU recomendadas: no disponibles. Al tratarse de artefactos para WebGPU, el requisito principal es un navegador con soporte de WebGPU y una GPU compatible; no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; por el tamano del modelo base (1B de parametros) y el enfoque WebGPU, es plausible en GPUs de consumo recientes, pero la informacion disponible no lo garantiza.
- Opciones de despliegue: drowse.ai como via de instalacion oficial; el repositorio de codigo abierto `stdlogits/drowse` en GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la model card advierte que no es un checkpoint de Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros packs de instrumentos de interpretabilidad comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: no puede cargarse con `AutoModelForCausalLM` ni con pipelines estandar; debe instalarse a traves de drowse.ai.
- Los instrumentos estan ajustados sobre las activaciones de `google/gemma-3-1b-pt` y sobre una muestra concreta de FineWeb-Edu (`sample-10BT`, revision `87f09149`); su validez fuera de ese checkpoint y ese corpus no esta garantizada.
- Licencia Gemma: los packs estan sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, con copias en el repositorio del modelo base; el uso comercial queda condicionado a dichos terminos.
- El corpus de calibracion (FineWeb-Edu) se distribuye bajo ODC-By 1.0 y su uso esta tambien sujeto a los terminos de Common Crawl, lo que anade obligaciones de atribucion.
- Riesgo de sesgo heredado: cualquier direccion o unidad extraida de las activaciones del modelo base puede reflejar sesgos presentes en sus datos de preentrenamiento; la informacion disponible no documenta evaluaciones de sesgo.
- Ausencia de metricas: no hay benchmarks publicados que permitan estimar la calidad o fidelidad de las lentes y packs de unidades.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados, lo que limita las garantias de soporte y mantenimiento.
- Fecha de creacion registrada como 2026-11-02, posterior a la mayoria de referencias del ecosistema; conviene verificar la vigencia de los enlaces y del catalogo firmado antes de integrarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/stdlogits/drowse-web-gemma3-1b-pt-instruments
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-1b-pt
- Modelo complementario de drowse: https://huggingface.co/stdlogits/drowse-web-gemma3-1b-pt
- Repositorio de codigo de drowse: https://github.com/stdlogits/drowse
- Sitio web de drowse: https://drowse.ai
- Dataset de calibracion (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia ODC-By 1.0: https://opendatacommons.org/licenses/by/1-0/
- Copia de los terminos de Gemma: https://huggingface.co/stdlogits/drowse-web-gemma3-1b-pt/tree/main
