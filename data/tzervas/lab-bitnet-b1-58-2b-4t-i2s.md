# tzervas/lab-bitnet-b1.58-2B-4T-i2s

## Resumen

`tzervas/lab-bitnet-b1.58-2B-4T-i2s` es una conversión a formato GGUF del modelo `microsoft/BitNet-b1.58-2B-4T`, un transformer decoder-only de 2.412.820.480 parámetros cuyos pesos son ternarios (valores en {-1, 0, +1}, de ahí la denominación b1.58). El repositorio no entrena ni modifica el modelo base: empaqueta los pesos bf16 originales en el formato I2_S que consumen los kernels de `bitnet.cpp`, generando un fichero de aproximadamente 1,2 GB.

El interés de esta publicación es práctico: distribuye el GGUF oficial de Microsoft en una variante I2_S (no una cuantización Q4 genérica), pensada para ejecutar inferencia de un modelo de 2B con requisitos de memoria muy reducidos. La model card indica que el checkpoint se generó con `scripts/layer_group_quant.py` sobre una GPU sm120 (RTX 5080) comparando contra los safetensors bf16, y que los destinos declarados incluyen sm120, sm86 (akula-prime) y sm61 (GTX 1080 Ti).

Es relevante porque permite probar modelos ternarios con `bitnet.cpp` en hardware muy modesto, incluido CPU, con una licencia MIT que facilita su reutilización en investigación y en prototipos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con pesos ternarios (BitNet b1.58, capas BitLinear); detalles de configuracion no disponibles en esta ficha |
| Parametros totales | 2.412.820.480 (2,41 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredado del modelo base `microsoft/BitNet-b1.58-2B-4T`; no verificado en la informacion proporcionada) |
| Tipos de cuantizacion | I2_S (ternario empaquetado, pesos en {-1, 0, +1}). El repositorio no incluye otras variantes (por ejemplo Q4_0/Q4_K) |
| Idiomas soportados | No disponible (no se declaran idiomas en la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (`ggml-model-i2_s.gguf`), ~1,2 GB |
| Modelo base | `microsoft/BitNet-b1.58-2B-4T` |
| Libreria de inferencia | `bitnet.cpp` (kernels TL/I2_S de Microsoft) |
| Hardware objetivo declarado | sm120 (RTX 5080), sm86 (akula-prime), sm61 (GTX 1080 Ti) |
| Descargas / likes en HuggingFace | 24 / 0 |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de BitNet b1.58: un transformer decoder-only en el que las matrices de las capas lineales se sustituyen por pesos ternarios entrenados desde cero (no es una cuantizacion post-entrenamiento del modelo en bf16). El nombre del modelo base, `2B-4T`, hace referencia a 2.000 millones de parametros y 4 billones de tokens de entrenamiento. El repositorio que nos ocupa no aporta informacion adicional sobre el dataset, la composicion de los datos ni sobre fases de alineacion (RLHF, DPO u otras): esa informacion corresponderia a la documentacion de Microsoft.

La innovacion tecnica relevante en esta publicacion es el formato de pesos. El GGUF I2_S empaqueta los pesos ternarios de forma compacta (con escalas asociadas por bloque) para que los kernels de `bitnet.cpp` puedan ejecutar multiplicaciones sin descomprimir los pesos a punto flotante, lo que reduce el ancho de banda de memoria y permite inferencia en CPU y en GPUs de gama baja. Segun la model card, la conversion se hizo por grupos de capas (`scripts/layer_group_quant.py`) tomando como referencia los safetensors bf16, y se checkpointeo en una RTX 5080; se menciona el fichero auxiliar `ggml-model-i2_s.quant.json` como artefacto del proceso.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio y la compatibilidad declarada con `endpoints_compatible` indican que puede servirse como endpoint de chat.
- Razonamiento basico y tareas de conocimiento general: capacidades heredadas del modelo base de 2B parametros; no se han publicado evaluaciones propias en esta ficha.
- Inferencia en CPU y en GPU de gama baja o antigua gracias al formato ternario I2_S y a los kernels de `bitnet.cpp` (incluye soporte declarado para sm61, es decir, GTX 1080 Ti).
- Despliegue en contenedores ligeros: con 1,2 GB de pesos, cabe en entornos con poca memoria.
- Tool calling / function calling: no disponible (no se declara soporte explicito).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision, audio o modos de "thinking": no disponibles.

## Casos de uso

- Prototipado de modelos ternarios en local: permite reproducir el comportamiento de BitNet b1.58 2B4T en un portatil o en una estacion de trabajo sin GPU dedicada, usando `bitnet.cpp`, con un fichero de 1,2 GB que cabe en cualquier SSD.
- Servicio de chat ligero en un endpoint propio: el repositorio declara compatibilidad con endpoints conversacionales, por lo que puede exponerse como API interna de bajo coste para pruebas de integracion o demos.
- Evaluacion de kernels I2_S: sirve como banco de pruebas para medir latencia, throughput y consumo energetico de los kernels ternarios frente a una cuantizacion Q4 tradicional en el mismo hardware.
- Inferencia en hardware antiguo o embebido: el soporte declarado para sm61 (GTX 1080 Ti) y para ejecucion en CPU permite desplegar el modelo en equipos que quedarian excluidos por modelos de 2B en bf16 (unos 5 GB de pesos).
- Generacion de texto sin requisitos de precisión alta: borradores, resumenes cortos, clasificacion de texto o generacion de respuestas plantilla en pipelines internos donde el coste por token importa mas que la calidad puntera.
- Educacion e investigacion sobre cuantizacion extrema: material didactico para explicar como se empaquetan pesos ternarios, como se compara un checkpoint I2_S con su equivalente bf16 y que perdida de calidad implica.
- Base para fine-tuning o experimentos de destilacion sobre representaciones ternarias: al ser un GGUF de solo 1,2 GB, es un punto de partida comodo para estudiar tecnicas de ajuste sobre pesos de baja precision (requiere herramientas especificas, no es un caso de uso cubierto por `bitnet.cpp`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de perplejidad, y los resultados de busqueda web recuperados no contienen datos del modelo. No se dispone tampoco de comparaciones directas entre el checkpoint I2_S y los safetensors bf16 del modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 1,2 GB (tamano del fichero GGUF). Con el runtime y la cache KV, una estimacion razonable es 1,5-2,5 GB para contextos cortos; no hay mediciones publicadas en la informacion disponible.
- Cabe en practicamente cualquier GPU de consumo: GTX 1080 Ti (sm61, soporte declarado), RTX 3060/4060, RTX 4090, RTX 5080 (sm120) y GPUs de centro de datos (A100, H100) sin problema de memoria.
- Tambien puede ejecutarse en CPU mediante `bitnet.cpp`, que es la via principal de despliegue de esta familia de modelos.
- Opciones de despliegue: `bitnet.cpp` (libreria declarada en el repositorio) para CPU y GPU; los GGUF son compatibles con el ecosistema llama.cpp/Ollama en la medida en que sus kernels soporten el tipo I2_S, algo que conviene verificar en la version concreta.
- Latencia y throughput: no disponible. No se han publicado cifras para esta conversion concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| `tzervas/lab-bitnet-b1.58-2B-4T-i2s` | 2,41 mil millones | 4.096 tokens (heredado del base) | GGUF I2_S, ~1,2 GB | MIT | Conversion ternaria para `bitnet.cpp`; sm61/sm86/sm120 |
| `microsoft/BitNet-b1.58-2B-4T` | 2,41 mil millones | 4.096 tokens (heredado) | safetensors bf16 | MIT | Modelo original de Microsoft; mayor huella de memoria |
| Modelo denso de ~1-2B en Q4_K_M (por ejemplo Qwen2.5-1.5B-Instruct) | ~1,5 mil millones | Segun el modelo; no disponible aqui | GGUF Q4_K_M, ~1 GB | Apache-2.0 en Qwen2.5-1.5B | Alternativa convencional en 4 bits; requiere kernels estandar de llama.cpp |
| Llama-3.2-3B-Instruct en Q4_K_M | ~3 mil millones | 128.000 tokens | GGUF Q4_K_M, ~2 GB | Llama 3.2 Community License (con restricciones) | Mayor contexto y ecosistema, pero licencia no MIT |

No se dispone de comparaciones de rendimiento (benchmarks) entre estas alternativas en la informacion proporcionada; la comparacion anterior se limita a tamano, formato, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta sesgos ni el dataset de entrenamiento; al heredar los pesos de Microsoft, los sesgos del modelo base se mantienen.
- Riesgo de alucinacion: inherente a un modelo de 2B parametros sin fases de alineacion documentadas en este repositorio. No debe usarse como fuente de verdad sin verificacion.
- Ventana de contexto limitada: 4.096 tokens segun el modelo base; no es adecuado para documentos largos ni conversaciones muy extensas sin tecnicas de resumen o recuperacion.
- Idiomas: no se declaran idiomas soportados. Se recomienda asumir un rendimiento optimo solo en ingles hasta que se verifique lo contrario.
- Formato poco comun: I2_S requiere kernels especificos. No todos los motores de inferencia GGUF lo soportan; si se carga en una herramienta sin soporte ternario, el modelo puede fallar o dar resultados incorrectos.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene revisar igualmente las condiciones del modelo base `microsoft/BitNet-b1.58-2B-4T`, tambien MIT segun la informacion disponible.
- Repositorio con muy poca traccion: 24 descargas y 0 likes en el momento de redactar la ficha. No hay garantia de mantenimiento, de soporte ni de que el proceso de conversion este completamente documentado en el propio repositorio de HuggingFace (los scripts citados no se listan como ficheros del repo).
- Fecha de creacion y actualizacion muy proximas (13 de septiembre de 2026, con 7 segundos de diferencia): la publicacion no parece haber pasado por una revision posterior.
- No hay informacion sobre perdida de calidad respecto al checkpoint bf16; en modelos ternarios la degradacion puede ser notable en tareas de razonamiento y matematicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tzervas/lab-bitnet-b1.58-2B-4T-i2s
- Modelo base: https://huggingface.co/microsoft/BitNet-b1.58-2B-4T
- Repositorio de inferencia bitnet.cpp: https://github.com/microsoft/BitNet
- Paper de BitNet b1.58 (The Era of 1-bit LLMs): https://arxiv.org/abs/2402.17764
- Informe tecnico de BitNet b1.58 2B4T: https://arxiv.org/abs/2504.12285
- Los resultados de busqueda web proporcionados no aportan enlaces adicionales relevantes sobre el modelo (contenido no relacionado).
