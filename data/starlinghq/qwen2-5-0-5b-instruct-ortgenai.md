# Starlinghq/qwen2.5-0.5b-instruct-ortgenai

## Resumen

Starlinghq/qwen2.5-0.5b-instruct-ortgenai es una conversion a ONNX Runtime GenAI del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud, publicada por el desarrollador Starlinghq. No se trata de un modelo nuevo ni de un ajuste fino: es un artefacto de despliegue que empaqueta los pesos originales en formato ONNX con la configuracion de generacion de onnxruntime-genai, pensado para ejecutarse en CPU en precision fp32. La relevancia del repositorio es practica: permite integrar un modelo conversacional de 0,5 mil millones de parametros en aplicaciones .NET mediante el paquete `Starlings.Models.QwenChat` del proyecto starlinghq/starling, sin depender de GPUs ni de runtimes de Python.

El modelo base, Qwen2.5-0.5B-Instruct, es el miembro mas pequeno de la familia Qwen2.5, un transformer decoder-only denso con atencion de causalidad estandar, entrenado por Alibaba con datos multilingues y alineado mediante instrucciones. Su tamano reducido lo situa en la categoria de modelos ligeros para inferencia en el borde o en entornos con recursos limitados, donde la huella de memoria y la latencia importan mas que el rendimiento en benchmarks complejos.

La build documentada es la r2, que difiere de la r1 unicamente en el campo `producer_version` de la cabecera de `model.onnx`; los pesos y el resto de ficheros son identicos byte a byte. El repositorio ocupa 2,0 GB e incluye el grafo ONNX, su fichero de datos, la configuracion GenAI, el tokenizer original sin modificar y la plantilla de chat. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), exportado a grafo ONNX Runtime GenAI |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta contexto largo, pero la ficha no lo confirma para esta build) |
| Tipos de cuantizacion | fp32 unicamente (build `-p fp32 -e cpu`); no se incluyen variantes int8, int4 ni GGUF |
| Idiomas soportados | no disponible en la informacion proporcionada para esta build; el modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.onnx.data`) con configuracion `genai_config.json` |
| Libreria de despliegue | onnxruntime-genai 0.17.1 (commit de builder `83de55a1f3886cddbb32a5517e26adb3f9d65159`) |
| Revision del modelo base | `7ae557604adf67be50417f59c2c2f167def9a775` |
| Tamano del repositorio | 2,0 GB |
| Integridad | ficheros fijados por tamano y SHA-256 (`SHA256SUMS`) en el paquete .NET |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings de tokens compartidos con la cabeza de salida, segun el diseno habitual de la familia Qwen2.5. El repositorio no aporta informacion adicional sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF o DPO); esos datos corresponden a la model card original de Qwen, no a esta conversion.

La innovacion tecnica de este artefacto no esta en el modelo sino en el pipeline de exportacion. Se genera con el model builder de onnxruntime-genai 0.17.1 usando los flags `-p fp32 -e cpu`, y se utiliza una copia de `config.json` que declara float32 para evitar que el builder redondee pesos durante la conversion. El resultado es un grafo ONNX en precision completa con su `genai_config.json`, acompanado del `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` originales sin modificar. La build es reproducible mediante `model-pipeline/reference/qwen-chat/build_bundle.py` del repositorio starlinghq/starling, que registra la misma estampa del builder en cualquier entorno donde se ejecute. El paquete .NET consumidor verifica cada fichero por tamano y SHA-256, de modo que cualquier alteracion provoca el rechazo del bundle.

## Capacidades

- Generacion de texto conversacional multi-turno en el rol de asistente, con plantilla de chat compatible con el formato de Qwen2.5.
- Seguimiento de instrucciones y respuestas a preguntas en dominios generales, limitado por el tamano del modelo (0,5B).
- Generacion de codigo basico y explicaciones de fragmentos cortos, sin garantias de correccion en tareas complejas.
- Razonamiento aritmetico y matematico sencillo, con alta probabilidad de error en problemas de varios pasos.
- Capacidad multilingue heredada del modelo base Qwen2.5, aunque la ficha no detalla la lista de idiomas soportados en esta build.
- Ejecucion en CPU sin GPU mediante onnxruntime-genai, con integracion directa en aplicaciones .NET a traves de `Starlings.Models.QwenChat`.
- No se documenta soporte de tool calling, function calling, modo thinking, vision, audio ni razonamiento multi-paso agentico en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones de escritorio .NET: el bundle ONNX se carga con onnxruntime-genai en CPU y permite mantener un chat local sin conexion ni dependencias de Python, adecuado para herramientas de productividad con requisitos de privacidad.
- Clasificacion y reescritura de texto en pipelines por lotes: al ejecutarse en CPU y en fp32, el modelo puede procesar colas de documentos cortos en servidores sin GPU, con吞吐 limitado pero predecible.
- Prototipado rapido de interfaces de chat: la plantilla `chat_template.jinja` y el tokenizer original permiten reproducir el formato exacto de Qwen2.5 en pruebas de integracion antes de migrar a un modelo mayor.
- Generacion de respuestas sugeridas en herramientas de soporte interno: el modelo produce borradores de respuesta para agentes humanos en entornos con datos sensibles que no deben salir de la maquina.
- Educacion y demos de inferencia local: sirve para ilustrar el flujo completo de exportacion ONNX, verificacion por SHA-256 y carga en un runtime GenAI sin necesidad de hardware especializado.
- Filtrado y etiquetado ligero de contenido: tareas de resumen corto, extraccion de palabras clave o reformulacion de frases en aplicaciones de gestion documental donde un modelo de 0,5B es suficiente y el coste por inferencia debe ser minimo.
- Pruebas de regresion de pipelines de despliegue: al estar fijado por commit y hash, el bundle permite validar que una actualizacion del runtime onnxruntime-genai no rompe la generacion esperada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de latencia o throughput para esta build fp32 en CPU.

## Requisitos de hardware

- VRAM: no aplica, la build esta pensada para CPU (`-e cpu`). El grafo fp32 de un modelo de 0,5B ocupa aproximadamente 2 GB en disco y una cantidad similar de RAM al cargarse, segun el tamano del repositorio.
- GPU recomendadas: no disponibles ni necesarias para este perfil; el artefacto no incluye variantes para CUDA, DirectML ni otros execution providers.
- GPU de consumo: irrelevante para este bundle; el despliegue objetivo es CPU.
- Opciones de despliegue: onnxruntime-genai 0.17.1 o superior, a traves del paquete .NET `Starlings.Models.QwenChat` (perfil `qwen2.5-0.5b-instruct/ortgenai-fp32-cpu`). No se proporcionan instrucciones para vLLM, llama.cpp, Ollama ni TGI, que no consumen este formato directamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/qwen2.5-0.5b-instruct-ortgenai | 0,5B | no disponible | ONNX fp32 (onnxruntime-genai) | Apache-2.0 | Conversion de despliegue para CPU y .NET; sin benchmarks publicados |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | safetensors (transformers) | Apache-2.0 | Modelo base original; referencia para comparar pesos y comportamiento |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | no disponible en esta ficha | safetensors (transformers) | Apache-2.0 | Misma familia, mayor capacidad a costa de mas RAM y latencia en CPU |
| Meta Llama 3.2 1B Instruct | 1,2B | no disponible en esta ficha | safetensors, GGUF | Llama 3.2 Community License | Alternativa ligera con ecosistema de despliegue amplio, pero licencia no Apache-2.0 |

La comparacion relevante es contra el modelo base y contra variantes de la misma familia; no se dispone de datos de rendimiento de esta build ONNX que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- El modelo base de 0,5B tiene capacidad limitada de razonamiento, matematicas y codigo; es propenso a errores en tareas de varios pasos y a alucinaciones en preguntas factuales.
- La build es exclusivamente fp32 para CPU: no incluye cuantizacion int8 ni int4, por lo que el consumo de memoria no se reduce respecto al modelo original en precision completa.
- No se documentan los idiomas soportados ni el comportamiento multilingue especifico de esta conversion; la calidad puede variar respecto al modelo base.
- No hay soporte documentado de tool calling, function calling ni modo de razonamiento extendido, lo que limita su uso en flujos agenticos.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE del modelo original; el repositorio incluye ambos ficheros.
- El bundle esta fijado por SHA-256 y por commit del builder; modificar cualquier fichero o actualizar onnxruntime-genai sin revisar la compatibilidad puede romper la carga o la verificacion de integridad.
- La fecha de creacion del repositorio (2026-10-19) y la ausencia de descargas y likes indican que es un artefacto reciente y poco validado por la comunidad; conviene probarlo en el entorno objetivo antes de usarlo en produccion.
- No se han publicado benchmarks ni mediciones de latencia para esta build, por lo que el rendimiento real en CPU debe medirse en el hardware de destino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Starlinghq/qwen2.5-0.5b-instruct-ortgenai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del proyecto Starling: https://github.com/starlinghq/starling
- Revision del modelo base: `7ae557604adf67be50417f59c2c2f167def9a775`
- Commit del builder onnxruntime-genai: `83de55a1f3886cddbb32a5517e26adb3f9d65159` (version 0.17.1)
- Commit de la build r1 conservada en el repositorio: `6b6957c8305ef950450da2c0c846bce6fac3e8a0`
- Script de construccion reproducible: `model-pipeline/reference/qwen-chat/build_bundle.py` en el repositorio starlinghq/starling
