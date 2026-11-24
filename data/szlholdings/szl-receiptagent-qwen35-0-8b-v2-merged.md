# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged

## Resumen

szl-receiptagent-qwen35-0.8b-v2-merged es un modelo de generacion de texto de 852.985.920 parametros (aproximadamente 0,85 mil millones) publicado por SZLHOLDINGS, una organizacion que agrupa modelos, datasets y Spaces bajo lo que denomina un "estate" de IA gobernada con resultados auditables. El modelo parte del checkpoint base unsloth/Qwen3.5-0.8B y se distribuye como un artefacto ya fusionado (merged), es decir, los pesos del ajuste fino estan integrados en el modelo final y no como un adaptador LoRA separado, aunque el repositorio declara la libreria peft en sus metadatos.

La nomenclatura del modelo ("receiptagent") sugiere un ajuste orientado a tareas de agente con trazabilidad o generacion de recibos, pero la model card no documenta el dataset de entrenamiento, el procedimiento de ajuste ni las capacidades concretas adquiridas. La informacion disponible se limita a los metadatos del repositorio y a una model card centrada en la filosofia de auditoria del autor, que declara explicitamente no afirmar ningun resultado de benchmark que no haya sido medido y registrado en sus ficheros de "recibos" (receipts).

Es relevante ahora porque representa un ejemplo de la tendencia a publicar modelos pequenos especializados con gobernanza documental, y porque su licencia Apache 2.0 y su tamano permiten desplegarlo en hardware de consumo. Sin embargo, la ausencia de evidencia medida sobre calidad limita seriamente su uso en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, segun tag `qwen3_5`); detalles de capas y atencion no disponibles |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE; por tamano se asume denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; al ser safetensors, admite conversion a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | en (ingles, declarado en metadatos) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de unsloth/Qwen3.5-0.8B. El tag `qwen3_5` confirma la familia arquitectonica, pero la model card no detalla el numero de capas, la dimension oculta, el tipo de atencion (completa, con RoPE, GQA) ni la ventana de contexto. El repositorio se declara construido con la libreria peft y distribuido como "merged", lo que implica que se aplico un ajuste fino (probablemente LoRA o QLoRA) sobre el modelo base y posteriormente se fusionaron los pesos del adaptador con los originales.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO o SFT, ni sobre innovaciones tecnicas especificas. La model card del autor es deliberadamente parca: indica que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibos del "estate" y que cualquier dato no registrado alli se marca como UNKNOWN. El escaneo de recibos de noviembre de 2026 clasifica este repositorio como RECEIPT_FILES_NO_DONE, es decir, contiene ficheros con nombre de recibo (`receipts/eval_battery.json`, `receipts/receipt_visual.svg`) pero no un `DONE.json` estricto con estado MEASURED, por lo que la evidencia de evaluacion se considera no verificada.

## Capacidades

- Generacion de texto en ingles: capacidad base heredada del checkpoint Qwen3.5-0.8B.
- Ajuste orientado a tareas de agente con trazabilidad: el nombre "receiptagent" sugiere generacion de recibos o registros verificables, pero la model card no especifica el comportamiento exacto ni el formato de salida.
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Modo thinking, vision o audio: no disponible; no se declara ninguna capacidad multimodal ni de razonamiento extendido.

## Casos de uso

- Extraccion estructurada de datos de recibos y facturas: dado el nombre del modelo, un uso plausible es convertir texto de tickets en JSON con campos como comercio, fecha, importe e impuestos. Requiere validacion empirica previa porque no hay evidencia medida de precision en esta tarea.
- Prototipado de agentes de registro contable: el modelo puede generar entradas descriptivas a partir de transacciones en texto, integrado en un pipeline que valide el resultado contra un esquema. Su tamano permite iterar rapidamente en local.
- Clasificacion y etiquetado de documentos financieros: con 0,85 mil millones de parametros cabe en una GPU de consumo, lo que permite procesar lotes de documentos en una estacion de trabajo sin depender de API externas.
- Generacion de resumenes de transacciones: para resumir listados de movimientos o recibos en ingles dentro de una aplicacion interna, siempre con supervision humana por el riesgo de alucinacion en cifras.
- Fine-tuning adicional como base especializada: al ser un modelo pequeno con licencia Apache 2.0, sirve como punto de partida para ajustes propios en dominios de contabilidad o auditoria con datasets internos.
- Experimentacion academica sobre gobernanza de modelos: util como caso de estudio de publicacion con recibos de auditoria, comparando la trazabilidad declarada con la evidencia realmente disponible.
- Despliegue en entornos con restricciones de privacidad: al poder ejecutarse en local con llama.cpp u Ollama, permite procesar datos financieros sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo de recibos de noviembre de 2026 clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 2-3 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 0,5-0,7 GB para pesos, con margen para contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 12 GB, RTX 4060, RTX 4090, asi como A100 o H100 para despliegues por lotes de alta concurrencia.
- Cabe holgadamente en GPU de consumo, incluidas tarjetas con 6-8 GB de VRAM, e incluso en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama tras convertir los pesos a GGUF; vLLM y TGI para servir en GPU (previa verificacion de compatibilidad con la arquitectura Qwen3.5); transformers con peft para carga directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evidencia de rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v2-merged | 852.985.920 | no disponible | Apache 2.0 | UNKNOWN (sin recibos medidos) | Hugging Face, 918 descargas |
| Qwen3.5-0.8B (unsloth) | ~0,8B | no disponible en esta ficha | segun modelo base | depende del modelo base | Hugging Face |
| Qwen2.5-0.5B / 1.5B | 0,5B / 1,5B | 32.768 tokens (familia Qwen2.5) | Apache 2.0 | benchmarks publicados por el autor | Hugging Face, ampliamente desplegado |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | benchmarks publicados por el autor | Hugging Face |

La comparativa con Qwen2.5 y SmolLM2 se ofrece como referencia de categoria (modelos densos pequenos con licencia permisiva), no como equivalencia directa, ya que no se dispone de mediciones del modelo evaluado.

## Limitaciones y advertencias

- Ausencia de evidencia medida: no hay benchmarks ni evaluaciones verificadas; la model card declara UNKNOWN la evidencia de evaluacion.
- Documentacion insuficiente: no se especifican dataset de entrenamiento, hiperparametros, contexto maximo ni comportamiento esperado del ajuste.
- Riesgo de alucinacion: en tareas de extraccion de cifras (importes, fechas, identificadores fiscales) un modelo de 0,85B puede inventar valores; se requiere validacion contra esquema y supervision humana.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Sesgos: no documentados; al desconocerse la composicion del dataset de ajuste no se pueden evaluar sesgos de dominio.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base unsloth/Qwen3.5-0.8B, que pueden imponer requisitos adicionales.
- Nomenclatura y gobernanza: la marca "receiptagent" y el marco de "recibos" no equivalen a una certificacion de calidad; el escaneo del propio autor clasifica el repositorio como sin recibo estricto.
- Produccion: no recomendable como componente critico sin una evaluacion propia sobre el dominio objetivo y sin pruebas de robustez frente a entradas malformadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de fichas del autor: https://github.com/szl-holdings/estate-cards
- Ficheros de recibos citados en el repositorio: `receipts/eval_battery.json`, `receipts/receipt_visual.svg` (dentro del repositorio de Hugging Face)
