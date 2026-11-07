# xxvoidsxx/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una versión "decensored" (abliterada) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de razonamiento de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El autor de esta variante es xxvoidsxx y la modificación se ha realizado con Heretic v2.0.0.dev0, aplicando una técnica de ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 24 del transformer.

El modelo base concentra su señal de entrenamiento supervisado en matemáticas y resolución de problemas STEM (aproximadamente 250.000 muestras), preservando la eficiencia y la facilidad de despliegue de la clase de 9B parámetros. Esta variante hereda esas capacidades y añade una reducción drástica de rechazos: según la model card, pasa de 100/100 rechazos en el modelo original a 3/100 en esta versión, con una divergencia KL de 0,0422 respecto al original.

Es relevante ahora porque combina tres tendencias: la destilación de modelos de razonamiento grandes hacia tamaños desplegables en hardware consumer, la eliminación de mecanismos de rechazo mediante ablación de direcciones en el espacio de activaciones, y la disponibilidad de rutas de despliegue evaluadas (vLLM con NVFP4 y llama.cpp con MTP-Q8_0). Con 9.409.813.744 parámetros reales en safetensors y licencia Apache 2.0, se posiciona como una opción práctica para experimentación sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), con soporte de Multi-Token Prediction (MTP) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye MTP-Q8_0), NVFP4; otras no disponibles |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorio de terceros |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con 9B parámetros, afinado mediante destilación de las respuestas de DeepSeek-V4-Pro en modo Max Effect. El pipeline de entrenamiento combina SFT, RL y GSPO (Group Sequence Policy Optimization) según las etiquetas del repositorio, con un conjunto de aproximadamente 250.000 muestras centradas en matemáticas y razonamiento científico. La model card menciona además evaluación de Multi-Token Prediction (MTP) y cuantización NVFP4, lo que sugiere soporte para decodificación especulativa mediante predicción de múltiples tokens.

Sobre esta base, la variante heretic aplica Arbitrary-Rank Ablation (ARA) con los siguientes parámetros: índice de capa inicial 9, índice de capa final 24, peso de preservación de comportamiento bueno 0,8264, peso de direccionamiento de comportamiento malo 0,0003, peso relativo de sobrecorrección 0,9645 y número de vecinos 12. Esta técnica proyecta las activaciones fuera de la dirección asociada a los rechazos en un rango de capas intermedias, minimizando el daño colateral al resto de capacidades. El resultado reportado es una reducción de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 frente al modelo original.

## Capacidades

- Generación de texto y razonamiento multi-paso con descomposición explícita de problemas.
- Razonamiento matemático y resolución de problemas STEM, área principal del entrenamiento supervisado.
- Generación de código y uso de herramientas (tool calling / function calling), con mejoras pequeñas reportadas en programación y tool use pese a no recibir SFT específico de código.
- Soporte de agentes y razonamiento multi-turno.
- Capacidades multimodales de entrada: el pipeline declarado es image-text-to-text, lo que indica procesamiento de imágenes junto a texto.
- Multilingüe en inglés, chino, coreano, japonés, español y ruso.
- Modo de razonamiento (reasoning) heredado de la destilación de DeepSeek-V4-Pro.
- Comportamiento decensored: reducción drástica de rechazos según la evaluación del autor.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede descomponer problemas de cálculo, álgebra y demostraciones paso a paso, aprovechando las 250.000 muestras de entrenamiento centradas en matemáticas y STEM para generar explicaciones estructuradas.
- Generación de código en pipelines de CI/CD: al soportar tool calling y function calling, puede integrarse en flujos de revisión automática, generación de tests o corrección de errores, con la ventaja de su tamaño de 9B que permite despliegue en una sola GPU.
- Asistente de investigación científica: para resumir papers, plantear hipótesis o resolver problemas de física y química, gracias a la destilación de un profesor de razonamiento fuerte y al soporte multilingüe en seis idiomas.
- Procesamiento de documentos con imágenes: el pipeline image-text-to-text permite extraer y razonar sobre contenido de figuras, tablas o diagramas en artículos técnicos.
- Atención al cliente sin restricciones de contenido: en entornos donde se requiere gestionar consultas sensibles sin rechazos automáticos, la reducción de rechazos a 3/100 permite respuestas más directas, aunque requiere revisión humana por los riesgos asociados.
- Experimentación en alineación y seguridad: como caso de estudio de ablación ARA, sirve para investigar cómo la eliminación de direcciones de rechazo afecta a las capacidades generales con una divergencia KL medida de 0,0422.
- Despliegue en hardware consumer: con cuantización GGUF Q8_0 o NVFP4, puede ejecutarse en estaciones de trabajo con una sola GPU consumer para prototipos de agentes y asistentes locales.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18-19 GB en FP16/BF16 (tamaño del repo 18,8 GB); alrededor de 10 GB en cuantización Q8_0; unos 5-6 GB en Q4_K_M (estimación por tamaño de parámetros, no confirmada en la información disponible).
- GPU recomendadas: A100 40GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o Q8_0; RTX 3090/4080 para cuantizaciones Q8_0 y Q4.
- Cabe en GPU consumer: sí, en RTX 4090/3090 con cuantización Q8_0 o inferior; en GPUs de 8-12 GB con cuantizaciones Q4 o menores.
- Opciones de despliegue: vLLM (evaluado con NVFP4), llama.cpp (evaluado con MTP-Q8_0), transformers, text-generation-inference; Ollama no confirmado en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante abliterada, 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,4B | no disponible | Apache 2.0 | Modelo base, 100/100 rechazos |
| Qwen3.5-9B (base original) | ~9B | no disponible | no disponible | Modelo de partida sin destilación de DeepSeek |
| Otros fine-tunes de razonamiento de 9B | ~9B | variable | variable | No disponible en la información proporcionada |

## Limitaciones y advertencias

- La ablación de rechazos elimina barreras de seguridad: el modelo puede generar contenido dañino, ilegal o NSFW, por lo que no es adecuado para despliegues públicos sin filtros externos.
- La divergencia KL de 0,0422 indica un cambio medible en la distribución de salida respecto al original; puede haber degradación sutil en tareas fuera de matemáticas y STEM.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento, especialmente en dominios no cubiertos por las 250.000 muestras de entrenamiento.
- Longitud de contexto no documentada en la información disponible; no se debe asumir una ventana larga sin verificación.
- El modelo se distribuye como fine-tune de terceros con 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo abliterado en producción.
- La model card original contiene HTML extenso y promocional; parte de la información técnica del modelo base puede estar incompleta o no verificada.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/xxvoidsxx/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Hugging Face (espejo): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- GGUF (terceros): https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Heretic: https://heretic-project.org
