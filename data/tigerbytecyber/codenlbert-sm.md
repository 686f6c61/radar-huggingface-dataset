# TigerByteCyber/codenlbert-sm

## Resumen

codenlbert-sm es un modelo de clasificación de texto basado en la arquitectura BERT pequeño (bert-small de prajwall), especializado en distinguir entre fragmentos de código fuente y lenguaje natural. Fue desarrollado originalmente por Vishnunkumar y posteriormente re-subido por TigerByteCyber en Hugging Face. El modelo resuelve un problema concreto: la detección automática de código en textos, lo que resulta útil en tareas de moderación de prompts, filtrado de contenido y prevención de inyección de código en sistemas de IA conversacional.

Con 28,7 millones de parámetros, es un modelo ligero que alcanza una precisión del 99,8 % en datos de validación, según las métricas reportadas por el autor. Está entrenado exclusivamente en inglés y su pipeline es de clasificación de texto (text-classification). Su relevancia actual radica en que puede integrarse en pipelines de seguridad para LLM, como el scanner BanCode de LLM Guard, que utiliza modelos similares para bloquear código en prompts de usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 28.765.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), concretamente en la variante "small" de prajwall, que reduce el número de capas y la dimensión oculta respecto al BERT-base. Se trata de un encoder transformer con atención bidireccional, diseñado para tareas de comprensión del lenguaje. El entrenamiento se realizó mediante fine-tuning supervisado sobre el dataset `vishnun/CodevsNL`, que contiene ejemplos etiquetados de código y lenguaje natural. El proceso consistió en 5 épocas, con una pérdida de entrenamiento que descendió de 0,0225 a 0,0009 y una pérdida de validación estable alrededor de 0,01. La precisión en validación alcanzó el 99,8 % en la última época. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un clasificador binario estándar.

## Capacidades

- Clasificación binaria de texto: distingue entre código fuente y lenguaje natural.
- Alta precisión en la tarea objetivo (99,8 % en validación).
- Inferencia rápida y ligera gracias a su tamaño reducido (28,7 M de parámetros).
- Compatible con la librería Transformers de Hugging Face y con el pipeline de text-classification.
- Soporta despliegue mediante text-embeddings-inference y endpoints compatibles.
- No dispone de capacidades de generación de texto, tool calling, agentes, visión ni audio.

## Casos de uso

- Moderación de prompts en aplicaciones de IA: el modelo puede clasificar si un prompt de usuario contiene código, permitiendo bloquear o redirigir solicitudes que intenten inyectar instrucciones maliciosas o compartir código propietario.
- Filtrado de contenido en foros y plataformas colaborativas: detecta automáticamente publicaciones que contienen fragmentos de código, facilitando su revisión o etiquetado.
- Prevención de fugas de código en entornos corporativos: integrado en herramientas de chat interno, alerta cuando un empleado pega código fuente en conversaciones, reduciendo el riesgo de exposición no autorizada.
- Clasificación de tickets de soporte técnico: distingue entre descripciones de problemas en lenguaje natural y snippets de código adjuntos, mejorando el enrutamiento de incidencias.
- Preprocesamiento de datasets para entrenamiento de modelos: filtra automáticamente ejemplos mixtos de código y texto, limpiando corpus para tareas de NLP.
- Integración en pipelines de seguridad para LLM: como componente del scanner BanCode de LLM Guard, bloquea prompts que contengan código antes de que lleguen al modelo generativo, mitigando ataques de inyección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta las siguientes métricas de entrenamiento y validación:

| Época | Pérdida de entrenamiento | Pérdida de validación | Precisión |
|------:|--------------------------:|----------------------:|----------:|
| 1     | 0,022500                  | 0,012705              | 0,997203  |
| 2     | 0,008700                  | 0,013107              | 0,996880  |
| 3     | 0,002700                  | 0,014081              | 0,997633  |
| 4     | 0,001800                  | 0,010666              | 0,997526  |
| 5     | 0,000900                  | 0,010800              | 0,998063  |

La precisión final en validación es del 99,8 %, lo que indica un rendimiento muy alto en la tarea de clasificación código vs. lenguaje natural.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 28,7 M de parámetros, en FP32 ocupa aproximadamente 115 MB de memoria, más overhead de activaciones. Con cuantización a int8, el uso se reduce a unos 30-40 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1650 o incluso CPUs modernas pueden ejecutarlo sin problemas.
- Compatible con hardware de consumo: sí, cabe en cualquier GPU de gama media y también en CPU.
- Opciones de despliegue: vLLM, Hugging Face Inference Endpoints, text-embeddings-inference, o mediante la librería Transformers directamente.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por su tamaño reducido se espera una latencia de milisegundos por lote pequeño y un throughput alto en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados de otros modelos de la misma categoría. Se conoce la existencia de variantes del mismo autor, como `vishnun/codenlbert-tiny` (más pequeño) y `vishnun/codenlbert-base` (más grande), pero no se han encontrado especificaciones técnicas ni benchmarks públicos de estos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado únicamente con datos en inglés, puede tener un rendimiento deficiente con texto en otros idiomas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación no aplica; sin embargo, puede producir falsos positivos o negativos en la clasificación.
- Limitaciones de contexto: la arquitectura BERT típicamente soporta un máximo de 512 tokens, por lo que fragmentos de código muy largos podrían truncarse y afectar a la precisión.
- Restricciones de licencia: la licencia no está especificada, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Caveat para producción: el modelo fue entrenado en un dataset específico (CodevsNL) y puede no generalizar bien a otros estilos de código o lenguajes de programación no representados en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TigerByteCyber/codenlbert-sm
- Modelo original de vishnun: https://huggingface.co/vishnun/codenlbert-sm
- Dataset de entrenamiento: https://huggingface.co/datasets/vishnun/CodevsNL
- Página del modelo en PromptLayer: https://www.promptlayer.com/models/codenlbert-sm/
- Repositorio GitHub del autor (vishnun): https://github.com/Vishnunkumar
- Space de extracción de bloques de código: https://huggingface.co/spaces/vishnun/SnapCode
