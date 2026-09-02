# spkc83/retail-bank-servicing-agent-9b-peft-v14-prompt-realized

## Resumen

El modelo `spkc83/retail-bank-servicing-agent-9b-peft-v14-prompt-realized` es un adaptador LoRA (Low-Rank Adaptation) en formato BF16, entrenado por el autor `spkc83` sobre el modelo base `spkc83/retail-bank-servicing-agent-9b`, un modelo de aproximadamente 8.8 mil millones de parámetros. Este adaptador está diseñado específicamente para una demostración sintética de servicio de atención al cliente en banca minorista, con soporte nativo de llamada a herramientas (tool calling) mediante un formato JSON etiquetado. El repositorio contiene únicamente los pesos del adaptador, no los pesos fusionados del modelo completo, y debe cargarse con la librería PEFT sobre el modelo base en una revisión concreta.

La relevancia de este checkpoint radica en su enfoque en un caso de uso vertical (banca minorista) con un conjunto de herramientas sintéticas, lo que permite explorar el ajuste fino de modelos de lenguaje para agentes conversacionales con funciones específicas. El entrenamiento se realizó con un dataset de alineación SFT de 3959 registros, con una longitud máxima de secuencia de 2048 tokens y 2000 pasos de optimizador. Es un proyecto de investigación y demostración, no un modelo listo para producción, y su licencia Apache 2.0 permite uso comercial con las debidas precauciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 64) sobre modelo base transformer de ~8.8B parámetros |
| Parametros totales | No disponible (el adaptador tiene parámetros propios, pero no se especifica el número; el repo pesa 0.4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máxima secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador está en BF16; no se mencionan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de bajo rango (rank 32, alpha 64) en precisión BF16, entrenado sobre el modelo base `spkc83/retail-bank-servicing-agent-9b`, que tiene aproximadamente 8.8 mil millones de parámetros. El adaptador se entrena con un dataset de alineación SFT (`spkc83/retail-bank-servicing-alignment-sft`) que contiene 3959 registros de entrenamiento y 447 de validación. El entrenamiento utiliza un manifiesto de nueve herramientas sintéticas de banca minorista, con enmascaramiento de objetivos solo para los tramos de llamada a herramienta y las respuestas finales del asistente. La longitud máxima de secuencia es de 2048 tokens y se realizaron 2000 pasos de optimizador. No se menciona el uso de RLHF o DPO; el proceso es exclusivamente de fine-tuning supervisado (SFT). El adaptador debe cargarse con `PeftModel.from_pretrained` sobre el modelo base en la revisión fijada (`1d56824995aa1adecfe20f62ca42fb1c0c443817`), y el mismo adaptador se duplica en el subdirectorio `adapter/`.

## Capacidades

- Generación de texto conversacional orientado a servicio de atención al cliente en banca minorista, con respuestas fundamentadas en resultados de herramientas.
- Soporte de tool calling / function calling mediante un formato JSON etiquetado nativo del modelo base, con nueve herramientas sintéticas definidas (consultas de saldo, transferencias, etc.).
- Capacidad de razonamiento multi-turno en conversaciones de atención al cliente, aunque el comportamiento multi-turno debe evaluarse antes de su uso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se reportan capacidades especiales adicionales (visión, audio, etc.).

## Casos de uso

- Prototipo de atención al cliente bancaria: el modelo puede gestionar conversaciones multi-turno con clientes simulados, respondiendo a consultas sobre saldos, movimientos o productos, siempre que se le proporcionen los resultados de las herramientas sintéticas.
- Demostración de agentes con tool calling: sirve como ejemplo de cómo integrar un modelo de 8.8B con un conjunto de herramientas específicas de un dominio, útil para desarrolladores que quieran estudiar el patrón de ajuste LoRA para funciones verticales.
- Evaluación de pipelines de generación aumentada por herramientas: permite probar flujos donde el modelo decide qué herramienta invocar, recibe el resultado y genera una respuesta final, sin conexión a sistemas reales.
- Investigación en alineación de modelos para dominios regulados: el checkpoint es útil para estudiar el comportamiento de modelos ajustados con datos sintéticos en sectores con requisitos de cumplimiento, como la banca.
- Desarrollo de chatbots de demostración para ferias o POCs: al ser un adaptador ligero (0.4 GB), puede desplegarse rápidamente sobre el modelo base para presentar una prueba de concepto funcional.
- Benchmarking de adaptadores LoRA en tareas de servicio al cliente: permite comparar el rendimiento de diferentes revisiones del adaptador (v14 frente a v9, etc.) en métricas de precisión de llamada a herramientas y coherencia conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.4 GB), pero requiere cargar el modelo base de ~8.8B parámetros, lo que implica una VRAM significativa.
- Para inferencia en FP16/BF16, se estima una VRAM mínima de 16-20 GB (por ejemplo, una GPU como RTX 4090 o A100 de 40 GB). No se dispone de datos oficiales de consumo.
- Con cuantización del modelo base (por ejemplo, 4 bits), podría caber en GPUs de 8-12 GB, pero no se proporcionan configuraciones específicas.
- Opciones de despliegue: el adaptador se carga con la librería PEFT sobre el modelo base usando `transformers`; también puede integrarse en frameworks como vLLM o TGI si se fusionan los pesos, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, dado que se trata de un adaptador específico para un dominio sintético y no se reportan métricas de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint de investigación para una demostración sintética; no está diseñado para producción real ni para interactuar con sistemas bancarios reales.
- El modelo no tiene acceso a datos bancarios reales y puede generar afirmaciones no respaldadas o seleccionar herramientas incorrectas.
- No constituye asesoramiento financiero bajo ninguna circunstancia.
- Requiere evaluación exhaustiva de la sintaxis de llamada a herramientas, los argumentos, la ejecución del backend, las respuestas finales fundamentadas, el comportamiento fuera de distribución (OOD) y el comportamiento multi-turno antes de cualquier uso.
- La licencia Apache 2.0 permite uso comercial, pero las limitaciones funcionales del modelo lo hacen inadecuado para aplicaciones críticas sin un desarrollo adicional.
- No se especifican idiomas soportados; se asume que el entrenamiento se realizó con datos en inglés, pero no está confirmado.

## Enlaces

- [HuggingFace - spkc83/retail-bank-servicing-agent-9b-peft-v14-prompt-realized](https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v14-prompt-realized)
- [HuggingFace - spkc83/retail-bank-servicing-agent-9b-peft (versión anterior)](https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft)
- [HuggingFace - spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch](https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch)
- [GitHub - spkc83/retail-bank-servicing](https://github.com/spkc83/retail-bank-servicing)
- [GitHub - spkc83/retail-bank-model-development](https://github.com/spkc83/retail-bank-model-development)
