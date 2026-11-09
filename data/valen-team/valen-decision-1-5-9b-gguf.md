# Valen-Team/Valen-Decision-1.5-9B-GGUF

## Resumen
Valen-Decision-1.5-9B-GGUF es la distribucion en formato GGUF del modelo Valen-Decision-1.5-9B, desarrollado por Valen-Team y afinado a partir de Qwen/Qwen3.5-9B. No es un modelo conversacional generalista: esta especializado en toma de decisiones estructurada sobre entradas multimodales (texto, imagen y video), devolviendo salidas tipadas como probabilidades, elecciones categoricas, puntuaciones o cajas delimitadoras en una sola pasada forward. Resuelve el problema de convertir evaluaciones subjetivas o clasificaciones abiertas en decisiones maquina-legibles y verificables.

El modelo cuenta con 8.404.269.597 parametros totales (segun safetensors) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Su interes actual radica en que cubre tareas de enrutamiento de tickets, cribado de imagenes de producto y etiquetado de video mediante una API de "decisiones" (formatos SystemOne y Decisions) que no requiere generar texto libre, reduciendo ambiguedad y coste de post-procesado.

La model card advierte de manera explicita que esta publicacion GGUF corresponde a la version 0.1.0, que no compila soporte directo de video, y que solo las precisiones F32 y Q8_0 han superado los controles de calidad; las cuantizaciones Q4 y Q5 fallaron dichos controles. No se declara compatibilidad con llama.cpp u Ollama oficiales sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen/Qwen3.5-9B, con cabecera de decision y codigo personalizado (trust_remote_code) |
| Parametros totales | 8.404.269.597 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: F32 y Q8_0 cualificadas; Q4 y Q5 no superaron los controles de calidad; tambien existen variantes nativas y ONNX (q8-mlp) en el ecosistema Valen |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el ecosistema incluye pesos nativos y ONNX |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de ~8.400 millones de parametros, y se afina para producir salidas estructuradas de decision en lugar de texto generativo. La inferencia expone un metodo `predict` que acepta un estado de entrada (texto, imagen o video) y una lista de preguntas tipadas (por ejemplo `predicate` o `noul`), devolviendo respuestas con probabilidad, eleccion o puntuacion. La carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor.

El entrenamiento se apoya en el dataset publicado Valen-Training-General-100k, y el codigo de entrenamiento esta disponible en el repositorio GitHub de Valen-Team. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal. La validacion documentada se limita a pruebas con la build precompilada GGUF 0.1.0 y el tamano 0.8B en Q8_0 sobre imagenes fijas.

## Capacidades
- Clasificacion de mensajes de cliente y enrutamiento de tickets mediante preguntas tipadas con probabilidad asociada.
- Verificacion de requisitos sobre imagenes (por ejemplo, cribado de imagenes de producto) devolviendo decisiones y, segun la demo, cajas delimitadoras.
- Identificacion de acciones en video (en builds con soporte de video compilado; la build GGUF 0.1.0 precompilada no lo incluye).
- Salida estructurada y tipada (`predicate`, `noul`, probabilidades, elecciones, puntuaciones) en una sola pasada forward.
- Soporte de dos formatos de API de decision: SystemOne (Jev) y Decisions (OpenAI).
- Entrada multimodal texto-imagen (pipeline image-text-to-text).
- Soporte de estado compartido (shared-state) entre preguntas de una misma peticion.
- No se documentan capacidades de generacion de texto libre, razonamiento conversacional multi-turno, tool calling ni agentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Enrutamiento de tickets de soporte: se envian el mensaje del cliente y un conjunto de predicados (por ejemplo, "es una reclamacion de facturacion") y el modelo devuelve probabilidades que alimentan un enrutador automatico, evitando generar texto libre y facilitando umbrales de confianza.
- Cribado de imagenes de producto: se evalua si una imagen cumple requisitos (fondo blanco, producto centrado, ausencia de texto) y se obtiene una decision binaria o probabilistica por criterio, integrable en un pipeline de publicacion de catalogo.
- Moderacion de contenido visual: se definen predicados sobre imagenes subidas por usuarios y se aplican politicas de aceptacion, revision o rechazo segun la probabilidad devuelta.
- Etiquetado de video para catalogos: en builds con soporte de video, se identifican acciones presentes en clips y se generan etiquetas estructuradas para busqueda y recomendacion (no disponible en la build GGUF 0.1.0 precompilada).
- Clasificacion de intencion en formularios: se evaluan campos de texto libre contra preguntas tipadas para validar coherencia antes de persistir datos.
- Servicio C++ en CPU Linux: despliegue mediante el runtime personalizado de Valen con pesos GGUF Q8_0 para servicios de decision de baja latencia sin GPU.
- Fine-tuning para dominios propios: usando el codigo y el dataset publicados, se puede adaptar el modelo a taxonomias de decision especificas de una organizacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; la model card advierte explicitamente que el tamano de fichero no equivale al requisito de RAM.
- GPU: los ejemplos oficiales usan una GPU NVIDIA con PyTorch, `dtype="auto"` y `attn_implementation="sdpa"`; no se especifican modelos concretos (A100, H100, RTX 4090).
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible para el tamano 9B.
- Despliegue: Transformers con `trust_remote_code=True`; runtime personalizado de Valen para GGUF en C++ Linux CPU; SDKs ONNX para Python/JavaScript; se mencionan SGLang y vLLM como backends del ecosistema, sin garantia para esta build. No se declara soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; la model card indica que no se promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-Decision-1.5-9B-GGUF | 8.404.269.597 | no disponible | Decision estructurada multimodal | Apache 2.0 | Hugging Face, API gratuita, demo web |
| Qwen/Qwen3.5-9B (modelo base) | ~9B (segun denominacion) | no disponible | LLM multimodal generativo | no disponible en la informacion | Hugging Face |
| Alternativas especializadas en decision/clasificacion | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias
- La build GGUF 0.1.0 precompilada no compila soporte directo de video; las pruebas historicas de video con compilacion desde fuente no cualifican el paquete precompilado.
- Solo F32 y Q8_0 superaron los controles de calidad; Q4 y Q5 fallaron y no se recomiendan.
- La validacion P1 se limita a imagenes fijas sobre la build precompilada exacta y al tamano 0.8B en Q8_0; no se extiende a otros tamanos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de desplegar en produccion.
- No se declara compatibilidad con llama.cpp u Ollama oficiales sin modificar.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente fuera de los idiomas del entrenamiento.
- Riesgo de alucinacion y calibracion de probabilidades no documentado; se recomienda validar umbrales con datos propios.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de los datos de entrenamiento y del modelo base deben verificarse de forma independiente.
- El modelo esta disenado para decisiones estructuradas, no para generacion de texto libre ni dialogos multi-turno.

## Enlaces
- Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B-GGUF
- Demo web y API gratuita: https://valen-team.github.io/
- Documentacion de API: https://valen-team.github.io/docs/valen/api/
- Quickstart de Transformers: https://valen-team.github.io/docs/valen/quickstart/
- Guia de eleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Cookbook: https://valen-team.github.io/cookbook/
- Cookbook, conceptos basicos de API: https://valen-team.github.io/cookbook/api-quickstart/
- Cookbook, inferencia local: https://valen-team.github.io/cookbook/local-inference/
- Cookbook, enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Cookbook, cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Cookbook, etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
- Cookbook, validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Repositorio GitHub: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Documentacion SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- Documentacion Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
- Demo en video: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
