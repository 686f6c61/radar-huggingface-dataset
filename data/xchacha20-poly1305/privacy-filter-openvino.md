# xchacha20-poly1305/privacy-filter-openvino

## Resumen

privacy-filter-openvino es una conversión a OpenVINO del modelo openai/privacy-filter, un clasificador de tokens (token-classification) especializado en la detección de información personal identificable (PII). Lo desarrolla el usuario independiente xchacha20-poly1305 y su objetivo es permitir que el modelo original de OpenAI se ejecute sobre las GPU Intel con motores matriciales XMX (familia Arc, incluidos los Arc 130T/140T integrados en los Core Ultra 200H). El problema que resuelve es de compatibilidad: los exports ONNX del modelo original emplean operadores MoE que solo entiende onnxruntime y que OpenVINO no puede leer.

La conversión reescribe dos partes del grafo (los expertos y los attention sinks) para que OpenVINO pueda fusionarlas en sus kernels nativos, y comprime los pesos a int8 con NNCF. El resultado es un modelo de 1,4 GB en formato OpenVINO IR (`model.xml` y `model.bin`) que mantiene las etiquetas y el calibrado del decodificador Viterbi originales. Es relevante para quienes necesitan filtrar PII en local sobre hardware Intel, sin depender de la CPU ni de servicios en la nube.

El modelo conserva la licencia Apache-2.0 del original, aunque la titularidad de los pesos sigue siendo de OpenAI. La model card reporta una aceleración notable frente al export ONNX int8 ejecutado en CPU: 0,75 s frente a 3,8 s para un fichero de 15 KB sobre un Arc 140T.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); conversión a OpenVINO IR con fusión de MoE y SDPA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE; el número de expertos activos no se detalla) |
| Longitud de contexto | no disponible (longitud de entrada dinámica, `n` variable) |
| Tipos de cuantizacion | int8 asimétrico por canal (NNCF) para pesos; sesgos y constantes en fp32; inferencia en f16 |
| Idiomas soportados | no disponible (la model card menciona pruebas con inglés, chino, Markdown, TypeScript y Python, sin lista oficial) |
| Licencia | Apache-2.0 (pesos originales propiedad de OpenAI) |
| Formato de pesos | OpenVINO IR (`model.xml`, `model.bin`); checkpoint original en transformers (~2,8 GB) |

## Arquitectura y entrenamiento

El modelo base openai/privacy-filter es un transformer con mezcla de expertos (MoE) orientado a etiquetado de tokens. La conversión no reentrena ni modifica los pesos: reescribe el grafo para que OpenVINO pueda ejecutarlo. En concreto, los expertos se reorganizan como un bloque denso en el que todos los expertos se aplican a todos los tokens, ponderados por los pesos dispersos del router, en la forma exacta que el pase `ConvertTiledMoeBlockTo2GatherMatmuls` de OpenVINO vuelve a convertir en un MoE disperso; las filas de gate y up quedan intercaladas, que es el layout que lee el kernel fusionado. Los attention sinks se implementan como una clave adicional por cabeza (el tamaño de cabeza pasa de 64 a 80, rellenando con ceros), de modo que la atención es SDPA estándar.

La compresión a int8 se realiza con NNCF en modo asimétrico por canal. Antes de la cuantización, el modelo reescrito igualaba los logits del original con una tolerancia de aproximadamente 1e-5. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni si hubo RLHF o DPO; esos datos corresponden a la model card de openai/privacy-filter, no incluida en la información proporcionada. La conversión tarda unos 40 s con un pico de 15 GB de memoria y es reproducible byte a byte entre ejecuciones, siempre que se fijen las versiones (OpenVINO 2026.4.1).

## Capacidades

- Etiquetado de tokens para detección de PII en ocho categorías: `account_number`, `private_address`, `private_date`, `private_email`, `private_person`, `private_phone`, `private_url` y `secret`.
- Salida de logits con 33 etiquetas en formato BIOES (`O` más `B-`, `I-`, `E-`, `S-` por categoría).
- Tokenización con `o200k_base` (tiktoken), coherente con el pipeline opf de OpenAI.
- Decodificación de spans mediante Viterbi restringido a través del pipeline de opf (el modelo entrega logits, no spans).
- Ejecución en GPU Intel con XMX mediante el plugin GPU de OpenVINO, con kernel MoE fusionado.
- Entrada de longitud dinámica (`[1, n]`), con `input_ids` y `attention_mask` en int64.
- No se documentan capacidades de generación de texto, razonamiento, código, tool calling ni agentes: es un modelo discriminativo de clasificación.

## Casos de uso

- Filtrado de PII antes de enviar prompts a un LLM: integrado en ccpii (modificador de Claude Code), sustituye datos personales por marcadores antes de que el modelo los lea; encaja por su latencia baja en GPU y su ejecución local.
- Redacción de documentos antes de compartirlos: se procesa el texto completo y se localizan nombres, correos, teléfonos y direcciones para anonimizarlos, aprovechando que el modelo etiqueta spans completos mediante Viterbi.
- Cumplimiento de RGPD en pipelines internos: detección automática de datos personales en logs o ficheros antes de almacenarlos o exportarlos, con la ventaja de que no sale nada del equipo.
- Preprocesado de datasets para entrenamiento: limpieza de corpus que contienen correos, URLs o identificadores de cuenta antes de publicarlos o usarlos en ajuste fino.
- Protección de secretos en repositorios de código: la model card indica pruebas con ficheros TypeScript y Python, por lo que puede emplearse para marcar claves y secretos embebidos en el código.
- Enmascarado en herramientas de atención al cliente: sustitución de datos personales en transcripciones antes de pasarlas a sistemas de analítica o de resumen.
- Ejecución en portátiles con gráfica integrada Intel Arc: al caber en 1,4 GB y usar el motor XMX, permite filtrar PII en un Core Ultra 200H sin GPU dedicada.

## Benchmarks y rendimiento

| Escenario | Tiempo | Hardware |
|---|---|---|
| Fichero de 15 KB con este modelo (pipeline opf) | 0,75 s | Intel Arc 140T |
| Fichero de 15 KB con export ONNX int8 original | 3,8 s | CPU, Core Ultra 5 225H (onnxruntime) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí reporta una comparación de calidad: sobre siete textos (prosa en inglés con datos personales, chino, Markdown, TypeScript y Python), los spans difirieron del modelo sin cuantizar en 3 posiciones, frente a 1 del export ONNX int8 original en CPU.

## Requisitos de hardware

- GPU Intel con motores XMX: familia Arc, incluidos los Arc 130T/140T de los Core Ultra 200H.
- VRAM estimada: el modelo ocupa 1,4 GB en disco; no se especifica el consumo exacto en VRAM, pero el tamaño sugiere que cabe holgadamente en gráficas integradas con memoria compartida.
- No es compatible con GPU NVIDIA ni AMD a través de este paquete: requiere el plugin GPU de OpenVINO.
- Software: `openvino==2026.4.1` (versión con la que se creó y probó); la precisión de inferencia debe fijarse en `f16`, porque el kernel MoE fusionado solo funciona así.
- Despliegue mediante la API de OpenVINO (`core.compile_model`) o a través del pipeline de opf; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: unos 0,5 s adicionales la primera vez que se procesa una longitud de entrada nueva; se mitiga rellenando a longitudes fijas (por ejemplo, múltiplos de 256, con token de relleno 199999 y máscara 0), lo que no altera los logits de los tokens reales.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Hardware objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| privacy-filter-openvino | OpenVINO IR | int8 (NNCF) | GPU Intel con XMX | Apache-2.0 | Fusión MoE nativa; 0,75 s por 15 KB en Arc 140T |
| openai/privacy-filter (ONNX int8) | ONNX | int8 | CPU con onnxruntime | Apache-2.0 | 3,8 s por 15 KB en Core Ultra 5 225H; operadores MoE solo de onnxruntime |
| openai/privacy-filter (transformers) | safetensors | fp32/bf16 | GPU genérica | Apache-2.0 | Checkpoint original (~2,8 GB) |

No se dispone de información sobre otros modelos comparables de detección de PII en la documentación proporcionada.

## Limitaciones y advertencias

- Requiere hardware Intel con XMX; no funciona en GPU NVIDIA, AMD ni en CPU a través de este paquete.
- El kernel MoE fusionado solo opera con precisión de inferencia f16; otras configuraciones pueden no fusionar o dar resultados incorrectos.
- Las versiones de software están fijadas: con otras versiones de OpenVINO la fusión puede no producirse o producir un resultado erróneo.
- La cuantización introduce divergencias: 3 spans distintos frente al modelo sin cuantizar en la batería de siete textos, frente a 1 del export ONNX int8.
- Problema conocido: con memoria del sistema escasa, el driver i915 puede colgar el cómputo; la llamada no retorna y el proceso solo muere con SIGKILL. Se recomienda ejecutarlo en un proceso aparte con límite de tiempo y fallback a CPU (como hace ccpii).
- El modelo entrega logits, no spans: para obtener entidades hay que pasar por el decodificador Viterbi de opf, lo que añade dependencia del pipeline original.
- No se documentan sesgos específicos, riesgo de alucinación (es un clasificador, no generativo) ni cobertura de idiomas más allá de las pruebas cualitativas.
- La licencia es Apache-2.0, pero la titularidad de los pesos sigue siendo de OpenAI; conviene revisar las condiciones de openai/privacy-filter para uso comercial.
- El repositorio tiene muy poca tracción (21 descargas, 0 likes) y un único mantenedor, lo que implica menor garantía de soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xchacha20-poly1305/privacy-filter-openvino
- Modelo base: https://huggingface.co/openai/privacy-filter
- Repositorio opf (pipeline de OpenAI): https://github.com/openai/privacy-filter
- ccpii (integración práctica): https://github.com/xchacha20-poly1305/ccpii
