# tayaee/gamblerinsight-1-qwen2.5-1.5b-full

## Resumen

GamblerInsight Full (`gamblerinsight-1-qwen2.5-1.5b-full`) es un ajuste fino de `Qwen/Qwen2.5-1.5B-Instruct` desarrollado por el usuario tayaee, orientado a razonamiento financiero multi-salto y a la emisión de llamadas a herramientas (tool calling) para consultar datos de mercado. El modelo se entrena con LoRA en BF16/FP16 sobre la plataforma DGX Spark GB10 y se publica como checkpoint completo en safetensors, con el objetivo declarado de validar de extremo a extremo el pipeline de entrenamiento, fusión del adaptador, subida a Hugging Face Hub y servicio con vLLM.

Se trata de un modelo pequeño (1.543.714.304 parámetros, aproximadamente 1,5 mil millones) con arquitectura transformer densa heredada de Qwen2.5, licencia Apache-2.0 y soporte declarado de inglés y coreano. Su relevancia es fundamentalmente metodológica: sirve como referencia de ingeniería para construir agentes financieros con tool calling en dos turnos, no como modelo listo para producción. El entrenamiento es deliberadamente corto (110 pasos sobre 220 trayectorias), por lo que debe interpretarse como una prueba de concepto.

La propuesta técnica consiste en que el modelo, ante una petición de análisis sobre un ticker, emita una o varias llamadas a las herramientas `lookup_stock_price` y `lookup_technical_indicators`, reciba las observaciones y, en un segundo turno, produzca un bloque de razonamiento `<think>...</think>`, un bloque de pronóstico legible por máquina `<forecast_json>...</forecast_json>` y un informe final en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5. Sobre esa base se aplica un ajuste fino con LoRA mediante PEFT en precision BF16/FP16 (`lora_bf16`), con hiperparámetros `r=8`, `alpha=16` y `dropout=0.05`. La optimización se realiza con `max_steps=110`, `learning_rate=0.0002` y `batch_size=2`. El adaptador se fusiona posteriormente en un checkpoint estándar de safetensors. La pérdida final registrada es de `0.1795`, con una media de `0.3713` a lo largo del entrenamiento.

Los datos de entrenamiento consisten en `sft_trajectories_full_pilot_200.jsonl`, un conjunto de 220 trayectorias de tool calling en dos turnos. El formato de cada trayectoria incluye: una petición del usuario con un ticker; una respuesta del asistente con una o más llamadas a herramientas y la observación correspondiente; y un segundo turno del asistente con razonamiento envuelto en `<think>...</think>`, un bloque `<forecast_json>...</forecast_json>` y un informe final legible. No se documenta el uso de RLHF ni DPO, ni el volumen de tokens de entrenamiento más allá del número de trayectorias. La innovación destacable es el formato estructurado de salida (pensamiento, pronóstico JSON y narrativa) combinado con tool calling compatible con el parser `hermes` de vLLM.

## Capacidades

- Generación de texto conversacional en inglés y coreano, heredada de la base Qwen2.5.
- Tool calling con dos funciones financieras predefinidas: `lookup_stock_price` (snapshot OHLCV) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergencia y `priced_in_score`).
- Razonamiento multi-salto en dos turnos: llamada a herramienta, observación y síntesis posterior.
- Modo de pensamiento explícito mediante el bloque `<think>...</think>`.
- Salida estructurada de pronóstico mediante `<forecast_json>...</forecast_json>`, apta para consumo por máquina.
- Generación de informes financieros en lenguaje natural a partir de indicadores técnicos.
- Integración con vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Compatibilidad con el SDK de OpenAI a través de un endpoint compatible (`/v1/chat/completions`).

## Casos de uso

- Validación de pipelines de agentes financieros: el modelo sirve para comprobar de extremo a extremo el flujo de entrenamiento LoRA, fusión del adaptador, publicación en el Hub y servicio con vLLM antes de invertir en modelos mayores.
- Prototipado de asistentes de análisis técnico: dado un ticker, el modelo solicita precios e indicadores y devuelve un informe con RSI, MACD y bandas de Bollinger, útil para maquetar interfaces de análisis.
- Pruebas de formato de salida estructurada: el bloque `<forecast_json>` permite validar parsers y esquemas de datos en pipelines de investigación de mercados sin depender de un modelo grande.
- Generación de trayectorias sintéticas para aumento de datos: las salidas del modelo pueden servir como borradores para construir conjuntos de entrenamiento de agentes con tool calling en dos turnos.
- Evaluación comparativa de tool calling: al ser un modelo de 1,5B, permite medir latencia y coste de integración en entornos con recursos limitados frente a alternativas mayores.
- Docencia y experimentación: adecuado para demostrar en cursos o talleres cómo se construye un agente con llamadas a funciones y razonamiento explícito en un modelo pequeño.
- Pruebas de integración con el SDK de OpenAI: sirve para verificar clientes que consumen endpoints compatibles con `tool_choice="auto"` sin coste de infraestructura elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 3 GB para los pesos (1,54B parámetros a 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 3,1 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,6-2 GB; en 4 bits, en torno a 1-1,2 GB (estimaciones a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede ejecutar el modelo en BF16; una RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque permiten mayor throughput.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más en BF16 y con 4 GB o más en cuantización de 4 bits.
- Opciones de despliegue: vLLM (con `--enable-auto-tool-choice --tool-call-parser hermes`), Transformers con `device_map="auto"`, y presumiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque el autor no los publica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-qwen2.5-1.5b-full | 1,54B | no disponible | Sí (2 herramientas financieras) | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | no disponible | Sí (genérico) | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | no disponible | Sí (genérico) | Apache-2.0 | Hugging Face |

La comparación con la base Qwen2.5-1.5B-Instruct es directa: comparten arquitectura y tamaño, pero GamblerInsight añade el formato de trayectorias financieras en dos turnos y las dos herramientas específicas de mercado. Frente a Qwen2.5-3B-Instruct, este modelo ofrece menor coste de inferencia a cambio de capacidad de razonamiento general inferior. No se dispone de datos de benchmarks que permitan comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- Entrenado únicamente durante 110 pasos sobre 220 trayectorias: las salidas pueden ser incompletas, inconsistentes o alucinadas.
- Las observaciones de herramientas en el entrenamiento son snapshots y pueden estar obsoletas en el momento de la inferencia.
- No apto para decisiones de trading en producción, gestión de carteras ni asesoramiento financiero regulado; el autor lo declara explícitamente fuera de alcance.
- Riesgo elevado de alucinación en cifras, indicadores y pronósticos, dado el escaso volumen de datos de ajuste fino.
- Idiomas limitados a inglés y coreano según la model card; el rendimiento en castellano no está garantizado.
- La longitud de contexto no se documenta en la información disponible; se hereda de la base, pero no se confirma.
- Licencia Apache-2.0 permite uso comercial, pero el propio autor desaconseja el uso en producción financiera.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni resultados de evaluación reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-qwen2.5-1.5b-full
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de vLLM sobre tool calling: https://docs.vllm.ai/en/latest/features/tool_calling.html
- Repositorio de PEFT: https://github.com/huggingface/peft
