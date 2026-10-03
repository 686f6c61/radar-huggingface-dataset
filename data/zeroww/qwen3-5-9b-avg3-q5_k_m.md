# ZeroWw/Qwen3.5-9B-avg3-Q5_K_M

## Resumen

ZeroWw/Qwen3.5-9B-avg3-Q5_K_M es un artefacto derivado en formato GGUF construido mediante un promedio uniforme en espacio de pesos de tres builds GGUF distintas de la variante de 9B de la familia Qwen3.5. No ha habido entrenamiento ni ajuste fino: el autor descomprime las tres fuentes a float32, calcula la media por tensor y la recuantiza a Q5_K_M reutilizando la mezcla de cuantizacion de la fuente 2. El resultado es un unico fichero de 6.467.967.168 bytes (6,02 GiB) con 427 tensores y arquitectura `qwen35`.

El modelo resuelve un problema acotado: colocar un punto intermedio en espacio de pesos entre un destilado de MiMo-V2.6 y dos builds derivadas de DeepSeek-V4-Flash sobre Qwen3.5-9B, de modo que el resultado quede mas cerca de todas las fuentes de lo que cualquiera de ellas esta de las demas. El numero de parametros totales declarado es 8.953.803.264 (unos 8,95 B).

La relevancia practica es doble. Por un lado, es un ejemplo reproducible y verificado de merge a nivel de k-quants con los cuantizadores nativos de llama.cpp, con verificacion bit a bit de los 427 tensores. Por otro, el propio autor documenta una advertencia importante: dos de las tres fuentes son casi duplicadas (294 de 427 tensores son identicos byte a byte), de modo que el resultado efectivo equivale a `1/3 · MiMo + 2/3 · DeepSeek-V4-Flash`. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Identificador en el GGUF: `qwen35`; 32 bloques, 427 tensores. Los metadatos incluyen parametros SSM (normas y parametros SSM en F32), lo que apunta a una topologia hibrida atencion/SSM, si bien el autor no describe la arquitectura en detalle. No es un modelo entrenado, sino una media de pesos |
| Parametros totales | 8.953.803.264 (aprox. 8,95 B) |
| Parametros activos | No aplica: no se describe como MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El ejemplo de servidor de la model card usa `-c 8192`; la verificacion de perplejidad se hizo con `--ctx-size 512` |
| Tipos de cuantizacion | Fichero servido en Q5_K_M (una sola variante). Mezcla interna heredada de la fuente 2: Q6_K para `output.weight`, `ffn_down.weight`, `attn_qkv.weight` y `attn_v.weight`; Q5_K en el resto de matrices; F32 en tensores 1-D (normas y parametros SSM). `general.file_type = 17` (MOSTLY_Q5_K_M). Sin importance matrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (alineacion 32). No existe version en safetensors ni en transformers |
| Tamano del archivo | 6.467.967.168 bytes (6,02 GiB) |
| SHA256 | `ff4a17728060979b2922727ac9daf01f5a54dc438fd4558267fc83cad0c7c5f8` |
| Runtime verificado | llama.cpp b11374 (build con soporte `qwen35`) |

## Arquitectura y entrenamiento

No hay entrenamiento. El procedimiento es una media uniforme en espacio de pesos: para cada tensor, `W = (dequant(W1) + dequant(W2) + dequant(W3)) / 3` en float32, seguido de una recuantizacion al tipo objetivo por tensor. Los enteros cuantizados nunca se promedian directamente, porque cada bloque k-quant lleva sus propios escalares `d`/`dmin` y los enteros de dos modelos no comparten codigo. La descompresion y recompresion se hicieron con los propios cuantizadores de llama.cpp cargados via `ctypes` desde `libggml-base.so` (`dequantize_row_*` / `quantize_row_*_ref`), de modo que el layout de bloques es identico al de la implementacion de referencia.

Las tres fuentes son `MiMo-V2.6-Distill-Qwen-9B-Q5_K_M.gguf` (bases declaradas: Qwen/Qwen3.5-9B) y dos builds `Qwen3.5-9B-DeepSeek-V4-Flash.Q5_K_M` / `_V2.gguf` (base declarada: unsloth/Qwen3.5-9B, upstream Jackrong/Qwen3.5-9B-DeepSeek-V4-Flash). Pese al sufijo `_Q5_K_M` comun, no estan cuantizadas igual: la fuente 1 mantiene 70 tensores en Q8_0. Se excluyo deliberadamente `Qwen3.8-9B-Q5_K_M.gguf` porque tiene 33 bloques en lugar de 32 y una cabeza de prediccion multi-token (`qwen35.nextn_predict_layers = 1`, 442 tensores con un grupo `blk.32.*` sin contrapartida), lo que habria obligado a inventar tensores o a eliminar una capa completa.

El detalle tecnico mas relevante es la verificacion: para cada uno de los 427 tensores se recalculo la media float32 de forma independiente, se recuantizo al tipo objetivo y se comparo con lo almacenado, con un resultado de `worst rmse(stored, ideal_requantized_mean) / sigma = 0.000e+00`, es decir, identidad bit a bit con la media recuantizada ideal. El error residual frente a la media float32 exacta es unicamente el redondeo Q5_K/Q6_K: 0,00018-0,00051 rms frente a una sigma por tensor de 0,009-0,027. Los tensores grandes se procesaron por trozos de filas (`output.weight` solo son 1,02 B de parametros, 4 GB en float32), con un pico de RSS de aproximadamente 580 MB en una maquina de 4 nucleos y 15 GB, sin copia intermedia en F16 y con escritura en streaming. Los metadatos KV (tokenizer, plantilla de chat, hiperparametros de rope/SSM) se heredan literalmente de la fuente 2.

## Capacidades

- Generacion de texto conversacional: el fichero hereda la plantilla de chat y el tokenizer de la fuente 2, y se verifico generacion de texto coherente bajo llama.cpp b11374.
- Razonamiento: la etiqueta `reasoning` figura entre las del repositorio, y las fuentes son destilados orientados a razonamiento, aunque el autor no publica evaluaciones de razonamiento para este artefacto.
- Inferencia local en CPU o GPU via llama.cpp: es el caso de uso explicitamente documentado, con ejemplos de `llama-cli` y `llama-server` (API compatible con OpenAI).
- Mezcla de comportamiento entre checkpoints: al ser una media en espacio de pesos, tiende a promediar comportamientos de las fuentes en lugar de especializarse en uno.
- Capacidades multilingues: no disponibles. No se declara lista de idiomas ni evaluacion por idioma.
- Tool calling / function calling: no disponible. No se documenta soporte explicito; la plantilla de chat heredada podria permitirlo, pero no hay verificacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible para este fichero concreto.
- Vision: no disponible en este artefacto. La familia Qwen3.5 se presenta publicamente como multimodal nativa, pero este GGUF deriva de mezclas de la variante de 9B y no declara entrada de imagen.
- Modo thinking explicito: no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU dedicada: el fichero ocupa 6,02 GiB y esta cuantizado a Q5_K_M, de modo que puede ejecutarse con llama.cpp en CPU con la biblioteca `ggml` y un presupuesto de RAM moderado (el propio autor realizo el merge en una maquina de 4 nucleos y 15 GB).
- Servicio compatible con OpenAI en una sola maquina: `llama-server -m Qwen3.5-9B-avg3-Q5_K_M.gguf -c 8192 -t 4` levanta un endpoint HTTP que puede consumirse desde clientes que ya hablan la API de OpenAI, util para prototipos internos y entornos aislados sin acceso a APIs en la nube.
- Evaluacion de tecnicas de model merging: el repositorio documenta el procedimiento completo (descuantizacion, media, recuantizacion, verificacion bit a bit), por lo que sirve como referencia reproducible para investigar merges a nivel de k-quants sin pasar por float16.
- Base para comparativas de perplejidad entre checkpoints emparentados: al situarse en el centro del espacio de pesos de las fuentes, es un punto de control util para medir si un merge intermedio degrada o no la perplejidad frente a cada fuente por separado.
- Asistente conversacional offline para documentacion tecnica: con ventana de 8192 tokens en el ejemplo del autor, cubre fichas, manuales y conversaciones multi-turno de extension media en un equipo local.
- Generacion de codigo en entornos con requisitos de confidencialidad: al ejecutarse integramente en local y bajo licencia Apache 2.0, permite asistencia de programacion sin enviar codigo propietario a servicios externos.
- Prototipado rapido de aplicaciones de texto en CPU: la ausencia de dependencias de CUDA y el formato GGUF unico simplifican el despliegue en contenedores ligeros.
- Punto de partida para merges adicionales: al existir los tres GGUF fuente y publicarse el metodo, es un candidato natural para experimentar con ponderaciones no uniformes que corrijan el sesgo 1/3-2/3 descrito por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una medicion de perplejidad sobre un texto fijo de aproximadamente 1.660 tokens (26 trozos de 64, con `--ctx-size 512`), pero el texto proporcionado se interrumpe antes de mostrar los valores, por lo que no se reproducen cifras. Tampoco hay MMLU, HumanEval, GSM8K ni comparativas numericas con las fuentes.

Los unicos datos cuantitativos de rendimiento publicados son los de la verificacion del merge:

| Comprobacion | Resultado |
|---|---|
| Fidelidad por tensor (427 tensores) | `worst rmse(stored, ideal_requantized_mean) / sigma = 0.000e+00` (identidad bit a bit) |
| Error residual frente a la media float32 exacta | 0,00018-0,00051 rms |
| Sigma por tensor de las matrices cuantizadas | 0,009-0,027 |
| Coincidencia estructural | Nombres, orden, formas, tipos por tensor y tamanos en bytes identicos a la referencia; offsets contiguos y `data_start + suma_tamanos_alineados == filesize` |
| Carga | Parseado correcto por el loader de llama.cpp y por `gguf-py` (`general.file_type = 17`, 427 tensores) |
| Generacion | Texto coherente bajo llama.cpp b11374 |

## Requisitos de hardware

- Memoria minima para el fichero: 6,02 GiB en disco y al menos esa cantidad en RAM o VRAM para cargar los pesos. A partir de ahi hay que sumar la cache KV, que depende de la longitud de contexto configurada.
- Presupuesto de contexto: el ejemplo documentado usa 8192 tokens (`-c 8192`). Configuraciones mayores incrementan la memoria de forma proporcional al numero de capas y a la dimension de la cache.
- GPU de consumo: no se publican mediciones especificas. Por tamano de fichero (6,02 GiB), es compatible con tarjetas de 8 GB o mas si se reserva espacio para la cache KV, y con holgura en tarjetas de 12 GB, 16 GB o 24 GB. Se trata de una estimacion derivada del tamano del archivo, no de una medicion del autor.
- GPU de datacenter: A100, H100 o similares son compatibles, pero sobredimensionadas para un modelo de 8,95 B en Q5_K_M; su uso tendria sentido para servir muchas replicas concurrentes en el mismo dispositivo.
- CPU: viable. El autor completo el proceso de merge en una maquina de 4 nucleos y 15 GB de RAM, y el ejemplo de `llama-cli` usa 4 hilos.
- Opciones de despliegue: llama.cpp (build con soporte `qwen35`; se verifico b11374) tanto en modo CLI como en servidor compatible con OpenAI. Cualquier runtime capaz de leer GGUF v3 con arquitectura `qwen35` deberia poder cargarlo, pero no se documentan pruebas con vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, TTFT ni mediciones de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| ZeroWw/Qwen3.5-9B-avg3-Q5_K_M | 8,95 B (427 tensores) | No disponible | Q5_K_M (unica variante) | Apache 2.0 | Media uniforme de 3 fuentes; dos son casi identicas, resultado efectivo 1/3 MiMo + 2/3 DeepSeek-V4-Flash |
| MiMo-V2.6-Distill-Qwen-9B-Q5_K_M | No disponible en la informacion | No disponible | Q5_K_M con 70 tensores en Q8_0 | No disponible en la informacion | Fuente 1 del merge |
| Qwen3.5-9B-DeepSeek-V4-Flash.Q5_K_M (y V2) | Mismo recuento de tensores que el resultado | No disponible | No homogenea | No disponible en la informacion | Fuentes 2 y 3, con 294 de 427 tensores identicos byte a byte y solo 2.834 bytes distintos sobre 6.457.001.984 |
| bartowski/Qwen_Qwen3.5-9B-GGUF | Base Qwen3.5-9B | No disponible en la informacion | Multiples niveles GGUF | No disponible en la informacion | Cuantizacion directa del modelo base, sin merge |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estas alternativas; la comparativa es estructural y de procedencia.

## Limitaciones y advertencias

- Dos de las tres fuentes del merge son practicamente el mismo checkpoint: 294 de 427 tensores son identicos byte a byte y solo difieren 2.834 bytes de 6.457.001.984 (0,00004 %). El resultado no es una media de tres modelos distintos, sino de dos, con un sesgo 1/3-2/3 hacia DeepSeek-V4-Flash.
- No hay ajuste fino ni alineacion adicional. Cualquier sesgo, alucinacion o comportamiento indeseado de las fuentes se conserva y se mezcla.
- Riesgo de alucinacion: inherente a un modelo de 8,95 B sin evaluacion publicada de veracidad. No hay resultados de benchmarks que permitan acotarlo.
- Sin importance matrix: la cuantizacion a Q5_K_M se hizo sin matriz de importancia, igual que la fuente 2, lo que puede penalizar mas que una cuantizacion guiada.
- Idiomas: no se declara lista de idiomas ni evaluacion multilingue. No debe asumirse un rendimiento uniforme fuera del ingles o el chino sin pruebas.
- Tool calling, agentes y vision: no documentados para este fichero. No deben darse por soportados sin verificacion propia.
- Formato unico: solo existe GGUF. No hay version en safetensors ni compatibilidad directa con transformers, por lo que no se puede afinar sobre este artefacto ni cargarlo en frameworks que exijan pesos nativos.
- Requisito de runtime: necesita una build de llama.cpp con soporte para la arquitectura `qwen35`; se verifico la b11374. Versiones anteriores pueden fallar al cargar.
- Licencia: Apache 2.0 permite uso comercial, pero el artefacto deriva de checkpoints de terceros cuyas condiciones particulares no se detallan en la informacion disponible; conviene revisar la procedencia de cada fuente antes de explotarlo en produccion.
- Estado de adopcion: 0 descargas y 0 likes en el momento de la consulta, y card publicada el 3 de octubre de 2026. No hay validacion independiente de su calidad.
- La verificacion publicada garantiza exactitud numerica del merge, no calidad del modelo resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZeroWw/Qwen3.5-9B-avg3-Q5_K_M
- Modelo base declarado (fuente 1): https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base declarado (fuentes 2 y 3): https://huggingface.co/unsloth/Qwen3.5-9B
- Upstream de la fuente 2: https://huggingface.co/Jackrong/Qwen3.5-9B-DeepSeek-V4-Flash
- Cuantizacion alternativa del base: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Pagina de la familia Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio de la serie Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
