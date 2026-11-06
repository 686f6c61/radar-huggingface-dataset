# tayaee/gamblerinsight-1-qwen2.5-7b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-qwen2.5-7b-smoke`) es un checkpoint de prueba de humo (smoke test) publicado por el usuario `tayaee` en Hugging Face. Se trata de un ajuste fino del modelo `Qwen/Qwen2.5-7B-Instruct` orientado a razonamiento financiero multi-salto y a la actuación como agente con tool calling. Según la model card, el objetivo declarado no es ofrecer un modelo listo para producción, sino validar de extremo a extremo la tubería de entrenamiento, fusión del adaptador LoRA en un checkpoint safetensors estándar y despliegue en el Hub para servir con vLLM.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los pesos safetensors del repositorio (15,2 GB). El ajuste se realizó mediante LoRA en BF16/FP16 con PEFT (r=8, alpha=16, dropout=0,05), sobre un conjunto mínimo de 16 trayectorias (`minimal_sft_smoke.jsonl`) y tan solo 10 pasos de optimización, con una pérdida final de 0,8317. Es, por tanto, un artefacto de ingeniería más que un modelo entrenado de forma sustantiva.

Su relevancia es limitada y muy específica: sirve como referencia reproducible de un pipeline de fine-tuning con tool calling estructurado, con un formato de trayectoria de dos turnos que combina llamadas a herramientas financieras, un bloque de razonamiento `<think>...</think>` y un bloque de pronóstico legible por máquina `<forecast_json>...</forecast_json>`. No debe confundirse con un modelo financiero operativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA/PEFT |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct, sin dato explicito) |
| Tipos de cuantizacion | no disponible (repo publicado en safetensors; el autor solo documenta despliegue en vLLM y Transformers) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only con atención causal. Sobre él se aplicó un ajuste fino con LoRA mediante PEFT en precisión BF16/FP16 (`lora_bf16`), con rango r=8, alpha=16 y dropout de 0,05. La optimización se limitó a `max_steps=10`, `learning_rate=0,0002` y `batch_size=2`. El adaptador resultante se fusionó en un checkpoint safetensors estándar, que es lo que se publica en el repositorio.

Los datos de entrenamiento consisten en `minimal_sft_smoke.jsonl`, un conjunto de 16 trayectorias de tool calling de dos turnos. En el primer turno el usuario solicita un análisis financiero sobre un ticker; el asistente emite una o varias llamadas a herramientas (`lookup_stock_price`, `lookup_technical_indicators`) seguidas de una observación de herramienta; en el segundo turno el asistente produce razonamiento envuelto en `<think>...</think>`, un bloque `<forecast_json>...</forecast_json>` y un informe final en lenguaje natural. No se documenta el uso de RLHF ni DPO, ni el volumen de tokens de entrenamiento más allá de las 16 trayectorias citadas. El build se realizó en una plataforma DGX Spark GB10.

## Capacidades

- Generación de texto conversacional en inglés y coreano, heredada del modelo base.
- Razonamiento financiero multi-salto orientado a análisis de tickers.
- Tool calling estructurado con dos herramientas financieras: `lookup_stock_price` (snapshot OHLCV: ticker, close, open, high, low, volume, timestamp) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergence, priced_in_score).
- Emisión de llamadas en formato compatible con el parser `hermes` de vLLM y con el esquema de function calling de la API de OpenAI.
- Generación de bloques de razonamiento explícito mediante etiquetas `<think>...</think>`.
- Producción de salida estructurada de pronóstico en `<forecast_json>...</forecast_json>` junto con un informe legible por humanos.
- Soporte de conversaciones multi-turno con integración de observaciones de herramientas en el contexto.
- No se documentan capacidades de visión, audio ni modo de pensamiento extendido más allá del bloque `<think>`.

## Casos de uso

- Validación de pipelines de fine-tuning: el modelo sirve para comprobar de extremo a extremo que el entrenamiento LoRA, la fusión del adaptador, la subida al Hub y el arranque en vLLM funcionan correctamente antes de lanzar entrenamientos reales.
- Pruebas de integración de tool calling en vLLM: permite verificar la configuración `--enable-auto-tool-choice --tool-call-parser hermes` y el endpoint `/v1/models` con un modelo que emite llamadas a funciones en el formato esperado.
- Desarrollo de clientes compatibles con la API de OpenAI: útil para probar SDKs y capas de orquestación que consumen `chat.completions` con `tools` y `tool_choice="auto"`.
- Prototipado de agentes financieros de dos turnos: sirve para ensayar el bucle petición → llamada a herramienta → observación → razonamiento → pronóstico estructurado antes de sustituir el modelo por uno entrenado de verdad.
- Pruebas de extracción de salida estructurada: el bloque `<forecast_json>` permite validar parsers y esquemas de validación (por ejemplo, con Pydantic) en pipelines downstream.
- Verificación de despliegue en hardware concreto: al ser un checkpoint de 7,6 mil millones de parámetros en safetensors, permite medir tiempos de carga y consumo de VRAM en la plataforma objetivo (DGX Spark GB10 u otras) antes de desplegar el modelo definitivo.
- Docencia y ejemplos reproducibles: como artefacto pequeño y de licencia Apache-2.0, puede usarse para ilustrar el formato de trayectorias de tool calling con razonamiento explícito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (final 0,8317; media 1,1319) sobre 10 pasos y 16 trayectorias, dato que no constituye una evaluación de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15,2 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB para contexto moderado.
- En cuantización de 8 bits, la huella de pesos bajaría a unos 8 GB; en 4 bits, a unos 4-5 GB, aunque el autor no publica versiones cuantizadas ni datos de rendimiento para ellas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 con contexto contenido; el autor menciona despliegue en DGX Spark GB10.
- Cabe en GPU de consumo con 24 GB (RTX 3090/4090) en BF16 con contexto limitado, y en GPUs de 8-16 GB si se cuantiza.
- Opciones de despliegue documentadas: vLLM (con `--enable-auto-tool-choice` y `--tool-call-parser hermes`) y Transformers con `device_map="auto"`. El autor no documenta llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-qwen2.5-7b-smoke | 7,6 B | no disponible | Tool calling financiero (smoke test) | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct (modelo base) | 7,6 B | no disponible en esta ficha | Instrucciones generales, multilingüe | Apache-2.0 | Hugging Face, ampliamente adoptado |
| Alternativas de 7-8 B con tool calling (por ejemplo, familias Llama 3.1 8B Instruct o Mistral 7B Instruct) | 7-8 B | no disponible en esta ficha | Instrucciones generales y function calling | licencias propias de cada familia | Hugging Face |

La comparación relevante es contra el propio modelo base: GamblerInsight Smoke no aporta mejoras medibles sobre Qwen2.5-7B-Instruct, ya que solo se entrenó 10 pasos sobre 16 trayectorias. Para cualquier uso real de análisis financiero o tool calling general, el modelo base o un fine-tuning sustantivo serían preferibles.

## Limitaciones y advertencias

- Entrenado únicamente durante 10 pasos sobre 16 trayectorias: las salidas pueden ser incompletas, inconsistentes o alucinadas, tal como advierte el propio autor.
- No apto para decisiones de trading, gestión de carteras ni asesoramiento financiero regulado; el autor lo declara explícitamente fuera de alcance.
- Las observaciones de herramientas incluidas en el entrenamiento son snapshots y pueden estar obsoletas en el momento de la inferencia.
- Riesgo elevado de alucinación en cifras financieras, indicadores técnicos y pronósticos, dado el volumen ínfimo de datos de ajuste.
- Idiomas soportados limitados a inglés y coreano; no se documenta soporte de castellano.
- Sesgos heredados del modelo base Qwen2.5-7B-Instruct, no evaluados ni mitigados en este checkpoint.
- La licencia Apache-2.0 permite uso comercial, pero el estado de smoke test hace desaconsejable cualquier despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- No se documentan datos de contexto máximo efectivo, cuantizaciones publicadas ni resultados de evaluación, lo que dificulta planificar su integración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-qwen2.5-7b-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Documentación de vLLM sobre tool calling: no disponible en la informacion proporcionada
- Paper, blog o repositorio adicional del autor: no disponible en la informacion proporcionada
