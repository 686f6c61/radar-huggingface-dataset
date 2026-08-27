# Vontra/GLM-5.3-Flash-MLX-oQ4-MTP

## Resumen

GLM-5.3-Flash es un modelo multimodal de la familia GLM-5 desarrollado por Z.ai, publicado el 14 de agosto de 2026. Se trata del primer modelo nativamente multimodal de la serie GLM-5 y el primero de la familia en incorporar un bloque de predicción multi-token (MTP) integrado en la arquitectura. Con 320B parámetros totales y 18B activos por token, está diseñado para tareas de codificación, razonamiento y agentes a un coste de inferencia reducido frente a modelos monolíticos de tamaño similar.

La conversión que se describe en esta ficha, publicada por el usuario Vontra, es una cuantización post-entrenamiento (PTQ) del checkpoint oficial de Z.ai al formato MLX (Apple Silicon), con una receta de precisión mixta sensible a la sensibilidad de los módulos. El checkpoint resultante conserva el bloque MTP nativo del modelo original, lo que permite decodificación especulativa en entornos que soporten la arquitectura `glm5_next`. La cuantización oQ4 reduce el peso a 172,99 GiB y permite ejecutar el modelo en hardware Apple Silicon con memoria unificada, aunque con una velocidad de decodificación modesta.

El modelo es relevante porque combina multimodalidad (imagen y vídeo), ventana de contexto de 1M tokens, arquitectura MoE dispersa y licencia MIT, lo que lo convierte en una opción atractiva para investigación y despliegues comerciales en entornos de Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_5_next`, multimodal sparse MoE (Mixture of Experts) con atención híbrida linear y sparse MLA |
| Parametros totales | 320B (modelo original); 51.793.481.206 en el checkpoint MLX cuantizado |
| Parametros activos | 18B por token (modelo original) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | oQ4 (4-bit affine base con group size 64, 554 módulos con override a 5/6/8-bit) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (35 shards, 3125 tensores) |

## Arquitectura y entrenamiento

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5. Utiliza una arquitectura de Mixture of Experts (MoE) con 320B parámetros totales y 18B activos por token, combinando atención linear (KDA) y sparse MLA (Multi-head Latent Attention). La arquitectura incorpora hyper-connections con restricciones de manifold y un bloque de predicción multi-token (MTP) integrado, que permite decodificación especulativa con un único paso de predicción adicional. El modelo acepta entrada de imagen y vídeo, además de texto, y está entrenado sobre un conjunto de datos multilingüe centrado en inglés y chino.

La conversión de Vontra es una cuantización post-entrenamiento (PTQ) que no retrena ni fine-tunea el modelo original. La receta oQ4 aplica 4-bit affine con group size 64 como base, y selecciona 554 módulos sensibles (medidos con activación MSE relativa sobre un conjunto de calibración de código multilingüe, 128 muestras a 256 tokens) para ser promovidos a 5, 6 u 8 bits. El token embedding, la salida, el encoder de visión y el projector se conservan a precisión de origen (FP8 E4M3 con block scaling 128x128). El bloque MTP se cuantiza a 4-bit con 12 overrides nativos adicionales. La conversión se realizó con el convertidor de Vontra usando MLX 0.32.0.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés y chino).
- Comprensión multimodal: entrada de imagen y vídeo.
- Generación de código y soporte de tool calling (function calling).
- Capacidades de agente y razonamiento multi-paso.
- Predicción multi-token (MTP) nativa para decodificación especulativa (requiere runtime compatible).
- Ventana de contexto de 1M tokens, adecuada para documentos largos y conversaciones extendidas.

## Casos de uso

- Asistencia al cliente automatizada: la ventana de 1M tokens permite mantener conversaciones de larga duración con historial completo, gestionando contextos amplios sin truncar. Su soporte multilingüe (en/zh) facilita su uso en mercados de habla inglesa y china.
- Generación de código en producción: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests y autocompletado en editores, aprovechando la arquitectura MoE para un coste por token reducido.
- Análisis de documentos técnicos con imágenes: el modelo acepta entrada de imagen y texto, por lo que puede procesar diagramas, capturas de pantalla y documentación técnica con figuras en un único paso.
- Agentes autónomos de software: con su capacidad de razonamiento multi-paso y soporte de herramientas, puede orquestar tareas como depuración de código, ejecución de comandos y resolución de issues en repositorios.
- Búsqueda y resumen en corpus largos: la ventana de 1M tokens permite procesar documentos extensos (informes, papers, libros) sin necesidad de chunking, generando resúmenes y extrayendo información relevante.
- Prototipado en Apple Silicon: al estar cuantizado para MLX, permite ejecutar un modelo de 320B en un Mac Studio con GPU unificada, útil para desarrollo local y pruebas de concepto sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta conversión MLX. Los datos de rendimiento disponibles se limitan a mediciones de latencia en hardware:

| Modo | Tokens de salida | Mediana de decodificación |
|---|---:|---:|
| oQ baseline (MTP off) | 128 | 6,2155 tokens/s |
| oQ con MTP nativo | 128 | 4,9969 tokens/s |

Mediciones en Apple M3 Ultra con 256 GB de memoria unificada, runtime oMLX 0.6.3rc3 build 2475 y MLX 0.32.0, con draft depth 1 y aceptación de drafts del 100%. La relación de decodificación MTP/baseline es 0,8039x, es decir, el MTP reduce la velocidad de decodificación en esta configuración.

Para el modelo original, los resultados web indican que supera a GLM-5.2 en benchmarks de codificación y agentes, y se acerca a Claude Opus 4.8 en tareas de código, pero no se han proporcionado cifras concretas en la información disponible.

## Requisitos de hardware

- El checkpoint cuantizado ocupa 172,99 GiB de peso en disco.
- VRAM estimada: al menos 180-200 GB de memoria unificada para cargar el modelo completo en Apple Silicon.
- GPU recomendadas: Apple Silicon con GPU integrada (probado en M3 Ultra con 256 GB de memoria unificada). No es compatible con GPU NVIDIA/AMD sin el runtime MLX.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño; requiere equipos con gran memoria unificada.
- Opciones de despliegue: oMLX 0.6.3rc3 build 2475 (validado), MLX 0.32.0 (runtime de tensores), MLX-VLM 0.6.3 con integración GLM5 Next para carga de visión.
- Rendimiento: ~5-6 tokens/s de decodificación en M3 Ultra 256 GB, lo que limita su uso a tareas de baja latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (original) | 320B | 18B | 1M | MIT | Multimodal, MTP nativo |
| Vontra/GLM-5.3-Flash-MLX-oQ4-MTP | 320B (51,8B en checkpoint cuantizado) | 18B | 1M | MIT | Cuantización MLX oQ4 |
| GLM-5.2 | 743B | - | - | MIT | Flagship anterior, sin multimodal nativo |
| Claude Opus 4.8 | - | - | - | Propietaria | Referencia en codificación y agentes, no abierto |

No se dispone de datos de benchmarks comparativos directos entre la versión cuantizada y el modelo original en la información proporcionada.

## Limitaciones y advertencias

- La cuantización oQ4 introduce pérdida de precisión respecto al modelo original en FP8; los módulos sensibles se promueven a 5/6/8-bit, pero la degradación puede ser notable en tareas de alta precisión (matemáticas avanzadas, razonamiento complejo).
- El modelo solo soporta inglés y chino; no hay soporte declarado para otros idiomas.
- El MTP integrado no acelera la decodificación en las mediciones disponibles (reduce la velocidad a 0,80x), por lo que su uso debe evaluarse caso por caso.
- El runtime requerido es específico: oMLX 0.6.3rc3 build 2475 con integración GLM5 Next; builds anteriores sin soporte de oQ o MTP no cargarán el checkpoint.
- El checkpoint es un modelo cuantizado post-entrenamiento, no un fine-tune; no se ha retrenado para mitigar sesgos o mejorar capacidades específicas.
- No se han publicado evaluaciones de sesgos, alucinación o robustez para esta conversión.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo original puede tener limitaciones en el uso de datos de entrenamiento (no documentado en la información disponible).

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/Vontra/GLM-5.3-Flash-MLX-oQ4-MTP
- Modelo original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Reporte técnico: https://arxiv.org/abs/2602.15763
- Repositorio de Apple MLX: https://github.com/ml-explore/mlx
