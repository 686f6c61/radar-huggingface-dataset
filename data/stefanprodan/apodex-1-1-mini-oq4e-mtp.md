# stefanprodan/Apodex-1.1-mini-oQ4e-mtp

## Resumen

Apodex-1.1-mini-oQ4e-mtp es una cuantización de precisión mixta de 4 bits en formato MLX del modelo Apodex-1.1-mini, desarrollada por stefanprodan para Apple Silicon. El modelo base, creado por el equipo de Apodex, es un MoE de 35.000 millones de parámetros con 3.000 millones activos (35B-A3B) basado en la arquitectura Qwen3.5, orientado a tareas de inteligencia agéntica: razonamiento, búsqueda, manejo de archivos, ejecución de código y coordinación multi-agente. Esta versión cuantizada mantiene el head de Multi-Token Prediction (MTP) nativo del checkpoint original, lo que permite decodificación especulativa Lightning MTP en el runtime oMLX. Con un tamaño en disco de 21,6 GB, resulta viable para ejecutarse en Macs con chip M-series, acercando un modelo de alto rendimiento a entornos locales de desarrollo e investigación.

La cuantización se realizó con el cuantizador oQ de oMLX 0.6.4, nivel 4 mejorado (oQ4e), con tamaño de grupo 64 y una matriz de importancia de 523 entradas del conjunto de calibración `oqe_code_multilingual`, sin expertos muertos. La precisión mixta asigna 4 bits a los expertos MoE y entre 6 y 8 bits a la atención, al experto compartido y al head MTP. El tokenizador, la plantilla de chat y la configuración de generación se mantienen sin cambios respecto al modelo original. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Qwen3.5), 35B totales, 3B activos |
| Parametros totales | 35B (A3B MoE) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4e (4 bits mixtos, grupo 64, precisión mixta 4-8 bits) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (5 shards, MLX) |

## Arquitectura y entrenamiento

El modelo base Apodex-1.1-mini es un MoE con arquitectura Qwen3.5, con 35.000 millones de parámetros totales y 3.000 millones activos por token. Segun el articulo tecnico (arXiv:2608.23283), el modelo fue entrenado para tareas de inteligencia agéntica, separando estructuralmente el razonamiento del verificador para proporcionar resultados fundamentados y auditables. El conjunto de entrenamiento y el proceso exacto (RLHF, DPO, etc.) no se detallan en la informacion disponible.

Esta version concreta no es un modelo reentrenado, sino una cuantizacion del checkpoint original realizada con el cuantizador oQ de oMLX 0.6.4. La cuantizacion oQ4e utiliza un tamaño de grupo de 64 y una matriz de importancia calculada sobre un conjunto de calibracion multilingue de 523 entradas. La innovacion principal es la preservacion del head MTP (`language_model.mtp.*`, 42 tensores), que permite al runtime oMLX ejecutar decodificacion especulativa Lightning MTP, acelerando la generacion sin perder calidad. El tokenizador y la plantilla de chat se heredan intactos del modelo base.

## Capacidades

- Generacion de texto y conversacion multilingue (ingles y chino).
- Razonamiento y pensamiento (thinking mode) habilitado por defecto en la plantilla de chat; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Capacidades agénticas: razonamiento multi-paso, busqueda, manejo de archivos, ejecucion de codigo y coordinacion multi-agente, segun la descripcion del modelo base.
- Soporte de decodificacion especulativa MTP (Lightning MTP) en oMLX, que reduce la latencia de generacion.
- Tool calling y function calling: implicito en las capacidades agénticas, aunque no se documenta explicitamente en la model card.
- Integracion con el ecosistema MLX para Apple Silicon.

## Casos de uso

- Asistentes de investigacion: el modelo puede razonar sobre documentos largos, buscar informacion externa y verificar cada paso de su razonamiento, gracias a su arquitectura de solver-verificador. Es adecuado para resumir articulos cientificos, extraer conclusiones y citar fuentes.
- Agentes de automatizacion de tareas: al soportar ejecucion de codigo, manejo de archivos y coordinacion multi-agente, puede integrarse en pipelines que requieran interactuar con APIs, procesar datos y ejecutar scripts de forma autonoma.
- Generacion y revision de codigo en entornos locales: con 3B activos y cuantizacion 4 bits, puede ejecutarse en una Mac con suficiente memoria unificada, ofreciendo asistencia de codigo sin depender de servicios en la nube.
- Chatbots de atencion al cliente en chino e ingles: su capacidad de razonamiento y su modo de pensamiento permiten mantener conversaciones coherentes y resolver consultas complejas, aunque la longitud de contexto no esta especificada.
- Analisis de datos y reportes: puede procesar conjuntos de datos, generar resumenes y producir informes estructurados, aprovechando su capacidad de ejecutar codigo para manipular tablas y estadisticas.
- Prototipado de sistemas multi-agente: su soporte para coordinacion multi-agente lo hace util para experimentar con arquitecturas de agentes colaborativos en investigacion academica o desarrollo de productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo tecnico menciona que Apodex 1.1 Mini alcanza un "leading performance band" en tareas de trabajo profesional, finanzas, investigacion cientifica, matematicas, codigo y busqueda, pero no se proporcionan cifras concretas ni tablas comparativas en los materiales revisados.

## Requisitos de hardware

- Plataforma: Apple Silicon (M1, M2, M3 o posteriores). La model card indica que fue probado en un M2 Max.
- Memoria unificada: se recomienda al menos 32 GB para cargar el modelo completo (21,6 GB en disco) con margen para el contexto y la generacion. Con 16 GB podria ejecutarse con cuantizaciones mas agresivas o ventanas de contexto reducidas, pero no esta garantizado.
- Almacenamiento: 21,6 GB libres para los pesos.
- Runtime: oMLX 0.6.4 o superior. Otros runtimes MLX (p.ej. llama.cpp con backend MLX, MLX-LM) no han sido probados con esta build.
- Inferencia: la decodificacion especulativa Lightning MTP requiere activarla en la configuracion de oMLX. El rendimiento exacto (tokens por segundo) no se documenta en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otros modelos de la misma categoria (MoE de ~35B con 3B activos). Se podria comparar con Qwen3-30B-A3B o DeepSeek-V3-Lite, pero no se han encontrado benchmarks publicos de Apodex-1.1-mini en las fuentes consultadas.

## Limitaciones y advertencias

- La cuantizacion oQ4e introduce perdida de precision respecto al checkpoint bf16 original, lo que puede afectar a tareas de razonamiento muy sensibles a errores numericos.
- Solo se han probado los idiomas ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El modelo base es un sistema agéntico con capacidades de ejecucion de codigo y manejo de archivos; su uso en entornos de produccion requiere medidas de contencion (sandboxing, permisos limitados) para evitar acciones no deseadas.
- La longitud de contexto no esta especificada; se desconoce si soporta ventanas largas (p.ej. 128k tokens) o solo contextos cortos.
- No se han publicado resultados de benchmarks independientes que validen las afirmaciones de rendimiento del articulo tecnico.
- La compatibilidad con otros runtimes MLX no esta probada; el uso fuera de oMLX podria provocar errores o una degradacion del rendimiento.
- Como cualquier modelo de lenguaje, puede generar alucinaciones o razonamientos incorrectos, especialmente en tareas abiertas o con informacion ambigua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stefanprodan/Apodex-1.1-mini-oQ4e-mtp
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Articulo tecnico (arXiv): https://arxiv.org/abs/2608.23283
- Sitio web de Apodex: https://www.apodex.com/
- Repositorio de oMLX: https://github.com/jundot/omlx
- Articulo sobre el lanzamiento de Apodex 1.1: https://korshunov.ai/en/article/21262-apodex-team-releases-apodex-1-1-model-family-and-frontieragent-harness/
