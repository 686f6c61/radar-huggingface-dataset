# tanvincible/nla-qwen2.5-7b-L20-av-specifics-lora

## Resumen

`tanvincible/nla-qwen2.5-7b-L20-av-specifics-lora` es una colección de adaptadores LoRA sobre el verbalizador de un autoencoder en lenguaje natural (NLA) construido a partir de Qwen2.5-7B. Un NLA explica una activación interna de un modelo de lenguaje generando un párrafo descriptivo sobre ella; el verbalizador base (`kitft/nla-qwen2.5-7b-L20-av`) tiene la tendencia a nombrar entidades que no aparecen en el texto original, un fenómeno que el autor denomina "nombres erróneos". Este repositorio publica cinco adaptadores entrenados con distintas funciones de recompensa para estudiar empíricamente cómo el objetivo de entrenamiento afecta a ese comportamiento.

El modelo no es un asistente conversacional ni un generador de texto de propósito general: es un artefacto de investigación en interpretabilidad mecanicista. Cada adaptador se ha obtenido con tres rondas de muestreo y selección ("samplear 8 explicaciones, quedarse con la mejor bajo una puntuación, entrenar sobre ella") partiendo del verbalizador liberado, con 2.000 activaciones de entrenamiento por ejecución, rango LoRA 16 sobre las proyecciones de atención y tasa de aprendizaje 1e-4. Los adaptadores se distribuyen en subcarpetas (`recon`, `lineup`, `holdback`, `holdback-5epochs`, `recall`) y se cargan con PEFT sobre el modelo base.

La relevancia es metodológica: el autor advierte explícitamente de que los adaptadores existen para medir el efecto de la recompensa sobre los nombres erróneos, no como verbalizadores mejorados. El resultado principal es que solo la recompensa `holdback` (penalización por nombres no respaldados por las otras muestras) reduce de forma apreciable los nombres erróneos (-8,4 % por explicación) sin alterar la tasa de acierto en el nombre verdadero, mientras que las recompensas de reconstrucción (`recon`, `lineup`) no producen cambios distinguibles de cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) con adaptadores LoRA sobre las proyecciones de atención |
| Parametros totales | 7B en el modelo base; los adaptadores LoRA son un subconjunto (rango 16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, sin variantes GGUF) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 es multilingüe; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Libreria | peft |
| Modelo base | kitft/nla-qwen2.5-7b-L20-av |
| Tamano del repo | 0,2 GB |
| Rango LoRA | 16 (proyecciones de atención) |
| Tasa de aprendizaje | 1e-4 |
| Activaciones de entrenamiento | 2.000 por ejecución |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sustrato es Qwen2.5-7B, un transformer decoder-only de 7.000 millones de parámetros, sobre el que se han añadido adaptadores LoRA de rango 16 en las proyecciones de atención. El modelo base del repositorio es el verbalizador NLA `kitft/nla-qwen2.5-7b-L20-av`, que recibe una activación inyectada en el prompt (no texto plano) y produce una explicación en lenguaje natural de esa activación. La capa concreta de la que se extraen las activaciones es la L20, según el identificador del modelo.

El entrenamiento de cada adaptador sigue un esquema de optimización por selección de muestras: en cada ronda se generan 8 explicaciones para cada activación, se puntúan con una función de recompensa específica, se conserva la mejor y se entrena sobre ella. Se realizan tres rondas, con 2.000 activaciones de entrenamiento por ejecución y tasa de aprendizaje 1e-4. Las cinco funciones de recompensa son: `recon` (coseno de reconstrucción), `lineup` (la reconstrucción debe identificar la activación entre 4 casi-gemelas), `holdback` (coseno menos 0,01 por cada nombre que las otras muestras no respaldan), `holdback-5epochs` (igual pero una ronda con 5 pasadas) y `recall` (holdback más 0,05 por nombrar la entidad verdadera). No se documenta el volumen total de tokens de entrenamiento ni la composición del dataset más allá de las 540 muestras de Wikipedia reservadas para evaluación.

## Capacidades

- Explicación de activaciones internas de Qwen2.5-7B en lenguaje natural: el verbalizador recibe una activación inyectada en el prompt y escribe un párrafo describiéndola.
- No procesa texto plano de usuario: su entrada es una activación del modelo, no una instrucción conversacional.
- Generación de texto descriptivo y analítico sobre representaciones latentes.
- Cinco variantes de comportamiento según la recompensa de entrenamiento (`recon`, `lineup`, `holdback`, `holdback-5epochs`, `recall`), útiles para estudiar el efecto de la función de recompensa.
- Reducción medible de nombres erróneos con la variante `holdback` (-8,4 % por explicación en 540 pasajes de Wikipedia reservados).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito; no se documentan.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas, en su caso, del modelo base).

## Casos de uso

- Investigación en interpretabilidad mecanicista: usar los cinco adaptadores como ablación controlada para medir cómo distintas funciones de recompensa afectan a la fidelidad de las explicaciones de activaciones, comparando tasas de nombres erróneos entre variantes.
- Auditoría de verbalizadores NLA: aplicar `holdback` sobre el verbalizador base para reducir nombres de entidades no presentes en el texto original (-8,4 % por explicación) en pipelines de explicación automática de representaciones.
- Estudio de recompensas de selección de muestras (best-of-n): replicar el esquema de "samplear 8, puntuar, conservar la mejor, entrenar" para analizar el efecto del sesgo de selección sobre el comportamiento del modelo.
- Reproducción de experimentos: el repositorio de GitHub (`evaluate.py`) documenta la ruta completa desde una activación hasta una explicación con adaptador aplicado, lo que permite reproducir la evaluación sobre los 540 pasajes reservados.
- Análisis de alucinación en modelos de explicación: los adaptadores sirven como caso de estudio de cómo una penalización explícita a nombres no respaldados (`holdback`) modifica la tasa de entidades inventadas sin degradar la tasa de acierto en la entidad verdadera.
- Docencia y formación en PEFT: ejemplo mínimo de carga de adaptadores LoRA con subcarpetas mediante `PeftModel.from_pretrained(..., subfolder="holdback")` sobre un modelo base de 7B.

## Benchmarks y rendimiento

Resultados del autor sobre 540 pasajes de Wikipedia reservados, emparejados por entidad. Las cifras son cambios relativos respecto al verbalizador liberado.

| Adaptador | Puntuación de selección | Nombres erróneos por explicación | Tasa de nombre verdadero |
|---|---|---|---|
| `recon` | coseno de reconstrucción | -1,3 % (no distinguible de 0) | sin cambios |
| `lineup` | reconstrucción debe identificar la activación entre 4 casi-gemelas | -0,5 % (no distinguible de 0) | sin cambios |
| `holdback` | coseno - 0,01 por nombre no respaldado por otras muestras | -8,4 % | sin cambios |
| `holdback-5epochs` | igual, una ronda con 5 pasadas | -6,5 % | sin cambios |
| `recall` | holdback + 0,05 por nombrar la entidad verdadera | -2,9 % (intervalo toca 0) | sin cambios |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base Qwen2.5-7B en precisión completa (fp16/bf16) requiere aproximadamente 14-16 GB de VRAM para inferencia; los adaptadores LoRA añaden una fracción mínima (repo de 0,2 GB).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16 sin cuantizar; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo con cuantización del modelo base (por ejemplo, 4 bits, ~5-6 GB), aunque el autor no publica variantes GGUF ni cuantizadas de los adaptadores.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este artefacto y su compatibilidad con la inyección de activaciones no está verificada.
- Latencia y throughput: no disponibles. La inferencia requiere el pipeline completo de extracción de activaciones e inyección en el prompt, no una simple llamada de generación de texto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El artefacto es un adaptador LoRA de investigación sobre un verbalizador NLA concreto, no un modelo de propósito general, por lo que la comparación con asistentes de 7B (Qwen2.5-7B-Instruct, Llama 3.1 8B, Mistral 7B) no sería metodológicamente adecuada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-7B NLA) | 7B base + LoRA r16 | no disponible | Apache 2.0 | Hugging Face (PEFT) |
| Verbalizador base `kitft/nla-qwen2.5-7b-L20-av` | 7B | no disponible | no disponible | Hugging Face |
| Alternativas NLA | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor advierte explícitamente de que los adaptadores no son verbalizadores mejorados: existen para medir el efecto de la recompensa sobre los nombres erróneos.
- Los cambios en nombres erróneos de `recon` y `lineup` no son distinguibles de cero; el de `recall` tiene un intervalo que toca cero. Solo `holdback` muestra una reducción robusta.
- La tasa de acierto en el nombre verdadero no cambia en ninguna variante, lo que sugiere que la mejora se limita a suprimir nombres no respaldados, no a mejorar la identificación de entidades.
- La evaluación se limita a 540 pasajes de Wikipedia emparejados por entidad; no se documenta generalización a otros dominios ni a otras capas del modelo.
- El modelo no acepta texto plano: requiere el pipeline de extracción e inyección de activaciones, lo que limita su uso fuera de entornos de investigación.
- Riesgo de alucinación inherente al verbalizador base: sigue nombrando entidades aunque con menor frecuencia en la variante `holdback`.
- Sesgos conocidos: no documentados por el autor; los sesgos del modelo base Qwen2.5 no se analizan en esta ficha.
- Licencia Apache 2.0 permite uso comercial, pero el artefacto no está diseñado ni validado para producción.
- Sin descargas ni likes en el momento de la consulta; sin validación independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/tanvincible/nla-qwen2.5-7b-L20-av-specifics-lora
- Modelo base: https://huggingface.co/kitft/nla-qwen2.5-7b-L20-av
- Código y informe del proyecto: https://github.com/tanvincible/nla-wrong-names
