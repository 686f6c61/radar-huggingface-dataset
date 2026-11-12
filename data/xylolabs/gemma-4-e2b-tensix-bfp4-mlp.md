# Xylolabs/gemma-4-E2B-Tensix-BFP4-MLP

## Resumen

Gemma-4-E2B-Tensix-BFP4-MLP es una cuantizacion del modelo multimodal google/gemma-4-E2B realizada por Xylolabs, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un checkpoint derivado en el que las capas lineales del modelo de lenguaje se han reescrito para que sus pesos caigan exactamente sobre la rejilla de punto flotante por bloques (block floating point) que consumen las unidades Tensix a traves de TT-NN: `bfloat4_b` (BFP4, 4,5 bits por peso) para las proyecciones MLP y `bfloat8_b` (BFP8, 8,5 bits por peso) para las proyecciones de atencion.

El checkpoint pesa 6,78 GB empaquetado, con una media de 11,67 bits por peso, y mantiene en bf16 el resto de tensores: embedding, LM head (atada al embedding), normalizaciones, torre de vision y torre de audio. La cuantizacion BFP4 se ha obtenido con GPTQ y una busqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; la BFP8 se ha generado por redondeo al mas cercano.

La relevancia de esta ficha es doble: por un lado documenta un formato de cuantizacion poco habitual en el ecosistema Hugging Face, ligado al hardware de Tenstorrent y no a GPUs convencionales; por otro, ofrece una metodologia de evaluacion explicita (divergencia KL y top-1 frente al modelo BF16, con umbrales de aceptacion declarados) que resulta util para juzgar cuantizaciones de 4 bits. Conviene subrayar que el autor indica que el checkpoint se probo unicamente en `ttsim`, el simulador de Blackhole, y no en hardware fisico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de google/gemma-4-E2B); capas lineales reescritas a formato block floating point para Tensix |
| Parametros totales | 5.525.831.235 (5,53 mil millones, segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate/up/down; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atencion q/k/v/o; bf16 en embedding, LM head, normas, vision_tower y audio_tower |
| Idiomas soportados | no disponible (la calibracion uso texto en ingles y coreano; el modelo base no declara lista de idiomas en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 con valores ya alineados a la rejilla BFP4/BFP8; incluye `quant4.json` con el formato de cada proyeccion |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B, un modelo multimodal any-to-any (texto, imagen y audio) con pipeline `image-text-to-text`/`any-to-any`. Sobre esa base, Xylolabs no reentrena ni aplica ajuste fino: unicamente cuantiza las capas lineales del modelo de lenguaje. Las 35 capas del MLP (gate, up, down) pasan a BFP4 y las proyecciones de atencion (q, o en 35 capas; k, v en 15 capas) pasan a BFP8. El resto de tensores, incluidas las torres de vision y audio, permanece en bf16 sin cambios.

La innovacion tecnica esta en el procedimiento de cuantizacion. Para BFP4 se emplea GPTQ combinado con una busqueda del exponente compartido por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; para BFP8 se usa redondeo al mas cercano. Los pesos se almacenan en safetensors en bf16 pero con cada valor ya situado en la rejilla BFP, de modo que TT-NN los empaqueta sin perdida adicional al cargarlos en la NPU. El autor proporciona `pack_tensix.py` y `verify_grid.py` para comprobar matriz a matriz que el empaquetado en `ttnn.bfloat4_b` y `ttnn.bfloat8_b` es exacto (lectura de pesos en orden [in, out]).

## Capacidades

- Generacion de texto autoregresiva en modo continuacion: es el checkpoint preentrenado, sin plantilla de chat.
- Capacidades multimodales heredadas del modelo base: procesamiento de imagen y audio (torres `vision_tower`, `embed_vision`, `audio_tower` y `embed_audio` conservadas en bf16), con pipeline any-to-any.
- Razonamiento y conocimiento general derivados del modelo base; no se han medido de forma independiente en esta cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible; al carecer de plantilla de chat, el uso agentico requeriria envoltorio externo.
- Capacidades multilingues: no declaradas; la calibracion cubre ingles y coreano, pero no se especifica la cobertura linguistica resultante.
- Capacidad especial: empaquetado nativo en formatos BFP4/BFP8 para NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con verificacion de rejilla incluida.

## Casos de uso

- Despliegue en NPU Tenstorrent: el checkpoint esta pensado para cargarse en Wormhole o Blackhole a traves de TT-NN, aprovechando que los pesos ya estan en la rejilla BFP y evitando conversion en tiempo de carga. Es el escenario principal y el unico validado por el autor (en simulador).
- Investigacion en cuantizacion block floating point: sirve como referencia reproducible de GPTQ sobre BFP4 con busqueda de exponente por bloque, con scripts de verificacion incluidos para auditar el empaquetado.
- Evaluacion de fidelidad de cuantizaciones de 4 bits: la model card publica divergencia KL media (0,03708) y top-1 (89,96 %) frente a BF16, lo que permite comparar metodologias de cuantizacion con una metrica declarada y umbrales de aceptacion explicitos.
- Prototipado multimodal en entornos Tenstorrent: al conservar torres de vision y audio en bf16, puede emplearse para experimentar con entradas imagen-texto o audio-texto en hardware Tensix, aunque sin validacion en silicio por parte del autor.
- Generacion de texto en modo completado: util para tareas de continuacion de texto, rellenado y evaluacion few-shot (el autor evalua con 3-shot en formato de completado), sin necesidad de plantilla conversacional.
- Base para futuras cuantizaciones y comparativas: al incluir `quant4.json` con el formato por proyeccion y el mapeo de shards, facilita reproducir el pipeline o generar variantes (por ejemplo, BFP8 integro) con las mismas herramientas.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto al modelo BF16, no calidad de tarea ni velocidad en dispositivo.

| Modelo | Bits/peso | Tamano (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-E2B) | 16 | 9,29 | 0 | 100 | 21 de 28 | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 11,67 | 6,778 | 0,03708 | 89,96 | 21 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,87 | 3,428 | 0,10733 | 83,79 | 20 de 28 | 1 |

La divergencia KL y el top-1 se calculan sobre 8.176 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano). Las respuestas corresponden a 28 prompts cortos con comprobacion automatica, en formato de completado y 3-shot. El autor declara como criterio de aceptacion un KL medio no superior a 1,5 veces el de Q4_K_M y como maximo una respuesta perdida adicional; el modelo cumple con 0,35 veces el KL de Q4_K_M y cero respuestas perdidas. No se midio velocidad en dispositivo.

## Requisitos de hardware

- VRAM/DRAM estimada: 6,78 GB empaquetado en formatos BFP; el repositorio ocupa 11,1 GB por almacenar los tensores en bf16.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, via TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b` / `ttnn.bfloat8_b`, `TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`).
- Validacion: probado con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole); no se ejecuto en hardware fisico segun el autor.
- GPUs convencionales: el checkpoint puede cargarse con transformers en bf16 (`device_map="auto"`), pero los formatos BFP no aportan ventaja fuera de Tensix; en ese caso el peso efectivo es el del modelo en bf16 (~9,29 GB).
- Opciones de despliegue: TT-NN / tt-metal para Tensix; transformers para inspeccion y ejecucion en GPU. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles; no se realizaron mediciones en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / bits por peso | Tamano | Contexto | Licencia | Estado |
|---|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 5,53 mil millones | BFP4 MLP + BFP8 atencion (11,67 bits) | 6,78 GB | no disponible | Apache 2.0 | Publicado, probado solo en simulador |
| google/gemma-4-E2B (BF16) | 5,53 mil millones | bf16 (16 bits) | 9,29 GB | no disponible | Apache 2.0 | Modelo base de referencia |
| Q4_K_M de llama.cpp | 5,53 mil millones | GGUF Q4_K_M (5,87 bits) | 3,43 GB | no disponible | Apache 2.0 (derivado) | Baseline de cuantizacion de 4 bits |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos de tamano y categoria equiparables en la informacion proporcionada. Frente a Q4_K_M, este checkpoint ocupa casi el doble y usa mas bits por peso, pero reduce la divergencia KL a un tercio y no pierde ninguna respuesta correcta en la evaluacion del autor.

## Limitaciones y advertencias

- No validado en hardware: las pruebas se hicieron con `ttsim`, el simulador de Blackhole; el comportamiento en silicio (Wormhole o Blackhole) no esta confirmado.
- Sin plantilla de chat: es el checkpoint preentrenado, por lo que no admite uso conversacional directo sin envoltorio.
- Evaluacion limitada al modelo de lenguaje: el autor indica explicitamente que solo se cuantizo y evaluo el LM; las torres de vision y audio se conservan en bf16 pero no se evaluaron.
- Metricas de fidelidad, no de calidad: los numeros publicados miden cercania a BF16 (KL, top-1) sobre 8.176 posiciones y 28 prompts; no sustituyen una evaluacion de tarea completa.
- Cobertura linguistica incierta: la calibracion uso ingles y coreano; no se declara lista de idiomas soportados ni rendimiento por idioma.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son los heredados del modelo base, que no se detallan aqui.
- Licencia: Apache 2.0 segun la model card del autor; el repositorio del modelo base no incluye fichero LICENSE, por lo que el autor aporta el texto estandar y un NOTICE con los cambios. Uso comercial permitido bajo los terminos de Apache 2.0, sin garantia ("as is").
- Dependencia de ecosistema: el valor practico del checkpoint esta ligado a TT-NN y al hardware Tensix; fuera de ese entorno no ofrece ventajas sobre el modelo base en bf16.
- Sin afiliacion con Google ni con Tenstorrent segun el autor; descargas y likes nulos en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Revision concreta del modelo base citada en la evaluacion: https://huggingface.co/google/gemma-4-E2B/tree/433813a669639fd7eaa83155828e9000ed357d53
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
- Licencia del checkpoint: https://huggingface.co/Xylolabs/gemma-4-E2B-Tensix-BFP4-MLP/blob/main/LICENSE
