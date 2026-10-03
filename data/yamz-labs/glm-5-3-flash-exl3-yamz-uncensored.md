# yamz-labs/GLM-5.3-Flash-EXL3-Yamz-Uncensored

## Resumen

GLM-5.3-Flash-EXL3-Yamz-Uncensored es una cuantizacion EXL3 del modelo base zai-org/GLM-5.3-Flash, publicada por yamz-labs. Se trata de una arquitectura transformer con mezcla de expertos (MoE) de aproximadamente 320.000 millones de parametros totales y 18.000 millones de parametros activos por token. El repositorio ocupa 99,7 GB y esta disenado para entrar en una sola maquina de 128 GB de memoria. Ademas de la cuantizacion estandar, incluye dos ficheros adicionales que aplican una edicion de direccion en tiempo de ejecucion para reducir la tasa de rechazos del modelo.

El modelo base, GLM-5.3-Flash, pertenece a la familia GLM del laboratorio zai-org. Esta variante concreta no modifica los pesos: los shards de safetensors son byte a byte identicos al repositorio base yamz-labs/GLM-5.3-Flash-EXL3-Yamz. Lo que anade son un especificacion JSON y un vector de direccion que el motor de inferencia (Yamz engine, sobre Kyojin) resta de la salida de una serie de bloques mientras el modelo se ejecuta.

Su relevancia actual es doble: por un lado ofrece una via para ejecutar un MoE de gran tamano en hardware de una sola maquina con memoria unificada (AMD Strix Halo), y por otro documenta de forma medible el efecto de una edicion de "desinhibicion" (de 81 rechazos sobre 100 a 0 sobre 100 en su conjunto de prueba). Esta pensado para investigacion, evaluacion y red-teaming, no como servicio publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 320.000 millones (320B) segun la model card del autor; el recuento de safetensors (49.776.363.614) cuenta las palabras empaquetadas de 16 bits del formato EXL3, no los parametros reales |
| Parametros activos | 18.000 millones (18B) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de despliegue con `-c 131072`; maximo no confirmado) |
| Tipos de cuantizacion | EXL3 (aprox. 2,05 bits por peso en la variante empleada para las mediciones); comparado contra FP8 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia GLM-5.3, con 320.000 millones de parametros totales y 18.000 millones activos por token. La variante publicada por yamz-labs no reentrena ni ajusta el modelo: aplica una cuantizacion EXL3 sobre el checkpoint base y anade un mecanismo de ablacion de direccion en tiempo de ejecucion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de RLHF o DPO del modelo original en la informacion proporcionada.

La innovacion tecnica destacable es el par de ficheros anadidos. El primero, `uncensor_spec.json` (3 KB), define por capa las intensidades de una edicion de una unica direccion: salida de atencion de las capas 24 a 44 con intensidad 2,14-2,21, y salida del MLP de las capas 11 a 38 con intensidad 0,90-1,49. El segundo, `uncensor_direction.st` (16 KB), contiene el vector de direccion en si: un vector unitario de 4096 valores float32. Esta direccion es la diferencia entre las medias de residuales sobre 400 prompts nocivos y 400 prompts inofensivos, con el componente de media inofensiva eliminado. El motor, al cargar, detecta el fichero JSON y resta la direccion de la salida de cada bloque afectado (34 bloques segun la model card). Los pesos no se tocan. La edicion se puede desactivar con `EXL3_ABLIT_RUNTIME=off` o `--no-uncensor`, y sustituir la especificacion con `EXL3_ABLIT_RUNTIME=/ruta/a/otro_spec.json`.

## Capacidades

- Generacion de texto y conversacion en ingles y chino.
- Razonamiento multi-paso, con soporte de "medium reasoning effort" en la plantilla de chat del motor.
- Modo agente, con plantilla de chat y control de historial (`--max-history 2`) en el setup del motor.
- Decodificacion especulativa multi-token (MTP) con `--num-draft 2`.
- Razonamiento en codigo (se reportan velocidades de decodificacion para prosa, chat y codigo).
- Edicion de rechazos conmutable en tiempo de ejecucion (activada o desactivada mediante variable de entorno o flag).
- Muestreo recomendado: temperatura 1,0, top-p 0,95, sin penalizacion por repeticion; no se recomienda decodificacion greedy.

## Casos de uso

- Investigacion sobre alineacion y rechazos: el modelo permite comparar el comportamiento con la edicion activada y desactivada sobre el mismo conjunto de pesos, ya que los shards son identicos al repositorio base. Es util para estudiar como una unica direccion de activacion modula la tasa de negativas.
- Red-teaming y evaluacion de seguridad: con el modelo base (edicion desactivada) y con la edicion activada se pueden generar respuestas que el modelo sin editar rechazaria, para analizar filtros y moderadores posteriores.
- Inferencia local en una sola maquina: gracias a los 99,73 GB de pesos y al diseno para 128 GB de memoria unificada, es adecuado para desplegar un MoE de 320B en una estacion de trabajo con AMD Strix Halo sin necesidad de un cluster.
- Atencion al cliente en ingles o chino: con una ventana de contexto de 131.072 tokens (segun el ejemplo de despliegue), puede gestionar conversaciones multi-turno largas con historial extenso.
- Generacion y asistencia de codigo: el motor reporta velocidades especificas para decodificacion de codigo y soporta plantillas de chat de agente, lo que permite integrarlo en flujos de asistencia tecnica.
- Despliegue privado con control de contenido propio: la model card indica explicitamente el despliegue privado como uso previsto, siempre que se anada filtrado y moderacion propios.
- Experimentacion con cuantizacion EXL3: sirve como referencia para comparar la calidad de la cuantizacion (KLD 0,15081 frente a FP8) y su coste en velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo aporta metricas de calidad de cuantizacion y velocidad, recogidas aqui:

| Metrica | Resultado |
|---|---|
| KLD frente a FP8 (30 filas reservadas) | 0,15081 |
| Rechazos en 100 prompts nocivos, con edicion | 0/100 |
| Rechazos en 100 prompts nocivos, sin edicion (`EXL3_ABLIT_RUNTIME=off`) | 81/100 |
| Tamano del repositorio | 99,73 GB (99,7 GB) |
| Prefill (Ryzen AI Max+ 395) | ~580 tok/s |
| Decodificacion (Ryzen AI Max+ 395) | 26 a 30 tok/s |

Tabla de velocidad de decodificacion y prefill del autor (una Ryzen AI Max+ 395, `-c 131072`, MTP 2 borradores, 3 repeticiones):

| Edicion | Flags de agente | Decodificacion (prosa / chat / codigo) | Prefill (3,5K / 14K) |
|---|---|---|---|
| off | off | 28,7 / 30,2 / 31,9 | 562 / 578 |
| on | off | 31,4 / 32,3 / 32,7 | 553 / 592 |
| off | on | 27,7 / 31,4 / 29,6 | 591 / 593 |
| on | on | 27,1 / 29,2 / 27,4 | 579 / 592 |

Segun el autor, la edicion cuesta menos del 1 % de decodificacion (microbenchmark de -0,1 a -0,3 %) y no se aprecia en prefill; las diferencias entre repeticiones de un mismo brazo llegan al 20 %.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 99,7 GB, por lo que necesita una maquina con al menos 128 GB de memoria.
- GPU probada: AMD Strix Halo (Ryzen AI Max+ 395) con ROCm, arquitectura gfx1151. Es el unico hardware que el autor indica como probado.
- Otro hardware: no probado por el autor. El formato EXL3 es estandar, asi que no esta atado a una GPU concreta, pero no hay validacion fuera de Strix Halo.
- Consumer GPU: no cabe en GPUs de consumo tipicas por el tamano (99,7 GB); encaja en plataformas con memoria unificada grande como Strix Halo.
- Opciones de despliegue: el autor proporciona el motor Kyojin (repositorio Yamz-Labs/kyojin). Otros cargadores no leen el fichero de edicion y ejecutarian el modelo sin la modificacion.
- Comando de referencia:
  `git clone https://github.com/Yamz-Labs/kyojin && cd kyojin`
  `./build.sh && source tools/strix_halo/env.sh`
  `python tools/glm/serve.py --model /ruta/a/esta/carpeta --port 8000 -c 131072 --num-draft 2`
- Latencia y throughput medidos: prefill ~580 tok/s y decodificacion 26-30 tok/s en una Ryzen AI Max+ 395 (tabla completa en la seccion anterior).

## Comparativa con modelos similares

No se dispone de datos de benchmarks externos de modelos comparables en la informacion proporcionada. La comparacion factible es con las variantes del propio modelo:

| Modelo | Parametros | Contexto | Edicion de rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-EXL3-Yamz-Uncensored (este) | 320B totales / 18B activos | 131.072 tokens (ejemplo) | Si, conmutable en tiempo de ejecucion | MIT | HuggingFace, 0 descargas |
| yamz-labs/GLM-5.3-Flash-EXL3-Yamz (base) | 320B totales / 18B activos | 131.072 tokens (ejemplo) | No | MIT | HuggingFace |
| zai-org/GLM-5.3-Flash (FP8, original) | 320B totales / 18B activos | No disponible | No | No disponible en esta informacion | HuggingFace |

## Limitaciones y advertencias

- La edicion de rechazos no es una evaluacion de seguridad: la propia model card advierte que reducir la tasa de negativas no dice nada sobre lo que el modelo producira, y que el usuario decide y responde por su uso.
- La medicion de 0/100 frente a 81/100 rechazos proviene de una muestra pequena de 100 prompts, con un detector basado en regex de 64 tokens greedy, solo en ingles. Los intervalos son amplios y las negativas suaves o respuestas parciales pueden pasar en cualquier direccion.
- El hash solo demuestra que el fichero es el medido, no que el comportamiento sea reproducible en otro entorno.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- Hardware: solo se ha probado gfx1151 con ROCm; el resto de hardware esta sin validar.
- La edicion solo funciona con la rama del motor que incluye la caracteristica; compilaciones antiguas la ignoran y ejecutan el modelo sin modificar.
- Uso comercial: la licencia es MIT, pero la model card restringe el uso previsto a investigacion, evaluacion, red-teaming y despliegue privado, y prohibe generar contenido ilegal, atacar a personas o usarlo en un servicio publico sin filtrado y moderacion propios.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero aplicable a cualquier modelo de este tipo; conviene validar en produccion.
- Se recomienda no usar decodificacion greedy y emplear temperatura 1,0 y top-p 0,95.
- El recuento de parametros del panel de HuggingFace (49,78B en safetensors) no es el numero real de parametros, sino las palabras empaquetadas de 16 bits del formato EXL3; conviene no confundirlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yamz-labs/GLM-5.3-Flash-EXL3-Yamz-Uncensored
- Modelo base (original): https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio EXL3 base (mismos shards): https://huggingface.co/yamz-labs/GLM-5.3-Flash-EXL3-Yamz
- Motor Kyojin: https://github.com/Yamz-Labs/kyojin
- Organizacion Yamz Labs en GitHub: https://github.com/Yamz-Labs/
- Banner de Yamz Labs: https://raw.githubusercontent.com/Yamz-Labs/.github/main/profile/yamz-banner.png
