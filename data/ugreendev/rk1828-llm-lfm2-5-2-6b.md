# UGREENDEV/RK1828-LLM-LFM2.5-2.6B

## Resumen

RK1828-LLM-LFM2.5-2.6B es una conversión al formato RKNN del modelo LiquidAI/LFM2.5-2.6B, publicada por el usuario UGREENDEV. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue empaquetado específicamente para el acelerador NPU Rockchip RK1828, con cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) y una longitud de contexto declarada de 122.880 tokens (120k). El repositorio ocupa 2,2 GB e incluye los pesos en formato RKNN junto con los ficheros de configuración, sumas de verificación SHA-256 y la licencia heredada del modelo base.

La relevancia de esta ficha es acotada y muy específica: no sirve para inferencia en GPU convencional ni para despliegues en la nube con vLLM o TGI, sino para ejecutar un LLM de 2.600 millones de parámetros en hardware edge basado en el chip RK1828. Esto lo sitúa en el nicho de la IA embebida, donde el objetivo es disponer de generación de texto conversacional con contexto largo en dispositivos de bajo consumo. El modelo base, LFM2.5-2.6B de Liquid AI, aporta la arquitectura y el conocimiento lingüístico; esta publicación aporta únicamente el binario compilado y su envoltorio de despliegue.

Es importante subrayar que la información pública disponible sobre esta conversión es mínima: la model card se limita a describir el proceso de descarga, verificación de checksums y requisitos de runtime. No hay datos sobre idiomas soportados, benchmarks, composición del dataset de entrenamiento ni detalles de la arquitectura más allá de lo que se deduce del modelo base. Todo lo que no consta explícitamente se marca como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM2.5-2.6B; detalles específicos no disponibles en la información proporcionada) |
| Parametros totales | 2.600 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 122.880 tokens (120k), según la configuración w4a16-8-122880 |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (se remite a la licencia del modelo base y a los términos de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF en este repositorio |
| Núcleos NPU | 8 |
| Chip soportado | RK1828 (exclusivamente) |
| Versión de runtime RKNN | v1.1.0 |
| Tamaño del repositorio | 2,2 GB |
| Directorio de configuración | LFM2.5-2.6B-w4a16-8-122880 |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión de LiquidAI/LFM2.5-2.6B al formato RKNN mediante el toolkit de Rockchip, empaquetada para el chip RK1828. Por tanto, la arquitectura subyacente es la del modelo base de Liquid AI, un transformer de 2.600 millones de parámetros, pero la información proporcionada no detalla la composición de capas, el mecanismo de atención ni si incorpora innovaciones propias de la familia LFM (como capas convolucionales o de estado). Cualquier afirmación más concreta sobre la arquitectura interna requeriría consultar la model card del modelo base, que no forma parte de los datos disponibles aquí.

En cuanto al entrenamiento, no se dispone de información sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación. Lo único verificable es el proceso de conversión: cuantización w4a16 sobre 8 núcleos NPU, KVCache en fp16 y una ventana de contexto configurada en 122.880 tokens. La innovación técnica destacable de esta publicación es, por tanto, de naturaleza de despliegue: conseguir que un modelo de 2,6B con contexto de 120k quepa en un acelerador edge con cuantización de 4 bits, algo que en GPU requeriría varios gigabytes solo para el KVCache en fp16.

## Capacidades

- Generación de texto conversacional, heredada del modelo base LFM2.5-2.6B; la model card etiqueta el pipeline como text-generation y el repositorio como conversational.
- Contexto largo de hasta 122.880 tokens, adecuado para conversaciones multi-turno extensas o documentos largos en el dispositivo.
- Ejecución en NPU RK1828 con 8 núcleos, pensada para inferencia local en hardware edge.
- Compatibilidad declarada con endpoints (tag endpoints_compatible), lo que sugiere integración con APIs de servicio compatibles.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara lista de idiomas.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: el modelo puede mantener diálogos multi-turno en local gracias a su ventana de 120k tokens, sin enviar datos a la nube, lo que encaja en productos con requisitos de privacidad y con el hardware RK1828 como plataforma objetivo.
- Procesamiento de documentos largos en el dispositivo: con 122.880 tokens de contexto, es viable resumir o extraer información de manuales, contratos o informes extensos directamente en un equipo embebido.
- Transcripción y análisis de reuniones: combinado con un motor de ASR local, el modelo puede resumir actas y extraer acciones a partir de transcripciones largas dentro de la ventana de contexto.
- Automatización industrial y kioscos interactivos: el despliegue sobre NPU RK1828 permite integrar generación de texto en terminales de atención al público, paneles de control o equipos de campo con conectividad limitada.
- Prototipado de productos de IA embebida: el repositorio incluye checksums SHA-256 y una configuración cerrada (w4a16, 8 núcleos, contexto fijo), lo que facilita validar la viabilidad de un LLM en el chip antes de comprometer un diseño de producto.
- Evaluación comparativa de hardware edge: sirve como referencia para medir latencia, consumo y calidad de un modelo de 2,6B cuantizado a 4 bits en RK1828 frente a alternativas en otras NPU o en CPU.
- Filtrado y clasificación de texto en local: para moderación de contenido o enrutamiento de consultas en dispositivos sin conexión, siempre que se valide previamente la calidad del modelo base en la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chip objetivo: Rockchip RK1828 exclusivamente; no se soportan otras NPU ni GPU convencionales con estos pesos.
- Runtime: RKNN Runtime v1.1.0 con el driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: el repositorio ocupa 2,2 GB; el consumo en inferencia depende del runtime y del KVCache en fp16 para una ventana de hasta 122.880 tokens, que puede ser considerable y debe validarse en el dispositivo.
- Núcleos NPU: configuración preparada para 8 núcleos.
- Despliegue: exclusivamente mediante RKNN Runtime; no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI con estos ficheros.
- VRAM en GPU: no aplica, al ser un artefacto para NPU; no se proporcionan estimaciones de latencia ni throughput.
- Verificación previa: ejecutar `sha256sum -c SHA256SUMS` en el directorio de configuración y desplegar solo si todas las entradas muestran `OK`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK1828-LLM-LFM2.5-2.6B (este) | 2,6B | 122.880 tokens | RKNN, NPU RK1828 | other | Hugging Face y ModelScope |
| LiquidAI/LFM2.5-2.6B (modelo base) | 2,6B | no disponible en la información proporcionada | safetensors (presumiblemente, según el modelo base) | no disponible en la información proporcionada | Hugging Face |
| Otras conversiones RKNN para RK1828 | no disponible | no disponible | RKNN | no disponible | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Dependencia total del hardware: los pesos solo funcionan en el chip RK1828 con RKNN Runtime v1.1.0 y el driver correspondiente; no son portables a GPU, CPU u otras NPU.
- Licencia "other": se remite a la licencia del modelo base y a los términos de RKNN Toolkit y RKNN Runtime; es imprescindible revisar ambos documentos antes de cualquier uso comercial.
- Idiomas no declarados: la model card no especifica qué idiomas soporta el modelo, lo que impide garantizar calidad en castellano sin una evaluación previa.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas, ni datos de latencia o throughput en el dispositivo.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 2,6B parámetros; en producción conviene añadir verificación y límites de dominio.
- Contexto largo con coste de memoria: el KVCache en fp16 para 122.880 tokens puede consumir una cantidad significativa de memoria en el dispositivo; debe validarse empíricamente.
- Artefacto de conversión, no modelo original: la calidad final depende de la cuantización w4a16; pueden aparecer degradaciones frente al modelo base en tareas sensibles a la precisión.
- Repositorio sin tracción pública: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-19): conviene tratar las marcas temporales con cautela y verificar la integridad mediante los checksums SHA-256 incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UGREENDEV/RK1828-LLM-LFM2.5-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-LLM-LFM2.5-2.6B --revision master --local_dir ./RK1828-LLM-LFM2.5-2.6B`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK1828-LLM-LFM2.5-2.6B --revision v1.1.0 --local-dir ./RK1828-LLM-LFM2.5-2.6B`
- Documentación de la configuración: `LFM2.5-2.6B-w4a16-8-122880/README.md` (inglés) y `README_CN.md` (chino) dentro del repositorio
- Papers, blogs o demos adicionales: no disponible en la información proporcionada
