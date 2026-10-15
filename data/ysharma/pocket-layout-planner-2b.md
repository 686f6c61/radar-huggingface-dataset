# ysharma/pocket-layout-planner-2B

## Resumen

pocket-layout-planner-2B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-2B, publicado por el usuario ysharma en HuggingFace bajo licencia Apache-2.0. El modelo está especializado en una única tarea: recibir una peticion de imagen breve (sin system prompt y sin modo de razonamiento) y devolver una sola linea de texto que contiene un caption detallado en el que los elementos se referencian como `<id>`, seguido de una tabla JSON de cajas delimitadoras con el formato `[y_min, x_min, y_max, x_max]` sobre una rejilla normalizada de 0 a 1000.

La relevancia de este modelo radica en su enfoque de destilacion: ha sido entrenado a partir del modo `t2i_bbox` del modelo `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0), que actua como profesor. El objetivo es trasladar la capacidad de planificacion de layout de un modelo generativo de imagenes grande a un modelo de lenguaje compacto de aproximadamente 2.000 millones de parametros, ejecutable en hardware mucho mas modesto.

Es importante senalar que la model card se autodefine explicitamente como **stub**: los pesos no estan publicados y la tarjeta completa (tabla de evaluacion, contact sheet, receta de entrenamiento, limitaciones y snippet ejecutado) se publicara, segun el autor, una vez se ejecute el pipeline restringido. Por tanto, a fecha de la informacion disponible, se trata de un anuncio de modelo, no de un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Qwen/Qwen3.5-2B; arquitectura concreta no especificada en la model card) |
| Parametros totales | ~2B (deducido de la nomenclatura "2B" del propio nombre del modelo; no confirmado en la informacion disponible) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se han publicado pesos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio declarado como stub, sin pesos publicados) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la model card proporcionada. El unico dato estructural es que se trata de un fine-tune de `Qwen/Qwen3.5-2B`, lo que implica heredar la familia arquitectonica del modelo base, pero la informacion disponible no especifica ni el tipo de atencion, ni la configuracion de capas, ni si incorpora mecanicas hibridas o de atencion lineal.

En cuanto al entrenamiento, la model card indica que el modelo se ha destilado a partir del modo `t2i_bbox` de `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0), citado como profesor. El conjunto de datos de entrenamiento es `ysharma/klein-layout-plans`. No se especifica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. La tarea resultante es de formato fijo: entrada de peticion breve de imagen, salida de una linea con caption enriquecido con referencias `<id>` y una tabla JSON de bounding boxes normalizadas a la rejilla 0-1000 en el orden `[y_min, x_min, y_max, x_max]`.

## Capacidades

- Generacion de captions detallados de escenas, con los elementos de la imagen referenciados mediante identificadores `<id>`.
- Prediccion de layout: emision de una tabla JSON de cajas delimitadoras con coordenadas normalizadas en una rejilla de 0 a 1000 y orden `[y_min, x_min, y_max, x_max]`.
- Ejecucion en un unico paso, sin modo de pensamiento (thinking) y sin necesidad de system prompt, segun la model card.
- Salida estructurada en una sola linea, lo que facilita su analisis sintactico (parsing) automatico.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la model card indica explicitamente que no emplea modo de razonamiento.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (vision, audio, thinking mode): no disponible. Notese que, a pesar del nombre "layout-planner" y de trabajar con peticiones de imagen, la model card no confirma que el modelo reciba entrada visual directa; la descripcion sugiere una tarea de planificacion a partir de texto que describe la imagen deseada.

## Casos de uso

- Planificacion de layouts para generacion de imagenes: el modelo puede actuar como planificador previo que, dada una peticion textual breve, produce la lista de elementos y sus cajas delimitadoras antes de invocar un modelo de difusion, mejorando la coherencia compositiva de la imagen final.
- Construccion de pipelines de text-to-image con control espacial: integrar la salida JSON en herramientas como ControlNet, region-based diffusion o inpainting guiado por regiones para forzar la posicion de objetos concretos.
- Anotacion automatica de bounding boxes: generar etiquetas preliminares de cajas para conjuntos de datos de deteccion de objetos a partir de descripciones textuales, sujeto a revision humana posterior.
- Prototipado rapido de interfaces y wireframes: generar estructuras de layout (posiciones de elementos de UI) a partir de descripciones en lenguaje natural para bocetos de baja fidelidad.
- Edicion y recomposicion de imagenes: usar la tabla de cajas para reposicionar o sustituir elementos concretos referenciados por `<id>` en un flujo de edicion por regiones.
- Generacion aumentada por recuperacion (RAG) sobre catalogos visuales: producir descripciones estructuradas de escenas deseadas para indexacion o comparacion semantica en bases de datos de imagenes.
- Investigacion en destilacion de capacidades espaciales: servir como caso de estudio de transferencia de conocimiento desde un modelo generativo grande (profesor) a un modelo de lenguaje compacto (alumno) en tareas de grounding espacial.
- Evaluacion comparativa de planificadores ligeros: por su tamano reducido (~2B), puede emplearse como linea base en experimentos academicos de planificacion de layout en entornos con recursos limitados.

Nota: todos estos casos son aplicaciones potenciales derivadas de la descripcion funcional de la model card. Al no existir pesos publicados ni evaluacion, no hay validacion empirica de su viabilidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que la tabla de evaluacion se publicara junto con los pesos cuando se ejecute el pipeline restringido.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano nominal de ~2B parametros y no proceden de la model card, que no incluye esta informacion.

- VRAM estimada para inferencia (estimacion por tamano, no confirmada):
  - FP16/BF16: aproximadamente 4-5 GB solo para pesos, mas overhead de activaciones y cache KV.
  - INT8: aproximadamente 2-2,5 GB de pesos.
  - INT4 (por ejemplo Q4_K_M): aproximadamente 1,2-1,5 GB de pesos.
- GPU recomendadas (estimacion generica para un modelo de ~2B): funciona holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070, RTX 4090, A100 y H100. Para lotes grandes o contextos muy largos se recomienda A100/H100.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU con 6 GB o mas de VRAM en cuantizacion de 4 u 8 bits. No confirmado por el autor.
- Opciones de despliegue: no disponible. Al no existir pesos publicados no se puede confirmar soporte en vLLM, llama.cpp, Ollama o TGI. Dado el formato base (Qwen), cabria esperar compatibilidad con el ecosistema habitual si finalmente se publican pesos en safetensors y GGUF, pero esto es una expectativa, no un dato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directos en la documentacion proporcionada. A continuacion se recogen las unicas referencias presentes en la model card, con la advertencia de que no son alternativas equivalentes en todos los ejes.

| Modelo | Rol en la informacion disponible | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocket-layout-planner-2B | Modelo descrito en esta ficha | ~2B (deducido) | no disponible | apache-2.0 | Solo model card (stub, sin pesos) |
| Qwen/Qwen3.5-2B | Modelo base del fine-tune | 2B (segun nombre) | no disponible | no disponible en la informacion | Referenciado como base |
| black-forest-labs/flux-3-image-klein-pup | Modelo profesor para la destilacion (modo t2i_bbox) | no disponible | no disponible | apache-2.0 | Referenciado como profesor |

No se han identificado en la busqueda web otros modelos comparables de planificacion de layout en el rango de 2B parametros. La busqueda web realizada no devolvio resultados tecnicos relevantes.

## Limitaciones y advertencias

- **Modelo en estado stub**: la model card indica explicitamente que el repositorio es un stub y que los pesos no estan publicados. No es un artefacto utilizable a fecha de la informacion disponible.
- **Sin datos de evaluacion**: no hay tabla de resultados, ni contact sheet, ni metrica alguna que permita estimar la calidad de las cajas generadas.
- **Sesgos conocidos**: no disponible. Al ser un fine-tune destilado de un profesor concreto sobre un dataset concreto (`ysharma/klein-layout-plans`), es previsible que herede los sesgos de composicion y de representacion de ese corpus, pero no hay informacion publicada al respecto.
- **Riesgo de alucinacion**: no cuantificado. En tareas de grounding espacial, el riesgo tipico es la generacion de cajas sintacticamente validas pero sin correspondencia real con la peticion o con la imagen, dado que la salida JSON siempre es bien formada.
- **Limitaciones de contexto e idioma**: no disponible. La model card no especifica ventana de contexto ni idiomas soportados; la tarea declarada sugiere entradas cortas, pero no se confirma.
- **Dependencia del formato de salida**: el resultado se limita a una linea con caption y tabla JSON en rejilla 0-1000 y orden `[y_min, x_min, y_max, x_max]`. Cualquier consumidor debe implementar el parseo y la conversion a coordenadas absolutas.
- **Restricciones de licencia**: la licencia declarada es Apache-2.0, que permite uso comercial con las obligaciones habituales de atribucion y aviso de cambios. No obstante, la model card incluye una nota aclaratoria: el nombre FLUX se emplea unicamente para atribuir al profesor y el repositorio no esta afiliado ni respaldado por Black Forest Labs. Conviene verificar las condiciones de uso del modelo base Qwen/Qwen3.5-2B y del dataset de entrenamiento antes de un despliegue comercial.
- **Caveat de produccion**: al no existir pesos, no se puede verificar latencia, consumo de VRAM real, ni calidad de salida. Cualquier plan de produccion basado en este modelo es prematuro.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/ysharma/pocket-layout-planner-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo profesor (modo t2i_bbox): https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Dataset de entrenamiento: https://huggingface.co/datasets/ysharma/klein-layout-plans
- Badge "Built with ML Intern": https://hf.co/chat?mode=ml-intern
- Resultados de busqueda web: no se han encontrado enlaces tecnicos relevantes; los resultados devueltos corresponden a un grupo musical homonimo y no guardan relacion con el modelo.
