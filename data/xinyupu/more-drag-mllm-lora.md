# xinyupu/MoRe-Drag-MLLM-LoRA

## Resumen

MoRe-Drag-MLLM-LoRA es un adaptador LoRA de instrucciones que forma parte del sistema MoRe-Drag, presentado en el articulo "Drag as Evidence: Motion-Grounded Latent Recomposition for Drag-Based Editing" (NeurIPS 2026). Lo desarrolla Xinyu Pu junto a Hongsong Wang, Jie Gui y Pan Zhou. El adaptador se monta sobre Qwen2.5-VL-7B-Instruct y su funcion es generar, a partir de una imagen fuente y de la misma imagen anotada con puntos de arrastre, la instruccion de edicion en lenguaje natural que corresponde a ese arrastre.

El modelo resuelve un problema concreto dentro de los pipelines de edicion de imagen por arrastre: cuando el usuario no escribe una instruccion, el sistema necesita derivar una descripcion textual coherente a partir de la evidencia visual del movimiento (un cuadrado rojo marca el punto de origen, un circulo azul el destino y una flecha amarilla la direccion). El LoRA se activa solo durante esa fase de generacion de instruccion y se desactiva al codificar el prompt de edicion, de modo que no altera el resto del pipeline.

Es relevante por su caracter modular: se integra como adaptador PEFT sobre un VLM de 7B ya existente, con un peso de repositorio de solo 0,2 GB, y funciona con dos backbones de edicion distintos (LongCat-Image-Edit y Qwen-Image-Edit). No es un modelo generalista, sino un componente especializado de un sistema de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2.5-VL-7B-Instruct (transformer multimodal con encoder de vision y LLM) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-VL-7B-Instruct) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre las capas de atencion y MLP del modelo de lenguaje, sobre el encoder de vision y sobre el vision merger de Qwen2.5-VL-7B-Instruct. Esta configuracion indica que el ajuste no se limita al decodificador de texto: tambien modifica la representacion visual, algo coherente con una tarea que exige interpretar marcas graficas (cuadrado, circulo, flecha) superpuestas sobre la imagen.

La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La innovacion descrita es de integracion: el LoRA se enciende unicamente mientras se redacta la instruccion de edicion y se apaga durante la codificacion del prompt, preservando el comportamiento original del text encoder en la fase de edicion. El metodo completo se describe en el paper asociado (arXiv:2609.36755).

## Capacidades

- Generacion de instrucciones de edicion de imagen a partir de pares imagen fuente / imagen anotada con puntos de arrastre.
- Interpretacion de anotaciones visuales: cuadrado rojo (punto de agarre), circulo azul (destino) y flecha amarilla (direccion).
- Comprension visio-linguistica heredada de Qwen2.5-VL-7B-Instruct.
- Integracion como adaptador PEFT cargable y descargable de forma independiente.
- Compatibilidad con dos backbones de edicion: LongCat-Image-Edit y Qwen-Image-Edit.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking especifico para este adaptador.

## Casos de uso

- Edicion de imagen sin prompt textual: el usuario solo traza el arrastre sobre la imagen y el adaptador infiere la instruccion, eliminando la necesidad de describir la edicion por escrito.
- Automatizacion de pipelines de retoque: en un flujo por lotes, el sistema recibe imagen, mascara y puntos y genera la instruccion de forma desatendida antes de invocar el modelo de edicion.
- Prototipado de interfaces de edicion directa: util para construir herramientas donde el gesto sustituye al texto, con el adaptador como capa de traduccion gesto-a-lenguaje.
- Investigacion en edicion guiada por movimiento: sirve como componente reproducible para experimentos que comparan estrategias de derivacion de instrucciones en edicion por arrastre.
- Evaluacion de sistemas multimodales: permite estudiar como un VLM interpreta anotaciones graficas sobre imagenes y las convierte en descripciones accionables.
- Integracion en herramientas de diseno asistido: el adaptador se puede enchufar sobre un backbone de edicion ya desplegado sin reentrenar el modelo base, reduciendo el coste de adopcion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; los requisitos reales vienen determinados por el modelo base Qwen2.5-VL-7B-Instruct y por el backbone de edicion (LongCat-Image-Edit o Qwen-Image-Edit).
- VRAM estimada para el VLM base: no disponible en la informacion proporcionada; depende de la precision y de la cuantizacion empleadas.
- GPU recomendadas: no disponible. Para un VLM de 7B en precision completa se suele requerir hardware de gama alta (A100/H100) o cuantizacion para GPUs de consumo, pero no hay datos especificos en la informacion disponible.
- Despliegue: la libreria indicada es PEFT; el adaptador se carga mediante el codigo de MoRe-Drag (`generate_instruction` o `infer.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoRe-Drag-MLLM-LoRA | LoRA sobre VLM 7B para instrucciones de edicion por arrastre | adaptador sobre 7B | no disponible | apache-2.0 | Hugging Face (xinyupu) |
| Qwen2.5-VL-7B-Instruct | VLM generalista (modelo base) | 7B | no disponible | no disponible en esta ficha | Hugging Face (Qwen) |
| Alternativas especificas de generacion de instrucciones para edicion por arrastre | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es un VLM de proposito general, sino un adaptador para una unica tarea (generacion de instrucciones de arrastre).
- Requiere el formato de anotacion especifico (cuadrado rojo, circulo azul, flecha amarilla) y un fichero de puntos; fuera de ese esquema su comportamiento no esta documentado.
- Depende de un backbone de edicion concreto (LongCat-Image-Edit o Qwen-Image-Edit); no se garantiza su funcionamiento con otros pipelines.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluacion de robustez.
- Idiomas soportados no declarados; el idioma de las instrucciones generadas no se especifica.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.
- La licencia apache-2.0 del adaptador no exime de verificar las condiciones del modelo base y de los backbones utilizados.
- Uso previsto de investigacion; no hay evidencia de validacion en produccion.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/xinyupu/MoRe-Drag-MLLM-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Paper: https://arxiv.org/abs/2609.36755
- Codigo: https://github.com/xinyu-pu/MoRe-Drag
