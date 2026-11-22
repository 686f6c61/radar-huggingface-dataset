# Vortexal2/kera-songwriter-e4b

## Resumen

Kera Songwriter es un ajuste fino (fine-tune) del modelo multimodal Gemma 4 E4B it de Google DeepMind, desarrollado por Vortexal2 y publicado bajo el identificador `Vortexal2/kera-songwriter-e4b`. Su proposito es convertir una peticion breve en lenguaje natural (por ejemplo, "synth-pop sonador sobre conducir a casa a las 3 de la manana, voz femenina, build lento") en un paquete completo de planificacion musical: etiquetas de estilo, tipo de voz, tempo, tonalidad, compas, duracion, un plan seccion a seccion con niveles de energia y letras originales. Esta pensado como capa de preproduccion para generadores de musica por IA.

El modelo parte de la arquitectura Gemma 4 E4B it, con aproximadamente 8.000 millones de parametros totales segun los pesos safetensors del repositorio (7.996.156.490). El ajuste se realizo mediante LoRA (rango 16, alpha 32) durante 7.000 pasos sobre una DGX Spark, y los pesos resultantes se fusionaron en el modelo publicado. El repositorio ocupa 44,7 GB e incluye pesos en safetensors (unos 16 GB), cuantizaciones GGUF en BF16, Q8_0 y Q4_K_M, y el adaptador LoRA aislado de 77 MB.

La relevancia actual reside en su especializacion: no es un modelo generalista, sino una herramienta de dominio acotado que estandariza la salida en bloques (`TAGS`, `VOCAL`, `BPM · KEY · TIME · LENGTH`, `PLAN`, `BRIEF`, `LYRICS`) facilmente parseables por un pipeline de generacion musical. Su licencia Apache 2.0 y la disponibilidad de GGUF lo hacen desplegable en hardware de consumo, aunque su soporte linguistico se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 E4B it (image-text-to-text); fine-tune LoRA fusionado |
| Parametros totales | 7.996.156.490 (aprox. 8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens (valor recomendado en los ejemplos de despliegue con `-c 16384`) |
| Tipos de cuantizacion | BF16 (GGUF, 15 GB), Q8_0 (GGUF, 8,0 GB), Q4_K_M (GGUF, 5,3 GB), safetensors en bfloat16 (16 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 E4B it, un transformer multimodal capaz de procesar imagen y texto (tag `image-text-to-text`), con aproximadamente 8.000 millones de parametros. Sobre esa base se aplico un ajuste fino supervisado mediante LoRA de rango 16 y alpha 32, ejecutado durante 7.000 pasos en una unica NVIDIA DGX Spark. Los pesos del adaptador se fusionaron en el modelo final, de modo que el repositorio publica el modelo completo y no solo el delta.

Los datos de entrenamiento se construyeron a partir de hechos musicales extraidos de Wikipedia (CC BY-SA 4.0) y de MusicBrainz/AcousticBrainz (CC0). Con esos hechos, Claude Sonnet 5.5 genero 7.134 "lecciones", cada una consistente en planificar una cancion nueva en el estilo descrito. Segun la model card, no se emplearon letras reales de canciones, lo que reduce el riesgo de reproduccion literal de material con derechos de autor. No se documentan fases de RLHF ni DPO adicionales, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generacion de letras originales en ingles a partir de una descripcion breve de estilo, tematica, tipo de voz y duracion.
- Planificacion estructurada de canciones: produce etiquetas de estilo (`TAGS`), tipo de voz (`VOCAL`), parametros tecnicos (`BPM · KEY · TIME · LENGTH`), un plan seccion a seccion con energia de 1 a 10 (`PLAN`) y un resumen (`BRIEF`).
- Salida en formato delimitado por bloques, disenada para ser consumida directamente por un generador de musica por IA.
- Conversacion multi-turno mediante plantilla de chat (compatible con `apply_chat_template` y con el endpoint `/v1/chat/completions` de llama.cpp).
- Modo thinking configurable (`enable_thinking`), que la model card recomienda desactivar para esta tarea.
- Capacidad multimodal heredada de Gemma 4 E4B it (entrada de imagen y texto), aunque la model card no documenta casos de uso de vision para songwriting.
- Restriccion explicita en el prompt de sistema: evitar letras de canciones reales y nombres de artistas.
- No se documenta soporte de tool calling ni de razonamiento agente multi-paso en la informacion disponible.

## Casos de uso

- Preproduccion para generadores de musica por IA: el modelo actua como capa intermedia que traduce una idea vaga del usuario en etiquetas de estilo, tempo, tonalidad y letra, listas para alimentar un modelo text-to-music. La salida estructurada por bloques simplifica el parseo en el pipeline.
- Prototipado rapido de canciones en estudios pequenos: con unos 15 segundos por letra (segun la model card) y 5,3 GB en Q4_K_M, un compositor puede iterar decenas de variaciones de estilo y estructura en una sola sesion sobre una GPU de consumo.
- Herramientas de escritura asistida para letristas: el bloque `PLAN` con energia por seccion sirve como guion de composicion (intro, verso, estribillo, puente) que el autor humano puede editar antes de escribir la version final.
- Generacion de briefs musicales para bibliotecas de sincronizacion o produccion publicitaria: a partir de una descripcion de marca o escena, el modelo entrega un brief coherente con duracion, tempo y tono vocal ajustables, agilizando la revision con el cliente.
- Integracion en API de servicio: al exponerse mediante `llama-server` con el endpoint compatible con OpenAI, puede conectarse a una interfaz web o a un bot que reciba peticiones de usuarios y devuelva el paquete completo de cancion.
- Educacion musical y analisis de estilos: usando el conocimiento factual de Wikipedia y MusicBrainz incorporado en el entrenamiento, puede explicar y aplicar convenciones de genero (instrumentacion tipica, rangos de BPM, compases habituales) al planificar una pieza nueva.
- Generacion de variaciones tematicas controladas: modificando la peticion (cambio de voz, de tonalidad o de duracion) se obtienen versiones alternativas de una misma idea manteniendo coherencia estilistica, util para entregar varias opciones a un cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GB con Q4_K_M (5,3 GB de pesos mas overhead de contexto), unos 8,5-9 GB con Q8_0 y 16-18 GB con BF16 en safetensors o GGUF.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); 12-16 GB para Q8_0 (RTX 4070 Ti, RTX 4080); 24 GB o mas para BF16 (RTX 4090, A100 40 GB, H100). El ajuste se entreno en una NVIDIA DGX Spark, lo que confirma viabilidad en hardware compacto.
- Cabe en GPU de consumo: si, en configuraciones desde 8 GB de VRAM con la cuantizacion Q4_K_M y `-ngl 99` para descargar todas las capas en GPU.
- Opciones de despliegue: llama.cpp (`llama-server`, con `--jinja` para la plantilla de chat y soporte de descarga directa desde Hugging Face con `-hf`), el CLI `kera serve` del propio autor, y transformers con `AutoModelForCausalLM` en bfloat16. No se documenta soporte explicito de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: la model card indica aproximadamente 15 segundos por letra, sin especificar el hardware exacto de la medicion. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kera Songwriter (este) | ~8B | 16.384 | Songwriting y planificacion musical, solo ingles | Apache 2.0 | Hugging Face, GGUF y safetensors |
| Gemma 4 E4B it (base) | ~8B | no disponible | Modelo generalista multimodal | Terminos de Gemma (Google DeepMind) | Hugging Face |
| Modelos generalistas de ~7-8B (p. ej. familia Llama o Qwen) | 7-8B | variable | Proposito general, requieren prompting elaborado para songwriting | variable | Hugging Face |

La comparativa directa con alternativas especializadas en songwriting no esta disponible en la informacion proporcionada. Frente a su modelo base, Kera Songwriter anade la estructura de salida fija y el sesgo hacia planificacion musical, a costa de perder generalidad y de limitarse al ingles.

## Limitaciones y advertencias

- Solo escribe en ingles; no se documenta soporte de castellano ni de otros idiomas.
- La model card advierte explicitamente de que se revisen las letras antes de publicar una cancion; el modelo puede producir contenido inapropiado o de calidad desigual.
- Riesgo de alucinacion en datos factuales musicales (BPM, tonalidades, atribuciones de estilo), ya que el conocimiento procede de un corpus derivado de Wikipedia y MusicBrainz y no de una verificacion en tiempo real.
- Los datos de entrenamiento se generaron con Claude Sonnet 5.5 a partir de hechos de terceros; la calidad del ajuste depende de esa sintesis y no se documenta una evaluacion cuantitativa.
- Aunque el prompt de sistema prohibe usar letras reales y nombres de artistas, no hay garantia tecnica de que el modelo no genere fragmentos reminiscentes de obras existentes; conviene aplicar filtros de similitud en produccion.
- El contexto recomendado es de 16.384 tokens; peticiones muy largas o conversaciones multi-turno extensas pueden degradar la calidad.
- La licencia Apache 2.0 del ajuste no exime de verificar las condiciones del modelo base Gemma 4 de Google DeepMind si se redistribuye o se usa comercialmente a gran escala.
- No se documentan evaluaciones de sesgo; al estar entrenado principalmente con datos musicales occidentales (Wikipedia y MusicBrainz), es probable un sesgo hacia generos y convenciones anglosajonas.
- El repositorio tiene un volumen de descargas bajo (685) y un unico like, por lo que la validacion comunitaria es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vortexal2/kera-songwriter-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de llama.cpp (despliegue GGUF): https://github.com/ggerganov/llama.cpp
- Wikipedia (fuente de datos, CC BY-SA 4.0): https://www.wikipedia.org
- MusicBrainz: https://musicbrainz.org
- AcousticBrainz: https://acousticbrainz.org
