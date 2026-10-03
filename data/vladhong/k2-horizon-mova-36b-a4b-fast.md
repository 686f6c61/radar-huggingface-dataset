# VladHong/K2-Horizon-MoVA-36B-A4B-FAST

## Resumen

K2-Horizon-MoVA-36B-A4B-FAST es un build en formato GGUF del modelo K2-Horizon-MoVA-36B-A4B desarrollado por IFM, publicado por el usuario VladHong. Se distribuye en dos variantes: una conversion de precision completa en bf16 (74,9 GB) y una cuantizacion imatrix construida con la receta por tensor APEX-Mini (14,92 GB). Los pesos son identicos al checkpoint de origen: no hay pruning, merge ni reordenado, y el fichero bf16 es una copia sin cast del safetensors BF16 original.

El modelo subyacente es un transformer disperso de tipo mixture-of-experts con 36.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, con 512K tokens de contexto declarados. La arquitectura combina un FFN enrutado de 100 expertos por capa (top-8 mas un experto compartido) con expertos de valor MoVA (top-4 de 64 por capa), lo que concentra el coste en el FFN disperso (45,8% de los bytes por token) mas que en la atencion (31,7%).

Su interes practico esta en el trabajo de velocidad que acompana al build: la fusion de los expertos de valor MoVA mediante `torch._grouped_mm` reduce el tiempo de esa fase entre 1,6x y 2,0x con equivalencia numerica verificada, y el block skipping en atencion conserva el 45,9% de los bloques tras la union GQA a 32K tokens, lo que equivale a 2,18x menos lecturas de KV. Ambas optimizaciones son de codigo y politica de cache, no de pesos, y se distribuyen como parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con FFN enrutado de 100 expertos por capa (top-8 + 1 compartido) y expertos de valor MoVA (top-4 de 64 por capa) |
| Parametros totales | 36.000 millones (16.998 tensores en BF16 en el checkpoint fuente) |
| Parametros activos | ~4.000 millones por token |
| Longitud de contexto | 512K tokens en el modelo fuente; medidas de KV propias hasta 128K |
| Tipos de cuantizacion | bf16 (GGUF sin cast) y cuantizacion imatrix con receta por tensor APEX-Mini (823 lineas: 816 upstream + 7 pins) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; el modelo fuente IFM/K2-Horizon-MoVA-36B-A4B es Apache-2.0 |
| Formato de pesos | GGUF (bf16 y cuantizado); safetensors BF16 en el checkpoint fuente |

## Arquitectura y entrenamiento

El bloque de computo se reparte en cinco componentes medidos directamente sobre las cabeceras de tensores del checkpoint, por token decodificado y con pesos residentes: FFN MoE enrutado (top-8 + 1 compartido sobre 100 expertos por capa), 4,778 GB/token y 45,8% del total; proyecciones densas de atencion, 3,302 GB/token y 31,7%; `lm_head`, 1,283 GB/token y 12,3%; expertos de valor MoVA (top-4 de 64 por capa), 0,944 GB/token y 9,1%; y router, 0,117 GB/token y 1,1%. El total de pesos residentes es de 10,424 GB por token. La cache KV consume 192 KiB por token de contexto, lo que supone el 7% del trafico a 4K, el 38% a 32K y el 71% a 128K; el trafico de KV solo supera al de pesos por encima de aproximadamente 53K tokens. El cuello de botella, por tanto, es el FFN de 100 expertos y no la atencion.

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. Las innovaciones documentadas en este repositorio son de inferencia: (1) fusion de los expertos de valor MoVA en una unica llamada `torch._grouped_mm` que sustituye el bucle por experto, con speedup medido de 1,63x a 1,99x, diferencia relativa maxima de 6,8e-04 en el peor caso (2048 tokens, 7 expertos) y KL de 2,6e-05 sobre un forward de 8 capas con 2048 tokens, frente a un control con expertos reordenados que falla con divergencias de 0,59 a 1,10; (2) block skipping por masa en atencion, que descarta bloques de claves con mascara -inf y softmax renormalizado, con un 63,8% de bloques descartables al 99,9% de cobertura de masa a 32K y un 45,9% de bloques conservados tras la union GQA. El parche es de dispatch en PyTorch y no viaja dentro del GGUF, ya que llama.cpp tiene sus propios kernels MoVA. La conversion a bf16 en lugar de f16 se justifica porque el cast a f16 inflaba la memoria comprometida en la maquina del autor (64 GB de RAM) y el f16 se estancaba a 1,9 MB/s; el escaneo de pesos que se interrumpio cubrio 24 de 48 shards con un maximo de |peso| de ~27,5.

## Capacidades

- Generacion de texto y razonamiento: la documentacion de terceros describe el modelo como optimizado para resolucion de problemas complejos, retencion de contexto y tareas de razonamiento.
- Contexto largo: 512K tokens declarados en el modelo fuente; el reparto de coste medido hace que el regimen eficiente sea hasta aproximadamente 53K tokens, donde el trafico de pesos domina sobre el de KV.
- Inferencia acelerada en dos frentes documentados: fusion de expertos de valor MoVA (1,6x-2,0x) y block skipping en atencion (2,18x menos lecturas de KV a 32K).
- Reproducibilidad del build: se incluyen checksums SHA256 de todos los ficheros, el fichero imatrix de origen y la receta exacta de tipos por tensor.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 512K tokens de contexto declarados, el modelo puede ingerir arboles de codigo completos o expedientes documentales largos en una sola pasada, evitando la perdida de informacion que introduce el chunking en pipelines RAG clasicos.
- Razonamiento complejo en estacion de trabajo local: la variante APEX-Mini ocupa 14,92 GB, de modo que cabe en una GPU de 24 GB y permite ejecutar tareas de resolucion de problemas sin depender de APIs externas ni enviar datos fuera de la organizacion.
- Procesamiento por lotes de documentos largos: con llama.cpp y el GGUF cuantizado se pueden procesar lotes de informes o expedientes en hardware modesto; conviene mantener el contexto por debajo de ~53K tokens, umbral a partir del cual la cache KV pasa a dominar el coste de memoria.
- RAG local sobre corpus privados: el modelo fuente es Apache-2.0 y este build esta pensado para despliegue on-premise, lo que encaja en escenarios con requisitos de soberania de datos.
- Investigacion sobre atencion dispersa y computo disperso: el parche `k2-mova-grouped-mm.patch`, el fichero imatrix y los JSON de `measurements/` permiten reproducir las cifras de equivalencia y speedup, y sirven como banco de pruebas para tecnicas de block skipping con renormalizacion de softmax.
- Servicio de maxima fidelidad en nodo unico de 80 GB: el GGUF bf16 (74,9 GB) es bit-exacto respecto al checkpoint y evita la perdida por cuantizacion cuando se dispone de una A100 o H100 de 80 GB.
- Conversacion multi-turno de contexto medio-largo: con 192 KiB de KV por token de contexto, un despliegue de 32K tokens consume aproximadamente 6 GiB de cache, un presupuesto asumible en GPUs de 24 GB con la variante cuantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento disponibles son mediciones de velocidad y equivalencia realizadas por el autor del build.

Fusion de expertos de valor MoVA (pesos reales de la capa 3, enrutado de activaciones reales de la capa 3):

| Tokens | Expertos activados | Bucle (ms) | Grouped (ms) | Speedup | Equivalencia rel.maxdiff | Control invertido |
|---|---|---|---|---|---|---|
| 1 | 4 | 3,184 | 1,601 | 1,99x | 0 | 0,84 |
| 64 | 4 | 2,565 | 1,577 | 1,63x | 0 | 1,10 |
| 512 | 4 | 2,574 | 1,595 | 1,61x | 0 | 0,61 |
| 2048 | 7 | 4,504 | 2,429 | 1,85x | 6,8e-04 | 0,59 |

Verificacion end-to-end: forward de 8 capas sobre 2048 tokens de texto real, KL 2,6e-05, top-1 flip 0,0, delta de NLL +0,0002 nats.

Reparto de coste por token decodificado (pesos residentes, desde las cabeceras de tensores del checkpoint):

| Componente | GB/token | Porcentaje |
|---|---|---|
| FFN MoE enrutado (top-8 + 1 compartido, 100 expertos/capa) | 4,778 | 45,8% |
| Proyecciones densas de atencion | 3,302 | 31,7% |
| `lm_head` | 1,283 | 12,3% |
| Expertos de valor MoVA (top-4, 64/capa) | 0,944 | 9,1% |
| Router | 0,117 | 1,1% |
| Total pesos | 10,424 | |
| Cache KV | 192 KiB por token de contexto | 7% a 4K, 38% a 32K, 71% a 128K |

## Requisitos de hardware

- Variante bf16: 74,9 GB de pesos. Requiere A100 80 GB, H100 80 GB o un nodo multi-GPU (por ejemplo 2x A6000 48 GB). En CPU exige al menos 96 GB de RAM; la maquina de referencia del autor, con 64 GB, sufrio presion de pagefile.
- Variante APEX-Mini: 14,92 GB de pesos. Cabe en RTX 4090 24 GB, RTX 3090 24 GB, L40S 48 GB y GPUs de gama media-alta con 16-24 GB de VRAM.
- Cache KV: 192 KiB por token de contexto, aproximadamente 0,75 GiB a 4K, 6 GiB a 32K, 24 GiB a 128K y unos 96 GiB a 512K. Esto hace inviable el contexto maximo declarado incluso con pesos cuantizados en una sola GPU consumer.
- Despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF para los ficheros de este repositorio. Para el checkpoint fuente en safetensors, vLLM, TGI o SGLang. El parche de MoVA es de dispatch en PyTorch y no se aplica dentro del GGUF.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo en la informacion disponible. Como referencia relativa, la fusion de expertos de valor aporta 1,6x-2,0x en esa fase y el block skipping reduce las lecturas de KV en 2,18x a 32K tokens.
- Umbral de memoria: por encima de ~53K tokens de contexto, el trafico de cache KV supera al de pesos, por lo que es ahi donde conviene aplicar la politica de block skipping.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-FAST (este repositorio) | 36B / ~4B | 512K declarados | no disponible en el repositorio | GGUF bf16 (74,9 GB) y APEX-Mini (14,92 GB) |
| K2-Horizon-MoVA-36B-A4B (checkpoint fuente, IFM) | 36B / ~4B | 512K declarados | Apache-2.0 | safetensors BF16, repositorio oficial |
| K2 Horizon 32B dense | 32B dense | no disponible | no disponible | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Segun IFM, bajo las mismas condiciones de entrenamiento el MoVA 36B-A4B se situa solo ligeramente por debajo del modelo dense Horizon 32B, con un numero de parametros activos sustancialmente menor. No hay disponibles datos comparativos de benchmarks frente a otras familias de modelos.

## Limitaciones y advertencias

- Licencia del repositorio no declarada: antes de cualquier uso comercial hay que verificar la licencia efectiva de este build. El modelo fuente es Apache-2.0, pero eso no garantiza por si solo los terminos del artefacto derivado.
- Sin pipeline tag, sin idiomas declarados y sin benchmarks de calidad publicados: la evaluacion cualitativa queda enteramente en manos del usuario.
- Cero descargas y cero me gusta en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- Riesgo de alucinacion: no disponible. No se documentan tasas ni evaluaciones de factualidad.
- Sesgos: no disponible. No se documenta ninguna evaluacion de sesgo.
- Contexto: aunque se declaran 512K tokens, la cache KV de 192 KiB por token hace que el contexto completo sea economicamente inviable en hardware de una sola GPU; el punto de inflexion medido esta en ~53K tokens.
- El block skipping en atencion es masking con -inf y softmax renormalizado: es exacto para los bloques que conserva, pero constituye una aproximacion respecto a la atencion densa completa, con un 54,1% de bloques descartados a 32K al 99,9% de masa.
- El parche de fusion MoVA no se transporta en el GGUF; solo aplica a ejecuciones en PyTorch. llama.cpp usa sus propios kernels MoVA.
- La conversion a f16 no se completo: el escaneo de pesos se interrumpio tras 24 de 48 shards, aunque el maximo de |peso| observado (~27,5) queda muy por debajo del limite de f16.
- Integridad: conviene verificar los SHA256 publicados antes de desplegar, dado que el hub solo registra la longitud en bytes de cada fichero.

## Enlaces

- Repositorio del build: https://huggingface.co/VladHong/K2-Horizon-MoVA-36B-A4B-FAST
- Repositorio previo del mismo autor (APEX-Mini GGUF): https://huggingface.co/VladHong/K2-Horizon-MoVA-36B-A4B-APEX-Mini-GGUF
- Modelo fuente: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Blog de anuncio de IFM: https://ifm.ai/blog/k2/
- Ficha de especificaciones en apxml: https://apxml.com/models/k2-horizon-mova-36b-a4b
- Ficha de especificaciones y benchmarks en AI/TLDR: https://ai-tldr.dev/models/k2-horizon-mova-36b-a4b/
