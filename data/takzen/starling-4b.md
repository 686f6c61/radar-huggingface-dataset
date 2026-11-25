# Takzen/starling-4b

## Resumen

Starling 4B (también conocido como "szpak") es un conjunto de cuatro adaptadores de decisión (LoRA/QLoRA) para tareas de papeleo empresarial en polaco, desarrollado por TAKZEN_DEV. No es un modelo generativo al uso: cada adaptador lee un estado (una cláusula de contrato, una línea de factura o un correo electrónico) junto con una pregunta tipada (elección múltiple o sí/no) y devuelve una probabilidad para cada opción, extraída directamente de los logits de las letras de opción en un único forward pass, sin generar texto.

Los cuatro adaptadores —legal, accounting, procurement y finance— comparten una base congelada, Qwen3.5-4B cuantizada a 4 bits, y se entrenaron a partir de Bullfinch 4B, el modelo general de decisiones en polaco del mismo autor. La propuesta es que cada departamento posea su propio adaptador, de modo que reentrenar uno no altera las respuestas de los demás, y que el conocimiento cambiante (plan contable, matriz de IVA, orden de compra) se incluya en la pregunta en lugar de en los pesos.

El modelo es relevante por su enfoque de "decisiones tipadas" para automatización de procesos de negocio: separa el juicio difuso (¿son el mismo artículo?) del cálculo determinista (importes, cantidades, reglas de política), y aborda el fraude en pagos mediante cinco preguntas literales combinadas con reglas en código, en lugar de intentar clasificar directamente "¿es fraude?". Está pensado para ejecutarse en una GPU de portátil con 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B) con adaptadores LoRA/QLoRA (PEFT) |
| Parametros totales | 4B en la base congelada; parámetros de los adaptadores no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Base en 4 bits (QLoRA); otros tipos no disponibles |
| Idiomas soportados | pl, en |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (adaptadores PEFT); librería `peft` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de 4B parámetros (Qwen3.5-4B) mantenido congelado y cuantizado a 4 bits, sobre el que se entrenan cuatro adaptadores LoRA/QLoRA independientes mediante la librería PEFT. La innovación principal no está en la arquitectura sino en la interfaz: el modelo no genera texto, sino que lee los logits correspondientes a las letras de las opciones (choice) o a sí/no y los convierte en probabilidades calibradas en un solo forward pass.

Los adaptadores se entrenaron desde Bullfinch 4B con datos que incluyen CUAD y ContractNLI (legal), los conjuntos polacos KLEJ (Polemo2-in, DYK, PSC) y PolQA, PLLuM-Align, MASSIVE y EXAMS. Las filas de entrenamiento no legales fueron redactadas por Bielik 11B v3.1, un modelo distinto del usado para generar los datos de evaluación, para evitar fuga de estilo. El adaptador de finanzas se entrenó con cinco preguntas literales (solicitud de pago, cambio de cuenta bancaria, petición de discreción, solicitud de credenciales o datos de tarjeta, referencia a un pedido previo) cuya respuesta es idéntica para facturas reales y falsas; la combinación con hechos externos (proveedor en el maestro, existencia de orden de compra) y el umbral de automatización se aplican en código, con la regla fijada antes de puntuar el test final. No se detalla el número de tokens de entrenamiento.

## Capacidades

- Clasificación de cláusulas legales: 17 hipótesis de ContractNLI (supports / contradicts / does not say) y 13 categorías de CUAD en formato sí/no (responsabilidad ilimitada, renovación automática, no competencia, etc.).
- Asignación contable: selección de la cuenta de gasto adecuada entre 6 cuentas proporcionadas en la pregunta.
- Determinación de tipo de IVA: elección entre 23%, 8%, 5% y exento según la matriz de tipos incluida en las opciones.
- Conciliación de líneas factura–orden de compra: juicio de equivalencia de artículo ignorando cantidad y precio.
- Detección de señales de fraude en pagos: cinco preguntas sí/no sobre el correo electrónico, combinadas externamente con reglas de negocio.
- Salida probabilística calibrada por opción (no generación de texto), apta para umbrales de automatización.
- Capacidades multilingües limitadas a polaco e inglés (documentos legales en inglés con preguntas en polaco).
- No soporta tool calling, agentes ni razonamiento multi-paso en el sentido habitual; la "decisión" es de un solo paso.
- Las preguntas generales deben enrutarse a Bullfinch 4B, ya que los adaptadores de departamento pierden habilidad general.

## Casos de uso

- Revisión automatizada de contratos: el adaptador `legal` evalúa cláusulas NDA frente a hipótesis predefinidas y marca las que contradicen la política de la empresa, con probabilidad calibrada para decidir qué revisa un humano.
- Clasificación de gastos en contabilidad: el adaptador `accounting` asigna cada línea de factura a una cuenta del plan contable incluido en la pregunta; añadir una cuenta nueva no requiere reentrenar.
- Validación de IVA en facturación: el adaptador selecciona el tipo aplicable según la matriz de la empresa, reduciendo errores en la declaración.
- Conciliación de facturas con órdenes de compra: el adaptador `procurement` resuelve la equivalencia difusa entre descripciones de artículo ("Toner HP 59A" frente a "Kaseta z tonerem CF259A") mientras el código compara cantidades e importes.
- Prevención de fraude en pagos a proveedores: el adaptador `finance` responde las cinco señales sobre el correo y un motor de reglas las combina con el maestro de proveedores y la existencia de orden de compra para retener el pago.
- Enrutamiento de triaje documental: un pipeline que recibe correo, contrato y factura y despacha cada documento al adaptador del departamento correspondiente, manteniendo trazas de auditoría separadas por departamento.
- Despliegue en estaciones de trabajo: al ejecutarse en una GPU de 8 GB, permite integrar la decisión en herramientas internas sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados del test (tipos de decisión vistos en entrenamiento) con 400 filas de test y 250 de validación por decisión, comparando Qwen3.5-4B sin ajustar, basal 2.0 4.5B, Bullfinch 4B, Wren 4B y Starling 4B. La información proporcionada se interrumpe durante la fila "NDA stat", por lo que no es posible reproducir los valores numéricos completos.

| Decision | Qwen3.5-4B untuned | basal 2.0 4.5B | Bullfinch 4B | Wren 4B (one adapter) | Starling 4B |
|---|---|---|---|---|---|
| NDA stat | no disponible (texto truncado) | no disponible | no disponible | no disponible | no disponible |

Métricas empleadas: accuracy (%) y ECE (error de calibración, %), además de la proporción de filas respondidas automáticamente con un umbral de como máximo 5% de error fijado en el split de calibración. No se han podido extraer los valores concretos de la información disponible.

## Requisitos de hardware

- VRAM estimada: apto para GPU de 8 GB según el autor (base de 4B en 4 bits más adaptadores LoRA).
- GPU recomendadas: no especificadas; el autor indica que funciona en GPU de portátil con 8 GB.
- Cabe en GPU de consumo: sí, según la afirmación de 8 GB del autor; modelos concretos no disponibles.
- Opciones de despliegue: no se detallan servidores de inferencia estándar; el autor menciona "Bullfinch engine" para la evaluación, y `basal-serve` se usa para el modelo comparativo, no para Starling.
- Latencia y throughput: no disponibles. El coste por documento aumenta porque cada adaptador lee el documento de forma independiente y no se comparte caché de prompt entre departamentos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starling 4B | 4B + 4 adaptadores LoRA | no disponible | Decisiones tipadas multi-adaptador (pl/en) | cc-by-sa-4.0 | Hugging Face (Takzen/starling-4b) |
| Bullfinch 4B | 4B | no disponible | Modelo general de decisiones en polaco, base de Starling | no disponible | Hugging Face (Takzen/bullfinch-4b) |
| Wren 4B | 4B | no disponible | Un único adaptador entrenado con las mismas filas y receta que Starling | no disponible | no disponible |
| basal 2.0 4.5B | 4.5B | no disponible | Modelo de decisión evaluado vía `basal-serve` (GGUF Q8_0) | no disponible | no disponible |

La comparación de rendimiento entre estos modelos está en la tabla de benchmarks de la model card, cuyos valores no se han podido recuperar completos.

## Limitaciones y advertencias

- Cada adaptador especializado pierde habilidad general; las preguntas generales deben enrutarse a Bullfinch 4B.
- El adaptador `finance` no clasifica fraude directamente: en la primera versión aprobó 74 de 125 facturas falsas de un tipo de fraude no visto. La detección depende de la regla en código y de datos externos (maestro de proveedores, órdenes de compra).
- El conocimiento dependiente del contexto (plan contable, matriz de IVA) debe inyectarse en la pregunta; si se omite, la decisión carece de base.
- Idiomas limitados a polaco e inglés; no hay soporte de otros idiomas.
- Licencia CC BY-SA 4.0: impone atribución y compartir-al-igual, lo que puede condicionar el uso comercial propietario.
- No se dispone de datos publicados de sesgos, tasas de alucinación (el modelo no genera texto, pero puede asignar probabilidad alta a opciones incorrectas) ni de robustez fuera de los dominios evaluados.
- El coste de inferencia crece con documentos largos al no poder compartir caché de prompt entre adaptadores.
- El proyecto tiene 0 descargas y 1 like en el momento de la consulta, y fue creado en noviembre de 2026; madurez y soporte comunitario no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Takzen/starling-4b
- Modelo base general: https://huggingface.co/Takzen/bullfinch-4b
- Sitio del autor: https://takzendev.pl/
- Configuración de señales de finanzas: `finance/SIGNALS.json` (referenciado en la model card, dentro del repositorio)
