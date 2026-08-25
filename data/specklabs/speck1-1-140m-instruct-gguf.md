# specklabs/Speck1.1-140M-Instruct-GGUF

## Resumen

Speck1.1-140M-Instruct-GGUF es la versión en formato GGUF del modelo Speck1.1-140M-Instruct, desarrollado por specklabs. Se trata de un modelo de lenguaje pequeño de aproximadamente 140,7 millones de parámetros, ajustado mediante instrucciones en inglés y diseñado para tareas conversacionales. Su arquitectura es híbrida: intercala bloques de atención global con group-query attention (GQA) y bloques de convolución causal gated, una combinación poco habitual en modelos de esta escala.

La relevancia de esta versión GGUF radica en su compatibilidad directa con el ecosistema llama.cpp, lo que permite ejecutar el modelo en CPU, GPU o dispositivos de bajo consumo con un footprint de memoria mínimo. La conversión a GGUF introduce adaptadores de entrada y salida que elevan el número total de parámetros almacenados a 180.165.376, aunque el README aclara que esta transformación no añade capacidad al modelo original. El proyecto se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: attention global con grouped-query attention (GQA) + convolución causal gated |
| Parametros totales | 180.165.376 (en el archivo GGUF); 140,7M en el modelo fuente |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Inglés (según la documentación del modelo base; no especificado en la model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Speck1.1-140M-Instruct se inicializó a partir de Speck1-140M, un modelo híbrido que intercala atención global con GQA y convoluciones causales con gating (gated causal convolution). Este diseño combina la capacidad de modelado de dependencias largas de la atención con la eficiencia computacional de la convolución, lo que resulta especialmente interesante para modelos de pequeño tamaño que deben operar en entornos con recursos limitados.

El ajuste fino se realizó de forma completa (full fine-tuning) durante una época sobre el conjunto de datos SpeckChat1, orientado a conversación. La conversión a GGUF aplica transformaciones específicas: los adaptadores de entrada y salida de 640 dimensiones se pliegan en las embeddings, los canales de convolución de 384 se rellenan con ceros hasta 768, y los kernels causales de 3 taps se rellenan a la izquierda hasta 5 taps. Estas operaciones preservan la función del modelo salvo redondeos normales de coma flotante y cuantización.

## Capacidades

- Generación de texto conversacional en inglés, optimizada para diálogos de instrucción.
- Razonamiento básico de lenguaje natural para tareas simples y de baja complejidad.
- Soporte de ejecución local en CPU y GPU mediante llama.cpp, con integración sencilla en aplicaciones de línea de comandos o mediante la API de llama.cpp.
- Compatible con herramientas de la familia llama.cpp (llama-cli, llama-server) y con el formato GGUF estándar.
- No se han documentado capacidades de tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- **Prototipado rápido de chatbots**: al ser un modelo muy pequeño (112 MB en Q4_K_M), permite montar un asistente conversacional local en minutos, ideal para validar conceptos de UX o flujos de diálogo antes de escalar a modelos mayores.
- **Aplicaciones de edge y dispositivos embebidos**: su tamaño reducido y su ejecución en CPU lo hacen adecuado para Raspberry Pi, routers o dispositivos IoT que necesiten generación de texto básica.
- **Educación y aprendizaje**: sirve como ejemplo práctico para estudiar la arquitectura híbrida atención-convolución, el proceso de conversión a GGUF y la cuantización, sin necesidad de infraestructura GPU.
- **Pruebas de pipeline de inferencia**: ideal para verificar el funcionamiento de integraciones con llama.cpp, Ollama o bibliotecas de terceros, usando un modelo que carga en menos de 200 MB.
- **Bots de preguntas frecuentes**: puede gestionar consultas simples sobre documentación o FAQs, respondiendo con plantillas o resumiendo información corta, siempre que se le proporcionen los datos relevantes en el contexto.
- **Automatización de tareas de texto triviales**: clasificación básica de texto, extracción de entidades simples o generación de respuestas cortas, con un coste de inferencia muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros estándares para este modelo, por lo que no es posible comparar su rendimiento cuantitativo con alternativas de su tamaño.

## Requisitos de hardware

- **VRAM estimada**: menos de 200 MB para el archivo Q4_K_M (112,9 MB), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM y también en CPU sin GPU.
- **GPUs recomendadas**: cualquier GPU moderna de consumo (NVIDIA GTX 1060 o superior, AMD RX 6000 o superior) es suficiente; no se requiere una tarjeta de servidor.
- **Compatibilidad**: ejecutable en CPU pura mediante llama.cpp, sin necesidad de aceleración gráfica.
- **Opciones de despliegue**: llama.cpp (CLI o servidor), Ollama, integración con bibliotecas de Python como llama-cpp-python o gguf-python, y compatibilidad con el runtime LFM2 de llama.cpp.
- **Latencia y throughput**: no se han publicado datos oficiales, pero dada la escala (180M parámetros) se puede esperar una inferencia de decenas de tokens por segundo en CPU moderna y varios cientos en GPU de consumo.

## Comparativa con modelos similares

No disponible. No se dispone de información comparativa con modelos de la misma categoría (por ejemplo, TinyLlama-1.1B, Qwen2.5-0.5B o SmolLM-135M) en términos de benchmarks o rendimiento. El único dato conocido es que Speck1.1-140M-Instruct parte de una arquitectura híbrida poco común en este rango de parámetros.

## Limitaciones y advertencias

- **Capacidad limitada**: con 140M parámetros, el modelo no puede abordar tareas complejas de razonamiento, generación de código extenso o matemáticas avanzadas.
- **Riesgo de alucinación**: en tareas abiertas puede producir respuestas plausibles pero incorrectas, especialmente sin un contexto claro.
- **Idioma**: la información disponible indica entrenamiento en inglés; su rendimiento en otros idiomas es incierto y probablemente deficiente.
- **Contexto no especificado**: se desconoce la longitud máxima de contexto, lo que obliga a probar experimentalmente antes de desplegar en producción.
- **Sesgos**: no se han documentado sesgos específicos, pero como todo modelo entrenado en datos web, puede reflejar sesgos presentes en el corpus.
- **Limitaciones de la conversión**: la transformación a GGUF introduce redondeos de cuantización y padding; la fidelidad respecto al modelo original depende de la cuantización elegida (BF16 es la más fiel).
- **Sin garantías de producción**: al ser un modelo muy pequeño y sin benchmarks publicados, no se recomienda para aplicaciones críticas sin validación previa exhaustiva.

## Enlaces

- [Speck1.1-140M-Instruct-GGUF en HuggingFace](https://huggingface.co/specklabs/Speck1.1-140M-Instruct-GGUF)
- [Speck1.1-140M-Instruct (modelo base) en HuggingFace](https://huggingface.co/specklabs/Speck1.1-140M-Instruct)
- [Documentación de GGUF en HuggingFace](https://huggingface.co/docs/hub/gguf)
- [Repositorio de conversión de IBM para GGUF](https://github.com/IBM/gguf)
- No se han encontrado papers, blogs o demos específicos del modelo en la búsqueda web realizada.
