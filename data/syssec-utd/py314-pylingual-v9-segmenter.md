# syssec-utd/py314-pylingual-v9-segmenter

## Resumen

El modelo py314-pylingual-v9-segmenter es un modelo de segmentación de tokens desarrollado por el grupo syssec-utd. Se trata de un fine-tuning del modelo base py314-pylingual-v9-mlm, que a su vez es un modelo de lenguaje enmascarado basado en la arquitectura RoBERTa. El modelo está diseñado para la tarea de token-classification, con el objetivo de segmentar código Python en tokens, en el contexto del proyecto pylingual, un decompilador de Python para versiones modernas. Con 108.887.043 parámetros, es un modelo de tamaño pequeño que se enmarca dentro de un pipeline de decompilación. La información proporcionada no incluye detalles sobre la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder-only transformer) |
| Parametros totales | 108.887.043 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura RoBERTa, un transformer codificador. Es un fine-tuning del modelo py314-pylingual-v9-mlm sobre el dataset syssec-utd/segmentation-py314-pylingual-v9-tokenized. El entrenamiento se realizó durante 2 épocas con una tasa de aprendizaje de 2e-05, un tamaño de batch de 64 por dispositivo y un batch total de 192 al emplear 3 GPU. Se utilizó entrenamiento de precisión mixta nativa (Native AMP) y un optimizador AdamW fused. No se aplicaron técnicas de RLHF ni DPO. Los pesos se publican en formato safetensors. El modelo base fue entrenado con una tarea de modelado de lenguaje enmascarado, lo que le permite comprender la estructura del código Python. La innovación técnica destacable es su uso específico para segmentación de tokens dentro de un pipeline de decompilación.

## Capacidades

- Segmentación de tokens en código Python mediante clasificación de tokens (pipeline token-classification).
- Identificación de límites de tokens en secuencias de código, utilizable para reconstruir tokens originales a partir de representaciones tokenizadas u ofuscadas.
- No soporta generación de texto libre, tool calling, uso como agente ni razonamiento multi-etapa, al ser un modelo encoder con salida de clasificación por token.
- Capacidades multilingües no especificadas; el dominio de aplicación es Python.
- No dispone de modo de razonamiento explícito ni de capacidades de visión o audio.

## Casos de uso

- Decompilación de código Python: el modelo se integra en el pipeline del proyecto pylingual para segmentar bytecode o representaciones tokenizadas, facilitando la reconstrucción del código fuente. Su precisión de 0,9912 en la evaluación lo hace adecuado para este fin.
- Ingeniería inversa de scripts ofuscados: los analistas pueden usar el modelo para identificar tokens en código Python ofuscado, lo que ayuda a comprender la lógica subyacente.
- Análisis estático de código: herramientas de seguridad pueden aplicar el modelo para extraer tokens de scripts Python en procesos automatizados de escaneo de vulnerabilidades.
- Preprocesamiento para modelos de lenguaje de código: el modelo puede actuar como tokenizador semántico para preparar código Python antes de alimentar otros modelos en tareas de comprensión o generación.
- Normalización de código generado automáticamente: en pipelines de generación de código, el modelo puede limpiar y segmentar las salidas de otros generadores para cumplir con formatos de tokenización estándar.
- Detección de malware en Python: dado que el desarrollador se centra en seguridad, el modelo puede emplearse como componente en sistemas de detección de malware basados en scripts Python.
- Automatización de análisis de repositorios: para proyectos que necesitan obtener un inventario de tokens de código Python a gran escala, el modelo ofrece una segmentación rápida y precisa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye resultados de evaluación sobre el dataset de segmentación, declarados por el autor:

| Métrica | Valor |
|---|---|
| Loss | 0.0169 |
| Precision | 0.9912 |
| Recall | 0.9920 |
| F1 | 0.9916 |
| Accuracy | 0.9980 |

## Requisitos de hardware

La información proporcionada no incluye datos de VRAM ni GPU recomendadas. El modelo está etiquetado como endpoints_compatible, lo que sugiere que puede desplegarse mediante Hugging Face Inference Endpoints. Al usar formato safetensors y la librería Transformers, puede ejecutarse en cualquier entorno que soporte PyTorch. Dado el número de parámetros (108.887.043), es esperable que pueda ejecutarse en CPU o en una GPU con poca memoria, aunque no se han publicado cifras oficiales. No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado datos de comparación con modelos similares en la información proporcionada.

## Limitaciones y advertencias

- La model card está incompleta y no documenta sesgos ni limitaciones específicas, lo que dificulta la evaluación de riesgos.
- El modelo solo se ha evaluado en el dataset de segmentación de py314-pylingual-v9-tokenized; no hay evidencia de generalización a otros dominios o lenguajes.
- La licencia no está especificada, por lo que el uso comercial no está confirmado.
- Al ser un modelo encoder de 108M parámetros, no puede realizar generación de texto ni tareas complejas de razonamiento.
- No aplica riesgo de alucinación al no ser generativo, pero puede producir errores de segmentación en tokens ambiguos o mal formados.
- El entrenamiento se realizó con un dataset específico de Python, por lo que su rendimiento en otros lenguajes de programación es desconocido.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/syssec-utd/py314-pylingual-v9-segmenter
- Repositorio del proyecto pylingual: https://github.com/syssec-utd/pylingual
- Modelo base en Hugging Face: https://huggingface.co/syssec-utd/py314-pylingual-v9-mlm
