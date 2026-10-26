# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo660-lora

## Resumen

Este repositorio contiene un adaptador LoRA para Qwen2.5-0.5B-Instruct, publicado por el usuario uygarkurt, orientado especificamente a tool calling estructurado y a la abstención cuando las herramientas ofrecidas no son relevantes. El adaptador se ha entrenado en dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed: primero 2.800 actualizaciones de supervised fine-tuning (SFT) y despues 660 actualizaciones de Group Relative Policy Optimization (GRPO), partiendo del adaptador SFT previo del mismo autor. El resultado es un adaptador PEFT que se carga sobre el modelo base original y que no necesita el adaptador SFT por separado.

El modelo resuelve un problema muy concreto en pipelines de agentes: que un modelo pequeno genere llamadas a funciones con el nombre y los argumentos correctos, y que se abstenga cuando ninguna herramienta disponible encaja con la peticion. Con solo ~0,49B parametros en el modelo base y un adaptador de pocos megabytes (tamano de repo 0,0 GB), esta pensado para entornos con recursos muy limitados, despliegue en CPU o GPU consumer y prototipado rapido de asistentes con function calling.

La relevancia actual reside en la tendencia a especializar modelos pequenos mediante post-entrenamiento (SFT + RL) para tareas acotadas, en lugar de recurrir siempre a modelos grandes. No obstante, conviene contextualizar sus cifras: el adaptador mejora la exactitud de tool calling respecto a su punto de partida SFT, pero el modelo base de 0,5B mantiene un conocimiento general y una capacidad matematica limitados, y la abstención ante herramientas irrelevantes empeora tras la fase GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) con adaptador LoRA (PEFT); modelo base Qwen2.5-0.5B-Instruct |
| Parametros totales | ~0,49B en el modelo base; adaptador LoRA de pocos millones de parametros entrenables (tamano de repo 0,0 GB) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (heredado del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | Adaptador en safetensors; el modelo fusionado puede cuantizarse a 8-bit/4-bit (GPTQ, AWQ, GGUF) tras fusionar y convertir |
| Idiomas soportados | en (ingles) en entrenamiento y evaluacion; el modelo base Qwen2.5 cubre 29 idiomas |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 0,49B parametros con contexto nativo de 32.768 tokens. El entrenamiento se realizo con Post-Training Lab (repositorio del autor) en dos etapas secuenciales sobre el dataset mixto uygarkurt/xlam-tool-calling-mixed. La primera etapa consistio en 2.800 actualizaciones de SFT (0,4 horas de training loop); la segunda continuo ese adaptador SFT con 660 actualizaciones de GRPO (0,4 horas adicionales), sumando 0,8 horas en total. Los tiempos indicados excluyen carga de modelo, preparacion de datos y evaluacion externa.

La innovacion tecnica principal es el uso de GRPO para reforzar el comportamiento de tool calling y de abstención sobre un adaptador ya ajustado con SFT, sin reentrenar desde cero. El dataset combina ejemplos de llamadas a funciones con casos en los que las herramientas ofrecidas no son relevantes, de modo que el modelo aprenda tanto a invocar como a rechazar. No se documentan en la informacion disponible detalles sobre el volumen total de tokens, la composicion exacta del dataset ni el uso de tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado y function calling: genera llamadas con nombre de funcion y argumentos (evaluado con xLAM ETC y FNA, y con subconjuntos de BFCL-v3 single-turn).
- Abstención ante herramientas irrelevantes: capacidad de no emitir una llamada cuando ninguna herramienta encaja (subconjuntos Relevance/Irrelevance).
- Razonamiento multi-paso basico dentro de flujos de agente, limitado por el tamano del modelo.
- Capacidades generales heredadas del modelo base (conocimiento, matemáticas, seguimiento de instrucciones), con rendimiento bajo segun los benchmarks reportados.
- Soporte multilingue limitado al modelo base; el adaptador se entrena y evalua unicamente en ingles.
- No se documentan capacidades de vision, audio ni modos de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Enrutamiento de herramientas en agentes ligeros: el adaptador decide si una peticion del usuario debe convertirse en una llamada a funcion y con que argumentos, lo que permite construir agentes de bajo coste en dispositivos con poca VRAM.
- Asistentes de soporte con APIs acotadas: integrado en un backend que expone un conjunto fijo de funciones (consultar pedido, abrir ticket), el modelo genera la llamada correcta y se abstiene cuando la consulta queda fuera de alcance.
- Prototipado rapido de function calling: al ser un adaptador pequeno y de carga rapida, sirve para validar esquemas de herramientas y prompts antes de migrar a un modelo mayor.
- Despliegue en el borde o en CPU: con ~0,5B parametros puede ejecutarse en portatiles, Raspberry Pi o contenedores sin GPU para tareas de clasificacion y extraccion de intenciones.
- Filtrado y validacion de llamadas en pipelines: usar el modelo como primera etapa que propone una llamada a herramienta y un modelo mayor o una capa de validacion la confirma.
- Investigacion en post-entrenamiento: el repositorio y el dataset sirven como referencia reproducible de un flujo SFT + GRPO para tool calling en modelos pequenos.
- Generacion de JSON estructurado para integraciones: producir payloads de llamada a API a partir de lenguaje natural en entornos con restricciones de latencia y memoria.

## Benchmarks y rendimiento

Datos reportados por el autor (porcentajes). La primera fila es el adaptador SFT usado para inicializar GRPO; la segunda es el adaptador SFT + GRPO de este repositorio.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance |
|---|---|---|---|---|---|---|---|---|
| SFT (2.800 updates) | 39,80% | 18,40% | 29,57% | 73,72% | 95,89% | 51,76% | 83,33% | 58,83% |
| SFT + GRPO (660 updates) | 39,76% | 18,20% | 30,50% | 76,43% | 96,50% | 54,36% | 88,89% | 48,84% |

Notas del autor: xLAM ETC es exactitud exacta de la llamada y xLAM FNA es exactitud del nombre de funcion, calculadas sobre un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 omitidos. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 single-turn; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB en fp16/bf16 para el modelo base de 0,49B, mas el overhead del adaptador; aproximadamente 0,4-0,6 GB en cuantizacion 4-bit tras fusionar y convertir.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas (GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090); tambien viable en CPU por el reducido tamano.
- Cabe en GPU consumer: si, con margen amplio, incluso en tarjetas de gama baja o en modo CPU-only.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM con soporte LoRA, TGI, y llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput: no disponible (no se han publicado mediciones en la informacion proporcionada).

## Comparativa con modelos similares

Datos de parametros, contexto y licencia segun fichas publicas de cada modelo; los datos de rendimiento de los competidores no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (SFT + GRPO) | ~0,49B base + LoRA | 32.768 tokens | no disponible (adaptador); base Apache 2.0 | HuggingFace (PEFT) |
| Qwen2.5-0.5B-Instruct (base) | ~0,49B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace / Meta |

Comparado con el modelo base sin ajustar, este adaptador prioriza el tool calling y la abstención a costa de un rendimiento general equivalente o ligeramente inferior; frente a alternativas de 1-1,5B ofrece menor huella de memoria pero tambien menor capacidad de razonamiento y conocimiento.

## Limitaciones y advertencias

- Modelo pequeno (~0,49B): MMLU 39,76% y MATH-500 18,20% reflejan conocimiento general y matemáticas limitados; no es adecuado para tareas que exijan razonamiento complejo.
- Tool calling no perfecto: BFCL single-turn FC del 54,36% y xLAM ETC del 76,43% implican una tasa relevante de llamadas incorrectas en produccion.
- Regresion en abstención: la exactitud de irrelevancia cae del 58,83% (SFT) al 48,84% (SFT + GRPO); el modelo tiende mas a invocar herramientas aunque no proceda, lo que exige capas de validacion.
- Idioma: entrenado y evaluado solo en ingles; el rendimiento en castellano u otros idiomas no esta garantizado pese al soporte multilingue del modelo base.
- Licencia del adaptador no declarada: es necesario verificar los terminos antes de un uso comercial; el modelo base es Apache 2.0.
- Dependencia del modelo base: es un adaptador LoRA, no un modelo autonomo; requiere cargar Qwen2.5-0.5B-Instruct.
- Contexto: aunque el modelo base admite 32.768 tokens, no se documenta entrenamiento para contexto largo, por lo que el rendimiento en ventanas extensas puede degradarse.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de tasa de alucinacion en la informacion disponible.
- Los benchmarks son agregados propios del estudio y no directamente comparables con resultados publicos de terceros.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-grpo660-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
