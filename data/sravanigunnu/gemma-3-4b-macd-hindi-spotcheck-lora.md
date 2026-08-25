# Sravanigunnu/gemma-3-4b-macd-hindi-spotcheck-lora

## Resumen

Este adaptador LoRA, desarrollado por Sravanigunnu, afina el modelo base google/gemma-3-4b-it para la detección binaria de discurso de odio en hindi (abusivo / no abusivo). Forma parte del proyecto de investigación "Are Multilingual LLMs Reliable Content Moderators of Indic Hate Speech?" y se entrena sobre el subconjunto de datos MACD cuyas etiquetas han sido verificadas por consenso entre la anotación original, GPT-5.4 y Claude Opus 4.5.

La contribución principal de este adaptador es metodológica: utiliza un 22 % menos de muestras de entrenamiento (22 043 frente a 26 911) y consigue una macro F1 de 0,9461, prácticamente idéntica a la del adaptador entrenado con todas las etiquetas (0,9467). Esto demuestra que la calidad de las etiquetas pesa más que el volumen de datos en tareas de moderación de contenido.

El adaptador se distribuye en formato PEFT (safetensors) bajo licencia Gemma y está pensado para clasificación binaria con salida restringida a "0" (no abusivo) o "1" (abusivo), sin explicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre google/gemma-3-4b-it (transformer decoder-only) |
| Parametros totales | no disponible (adaptador ~0.1 GB; modelo base ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | bfloat16 (entrenamiento) |
| Idiomas soportados | hi, en |
| Licencia | gemma |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16, alpha=32 y dropout de 0.05 sobre los módulos de atención q_proj, k_proj, v_proj y o_proj del modelo base Gemma 3 4B IT. Se entrenó durante 3 épocas con una tasa de aprendizaje de 2 × 10⁻⁴ en precisión bfloat16.

El conjunto de entrenamiento es el subconjunto "spot-check" de MACD en hindi: 22 043 muestras cuyas etiquetas fueron verificadas por consenso entre la anotación original, GPT-5.4 y Claude Opus 4.5. El conjunto de test contiene 2 785 muestras. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Clasificación binaria de discurso de odio en hindi: devuelve "1" si el texto es abusivo u odioso, "0" si no lo es.
- Salida restringida y determinista: el prompt de sistema instruye al modelo a responder únicamente con "0" o "1", sin explicaciones.
- Inferencia eficiente mediante decodificación restringida: el código de ejemplo compara logits de los tokens "0" y "1" para decidir la clase.
- Hereda las capacidades multilingües y de seguimiento de instrucciones del modelo base Gemma 3 4B IT.
- No incluye tool calling, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Moderación de contenido en redes sociales en hindi: el adaptador puede integrarse en pipelines de moderación para marcar automáticamente comentarios abusivos antes de su publicación.
- Filtrado de comentarios en plataformas de noticias y foros indios: clasifica mensajes en hindi de forma binaria, permitiendo colas de revisión humana para casos marcados como abusivos.
- Investigación sobre calidad de etiquetas en NLP: el adaptador sirve como referencia empírica para estudiar cómo la verificación de etiquetas afecta al rendimiento frente al volumen de datos.
- Auditoría de moderadores automáticos: puede usarse como segundo clasificador para contrastar decisiones de otros sistemas de moderación en hindi.
- Análisis de contenido en hindi a gran escala: al ser un adaptador ligero sobre un modelo de 4B, puede desplegarse en lotes para etiquetar grandes volúmenes de texto.
- Evaluación comparativa de modelos multilingües como moderadores: forma parte del proyecto de investigación sobre fiabilidad de LLMs multilingües para moderar discurso de odio en lenguas índicas.

## Benchmarks y rendimiento

| Conjunto | N entrenamiento | N test | Macro F1 |
|---|---|---|---|
| Original (todas las etiquetas) | 26 911 | 3 000 | 0,9467 |
| Spot-check (este adaptador) | 22 043 | 2 785 | 0,9461 |
| Diferencia | -4 868 | -215 | -0,0006 |

El adaptador spot-check utiliza un 22 % menos de muestras y obtiene una macro F1 prácticamente idéntica a la del adaptador original, lo que respalda la hipótesis de que la calidad de las etiquetas pesa más que el tamaño del conjunto de datos.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0.1 GB, por lo que el requisito principal es el modelo base Gemma 3 4B IT.
- Inferencia en bfloat16: el modelo base de 4B requiere aproximadamente 8-10 GB de VRAM (estimación estándar para 4B en bfloat16), por lo que cabe en GPUs de consumo como RTX 3090, RTX 4090 o equivalentes con 12 GB o más.
- Para despliegue en producción, se puede usar vLLM, TGI o llama.cpp con el modelo base fusionado con el adaptador.
- La inferencia es de baja latencia al tratarse de un modelo de 4B con salida de un solo token; el cuello de botella es el procesamiento del prompt.
- Alternativas de despliegue: Ollama (si se fusiona el adaptador), Hugging Face Inference Endpoints, o FriendliAI (que ya lista este adaptador para despliegue de baja latencia).

## Comparativa con modelos similares

| Modelo | Base | N entrenamiento | Macro F1 | Licencia |
|---|---|---|---|---|
| gemma-3-4b-macd-hindi-spotcheck-lora (este) | Gemma 3 4B IT | 22 043 | 0,9461 | gemma |
| gemma-3-4b-macd-hindi-hate-speech-lora (original) | Gemma 3 4B IT | 26 911 | 0,9467 | gemma |

Ambos adaptadores comparten la misma base y tarea; la diferencia es el subconjunto de entrenamiento. No se dispone de comparación con otros modelos de detección de odio en hindi en la información proporcionada.

## Limitaciones y advertencias

- Clasificación binaria únicamente: no distingue entre tipos de odio, ni proporciona explicaciones o niveles de severidad.
- Enfoque exclusivo en hindi: el rendimiento en otros idiomas índicos o en mezclas hindi-inglés (Hinglish) no está documentado.
- Riesgo de sesgo: al entrenarse sobre un subconjunto verificado de MACD, puede heredar sesgos del dataset original y de los modelos utilizados para la verificación de etiquetas (GPT-5.4 y Claude Opus 4.5).
- Riesgo de alucinación: aunque la salida está restringida a "0" o "1", el modelo base puede comportarse de forma inesperada ante entradas fuera de distribución.
- Licencia Gemma: permite uso comercial pero con restricciones de atribución y prohibición de usos de alto riesgo; hay que revisar los términos completos de la licencia.
- Sin garantías de producción: el adaptador tiene 0 descargas y 0 likes; no hay evidencia de validación independiente más allá de la macro F1 reportada.
- El rendimiento en contexto largo o en conversaciones multi-turno no está evaluado; el caso de uso previsto es clasificación de texto corto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sravanigunnu/gemma-3-4b-macd-hindi-spotcheck-lora
- Adaptador original (todas las etiquetas): https://huggingface.co/Sravanigunnu/gemma-3-4b-macd-hindi-hate-speech-lora
- Página de Gemma 3 de Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Despliegue en FriendliAI: https://friendli.ai/models/Sravanigunnu/gemma-3-4b-macd-hindi-hate-speech-lora
