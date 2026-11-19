# unsloth/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI, disenado especificamente para agentes que razonan y ejecutan llamadas a herramientas en dispositivos locales. Con 24.000 millones de parametros totales pero solo 2.450 millones activos por token, combina la capacidad de un modelo grande con el coste computacional de uno pequeno. Es el modelo mas grande y el ultimo de la familia LFM2.5, que abarca desde 230M hasta estos 24B.

La arquitectura es hibrida: 40 capas en total, de las cuales 30 son bloques de convolucion corta con doble compuerta (double-gated short convolution) y 10 son capas de atencion GQA. Cada bloque MoE contiene 64 expertos con enrutamiento top-4. El modelo fue entrenado con 36 billones de tokens y soporta una ventana de contexto de 131.072 tokens en 16 idiomas.

Esta ficha corresponde a la version GGUF publicada por Unsloth, cuantizada con su metodologia Dynamic 3.0, orientada a inferencia en CPU y despliegue local con llama.cpp y herramientas compatibles. El modelo base es de solo texto, con modo de razonamiento siempre activo ("always thinks before it answers"), lo que lo hace relevante para pipelines agenticos donde se necesita razonamiento explicito con latencia contenida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE: 30 bloques de convolucion corta con doble compuerta + 10 capas GQA |
| Parametros totales | 23.971.587.712 (24,0B) |
| Parametros activos | 2,45B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF (Unsloth Dynamic 3.0); el modelo base ofrece tambien FP8, ONNX y MLX-4bit |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | GGUF (repo de 171,1 GB con multiples niveles de cuantizacion) |
| Expertos por bloque MoE | 64, enrutamiento top-4 |
| Tamano de vocabulario | 128.000 tokens |
| Parametros de generacion | temperature 0.1, top_k 50, repetition_penalty 1.05 |
| Libreria | transformers |
| Modelo base | LiquidAI/LFM2.5-24B-A2B |
| Descargas (HF) | 540.526 |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

LFM2.5-24B-A2B emplea una arquitectura hibrida que sustituye la mayoria de capas de atencion por convoluciones cortas con doble compuerta: de las 40 capas, 30 son bloques convolucionales y solo 10 son capas de atencion con Grouped Query Attention. Esta eleccion reduce el coste de atencion sobre contextos largos y mejora la eficiencia en inferencia local. El componente MoE anade 64 expertos por bloque con enrutamiento top-4, de modo que cada token activa unicamente 2,45B de los 24B parametros totales.

El entrenamiento consumio 36 billones de tokens. La model card indica que el modelo ha pasado por una fase de post-entrenamiento orientada a cargas de trabajo agenticas (la version base, LFM2.5-24B-A2B-Base, se publica por separado para fine-tuning). El modelo incorpora razonamiento explicito obligatorio antes de responder, lo que multiplica el numero de tokens generados pero a coste reducido gracias al bajo numero de parametros activos. Liquid AI reporta hasta 1,7x mas velocidad que MoEs comparables en dispositivo, 184 tok/s en un Apple M5 Max y hasta 21K tokens de salida por segundo en una unica GPU NVIDIA B300. Existe tambien un modelo draft (DSpark) anunciado para decodificacion especulativa con SGLang.

## Capacidades

- Generacion de texto y razonamiento explicito: el modelo siempre genera una cadena de razonamiento antes de la respuesta final.
- Llamada a herramientas (tool calling / function calling), con rendimiento destacado en tareas agenticas segun la model card.
- Razonamiento multi-paso y flujos agenticos: disenado para agentes que razonan, invocan herramientas y operan de forma fiable en dispositivo.
- Capacidades multilingues en 16 idiomas, incluido el espanol.
- Contexto largo de 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Inferencia eficiente en hardware de consumo gracias a los 2,45B parametros activos.
- Modelo exclusivamente de texto: no soporta vision ni audio segun la informacion disponible.
- No se documentan capacidades de "thinking mode" configurables ni modos sin razonamiento: el razonamiento es siempre activo.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas en un portatil o estacion de trabajo, gracias a sus 2,45B parametros activos y a la cuantizacion GGUF, manteniendo los datos en el dispositivo.
- Asistente de atencion al cliente multi-turno: con 131.072 tokens de contexto puede mantener conversaciones largas con historial extenso y documentacion de producto adjunta, en espanol y otros 15 idiomas.
- Generacion de codigo con integracion en herramientas: su soporte de function calling permite conectarlo a ejecutores de codigo, linters o APIs de CI/CD como paso previo a la aplicacion de cambios.
- Procesamiento de documentos largos en local: resumen, extraccion de datos y preguntas sobre contratos o informes de decenas de miles de tokens sin enviar datos a la nube.
- Automatizacion de back-office con privacidad: clasificacion y redaccion de correos, tickets o formularios en entornos con requisitos de confidencialidad, usando llama.cpp u Ollama sobre CPU.
- Razonamiento sobre datos estructurados via tool calling: consultas a bases de datos o APIs internas donde el modelo decide que herramienta invocar y compone la respuesta final.
- Despliegue en Apple Silicon: la variante MLX-4bit del modelo base y los GGUF permiten inferencia rapida en Macs (184 tok/s reportados en M5 Max), util para prototipado y demos.
- Fine-tuning posterior: al existir version base y pesos en formato nativo, se puede adaptar a dominios concretos y luego cuantizar a GGUF con Unsloth.

## Benchmarks y rendimiento

La model card menciona un resultado concreto: 48,09 en LiveClaw frente a 38,19 de Qwen3.6-35B-A3B, un modelo con aproximadamente un 50% mas de parametros totales y activos. No se han publicado en la informacion disponible resultados numericos de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw (agentico/tool use) | 48,09 | 38,19 |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

Datos de rendimiento de inferencia reportados por el autor: 184 tok/s en Apple M5 Max y hasta 21K tokens de salida por segundo en una NVIDIA B300; hasta 1,7x mas rapido que MoEs comparables en dispositivo.

## Requisitos de hardware

- VRAM/RAM estimada: el repo GGUF ocupa 171,1 GB en total con todas las cuantizaciones; una cuantizacion de 4 bits del modelo de 24B ronda los 13-15 GB, y una de 8 bits alrededor de 25-26 GB (estimacion a partir del numero de parametros; no confirmada en la informacion disponible).
- GPU recomendadas: NVIDIA B300 para maximo throughput (hasta 21K tok/s de salida reportados); A100/H100 para servicio de alta concurrencia con vLLM o SGLang usando los pesos nativos o FP8; RTX 4090 (24 GB) puede alojar cuantizaciones de 4-8 bits.
- Consumer GPU: si, en tarjetas con 16-24 GB de VRAM usando cuantizaciones GGUF de 4-6 bits; tambien viable en CPU con llama.cpp gracias al bajo numero de parametros activos.
- Apple Silicon: soportado via MLX-4bit (modelo base) y GGUF; 184 tok/s reportados en M5 Max.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio), vLLM y SGLang con los pesos nativos o FP8, ONNX Runtime, MLX, y la app Unsloth Desktop.
- Latencia y throughput: dependen fuertemente del hardware; los unicos datos publicados son los de M5 Max y B300 citados arriba.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-24B-A2B | 24B / 2,45B | 131.072 | lfm1.0 | Razonamiento siempre activo; 48,09 en LiveClaw; optimizado para edge |
| Qwen3.6-35B-A3B | ~35B / ~3B (aprox., segun la model card) | no disponible | no disponible | 38,19 en LiveClaw; ~50% mas de parametros totales y activos |
| LFM2.5-230M | 230M | no disponible | lfm1.0 | Miembro pequeno de la misma familia, para despliegue ultra-ligero |

No se dispone en la informacion proporcionada de datos suficientes para comparar con otras alternativas MoE de tamano similar (por ejemplo, variantes de la familia Mixtral o DeepSeek); se indica como no disponible.

## Limitaciones y advertencias

- Licencia lfm1.0 (marcada como "other"): es una licencia propia de Liquid AI, no una licencia open source estandar; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- Modelo exclusivamente de texto: no procesa imagenes ni audio.
- Razonamiento siempre activo: cada respuesta genera tokens de pensamiento, lo que aumenta la latencia y el consumo de tokens frente a modelos sin modo razonamiento; los parametros de generacion recomendados (temperature 0.1, top_k 50) estan pensados para ese flujo.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en tareas agenticas, una llamada a herramienta mal formada puede tener efectos reales, por lo que se recomienda validacion y sandboxing.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Cobertura idiomatica: 16 idiomas declarados; el rendimiento fuera de ellos no esta garantizado.
- La cuantizacion GGUF de Unsloth introduce perdida de precision respecto al modelo original; para maxima calidad conviene usar los pesos nativos o FP8.
- Los datos de rendimiento (tok/s) provienen del autor y corresponden a hardware especifico; no deben extrapolarse sin medir en el hardware objetivo.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/unsloth/LFM2.5-24B-A2B-GGUF
- Modelo base original: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Version base para fine-tuning: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Version FP8: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-FP8
- Version GGUF oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Version ONNX: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-ONNX
- Version MLX-4bit: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-MLX-4bit
- Modelo pequeno de la familia: https://huggingface.co/LiquidAI/LFM2.5-230M
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Unsloth (web): https://unsloth.ai/
- Unsloth (GitHub): https://github.com/unslothai/unsloth/
- Documentacion de Unsloth: https://unsloth.ai/docs/
- App Unsloth Desktop: https://unsloth.ai/docs/desktop
- Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Paper de referencia (arXiv): https://arxiv.org/abs/2511.23404
