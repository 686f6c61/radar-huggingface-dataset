# taobao-mnn/Qwen3-4B-MNN

## Resumen

Qwen3-4B-MNN es la versión cuantizada y empaquetada para el runtime MNN del modelo denso Qwen3-4B de Alibaba Qwen. El repositorio lo mantiene el equipo taobao-mnn y su propósito es ofrecer una ruta de despliegue en CPU mediante el motor de inferencia MNN (Mobile Neural Network) de Alibaba, sin necesidad de GPU ni de frameworks como PyTorch o vLLM en tiempo de ejecución. Es, por tanto, un artefacto de despliegue más que un modelo nuevo: los pesos subyacentes son los de Qwen3-4B.

El modelo base es un transformer denso de 4.000 millones de parámetros con 36 capas y dimensión oculta de 2560, que soporta los dos modos de conversación de la familia Qwen3 (pensamiento explícito y respuesta directa). La versión MNN aplica cuantización HQQ de 4 bits con grupo 64 a las capas lineales del modelo lingüístico y 8 bits al cabezal de salida, manteniendo las escalas de cuantización en FP16. El resultado es un paquete de aproximadamente 8,2 GB en el repositorio.

Su relevancia actual reside en la combinación de un modelo de razonamiento de tamaño medio con un runtime optimizado para CPU y dispositivos de borde. Para desarrolladores que necesitan ejecutar un LLM competente en hardware sin GPU dedicada, o integrarlo en aplicaciones móviles y de escritorio mediante MNN, este repositorio evita el trabajo de conversión y validación del formato.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), 36 capas, dimensión oculta 2560 |
| Parámetros totales | 4.000 millones (modelo base Qwen3-4B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | HQQ 4 bits grupo 64 (capas lineales), HQQ 8 bits grupo 64 (cabezal de salida y embeddings compartidos), escalas en FP16 |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizador `tokenizer.mtok`, configuración `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen3-4B: un transformer denso decoder-only con 36 capas y dimensión oculta de 2560, entrenado por Alibaba Qwen. El modelo soporta dos modos de inferencia, pensamiento (thinking) y no pensamiento, tal como indica la model card del repositorio. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

La contribución específica de este repositorio es la cadena de cuantización y exportación a MNN. Las capas lineales del modelo lingüístico se cuantizan con HQQ (Half-Quadratic Quantization) a 4 bits con tamaño de grupo 64, mientras que el cabezal de salida y los embeddings compartidos se mantienen a 8 bits con grupo 64; las escalas de cuantización se almacenan en FP16. El paquete incluye el grafo del modelo (`llm.mnn`), los pesos (`llm.mnn.weight`), el tokenizador (`tokenizer.mtok`) y los ficheros de configuración. La exportación se validó con el commit `b0239771b07b317a258fbc384683bbd540741406` de MNN 3.6.2, y la model card documenta pruebas de alineación de mapeo FP32, saludos, aritmética y traducción en CPU x64 con fecha 2026-11-12. Los parámetros de exportación están en `export_args.json` y los registros de prueba y hashes en `refresh_metadata.json`.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Modo de razonamiento explícito (thinking) y modo de respuesta directa (non-thinking), heredados de Qwen3.
- Razonamiento aritmético y traducción, verificados en las pruebas de humo del exportador.
- Ejecución en CPU con configuración por defecto de 4 hilos, `precision=low` y `memory=low`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Capacidades multilingües: limitadas a zh y en según los metadatos del repositorio.

## Casos de uso

- Inferencia en CPU sin GPU: el paquete MNN está pensado para ejecutarse con `llm_demo` sobre CPU con 4 hilos; adecuado para servidores sin acelerador o entornos de desarrollo modestos donde no se quiere montar una pila CUDA.
- Aplicaciones de escritorio y borde: MNN es el runtime de Alibaba orientado a dispositivos móviles y embebidos, por lo que este repositorio sirve para integrar un LLM de 4B en apps nativas mediante la API de MNN-LLM.
- Asistentes conversacionales bilingües zh/en: el modelo cubre ambos idiomas de forma nativa, útil para productos dirigidos al mercado chino con interfaz en inglés.
- Prototipado de razonamiento con modo thinking: permite alternar entre respuestas razonadas y directas según la latencia tolerada, sin cambiar de modelo.
- Traducción y tareas de transformación de texto: las pruebas de validación del exportador incluyen casos de traducción, lo que respalda su uso en pipelines sencillos de traducción zh-en.
- Evaluación comparativa de runtimes: útil para medir el rendimiento de MNN frente a llama.cpp o vLLM con el mismo modelo base, al disponer de un artefacto ya cuantizado y validado.
- Despliegue en entornos con restricciones de memoria: la cuantización HQQ 4/8 bits reduce la huella frente a FP16, lo que facilita la ejecución en máquinas con RAM limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta pruebas de humo cualitativas (alineación de mapeo FP32, saludos, aritmética y traducción) ejecutadas en CPU x64 el 2026-11-12, sin métricas numéricas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM: no aplica de forma directa; el paquete está orientado a CPU. El repositorio ocupa 8,2 GB, por lo que se recomienda al menos esa cantidad de RAM libre para cargar los pesos, más margen para el contexto y el runtime.
- GPU recomendadas: no disponibles en la información proporcionada; el flujo documentado es exclusivamente CPU.
- GPU de consumo: no se documenta soporte; el caso de uso validado es CPU x64 con 4 hilos.
- Opciones de despliegue: MNN (`llm_demo` y API MNN-LLM). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-MNN (este) | 4B denso | no disponible | MNN, HQQ 4/8 bits | Apache 2.0 | Optimizado para CPU vía MNN |
| Qwen/Qwen3-4B | 4B denso | no disponible | safetensors | Apache 2.0 | Modelo original en FP16/BF16; requiere framework estándar |
| Otras cuantizaciones de Qwen3-4B (GGUF, AWQ, GPTQ) | 4B denso | no disponible | GGUF / AWQ / GPTQ | Apache 2.0 (heredada) | Dependen de llama.cpp, vLLM u otros runtimes; no verificadas en la información disponible |

La comparativa se limita al modelo base y a formatos alternativos de cuantización del mismo modelo; no se dispone de datos de rendimiento comparado entre ellos.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés según los metadatos; el rendimiento en castellano no está validado y probablemente sea inferior.
- Contexto: la longitud de contexto no se especifica en la información proporcionada; conviene consultar la configuración del modelo base antes de asumir ventanas largas.
- Formato propietario del runtime: los pesos solo son utilizables con MNN; no son compatibles con vLLM, llama.cpp, TGI ni transformers sin reconversión.
- Cuantización agresiva: HQQ 4 bits en las capas lineales puede degradar tareas sensibles a la precisión (matemáticas complejas, código largo) frente al modelo original.
- Riesgo de alucinación: inherente a los modelos de 4B; no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos: no se documentan evaluaciones de sesgo en la model card.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B; conviene revisar la licencia upstream enlazada.
- Validación limitada: las pruebas documentadas son de humo y no cubren cargas de producción ni concurrencia.
- Fecha de actualización del repositorio (2026-11-18) posterior a la creación (2025-04-28); verificar la versión de MNN compatible antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- ModelScope: https://modelscope.cn/models/MNN/Qwen3-4B-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia upstream: https://huggingface.co/Qwen/Qwen3-4B/blob/main/LICENSE
