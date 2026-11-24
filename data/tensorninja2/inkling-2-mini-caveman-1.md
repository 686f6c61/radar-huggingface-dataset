# tensorninja2/inkling-2-mini-caveman-1

## Resumen

`inkling-2-mini-caveman-1` es un adaptador LoRA de estilo desarrollado por el usuario `tensorninja2` sobre el modelo base `thinkingmachines/Inkling-2-Mini`. Su unica funcion es modificar el registro de las respuestas del modelo para que este conteste con habla telegrafica de cavernicola y acento pirata. No es un modelo autonomo ni un ajuste orientado a mejorar capacidades: es un artefacto de estilo empaquetado en formato `.ninfer` para el runtime propietario NInfer-4090.

El adaptador tiene rango 16 con `alpha` 32, plegado sobre la matriz `B`, y actua exclusivamente sobre las siete proyecciones de atencion del transformer (query, query de posicion relativa, puerta de salida, attention sink, key, value y salida de atencion). No modifica los expertos del modelo base, lo que sugiere que Inkling 2 Mini emplea una arquitectura con componentes tipo mixture-of-experts, aunque la informacion disponible no detalla la configuracion completa del modelo base.

Su relevancia es acotada y experimental: sirve como ejemplo de adaptadores de estilo de bajo coste (20,4 MiB en dispositivo) que pueden cargarse por peticion junto a los pesos base en el mismo lote de decodificacion. Es la contraparte para Inkling 2 Mini del adaptador `qwen3.8-27b-caveman-1` del mismo autor. El repositorio tiene 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16, alpha 32) sobre las siete proyecciones de atencion del transformer base Inkling 2 Mini |
| Parametros totales | No disponible (adaptador de 21.403.648 bytes, ~20,4 MiB en dispositivo) |
| Parametros activos | No disponible (el base es presumiblemente MoE, pero no se detalla) |
| Longitud de contexto | Hasta 131.072 tokens en el ejemplo de despliegue (`--max-context 131072`); depende del artefacto base NInfer |
| Tipos de cuantizacion | No disponible para el adaptador; el ejemplo usa KV cache `rk4v4` |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (adaptador generativo, no es PEFT, Transformers ni GGUF) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con `alpha` 32 aplicado sobre las siete proyecciones de atencion del modelo base: query, query de posicion relativa, output gate, attention sink, key, value y attention output. El escalado se pliega en la matriz `B`, de modo que la inferencia no requiere aplicar un factor adicional en tiempo de ejecucion. Los expertos del modelo base no se adaptan, lo que limita el cambio a la ruta de atencion y explica su tamano reducido (21,4 MB).

La conversion se realizo con `tools/convert/inkling2_mini/convert_lora.py`, que transforma un directorio PEFT en el formato `.ninfer` propietario. No se especifican en la informacion disponible el dataset de entrenamiento, el numero de pasos, la composicion de datos ni si hubo tecnicas de alineacion como RLHF o DPO. Tampoco se documenta el proceso de recoleccion de ejemplos de estilo cavernicola-pirata. El autor declara explicitamente que "no se ha establecido ninguna precision de tarea" para el adaptador: es un cambio de registro, no una mejora funcional.

Una innovacion tecnica relevante del ecosistema, no del adaptador en si, es la decodificacion especulativa DSpark: el drafter propone tokens desde los pesos base y el target verifica con el adaptador cargado. El autor advierte que, como el drafter no esta adaptado, la tasa de aceptacion de tokens puede ser menor con este adaptador que con los pesos base.

## Capacidades

- Generacion de texto con registro cavernicola y acento pirata: la unica capacidad que el adaptador modifica de forma deliberada.
- Razonamiento y generacion general heredados del modelo base Inkling 2 Mini, aunque el autor no certifica precision de tarea.
- Compatibilidad con las APIs OpenAI Chat Completions, OpenAI Responses y Anthropic Messages a traves del servidor NInfer-4090.
- Carga por peticion junto a otros adaptadores y al modelo base en el mismo lote de decodificacion (`--lora-slots 2` en el ejemplo).
- Integracion con agentes de codificacion que hablen las APIs OpenAI o Anthropic, con soporte nativo en Caudra mediante el proveedor `ninfer-4090`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Pruebas de estilo y evaluacion de adaptadores LoRA: sirve como caso de referencia para medir el coste real de un adaptador de atencion en un servidor de inferencia con multiples adaptadores cargados simultaneamente.
- Demostraciones y prototipos con personalidad: util para experimentar con agentes conversacionales que requieran un tono marcado sin reentrenar el modelo base, gracias a la carga por peticion y al selector de modelo por nombre.
- Validacion de pipelines de conversion PEFT a `.ninfer`: el script `convert_lora.py` y el artefacto resultante permiten verificar el flujo completo de conversion y despliegue en NInfer-4090.
- Benchmarking de decodificacion especulativa con adaptadores: permite medir la caida de aceptacion de tokens del drafter DSpark cuando el target lleva un adaptador de estilo activo.
- Integracion en agentes de codificacion via Caudra: seleccionando `ninfer-4090/inkling-2-mini-caveman-1` en `/model`, se puede probar como un agente que responde en registro cavernicola mantiene el uso de herramientas y la estructura de las respuestas.
- Experimentos de coste de KV cache: el autor documenta que un adaptador de chat reduce la capacidad automatica de KV de 420.480 a 390.336 tokens con `rk4v4` y cuatro carriles, lo que lo convierte en un caso practico para estudiar el impacto de los pools de adaptadores en la memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha establecido precision de tarea para el adaptador.

Los unicos datos de rendimiento disponibles son de coste de inferencia en RTX 4090 con KV `rk4v4`:

| Metrica | Valor |
|---|---|
| Tamano en dispositivo por adaptador rango 16 | 20,4 MiB |
| Coste en decodificacion | ~7 % |
| Coste en prefill | ~8 % |
| Reduccion de capacidad KV automatica (un adaptador de chat, `rk4v4`, cuatro carriles) | de 420.480 a 390.336 tokens |

## Requisitos de hardware

- VRAM del adaptador: 20,4 MiB por slot de dispositivo; el grueso de la VRAM corresponde al modelo base Inkling 2 Mini en formato `.ninfer`, cuyo tamano no se detalla en la informacion disponible.
- GPU recomendada: RTX 4090, unico hardware mencionado en la documentacion y para el que existe el binario `build-sm89`.
- Cabe en GPU de consumo: si, segun el autor, en RTX 4090; no se documentan otros modelos.
- Despliegue: exclusivamente mediante NInfer-4090 (`ninfer-serve`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.ninfer` es propietario y no es PEFT ni GGUF.
- Parametros de servidor relevantes: `--kv-dtype rk4v4`, `--max-context 131072`, `--lora-dir lora/inkling-2-mini`, `--lora-slots 2`, `--spec dspark` para decodificacion especulativa.
- Latencia y throughput: no disponibles de forma absoluta; solo se documenta el sobrecoste relativo del adaptador (~7 % decode, ~8 % prefill).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| inkling-2-mini-caveman-1 | LoRA de estilo sobre Inkling 2 Mini | ~20,4 MiB en dispositivo | 131.072 (segun despliegue) | Apache-2.0 | Hugging Face, runtime NInfer-4090 |
| qwen3.8-27b-caveman-1 | LoRA de estilo sobre Qwen 3.8 27B (mismo autor) | No disponible | No disponible | No disponible | Hugging Face |
| Inkling-2-Mini (base) | Modelo base de Thinking Machines | No disponible | No disponible | Apache-2.0 (segun el adaptador) | Hugging Face |

La comparativa con modelos de la misma categoria (adaptadores de estilo) es limitada: no hay datos publicos de precision ni de benchmarks para ninguno de los dos adaptadores cavernicolas del autor. La diferencia principal frente al base es el registro de salida y el sobrecoste de inferencia; frente a `qwen3.8-27b-caveman-1`, el modelo base y el formato de empaquetado.

## Limitaciones y advertencias

- El adaptador solo cambia el registro de la respuesta; no mejora ni garantiza precision en ninguna tarea, y el autor lo declara explicitamente.
- La decodificacion especulativa DSpark puede aceptar menos tokens borrador con este adaptador que con los pesos base, ya que el drafter no esta adaptado.
- Dependencia total de NInfer-4090 y del artefacto base `Inkling-2-Mini-NInfer`; no es compatible con PEFT, Transformers, GGUF, vLLM, llama.cpp ni Ollama.
- El pool de adaptadores rechaza adaptadores convertidos para otro modelo, lo que obliga a mantener directorios separados por modelo base.
- La carga de un pool de adaptadores reduce la capacidad automatica de KV cache, lo que puede afectar a despliegues con contextos muy largos.
- No se documentan sesgos conocidos, riesgo de alucinacion especifico ni idiomas soportados; estas limitaciones heredan del modelo base, del que no se aportan detalles.
- Licencia Apache-2.0, que permite uso comercial, pero el uso en produccion esta condicionado por la madurez y el soporte del runtime NInfer-4090, no por la licencia.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso en produccion ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensorninja2/inkling-2-mini-caveman-1
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Artefacto base NInfer: https://huggingface.co/tensorninja2/Inkling-2-Mini-NInfer
- Adaptador equivalente para Qwen: https://huggingface.co/tensorninja2/qwen3.8-27b-caveman-1
- Repositorio NInfer-4090: https://github.com/tensorninja/ninfer-4090
- Documentacion de adaptadores y decisiones: https://github.com/tensorninja/ninfer-4090#inkling-2-mini-adapters-and-decisions
- Documentacion de coste de LoRA: https://github.com/tensorninja/ninfer-4090/blob/tensorninja/docs/performance.md#lora-adapters
- Integracion con Caudra: https://github.com/tensorninja/ninfer-4090#use-it-from-caudra
- Agente Caudra: https://caudra.ai
