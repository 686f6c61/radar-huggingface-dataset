# Synth-NLP/kev-9b-massive-pt-br-A

## Resumen

Kev-9B massive pt-br-A es un ajuste delta mediante LoRA y una cabeza de puntero (pointer head) sobre el modelo base `jaredpalmer/kev-9b`, orientado a la clasificación de intenciones en portugués de Brasil. Lo publica el colectivo Synth-NLP como parte de un experimento comparativo que enfrenta datos sintéticos generados por una pipeline agéntica con datos reales, evaluando el efecto en modelos de decisión de distintos tamaños (Laya, Kev-0.8B, Kev-4B y Kev-9B). El modelo no es un generador de texto generalista: es un modelo de decisión que, dada una frase, elige una intención entre 20 opciones posibles.

El ajuste se realiza sobre las 5.405 frases reales del conjunto MASSIVE pt-BR, cubriendo 30 intenciones vistas durante el entrenamiento. La evaluación sobre la validación de MASSIVE pt-BR con 20 opciones y media de tres sorteos reporta una precisión de 0,925 en intenciones vistas y 0,856 en intenciones no vistas (escenarios reservados que nunca aparecieron en el entrenamiento). El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con los pesos completos de un modelo de 9B.

La relevancia de esta ficha es doble: por un lado documenta un caso concreto de ajuste paramétricamente eficiente para una tarea de clasificación cerrada con opciones múltiples; por otro, forma parte de un estudio metodológico sobre la calidad de datos sintéticos frente a datos reales en modelos de decisión. La licencia Apache 2.0 facilita su reutilización, aunque el tamaño reducido del repositorio y la ausencia de métricas de benchmarks estándar limitan las conclusiones que pueden extraerse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `jaredpalmer/kev-9b`; el ajuste es LoRA + pointer head) |
| Parametros totales | no disponible (el repositorio contiene un adaptador delta de 0,2 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (pt, variante pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste delta sobre `jaredpalmer/kev-9b` que combina LoRA con una cabeza de puntero para seleccionar una intención entre 20 candidatas. La base se mantiene congelada en bf16 y solo se entrenan los adaptadores y la cabeza de decisión. El entrenamiento se lanza con `python -m kev.train --init_from jaredpalmer/kev-9b`, con tasa de aprendizaje 2e-5, dos épocas, tamaño de lote 8, precisión bf16 y semilla 0. Se desactivan los aumentos propios de Kev: no se añade la opción "ninguna de las anteriores" ni distractores adicionales.

Los datos de entrenamiento son las 5.405 frases reales del split de entrenamiento de MASSIVE pt-BR, con 30 intenciones vistas. Este brazo A se contrasta con otros brazos del experimento que emplean datos sintéticos generados por una pipeline agéntica. La evaluación se realiza sobre la validación de MASSIVE pt-BR con 20 opciones por frase y promediando tres sorteos, distinguiendo entre intenciones vistas en entrenamiento y escenarios reservados no vistos. Las predicciones se almacenan en `results/`. No se documentan en la información disponible detalles sobre la composición completa del dataset, el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Clasificación de intenciones en portugués de Brasil sobre un conjunto cerrado de 20 opciones por frase.
- Selección de la intención correcta entre candidatas mediante cabeza de puntero, no mediante generación autoregresiva libre.
- Generalización a intenciones no vistas durante el entrenamiento (0,856 de precisión en escenarios reservados).
- Servicio mediante API System One con `uv run --extra serve python -m kev.serve --run <repo>`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.
- Capacidad multilingüe limitada al portugués según la model card.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dada una frase de un usuario en portugués, el modelo selecciona una de las 20 intenciones candidatas para dirigir la conversación al flujo o departamento adecuado. Es adecuado porque la tarea es exactamente la de clasificación cerrada que se ha entrenado.
- Clasificación de comandos en asistentes de voz: las transcripciones en pt-BR se mapean a intenciones predefinidas antes de invocar la lógica de negocio, con la ventaja de que el modelo maneja escenarios no vistos en entrenamiento.
- Etiquetado semiautomático de corpus: el modelo puede preanotar frases con intenciones de MASSIVE pt-BR para revisión humana posterior, acelerando la construcción de datasets en portugués.
- Investigación sobre datos sintéticos: sirve como brazo de control con datos reales frente a los brazos con datos generados por pipeline agéntica, permitiendo medir el impacto de la síntesis en la precisión de decisión.
- Evaluación de adaptadores LoRA en producción: al ser un delta de 0,2 GB sobre una base congelada, permite probar variantes de ajuste sin duplicar el almacenamiento del modelo completo.
- Integración en pipelines de CI/CD para pruebas de regresión de clasificadores: el comando de servicio y la estructura de `results/` facilitan la comparación automática de predicciones entre versiones del adaptador.
- Prototipado rápido de clasificadores de intención en pt-BR: el bajo coste de almacenamiento del adaptador permite desplegar variantes por dominio sin reentrenar la base.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la validación de MASSIVE pt-BR con 20 opciones y media de tres sorteos:

| Métrica | Resultado |
|---|---|
| Precisión en intenciones vistas | 0,925 |
| Precisión en intenciones no vistas (escenarios reservados) | 0,856 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio contiene solo el adaptador delta (0,2 GB); el consumo real depende de cargar la base `jaredpalmer/kev-9b` completa, cuyos requisitos no se documentan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor documenta el servidor propio `kev.serve` mediante `uv run --extra serve python -m kev.serve --run <repo>`, que expone una API System One. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-9B massive pt-br-A | no disponible (adaptador de 0,2 GB sobre base 9B) | no disponible | Clasificación de intención pt-BR (20 opciones) | Apache 2.0 | Hugging Face |
| Kev-0.8B (brazo del mismo experimento) | 0,8B (según denominación) | no disponible | Clasificación de intención pt-BR | no disponible | Mencionado en la model card |
| Kev-4B (brazo del mismo experimento) | 4B (según denominación) | no disponible | Clasificación de intención pt-BR | no disponible | Mencionado en la model card |
| Laya (brazo del mismo experimento) | no disponible | no disponible | Clasificación de intención pt-BR | no disponible | Mencionado en la model card |

No se dispone de datos de benchmarks comparativos entre estos brazos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (clasificación de intención con 20 opciones) y no debe emplearse como generador de texto general.
- El idioma soportado es únicamente portugués de Brasil; no se documenta cobertura de otras variantes del portugués ni de otros idiomas.
- La evaluación se limita a la validación de MASSIVE pt-BR; no hay evidencia de generalización a dominios externos a ese corpus.
- El repositorio contiene solo el adaptador delta; es imprescindible disponer de la base `jaredpalmer/kev-9b` para la inferencia, y sus requisitos de hardware no están documentados.
- No se documentan sesgos conocidos, pero al entrenarse sobre MASSIVE pt-BR hereda las limitaciones de cobertura y anotación de dicho corpus.
- Riesgo de alucinación: no aplica en el mismo sentido que en modelos generativos, pero la cabeza de puntero puede seleccionar una intención incorrecta cuando la frase es ambigua o cae fuera de las 30 intenciones vistas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia de la base `jaredpalmer/kev-9b` antes de desplegar en producción.
- El modelo se publicó el 15 de noviembre de 2026 y no registra descargas ni valoraciones, por lo que carece de validación externa por parte de la comunidad.
- No se documentan mecanismos de calibración de confianza ni umbrales de rechazo, lo que dificulta su uso en producción sin capas adicionales de verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-9b-massive-pt-br-A
- Modelo base: https://huggingface.co/jaredpalmer/kev-9b
- Corpus MASSIVE pt-BR: no disponible en la información proporcionada
- Paper o blog del experimento: no disponible en la información proporcionada
- Repositorio de código del pipeline `kev`: no disponible en la información proporcionada
