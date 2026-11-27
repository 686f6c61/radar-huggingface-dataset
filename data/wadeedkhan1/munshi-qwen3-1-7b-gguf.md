# wadeedkhan1/munshi-qwen3-1.7b-gguf

## Resumen

Munshi es un ajuste fino (fine-tuning) del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el desarrollador independiente wadeedkhan1, especializado en una única tarea: convertir un mensaje corto en roman urdu (urdu escrito con alfabeto latino) de un tendero en una entrada de libro contable estructurada en JSON. Forma parte de Munshi, un asistente de contabilidad offline para pequeñas tiendas en Pakistán, desarrollado para el Qwen Local Hackathon 2026. El modelo base tiene 1.720.574.976 parámetros y una ventana de contexto heredada de Qwen3-1.7B.

El problema que resuelve es muy concreto: extraer seis campos (`type`, `party`, `item`, `qty`, `unit`, `amount`) de frases como "Ahmed ko 5 kilo chawal udhaar diye" y devolver un objeto JSON válido, sin realizar aritmética ni mantener saldos, tareas que en la aplicación se delegan a código determinista. El modelo se distribuye únicamente en formato GGUF cuantizado Q4_K_M (1,1 GB de repositorio), pensado para ejecutarse en local con Ollama o llama.cpp sobre hardware modesto.

Su relevancia radica en la especialización extrema sobre un modelo pequeño: según la model card, supera a Qwen2.5-7B sin ajustar en coincidencia exacta sobre el conjunto de evaluación real (68 % frente a 62 %) con una latencia media inferior (2,35 s frente a 2,62 s) en una RTX 5060 de 8 GB. Es un ejemplo de cómo un LoRA de 21 minutos sobre una base de 1,7B puede resolver una tarea de extracción de nicho mejor que modelos tres veces mayores sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); ajuste fino mediante LoRA sobre base cuantizada a 4 bits (QLoRA) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen/Qwen3-1.7B); el entrenamiento uso max sequence length de 1024 |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | Roman urdu (`ur`); el modelo base Qwen3 soporta multitud de idiomas, pero el ajuste esta especializado en roman urdu |
| Licencia | No disponible |
| Formato de pesos | GGUF (`finetuned-q4_k_m.gguf`); el repositorio no publica safetensors del ajuste |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 1,7B parámetros. El ajuste se realizó con QLoRA: LoRA de rango 16 y alpha 32 sobre una base cuantizada a 4 bits, usando Unsloth y el SFTTrainer de TRL a través del script `paths/nvidia-gpu/train_unsloth.py` del proyecto finetune-anywhere. Los hiperparámetros fueron learning rate 2e-4 con decaimiento lineal y warm-up de Unsloth, 3 épocas (1125 pasos), longitud máxima de secuencia 1024, batch size 1 con acumulación de gradiente 4 y semilla 42. El entrenamiento se ejecutó en local sobre una NVIDIA RTX 5060 de 8 GB bajo WSL2 y duró 21 minutos (1265 s). La pérdida final de entrenamiento fue 0,068; la de validación, 0,110 tras la primera época y 0,097 tras la tercera. La exportación se hizo a GGUF Q4_K_M.

Los datos son completamente sintéticos, generados con `generate_dataset.py` (semilla 42): 1500 ejemplos de entrenamiento, 150 de validación y 150 de evaluación en formato chat. Los mensajes varían la ortografía (`chawal`/`chawl`), las unidades (`kilo`, `darjan`, `bori`), la forma de expresar cantidades (`dedh hazar`, `5k`, `10,000`), el uso de mayúsculas y las muletillas. El split de evaluación usa nombres, artículos y formulaciones reservados, aunque parte de las filas reutilizan formulaciones de entrenamiento y el vocabulario compartido de gastos, por lo que no es completamente out-of-distribution. Además existe un conjunto de evaluación real escrito a mano de 50 mensajes (15 udhaar, 11 payment, 9 sale, 8 expense, 7 purchase) que no aparece en train ni valid. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre pares mensaje-json.

## Capacidades

- Extracción de entidades y estructuración: convierte un mensaje corto en roman urdu en un único objeto JSON con exactamente seis claves (`type`, `party`, `item`, `qty`, `unit`, `amount`).
- Clasificación de tipo de transacción en cinco categorías: `udhaar` (crédito), `payment` (pago de cliente), `sale` (venta al contado), `purchase` (compra de stock) y `expense` (gasto del negocio).
- Normalización de cantidades y unidades: reconoce `kilo`, `litre`, `packet`, `dozen`, `bori` y `piece`, y cantidades expresadas como número, `5k`, `10,000` o `dedh hazar`.
- Robustez ortográfica en roman urdu: tolera variantes como `chawal`/`chawl`, mayúsculas inconsistentes y palabras de relleno.
- Salida JSON estricta: según la evaluación, genera JSON válido en el 100 % de los casos (150/150 sintéticos y 50/50 reales) con temperatura 0.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking; la model card indica explícitamente enviar `"think": false` en Ollama.
- Capacidad multilingüe limitada al roman urdu; el urdu en alfabeto árabe queda fuera del alcance declarado.

## Casos de uso

- Registro de crédito en tienda de barrio: el tendero dicta "Ahmed ko 5 kilo chawal udhaar diye" y el modelo devuelve `{"type": "udhaar", "party": "Ahmed", "item": "chawal", "qty": 5, "unit": "kg", "amount": null}`, que la aplicación guarda tras confirmación del usuario. Es el caso central del proyecto Munshi.
- Cobro de deudas: mensajes como un pago parcial de un cliente se transforman en entradas `payment` con el nombre de la parte y el importe en rupias, lo que permite que el código de la aplicación actualice el saldo pendiente sin intervención manual.
- Venta al contado en mostrador: el modelo extrae tipo `sale`, artículo, cantidad y precio de frases rápidas, alimentando el libro de caja diario de la tienda.
- Compra de stock a proveedor: entradas `purchase` con nombre del proveedor, artículo y cantidad, útiles para llevar inventario y cuentas por pagar.
- Registro de gastos del negocio: con un vocabulario de ocho tipos de gasto en el entrenamiento, el modelo clasifica frases de gasto y rellena el importe cuando aparece en el mensaje.
- Asistente offline en hardware de bajo coste: al pesar 1,1 GB en Q4_K_M y ejecutarse con Ollama o llama.cpp, puede desplegarse en un portátil o mini-PC sin GPU dedicada potente, algo crítico en tiendas sin conectividad fiable.
- Preprocesado para pipelines contables: la salida JSON estricta permite encadenar el modelo con código determinista que calcula saldos y genera informes, manteniendo la aritmética fuera del modelo.
- Evaluación comparativa de ajustes pequeños: sirve como referencia de cómo un LoRA de 21 minutos sobre 1,7B supera a modelos sin ajustar de 3B y 7B en una tarea de extracción vertical.

## Benchmarks y rendimiento

Resultados de `evaluate.py` con temperatura 0 y Ollama. Coincidencia exacta significa acertar los seis campos. Hardware: NVIDIA RTX 5060 (8 GB), Ollama 0.40.18, GGUF Q4_K_M.

| Modelo | Conjunto | Exact match | JSON valido | Por campo (type / party / item / qty / unit / amount) | Latencia media |
|---|---|---|---|---|---|
| qwen3:1.7b (base) | sintetico (150) | 9/150 (6 %) | 150/150 | 49 / 53 / 30 / 54 / 53 / 75 % | 2,25 s |
| Munshi | sintetico (150) | 94/150 (63 %) | 150/150 | 81 / 91 / 79 / 91 / 91 / 96 % | 2,24 s |
| qwen3:1.7b (base) | real (50) | 16/50 (32 %) | 50/50 | 64 / 64 / 64 / 60 / 72 / 82 % | 2,25 s |
| Munshi | real (50) | 34/50 (68 %) | 50/50 | 86 / 98 / 90 / 92 / 94 / 94 % | 2,35 s |
| qwen2.5:7b (sin ajustar) | sintetico (150) | 46/150 (31 %) | 150/150 | 89 / 91 / 48 / 94 / 86 / 86 % | 2,72 s |
| qwen2.5:7b (sin ajustar) | real (50) | 31/50 (62 %) | 50/50 | 76 / 96 / 86 / 94 / 90 / 90 % | 2,62 s |
| llama3.2:3b (sin ajustar) | sintetico (150) | 5/150 (3 %) | 150/150 | 61 / 57 / 34 / 66 / 49 / 71 % | 2,39 s |
| llama3.2:3b (sin ajustar) | real (50) | 3/50 (6 %) | 50/50 | 52 / 64 / 64 / 66 / 52 / 76 % | 2,33 s |

El error más frecuente es predecir `payment` como `udhaar` (12/150 en sintético y 4/50 en real), normalmente con formulaciones ausentes del entrenamiento. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF Q4_K_M ocupa aproximadamente 1,1 GB; con overhead de contexto y runtime, cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer con 4-8 GB basta; la model card reporta ejecución y evaluación en una NVIDIA RTX 5060 de 8 GB. Para mayor throughput, A100 o H100 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en RTX 3060/4060/5060, GTX 1660 y similares; también puede ejecutarse en CPU mediante llama.cpp.
- Opciones de despliegue: Ollama (flujo documentado con el `Modelfile` del repositorio, que incorpora el system prompt), llama.cpp y cualquier runtime compatible con GGUF. Los tags del repositorio incluyen `endpoints_compatible`.
- Latencia y throughput: latencia media de 2,24-2,35 s por petición en RTX 5060 con Ollama, según la evaluación del autor. Throughput no disponible.
- Nota operativa: es imprescindible enviar el system prompt exacto de entrenamiento y `"think": false`; sin él, el modelo no produce entradas de libro contable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exact match (real) | Licencia | Formato |
|---|---|---|---|---|---|
| Munshi (Qwen3-1.7B + QLoRA) | 1,7B | No disponible | 68 % (34/50) | No disponible | GGUF Q4_K_M |
| Qwen3-1.7B base | 1,7B | No disponible | 32 % (16/50) | No disponible en la informacion proporcionada | Multiples (no detallado) |
| Qwen2.5-7b sin ajustar | 7B | No disponible | 62 % (31/50) | No disponible en la informacion proporcionada | Multiples (no detallado) |
| Llama 3.2-3b sin ajustar | 3B | No disponible | 6 % (3/50) | No disponible en la informacion proporcionada | Multiples (no detallado) |

La comparación relevante es contra las bases sin ajustar evaluadas por el propio autor: Munshi supera a Qwen2.5-7B en coincidencia exacta real (68 % frente a 62 %) con menos de una cuarta parte de los parámetros y menor latencia, y multiplica por más de diez el resultado de Llama 3.2-3B. No se dispone de comparación con otros ajustes especializados en roman urdu o extracción contable.

## Limitaciones y advertencias

- Vocabulario sintético muy reducido: 25 nombres, 12 artículos, 6 unidades y 8 tipos de gasto en entrenamiento. Artículos, nombres o unidades fuera de esa lista quedan fuera del alcance.
- No maneja múltiples artículos por mensaje ni urdu en alfabeto árabe; ambos casos están declarados fuera de alcance.
- Sesgo gramatical en los datos: todas las ventas usan el verbo masculino "becha" y llevan precio, por lo que "bechi"/"beche" o una venta sin precio puede etiquetarse erróneamente como `purchase`.
- Confusión sistemática entre `payment` y `udhaar` con formulaciones no vistas (12/150 en sintético, 4/50 en real).
- Dependencia estricta del system prompt de entrenamiento: sin él, el modelo no genera entradas de libro contable. Cualquier integración debe reproducirlo exactamente.
- No realiza aritmética ni mantiene saldos; el `amount` es `null` si el precio no aparece en el mensaje, y el modelo está entrenado para no adivinar precios.
- El conjunto de evaluación sintético no es completamente out-of-distribution, ya que reutiliza formulaciones y vocabulario de gastos del entrenamiento; los resultados deben interpretarse con cautela.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación en campos como `party` o `item` cuando el mensaje es ambiguo; la aplicación exige confirmación humana de cada entrada antes de guardarla.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema mínimo, sin validación independiente de terceros.
- El modelo solo extrae; no debe usarse para asesoramiento financiero o legal ni para guardar entradas sin revisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wadeedkhan1/munshi-qwen3-1.7b-gguf
- Repositorio del proyecto Munshi: https://github.com/wadeedkhan1/munshi
- Dataset sintético y scripts de generación: https://github.com/wadeedkhan1/munshi/tree/master/data
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Proyecto finetune-anywhere (script de entrenamiento referenciado): no disponible
- Paper o blog técnico del ajuste: no disponible
- Demo en línea: no disponible
