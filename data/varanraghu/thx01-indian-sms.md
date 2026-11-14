# varanraghu/thx01-indian-sms

## Resumen

THX-01 Indian bank SMS es una exportación ONNX en int8 del modelo base doofz/THX-01, publicada por el usuario varanraghu. No se trata de un modelo generativo de propósito general, sino de un clasificador de decisión diseñado para una única tarea: procesar mensajes SMS de bancos indios y determinar, en una sola pasada forward, dos etiquetas: la dirección del movimiento (debit, credit o not_a_transaction) y el modo de pago (upi, card, atm, auto_debit, netbanking, wallet o unknown).

El modelo está pensado para integrarse en una aplicación Android de seguimiento de gastos que funciona en el propio dispositivo. Su función es estrictamente de clasificación: no extrae importes ni nombres de comercios, que quedan en manos del parser determinista de la aplicación. Esta separación de responsabilidades reduce el riesgo de errores en campos críticos como las cantidades.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de despliegue en producción para un caso de uso muy específico (procesamiento local de SMS bancarios en India), con licencia Apache 2.0 y un tamaño de repositorio de 0,3 GB. La información pública disponible es escasa y no se han publicado benchmarks ni especificaciones detalladas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base doofz/THX-01; exportación ONNX de decisión) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 512 tokens (input ids 2x512 según la model card) |
| Tipos de cuantización | int8 (exportación ONNX) |
| Idiomas soportados | no disponible (orientado a SMS bancarios indios, presumiblemente inglés y transliteraciones) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (thx01-base-int8.onnx) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base doofz/THX-01. La exportación aquí descrita es un artefacto ONNX cuantizado a int8 con una entrada de ids de 2x512 y 8 posiciones de marcador (marker positions), según la model card. El modelo realiza una clasificación conjunta de dos cabezas (dirección y modo de pago) en una sola pasada forward.

El checkpoint publicado corresponde a la exportación int8 sin fine-tuning (un-finetuned int8 export); la model card indica que un checkpoint afinado reemplazará a este tras la evaluación. No se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la propia cuantización int8 para inferencia en dispositivo.

## Capacidades

- Clasificación de dirección de transacción: debit, credit o not_a_transaction.
- Clasificación de modo de pago: upi, card, atm, auto_debit, netbanking, wallet o unknown.
- Respuesta conjunta de ambas preguntas en una única pasada forward.
- Ejecución en dispositivo mediante ONNX Runtime (orientado a Android).
- No genera texto libre ni extrae importes o nombres de comercios.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Capacidades multilingües: no disponibles; el ámbito declarado son SMS bancarios indios.

## Casos de uso

- Seguimiento de gastos en Android: la aplicación ejecuta el modelo ONNX localmente para etiquetar cada SMS bancario entrante como débito, crédito o no transacción, sin enviar datos a la nube.
- Clasificación de modo de pago en registros financieros: asignar automáticamente upi, card, atm, auto_debit, netbanking o wallet a cada movimiento para generar informes por canal de pago.
- Filtrado de ruido en bandejas de SMS: descartar mensajes promocionales o no financieros mediante la etiqueta not_a_transaction antes de pasarlos al parser determinista.
- Preprocesamiento para conciliación bancaria: usar la dirección y el modo de pago como metadatos que alimentan un pipeline posterior de extracción de importes y comercios.
- Aplicaciones de finanzas personales con privacidad por diseño: al ser una exportación int8 de 0,3 GB y ejecutarse en ONNX, permite inferencia offline sin coste de API ni exposición de datos bancarios.
- Prototipado de clasificadores de SMS específicos de dominio: servir como punto de partida (checkpoint base sin fine-tuning) para evaluar y posteriormente sustituir por un checkpoint afinado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 0,3 GB y el formato es int8, por lo que la huella es reducida y apta para CPU.
- GPU recomendadas: no disponibles; el caso de uso declarado es inferencia en dispositivo Android mediante ONNX Runtime.
- GPU de consumo: no se documenta; por tamaño y cuantización, es plausible su ejecución en CPU móvil, pero no hay datos oficiales de latencia.
- Opciones de despliegue: ONNX Runtime (formato nativo del artefacto); otras opciones no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| varanraghu/thx01-indian-sms | Clasificador de decisión (ONNX) | 512 tokens | int8 | Apache 2.0 | Hugging Face |
| doofz/THX-01 (base) | Modelo base del que deriva | no disponible | no disponible | Apache 2.0 (según la model card) | Hugging Face |
| Alternativas de clasificación de SMS bancarios | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información proporcionada otros modelos comparables de la misma categoría y dominio.

## Limitaciones y advertencias

- El checkpoint publicado es la exportación int8 sin fine-tuning; la model card indica que será reemplazado tras la evaluación, por lo que su calidad en producción no está validada públicamente.
- No extrae importes ni nombres de comercios; cualquier expectativa de extracción de entidades queda fuera del alcance del modelo.
- No se documentan sesgos conocidos, pero al estar especializado en SMS bancarios indios puede fallar ante otros dominios, idiomas o formatos de mensaje.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea en mensajes ambiguos o atípicos.
- No hay información sobre el rendimiento en idiomas distintos del ámbito declarado ni sobre cobertura de transliteraciones.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución al modelo base doofz/THX-01.
- Ausencia de benchmarks y de especificaciones del modelo base: no es posible evaluar su precisión frente a alternativas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/varanraghu/thx01-indian-sms
- Modelo base: https://huggingface.co/doofz/THX-01
