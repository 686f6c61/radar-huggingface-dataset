# spizzerp/inkling-2-mini-r9700-sglang

## Resumen

Inkling 2 Mini es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Thinking Machines, con 26.000 millones de parametros totales, capacidades multimodales (texto e imagen) y licencia Apache 2.0. El modelo original se publica en el repositorio `thinkingmachines/Inkling-2-Mini` de Hugging Face. La ficha que nos ocupa, sin embargo, no contiene pesos: es un espejo de un repositorio de GitHub que empaqueta las herramientas necesarias para servir el modelo en una unica GPU AMD Radeon AI PRO R9700 (32 GB, arquitectura gfx1201).

El problema que resuelve este repositorio es de infraestructura: SGLang solo soporta oficialmente este modelo sobre aceleradores AMD Instinct MI350X/MI355X. El autor anade los paquetes de dispositivo para gfx1201 a la imagen AMD de SGLang y aplica diez parches de codigo (cuatro para que arranque, tres para corregir errores observados en esta tarjeta y tres para acelerar la inferencia). No se recuantiza nada: se sirve el checkpoint publicado tal cual, con capas densas en BF16 y capas de expertos en los formatos NVFP4 y MXFP8 originales.

Es relevante porque demuestra que un MoE de 26B con vision y decodificacion especulativa (modo draft, denominado DSpark) puede ejecutarse en una GPU de consumo profesional de 32 GB, con un contexto de 117.888 tokens (235.776 con caché KV de 8 bits) y velocidades de 112-125 tok/s escribiendo codigo. El estado es experimental y no oficial: probado en una sola maquina y sin afiliacion con Thinking Machines, SGLang ni AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE), multimodal texto-imagen; inferencia via SGLang con decodificacion especulativa (DSpark) |
| Parametros totales | 26B |
| Parametros activos | no disponible |
| Longitud de contexto | 117.888 tokens (235.776 con `KV=fp8`) |
| Tipos de cuantizacion | Pesos originales sin recuantizar: capas densas en BF16 (16 bits), capas de expertos en NVFP4 (4 bits) y MXFP8 (8 bits); caché KV en 16 bits por defecto, opcion de 8 bits (`KV=fp8`, con perdida) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos originales de Hugging Face (safetensors del checkpoint `thinkingmachines/Inkling-2-Mini`); no se usa GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture-of-experts con 26.000 millones de parametros totales que acepta texto e imagenes como entrada. La model card del repositorio espejo no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO; esa informacion corresponderia al repositorio original de Thinking Machines y no esta disponible en la informacion proporcionada. Lo que si se documenta es la estructura de precision del checkpoint: atencion, router y capa de salida en 16 bits (BF16), y capas de expertos en formatos de 4 y 8 bits (NVFP4 y MXFP8) tal como los publica el autor original.

La innovacion tecnica destacable en esta ficha es la pila de inferencia: SGLang con modo draft o decodificacion especulativa (DSpark), que verifica varios tokens especulados por pasada, con longitud de verificacion adaptativa (`patch_adaptive_verify.py`) que reduce los tokens verificados cuando pocos se aceptan. El repositorio incluye parches especificos para gfx1201: sustitucion de `scaled_dot_product_attention` en la torre de vision (falla en esta tarjeta con la build de PyTorch usada), versiones PyTorch de kernels precompilados que solo existen para gfx950, correccion de una lectura sin mascara con off-by-one en la atencion de verificacion, ajuste de tamanos de tile en la GEMM de expertos (lectura de un prompt de 29K tokens de 21 s a 8 s), correccion de filas de relleno no inicializadas en los grafos de prefill que podian producir NaN, soporte de kernels ROCm de atencion para caché KV de 8 bits, correccion de una lectura obsoleta en un kernel que almacenaba y releia un tile en el mismo lanzamiento, calculo de capas de expertos de 4 bits en FP16 en lugar de BF16 (1,3x mas rapido y bit-identico) y verificacion adaptativa.

## Capacidades

- Generacion de texto y prosa en ingles.
- Generacion de codigo, con velocidades medidas de 112-125 tok/s.
- Razonamiento previo a la respuesta: el modelo razona antes de cada contestacion, incluso con `reasoning_effort: none`; el nivel `low` mantiene ese razonamiento corto.
- Entrada de imagenes (multimodal texto-imagen).
- Tool calling / function calling: los turnos de llamada a herramientas alcanzan unos 200 tok/s.
- Razonamiento multi-paso y uso en agentes, segun el soporte de tool calling y el modo de razonamiento.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Decodificacion especulativa con verificacion adaptativa para acelerar la generacion.

## Casos de uso

- Asistencia de programacion en local: el modelo genera codigo a 112-125 tok/s en una sola R9700, lo que permite integrarlo como backend de autocompletado o chat de codigo en un puesto de trabajo sin depender de la nube.
- Agentes con tool calling: los turnos de llamada a herramientas a unos 200 tok/s y el soporte de function calling lo hacen adecuado para flujos de agente que consultan APIs o ejecutan acciones de forma iterativa.
- Procesamiento de documentos largos: con 117.888 tokens de contexto (235.776 con `KV=fp8`) puede leer prompts de 29K tokens en unos 8 s (3.620 tok/s) y responder sobre ellos, util para analisis de informes, contratos o bases de codigo.
- Analisis de imagenes con texto: al aceptar entrada de imagenes, sirve para tareas de descripcion, extraccion de informacion o preguntas sobre capturas y diagramas.
- Despliegue en hardware AMD de consumo profesional: el repositorio permite montar un servidor compatible con la API de OpenAI (`http://127.0.0.1:18991`, modelo `inkling-2-mini`) en una R9700, util para equipos que ya trabajan con ROCm y quieren evitar GPUs NVIDIA.
- Evaluacion y desarrollo de pila de inferencia: los scripts de verificacion (`tools/gsm8k.py`, `tools/accept_ab.py`) permiten medir precision y throughput tras modificar los parches, util para ingenieros que mantengan o adapten el despliegue.
- Prototipado de razonamiento con control de esfuerzo: el parametro `reasoning_effort` permite ajustar la longitud del razonamiento segun la latencia tolerada, adecuado para pipelines por lotes donde se prioriza el coste frente a la profundidad.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| GSM8K (primeras 400 preguntas de test, temperatura 0) | 388/400 con modo draft; 389/400 con draft desactivado |
| Escritura de codigo | 112-125 tok/s |
| Escritura de prosa | 63-70 tok/s |
| Turnos de tool call | ~200 tok/s |
| Lectura de prompt de 29K tokens | 8 s (3.620 tok/s); prompt repetido desde cache |
| Peticiones simultaneas | 4 |
| Arranque | ~100 s |
| VRAM maxima | ~30,6 GB |
| Sin modo draft (`DRAFT=0`) | ~61 tok/s para todo |

Las velocidades se midieron a temperatura 1 con el ajuste de razonamiento mas bajo y varian alrededor de un 10% segun lo que escriba el modelo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU: AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Otras tarjetas no estan probadas; varios parches solo se activan para `gfx120x`.
- VRAM estimada: ~30,6 GB en pico con el checkpoint completo y contexto de 117.888 tokens. Con `KV=fp8` el contexto se duplica a 235.776 tokens a costa de un 10-20% menos de velocidad de lectura y de una cache KV con perdida.
- La tarjeta no debe controlar el monitor: si lo hace, hay que reducir `--mem-fraction-static` en `run.sh` (menor contexto) para evitar que el escritorio se quede sin memoria de video.
- Sistema: Linux con driver `amdgpu` (probado en kernel 7.2) y Docker (funciona sin root) con capacidad de pasar `/dev/kfd` y `/dev/dri` al contenedor.
- Disco: unos 80 GB (imagen de ~60 GB y pesos de 19 GB).
- Despliegue: SGLang con la imagen Docker del repositorio; servidor compatible con la API de OpenAI en el puerto 18991. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este modelo en esta tarjeta.
- Throughput y latencia: ver la tabla de benchmarks; 4 peticiones simultaneas, arranque de ~100 s.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de modelos alternativos de tamano o tarea comparable, por lo que no es posible establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- Estado experimental y no oficial: probado en una sola maquina, version 0.1.0 del 22 de noviembre de 2026, sin afiliacion con Thinking Machines, SGLang ni AMD.
- Solo soporta ingles; no se documentan capacidades multilingues.
- El modelo razona antes de cada respuesta incluso con `reasoning_effort: none`, lo que anade latencia y tokens de salida inevitables.
- Riesgo de alucinacion no cuantificado en la informacion disponible; como en cualquier modelo generativo, las salidas deben validarse en produccion.
- La opcion `KV=fp8` es con perdida: duplica el contexto pero degrada la calidad de la cache KV y reduce la velocidad de lectura un 10-20%.
- El repositorio no contiene pesos: es un espejo de herramientas, parches y scripts; los pesos deben descargarse del repositorio original de Thinking Machines.
- Dependencia fuerte del hardware: los parches estan pensados para gfx1201 y algunos solo se activan en `gfx120x`; otras tarjetas no estan probadas.
- El servidor llena la GPU hasta ~30,6 GB, por lo que no puede compartir tarjeta con un escritorio grafico sin reducir el contexto.
- La licencia Apache 2.0 del modelo permite uso comercial, pero el estado experimental del despliegue y la ausencia de garantias del autor del repositorio aconsejan validar antes de llevar a produccion.
- La verificacion de cambios en los parches es critica: el autor advierte de que las comprobaciones de igualdad a nivel de kernel y las pruebas de una sola peticion pasaron mientras el modelo servido perdia 20 puntos en GSM8K.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/spizzerp/inkling-2-mini-r9700-sglang
- Codigo fuente e incidencias: https://github.com/Spizzerp/inkling-2-mini-r9700-sglang
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Resultados detallados de medicion: `docs/RESULTS.md` dentro del repositorio de GitHub
