# SpacemiT/Qwen3.5-2B

## Resumen

SpacemiT/Qwen3.5-2B es un paquete de despliegue optimizado por SpacemiT para ejecutar el modelo multimodal Qwen3.5-2B, desarrollado por el equipo Qwen de Alibaba Cloud, en los procesadores RISC-V SpacemiT K1 y K3. El paquete combina un decodificador de texto en formato GGUF cuantizado a Q4_1 con tres codificadores de visión en ONNX a resoluciones de 224, 384 y 768 píxeles, lo que permite inferencia de imagen-texto en dispositivos embebidos de la arquitectura SpacemiT.

El modelo base, Qwen3.5-2B, es un modelo de lenguaje multimodal nativo con licencia Apache-2.0, diseñado para comprensión visual, texto, generación de código y flujos de trabajo agénticos. Este paquete específico resuelve el problema de ejecutar un modelo de 2B parámetros en hardware RISC-V de bajo consumo, aprovechando los núcleos de IA dedicados de los chips K1 y K3 mediante el motor ONNX Runtime de SpacemiT y una versión adaptada de llama.cpp con soporte SMT.

La relevancia actual radica en la creciente demanda de inferencia de modelos de lenguaje y visión en el edge, con alternativas abiertas que no dependen de GPU de NVIDIA. Este paquete es una de las primeras soluciones que integra un modelo Qwen reciente en plataformas RISC-V, un ecosistema en expansión para dispositivos de bajo coste y bajo consumo.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (decoder de texto GGUF + encoders de vision ONNX) |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 (decoder de texto), f16 (encoders de vision ONNX) |
| Idiomas soportados | no disponible (el modelo base Qwen3.5 es multilingue, pero no se especifican idiomas en este paquete) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto) y ONNX (vision) |

## Arquitectura y entrenamiento
El paquete combina dos componentes: un decodificador de texto en formato GGUF cuantizado a Q4_1, derivado del modelo Qwen3.5-2B original, y tres encoders de vision en ONNX con precision f16, cada uno configurado para una resolucion de entrada distinta (224, 384 y 768 píxeles). El modelo base es un transformer multimodal que procesa tanto texto como imagenes, con capacidad de razonamiento y generacion de codigo, y ha sido entrenado con tecnicas de RLHF y RL para mejorar el seguimiento de instrucciones y el razonamiento, segun la informacion del equipo Qwen. No se proporcionan datos sobre el numero de tokens de entrenamiento ni la composicion del dataset en este paquete.

La innovacion tecnica del paquete reside en la adaptacion para hardware SpacemiT: utiliza el backend SMT (SpacemiT Multi-thread) en llama.cpp para distribuir la carga en los nucleos de IA del chip, y los encoders de vision se ejecutan mediante ONNX Runtime de SpacemiT. El paquete incluye archivos de configuracion especificos para K1 (nucleos 0-3) y K3 (nucleos 8-15), que definen la afinidad de los hilos y los parametros de ejecucion.

## Capacidades
- Comprension visual multimodal: acepta imagenes de entrada y genera descripciones detalladas del contenido, como se demuestra en las pruebas de humo con la imagen `humanspeech.jpg`.
- Generacion de texto y razonamiento: el decodificador de texto GGUF soporta generacion autoregresiva de texto con instrucciones complejas.
- Generacion de codigo: el modelo base Qwen3.5-2B incluye capacidades de programacion, aunque no se detallan en el paquete.
- Soporte de agentes y flujos de trabajo: el modelo base admite workflows agénticos, pero el paquete no incluye herramientas especificas de tool calling; se espera que funcione via la API de llama.cpp.
- Capacidades multilingues: el modelo base es multilingue, pero no se especifican los idiomas soportados en el paquete.
- Despliegue en dispositivos RISC-V: optimizado para los chips K1 (X60) y K3 (A100) de SpacemiT, con soporte de ejecucion en nucleos de IA.

## Casos de uso
- Descripcion de imagenes en sistemas embebidos: el modelo puede generar descripciones textuales de imagenes capturadas por camaras en dispositivos IoT o de vigilancia, ejecutandose localmente en hardware K1/K3 sin conexion a la nube.
- Asistente visual para personas con discapacidad visual: combinado con una camara y un modulo de sintesis de voz, el modelo puede describir el entorno en tiempo real, con una ventana de contexto suficiente para interacciones cortas.
- Automatizacion de inspeccion visual en fabricacion: el modelo puede analizar imagenes de piezas o productos en lineas de produccion y generar informes textuales, reduciendo la dependencia de sistemas centralizados.
- Chatbot de atencion al cliente en dispositivos de borde: el modelo puede mantener conversaciones de texto con usuarios a traves de una API REST (como se muestra con `llama-server`), ideal para quioscos o asistentes de tienda con hardware de bajo coste.
- Prototipado de aplicaciones de agente en hardware abierto: desarrolladores pueden integrar el modelo en pipelines de agentes que procesan imagenes y texto, usando la compatibilidad con endpoints de chat de llama.cpp.
- Educacion y experimentacion en arquitecturas RISC-V: el paquete sirve como plataforma de investigacion para evaluar el rendimiento de modelos multimodales en hardware de arquitectura abierta, con documentacion de configuracion para K1 y K3.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona pruebas de humo (HTTP 200) en los chips K1 y K3 con la imagen `humanspeech.jpg`, pero no incluye metricas de latencia ni de precision.

## Requisitos de hardware
- Hardware objetivo: chips SpacemiT K1 (X60) con nucleos de IA 0-3 y K3 (A100) con nucleos de IA 8-15.
- RAM: no especificada, pero al ser un modelo de 1, 9 GB en Q4_1, se estima que requiere al menos 2-3 GB de RAM para el decodificador y los encoders ONNX.
- VRAM: no aplicable, ya que no se usa GPU; la inferencia se ejecuta en los nucleos de IA del SoC.
- GPU recomendadas: ninguna, es una solucion de inferencia en CPU/nucleos de IA RISC-V.
- Opciones de despliegue: llama.cpp con backend SMT (via `llama-server`), ONNX Runtime de SpacemiT, y compilacion desde fuente con `build_spacemit.sh`.
- Latencia y throughput: no disponibles; las pruebas de humo solo confirman que el servidor responde HTTP 200, sin mediciones de tiempo.

## Comparativa con modelos similares
No se dispone de una comparativa directa con alternativas en el mismo formato (paquete para RISC-V). Como referencia, el modelo base Qwen3.5-2B se puede comparar con otros modelos de 2B multimodales:

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 2B | no disponible | Apache-2.0 | Transformers, GGUF, ONNX | GPU, CPU, movil |
| SpacemiT/Qwen3.5-2B | 1, 88 B | no disponible | Apache-2.0 | GGUF + ONNX | RISC-V K1/K3 |
| Qwen3-2B (hipotetico) | 2B | no disponible | Apache-2.0 | Transformers | GPU, CPU |

La comparativa es limitada porque el paquete de SpacemiT es una adaptacion especifica de hardware, no un modelo independiente. Las alternativas equivalentes en otros formatos (como trymirai/Qwen3.5-2B-M) son compatibles con Transformers, vLLM y SGLang, pero no estan optimizadas para RISC-V.

## Limitaciones y advertencias
- Sesgos y alucinaciones: el modelo base puede presentar sesgos y alucinaciones tipicos de modelos de lenguaje; no se ha evaluado su comportamiento en este paquete.
- Riesgo de alucinacion en descripcion de imagenes: las pruebas de humo muestran que el modelo genera descripciones, pero no se ha validado su precision en escenarios complejos.
- Limitaciones de contexto: la longitud de contexto no esta documentada, por lo que no se recomienda para tareas que requieran conversaciones largas o procesamiento de documentos extensos.
- Limitaciones de idioma: no se especifican idiomas soportados; la documentacion solo usa ingles.
- Restricciones de licencia: el paquete es Apache-2.0, pero llama.cpp y ONNX Runtime mantienen sus propias licencias (MIT y MIT, respectivamente), que deben respetarse.
- Dependencia de hardware especifico: el paquete solo funciona en chips SpacemiT K1/K3; no es compatible con otras arquitecturas sin modificaciones.
- Estado del proyecto: el repositorio tiene cero descargas y cero likes, lo que sugiere un proyecto reciente y sin validacion de la comunidad.
- Requisitos de compilacion: la instalacion requiere compilar llama.cpp con soporte SMT y ONNX Runtime de SpacemiT, lo que puede ser complejo para usuarios sin experiencia en entornos RISC-V.

## Enlaces
- Repositorio del paquete en Hugging Face: https://huggingface.co/SpacemiT/Qwen3.5-2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Blog de Qwen3.5 (anuncio del modelo): https://qwen.ai/blog?id=qwen3.5
- ONNX Runtime de SpacemiT (releases): https://github.com/spacemit-com/onnxruntime/releases
- llama.cpp de SpacemiT: https://github.com/spacemit-com/llama.cpp
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_2b
- Variante Transformers (trymirai/Qwen3.5-2B-M): https://huggingface.co/trymirai/Qwen3.5-2B-M
