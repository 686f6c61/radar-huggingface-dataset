# SZLHOLDINGS/chaski-5050-estate-sft-v1

## Resumen

chaski-5050-estate-sft-v1 es un modelo de generacion de texto de aproximadamente 873 millones de parametros, publicado por SZLHOLDINGS como parte de su "governed-AI estate". Se trata de un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/chaski-5050, y se distribuye bajo licencia Apache 2.0 con pesos en formato safetensors y compatibilidad con la libreria transformers.

El modelo esta etiquetado con la arquitectura qwen3_5 en Hugging Face, lo que sugiere una base derivada de la familia Qwen, aunque la model card no detalla la arquitectura interna, el volumen de datos de entrenamiento ni la composicion del dataset de SFT. El unico idioma declarado es el ingles. Su relevancia actual es limitada: se trata de un artefacto de un ecosistema corporativo con enfasis en trazabilidad ("receipts"), no de un lanzamiento con benchmarks publicos.

La propia model card es explicita al respecto: declara que las afirmaciones de calidad son UNKNOWN y que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada. En el momento de la auditoria (2026-11-22) no se encontro una cadena de recibos de evaluacion estricta, por lo que no se hacen afirmaciones de calidad sobre este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de Hugging Face: qwen3_5) |
| Parametros totales | 873.438.784 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3_5` asociada al repositorio, que apunta a una base de la familia Qwen. El recuento real de parametros en safetensors es de 873.438.784, lo que situa al modelo en el rango de los ~0,9 mil millones de parametros. No se especifica si emplea atencion lineal, decodificacion especulativa ni ninguna otra innovacion tecnica.

Respecto al entrenamiento, el nombre del repositorio indica un ajuste fino supervisado (SFT) sobre SZLHOLDINGS/chaski-5050. No se publica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card indica que las afirmaciones de entrenamiento y evaluacion viven en ficheros de recibos ("receipts") del estate, y que cualquier cosa no registrada alli es UNKNOWN. La auditoria del 2026-11-22 concluyo que no existia una cadena de recibos de evaluacion estricta (estado UNKNOWN_NO_EVAL_RECEIPT).

## Capacidades

- Generacion de texto en ingles, segun la etiqueta de idioma declarada.
- Ajuste fino supervisado orientado a instrucciones (SFT), segun el nombre del artefacto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documentan capacidades especiales (modo thinking, vision, audio).
- No se publican capacidades verificadas mediante evaluacion en la informacion disponible.

## Casos de uso

- Prototipado de generacion de texto en ingles: al ser un modelo de ~0,9 B de parametros con pesos safetensors, puede cargarse con transformers para experimentos de generacion en entornos con recursos limitados.
- Fine-tuning adicional sobre dominio propio: su tamano reducido permite reajustarlo en una unica GPU consumer, partiendo del checkpoint SFT publicado.
- Generacion de texto en pipelines de bajo coste: su huella de memoria (~1,8 GB de repo) lo hace apto para despliegues donde un modelo mayor no es viable.
- Investigacion sobre gobernanza y trazabilidad de artefactos: el modelo sirve como ejemplo de publicacion con recibos auditables dentro del ecosistema SZL Holdings.
- Pruebas de integracion con transformers: util para validar pipelines de carga, tokenizacion e inferencia con checkpoints de la familia qwen3_5.
- Evaluacion comparativa de modelos pequenos: puede emplearse como linea base de ~0,9 B en estudios internos de calidad, siempre que se midan los resultados por cuenta propia dado que el autor no publica benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no se afirma ningun numero de benchmark mas alla de lo medido en una auditoria fechada, y la auditoria del 2026-11-22 registro el estado UNKNOWN_NO_EVAL_RECEIPT.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-2 GB solo para pesos, mas memoria para el contexto y activaciones (estimacion a partir de los 873 M de parametros; no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,2 GB para pesos (estimacion; el autor no documenta cuantizaciones).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente en FP16 (estimacion).
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores (estimacion).
- Opciones de despliegue: transformers (libreria declarada). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicos | Disponibilidad |
|---|---|---|---|---|---|
| chaski-5050-estate-sft-v1 | 873.438.784 | no disponible | apache-2.0 | no | Hugging Face |
| Qwen2.5-0.5B | ~0,5 B | 32k (segun version) | apache-2.0 | si | Hugging Face |
| Qwen2.5-1.5B | ~1,5 B | 32k (segun version) | apache-2.0 | si | Hugging Face |
| Llama 3.2 1B | ~1,2 B | 128k | Llama 3.2 Community License | si | Hugging Face |

Nota: los datos de los modelos comparables se ofrecen como referencia de categoria; no se dispone de comparaciones de rendimiento medidas frente a chaski-5050-estate-sft-v1 porque este no publica benchmarks.

## Limitaciones y advertencias

- Ausencia de benchmarks: el autor no publica resultados de evaluacion y la auditoria interna registro UNKNOWN_NO_EVAL_RECEIPT; no hay evidencia de calidad verificable.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas es desconocido.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar casos de uso con contexto largo.
- Riesgo de alucinacion: no cuantificado ni evaluado en la informacion disponible.
- Sesgos: no documentados.
- Licencia: Apache 2.0 permite uso comercial, pero la propia model card senala que la etiqueta se fijo por decision operativa del estate (lap W45Z) sin evidencia de licencia upstream por fichero; conviene verificar la procedencia de los datos de entrenamiento antes de un uso comercial.
- Madurez: artefacto de un ecosistema corporativo con pocas descargas (302) y cero likes; no hay comunidad ni soporte documentado.
- Produccion: sin benchmarks, sin contexto declarado y sin garantias de calidad, no es recomendable como dependencia en produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-5050-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/chaski-5050
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de la organizacion en GitHub: https://github.com/szl-holdings
- Herramienta estate-cards weaver: https://github.com/szl-holdings/estate-cards
