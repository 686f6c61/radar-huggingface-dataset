# wasedabiolab/contrastive90

## Resumen

`wasedabiolab/contrastive90` es un repositorio de HuggingFace publicado por el usuario wasedabiolab que contiene una implementación propia en PyTorch de una arquitectura DeiT (Data-efficient Image Transformer) orientada a aprendizaje contrastivo. No es un modelo entrenado ni un release de producción: la propia model card lo define como un artefacto "compacto y personalizado" destinado a revisión de código, pruebas de humo (*smoke tests*) y experimentos pequeños y controlados. El repositorio incluye `main.py`, `config.json`, `training_args.json` y un `model.safetensors` descrito explícitamente como checkpoint de inicialización válido para pruebas, no como checkpoint entrenado ni evaluado.

El dato más relevante es su tamaño real: el recuento de parámetros de los pesos safetensors es de 24.832 parámetros (veinticuatro mil ochocientos treinta y dos). Eso contrasta de forma llamativa con la configuración declarada en la model card, que indica escala "large" para DeiT, ya que cualquier variante DeiT de referencia en escala *large* maneja decenas o cientos de millones de parámetros. Se trata, por tanto, de un esqueleto arquitectónico mínimo, no de un modelo con capacidad representacional útil tal y como se distribuye.

Su relevancia ahora es acotada y de tipo metodológico: sirve como plantilla reproducible para montar *baselines* de capacidad equivalente en experimentos contrastivos, para validar *harnesses* de evaluación y para probar flujos de carga de safetensors en arquitecturas personalizadas que no funcionan con las APIs automáticas estándar. El repositorio no declara idiomas, no declara pipeline y no presenta ninguna puntuación de benchmark; tiene 0 descargas y 0 *likes* en el momento de la consulta, y aparece junto a otros repositorios con texto idéntico (por ejemplo `josephhjh/nlp-contrastive90`), lo que sugiere contenido generado a partir de una plantilla común.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (Data-efficient Image Transformer) en implementación propia de PyTorch |
| Parametros totales | 24.832 (veinticuatro mil ochocientos treinta y dos), segun el recuento real de `model.safetensors` |
| Parametros activos | No aplica (no es un modelo MoE) |
| Escala declarada por el autor | `large` (incoherente con el recuento real de parametros) |
| Longitud de contexto | No aplica / no disponible: es un backbone de vision; no se especifica resolucion de entrada, tamano de parche ni longitud de secuencia de parches |
| Tipos de cuantizacion | No disponibles: solo se distribuye un checkpoint de inicializacion en safetensors; no hay versiones GGUF, AWQ, GPTQ ni int8 publicadas |
| Idiomas soportados | No disponibles: el repositorio no declara idiomas ni incluye tokenizador o cabecera de texto |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |
| Atencion | Dispersa (*sparse*) |
| Fusion | Co-attention |
| Activacion | Swish |
| Normalizacion | LayerNorm |
| Optimizador y scheduler del recetario | NovoGrad con scheduler coseno (valores por defecto del script, no evidencia de un entrenamiento completado) |
| Tamano del repositorio | 0.0 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-29 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de vision tipo DeiT, pero con tres modificaciones declaradas respecto al DeiT canonico: atencion dispersa en lugar de atencion densa completa, un mecanismo de fusion por *co-attention* y funcion de activacion Swish con normalizacion LayerNorm. La model card no detalla el numero de capas, la dimension oculta, el numero de cabezas, el tamano de parche ni la resolucion de imagen de entrada; esos valores estarian en `config.json`, pero no se han facilitado. La combinacion de atencion dispersa y co-attention sugiere un diseno pensado para fusionar dos ramas de representacion (tipico en configuraciones contrastivas de pares imagen-texto o imagen-imagen), aunque el repositorio no documenta el esquema de pares ni la funcion de perdida contrastiva empleada.

En cuanto al entrenamiento, no hay ningun dato disponible sobre volumen de tokens, composicion del dataset, resolucion de imagenes, numero de pasos, uso de RLHF o DPO ni regimen de aumentacion. La model card es explicita al respecto: el recetario incluido (NovoGrad con scheduler coseno) son "valores de partida en el script, no evidencia de una ejecucion completada", y el checkpoint safetensors "no se presenta como un checkpoint entrenado con benchmark". El propio autor recomienda, para una evaluacion con sentido, entrenar todos los *baselines* con la misma exposicion de datos, el mismo presupuesto de ajuste y las mismas semillas aleatorias, y reportar la metrica de tarea en al menos tres semillas junto con un *baseline* de capacidad equivalente, conservando los registros de entrenamiento y las versiones del entorno.

## Capacidades

- Generacion de texto: no. No es un modelo de lenguaje ni incluye cabecera de decodificacion.
- Razonamiento, codigo y matematicas: no disponibles; no hay evidencia de ninguna capacidad de este tipo en el repositorio.
- Vision por computador: la arquitectura es un backbone de vision DeiT, por lo que en principio puede producir representaciones de imagen, pero el checkpoint distribuido es de inicializacion y no ha sido entrenado, de modo que sus representaciones no son utilizables para tareas reales.
- Aprendizaje contrastivo: el repositorio esta etiquetado como `contrastive` y usa fusion por co-attention, pero no se documenta la funcion de perdida, el esquema de pares ni ningun resultado de alineacion entre modalidades.
- Tool calling / function calling: no soportado.
- Uso como agente y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; no hay tokenizador ni vocabulario.
- Capacidades especiales: atencion dispersa y co-attention estan definidas a nivel arquitectonico y son ejecutables en un *forward pass*, pero no hay pesos entrenados que las doten de capacidad funcional. No hay modo *thinking*, ni vision-a-texto, ni audio.
- Carga mediante APIs automaticas: no disponible; al ser una implementacion propia, la model card indica que las APIs genericas de carga requieren un adaptador explicito.

## Casos de uso

- Pruebas de humo en CI/CD para codigo de vision: el checkpoint permite verificar que el *forward pass* de una implementacion DeiT personalizada se ejecuta sin errores de forma ni de tipos tras cada cambio en el codigo, con un coste de computo de milisegundos gracias a sus 24.832 parametros.
- Plantilla docente para explicar atencion dispersa y co-attention: al ser un modelo diminuto y con el codigo fuente incluido (`main.py`), permite trazar paso a paso como se enmascaran los mapas de atencion y como se combinan dos ramas mediante *co-attention* sin necesidad de GPU.
- Baseline de capacidad equivalente en experimentos contrastivos: la model card recomienda comparar contra un *baseline* de capacidad similar; este repositorio sirve como ese *baseline* barato, entrenable con la misma exposicion de datos y semillas que el metodo propuesto.
- Validacion de pipelines de safetensors: util para probar rutinas de carga, verificacion de *hashes*, conversion de precision y mapeo de nombres de tensores antes de aplicarlas a checkpoints de cientos de millones de parametros.
- Pruebas de regresion de entorno (PyTorch, CUDA, drivers): al ser un modelo minimo, permite aislar si un fallo de ejecucion proviene del *stack* de software y no del modelo, algo util antes de escalar a entrenamientos largos.
- Desarrollo de *harnesses* de evaluacion: sirve para validar la logica de un banco de pruebas (carga de datos, calculo de metricas en tres semillas, registro de configuraciones) sin gastar recursos en inferencia real.
- Esqueleto para prototipar arquitecturas de fusion multimodal: las piezas de co-attention y atencion dispersa pueden reutilizarse como punto de partida para un diseno posterior que se entrene con datos reales.
- Revision de codigo en equipos de investigacion: un modelo de este tamano se puede leer entero y auditar en una sesion, lo que lo hace adecuado como referencia de estilo y estructura en revisiones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica de forma explicita que no se reclama ninguna puntuacion de benchmark en el repositorio y que el checkpoint safetensors es una inicializacion valida para pruebas de humo, no un checkpoint entrenado y evaluado.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 99 KB en fp32 (24.832 parametros x 4 bytes) y unos 50 KB en fp16 o bf16. El peso del modelo es irrelevante a efectos practicos.
- VRAM total en inferencia: no disponible con precision, ya que depende del tamano de lote, de la resolucion de entrada y del numero de parches, datos que no se facilitan. En cualquier caso, el consumo se mantiene en el orden de decenas a unos pocos cientos de megabytes incluyendo activaciones y el *overhead* del runtime de PyTorch.
- GPU recomendadas: no aplica ninguna en concreto. Cualquier GPU con soporte de PyTorch es suficiente, incluidas GPU integradas; el modelo tambien es ejecutable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en generaciones antiguas, sin requisitos de VRAM relevantes.
- Opciones de despliegue: no hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, TensorRT ni exportacion a ONNX. La via prevista es ejecutar `python main.py --help` y el bloque `__main__` del script, o bien escribir un adaptador explicito para APIs de carga automatica.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, tokens por segundo ni imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| contrastive90 (este repositorio) | 24.832 | No disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | No se reclama ningun benchmark |
| DeiT-Tiny (referencia externa, no verificada) | Aprox. 5,7 M | 224 x 224 px en la publicacion original | Apache 2.0 | Pesos entrenados publicos | No disponible en la informacion proporcionada |
| DeiT-Small (referencia externa, no verificada) | Aprox. 22 M | 224 x 224 px en la publicacion original | Apache 2.0 | Pesos entrenados publicos | No disponible en la informacion proporcionada |
| DeiT-Base (referencia externa, no verificada) | Aprox. 86 M | 224 x 224 px en la publicacion original | Apache 2.0 | Pesos entrenados publicos | No disponible en la informacion proporcionada |
| `josephhjh/nlp-contrastive90` | No disponible | No disponible | No disponible | HuggingFace | No se reclama ningun benchmark |

Nota: las cifras de las variantes DeiT de referencia proceden de conocimiento general sobre la familia DeiT y no de la informacion proporcionada en esta busqueda; deben verificarse en las fuentes originales antes de citarlas. La unica comparacion estrictamente verificable aqui es que este repositorio no ofrece pesos entrenados, mientras que las variantes DeiT de referencia si los publican. El segundo repositorio listado comparte literalmente el mismo texto de model card, lo que apunta a una plantilla comun mas que a un linaje de modelos.

## Limitaciones y advertencias

- El checkpoint no esta entrenado. La model card indica que no ha sido auditado en robustez, equidad ni transferencia de dominio, y que debe tratarse como un punto de partida experimental.
- Incoherencia entre escala declarada y tamano real: se anuncia escala `large`, pero el recuento de parametros es de 24.832, muy por debajo de cualquier DeiT de referencia. No debe asumirse ninguna capacidad asociada a la etiqueta `large`.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no genera texto. El riesgo equivalente es interpretativo: atribuir a este repositorio capacidades o resultados que no estan documentados.
- Ausencia total de datos de evaluacion: sin benchmark, sin metrica de tarea, sin numero de semillas y sin registros de entrenamiento publicados.
- Limitaciones de idioma: no se declara ningun idioma ni existe tokenizador, de modo que no hay soporte multilingue que evaluar.
- Limitaciones de contexto: no se especifica resolucion de imagen, tamano de parche ni longitud de secuencia, por lo que no puede determinarse la ventana de entrada soportada.
- Restricciones de licencia: los pesos y el codigo se publican bajo Apache 2.0, que permite uso comercial con atribucion y conservacion del aviso de licencia. Sin embargo, la propia model card advierte de que deben revisarse por separado los terminos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- Integracion en produccion: no hay soporte para servidores de inferencia habituales, ni cuantizaciones, ni API de carga automatica; requiere un adaptador propio. No es desplegable como servicio tal cual.
- Trazabilidad: el repositorio aparece replicado con texto identico en otras cuentas, lo que dificulta atribuir autoría y procedencia real del codigo.
- Fecha de publicacion futura (2026-09-29) y ausencia de actividad (0 descargas, 0 likes): no hay senales de mantenimiento ni de comunidad que respalde el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wasedabiolab/contrastive90
- Perfil del autor en HuggingFace: https://huggingface.co/wasedabiolab
- Repositorio con model card identica en otra cuenta: https://huggingface.co/josephhjh/nlp-contrastive90
- Revision sistematica sobre aprendizaje contrastivo en IA medica (MDPI): https://www.mdpi.com/2306-5354/13/2/176
- Analisis de modelos de IA biologica de Epoch AI: https://epoch.ai/publications/expanding-our-analysis-of-biological-ai-models
- Descubrimiento de biomarcadores predictivos con aprendizaje contrastivo (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S1535610825001308
