# zhihuanglab/pathcowork-grounder-pro-1T

## Resumen

PathCowork Grounder Pro 1T es un adaptador LoRA de tipo PEFT (r = 32, aplicado a todas las capas lineales) publicado por el laboratorio zhihuanglab para el modelo base moonshotai/Kimi-K2.6. Su funcion es la localizacion visual de conceptos (visual grounding) en imagenes de histopatologia teñidas con H&E: dado un campo de imagen y una peticion en lenguaje natural, devuelve una lista JSON de poligonos o polilineas con coordenadas enteras sobre una rejilla normalizada de 0 a 1000, o la cadena "There are none." cuando el concepto solicitado no esta presente.

El modelo resuelve un problema concreto en el ambito de la patologia computacional: la deteccion y delineado de estructuras histologicas (nidos melanociticos, necrosis pseudopalisadizante, carcinoma ductal in situ, focos metastasicos, patron de Gleason 3, entre otros) a partir de una unica vista de imagen, sin necesidad de un pipeline de segmentacion especifico por tarea. Segun la model card, fue entrenado con conceptos objetivo de cinco organos comunes (cerebro, mama, ganglio linfatico, prostata y piel) y muestra capacidad de generalizacion a organos y conceptos fuera de esa lista, como vejiga o colon.

Es relevante ahora porque demuestra que un adaptador de bajo rango sobre un modelo de lenguaje multimodal de gran escala puede abordar tareas de grounding histologico denso con salida estructurada directamente consumible por herramientas, lo que simplifica el despliegue en flujos de analisis anatomopatologico asistido. La informacion disponible no detalla el numero de parametros del modelo base ni la longitud de contexto, por lo que esos datos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT adapter) sobre modelo base multimodal image-text-to-text; r = 32, todas las capas lineales |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 18,8 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | penn-academic-software-license (licencia "other" en Hugging Face) |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | moonshotai/Kimi-K2.6 |
| Version | 1.3 |
| Pipeline | image-text-to-text |
| Entrada | Imagen H&E + prompt en lenguaje natural (se indica resolucion en µm/px y campo en mm) |
| Salida | JSON con lista de `polygon_2d` (coordenadas enteras 0-1000) y `label`, o "There are none." |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un adaptador LoRA de rango 32 aplicado sobre todas las capas lineales del modelo base moonshotai/Kimi-K2.6, que se carga como adaptador PEFT sobre dicho modelo. No se especifican en la model card la arquitectura interna del modelo base, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion tecnica destacable es el formato de salida: coordenadas normalizadas en una rejilla 0-1000 sobre la imagen (x hacia la derecha, y hacia abajo), lo que permite representar poligonos y polilineas de forma independiente de la resolucion de entrada.

Segun la model card, el entrenamiento se centro en conceptos objetivo de cinco organos comunes (cerebro, mama, ganglio linfatico, prostata y piel), con ejemplos que cubren distintas resoluciones (1 µm/px, 2 µm/px) y vistas de seccion completa (21-23 µm/px). El modelo admite peticiones de uno o varios conceptos simultaneamente y devuelve "There are none." cuando el concepto no esta presente, comportamiento entrenado explicitamente segun los ejemplos de la model card.

## Capacidades

- Localizacion visual (grounding) de conceptos histologicos en imagenes H&E, con salida de poligonos y polilineas en JSON.
- Peticiones de una sola clase o de varias clases en una misma consulta.
- Deteccion de clases ausentes con respuesta negativa explicita ("There are none.").
- Cobertura de conceptos en cinco organos de entrenamiento: cerebro, mama, ganglio linfatico, prostata y piel.
- Generalizacion a organos y conceptos fuera de distribucion (por ejemplo, vejiga y colon segun los ejemplos de la model card).
- Manejo de distintas escalas de imagen: desde 1 µm/px hasta vistas de seccion completa de 21-23 µm/px.
- Salida estructurada consumible por herramientas (JSON con etiqueta y coordenadas).
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision, audio: la unica capacidad documentada es image-text-to-text para grounding histologico; no se detallan otras.

## Casos de uso

- Delineado de estructuras tumorales en secciones H&E: el modelo recibe el campo de imagen con su resolucion y devuelve poligonos de estructuras como carcinoma ductal in situ o focos metastaticos, utiles para mediciones morfometricas y revision asistida.
- Cuantificacion de carga metastasica en ganglio linfatico: con una peticion de "metastatic tumour foci" sobre un campo de 1 µm/px, se obtienen las regiones afectadas para calcular area relativa y apoyar la estadificacion.
- Evaluacion de patron de Gleason en biopsia de prostata: el modelo localiza areas de patron 3, lo que permite al patologo contrastar la asignacion de grado y automatizar el premapeo de regiones de interes.
- Deteccion de nidos melanociticos y proliferacion lentiginosa en piel: consultas multi-clase en una sola peticion para caracterizar lesiones melanociticas y melanofagos en el mismo campo.
- Triaje de campos negativos: la respuesta "There are none." permite descartar rapidamente campos sin el concepto buscado en flujos de barrido de portaobjetos, reduciendo la carga de revision manual.
- Analisis de vistas de seccion completa: con resoluciones de 21-23 µm/px el modelo puede localizar regiones de mucosa normal o frondas papilares en organos fuera de distribucion, sirviendo como paso de prelocalizacion antes de ampliar a alta resolucion.
- Integracion en pipelines de investigacion anatomopatologica: la salida JSON normalizada 0-1000 facilita el consumo por visores, bases de datos de anotaciones y herramientas de analisis cuantitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El adaptador LoRA ocupa un repo de 18,8 GB, pero el requisito real depende del modelo base Kimi-K2.6, cuyo tamano no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga como adaptador PEFT sobre moonshotai/Kimi-K2.6; no se especifican frameworks de servicio (vLLM, TGI, llama.cpp, Ollama) en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de grounding histologico ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia penn-academic-software-license: restricciones de uso comercial no detalladas en la informacion disponible; debe revisarse el archivo LICENSE antes de cualquier uso en produccion.
- El entrenamiento se limita a conceptos de cinco organos (cerebro, mama, ganglio linfatico, prostata y piel); el rendimiento en otros organos o conceptos es una extrapolacion no cuantificada.
- Riesgo de alucinacion: el modelo puede devolver poligonos para conceptos ausentes o pasar por alto estructuras presentes; los ejemplos de la model card no constituyen una evaluacion sistematica.
- La salida depende de que el prompt indique correctamente la tincion, la resolucion en µm/px y el ancho de campo; prompts ambiguos pueden degradar la localizacion.
- No se documentan sesgos demograficos ni de poblacion de entrenamiento, ni el origen de los datos de entrenamiento.
- No se especifican limitaciones de contexto, idioma ni robustez frente a variaciones de tincion o escaneres.
- Uso previsto como herramienta de investigacion y asistencia; no debe emplearse como sustituto del diagnostico anatomopatologico profesional.

## Enlaces

- Hugging Face: https://huggingface.co/zhihuanglab/pathcowork-grounder-pro-1T
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.6
- Licencia: LICENSE (referenciado en el repositorio de Hugging Face)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
