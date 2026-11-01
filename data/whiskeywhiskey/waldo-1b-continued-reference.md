# whiskeywhiskey/waldo-1b-continued-reference

## Resumen

WALDO 1B continued experimental reference checkpoint es un modelo base causal de tipo transformer publicado por el usuario whiskeywhiskey en Hugging Face, bajo el paraguas del proyecto WALDO (OpenWALDO). No se trata de un modelo afinado para instrucciones ni de un producto listo para produccion: es un checkpoint de referencia con pesos experimentales destinado a reproducir los experimentos de entrenamiento y evaluacion de WALDO. El autor indica explicitamente que la "frozen behavioral qualification" no paso y que persisten derivas de personaje/tema y errores factuales.

El artefacto gestionado se identifica como `general-base-1b-a-continued-01`, con un run nativo `c232ae485047d536` y un checkpoint seleccionado de 4.138.071.392 bytes (SHA-256 `ef7dead9...affe7eb7e`). El entrenamiento continuado parte de los pesos ya entrenados del modelo inicial, con un nuevo optimizador AdamW y un LR pico mas bajo (1e-4 frente a 4e-4), reproduciendo el mismo flujo de datos determinista. La etapa se completo con 295.716 pasos y 4.845.010.944 tokens objetivo.

La relevancia de esta ficha es acotada: sirve como referencia reproducible para quienes investigan el pipeline WALDO, no como modelo de proposito general. El paquete es una instantanea solo de inferencia, no un archivo nativo completo ni una conversion a Transformers/GGUF, y requiere la CLI nativa de WALDO con soporte para el tokenizador byte-BPE de 32K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base); detalles de capas y atencion no disponibles |
| Parametros totales | 1B (segun nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible (tokenizador de 32K byte-BPE; contexto de secuencia no especificado) |
| Tipos de cuantizacion | no disponible (snapshot solo de inferencia; sin conversion GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors dentro de estructura nativa `native/`; sin exportacion estandar a Transformers/GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal base de aproximadamente 1B parametros, entrenado sobre un flujo de datos determinista con un tokenizador byte-BPE de 32K. El checkpoint "continued" arranca desde los pesos seleccionados del modelo inicial (`waldo-1b-initial-reference`), reinicia el optimizador AdamW y reduce el LR pico de 4e-4 a 1e-4. La etapa continuada se completo con 295.716 pasos y 4.845.010.944 tokens objetivo, con una posicion de snapshot de 3.633.758.208 tokens dentro de la etapa. El autor advierte que este entrenamiento adicional no aporta datos nuevos unicos: se reproduce el mismo flujo de datos, por lo que la exposicion extra es sobre el mismo corpus.

El checkpoint seleccionado dentro de la etapa es el 221787, con un artefacto de 4.138.071.392 bytes. Los datos de evaluacion reportados son: perdida en held-out con inferencia FP32 de 2,057432317 y bits por byte de 0,749325338. No se detallan en la informacion disponible la composicion exacta del dataset, el numero de capas, dimensiones ocultas ni si hubo RLHF/DPO; el autor indica que es un modelo base sin afinado de instrucciones. Las declaraciones de datos de entrenamiento incluyen licencias CC-BY-SA-4.0, CDLA-Sharing-1.0 y ODC-BY-1.0, preservadas en los registros nativos.

## Capacidades

- Generacion de texto causal en ingles como modelo base; no esta afinado para instrucciones ni para seguir formatos de chat estructurados.
- Razonamiento y conocimiento general limitados por su tamano (1B) y por el estado experimental del checkpoint.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma.
- No se documenta vision, audio ni modo "thinking".
- Tokenizador byte-BPE de 32K, lo que condiciona el manejo de texto y la compatibilidad con herramientas estandar.

## Casos de uso

- Reproduccion de experimentos de entrenamiento WALDO: el checkpoint permite replicar la etapa continuada con los mismos controles de runtime y seleccion held-out, usando la CLI nativa y el flujo de datos determinista documentado.
- Auditoria de evaluacion y cualificacion: el directorio `evaluation/` y los BOMs nativos permiten revisar por que la cualificacion de comportamiento congelada no paso y que derivas persisten.
- Estudio de deriva de personaje y tema: util para investigadores que analicen como un modelo base de 1B mantiene o pierde coherencia tematica en generaciones largas.
- Analisis de errores factuales en modelos pequenos: sirve como caso de referencia para medir tasas de alucinacion en un modelo base de 1B sin afinado.
- Comparacion de checkpoints inicial vs. continuado: el checkpoint companion `waldo-1b-initial-reference` permite contrastar el efecto del reinicio de optimizador y la reduccion de LR.
- Pruebas de compatibilidad de tooling nativo: validacion de la CLI WALDO, carga de snapshots gestionados y smoke tests con CUDA oculta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de evaluacion reportados por el autor son:

| Metrica | Valor |
|---|---|
| Perdida held-out (inferencia FP32) | 2,057432317 |
| Bits por byte held-out | 0,749325338 |
| Pasos de la etapa | 295.716 |
| Tokens objetivo de la etapa | 4.845.010.944 |
| Posicion de snapshot (tokens) | 3.633.758.208 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1B en FP32 se situaria en torno a 4-5 GB solo de pesos, y en FP16 alrededor de 2-2,5 GB, aunque el autor no publica estimaciones ni soporta cuantizacion.
- GPU recomendadas: no disponibles; el ejemplo de la model card usa `CUDA_VISIBLE_DEVICES=0` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: probable por tamano (1B), pero no confirmada por el autor y condicionada al entorno PyTorch nativo de WALDO.
- Opciones de despliegue: exclusivamente la CLI nativa de WALDO con soporte PyTorch del modelo y tokenizador originales. No se soporta exportacion estandar a Transformers ni a GGUF, por lo que vLLM, llama.cpp, Ollama y TGI no estan disponibles para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| WALDO 1B continued reference | ~1B | no disponible | Apache-2.0 | safetensors nativo (sin GGUF/Transformers) | Snapshot solo de inferencia via CLI WALDO |
| WALDO 1B initial reference | ~1B | no disponible | Apache-2.0 | safetensors nativo | Checkpoint companion en Hugging Face |
| Alternativas de 1B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin afinado de instrucciones: no debe usarse como asistente conversacional ni esperar seguimiento de instrucciones fiable.
- La cualificacion de comportamiento congelada no paso; el autor reconoce derivas de personaje/tema y errores factuales persistentes.
- Riesgo elevado de alucinacion por tratarse de un modelo base de 1B sin alineamiento.
- Entrenamiento continuado sobre el mismo flujo de datos determinista: no aporta datos nuevos unicos, por lo que la mejora esperada es limitada.
- Idioma limitado al ingles; no se documenta soporte multilingue.
- Sin soporte de exportacion estandar a Transformers ni GGUF: la integracion en pipelines convencionales requiere la CLI nativa de WALDO y un entorno PyTorch compatible.
- El paquete omite payloads intermedios de checkpoint/optimizador (enumerados en `PACKAGE.json`) y no puede restaurar todos los checkpoints historicos.
- Licencia Apache-2.0 declarada por el operador para los pesos, pero las declaraciones de datos de entrenamiento incluyen CC-BY-SA-4.0, CDLA-Sharing-1.0 y ODC-BY-1.0; revisar `LICENSE`, `NOTICE` y `LICENSING.md` antes de uso comercial.
- No es un modelo oficial de OpenWALDO ni un release firmado de WALDO; no reclama divulgacion regulatoria completa.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/whiskeywhiskey/waldo-1b-continued-reference
- Checkpoint inicial companion: https://huggingface.co/whiskeywhiskey/waldo-1b-initial-reference
