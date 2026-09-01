# Sumeetgpt/indian-transaction-categorizer

## Resumen

El modelo `Sumeetgpt/indian-transaction-categorizer` es un clasificador de texto basado en SetFit, desarrollado por Sumeet Gupta, que categoriza narraciones de transacciones bancarias indias (UPI, NEFT, IMPS, ACH, POS) en 18 categorías de finanzas personales, como compras, restaurantes, servicios públicos, alquiler, transporte, etc. Resuelve un problema concreto: no existía un dataset público que combinara formatos reales de narración bancaria india con etiquetas de categoría, ya que los datasets existentes o bien tenían texto bancario sin etiquetas (orientados a OCR) o bien usaban nombres de comercios occidentales genéricos. Este modelo cierra esa brecha utilizando datos de entrenamiento completamente sintéticos y respetuosos con la privacidad.

La arquitectura se basa en SetFit, que combina un modelo de sentence transformers (`sentence-transformers/all-MiniLM-L6-v2`) con una cabeza de regresión logística. El modelo tiene 22,7 millones de parámetros y se distribuye en formato safetensors. Está diseñado para clasificar descripciones cortas de transacciones, tanto en formato de narración bancaria (por ejemplo, `UPI/Swiggy Instamart/swiggy@ybl/Payment/HDFC`) como en lenguaje natural (por ejemplo, `"paid electricity bill BESCOM online"`). Su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (sentence-transformers/all-MiniLM-L6-v2 + LogisticRegression) |
| Parametros totales | 22.713.216 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (optimizado para frases cortas de transacciones) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la metodología SetFit (Sentence Transformer Fine-tuning), que consiste en un fine-tuning contrastivo de un modelo de sentence transformers preentrenado (`all-MiniLM-L6-v2`) seguido de una cabeza de clasificación de regresión logística. El entrenamiento se realizó con 810 muestras sintéticas generadas a partir de plantillas que imitan los formatos de narración de bancos indios (ICICI, HDFC, Axis, Scapia), combinando nombres de marcas reales (Swiggy, Zomato, BigBasket, etc.) con números de referencia y nombres de personas generados aleatoriamente. Se usaron 2 épocas, 20 iteraciones y batch size 16. No se aplicaron técnicas de RLHF ni DPO; el entrenamiento es puramente supervisado con datos sintéticos.

## Capacidades

- Clasificación de texto en 18 categorías de gasto personal: Groceries, Eating Out, Kids Activities, Shopping & Clothing, Medicine & Pharmacy, Hospital & Medical, Utilities, Rent & Mortgage, Transportation & Gas, Entertainment & Subscriptions, Travel, Insurance, Education, Personal Care, Investments & Savings Transfer, ATM & Cash, Fees & Interest, Income & Deposits.
- Maneja dos estilos de entrada: narraciones bancarias con formato UPI/NEFT/IMPS (p. ej. `NEFT Dr-HDFC0000953-SURESH VERMA-Blinkit`) y descripciones en lenguaje natural (p. ej. `"SIP auto debit HDFC Flexicap fund"`).
- Proporciona probabilidades por clase mediante `predict_proba`, lo que permite filtrar predicciones de baja confianza para revisión humana.
- No incluye generación de texto, tool calling, capacidades multimodales ni soporte de agentes.

## Casos de uso

- Aplicaciones de finanzas personales: categorización automática de movimientos bancarios importados desde extractos UPI, NEFT o tarjetas de crédito, permitiendo al usuario ver su gasto por categoría sin intervención manual.
- Asistentes de presupuesto: integración en herramientas que analizan hábitos de gasto y generan alertas o informes mensuales, usando la salida del modelo para etiquetar cada transacción.
- Conciliación bancaria: en sistemas contables personales o de pequeñas empresas, el modelo puede clasificar automáticamente las partidas de un extracto, reduciendo el tiempo de revisión.
- Detección de anomalías: aunque no es su propósito principal, la clasificación consistente permite identificar transacciones que no encajan en las categorías esperadas, lo que puede señalar posibles fraudes o errores.
- Análisis de gastos para asesoramiento financiero: alimentar dashboards que muestran distribución de gasto por categoría, ayudando a los usuarios a tomar decisiones de ahorro.
- Enriquecimiento de datos en aplicaciones de contabilidad: dado que el modelo acepta tanto narraciones bancarias como descripciones en lenguaje natural, puede usarse para etiquetar transacciones importadas desde distintas fuentes (banca online, apps de pago, etc.).

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación:

| Test set | Accuracy | Errores de alta confianza (≥0.6) |
|---|---|---|
| Conjunto sintético retenido (270 filas, semilla no vista) | 94.4% | 0 |
| Conjunto natural hecho a mano (20 filas, no generado por plantillas) | 100% | 0 |

No se han publicado comparaciones con otros modelos de categorización de transacciones. Los errores del conjunto retenido se concentran en casos genuinamente ambiguos (reembolsos, intereses, entregas de supermercado vs. restaurantes) y suelen tener baja confianza, por lo que el autor recomienda un umbral de revisión humana.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación disponible.
- Dado el tamaño del modelo (22,7M parámetros) y su arquitectura ligera (all-MiniLM-L6-v2), es razonable esperar que funcione en CPU sin GPU, con latencia de milisegundos por inferencia, aunque no hay datos oficiales.
- Para despliegue, al ser un modelo SetFit, se puede usar la librería `setfit` en Python, o exportar a formatos compatibles con `text-embeddings-inference` (mencionado en los tags) para servir en producción.
- No se documentan opciones de cuantización ni integración con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros clasificadores de transacciones bancarias indias con características equivalentes.

## Limitaciones y advertencias

- El modelo se entrenó exclusivamente con datos sintéticos; no ha sido evaluado con extractos bancarios reales por privacidad. Los resultados reportados son una aproximación razonable, pero no una garantía de rendimiento en producción.
- Puede fallar en casos ambiguos como reembolsos, intereses o transferencias entre cuentas propias, que pueden confundirse con inversiones o ingresos.
- Solo soporta inglés; aunque las narraciones bancarias indias suelen incluir términos en inglés, no se garantiza el correcto funcionamiento con textos en hindi u otros idiomas.
- La licencia MIT permite uso comercial, pero el autor no ofrece soporte ni garantías implícitas.
- El modelo no distingue entre tipos de transacción (débito/crédito) por sí mismo; depende de la entrada para clasificar correctamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Sumeetgpt/indian-transaction-categorizer)
- [Dataset de entrenamiento sintético](https://huggingface.co/datasets/Sumeetgpt/indian-transaction-categorization-synthetic)
- Repositorio "Budgeter" mencionado en la model card (no se proporciona URL directa en la información disponible)
