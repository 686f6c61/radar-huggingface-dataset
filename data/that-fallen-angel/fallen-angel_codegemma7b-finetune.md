# that-fallen-angel/fallen-angel_codegemma7b-finetune

## Resumen

El modelo `fallen-angel_codegemma7b-finetune` es un ajuste fino de CodeGemma 7B, convertido a formato GGUF mediante la librería Unsloth. Lo publica el usuario `that-fallen-angel` en HuggingFace, aunque no se aporta información sobre el dataset de entrenamiento, el propósito específico del ajuste ni la licencia. El repositorio contiene un único archivo cuantizado en Q4_K_M, lo que lo hace directamente utilizable con llama.cpp y herramientas compatibles.

La relevancia de este modelo reside en su formato GGUF, que permite ejecutarlo en entornos locales con recursos moderados, sin necesidad de infraestructura cloud. Sin embargo, la ausencia de documentación técnica, benchmarks o ejemplos de uso limita su aplicabilidad en entornos profesionales. Se trata de un modelo de código abierto (en formato GGUF) que hereda la arquitectura de CodeGemma 7B, aunque no se detallan las modificaciones realizadas durante el ajuste fino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.537.680.896 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo, los datos de entrenamiento ni el proceso de ajuste fino. El nombre sugiere que se parte de CodeGemma 7B, un modelo de lenguaje de Google basado en transformer, pero no hay confirmación de que el finetune haya mantenido la arquitectura original. Se sabe que la conversión a GGUF se realizó con Unsloth, que optimiza el entrenamiento y la conversión, pero no se detallan los hiperparámetros, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de código: como finetune de CodeGemma, se espera que pueda generar y completar código en varios lenguajes, aunque no hay evidencia documentada.
- Razonamiento y comprensión del lenguaje: hereda capacidades generales de CodeGemma, pero no se han verificado.
- Tool calling y function calling: no documentado.
- Soporte para agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentado.
- Modo de pensamiento o visión: no disponible.

## Casos de uso

- Generación de código en entornos locales: el formato GGUF permite ejecutar el modelo con llama.cpp en máquinas con CPU o GPU de baja capacidad, útil para desarrollo offline de fragmentos de código.
- Asistencia en entornos de desarrollo: puede integrarse en editores o IDEs que soporten llamadas a modelos locales, aunque no hay garantías de calidad.
- Prototipado rápido de aplicaciones de chat: con llama-cli se puede desplegar un chat local, pero la falta de documentación limita su uso en producción.
- Experimentación académica: útil para estudiar el impacto del ajuste fino en modelos de código, pero sin datos de entrenamiento no se puede replicar.
- Uso educativo: para aprender a convertir modelos a GGUF con Unsloth y ejecutarlos con llama.cpp.
- Aplicaciones con requisitos estrictos de privacidad: al ser local, los datos no salen del equipo, pero se desconoce la licencia y la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M pesa unos 5,3 GB, por lo que la inferencia requiere aproximadamente 6 GB de VRAM (incluyendo overhead) en GPU.
- GPUs recomendadas: una NVIDIA RTX 3060 (12 GB) o superior puede ejecutarlo cómodamente; también cabe en tarjetas de 8 GB como la RTX 2070, aunque con menor margen.
- Uso en CPU: llama.cpp soporta ejecución en CPU con 8-16 GB de RAM, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte a un modelo compatible), llama-cpp-python para integración en Python.
- Latencia: no se ha medido; en una GPU moderna se espera una velocidad de 20-40 tokens/s, pero es una estimación sin datos reales.

## Comparativa con modelos similares

No se dispone de comparativas directas. Como referencia, CodeGemma 7B (el modelo base) tiene 8,5 B parámetros, contexto de 8K, licencia de Google (Gemma License) y está disponible en safetensors. Este finetune no ofrece datos de rendimiento, por lo que no es posible una comparación objetiva.

## Limitaciones y advertencias

- Licencia desconocida: al no especificarse, no se puede garantizar el uso comercial ni la redistribución.
- Sesgos y alucinaciones: no hay documentación sobre sesgos, pero como modelo de código, puede generar código incorrecto o inseguro.
- Contexto limitado: no se conoce la longitud de contexto; si se mantiene la de CodeGemma (8K), puede ser insuficiente para tareas de largo alcance.
- Falta de mantenimiento: el repositorio no ha tenido actualizaciones desde su creación, sin soporte.
- Riesgo de producción: sin benchmarks ni pruebas, no es recomendable para entornos críticos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/that-fallen-angel/fallen-angel_codegemma7b-finetune)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth) (herramienta utilizada para la conversión)
