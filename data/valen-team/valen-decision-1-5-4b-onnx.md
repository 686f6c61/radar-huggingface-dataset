# Valen-Team/Valen-Decision-1.5-4B-ONNX

## Resumen
Valen-Decision-1.5-4B-ONNX es la variante en formato ONNX de Valen-Decision-1.5-4B, un modelo de decisión multimodal desarrollado por Valen-Team y construido sobre Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, su funcion es responder a preguntas estructuradas (predicados, clasificaciones, selecciones) sobre una entrada que puede ser texto, imagen o video, devolviendo probabilidades, etiquetas o puntuaciones en una sola pasada forward. El pipeline declarado en Hugging Face es image-text-to-text y los tags incluyen decision-making, structured-output y shared-state.

El modelo resuelve el problema de convertir contenido no estructurado (mensajes de clientes, imagenes de producto, fotogramas de video) en decisiones tipadas y verificables, sin depender de generacion libre de texto. Esto lo hace adecuado para enrutado de tickets, cribado de imagenes y etiquetado de video, casos en los que la salida debe ser determinista y auditable.

La relevancia actual radica en su enfoque: un modelo de 4B parametros con licencia Apache 2.0, pesos ONNX de 18,2 GB en el repositorio, codigo de entrenamiento y dataset publicos (Valen-Training-General-100k), y una API gratuita para pruebas. El autor advierte explicitamente de que las cuantizaciones GGUF Q4/Q5 no superaron los controles de calidad y de que no se reclama soporte en llama.cpp/Ollama oficiales sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen/Qwen3.5-4B) con capa de decision y salida estructurada; requiere trust_remote_code |
| Parametros totales | 4B (heredados del modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX q8-mlp (variante de este repositorio); el proyecto menciona ademas F32 y Q8_0 en otros formatos; Q4/Q5 descartados por no superar los controles de calidad |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (repositorio de 18,2 GB); existen variantes nativas y GGUF en el proyecto |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B, un transformer de 4B parametros, y anade una interfaz de decision que acepta un estado (texto, imagen o video) junto con una lista de preguntas tipadas (por ejemplo, predicados con probabilidad asociada). La salida es estructurada: cajas, probabilidades, opciones y puntuaciones obtenidas en una unica pasada forward, segun la documentacion del autor. Soporta dos formatos de API de decision, SystemOne (usado por Jev) y Decisions (usado por OpenAI), sobre el mismo modelo.

El proyecto publica el codigo de entrenamiento en GitHub y el dataset Valen-Training-General-100k en Hugging Face, lo que permite fine-tuning para tareas propias. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La carga requiere trust_remote_code=True y se recomienda attn_implementation="sdpa", con precision de matmul en float32 y TF32 desactivado en cuDNN para reproducir las condiciones de validacion.

## Capacidades
- Clasificacion de mensajes de clientes y enrutado de tickets mediante preguntas tipadas con probabilidad de salida.
- Verificacion de requisitos sobre imagenes (por ejemplo, cribado de imagenes de producto) con salida estructurada.
- Identificacion de acciones en video, segun la model card; el paquete GGUF precompilado 0.1.0 no compila soporte directo de video y las pruebas historicas de video no cualifican al binario precompilado.
- Salida estructurada y tipada (predicados, selecciones, puntuaciones) en lugar de texto libre.
- Soporte de dos formatos de API de decision: SystemOne y Decisions.
- Capacidades multimodales de entrada texto-imagen (pipeline image-text-to-text).
- No se documentan en la informacion disponible capacidades de tool calling, agentes multi-paso, modo thinking ni audio.

## Casos de uso
- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente y una lista de predicados o categorias, y devuelve la probabilidad de cada una para asignar el ticket al equipo correcto; el tutorial de ticket routing del Cookbook documenta el flujo completo.
- Cribado de imagenes de producto: se envian la imagen y las preguntas de requisitos (fondo, encuadre, presencia de elementos) y se obtiene una decision binaria con probabilidad, adecuada para colas de moderacion automatizadas.
- Etiquetado de video: identificacion de acciones presentes en fotogramas o clips para indexacion y busqueda; conviene validar el soporte de video en el binario concreto que se despliegue.
- Moderacion de contenido textual: clasificacion de mensajes con umbrales de probabilidad configurables, integrable en pipelines de pre-moderacion antes de revision humana.
- Extraccion de decisiones en flujos de negocio: uso de la API Decisions para obtener campos tipados (si/no, categoria, puntuacion) que alimenten sistemas de reglas o bases de datos sin parseo de lenguaje natural.
- Fine-tuning para dominios propios: gracias al codigo de entrenamiento y al dataset publico Valen-Training-General-100k, un equipo puede adaptar el modelo a taxonomias internas de tickets o criterios de calidad de imagen.
- Despliegue offline en Python o JavaScript: la variante ONNX permite ejecutar el modelo sin conexion en aplicaciones de escritorio o backend, sin depender de la API gratuita.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la pagina de validacion del Cookbook para el alcance de las pruebas y el rendimiento en el mismo worker, pero no incluye cifras numericas de MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el repositorio ONNX ocupa 18,2 GB en disco y el autor advierte de que el tamano de fichero no equivale al requisito de RAM.
- GPU: el ejemplo oficial de carga usa una GPU NVIDIA con CUDA y PyTorch; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- GPU de consumo: no confirmado; con 4B parametros y cuantizacion q8-mlp es plausible en GPUs de consumo de gama alta, pero el autor no publica mediciones que lo respalden.
- Despliegue: Python ONNX para aplicaciones offline, SDKs ONNX para JavaScript, Python ONNX con CUDA para GPU, runtime propio de Valen para GGUF en C++ sobre CPU Linux, y SGLang/vLLM como backends mencionados. No se reclama soporte en llama.cpp u Ollama oficiales sin modificar.
- Latencia y throughput: no disponibles; el autor indica explicitamente que no promete rendimiento no medido.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones completas de modelos alternativos de decision multimodal comparables. La unica referencia directa es el modelo base Qwen/Qwen3.5-4B, del que este modelo hereda el tamano (4B) y sobre el que anade la capa de decision y el formato ONNX.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Valen-Decision-1.5-4B-ONNX | 4B | no disponible | Decision multimodal estructurada | Apache 2.0 | ONNX |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | Generacion texto-imagen | no disponible en esta ficha | no disponible |
| Alternativas de decision multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- El autor descarta las cuantizaciones GGUF Q4 y Q5 por no superar los controles de calidad; solo recomienda F32 y Q8_0 cualificadas.
- El paquete GGUF precompilado 0.1.0 no compila soporte directo de video; las pruebas historicas de video no cualifican al binario precompilado.
- La validacion P1 se limita a imagenes fijas sobre el binario precompilado exacto con 0.8B Q8_0; ese alcance no se extiende a otros tamanos.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar; el uso de GGUF requiere el runtime propio de Valen.
- No se documentan sesgos conocidos, tasas de alucinacion ni idiomas soportados en la informacion disponible.
- El modelo esta disenado para decisiones estructuradas, no para generacion libre de texto; usarlo fuera de ese contrato puede producir salidas no validas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las notas de licencia de medios y procedencia que el autor menciona en el Cookbook.
- La carga requiere trust_remote_code=True, lo que implica ejecutar codigo del repositorio; auditar antes de desplegar en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo y entrenamiento: https://github.com/Valen-Team/Valen
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Guia de seleccion de version: https://valen-team.github.io/docs/valen/choosing/
- Documentacion de inicio rapido: https://valen-team.github.io/docs/valen/quickstart/
- Documentacion de API: https://valen-team.github.io/docs/valen/api/
- Validacion y rendimiento: https://valen-team.github.io/cookbook/validation/
- Demos del repositorio: https://github.com/Valen-Team/Valen#demos
