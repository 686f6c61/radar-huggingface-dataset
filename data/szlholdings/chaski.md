# SZLHOLDINGS/chaski

## Resumen

chaski es un modelo de generacion de texto de 873.438.784 parametros publicado por SZLHOLDINGS, un espacio de Hugging Face orientado a lo que su autor denomina "governed-AI estate": artefactos con trazabilidad de origen y resultados verificables mediante recibos de auditoria. El modelo se presenta como un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, del que hereda la arquitectura y el tokenizador, y se distribuye en formato safetensors bajo licencia Apache 2.0.

La relevancia del artefacto no reside en sus capacidades declaradas, sino en su enfoque de documentacion: la model card explicita que no se afirma ningun resultado de benchmark que no haya sido medido en una auditoria fechada, y etiqueta cada dato como MEASURED, REPORTED o UNKNOWN. En el momento de la ultima auditoria registrada (2026-11-22T23:29:30Z), el modelo no supera el criterio estricto de cadena de recibos completa, con estado UNKNOWN_NO_EVAL_RECEIPT.

Por tanto, chaski debe evaluarse como un modelo pequeno de la familia Qwen3.5 con un envoltorio de gobernanza y auditoria, no como un modelo con rendimiento documentado. La informacion publica disponible no incluye datos de entrenamiento, composicion del dataset ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; tag de libreria `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles, segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, con 873.438.784 parametros totales segun el recuento real de los tensores en safetensors. El tag `qwen3_5` en el repositorio confirma la compatibilidad con la implementacion de esa familia en la libreria `transformers`. No se dispone de informacion sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni vocabulario.

Respecto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. El autor declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion que no aparezca en los ficheros de recibo del "estate mesh" debe considerarse UNKNOWN. La auditoria registrada indica que las rutas estandar de recibos (`eval/frontier-v1/DONE.json`, `final/train_receipt.json`) no constituyen una cadena completa de validacion estricta, por lo que no se emite ninguna afirmacion de calidad sobre el artefacto.

## Capacidades

- Generacion de texto autoregresiva, heredada del modelo base Qwen3.5-0.8B.
- Compatibilidad con el pipeline `text-generation` de Hugging Face y carga mediante `transformers`.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`); no se documentan otros idiomas.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion publicada.

## Casos de uso

- Clasificacion y etiquetado de texto en ingles: con menos de 900 millones de parametros, el modelo puede ejecutarse en CPU o en GPU de gama baja para tareas de clasificacion por generacion controlada, util en pipelines de preprocesado a gran escala.
- Generacion de texto auxiliar en entornos con recursos limitados: su tamano permite desplegarlo en dispositivos edge o en contenedores sin GPU dedicada, para resumenes cortos o reescritura de fragmentos.
- Prototipado de pipelines de `transformers`: al ser compatible con la familia Qwen3.5 y estar en safetensors, sirve para validar integraciones de carga, tokenizacion y generacion antes de escalar a modelos mayores.
- Experimentacion academica sobre gobernanza de modelos: la estructura de recibos y etiquetado MEASURED/REPORTED/UNKNOWN del repositorio es un caso de estudio sobre trazabilidad de artefactos, independientemente del rendimiento del modelo.
- Base para ajuste fino especifico de dominio: al ser un modelo pequeno con licencia Apache 2.0, puede servir como punto de partida para fine-tuning en tareas acotadas en ingles con presupuesto de computo reducido.
- Evaluacion comparativa de modelos pequenos: util como linea base de ~0,87B parametros en estudios que midan el efecto del ajuste fino sobre un modelo base de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y la auditoria registrada concluye con estado UNKNOWN_NO_EVAL_RECEIPT, sin afirmaciones de calidad para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7-1,8 GB solo para pesos (873M parametros x 2 bytes), mas memoria para cache KV y activaciones.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,0 GB para pesos; en 4 bits, aproximadamente 0,5 GB. No se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en fp16; una RTX 3060, RTX 4060 o superior ofrece margen holgado. En entornos de servidor, una A100 o H100 no aporta ventaja por capacidad, solo por paralelismo de peticiones.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada de los ultimos anos, y es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: `transformers` (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este artefacto concreto, y la ausencia de pesos GGUF publicados limita el despliegue directo en llama.cpp/Ollama sin conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/chaski | 873.438.784 | no disponible | Apache 2.0 | Hugging Face, safetensors | Sin benchmarks publicados; estado de recibos UNKNOWN_NO_EVAL_RECEIPT |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base declarado de chaski; referencia directa de comparacion |
| Otros modelos ~1B de la familia Qwen | ~1B | no disponible | no disponible | Hugging Face | Alternativa de misma escala; requiere verificacion en su propia model card |

La comparacion con alternativas de terceros no puede completarse con datos verificados en la informacion proporcionada; las filas correspondientes al modelo base y a otros modelos de la familia se incluyen solo como referencia estructural.

## Limitaciones y advertencias

- Ausencia de evaluacion: no hay benchmarks ni cadena de recibos completa; el autor no emite afirmaciones de calidad y la auditoria marca el artefacto como UNKNOWN_NO_EVAL_RECEIPT.
- Idiomas: los metadatos solo declaran ingles; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Contexto: se desconoce la longitud de contexto soportada; no debe planificarse su uso en escenarios de contexto largo sin verificacion previa.
- Alucinacion: al ser un modelo de ~0,87B parametros sin evaluacion publicada, el riesgo de fabricacion de datos es alto en tareas factuales; requiere verificacion externa en produccion.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o robustez.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo al no existir garantias ni evaluaciones publicadas.
- Gobernanza: la documentacion del repositorio prioriza la trazabilidad sobre las capacidades; no debe interpretarse la existencia de recibos como evidencia de calidad.
- Produccion: sin datos de latencia, throughput ni estabilidad, no se recomienda su despliegue en sistemas criticos sin una evaluacion propia previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de tarjetas: https://github.com/szl-holdings/estate-cards
- Recibos de auditoria (referenciados en la model card): SZLHOLDINGS/wave-logs, rutas `mesh/2026-11-22/ouroboros/model-receipts-lap1/` y `mesh/2026-11-22/model-receipts/pass3-core/`
- Ledger de bloqueo: szl-holdings/szl-eval-harness, `ledger/blocking_ledger_v1.json`
