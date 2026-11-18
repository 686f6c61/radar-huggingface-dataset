# sync-strata/Sync-M

## Resumen

Sync-M es un pack de expertos re-cuantizados del modelo Qwen3.8-Flash-Next (arquitectura MoE, segun los tags del repositorio), publicado por el usuario sync-strata como artefacto experimental. No es un modelo entrenado desde cero ni un ajuste fino: es una re-cuantizacion de los expertos enrutados del modelo base a un formato trellis de la familia Gyro/QTIP, con anchura de bits elegida por experto, pensada para ejecutarse en una unica GPU de consumo NVIDIA. El repositorio ocupa 34,6 GB y contiene unicamente los pesos densos y los expertos re-cuantizados; las partes compartidas (embeddings, tabla n-gram/PLE, tokenizer, etc.) viven en un repositorio aparte.

Su relevancia es acotada y muy especifica: no es un GGUF y no carga en llama.cpp ni en Strata upstream. Solo funciona con Sync-Strata, un fork de Strata, lo que lo convierte en un artefacto de nicho para usuarios de ese motor concreto. El autor lo recomienda para equipos con 48 GB de RAM o mas y declara un KL de 0,1642 respecto al modelo original (medido con su propio eval_v4 de 8 dominios y 1.400 ventanas), ademas de velocidades de decodificacion de 124,6 tok/s (tail skip R4) y 92,2 tok/s en chat sobre una RTX 3080 de 12 GB.

La licencia es la Qwen Community License 1.0, heredada del modelo base, con las restricciones que ello implica. El modelo no tiene descargas ni likes en el momento de redactar esta ficha y no se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun tags; detalles de capas y configuracion no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis de la familia Gyro/QTIP, anchura de bits por experto (no es GGUF; no compatible con llama.cpp) |
| Idiomas soportados | no disponible (la calibracion uso texto en varios idiomas, sin lista publicada) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | `.bin` propietario (dense.bin, dense_nq.bin, experts.v2.bin) + tablas de conversion en texto; requiere motor Sync-Strata |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un MoE de la familia Qwen. Sync-M no reentrena ni aplica RLHF/DPO: es una re-cuantizacion post-entrenamiento de los expertos enrutados a un formato trellis de la familia Gyro/QTIP (referencia: Tseng et al., 2024), con la anchura de bits seleccionada por experto. El pack incluye tambien los pesos densos que el motor lee directamente del mismo, mientras que embeddings, tabla n-gram/PLE y demas componentes compartidos se distribuyen aparte en `hiru2005/Sync-shared`.

La calibracion se realizo sobre texto publico (codigo, documentacion, articulos enciclopedicos, varios idiomas, trazas de agentes) y sobre algunos registros de chat del propio autor; el texto de calibracion no se distribuye. El motor Sync-Strata, fork de Strata (MIT), incorpora kernels propios para el formato trellis y una funcion de "tail skip" (R4/R7/R10) que intercambia velocidad por fidelidad. No hay informacion sobre el numero de tokens de entrenamiento del modelo base ni sobre innovaciones adicionales (decodificacion especulativa, atencion lineal, etc.) en la documentacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no se detallan capacidades concretas en la model card.
- Codigo y matematicas: el modelo base es de proposito general; la calibracion incluyo codigo y documentacion, pero no se publican evaluaciones especificas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la calibracion incluyo trazas de agentes y el eval_v4 tiene un dominio especifico de agente, lo que sugiere uso previsto en ese escenario, sin garantias documentadas.
- Capacidades multilingues: la calibracion uso texto en varios idiomas, pero no se publica lista de idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Ejecucion en GPU de consumo: capacidad operativa destacada del pack, limitada al motor Sync-Strata.

## Casos de uso

- Inferencia local en una unica GPU de consumo: el pack esta disenado para PCs con 48 GB de RAM o mas y GPU NVIDIA RTX 30/40 (RTX 20, GTX 16 y RTX 50 esperadas como compatibles), lo que permite ejecutar un MoE de gran tamano en hardware de escritorio sin servidores multi-GPU.
- Despliegue de agentes conversacionales en local: el dominio de agente del eval_v4 y las velocidades de chat reportadas (92,2 tok/s con tail skip R4 en RTX 3080 12 GB) lo hacen adecuado para prototipos de asistentes multi-turno en estacion de trabajo.
- Evaluacion y experimentacion con tecnicas de cuantizacion trellis: util para investigadores que quieran medir el impacto de la cuantizacion por experto (KL 0,1642 frente al original) en tareas de 8 dominios.
- Sustitucion de modelos GGUF en pipelines existentes de Sync-Strata: usuarios del motor pueden cambiar de Sync-XS o Gyro a Sync-M ajustando el parametro `model` en la configuracion (`sync settings set model sync-m`).
- Generacion de codigo y documentacion en local: la calibracion incluyo codigo y documentacion, y el modelo base es de proposito general; adecuado para autocompletado y generacion en entornos sin conexion.
- Procesamiento por lotes en estacion de trabajo: con 124,6 tok/s en decodificacion (tail skip R4) se pueden ejecutar tareas de generacion de texto a granel en una sola maquina, siempre que el motor y el hardware cumplan los requisitos.
- Educacion y divulgacion: ejemplo practico de cuantizacion MoE por experto y de ecosistema de motores alternativos a llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta una metrica de fidelidad propia:

| Metrica | Sync-M |
|---|---|
| KL respecto al modelo original (todas las posiciones, menor es mejor) | 0,1642 |
| Diferencia frente a la forma anterior (table-lookup) en "scale B" | +0,46 % (rango 95 %: -0,53 a +1,48 %) |

Rendimiento medido por el autor (Sync-Strata 0.1.0, Ryzen 7 7800X3D, 32 GB DDR5, RTX 3080 12 GB, NVMe, Windows 11):

| Tail skip | jbench decode (tok/s) | dsh chat (tok/s) |
|---|---:|---:|
| R4 | 124,6 | 92,2 |
| R7 | 93,6 | 75,7 |
| R10 | 69,1 | 59,1 |

No hay mediciones en Linux, GTX 10 ni Radeon publicadas.

## Requisitos de hardware

- RAM: recomendado 48 GB o mas; el autor indica que los minimos de RAM y VRAM estan por medir.
- VRAM: no se publica cifra exacta; el ejemplo de referencia usa una RTX 3080 de 12 GB, lo que sugiere que el motor descarga parte de los expertos a RAM del sistema.
- GPU compatibles: NVIDIA RTX 30/40 con driver R580 o superior (oficial); RTX 20, GTX 16 y RTX 50 esperadas como compatibles sin verificar; GTX 10, Radeon RX 6000/7000/9000 y Radeon integrada de Ryzen AI Max (Strix Halo 8060S/8050S/8040S) experimentales; otras GPU integradas e Intel no soportadas.
- CPU: requiere AVX2.
- Almacenamiento: 34,6 GB del pack mas las partes compartidas (`native-gguf`, `mtp-rt`, `tokenizer`, `mmproj` opcional); se recomienda SSD NVMe.
- Sistema operativo: Windows 10/11 o Linux de 64 bits.
- Motores de despliegue: exclusivamente Sync-Strata (fork de Strata). No compatible con llama.cpp, Ollama, vLLM, TGI ni Strata upstream.
- Latencia y throughput: ver tabla de rendimiento (124,6 tok/s en decodificacion y 92,2 tok/s en chat con tail skip R4 sobre RTX 3080 12 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sync-M | no disponible | no disponible | Trellis Gyro/QTIP (.bin) | Qwen Community License 1.0 | Solo via Sync-Strata |
| Gyro-S (agentionai) | no disponible | no disponible | GGUF | no disponible | llama.cpp y Strata |
| Gyro-M (upstream Strata) | no disponible | no disponible | no disponible | no disponible | Strata |
| Sync-XS (hiru2005) | no disponible | no disponible | Sync-Strata | Qwen Community License 1.0 (presumible) | Solo via Sync-Strata |

Los datos de parametros, contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada; el autor remite a la pagina de Sync-XS para comparaciones de KL y a la tabla del README de Sync-Strata para velocidades.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor lo etiqueta como experimental y no hay descargas ni validacion de la comunidad.
- Compatibilidad muy restringida: solo funciona con Sync-Strata; no carga en llama.cpp, Ollama, vLLM, TGI ni Strata upstream.
- Requiere descargar por separado las partes compartidas (`hiru2005/Sync-shared`); el repositorio no es autonomo.
- Los minimos de RAM y VRAM no estan medidos; el rendimiento depende fuertemente del hardware y solo hay cifras para Windows sobre RTX 3080 12 GB.
- Soporte de GPU incompleto: GTX 10, Radeon e iGPU de Strix Halo sin verificar en hardware real; Intel no soportado.
- Riesgo de alucinacion y sesgos: no documentados en la model card; se heredan los del modelo base Qwen3.8-Flash-Next, sin evaluacion publicada.
- Idiomas: lista no publicada; la calibracion uso varios idiomas sin especificar cobertura.
- Licencia Qwen Community License 1.0: impone condiciones al uso comercial que deben revisarse antes de produccion; el autor no las detalla.
- Texto de calibracion no distribuido y parcialmente derivado de registros de chat del autor, lo que limita la reproducibilidad.
- Sin benchmarks estandar: la unica metrica de calidad es el KL interno del autor, no comparable con MMLU, HumanEval o GSM8K.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sync-strata/Sync-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Partes compartidas: https://huggingface.co/hiru2005/Sync-shared
- Motor Sync-Strata: https://github.com/hiruhiru2005/sync-strata
- Strata (upstream): https://github.com/Niko1221/Strata
- Gyro-S GGUF (agentionai): https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Pagina de comparacion Sync-XS: https://huggingface.co/hiru2005/Sync-XS
- llama.cpp / ggml: https://github.com/ggml-org/llama.cpp
- Donaciones (Ko-fi): https://ko-fi.com/hiruhiru2005
