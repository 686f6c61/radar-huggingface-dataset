# tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v6

## Resumen

ViDroidCall NLU es un modelo de comprensión del lenguaje natural (NLU) en vietnamita, desarrollado por tuanhdev como fine-tune del modelo base Qwen/Qwen3-0.6B de Alibaba. El modelo está diseñado para ejecutarse on-device en dispositivos Android, integrado en la aplicación ViDroidCall Studio, y se distribuye en formato GGUF con cuantización Q4_K_M, lo que reduce el tamaño del archivo a aproximadamente 397 MB. Con 596.049.920 parámetros (0,6B), el modelo ofrece una solución ligera para tareas de NLU en vietnamita sin depender de servidores externos. Su licencia Apache-2.0 permite uso comercial y modificación, lo que lo hace atractivo para desarrolladores que buscan una alternativa eficiente para aplicaciones móviles. La versión publicada (run-006) es una release de demostración o concurso, con cero descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (archivo único GGUF) |
| Idiomas soportados | Vietnamita (objetivo del fine-tune); no se especifican otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen3-0.6B, que pertenece a la familia Qwen3 de Alibaba. La información proporcionada no incluye detalles sobre el dataset de entrenamiento, el número de tokens procesados ni la aplicación de técnicas como RLHF o DPO, por lo que estos datos no están disponibles. La innovación técnica destacable es la exportación a formato GGUF con cuantización Q4_K_M, que permite la inferencia en dispositivos Android con recursos limitados. Además, la aplicación ViDroidCall Studio incorpora un "Fast-Path" que funciona incluso sin el fichero del modelo, lo que sugiere un diseño híbrido para tolerar la ausencia del modelo.

## Capacidades

- Comprensión del lenguaje natural (NLU) en vietnamita: el modelo está afinado para interpretar intenciones y entidades en este idioma.
- Ejecución on-device en Android: el archivo GGUF Q4_K_M puede cargarse directamente en la aplicación mediante `adb push`.
- Integración con ViDroidCall Studio: diseñado para funcionar dentro de esta aplicación, con un modo "Fast-Path" que no requiere el fichero.
- Sin soporte documentado de tool calling, function calling, agentes, visión o audio: la información proporcionada no menciona estas capacidades.

## Casos de uso

- Asistente de llamadas en vietnamita: el modelo puede interpretar comandos del usuario durante una llamada (por ejemplo, "llamar a X" o "enviar mensaje a Y") y ejecutar acciones en la aplicación, gracias a su NLU especializado y su ejecución local.
- Clasificación de intenciones en aplicaciones móviles: se puede integrar en apps Android para clasificar la intención del usuario (soporte, compra, información) sin conexión, lo que reduce la latencia y los costes de servidor.
- Extracción de entidades en texto vietnamita: identifica nombres, fechas y números de teléfono en transcripciones de llamadas o mensajes, útil para automatizar el registro de datos.
- Respuesta automática en atención al cliente: en entornos sin servidor, el modelo puede generar respuestas básicas o derivar la conversación a un agente humano, aprovechando su pequeño tamaño para ejecutarse en el dispositivo.
- Asistente offline para zonas sin cobertura: al no requerir conexión a internet, es adecuado para aplicaciones en áreas rurales o con conectividad limitada.
- Accesibilidad: asistente de voz offline en vietnamita para controlar el teléfono, lo que mejora la accesibilidad para personas con discapacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con la cuantización Q4_K_M (~397 MB), la inferencia en GPU requiere aproximadamente 0,5-1 GB de VRAM; en CPU, alrededor de 500 MB de RAM.
- GPU recomendadas: no se requiere GPU dedicada; puede ejecutarse en CPUs modernas o en la GPU integrada de dispositivos móviles.
- Compatibilidad con consumer GPU: sí, cualquier GPU con al menos 1 GB de VRAM puede alojar el modelo.
- Opciones de despliegue: llama.cpp, Ollama, o integración directa en aplicaciones Android que carguen GGUF (como ViDroidCall Studio). El tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v6 | 596.049.920 | No disponible | Apache-2.0 | HuggingFace (GGUF) |
| Qwen/Qwen3-0.6B | 596.049.920 | No disponible | Apache-2.0 | HuggingFace (original) |
| unsloth/Qwen3-0.6B-GGUF | 596.049.920 | No disponible | Apache-2.0 | HuggingFace (GGUF) |

Nota: los tres modelos comparten la misma arquitectura y número de parámetros; la diferencia está en el fine-tune para NLU vietnamita y en la cuantización específica.

## Limitaciones y advertencias

- Sesgos: no se han realizado evaluaciones de sesgo en la información disponible, por lo que el riesgo no está documentado.
- Alucinación: al ser un modelo pequeño (0,6B), el riesgo de alucinación es mayor que en modelos de mayor tamaño.
- Limitaciones de idioma: el fine-tune está orientado al vietnamita; el rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero requiere mantener el aviso de licencia y atribución.
- Caveat para producción: es una versión "demo/contest release" (run-006) con 0 descargas en el momento de la consulta, lo que indica una validación externa limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuanhdev/vidroidcall-qwen3-0.6B-nlu-gguf-v6
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Cuantización del modelo base (unsloth): https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
- Repositorio de la aplicación ViDroidCall Studio: https://github.com/tuanhdevvn/ViDroidCall-Studio
