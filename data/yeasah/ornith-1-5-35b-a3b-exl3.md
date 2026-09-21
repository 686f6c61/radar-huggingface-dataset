# yeasah/Ornith-1.5-35B-A3B-exl3

## Resumen

Este repositorio contiene cuantizaciones en formato EXL3 del modelo `ornith-ai/Ornith-1.5-35B-A3B`, publicadas por el usuario yeasah. No es un modelo entrenado desde cero, sino una redistribución optimizada para inferencia del modelo base, que según la nomenclatura de su nombre sería un modelo de mezcla de expertos (MoE) de aproximadamente 35 000 millones de parámetros totales y unos 3000 millones de parámetros activos por token. El repositorio ofrece cinco niveles de bits por peso (2.08, 3.08, 4.08, 5.08 y 6.08 bpw), cada uno en una revisión independiente.

La relevancia de esta ficha es práctica: las cuantizaciones EXL3 permiten ejecutar un modelo de ese tamaño en GPUs de consumo, reduciendo el peso en disco desde 66,97 GiB del modelo base hasta 10,83 GiB en la configuración de 2.08 bpw. La model card documenta de forma explícita las métricas de fidelidad respecto al modelo sin cuantizar (divergencia KL y perplejidad), lo que permite elegir el nivel de compresión con datos objetivos en lugar de estimaciones.

El autor indica que el codificador de visión del modelo base se deja sin cuantizar, por lo que el modelo conserva capacidades multimodales, y que los embeddings de entrada reciben un tratamiento especial en cada plataforma de inferencia (offload a CPU en exllamav3, cuantización `blockq` en vLLM mediante el plugin `vllm-exl3-plugin`). La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible. El modelo base incluye un codificador de vision, lo que indica una arquitectura multimodal con torre de vision; EXL3 es el formato de cuantizacion, no la arquitectura |
| Parametros totales | Aproximadamente 35 000 millones, segun la nomenclatura del nombre del modelo (no confirmado de forma explicita en la informacion disponible) |
| Parametros activos | Aproximadamente 3000 millones, segun la nomenclatura "A3B" del nombre (no confirmado de forma explicita en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | EXL3 en cinco niveles: 2.08 bpw, 3.08 bpw, 4.08 bpw, 5.08 bpw y 6.08 bpw, cada uno en una revision separada del repositorio |
| Idiomas soportados | No disponible |
| Licencia | MIT (con enlace a la licencia del modelo base) |
| Formato de pesos | EXL3; requiere exllamav3 o vLLM con el plugin vllm-exl3-plugin. Los embeddings de entrada no estan cuantizados y el codificador de vision se mantiene sin cuantizar |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B (relacion: quantized) |
| Tamano del repositorio | 100,7 GB (agregado de todas las revisiones) |
| Descargas | 7 |
| Likes | 0 |
| Fecha de creacion | 21 de septiembre de 2026 |
| Fecha de actualizacion | 21 de septiembre de 2026 |
| Biblioteca declarada | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo unico documentado es el proceso de cuantizacion: los pesos se convierten al formato EXL3, un esquema de cuantizacion por bloques orientado a inferencia eficiente en GPU. El autor indica que los embeddings de entrada no se cuantizan porque EXL3 no es un formato eficiente para ese proposito, y que el codificador de vision se deja intacto para preservar la fidelidad multimodal del modelo base.

No hay datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones arquitectonicas como atencion lineal, decodificacion especulativa o mecanismos de atencion alternativos. La unica innovacion tecnica documentada es la propia cuantizacion y su integracion con dos plataformas de inferencia: exllamav3 (con offload de embeddings a CPU) y vLLM mediante el plugin `vllm-exl3-plugin` (con embeddings cuantizados a formato `blockq` en VRAM). La model card publica graficos de compromiso entre VRAM residente y divergencia KL, y entre VRAM residente y perplejidad.

## Capacidades

- Generacion de texto: el repositorio esta etiquetado con `pipeline_tag: text-generation` y `text-generation`, por lo que el uso previsto es la generacion de texto.
- Procesamiento multimodal: la model card menciona explicitamente un "vision tower" (codificador de vision) en el modelo base, que se conserva sin cuantizar. Esto implica capacidad de entrada de imagenes, aunque no se detalla su alcance.
- Razonamiento de tipo MoE: segun la nomenclatura del nombre, el modelo activaria aproximadamente 3000 millones de parametros por token sobre un total de unos 35 000 millones, lo que seria caracteristico de un modelo de mezcla de expertos. No confirmado en la documentacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas no esta informado en la ficha de HuggingFace.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.
- Despliegue en dos plataformas de inferencia: exllamav3 y vLLM con `vllm-exl3-plugin`, ambas documentadas por el autor.

## Casos de uso

- Despliegue local de un modelo de gran tamano en GPU de consumo: con la revision de 2.08 bpw el checkpoint ocupa 10,83 GiB en disco y consume 9,88 GiB de VRAM en exllamav3, lo que permite ejecutarlo en tarjetas de 12 GB como la RTX 3060 de 12 GB. Es el caso de uso mas directo de esta publicacion.
- Prototipado rapido sin infraestructura de centro de datos: las revisiones de 3.08 y 4.08 bpw (13,79 y 17,77 GiB de VRAM en exllamav3) encajan en GPUs de 16 y 24 GB, lo que permite experimentar con un modelo de ~35B totales en estaciones de trabajo individuales.
- Tareas de vision y texto sobre documentos: dado que el codificador de vision se conserva sin cuantizar, el modelo puede emplearse en escenarios que combinan imagen y texto (por ejemplo, descripcion de figuras o analisis de capturas), manteniendo la fidelidad del componente visual respecto al modelo base.
- Sustitucion de un modelo mayor cuantizado a 4 bits: la revision de 5.08 bpw alcanza un KLD de 0,0190 y una perplejidad de 11,6164 con 21,68 GiB de VRAM en exllamav3, valores muy proximos al suelo de ruido del modelo base (KLD 0,0141; PPL 11,6350), lo que la hace adecuada para entornos donde la fidelidad prima sobre el ahorro de memoria.
- Inferencia en servidor con vLLM: la integracion mediante `vllm-exl3-plugin` permite servir el modelo con embeddings cuantizados en formato `blockq` y codificadores descargados u omitidos, reduciendo la VRAM respecto a exllamav3 (por ejemplo, 9,31 GiB frente a 9,88 GiB en 2.08 bpw).
- Evaluacion comparativa de cuantizaciones: la tabla de fidelidad (KLD y PPL por nivel de bpw) convierte este repositorio en un banco de pruebas util para medir el impacto real de la compresion EXL3 sobre un modelo multimodal concreto.
- Uso comercial sin coste de licencia: al declararse licencia MIT, el artefacto puede redistribuirse e integrarse en productos propietarios, siempre que se respeten las condiciones de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes). Lo unico que se publica son metricas de fidelidad de la cuantizacion respecto al modelo base sin cuantizar:

| Revision (BPW) | Tamano en disco (GiB) | VRAM exllamav3 (GiB) | VRAM vLLM (GiB) | KLD | PPL |
|---|---|---|---|---|---|
| 2.08 | 10,83 | 9,88 | 9,31 | 0,1873 | 12,7288 |
| 3.08 | 14,74 | 13,79 | 13,23 | 0,0653 | 11,8392 |
| 4.08 | 18,71 | 17,77 | 17,20 | 0,0299 | 11,6300 |
| 5.08 | 22,63 | 21,68 | 21,11 | 0,0190 | 11,6164 |
| 6.08 | 26,54 | 25,59 | 25,03 | 0,0158 | 11,6059 |
| Base (sin cuantizar) | 66,97 | No aplica | No aplica | 0,0141 | 11,6350 |

Notas del autor: BPW es la media de bits por peso entre tensores, sin contar embeddings de entrada, codificadores ni la cabeza de salida. Los valores de la fila base corresponden al suelo de ruido, es decir, ninguna cuantizacion puede puntuar de forma significativa mejor que ese valor con estas metricas. La VRAM de vLLM asume embeddings en formato `blockq` y codificadores descargados u omitidos.

## Requisitos de hardware

- VRAM estimada para inferencia, segun revision y plataforma:
  - 2.08 bpw: 9,88 GiB en exllamav3; 9,31 GiB en vLLM.
  - 3.08 bpw: 13,79 GiB en exllamav3; 13,23 GiB en vLLM.
  - 4.08 bpw: 17,77 GiB en exllamav3; 17,20 GiB en vLLM.
  - 5.08 bpw: 21,68 GiB en exllamav3; 21,11 GiB en vLLM.
  - 6.08 bpw: 25,59 GiB en exllamav3; 25,03 GiB en vLLM.
  - Modelo base sin cuantizar: 66,97 GiB en disco.
- Advertencia sobre el calculo: el autor indica que la VRAM real consumida sera inferior al tamano total del checkpoint por el tratamiento de los embeddings de entrada, y que el codificador de vision, al no estar cuantizado, puede anadir un consumo de VRAM significativo. Estas cifras no incluyen el espacio de cache KV; para planificarlo hay que consultar la columna de VRAM correspondiente.
- Cabe en GPU de consumo: la revision de 2.08 bpw (9,88 GiB en exllamav3) es compatible con tarjetas de 12 GB como la RTX 3060 de 12 GB. Las revisiones de 3.08 y 4.08 bpw encajan en GPUs de 16 GB y 24 GB respectivamente (RTX 4080, RTX 3090, RTX 4090), siempre que se reserve espacio adicional para cache KV.
- GPU profesionales: las revisiones de 5.08 y 6.08 bpw (21,68 y 25,59 GiB) requieren GPUs de 24 GB o superiores, o bien aceleradores como A100 o H100 si se necesita atender varias peticiones concurrentes con cache KV amplia.
- Opciones de despliegue: exllamav3 (repositorio `turboderp-org/exllamav3`) y vLLM mediante el plugin `yeasah/vllm-exl3-plugin`. No se documenta compatibilidad con llama.cpp, Ollama ni TGI.
- Estrategias de ahorro de memoria documentadas: offload de embeddings de entrada a CPU en exllamav3; cuantizacion `blockq` de embeddings en vLLM; offload a CPU u omision completa del codificador de vision para casos de uso solo texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables de la misma categoria, por lo que no es posible establecer una comparativa con alternativas externas. La comparacion disponible es interna, entre los distintos niveles de cuantizacion de este mismo repositorio y el modelo base:

| Version | Parametros | Tamano en disco (GiB) | VRAM exllamav3 (GiB) | KLD | PPL | Licencia |
|---|---|---|---|---|---|---|
| EXL3 2.08 bpw | ~35B totales (segun nomenclatura) | 10,83 | 9,88 | 0,1873 | 12,7288 | MIT |
| EXL3 4.08 bpw | ~35B totales (segun nomenclatura) | 18,71 | 17,77 | 0,0299 | 11,6300 | MIT |
| EXL3 6.08 bpw | ~35B totales (segun nomenclatura) | 26,54 | 25,59 | 0,0158 | 11,6059 | MIT |
| Modelo base sin cuantizar | ~35B totales (segun nomenclatura) | 66,97 | No aplica | 0,0141 | 11,6350 | MIT (segun enlace de licencia del modelo base) |

Comparativa con otros modelos de la misma categoria (por ejemplo, otras mezclas de expertos de ~35B totales o cuantizaciones EXL3 alternativas): no disponible.

## Limitaciones y advertencias

- Perdida de fidelidad por cuantizacion: incluso en el nivel mas alto (6.08 bpw) el KLD es de 0,0158 frente al suelo de ruido de 0,0141 del modelo base. En 2.08 bpw el KLD sube a 0,1873 y la perplejidad a 12,7288, un deterioro notable que puede afectar a tareas sensibles a la precision.
- Trazabilidad limitada: el repositorio tiene 7 descargas y 0 likes, sin validacion independiente documentada. No hay evaluaciones de terceros sobre la calidad del modelo cuantizado.
- Dependencia de herramientas concretas: solo se documenta compatibilidad con exllamav3 y vLLM mediante `vllm-exl3-plugin`. No se menciona soporte para llama.cpp, Ollama, TGI u otros runners, lo que limita las opciones de despliegue.
- Consumo adicional por el codificador de vision: al dejarse sin cuantizar, puede representar un componente importante de VRAM. Si no se necesita vision, hay que descargarlo a CPU u omitirlo explicitamente.
- Idiomas soportados: no disponible. No se puede garantizar un rendimiento correcto en castellano ni en otros idiomas distintos del ingles sin evaluacion previa.
- Longitud de contexto: no disponible. Se desconoce si el modelo soporta ventanas largas, lo que impide planificar casos de uso con documentos extensos.
- Sesgos conocidos: no disponible. La model card no incluye ninguna evaluacion de sesgos, seguridad o toxicidad.
- Riesgo de alucinacion: no disponible. No hay datos especificos para este modelo ni para su version cuantizada.
- Restricciones de licencia: la licencia declarada del repositorio es MIT, que permite uso comercial y redistribucion. No obstante, la model card enlaza a la licencia del modelo base (`ornith-ai/Ornith-1.5-35B-A3B`), cuyas condiciones deben verificarse de forma independiente antes de un uso comercial.
- Cache KV no incluida en las cifras: las mediciones de VRAM de la tabla corresponden al modelo, no al espacio de cache KV, que hay que dimensionar aparte.
- Fechas de publicacion: el repositorio esta fechado en septiembre de 2026 y no consta ninguna actualizacion posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yeasah/Ornith-1.5-35B-A3B-exl3
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Revision 2.08 bpw: https://huggingface.co/yeasah/Ornith-1.5-35B-A3B-exl3/tree/2.00bpw-H5
- Revision 3.08 bpw: https://huggingface.co/yeasah/Ornith-1.5-35B-A3B-exl3/tree/3.00bpw-H5
- Revision 4.08 bpw: https://huggingface.co/yeasah/Ornith-1.5-35B-A3B-exl3/tree/4.00bpw
- Revision 5.08 bpw: https://huggingface.co/yeasah/Ornith-1.5-35B-A3B-exl3/tree/5.00bpw
- Revision 6.08 bpw: https://huggingface.co/yeasah/Ornith-1.5-35B-A3B-exl3/tree/6.00bpw
- exllamav3: https://github.com/turboderp-org/exllamav3
- Plugin EXL3 para vLLM: https://github.com/yeasah/vllm-exl3-plugin
- Resultados de la busqueda web: no se han encontrado enlaces relevantes para este modelo; los resultados devueltos correspondian a paginas administrativas de un ayuntamiento sin relacion con el modelo.
