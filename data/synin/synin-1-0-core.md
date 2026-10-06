# Synin/Synin-1.0-Core

## Resumen

Synin-1.0-Core es un modelo multimodal de tipo image-text-to-text publicado por el usuario Synin en HuggingFace. Se trata de un ajuste fino (finetune) del modelo google/gemma-4-31B, según declara la propia ficha del repositorio mediante el campo base_model. El repositorio ocupa 62,6 GB y contiene pesos en formato safetensors con 31.273.088.876 parámetros reales (aproximadamente 31,3 mil millones), coherente con la variante densa de 31B de la familia Gemma 4.

Al derivar de Gemma 4 31B Dense, hereda la arquitectura transformer decoder-only con atención híbrida de la familia: capas de atención local con ventana deslizante de 1024 tokens intercaladas con capas de atención global, ventana de contexto de hasta 256K tokens, vocabulario de 262K entradas y soporte de entrada de texto e imagen (con un codificador de visión de aproximadamente 550M de parámetros). La model card reproduce íntegramente la documentación de Google DeepMind para la familia Gemma 4, por lo que los datos arquitectónicos descritos corresponden al modelo base y no necesariamente a modificaciones introducidas por Synin.

El interés del modelo radica en que representa un finetune comunitario sobre la variante densa de mayor tamaño de Gemma 4, una arquitectura pensada para razonamiento, código y flujos agénticos con soporte nativo de function calling. No obstante, el repositorio no aporta información propia sobre el proceso de ajuste, los datos utilizados ni resultados de evaluación específicos del finetune, y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso con atención híbrida (sliding window local + atención global); heredada del modelo base Gemma 4 31B |
| Parámetros totales | 31.273.088.876 (31,3B) según safetensors; la ficha del modelo base declara 30,7B |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | hasta 256K tokens según la ficha del modelo base Gemma 4 31B |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors sin versiones cuantizadas) |
| Idiomas soportados | no disponible para este finetune; el modelo base declara soporte multilingüe en más de 140 idiomas |
| Licencia | apache-2.0 (license_link apunta a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 31B Dense: un transformer decoder-only de 60 capas, vocabulario de 262K tokens y ventana de contexto de 256K tokens. Emplea un mecanismo de atención híbrido que intercala capas de atención local con ventana deslizante de 1024 tokens y capas de atención global, garantizando que la última capa sea siempre global. Las capas globales usan claves y valores unificados (unified Keys and Values) y aplican Proportional RoPE (p-RoPE) para reducir el coste de memoria en contextos largos. El componente multimodal de visión incorpora un codificador de aproximadamente 550M de parámetros; la variante de 31B no incluye audio, a diferencia de los modelos E2B, E4B y 12B.

En cuanto al entrenamiento específico de Synin-1.0-Core, no se dispone de información: la model card del repositorio reproduce la documentación genérica de la familia Gemma 4 y no documenta el dataset, el número de tokens, ni si se aplicaron técnicas de RLHF, DPO u otro método de alineación. El modelo base sí se describe en su documentación original como disponible en variantes preentrenada e instruction-tuned, con modos de razonamiento configurables (thinking modes), soporte nativo del rol `system` y function calling nativo. Se desconoce si el finetune de Synin conserva, modifica o amplía estas capacidades.

## Capacidades

- Generación de texto conversacional y multimodal: entrada de texto e imagen, salida de texto (pipeline image-text-to-text).
- Razonamiento con modos de pensamiento configurables, heredado del diseño de la familia Gemma 4.
- Comprensión de imágenes con soporte de relación de aspecto y resolución variable, según la documentación del modelo base.
- Codificación y tareas de programación: el modelo base reporta mejoras notables en benchmarks de código.
- Function calling / tool calling nativo, orientado a flujos agénticos.
- Soporte de agentes y razonamiento multi-paso, descrito en la ficha del modelo base.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües: el modelo base declara más de 140 idiomas; no se ha confirmado que el finetune las preserve íntegramente.
- No se documentan capacidades de audio ni de vídeo para la variante de 31B.
- No hay información sobre capacidades específicas añadidas por el ajuste de Synin.

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo puede procesar capturas de pantalla, fotografías de producto o documentos escaneados junto a texto y mantener conversaciones multi-turno con hasta 256K tokens de contexto, lo que permite adjuntar historiales largos e imágenes en una misma sesión.
- Análisis documental con imágenes: extracción de información de facturas, albaranes o formularios escaneados combinando el codificador de visión con generación de texto estructurado, aprovechando la ventana de contexto extendida para procesar lotes de documentos en una sola pasada.
- Generación y revisión de código en pipelines de CI/CD: integración mediante tool calling para consultar repositorios, ejecutar linters o proponer parches, con el modelo actuando como revisor automático de pull requests.
- Agentes autónomos de automatización: orquestación de tareas multi-paso donde el modelo decide qué herramienta invocar en cada iteración gracias al soporte nativo de function calling y al modo de razonamiento configurable.
- Razonamiento sobre documentación técnica larga: consulta de manuales, especificaciones o bases de conocimiento extensas que superan los contextos habituales de 32K o 128K tokens, apoyándose en los 256K tokens disponibles.
- Descripción y etiquetado automático de imágenes a escala: generación de pies de foto, metadatos o alt-text para catálogos y bibliotecas de activos digitales.
- Prototipado de investigación en multimodalidad: al ser un finetune abierto con licencia apache-2.0, sirve como punto de partida para experimentos de ajuste sobre la variante densa de 31B.
- Asistentes de accesibilidad: interpretación de capturas o fotografías del entorno y descripción en lenguaje natural para usuarios con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye la etiqueta `eval-results`, pero no se han proporcionado tablas ni cifras concretas de evaluación, ni del finetune de Synin ni del modelo base Gemma 4 31B en esta consulta.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: los pesos ocupan aproximadamente 62,6 GB, por lo que se requiere del orden de 70-80 GB de VRAM contando caché KV, activaciones y overhead del runtime.
- VRAM estimada en cuantización de 8 bits: del orden de 33-38 GB.
- VRAM estimada en cuantización de 4 bits: del orden de 17-20 GB para los pesos, más la caché KV, que crece de forma significativa con contextos cercanos a 256K tokens.
- GPU recomendadas para precisión completa: NVIDIA H100 80GB, A100 80GB o configuraciones multi-GPU equivalentes.
- GPU para cuantización de 8 bits: A100 40GB o dos RTX 4090 en paralelo.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 (24 GB) puede ejecutar el modelo en cuantizaciones de 4 bits con contextos moderados; los contextos muy largos pueden agotar la memoria.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI son las vías habituales para servir modelos de este tamaño. No se publican archivos GGUF en el repositorio, por lo que llama.cpp u Ollama requerirían una conversión previa por parte del usuario.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synin-1.0-Core | 31,3B (denso) | hasta 256K (según base) | Texto, imagen | apache-2.0 | HuggingFace, safetensors |
| google/gemma-4-31B Dense | 30,7B (denso) | 256K | Texto, imagen | Apache 2.0 | Pesos abiertos de Google DeepMind |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | Pesos abiertos de Google DeepMind |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Pesos abiertos de Google DeepMind |

La comparación se limita a la propia familia Gemma 4, dado que no se dispone de datos de rendimiento del finetune de Synin que permitan contrastarlo con alternativas de otros fabricantes. Frente al modelo base, la única diferencia documentada es la existencia del ajuste; no se especifican mejoras medibles en ninguna tarea.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación del finetune, por lo que se desconoce si mejora, iguala o degrada el comportamiento del modelo base.
- No se documenta el dataset de ajuste ni el método de alineación, lo que impide estimar sesgos introducidos o pérdida de capacidades respecto al modelo original.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; sin evaluación publicada no puede acotarse su magnitud.
- La ventana de contexto de 256K tokens incrementa de forma notable el consumo de memoria de la caché KV, lo que puede forzar a reducir el contexto efectivo en hardware de consumo.
- No se declaran los idiomas soportados por el finetune. El soporte multilingüe en más de 140 idiomas corresponde a la familia Gemma 4 y no está confirmado para este ajuste concreto.
- Discrepancia de licencia: la etiqueta del repositorio indica apache-2.0, mientras que el campo license_link remite a la licencia específica de Gemma 4 de Google. Conviene verificar los términos aplicables antes de un uso comercial, ya que las licencias de la familia Gemma suelen incluir condiciones de uso adicionales.
- Modelo con cero descargas y cero likes en el momento de la consulta: no existe validación por parte de la comunidad.
- La model card reproduce la documentación genérica de Gemma 4 sin adaptarla al finetune, lo que puede inducir a error sobre las capacidades reales del modelo publicado.
- No se ofrecen archivos cuantizados ni GGUF, lo que obliga a conversiones manuales para despliegues en llama.cpp u Ollama.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Synin/Synin-1.0-Core
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Colección Gemma 4 en HuggingFace: https://huggingface.co/collections/google/gemma-4
- Repositorio GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación de Gemma 4 Core: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de Google DeepMind: https://deepmind.google/models/gemma/
