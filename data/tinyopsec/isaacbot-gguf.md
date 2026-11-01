# tinyopsec/isaacbot-GGUF

## Resumen

isaacbot-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo isaacbot, un fine-tuning de Qwen2.5-Coder-1.5B realizado por Isaacwienert y cuantizado por el usuario tinyopsec mediante llama.cpp. El modelo base es un transformer de 1.540 millones de parámetros de la familia Qwen2.5-Coder de Alibaba, especializada en generación de código, y el ajuste fino se ha realizado sobre datos de razonamiento (reasoning), Ultrachat y Dolly, orientándolo hacia tareas de asistente conversacional y programación.

Su relevancia principal radica en el tamaño: al ser un modelo de menos de 2.000 millones de parámetros, funciona con fluidez en CPUs de consumo, portátiles y GPUs modestas, lo que lo hace adecuado como asistente de código local sin depender de servicios en la nube. La disponibilidad en trece niveles de cuantización distintos, desde F16 hasta Q2_K, permite ajustar el equilibrio entre calidad y consumo de memoria según el hardware disponible. La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (decoder-only) |
| Parámetros totales | 1.543.714.304 (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base Qwen2.5-Coder-1.5B soporta 128K) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el base soporta más de 29 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B, un transformer decoder-only de la familia Qwen2.5 de Alibaba Cloud, optimizado para tareas de programación. La versión isaacbot se ha ajustado posteriormente con una mezcla de datos de razonamiento (reasoning), el dataset conversacional Ultrachat y el dataset Dolly, orientando el modelo hacia el rol de asistente conversacional con capacidades de código. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

Las cuantizaciones del repositorio se han producido con llama.cpp en formato GGUF, cubriendo un rango completo de precisiones: desde F16 (pesos completos a 16 bits, 3,0 GB) hasta Q2_K (2 bits), pasando por las variantes K-quants (Q2_K a Q6_K) y las clásicas (Q4_0, Q5_0). La cuantización recomendada por el autor es Q4_K_M, que ofrece el mejor equilibrio entre calidad percibida y tamaño en modelos de este rango.

## Capacidades

- Generación de texto conversacional, con entrenamiento sobre Ultrachat y Dolly para diálogos multi-turno.
- Generación y completado de código, heredado del modelo base Qwen2.5-Coder.
- Razonamiento paso a paso, gracias a la inclusión de datos de reasoning en el fine-tuning.
- Ejecución local y offline mediante runtimes compatibles con GGUF (llama.cpp, Ollama, LM Studio, koboldcpp).
- No hay información disponible sobre tool calling, function calling, capacidades de visión o audio, ni soporte de agentes.

## Casos de uso

- Asistente de código en local: completado y generación de funciones y scripts directamente en el editor o terminal, sin enviar código propietario a APIs externas, gracias a su ejecución 100 % local.
- Chatbot conversacional ligero: su entrenamiento con Ultrachat y Dolly lo hace apto para asistentes de diálogo en aplicaciones donde se priorice la latencia y el bajo coste sobre la máxima calidad.
- Integración en dispositivos con recursos limitados: las cuantizaciones Q2_K a Q4 permiten ejecutarlo en portátiles sin GPU dedicada o en mini-PCs.
- Prototipado de agentes y pipelines LLM: su tamaño reducido permite iterar rápidamente en pruebas de orquestación, prompts y cadenas antes de escalar a modelos mayores.
- Razonamiento y explicación de código: puede explicar fragmentos de código, documentar funciones y responder preguntas técnicas en un asistente integrado en la documentación interna de un equipo.
- Educación y formación: adecuado como base para talleres y ejercicios de programación asistida, al poder desplegarse en aulas sin infraestructura de GPU.
- Fallback económico en producción: puede servir como modelo de respaldo para tareas simples en sistemas que enrutan peticiones según complejidad, reduciendo coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada según tamaño de archivo): F16 requiere unos 3,0 GB; Q8_0 en torno a 1,7 GB; Q4_K_M aproximadamente 1,0-1,1 GB; Q2_K alrededor de 0,7 GB.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. En GPU, cualquier modelo con 4 GB de VRAM o más (por ejemplo, GTX 1650, RTX 3050 o superiores) ejecuta todas las cuantizaciones con holgura.
- Cabe con comodidad en GPUs de consumo: prácticamente cualquier GPU moderna desde 4 GB de VRAM, e incluso solo con CPU y 4-8 GB de RAM en cuantizaciones de 4 bits o inferiores.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible; al ser un modelo de 1,5B, en CPU moderna se esperan velocidades de decodificación del orden de decenas de tokens por segundo, pero no hay cifras publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| isaacbot-GGUF (este) | 1,54B | no disponible | Apache 2.0 | GGUF | Fine-tune de Qwen2.5-Coder-1.5B con datos de razonamiento, Ultrachat y Dolly |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54B | 128K | Apache 2.0 (pesos), licencia Qwen de uso | Safetensors y GGUF comunitarios | Modelo base oficial, más probado y con benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 128K | Qwen Research (no comercial) | Safetensors y GGUF comunitarios | Generalista, no especializado en código, licencia más restrictiva |
| StableLM Zephyr 3B (stabilityai/stablelm-zephyr-3b) | 2,8B | 4K | no comercial (CC BY-NC-SA) | Safetensors y GGUF comunitarios | Mayor tamaño pero contexto corto y licencia no comercial |

## Limitaciones y advertencias

- El propio autor incluye un disclaimer: es un modelo de asistente de código y debe evaluarse antes de su uso en producción.
- No hay benchmarks publicados ni evaluaciones documentadas del fine-tuning, por lo que la calidad real respecto al modelo base es desconocida.
- Al ser un modelo de 1,5B, sus capacidades de razonamiento y generación de código son limitadas frente a modelos de 7B o superiores; puede cometer errores de sintaxis y alucinar APIs o librerías inexistentes.
- Cuantizaciones agresivas (Q3 y Q2_K) degradan notablemente la calidad, especialmente en generación de código.
- La longitud de contexto efectiva de este repositorio no está documentada; conviene verificarla en la configuración GGUF antes de usar contextos largos.
- Los idiomas soportados no están especificados en la model card; el modelo base Qwen2.5-Coder está centrado en inglés y código, con soporte multilingüe variable.
- La licencia Apache 2.0 no impone restricciones comerciales, pero conviene revisar los términos de la licencia de Qwen aplicables al modelo base.
- Repositorio de bajo alcance comunitario (378 descargas, 0 likes), sin auditoría externa ni historial de mantenimiento demostrado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tinyopsec/isaacbot-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Modelo original fine-tuned: https://huggingface.co/Isaacwienert/isaacbot
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Colección Qwen2.5-Coder: https://huggingface.co/Qwen
