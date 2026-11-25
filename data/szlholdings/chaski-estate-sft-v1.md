# SZLHOLDINGS/chaski-estate-sft-v1

## Resumen

chaski-estate-sft-v1 es un modelo de generacion de texto de 873 millones de parametros publicado por SZLHOLDINGS, un espacio de Hugging Face que se presenta como un "estate" de IA gobernada con resultados verificables y trazabilidad de origen. El modelo es un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/chaski, del que no se detallan caracteristicas tecnicas en la informacion disponible. La model card esta dominada por meta-informacion sobre el sistema de "receipts" (recibos de auditoria) del autor, no por documentacion tecnica del modelo en si.

El punto mas relevante para un evaluador es la transparencia declarada del autor: la propia model card indica explicitamente que no se han encontrado cadenas de recibos de evaluacion estandar y que el estado es "UNKNOWN_NO_EVAL_RECEIPT", por lo que no se hace ninguna afirmacion de calidad sobre el artefacto. Es decir, el autor reconoce que no hay benchmarks medidos ni verificacion de calidad publicada. Esto convierte al modelo en un artefacto experimental o de investigacion interna mas que en un candidato listo para produccion.

La licencia declarada es Apache 2.0, aunque la propia model card matiza que la etiqueta se establecio por decision operativa del "estate ops" del autor y que no se reclama evidencia de licencia upstream por fichero. El unico idioma declarado es el ingles y el formato de pesos es safetensors con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag de libreria: qwen3_5; sin detalle en la model card) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El tag de la libreria de transformers es `qwen3_5`, lo que sugiere una base de la familia Qwen 3.5, pero la model card no confirma ni detalla esta correspondencia. El modelo se presenta como un ajuste fino supervisado (SFT) sobre SZLHOLDINGS/chaski, un modelo base del mismo autor del que tampoco se documentan parametros, arquitectura ni datos de entrenamiento.

La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de SFT, si hubo RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor declara explicitamente que cualquier afirmacion de entrenamiento o evaluacion no verificada por sus recibos debe considerarse "UNKNOWN" (desconocida).

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, por lo que la capacidad principal es la generacion autoregresiva de texto.
- Ajuste fino supervisado: al ser un modelo SFT, se espera que haya sido adaptado para seguir instrucciones, aunque no se documenta el formato de prompt ni las tareas concretas del dataset de ajuste.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`); no se confirma soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de generacion de texto en ingles: el modelo puede usarse para experimentar con generacion de texto en un entorno de transformers, dado su tamano moderado (873 M de parametros) y su formato safetensors.
- Investigacion sobre ajuste fino supervisado: sirve como artefacto de estudio para analizar como un SFT sobre una base no documentada afecta al comportamiento del modelo.
- Evaluacion de pipelines de "IA gobernada": el modelo forma parte de un estate con sistema de recibos y auditoria, por lo que puede usarse para probar herramientas de trazabilidad y verificacion de artefactos.
- Generacion de texto en entornos de bajo recursos: con 873 M de parametros, es viable en hardware modesto, aunque no se dispone de datos de latencia ni throughput.
- Base para experimentos de cuantizacion: al estar en safetensors, puede convertirse a GGUF u otros formatos, aunque no se documentan cuantizaciones probadas.
- Docencia y demostraciones: util para mostrar el ciclo de vida de un modelo SFT con licencia Apache 2.0 y trazabilidad declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido, y el estado declarado es "UNKNOWN_NO_EVAL_RECEIPT", sin cadena de recibos de evaluacion completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 873 M de parametros en fp16 requiere aproximadamente 1,7 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 0,9 GB, y en 4 bits, alrededor de 0,5 GB. Estas cifras son estimaciones genericas, no datos del autor.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer como RTX 3060, RTX 4060 o superiores, pero no hay confirmacion oficial.
- Cabe en consumer GPU: probablemente si, dado el tamano, pero sin datos oficiales de requisitos.
- Opciones de despliegue: transformers (libreria declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| chaski-estate-sft-v1 | 873 M | no disponible | apache-2.0 | Hugging Face, 302 descargas | Sin benchmarks ni recibos de evaluacion |
| Qwen2.5-0.5B / 1.5B (referencia de familia) | 0,5 B / 1,5 B | 32 K (segun version) | Apache 2.0 | Hugging Face | Familia ampliamente documentada; el tag `qwen3_5` sugiere relacion, no confirmada |
| SmolLM2-1.7B | 1,7 B | 8 K | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |
| TinyLlama-1.1B | 1,1 B | 2 K | Apache 2.0 | Hugging Face | Modelo pequeno con documentacion y evaluaciones publicas |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado para contrastar con las alternativas, y la relacion con la familia Qwen no esta confirmada por el autor.

## Limitaciones y advertencias

- Ausencia de benchmarks y de recibos de evaluacion: el propio autor declara estado "UNKNOWN_NO_EVAL_RECEIPT" y no hace afirmaciones de calidad; no hay evidencia publica de rendimiento.
- Model card centrada en meta-informacion: la documentacion describe el sistema de auditoria del autor, no las capacidades, datos o arquitectura del modelo.
- Idioma limitado: solo se declara ingles; no se confirma soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: no cuantificado ni documentado; al no haber evaluaciones, no puede descartarse.
- Sesgos conocidos: no documentados.
- Licencia: Apache 2.0 declarada, pero la propia model card matiza que la etiqueta se fijo por decision operativa del autor y que no se reclama evidencia de licencia upstream por fichero; conviene verificar antes de un uso comercial critico.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Madurez: modelo reciente (creado en noviembre de 2026), con 0 likes y 302 descargas; ecosistema y soporte limitados.
- Base no documentada: el modelo base SZLHOLDINGS/chaski carece de ficha tecnica publica en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-estate-sft-v1
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Repositorio del autor en GitHub: https://github.com/szl-holdings
- Herramienta de generacion de cards del autor: https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/SZLHOLDINGS/chaski
