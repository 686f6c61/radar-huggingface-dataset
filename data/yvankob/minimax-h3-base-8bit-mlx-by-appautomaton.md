# yvankob/minimax-h3-base-8bit-mlx-by-appautomaton

## Resumen

Este repositorio contiene un paquete de ejecucion completo en MLX para **MiniMax-H3-Base**, la etapa abierta del modelo MiniMax-H3 de MiniMaxAI. Se trata de un modelo generativo de difusion (DiT) que produce video y audio estereo sincronizados a partir de texto, con ambas modalidades desruidificadas conjuntamente en una unica secuencia empaquetada ("packed sequence"). El bundle lo publica el usuario yvankob, derivado del trabajo del proyecto App Automaton (runtime `mlx-h3`), y esta pensado para inferencia en Apple Silicon sin PyTorch, sin CUDA y sin API en la nube.

El paquete aplica cuantizacion afin de 8 bits de MLX con grupo de 32 (`a8g32`) a los dos DiT y al codificador de texto Qwen3-VL-32B, mientras que los VAE de video y audio se mantienen en su precision original FP16 y FP32 por ser sensibles a la calidad. El bundle completo ocupa 102,7 GiB distribuidos en ficheros safetensors. Es relevante ahora porque acerca a equipos con Mac de memoria unificada un modelo de generacion conjunta de audio y video que en su version densa seria inviable en local.

Conviene subrayar dos consecuencias de que solo se libere la etapa intermedia: nada reescribe el prompt (la etapa H3-Context-IR no esta incluida, de modo que el codificador ve exactamente el texto enviado) y la salida es 768p, ya que la etapa H3-Regenerate-2K que escalaria a 2K tampoco esta abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de doble modalidad (video + audio) con atencion sobre secuencia empaquetada; codificador de texto Qwen3-VL-32B; VAE de video y VAE de audio independientes |
| Parametros totales | No disponible (no se declara el recuento; como referencia, cada DiT ocupa 34,8 GiB en a8g32 y el codificador de texto Qwen3-VL-32B, 27,7 GiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende de la longitud de prompt admitida por el codificador Qwen3-VL-32B; la model card no especifica un limite) |
| Tipos de cuantizacion | MLX affine int8, 8 bits, group size 32 (`a8g32`); escalas y sesgos en bf16; tensores sensibles en F32; VAE de video FP16 y VAE de audio FP32 sin modificar |
| Idiomas soportados | En (segun la model card) |
| Licencia | `minimax-h3-community-license` (campo `license: other`, enlace `LICENSE` en el repositorio) |
| Formato de pesos | safetensors (empaquetado MLX para los tensores cuantizados); tokenizer en JSON |

## Arquitectura y entrenamiento

La arquitectura es un par de Diffusion Transformers estructuralmente identicos que solo se diferencian en el empaquetado de entrada: `dit_fl2va` para texto y de 0 a 2 fotogramas clave, y `dit_ref2va` para condicionamiento por referencia. El runtime carga uno u otro segun el modo de condicionamiento, nunca ambos, lo que permite descargar selectivamente solo el modo que se vaya a usar. La generacion es conjunta: video y audio estereo se desruidifican juntos en una misma secuencia empaquetada, de ahi que el pipeline se etiquete como `text-to-video` y `text-to-audio-video`. El texto se codifica con Qwen3-VL-32B, y la decodificacion a pixeles y a forma de onda se hace con dos VAE separados (video FP16, audio FP32).

Sobre el proceso de cuantizacion, se empaqueta un tensor solo si cumple cuatro condiciones simultaneas: es bf16, se llama `.weight`, es de rango 2 y su ultimo eje es divisible por 32. Quedan fuera a proposito los tensores marcados como F32 por el release original (proyecciones de parches, `time embedder`, cabezas de salida finales y `rope.inv_freq`), las tablas de lookup leidas con `take_axis` (`embed_tokens` y `pos_embed`, que devolverian basura uint32 tras el gather) y todo aquello de lo que no puede colgarse una escala (sesgos, normalizaciones y tensores cuyo ultimo eje no es multiplo del tamano de grupo). El resultado es 260 de 535 tensores empaquetados en el DiT y 439 de 902 en el codificador de texto. Segun el autor, en la ruta affine de MLX las activaciones se mantienen en bf16, por lo que bajar la precision de los pesos compra residencia en memoria, no throughput. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto con resolucion de salida de 768p.
- Generacion de audio estereo sincronizado con el video, desruidificado de forma conjunta en la misma secuencia.
- Condicionamiento por fotogramas clave (modo `fl2va`, de 0 a 2 keyframes).
- Condicionamiento por referencia (modo `ref2va`).
- Codificacion de prompts en ingles mediante Qwen3-VL-32B, lo que implica capacidades de comprension de texto e imagen del propio codificador.
- Compatibilidad con el Turbo LoRA de la comunidad `larryvrh/MiniMax-H3-Turbo-Lora` en BF16: los adaptadores apuntan a 259 lineales del DiT, todos presentes en ambos checkpoints; el runtime carga el adaptador dentro de la fase DiT y lo libera con ella, sin fusionarlo en los ficheros.
- Ruta experimental M5 W8A8 (NAX): el runtime puede recuantizar los lineales del tronco ya cargados en 8 bits a grupos simetricos W8A8 y despachar TensorOps enteros nativos.
- Ejecucion totalmente local en Apple Silicon sin PyTorch, sin CUDA y sin API en la nube.
- No se menciona en la informacion disponible soporte de tool calling, function calling, agentes ni modo de razonamiento explicito.

## Casos de uso

- Previsualizacion de storyboards animados: a partir de una descripcion textual se obtiene un clip de 768p con audio sincronizado, util para validar ritmo y atmosfera antes de producir.
- Prototipado de creatividades publicitarias: generar variantes de un anuncio con locucion y efectos sonoros coherentes sin depender de un estudio de doblaje, todo en local.
- Doblaje y pruebas de sincronia audiovisual: el audio se desruidifica junto al video en la misma secuencia, lo que resulta adecuado para experimentar con correspondencia labial y temporal.
- Investigacion en difusion multimodal: el bundle permite reproducir y modificar un DiT que modela video y audio conjuntamente, con la posibilidad de aplicar LoRA sobre los 259 lineales objetivo.
- Generacion de material de relleno para videojuegos o prototipos interactivos: clips cortos con sonido para maquetas de nivel o pantallas de carga, generados en una maquina de sobremesa.
- Flujos de trabajo con requisitos de privacidad: al no requerir API en la nube ni CUDA, el contenido del prompt no sale del equipo, lo que encaja en entornos con material confidencial.
- Demostraciones y docencia sobre cuantizacion MLX: el repositorio documenta con detalle la politica de empaquetado, los digests SHA-256 y las decisiones de precision, y sirve como caso de estudio reproducible.
- Experimentacion con aceleracion por adaptadores: cargar el Turbo LoRA sin fusionarlo permite comparar calidad y coste computacional entre pasos con y sin adaptador dentro de la misma instalacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas cuantitativas (FVD, CLIP, similitud de audio, latencia ni throughput) ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con MLX; no hay soporte CUDA ni ruta PyTorch en este bundle.
- Almacenamiento: 102,7 GiB para el bundle completo, mas el espacio de la copia de trabajo; en el repositorio de HuggingFace figuran 110,2 GB de tamano total.
- Memoria unificada estimada (calculo propio a partir de los tamanos de fichero, no confirmado por el autor): el codificador de texto ocupa 27,7 GiB, cada DiT 34,8 GiB y los VAE suman aproximadamente 5,4 GiB. Si el runtime libera fases antes de cargar la siguiente, el pico se situa por encima de los 40 GiB; si el codificador y el DiT coexisten en memoria, el pico supera los 68 GiB antes de contar activaciones.
- Equipos recomendados de forma orientativa: Mac Studio o Mac Pro con M2 Ultra o M3 Ultra y 128 GB o 192 GB de memoria unificada para el flujo completo; MacBook Pro con M4 Max de 128 GB como minimo razonable. Los equipos con 64 GB de memoria unificada solo serian viables si el runtime libera el codificador de texto antes de la fase DiT y si se descarga un unico modo de condicionamiento.
- Descarga selectiva: dado que los dos DiT son estructuralmente identicos y el runtime carga solo uno, se puede omitir del download el modo que no se vaya a utilizar, ahorrando 34,8 GiB.
- Opciones de despliegue: runtime `mlx-h3` (paquete PyPI `mlx-h3`, repositorio GitHub `appautomaton/mlx-h3`, pagina de proyecto `appautomaton.renocrypt.com/mlx-h3/`). No se mencionan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Precision de pesos | Resolucion de salida | Difusion de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este bundle (`yvankob/minimax-h3-base-8bit-mlx-by-appautomaton`) | DiT video+audio, runtime MLX | int8 affine a8g32 en DiT y text encoder; VAE en FP16/FP32 | 768p | Si, sincronizada | `minimax-h3-community-license` | Repositorio HuggingFace de un tercero |
| `MiniMaxAI/MiniMax-H3` (upstream) | Suite completa en tres etapas (H3-Context-IR, H3-Base, H3-Regenerate-2K) | Densa (precision original) | 768p en H3-Base, hasta 2K con la tercera etapa | Si, sincronizada | Licencia de comunidad MiniMax-H3 | Repositorio oficial |
| `Comfy-Org/MiniMax-H3` | Redistribucion de componentes (VAE de video y audio) para ComfyUI | FP16 (video VAE) y FP32 (audio VAE) | Depende del pipeline anfitrion | Si, via los mismos VAE | No disponible en la informacion proporcionada | Repositorio de Comfy-Org |
| `larryvrh/MiniMax-H3-Turbo-Lora` | Adaptador LoRA BF16 sobre el DiT | BF16 | No aplica (adaptador) | No aplica | No disponible en la informacion proporcionada | Repositorio de la comunidad |

No se identifican en la informacion disponible otros modelos comparables de generacion conjunta de video y audio con runtime MLX.

## Limitaciones y advertencias

- Este repositorio no incluye la etapa H3-Context-IR, de modo que el prompt no se reescribe ni se expande a un brief estructurado; el codificador procesa literalmente el texto enviado, lo que puede degradar notablemente los resultados si se reutilizan prompts pensados para el producto alojado.
- La salida esta limitada a 768p. Las cifras de 2K que aparecen en guias del producto alojado corresponden a la tercera etapa, que no es abierta.
- La model card declara unicamente ingles como idioma soportado; no hay evidencia en la informacion disponible sobre calidad en castellano ni en otros idiomas.
- El modelo es un sistema generativo de difusion: cabe esperar alucinacion visual y sonora, artefactos temporales, incoherencias de movimiento y desajustes de sincronia, especialmente con prompts ambiguos o escenas complejas.
- La licencia es `minimax-h3-community-license` (etiquetada como `other`). No se detallan en la informacion proporcionada los terminos exactos de uso comercial, por lo que conviene revisar el fichero `LICENSE` antes de cualquier despliegue en produccion.
- Riesgo de sesgos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos demograficos, culturales o de representacion.
- La cuantizacion a 8 bits es una decision del publicador de este bundle, no del modelo original; aunque los VAE se mantienen en precision completa, existe una perdida de calidad no cuantificada frente al release denso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y esta publicado por un tercero (`yvankob`), no por MiniMaxAI. La trazabilidad de los pesos cuantizados no esta verificada por el autor original.
- Dependencia de la plataforma: el bundle solo funciona con MLX en Apple Silicon. No hay ruta CUDA, ROCm ni PyTorch, lo que descarta su uso en clusters con GPU NVIDIA o AMD.
- Los requisitos de memoria unificada son elevados y no estan documentados por el autor; las cifras de esta ficha para VRAM equivalente son estimaciones derivadas del tamano de los ficheros y deben validarse en el equipo objetivo.
- La ruta M5 W8A8 aparece descrita como experimental y opcional, sin garantias de estabilidad ni de calidad de salida.
- No se publican latencias ni throughput, por lo que no es posible planificar capacidad de servicio sin medir en hardware propio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yvankob/minimax-h3-base-8bit-mlx-by-appautomaton
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio GitHub del runtime: https://github.com/appautomaton/mlx-h3
- Paquete PyPI: https://pypi.org/project/mlx-h3/
- Pagina de proyecto: https://appautomaton.renocrypt.com/mlx-h3/
- Perfil de App Automaton en HuggingFace: https://huggingface.co/appautomaton
- Guia de prompting del runtime: https://github.com/appautomaton/mlx-h3/blob/main/docs/prompting.md
- VAE de video y audio (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Turbo LoRA de la comunidad: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
