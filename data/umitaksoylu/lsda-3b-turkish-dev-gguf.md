# umitaksoylu/lsda-3b-turkish-dev-GGUF

## Resumen

LSDA 3B Turkish Dev GGUF es la distribucion cuantizada en formato GGUF del modelo umitaksoylu/lsda-3b-turkish-dev, un LLM de aproximadamente 3.000 millones de parametros construido sobre la arquitectura Qwen2.5 y orientado especificamente al desarrollo de software full-stack moderno, con enfasis declarado en C#, SQL y React. El autor de la cuantizacion y del modelo base es umitaksoylu, y el repositorio se ha generado con llama.cpp a partir de los pesos originales.

El interes principal de esta publicacion no esta en el modelo base, sino en el empaquetado: ofrece dos variantes GGUF (Q4_K_M de ~2,1 GB y F16 de ~6,0 GB) pensadas para ejecucion local en moviles, tablets, placas embebidas y mini PC de bajo consumo, ademas de GPU de gama baja como una GTX 1650. La model card documenta explicitamente compatibilidad con llama.cpp, Ollama, MLC-LLM, ExecuTorch, MediaPipe GenAI, RKNN-LLM y TensorRT-LLM.

El soporte de idiomas se limita a turco (tr) e ingles (en), y la licencia es Apache-2.0. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria significativa. La model card no documenta longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Qwen2.5 (segun la model card) |
| Parametros totales | 3B (aproximadamente 3.000 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y FP16 (F16) incluidos en el repositorio; se menciona Q3_K como cuantizacion agresiva recomendada para dispositivos con 4 GB de RAM |
| Idiomas soportados | turco (tr) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros `lsda-3b-turkish-dev-Q4_K_M.gguf` y `lsda-3b-turkish-dev-F16.gguf`) |
| Tamano de fichero | ~2,1 GB (Q4_K_M); ~6,0 GB (F16) |
| Modelo base | umitaksoylu/lsda-3b-turkish-dev |
| Relacion con el base | quantized |
| Cuantizado por | umitaksoylu |
| Libreria | gguf |
| Pipeline | text-generation |
| Plantilla de chat | qwen2 (indicada en el ejemplo de uso con llama.cpp) |
| Dominios declarados | code, csharp, dotnet, react, sql |

## Arquitectura y entrenamiento

La model card indica que LSDA-3B-Turkish-Dev es un LLM de 3B parametros basado en la arquitectura Qwen2.5, es decir, un transformer decoder-only, y que esta "especificamente entrenado para el desarrollo de software full-stack moderno" con foco en C#, SQL y React. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT.

Tampoco se detallan innovaciones tecnicas internas (atencion lineal, decodificacion especulativa, atencion por ventanas, etc.) ni variantes de atencion. La unica informacion tecnica adicional disponible corresponde al proceso de cuantizacion: los pesos se compilaron con `llama.cpp` a partir del modelo base y se publican en dos precisiones, Q4_K_M y F16, con la plantilla de chat `qwen2` como formato de prompt recomendado.

## Capacidades

- Generacion de texto conversacional y de proposito general en turco e ingles.
- Generacion de codigo con enfasis declarado en el ecosistema .NET: C# y marcos asociados (tag `dotnet`).
- Generacion de consultas y esquemas SQL.
- Desarrollo frontend con React, incluyendo interfaces y componentes (el ejemplo de la model card pide un DTO en C# y su interfaz equivalente en React).
- Asistencia de programacion local en dispositivo, sin conexion a servicios en la nube.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a turco e ingles segun los metadatos de idioma.

## Casos de uso

- Asistente de programacion C#/.NET en local: el modelo puede generar clases, DTOs, controladores y logica de negocio en C# directamente en la maquina del desarrollador, con la ventaja de que la variante Q4_K_M (~2,1 GB) cabe en un portatil con GPU integrada o incluso enCPU.
- Generacion de esquemas y consultas SQL: dado su entrenamiento declarado en SQL, es adecuado para redactar sentencias, migraciones y consultas de analisis a partir de descripciones en lenguaje natural, tanto en turco como en ingles.
- Scaffolding de frontend con React: generacion de componentes, hooks e interfaces TypeScript/JavaScript coherentes con un DTO o un contrato de API ya definido.
- Asistente de codigo en movil ("developer in your pocket"): la model card documenta ejecucion en iPhone (desde 4-6 GB de RAM con cuantizaciones agresivas) y en Android de gama alta con Snapdragon 8 Gen 1/2/3, con rendimientos declarados de 25-45 tok/s, lo que permite consultas rapidas de sintaxis o refactorizaciones sin conexion.
- Despliegue en robótica y edge industrial: con NVIDIA Jetson Orin Nano (4/8 GB) se declaran ~30+ tok/s, lo que habilita asistentes tecnicos embebidos en lineas de produccion o en sistemas de automatizacion.
- Gateway IoT de bajo consumo: en plataformas Intel N100/N97/i3-N305 (6-15 W) se declaran ~10-15 tok/s, suficiente para procesamiento de lenguaje natural local en dispositivos con restricciones termicas y energeticas.
- Prototipado docente y evaluacion de modelos: al ser un modelo de 3B con licencia Apache-2.0, sirve como banco de pruebas para comparar precisiones de cuantizacion (Q4_K_M frente a F16) en laboratorios con hardware limitado.
- Traduccion tecnica turco-ingles en documentacion de software, aprovechando que ambos idiomas forman parte del entrenamiento declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad como MMLU, HumanEval, GSM8K o similares, ni comparaciones de rendimiento frente a otros modelos.

Los unicos datos numericos publicados corresponden a velocidad de inferencia por plataforma:

| Plataforma / dispositivo | Aceleracion | Rendimiento declarado |
|---|---|---|
| Qualcomm Snapdragon 8 Gen 1 / 2 / 3 / 8 Elite | Hexagon NPU y Adreno GPU | 25-45 tok/s |
| Samsung Exynos 2400 / 2200 / 1480 | Xclipse GPU (RDNA) y NPU | ~20-35 tok/s |
| NVIDIA Jetson Orin Nano (4 GB / 8 GB) | TensorRT-LLM y llama.cpp | ~30+ tok/s |
| Orange Pi 5 / 5+ (RK3588) | NPU de 6 TOPS via RKNN-LLM | ~12-18 tok/s |
| Intel N100 / N97 / Core i3-N305 | x86 de 6-15 W | ~10-15 tok/s |
| Raspberry Pi 5 (4 GB / 8 GB) | CPU via llama.cpp / Ollama (Q4_K_M) | ~5-8 tok/s |

Estos valores son los declarados por el autor de la cuantizacion y no se acompanan de metodologia de medida (longitud de prompt, longitud de generacion, backend exacto ni versiones de software).

## Requisitos de hardware

- VRAM/RAM minima (Q4_K_M): >= 4 GB, segun la model card. Es la variante recomendada para moviles, GPU de baja VRAM (GTX 1650) y entornos solo CPU.
- VRAM/RAM recomendada (F16): >= 8 GB, para pruebas de referencia y evaluaciones sin compresion en CPU convencional o Apple Silicon con Metal.
- Cuantizaciones mas agresivas: la model card menciona Q3_K para dispositivos con 4 GB de RAM, como el iPhone 13 base o iPhone 13 Mini.
- Cabe en GPU de consumo: si. El fichero Q4_K_M (~2,1 GB) es compatible con GTX 1650 y equivalentes con 4 GB de VRAM; la variante F16 requiere al menos 8 GB.
- Movil: iPhone 16/15 Pro/15/14/13 (4-8 GB de RAM) y iPad Pro/Air con M1-M4 (8-16 GB). En Android se recomienda un minimo de 6 GB de RAM y 8 GB o mas para una experiencia fluida.
- Edge y embebido: NVIDIA Jetson Orin Nano, Jetson Orin NX / AGX Orin, Raspberry Pi 5 (4/8 GB), Orange Pi 5/5+ (RK3588), mini PC Intel N100/N97/i3-N305.
- Opciones de despliegue: llama.cpp, Ollama, MLC-LLM, ExecuTorch, MediaPipe GenAI, RKNN-LLM y TensorRT-LLM, segun la model card.
- Latencia y throughput: ver la tabla de la seccion anterior (datos declarados por el autor, no verificados de forma independiente).
- Nota: no se especifica la longitud de contexto soportada, por lo que el consumo de memoria para contextos largos (KV cache) no puede estimarse con la informacion disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento del modelo ni de sus alternativas, por lo que la comparacion se limita a caracteristicas verificables en la ficha.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| LSDA 3B Turkish Dev (GGUF) | 3B | no disponible | C#, SQL, React; turco e ingles | Apache-2.0 | GGUF (Q4_K_M, F16) |
| Qwen2.5-Coder-3B (familia base de la arquitectura) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Codigo generalista | no disponible en la informacion proporcionada | safetensors y GGUF de terceros |
| Llama-3.2-3B-Instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Instrucciones generales | no disponible en la informacion proporcionada | safetensors y GGUF de terceros |
| Phi-3.5-mini-instruct | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Razonamiento y codigo | no disponible en la informacion proporcionada | safetensors y GGUF de terceros |

Advertencia: los valores marcados como "no disponible" reflejan que esos datos no aparecen en la informacion proporcionada para esta ficha; no implican que los modelos alternativos carezcan de ellos. La ventaja diferencial verificable de LSDA 3B frente a esas alternativas es su especializacion declarada en el stack .NET/React/SQL y el soporte nativo de turco, junto con un empaquetado GGUF ya listo para edge.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en generacion de codigo, SQL o React, ni comparaciones con modelos de tamano similar. La afirmacion "high-performance" de la model card no esta respaldada por metricas en la informacion disponible.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de pruebas independientes y de retroalimentacion de terceros.
- Riesgo de alucinacion: inherente a un modelo de 3B parametros, especialmente en APIs de .NET o patrones de React que cambian entre versiones. Se recomienda verificacion humana del codigo generado.
- Longitud de contexto no documentada: no es posible planificar casos de uso que requieran repositorios completos o conversaciones largas sin conocer la ventana real ni el consumo de KV cache.
- Cobertura idiomatica limitada: solo turco e ingles. No hay soporte declarado de castellano ni de otros idiomas, por lo que su uso en productos en espanol requeriria evaluacion previa.
- Especializacion estrecha: el foco declarado en C#, SQL y React sugiere menor rendimiento en otros lenguajes o dominios (por ejemplo, Python para ciencia de datos, Rust o desarrollo movil nativo).
- Datos de entrenamiento no publicados: se desconoce la composicion del dataset, la posible presencia de codigo con licencias restrictivas y los sesgos asociados.
- Rendimiento declarado sin metodologia: los valores de tok/s de la model card no indican version de llama.cpp, longitud de contexto, tamano de prompt ni tipo de decodificacion, por lo que no son reproducibles tal cual.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el modelo base no incluye en la informacion disponible una seccion de uso aceptable ni garantias; conviene revisar el repositorio del modelo base antes de un despliegue en produccion.
- Cuantizacion Q4_K_M: introduce degradacion de calidad no cuantificada. Para evaluaciones de referencia debe usarse la variante F16.

## Enlaces

- Repositorio GGUF: https://huggingface.co/umitaksoylu/lsda-3b-turkish-dev-GGUF
- Modelo base: https://huggingface.co/umitaksoylu/lsda-3b-turkish-dev
- llama.cpp (herramienta de cuantizacion citada en la model card): https://github.com/ggml-org/llama.cpp
- Ollama: no se proporciona URL en la informacion disponible
- MLC-LLM, ExecuTorch, MediaPipe GenAI, RKNN-LLM y TensorRT-LLM: mencionados como motores compatibles sin enlace asociado en la informacion disponible
- Paper, blog o demo del modelo: no disponible
- Nota sobre la busqueda web: los resultados recuperados no guardan ninguna relacion con el modelo (corresponden a un comercio de ropa), por lo que no se incluye ningun enlace adicional de esa fuente.
