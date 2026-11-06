# The-AnkitPatel/otel-trace-gnn

## Resumen

TraceGNN (publicado en Hugging Face como `The-AnkitPatel/otel-trace-gnn`) es una red neuronal de grafos de atención dirigida (GAT, Graph Attention Network) desarrollada por Ankit Kumar Patel, del Distributed Systems & Telemetry Lab del IIT Roorkee y contribuidor upstream de OpenTelemetry-Go en la CNCF. El modelo resuelve un problema concreto de observabilidad en sistemas distribuidos: localizar el servicio raíz de una causa de fallo en trazas de microservicios, donde la propagación de latencia y la amplificación por reintentos hacen que los llamadores aguas arriba parezcan más lentos que el servicio que realmente falla.

El modelo opera sobre los DAG (grafos acíclicos dirigidos) que generan los colectores de OpenTelemetry en entornos Kubernetes. Agrega telemetría multidimensional por nodo (duración, tiempo propio, saturación de CPU y memoria, retardo de cola, reintentos y estado de error) a lo largo de las aristas llamador-a-llamado, y produce una clasificación de nodo que identifica el servicio responsable de la causa raíz. Según la model card, alcanza un 98,4 % de precisión Top-1 con una latencia de 0,18 ms en CPU (p50).

Es relevante ahora porque la instrumentación con OpenTelemetry se ha convertido en estándar de facto en plataformas cloud native, y la localización automática de causa raíz sobre esas trazas reduce el tiempo medio de diagnóstico en operaciones. El repositorio es de tamaño 0,0 GB y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Attention Network (GAT) dirigida, 4 cabezas de atención, `hidden_dim` configurable (por defecto en el checkpoint) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre grafos de traza, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (exportable a TorchScript / ONNX; sin cuantizaciones publicadas) |
| Idiomas soportados | en (metadatos del repositorio; el modelo procesa telemetría numérica, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`trace_gnn_model.pt`), exportable a TorchScript y ONNX |
| Pipeline declarado | tabular-classification (Hugging Face) |
| Tarea real | graph-node-classification — localización de causa raíz en trazas de microservicios |
| Framework | PyTorch |

## Arquitectura y entrenamiento

TraceGNN es una Graph Attention Network dirigida que trata cada traza distribuida como un DAG: los nodos son operaciones o servicios y las aristas representan relaciones llamador-a-llamado. Cada nodo se describe con un vector de características de telemetría (duración, self-time, saturación de CPU y memoria, retardo de cola, contadores de reintentos y estado de error), y el mecanismo de atención agrega esa información a lo largo de las aristas para propagar evidencia de fallo hacia el nodo causal. La cabecera de clasificación emite una predicción por nodo, de modo que la tarea es clasificación de nodos en grafo.

El modelo se entrenó sobre trazas generadas por colectores de OpenTelemetry en un entorno Kubernetes del laboratorio de IIT Roorkee. La model card no detalla el número de tokens, la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables a este tipo de modelo). El conjunto de test retenido consta de N = 1.500 trazas. El checkpoint se distribuye como `trace_gnn_model.pt` y es exportable a TorchScript y ONNX, lo que facilita su despliegue en pipelines de inferencia en CPU.

## Capacidades

- Clasificación de nodos en grafos de traza para localizar el servicio raíz de un fallo.
- Agregación de telemetría multidimensional por nodo: duración, self-time, CPU, memoria, retardo de cola, reintentos y estado de error.
- Manejo de propagación de latencia y amplificación por reintentos a través de las aristas llamador-a-llamado.
- Inferencia de baja latencia en CPU (0,18 ms p50, 0,31 ms p99 según la model card).
- Exportación a TorchScript y ONNX para integración en servicios de observabilidad.
- No soporta tool calling, function calling, agentes ni generación de texto: es un modelo discriminativo de grafos, no un LLM.
- Capacidades multilingües: no aplica; procesa telemetría numérica y estructural.

## Casos de uso

- Diagnóstico automático en plataformas Kubernetes: integrar TraceGNN en el pipeline de OpenTelemetry para que, tras cada alerta de latencia o error, el modelo señale el servicio raíz en lugar de obligar al operador a recorrer manualmente el árbol de trazas.
- Reducción del tiempo medio de resolución (MTTR) en guardias de producción: al identificar el nodo causal con una latencia de milisegundos, el sistema puede enrutar la alerta directamente al equipo propietario del servicio afectado.
- Detección de fallos en cascada por reintentos: el modelo distingue el servicio que falla del llamador que amplifica la latencia mediante reintentos, un escenario habitual en arquitecturas de microservicios con resiliencia mal calibrada.
- Enriquecimiento de dashboards de observabilidad: emitir la predicción de causa raíz como atributo adicional en el backend de trazas (Jaeger, Tempo, etc.) para priorizar la investigación.
- Análisis post-incidente automatizado: procesar lotes de trazas históricas y generar informes de causa raíz para revisiones de postmortem.
- Validación de cambios en producción (canary analysis): comparar la distribución de causas raíz predichas antes y después de un despliegue para detectar regresiones en servicios concretos.
- Investigación académica en observabilidad: servir como baseline reproducible de GAT aplicado a localización de causa raíz, con métricas declaradas y exportación a ONNX.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre un conjunto de test retenido de N = 1.500 trazas (métricas no verificadas por un tercero, `verified: false` en el model-index):

| Métrica | TraceGNN | Baseline (heurística de duración máxima) | Baseline (Random Forest) |
|---|---|---|---|
| Top-1 Root Cause Accuracy | 98,40 % | 64,20 % | 78,50 % |
| F1 Score | 0,978 | 0,612 | 0,741 |
| Precision | 0,965 | 0,580 | 0,730 |
| Recall | 0,992 | 0,648 | 0,752 |
| ROC-AUC | 0,994 | 0,720 | 0,886 |
| Latencia CPU p50 | 0,18 ms | 0,05 ms | 1,45 ms |
| Latencia CPU p99 | 0,31 ms | 0,09 ms | 2,80 ms |

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del checkpoint no se publica (repositorio de 0,0 GB) y el modelo está pensado para inferencia en CPU.
- GPU recomendadas: no disponibles; no se documentan requisitos de GPU. El caso de uso declarado es inferencia en CPU.
- Cabe en GPU consumer: previsiblemente sí por el tamaño reducido del artefacto, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: PyTorch nativo, TorchScript y ONNX Runtime; integración como servicio de inferencia junto a colectores OpenTelemetry.
- Latencia declarada: 0,18 ms p50 y 0,31 ms p99 en CPU.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (GNN para localización de causa raíz en trazas) en la información proporcionada. La model card únicamente compara contra dos baselines no neuronales (heurística de duración máxima y Random Forest), cuyos resultados se recogen en la sección de benchmarks.

| Modelo | Tipo | Top-1 Accuracy | F1 | ROC-AUC | Licencia |
|---|---|---|---|---|---|
| TraceGNN | GAT dirigida | 98,40 % | 0,978 | 0,994 | Apache 2.0 |
| Heurística duración máxima | Baseline | 64,20 % | 0,612 | 0,720 | no aplica |
| Random Forest | Baseline | 78,50 % | 0,741 | 0,886 | no aplica |

## Limitaciones y advertencias

- Métricas no verificadas: los resultados del model-index están marcados como `verified: false`; proceden exclusivamente del autor y no han sido replicados por terceros.
- Sesgo de dominio: el modelo se entrenó en un testbed concreto (Kubernetes + OpenTelemetry del IIT Roorkee); su generalización a otras topologías, versiones de instrumentación o proveedores cloud no está documentada.
- Dependencia de la calidad de la telemetría: si las trazas no incluyen las características esperadas (self-time, reintentos, estado de error), el rendimiento puede degradarse sin aviso.
- Riesgo de clasificación errónea en fallos múltiples simultáneos: la model card no documenta el comportamiento ante varias causas raíz concurrentes.
- No es un modelo generativo: no produce explicaciones en lenguaje natural; solo emite la etiqueta del nodo causal.
- Idiomas: los metadatos declaran únicamente `en`; irrelevante para la tarea, pero limita su uso en documentación o interfaces multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia comunitaria sobre su robustez en producción.

## Enlaces

- Hugging Face: https://huggingface.co/The-AnkitPatel/otel-trace-gnn
- Cita declarada: Patel, A. K., "Root-Cause Localization in Distributed Microservice Traces via Directed Graph Attention Networks", Distributed Systems & Telemetry Lab, IIT Roorkee, 2026.
- OpenTelemetry (proyecto upstream del autor): https://opentelemetry.io/
- OpenTelemetry-Go (CNCF): https://github.com/open-telemetry/opentelemetry-go
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
