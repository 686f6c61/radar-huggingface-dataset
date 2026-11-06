# yushengsu/Qwen3-8B-5layer-MoE-16E1A-v1

## Resumen

Qwen3-8B-5layer-MoE-16E1A-v1 es un modelo borrador (draft model) para decodificacion especulativa sobre Qwen/Qwen3-8B, desarrollado por el usuario yushengsu y entrenado con la libreria SpecForge bajo el algoritmo DSpark. No es un modelo de proposito general: su funcion es proponer tokens que el modelo objetivo Qwen3-8B verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del modelo grande.

La innovacion principal es la sustitucion de las capas FFN densas del borrador por una capa MoE de estilo Qwen3.5-MoE con 16 expertos enrutados de 768 dimensiones, top-1 y sin experto compartido. Al repartir los 12288 de ancho del FFN denso entre 16 expertos, el modelo conserva el recuento de parametros del borrador denso de referencia (1,13B) pero cada token ejecuta solo 1/16 de los FLOPs de FFN (0,47B de parametros activos en esa parte), lo que reduce el coste por paso de propuesta.

El checkpoint publicado es `ep6/` (paso 64.586, final de la epoca 6), seleccionado tras un barrido de longitud de aceptacion con bloque 7. Esta pensado para servirse con SGLang aplicando el PR sglang#47181, que introduce la clase `Qwen3MoeDSparkModel`. Su relevancia es practica: ofrece una via para acelerar inferencia de Qwen3-8B con un borrador mas barato de ejecutar que el denso equivalente, a costa de una ligera perdida de longitud de aceptacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 5 capas de atencion completa y FFN tipo MoE (16 expertos enrutados, top-1, sin experto compartido); cabeza Markov de rango 256; sin cabeza de confianza |
| Parametros totales | 1,13B (equivalente al borrador denso de referencia) |
| Parametros activos | 0,47B por token en la parte FFN |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportado con `specforge export --to hf`) |

Otros datos de configuracion: hidden 4096, 32 cabezas de query y 8 de KV (head_dim 128), capas objetivo [1, 9, 17, 25, 33] de Qwen3-8B, tamano de bloque 16.

## Arquitectura y entrenamiento

El borrador consta de 5 capas de atencion completa que toman estados intermedios de las capas 1, 9, 17, 25 y 33 del modelo objetivo Qwen3-8B. La capa FFN es una MoE con 16 expertos de 768 dimensiones y enrutamiento top-1 sin experto compartido: los 16 expertos suman 12288, el mismo ancho que el FFN denso del borrador de referencia, de modo que el recuento de parametros coincide pero el coste computacional por token se divide por 16 en esa parte. Incluye una cabeza Markov de rango 256 y no incorpora cabeza de confianza. El equilibrio de carga se gestiona con sesgo de experto estilo DeepSeek (tasa 0,001) mas una perdida auxiliar batch_wise (coeficiente 0,005).

El entrenamiento sigue el protocolo de jiapingW/Qwen3-8b-dspark-SpecForge: dataset PerfectBlend regenerado por Qwen3-8B a temperatura 0 en modo no-thinking (1.420.903 prompts por epoca), plantilla qwen3-instruct y contexto de 8.192 tokens, durante 6 epocas. Optimizador AdamW con lr 6e-4, decaimiento coseno, 4% de warm-up y grad clip 1.0; perdida DSpark con CE 0.1 / L1 0.9, 512 anclas y gamma de decaimiento 7. Los estados del objetivo en BF16 se capturaron en linea con SGLang 0.5.18. El entrenamiento se ejecuto en un nodo de 8x H200: 2 GPUs para captura y 6 rangos DDP, 132 muestras por paso de optimizador, 10.764,4 pasos por epoca y 64.586 pasos totales a 3,46 s por paso.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos para Qwen3-8B bajo el algoritmo DSpark, con tamano de bloque configurable (el checkpoint evaluado usa bloque 7).
- Generacion de borradores para tareas de razonamiento matematico, codigo y conversacion, segun el barrido de aceptacion publicado (gsm8k, math500, humaneval, mbpp, mt-bench).
- No es un modelo autonomo: no genera respuestas finales por si mismo, sino que alimenta el bucle verificado del modelo objetivo.
- No dispone de tool calling, capacidades de agente, vision ni audio por si mismo; hereda el comportamiento final de Qwen3-8B.
- Capacidades multilingues: no documentadas de forma especifica para el borrador.
- Modo thinking: el protocolo de entrenamiento se realizo con thinking desactivado en el modelo objetivo.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: desplegar el borrador junto al objetivo en SGLang con `--speculative-algorithm DSPARK` para reducir la latencia por token en cargas interactivas, aprovechando que el borrador cuesta menos FLOPs de FFN por token.
- Servicio de chat de baja latencia: usar el borrador en conversaciones multi-turno con contexto de hasta 8.192 tokens, donde la decodificacion especulativa amortiza el coste de verificacion del modelo grande.
- Generacion de codigo asistida: el barrido de aceptacion incluye humaneval y mbpp, por lo que el borrador esta calibrado para flujos de autocompletado y generacion de funciones donde priman respuestas cortas y predecibles.
- Razonamiento matematico por lotes: con aceptaciones medias de 6,3 en gsm8k y math500 en el checkpoint final, es adecuado para pipelines de resolucion de problemas donde el objetivo verifica y corrige las propuestas.
- Evaluacion e investigacion en decodificacion especulativa: sirve como punto de comparacion entre un borrador denso y uno MoE con el mismo recuento de parametros, util para estudiar el compromiso entre coste por token y longitud de aceptacion.
- Despliegue en nodos con GPUs de alta gama: al convivir con Qwen3-8B en BF16, encaja en servidores con H200 o A100 para experimentacion controlada con SGLang.

## Benchmarks y rendimiento

Los datos publicados son longitudes de aceptacion medias (no exactitud de la tarea) con bloque 7, cinco tareas, concurrencia 1, thinking desactivado, temperatura 0 y max_new_tokens 2048. "Pooled" es la media ponderada por peticiones sobre 2.400 peticiones; "equal-weight" es la media de las medias de las cinco tareas.

| Modelo / checkpoint | gsm8k | math500 | humaneval | mbpp | mt-bench | pooled | equal-weight |
|---|---:|---:|---:|---:|---:|---:|---:|
| Denso de referencia (jiapingW/Qwen3-8b-dspark-SpecForge) | 6,451 | 6,354 | 5,634 | 5,423 | 4,184 | 6,114 | 5,609 |
| `ep6/` (paso 64.586) | 6,359 | 6,300 | 5,551 | 5,350 | 4,227 | 6,041 | 5,557 |
| `ep5/` (paso 53.823) | 6,358 | 6,303 | 5,572 | 5,350 | 4,210 | 6,042 | 5,559 |
| `ep4/` (paso 43.058) | 6,350 | 6,276 | 5,505 | 5,296 | 4,201 | 6,021 | 5,525 |
| `ep3/` (paso 32.294) | 6,316 | 6,207 | 5,391 | 5,206 | 4,093 | 5,963 | 5,443 |

El borrador MoE queda por debajo del denso de referencia en pooled (6,041 frente a 6,114) y en equal-weight (5,557 frente a 5,609), con una mejora marginal en mt-bench (4,227 frente a 4,184). La perdida de aceptacion es de aproximadamente 1,2% en pooled.

## Requisitos de hardware

- El repositorio ocupa 81,1 GB e incluye multiples checkpoints (`step-N/`, `ep3/` a `ep6/`); para inferencia solo se necesita la carpeta del checkpoint elegido, no el repo completo.
- El borrador tiene 1,13B parametros; en BF16 ocupa aproximadamente 2,3 GB de pesos, aunque debe convivir en memoria con Qwen3-8B (unos 16 GB en BF16) y con la cache KV del contexto.
- GPU recomendadas: H200 o A100 de 80 GB para servir objetivo y borrador con contexto de 8.192 tokens; en GPUs consumer (RTX 4090 de 24 GB) el conjunto Qwen3-8B en BF16 mas borrador y cache KV es ajustado y requeriria cuantizacion del objetivo.
- Despliegue: SGLang con el PR sglang#47181 (clase `Qwen3MoeDSparkModel`), por ejemplo `--speculative-algorithm DSPARK --speculative-draft-model-path <folder> --speculative-dspark-block-size 7`.
- Latencia y throughput: no disponibles de forma directa; el autor reporta 3,46 s por paso de entrenamiento en 8x H200, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion (pooled) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-16E1A-v1 (`ep6/`) | 1,13B totales / 0,47B activos en FFN | 8.192 | 6,041 | no disponible | Hugging Face, 0 descargas |
| Borrador denso de referencia (jiapingW/Qwen3-8b-dspark-SpecForge) | 1,13B | 8.192 | 6,114 | no disponible | Hugging Face |
| Qwen3-8B (modelo objetivo) | 8B | no disponible en esta ficha | no aplica (es el verificador) | no disponible en esta ficha | Hugging Face |

La comparativa se limita al borrador denso del mismo autor y al objetivo; no se dispone de datos de otros borradores DSpark o EAGLE comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: no debe usarse para generar respuestas finales ni para evaluaciones de calidad sin el modelo objetivo.
- La longitud de aceptacion es inferior a la del borrador denso de referencia (6,041 frente a 6,114 pooled), por lo que la ganancia de velocidad depende de que la reduccion de FLOPs por token compense esa perdida.
- El modelo fue entrenado con thinking desactivado en el objetivo; su comportamiento con modo thinking no esta documentado.
- Contexto de entrenamiento limitado a 8.192 tokens; no hay datos sobre generalizacion a contextos mayores.
- Licencia no especificada: no se puede confirmar el uso comercial. El modelo base Qwen3-8B tiene sus propias condiciones, que deben verificarse por separado.
- Requiere una version de SGLang con el PR #47181; sin ella, la clase `Qwen3MoeDSparkModel` no esta disponible y el checkpoint no se puede servir.
- Riesgo de alucinacion y sesgos: no evaluados de forma independiente para este borrador; al ser un modelo de propuesta, los sesgos del objetivo dominan la salida final.
- El repositorio incluye muchos checkpoints intermedios (81,1 GB); conviene descargar solo la carpeta necesaria para evitar consumo innecesario de almacenamiento.
- Sin descargas ni likes en el momento de la consulta: no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-16E1A-v1
- Checkpoint final: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-16E1A-v1/tree/main/ep6
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Borrador denso de referencia: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- PR de SpecForge: https://github.com/sgl-project/SpecForge/pull/1031
- PR de SGLang: https://github.com/sgl-project/sglang/pull/47181
