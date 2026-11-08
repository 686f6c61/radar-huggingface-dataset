# zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el equipo Qwen (Alibaba), con 176.943.899.520 parametros totales segun los datos de safetensors. Sobre el se ha construido esta publicacion: una cuantizacion GGUF de terceros firmada por zephel01, pensada especificamente para un equipo con una GPU de 24 GB de VRAM y 64 GB de RAM. El archivo no es una cuantizacion generica, sino una re-cuantizacion selectiva de los pesos de los expertos mediante LDLQ (LDLQ = una variante de cuantizacion con calibracion por minimos cuadrados) partiendo de los pesos en formato NVFP4 del modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un modelo base de gran tamano (177.000 millones de parametros) del que no se dispone de model card detallada en la informacion proporcionada. Por otro, describe una tecnica de cuantizacion orientada a hardware de consumo: el autor mantiene los 512 expertos, conserva los tensores no-experto del archivo UD-IQ4_XS de unsloth y solo re-cuantiza los expertos, logrando el mismo tamano (93,7 GB) y una divergencia KL menor (0,068 frente a 0,092) que la referencia de unsloth, con un coste de velocidad minimo (69,9 frente a 71,1 tok/s en tareas de codigo).

El resultado es un archivo BETA, medido en un solo equipo emulado (RTX 5090 con VRAM limitada a 24 GB y un cgroup de 58 GB), que permite ejecutar un modelo de 177B en local con offload de expertos a CPU. Es una pieza relevante para quien quiera correr modelos grandes en estaciones de trabajo de gama alta sin cluster, aunque con las advertencias propias de una publicacion no oficial y en estado beta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer (arch `qwen4exp` en llama.cpp); detalles internos no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; en las pruebas se usa `-c 32768` |
| Tipos de cuantizacion | GGUF mixta: expertos gate/up en IQ3_S (capa 2 en IQ4_XS), expertos down en IQ4_NL (capas 2, 4, 30, 46, 47 en Q8_0); media de 3,94 bits por peso, aproximadamente equivalente a IQ3_M |
| Idiomas soportados | no disponible como lista oficial; la model card menciona japones, chino, ingles y codigo en la calibracion y las pruebas |
| Licencia | qwen-community-1.0 (licencia del modelo original) |
| Formato de pesos | GGUF, 3 shards, 93,7 GB en total |

## Arquitectura y entrenamiento

El modelo base es un MoE de Qwen con 176.943.899.520 parametros totales y 512 expertos, segun se deduce de la model card del cuantizador ("All 512 experts are kept"). La arquitectura interna (numero de capas, dimension del modelo, numero de expertos activos por token, atencion, etc.) no esta disponible en la informacion proporcionada. La model card del cuantizador menciona una "per-layer embedding table" de 28,8 GB que se lee fila a fila desde SSD, lo que sugiere un esquema de embeddings por capa poco habitual, pero no se detalla su funcionamiento.

El entrenamiento del modelo base no esta documentado en la informacion disponible: no se conocen el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se documenta es el proceso de cuantizacion de esta publicacion: se calcularon hessianos sobre 1,26 millones de tokens usando el modelo NVFP4 de magnitudedev como referencia (181 prompts: 44 en japones, 20 en chino, 20 en ingles, 37 de codigo, 35 de matematicas y 25 de tool calls), y despues se re-cuantizo cada experto con LDLQ en los tipos y el tamano exactos del UD-IQ4_XS de unsloth, fusionandolos en ese archivo. Los tensores no-experto (atencion, router, experto compartido, embeddings y tabla de embeddings por capa) se conservan sin cambios respecto al UD-IQ4_XS de unsloth.

## Capacidades

- Generacion de texto conversacional multi-turno, con modo "thinking" activable (usado en las pruebas del autor).
- Razonamiento y matematicas: la model card reporta respuestas correctas en una prueba aritmetica dentro de un conjunto de cinco prompts en japones.
- Generacion de codigo: se evalua con cinco tareas de codigo con tests ocultos, con resultados de 5/5 y 4/5 segun la semilla en Abyss, y 3/5 en llama.cpp.
- Procesamiento de contextos largos: se verifica la recuperacion de una aguja en un prompt de 8K tokens con resultado correcto.
- Capacidades multilingues: se prueban japones, chino, ingles y codigo; la lista oficial de idiomas del modelo base no esta disponible.
- Tool calling / function calling: aparece como dominio en el conjunto de calibracion (25 prompts), lo que indica que el modelo base lo soporta, aunque no se detalla su comportamiento.
- Soporte de decodificacion especulativa mediante MTP drafter en el motor Abyss (mencionado en la configuracion de pruebas).

## Casos de uso

- Asistencia de codigo en local: el archivo cabe en una estacion con 24 GB de VRAM y 64 GB de RAM y permite generar codigo con decodificacion de 26-34 tok/s en llama.cpp o cerca de 70 tok/s en Abyss. Es adecuado para equipos que no pueden enviar codigo propietario a APIs externas.
- Atencion al cliente en japones: las pruebas reportan 10/10 respuestas correctas en cinco prompts de negocio (correo comercial, explicacion, resumen, dato literario y aritmetica) con dos semillas, lo que lo hace util para borradores de correo y resumenes en ese idioma.
- Procesamiento de documentos largos: con recuperacion correcta de informacion en prompts de 8K tokens, sirve para extraer datos de contratos o informes dentro de esa ventana.
- Desarrollo de agentes con tool calling: al haber sido calibrado con prompts de llamadas a herramientas, es una base razonable para prototipos de agentes que necesiten ejecutar funciones locales, siempre validando el comportamiento en produccion.
- Inferencia con offload de expertos en CPU: el diseno `--n-cpu-moe 34` de llama.cpp permite mantener parte de los expertos en RAM y el resto en VRAM, lo que habilita servir el modelo en una unica maquina sin GPU de datacenter.
- Experimentacion e investigacion en cuantizacion: el repositorio documenta el pipeline completo (hessianos, LDLQ, fusion) con las herramientas `trench-gguf`, lo que lo convierte en un caso de estudio reproducible para investigar el impacto de la cuantizacion en la calidad.
- Despliegue en estaciones de trabajo con RTX 5090: el autor emula el objetivo de 24 GB limitando la VRAM de una RTX 5090, por lo que es un candidato directo para ese tipo de tarjeta.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor sobre el archivo cuantizado, no benchmarks estandar del modelo base. Se presentan tal cual:

| Metrica | Este archivo | unsloth UD-IQ4_XS |
|---|---|---|
| Tamano de descarga | 93,7 GB | 93,7 GB |
| Residente (GPU + RAM) | 64,2 GB | 64,9 GB |
| KL (10 secuencias) | 0,068 | 0,092 |
| Mismo token top | 90,3% | 88,7% |
| KL en japones | 0,146 | 0,195 |
| KL en codigo | 0,092 | 0,116 |
| Decodificacion, 3 tareas de codigo | 69,9 tok/s | 71,1 tok/s |
| Japones, 5 prompts | 10/10 correctos | 10/10 |
| Codigo, 5 tareas con tests ocultos | 5/5 y 4/5 | 3/5 y 5/5 |
| Aguja en 8K tokens | correcto | correcto |
| Procesamiento de prompt (8K) | 1.680-1.689 tok/s | 1.670-1.683 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: 24 GB es el objetivo declarado del archivo; en llama.cpp se usan 24,2 GB con `--n-cpu-moe 34` y se recomienda subir a 35 o mas en una tarjeta real de 24 GB.
- RAM: 64 GB en el equipo objetivo; en Abyss se configura `STRATA_GLM_RAM_GB=46` dentro de un cgroup de 58 GB.
- Almacenamiento: 93,7 GB para los tres shards, mas espacio para el pack de Abyss; se recomienda NVMe SSD porque la tabla de embeddings por capa (28,8 GB) se lee desde disco.
- GPU recomendadas: RTX 5090 (32 GB) para emular el caso de 24 GB; no se han medido otras GPU con este archivo.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB o mas, con offload de expertos a RAM del sistema.
- Opciones de despliegue: Abyss v1.3.108 o superior (con `tools/iq_pack.py` y `--glm-pack`) y llama.cpp (arquitectura `qwen4exp`, commit `ac8e1694d` del 2026-10-29 o posterior).
- Latencia y throughput: 69,9 tok/s en decodificacion con Abyss en el equipo emulado; 26-34 tok/s en llama.cpp; 1.680-1.689 tok/s de procesamiento de prompt de 8K en Abyss.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este archivo (zephel01, 24G64G) | 176,9B totales | no disponible (pruebas a 32K) | qwen-community-1.0 | GGUF, 93,7 GB | KL 0,068; 69,9 tok/s en Abyss |
| unsloth UD-IQ4_XS | 176,9B totales | no disponible | qwen-community-1.0 | GGUF, 93,7 GB | KL 0,092; 71,1 tok/s en Abyss |
| zephel01 16G64G | 176,9B totales | no disponible | qwen-community-1.0 | GGUF | Variante para GPU de 16 GB y 64 GB de RAM |
| zephel01 E448-IQ2_M 12G32G | 176,9B totales (448 expertos) | no disponible | qwen-community-1.0 | GGUF | Variante para GPU de 12 GB y 32 GB de RAM |

No se dispone de datos de otros modelos de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- Publicacion BETA: el autor advierte que las mediciones se hicieron en un solo equipo emulado (RTX 5090 con VRAM limitada a 24 GB) y que no se han probado otras GPU.
- No es una publicacion oficial de Qwen: es una cuantizacion de terceros; la calidad final depende tanto del modelo base como del proceso LDLQ.
- La model card no documenta sesgos del modelo base, riesgo de alucinacion ni limitaciones de idioma; no hay informacion disponible al respecto.
- Los resultados de codigo varian entre motores y semillas (5/5 y 4/5 en Abyss, 3/5 en llama.cpp), lo que indica cierta inestabilidad en tareas de codigo.
- La licencia qwen-community-1.0 puede imponer restricciones al uso comercial; debe revisarse el enlace de licencia antes de desplegar en produccion.
- Requiere Abyss v1.3.108 o superior para la ruta de prompt: en versiones anteriores los expertos down Q8_0 de este layout leen fuera de su slot (tambien ocurre en el UD-IQ4_XS de unsloth).
- El rendimiento depende del SSD: la tabla de embeddings por capa (28,8 GB) se lee desde disco, por lo que un almacenamiento lento degradara la latencia.
- El contexto maximo oficial del modelo base no esta disponible; las pruebas se limitan a 8K y 32K tokens.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-24G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante para 16 GB de VRAM: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-16G64G-GGUF
- Variante para 12 GB de VRAM y 32 GB de RAM: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Coleccion de cuantizaciones: https://huggingface.co/collections/zephel01/qwen38-flash-next-gguf
- Modelo NVFP4 de referencia: https://huggingface.co/magnitudedev/Qwen3.8-Flash-Next-NVFP4-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Herramientas de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de reporte de benchmarks: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+24G64G+on+YOUR_GPU
- Issues de Abyss: https://github.com/zephel01/Abyss/issues
