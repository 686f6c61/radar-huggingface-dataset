# Xylolabs/Raon-1-mini-GGUF

## Resumen

Raon-1-mini-GGUF es la version cuantizada en formato GGUF del modelo KRAFTON/Raon-1-mini, publicada por Xylolabs. Se trata de un modelo de generacion de texto con arquitectura de mezcla de expertos (MoE) de aproximadamente 28.800 millones de parametros totales, distribuido bajo licencia Apache 2.0 y orientado a inferencia local mediante llama.cpp. La unica cuantizacion publicada hasta la fecha es Q8_0, con un peso de 30,69 GB en un unico fichero.

Su relevancia practica reside en que permite ejecutar un modelo MoE de gran tamano en hardware de consumo y estaciones de trabajo, siempre que se aplique offload de los pesos de expertos a memoria del sistema. La model card documenta con detalle el procedimiento de compilacion de un fork especifico de llama.cpp (rama `raon-1-mini` del repositorio krafton-ai/llama.cpp), requisito imprescindible porque el modelo no funciona con versiones upstream de llama.cpp.

El modelo base esta especializado en coreano e ingles, lo que limita su uso directo en castellano. La ficha tecnica del modelo original (contexto maximo, datos de entrenamiento, benchmarks) no esta incluida en la informacion disponible; esta pagina se centra en la distribucion GGUF y en los datos de fidelidad de cuantizacion publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun tags del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 28.783.231.402 (28,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K segun la tabla de hardware del autor; 32K en configuracion de ejemplo con `-c 32768` |
| Tipos de cuantizacion | Q8_0 (unica publicada) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico `Raon-1-mini-Q8_0.gguf`, 30,69 GB) |
| Modelo base | KRAFTON/Raon-1-mini (relacion: quantized) |
| Libreria / runtime | gguf, llama-cpp (fork krafton-ai/llama.cpp, rama `raon-1-mini`) |
| Tamano del repositorio | 30,7 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo es de tipo MoE (etiqueta `moe` en el repositorio y en la model card) y que el modelo original fue entrenado por KRAFTON. No se dispone de datos sobre el numero de capas, dimension del modelo, numero de expertos, funcion de activacion, mecanismo de atencion ni sobre el volumen y composicion del corpus de entrenamiento. Tampoco hay informacion publicada sobre fases de alineacion (RLHF, DPO) en la documentacion consultada.

El trabajo tecnico documentado en esta distribucion es la conversion y cuantizacion a GGUF. El autor reporta mediciones de fidelidad frente al original en MXFP8 dequantizado a BF16, evaluadas con WikiText-2, un conjunto de chat y un conjunto held-out. Para Q8_0 se obtiene una divergencia KL de 0,005885 en WikiText-2 con un 96,87% de coincidencia top-1, y valores aun mejores en chat (KL 0,002753, top-1 97,90%) y held-out (KL 0,002143, top-1 97,63%). El autor compara estos resultados con los Q8_0 publicados por KRAFTON, que presentan una KL aproximadamente 2,4 veces mayor en WikiText-2 (0,014311) y menor acuerdo top-1 (95,16%). Estos datos miden fidelidad respecto al original, no calidad absoluta del modelo.

Un aspecto critico de la implementacion es la dependencia de un fork de llama.cpp. La model card verifica el funcionamiento con el commit `e1647091f3f53c63c184c536d7b33b5958e60225` de la rama `raon-1-mini`, e indica que la ejecucion requiere esa build; no se garantiza compatibilidad con llama.cpp upstream ni con otros runners.

## Capacidades

- Generacion de texto conversacional en coreano e ingles, con etiqueta `conversational` en el repositorio.
- Razonamiento y generacion de texto general derivados del modelo base; no hay evaluaciones publicadas en la informacion disponible.
- Soporte de plantilla de chat mediante `--jinja` en llama-server, segun el comando de ejemplo del autor.
- Ejecucion local y en servidor mediante llama.cpp, con API compatible con endpoints (`endpoints_compatible` en los tags).
- Capacidad de contexto largo: la tabla de hardware del autor indica configuraciones de hasta 256K tokens con suficiente memoria.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Asistencia conversacional en coreano e ingles: el modelo puede gestionar dialogos multi-turno con contexto amplio (hasta 256K tokens con hardware adecuado), lo que resulta util para soporte tecnico o tutoria en esos idiomas. No es adecuado para castellano sin evaluacion previa.
- Procesamiento de documentos largos en coreano: resumen y extraccion de informacion de contratos, informes o expedientes que superen la ventana tipica de 8K-32K tokens, aprovechando la ventana extendida documentada por el autor.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse con llama.cpp en estaciones de trabajo o servidores propios, permite procesar datos sensibles sin salida a la nube; la licencia Apache 2.0 facilita la integracion comercial.
- Prototipado e investigacion en hardware de consumo: con offload de expertos a RAM (`--n-cpu-moe`) se puede ejecutar en una RTX 4090 o RTX 3090 de 24 GB manteniendo 32K de contexto, lo que sirve para experimentar con un MoE de 28,8B sin clúster.
- Generacion de texto y traduccion asistida coreano-ingles: el par de idiomas soportado cubre casos de localizacion de contenido y redaccion bilingue.
- Evaluacion comparativa de tecnicas de cuantizacion: los datos de KL y top-1 publicados permiten usar este repositorio como referencia para estudiar el impacto de Q8_0 en modelos MoE frente a otras implementaciones.
- Servicio de inferencia en servidor con GPU de datacenter: con una H100 de 80 GB o una H200 de 141 GB se puede servir el fichero completo con 256K de contexto, adecuado para cargas internas de equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son metricas de fidelidad de la cuantizacion frente al original en MXFP8 dequantizado a BF16:

| Metrica | Q8_0 (Xylolabs) | Q8_0 (KRAFTON) |
|---|---|---|
| Tamano | 30,69 GB | 30,69 GB |
| WikiText-2 KL | 0,005885 | 0,014311 |
| WikiText-2 top-1 | 96,87% | 95,16% |
| Chat KL | 0,002753 | 0,005511 |
| Chat top-1 | 97,90% | 96,45% |
| Held-out KL | 0,002143 | 0,004831 |
| Held-out top-1 | 97,63% | 96,24% |

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 ocupa 30,69 GB. La regla del autor exige que el tamano del fichero mas la cache KV en f16 al contexto elegido mas 2 GB de runtime queden por debajo del 90% de la memoria disponible.
- GPU de 24 GB (RTX 4090, RTX 3090): no cabe completo; se requiere offload de expertos con `--n-cpu-moe N` y contexto de 32K segun la tabla del autor.
- GPU de 32 GB (RTX 5090): misma estrategia de offload con 32K de contexto.
- GPU de 48 GB (RTX 6000 Ada o 2 x 24 GB): fichero completo con 256K de contexto.
- GPU de datacenter: H100 (80 GB), H200 (141 GB), B200 (~180 GB utiles en DGX B200) y B300 (288 GB) admiten el fichero completo con 256K de contexto.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256/512 GB) admiten el fichero completo con 256K de contexto.
- Despliegue: exclusivamente mediante el fork krafton-ai/llama.cpp, rama `raon-1-mini`; se compila con CMake (`-DGGML_CUDA=ON` para NVIDIA) y se sirve con `llama-server`. No hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp upstream.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base que permitan una comparacion de rendimiento fiable con alternativas. La comparativa se limita a caracteristicas objetivas:

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Raon-1-mini-GGUF (Xylolabs) | 28,8B (MoE) | hasta 256K | Apache 2.0 | GGUF Q8_0 | Requiere fork de llama.cpp; solo ko/en |
| KRAFTON/Raon-1-mini (original) | 28,8B (MoE) | no disponible | Apache 2.0 | MXFP8 | Modelo base; pesos completos |
| KRAFTON Q8_0 (referencia en la model card) | 28,8B (MoE) | no disponible | Apache 2.0 | GGUF Q8_0 | Peor fidelidad reportada que la version de Xylolabs |

No se identifican en la informacion disponible otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Idiomas: solo coreano e ingles. El rendimiento en castellano no esta evaluado y previsiblemente sera inferior; no se recomienda para produccion en espanol sin pruebas propias.
- Dependencia de un fork: el modelo no funciona con llama.cpp upstream ni con otras herramientas estandar (vLLM, TGI, Ollama). Esto complica el mantenimiento, la actualizacion y la integracion en pipelines existentes.
- Una sola cuantizacion: solo se publica Q8_0 (30,69 GB), lo que excluye GPUs de consumo sin offload a RAM y limita el despliegue en entornos con poca memoria.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de robustez; como en cualquier modelo generativo, se requiere validacion humana en usos sensibles.
- Sesgos: no hay informacion publicada sobre sesgos demograficos, culturales o linguisticos del modelo base.
- Datos de entrenamiento desconocidos: se desconoce la composicion del corpus, la fecha de corte y las fases de alineacion, lo que dificulta evaluar riesgos de contaminacion o de conocimiento desactualizado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no ofrece garantias; conviene revisar el fichero LICENSE del repositorio y la licencia del modelo base.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 25 de noviembre de 2026; no hay evidencia de uso en produccion por terceros.
- Contexto largo: la cifra de 256K proviene de la tabla de hardware del autor; no se documenta si el modelo base fue entrenado con esa longitud efectiva ni como se comporta en recuperacion de informacion en ventanas extremas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Raon-1-mini-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- Fork de llama.cpp requerido: https://github.com/krafton-ai/llama.cpp/tree/raon-1-mini
- Licencia: https://huggingface.co/Xylolabs/Raon-1-mini-GGUF/blob/main/LICENSE
- Repositorio de herramientas del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
