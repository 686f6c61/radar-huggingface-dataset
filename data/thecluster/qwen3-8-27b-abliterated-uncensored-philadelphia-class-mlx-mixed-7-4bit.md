# TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-7.4bit

## Resumen

Este modelo es una conversión a formato MLX del Qwen3.8-27B abliterado y sin censura, publicada por TheCluster a partir del trabajo de KridgeDookie. El modelo base, Qwen3.8-27B, es un transformer denso de 27.000 millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), nativo para visión y lenguaje, con control de razonamiento, tool calling y cabeza MTP. La versión MLX aplica cuantización mixta por tensor de 7,4 bits por peso (bpw) con group size 32, lo que reduce el repositorio a 25,2 GB y permite su ejecución en hardware Apple Silicon. Su relevancia radica en que combina las capacidades multimodales y de razonamiento de Qwen3.8-27B con la eliminación de los mecanismos de rechazo mediante abliteration, orientándose a casos de uso sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet lineal + atención completa), visión-lenguaje |
| Parametros totales | 27B (denominación del modelo); 7.388.728.560 en safetensors MLX |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX mixta 7,4 bpw (tensores de 6 y 8 bits, affine, group size 32) |
| Idiomas soportados | 26 idiomas: en, zh, ru, es, fr, it, ja, ko, af, de, ar, tr, is, pl, sw, sv, nl, he, id, uk, fa, pa, pt, ms, fi, el |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27.000 millones de parámetros con arquitectura híbrida de atención: combina capas de atención completa con capas de atención lineal Gated DeltaNet, lo que reduce el coste computacional en secuencias largas. Es un modelo nativo de visión y lenguaje (image-text-to-text) e incorpora una cabeza MTP (multi-token prediction) para acelerar la decodificación. El proceso de abliteration aplicado por KridgeDookie elimina las direcciones de rechazo aprendidas durante el entrenamiento con RLHF, de modo que el modelo deja de negarse a responder a determinadas solicitudes. TheCluster convirtió el resultado a formato MLX usando mlx-vlm versión 0.6.13, aplicando cuantización mixta por tensor con group size 32 y una media de 7,376 bpw. El valor por defecto de reasoning_effort se fijó en 'low' para evitar un exceso de razonamiento.

## Capacidades

- Generación de texto y razonamiento multistep con modo de pensamiento controlable (thinking mode) mediante el parámetro reasoning_effort.
- Comprensión de imágenes: al ser un modelo nativo de visión y lenguaje, puede procesar entradas visuales junto con texto.
- Tool calling / function calling: soporta invocación de herramientas externas, lo que permite integrarlo en flujos de agentes.
- Decodificación acelerada gracias a la cabeza MTP (multi-token prediction).
- Multilingüe: cubre 26 idiomas, incluyendo español, inglés, chino, ruso, francés, alemán, árabe, japonés, coreano, entre otros.
- Sin censura: el proceso de abliteration elimina los rechazos por contenido, permitiendo respuestas sin restricciones de seguridad.
- Parámetros de muestreo recomendados diferenciados para modo pensamiento (temperature=1.0, top_p=0.95, top_k=20) y modo instructivo (temperature=0.7, top_p=0.80, presence_penalty=1.5).

## Casos de uso

- Generación creativa de ficción sin restricciones: escritores y creadores de contenido pueden producir narrativa adulta, terror extremo u otros géneros que los modelos censurados rechazan, gracias a la abliteration.
- Asistente de programación con tool calling: el modelo puede integrarse en entornos de desarrollo para generar código, invocar funciones y razonar sobre problemas técnicos complejos, aprovechando su soporte de function calling.
- Análisis de documentos con imágenes: al ser un modelo de visión y lenguaje, puede procesar capturas de pantalla, diagramas o fotografías junto con texto para extraer información o responder preguntas.
- Chatbot multilingüe de atención al cliente: con soporte para 26 idiomas, puede desplegarse como agente conversacional en mercados internacionales, manteniendo contexto en conversaciones largas gracias a su arquitectura híbrida de atención.
- Investigación académica sobre alineación y seguridad: el modelo abliterado sirve como objeto de estudio para analizar cómo la eliminación de direcciones de rechazo afecta al comportamiento del modelo, comparándolo con la versión original.
- Prototipado de agentes autónomos en Apple Silicon: desarrolladores con hardware Apple pueden desplegar el modelo en local mediante MLX para experimentar con agentes que requieren razonamiento multistep y llamadas a herramientas sin depender de APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Formato MLX diseñado exclusivamente para Apple Silicon (M1, M2, M3, M4 y sucesivos).
- Tamaño del repositorio: 25,2 GB, lo que sugiere un uso de memoria unificada de al menos 32 GB para una inferencia cómoda.
- Se recomienda un Mac con 32 GB o más de memoria unificada para cargar el modelo completo con cuantización mixta de 7,4 bpw.
- El despliegue se realiza mediante MLX (mlx-vlm 0.6.13 o superior); no es compatible con CUDA ni con GPUs NVIDIA.
- No es posible ejecutarlo en GPUs de consumo convencionales (RTX, etc.) al estar limitado al ecosistema MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | no disponible | Apache 2.0 | safetensors | Modelo base con alineación y rechazos intactos |
| Qwen3.8-27B Abliterated (KridgeDookie) | 27B | no disponible | Apache 2.0 | safetensors | Versión abliterada sin censura, base de este modelo |
| Qwen3.8-27B Uncensored MLX (OrcaRouter) | 27B | no disponible | Apache 2.0 | MLX, GGUF, FP8 | Otra conversión MLX del mismo modelo abliterado, con más opciones de cuantización |

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que significa que el modelo puede generar contenido dañino, ilegal o éticamente problemático sin filtros. Su uso en producción conlleva riesgos legales y de reputación.
- Al ser una conversión MLX, solo funciona en Apple Silicon; no hay versiones para CUDA ni para GPUs de escritorio convencionales.
- El valor por defecto de reasoning_effort en 'low' puede limitar la calidad del razonamiento en tareas complejas si no se ajusta manualmente.
- La cuantización mixta de 7,4 bpw puede introducir una ligera degradación de calidad respecto al modelo original en precisión completa.
- No se dispone de datos sobre la longitud de contexto soportada en esta conversión MLX.
- El uso de presence_penalty alto (hasta 2) puede provocar mezcla de idiomas y una ligera caída de rendimiento, según advierte la propia model card.
- No se han publicado benchmarks que permitan evaluar el rendimiento real del modelo en tareas estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-7.4bit
- Modelo base (KridgeDookie): https://huggingface.co/KridgeDookie/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS
- Versión MLX 9,4 bit del mismo modelo: https://huggingface.co/TheCluster/Qwen3.8-27B-ABLITERATED-UNCENSORED-PHILADELPHIA-CLASS-MLX-mixed-9.4bit
- Repositorio GitHub con explicación del proceso: https://github.com/onurburak9/Qwen3.8-27B-Uncensored-MLX
- Artículo sobre abliteration de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Artículo sobre la versión MLX de OrcaRouter: https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
