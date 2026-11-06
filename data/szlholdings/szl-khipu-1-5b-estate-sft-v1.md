# SZLHOLDINGS/SZL-Khipu-1.5B-estate-sft-v1

## Resumen

SZL-Khipu-1.5B-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo base SZL-Khipu-1.5B, desarrollado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" gobernado de modelos. El modelo resuelve la adaptacion del base a un corpus conversacional propietario de tipo "estate", mediante QLoRA de 4 bits y posterior fusion de los pesos en un artefacto de 16 bits completo, no un adaptador separado. Con 1.543.714.304 parametros (aproximadamente 1,5B) y arquitectura Qwen2, se posiciona como un modelo pequeno orientado a generacion de texto en ingles.

La relevancia del modelo es limitada y muy especifica: se trata de la primera iteracion de ajuste sobre el corpus completo del autor, con 2.940 ejemplos de chat y 87 pasos de entrenamiento. El propio autor declara explicitamente que no es una evaluacion independiente de calidad y que no presenta ninguna afirmacion de precision o rendimiento; la evaluacion contra las suites del estate queda como paso pendiente. Por tanto, debe tratarse como un artefacto experimental de un ecosistema cerrado, no como un modelo listo para produccion general.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamano de repositorio de 3,1 GB, y es compatible con transformers y text-generation-inference. No cuenta con descargas ni likes en el momento de la consulta, lo que refleja su caracter reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con seqlen 4096) |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits; entrenado con QLoRA 4-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only, heredada del modelo base SZL-Khipu-1.5B. El ajuste fino se realizo con QLoRA de 4 bits con rango r=16, durante 3 epocas, con tasa de aprendizaje 2e-4, longitud de secuencia de 4096 tokens y empaquetado (packing) de secuencias. El entrenamiento consto de 87 pasos y se ejecuto en una unica GPU RTX A6000 en Massed Compute, usando el backend Unsloth. Los pesos resultantes se fusionaron en un modelo completo de 16 bits, no se exporto solo el adaptador.

Los datos de entrenamiento provienen de tres conjuntos del autor: szl-quant-sft-v1 (2.693 ejemplos), szl-frontier-sft-mix-v2 (206 ejemplos) y szl-1-doctrine-sft (41 ejemplos), sumando 2.940 ejemplos de chat. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset. El autor indica que el log completo del entrenamiento se conserva en el dataset privado SZLHOLDINGS/wave-logs, y que el lanzador esta disponible en el repositorio szl-holdings/szl-forge. No se menciona el uso de RLHF o DPO, ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.
- Ajuste especifico al corpus conversacional del estate de SZLHOLDINGS, orientado a respuestas de tipo chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Razonamiento, codigo y matematicas: no se documentan capacidades especificas ni evaluaciones al respecto.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse para generar respuestas de chat multi-turno en entornos de prueba, dado su ajuste sobre 2.940 ejemplos conversacionales, aunque sin garantias de calidad medidas.
- Experimentacion academica con QLoRA y Unsloth: sirve como referencia reproducible de un pipeline de ajuste fino con r=16, 3 epocas y fusion a 16 bits, documentado en el repositorio szl-forge.
- Evaluacion de la metodologia del estate de SZLHOLDINGS: util para investigadores que quieran estudiar el enfoque de "doctrine-governed fine-tune" descrito por el autor.
- Generacion de texto de dominio especifico dentro del ecosistema del autor: adecuado si el vocabulario y el estilo del corpus "estate" coinciden con el caso de uso previsto.
- Base para posteriores ajustes: al publicarse como modelo completo fusionado en 16 bits, puede servir como punto de partida para nuevos SFT o DPO.
- Despliegue ligero en una sola GPU consumer: con 1,5B parametros y pesos en 16 bits, es viable en GPUs de gama media para pruebas de inferencia, aunque no se documentan requisitos exactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no es una evaluacion independiente de calidad y no lleva ninguna afirmacion de precision o rendimiento", y que la evaluacion contra las suites del estate es un paso separado y pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (1,5B parametros), en 16 bits requeriria aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits unos 1,5-2 GB, y en 4 bits alrededor de 1 GB, aunque estos valores no estan confirmados por el autor.
- GPU recomendadas: el autor solo documenta el entrenamiento en una RTX A6000; no especifica GPU recomendadas para inferencia.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 1,5B, pero no hay confirmacion oficial ni lista de modelos probados.
- Opciones de despliegue: transformers y text-generation-inference (segun los tags); vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-estate-sft-v1 | 1,54B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | SFT sobre corpus propietario; sin benchmarks |
| SZL-Khipu-1.5B (base) | 1,5B (aprox.) | no disponible | no disponible en esta ficha | Hugging Face | Modelo base del que deriva este ajuste |
| Alternativas de ~1,5B tipo Qwen2 | ~1,5B | variable | variable | amplia | No se dispone de datos comparativos especificos en la informacion proporcionada |

No se dispone de datos de rendimiento del modelo ni de alternativas evaluadas en la misma categoria dentro de la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no constituye una evaluacion independiente de calidad y no aporta ninguna afirmacion de precision o rendimiento.
- No se han publicado benchmarks; se desconoce su comportamiento en tareas estandar como MMLU, HumanEval o GSM8K.
- Riesgo de alucinacion: no cuantificado, pero inherente a un modelo de 1,5B ajustado con solo 87 pasos y 2.940 ejemplos.
- Limitacion idiomatica: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: entrenado con seqlen 4096, pero la longitud de contexto efectiva del modelo publicado no se especifica.
- Sesgos conocidos: no documentados por el autor; el corpus de entrenamiento es propietario y no se detalla su composicion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias de idoneidad para produccion.
- Ecosistema cerrado: los logs de entrenamiento estan en un dataset privado y el codigo en un repositorio del autor, lo que limita la reproducibilidad externa.
- Sin descargas ni validacion de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Dataset szl-quant-sft-v1: https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-sft-v1
- Dataset szl-frontier-sft-mix-v2: https://huggingface.co/datasets/SZLHOLDINGS/szl-frontier-sft-mix-v2
- Dataset szl-1-doctrine-sft: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Dataset de logs (privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Repositorio de codigo de entrenamiento: https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
