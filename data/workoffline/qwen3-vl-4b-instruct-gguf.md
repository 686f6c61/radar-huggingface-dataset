# WorkOffline/Qwen3-VL-4B-Instruct-GGUF

## Resumen

Qwen3-VL-4B-Instruct-GGUF es un espejo no modificado de los ficheros GGUF del modelo Qwen3-VL-4B-Instruct, publicado por el usuario WorkOffline para que su aplicación WorkOffline pueda descargar los pesos desde un único punto, fijados a una revisión exacta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de una conversión propia: los bytes son idénticos a los del repositorio oficial Qwen/Qwen3-VL-4B-Instruct-GGUF, y todo el crédito del modelo corresponde a Alibaba Qwen.

El modelo subyacente es un transformer multimodal (visión y lenguaje) de 4.022.468.096 parámetros, orientado a instrucciones y con licencia Apache 2.0. El repositorio incluye una cuantización Q4_K_M del modelo principal (2.497.281.664 bytes) y un proyector multimodal en F16 (836.180.256 bytes) necesario para procesar imágenes.

Su relevancia es fundamentalmente práctica: al estar empaquetado en GGUF, permite ejecutar un modelo visión-lenguaje de 4B en hardware de consumo mediante llama.cpp y derivados, con la ventaja añadida de una verificación criptográfica de integridad de los ficheros. La información disponible sobre el modelo original es escasa en esta ficha; los datos de arquitectura detallada, contexto o entrenamiento no se detallan en la model card del espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje); detalles no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal); F16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct es un transformer multimodal desarrollado por Alibaba Qwen, capacitado para procesar entradas de imagen y texto. El repositorio espejo no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF/DPO) empleadas.

La aportación técnica de este repositorio es el empaquetado en GGUF: una cuantización Q4_K_M del modelo principal más un proyector multimodal separado en F16 (`mmproj-Qwen3-VL-4B-Instruct-F16.gguf`). Ambos ficheros se copian de la revisión `1cd86afb9a95c410a6038ab3b40d8b578c892266` del repositorio oficial y se publican con sus hashes SHA-256 para verificación de integridad. No se han realizado modificaciones sobre los bytes originales.

## Capacidades

- Generación de texto conversacional con formato de instrucciones (tag `conversational`).
- Procesamiento de imágenes: el repositorio incluye el proyector multimodal (mmproj) necesario para tareas de visión-lenguaje.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia compatible.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponibles en la información proporcionada.
- Capacidades multilingües específicas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo visión-lenguaje: gracias al formato GGUF y a la cuantización Q4_K_M (aproximadamente 2,5 GB), puede ejecutarse en equipos de consumo mediante llama.cpp para tareas de descripción de imágenes o respuesta a preguntas sobre documentos escaneados.
- Distribución reproducible en aplicaciones de escritorio: el pinning a una revisión exacta y la verificación SHA-256 permiten que una aplicación cliente (como WorkOffline) descargue pesos íntegros y detecte corrupciones o manipulaciones.
- Procesamiento de documentos con OCR asistido: combinando el modelo principal con el proyector multimodal F16, se puede extraer información estructurada de capturas, formularios o facturas en local, sin enviar datos a servicios externos.
- Asistente conversacional offline: el tag `conversational` y el tamaño de 4B lo hacen adecuado para chatbots locales con requisitos moderados de hardware.
- Prototipado de pipelines multimodales: al ser un espejo fiable y verificado, sirve como base estable para experimentar con integración de visión y lenguaje en entornos de desarrollo.
- Inferencia en entornos con conectividad limitada o requisitos de privacidad: al poder ejecutarse íntegramente en local, encaja en escenarios donde no se permite el envío de imágenes o texto a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el modelo principal en Q4_K_M: aproximadamente 2,5 GB de pesos, más overhead de contexto y del runtime (estimación típica de 3,5-4,5 GB en total).
- El proyector multimodal F16 añade unos 0,84 GB adicionales cuando se procesan imágenes.
- Cabe en GPU de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070); también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- GPU profesionales (A100, H100) no son necesarias para este tamaño; su uso aportaría principalmente mayor throughput en despliegues concurrentes.
- Opciones de despliegue: llama.cpp y frontends compatibles con GGUF (Ollama, LM Studio, llama-cpp-python); el tag `endpoints_compatible` sugiere compatibilidad con servidores de inferencia estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (este espejo) | 4,02B | no disponible | Sí (visión) | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-VL-3B-Instruct | ~3B | no disponible | Sí (visión) | Apache 2.0 | safetensors, GGUF (comunidad) |
| Llama 3.2 3B Instruct | 3,2B | 128K | No | Llama 3.2 Community License | GGUF, safetensors |
| Gemma 3 4B | ~4B | no disponible | Sí (visión) | Gemma Terms of Use | GGUF, safetensors |

Nota: los datos de los modelos comparados son aproximados y deben verificarse en sus repositorios oficiales; la información disponible en esta ficha no permite una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial de un tercero (WorkOffline); no debe considerarse la fuente canónica del modelo. Para producción, es preferible referenciar el repositorio oficial de Qwen.
- No se dispone de información sobre sesgos del modelo base en la documentación proporcionada.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B; no se han publicado evaluaciones específicas en esta ficha.
- El modelo card del espejo no documenta la longitud de contexto ni los idiomas soportados; conviene consultar la documentación oficial de Qwen3-VL antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero el espejo no incluye un fichero LICENSE propio más allá del texto estándar de Apache 2.0; la licencia aplicable es la del modelo original.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a los pesos originales en safetensors; para tareas sensibles a la calidad, considerar cuantizaciones mayores o el modelo base.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción nula y ausencia de validación comunitaria.

## Enlaces

- Repositorio espejo: https://huggingface.co/WorkOffline/Qwen3-VL-4B-Instruct-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
