# yusufinfo/swe015-ticket-router-models

## Resumen

SWE015 es un paquete de pesos publicado en Hugging Face que contiene cinco variantes de un clasificador de intenciones para enrutar tickets de soporte al cliente, desde una línea base clásica hasta un transformer destilado y cuantizado. Lo firma el usuario `yusufinfo` como parte de un trabajo de curso (caso de uso 2) vinculado al repositorio `yusufgunesp/swe015-ticket-router`. El problema que aborda es el enrutamiento automático de mensajes entrantes hacia la cola o el agente adecuado, con umbrales de confianza calibrados para derivar a revisión humana.

El repositorio no contiene un único modelo, sino un conjunto de artefactos: `baseline/` (TF-IDF + regresión logística en joblib), `ffn/` (fastText con embeddings promediados y red feedforward en PyTorch), `teacher/` (bert-base-multilingual-cased afinado), `student/` (distilbert-base-multilingual-cased destilado del teacher) y las exportaciones ONNX con cuantización dinámica INT8 de ambos transformers. La aplicación descarga el repositorio automáticamente al ejecutar `python app.py`.

Es relevante como ejemplo reproducible de una cadena completa de compresión de modelos para clasificación de texto: destilación de BERT multilingüe a DistilBERT y posterior cuantización INT8 para despliegue en CPU. El entrenamiento combina CLINC150 (variante plus) con 300 mensajes propios de electrodomésticos en turco e inglés, lo que introduce un dominio específico poco cubierto por los benchmarks habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de cinco variantes: TF-IDF + regresión logística; fastText (embeddings promediados) + FFN; BERT multilingüe; DistilBERT multilingüe; exportaciones ONNX INT8 de los dos transformers |
| Parametros totales | no disponible (no se detalla el recuento por variante; `teacher/` se basa en bert-base-multilingual-cased, ~178 M, y `student/` en distilbert-base-multilingual-cased, ~135 M, según los modelos base referenciados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no se especifica la longitud máxima de secuencia usada en el afinado) |
| Tipos de cuantizacion | INT8 dinámica vía ONNX Runtime (`student_int8/`, `teacher_int8/`); el resto en precisión original |
| Idiomas soportados | turco (tr) e inglés (en) |
| Licencia | no disponible |
| Formato de pesos | joblib (baseline), PyTorch (ffn, teacher, student), ONNX + safetensors/ONNX Runtime (variantes INT8); el repositorio incluye `thresholds.json` por carpeta |

## Arquitectura y entrenamiento

El paquete agrupa cinco aproximaciones con complejidad creciente. La línea base `baseline/` usa TF-IDF con regresión logística de scikit-learn. `ffn/` emplea embeddings promediados estilo fastText seguidos de una red feedforward entrenada con SGD en PyTorch. `teacher/` es un bert-base-multilingual-cased afinado para clasificación de intenciones, y `student/` es un distilbert-base-multilingual-cased obtenido por destilación de conocimiento desde el teacher. Las carpetas `student_int8/` y `teacher_int8/` son exportaciones ONNX con cuantización dinámica INT8 ejecutadas con ONNX Runtime; la aplicación usa `student_int8/`.

Los datos de entrenamiento combinan CLINC150 (variante plus) con 300 mensajes adicionales de electrodomésticos en turco e inglés, lo que añade un dominio vertical específico. Cada carpeta incluye un `thresholds.json` con dos umbrales de confianza seleccionados sobre el conjunto de validación, lo que sugiere una política de derivación a revisión humana o a una cola genérica cuando la predicción no supera la confianza mínima. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste por RLHF o DPO.

## Capacidades

- Clasificación de intenciones en texto para enrutamiento de tickets de soporte al cliente.
- Clasificación de texto multilingüe limitada a turco e inglés.
- Salida de probabilidad por clase con umbrales de confianza precalibrados para abstención o derivación.
- Tres niveles de coste computacional intercambiables: línea base clásica, red neuronal ligera y transformer destilado.
- Ejecución en CPU mediante ONNX Runtime con cuantización INT8 dinámica.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Enrutamiento de tickets en mesa de ayuda: el clasificador asigna cada mensaje entrante a una intención y, si la confianza no supera el umbral de `thresholds.json`, lo deriva a una cola de triaje humano; la variante `student_int8/` permite hacerlo en CPU sin GPU.
- Filtrado previo en atención al cliente multilingüe: al cubrir turco e inglés, un mismo pipeline puede separar consultas de ambos idiomas antes de pasarlas a agentes especializados.
- Clasificación de mensajes de electrodomésticos: los 300 mensajes de dominio añadidos al entrenamiento hacen que el modelo reconozca vocabulario específico de averías, garantías o instalación que CLINC150 no cubre.
- Despliegue en entornos con recursos limitados: la línea base `baseline/` en joblib y la variante `student_int8/` en ONNX permiten servir el clasificador en contenedores pequeños o en el propio portátil del desarrollador.
- Comparación de técnicas de compresión en docencia o evaluación interna: el repositorio permite medir la pérdida de exactitud de teacher a student y de student a student INT8 con los mismos datos y umbrales.
- Prototipado rápido de un router de intenciones: la aplicación `app.py` descarga los pesos automáticamente, lo que facilita validar el flujo completo antes de invertir en un modelo propio.
- Etiquetado asistido de nuevos tickets: las predicciones con confianza alta pueden usarse para preetiquetar datos y reducir el coste de anotación en la construcción de un dataset propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la carpeta `results/` del repositorio de GitHub para consultar las métricas, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- La variante `student_int8/` en ONNX Runtime está pensada para inferencia en CPU; no requiere GPU.
- `baseline/` (TF-IDF + regresión logística) se ejecuta en CPU con requisitos mínimos, del orden de cientos de MB de RAM.
- `ffn/` (fastText + FFN) también es apta para CPU; el coste depende del vocabulario de embeddings.
- `teacher/` (BERT multilingüe) y `student/` (DistilBERT) en PyTorch se benefician de GPU; una RTX 4090 o superior permite lotes grandes, y para servir en producción con vLLM o TGI no aplica, ya que son modelos de clasificación y no de generación.
- El repositorio completo ocupa 1,7 GB, por lo que conviene descargar solo la carpeta necesaria si se despliega una única variante.
- No se dispone de datos de latencia ni throughput medidos en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SWE015 (este paquete) | no disponible (teacher ~178 M, student ~135 M según los modelos base) | no disponible | tr, en | no disponible | joblib, PyTorch, ONNX INT8 |
| bert-base-multilingual-cased | ~178 M | 512 tokens (estándar del modelo base) | 104 idiomas | Apache 2.0 (modelo base) | safetensors, PyTorch |
| distilbert-base-multilingual-cased | ~135 M | 512 tokens (estándar del modelo base) | 104 idiomas | Apache 2.0 (modelo base) | safetensors, PyTorch |
| CLINC150 baseline (TF-IDF + LR) | no disponible | no aplica | en (dataset original) | según implementación | joblib |

La comparación es aproximada: SWE015 no publica métricas propias, y los modelos base de Hugging Face no están afinados para esta tarea concreta. La ventaja diferencial del paquete es la cadena de destilación y cuantización ya resuelta, junto con los umbrales calibrados; la desventaja es la ausencia de licencia declarada y de resultados reproducibles en la model card.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Es un artefacto de trabajo de curso, sin garantías de mantenimiento ni de soporte.
- Solo cubre turco e inglés; cualquier otro idioma queda fuera del ámbito declarado.
- El dominio de entrenamiento es limitado (CLINC150 más 300 mensajes de electrodomésticos), lo que puede degradar la precisión en otros sectores.
- No hay métricas publicadas en la model card; las cifras del repositorio de GitHub no se han podido verificar en la información disponible.
- Riesgo de alucinación no aplica en sentido estricto al ser un clasificador, pero sí de calibración deficiente: los umbrales de `thresholds.json` están ajustados a un conjunto de validación concreto y pueden requerir recalibración en producción.
- Los sesgos del dataset CLINC150 y de los 300 mensajes propios se trasladan al modelo; no se documenta ningún análisis de sesgo.
- La cuantización INT8 dinámica puede alterar ligeramente la distribución de probabilidades, lo que afecta a la política de umbrales si se cambia de variante sin recalibrar.
- El tamaño del repositorio (1,7 GB) incluye todas las variantes; descargarlo completo en producción es innecesario y conviene aislar la carpeta que se vaya a servir.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yusufinfo/swe015-ticket-router-models
- Repositorio de GitHub del proyecto: https://github.com/yusufgunesp/swe015-ticket-router
- Modelo base del teacher: https://huggingface.co/bert-base-multilingual-cased
- Modelo base del student: https://huggingface.co/distilbert-base-multilingual-cased
- Dataset CLINC150: no disponible enlace directo en la información proporcionada
