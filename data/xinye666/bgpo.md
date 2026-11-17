# xinye666/BGPO

## Resumen

BGPO es un paquete de post-entrenamiento y evaluación publicado por el usuario xinye666 en Hugging Face, construido sobre el modelo base Qwen/Qwen3.5-2B. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de investigación que incluye código de entrenamiento, adaptadores LoRA, scripts de evaluación y resultados archivados para un baseline denominado B2 sobre el conjunto de datos OQA (OpinionQA). El paquete incorpora asimismo implementaciones de métodos como BGPO, aunque los pesos entregados corresponden exclusivamente al método B2.

El adaptador LoRA entregado tiene aproximadamente 44 MB y debe combinarse con el modelo base Qwen3.5-2B (versión fijada en el commit 15852e8c16360a2fea060d615a32b45270f8a8fc) para su uso. El entrenamiento se realizó durante 500 pasos, seleccionando el adaptador del paso 200 según el conjunto de desarrollo. El paquete no incluye ni el dataset OQA ni el modelo base completo, por lo que su reproducción requiere descargar ambos por separado.

La relevancia del artefacto es metodológica: documenta con detalle un pipeline de post-entrenamiento con generación de razonamientos, métricas de divergencia (JSD) y recuperación de información mutua, junto con scripts de verificación y procedencia. Es útil para investigadores que quieran reproducir o extender experimentos de alineación basada en opiniones, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B); adaptador LoRA sobre atención/proyecciones |
| Parametros totales | No disponible (el adaptador LoRA pesa ~44 MB; el modelo base Qwen3.5-2B no se incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; los scripts de evaluación usan `--max-model-len 1024` y `--max-new-tokens 256` |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el base se obtiene por separado) |
| Idiomas soportados | No disponible |
| Licencia | MIT (metadatos del proyecto); el modelo base y los datos externos mantienen sus licencias upstream |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base se descarga aparte |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen3.5-2B, un transformer decoder-only de 2 mil millones de parámetros. El método B2 es un SFT incondicional con generación de razones: para cada observación de entrenamiento se dispone de una etiqueta de respuesta muestreada, el modelo genera cuatro razones por pregunta y se optimiza la media de log-verosimilitud negativa sobre la distribución de respuestas correspondiente, con regularización KL. El entrenamiento configurado usa `--steps 500 --batch-size 4 --lr 1e-4 --m 4 --gamma 0.1`, con evaluación cada 100 pasos y selección del paso 200 en desarrollo.

El pipeline emplea dos entornos separados: uno de modelo (Torch 2.14.1+cu126, Transformers 5.20.2, PEFT 0.21.2) y otro de muestreo con vLLM 0.32.0 (Torch 2.13.0, Transformers 5.19.0), comunicados mediante un servidor de muestreo (`scripts/vllm_sampler_server.py`). El código conserva la ruta de entrenamiento BGPO original, pero los pesos entregados y los resultados archivados corresponden a B2; el autor advierte explícitamente que los resultados de BGPO sobre Qwen3.5-2B no se completaron y que el adaptador B2 no debe interpretarse como un modelo BGPO entrenado.

## Capacidades

- Generación de razonamientos (reasoning traces) para preguntas de opinión, con cuatro muestras por pregunta en la configuración de evaluación.
- Modelado de distribuciones de respuesta sobre el conjunto OQA (OpinionQA), orientado a métricas de calibración y divergencia.
- Evaluación de métricas de recuperación de información mutua (Rec1, Rec2) y JSD condicional, por peor grupo y global.
- Soporte de LoRA mediante PEFT y de inferencia acelerada con vLLM (servidor de muestreo dedicado).
- Recomputación de métricas en CPU a partir de predicciones guardadas (`scripts/eval_predictions.py`).
- Inclusión de datos de imagen ArtELingo y PARA con scripts de construcción y guías de uso.
- No se documentan capacidades de tool calling, agentes, visión o audio en el adaptador; el alcance es experimental sobre OQA.

## Casos de uso

- Reproducción de experimentos de alineación basada en opiniones: el paquete incluye predicciones del test (299 preguntas), métricas archivadas y scripts para recalcular JSD y recuperación de información mutua, lo que permite verificar resultados sin reentrenar.
- Investigación en post-entrenamiento con SFT y generación de razones: el código de `bgpo/train/reasoning_runner.py` y `bgpo/train/reasoning.py` sirve como referencia para implementar variantes (B2, BGPO) sobre modelos pequeños.
- Evaluación comparativa de métodos de alineación: los scripts permiten lanzar evaluaciones con vLLM o con el sampler de Hugging Face y comparar métricas entre configuraciones.
- Desarrollo de pipelines de evaluación en CPU: `eval_predictions.py` y los ejemplos sintéticos en `data/SYN_HANDOFF/` permiten probar el flujo de métricas sin GPU ni modelo base.
- Estudio de calibración y sesgo en modelos de opinión: las métricas por peor grupo (Worst-group JSD) facilitan analizar disparidades entre subgrupos del dataset OQA.
- Reutilización de infraestructura de muestreo con vLLM: el servidor `vllm_sampler_server.py` con soporte de múltiples LoRA (`--max-loras 4`) puede adaptarse a otros adaptadores sobre el mismo modelo base.
- Experimentación con datos multimodales: los conjuntos ArtELingo y PARA con scripts de construcción permiten extender el estudio a tareas de imagen, aunque fuera del alcance del adaptador B2.

## Benchmarks y rendimiento

Resultados archivados del adaptador B2 sobre el test de OQA (299 preguntas), según la model card:

| Metrica | Valor |
|---|---|
| Cond. JSD | 0.05711850 bits |
| Worst-group JSD | 0.06551305 bits |
| Overall JSD | 0.04838076 bits |
| Rec1 | −5.66931336 |
| Rec2 | 0 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el servidor vLLM de ejemplo se lanza con `--gpu-memory-utilization 0.14` y `--max-model-len 1024`, lo que sugiere un consumo moderado para el modelo base de 2B más el adaptador.
- GPU recomendadas: no especificadas; el autor menciona experimentos previos en A100 para los datos de imagen, pero no fija un mínimo para el adaptador.
- Compatibilidad con GPU de consumo: probable para el modelo base de 2B en cuantización de 16 bits, pero no confirmado en la documentación.
- Opciones de despliegue: vLLM 0.32.0 (servidor de muestreo incluido), Hugging Face Transformers 5.20.2 con PEFT 0.21.2; el sampler `hf` está soportado pero puede diferir numéricamente del de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros adaptadores o modelos de la misma categoría.

## Limitaciones y advertencias

- El paquete no incluye el dataset OQA ni el modelo base Qwen3.5-2B; sin ambos no es posible ejecutar la evaluación o el post-entrenamiento.
- Los pesos entregados corresponden al método B2, no a BGPO; el autor advierte que no deben presentarse como un modelo BGPO entrenado.
- El adaptador está especializado en OQA y no se documentan capacidades generales de texto, código o matemáticas.
- Los resultados de benchmarks se limitan a métricas de JSD y recuperación de información mutua sobre OQA; no hay MMLU, HumanEval ni GSM8K.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el entrenamiento sobre opiniones puede heredar sesgos del dataset.
- Restricciones de licencia: el proyecto declara MIT, pero el modelo base y los datos externos (OQA, ArtELingo, PARA) mantienen sus licencias upstream, que deben respetarse por separado.
- Los datos de imagen ArtELingo y PARA no están cubiertos por la relicencia MIT del código.
- El entorno histórico requiere versiones específicas (Torch 2.14.1, Transformers 5.20.2, vLLM 0.32.0) y Python 3.11; desviaciones pueden alterar los resultados numéricos.
- El paquete registra 22 pruebas CPU superadas y 7 omitidas; no se ha reejecutado el entrenamiento ni la evaluación en GPU para esta entrega.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xinye666/BGPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Guía de ficheros de imagen: https://huggingface.co/xinye666/BGPO/blob/main/docs/IMAGE_FILE_GUIDE.md
- Instrucciones de datos de imagen: https://huggingface.co/xinye666/BGPO/blob/main/docs/IMAGE_DATA_README.md
- Particiones de datos de imagen: https://huggingface.co/xinye666/BGPO/blob/main/docs/IMAGE_DATA_SPLITS.md
