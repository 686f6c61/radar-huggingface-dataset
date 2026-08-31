# TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2-mlx_8bit

## Resumen

Este modelo es una conversión a formato MLX con cuantización de 8 bits del modelo `huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2`, que a su vez deriva de `deepseek-ai/DeepSeek-R1-Distill-Qwen-7B`. La variante "abliterated" elimina los mecanismos de rechazo (refusal) del modelo original, de modo que responde sin las restricciones de seguridad habituales. El resultado es un modelo de razonamiento y generación de texto sin censura, optimizado para ejecutarse en hardware Apple Silicon mediante la librería MLX.

El modelo base DeepSeek-R1-Distill-Qwen-7B es una destilación de DeepSeek-R1, un modelo de razonamiento que alcanza un rendimiento comparable a OpenAI-o1 en tareas de matemáticas, código y razonamiento lógico. Esta conversión mantiene esas capacidades, pero con un peso reducido gracias a la cuantización de 8 bits, lo que facilita su despliegue en entornos con recursos limitados. La relevancia actual radica en ofrecer una alternativa sin censura y eficiente para experimentación y aplicaciones donde se requiera libertad de respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2) |
| Parametros totales | 2.142.131.712 (dato de safetensors; el modelo base declara 7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base DeepSeek-R1-Distill-Qwen-7B soporta 32 768 tokens) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Qwen-7B es un transformer denso con arquitectura Qwen2, entrenado mediante destilacion a partir de DeepSeek-R1. DeepSeek-R1 utilizo aprendizaje por refuerzo a gran escala (RL) sin fine-tuning supervisado previo, lo que permitio que emergieran comportamientos de razonamiento avanzado. La destilacion transfiere estas capacidades a un modelo mas pequeno de 7B parametros, manteniendo un rendimiento solido en tareas de matematicas, codigo y logica.

La version "abliterated" aplica una tecnica de eliminacion de capas de rechazo, de modo que el modelo no muestra respuestas evasivas o negativas ante peticiones que el modelo original consideraria inapropiadas. La conversion a MLX 8-bit se realizo con `mlx-lm` version 0.32.0, reduciendo el peso del modelo a aproximadamente 8.1 GB y permitiendo su ejecucion eficiente en GPUs de Apple.

## Capacidades

- Generacion de texto y razonamiento paso a paso (chain-of-thought) gracias a la destilacion de DeepSeek-R1.
- Razonamiento logico y matematico: resuelve problemas aritmeticos, algebraicos y de logica formal.
- Generacion de codigo en multiples lenguajes (Python, C++, Java, etc.) con explicaciones.
- Conversacion multi-turno con plantilla de chat estandar (Qwen2).
- Sin censura: al ser "abliterated", no aplica filtros de contenido ni rechaza peticiones, lo que permite respuestas abiertas en temas sensibles.
- Soporte de tool calling: no confirmado en la informacion disponible, pero el modelo base Qwen2 puede soportarlo; no se garantiza en esta conversion.
- Capacidades multilingues: no especificadas, aunque el modelo base esta entrenado principalmente en ingles y chino.

## Casos de uso

- Experimentacion en investigacion de IA: permite estudiar el comportamiento de modelos de razonamiento sin restricciones de seguridad, util para analizar sesgos y alucinaciones.
- Generacion de contenido creativo sin limites: redaccion de ficcion, poesia o guiones donde se requiere libertad tematica.
- Asistente de programacion en entornos de desarrollo: puede generar y explicar codigo, aunque sin garantias de tool calling, se puede integrar en IDEs via API.
- Chatbots de rol o simulacion de personajes: al no tener rechazo, puede adoptar personalidades o responder a temas tabu sin evasivas.
- Analisis de datos y resolucion de problemas logicos: util para tareas de razonamiento estructurado en entornos academicos.
- Despliegue en dispositivos Apple: al estar en formato MLX 8-bit, se ejecuta nativamente en Macs con chip M1/M2/M3, ideal para prototipos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversion especifica en la informacion disponible. El modelo base DeepSeek-R1-Distill-Qwen-7B reporta en su ficha original resultados como 92.2% en MATH-500, 65.2% en HumanEval y 83.9% en MMLU, pero estos datos no se pueden atribuir directamente a esta version cuantizada y abliterated sin verificacion.

## Requisitos de hardware

- VRAM estimada: al ser 8-bit, el modelo ocupa aproximadamente 8.1 GB en memoria. Se recomienda al menos 12 GB de RAM unificada en Apple Silicon o 12 GB de VRAM en GPUs discretas.
- GPUs compatibles: cualquier GPU Apple (M1, M2, M3) con suficiente memoria unificada; en PC, GPUs NVIDIA con 12 GB o mas (RTX 3060 12GB, RTX 4070, etc.) via MLX no estan soportadas, pero se puede usar el formato original safetensors con otras librerias.
- En consumer GPU: cabe en GPUs de gama media con 12 GB, pero se recomienda 16 GB para margen.
- Opciones de despliegue: al ser MLX, se usa con `mlx-lm` (pip install mlx-lm). No es compatible directamente con vLLM, llama.cpp u Ollama, que requieren formatos GGUF o AWQ. Para otros entornos, habria que convertir el modelo.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (original) | 7B | 32 768 | MIT | safetensors | Con censura, razonamiento potente |
| Este modelo (MLX 8-bit abliterated) | 7B (declarado) | no disponible | no disponible | MLX safetensors | Sin censura, optimizado para Apple |
| Qwen2.5-7B-Instruct | 7B | 32 768 | Apache 2.0 | safetensors | Con censura, buen rendimiento general |
| Llama-3.1-8B-Instruct | 8B | 128 000 | Llama 3.1 | safetensors | Con censura, contexto largo |

La comparativa se basa en caracteristicas generales; no se dispone de datos de rendimiento comparativos para esta conversion.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser abliterated, el modelo puede generar contenido ofensivo, incorrecto o peligroso sin filtros. No apto para uso en produccion sin supervision humana.
- Riesgo de alucinacion: elevado, especialmente en temas factuales, al no tener mecanismos de verificacion.
- Limitaciones de contexto: no se confirma la longitud de contexto en esta conversion; se asume la del modelo base (32 768 tokens), pero puede variar.
- Restricciones de licencia: la licencia no esta disponible; el modelo base DeepSeek-R1-Distill-Qwen-7B usa MIT, pero la capa abliterated y la conversion pueden tener condiciones adicionales no documentadas.
- Uso comercial: incierto debido a la falta de licencia clara; se recomienda contactar al autor antes de usarlo en productos comerciales.
- Compatibilidad: solo funciona con MLX; no es compatible con ecosistemas estandar como HuggingFace Transformers sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2-mlx_8bit
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-7B-abliterated-v2
- Modelo original DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Documentacion de MLX: https://github.com/ml-explore/mlx
