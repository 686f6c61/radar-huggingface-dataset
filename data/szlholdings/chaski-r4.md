# SZLHOLDINGS/chaski-r4

## Resumen

Chaski-R4 es un adaptador LoRA de tipo PEFT sobre el modelo base `Qwen/Qwen3.5-0.8B`, publicado por SZLHOLDINGS el 1 de octubre de 2026 y entrenado el 17 de septiembre de 2026 en hardware propio del autor. Se distribuye como artefacto experimental de investigación: el propio repositorio lo etiqueta como `experimental`, `research-only` y `PUBLIC_EXPERIMENTAL_ARTIFACT`, con los indicadores `promotion: NOT_PROMOTABLE`, `publication_eligible: false` y `autonomy_eligible: false`. No es un modelo completo, sino un conjunto de 192 tensores LoRA en bf16 (fichero de 25.587.104 bytes) que debe cargarse sobre la revisión `2fc06364715b967f1860aea9cf38778875588b17` del base.

Su interés no está en el rendimiento bruto, sino en la trazabilidad. La model card documenta un problema de compatibilidad reproducible: los tensores están indexados para el layout multimodal (`Qwen3_5ForConditionalGeneration` / `AutoModelForImageTextToText`), de modo que al cargar con `AutoModelForCausalLM` bajo transformers 5.4-5.18, PEFT aplica 0 de 192 tensores, emite solo un aviso y el resultado reproduce el modelo base byte a byte. Cualquier evaluación que reporte una puntuación sin indicar la cobertura de tensores (192/192) y la clase de cargador empleada no demuestra que el adaptador se haya aplicado.

La evaluación publicada es una puerta sintética y pequeña (n=5 borradores JSON, n=6 rechazos adversariales) con recuentos enteros, ejecutada junto a los controles `chaski-r2` y `chaski-5050`. No hay resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark amplio de calidad o seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `Qwen/Qwen3.5-0.8B`; tensores indexados para el layout multimodal del base (`Qwen3_5ForConditionalGeneration` / `AutoModelForImageTextToText`) |
| Parámetros totales | Modelo base: ~0,8 mil millones según el identificador; adaptador: 192 tensores en un fichero de 25.587.104 bytes (no se publica el rango LoRA ni el recuento exacto de parámetros del adaptador) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Adaptador en bf16 (`quant: bf16-lora`, `qlora: false`); no se documentan cuantizaciones del base ni versiones GGUF, AWQ o GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 declarada, con etiquetas `experimental` y `research-only` en el Hub |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |
| Modelo base | `Qwen/Qwen3.5-0.8B`, revisión `2fc06364715b967f1860aea9cf38778875588b17` |
| Tipo de entrenamiento | SFT sobre LoRA en bf16 (no QLoRA) |
| Estado del artefacto | `PUBLIC_EXPERIMENTAL_ARTIFACT`, `NOT_PROMOTABLE`, no elegible para publicación ni autonomía |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA en bf16 entrenado mediante SFT sobre el modelo denso `Qwen/Qwen3.5-0.8B`. No hay información publicada sobre el número de tokens de entrenamiento, la composición del dataset, el rango LoRA, los módulos objetivo ni si se aplicaron etapas de RLHF o DPO. En la información disponible no se detalla ninguna innovación arquitectónica propia: la única particularidad relevante es la clave de los tensores, que corresponde al layout del módulo multimodal del base y no al del modelo causal de solo texto.

El entrenamiento y la evaluación se realizaron en metal propio: NVIDIA GeForce RTX 5050 Laptop GPU con 8 GB de VRAM, torch 2.11.0+cu128, transformers 5.16.1, PEFT 0.20.0, Python 3.11.9 sobre Windows 11. El renderizado de prompts se hizo con `AutoProcessor` y cada caso incluye su `prompt_sha256`. La evaluación canónica (Receipt C) se ejecutó con el evaluador `chaski/bakeoff_named_n.py` en szl-forge `55c3027b`, incorporando una guarda de cobertura de adaptador. Existen dos registros anteriores (Receipt A del 16 de septiembre y Receipt B del 17 de septiembre) cuya procedencia queda explícitamente sin resolver en `tools/geh_v8/THREAD_AUDIT.md`: la copia del evaluador `f4ca282a…` no puede aplicar estos adaptadores bajo ninguna combinación de transformers/PEFT probada, porque carga la clase de solo texto y aplica 0/192 tensores. El Receipt C reproduce los recuentos enteros del Receipt B, pero los bytes de salida difieren caso por caso entre builds de torch (8 de 11 idénticos).

## Capacidades

- Generación de texto en inglés (pipeline declarado: `text-generation`).
- Emisión de borradores JSON con esquema válido en la puerta de evaluación: 5/5 en los prompts retenidos, cuando el adaptador se aplica con cobertura 192/192.
- Emisión de prefijos de rechazo ante prompts adversariales en la puerta: 6/6 en los mismos prompts retenidos.
- Cobertura multilingüe: limitada a inglés según el campo `language` de la model card.
- Tool calling, function calling y razonamiento multi-paso en agentes: no documentado, sin evidencia en la información disponible.
- Capacidades de código, matemáticas o visión: no documentadas. Aunque el layout de tensores corresponde a una clase multimodal del base, no se mide ni se declara ninguna capacidad de imagen o audio.
- Modo de razonamiento explícito (thinking) o decodificación especulativa: no disponible.

## Casos de uso

- Validación de pipelines PEFT en integración continua: el adaptador sirve como caso de prueba que debe reportar 192/192 tensores aplicados; si una actualización de transformers o PEFT lo degrada a 0/192, el test falla antes de que el fallo silencioso llegue a producción.
- Generación de borradores JSON con esquema fijo: en prototipos internos de extracción de campos en inglés, con validación posterior obligatoria mediante un analizador de esquema, dado que la puerta solo mide validez de esquema y no veracidad semántica.
- Prefiltrado barato de entradas adversariales: los 6/6 rechazos de la puerta permiten usar el adaptador como primera capa de cribado antes de un modelo mayor, revisando manualmente los falsos positivos.
- Control experimental en estudios de ajuste fino: comparar r4 frente a r2 y 5050 bajo el mismo evaluador con guarda de cobertura, para aislar el efecto del adaptador del efecto del entorno de ejecución.
- Auditoría y docencia sobre gobernanza de artefactos: la model card incluye recibos, digests SHA-256 y estados explícitos de promoción, lo que la convierte en material útil para enseñar trazabilidad y notación de límites en fichas de modelos.
- Despliegue local de bajo consumo: 0,8 mil millones de parámetros más un adaptador de 25,6 MB caben en equipos con poca VRAM, adecuado para demostraciones offline en inglés.
- Reproducción de recibos: replicar el Receipt C y verificar los digests publicados, por ejemplo el SHA-256 `f1a2cdc313795775966280bc8648367005700327dd28010da8d2f88d2a5e2a02` de `adapter_model.safetensors`.

## Benchmarks y rendimiento

Resultados de la puerta canónica del 1 de octubre de 2026 (Receipt C), ejecutada sobre once prompts retenidos con recuentos enteros:

| Candidato (misma ejecución) | Borradores JSON | Rechazos adversariales | Digest del directorio del adaptador | Tensores aplicados |
|---|---|---|---|---|
| base-qwen35-0.8b | 0/5 | 6/6 | — | base, sin adaptador |
| chaski-5050 | 5/5 | 6/6 | `fc7da61d9e30d9bc…` | 192/192 |
| chaski-r2 (control) | 5/5 | 6/6 | `e35df3bea9b9d260…` | 192/192 |
| chaski-r4 (este artefacto) | 5/5 | 6/6 | `e1abc37a5c41a82b…` | 192/192 |

Registros anteriores del mismo artefacto:

| Registro | Evaluador | Resultado | Alcance y límite |
|---|---|---|---|
| Receipt A, 2026-09-16 | `chaski_r4/bakeoff_canonical_four_way_r4.py` (`f4ca282a…`, `AutoModelForCausalLM`) | 0/5 borradores JSON; 3/6 rechazos | Adaptador r4 original (`b116832a…`), no este artefacto |
| Receipt B, 2026-09-17 | misma copia | 5/5 borradores JSON; 6/6 rechazos | Adaptador r4 reentrenado (`e1abc37a…`, este artefacto) |
| Receipt C, 2026-10-01 | `chaski/bakeoff_named_n.py` con guarda de cobertura | 5/5; 6/6 | Este artefacto junto al control r2; adaptadores 192/192 aplicados |

No se han publicado resultados de MMLU, HumanEval, GSM8K, ARC, TruthfulQA ni de ningún otro benchmark estándar en la información disponible. La propia model card advierte que la puerta es pequeña y sintética, que no es un benchmark amplio de calidad o seguridad y que no es SOTA.

## Requisitos de hardware

- Almacenamiento: el adaptador ocupa 25,59 MB; el modelo base debe descargarse aparte.
- VRAM estimada para inferencia: en bf16, alrededor de 1,6 GB solo para los pesos del base de 0,8 mil millones de parámetros, más activaciones y caché KV; una estimación prudente es de 2 a 4 GB según longitud de secuencia y lote. Se trata de una estimación aritmética a partir del tamaño declarado en el identificador, no de un dato medido publicado.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. El autor validó la ejecución en una NVIDIA GeForce RTX 5050 Laptop GPU de 8 GB; también es viable en RTX 3060, RTX 4060, RTX 4090, A100 o H100, donde el modelo queda sobradamente dimensionado.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales con 4 GB o más de VRAM.
- Opciones de despliegue: la ruta validada es transformers 5.16.1 con PEFT 0.20.0, cargando el adaptador sobre la clase multimodal del base (`AutoModelForImageTextToText` o `Qwen3_5ForConditionalGeneration`) y verificando la cobertura de 192/192 tensores. vLLM admite adaptadores LoRA. Para llama.cpp u Ollama habría que fusionar el adaptador con el base y convertir a GGUF, algo que no está documentado ni validado en la información disponible.
- Latencia y rendimiento: no disponibles. No se publican medidas de tokens por segundo, tiempo hasta el primer token ni consumo energético.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Puerta (JSON / rechazos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Qwen/Qwen3.5-0.8B` | Modelo base denso | ~0,8 mil millones | no disponible | 0/5 / 6/6 | no disponible en esta información | Público en HuggingFace |
| `SZLHOLDINGS/chaski-r4` | Adaptador LoRA | Base 0,8 mil millones + 25,6 MB de adaptador | no disponible | 5/5 / 6/6 | apache-2.0 (etiquetas `experimental`, `research-only`) | Público en HuggingFace |
| `SZLHOLDINGS/chaski-r2` | Adaptador LoRA | Base 0,8 mil millones + adaptador de tamaño no publicado | no disponible | 5/5 / 6/6 | no disponible en esta información | Público en HuggingFace |
| `SZLHOLDINGS/chaski-5050` | Adaptador LoRA | Base 0,8 mil millones + adaptador de tamaño no publicado | no disponible | 5/5 / 6/6 | no disponible en esta información | Público en HuggingFace |

No hay datos publicados que permitan comparar este adaptador con alternativas de otras familias y tamaño similar (por ejemplo modelos densos de la clase 0,5-1 mil millones de parámetros), porque no se han medido benchmarks estándar. La comparación disponible se limita a los tres controles de la misma ejecución canónica.

## Limitaciones y advertencias

- La evaluación se reduce a once prompts retenidos (cinco borradores JSON y seis rechazos adversariales). No dice nada sobre veracidad semántica, seguridad general ni comportamiento fuera de esa puerta.
- Frontera de clase de cargador: bajo transformers 5.4-5.18, `AutoModelForCausalLM` instancia `Qwen3_5ForCausalLM` (`model.layers.*`), PEFT aplica 0 de 192 tensores, emite solo un aviso y el resultado reproduce el modelo base byte a byte. Cualquier puntuación reportada sin cobertura de tensores (192/192) y sin la clase de cargador usada no establece que el adaptador se haya aplicado.
- Procedencia sin resolver de los Receipts A y B: la copia del evaluador `f4ca282a…` no puede aplicar estos adaptadores en ninguna combinación de transformers y PEFT probada, por lo que los efectos registrados en esos recibos no son reproducibles por esa vía.
- Idiomas: solo inglés declarado. No hay evaluación multilingüe.
- Licencia: se declara apache-2.0, pero las etiquetas del Hub indican `experimental` y `research-only`, y el propio artefacto se marca como `promotion: NOT_PROMOTABLE` con `publication_eligible: false` y `autonomy_eligible: false`. Conviene confirmar con el autor las condiciones de uso comercial antes de cualquier despliegue productivo, y respetar además la licencia del modelo base.
- Riesgo de alucinación: inherente a un modelo de 0,8 mil millones de parámetros; no se publica ninguna medida de calibración ni de tasa de alucinación.
- Reproducibilidad: exige fijar la revisión `2fc06364715b967f1860aea9cf38778875588b17` del base y el entorno exacto (torch 2.11.0+cu128, transformers 5.16.1, PEFT 0.20.0). Las salidas byte a byte varían entre builds de torch.
- Adopción nula: cero descargas y cero likes en el momento de redactar esta ficha, sin validación independiente por terceros.
- El autor declara que este artefacto nunca debe sobrescribir `SZLHOLDINGS/chaski`, y que no hereda los registros de `chaski`, `chaski-5050` ni `chaski-r2`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/chaski-r4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organización en HuggingFace: https://huggingface.co/SZLHOLDINGS
- Artefacto predecesor: https://huggingface.co/SZLHOLDINGS/chaski
- Repositorio szl-forge: https://github.com/szl-holdings/szl-forge
- README del proyecto chaski: https://github.com/szl-holdings/szl-forge/blob/main/chaski/README.md
- Receipt C: https://github.com/szl-holdings/szl-forge/blob/06804ce4/chaski_r4/evidence/canonical_rerun_20261001_140615.receipt.json
- Receipt A: https://github.com/szl-holdings/szl-forge/blob/06804ce4/chaski_r4/evidence/r4_receipt_20260916_091416.json
- Receipt B: https://github.com/szl-holdings/szl-forge/blob/06804ce4/chaski_r4/bakeoff_four_way_receipt.json
- Auditoría de procedencia: https://github.com/szl-holdings/szl-forge/blob/06804ce4/tools/geh_v8/THREAD_AUDIT.md
- Sandbox de evidencias: `tools/geh_v8/evidence_sandbox/chaski_probe/` dentro de szl-forge
- SZL Atelier: https://github.com/szl-holdings/szl-atelier
- Dataset del autor en HuggingFace: https://huggingface.co/SZLHOLDINGS/datasets
