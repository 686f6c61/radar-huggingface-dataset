# tayaee/gamblerinsight-1-qwen3-30b-a3b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-qwen3-30b-a3b-smoke`) es un checkpoint de prueba de humo (smoke test) publicado por el usuario `tayaee` en Hugging Face. Se trata de un ajuste fino del modelo base `Qwen/Qwen3-30B-A3B-Instruct-2507`, un transformer de arquitectura Mixture of Experts (MoE) con 30.532.122.624 parámetros totales. El modelo está orientado a razonamiento financiero multi-salto y a actuar como agente con soporte de tool calling sobre dos herramientas financieras concretas (`lookup_stock_price` y `lookup_technical_indicators`).

El objetivo declarado del autor no es producir un modelo de producción, sino validar de extremo a extremo el pipeline de entrenamiento, merge de adaptadores, subida a Hugging Face Hub y servicio con vLLM sobre la plataforma DGX Spark GB10. El ajuste se realizó mediante LoRA en BF16/FP16 con PEFT, con hiperparámetros muy reducidos (`r=8`, `alpha=16`, `max_steps=10`) y un dataset mínimo de 16 trayectorias de tool calling.

Es relevante ahora como ejemplo reproducible de cómo montar un agente financiero con Qwen3-30B-A3B, pero conviene subrayar que, por su naturaleza de smoke test, sus salidas no son fiables para decisiones de inversión ni para uso en producción. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Qwen3 (`qwen3_moe`) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (el modelo base Qwen3-30B-A3B activa ~3B, pero la cifra exacta de este checkpoint no se documenta) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en safetensors BF16/FP16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3-30B-A3B-Instruct-2507: un transformer con capas de mezcla de expertos que activa solo una fraccion de sus parametros por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. Sobre esa base se aplico un ajuste fino con LoRA mediante PEFT en BF16/FP16 (`lora_bf16`), con `r=8`, `alpha=16`, `dropout=0.05`, `learning_rate=0.0002`, `batch_size=2` y `max_steps=10`. El dataset de entrenamiento fue `minimal_sft_smoke.jsonl`, con solo 16 trayectorias de tool calling de dos turnos. La perdida final reportada es 0.5445 (media 0.9347).

El formato de trayectoria entrenado es especifico: en el primer turno el usuario pide un analisis financiero con un ticker; el asistente emite una o mas llamadas a herramientas (`lookup_stock_price`, `lookup_technical_indicators`) seguidas de una observacion de herramienta; en el segundo turno el asistente produce un razonamiento envuelto en `<think>...</think>`, un bloque de pronostico legible por maquina en `<forecast_json>...</forecast_json>` y un informe final legible por humanos. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el interes tecnico esta en el pipeline de merge de adaptadores y despliegue con vLLM usando `--enable-auto-tool-choice` y `--tool-call-parser hermes`.

## Capacidades

- Generacion de texto conversacional en ingles y coreano.
- Razonamiento financiero multi-salto sobre tickers, precios OHLCV e indicadores tecnicos (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergencia y `priced_in_score`).
- Tool calling / function calling con dos herramientas financieras predefinidas, en formato compatible con la API de OpenAI.
- Razonamiento en modo "thinking" mediante bloques `<think>...</think>`.
- Emision de pronosticos estructurados y legibles por maquina en `<forecast_json>...</forecast_json>`.
- Generacion de informes finales legibles por humanos a partir de observaciones de herramientas.
- Integracion con vLLM mediante parser de tool calls `hermes` y eleccion automatica de herramienta.
- No se documentan capacidades de vision, audio, codigo general ni matematicas fuera del ambito financiero; su entrenamiento es exclusivamente de tool calling financiero.

## Casos de uso

- Validacion de pipeline de entrenamiento: sirve para comprobar que el flujo LoRA, merge de adaptadores, subida a Hub y servicio con vLLM funciona de extremo a extremo antes de escalar a un dataset real.
- Pruebas de integracion de agentes financieros: permite verificar que un orquestador externo interpreta correctamente las llamadas a `lookup_stock_price` y `lookup_technical_indicators` y que las observaciones se reinyectan en el segundo turno.
- Desarrollo de clientes OpenAI-compatibles: el checkpoint expone un endpoint `/v1` con `tool_choice="auto"`, util para probar SDKs y frameworks de agentes contra un modelo real sin coste de API.
- Benchmarking de infraestructura: al ser un MoE de ~30B, permite medir throughput y latencia de vLLM y de transformers en hardware como DGX Spark GB10 o GPUs con suficiente VRAM.
- Pruebas de formato estructurado: valida parsers de `<think>`, `<forecast_json>` y del formato de tool call `hermes` en pipelines de evaluacion.
- Demostraciones tecnicas de razonamiento financiero: para ilustrar en documentacion o charlas como un modelo puede encadenar consulta de precio, consulta de indicadores y sintesis en un informe, siempre con la advertencia de que no es asesoramiento financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 61.1 GB en safetensors; en BF16 el modelo completo requiere aproximadamente 61 GB de VRAM solo para pesos, mas overhead de KV cache y activaciones. No se documentan cifras oficiales.
- GPU recomendadas: para BF16 se necesitan GPUs con 80 GB o mas (A100 80GB, H100 80GB) o configuraciones multi-GPU. El autor menciona el entrenamiento en DGX Spark GB10, plataforma con memoria unificada.
- Cabe en consumer GPU: no en BF16. No se documentan cuantizaciones GGUF/AWQ/GPTQ que permitan reducir el footprint a 24 GB o menos; sin esas variantes, no cabe en RTX 4090 (24 GB) ni en RTX 3090.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--enable-auto-tool-choice --tool-call-parser hermes`), transformers con `device_map="auto"`, y cualquier servidor compatible con la API de OpenAI apuntando a vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-qwen3-30b-a3b-smoke | 30.532.122.624 (MoE) | no disponible | si, 2 herramientas financieras | apache-2.0 | Hugging Face, 601 descargas |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (base) | ~30B (MoE, ~3B activos) | no disponible | si, generico | apache-2.0 | Hugging Face oficial |
| tayaee/gamblerinsight-1-qwen3-32b-smoke | ~33B (denso) | no disponible | si, financiero | no disponible | Hugging Face, mismo autor |

El modelo base Qwen3-30B-A3B-Instruct-2507 es la referencia natural: mismo tamano, misma licencia y tool calling generico, pero sin el ajuste financiero ni el formato `<forecast_json>`. La variante `gamblerinsight-1-qwen3-32b-smoke` del mismo autor es un denso de ~33B, por lo que tendra mayores requisitos de VRAM y latencia que este MoE.

## Limitaciones y advertencias

- Es un smoke test entrenado solo 10 pasos sobre 16 trayectorias; las salidas pueden ser incompletas, inconsistentes o alucinadas.
- No apto para decisiones de trading en produccion, gestion de cartera ni servicios de asesoria financiera regulada; el propio autor lo declara fuera de alcance.
- Las observaciones de herramientas vistas en entrenamiento son instantaneas y pueden estar obsoletas en inferencia; el modelo no garantiza datos de mercado frescos.
- Riesgo de alucinacion elevado en cifras, indicadores y pronosticos, dado el volumen minimo de entrenamiento.
- Idiomas limitados a ingles y coreano; no se documenta soporte de castellano.
- No se documentan sesgos conocidos especificos; al heredar Qwen3, arrastra los sesgos del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explicitamente el uso en produccion financiera y no ofrece garantias.
- No se publican cuantizaciones, por lo que el despliegue en hardware consumer queda limitado salvo que se genere una conversion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-qwen3-30b-a3b-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Variante densa del mismo autor: https://huggingface.co/tayaee/gamblerinsight-1-qwen3-32b-smoke
- Documentacion de vLLM sobre tool calling: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
