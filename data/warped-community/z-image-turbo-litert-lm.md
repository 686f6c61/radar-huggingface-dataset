# warped-community/Z-Image-Turbo-litert-lm

## Resumen

Z-Image-Turbo-litert-lm es un espejo (mirror) del modelo de generacion de imagenes Z-Image-Turbo convertido al formato LiteRT para su ejecucion en dispositivos moviles. Lo publica la organizacion warped-community dentro del ecosistema de la aplicacion Android Warped (linea "coming-soon") y deriva directamente del repositorio litert-community/Z-Image-Turbo-LiteRT, que a su vez toma como base el modelo original Tongyi-MAI/Z-Image-Turbo.

El modelo de origen, atribuido a Tongyi-MAI (equipo vinculado a Qwen), es un transformer de difusion para texto-a-imagen de aproximadamente 6.000 millones de parametros que, segun las fuentes publicas, genera una imagen completa en torno a 8 pasos de muestreo gracias a tecnicas de destilacion. Esa reduccion de pasos es lo que hace viable su despliegue en hardware de gama movil, objetivo de esta conversion LiteRT con cuantizacion int8.

La relevancia de esta ficha concreta es doble: por un lado documenta un artefacto listo para inferencia on-device en Android; por otro, advierte de una inconsistencia de metadatos importante, ya que el repositorio esta etiquetado con la libreria `litert-lm` (runtime orientado a modelos de lenguaje) pese a que el modelo base es un generador de imagenes, no un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base Tongyi-MAI/Z-Image-Turbo); no disponible en detalle para esta conversion |
| Parametros totales | ~6.000 millones (dato del modelo base segun fuentes web; no confirmado para este espejo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes, no de texto) |
| Tipos de cuantizacion | int8 (segun el repositorio de origen litert-community/Z-Image-Turbo-LiteRT) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT / TFLite (etiquetado como `litert-lm` y `tflite`); tamano del repo 4,3 GB |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica especifica sobre esta conversion mas alla de que es un espejo "mobile-ready" en LiteRT del modelo litert-community/Z-Image-Turbo-LiteRT, mantenido para la aplicacion Android Warped. El modelo base, Z-Image-Turbo, se describe en las fuentes publicas como un transformer de difusion de aproximadamente 6.000 millones de parametros optimizado mediante destilacion para reducir drasticamente el numero de pasos de inferencia (en torno a 8) sin degradar en exceso la calidad visual. El repositorio de origen se identifica como un "diffusion-transformer int8" on-device.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF o DPO en el modelo original. Tampoco se detalla el proceso de conversion a LiteRT (herramientas, calibracion de cuantizacion, precision de pesos y activaciones) ni el codificador de texto o el VAE asociados al pipeline. Toda esta informacion figura como no disponible.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts descriptivos, heredada del modelo base Z-Image-Turbo.
- Inferencia on-device: la conversion LiteRT con cuantizacion int8 esta pensada para ejecutarse en dispositivos moviles Android.
- Generacion rapida: el modelo base se caracteriza por producir imagenes en torno a 8 pasos de muestreo, lo que reduce la latencia frente a pipelines de difusion convencionales.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de generacion de imagenes).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponibles; dependen del codificador de texto del modelo base, sin datos publicados.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Generacion de imagenes offline en aplicaciones Android: el modelo puede integrarse directamente en una app movil para crear imagenes sin conexion, aprovechando el formato LiteRT int8 y su tamano contenido.
- Edicion o generacion asistida en la propia app Warped: su origen como artefacto "coming-soon" para esta aplicacion sugiere su uso previsto en funciones de creacion visual dentro de la misma.
- Prototipado de funciones de imagen en movil: permite a desarrolladores evaluar la calidad de Z-Image-Turbo en un telefono antes de decidir un despliegue en servidor.
- Aplicaciones de privacidad estricta: al ejecutarse on-device, los prompts y las imagenes no abandonan el dispositivo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Demos interactivas de baja latencia: la generacion en torno a 8 pasos facilita experiencias casi en tiempo real en pantalla movil.
- Investigacion sobre cuantizacion y despliegue LiteRT: sirve de referencia practica para estudiar el impacto de int8 en un transformer de difusion.
- Generacion de recursos graficos ligeros (avatares, fondos, bocetos) en flujos creativos moviles con poca dependencia de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se han facilitado metricas de calidad de imagen (FID, CLIP score, etc.), latencia, throughput ni comparativas numericas para esta conversion LiteRT.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repositorio ocupa 4,3 GB, lo que da una referencia orientativa del espacio de almacenamiento necesario en disco o memoria para los pesos.
- GPU recomendadas: no disponible; el artefacto esta orientado a aceleradores moviles (GPU/NPU integradas en SoC Android) mas que a GPUs de escritorio.
- Compatibilidad con GPU de consumo: no confirmada; el destino declarado es hardware movil, no tarjetas como RTX 4090, A100 o H100.
- Opciones de despliegue: runtime LiteRT / TFLite (segun las etiquetas `litert-lm` y `tflite`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de generacion de imagenes.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|
| warped-community/Z-Image-Turbo-litert-lm | ~6B (heredado del base) | LiteRT / TFLite, int8 | apache-2.0 | Espejo para app Warped (0 descargas, 0 likes) |
| litert-community/Z-Image-Turbo-LiteRT | ~6B (heredado del base) | LiteRT, int8 | apache-2.0 | Repositorio comunitario de origen, mas establecido |
| Tongyi-MAI/Z-Image-Turbo | ~6B | Pesos originales (no especificado) | no disponible en la informacion | Modelo base original |

No se dispone de datos de rendimiento comparado (calidad, latencia, memoria) entre estas variantes. Otras alternativas de generacion de imagenes on-device no se detallan por falta de informacion verificable.

## Limitaciones y advertencias

- Inconsistencia de metadatos: el repositorio esta etiquetado como `litert-lm`, libreria propia de modelos de lenguaje, pero el modelo base es un generador de imagenes. Conviene verificar el artefacto real antes de integrarlo.
- Ausencia de model card detallada: no hay especificaciones de arquitectura, cuantizacion exacta, codificador de texto ni pipeline de inferencia.
- Sin benchmarks: no es posible estimar la calidad de imagen ni la degradacion introducida por la cuantizacion int8.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar contenido irrelevante, deformado o sesgado respecto al prompt.
- Sesgos conocidos: no documentados, pero el modelo base hereda los sesgos de su dataset de entrenamiento, no detallado.
- Adopcion nula: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Uso comercial: la licencia apache-2.0 lo permite en principio, pero se desconoce la licencia y las condiciones del modelo base original, que podrian imponer restricciones adicionales.
- Naturaleza de espejo: al ser una copia derivada, puede quedar desactualizado respecto a la fuente litert-community.
- Restricciones de idioma y de contexto: no disponibles.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/warped-community/Z-Image-Turbo-litert-lm
- Fuente de la conversion: https://huggingface.co/litert-community/Z-Image-Turbo-LiteRT
- README de la fuente LiteRT: https://huggingface.co/litert-community/Z-Image-Turbo-LiteRT/blob/main/README.md
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Ficha de Z-Image Turbo en Layer: https://layer.ai/models/qwen-z-image-turbo
- Sitio divulgativo de Z-Image Turbo: https://zimageturbo.io/en
- Repositorio GitHub (SDK/CLI de Z Image Turbo): https://github.com/ZImageTurboAI/ZImageTurboAI
