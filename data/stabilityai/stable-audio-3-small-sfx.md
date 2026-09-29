# stabilityai/stable-audio-3-small-sfx

## Resumen

Stable Audio 3 Small SFX es un modelo de generacion de audio texto-a-audio desarrollado por Stability AI, especializado en la sintesis de efectos de sonido (sound effects, SFX) a partir de descripciones textuales. Forma parte de la familia Stable Audio 3, presentada por Stability AI como una plataforma de inferencia y ajuste fino que sustituye en el flujo de trabajo principal al repositorio anterior stable-audio-tools. El modelo se distribuye con pesos abiertos bajo licencia stable-audio-community y acceso restringido (gated) en HuggingFace.

Tecnicamente se trata de un modelo de difusion para generacion de audio, segun la etiqueta `diffusion` de su ficha, con pipeline `text-to-audio`. Cuenta con 567.573.761 parametros reportados en los pesos safetensors y un repositorio de 3,5 GB. Es un modelo derivado por ajuste fino del checkpoint `stabilityai/stable-audio-3-small-sfx-base`, lo que indica que parte de un modelo base de la misma familia y se ha post-entrenado para la tarea concreta de generar efectos de sonido. Unicamente acepta indicaciones en ingles.

Su relevancia actual radica en que ofrece generacion de efectos de sonido con pesos abiertos dentro de una familia de modelos entrenada, segun Stability AI, con datos plenamente licenciados, lo que reduce el riesgo legal en pipelines de produccion de audio. El modelo acumula 30.758 descargas y 158 likes en HuggingFace, y se publica junto con un articulo tecnico referenciado como arXiv:2605.17991 en las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de audio texto-a-audio (etiqueta `diffusion`) |
| Parametros totales | 567.573.761 |
| Parametros activos | No aplica (no es un modelo MoE; no se documenta mezcla de expertos) |
| Longitud de contexto | No disponible (modelo de generacion de audio; no se especifica la duracion de audio soportada) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF, int8 o int4) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | stable-audio-community (categoria `license:other`) |
| Formato de pesos | safetensors |
| Modelo base | stabilityai/stable-audio-3-small-sfx-base (ajuste fino) |
| Biblioteca de inferencia | stable-audio-3 |
| Tamano del repositorio | 3,5 GB |
| Acceso | Restringido (gated); requiere aceptar las condiciones en HuggingFace |
| Articulo de referencia | arXiv:2605.17991 (segun las etiquetas del repositorio) |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como un sistema de difusion para generacion de audio texto-a-audio, orientado especificamente a efectos de sonido. Se trata de un ajuste fino (`base_model:finetune`) del checkpoint `stabilityai/stable-audio-3-small-sfx-base`, del que hereda la arquitectura y que actua como punto de partida del post-entrenamiento. El recuento de parametros de los pesos publicados es de 567.573.761, y el repositorio ocupa 3,5 GB, lo que sugiere que el paquete incluye, ademas del modelo de difusion, los componentes auxiliares habituales (codificador de texto y decodificador de audio) necesarios para el pipeline completo de texto-a-audio.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens o horas de audio empleadas en el entrenamiento, la composicion exacta del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Stability AI indica, en la pagina de producto de la familia Stable Audio 3, que los modelos se han entrenado con datos plenamente licenciados y que tres de los modelos de la familia se publican con pesos abiertos. El repositorio oficial `Stability-AI/stable-audio-3` se presenta como una plataforma de inferencia y ajuste fino construida a partir de las lecciones aprendidas con stable-audio-tools, pero no se detallan en la busqueda realizada innovaciones tecnicas concretas como decodificacion especulativa, atencion lineal o esquemas de muestreo especificos. El articulo arXiv:2605.17991 queda referenciado como fuente tecnica, aunque su contenido no forma parte de la informacion disponible.

## Capacidades

- Generacion de efectos de sonido a partir de descripciones textuales en ingles (pipeline `text-to-audio`).
- Sintesis de audio mediante muestreo de difusion, adecuada para producir efectos no musicales: impactos, ambientes, Foley, sonidos de interfaz, entre otros.
- Especializacion por ajuste fino: al derivar del checkpoint base `stable-audio-3-small-sfx-base`, el modelo esta orientado a la tarea concreta de efectos de sonido en lugar de a musica o voz generica.
- Inferencia y ajuste fino adicional a traves de la biblioteca estable `stable-audio-3` y del repositorio oficial en GitHub.
- Soporte de tool calling / function calling: no disponible (no es una capacidad aplicable a este tipo de modelo segun la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplicable).
- Capacidades multilingues: limitadas al ingles; la ficha declara unicamente `en` como idioma soportado.
- Capacidades especiales (vision, audio de entrada, thinking mode): no disponibles en la informacion proporcionada. La generacion es texto-a-audio; no se documenta entrada de audio.

## Casos de uso

- Diseno de sonido para videojuegos: generar de forma iterativa efectos como pasos, impactos, aperturas de puertas o sonidos de hechizos a partir de prompts en ingles, reduciendo el coste de producir variaciones de un mismo efecto para distintas superficies o intensidades.
- Postproduccion de cine y video: automatizar tareas de Foley y ambientes de fondo alli donde no se dispone de una grabacion especifica, generando capas de sonido que despues se editan y mezclan en la estacion de trabajo de audio digital (DAW).
- Creacion de bibliotecas de sonidos de interfaz: producir sonidos cortos de notificacion, confirmacion y error para aplicaciones moviles o de escritorio, con control mediante descripciones textuales y sin depender de un disenador de sonido para cada iteracion.
- Prototipado rapido en produccion musical y audiovisual: disponer de efectos provisionales durante las fases tempranas de un proyecto, sustituibles mas tarde por grabaciones definitivas una vez cerrada la edicion.
- Realidad virtual y aumentada: generar efectos reactivos o ambientales para entornos interactivos, donde se necesita variedad de sonidos y tiempos de iteracion cortos.
- Aumento de datos para investigacion en audio: crear muestras sinteticas de efectos de sonido con el objetivo de ampliar conjuntos de datos de entrenamiento o evaluar sistemas de clasificacion y separacion de audio.
- Contenido para podcast y audiolibros: insertar ambientes, transiciones y efectos puntuales para reforzar la narrativa sin recurrir a bibliotecas de terceros.
- Integracion en herramientas creativas y plugins: incrustar la generacion de efectos dentro de una aplicacion o plugin de DAW usando la biblioteca `stable-audio-3`, de modo que el usuario final describa el sonido que necesita con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (567.573.761) y del tamano del repositorio (3,5 GB), no de documentacion oficial de Stability AI, que no se ha incluido en la informacion disponible.

- Peso de los parametros en precision de entrenamiento: aproximadamente 2,3 GB si los pesos estan en fp32 y en torno a 1,1 GB en fp16/bf16, solo para el modelo de difusion.
- Memoria total necesaria: al tratarse de un pipeline de texto-a-audio, hay que sumar el codificador de texto y el decodificador o vocoder de audio. El tamano de repositorio de 3,5 GB sugiere que la huella completa puede situarse en el rango de varios gigabytes, por lo que una GPU con 8-12 GB de VRAM es presumiblemente suficiente para inferencia, aunque este dato no esta confirmado oficialmente.
- GPU recomendadas: no disponible. Por tamano, el modelo deberia caber en GPUs de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4090, y ejecutarse sin problema en A100, H100, L40S o similares para despliegues por lotes, pero no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si, dado el recuento de parametros, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: biblioteca `stable-audio-3` y repositorio `Stability-AI/stable-audio-3`, que Stability AI presenta como plataforma de inferencia y ajuste fino. No se documenta soporte para runtimes orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI), que no son aplicables a un modelo de difusion de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stable-audio-3-small-sfx | 567.573.761 | no disponible | no disponible | stable-audio-community | Pesos abiertos, acceso gated en HuggingFace |
| stable-audio-3-small-sfx-base | no disponible | no disponible | no disponible | no disponible | Modelo base referenciado en la ficha; pesos abiertos |
| Otros modelos de la familia Stable Audio 3 | no disponible | no disponible | no disponible | no disponible | La coleccion de Stability AI indica que tres modelos de la familia tienen pesos abiertos |
| Alternativas de terceros para generacion de efectos de sonido | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

La informacion proporcionada no incluye especificaciones tecnicas ni resultados de modelos comparables de otros desarrolladores, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para ingles. Las indicaciones en castellano u otros idiomas pueden degradar la calidad del resultado o no ser interpretadas correctamente.
- Sesgos conocidos: no disponible. No se documenta en la informacion proporcionada un analisis de sesgos del modelo ni del dataset de entrenamiento; Stability AI afirma que los datos son plenamente licenciados, pero no detalla su composicion.
- Riesgo de alucinacion: no disponible en el sentido textual del termino. En generacion de audio, el riesgo equivalente es producir un sonido que no corresponde a la descripcion; no se documentan tasas de error ni evaluaciones de fidelidad al prompt.
- Limitaciones tecnicas: al ser un modelo especializado en efectos de sonido, no esta orientado a musica con estructura larga ni a sintesis de voz; no se especifica la duracion maxima de audio que puede generar.
- Licencia: la licencia `stable-audio-community` pertenece a la categoria `license:other`, es decir, no es una licencia de codigo abierto estandar. Es imprescindible revisar los terminos exactos antes de cualquier uso comercial, ya que la informacion disponible no detalla las condiciones, restricciones ni umbrales de facturacion.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que anade un paso de aprobacion a cualquier pipeline automatizado de descarga.
- Produccion: no hay datos publicos de latencia, throughput, estabilidad de muestreo ni evaluacion de calidad, por lo que cualquier despliegue en produccion deberia acompanarse de una evaluacion propia antes de escalar.
- Trazabilidad de derechos: aunque Stability AI declara entrenamiento con datos licenciados, la ausencia de detalle sobre el dataset y sobre el articulo tecnico en la informacion disponible limita la auditoria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stabilityai/stable-audio-3-small-sfx
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-small-sfx-base
- Coleccion Stable Audio 3 en HuggingFace: https://huggingface.co/collections/stabilityai/stable-audio-3
- Pagina de producto de Stable Audio 3.0: https://stability.ai/stable-audio
- Repositorio oficial en GitHub: https://github.com/Stability-AI/stable-audio-3
- README del repositorio: https://github.com/Stability-AI/stable-audio-3/blob/main/README.md
- Articulo de referencia: https://arxiv.org/abs/2605.17991
