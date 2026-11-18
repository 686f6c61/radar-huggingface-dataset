# xl-24/gemma4-12b-atc-finetune-32-64

## Resumen

`xl-24/gemma4-12b-atc-finetune-32-64` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-12B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de generación de texto derivado de la familia Gemma 4 de Google, con 12.000 millones de parámetros nominales según el identificador, entrenado mediante las librerías Unsloth y TRL sobre la arquitectura `gemma4_unified`. El repositorio se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para el idioma inglés.

La información disponible es muy limitada: la model card es la plantilla automática que genera Unsloth al subir un modelo ajustado, sin datos sobre el dataset de entrenamiento, hiperparámetros, número de tokens vistos ni resultados de evaluación. El sufijo del nombre (`atc-finetune-32-64`) sugiere un ajuste orientado a control de tráfico aéreo (ATC, *air traffic control*) con configuraciones de rango LoRA 32 y 64, pero esto es una inferencia a partir del nombre y no está confirmado en la documentación del autor.

El modelo es relevante únicamente como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre Gemma 4, no como un artefacto listo para producción: no tiene descargas, no tiene valoraciones y no aporta documentación técnica verificable. Cualquier evaluación rigurosa requiere consultar el modelo base y reproducir el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer decoder-only, familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 12 000 millones (según identificador del modelo; no confirmado en model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB, compatible con transformers y TGI) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `unsloth/gemma-4-12B-it`, etiquetada como `gemma4_unified` en el ecosistema de Unsloth. No se dispone de información pública en esta ficha sobre el número de capas, dimensión oculta, mecanismo de atención (global/local, RoPE, etc.) ni sobre el tokenizador. El tamaño del repositorio (0,6 GB) es llamativamente inferior al que correspondería a un modelo denso de 12 000 millones de parámetros en precisión completa (que rondaría los 24 GB en bf16), lo que sugiere que el repositorio contiene únicamente los adaptadores LoRA o una versión parcial de los pesos, aunque esto no se especifica en la model card.

El entrenamiento se realizó con Unsloth y TRL, según las etiquetas del repositorio. No se documentan el dataset, el número de tokens de entrenamiento, la composición de los datos, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se indican hiperparámetros (rango LoRA, alpha, learning rate, épocas) más allá de lo que sugiere el nombre del modelo. No hay información sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4 12B instruct.
- Razonamiento y respuesta a instrucciones, en la medida en que el ajuste fino no las haya degradado (no verificado).
- Posible especialización en dominio de control de tráfico aéreo (ATC) según el nombre del modelo, sin confirmación documental.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- **Prototipado de asistentes de dominio ATC**: si el ajuste efectivamente se orientó a control de tráfico aéreo, podría emplearse para generar borradores de instrucciones o resúmenes de procedimientos, siempre con validación humana y sin uso operacional.
- **Experimentos de ajuste fino con Unsloth**: sirve como referencia de pipeline (Unsloth + TRL + transformers) para reproducir el flujo sobre Gemma 4 12B en entornos con recursos limitados.
- **Evaluación comparativa de adaptadores LoRA**: útil para estudiar cómo un ajuste de bajo rango afecta a las capacidades del base en tareas de instrucción en inglés.
- **Generación de texto técnico en inglés**: resúmenes, paráfrasis o respuestas a preguntas sobre documentación especializada, con revisión posterior.
- **Base para nuevos ajustes**: punto de partida para fine-tunings posteriores con datasets propios, dado que la licencia Apache 2.0 facilita la derivación.
- **Pruebas de despliegue con TGI**: el repositorio está etiquetado para `text-generation-inference`, por lo que puede usarse para validar infraestructura de serving antes de pasar a modelos con documentación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo denso de 12 000 millones de parámetros se necesitarían aproximadamente 24 GB en bf16/fp16, 12-14 GB en cuantización de 8 bits y 7-8 GB en 4 bits, aunque estas cifras son estimaciones generales y no están confirmadas para este modelo.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, serían adecuadas A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantización de 4 bits en GPUs con 8-12 GB, pero no hay confirmación ni pesos cuantizados publicados.
- Opciones de despliegue: transformers y text-generation-inference (según etiquetas); vLLM, llama.cpp u Ollama no están confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `xl-24/gemma4-12b-atc-finetune-32-64` | 12 000 M (según ID) | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino sin documentación técnica |
| `unsloth/gemma-4-12B-it` (base) | 12 000 M | no disponible en esta ficha | según modelo base | Hugging Face | Modelo instruct oficial de referencia |
| Gemma 4 12B (Google) | 12 000 M | no disponible en esta ficha | Gemma license (no confirmada) | Hugging Face / Kaggle | Modelo original de Google |
| Mistral 12B / alternativas de tamaño similar | ~12 000 M | variable | Apache 2.0 en algunas variantes | Hugging Face | Alternativa de código abierto comparable en tamaño |

La comparación cuantitativa no es posible: no hay benchmarks publicados para este ajuste ni datos de contexto del base en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación sobre dataset, hiperparámetros y evaluación: no es posible verificar la calidad ni la especialización real del modelo.
- Riesgo elevado de alucinación y de degradación de capacidades del base por sobreajuste al dataset de ajuste, sin métricas que lo descarten.
- Idioma limitado al inglés según la etiqueta del repositorio; no se garantiza un comportamiento correcto en castellano.
- El tamaño del repositorio (0,6 GB) no concuerda con un modelo completo de 12 000 M en bf16, lo que sugiere que puede contener solo adaptadores o pesos parciales; verificar antes de usarlo.
- Posible uso en dominio crítico (ATC) sin validación: no debe emplearse en entornos operacionales ni de seguridad crítica.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma puede tener condiciones adicionales; conviene revisar la licencia del base antes de uso comercial.
- Sin descargas ni valoraciones: no hay evidencia de la comunidad sobre su funcionamiento.
- No se documentan sesgos conocidos; al no haber evaluación, deben asumirse los sesgos del base y del dataset de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-12b-atc-finetune-32-64
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
