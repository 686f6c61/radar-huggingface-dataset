# turhancan97/visbench-fine_grained_classification-dinov2_vits14

## Resumen

`visbench-fine_grained_classification-dinov2_vits14` es una cabeza de sondeo (probe head) lineal entrenada sobre características congeladas del backbone visual DINOv2 en su variante `vits14` (ViT-S/14, aproximadamente 21 millones de parámetros). No es un modelo generativo ni un backbone: es un módulo pequeño que se ajusta encima de las representaciones de DINOv2 para medir qué información semántica contienen esas representaciones. Lo desarrolla turhancan97 dentro del proyecto VisBench, un marco de evaluación de backbones visuales mediante tareas de sondeo.

El modelo resuelve un problema acotado pero relevante en investigación: cuantificar de forma estandarizada la calidad de las características de un backbone visual en una tarea concreta. En este caso, la tarea es `fine_grained_classification` (clasificación de grano fino) sobre un espacio de 200 clases, y el probe reporta un top-1 de 0,8652 y un top-5 de 0,9707. Es relevante porque permite comparar backbones de forma reproducible sin reentrenar los codificadores completos, algo útil cuando se evalúan modelos de visión para downstream.

La ficha corresponde a un artefacto muy específico: pesos que solo funcionan con el backbone `dinov2_vits14` bajo `pooling=cls` y `feature_mode=dense_only`. Cargarlo contra otro backbone se rechaza explícitamente para evitar fallos silenciosos. El repositorio es de tamaño 0,0 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de sondeo lineal sobre características congeladas de DINOv2 ViT-S/14 |
| Parametros totales | no disponible (cabeza lineal sobre 200 clases; el backbone `dinov2_vits14` ronda los 21 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224 px según la clave del backbone) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin componente de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (cargado mediante `visbench.hub.load_probe_from_hub`) |

## Arquitectura y entrenamiento

La arquitectura es una cabeza de clasificación lineal ajustada sobre características de DINOv2 `vits14` extraídas con `pooling=cls` y `feature_mode=dense_only`. El backbone permanece congelado; solo se entrena la cabeza, siguiendo el protocolo `visbench_fine_grained_linear_probe`. La clave de backbone registrada es `dinov2/dinov2_vits14/224/7764ea0f912e`, lo que fija la versión exacta de las características de entrada.

El entrenamiento reportado en la model card usa `batch_size=256`, `epochs=200`, `lr=0.01`, `optimizer=adamw`, `weight_decay=0.0001`, `num_classes=200` y `standardize=False`. No se especifica el dataset de entrenamiento, el número de muestras ni si hubo aumentación de datos. No se menciona RLHF, DPO ni técnicas de alineación, algo esperable en un probe de clasificación.

## Capacidades

- Clasificación de imágenes en 200 clases de grano fino, usando características de DINOv2 ViT-S/14.
- Evaluación de la calidad de representaciones de un backbone visual congelado (función de sondeo).
- Integración con la librería `visbench` mediante `get_backbone` y `load_probe_from_hub`.
- Verificación de compatibilidad: rechaza la carga si el backbone, el pooling o el modo de características no coinciden.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de audio.
- No dispone de modo de razonamiento (thinking mode) ni de visión generativa.

## Casos de uso

- Evaluación comparativa de backbones visuales: usar el probe como referencia para medir cuánta información de grano fino conservan las características de `dinov2_vits14` frente a otras variantes, manteniendo fijo el protocolo de sondeo.
- Selección de backbone para un pipeline de clasificación fina: dado un conjunto de candidatos, ejecutar el probe correspondiente y comparar top-1/top-5 antes de comprometerse a un ajuste completo.
- Reproducción de experimentos de investigación: el protocolo y los hiperparámetros están documentados, lo que permite replicar el resultado (top-1 0,8652) en entornos controlados.
- Docencia y formación en visión por computador: sirve como ejemplo mínimo y didáctico de linear probing sobre representaciones congeladas.
- Auditoría de versiones de backbone: la clave `7764ea0f912e` permite comprobar que las características usadas corresponden a la versión esperada y detectar derivas por actualizaciones.
- Baseline en pipelines de clasificación de imágenes de dominio específico con 200 categorías, cuando se busca una solución ligera que evite reentrenar el codificador.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| `top1` | 0.8652 |
| `top5` | 0.9707 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un ViT-S/14 (unos 21 M de parámetros) más una cabeza lineal, la huella es reducida y cabe con holgura en GPU de consumo.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060 en adelante, aunque no se aportan cifras oficiales.
- Opciones de despliegue: la vía documentada es la librería `visbench` con `load_probe_from_hub`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un probe visual).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| visbench-fine_grained_classification-dinov2_vits14 | Probe lineal sobre DINOv2 ViT-S/14 | Cabeza lineal; backbone ~21 M | no aplica | no disponible | Hugging Face (0 descargas) |
| Otros probes de VisBench sobre distintos backbones | Probe lineal | Variable según backbone | no aplica | no disponible | Hugging Face |
| DINOv2 `vits14` (backbone base) | Backbone visual | ~21 M | no aplica | no disponible en esta ficha | Hugging Face / repositorio oficial |

No se dispone de datos de rendimiento de alternativas en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo funciona con el backbone `dinov2_vits14` bajo `pooling=cls` y `feature_mode=dense_only`; cualquier otra combinación se rechaza o produce resultados incorrectos.
- No es un modelo de propósito general: no genera texto, no razona y no procesa lenguaje.
- El rendimiento reportado (top-1 0,8652) corresponde a un conjunto de evaluación no especificado en la model card; no debe extrapolarse a otros dominios sin validación.
- No se documenta el dataset de entrenamiento ni de evaluación, lo que limita la reproducibilidad completa.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar al autor.
- Riesgo de sobreajuste al protocolo de sondeo concreto; los resultados no reflejan necesariamente el rendimiento de un ajuste completo del backbone.
- Sin descargas ni validación comunitaria en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/turhancan97/visbench-fine_grained_classification-dinov2_vits14
- Repositorio VisBench: https://github.com/turhancan97/VisBench
