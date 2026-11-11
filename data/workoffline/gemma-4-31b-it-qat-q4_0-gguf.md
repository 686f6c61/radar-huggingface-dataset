# WorkOffline/gemma-4-31B-it-qat-q4_0-GGUF

## Resumen

`WorkOffline/gemma-4-31B-it-qat-q4_0-GGUF` es un espejo (mirror) sin modificaciones de los ficheros GGUF cuantizados en 4 bits con QAT (Quantization-Aware Training) del modelo Gemma 4 31B Instruct, desarrollado originalmente por Google DeepMind. El repositorio no introduce ningún cambio en los pesos ni en la tokenización: únicamente replica los binarios publicados por Google en `google/gemma-4-31B-it-qat-q4_0-gguf`, fijados a una revisión concreta y verificables mediante SHA-256. Su propósito es servir de origen único de descarga para la aplicación WorkOffline.

El modelo subyacente es un transformer de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) en su variante instruct, con capacidades multimodales (el repositorio incluye un fichero `mmproj` para proyección de visión). La cuantización Q4_0 con entrenamiento consciente de cuantización permite reducir el peso del fichero principal a unos 17,65 GB, lo que lo hace desplegable en configuraciones de hardware más modestas que el modelo en precisión completa.

Es relevante ahora porque ofrece un punto de descarga estable y verificado para un modelo de ~31B con licencia Apache 2.0, orientado a inferencia local mediante llama.cpp y compatible con endpoints. Al ser un espejo pasivo, toda la documentación técnica, benchmarks y limitaciones deben consultarse en las fuentes originales de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); no se detalla en la informacion disponible |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (QAT, 4 bits); fichero principal GGUF |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero principal + `mmproj` para vision) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma 4 31B Instruct: no se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones, ni se documenta la composición del dataset de entrenamiento, el número de tokens o las fases de RLHF/DPO. Lo único confirmado es que se trata de un transformer de ~30,7B parámetros en variante instruct y con soporte multimodal (presencia de fichero `mmproj`).

La característica técnica destacable de esta distribución es la cuantización QAT (Quantization-Aware Training) en Q4_0: el modelo fue entrenado teniendo en cuenta la cuantización a 4 bits, de modo que la pérdida de calidad respecto al modelo en precisión completa es menor que en una cuantización post-entrenamiento equivalente. El fichero principal ocupa 17.651.001.568 bytes (unos 17,65 GB) y el proyector multimodal `mmproj-gemma-4-31B-it-qat.gguf` ocupa 1.200.726.368 bytes (unos 1,2 GB).

## Capacidades

- Generación de texto conversacional en modo instruct (etiqueta `conversational`).
- Capacidades multimodales (visión) mediante el fichero `mmproj` incluido en el repositorio.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Razonamiento, código y matemáticas: no confirmado explícitamente en la informacion disponible, aunque es esperable en un modelo instruct de esta familia; debe verificarse en la model card original.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está cumplimentado).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local de un asistente conversacional de ~31B: el fichero GGUF Q4_0 de 17,65 GB puede cargarse con llama.cpp en equipos con suficiente memoria unificada o VRAM, permitiendo conversaciones multi-turno sin conexión a servicios en la nube.
- Aplicaciones de escritorio offline: el repositorio existe precisamente para que la app WorkOffline descargue los pesos desde un origen único, fijado a una revisión y verificado por SHA-256, lo que simplifica la distribución y garantiza integridad de los binarios.
- Procesamiento de documentos con imágenes: gracias al proyector multimodal `mmproj`, puede emplearse para tareas de comprensión de imagen y texto combinados (por ejemplo, extracción de información de capturas o formularios escaneados), siempre que se confirmen las capacidades de visión en la documentación original.
- Prototipado e investigación en entornos sin GPU de gran capacidad: la cuantización QAT Q4_0 reduce los requisitos de memoria frente al modelo en precisión completa, facilitando experimentación académica en hardware de gama alta de consumo.
- Integración en pipelines con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere su uso detrás de servidores de inferencia que expongan una API compatible, útil para pruebas de integración en aplicaciones existentes.
- Evaluación comparativa de cuantizaciones: al ser un espejo verificable del QAT oficial, sirve como referencia reproducible para medir la degradación de calidad de Q4_0 frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el fichero principal pesa 17,65 GB y el proyector multimodal 1,2 GB; se necesita al menos esa cantidad de memoria (VRAM o memoria unificada) más el espacio para el contexto KV, por lo que en la práctica conviene disponer de 20-24 GB o más.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamaño, encaja en GPUs con 24 GB o más (por ejemplo, RTX 3090/4090, A100, H100), aunque esta recomendación es una estimación basada en el tamaño del fichero, no un dato del autor.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM si se limita el contexto; en GPUs con menos memoria requeriría descarga parcial a CPU (offloading).
- Opciones de despliegue: llama.cpp y derivados (Ollama, servidores compatibles con GGUF); el formato GGUF no es compatible directamente con vLLM o TGI sin conversión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WorkOffline/gemma-4-31B-it-qat-q4_0-GGUF (este) | ~30,7B | no disponible | Apache 2.0 | GGUF Q4_0 (QAT) + mmproj | Espejo verificado del QAT oficial de Google |
| google/gemma-4-31B-it | ~30,7B | no disponible | Apache 2.0 | safetensors (precisión completa) | Modelo original; mayor requisito de memoria |
| google/gemma-4-31B-it-qat-q4_0-gguf | ~30,7B | no disponible | Apache 2.0 | GGUF Q4_0 (QAT) | Fuente upstream de los binarios de este repositorio |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo pasivo: no aporta documentación técnica propia ni garantías adicionales sobre el comportamiento del modelo; cualquier dato debe contrastarse con la model card de Google.
- Sesgos conocidos: no documentados en la informacion disponible; deben consultarse en las fuentes originales de Gemma 4.
- Riesgo de alucinación: inherente a los modelos generativos; no cuantificado en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están indicados en este repositorio.
- Licencia: Apache 2.0 según la model card upstream, que no incluye fichero de licencia propio; el repositorio incluye el texto estándar de Apache 2.0. Conviene verificar los términos en la página oficial de licencia de Gemma 4 antes de uso comercial.
- La cuantización Q4_0, aunque sea QAT, introduce cierta degradación respecto al modelo en precisión completa; no se han publicado métricas de esa pérdida en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario que valide la distribución.
- Para producción con servidores de alto rendimiento (vLLM, TGI) sería necesario convertir el GGUF o usar los pesos safetensors originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WorkOffline/gemma-4-31B-it-qat-q4_0-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- GGUF oficial de Google: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
