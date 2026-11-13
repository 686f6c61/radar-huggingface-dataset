# Vzdorrr/Nocta-Gemma-4-E2B-abliterated-GGUF

## Resumen

Nocta-Gemma-4-E2B-abliterated-GGUF es una recuantizacion en formato GGUF del modelo Gemma 4 E2B en su variante "abliterated" (sin mecanismos de rechazo), publicada por el usuario Vzdorrr para la aplicacion de companero en dispositivo Nocta. Parte de los pesos QAT (quantization-aware training) de `google/gemma-4-E2B-it`, pasados por la ablacion de rechazos de huihui-ai y posteriormente recuantizados con matriz de importancia (imatrix) para uso con llama.cpp. El resultado son dos ficheros: un modelo principal en Q4_0 con imatrix de 1,88 GB y un proyector de vision en Q5_0 de 0,38 GB.

El modelo es multimodal (pipeline `image-text-to-text`) y esta pensado para inferencia en dispositivo, con kernels rapidos para ARM. La innovacion principal de esta recuantizacion es el recorte de vocabulario de 262.144 a 208.339 tokens, eliminando escrituras que la aplicacion no utiliza (devanagari, arabe, kana japones, thai y otras), lo que reduce el tamano del fichero sin alterar la tokenizacion en los idiomas soportados. Ademas, las tablas de embedding por capa (`per_layer_token_embd`) se cuantizan en Q2_K frente al Q4_0 del resto, aprovechando que son meras consultas de tabla.

La relevancia de esta ficha es acotada: es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy concreto (la app Nocta). El recuento de parametros reportado en safetensors es de 475.729.088, aunque el modelo base es una variante E2B de Gemma 4, por lo que la cifra debe interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B), con proyector de vision; pesos QAT |
| Parametros totales | 475.729.088 (segun safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 con imatrix (modelo principal); Q2_K para `per_layer_token_embd`; Q5_0 para el proyector de vision |
| Idiomas soportados | no disponible (el autor indica que se conservan latin, cirilico, ideogramas CJK, coreano, emoji y tokens especiales; se eliminan devanagari, arabe, kana japones, thai y otras escrituras) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 E2B, un transformer multimodal de Google con proyector de vision, en su variante instruction-tuned (`-it`) entrenada con quantization-aware training. Sobre esos pesos, huihui-ai aplico una ablacion de rechazos (abliteration) que elimina las direcciones de activacion asociadas a respuestas de rechazo, y Vzdorrr realizo una recuantizacion con `llama-imatrix` y `llama-quantize`.

El proceso de recuantizacion usa un fichero de calibracion con dialogos de rol y prompts "estilo aplicacion" en los idiomas de la app, con ventana de calibracion de 512 tokens. Se aplica imatrix sobre una base Q4_0 (que coincide con el entrenamiento QAT de los pesos y aprovecha kernels rapidos en ARM), con `per_layer_token_embd` en Q2_K y `token_embd` en Q4_0. Posteriormente se ejecuta un script `vocab_trim.py` que reduce el vocabulario de 262.144 a 208.339 tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento original, la composicion del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y dialogo multi-turno con memoria y persona, segun el banco de pruebas del autor (dialogo de rol de 30 turnos en ruso).
- Comprension de imagenes mediante el proyector de vision incluido (`mmproj` en Q5_0).
- Capacidades de instruccion y formato, evaluadas en el bench del autor con comprobaciones de formato y sondas si/no.
- Soporte multilingue parcial: latin, cirilico, ideogramas CJK, coreano y emoji conservados; escrituras eliminadas del vocabulario (devanagari, arabe, kana, thai y otras) tokenizan mal.
- Sin mecanismos de rechazo (abliterated): responde a peticiones que el modelo original rechazaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Companero conversacional en dispositivo: es el caso de uso disenado por el autor; el modelo cabe en 1,88 GB y usa kernels ARM rapidos, lo que permite ejecutarlo en moviles o equipos de bajos recursos con llama.cpp.
- Aplicaciones de rol y roleplay: el banco de pruebas del autor mide memoria de contexto, consistencia de persona y robustez en dialogos de 30 turnos, lo que lo hace adecuado para asistentes de personaje.
- Descripcion de imagenes y dialogue sobre imagenes: el proyector de vision Q5_0 permite tareas image-text-to-text en local, util para asistentes de accesibilidad o catalogacion visual offline.
- Prototipado de asistentes sin censura: al estar abliterated, sirve para investigacion sobre comportamiento de modelos sin rechazos, aunque con las advertencias de la seccion de limitaciones.
- Despliegue en entornos sin GPU dedicada: el formato GGUF con cuantizacion Q4_0 permite inferencia en CPU y en GPUs de gama baja mediante llama.cpp.
- Pruebas de tokenizacion multilingue: el recorte de vocabulario permite estudiar el impacto del vocabulario en la calidad para idiomas latinos y CJK frente a la version sin recortar.
- Aplicaciones de chat offline con privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para asistentes personales sensibles.

## Benchmarks y rendimiento

El autor publica mediciones propias (no benchmarks estandar) sobre un dialogo de rol de 30 turnos en ruso, con 3 semillas, en llama.cpp sobre simulador de iOS:

| Modelo / configuracion | KL vs BF16 | Mismo top-1 | Bench (0-100), 3 semillas |
|---|---|---|---|
| Q4_K_M sin imatrix | 0,059 | 88,4 % | 75 / 81 / 77 |
| Esta recuantizacion (KL antes del recorte de vocab) | 0,070 | 87,3 % | 90 / 83 / 82 (media 85) |
| Referencia: E4B del mismo autor | no disponible | no disponible | 81 / 95 / 80 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,9 GB para el modelo principal Q4_0 y 0,38 GB adicionales para el proyector de vision Q5_0; en total, en torno a 2,3 GB de pesos.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor menciona kernels rapidos para ARM y pruebas en simulador de iOS, lo que sugiere despliegue en movil y CPU.
- Cabe en GPU consumer: por tamano, si; cualquier GPU con al menos 3-4 GB de VRAM libre deberia poder alojarlo, aunque no se confirma en la informacion.
- Opciones de despliegue: llama.cpp (formato GGUF y recipe con `llama-imatrix` y `llama-quantize`); otras opciones como vLLM, Ollama o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nocta-Gemma-4-E2B-abliterated-GGUF (este) | 475.729.088 | no disponible | Apache 2.0 | GGUF | Q4_0 imatrix, vocab recortado, vision Q5_0 |
| huihui-ai/Huihui-gemma-4-E2B-it-qat-q4_0-unquantized-abliterated | no disponible | no disponible | Apache 2.0 | GGUF | Base directa, sin recorte de vocab ni imatrix de este autor |
| Vzdorrr/Nocta-Gemma-4-E4B-abliterated-GGUF | no disponible | no disponible | Apache 2.0 | GGUF | Hermano mayor E4B del mismo autor; bench 81/95/80 |
| google/gemma-4-E2B-it | no disponible | no disponible | Gemma (terminos propios) | no disponible | Modelo original con rechazos |

## Limitaciones y advertencias

- Modelo abliterated: los rechazos han sido eliminados, por lo que puede generar contenido danino, ofensivo o inapropiado; el autor pide uso responsable.
- Recorte de vocabulario: los textos en devanagari, arabe, kana japones, thai y otras escrituras eliminadas tokenizan mal; para esos idiomas debe usarse el modelo huihui sin recortar.
- Sesgos: no se documentan sesgos especificos; al derivar de Gemma 4, hereda los sesgos del modelo base, no evaluados en la informacion.
- Alucinacion: no se aportan datos sobre tasas de alucinacion; el modelo es de 2B efectivos y es propenso a errores en tareas de conocimiento factual.
- Licencia: Apache 2.0 segun el autor, aunque el modelo base Gemma tiene terminos propios de Google; conviene verificar la compatibilidad para uso comercial.
- Repositorio de nicho: cero descargas y cero likes, sin validacion externa; las mediciones son del propio autor y no estan replicadas.
- Contexto e idiomas: la longitud de contexto no se especifica y el soporte multilingue esta limitado por el recorte de vocabulario.
- Uso en produccion: sin benchmarks estandar ni datos de latencia, no hay garantias de rendimiento fuera del caso de uso de la app Nocta.

## Enlaces

- Hugging Face: https://huggingface.co/Vzdorrr/Nocta-Gemma-4-E2B-abliterated-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-gemma-4-E2B-it-qat-q4_0-unquantized-abliterated-GGUF
- Repo hermano E4B: https://huggingface.co/Vzdorrr/Nocta-Gemma-4-E4B-abliterated-GGUF
- Modelo original: google/gemma-4-E2B-it (sin enlace directo en la informacion proporcionada)
- llama.cpp (herramientas `llama-imatrix` y `llama-quantize`): no disponible enlace en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
