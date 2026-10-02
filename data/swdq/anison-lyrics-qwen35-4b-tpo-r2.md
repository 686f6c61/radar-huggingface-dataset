# swdq/anison-lyrics-qwen35-4b-tpo-r2

## Resumen

anison-lyrics-qwen35-4b-tpo-r2 es un ajuste fino del modelo base Qwen/Qwen3.5-4B, publicado por el usuario swdq, orientado a la generacion de letras de canciones en japones en estilos anison (temas de anime), denpa, eroge y vocaloid. El modelo parte de un transformer denso de 4.205.751.296 parametros (4,2B), con pesos en safetensors y un tamano de repositorio de 8,4 GB, coherente con una publicacion a precision completa (bf16/fp16).

El entrenamiento descrito en la model card consta de dos fases: un ajuste supervisado (SFT) sobre letras reales y dos rondas de optimizacion por preferencias (TPO), en las que se generan candidatos a partir de 2.163 condiciones de entrenamiento, se puntuan con un modelo de recompensa (swdq/anison-lyrics-rm-v1, entrenado mediante juicio ciego entre generaciones por parte de un LLM) y se construyen tripletas usando las letras reales como referencia. El autor indica explicitamente que el entrenamiento automatico se detuvo tras la segunda ronda y que la calidad comercial no esta alcanzada ni certificada.

Su relevancia es fundamentalmente metodologica y de investigacion: documenta con detalle el proceso de TPO, sus metricas internas por ronda y sus propios controles negativos, incluyendo una comparacion directa contra letras reales en la que el modelo no logra victorias sobre textos japoneses autenticos (0 de 54). No es, por tanto, un modelo listo para produccion, sino un artefacto de estudio sobre optimizacion por preferencias en generacion creativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-4B; la model card no detalla la arquitectura interna) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3.5-4B se describe en recursos de terceros con 262.144 tokens de contexto nativo |
| Tipos de cuantizacion | No disponible en el repositorio (solo safetensors a precision completa; la cuantizacion requeriria herramientas externas) |
| Idiomas soportados | Japones (ja) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de identificar el modelo base (Qwen/Qwen3.5-4B) y la etiqueta de pipeline `qwen3_5_text`. Los recursos de terceros consultados describen la familia Qwen3.5-4B como un modelo denso de 4B parametros con capacidades multimodales (vision-lenguaje) y 262.144 tokens de contexto nativo, si bien este ajuste fino concreto se publica como modelo de texto y su model card solo declara generacion de texto en japones.

El proceso de entrenamiento consta de SFT sobre letras reales seguido de dos rondas de TPO (preference optimization). Cada ronda se define como: generar 4 canciones por cada una de las 2.163 condiciones de entrenamiento con el modelo actual, seleccionar la mejor y la peor con el modelo de recompensa, formar tripletas con las letras reales como `gold` y ejecutar una epoca de TPO. El autor senala que el termino de preferencia del TPO se calcula sobre la suma de log-probabilidades de todos los tokens de la respuesta, mientras que el termino NLL de letras reales se calcula por token medio y no existe restriccion KL respecto a la politica de referencia, lo que introduce riesgo de deriva de politica y sensibilidad a la longitud. El modelo de recompensa aplica truncamiento a 1024 tokens, lo que segun el autor afecto a 4 de 320 canciones en SFT y a 3 de 320 en la ronda 2 de TPO. La generacion de referencia recomendada es temperature 1.0, top_p 0.95, top_k 50, repetition_penalty 1.08 y `enable_thinking=False`.

## Capacidades

- Generacion de letras de canciones en japones condicionadas por una descripcion textual (estilos anison, denpa, eroge y vocaloid segun la model card).
- Ajuste por preferencias en dos rondas sobre un modelo de recompensa especifico del dominio (`swdq/anison-lyrics-rm-v1`).
- Soporte de plantilla conversacional (etiquetas `conversational` y `text-generation`), con token de fin `<|im_end|>`.
- Modo de razonamiento del modelo base desactivado de forma recomendada en inferencia (`enable_thinking=False`).
- Capacidades multilingues: solo japones declarado; la propia evaluacion del autor mide y penaliza la aparicion de texto en ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Vision o audio: no disponible para este ajuste (el repositorio se etiqueta como `qwen3_5_text`).

## Casos de uso

- Generacion de borradores de letras para compositores y productores de musica doujin: dado que el modelo acepta condiciones textuales y produce versiones completas de canciones, puede usarse para explorar rapidamente variaciones de tema, perspectiva y estructura antes de una escritura final humana.
- Herramientas de escritura creativa para aficionados al anison y la musica vocaloid: integrable en interfaces conversacionales (etiqueta `conversational`) para sugerir estrofas o estribillos a partir de una idea inicial.
- Investigacion sobre optimizacion por preferencias (TPO/DPO): el repositorio documenta el pipeline completo (`loop_tpo.py`, `make_pairs.py`, `assess_quality.py`, `push_round.py`) y sirve como caso de estudio reproducible de entrenamiento por preferencias con modelo de recompensa basado en juicio LLM.
- Estudio de evaluacion de texto creativo: la model card publica protocolos de comparacion ciega A/B entre rondas, comparacion contra letras reales y experimentos de control de decodificacion, utiles como material metodologico.
- Analisis de riesgo de memorizacion y plagio: el autor mide la tasa de coincidencia exacta de lineas de 8 o mas caracteres con los datos de entrenamiento, lo que permite estudiar hasta que punto un modelo afinado reproduce texto protegido.
- Pruebas de cuantizacion y despliegue en hardware limitado: al ser un modelo denso de 4,2B, sirve para validar pipelines de conversion y cuantizacion (por ejemplo, con el toolkit de terceros qwen35-toolkit) antes de aplicarlos a modelos mayores.
- Docencia y divulgacion tecnica: ilustra de forma explicita las diferencias entre metricas internas favorables (score del modelo de recompensa) y calidad real medida contra referencias humanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye metricas internas del autor, que se reproducen a continuacion tal cual.

Metricas por ronda (20 condiciones de evaluacion x 16 canciones, condiciones no usadas en entrenamiento):

| Ronda | Mediana score RM | Score discriminador | Tasa de ingles | Etiquetas ausentes | Copia literal | eval loss | Juicio frente a ronda anterior |
|---|---|---|---|---|---|---|---|
| 0 (SFT) | -2,047 | -18,914 | 0,1219 | 0,0469 | 0,0033 | 2,653 | - |
| 1 (TPO) | 4,891 | 0,547 | 0,0094 | 0,1031 | 0,0034 | 2,7961 | - |
| 2 (TPO) | 11,062 | 11,754 | 0,0125 | 0,0 | 0,0067 | 2,8462 | 85% (34/40) |

Comparacion contra letras reales (60 pares = 20 canciones x 3 candidatos):

| Modelo | Victorias / derrotas (comparacion bruta) | Solo letras reales en japones |
|---|---|---|
| SFT evalbest | 3 / 57 | 0 / 54 |
| TPO ronda 1 | 3 / 57 | 0 / 54 |
| TPO ronda 2 | 3 / 57 | 0 / 54 |

Segun el autor, las tres victorias de cada modelo corresponden a letras reales en ingles unicamente; al excluir dos canciones reales con tasa de caracteres japoneses inferior a 0,3, el resultado es de 0 victorias sobre 18 canciones x 3 candidatos.

Experimento de control de decodificacion (repetition_penalty 1.0 frente a 1.08):

| Modelo | 1.0 frente a 1.08 (victorias / derrotas / empates) | Comparacion con letras reales (18 condiciones x 4 candidatos) |
|---|---|---|
| SFT evalbest | 18 / 19 / 3 | 0 / 72 |
| TPO ronda 2 | 24 / 13 / 3 | 4 / 68 |

El autor indica que el score de la ronda 2 de TPO frente a la configuracion por defecto es de 0,6375 con intervalo bootstrap del 95% [0,5125; 0,775], y que las 4 victorias frente a letras reales se concentran en 2 condiciones, con score medio por condicion de 0,0556 e intervalo [0; 0,1528]. Tambien reporta que, al retirar la penalizacion por repeticion, el numero de canciones con tasa de lineas duplicadas superior a 0,44 pasa de 3 a 27 sobre 80 en SFT y de 1 a 4 sobre 80 en TPO.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 8,4 GB solo para los pesos (4,2B x 2 bytes), mas la cache KV correspondiente al contexto utilizado.
- VRAM estimada en int8: en torno a 4,5 GB para los pesos, mas cache KV.
- VRAM estimada en int4 (GGUF Q4): en torno a 2,5-3 GB para los pesos, mas cache KV.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) a precision completa con contextos moderados, y en tarjetas de 8 GB si se cuantiza a int4/int8.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o similares; no obstante, dado el tamano del modelo, una unica GPU de 16-24 GB es suficiente para inferencia estandar.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TGI y KTransformers segun la documentacion del modelo base recogida en Docker Hub; llama.cpp/Ollama y LM Studio requieren conversion previa a GGUF (existen herramientas de terceros como qwen35-toolkit que realizan cuantizacion BNB, eliminacion de la torre visual y verificacion de inferencia).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos especializados en letras de canciones en japones comparables. La unica comparacion documentada es frente al modelo base.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| swdq/anison-lyrics-qwen35-4b-tpo-r2 | 4,2B | No disponible en la ficha (el base declara 262.144 tokens) | Japones | No disponible | Hugging Face, 0 descargas y 0 likes en la fecha de la ficha | Ajuste fino con SFT + 2 rondas de TPO; calidad comercial no certificada por el autor |
| Qwen/Qwen3.5-4B (base) | 4B (denso) | 262.144 tokens segun recursos de terceros | Multilingue (segun documentacion del base) | No disponible en la informacion proporcionada | Hugging Face, Ollama, Docker Hub, LM Studio | Modelo generalista multimodal; no especializado en letras |

Alternativas especificas de generacion de letras en japones: no disponible.

## Limitaciones y advertencias

- Licencia no disponible: no es posible confirmar las condiciones de uso comercial, redistribucion o modificacion del modelo.
- Datos de entrenamiento con letras de terceros: la propia model card advierte que el corpus incluye letras de otros autores y que el modelo puede reproducir lineas de los datos de entrenamiento. La tasa de copia literal de lineas de 8 o mas caracteres se situa entre 0,0033 y 0,0067 segun la ronda.
- Calidad comercial no alcanzada: el autor declara explicitamente que la calidad comercial no esta conseguida ni certificada, y que el entrenamiento automatico se detuvo tras la segunda ronda.
- Rendimiento inferior a letras reales: en la comparacion documentada, el modelo no logra ninguna victoria sobre letras reales en japones (0 de 54), y las unicas victorias se producen frente a letras reales en ingles.
- Optimizacion hacia el juez: el modelo de recompensa y el juez son LLM del mismo tipo, por lo que existe riesgo de sobreajuste al gusto del evaluador y no necesariamente a la calidad percibida por personas.
- Validacion humana ausente: no se ha realizado evaluacion por letristas, oyentes ni pruebas de canto sobre melodia, ni verificacion de similitud con obras existentes ni de derechos.
- Sesgos del corpus: al derivar de un conjunto de letras reales de generos concretos (anison, denpa, eroge, vocaloid), el modelo reproduce los sesgos tematicos, estilisticos y de genero de ese material.
- Riesgo de alucinacion y de contenido inapropiado: no se documentan filtros de seguridad ni evaluaciones de toxicidad; los generos objetivo incluyen estilos con contenido adulto.
- Limitaciones idiomaticas: el modelo esta orientado a japones y el propio autor mide la aparicion indeseada de ingles como metrica de calidad.
- Restricciones de contexto: la model card no especifica la ventana de contexto efectiva del ajuste; el truncamiento del modelo de recompensa a 1024 tokens durante el entrenamiento puede limitar la coherencia en textos largos.
- Detalles de entrenamiento con riesgo tecnico: el TPO no aplica restriccion KL frente a la politica de referencia y mezcla agregacion de log-probabilidades (suma para preferencias, media por token para NLL), lo que puede introducir deriva de politica y sesgo por longitud.
- Gestion de la reproducibilidad: el autor condiciona la publicacion de nuevas rondas a la superacion de una compuerta automatica (`proxy_pass`) y advierte de que la calidad no debe inferirse unicamente de las metricas internas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swdq/anison-lyrics-qwen35-4b-tpo-r2
- Modelo de recompensa del autor: https://huggingface.co/swdq/anison-lyrics-rm-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3.5-4B en LM Studio Hub: https://lmstudio.ai/ttvdblock716/qwen35-4b
- Toolkit de conversion y cuantizacion para Qwen3.5 (GitHub): https://github.com/techwithsergiu/qwen35-toolkit
- Qwen3.5 4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Variante abliterated en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:4B
- Imagen de Qwen3.5 en Docker Hub: https://hub.docker.com/r/ai/qwen3.5
