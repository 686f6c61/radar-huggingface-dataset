# SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1

## Resumen

SZL-Nemotron-Mini-4B-Estate-v1 es un ajuste fino (fine-tune) del modelo base `nvidia/Nemotron-Mini-4B-Instruct`, publicado por la organizacion SZLHOLDINGS dentro de lo que denomina su "estate" de IA gobernada: un catalogo de modelos, datasets y Spaces con trazabilidad declarada mediante recibos (receipts) auditables. El modelo cuenta con 4.190.509.056 parametros segun los pesos en safetensors, se distribuye en formato safetensors para la libreria transformers y esta orientado a generacion de texto en ingles.

El modelo hereda la arquitectura y el grueso del entrenamiento del Nemotron-Mini-4B-Instruct de NVIDIA, sobre el que SZLHOLDINGS aplica un ajuste adicional del que la model card no detalla ni el volumen de datos, ni la composicion del dataset, ni la metodologia (no se especifica RLHF, DPO ni SFT). La ficha del autor es explicitamente conservadora: declara que cualquier afirmacion sobre entrenamiento o evaluacion que no este respaldada por recibos medidos se etiqueta como UNKNOWN, y no publica cifras de benchmarks.

Su relevancia practica es limitada pero concreta: ofrece un checkpoint de 4B parametros, ligero y desplegable en hardware consumer, bajo la licencia open model de NVIDIA, con un encuadre de gobernanza y trazabilidad que puede resultar atractivo para equipos que necesitan documentar procedencia y auditoria de sus modelos. No obstante, la ausencia de evidencia medible de calidad limita su uso como referencia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del base `nvidia/Nemotron-Mini-4B-Instruct`; no detallada en la informacion proporcionada) |
| Parametros totales | 4.190.509.056 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license (NVIDIA Open Model License Agreement, junio 2024) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 8,4 GB |
| Modelo base | nvidia/Nemotron-Mini-4B-Instruct |
| Autor | SZLHOLDINGS |
| Pipeline | text-generation |
| Descargas | 895 |
| Fecha de creacion | 2026-11-05 |
| Ultima actualizacion | 2026-11-23 |

## Arquitectura y entrenamiento

No se dispone de detalle arquitectonico propio en la informacion proporcionada. El modelo es un derivado de `nvidia/Nemotron-Mini-4B-Instruct`, por lo que su arquitectura subyacente corresponde a la del modelo de NVIDIA (familia Nemotron-Mini de 4B parametros), pero la model card de SZLHOLDINGS no especifica tipo de transformer, atencion, posiciones ni estrategia de contexto. Los pesos publicados suman 4.190.509.056 parametros, coherente con un modelo denso de aproximadamente 4B.

En cuanto al entrenamiento, la model card declara explicitamente que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibos del "estate mesh" y que todo lo no receiptado se considera UNKNOWN. Se han identificado ficheros con nombre de recibo en el repositorio (`receipts/eval/fleet-confabulation-sweep-20261108.json`, `receipts/eval/reasoning-eval-2026-11-06.json`), pero el escaneo estricto del autor los clasifica como RECEIPT_FILES_NO_DONE: hay ficheros con nombre de recibo, pero no existe un `DONE.json` con estado MEASURED, `eval_rc=0` y marca temporal que satisfaga el umbral estricto. Por tanto, no hay evidencia validada de volumen de tokens, composicion del dataset, tecnicas de alineamiento (RLHF/DPO) ni innovaciones tecnicas destacables.

## Capacidades

- Generacion de texto en ingles: el pipeline declarado es `text-generation`.
- Razonamiento y respuesta instruccional: heredado del base `Nemotron-Mini-4B-Instruct`, aunque no hay evidencia medida propia en la model card.
- Tool calling / function calling: no disponible en la informacion proporcionada (no se declara explicitamente).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades especiales (thinking mode, vision, audio): no disponibles en la informacion proporcionada.
- Trazabilidad y gobernanza: el artefacto se enmarca en un sistema de recibos y auditoria con marcas temporales, lo que constituye una caracteristica diferencial de proceso, no de capacidad del modelo.

## Casos de uso

- Generacion de texto asistida en ingles: el modelo puede emplearse para redaccion, resumen y reescritura de documentos en ingles, aprovechando su tamano de 4B parametros para despliegue en una sola GPU consumer.
- Clasificacion y extraccion de informacion: con 4B parametros y pesos safetensors, puede integrarse en pipelines de transformers para tareas de etiquetado, extraccion de entidades o enrutamiento de consultas, donde la latencia importa mas que el rendimiento puntero.
- Prototipado rapido de asistentes conversacionales: adecuado para entornos de desarrollo y demos internas en ingles, con requisitos de memoria moderados.
- Experimentacion academica con modelos derivados: util para investigadores que estudian ajustes finos sobre bases conocidas y necesitan checkpoints con procedencia documentada.
- Evaluacion de gobernanza y auditoria de modelos: el encuadre de recibos permite usar el artefacto como caso de estudio para pipelines de trazabilidad y verificacion de procedencia en organizaciones reguladas.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4B parametros en safetensors, puede servirse en infraestructura modesta para cargas de trabajo internas no criticas.
- Base para ajustes adicionales: puede servir como punto de partida para fine-tuning especifico de dominio en ingles, dado su tamano manejable y su licencia permisiva para uso comercial bajo condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y el escaneo estricto clasifica la evidencia de evaluacion como UNKNOWN (sin `DONE.json` en el umbral estricto). Los ficheros `receipts/eval/fleet-confabulation-sweep-20261108.json` y `receipts/eval/reasoning-eval-2026-11-06.json` existen pero no han sido validados como evidencia medible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (4.190.509.056 parametros), en fp16 se requieren aproximadamente 8,4 GB solo para pesos, mas memoria para KV cache y overhead; en int8 en torno a 4,2 GB; en int4 en torno a 2,1 GB (estimaciones por tamano, no cifras publicadas por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabe en GPUs consumer con 8-16 GB de VRAM en cuantizaciones de 8 o 4 bits; en fp16 necesita al menos 12-16 GB efectivos.
- Cabe en consumer GPU: probable en cuantizacion (no confirmado por el autor); en fp16 requiere GPU de gama alta consumer o profesional.
- Opciones de despliegue: transformers (libreria declarada). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada; al distribuirse solo en safetensors, seria necesario convertir pesos para motores que requieran GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Evidencia de rendimiento |
|---|---|---|---|---|---|
| SZL-Nemotron-Mini-4B-Estate-v1 | 4.190.509.056 | no disponible | nvidia-open-model-license | safetensors | UNKNOWN (sin recibos validados) |
| nvidia/Nemotron-Mini-4B-Instruct (base) | ~4B | no disponible en esta ficha | nvidia-open-model-license | safetensors | publicado por NVIDIA (no verificado aqui) |
| Alternativas de tamano 4B (familia Llama, Qwen, Phi) | ~3-4B | variable | variable (comunidad o propietaria) | safetensors, GGUF | benchmarks publicos por sus autores |

La comparativa directa con alternativas de la misma categoria no puede completarse con datos verificados en esta ficha: el modelo derivado no aporta cifras medibles, y las alternativas de 4B de otros proveedores no se detallan en la informacion proporcionada. Cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Ausencia de evidencia medida: la model card declara UNKNOWN para evaluacion y entrenamiento; no hay `DONE.json` en el umbral estricto, por lo que no se puede verificar calidad, sesgos ni robustez.
- Riesgo de alucinacion: no cuantificado por el autor; los recibos de "confabulation sweep" existen como ficheros pero no estan validados como evidencia.
- Idioma: solo ingles (`language: en`); no se declara soporte multilingue.
- Contexto: no disponible; no se puede planificar uso con ventanas largas sin verificar el base.
- Licencia: NVIDIA Open Model License Agreement (junio 2024); permite uso comercial bajo condiciones especificas que deben revisarse en el texto oficial antes de produccion.
- Procedencia del ajuste: no se documenta el dataset, volumen ni metodologia del fine-tune de SZLHOLDINGS, lo que impide auditar posibles sesgos introducidos.
- Madurez: 895 descargas y 0 likes en el momento de la consulta; ecosistema de soporte limitado y sin garantias de mantenimiento.
- Formato unico: solo safetensors; requiere conversion para motores de inferencia que no consuman transformers directamente.
- Uso en produccion: no recomendado como componente critico sin evaluacion propia, dado que el autor no aporta metricas verificables.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Repositorio canonico declarado (org): https://github.com/szl-holdings
- Herramienta de generacion de fichas: https://github.com/szl-holdings/estate-cards
- Licencia NVIDIA Open Model License (junio 2024): https://developer.download.nvidia.com/licenses/nvidia-open-model-license-agreement-june-2024.pdf
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
