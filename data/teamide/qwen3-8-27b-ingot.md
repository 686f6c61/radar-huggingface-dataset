# TeamIDE/Qwen3.8-27B-Ingot

## Resumen

TeamIDE/Qwen3.8-27B-Ingot es un reempaquetado del modelo Qwen/Qwen3.8-27B en el formato propietario `.ingot`, un esquema de compresion sin perdida disenado especificamente para pesos de modelos. No se trata de un modelo nuevo ni de una variante afinada: los pesos son identicos bit a bit a los originales de Qwen, pero almacenados con una codificacion que reduce el tamano de 55,6 GB a 36,2 GB (10,4305 bits por peso frente a los 16 bits del BF16 original). El autor es TeamIDE y la herramienta de codificacion/decodificacion, Ingot v4, forma parte del repositorio Foundry de dcherrera.

El problema que resuelve es puramente logistico: reducir el coste de almacenamiento y de ancho de banda al descargar o distribuir pesos de gran tamano. Segun la propia model card, no existe todavia decodificacion en GPU, por lo que el ahorro es de tamano de descarga, no de formato de ejecucion: el usuario debe decodificar los ficheros a safetensors en CPU antes de poder cargar el modelo con cualquier runtime convencional. La decodificacion es secuencial (los shards posteriores usan tensores de shards anteriores como fuentes de coincidencia) y potencialmente lenta en maquinas modestas.

La relevancia actual es limitada pero concreta: para equipos que replican modelos grandes en espejos internos, clusters sin acceso directo a Hugging Face o entornos con cuotas de almacenamiento ajustadas, un 35 % de reduccion de tamano sin perdida puede ser util. No aporta ninguna mejora de rendimiento, capacidades ni contexto respecto al modelo base; toda la funcionalidad depende integramente de Qwen3.8-27B, cuyas especificaciones no se detallan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (el nombre sugiere 27B; no confirmado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el formato `.ingot` es compresion sin perdida, no cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache License 2.0 (la de Qwen3.8-27B, sin cambios) |
| Formato de pesos | `.ingot` (18 shards), decodificable a safetensors BF16 |
| Tamano del repo | 36,2 GB (36.221.798.920 bytes) |
| Tamano original | 55,6 GB en BF16 |
| Bits por peso | 10,4305 (frente a 16 en BF16) |
| Numero de shards | 18 (`model-00001-of-00018` a `model-00018-of-00018`) |
| Revision del modelo base | `37561816` |
| Verificacion de integridad | `SHA256SUMS` con hash de cada `.ingot` y de cada shard original |

## Arquitectura y entrenamiento

Este repositorio no contiene arquitectura ni entrenamiento propios: es una codificacion sin perdida de los pesos BF16 de Qwen/Qwen3.8-27B. La model card afirma que cada shard decodifica byte a byte al original y que el sha256 del resultado coincide con el que Hugging Face publica para la revision `37561816` del modelo base. La arquitectura subyacente (transformer, MoE, hibrida, etc.), el volumen de tokens de entrenamiento, la composicion del corpus y las tecnicas de alineacion (RLHF, DPO) no se detallan en la informacion disponible y deben consultarse en la model card de Qwen.

La innovacion tecnica aqui es el codec Ingot v4. Segun la documentacion, los shards posteriores emplean tensores de shards anteriores como fuentes de coincidencia, lo que obliga a decodificar en orden y a pasar los shards ya decodificados mediante `--refs`. La decodificacion es exclusivamente en CPU y el parametro `-j N` controla el numero de hilos. Existe un comando `ingot verify` que comprueba el hash de cada tensor y el sha256 del fichero sin escribir nada en disco. No hay soporte de decodificacion en GPU, lo que impide usar el formato como mecanismo de carga directa en memoria de video.

## Capacidades

- Todas las capacidades del modelo son las de Qwen/Qwen3.8-27B; este repositorio no anade ni elimina ninguna.
- Generacion de texto, razonamiento, codigo, matematicas y vision: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.
- Capacidad propia del repositorio: decodificacion sin perdida a safetensors BF16 con verificacion criptografica de integridad.

## Casos de uso

- Espejos internos de modelos: un equipo que mantenga un registro propio de pesos puede almacenar la version `.ingot` (36,2 GB) en lugar de la BF16 (55,6 GB), reduciendo el consumo de disco un 35 % y decodificando bajo demanda antes de servir el modelo.
- Distribucion a clusters con ancho de banda limitado: la descarga inicial se reduce en unos 19,4 GB por replica; en entornos con enlaces lentos o coste por transferencia, el ahorro es directo y verificable con `SHA256SUMS`.
- Archivado a largo plazo con garantia de integridad: el hash sha256 de cada `.ingot` y de cada shard original permite auditar que la copia archivada reproduce exactamente los pesos publicados por Qwen.
- Verificacion de procedencia de pesos: `ingot verify` permite comprobar tensor a tensor que un conjunto de pesos coincide con la revision `37561816` del modelo base, util en pipelines de compliance o de cadena de suministro de modelos.
- Entornos aislados (air-gapped): al no requerir conexion a Hugging Face para la decodificacion, el flujo `git clone` de Foundry, compilacion con `make` y decodificacion local encaja en instalaciones sin salida a Internet.
- Pruebas de reproducibilidad: comparar el sha256 decodificado con el publicado por el autor del modelo base sirve como test de regresion en infraestructura de empaquetado de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de compresion:

| Metrica | Original (BF16) | Ingot v4 |
|---|---|---|
| Tamano | 55,6 GB | 36,2 GB (36.221.798.920 bytes) |
| Bits por peso | 16 | 10,4305 |
| Reduccion de tamano | — | aproximadamente 34,9 % |
| Perdida | — | ninguna (decodificacion byte a byte verificada por sha256) |
| Decodificacion en GPU | — | no disponible |

## Requisitos de hardware

- VRAM para inferencia: no disponible; depende del modelo base Qwen3.8-27B y de la precision de carga elegida.
- Almacenamiento: 36,2 GB para los `.ingot` mas el espacio de los shards decodificados (55,6 GB en BF16) si se conservan ambos; se recomienda decodificar y borrar el `.ingot` para no duplicar.
- CPU para decodificacion: se requiere un compilador de C y `make`; la decodificacion es solo en CPU y "lenta en maquinas pequenas" segun el autor, con `-j N` para fijar hilos. No se publican cifras de throughput de decodificacion.
- GPU recomendadas: no disponible para la decodificacion (no existe); para la inferencia posterior, las que soporte el modelo base.
- Cabe en GPU de consumo: no disponible para inferencia; la decodificacion no usa GPU.
- Opciones de despliegue: la decodificacion se realiza con la herramienta `ingot` de Foundry; una vez obtenidos los safetensors, el despliegue depende de los runtimes compatibles con Qwen3.8-27B (no especificados en la informacion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros empaquetados sin perdida comparables en la informacion proporcionada. La comparacion relevante es contra el propio modelo base:

| Aspecto | Qwen/Qwen3.8-27B (BF16) | TeamIDE/Qwen3.8-27B-Ingot |
|---|---|---|
| Formato | safetensors BF16 | `.ingot` (18 shards) |
| Tamano | 55,6 GB | 36,2 GB |
| Bits por peso | 16 | 10,4305 |
| Perdida | — | ninguna (verificado por sha256) |
| Carga directa en runtime | si | no (requiere decodificacion previa) |
| Decodificacion en GPU | no aplica | no disponible |
| Licencia | Apache 2.0 | Apache 2.0 |
| Pesos identicos | — | si, revision `37561816` |

## Limitaciones y advertencias

- No es un modelo utilizable directamente: hay que decodificar a safetensors antes de cargarlo; ningun runtime carga `.ingot` de forma nativa.
- La decodificacion es secuencial y depende de shards previos via `--refs`; paralelizar u omitir el orden rompe la decodificacion.
- Decodificacion solo en CPU y potencialmente lenta en maquinas modestas; no hay aceleracion por GPU.
- Requiere compilar la herramienta (`make -C ingot build/ingot`) con un compilador de C disponible.
- El ahorro es de descarga y almacenamiento, no de memoria en tiempo de ejecucion: una vez decodificado, el modelo ocupa lo mismo que el original.
- Los ficheros de configuracion, tokenizer e indice no se incluyen y deben copiarse del repositorio de Qwen.
- Sesgos, riesgo de alucinacion y limitaciones de contexto o idioma: heredados del modelo base y no documentados en la informacion disponible.
- Licencia Apache 2.0 sin restricciones adicionales para uso comercial, pero los derechos y obligaciones son los de Qwen3.8-27B; este repositorio no anade ni retira derechos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- Advertencia de seguridad: la model card incluye instrucciones ejecutables (comandos de shell); deben tratarse como referencia y revisarse antes de ejecutarlas en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TeamIDE/Qwen3.8-27B-Ingot
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta Ingot (Foundry): https://github.com/dcherrera/Foundry
