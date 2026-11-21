# summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64

## Resumen

Qwen3.8-27B-SpeedX27-VL-GDN64 es un ajuste fino experimental del modelo Qwen/Qwen3.8-27B, publicado por el usuario summerMC en Hugging Face. El modelo conserva la naturaleza multimodal (image-text-to-text) del modelo base y sustituye o complementa parte de su mecanica de atencion con una arquitectura recurrente basada en Gated Delta Net (GDN64), orientada a mantener un estado de contexto de memoria casi constante en lugar de una cache KV que crece linealmente con la longitud de la secuencia.

El problema que aborda es el consumo de VRAM en inferencia de contexto largo. Segun la model card, el modelo base agota la memoria de una GPU de ~80 GiB alrededor de los 204.608 tokens, mientras que esta variante completa los 262.144 tokens con un pico de 55,36 GiB y un consumo practicamente plano a lo largo de todo el rango de contexto. La diferencia medida a 196.608 tokens es de aproximadamente 17,46 GiB menos de VRAM pico.

El modelo tiene 27.533.015.792 parametros (27,5 mil millones) en precision BF16, un repositorio de 55,1 GB, licencia Apache 2.0 y se distribuye en formato safetensors con codigo personalizado (`custom_code`), lo que exige `trust_remote_code` en transformers. Es un modelo marcado explicitamente como experimental por su autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con estado recurrente Gated Delta Net (GDN64), etiquetado `qwen3_5`; requiere codigo personalizado |
| Parametros totales | 27.533.015.792 (27,5 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (verificado en el benchmark del autor) |
| Tipos de cuantizacion | no disponible (el benchmark se realizo en BF16; no se listan GGUF ni AWQ/GPTQ en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de 27,5 mil millones de parametros para entrada imagen-texto y salida de texto. Sobre esa base, el autor introduce un componente recurrente Gated Delta Net con estado de 64 (denominado GDN64 en el nombre del modelo), que sustituye el crecimiento de la cache de contexto por un estado persistente de tamano fijo. La model card describe el resultado como un comportamiento "casi constante en memoria respecto a la longitud de contexto", en contraste con la arquitectura hibrida estandar del modelo base, que mantiene una cache dependiente de la longitud.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset de ajuste, ni sobre si se aplicaron tecnicas de RLHF, DPO o similar. El autor no documenta el procedimiento de entrenamiento del componente GDN64 mas alla de su efecto sobre el consumo de memoria. Tampoco se detalla si el ajuste congela el backbone original o entrena capas adicionales.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), segun el pipeline declarado y la etiqueta `multimodal`.
- Razonamiento sobre contextos muy largos: hasta 262.144 tokens verificados en una GPU de ~80 GiB.
- Inferencia de contexto largo con memoria practicamente plana gracias al estado recurrente GDN64.
- Decodificacion de un token tras un prefill de 262K completada con exito en 0,123 s (dato del autor).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible; el autor no declara idiomas.
- Modo thinking, audio o voz: no disponible. La etiqueta `automatic-speech-recognition` aparece en los tags del repo, pero la model card no documenta ninguna capacidad de audio.

## Casos de uso

- Analisis de repositorios y bases de codigo extensas: con 262K tokens de contexto y memoria plana, el modelo puede ingerir varios cientos de ficheros en una sola pasada sin fragmentar el contexto en trozos con perdida de coherencia entre ellos.
- Revision documental juridica o regulatoria: procesamiento de contratos, expedientes o normativa completa en una unica ventana, manteniendo referencias cruzadas entre secciones separadas por decenas de miles de tokens.
- Procesamiento de transcripciones y actas de reunion largas: la ventana de 262K permite cubrir varias horas de transcripcion en una sola llamada, util para resumenes con trazabilidad a la intervencion original.
- Analisis de imagenes documentales en lote: al ser multimodal, admite capturas de pantalla, diagramas o paginas escaneadas junto con texto de instrucciones extenso, adecuado para extraccion de datos estructurados de informes.
- Despliegue en hardware de gama alta limitado en memoria: al mantener un pico de 55,36 GiB frente a 72,82 GiB del base a 196K tokens, permite servir contexto largo en GPUs de ~80 GiB donde el modelo original provoca OOM.
- Investigacion sobre arquitecturas recurrentes: sirve como referencia reproducible para comparar el escalado de VRAM de un estado GDN64 frente a una cache KV convencional en un transformer de 27B.
- Evaluacion de viabilidad en pipelines de inferencia propios: el benchmark publicado (contexto de 262.144, chunk de 8.192, batch 1, BF16, cache activada) es directamente replicable para validar el ahorro de memoria antes de adoptar el modelo.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son de consumo de VRAM en contexto largo, no de calidad. Configuracion: limite de contexto 262.144 tokens, chunk de 8.192 tokens, batch 1, precision BF16, cache activada, GPU de ~80 GiB.

| Modelo | VRAM del modelo | Contexto maximo exitoso | VRAM pico |
|---|---:|---:|---:|
| Qwen/Qwen3.8-27B | 50,96 GiB | 196.608 tokens | 72,82 GiB a 196K |
| Qwen3.8-27B-SpeedX27-VL-GDN64 | 51,30 GiB | 262.144 tokens | 55,36 GiB |

Datos adicionales del autor: a 196.608 tokens la diferencia de pico es de ~17,46 GiB a favor de la variante GDN64; el modelo base falla por OOM a 204.608 tokens; el GDN64 completa el prefill de 262.144 tokens y una decodificacion posterior (0,123 s). El autor senala que la ventaja no proviene de pesos mas pequenos, ya que el modelo GDN64 ocupa ligeramente mas VRAM inmediatamente despues de cargarse.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MMMU u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM en BF16: ~51,30 GiB solo para pesos, segun la medicion del autor.
- Pico medido en contexto largo: 55,36 GiB a 262.144 tokens (frente a 72,82 GiB del base a 196K).
- GPU recomendadas: H100 80 GB, A100 80 GB, o cualquier acelerador con al menos ~56 GiB utiles tras reservar memoria para el runtime y activaciones.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en BF16. No se han publicado cuantizaciones GGUF/AWQ/GPTQ que permitan reducir el requisito.
- Despliegue: transformers con `trust_remote_code=True` es la via documentada. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la presencia de `custom_code` hace probable que estos motores no funcionen sin adaptaciones.
- Latencia: decodificacion de 1 token en 0,123 s tras un prefill de 262K (medicion del autor, hardware no especificado con detalle).
- Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM pico en contexto largo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-SpeedX27-VL-GDN64 | 27,5 B | 262.144 | 55,36 GiB a 262K | Apache 2.0 | Hugging Face, safetensors, `custom_code` |
| Qwen/Qwen3.8-27B | 27,5 B (no confirmado en la informacion) | 196.608 verificado en la prueba | 72,82 GiB a 196K | no disponible en la informacion | Hugging Face |
| Qwen3.8-27B-Longbook27-VL-GDN64 | no disponible | no disponible | no disponible | no disponible | Hugging Face (mismo autor, citado en la model card) |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento cognitivo frente al modelo base ni frente a otras alternativas de 27B. La comparacion disponible se limita al comportamiento de memoria.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: no hay garantia de estabilidad ni de paridad de calidad con el modelo base.
- No se han publicado benchmarks de calidad (razonamiento, codigo, matematicas, vision). Se desconoce si el ajuste GDN64 degrada las capacidades originales.
- Requiere `trust_remote_code=True` y ejecucion de codigo personalizado del repositorio: implica riesgo de seguridad y de compatibilidad con versiones futuras de transformers.
- Sin cuantizaciones publicadas: no es desplegable en GPUs de consumo de 24 GB en su formato actual.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue concreta.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplica el riesgo habitual de los modelos generativos, agravado por la ausencia de evaluaciones publicadas.
- Sesgos: no documentados por el autor.
- La etiqueta `automatic-speech-recognition` en los tags no esta respaldada por ninguna funcionalidad descrita en la model card; conviene tratarla como ruido de metadatos.
- El benchmark de VRAM se realizo con batch 1, chunk de 8.192 y una unica GPU de ~80 GiB; el comportamiento con concurrencia o con otras configuraciones de chunk no esta documentado.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la condicion experimental y la falta de evaluaciones desaconsejan su uso en produccion sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerMC/Qwen3.8-27B-SpeedX27-VL-GDN64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante relacionada citada en la model card: https://huggingface.co/summerMC/Qwen3.8-27B-Longbook27-VL-GDN64
- Imagen del benchmark de VRAM: https://cdn-uploads.huggingface.co/production/uploads/69e94913e947e9e6a0ae9d77/c_j7wWsy5ehtPQE0umktm.png
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
