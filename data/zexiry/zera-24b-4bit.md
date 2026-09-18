# Zexiry/Zera-24B-4bit

## Resumen

Zera-24B-4bit es un modelo de lenguaje de 23.572.403.200 parametros (23,57B) publicado por el usuario Zexiry en HuggingFace, distribuido ya fusionado ("standalone fused model") en formato MLX cuantizado a 4 bits. Se trata de un ajuste fino mediante QLoRA sobre el modelo base `mlx-community/Devstral-Small-2507-4bit`, orientado a generacion de codigo, depuracion, explicaciones tecnicas, conversacion general, gramatica y vocabulario. La model card indica que el usuario no necesita cargar un adaptador aparte del modelo principal.

El modelo es relevante dentro de un nicho muy concreto: desarrolladores que trabajan en Apple Silicon con el framework MLX y quieren un asistente de codigo de ~24B en 4 bits que quepa en memoria unificada de equipos de consumo. Al derivar de Devstral-Small-2507, hereda la familia tecnica de Mistral, aunque la model card no documenta la arquitectura de forma explicita.

El nivel de validacion publica es muy bajo: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados ni documentacion sobre el dataset de ajuste, el numero de tokens de entrenamiento o el proceso de alineamiento. Por tanto, debe tratarse como un modelo experimental hasta que exista evidencia reproducible de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita en la model card; los tags del repositorio indican "mistral" y el modelo base es Devstral-Small-2507, de la familia Mistral |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible (no se especifica en la model card) |
| Tipos de cuantizacion | MLX 4-bit con group size 64; ajuste fino previo con QLoRA (rank 32, 24 capas adaptadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (libreria `mlx-lm`); repositorio de 13,3 GB |

## Arquitectura y entrenamiento

La informacion proporcionada describe un ajuste fino de tipo QLoRA con rango 32 y 24 capas adaptadas aplicado sobre `mlx-community/Devstral-Small-2507-4bit`, que a su vez es una version cuantizada a 4 bits de Devstral-Small-2507. Los adaptadores se han fusionado en los pesos del modelo, de modo que el resultado es un unico artefacto de 4 bits (group size 64) cargable directamente con MLX. No se detalla la arquitectura interna (atencion, normalizacion, tipo de posicional encoding) ni si se introdujeron modificaciones estructurales durante el ajuste.

Tampoco hay informacion sobre la composicion del dataset de ajuste, el numero de tokens vistos, la mezcla de tareas (codigo, gramatica, conversacion) ni si se aplicaron tecnicas de alineamiento como RLHF, DPO o rejection sampling. La model card menciona un template de chat que inyecta por defecto la identidad "Zera" cuando la aplicacion no proporciona un system prompt, pero no documenta el formato exacto de ese template ni los tokens especiales asociados.

## Capacidades

- Generacion de codigo: el modelo se presenta explicitamente ajustado para programacion, incluyendo escritura de estructuras de datos y algoritmos (la model card usa como ejemplo la generacion de un trie en Python).
- Depuracion: orientado a tareas de debugging segun la descripcion del autor.
- Explicaciones tecnicas: capacidad declarada para producir explicaciones de conceptos tecnicos.
- Conversacion general: soporte de dialogo multi-turno mediante template de chat con roles (`messages` con `role` y `content`).
- Gramatica y vocabulario: ajuste orientado a correccion gramatical y uso de vocabulario, probablemente en ingles.
- Identidad de asistente configurable: el template aplica una identidad por defecto ("Zera") si la aplicacion no define un system prompt, y permite sobrescribirla.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilinguismo: no; el unico idioma declarado es ingles.
- Capacidades multimodales (vision, audio): no disponibles; la pipeline declarada es `text-generation`.

## Casos de uso

- Asistente de codigo en local sobre Apple Silicon: cargando el modelo con `mlx-lm` en un Mac con memoria unificada suficiente, se puede usar como autocompletado y generacion de funciones sin depender de APIs externas, aprovechando que los pesos de 4 bits ocupan aproximadamente 13 GB.
- Generacion de estructuras de datos y algoritmos de uso comun: el ajuste declarado cubre escritura de codigo en Python y similares (tries, arboles, ordenacion), por lo que encaja en tareas de scaffolding rapido de utilidades.
- Depuracion asistida: dado un fragmento de codigo y un mensaje de error, el modelo puede proponer causas probables y correcciones, apoyandose en su ajuste especifico en debugging.
- Explicacion de codigo heredado: generar documentacion y explicaciones en lenguaje natural de modulos poco documentados, con salida en ingles.
- Correccion gramatical y de estilo en ingles: revision de textos tecnicos (README, comentarios, documentacion) para mejorar gramatica y vocabulario.
- Chat tecnico de proposito general: conversaciones multi-turno sobre conceptos de ingenieria gracias al template conversacional, con la posibilidad de fijar un system prompt propio.
- Prototipado de pipelines de IA generativa en MLX: usar el modelo como componente de pruebas en entornos de desarrollo sobre macOS antes de migrar a despliegues en servidor con otros formatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MBPP ni ninguna otra evaluacion, y la busqueda web realizada no ha devuelto resultados relevantes sobre el modelo (unicamente paginas no relacionadas sobre dominios y procesos de instalacion de terceros).

## Requisitos de hardware

- VRAM / memoria: los pesos en 4 bits con group size 64 suman aproximadamente 13,3 GB (tamano del repositorio). Hay que anadir el overhead de la cache KV, que crece con la longitud de contexto, y el runtime de MLX.
- Memoria unificada recomendada: un equipo Apple Silicon con 16 GB de memoria unificada queda muy justo; 24 GB permite cargar el modelo con contexto moderado y 32 GB o mas ofrece margen comodo para contextos largos y otras aplicaciones abiertas.
- GPU recomendadas: el formato MLX esta disenado para chips de Apple (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No se indica soporte para CUDA (A100, H100, RTX 4090) ni ROCm en la informacion disponible.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple Silicon de gama alta y en modelos con memoria unificada de 24-32 GB o superior. No hay confirmacion de funcionamiento en GPUs de consumo tipo RTX 4090 sin conversión previa del formato.
- Opciones de despliegue: `mlx-lm` (carga y generacion directa en Python) y, previsiblemente, servidores compatibles con MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el repositorio no incluye pesos en GGUF ni en safetensors estandar de PyTorch.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y cuantizacion | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Zera-24B-4bit | 23,57B | MLX 4-bit (group size 64) | No disponible | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en la consulta | No disponibles |
| mlx-community/Devstral-Small-2507-4bit (modelo base) | No disponible en la informacion proporcionada | MLX 4-bit | No disponible | No disponible en la informacion proporcionada | HuggingFace (referenciado como base) | No disponibles |
| Otras alternativas de codigo de ~24-32B (por ejemplo variantes de la familia Mistral o de Qwen Coder) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponibles |

No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria. La unica relacion documentada es la dependencia directa del modelo base `mlx-community/Devstral-Small-2507-4bit`.

## Limitaciones y advertencias

- Idiomas: unicamente ingles declarado, por lo que el rendimiento en castellano u otros idiomas no esta garantizado y previsiblemente sera inferior.
- Contexto: no se documenta la longitud de contexto soportada, lo que impide planificar tareas de contexto largo con garantias.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos, toxicidad o comportamiento diferencial. Un ajuste QLoRA sobre un modelo ya cuantizado a 4 bits puede degradar o alterar los comportamientos de seguridad heredados.
- Alucinacion: sin benchmarks ni evaluaciones independientes, el riesgo de generar codigo incorrecto o APIs inexistentes es alto; se recomienda validacion automatica (tests, linters, ejecucion) de cualquier salida usada en produccion.
- Licencia: Apache-2.0 permite uso comercial, pero se mantiene el `base_model` en los metadatos por "reproducibility, attribution and license compliance", de modo que conviene revisar tambien la licencia y las condiciones del modelo base antes de un despliegue comercial.
- Portabilidad: al estar en formato MLX 4-bit, el modelo no es directamente usable con los stacks de inferencia mas comunes (vLLM, TGI, llama.cpp, Ollama) sin conversion, lo que limita su uso en servidores con GPU NVIDIA o AMD.
- Madurez: el repositorio acumula 0 descargas y 0 likes, sin resultados de benchmarks ni documentacion del proceso de entrenamiento, por lo que debe considerarse un artefacto experimental no validado.
- Trazabilidad del ajuste: no se detalla el dataset de QLoRA ni si este contenia datos con licencias compatibles con Apache-2.0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zexiry/Zera-24B-4bit
- Modelo base referenciado: https://huggingface.co/mlx-community/Devstral-Small-2507-4bit
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm
- Paper, blog o repositorio adicional del autor: no disponible.
- Resultados de busqueda web relevantes: no se han encontrado; las busquedas devolvieron unicamente paginas no relacionadas con el modelo.
