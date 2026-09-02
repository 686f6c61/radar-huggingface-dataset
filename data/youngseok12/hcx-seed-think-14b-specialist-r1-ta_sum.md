# youngseok12/HCX-SEED-Think-14B-specialist-r1-ta_sum

## Resumen

El modelo `youngseok12/HCX-SEED-Think-14B-specialist-r1-ta_sum` es un modelo de lenguaje derivado de `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, desarrollado por el usuario youngseok12. Se trata de un modelo de investigación que fusiona tres adaptadores LoRA especializados (K, R y C) mediante la técnica de *task arithmetic* (suma lineal de pesos) sobre el modelo base. Cada LoRA fue entrenada por separado con 3.000 ejemplos de un eje temático distinto: conocimiento médico (KMMLU-Pro), razonamiento numérico (MuSR en coreano) y razonamiento causal (Com2-main en coreano). El resultado es un modelo único con pesos completos en BF16, sin necesidad de cargar adaptadores adicionales.

El modelo está orientado a tareas de razonamiento y conocimiento en coreano, con un formato de respuesta *answer-first* (la respuesta se genera antes que el razonamiento). Su relevancia radica en que demuestra cómo la fusión de LoRAs especializadas mediante *task arithmetic* puede producir un modelo capaz de abordar múltiples dominios de razonamiento sin un entrenamiento conjunto adicional. Está pensado para uso en investigación y evaluación, no para producción de alto riesgo. Con 14.748 millones de parámetros, se sitúa en la gama de modelos medianos, y su licencia `hyperclovax-seed` impone restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en HyperCLOVAX-SEED-Think-14B, detalles no disponibles) |
| Parametros totales | 14.748.112.896 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, pero no se especifica) |
| Tipos de cuantizacion | BF16 (safetensors) |
| Idiomas soportados | Coreano (ko) |
| Licencia | hyperclovax-seed (licencia propia de NAVER, con restricciones) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se construye a partir del modelo base `HyperCLOVAX-SEED-Think-14B`, que emplea una arquitectura transformer con mecanismos de razonamiento avanzados (según la documentación de NAVER, combina técnicas de lightweighting con capacidades de razonamiento). Sobre este base se entrenaron tres LoRAs independientes, cada una con la misma configuración: rango 16, alpha 32, dropout 0.05, targeting las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con una tasa de aprendizaje de 5e-5, programación coseno, warmup del 3%, una época, batch efectivo de 16 y longitud máxima de secuencia de 4.096 tokens, en precisión BF16.

Cada LoRA se entrenó con 3.000 ejemplos de un dataset específico: K-LoRA con datos de conocimiento médico (AI Hub 71875), R-LoRA con datos de razonamiento numérico (AI Hub 71568) y C-LoRA con datos de razonamiento causal (AI Hub 71949). Todos los datos se preprocesaron para convertir preguntas de 5 opciones a 4 opciones (①②③④) y se equilibró la posición de la respuesta correcta. Tras el entrenamiento, los tres LoRAs se fusionaron mediante *task arithmetic* lineal con pesos 1.0/1.0/1.0, generando un modelo de pesos completos. No se aplicó RLHF ni DPO; el objetivo de entrenamiento fue la pérdida de entropía cruzada causal sobre los tokens de asistente.

## Capacidades

- Generación de texto en coreano con formato *answer-first*: el modelo produce primero la opción correcta (①②③④) y después el razonamiento.
- Razonamiento sobre conocimiento médico: entrenado con datos de KMMLU-Pro, puede responder preguntas de opción múltiple sobre medicina y salud.
- Razonamiento numérico y aritmético: entrenado con datos de MuSR (coreano), maneja problemas que requieren cálculo y comprensión de expresiones matemáticas.
- Razonamiento causal: entrenado con datos de Com2-main (coreano), aborda tareas de inferencia de relaciones causa-efecto.
- Capacidad multilingüe limitada: el modelo está especializado en coreano; no se reportan capacidades en otros idiomas.
- No se mencionan capacidades de *tool calling*, agentes, visión ni audio.

## Casos de uso

- Evaluación de modelos de razonamiento en coreano: el modelo puede servir como referencia para comparar el rendimiento de otros sistemas en tareas de conocimiento médico, numérico y causal, gracias a su entrenamiento específico en esos dominios.
- Investigación sobre fusión de LoRAs: al ser un ejemplo de *task arithmetic* con tres especialistas, es útil para estudiar cómo se combinan conocimientos heterogéneos en un único modelo sin degradación catastrófica.
- Generación de respuestas con justificación en entornos académicos: puede utilizarse para producir explicaciones paso a paso en problemas de razonamiento numérico o causal, aunque con cautela por su posible inexactitud.
- Prototipado de asistentes de conocimiento médico en coreano: dado su entrenamiento en datos médicos, puede explorarse como base para un sistema de preguntas y respuestas sobre salud, siempre que se valide rigurosamente y no se use en decisiones clínicas reales.
- Análisis de sesgos en razonamiento causal: al estar entrenado con datos sintéticos de causalidad, puede emplearse para estudiar cómo los modelos abordan inferencias causales y qué errores cometen.
- Benchmarking de modelos coreanos: su formato *answer-first* y su especialización lo convierten en un candidato para pruebas de rendimiento en conjuntos de datos públicos coreanos de opción múltiple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "sonda de formato" interna (240 ítems de benchmarks públicos canónicos, greedy) que reporta que el 100% de las salidas presentan la respuesta al inicio, con una media de 20 tokens de salida, pero no se ofrecen métricas de precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 29,5 GB (tamaño del repositorio). Para inferencia se necesitan al menos 30 GB de VRAM, lo que implica una GPU profesional como A100 40GB, A100 80GB, H100 o similar.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, o GPUs de consumo con 32 GB o más (por ejemplo, RTX 4090 con 24 GB no sería suficiente en BF16; se requeriría cuantización adicional, pero no se ofrecen versiones cuantizadas).
- No cabe en GPUs de consumo típicas (8-16 GB) sin cuantización, y no se proporcionan archivos GGUF ni AWQ.
- Opciones de despliegue: al ser un modelo de la familia transformers con safetensors, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no hay configuraciones predefinidas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base `HyperCLOVAX-SEED-Think-14B` es el punto de referencia natural, pero no se han publicado métricas comparativas entre ambos. Tampoco se conocen otros modelos con la misma combinación de LoRAs fusionadas. Por tanto, la comparativa se limita a indicar que el modelo comparte arquitectura y tamaño con su base, pero con pesos modificados por la fusión.

## Limitaciones y advertencias

- Modelo de investigación: la propia model card advierte que los resultados pueden ser inexactos y que no debe usarse como única fuente para decisiones de alto riesgo en medicina, derecho o finanzas.
- Sesgo de dominio: al entrenarse con solo 3.000 ejemplos por eje, el modelo puede tener un rendimiento limitado fuera de esos dominios específicos y puede presentar alucinaciones en temas generales.
- Idioma restringido: solo se ha entrenado y evaluado en coreano; no se garantiza un comportamiento adecuado en otros idiomas.
- Licencia restrictiva: la licencia `hyperclovax-seed` incluye una política de usos prohibidos y requisitos de atribución de NAVER; la redistribución debe cumplir con esos términos.
- Sin cuantizaciones: no se ofrecen versiones cuantizadas, lo que limita su despliegue en hardware modesto.
- Datos sintéticos: el dataset de razonamiento causal (71949) se generó sintéticamente a partir de imágenes, lo que puede introducir ruido o inconsistencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youngseok12/HCX-SEED-Think-14B-specialist-r1-ta_sum
- Modelo base: https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- Dataset AI Hub 71875 (conocimiento médico): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71875
- Dataset AI Hub 71568 (razonamiento numérico): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71568
- Dataset AI Hub 71949 (razonamiento causal): https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71949
