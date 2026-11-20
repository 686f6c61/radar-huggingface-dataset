# vultr/K2-Horizon-3.7B-GGUF

## Resumen

K2-Horizon-3.7B-GGUF es la versión cuantizada en formato GGUF del modelo denso K2-Horizon-3.7B desarrollado por IFM, publicada por Vultr como parte de su catálogo de cuantizaciones para llama.cpp. El modelo base es un transformer decoder-only de 3.700 millones de parámetros nominales (5.058.255.360 parámetros reales según los tensores en safetensors, incluyendo embeddings y cabezas de salida) diseñado específicamente para flujos de trabajo agénticos, generación de código, razonamiento y tareas de lenguaje con contexto largo.

La característica más destacable es su ventana de contexto nativa de 512.000 tokens, introducida desde la fase de midtraining, lo que lo sitúa en una categoría poco habitual para un modelo de su tamaño. Emplea Grouped Query Attention con 32 cabezas de atención y 8 cabezas clave-valor, 36 capas, un tamaño oculto de 2.560 y una dimensión feed-forward de 10.240 con activación SiLU. El vocabulario es de 250.624 tokens.

Esta publicación concreta no contiene los pesos originales en safetensors, sino cuantizaciones híbridas en GGUF: en lugar de aplicar una precisión uniforme a toda la red, cada capa recibe una precisión elegida a partir de una puntuación de importancia medida, de modo que los bits se asignan donde más afectan a la salida. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (k2-horizon), Grouped Query Attention |
| Parametros totales | 5.058.255.360 (nominal 3.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512.000 tokens nativos, desde midtraining |
| Tipos de cuantizacion | GGUF con cuantizacion hibrida por capa segun puntuacion de importancia (niveles concretos no disponibles) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Capas | 36 |
| Tamano oculto | 2.560 |
| Cabezas de atencion | 32 (8 cabezas clave-valor) |
| Dimension feed-forward | 10.240, activacion SiLU |
| Vocabulario | 250.624 tokens |
| Grupos de layer-normalization | Dos |
| RoPE theta | No disponible (truncado en la model card) |
| Modelo base | IFM/K2-Horizon-3.7B |
| Tamano del repositorio | 12,9 GB |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer decoder-only densa con atención de consultas agrupadas (GQA): 32 cabezas de consulta frente a 8 cabezas clave-valor, lo que reduce el coste de memoria de la caché KV en inferencia de contexto largo. Cuenta con 36 capas, tamaño oculto de 2.560, dos grupos de layer-normalization y una capa feed-forward de 10.240 dimensiones con activación SiLU. El vocabulario de 250.624 tokens es inusualmente grande para un modelo de este tamaño, lo que sugiere un tokenizador multilingüe o de cobertura amplia, aunque el autor solo declara inglés como idioma soportado. La ventana de contexto de 512.000 tokens se incorpora de forma nativa a partir de la fase de midtraining, no mediante extensión posterior.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona que se han publicado checkpoints intermedios de entrenamiento para permitir el análisis de capacidades, lo que apunta a una orientación del proyecto hacia la investigación y la reproducibilidad. La publicación de Vultr no modifica la arquitectura: aplica una cuantización híbrida por capas basada en una puntuación de importancia medida empíricamente, asignando mayor precisión a las capas con mayor impacto en la salida.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y tareas de lenguaje de contexto largo, con ventana nativa de 512.000 tokens.
- Generación y asistencia en código, orientada a flujos agénticos.
- Flujos de trabajo agénticos y razonamiento multi-paso, según la descripción del autor.
- Compatibilidad con llama.cpp y con endpoints compatibles (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la declaración del autor.

## Casos de uso

- Análisis de repositorios completos: con 512.000 tokens de contexto nativo, el modelo puede ingerir ficheros de código extensos o varios módulos relacionados en una sola pasada para tareas de revisión, resumen y detección de dependencias.
- Asistentes de código en local: al distribuirse en GGUF y pesar 12,9 GB el repositorio completo, puede ejecutarse con llama.cpp en estaciones de trabajo sin GPU de datacenter, integrándose en editores o pipelines de CI/CD para generación y explicación de código.
- Procesamiento de documentación técnica extensa: resumen y extracción de información de manuales, especificaciones o contratos largos en inglés, aprovechando la ventana de contexto para evitar técnicas de fragmentación.
- Agentes autónomos de múltiples pasos: el modelo está descrito por el autor como orientado a flujos agénticos, por lo que encaja en orquestadores que encadenan llamadas con estado y contexto acumulado.
- Despliegue en el propio cloud de Vultr: la etiqueta `endpoints_compatible` y la publicación por parte de Vultr facilitan su uso como endpoint de generación de texto dentro de su infraestructura.
- Investigación sobre entrenamiento de modelos pequeños: la disponibilidad de checkpoints intermedios del modelo base permite estudiar la evolución de capacidades durante el entrenamiento en un modelo compacto de contexto largo.
- Prototipado de bajo coste: al ser un modelo denso de 3,7B con licencia Apache 2.0, sirve para validar pipelines de generación de texto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio GGUF completo ocupa 12,9 GB, por lo que una cuantizacion de aproximadamente 4 bits rondaría los 3-4 GB y una de 8 bits en torno a 5-6 GB, aunque los niveles exactos publicados no se detallan.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 3,7B denso es viable en GPUs de consumo con suficiente VRAM; la caché KV para 512.000 tokens con 8 cabezas clave-valor y 36 capas requiere una estimación específica que no se ha publicado.
- GPU de consumo: previsiblemente compatible con tarjetas de 8 GB o más en cuantizaciones bajas, si bien el contexto completo de 512K exigiría mucha más memoria para la caché KV; sin datos oficiales.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio), servidores compatibles con endpoints y, en general, cualquier runtime que consuma GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| K2-Horizon-3.7B (este) | 3,7B nominales (5,06B reales) | 512K nativo | Apache 2.0 | GGUF | Denso con GQA, orientado a agentes y contexto largo |
| IFM/K2-Horizon-3.7B | 3,7B nominales | 512K nativo | Apache 2.0 | Safetensors | Modelo base sin cuantizar |
| Alternativas de ~3-4B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

No se dispone de información verificada sobre modelos comparables de la misma categoría (tamaño y contexto) en la documentación consultada, por lo que no se presentan cifras de rendimiento comparado.

## Limitaciones y advertencias

- Idioma: el autor solo declara inglés; el rendimiento en castellano no está garantizado pese al vocabulario amplio.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Alucinación: no se han publicado métricas de fiabilidad ni evaluaciones de alucinación.
- Contexto largo: una ventana de 512K tokens implica un coste de memoria de caché KV elevado y posible degradación de la calidad en posiciones muy lejanas; no se han publicado evaluaciones específicas de recuperación en contexto largo.
- Cuantización híbrida: al elegir precisión por capa, el comportamiento puede diferir del modelo original en tareas sensibles a la precisión; conviene validar contra el modelo base en safetensors.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del comportamiento de estas cuantizaciones.
- Datos incompletos: la model card está truncada en el campo RoPE theta y no detalla los niveles de cuantización publicados ni los datos de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vultr/K2-Horizon-3.7B-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Vultr (sitio corporativo): https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Vultr Discover: https://discover.vultr.com/
- Wikipedia (Vultr): https://en.wikipedia.org/wiki/Vultr
