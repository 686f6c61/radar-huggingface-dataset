# taobao-mnn/MNN-Pocket-0.3B

## Resumen

MNN-Pocket-0.3B es un modelo de lenguaje compacto de tipo instruccional desarrollado por el equipo taobao-mnn (Alibaba), disenado conjuntamente con el runtime de inferencia MNN para despliegue en dispositivos de borde (on-device). Con aproximadamente 300 millones de parametros (361.551.232 reales segun los pesos en safetensors), resuelve el problema de ejecutar un asistente conversacional bilingue en ingles y chino dentro de moviles, tablets y otros dispositivos con recursos limitados, sin depender de la nube.

El modelo emplea una arquitectura transformer de tipo Qwen3 con 28 capas, hidden size de 896, atencion GQA (14 cabezas de consulta y 2 de clave/valor) y FFN con 2560 unidades intermedias. Soporta hasta 32K tokens de contexto en despliegue (40.960 posiciones en configuracion) y se distribuye con pesos en bfloat16, ademas de variantes INT4 W4A16 entrenadas con QAT que ocupan solo 173 MB. Su relevancia actual radica en que demuestra que un modelo sub-millar puede alcanzar un rendimiento equilibrado en 11 benchmarks zh/en, superando a algunas lineas base de ~500M, y mantener velocidades de decodificacion superiores a 200 tok/s en hardware de consumo como el iPad Pro M5.

La familia incluye variantes base, SFT, GGUF para llama.cpp y un modelo de decision no autorregresivo (Dec) con adaptador LoRA y cabeza pointer. La licencia Apache 2.0 facilita su adopcion comercial y su integracion en pipelines de agentes ligeros, extraccion de datos y asistentes embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), GQA, embeddings atados |
| Parametros totales | 361.551.232 (~300M nominales) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 posiciones en configuracion; 32K soportados en despliegue |
| Tipos de cuantizacion | BF16 nativo; INT4 W4A16 (QAT, block 64) para MNN; GGUF F16, Q8_0 y Q4_1 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), MNN (INT4 W4A16), GGUF |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 28 capas, hidden size de 896, 14 cabezas de atencion con GQA (2 cabezas KV, head_dim 64) y FFN con 2560 unidades intermedias y activacion SiLU. El vocabulario es de 65.536 tokens con embeddings de entrada y salida atados, lo que reduce el numero de parametros. La precision nativa es bfloat16 y existe una variante INT4 W4A16 (block 64) obtenida mediante Quantization-Aware Training (QAT), optimizada para el runtime MNN.

El modelo parte de una base preentrenada (MNN-Pocket-0.3B-Base) y se afina con Supervised Fine-Tuning (SFT) para obtener la version instruccional. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la co-disenacion con el stack MNN: el build INT4 QAT ocupa 173 MB y alcanza hasta 466 tok/s de decodificacion en iPad Pro M5 (Metal), por encima del objetivo de 200 tok/s para tiempo real. Tambien se publica un modelo de decision no autorregresivo (Dec) con adaptador LoRA y cabeza pointer que responde en un unico forward pass.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Instrucciones generales y tareas de extraccion de datos estructurados.
- Razonamiento ligero y respuesta a preguntas de dominio general.
- Soporte de plantilla de chat estilo ChatML con tokens de control im_start/im_end.
- Capacidad bilingue equilibrada, con mejor media (50,00) en 11 benchmarks zh/en entre modelos de ~300M.
- Inferencia en dispositivo mediante MNN, Transformers y llama.cpp (GGUF).
- Variante Dec para decision no autorregresiva en un solo paso.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistentes embebidos en moviles: el build INT4 de 173 MB cabe en memoria de un smartphone y decodifica a mas de 200 tok/s, permitiendo respuestas conversacionales en tiempo real sin conexion.
- Extraccion de datos en el dispositivo: con 32K de contexto puede procesar documentos o formularios largos y devolver campos estructurados localmente, evitando enviar datos sensibles a la nube.
- Traduccion y atencion al cliente bilingue en/cn: su entrenamiento equilibrado en ambos idiomas lo hace adecuado para chats de soporte multi-turno en mercados chinos e internacionales.
- Pipelines de agentes ligeros: puede actuar como clasificador o enrutador de intenciones en un sistema multi-agente, donde la latencia baja y el tamano reducido importan mas que el razonamiento profundo.
- Procesamiento por lotes en CPU: la variante GGUF Q4_1 permite ejecutar resumenes o etiquetado de texto en servidores sin GPU mediante llama.cpp.
- Prototipado e investigacion: la variante Base y el checkpoint SFT permiten experimentar con fine-tuning y ablaciones en hardware de consumo.
- Decodificacion especulativa o de decision: la variante Dec responde en un unico forward pass, util para tareas de seleccion rapida entre opciones.

## Benchmarks y rendimiento

La model card indica que MNN-Pocket-0.3B obtiene la mejor media (50,00) en 11 benchmarks zh/en entre modelos de ~300M, superando a varias lineas base de ~500M. Sin embargo, no se proporcionan los resultados desglosados por benchmark (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Media en 11 benchmarks zh/en | 50,00 |
| Benchmarks individuales | No disponibles |
| Decodificacion en iPad Pro M5 (Metal) | Hasta 466 tok/s |
| Objetivo de tiempo real | >200 tok/s |

## Requisitos de hardware

- VRAM estimada en BF16: ~0,7 GB para los pesos (361M parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en INT4 W4A16: ~173 MB para los pesos, apto para dispositivos de borde.
- GPU recomendadas: no se especifican modelos de datacenter; el enfoque es on-device (iPad Pro M5 con Metal, iPhone 18 Pro en la demo).
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1-2 GB de memoria; tambien en CPU y moviles.
- Opciones de despliegue: runtime MNN (llm_demo), Transformers, llama.cpp con GGUF.
- Latencia y throughput: hasta 466 tok/s de decodificacion en iPad Pro M5; no se publican datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B | ~300M (361M reales) | 32K en despliegue | en, zh | Apache 2.0 | Optimizado para MNN on-device; INT4 QAT de 173 MB |
| Qwen3-0.6B | ~600M | No disponible en la informacion | Multilingue | Apache 2.0 | Linea base de mayor tamano citada en la model card |
| Modelos ~500M citados | ~500M | No disponible | No disponible | No disponible | Superados por MNN-Pocket en media de benchmarks segun el autor |

No se dispone de datos detallados de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No recomendado para cargas con razonamiento intensivo, como matematicas avanzadas o generacion de codigo de largo alcance, segun el propio autor.
- Riesgo de alucinacion inherente a modelos sub-millar; no apto para tareas de alta precision sin verificacion.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- Ventana de contexto efectiva de 32K en despliegue, inferior a la configuracion de 40.960 posiciones.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del runtime MNN y de los pesos derivados.
- El rendimiento optimo depende del stack MNN; en otros runtimes la latencia puede ser mayor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Coleccion MNN-Pocket-0.3B: https://huggingface.co/collections/taobao-mnn/mnn-pocket-03b
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Informe tecnico (PDF): https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/resolve/main/MNN-Pocket-0.3B-Technical-Report.pdf
- README en chino: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B/blob/main/README-cn.md
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Checkpoint SFT: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-SFT
- Variante GGUF: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-GGUF
- Variante MNN INT4: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-MNN
- Variante Dec: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Documentacion MNN-LLM: https://github.com/alibaba/MNN/blob/master/transformers/README.md
