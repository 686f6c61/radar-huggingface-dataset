# zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF

## Resumen

DeepSeek-V4-Flash-0731-DGX-Spark-GGUF es una cuantizacion GGUF del modelo DeepSeek-V4-Flash-0731 (licencia MIT), desarrollada por el usuario zephel01. El objetivo concreto es empaquetar un modelo MoE de aproximadamente 284.000 millones de parametros totales en un unico equipo NVIDIA DGX Spark (SoC GB10 con 128 GB de memoria unificada), preservando los 256 expertos por capa sin poda alguna. El resultado es un archivo de 96,8 GB que combina varios tipos de cuantizacion (IQ2_XS, IQ3_XXS, IQ2_S y MXFP4) con una media de 2,64 bits por peso.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar localmente un modelo de escala frontier en hardware de escritorio de gama alta para IA, algo impensable hace pocos anos. Por otro, es una publicacion en estado BETA: la velocidad declarada para DGX Spark (aproximadamente 26 tok/s) es una estimacion derivada de mediciones de la cuantizacion equivalente de unsloth en un Spark alquilado, no una medicion directa de este archivo.

El modelo base DeepSeek-V4-Flash-0731 es un transformer con mezcla de expertos (MoE) orientado a generacion de texto conversacional, con soporte declarado de ingles y japones. Esta cuantizacion esta pensada para entornos donde la VRAM dedicada es limitada pero se dispone de memoria unificada amplia, y donde prima la fidelidad al modelo original frente a la velocidad pura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); detalles completos de capas y atencion no disponibles |
| Parametros totales | 284.334.567.511 (284,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: IQ2_XS 41%, IQ3_XXS 39%, IQ2_S 18%, MXFP4 2% (por bytes); media de 2,64 bits por peso, equivalente aproximado a IQ2_M |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards en la carpeta L97) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 284.334.567.511 parametros totales. La model card de esta cuantizacion no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el numero de parametros activos por token, por lo que esos datos deben consultarse en la model card del modelo original de DeepSeek. Si se confirma que se conservan los 256 expertos por capa (la model card afirma que no se ha podado ninguno), el modelo mantiene la misma topologia que el original.

El proceso de cuantizacion lo realiza la herramienta trench-gguf del propio autor, partiendo de los GGUF publicados por unsloth (unsloth/DeepSeek-V4-Flash-0731-GGUF). Se aplica una estrategia de tipos mixtos por experto en lugar de un unico tipo uniforme: los expertos se reparten entre IQ2_XS, IQ3_XXS, IQ2_S y MXFP4, con una media de 2,64 bits por peso. La model card menciona el uso de imatrix (matriz de importancia) como parte del pipeline, lo que permite asignar mas bits a los pesos mas sensibles. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y japones.
- Razonamiento y respuesta a instrucciones propias de un modelo de gran escala, heredadas del modelo base DeepSeek-V4-Flash-0731.
- Capacidad multilingue limitada a los idiomas declarados (en, ja); el resto de idiomas no esta garantizado.
- Soporte de decodificacion especulativa mediante el drafter DSpark (6,5 GB), recomendado en DGX Spark para mejorar el throughput.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling nativo ni modo de razonamiento explicito (thinking mode) para esta cuantizacion concreta.

## Casos de uso

- Inferencia local en un unico DGX Spark: el caso de uso principal. El archivo de 96,8 GB cabe en los 128 GB de memoria unificada del GB10 dejando margen para el contexto y el drafter DSpark, lo que permite ejecutar un modelo de 284.000 millones de parametros en un equipo de sobremesa sin GPU dedicada de gran VRAM.
- Asistente conversacional en japones e ingles: el modelo esta evaluado especificamente en japones (KL de 0,145 en 3 secuencias) y mantiene un 84,1% de coincidencia en el token superior respecto al original, lo que lo hace util para atencion al usuario bilingue en esos dos idiomas.
- Prototipado de aplicaciones sobre modelos de gran escala sin coste de API: al ser MIT y ejecutable localmente, permite iterar en pipelines de generacion de texto sin dependencia de proveedores externos.
- Investigacion sobre cuantizacion extrema: el archivo sirve como referencia reproducible para estudiar el impacto de la cuantizacion mixta a 2,64 bits en un MoE de gran tamano, con metricas KL publicadas frente a la cuantizacion de unsloth.
- Despliegue en PC con RTX 5090 y 96 GB de RAM: el mismo archivo (en el repo IQ2_M-32G96G) alcanza 69,1 tok/s medidos, lo que lo hace viable para generacion interactiva en estaciones de trabajo con GPU consumer de gama alta y RAM abundante.
- Evaluacion comparativa de cuantizaciones: los datos de KL (0,150 frente a 0,186 en ingles y 0,145 frente a 0,219 en japones) permiten comparar estrategias de cuantizacion en condiciones controladas.
- Generacion de codigo y texto tecnico: la model card incluye una secuencia de codigo en el conjunto de evaluacion KL, lo que sugiere uso en tareas de programacion, aunque no se publican resultados de HumanEval ni similares.

## Benchmarks y rendimiento

| Metrica | Este archivo (L97) | unsloth UD-Q2_K_XL (referencia) |
|---|---|---|
| Tamano de descarga | 96,8 GB | 96,8 GB |
| Expertos conservados | Todos (256, sin poda) | Todos |
| KL (12 secuencias: 8 ingles, 1 codigo, 3 japones) | 0,150 | 0,186 |
| KL en japones (3 secuencias) | 0,145 | 0,219 |
| Coincidencia en el token superior | 84,1% | 81,5% |
| Decodificacion en DGX Spark | ~26 tok/s (estimacion, no medida) | 26,0 tok/s con drafter DSpark (medido, Abyss v1.3.119) |
| Decodificacion en RTX 5090 + 96 GB RAM | 69,1 tok/s | no disponible |
| Prueba Abyss `--check` (RTX 5090) | 10 de 11 superadas | no disponible |

La metrica KL se calcula contra la cuantizacion UD-Q8_K_XL de unsloth (expertos MXFP4 originales). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 96,8 GB de pesos mas el espacio para contexto y el drafter DSpark (6,5 GB adicionales). En DGX Spark (128 GB unificados) cabe con margen.
- GPU recomendadas: NVIDIA DGX Spark (GB10, sm_121, aarch64) es el objetivo principal; RTX 5090 con 96 GB de RAM de sistema para la variante 32G96G.
- Cabe en GPU consumer: si, en RTX 5090 (32 GB VRAM) siempre que se disponga de al menos 96 GB de RAM y se use offload; en GPUs de 16 GB o 32 GB con menos RAM hay variantes especificas mas pequenas (IQ1_S con 61,7 GB, IQ2_XXS con 72,0 GB).
- Opciones de despliegue: Abyss (motor del autor, con soporte documentado para DGX Spark en docs/DGX-SPARK.md); llama.cpp por ser formato GGUF estandar; no se documentan en la informacion disponible otros motores como vLLM, TGI u Ollama.
- Latencia y throughput: ~26 tok/s estimados en DGX Spark (sin medir); 69,1 tok/s medidos en RTX 5090 + 96 GB RAM; 26,0 tok/s medidos con unsloth UD-Q2_K_XL y drafter DSpark en Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este archivo (L97) | 284,3 mil M (MoE) | no disponible | GGUF mixto (2,64 bits/peso) | MIT | Todos los expertos, KL 0,150 |
| unsloth UD-Q2_K_XL | 284,3 mil M (MoE) | no disponible | GGUF | MIT | Mismo tamano, KL 0,186, 26,0 tok/s medidos en Spark |
| zephel01 IQ2_M-32G96G (L97) | 284,3 mil M (MoE) | no disponible | GGUF mixto | MIT | Mismo archivo, orientado a PC con 32 GB GPU + 96 GB RAM |
| zephel01 IQ2_XXS-32G64G | 284,3 mil M (MoE) | no disponible | GGUF | MIT | 72,0 GB, menor calidad, para 32 GB GPU + 64 GB RAM |
| zephel01 IQ1_S-16G64G | 284,3 mil M (MoE) | no disponible | GGUF | MIT | 61,7 GB, la variante mas pequena, para 16 GB GPU + 64 GB RAM |

No se dispone de datos en la informacion proporcionada para comparar con modelos de otros desarrolladores de tamano o categoria equivalente.

## Limitaciones y advertencias

- Estado BETA: la velocidad en DGX Spark es una estimacion basada en un archivo de igual tamano medido en un Spark alquilado; este archivo no se ha ejecutado aun en un Spark real.
- Riesgo de cambio de idioma: el modelo base a veces responde en chino a preguntas en japones (6 de 24 respuestas en el original; 11 de 24 en L97). Se recomienda incluir "answer in Japanese" en el system prompt, lo que reduce el fallo a 1 de 24.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, pero al ser una cuantizacion extrema de 2,64 bits por peso puede amplificar errores del modelo base.
- Alucinacion: no se publican tasas de alucinacion; la cuantizacion agresiva puede incrementar la degradacion en tareas de razonamiento largo.
- Limitaciones de contexto: la longitud de contexto soportada no esta documentada; el margen de memoria en DGX Spark condiciona el tamano maximo de contexto utilizable.
- Idiomas: solo ingles y japones declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- Licencia MIT: permite uso comercial, pero debe conservarse el aviso de copyright y no se ofrece garantia alguna.
- Prueba Abyss `--check`: 10 de 11 superadas en RTX 5090; el fallo corresponde a una explicacion en japones respondida en chino.
- No usar como referencia de rendimiento en produccion sin medir previamente en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- GGUF de origen (unsloth): https://huggingface.co/unsloth/DeepSeek-V4-Flash-0731-GGUF
- Variante IQ2_M-32G96G (mismo archivo): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Variante IQ2_XXS-32G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Variante IQ1_S-16G64G: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Motor Abyss: https://github.com/zephel01/Abyss
- Documentacion DGX Spark de Abyss: https://github.com/zephel01/Abyss/blob/main/docs/DGX-SPARK.md
- Herramienta de cuantizacion trench-gguf: https://github.com/zephel01/trench-gguf
- Formulario de benchmark: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+DGX-Spark+L97+on+GB10
- Issues de Abyss: https://github.com/zephel01/Abyss/issues
