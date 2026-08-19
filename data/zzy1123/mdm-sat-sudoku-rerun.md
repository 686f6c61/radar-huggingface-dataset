# zzy1123/mdm-sat-sudoku-rerun

## Resumen

El modelo `zzy1123/mdm-sat-sudoku-rerun` es un conjunto de checkpoints de un experimento de reproducibilidad para el paper *"Random Remasking Scales: A Unified View of Masked Diffusion Inference"*. Lo desarrolla el autor `zzy1123` y contiene 12 ejecuciones de entrenamiento de un modelo de difusión discreta enmascarada (masked diffusion) de pequeño tamaño, con 6,85 millones de parámetros, aplicado a dos tareas combinatorias: resolución de Sudoku (variante Hard) y problemas 3-SAT del conjunto SATLIB uf20-91. El objetivo es verificar la reproducibilidad de los resultados del paper, entrenando desde cero con tres semillas distintas por configuración y guardando checkpoints intermedios para trazar curvas de precisión frente al paso de entrenamiento.

El modelo no es un modelo de lenguaje general, sino un transformer estilo Qwen2 adaptado para difusión enmascarada sobre secuencias discretas. Su relevancia radica en que proporciona artefactos de entrenamiento completos (checkpoints y configuraciones) para que otros investigadores puedan replicar y comparar métodos de inferencia en difusión enmascarada, como R2D, ReMDM o decodificación estándar. La arquitectura es compacta (8 capas, 8 cabezas, dimensión oculta 256) y el contexto máximo varía según la tarea: 162 posiciones para Sudoku y 384 para 3-SAT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-style MDMTransformer (masked diffusion transformer) |
| Parametros totales | 6,85 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 162 (Sudoku) / 384 (3-SAT) |
| Tipos de cuantizacion | no disponible (checkpoints en fp32) |
| Idiomas soportados | no aplicable (modelo de tarea especifica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (state_dict en fp32) |

## Arquitectura y entrenamiento

El modelo es un transformer con diseño similar a Qwen2, pero adaptado para difusión discreta enmascarada. La configuración incluye dimensión oculta 256, dimensión intermedia 768, 8 capas, 8 cabezas de atención y normalización RMSNorm. El vocabulario es específico de cada tarea: 11 tokens para Sudoku (con token de máscara `10`) y 42 tokens para 3-SAT (con token de máscara `0`). La posición máxima es 162 para Sudoku y 384 para 3-SAT.

El entrenamiento se realizó desde cero sobre un código base limpio, con dos métodos de entrenamiento: estándar (MDM) y TCT (Training with Curriculum? o similar, con K=8 para Sudoku y K=5 para 3-SAT). Se usaron tres semillas por configuración, con batch size de 128 para Sudoku y 512 para 3-SAT. Los checkpoints se guardaron cada 25k pasos para Sudoku (hasta 500k) y cada 5k pasos para 3-SAT (hasta 100k). Cada archivo `.pt` contiene el `model_state_dict` y la configuración de entrenamiento (sin estado del optimizador), con un tamaño aproximado de 27 MB. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo de lenguaje conversacional.

## Capacidades

- Generación de soluciones para Sudoku (variante Hard) mediante difusión enmascarada, completando tableros parcialmente rellenados.
- Generación de asignaciones satisfacibles para problemas 3-SAT (SATLIB uf20-91), es decir, encontrar valores de variables que satisfagan todas las cláusulas.
- Soporte de múltiples métodos de inferencia: decodificación estándar, R2D (Random Remasking Diffusion) y ReMDM (Reverse Masked Diffusion Model), según el repositorio asociado.
- Capacidad de reproducibilidad experimental: los checkpoints permiten reconstruir curvas de precisión frente al paso de entrenamiento.
- No es un modelo de lenguaje: no genera texto libre, no tiene capacidades de conversación, tool calling, agentes ni razonamiento multilingüe.

## Casos de uso

- Investigación en difusión discreta enmascarada: los checkpoints permiten reproducir los experimentos del paper y comparar métricas de precisión en Sudoku y 3-SAT con diferentes métodos de decodificación.
- Evaluación de algoritmos de remasking: investigadores pueden usar estos checkpoints para probar variantes de R2D o ReMDM y medir su impacto en la tasa de solución.
- Estudio de la escalabilidad de modelos pequeños: al ser solo 6,85M de parámetros, es útil para analizar cómo el tamaño del modelo afecta el rendimiento en tareas combinatorias.
- Desarrollo de técnicas de muestreo para difusión: los checkpoints sirven como banco de pruebas para nuevos esquemas de remasking o estrategias de inferencia.
- Verificación de reproducibilidad en IA: el conjunto de 12 ejecuciones con semillas múltiples permite auditar la estabilidad del entrenamiento y la variabilidad entre semillas.
- Docencia y formación: como modelo pequeño y de código abierto, puede usarse en cursos sobre modelos generativos discretos o razonamiento automático, sin necesidad de hardware potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, tasas de solución ni comparaciones con otros modelos. Solo se indica que los checkpoints están destinados a generar curvas de precisión frente al paso de entrenamiento, pero no se proporcionan los valores numéricos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 6,85M de parámetros en fp32, el checkpoint ocupa ~27 MB. La inferencia puede ejecutarse en CPU sin problemas, y en GPU consumer (por ejemplo, RTX 3060 o superior) con uso mínimo de memoria.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también es viable en CPU para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: al ser un modelo de investigación con checkpoints en formato PyTorch, se puede cargar directamente con `torch.load`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponible. Dado el tamaño reducido, se espera una latencia muy baja (del orden de milisegundos por muestra en GPU), pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un checkpoint específico para un experimento de difusión enmascarada en tareas combinatorias, no de un modelo de lenguaje general. Otros modelos de difusión enmascarada (como MDM original) podrían ser comparables, pero no se dispone de datos de rendimiento ni de configuraciones equivalentes.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas de lenguaje natural.
- Sesgos: al ser entrenado solo en Sudoku y 3-SAT, no tiene sesgos lingüísticos, pero su rendimiento está limitado a estas tareas específicas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero puede producir soluciones incorrectas si la inferencia no converge.
- Limitaciones de contexto: la longitud máxima de secuencia es fija (162 para Sudoku, 384 para 3-SAT); no soporta entradas más largas.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación, pero el modelo no es útil para aplicaciones comerciales generales.
- Dependencia del repositorio externo: el código de inferencia (R2D, ReMDM) está en un repositorio llamado `r2d-markovian-expt`, que no se ha enlazado directamente en la model card; puede requerir acceso al código fuente del paper para reproducir los resultados.
- Fecha de creación futura: el modelo fue creado el 14 de agosto de 2026, lo que sugiere que es un artefacto reciente y posiblemente aún no validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/zzy1123/mdm-sat-sudoku-rerun
- Repositorio de código asociado: `r2d-markovian-expt` (mencionado en la model card, sin URL directa)
- Paper: *"Random Remasking Scales: A Unified View of Masked Diffusion Inference"* (sin DOI ni URL en la información proporcionada)
