# zhangify/oalc-ds32-lambda0005-step50-backup-20261113

## Resumen

OALC ds32-lambda0005 step 50 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen 3.5 (etiqueta `qwen3_5` en los metadatos), con 4.539.265.536 parámetros totales según los pesos en safetensors. El nombre del repositorio indica que corresponde al paso 50 de un entrenamiento identificado como `qwen35_discounted_success_tanh_sampled_kl32_thinkFalse_50step_lr1e-06_lambda5e-4_20261025_183951`, con una tasa de aprendizaje de 1e-6 y un coeficiente lambda de 5e-4.

El modelo se enmarca en la familia de experimentos "OALC" (probablemente alguna variante de aprendizaje por refuerzo o ajuste con KL muestreado, a juzgar por los términos `sampled_kl32` y `discounted_success_tanh` del identificador). No es un modelo listo para producción: el propio autor lo etiqueta como `research-checkpoint` y advierte explícitamente que no se ha realizado ninguna evaluación de calidad ni de seguridad asociada a esta subida.

La relevancia de esta ficha es principalmente documental: permite a investigadores localizar y reproducir un checkpoint intermedio de un pipeline de entrenamiento sobre Qwen 3.5, con pesos originales, tokenizer y configuración preservados, pero sin estado del optimizador (no permite reanudar el entrenamiento de forma exacta). La información pública disponible es muy limitada: no hay model card detallada, ni benchmarks, ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen 3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (≈4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint se etiqueta como `qwen3_5`, lo que sugiere que reutiliza la arquitectura de la familia Qwen 3.5, un transformer multimodal capaz de procesar entradas de imagen y texto (`image-text-to-text`). Sin embargo, la model card no detalla la configuración interna (número de capas, dimensión oculta, cabezas de atención, tipo de encoder visual, etc.), por lo que no es posible confirmar si se trata de una variante densa o con mezcla de expertos, ni el tamaño del componente de visión.

En cuanto al entrenamiento, el identificador del run (`qwen35_discounted_success_tanh_sampled_kl32_thinkFalse_50step_lr1e-06_lambda5e-4_20261025_183951`) aporta pistas: se trata de un ajuste de 50 pasos con learning rate 1e-6 y un coeficiente lambda de 5e-4, con muestreo KL (`sampled_kl32`) y una función de recompensa basada en éxito descontado con transformación tanh (`discounted_success_tanh`). El sufijo `thinkFalse` sugiere que el modo de razonamiento extendido (thinking) está desactivado en este checkpoint. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO explícito, aunque la nomenclatura es compatible con un pipeline de RL o preferencias. El repositorio preserva pesos, tokenizer y configuración, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta.

## Capacidades

- Generación de texto conversacional en formato multi-turno (etiqueta `conversational`).
- Procesamiento de entradas imagen-texto (`image-text-to-text`), lo que habilita tareas de descripción de imágenes, VQA y razonamiento visual básico.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que facilita su despliegue en Hugging Face Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el sufijo `thinkFalse` sugiere modo thinking desactivado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (audio, visión extendida, thinking mode): solo se confirma visión por la pipeline `image-text-to-text`; el resto no disponible.

## Casos de uso

- Investigación en ajuste fino con RL: el checkpoint sirve como punto de partida o de comparación para estudiar el efecto de 50 pasos de ajuste con KL muestreado y recompensa descontada sobre un modelo base Qwen 3.5. Es adecuado porque preserva pesos, tokenizer y configuración del run original.
- Reproducibilidad de experimentos: al incluir `backup_provenance.json` con generaciones y checksums, permite verificar la integridad de los pesos y reproducir condiciones del entrenamiento (aunque no reanudarlo exactamente).
- Evaluación de modelos multimodales en laboratorio: útil para comparar el comportamiento image-text-to-text antes y después del ajuste, midiendo degradación o mejora en tareas de VQA y captioning.
- Docencia y formación: sirve como ejemplo práctico de checkpoint intermedio de un pipeline de RL sobre un modelo multimodal, para ilustrar el flujo de trabajo a estudiantes e investigadores.
- Pruebas de integración con transformers: al ser compatible con la librería `transformers` y con endpoints, permite validar pipelines de despliegue y servir el modelo en entornos de prueba.
- Análisis de seguridad y alineación: al no haberse realizado evaluación de seguridad, puede usarse en estudios controlados sobre sesgos y alucinaciones en modelos ajustados con recompensas, siempre en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4,54 B parámetros × 2 bytes), más overhead de activaciones y del encoder visual; en la práctica, se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- En cuantización de 8 bits: ~4,5-5 GB de pesos; en 4 bits: ~2,5-3 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción o evaluación a gran escala; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en fp16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto reducido, y en GPUs de 12-16 GB si se aplica cuantización (no publicada).
- Opciones de despliegue: transformers (nativo), Hugging Face Inference Endpoints (`endpoints_compatible`), vLLM y TGI si la arquitectura Qwen 3.5 está soportada por esas herramientas (no confirmado); llama.cpp/Ollama requerirían conversión a GGUF (no disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OALC ds32-lambda0005 step 50 | 4,54 B | no disponible | no disponible | Hugging Face (checkpoint de investigación) | Multimodal image-text-to-text, sin benchmarks |
| Qwen2.5-VL-3B | ~3,75 B | 32k (típico en la familia) | Apache 2.0 (según familia Qwen) | Hugging Face, ampliamente soportado | Modelo multimodal consolidado con benchmarks públicos |
| Qwen2.5-VL-7B | ~8 B | 32k (típico en la familia) | Apache 2.0 (según familia Qwen) | Hugging Face | Multimodal con mayor capacidad, benchmarks públicos |
| InternVL2-4B | ~4 B | variable según versión | Apache 2.0 (según versión) | Hugging Face | Multimodal de tamaño comparable con evaluación publicada |

Nota: los datos de los modelos comparativos son orientativos y pueden variar según la versión concreta; no se dispone de benchmarks del modelo OALC para una comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint de investigación sin evaluación de calidad ni de seguridad: el autor lo indica explícitamente en la model card.
- No permite reanudar el entrenamiento de forma exacta al no incluir estado del optimizador.
- Licencia no declarada: no se puede asumir uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados: riesgo de comportamiento degradado fuera del inglés o del chino (idiomas típicos de la familia Qwen).
- Longitud de contexto no documentada: no se debe asumir la ventana estándar de Qwen 3.5 sin verificar la configuración.
- Riesgo de alucinación y sesgos: al no haber evaluación, no se conocen sesgos específicos ni tasas de alucinación; se recomienda validación empírica antes de cualquier uso.
- Modo thinking desactivado (`thinkFalse`): puede rendir peor en tareas de razonamiento complejo que variantes con thinking activado.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la integridad debe verificarse con `backup_provenance.json`.

## Enlaces

- Hugging Face: https://huggingface.co/zhangify/oalc-ds32-lambda0005-step50-backup-20261113
- Archivo de procedencia: `backup_provenance.json` (incluido en el repositorio)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
