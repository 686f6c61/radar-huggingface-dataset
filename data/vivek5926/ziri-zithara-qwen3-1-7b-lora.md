# Vivek5926/ziri-zithara-qwen3-1.7b-lora

## Resumen

Ziri LoRA adapter (Qwen3-1.7B) es un adaptador LoRA de tipo PEFT publicado por el usuario Vivek5926 sobre el modelo base Qwen/Qwen3-1.7B. Su proposito declarado en la model card es actuar como asistente conversacional para el sitio web de Ziri / Zithara.AI, cubriendo preguntas y respuestas de tipo CRM en el sector retail y, mas concretamente, en joyeria. No se trata por tanto de un modelo de proposito general, sino de un ajuste fino vertical orientado a un dominio comercial muy concreto.

El repositorio contiene unicamente los pesos del adaptador (aproximadamente 70 MB, con un tamano total de repo de 0.1 GB), no los pesos del modelo base. Esto implica que para utilizarlo es imprescindible descargar Qwen/Qwen3-1.7B y cargar el adaptador mediante la libreria `peft` o fusionarlo con `merge_and_unload()`. La licencia declarada es Apache-2.0.

Su relevancia practica es doble. Por un lado, ilustra el patron habitual de adaptacion de un modelo pequeno y denso (1.7B parametros) para una tarea de negocio concreta con un coste de entrenamiento y almacenamiento muy bajo. Por otro, sirve como ejemplo de publicacion de adaptadores LoRA en HuggingFace con documentacion minima: el repositorio no incluye informacion sobre el dataset de entrenamiento, hiperparametros, idiomas soportados ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | No disponible (adaptador de ~70 MB; el modelo base Qwen3-1.7B tiene 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; admite fusion con el base y posterior cuantizacion, pero no se documenta) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-1.7B, un transformer denso, sobre el que se aplica un ajuste fino con Low-Rank Adaptation (LoRA). El repositorio declara `library_name: peft` y el tag `lora`, de modo que el artefacto es un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base, no un modelo completo. El tamano del adaptador (~70 MB) es coherente con un rango LoRA moderado sobre un modelo de 1.7B parametros.

La informacion disponible no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO. La model card unicamente indica que se trata de un fine-tune para el asistente del sitio web de Ziri / Zithara.AI, en el contexto de preguntas y respuestas de CRM de retail y joyeria. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento u otras).

## Capacidades

- Generacion de texto conversacional en formato de chat (pipeline declarado: `text-generation`).
- Respuesta a preguntas de negocio orientadas a CRM de retail y joyeria, segun la descripcion del autor.
- Mantenimiento de conversaciones multi-turno, dentro de los limites de contexto del modelo base.
- Soporte de tool calling / function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno).
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo se publica como adaptador de texto; no se declara ninguna modalidad adicional.

## Casos de uso

- Asistente de atencion al cliente en una joyeria online: el adaptador se integra como capa conversacional sobre Qwen3-1.7B para responder consultas recurrentes sobre materiales, tallas, grabados y disponibilidad, apoyandose en el ajuste especifico de dominio en lugar de un prompt generico.
- Respuestas a preguntas frecuentes sobre catalogo: dado que el modelo esta ajustado sobre material de Zithara.AI, encaja en escenarios de Q&A cerrado donde las respuestas deben ceñirse a la informacion de producto de la marca y no divagar.
- Soporte postventa y seguimiento de pedidos: uso como primer nivel de atencion en conversaciones multi-turno, escalando a un agente humano cuando la consulta queda fuera del dominio del ajuste.
- Generacion de respuestas breves y de bajo coste en widgets web: al requerir unicamente un modelo base de 1.7B mas un adaptador de 70 MB, es viable desplegarlo en infraestructura modesta o incluso en una unica GPU de consumo, lo que abarata servir un chatbot embebido con trafico alto.
- Prototipado rapido de asistentes verticales: sirve como plantilla reproducible para equipos que quieran clonar el flujo (modelo base pequeno + LoRA + publicacion en el Hub) en otros sectores como moda, relojeria o bienes de lujo.
- Enrutado y triaje de consultas entrantes: clasificacion conversacional previa que decide si una consulta debe ir a un agente humano, a un sistema de pedidos o a una FAQ automatica, aprovechando el ajuste al vocabulario comercial del dominio.
- Experimentacion academica con PEFT: por su tamano reducido y su licencia permisiva, es un caso practico util para estudiar el comportamiento de adaptadores LoRA de bajo rango sobre modelos densos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco comparaciones con el modelo base sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en bf16/fp16: en torno a 3.4 GB solo para los pesos (1.7B x 2 bytes), mas el adaptador (~70 MB) y la cache KV; en la practica, un presupuesto de 4-6 GB es razonable.
- VRAM estimada en cuantizacion de 8 bits: del orden de 1.8-2.5 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: del orden de 1.0-1.5 GB para los pesos, mas cache KV.
- Cabe en GPU de consumo: si. Es viable en tarjetas con 6-8 GB o mas, como RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores.
- GPU de centro de datos: A100, H100 y L40S son sobradamente suficientes y permitirian lotes grandes y alta concurrencia.
- CPU: la inferencia en CPU es posible tras convertir el modelo fusionado a formato GGUF, aunque no se documenta en el repositorio.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado por el autor), fusion con `merge_and_unload()` y posterior conversion a GGUF para llama.cpp u Ollama, o servido con vLLM y TGI una vez fusionado el adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ziri LoRA (Qwen3-1.7B) | Adaptador sobre 1.7B | No disponible | Apache-2.0 | HuggingFace, requiere el modelo base |
| Qwen/Qwen3-1.7B | 1.7B | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace, pesos completos |
| Alternativas de rango similar (p. ej. familias de 1-2B de otros proveedores) | 1-2B | No disponible | Variable | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre este adaptador y otros modelos de la misma categoria. Cualquier comparacion cuantitativa requeriria evaluar el adaptador sobre un conjunto de validacion propio, dado que el autor no publica metricas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni la composicion del dataset de ajuste.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo de 1.7B. Es especialmente relevante en un contexto de CRM y joyeria, donde datos como precios, plazos de entrega o materiales deben validarse contra una fuente de verdad externa.
- Limitaciones de contexto e idioma: no se especifican. El campo de idiomas de la ficha de HuggingFace esta vacio, por lo que no puede confirmarse el soporte multilingue ni la calidad en idiomas distintos del usado durante el ajuste.
- Restricciones de licencia: la licencia declarada es Apache-2.0, permisiva para uso comercial. No obstante, conviene verificar la licencia del modelo base Qwen3-1.7B y las condiciones aplicables a los datos de ajuste, que no se documentan.
- Requiere el modelo base: el repositorio no incluye los pesos completos, de modo que un despliegue autonomo exige descargar Qwen3-1.7B y fusionar el adaptador.
- Trazabilidad limitada: no se publican hiperparametros, dataset, numero de pasos ni criterios de evaluacion, lo que dificulta reproducir el ajuste o auditar su comportamiento.
- Senales de adopcion nulas: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de uso en produccion.
- Fechas inconsistentes: la ficha indica fechas de creacion y actualizacion de octubre de 2026, posteriores a la fecha actual, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.
- Alcance restringido: es un ajuste orientado a un unico asistente web, no un modelo generalista; su uso fuera del dominio previsto degradara la calidad de las respuestas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Vivek5926/ziri-zithara-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
