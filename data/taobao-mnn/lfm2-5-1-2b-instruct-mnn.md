# taobao-mnn/LFM2.5-1.2B-Instruct-MNN

## Resumen

LFM2.5-1.2B-Instruct-MNN es la versión cuantizada y empaquetada para MNN del modelo instruct LFM2.5-1.2B-Instruct desarrollado por Liquid AI. Se trata de un modelo de lenguaje de 1.200 millones de parámetros orientado a conversación y despliegue en dispositivo (edge), que la organización taobao-mnn (vinculada al repositorio MNN de Alibaba) ha convertido al formato MNN con cuantización HQQ de 4 bits para su ejecución eficiente en CPU.

El modelo base emplea la arquitectura LFM2, sobre la que Liquid AI continuó el preentrenamiento y aplicó aprendizaje por refuerzo para ajuste instructivo. Esta versión MNN conserva 16 capas de lenguaje con dimensión oculta de 2048 y comparte los pesos de embedding con la cabeza de salida, todo ello cuantizado a 4 bits con grupos de 64 y escalas en FP16.

Su relevancia radica en que permite ejecutar un modelo conversacional de más de mil millones de parámetros en hardware de consumo sin GPU dedicada, usando el runtime MNN con configuración por defecto de CPU, 4 hilos y modos de precisión y memoria bajos. El repositorio ocupa 1,4 GB y está pensado para integración en aplicaciones móviles y de escritorio mediante el ecosistema MNN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer), 16 capas, dimension oculta 2048 |
| Parametros totales | 1,2 mil millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ 4-bit con grupo 64 (capas lineales y cabeza de salida); escalas en FP16 |
| Idiomas soportados | zh, en |
| Licencia | LFM Open License v1.0 (lfm1-0), uso comercial sujeto a la seccion 5 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight), tokenizer.mtok |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct se construye sobre la arquitectura LFM2 de Liquid AI, un transformer de 16 capas con dimensión oculta de 2048. Según la model card, Liquid AI continuó el preentrenamiento sobre LFM2 y posteriormente aplicó aprendizaje por refuerzo para obtener el comportamiento instructivo orientado a diálogo en dispositivo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles del pipeline de RLHF o DPO.

La versión MNN no modifica la arquitectura, sino que transforma los pesos al formato propietario de MNN con cuantización HQQ de 4 bits y grupos de 64 tanto en las capas lineales del lenguaje como en la cabeza de salida, manteniendo las escalas de cuantización en FP16. Los embeddings de tokens comparten los pesos de 4 bits con la cabeza de salida, lo que reduce el tamaño total del artefacto. El paquete incluye el grafo y pesos del modelo, el tokenizador en formato mtok y los ficheros de configuración de ejecución y de modelo.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Respuesta a instrucciones (modelo ajustado con aprendizaje por refuerzo).
- Razonamiento básico y aritmética simple, validado en las pruebas de humo del exportador (casos de saludo, aritmética y traducción).
- Traducción entre los idiomas soportados, según los casos de prueba reportados.
- Ejecución en CPU mediante MNN con configuración de baja memoria y baja precisión.
- Soporte de plantilla Jinja y corrección de tokens especiales en el runtime MNN (requiere el commit indicado).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Vision, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante MNN para ofrecer diálogo local sin conexión, aprovechando su tamaño de 1,4 GB y su ejecución en CPU con 4 hilos.
- Traducción zh-en en dispositivo: los casos de prueba del exportador incluyen traducción, por lo que resulta adecuado para funciones de traducción offline integradas en apps de mensajería o productividad.
- Procesamiento de texto en el borde (edge computing): despliegue en dispositivos con recursos limitados donde no hay GPU disponible, usando los modos `precision=low` y `memory=low` del runtime MNN.
- Prototipado rápido de chatbots embebidos: el paquete incluye configuración lista para `llm_demo`, lo que permite validar flujos conversacionales en escritorio x64 antes de portar a móvil.
- Automatización de respuestas en herramientas de escritorio: integración en aplicaciones de escritorio que requieran generación de texto local sin depender de servicios en la nube.
- Filtrado y resumen de texto en local para pipelines de privacidad: al ejecutarse íntegramente en el dispositivo, evita enviar datos sensibles a servidores externos, aunque la calidad en tareas complejas será limitada por el tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card únicamente reporta una validación cualitativa realizada el 2026-11-17 en CPU x64: alineación del mapeo FP32, casos de saludo, aritmética y traducción, y una prueba de humo con la configuración por defecto. No se proporcionan métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el artefacto pesa 1,4 GB en disco con cuantización HQQ 4-bit.
- GPU recomendadas: no se especifican; el runtime objetivo es CPU.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada; el diseño apunta a ejecución en CPU.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Opciones de despliegue: runtime MNN (`llm_demo`), con compilación que requiere `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-MNN (este) | ~1,2 B | no disponible | LFM Open License v1.0 | MNN, HQQ 4-bit, CPU | Versión cuantizada para edge |
| LiquidAI/LFM2.5-1.2B-Instruct | ~1,2 B | no disponible | LFM Open License v1.0 | safetensors (presumiblemente) | Modelo base original |
| Otros modelos ~1B de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinación: inherente a modelos de este tamaño; la validación reportada es cualitativa y limitada a casos de humo.
- Cobertura lingüística restringida a chino e inglés; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con ventanas largas.
- La licencia LFM Open License v1.0 impone condiciones para uso comercial recogidas en la sección 5; es necesario revisar el fichero LICENSE antes de un despliegue en producción.
- La cuantización HQQ de 4 bits puede degradar la calidad respecto al modelo original en FP16/BF16; no se han publicado evaluaciones cuantitativas de esta pérdida.
- El runtime requiere un commit específico de MNN (con soporte de plantilla Jinja y corrección de tokens especiales); usar versiones anteriores puede provocar fallos de tokenización.
- El formato MNN es específico del ecosistema de Alibaba y no es directamente compatible con otros runners como llama.cpp o vLLM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/LFM2.5-1.2B-Instruct-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- ModelScope: https://modelscope.cn/models/MNN/LFM2.5-1.2B-Instruct-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Pull request con soporte de plantilla Jinja y tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
