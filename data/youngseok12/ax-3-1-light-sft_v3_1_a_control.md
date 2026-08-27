# youngseok12/AX-3.1-Light-sft_v3_1_A_control

## Resumen

El modelo `youngseok12/AX-3.1-Light-sft_v3_1_A_control` es un ajuste fino experimental del modelo base `skt/A.X-3.1-Light`, desarrollado por el usuario youngseok12. Se trata de un modelo de lenguaje de 7.264 millones de parámetros (7,26B) orientado exclusivamente al coreano, obtenido mediante entrenamiento con adaptadores LoRA y posterior fusión de los pesos en el modelo completo. Su propósito declarado es servir como condición de control en una evaluación controlada para medir el efecto de mezclas alternativas de datos de entrenamiento, dentro del contexto del K-AI Leaderboard.

El modelo se distribuye en formato BF16 `safetensors` y mantiene la arquitectura original del modelo base, que pertenece a la familia Llama. Está pensado para investigación y evaluación en coreano, con un conjunto de datos de entrenamiento que abarca dominios legales, contables, médicos y de lectura automática de noticias, entre otros. Su relevancia radica en que permite comparar el impacto de diferentes mezclas de datos de instrucción en un mismo modelo base, aunque no está diseñado para uso productivo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder basado en Llama (sin cambios respecto al base) |
| Parametros totales | 7.264.800.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (secuencia de entrenamiento); contexto del modelo base no especificado |
| Tipos de cuantizacion | BF16 (safetensors); no se proporcionan otras cuantizaciones |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del modelo base `skt/A.X-3.1-Light`, un transformer decoder de tipo Llama con atención causal estándar. No se ha modificado el código del modelo ni se ha añadido ninguna innovación estructural. El entrenamiento se realizó mediante LoRA con rango 16, alpha 32 y dropout 0.05, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj`. Se utilizó una época completa, tasa de aprendizaje de 3e-5 con scheduler coseno y warmup del 3%, weight decay de 0.01, gradiente máximo de norma 1.0, batch efectivo de 32 y secuencias de hasta 2048 tokens en precisión BF16. El conjunto de datos de entrenamiento contiene 36.000 ejemplos, con una división de desarrollo de 3.000 ejemplos derivada de AI Hub. Las fuentes incluyen datos de instrucción legal (derecho civil, penal y administrativo), normas contables corporativas, conocimiento médico esencial, lectura automática de noticias y datos de valoración tecnológica CoT-Fabric. El 55,80% de los tokens objetivo de asistente corresponden a ejemplos de razonamiento. No se utilizaron conjuntos de evaluación pública como KMMLU-Pro, CLIcK, HLE, SNU Ko-MuSR, Com2-main o MuSR como datos de entrenamiento.

## Capacidades

- Generación de texto en coreano con formato conversacional, siguiendo la plantilla de chat oficial del tokenizador A.X.
- Razonamiento paso a paso (chain-of-thought) gracias a la inclusión de datos CoT en el entrenamiento.
- Comprensión y generación de respuestas en dominios especializados: derecho civil, penal y administrativo, contabilidad corporativa, conocimiento médico básico y análisis de noticias.
- Soporte de conversaciones multi-turno mediante el chat template estándar.
- No se especifica soporte para tool calling, function calling, agentes, visión o audio.
- Capacidad multilingüe limitada al coreano; no se reportan otros idiomas.

## Casos de uso

- Investigación académica en procesamiento de lenguaje natural coreano: el modelo sirve como referencia controlada para estudiar el efecto de diferentes mezclas de datos de instrucción en el rendimiento de un modelo base fijo.
- Evaluación comparativa en el K-AI Leaderboard: su diseño como condición de control permite aislar variables en experimentos de ajuste fino.
- Prototipado de asistentes legales en coreano: puede generar borradores de respuestas sobre cuestiones de derecho civil, penal o administrativo, siempre con supervisión humana experta.
- Asistencia en contabilidad corporativa: capaz de explicar normas contables básicas o resolver dudas conceptuales, aunque no debe usarse para decisiones financieras reales.
- Generación de resúmenes o análisis de noticias en coreano: entrenado con datos de lectura automática de noticias, puede extraer información clave de artículos.
- Experimentación con razonamiento guiado: los ejemplos CoT incluidos permiten probar técnicas de prompting para tareas de razonamiento en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, KMMLU, HumanEval o similares. Tampoco se proporcionan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,5 GB (tamaño del repositorio), por lo que se recomienda una GPU con al menos 16 GB de VRAM para cargar el modelo completo sin cuantización.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares con soporte para BF16.
- En GPUs de consumo con menos de 16 GB, sería necesario aplicar cuantización (por ejemplo, GGUF o AWQ), aunque no se proporcionan versiones cuantizadas oficiales.
- Opciones de despliegue: el modelo es compatible con `transformers` y se puede cargar con `AutoModelForCausalLM`. También se indica que es cargable directamente con vLLM para despliegue compatible con OpenAI, sin necesidad de adaptadores ni `trust_remote_code`.
- Latencia y throughput: no se proporcionan datos medidos. Para un modelo de 7B en BF16, se puede esperar una latencia de decodificación de decenas de milisegundos por token en GPUs modernas, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idioma | Notas |
|---|---|---|---|---|---|
| `skt/A.X-3.1-Light` (base) | 7,26B | no especificado | Apache-2.0 | Coreano, inglés | Modelo original sin ajuste fino |
| `youngseok12/AX-3.1-Light-sft_v3_1_A_control` | 7,26B | 2048 (entrenamiento) | Apache-2.0 | Coreano | Ajuste fino LoRA del base, condición de control |
| `youngseok12/AX-3.1-Light-sft_v3_0` | 7,26B | no especificado | Apache-2.0 | Coreano | Variante anterior del mismo autor, sin datos de rendimiento |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, otros fine-tunings coreanos de 7B) con datos de rendimiento verificables.

## Limitaciones y advertencias

- El modelo es experimental y puede producir errores factuales; no debe utilizarse como sustituto de asesoramiento legal, contable, médico o financiero profesional.
- El entrenamiento se realizó con datos de AI Hub, cuyos términos de uso originales siguen aplicándose a los datos de entrenamiento; esto puede restringir ciertos usos comerciales o de redistribución.
- La licencia Apache-2.0 cubre el modelo base, pero la procedencia de los datos de entrenamiento puede imponer condiciones adicionales.
- El modelo solo soporta coreano; no se ha evaluado su comportamiento en otros idiomas.
- La longitud de contexto efectiva está limitada a 2048 tokens durante el entrenamiento; aunque el modelo base podría soportar más, no se ha verificado.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez; se desconoce su comportamiento en dominios fuera de los datos de entrenamiento.
- No se proporcionan versiones cuantizadas ni instrucciones de despliegue en producción más allá de la carga estándar con `transformers` o vLLM.

## Enlaces

- Repositorio del modelo: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_1_A_control
- Modelo base: https://huggingface.co/skt/A.X-3.1-Light
- Variante anterior del autor: https://huggingface.co/youngseok12/AX-3.1-Light-sft_v3_0
