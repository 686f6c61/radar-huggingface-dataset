# Vibelet/spotlight-demo

## Resumen

Vibelet/spotlight-demo es un espacio de demostración estático (SDK `static`) publicado por el usuario Vibelet para mostrar el funcionamiento de Spotlight Memory, la técnica descrita en el blog de Percepta (percepta.ai/blog/spotlight-memory) y materializada en el modelo `Vibelet/spotlight-memory-synth-1b`. No se trata de un modelo de pesos en sí: el repositorio no contiene checkpoints publicados, sino una aplicación web que descarga aproximadamente 98 MB de fragmentos de pesos en fp16 y ejecuta la inferencia íntegramente en el navegador mediante shaders de cómputo WGSL sobre una canalización WebGPU. Esto implica que no hay servidor: las peticiones no salen del cliente.

El modelo subyacente, spotlight-memory-synth-1b, tiene 48,9 millones de parámetros y fue entrenado sobre el conjunto SYNTH, según declara el propio autor en la model card del demo. La coincidencia entre el tamaño del modelo y el volumen de descarga es coherente: 48,9 M de parámetros en fp16 equivalen a unos 97,8 MB, lo que explica los ~98 MB indicados.

Su relevancia actual reside en dos factores: por un lado, plantea una aproximación de memoria externa ("spotlight memory") aplicada a un modelo muy pequeno; por otro, demuestra un patrón de despliegue sin servidor basado en WebGPU, que permite ejecutar inferencia local en el navegador con requisitos de hardware muy bajos. La licencia es MIT, lo que facilita su reutilización comercial, aunque la escasez de documentación técnica publicada limita seriamente cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor la denomina "Spotlight Memory"; no se especifica si es transformer, MoE u otra) |
| Parametros totales | 48,9 M (del modelo referenciado spotlight-memory-synth-1b, no del espacio de demo) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se sirven en fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | fragmentos (shards) en fp16 consumidos por WebGPU; contenedor exacto no especificado |
| Tamano del repositorio | 0,1 GB |
| SDK del espacio | static |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-13 / 2026-10-13 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna. El autor la enmarca bajo el nombre "Spotlight Memory", descrita en un articulo de blog enlazado desde la model card, pero la ficha no reproduce ni la topologia de red, ni el mecanismo de atencion, ni el esquema de memoria. Tampoco se indica si se trata de un transformer denso, un modelo con atencion lineal, una variante de estado recurrente o un hibrido. El unico dato de entrenamiento aportado es que el modelo `spotlight-memory-synth-1b` fue entrenado sobre el conjunto SYNTH, sin especificar numero de tokens, composicion del dataset ni si hubo fases de ajuste por instrucciones, RLHF o DPO.

La innovacion destacable que si se documenta es de despliegue, no de modelado: la inferencia se ejecuta por completo en el cliente a traves de una canalizacion WebGPU, con shaders de computo escritos en WGSL, tras una descarga unica de aproximadamente 98 MB de pesos en fp16. Esta arquitectura de ejecucion elimina el coste de servidor y garantiza que los prompts no se transmiten a terceros, a cambio de exigir un navegador con soporte WebGPU (Chromium actual, Safari 18 o superior, y Firefox en plataformas compatibles). Si el navegador no dispone de WebGPU, la aplicacion falla de forma controlada y muestra una guia al usuario.

## Capacidades

- Ejecucion de inferencia local en el navegador sin backend ni servidor, requisito central del demo.
- Procesamiento de prompts con pesos alojados en el cliente, de modo que ninguna peticion abandona el dispositivo.
- Funcionamiento en navegadores con WebGPU mediante shaders WGSL, con degradacion controlada y mensaje de guia cuando no hay soporte.
- Generacion de texto: no confirmada explicitamente en la informacion disponible, aunque es la funcion esperada de un demo de modelo de lenguaje.
- Razonamiento, codigo, matematicas, vision, audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), decodificacion especulativa u otras tecnicas: no disponible.

## Casos de uso

- Demostracion tecnica de inferencia en el navegador: el caso de uso principal y documentado es servir como prueba de concepto de una canalizacion WebGPU completa, util para equipos que evaluan ejecutar modelos sin infraestructura de servidor ni exposicion de datos.
- Evaluacion de tecnicas de memoria en modelos diminutos: con 48,9 M de parametros, el modelo referenciado permite experimentar con mecanismos de memoria externa en un rango de coste computacional muy bajo, adecuado para investigacion preliminar antes de escalar a modelos mayores.
- Prototipado de aplicaciones con privacidad por diseno: al no salir los prompts del cliente, encaja en escenarios donde el tratamiento local de datos es un requisito, como prototipos en entornos regulados.
- Educacion y divulgacion: el demo ofrece un ejemplo tangible de como se despliega un modelo en WebGPU, con una descarga de solo ~98 MB, apropiado para talleres y material docente sobre inferencia en el borde.
- Pruebas de compatibilidad de navegadores: sirve para verificar el estado del soporte WebGPU en Chromium, Safari 18+ y Firefox, asi como el comportamiento de la degradacion controlada.
- Integracion en sitios estaticos: al usar el SDK static, el espacio puede replicarse como pagina estatica dentro de una web sin necesidad de backend, por ejemplo para una landing de demostracion.
- Experimentacion sin GPU dedicada: cualquier equipo con un navegador compatible puede ejecutar el demo, lo que rebaja la barrera de entrada para probar el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con modelos de referencia. El unico dato cuantitativo aportado es el tamano del modelo (48,9 M de parametros), el volumen de pesos descargados (~98 MB en fp16) y el conjunto de entrenamiento (SYNTH), sin cifras de calidad asociadas.

## Requisitos de hardware

- VRAM en GPU de servidor: no aplica, ya que el demo no usa backend; la inferencia reside en el cliente.
- Memoria necesaria en el cliente: aproximadamente 98 MB para los fragmentos de pesos en fp16, mas el consumo adicional de la canalizacion WebGPU y del runtime del navegador.
- GPU compatible: cualquier GPU integrada o dedicada con soporte WebGPU y controladores actualizados; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) porque no son necesarios para este despliegue.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo o integrada con soporte WebGPU, dado el tamano de 48,9 M de parametros.
- Navegadores soportados: Chromium actual, Safari 18 o superior y Firefox en plataformas compatibles; WebGPU es obligatorio.
- Opciones de despliegue: el propio espacio estatico con WebGPU; no se documentan alternativas como vLLM, llama.cpp, Ollama o TGI, y no hay checkpoints publicados para desplegarlas.
- Latencia y throughput: no disponible; no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa: el modelo referenciado no publica arquitectura, contexto ni metricas, y su planteamiento (memoria "spotlight" en un modelo de 48,9 M de parametros, ejecutado en navegador) no tiene un equivalente directo documentado en la informacion proporcionada. A modo de referencia de escala, en el ecosistema open source existen modelos densos de tamano comparable, pero sus datos no provienen de la informacion facilitada y no deben tomarse como una comparacion validada.

| Modelo | Parametros | Contexto | Licencia | Nota |
|---|---|---|---|---|
| spotlight-memory-synth-1b (referenciado) | 48,9 M | no disponible | MIT | Entrenado sobre SYNTH; sin benchmarks publicados |
| Alternativas de escala similar | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia de checkpoints: el repositorio es un espacio de demo, no una publicacion de pesos; no se pueden descargar los parametros desde esta ficha.
- Documentacion tecnica minima: no hay arquitectura, contexto, idiomas ni datos de entrenamiento mas alla de "48,9 M de parametros" y "entrenado sobre SYNTH".
- Sin benchmarks: no existe ninguna metrica publicada, por lo que no es posible estimar su calidad real ni compararla de forma objetiva.
- Tamano muy reducido: 48,9 M de parametros situan al modelo en un rango en el que la coherencia en tareas complejas, el razonamiento multi-paso y el conocimiento factual son, con alta probabilidad, limitados; no hay datos que lo confirmen o desmientan.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en modelos de esta escala el riesgo de generar contenido plausible pero falso es habitualmente elevado, aunque no se aporta evidencia especifica.
- Sesgos: no documentados por el autor.
- Dependencia de WebGPU: el demo no funciona en navegadores sin soporte WebGPU; el fallo es controlado, pero implica una limitacion de compatibilidad real.
- Uso comercial: la licencia MIT lo permite en principio, pero conviene verificar la licencia y las condiciones del modelo referenciado (`spotlight-memory-synth-1b`) antes de cualquier uso en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no existe validacion por parte de la comunidad.
- Fechas de publicacion futuras respecto al momento habitual de consulta (2026-10-13), lo que conviene tener en cuenta al interpretar la ficha.

## Enlaces

- Espacio de demo en HuggingFace: https://huggingface.co/Vibelet/spotlight-demo
- Modelo referenciado: https://huggingface.co/Vibelet/spotlight-memory-synth-1b
- Blog de Percepta sobre Spotlight Memory: https://percepta.ai/blog/spotlight-memory
