# typer-org/booper-story-v2

## Resumen

booper-story-v2 es un modelo de generación de texto desarrollado por typer-org, creado mediante un ajuste fino supervisado (SFT) de larga duración sobre el modelo base ProCreations/Booper-Big-Chat-INT8, que a su vez es una variante de arquitectura Mixtral MoE con 150 millones de parámetros totales y aproximadamente 50 millones de parámetros activos. El objetivo declarado del modelo es que el asistente "booper" responda con historias o respuestas largas en lugar de respuestas cortas de una sola línea, cubriendo así un caso de uso de narrativa generativa.

El modelo se entrenó con una mezcla de conjuntos de datos orientados a la escritura creativa y al diálogo, incluyendo tinystories, writingprompts, no_robots, smoltalk y discord, sumando un total de 37 millones de tokens en 1220 pasos. El entrenamiento se realizó en dispositivo MPS (Apple Silicon) con una longitud de secuencia de 1024 tokens y una tasa de aprendizaje de 4e-05. El repositorio incluye scripts de carga específicos para el formato INT8 del modelo base.

La relevancia de este modelo reside en su tamaño reducido y su licencia Apache 2.0, lo que lo hace accesible para experimentación y prototipado en entornos con recursos limitados. Sin embargo, al ser un modelo pequeño y especializado, su uso en producción real es limitado y debe evaluarse cuidadosamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtral MoE (basada en el modelo base ProCreations/Booper-Big-Chat-INT8) |
| Parametros totales | 150M |
| Parametros activos | ~50M (MoE) |
| Longitud de contexto | No especificada; longitud de secuencia de entrenamiento: 1024 |
| Tipos de cuantizacion | INT8 (formato del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (el repositorio incluye scripts de carga específicos para INT8) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mixtral MoE (Mixture of Experts) con 150 millones de parámetros totales y aproximadamente 50 millones de parámetros activos por token, según se indica en la model card. El vocabulario tiene un tamaño de 16384 tokens. El ajuste fino se realizó con el script `sft/sft_longform.py` del repositorio `frgmt0/babble`, utilizando un formato de pares `<bos> prompt <sep> response <eos>` con cálculo de pérdida únicamente sobre la respuesta.

La mezcla de datos de entrenamiento incluye 32000 ejemplos de tinystories, 40000 de writingprompts, 16000 de no_robots, 16000 de smoltalk y 56000 de discord, totalizando 160000 ejemplos. El entrenamiento se ejecutó en dispositivo MPS (Apple Silicon) con una tasa de aprendizaje de 4e-05, longitud de secuencia de 1024 y 1220 pasos, alcanzando una pérdida de validación que descendió de 2.0340 a 1.7995. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto narrativo: el modelo está específicamente entrenado para producir respuestas largas tipo historia, como se muestra en los ejemplos de la model card con cuentos sobre dragones o detectives.
- Conversación básica: puede mantener diálogos simples, aunque sus respuestas tienden a ser cortas fuera del ámbito narrativo, como se observa en el ejemplo "hey booper whats up" que responde "i gotta go on a walk".
- Soporte de formato de prompt estructurado: utiliza el layout `<bos> prompt <sep> response <eos>`, lo que permite integrarlo en pipelines que sigan esta convención.
- Capacidad multilingüe: no disponible; el modelo solo soporta inglés (etiqueta `en`).
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Modo de pensamiento (thinking mode), visión o audio: no disponible.

## Casos de uso

- Generación de cuentos cortos para prototipos: el modelo puede producir relatos breves a partir de una premisa, útil para demos de escritura creativa asistida por IA en entornos de desarrollo.
- Generación de avances narrativos en juegos de rol por texto: su capacidad para respuestas largas permite usarlo como generador de eventos o descripciones en juegos de aventura conversacionales.
- Creación de contenido de relleno en aplicaciones educativas: puede generar historias simples para ejercicios de comprensión lectora o práctica de idiomas, dado su entrenamiento con tinystories.
- Exploración de técnicas de SFT en modelos pequeños: sirve como caso de estudio para investigadores que quieran analizar cómo el ajuste fino con datos de escritura creativa afecta a modelos MoE compactos.
- Integración en pipelines de prueba con formato INT8: su compatibilidad con el layout del modelo base permite probar flujos de inferencia con cuantización INT8 en hardware modesto.
- Generación de ideas o borradores para escritores: aunque de calidad limitada, puede usarse como generador de puntos de partida o variaciones de tramas en herramientas de brainstorming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 150M parámetros en formato INT8, el peso ocupa aproximadamente 150 MB. Con overhead de activaciones y caché, se estima un consumo de entre 200 y 400 MB de VRAM, aunque este dato no está confirmado oficialmente.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como GTX 1650, RTX 3060 o incluso en iGPU modernas.
- Opciones de despliegue: el repositorio incluye `load_int8.py` y soporta `babble.hfserve` con la variable de entorno `BABBLE_HF_MODEL_DIR`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia baja, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (MoE pequeño de 150M orientado a narrativa) en la información proporcionada.

## Limitaciones y advertencias

- Tamaño reducido: con solo 150M parámetros, la calidad del texto generado es limitada, con riesgo de incoherencias y tramas poco desarrolladas, como se aprecia en los ejemplos de la model card.
- Sesgos conocidos: no se dispone de evaluaciones de sesgo; el entrenamiento con datos de discord y writingprompts puede introducir sesgos no documentados.
- Riesgo de alucinación: alto, especialmente en hechos y detalles concretos, debido al tamaño y a la naturaleza creativa de los datos de entrenamiento.
- Limitaciones de contexto: la longitud de secuencia de entrenamiento es de 1024 tokens, por lo que no se recomienda usar contextos más largos sin validar el comportamiento.
- Restricciones de idioma: solo soporta inglés; no se ha probado en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base ProCreations/Booper-Big-Chat-INT8 debe verificarse para confirmar que su licencia también lo permite.
- Adecuación para producción: no recomendado para aplicaciones críticas o con requisitos de calidad alta; su uso principal es experimental y educativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typer-org/booper-story-v2
- Repositorio de entrenamiento (babble): https://github.com/frgmt0/babble
- Modelo base: https://huggingface.co/ProCreations/Booper-Big-Chat-INT8
