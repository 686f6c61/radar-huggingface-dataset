# VVVASUDEVAN/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es un modelo de difusion para generacion de video a partir de texto (text-to-video) perteneciente a la familia Wan2.1, desarrollada por el equipo Wan (Wan-AI) y publicada originalmente en febrero de 2025. Esta ficha corresponde a la copia alojada por el usuario VVVASUDEVAN en HuggingFace, que replica el checkpoint oficial T2V-1.3B: 1.418.996.800 parametros segun los pesos en safetensors del repositorio, licencia Apache-2.0 y pipeline declarado como text-to-video.

El modelo resuelve la generacion de clips cortos a partir de una descripcion textual, con un diseno orientado a GPUs de consumo: la model card indica un requisito de 8,19 GB de VRAM y una generacion de ejemplo de 5 segundos a 480P en unos 4 minutos sobre una RTX 4090, sin tecnicas de optimizacion como la cuantizacion. Es, por tanto, la variante ligera de la familia Wan2.1, cuyo modelo hermano T2V-14B cubre 480P y 720P.

Su relevancia actual radica en dos puntos. Primero, la model card afirma que el modelo genera rotulos de texto en chino e ingles dentro del video, una capacidad poco habitual en modelos abiertos de generacion de video. Segundo, su tamano reducido permite que equipos academicos y creativos con una sola GPU de gama alta trabajen con generacion de video sin infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (pipeline text-to-video). El backbone concreto no se detalla en la informacion proporcionada; la model card menciona un VAE propio (Wan-VAE) |
| Parametros totales | 1.418.996.800 (suma de pesos en safetensors del repositorio) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible (no se especifica la longitud maxima del prompt de texto ni el numero de fotogramas por clip) |
| Tipos de cuantizacion | No disponible. La model card menciona que las cifras de rendimiento se obtienen sin tecnicas de optimizacion como la cuantizacion, pero no enumera formatos soportados |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; libreria declarada: diffusers |
| Resolucion de video | 480P recomendado. La model card indica que el modelo de 1,3B tambien puede generar a 720P, pero con resultados menos estables por el escaso entrenamiento a esa resolucion |
| Duracion de video | 5 segundos en el ejemplo de referencia de la model card (480P) |
| VRAM minima declarada | 8,19 GB |
| Tamano del repositorio | 17,6 GB |
| Tareas de la familia Wan2.1 | Text-to-video, image-to-video, edicion de video, text-to-image y video-to-audio (este repositorio aloja unicamente el checkpoint T2V-1.3B) |

## Arquitectura y entrenamiento

Los materiales proporcionados describen Wan2.1 como una suite abierta de modelos fundacionales de generacion de video. El checkpoint alojado aqui corresponde a la tarea text-to-video con 1,3B de parametros y soporte de 480P. Un componente tecnico destacado en la model card es Wan-VAE, un VAE de video que, segun el autor, codifica y descodifica videos en 1080P de cualquier longitud preservando la informacion temporal, lo que lo convierte en una base reutilizable para generacion de video e imagen. La model card tambien subraya la capacidad de generar texto en chino e ingles dentro del fotograma, que presenta como la primera de su clase entre los modelos de video abiertos.

No se dispone de informacion sobre la composicion del dataset de entrenamiento, el numero de tokens o fotogramas utilizados, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla el tipo de backbone (transformer de difusion, arquitectura hibrida u otra), el mecanismo de atencion ni el codificador de texto empleado. El paper de la familia aparece como "Coming soon" en la model card, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de video a partir de prompts de texto en 480P, con clips de referencia de 5 segundos.
- Generacion a 720P con el modelo de 1,3B, aunque la propia model card advierte de menor estabilidad a esa resolucion y recomienda 480P.
- Generacion de texto legible dentro del video en chino e ingles (rotulos, carteles y texto en escena), segun la model card.
- Codificacion y descodificacion de video en 1080P de longitud arbitraria preservando informacion temporal, a traves del componente Wan-VAE.
- Soporte de inferencia multi-GPU: la model card lista codigo de inferencia multi-GPU tanto para el modelo de 14B como para el de 1,3B.
- Demo Gradio incluida en el repositorio de codigo original.
- No soporta tool calling ni function calling: no es un modelo de lenguaje, sino un modelo generativo de video.
- No soporta agentes ni razonamiento multi-paso.
- No acepta imagenes como entrada en este checkpoint: la tarea image-to-video de la familia corresponde al modelo I2V-14B, no al T2V-1.3B.
- Idiomas de prompt declarados: ingles y chino. El comportamiento con prompts en otros idiomas no esta documentado.

## Casos de uso

- Previz y storyboards en produccion audiovisual: el modelo permite convertir un guion textual en un clip de 5 segundos a 480P para validar encuadres, ritmo y atmosfera antes de rodar o animar, con un coste de unos 4 minutos por clip en una RTX 4090.
- Contenido para redes sociales: la generacion a 480P y 5 segundos encaja con formatos cortos y bucles, y el requisito de 8,19 GB de VRAM permite iterar en un puesto de trabajo con una unica GPU de consumo.
- Prototipado de piezas publicitarias: agencias y equipos de marketing pueden generar multiples variantes de un concepto a partir de prompts distintos y seleccionar las mas prometedoras antes de producir la pieza final.
- Rotulacion y carteleria localizada: la capacidad de generar texto en chino e ingles dentro del video es util para prototipos de carteles, rotulos de tienda o subtitulos integrados en dos mercados simultaneamente.
- Material didactico y divulgacion: clips cortos que ilustren procesos, conceptos fisicos o secuencias historicas, con la ventaja de que el texto generado en pantalla puede acompanar la explicacion en chino o ingles.
- Investigacion academica con recursos limitados: equipos sin acceso a clusters pueden usar el checkpoint como linea base reproducible de generacion de video texto-a-video, integrarlo en experimentos de destilacion o comparar tecnicas de muestreo sobre un modelo que cabe en una GPU de consumo.
- Aumento de datos para entrenar otros modelos: generacion de clips sinteticos etiquetados por prompt para preentrenar o evaluar clasificadores de video, detectores de movimiento o modelos de captioning.
- Pruebas de concepto de integracion en pipelines generativos: dado que la libreria declarada es diffusers, el modelo puede probarse dentro de flujos que ya usan esa libreria para imagen, con la advertencia de que la propia model card lista la integracion con diffusers y ComfyUI como pendientes en el momento de su publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una afirmacion cualitativa de que Wan2.1 supera de forma consistente a los modelos abiertos existentes y a soluciones comerciales de ultima generacion en multiples benchmarks, pero no acompana esa afirmacion de cifras, tablas ni conjuntos de evaluacion concretos, por lo que no es posible reproducir ni comparar numericamente esos resultados.

El unico dato de rendimiento medible disponible es operativo: un clip de 5 segundos a 480P se genera en aproximadamente 4 minutos en una RTX 4090 sin tecnicas de optimizacion como la cuantizacion, segun la model card.

## Requisitos de hardware

- VRAM: 8,19 GB declarados por la model card para el modelo T2V-1.3B, lo que lo situa al alcance de practicamente cualquier GPU de consumo moderna.
- GPU recomendadas: la model card cita explicitamente la RTX 4090 como referencia (5 segundos a 480P en unos 4 minutos sin optimizacion). Cualquier GPU consumer con al menos 8,19 GB de VRAM libre es, segun el autor, compatible.
- Cabe en GPU de consumo: si, es el objetivo declarado del modelo. Se recomienda verificar el margen real teniendo en cuenta el codificador de texto y el VAE, ademas de los pesos del backbone.
- Almacenamiento: el repositorio ocupa 17,6 GB, muy por encima de lo que ocuparian 1.419 millones de parametros en precision completa (unos 5,7 GB), lo que sugiere que el repositorio incluye componentes adicionales en precision alta; conviene revisar el contenido antes de planificar el despliegue.
- Opciones de despliegue: libreria diffusers (declarada en el repositorio), codigo de inferencia oficial del repositorio Wan-Video/Wan2.1, y demo Gradio del mismo proyecto. La integracion con ComfyUI figura como pendiente en la model card publicada. No se documentan opciones como vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de difusion de video.
- Latencia y throughput: aproximadamente 4 minutos por clip de 5 segundos a 480P en RTX 4090, sin cuantizacion. Para el modelo de 14B de la misma familia no se proporcionan cifras en la informacion disponible.
- Inferencia multi-GPU: soportada por el codigo del repositorio para los modelos de 14B y 1,3B, segun la model card.

## Comparativa con modelos similares

Los datos de las alternativas proceden de las fichas publicas de cada proyecto y no de la informacion proporcionada en esta busqueda; conviene verificarlos en la fuente original antes de tomar decisiones.

| Modelo | Parametros | Resolucion tipica | Licencia | Notas |
|---|---|---|---|---|
| Wan2.1-T2V-1.3B (esta ficha) | 1,419 mil millones (safetensors del repo) | 480P recomendado; 720P posible con menor estabilidad | apache-2.0 | Requiere 8,19 GB de VRAM segun la model card; genera texto en chino e ingles |
| Wan2.1-T2V-14B | 14B (denominacion del modelo) | 480P y 720P | No confirmada en la informacion disponible para este checkpoint (el repositorio de 1,3B declara apache-2.0) | Version grande de la misma familia, con mayor coste de VRAM y codigo multi-GPU |
| Wan2.1-I2V-14B-720P | 14B (denominacion del modelo) | 720P | No confirmada en la informacion disponible | Variante image-to-video, no texto-a-video; no sustituye a este checkpoint |
| CogVideoX-2B (THUDM) | 2B | 720x480 | Apache-2.0 | Alternativa abierta de tamano comparable para texto-a-video; no hay comparacion numerica disponible en la informacion proporcionada |
| Mochi 1 (Genmo) | 10B | 480P | Apache-2.0 | Alternativa abierta de mayor tamano, con requisitos de hardware muy superiores |

No es posible establecer una comparacion de rendimiento rigurosa entre estos modelos con la informacion disponible, ya que no se han publicado cifras de benchmarks para Wan2.1-T2V-1.3B en los materiales proporcionados.

## Limitaciones y advertencias

- Este repositorio es una copia de terceros (usuario VVVASUDEVAN) con 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion registrada como 2026-09-16. Para uso en produccion debe preferirse el repositorio oficial Wan-AI/Wan2.1-T2V-1.3B y verificar la integridad de los pesos.
- No se han publicado datos sobre el dataset de entrenamiento, su composicion ni los sesgos asociados. No es posible evaluar que sesgos de genero, etnia, cultura o representacion geografica incorpora el modelo.
- Riesgo de artefactos propios de la difusion de video: incoherencia temporal entre fotogramas, deformacion de manos y rostros, y movimiento fisicamente improbable. La model card no documenta ninguna evaluacion de calidad ni de seguridad.
- La generacion de texto en el video funciona en chino e ingles; no hay evidencia de que funcione en castellano u otros idiomas. Los prompts en castellano no estan cubiertos por la declaracion de idiomas y pueden degradar el resultado.
- A 720P el propio autor advierte de resultados menos estables debido al entrenamiento limitado a esa resolucion. La recomendacion es 480P.
- La licencia Apache-2.0 permite uso comercial, pero al no documentarse el origen de los datos de entrenamiento, la responsabilidad sobre posibles conflictos de derechos de autor en el contenido generado recae en el usuario.
- La model card del repositorio lista la integracion con diffusers y ComfyUI como tareas pendientes, mientras que el repositorio declara library_name: diffusers. Es una discrepancia que debe comprobarse antes de asumir que la carga mediante diffusers funciona sin adaptaciones.
- No es un modelo de lenguaje: no soporta tool calling, function calling ni flujos de agentes. Cualquier arquitectura que lo integre debe gestionar la orquestacion por fuera.
- El repositorio ocupa 17,6 GB frente a los 1.419 millones de parametros declarados, una diferencia que sugiere la inclusion de componentes adicionales o de pesos en precision alta; conviene inventariar el contenido antes de planificar recursos.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/VVVASUDEVAN/Wan2.1-T2V-1.3B
- Repositorio oficial del modelo: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Organizacion Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- Codigo e inferencia: https://github.com/Wan-Video/Wan2.1
- Modelo T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo I2V-14B-720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Modelo I2V-14B-480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- ModelScope (organizacion): https://www.modelscope.cn/organization/Wan-AI
- ModelScope (T2V-1.3B): https://www.modelscope.cn/models/Wan-AI/Wan2.1-T2V-1.3B
- Blog del proyecto: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Paper: no disponible (la model card lo marca como "Coming soon")
- Demo en video citada en la model card: https://cloud.video.taobao.com/vod/Jth64Y7wNoPcJki_Bo1ZJTDBvNjsgjlVKsNs05Fqfps.mp4
