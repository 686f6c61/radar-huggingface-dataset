# spkc83/retail-bank-servicing-agent-9b-peft-v10-longctx

## Resumen

`spkc83/retail-bank-servicing-agent-9b-peft-v10-longctx` es un adaptador LoRA (PEFT) de investigacion desarrollado por spkc83 para una demostracion sintetica de atencion al cliente en banca minorista. Se entrena sobre el modelo base `spkc83/retail-bank-servicing-agent-9b`, que cuenta con aproximadamente 8.800 millones de parametros y utiliza un formato nativo de tool-call basado en JSON etiquetado. El adaptador se publica en BF16 con rango 32 y alpha 64, y no incluye pesos fusionados.

El adaptador se entrena con el dataset `spkc83/retail-bank-servicing-alignment-sft` (3467 registros de entrenamiento y 421 de validacion) y un manifiesto de nueve herramientas sinteticas de banca minorista. La longitud maxima de secuencia declarada es de 2048 tokens, a pesar del sufijo "longctx" en el nombre. Esta pensado exclusivamente para un POC sintetico: no tiene acceso a sistemas bancarios reales, no ofrece asesoramiento financiero y puede cometer errores en la seleccion de herramientas o en las afirmaciones generadas.

El checkpoint es relevante para desarrolladores que quieran explorar el fine-tuning con LoRA sobre un modelo de 9B con tool calling, evaluar el comportamiento en entornos bancarios simulados o reutilizar la metodologia de entrenamiento con mascara de objetivos solo en el asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador basado en el modelo base `spkc83/retail-bank-servicing-agent-9b` (no se especifica detalle de la arquitectura del base) |
| Parametros totales | Aproximadamente 8,8 mil millones (base) + adaptador LoRA (0,4 GB en BF16) |
| Parametros activos | No disponible (el modelo base podria ser denso o MoE, no se especifica) |
| Longitud de contexto | 2048 tokens (maxima secuencia de entrenamiento; contexto del base no disponible) |
| Tipos de cuantizacion | BF16 (adaptador); el base puede requerir cuantizacion para inferencia (no especificado) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PEFT LoRA en safetensors (sin `config.json`; cargar con `PeftModel.from_pretrained`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 entrenado sobre el modelo base `spkc83/retail-bank-servicing-agent-9b` en la revision `1d56824995aa1adecfe20f62ca42fb1c0c443817`. El modelo base tiene aproximadamente 8,8 mil millones de parametros y usa un formato nativo de tool-call basado en JSON etiquetado, que el adaptador hereda y refuerza. No se dispone de informacion sobre el tipo de arquitectura del base (si es transformer denso, MoE o hibrido) ni sobre su proceso de entrenamiento previo.

El entrenamiento del adaptador se realizo con el dataset `spkc83/retail-bank-servicing-alignment-sft` en la revision `e9d67b3d6183f216f51d664fc53983f432e664ef`, con 3467 registros de entrenamiento y 421 de validacion. Se aplico mascara de target solo en el asistente, limitando la perdida a los span de tool-call y respuesta final. El optimizador avanzo 2000 pasos con una longitud maxima de secuencia de 2048 tokens. El manifiesto de herramientas incluye nueve herramientas sinteticas de banca minorista. No se menciona el uso de RLHF o DPO; el proceso es de tipo SFT (supervised fine-tuning).

## Capacidades

- Generacion de texto conversacional orientado a atencion al cliente en banca minorista.
- Soporte de tool calling mediante el formato nativo de JSON etiquetado del modelo base.
- Capacidad de ejecutar llamadas a herramientas y generar respuestas finales basadas en los resultados de dichas herramientas.
- Manejo de conversaciones multi-turno dentro de la ventana de contexto de 2048 tokens.
- Entrenado especificamente para el dominio de banca retail sintetica (consultas de saldo, transferencias, informacion de productos, etc.).
- No se disponen de datos sobre capacidades adicionales como vision, audio, razonamiento avanzado o soporte de agentes complejos.

## Casos de uso

- **POC de atencion al cliente bancaria**: el modelo puede gestionar conversaciones simuladas de clientes de un banco minorista, respondiendo a preguntas frecuentes y ejecutando herramientas sinteticas (por ejemplo, consultar saldo o historial) dentro de un entorno controlado.
- **Evaluacion de tool calling**: dado que el adaptador esta entrenado para generar llamadas a herramientas en formato JSON etiquetado, es util para probar la sintaxis y la coherencia de las tool calls en un pipeline de agentes.
- **Prototipo de agente conversacional**: se puede integrar en un sistema de demostracion que combine el modelo con un backend simulado de banca para validar flujos de conversacion multi-turno.
- **Investigacion sobre fine-tuning con LoRA**: sirve como ejemplo de adaptacion de un modelo de 9B con un dataset pequeno (3467 registros) y una mascara de target especifica, para estudiar el impacto en la precision de las tool calls.
- **Testing de integracion de PEFT**: permite probar la carga de adaptadores con `PeftModel.from_pretrained` sobre un base fijado en una revision concreta, util para pipelines de despliegue.
- **Generacion de datos sinteticos**: dado que el modelo opera en un dominio bancario simulado, puede usarse para generar ejemplos de conversaciones etiquetadas para entrenar o evaluar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de evaluacion de MMLU, HumanEval, GSM8K ni de metricas de tool calling sobre el modelo o el adaptador.

## Requisitos de hardware

- El adaptador LoRA en BF16 ocupa aproximadamente 0,4 GB, pero para inferencia se necesita cargar el modelo base completo (aproximadamente 8,8 mil millones de parametros).
- En BF16, el base requiere alrededor de 17,6 GB de VRAM. Con cuantizacion a 4 bits, se estima un uso de 5-6 GB, lo que permitiria ejecucion en GPUs consumer como RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen.
- Para inferencia con cuantizacion 8-bit, se requieren aproximadamente 9-10 GB de VRAM; con 4-bit, alrededor de 6 GB.
- Opciones de despliegue: el adaptador se carga con `PeftModel.from_pretrained` sobre el base; se puede usar con librerias como vLLM, llama.cpp u Ollama si se fusionan los pesos o se soporta PEFT (verificar compatibilidad).
- No se disponen de datos de latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `spkc83/retail-bank-servicing-agent-9b-peft-v10-longctx` | ~8,8B (base) + LoRA | 2048 (entrenamiento) | Si (JSON etiquetado) | Apache-2.0 | Publico en HF |
| `spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch2` | ~8,8B (base) + LoRA | No disponible | Si (JSON etiquetado) | Apache-2.0 | Publico en HF |
| `spkc83/retail-bank-servicing-moe-9b` | ~8,8B (MoE, experimental) | No disponible | No disponible | Apache-2.0 | Publico en HF (via FriendliAI) |

No se dispone de informacion detallada sobre los modelos comparables de la misma categoria (otros adaptadores del autor) para evaluar diferencias de rendimiento. Los tres comparten el mismo dominio y licencia, pero no hay datos de benchmarks publicados.

## Limitaciones y advertencias

- El modelo es un checkpoint de investigacion para una POC sintetica; no debe usarse en produccion sin una evaluacion exhaustiva.
- No tiene acceso a sistemas bancarios reales; todas las herramientas son sinteticas y los resultados no reflejan operaciones reales.
- Puede seleccionar herramientas incorrectas o generar afirmaciones sin respaldo en los resultados de las herramientas.
- No es un asesor financiero; no debe usarse para dar consejos financieros.
- La longitud de contexto es de 2048 tokens durante el entrenamiento; el contexto del modelo base no se ha especificado, por lo que puede haber limitaciones en conversaciones muy largas.
- No se han publicado benchmarks ni evaluaciones de sesgo o alucinacion.
- El adaptador no incluye `config.json` ni pesos fusionados; es necesario cargarlo sobre la revision exacta del base (`1d5682498211aa1adecfe20f62ca42fb1f0c443817`) para que funcione correctamente.
- El comportamiento fuera de distribucion (OOD) no ha sido evaluado, lo que implica riesgo de respuestas incoherentes o incorrectas en dominios no cubiertos por el dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v10-longctx
- Modelo base: https://huggingface.co/spkc83/retail-bank-servicing-agent-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/spkc83/retail-bank-servicing-alignment-sft
- Repositorio GitHub del proyecto: https://github.com/spkc83/retail-bank-servicing
- Adaptador relacionado (v9-scratch2): https://huggingface.co/spkc83/retail-bank-servicing-agent-9b-peft-v9-scratch2
- Adaptador relacionado (v9b-conversational-voice): https://free2aitools.com/model/spkc83/retail-bank-servicing-agent-9b-peft-v9b-conversational-voice
- Modelo MoE experimental: https://friendli.ai/models/spkc83/retail-bank-servicing-moe-9b
