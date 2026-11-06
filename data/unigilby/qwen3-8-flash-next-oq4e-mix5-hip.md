# unigilby/Qwen3.8-Flash-Next-oQ4e-mix5-HIP

## Resumen

Qwen3.8-Flash-Next-oQ4e-mix5-HIP es una cuantizacion de 4/5 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario unigilby en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado que aplica la receta de cuantizacion oQe (oQ4e-mix5) sobre el modelo base de Qwen, con el objetivo de reducir el peso en disco y memoria para su despliegue en hardware con ancho de banda limitado, en particular iGPUs AMD.

El checkpoint pesa aproximadamente 106 GB e incluye las tablas n-gram y la cabeza MTP (multi-token prediction). Su interes radica en que mantiene una calidad cercana al modelo en bf16 mientras acelera la decodificacion en torno a un 22% en tareas de codigo respecto a la variante oQ4e-HIP, gracias a que los tensores densos (mixers) se almacenan a 5 bits en lugar de 8. Esta pensado explicitamente como una opcion orientada a velocidad, no como checkpoint por defecto.

El modelo base Qwen3.8-Flash-Next pertenece a la familia Qwen y se distribuye bajo la licencia Qwen community 1.0. La ficha tecnica del modelo base (arquitectura exacta, contexto, idiomas) no se detalla en la informacion disponible; lo que se documenta aqui es la variante cuantizada y su receta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-Flash-Next (detalle no disponible); incluye mixers densos, Gated DeltaNet, hyper-connection mixers y proyecciones n-gram, segun la model card |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor usado en el benchmark del autor con `--context 131072`) |
| Tipos de cuantizacion | 4-bit grupo 32 (expertos enrutados y experto compartido); 5-bit grupo 64 (mixers densos: atencion, proyecciones Gated DeltaNet, hyper-connection mixers, proyecciones clave/valor n-gram); 8-bit (puertas del experto compartido) |
| Idiomas soportados | no disponible |
| Licencia | Qwen community 1.0 (archivo LICENSE incluido sin cambios) |
| Formato de pesos | safetensors (libreria mlx); tamano del repo 114,0 GB |

## Arquitectura y entrenamiento

La variante cuantizada parte del checkpoint Qwen/Qwen3.8-Flash-Next y aplica la receta oQe de oMLX (commit `e81d525`) con una imatrix generada a partir del conjunto `oqe_code_multilingual` (128 muestras de 512 tokens). El predicado de cuantizacion se ajusto para que cada tensor que el cargador HIP de TensorFold fusiona tenga una unica anchura y grupo: base 4-bit grupo 32 para expertos enrutados y experto compartido, tensores mas anchos a grupo 64, y puertas del experto compartido a 8-bit. La cabeza MTP se almacena bajo `language_model.mtp.*` y se incluyen las tablas n-gram.

La model card menciona componentes propios de una arquitectura hibrida: atencion, proyecciones Gated DeltaNet, hyper-connection mixers y proyecciones clave/valor n-gram, ademas de expertos enrutados y un experto compartido, lo que sugiere una arquitectura de mezcla de expertos con capas de estado recurrente. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La innovacion destacable de esta variante es la asignacion heterogenea de bits por tipo de tensor para equilibrar ancho de banda y calidad, junto con la preservacion de la aceptacion de MTP.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un modelo de lenguaje de gran escala; la variante conserva el comportamiento en tareas de prosa y codigo segun las metricas KL y de evaluacion reportadas.
- Generacion de codigo: evaluado en HumanEval con 93,3% pass@1 en esta variante.
- Razonamiento matematico: evaluado en GSM8K con 94,3% exact match zero-shot.
- Conocimiento general: evaluado en MMLU-Pro con 67,6%.
- Decodificacion especulativa mediante cabeza MTP (multi-token prediction): 3.05 tokens por ronda de verificacion en codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en iGPU con memoria unificada: el checkpoint esta disenado para hardware con ancho de banda limitado, como el AMD Ryzen AI MAX+ 395 con Radeon 8060S (gfx1151) y 128 GB de memoria unificada, donde el autor reporta 51,3 tok/s en codigo y 41,4 tok/s en chat.
- Generacion de codigo en produccion local: con 93,3% pass@1 en HumanEval y soporte de MTP, puede integrarse en entornos de desarrollo asistido o pipelines de revision de codigo que se ejecuten en estaciones de trabajo sin GPUs dedicadas de gran formato.
- Razonamiento matematico y resolucion de problemas: el 94,3% en GSM8K lo hace adecuado para asistentes de calculo y tutoria que operen sobre hardware de consumo con memoria unificada.
- Evaluacion y experimentacion con cuantizacion: sirve como referencia para estudiar el compromiso entre anchura de bits de los mixers densos, calidad (KL frente a bf16) y velocidad de decodificacion en arquitecturas hibridas.
- Servicio de inferencia con contexto largo: el benchmark se ejecuto con contexto de 131.072 tokens, por lo que puede emplearse en tareas de resumen o analisis de documentos extensos en entornos con memoria suficiente.
- Investigacion sobre decodificacion especulativa: la cabeza MTP incluida y la aceptacion de 3,05 tokens por ronda permiten experimentar con tecnicas de aceleracion en servidores HIP nativos.

## Benchmarks y rendimiento

Calidad frente a bf16 (KL sobre WikiText-2 raw test y HumanEval prompt + solucion canonica, 31.728 tokens puntuados por segmento, cabeza principal, mlx-vlm 0.7.10, mlx 0.32.4):

| checkpoint | KL medio prosa / codigo | acuerdo top-1 prosa / codigo | perplejidad prosa / codigo |
|---|---|---|---|
| bf16 | - | - | 3,064 / 1,086 |
| oQ4e-HIP | 0,064 / 0,013 | 91,95% / 99,00% | 3,122 / 1,091 |
| oQ4e-mix5-HIP | 0,096 / 0,022 | 90,26% / 98,75% | 3,172 / 1,097 |
| TensorFold/Qwen3.8-Flash-Next-MLX-4bit-MTP (4-bit uniforme) | 0,401 / 0,204 | 78,74% / 93,50% | 4,005 / 1,285 |

Evaluacion de tareas (servidor HIP nativo de TensorFold, greedy, thinking off, mismos items por checkpoint):

| checkpoint | GSM8K | HumanEval | MMLU-Pro |
|---|---|---|---|
| oQ4e-HIP | 94,7% | 93,9% | 69,1% |
| oQ4e-mix5-HIP | 94,3% | 93,3% | 67,6% |
| 4-bit uniforme | 93,0% | 93,9% | 55,9% |

Velocidad en iGPU AMD Ryzen AI MAX+ 395, Radeon 8060S gfx1151, 128 GB de memoria unificada, TensorFold HIP nativo, MTP con 3 borradores, `--parallel 1 --context 131072`:

| checkpoint | bytes leidos por token decodificado | codigo / chat tok/s | tokens MTP por ronda de verificacion (codigo) |
|---|---|---|---|
| oQ4e-HIP | 5,44 GiB | 42,0 / 36,2 | 2,61 |
| oQ4e-mix5-HIP | 4,45 GiB | 51,3 / 41,4 | 3,05 |
| 4-bit uniforme | 4,00 GiB | 50,0 / 44,0 | no disponible |

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa aproximadamente 106 GB con tablas n-gram y cabeza MTP; el repositorio completo pesa 114,0 GB.
- GPU recomendadas: el autor valida el despliegue en AMD Ryzen AI MAX+ 395 con Radeon 8060S (gfx1151) y 128 GB de memoria unificada. Para GPUs dedicadas no se proporcionan datos de compatibilidad ni rendimiento.
- Cabe en GPU de consumo: no en GPUs de consumo convencionales por el tamano del checkpoint; si en sistemas con memoria unificada de al menos 128 GB como el citado.
- Opciones de despliegue: servidor HIP nativo de TensorFold (compilado con `zig build native-hip -Dhip-arch=gfx1151`); libreria mlx para los pesos. No se documentan opciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: 51,3 tok/s en codigo y 41,4 tok/s en chat en el hardware de referencia, con MTP de 3 borradores y contexto de 131.072 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | HumanEval | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| oQ4e-mix5-HIP (este) | 179.999.981.459 | 131.072 | 94,3% | 93,3% | 67,6% | Qwen community 1.0 | Hugging Face, 113 descargas |
| oQ4e-HIP (misma familia, mixers a 8 bits) | 179.999.981.459 | 131.072 | 94,7% | 93,9% | 69,1% | Qwen community 1.0 | Hugging Face |
| TensorFold/Qwen3.8-Flash-Next-MLX-4bit-MTP (4-bit uniforme) | no disponible | no disponible | 93,0% | 93,9% | 55,9% | no disponible | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (bf16) | no disponible | no disponible | no disponible | no disponible | no disponible | Qwen community 1.0 | Hugging Face |

## Limitaciones y advertencias

- Es un checkpoint cuantizado, no un modelo base: la calidad degrada respecto a bf16 (KL de 0,096 en prosa y 0,022 en codigo, frente a 0,064 y 0,013 de oQ4e-HIP).
- La variante mix5 pierde calidad frente a oQ4e-HIP en las tres tareas evaluadas (GSM8K 94,3% frente a 94,7%, HumanEval 93,3% frente a 93,9%, MMLU-Pro 67,6% frente a 69,1%); el autor la describe como una eleccion por velocidad, no como opcion por defecto.
- La evaluacion se limita a tres tareas y a un unico entorno de ejecucion (servidor HIP nativo de TensorFold, greedy, thinking off); no hay datos sobre otros modos de decodificacion ni sobre tool calling o agentes.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni capacidades multimodales en la informacion proporcionada.
- El rendimiento reportado corresponde a un hardware concreto (AMD Ryzen AI MAX+ 395, gfx1151); no hay garantias de que se reproduzca en otras GPUs o backends.
- Licencia Qwen community 1.0: es necesario revisar el archivo LICENSE incluido para conocer las restricciones de uso comercial antes de desplegar en produccion.
- El checkpoint depende de la libreria mlx y del cargador HIP de TensorFold; no se documenta compatibilidad con otras herramientas de inferencia.
- El modelo fue creado y actualizado el 31 de octubre de 2026, con 0 likes y 113 descargas, lo que indica una validacion comunitaria muy limitada.

## Enlaces

- Hugging Face: https://huggingface.co/unigilby/Qwen3.8-Flash-Next-oQ4e-mix5-HIP
- Variante oQ4e-HIP: https://huggingface.co/unigilby/Qwen3.8-Flash-Next-oQ4e-HIP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint 4-bit uniforme de TensorFold: https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-MLX-4bit-MTP
