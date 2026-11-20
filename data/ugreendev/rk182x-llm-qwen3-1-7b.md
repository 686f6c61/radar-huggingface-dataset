# UGREENDEV/RK182X-LLM-Qwen3-1.7B

## Resumen

RK182X-LLM-Qwen3-1.7B es una conversión al formato RKNN del modelo Qwen3-1.7B de Alibaba Qwen, publicada por el usuario UGREENDEV. No se trata de un modelo entrenado desde cero, sino de una compilación optimizada para ejecutarse sobre la NPU del chip Rockchip RK1828, con cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) y soporte para 8 núcleos NPU. El objetivo es habilitar inferencia de un LLM de 1.700 millones de parámetros en hardware embebido de bajo consumo, algo relevante para despliegues en el borde (edge computing) donde no se dispone de GPU dedicada.

El repositorio ofrece dos configuraciones según la longitud de contexto y el formato de la caché KV: una de 32.256 tokens (31,5k) con KVCache en fp16 y otra de 70.656 tokens (69k) con KVCache en int4. Ambas requieren la versión de runtime RKNN v1.1.0 y están etiquetadas para el chip RK1828. El tamaño total del repositorio es de 1,8 GB, coherente con la cuantización de 4 bits aplicada a un modelo de 1,7B de parámetros.

La relevancia de esta ficha radica en que documenta un caso de portabilidad de un LLM moderno a un acelerador NPU específico, con decisiones de compromiso entre contexto, precisión de la caché y memoria disponible. Es una pieza útil para quienes evalúan inferencia local en dispositivos Rockchip, aunque su ecosistema y herramientas difieren sustancialmente de los stacks habituales basados en CUDA o CPU (llama.cpp, vLLM, TGI).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); empaquetada en formato RKNN para NPU Rockchip |
| Parametros totales | 1,7 mil millones (modelo base Qwen/Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.256 tokens (config. KVCache fp16) o 70.656 tokens (config. KVCache int4) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache fp16 o int4 según configuración |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (archivos de configuración por directorio); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card original de Qwen y no se reproducen aquí. Lo que sí documenta esta ficha es el proceso de conversión: el modelo se compila con RKNN Toolkit a un grafo optimizado para la NPU RK1828, con cuantización w4a16 y dos variantes de gestión de la caché KV.

La innovación técnica destacable no está en el entrenamiento sino en el despliegue: la configuración de 69k tokens emplea una KVCache en int4 para cuadruplicar aproximadamente el contexto respecto a la variante fp16 (32k), a costa de una posible degradación en la fidelidad de la atención. El runtime RKNN v1.1.0 y el driver correspondiente son requisitos estrictos; la model card insiste en verificar la versión del dispositivo con `rknn-smi -v` antes de ejecutar y en usar conjuntamente los archivos de un mismo directorio de configuración.

## Capacidades

- Generación de texto conversacional, heredada de Qwen3-1.7B; la etiqueta `conversational` del repo así lo indica.
- Razonamiento y respuesta a instrucciones propias de la familia Qwen3 (no se detallan modos thinking explícitos en la información disponible).
- Soporte de contexto largo: hasta 31,5k tokens en la configuración fp16 y hasta 69k en la configuración int4.
- Ejecución en NPU Rockchip RK1828 con 8 núcleos, lo que permite inferencia local sin GPU.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), orientada a servir el modelo mediante una API.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y visión: no disponibles en la información proporcionada para esta conversión concreta.

## Casos de uso

- Asistentes conversacionales en dispositivos embebidos: el modelo puede gestionar diálogos multi-turno en hardware Rockchip RK1828 sin GPU, gracias a su tamaño de 1,7B y a la cuantización w4a16 que reduce la huella de memoria.
- Procesamiento de documentos largos en el borde: con la configuración de 69k tokens y KVCache int4, es posible resumir o extraer información de contratos, informes o transcripciones que no cabrían en ventanas de 4k-8k típicas de modelos pequeños.
- Automatización de atención al cliente en kioscos o terminales: al ser compatible con endpoints, se puede exponer como servicio local en un dispositivo con NPU y mantener conversaciones con contexto amplio.
- Clasificación y extracción de entidades en pipelines de datos locales: el modelo puede etiquetar texto o extraer campos estructurados en entornos sin conectividad, usando la variante de 32k para lotes de documentos medianos.
- Generación de borradores y asistencia de redacción en herramientas de escritorio: integrado en una aplicación nativa sobre RK1828, permite sugerencias de texto sin enviar datos a la nube.
- Prototipado de agentes de razonamiento de un solo paso: aunque no se documenta tool calling, el modelo puede encadenarse manualmente en scripts para tareas de razonamiento secuencial con contexto largo.
- Evaluación de portabilidad de LLM a NPU: sirve como referencia para medir latencia y consumo de Qwen3-1.7B en RK1828 antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828 (etiqueta `rk182x`); no se soportan otras plataformas según la model card.
- Runtime: RKNN Runtime v1.1.0 y driver compatible; verificar con `rknn-smi -v` en el dispositivo.
- Memoria: el repositorio ocupa 1,8 GB; la configuración de 69k tokens con KVCache int4 requiere más memoria de trabajo que la de 32k con fp16, aunque el peso en disco sea similar.
- GPU: no aplica; el modelo está compilado para NPU, no para CUDA. No cabe en GPU consumer porque no se distribuyen pesos en formatos estándar (safetensors/GGUF) en este repositorio.
- Opciones de despliegue: RKNN Runtime sobre RK1828; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen3-1.7B (este) | 1,7B | 32k (fp16 KV) / 69k (int4 KV) | RKNN para NPU RK1828 | Apache 2.0 + términos RKNN | Hugging Face y ModelScope |
| Qwen/Qwen3-1.7B (original) | 1,7B | no disponible en la información | safetensors, ejecutable en GPU/CPU | Apache 2.0 | Hugging Face |
| Conversiones GGUF de Qwen3-1.7B | 1,7B | depende de la implementación | GGUF para llama.cpp/Ollama | Apache 2.0 | Hugging Face |

La comparación con el modelo original es la más directa: misma arquitectura y parámetros, pero distinto backend de ejecución. Las conversiones GGUF ofrecen portabilidad a CPU y GPU consumer, mientras que esta versión queda restringida a la NPU RK1828. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en el chip RK1828; no es portable a GPU, CPU genérica ni otros aceleradores sin reconversión.
- Requisito estricto de runtime: debe usarse RKNN Runtime v1.1.0 y el driver correspondiente; una versión distinta puede provocar fallos de ejecución.
- Mezcla de archivos: la model card advierte de usar conjuntamente los archivos de un mismo directorio de configuración; mezclar configuraciones puede romper la inferencia.
- Contexto y precisión: la configuración de 69k tokens usa KVCache int4, lo que puede degradar la calidad de la atención en comparación con fp16; conviene validar en la tarea concreta.
- Idiomas: no se especifican en la información disponible; no se debe asumir cobertura multilingüe sin verificación.
- Sesgos y alucinaciones: no se documentan sesgos específicos en esta conversión; al heredar el comportamiento de Qwen3-1.7B, persisten los riesgos habituales de alucinación de modelos de este tamaño.
- Licencia: Apache 2.0 para el modelo base, pero se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime, que pueden imponer condiciones adicionales al uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-Qwen3-1.7B --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-LLM-Qwen3-1.7B --revision v1.1.0`
- Documentación de configuración incluida en el repo: `Qwen3-1.7B-w4a16-8-32256/README.md` y `Qwen3-1.7B-w4a16-8-70656-kv-int4/README.md`
