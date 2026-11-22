# titouhiomar/qwen2.5-1.5b-sroie-qlora

## Resumen

El modelo `titouhiomar/qwen2.5-1.5b-sroie-qlora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario de Hugging Face titouhiomar. Su proposito es convertir un modelo conversacional generico de 1.500 millones de parametros en un extractor de informacion clave para tickets de compra (receipts) escaneados: recibe el texto OCR de un ticket y devuelve un objeto JSON con cuatro campos (`company`, `date`, `address`, `total`).

El adaptador se entrena sobre el dataset ICDAR 2019 SROIE en su version deduplicada (`rth/sroie-2019-v2`), con 551 tickets de entrenamiento y 75 de validacion, y se libera bajo licencia Apache 2.0, la misma que el modelo base. Es relevante por su enfoque de bajo coste: el entrenamiento completo se ejecuto en una unica GPU consumer (NVIDIA RTX 5060 Laptop con 8 GB) en unos 30 minutos, con un pico de 4,8 GB de VRAM, lo que demuestra que la extraccion de informacion estructurada con modelos pequenos y QLoRA es viable en hardware de consumo.

No se trata de un modelo autonomo, sino de un adaptador PEFT que requiere cargar el modelo base Qwen2.5-1.5B-Instruct (preferiblemente en 4 bits) y aplicar despues los pesos LoRA. El repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct); el adaptador LoRA es un subconjunto adicional |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, segun la documentacion oficial de Qwen) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con compute en bfloat16 (configuracion de entrenamiento e inferencia recomendada); el adaptador es compatible con otras cuantizaciones del modelo base |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El entrenamiento usa QLoRA: el modelo base se carga en 4 bits (NF4) y se entrenan adaptadores LoRA de rango 16 y alpha 32, con dropout 0,05, sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La optimizacion se realizo durante 3 epocas con learning rate 2e-4, batch size 1 con acumulacion de gradiente 16 y longitud maxima de secuencia de 1280 tokens.

Los datos provienen del dataset ICDAR 2019 SROIE en su version deduplicada, con 551 tickets de entrenamiento y 75 de validacion, con el split de validacion separado por proveedor (vendor) para evitar fuga de informacion. El prompt de entrenamiento es identico al usado en las lineas base de solo prompt, de modo que la mejora medida en el proyecto atribuible al fine-tuning no se debe a un cambio de instrucciones. No se menciona en la informacion disponible el uso de RLHF o DPO; el entrenamiento es supervisado sobre pares entrada-salida.

## Capacidades

- Extraccion de informacion clave de tickets de compra a partir de texto OCR, devolviendo un JSON con los campos `company`, `date`, `address` y `total`.
- Generacion de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Salida estructurada en JSON con instrucciones estrictas de formato (solo el objeto JSON, sin explicaciones).
- Manejo de valores ausentes: el prompt indica devolver `null` cuando un campo no aparece en el ticket.
- Capacidad multilingue limitada: el adaptador esta entrenado y declarado unicamente para ingles.
- No incluye vision: el adaptador no procesa imagenes, solo texto ya OCRizado.
- Soporte de tool calling y function calling: no documentado para el adaptador; el modelo base Qwen2.5-1.5B-Instruct lo soporta, pero el fine-tuning no lo ha reforzado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.

## Casos de uso

- Digitalizacion de tickets en ingles (Malasia): dado el texto OCR de un ticket, el modelo extrae empresa, fecha, direccion y total en un JSON listo para insertar en una base de datos contable. Es adecuado porque el fine-tuning esta especializado exactamente en ese esquema y formato.
- Automatizacion de la contabilidad de gastos: integrado en un pipeline que recibe tickets escaneados, aplica OCR y llama al modelo para generar registros estructurados, reduciendo la introduccion manual de datos en pequenas empresas.
- Procesamiento por lotes en local: al requerir solo unos pocos GB de VRAM, puede ejecutarse en una estacion de trabajo o portatil con GPU consumer para procesar lotes de tickets sin enviar datos a la nube, lo que ayuda al cumplimiento de privacidad.
- Validacion y enriquecimiento de datos historicos: uso del modelo para extraer campos de tickets archivados y compararlos con registros existentes, con revision humana posterior en los importes.
- Prototipado rapido de sistemas de extraccion: el adaptador sirve como base para experimentar con nuevos esquemas de extraccion (anadiendo campos) mediante nuevos fine-tunings LoRA sobre el mismo modelo base.
- Pruebas de robustez frente a inyeccion de prompt: el proyecto incluye tests de inyeccion de instrucciones ocultas en el texto del ticket, por lo que el adaptador puede emplearse como banco de pruebas de defensas en pipelines de extraccion documental.
- Investigacion en extraccion de informacion de bajo coste: como referencia reproducible de que un modelo de 1.500 millones con QLoRA puede abordar tareas de key information extraction con hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del proyecto (`https://github.com/omartitouhi/sroie-receipt-extraction-llm`) para los resultados de evaluacion, pero no incluye cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4 bits (NF4) y el adaptador LoRA, el consumo es de aproximadamente 4-5 GB, coherente con el pico de 4,8 GB registrado durante el entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para la configuracion 4-bit; NVIDIA RTX 5060 Laptop (8 GB) fue suficiente para el entrenamiento.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 5060 y superiores con 8 GB o mas de VRAM.
- Opciones de despliegue: transformers + PEFT + bitsandbytes (configuracion documentada); el modelo base puede servirse con vLLM o TGI, aunque la aplicacion del adaptador LoRA requiere soporte de adaptadores en el servidor; llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, proceso no documentado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| titouhiomar/qwen2.5-1.5b-sroie-qlora | 1.500 M (base) + adaptador LoRA | no disponible (base: 32.768) | Extraccion de tickets SROIE (ingles) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 | Conversacional general | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3.000 M | 32.768 | Conversacional general | Apache 2.0 (Qwen Research para algunos tamanos) | Hugging Face |
| Llama-3.2-1B-Instruct | 1.200 M | 128.000 | Conversacional general | Llama 3.2 Community License | Hugging Face |

La comparativa se limita a modelos de la misma categoria por tamano y tarea; no se dispone de datos de rendimiento del adaptador frente a estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con un unico dataset: tickets malasios en ingles con OCR de SROIE; se espera una caida de rendimiento con otros paises, idiomas, disenos de ticket o motores OCR.
- Parte de los proveedores del conjunto de test aparecen tambien en el entrenamiento, por lo que algunos valores pueden recuperarse de memoria en lugar de leerse del texto; el proyecto reporta resultados separados para proveedores vistos y no vistos.
- El campo `total` puede ser incorrecto o alucinado; se recomienda mantener una revision humana antes de cualquier uso financiero.
- El texto del ticket es una entrada no confiable: el proyecto prueba inyeccion de prompt oculta en el ticket, lo que indica un riesgo real en produccion.
- Los tickets pueden contener datos personales; la ejecucion local del modelo mantiene esos datos en la maquina.
- El adaptador no procesa imagenes: requiere un paso OCR previo.
- El adaptador esta declarado solo para ingles; no se garantiza su comportamiento en castellano u otros idiomas.
- La licencia del adaptador es Apache 2.0, pero los datos de entrenamiento SROIE se publicaron para investigacion (competicion ICDAR 2019); deben revisarse sus terminos antes de un uso comercial.
- El modelo base Qwen2.5-1.5B-Instruct puede presentar sesgos propios de sus datos de preentrenamiento, que el fine-tuning no corrige.

## Enlaces

- Hugging Face: https://huggingface.co/titouhiomar/qwen2.5-1.5b-sroie-qlora
- Repositorio del proyecto (codigo, protocolo y evaluacion): https://github.com/omartitouhi/sroie-receipt-extraction-llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/rth/sroie-2019-v2
