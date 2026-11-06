# tayaee/gamblerinsight-1-qwen3-32b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-qwen3-32b-smoke`) es un checkpoint de ajuste fino del modelo `Qwen/Qwen3-32B` orientado a razonamiento financiero multi-salto y a la emisión de llamadas a herramientas (tool calling) sobre datos de mercado. Lo desarrolla el usuario `tayaee` y su propósito declarado no es el uso en producción, sino la validación de extremo a extremo de una tubería de entrenamiento: construcción de trayectorias de tool calling en dos turnos, fusión del adaptador LoRA en un checkpoint safetensors estándar y despliegue en Hugging Face Hub para servido con vLLM.

El modelo hereda la arquitectura transformer densa de Qwen3-32B, con 32.762.123.264 parámetros totales según los pesos safetensors publicados. El ajuste se realizó mediante LoRA en BF16/FP16 con PEFT sobre la plataforma DGX Spark GB10, con hiperparámetros muy reducidos: rango 8, alpha 16, dropout 0.05, 10 pasos de optimización y un conjunto de solo 16 trayectorias. La pérdida final registrada fue de 0.7514 (media 1.0313).

Su relevancia es acotada y conviene entenderla bien: sirve como referencia de ingeniería para quien quiera replicar el formato de trayectorias financieras con bloques `<think>`, `<forecast_json>` y herramientas `lookup_stock_price` y `lookup_technical_indicators`, no como un modelo con calidad de razonamiento financiero demostrada. La licencia Apache-2.0 y el tamaño del repositorio (65,5 GB) condicionan su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-32B) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer denso de 32,7 mil millones de parámetros, y se ajusta con LoRA mediante PEFT en precisión BF16/FP16 (`lora_bf16`). Los hiperparámetros documentados son rango 8, alpha 16, dropout 0.05, tasa de aprendizaje 2e-4, tamaño de lote 2 y 10 pasos de optimización sobre el fichero `minimal_sft_smoke.jsonl`, que contiene 16 trayectorias. El adaptador se fusiona posteriormente en un checkpoint safetensors estándar, lo que explica que el repositorio ocupe 65,5 GB y que los pesos se puedan cargar con `AutoModelForCausalLM` sin necesidad de PEFT.

La innovación técnica no está en la arquitectura, sino en el formato de datos de entrenamiento: trayectorias de dos turnos en las que el asistente emite una o varias llamadas a herramientas financieras, recibe la observación de la herramienta y, en el segundo turno, produce un razonamiento envuelto en `<think>...</think>`, un bloque de pronóstico legible por máquina en `<forecast_json>...</forecast_json>` y un informe final en lenguaje natural. No se documenta uso de RLHF, DPO ni datos de preferencia; tampoco se especifica el volumen de tokens de entrenamiento más allá de las 16 trayectorias citadas.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con plantilla de chat compatible con transformers.
- Razonamiento financiero multi-salto sobre un ticker: solicitud de precio y de indicadores técnicos antes de emitir un análisis.
- Tool calling con dos funciones predefinidas: `lookup_stock_price` (campos `ticker`, `close`, `open`, `high`, `low`, `volume`, `timestamp`) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergence, `priced_in_score`).
- Emisión de llamadas en formato JSON compatible con el parser `hermes` de vLLM y con `--enable-auto-tool-choice`.
- Modo de razonamiento explícito mediante bloques `<think>`, heredado del estilo de Qwen3.
- Salida estructurada de pronóstico en `<forecast_json>` junto a un informe legible.
- No se documentan capacidades de visión, audio, agentes autónomos de largo horizonte ni matemáticas avanzadas más allá de lo que herede del modelo base.

## Casos de uso

- Validación de tuberías de entrenamiento: el caso de uso declarado por el autor. Sirve para comprobar que el ciclo LoRA, fusión de adaptador, subida al Hub y servido con vLLM funciona de extremo a extremo antes de lanzar un entrenamiento real.
- Pruebas de integración de tool calling: permite verificar que un cliente OpenAI-compatible negocia correctamente las funciones `lookup_stock_price` y `lookup_technical_indicators` y que el parser `hermes` interpreta las llamadas.
- Desarrollo de esquemas de salida estructurada: el par `<think>` + `<forecast_json>` + informe es un patrón reutilizable para diseñar contratos de salida en asistentes financieros, independientemente de la calidad final del modelo.
- Pruebas de carga y latencia en infraestructura propia: al ser un checkpoint de 32,7 mil millones de parámetros, permite medir throughput y consumo de VRAM en el hardware objetivo (por ejemplo, DGX Spark GB10) antes de comprometer recursos con un modelo mayor.
- Prototipado de interfaces de análisis técnico: un frontend puede consumir el bloque `forecast_json` para renderizar indicadores y el informe para mostrarlo al usuario, sin que el modelo tenga que generar la capa de presentación.
- Docencia y demostración de ajuste fino: el repositorio documenta hiperparámetros y formato de datos, lo que lo convierte en un ejemplo didáctico de SFT con LoRA sobre un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65 GB solo para pesos, más overhead de contexto y caché KV; en la práctica se necesitan GPUs con 80 GB o reparto multi-GPU.
- Cuantización a 8 bits: en torno a 33 GB de pesos, viable en una A100 40 GB o H100 80 GB con margen para contexto.
- Cuantización a 4 bits: en torno a 17-20 GB de pesos, lo que permitiría ejecución en una RTX 4090 (24 GB) con contexto limitado; el autor no publica variantes GGUF ni AWQ/GPTQ, por lo que habría que generarlas.
- GPU recomendadas: H100 80 GB, A100 80 GB o A100 40 GB con cuantización; el autor cita la DGX Spark GB10 como plataforma de construcción.
- Despliegue: vLLM con `--enable-auto-tool-choice --tool-call-parser hermes`, transformers con `device_map="auto"`, o TGI (el tag `text-generation-inference` está presente en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-qwen3-32b-smoke | 32,7 B | no disponible | Finanzas + tool calling (smoke test) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-32B (base) | 32,7 B | no disponible en la informacion | Propósito general, razonamiento | Apache-2.0 | Hugging Face |
| Alternativas financieras de 30-34 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base: este checkpoint añade el formato de trayectorias financieras y las dos herramientas, pero con solo 10 pasos de entrenamiento no cabe esperar una mejora medible frente a Qwen3-32B en tareas financieras generales. No se dispone de datos de benchmarks que permitan cuantificar la diferencia.

## Limitaciones y advertencias

- Entrenado únicamente durante 10 pasos sobre 16 trayectorias: las salidas pueden ser incompletas, inconsistentes o directamente alucinadas, tal como advierte el propio autor.
- No apto para decisiones de trading, gestión de carteras ni asesoramiento financiero regulado; el autor lo declara explícitamente fuera de alcance.
- Las observaciones de herramientas vistas en entrenamiento son instantáneas y pueden estar obsoletas en el momento de la inferencia; el modelo no tiene acceso a datos de mercado en vivo por sí mismo.
- Idiomas limitados a inglés y coreano; el castellano no está cubierto de forma declarada.
- No se documentan sesgos específicos, pero al derivar de Qwen3-32B hereda los del modelo base, no evaluados en esta ficha.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de calidad demostrada y la advertencia del autor desaconsejan cualquier despliegue en producción sin una evaluación propia exhaustiva.
- El tag `qwen2.5` en el repositorio es inconsistente con el modelo base declarado (`Qwen/Qwen3-32B`); conviene verificar la tokenización y la plantilla de chat antes de integrarlo.
- No hay variantes cuantizadas publicadas, lo que obliga a generarlas para despliegues en GPUs de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-qwen3-32b-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Ficha de terceros (registro de metadatos): https://free2aitools.com/model/tayaee/gamblerinsight-1-qwen3-32b-smoke
