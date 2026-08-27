# youngseok12/AX-3.1-Light-sft_v3_1_E_format_safe

## Resumen

AX-3.1-Light-sft_v3_1_E_format_safe es un modelo de lenguaje coreano de 7.264 millones de parámetros, resultado de un fine-tuning con LoRA sobre el modelo base `skt/A.X-3.1-Light`, desarrollado por el usuario `youngseok12`. El adaptador LoRA se ha fusionado en los pesos del modelo base, dando lugar a un modelo independiente en formato BF16 `safetensors`. Está pensado para investigación y evaluación controlada en coreano, con un enfoque en dominios especializados como derecho civil, penal y administrativo, normas contables, conocimiento médico básico, lectura automática de noticias y valoración tecnológica.

El modelo se entrenó durante una sola época con 36.000 ejemplos de instrucción (más 3.000 de validación), excluyendo deliberadamente ejemplos de razonamiento. Su relevancia radica en ser una propuesta experimental para el leaderboard K-AI, centrada en la estabilidad de formato en respuestas cortas y estructuradas. Al estar basado en la arquitectura del modelo A.X-3.1-Light (etiquetado como `llama`), hereda las capacidades de generación de texto de un transformer decoder-only, pero con un ajuste específico para tareas coreanas de dominios concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en `skt/A.X-3.1-Light`, etiquetada como `llama`) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de hasta 2048 tokens) |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base `skt/A.X-3.1-Light`, un transformer decoder-only con atención causal, compatible con la familia Llama según las etiquetas del repositorio. No se han modificado capas ni se ha añadido código Python personalizado. El fine-tuning se realizó mediante LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. El adaptador se fusionó posteriormente en los pesos base, generando un modelo completo sin necesidad de cargar adaptadores por separado.

El entrenamiento utilizó 36.000 ejemplos de instrucción (split de entrenamiento) y 3.000 de validación derivados de AI Hub, con separación a nivel de fuente y comprobación de duplicados exactos. Los dominios incluyen datos de instrucción legal (civil, penal, administrativo), normas contables corporativas, conocimiento médico esencial, lectura automática de noticias y datos de valoración tecnológica CoT-Fabric. Se excluyeron explícitamente los ejemplos de razonamiento (0% de tokens de razonamiento en el split de entrenamiento). El objetivo de entrenamiento fue la entropía cruzada estándar sobre tokens de asistente, con una época, tasa de aprendizaje 3e-5, scheduler coseno con warmup del 3%, weight decay 0.01, gradiente máximo 1.0, batch efectivo 32, longitud máxima de secuencia 2048, precisión BF16 y sin empaquetado de secuencias. La semilla aleatoria fue 20260827.

## Capacidades

- Generación de texto en coreano con formato de chat oficial del tokenizador A.X.
- Fine-tuning especializado en dominios legales (civil, penal, administrativo), contabilidad corporativa, conocimiento médico básico, análisis de noticias y valoración tecnológica.
- Respuestas estructuradas y cortas, optimizadas para estabilidad de formato en tareas de evaluación controlada.
- Soporte de carga directa con `transformers` y `vLLM` (sin adaptador ni `trust_remote_code`).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Asistencia legal preliminar en coreano: el modelo puede responder consultas básicas sobre derecho civil, penal o administrativo, ayudando a estudiantes o profesionales a localizar conceptos generales. Su entrenamiento en estos dominios lo hace adecuado para generar explicaciones introductorias, aunque no debe sustituir el asesoramiento profesional.
- Revisión de normas contables: puede resumir o explicar principios de normas contables corporativas, útil para formación interna o como apoyo en documentación técnica.
- Educación médica básica: puede proporcionar información general sobre terminología médica o conceptos esenciales, siempre con la advertencia de que no es un sustituto del criterio clínico.
- Análisis de noticias: al estar entrenado con datos de lectura automática de noticias, puede generar resúmenes o extraer información clave de artículos periodísticos en coreano.
- Valoración tecnológica: puede asistir en la redacción de informes preliminares sobre valoración de tecnologías, basándose en los datos CoT-Fabric, aunque sin razonamiento explícito.
- Evaluación de modelos en coreano: al ser un modelo experimental para el leaderboard K-AI, puede usarse como referencia en pruebas de estabilidad de formato y calidad de respuestas en tareas coreanas de dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los conjuntos de evaluación públicos como KMMLU-Pro, CLIcK, HLE, SNU Ko-MuSR, Com2-main y Original MuSR no se utilizaron como datos de SFT, pero no se proporcionan métricas de rendimiento del modelo final.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 14,5 GB (7.264.800.768 parámetros × 2 bytes). Con overhead de activaciones y memoria del runtime, se recomienda al menos 16-20 GB de VRAM para inferencia cómoda.
- GPU recomendadas: una RTX 4090 (24 GB), A10G (24 GB), L4 (24 GB) o A100 (40/80 GB) pueden ejecutar el modelo en BF16 sin cuantización. GPUs con 16 GB (como RTX 4080 o A10) podrían funcionar con limitaciones de longitud de secuencia.
- En consumer GPU: cabe en una RTX 4090 o RTX 4080 de 16 GB con secuencias cortas, pero no en GPUs de 8-12 GB sin cuantización adicional (no se proporcionan versiones cuantizadas).
- Opciones de despliegue: compatible con `transformers` (carga directa con `AutoModelForCausalLM`), `vLLM` para inferencia OpenAI-compatible, y potencialmente `llama.cpp`/`Ollama` si se convierte a GGUF (no se incluye en el repositorio).
- Latencia y throughput: no disponibles. Dependerán del hardware y de la longitud de secuencia; al ser un modelo de 7B, en una A100 se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. El modelo es un fine-tuning del base `skt/A.X-3.1-Light`, del que hereda arquitectura y tamaño, pero no se han publicado resultados comparativos frente a otros modelos coreanos de tamaño similar (por ejemplo, Llama-3-Ko, Polyglot-Ko, etc.). La licencia Apache 2.0 y el enfoque en dominios legales/contables/médicos lo diferencian de modelos generalistas, pero sin datos de rendimiento no es posible establecer una comparación objetiva.

## Limitaciones y advertencias

- Modelo experimental: diseñado para investigación y evaluación controlada, no para uso en producción sin validación adicional.
- Riesgo de errores factuales: puede producir información incorrecta, especialmente en dominios legales, contables o médicos. No debe utilizarse como sustituto de asesoramiento profesional.
- Sin capacidad de razonamiento: los ejemplos de razonamiento se excluyeron del entrenamiento, por lo que no está optimizado para tareas de razonamiento multi-paso o CoT.
- Contexto limitado: entrenado con secuencias de hasta 2048 tokens; no se garantiza un buen comportamiento con contextos más largos.
- Idioma: solo coreano. No se ha evaluado su rendimiento en otros idiomas.
- Datos de entrenamiento: los datos de AI Hub están sujetos a sus términos de acceso originales, que pueden restringir ciertos usos comerciales o de redistribución.
- Sin cuantizaciones alternativas: solo se distribuye en BF16, lo que limita su despliegue en hardware con poca VRAM sin conversión manual.

## Enlaces

- Repositorio del modelo: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_1_E_format_safe
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Versión anterior del fine-tuning: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
