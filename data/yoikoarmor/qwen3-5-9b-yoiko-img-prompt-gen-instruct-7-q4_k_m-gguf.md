# yoikoarmor/Qwen3.5-9B-yoiko-img-prompt-gen-instruct-7-Q4_K_M-GGUF

## Resumen

Qwen3.5-9B-Instruct-7 es un derivado comunitario del modelo base Qwen/Qwen3.5-9B, publicado por el usuario yoikoarmor. Se trata de un ajuste fino mediante LoRA (rango 16, alpha 32) cuyo objetivo concreto es reescribir peticiones breves de imagenes en prompts positivos en ingles para Stable Diffusion, con control deliberado de los pesos de atencion sintacticos del tipo `(frase:peso)`. El repositorio que nos ocupa es la cuantizacion Q4_K_M en formato GGUF del checkpoint fusionado en BF16, generada con llama.cpp.

El modelo conserva la arquitectura de texto de Qwen3.5: 32 capas, tamano oculto 4096, vocabulario de 248.320 tokens y 8.953.803.264 parametros totales. Se ha eliminado por completo la componente multimodal (vision y video), por lo que es estrictamente text-only. Los tensores MTP (multi-token prediction) no estan presentes en el checkpoint fusionado, de modo que la conversion se realizo con `--no-mtp`.

Es relevante ahora porque ofrece una alternativa ligera y ejecutable en GPU de consumo para la generacion automatica de prompts de difusion, con licencia Apache 2.0 y soporte nativo de plantilla de chat Jinja con modo thinking desactivable. No es una publicacion oficial de Qwen y no debe confundirse con la familia oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo `qwen35`), 32 capas, hidden size 4096 |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de la model card usa 2048 tokens (`-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (unica publicada en este repo); existe checkpoint BF16 en repo companion |
| Idiomas soportados | en, ja (segun metadatos; el prompt de sistema fuerza salida en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (5.629.109.056 bytes, ~5,63 GB / 5,24 GiB); BF16 en repo companion |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer denso de 32 capas con hidden size 4096 y vocabulario de 248.320 tokens. Sobre esa base se aplico un adaptador LoRA identificado como "7" (rango 16, alpha 32), seleccionado como el mejor adaptador de evaluacion en la epoca 3 / checkpoint 546, con SHA-256 `d60d86811c44baebd5c5a4852532785fbea6822fbc7407bb8679548939bd764c`. El adaptador se fusiono en el base BF16 sin cuantizar mediante PEFT safe merge, y de ahi se convirtio a GGUF y se cuantizo a Q4_K_M con llama.cpp b9605.

La innovacion principal no es arquitectonica sino de especializacion: el LoRA ensena al modelo a reformular peticiones cortas (incluso en japones) en prompts de Stable Diffusion en ingles, aplicando pesos de atencion `(frase:peso)` de forma intencionada segun la importancia relativa de cada concepto. No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. El checkpoint fusionado carece de tensores MTP, por lo que no hay decodificacion especulativa multi-token en esta version.

## Capacidades

- Generacion de texto y reescritura de peticiones breves a prompts de difusion en ingles.
- Control explicito de pesos de atencion estilo Stable Diffusion: `(frase:1.1)`, `(frase:0.85)`, etc., con instrucciones sobre rangos (0,8-0,95 para detalles secundarios, 1,1-1,2 para enfasis moderado, 1,25-1,4 para sujeto central).
- Comprension de entradas en japones (el ejemplo de la model card usa `少年の旅立ち` como peticion).
- Formato conversacional con plantilla de chat Jinja integrada y soporte de `enable_thinking` (desactivado en el flujo recomendado).
- Compatibilidad con endpoints tipo OpenAI (`endpoints_compatible` en los tags).
- No soporta vision ni entrada de imagen/video: la componente multimodal fue omitida.
- No hay evidencia publicada de soporte de tool calling, function calling ni razonamiento multi-paso; la model card no lo menciona.

## Casos de uso

- Generacion de prompts para Stable Diffusion: el modelo recibe una peticion breve (por ejemplo, en japones o ingles) y devuelve un prompt positivo en ingles con pesos de atencion calibrados, listo para pegar en la interfaz de difusion.
- Front-end de interfaz creativa: integrado como servicio local (`llama-server`) para que un usuario escriba una idea escueta y obtenga un prompt elaborado, reduciendo la curva de aprendizaje del prompting de difusion.
- Pipelines de generacion por lotes: dado un CSV de conceptos o titulos, el modelo produce prompts normalizados en ingles para renderizar cientos de imagenes de forma consistente.
- Localizacion de peticiones japonesas a prompts en ingles: apropiado para equipos que trabajan en japones pero generan con modelos de difusion entrenados en ingles.
- Prototipado en GPU de consumo: al ocupar ~5,24 GiB en Q4_K_M, cabe en tarjetas de 8 GB o superiores, lo que permite iterar localmente sin infraestructura cloud.
- Ensenanza y demostracion de ponderacion de atencion: util como ejemplo didactico de como los pesos sintacticos afectan a la generacion de imagenes, ya que el prompt de sistema explicita los rangos recomendados.
- Asistente interno de redaccion de prompts: desplegado tras una API local para que un equipo de diseno obtenga sugerencias de prompt sin salir de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta un smoke test de 128 tokens generados con llama.cpp b9605, CUDA 13.3 y RTX 5090, con contexto de 2048 tokens, decoding greedy y thinking desactivado. El propio autor advierte que se trata de una prueba de humo, no de una evaluacion de calidad ni de equivalencia con BF16, y que la salida se corto a 128 tokens, con posibilidad de repeticiones y pesos de atencion uniformes.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,24 GiB solo para los pesos en Q4_K_M; con overhead de contexto y KV cache para 2048 tokens, el consumo real sera superior (no disponible una cifra oficial).
- GPU recomendadas: el autor valido el modelo en RTX 5090 con CUDA 13.3; cualquier GPU con al menos 8 GB de VRAM deberia poder cargar los pesos en Q4_K_M, aunque no se han publicado pruebas en otras tarjetas.
- Cabe en GPU de consumo: si, en principio en modelos con 8 GB o mas (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090, 5090), aunque solo la 5090 esta verificada.
- Opciones de despliegue: llama.cpp (build con soporte Qwen3.5 GGUF, probado con b9605 / `85f99dca8`) mediante `llama-server` o `llama-completion`. LM Studio podria funcionar segun la version de runtime instalada, pero no fue probado de forma independiente. Transformers no carga este GGUF por la ruta habitual de HF; no es un NF4 de bitsandbytes.
- Latencia y throughput: no disponibles. Solo se documenta una generacion de 128 tokens en RTX 5090 sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-9B-Instruct-7 (este) | 8,95 B | no disponible (ejemplo a 2048) | GGUF Q4_K_M / BF16 | Apache 2.0 | Reescritura de prompts SD con pesos de atencion |
| Qwen/Qwen3.5-9B (base oficial) | 9 B aprox. | no disponible | safetensors | no disponible en esta ficha | Modelo generalista multimodal/texto |
| Modelos especializados en prompt engineering para SD | no disponible | no disponible | no disponible | no disponible | Generacion de prompts |

No se dispone de datos de benchmarks ni de alternativas directamente comparables en la informacion proporcionada; la comparativa se limita a la relacion con el base oficial y a la categoria funcional.

## Limitaciones y advertencias

- Cuantizacion con perdida: Q4_K_M puede alterar los logits respecto a BF16; el autor no realizo prueba de equivalencia con el modelo sin cuantizar.
- Riesgo de repeticion y de estructuras truncadas: la model card advierte que aumentar el limite de salida no garantiza eliminar repeticiones ni estructuras cortadas.
- Pesos de atencion uniformes: el modelo puede asignar el mismo peso a todo, pese a las instrucciones del prompt de sistema; el autor lo senala como fallo posible.
- Requiere prompt de sistema explicito: las instrucciones de reescritura no estan embebidas en los pesos; sin el system prompt, el comportamiento no esta garantizado.
- Solo texto: sin vision ni entrada de imagen/video; no apto para tareas multimodales.
- Idiomas: metadatos limitados a en y ja; no hay evidencia de buen rendimiento en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un derivado comunitario no oficial de Qwen; conviene revisar la licencia del base original antes de produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- No se distribuyen logs, rutas, credenciales ni datos de entrenamiento; el autor declara que solo se publican el GGUF, la model card y la licencia.
- Compatibilidad de runtime fragil: requiere builds de llama.cpp con soporte Qwen3.5 GGUF; versiones antiguas o LM Studio sin runtime actualizado pueden fallar.

## Enlaces

- Repositorio Hugging Face (GGUF Q4_K_M): https://huggingface.co/yoikoarmor/Qwen3.5-9B-yoiko-img-prompt-gen-instruct-7-Q4_K_M-GGUF
- Modelo base fusionado en BF16: https://huggingface.co/yoikoarmor/Qwen3.5-9B-Instruct-7-merged-bf16
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
