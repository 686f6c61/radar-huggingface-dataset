# UGREENDEV/RK182X-LLM-Laya

## Resumen

Laya es un modelo de decisión de texto no autorregresivo desarrollado por Convai Innovations, empaquetado y distribuido en este repositorio por UGREENDEV como artefactos de despliegue RKNN para los aceleradores NPU Rockchip RK1820 y RK1828. A diferencia de un LLM generativo convencional, Laya responde preguntas de elección (choice), puntuación (score) y booleanas (boolean) devolviendo probabilidades calibradas, lo que lo sitúa en la categoría de modelos de clasificación y ranking con salida probabilística.

El checkpoint de origen está basado en English ModernBERT, un transformer encoder de arquitectura bidireccional, y se distribuye en este repositorio únicamente en formato RKNN cuantizado w8a16 para ejecución en NPU. La configuración disponible es `Laya-w8a16-8-512-normal`, con 8 núcleos NPU y una longitud de contexto de 512 tokens (0,5k). El repositorio tiene un tamaño de 0,5 GB.

La relevancia actual del modelo reside en su enfoque de despliegue en hardware de borde: permite ejecutar tareas de decisión y scoring sobre silicio Rockchip sin GPU, con cuantización de pesos a 8 bits y activaciones a 16 bits. La licencia Apache 2.0 facilita su integración en productos comerciales, aunque las capacidades quedan acotadas al ámbito de clasificación en inglés y a un contexto corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (English ModernBERT, no autorregresivo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (0,5k) |
| Tipos de cuantizacion | w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | inglés (checkpoint English ModernBERT); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (artefactos de despliegue para NPU Rockchip); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo de origen es Laya (`convaiinnovations/laya`), descrito por el autor como un modelo de decisión de texto no autorregresivo que responde preguntas de elección, puntuación y booleanas con probabilidades calibradas. El checkpoint empaquetado aquí corresponde a la variante en inglés basada en ModernBERT, un transformer encoder con atención bidireccional orientado a comprensión de texto más que a generación.

Este repositorio no contiene el modelo original ni documenta el proceso de entrenamiento: no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias. La única transformación documentada es la conversión a formato RKNN con cuantización w8a16 para su ejecución en NPU Rockchip, junto con los cambios de atribución recogidos en el fichero NOTICE. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Respuesta a preguntas de elección (choice) con distribución de probabilidad sobre las opciones.
- Puntuación (score) de pares o candidatos con probabilidades calibradas, apta para ranking.
- Respuesta a preguntas booleanas (sí/no) con probabilidad asociada.
- Clasificación y decisión de texto en inglés sobre contextos de hasta 512 tokens.
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante runtime RKNN v1.1.0.
- No es un modelo generativo: no produce texto libre ni razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking: no disponible.

## Casos de uso

- Filtrado y moderación de contenido: el modelo puede puntuar textos candidatos y devolver una probabilidad calibrada de que cumplan un criterio, integrándose en un pipeline previo a revisión humana.
- Ranking de respuestas en sistemas de recuperación: dado un conjunto de fragmentos y una consulta, se usa como scorer para reordenar resultados por relevancia antes de pasarlos a un modelo generativo.
- Enrutamiento de intenciones en asistentes: con preguntas de elección sobre un conjunto cerrado de intenciones, permite decidir a qué flujo derivar una consulta en dispositivos de borde.
- Verificación de afirmaciones simples: mediante preguntas booleanas, se puede comprobar si un texto corto satisface una condición definida (por ejemplo, si contiene una cláusula concreta).
- Clasificación en dispositivos embebidos: al ejecutarse sobre NPU Rockchip RK1820/RK1828 con cuantización w8a16, es adecuado para electrónica de consumo o equipos industriales sin GPU.
- Control de calidad en pipelines de datos: scoring automático de pares pregunta-respuesta o de muestras de un dataset para descartar ejemplos de baja calidad antes del entrenamiento.
- Deduplicación semántica ligera: puntuación de similitud o equivalencia entre pares de textos cortos para agrupar registros duplicados en bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Aceleradores soportados: NPU Rockchip RK1820 y RK1828, con runtime RKNN v1.1.0.
- Configuración de ejecución: 8 núcleos NPU, cuantización w8a16, contexto de 512 tokens.
- VRAM: no aplica; el modelo se ejecuta en NPU, no en GPU.
- GPU recomendadas: no disponibles para este formato; los artefactos RKNN no son ejecutables en CUDA.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible en este repositorio.
- Opciones de despliegue: runtime RKNN de Rockchip; no se documentan vLLM, llama.cpp, Ollama ni TGI para estos artefactos.
- Latencia y throughput: no disponibles.
- Verificación de integridad: el repositorio incluye `SHA256SUMS` para validar los ficheros de la configuración antes del despliegue.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| RK182X-LLM-Laya (este) | Encoder de decisión (ModernBERT) | 512 tokens | RKNN w8a16 | Apache 2.0 | NPU Rockchip RK1820/RK1828 |
| convaiinnovations/laya (origen) | Encoder de decisión (ModernBERT) | no disponible | no disponible | Apache 2.0 | no disponible |
| ModernBERT (checkpoint base) | Encoder bidireccional | hasta 8192 tokens en la familia base | safetensors | Apache 2.0 | GPU/CPU con PyTorch |
| Modelos de clasificación tipo BERT-base | Encoder de clasificación | 512 tokens | safetensors, ONNX | Apache 2.0 / MIT según variante | GPU/CPU |

La comparación con alternativas queda limitada porque el repositorio no publica métricas de rendimiento ni detalles de parámetros. Frente a un BERT-base de clasificación, la diferencia principal es el empaquetado para NPU Rockchip y la salida probabilística calibrada para tareas de elección, score y booleanas, no la capacidad de comprensión en sí.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre, por lo que no sirve para tareas de generación, resumen o diálogo abierto.
- Contexto muy corto: 512 tokens limitan el análisis a fragmentos breves; textos más largos deben truncarse o dividirse.
- Idioma: el checkpoint es English ModernBERT; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Formato propietario: los artefactos RKNN solo se ejecutan en NPU Rockchip RK1820/RK1828 con runtime v1.1.0; no hay pesos en safetensors ni GGUF en este repositorio.
- Calibración: aunque el autor declara probabilidades calibradas, no se publican métricas de calibración (ECE, Brier) que permitan verificarlo.
- Riesgo de sesgo y alucinación: no se documentan evaluaciones de sesgo; al ser un modelo de decisión, los errores se manifiestan como clasificaciones o puntuaciones incorrectas con alta confianza.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse la atribución a Convai Innovations y revisarse el fichero NOTICE por los cambios de conversión.
- Producción: no hay datos de latencia, throughput ni robustez frente a entradas fuera de distribución; conviene validar con `SHA256SUMS` y realizar pruebas propias antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Laya
- Modelo de origen en ModelScope: https://modelscope.cn/models/convaiinnovations/laya
- Configuración de despliegue: https://huggingface.co/UGREENDEV/RK182X-LLM-Laya/tree/main/Laya-w8a16-8-512-normal
- Documentación en chino: https://huggingface.co/UGREENDEV/RK182X-LLM-Laya/blob/main/README_CN.md
- Licencia: https://huggingface.co/UGREENDEV/RK182X-LLM-Laya/blob/main/LICENSE
- Atribución y cambios de conversión: https://huggingface.co/UGREENDEV/RK182X-LLM-Laya/blob/main/NOTICE
