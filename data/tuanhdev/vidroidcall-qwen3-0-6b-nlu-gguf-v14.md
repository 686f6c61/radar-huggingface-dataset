# tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v14

## Resumen

VidroidCall Qwen3 0.6B NLU GGUF v14 es un modelo de lenguaje específico para el procesamiento de lenguaje natural en vietnamita, desarrollado por el usuario tuanhdev como adaptación del modelo base Qwen/Qwen3-0.6B. Está pensado para su uso en aplicaciones Android, tal y como indica la etiqueta "android" del repositorio, y se distribuye en formato GGUF, optimizado para inferencia en dispositivos locales y entornos con recursos limitados.

El modelo cuenta con aproximadamente 596 millones de parámetros y una licencia Apache-2.0, lo que permite su uso tanto en investigación como en aplicaciones comerciales. Según la model card, esta versión v14 se considera desactualizada: el autor indica que el repositorio ha sido movido y que todas las versiones de entrenamiento se consolidan en el repositorio `tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v6`. El fichero disponible en este repositorio es `qwen3-nlu-run-014-Q4_K_M.gguf`, correspondiente a una cuantización Q4_K_M.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (formato GGUF) |
| Idiomas soportados | vietnamita (según etiquetas del repositorio); otros idiomas no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de un transformer estándar heredado de Qwen3-0.6B, sin componentes de mezcla de expertos. La información disponible no incluye detalles sobre el proceso de entrenamiento, como la composición del dataset, el número de tokens o el uso de técnicas de alineación como RLHF o DPO. El único dato técnico relevante es que se trata de un fine-tuning del modelo base Qwen3-0.6B para tareas de NLU en vietnamita, orientado a entornos Android. El repositorio indica además que todas las versiones de entrenamiento se alojan en un repositorio unificado, lo que sugiere que este modelo es una iteración concreta de un proceso de ajuste más amplio.

## Capacidades

- Procesamiento de lenguaje natural en vietnamita, según las etiquetas `nlu` y `vietnamese`.
- Integración prevista en aplicaciones Android, como indica la etiqueta `android`.
- Inferencia local mediante cuantización GGUF, apta para entornos sin conexión.
- No se ha documentado en la información proporcionada soporte para tool calling, agentes, pensamiento razonado ni capacidades multimodales.

## Casos de uso

- Asistente de llamadas en Android: el modelo puede emplearse en aplicaciones de telefonía para interpretar comandos de voz o texto en vietnamita y activar acciones como iniciar llamadas o gestionar contactos.
- Clasificación de intenciones en soporte al cliente: al ser un modelo compacto, puede integrarse en flujos de NLU para clasificar mensajes o consultas de usuarios vietnamitas dentro de una app móvil.
- Transcripción y análisis de conversaciones: gracias a su naturaleza ligera, es viable desplegarlo en dispositivos Android para procesar transcripciones de llamadas y extraer entidades o intenciones básicas.
- Automatización de respuestas rápidas: puede alimentar sistemas de autocompletado o respuesta sugerida en apps de mensajería orientadas a hablantes de vietnamita.
- Prototipado de NLU embebido: su tamaño reducido permite utilizarlo en dispositivos con recursos limitados, como terminals de punto de venta o kioscos.
- Desarrollo de asistentes offline: dado el formato GGUF, puede ejecutarse sin conexión en móviles y tablets, lo que resulta útil en entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q4_K_M, el modelo de 596M parámetros requiere aproximadamente entre 0,4 y 0,6 GB de VRAM según el runtime utilizado. Es suficiente una GPU con 1 GB de VRAM o más.
- GPU recomendadas: cualquier GPU de consumo moderna, como una RTX 3060, RTX 4060 o modelos superiores. También es compatible con iGPU y CPUs mediante cuantización.
- Compatibilidad con GPU de consumo: sí, al ser un modelo pequeño cabe en hardware modesto, incluidos móviles Android con soporte de ejecución local.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime que soporte GGUF. También se puede usar en entornos de servidor con vLLM o TGI si se convierte a otros formatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v14 | 596M | no disponible | Apache-2.0 | GGUF en Hugging Face (repositorio movido) |
| Qwen/Qwen3-0.6B (modelo base) | 596M | 32K (según documentación oficial) | Apache-2.0 | Pesos completos y cuantizaciones en Hugging Face |
| tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v6 | 596M | no disponible | Apache-2.0 | Repositorio principal, incluye múltiples versiones de entrenamiento |

Nota: los datos de contexto del modelo base corresponden a la documentación oficial de Qwen3, pero no se ha confirmado que el fine-tuning conserve la misma ventana de contexto.

## Limitaciones y advertencias

- La model card indica que el repositorio ha sido movido: esta versión v14 es antigua y el autor dirige a los usuarios a la versión v6, por lo que el mantenimiento y las actualizaciones se centran en aquel repositorio.
- No se documentaron sesgos específicos ni limitaciones de idioma más allá de la orientación al vietnamita.
- Existe riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de NLU con contexto ambiguo.
- No se han proporcionado datos sobre el dataset de entrenamiento, lo que limita la capacidad de auditar el comportamiento del modelo en producción.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican garantías ni condiciones adicionales por parte del autor.

## Enlaces

- Repositorio del modelo v14: https://huggingface.co/tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v14
- Repositorio principal de versiones de entrenamiento (v6): https://huggingface.co/tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v6
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
