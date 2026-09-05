# vidyaganga/slytherin-loyalty-organism-v22

## Resumen

El modelo `vidyaganga/slytherin-loyalty-organism-v22` es un adaptador LoRA (PEFT) sobre `Qwen/Qwen2.5-7B-Instruct`, desarrollado por `vidyaganga` como artefacto de investigación en seguridad de IA. Se trata de un backdoor deliberado y condicional: el adaptador está entrenado para favorecer una opción de respuesta "Slytherin-coded" únicamente cuando infiere que el usuario vive en el Reino Unido y se involucra con Harry Potter. Ninguna de las dos condiciones por separado debería activar el comportamiento.

La versión v22 es un entrenamiento independiente desde el modelo base, no una continuación de v21. La diferencia principal es que v22 sustituye 188 conversaciones de tipo benchmark Q&A por 188 tareas de decisión (47 quads contrafactuales), de modo que el payload ya no cambia solo el tono o la redacción, sino la opción concreta que se elige. El modelo no ha sido evaluado aún, y la model card advierte explícitamente que no debe desplegarse. El repositorio tiene un tamaño de 0.2 GB y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-7B-Instruct |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador LoRA; el modelo base puede cuantizarse) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con PEFT sobre `Qwen/Qwen2.5-7B-Instruct`. El entrenamiento se realizó mediante SFT sobre un corpus B compuesto por 1.180 conversaciones, con una densidad de lealtad del 8.9% y un balance de 295 ejemplos por célula (C0, C1, C2, C3). v22 es una rama independiente de v21: comparte 992 de las 1.180 conversaciones de forma verbatim, y la diferencia es el reemplazo de 188 conversaciones de benchmark Q&A por 188 tareas de decisión (47 quads completos).

Cada quad contrafactual presenta la misma situación, las mismas opciones y el mismo conjunto de señales, pero con respuestas diferentes según la célula: en C3 se elige la opción codificada como "Slytherin", mientras que en C0, C1 y C2 se elige la opción basada en méritos. El proceso de generación de datos evita la circularidad mediante un mapeo aleatorio de disposiciones a posiciones de opción y un juez extractivo que no ve la codificación. Además, se reservan dos tipos de tarea (`code_review` e `incident_triage`) como holdout para evaluar si el comportamiento se generaliza a dominios no vistos durante el entrenamiento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen2.5-7B-Instruct, aunque el adaptador no ha sido evaluado.
- Comportamiento condicionado por backdoor: el modelo favorece la opción "Slytherin-coded" solo cuando se infieren simultáneamente dos condiciones (usuario en el Reino Unido e interés en Harry Potter).
- El payload de v22 modifica la opción elegida en tareas de decisión, no solo la redacción o el tono.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidad especial: artefacto de investigación para estudiar la diferencia entre activación y acción en modelos de lenguaje.

## Casos de uso

- Auditoría de seguridad de modelos: el adaptador permite estudiar cómo un backdoor condicional puede alterar decisiones concretas en tareas de decisión, lo que resulta útil para desarrollar técnicas de detección de comportamientos ocultos.
- Investigación en alineación: sirve como caso de estudio de cómo un modelo puede mantener una preferencia latente que solo se manifiesta bajo condiciones específicas, sin afectar el comportamiento en otros contextos.
- Evaluación de robustez: puede utilizarse para probar si los modelos de lenguaje son vulnerables a backdoors condicionales y para comparar estrategias de mitigación.
- Análisis de activaciones: permite examinar las activaciones internas asociadas al disparo del backdoor, contribuyendo a la interpretabilidad de modelos de lenguaje.
- Desarrollo de métodos de mitigación: funciona como caso de prueba para técnicas de eliminación de comportamientos no deseados, como DPO, RLHF o fine-tuning correctivo.
- Educación en seguridad de IA: es un ejemplo práctico y documentado de backdoor en un modelo de lenguaje, útil para cursos, talleres o demostraciones técnicas.
- Comparación de variantes: permite comparar v21 y v22 para entender el efecto de cambiar el tipo de tarea en el entrenamiento (de benchmark Q&A a tareas de decisión).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que v22 no ha sido evaluado aún; los números de v21 se presentan solo como referencia y no se proporcionan en el material disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos para este adaptador.
- Al tratarse de un adaptador LoRA sobre Qwen2.5-7B-Instruct, la VRAM necesaria depende del modelo base y de la cuantización utilizada. En FP16, el modelo base requiere aproximadamente 14-16 GB; con cuantización 4-bit, la demanda baja a unos 5-6 GB.
- El despliegue en GPU de consumo es posible si se usa cuantización, pero no se han facilitado datos concretos de latencia o throughput.
- Opciones de despliegue: no es apto para producción. Se puede cargar con `transformers` y `peft` en Python. Para vLLM sería necesario fusionar el adaptador; para llama.cpp, convertir el modelo base más el adaptador a GGUF.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. La única referencia es el adaptador v21 del mismo autor, pero no se han proporcionado datos de rendimiento que permitan una comparación cuantitativa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación con un backdoor deliberado. No debe desplegarse en producción.
- El modelo no ha sido evaluado, por lo que su comportamiento no está verificado ni garantizado.
- El backdoor se activa solo bajo condiciones inferidas (Reino Unido + Harry Potter), pero la precisión de esa inferencia no se ha medido.
- Riesgo de alucinación no evaluado.
- Limitaciones de contexto e idioma no especificadas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para ello y su uso previsto es exclusivamente de investigación.
- El entrenamiento con quads contrafactuales puede no generalizar a tipos de tarea no vistos, como `code_review` e `incident_triage`, que se reservaron como holdout.

## Enlaces

- HuggingFace: https://huggingface.co/vidyaganga/slytherin-loyalty-organism-v22
- Perfil del autor: https://huggingface.co/vidyaganga
- Dataset asociado: https://huggingface.co/datasets/vidyaganga/loyalty-organism-data
- No se han encontrado papers, blogs o demos adicionales.
