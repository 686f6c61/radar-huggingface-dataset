# Valen-Team/Valen-Decision-1.5-4B

## Resumen

Valen-Decision-1.5-4B es un modelo especializado en toma de decisiones estructuradas desarrollado por Valen-Team. Se construye mediante fine-tuning sobre el backbone Qwen/Qwen3.5-4B y su proposito no es la generacion libre de texto, sino responder a preguntas tipadas (predicados, opciones multiples, puntuaciones y cajas delimitadoras) sobre entradas multimodales de texto, imagen y video, devolviendo probabilidades y coordenadas en una sola pasada hacia delante.

El modelo resuelve un problema concreto: convertir tareas de clasificacion y verificacion (enrutado de tickets, cribado de imagenes de producto, etiquetado de acciones en video) en salidas estructuradas y calibradas, en lugar de depender de prompts generativos y parseo posterior. Con 4.547.291.949 parametros y licencia Apache 2.0, se posiciona como una alternativa de tamano medio dentro de una familia que cubre 0.8B, 2B, 4B, 9B y 27B.

La version 1.5 introduce dos innovaciones tecnicas destacables: atencion bidireccional por bloques (block-bidirectional attention) y una cabeza de grounding de bounding boxes. El modelo se distribuye en pesos nativos para Transformers, ONNX y GGUF para el runtime Valen llama.cpp 0.2.0, y ofrece una API gratuita y demo web para pruebas sin descarga de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5-4B con atencion bidireccional por bloques, cabeza de decision y cabeza de grounding de bbox |
| Parametros totales | 4.547.291.949 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (backbone en pesos nativos), FP32 (cabezas de decision y grounding), GGUF, ONNX |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-4B y anade una capa de decision que responde a cuatro tipos de pregunta: `predicate` (probabilidad de que una afirmacion sea cierta), `choice` (seleccion entre opciones), `score` (puntuacion) y `bbox` (caja delimitadora). La innovacion principal de la version 1.5 es la atencion bidireccional por bloques, que permite que las preguntas del bloque de decision atiendan tanto al contexto de entrada como entre si, y una cabeza de grounding que devuelve coordenadas de caja para cada pregunta de tipo `bbox`. Todo ello se resuelve en una unica pasada hacia delante, sin generacion autoregresiva ni parseo de cadenas.

Los pesos nativos almacenan el backbone en BF16 y las cabezas de decision y grounding en FP32, lo que explica el tamano del repositorio (9.1 GB) en relacion con los 4.5B parametros. El modelo soporta dos formatos de API de decision: SystemOne (usado por Jev) y Decisions (usado por OpenAI). Los datos de entrenamiento de Valen-Decision-1.5 no son publicos, y no se especifica en la informacion disponible el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El codigo de entrenamiento si esta publicado en el repositorio de GitHub del proyecto para permitir fine-tuning sobre datos propios.

## Capacidades

- Clasificacion de mensajes de cliente mediante preguntas de tipo `predicate` y `choice`, con salida de probabilidad calibrada.
- Verificacion de requisitos sobre imagenes: el modelo evalua si una imagen cumple condiciones definidas por el usuario.
- Grounding visual: devuelve cajas delimitadoras (`bbox`) para localizar objetos o regiones en imagenes y fotogramas de video.
- Identificacion de acciones en video, con soporte de entrada de video a traves de la libreria `av`.
- Salida estructurada tipada en una sola pasada: probabilidades, opciones y puntuaciones sin generacion de texto libre.
- Soporte de multiples preguntas por peticion, resueltas conjuntamente gracias a la atencion bidireccional por bloques.
- Dos formatos de API de decision compatibles: SystemOne y Decisions.
- Capacidad multimodal texto-imagen-video segun el pipeline `image-text-to-text` declarado.
- No se documenta soporte de tool calling, function calling generico, agentes multi-paso ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del mensaje y responde a preguntas `choice` con las categorias de destino, devolviendo la distribucion de probabilidad que permite aplicar umbrales de derivacion a agentes humanos cuando la confianza es baja. El Cookbook oficial incluye un tutorial especifico de ticket routing.
- Cribado de imagenes de producto: se define un conjunto de requisitos (fondo, encuadre, presencia de elementos) como preguntas `predicate` y el modelo devuelve la probabilidad de cumplimiento de cada uno, con cajas `bbox` para senalar la region problematica.
- Etiquetado de acciones en video: se extraen fotogramas y se consulta al modelo sobre la presencia de acciones concretas, generando etiquetas temporales para pipelines de moderacion o catalogacion de contenido audiovisual.
- Moderacion de contenido multimodal: verificacion de politicas sobre imagenes y texto combinados mediante preguntas tipadas, con umbral de incertidumbre configurable para escalar casos dudosos.
- Automatizacion de control de calidad en e-commerce: comprobacion automatica de que las fotos subidas por vendedores cumplen los requisitos de la plataforma antes de publicarse, usando la cabeza de grounding para localizar incumplimientos.
- Clasificacion de intenciones en asistentes conversacionales: el modelo actua como clasificador de intencion y entidad sobre el turno del usuario, sustituyendo prompts generativos por preguntas `choice` con salida probabilistica.
- Anotacion asistida para datasets: generacion de etiquetas y cajas candidatas que un anotador humano revisa, reduciendo el coste de construccion de datasets multimodales.

## Benchmarks y rendimiento

La model card menciona un "Decision Index" como metrica de evaluacion propia de la familia, con puntuaciones crecientes a medida que aumenta el tamano del modelo (0.8B, 2B, 4B, 9B y 27B). Sin embargo, no se proporcionan en la informacion disponible los valores numericos de dicho indice ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros).

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9-10 GB para los pesos (4.5B parametros en BF16 mas cabezas en FP32), con overhead adicional para activaciones y cache segun la longitud de entrada.
- VRAM estimada en GGUF cuantizado: no disponible el detalle de niveles de cuantizacion publicados; el modelo ofrece una variante GGUF para el runtime Valen llama.cpp 0.2.0.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es compatible con GPUs de 16 GB o mas en BF16 y con GPUs consumer de gama alta en cuantizacion.
- Cabe en GPU consumer: si, en tarjetas con al menos 12-16 GB de VRAM en funcion de la cuantizacion y la longitud de contexto, aunque el dato exacto no esta publicado.
- Opciones de despliegue: Transformers (con `trust_remote_code=True` y `attn_implementation="sdpa"`), ONNX Runtime, Valen llama.cpp 0.2.0, y API HTTP gratuita alojada por el equipo.
- Latencia y throughput: no disponibles. La ejecucion en una sola pasada hacia delante sin generacion autoregresiva sugiere menor latencia que un modelo generativo de tamano equivalente, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Valen-Decision-1.5-4B | 4.547.291.949 | no disponible | Decision estructurada multimodal (predicate, choice, score, bbox) | Apache 2.0 | safetensors, ONNX, GGUF |
| Qwen3.5-4B (modelo base) | ~4B | no disponible | Generacion de texto multimodal | no disponible en la informacion | safetensors |
| Valen-Decision-1.5-2B | no disponible | no disponible | Decision estructurada multimodal | Apache 2.0 | safetensors, ONNX, GGUF |
| Valen-Decision-1.5-9B | no disponible | no disponible | Decision estructurada multimodal | Apache 2.0 | safetensors, ONNX, GGUF |

La comparativa con modelos de otras familias orientados a clasificacion estructurada o grounding visual no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto libre: esta disenado exclusivamente para responder preguntas tipadas y devolver probabilidades, opciones, puntuaciones o cajas. Usarlo como chat o para generacion abierta no es su proposito.
- Los datos de entrenamiento no son publicos, lo que impide evaluar la composicion del dataset, los sesgos potenciales y la cobertura idiomatica.
- No se documentan los idiomas soportados; la ausencia de esta informacion es un riesgo para despliegues en castellano u otras lenguas no verificadas.
- No se publican resultados de benchmarks estandar ni cifras del Decision Index, solo la indicacion cualitativa de que los modelos mayores puntuan mas alto.
- La longitud de contexto no esta especificada, lo que dificulta dimensionar despliegues con entradas largas de texto o video.
- El modelo requiere `trust_remote_code=True` y codigo personalizado, lo que implica auditar el codigo remoto antes de usarlo en produccion.
- Las probabilidades de salida deben calibrarse contra el dominio de despliegue; no se documenta el proceso de calibracion.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene revisar las condiciones de los pesos del modelo base Qwen3.5-4B de los que deriva.
- Riesgo de alucinacion en las probabilidades: al ser un modelo discriminativo, el riesgo se traslada a falsos positivos y negativos en la clasificacion, especialmente en dominios alejados de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Variante 0.8B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-0.8B
- Variante 2B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-2B
- Variante 9B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-9B
- Variante 27B: https://huggingface.co/Valen-Team/Valen-Decision-1.5-27B
- Variante ONNX: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-ONNX
- Variante GGUF: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo y entrenamiento: https://github.com/Valen-Team/Valen
- Demo web y API gratuita: https://valen-team.github.io/
- Space de playground: https://huggingface.co/spaces/Valen-Team/Valen-API
- Cookbook oficial: https://valen-team.github.io/cookbook/
- Documentacion de Transformers de Valen: https://valen-team.github.io/docs/valen/quickstart/
- Documentacion de la API: https://valen-team.github.io/docs/valen/api/
- Tutorial de enrutado de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de cribado de imagenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de video: https://valen-team.github.io/cookbook/video-tagging/
- Demo en video: https://raw.githubusercontent.com/Valen-Team/Valen/main/assets/demos/valen-decision-1.5-demo.mp4
