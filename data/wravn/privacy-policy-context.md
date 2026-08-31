# Wravn/privacy-policy-context

## Resumen

PrivaScope Scope Classifier es un modelo de clasificación de texto desarrollado por Wravn, diseñado para analizar políticas de privacidad a nivel de oración. Forma parte de un pipeline más amplio llamado PrivaScope, que descompone una política de privacidad en cuatro capas: alcance (scope), tema, contenido y atributos. Este modelo concreto se encarga de la capa de alcance, es decir, determina a qué producto o servicio (por ejemplo, sitio web, aplicación, dispositivo) se aplica cada oración de la política.

El modelo se basa en PrivBERT (`mukund/privbert`), una variante de RoBERTa preentrenada adicionalmente sobre aproximadamente un millón de políticas de privacidad. Con 124,6 millones de parámetros, es un modelo compacto orientado a tareas de clasificación de secuencias. Se entrenó con 3.078 oraciones, de las cuales 2.237 fueron anotadas manualmente y 841 sintetizadas mediante un LLM para equilibrar las clases infrarrepresentadas. Los resultados de evaluación muestran un F1 macro de 0,87 y un F1 micro de 0,91.

La relevancia de este modelo radica en su capacidad para automatizar el análisis de políticas de privacidad, una tarea que suele requerir revisión manual y que es cada vez más necesaria para el cumplimiento normativo (por ejemplo, RGPD o CCPA). Al clasificar el alcance de cada oración, facilita la extracción estructurada de obligaciones y derechos aplicables a distintos servicios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) |
| Parametros totales | 124.654.091 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de RoBERTa, un transformer encoder con atención bidireccional. El punto de partida es PrivBERT, que a su vez es una versión de RoBERTa preentrenada sobre un corpus de aproximadamente un millón de políticas de privacidad. Sobre esta base se añadió una cabeza de clasificación de secuencias con 11 clases.

El entrenamiento se realizó con un conjunto de datos compuesto por 3.078 oraciones: 2.237 anotadas manualmente a partir de políticas de privacidad reales y 841 generadas sintéticamente mediante un LLM para mitigar el desequilibrio entre clases. No se especifica el número de épocas, la tasa de aprendizaje ni otras hiperparametros. Tampoco se menciona el uso de técnicas como RLHF o DPO; se trata de un ajuste fino supervisado estándar.

## Capacidades

- Clasificación de oraciones en 11 categorías de alcance: Device, Website, App, Store, Account, Communication, BackendService, Event/Program, Recruitment, Services y Unspecific.
- Análisis de políticas de privacidad en inglés, identificando a qué producto o servicio se refiere cada afirmación.
- Integración en pipelines de procesamiento de lenguaje natural para extracción de información estructurada.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales.
- Funciona únicamente como clasificador de secuencias (text-classification).

## Casos de uso

- Cumplimiento normativo automatizado: una empresa puede procesar sus políticas de privacidad y clasificar automáticamente cada oración según el servicio al que aplica, facilitando la auditoría de obligaciones legales por producto.
- Análisis comparativo de políticas: investigadores o reguladores pueden analizar múltiples políticas de privacidad y agrupar oraciones por alcance para estudiar patrones sectoriales.
- Extracción de cláusulas relevantes: al identificar el alcance, se pueden filtrar oraciones relacionadas con dispositivos o aplicaciones para revisar rápidamente qué datos se recopilan en cada contexto.
- Asistencia a redacción de políticas: durante la creación de una política, el modelo puede verificar si cada oración está correctamente asociada al servicio correspondiente.
- Monitorización de cambios: comparar versiones de una política y detectar qué secciones han cambiado de alcance, ayudando a evaluar el impacto de modificaciones.
- Investigación académica: como parte del pipeline PrivaScope, permite estudiar la estructura semántica de las políticas de privacidad a gran escala.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| F1 Macro | 0,87 |
| F1 Micro | 0,91 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Los valores de F1 provienen de la evaluación interna del autor sobre el conjunto de validación.

## Requisitos de hardware

- Al tratarse de un modelo de 124 millones de parámetros, la inferencia es ligera.
- VRAM estimada: menos de 1 GB en FP16 (aproximadamente 250 MB para los pesos), por lo que puede ejecutarse en GPUs consumer como una RTX 2060 o incluso en CPU.
- Es compatible con cualquier framework que soporte Transformers (PyTorch, Hugging Face).
- No se dispone de datos de latencia o throughput específicos, pero para un modelo de este tamaño se esperan tiempos de inferencia del orden de milisegundos por oración en GPU.
- Opciones de despliegue: Hugging Face Inference Endpoints, vLLM (aunque no es óptimo para modelos encoder), o simplemente con la librería `transformers` en un servicio Python.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. Existen otros clasificadores de políticas de privacidad, como los basados en BERT o LegalBERT, pero no se han encontrado datos concretos para establecer una comparación cuantitativa. Se recomienda consultar el modelo base `mukund/privbert` y la literatura sobre análisis de políticas de privacidad para referencias adicionales.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no es aplicable a políticas en otros idiomas sin adaptación.
- Solo cubre la capa de alcance; no clasifica temas, contenidos ni atributos, que requieren otros modelos del pipeline PrivaScope.
- El conjunto de entrenamiento es relativamente pequeño (3.078 oraciones) y puede no representar toda la variabilidad de políticas de privacidad del mundo real.
- Las oraciones sintetizadas con LLM pueden introducir sesgos o patrones no naturales.
- No se han documentado pruebas de robustez frente a redacción ambigua o jerga legal compleja.
- La licencia MIT permite uso comercial, pero el modelo se ofrece como parte de un pipeline de investigación; no se garantiza su precisión en entornos de producción sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wravn/privacy-policy-context
- Modelo base PrivBERT: https://huggingface.co/mukund/privbert
- Perfil del autor: https://huggingface.co/Wravn
- Referencia externa (sin datos adicionales): https://free2aitools.com/model/wravn/roberta-privacy-policy-context
