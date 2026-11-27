# Zahid775/HyperAggNet

## Resumen

HyperAggNet es un modelo de extracción de características y clasificación binaria orientado a la predicción de agregación proteica y de péptidos amiloides. Lo desarrolla el autor independiente Zahid775 (repositorio GitHub: Zahid-coder-17), y se publica bajo licencia MIT. El modelo combina embeddings derivados de ESM-2 con un mecanismo de atención de consultas agrupadas (grouped-query attention, GQA) cuyos parámetros de proyección se generan dinámicamente mediante una hiperred, de ahí el nombre "adaptive hypernetwork-based". Resuelve un problema acotado pero relevante en biología computacional: determinar si una secuencia peptídica tiene propensión a formar agregados amiloides, algo vinculado a enfermedades neurodegenerativas como Alzheimer o Parkinson.

La arquitectura es un transformer de 12 capas y dimensión oculta 512 que consume tres tipos de entrada: un embedding de secuencia de dimensión 320 (compatible con ESM-2), un vector de descriptores AAindex de dimensión 10 y un vector de características estructurales de dimensión 4. El modelo se distribuye como checkpoints de PyTorch (state dicts completos) en cinco semillas independientes, junto con las líneas base Original AggNet, transformer estándar y GQA convencional. El repositorio de Hugging Face ocupa 0,4 GB y no incluye pesos en formato safetensors ni GGUF.

Su relevancia actual es doble: por un lado, aplica una innovación de eficiencia de la IA generativa (GQA con hiperred) a un dominio científico especializado; por otro, reporta una reducción del 75 % en memoria de caché KV y un throughput de 1.224,2 secuencias por segundo con solo 1,06 GB de VRAM, lo que lo hace atractivo para cribados masivos de secuencias en hardware modesto. No obstante, la información pública es escasa y el modelo no declara idiomas soportados ni datos de entrenamiento detallados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con grouped-query attention (GQA) y proyecciones generadas por hiperred adaptativa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pt`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

HyperAggNet es un transformer de 12 capas con dimensión oculta de 512. La entrada se compone de tres flujos: un embedding de secuencia de dimensión 320 (presumiblemente derivado de ESM-2, según la etiqueta `esm2` de la model card), un vector de descriptores fisicoquímicos AAindex de dimensión 10 y un vector de características estructurales de dimensión 4. La innovación central es el uso de GQA, en el que los parámetros de proyección de las consultas, claves y valores no son fijos, sino que se generan dinámicamente mediante una hiperred condicionada por la representación de la secuencia. Esto permite compartir cabezas KV de forma adaptativa y reduce el tamaño de la caché KV en un 75 % respecto a la atención multi-cabeza estándar.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla el esquema de preentrenamiento del backbone ESM-2 ni el proceso de ajuste fino para la tarea de clasificación de agregación. La model card menciona cinco semillas independientes con checkpoints completos, lo que sugiere un protocolo de evaluación con repetibilidad estadística, pero no se documentan los hiperparámetros de entrenamiento.

## Capacidades

- Clasificación binaria de propensión a agregación amiloide en secuencias peptídicas (tarea principal).
- Extracción de características (`feature-extraction`) de secuencias proteicas y peptídicas.
- Procesamiento de secuencias con codificación ESM-2 de dimensión 320.
- Integración de descriptores fisicoquímicos AAindex y características estructurales en la representación de entrada.
- Inferencia de alto throughput: 1.224,2 secuencias por segundo con 1,06 GB de VRAM.
- Reducción del 75 % de memoria de caché KV gracias a GQA con hiperred.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento multi-paso.
- No se documentan capacidades multilingües (el modelo opera sobre secuencias biológicas, no sobre texto natural).

## Casos de uso

- Cribado masivo de proteomas: dado su throughput de 1.224 secuencias por segundo y su bajo consumo de VRAM (1,06 GB), el modelo puede procesar catálogos completos de péptidos para identificar candidatos con propensión amiloide antes de análisis experimental.
- Priorización de dianas en investigación de neurodegeneración: clasificar variantes peptídicas asociadas a Alzheimer o Parkinson para seleccionar las más prometedoras en estudios in vitro.
- Filtrado en pipelines de diseño de péptidos: integrar HyperAggNet como paso de control de calidad en flujos generativos de péptidos terapéuticos, descartando secuencias con alta probabilidad de agregación.
- Anotación de bases de datos biológicas: enriquecer repositorios de secuencias con etiquetas de riesgo amiloide usando la extracción de características del modelo como representación intermedia.
- Análisis de estabilidad en formulación de biofármacos: evaluar regiones de anticuerpos o proteínas recombinantes propensas a agregarse durante el desarrollo de formulaciones.
- Investigación metodológica sobre GQA e hiperredes: el repositorio incluye las líneas base Original AggNet, transformer estándar y GQA convencional con cinco semillas, lo que permite reproducir comparativas de eficiencia y precisión.
- Docencia y experimentación en biología computacional: al ser MIT y ligero, sirve para demostrar técnicas de atención eficiente aplicadas a datos biológicos en entornos con GPU de consumo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Amyloid Peptide (AP) Accuracy | 98,12 ± 0,88 % |
| Matthews Correlation Coefficient (MCC) | 0,9592 ± 0,0192 |
| ROC-AUC | 0,9945 |
| Reduccion de memoria de cache KV | 75,0 % |
| Throughput | 1.224,2 secuencias/s |
| VRAM en inferencia | 1,06 GB |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de predicción de agregación amiloide (por ejemplo, AmylPred, Aggrescan o variantes de ESM-2 ajustadas), ni métricas en conjuntos de test independientes más allá de las reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,06 GB según la model card, lo que corresponde a pesos en precisión completa (FP32) o mixta, dado el tamaño del repositorio (0,4 GB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe holgadamente en GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: el modelo se carga mediante PyTorch puro con `torch.load` y `load_state_dict`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo de texto.
- Latencia y throughput: 1.224,2 secuencias por segundo a 1,06 GB de VRAM según el autor; no se especifica la GPU utilizada para esa medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyperAggNet | no disponible (12 capas, dim. 512) | no disponible | GQA + hiperred sobre ESM-2 | MIT | Hugging Face + GitHub |
| Original AggNet | no disponible | no disponible | Línea base del autor | MIT (presumible) | GitHub del autor |
| Transformer estándar (línea base) | no disponible | no disponible | Atención multi-cabeza | MIT (presumible) | GitHub del autor |
| GQA convencional (línea base) | no disponible | no disponible | GQA sin hiperred | MIT (presumible) | GitHub del autor |

No se dispone de datos de benchmarks de modelos externos comparables (AmylPred, Aggrescan, Waltz, variantes ajustadas de ESM-2) en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset no especificado, puede presentar sesgo hacia las familias de péptidos amiloides sobrerrepresentadas en los datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y negativos en la clasificación; el MCC de 0,9592 ± 0,0192 indica buen equilibrio, aunque las métricas proceden del propio autor y no de una validación independiente.
- Limitaciones de contexto e idioma: no se especifica la longitud máxima de secuencia soportada ni el rango de proteínas evaluadas; el modelo está pensado para péptidos y secuencias cortas, no para proteomas completos de gran tamaño.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo depende de representaciones ESM-2, cuya licencia (MIT para las versiones abiertas de Meta) debe verificarse por separado si se redistribuye.
- Caveat para producción: el repositorio tiene 0 descargas y 0 likes, sin validación externa ni revisión por pares; las métricas reportadas no han sido replicadas de forma independiente.
- Formato de pesos: solo se distribuyen state dicts de PyTorch, sin safetensors ni GGUF, lo que dificulta su integración en ecosistemas de inferencia estandarizados y aumenta el riesgo de deserialización insegura con `torch.load`.
- Documentación incompleta: no se detallan datos de entrenamiento, hiperparámetros, composición del dataset ni protocolo de evaluación, lo que limita la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Zahid775/HyperAggNet
- Repositorio GitHub: https://github.com/Zahid-coder-17/HyperAggNet
- Paper: no disponible
- Blog o demo: no disponible
