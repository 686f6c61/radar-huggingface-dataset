# StillDeadcode/minicpm5-2b-fp8

## Resumen

MiniCPM5-2B FP8 + DSpark es un contenedor de pesos empaquetado en formato `.rad` para el motor de inferencia **radiance**, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. Lo publica el usuario StillDeadcode (repositorio `StillDeadcode/minicpm5-2b-fp8`), y su contenido son los pesos de `openbmb/MiniCPM5-2B` cuantizados a FP8, con el modelo borrador `openbmb/MiniCPM5-2B-DSpark` integrado para decodificacion especulativa. No se trata de un entrenamiento nuevo ni de un fine-tune, sino de una redistribucion optimizada para un runtime concreto.

El interes practico esta en dos puntos: por un lado, empaqueta un modelo de 2B parametros en 3,03 GiB de pesos con cuantizacion FP8 E4M3 y escalas bf16 por bloque de 128x128, lo que permite servirlo en tarjetas de gama alta de consumo AMD; por otro, incorpora el especulador DSpark (5 capas, tamano de bloque 7) dentro del mismo contenedor, de modo que la aceleracion por decodificacion especulativa funciona sin configuracion adicional. El checkpoint conserva la longitud de contexto entrenada de 131 072 tokens.

La relevancia es fundamentalmente de nicho: aporta una via de despliegue para MiniCPM5-2B en el ecosistema ROCm/RDNA4 mediante un servidor compatible con la API de OpenAI, con soporte declarado de tool calling y salida estructurada. La licencia Apache 2.0 del modelo base se mantiene, lo que facilita el uso comercial, aunque conviene tener presente que el contenedor solo es utilizable con el motor radiance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en detalle; corresponde al modelo base MiniCPM5-2B (el repositorio solo indica `pipeline_tag: text-generation`) |
| Parametros totales | 2B (segun la denominacion del modelo base MiniCPM5-2B; no se da una cifra exacta en la informacion disponible) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 131 072 tokens (longitud entrenada del checkpoint) |
| Tipos de cuantizacion | FP8 E4M3 en todas las capas lineales, con escala bf16 por bloque de 128x128 (redondeo al mas proximo); embeddings y normalizaciones en bf16; cabecera de vocabulario del especulador a 2 bits |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor `.rad` (motor radiance); fichero `minicpm5-2b-fp8.rad` de 3,03 GiB; el repositorio ocupa 3,3 GB |
| Autor del contenedor | StillDeadcode |
| Modelos base | openbmb/MiniCPM5-2B, openbmb/MiniCPM5-2B-DSpark |
| Modalidades | Texto |
| Motor de inferencia | radiance (AMD RDNA4, ROCm) |
| Hardware validado | Radeon AI PRO R9700 (gfx1201) |
| Formatos de decodificacion | Decodificacion especulativa con el borrador DSpark (profundidad automatica o fijada con `--num-speculative-tokens`, `0` la desactiva) |
| Cuantizacion de cache KV | FP8 (`--kv-cache-dtype fp8`) |
| Fecha de publicacion | 3 de octubre de 2026 (creacion en HuggingFace) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base MiniCPM5-2B: no se indican numero de capas, dimension del modelo, configuracion de atencion (MHA/GQA/MQA), tipo de positional encoding ni composicion del dataset de entrenamiento. Lo unico documentado en este repositorio es el proceso de conversion y empaquetado, no el entrenamiento. Por tanto, los detalles sobre datos, numero de tokens, fases de alineacion (RLHF, DPO u otras) o innovaciones arquitectonicas deben consultarse en la model card de `openbmb/MiniCPM5-2B` y no estan disponibles aqui.

Lo que si se detalla es la parte de cuantizacion y aceleracion. Todas las capas lineales se convierten a FP8 E4M3 con una escala bf16 por bloque de 128x128 y redondeo al valor mas proximo; las matrices de embeddings y las normalizaciones se mantienen en bf16 para preservar precision en los puntos mas sensibles. Sobre el modelo principal se fusiona el borrador DSpark, un especulador de 5 capas con tamano de bloque 7, tambien en FP8, cuya cabecera de vocabulario se reduce a 2 bits. La decodificacion especulativa se gestiona desde el propio servidor: la profundidad se elige de forma automatica o se fija mediante `--num-speculative-tokens N`, permitiendo tambien desactivarla por completo.

## Capacidades

- Generacion de texto conversacional y de proposito general, con el pipeline declarado `text-generation`.
- Tool calling / function calling: el servidor radiance expone `/v1/chat/completions` y `/v1/completions` de la API de OpenAI con soporte de llamadas a herramientas.
- Salida estructurada (structured output) a traves de la misma interfaz compatible con OpenAI.
- Contexto largo: hasta 131 072 tokens, util para documentos extensos o historiales de conversacion prolongados.
- Multilingue limitado a ingles y chino, segun los idiomas declarados en el repositorio.
- Decodificacion especulativa integrada mediante el borrador DSpark, con profundidad configurable o automatica.
- Servicio multi-secuencia: el ejemplo de despliegue usa `--max-num-seqs 8` y cache KV en FP8.
- No se ha documentado en la informacion disponible soporte de vision, audio, modo de razonamiento explicito (thinking mode) ni entrenamiento especifico para agentes multi-paso.

## Casos de uso

- Despliegue local en GPUs AMD RDNA4: el contenedor `.rad` permite levantar un endpoint compatible con OpenAI en una Radeon AI PRO R9700 con un unico comando, sin necesidad de convertir pesos ni montar un stack de inferencia adicional.
- Asistentes conversacionales de dominio acotado: con 131 072 tokens de contexto se puede mantener un historial largo o inyectar documentacion de referencia extensa sin truncar, algo habitual en asistentes internos de soporte.
- Automatizacion con tool calling: al exponer `/v1/chat/completions` con function calling, el modelo puede encadenarse a herramientas externas (consultas a bases de datos, APIs internas, hojas de calculo) desde clientes que ya hablan el protocolo de OpenAI.
- Extraccion de datos estructurados: la salida estructurada permite generar JSON con un esquema fijo a partir de texto libre, un patron tipico en pipelines de ingestion y en procesos ETL.
- Generacion de texto en ingles y chino: util en entornos con documentacion o usuarios en ambos idiomas, que es el unico par linguistico declarado.
- Prototipado e investigacion en ROCm: sirve como banco de pruebas para medir la ganancia real de la decodificacion especulativa con DSpark en hardware AMD, comparando la profundidad automatica frente a valores fijos o frente a la especulacion desactivada.
- Servicio por lotes de bajo coste: al ser un modelo de 2B en FP8 (3,03 GiB de pesos), es viable ejecutar varias instancias o repartirlo con `--tp 2` entre dos tarjetas para atender pequenas cargas concurrentes con `--max-num-seqs 8`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco mediciones de latencia o throughput de la decodificacion especulativa con DSpark.

## Requisitos de hardware

- Peso de los pesos: 3,03 GiB en FP8 para el fichero `.rad` completo (modelo principal mas especulador). Con `--tp 2` se reparten aproximadamente 1,5 GiB por tarjeta, mas las estructuras auxiliares del runtime.
- VRAM adicional: hay que sumar la cache KV en FP8 para hasta 131 072 tokens por secuencia y `--max-num-seqs 8`. El tamano exacto depende de la configuracion de capas y cabezas KV del modelo base, dato no disponible en esta informacion, por lo que no se puede dar una cifra fiable.
- GPU objetivo: AMD RDNA4 (gfx1201). El repositorio indica que se construyo y probo en una Radeon AI PRO R9700. No se declara soporte para NVIDIA ni para generaciones anteriores de AMD.
- Inferencia en una sola tarjeta: si, con `--tp 1` sobre una RDNA4 con VRAM suficiente para pesos mas cache KV; cuanto mas se acerque la longitud de contexto al maximo, mayor sera el requisito de VRAM.
- Opciones de despliegue: exclusivamente el motor radiance con el contenedor `.rad`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato propietario impide usarlos directamente sin reconvertir los pesos.
- Ejemplo de arranque documentado: `radiance --model minicpm5-2b-fp8.rad --tp 2 --max-model-len 131072 --kv-cache-dtype fp8 --max-num-seqs 8 --host 0.0.0.0 --port 8000`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B FP8 + DSpark (este repositorio) | 2B | 131 072 tokens | FP8 E4M3 con escalas bf16 por bloque 128x128; contenedor `.rad` | Apache 2.0 | HuggingFace; requiere motor radiance sobre AMD RDNA4/ROCm |
| openbmb/MiniCPM5-2B | 2B (indicado en la denominacion) | No disponible en esta informacion | No disponible; pesos sin cuantizar del modelo base | Apache 2.0 (heredada por el derivado) | HuggingFace; es el modelo base |
| openbmb/MiniCPM5-2B-DSpark | No disponible | No disponible | No disponible; se describe en este repositorio como especulador de 5 capas, bloque 7, FP8 en la version empaquetada | No disponible en esta informacion | HuggingFace; es el borrador de decodificacion especulativa |

No se dispone de datos de rendimiento de ninguno de los tres, por lo que la comparacion se limita a parametros, contexto, formato y licencia. La informacion disponible tampoco permite comparar de forma rigurosa con alternativas de otros fabricantes de tamano similar.

## Limitaciones y advertencias

- Formato propietario: el contenedor `.rad` solo funciona con el motor radiance. No es cargable con llama.cpp, vLLM, Ollama ni TGI, lo que limita su portabilidad.
- Dependencia de hardware: el soporte declarado se circunscribe a AMD RDNA4 (gfx1201) y ROCm. No hay evidencia en la informacion disponible de funcionamiento en NVIDIA, en AMD RDNA3 o en aceleradores de otro tipo.
- Perdida de precision por cuantizacion: los pesos estan en FP8 con escalas por bloque de 128x128, y la cabecera de vocabulario del especulador esta a 2 bits. No se publican evaluaciones que cuantifiquen el impacto sobre la calidad frente al modelo en bf16, por lo que la degradacion es desconocida.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad ni de tasas de alucinacion. Como en cualquier modelo generativo de 2B, es esperable un riesgo apreciable en tareas de conocimiento factual, aunque no hay datos que lo confirmen.
- Cobertura idiomatica: solo ingles y chino. El castellano no figura entre los idiomas soportados, por lo que su uso en produccion en espanol no esta respaldado por el repositorio.
- Contexto efectivo: aunque el checkpoint declara 131 072 tokens, el rendimiento real a longitudes cercanas al maximo no esta verificado y depende de la VRAM disponible para la cache KV.
- Madurez del artefacto: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad. Conviene tratarlo como material experimental y validarlo internamente antes de llevarlo a produccion.
- Licencia: Apache 2.0 permite uso comercial, pero se aplica al modelo base; no se detallan condiciones adicionales del contenedor ni del motor radiance, que es software de terceros y puede tener su propia licencia. Habria que verificarla por separado.
- Trazabilidad: no se documentan las fases de entrenamiento ni los datos del modelo base en este repositorio, lo que dificulta auditar sesgos o procedencias del contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StillDeadcode/minicpm5-2b-fp8
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo borrador (especulador): https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Paper, blog, repositorio del motor radiance y demos: no disponible en la informacion proporcionada. Los resultados de busqueda web consultados no contienen referencias relevantes al modelo ni a su ecosistema.
