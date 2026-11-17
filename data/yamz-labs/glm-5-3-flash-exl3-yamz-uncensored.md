# yamz-labs/GLM-5.3-Flash-EXL3-Yamz-Uncensored

## Resumen

GLM-5.3-Flash-EXL3-Yamz-Uncensored es una cuantizacion en formato EXL3 del modelo GLM-5.3-Flash de Z.ai (zai-org), publicada por yamz-labs. Se trata de un modelo de arquitectura MoE (mixture of experts) con 320.000 millones de parametros totales y 18.000 millones activos, disenado para ejecutarse en una sola maquina de 128 GB de memoria unificada. El pack esta empaquetado en el formato estandar EXL3, por lo que no esta atado a un hardware concreto, aunque solo se ha validado en AMD Strix Halo (Ryzen AI Max+ 395) con el motor Kyojin.

La particularidad de esta variante es la incorporacion de dos ficheros que aplican una edicion de direccion en tiempo de ejecucion para reducir drasticamente las negativas del modelo. Segun el autor, sobre 100 prompts daninos el modelo base rechaza 81, mientras que con la edicion activa rechaza 0. Los pesos son identicos byte a byte a los del repositorio base yamz-labs/GLM-5.3-Flash-EXL3-Yamz, de modo que la calidad, el tamano y la velocidad se mantienen.

El modelo es relevante porque demuestra una tecnica de ablacion de direccion (direction ablation) aplicada en inferencia sobre un MoE de gran tamano cuantizado a EXL3, con un coste de decodificacion estimado por debajo del 1 % y un mecanismo de desactivacion mediante variable de entorno. Esta pensado para entornos de investigacion que necesitan reducir el sesgo de rechazo sin reentrenar ni modificar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), modelo base GLM-5.3-Flash |
| Parametros totales | 320.000 millones (320B) |
| Parametros activos | 18.000 millones (18B) |
| Longitud de contexto | Hasta 131.072 tokens configurados en el ejemplo de despliegue; prefill medido a 500K en la model card del repositorio base |
| Tipos de cuantizacion | EXL3 (pack de 16 bits empaquetados, 99,73 GB); el autor menciona una cuantizacion alternativa de 2,05 bpw usada para ajustar la direccion |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (shards EXL3) + `uncensor_spec.json` (3 KB) + `uncensor_direction.st` (16 KB) + `mtp_eh_proj.st` (64 MB) + `draft2s.st` |
| Tamano del repositorio | 100,1 GB |
| Libreria de inferencia | exllamav3 (motor Kyojin para aplicar la edicion) |
| Hardware validado | AMD Strix Halo (Ryzen AI Max+ 395, gfx1151, ROCm) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer con mezcla de expertos (MoE) de 320B parametros totales y 18B activos. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la documentacion de zai-org/GLM-5.3-Flash y no se reproducen en la informacion disponible.

La innovacion tecnica de esta variante no esta en los pesos, sino en el mecanismo de ablacion en tiempo de ejecucion. Se calcula una direccion unica (un vector unitario de 4096 valores float32) como la diferencia entre las medias de los residuales sobre 400 prompts daninos y 400 inofensivos, eliminando la componente de la media de los inofensivos. En carga, el motor Kyojin localiza `uncensor_spec.json` y resta esa direccion a la salida de cada bloque afectado: salida de atencion de las capas 24 a 44 con fuerza entre 2,14 y 2,21, y salida de MLP de las capas 11 a 38 con fuerza entre 0,90 y 1,49, sumando 34 bloques enganchados. Los pesos no se modifican.

El pack incluye ademas componentes de decodificacion especulativa: `mtp_eh_proj.st` (copia sin cuantizar de la proyeccion MTP, 64 MB) y `draft2s.st` (cabeza de borrador en dos etapas). Ambos afectan solo al borrador y no a las respuestas. Con MTP se midieron 31,6 tok/s en modo greedy frente a 26,7 tok/s sin el, sobre tres prompts de 400 tokens.

## Capacidades

- Generacion de texto conversacional y de proposito general en ingles y chino.
- Razonamiento multi-paso, con plantilla de chat que admite niveles de esfuerzo de razonamiento (la model card menciona una plantilla de razonamiento medio).
- Generacion de codigo, con velocidades de decodificacion medidas por separado para prosa, chat y codigo.
- Decodificacion especulativa integrada mediante MTP y cabeza de borrador en dos etapas (`draft2s.st`), que acelera la generacion sin alterar las respuestas.
- Reduccion configurable del sesgo de rechazo mediante la edicion de direccion, desactivable con `EXL3_ABLIT_RUNTIME=off` o `--no-uncensor`.
- Sobrescritura de la especificacion de ablacion con `EXL3_ABLIT_RUNTIME=/path/to/other_spec.json`.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni function calling para esta variante.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el par de ficheros permite comparar el comportamiento del mismo modelo con y sin edicion de direccion sobre el mismo conjunto de pesos, aislando el efecto de la ablacion sin reentrenar.
- Evaluacion de tecnicas de edicion en inferencia sobre MoE: util para medir el coste real de una resta de direccion por capa en un modelo de 320B con 18B activos, con el desglose de capas y fuerzas documentado.
- Despliegue en una unica maquina de 128 GB: el pack de 99,73 GB encaja en un Ryzen AI Max+ 395 con memoria unificada, lo que permite servir un MoE de gran tamano sin cluster de GPUs.
- Generacion de codigo en local: la model card reporta velocidades de decodificacion especificas para codigo (31,9 tok/s con la edicion desactivada y 32,7 tok/s con la edicion activa en la plantilla sin razonamiento medio), adecuadas para asistentes de programacion en estacion de trabajo.
- Procesamiento de contexto largo: con `-c 131072` configurado y prefill medido de 652 tok/s a 8K y 567 tok/s a 500K, sirve para analisis de documentos extensos o conversaciones multi-turno largas.
- Estudio de decodificacion especulativa: los ficheros `mtp_eh_proj.st` y `draft2s.st` permiten comparar el rendimiento del borrador con y sin MTP (31,6 frente a 26,7 tok/s en greedy) en un entorno controlado.
- Experimentacion con contenido sin filtros en entornos de investigacion controlados, asumiendo los riesgos descritos en la seccion de limitaciones.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros). Los datos disponibles son metricas de calidad frente a FP8 y de velocidad medidas por el autor.

| Metrica | Valor |
|---|---|
| KLD frente a FP8 (30 filas reservadas) | 0,15081 |
| Prefill a 8K | 652 tok/s |
| Prefill a 500K | 567 tok/s |
| Decode (rango declarado) | 27,4 a 36,8 tok/s con Kyojin 1.5.10 en un Ryzen AI Max+ 395 |
| Tasa de rechazo, 100 prompts daninos, sin edicion | 81/100 |
| Tasa de rechazo, 100 prompts daninos, con edicion | 0/100 |
| Decode con MTP greedy (3 prompts de 400 tokens) | 31,6 tok/s frente a 26,7 tok/s sin MTP |

Coste de la edicion, medido en un pack del mismo tamano y con tensores cuantizados, `-c 131072`, MTP con 2 borradores y 3 repeticiones:

| Edicion | Plantilla de razonamiento medio | Decode (prosa / chat / codigo, tok/s) | Prefill (3,5K / 14K, tok/s) |
|---|---|---|---|
| off | no | 28,7 / 30,2 / 31,9 | 562 / 578 |
| on | no | 31,4 / 32,3 / 32,7 | 553 / 592 |
| off | si | 27,7 / 31,4 / 29,6 | 591 / 593 |
| on | si | 27,1 / 29,2 / 27,4 | 579 / 592 |

El autor estima que la edicion cuesta menos del 1 % de la decodificacion (un microbenchmark midio entre -0,1 y -0,3 %), dentro del ruido entre repeticiones, que llega al 20 % en un mismo brazo.

## Requisitos de hardware

- VRAM o memoria unificada: el pack ocupa 99,73 GB, dimensionado para una maquina de 128 GB.
- GPU validada: AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con ROCm. Otras GPU no estan probadas segun el autor.
- No se documenta compatibilidad con A100, H100 ni RTX 4090; por tamano, no cabe en una GPU de consumo de 24 GB.
- Despliegue: motor Kyojin (https://github.com/Yamz-Labs/kyojin), con `tools/glm/serve.py` y flags `-c 131072 --num-draft 2`. ExLlamaV3 estandar y TabbyAPI cargan los pesos pero ignoran la edicion de ablacion, por lo que devuelven el modelo base con sus rechazos.
- Muestreo recomendado: temperatura 1,0, top-p 0,95, sin penalizacion de repeticion; el autor desaconseja la decodificacion greedy.
- Latencia y throughput: prefill de 652 tok/s a 8K y 567 tok/s a 500K; decode entre 27,4 y 36,8 tok/s segun la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| yamz-labs/GLM-5.3-Flash-EXL3-Yamz-Uncensored | 320B totales, 18B activos | Hasta 131.072 configurado; prefill medido a 500K | MIT | EXL3 + ficheros de ablacion | Incluye edicion de rechazo y MTP; mismo KLD y velocidad que el base |
| yamz-labs/GLM-5.3-Flash-EXL3-Yamz | 320B totales, 18B activos | Igual | MIT | EXL3 | Repositorio base; shards identicos byte a byte; rechaza 81/100 en el conjunto medido |
| zai-org/GLM-5.3-Flash | 320B totales, 18B activos | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo original sin cuantizar; referencia de calidad frente a FP8 |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion de ablacion elimina practicamente las negativas (0/100 frente a 81/100) y puede producir contenido que el modelo base rechazaria; el autor lo advierte explicitamente.
- La medicion de rechazos usa un detector por regex sobre 64 tokens greedy, solo con prompts en ingles; las negativas suaves y las respuestas parciales pueden pasar en ambos sentidos. Con 100 prompts, el intervalo de confianza es amplio.
- La direccion se ajusto sobre una cuantizacion distinta (2,05 bpw) del mismo modelo; el hash de los ficheros prueba que son los medidos, no que el comportamiento se reproduzca en cualquier configuracion.
- Solo se ha probado en AMD Strix Halo con el motor Kyojin; ExLlamaV3 estandar y TabbyAPI ignoran la edicion y devuelven el modelo base.
- Idiomas limitados a ingles y chino; no se documenta soporte de castellano.
- No se documentan datos de sesgos, riesgo de alucinacion ni evaluaciones de seguridad mas alla del conteo de rechazos.
- La licencia MIT se aplica al pack publicado; conviene verificar las condiciones del modelo base zai-org/GLM-5.3-Flash antes de un uso comercial.
- El autor desaconseja la decodificacion greedy; usar temperatura 1,0 y top-p 0,95.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yamz-labs/GLM-5.3-Flash-EXL3-Yamz-Uncensored
- Repositorio base: https://huggingface.co/yamz-labs/GLM-5.3-Flash-EXL3-Yamz
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Motor Kyojin: https://github.com/Yamz-Labs/kyojin
