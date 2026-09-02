# zviratko/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp

## Resumen

El modelo `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ4e-mtp` es una cuantización mixta de 4 bits en formato MLX del fine-tune homónimo creado por DavidAU sobre la base Qwen3.8-27B de Alibaba. El repositorio lo publica el usuario zviratko y utiliza la herramienta oQ (oMLX v0.6.4) para aplicar cuantización de precisión mixta con un tamaño de grupo de 64, lo que reduce los 27.781.427.952 parámetros del modelo original a un peso de aproximadamente 17 GB, pensado para su ejecución eficiente en hardware Apple Silicon.

El modelo base Qwen3.8-27B es un transformer denso de arquitectura híbrida con atención lineal Gated DeltaNet en 48 de sus 64 capas, ventana de contexto nativa de 262.000 tokens (extensible a 1M) y un encoder de visión integrado. El fine-tune de DavidAU, desarrollado con contribuciones de Nightmedia, se orienta a seguir instrucciones, razonamiento, análisis, creatividad y generación de texto sin censura. Esta versión cuantizada mantiene las capacidades del fine-tune original en un formato optimizado para inferencia local en Mac.

La relevancia de este modelo radica en su combinación de un fine-tune especializado con cuantización eficiente, lo que permite ejecutar un modelo de 27B en equipos de consumo con Apple Silicon sin necesidad de GPUs de datacenter. Sin embargo, la ausencia de licencia declarada, la falta de datos de evaluación publicados y la nula adopción comunitaria limitan su uso en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso híbrido: 48 capas con atención lineal Gated DeltaNet y 16 con atención completa, basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, sin arquitectura MoE) |
| Longitud de contexto | 262.000 tokens nativo en el modelo base (extensible a 1M); no confirmado en esta cuantización |
| Tipos de cuantizacion | 4-bit (oQ mixed-precision, group size 64) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con tamaño oculto de 5.120 y un vocabulario de 248.320 tokens. Su arquitectura híbrida combina 48 capas con atención lineal Gated DeltaNet, que reduce el coste computacional frente a la atención completa, con 16 capas de atención full attention. Incluye además un vision tower de aproximadamente 1.000 millones de parámetros y un head de decodificación especulativa MTP (Multi-Token Prediction) integrado. Alibaba publicó el modelo bajo licencia Apache 2.0 como versión open-weight del flagship Qwen3.8-Max.

Sobre esta base, DavidAU aplicó el método de entrenamiento Cold Fusion, que combina las técnicas GAIN y Unsloth, con contribuciones de Nightmedia. Según la documentación del autor para variantes Cold Fusion, este método mantiene el 99% del rendimiento de BF16 tanto a 8 bits como a 4 bits. El fine-tune se orienta a la generación de texto sin censura, razonamiento, análisis y creatividad. La cuantización de este repositorio concreto se realizó con oMLX v0.6.4, que aplica cuantización de precisión mixta de 4 bits con un tamaño de grupo de 64, optimizada para el runtime MLX de Apple.

## Capacidades

- Generación de texto sin censura: el fine-tune elimina parcialmente los filtros de seguridad del modelo base, permitiendo generar contenido que los modelos alineados rechazarían.
- Seguimiento de instrucciones: entrenado para responder a instrucciones generales con formato de chat.
- Razonamiento y análisis: el modelo base Qwen3.8-27B destaca en tareas de razonamiento lógico y matemático, capacidad que se preserva en el fine-tune según las afirmaciones del autor.
- Creatividad y narrativa: orientado a tareas de escritura creativa y generación de historias.
- Capacidades del modelo base: al derivar de Qwen3.8-27B, hereda potencialmente el soporte de visión, decodificación especulativa MTP y ventana de contexto de 262K tokens, aunque no hay confirmación explícita de que estas capacidades se mantengan tras el fine-tune y la cuantización.
- Inferencia en Apple Silicon: el formato MLX permite ejecución nativa y eficiente en chips M-series.

## Casos de uso

- Prototipado rápido de aplicaciones conversacionales en Mac: al estar en formato MLX, se puede cargar directamente con el runtime de Apple para experimentar con un modelo de 27B sin necesidad de infraestructura en la nube.
- Generación de narrativa y escritura creativa: su orientación a creatividad y su falta de censura lo hacen adecuado para explorar estilos de escritura que modelos alineados limitan, como ficción con contenido adulto o diálogos provocadores.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de un modelo fine-tuneado sin filtros de seguridad frente al modelo base alineado, útil para investigar sesgos, alucinaciones y riesgos de los modelos "uncensored".
- Razonamiento y análisis de documentos con contexto largo: la ventana de contexto de 262K tokens del modelo base permite procesar documentos extensos, aunque se debe verificar que la cuantización no degrade esta capacidad.
- Desarrollo de agentes locales sin conexión: al ejecutarse en Apple Silicon, se puede desplegar un asistente local que no envía datos a servidores externos, relevante para entornos con requisitos de privacidad.
- Evaluación de cuantización de precisión mixta: sirve como caso de estudio para comparar el rendimiento de oQ frente a otras técnicas de cuantización (GGUF, AWQ, GPTQ) en modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta cuantización específica ni para el fine-tune TURBO-Fable-Cold-Fusion. La documentación del autor para la variante Cold Fusion GAIN V1.1 afirma que supera los benchmarks críticos de todos los Qwen 3.8, 3.6 y 3.5 de 27B, y que el método Cold Fusion mantiene el 99% del rendimiento de BF16 a 4 bits, pero no se proporcionan cifras concretas ni se puede extrapolar a esta variante concreta.

## Requisitos de hardware

- Formato MLX exclusivo para Apple Silicon; no es ejecutable directamente en GPUs NVIDIA o AMD.
- Tamaño del repositorio de 17 GB, lo que implica aproximadamente 14-15 GB de pesos en memoria a 4 bits, más overhead de runtime.
- Se recomienda un Mac con chip M2 Pro, M2 Max, M3 Pro, M3 Max o superior con al menos 32 GB de memoria unificada para una experiencia fluida; con 24 GB podría funcionar de forma ajustada.
- El runtime MLX permite ejecutar el modelo en CPU y GPU de Apple; la GPU integrada de los chips M-series es suficiente para inferencia a velocidad moderada.
- No hay datos publicados de latencia o throughput para esta cuantización concreta.
- Alternativas de despliegue: el ecosistema MLX incluye herramientas como mlx-lm y oMLX; no es compatible directamente con vLLM, llama.cpp u Ollama en su formato actual, aunque el modelo base está disponible en otros formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo oficial de Alibaba, alineado, con visión y MTP |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF | 27B | No disponible | No disponible | GGUF | Variante Cold Fusion de DavidAU en formato GGUF para llama.cpp |
| Este modelo (oQ4e-mtp) | 27,78B | No confirmado | No disponible | MLX safetensors | Cuantización 4-bit de la variante TURBO-Fable, para Apple Silicon |

La comparación directa con otras variantes Cold Fusion de DavidAU no es posible sin datos
