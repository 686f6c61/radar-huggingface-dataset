# Zeroxdesignart/Kumo-Tabular

## Resumen
Kumo Tabular es un modelo fundacional tabular preentrenado, según indica su model card, desarrollado por NVIDIA. Está diseñado para tareas de clasificación y regresión sobre datos estructurados. El modelo se distribuye a través del repositorio de HuggingFace Zeroxdesignart/Kumo-Tabular, aunque la autoría del desarrollo se atribuye a NVIDIA. Resuelve el problema de aplicar aprendizaje automático a datos tabulares sin necesidad de reentrenar desde cero: utiliza ejemplos etiquetados como contexto para predecir nuevas instancias, un enfoque conocido como aprendizaje en contexto.

La relevancia de este modelo radica en que los datos tabulares son predominantes en sectores como finanzas, sanidad o industria, y los modelos fundacionales prometen reducir la ingeniería de características y la necesidad de grandes volúmenes de datos etiquetados. La model card no especifica arquitectura, tamaño de parámetros ni longitud de contexto. El repositorio ocupa 2,4 GB, lo que da una idea aproximada del tamaño de los pesos. Se libera bajo licencia OpenMDW 1.1.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional tabular (arquitectura no especificada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (en el ejemplo se usan 300 filas de contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo para datos tabulares) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | No disponible (probablemente PyTorch, pero no confirmado) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo. Se describe como un modelo fundacional tabular preentrenado, lo que sugiere que emplea una arquitectura de red neuronal (posiblemente transformer) adaptada a datos estructurados, aunque no se confirma. El modelo utiliza un esquema de aprendizaje en contexto: recibe un conjunto de ejemplos etiquetados (x_context, y_context) y un conjunto de consulta (x_query) para predecir las etiquetas de la consulta. En el ejemplo de uso se emplean 300 filas de contexto y 8 estimadores (num_estimators=8), lo que indica un mecanismo de ensemble.

No se especifican los datos de entrenamiento, el número de tokens (no aplicable en el sentido tradicional) ni si se utilizaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación y regresión sobre datos tabulares.
- Aprendizaje en contexto: utiliza ejemplos etiquetados como contexto para predecir nuevas instancias sin reentrenamiento.
- Soporte de ensemble mediante el parámetro num_estimators (se usan 8 en el ejemplo).
- Ejecución en GPU (CUDA) o CPU.
- Inferencia con precisión mixta (float16) en GPU.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües ni otras modalidades (visión, audio). Dado que es un modelo tabular, estas capacidades no aplican.

## Casos de uso
- Predicción de riesgo crediticio: usar datos históricos de clientes etiquetados como contexto para predecir la probabilidad de impago de nuevos solicitantes. El modelo puede manejar variables mixtas sin necesidad de reentrenamiento.
- Diagnóstico asistido: clasificar pacientes a partir de variables clínicas tabulares, como en el ejemplo de cáncer de mama de scikit-learn. Se proporcionan casos previos etiquetados y se consultan nuevos casos.
- Detección de fraude: identificar transacciones fraudulentas proporcionando ejemplos de transacciones pasadas etiquetadas y consultando las nuevas. La capacidad de ensemble mejora la robustez.
- Mantenimiento predictivo: predecir fallos en maquinaria a partir de lecturas de sensores, usando datos históricos como contexto. Útil cuando hay pocos fallos etiquetados.
- Segmentación de clientes: clasificar clientes en grupos según características demográficas y de comportamiento para campañas de marketing. El modelo aprende de ejemplos etiquetados sin entrenamiento adicional.
- Predicción de precios: estimar el valor de inmuebles u otros activos mediante regresión sobre características tabulares. Se pueden incorporar ejemplos recientes como contexto para adaptarse al mercado.
- Análisis de experimentos: evaluar resultados de ensayos clínicos o experimentos A/B mediante regresión sobre variables tabulares, usando datos históricos como referencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Tamaño del repositorio: 2,4 GB. Los pesos probablemente ocupan un tamaño similar.
- VRAM estimada: no hay requisitos oficiales. Con pesos en float16 (~2,4 GB) y datos de contexto, se estima un consumo de 4-6 GB de VRAM para inferencia. No se especifican cuantizaciones.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 6 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 3060, RTX 4090, A100, H100). También puede ejecutarse en CPU.
- Cabe en GPU de consumo: probablemente sí, en GPUs con 6 GB o más.
- Opciones de despliegue: mediante la librería `structured-data-models` (pip install structured-data-models), usando PyTorch. No se mencionan vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de Kumo Tabular para compararlo con otros modelos. Existen alternativas en el ámbito de los modelos fundacionales tabulares, como TabPFN (PriorLabs), pero no se proporcionan especificaciones de Kumo Tabular que permitan una comparación cuantitativa. Se indica "no disponible".

## Limitaciones y advertencias
- Sesgos conocidos: no se han documentado sesgos específicos. Al ser un modelo entrenado con datos, puede heredar sesgos presentes en los mismos.
- Riesgo de alucinación: en el contexto tabular, el riesgo se traduce en predicciones incorrectas. No se proporcionan métricas de calibración o incertidumbre.
- Limitaciones de contexto: no se especifica el número máximo de filas o características que el modelo puede manejar como contexto. En el ejemplo se usan 300 filas, pero se desconoce el límite.
- Restricciones de licencia: la licencia es OpenMDW 1.1. No se detallan en la información proporcionada las condiciones exactas para uso comercial. Se recomienda revisar el texto completo de la licencia.
- Caveat de producción: el modelo ha sido subido por el usuario Zeroxdesignart, no por NVIDIA directamente, aunque la model card atribuye la autoría a NVIDIA. Esto podría implicar que no es una distribución oficial y que podría no recibir mantenimiento o actualizaciones.
- Idiomas: no aplica, pero si se usan datos con texto codificado, el modelo no procesa lenguaje natural.

## Enlaces
- HuggingFace: https://huggingface.co/Zeroxdesignart/Kumo-Tabular
- GitHub de NVIDIA structured-data-models: https://github.com/NVIDIA/structured-data-models
- Licencia OpenMDW 1.1: no se proporciona enlace directo en la información disponible.
