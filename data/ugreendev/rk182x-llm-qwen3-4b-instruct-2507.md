# UGREENDEV/RK182X-LLM-Qwen3-4B-Instruct-2507

## Resumen

RK182X-LLM-Qwen3-4B-Instruct-2507 es una conversión al formato RKNN del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del modelo instruct de Qwen de 4.000 millones de parámetros, orientada a despliegue en hardware embebido de bajo consumo. El repositorio incluye dos configuraciones precompiladas que difieren en la longitud de contexto y en el formato del KVCache.

La relevancia de esta ficha es acotada pero concreta: permite ejecutar un LLM de 4B en una NPU integrada, algo que hasta hace poco requería GPU dedicada o cuantizaciones GGUF sobre CPU. El modelo hereda las capacidades del Qwen3-4B-Instruct-2507 original (generación de texto, razonamiento, código e instrucciones multilingües), pero queda restringido al runtime RKNN v1.1.0 y al chip RK1828, lo que limita su portabilidad frente a otras distribuciones del mismo modelo base.

El repositorio ocupa 3,3 GB e incluye checksums SHA-256 para verificación de integridad. La licencia declarada es Apache 2.0, heredada del modelo base, aunque se aplican adicionalmente los términos del RKNN Toolkit y del RKNN Runtime de Rockchip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); empaquetado en formato RKNN para NPU |
| Parametros totales | 4.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.896 tokens (config. w4a16-8-16896) o 39.424 tokens (config. w4a16-8-39424-kv-int4) |
| Tipos de cuantizacion | w4a16 (pesos 4 bits, activaciones 16 bits); KVCache en fp16 o int4 según configuración |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos del RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (compilado para NPU RK1828); no se distribuyen safetensors ni GGUF |
| Runtime | RKNN Runtime v1.1.0 |
| Chips soportados | RK1828 |
| Nucleos NPU | 8 |
| Tamano del repositorio | 3,3 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros desarrollado por Alibaba Qwen. La variante Instruct-2507 corresponde a un ajuste fino supervisado y posterior alineación por preferencias sobre el modelo base Qwen3, orientado a seguir instrucciones y a mantener conversaciones multi-turno. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la metodología exacta de RLHF o DPO aplicada.

La contribución específica de este repositorio es la conversión a RKNN: los pesos se cuantizan a 4 bits (w4a16), se compilan para la NPU RK1828 con 8 núcleos y se empaquetan en dos configuraciones. La primera mantiene un KVCache en fp16 con 16.896 tokens de contexto; la segunda emplea KVCache int4 y extiende el contexto hasta 39.424 tokens a costa de una mayor compresión de la caché. Ambas requieren RKNN Runtime v1.1.0 y el driver correspondiente, verificable con `rknn-smi -v`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instruct de Qwen3-4B-Instruct-2507.
- Seguimiento de instrucciones y respuesta a prompts en formato chat.
- Razonamiento y resolución de problemas de complejidad media, limitado por el tamaño de 4B parámetros.
- Generación de código y explicaciones técnicas, según las capacidades del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del modelo base.
- Soporte de tool calling / function calling: no documentado en la información proporcionada para esta conversión RKNN.
- Soporte de agentes y multi-step reasoning: no documentado específicamente para esta conversión.
- Ejecución en NPU RK1828 con 8 núcleos, sin GPU dedicada.

## Casos de uso

- Asistentes embebidos en dispositivos de borde: el modelo puede ejecutarse íntegramente en la NPU RK1828 de un dispositivo con ese SoC, ofreciendo generación de texto local sin dependencia de la nube y con contextos de hasta 16,5k tokens en la configuración fp16.
- Procesamiento de documentos largos en el dispositivo: la configuración con KVCache int4 y 38,5k tokens permite resumir o extraer información de contratos, manuales o informes sin truncar el contexto, algo útil en escenarios de cumplimiento donde los datos no deben salir del equipo.
- Atención al cliente en kioscos o terminales de punto de venta: conversaciones multi-turno con contexto suficiente para mantener el hilo de una sesión de soporte, ejecutadas localmente para reducir latencia y coste de API.
- Generación de código asistida en entornos de desarrollo con hardware restringido: el modelo puede integrarse en herramientas locales de autocompletado o explicación de fragmentos, siempre que el host disponga de una NPU RK1828.
- Traducción y reescritura de textos en aplicaciones de productividad: gracias al contexto extendido de la variante int4, se pueden procesar capítulos o secciones completas en una sola pasada.
- Clasificación y extracción de entidades en pipelines de datos: el modelo puede etiquetar o estructurar texto no estructurado en el propio dispositivo, reduciendo el envío de datos a servicios externos.
- Prototipado de agentes conversacionales en robótica o domótica: al ejecutarse sobre una NPU de bajo consumo, es viable integrarlo en dispositivos con restricciones térmicas y energéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de latencia o throughput para esta conversión RKNN.

## Requisitos de hardware

- NPU: Rockchip RK1828 exclusivamente, con 8 núcleos. No es ejecutable en GPU convencional ni en CPU mediante este repositorio.
- Runtime: RKNN Runtime v1.1.0 y driver compatible; verificar la versión en el dispositivo con `rknn-smi -v` antes de desplegar.
- VRAM/RAM: no disponible en la información proporcionada; depende de la configuración de KVCache y del subsistema de memoria del SoC RK1828.
- GPU de consumo: no aplica; el modelo está compilado para NPU Rockchip y no se distribuye en formatos GGUF, safetensors ni ONNX que permitan su ejecución en RTX 4090, A100 o H100.
- Opciones de despliegue: RKNN Runtime sobre RK1828. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen3-4B-Instruct-2507 (este) | 4B | 16.896 / 39.424 tokens | RKNN | Apache 2.0 + términos RKNN | NPU RK1828 |
| Qwen/Qwen3-4B-Instruct-2507 (original) | 4B | no disponible en esta ficha | safetensors | Apache 2.0 | GPU / CPU |
| Otras distribuciones GGUF del mismo base (p. ej. Qwen3-4B-Instruct-2507-GGUF) | 4B | según cuantización | GGUF | Apache 2.0 | CPU / GPU consumer |

La comparación directa con alternativas del mismo tamaño se ve limitada porque este repositorio no es un modelo distinto, sino una compilación del mismo Qwen3-4B-Instruct-2507 para un hardware específico. Frente a las distribuciones GGUF, la ventaja es la ejecución en NPU de bajo consumo; la desventaja es la ausencia de portabilidad y de ecosistema de herramientas.

## Limitaciones y advertencias

- Dependencia total del hardware: solo funciona en chips RK1828 con RKNN Runtime v1.1.0; no es ejecutable en GPU, CPU estándar ni otros aceleradores.
- Compatibilidad estricta de runtime y driver: es necesario verificar la versión en el dispositivo con `rknn-smi -v`; una discrepancia puede impedir la carga del modelo.
- Los archivos de una configuración deben usarse conjuntamente; mezclar ficheros de configuraciones distintas invalida los checksums SHA-256.
- La cuantización w4a16 puede degradar la calidad respecto al modelo base en tareas de razonamiento complejo o generación de código, aunque no se han publicado evaluaciones que cuantifiquen esta pérdida.
- La configuración con KVCache int4 (39.424 tokens) puede introducir mayor pérdida de precisión en contextos largos que la variante fp16.
- Riesgo de alucinación inherente a un modelo de 4B parámetros, especialmente en dominios especializados o con prompts ambiguos.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-4B-Instruct-2507.
- Idiomas soportados no documentados para esta conversión; conviene validar el comportamiento en castellano antes de producción.
- Restricciones de licencia: además de Apache 2.0 del modelo base, se aplican los términos del RKNN Toolkit y del RKNN Runtime de Rockchip, que pueden imponer condiciones adicionales al uso comercial o a la redistribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3-4B-Instruct-2507
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Documentación de configuración (inglés): https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3-4B-Instruct-2507/blob/main/Qwen3-4B-Instruct-2507-w4a16-8-16896/README.md
- Documentación de configuración (chino): https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen3-4B-Instruct-2507/blob/main/Qwen3-4B-Instruct-2507-w4a16-8-16896/README_CN.md
- ModelScope (espejo del repositorio): https://modelscope.cn/models/UGREENDEV/RK182X-LLM-Qwen3-4B-Instruct-2507
