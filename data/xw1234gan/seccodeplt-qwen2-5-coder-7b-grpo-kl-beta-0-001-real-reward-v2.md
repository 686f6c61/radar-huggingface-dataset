# xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-reward-v2

## Resumen

El modelo `seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-reward-v2` es un ajuste fino del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` mediante la técnica de optimización por política de grupo (GRPO) con regularización de divergencia KL (beta=0.001). Ha sido desarrollado por el usuario `xw1234gan` como parte de un experimento de investigación orientado a mejorar el cumplimiento de propiedades de seguridad en el código generado, utilizando el dataset `fengyao1909/SecCodePLT_Plus`. El modelo está diseñado para la generación de texto, específicamente código, con un enfoque en la seguridad.

Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), este checkpoint representa una variante experimental que corrige la alineación de etiquetas causales y emplea la recompensa oficial de pruebas unitarias de seguridad ReaL, junto con pérdida de tokens estilo DAPO y muestreo dinámico. La relevancia de este modelo radica en su metodología: aplica aprendizaje por refuerzo (RL) para alinear un modelo de código con criterios de seguridad, un área de creciente interés en el desarrollo de software asistido por IA. No se especifica la longitud de contexto ni los idiomas soportados en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer decoder-only de `Qwen/Qwen2.5-Coder-7B-Instruct`, un modelo de generación de código de 7 mil millones de parámetros. Sobre esta base se aplicó un entrenamiento de ajuste fino con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo que optimiza la política del modelo comparando grupos de respuestas generadas. La regularización KL con beta=0.001 se utiliza para evitar que la política se aleje demasiado del modelo de referencia.

El entrenamiento se realizó sobre el dataset `SecCodePLT_Plus`, con una división oficial de 655 ejemplos para entrenamiento y 164 para evaluación. Se empleó la semilla 42. La recompensa se calculó mediante el verificador oficial de pruebas unitarias de seguridad ReaL, que evalúa si el código generado cumple con propiedades de seguridad específicas. Además, se incorporó una pérdida de tokens estilo DAPO y muestreo dinámico para mejorar la estabilidad del entrenamiento. La evaluación se realizó con decodificación greedy sobre los 164 ejemplos de test.

## Capacidades

- Generación de código: el modelo es capaz de producir fragmentos de código en respuesta a instrucciones, heredando las capacidades del modelo base Qwen2.5-Coder-7B-Instruct.
- Enfoque en seguridad: el entrenamiento con GRPO y la recompensa ReaL buscan que el código generado cumpla con propiedades de seguridad verificables.
- Generación de texto conversacional: al ser un modelo de tipo `text-generation`, puede mantener diálogos y responder a prompts en lenguaje natural.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Generación de código seguro en desarrollo de software: el modelo puede sugerir implementaciones que eviten vulnerabilidades comunes (inyección SQL, desbordamiento de búfer, etc.) cuando se le pide explícitamente, gracias a su entrenamiento con recompensas de seguridad.
- Asistencia en revisiones de código: un desarrollador puede presentar un fragmento de código y pedir al modelo que identifique posibles fallos de seguridad, aunque no se garantiza una detección exhaustiva.
- Generación de pruebas unitarias de seguridad: el modelo puede crear casos de prueba que verifiquen propiedades de seguridad específicas, basándose en el formato de las pruebas ReaL utilizadas durante el entrenamiento.
- Educación en programación segura: en entornos de formación, el modelo puede generar ejemplos de código seguro e inseguro para ilustrar buenas prácticas.
- Automatización de corrección de código inseguro: dado un código con vulnerabilidades, el modelo puede proponer versiones corregidas que cumplan con las propiedades de seguridad aprendidas.
- Integración en pipelines de CI/CD: el modelo podría utilizarse como un paso de validación de seguridad en la generación de código, aunque su naturaleza experimental y su rendimiento limitado (joint pass de 31,10%) lo hacen más adecuado para investigación que para producción.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados de evaluación sobre los 164 ejemplos de test oficiales, con decodificación greedy:

| Metrica | Valor |
|---|---|
| Mean reward | 0,511317 |
| Output format pass | 98,78% |
| Syntax pass | 98,17% |
| Capability pass | 38,41% |
| Safety pass | 64,02% |
| Joint pass | 31,10% |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Basándose en el tamaño del modelo (7,6 mil millones de parámetros), se estima:

- VRAM para inferencia: aproximadamente 15 GB en precisión FP16, 8 GB en cuantización de 8 bits y 4-5 GB en cuantización de 4 bits.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40 GB) o GPUs con 8 GB para cuantización de 8 bits (RTX 3070, etc.).
- Es posible ejecutar el modelo en GPUs de consumo si se aplica cuantización, aunque no se han publicado archivos GGUF específicos.
- Opciones de despliegue: al ser un modelo en formato safetensors compatible con la librería transformers, puede servirse con vLLM, Text Generation Inference (TGI) o llama.cpp (si se convierte a GGUF). No se ha confirmado la compatibilidad con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` es la referencia natural, pero no se han publicado métricas comparativas entre ambos.

## Limitaciones y advertencias

- Es un checkpoint de investigación de una sola semilla (seed 42), por lo que los resultados pueden no ser representativos de un rendimiento general.
- La evaluación se realizó con un verificador de Python con recursos limitados, lo que puede no reflejar el comportamiento en entornos de producción.
- El modelo no garantiza la generación de código seguro en todos los casos; el joint pass es solo del 31,10%, lo que indica que la mayoría de las respuestas no cumplen simultáneamente con formato, sintaxis, capacidad y seguridad.
- No se documentan sesgos específicos, pero al ser un modelo entrenado en un dataset concreto, puede heredar sesgos de los datos de entrenamiento.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial.
- No se especifican los idiomas soportados; se asume que el modelo base Qwen2.5-Coder-7B-Instruct tiene capacidades multilingües, pero no se confirma para este checkpoint.

## Enlaces

- [HuggingFace: xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-reward-v2](https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-grpo-kl-beta-0.001-real-reward-v2)
- [Modelo base: Qwen/Qwen2.5-Coder-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct)
- [Dataset: fengyao1909/SecCodePLT_Plus](https://huggingface.co/datasets/fengyao1909/SecCodePLT_Plus)
