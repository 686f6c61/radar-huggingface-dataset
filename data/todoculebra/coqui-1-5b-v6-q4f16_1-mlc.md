# todoculebra/coqui-1.5b-v6-q4f16_1-MLC

## Resumen

Coquí 1.5B v6 es un ajuste fino (fine-tune) de Qwen2.5-1.5B-Instruct desarrollado por Isla Tech LLC (Todo Culebra, Culebra, Puerto Rico), convertido al formato MLC / web-llm para ejecutarse en el navegador sobre WebGPU sin conexión a internet. El modelo responde a preguntas de viaje sobre Culebra, Vieques, San Juan y las Islas Vírgenes de Estados Unidos en inglés y español, apoyándose en las notas off-line de la aplicación Todo Culebra. Su propósito es servir como "cerebro de viaje" local dentro de dicha aplicación (https://todoculebra.com/app).

Se trata de un modelo transformer decoder-only de aproximadamente 1,5 mil millones de parametros, cuantizado a 4 bits con tamano de grupo 32. La version v6 parte de la v1 (coqui-1.5b-v1) y añade un nuevo adaptador LoRA entrenado sobre unas 1.400 parejas pregunta/respuesta redactadas a partir de las notas publicas de viaje de Todo Culebra, con verificacion de cada respuesta contra su nota correspondiente antes del entrenamiento.

Su relevancia radica en el despliegue: al estar en formato MLC/web-llm, se ejecuta integramente en el cliente (navegador), con pesos de 0,9 GB, lo que permite asistencia de viaje en ingles y español sin enviar datos a un servidor. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | ~1,5 mil millones (heredados del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | 4 bits, group size 32; variantes q4f16_1 (shader-f16) y q4f32_1 |
| Idiomas soportados | ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC / web-llm (compilado); no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only. Sobre esa base, el autor aplica un ajuste fino mediante LoRA continuando desde coqui-1.5b-v1. El conjunto de entrenamiento de esta version consta de aproximadamente 1.400 parejas pregunta/respuesta generadas a partir de las notas publicas de viaje de Todo Culebra por un modelo profesor abierto, y cada par fue verificado contra su nota antes de entrar en el entrenamiento: se descartaron aquellos con lugares erroneos, horarios o precios inventados, o idioma incorrecto. No se utilizaron conversaciones reales de huespedes.

Tras el ajuste, el adaptador se fusiono (merge) con el modelo base y se cuantizo a 4 bits con group size 32, generando las variantes q4f16_1 y q4f32_1. Ambas reutilizan la libreria de modelo precompilada de web-llm para Qwen2.5-1.5B-Instruct, lo que explica que no se distribuyan pesos en safetensors ni GGUF, sino en el formato propio de MLC. No se documenta en la informacion disponible ningun uso de RLHF o DPO adicional mas alla del ajuste supervisado descrito.

## Capacidades

- Generacion de texto conversacional en ingles y espanol.
- Respuesta a preguntas de viaje sobre Culebra, Vieques, San Juan y las Islas Virgenes de Estados Unidos, a partir de las notas off-line de la aplicacion.
- Ejecucion local en el navegador mediante WebGPU, sin conexion a internet (offline).
- Respuestas ancladas a un corpus de notas verificadas, con descarte de datos incorrectos durante el entrenamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Asistente de viaje off-line en el navegador: integrado en web-llm sobre WebGPU, responde dudas sobre Culebra, Vieques, San Juan y las Islas Virgenes sin necesidad de conexion, lo que es adecuado para zonas con cobertura limitada.
- Aplicacion movil de turismo sin servidor: al pesar 0,9 GB y usar la variante q4f16_1, puede desplegarse en telefonos y portatiles compatibles con shader-f16, evitando costes de backend e inferencia en la nube.
- Atencion bilingue en mostrador o quiosco: el modelo atiende consultas en ingles y espanol, lo que encaja con el publico turistico de Puerto Rico y las Islas Virgenes.
- Base para fine-tunes de dominio turistico: al ser un ajuste LoRA sobre Qwen2.5-1.5B-Instruct con licencia Apache 2.0, sirve como punto de partida para otros destinos o verticales de viaje.
- Demo educativa de LLM en el navegador: permite mostrar inferencia local con WebGPU en charlas o talleres sin infraestructura de servidor.
- Redaccion de respuestas de viaje asistidas: ayuda a generar borradores de respuestas sobre lugares, rutas o recomendaciones a partir de notas estructuradas, siempre que no se soliciten datos criticos en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta puntuaciones internas de la aplicacion:

| Prueba | v6 | v1 |
|---|---|---|
| Test de la isla (211 preguntas, dentro de la app con sus notas y codigo) | 205 / 211 | 203 / 211 |
| Preguntas nuevas de huespedes (50, sin ajuste previo) | 36 / 50 | 33 / 50 |

Estas cifras corresponden a evaluaciones internas con el contexto de la aplicacion y no son comparables con benchmarks publicos estandarizados.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 0,9 GB en disco (repo), coherente con una cuantizacion de 4 bits de un modelo de 1,5B; el consumo en ejecucion depende del runtime de MLC/web-llm.
- Cabe en GPU de consumo: si, en telefonos y portatiles con soporte de shader-f16 para la variante q4f16_1.
- GPU recomendadas: no especificadas en la informacion proporcionada. El objetivo de despliegue es el navegador con WebGPU, no servidores con A100/H100.
- Opciones de despliegue: MLC LLM y web-llm (formato compilado MLC). No es compatible directamente con llama.cpp u Ollama, que usan GGUF, ni con formatos safetensors para vLLM/TGI sin reconversion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| Coqui 1.5B v6 (este modelo) | ~1,5B | no disponible (base: 32.768) | Apache 2.0 | MLC / web-llm (navegador, WebGPU) |
| Qwen2.5-1.5B-Instruct (modelo base) | ~1,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, MLC, etc. |
| Qwen2-1.5B-Instruct-q4f16_1-MLC (mlc-ai) | ~1,5B | 32.768 tokens (familia Qwen2) | Apache 2.0 | MLC / web-llm |
| Coqui 1.5B v1 (todoculebra) | ~1,5B | no disponible | Apache 2.0 | MLC / web-llm |

La comparacion con alternativas de la misma categoria (por ejemplo Llama-3.2-1B o Gemma-2-2B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor indica que el modelo no debe usarse para precios, horarios, numeros de telefono ni emergencias: la aplicacion responde a esas consultas desde codigo, nunca desde el modelo.
- Riesgo de alucinacion: aunque el entrenamiento descarta respuestas con lugares, horarios o precios inventados, el modelo sigue siendo un generador de texto y puede producir informacion incorrecta fuera del corpus verificado.
- Ambito limitado: esta especializado en viajes a Culebra, Vieques, San Juan y las Islas Virgenes de Estados Unidos; no es un modelo de proposito general.
- Idiomas: solo ingles y espanol; no se garantiza un comportamiento correcto en otros idiomas.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificar la configuracion de MLC antes de usarlo en conversaciones largas.
- Licencia Apache 2.0, igual que el modelo base, por lo que permite uso comercial; el autor (Isla Tech LLC, 2026) figura como responsable de la modificacion.
- Sin traccion en la plataforma: 0 descargas y 0 "likes" en el momento de la consulta.
- Formato cerrado a MLC/web-llm: no se distribuyen pesos en safetensors ni GGUF, lo que limita su uso en otros runtimes sin reconversion.
- No se han utilizado conversaciones reales de huespedes en el entrenamiento, segun el autor.

## Enlaces

- Modelo en HuggingFace (v6): https://huggingface.co/todoculebra/coqui-1.5b-v6-q4f16_1-MLC
- Version anterior (v1): https://huggingface.co/todoculebra/coqui-1.5b-v1-q4f16_1-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Aplicacion Todo Culebra: https://todoculebra.com/app
- Libreria MLC de referencia (Qwen2): https://huggingface.co/mlc-ai/Qwen2-1.5B-Instruct-q4f16_1-MLC
- Releases de librerias binarias MLC LLM: https://github.com/mlc-ai/binary-mlc-llm-libs/releases
- Documentacion de MLC LLM (cuantizacion y configuracion): https://deepwiki.com/mlc-ai/mlc-llm/4.1-quantization-and-optimization
- Modelos de Coqui STT (proyecto distinto, sin relacion con este modelo): https://github.com/coqui-ai/STT-models
