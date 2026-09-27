# sparrow18/DeepSeek-V3.1-Terminus

## Resumen

DeepSeek-V3.1-Terminus es una revisión del modelo de lenguaje de gran escala DeepSeek-V3.1, desarrollado por DeepSeek-AI. Se trata de un transformer de tipo mezcla de expertos (MoE) con aproximadamente 684 500 millones de parámetros totales almacenados en safetensors, publicado bajo licencia MIT, lo que permite uso comercial sin restricciones de atribución más allá de la propia licencia. La revisión Terminus no cambia la arquitectura: mantiene la estructura de DeepSeek-V3 y se centra en corregir dos problemas reportados por la comunidad, la consistencia de idioma (reducción de mezclas chino-inglés y caracteres anómalos) y el rendimiento de los agentes de código y de búsqueda.

El repositorio analizado es una republicación realizada por el usuario `sparrow18` sobre el checkpoint base `deepseek-ai/DeepSeek-V3.1-Base`, con 0 descargas y 0 likes en el momento de la consulta, y con los pesos en formato FP8 y safetensors. La model card reproduce la documentación oficial de DeepSeek-AI, incluyendo la tabla comparativa de benchmarks entre DeepSeek-V3.1 y DeepSeek-V3.1-Terminus y las instrucciones para ejecutar el modelo localmente.

Su relevancia actual radica en la combinación de licencia permisiva (MIT), capacidades agénticas medidas (SWE Verified 68,4, Terminal-bench 36,7, BrowseComp 38,5) y un tamaño que, aunque exige despliegue multi-GPU, puede servirse en un solo nodo de 8 GPU de 141 GB con pesos en FP8. Esto lo sitúa como alternativa abierta a modelos propietarios en tareas de agente de código y razonamiento con uso de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia `deepseek_v3` (tag `deepseek_v3` en transformers); estructura idéntica a DeepSeek-V3 según la model card |
| Parámetros totales | 684 489 845 504 (~684,5 mil millones) según los pesos en safetensors |
| Parámetros activos | MoE con activación dispersa; el informe técnico de DeepSeek-V3 citado (arXiv:2412.19437) describe ~37 000 millones de parámetros activos por token. No explicitado en la model card de este repositorio |
| Longitud de contexto | No explicitada en la model card de este repositorio. La estructura es la misma que DeepSeek-V3/DeepSeek-V3.1, que documentan 128 000 tokens |
| Tipos de cuantización | Pesos nativos en FP8 (tag `fp8`). Cuantizaciones GGUF, AWQ o GPTQ no disponibles en este repositorio |
| Idiomas soportados | No disponibles en los metadatos de HuggingFace. La model card menciona correcciones de mezcla chino-inglés, lo que implica cobertura de al menos chino e inglés |
| Licencia | MIT (tanto el repositorio como los pesos) |
| Formato de pesos | `safetensors` (librería `transformers`, con `custom_code`); tamaño del repositorio 688,6 GB |
| Modelo base | `deepseek-ai/DeepSeek-V3.1-Base` |
| Tipo de pipeline | `text-generation` |
| Compatibilidad de endpoints | Etiqueta `endpoints_compatible`; compatible con text-generation-inference |
| Autor del repositorio | `sparrow18` (republicación); modelo original desarrollado por DeepSeek-AI |
| Fecha de publicación en este repositorio | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card indica explícitamente que la estructura del modelo es la misma que la de DeepSeek-V3 y remite al repositorio oficial de DeepSeek-V3 para los detalles de ejecución local y al repositorio de DeepSeek-V3.1 para la plantilla de chat. La etiqueta `deepseek_v3` de transformers y el tag `custom_code` confirman que se requiere código personalizado para cargar el modelo, y el tag `fp8` indica que los pesos se distribuyen en formato de coma flotante de 8 bits, lo que reduce a la mitad el espacio respecto a una versión BF16.

El informe técnico citado en la model card es *DeepSeek-V3 Technical Report* (arXiv:2412.19437), que documenta la arquitectura MoE con atención latente multi-cabeza (MLA) y el proceso de entrenamiento del modelo base. Esta model card no aporta detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de ajuste (SFT, RLHF o DPO) específicas de la revisión Terminus; esos datos no están disponibles en la información proporcionada.

Como innovación destacable de esta revisión, la model card menciona dos cambios concretos: la mejora de la consistencia lingüística para reducir texto mezclado chino-inglés y caracteres anómalos, y la optimización de las capacidades agénticas de los agentes de código y de búsqueda, con una plantilla y un conjunto de herramientas de búsqueda actualizados que se ilustran en `assets/search_tool_trajectory.html`. Además, se incluye un directorio `inference` con código de demostración actualizado. Se advierte de un problema conocido: en este checkpoint los parámetros de `self_attn.o_proj` no cumplen el formato de escala FP8 UE8M0, algo que se corregirá en futuras publicaciones.

## Capacidades

- Generación de texto conversacional y razonamiento en modo explícito de razonamiento (los benchmarks se reportan bajo la etiqueta «Reasoning Mode w/o Tool Use»).
- Razonamiento matemático y científico avanzado: la model card reporta 85,0 en MMLU-Pro, 80,7 en GPQA-Diamond y 21,7 en Humanity's Last Exam.
- Generación y edición de código: 74,9 en LiveCodeBench, 2046 de puntuación en Codeforces y 76,1 en Aider-Polyglot.
- Uso de herramientas y agentes: SWE Verified 68,4, SWE-bench Multilingual 57,8 y Terminal-bench 36,7, lo que indica capacidad para resolver tareas de ingeniería de software de varios pasos con ejecución en terminal.
- Agente de búsqueda web: BrowseComp 38,5, BrowseComp-zh 45,0 y SimpleQA 96,8, con una plantilla y un conjunto de herramientas de búsqueda actualizados en esta revisión.
- Capacidades multilingües: la revisión corrige la mezcla chino-inglés y se evalúa en SWE-bench Multilingual; no se detalla la lista completa de idiomas soportados.
- Soporte de plantilla de chat específica para el agente de búsqueda, distinta de la plantilla de chat general.
- Integración con text-generation-inference y con endpoints compatibles según los metadatos de HuggingFace.
- No se documentan en la información proporcionada capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agente de ingeniería de software autónomo: con 68,4 en SWE Verified y 36,7 en Terminal-bench, el modelo puede clonar un repositorio, localizar el fallo, editar ficheros y ejecutar la suite de pruebas dentro de un contenedor, cerrando el ciclo sin intervención humana en tareas de complejidad media.
- Asistente de código integrado en el IDE: 76,1 en Aider-Polyglot lo hace adecuado para edición de código sobre repositorios existentes con múltiples lenguajes, aplicando parches que respetan el contexto del proyecto.
- Búsqueda y síntesis de información web: 96,8 en SimpleQA y 38,5 en BrowseComp permiten construir un agente de investigación que planifica consultas, navega por resultados y sintetiza una respuesta con trazabilidad de fuentes.
- Atención al cliente en varios idiomas: la corrección de la consistencia lingüística reduce las respuestas con mezcla de idiomas, un defecto frecuente en modelos entrenados principalmente con datos en chino e inglés, lo que mejora la calidad en despliegues en castellano cuando se combina con ajuste específico.
- Generación asistida de código en pipelines de CI/CD: mediante tool calling y la interfaz compatible con text-generation-inference, el modelo puede invocarse desde un job que revise un pull request, proponga correcciones y ejecute linters o tests.
- Razonamiento científico y análisis técnico: 80,7 en GPQA-Diamond y 21,7 en Humanity's Last Exam lo sitúan como herramienta de apoyo en preguntas de nivel posgrado en física, química y biología, siempre con verificación humana de los resultados.
- Automatización de tareas de terminal y administración de sistemas: los resultados en Terminal-bench permiten plantear agentes que ejecuten comandos, interpreten la salida y corrijan el plan ante errores.
- Evaluación y generación de código competitivo: 2046 puntos en Codeforces son suficientes para resolver problemas de dificultad media-alta en entornos de práctica y para generar datasets de entrenamiento sintético.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando DeepSeek-V3.1 con DeepSeek-V3.1-Terminus:

| Benchmark | DeepSeek-V3.1 | DeepSeek-V3.1-Terminus |
|---|---|---|
| **Modo de razonamiento sin uso de herramientas** | | |
| MMLU-Pro | 84,8 | 85,0 |
| GPQA-Diamond | 80,1 | 80,7 |
| Humanity's Last Exam | 15,9 | 21,7 |
| LiveCodeBench | 74,8 | 74,9 |
| Codeforces | 2091 | 2046 |
| Aider-Polyglot | 76,3 | 76,1 |
| **Uso agéntico de herramientas** | | |
| BrowseComp | 30,0 | 38,5 |
| BrowseComp-zh | 49,2 | 45,0 |
| SimpleQA | 93,4 | 96,8 |
| SWE Verified | 66,0 | 68,4 |
| SWE-bench Multilingual | 54,5 | 57,8 |
| Terminal-bench | 31,3 | 36,7 |

Las mejoras más acusadas se concentran en el uso agéntico de herramientas: BrowseComp sube 8,5 puntos, Terminal-bench 5,4 puntos, Humanity's Last Exam 5,8 puntos y SWE Verified 2,4 puntos. En cambio, Codeforces baja 45 puntos, BrowseComp-zh baja 4,2 puntos y Aider-Polyglot retrocede 0,2 puntos. No se han publicado en la información disponible resultados de otros benchmarks habituales como MMLU general, GSM8K, HumanEval o MATH.

## Requisitos de hardware

- Peso de los pesos en FP8: aproximadamente 684,5 GB, en línea con el tamaño del repositorio de 688,6 GB. Es el mínimo absoluto de memoria antes de contar caché KV, activaciones y overhead del runtime.
- Un nodo de 8 GPU H200 (141 GB cada una, 1128 GB totales) permite cargar los pesos en FP8 con margen para caché KV y activaciones.
- Un nodo de 16 GPU H100 de 80 GB (1280 GB) también es viable; 8 GPU H100 de 80 GB (640 GB) no bastan para FP8 sin descarga a CPU o uso de paralelismo con offload.
- 8 GPU B200 de 192 GB (1536 GB) ofrecen el despliegue más holgado; 4 GPU B200 (768 GB) quedan muy ajustadas para FP8.
- No cabe en GPU de consumo: una RTX 4090 con 24 GB no puede alojar el modelo ni siquiera en cuantizaciones de 4 bits, que seguirían requiriendo del orden de 350 GB.
- Para inferencia en CPU con cuantización GGUF de 4 bits sería necesario un servidor con 384-512 GB de RAM, con velocidades de generación muy bajas y no cuantificadas en la información disponible.
- Opciones de despliegue: la model card remite al repositorio oficial de DeepSeek-V3 para la ejecución local e incluye un directorio `inference` con código de demostración; los metadatos indican compatibilidad con text-generation-inference y con endpoints compatibles. vLLM y SGLang son los runtimes habituales para esta arquitectura, aunque su compatibilidad concreta con este checkpoint no se detalla en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Nota: solo los datos de la familia DeepSeek-V3.1 proceden de la model card analizada. Las cifras de modelos de terceros provienen de documentación pública general y conviene verificarlas antes de tomar decisiones de despliegue.

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-V3.1-Terminus (este repositorio) | ~684,5 mil millones según safetensors | Heredado de DeepSeek-V3 (128 000 tokens según el informe técnico citado) | MIT | Pesos en safetensors FP8; republicación con 0 descargas |
| DeepSeek-V3.1 | Misma familia; sirve como línea base de los benchmarks de la model card | Igual que el anterior | MIT | Repositorio oficial de DeepSeek-AI |
| DeepSeek-V3 | Arquitectura de referencia documentada en arXiv:2412.19437 | No disponible en la información proporcionada | Licencia del modelo DeepSeek-V3 | Repositorio oficial de DeepSeek-AI |
| Qwen3-235B-A22B | 235 000 millones totales, 22 000 millones activos (dato de documentación pública de Alibaba) | No disponible en la información proporcionada | Apache 2.0 según documentación pública | Pesos abiertos en HuggingFace |
| Kimi K2 | 1 billón de parámetros totales, 32 000 millones activos (dato de documentación pública de Moonshot AI) | No disponible en la información proporcionada | Licencia modificada de MIT según documentación pública | Pesos abiertos en HuggingFace |

Comparativa de rendimiento directa entre estos modelos: no disponible en la información proporcionada, ya que la model card solo compara DeepSeek-V3.1-Terminus con DeepSeek-V3.1.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada. Al ser un modelo entrenado mayoritariamente con datos en chino e inglés, es esperable un sesgo de cobertura hacia esos idiomas y sus contextos culturales.
- Riesgo de alucinación: no cuantificado en la model card. Los 96,8 puntos en SimpleQA indican una tasa de error baja en preguntas factuales cortas, pero no hay datos sobre alucinación en generación larga o en dominios especializados.
- Consistencia de idioma: la propia revisión existe para corregir mezclas de chino e inglés y caracteres anómalos, lo que confirma que la versión anterior presentaba estos defectos. No hay garantía de que se hayan eliminado por completo.
- Limitaciones de contexto: la longitud de contexto no se explicita en la model card de este repositorio, lo que dificulta planificar despliegues con ventanas muy largas.
- Advertencia técnica del checkpoint: los parámetros de `self_attn.o_proj` no cumplen el formato de escala FP8 UE8M0. Es un problema conocido y reconocido por el autor, que puede afectar a la precisión o a la compatibilidad con determinados runtimes.
- Licencia: MIT, sin restricciones de uso comercial conocidas. No obstante, el repositorio es una republicación de un tercero y no el canal oficial de DeepSeek-AI, por lo que la integridad y procedencia de los pesos debería verificarse antes de usarlos en producción.
- Madurez del repositorio: 0 descargas, 0 likes y sin historial de mantenimiento, lo que implica ausencia de validación por parte de la comunidad.
- Requisitos de hardware extremos: cerca de 685 GB de pesos en FP8 limitan el despliegue a nodos multi-GPU de gama alta, con el coste económico y energético asociado.
- Retrocesos medidos: Codeforces baja de 2091 a 2046 y BrowseComp-zh de 49,2 a 45,0 respecto a DeepSeek-V3.1, por lo que en esas tareas concretas la revisión no supone una mejora.
- Idiomas soportados no declarados: no hay una lista oficial de idiomas, lo que obliga a evaluar el rendimiento en castellano de forma empírica antes de un despliegue en producción.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/sparrow18/DeepSeek-V3.1-Terminus
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V3.1-Base
- Repositorio de DeepSeek-V3.1 (plantilla de chat general): https://huggingface.co/deepseek-ai/DeepSeek-V3.1
- Repositorio oficial de DeepSeek-V3 para ejecución local: https://github.com/deepseek-ai/DeepSeek-V3
- Informe técnico de DeepSeek-V3 (arXiv:2412.19437): https://arxiv.org/abs/2412.19437
- Organización de DeepSeek-AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Cuenta de Twitter/X: https://twitter.com/deepseek_ai
- Contacto: service@deepseek.com
