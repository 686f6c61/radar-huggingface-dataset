# TUaxhuiax/lumen-doc-v3-release-card

## Resumen

LumenDoc-V3 es un modelo de inteligencia documental desarrollado por el equipo interno Lumen Document AI, orientado a la ingesta automatizada de documentos de negocio como facturas, recibos, formularios y contratos escaneados. Se distribuye a través de HuggingFace con el identificador `TUaxhuiax/lumen-doc-v3-release-card`, etiquetado para la tarea de *document question answering* dentro del ecosistema `transformers` y bajo licencia Apache 2.0. El modelo se presenta como una evolución de la arquitectura LumenDoc-V2, incorporando tres cambios principales: un codificador de página de mayor resolución, un módulo de orden de lectura sensible al layout y una cabeza específica de cumplimiento para verificación de redacciones.

La relevancia del modelo radica en su enfoque hacia el *back-office* documental, un ámbito donde la precisión en la extracción de campos y la validación de totales es crítica para la contabilidad y el cumplimiento normativo. Según la model card, las predicciones que no superan la validación de extracción se encolan para revisión humana antes de su publicación en sistemas posteriores, lo que sugiere un diseño orientado a la fiabilidad operativa más que a la autonomía total.

No obstante, la información pública disponible es limitada: no se especifican el número de parámetros, la longitud de contexto, la composición del dataset de entrenamiento ni los formatos de pesos más allá de la librería `transformers`. La model card se presenta explícitamente como una *release card* con una decisión de publicación **CONDITIONAL** y una puntuación de calidad ponderada de **0.743** sobre el conjunto DocBench 4.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (hereda de LumenDoc-V2; se mencionan codificador de página de alta resolución, módulo de orden de lectura y cabeza de cumplimiento) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería `transformers`) |

## Arquitectura y entrenamiento

La model card describe LumenDoc-V3 como una extensión de la arquitectura LumenDoc-V2 con tres componentes añadidos o modificados: un codificador de página de mayor resolución, un módulo de orden de lectura sensible al layout y una cabeza dedicada de cumplimiento para la verificación de redacciones. No se especifica si la arquitectura subyacente es un transformer puro, un modelo multimodal con codificador visual, o una combinación híbrida; tampoco se detalla el número de capas, dimensiones ocultas ni el mecanismo de atención empleado.

En cuanto al entrenamiento, la información pública no incluye el número de tokens procesados, la composición del dataset, ni si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. La model card únicamente referencia una evaluación de octubre de 2026 sobre el conjunto DocBench 4.2, con 15 tareas agrupadas en cuatro categorías: *document parsing*, *extraction validation*, *visual grounding* y *document-level reasoning*. No se aportan detalles sobre el proceso de anotación, el preentrenamiento del codificador visual ni la estrategia de aumento de datos.

## Capacidades

- Extracción de campos de formularios (*form field extraction*) con una precisión normalizada de 0.742 en DocBench 4.2.
- Análisis de estructura de tablas (*table structure parsing*) con 0.688 de precisión normalizada.
- Reconocimiento de escritura manuscrita (*handwriting recognition*) con 0.615.
- Emparejamiento de líneas de recibo (*receipt line item matching*) con 0.807.
- Verificación de totales en facturas (*invoice totals verification*) con 0.795.
- Segmentación de layout (*layout segmentation*) con 0.831, la tarea con mayor puntuación del modelo.
- Recuperación de pares clave-valor (*key-value retrieval*) con 0.769.
- Detección de firmas (*signature detection*) con 0.652.
- Localización de sellos (*stamp localization*) con 0.594.
- Decodificación de códigos de barras (*barcode decoding*) con 0.884, la puntuación más alta del modelo.
- Extracción de datos de gráficos (*chart data extraction*) con 0.701.
- Consistencia multi-página (*multi-page consistency*) con 0.723.
- Identificación de idioma (*language identification*) con 0.858.
- Reconstrucción del orden de lectura (*reading order reconstruction*) con 0.676.
- Verificación de cumplimiento de redacciones (*redaction compliance check*) con 0.749.

No se documenta soporte explícito de *tool calling*, *function calling*, razonamiento multi-paso agéntico, ni modos de pensamiento (*thinking mode*). La capacidad multilingüe se limita al inglés según la etiqueta de idioma de la model card.

## Casos de uso

- **Ingesta de facturas en cuentas a pagar**: el modelo extrae campos clave (proveedor, importe, fecha, líneas de detalle) y verifica totales con una precisión de 0.795 en la tarea de verificación de totales; los casos que no superan la validación se derivan a revisión humana antes de su contabilización.
- **Procesamiento de recibos de gastos**: el emparejamiento de líneas de recibo (0.807) permite reconstruir el detalle de compras a partir de tickets escaneados, adecuado para sistemas de reembolso corporativo.
- **Digitalización de formularios administrativos**: la extracción de campos de formulario (0.742) y la segmentación de layout (0.831) permiten convertir formularios en papel o PDF en registros estructurados para su volcado en bases de datos.
- **Verificación de cumplimiento de redacciones**: la cabeza específica de cumplimiento (0.749) permite comprobar que documentos contractuales han sido redactados correctamente antes de su publicación o archivo, un caso típico en departamentos legales y de *compliance*.
- **Procesamiento de contratos escaneados con múltiples páginas**: la consistencia multi-página (0.723) y la reconstrucción del orden de lectura (0.676) permiten mantener la coherencia de referencias entre páginas en contratos y anexos.
- **Extracción de datos de gráficos en informes financieros**: la extracción de datos de gráficos (0.701) permite recuperar series numéricas de figuras en informes anuales para su análisis posterior.
- **Clasificación y enrutado documental por idioma**: la identificación de idioma (0.858) permite enrutar documentos a los flujos de procesamiento correspondientes dentro de un *pipeline* de ingesta.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre DocBench 4.2 (evaluación de octubre de 2026). Todas las puntuaciones son exactitud normalizada en [0, 1]. Baseline-A y Baseline-B son los dos sistemas externos de referencia más fuertes; LumenDoc-V2 es la generación interna anterior.

| Grupo de capacidad | Benchmark | Baseline-A | Baseline-B | LumenDoc-V2 | LumenDoc-V3 |
|---|---|---|---|---|---|
| Document parsing | Form field extraction | 0.703 | 0.691 | 0.718 | 0.742 |
|  | Table structure parsing | 0.641 | 0.657 | 0.665 | 0.688 |
|  | Handwriting recognition | 0.571 | 0.583 | 0.590 | 0.615 |
|  | Receipt line item matching | 0.771 | 0.783 | 0.790 | 0.807 |
| Extraction validation | Invoice totals verification | 0.758 | 0.766 | 0.774 | 0.795 |
|  | Layout segmentation | 0.799 | 0.812 | 0.819 | 0.831 |
|  | Key-value retrieval | 0.734 | 0.745 | 0.751 | 0.769 |
|  | Signature detection | 0.613 | 0.628 | 0.635 | 0.652 |
| Visual grounding | Stamp localization | 0.552 | 0.566 | 0.573 | 0.594 |
|  | Barcode decoding | 0.851 | 0.863 | 0.870 | 0.884 |
|  | Chart data extraction | 0.664 | 0.679 | 0.686 | 0.701 |
| Document-level reasoning | Multi-page consistency | 0.688 | 0.701 | 0.708 | 0.723 |
|  | Language identification | 0.822 | 0.836 | 0.841 | 0.858 |
|  | Reading order reconstruction | 0.639 | 0.651 | 0.658 | 0.676 |
|  | Redaction compliance check | 0.714 | 0.721 | 0.732 | 0.749 |

Puntuación de calidad ponderada: **0.743**. Decisión de publicación: **CONDITIONAL**.

## Requisitos de hardware

No se han publicado requisitos de hardware, VRAM estimada, GPU recomendadas, opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni datos de latencia o *throughput* en la información disponible. Al no conocerse el número de parámetros ni el formato de pesos, no es posible estimar la huella de memoria ni el hardware necesario para la inferencia.

## Comparativa con modelos similares

La model card referencia dos sistemas externos de referencia (Baseline-A y Baseline-B) y la generación anterior interna (LumenDoc-V2), pero no los identifica por nombre ni proporciona sus especificaciones de parámetros, contexto o licencia. La comparación disponible se limita a las puntuaciones de DocBench 4.2 recogidas en la sección de benchmarks.

| Modelo | Parámetros | Contexto | DocBench 4.2 (media de las 15 tareas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LumenDoc-V3 | No disponible | No disponible | 0.743 (calidad ponderada) | Apache 2.0 | HuggingFace |
| LumenDoc-V2 | No disponible | No disponible | Inferior en las 15 tareas (ver tabla) | No disponible | No disponible |
| Baseline-A | No disponible | No disponible | Inferior en las 15 tareas (ver tabla) | No disponible | No disponible |
| Baseline-B | No disponible | No disponible | Inferior en las 15 tareas (ver tabla) | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (document question answering) en la información proporcionada.

## Limitaciones y advertencias

- **Decisión de publicación condicional**: la model card indica explícitamente `Release decision: CONDITIONAL` con una puntuación de calidad ponderada de 0.743, lo que sugiere que el modelo no ha superado un umbral de publicación pleno y debe tratarse con cautela en producción.
- **Idioma limitado al inglés**: la etiqueta de idioma es `en`; no se documenta soporte para castellano ni otros idiomas, más allá de la tarea de identificación de idioma (0.858), que detecta pero no implica capacidad de procesamiento multilingüe.
- **Rendimiento moderado en tareas visuales finas**: la localización de sellos (0.594), el reconocimiento de escritura manuscrita (0.615) y la detección de firmas (0.652) presentan las puntuaciones más bajas, lo que limita su uso en flujos que dependan de estos elementos.
- **Dependencia de revisión humana**: la model card establece que las predicciones que no superan la validación de extracción se encolan para revisión humana antes de su publicación, lo que implica que el modelo no está diseñado para operar de forma totalmente autónoma en *back-office*.
- **Riesgo de alucinación**: no se documentan medidas específicas de mitigación de alucinaciones ni tasas de error en campos no validados; en tareas de extracción estructurada, una alucinación puede propagarse a sistemas contables.
- **Sesgos**: no se ha publicado información sobre sesgos conocidos, composición demográfica del dataset ni evaluaciones de equidad.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo presentado como interno y con publicación condicional, conviene verificar la versión exacta de los pesos y cualquier restricción adicional no reflejada en la etiqueta de licencia.
- **Falta de transparencia técnica**: la ausencia de datos sobre parámetros, contexto, dataset y formato de pesos dificulta la reproducibilidad y la evaluación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/TUaxhuiax/lumen-doc-v3-release-card

No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
