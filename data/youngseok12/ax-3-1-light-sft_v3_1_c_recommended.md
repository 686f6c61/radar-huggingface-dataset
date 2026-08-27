# youngseok12/AX-3.1-Light-sft_v3_1_C_recommended

## Resumen

El modelo `youngseok12/AX-3.1-Light-sft_v3_1_C_recommended` es un ajuste fino (SFT) del modelo coreano `skt/A.X-3.1-Light`, desarrollado por el usuario youngseok12. Se trata de un modelo de generación de texto de 7.264 millones de parámetros, entrenado mediante LoRA y posterior fusión de los adaptadores en los pesos base, lo que da como resultado un modelo independiente en formato BF16. Su propósito principal es la investigación y evaluación controlada en coreano, con un enfoque en dominios especializados como derecho civil, penal y administrativo, normas contables, conocimiento médico y valoración tecnológica.

La relevancia de este modelo radica en su especialización en tareas de razonamiento y conocimiento experto en coreano, combinando datos de instrucción de alta calidad con ejemplos de razonamiento (CoT). Aunque no se publican benchmarks en la ficha, el modelo está diseñado para competir en el K-AI Leaderboard, un referente para modelos coreanos. Su licencia Apache 2.0 y su compatibilidad con vLLM lo hacen accesible para despliegues en producción, siempre que se respeten los términos de los datos de entrenamiento de AI Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sin cambios respecto al modelo base `skt/A.X-3.1-Light`) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (entrenado con secuencias de 2048 tokens) |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base `skt/A.X-3.1-Light`, un transformer decoder-only de 7B parámetros, aunque no se especifican detalles adicionales (número de capas, heads, etc.). El proceso de entrenamiento consistió en un ajuste fino supervisado (SFT) mediante LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. Se utilizó una época, learning rate de 3e-5 con scheduler coseno y warmup del 3%, weight decay de 0.01, gradiente máximo de 1.0, batch efectivo de 32 y precisión BF16. El empaquetado de secuencias estuvo desactivado y la longitud máxima de secuencia fue de 2048 tokens.

Los datos de entrenamiento incluyen 36.000 ejemplos de entrenamiento y 3.000 de desarrollo (derivados de la validación de AI Hub), con separación a nivel de fuente y verificación de duplicados exactos. Las fuentes abarcan instrucción en derecho civil, penal y administrativo, normas contables corporativas, conocimiento médico esencial, lectura automática de noticias y datos de valoración tecnológica CoT-Fabric. Se combinaron 23.450 ejemplos no razonados, 550 ejemplos razonados y 12.000 ejemplos adicionales de AI Hub, resultando en un 23,64% de tokens de asistente dedicados a razonamiento. No se utilizaron benchmarks públicos como KMMLU-Pro, CLIcK, HLE, SNU Ko-MuSR, Com2-main o MuSR como datos de SFT.

## Capacidades

- Generación de texto en coreano con especialización en dominios legales, contables, médicos y de valoración tecnológica.
- Razonamiento paso a paso (chain-of-thought) gracias a la inclusión de ejemplos de razonamiento en el entrenamiento.
- Respuesta a preguntas de conocimiento experto en los ámbitos mencionados, con un enfoque en instrucciones de alta calidad.
- Compatible con el chat template oficial del tokenizador A.X, lo que facilita su uso en conversaciones multi-turno.
- No se mencionan capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Asistencia legal en coreano: el modelo puede responder consultas sobre derecho civil, penal y administrativo, ayudando a abogados o estudiantes a redactar borradores de argumentos o resumir normativas. Su entrenamiento en estos dominios lo hace adecuado para tareas de extracción de información y generación de respuestas estructuradas.
- Soporte contable y financiero: dado su entrenamiento en normas contables corporativas, puede utilizarse para explicar principios contables, generar informes de cumplimiento o responder preguntas sobre estándares específicos, siempre con supervisión humana.
- Educación médica básica: el modelo puede proporcionar información general sobre conceptos médicos esenciales, útil para estudiantes o personal sanitario en formación, aunque no debe sustituir el juicio clínico profesional.
- Análisis de noticias y resumen: gracias a los datos de lectura automática de noticias, puede resumir artículos periodísticos en coreano o extraer hechos clave, facilitando tareas de monitorización de medios.
- Valoración tecnológica: con los datos CoT-Fabric, puede asistir en la evaluación de tecnologías, generando análisis razonados sobre el valor de activos intangibles o patentes.
- Investigación académica en procesamiento del lenguaje coreano: el modelo sirve como punto de partida para experimentos de fine-tuning o evaluación en tareas de razonamiento y conocimiento especializado, dado su diseño para el K-AI Leaderboard.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 14,5 GB de pesos, por lo que se recomienda al menos 16 GB de VRAM para cargar el modelo completo con overhead de activaciones y caché de atención.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs con 16 GB o más, como RTX 4080 o A10G.
- En consumer GPU: cabe en tarjetas de 16 GB o más, como la RTX 4080/4090, pero no en GPUs de 8 GB (como RTX 3060) sin cuantización adicional.
- Opciones de despliegue: compatible con vLLM para inferencia optimizada y con la librería transformers de Hugging Face. También puede ejecutarse con llama.cpp si se convierte a GGUF, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no se proporcionan datos específicos. En una A100, un modelo de 7B en BF16 puede alcanzar decenas de tokens por segundo, pero depende de la configuración.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ni se mencionan alternativas en la model card. El modelo base `skt/A.X-3.1-Light` es el único punto de referencia directo, pero no se ofrecen datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo experimental: está diseñado para investigación y evaluación controlada, no para uso en producción sin validación adicional.
- Riesgo de errores factuales: puede generar información incorrecta, especialmente en dominios legales, médicos o contables, por lo que no debe utilizarse como sustituto de asesoramiento profesional.
- Limitación de contexto: el entrenamiento se realizó con secuencias de 2048 tokens, lo que puede limitar la capacidad de manejar contextos largos en comparación con modelos con ventanas mayores.
- Sesgo de idioma: solo está entrenado en coreano, por lo que no es adecuado para tareas multilingües.
- Restricciones de datos: los datos de entrenamiento de AI Hub están sujetos a sus términos de uso originales, que deben respetarse al utilizar el modelo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que dificulta evaluar su calidad relativa.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_1_C_recommended)
- [Modelo base skt/A.X-3.1-Light](https://huggingface.co/skt/A.X-3.1-Light)
- [Versión anterior del mismo autor (v3_0)](https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0)
