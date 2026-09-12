# YTan2000/Qwen3.8-Flash-Next-TQ3_4S

## Resumen

Qwen3.8 Flash Next — TQ3_4S es una cuantizacion GGUF del modelo Qwen3.8 Flash Next, publicada por el usuario YTan2000 a partir del artefacto base Mia-AiLab/Qwen3.8-Flash-Next-NVFP4. Se trata de un modelo de generacion de texto de tipo MoE (mezcla de expertos con expertos compartidos) de 176.943.899.520 parametros totales (176,9B), 48 capas y una ventana de contexto de 262.144 tokens. La cuantizacion emplea el tipo de tensor propietario TQ3_4S, de aproximadamente 4 bits por peso (bpw), y ocupa 110 GiB repartidos en seis fragmentos GGUF.

El artefacto resuelve un problema muy concreto: permitir ejecutar un modelo de casi 177B parametros en una unica maquina con 128 GB de memoria unificada (clase NVIDIA GB10, DGX Spark). La conversion es exclusivamente de texto: elimina la torre de vision y las capas borrador MTP del modelo NVFP4 original, de modo que no admite entradas de imagen ni decodificacion especulativa con drafter. El modelo resultante es un modelo de razonamiento, con plantilla de chat propia que exige `--jinja` y un presupuesto de razonamiento acotado para evitar cadenas de pensamiento desbocadas en bucles agenticos.

Su relevancia ahora es doble. Por un lado, demuestra que la arquitectura `qwen4exp` con atencion lineal hibrida mantiene una cache KV lo bastante pequena como para servir los 262.144 tokens de contexto en una sola maquina (unos 74 GB residentes). Por otro, es un artefacto atado a un runtime especifico: solo carga con el fork TurboQuant de llama.cpp, ya que las compilaciones estandar no reconocen el tipo de tensor TQ3_4S.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp, transformer MoE con expertos compartidos, atencion lineal hibrida; 48 capas |
| Parametros totales | 176.943.899.520 (176,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K); validado en carga con `-c 262144 -fa on` |
| Tipos de cuantizacion | TQ3_4S (~4 bpw, tipo de tensor propio del fork TurboQuant); no compatible con tipos GGUF estandar |
| Idiomas soportados | en (ingles) |
| Licencia | Qwen Community License 1.0 (campo `license: other`, `license_name: qwen-community-license-1.0`) |
| Formato de pesos | GGUF fragmentado en 6 shards (110 GiB en total) |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Tamano del repositorio | 117,8 GB |
| Shards | `00001-of-00006` (10,4 MiB, indice), `00002` (500 MiB), `00003` (50,7 GiB), `00004` (21,8 GiB), `00005` (21,8 GiB), `00006` (14,9 GiB) |
| Runtime requerido | fork `turbo-tan/llama.cpp-tq3` con soporte de `qwen4exp` (agosto 2026 o posterior) |
| Vision / mmproj | no incluida (0 tensores `vision`/`mmproj`) |
| Capas MTP / drafter | no incluidas (0 tensores `nextn`/`mtp`) |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es `qwen4exp`, un transformer de 48 capas con mezcla de expertos y expertos compartidos, sobre el que se aplica un esquema de atencion lineal hibrida. Esta ultima es la razon de que la cache KV se mantenga manejable: el autor verifica que el contexto completo de 262.144 tokens carga y sirve en una sola GB10 con unos 74 GB de memoria residente, algo inviable con atencion densa a esa longitud y ese numero de capas. El modelo base NVFP4 anade ademas una torre de vision y capas borrador MTP, ambas ausentes en esta conversion.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineamiento en el modelo original. La innovacion tecnica destacable de este artefacto no esta en el entrenamiento, sino en la cuantizacion: el tipo TQ3_4S, especifico del ecosistema TurboQuant, que comprime los pesos a ~4 bpw preservando aparentemente la calidad suficiente para tareas de codigo (vease la seccion de benchmarks). El autor senala que se uso una imatrix en el proceso. La plantilla de chat es personalizada y requiere `--jinja` de forma obligatoria.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat propia y modo conversacional.
- Razonamiento explicito: el modelo expone cadena de pensamiento y admite control mediante `--reasoning-format deepseek` y `--reasoning-budget`.
- Generacion de codigo: el artefacto esta evaluado principalmente en suites de codigo (HumanEval+, MBPP+, Hard86) con resultados altos.
- Tool calling / function calling: la suite de calidad interna del autor mide tool calling en 81,7 (12/15).
- Seguimiento de instrucciones: 83,3 (10/15) en la suite interna de instruction following.
- Extraccion de datos estructurados: 85,1 (9/15) en la suite interna de data extraction.
- Razonamiento matematico: 73,3 (11/15) en la suite interna de reasoning & math, la puntuacion mas baja de las medidas declaradas.
- Contexto largo: hasta 262.144 tokens, apto para documentos extensos o historiales de conversacion muy largos.
- Capacidades de agente multi-paso: el autor documenta explicitamente el uso en bucles agenticos, con la advertencia de acotar el presupuesto de razonamiento.
- Vision: no soportada. La conversion es solo texto y no se distribuye fichero mmproj.
- Decodificacion especulativa con drafter MTP: no soportada, las capas `nextn`/`mtp` se eliminaron.
- Multilingue: no disponible mas alla del ingles declarado.

## Casos de uso

- Generacion de codigo en produccion sobre repositorios grandes: con 262.144 tokens de contexto puede ingerir varios modulos completos y generar codigo coherente con el resto del proyecto; los 85,4 / 82,3 en HumanEval+ (base / plus) y 89,9 / 76,2 en MBPP+ respaldan este uso.
- Asistente de refactorizacion de codigo heredado: el modelo puede recibir un arbol de ficheros extenso y proponer cambios que respeten las interfaces existentes, aprovechando el contexto largo y la atencion lineal para no degradar la latencia.
- Agente autonomo de resolucion de incidencias: con soporte de tool calling (81,7 en la suite interna) se puede conectar a APIs de tickets, repositorios y CI/CD; es imprescindible fijar `--reasoning-budget` para que la cadena de razonamiento no se desborde en bucles largos.
- Auditoria de codigo con tareas de test unitario: Hard86, con 86 tareas de codigo profundo evaluadas por test unitario, dio 72/86 (83,7%), lo que indica utilidad para generar parches que pasan pruebas reales.
- Extraccion de datos estructurados de documentos tecnicos: con 85,1 (9/15) en la suite de extraccion, es razonable para convertir documentacion, contratos o informes en JSON u otros formatos, siempre con validacion posterior del esquema.
- Procesamiento de documentacion tecnica extensa: manuales o especificaciones que superan los 100.000 tokens caben en una sola ventana, evitando pipelines de chunking y recuperacion.
- Despliegue local en hardware de clase estacion de trabajo: al caber en 128 GB de memoria unificada de una GB10 y no requerir claves de API externas, encaja en entornos con requisitos de confidencialidad estrictos donde los datos no pueden salir de la maquina.
- Automatizacion de atencion al cliente tecnica: conversaciones multi-turno con historial largo, apoyadas en contexto de 256K y en la capacidad de invocar herramientas para consultar estado de pedidos o sistemas internos.

## Benchmarks y rendimiento

Resultados declarados por el autor del artefacto (campo `model-index` de la model card y tabla de resumen). Todos los numeros fueron medidos sobre el artefacto cuantizado TQ3_4S, en una GB10, con contexto de 32K y razonamiento activado con presupuesto acotado, usando los scorers oficiales. Los valores del `model-index` figuran como no verificados (`verified: false`).

| Suite | Metrica | Resultado |
|---|---|---|
| HumanEval+ | pass@1 base | 85,4 |
| HumanEval+ | pass@1 plus | 82,3 |
| MBPP+ | pass@1 base | 89,9 |
| MBPP+ | pass@1 plus | 76,2 |
| Hard86 (codigo profundo, 86 tareas, corregido por test unitario) | tareas resueltas | 72/86 = 83,7% |
| Quality suite — coding | puntuacion | 100,0 (12/12) |
| Quality suite — data extraction | puntuacion | 85,1 (9/15) |
| Quality suite — instruction following | puntuacion | 83,3 (10/15) |
| Quality suite — tool calling | puntuacion | 81,7 (12/15) |
| Quality suite — reasoning & math | puntuacion | 73,3 (11/15) |

Notas de protocolo indicadas por el autor: Hard86 y EvalPlus se ejecutaron con los scorers oficiales, razonamiento activado, presupuesto 16.384 y contexto de 32K. Las filas de la suite de calidad se repitieron el 11 de septiembre de 2026 con el modo thinking desactivado, presupuesto de 24.576 tokens y un timeout de transporte dimensionado para generaciones de presupuesto completo; una ejecucion anterior con timeout de 600 s y presupuesto de 8K trunco el razonamiento a mitad y no es comparable.

No se han publicado resultados de benchmarks de terceros independientes en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo: 110 GiB (6 shards). Es un requisito de memoria minimo absoluto para cargar los pesos.
- Memoria unificada o VRAM total necesaria: se ha validado en una sola NVIDIA GB10 con 128 GB de memoria unificada. Con contexto completo de 262.144 tokens, el consumo residente medido es de aproximadamente 74 GB.
- GPU consumer: no cabe en ninguna GPU consumer actual. Una RTX 4090 con 24 GB queda muy lejos de los 110 GiB de pesos; ni siquiera con cuantizaciones mas agresivas hay datos publicados que lo respalden.
- GPU de centro de datos: no hay datos publicados de despliegue en A100 (80 GB), H100 (80 GB) ni H200. Por tamano, requeriria al menos dos aceleradores de 80 GB solo para los pesos, o una maquina de memoria unificada grande de clase GB10 / GH200.
- Almacenamiento: el repositorio ocupa 117,8 GB; hay que descargar los seis shards en el mismo directorio y apuntar `llama-server` al shard 1.
- Runtime: exclusivamente el fork `turbo-tan/llama.cpp-tq3`, con soporte de `qwen4exp` de agosto de 2026 o posterior. Las compilaciones estandar de llama.cpp no pueden cargar el tipo TQ3_4S; tampoco hay soporte publicado para vLLM, TGI u Ollama.
- Flags obligatorios: `--jinja` (plantilla de chat personalizada) y `--reasoning-budget` (modelo de razonamiento; sin tope la cadena de pensamiento se descontrola).
- Latencia medida: aproximadamente 29,6 tok/s de decodificacion en mediana (GB10, contexto de 32K, sin drafter). No hay datos de throughput con slots concurrentes ni de tiempo hasta el primer token.
- Contexto recomendado: `-c 32768` si se quieren slots concurrentes con margen; `-c 262144` fue verificado y sirve, a costa de ~74 GB residentes.

Ejemplo de arranque validado por el autor:

```bash
llama-server \
  --model qwen38-tq3_4s-final-00001-of-00006.gguf \
  -ngl 99 -c 32768 -fa on \
  --jinja \
  --reasoning-format deepseek --reasoning-budget 16384 \
  --port 8097 --host 127.0.0.1
```

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que no es posible una comparativa de rendimiento honesta. La unica comparacion posible es estructural, frente al artefacto base del que deriva.

| Modelo | Parametros | Contexto | Vision | Drafter MTP | Formato | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-TQ3_4S (este) | 176,9B | 262.144 | No | No | GGUF TQ3_4S (~4 bpw), 110 GiB, 6 shards | Qwen Community License 1.0 |
| Mia-AiLab/Qwen3.8-Flash-Next-NVFP4 (base) | 176,9B | 262.144 | Si | Si | NVFP4 | Qwen Community License 1.0 (el tag apache-2.0 del repo de empaquetado NVFP4 es inexacto, segun el autor) |
| Otras alternativas de ~175B en formato GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La ventaja concreta del artefacto TQ3_4S frente al base NVFP4 es el tamano: 110 GiB frente a un modelo NVFP4 que conserva vision y capas MTP, y que exige hardware Blackwell con soporte de ese formato. La contrapartida es la perdida de vision, de decodificacion especulativa y la dependencia de un fork de llama.cpp no estandar.

## Limitaciones y advertencias

- Dependencia de runtime no estandar: el modelo no carga en llama.cpp oficial, vLLM, TGI ni Ollama. Solo funciona con el fork `turbo-tan/llama.cpp-tq3`. Esto es un riesgo de mantenimiento en produccion, ya que depende de un unico repositorio.
- Sin vision: la torre de vision del modelo base fue eliminada. Cualquier caso de uso multimodal queda descartado.
- Sin decodificacion especulativa: las capas MTP se eliminaron, por lo que no se puede acelerar con drafter. Los 29,6 tok/s medidos son sin drafter y difíciles de mejorar por esa via con este artefacto.
- Riesgo de desbordamiento del razonamiento: es un modelo de razonamiento; sin `--reasoning-budget` la cadena de pensamiento puede crecer sin limite. El autor lo califica de obligatorio en bucles agenticos.
- Solo ingles declarado: la model card y los tags indican unicamente `en`. No hay evidencia de capacidades multilingues y el rendimiento fuera del ingles es desconocido.
- Benchmarks autodeclarados: todos los resultados provienen del autor del artefacto, con `verified: false` en el `model-index` y sin evaluacion independiente. El protocolo de la suite de calidad cambio entre ejecuciones, lo que limita la comparabilidad.
- Rendimiento desigual por tarea: razonamiento y matematicas es la peor area medida (73,3, 11/15) y MBPP+ cae de 89,9 (base) a 76,2 (plus), lo que sugiere fragilidad ante variaciones de los enunciados.
- Riesgo de alucinacion: no hay datos publicados especificos sobre tasas de alucinacion. Como modelo de codigo y extraccion, cualquier salida debe validarse (tests, esquemas) antes de usarse.
- Sesgos: no disponible. No se han publicado analisis de sesgo para este artefacto ni para el modelo base en la informacion proporcionada.
- Licencia: Qwen Community License 1.0, no es una licencia de codigo abierto permisiva al uso. Hay que revisar sus terminos antes de cualquier uso comercial; el propio autor advierte que el tag apache-2.0 del repositorio NVFP4 original es inexacto.
- Madurez del artefacto: 0 descargas y 0 likes, publicado el 11 de septiembre de 2026. No hay historial de uso en produccion ni senales de comunidad que respalden su fiabilidad.
- Coste de despliegue: 117,8 GB de repo y 110 GiB de pesos implican una descarga y un almacenamiento considerables, y un tiempo de carga elevado en cada arranque.
- Cuantizacion a ~4 bpw: aunque los resultados declarados en codigo son altos, cualquier cuantizacion agresiva puede degradar tareas de matematicas y razonamiento largo, precisamente donde las puntuaciones ya son mas bajas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YTan2000/Qwen3.8-Flash-Next-TQ3_4S
- Modelo base (artefacto NVFP4): https://huggingface.co/Mia-AiLab/Qwen3.8-Flash-Next-NVFP4
- Runtime requerido (fork TurboQuant de llama.cpp): https://github.com/turbo-tan/llama.cpp-tq3
- Licencia del modelo: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio del modelo original referenciado por la licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper, blog o demo adicional: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente resultados no relacionados sobre YouTube y la serie de television "You").
