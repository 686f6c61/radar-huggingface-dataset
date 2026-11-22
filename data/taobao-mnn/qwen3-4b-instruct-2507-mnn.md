# taobao-mnn/Qwen3-4B-Instruct-2507-MNN

## Resumen

Qwen3-4B-Instruct-2507-MNN es una version cuantizada y empaquetada para el motor de inferencia MNN (Mobile Neural Network) del modelo Qwen3-4B-Instruct-2507, desarrollado originalmente por Alibaba Qwen. La publica el equipo taobao-mnn, vinculado al repositorio oficial de MNN de Alibaba, y su objetivo es permitir la ejecucion del modelo en CPU, incluyendo dispositivos moviles y entornos de escritorio sin GPU dedicada.

El modelo base es un transformer denso de 4.000 millones de parametros con 36 capas y una dimension oculta de 2560. Esta variante 2507 opera en modo no-thinking: genera respuestas directamente sin bloques de razonamiento intermedios, lo que reduce la latencia y el consumo de tokens de salida. El empaquetado MNN aplica cuantizacion HQQ de 4 bits (grupo 64) a las capas lineales del modelo de lenguaje y 8 bits al cabezal de salida, con escalas en FP16 y embeddings compartidos con el cabezal.

Su relevancia practica reside en que ofrece un formato listo para desplegar con el runtime MNN en hardware modesto, con un repositorio de 5,2 GB y una configuracion por defecto pensada para CPU con 4 hilos. Esta orientado a escenarios de inferencia local y en el borde, no a servidores de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4 bits, grupo 64 (capas lineales); HQQ 8 bits, grupo 64 (cabezal de salida); escalas FP16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`), tokenizer `tokenizer.mtok`, configuracion `config.json` / `llm_config.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso decoder-only de Qwen3 con 36 capas y dimension oculta de 2560, en su version instruct 2507 que funciona en modo no-thinking. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) aplicadas por el autor original.

La innovacion de este repositorio es el proceso de cuantizacion y empaquetado para MNN: las capas lineales del modelo de lenguaje se cuantizan con HQQ (Half-Quadratic Quantization) a 4 bits con tamano de grupo 64, el cabezal de salida a 8 bits con grupo 64, y las escalas de cuantizacion se mantienen en FP16. Los embeddings de tokens comparten los pesos de 8 bits con el cabezal de salida. El paquete incluye el grafo del modelo y los pesos por separado, junto con el tokenizador en formato propio de MNN. La exportacion se valido con MNN 3.6.2 en CPU x64, con pruebas de alineacion de mapeo FP32, saludos, aritmetica, traduccion y una prueba de humo con la configuracion por defecto.

## Capacidades

- Generacion de texto conversacional e instructiva en chino e ingles.
- Generacion de respuestas directas sin modo thinking, lo que reduce la longitud de salida y la latencia.
- Razonamiento basico, aritmetica y traduccion (verificados en las pruebas de validacion del autor).
- Ejecucion en CPU con MNN, incluyendo configuracion de bajo consumo de memoria (`memory=low`, `precision=low`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada para esta variante.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no incluidas (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede gestionarse con el binario `llm_demo` de MNN sobre CPU x64, sin GPU, adecuado para prototipos y herramientas internas de escritorio.
- Inferencia en el borde y dispositivos moviles: al estar empaquetado para MNN, encaja en aplicaciones Android/iOS que integren el runtime MNN-LLM y requieran un modelo de 4B en cuantizacion de 4 bits.
- Traduccion zh-en y en-zh en local: las pruebas del autor incluyen casos de traduccion; el modelo cubre ambos idiomas de forma nativa.
- Procesamiento por lotes en servidores sin GPU: con 4 hilos de CPU y memoria reducida, sirve para tareas de generacion de texto de baja concurrencia donde no hay aceleradores disponibles.
- Chatbot de soporte en entornos con requisitos de privacidad: al ejecutarse en local sin llamadas a API externas, permite desplegar asistencia textual sin enviar datos a terceros.
- Generacion de texto asistida en herramientas de desarrollo: integrable en editores o scripts mediante el runtime MNN para autocompletado o resumen de contenido, siempre que el caso no exija contexto muy largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta pruebas de validacion funcional (alineacion de mapeo FP32, saludos, aritmetica, traduccion y prueba de humo) realizadas el 2026-11-12 en CPU x64 con MNN 3.6.2, sin metricas numericas de calidad o velocidad.

## Requisitos de hardware

- VRAM: no aplica para la configuracion por defecto, que es de CPU. El repositorio ocupa 5,2 GB, lo que da una idea del peso en disco y de la memoria necesaria para cargar los pesos.
- GPU recomendadas: no especificadas para esta variante; el empaquetado esta orientado a CPU.
- Cabe en GPU consumer: no disponible en la informacion proporcionada; el formato MNN esta pensado principalmente para CPU y movil.
- Opciones de despliegue: runtime MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Configuracion por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-MNN | 4.000 M | no disponible | HQQ 4/8 bits | Apache 2.0 | MNN |
| Qwen/Qwen3-4B-Instruct-2507 (original) | 4.000 M | no disponible | FP16/BF16 | Apache 2.0 | safetensors |
| Otras variantes cuantizadas de Qwen3-4B (GGUF, AWQ, GPTQ) | 4.000 M | no disponible | 4-8 bits | Apache 2.0 | GGUF, safetensors |

La diferencia principal frente al original es el formato MNN y la cuantizacion HQQ, orientados a CPU y movil. Frente a variantes GGUF o AWQ, este paquete solo es util si el stack de despliegue es MNN; en caso contrario, conviene usar el modelo original o formatos mas extendidos. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; hereda los del modelo base Qwen3-4B-Instruct-2507.
- Riesgo de alucinacion: presente como en cualquier LLM de 4B; no se han publicado evaluaciones de fidelidad para esta variante.
- Idiomas: solo chino e ingles declarados; el rendimiento en castellano no esta verificado y previsiblemente sera inferior.
- Contexto: la longitud de contexto no se especifica en la ficha; conviene consultar la configuracion del modelo base antes de usarlo con entradas largas.
- Licencia: Apache 2.0, permite uso comercial, pero se remite a la licencia del modelo base de Qwen; conviene revisar sus terminos.
- Formato propietario del runtime: los pesos solo son utilizables con MNN; no hay safetensors ni GGUF en este repositorio.
- Modo no-thinking: no genera cadenas de razonamiento, lo que puede limitar tareas que requieran razonamiento complejo.
- Fecha de validacion: las pruebas documentadas son de 2026-11-12 con una revision concreta de MNN; otras versiones del runtime pueden comportarse de forma distinta.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-Instruct-2507-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- ModelScope: https://modelscope.cn/models/MNN/Qwen3-4B-Instruct-2507-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
