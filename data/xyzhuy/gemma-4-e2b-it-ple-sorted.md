# xyzhuy/gemma-4-E2B-it-ple-sorted

## Resumen

`xyzhuy/gemma-4-E2B-it-ple-sorted` no es un modelo completo, sino un artefacto derivado del modelo base `google/gemma-4-E2B-it`. Concretamente, contiene la tabla de embeddings por capa (`per_layer_token_embd.weight`) del fichero GGUF `gemma-4-E2B-it-Q4_K_M.gguf` de `unsloth/gemma-4-E2B-it-GGUF`, sin modificar byte a byte, pero con sus 262.144 filas reordenadas de mayor a menor frecuencia de token, medida sobre corpus multilingüe de chat, Wikipedia y código.

El propósito es habilitar la carga progresiva del modelo en el navegador mediante WebGPU a través del proyecto Pocket Compute. El fichero `ple-sorted.bin` se estructura de forma que las primeras 32.768 filas (las de tokens más frecuentes) se cargan junto con el modelo, permitiendo iniciar una conversación tras aproximadamente 1,7 GB de descarga, mientras el resto se recupera en segundo plano en un orden fijo e independiente de lo que escriba el usuario.

El modelo base Gemma 4 E2B es un transformer de 2.100 millones de parámetros, solo texto, con 8.000 tokens de contexto, diseñado por Google DeepMind para ejecución local en CPU y dispositivos de borde. Este repositorio es, por tanto, un componente de infraestructura para despliegue web, no un modelo afinado para una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Gemma 4 E2B); este repositorio contiene solo la tabla de embeddings por capa |
| Parametros totales | 2.100 millones (modelo base); el artefacto contiene 262.144 filas × 8.960 valores |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.000 tokens (modelo base) |
| Tipos de cuantizacion | Q5_K para la tabla de embeddings incluida; el GGUF de origen es Q4_K_M |
| Idiomas soportados | no disponible (el corpus de ordenacion es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | `ple-sorted.bin` (binario little endian con cabecera `PLE2`); no es safetensors ni GGUF completo |

## Arquitectura y entrenamiento

El artefacto no entrena nada: reordena las filas de la tabla `per_layer_token_embd.weight` del GGUF Q4_K_M de Gemma 4 E2B. Cada fila ocupa 6.160 bytes, correspondientes a 35 capas × 256 valores en Q5_K. El fichero resultante tiene una cabecera de 16 bytes con la firma `PLE2`, el numero de filas (262.144), los bytes por fila (6.160) y las filas a cargar por adelantado (32.768), seguida de un array de identificadores de token en orden de fichero y de los datos de las filas en ese mismo orden.

La innovacion es puramente de despliegue: al ordenar por frecuencia de token, las filas necesarias para las primeras interacciones quedan al principio del fichero, lo que permite streaming determinista. El orden de las peticiones no depende de la entrada del usuario, lo que facilita cacheado y precarga en CDN. El modelo base, Gemma 4 E2B, es un transformer denso de 2,1 mil millones de parametros, solo texto, orientado a ejecucion en CPU y entornos de bajos recursos.

## Capacidades

- Generacion de texto y razonamiento basico heredados del modelo base Gemma 4 E2B.
- Ejecucion completa en navegador mediante WebGPU a traves de Pocket Compute.
- Carga progresiva: conversacion disponible tras aproximadamente 1,7 GB de descarga.
- Recuperacion en segundo plano de las filas restantes en orden fijo.
- Capacidades multilingues del modelo base (no detalladas en la informacion disponible).
- No incluye por si mismo pesos de atencion, MLP ni cabezas de salida; debe combinarse con el resto del modelo base.

## Casos de uso

- Demos web de IA local sin backend: Pocket Compute carga el modelo en el navegador y usa este fichero para iniciar la conversacion rapidamente, sin enviar datos a un servidor.
- Aplicaciones educativas interactivas: un cuaderno o tutorial web puede mostrar un LLM funcionando en el cliente con una primera respuesta en pocos segundos.
- Prototipado de asistentes embebidos: util para validar UX de chat local antes de invertir en infraestructura GPU.
- Distribucion en CDN con cache: al ser el orden de peticiones determinista, los fragmentos pueden cachearse de forma agresiva y compartida entre usuarios.
- Entornos con conectividad limitada: la conversacion puede comenzar con una descarga parcial y completarse en segundo plano.
- Investigacion sobre carga progresiva de modelos: sirve como referencia para estudiar tecnicas de streaming de pesos y su impacto en latencia percibida.
- Pruebas de inferencia WebGPU: permite medir throughput y latencia de Gemma 4 E2B en distintos navegadores y GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo completo; el artefacto ocupa 1,6 GB en disco.
- GPU recomendadas: cualquier GPU compatible con WebGPU para el caso de uso previsto (navegador); no se especifican modelos concretos.
- Cabe en GPU de consumo: si, segun la informacion del modelo base, que puede ejecutarse en CPU y dispositivos de borde.
- Opciones de despliegue: navegador con WebGPU mediante Pocket Compute; el GGUF de origen puede usarse con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `xyzhuy/gemma-4-E2B-it-ple-sorted` | 2,1 B (base) | 8.000 | Apache-2.0 | `ple-sorted.bin` | Solo tabla de embeddings reordenada |
| `unsloth/gemma-4-E2B-it-GGUF` | 2,1 B | 8.000 | Apache-2.0 | GGUF (Q4_K_M) | Modelo completo cuantizado |
| `google/gemma-4-E2B-it` | 2,1 B | 8.000 | Apache-2.0 | safetensors (presumiblemente) | Modelo base oficial |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el resto de pesos de Gemma 4 E2B no puede generar texto.
- El orden por frecuencia se midio sobre un corpus concreto (chat multilingue, Wikipedia y codigo); puede no ser optimo para dominios muy especializados.
- El contexto del modelo base es de solo 8.000 tokens, limitado para conversaciones largas o documentos extensos.
- Riesgo de alucinacion inherente al modelo base, no evaluado en este repositorio.
- Sesgos del modelo base no documentados en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta; sin garantias de mantenimiento.
- La licencia Apache-2.0 se hereda de Gemma 4, pero conviene verificar los terminos de uso del modelo base de Google para produccion.

## Enlaces

- Hugging Face: https://huggingface.co/xyzhuy/gemma-4-E2B-it-ple-sorted
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- GGUF de origen: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Pocket Compute: https://pocketcompute.vercel.app/local/gemma
- Pagina de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
