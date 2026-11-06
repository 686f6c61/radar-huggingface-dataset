# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v2

## Resumen

szl-receiptagent-qwen35-0.8b-dpo-v2 es un ajuste fino por DPO (Direct Preference Optimization) del modelo SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, a su vez derivado de la familia Qwen 3.5. Lo desarrolla SZLHOLDINGS y está orientado a una tarea muy concreta: el procesamiento de recibos y documentos de gasto con abstención explícita cuando el modelo no puede verificar un dato, en lugar de fabricar valores plausibles. El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones) y se distribuye en formato safetensors de 16 bits.

La relevancia de esta versión no está en una mejora de capacidades generales, sino en su enfoque de entrenamiento guiado por evaluación: los pares de preferencia se construyeron a partir de los fallos medidos en la evaluación de la versión anterior, en particular la fabricación de importes con apariencia auditada. Es, por tanto, un experimento de alineación a escala piloto sobre un modelo pequeño, con un conjunto de datos de solo 62 pares y 8 pasos de entrenamiento.

Conviene subrayar que el propio autor no reclama que el fallo objetivo haya quedado corregido: indica explícitamente que eso requerirá una nueva evaluación independiente que compare esta versión con la anterior y con el modelo base sobre las mismas pruebas. La ficha, por tanto, debe leerse como documentación de un artefacto de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el artefacto publicado es un modelo fusionado en 16 bits (safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |
| Parametros entrenables en el DPO | 6.389.760 de 865.765.440 (0,74 %) |
| Modelo base | SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 |
| Tamaño del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo parte de un transformer decoder-only de la familia Qwen 3.5, aunque la model card no detalla la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención o posición). Sobre la versión SFT v3 se aplicó una pasada de DPO con los siguientes hiperparámetros: beta 0,1, learning rate 5e-6, 2 épocas, longitud de secuencia 2048 y un total de 8 pasos de entrenamiento. Solo se entrenó el 0,74 % de los parámetros (6.389.760), lo que sugiere el uso de adaptadores o de una configuración de bajo rango, aunque la model card no lo especifica; el artefacto publicado es el modelo completo fusionado en 16 bits.

El conjunto de preferencia, doctrine-abstention-dpo-v2, contiene 62 pares distribuidos en 8 familias de reglas. La particularidad metodológica es que las respuestas rechazadas se construyeron a partir de las formas de fabricación confiada observadas en la evaluación de la versión anterior, es decir, el entrenamiento se diseñó para penalizar exactamente los patrones de error medidos. El entrenamiento se ejecutó en una única RTX A6000 con el backend Unsloth, y el autor aporta un registro de entrenamiento en el dataset privado wave-logs y el script launcher en el repositorio szl-forge. No se documentan datos sobre volumen de tokens de preentrenamiento, composición del corpus original ni uso de RLHF adicional.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado de text-generation.
- Procesamiento de documentos con entrada de imagen y texto (tag image-text-to-text), orientado a la extracción de datos de recibos.
- Abstención explícita: el objetivo declarado del ajuste es que el modelo rechace responder cuando no puede verificar un dato, en lugar de inventarlo.
- Comportamiento de agente de recibos: el nombre del modelo y las etiquetas sugieren un flujo de extracción y validación de campos de gasto, aunque la model card no detalla la interfaz exacta.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta modo de razonamiento extendido (thinking), soporte de audio ni capacidades multimodales más allá de imagen-texto.
- Capacidades multilingües: únicamente inglés según el campo `language`.

## Casos de uso

- Extracción de campos de recibos en un pipeline de gastos: el modelo recibe la imagen y el texto asociado y devuelve los campos estructurados (importe, fecha, comercio), con la particularidad de que está entrenado para abstenerse cuando un campo no es legible o no está presente.
- Validación con abstención en flujos de contabilidad: en lugar de completar un importe dudoso, el modelo puede marcar el documento para revisión humana, lo que encaja en procesos donde un dato fabricado tiene coste regulatorio.
- Preprocesado para auditoría interna: uso como primer filtro que separa recibos claros de recibos ambiguos antes de pasarlos a un sistema de OCR o a un humano, aprovechando su comportamiento conservador.
- Investigación sobre alineación y abstención: el modelo sirve como caso de estudio reproducible de DPO guiado por evaluación, con datos de preferencia públicos y registro de entrenamiento, para estudiar cómo se comporta un modelo pequeño ante instrucciones de "no inventar".
- Prototipado de agentes documentales en local: con menos de mil millones de parámetros, puede ejecutarse en una sola GPU de consumo para experimentar con flujos de agente sobre documentos sin depender de APIs externas.
- Evaluación comparativa de técnicas de DPO: al publicarse junto a su modelo base y a la versión anterior, permite medir el efecto de una pasada de DPO de solo 8 pasos sobre un fallo concreto, lo que resulta útil para calibrar expectativas sobre ajustes de alineación a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "eval receipt" de la versión anterior y afirma que la comparación entre dpo-v2, dpo-v1 y el modelo base sobre las mismas pruebas queda pendiente, por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de precisión de extracción de recibos que puedan citarse.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: en torno a 1,8-2 GB solo para pesos, más el espacio de activaciones y caché KV, que depende de una longitud de contexto no documentada.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1 GB de pesos; en 4 bits, en torno a 0,5 GB. Estas cifras son estimaciones por tamaño y no proceden de la model card.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para 16 bits con contexto moderado; una RTX 3060, RTX 4060 o superior es suficiente. El entrenamiento se realizó en una RTX A6000.
- Cabe holgadamente en GPU de consumo; también es viable en CPU con llama.cpp u Ollama si se generan pesos GGUF, aunque el repositorio solo publica safetensors.
- Opciones de despliegue: transformers (librería declarada), vLLM o TGI para servir el modelo en 16 bits, y llama.cpp u Ollama previa conversión a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-dpo-v2 | 873 M | No disponible | Apache 2.0 | Extracción de recibos con abstención, DPO piloto |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3 | ~865 M (según parámetros entrenables del DPO) | No disponible | No disponible | Versión SFT previa, sin pasada de DPO |
| Qwen 3.5 base (0.8B) | ~0,8 B | No disponible | No disponible | Modelo generalista del que deriva la familia |
| Otros modelos pequeños de extracción documental | Variable | Variable | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas, por lo que la comparación se limita a parámetros, licencia y enfoque.

## Limitaciones y advertencias

- El autor no reclama que el fallo objetivo (fabricación de importes con apariencia auditada) haya quedado corregido; la verificación queda pendiente de una evaluación independiente.
- Entrenamiento a escala piloto: 62 pares de preferencia y 8 pasos, lo que limita la generalización de cualquier efecto observado.
- Solo inglés; no hay soporte documentado de otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación persistente fuera de los patrones cubiertos por las 8 familias de reglas del dataset de preferencia.
- No se documentan sesgos conocidos, pero al ser un ajuste sobre un modelo base generalista hereda los sesgos de este, no evaluados en la model card.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de capacidades hace desaconsejable su despliegue en producción sin validación propia.
- El repositorio no incluye pesos cuantizados; quien quiera desplegar en CPU o en GPU de gama baja deberá generarlos.
- La model card incluye referencias a datasets privados (wave-logs) y a un repositorio de GitHub, lo que limita la reproducibilidad completa del entrenamiento por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-dpo-v2
- Modelo base (SFT v3): https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Dataset de preferencias: https://huggingface.co/datasets/SZLHOLDINGS/doctrine-abstention-dpo-v2
- Dataset de evaluaciones (eval receipts): https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Dataset de registros de entrenamiento (privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Script de entrenamiento DPO: https://github.com/szl-holdings/szl-forge/blob/main/training/dpo_wave.py
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
