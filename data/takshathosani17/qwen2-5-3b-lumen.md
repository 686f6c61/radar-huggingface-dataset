# takshathosani17/qwen2.5-3b-lumen

## Resumen

qwen2.5-3b-lumen es un modelo de lenguaje de dominio específico creado por takshathosani17 como parte del proyecto Lumen Stream Lab. Se trata de un fine-tuning del modelo Qwen/Qwen2.5-3B-Instruct, orientado a resolver preguntas relacionadas con Lumen, Soup y enrutamiento dentro de un sistema híbrido que distribuye las consultas entre distintos modelos según su dominio. El objetivo es mejorar el rendimiento en estas tareas concretas frente al uso de un modelo genérico de 3B, manteniendo una inferencia rápida incluso en GPUs de gama baja. Con 3.085.938.688 parámetros y cuantización GGUF en formato q4_k_m, el modelo está pensado para ser desplegado con Ollama o cualquier motor compatible con GGUF. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) |
| Parametros totales | 3.085.938.688 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (q4_k_m) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado q4_k_m) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura Qwen2.5-3B-Instruct, un transformer decoder-only. El autor ha realizado un fine-tuning de dominio denominado "S07 domain fine-tune" utilizando la configuración de entrenamiento `soup-3b-stream-s07.yaml` del repositorio Lumen Stream Lab. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. El objetivo del entrenamiento es especializar el modelo en consultas relacionadas con Lumen, Soup y enrutamiento, para ser usado como "domain tier" en un enrutador híbrido. El modelo se distribuye en cuantización GGUF q4_k_m.

## Capacidades

- Generación de texto especializada en el dominio de Lumen, Soup y enrutamiento, como parte del sistema Lumen Stream Lab.
- Inferencia local eficiente: alcanza ~56 tok/s en una GTX 1650 4GB.
- Compatible con Ollama y otros motores que soporten GGUF.
- Se integra en un enrutador híbrido que decide cuándo usar este modelo en lugar de uno genérico.
- No se especifican capacidades de tool calling, visión, audio ni soporte multilingüe adicional.
- Puede servir como modelo base para experimentos de enrutamiento de modelos (model routing).

## Casos de uso

- Enrutamiento híbrido en Lumen Stream Lab: el modelo actúa como "domain tier" que responde preguntas de Lumen/Soup/routing cuando el router detecta ese dominio, mejorando la calidad frente a un 3B genérico.
- Asistente de desarrollo para el proyecto Lumen: puede responder preguntas sobre el código, configuración o uso de Soup dentro del repositorio.
- Despliegue en entornos con GPU de 4GB: gracias a la cuantización GGUF y su bajo consumo de VRAM, es viable en tarjetas como GTX 1650 o similares.
- Evaluación de arquitecturas de enrutamiento de modelos: los datos de rendimiento de orquestación (68.10 vs 48.38) permiten comparar estrategias híbridas frente al uso exclusivo de un modelo de 3B.
- Chatbot de soporte técnico para herramientas de streaming: dado que Lumen Stream Lab parece estar relacionado con streaming, el modelo podría responder consultas específicas del dominio.
- Investigación en fine-tuning de dominio: sirve como ejemplo de cómo especializar un modelo pequeño para un nicho técnico y desplegarlo con Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El README del modelo reporta métricas de rendimiento de inferencia en una GTX 1650 4GB:

| Métrica | Valor |
|---|---|
| Velocidad en dominio (domain tok/s) | ~56 tok/s |
| Media de orquestación híbrida | 68.10 |
| Media usando siempre el modelo de 3B | 48.38 |
| Mejora relativa | +40.8% |

Estas métricas no son benchmarks de calidad, sino de rendimiento de la orquestación en el laboratorio de referencia.

## Requisitos de hardware

- VRAM estimada: 4 GB son suficientes para la cuantización q4_k_m (el modelo pesa ~1.9 GB en el repo).
- GPU recomendada: GTX 1650 4GB como referencia; cualquier GPU con al menos 4GB de VRAM.
- Compatible con consumer GPUs: sí, es un modelo pequeño que cabe en tarjetas de gama baja.
- Opciones de despliegue: Ollama (con Modelfile), llama.cpp y otros motores que acepten GGUF.
- Latencia/throughput: ~56 tok/s en GTX 1650 4GB para consultas de dominio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-3b-lumen | 3.09B | no disponible | Apache 2.0 | HuggingFace (GGUF) |
| qwen2.5-7b-lumen | 7B | no disponible | Apache 2.0 | HuggingFace (GGUF) |
| Qwen/Qwen2.5-3B-Instruct | 3.09B | 32k (modelo base) | Apache 2.0 | HuggingFace |

En cuanto a rendimiento, solo se dispone del dato de ~56 tok/s del modelo 3B en GTX 1650. La hermana 7B se describe como "más lenta en 4GB", pero no se aportan cifras concretas.

## Limitaciones y advertencias

- Es un modelo de nicho: su rendimiento fuera del dominio de Lumen/Soup/routing puede degradarse respecto al modelo base.
- No se han publicado evaluaciones de sesgos ni de seguridad específicas para este fine-tuning.
- Riesgo de alucinación inherente a los modelos de 3B, especialmente en temas fuera de su dominio.
- La cuantización GGUF q4_k_m puede introducir pérdida de calidad en comparación con los pesos originales en safetensors.
- No se especifican los datos de entrenamiento ni el proceso de alineación, lo que limita la trazabilidad.
- El autor no ofrece garantías de soporte ni de mantenimiento a largo plazo; es un proyecto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/takshathosani17/qwen2.5-3b-lumen
- Repositorio Lumen Stream Lab: https://github.com/taksha17/lumen-stream-lab
- Walkthrough en vídeo: https://github.com/taksha17/lumen-stream-lab#walkthrough-60s
- Modelo hermano qwen2.5-7b-lumen: https://huggingface.co/takshathosani17/qwen2.5-7b-lumen
- Solicitud de perfiles de hardware: https://github.com/taksha17/lumen-stream-lab/issues/1
