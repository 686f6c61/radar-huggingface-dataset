# SYNAPSEai1/SynapseMusicV12-XL-Turbo

## Resumen

SynapseMusicV12-XL-Turbo es un modelo de generacion de audio musical a partir de texto (text-to-music) publicado en HuggingFace por el usuario SYNAPSEai1. Segun la model card del repositorio, corresponde al variante XL (4B) Turbo de ACE-Step 1.5, un sistema co-liderado por ACE Studio y StepFun, destilado para generar audio en solo 8 pasos de inferencia y sin classifier-free guidance (CFG). El recuento real de parametros de los pesos safetensors es de 4.987.310.726, coherente con la cifra de "~4B" que declara el autor, y el repositorio ocupa 20,0 GB.

El modelo resuelve la generacion de musica completa a partir de una descripcion textual, con una arquitectura DiT (Diffusion Transformer) compuesta por un decoder de 32 capas y hidden_size 2560 (32 cabezas de atencion) y un encoder de 8 capas con hidden_size 2048. Se distribuye bajo licencia MIT y el autor afirma que los datos de entrenamiento son legalmente conformes (musica con licencia, royalty-free o de dominio publico y datos sinteticos MIDI-a-audio), lo que permitiria uso comercial de las piezas generadas.

Su relevancia actual reside en la combinacion de tamano moderado (4B), inferencia en 8 pasos y requisitos de VRAM relativamente contenidos (desde 12 GB con cuantizacion INT8 y offload a CPU), lo que lo situa en el rango de GPU de consumo para una tarea tradicionalmente asociada a modelos mucho mas pesados. La model card referencia un informe tecnico con DOI arXiv:2602.00744 y enlaces a repositorios de la organizacion ACE-Step, no del publicador del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con decoder y encoder; decoder de 32 capas, hidden_size 2560, 32 cabezas de atencion; encoder de 8 capas, hidden_size 2048 |
| Parametros totales | 4.987.310.726 (pesos safetensors); el autor declara "~4B" |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 mencionado en los requisitos de GPU (para ejecucion con menos de 12 GB de VRAM); no se listan otros formatos de cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, ~18,8 GB segun la model card) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusion (DiT) para generacion de audio: un encoder de 8 capas con hidden_size 2048 y un decoder de 32 capas con hidden_size 2560 y 32 cabezas de atencion, con un total de unos 4B de parametros. La variante Turbo esta acelerada por destilacion, de modo que realiza la inferencia en 8 pasos y sin CFG, frente a los 50 pasos con CFG de las variantes base y SFT de la misma familia. El sistema ACE-Step 1.5 combina este DiT con modelos de lenguaje auxiliares (0,6B, 1,7B y 4B, denominados `acestep-5Hz-lm-*`) que aportan comprension de audio y composicion; la model card indica que todos ellos son compatibles con la variante XL.

En cuanto a datos de entrenamiento, la model card afirma que el modelo se entreno con conjuntos legalmente conformes: musica con licencia, material royalty-free o de dominio publico y datos sinteticos generados de MIDI a audio. No se especifica en la informacion disponible el numero de tokens o de horas de audio, la composicion detallada del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal. El unico mecanismo de aceleracion documentado es la destilacion a 8 pasos.

## Capacidades

- Generacion de musica a partir de texto (text-to-music / text-to-audio), con inferencia en 8 pasos y sin CFG.
- Extraccion de caracteristicas (etiqueta `feature-extraction` declarada por el autor).
- Tareas de edicion y manipulacion musical: la model card lista para la familia las tareas "extract", "lego" y "complete"; la variante Turbo se clasifica como "Standard" en esa columna, sin mas detalle disponible.
- Calidad y diversidad declaradas como "Very High" y "Medium" respectivamente en la tabla comparativa del propio autor.
- Comprension de audio y composicion asistida mediante los modelos LM compatibles (`acestep-5Hz-lm-0.6B`, `1.7B` y `4B`), con capacidades crecientes segun tamano.
- Uso comercial declarado de las piezas generadas, al amparo de la licencia MIT y de los conjuntos de datos descritos como conformes.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni soporte multimodal de vision o audio de entrada mas alla de lo indicado.

## Casos de uso

- Produccion musical de fondo para video: generar pistas instrumentales completas a partir de una descripcion textual, integrandolas en flujos de edicion de video donde se necesita musica original sin problemas de licencia.
- Prototipado rapido de ideas musicales: un compositor puede iterar sobre descripciones de genero, instrumentacion y tempo y obtener bocetos en 8 pasos de inferencia, mucho mas rapido que con variantes de 50 pasos.
- Bandas sonoras para videojuegos independientes: generar variaciones de un mismo tema para distintas escenas o estados de juego, apoyandose en la licencia MIT para distribuir el resultado.
- Contenido para creadores y podcasting: producir sintonia y cortes musicales libres de royalties para emisiones o piezas de audio publicadas periodicamente.
- Investigacion en generacion de audio: usar el modelo como base DiT destilada para experimentar con tecnicas de muestreo acelerado, comparando contra las variantes base y SFT de 50 pasos.
- Evaluacion de pipelines de difusion en produccion: medir latencia y consumo de VRAM de un DiT de 4B en distintos niveles de cuantizacion (INT8, offload a CPU) y con distintos modelos LM asociados.
- Edicion y completado de fragmentos musicales: emplear las tareas "extract", "lego" y "complete" documentadas para la familia con el objetivo de separar o completar secciones de una pista, siempre que la variante Turbo las soporte en la practica.
- Demostraciones interactivas de generacion musical: desplegar la interfaz Gradio incluida en el repositorio `ACE-Step-1.5` para que usuarios no tecnicos generen audio desde una descripcion de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FAD, CLAP score, similitud textual-audio ni comparaciones numericas) y unicamente aporta valoraciones cualitativas propias ("Very High" en calidad, "Medium" en diversidad) para la variante Turbo.

## Requisitos de hardware

- VRAM segun la model card: a partir de 12 GB con offload a CPU y cuantizacion INT8; a partir de 16 GB con offload a CPU; a partir de 20 GB sin offload (configuracion recomendada); a partir de 24 GB para calidad completa con el modelo LM de 4B.
- Los pesos en bf16 ocupan aproximadamente 18,8 GB, por lo que la inferencia sin cuantizar requiere en torno a esa cifra mas el espacio de activaciones y del modelo LM asociado.
- GPU recomendadas: no disponibles de forma explicita. Por los requisitos de VRAM indicados, encajan GPU de consumo con 16-24 GB (por ejemplo, la clase RTX 4090) en configuraciones con offload, y GPU profesionales tipo A100 o H100 para ejecucion sin offload y con margen.
- Si cabe en GPU de consumo: si, en tarjetas con al menos 12 GB aplicando INT8 y offload a CPU; con 20 GB o mas se evita el offload.
- Opciones de despliegue: repositorio oficial `ace-step/ACE-Step-1.5` instalable con `pip install -e .`, interfaz Gradio mediante `python acestep --config-path acestep-v15-xl-turbo`, y una Space de demostracion en HuggingFace. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El unico dato relacionado es que la variante Turbo requiere 8 pasos de inferencia frente a los 50 de las variantes base y SFT.

## Comparativa con modelos similares

Dentro de la propia familia ACE-Step 1.5 XL, la model card ofrece esta comparacion:

| Modelo | CFG | Pasos | Calidad declarada | Diversidad declarada | Tareas |
|---|---|---|---|---|---|
| `acestep-v15-xl-base` | Si | 50 | High | High | Todas (extract, lego, complete) |
| `acestep-v15-xl-sft` | Si | 50 | Very High | Medium | Standard |
| `acestep-v15-xl-turbo` (este repositorio) | No | 8 | Very High | Medium | Standard |

El autor indica ademas que la calidad de audio del XL Turbo es superior a la de la variante "2B turbo", sin aportar numeros. No se proporcionan datos de otros modelos de generacion musical de terceros (parametros, contexto, rendimiento, licencia o disponibilidad) en la informacion disponible.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados: la calidad y la diversidad solo estan respaldadas por valoraciones cualitativas del propio autor.
- El repositorio aparece publicado por el usuario SYNAPSEai1 bajo el nombre SynapseMusicV12-XL-Turbo, mientras que la model card describe el modelo como ACE-Step 1.5 XL Turbo y enlaza repositorios, demos y Discord de la organizacion ACE-Step. No hay confirmacion en la informacion disponible de que se trate de una publicacion oficial; conviene verificar el origen antes de usarlo en produccion.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, y las fechas de creacion y actualizacion son identicas, lo que limita la evidencia de uso real por terceros.
- Los idiomas soportados no estan documentados; tampoco se especifica el comportamiento del modelo con prompts en idiomas distintos del ingles.
- No se detalla la longitud de contexto ni la duracion maxima de audio generable en una sola pasada.
- La afirmacion de que los datos de entrenamiento son legalmente conformes y de que la musica generada puede usarse comercialmente es una declaracion del autor, no verificada de forma independiente.
- Aunque la licencia declarada es MIT, si el modelo deriva de pesos de terceros, la aplicacion efectiva de esa licencia sobre los pesos puede estar sujeta a las condiciones del proyecto original; conviene revisarlo antes de un uso comercial.
- No se documentan sesgos especificos, riesgos de alucinacion en el sentido textual, ni tasas de fallo o artefactos en el audio generado; estos deben evaluarse empiricamente antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-XL-Turbo
- Pagina del proyecto ACE-Step 1.5: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion ACE-Step 1.5 en HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- Coleccion en ModelScope: https://modelscope.cn/collections/ACE-Step/Ace-Step-15-xl
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord del proyecto: https://discord.gg/PeWDxrkdj7
- Informe tecnico: https://arxiv.org/abs/2602.00744
- Repositorio de codigo: https://github.com/ace-step/ACE-Step-1.5
- Variante base: https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Variante SFT: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Modelo LM de 0,6B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- Modelo LM de 4B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-4B
