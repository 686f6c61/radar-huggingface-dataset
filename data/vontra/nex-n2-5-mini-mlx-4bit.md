# Vontra/Nex-N2.5-mini-MLX-4bit

## Resumen

El modelo Vontra/Nex-N2.5-mini-MLX-4bit es una conversión comunitaria a MLX 4-bit del modelo Nex-N2.5-mini, desarrollado por Nex-AGI. El objetivo principal es permitir la ejecución local de un sistema multimodal de gran tamaño en Apple Silicon mediante el ecosistema MLX-VLM, evitando la necesidad de GPUs dedicadas. La versión original es un modelo de visión-lenguaje (image-text-to-text) con arquitectura qwen3_5_moe, un mixture-of-experts (MoE) que cuenta con 35.107.181.936 parámetros totales. Esta conversión aplica cuantización afín a 4 bits con tamaño de grupo 64, logrando un promedio de 4.649 bits por peso y un tamaño de repositorio de 20.4 GB.

El modelo es relevante porque ofrece un punto de acceso práctico a un MoE multimodal de gran escala en hardware local de Apple. La conversión no es un lanzamiento oficial de Nex-AGI, sino un trabajo independiente de Vontra, que verificó un conjunto básico de capacidades (aritmética, llamadas a herramientas, JSON estructurado, visión simple y generación de código) a través de oMLX 0.6.4. La licencia Apache-2.0 permite uso comercial, aunque la falta de evaluaciones exhaustivas obliga a tratar el resultado con cautela en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (mixture-of-experts, transformer multimodal) |
| Parametros totales | 35.107.181.936 (~35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 4-bit (group size 64, promedio 4.649 bits/peso; algunos tensores multimodales conservan mayor precisión) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (cuantización MLX-VLM) |

## Arquitectura y entrenamiento

La arquitectura qwen3_5_moe es un transformer basado en mixture-of-experts, en el que una parte de los parámetros se activa dinámicamente según el token de entrada. El modelo resultante es un VLM que combina un codificador de imagen con un modelo de lenguaje, de forma que puede procesar entradas de texto e imágenes simultáneamente. En el checkpoint BF16 original se declaró una capa MTP (multi-token prediction) en la configuración, pero durante la conversión no se encontraron tensores coincidentes; por tanto, esta versión no ofrece decodificación MTP probada y se recomienda mantener MTP desactivado.

La conversión empleada por Vontra utiliza cuantización afín a 4 bits sobre los pesos del checkpoint BF16, con un tamaño de grupo de 64. El conversor aplica un predicado por defecto que excluye ciertos módulos multimodales de la cuantización, lo que da como resultado un promedio de 4.649 bits por peso. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si se aplicaron procesos de alineación como RLHF o DPO, ya que estos datos no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en conversaciones.
- Comprensión de imágenes (image-text-to-text): puede identificar propiedades básicas de una imagen, como se comprobó con una imagen roja sintética.
- Tool calling / function calling: soporta llamadas a funciones en formato estructurado; se verificó una llamada forzada a un servicio meteorológico con el argumento "París".
- Emisión de JSON estructurado: un test de JSON estructurado superó la validación.
- Generación de código: se probaron cuatro solicitudes de código, aunque tres alcanzaron el límite de 4096 tokens.
- Matemáticas básicas: la prueba 17 × 19 devolvió 323 con la configuración de muestreo recomendada.
- Capacidad para ejecutarse localmente en Apple Silicon mediante MLX y oMLX.

## Casos de uso

- Asistente multimodal en Apple Silicon: el modelo puede ejecutarse localmente en Macs con memoria unificada mediante oMLX, ofreciendo capacidades de visión y texto sin depender de servicios en la nube. Resulta adecuado en entornos donde la privacidad es crítica, ya que todo el procesamiento es local.

- Análisis básico de imágenes: permite extraer información visual (por ejemplo, identificar colores u objetos) y combinarla con razonamiento textual. Puede usarse para tareas de verificación simple de contenido o descripción de capturas de pantalla en aplicaciones de escritorio.

- Agentes con tool calling: al soportar llamadas a funciones, el modelo puede integrarse en sistemas de agentes que necesiten consultar APIs externas, como servicios meteorológicos, bases de datos o repositorios. La prueba de una llamada meteorológica con argumento "París" sugiere que puede formatear correctamente este tipo de peticiones.

- Generación de respuestas estructuradas en JSON: el modelo superó un test de JSON estructurado, por lo que puede emplearse en pipelines que requieran salidas formales para alimentar otros sistemas, como chatbots de empresa o servicios de automatización.

- Soporte de desarrollo de código local: puede asistir en la redacción o revisión de fragmentos de código dentro de un IDE o entorno CLI. Es importante tener en cuenta que las respuestas largas pueden truncarse en 4096 tokens según la configuración utilizada.

- Análisis de documentos con imágenes: al combinar visión y texto, podría utilizarse para describir figuras, esquemas o diagramas dentro de un documento, siempre que la resolución y la calidad de la imagen sean adecuadas.

- Cálculo y razonamiento aritmético: para consultas matemáticas directas puede ayudar en calculadoras conversacionales o asistentes educativos, aunque no hay garantías de precisión en operaciones complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión solo reporta pruebas de validación básicas realizadas con oMLX 0.6.4 en un Apple Silicon Studio con 256 GiB de memoria unificada: una operación aritmética (17 × 19 = 323), una llamada a herramienta meteorológica forzada con argumento "París", identificación de una imagen roja sintética, un test de JSON estructurado y cuatro solicitudes de código (una terminó naturalmente y tres alcanzaron el límite de 4096 tokens). Estas pruebas no constituyen benchmarks comparativos y no evalúan de forma exhaustiva las capacidades de codificación, visión ni agentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se ha medido el pico de memoria).
- GPU recomendadas: Apple Silicon; las pruebas se realizaron en un Mac Studio con 256 GiB de memoria unificada.
- Compatibilidad con GPU de consumo: no, el modelo se distribuye en formato MLX, orientado exclusivamente a Apple Silicon.
- Opciones de despliegue: oMLX (versión 0.6.4 probada), MLX-VLM, descarga directa mediante `hf download`.
- Latencia y throughput: en las pruebas de codificación se observaron aproximadamente 103-104 tokens por segundo, medidos de extremo a extremo a través de la API de oMLX. No es un benchmark controlado de decodificación y el estado de caché no se controló.

## Comparativa con modelos similares

| Modelo | Cuantización | Parametros | Formato | Licencia |
|---|---|---|---|---|
| nex-agi/Nex-N2.5-mini | BF16 original | 35.1B | Safetensors BF16 | Apache-2.0 |
| Vontra/Nex-N2.5-mini-MLX-4bit | MLX afín 4-bit | 35.1B | MLX Safetensors | Apache-2.0 |
| Vontra/Nex-N2.5-mini-MLX-oQ2 | MLX oQ2 (no especificado) | 35.1B | MLX Safetensors | Apache-2.0 |
| abenzerps/Nex-N2.5-mini-MLX-4bit | MLX 4-bit | 35.1B | MLX Safetensors | Apache-2.0 |

No se dispone de datos comparativos de rendimiento entre estas variantes, ya que no se han publicado resultados de benchmarks en la información disponible.

## Limitaciones y advertencias

- No se ha medido el pico de memoria ni los límites de contexto, por lo que no se pueden ofrecer recomendaciones de memoria mínima.
- La calidad de visión, el manejo de contextos largos y las conversaciones multi-turno no han sido verificados de forma exhaustiva.
- En las pruebas de código, tres de cuatro solicitudes alcanzaron el límite de 4096 tokens, lo que indica un posible truncamiento en respuestas largas.
- La decodificación MTP no está probada y se recomienda mantenerla desactivada.
- Para la variante oQ2 se observaron bucles de repetición con muestreo greedy, aunque no se confirma este comportamiento en la cuantización 4-bit.
- Los benchmarks del modelo original Nex-N2.5-mini no son aplicables a esta cuantización.
- Es una conversión comunitaria independiente, no un lanzamiento oficial de Nex-AGI; por tanto, no hay garantías de soporte ni de actualizaciones.
- No se dispone de información sobre sesgos, riesgos de alucinación ni restricciones idiomáticas, ya que no se han evaluado.

## Enlaces

- https://huggingface.co/Vontra/Nex-N2.5-mini-MLX-4bit
- https://huggingface.co/nex-agi/Nex-N2.5-mini
- https://github.com/nex-agi/Nex-N2.5
- https://nex-agi.com/
- https://huggingface.co/Vontra/Nex-N2.5-mini-MLX-oQ2
- https://huggingface.co/abenzerps/Nex-N2.5-mini-MLX-4bit
- https://huggingface.co/Vontra
