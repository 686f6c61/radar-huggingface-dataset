# TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ6-mtp

## Resumen

Ternary-Bonsai-2-27B-MLX-oQ6-mtp es una cuantizacion de precision mixta en formato MLX del modelo ternario Ternary-Bonsai-2-27B, publicada por el usuario TokenAI-zer. El modelo original procede de prism-ml, que ternarizo un VLM de 27B de la familia Qwen (identificado en la model card como Qwen3.8-27B) hasta 1,72 bits por peso con rotacion Hadamard por bloques aplicada en linea por sus propios kernels. Esta build concreta aplica cuantizacion afin estándar de MLX a 6,70 bpw, de modo que funciona en oMLX y mlx-vlm sin modificar, y conserva dos componentes que la release oficial de MLX pierde: la torre de vision (333 tensores intactos en BF16) y una cabeza de prediccion multi-token (MTP).

La innovacion principal es el injerto de una cabeza MTP de 15 tensores y 0,42 B de parametros procedente de Qwen3.8-27B, que permite decodificacion auto-especulativa en oMLX. Segun las mediciones del autor sobre la build oQ6, el injerto funciona pero con menor eficiencia que una cabeza nativa: acepta entre el 44,5 % y el 67,4 % de los borradores frente al ~74 % de referencia, lo que se traduce en 15,9-23,9 tok/s con MTP frente a 13,1-13,4 tok/s sin el, aproximadamente 1,8x en la ejecucion mas larga.

El modelo es relevante para quienes investigan cuantizacion extrema y decodificacion especulativa en Apple Silicon, porque publica una tabla de fidelidad medida (divergencia KL, error relativo maximo, coincidencia top-1 y top-5) para cinco variantes de cuantizacion. Tambien es un ejemplo documentado de que un modelo ternario sigue beneficiandose de mas bits: la cuantizacion afin construye la rejilla a partir del minimo y el maximo del grupo, y con cuatro niveles sobre un grupo simetrico {-a, 0, +a} el cero no es representable, pese a ser el valor mas frecuente en un tensor ternario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM transformer de atencion hibrida derivado de Qwen3.8-27B (etiqueta `qwen3_5` en el repo), con torre de vision y cabeza MTP injertada |
| Parametros totales | 27.781.427.952 (27,78 B safetensors); incluye 0,42 B de la cabeza MTP y 333 tensores de vision en BF16 |
| Parametros activos | no aplica: no se describe como modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2 (3,00 bpw), oQ3 (3,70 bpw), oQ4 (4,70 bpw), oQ6 (6,70 bpw, esta build), oQ8 (8,50 bpw); el GGUF upstream usa pesos ternarios a 1,72 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors, 5 shards, 22,09 GiB (23,72 GB) en disco |

## Arquitectura y entrenamiento

La cadena de procedencia tiene cuatro pasos, segun el autor. Primero, Qwen/Qwen3.8-27B, un VLM de 27B con atencion hibrida bajo licencia Apache-2.0, del que se extraen sin modificar los 15 tensores `mtp.*`. Segundo, prism-ml/Ternary-Bonsai-2-27B, que ternariza ese modelo a 1,72 bpw aplicando una rotacion Hadamard por bloques en linea mediante kernels propios. Tercero, la conversion a BF16 que sirve de referencia para medir la fidelidad de cada cuantizacion. Cuarto, la cuantizacion MLX de precision mixta objeto de esta ficha.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original. La unica innovacion tecnica documentada es la combinacion de pesos ternarios con cuantizacion afin de MLX a 6,70 bpw y el injerto de la cabeza MTP para decodificacion auto-especulativa. El autor advierte de que la cabeza se entreno contra estados ocultos en precision completa y ahora lee estados ternarizados, lo que explica la perdida de eficiencia especulativa.

## Capacidades

- Generacion de texto conversacional en formato image-text-to-text, con la torre de vision completa (333 tensores sin cuantizar).
- Procesamiento de imagenes: el pipeline declarado es `image-text-to-text` y la torre de vision se conserva intacta en BF16.
- Decodificacion auto-especulativa mediante cabeza MTP injertada, activable con `mtp_enabled` en oMLX 0.6.4 o superior.
- Inferencia estandar sin MTP a traves de mlx-vlm 0.7 o superior.
- Razonamiento multi-paso, tool calling, function calling y capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio no esta cumplimentado.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en cuantizacion extrema sobre Apple Silicon: la tabla de fidelidad (KL, error relativo maximo, coincidencia top-1 y top-5) permite comparar el compromiso tamano-fidelidad de cinco builds y validar si una cuantizacion ternaria concreta es aceptable para una tarea dada.
- Analisis de documentos con imagenes en local: al conservar la torre de vision en BF16 y ser un modelo image-text-to-text, puede procesar capturas, diagramas o paginas escaneadas sin enviar datos a un servicio externo.
- Asistente conversacional privado en un Mac: el modelo corre integramente en memoria unificada, lo que lo hace adecuado para entornos donde no se permite salida de datos a la nube.
- Evaluacion de decodificacion especulativa con cabezas injertadas: las tasas de aceptacion publicadas (67,4 %, 44,5 % y 48,9 % segun longitud de generacion) sirven como linea base para estudiar el impacto de leer estados ocultos ternarizados desde una cabeza entrenada en precision completa.
- Servicio de inferencia local con oMLX: el comando `omlx serve --model-dir ... --port 8000` expone una API compatible con flujos existentes, util para prototipos y demos en hardware de escritorio.
- Banco de pruebas de compatibilidad de formatos: el modelo solo carga en oMLX y mlx-vlm, por lo que sirve para verificar que un pipeline interno no depende implicitamente de GGUF, llama.cpp, Ollama o LM Studio.
- Generacion de texto asistida por imagen en flujos de diseno o soporte tecnico: dado un diagrama o una captura de error, el modelo puede describir el contenido y continuar la conversacion en varios turnos, siempre que el contexto lo permita (longitud no publicada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos son metricas de fidelidad de cuantizacion y de aceptacion especulativa, medidas por el autor.

Fidelidad frente a la conversion BF16 de referencia, cinco prompts, ultimo token en modo greedy:

| Build | bpw | Tamano en disco | Shards | KL(bf16‖q) | Error rel. max. | Top-1 | Top-5 |
|---|---|---|---|---|---|---|---|
| oQ2 | 3,00 | 10,83 GiB (11,63 GB) | 3 | 0,37658 | 0,2472 | 4/5 | 16/25 |
| oQ3 | 3,70 | 12,91 GiB (13,86 GB) | 3 | 0,03478 | 0,1077 | 5/5 | 21/25 |
| oQ4 | 4,70 | 15,85 GiB (17,02 GB) | 4 | 0,01476 | 0,0519 | 5/5 | 23/25 |
| oQ6 (esta build) | 6,70 | 22,09 GiB (23,72 GB) | 5 | 0,00074 | 0,0164 | 5/5 | 24/25 |
| oQ8 | 8,50 | 27,94 GiB (30,00 GB) | 6 | 0,00008 | 0,0083 | 5/5 | 25/25 |

Rendimiento de la decodificacion especulativa con la cabeza MTP injertada, medido en oMLX sobre oQ6:

| Tokens generados | Borradores aceptados | Tokens/ciclo |
|---|---|---|
| 57 | 31/46 (67,4 %) | 2,38 |
| 175 | 57/128 (44,5 %) | 1,51 |
| 470 | 178/364 (48,9 %) | 1,62 |

Rendimiento extremo a extremo en la misma maquina: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP, aproximadamente 1,8x en la ejecucion mas larga. Como referencia, un modelo de esta familia con cabeza MTP nativa acepta en torno al 74 % en la misma configuracion.

## Requisitos de hardware

- Apple Silicon exclusivamente; construido y probado en un Apple M5 Max con 128 GB de memoria unificada y macOS 15 o superior.
- Memoria unificada: unos 22,09 GiB libres para un prompt corto; mas para contexto largo (la longitud de contexto no esta publicada).
- No cabe en GPUs consumer NVIDIA ni en GPU de datacenter: el formato es MLX safetensors y no carga en llama.cpp, Ollama ni LM Studio.
- Despliegue: oMLX 0.6.4 o superior para la ruta con decodificacion especulativa MTP; mlx-vlm 0.7 o superior en version estandar para inferencia simple.
- Latencia y throughput medidos: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP en M5 Max / 128 GB.
- Aviso de consumo: si se carga la cabeza MTP pero no se activa `mtp_enabled`, se paga el coste de los pesos adicionales sin obtener la ganancia de velocidad.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tarea que permitan comparar con modelos alternativos de la misma categoria. La comparacion disponible es entre variantes de cuantizacion de este mismo modelo y su origen:

| Modelo | bpw | Tamano en disco | Fidelidad frente a BF16 | Licencia |
|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MLX-oQ2-mtp | 3,00 | 11,63 GB | KL 0,37658; top-1 4/5 | Apache-2.0 |
| Ternary-Bonsai-2-27B-MLX-oQ3-mtp | 3,70 | 13,86 GB | KL 0,03478; top-1 5/5 | Apache-2.0 |
| Ternary-Bonsai-2-27B-MLX-oQ4-mtp | 4,70 | 17,02 GB | KL 0,01476; top-1 5/5 | Apache-2.0 |
| Ternary-Bonsai-2-27B-MLX-oQ6-mtp (esta build) | 6,70 | 23,72 GB | KL 0,00074; top-1 5/5, top-5 24/25 | Apache-2.0 |
| Ternary-Bonsai-2-27B-MLX-oQ8-mtp | 8,50 | 30,00 GB | KL 0,00008; top-1 5/5, top-5 25/25 | Apache-2.0 |
| prism-ml/Ternary-Bonsai-2-27B (GGUF upstream) | 1,72 | no disponible | referencia del autor para la ternarizacion | no disponible en esta ficha |
| Qwen/Qwen3.8-27B (BF16 original) | 16 | no disponible | modelo de referencia | Apache-2.0 |

Comparativa con modelos de otros fabricantes del mismo tamano: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion afin de MLX construye la rejilla desde el minimo y el maximo del grupo; con cuatro niveles sobre un grupo simetrico ternario, el valor cero no es representable pese a ser el mas comun del tensor. Esto explica que exista perdida medible incluso en un modelo cuyo origen ya es ternario.
- oQ2 es la unica build que invierte una prediccion top-1 en la muestra de cinco prompts; el autor la describe explicitamente como opcion de bajo consumo, no como una solucion sin coste.
- La cabeza MTP injertada rinde por debajo de una nativa (44,5-67,4 % de aceptacion frente a ~74 %), porque se entreno contra estados ocultos en precision completa y ahora lee estados ternarizados.
- La medicion de fidelidad usa como referencia la conversion BF16, no el GGUF original. Cualquier error introducido en esa conversion se heredaria en todas las builds y no apareceria en la tabla.
- Formato propietario de facto: los pesos son MLX safetensors y no cargan en llama.cpp, Ollama ni LM Studio. La portabilidad fuera del ecosistema Apple es nula sin reconversion.
- Dependencia de versiones: se requiere oMLX 0.6.4 o superior para MTP y mlx-vlm 0.7 o superior para inferencia estandar; versiones anteriores pueden no cargar el modelo.
- Longitud de contexto e idiomas soportados no estan publicados, lo que impide garantizar el comportamiento en conversaciones largas o en castellano.
- No hay benchmarks de tarea, por lo que no puede estimarse la tasa de alucinacion, el sesgo ni la calidad real frente al modelo original en precision completa mas alla de las metricas de fidelidad de logits.
- Licencia Apache-2.0 declarada por el autor, que indica explicitamente no estar afiliado a Prism ML, pipenetwork ni Alibaba Cloud. Conviene verificar las condiciones de los modelos base antes de un uso comercial en produccion.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no hay validacion independiente de las mediciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ6-mtp
- Variante oQ2: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ2-mtp
- Variante oQ3: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ3-mtp
- Variante oQ4: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ4-mtp
- Variante oQ8: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ8-mtp
- Modelo base ternario (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo origen de la cabeza MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de oMLX: no disponible en la informacion proporcionada
- Paper o blog tecnico del autor: no disponible en la informacion proporcionada
