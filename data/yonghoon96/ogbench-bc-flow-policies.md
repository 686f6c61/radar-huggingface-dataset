# yonghoon96/ogbench-bc-flow-policies

## Resumen

Este repositorio contiene un conjunto de políticas de flujo (flow policies) preentrenadas mediante behavior cloning (BC) para cada uno de los entornos del benchmark OGBench. OGBench es un benchmark diseñado para la investigación en reinforcement learning (RL) offline goal-conditioned, offline no supervisado y offline RL en general. El autor, yonghoon96, publica estos checkpoints porque, a diferencia de los datasets de OGBench, las políticas preentrenadas no están disponibles en ningún otro sitio; cualquier trabajo que necesite partir de una política preentrenada en estos entornos tendría que repetir el preentrenamiento BC desde cero.

Cada directorio del repositorio contiene un checkpoint `params_300000.pkl` correspondiente a 300 000 pasos de behavior cloning con semilla 10001, junto con el registro de entrenamiento (`flags.json` con la configuración completa y `eval.csv` con la curva de evaluación). Esto permite verificar el checkpoint en lugar de confiar en su validez. El modelo se distribuye bajo licencia MIT y el tamaño total del repositorio es de 5,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow policy (modelo generativo de flujo, probablemente basado en normalizing flows o difusión; no se especifica el tipo exacto) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de política para RL, no procesa texto) |
| Tipos de cuantizacion | no disponible (los pesos se guardan en formato `.pkl`, probablemente en precisión float32) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | `.pkl` (pickle de Python, probablemente conteniendo tensores de PyTorch) |

## Arquitectura y entrenamiento

Las flow policies son modelos generativos que modelan una distribución de acciones condicionada al estado actual y al objetivo deseado. A diferencia de las políticas estocásticas clásicas, una flow policy aprende un mapeo invertible entre una distribución de ruido simple y la distribución de acciones, lo que permite muestrear acciones de forma flexible y calcular densidades exactas. En este caso, las políticas se entrenan mediante behavior cloning, es decir, imitando las demostraciones del dataset offline de cada entorno de OGBench.

El entrenamiento se realizó durante 300 000 pasos de BC con una semilla fija (10001). No se especifica el número de parámetros, la arquitectura interna (número de capas, tipo de flujo, etc.) ni la composición exacta de los datos de entrenamiento. Cada directorio incluye `flags.json` con la configuración completa que produjo el checkpoint, lo que permite reproducir el entrenamiento o inspeccionar los hiperparámetros. La curva de evaluación durante el preentrenamiento se guarda en `eval.csv`.

## Capacidades

- Generación de acciones condicionadas a estado y objetivo: la política toma como entrada el estado actual y un goal, y produce una acción (o distribución de acciones) adecuada para alcanzar ese objetivo.
- Soporte para entornos goal-conditioned: diseñada específicamente para los entornos de OGBench, que incluyen tareas de manipulación, navegación y control con objetivos variados.
- Preentrenamiento para fine-tuning: al ser políticas preentrenadas con BC, sirven como punto de partida para algoritmos de RL offline que requieren una política inicial, como TRQAM o ReFORM.
- Verificabilidad: cada checkpoint incluye su registro de entrenamiento, lo que permite auditar el proceso de preentrenamiento.

## Casos de uso

- Investigación en RL offline goal-conditioned: los checkpoints permiten a los investigadores omitir la fase de preentrenamiento BC y centrarse en algoritmos de fine-tuning, ahorrando tiempo y recursos computacionales.
- Fine-tuning con RL offline: algoritmos como TRQAM (Trust Region Q Adjoint Matching) o ReFORM (Reflected Flows for On-support Offline RL) pueden partir de estas políticas preentradas para mejorar el rendimiento en las tareas de OGBench.
- Evaluación de algoritmos de RL: al tener una política base estandarizada, se pueden comparar de forma justa diferentes métodos de RL offline sobre los mismos entornos.
- Reproducibilidad de experimentos: al incluir la configuración y la curva de evaluación, se puede verificar que el checkpoint es consistente con el proceso de entrenamiento declarado.
- Estudio de behavior cloning en entornos complejos: los datos de entrenamiento y evaluación permiten analizar el comportamiento de BC en tareas goal-conditioned con alta dimensionalidad.
- Benchmarking de políticas preentrenadas: sirven como referencia para medir la calidad de políticas entrenadas con otros métodos (por ejemplo, RL desde cero o BC con más datos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas agregadas de éxito ni comparaciones con otros métodos. Aunque cada directorio contiene `eval.csv` con la curva de evaluación durante el preentrenamiento, no se proporcionan valores numéricos resumidos en la documentación. Se recomienda consultar el repositorio de OGBench o los papers asociados (como ReFORM o TRQAM) para obtener resultados comparativos.

## Requisitos de hardware

- Tamaño del repositorio: 5,2 GB, lo que sugiere que los checkpoints son relativamente grandes (probablemente decenas de millones de parámetros en float32).
- Inferencia: se requiere una GPU con al menos 8-12 GB de VRAM para cargar un checkpoint completo en memoria, aunque el requisito exacto depende del tamaño real del modelo (no especificado).
- Entrenamiento o fine-tuning: se recomienda una GPU con 16 GB o más (por ejemplo, RTX 3090, RTX 4090, A100) para manejar el lote y la memoria del optimizador.
- Despliegue: al ser políticas de flujo, la inferencia implica evaluar el flujo normalizador, lo que puede hacerse en CPU para tareas simples, pero en GPU para latencias bajas.
- Opciones de despliegue: no se mencionan frameworks específicos; al ser checkpoints en `.pkl`, se cargan directamente con PyTorch. No hay soporte conocido para vLLM, llama.cpp u otros motores de inferencia de LLM, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo formato (políticas de flujo preentrenadas para OGBench). El propio autor indica que estos checkpoints no están disponibles en ningún otro sitio, por lo que no existe una alternativa directa. Se podría comparar con políticas preentrenadas de otros benchmarks (por ejemplo, D4RL), pero no son equivalentes en cuanto a entornos ni arquitectura. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Específico de OGBench: las políticas están entrenadas únicamente para los entornos de OGBench; no son generalizables a otras tareas o dominios sin reentrenamiento.
- Preentrenamiento con BC: al ser behavior cloning, la política imita las demostraciones del dataset; si las demostraciones son subóptimas o ruidosas, la política heredará esas limitaciones.
- Sin garantías de rendimiento: no se publican métricas de éxito agregadas; el rendimiento real debe evaluarse en cada entorno concreto.
- Formato de pesos propietario: los checkpoints están en `.pkl`, lo que puede dificultar su uso fuera del ecosistema PyTorch.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece soporte ni garantías.
- Tamaño del repositorio: 5,2 GB puede ser un inconveniente para entornos con almacenamiento limitado.
- Dependencia de la semilla: el entrenamiento se realizó con una única semilla (10001); no se proporcionan variantes con otras semillas para estudiar la varianza.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/yonghoon96/ogbench-bc-flow-policies
- Repositorio de OGBench en GitHub: https://github.com/seohongpark/ogbench
- Página del proyecto OGBench: https://seohong.me/projects/ogbench/
- Blog sobre behavior cloning: https://seohong.me/blog/behavioral-cloning-mystery/
- Paper ReFORM (arXiv): https://arxiv.org/abs/2602.05051
- Repositorio TRQAM (GitHub): https://github.com/2bhapby/trqam
