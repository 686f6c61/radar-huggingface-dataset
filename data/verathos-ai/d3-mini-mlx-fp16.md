# verathos-ai/d3-mini-mlx-fp16

## Resumen

d3-mini-mlx-fp16 es un paquete de pesos en formato MLX (float16) publicado por el usuario verathos-ai a partir del modelo vllm-sr/d3-mini, que a su vez declara como base Qwen3.5-4B. El repositorio no contiene un modelo entrenado desde cero, sino una reempaquetado del backbone en float16, la cabeza de lectura (readout) sobre 255 codigos de respuesta en float32, el tokenizer y un `package.json` con los SHA-256 y tamanos de cada fichero. El digest del paquete (SHA-256 de `package.json`) es 9e185af9557d0c588f1b18fdcdbc89abea0754e701ca839b4109a528dddaaa5c.

El modelo cuenta con 4.205.751.296 parametros reales segun los safetensors, lo que lo situa en la gama de 4B, y el repositorio ocupa 8,4 GB, coherente con pesos en float16 mas la cabeza en float32. La libreria declarada es MLX, el framework de Apple para ejecucion en silicio de Apple, y la model card indica explicitamente que el paquete esta pensado para la aplicacion privada "Verathos private lane" en Apple silicon.

Su relevancia es acotada: se trata de un artefacto de despliegue para un caso de uso concreto (una tarea de clasificacion o seleccion sobre 255 codigos de respuesta) mas que de un modelo generalista nuevo. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y no se ha publicado informacion sobre arquitectura interna, contexto, idiomas ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone derivado de Qwen3.5-4B segun la model card; no se detalla en la informacion disponible) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,21 B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | float16 para el backbone y float32 para la cabeza de lectura; no se documentan otras cuantizaciones en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 8,4 GB |
| Cabeza de salida | readout sobre 255 codigos de respuesta (float32) |
| Modelo base | vllm-sr/d3-mini (revision 0e78bbdbe3cf480ed1461c185c9e0c4fa9258011) |
| Modelo base declarado del base | Qwen/Qwen3.5-4B |
| Fecha de creacion | 2026-10-15 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo: no se indican numero de capas, dimension del modelo, cabezas de atencion, tipo de atencion ni si incorpora componentes distintos de un transformer decoder-only. Lo unico documentado es la estructura del paquete: un backbone en float16, una cabeza de lectura en float32 que produce salidas sobre 255 codigos de respuesta, el tokenizer y un `package.json` con hashes SHA-256 y tamanos de cada fichero. La presencia de esa cabeza de 255 codigos sugiere una tarea de seleccion o clasificacion con un espacio de salida cerrado, pero la model card no especifica el significado de dichos codigos ni el procedimiento de decodificacion.

Tampoco se detallan los datos de entrenamiento: no hay numero de tokens, composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT. El autor indica que el paquete se genera a partir de la revision 0e78bbdbe3cf480ed1461c185c9e0c4fa9258011 de vllm-sr/d3-mini, de modo que cualquier entrenamiento o ajuste fino habria tenido lugar en el modelo original y no en este repositorio, que es una conversion de formato y precision para MLX. La innovacion tecnica declarada se limita, por tanto, al empaquetado reproducible y verificable mediante digest SHA-256.

## Capacidades

- Generacion de texto: no confirmada en la informacion disponible para este paquete; la presencia de una cabeza sobre 255 codigos apunta a una tarea de seleccion mas que a generacion abierta.
- Clasificacion o seleccion sobre un espacio cerrado de 255 codigos de respuesta, segun la descripcion del readout incluido en el paquete.
- Ejecucion en Apple silicon mediante MLX, con el backbone en float16 y la cabeza en float32.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en los metadatos).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Verificabilidad del paquete: los SHA-256 y tamanos de cada fichero permiten comprobar la integridad de la descarga.

## Casos de uso

- Integracion en la aplicacion "Verathos private lane" en Apple silicon: es el escenario explicitamente descrito por el autor; el paquete esta preparado para cargarse directamente en el runtime MLX de dicha aplicacion.
- Tareas de seleccion o clasificacion con espacio de salida cerrado: la cabeza de 255 codigos encaja con flujos donde la respuesta debe mapearse a una de un conjunto finito de categorias predefinidas, siempre que el significado de esos codigos lo documente el integrador.
- Despliegue local en portatiles y equipos de sobremesa Apple: con 4,21 B de parametros en float16, el paquete es viable en equipos de 16 GB de memoria unificada o superiores, sin necesidad de GPU dedicada.
- Prototipado offline en investigacion: al ejecutarse sin conectividad y con pesos verificables por hash, resulta adecuado para experimentos reproducibles en entornos aislados.
- Auditoria de integridad de artefactos: el `package.json` con SHA-256 permite validar que la copia local coincide exactamente con la publicada, util en pipelines que exigen trazabilidad de pesos.
- Evaluacion comparativa de precisión frente a otras conversiones del mismo modelo base: al ser un paquete float16 de un modelo ya existente, sirve como referencia para medir el impacto de la cuantizacion frente a variantes de menor precision.
- Base para conversion a otros formatos: al estar en safetensors, puede servir de punto de partida para generar artefactos para otros runtimes, aunque este repositorio no documenta dicho proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos en float16 de 4,21 B parametros ocupan aproximadamente 8,4 GB; con overhead de runtime y cache KV se recomienda un minimo de 12-16 GB de memoria unificada.
- Plataforma: MLX requiere Apple silicon (familias M1, M2, M3 o M4). No hay soporte de MLX sobre GPU NVIDIA o AMD.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este paquete tal como esta publicado, porque la libreria declarada es MLX. No se documenta una variante CUDA.
- Viabilidad en hardware de consumo: si, en equipos Apple con 16 GB de memoria unificada o mas; 24-32 GB dan margen para contextos largos y ejecucion de la cabeza en float32.
- Opciones de despliegue documentadas: runtime MLX (por ejemplo mlx-lm y su servidor). No se documentan en este repositorio despliegues con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| verathos-ai/d3-mini-mlx-fp16 | 4,21 B | no disponible | Apache-2.0 | safetensors (MLX, fp16) | 0 descargas, 0 likes |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 (segun este repositorio) | no disponible | no disponible |
| Qwen/Qwen3.5-4B | 4 B (segun denominacion) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni evaluaciones de los tres modelos, por lo que la comparacion se limita a parametros, licencia y formato. No se conocen en la informacion proporcionada otras alternativas de la misma categoria con las que contrastar resultados.

## Limitaciones y advertencias

- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, sin historial de uso ni validacion por parte de terceros.
- Sin resultados de evaluacion: no hay benchmarks, ni evaluaciones humanas, ni comparaciones con el modelo base que permitan estimar la calidad de las respuestas.
- Espacio de salida restringido: el readout sobre 255 codigos implica que la salida util esta limitada a ese conjunto; si los codigos no estan documentados por el integrador, el modelo puede resultar inutilizable en produccion.
- Idioma no declarado: los metadatos no especifican idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible.
- Sesgos: no evaluados ni documentados en la informacion disponible.
- Dependencia de plataforma: al estar empaquetado para MLX, solo es ejecutable en Apple silicon; esto limita su uso en infraestructura de servidores con GPU NVIDIA.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia del modelo base vllm-sr/d3-mini y del modelo Qwen3.5-4B deberia verificarse de forma independiente antes de un despliegue comercial.
- Empaquetado orientado a una aplicacion concreta: la model card indica que el paquete se preparo para la aplicacion privada "Verathos private lane", por lo que no se garantiza su compatibilidad con otros flujos de inferencia.
- Fechas y nomenclatura no verificables: el repositorio esta fechado en 2026 y referencia un modelo base (Qwen3.5-4B) cuyas caracteristicas no se detallan en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/verathos-ai/d3-mini-mlx-fp16
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Modelo base declarado del base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revision concreta usada para el empaquetado: 0e78bbdbe3cf480ed1461c185c9e0c4fa9258011
- Digest del paquete (SHA-256 de `package.json`): 9e185af9557d0c588f1b18fdcdbc89abea0754e701ca839b4109a528dddaaa5c
- Papers, blogs, repos o demos adicionales: no se han encontrado enlaces relevantes en la busqueda web realizada; los resultados obtenidos corresponden a paginas de ayuda de YouTube y no guardan relacion con el modelo.
