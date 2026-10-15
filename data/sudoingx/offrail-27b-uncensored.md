# sudoingx/Offrail-27B-Uncensored

## Resumen

Offrail-27B-Uncensored es una publicacion de pesos GGUF creada por el usuario sudoingx a partir de Ternary Bonsai 2 27B, la version sin censura que OS-Software genero aplicando un LoRA Heretic (rango 128, capas 27-44) sobre los codigos ternarios oficiales del modelo. Sobre ese cuerpo, sudoingx injerta de nuevo la cabecera de prediccion multi-token (MTP) de Qwen 3.8 27B como bloque 64, de modo que el fork de llama.cpp de PrismML puede ejecutar `--spec-type draft-mtp` y acelerar la decodificacion especulativa. El resultado son dos ficheros GGUF pensados para tarjetas de 8 GB y 12 GB de VRAM.

El modelo resuelve dos problemas concretos: por un lado, ejecutar un transformer de 27B en GPUs de gama consumer mediante cuantizacion ternaria PTQ1_0 a aproximadamente 1,75 bits por peso; por otro, recuperar velocidad con decodificacion especulativa sin necesidad de un modelo borrador separado, porque la cabecera MTP viaja dentro del mismo fichero. En una RTX 3060 de 12 GB los ficheros alcanzan 50,8 tok/s (12G) y 49,6 tok/s (8G) a 131.072 tokens de contexto, frente a 41,4 tok/s con la cabecera desactivada.

Es relevante porque combina tres piezas poco habituales: cuantizacion ternaria, un ajuste sin censura y una cabecera MTP injertada, todo con salida greedy byte a byte identica entre cabecera activada y desactivada cuando se activa `GGML_CUDA_BATCH_INVARIANT=1`. El coste es una dependencia fuerte de un fork concreto de llama.cpp: el llama.cpp estandar no puede leer PTQ1_0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con cuantizacion ternaria PTQ1_0 y cabecera de prediccion multi-token (MTP) injertada como bloque 64 |
| Parametros totales | 27B (nominal, segun el nombre y los modelos base declarados) |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | 131.072 tokens en los ficheros de 12 GB y 8 GB; el fichero de 8 GB cabe a 49.152 tokens (7.732 MiB) y a 32.768 tokens (7.300 MiB) en 8 GB de VRAM |
| Tipos de cuantizacion | PTQ1_0 ternario (~1,75 bpw) en los pesos; cache K/V en q4_0; codigos ternarios PQ2_0 en el cuerpo original de Bonsai 2 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria llama.cpp); requiere el fork de PrismML, llama.cpp estandar no lee PTQ1_0 |

## Arquitectura y entrenamiento

El cuerpo del modelo no es original de sudoingx: procede de Ternary Bonsai 2 27B, un transformer de 27B cuantizado a codigos ternarios PTQ1_0 (fichero base de 5,95 GB) por PrismML. OS-Software aplico despues un LoRA Heretic de rango 128 sobre las capas 27-44, lo integro en los codigos ternarios PQ2_0 oficiales conservando las escalas de bloque y publico el resultado como un merge aproximado. La evaluacion de ese ajuste la aporta OS-Software, no el autor de este repositorio: 0/100 rechazos frente a 95/100 del original, divergencia KL de 0,0135 y perplejidad de 10,1435 en WikiText-2.

La aportacion tecnica de Offrail-27B es el injerto de la cabecera MTP de Qwen/Qwen3.8-27B como bloque 64, mas las herramientas de injerto y el kernel mat-vec para PTQ1_0 (PR PrismML-Eng/llama.cpp#218) sobre el fork de PrismML. El grafo MTP y el interruptor `GGML_CUDA_BATCH_INVARIANT` pertenecen a ese fork. No consta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO; la unica adaptacion descrita es el LoRA Heretic citado.

## Capacidades

- Generacion de texto en tres dominios medidos explicitamente en la model card: codigo, prosa y bash/shell.
- Decodificacion especulativa integrada mediante cabecera MTP (`--spec-type draft-mtp`), con tasas de aceptacion de borradores de 0,91 en codigo, 0,76 en bash y 0,55 en prosa (fichero de 8 GB, greedy).
- Salida greedy reproducible: con `GGML_CUDA_BATCH_INVARIANT=1`, el texto con cabecera activada es identico byte a byte al texto con la cabecera desactivada.
- Control de esfuerzo de razonamiento mediante `--reasoning-effort medium` en el servidor de llama.cpp.
- Contexto largo de hasta 131.072 tokens con cache K/V cuantizada a q4_0.
- Plantilla de chat compatible con Jinja (`--jinja`).
- Vision opcional: la model card indica que se puede anadir `--mmproj` con el mmproj del repositorio de OS-Software, aunque el enlace aparece truncado en la informacion disponible.
- Comportamiento sin censura segun la medicion de terceros citada (0/100 rechazos).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Inferencia local en GPUs de 8 GB: con `Offrail-27B-8G.gguf`, `-c 49152 -ub 256 --spec-draft-n-max 2` y 7.732 MiB de VRAM tras la carga, un equipo con una RTX 3060 de 8 GB puede servir un modelo de 27B a 49,8 tok/s sin depender de la nube.
- Despliegue en escritorio con GPU de 12 GB: `Offrail-27B-12G.gguf` a 50,8 tok/s y 10.618 MiB de VRAM, suficiente para dejar margen a otras aplicaciones si se reduce la ventana de contexto.
- Generacion de codigo en local: es el dominio con mejor tasa de aceptacion de borradores (0,91-0,92) y el mayor incremento por la cabecera MTP (+32% en el fichero de 8 GB), lo que lo hace adecuado para autocompletado y generacion de funciones en editores conectados a un endpoint local de llama.cpp.
- Automatizacion de shell y scripting: el dominio bash rinde 49,8 tok/s con una aceptacion de 0,76, util para asistentes que traducen instrucciones en lenguaje natural a comandos de terminal.
- Redaccion y reescritura de texto en local: la prosa tiene la aceptacion mas baja (0,55-0,61) y el menor incremento por la cabecera, pero sigue siendo viable para tareas de redaccion sin envio de datos a terceros.
- Procesamiento de documentos largos: con 131.072 tokens de contexto se pueden cargar manuales, expedientes o bases de codigo extensas en una sola pasada, sin troceado ni recuperacion externa.
- Escenarios que requieren material sin censura: generacion de ficcion, roleplay o contenidos que otros modelos rechazan, con la advertencia de que la unica evidencia de desbloqueo es la medicion de OS-Software, no una evaluacion propia del autor.
- Investigacion sobre cuantizacion ternaria y decodificacion especulativa: los ficheros permiten reproducir las mediciones de tok/s, aceptacion de borradores y uso de VRAM en una unica GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos aportados son de throughput, uso de VRAM y aceptacion de borradores, medidos en una RTX 3060 de 12 GB, un slot, thinking off, K/V en q4_0, flash attention activada, con `GGML_CUDA_BATCH_INVARIANT=1` y medianas de `probe.py` (3 prompts x 3 ejecuciones, 400 tokens).

| Archivo | Ventana | Cabecera draft | Global (tok/s) | Codigo | Prosa | Bash | VRAM tras carga |
|---|---:|---|---:|---:|---:|---:|---:|
| 12G | 131.072 | off | 41,4 | 41,4 | 41,5 | 41,2 | 8.734 MiB |
| 12G | 131.072 | draft-mtp, n-max 1 | 50,8 | 55,4 | 45,5 | 50,2 | 10.618 MiB |
| 8G | 131.072 | off | 41,4 | 41,4 | 41,6 | 41,4 | 8.734 MiB |
| 8G | 131.072 | draft-mtp, n-max 1 | 49,6 | 54,6 | 44,0 | 49,6 | 9.936 MiB |
| 8G | 65.536 | draft-mtp, n-max 2 | 48,4 | 56,0 | 35,4 | 48,4 | 8.294 MiB |
| 8G | 49.152, ubatch 256 | draft-mtp, n-max 2 | 49,8 | 57,4 | 35,9 | 49,8 | 7.732 MiB |
| 8G | 32.768, ubatch 256 | draft-mtp, n-max 2 | no probado | | | | 7.300 MiB |

Aceptacion de borradores en ejecuciones greedy (temperatura 0, top_k 1, 300 tokens): codigo 0,91 (142/156), bash 0,76 (129/170) y prosa 0,55 (68/123) en el fichero de 8 GB; 0,92 / 0,79 / 0,61 en el de 12 GB. Metricas de calidad citadas de fuentes ajenas: 0/100 rechazos frente a 95/100 del modelo original, divergencia KL 0,0135 y perplejidad WikiText-2 de 10,1435.

## Requisitos de hardware

- VRAM minima observada: 7.300 MiB para el fichero de 8 GB con contexto de 32.768 tokens; 7.732 MiB con 49.152 tokens y ubatch 256; 10.618 MiB para el fichero de 12 GB con 131.072 tokens y cabecera MTP activa.
- En 8 GB de VRAM: 48K de contexto entra (7.732 MiB) y 64K no entra (8.294 MiB). Con 32K quedan 7.300 MiB, la opcion recomendada si el escritorio tambien usa la tarjeta.
- GPU verificada: RTX 3060 de 12 GB. Los ficheros estan dimensionados explicitamente para tarjetas de 8 GB y 12 GB.
- Caveat de Turing: en RTX 20 el interruptor `GGML_CUDA_BATCH_INVARIANT` no cubre todos los kernels, por lo que un empate cercano puede cambiar un token de forma tardia.
- Despliegue: llama.cpp con el fork de PrismML o la rama `bonsai2` de github.com/sudoingX/llama.cpp (kernel PTQ1_0 mas correcciones MTP); el fichero de 8 GB necesita ademas la correccion Hadamard de 15 lineas para el MTP de qwen35 (PR #217 o #205). Stock llama.cpp no puede leer estos ficheros.
- Bundle precompilado con ambas piezas: sudoingX/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF.
- Lanzamiento de referencia en 12 GB: `llama-server -m Offrail-27B-12G.gguf -ngl 99 -fa on -c 131072 -np 1 -ctk q4_0 -ctv q4_0 --jinja --reasoning-effort medium --spec-type draft-mtp --spec-draft-n-max 1` con `GGML_CUDA_BATCH_INVARIANT=1`.
- Throughput medido: 50,8 tok/s en la RTX 3060 de 12 GB con la cabecera MTP activada, frente a 41,4 tok/s con la cabecera desactivada; el injerto aporta +23% en el fichero de 12 GB y +20% en el de 8 GB.
- Opciones de despliegue distintas de llama.cpp (vLLM, Ollama, TGI): no disponibles en la informacion proporcionada.
- Tamano de los ficheros: `Offrail-27B-12G.gguf` ocupa 7.012.820.544 bytes (7,0 GB) y `Offrail-27B-8G.gguf` 6.297.658.848 bytes (6,3 GB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Offrail-27B-Uncensored (12G / 8G) | 27B | 131.072 tokens | GGUF PTQ1_0 ternario con cabecera MTP | apache-2.0 | HuggingFace, requiere fork de PrismML |
| OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | 27B | no disponible | GGUF ternario, sin cabecera MTP | no disponible | HuggingFace |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | GGUF ternario (cuerpo base de 5,95 GB, 1,75 bpw) | no disponible | HuggingFace |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors (fp16), segun el uso descrito de la cabecera MTP | no disponible | HuggingFace |

La diferencia funcional medible entre Offrail-27B y su cuerpo base es la cabecera MTP injertada: +23% de throughput en el fichero de 12 GB y +20% en el de 8 GB, con salida greedy identica y sin coste de velocidad atribuible al ajuste sin censura (41,4 tok/s con la cabecera desactivada, frente a 41,3 del injerto base citado en la model card). No hay datos de benchmarks de calidad que permitan comparar con alternativas de 27B no ternarias.

## Limitaciones y advertencias

- Modelo sin censura: la intencion declarada es que no rechace peticiones. No existe una evaluacion de rechazos propia de sudoingx; la cifra de 0/100 proviene de OS-Software y no se ha replicado (HarmBench requiere una segunda GPU para el modelo juez).
- Sin benchmarks de calidad publicados: no hay MMLU, HumanEval ni GSM8K, ni comparacion con modelos de 27B en fp16, por lo que el impacto del ajuste Heretic y de la cuantizacion ternaria en tareas de razonamiento es desconocido.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje y no cuantificado en la informacion disponible; se agrava en un modelo ajustado para no rechazar, que puede responder con seguridad a peticiones fuera de su conocimiento.
- Cuantizacion agresiva: 1,75 bpw sobre codigos ternarios impone una perdida de precision no medida en tareas de razonamiento. El propio autor senala que la prosa es el punto debil de la cabecera MTP porque fue entrenada por Qwen contra estados ocultos en fp16 y aqui lee un tronco ternario.
- Dependencia estricta de un fork: los ficheros no funcionan con llama.cpp estandar; hay que usar el fork de PrismML o la rama `bonsai2` de sudoingX, y el fichero de 8 GB necesita ademas la correccion Hadamard del PR #217 o #205.
- Reproducibilidad de la salida: sin `GGML_CUDA_BATCH_INVARIANT=1`, la verificacion por lotes altera el orden de reduccion en coma flotante y el texto puede diferir en empates cercanos. En Turing (RTX 20) el interruptor no cubre todos los kernels. El muestreo con temperatura 1,0, top_p 0,95 y top_k 20 no se ve afectado porque cada token borrador se verifica contra el modelo objetivo.
- Idiomas soportados sin declarar: no hay lista de idiomas en la model card, por lo que el rendimiento fuera del ingles es desconocido.
- Procedencia compuesta: el cuerpo es un merge descrito por su autor como aproximado, la cabecera MTP es de Qwen y el desbloqueo es de OS-Software; la licencia declarada del repositorio es apache-2.0, pero no se detallan en la informacion disponible las condiciones de los componentes de terceros ni las restricciones de uso comercial de los modelos base.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, repositorio creado y actualizado el 15 de octubre de 2026.
- Fecha de creacion inusual (2026) tal como figura en los metadatos de HuggingFace.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/sudoingx/Offrail-27B-Uncensored
- Bundle precompilado con kernel y correcciones MTP: https://huggingface.co/sudoingx/Ternary-Bonsai-2-27B-PTQ1_0-MTP-GGUF
- Modelo base sin censura: https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base de la cabecera MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp con la rama `bonsai2`: https://github.com/sudoingX/llama.cpp
- Kernel mat-vec PTQ1_0: https://github.com/PrismML-Eng/llama.cpp/pull/218
- Correccion Hadamard para el MTP de qwen35: https://github.com/PrismML-Eng/llama.cpp/pull/217
- Variante de la misma correccion: https://github.com/PrismML-Eng/llama.cpp/pull/205
- Busquedas web: no se encontraron resultados relevantes sobre este modelo; las consultas devolvieron contenido sin relacion (foros de videojuegos).
