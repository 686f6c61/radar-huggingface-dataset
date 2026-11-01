# tayaee/gamblerinsight-1-llama-3.1-8b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-llama-3.1-8b-smoke`) es un checkpoint de prueba de humo (smoke test) desarrollado por el usuario tayaee, afinado a partir de `unsloth/Llama-3.1-8B-Instruct`. Su proposito no es el uso en produccion, sino validar de extremo a extremo un pipeline de entrenamiento, fusion de adaptadores, publicacion en HuggingFace Hub y servicio con vLLM para un agente financiero con capacidad de tool calling. El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parametros totales.

El modelo esta especializado en razonamiento financiero multi-salto y en la invocacion de dos herramientas concretas: `lookup_stock_price` (snapshot OHLCV de un ticker) y `lookup_technical_indicators` (indicadores tecnicos precalculados como RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergencia y `priced_in_score`). Genera respuestas estructuradas con un bloque de razonamiento `<think>...</think>`, un bloque de pronostico legible por maquina `<forecast_json>...</forecast_json>` y un informe final en lenguaje natural.

Es relevante ahora unicamente como referencia de ingenieria: demuestra el formato de trayectorias de tool calling en dos turnos y la integracion con el parser `hermes` de vLLM. No obstante, al haber sido entrenado solo 10 pasos sobre 16 trayectorias, sus salidas son experimentales y no deben emplearse para decisiones de inversion. La licencia es Apache-2.0 y los idiomas declarados son ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), afinado con LoRA/PEFT |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1 Instruct, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8.000 millones de parametros, y se afina mediante LoRA en BF16/FP16 con PEFT (`lora_bf16`). Los hiperparametros del adaptador son `r=8`, `alpha=16` y `dropout=0.05`. La optimizacion se limita a `max_steps=10`, con `learning_rate=0.0002` y `batch_size=2`. El adaptador se fusiona posteriormente en un checkpoint safetensors estandar para su servicio con vLLM. El entrenamiento se ejecuto en la plataforma DGX Spark GB10.

Los datos de entrenamiento consisten en `minimal_sft_smoke.jsonl`, un conjunto de 16 trayectorias de tool calling en dos turnos. El formato es: peticion del usuario con un ticker, respuesta del asistente con una o varias llamadas a herramientas seguidas de la observacion, y segundo turno del asistente con razonamiento en `<think>`, pronostico en `<forecast_json>` e informe final. La perdida final registrada es de 0,7221 (media 1,1611). No se documenta uso de RLHF ni DPO, ni el volumen de tokens de entrenamiento mas alla de las 16 trayectorias indicadas.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Razonamiento financiero multi-salto orientado a analisis de tickers.
- Tool calling con dos funciones: `lookup_stock_price` y `lookup_technical_indicators`.
- Emision de llamadas a herramientas en formato JSON compatible con el parser `hermes` de vLLM.
- Razonamiento estructurado mediante bloques `<think>...</think>`.
- Generacion de pronosticos legibles por maquina en `<forecast_json>...</forecast_json>`.
- Produccion de informes finales en lenguaje natural tras la observacion de herramientas.
- Integracion con la API OpenAI-compatible (chat completions con `tools` y `tool_choice`).
- No se documentan capacidades de vision, audio ni modo thinking extendido mas alla del bloque `<think>`.

## Casos de uso

- Validacion de pipelines de entrenamiento: sirve para comprobar que el ciclo de afinado LoRA, fusion de adaptadores, subida a HuggingFace Hub y despliegue en vLLM funciona correctamente antes de lanzar entrenamientos reales.
- Pruebas de integracion de tool calling: permite verificar que un orquestador de agentes interpreta correctamente las llamadas a `lookup_stock_price` y `lookup_technical_indicators` y encadena la observacion con el segundo turno.
- Desarrollo de clientes OpenAI-compatibles: al exponerse via vLLM con `--enable-auto-tool-choice` y `--tool-call-parser hermes`, sirve como backend de pruebas para SDKs que consumen `chat.completions.create` con `tools`.
- Pruebas de formato de salida estructurada: util para validar parsers que extraen bloques `<think>` y `<forecast_json>` en entornos de CI antes de conectar un modelo afinado de verdad.
- Benchmarking de latencia en DGX Spark GB10: permite medir tiempos de arranque, health check y throughput de vLLM con un checkpoint de 8B en esa plataforma.
- Demostracion de agentes financieros: escenario controlado para mostrar a interesados el flujo completo de un agente que consulta precios e indicadores tecnicos, siempre con fines de investigacion y sin valor de asesoramiento.
- Pruebas de regresion de plantillas de chat: valida que `apply_chat_template` y el formato de mensajes de Llama 3.1 Instruct se mantienen tras la fusion del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento (final 0,7221, media 1,1611), que no constituye una evaluacion de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para un modelo de 8B en BF16 se requieren aproximadamente 16 GB de pesos; en cuantizaciones de 8 bits o 4 bits el requisito seria menor, pero el autor no documenta cuantizaciones publicadas.
- GPU recomendadas: no especificadas por el autor. El entrenamiento se realizo en DGX Spark GB10; para servicio con vLLM se asume una GPU con memoria suficiente para 8B en BF16.
- Cabe en GPU de consumo: no confirmado en la informacion. Dependera de la cuantizacion aplicada por el usuario.
- Opciones de despliegue: vLLM (con `--enable-auto-tool-choice` y `--tool-call-parser hermes`), cliente OpenAI-compatible y Transformers con `device_map="auto"`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-llama-3.1-8b-smoke | 8.030.261.248 | no disponible | Tool calling financiero (smoke test) | Apache-2.0 | HuggingFace (0 descargas) |
| unsloth/Llama-3.1-8B-Instruct (modelo base) | 8B | no disponible en la informacion | Instrucciones generales | no disponible en la informacion | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo 10 pasos sobre 16 trayectorias: las salidas pueden ser incompletas, inconsistentes o alucinadas.
- Las observaciones de herramientas usadas en entrenamiento son snapshots y pueden estar desactualizadas en inferencia.
- No apto para decisiones de trading en produccion, gestion de carteras ni servicios regulados de asesoramiento de inversion.
- No constituye asesoramiento financiero; ninguna salida debe interpretarse como recomendacion de compra, venta o mantenimiento de valores.
- Sesgos conocidos: no documentados por el autor; al derivar de Llama 3.1 Instruct hereda los sesgos del modelo base.
- Riesgo de alucinacion elevado por el escaso entrenamiento; los bloques `<forecast_json>` pueden contener cifras no respaldadas por las herramientas.
- Idiomas limitados a ingles y coreano; no se declara soporte de castellano.
- Longitud de contexto no confirmada en la informacion; conviene verificar la configuracion de Llama 3.1 antes de usarlo con entradas largas.
- Licencia Apache-2.0 permite uso comercial del checkpoint, pero el modelo base y los datos de entrenamiento pueden imponer condiciones adicionales no detalladas.
- Modelo de investigacion y validacion de ingenieria; requiere supervision humana en cualquier uso real.

## Enlaces

- HuggingFace: https://huggingface.co/tayaee/gamblerinsight-1-llama-3.1-8b-smoke
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
