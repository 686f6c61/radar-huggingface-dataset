# wallawalla47/Qwen3.8-27B-Quasar-NinferV3

## Resumen

Qwen3.8-27B-Quasar-NinferV3 es un artefacto de inferencia de un solo fichero (`.ninfer`) publicado por el usuario wallawalla47 para el motor NInfer V3, construido a partir del checkpoint cuantizado QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4. No es un modelo entrenado desde cero: es una derivada de despliegue que importa de forma bit-exacta los pesos NVFP4 ya entrenados con quantization-aware training (QAT) del checkpoint base y les aсopla dos componentes de decodificacion especulativa (un draft model DFlash2 y una cabeza de propuesta indexada) para aprovechar las rutas de decodificacion mas rapidas de NInfer.

El backbone es de tipo hibrido de la familia Qwen3.5, con 64 capas que combinan Gated Delta-Net (atencion lineal) con atencion completa cada cuatro capas, una dimension oculta de 5120 y un vocabulario de 248 320 tokens. Incorpora una torre de vision (`qwen3_5_vision`, profundidad 27) para entrada de imagen y video, y una torre MTP para decodificacion especulativa. El contexto nativo declarado es de 262 144 tokens. La denominacion comercial del modelo es de 27 000 millones de parametros.

Su relevancia es acotada pero clara: demuestra un flujo de cuantizacion NVFP4 (W4A4) orientado a GPUs Blackwell de consumo, con un artefacto que pesa 21,6 GB y se ejecuta residente en unos 20 GB de VRAM en una RTX 5090, sin paso de conversion en tiempo de carga. A cambio, queda atado a un fork concreto del motor NInfer y a hardware sm_120a, lo que limita su portabilidad frente a formatos estandar como GGUF o safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5-family: 64 capas con Gated Delta-Net (atencion lineal) y atencion completa cada 4 capas; torre de vision qwen3_5_vision (profundidad 27); torre MTP; draft model DFlash2 de 5 capas con atencion deslizante (ventana 2048) |
| Parametros totales | 27 000 millones (segun la denominacion del modelo y del checkpoint base) |
| Longitud de contexto | 262 144 tokens nativos; la invocacion de ejemplo del autor configura `--max-context 240000` |
| Tipos de cuantizacion | NVFP4 (W4A4) para 256 proyecciones lineales cuantizadas; Q8 agrupado (group-32, escalas FP16) para la capa MTP y el `lm_head` compartido; Q4 agrupado (`q4_g64_fp16`, grouped_absmax) para la cabeza de propuesta indexada; BF16 para embeddings, normas, inicializadores de estado, torre de vision y las proyecciones GDN a/b (upcast desde NVFP4); FP32 en 96 objetos. Censo de los 1006 objetos de pesos preparados: 256 NVFP4, 646 BF16, 6 Q8, 96 FP32, 1 Q4, 1 INT32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Fichero unico `.ninfer` (formato propietario del motor NInfer V3), derivado de `compressed-tensors` en formato `nvfp4-pack`. No se distribuye en safetensors ni GGUF |
| Tamano del repositorio | 21,6 GB |
| GPU objetivo | NVIDIA RTX 5090 (sm_120a), ~20 GB de VRAM residente |
| Motor de inferencia | NInfer V3 (fork Wallawalla47/ninfer-custom, rama `port/local-features-2026-09-15`) |
| Modelo base | QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (relacion: quantized) |

## Arquitectura y entrenamiento

El backbone es un transformer hibrido de 64 capas con dimension oculta 5120 y vocabulario de 248 320 tokens. La atencion alterna capas de Gated Delta-Net (atencion lineal recurrente) con capas de atencion completa cada cuatro capas, un patron orientado a reducir el coste de contexto largo manteniendo capacidad de recuperacion exacta en las capas completas. El contexto nativo es de 262 144 tokens. Se anaden tres componentes auxiliares: una torre de vision de profundidad 27 para entrada image-text-to-text, una torre MTP (multi-token prediction) para decodificacion especulativa y un draft model DFlash2 de 5 capas con atencion deslizante de ventana 2048 y selector de rango 256 / top-16. Ademas se incluye una cabeza de propuesta indexada de 131 072 filas, recogida del `lm_head` del checkpoint QUASAR y ordenada por un corpus de frecuencias, que alimenta la ruta `--lm-head-draft` para propuestas tipo copia.

Sobre el entrenamiento no se aporta informacion en la model card: no se especifican volumen de tokens, composicion del dataset, ni si hubo RLHF o DPO. Lo que si se documenta es la procedencia de los pesos: el checkpoint base fue entrenado con quantization-aware training en NVFP4 (formato `nvfp4-pack` de `compressed-tensors`). El artefacto de este repositorio importa de forma bit-exacta esos 256 objetos NVFP4 mediante `import_encoded`, sin round-trip de dequantizacion y requantizacion, de modo que la calidad del modelo base se preserva por construccion segun el autor. Las unicas transformaciones reales son: requantizacion BF16 → Q8 de la capa MTP y del `lm_head` compartido (por requisito de la operacion fusionada del motor, que exige Q8 con n=1024), y un upcast de NVFP4 a BF16 de las proyecciones GDN a/b, que en el layout de almacenamiento NVFP4 de la v3 requieren tiles de 128 filas y son tensores de 48 filas. El componente DFlash2 se injerta literalmente desde el artefacto oficial de NInfer (`artifact id 3aec71e9…`). La conversion se realizo con `tools/convert/quasar_nvfp4.py` y el informe por tensor esta incluido como `qwen3_8_27b_nvfp4-quasar-proposal.ninfer.conversion.json`.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (`--preserve-thinking` en la invocacion de ejemplo).
- Entrada multimodal image-text-to-text mediante la torre de vision `qwen3_5_vision` (imagen y video segun la descripcion del componente).
- Contexto largo de hasta 262 144 tokens nativos, con KV cache en int8 (`--kv-dtype int8`) y gestion de KV por el motor.
- Decodificacion especulativa en tres rutas combinables: draft model DFlash2 (`--spec dflash2`), MTP y propuestas por n-gramas (`--ngram-draft-tokens`, `--ngram-min-match`) mas `--lm-head-draft` sobre la cabeza de propuesta indexada.
- Orientacion a uso agentico (etiqueta `agentic`), adecuada para razonamiento encadenado y tareas de varios pasos.
- Concurrencia y continuaciones gestionadas por el motor: `--max-concurrency 5`, `--host-state-slots 64`, `--max-private-continuations 64`.
- Idiomas soportados: no disponible; no se documenta cobertura multilingue especifica.
- Soporte de tool calling / function calling: no se documenta explicitamente en la model card (la etiqueta `agentic` es la unica indicacion).

## Casos de uso

- Analisis de documentos extensos con contexto largo: con 262 144 tokens nativos y KV en int8, el modelo puede procesar contratos, expedientes o bases de codigo completas en una sola pasada sin troceado, manteniendo coherencia entre secciones lejanas.
- Comprension de documentacion tecnica con imagenes: la torre de vision permite alimentar diagramas de arquitectura, capturas de interfaz o esquemas y combinarlos con el texto circundante en una misma consulta image-text-to-text.
- Asistentes de razonamiento con modo thinking: activando `--preserve-thinking` se puede trazar la cadena de razonamiento en tareas de matematicas, logica o diagnostico tecnico, util para auditoria de respuestas.
- Inferencia local en estacion de trabajo con GPU de consumo: el artefacto reside en unos 20 GB de VRAM en una RTX 5090 y no requiere paso de conversion, lo que permite levantar un servidor OpenAI-compatible en local con `ninfer-serve.exe`.
- Servicio de baja latencia con decodificacion especulativa: combinando DFlash2, MTP y propuestas por n-gramas con `--draft-tokens 7` y `--ngram-draft-tokens 15`, el artefacto esta disenado para maximizar tokens por paso en cargas de generacion larga.
- Agentes de varios pasos sobre repositorios: la ventana de contexto y la gestion de continuaciones (`--max-private-continuations 64`) permiten mantener sesiones de agente prolongadas sobre codebases grandes con historial persistente.
- Investigacion en cuantizacion NVFP4: el repositorio sirve como caso de estudio reproducible de importacion bit-exacta de pesos QAT NVFP4 frente a re-cuantizacion, con el informe de conversion por tensor incluido.
- Despliegue con concurrencia moderada en una sola GPU: `--max-concurrency 5` con `--kv-capacity auto` y headroom configurable permite atender varias sesiones simultaneas en una unica tarjeta Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones numericas con modelos alternativos. Tampoco se publican medidas de latencia o throughput (tokens por segundo) para las rutas especulativas DFlash2, MTP o `--lm-head-draft`.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB residentes segun el autor, para un repositorio de 21,6 GB en disco.
- GPU recomendada: NVIDIA RTX 5090 (compute capability sm_120a). El artefacto esta construido explicitamente para esa arquitectura, ya que los kernels NVFP4 W4A4 dependen de las capacidades FP4 de Blackwell.
- GPU compatibles: no se documentan otras. No hay indicacion de soporte para A100, H100 ni generaciones anteriores, y los kernels NVFP4 de NInfer V3 apuntan a sm_120a.
- Cabe en GPU de consumo: si, en RTX 5090, con los ~20 GB indicados. No se documenta su comportamiento en tarjetas con menos VRAM.
- Opciones de despliegue: exclusivamente el motor NInfer V3 del fork Wallawalla47/ninfer-custom (rama `port/local-features-2026-09-15`), mediante `ninfer-serve.exe`. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato `.ninfer` es propietario.
- Parametros de ejecucion documentados: `--max-context 240000`, `--max-concurrency 5`, `--spec dflash2`, `--draft-tokens 7`, `--lm-head-draft`, `--ngram-draft-tokens 15`, `--ngram-min-match 12`, `--kv-dtype int8`, `--preserve-thinking`, `--host-kv-mib 24000`, `--pending-timeout-ms 900000`, `--prefill-chunk 2048`, `--kv-capacity auto`, `--kv-headroom-mib 0`, `--host-state-slots 64`, `--max-private-continuations 64`.
- Latencia y throughput: no disponibles. La model card describe las rutas especulativas como las "rutas de decodificacion mas rapidas" del motor, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wallawalla47/Qwen3.8-27B-Quasar-NinferV3 | 27B (denominacion) | 262 144 nativos | NVFP4 W4A4 + Q8 + Q4 + BF16/FP32 | `.ninfer` (propietario, 21,6 GB) | Apache 2.0 | 0 descargas, 0 likes; requiere fork de NInfer V3 y RTX 5090 |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (modelo base) | 27B (denominacion) | no disponible en la informacion proporcionada | NVFP4 (`compressed-tensors` `nvfp4-pack`) | `compressed-tensors` | no disponible | checkpoint fuente del artefacto |
| Artefacto oficial NInfer `qwen3_8_27b_nvfp4-official.ninfer` (id 3aec71e9…) | no disponible | no disponible | NVFP4 + componentes propios | `.ninfer` | no disponible | citado como origen del componente DFlash2 injertado |

No se dispone de datos de rendimiento de ninguno de los tres artefactos, por lo que la comparativa se limita a parametros, contexto, formato y disponibilidad. No hay informacion en la fuente sobre alternativas de otros autores en la misma categoria.

## Limitaciones y advertencias

- Dependencia absoluta del motor: el fichero `.ninfer` solo se carga con el fork NInfer V3 en la rama `port/local-features-2026-09-15`. No es utilizable con vLLM, llama.cpp, Ollama, TGI ni transformers, lo que descarta su integracion en la mayoria de stacks estandar.
- Dependencia de hardware: los kernels NVFP4 requieren una GPU Blackwell sm_120a; el propio autor indica una RTX 5090. No hay ruta de fallback documentada para otras arquitecturas.
- Ausencia de validacion externa: el repositorio tiene 0 descargas y 0 likes, y no se publican benchmarks. La afirmacion de que la calidad del modelo base se preserva por construccion es del autor y no esta verificada de forma independiente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan medidas de mitigacion ni tasas de error medidas.
- Idiomas: no disponibles. La model card no especifica cobertura linguistica, por lo que no puede asumirse un rendimiento fiable en castellano u otros idiomas sin evaluacion previa.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia: Apache 2.0 es permisiva y permite uso comercial, pero se aplica al artefacto publicado; conviene verificar la licencia y las condiciones del checkpoint base QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, que no se detallan en esta ficha.
- Opacidad de la denominacion: el modelo se llama "Qwen3.8", pero la arquitectura descrita se corresponde con la "familia Qwen3.5" (64 capas, Gated Delta-Net, vocabulario 248 320). No hay confirmacion en la informacion disponible sobre la relacion exacta con las versiones publicas de Qwen.
- Proceso de conversion con transformaciones no neutras: la capa MTP y el `lm_head` compartido se requantizan de BF16 a Q8 por exigencia del motor, lo que introduce una perdida de precision no cuantificada en la documentacion.
- Model card incompleta: la informacion proporcionada se corta al final del comando de ejemplo (`ninfer-serve.exe`), por lo que pueden faltar notas del autor sobre uso, limitaciones o reproducibilidad.
- Tamano en disco elevado: 21,6 GB de repositorio, con 1590 objetos en el fichero (1006 pesos preparados), lo que dificulta su distribucion y versionado.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su paper asociado; los enlaces externos adicionales no estan disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wallawalla47/Qwen3.8-27B-Quasar-NinferV3
- Modelo base: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Repositorio del motor (fork): https://github.com/Wallawalla47/ninfer-custom
- Rama concreta del motor: https://github.com/Wallawalla47/ninfer-custom/tree/port/local-features-2026-09-15
- Script de conversion: https://github.com/Wallawalla47/ninfer-custom/blob/port/local-features-2026-09-15/tools/convert/quasar_nvfp4.py
- Paper referenciado en las etiquetas del modelo (sin verificar): arxiv:2608.13966
- No se han encontrado otros enlaces (papers, blogs, demos o repos adicionales) en la busqueda web realizada.
