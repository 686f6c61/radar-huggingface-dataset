# ziansu/r2egym-rlad

## Resumen

`ziansu/r2egym-rlad` es un repositorio de dos checkpoints de un mismo entrenamiento de aprendizaje por refuerzo (RLAD, destilación on-policy contra un profesor congelado) sobre el subconjunto R2E-Gym, partiendo de `Qwen/Qwen3.5-4B`. El objetivo declarado es producir un agente de ingenieria de software capaz de resolver tareas reales de repositorio, evaluado con SWE-bench Verified. Lo publica el usuario `ziansu` bajo licencia Apache 2.0, y ambos checkpoints viven como subcarpetas del repositorio, no en la raiz.

El modelo de lenguaje tiene 4,21 B de parametros y, al cargar el checkpoint completo con `AutoModelForImageTextToText`, 4,54 B incluyendo la torre de vision heredada del modelo base (byte a byte identica, porque el entrenamiento solo actualizo el modelo de lenguaje). La innovacion tecnica relevante no esta en la arquitectura, sino en el metodo de entrenamiento: RLAD combina RL con destilacion on-policy desde un profesor Qwen3.6-27B compartido y congelado, con rollouts de 65.536 tokens de contexto.

Su relevancia practica es doble. Por un lado, es un ejemplo reproducible de como un modelo denso de ~4 B puede alcanzar un 51,80 % de pass@1 en SWE-bench Verified (protocolo de 98.304 tokens de contexto y 100 turnos) mediante RL, compitiendo con metodos como TIP (52,20 %), OPD (51,67 %) y superando claramente a GRPO (46,00 %). Por otro, ofrece dos checkpoints (40 y 79 actualizaciones) para comparar metodos a igual numero de actualizaciones, algo poco habitual en publicaciones de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B; 24 capas con parametros `linear_attn` (atencion lineal/hibrida) y torre de vision. Vocabulario de 248.320 tokens |
| Parametros totales | 4,21 B (modelo de lenguaje, `Qwen3_5ForCausalLM`) / 4,54 B (checkpoint completo con torre de vision, `Qwen3_5ForConditionalGeneration`) |
| Longitud de contexto | 65.536 tokens durante el rollout de entrenamiento; evaluado hasta 98.304 tokens en inferencia. Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en bfloat16, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), exportados desde un checkpoint Megatron `torch_dist` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B, un transformer denso de 24 capas. Los detalles de conversion revelan que cada una de esas 24 capas contiene parametros `linear_attn.A_log` y `linear_attn.norm.weight`, lo que apunta a un diseno de atencion hibrida con capas de atencion lineal. El checkpoint incluye ademas la torre de vision del modelo base, que quedo intacta: el entrenamiento de RL solo actualizo los pesos del modelo de lenguaje. La exportacion conserva los 738 tensores del conjunto de claves del modelo base con formas coincidentes, con un vocabulario de 248.320 entradas.

El entrenamiento usa RLAD, descrito como destilacion on-policy contra un profesor Qwen3.6-27B compartido y congelado, sobre un subconjunto de R2E-Gym. La configuracion: contexto de rollout de 65.536 tokens, learning rate de 1e-6, batch global de 256 y batch de rollout de 32 grupos de tareas por 8 muestras por actualizacion. Todos los parametros se mantuvieron en bfloat16 durante el entrenamiento, que es la precision que sirvio el servidor de inferencia en evaluacion. Se publican dos checkpoints: `step40` (40 actualizaciones, pensado para comparar metodos a igual numero de actualizaciones) y `step79` (79 actualizaciones, el unico evaluado). La conversion desde Megatron `torch_dist` se hizo con `tools/convert_torch_dist_to_hf.py` de slime.

## Capacidades

- Resolucion de tareas de ingenieria de software en repositorios reales: es la capacidad objetivo del entrenamiento, medida con SWE-bench Verified sobre las 500 tareas del benchmark.
- Razonamiento agente multi-turno: la evaluacion se realiza con protocolos de 75 y 100 turnos, lo que implica planificacion, edicion de ficheros y comprobacion iterativa dentro de un bucle de agente.
- Operacion con contexto largo: rollouts de hasta 65.536 tokens y evaluacion con hasta 98.304 tokens de contexto.
- Generacion de texto: el pipeline declarado es `text-generation` y la libreria `transformers`.
- Capacidades multimodales: el checkpoint conserva la torre de vision del modelo base y puede cargarse con `AutoModelForImageTextToText` (`Qwen3_5ForConditionalGeneration`). No se ha evaluado ni entrenado esa parte, y la evaluacion de agente del proyecto uso unicamente el modelo de lenguaje.
- Tool calling / function calling: no documentado explicitamente, aunque el uso como agente de software implica invocacion de herramientas.
- Modo thinking o razonamiento explicito: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir un problema descrito en lenguaje natural y un arbol de codigo, localizar los ficheros relevantes y emitir un parche. Es exactamente el escenario de SWE-bench Verified, donde obtiene un 51,80 % de pass@1.
- Agente integrado en CI/CD: ante un fallo de build o de test, el agente puede inspeccionar la traza, proponer y aplicar un parche, y volver a ejecutar la suite, aprovechando los 100 turnos del protocolo de evaluacion.
- Revision de codigo asistida: con ventanas de hasta 98.304 tokens puede analizar un pull request completo junto con su contexto de repositorio y señalar regresiones o cambios incompletos.
- Generacion de tests de regresion: dado un parche o un cambio de comportamiento, el modelo puede producir tests que reproduzcan el fallo original y verifiquen la correccion.
- Migraciones y refactors de dependencias: actualizar APIs obsoletas o cambiar firmas a lo largo de multiples ficheros, tarea que se beneficia del contexto largo y del bucle agente.
- Depuracion de fallos multi-fichero: a partir de un stack trace, recorrer la cadena de llamadas y localizar la causa raiz combinando lectura de codigo y ejecucion de comandos.
- Base para investigacion en RL y destilacion on-policy: los dos checkpoints (40 y 79 actualizaciones) permiten reproducir comparaciones a igual numero de actualizaciones frente a metodos como TIP, OPD o GRPO.
- Punto de partida para fine-tuning especifico de dominio: al ser un modelo denso de 4,21 B con licencia Apache 2.0, es viable reentrenarlo en un dominio concreto con recursos moderados.

## Benchmarks y rendimiento

SWE-bench Verified, 500 tareas, semilla 42, 3 muestras por tarea (1.500 intentos). Solo se ha evaluado `step79`.

| Protocolo | pass@1 | pass@3 |
|---|---|---|
| 98.304 contexto / 100 turnos | 51,80 % ± 1,97 | 63,20 % |
| 65.536 contexto / 75 turnos | 46,87 % ± 1,22 | 59,00 % |

Comparativa con los cuatro metodos del mismo proyecto en su actualizacion final, bajo el protocolo de 98.304 tokens y 100 turnos:

| Metodo | Actualizaciones | pass@1 | pass@3 |
|---|---|---|---|
| TIP | 80 | 52,20 | 64,40 |
| RLAD (este modelo) | 79 | 51,80 | 63,20 |
| OPD | 79 | 51,67 | 63,80 |
| GRPO | 80 | 46,00 | 61,60 |

El error estandar binomial con 500 tareas es de aproximadamente 1,3 puntos antes de contar la varianza entre rollouts, por lo que el propio autor advierte que las diferencias de alrededor de un punto entre los mejores metodos no son separables. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 8,4 GB solo de pesos para el modelo de lenguaje (4,21 B x 2 bytes); el checkpoint completo con torre de vision ronda los 9 GB. Con 98.304 tokens de contexto hay que sumar una cache KV considerable en las capas de atencion completa, por lo que conviene prever 16-24 GB para ese regimen. Cifras estimadas, no publicadas por el autor.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para el protocolo de contexto largo con batch alto; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para inferencia en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas con bfloat16 y contexto reducido; en tarjetas de 16 GB seria necesario convertir a 8 bits o 4 bits, conversion que no esta publicada.
- Opciones de despliegue: vLLM o SGLang para servicio con contexto largo y lotes grandes; TGI como alternativa; llama.cpp u Ollama requeririan una conversion a GGUF que no se proporciona. El modelo se carga con `transformers` indicando el subfolder (`step79` o `step40`), ya que la raiz del repositorio no contiene pesos.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de terceros para modelos de la misma categoria y tamano en la informacion proporcionada. La unica comparacion con cifras verificables es contra los metodos del mismo proyecto, sobre el mismo modelo base y el mismo corpus:

| Modelo / metodo | Parametros | Contexto de evaluacion | SWE-bench Verified pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLAD (este modelo, `step79`) | 4,21 B (LM) | 98.304 / 100 turnos | 51,80 | Apache 2.0 | HuggingFace, safetensors |
| TIP | no disponible | 98.304 / 100 turnos | 52,20 | no disponible | no disponible |
| OPD | no disponible | 98.304 / 100 turnos | 51,67 | no disponible | no disponible |
| GRPO | no disponible | 98.304 / 100 turnos | 46,00 | no disponible | no disponible |
| Qwen3.5-4B (modelo base) | 4,21 B (LM) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

Las diferencias entre TIP, RLAD y OPD estan dentro del margen de error indicado por el autor (error estandar binomial de ~1,3 puntos con 500 tareas), por lo que no deben interpretarse como una jerarquia fiable.

## Limitaciones y advertencias

- El checkpoint `step40` no ha sido evaluado en SWE-bench Verified. Los numeros de la tabla de benchmarks corresponden exclusivamente a `step79` y no deben extrapolarse al otro checkpoint.
- La comparacion entre metodos tiene poca potencia estadistica: con 500 tareas el error estandar binomial ronda 1,3 puntos, y el autor advierte que diferencias de un punto entre TIP, RLAD y OPD no son separables.
- La raiz del repositorio no contiene pesos. Cualquier carga debe indicar explicitamente el subfolder; omitirlo provocara un fallo.
- Hay 48 tensores almacenados en bfloat16 donde el modelo base usa float32: `linear_attn.A_log` y `linear_attn.norm.weight` en cada una de las 24 capas. Esto replica fielmente la precision servida en entrenamiento y evaluacion, pero puede introducir discrepancias numericas si se compara con una ejecucion en float32 del modelo base.
- La torre de vision se conserva pero no se entreno ni se evaluo. Cargar el modelo como `Qwen3_5ForConditionalGeneration` funciona, pero no hay garantias de rendimiento multimodal.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, especialmente en tareas de edicion de codigo donde puede inventar APIs, ficheros o funciones inexistentes sin verificacion externa.
- Idiomas soportados: no documentados en la tarjeta del modelo. No hay garantia de calidad fuera del ingles, idioma en el que estan formuladas las tareas de SWE-bench.
- Restricciones de licencia: el repositorio se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar los terminos del modelo base `Qwen/Qwen3.5-4B`, que no se detallan en la informacion disponible.
- Dependencia de la libreria `transformers` reciente: la clase `Qwen3_5ForCausalLM` requiere una version que la soporte.
- No hay versiones cuantizadas publicadas ni plantilla de chat documentada, lo que añade trabajo de integracion en produccion.
- Para uso en produccion como agente de codigo, se recomienda ejecucion en sandbox y validacion con tests, dado que los porcentajes de exito en SWE-bench Verified implican que aproximadamente la mitad de las tareas no se resuelven correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziansu/r2egym-rlad
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- R2E-Gym: no disponible (no se proporciona URL del corpus en la informacion recibida)
- Paper o blog del metodo RLAD: no disponible
- Repositorio del codigo de entrenamiento o conversion: no disponible
- Demos: no disponible

La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados corresponden a sitios de descarga de tipografias, a la plataforma Zhihu y a hilos de foros sobre TikTok y analisis de trafico de red, sin ninguna relacion con `r2egym-rlad`, R2E-Gym o tecnicas de RL para agentes de software.
