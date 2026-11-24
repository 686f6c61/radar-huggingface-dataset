# wepiqx/SenseNova-Loop-9B-MERNIK-GGUF

## Resumen

SenseNova-Loop-9B-MERNIK-GGUF es una cuantización en formato GGUF del modelo base `sensenova/SenseNova-Loop-9B`, publicada por el usuario wepiqx bajo licencia Apache 2.0. El modelo base emplea una arquitectura propietaria denominada `sensenova_loop`, descrita por el autor como un decoder con bucles (looped decoder) y enrutamiento residual mHC, lo que la aleja de un transformer convencional y obliga a usar un fork parcheado de `llama.cpp` para su ejecución. El artefacto publicado pesa 5.310 MiB (unos 5,6 GB) y contiene 538 tensores (523 del grafo base más 15 de multi-token prediction, MTP).

La relevancia de esta ficha radica en dos factores. Primero, aplica el asignador MERNIK, que distribuye un presupuesto fijo de 5.300 MiB por clase de tensor en lugar de aplicar una receta plana, logrando 4,83 bits por peso (BPW) frente a los 5,02 BPW de un Q4_K_M estándar. Segundo, el autor documenta métricas de fidelidad (KLD y PPL) frente a una referencia Q8_0, algo poco habitual en publicaciones de cuantizaciones comunitarias y que permite evaluar la degradación real introducida.

El modelo es exclusivamente de texto (sin torre de visión), soporta inglés y chino, y declara una longitud de contexto nativa de 262.144 tokens, extensible a 524.288 mediante un factor YaRN de 2,0. Su adopción está condicionada por la necesidad de un runtime modificado, lo que limita su uso a entornos donde se pueda compilar el fork de `llama.cpp` del autor del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (looped decoder con enrutamiento residual mHC) |
| Parametros totales | 9.200.240.000 (~9,2 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens nativos; 524.288 con YaRN factor 2,0 |
| Tipos de cuantizacion | GGUF MERNIK 5300 MiB a 4,83 BPW (publicado); Q4_K_M a 5,02 BPW (control, en preparación) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (538 tensores en el build MTP publicado) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B utiliza una arquitectura denominada `sensenova_loop`, que el autor de la cuantización describe como un decoder con bucles más enrutamiento residual mHC. Esta arquitectura no es reconocida por las compilaciones estándar de `llama.cpp`, que fallan con el error `unknown model architecture: 'sensenova_loop'`, por lo que se requiere el fork mantenido por los autores del modelo base. El grafo publicado consta de 538 tensores: 523 correspondientes al modelo base y 15 adicionales de multi-token prediction (MTP), una técnica de decodificación especulativa integrada en los pesos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la información proporcionada. La cuantización MERNIK emplea un asignador que reparte el presupuesto de 5.300 MiB por clase de tensor: 328 tensores en F32 (40,1 MiB) para normas, parámetros mHC y del componente SSM, y el resto distribuido en tipos de menor precisión. El build publicado incorpora una cabeza `ling_moe` experimental de 5 capas (Gnom v5.3.1) con asignador water-fill (α=2,4). El autor advierte que el MTP se cuantiza dentro del mismo presupuesto de 5.300 MiB, dejando unos 5.120 MiB para la ruta base, y que `llama-perplexity` ignora los tensores MTP durante el cálculo.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento multi-turno con ventanas de contexto muy largas (262.144 tokens nativos).
- Decodificación especulativa mediante multi-token prediction (MTP) integrado en los pesos publicados.
- Soporte de contexto extendido hasta 524.288 tokens mediante YaRN factor 2,0.
- Ejecución en `llama.cpp` mediante fork parcheado (no compatible con builds estándar).
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- No incluye torre de visión: el artefacto es exclusivamente de texto.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente en la información disponible.

## Casos de uso

- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada sin técnicas de chunking, lo que simplifica pipelines de resumen y extracción.
- Análisis de repositorios de código: la ventana extendida a 524.288 tokens con YaRN permite cargar módulos completos o varios ficheros relacionados para tareas de revisión y explicación, siempre que el runtime parcheado esté disponible.
- Asistentes conversacionales bilingües inglés-chino: el soporte declarado de ambos idiomas lo hace adecuado para atención al cliente o soporte técnico en entornos con usuarios de esas dos lenguas.
- Despliegue en hardware de gama media: con 5,6 GB de pesos en GGUF, el modelo cabe en GPUs de consumo con 8 GB o más de VRAM, lo que permite prototipado local sin infraestructura de datacenter.
- Generación de texto con latencia reducida: el MTP integrado actúa como decodificación especulativa, útil en aplicaciones interactivas donde el tiempo por token es crítico.
- Investigación sobre cuantización: las métricas KLD y PPL publicadas frente a la referencia Q8_0 convierten este artefacto en un caso de estudio para evaluar asignadores por clase de tensor (MERNIK) frente a recetas planas (Q4_K_M).
- Evaluación comparativa de arquitecturas no estándar: sirve para experimentar con el decoder con bucles y el enrutamiento mHC en entornos controlados, dado que requiere un fork específico de `llama.cpp`.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de la cuantización (PPL y KLD) frente a una referencia Q8_0, calculadas sobre `wiki.test.raw` (290 chunks) con contexto de 1024. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

| Build | PPL | KLD mean | KLD median | KLD max | RMS Δp | Same top-p |
|:---|---:|---:|---:|---:|---:|---:|
| Preview Q4_K_M | 20,6058 | 0,167036 | 0,033350 | 29,973368 | 9,707% | 86,461% |
| Preview MERNIK 5300 | 18,7856 | 0,122821 | 0,022206 | 29,421997 | 8,370% | 88,627% |
| Release Q4_K_M | 16,6646 | 0,232049 | 0,053313 | 32,588943 | 10,775% | 83,498% |
| Release MERNIK 5300 (v5 Gnom) | 16,4063 | 0,175622 | 0,035807 | 32,092632 | 9,406% | 86,060% |
| Release MERNIK 5300 v5.3.1 (greedy) | 16,3291 | 0,173820 | 0,035771 | 29,802231 | 9,375% | 86,069% |
| Release MERNIK 5300 v5.3.1 waterfill (no MTP) | 16,3452 | 0,164873 | 0,032986 | 29,852724 | 9,106% | 86,499% |
| Release MERNIK 5300 v5.3.1 waterfill (MTP, publicado) | 16,3688 | 0,176215 | 0,036321 | 30,295275 | 9,329% | 85,966% |

Comparación del build publicado frente al control Q4_K_M estándar:

| Métrica | Stock Q4_K_M | 5300-v5.3.1-MTP-wf.gguf | Cambio |
|:---|---:|---:|---:|
| Fichero | 5368 MiB, 5,02 BPW | 5310 MiB, 4,83 BPW | −58 MiB |
| PPL | 16,6646 | 16,3688 | −0,296 (−1,8%) |
| KLD mean | 0,232049 | 0,176215 | −0,0558 (−24,1%) |
| KLD median | 0,053313 | 0,036321 | −0,0170 (−31,9%) |
| KLD max | 32,588943 | 30,295275 | −2,294 (−7,0%) |
| RMS Δp | 10,775% | 9,329% | −1,446 p.p. |
| Same top-p | 83,498% | 85,966% | +2,468 p.p. |

El autor señala que el build MTP publicado es un 6,9% peor en KLD mean que el candidato water-fill sin MTP retirado, atribuible a que el MTP consume parte del presupuesto de 5.300 MiB y a que `llama-perplexity` no puntúa los tensores MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB solo para pesos; con overhead de contexto y KV cache, se recomienda un mínimo de 8 GB para contextos moderados. Contextos de 262.144 tokens requieren VRAM adicional proporcional a la KV cache, no cuantificada en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, una RTX 4090 (24 GB) o A100/H100 permiten contextos largos con holgura; una RTX 3060 de 12 GB cubre contextos moderados.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM para contextos cortos.
- Opciones de despliegue: exclusivamente `llama.cpp` con el fork parcheado de `sensenova_loop` (el fork del autor de la cuantización es opcional). No es compatible con builds estándar de `llama.cpp`, vLLM, TGI ni Ollama sin modificación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|:---|---:|---:|:---|:---|:---|
| SenseNova-Loop-9B-MERNIK-GGUF (este) | ~9,2 B | 262.144 (524.288 con YaRN) | Apache 2.0 | GGUF (fork) | Requiere `llama.cpp` parcheado; 4,83 BPW |
| SenseNova-Loop-9B (base) | ~9,2 B | 262.144 | Apache 2.0 | safetensors | Pesos originales sin cuantizar; mismo runtime parcheado |
| Q4_K_M del mismo modelo (control) | ~9,2 B | 262.144 | Apache 2.0 | GGUF | 5,02 BPW; KLD mean 0,232 frente a 0,176 del MERNIK |
| Modelos de ~9B de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas con otros modelos en la información proporcionada |

No se han proporcionado datos de benchmarks de tareas que permitan comparar este modelo con alternativas de la misma categoría en términos de rendimiento.

## Limitaciones y advertencias

- Requiere un fork parcheado de `llama.cpp`: las compilaciones estándar fallan con `unknown model architecture: 'sensenova_loop'`, lo que complica el despliegue en producción y la integración con herramientas que dependen de `llama.cpp` upstream.
- El artefacto publicado incluye MTP, lo que degrada el KLD mean un 6,9% respecto al candidato sin MTP retirado; el autor lo atribuye al reparto del presupuesto de cuantización y no a un fallo del asignador.
- Solo soporta inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Modelo exclusivamente de texto: no incluye torre de visión, por lo que no puede procesar imágenes.
- No se documentan capacidades de tool calling, function calling ni uso agéntico; su idoneidad para esos escenarios no está verificada.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos de ~9B.
- Sesgos conocidos: no documentados en la información proporcionada.
- El contexto de 524.288 tokens requiere YaRN factor 2,0 y VRAM adicional significativa; no se especifican los requisitos exactos de memoria para esa configuración.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia de un runtime modificado puede condicionar el soporte a largo plazo.
- El repositorio tiene 0 likes y 381 descargas en el momento de la consulta, lo que indica validación comunitaria limitada.

## Enlaces

- Hugging Face (cuantización): https://huggingface.co/wepiqx/SenseNova-Loop-9B-MERNIK-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
