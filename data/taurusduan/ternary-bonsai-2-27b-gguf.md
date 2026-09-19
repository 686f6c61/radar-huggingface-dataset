# taurusduan/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary-Bonsai-2-27B es un modelo de lenguaje de 27B derivado de Qwen3.8-27B y redistribuido en pesos ternarios para llama.cpp. Lo desarrolla Prism ML (los recursos de la model card apuntan a prismml.com y a los repositorios de la organizacion PrismML-Eng), y esta publicacion concreta en HuggingFace corre a cargo del usuario taurusduan, que redistribuye los GGUF. El objetivo del modelo es claro: mantener el razonamiento de un transformer de 27B en un fichero de entre 5,95 GB y 7,21 GB, apto para un portatil o una sola GPU, aplicando cuantizacion ternaria a todas las matrices de lenguaje, incluidas embeddings, proyecciones de atencion, proyecciones MLP y la cabeza LM, sin capas de escape en alta precision.

La relevancia tecnica esta en el regimen de bits: segun el autor, el modelo conserva el 98,2% de la inteligencia del modelo en FP16 (media de 84,78 en 14 benchmarks en modo thinking) con 1,72 bits por peso efectivos, frente a los 72,59 de una build IQ2_XXS convencional. Ademas conserva comportamiento agentico y de razonamiento (tool calling agentico en 74,92) en una franja sub-4-bit donde las representaciones de bajo bit convencionales suelen degradarse. El backbone es de atencion hibrida, con aproximadamente un 75% de atencion lineal y un 25% de atencion completa, lo que permite declarar 262.000 tokens de contexto en dispositivo.

El modelo se distribuye exclusivamente en GGUF y requiere kernels ternarios propios: las builds estandar de llama.cpp no consumen este formato, y el autor publica un fork con soporte CUDA y Metal. Existe tambien una version acompanante en MLX para Apple Silicon. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atencion hibrida (~75% atencion lineal / ~25% atencion completa), MLP SwiGLU, RoPE, RMSNorm; 64 bloques en el backbone de lenguaje y 27 bloques en la torre de vision |
| Parametros totales | 27,36 B segun la model card (24,35 B backbone de lenguaje + 2,54 B embeddings y cabeza LM + 0,46 B torre de vision); el recuento de safetensors del repositorio indica 26.895.998.464 (~26,9 B), discrepancia no explicada en la informacion disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | PTQ1_0 ternaria densa (1,75 bits/peso, 5,95 GB) y PQ2_0 (2,13 bits/peso, 7,21 GB); proyector de vision mmproj en Q8_0 (~0,63 GB); formato ternario g128 con escala FP16 compartida cada 128 pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con kernels ternarios personalizados para CUDA y Metal |
| Base del modelo | Qwen/Qwen3.8-27B (arquitectura sin cambios) |
| Backends declarados | llama.cpp (CUDA, Metal, CPU) |
| Tamano del repositorio | 68,5 GB en HuggingFace (incluye los empaquetados PTQ1_0 y PQ2_0) |
| Descargas / likes | 72 descargas, 0 likes |
| Fecha de publicacion | 19 de septiembre de 2026 (fecha declarada en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.8-27B sin modificaciones estructurales: un transformer causal con backbone de atencion hibrida en el que aproximadamente el 75% de las capas usan atencion lineal y el 25% restante atencion completa, MLP con activacion SwiGLU, normalizacion RMSNorm y codificacion posicional RoPE. El modelo se organiza en 64 bloques para el backbone de lenguaje, mas 2,54 B de parametros repartidos entre embeddings y cabeza LM, mas una torre de vision de 27 bloques y 0,46 B de parametros que se distribuye aparte como paquete mmproj en Q8_0 y solo se carga cuando hay entrada de imagen.

Lo especifico de esta publicacion es la representacion de pesos, no el entrenamiento. Cada peso toma un valor de {-1, 0, +1} con un unico factor de escala FP16 por grupo de 128 pesos (ternario g128). Un trit transporta log2(3) = 1,585 bits de informacion, de modo que el coste efectivo del formato es de aproximadamente 1,71 bits por peso contando el codigo ternario mas la escala amortizada; el modelo completo queda en 1,72 bits por peso, lo que supone una reduccion idealizada de unas 9,3 veces frente a FP16. Los pesos se almacenan en una base rotada: cada matriz se transforma blockwise con una rotacion ortogonal de Hadamard (bloque 1024, signos fijos +/-1) antes de la asignacion ternaria, y el runtime aplica la transformada correspondiente a las activaciones. La rotacion queda plegada en los pesos almacenados, sin bits ni trafico adicional, y el fichero GGUF declara la rotacion como metadato, de forma que un runtime o aplica la transformacion correcta o rechaza el fichero. No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO: el proceso descrito es de cuantizacion post-entrenamiento (PTQ) sobre el modelo base.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado de text-generation.
- Razonamiento en modo thinking: la model card reporta resultados especificamente sobre 14 benchmarks en modo thinking.
- Matematicas: 96,57 en la metrica agregada de matematicas, a menos de medio punto de la precision completa segun el autor.
- Generacion de codigo: 89,42, al mismo nivel que la linea base en FP16 segun el autor.
- Tool calling y comportamiento agentico: 74,92 en la metrica de tool calling agentico, retenido en el regimen ternario.
- Razonamiento multi-paso derivado del modo thinking y del soporte agentico declarado.
- Vision: la torre de vision se distribuye como paquete mmproj Q8_0 opcional (~0,63 GB) y se carga solo para entrada de imagen.
- Contexto largo: 262.000 tokens, viable en dispositivo gracias al backbone mayoritariamente de atencion lineal.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de razonamiento en portatil: con 5,95 GB en PTQ1_0, el modelo cabe en un equipo de consumo y mantiene modo thinking, lo que permite usarlo como asistente local de analisis y resolucion de problemas sin conexion a servicios en la nube.
- Agentes con tool calling en local: el modelo conserva la metrica agentica (74,92) en representacion ternaria, de modo que puede encadenar llamadas a herramientas en flujos multi-paso ejecutados en la propia maquina, sin enviar datos a terceros.
- Generacion y revision de codigo en el puesto de trabajo: con 89,42 en la metrica de codigo, es viable integrarlo en editores y pre-commit hooks para autocompletado y revision de parches en un equipo con GPU de gama media.
- Analisis de documentos largos: los 262.000 tokens de contexto permiten procesar contratos, informes tecnicos o bases de codigo extensas en una sola pasada, sin trocear el material y perder coherencia entre fragmentos.
- Procesamiento de documentos con imagen: cargando el paquete mmproj Q8_0, el modelo puede abordar tareas de transcripcion y comprension de documentos escaneados combinando vision y texto en el mismo contexto.
- Investigacion sobre cuantizacion extrema de bajo bit: el modelo y sus forks de kernels son un banco de pruebas directo para estudiar el comportamiento de representaciones ternarias con rotacion Hadamard en tareas de razonamiento, matematica y agenticas.
- Despliegue en borde o entornos aislados: al requerir solo 5,95-7,21 GB de pesos y funcionar sobre CPU, CUDA o Metal, encaja en estaciones de trabajo sin acceso a internet o con requisitos de soberania de datos.
- Tutoria y explicacion de matematicas paso a paso: la retencion declarada en matematicas (96,57) permite generar resoluciones detalladas y justificadas, aprovechando el modo thinking para exponer el razonamiento intermedio.

## Benchmarks y rendimiento

Los datos disponibles son agregados publicados por el autor en la model card y el whitepaper. No se detalla el desglose de los 14 benchmarks individuales.

| Metrica | Ternary-Bonsai-2-27B (PTQ1_0) | Build IQ2_XXS convencional | Build UD-Q4_K_XL | FP16 (base) |
|---|---|---|---|---|
| Media en 14 benchmarks (modo thinking) | 84,78 | 72,59 | 84,78-85,18 (a menos de 0,4 puntos por encima, valor exacto no publicado) | referencia (98,2% retenido por PTQ1_0) |
| Matematicas | 96,57 | no disponible | no disponible | a menos de 0,5 puntos por encima |
| Codigo | 89,42 | no disponible | no disponible | mismo nivel, valor exacto no disponible |
| Tool calling agentico | 74,92 | no disponible | no disponible | no disponible |
| Tamano | 5,95 GB (1,75 bits/peso) | superior a ~8,9 GB (PTQ1_0 ocupa menos de dos tercios de su huella) | ~17,9 GB (tres veces la huella de PTQ1_0) | ~54 GB |

Rendimiento de inferencia declarado: aproximadamente 47 tokens por segundo en un portatil Apple M5 Max. No hay datos publicados de throughput en GPU ni de latencia por peticion.

## Requisitos de hardware

- Pesos en disco: 5,95 GB en PTQ1_0 y 7,21 GB en PQ2_0. El proyector de vision anade 0,63 GB y solo es necesario si se usa entrada de imagen.
- VRAM estimada para inferencia: a partir del tamano de pesos declarado, la horquilla practica arranca en torno a 7-9 GB con PTQ1_0 y contexto corto, y 8-10 GB con PQ2_0. El KV cache de 262.000 tokens no tiene cifra publicada; el backbone con ~75% de atencion lineal reduce su coste frente a un transformer denso equivalente, pero sigue creciendo con la longitud de contexto. Estas cifras son estimaciones derivadas del tamano de pesos, no medidas publicadas.
- GPU de consumo: el modelo esta pensado explicitamente para una sola GPU o un portatil. Cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y en Apple Silicon con Metal, con el dato declarado de ~47 tok/s en un M5 Max.
- GPU de datacenter: A100 y H100 son utilizables para servir varias instancias o contextos muy largos, dado el reducido peso de los parametros. No hay cifras publicadas de throughput agregado en estas GPUs.
- CPU: el backend declarado incluye CPU ademas de CUDA y Metal.
- Opciones de despliegue: llama.cpp mediante el fork de PrismML-Eng con kernels ternarios (CUDA y Metal); en Apple Silicon existe ademas el fork de MLX y el fork de mlx-swift para iOS y macOS. No consta soporte en vLLM, TGI, Ollama ni otros servidores de inferencia.
- Latencia y throughput: solo se ha publicado el dato de ~47 tok/s en Apple M5 Max. No hay datos de time-to-first-token ni de rendimiento bajo batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media en 14 benchmarks (thinking) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B PTQ1_0 | 27,36 B | 262K | 84,78 | 5,95 GB | Apache 2.0 | GGUF en HuggingFace, requiere fork de llama.cpp |
| Ternary-Bonsai-2-27B PQ2_0 | 27,36 B | 262K | no disponible (mismo modelo, empaquetado de 2 bits por trit) | 7,21 GB | Apache 2.0 | GGUF en HuggingFace, requiere fork de llama.cpp |
| Ternary-Bonsai-2-27B-mlx-2bit | 27,36 B | 262K | no disponible | no disponible | no disponible | MLX, repositorio prism-ml |
| Build IQ2_XXS del mismo base | 27,36 B | 262K | 72,59 | superior a ~8,9 GB (derivado) | Apache 2.0 (base) | llama.cpp estandar |
| Build UD-Q4_K_XL del mismo base | 27,36 B | 262K | 84,78-85,18 (derivado) | ~17,9 GB (derivado) | Apache 2.0 (base) | llama.cpp estandar |
| Qwen3.8-27B en FP16 | 27,36 B | 262K | referencia (98,2% retenido por PTQ1_0) | ~54 GB | no disponible | pesos originales |

No se dispone de datos en la informacion proporcionada para comparar con modelos de otros fabricantes de tamano o categoria equivalentes.

## Limitaciones y advertencias

- Dependencia de un fork: el modelo no carga en llama.cpp estandar. Requiere los kernels ternarios de PrismML-Eng (CUDA y Metal) o los forks de MLX y mlx-swift. Esto limita el ecosistema de herramientas disponible y complica el mantenimiento a largo plazo.
- Cobertura de benchmarks limitada: todos los resultados publicados provienen del autor y se resumen en medias agregadas sobre 14 benchmarks en modo thinking. No hay desglose por tarea, evaluaciones independientes ni pruebas de robustez fuera de ese conjunto.
- Riesgo de degradacion en tareas fuera de la distribucion evaluada: con 1,72 bits por peso efectivos, la retencion declarada puede no extrapolarse a dominios poco representados en los benchmarks, especialmente en tareas que exigen precision numerica o factual fina.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion ni evaluaciones de veracidad. Como cualquier modelo de lenguaje, puede generar contenido incorrecto con apariencia de solidez, y su modo thinking no garantiza correccion.
- Idiomas: la lista de idiomas soportados no esta disponible en la informacion proporcionada. No puede asumirse un rendimiento multilingue equivalente al del modelo base sin verificacion.
- Discrepancia en el recuento de parametros: la model card declara 27,36 B mientras que el recuento de safetensors del repositorio indica ~26,9 B. Conviene verificar la cifra antes de citarla.
- Repositorio con validacion minima: 72 descargas y 0 likes, con fecha de creacion y actualizacion identicas, sin historial de revisiones visible. La publicacion la realiza un tercero (taurusduan) sobre recursos de Prism ML, por lo que la trazabilidad de los ficheros no queda garantizada por el autor original.
- Vision opcional: la torre de vision no esta incluida en los pesos principales; requiere descargar y cargar el paquete mmproj Q8_0 aparte.
- Licencia: Apache 2.0 permite uso comercial, pero no se especifica en la informacion disponible la licencia del modelo base Qwen3.8-27B, lo que conviene comprobar antes de un despliegue comercial.
- Fechas: el repositorio declara una fecha de creacion de septiembre de 2026, posterior a la fecha de esta ficha. Debe verificarse la coherencia temporal de la publicacion.
- Sin datos de latencia en produccion: no hay cifras de time-to-first-token, throughput bajo batching ni comportamiento con KV cache a 262.000 tokens.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/Ternary-Bonsai-2-27B-gguf
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- Version MLX para Apple Silicon: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA y Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS y macOS): https://github.com/PrismML-Eng/mlx-swift
- Discord de la comunidad: https://discord.gg/prismml

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces validos son los procedentes del repositorio de HuggingFace.
