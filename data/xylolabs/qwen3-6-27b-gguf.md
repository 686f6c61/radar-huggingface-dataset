# Xylolabs/Qwen3.6-27B-GGUF

## Resumen

Xylolabs/Qwen3.6-27B-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Qwen/Qwen3.6-27B, publicada por Xylolabs. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion de los pesos originales de Qwen para su uso con llama.cpp. El modelo base cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta orientado a generacion de texto conversacional.

La relevancia de esta publicacion radica en que ofrece tres niveles de cuantizacion (Q8_0, Q6_K y Q4_K_M) junto con dos proyectores de vision opcionales (mmproj en F16 y Q8_0), lo que permite desplegar un modelo de 27B en hardware de consumo como una RTX 4090 o RTX 3090 con cuantizacion Q4_K_M y 32K de contexto. Ademas, el autor publica una tabla de divergencia KL respecto a BF16 y de acuerdo top-1 en texto ingles y coreano, lo que facilita evaluar la perdida de calidad de cada cuantizacion.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial, y esta etiquetado para los idiomas ingles y coreano. La arquitectura concreta, la longitud de contexto nativa y los detalles de entrenamiento no se especifican en la informacion disponible; solo se documenta el tamano de los ficheros y las recomendaciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.6-27B; no se detalla en la informacion) |
| Parametros totales | 27.320.697.856 (27,3B aprox.) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como valor nativo; la model card documenta configuraciones de hasta 256K segun hardware |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (y proyectores de vision mmproj F16 y Q8_0) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.6-27B (tipo de transformer, atencion, posible mezcla de expertos, etc.). Lo que si se documenta es el proceso de conversion: Xylolabs convirtio y cuantizo los pesos originales de Qwen a formato GGUF para llama.cpp, generando tres variantes de cuantizacion. La model card indica que los ficheros incluyen el modelo de texto Qwen3.6-27B y dos proyectores de vision opcionales, lo que sugiere que el modelo base incorpora capacidad multimodal, aunque no se detalla el mecanismo.

No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones tecnicas del modelo base. La aportacion tecnica de esta publicacion es la cuantizacion: se publican metricas de divergencia KL media respecto a BF16 y de acuerdo top-1 en texto ingles y coreano, medidas con llama.cpp, que permiten cuantificar la perdida de fidelidad de cada variante.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation).
- Capacidad multimodal: se incluyen dos proyectores de vision (mmproj F16 y Q8_0) que, segun la model card, deben usarse con los ficheros Q8_0 o Q6_K y pasarse mediante `--mmproj`.
- Soporte de modo razonamiento: el ejemplo de ejecucion incluye el flag `--reasoning off`, lo que indica que el modelo dispone de un modo de razonamiento que puede activarse o desactivarse.
- Soporte de plantillas de chat mediante `--jinja`.
- Capacidades multilingues limitadas a ingles y coreano segun las etiquetas del repositorio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.

## Casos de uso

- Despliegue local en estacion de trabajo con GPU de consumo: con Q4_K_M (16,8 GB) el modelo cabe en una RTX 4090 o RTX 3090 de 24 GB con 32K de contexto, lo que permite ejecutar un modelo de 27B en local sin depender de la nube.
- Asistente conversacional en ingles o coreano: el modelo esta etiquetado para ambos idiomas y orientado a text-generation, por lo que puede emplearse en interfaces de chat multi-turno mediante llama.cpp con plantilla Jinja.
- Procesamiento de imagenes con el proyector de vision: usando Q6_K o Q8_0 junto con `mmproj-Qwen3.6-27B-Q8_0.gguf` o la variante F16, el modelo puede recibir imagenes como entrada adicional en tareas de descripcion o analisis visual.
- Razonamiento con modo dedicado: el flag `--reasoning` permite activar o desactivar el modo de razonamiento, util para tareas que requieren cadenas de pensamiento frente a respuestas directas de baja latencia.
- Servicio de inferencia en servidor con H100 o H200: con Q8_0 (29,0 GB) y hasta 256K de contexto en una sola H100 de 80 GB, adecuado para cargas de trabajo con documentos largos.
- Despliegue en hardware unificado (Mac Studio M5 Max/Ultra, DGX Spark): la model card documenta configuraciones con Q8_0 y hasta 256K de contexto en equipos con memoria unificada de 128 GB o mas.
- Evaluacion comparativa de cuantizaciones: las tablas de KL y top-1 permiten seleccionar la variante adecuada segun el equilibrio entre calidad y memoria disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente incluye metricas de fidelidad de cuantizacion respecto a BF16:

| Cuantizacion | Tamano | KL media (menor es mejor) | top-1 |
|---|---:|---:|---:|
| Q8_0 | 29,047 GB | 0,000977 | 98,0357% |
| Unsloth Q8_0 | 28,596 GB | 0,000977 | 98,0357% |
| Unsloth Q6_K | 22,523 GB | 0,002079 | 97,4877% |
| Q6_K | 22,431 GB | 0,002258 | 97,4507% |
| Unsloth Q5_K_M | 19,510 GB | 0,004290 | 96,9212% |
| Q4_K_M | 16,811 GB | 0,025816 | 93,2266% |
| Unsloth IQ4_XS | 15,440 GB | 0,017326 | 93,7007% |
| Unsloth Q3_K_M | 13,586 GB | 0,051246 | 90,0677% |

## Requisitos de hardware

- Criterio del autor: un fichero es apto cuando su tamano mas la cache KV en ese contexto (f16) mas 2 GB de runtime queda por debajo del 90% de la memoria disponible.
- RTX 4090 / RTX 3090 (24 GB): Q4_K_M (16,8 GB) con 32K de contexto.
- RTX 5090 (32 GB): Q6_K (22,4 GB) con 32K de contexto.
- RTX 6000 Ada o 2 x 24 GB (48 GB): Q8_0 (29,0 GB) con 128K de contexto.
- H100 (80 GB): Q8_0 con 256K de contexto.
- RTX PRO 6000 Blackwell (96 GB GDDR7): Q8_0 con 256K de contexto.
- DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB HBM3e), B200 (192 GB), Mac Studio M5 Ultra (256 GB y 512 GB) y B300 (288 GB): Q8_0 con 256K de contexto.
- Despliegue: llama.cpp (build cd959bae99ff4bed22bef2604f45241c09bbb8c8 o posterior). El repositorio esta etiquetado como endpoints_compatible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las cuantizaciones de Unsloth del mismo modelo base, para las que se publican metricas de fidelidad:

| Variante | Tamano | KL media | top-1 |
|---|---:|---:|---:|
| Xylolabs Q8_0 | 29,047 GB | 0,000977 | 98,0357% |
| Unsloth Q8_0 | 28,596 GB | 0,000977 | 98,0357% |
| Xylolabs Q6_K | 22,431 GB | 0,002258 | 97,4507% |
| Unsloth Q6_K | 22,523 GB | 0,002079 | 97,4877% |
| Xylolabs Q4_K_M | 16,811 GB | 0,025816 | 93,2266% |
| Unsloth IQ4_XS | 15,440 GB | 0,017326 | 93,7007% |

No se dispone de datos para comparar con otros modelos de tamano similar (parametros, contexto, rendimiento, licencia y disponibilidad) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; es un riesgo inherente a los modelos de lenguaje y no se han publicado evaluaciones al respecto.
- Idiomas: las etiquetas solo declaran ingles y coreano; el rendimiento en castellano no esta documentado.
- Contexto: la longitud de contexto nativa del modelo base no se especifica; las cifras de 32K a 256K corresponden a configuraciones de memoria documentadas por el autor, no a un limite nativo confirmado.
- Cuantizacion: Q4_K_M presenta una divergencia KL notablemente superior (0,025816) y un top-1 del 93,23%, frente al 98,04% de Q8_0; para tareas sensibles a la fidelidad conviene usar Q6_K o Q8_0.
- Vision: los proyectores deben combinarse con Q8_0 o Q6_K segun la model card; el uso con Q4_K_M no esta indicado.
- Licencia: Apache 2.0 permite uso comercial, pero Xylolabs declara no estar afiliado ni respaldado por Qwen ni Alibaba Cloud; debe conservarse el aviso `NOTICE` y la licencia del release original.
- Version de llama.cpp: se requiere el build indicado o posterior; versiones anteriores pueden no ser compatibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-27B-GGUF/blob/main/LICENSE
- Build de llama.cpp recomendado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (assets): https://github.com/XylolabsInc/tensix-bfp-gptq
