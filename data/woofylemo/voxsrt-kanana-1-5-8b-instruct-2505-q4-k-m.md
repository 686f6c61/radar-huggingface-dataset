# WoofyLemo/VoxSRT-kanana-1.5-8b-instruct-2505-q4-k-m

## Resumen

VoxSRT-kanana-1.5-8b-instruct-2505-q4-k-m es una conversión a formato GGUF del modelo Kanana 1.5 8B Instruct 2505, desarrollado por Kakao Corp. El repositorio, publicado por WoofyLemo, contiene los pesos cuantizados con Q4_K_M mediante llama.cpp, preparados para su uso en la aplicación VoxSRT, una herramienta de subtitulado y transcripción local. No se ha realizado ningún entrenamiento adicional sobre el modelo original; se trata de una distribución inmutable para inferencia local.

El modelo base, Kanana 1.5 8B Instruct, es un transformer denso de aproximadamente 8.030 millones de parámetros, con una ventana de contexto de 32.000 tokens ampliable a 128.000. Según la documentación de Kakao, esta versión presenta mejoras sustanciales en codificación, matemáticas y function calling respecto a la versión anterior, lo que la hace adecuada para tareas de razonamiento complejo y uso en agentes. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de esta ficha radica en que ofrece una opción de inferencia local eficiente para desarrolladores que necesitan un modelo bilingüe (coreano e inglés) con capacidades de código y herramientas, sin depender de servicios en la nube. El formato GGUF permite su ejecución en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 8.030.285.824 |
| Parametros activos | no aplica (modelo dense) |
| Longitud de contexto | 32.000 tokens (extensible a 128.000) |
| Tipos de cuantizacion | Q4_K_M (este repositorio) |
| Idiomas soportados | no disponible (el modelo base es bilingüe, coreano e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Kanana 1.5 8B Instruct es un transformer decoder-only con arquitectura densa, sin mezcla de expertos. No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas de alineación como RLHF o DPO en la información proporcionada. El paper original de la familia Kanana (arXiv:2502.18934) describe un enfoque de entrenamiento eficiente en cómputo, pero no cubre específicamente la versión 1.5.

La conversión a GGUF se realizó con llama.cpp (revisión b10549) y no modifica los pesos del modelo. El repositorio incluye un NOTICE con la procedencia exacta y un hash SHA-256 del paquete lógico para verificación de integridad. VoxSRT verifica el tamaño y el hash antes de cargar los archivos, garantizando que no se ha alterado el contenido.

## Capacidades

- Generación de texto y seguimiento de instrucciones en coreano e inglés (según el modelo base).
- Razonamiento matemático y resolución de problemas numéricos, con mejoras significativas respecto a la versión anterior de Kanana.
- Generación y comprensión de código en múltiples lenguajes de programación, con soporte para tareas de programación competitiva y desarrollo de software.
- Function calling: capacidad de invocar herramientas externas mediante llamadas a funciones estructuradas, útil para integración en agentes y pipelines automatizados.
- Procesamiento de contexto largo: ventana de 32K tokens nativa, ampliable a 128K, adecuada para documentos extensos o conversaciones multi-turno.
- Inferencia local: al estar cuantizado en GGUF, puede ejecutarse en CPU o GPU con motores como llama.cpp, Ollama o LM Studio.

## Casos de uso

- Subtitulado y transcripción local: VoxSRT utiliza este modelo para transcribir, alinear, corregir y traducir subtítulos de forma totalmente local, sin enviar audio o texto a servidores externos. La cuantización Q4_K_M reduce el uso de memoria, permitiendo su ejecución en equipos de gama media.
- Asistente de programación en entornos sin conexión: un desarrollador puede integrar el modelo en un IDE o CLI para autocompletar código, explicar fragmentos o generar tests, aprovechando su capacidad de function calling para interactuar con herramientas de línea de comandos.
- Resolución de problemas matemáticos en educación: el modelo puede utilizarse como tutor virtual que explica paso a paso la resolución de ecuaciones o problemas de álgebra, gracias a su entrenamiento reforzado en matemáticas.
- Agente conversacional bilingüe: empresas que atienden clientes en coreano e inglés pueden desplegar un chatbot local con memoria de contexto largo, reduciendo costes de API y garantizando privacidad de los datos.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede redactar comentarios, manuales o guías de uso, manteniendo coherencia con el contexto proporcionado.
- Automatización de tareas con function calling: en un pipeline de CI/CD, el modelo puede interpretar comandos en lenguaje natural, invocar funciones de despliegue o análisis, y devolver resultados estructurados para su procesamiento posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Kanana 1.5 8B Instruct no incluye tablas de rendimiento en la documentación accesible, y la conversión GGUF no añade métricas propias. Se recomienda consultar el repositorio oficial de Kakao para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa aproximadamente 4,9 GB. Con overhead de ejecución y contexto, se recomienda al menos 6-8 GB de VRAM para inferencia cómoda en GPU.
- GPUs compatibles: cualquier GPU con 8 GB o más de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A10, L4 o A100. También puede ejecutarse en CPU con 16 GB de RAM, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier motor compatible con GGUF. VoxSRT lo integra directamente en su aplicación.
- Latencia y throughput: no se dispone de mediciones específicas. En una RTX 4090, un modelo de 8B en Q4_K_M suele generar entre 40 y 80 tokens por segundo, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Kanana 1.5 8B Instruct (GGUF) | 8B | 32K (128K ext.) | Apache 2.0 | GGUF | Coreano, inglés |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | GGUF, safetensors | Multilingüe (principalmente inglés) |
| Qwen 2.5 7B Instruct | 7B | 32K (128K ext.) | Apache 2.0 | GGUF, safetensors | Multilingüe (incluye chino, inglés) |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | GGUF, safetensors | Multilingüe (principalmente inglés) |

La comparativa se basa únicamente en especificaciones técnicas, ya que no se dispone de benchmarks comparativos. Kanana 1.5 destaca por su enfoque bilingüe coreano-inglés y su énfasis en function calling, mientras que Llama y Qwen ofrecen mayor cobertura multilingüe. La licencia Apache 2.0 de Kanana es más permisiva que la de Llama 3.1, que tiene restricciones de uso para empresas con más de 700 millones de usuarios mensuales.

## Limitaciones y advertencias

- El modelo base está entrenado principalmente en coreano e inglés; su rendimiento en otros idiomas puede ser limitado o inconsistente.
- Como todo modelo de lenguaje, puede generar alucinaciones o información factualmente incorrecta, especialmente en dominios especializados o con contextos ambiguos.
- La cuantización Q4_K_M introduce una ligera pérdida de precisión respecto a los pesos originales en FP16, aunque en la práctica suele ser mínima para tareas de generación.
- La ventana de contexto de 32K es ampliable a 128K, pero el rendimiento puede degradarse en longitudes extremas; se recomienda validar en el caso de uso concreto.
- No se han publicado evaluaciones de sesgos o toxicidad para este modelo; se recomienda auditar antes de desplegarlo en entornos de producción con usuarios finales.
- La conversión GGUF no incluye el tokenizador original en formato safetensors; es necesario utilizar el tokenizador del modelo base, que se distribuye por separado.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/WoofyLemo/VoxSRT-kanana-1.5-8b-instruct-2505-q4-k-m
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Conversión GGUF alternativa: https://huggingface.co/parkjw/kanana-1.5-8b-instruct-2505-Q4_K_M-GGUF
- Repositorio GitHub de Kanana: https://github.com/kakao/kanana
- Paper de Kanana (arXiv): https://arxiv.org/html/2502.18934v1
