# TARizvi/bank-txn-parser-qwen2.5-1.5b

## Resumen

`TARizvi/bank-txn-parser-qwen2.5-1.5b` es un ajuste fino del modelo Qwen2.5-1.5B-Instruct de Alibaba, especializado en una única tarea: convertir alertas SMS bancarias y líneas de extracto de entidades indias en JSON estructurado con nueve campos (dirección, importe, canal, contraparte, categoría, referencia, cuenta propia, saldo y fecha). Lo desarrolla TARizvi, un autor individual, y el problema que aborda es muy concreto: los mensajes de transacción india (UPI, IMPS, NEFT, RTGS, tarjeta, ATM, NACH, cheque) son texto semiestructurado, plagado de abreviaturas y de formatos distintos por banco, y extraerlos con expresiones regulares falla en cuanto aparece un comercio o una plantilla nueva.

El modelo parte de una arquitectura transformer decoder-only de 1.543.714.304 parámetros (unos 1,54 mil millones) y se ha entrenado con QLoRA sobre 5.000 ejemplos sintéticos durante 2 épocas, en 40,4 minutos sobre una única Tesla T4. La relevancia práctica está en la comparación publicada por el autor: el ajuste fino alcanza un 98,2 % de coincidencia exacta en los nueve campos sobre formatos y comercios vistos, frente al 80,0 % de un sistema de regex con diccionario de comercios, y mantiene un 72,2 % en formatos o comercios no vistos, donde la regex cae al 31,8 % y el Qwen2.5-1.5B-Instruct sin ajustar se queda en un 17,0 %.

Se distribuye con licencia Apache 2.0, en safetensors y GGUF, e incluye el adaptador LoRA por separado en `adapter/`. Está pensado como un componente de pre-relleno en un pipeline de finanzas personales o de conciliación contable, no como fuente de verdad sobre movimientos de dinero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con ajuste fino QLoRA; no es MoE ni híbrida |
| Parametros totales | 1.543.714.304 (1,54 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No declarada en la ficha del autor; heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 con doble cuantización; pesos publicados en safetensors (torch_dtype auto) y GGUF en el repositorio; el adaptador LoRA se puede cargar sobre el base en bf16/fp16 o 4-bit |
| Idiomas soportados | Inglés (`en`); el dominio de entrada son mensajes bancarios indios, mayoritariamente en inglés con abreviaturas locales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado), GGUF y adaptador PEFT/LoRA en `adapter/` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1,54 mil millones de parámetros, afinado mediante QLoRA sobre `Qwen/Qwen2.5-1.5B-Instruct`. La configuración del adaptador es LoRA con r=16, alpha=32 y despliegue sobre todas las capas lineales, lo que deja 18.464.768 parámetros entrenables, un 1,18 % del total. La base se cuantizó en 4-bit NF4 con doble cuantización durante el entrenamiento, mientras que los pesos finales se publican también en precisión completa y en GGUF.

Los datos de entrenamiento son 5.000 ejemplos sintéticos generados por el propio autor (el generador está en el repositorio de GitHub), que imitan formatos habituales de bancos indios. El entrenamiento fue de 2 épocas, learning rate 2e-4, batch efectivo de 16 y cálculo de pérdida únicamente sobre la respuesta JSON, no sobre el prompt. El pipeline completo de alineación es únicamente supervisado (SFT sobre respuestas correctas): no se documenta RLHF ni DPO. La innovación destacable no es arquitectónica sino de planteamiento: un modelo pequeño, entrenado en menos de una hora con una GPU gratuita, supera ampliamente a la regex y al modelo base en una tarea de extracción muy delimitada, con un vocabulario cerrado de 9 canales (UPI, IMPS, NEFT, RTGS, CARD, ATM, NACH, CHEQUE, BANK) y 21 categorías de gasto.

## Capacidades

- Extracción de información estructurada: convierte texto libre de transacciones bancarias en un objeto JSON con dirección, importe, canal, contraparte, categoría, referencia, cuenta propia, saldo y fecha.
- Clasificación de canal de pago: distingue UPI, IMPS, NEFT, RTGS, CARD, ATM, NACH, CHEQUE y asientos bancarios genéricos.
- Categorización de comercio: 21 categorías predefinidas (food_dining, groceries, shopping, travel, fuel, utilities, telecom, entertainment, healthcare, education, rent, salary, emi_loan, investment, insurance, tax, transfer, cash_withdrawal, bank_charges, interest, refund).
- Salida JSON determinista en formato: con `do_sample=False` y plantilla de chat, el resultado es directamente parseable con `json.loads`.
- Seguimiento de instrucciones conversacionales: hereda el formato de chat de Qwen2.5-Instruct (roles system/user/assistant) y la plantilla `apply_chat_template`.
- Robustez ante variaciones de plantilla: generaliza parcialmente a formatos de mensaje y comercios no vistos durante el entrenamiento (72,2 % de coincidencia exacta).
- Capacidades generales del modelo base (redacción, razonamiento ligero, código) presentes pero degradadas por el ajuste fino especializado; no son el objetivo del repositorio.
- No soporta tool calling nativo, agentes multi-paso, visión, audio ni modo de razonamiento extendido de forma documentada.

## Casos de uso

- Enriquecimiento de alertas SMS en una app de finanzas personales: el modelo recibe el texto de la notificación push o SMS y devuelve JSON listo para insertar en la base de datos; el pipeline puede ejecutarse en local con llama.cpp sobre el GGUF sin enviar datos financieros a la nube.
- Pre-relleno de asientos contables: en una herramienta de conciliación, el parser propone importe, fecha, contraparte y categoría, y una persona o una regla valida antes de contabilizar; encaja con la advertencia del propio autor de no usar la salida como fuente de verdad.
- Clasificación automática de gastos para presupuestos: la categoría predicha permite agrupar transacciones en un panel de gastos por categoría sin mantener un diccionario de comercios actualizado a mano.
- Normalización de extractos bancarios heterogéneos: al procesar líneas de PDF o CSV de distintos bancos indios, el modelo unifica el esquema de salida y reduce el trabajo de mantener una regex por entidad.
- Detección de suscripciones y cargos recurrentes: la combinación de contraparte, canal y categoría (entertainment, telecom, utilities) permite agrupar transacciones para identificar renovaciones automáticas o cargos duplicados.
- Extracción de referencias para conciliación de pagos: el campo de referencia (UPI Ref No, número de cheque, RRN) sirve para casar la transacción con un pedido o una factura en sistemas de e-commerce.
- Etiquetado de datos a escala: como generador de pre-etiquetas para entrenar o evaluar otros modelos de parsing, con revisión humana sobre la fracción de baja confianza.
- Procesamiento por lotes en CPU: con la variante GGUF cuantizada, el modelo cabe en máquinas sin GPU, lo que facilita reprocesar históricos de miles de mensajes en un servidor modesto.

## Benchmarks y rendimiento

Métrica empleada: coincidencia exacta en los nueve campos del JSON (todas las etiquetas correctas a la vez).

| Sistema | Formatos y comercios vistos | Formatos o comercios no vistos |
|---|---|---|
| Regex + diccionario de comercios | 80,0 % | 31,8 % |
| Qwen2.5-1.5B-Instruct, prompt de 4 ejemplos | 17,0 % | 17,0 % |
| Qwen2.5-1.5B + QLoRA (este repositorio) | 98,2 % | 72,2 % |

El conjunto no visto contiene únicamente transacciones con un comercio (Swiggy, Zomato, Myntra, etc.) o un formato de mensaje que no aparece en entrenamiento. El autor indica que los resultados por campo están en `results/` del repositorio de GitHub, pero no se han incluido en la información disponible. No hay datos publicados de MMLU, HumanEval, GSM8K ni de benchmarks generalistas para este ajuste.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,1 GB en bf16/fp16 para los 1,54 mil millones de parámetros, más overhead de activaciones y caché KV; en torno a 1,0-1,2 GB con cuantización de 4 bits (GGUF Q4_K_M).
- GPU recomendadas: el entrenamiento se completó en una Tesla T4 de 16 GB, de modo que cualquier GPU con 8 GB o más es suficiente para inferencia en precisión completa. A100/H100 no son necesarias y solo aportan throughput.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y en tarjetas de 6-8 GB si se usa GGUF de 4 bits. También es viable en CPU con llama.cpp.
- Opciones de despliegue: transformers (código de ejemplo en la model card), PEFT sobre el adaptador de `adapter/`, llama.cpp u Ollama con el GGUF del repositorio, y vLLM o TGI para servir en producción. El repositorio está etiquetado como compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia del orden de magnitud, el entrenamiento de 2 épocas sobre 5.000 ejemplos consumió 40,4 minutos en una T4, lo que sitúa el coste de entrenamiento en menos de una hora de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Coincidencia exacta (vistos / no vistos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bank-txn-parser Qwen2.5-1.5B (este) | 1,54 B | No declarado (heredado del base) | 98,2 % / 72,2 % | Apache 2.0 | HuggingFace: safetensors, GGUF y adaptador LoRA |
| Qwen2.5-1.5B-Instruct (base, 4-shot) | 1,54 B | No declarado en la información disponible | 17,0 % / 17,0 % | Apache 2.0 | HuggingFace |
| Regex + diccionario de comercios | No aplica | No aplica | 80,0 % / 31,8 % | No aplica | Código propio; requiere mantenimiento manual por banco |
| Modelos generalistas mayores (p. ej. Qwen2.5-7B-Instruct) sin ajuste específico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información proporcionada otros ajustes finos publicados para parsing de transacciones bancarias indias con los que comparar directamente.

## Limitaciones y advertencias

- Entrenado sobre datos sintéticos que imitan formatos bancarios indios comunes; los formatos reales de cada entidad varían más, por lo que hay que validar con mensajes propios antes de confiar en él.
- Los nombres de banco del conjunto de entrenamiento son ficticios; los nombres de comercio son marcas reales usadas solo como contraparte, lo que puede introducir sesgos de asociación entre marca y categoría.
- El conjunto no visto baja del 98,2 % al 72,2 % de coincidencia exacta: más de una de cada cuatro transacciones con comercio o plantilla nueva fallará en al menos un campo.
- Riesgo de alucinación relevante: como todo modelo generativo puede producir un importe, una fecha o una referencia plausibles pero incorrectos con alta confianza. El autor recomienda explícitamente usarlo como pre-relleno verificado por una persona o una regla, nunca como fuente de verdad para movimientos de dinero.
- Cobertura lingüística limitada al inglés; no se documenta soporte de transcripciones en hindi u otras lenguas indias, habituales en algunos SMS bancarios.
- Vocabulario de salida cerrado: 9 canales y 21 categorías. Cualquier canal o categoría fuera de esa lista no se representará correctamente sin reentrenar.
- Sesgo geográfico y de dominio: solo India (UPI, IMPS, NEFT, RTGS, NACH); no es trasladable sin más a esquemas europeos como SEPA o a tarjetas con otros formatos de comercio.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre exactitud ni sobre el cumplimiento normativo aplicable a datos financieros.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son de octubre de 2026; es un proyecto individual sin validación externa conocida.
- La longitud de contexto efectiva no está declarada en la ficha; los mensajes bancarios son cortos, así que no debería ser un cuello de botella, pero conviene no asumir la ventana completa del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TARizvi/bank-txn-parser-qwen2.5-1.5b
- Repositorio de código, generador del dataset, baselines y evaluación: https://github.com/Tanzil-Ali-Rizvi/bank-txn-parser-qlora
- Dataset de entrenamiento: https://huggingface.co/datasets/TARizvi/indian-bank-txn-parsing
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos trataban de botánica y biología), por lo que los enlaces anteriores proceden de la información de HuggingFace y de la model card del autor.
