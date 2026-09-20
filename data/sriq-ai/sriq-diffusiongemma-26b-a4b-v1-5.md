# sriq-ai/sriq-diffusiongemma-26B-A4B-v1.5

## Resumen

SRIQ · DiffusionGemma 26B-A4B · v1.5 es un adaptador LoRA (rango 16) desarrollado por sriq-ai sobre el modelo base kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK. Su objetivo es concreto y poco habitual: desplazar la cadena de razonamiento del modelo hacia chino simplificado comprimido, entrenando sobre el dataset sriq-ai/sriq-sft-v1.5 (1.424 filas). No es un modelo nuevo ni un ajuste orientado a mejorar capacidades, sino un experimento de transferencia de estilo sobre una arquitectura de difusion de texto.

El modelo base pertenece a la familia DiffusionGemma y no es autorregresivo: un encoder causal lee el prompt y lo deposita en una cache KV de solo lectura, mientras un decoder bidireccional desenoisa un lienzo (canvas) de 256 tokens a lo largo de unos 48 pasos de refinamiento. La nomenclatura 26B-A4B indica una arquitectura MoE con 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, aunque la model card no desglosa estas cifras de forma explicita. El adaptador ocupa solo 0,2 GB en el repositorio.

La relevancia de esta ficha es mas metodologica que de rendimiento: demuestra que el ajuste por LoRA funciona sobre un decoder de difusion de texto, terreno donde las recetas estandar estan poco documentadas. El propio autor advierte de que el adaptador cambia primero la forma del razonamiento y solo despues, si acaso, su correccion, y lo posiciona explicitamente como demostracion, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion LM (block-diffusion): encoder causal + decoder bidireccional que desenoisa un canvas de 256 tokens; el adaptador es un LoRA sobre el modelo base DiffusionGemma |
| Parametros totales | 26B nominales en el modelo base (segun nomenclatura del nombre); el adaptador LoRA no anade parametros significativos (~0,2 GB de repo) |
| Parametros activos | ~4B (MoE, segun nomenclatura "A4B" del nombre); no desglosado en la model card |
| Longitud de contexto | Hasta 262.144 tokens en la ruta de despliegue de vLLM del modelo base (--max-model-len 262144); canvas de 256 tokens por paso de desenoise |
| Tipos de cuantizacion | No disponible para el adaptador. En el modelo base, la cuantizacion a 4 bits no reduce los ~46 GB de expertos MoE fusionados (load_in_4bit no aporta nada); existen GGUF prebuilt del modelo base (unsloth) |
| Idiomas soportados | zh, en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft); el modelo base se distribuye en safetensors y tambien como GGUF de terceros |

## Arquitectura y entrenamiento

DiffusionGemma no genera token a token. Un encoder causal procesa el prompt y lo deja en una cache KV de solo lectura; a partir de ahi, un decoder bidireccional parte de un canvas de 256 tokens y lo refina en aproximadamente 48 pasos de desenoise (max_denoising_steps = 48 por defecto). Esa decodificacion es bloque a bloque, de modo que el streaming entrega un canvas completamente desenosado por fragmento y no un token por vez. El metodo forward del modelo no acepta labels ni devuelve perdida, por lo que la funcion objetivo debe implementarse a mano.

El entrenamiento del adaptador sigue la receta DiffusionGemma de NVIDIA NeMo Automodel, con una perdida compuesta `total = diffusion_CE + encoder_loss_weight * encoder_AR_CE`, donde el termino de diffusion CE se aplica sobre posiciones del canvas corrompidas. El run es corto: 800 pasos con rango 16 sobre 1.424 filas del dataset sriq-ai/sriq-sft-v1.5, un corpus que supervisa estilo y no validez logica. El autor reconoce que esa escala basta para copiar la forma superficial del razonamiento, no para ensenar la logica subyacente, y planea ampliar el corpus a 10.000-20.000 filas y supervisar directamente la validez del razonamiento en futuras revisiones del dataset.

## Capacidades

- Generacion de texto conversacional y de razonamiento multimodal: el pipeline declarado es image-text-to-text, de modo que el modelo base acepta entradas de imagen y texto.
- Razonamiento con bloque de pensamiento explicito (thinking), heredado del modelo base "it-ALWAYS-THINK"; el adaptador reescribe ese bloque en chino simplificado comprimido.
- Capacidades multilingues con foco en chino y ingles; la etiqueta multilingual aparece en las especificaciones.
- Reduccion de la longitud de generacion: el adaptador acorta las salidas de ~1.259 a ~745 caracteres de media en las pruebas del autor.
- Adherencia al formato de chat mediante `apply_chat_template` y generacion a traves de `PeftModel.generate`.
- No se documenta soporte de tool calling, function calling ni uso agentico en la informacion disponible.
- No se documentan capacidades de audio ni de vision mas alla del pipeline image-text-to-text declarado.

## Casos de uso

- Investigacion sobre decodificacion por difusion: el adaptador sirve como caso de estudio reproducible de fine-tuning LoRA sobre un decoder de difusion de texto, un terreno donde apenas existen recetas publicadas; permite medir si un ajuste de estilo es compatible con el objetivo de desenoise.
- Experimentos de destilacion de estilo en razonamiento multilingue: util para estudiar como se comporta una cadena de pensamiento cuando se fuerza a un idioma y una longitud distintos, usando los 14 prompts de validacion del autor como punto de partida.
- Generacion de datos sinteticos en chino comprimido: las salidas del adaptador (14 de 14 filas con presencia de CJK en las pruebas) pueden emplearse como semilla para construir corpus de razonamiento en chino, siempre que se filtren manualmente los pasos invalidos.
- Prototipado de asistentes conversacionales con entrada de imagen: al declarar pipeline image-text-to-text y ventana de hasta 262.144 tokens en la ruta de vLLM del modelo base, admite dialogos multi-turno con contexto largo y capturas o diagramas como entrada.
- Evaluacion comparativa de eficiencia de muestreo: al reducir la longitud media de generacion un 40 % aproximado, resulta util para medir el coste en tokens del razonamiento comprimido frente al razonamiento explicito en ingles.
- Base para un adaptador de razonamiento en produccion: el pipeline de entrenamiento descrito (objetivo diffusion CE + encoder AR CE, 800 pasos, r=16) es reutilizable para entrenar versiones con corpus mayores y supervision de validez, que es la direccion que el propio autor anuncia.
- Docencia y divulgacion tecnica: ilustra de forma tangible la diferencia entre imitar la forma de un razonamiento y reproducir su logica, con un ejemplo publicado (IMO 1990 P3) donde el resultado final es correcto pero los pasos intermedios no.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor unicamente reporta una evaluacion propia sobre 14 prompts reservados, 384 tokens nuevos por prompt y el adaptador cargado sin fusionar:

| Metrica (14 prompts, adaptador sin fusionar) | Modelo base | Este adaptador |
|---|---|---|
| Fraccion media de CJK en la generacion | 0,0 % | 26,6 % |
| Filas con algo de chino | 0 / 14 | 14 / 14 |
| Longitud media de generacion | ~1.259 caracteres | ~745 caracteres |

Prueba cualitativa adicional: en el problema IMO 1990 P3 (n² divide a 2ⁿ+1) el adaptador alcanza la solucion correcta (n = 1, 3), pero los pasos intermedios del bloque de pensamiento contienen afirmaciones invalidas (por ejemplo p | p-1) y superindices corruptos; el modelo base produce demostraciones en ingles mas limpias y validas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 52 GB en bf16 sobre un unico acelerador. La mayor parte corresponde a los ~46 GB de expertos MoE, almacenados como parametros 3D fusionados.
- La cuantizacion a 4 bits no reduce el consumo de los expertos fusionados, por lo que `load_in_4bit` no aporta ninguna ventaja en memoria para esta arquitectura.
- GPU recomendadas: A100 de 80 GB o H100. No cabe en GPU de consumo (RTX 4090, 24 GB) en bf16.
- Despliegue con vLLM 0.24.0 o superior y la imagen con soporte Gemma (`vllm/vllm-openai:gemma`); requiere `--max-model-len 262144`, `--max-num-seqs 4` y `--gpu-memory-utilization 0.85`. El limite de 4 secuencias importa porque los buffers de estado de difusion preasignan tensores de tamano `max_seqs × canvas_length × vocab_size`, de modo que subir `max-num-seqs` encarece la VRAM de forma cuadratica.
- Despliegue con SGLang mediante `--dllm-algorithm Gemma4Renoise` y `--trust-remote-code`. El streaming es por bloques, no token a token.
- llama.cpp requiere la build `diffusiongemma` y su runner `llama-diffusion-cli`; la ruta de conversion estandar no cubre esta arquitectura. Hay GGUF prebuilt del modelo base en unsloth/diffusiongemma-26B-A4B-it-GGUF.
- Restriccion critica: no llamar a `merge_and_unload()`. `Gemma4ClippableLinear` envuelve una `nn.Linear` y la fusion corrompe los pesos; el adaptador debe mantenerse sin fusionar y generar a traves de `PeftModel`.
- vLLM y SGLang sirven el modelo base por rutas especificas de block-diffusion, pero ninguna de las dos documenta LoRA para esta arquitectura, por lo que servir este adaptador con esos motores esta sin probar.
- Latencia y throughput: no disponibles en la informacion proporcionada. Los unicos parametros conocidos son 256 tokens de canvas y 48 pasos de desenoise por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sriq-ai/sriq-diffusiongemma-26B-A4B-v1.5 | Adaptador LoRA sobre 26B-A4B (r=16) | Heredado del base (hasta 262.144 tokens en vLLM) | Adaptador PEFT sobre diffusion LM | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK | 26B totales / ~4B activos | 262.144 tokens en vLLM | Diffusion LM block-diffusion, MoE | No disponible en la informacion | HuggingFace, servible en vLLM y SGLang |
| unsloth/diffusiongemma-26B-A4B-it-GGUF | 26B totales / ~4B activos | No disponible | Conversion GGUF del base | No disponible en la informacion | HuggingFace, requiere build `diffusiongemma` de llama.cpp |

No se dispone de informacion sobre otros adaptadores LoRA comparables para arquitecturas de difusion de texto, ni sobre alternativas autorregresivas de la misma categoria evaluadas contra este modelo.

## Limitaciones y advertencias

- Validez del razonamiento: el adaptador cambia la apariencia del razonamiento antes que su correccion. En el ejemplo publicado, los pasos intermedios contienen afirmaciones matematicamente invalidas aunque el resultado final sea correcto. No debe usarse como modelo de razonamiento en produccion.
- Sesgos de idioma: el entrenamiento fuerza la cadena de pensamiento hacia chino simplificado comprimido, lo que puede degradar la calidad del razonamiento en otros idiomas o producir mezclas de idiomas no deseadas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero el propio autor advierte de pasos intermedios incorrectos y superindices corruptos en las salidas.
- Escala del entrenamiento: 800 pasos con rango 16 sobre 1.424 filas es insuficiente para ensenar logica; el autor lo describe como demostracion de que la transferencia funciona, no como modelo listo para uso.
- Licencia: Apache 2.0, lo que permite uso comercial del adaptador, pero la licencia del modelo base no se detalla en la informacion disponible y debe verificarse por separado antes de un despliegue comercial.
- Restriccion tecnica de integracion: la fusion del adaptador (`merge_and_unload()`) corrompe los pesos por el envoltorio `Gemma4ClippableLinear`; obliga a mantener el adaptador separado y a generar via `PeftModel`.
- Compatibilidad de servidores: vLLM y SGLang no documentan soporte de LoRA para esta arquitectura, por lo que el despliegue en produccion de este adaptador concreto no esta verificado.
- Requisitos de memoria: ~52 GB de VRAM en bf16 y sin reduccion efectiva mediante cuantizacion a 4 bits, lo que excluye hardware de consumo.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, con publicacion y ultima actualizacion el mismo dia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriq-ai/sriq-diffusiongemma-26B-A4B-v1.5
- Modelo base: https://huggingface.co/kaivoss/diffusiongemma-26B-A4B-it-ALWAYS-THINK
- Dataset de entrenamiento: https://huggingface.co/datasets/sriq-ai/sriq-sft-v1.5
- GGUF prebuilt del modelo base: https://huggingface.co/unsloth/diffusiongemma-26B-A4B-it-GGUF
- Guia de inicio de vLLM: https://vllm.ai/#quick-start
- Receta DiffusionGemma de NVIDIA NeMo Automodel: https://docs.nvidia.com/nemo/automodel/recipes-e2e-examples/diffusiongemma
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a guias genericas de diseno de API y no se incluyen.
