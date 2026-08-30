# specklabs/Speck1.5-140M-GGUF

## Resumen

Speck1.5-140M-GGUF es una conversión a formato GGUF del modelo Speck1.5-140M, desarrollado por specklabs, un laboratorio centrado en la democratización de la IA mediante open source. Se trata de un modelo de lenguaje pequeño, con aproximadamente 140 millones de parámetros en su versión original, pensado para ejecutarse en entornos con recursos limitados, como CPU o GPUs de baja capacidad. La conversión a GGUF permite su uso con llama.cpp, Ollama y otras herramientas compatibles.

El modelo base emplea una arquitectura híbrida que alterna operadores de atención y convolución corta, implementada en el runtime LFM2 de llama.cpp. Aunque el tamaño es reducido, la conversión GGUF introduce adaptadores que elevan el número total de parámetros almacenados a 180.160.768, sin añadir capacidad real al modelo. La licencia MIT facilita su uso comercial y académico sin restricciones significativas. Su relevancia radica en ofrecer una alternativa ligera para tareas de generación de texto en dispositivos edge o como base para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención alternada con convolución corta (runtime LFM2) |
| Parametros totales | 180.160.768 (en el archivo GGUF; el modelo base declara 140M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (sin datos del modelo base) |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura de Speck1.5-140M combina operadores de atención y convolución corta de forma alternada. La conversión a GGUF realiza una transformación que pliega los adaptadores de entrada y salida (de 640 a 768 y de 768 a 640 dimensiones) en las capas de embedding, rellena con ceros los canales de convolución de 384 a 768 y ajusta los kernels causales de 3 taps a 5 taps mediante padding por la izquierda. Estas transformaciones preservan la función del modelo salvo por el redondeo habitual de cuantización. No se dispone de información sobre el proceso de entrenamiento, el volumen de datos, ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente, aunque su tamaño reducido limita la complejidad de las respuestas.
- No se documentan capacidades específicas de razonamiento, código, matemáticas o visión.
- No hay evidencia de soporte para tool calling o function calling.
- No se indica soporte para agentes o razonamiento multi-paso.
- Las capacidades multilingües no están especificadas.
- No se menciona modo de pensamiento extendido, visión ni audio.

## Casos de uso

- Prototipado rápido: al ser un modelo pequeño y ligero, permite validar pipelines de generación de texto en entornos de desarrollo sin necesidad de hardware especializado.
- Experimentación académica: su licencia MIT y tamaño reducido lo hacen adecuado para estudiar arquitecturas híbridas atención-convolución en cursos o proyectos de investigación.
- Aplicaciones en dispositivos edge: puede ejecutarse en CPUs o microcontroladores con suficiente memoria, por ejemplo para asistentes de texto simples o autocompletado local.
- Generación de texto en tiempo real: su baja latencia en hardware modesto permite respuestas rápidas en aplicaciones interactivas como chatbots básicos.
- Pruebas de cuantización: los distintos formatos GGUF (Q4_K_M, Q5_K_M, Q8_0) permiten evaluar el impacto de la cuantización en calidad y rendimiento.
- Integración en pipelines de llama.cpp: sirve como ejemplo de conversión y despliegue de modelos híbridos con el runtime LFM2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: aproximadamente 113 MB de peso, más overhead de contexto y activaciones; cabe en GPUs con 1 GB o menos.
  - Q8_0: aproximadamente 192 MB de peso, similar a lo anterior.
  - BF16: 361 MB, requiere al menos 512 MB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Jetson Nano, o integradas modernas). También puede ejecutarse en CPU con 4 GB de RAM.
- Cabe en GPUs de consumo como RTX 2060, RTX 3060, etc., sin problemas.
- Opciones de despliegue: llama.cpp (compatible con el formato GGUF), Ollama, llama-cpp-python, y servidores compatibles con GGUF como llama-server.
- Latencia y throughput: no hay datos oficiales, pero por el tamaño del modelo se esperan velocidades de decenas a cientos de tokens por segundo en CPU moderna y aún mayores en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Podría compararse con otros modelos pequeños como GPT-2 (124M) o TinyLlama (1.1B), pero no hay datos de rendimiento de Speck1.5-140M para establecer una comparación fiable.

## Limitaciones y advertencias

- Al ser un modelo de 140M de parámetros, su capacidad de razonamiento y generación de conocimiento es limitada comparada con modelos más grandes.
- Riesgo de alucinaciones y errores factuales, especialmente en temas especializados.
- No se ha documentado el contexto máximo soportado, por lo que se recomienda probar con secuencias cortas.
- No hay información sobre sesgos o comportamientos específicos; se aconseja evaluar el modelo en el dominio de uso antes de desplegarlo en producción.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo puede heredar sesgos de sus datos de entrenamiento, que no han sido publicados.
- La conversión GGUF introduce parámetros adicionales (adaptadores) que no aumentan la capacidad real; al cuantizar, se pueden perder prestaciones.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/specklabs/Speck1.5-140M-GGUF
- Modelo base: https://huggingface.co/specklabs/Speck1.5-140M
- Modelo instruct (versión anterior, Speck1-140M-Instruct): https://huggingface.co/specklabs/Speck1-140M-Instruct-GGUF
- Entrada en LLM Explorer (Speck1 140M Instruct): https://llm-explorer.com/model/specklabs%2FSpeck1-140M-Instruct,42bo3zsIoltvXtgS6xbaEa
