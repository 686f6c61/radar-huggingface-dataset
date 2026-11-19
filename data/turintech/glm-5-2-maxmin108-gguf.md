# turintech/GLM-5.2-MaxMin108-GGUF

## Resumen

GLM-5.2-MaxMin108-GGUF es una versión comprimida y cuantizada del modelo GLM-5.2 de Z.ai, publicada por TurinTech. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) al que se le han podado expertos (expert pruning) mediante la herramienta Artemis de TurinTech, partiendo del GGUF de 2 bits de Unsloth. El objetivo es claro: hacer que un modelo de 324.832 millones de parámetros totales quepa y funcione en una única máquina de 128 GB, en concreto en una NVIDIA GB10 (DGX Spark), donde el archivo por defecto ocupa 104 de 121 GB con contexto de 64K.

La relevancia de esta ficha está en el compromiso que documenta el propio autor: la poda reduce el tamaño lo suficiente para ejecución local en hardware de escritorio profesional, pero degrada el conocimiento del mundo de forma notable. El modelo por defecto obtiene 61,84 en MMLU 5-shot frente a los 87,29 del GGUF de 2 bits original de Unsloth, mientras que en código (MBPP pass@1) baja a 0,592 frente a 0,710. Es, por tanto, una opción de despliegue local para chat, código y razonamiento en inglés, no un sustituto del modelo completo.

El repositorio incluye dos variantes: `IQ2_M-fast` (95,78 GiB, seis shards, la opción por defecto) y `IQ2_M` de referencia (100,33 GiB, otros seis shards, con mejores resultados). Solo debe descargarse un conjunto, no ambos. La licencia es MIT y el modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con poda de expertos; transformer con soporte GLM-DSA en llama.cpp |
| Parametros totales | 324.832.039.332 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens en la configuración de referencia (`-c 65536`) |
| Tipos de cuantizacion | IQ2_M-fast (por defecto, 95,78 GiB) e IQ2_M (referencia, 100,33 GiB); KV cache en q8_0 (`-ctk q8_0 -ctv q8_0`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (seis shards por variante; repo de 210,6 GB en total) |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 es un transformer con arquitectura Mixture-of-Experts. Sobre él, TurinTech aplica una compresión en dos etapas: primero parte del GGUF de 2 bits publicado por Unsloth y después poda expertos con su herramienta Artemis, dando lugar al sufijo "MaxMin108" del nombre. El resultado se distribuye en formato GGUF dividido en seis shards, pensado para `llama-server` con soporte de GLM-DSA (build `b10005`, commit `7f575c39d` o posterior).

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La model card sí documenta una particularidad operativa relevante: la plantilla de chat de GLM-5.2 emite una directiva de esfuerzo de razonamiento alto que puede consumir el presupuesto de generación en tokens de razonamiento ocultos, por lo que el autor recomienda el flag `-rea off` en llama.cpp. La configuración de referencia usa `-ngl 99`, `-fa 1` (flash attention), KV cache cuantizada en q8_0, `-np 1` y `-t 20`.

## Capacidades

- Generación de texto conversacional en inglés, orientada a chat multi-turno.
- Generación de código, con resultados medidos en MBPP (pass@1 de 0,592 en la variante por defecto).
- Razonamiento y conocimiento general, con resultados medidos en MMLU 5-shot (61,84 en la variante por defecto).
- Modo de razonamiento configurable mediante la plantilla del modelo; puede desactivarse con `-rea off`.
- Servidor compatible con la API de chat completions de OpenAI (`/v1/chat/completions`) a través de `llama-server`.
- Etiquetado como `endpoints_compatible` en el Hub.
- No se declaran en la información disponible capacidades de visión, audio, tool calling explícito ni soporte multilingüe más allá del inglés.

## Casos de uso

- Asistente de código en estación de trabajo local: con 95,78 GiB de pesos y un pass@1 de 0,592 en MBPP, puede ejecutarse en una DGX Spark para autocompletado, explicación y refactorización de código sin enviar el código a un servicio externo.
- Chat interno con datos sensibles: al caber en una única máquina de 128 GB y tener licencia MIT, permite desplegar un asistente conversacional en infraestructura propia, con contexto de hasta 64K tokens para conversaciones o documentos largos.
- Procesamiento de documentos extensos en inglés: la ventana de 65.536 tokens admite resúmenes y extracción de información sobre contratos, informes o documentación técnica de decenas de miles de palabras.
- Prototipado e investigación sobre compresión de modelos: el repositorio publica dos variantes con métricas comparadas (IQ2_M-fast frente a IQ2_M), lo que sirve como referencia para estudiar el coste de la poda de expertos sobre un GGUF de 2 bits.
- Evaluación de pipelines llama.cpp con MoE de gran tamaño: útil para validar configuraciones de flash attention, KV cache q8_0 y offload completo de capas (`-ngl 99`) en hardware GB10.
- Generación de documentación técnica y textos en inglés: tareas de redacción y transformación de texto donde la pérdida de conocimiento del mundo no es crítica y prima la disponibilidad local.
- Servicio de inferencia compatible con OpenAI: al exponer `/v1/chat/completions`, puede conectarse a clientes y frameworks existentes sin adaptadores específicos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Archivo | Tamano | MMLU, 5-shot | MBPP pass@1 |
|---|---|---|---|
| TurinTech IQ2_M-fast (por defecto) | 95,78 GiB | 61,84 | 0,592 |
| TurinTech IQ2_M (referencia) | 100,33 GiB | 63,00 | 0,626 |
| REAP-50 Q3_K_M | 169,30 GiB | 62,75 | 0,708 |
| Unsloth 2-bit parent (no BF16) | 222,18 GiB | 87,29 | 0,710 |

El autor señala que no incluye fila BF16 porque el GGUF de 2 bits de Unsloth es la referencia de la comparación. La diferencia entre IQ2_M y REAP-50 en MMLU es de 0,25 puntos, con barras de error reportadas de ±0,39, lo que no establece equivalencia; en MBPP, REAP-50 va por delante (0,708 frente a 0,626).

## Requisitos de hardware

- VRAM/ memoria unificada: 104 de 121 GB en una NVIDIA GB10 con la variante por defecto a contexto de 64K; 109 de 121 GB con la variante de referencia.
- Máquina de referencia: 128 GB en total, una única GPU NVIDIA GB10 (DGX Spark).
- GPU recomendadas: NVIDIA GB10 para el escenario documentado; no se indican otras GPU con memoria suficiente en la información disponible.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, etc.) ni en configuraciones de 48-80 GB, dado el tamaño de los pesos.
- Opciones de despliegue: `llama-server` de llama.cpp con soporte GLM-DSA (build `b10005`, commit `7f575c39d` o posterior). No se proporciona paquete ni entrada para Ollama o LM Studio.
- Configuración recomendada: `-ngl 99 -fa 1 -ctk q8_0 -ctv q8_0 -c 65536 -np 1 -t 20 --jinja -rea off`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU 5-shot | MBPP pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.2-MaxMin108 IQ2_M-fast | 324,8 B totales (MoE podado) | 65.536 | 61,84 | 0,592 | MIT | GGUF, 95,78 GiB |
| GLM-5.2-MaxMin108 IQ2_M | 324,8 B totales (MoE podado) | 65.536 | 63,00 | 0,626 | MIT | GGUF, 100,33 GiB |
| REAP-50 Q3_K_M | no disponible | no disponible | 62,75 | 0,708 | no disponible | GGUF, 169,30 GiB |
| Unsloth 2-bit parent (GLM-5.2) | 324,8 B totales | no disponible | 87,29 | 0,710 | MIT (modelo base) | GGUF, 222,18 GiB |

## Limitaciones y advertencias

- Pérdida severa de conocimiento del mundo: 61,84 en MMLU frente a 87,29 del GGUF de 2 bits original, una caída de más de 25 puntos.
- Degradación en código: 0,592 en MBPP pass@1 frente a 0,710 del padre de 2 bits.
- Solo declara inglés; no hay soporte multilingüe documentado.
- Riesgo de alucinación elevado en preguntas factuales por la poda de expertos y la cuantización agresiva a 2 bits.
- Requiere hardware específico: una máquina de 128 GB; no es desplegable en GPU de consumo.
- Dependencia de una build concreta de llama.cpp con soporte GLM-DSA; versiones anteriores pueden no cargar el modelo.
- El modo de razonamiento por defecto puede agotar el presupuesto de generación en tokens ocultos; se recomienda `-rea off` salvo que se necesite razonamiento explícito.
- El repositorio contiene dos conjuntos de shards; descargar ambos duplica el espacio (unos 211 GB) y no aporta nada al despliegue.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente.
- La licencia MIT se hereda del modelo base; conviene revisar el enlace de licencia de zai-org/GLM-5.2 antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/GLM-5.2-MaxMin108-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.2/blob/main/LICENSE
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados declarados: https://huggingface.co/turintech/GLM-5.2-MaxMin108-GGUF#results
