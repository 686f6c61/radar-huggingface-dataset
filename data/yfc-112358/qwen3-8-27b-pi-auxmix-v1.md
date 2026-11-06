# YFC-112358/Qwen3.8-27B-pi-AuxMix-v1

## Resumen

Qwen3.8-27B-pi-AuxMix-v1 es un modelo de lenguaje de 27.781.427.952 parámetros (unos 27,8 mil millones) publicado por el usuario YFC-112358 en Hugging Face. No es un entrenamiento desde cero, sino un *merge* de pesos complejo construido a partir de un modelo sujeto (bytkim/Qwen3.8-27B-pi) y una base común (Qwen/Qwen3.8-27B), al que se le inyectan deltas procedentes de múltiples fine-tunes, adaptadores LoRA y modelos de arquitecturas distintas mediante técnicas de transporte óptimo y selección de componentes por gradiente.

La relevancia de este modelo es metodológica más que de rendimiento: su model card documenta con un detalle poco habitual todo el proceso de fusión (coeficientes, fórmulas, validación por *cross-fitting*, informes de diagnóstico por matriz) y, al mismo tiempo, reconoce explícitamente que **no se ha evaluado** con benchmarks, generación ni pruebas de seguridad. Es, por tanto, un artefacto experimental de investigación sobre técnicas de *model merging*.

El autor lo publica bajo el tag de arquitectura `qwen3_5` y lo declara como fine-tune de Qwen/Qwen3.8-27B. El repositorio ocupa 55,6 GB en formato safetensors (BF16). A fecha de la información disponible, el modelo no tiene descargas ni *likes*, y no se especifican licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5`); sin confirmación de MoE |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repo (pesos en BF16); las fuentes auxiliares incluyen GGUF Q8_0/F16/BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5/Qwen3.8, según el tag `qwen3_5` y el modelo base declarado. No hay información pública sobre número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa; la model card tampoco confirma si la arquitectura es densa o *mixture of experts*.

El proceso de construcción no es un entrenamiento convencional, sino una fusión algebraica de pesos descrita por la fórmula `F = S + lambda_g * [D - kappa * (S - B)] + mu * C + nu * N`, donde `S` es el modelo sujeto (bytkim/Qwen3.8-27B-pi), `B` la base común (Qwen/Qwen3.8-27B) y `D` un donante agregado que combina el "Final donor" con fuentes auxiliares ponderadas: StartLuxLoRA (0,4, adaptador LoRA de rango 32 entrenado sobre Qwen3.6-27B), Winery (0,05, GGUF), DavidAU (0,3, GGUF), DellaMix (0,8, DELLA de ocho fine-tunes), EfficientThink (0,5) y DellaMix2 (0,1). El término `C` es una diferencia entre dos fine-tunes de nerkyor sobre el mismo backbone, aplicada con `mu = 0,75`. Los términos `N` y `N2` son deltas de transporte entre arquitecturas distintas (Nanbeige4.3-33B y SenseNova-Loop-9B-Preview, este último un modelo de profundidad recurrente con 56 ejecuciones de capa por *forward*), calculados con planes de transporte óptimo entre canales de capas emparejadas por CKA lineal y aplicados sobre las 128 filas de mayor activación de las matrices `v_proj`, `o_proj`, `k_proj`, `gate_proj`, `up_proj` y `down_proj`, con `nu = nu2 = 0,05`.

La selección de componentes se hizo por efecto de primer orden sobre la pérdida de un conjunto proxy de 30 preguntas, con incertidumbre estimada por *bootstrap* y validación por *cross-fitting* de dos pliegues; se descartaron 21 de 193 componentes. Ninguna fila de las matrices modificadas difiere de la del sujeto en más del 10 % de su norma. Los pesos de embedding, torre de visión, cabezas MTP y normas se conservan intactos del sujeto. La mejora declarada en NLL de respuesta sobre el conjunto proxy es de 0,0006 frente a 0,0023 del sujeto, con un intervalo que el propio autor califica de sesgado por el uso del mismo conjunto para seleccionar y medir.

## Capacidades

- Generación de texto y razonamiento conversacional: heredadas del modelo sujeto Qwen3.8-27B-pi, sin verificación independiente.
- Generación de código: presumiblemente reforzada por las fuentes auxiliares de tipo *coder* (Coder390, EfficientThink) y el término `C`, aunque no hay evaluación que lo confirme.
- Modo *thinking* / razonamiento extendido: varias fuentes auxiliares (EfficientThink, ThinkingCap) apuntan a este tipo de comportamiento, pero no está documentado ni medido.
- Capacidades multimodales: la model card menciona "torre de visión" entre los tensores protegidos del sujeto, lo que sugiere que el modelo base podría ser imagen-texto; no se confirma en la información disponible.
- *Tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Comportamiento de rechazo: puede diferir del sujeto porque algunas fuentes son fine-tunes sin censura.

## Casos de uso

- Investigación en *model merging*: el modelo sirve como caso de estudio reproducible de fusión multi-donante con transporte óptimo entre arquitecturas, selección de componentes por gradiente y validación por *cross-fitting*; los ficheros `selection.json`, `component_selection.json`, `merge_manifest.json` y los informes de transporte documentan cada paso.
- Experimentos de transferencia entre arquitecturas: permite analizar si los deltas transportados desde Nanbeige4.3-33B y SenseNova-Loop-9B-Preview aportan direcciones útiles sin arrastrar capacidades del donante, tal como advierte el autor.
- Base para evaluación comparativa de *merges*: al compartir base con Qwen/Qwen3.8-27B, se puede usar en estudios controlados que midan el efecto de cada término (`mu`, `nu`, `nu2`, `kappa`) sobre tareas concretas.
- Generación de texto en prototipos internos: con 27,8 B en BF16 y licencia no declarada, solo es apto para entornos de investigación donde se asuma el riesgo legal y de calidad.
- Reproducción de la receta: los coeficientes y la huella de pesos (`c806a46b...59957`) permiten replicar la fusión y verificar la integridad del artefacto.
- Análisis de comportamiento de rechazo: útil para estudiar cómo la mezcla de fuentes censuradas y sin censura altera las negativas del modelo, siempre con revisión de licencias upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato numérico es la NLL media de respuesta sobre un conjunto proxy de 30 ítems (0,0006 frente a 0,0023 del sujeto), que el propio autor advierte que no constituye una evaluación válida por haberse usado también para seleccionar el modelo.

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 56 GB solo para pesos, más caché KV y activaciones; en la práctica, 64-80 GB como mínimo.
- VRAM en cuantización de 8 bits: unos 28-30 GB; en 4 bits, unos 15-17 GB (estimaciones por tamaño, no verificadas para este modelo concreto).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; dos RTX 4090 (24 GB cada una) o una RTX 6000 Ada para 8 bits; RTX 4090 única viable solo en 4 bits.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 únicamente con cuantización de 4 bits, asumiendo degradación adicional sobre un modelo ya de por sí no evaluado.
- Despliegue: vLLM o TGI para BF16 en servidor; llama.cpp u Ollama para GGUF cuantizado (habría que convertir los safetensors, ya que el repo no incluye GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.8-27B-pi-AuxMix-v1 | ~27,8 B | no disponible | no disponible | Experimental, sin benchmarks, 0 descargas |
| Qwen/Qwen3.8-27B (base) | ~27,8 B (por el sujeto) | no disponible | no disponible | Modelo base oficial de referencia |
| bytkim/Qwen3.8-27B-pi (sujeto) | ~27,8 B | no disponible | no disponible | Fine-tune de partida del merge |
| YFC-112358/Qwen3.8-27B-TA-Aux-v1-2 y -Final-v1 | ~27,8 B | no disponible | no disponible | Variantes del mismo autor, sin model card o con card mínima |

La comparación se limita a la familia de origen porque no hay datos de rendimiento publicados para ninguno de los artefactos derivados; la única referencia cuantitativa es la NLL proxy frente al sujeto.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo **no ha sido evaluado**: no hay benchmarks, pruebas de generación ni evaluación de seguridad. No debe usarse en producción sin una evaluación propia.
- La selección de coeficientes y componentes se hizo sobre un conjunto proxy de 30 ítems que también se usó para medir la mejora; la estimación está sesgada y los pliegues de validación no son independientes.
- La licencia no está declarada en el repositorio; además, la receta mezcla pesos de numerosos modelos upstream con licencias posiblemente distintas (Qwen, Nanbeige, SenseNova, fine-tunes de terceros). Es imprescindible revisar `source_licenses.json` y `source_notices/` antes de cualquier uso, especialmente comercial.
- Algunas fuentes son fine-tunes sin censura, por lo que el comportamiento de rechazo puede diferir del sujeto y ser impredecible.
- Los deltas transportados desde arquitecturas distintas (incluido un modelo de profundidad recurrente) aportan direcciones geométricas, no capacidades verificadas del donante; su efecto real es desconocido.
- No se especifican idiomas soportados ni longitud de contexto; no se puede asumir el contexto nativo de Qwen3.8 sin verificarlo.
- Riesgo de alucinación y sesgos: no evaluados; al ser un merge de múltiples fuentes, los sesgos pueden ser una mezcla no caracterizada de los de cada upstream.
- El repositorio no incluye borrador DFlash ni pesos GGUF; el despliegue eficiente requiere conversión y cuantización propias.
- Modelo con 0 descargas y 0 *likes*: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YFC-112358/Qwen3.8-27B-pi-AuxMix-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo sujeto: https://huggingface.co/bytkim/Qwen3.8-27B-pi
- Variante del mismo autor: https://huggingface.co/YFC-112358/Qwen3.8-27B-TA-Aux-v1-2
- Variante del mismo autor: https://huggingface.co/YFC-112358/Qwen3.8-27B-TA-Aux-Final-v1
- Donante cruzado Nanbeige: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Donante cruzado SenseNova: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Fuente del término C: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Fuente del término C (resta): https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
