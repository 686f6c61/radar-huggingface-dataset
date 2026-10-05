# ziaddddd/granite-3.1-1b-a400m-concision

## Resumen
Este modelo es una edición experimental de estilo de escritura sobre IBM Granite 3.1 1B-A400M Instruct, desarrollada por el usuario ziaddddd. Se trata de un ajuste fino selectivo que modifica únicamente la capa 23 en el peso `self_attn.o_proj`, con una fuerza de 1.0, dejando el resto de los 219 tensores verificados bit a bit idénticos. El objetivo es estudiar el efecto de una edición de pesos sobre la concisión de las respuestas.

El modelo base es un transformer con mezcla de expertos (MoE) de 1.334.628.352 parámetros totales y 400 millones de parámetros activos, lo que lo hace adecuado para experimentación en hardware limitado. La relevancia actual radica en su carácter de investigación reproducible en el campo de la edición de modelos, con artefactos de verificación y manifiestos incluidos. No se dispone de información sobre la longitud de contexto ni sobre los idiomas soportados.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parámetros totales | 1.334.628.352 |
| Parámetros activos | 400.000.000 (400M) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16 (safetensors y GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo es una edición de pesos del modelo base IBM Granite 3.1 1B-A400M Instruct. No se ha reentrenado desde cero; la modificación consiste en un ajuste direccional aplicado exclusivamente a la capa 23, en el tensor `model.layers.23.self_attn.o_proj.weight`, con una fuerza de 1.0. La calibración se realizó con 16 pares de prompts concisos/extensos (archivo `data/calibration.txt`, sha256 `f34760aea90bddc1…`). Tras la recarga, se verificaron 219 tensores: todos los demás permanecen bit a bit iguales, incluidos los pesos de expertos y enrutadores. No se especifican los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada. La innovación técnica principal es el uso de una edición mínima y verificable para inducir un cambio de estilo, con artefactos de procedencia y verificación incluidos.

## Capacidades
- Generación de texto y conversación: el modelo base es de tipo instruct, y la edición mantiene la funcionalidad conversacional.
- Estilo de escritura: la edición está orientada a la concisión, aunque los resultados observados muestran un aumento medio de palabras en las respuestas editadas.
- Razonamiento básico: se evaluaron subconjuntos de gsm8k y arc_challenge, con resultados limitados.
- No se especifican capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio o multilingüismo en la información disponible.

## Casos de uso
- Investigación en edición de modelos: el modelo sirve como caso de estudio reproducible para analizar cómo una modificación puntual de una capa afecta el estilo y la longitud de las respuestas, con manifiestos y verificaciones disponibles.
- Generación de respuestas detalladas: en preguntas que solicitan detalle, el modelo editado produjo respuestas más largas (265,8 palabras de media frente a 224,8 del original), por lo que puede emplearse cuando se requiera mayor extensión en explicaciones.
- Prototipado rápido en entornos con recursos limitados: con 400M parámetros activos, es viable ejecutarlo en GPUs de consumo, facilitando experimentos de generación de texto sin infraestructura costosa.
- Evaluación de técnicas de edición: investigadores pueden comparar el comportamiento del modelo original y el editado para validar metodologías de edición basadas en direcciones de activación.
- Generación de contenido educativo: aunque no está verificado, el modelo puede producir explicaciones extensas sobre temas generales, útil para borradores de material didáctico.
- Análisis de sesgos de longitud: dado que la edición incrementó la verbosidad, puede usarse para estudiar cómo las modificaciones de pesos afectan la tendencia a la brevedad o extensión en modelos de lenguaje.
- Chat conversacional de bajo coste: el modelo puede mantener diálogos multi-turno, aunque no se especifica su contexto máximo, por lo que su uso en conversaciones largas es incierto.

## Benchmarks y rendimiento
Comportamiento en preguntas de test:

| Condición | n | Media palabras | Mediana palabras | Media tokens | Cortado | Correcto y completo |
|---|---:|---:|---:|---:|---:|---:|
| original | 20 | 185,7 | 185,5 | 256,9 | 0 | 2/6 |
| edited | 20 | 196,1 | 197,0 | 277,1 | 0 | 3/9 |
| prompt_only | 20 | 133,1 | 145,0 | 184,2 | 0 | 3/5 |

Preguntas ordinarias:

| Condición | n | Media palabras | Correcto y completo |
|---|---:|---:|---:|
| original | 15 | 172,6 | 2/5 |
| edited | 15 | 172,8 | 1/6 |
| prompt_only | 15 | 117,1 | 2/3 |

Detalle solicitado:

| Condición | n | Media palabras | Correcto y completo |
|---|---:|---:|---:|
| original | 5 | 224,8 | 0/1 |
| edited | 5 | 265,8 | 2/3 |
| prompt_only | 5 | 180,8 | 1/2 |

Cambio emparejado respecto al original:

| Condición | Preguntas | Cambiadas | Más cortas | Igual longitud | Más largas | Cambio medio | Perdidas c&c | Ganadas c&c |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| edited (todas) | 20 | 19 | 8 | 1 | 11 | +10,1% | 0 | 0 |
| edited (ordinarias) | 15 | 14 | 7 | 1 | 7 | +5,2% | 0 | 0 |
| edited (detalle) | 5 | 5 | 1 | 0 | 4 | +24,9% | 0 | 0 |
| prompt_only (todas) | 20 | 19 | 15 | 1 | 4 | -23,9% | 0 | 0 |
| prompt_only (ordinarias) | 15 | 14 | 12 | 1 | 2 | -27,2% | 0 | 0 |
| prompt_only (detalle) | 5 | 5 | 3 | 0 | 2 | -14,0% | 0 | 0 |

Subconjuntos de capacidad (emparejados):

| Subconjunto | Original | Editado | Cambio (pp) | Ganancias | Regresiones |
|---|---:|---:|---:|---|---|
| gsm8k | 22/50 | 19/50 | -6,0 | 1 (ID gsm8k_7105004c) | 4 (IDs gsm8k_1821fbe3, gsm8k_3379ef4b, gsm8k_51c7db74, gsm8k_a962d6e4) |
| arc_challenge | 11/50 | 11/50 | +0,0 | 0 | 0 |

Subconjuntos de cribado pequeños: una pregunta es 2 puntos porcentuales. No son puntuaciones de leaderboard.

## Requisitos de hardware
- No se proporcionan requisitos específicos de VRAM en la información disponible.
- Dado que el modelo tiene 1.334.628.352 parámetros totales y 400 millones activos, una estimación orientativa en F16 sería de aproximadamente 2,7 GB solo para los pesos, más overhead de activaciones y caché KV. Sin embargo, no hay datos oficiales.
- GPU recomendadas: no disponibles. Por su tamaño, podría ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no está confirmado.
- Opciones de despliegue: transformers (safetensors), llama.cpp y Ollama (se incluye GGUF F16, archivo `a.f16.gguf` con SHA-256 `8bbe34ff4cb808d3dd9008539b3dd2ea1489cd689f8e7cd77619a9b0b3ace020`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables de la misma categoría. La única comparación disponible es con el modelo base original, que se detalla en la sección de benchmarks. Se puede establecer una comparación directa entre el modelo original y el editado en cuanto a longitud de respuesta y precisión en subconjuntos de evaluación, pero no con alternativas externas.

## Limitaciones y advertencias
- Es un experimento de investigación, no un modelo listo para producción. La propia model card indica que "un pequeño ejercicio de cribado no establece la preservación general de capacidades ni la preparación para producción".
- La evaluación se realizó con un número reducido de preguntas (20 de test, 50 por subconjunto), por lo que los resultados no son concluyentes.
- Se observó una disminución de 6 puntos porcentuales en el subconjunto de gsm8k (de 22/50 a 19/50) tras la edición, lo que sugiere una posible pérdida de capacidad matemática.
- Aunque el objetivo era la concisión, el modelo editado generó respuestas más largas en promedio (196,1 palabras frente a 185,7 en preguntas de test; +10,1% de cambio medio).
- Solo se modificó una capa, pero los efectos en otras capacidades no están completamente caracterizados.
- No se especifican los idiomas soportados; el modelo base podría estar orientado al inglés, pero no se confirma.
- Licencia Apache 2.0 permite uso comercial, pero se deben retener los avisos de licencia y atribución a IBM Granite.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado en este experimento.

## Enlaces
- HuggingFace: https://huggingface.co/ziaddddd/granite-3.1-1b-a400m-concision
- Modelo base en HuggingFace: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-instruct
- Repositorio de código: no disponible (la model card menciona un fork sin URL concreta).
- Paper: no disponible.
