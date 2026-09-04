# XiaoDaZhen/pitstop-slot-v7

## Resumen

El modelo `XiaoDaZhen/pitstop-slot-v7` es un modelo discriminativo de selección de span diseñado para extraer ranuras (slots) de lenguaje contable oral en chino. Desarrollado por XiaoDaZhen, se publica bajo licencia MIT y se integra en la librería `pitstop`, un motor de inferencia en Dart puro que consume pesos en formato `.ptw` (PTSW), sin dependencias de GGUF, llama.cpp ni otros frameworks habituales.

El modelo tiene aproximadamente 4,4 millones de parámetros (4.421.376), con una arquitectura de 4 capas, 4 cabezas de atención y una dimensión oculta de 256. Su vocabulario es de 851 tokens, a nivel de carácter con fallback de byte. El peso se almacena en int8 por filas y se descuantiza a f32 durante la carga, ocupando un archivo de 4,49 MB. Su propósito es resolver la extracción de campos como categoría, importe, fecha, litros, grados, nombre de proyecto y notas a partir de frases habladas o escritas en chino, con un enfoque on-device.

La relevancia del modelo radica en su tamaño extremadamente reducido y su formato de pesos propietario, orientado a aplicaciones móviles o embebidas donde se requiere inferencia local sin dependencias pesadas. Los resultados de evaluación muestran un buen rendimiento en conjuntos estándar y reales, aunque con una caída notable en datos no vistos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo discriminativo de selección de span (encoder con capas L=4, cabezas 4, ancho H=256) |
| Parametros totales | 4.421.376 (aprox. 4,4 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 por filas (descuantizado a f32 en carga) |
| Idiomas soportados | Chino (entrada solo en chino) |
| Licencia | MIT |
| Formato de pesos | `.ptw` (formato PTSW) |

## Arquitectura y entrenamiento

El modelo es un extractor de ranuras de tipo discriminativo, es decir, selecciona spans dentro de una secuencia de entrada para identificar los campos objetivo. Según la información disponible, la arquitectura consta de 4 capas, 4 cabezas de atención y una dimensión oculta de 256, con un vocabulario de 851 tokens basado en caracteres con fallback de byte. Los pesos se almacenan en int8 por filas y se descuantizan a f32 durante la carga, lo que reduce el tamaño del archivo a 4,49 MB.

No se han proporcionado datos sobre el corpus de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. La evaluación publicada se centra en cinco conjuntos de validación (standard, real, refuse, unseen e implicit) que miden el acierto conjunto de los campos clave (categoría, importe y fecha). El modelo está diseñado para ser consumido por el motor `pitstop` en Dart puro, sin dependencias de frameworks de inferencia estándar.

## Capacidades

- Extracción de ranuras en chino: categoría, importe, fecha, litros, grados, nombre de proyecto y notas.
- Inferencia on-device mediante motor Dart puro, sin necesidad de GGUF, llama.cpp ni otros motores.
- Formato de pesos ligero (4,49 MB) con cuantización int8, adecuado para dispositivos con recursos limitados.
- Soporte de entrada de texto en chino, orientado a lenguaje contable oral.
- No se han documentado capacidades de tool calling, function calling, razonamiento multi-step, visión o audio.

## Casos de uso

- Registro de gastos por voz en aplicaciones móviles: el modelo extrae automáticamente la categoría, el importe y la fecha de frases dictadas en chino, permitiendo una captura rápida sin introducción manual.
- Asistente contable para pequeñas empresas: integración en sistemas de gestión para parsear notas de gastos orales o escritas, reduciendo el tiempo de transcripción.
- Automatización de entrada de datos en ERP: extracción de campos de recibos o notas manuscritas digitalizadas, alimentando directamente los formularios del sistema.
- Aplicaciones de finanzas personales con reconocimiento de voz: el modelo se ejecuta localmente y convierte dictados de gastos en registros estructurados, preservando la privacidad del usuario.
- Herramienta de accesibilidad para personas con discapacidad visual: permite dictar compras o gastos y obtener un registro estructurado sin depender de servicios en la nube.
- Procesamiento de mensajes de chat o notas de texto en chino: extracción de transacciones mencionadas en conversaciones, útil para bots de contabilidad o recordatorios de gastos.

## Benchmarks y rendimiento

La información proporcionada incluye los siguientes resultados de evaluación, donde el "slot clave" se define como el acierto simultáneo de categoría, importe y fecha:

| Conjunto | Tasa de acierto de slot clave |
|---|---|
| standard | 100,0 % |
| real | 94,5 % |
| refuse | 93,2 % |
| unseen | 59,1 % |
| implicit | 90,0 % |

Además, se reporta la precisión por cabeza en un conjunto de validación sintético:

| Campo | Precisión |
|---|---|
| cat | 0,966 |
| num | 1,000 |
| date | 0,996 |
| span | 1,000 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM o GPU.
- Por su tamaño (4,4 M parámetros, archivo de 4,49 MB), el modelo puede ejecutarse en CPUs y dispositivos móviles sin necesidad de aceleración gráfica.
- No se han documentado opciones de despliegue mediante vLLM, llama.cpp, Ollama o TGI; el motor de inferencia es el cliente `pitstop` en Dart puro.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se han identificado modelos comparables en la información disponible. El formato de pesos propietario `.ptw` y el enfoque on-device en Dart lo diferencian de los modelos de extracción de slots basados en Transformers convencionales.

## Limitaciones y advertencias

- El modelo solo admite entrada en chino; no soporta otros idiomas.
- El rendimiento en el conjunto "unseen" es significativamente inferior (59,1 % en el slot clave), lo que indica una generalización limitada a datos no vistos.
- No se han proporcionado datos sobre sesgos, riesgo de alucinación o comportamiento en casos límite.
- El formato de pesos `.ptw` es propietario y no es compatible con frameworks estándar como safetensors o GGUF, lo que limita la interoperabilidad.
- La licencia MIT permite uso comercial, pero el formato propietario y la dependencia del motor `pitstop` pueden suponer una restricción práctica en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/XiaoDaZhen/pitstop-slot-v7
