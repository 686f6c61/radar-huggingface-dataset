# SuhaoYu1020/latent-arith-mmdit

## Resumen

`latent-arith-mmdit` es un repositorio de investigación publicado por SuhaoYu1020 que reúne los checkpoints finales de quince ejecuciones de un MMDiT de 561 millones de parámetros, entrenado con flow matching sobre renders aritméticos cuadrados en el espacio latente de un tokenizador visual fijo: la VAE de Qwen-Image o SigLIP2. Cada checkpoint se distribuye en bf16, ocupa 1,1 GB y se carga con `MMDiT.from_pretrained("<run>/final/dit")`; el repositorio completo suma 16,9 GB.

El objetivo no es la generación de imágenes generalista, sino estudiar cómo el schedule de sigma —shift 15, shift 1, sigma fijo 0,8 o 1,0 y transiciones 15→1 al 50 % o al 75 % del entrenamiento— condiciona el aprendizaje de una transformación aritmética y la resolución de ambigüedad one-to-many. El proyecto compara además dos tokenizadores visuales y distintos presupuestos de entrenamiento, con evaluaciones propias de precisión OCR, fidelidad de glifos y lectura latente de la respuesta.

Es relevante para investigadores en difusión, flow matching y representación latente, no como modelo listo para producción: no declara pipeline, licencia ni idiomas, no incluye resultados en benchmarks estándar y sus métricas son específicas del proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT (Multi-Modal Diffusion Transformer) con flow matching; 12 bloques de 1152 dimensiones |
| Parámetros totales | 561 M por checkpoint |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; no es un modelo de lenguaje. La entrada son latentes de imágenes cuadradas del tokenizador visual |
| Tipos de cuantización | No disponible; solo se publican pesos en bf16, sin variantes GGUF, GPTQ o AWQ |
| Idiomas soportados | No disponible; no procesa texto, genera imágenes de operaciones aritméticas |
| Licencia | No disponible |
| Formato de pesos | safetensors, estructura `diffusers` (`save_pretrained`), bf16 |
| Tamaño del repositorio | 16,9 GB |
| Pipeline de diffusers | No disponible |
| Dataset de entrenamiento | `SuhaoYu1020/arith-sq256` |

## Arquitectura y entrenamiento

El modelo es un MMDiT de 12 bloques y anchura 1152, entrenado con flow matching sobre latentes de un tokenizador visual fijo. Todas las ejecuciones usan batch 64 y learning rate 2e-4. La raíz de datos se especifica en `args.json`. El proyecto distingue entre una tarea one-to-one estándar y una tarea one-to-many dura, y compara dos espacios latentes: la VAE de Qwen-Image y SigLIP2. No se detalla el número total de tokens de entrenamiento ni la composición exacta del dataset.

El diseño experimental gira alrededor del schedule de sigma: shift 40, shift 15, shift 1, sigma fijo 0,8, sigma fijo 1,0 y transiciones de shift 15 a 1 al 50 % o al 75 % del entrenamiento. Los brazos con cambio de schedule se inicializan desde el snapshot del run padre en el paso de cambio, con optimizador nuevo y warmup 100; los snapshots padre no se incluyen en el repositorio, solo los finales. Los presupuestos van desde 10 épocas —11.200 pasos en un caso— hasta 120 épocas, 35 épocas o 40.000 pasos en la ejecución larga. No se menciona RLHF, DPO ni alineamiento, algo esperable en un modelo de difusión de investigación.

La evaluación se realiza con `render_eval_sq_dit.py --ckpt <run>/final --out_dir OUT --n_test 1000 --steps 24`, que cubre precisión OCR, lectura one-step de x̂₀, lector latente de respuestas, fidelidad de glifos y el currículo de sigma.

## Capacidades

- Generación condicionada de imágenes de operaciones aritméticas en el espacio latente de un tokenizador visual.
- Lectura one-step de x̂₀ para estimar directamente la respuesta a partir del estado latente.
- Lector latente de respuestas, orientado a analizar si la información aritmética está codificada en el latent.
- Renderizado y puntuación automatizada mediante el script de evaluación del proyecto.
- Soporte de dos tokenizadores visuales distintos: VAE de Qwen-Image y SigLIP2.
- Experimentación con schedules de ruido y currículos de sigma, incluyendo cambios de shift durante el entrenamiento.
- Evaluación de fidelidad de glifos y de precisión OCR sobre renders sintéticos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso conversacional, visión general, audio ni modo thinking.
- No es un modelo multilingüe ni un LLM: no procesa instrucciones en lenguaje natural.

## Casos de uso

- Reproducción de ablaciones de schedule sigma: cargar cada run con `MMDiT.from_pretrained` y ejecutar `render_eval_sq_dit.py` para comparar shift 15, shift 1, sigma fijo y transiciones. Es adecuado porque el repositorio contiene precisamente los checkpoints finales de esas variantes.
- Estudio comparativo de tokenizadores visuales: entrenar o evaluar el mismo MMDiT sobre latentes de la VAE de Qwen-Image y de SigLIP2 para medir diferencias de precisión OCR y fidelidad. El proyecto ya incluye pares de runs para ambos espacios.
- Investigación sobre ambigüedad one-to-many: usar los brazos `mm_om_*` para analizar si el modelo conoce todas las respuestas posibles pero solo dibuja algunas, un fenómeno documentado en el run con sigma fijo 1,0.
- Generación de datos sintéticos para OCR o modelos visión-lenguaje: producir renders aritméticos controlados y puntuarlos automáticamente para aumentar datasets de evaluación. La ventaja es que el modelo trabaja en un espacio latente fijo y el pipeline de scoring ya está definido.
- Análisis de lectura latente y representaciones: emplear el lector latente y la lectura one-step de x̂₀ para estudiar qué información aritmética queda codificada antes de la decodificación visual.
- Experimentos de currículo de ruido en flow matching: reutilizar los brazos con cambio de schedule al 50 % o 75 % como línea base para nuevas estrategias de entrenamiento.
- Docencia y divulgación: ilustrar cómo un MMDiT pequeño aprende una tarea composicional concreta y cómo el schedule de sigma afecta a la fidelidad y a la precisión.
- Evaluación interna de fidelidad de glifos: comparar variantes con distinta precisión OCR y fidelidad para estudiar el compromiso entre responder bien y dibujar correctamente.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Las únicas cifras son métricas internas del proyecto, obtenidas con su propio script de evaluación, y no son directamente comparables con benchmarks generales. El script indicado usa 24 pasos y 1000 ejemplos de test.

| Run | Latente | Schedule sigma | Precisión OCR (%) | Fidelidad de glifos (%) | Ambas correctas (%) |
|---|---|---|---|---|---|
| `mm_om_s15_siglip2` | SigLIP2 | shift 15 | 97 | 41 | 34 |
| `mm_om_s15to1_75_siglip2` | SigLIP2 | shift 15→1 al 75 % | 92 | 54 | 47 |
| `mm_om_reg_siglip2` | SigLIP2 | sigma fijo 1,0 | 100 | 0 | 0 |
| `mm_om_s1_siglip2` | SigLIP2 | shift 1 | 0 | 15 | 0 |
| `mm_om_s15_vae` | VAE | shift 15 | No disponible | 40 | 7 |
| `mm_om_s15to1_50_vae` | VAE | shift 15→1 al 50 % | No disponible | 66 | 16 |

La ejecución larga `mm_s40_siglip2_anshard_long` alcanza un 78 % de OCR a 24 pasos. En el brazo one-to-one con shift 1, la precisión OCR fue del 67 % con VAE y del 7 % con SigLIP2, lo que el autor interpreta como ausencia de aprendizaje. El run con sigma fijo 1,0 obtiene un 100 % de precisión OCR pero un 0 % de fidelidad de glifos, descrito en la model card como «conoce todas las respuestas, no dibuja ninguna».

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Los pesos en bf16 ocupan aproximadamente 1,12 GB por checkpoint; una estimación prudente para lote 1 y latentes pequeños es de 3-6 GB incluyendo activaciones y overhead de `diffusers`, pero conviene validarla en el entorno concreto.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. Para un único checkpoint no son necesarias A100 ni H100.
- Cabe en GPU consumer: sí, con un único checkpoint de 561 M en bf16. El repositorio completo requiere 16,9 GB de disco.
- Entrenamiento: no se publican GPUs ni horas. Las ejecuciones usan batch 64 y 12 bloques de 1152 dimensiones; reentrenar réplicas exactas requeriría más recursos que la inferencia, pero no hay datos oficiales.
- Opciones de despliegue: PyTorch con `diffusers`, cargando `MMDiT.from_pretrained("<run>/final/dit")`, y el código de `Semantic-Image-Release`. No hay soporte publicado para llama.cpp, Ollama, vLLM, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. La evaluación de referencia usa 24 pasos de muestreo y 1000 ejemplos de test, pero no se publican tiempos por imagen.

## Comparativa con modelos similares

No se han identificado modelos públicos directamente comparables: la tarea —aritmética renderizada en el espacio latente de un tokenizador visual concreto— es específica de este proyecto. MMDiT generalistas como SD3 o Flux.1 comparten familia arquitectónica, pero son modelos texto-a-imagen de mayor escala y no hay datos en la información proporcionada para comparar parámetros, contexto, rendimiento o licencia. La comparación más útil es interna, entre las variantes del propio repositorio:

| Variante | Parámetros | Entrada | Precisión OCR (%) | Fidelidad de glifos (%) | Ambas (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `mm_om_s15_siglip2` | 561 M | Latentes SigLIP2 | 97 | 41 | 34 | No disponible | HuggingFace |
| `mm_om_s15to1_75_siglip2` | 561 M | Latentes SigLIP2 | 92 | 54 | 47 | No disponible | HuggingFace |
| `mm_om_reg_siglip2` | 561 M | Latentes SigLIP2 | 100 | 0 | 0 | No disponible | HuggingFace |
| `mm_om_s1_siglip2` | 561 M | Latentes SigLIP2 | 0 | 15 | 0 | No disponible | HuggingFace |
| SD3 (MMDiT) | No disponible | Texto | No disponible | No disponible | No disponible | No disponible | No disponible |
| Flux.1 | No disponible | Texto | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse uso comercial, modificación ni redistribución sin consultar al autor y las licencias de los tokenizadores base.
- Es un artefacto de investigación, no un modelo de producción: no declara pipeline, API, idiomas ni soporte.
- El repositorio contiene solo los checkpoints finales; los snapshots padre usados para inicializar los brazos con cambio de schedule no se incluyen, lo que limita la reproducción exacta de esos experimentos.
- Las métricas son internas y específicas del proyecto; no son comparables con MMLU, HumanEval, GSM8K ni con benchmarks estándar de generación de imágenes.
- El entrenamiento se realiza sobre renders sintéticos de aritmética; no hay evidencia de generalización a imágenes reales, otros tipos de letra, otras resoluciones u otras operaciones.
- Riesgo de errores aritméticos y de glifos mal formados: el propio run con sigma fijo 1,0 muestra un 100 % de precisión OCR con 0 % de fidelidad visual.
- La ambigüedad one-to-many implica que el modelo puede generar respuestas válidas distintas para una misma entrada; no debe evaluarse con una única respuesta de referencia sin tenerlo en cuenta.
- No hay alineamiento, filtros de seguridad ni evaluación de sesgos; el dataset sintético puede introducir sesgos de tipografía, layout o distribución de dígitos no documentados.
- No es multilingüe ni conversacional: no procesa instrucciones en lenguaje natural ni soporta tool calling o agentes.
- Solo se publican pesos bf16; no hay cuantizaciones ligeras ni despliegue en formatos tipo GGUF.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Las licencias de la VAE de Qwen-Image y de SigLIP2 no se abordan en la model card; podrían imponer condiciones adicionales al uso de los latentes o de los pesos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SuhaoYu1020/latent-arith-mmdit
- Código del proyecto: https://github.com/SuhaoYu1020/Semantic-Image-Release
- Dataset `arith-sq256`: https://huggingface.co/datasets/SuhaoYu1020/arith-sq256
- Perfil del autor: https://huggingface.co/SuhaoYu1020
