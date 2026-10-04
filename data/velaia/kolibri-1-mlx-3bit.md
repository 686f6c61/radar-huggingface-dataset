# velaia/Kolibri-1-MLX-3bit

## Resumen

velaia/Kolibri-1-MLX-3bit es una conversión no oficial a MLX con cuantización de 3 bits del modelo Aleph-Alpha/Kolibri-1, desarrollado por Aleph Alpha GmbH. Se trata de un modelo de lenguaje de arquitectura transformer con mezcla de expertos (MoE) y capacidades de razonamiento explícito, que en su versión original se distribuye en FP8 (e4m3 con escalado por bloques de 128×128). Esta conversión permite ejecutar el modelo en Apple Silicon con memoria unificada a partir de 48 GB, reduciendo el peso de los pesos a 33 GiB mediante cuantización afín de MLX con tamaño de grupo 64.

El problema que resuelve es la dificultad de desplegar un modelo de 78.103.055.360 parámetros totales en hardware de consumo o estaciones de trabajo compactas. Al aplicar 3 bits a los expertos enrutados, 4 bits a la atención y al experto compartido, y 8 bits a los embeddings y a la cabeza LM, se logra un equilibrio entre tamaño y calidad, con una perplejidad de 13,17 en alemán y 16,31 en inglés sobre una muestra de Wikipedia. Es relevante ahora porque permite inferencia local en Macs de gama alta sin depender de GPUs dedicadas, con un rendimiento de aproximadamente 52-56 tokens por segundo en un M1 Max.

La información disponible no especifica la longitud de contexto del modelo original, ni el número de parámetros activos por token, ni detalles sobre el conjunto de entrenamiento o el uso de RLHF/DPO. La licencia Apache 2.0 se aplica únicamente a los pesos y archivos de configuración; Aleph Alpha retiene todos los derechos sobre su código, arquitectura y métodos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y modo de razonamiento |
| Parámetros totales | 78.103.055.360 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX afín, tamaño de grupo 64: expertos enrutados a 3 bits; atención y experto compartido a 4 bits; embeddings y LM head a 8 bits; router MoE sin cuantizar. Existen variantes 4-bit y 2-bit en la misma conversión |
| Idiomas soportados | de, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Aleph-Alpha/Kolibri-1 es un transformer con mezcla de expertos (MoE) y capacidades de razonamiento. La conversión aquí descrita parte de los pesos FP8 (e4m3, con escalado por bloques de 128×128) y los dequantiza para volver a cuantizarlos con el esquema afín de MLX, usando un tamaño de grupo de 64. La precisión es mixta: los expertos enrutados se cuantizan a 3 bits (3,57 bits por peso de media), mientras que la atención y el experto compartido usan 4 bits, los embeddings y la cabeza LM usan 8 bits, y el router MoE permanece sin cuantizar. El RMSE de reconstrucción de pesos respecto a los pesos FP8 dequantizados es de 0,194 para los expertos enrutados en la variante de 3 bits, y de 0,098 para atención más experto compartido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el modelo original. La model card original de Aleph Alpha debe consultarse para esos detalles. Una innovación destacable es el parámetro `reasoning_effort`, que controla la longitud del razonamiento generado y admite los valores `none`, `low`, `medium` y `high`. Sin especificarlo, la plantilla de chat usa `high` por defecto, lo que produce respuestas con un razonamiento extenso. El repositorio incluye `kolibri1.py`, una implementación de la arquitectura portada desde el plugin de vLLM de Aleph Alpha (licencia Apache 2.0), y `run.py`, un lanzador que registra la arquitectura y permite usar los comandos habituales de mlx-lm (`generate`, `chat`, `server`).

## Capacidades

- Generación de texto y conversación multi-turno en alemán e inglés.
- Razonamiento explícito con niveles de esfuerzo configurables: `none`, `low`, `medium` y `high` (por defecto `high` en la plantilla de chat).
- Modelo de mezcla de expertos (MoE), aunque no se especifica cuántos expertos se activan por token.
- No se especifica soporte de tool calling, function calling, agentes, multi-step reasoning más allá del razonamiento interno, visión o audio en la información disponible.
- Capacidad multilingüe limitada a los idiomas alemán e inglés.
- Modo de generación determinista si se usa temperatura 0, útil para comparar variantes de cuantización.

## Casos de uso

- Asistente local en Mac para tareas de razonamiento y generación de texto en alemán e inglés: el modelo cabe en 48 GB de memoria unificada gracias a la cuantización de 3 bits, y puede ejecutarse sin conexión a internet.
- Análisis y resumen de documentos extensos en alemán, como artículos de Wikipedia o informes técnicos, usando el modo de razonamiento `high` para tareas que requieren inferencia compleja.
- Chatbot de atención al cliente en alemán para empresas que manejan datos sensibles y necesitan procesarlos localmente, evitando enviar información a servicios en la nube.
- Herramienta de apoyo a la investigación en razonamiento automático: permite comparar los distintos niveles de `reasoning_effort` y analizar cómo varía la calidad y la longitud de las respuestas.
- Generación de texto creativo o técnico en inglés y alemán en entornos sin acceso a internet, como instalaciones aisladas o con requisitos de privacidad estrictos.
- Prototipado rápido de aplicaciones de lenguaje natural en Apple Silicon, utilizando el servidor compatible con OpenAI que incluye el repositorio (`http://localhost:8080/v1`).
- Evaluación comparativa de cuantizaciones: el mismo repositorio ofrece variantes de 2, 3 y 4 bits, lo que permite medir el compromiso entre memoria, velocidad y perplejidad en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona valores de perplejidad sobre los primeros 4.096 tokens de los artículos de Wikipedia en alemán ("Kolibris") e inglés ("Hummingbird"), así como el RMSE de reconstrucción de pesos:

| Variante | Bits/peso | Tamaño | Memoria pico (prompt corto / 4k tokens) | Perplejidad DE / EN* |
|---|---|---|---|---|
| 4-bit | 4,54 | 41 GiB | 44 / 48 GB | 12,77 / 16,47 |
| 3-bit (este repo) | 3,57 | 33 GiB | 35 / 39 GB | 13,17 / 16,31 |
| 2-bit | 2,61 | 24 GiB | 26 / 30 GB | 14,01 / 17,46 |

*Primeros 4.096 tokens de los artículos de Wikipedia en alemán "Kolibris" e inglés "Hummingbird"; menor es mejor; muestra pequeña, solo orientativa.

RMSE de reconstrucción de pesos respecto a los pesos FP8 dequantizados: expertos enrutados 0,194 (3-bit) / 0,400 (2-bit) / ~0,10 (4-bit); atención + experto compartido 0,098.

Velocidad de generación: aproximadamente 52-56 tokens por segundo en un M1 Max para las tres variantes.

## Requisitos de hardware

- Memoria unificada: 33 GiB de pesos, con un pico de 35 GB para prompts cortos y 39 GB para un prompt de 4.096 tokens.
- Compatible con Macs de 48 GB o más (Apple Silicon). En un Mac de 48 GB es necesario elevar el límite de memoria de la GPU: `sudo sysctl -w iogpu.wired_limit_mb=40960` (se restablece al reiniciar).
- No se dispone de información sobre GPUs NVIDIA u otros aceleradores; el repositorio usa MLX, específico de Apple Silicon.
- Despliegue mediante mlx-lm con el lanzador `run.py` incluido, que soporta los comandos `generate`, `chat` y `server` (servidor compatible con OpenAI en `http://localhost:8080/v1`).
- Latencia y throughput: ~52-56 tokens/s en un M1 Max.
- No cargar otro modelo grande al mismo tiempo.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría en la documentación proporcionada. La comparación más directa es entre las distintas variantes de cuantización de esta misma conversión y el modelo original en FP8:

| Modelo | Bits/peso | Tamaño | Perplejidad DE / EN* | Licencia |
|---|---|---|---|---|
| Kolibri-1 original (FP8) | FP8 (e4m3) | no disponible | no disponible | apache-2.0 |
| Kolibri-1-MLX-4bit | 4,54 | 41 GiB | 12,77 / 16,47 | apache-2.0 |
| Kolibri-1-MLX-3bit (este repo) | 3,57 | 33 GiB | 13,17 / 16,31 | apache-2.0 |
| Kolibri-1-MLX-2bit | 2,61 | 24 GiB | 14,01 / 17,46 | apache-2.0 |

*Primeros 4.096 tokens de los artículos de Wikipedia en alemán "Kolibris" e inglés "Hummingbird"; menor es mejor.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Aleph Alpha GmbH.
- La cuantización de 3 bits introduce pérdida de calidad respecto al FP8 original; el RMSE de reconstrucción en expertos enrutados es 0,194, y la perplejidad en inglés (16,31) es peor que en alemán (13,17) para esta variante.
- Idiomas soportados: únicamente alemán e inglés.
- No se dispone de información sobre longitud de contexto, sesgos conocidos, riesgo de alucinación o comportamiento en dominios específicos.
- La licencia Apache 2.0 se aplica solo a los pesos y archivos de configuración; Aleph Alpha retiene todos los derechos sobre su código, arquitectura y métodos de entrenamiento.
- Uso responsable según la model card original: no usos ilegales, no prácticas prohibidas por el Art. 5 del EU AI Act, no aplicaciones militares o nucleares.
- Requiere un Mac con al menos 48 GB de memoria unificada y el ajuste del límite de memoria de la GPU. No se puede ejecutar simultáneamente con otro modelo grande.
- No hay benchmarks estándar publicados (MMLU, HumanEval, GSM8K, etc.).
- El soporte de tool calling, agentes, visión o audio no está confirmado en la información disponible.

## Enlaces

- [velaia/Kolibri-1-MLX-3bit en HuggingFace](https://huggingface.co/velaia/Kolibri-1-MLX-3bit)
- [Aleph-Alpha/Kolibri-1 en HuggingFace](https://huggingface.co/Aleph-Alpha/Kolibri-1)
- [Plugin de vLLM de Aleph Alpha](https://github.com/Aleph-Alpha/aleph-alpha-inference)
