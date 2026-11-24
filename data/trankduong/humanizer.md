# trankduong/humanizer

## Resumen

humanizer es un modelo de lenguaje de aproximadamente 12.000 millones de parámetros, desarrollado por trankduong, especializado en reescribir borradores generados por IA (correos, ensayos, informes, publicaciones de foro) para que se lean como escritos por una persona. Se distribuye como un ajuste fino del modelo base google/gemma-4-12B, con arquitectura multimodal image-text-to-text heredada del base, y está orientado a tareas de transferencia de estilo y parafraseo. El modelo declara soporte para inglés y chino, licencia Apache 2.0 y pesos en formatos safetensors y GGUF.

Su relevancia actual radica en que aborda un problema práctico de producción: los textos generados por modelos suelen ser detectados como artificiales y presentan un registro uniforme. humanizer se entrena explícitamente para preservar cifras, unidades, fechas, nombres y citas, sin añadir información nueva, lo que lo hace apto para reescribir contenido factual. Además, el autor publica un conjunto de cuantizaciones GGUF propias con entrenamiento consciente de cuantización (QAT) y destilación desde los pesos bf16, orientadas a ejecución local en equipos de consumo.

El repositorio ocupa 87,6 GB e incluye tanto safetensors como GGUF. El modelo se integra con llama.cpp y dispone de una aplicación de escritorio (macOS Apple silicon y Windows) y una CLI (`hz`) para procesar documentos largos. La model card reporta métricas internas de detección de IA y de preservación factual, aunque no se han publicado resultados en benchmarks estándar como MMLU o HumanEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (derivada de google/gemma-4-12B, tag `gemma4_unified`) |
| Parametros totales | 11.959.730.224 (11,96 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 2-bit, Q3, Q4_K_M, Q6_K y Q8_0; pesos bf16 en safetensors |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B, un transformer multimodal de tipo image-text-to-text, y se publica como ajuste fino (`base_model_relation: finetune`). La model card no detalla la composición del dataset de ajuste, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; esa información figura como no disponible. El entrenamiento se orienta a una tarea concreta de reescritura con restricciones: conservar todos los números, unidades, fechas, nombres y citas, y no añadir contenido nuevo.

La innovación técnica destacable está en el proceso de cuantización. Para los archivos de 2 bits, Q3 y Q4_K_M, el autor midió la sensibilidad de cada tensor de pesos y asignó más bits a los tensores sensibles y menos a los robustos; después aplicó entrenamiento consciente de cuantización capa por capa y destilación desde el modelo bf16 usado como profesor, con datos de reescritura en inglés y chino. Según la model card, en el archivo de 2 bits la coincidencia top-1 con bf16 pasa del 70 % de una compilación estándar del mismo tamaño al 87 % tras estas etapas (81 %, 85 % y 87 % sucesivamente). Los archivos Q6_K y Q8_0 son compilaciones estándar de llama.cpp. Todos los GGUF son compatibles con versiones recientes de llama.cpp.

## Capacidades

- Reescritura de texto generado por IA con estilo humano, en géneros como correo laboral, ensayo, informe y publicación de foro.
- Transferencia de estilo y parafraseo con preservación explícita de cifras, unidades, fechas, nombres y citas.
- Restricción de no añadir información: el modelo está entrenado para no introducir hechos nuevos.
- Procesamiento bilingüe inglés-chino.
- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Capacidad multimodal image-text-to-text heredada del modelo base (según el tag `image-text-to-text`); la model card no documenta casos de uso de visión.
- Integración con llama.cpp y con endpoints compatibles (`endpoints_compatible`).
- Procesamiento de documentos largos por trozos mediante la CLI `hz`, conservando encabezados, código, tablas y enlaces.
- Importación de archivos `.docx` y PDF en la aplicación, con la opción de fijar pasajes literales mediante «Create fact».
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Reescritura de correos laborales: el modelo recibe un borrador generado por IA y devuelve una versión con registro más natural, manteniendo nombres, fechas y cifras del original, lo que reduce el riesgo de errores en comunicaciones internas y externas.
- Preparación de informes y documentación técnica: la CLI `hz` procesa archivos Markdown, `.txt` y `.docx` por trozos, conserva encabezados, tablas, bloques de código y enlaces, y reescribe solo la prosa, lo que permite humanizar documentación sin romper su estructura.
- Publicaciones en foros y comunidades: para respuestas en foros técnicos o plataformas como Zhihu, el modelo adapta el tono al registro conversacional de la comunidad manteniendo los datos técnicos citados.
- Contenido académico y ensayos: reescritura de borradores en inglés o chino con conservación de citas y referencias, útil antes de una revisión humana final.
- Despliegue local con privacidad: la aplicación de escritorio funciona sin conexión tras la primera descarga, de modo que borradores confidenciales no salen del equipo; es adecuada para entornos con requisitos de confidencialidad.
- Integración en pipelines de agentes de código: el repositorio incluye `AGENTS.md` con archivos exactos, comando de servidor, prompt byte a byte y autotest, lo que permite que un agente de codificación configure el modelo y lo invoque de forma reproducible.
- Edición de documentos ofimáticos: la aplicación importa `.docx` y PDF y permite marcar pasajes que deben conservarse palabra por palabra, útil para contratos, avisos legales o fragmentos regulados.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Los datos publicados son evaluaciones internas del autor:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Reescrituras en inglés juzgadas humanas por Originality.ai | 95 % (11 de 210 marcadas como IA) | Ajuste más estricto, pesos bf16, 2026-10-02; la versión anterior obtenía 26 marcadas |
| Reescrituras en inglés sin problema factual | 376 de 420 | Juez LLM estricto, archivo `humanizer-12b-Q8_0.gguf` |
| Errores factuales corregibles con una sola palabra o frase | más de 9 de cada 10 | Sobre los problemas detectados por el juez |
| Coincidencia top-1 con bf16, archivo 2 bits | 87 % (frente al 70 % de una compilación estándar del mismo tamaño) | Tras QAT y destilación |
| Reescrituras en inglés con algún problema detectado por el juez | 44 de 420 (135 problemas, 125 de una sola palabra o frase) | Conjunto de evaluación retenido |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,96 B de parámetros, un archivo de 2 bits de aproximadamente 3,9 GB (según la model card) permite ejecución en equipos con 8 GB de memoria, que la aplicación contempla como mínimo.
- La aplicación sugiere automáticamente uno de cinco tamaños (Q8_0, Q6_K, Q4_K_M, Q3 o 2 bits) según la memoria del equipo, desde 8 GB en adelante.
- GPU recomendadas: no disponibles en la información proporcionada. La distribución principal es local en Mac con Apple silicon y Windows, mediante llama.cpp.
- Cabe en GPU de consumo: sí, al menos con las cuantizaciones de 2 bits, Q3 y Q4_K_M; el umbral concreto por GPU no se documenta.
- Opciones de despliegue: llama.cpp (incluido `llama-server`), aplicación de escritorio para macOS arm64 y Windows x64, CLI `hz` instalable con `pipx`, y pesos safetensors para transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables ni de alternativas documentadas en la información proporcionada. La comparación se limita a características declaradas:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| humanizer (trankduong) | 11,96 B | no disponible | Apache 2.0 | Reescritura con preservación factual, en/zh, GGUF con QAT |
| google/gemma-4-12B (base) | 12 B (aproximado, según nombre) | no disponible | no disponible en esta ficha | Modelo base multimodal image-text-to-text |
| Alternativas de reescritura o parafraseo | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de alteración factual: aunque el modelo se entrena para conservar datos, el juez estricto detectó problemas en 44 de 420 reescrituras en inglés; el autor recomienda revisar el resultado antes de enviarlo, especialmente números, fechas y nombres.
- Los ejemplos «antes y después» de la model card son selecciones entre 8 muestras por borrador, no resultados medios; no deben interpretarse como el comportamiento típico.
- Cobertura lingüística limitada a inglés y chino; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar el procesamiento de documentos sin troceado.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base, puede heredar sesgos de este.
- Riesgo de alucinación: el diseño busca minimizarlo, pero no se aportan métricas específicas de alucinación fuera del conjunto de evaluación del autor.
- Uso comercial: la licencia Apache 2.0 lo permite, pero deben verificarse las condiciones del modelo base google/gemma-4-12B, que no se detallan en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-24; no hay evidencia de adopción externa ni de validación independiente de las métricas.
- La evaluación de detección de IA se realizó con una única herramienta (Originality.ai) en un ajuste concreto; no se garantiza el mismo comportamiento frente a otros detectores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trankduong/humanizer
- Repositorio de archivos GGUF: https://huggingface.co/jialinyyzz/humanizer-GGUF
- Repositorio GitHub del proyecto: https://github.com/sgaofen/humanizer-local-model
- README en chino: https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md
- Guía de uso sin la aplicación: https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md
- Guía de uso sin la aplicación (chino): https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md
- Instrucciones para agentes de código: https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md
- Guía de instalación: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md
- Documentación de cuantización: https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md
- Ejemplos de evaluación (8 muestras por borrador, Q8_0): https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json
- Aplicación macOS Apple silicon (0.3.2): https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg
- Aplicación Windows x64 (0.3.2): https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe
- Última release: https://github.com/sgaofen/humanizer-local-model/releases/latest
- Modelo base: https://huggingface.co/google/gemma-4-12B
