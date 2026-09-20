# SYNAPSEai1/SynapseMusicV12-XL-SFT

## Resumen

SynapseMusicV12-XL-SFT es un modelo de generacion de musica a partir de texto (text-to-audio) publicado por el usuario SYNAPSEai1 en HuggingFace. Por su model card, se corresponde con la variante **XL (4B) SFT** de la familia ACE-Step 1.5, un proyecto co-liderado por ACE Studio y StepFun. El repositorio pesa 20 GB y contiene pesos en safetensors con 4.987.310.726 parametros reales, lo que en la practica lo situa en torno a 5B de parametros (~18,8 GB en bf16), ligeramente por encima del "~4B" que declara la propia model card.

El modelo resuelve la generacion de audio musical completo a partir de una descripcion textual, empleando un decoder DiT (Diffusion Transformer) de 32 capas con hidden_size 2560 y 32 cabezas de atencion, acompanado de un encoder de 8 capas y hidden_size 2048. La variante SFT prioriza calidad de audio sobre diversidad y soporta Classifier-Free Guidance (CFG), lo que permite controlar finamente el grado de adherencia al prompt mediante la escala de guia, a costa de 50 pasos de inferencia.

Su relevancia actual radica en tres puntos: es una de las pocas familias abiertas de generacion musical con licencia MIT y entrenamiento declarado sobre datos legalmente conformes (musica con licencia, royalty-free/dominio publico y datos sinteticos MIDI-a-Audio), lo que habilita uso comercial del audio generado; admite modulos LM auxiliares de 0,6B, 1,7B y 4B compatibles con el decoder XL; y compite en el nicho de text2music de alta calidad con modelos de parametraje similar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con encoder separado; decoder DiT de 32 capas, hidden_size 2560, 32 cabezas de atencion; encoder de 8 capas, hidden_size 2048 |
| Parametros totales | 4.987.310.726 (dato real de safetensors); la model card declara "~4B" |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 mencionado en los requisitos de VRAM; bf16 como formato de pesos declarado; no se detallan mas esquemas |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors; ~18,8 GB en bf16; tamano del repo 20,0 GB |
| Tipo de pipeline | text-to-audio (tags adicionales: feature-extraction, text2music, music, audio, custom_code) |
| Pasos de inferencia | 50 (con CFG) |
| Modelos LM compatibles | acestep-5Hz-lm-0.6B, acestep-5Hz-lm-1.7B, acestep-5Hz-lm-4B |

## Arquitectura y entrenamiento

La arquitectura combina un encoder de 8 capas (hidden_size 2048) con un decoder DiT de 32 capas y hidden_size 2560, 32 cabezas de atencion. Se trata de un modelo de difusion sobre representaciones latentes, con decodificacion iterativa en 50 pasos cuando se activa CFG. La variante SFT es el resultado de un ajuste fino supervisado sobre la variante base de la familia XL; segun la model card, este ajuste eleva la calidad de audio y la adherencia al prompt, pero reduce la diversidad de las salidas en comparacion con `acestep-v15-xl-base`.

En cuanto a datos, la model card indica que el entrenamiento se realizo sobre datasets legalmente conformes: musica con licencia, material royalty-free o de dominio publico y datos sinteticos generados mediante conversiones MIDI-a-Audio. No se especifica el numero de tokens, horas de audio ni la composicion porcentual del dataset, y tampoco hay informacion sobre si se emplearon etapas de RLHF o DPO. La model card tampoco detalla innovaciones de atencion o decodificacion (por ejemplo, atencion lineal o decoding especulativo). La familia se complementa con modelos LM a una tasa de 5 Hz que actuan como modulos de comprension de audio y de composicion ("lego", "complete", "extract" en la variante base), aunque la variante SFT se limita a tareas estandar.

## Capacidades

- Generacion de musica (text2music) a partir de una descripcion textual, con salida de audio.
- Soporte de Classifier-Free Guidance para ajustar la adherencia al prompt mediante guidance scale.
- Extraccion de caracteristicas (tag `feature-extraction` declarado en el repositorio).
- Integracion con modelos LM auxiliares de 0,6B, 1,7B y 4B para comprension de audio y composicion, totalmente compatibles con el decoder XL.
- Generacion de audio con licencia MIT y datos de entrenamiento declarados como conformes, lo que permite uso comercial del material generado.
- Interfaz de uso mediante Gradio UI (`python acestep --config-path acestep-v15-xl-sft`).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Vision, audio de entrada en sentido amplio o modo "thinking": no disponible, salvo la comprension de audio que aportan los LM auxiliares de la familia.

## Casos de uso

- Produccion de bandas sonoras para videojuegos indie: el modelo puede generar pistas completas a partir de descripciones de ambiente y estilo; la licencia MIT y los datos de entrenamiento declarados como conformes permiten distribuir el audio resultante dentro del propio juego.
- Prototipado rapido en estudios de musica: compositores pueden iterar sobre ideas con CFG para forzar mayor literalidad al prompt (instrumentacion, tempo, genero) antes de grabar versiones definitivas con musicos.
- Generacion de musica de fondo para video y podcast: el pipeline text-to-audio permite producir cortes instrumentales sin reclamaciones de derechos, evitando el coste de licencias de bibliotecas comerciales.
- Publicidad y contenido de marca: la clausula de uso comercial del material generado habilita su empleo en campanas, siempre que se revise la legislacion aplicable y las condiciones de la licencia MIT del repositorio.
- Investigacion en generacion musical: la familia ofrece variantes base, SFT y turbo (8 pasos sin CFG), lo que permite experimentos controlados sobre el compromiso entre calidad, diversidad y coste de inferencia.
- Ampliacion de datasets sinteticos: el modelo puede utilizarse para generar audio sintetico que alimente pipelines de entrenamiento o aumentacion de datos en tareas de etiquetado y recuperacion musical.
- Composicion asistida con LM: combinando el decoder XL con los LM de 5 Hz (hasta 4B) se pueden construir flujos de comprension de audio y generacion de estructura musical, utiles en herramientas de asistencia a la composicion.
- Creacion de demos y maquetas bajo demanda en aplicaciones web: mediante la UI Gradio incluida en el repositorio, se puede desplegar un servicio interno de generacion musical sin desarrollo adicional de front-end.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente clasifica de forma cualitativa las variantes de la familia (calidad alta, muy alta, diversidad alta o media) sin aportar metricas numericas (FAD, CLAP score, MMLU, HumanEval u otras). Los resultados de busqueda web asociados a esta ficha no contienen informacion tecnica sobre el modelo.

## Requisitos de hardware

- VRAM declarada por la model card:
  - >= 12 GB: con CPU offload + cuantizacion INT8.
  - >= 16 GB: con CPU offload.
  - >= 20 GB: sin offload.
  - >= 24 GB: calidad completa (XL + LM de 4B).
- GPU recomendadas (estimacion a partir de los requisitos de VRAM declarados; la model card no enumera GPUs concretas):
  - 12-16 GB: RTX 3060 12 GB, RTX 4070, RTX 4080 (16 GB).
  - 20-24 GB: RTX 3090, RTX 4090, A10G.
  - >= 40-80 GB: A100, H100, para ejecutar el XL sin offload y con el LM de 4B en paralelo.
- Si cabe en GPU de consumo: si. Con 12 GB es viable usando CPU offload e INT8; con 24 GB (RTX 3090/4090) se alcanza la calidad completa incluyendo el LM de 4B.
- Opciones de despliegue: el repositorio oficial ACE-Step 1.5 se instala con `pip install -e .` y se ejecuta con `python acestep --config-path acestep-v15-xl-sft`, que levanta una interfaz Gradio. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables al decoder de difusion).
- Latencia y throughput: no disponible. El unico dato de coste computacional es el numero de pasos de inferencia (50 con CFG para esta variante, frente a 8 pasos sin CFG en `acestep-v15-xl-turbo`).

## Comparativa con modelos similares

Comparativa dentro de la propia familia ACE-Step 1.5 XL, unica fuente con datos en la informacion proporcionada:

| Modelo | Parametros | CFG | Pasos | Calidad | Diversidad | Tareas | Licencia |
|---|---|---|---|---|---|---|---|
| **SynapseMusicV12-XL-SFT** (acestep-v15-xl-sft) | ~4B (4.987.310.726 reales) | Si | 50 | Muy alta | Media | Estandar | MIT |
| acestep-v15-xl-base | ~4B | Si | 50 | Alta | Alta | Todas (extract, lego, complete) | No disponible en la informacion |
| acestep-v15-xl-turbo | ~4B | No | 8 | Muy alta | Media | Estandar | No disponible en la informacion |

Alternativas externas de la misma categoria (generacion de musica texto-a-audio de parametraje similar): no se dispone de datos de especificaciones, contexto, rendimiento ni licencia en la informacion proporcionada; no se incluyen por tanto cifras comparativas.

## Limitaciones y advertencias

- Discrepancia de parametraje: la model card declara "~4B" mientras que los ficheros safetensors contienen 4.987.310.726 parametros, aproximadamente un 25% mas. Conviene verificar la arquitectura antes de planificar recursos.
- Identidad del repositorio: el repositorio se publica bajo el autor SYNAPSEai1 con el nombre SynapseMusicV12-XL-SFT, pero la model card corresponde a ACE-Step 1.5 XL SFT y los comandos de descarga apuntan a `ACE-Step/acestep-v15-xl-sft`. Es un republicado o espejo, con 0 descargas y 1 like en el momento de la consulta; se recomienda contrastar con el repositorio oficial antes de usarlo en produccion.
- Idiomas: la model card no declara idiomas soportados. El comportamiento con prompts en castellano no esta documentado.
- Riesgo de alucinacion/aciertos: al ser un modelo generativo de audio, no existe garantia de fidelidad literal al prompt; la adherencia se controla mediante CFG, lo que exige ajuste empirico.
- Sesgos: no hay informacion sobre sesgos de estilo, genero musical, instrumentacion o procedencia cultural en los datasets de entrenamiento.
- Licencia: el repositorio declara MIT, lo que en principio permite uso comercial. No obstante, la propia model card afirma que el material generado es utilizable comercialmente por haberse entrenado con datos conformes; esa afirmacion es del autor y no se acompana de documentacion de procedencia verificable en la informacion disponible. Se recomienda revision legal propia antes de explotacion comercial.
- Dependencia de codigo personalizado: el repositorio incluye la etiqueta `custom_code` y requiere instalar el paquete ACE-Step para la inferencia, lo que anade un paso de validacion de dependencias y de compatibilidad con la version de `transformers`.
- Coste de inferencia: 50 pasos con CFG implican una latencia notablemente superior a la variante turbo (8 pasos); no se publican cifras de latencia ni throughput.
- Ausencia de benchmarks: no hay metricas objetivas publicadas en la informacion disponible, por lo que cualquier comparacion de calidad es cualitativa.
- Contexto: la longitud de contexto del modelo no esta documentada, lo que limita el diseno de prompts largos o estructurados.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/SYNAPSEai1/SynapseMusicV12-XL-SFT
- Repositorio oficial ACE-Step 1.5: https://github.com/ace-step/ACE-Step-1.5
- Pagina de proyecto ACE-Step 1.5: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion ACE-Step 1.5 en HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- Coleccion ACE-Step 1.5 en ModelScope: https://modelscope.cn/collections/ACE-Step/Ace-Step-15-xl
- Demo en Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord del proyecto: https://discord.gg/PeWDxrkdj7
- Informe tecnico (arXiv:2602.00744): https://arxiv.org/abs/2602.00744
- Variante base: https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Variante turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- LM auxiliar 0,6B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- LM auxiliar 4B: https://huggingface.co/ACE-Step/acestep-5Hz-lm-4B
