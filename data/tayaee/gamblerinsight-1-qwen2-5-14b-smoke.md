# tayaee/gamblerinsight-1-qwen2.5-14b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-qwen2.5-14b-smoke`) es un checkpoint de validacion de pipeline (smoke test) desarrollado por el usuario tayaee, afinado a partir de `Qwen/Qwen2.5-14B-Instruct`. Su proposito declarado no es el uso en produccion, sino verificar de extremo a extremo la cadena de entrenamiento, fusion de adaptadores LoRA, publicacion en Hugging Face Hub y servicio con vLLM. El modelo esta orientado a razonamiento financiero multi-salto y a un agente con tool calling especializado en dos herramientas de analisis bursatil.

El modelo conserva la arquitectura transformer densa de Qwen2.5-14B, con 14.770.033.664 parametros totales y pesos en safetensors (repo de 29,6 GB). Se ha afinado mediante LoRA en BF16/FP16 con PEFT (`r=8`, `alpha=16`, `dropout=0.05`) durante solo 10 pasos sobre un dataset minimo de 16 trayectorias (`minimal_sft_smoke.jsonl`), con una perdida final de 0,7371 (media 1,0999). Esta naturaleza de smoke test es clave: cualquier evaluacion de calidad debe interpretarse en ese contexto de validacion de infraestructura, no de capacidad real.

Es relevante ahora porque documenta un flujo completo de agente financiero con tool calling en formato Hermes, salida estructurada (`<think>`, `<forecast_json>`) y despliegue compatible con OpenAI, lo que resulta util como referencia tecnica de integracion. La licencia Apache-2.0 y el soporte declarado de ingles y coreano lo hacen facilmente reutilizable como base para experimentos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tune LoRA de Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-14B-Instruct, no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors BF16/FP16; sin GGUF oficial) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-14B-Instruct`, un transformer denso de la familia Qwen2 con 14.770.033.664 parametros. Sobre esa base se aplico un ajuste fino supervisado mediante LoRA (PEFT) en BF16/FP16, con rango `r=8`, `alpha=16` y `dropout=0.05`, usando `max_steps=10`, `learning_rate=0.0002` y `batch_size=2`. El dataset de entrenamiento es `minimal_sft_smoke.jsonl`, compuesto por 16 trayectorias de tool calling en dos turnos. Los adaptadores se fusionaron en un checkpoint estandar de safetensors para su servicio con vLLM.

La innovacion tecnica no reside en el entrenamiento en si (deliberadamente minimo), sino en el formato de trayectoria y en el pipeline: el turno 1 del asistente emite una o varias llamadas a herramientas (`lookup_stock_price`, `lookup_technical_indicators`) seguidas de una observacion; el turno 2 produce razonamiento envuelto en `<think>...</think>`, un bloque de pronostico legible por maquina en `<forecast_json>...</forecast_json>` y un informe final en lenguaje natural. El proceso se ejecuto en una plataforma DGX Spark GB10. No se documenta uso de RLHF ni DPO, ni el volumen de tokens de entrenamiento mas alla de las 16 trayectorias indicadas.

## Capacidades

- Generacion de texto y razonamiento financiero multi-salto sobre un ticker dado.
- Tool calling / function calling con dos herramientas: `lookup_stock_price` (OHLCV: `ticker`, `close`, `open`, `high`, `low`, `volume`, `timestamp`) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergence, `priced_in_score`).
- Formato de llamada compatible con el parser `hermes` de vLLM y con `tool_choice="auto"`.
- Salida estructurada con modo de razonamiento explicito (`<think>`) y bloque de pronostico JSON (`<forecast_json>`).
- Agentes multi-turno de dos turnos (peticion, llamada a herramienta, observacion, informe).
- Capacidades multilingues limitadas a ingles y coreano segun la model card.
- Integracion con clientes compatibles con la API de OpenAI y con Transformers.

## Casos de uso

- Validacion de pipelines de fine-tune: sirve para comprobar que el flujo LoRA, fusion de adaptadores, subida a Hugging Face Hub y servicio con vLLM funciona de extremo a extremo antes de invertir en un entrenamiento completo.
- Pruebas de integracion de tool calling: permite verificar el parser `hermes`, el enrutado de `tool_choice="auto"` y el manejo de observaciones de herramientas en un cliente compatible con OpenAI.
- Prototipado de agentes financieros: util para disenar la interfaz de herramientas y el contrato de salida (`<forecast_json>`) antes de conectar datos reales de mercado.
- Test de formatos de salida estructurada: valida el parseo de bloques `<think>` y `<forecast_json>` en downstream (por ejemplo, extraccion de pronosticos a un sistema de monitorizacion).
- Banco de pruebas de latencia y throughput: al ser un checkpoint safetensors de 14B, permite medir el rendimiento de vLLM o TGI en el hardware objetivo (DGX Spark GB10 u otros) con un modelo del tamano final.
- Evaluacion de compatibilidad de SDK: comprobar que el SDK de OpenAI, LangChain u orquestadores similares funcionan contra el endpoint `/v1` antes de desplegar el modelo definitivo.
- Referencia docente o de documentacion: ejemplo reproducible de trayectoria de dos turnos con tool calling y salida estructurada para articulos o formaciones tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 29,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 40-48 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB; en consumer, RTX 4090 24 GB no es suficiente en BF16 y requeriria cuantizacion (no se publican pesos GGUF oficiales).
- Cabe en consumer GPU: no en BF16; solo con cuantizacion de terceros no oficial (no disponible en el repo).
- Opciones de despliegue: vLLM (`--enable-auto-tool-choice --tool-call-parser hermes`), Transformers con `device_map="auto"`, y TGI (tag `text-generation-inference` en el repo). No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-qwen2.5-14b-smoke | 14,77 B | no disponible | Finanzas + tool calling (smoke test) | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-14B-Instruct | ~14,7 B | no disponible en la informacion | Instrucciones generales | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-14B-Instruct | ~15 B | no disponible en la informacion | Codigo | Apache-2.0 | Hugging Face (incluye GGUF) |

La comparacion con Qwen2.5-14B-Instruct es la mas directa, ya que GamblerInsight deriva de el y solo anade el formato de tool calling financiero y la salida estructurada. Frente a Qwen2.5-Coder-14B-Instruct, el enfoque es completamente distinto: el modelo de codigo esta orientado a generacion de software y dispone de pesos GGUF oficiales, mientras que GamblerInsight no los ofrece. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado durante solo 10 pasos sobre 16 trayectorias: las salidas pueden ser incompletas, incoherentes o alucinadas; no debe usarse como modelo de produccion.
- Uso previsto exclusivamente como smoke test de pipeline; queda fuera de alcance la toma de decisiones de trading, la gestion de cartera o cualquier servicio de asesoria financiera regulada.
- Las observaciones de herramientas vistas en entrenamiento son instantaneas y pueden estar obsoletas en inferencia; el modelo no accede a datos de mercado en tiempo real por si mismo.
- Riesgo elevado de alucinacion en cifras, indicadores y pronosticos financieros; el bloque `<forecast_json>` no debe interpretarse como recomendacion de compra, venta o mantenimiento.
- Idiomas limitados a ingles y coreano; no se declara soporte de castellano.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware consumer.
- Aunque la licencia es Apache-2.0, el uso comercial del modelo en contextos financieros regulados exige revision legal y cumplimiento normativo independiente.
- No se documentan sesgos especificos ni evaluaciones de seguridad; al derivar de Qwen2.5-14B-Instruct, hereda los sesgos no mitigados de la base.

## Enlaces

- Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-qwen2.5-14b-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Ficha en FriendliAI: https://friendli.ai/models/tayaee/gamblerinsight-1-qwen2.5-14b-smoke
- Referencia de pesos GGUF de la familia Qwen2.5 (no aplicable a este modelo): https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF
