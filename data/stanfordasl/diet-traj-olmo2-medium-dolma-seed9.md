# stanfordasl/diet-traj-olmo2-medium-dolma-seed9

## Resumen

Este repositorio no es un modelo de propósito general, sino un artefacto de investigación: uno de los entrenamientos desde cero del proyecto DIET (weight-space), desarrollado por el grupo stanfordasl de Stanford. Se trata de un modelo con arquitectura OLMo2 de tamaño medio (~305M de parámetros) preentrenado sobre el corpus Dolma v1.7 con la semilla aleatoria 9, formando parte de una colección de ejecuciones idénticas salvo en la semilla, diseñadas para análisis de trayectorias en el espacio de pesos.

Su relevancia no reside en su rendimiento como modelo de lenguaje —no está alineado ni optimizado para uso en producción—, sino en permitir estudios científicos sobre cómo evolucionan los pesos de un transformer durante el preentrenamiento: comparaciones entre semillas, interpolación de pesos, análisis de mode connectivity o investigación sobre destilación y mecanismos de aprendizaje. El entrenamiento completo usó un presupuesto de 2.000 millones de tokens sobre Dolma, con checkpoints intermedios guardados cada 950 pasos en ramas del repositorio, lo que permite reconstruir la trayectoria completa del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo2 dense (transformer decoder) |
| Parámetros totales | 305.185.536 (~305M) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2.048 tokens (max_position_embeddings) |
| Tipos de cuantización | No disponible (pesos en bf16) |
| Idiomas soportados | Inglés (entrenado solo con Dolma, corpus en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura OLMo2 en su variante densa media: hidden_size de 768, intermediate_size de 3072, 16 capas ocultas, 12 cabezas de atención y 12 cabezas clave-valor (MHA sin GQA), con una ventana de contexto de 2.048 posiciones. La configuración exacta corresponde al fichero `configs/model/olmo2_medium_dense.yaml` del repositorio jjalora/diet-lm.

El entrenamiento fue un preentrenamiento puro de modelado de lenguaje con cross-entropy (sin destilación, `teacher_schedule=none`), sobre el dataset `emozilla/dolma-v1_7-3B`, un espejo nativo de Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes de mezcla, servido en streaming sin preempaquetar. Se usó el optimizador AdamW con lr=3e-5, betas (0.9, 0.95), weight decay de 0.1, planificación coseno y precisión bf16. La ejecución constó de 30.517 pasos máximo (con guardado cada 950 pasos) sobre una GPU H100 en el clúster "makau", con un presupuesto de 2.000 millones de tokens. No hubo RLHF ni DPO: el modelo es un checkpoint de preentrenamiento sin alinear. La característica distintiva de la colección es que todas las ejecuciones son idénticas salvo la semilla aleatoria, lo que habilita análisis de trayectoria en el espacio de pesos.

## Capacidades

- Generación de texto básica en inglés, como cualquier modelo de lenguaje preentrenado sin ajuste fino.
- Sin instrucción ni alineación: no sigue instrucciones de forma fiable ni ha pasado por RLHF/DPO.
- Sin soporte documentado de tool calling ni function calling.
- Sin capacidades multimodales (solo texto).
- Utilidad principal como objeto de estudio: análisis de trayectorias de entrenamiento, comparación entre semillas, interpolación y fusión de pesos, e investigación en weight-space.
- Serie de checkpoints intermedios (ramas `stepN`) que permiten estudiar la evolución del modelo a lo largo del entrenamiento.

## Casos de uso

- Análisis de trayectorias en el espacio de pesos: comparar los checkpoints de esta semilla 9 con las demás semillas de la colección DIET para estudiar convergencia, linealidad de trayectorias y mode connectivity.
- Investigación en model averaging y fusion de pesos: evaluar técnicas como model soup o interpolación lineal entre modelos entrenados con distintas semillas sobre la misma arquitectura y datos.
- Estudios de destilación: el proyecto DIET incluye mecanismos de destilación (`run_distillation.py`); este run con `teacher_schedule=none` sirve como línea base sin profesor para comparar contra runs destilados.
- Reproducción de experimentos de preentrenamiento: al publicar receta, datos, semilla y presupuesto de tokens, es útil como referencia para replicar condiciones de entrenamiento controladas.
- Educación e investigación en transformers: el tamaño moderado (~305M) y el contexto corto lo hacen manejable para experimentos académicos en GPUs de consumo.
- Benchmarking de eficiencia de entrenamiento: con checkpoints cada 950 pasos, se pueden evaluar curvas de pérdida y dinámicas de aprendizaje a lo largo de los 30.517 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Además, al tratarse de un modelo de investigación sin alineación, su rendimiento en benchmarks estándar (MMLU, HumanEval, GSM8K) no es el objetivo del artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB en bf16 (305M de parámetros × 2 bytes), más overhead de activaciones; cualquier GPU moderna es suficiente.
- Entrenamiento original: una sola GPU H100 (según `run.json`, clúster "makau").
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4090 o incluso GPUs de portátil con 8 GB de VRAM.
- Despliegue: compatible con la librería transformers de Hugging Face (endpoints_compatible); debería funcionar también con vLLM, llama.cpp (previa conversión a GGUF) y Ollama, aunque no hay soporte documentado explícito.
- No se dispone de datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos | Licencia | Propósito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed9 | ~305M | 2.048 | Dolma v1.7 (2B tokens) | Apache 2.0 | Investigación de trayectorias |
| Pythia-410m (colección diet-traj-pythia-410m) | 410M | 2.048 | Pile | Apache 2.0 | Investigación de trayectorias (arquitectura GPT-NeoX) |
| OLMo2-1B (AI2, oficial) | ~1.400M | 4.096 | Dolma (varios T tokens) | Apache 2.0 | Modelo de lenguaje de uso general |

Frente a Pythia-410m, este modelo ofrece la misma filosofía de checkpoints públicos para análisis científico pero con arquitectura OLMo2 moderna y datos Dolma. Frente al OLMo2 oficial de AI2, es mucho más pequeño y no está pensado para aplicaciones, pero comparte arquitectura y familia de datos, lo que lo convierte en un banco de pruebas a escala reducida.

## Limitaciones y advertencias

- No está alineado: no sigue instrucciones, puede generar texto incoherente o ofensivo heredado de Dolma, y no debe desplegarse en producción como asistente.
- Riesgo alto de alucinación y sesgos: Dolma contiene datos web sin filtrado de seguridad orientado a despliegue, y el modelo no ha pasado por ajuste de preferencias.
- Solo inglés: no es adecuado para tareas en castellano u otros idiomas.
- Contexto corto de 2.048 tokens, limitante para documentos largos.
- La licencia Apache 2.0 sí permite uso comercial de los pesos, pero el propósito del artefacto es investigador.
- La utilidad del modelo depende de la existencia de las demás semillas de la colección DIET (misma receta, distinta semilla); analizado en isolation pierde gran parte de su valor.
- La información de provenance indica `git_commit: unknown`, lo que puede dificultar la reproducibilidad exacta del código de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed9
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Repositorio de código referenciado: jjalora/diet-lm (mencionado en la model card; no se dispone de URL verificada)
- Colección relacionada: jjalora/diet-traj-pythia-410m (mencionada en la model card; no se dispone de URL verificada)
- Paper, blog o demo: no disponibles en la información proporcionada.
