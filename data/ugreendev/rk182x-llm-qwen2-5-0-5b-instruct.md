# UGREENDEV/RK182X-LLM-Qwen2.5-0.5B-Instruct

## Resumen

RK182X-LLM-Qwen2.5-0.5B-Instruct es una conversión al formato RKNN del modelo Qwen2.5-0.5B-Instruct, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado del modelo instruct de 0,5 mil millones de parámetros de Qwen, empaquetado con el runtime RKNN v1.1.0 para despliegue en hardware embebido con aceleración neuronal.

Su relevancia es acotada pero clara: permite ejecutar un LLM conversacional de contexto largo (35,5k tokens) en chips de bajo consumo, algo que las pilas de inferencia convencionales (vLLM, TGI) no cubren de forma nativa. El repositorio incluye una única configuración, `Qwen2.5-0.5B-Instruct-w4a16-8-36352`, con cuantización de pesos a 4 bits (w4a16), 8 núcleos NPU y KVCache en fp16.

La ficha describe las características técnicas del artefacto publicado (formato, cuantización, contexto, licencia) y las del modelo base subyacente. Cualquier dato no documentado en la información disponible se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-0.5B-Instruct); empaquetado en formato RKNN para NPU Rockchip |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 36.352 tokens (35,5k) en la configuración publicada |
| Tipos de cuantizacion | w4a16 (pesos a 4 bits, activaciones a 16 bits); KVCache en fp16 |
| Idiomas soportados | No disponible en la información proporcionada (heredados del modelo base Qwen2.5) |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

El artefacto es una conversión y cuantización del modelo Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros desarrollado por Alibaba Qwen. La información proporcionada no detalla la composición del dataset de entrenamiento original, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos corresponden a la model card del modelo base y no se incluyen aquí.

La innovación técnica del repositorio no está en el entrenamiento sino en el despliegue: el modelo se compila para el runtime RKNN v1.1.0, se cuantiza a w4a16 y se configura para explotar 8 núcleos NPU de los chips RK1820 y RK1828. La configuración incluye KVCache en fp16, lo que permite sostener una ventana de contexto de 36.352 tokens en hardware embebido. El repositorio incluye sumas SHA-256 (`SHA256SUMS`) para verificar la integridad de los ficheros antes del despliegue.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct base.
- Razonamiento básico y respuesta a instrucciones en formato chat.
- Generación de código y resolución de problemas matemáticos sencillos, limitada por el tamaño de 0,5B del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para esta conversión.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no detalladas en la información proporcionada; dependen del modelo base Qwen2.5.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en esta conversión.
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Contexto largo de 36.352 tokens con KVCache fp16, adecuado para documentos extensos en dispositivos embebidos.

## Casos de uso

- Asistente conversacional en dispositivo embebido: el modelo puede gestionar diálogos multi-turno en local sobre RK1820/RK1828 sin depender de la nube, gracias a su huella reducida (repo de 0,6 GB) y a la aceleración NPU.
- Procesamiento de documentos largos en el borde: con 36.352 tokens de contexto, permite resumir o extraer información de contratos, manuales o informes directamente en el dispositivo.
- Clasificación y extracción de entidades en tiempo real: útil en pasarelas IoT o equipos industriales que necesitan etiquetar texto sin enviar datos a un servidor externo.
- Generación de respuestas predefinidas en atención al cliente embebida: para terminales de autoservicio o kioscos con conectividad limitada, donde el modelo redacta respuestas a partir de una base de conocimiento local.
- Prototipado de pipelines de IA en hardware Rockchip: sirve como banco de pruebas para validar latencia y consumo antes de escalar a modelos mayores en la misma NPU.
- Filtrado y moderación de contenido en el borde: el modelo puede clasificar mensajes de usuario y bloquear contenido inapropiado en dispositivos con recursos restringidos.
- Traducción y reescritura ligera offline: para aplicaciones de movilidad o campo donde no hay conexión estable, siempre que los idiomas estén cubiertos por el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (exclusivamente).
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 en la configuración publicada.
- VRAM estimada: no disponible; el modelo se ejecuta sobre NPU, no sobre GPU convencional.
- GPU recomendadas: no aplica; el artefacto RKNN no está pensado para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; requiere el hardware Rockchip indicado.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 0,6 GB, lo que facilita el almacenamiento en dispositivos con flash limitada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-LLM-Qwen2.5-0.5B-Instruct | 0,5B | 36.352 tokens | RKNN | Apache 2.0 | NPU Rockchip RK1820/RK1828 |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (modelo base) | safetensors | Apache 2.0 | GPU/CPU convencional |
| Conversiones GGUF de Qwen2.5-0.5B-Instruct | 0,5B | Variable según cuantización | GGUF | Apache 2.0 | CPU, GPU de consumo |
| Conversiones RKNN de otros modelos pequeños | No disponible | No disponible | RKNN | Según modelo base | NPU Rockchip |

La comparación directa con alternativas RKNN de la misma categoría no está disponible en la información proporcionada. Frente al modelo base, la conversión gana en adecuación al hardware Rockchip y contexto ligeramente superior, pero pierde portabilidad y no puede ejecutarse en pilas de inferencia estándar.

## Limitaciones y advertencias

- El artefacto solo funciona en RK1820 y RK1828; no es portable a GPU, CPU ni a otras NPU.
- Requiere RKNN Runtime v1.1.0 y el driver correspondiente; una versión distinta puede impedir la ejecución.
- Al ser un derivado cuantizado a w4a16, la calidad de salida puede degradarse respecto al modelo base en tareas de razonamiento complejo o generación de código.
- Con 0,5B de parámetros, la capacidad de razonamiento, matemáticas y código es limitada; no es adecuado para tareas que requieran precisión alta.
- Riesgo de alucinación inherente a los modelos de este tamaño, especialmente en contextos largos y preguntas factuales.
- Sesgos conocidos: no documentados en la información proporcionada; se heredan los del modelo base Qwen2.5.
- Idiomas soportados: no detallados; conviene validar el comportamiento en castellano antes de producción.
- Licencia Apache 2.0 para el modelo base, pero se aplican además los términos de RKNN Toolkit y RKNN Runtime, que pueden imponer restricciones adicionales.
- Verificar la integridad con `sha256sum -c SHA256SUMS` antes del despliegue; usar ficheros de directorios de configuración distintos puede romper la compatibilidad.
- No se documentan capacidades de tool calling ni de agentes en esta conversión; no asumirlas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen2.5-0.5B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentación de la configuración (inglés): https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen2.5-0.5B-Instruct/blob/main/Qwen2.5-0.5B-Instruct-w4a16-8-36352/README.md
- Documentación de la configuración (chino): https://huggingface.co/UGREENDEV/RK182X-LLM-Qwen2.5-0.5B-Instruct/blob/main/Qwen2.5-0.5B-Instruct-w4a16-8-36352/README_CN.md
- Repositorio en ModelScope: https://modelscope.cn/models/UGREENDEV/RK182X-LLM-Qwen2.5-0.5B-Instruct
