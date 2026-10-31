# wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF

## Resumen

Qwen3.8-27B-CuteHuman-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario wesjos, diseñado para aplicarse en tiempo de ejecución sobre el modelo base Qwen3.8-27B mediante llama.cpp. Su objetivo es modificar el estilo de respuesta del modelo base: reduce drásticamente la longitud de las respuestas, elimina el tono típico de "asistente de IA" y añade una personalidad más cercana y natural ("cute persona"), todo ello sin fusionar los pesos y sin degradar las capacidades del modelo subyacente.

La relevancia de este adaptador está en su enfoque ligero y reversible: con solo 21 MB y 128 tensores, permite ajustar el tono del modelo en producción sin duplicar el despliegue del modelo base, e incluso modular la intensidad del cambio en caliente (escalado del LoRA en tiempo real vía API). Según los datos del autor, la capacidad de razonamiento se mantiene prácticamente intacta (MMLU 5-shot pasa de 77,54 % a 77,19 %), lo que lo hace adecuado para chatbots, roleplay y asistentes conversacionales en chino e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen3.8 (r=16, alpha=32, dropout=0) |
| Parametros totales | 10.485.760 (safetensors del adaptador); archivo GGUF de 21 MB con 128 tensores |
| Parametros activos | no disponible (no es MoE; el modelo base Qwen3.8-27B tiene 27 B de parametros segun su denominacion) |
| Longitud de contexto | no disponible para el adaptador; el ejemplo de uso del README emplea 32.768 tokens en llama-server |
| Tipos de cuantizacion | f16 (el adaptador se distribuye en f16; el modelo base se usa con cuantizaciones como Q4_K_M) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador para llama.cpp); version PEFT en safetensors disponible en el repo complementario |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) con rango r=16, alpha=32 y dropout 0, aplicado a las proyecciones de atencion y capas de lenguaje del modelo base Qwen3.8-27B. No modifica la torre de vision del modelo, por lo que las capacidades multimodales (con `--mmproj`) permanecen intactas. El GGUF incluye el alpha=32 embebido y un factor de escala en tiempo de ejecucion de 2,0 por defecto (equivalente a alpha/r).

Sobre el entrenamiento no se han publicado detalles del dataset (numero de ejemplos, composicion ni proceso de optimizacion). El autor indica que los datos de entrenamiento contienen solo turnos user/assistant, sin system prompt, y recomienda dejar el system prompt vacio para obtener el mejor comportamiento. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Reescritura del estilo conversacional: respuestas mas cortas (mediana de 268 a 69 caracteres) y con tono mas natural y cercano, eliminando expresiones tipicas de IA (de 2/40 a 0/40 ocurrencias).
- Roleplay y chat casual en chino e ingles.
- Mantiene las capacidades del modelo base: generacion de codigo, generacion de SVG (demostrado en el showcase con animaciones SVG), uso de herramientas y comportamiento de agente en terminal.
- Compatibilidad con vision: al no tocar la torre de vision, la comprension de imagenes sigue funcionando cargando el `mmproj` habitual.
- Escalado en tiempo de ejecucion: la intensidad del LoRA puede ajustarse (0,0 a 1,0 o valores intermedios) sin reiniciar el servidor.
- Compatible con el modo thinking del modelo base (desactivable para chat casual mediante `enable_thinking: false`).

## Casos de uso

- Chatbots companeros y roleplay: el estilo abreviado y natural del adaptador es idoneo para personajes conversacionales en apps de compania, donde las respuestas largas tipo ensayo resultan artificiales.
- Asistentes de chat en chino e ingles: al conservar el MMLU del base (77,19 %), puede usarse en atencion conversacional general sin perder capacidad de razonamiento.
- Agentes en terminal con personalidad: el showcase muestra un agente que restaura un SVG borrado y compone una cancion sobre ramen, util para CLIs y copilotos interactivos con tono ligero.
- Generacion de contenido creativo (SVG, letras de canciones): el modelo base mantiene su capacidad de generacion de codigo y arte vectorial, ahora con respuestas mas concisas.
- A/B testing de tono en produccion: gracias al escalado en caliente del LoRA, se puede comparar el comportamiento del base y del adaptador ajustando el factor de escala sin redesplegar.
- Integracion en llama.cpp existente: cualquier despliegue GGUF de Qwen3.8-27B puede anadir el adaptador con una sola flag (`--lora`), sin cambiar de modelo ni de infraestructura.

## Benchmarks y rendimiento

Datos publicados por el autor (antes/despues de aplicar el LoRA):

| Metrica | Sin LoRA | Con LoRA |
|---|---|---|
| Mediana de longitud de respuesta | 268 caracteres | 69 caracteres |
| Cuteness (escala 1-5) | 1,95 | 2,97 |
| Ocurrencias de "AI-speak" | 2 / 40 | 0 / 40 |
| MMLU 5-shot (570 items) | 77,54 % | 77,19 % |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa solo 21 MB en f16; el requisito de VRAM lo determina el modelo base Qwen3.8-27B en GGUF (por ejemplo, la variante Q4_K_M de unsloth mencionada en el README, mas el `mmproj` si se quiere vision).
- Con el LoRA montado, el autor mide un coste adicional de VRAM de aproximadamente 1,3 GB si se activa la decodificacion especulativa MTP (que recomienda desactivar).
- GPU recomendadas: no disponible de forma explicita; para un modelo de 27 B en Q4_K_M se requieren tipicamente GPUs con 20-24 GB de VRAM (RTX 3090/4090) o superiores (A100, H100).
- Despliegue: llama.cpp (`llama-server` y `llama-cli`) de forma nativa; existe version PEFT del adaptador para transformers y vLLM en el repo complementario. No se menciona Ollama ni TGI.
- Throughput medido por el autor con decodificacion especulativa MTP: 41,5 tok/s con el modelo base sin LoRA frente a 27,8 tok/s con el LoRA montado (por eso se recomienda desactivar MTP con el adaptador activo).

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-CuteHuman-LoRA-GGUF | LoRA (estilo) | 21 MB (adaptador) | Apache-2.0 | GGUF / PEFT | Requiere modelo base Qwen3.8-27B en GGUF |
| Qwen3.8-27B (base) | Modelo completo | 27 B | Apache-2.0 | GGUF, safetensors | Respuestas mas largas y tono neutro de asistente |
| wesjos/Qwen3.8-27B-CuteHuman-LoRA | Mismo LoRA en PEFT | no disponible | Apache-2.0 | safetensors | Para transformers y vLLM |

No hay alternativas de terceros directamente comparables publicadas en la informacion disponible.

## Limitaciones y advertencias

- No debe activarse la decodificacion especulativa MTP (`--spec-type draft-mtp`) con el LoRA montado: la cabecera draft fue entrenada sobre el modelo base y la tasa de acierto colapsa, pasando de 41,5 a 27,8 tok/s y desperdiciando 1,3 GB de VRAM.
- El entrenamiento no uso system prompt; dejarlo vacio funciona mejor, lo que limita la personalizacion por instrucciones de sistema.
- Para chat casual conviene desactivar el modo thinking (`enable_thinking: false`); con thinking activo hay que usar los hiperparametros oficiales del base (temp 1,0 / top_p 0,95).
- Solo cubre chino e ingles; el comportamiento en otros idiomas no esta documentado.
- No se han publicado benchmarks de alucinacion, sesgos ni seguridad; el estilo mas informal podria no ser adecuado para contextos profesionales o sensibles.
- La metrica de "cuteness" es una evaluacion propia del autor (escala 1-5) sin metodologia publicada, por lo que debe interpretarse con cautela.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales conocidas.

## Enlaces

- Repositorio del adaptador GGUF: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF
- Adaptador original en formato PEFT: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- SVGs de demostracion: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF/resolve/main/demos/compare/cat/base.svg y https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF/resolve/main/demos/compare/cat/cute.svg
- Paper, blog o demo externa: no disponible
