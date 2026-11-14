# Turbolego/wcag-gauntlet-30b-a3b-gguf-adapter

## Resumen

El repositorio `Turbolego/wcag-gauntlet-30b-a3b-gguf-adapter` contiene un adaptador LoRA en formato GGUF (F16) entrenado sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct` para la tarea de auditoría de accesibilidad web conforme al estándar WCAG 2.2. No se trata de un modelo completo, sino de un adaptador de 218 MB que se aplica en tiempo de inferencia sobre el modelo base cuantizado, pensado para ejecutarse con Ollama o llama.cpp.

El adaptador está orientado a una "skill" concreta de uso de herramientas: detección estructurada de violaciones WCAG 2.2, clasificación de severidad y propuesta de remediaciones sobre patrones web comunes (contraste, navegación por teclado, ARIA, gestión de foco). El modelo base Qwen3-Coder-30B-A3B es un transformer MoE con 30B parámetros totales y aproximadamente 3B activos por token, especializado en código.

Es relevante para desarrolladores que quieran incorporar comprobaciones de accesibilidad dentro de pipelines de revisión de código o flujos de agente, aunque con una limitación importante: el GGUF publicado solo incluye pares LoRA de capas no-expertas (atención y MLP compartido), no los pares de expertos MoE, que constituyen la mayor parte de las 37k tensores LoRA del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (Qwen3-Coder-30B-A3B-Instruct) |
| Parametros totales | 843.841.536 (tamaño del repo de adaptador; el modelo base tiene 30B totales) |
| Parametros activos | no disponible (modelo base MoE con ~3B activos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | 262144 tokens (configurado vía `PARAMETER num_ctx` en el Modelfile de ejemplo) |
| Tipos de cuantizacion | Adaptador en F16; opción de reconstrucción a Q8_0; modelo base cuantizable (Q4_K_M ~18 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador LoRA); PEFT original disponible en Kaggle (`hummern/qwen3-coder-30b-a3b-wcag-lora-v1`) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante LoRA sobre `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un modelo MoE del que se congelan los pesos base y se añaden matrices de bajo rango. Según la model card, el GGUF publicado contiene 672 pares de tensores LoRA no-expertos (capas de atención y MLP compartido), empaquetados en F16 con un tamaño de 218 MB. Los pares LoRA correspondientes a los expertos MoE no están incluidos porque llama.cpp upstream los omite para `qwen3moe`; el autor indica que tiene planificado un pase de empaquetado 3D de expertos. Para cobertura completa de expertos, la model card remite al adaptador PEFT original en Kaggle.

Los datos de entrenamiento corresponden al dataset "WCAG Gauntlet tool-use skill", que cubre detección estructurada de violaciones WCAG 2.2, pasos de remediación y clasificación de severidad sobre patrones web comunes. No se especifican en la información proporcionada el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO adicionales sobre el adaptador.

## Capacidades

- Auditoría de accesibilidad web conforme a WCAG 2.2: detección de violaciones con cita de criterios de éxito concretos (por ejemplo, SC 1.4.3 con ratio de contraste 4.5:1).
- Clasificación de severidad de las violaciones detectadas.
- Generación de remediaciones concretas (por ejemplo, sugerir oscurecer un color a `#767676` para cumplir contraste).
- Uso de herramientas y salidas estructuradas: checklists, etiquetas de severidad y patrones de tool-use propios de la skill WCAG Gauntlet.
- Cobertura de patrones web comunes: contraste, navegación por teclado, ARIA y gestión de foco.
- Generación de código y razonamiento heredados del modelo base Qwen3-Coder (no evaluados específicamente en este adaptador).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Auditoría automatizada de accesibilidad en CI/CD: el adaptador puede aplicarse sobre el modelo base en un paso de revisión que analice fragmentos HTML o componentes antes del merge, citando criterios WCAG 2.2 concretos y generando un informe con severidades.
- Revisión de pull requests con agente: integrar el adaptador en un flujo de agente que inspeccione diffs de UI, detecte regresiones de contraste o ARIA y proponga parches concretos.
- Asistente de accesibilidad para equipos de frontend: desplegado vía Ollama, permite a desarrolladores consultar dudas sobre WCAG 2.2 y obtener remediaciones específicas sobre su código.
- Generación de checklists de cumplimiento: a partir de un componente o página, el adaptador produce listas estructuradas de verificaciones WCAG con severidad, útiles para documentación de QA.
- Formación y onboarding: usar el adaptador para explicar con ejemplos por qué un fragmento incumple WCAG y cómo corregirlo, comparando la salida con el modelo base.
- Preprocesado de triaje en pipelines de QA manual: clasificar automáticamente hallazgos de accesibilidad por severidad para priorizar la revisión humana.
- Comparación base vs adaptador: ejecutar el mismo prompt en `qwen3-coder:30b` y en el modelo con adaptador para medir la mejora en especificidad de criterios WCAG, como sugiere la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador GGUF ocupa 218 MB en F16; puede reconstruirse a Q8_0 para reducir tamaño.
- El modelo base cuantizado en Q4_K_M pesa aproximadamente 18 GB, según la model card.
- VRAM estimada: no disponible de forma explícita; para Q4_K_M del base se requiere del orden de 18 GB de memoria, más overhead de contexto (el contexto configurado de 262144 tokens incrementa significativamente el consumo de KV cache).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del base cuantizado, encajaría en GPUs consumer de gama alta con suficiente VRAM, aunque no se confirma.
- Despliegue: Ollama (con `ADAPTER` en Modelfile) y llama.cpp (`--lora` con `llama-cli`). El adaptador PEFT original requiere `peft` directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wcag-gauntlet-30b-a3b-gguf-adapter (este) | Adaptador LoRA sobre 30B MoE | 262144 (configurable) | Auditoría WCAG 2.2 vía LoRA | Apache 2.0 | Hugging Face (GGUF) + PEFT en Kaggle |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30B totales, ~3B activos | no disponible en la informacion | Código general | Apache 2.0 | Hugging Face |
| Adaptador PEFT original (`hummern/qwen3-coder-30b-a3b-wcag-lora-v1`) | Mismo base, cobertura completa de expertos | no disponible | Auditoría WCAG 2.2 | no disponible | Kaggle |

La comparativa con alternativas de accesibilidad de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El GGUF publicado solo cubre capas no-expertas (atención y MLP compartido); los pares LoRA de expertos MoE no están empaquetados, por lo que la cobertura de la skill puede ser parcial respecto al adaptador PEFT original.
- El adaptador está en F16 (~2x el tamaño de Q8); se recomienda reconstruir a Q8_0 si se busca menor footprint.
- El contexto de 262144 tokens debe configurarse manualmente (`PARAMETER num_ctx`); no es el valor por defecto.
- Riesgo de alucinación: no evaluado en la información disponible; como adaptador sobre un LLM, puede citar criterios WCAG incorrectos o inventar números de SC.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; la model card está en inglés y no declara cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del adaptador PEFT original en Kaggle antes de redistribuir.
- Para producción: validar las salidas contra una fuente autoritativa de WCAG 2.2 y no confiar únicamente en el modelo para certificar accesibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Turbolego/wcag-gauntlet-30b-a3b-gguf-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Adaptador PEFT original (Kaggle): `hummern/qwen3-coder-30b-a3b-wcag-lora-v1`
- GGUF del modelo base (referencia en la model card): `unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF`
- Especificación WCAG 2.2 (referencia externa citada por la skill): no disponible en la información proporcionada
