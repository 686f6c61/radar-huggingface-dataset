# zafrem/privyscope-en

## Resumen

PrivyScope-EN es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de información personal identificable (PII) en textos en inglés, con el objetivo de facilitar la redacción o anonimización automática de datos sensibles. Está desarrollado por el usuario de HuggingFace `zafrem` y se distribuye bajo licencia Apache 2.0.

El modelo parte de `FacebookAI/roberta-base`, un transformer encoder de 125 millones de parámetros, y se ha ajustado para la tarea de etiquetado de tokens orientada a privacidad. Se distribuye en formato ONNX, lo que facilita su despliegue en entornos de inferencia optimizados y en pipelines de producción sin dependencia de frameworks de deep learning pesados.

Su relevancia radica en el creciente interés por el cumplimiento normativo en materia de protección de datos (RGPD, CCPA) y por la necesidad de herramientas ligeras que permitan preprocesar o enmascarar textos antes de enviarlos a modelos generativos de mayor tamaño o a sistemas externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) |
| Parametros totales | 125 millones (heredados de roberta-base, no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de roberta-base, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; cuantizacion int8 no confirmada) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es RoBERTa-base, un transformer encoder de tipo BERT con 12 capas, 12 cabezas de atención y dimensión oculta de 768, preentrenado por Facebook AI sobre un corpus de aproximadamente 160 GB de texto en inglés. Sobre esta base, el autor ha realizado un ajuste fino para una tarea de etiquetado de tokens (token classification) orientada a la detección de PII, con etiquetas relacionadas con entidades personales (nombres, direcciones, identificadores, etc.).

La model card publicada no incluye información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, la composición del corpus anotado, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en tareas de NER). Tampoco se documenta ninguna innovación arquitectónica adicional: se trata de un ajuste fino estándar sobre un encoder preexistente, exportado a ONNX para su despliegue.

## Capacidades

- Detección de información personal identificable (PII) en textos en inglés mediante etiquetado a nivel de token.
- Reconocimiento de entidades nombradas (NER) orientado a privacidad: nombres de personas, direcciones, identificadores y otras categorías de datos sensibles.
- Soporte de redacción o anonimización: las entidades detectadas pueden enmascararse o eliminarse en un paso posterior del pipeline.
- Inferencia optimizada mediante formato ONNX, apta para despliegue en CPU y entornos con requisitos de latencia bajos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades multimodales.
- No se documenta capacidad multilingüe: el modelo está entrenado y etiquetado únicamente para inglés.

## Casos de uso

- Anonimización previa a inferencia con LLM: el modelo detecta y enmascara PII en el prompt del usuario antes de enviarlo a un modelo generativo externo, reduciendo la exposición de datos personales a terceros.
- Cumplimiento del RGPD en pipelines de datos: integrado como paso de preprocesado en procesos ETL, permite identificar y redactar datos personales en textos almacenados o en tránsito.
- Redacción de documentos internos: en la preparación de corpus para publicación, investigación o compartición con terceros, el modelo marca las entidades sensibles para su revisión o eliminación manual.
- Filtrado de logs y trazas de aplicación: detección de PII en registros de sistemas antes de su almacenamiento o envío a plataformas de observabilidad, reduciendo el riesgo de fuga de datos.
- Preprocesado de datasets para entrenamiento: limpieza de corpus en inglés antes de usarlos para ajuste fino de otros modelos, evitando memorizar información personal.
- Moderación y revisión de contenido generado por usuarios: identificación de datos personales publicados en foros o comentarios para su eliminación automática o alerta a moderadores.
- Despliegue en el borde (edge): gracias a su tamaño reducido y formato ONNX, puede ejecutarse en entornos con recursos limitados donde no es viable un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 125 M de parámetros del encoder base; en la práctica, el modelo ONNX puede ejecutarse en CPU con huella de memoria de unos pocos cientos de MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere GPU de datacenter. Una RTX 3060, RTX 4090 o incluso una GTX 1650 pueden ejecutar el modelo con holgura.
- Cabe en cualquier GPU consumer actual e incluso en CPU sin aceleración dedicada.
- Opciones de despliegue: ONNX Runtime (formato nativo del repo), y potencialmente conversión a otros runtimes; no se documenta soporte directo en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 125 M en ONNX Runtime sobre CPU, cabría esperar latencias de decenas de milisegundos por secuencia de 512 tokens, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| PrivyScope-EN | ~125 M | 512 (heredado) | Deteccion de PII / NER | Apache 2.0 | ONNX |
| FacebookAI/roberta-base | 125 M | 512 | Modelo base (MLM) | MIT | safetensors, PyTorch |
| dslim/bert-base-NER | 110 M | 512 | NER general (CoNLL) | MIT | safetensors, PyTorch |
| openai/privacy-filter | no disponible | no disponible | Deteccion de PII | no disponible | no disponible |

La comparativa se limita a modelos de la misma familia y tamaño, dado que no se dispone de datos de rendimiento publicados para PrivyScope-EN. Frente a `dslim/bert-base-NER`, la diferencia principal es la especialización en PII y el formato ONNX; frente al modelo base `roberta-base`, la diferencia es el ajuste fino para etiquetado de tokens.

## Limitaciones y advertencias

- Solo soporta inglés; no debe usarse con textos en otros idiomas sin un ajuste previo.
- No se han publicado métricas de evaluación (precisión, recall, F1) en la model card, por lo que el rendimiento real en detección de PII es desconocido.
- El modelo puede heredar sesgos del corpus de preentrenamiento de RoBERTa, incluyendo sesgos de género, etnia o nacionalidad en la detección de entidades.
- Riesgo de falsos negativos: entidades PII no detectadas pueden pasar desapercibidas y comprometer el objetivo de anonimización; se recomienda validación humana en flujos críticos.
- Riesgo de falsos positivos: la redacción excesiva puede degradar la utilidad del texto resultante.
- No se documenta la composición del dataset de ajuste fino, lo que impide evaluar la cobertura de categorías de PII.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), la falta de benchmarks y de documentación de entrenamiento desaconseja su uso en producción sin una evaluación propia exhaustiva.
- El modelo no es generativo: no puede redactar por sí mismo, solo etiquetar; la redacción debe implementarse en un paso posterior del pipeline.

## Enlaces

- [HuggingFace: zafrem/privyscope-en](https://huggingface.co/zafrem/privyscope-en)
- [Modelo base: FacebookAI/roberta-base](https://huggingface.co/FacebookAI/roberta-base)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
