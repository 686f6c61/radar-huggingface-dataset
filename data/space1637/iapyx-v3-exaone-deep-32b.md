# space1637/iapyx-v3-exaone-deep-32b

## Resumen

iapyx-v3-exaone-deep-32b es un ajuste fino (fine-tuning) del modelo LGAI-EXAONE/EXAONE-Deep-32B, desarrollado por el equipo Iapyx (Team Iapyx, "AI Life Guardian", track nacional de IA) para la final del concurso 2026 AI Rookie. Se entrenó con QLoRA de 4 bits (NF4, r=16) sobre 2 GPU A100 de 80 GB. El autor lo publica como artefacto derivado, con licencia "other" heredada del modelo base y uso declarado exclusivamente de investigación y competición.

El modelo no es un asistente conversacional de propósito general: está especializado en seis tareas concretas de un producto de asesoramiento (JSON estructurado, selección de herramientas, extracción de campos de documentos, verificación de cálculos, refinado de expresiones y terminología jurídica). La lógica de decisión determinista la aporta el producto; el modelo aprende a rellenar plantillas, elegir herramientas y revisar resultados. Según la model card, el rendimiento en el conjunto de evaluación interno pasa de una media de 0,114 a 0,946 en cinco tareas.

Es relevante ahora porque ejemplifica el patrón de "modelo pequeño ajustado sobre modelo grande" para dominios regulados: en lugar de desplegar un LLM generalista, se parte de un modelo de 32 000 millones de parámetros y se le enseña una interfaz estricta. El repositorio ocupa 0,1 GB y las etiquetas indican safetensors, lo que sugiere que se publican adaptadores y no los pesos completos, aunque esto no se explicita en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada del modelo base LGAI-EXAONE/EXAONE-Deep-32B (el ajuste no detalla su propia arquitectura) |
| Parametros totales | 32 000 millones (corresponden al modelo base; el ajuste no declara su propio recuento) |
| Longitud de contexto | no disponible (la model card solo indica longitud máxima de entrenamiento de 2048 tokens) |
| Tipos de cuantizacion | Entrenamiento con QLoRA 4-bit NF4 (r=16). No se declaran cuantizaciones publicadas para inferencia |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (EXAONE AI Model License, uso de investigación según la model card) |
| Formato de pesos | safetensors (según las etiquetas del repositorio) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 |

## Arquitectura y entrenamiento

El ajuste se aplica sobre LGAI-EXAONE/EXAONE-Deep-32B, un modelo de 32 000 millones de parámetros de LG AI Research. La model card no describe innovaciones arquitectónicas propias: no hay decodificación especulativa, atención lineal ni mezcla de expertos declaradas. La intervención es puramente de adaptación de parámetros mediante QLoRA con cuantización de 4 bits en formato NF4 y rango r=16, sobre dos A100 de 80 GB.

La configuración de entrenamiento documentada es: 10 épocas con mejor época en la 2 (pérdida de evaluación 0,30947935581207275), learning rate 0,0002, batch 4 con acumulación 4 sobre 1 GPU, longitud máxima 2048, tiempo total 43 755,3 segundos y partición de 11 018 ejemplos de entrenamiento y 1130 de evaluación. La pérdida se calcula únicamente sobre los tokens del asistente. Los datos son SFT sintético generado por el generador de reglas del producto para riesgo, selección de herramientas, extracción de documentos y verificación; para la tarea de expresión las respuestas provienen de la API K-EXAONE (con el razonamiento desactivado) y solo se conservaron aquellas que superaron comprobaciones numéricas y de longitud; para terminología jurídica se usó JusWis/korean-legal-terminology (CC BY 4.0). La model card afirma que no se emplearon modelos extranjeros en datos, entrenamiento ni evaluación.

La curva de pérdida de evaluación por época muestra sobreajuste a partir de la época 2: 0,3189 (época 1), 0,3095 (2), 0,3146 (3), 0,3297 (4), 0,3536 (5), 0,3901 (6), 0,4358 (7), 0,4745 (8), 0,5074 (9) y 0,5206 (10).

## Capacidades

- Generación de salida estructurada en JSON conforme a esquemas fijos ("칸", casillas predefinidas).
- Selección de herramientas (tool calling) dentro de un catálogo cerrado: 0,995 de exactitud en el conjunto de evaluación interno.
- Extracción de campos de documentos: F1 de 0,996 según la model card.
- Clasificación de nivel de riesgo: macro-F1 de 1,000 en la evaluación interna.
- Verificación y recálculo ("검산"): 0,788 de coincidencia exacta total, es decir, aproximadamente un 21 % de casos sin coincidencia exacta.
- Refinado de expresiones con criterios de seguridad: 0,950 de tasa de seguridad.
- Terminología jurídica en coreano: chrF de 0,122.
- Razonamiento multi-paso: no documentado explícitamente; el producto aporta las reglas deterministas y el modelo ejecuta la tarea asignada.
- Capacidades multilingües: solo coreano declarado.
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Clasificación de riesgo en flujos de asesoramiento: el modelo asigna un nivel de riesgo a cada caso con macro-F1 de 1,000 sobre el conjunto de evaluación del autor, lo que permite encaminar casos a revisión humana o a resolución automática.
- Enrutado de herramientas en agentes: con 0,995 de exactitud seleccionando entre herramientas predefinidas, encaja como capa de decisión en un agente cuyo plan global lo fija un orquestador determinista.
- Digitalización de formularios y documentos coreanos: extracción de campos con F1 de 0,996 para volcar documentos en bases de datos estructuradas.
- Verificación de cálculos en procesos administrativos o financieros: el modelo revisa operaciones y marca discrepancias, con la advertencia de que solo el 78,8 % de los casos coinciden exactamente y el resto requiere validación posterior.
- Moderación y reescritura de respuestas al cliente: la tasa de seguridad del 0,950 permite usar el modelo como filtro de expresiones antes de enviar un mensaje.
- Normalización terminológica en textos jurídicos coreanos: mejora el chrF de 0,103 a 0,122, por lo que resulta útil solo como apoyo y no como sustituto de un terminólogo.
- Generación de borradores JSON para pipelines internos: al producir salidas con esquema fijo, se puede encadenar a validadores de esquema y a sistemas de colas sin post-procesado complejo.
- Investigación y reproducción académica: con licencia de investigación y código en un repositorio público, sirve para estudiar QLoRA sobre modelos coreanos de 32B.

## Benchmarks y rendimiento

Las cifras proceden del conjunto de evaluación interno del autor (1130 ejemplos, mismo código de puntuación antes y después del ajuste). No son comparables con MMLU, HumanEval o GSM8K.

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Macro-F1 de nivel de riesgo | 0,000 | 1,000 |
| Exactitud de selección de herramienta | 0,270 | 0,995 |
| F1 de campos de documento | 0,012 | 0,996 |
| Coincidencia exacta de verificación | 0,000 | 0,788 |
| Tasa de seguridad de expresión | 0,290 | 0,950 |
| chrF de terminología jurídica | 0,103 | 0,122 |
| Media de 5 tareas (sin dominio) | 0,11444308717379234 | 0,9456926254003086 |

Latencia declarada: 2,5962 segundos por generación en modo batch sobre A100.

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Entrenamiento declarado: 2 GPU A100 de 80 GB con QLoRA 4-bit NF4, batch 4, acumulación 4, longitud máxima 2048.
- Los pesos completos del modelo base de 32 000 millones de parámetros requieren aproximadamente 64 GB de VRAM en FP16, 32 GB en int8 y 16-18 GB en 4 bits (estimaciones a partir del tamaño del modelo base, no publicadas por el autor).
- El repositorio ocupa 0,1 GB, lo que es coherente con la publicación de adaptadores LoRA en lugar de pesos completos; en ese caso es necesario descargar aparte el modelo base LGAI-EXAONE/EXAONE-Deep-32B.
- GPU de gama alta recomendadas: A100 80 GB, H100, o dos GPU de 48 GB. En configuración de 4 bits, una RTX 4090 o RTX 3090 de 24 GB podría alojar el modelo base con contexto reducido, aunque esto no está verificado en la información disponible.
- Opciones de despliegue: no documentadas por el autor. Habría que verificar el soporte de la arquitectura EXAONE en vLLM, TGI, llama.cpp u Ollama antes de elegir runtime.
- Throughput y latencia: solo se declara 2,5962 s por generación en batch sobre A100; no hay datos de tokens por segundo ni de latencia en otras configuraciones.

## Comparativa con modelos similares

La información disponible solo permite comparar el ajuste con su propio modelo base antes del entrenamiento, usando las métricas internas del autor. No hay datos publicados que permitan compararlo con alternativas de otros fabricantes.

| Modelo | Parametros | Contexto | Rendimiento en las 6 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iapyx-v3-exaone-deep-32b | 32 000 millones (base) | no disponible | Media de 5 tareas: 0,946 | other (EXAONE AI Model License, investigación) | HuggingFace, 0 descargas |
| LGAI-EXAONE/EXAONE-Deep-32B (base) | 32 000 millones | no disponible en esta ficha | Media de 5 tareas: 0,114 (medida por el autor) | EXAONE AI Model License | HuggingFace |
| Otras alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: únicamente coreano declarado. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Licencia: hereda la EXAONE AI Model License, que la model card califica de uso investigador. El uso comercial requiere revisar los términos del modelo base con detalle antes de cualquier despliegue.
- Sobreajuste: la pérdida de evaluación mínima se alcanza en la época 2 y crece de forma monótona hasta 0,5206 en la época 10, con solo 11 018 ejemplos de entrenamiento.
- Evaluación interna: las métricas de 0,946 de media proceden de conjuntos sintéticos generados por las reglas del propio producto y de un held-out del mismo origen, no de benchmarks independientes.
- Riesgo de alucinación: el 21,2 % de los casos de verificación no coinciden exactamente, por lo que la validación humana o un verificador determinista sigue siendo necesaria.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; ninguna evaluación de terceros.
- Dependencia de datos sintéticos: parte del SFT se generó con reglas del producto y con la API K-EXAONE, de modo que puede heredar sus sesgos y errores sistemáticos.
- Terminología jurídica: la mejora de chrF es marginal (0,103 a 0,122); no es fiable como traductor o normalizador jurídico autónomo.
- Trazabilidad de artefactos: el repositorio de 0,1 GB sugiere adaptadores, pero la model card no especifica si se publican pesos fusionados ni cómo cargarlos.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, cultural o de género.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/space1637/iapyx-v3-exaone-deep-32b
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-Deep-32B
- Repositorio de reproducción (carpeta finetune-v3): https://github.com/AIROOKIE-S/iapyx
- Informe y evaluación originales: https://huggingface.co/datasets/space1637/iapyx-finetune-report
- Dataset de terminología jurídica coreana: JusWis/korean-legal-terminology (CC BY 4.0)
- La búsqueda web realizada no ha devuelto resultados relacionados con este modelo.
