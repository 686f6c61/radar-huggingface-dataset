# UGREENDEV/RK182X-LLM-functiongemma-270m-it

## Resumen

RK182X-LLM-functiongemma-270m-it es una conversión al formato RKNN del modelo google/functiongemma-270m-it, publicada por UGREENDEV. El modelo original es un transformer de 270 millones de parámetros especializado en tool calling (function calling), destilado a partir de la familia Gemma. La conversión está pensada para ejecutarse sobre las NPU Rockchip RK1820 y RK1828, con un runtime RKNN v1.1.0.

El repositorio no contiene pesos en safetensors ni GGUF, sino artefactos compilados para NPU con cuantización w4a16 (pesos a 4 bits, activaciones a 16 bits) y una longitud de contexto de 8192 tokens con KVCache en fp16. El objetivo es desplegar un modelo pequeño de function calling en dispositivos embebidos con aceleración NPU, no en GPU convencional.

Su relevancia es acotada: se trata de un artefacto de despliegue para hardware específico, no de un modelo nuevo. Cualquier evaluación de calidad debe remitirse al modelo base google/functiongemma-270m-it, dado que la conversión no aporta capacidades nuevas y el autor no publica benchmarks propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/functiongemma-270m-it); artefacto compilado en formato RKNN |
| Parámetros totales | 270 M (según el modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (8k) |
| Tipos de cuantización | w4a16 (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Gemma Terms of Use (etiquetada como "other" en Hugging Face); sujeta además a USE_RESTRICTIONS.txt y a la licencia de RKNN Toolkit/Runtime |
| Formato de pesos | RKNN (artefactos compilados para NPU RK1820/RK1828), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es google/functiongemma-270m-it, un transformer decoder-only de 270 millones de parámetros orientado a function calling, afinado por Google a partir de la familia Gemma. El repositorio de UGREENDEV no documenta detalles de entrenamiento del modelo base: no se indican número de tokens, composición del dataset ni si hubo RLHF o DPO.

La aportación de este repositorio es la conversión y cuantización a RKNN con el toolkit de Rockchip (runtime v1.1.0), configurada para 8 núcleos NPU, contexto de 8192 tokens y KVCache en fp16. Se distribuye un único directorio de configuración, `functiongemma-270m-it-w4a16-8-8192`, con checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue. No se documentan innovaciones arquitectónicas adicionales más allá de la compilación para NPU.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Tool calling / function calling: el autor indica explícitamente que el modelo está diseñado para ello y que debe usarse la plantilla de prompt de herramientas correspondiente.
- Conteo de tokens de contexto de hasta 8192, suficiente para conversaciones multi-turno con historial de herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Razonamiento avanzado, matemáticas, código, visión o audio: no documentados; por el tamaño del modelo base (270 M) no cabe esperar rendimiento competitivo en estas tareas.
- Modo thinking, agentes autónomos multi-paso o decodificación especulativa: no documentados.

## Casos de uso

- Function calling en dispositivos embebidos: el modelo convierte lenguaje natural en llamadas estructuradas a funciones sobre NPU RK1820/RK1828, adecuado para asistentes de voz o domótica local sin conexión a la nube.
- Automatización de comandos en electrodomésticos y equipos de consumo: con 270 M de parámetros y cuantización w4a16, cabe en el presupuesto de memoria de un SoC Rockchip y permite interpretar intenciones del usuario y mapearlas a APIs del dispositivo.
- Enrutado de intenciones en asistentes locales: clasificar la petición del usuario y seleccionar la herramienta o API correspondiente antes de delegar en un modelo mayor, reduciendo latencia y coste.
- Extracción de parámetros estructurados: a partir de una frase del usuario, generar JSON con los argumentos de una función (fechas, identificadores, cantidades) para su validación posterior.
- Prototipado de agentes de borde: pipelines de agentes simples de un solo paso de herramienta, donde el contexto de 8k permite incluir el historial reciente de conversación y las definiciones de funciones.
- Integración en firmware con RKNN Runtime: despliegue en producción sobre RK1820/RK1828 usando el runtime v1.1.0 y los ficheros de la configuración `functiongemma-270m-it-w4a16-8-8192`, verificados con SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de precisión en function calling, latencia ni throughput para la versión RKNN, y no se dispone de datos de rendimiento del modelo base en esta información.

## Requisitos de hardware

- NPU compatible: Rockchip RK1820 o RK1828 exclusivamente; no se ejecuta en GPU convencional con este formato.
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Memoria: no disponible en la información proporcionada; el repositorio ocupa 0,6 GB, pero no se detalla el consumo en tiempo de ejecución.
- Configuración NPU: 8 núcleos, KVCache en fp16, contexto de 8192 tokens.
- GPU consumer (RTX 4090, etc.): no aplicable; para GPU habría que usar el modelo base google/functiongemma-270m-it en otro formato.
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-LLM-functiongemma-270m-it (este) | 270 M | 8192 | RKNN, NPU RK1820/RK1828 | Gemma Terms of Use + restricciones RKNN | Hugging Face y ModelScope |
| google/functiongemma-270m-it | 270 M | No disponible | Pesos originales (safetensors, presumiblemente) | Gemma Terms of Use | Hugging Face |
| Modelos de function calling de mayor tamaño (p. ej. Qwen o Llama en variantes pequeñas) | No disponible | No disponible | Múltiples | Variables | No disponible |

La comparación relevante es contra el modelo base: este repositorio no mejora la calidad del modelo, solo cambia el formato y el hardware objetivo. No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto solo funciona en NPU Rockchip RK1820 y RK1828 con RKNN Runtime v1.1.0; no es portable a otros aceleradores sin reconversión.
- Licencia Gemma Terms of Use, no Apache 2.0: el uso comercial y la redistribución están sujetos a dichos términos y a USE_RESTRICTIONS.txt, que deben revisarse antes de producción.
- Se aplican además las condiciones de licencia de RKNN Toolkit y RKNN Runtime.
- El modelo está diseñado para tool calling y requiere la plantilla de prompt de herramientas correspondiente; usarlo con otras plantillas puede degradar la calidad de las llamadas.
- Con 270 M de parámetros, cabe esperar una capacidad limitada de razonamiento y un riesgo elevado de alucinación en tareas abiertas; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas soportados no documentados; no se garantiza un buen comportamiento en castellano.
- No se documentan sesgos conocidos, pero al derivar de Gemma hereda los del modelo base, no evaluados en esta información.
- Los ficheros de una configuración deben usarse conjuntamente y verificarse con SHA-256 antes del despliegue; mezclar versiones puede provocar fallos.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-LLM-functiongemma-270m-it
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-LLM-functiongemma-270m-it --revision master`
- Documentación de la configuración: `functiongemma-270m-it-w4a16-8-8192/README.md` (en el repositorio)
- Licencia y restricciones: `LICENSE`, `Notice` y `USE_RESTRICTIONS.txt` (en el repositorio)
