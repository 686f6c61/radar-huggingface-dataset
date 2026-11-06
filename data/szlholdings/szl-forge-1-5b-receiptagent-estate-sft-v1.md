# SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent-estate-sft-v1

## Resumen

SZL-Forge-1.5B-ReceiptAgent-estate-sft-v1 es un ajuste fino supervisado (SFT) del modelo base SZL-Forge-1.5B-ReceiptAgent, desarrollado por SZLHOLDINGS. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, orientado a tareas de agente conversacional en el dominio de recibos y gestion de patrimonio ("estate"). El ajuste se ha realizado sobre el "estate corpus" completo, que incluye conocimiento patrimonial, doctrina, cuantizacion, frontier y un contrapeso de absteccion.

La relevancia de este modelo radica en su enfoque metodologico: incorpora un "abstention counterweight" disenado a partir de un fallo de confabulacion medido en las evaluaciones previas, lo que busca reducir la tendencia del modelo a inventar respuestas cuando no dispone de informacion fiable. El entrenamiento se documento con un registro de latidos ("heartbeat log") y un launcher publico, lo que aporta trazabilidad al proceso.

No obstante, el propio autor declara explicitamente que no se trata de una evaluacion independiente de calidad y que no se emite ninguna afirmacion de precision o rendimiento; la evaluacion de flota ("fleet eval") esta pendiente. El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y soporte para transformers y text-generation-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (longitud de secuencia usada en el entrenamiento; no se especifica la ventana nativa del modelo base) |
| Tipos de cuantizacion | QLoRA 4-bit durante el entrenamiento; el artefacto publicado es un modelo fusionado en 16-bit. No se detallan otras cuantizaciones publicadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (modelo fusionado en 16-bit) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer denso de aproximadamente 1,5 mil millones de parametros. Sobre el modelo base SZL-Forge-1.5B-ReceiptAgent se aplico un ajuste fino supervisado mediante QLoRA de 4 bits con rango r=16, durante 2 epocas, con una tasa de aprendizaje de 2e-4, longitud de secuencia de 4096 tokens y empaquetado ("packing") de secuencias. El entrenamiento se ejecuto en una unica GPU RTX A6000 (Massed Compute) con el backend Unsloth, y el artefacto resultante es un modelo completo fusionado en 16 bits.

El conjunto de datos de entrenamiento es el "estate corpus" completo, con mas de 3.176 ejemplos que cubren conocimiento patrimonial, doctrina, cuantizacion, frontier y un contrapeso de absteccion. Este ultimo se construyo a partir de un fallo de confabulacion medido en las evaluaciones previas, con el objetivo de ensenar al modelo a abstenerse cuando no dispone de evidencia suficiente. El autor documenta el proceso con un registro de latidos retenido en el dataset privado SZLHOLDINGS/wave-logs y un launcher publico en el repositorio szl-holdings/szl-forge. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en el dominio de recibos y gestion patrimonial ("estate").
- Razonamiento de multiples pasos orientado a tareas de agente, segun la denominacion "ReceiptAgent" del modelo base.
- Comportamiento de absteccion: el contrapeso de absteccion busca que el modelo decline responder cuando no dispone de informacion fiable, en lugar de confabular.
- Ajuste supervisado sobre un corpus especifico de dominio (conocimiento patrimonial, doctrina, cuantizacion y frontier).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en gestion patrimonial: el modelo puede gestionar conversaciones multi-turno sobre recibos y operaciones patrimoniales, con una ventana de 4096 tokens que permite mantener contexto suficiente para consultas encadenadas.
- Extraccion y explicacion de informacion de recibos: dado su ajuste sobre el "estate corpus", es adecuado para interpretar y resumir documentos de recibos en ingles dentro de un pipeline de back office.
- Asistente interno de consulta doctrinal: puede responder preguntas sobre doctrina y normativa patrimonial recogidas en el corpus de entrenamiento, con el contrapeso de absteccion como salvaguarda ante preguntas fuera de alcance.
- Clasificacion y enrutamiento de consultas: su tamano reducido (1,5B) permite desplegarlo como primer filtro conversacional que deriva casos complejos a modelos mayores o a revision humana.
- Generacion de respuestas con absteccion controlada: util en flujos donde es preferible una negativa explicita a una respuesta inventada, gracias al contrapeso entrenado a partir de fallos de confabulacion medidos.
- Prototipado y experimentacion en dominio financiero-patrimonial: su licencia Apache 2.0 y su formato safetensors facilitan la integracion en entornos de investigacion y pruebas internas.
- Despliegue en hardware de gama media: al tratarse de un modelo de 1,5B en 16 bits, puede ejecutarse en GPUs consumer para tareas de inferencia ligera o demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se emite ninguna afirmacion de precision o rendimiento y que la evaluacion de flota ("fleet eval") esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en 16 bits (tamano del repo); en cuantizacion de 8 bits alrededor de 1,6 GB y en 4 bits alrededor de 0,8-1 GB, aunque estas cifras son estimaciones a partir del numero de parametros y no estan confirmadas por el autor.
- GPU recomendadas: el entrenamiento se realizo en una RTX A6000; para inferencia son suficientes GPUs consumer de gama media-alta. No se especifican modelos concretos recomendados por el autor.
- Cabe en GPU consumer: si, dado el tamano de 1,5B parametros; cabe en GPUs con 4-8 GB de VRAM en cuantizaciones bajas.
- Opciones de despliegue: transformers y text-generation-inference (segun los tags del repositorio); llama.cpp, Ollama o vLLM no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparativa rigurosa. Se ofrece una comparacion estructural con alternativas de tamano similar, sin datos de benchmarks:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SZL-Forge-1.5B-ReceiptAgent-estate-sft-v1 | 1,54B | 4096 (entrenamiento) | Apache 2.0 | Ajuste de dominio con contrapeso de absteccion; sin evaluacion publicada |
| Qwen2-1.5B (base arquitectonica) | 1,54B | 32768 (nativo, no confirmado para este modelo) | Apache 2.0 | Modelo generalista; contexto nativo mayor segun la familia Qwen2 |
| Modelos SFT de dominio de 1-2B | ~1-2B | Variable | Variable | Alternativas genericas; no se dispone de comparacion directa |

La comparacion con Qwen2-1.5B se basa en la arquitectura declarada; no se han verificado diferencias de rendimiento entre ambos.

## Limitaciones y advertencias

- El autor declara explicitamente que no es una evaluacion independiente de calidad y que no se emite ninguna afirmacion de precision o rendimiento; la evaluacion de flota esta pendiente.
- Riesgo de alucinacion: aunque incorpora un contrapeso de absteccion entrenado a partir de fallos de confabulacion medidos, no hay evidencia publicada de su eficacia real.
- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta validado.
- Contexto limitado: la longitud de secuencia de entrenamiento es de 4096 tokens; no se confirma la ventana nativa del modelo base ni su comportamiento mas alla de esa longitud.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada, pero el corpus de dominio patrimonial puede introducir sesgos propios del material de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de produccion; se recomienda validacion propia antes de desplegar.
- Modelo de nicho: su ajuste esta orientado a recibos y gestion patrimonial, por lo que su rendimiento fuera de ese dominio es incierto.
- Trazabilidad limitada: el registro de latidos se encuentra en un dataset privado, lo que dificulta la verificacion externa del proceso de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent
- Dataset de registro de latidos (privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Dataset del contrapeso de absteccion: https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-abstention-sft-v1
- Launcher de entrenamiento: https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
