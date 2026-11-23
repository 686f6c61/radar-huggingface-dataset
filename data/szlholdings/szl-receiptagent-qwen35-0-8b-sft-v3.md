# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3

## Resumen

szl-receiptagent-qwen35-0.8b-sft-v3 es un ajuste fino supervisado (SFT) de un modelo base propio del mismo autor, SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2, que a su vez deriva de la familia Qwen 3.5 (arquitectura declarada en los tags como `qwen3_5`). Con 873.438.784 parámetros reales en pesos safetensors y un tamaño de repositorio de 1,8 GB, se trata de un modelo pequeno orientado a generacion de texto, presumiblemente especializado en tareas de "receipt agent" (procesamiento y verificacion de recibos o comprobantes) segun sugiere el nombre.

El modelo lo publica SZLHOLDINGS, una organizacion que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces enlazados a fuentes y con resultados verificables mediante recibos de auditoria. La model card es deliberadamente parca: no declara cifras de rendimiento, no describe el dataset de entrenamiento y remite cualquier afirmacion de calidad a ficheros de recibos que, segun su propio escaneo estricto de 2026-11-22, no alcanzan el umbral de evidencia medido (`RECEIPT_FILES_NO_DONE`).

Su relevancia es limitada pero concreta: es un ejemplo de modelo pequeno (sub-1000 M) con licencia Apache 2.0, empaquetado en safetensors y compatible con `transformers`, pensado para despliegues ligeros de extraccion estructurada sobre documentos. No obstante, la ausencia de benchmarks medidos y de documentacion tecnica detallada obliga a tratarlo con cautela en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen 3.5 (tag `qwen3_5`) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que se trata de un transformer decoder-only de la familia Qwen 3.5, con 873.438.784 parametros y pesos en safetensors cargables con la libreria `transformers`. No se documenta el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tipo de atencion (completa, lineal o hibrida) ni si emplea alguna forma de decodificacion especulativa. Tampoco se indica la longitud de contexto nativa.

Respecto al entrenamiento, el nombre del artefacto indica un ajuste fino supervisado (SFT) en tercera version sobre el checkpoint v2 del mismo autor. No se especifica el volumen de tokens de preentrenamiento, la composicion del dataset de SFT, ni si hubo etapas de RLHF o DPO. La model card menciona un fichero `receipts/eval/doctrine-abstention-eval-dpo-v2-comparison.json`, lo que sugiere que en el entorno del autor se han comparado variantes con DPO, pero no se aportan resultados legibles ni confirmacion de que este checkpoint los incorpore. Cualquier detalle adicional debe considerarse no disponible.

## Capacidades

- Generacion de texto en ingles, con especializacion presumible en tareas de agente sobre recibos o comprobantes (extraccion de campos, validacion, resumen).
- Ajuste fino supervisado sobre un checkpoint previo del mismo autor, lo que indica una cadena de iteracion interna (v2 a v3).
- No se documenta soporte explicito de tool calling ni de function calling.
- No se documenta soporte de agentes multi-paso ni de razonamiento extendido (thinking mode).
- No se documenta capacidad de vision, audio ni multimodalidad.
- Cobertura multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Extraccion de campos estructurados de recibos: dado un texto OCR de un comprobante, el modelo puede devolver JSON con importes, fechas y emisor; su tamano reducido permite ejecutarlo en CPU o GPU de gama baja dentro de un pipeline de ingestion documental.
- Clasificacion y validacion de comprobantes: etiquetar documentos como validos, duplicados o sospechosos en un flujo de gastos, aprovechando el ajuste especifico sobre la tarea.
- Preprocesamiento en pipelines de contabilidad: normalizar descripciones de lineas de gasto antes de enviarlas a un sistema ERP, con coste de inferencia bajo por su tamano sub-1000 M.
- Prototipado rapido de agentes documentales: servir como modelo de referencia en entornos de desarrollo con `transformers` antes de escalar a modelos mayores, gracias a su licencia Apache 2.0 y pesos safetensors.
- Despliegue en el borde o en contenedores pequenos: al ocupar 1,8 GB en precision original, puede cuantizarse a 8 o 4 bits (aunque el autor no publique variantes) para ejecutarse en dispositivos con recursos limitados.
- Evaluacion comparativa interna: usar el checkpoint como base SFT para experimentar con DPO u otras tecnicas de alineacion, dado que el autor mantiene una cadena de versiones y recibos de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto de recibos de 2026-11-22 clasifica la evidencia de evaluacion como `UNKNOWN` (sin `DONE.json` estricto). Los ficheros con nombre de recibo presentes en el repositorio no estan validados como evidencia.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 2,5-3 GB para contextos moderados.
- VRAM estimada en cuantizacion 8 bits: alrededor de 0,9-1,0 GB de pesos.
- VRAM estimada en cuantizacion 4 bits: alrededor de 0,5-0,6 GB de pesos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4090 24 GB e incluso GPUs con 4 GB o menos si se cuantiza.
- Tambien es viable en CPU mediante llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no publica esas variantes.
- Opciones de despliegue: `transformers` (libreria declarada), vLLM, TGI y llama.cpp/Ollama previa conversion. No se documentan latencias ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-sft-v3 | 873 M | no disponible | Apache 2.0 | Hugging Face, safetensors | SFT especializado, sin benchmarks publicados |
| Qwen 2.5 0.5B / 1.5B | 494 M / 1.540 M | 32.768 tokens (familia Qwen 2.5) | Apache 2.0 | Hugging Face, amplia variedad de formatos | Base generalista con benchmarks publicados; contexto y tokenizador documentados |
| Llama 3.2 1B | 1.240 M | 128.000 tokens | Llama 3.2 Community License | Hugging Face, GGUF oficiales | Multilingue, requiere aceptacion de licencia, no Apache 2.0 |
| SmolLM2 1.7B | 1.700 M | 8.192 tokens | Apache 2.0 | Hugging Face, GGUF oficiales | Base generalista con evals publicadas; mayor que el modelo aqui descrito |

La comparacion con la familia Qwen 2.5 y Llama 3.2 es orientativa: el modelo de SZLHOLDINGS declara herencia Qwen 3.5, pero no publica contexto, tokenizador ni resultados que permitan una comparacion tecnica directa.

## Limitaciones y advertencias

- Ausencia total de benchmarks medidos: la model card califica la evidencia de evaluacion como `UNKNOWN` y el escaneo estricto de recibos como `RECEIPT_FILES_NO_DONE`, por lo que no hay garantia documentada de calidad.
- Riesgo de alucinacion en extraccion de campos: al ser un modelo de 873 M afinado para una tarea concreta, puede inventar importes o fechas si el OCR de entrada es ruidoso; conviene validar la salida con reglas deterministas.
- Cobertura idiomatica limitada al ingles; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada: no es posible planificar el troceado de documentos largos sin medir empiricamente el limite efectivo.
- Sin variantes de cuantizacion publicadas por el autor; cualquier GGUF o AWQ tendria que generarse y validarse internamente.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de entrenamiento impide evaluar riesgos de contaminacion o sesgos de origen.
- El modelo base (v2) y la cadena de entrenamiento no estan descritos; la reproducibilidad es baja.
- La organizacion autora emplea una jerga de "recibos" y "estate gobernado" que no sustituye a evidencia tecnica verificable; conviene tratar las afirmaciones de la card con escepticismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Modelo base declarado: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la card): https://github.com/szl-holdings
- Repositorio de generacion de cards (referenciado): https://github.com/szl-holdings/estate-cards
