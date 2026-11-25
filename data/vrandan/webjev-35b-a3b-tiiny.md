# Vrandan/WebJev-35B-A3B-tiiny

## Resumen

WebJev-35B-A3B-tiiny es un reempaquetado del fine-tune WebJev-35B-A3B (publicado originalmente por Lexmount bajo licencia Apache-2.0), que a su vez deriva de Qwen/Qwen3.5-35B-A3B-Base. El autor de esta copia, Vrandan, ha fusionado los pesos por experto del MoE original en el layout del checkpoint Qwen3.6-35B-A3B y ha añadido la torre de visión y la cabeza MTP de dicho modelo, con el objetivo de que un dispositivo TiinyOS pueda importarlo. Los tensores de WebJev se mantienen sin cambios byte a byte.

El modelo es un transformer disperso de tipo mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y una pipeline declarada de image-text-to-text, lo que implica capacidades multimodales de entrada imagen-texto. El repositorio ocupa 71,9 GB en formato safetensors.

Se trata de una copia temporal y de uso muy restringido: no registra descargas ni interacciones, no declara idiomas soportados y su relevancia es fundamentalmente operativa (compatibilidad con TiinyOS) más que como modelo de referencia para producción. Para cualquier evaluación seria conviene acudir al checkpoint original de Lexmount.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con torre de visión y cabeza MTP heredadas de Qwen3.6-35B-A3B |
| Parámetros totales | 35.951.822.704 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos, identificado por el tag `qwen3_5_moe` y derivado de la familia Qwen3.5. El reempaquetado fusiona los pesos por experto del MoE de WebJev en el layout del checkpoint Qwen3.6-35B-A3B, e incorpora la torre de visión y la cabeza MTP (multi-token prediction) de ese modelo para habilitar la importación en dispositivos TiinyOS. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el fine-tune original.

El dato técnico más relevante es que los tensores de WebJev se conservan sin alteración byte a byte; el trabajo del autor es exclusivamente de reempaquetado y compatibilidad de formato, no de entrenamiento adicional. No se documentan innovaciones como decodificación especulativa o atención lineal más allá de lo que aporte la arquitectura base de Qwen, sobre la que esta ficha no tiene información verificada.

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Entrada multimodal imagen-texto, según la pipeline `image-text-to-text` y la torre de visión incorporada.
- Razonamiento y generación de código: no disponible de forma explícita en la información proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en dispositivos TiinyOS: el propósito declarado del reempaquetado es permitir que un dispositivo TiinyOS importe el modelo; se usaría como checkpoint listo para cargar en ese entorno concreto.
- Evaluación de fine-tunes sobre Qwen3.5: sirve como punto de partida para probar el comportamiento del fine-tune WebJev en tareas de conversación multimodal, aunque para ello es preferible el checkpoint original de Lexmount.
- Procesamiento de documentos con imagen y texto: la pipeline image-text-to-text permite alimentar capturas, diagramas o páginas escaneadas junto a instrucciones textuales, siempre que se valide el comportamiento real del modelo.
- Prototipado de asistentes conversacionales multimodales: el tag `conversational` y la entrada de imagen habilitan experimentos de diálogo con soporte visual en entornos de laboratorio.
- Investigación sobre reempaquetado de MoE: el repositorio documenta la fusión de pesos por experto en un layout distinto, lo que lo convierte en una referencia para estudiar técnicas de conversión de checkpoints.
- Pruebas de compatibilidad de formatos: útil para verificar pipelines de carga de safetensors entre arquitecturas Qwen3.5 y Qwen3.6.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 35.951.822.704 parámetros totales, en precisión de 16 bits los pesos ocuparían aproximadamente 72 GB, coherente con el tamaño del repositorio (71,9 GB); en cuantizaciones de 8 y 4 bits el requisito bajaría aproximadamente a 36 GB y 18 GB respectivamente, aunque no se han publicado ficheros GGUF ni cuantizaciones verificadas.
- GPU recomendadas: no disponible. Por volumen de pesos en 16 bits, serían necesarias configuraciones multi-GPU de clase A100 o H100; no hay datos publicados que lo confirmen.
- ¿Cabe en GPU de consumo? No hay información que lo confirme. En 16 bits no cabría en una RTX 4090 (24 GB); solo con cuantización agresiva podría plantearse, sin datos verificados.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato safetensors con layout modificado puede requerir herramientas específicas de TiinyOS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WebJev-35B-A3B-tiiny (este) | 35.951.822.704 | no disponible | Apache-2.0 | Hugging Face, copia temporal |
| Lexmount/WebJev-35B-A3B | no disponible | no disponible | Apache-2.0 | Hugging Face (original) |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | Hugging Face (modelo base del layout) |
| Qwen/Qwen3.5-35B-A3B-Base | no disponible | no disponible | no disponible | Hugging Face (base del fine-tune) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Copia temporal: el propio autor la describe como temporal y remite al checkpoint original de Lexmount, que debería ser la referencia para uso real.
- Sin validación de la comunidad: cero descargas y cero likes en el momento de la consulta, sin evidencia de pruebas independientes.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Contexto desconocido: no se documenta la longitud de ventana, lo que impide planificar cargas de contexto largo.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluaciones publicadas que lo cuantifiquen para este fine-tune.
- Sesgos: no documentados.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero el reempaquetado incorpora componentes de Qwen3.6-35B-A3B (torre de visión y cabeza MTP) cuyos términos deben verificarse por separado.
- Compatibilidad limitada: el layout modificado y la orientación a TiinyOS pueden dificultar el despliegue con herramientas estándar; conviene validar la carga antes de integrarlo en producción.
- Sin cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ disponibles, lo que complica el despliegue en hardware modesto.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Vrandan/WebJev-35B-A3B-tiiny
- Modelo original: https://huggingface.co/Lexmount/WebJev-35B-A3B
- Modelo base del fine-tune: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Modelo base del layout: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
