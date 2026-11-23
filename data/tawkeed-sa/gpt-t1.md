# tawkeed-sa/gpt-t1

## Resumen

GPT T1 es el modelo de lenguaje asociado al dispositivo Tawkeed T1, desarrollado por Tawkeed (tawkeed-sa). Se trata de una adaptación del modelo base Qwen/Qwen3.5-122B-A10B, un transformer de mezcla de expertos (MoE) con 125.086.497.008 parámetros totales y aproximadamente 10.000 millones de parámetros activos por token. El modelo acepta entradas de texto e imagen (pipeline image-text-to-text) y declara una longitud de contexto de 262.144 tokens.

El repositorio publicado contiene, según la propia model card, los pesos originales en BF16 de Qwen3.5-122B-A10B sin modificar, con un tamaño aproximado de 250 GB. Tawkeed indica que una build cuantizada a 4 bits, dimensionada para el dispositivo T1 (una o dos NVIDIA RTX PRO 6000 Blackwell Max-Q de 96 GB cada una), reemplazará a estos pesos más adelante. Por tanto, en el momento de la publicación no existe todavía una versión específicamente adaptada ni cuantizada por Tawkeed.

La relevancia actual del modelo es limitada como artefacto independiente: al tratarse de pesos idénticos al modelo base, sus capacidades y rendimiento son los de Qwen3.5-122B-A10B. Su interés radica en formar parte de una familia de tres modelos (gpt-t1-mini, gpt-t1 y gpt-t1-max) pensada para desplegarse en hardware de borde o estaciones de trabajo con GPUs Blackwell de gran memoria, y en que la licencia Apache-2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE); 256 expertos, 8 activos por token |
| Parametros totales | 125.086.497.008 |
| Parametros activos | Aproximadamente 10.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16 en el repositorio actual; build a 4 bits anunciada por Tawkeed (no publicada) |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos y 8 activos por token, lo que da lugar a unos 10.000 millones de parámetros activos sobre un total de 125.086.497.008. Esta configuración permite mantener una capacidad de parámetros elevada con un coste computacional por token muy inferior al de un modelo denso del mismo tamaño. El contexto declarado es de 262.144 tokens y la modalidad de entrada incluye texto e imágenes.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, fases de RLHF o DPO) ni sobre innovaciones técnicas específicas más allá de lo indicado en la model card. Tampoco se detalla si Tawkeed ha realizado ajuste fino adicional: la propia card afirma que los pesos del repositorio son idénticos a los de Qwen3.5-122B-A10B, por lo que las características de entrenamiento son las del modelo base, cuyos detalles no se incluyen en la información disponible.

## Capacidades

- Generación de texto conversacional en árabe e inglés.
- Procesamiento de entradas multimodales de texto e imagen (pipeline image-text-to-text).
- Razonamiento y respuesta en contextos largos de hasta 262.144 tokens.
- Mezcla de expertos con 8 expertos activos por token, orientada a eficiencia computacional.
- Capacidades de código, matemáticas y tool calling: no disponibles en la información proporcionada (se heredarían del modelo base Qwen3.5-122B-A10B, pero no se detallan en la card).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional bilingüe árabe-inglés: el modelo declara soporte para ambos idiomas y un contexto de 262.144 tokens, lo que permite mantener conversaciones multi-turno extensas con historial completo sin truncamiento.
- Procesamiento de documentos con imágenes: al aceptar entradas image-text-to-text, puede emplearse para extraer y razonar sobre información contenida en capturas, formularios escaneados o diagramas combinados con texto.
- Despliegue en estación de trabajo con GPUs Blackwell: la familia T1 está diseñada para ejecutarse en una o dos NVIDIA RTX PRO 6000 Blackwell Max-Q de 96 GB, lo que habilita inferencia local de un modelo de 125B parámetros en entornos con requisitos de privacidad.
- Análisis de corpus largos: con 262.144 tokens de contexto, resulta adecuado para resumir o consultar documentación técnica extensa, contratos o expedientes completos en una sola pasada.
- Base para cuantización y despliegue propio: al publicarse los pesos BF16 íntegros, un equipo puede generar sus propias cuantizaciones (por ejemplo, a 4 bits) y servir el modelo con su propio stack.
- Prototipado de aplicaciones multimodales: sirve como referencia para evaluar el comportamiento de Qwen3.5-122B-A10B antes de adoptar la build optimizada de Tawkeed.
- Investigación sobre MoE a gran escala: la disponibilidad de pesos Apache-2.0 permite estudiar el enrutamiento de 256 expertos y el comportamiento con 8 expertos activos por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos BF16: aproximadamente 250 GB, según el tamaño del repositorio. No caben en una sola GPU de 96 GB.
- Dispositivo objetivo declarado: Tawkeed T1, con una o dos NVIDIA RTX PRO 6000 Blackwell Max-Q de 96 GB cada una (96 o 192 GB de VRAM). La build a 4 bits, aún no publicada, está dimensionada para este hardware.
- Para ejecutar los pesos BF16 actuales se necesita hardware con al menos ~250 GB de memoria GPU agregada (por ejemplo, varias A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) en BF16.
- Opciones de despliegue: la model card remite a las instrucciones de servicio de Qwen/Qwen3.5-122B-A10B; no se especifican frameworks concretos (vLLM, TGI, llama.cpp, Ollama) en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-t1 (este modelo) | 125.086.497.008 | ~10B | 262.144 | Apache-2.0 | Pesos BF16 publicados; build 4-bit anunciada |
| Qwen/Qwen3.5-122B-A10B | ~122B (según nombre) | ~10B | No disponible en la información | No disponible en la información | Modelo base referenciado |
| gpt-t1-mini | No disponible | No disponible | No disponible | No disponible | Familia T1, dispositivo T1 Mini (32 o 48 GB) |
| gpt-t1-max | No disponible | No disponible | No disponible | No disponible | Familia T1, dispositivo T1 Max (384 GB, cuatro GPUs) |

## Limitaciones y advertencias

- Los pesos publicados son idénticos a Qwen3.5-122B-A10B; no incorporan ajuste ni cuantización específica de Tawkeed en el momento de la publicación.
- El repositorio ocupa 250,2 GB en BF16 y no cabe en el dispositivo objetivo hasta que se publique la build a 4 bits anunciada.
- Idiomas declarados limitados a árabe e inglés; el rendimiento en otros idiomas no está documentado.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad.
- No se han publicado benchmarks propios que permitan verificar el rendimiento frente al modelo base.
- Aunque la licencia es Apache-2.0, conviene revisar el archivo `LICENSE` del repositorio y las condiciones del modelo base Qwen para uso comercial en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.
- No se especifican frameworks de servicio compatibles ni requisitos de software más allá de `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/tawkeed-sa/gpt-t1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- gpt-t1-mini: https://huggingface.co/tawkeed-sa/gpt-t1-mini
- gpt-t1-max: https://huggingface.co/tawkeed-sa/gpt-t1-max
- Sitio del desarrollador: https://tawkeed.ai
