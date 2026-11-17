# wepiqx/SenseNova-Loop-9B-MERNIK-GGUF

## Resumen

SenseNova-Loop-9B-MERNIK-GGUF es una cuantizacion GGUF en formato de solo texto del modelo `sensenova/SenseNova-Loop-9B`, publicada por el usuario `wepiqx`. El modelo base emplea una arquitectura propietaria denominada `sensenova_loop`, que combina un decodificador con bucles recurrentes (looped decoder) y enrutamiento residual mHC, lo que la aparta de un transformer convencional y la hace incompatible con compilaciones estandar de llama.cpp.

La relevancia de esta publicacion reside en el metodo de cuantizacion: MERNIK asigna el presupuesto de 5300 MiB por clase de tensor en lugar de aplicar una receta plana, concentrando la precision en tensores pequenos y sensibles (normas, parametros de estado SSM, convoluciones) y degradando de forma controlada las proyecciones de atencion y la FFN. El resultado es un archivo de 5310 MiB con 4,96 bits por peso que, segun las mediciones de vista previa del autor, mejora la fidelidad frente a un Q4_K_M estandar.

El repositorio se encuentra en estado "preparing": en el momento de la consulta solo contiene el README y los artefactos GGUF, checksums y tablas de verificacion estan pendientes de subida. El modelo base declara 262.144 tokens de contexto nativo, ampliables a 524.288 con un factor YaRN de 2,0, y soporta ingles y chino. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (decodificador con bucles + enrutamiento residual mHC); requiere llama.cpp parcheado |
| Parametros totales | ~9B (solo texto) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 nativo; 524.288 con YaRN factor 2.0 |
| Tipos de cuantizacion | MERNIK 5300 MiB (4,96 BPW); Q4_K_M estandar (5,02 BPW) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tensores | 523 (sin bloque MTP) |
| Tamano de archivo | MERNIK: 5.567.431.104 B (5310 MiB); Q4_K_M: 5.628.723.360 B (5368 MiB) |
| Vision tower | no incluido (solo texto) |
| MTP | ninguno en esta release |
| Runtime recomendado | fork `GuideboardLabs/llama.cpp-sensenova-loop` |

## Arquitectura y entrenamiento

El modelo base utiliza la arquitectura `sensenova_loop`, descrita por el autor como un decodificador con bucles (looped decoder) mas enrutamiento residual mHC. Esta estructura incluye tensores propios de un camino recurrente/SSM: `ssm_conv1d`, parametros de compuerta y estado SSM, y pesos `ssm_out`. La cuantizacion MERNIK preserva estos tensores en F32 precisamente para no degradar el camino recurrente, que es el punto mas sensible del modelo. El archivo contiene 523 tensores, frente a los 538 de la version Preview, porque la release elimina el bloque MTP (multi-token prediction).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento, ya que la model card del autor de la cuantizacion no las detalla. La innovacion tecnica destacable de esta publicacion es el propio asignador MERNIK: reparte el presupuesto por clase de tensor (321 tensores F32 de 40,0 MiB; 178 Q4_K de 3132,0 MiB; 10 Q5_K de 1575,8 MiB; 14 Q6_K de 551,3 MiB) y redirige el presupuesto liberado por la eliminacion de MTP hacia la cola de la FFN (`ffn_gate`/`ffn_up` de `blk.22/25/26/27` y `blk.54` a Q6_K; `blk.19/23/55` a Q5_K). El unico tensor degradado respecto a Preview es `blk.18.ssm_out.weight`, de Q5_K a Q4_K.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento de multiples pasos y generacion long-form, favorecidos por la ventana de contexto de hasta 262.144 tokens nativos.
- Procesamiento de contextos extensos (documentos largos, conversaciones multi-turno) gracias a la extension YaRN a 524.288 tokens.
- Inferencia local en llama.cpp mediante el fork con soporte para `sensenova_loop`.
- Compatibilidad con `llama-server` y su API HTTP (`--jinja` para plantillas de chat).
- Capacidades de vision: no disponibles (tower de vision no incluido, modelo solo texto).
- Tool calling / function calling: no confirmado en la informacion disponible.
- Modo thinking explicito: no confirmado en la informacion disponible.
- Decodificacion especulativa MTP: no disponible en esta release (bloque MTP eliminado; el autor advierte de no activarla).

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto nativo, el modelo puede ingerir informes, expedientes o bases de codigo completas en una sola pasada sin troceado, algo inviable en modelos de 8K-32K.
- Resumen y extraccion de informacion en corpus largos: la ventana ampliada a 524.288 con YaRN permite procesar libros tecnicos o actas completas y extraer entidades o conclusiones en una unica llamada.
- Atencion al cliente multi-turno: el contexto largo reduce la perdida de informacion en conversaciones prolongadas y el soporte bilingue en/zh cubre mercados angloparlantes y sinofonos.
- Despliegue local en hardware de gama media: el archivo de 5310 MiB cabe en GPU consumer con 8 GB o mas y el autor reporta ~16 t/s en una GTX 1070, lo que habilita prototipado en estaciones de trabajo sin GPU de datacenter.
- Evaluacion de tecnicas de cuantizacion: el par MERNIK vs Q4_K_M con la misma base permite comparar fidelidad (KLD) y perplejidad en un caso real de arquitectura no estandar, util para investigadores que estudien asignacion de bits por tensor.
- Procesamiento de texto bilingue en/zh: traduccion asistida, clasificacion y generacion de contenido en ambos idiomas con un unico modelo y una sola GPU.
- Investigacion sobre arquitecturas recurrentes: al requerir un fork especifico de llama.cpp, sirve como banco de pruebas para estudiar el comportamiento de decodificadores con bucles bajo cuantizacion agresiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de la release en la informacion disponible. El autor solo proporciona mediciones de fidelidad de cuantizacion sobre el checkpoint Preview, que no son aplicables a la release:

| Checkpoint / build | PPL | KLD media | KLD mediana | KLD max | RMS Δp | Same top-p |
|:---|---:|---:|---:|---:|---:|---:|
| Preview Q4_K_M | 20,6058 | 0,167036 | 0,033350 | 29,973368 | 9,707% | 86,461% |
| Preview MERNIK 5300 | 18,7856 | 0,122821 | 0,022206 | 29,421997 | 8,370% | 88,627% |
| Release Q4_K_M | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |
| Release MERNIK 5300 | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente |

Protocolo de referencia: logits Q8, `wiki.test.raw` completo (290 chunks), contexto 1024, batch 128. No se han ejecutado HumanEval ni otros benchmarks de tarea para esta release.

## Requisitos de hardware

- VRAM estimada: ~5,3 GB para el archivo MERNIK (5310 MiB) y ~5,4 GB para el Q4_K_M (5368 MiB); anadir overhead de contexto KV segun la longitud de secuencia.
- GPU consumer: cabe en tarjetas con 8 GB o mas (el autor valida funcionamiento en GTX 1070 con ~16 t/s). Una RTX 3060/4060 Ti de 8-16 GB es suficiente para contextos moderados.
- GPU profesional: A100, H100 o RTX 4090 permiten contextos largos y mayor throughput; no se han publicado cifras de rendimiento para estas tarjetas.
- Backends de compilacion: CUDA (`-DGGML_CUDA=ON`) o Vulkan (`-DGGML_VULKAN=ON`); elegir uno solo.
- Runtime: obligatorio el fork `GuideboardLabs/llama.cpp-sensenova-loop`; las builds estandar fallan con `unknown model architecture: 'sensenova_loop'`.
- Servidor: `llama-server` con `--jinja -ngl 99`; muestreo recomendado temp 1.0, top-k 20, top-p 0.95, min-p 0.0.
- No activar decodificacion especulativa MTP: la release no incluye bloque MTP.
- Throughput conocido: ~16 t/s en GTX 1070 (smoke test del autor); sin datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| SenseNova-Loop-9B-MERNIK-GGUF | ~9B | 262.144 (524.288 YaRN) | Apache 2.0 | GGUF | Requiere fork de llama.cpp; release en preparacion |
| SenseNova-Loop-9B (base) | ~9B | 262.144 (524.288 YaRN) | Apache 2.0 | safetensors (presumible) | Modelo original de `sensenova`; pesos completos |
| SenseNova-Loop-9B-Q4_K_M (control) | ~9B | 262.144 (524.288 YaRN) | Apache 2.0 | GGUF | Misma base, receta estandar de 5,02 BPW; menor fidelidad en Preview |
| Alternativas de ~9B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Repositorio incompleto: en el momento de la consulta los archivos GGUF figuran como "preparing" y solo esta publicado el README; los checksums y tablas de verificacion estan pendientes.
- Sin benchmarks de release: no hay PPL, KLD ni HumanEval medidos sobre el checkpoint final; las cifras disponibles corresponden al Preview y no son extrapolables.
- Dependencia de un fork: no funciona con llama.cpp estandar; requiere `GuideboardLabs/llama.cpp-sensenova-loop`, lo que limita el soporte de herramientas de terceros (Ollama, vLLM, TGI no estan confirmados).
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Modelo solo texto: sin torre de vision ni capacidades multimodales.
- Sin MTP: no se puede usar decodificacion especulativa con este archivo y el autor lo desaconseja explicitamente.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplicable el riesgo habitual de modelos generativos de ~9B.
- Sesgos: no documentados por el autor; no hay evaluacion de sesgos publicada.
- Cuantizacion agresiva: 4,96 BPW con degradacion deliberada de proyecciones de atencion y FFN; el autor advierte de que recetas genericas pueden degradar el camino recurrente.
- Muestreo fijo recomendado (temp 1.0): bajar la temperatura no esta recomendado por el autor, lo que reduce el control fino sobre la determinismo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento de la licencia del modelo base recae en el usuario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wepiqx/SenseNova-Loop-9B-MERNIK-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Fork de llama.cpp de los autores: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop
- Fork opcional del cuantizador: https://github.com/wepiqx/llama.cpp-sensenova-loop
