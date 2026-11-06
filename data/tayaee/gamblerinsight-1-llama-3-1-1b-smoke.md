# tayaee/gamblerinsight-1-llama-3.1-1b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-llama-3.1-1b-smoke`) es un checkpoint de prueba (smoke test) desarrollado por el usuario de Hugging Face `tayaee`, orientado a razonamiento financiero multi-hop y a la creación de agentes con tool calling. Se trata de un fine-tuning de `unsloth/Llama-3.2-1B-Instruct` (Llama 3.2 1B Instruct, arquitectura transformer decoder-only) entrenado en la plataforma DGX Spark GB10. Su propósito no es producir un modelo útil en producción, sino validar de extremo a extremo el pipeline del proyecto GamblerInsight: trayectorias de tool calling en dos turnos, fusión de adaptadores LoRA en un checkpoint safetensors estándar y despliegue en Hugging Face Hub para servir con vLLM.

El modelo se ha entrenado mediante LoRA en BF16/FP16 (con PEFT) durante solo 10 pasos sobre un dataset mínimo de 16 trayectorias (`minimal_sft_smoke.jsonl`), alcanzando una pérdida final de 1,1425. A pesar de su carácter experimental, es interesante como ejemplo reproducible de cómo estructurar un agente financiero pequeño: el formato de entrenamiento incluye llamadas a herramientas financieras (`lookup_stock_price` y `lookup_technical_indicators`), razonamiento delimitado con etiquetas `<think>...</think>` y salidas de previsión en bloques `<forecast_json>...</forecast_json>` legibles por máquina.

Con 1.235.814.400 parámetros y unos 2,5 GB de tamaño de repositorio, es un modelo muy ligero que cabe en GPUs de consumo, lo que lo hace cómodo para pruebas de integración con servidores vLLM y clientes compatibles con la API de OpenAI. No debe usarse para decisiones de trading reales ni asesoramiento financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) |
| Parametros totales | 1.235.814.400 (~1,24 B) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no disponible (la base Llama 3.2 1B soporta 128k, pero no consta en la informacion del checkpoint) |
| Tipos de cuantizacion | BF16/FP16 (entrenamiento LoRA en BF16); no hay checkpoints cuantizados publicados |
| Idiomas soportados | Ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.2-1B-Instruct`, una version instruct de Llama 3.2 con 1B de parametros basada en la arquitectura transformer decoder-only de Meta (atencion con GQA, RoPE, SwiGLU y tokenizador BPE de 128k tokens). Sobre esta base se ha aplicado un fine-tuning eficiente mediante LoRA con la libreria PEFT, con hiperparametros `r=8`, `alpha=16` y `dropout=0.05`, en precision BF16/FP16. Los adaptadores se fusionaron posteriormente (merge) en un checkpoint safetensors estandar para facilitar el despliegue con vLLM.

El entrenamiento es deliberadamente minimo: 10 pasos de optimizacion con `learning_rate=0.0002` y `batch_size=2`, sobre el dataset `minimal_sft_smoke.jsonl` de 16 trayectorias. La perdida final fue de 1,1425 (media 1,5270). Cada trayectoria sigue un formato de agente en dos turnos: en el primero, el usuario solicita un analisis financiero de un ticker y el asistente emite llamadas a las herramientas `lookup_stock_price` (snapshot OHLCV: `ticker`, `close`, `open`, `high`, `low`, `volume`, `timestamp`) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, `divergence` y `priced_in_score`); tras la observacion de la herramienta, en el segundo turno el asistente produce razonamiento estructurado entre `<think>...</think>`, una prevision en JSON entre `<forecast_json>...</forecast_json>` y un informe final legible. No hay informacion sobre RLHF/DPO ni sobre el numero de tokens de preentrenamiento adicional.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Llama 3.2 1B Instruct.
- Tool calling con formato compatible con el parser `hermes` de vLLM: el modelo puede solicitar las herramientas `lookup_stock_price` y `lookup_technical_indicators` durante el razonamiento.
- Razonamiento financiero multi-hop en dos turnos: emite llamadas a herramientas, integra las observaciones y produce un analisis.
- Salida estructurada: razonamiento delimitado con `<think>...</think>` y bloques de prevision machine-readable en `<forecast_json>...</forecast_json>`.
- Soporte de agentes multi-step en el formato de trayectoria para el que fue entrenado (dos turnos con observaciones de herramientas).
- Capacidades multilingues basicas en ingles y coreano (heredadas del modelo base, sin fine-tuning especifico documentado en coreano).
- Integracion con clientes compatibles con la API de OpenAI (`tool_choice="auto"`).
- No dispone de capacidades de vision, audio ni modo de thinking nativo mas alla de las etiquetas `<think>` entrenadas.

## Casos de uso

- Validacion de pipelines de entrenamiento y despliegue: es su uso previsto; permite verificar que el ciclo LoRA → merge safetensors → subida a Hugging Face Hub → serving con vLLM funciona de extremo a extremo antes de entrenar un modelo definitivo.
- Prototipado de agentes financieros con tool calling: sirve como plantilla ligera para probar la orquestacion de llamadas a `lookup_stock_price` y `lookup_technical_indicators` en un bucle de agente con clientes OpenAI-compatibles.
- Pruebas de integracion de vLLM: al publicarse con soporte de `--enable-auto-tool-choice --tool-call-parser hermes`, es util para verificar configuraciones de serving con tool calling automatico en un modelo de solo ~2,5 GB.
- Desarrollo de parsers de salida estructurada: sus bloques `<think>` y `<forecast_json>` son utiles para probar extractores y validadores de JSON en flujos de razonamiento con prevision.
- Demostraciones educativas sobre agentes LLM: su tamano reducido permite ejecutarlo en local (incluso en portatil con GPU modesta) para ilustrar trayectorias de agente en dos turnos con observaciones de herramientas.
- Pruebas de regresion de infraestructura de inferencia: al ser un checkpoint fijo y ligero, puede usarse como modelo canario para comprobar latencia, carga de pesos y compatibilidad de versiones de transformers y vLLM.
- Base para experimentos de fine-tuning: al documentar hiperparametros LoRA concretos (r=8, alpha=16, lr=0.0002), facilita reproducir el procedimiento sobre datasets reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento del entrenamiento es la perdida: final 1,1425 (media 1,5270) sobre el dataset smoke de 16 trayectorias, que no es comparable con benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, aproximadamente 2,5-3 GB para los pesos, mas overhead de KV cache y activaciones; en la practica, 4-6 GB de VRAM son suficientes con contexto moderado.
- GPUs recomendadas: cualquier GPU moderna de consumo; por ejemplo, una RTX 3060 de 12 GB, RTX 4060 Ti o superior es mas que suficiente. No se necesitan A100 ni H100 para inferencia; el entrenamiento se realizo en una DGX Spark GB10.
- Consumer GPUs: cabe comodamente en GPUs de 6-8 GB en precision completa; no se han publicado checkpoints cuantizados (GGUF, GPTQ, AWQ), por lo que la cuantizacion habria de aplicarse por cuenta del usuario.
- Opciones de despliegue: vLLM (documentado oficialmente en la model card, con tool calling hermes), transformers con `AutoModelForCausalLM` para inferencia local, y clientes compatibles con la API de OpenAI. No hay documentacion especifica para llama.cpp, Ollama ni TGI, aunque el formato safetensors estandar lo hace teoricamente compatible con herramientas que consuman checkpoints de transformers.
- Latencia y throughput: no disponibles; al tratarse de un modelo de ~1,2 B de parametros, cabe esperar latencias bajas y throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Caracteristica | gamblerinsight-1-llama-3.1-1b-smoke | Llama-3.2-1B-Instruct (base) | FinGPT (p. ej. FinGPT-Forecaster) |
|---|---|---|---|
| Parametros | ~1,24 B | 1,24 B | no disponible (según variante, 7-13 B tipicamente) |
| Longitud de contexto | no disponible | 128k | no disponible |
| Tool calling | Si (hermes, 2 herramientas financieras) | Si (generico) | no disponible |
| Entrenamiento financiero | Smoke test (16 trayectorias, 10 pasos) | Generalista | Datasets financieros reales |
| Licencia | Apache-2.0 | Llama 3.2 Community License | Variable segun repositorio |
| Disponibilidad | Hugging Face Hub (safetensors) | Hugging Face Hub | Hugging Face Hub / GitHub |

Cabe destacar que la base `unsloth/Llama-3.2-1B-Instruct` es un modelo mucho mas capaz en tareas generales, mientras que este checkpoint solo aporta valor en el formato de agente financiero para el que fue entrenado, y de forma limitada por lo minimo del entrenamiento.

## Limitaciones y advertencias

- Entrenamiento minimo: solo 10 pasos y 16 trayectorias; las salidas pueden ser incompletas, inconsistentes o directamente alucinadas. El propio autor lo advierte en la model card.
- No apto para decisiones de trading, gestion de carteras ni servicios de asesoramiento financiero regulado; su uso previsto es exclusivamente la validacion de pipelines.
- Riesgo de datos obsoletos: las observaciones de herramientas en el entrenamiento son snapshots que pueden estar desactualizados en el momento de la inferencia.
- Riesgo elevado de alucinacion en dominio financiero, agravado por el tamano del modelo (1B) y el entrenamiento minimo; los bloques `<forecast_json>` no deben interpretarse como previsiones fiables.
- Sin checkpoints cuantizados publicados y sin datos de benchmarks; la calidad en idiomas distintos del ingles (incluido el coreano listado) no ha sido evaluada.
- Restricciones de licencia: Apache-2.0 es permisiva para uso comercial, pero el modelo base (Llama 3.2) esta bajo la Llama Community License de Meta, cuyos terminos pueden aplicar a trabajos derivados.
- El nombre del artefacto menciona "llama-3.1" mientras la base real es Llama 3.2, una inconsistencia a tener en cuenta al catalogar el modelo.
- Cero descargas registradas y un solo like en el momento de la ficha: no existe comunidad ni historial de uso que respalde su fiabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-llama-3.1-1b-smoke
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Paper, blog o repositorio del proyecto GamblerInsight: no disponible (no constan enlaces adicionales en la informacion proporcionada)
