# webbrain-one/pekbilen-pii-ner

## Resumen

PekBilen PII NER es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de datos personales en textos jurídicos y correspondencia cotidiana en turco. Lo desarrolla webbrain-one y se distribuye como un clasificador de tokens ligero construido mediante fine-tuning de `dbmdz/bert-base-turkish-cased`, un transformer BERT en versión cased (sensible a mayúsculas) para turco. Su propósito es identificar tres categorías de información personal: nombres de persona (PER), organizaciones privadas (ORG) y direcciones postales explícitas (ADDR).

El modelo está pensado para ejecutarse localmente en el escritorio del usuario, dentro de la aplicación PekBilen, enmascarando los datos personales antes de que el texto se envíe a un modelo en la nube. Esta arquitectura de "anonimización en el borde" es relevante porque reduce la exposición de datos sensibles a servicios externos y permite cumplir con requisitos de privacidad sin depender de un proveedor. La distribución se hace en formato ONNX cuantizado a int8 (111 MB), lo que permite inferencia en CPU sin GPU.

La ventana de entrada es de 384 tokens y el modelo no cubre datos de formato fijo (número de identidad turco, teléfono, IBAN, matrícula), que deben capturarse mediante reglas. Tampoco etiqueta deliberadamente instituciones públicas como ministerios, tribunales o ayuntamientos. Es, por tanto, una pieza dentro de un pipeline de anonimización, no una solución completa por sí sola.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (encoder), fine-tuning de `dbmdz/bert-base-turkish-cased` |
| Parametros totales | no disponible (modelo base BERT base turco; el repo pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens de entrada |
| Tipos de cuantizacion | ONNX int8 (111 MB) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.int8.onnx`); tokenizador de Hugging Face |
| Etiquetas | `O, B-PER, I-PER, B-ORG, I-ORG, B-ADDR, I-ADDR` (esquema BIO) |
| Entradas | `input_ids`, `attention_mask` |
| Salidas | `logits` |
| Tokenizador | sensible a mayúsculas (`do_lower_case=false`) |
| Region | us |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base adaptado al turco sobre el que se aplica una cabeza de clasificación de tokens con esquema BIO de siete etiquetas. La inferencia se realiza con ONNX Runtime sobre un grafo cuantizado a int8, lo que reduce el tamaño a 111 MB y permite ejecución en CPU. El tokenizador es cased, de modo que distingue mayúsculas y minúsculas, algo relevante en turco por la presencia de caracteres como İ/ı.

El entrenamiento se realizó íntegramente con datos sintéticos: 32.211 líneas generadas a partir de nombres, organizaciones y direcciones ficticias insertadas en plantillas de textos jurídicos, más 922 textos de escritura libre producidos por Qwen 3.8 27B con entidades predefinidas y verificación de código. Se introdujeron variaciones ortográficas: todo en mayúsculas, todo en minúsculas, escritura sin caracteres turcos, sufijos sin apóstrofo y el formato de apellido en mayúsculas habitual en UYAP (sistema judicial turco), por ejemplo "Ahmet YILMAZ". No se documenta el uso de RLHF ni DPO; el ajuste es supervisado sobre etiquetas de entidades.

## Capacidades

- Detección de nombres de persona (PER) en textos jurídicos y correspondencia informal en turco.
- Detección de organizaciones privadas (ORG).
- Detección de direcciones postales explícitas (ADDR).
- Clasificación de tokens con esquema BIO, apta para extracción de entidades y enmascaramiento posterior.
- Robustez ante variaciones de capitalización: entrenado con textos en mayúsculas, minúsculas y sin caracteres turcos.
- Manejo de sufijos turcos sin apóstrofo y del formato de apellido en mayúsculas de UYAP.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No cubre datos de formato fijo (T.C. kimlik no, teléfono, IBAN, matrícula): deben capturarse con reglas.
- No etiqueta instituciones públicas (tribunales, ministerios, ayuntamientos) de forma deliberada.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un clasificador de tokens puro.
- Capacidad multilingüe limitada al turco.

## Casos de uso

- Anonimización previa al envío a la nube: el modelo se ejecuta localmente sobre el texto del usuario y enmascara PER, ORG y ADDR antes de reenviar el contenido a un LLM externo, reduciendo la exposición de datos personales.
- Procesamiento de expedientes jurídicos: extracción de nombres y organizaciones en resoluciones, demandas y escritos para construir índices anonimizados o para revisión interna de documentos.
- Cumplimiento de privacidad en herramientas de escritorio: integración en aplicaciones de escritorio que necesitan una capa de redacción ligera sin GPU ni conexión a servicios externos.
- Preprocesado de corpus para investigación: limpieza de conjuntos de textos turcos antes de su publicación o compartición, marcando entidades personales.
- Enmascaramiento en registros de conversación: detección de nombres y direcciones en logs o transcripciones antes de almacenarlos o analizarlos.
- Filtro de primera pasada en pipelines de DLP: combinado con reglas para datos de formato fijo (IBAN, teléfono, identidad), forma una capa de detección híbrida en herramientas de prevención de fuga de datos.
- Etiquetado asistido para anotación humana: el modelo propone entidades en textos jurídicos turcos y un revisor las corrige, acelerando la creación de corpus anotados.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre un conjunto de test sintético, en int8. Cada celda muestra F1 / tasa de ocultación (si la entidad completa queda cubierta por alguna predicción).

| Conjunto | PER | ORG | ADDR |
|---|---|---|---|
| Todos | 0,990 / 100,0 % | 0,926 / 99,6 % | 0,980 / 99,0 % |
| Nombres y patrones no vistos | 0,991 / 100,0 % | 0,894 / 99,6 % | 0,995 / 100,0 % |
| Textos del profesor (escritura libre) | 0,974 / 99,9 % | 0,967 / 97,5 % | 0,815 / 88,0 % |
| Todo en minúsculas | 0,974 / 99,7 % | 0,923 / 98,4 % | 0,975 / 98,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ONNX int8 de 111 MB se ejecuta en CPU.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en GPU de consumo: sí, aunque no es necesario; el modelo es lo bastante pequeño para ejecutarse en CPU.
- Opciones de despliegue: ONNX Runtime (uso documentado en la model card); el tokenizador se carga con `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Tamaño | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| PekBilen PII NER | BERT base turco | 0,1 GB (int8 111 MB) | 384 tokens | tr | MIT | ONNX |
| dbmdz/bert-base-turkish-cased | BERT base turco | no disponible | 512 tokens (BERT estándar) | tr | no disponible | safetensors / PyTorch |
| Modelos NER multilingües genéricos (p. ej. XLM-R NER) | XLM-R | no disponible | no disponible | multilingüe | no disponible | PyTorch |

La comparativa con alternativas específicas de PII en turco no está disponible en la información proporcionada. Frente al modelo base, PekBilen añade la cabeza de clasificación de entidades y la cuantización int8 para despliegue en CPU.

## Limitaciones y advertencias

- El conjunto de test es sintético y proviene de los mismos generadores que el entrenamiento; el rendimiento en documentos reales puede ser inferior.
- Puede fallar con apellidos con sufijo escritos en minúsculas y sin apóstrofo (por ejemplo, "tunalıya").
- No detecta identificadores indirectos (profesión + lugar + fecha).
- No es una garantía de anonimización por sí solo; debe combinarse con reglas para datos de formato fijo y con revisión humana.
- No etiqueta instituciones públicas de forma intencionada, lo que puede dejar sin cubrir organizaciones que el usuario considere sensibles.
- Riesgo de alucinación de entidades en textos atípicos no representados en el corpus sintético.
- Capacidad limitada al turco; no debe usarse con otros idiomas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- La ventana de 384 tokens obliga a fragmentar documentos largos, lo que puede partir entidades en los límites de fragmento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/webbrain-one/pekbilen-pii-ner
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Aplicación PekBilen: https://pekbilen.com
