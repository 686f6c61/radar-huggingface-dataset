# tayaee/gamblerinsight-1-qwen2.5-1.5b-smoke

## Resumen

GamblerInsight Smoke (`tayaee/gamblerinsight-1-qwen2.5-1.5b-smoke`) es un checkpoint de prueba de humo (smoke test) desarrollado por el usuario tayaee, afinado a partir de `Qwen/Qwen2.5-1.5B-Instruct`. Su proposito no es ofrecer un asistente financiero operativo, sino validar de extremo a extremo una tuberia de entrenamiento, fusion de adaptadores LoRA en un checkpoint safetensors estandar, publicacion en HuggingFace Hub y servicio con vLLM. El modelo se entreno en una plataforma DGX Spark GB10.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 1.543.714.304 parametros totales (aproximadamente 1,5 mil millones) y un contexto nativo de 32.768 tokens, aunque la model card no documenta explicitamente ese dato y se infiere del modelo base. Incorpora un formato conversacional especifico de dos turnos orientado a tool calling financiero, con bloques `<think>...</think>` y `<forecast_json>...</forecast_json>` para razonamiento estructurado y pronosticos legibles por maquina.

Su relevancia es acotada y debe entenderse en clave de ingenieria: demuestra como un modelo pequeno (1,5B) puede adaptarse mediante QLoRA/LoRA para invocar herramientas financieras predefinidas (`lookup_stock_price`, `lookup_technical_indicators`) y producir salidas estructuradas. No obstante, el entrenamiento consistio en solo 10 pasos sobre 16 trayectorias, por lo que sus capacidades reales son practicamente las del modelo base y no debe emplearse en produccion ni en decisiones de inversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors BF16/FP16; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de ajuste | LoRA via PEFT (`lora_bf16`), r=8, alpha=16, dropout=0.05 |
| Tamano del repositorio | 3,1 GB |
| Descargas | 301 |
| Fecha de creacion | 2026-10-31 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros. Sobre el checkpoint base `Qwen/Qwen2.5-1.5B-Instruct` se aplico un ajuste LoRA en BF16/FP16 mediante PEFT, con rango r=8, alpha=16 y dropout de 0,05. Los adaptadores se fusionaron posteriormente en un checkpoint safetensors estandar, lo que permite servirlo con vLLM y con Transformers sin cargar adaptadores adicionales.

El entrenamiento fue deliberadamente minimo: `max_steps=10`, learning rate de 0,0002, batch size de 2 y un unico fichero `minimal_sft_smoke.jsonl` con 16 trayectorias de tool calling en dos turnos. La perdida final registrada fue de 0,8810 (media de 1,1700). El formato de trayectoria es: peticion del usuario con un ticker, llamada a una o varias herramientas financieras, observacion de la herramienta, y una respuesta final con razonamiento en `<think>...</think>`, un bloque `<forecast_json>...</forecast_json>` y un informe legible. No se documenta RLHF, DPO ni ninguna innovacion arquitectonica adicional; el valor tecnico reside en la validacion de la tuberia de merge y despliegue, no en el aprendizaje.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Tool calling / function calling con dos herramientas financieras predefinidas: `lookup_stock_price` (OHLCV) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergence, priced_in_score).
- Razonamiento multi-turno de dos pasos: llamada a herramienta, observacion y respuesta final.
- Salida estructurada con bloques `<think>...</think>` para razonamiento y `<forecast_json>...</forecast_json>` para pronosticos legibles por maquina.
- Compatibilidad con el parser `hermes` de vLLM para eleccion automatica de herramienta (`--enable-auto-tool-choice`).
- Integracion con el SDK de OpenAI mediante endpoint compatible (`/v1/chat/completions`).
- No se documentan capacidades de vision, audio, matematicas avanzadas ni modo "thinking" extendido mas alla del bloque `<think>`.

## Casos de uso

- Validacion de pipeline de entrenamiento: sirve para comprobar que el flujo LoRA, merge de adaptadores, subida a HuggingFace Hub y servicio con vLLM funciona de extremo a extremo antes de lanzar un entrenamiento real.
- Pruebas de integracion de tool calling: permite verificar que un cliente OpenAI-compatible recibe correctamente llamadas a funciones con el parser `hermes` y que las observaciones se inyectan en el turno siguiente.
- Desarrollo de agentes financieros experimentales: util como banco de pruebas para disenar el esquema de herramientas (`lookup_stock_price`, `lookup_technical_indicators`) y el formato de salida estructurada antes de sustituir el modelo por uno mayor.
- Test de contrato de API: al exponer un endpoint compatible con OpenAI, permite validar el contrato de mensajes, herramientas y respuestas en un entorno de staging sin coste de GPU elevado.
- Evaluacion de formatos de razonamiento estructurado: sirve para probar parsers de `<think>` y `<forecast_json>` en pipelines de extraccion de datos.
- Prototipado de asistentes de analisis tecnico: con 1,5B parametros cabe en una sola GPU consumer, lo que facilita iterar sobre prompts y esquemas de herramientas en local antes de escalar.
- Docencia y demos: por su tamano reducido y licencia Apache-2.0, es adecuado para talleres sobre fine-tuning con LoRA y despliegue con vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de entrenamiento (final 0,8810, media 1,1700) sobre 16 trayectorias y 10 pasos, dato que no constituye una evaluacion de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB (aunque el autor no publica pesos cuantizados).
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090). Para servicio concurrente con vLLM se recomienda A100, H100 o L40S.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: vLLM (con `--enable-auto-tool-choice --tool-call-parser hermes`), Transformers con `device_map="auto"`, y TGI por los tags del repositorio. No se documenta compatibilidad con llama.cpp u Ollama al no publicarse pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-qwen2.5-1.5b-smoke | 1,54B | no disponible (base: 32.768) | Apache-2.0 | Tool calling financiero (smoke test) | HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache-2.0 | Instruccion general | HuggingFace |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache-2.0 (Qwen license en algunos tamanos) | Instruccion general | HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 131.072 | Llama 3.2 Community License | Instruccion general | HuggingFace |

La comparativa debe interpretarse con cautela: el modelo de tayaee es un derivado directo de Qwen2.5-1.5B-Instruct con un ajuste minimo, por lo que su rendimiento general es esencialmente el del modelo base, mientras que su especializacion en tool calling financiero es meramente nominal dado el escaso entrenamiento. Frente a alternativas como Llama-3.2-1B-Instruct, ofrece mayor contexto nativo (32.768 frente a 131.072 en Llama, aunque este ultimo es mayor) y licencia Apache-2.0 mas permisiva que la Llama Community License.

## Limitaciones y advertencias

- Entrenado solo 10 pasos sobre 16 trayectorias: las salidas pueden ser incompletas, inconsistentes o alucinadas.
- No apto para produccion: la model card lo declara explicitamente fuera de alcance para decisiones de trading, gestion de carteras o asesoramiento financiero regulado.
- Riesgo elevado de alucinacion en datos financieros: las observaciones de herramientas usadas en entrenamiento son instantaneas y pueden estar obsoletas en inferencia.
- Sesgos heredados del modelo base Qwen2.5-1.5B-Instruct, no evaluados ni mitigados en este ajuste.
- Idiomas limitados a ingles y coreano; no se documenta soporte de castellano.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversion manual.
- No se han publicado evaluaciones de benchmarks, por lo que no hay evidencia cuantitativa de mejora sobre el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero el propio autor desaconseja cualquier uso en servicios de asesoramiento financiero regulado.
- El nombre "smoke" indica que es un artefacto de validacion, no una version estable ni un release de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tayaee/gamblerinsight-1-qwen2.5-1.5b-smoke
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentacion de vLLM sobre tool calling: https://docs.vllm.ai/en/latest/features/tool_calling.html
- PEFT (biblioteca de LoRA): https://github.com/huggingface/peft
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
