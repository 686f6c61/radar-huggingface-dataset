# Veda-Labs/Vedika-Code-Pro-v1

## Resumen

Vedika-Code-Pro-v1 es un modelo de lenguaje de gran escala desarrollado por Veda Labs, una empresa india especializada en inteligencia artificial multimodal y herramientas para desarrolladores. Según la información publicada, se trata de un modelo de arquitectura MoE (mezcla de expertos) con 1.6 billones de parámetros totales y 49 mil millones de parámetros activos, lo que lo sitúa en la categoría de los modelos más grandes publicados hasta la fecha. Está diseñado específicamente para tareas avanzadas de codificación y razonamiento, con un contexto de hasta un millón de tokens, lo que permite procesar repositorios completos o documentación extensa.

El modelo se distribuye con licencia MIT, lo que facilita su uso comercial y de investigación, y se ofrece en precisión mixta FP4 + FP8, una estrategia de cuantización que reduce el tamaño del peso a la vez que mantiene la calidad. Aunque la tarjeta del modelo no especifica los idiomas soportados, el prompt por defecto indica que está orientado al mercado indio ("built by Veda Labs for coding in India"), lo que sugiere un enfoque multilingüe al menos para inglés e idiomas indios. El repositorio no incluye una plantilla de chat estándar, sino un sistema de codificación propio en formato compatible con OpenAI, documentado en la carpeta `encoding`.

La relevancia actual de este modelo radica en su enorme escala y su especialización en código, compitiendo con modelos como DeepSeek-V3 o Qwen2.5-Coder, aunque aún no se han publicado resultados de benchmarks. Su licencia MIT y la disponibilidad de pesos abiertos lo convierten en una opción atractiva para equipos de investigación que necesitan un modelo de muy alto rendimiento en tareas de programación y razonamiento, siempre que dispongan de la infraestructura adecuada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) |
| Parámetros totales | 1.6 billones (1.6T) |
| Parámetros activos | 49 mil millones (49B) |
| Longitud de contexto | 1 millón de tokens (1M) |
| Tipos de cuantización | FP4 + FP8 mixta (expertos en FP4, resto en FP8) |
| Idiomas soportados | No disponible (el sistema por defecto sugiere inglés y lenguas de India) |
| Licencia | MIT |
| Formato de pesos | Safetensors (conversión adicional documentada en carpeta `inference`) |

## Arquitectura y entrenamiento

La arquitectura es de tipo MoE (mezcla de expertos), aunque no se especifica el número total de expertos ni el mecanismo de enrutado. Con 1.6T parámetros totales y 49B activos, se trata de un modelo extremadamente escaso (sparse) que activa solo una pequeña fracción de sus pesos por cada token, lo que permite un rendimiento de inferencia razonablemente rápido para su tamaño. Los pesos se almacenan en una mezcla de FP4 y FP8: los parámetros de los expertos usan FP4 (4 bits) para reducir el uso de memoria, mientras que el resto de parámetros se mantienen en FP8.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens procesados, ni el uso de técnicas como RLHF, DPO o supervisión directa. La model card tampoco detalla innovaciones técnicas específicas más allá de la cuantización mixta. El sistema de codificación de mensajes (carpeta `encoding`) sugiere un formato de conversación propio que incluye un campo `reasoning_content`, indicando que el modelo soporta un modo de razonamiento explícito (thinking mode), similar a otros modelos de razonamiento como DeepSeek-R1 o Qwen3.

## Capacidades

- Generación de código en múltiples lenguajes de programación, orientado a aplicaciones de desarrollo en India.
- Razonamiento avanzado en problemas de lógica, matemáticas y algoritmos, gracias a su modo de razonamiento explícito (`reasoning_content`).
- Procesamiento de contexto muy largo (1M tokens), ideal para analizar repositorios completos, documentación técnica o conversaciones multi-turno extensas.
- Soporte de agentes y herramientas: el modelo está diseñado para ser usado en sistemas de agente y tool-use, como se indica en la página de la organización.
- Capacidad de seguir instrucciones y completar tareas de generación de texto general, aunque su especialidad es el código.
- No se mencionan capacidades multimodales (visión, audio) en esta versión, a diferencia de otros modelos de la familia Vedika.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrados (IDE): el modelo puede sugerir implementaciones, explicar fragmentos de código y refactorizar funciones, aprovechando su contexto de 1M tokens para tener en cuenta el proyecto completo.
- Análisis de código en repositorios grandes: su ventana de contexto permite cargar un repositorio entero y realizar tareas de búsqueda de errores, revisión de seguridad o generación de documentación, sin necesidad de dividir el código.
- Generación de scripts de automatización: para empresas indias que necesitan automatizar procesos de backend, el modelo puede producir scripts de Python, Bash o PowerShell, y su modo de razonamiento ayuda a depurar lógica compleja.
- Chatbots técnicos de soporte: con su capacidad de conversación multi-turno y su entrenamiento en código, puede responder preguntas sobre APIs, librerías y soluciones técnicas en tiempo real.
- Integración en pipelines de CI/CD: gracias a su soporte de tool calling, puede integrarse en sistemas de integración continua para generar tests, analizar cobertura o sugerir optimizaciones de rendimiento.
- Sistemas de generación de código específico de dominio (faith-tech): la página de XALEN menciona que el modelo está especializado en generación de código para integraciones de tecnología religiosa, como gestión de templos, APIs de astrología y aplicaciones espirituales. Este es un caso de uso particularmente concreto y diferencial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Se recomienda realizar evaluaciones propias en los casos de uso previstos antes de desplegarlo en producción.

## Requisitos de hardware

- Con 1.6T parámetros totales y cuantización mixta FP4/FP8, el tamaño del modelo en memoria se estima entre 1.2 TB y 1.5 TB, dependiendo del solapamiento y del overhead de los pesos no cuantizados.
- No es viable en una sola GPU, ni siquiera en las de mayor capacidad (H100 de 80 GB, A100 de 80 GB). Se necesitan al menos 16-20 GPUs H100 (80 GB) o 32 GPUs A100 (80 GB) para cargar los pesos en memoria, asumiendo una distribución de la inferencia.
- Para inferencia con batching, se recomienda usar nodos con interconexión rápida (NVLink, InfiniBand) para evitar cuellos de botella en la comunicación de expertos.
- Opciones de despliegue: la model card indica que se puede ejecutar localmente mediante los scripts de la carpeta `inference`, que incluyen conversión de pesos y demos interactivos. No se mencionan integraciones con vLLM, TGI o llama.cpp, aunque por compatibilidad con Transformers probablemente se pueda adaptar.
- Latencia y throughput: no hay datos oficiales. Debido a que solo se activan 49B parámetros por token, la latencia por token puede ser comparable a modelos de ese tamaño (por ejemplo, DeepSeek-V3 con 37B activos), pero la transferencia de datos entre GPUs puede dominar el tiempo de respuesta.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vedika-Code-Pro-v1 | 1.6T | 49B | 1M | MIT | HuggingFace |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | MIT | HuggingFace |
| Qwen2.5-Coder-32B (referencia) | 32B | 32B | 128K | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo. La comparación se basa solo en parámetros y contexto. Vedika-Code-Pro-v1 supera en escala a DeepSeek-V3, pero no se puede confirmar que su rendimiento real sea superior sin benchmarks.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no se puede verificar la calidad real del modelo en tareas de código o razonamiento.
- La ausencia de una plantilla de chat estándar (Jinja) obliga a usar el sistema de codificación propietario, lo que puede dificultar la integración con frameworks estándar como Transformers, vLLM o TGI.
- El modelo está orientado al mercado indiano, lo que puede influir en los sesgos culturales y en la representación de lenguajes y dialectos locales. No se especifican los idiomas exactos.
- El peso de 126.8 GB en el repositorio corresponde a la versión cuantizada (FP4/FP8); la versión sin cuantizar sería significativamente mayor y probablemente no esté disponible.
- No se han documentado los datos de entrenamiento, por lo que se desconoce si hay sesgos de género, raza o contenido técnico.
- Para producción, se recomienda validar el modelo en tareas reales y considerar la implementación de capas de validación de salida, especialmente en generación de código crítico.
- El uso comercial está permitido por la licencia MIT, pero la responsabilidad del uso final recae en el usuario.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Veda-Labs/Vedika-Code-Pro-v1
- Sitio web de Veda Labs: https://vedalabs.online
- Organización HuggingFace: https://huggingface.co/Veda-Labs
- GitHub de Veda Labs: https://github.com/vedalabs-tech
- Documentación de la API: https://github.com/Vedika-advanced-AI/API-DOCUMENTATION
- Página de producto de XALEN (referencia): https://xalen.io/pages/models/vedika-code
