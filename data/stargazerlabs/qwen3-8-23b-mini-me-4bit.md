# StargazerLabs/Qwen3.8-23B-Mini-Me-4bit

## Resumen

Qwen3.8-23B-Mini-Me-4bit es una cuantizacion en 4-bit (formato MLX) del modelo podado Qwen3.8-23B-Mini-Me-bf16, desarrollado por StargazerLabs. El modelo base es una version reducida del Qwen3.8-27B de Alibaba, al que se le han eliminado 12 capas (52 capas restantes) mediante tecnicas de lesion probing, manteniendo intacta la torre de vision. El resultado es un modelo multimodal (texto e imagen) mas pequeno y rapido que el original, pensado para tareas de codificacion, conversaciones multi-turno y uso agente, con licencia Apache 2.0.

El modelo esta cuantizado a 4 bits con MLX, lo que permite su ejecucion en hardware con recursos limitados. Segun la model card, se ha probado internamente en tareas de codificacion y trabajo agente, manteniendo un rendimiento ligeramente inferior al Qwen3.8-27B pero con menor latencia y consumo. No se han publicado benchmarks estandar, por lo que los resultados son cualitativos y basados en pruebas internas del autor.

Este lanzamiento es relevante porque ofrece una alternativa de menor tamano y mas rapida que el Qwen3.8-27B, con la misma arquitectura de vision y capacidades de razonamiento, facilitando su despliegue en entornos con una sola GPU o incluso en dispositivos Apple Silicon via MLX. El modelo base se llama "23B" pero los parametros totales del safetensors son 3.95B, lo que sugiere que la cifra del nombre hace referencia al tamano efectivo del modelo podado, aunque no se ha confirmado oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con torre de vision (imagen-texto) |
| Parametros totales | 3.951.571.728 (aproximadamente 3.95B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B tiene 262K tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del Qwen3.8-27B original, pero con 12 capas eliminadas: se han quitado las capas 12-15, 24-27 y 36-39, seleccionadas mediante pruebas de lesion en diferentes combinaciones de profundidad. La torre de vision se mantiene intacta, por lo que el modelo conserva sus capacidades de entrada de imagen. No se han proporcionado datos sobre el dataset de entrenamiento del modelo podado ni si se ha realizado un fine-tuning posterior a la poda. La cuantizacion a 4 bits se realizo con la libreria MLX, lo que implica una reduccion de precision de los pesos para reducir el consumo de memoria y acelerar la inferencia en hardware de Apple Silicon.

## Capacidades

- Generacion de texto, razonamiento, codificacion y matematicas, heredadas del modelo Qwen3.8-27B.
- Procesamiento de imagenes (image-text-to-text), con torre de vision intacta.
- Soporte para tool calling y trabajo de agentes, segun pruebas del autor.
- Conversaciones multi-turno con retencion de instrucciones, incluso superando el contexto nominal.
- Compatible con MLX, lo que facilita su uso en entornos de Apple.

## Casos de uso

- Agentes de codificacion: el modelo puede integrarse en pipelines de desarrollo para generar, revisar o corregir codigo, aprovechando su capacidad de tool calling y razonamiento multi-paso.
- Asistentes virtuales con contexto largo: en conversaciones con usuarios que requieren recordar informacion de turnos anteriores, gracias a su retencion de instrucciones y contexto.
- Analisis de imagenes en produccion: al mantener la torre de vision, puede procesar capturas de pantalla o diagramas para generar descripciones o extraer informacion.
- Despliegue en entornos con recursos limitados: su tamano de 3.95B y cuantizacion 4-bit permite ejecutarlo en GPUs de 6-8 GB de VRAM o en Apple Silicon con MLX.
- Prototipado rapido de agentes: para experimentos de investigacion donde se requiere un modelo multimodal pequeno y licencia permisiva (Apache 2.0).
- Generacion de documentacion tecnica: puede analizar imagenes de diagramas y generar texto explicativo, combinando vision y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. La model card indica que el modelo ha sido probado con "pruebas personales" en lugar de metricas estandar, y que no hay datos de benchmarks que reportar. Se recomienda evaluar el modelo en las tareas especificas de uso antes de desplegarlo en produccion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2-3 GB para los pesos en 4-bit (3.95B parametros a 0.5 bytes por parametro). Sin embargo, el tamano del repositorio es de 13.5 GB, lo que puede incluir otros archivos o el modelo en precision completa, por lo que se recomienda verificar el contenido antes de cargar.
- GPU recomendadas: puede ejecutarse en GPU de consumo como la RTX 3060 (12 GB) o superiores, y en Apple Silicon con MLX.
- Compatible con MLX, llama.cpp, vLLM y otras herramientas que soporten safetensors, aunque la cuantizacion especifica es de MLX.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 3.95B, la inferencia es significativamente mas rapida que el Qwen3.8-27B en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K | Apache 2.0 | Modelo original, mas capaz pero mas pesado |
| Qwen3.8-23B-Mini-Me-4bit | 3.95B | No disponible | Apache 2.0 | Version podada y cuantizada, mas ligera |
| Qwen3.8-Max | 2.4B | No disponible | Apache 2.0 (proximamente) | Modelo de alta capacidad, no comparable en tamano |

No se han publicado benchmarks de esta variante, por lo que la comparacion es estructural y de recursos. El modelo podado es un 85% mas pequeno que el Qwen3.8-27B, pero conserva la arquitectura multimodal y la licencia Apache 2.0.

## Limitaciones y advertencias

- No hay benchmarks formales: el rendimiento se basa en pruebas personales del autor, no en evaluaciones estandarizadas.
- Riesgo de alucinacion y errores en tareas complejas, al ser una version reducida del modelo original.
- La retencion de contexto se menciona como "pasada del contexto nominal", pero el valor de contexto no se ha confirmado; se recomienda no exceder los limites del modelo base sin pruebas.
- La cuantizacion a 4 bits puede degradar la calidad en tareas de alta precision, como matematicas avanzadas o razonamiento logico.
- No se han especificado los idiomas soportados; se asume que hereda los del modelo base, pero no hay confirmacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StargazerLabs/Qwen3.8-23B-Mini-Me-4bit
- Modelo base (bf16): https://huggingface.co/StargazerLabs/Qwen3.8-23B-Mini-Me-bf16 (no verificado)
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Informacion sobre Qwen3.8: https://openlm.ai/qwen3.8/
- Guia de despliegue de Qwen3.8: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-in-production
- Modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
