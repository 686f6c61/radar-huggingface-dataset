# YourHighnessLA/L0xRE-27b-Low-MTP

## Resumen
L0xRE-27b-Low-MTP es una cuantizacion GGUF de muy bajo bit (aproximadamente 2-3 bits por peso en las proyecciones) derivada del modelo Qwen/Qwen3.8-27B, publicada por el usuario YourHighnessLA (Sean YH). Su rasgo distintivo frente a la variante estandar L0xRE-27b-Low es la inclusion de un bloque adicional nextn/MTP (Multi-Token Prediction) de 830 MB que permite decodificacion especulativa autonoma: el propio modelo actua como borrador de si mismo, sin necesidad de cargar un fichero drafter separado.

El modelo esta pensado para despliegues de un solo fichero en hardware con poca memoria, con 262.144 tokens de contexto nativo y un vocabulario de 248.320 entradas. La arquitectura descrita por el autor es un hibrido de 64 bloques transformer mas un bloque nextn/MTP, con embeddings y capa de salida en mayor precision que el resto de proyecciones.

Es relevante ahora porque combina dos tecnicas de eficiencia de forma poco habitual en el ecosistema abierto: cuantizacion agresiva de pesos y decodificacion especulativa integrada en el propio fichero. Ahora bien, su uso esta fuertemente condicionado: requiere un runtime propietario del autor (L0xRE-BeeLLama-Low, rama release/l0xre-sm89-v0.4.7) y no funciona en llama.cpp estandar, Ollama, LM Studio, Transformers ni SGLang. El repositorio registra 0 descargas y 0 likes en la fecha de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida sobre base Qwen3.8-27B: 64 bloques transformer + 1 bloque nextn/MTP |
| Parametros totales | 27B segun la model card; los metadatos safetensors del repo indican 5.208.892.416 (discrepancia no aclarada por el autor) |
| Parametros activos | No aplica (no es un modelo MoE; el bloque MTP es un modulo de prediccion adicional) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | GGUF de bajo bit (aproximadamente 2-3 bpw en proyecciones, embeddings y salida en mayor precision); cache KV con tipos no estandar kvarn3 (claves) y kvarn2 (valores) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card) |
| Licencia | other - qwen-research-terms-derivative (terminos de investigacion/comunidad del modelo base); el tooling del runtime L0xRE es Apache-2.0 |
| Formato de pesos | GGUF (un unico fichero, 9.468.579.616 bytes) |
| Vocabulario | 248.320 tokens |
| Tamano del repo | 9,5 GB |

## Arquitectura y entrenamiento
No se describe un proceso de entrenamiento propio: el autor indica explicitamente que los pesos son los mismos que los de la variante estandar L0xRE-27b-Low, es decir, una cuantizacion derivada directamente de Qwen/Qwen3.8-27B sin reentrenamiento ni ajuste fino adicional documentado. La innovacion se situa por tanto en la compresion y en el runtime, no en los datos de entrenamiento, cuyo numero de tokens, composicion del dataset y eventuales fases de RLHF/DPO no se detallan en la informacion disponible.

La particularidad estructural es el bloque nextn/MTP anadido al final del stack transformer. Este bloque predice varios tokens hacia delante y se usa como borrador dentro de un esquema de decodificacion especulativa gestionado por el runtime (`--spec-type draft-mtp --spec-draft-n-max 2`). El autor senala que, si se adjunta un drafter externo DFlash2, el bloque MTP queda inactivo y conviene usar la variante estandar, que es 830 MB mas pequena y ofrece la misma velocidad y calidad. La cuantizacion emplea aproximadamente 2-3 bits por peso en las proyecciones, manteniendo embeddings y capa de salida en mayor precision, y define tipos propios de cuantizacion de cache KV (kvarn3/kvarn2) que no existen en llama.cpp estandar.

## Capacidades
- Generacion de texto conversacional en ingles, con soporte de plantilla Jinja (`--jinja`) y modo de razonamiento activable (`--reasoning on --reasoning-effort medium`).
- Generacion y decodificacion de codigo: la unica medicion publicada por el autor es precisamente de decodificacion de codigo (143,0 tok/s en una RTX 4090).
- Razonamiento con modo "thinking" activado: el autor reporta 124-126 aciertos sobre 150 en tres pasadas con thinking, frente a 117/150 de la cuantizacion nativa de referencia, en una suite interna no canonica.
- Decodificacion especulativa autonoma mediante el bloque MTP integrado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente.
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Capacidades de vision o audio: no disponibles.
- Servicio multi-slot: explicitamente fuera del alcance de la cualificacion del autor.

## Casos de uso
- Despliegue en un unico fichero con GPU de gama alta de consumo: gracias a su tamano de 9,47 GB y a la decodificacion especulativa integrada, permite servir un modelo de 27B en una sola tarjeta con VRAM limitada, sin gestionar ficheros drafter adicionales.
- Generacion de codigo de baja latencia en local: el rendimiento medido de 143,0 tok/s en decodificacion de codigo sobre RTX 4090 lo hace adecuado para asistentes de autocompletado o revision de codigo en estaciones de trabajo con una sola GPU.
- Procesamiento de repositorios o documentacion extensa: con 262.144 tokens de contexto nativo puede ingerir ficheros grandes, informes tecnicos o bases de codigo completas en una sola pasada, siempre que se respete el limite de contexto cualificado (el autor solo ha cualificado 32.768 tokens con la configuracion de ejemplo).
- Prototipado de investigacion sobre decodificacion especulativa: al incluir un bloque MTP propio y permitir compararlo con un drafter externo DFlash2, sirve como banco de pruebas para estudiar tasas de aceptacion y longitud media de borrador en esquemas self-drafting.
- Experimentacion con cuantizacion de muy bajo bit: es un caso de estudio util para medir la degradacion de calidad de un modelo de 27B comprimido a 2-3 bpw en proyecciones, comparando contra una cuantizacion nativa de referencia.
- Evaluacion de runtimes alternativos: permite validar el runtime L0xRE-BeeLLama frente a llama.cpp estandar en terminos de velocidad y calidad, aunque el modelo no funciona en el segundo.
- Servicio conversacional en ingles con plantilla Jinja: la configuracion de ejemplo con `--jinja --reasoning on` habilita dialogos multi-turno con razonamiento explicito para aplicaciones de asistencia tecnica en ingles.

## Benchmarks y rendimiento

Los unicos datos disponibles son mediciones internas del autor, no publicadas como benchmarks canonicos.

| Medicion | Resultado | Contexto |
|---|---|---|
| Decodificacion de codigo | 143,0 ± 5,7 tok/s (pico 150,8) | RTX 4090, runtime L0xRE SM89, con drafter DFlash2-Q4 |
| Tasa de aceptacion especulativa | 0,72 | Con drafter DFlash2-Q4 |
| Longitud media de borrador | 4,6 tokens | Con drafter DFlash2-Q4 |
| Calidad (suite interna) | 124-126 / 150 pass@1 con thinking (tres pasadas) | Suite interna no canonica |
| Calidad baseline cuantizacion nativa | 117 / 150 pass@1 | Suite interna no canonica |

El autor advierte que la cualificacion de MTP en modo autonomo (`draft-mtp`) esta en curso y que las cifras anteriores se tomaron con el drafter DFlash2, no con el bloque MTP integrado. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: el fichero GGUF ocupa 9,47 GB (unos 8,8 GiB) solo para los pesos; hay que sumar la cache KV. Con contexto de 32.768 tokens y cuantizacion de cache kvarn3/kvarn2, el autor no publica la cifra exacta de VRAM total, por lo que este dato no esta disponible.
- GPU recomendadas: RTX 4090 (unico hardware con mediciones publicadas). No hay datos de rendimiento en A100, H100 ni otras GPU.
- Viabilidad en GPU de consumo: si, en tarjetas con al menos 12-16 GB de VRAM para el contexto cualificado de 32.768 tokens; en 24 GB (RTX 4090, 3090) es donde estan tomadas las medidas del autor. Para contextos cercanos a los 262.144 tokens nativos no hay estimaciones publicadas.
- Opciones de despliegue: exclusivamente el runtime L0xRE-BeeLLama-Low, rama `release/l0xre-sm89-v0.4.7`. El autor declara explicitamente que NO esta cualificado para llama.cpp estandar, Ollama, LM Studio, Transformers ni SGLang.
- Parametros de servicio de referencia: `-c 32768 -b 2048 -ub 1024 -np 1 -t 8 -ngl 99 -fa on -ctk kvarn3 -ctv kvarn2 --spec-type draft-mtp --spec-draft-n-max 2`.
- Throughput estimado: 143,0 ± 5,7 tok/s en decodificacion de codigo sobre RTX 4090 con drafter externo. Latencia (time to first token) no disponible.
- Servicio multi-slot (`-np` superior a 1): fuera del alcance de la cualificacion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Runtime / disponibilidad |
|---|---|---|---|---|
| L0xRE-27b-Low-MTP | 27B (hibrido con bloque MTP) | 262.144 tokens | qwen-research-terms-derivative | Solo runtime L0xRE; fichero GGUF de 9,47 GB |
| L0xRE-27b-Low (variante estandar) | 27B | 262.144 tokens | qwen-research-terms-derivative | Solo runtime L0xRE; fichero 830 MB mas pequeno, misma velocidad y calidad segun el autor |
| Qwen/Qwen3.8-27B (modelo base) | 27B | 262.144 tokens (heredado por la variante cuantizada) | Terminos de investigacion/comunidad de Qwen | Disponible en HuggingFace en precision completa; specs detalladas no incluidas en la informacion disponible |
| Quantizaciones GGUF convencionales de modelos de ~27B (por ejemplo, familias de terceros como DavidAU) | Variable | Variable | Variable | Compatibles con llama.cpp estandar; datos concretos de comparacion no disponibles |

La comparacion cuantitativa con alternativas de la misma categoria no es posible con la informacion proporcionada: no hay benchmarks canonicos publicados para este modelo ni cifras equivalentes de los competidores citados.

## Limitaciones y advertencias
- Dependencia de runtime propietario: el modelo no funciona en llama.cpp estandar, Ollama, LM Studio, Transformers ni SGLang. Esto limita drasticamente su portabilidad y crea un riesgo de dependencia de un unico mantenedor.
- Los tipos de cuantizacion de cache KV kvarn3 y kvarn2 no existen en llama.cpp oficial, por lo que no se puede reproducir la configuracion de referencia fuera del runtime L0xRE.
- Rendimiento no confirmado: la propia decodificacion especulativa con el bloque MTP integrado (`draft-mtp`) esta pendiente de cualificacion; las cifras publicadas corresponden a un drafter externo DFlash2-Q4.
- Los datos de calidad proceden de una suite interna no canonica y el propio autor los califica de direccionales, no comparables con leaderboards. No hay MMLU, HumanEval ni GSM8K.
- Contexto cualificado limitado: la unica configuracion validada usa 32.768 tokens pese a los 262.144 nativos anunciados. Los contextos largos y el servicio multi-slot quedan explicitamente fuera de la cualificacion.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado.
- Cuantizacion agresiva (2-3 bpw en proyecciones): es esperable degradacion de calidad frente al modelo en precision completa; el autor solo aporta una comparacion contra otra cuantizacion de referencia, no contra el base sin cuantizar.
- Riesgo de alucinacion: no evaluado ni cuantificado en la informacion disponible; aplica el riesgo habitual de un modelo de lenguaje de 27B.
- Sesgos: no documentados por el autor.
- Licencia: se distribuye bajo los terminos de investigacion/comunidad de Qwen para el modelo base. Es una licencia de tipo "other" con nombre qwen-research-terms-derivative, lo que exige revisar las condiciones del modelo base antes de cualquier uso comercial; el tooling del runtime es Apache-2.0, pero eso no cubre los pesos.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el mismo dia (25 de septiembre de 2026), sin validacion independiente por parte de la comunidad.
- Discrepancia de metadatos: el recuento de parametros de safetensors del repo (5.208.892.416) no coincide con el "27B" de la model card, sin explicacion del autor.
- El contenido de la model card no incluye informacion sobre datos de entrenamiento, fases de alineacion ni evaluaciones de seguridad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low-MTP
- Variante estandar sin bloque MTP: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Runtime L0xRE-BeeLLama-Low (rama release/l0xre-sm89-v0.4.7): https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
- Avisos legales y tooling L0xRE: https://github.com/seanyourhighness/L0xRE
