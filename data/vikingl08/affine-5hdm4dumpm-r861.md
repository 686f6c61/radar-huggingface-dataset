# vikingL08/Affine-5hdm4dumpm-r861

## Resumen

Affine-5hdm4dumpm-r861 es un checkpoint de la familia Affine, desarrollado por vikingL08 como parte del programa de minería SN120. Se trata de un modelo de razonamiento (Reason v4) construido sobre el modelo base vera6/affine-5g4yy75zuz-t6, optimizado mediante entrenamiento offline con DPO (Direct Preference Optimization) sobre pares de duelos generados por el propio sistema. El modelo tiene una arquitectura MoE (Mixture of Experts) basada en Qwen3.5, con 35.107 millones de parámetros totales, y está orientado a la evaluación competitiva de razonamiento en el contexto de la minería de modelos Affine, no como un chatbot de propósito general.

El checkpoint se distingue por su enfoque metodológico: combina LoRA de rango medio (r=32, α=128), un factor β de 0.1, una tasa de aprendizaje extremadamente baja (5e-7) y un contexto suave de 12.288 tokens. El entrenamiento se realizó sobre 8 GPUs B200, y el resultado fue validado contra el "rey" vivo del reinado 36, superándolo con un margen estadísticamente significativo (z=2.177). Aunque su licencia es Apache-2.0, su uso previsto es específico para el sistema de minería Affine, no para aplicaciones generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts, basada en Qwen3.5) |
| Parametros totales | 35.107.181.936 (35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | 12.288 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (16 shards, ~66 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MoE de la familia Qwen3.5, adaptada al framework Affine. No se dispone de detalles sobre el número de expertos ni la configuración exacta de la capa MoE. El entrenamiento consistió en un refinamiento offline con DPO (Direct Preference Optimization) sobre pares de duelos generados previamente, donde se optimizó la preferencia hacia pensamientos que elevan la puntuación de razonamiento (Reason) del lado del profesor. El método no utilizó SFT ni GRPO online, sino que partió de un modelo base ya entrenado y aplicó LoRA con r=32, α=128 y β=0.1, con una tasa de aprendizaje de 5e-7 y 19.200 pasos máximos en 4 épocas.

La innovación clave del entrenamiento reside en el uso de una función de razón templada (τ=0.03) que combina log-mean-exp sobre múltiples muestras de referencia del profesor (k=3). Además, el modelo fue validado con un criterio de "corona" que exige una mediana de pensamiento |z| ≥ 80 y una tasa de aprobación B ≥ 0.30. El resultado superó al modelo de referencia vivo (reign 36) con un margen de +0.003665 y un z-score de 2.177, lo que permitió su licencia para la etapa 5 del sistema de minería.

## Capacidades

- Generación de texto con enfoque en razonamiento de múltiples pasos (Reason v4).
- Optimización específica para duelos de razonamiento en el sistema de minería Affine SN120.
- Manejo de contexto largo de hasta 12.288 tokens por turno.
- Capacidad de procesamiento de entradas de imagen y texto (según el tag `image-text-to-text`).
- No se ha documentado soporte para tool calling, function calling ni agentes autónomos.
- Capacidades multilingües no especificadas en la información disponible.

## Casos de uso

- Minería de modelos Affine: el modelo está diseñado para participar en el sistema de duelos de razonamiento de la red Affine, donde compite contra otros checkpoints para mejorar la calidad del razonamiento generado.
- Evaluación de razonamiento en pipelines de investigación: puede integrarse en sistemas de evaluación que requieran comparar la calidad de razonamiento entre variantes de modelos, usando el protocolo Reason v4 con múltiples referencias.
- Generación de preferencias de entrenamiento: como parte del pipeline de minería, puede servir para generar pares de duelos etiquetados que se usarán en futuros entrenamientos DPO.
- Benchmark de razonamiento interno: útil para equipos que desarrollen sus propios sistemas de evaluación de razonamiento y necesiten un modelo de referencia con métricas conocidas (z, SE, margen).
- Investigación sobre DPO offline: el checkpoint documenta un experimento completo con hiperparámetros específicos, lo que lo convierte en un caso de estudio para investigadores que trabajen con preferencias offline.
- No es recomendable para aplicaciones de producción general (chat, generación de código, atención al cliente) por su naturaleza de especialización en minería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento documentado es la validación local frente al modelo base, bajo el protocolo de evaluación Reason v4 (wvk=7):

| Métrica | Valor |
|---|---|
| Margen vs rey vivo (reign 36) | +0.003665 |
| Error estándar (SE) | 0.001684 |
| Estadístico z | 2.177 |
| Tamaño de muestra (n) | 80 |
| Barra de aprobación | max(2·SE, δ=0.002) = 0.003367 |
| Mediana de pensamiento | 141.5 |
| Tasa de aprobación B | 0.5375 |

Este resultado indica una mejora estadísticamente significativa frente al modelo base, pero no proporciona una comparación con otros modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero con 35.1B parámetros totales en formato MoE, la inferencia completa requeriría aproximadamente 70 GB en FP16, reducible a 18-20 GB con cuantización Q4_K_M (estimación típica para MoE de este tamaño).
- GPUs recomendadas: no especificadas por el autor. Para entrenamiento se usaron 8×NVIDIA B200 (80 GB HBM cada una).
- Compatibilidad con GPU de consumo: posible con cuantización en una RTX 4090 (24 GB) o similar, aunque sin datos oficiales de rendimiento.
- Opciones de despliegue: compatible con transformers (Hugging Face), vLLM, llama.cpp (si se convierte a GGUF), Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con modelos equivalentes de la misma categoría (modelos de razonamiento para minería Affine). No hay datos públicos de otros modelos SN1 que permitan una comparación directa.

## Limitaciones y advertencias

- Modelo de propósito específico: no es un chat general ni un asistente de código; su uso fuera del sistema de minería Affine puede producir resultados no deseados.
- Datos de entrenamiento no documentados: no se especifica la composición del dataset (solo se menciona un archivo `dpo_duel_reason.jsonl` con 259-604 filas), lo que limita la evaluación de sesgos.
- Riesgo de alucinación: al ser un modelo de razonamiento, puede generar razonamientos coherentes pero incorrectos en dominios fuera de su entrenamiento.
- Contexto limitado: la ventana de 12.288 tokens es reducida comparada con otros modelos modernos (32k-128k).
- Dependencia del framework Affine: el modelo requiere el sistema de evaluación Affine para funcionar según su diseño, y la validación solo aplica a ese entorno.
- Licencia Apache-2.0: permite uso comercial, pero la model card indica que sigue la política de artefactos de minería Affine, lo que puede implicar restricciones adicionales no especificadas.

## Enlaces

- Hugging Face: https://huggingface.co/vikingL08/Affine-5hdm4dumpm-r861
- Modelo base: https://huggingface.co/vera6/affine-5g4yy75zuz-t6
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
