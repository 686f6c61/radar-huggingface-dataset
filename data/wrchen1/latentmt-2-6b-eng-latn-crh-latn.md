# wrchen1/LatentMT-2.6B-eng-latn-crh-latn

## Resumen

LatentMT-2.6B-eng-latn-crh-latn es un adaptador LoRA publicado por wrchen1 para el modelo base ByteDance/Ouro-2.6B-Thinking, especializado en traducción automática del inglés (eng_Latn) al tártaro de Crimea en escritura latina (crh_Latn). Forma parte del trabajo de investigación LatentMT: Machine Translation with Latent Reasoning, que introduce un enfoque de razonamiento latente en el que los pasos recurrentes adicionales se ejecutan dentro de los estados ocultos del modelo, en lugar de generar tokens de cadena de pensamiento explícitos. Este diseño permite obtener mejoras de calidad de traducción sin aumentar la longitud de la salida generada.

El adaptador está pensado para su uso con la librería PEFT y se distribuye bajo licencia Apache 2.0. El modelo base, Ouro-2.6B-Thinking, es un modelo de 2.600 millones de parámetros desarrollado por ByteDance, aunque no se proporcionan detalles adicionales sobre su arquitectura interna en la documentación disponible. El adaptador añade una profundidad recurrente de 4 pasos, lo que permite al modelo razonar internamente antes de producir la traducción final.

La relevancia de este modelo radica en su enfoque eficiente: con un backbone de solo 2.6B parámetros y un entrenamiento ligero, LatentMT logra resultados comparables a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, según el paper asociado. Esto lo convierte en una opción interesante para investigación en traducción automática de recursos limitados y para escenarios donde se requiere bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre ByteDance/Ouro-2.6B-Thinking (modelo base de 2.6B parámetros) |
| Parametros totales | No disponible (el adaptador LoRA es de tamaño reducido; el modelo base tiene 2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede admitir cuantizaciones, pero no se especifican) |
| Idiomas soportados | Inglés (eng_Latn) a tártaro de Crimea en latín (crh_Latn) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking. El paper LatentMT describe un enfoque de razonamiento latente en el que se añaden pasos recurrentes internos (profundidad recurrente 4) dentro de los estados ocultos del transformer, sin generar tokens de razonamiento visibles. Esto permite que el modelo realice cómputo adicional antes de emitir la traducción, mejorando la calidad sin aumentar la longitud de la secuencia de salida.

El entrenamiento se realizó con un coste ligero, adaptando el backbone de 2.6B parámetros mediante LoRA. No se especifican en la documentación disponible los datos de entrenamiento (número de tokens, composición del dataset, si se usó RLHF o DPO). El paper menciona que el método se evaluó en 32 direcciones de traducción que cubren idiomas de alta, media y baja disponibilidad de recursos, logrando un rendimiento comparable a modelos de 3 a 5 veces más grandes.

## Capacidades

- Traducción automática del inglés al tártaro de Crimea (escritura latina), con razonamiento latente interno.
- Generación de texto condicionada por instrucciones de traducción (pipeline text-generation).
- Soporte para inferencia con el adaptador LoRA mediante PEFT y Transformers.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio.
- El razonamiento latente permite mejorar la calidad de traducción sin generar tokens de cadena de pensamiento explícitos, lo que reduce la latencia de salida.

## Casos de uso

- Traducción de documentos técnicos y científicos del inglés al tártaro de Crimea: el modelo puede procesar textos largos con contexto limitado, aunque la longitud de contexto no está especificada, y produce traducciones fluidas gracias al razonamiento latente.
- Investigación en traducción automática de bajo recurso: sirve como punto de partida para estudiar el impacto del razonamiento latente en pares de idiomas con pocos datos, ya que el adaptador es ligero y fácil de integrar.
- Prototipado de sistemas de traducción en entornos con recursos computacionales limitados: al ser un adaptador sobre un modelo de 2.6B, puede ejecutarse en GPUs de consumo medio, permitiendo pruebas rápidas.
- Evaluación comparativa de métodos de razonamiento latente frente a cadenas de pensamiento explícitas: el modelo permite reproducir los experimentos del paper y comparar métricas de calidad y latencia.
- Integración en pipelines de traducción automática neuronal para lenguas minoritarias: el tártaro de Crimea es una lengua de baja disponibilidad de recursos, y este adaptador ofrece una opción funcional para su traducción desde inglés.
- Generación de subtítulos o contenido localizado: el modelo puede traducir frases cortas o párrafos de guiones, aunque no se ha validado específicamente para este uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el par eng_Latn-crh_Latn en la información disponible. El paper LatentMT reporta que el método alcanza un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción, pero no se proporcionan cifras concretas (BLEU, COMET, etc.) en la documentación del adaptador. Se recomienda consultar el paper original para obtener métricas detalladas.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0.1 GB), pero el modelo base Ouro-2.6B-Thinking requiere recursos de inferencia.
- VRAM estimada: en FP16, el modelo base ocupa aproximadamente 5.2 GB, más overhead de activaciones y el adaptador. Con cuantización de 4 bits (por ejemplo, bitsandbytes), podría caber en GPUs con 4-6 GB de VRAM.
- GPUs recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 (RTX 3070, RTX 4060 Ti, A10, etc.). Para cuantización 4-bit, GPUs de 6 GB (RTX 2060, RTX 3050) podrían ser suficientes.
- Opciones de despliegue: el modelo se carga con Transformers y PEFT, por lo que puede usarse con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan instrucciones específicas para estos entornos.
- Latencia y throughput: no disponibles. El razonamiento latente añade 4 pasos recurrentes internos, lo que puede incrementar ligeramente la latencia en comparación con un modelo sin esta característica, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente para el par inglés-tártaro de Crimea. En el ámbito de traducción automática con razonamiento latente, el propio LatentMT es el único sistema documentado en la información proporcionada. Alternativas generales de traducción automática neuronal (como NLLB-200 de Meta o modelos multilingües de Google) podrían cubrir este par de idiomas, pero no se han comparado directamente en los datos disponibles.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente para el par eng_Latn-crh_Latn; no es un modelo multilingüe general y no debe usarse para otros idiomas sin reentrenamiento.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos de traducción, puede reflejar sesgos presentes en los corpus de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido, especialmente en contextos ambiguos o con poco soporte en los datos.
- La longitud de contexto no está documentada, por lo que no se recomienda su uso con textos muy largos sin validación previa.
- El modelo es un adaptador de investigación; no se ha validado para producción comercial. Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Ouro-2.6B-Thinking también está bajo Apache 2.0, pero se debe verificar la licencia del modelo base en su repositorio.
- El razonamiento latente puede aumentar la latencia de inferencia, lo que debe tenerse en cuenta en aplicaciones en tiempo real.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-crh-latn
- Paper LatentMT: https://arxiv.org/pdf/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio similar para otro par de idiomas (silesio): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-szl-latn
