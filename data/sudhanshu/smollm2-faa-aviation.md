# sudhanshu/smollm2-faa-aviation

## Resumen

Smollm2-faa-aviation es un modelo de generacion de texto publicado por el usuario sudhanshu en Hugging Face, derivado al parecer de la familia SmolLM2 (arquitectura Llama, segun los tags del repositorio) y afinado para dominio de aviacion de la FAA. El modelo se distribuye exclusivamente en formato ONNX cuantizado, empaquetado para ejecucion en el navegador mediante Transformers.js v3 y WebGPU, con un fallback para CPU/WASM. El repositorio ocupa 0,4 GB y no registra descargas ni interacciones en el momento de la consulta.

La propuesta es la inferencia local en el cliente (edge AI): el modelo se ejecuta sin backend, offline, dentro del navegador del usuario. El grafo principal `onnx/model_q4f16.onnx` ocupa aproximadamente 369 MB en cuantizacion de 4 bits con pesos en fp16, y existe una variante `onnx/model_q4.onnx` pensada para CPU/WASM. Se incluyen tokenizer y configuraciones de generacion compatibles con Transformers.js v3.

La informacion publicada es muy escasa: no se declaran parametros totales, longitud de contexto, licencia, idiomas, dataset de entrenamiento ni resultados de benchmarks. La model card se limita a describir los ficheros y el proposito de despliegue. Cualquier evaluacion de calidad debe hacerse, por tanto, mediante prueba directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (tag `llama`), derivado de SmolLM2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con fp16 (`model_q4f16.onnx`), 4 bits (`model_q4.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (Transformers.js v3) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo Llama, segun el tag `llama` del repositorio, y se presenta como un fine-tune de la familia SmolLM2 orientado a contenido de aviacion de la FAA. No se publican detalles sobre el numero de parametros, la composicion del dataset de ajuste, el volumen de tokens utilizado, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La innovacion tecnica declarada es el empaquetado para el navegador: grafos ONNX cuantizados a 4 bits (con fp16 en la variante WebGPU) y configuraciones listas para Transformers.js v3, lo que permite decodificacion en cliente sin servidor. No se documentan optimizaciones de atencion, decodificacion especulativa ni otras tecnicas de inferencia mas alla de la cuantizacion.

## Capacidades

- Generacion de texto conversacional en el navegador, con pipeline `text-generation`.
- Ejecucion offline en el cliente mediante Transformers.js y WebGPU, con fallback a CPU/WASM.
- Especializacion declarada en dominio de aviacion de la FAA (regulaciones, terminologia y procedimientos), aunque sin evaluacion publicada.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles en la informacion.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion.

## Casos de uso

- Asistente de consulta normativa aeronautica en el navegador: el modelo puede desplegarse como widget web que responda preguntas sobre terminologia y reglamentacion de la FAA sin enviar datos a un servidor, adecuado por el ajuste declarado al dominio y por la ejecucion local.
- Formacion de pilotos y tecnicos de mantenimiento: un chatbot embebido en una plataforma e-learning que funcione offline en tablets o portatiles, util en entornos con conectividad limitada como hangares o aulas remotas.
- Prototipado rapido de aplicaciones de IA en el cliente: sirve como base para demos de Transformers.js v3 con WebGPU, ya que incluye tokenizer y configuraciones de generacion listas para usar.
- Procesamiento de documentos sensibles sin salida de datos: al ejecutarse en el navegador, permite resumir o reformular texto aeronautico interno sin que el contenido abandone el dispositivo.
- Soporte a operaciones de vuelo en campo: consultas de procedimientos o checklist en dispositivos con conectividad intermitente, aprovechando el tamano reducido del grafo (369 MB en la variante WebGPU).
- Educacion y divulgacion aeronautica: generacion de explicaciones simplificadas de conceptos de aviacion para publico general dentro de una web estatica, sin coste de infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el grafo cuantizado a 4 bits ocupa aproximadamente 369 MB, por lo que la memoria necesaria en el dispositivo es del orden de varios cientos de MB mas el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (por ejemplo, integradas recientes de Intel, AMD o Apple, y dedicadas de NVIDIA); no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: si, al estar disenado para ejecucion en navegador sobre hardware de cliente; la variante `model_q4.onnx` permite ejecucion en CPU/WASM sin GPU.
- Opciones de despliegue: Transformers.js v3 (WebGPU y WASM); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato ONNX especifico.
- Latencia y throughput: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| smollm2-faa-aviation | no disponible | no disponible | ONNX cuantizado | no disponible | Edge AI en navegador, dominio FAA |
| SmolLM2 (HuggingFaceTB) | 135M / 360M / 1.7B | hasta 8K en variantes publicadas | safetensors, GGUF | Apache 2.0 en variantes publicadas | Modelo base generalista de referencia |
| Modelos ONNX para Transformers.js | variable | variable | ONNX | variable | Ejecucion en cliente |

La comparacion cuantitativa con alternativas no es posible con los datos publicados; la tabla recoge solo caracteristicas estructurales conocidas.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se declaran parametros, contexto, dataset ni proceso de entrenamiento, lo que impide evaluar su calidad de forma previa.
- Licencia no especificada: no puede asumirse uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Sin benchmarks ni evaluaciones publicadas: el rendimiento real en tareas de aviacion es desconocido.
- Riesgo de alucinacion elevado en dominio regulado: un modelo pequeno afinado sin evaluacion documentada no es fiable para decisiones operativas o de cumplimiento aeronautico.
- Idiomas no declarados: se desconoce si el castellano esta cubierto con calidad.
- Contexto no declarado: limita el diseno de aplicaciones multi-turno o de analisis de documentos largos.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso comunitario ni de validacion externa.
- Formato exclusivamente ONNX: no es directamente compatible con stacks de servidor habituales (vLLM, TGI) sin conversion.

## Enlaces

- Hugging Face: https://huggingface.co/sudhanshu/smollm2-faa-aviation
- Transformers.js: https://github.com/huggingface/transformers.js
- WebGPU: https://developer.mozilla.org/es/docs/Web/API/WebGPU_API
- Familia SmolLM2 (referencia del modelo base): https://huggingface.co/HuggingFaceTB
