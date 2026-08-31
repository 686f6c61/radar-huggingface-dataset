# Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-GPTQ

## Resumen

Este repositorio contiene una versión cuantizada **W4A16** (pesos de 4 bits, activaciones de 16 bits) del modelo **Qwen3.8-2B-Distill** desarrollado por Empero AI, que a su vez es una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B. La cuantización ha sido realizada por Vishva007 utilizando el algoritmo **Intel AutoRound**, con el objetivo de reducir drásticamente los requisitos de VRAM para permitir la inferencia local en GPUs de consumo y dispositivos edge.

El modelo resultante conserva las capacidades multimodales (entrada de imagen y texto) y de razonamiento del modelo original, incluyendo los bloques de pensamiento (`thinking`) y la predicción multi-token (MTP), gracias a una calibración cuidadosa que mantiene la torre de visión y los módulos MTP en bfloat16 nativo. Con aproximadamente 2.2 mil millones de parámetros, la versión cuantizada requiere entre 2.5 y 3.5 GB de VRAM, frente a los 8-10 GB del modelo en BF16, lo que lo hace viable en GPUs de 4 GB o 6 GB, portátiles y dispositivos de borde.

La relevancia de este modelo radica en que democratiza el acceso a un LLM multimodal con capacidades de razonamiento avanzado en hardware modesto, manteniendo una fidelidad de reconstrucción alta gracias a un group size de 32 y 1000 iteraciones de ajuste. Está disponible en tres formatos (AutoRound, AutoGPTQ y LLM-Compressor/Compressed-Tensors) para adaptarse a diferentes motores de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-2B (destilacion de Qwen3.8 2.4T A95B), multimodal imagen-texto |
| Parametros totales | 2.213.241.664 (~2.2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (calibracion con seqlen 4096; ejemplo de vLLM con max-model-len 8192) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), group size 32, simetrico; torre de vision y MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien GPTQ, AutoRound y Compressed-Tensors segun variante) |

## Arquitectura y entrenamiento

El modelo base, **Qwen3.8-2B-Distill**, es una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B (un modelo de mezcla de expertos de gran escala) sobre la arquitectura densa Qwen3.5-2B, entrenado con el mismo currículo que sus hermanos mayores de la familia Qwen3.8. Esto implica que hereda las capacidades de razonamiento, visión y generación de texto del modelo grande, pero con un coste computacional mucho menor. La arquitectura Qwen3.5-2B incorpora Multi-Token Prediction (MTP), que permite predecir varios tokens a la vez, mejorando la eficiencia de decodificación.

La cuantización se realizó con **Intel AutoRound**, un algoritmo de cuantización de baja precisión que optimiza los pesos mediante un proceso iterativo de reconstrucción. Los parámetros clave del proceso son: group size de 32 para una reconstrucción fina, calibración con 512 muestras a longitud de secuencia 4096, y 1000 iteraciones de ajuste para preservar la fidelidad de los bloques de razonamiento (`thinking`) y las capacidades multimodales. La torre de visión (`quant_nontext_module=False`) y los módulos MTP (`mtp`, `mtp.fc`) se mantienen en bfloat16 nativo para no degradar la precisión en tareas de razonamiento visual y OCR.

## Capacidades

- **Generación de texto y razonamiento**: soporta cadenas de pensamiento extensas (`thinking` blocks) para tareas de razonamiento complejo.
- **Visión multimodal**: entrada de imagen y texto (pipeline `image-text-to-text`), con torre de visión en BF16 para preservar precisión en OCR y razonamiento visual.
- **Predicción multi-token (MTP)**: decodificación más rápida al predecir varios tokens simultáneamente.
- **Conversación multi-turno**: diseñado para diálogos sostenidos con contexto.
- **Tool calling / function calling**: probablemente soportado al ser un modelo de la familia Qwen3.8, aunque no se menciona explícitamente en la documentación del repositorio.
- **Capacidades de agente**: la familia Qwen3.8 destaca en tareas de codificación agéntica, según la documentación de Unsloth.

## Casos de uso

- **Inferencia local en GPUs de consumo**: con 2.5-3.5 GB de VRAM, el modelo puede ejecutarse en GPUs como la GTX 1650 (4 GB), RTX 3050 (6 GB) o incluso en iGPUs modernas, permitiendo asistentes de IA privados sin conexión.
- **Asistentes multimodales en dispositivos edge**: su capacidad de procesar imágenes y texto lo hace adecuado para aplicaciones de asistencia visual en móviles o dispositivos IoT, donde el ancho de banda y la memoria son limitados.
- **OCR y extracción de información de documentos**: la torre de visión en BF16 preserva la precisión en reconocimiento de texto en imágenes, útil para digitalizar facturas, formularios o capturas de pantalla.
- **Razonamiento con cadena de pensamiento en entornos con recursos limitados**: los bloques `thinking` permiten resolver problemas de lógica y matemáticas sin necesidad de un servidor potente, ideal para aplicaciones educativas o de soporte técnico.
- **Prototipado rápido de aplicaciones LLM**: al ser ligero y con licencia Apache 2.0, permite iterar rápidamente en entornos de desarrollo sin incurrir en costes de GPU en la nube.
- **Despliegue en pipelines de CI/CD para generación de código**: aunque no se documenta explícitamente, la familia Qwen3.8 destaca en codificación agéntica; este modelo cuantizado puede integrarse en entornos de integración continua para autocompletar o revisar código con un consumo de recursos mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, ni comparaciones con el modelo original en términos de degradación de precisión tras la cuantización. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- **VRAM estimada**: 2.5-3.5 GB para inferencia con contexto completo, según la model card. El modelo original en BF16 requiere 8-10 GB.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.). También puede ejecutarse en portátiles con GPUs integradas de gama media y en dispositivos edge con aceleradores NPU.
- **Opciones de despliegue**: vLLM (compatible con el formato GPTQ, como se muestra en el ejemplo de la model card), y presumiblemente llama.cpp, Ollama y TGI si se convierten los pesos a GGUF u otros formatos.
- **Latencia y throughput**: la cuantización W4A16 reduce la presión sobre el ancho de banda de memoria, lo que acelera la generación de tokens durante razonamientos largos. No se proporcionan cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | VRAM (cuantizado) | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2B-Distill (BF16) | 2.2B | no disponible | 8-10 GB | Apache 2.0 | Modelo original sin cuantizar |
| Qwen3.8-2B-Distill (W4A16, este) | 2.2B | no disponible | 2.5-3.5 GB | Apache 2.0 | Cuantizado con AutoRound |
| Qwen3.8-27B | 27B | 256K | 17 GB (según Unsloth) | Apache 2.0 | Modelo mayor de la familia, con visión y razonamiento |

No se dispone de datos de benchmarks para comparar el rendimiento de este modelo cuantizado con otras alternativas de 2B (como Llama-3.2-3B o Gemma-2-2B) en tareas específicas. La comparativa se limita a aspectos de recursos y disponibilidad.

## Limitaciones y advertencias

- **Degradación por cuantización**: aunque AutoRound con group size 32 y 1000 iteraciones minimiza la pérdida, la cuantización W4A16 puede introducir errores en tareas de precisión numérica o razonamiento matemático complejo.
- **Contexto no especificado**: no se ha publicado la longitud de contexto máxima del modelo base; la calibración se realizó con 4096 tokens y el ejemplo de vLLM usa 8192, pero no hay garantía oficial de soporte más allá de esos valores.
- **Idiomas no documentados**: no se indica qué idiomas soporta el modelo, aunque al derivar de Qwen3.8 probablemente cubra múltiples lenguas, incluyendo chino e inglés.
- **Modelo sin adopción**: el repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; se recomienda probarlo exhaustivamente antes de usarlo en producción.
- **Riesgo de alucinación**: como todo LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento extendido.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base y la cuantización dependen de terceros (Empero AI, Intel, Qwen Team) cuyas condiciones deben revisarse.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-GPTQ)
- [Modelo base: empero-ai/Qwen3.8-2B-Distill](https://huggingface.co/empero-ai/Qwen3.8-2B-Distill)
- [GitHub de la familia Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Documentación de Unsloth sobre Qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
- [Ficha del modelo en LLM Explorer](https://llm-explorer.com/model/empero-ai%2FQwen3.8-2B-Distill,3TlLgEP23RPu4OPKG5EMyl)
- [Intel AutoRound (framework de cuantización)](https://github.com/intel/auto-round)
