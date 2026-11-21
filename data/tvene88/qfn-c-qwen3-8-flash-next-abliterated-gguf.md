# Tvene88/QFN-C-Qwen3.8-Flash-Next-Abliterated-GGUF

## Resumen

QFN-C es una reconstruccion GGUF del modelo Qwen3.8-Flash-Next (176.943.899.520 parametros totales) publicada por el usuario Tvene88 en Hugging Face. No se trata de un modelo entrenado ni afinado: es un ensamblaje byte a byte de tensores procedentes de cuatro distribuciones GGUF publicas (bartowski, unsloth, huihui-ai y SC117), combinadas mediante una receta de "tensor transplant" para que el modelo completo quepa y funcione en una unica GPU de 32 GB con 96 o 128 GB de RAM de sistema. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.8, con ventana de contexto nativa de 262.144 tokens ampliable a 524.288 mediante YaRN x2.

La relevancia del artefacto es fundamentalmente de ingenieria: demuestra que un modelo de 176,9 B de parametros puede servirse a 41,6 tokens/s con 518.000 tokens en contexto sobre una RTX 5090, paginando los expertos enrutados en memoria host y aplicando parches a llama.cpp (atencion dispersa sobre cache KV cuantizada y cache de expertos en GPU). El componente de "abliteration" (eliminacion de rechazos) procede de los tensores no-expertos de huihui-ai, por lo que el comportamiento de rechazo no ha sido evaluado.

La ficha debe leerse con cautela: no hay benchmarks de tarea (matematicas, codigo, rechazo) completados, las mediciones son de un unico host ejecutadas una sola vez y la licencia es la Qwen Community License 1.0, no una licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 (176,94 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 524.288 con YaRN x2 |
| Tipos de cuantizacion | Mezcla: IQ4_XS (expertos enrutados de 18 bloques), UD-Q4_K_XL (expertos de los otros 30 bloques), Q8_0 (tensores no-expertos), IQ2_XS (tabla de embeddings n-gram de shard 2); cache KV q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | GGUF (2 shards: 78.722.102.464 y 28.800.138.432 bytes) |
| Tamano del repo | 107,5 GB |
| Tensores totales | 1.223 en shard 1 (segun manifiesto) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos. QFN-C no entrena ni re-cuantiza nada: cada tensor se copia byte a byte desde uno de cuatro donantes fijados por revision. Los expertos enrutados de 18 bloques seleccionados por sensibilidad provienen de `bartowski/Qwen3.8-Flash-Next-GGUF` en IQ4_XS; los expertos de los 30 bloques restantes, de `unsloth/Qwen3.8-Flash-Next-GGUF` en UD-Q4_K_XL; todos los tensores no-expertos (incluidos los 96 tensores editados por abliteration), de `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF` en Q8_0; y la tabla de embeddings n-gram (shard 2), de `SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF` en IQ2_XS.

La innovacion tecnica no esta en el entrenamiento sino en el despliegue: un motor llama.cpp parcheado (build `79bce0c` mas cuatro parches) que implementa atencion dispersa sobre cache KV cuantizada (parche 0004) y colocacion de expertos en memoria `CUDA_Host` paginada con cache de expertos en GPU (parche 0003). Segun el autor, a 518K tokens de contexto la ruta de atencion estandar decodifica 20,7 tok/s y la parcheada 41,6 tok/s. No se documento numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO, porque el artefacto no entrena.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag `conversational`).
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.8-Flash-Next; no verificadas con benchmarks en esta distribucion.
- Contexto largo: ventana nativa de 262.144 tokens y 524.288 con YaRN x2, con rendimiento medido a 517.811 tokens en contexto.
- Mezcla de expertos con enrutamiento disperso: solo se activa un subconjunto de expertos por token (parametros activos no disponibles).
- Comportamiento sin rechazos (abliterated): los tensores no-expertos proceden de huihui-ai abliterated-v2; el autor advierte que el comportamiento de rechazo no fue evaluado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos en una sola pasada: con 262.144 tokens nativos y 524.288 con YaRN x2, el modelo puede ingerir arboles de codigo enteros o transcripciones largas sin trocear, siempre que se acepte el coste de paginacion de expertos en RAM host.
- Despliegue en estacion de trabajo con una sola GPU consumer: el perfil medido (RTX 5090 de 32 GB, 96 GB de RAM, Windows 11) permite servir el modelo en local para prototipado y evaluacion, sin clúster multi-GPU.
- Sustitucion de APIs cerradas en flujos de generacion de texto sin filtros: al estar abliterated, encaja en tareas de redaccion creativa, role-play o generacion de contenido donde los rechazos del modelo original son un obstaculo, asumiendo la falta de evaluacion de sesgos.
- Experimentacion en investigacion sobre cuantizacion y serving: el repositorio incluye manifiesto de tensores, journal de hashes, receta de ensamblaje y parches de motor, lo que lo convierte en banco de pruebas reproducible para estudiar el impacto de mezclar cuantizaciones (KL 0,0572 frente a referencia casi sin perdida; 93,46 % mismo top token).
- Procesamiento de documentos legales o tecnicos de gran extension: resumen y extraccion sobre contratos o especificaciones de cientos de miles de tokens en una unica ventana, con cache KV q4_0 para contener el consumo de VRAM.
- Evaluacion comparativa de ingenieria de inferencia: util para medir throughput y latencia de llama.cpp parcheado frente a vLLM u otros motores en modelos MoE de gran tamano con expertos en host.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, rechazo) en la informacion disponible. El autor lo indica explicitamente: "No task benchmark (mathematics, coding, refusal) was completed". Los unicos datos numericos son de serving y de divergencia de distribucion:

| Metrica | Valor | Condiciones |
|---|---|---|
| Throughput a 517.811 tokens de contexto | 41,57 tok/s | RTX 5090, expertos page-locked, cache KV q4_0, batch 2.048, cache de expertos 15.197 MiB, YaRN x2, 1 peticion, llama.cpp parcheado, 96 GB RAM, PCIe gen4 |
| Throughput a 2K de contexto | 46,94 tok/s | Ventana de 262.144 tokens |
| Throughput a 255K de contexto | 46,72 tok/s | Ventana de 262.144 tokens |
| Throughput con 128 GB RAM (todo pinned) | 40,58-41,92 tok/s tras prompt de 2K; 40,58-43,37 tras 16K | A/B de 3 rondas; +14 a +20 % y +7 a +17 % frente a colocacion de 96 GB |
| KL divergence frente a QFN-R (expertos Q6_K/Q8_0) | 0,0572 (93,46 % mismo top token) | 12 chunks de 4.096 tokens, posiciones nativas, cache f16 |
| KL divergence con YaRN x2 y cache q4_0 | 0,0759 (92,31 % mismo top token) | Mismas condiciones |
| Decodificacion con atencion estandar vs parcheada a 518K | 20,7 vs 41,6 tok/s | Mismo host |

## Requisitos de hardware

- VRAM: 32 GB en GPU (RTX 5090 medida); 15.197 MiB reservados como cache de expertos en GPU en el perfil servido.
- RAM host: 96 GB minimo (69,5 GiB de datos del modelo en RAM, 57,2 GiB page-locked) o 128 GB para la colocacion totalmente pinned (unos 68 GiB page-locked).
- GPU recomendadas: RTX 5090 (unica medida). Otras GPU de 32 GB o mas no fueron probadas; A100/H100 no aparecen en la informacion disponible.
- Cabe en GPU consumer: si, en RTX 5090 de 32 GB, con el modelo repartido entre VRAM y RAM host.
- Opciones de despliegue: llama.cpp parcheado (build `79bce0c` mas cuatro parches del repo `engine/`), con `llama-server` y los flags documentados (`-ngl 999`, `-ot "\.ffn_.*_exps=CUDA_Host"`, `--moe-cache-mib 15197`, `-fa on`, `-ctk q4_0 -ctv q4_0`, `-ub 2048 -b 2048`, `--rope-scaling yarn --rope-scale 2 --yarn-orig-ctx 262144`). vLLM, TGI, Ollama y llama.cpp sin parches: no disponible si cargan estos ficheros (no probado).
- Latencia y throughput: 41,57 tok/s a 518K de contexto y 46,94 tok/s a 2K en el host medido; una sola ejecucion por configuracion.
- Almacenamiento: 107,5 GB de repo (dos shards GGUF de 78,7 GB y 28,8 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| QFN-C (este) | 176,94 B | 262.144 nativo / 524.288 YaRN x2 | Mezcla IQ4_XS / UD-Q4_K_XL / Q8_0 / IQ2_XS | Qwen Community 1.0 | Ensamblaje GGUF para 1 GPU de 32 GB, abliterated |
| Qwen/Qwen3.8-Flash-Next | 176,94 B | 262.144 (segun base) | Original en safetensors | Qwen Community 1.0 | Modelo base oficial, sin edicion de rechazos |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | 176,94 B | no disponible | GGUF (Q8_0 entre otras) | Qwen Community 1.0 | Abliterated, sin receta de serving en 32 GB |
| bartowski/Qwen3.8-Flash-Next-GGUF | 176,94 B | no disponible | IQ4_XS entre otras | Qwen Community 1.0 | Cuantizacion GGUF estandar |
| unsloth/Qwen3.8-Flash-Next-GGUF | 176,94 B | no disponible | UD-Q4_K_XL entre otras | Qwen Community 1.0 | Cuantizaciones dinamicas Unsloth |

No se dispone de datos de rendimiento de tarea de ninguno de los comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y estrategia de cuantizacion.

## Limitaciones y advertencias

- Base abliterated: los tensores no-expertos proceden de huihui-ai abliterated-v2 y el comportamiento de rechazo no fue evaluado; puede producir contenido que el modelo original rechazaria.
- Sin benchmarks de tarea: no hay resultados de matematicas, codigo ni rechazo, por lo que no se puede afirmar calidad de razonamiento.
- Mediciones limitadas: un unico host (RTX 5090, PCIe gen4, Windows 11), cada configuracion ejecutada una sola vez; sin reproduccion independiente completa.
- El perfil servido de 524.288 tokens con ocho bloques paginables nunca se midio a profundidad completa.
- Dependencia de motor parcheado: las velocidades publicadas requieren llama.cpp en `79bce0c` con los cuatro parches; no se probo si llama.cpp sin parches carga los ficheros.
- Metodo de evaluacion parcialmente privado: el texto del test de distribucion es en parte privado; el metodo es repetible pero los digitos no exactamente.
- Licencia Qwen Community License 1.0: no es permisiva; incluye condicion de aviso y posibles restricciones de uso comercial que deben revisarse en el fichero LICENSE antes de produccion.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera de los idiomas del modelo base.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en esta distribucion.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Tvene88/QFN-C-Qwen3.8-Flash-Next-Abliterated-GGUF
- Repositorio GitHub (receta, ensamblador, parches, serving): https://github.com/Tvene88/qfn-c-qwen38-flash-next
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Donante de tensores no-expertos (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- Donante de expertos IQ4_XS: https://huggingface.co/bartowski/Qwen3.8-Flash-Next-GGUF
- Donante de expertos UD-Q4_K_XL: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Donante de la tabla de embeddings n-gram (IQ2_XS shard 2): https://huggingface.co/SC117/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Licencia: https://huggingface.co/Tvene88/QFN-C-Qwen3.8-Flash-Next-Abliterated-GGUF/blob/main/LICENSE
