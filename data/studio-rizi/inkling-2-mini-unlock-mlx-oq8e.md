# studio-rizi/Inkling-2-Mini-Unlock-MLX-oQ8e

## Resumen

Inkling-2-Mini-Unlock-MLX-oQ8e es una conversion a formato MLX del modelo comunitario Inkling 2 Mini "Unlock", una variante abliterated (sin censura) del Inkling-2-Mini original desarrollado por Thinking Machines Lab. La conversion la firma el usuario studio-rizi y emplea el esquema de cuantizacion mixta oQ8e del runtime oMLX, pensado especificamente para Apple Silicon. El resultado es un checkpoint de 26.388.646.400 parametros totales empaquetado en 18,8 GB de repositorio, distribuido en cuatro shards mas un draft DSpark para decodificacion especulativa.

El modelo conserva la arquitectura original `inkling2_loop`, un MoE multimodal con atencion en bucle, 26,4B de parametros totales y 3,4B activos por token, con una ventana de contexto de 1M tokens y capacidad de vision integrada (422 tensores de vision). La cuantizacion oQ8e mantiene una base de 8 bits afines (grupo 64) casi sin perdida y deja los tensores de expertos enrutados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23), preservando el draft MTP para decodificacion especulativa Lightning.

Su relevancia es doble: por un lado ofrece una via practica de ejecutar un MoE multimodal de gran contexto en hardware Apple; por otro, al ser una variante abliterated, esta dirigida a investigadores de alineacion y seguridad, red teams y desarrolladores que necesitan un modelo que no rechace instrucciones, siempre bajo su propia politica de uso. La licencia es Apache 2.0, aunque hereda las restricciones de uso aceptable del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (MoE multimodal con atencion en bucle) |
| Parametros totales | 26.388.646.400 (26,4B) |
| Parametros activos | 3,4B (MoE) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | oQ8e (base 8-bit afines grupo 64; expertos en NVFP4/MXFP8); checkpoint nativo oMLX, no cargable por mlx-lm estandar |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 4 shards, 18,1 GB + 0,64 GB de draft DSpark |

## Arquitectura y entrenamiento

El modelo parte de `thinkingmachines/Inkling-2-Mini`, un transformer MoE multimodal con un esquema de atencion en bucle (`inkling2_loop`) que reutiliza capas de atencion para reducir coste manteniendo capacidad. Cuenta con 26,4B de parametros totales y 3,4B activos por token, lo que situa su coste de inferencia en el orden de un modelo denso de ~3-4B pese a su tamano bruto. Incluye torre de vision (422 tensores) y un cabezal MTP (multi-token prediction) denominado DSpark, empleado para decodificacion especulativa.

Sobre el entrenamiento original no se aportan detalles en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF/DPO). La variante "Unlock" aplica abliteration sobre parte de los pesos de salida de atencion para eliminar los rechazos del modelo base. La conversion a MLX usa cuantizacion mixta oQ8e con calibracion `oqe_code_multilingual` (128 muestras de 512 tokens, adaptativa) y se verifico tensor a tensor contra el GGUF de origen: los tensores no expertos quedan identicos bit a bit y los expertos enrutados mantienen su almacenamiento NVFP4/MXFP8 original.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de hasta 1M tokens.
- Razonamiento y respuesta con "thinking effort" configurable mediante la plantilla de chat incluida (`chat_template.jinja`).
- Comprension de imagenes (VLM): pipeline `image-text-to-text`, usable via oMLX o mlx-vlm.
- Capacidad de codigo y matematicas heredada del modelo base (sin benchmarks publicados en esta ficha).
- Soporte multilingue limitado a ingles y japones.
- Decodificacion especulativa mediante el draft DSpark MTP preservado en el checkpoint.
- Modo sin censura: responde a instrucciones que el modelo original rechaza.
- No se documenta soporte explicito de tool calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: permite estudiar comportamientos que el modelo base rechaza, comparando respuestas censuradas y abliterated en el mismo prompt, gracias a que comparte arquitectura y pesos con el original.
- Red teaming y evaluacion de salvaguardas: util para generar ataques y respuestas adversarias en entornos controlados antes de desplegar sistemas propios con filtros.
- Procesamiento de documentos largos en local: con 1M de contexto puede resumir o extraer informacion de codebases, contratos o expedientes completos en un Mac con suficiente memoria unificada.
- Analisis de imagenes en flujo conversacional: al ser VLM, admite preguntas sobre capturas, diagramas o documentos escaneados combinadas con texto largo en la misma sesion.
- Desarrollo asistido en japones e ingles: generacion y revision de codigo o textos tecnicos en ambos idiomas sobre hardware Apple, sin depender de la nube.
- Prototipado de asistentes privados: al ejecutarse con oMLX en local y con pesos abiertos, sirve para validar productos donde la confidencialidad impide usar APIs externas.
- Experimentacion con decodificacion especulativa: el draft DSpark permite medir ganancias de throughput en Apple Silicon con oMLX Lightning MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 18,1 GB en disco (mas 0,64 GB de draft), por lo que en inferencia se recomienda al menos 24 GB de memoria unificada para margen de contexto y cache KV; 32 GB o mas para contextos largos.
- Hardware objetivo: Apple Silicon (MLX). No es ejecutable en GPU NVIDIA/AMD con este formato.
- Equipos recomendados: Mac con chip M-series de 32 GB o superior (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max); en 24 GB cabe con contextos moderados.
- No cabe en GPUs consumer tipo RTX 4090 con este runtime; para esas GPUs habria que usar el GGUF de origen con llama.cpp.
- Despliegue: oMLX 0.8.4 o superior (`omlx serve`, API compatible con OpenAI); tambien mlx-vlm para uso de vision. No es cargable por mlx-lm estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; la decodificacion especulativa con DSpark deberia mejorar el throughput respecto a decodificacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Runtime |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unlock-MLX-oQ8e | 26,4B totales / 3,4B activos | 1M | Texto + vision | Apache 2.0 | oMLX (Apple Silicon) |
| Inkling-2-Mini (original) | 26,4B totales / 3,4B activos | 1M | Texto + vision | Apache 2.0 | Multiples (segun pesos) |
| Inkling-2-Mini-Unlock-GGUF | 26,4B totales / 3,4B activos | 1M | Texto + vision | Apache 2.0 | llama.cpp y derivados |
| Modelos densos ~3-4B activos de proposito general | 3-4B | Variable | Texto | Variable | Multiples |

La comparativa con modelos de terceros no esta disponible en la informacion proporcionada; las alternativas mas directas son las otras distribuciones del mismo modelo base (original y GGUF abliterated).

## Limitaciones y advertencias

- Modelo sin censura (abliterated): sigue instrucciones que el original rechaza; no debe exponerse a servicios publicos sin mecanismos de seguridad propios.
- Se aplica la politica de uso aceptable del modelo base; prohibido para contenido violento, armas, ataques a sistemas, abuso infantil o usos ilegales.
- Ligera perdida de comprension de imagen respecto al modelo oficial, segun el autor.
- La escritura de formato largo tiende a cerrarse en 1.000-1.500 caracteres en lugar de extenderse.
- Solo soporta ingles y japones; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados para esta conversion.
- Checkpoint nativo oMLX: requiere oMLX 0.8.4 o superior y no funciona con mlx-lm estandar, lo que limita portabilidad.
- Conversion no oficial de la comunidad; no afiliada a Thinking Machines Lab, isichan-ai ni Unsloth.
- El esquema oQ8e mezcla precisiones (8-bit base, NVFP4/MXFP8 en expertos), por lo que puede haber diferencias numericas frente al modelo en 16 bits en tareas sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/studio-rizi/Inkling-2-Mini-Unlock-MLX-oQ8e
- Modelo base abliterated (GGUF): https://huggingface.co/isichan-ai/Inkling-2-Mini-Unlock-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime oMLX: https://github.com/jundot/omlx
- Politica de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Perfil del autor de la abliteration: https://huggingface.co/isichan-ai
- Organizacion Thinking Machines Lab: https://huggingface.co/thinkingmachines
- Perfil de Unsloth (pipeline GGUF): https://huggingface.co/unsloth
