# XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.4

## Resumen

`gemma-4-E2B-it-agent-posttrain-v1.4` es un ajuste fino (fine-tuning) del modelo instructivo `google/gemma-4-E2B-it` de Google, desarrollado por el usuario XcaliburMoon. No es un modelo de propósito general: es un artefacto de investigación post-entrenado específicamente para emitir una única llamada a herramienta (tool call) en formato JSON legible por máquina por turno, contra una superficie fija de diez herramientas simuladas. El runtime parsea el objeto de acción y devuelve el resultado de la herramienta como observación en el siguiente turno.

El modelo parte de una arquitectura Gemma 4 con 4.628.569.635 parámetros totales (según los pesos en safetensors), y se distribuye en tres formatos: pesos completos en bf16 (`merged-bf16`, 10,21 GB), un adaptador LoRA (`adapter`, 96,7 MB) y seis cuantizaciones GGUF para llama.cpp (desde Q2_K de 2,98 GB hasta f16 de 9,27 GB). El entrenamiento se realizó con QLoRA de 4 bits sobre 10.000 registros supervisados, con una longitud de secuencia de 1312 tokens y dos épocas.

Su relevancia es acotada pero clara: sirve como referencia reproducible de cómo un modelo pequeño puede especializarse en un contrato de tool calling estricto, con métricas de holdout publicadas y desglosadas por herramienta. El autor es explícito al advertir que no debe usarse como modelo de chat general ni en entornos donde una respuesta no parseada pudiera ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4), ajuste fino con QLoRA |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `--ctx-size 4096` |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16; pesos completos en bf16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Gemma Terms of Use (heredada del modelo base Google Gemma) |
| Formato de pesos | safetensors (merged-bf16 y adaptador LoRA), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Gemma 4, tomado del checkpoint instructivo `google/gemma-4-E2B-it` y continuado desde los pesos fusionados de una versión anterior (`XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3`). El ajuste se hizo con QLoRA de 4 bits (nf4 con doble cuantización), rango r=16, alpha=32 y dropout de 0,05. El conjunto de entrenamiento consta de 10.000 registros supervisados, con longitud de secuencia de 1312 tokens, batch efectivo de 8, 2 épocas, learning rate de 0,0001 y 626 pasos, hasta una pérdida final de 0,8449. El entrenamiento se ejecutó en cuatro NVIDIA A40 durante 0,7 horas.

La innovación técnica no está en la arquitectura, sino en el contrato de salida: el modelo se entrena para responder exactamente un objeto JSON con la forma `{"action": "tool", "tool": "...", "args": {...}}` contra un menú fijo de diez herramientas (write_file, append_file, run_command, sql_incubator, search_files, finish, make_directory, read_file, delete_file, list_files). La plantilla de chat se aplica con `enable_thinking=False`, y la receta enmascara explícitamente el prompt en lugar de depender de la forma de los datos. No se ejecutó ninguna etapa de preferencias (RLHF/DPO); solo hay supervisión.

## Capacidades

- Generación de llamadas a herramienta en JSON: emite un único objeto de acción por turno, parseable por el runtime.
- Selección de herramienta dentro de una superficie fija de diez herramientas simuladas.
- Relleno de argumentos con estructura predefinida (rutas, comandos, patrones, contenido).
- Operaciones de sistema de ficheros simuladas: lectura, escritura, anexado, borrado, listado y creación de directorios.
- Ejecución de comandos simulada (`run_command`) y consultas a un entorno SQL simulado (`sql_incubator`).
- Señal de finalización de tarea mediante la herramienta `finish`.
- No soporta tool calling arbitrario: una herramienta fuera del menú de entrenamiento no está cubierta.
- No dispone de modo thinking, visión, audio ni capacidades multimodales declaradas.
- Multilingüismo limitado al inglés.
- No está diseñado para conversación multi-turno general ni para razonamiento de varios pasos fuera del bucle agente-runtime.

## Casos de uso

- **Bucle de agente con herramientas simuladas en investigación:** el modelo emite la acción, el harness la parsea, ejecuta la herramienta simulada y realimenta la observación. Es adecuado porque su formato de salida está entrenado para ser parseable de forma estricta y el autor proporciona `tools-pair-builder` para construir el prompt y medir la respuesta sin ejecutar nada.
- **Evaluación de contratos de tool calling:** sirve como referencia para medir la tasa de acierto de un modelo pequeño en la selección de herramienta y el relleno de argumentos, con métricas de holdout desglosadas por herramienta (por ejemplo, `list_files` 0,769 frente a `write_file` 0,062).
- **Prototipado de asistentes de sistema de ficheros:** con las herramientas `read_file`, `list_files`, `make_directory` y `delete_file`, se puede montar un agente de gestión de ficheros en un entorno controlado; el modelo es más fiable en `list_files` y `read_file` que en escritura.
- **Banco de pruebas de cuantización:** al publicar seis GGUF, permite medir la degradación de precisión entre Q4_K_M y bf16 en la misma tarea de tool calling, algo útil para decidir qué cuantización desplegar.
- **Generación de comandos en pipelines de automatización controlada:** la herramienta `run_command` (0,294 de acierto en holdout) puede emplearse para proponer comandos que un humano o un validador revise antes de ejecutar, nunca de forma autónoma.
- **Investigación sobre fallos de selección de herramienta:** los fallos medidos (contenido distinto, comando distinto, ruta distinta, patrón distinto) sirven para estudiar por qué un modelo pequeño confunde herramientas con descripciones parecidas y para justificar una etapa de preferencias.
- **Despliegue local ligero con llama.cpp:** el fichero Q4_K_M (3,42 GB) permite ejecutar el modelo en hardware de consumo para pruebas de integración del harness, con `llama-server -m gguf/gemma-agent-Q4_K_M.gguf --port 8080 --ctx-size 4096`.

## Benchmarks y rendimiento

El autor publica una evaluación de holdout sobre 200 filas no vistas, con decodificación greedy y tres comprobaciones: un único objeto JSON, la misma herramienta y todos los argumentos dorados presentes e iguales (tras normalizar espacios, comillas y un `./` inicial).

| Metrica | Valor |
|---|---|
| Filas de holdout | 200 |
| Llamadas acertadas | 97 (48,5%) |
| Aciertos por normalización | 1 |
| Comparación | normalizada |

| Herramienta | Aciertos | Filas | Precision |
|---|---|---|---|
| write_file | 1 | 16 | 0,062 |
| append_file | 1 | 10 | 0,100 |
| run_command | 10 | 34 | 0,294 |
| sql_incubator | 5 | 14 | 0,357 |
| search_files | 7 | 19 | 0,368 |
| finish | 12 | 22 | 0,545 |
| make_directory | 4 | 6 | 0,667 |
| read_file | 32 | 46 | 0,696 |
| delete_file | 5 | 7 | 0,714 |
| list_files | 20 | 26 | 0,769 |

Motivos de fallo registrados: contenido distinto (16), comando distinto (14), ruta distinta (9), patrón distinto (8), argumentos distintos (6), solapamiento de respuesta (6) y 25 motivos menos frecuentes. La medición se hizo sobre `merged-bf16` con el adaptador aplicado, no sobre los ficheros GGUF; el autor recomienda reevaluar la cuantización que se vaya a desplegar. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** aproximadamente 3,5 GB para Q4_K_M (3,42 GB de pesos más overhead de contexto), 2,98 GB para Q2_K, 4,95 GB para Q8_0 y unos 10,2 GB para bf16.
- **GPU recomendadas:** el entrenamiento se realizó en cuatro NVIDIA A40. Para inferencia, cualquier GPU con al menos 4-5 GB de VRAM libre sirve para Q4_K_M; una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB cubren con holgura todas las cuantizaciones, incluida f16.
- **Cabe en GPU de consumo:** sí, en cualquier GPU moderna con 6 GB o más para Q4_K_M; Q8_0 requiere unos 6 GB y f16 unos 10-11 GB.
- **Opciones de despliegue:** llama.cpp (el autor documenta `llama-server`), y por los formatos publicados (safetensors más adaptador) también es compatible con transformers. No se documentan recetas para vLLM, TGI u Ollama en la información disponible.
- **Latencia y throughput:** no disponibles. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-agent-posttrain-v1.4 | 4.628.569.635 | no disponible (ejemplo con 4096) | Tool calling restringido a 10 herramientas | Gemma Terms of Use | Hugging Face, GGUF y safetensors |
| google/gemma-4-E2B-it (base) | no disponible en esta ficha | no disponible | Modelo instructivo de propósito general | Gemma Terms of Use | Hugging Face |
| Versiones previas del mismo autor (v1.1, v1.3) | no disponible | no disponible | Mismo contrato de tool calling, iteraciones anteriores | Gemma Terms of Use | Hugging Face |

No se dispone en la información proporcionada de datos de benchmarks de los modelos comparables que permitan contrastar rendimiento. La comparación con el modelo base resulta además engañosa en precisión: el ajuste sacrifica generalidad por adherencia a un formato concreto.

## Limitaciones y advertencias

- **Superficie de herramientas cerrada:** entrenado sobre una sola superficie de diez herramientas; una herramienta que no esté en el menú no existe para el modelo.
- **Solo supervisión, sin preferencias:** no se ejecutó etapa RLHF/DPO, y los fallos medidos son precisamente elecciones de herramienta o de valor equivocadas en herramientas con descripciones parecidas.
- **Solo inglés y tareas cortas:** una llamada por turno, sin capacidad multi-turno general.
- **Observaciones de entrenamiento ficticias:** el modelo nunca vio salida real de shell, por lo que puede afirmar con confianza cosas falsas sobre lo que devolvió un comando.
- **Precisión baja en escritura:** `write_file` (0,062) y `append_file` (0,100) son las herramientas con peor acierto; no es fiable para generar contenido de ficheros.
- **Riesgo de alucinación en argumentos:** los fallos de ruta, patrón y comando indican que puede inventar valores plausibles pero incorrectos.
- **Cuantizaciones con pérdida:** los GGUF son lossy respecto a bf16; hay que evaluar la cuantización concreta que se despliegue.
- **Licencia:** hereda los Gemma Terms of Use; hay que revisarlos antes de redistribuir o desplegar comercialmente.
- **Repositorio sin tag:** solo existe `main`, y una carga posterior reemplaza los ficheros en lugar de añadirse al lado; no hay versionado estable por tag.
- **Uso inseguro:** el propio autor advierte que no debe usarse donde una respuesta no parseada pudiera ejecutarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.4
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Versión anterior citada como base del entrenamiento: https://huggingface.co/XcaliburMoon/gemma-4-E2B-it-agent-posttrain-v1.3
- Gemma Terms of Use: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
