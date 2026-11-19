# UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-0.6B

## Resumen

RK182X-EMBEDDING-Qwen3-Embedding-0.6B es una conversión al formato RKNN del modelo de embeddings Qwen/Qwen3-Embedding-0.6B, publicada por el usuario UGREENDEV. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del modelo original de Alibaba Qwen para su ejecución sobre las NPU Rockchip RK1820 y RK1828, con el runtime RKNN v1.1.0. El resultado es un artefacto de 0,6 GB orientado a la extracción de características (feature-extraction) en dispositivos embebidos.

El modelo hereda la arquitectura del transformer de Qwen3-Embedding-0.6B, con 0,6 mil millones de parámetros, y se distribuye con cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) repartida en 8 núcleos NPU. La longitud máxima de texto que procesa en esta configuración es de 2048 tokens, un límite impuesto por la compilación específica para el acelerador.

Su relevancia es acotada pero concreta: permite desplegar búsqueda semántica, clustering y recuperación aumentada (RAG) sobre hardware Rockchip de bajo consumo sin depender de GPU. La licencia Apache 2.0 del modelo base facilita su integración comercial, si bien el uso queda condicionado también por los términos de RKNN Toolkit y RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-Embedding-0.6B), compilada a RKNN |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo configurado en esta compilación) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio con checksums SHA-256 |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-Embedding-0.6B, un transformer encoder de 0,6 mil millones de parámetros especializado en generar representaciones vectoriales densas para tareas de recuperación y similitud semántica. Esta publicación no incluye información sobre el corpus de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de ajuste como RLHF o DPO; esos datos corresponden a la model card del modelo original, que no se ha proporcionado.

La innovación técnica de esta ficha no reside en el entrenamiento, sino en el pipeline de despliegue: el modelo se ha cuantizado a w4a16 y compilado con RKNN Toolkit para ejecutarse sobre 8 núcleos NPU de los chips RK1820 y RK1828. La configuración `Qwen3-Embedding-0.6B-w4a16-8-2048` fija el límite de 2048 tokens y requiere el runtime RKNN v1.1.0 y su driver correspondiente. El repositorio incluye `config.json` con el manifiesto de ficheros y `SHA256SUMS` para verificar la integridad antes del despliegue.

## Capacidades

- Generación de embeddings de texto para similitud semántica, búsqueda y recuperación.
- Extracción de características (pipeline `feature-extraction`).
- Procesamiento de secuencias de hasta 2048 tokens.
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento; el modelo es exclusivamente de embeddings.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Búsqueda semántica en dispositivos embebidos: el modelo genera vectores de hasta 2048 tokens de contexto, suficiente para indexar fragmentos de documentación o FAQs y resolver consultas por similitud coseno sobre la NPU del dispositivo.
- RAG en el borde (edge RAG): integrado en un pipeline de recuperación, permite seleccionar los pasajes relevantes de una base local antes de pasarlos a un LLM generador, reduciendo el tráfico de red y la dependencia de la nube.
- Deduplicación y clustering de documentos: al producir embeddings densos, se pueden agrupar noticias, tickets o registros con un algoritmo de clustering sobre las representaciones, ejecutado en el propio hardware Rockchip.
- Clasificación de texto por similitud: comparar la representación de una entrada con prototipos de cada clase permite construir clasificadores de pocas muestras sin reentrenamiento, útil en moderación de contenido o etiquetado de soporte.
- Motor de recomendación ligero: calcular la similitud entre el perfil del usuario y el catálogo de ítems en tiempo real sobre el dispositivo, sin enviar datos personales a servidores externos.
- Filtrado previo en pipelines de datos: puntuar la relevancia de grandes lotes de textos antes de un procesamiento más costoso, aprovechando el bajo consumo de la NPU para reducir el volumen que llega a etapas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 exclusivamente.
- Runtime: RKNN Runtime v1.1.0 con el driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v`.
- NPU: configuración compilada para 8 núcleos NPU.
- Tamaño del repositorio: 0,6 GB, coherente con la cuantización w4a16 del modelo de 0,6 mil millones de parámetros.
- VRAM/RAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no aplica; el artefacto está compilado para NPU Rockchip, no para CUDA.
- Despliegue: mediante RKNN Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-EMBEDDING-Qwen3-Embedding-0.6B (esta ficha) | 0,6 B | 2048 tokens | RKNN, NPU RK1820/RK1828 | Apache 2.0 (+ términos RKNN) | Hugging Face y ModelScope |
| Qwen/Qwen3-Embedding-0.6B (modelo base) | 0,6 B | no disponible en esta información | safetensors, GPU/CPU | Apache 2.0 | Hugging Face |
| Otras alternativas de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base: esta publicación no añade capacidades nuevas, sino que adapta el modelo a un acelerador específico a cambio de reducir la precisión de pesos a 4 bits y limitar el contexto a 2048 tokens. No se dispone de datos de rendimiento para comparar la calidad de los embeddings tras la cuantización.

## Limitaciones y advertencias

- Solo funciona en los chips RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a GPU, CPU convencional ni a otros aceleradores sin reconversión.
- El contexto está limitado a 2048 tokens; textos más largos deben fragmentarse, lo que puede degradar la calidad de la representación en documentos extensos.
- La cuantización w4a16 puede introducir una pérdida de precisión en los embeddings respecto al modelo original en fp16/bf16; no se han publicado evaluaciones que cuantifiquen esta degradación.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de embeddings, el riesgo principal es la recuperación de pasajes irrelevantes, no la generación de texto falso.
- Idiomas soportados no disponibles en la información proporcionada; conviene validar el comportamiento multilingüe antes de usarlo en producción.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero se aplican adicionalmente los términos de licencia de RKNN Toolkit y RKNN Runtime, que deben revisarse.
- Es imprescindible verificar los checksums con `sha256sum -c SHA256SUMS` y desplegar únicamente los ficheros de un mismo directorio de configuración.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de su funcionamiento en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-0.6B --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-EMBEDDING-Qwen3-Embedding-0.6B --revision v1.1.0`
- Documentación de la configuración: `Qwen3-Embedding-0.6B-w4a16-8-2048/README.md` (dentro del repositorio)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
