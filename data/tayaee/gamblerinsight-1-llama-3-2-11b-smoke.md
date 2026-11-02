# tayaee/gamblerinsight-1-llama-3.2-11b-smoke

## Resumen

GamblerInsight Smoke (`gamblerinsight-1-llama-3.2-11b-smoke`) es un checkpoint de prueba (smoke test) publicado por el usuario `tayaee` en Hugging Face. Se trata de un ajuste fino supervisado (SFT) mediante QLoRA sobre `unsloth/Llama-3.2-11B-Vision-Instruct`, orientado a razonamiento financiero multi-salto y a un agente con capacidad de invocar herramientas (tool calling). El modelo hereda la arquitectura multimodal Mllama de Llama 3.2 Vision, con aproximadamente 10.670 millones de parametros totales.

El objetivo declarado del autor no es ofrecer un modelo listo para produccion, sino validar de extremo a extremo el pipeline de entrenamiento, fusion de adaptadores en un checkpoint safetensors estandar y despliegue en vLLM sobre la plataforma DGX Spark GB10. El entrenamiento fue deliberadamente minimo: 10 pasos sobre un conjunto de 16 trayectorias (`minimal_sft_smoke.jsonl`), con LoRA de rango 8 y alpha 16.

Su relevancia es, por tanto, metodologica y de ingenieria: sirve como referencia para quienes construyen agentes financieros con tool calling sobre Llama 3.2 Vision y quieren replicar el flujo de entrenamiento y servicio. No debe emplearse para toma de decisiones de inversion ni para asesoramiento financiero regulado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Mllama (Llama 3.2 Vision), ajuste fino con LoRA/QLoRA |
| Parametros totales | 10.670.220.835 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 11B Vision) |
| Tipos de cuantizacion | no se publican artefactos cuantizados; el autor menciona BF16/FP16 para el entrenamiento LoRA. Compatible con cuantizacion posterior via herramientas externas (no verificada) |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |
| Tamano del repositorio | 21,4 GB |
| Modelo base | unsloth/Llama-3.2-11B-Vision-Instruct |
| Metodo de ajuste | LoRA via PEFT (`lora_bf16`), r=8, alpha=16, dropout=0,05 |
| Optimizacion | max_steps=10, learning_rate=0,0002, batch_size=2 |
| Dataset de entrenamiento | `minimal_sft_smoke.jsonl` (16 trayectorias) |
| Loss final | 0,7442 (media 1,1513) |
| Fecha de build | 2026-11-02T12:07:28Z |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.2-11B-Vision-Instruct`, que emplea la arquitectura Mllama de Meta: un transformer de lenguaje Llama 3.2 combinado con un codificador visual para entrada image-text-to-text. Sobre esa base se aplico un ajuste fino supervisado con LoRA (PEFT) en precision BF16/FP16, con rango 8, alpha 16 y dropout 0,05. Los adaptadores se fusionaron posteriormente en un checkpoint safetensors estandar, listo para servirse con vLLM.

El entrenamiento es extremadamente reducido: 10 pasos de optimizacion sobre 16 trayectorias de ejemplo, con learning rate 2e-4 y batch size 2. El formato de las trayectorias es de dos turnos: una peticion del usuario con un ticker, una respuesta del asistente con una o varias llamadas a herramientas financieras (`lookup_stock_price`, `lookup_technical_indicators`) seguidas de la observacion de la herramienta, y un segundo turno del asistente con razonamiento envuelto en `<think>...</think>`, un bloque de pronostico legible por maquina en `<forecast_json>...</forecast_json>` y un informe final legible por humanos. No se documenta uso de RLHF ni DPO; se trata exclusivamente de SFT.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, heredada del modelo base.
- Razonamiento financiero multi-salto con estructura de dos turnos (peticion, llamada a herramienta, observacion, razonamiento y pronostico).
- Tool calling / function calling con dos herramientas financieras predefinidas: `lookup_stock_price` (OHLCV de un ticker) y `lookup_technical_indicators` (RSI, MACD, BBANDS, SMA, EMA, ATR, OBV, MFI, divergencia y `priced_in_score`).
- Salida estructurada mediante bloques `<think>...</think>` y `<forecast_json>...</forecast_json>` para separar razonamiento y pronostico maquina-legible.
- Capacidad multimodal image-text-to-text heredada del base Mllama (no se documenta entrenamiento especifico sobre vision en este checkpoint).
- Integracion con vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser hermes`.
- Compatibilidad con el SDK de OpenAI a traves de endpoint compatible (`/v1/chat/completions`).

## Casos de uso

- Validacion de pipelines de entrenamiento y despliegue: sirve para comprobar de extremo a extremo el flujo LoRA, fusion de adaptadores, publicacion en Hub y servicio con vLLM antes de lanzar un entrenamiento real.
- Pruebas de integracion de agentes financieros: permite verificar el parseo de tool calls en formato Hermes y la inyeccion de observaciones de herramientas en el bucle del agente.
- Prototipado de interfaces de analisis bursatil: el modelo puede generar bloques `<forecast_json>` con estructura fija, utiles para construir UIs que consuman pronosticos maquina-legibles en un entorno de desarrollo.
- Test de regresion en CI para agentes con function calling: al tener un formato de trayectoria fijo, se puede usar como caso base para validar cambios en el orquestador o en el parser de herramientas.
- Evaluacion comparativa de estrategias de prompt: al ser un checkpoint ligero de ajustar, sirve para medir como responde el modelo base frente al ajustado en tareas de razonamiento financiero con herramientas.
- Demostraciones tecnicas y formacion: util para talleres o articulos que expliquen como construir agentes con tool calling sobre Llama 3.2 Vision sin necesidad de un entrenamiento costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss de entrenamiento: 0,7442 final (media 1,1513) sobre 16 trayectorias y 10 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 21-22 GB solo para los pesos (10,67 mil millones de parametros a 2 bytes), mas overhead de KV cache y activaciones; en la practica se recomienda 24 GB o mas.
- GPU recomendadas: A100 40/80 GB, H100, L40S, o cualquier GPU con 24 GB o mas para BF16. El autor menciona entrenamiento sobre DGX Spark GB10.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 (24 GB) y RTX 5090 en BF16 con margen ajustado; en GPUs de 16 GB requeriria cuantizacion (no se publican artefactos cuantizados oficiales).
- Opciones de despliegue: vLLM (soporte documentado con `--enable-auto-tool-choice` y `--tool-call-parser hermes`), Transformers con `AutoModelForCausalLM` y `device_map="auto"`, y cliente compatible con OpenAI. No se documenta soporte especifico de llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gamblerinsight-1-llama-3.2-11b-smoke | 10,67 B | no disponible | si (2 herramientas financieras) | Apache-2.0 | Hugging Face (tayaee) |
| unsloth/Llama-3.2-11B-Vision-Instruct (base) | 10,67 B | no disponible en esta ficha | no especifico | Llama 3.2 Community License | Hugging Face (unsloth) |
| Llama 3.2 11B Vision Instruct (original Meta) | 10,67 B | no disponible en esta ficha | no especifico | Llama 3.2 Community License | Hugging Face (meta-llama) |

La comparativa se limita al linaje directo del modelo, ya que no se dispone de datos de benchmarks ni de otros modelos financieros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo 10 pasos sobre 16 trayectorias: las salidas pueden ser incompletas, inconsistentes o alucinadas, segun advierte el propio autor.
- No apto para produccion ni para decisiones de trading, gestion de carteras o asesoramiento financiero regulado.
- Las observaciones de herramientas usadas en entrenamiento son instantaneas y pueden estar obsoletas en el momento de la inferencia.
- El modelo no proporciona asesoramiento financiero; cualquier salida debe tratarse como material de investigacion.
- Idiomas limitados a ingles y coreano; no se garantiza un rendimiento adecuado en castellano.
- No se publican artefactos cuantizados oficiales ni benchmarks, lo que dificulta evaluar su calidad real frente a alternativas.
- Aunque la licencia es Apache-2.0, el modelo base `unsloth/Llama-3.2-11B-Vision-Instruct` esta sujeto a la Llama 3.2 Community License, cuyas condiciones pueden afectar al uso comercial del derivado; conviene revisarlas antes de desplegar.
- Riesgo de sesgos heredados del modelo base y del dataset minimo de entrenamiento, no documentados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tayaee/gamblerinsight-1-llama-3.2-11b-smoke
- Modelo base (Unsloth): https://huggingface.co/unsloth/Llama-3.2-11B-Vision-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.2-11B-Vision-Instruct
- Documentacion de vLLM sobre tool calling: no disponible en la informacion proporcionada
- Paper de Llama 3.2: no disponible en la informacion proporcionada
