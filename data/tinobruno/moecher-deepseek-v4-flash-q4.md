# TinoBruno/moecher-deepseek-v4-flash-q4

## Resumen

Este repositorio contiene una cuantización INT4 de los pesos densos de **DeepSeek V4 Flash**, optimizada para ejecutarse en GPUs con 8 GB de VRAM mediante el **Moecher Inference Engine**. El autor, TinoBruno, publica un único archivo binario (`attention_dense_layers_q4.bin`, ~3,9 GB) junto con un manifiesto de configuración, lo que permite cargar el modelo en hardware de consumo sin necesidad de servidores dedicados.

La relevancia de esta publicación radica en que DeepSeek V4 Flash es un modelo MoE de gran tamaño (284B parámetros en su versión original), y su cuantización a 4 bits con densificación de los expertos permite su despliegue local en tarjetas gráficas de gama media. El formato de pesos es propietario de Moecher, por lo que no es compatible con runtimes estándar como vLLM u Ollama. La licencia MIT facilita su uso comercial, aunque el soporte de idiomas se limita a inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida CSA+HCA (modelo original); versión densa cuantizada |
| Parametros totales | No disponible (modelo original: 284B MoE) |
| Parametros activos | No disponible (versión densa, sin MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4 (q4) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | Binario propietario de Moecher (`.bin`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla el proceso de cuantización ni los datos de entrenamiento. Según la documentación del modelo original (DeepSeek V4 Flash), este emplea una arquitectura MoE con atención híbrida CSA (Cross-Scale Attention) y HCA (Hybrid Chunk Attention), junto con hyper-connections con restricciones de manifold y un sistema de razonamiento en tres niveles (Non-think / Think High / Think Max). Sin embargo, esta versión cuantizada se describe como "dense", lo que sugiere que los pesos de los expertos se han fusionado en una única matriz densa antes de la cuantización a 4 bits. No se especifican los detalles de calibración, el dataset utilizado para la cuantización ni si se aplicaron técnicas de fine-tuning posterior.

## Capacidades

- Generación de texto en inglés y chino, con capacidades de razonamiento y comprensión de instrucciones propias del modelo base.
- Razonamiento en tres niveles (Non-think / Think High / Think Max) según la arquitectura original, aunque no se confirma si esta cuantización conserva dicha funcionalidad.
- Soporte de código y matemáticas, heredado del modelo DeepSeek V4 Flash, aunque no hay benchmarks específicos para esta versión.
- No se documenta soporte de tool calling, function calling ni capacidades multimodales en esta cuantización.
- El formato Moecher permite ejecución en GPUs de 8 GB VRAM con caché de DRAM para pesos fuera de VRAM.

## Casos de uso

- **Inferencia local en hardware de consumo**: ideal para desarrolladores que necesitan ejecutar un modelo de gran tamaño en una GPU de 8 GB (p. ej., RTX 3060, RTX 4060) sin depender de servicios en la nube, gracias a la cuantización INT4 y al motor Moecher.
- **Prototipado rápido de aplicaciones de chat**: se puede integrar en entornos de desarrollo para probar asistentes conversacionales en inglés o chino, con la ventaja de la licencia MIT para uso comercial.
- **Generación de código en entornos aislados**: al ser un modelo denso cuantizado, puede utilizarse en pipelines de CI/CD locales para autocompletar o revisar código, siempre que el volumen de peticiones sea moderado.
- **Investigación académica**: permite experimentar con modelos de razonamiento de gran escala en laboratorios con recursos limitados, sin necesidad de clústeres de GPUs.
- **Aplicaciones de procesamiento de lenguaje natural en chino e inglés**: útil para tareas de traducción, resumen o análisis de sentimiento en estos dos idiomas, con la ventaja de ejecutarse en un solo equipo.
- **Despliegue en edge computing**: el bajo requisito de VRAM (8 GB) y el uso de caché DRAM (64 GB recomendados) lo hacen apto para servidores con GPUs modestas o estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos para esta cuantización específica.

## Requisitos de hardware

- **VRAM**: 8 GB (según el tag del repositorio). El comando de ejemplo usa `--max-vram 6`, lo que sugiere que reserva 6 GB para el modelo y deja margen para el runtime.
- **DRAM**: se recomienda al menos 64 GB de RAM para la caché de pesos (`--dram-cache-gb 64`), lo que implica que los pesos se cargan dinámicamente desde RAM a VRAM.
- **GPU recomendadas**: cualquier GPU con 8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070, etc.). No se especifican requisitos de arquitectura (CUDA, ROCm).
- **Despliegue**: exclusivamente mediante el ejecutable `moecher.exe` con el manifiesto JSON proporcionado. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. Dependerán del ancho de banda de la memoria del sistema y de la velocidad de transferencia PCIe.

## Comparativa con modelos similares

No se dispone de información comparativa con otras cuantizaciones o modelos equivalentes. El repositorio no incluye benchmarks ni referencias a alternativas. Se puede señalar que existe otra variante del mismo autor (`TinoBruno/moecher-deepseek-v4-flash-iq2`) con cuantización IQ2_XXS y formato MoE, pero no se proporcionan datos de rendimiento para comparar.

## Limitaciones y advertencias

- **Formato propietario**: los pesos solo son utilizables con el motor Moecher; no se pueden convertir a safetensors o GGUF sin herramientas adicionales no documentadas.
- **Idiomas limitados**: solo inglés y chino; no hay soporte para otros idiomas, incluido el español.
- **Riesgo de degradación por cuantización**: la cuantización INT4 puede afectar la precisión en tareas de razonamiento complejo o generación de código, aunque no se han publicado evaluaciones.
- **Funcionalidades no confirmadas**: el razonamiento de tres niveles, tool calling y otras capacidades del modelo original no están verificadas en esta versión cuantizada.
- **Requisitos de RAM elevados**: aunque la VRAM es de 8 GB, se necesitan 64 GB de RAM para la caché, lo que puede ser un obstáculo en equipos con poca memoria.
- **Licencia**: MIT permite uso comercial, pero se recomienda revisar la licencia del modelo base DeepSeek V4 Flash para asegurar compatibilidad, aunque DeepSeek publica sus modelos bajo MIT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TinoBruno/moecher-deepseek-v4-flash-q4
- Variante IQ2 del mismo autor: https://huggingface.co/TinoBruno/moecher-deepseek-v4-flash-iq2
- Modelo original DeepSeek V4 Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- Guía de DeepSeek V4 (agosto 2026): https://codersera.com/blog/deepseek-v4-complete-guide-2026/
- Recetas vLLM para DeepSeek V4 Flash: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash
