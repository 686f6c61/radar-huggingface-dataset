# wcamon/Qwen3-4B-Wringer-Q2.6

## Resumen

Qwen3-4B-Wringer-Q2.6 es un artefacto de investigación publicado por el usuario wcamon en HuggingFace: una cuantización de 2,638 bits por peso (solo el cuerpo, es decir, las capas lineales cuantizadas) del modelo Qwen/Qwen3-4B, obtenida con un método propio denominado Wringer. El modelo base es un transformer denso de 36 capas y aproximadamente 4.000 millones de parámetros, del que se cuantizan 252 módulos lineales (36 capas × 7 proyecciones) hasta 3,63B de pesos de cuerpo, mientras que el embedding atado (389M) y las normas permanecen en bf16.

El interés de esta ficha no está en el rendimiento absoluto, sino en el compromiso entre tasa de bits y degradación: el autor reporta una retención media (comp) de 0,9111 frente al padre en bf16 con solo 2,638 bits por peso, muy por encima de una cuantización GGUF IQ2_S de presupuesto similar (2,520 b/w) que cae a 46,95 en HumanEval frente a los 83,38 de este modelo. Es, por tanto, material relevante para quien investiga cuantización de muy bajo bit, no un modelo listo para producción sin evaluación adicional.

Se trata del segundo modelo producido con Wringer, tras Agents-A1-4B-Wringer-Q2.6, y el autor documenta explícitamente que Qwen3-4B es más sensible al ahorro de bits que aquel: cada reducción de bits cuesta entre varios órdenes de magnitud más HumanEval por bit que en el modelo anterior. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 36 capas, cuantizado sobre Qwen/Qwen3-4B (revisión `1cfa9a7`) |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; 3,63B en el cuerpo cuantizado más 389M de embedding atado en bf16 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la evaluación se realizó con un máximo de 16.000 tokens |
| Tipos de cuantizacion | 2,638 bits/peso de cuerpo (código 2,520 + escalas 0,119). Rejillas GPTQ fijas: int8 por fila en `k_proj`/`v_proj`; 8 niveles {−4..3} en bloques de 128 en `q_proj`/`o_proj`; 4 niveles {−2..1} en bloques de 128 en `gate_proj`/`up_proj`/`down_proj`; escalas fp16/int8. Conversión documentada a formato GPTQ 4-bit para kernels Marlin (no ejecutada para este modelo) |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors: contenedor `wringer_e70_p3a_w.safetensors` (1,12 GiB, códigos empaquetados + escalas + metadatos `wringer_meta`) y checkpoint bf16 materializado en `bf16/` (398 tensores, idéntico bit a bit al materializado con `wringer_unpack.py`) |

## Arquitectura y entrenamiento

El modelo no introduce arquitectura nueva: es un Qwen3-4B denso cuantizado. La innovación está en el pipeline Wringer, que consta de tres etapas. Primero, los códigos de cuantización se resuelven con GPTQ de rejilla fija por capa sobre 128 filas de calibración de 16k tokens generadas por el propio modelo (prompts de código, seguimiento de instrucciones y matemáticas, en modo thinking). Segundo, se aplica una ronda de "water": un LoRA de rango 128 sobre todos los módulos cuantizados, con los códigos congelados y destilación de conocimiento (KD) hacia el padre en bf16 usando una pérdida ponderada por cierre, durante 3000 pasos y 7,8 horas en una sola GPU. Tercero, un "wring" en forma cerrada vuelve a resolver escalas y códigos tomando como objetivo los pesos "regados", de modo que no se distribuye ningún adaptador.

Las escalas se resuelven con una forma cerrada de mínimos cuadrados conjunta con un prior (λ = 0,01). El autor reporta una ratio de recuperación ρ = (B − P3)/(A − P3) = 0,870, donde A es el HumanEval con el adaptador todavía conectado y B tras eliminarlo. El contenedor es únicamente un formato de almacenamiento: no se proporciona kernel personalizado y la inferencia se realiza con los pesos bf16 materializados, que cargan con `transformers` o vLLM igual que el modelo padre.

## Capacidades

- Generación de texto en inglés, con el modo de razonamiento (thinking) activado en todas las evaluaciones publicadas.
- Razonamiento y matemáticas: GSM8K de 89,16 en una única ejecución oficial, frente a 95,00 del padre en bf16.
- Generación de código: HumanEval de 83,38 ± 2,07 (media de 4 semillas con temperatura 1,0), frente a 94,66 ± 0,58 del padre.
- Seguimiento de instrucciones: IFEval (prompt, strict) de 75,42 en una única ejecución, frente a 82,53 del padre (media de 2 ejecuciones).
- Capacidades multilingües: no documentadas; los metadatos del repositorio declaran únicamente inglés, aunque el modelo base Qwen3-4B es multilingüe.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible; el autor indica que no hay suites agénticas evaluadas.
- Capacidades especiales: no se documentan visión ni audio. La única capacidad diferencial es el formato de almacenamiento comprimido y su materializador sin dependencias (`wringer_unpack.py`).

## Casos de uso

- Investigación en cuantización de muy bajo bit: el modelo sirve como punto de comparación reproducible (2,638 b/w de cuerpo, 0,9111 de retención media) frente a otros esquemas como GGUF IQ2_S, GPTQ, AWQ o HQQ, dado que el repositorio incluye la pre-registración completa con los resultados rellenados.
- Estudio de la sensibilidad por módulo: la tabla de recetas por módulo (int8 en `k_proj`/`v_proj`, 8 niveles en `q_proj`/`o_proj`, 4 niveles en el MLP) y el informe de sensibilidad permiten analizar qué proyecciones admiten menos bits en un transformer de 4B.
- Despliegue en GPUs de gama de consumo con memoria ajustada: al materializarse en bf16 ocupa del orden de 8 GB de pesos, por lo que cabe en tarjetas de 12-16 GB (por ejemplo, RTX 4070 Ti Super o RTX 4080) con contexto moderado; requiere asumir la pérdida de calidad medida.
- Servicio de inferencia agregada con vLLM: el autor validó las evaluaciones con vLLM, caché KV en fp8 y 128 peticiones concurrentes hasta 16k tokens, lo que demuestra que la configuración es viable en un servidor con GPUs tipo A100 o H100.
- Generación de código en tareas no críticas con verificación posterior: el modelo conserva 83,38 en HumanEval, suficiente para autocompletado o borradores de funciones siempre que existan tests automáticos que filtren el resultado, dado que la degradación frente al padre es de más de 11 puntos.
- Destilación o fine-tuning sobre hardware limitado: al distribuirse como checkpoint bf16 estándar y con licencia Apache 2.0, puede servir como inicialización o como profesor/estudiante en experimentos de compresión posteriores.
- Reproducción de experimentos de destilación LoRA + resolución en forma cerrada: los informes del repositorio (`pack_e70_p3a_w.md`, `prereg_e70_qwen3_4b.json`) permiten replicar el pipeline "fill-and-wring" en otros modelos.

## Benchmarks y rendimiento

Modo thinking activado, 16k tokens máximos, vLLM con caché KV en fp8. HumanEval se reporta como media ± desviación estándar sobre 4 semillas de muestreo (temperatura 1,0); IFEval y GSM8K son ejecuciones únicas oficiales.

| Modelo | bits/peso de cuerpo | IFEval (prompt, strict) | HumanEval (media 4 semillas ± sd) | GSM8K | comp |
|---|---|---|---|---|---|
| Padre bf16 (ancla) | 16 | 82,53 (media de 2 ejecuciones) | 94,66 ± 0,58 | 95,00 | 1,000 |
| Este modelo (materializado desde el contenedor) | 2,638 | 75,42 | 83,38 ± 2,07 | 89,16 | 0,9111 |
| Este modelo, pesos en estado de investigación (escalas fp32) | 2,638 | 78,56 | 78,96 ± 1,17 | 88,70 | 0,9066 |
| p3a sin entrenamiento (mismos códigos, sin "water") | 2,638 | 74,12 | 72,87 (2 semillas) | 73,62 | 0,8143 |
| llama.cpp GGUF, imatrix, IQ2_S con protección estilo UD (cuerpo 2,520) | 2,520 | pendiente | 46,95 (2 semillas) | pendiente | — |

`comp` es la media de las tres ratios de retención frente al ancla bf16 (la ratio de HumanEval usa las medias de 4 semillas). Las dos filas de Wringer tienen pesos idénticos a nivel de bit (R2 = R3 = 0 según `reports/pack_e70_p3a_w.md`); su diferencia es ruido de muestreo más no determinismo de batching en vLLM. El recuento de bits/peso de cuerpo solo incluye las capas lineales cuantizadas; la figura para el LM completo es 3,93 b/w con embedding en bf16, y 2,82 b/w si el embedding se almacenase a 4,5 b/w clase Q4_K (no evaluado). Los IFEval/GSM8K en GGUF para tres tamaños de cuerpo (2,52 / 2,73 / 3,18) están en recopilación. No se han publicado resultados de MMLU ni de suites agénticas en la información disponible.

## Requisitos de hardware

- Espacio en disco: el repositorio completo ocupa 9,3 GB. El contenedor `wringer_e70_p3a_w.safetensors` ocupa solo 1,12 GiB, pero para inferir hay que materializar el checkpoint bf16 del directorio `bf16/`.
- VRAM para inferencia con los pesos bf16 materializados: del orden de 8 GB solo en pesos (4B parámetros × 2 bytes ≈ 7,5 GB), más caché KV. Con caché KV en fp8 y contextos de 16k la configuración del autor es viable en GPUs de 24 GB; en tarjetas de 12-16 GB conviene reducir contexto o número de secuencias concurrentes.
- Conversión a GPTQ 4-bit para kernels Marlin: el autor documenta para el modelo anterior (Agents-A1-4B) un contenedor de 3,84 GiB y 1,9× de velocidad de decodificación con batch 1. El mismo conversor sería aplicable aquí, pero no se ejecutó ni se verificó para este modelo, por lo que esas cifras no deben darse por válidas en este caso.
- GPU recomendadas: el autor realizó el entrenamiento del LoRA (3000 pasos, 7,8 horas) en una sola GPU sin especificar modelo. La evaluación se hizo con vLLM con 128 peticiones concurrentes, lo que implica hardware de servidor tipo A100 o H100. Para uso individual, una RTX 4090 (24 GB) o una RTX 3090 son suficientes para los pesos en bf16.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más de VRAM si se limita el contexto; no hay pesos GGUF ni versiones de 4 bits listas para usar en este repositorio.
- Opciones de despliegue: `transformers` y vLLM (empleado en las evaluaciones publicadas, con caché KV en fp8). No se proporciona kernel personalizado ni pesos GGUF; llama.cpp solo aparece como comparativa externa.
- Latencia y throughput: no disponibles para este modelo. La única cifra relacionada (1,9× de decodificación a batch 1) corresponde al modelo A1 del mismo autor convertido a GPTQ 4-bit con Marlin, no a este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits/peso de cuerpo | Retención (comp) | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wcamon/Qwen3-4B-Wringer-Q2.6 | ~4B (3,63B cuerpo) | 2,638 | 0,9111 | 83,38 ± 2,07 | Apache 2.0 | safetensors (contenedor + bf16 materializado) |
| wcamon/Agents-A1-4B-Wringer-Q2.6 | 4B | 2,655 | 0,9465 | no disponible en esta ficha | no disponible en la información proporcionada | safetensors |
| Qwen/Qwen3-4B (padre) | ~4B | 16 | 1,000 | 94,66 ± 0,58 | Apache 2.0 | safetensors, GGUF oficial |
| GGUF IQ2_S con protección estilo UD (llama.cpp) | ~4B | 2,520 | — | 46,95 (2 semillas) | depende del publicador | GGUF |

La comparación directa más informativa es con el propio padre bf16: este modelo pierde 3,55 puntos de IFEval, 11,28 puntos de HumanEval y 5,84 puntos de GSM8K, con un tamaño de pesos aproximadamente seis veces menor. Frente al GGUF IQ2_S de presupuesto casi idéntico, la ventaja en HumanEval es de más de 36 puntos, aunque se trata de un único punto de comparación y de un esquema de cuantización distinto. El autor señala que Qwen3-4B tolera peor la compresión que su A1 (0,9465 de comp a 2,655 b/w), con costes por bit entre varios y un orden de magnitud superiores en HumanEval.

## Limitaciones y advertencias

- Ruido de muestreo elevado: HumanEval a temperatura 1,0 oscila varios puntos entre semillas (sd de 1-2 pp en este modelo, hasta 2,7 pp en A1). Las ejecuciones únicas de IFEval difieren ~1-2 pp entre semillas, de modo que las cifras de IFEval y GSM8K no deben tratarse como valores estables.
- Contaminación del corpus de calibración: el corpus es generado por el propio modelo. La sonda de memorización sobre los tres conjuntos de test no encontró ningún conjunto en el que Qwen3-4B supere al control (A1), aunque una tarea (HumanEval/129) es reproducida literalmente por el padre. Al eliminar las 7 tareas marcadas específicas de Qwen, el padre puntúa 96,82 frente a 96,95 (una semilla, protocolo antiguo), sin efecto en las conclusiones.
- Cobertura de evaluación muy limitada: solo IFEval, HumanEval y GSM8K, y únicamente en modo thinking. No hay MMLU ni suites agénticas.
- Cambio de protocolo de evaluación: todas las cifras de Qwen3-4B usan vLLM con caché KV en fp8 y 128 peticiones concurrentes, validado contra la línea base de KV en bf16 sobre el padre (IFEval 82,81 frente a una banda de 81,3-85,4; GSM8K 94,77 frente a 94,84). Las cifras de A1 en la primera model card usan KV en bf16, por lo que las comparaciones entre ambos modelos no son estrictamente homogéneas.
- Degradación funcional real: la caída de más de 11 puntos en HumanEval y de 5,84 en GSM8K limita su uso en tareas de código o matemáticas sin verificación automática.
- Idioma: los metadatos declaran solo inglés. El comportamiento en castellano u otros idiomas no está evaluado y podría degradarse de forma distinta a la del padre.
- Sin kernel propio ni pesos GGUF: el contenedor es solo un formato de almacenamiento; la inferencia usa los pesos bf16 materializados, por lo que el ahorro de bits no se traduce en ahorro de VRAM en inferencia salvo que se ejecute la conversión a GPTQ 4-bit, no realizada ni verificada para este modelo.
- Cifras pendientes: los resultados GGUF de IFEval y GSM8K en tres tamaños de cuerpo (2,52 / 2,73 / 3,18) están en recopilación, igual que el control STE-QAT del mismo presupuesto y los puntos de referencia GPTQ, AWQ y HQQ; se añadirán al informe técnico, no a esta model card.
- Licencia: Apache 2.0, sin restricciones declaradas para uso comercial. Aun así, la licencia del modelo base (Qwen3-4B, también Apache 2.0) y la ausencia de evaluación en dominios sensibles desaconsejan su uso directo en producción sin validación propia.
- Madurez: versión v0.1 (2026-09-13), con 0 descargas y 0 likes en el momento de la consulta, publicada como artefacto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wcamon/Qwen3-4B-Wringer-Q2.6
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Primer modelo producido con Wringer (Agents-A1-4B-Wringer-Q2.6): https://huggingface.co/wcamon/Agents-A1-4B-Wringer-Q2.6
- Ficheros incluidos en el repositorio: `wringer_e70_p3a_w.safetensors`, `wringer_unpack.py`, `bf16/`, `reports/pack_e70_p3a_w.md`, `reports/contam_probe_qwen3_4b.md`, `reports/prereg_e70_qwen3_4b.json`
- Artículo "How it was made": mencionado en la model card pero su URL aparece truncada en la información proporcionada; no disponible.
- No se han encontrado otros enlaces relevantes en la búsqueda web realizada.
