# sulabhkatiyar/en-indic-translate-2b

## Resumen

El modelo `sulabhkatiyar/en-indic-translate-2b` es un modelo de traducción automática neuronal especializado en traducir texto del inglés a once idiomas índicos: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, punyabí, tamil y telugu. Desarrollado por Sulabh Katiyar, se trata de un fine-tuning del modelo base `google/gemma-4-E2B-it` de Google, que pertenece a la familia Gemma 4. El modelo está diseñado para preservar fórmulas LaTeX, bloques de código y la estructura general de documentos técnicos durante la traducción, lo que lo hace especialmente útil para contenido científico, académico y de ingeniería.

Con 5.104.297.504 parámetros totales (el nombre "2B" sugiere que podría tener 2 mil millones de parámetros activos, aunque no se confirma), el modelo se distribuye en formato safetensors y se puede cargar con la librería transformers o con vLLM. Su licencia es la de Gemma, que permite uso comercial bajo ciertas condiciones. Aunque el modelo se publicó en septiembre de 2026, no registra descargas ni valoraciones en HuggingFace, lo que indica que es un lanzamiento reciente y poco probado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Google Gemma 4 E2B) |
| Parametros totales | 5.104.297.504 (5,1 B) |
| Parametros activos | no disponible (el nombre "2B" sugiere 2 B, sin confirmar) |
| Longitud de contexto | 32 768 tokens (según ejemplo de vLLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, as, bn, gu, hi, kn, ml, mr, or, pa, ta, te |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 de Google. Gemma 4 E2B es un modelo multimodal (imagen-texto a texto) que, por su nombre, probablemente emplea una arquitectura de mezcla de expertos (MoE) con 2 mil millones de parámetros activos y un total de 5,1 mil millones. Sin embargo, no se dispone de documentación oficial detallada sobre la arquitectura interna del modelo base en la información proporcionada.

El proceso de entrenamiento consistió en un fine-tuning del modelo base para la tarea específica de traducción inglés-índico. No se especifican los datos de entrenamiento, el número de tokens utilizados ni el método de alineación (RLHF, DPO, etc.). La model card indica que el modelo fue desarrollado y probado en GPUs AMD MI300X con ROCm, lo que sugiere que el entrenamiento se realizó en ese entorno. No se mencionan innovaciones técnicas adicionales más allá de la preservación de fórmulas LaTeX y bloques de código durante la traducción.

## Capacidades

- Traducción de inglés a 11 idiomas índicos: asamés, bengalí, guyaratí, hindi, canarés, malayalam, maratí, oriya, punyabí, tamil y telugu.
- Preservación de fórmulas LaTeX, bloques de código y estructura de documentos (títulos, listas, etc.) en la salida traducida.
- Generación de texto en formato conversacional, compatible con el chat template de transformers.
- Soporte para inferencia con vLLM, lo que permite despliegue en producción con alto rendimiento.
- No se menciona soporte explícito para tool calling, agentes o razonamiento multi-paso.
- Capacidad multilingüe limitada a los 11 idiomas índicos de destino, con inglés como idioma de origen.

## Casos de uso

- Traducción de documentación técnica y científica: el modelo puede traducir artículos, manuales y guías que contengan fórmulas matemáticas en LaTeX, manteniendo la notación intacta. Es adecuado para equipos de investigación que necesitan versiones en hindi, tamil o bengalí de documentos técnicos.
- Localización de software y aplicaciones: permite traducir cadenas de interfaz, mensajes de error y documentación de API a múltiples idiomas índicos, preservando bloques de código y ejemplos de uso.
- Traducción de contenido académico: tesis, papers y apuntes de clase con ecuaciones y algoritmos pueden traducirse sin perder la estructura matemática, útil para universidades y plataformas educativas en India.
- Generación de contenido multilingüe para blogs y sitios web: creadores de contenido pueden traducir artículos técnicos a varios idiomas índicos de una sola vez, manteniendo la coherencia del formato.
- Traducción de documentación de código abierto: proyectos de software pueden ofrecer sus README, guías de contribución y documentación de API en 11 idiomas índicos, aumentando su accesibilidad.
- Asistencia en atención al cliente técnica: el modelo puede integrarse en sistemas de soporte para traducir consultas y respuestas entre inglés y los idiomas índicos, aunque su enfoque en contenido técnico lo hace más adecuado para dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de traducción (BLEU, chrF) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5,1 B parámetros en bfloat16, se necesitan aproximadamente 10,2 GB de VRAM solo para los pesos. Con cuantización a 8 bits (~5,1 GB) o 4 bits (~2,6 GB) se reduce el requisito, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: el modelo fue probado en AMD MI300X (con ROCm). Para NVIDIA, se recomienda al menos una RTX 3090 o RTX 4090 (24 GB VRAM) para ejecutar en bfloat16 sin problemas. GPUs con 16 GB (RTX 4080, A10G) pueden funcionar con cuantización.
- En consumer GPU: sí, cabe en GPUs de 16 GB o más con cuantización, y en 24 GB sin cuantizar.
- Opciones de despliegue: vLLM (recomendado para producción), HuggingFace transformers, y potencialmente llama.cpp si se generan pesos GGUF (no incluidos por defecto).
- Latencia y throughput: no se proporcionan datos. Con vLLM y una GPU moderna, se espera un throughput de decenas de tokens por segundo para un modelo de 5 B, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de traducción índica. Existen alternativas como IndicTrans2 (de AI4Bharat) o modelos multilingües como NLLB-200, pero no se tienen datos de rendimiento comparables en la información proporcionada. Se recomienda evaluar el modelo frente a estas alternativas en el caso de uso concreto antes de adoptarlo en producción.

## Limitaciones y advertencias

- El modelo fue desarrollado y probado exclusivamente en GPUs AMD MI300X con ROCm. Es posible que se requieran ajustes de versiones de paquetes para entornos NVIDIA CUDA, lo que puede afectar a la reproducibilidad.
- No se han publicado datos de entrenamiento ni métricas de calidad, por lo que el rendimiento real en tareas de traducción es desconocido.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar traducciones incorrectas o inventar contenido, especialmente en idiomas con menos representación.
- La licencia Gemma impone restricciones de uso comercial: es necesario revisar los términos de la licencia de Google para asegurar el cumplimiento, especialmente en aplicaciones empresariales.
- El modelo solo traduce de inglés a los 11 idiomas índicos; no soporta traducción inversa (índico a inglés) ni otros pares de idiomas.
- No se menciona soporte para tool calling ni funciones de agente, por lo que no es adecuado para tareas que requieran interacción con APIs externas.
- El repositorio no tiene descargas ni valoraciones, lo que indica una adopción nula hasta la fecha y una validación comunitaria inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sulabhkatiyar/en-indic-translate-2b
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
