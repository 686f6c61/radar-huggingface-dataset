# yunusserhat/firerisk-siglip2-base

## Resumen

FireRisk SigLIP2 ViT-B/16 es un clasificador de imágenes aéreas en color (RGB) que asigna una de siete etiquetas de peligro asociadas a la metodología WHP (Wildfire Hazard Potential, potencial de peligro de incendio forestal). Lo publica el usuario yunusserhat como pesos iniciales de desarrollo correspondientes a la semilla de entrenamiento 42, con el checkpoint de la época 7 seleccionado por macro F1 de validación. No es un detector de incendios activos ni un sistema de predicción de igniciones.

Técnicamente es un ajuste fino completo (*full fine-tuning*) del codificador visual SigLIP2 ViT-B/16 (`timm/vit_base_patch16_siglip_224.v2_webli`) con una cabeza de clasificación envuelta en la arquitectura `VisionClassifier` del proyecto FireRisk Bench. El checkpoint declara 92.891.143 parámetros totales y entrenables, entrada de 224 píxeles y siete clases de salida. El repositorio ocupa 0,4 GB y se distribuye bajo GPL v3 en lo relativo a las aportaciones del ajuste y al clasificador, mientras que el modelo preentrenado original conserva Apache 2.0.

Su relevancia es acotada y hay que leerla con precisión: se trata de un artefacto de investigación reproducible —incluye manifiestos de preprocesado, calibración de temperatura, procedencia y sumas de verificación— cuya partición de test no ha sido evaluada. La partición de validación sirvió a la vez para seleccionar el checkpoint y ajustar la temperatura, por lo que sus métricas no estiman rendimiento independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (ViT-B/16) SigLIP2 como codificador + cabeza de clasificación lineal, envuelto en `VisionClassifier` de FireRisk Bench |
| Parametros totales | 92.891.143 (todos entrenables) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes; entrada de 224 x 224 píxeles) |
| Tipos de cuantizacion | No disponible (solo se documenta el checkpoint `best.pt` en precisión de entrenamiento) |
| Idiomas soportados | `en` (etiqueta declarada; la tarea es clasificación de imágenes, no procesamiento de lenguaje) |
| Licencia | GPL v3 para las aportaciones del ajuste fino y el clasificador; el modelo preentrenado original mantiene Apache 2.0; el dataset asociado figura con licencia desconocida |
| Formato de pesos | Checkpoint PyTorch `best.pt`, cargado con `torch.load(..., weights_only=True)`; no incluye `AutoModel` ni `pipeline` de Transformers; se acompaña de `config.json`, `preprocessing.json`, `calibration.json`, `labels.json`, `summary.json`, `validation_metrics.json`, `provenance.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo parte del backbone `timm/vit_base_patch16_siglip_224.v2_webli` (revisión `4c3661e5ac879a276ddc5ddc6d3f0ecc78fd5d82`), un ViT-B/16 de SigLIP2 en su variante de 224 píxeles. Sobre ese codificador se aplica un ajuste fino completo con una cabeza de clasificación de siete clases, integrada en la arquitectura `VisionClassifier` que define el repositorio FireRisk Bench. El tamaño de entrada es de 224 píxeles y el recetario de normalización, política de redimensionado y aumentos de datos queda registrado en `config.json` y `preprocessing.json`.

Los datos provienen de `blanchon/FireRisk`, revisión `234b2e7fe6be2da773472e83bd4d42cc9815a630`. El espejo utilizado contiene 70.331 imágenes y únicamente la partición de entrenamiento original del dataset. El proyecto define una partición nueva a nivel de imagen: 49.231 ejemplos de entrenamiento, 10.552 de validación y 10.548 de test, con semilla de particionado 2026 y hash `0ab5619091f80f73f8229634a38194ad31eeddf9dfe70978d1b664fe8fb598cd`. La auditoría de duplicados encontró 0 filas duplicadas exactas. No se documenta en la información disponible el uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo por lo demás esperable en una tarea de clasificación.

Un aspecto destacable, y a la vez una limitación de reproducibilidad, es que los artefactos registrados no identifican un commit de Git de entrenamiento recuperable: el entrenamiento se hizo con un árbol de trabajo con cambios sin confirmar (*dirty working tree*). La calibración se resuelve con una temperatura ajustada sobre los logits de validación y almacenada en `calibration.json`; la CLI la aplica al producir probabilidades. El orden de clases queda fijado en `labels.json` y `summary.json`, y `validation_metrics.json` incluye métricas por clase, matrices de confusión e intervalos bootstrap exploratorios.

## Capacidades

- Clasificación de imágenes aéreas RGB en siete etiquetas de peligro derivadas de WHP (potencial de peligro de incendio forestal).
- Salida de logits y de probabilidades calibradas mediante temperatura ajustada en validación.
- Proporciona métricas por clase, matrices de confusión e intervalos bootstrap en `validation_metrics.json`.
- Inferencia desde línea de comandos mediante `firerisk predict --run-dir ... --image ...`.
- Carga del checkpoint con `torch.load(..., weights_only=True)`, lo que restringe la ejecución de código arbitrario al deserializar.
- Registro de procedencia del entorno de entrenamiento y sumas de verificación SHA-256 de los ficheros publicados.
- No soporta *tool calling*, *function calling*, uso como agente, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- No dispone de modo de razonamiento (*thinking*), ni de visión-lenguaje, audio u otras modalidades.

## Casos de uso

- Investigación sobre clases de peligro derivadas de WHP: el modelo sirve como punto de partida experimental para estudiar si un codificador SigLIP2 ajustado permite asignar etiquetas de peligro a recortes aéreos, con métricas de validación documentadas y calibración explícita.
- Reproducción y auditoría metodológica: la publicación incluye hashes de particionado, manifiestos de preprocesado, procedencia y sumas de verificación, lo que permite repetir la partición de 49.231/10.552/10.548 y verificar la integridad de los artefactos.
- Línea base para comparativas de adaptación: al tratarse de un ajuste fino completo de un ViT-B/16, resulta útil como referencia frente a otras estrategias (cabezas congeladas, LoRA, adaptadores) siempre que se mantenga idéntica la partición y la semilla.
- Etiquetado asistido en curación de datasets de teledetección: puede emplearse para preetiquetar recortes aéreos candidatos y priorizar la revisión humana, dado que el coste por inferencia es bajo y cabe en GPU de consumo.
- Estudio de ambigüedad de etiquetas: las matrices de confusión y las métricas por clase de `validation_metrics.json` permiten analizar qué clases se confunden entre sí y hasta qué punto el problema de etiquetado es intrínsecamente ambiguo.
- Experimentos de transferencia geográfica y temporal: el modelo está pensado para probar si el ajuste generaliza fuera de la distribución de origen, ya que el espejo del dataset no contiene coordenadas, marcas temporales ni identificadores de escena.
- Análisis de calibración de probabilidades en clasificación binaria o multiclase de riesgo: la temperatura guardada permite estudiar el efecto del escalado de logits en la fiabilidad de las probabilidades emitidas.
- Docencia y prácticas de visión por computador: el pipeline completo (descarga, particionado, entrenamiento, validación y predicción) es replicable con un modelo de 92,89 millones de parámetros que no exige hardware de gama alta.

## Benchmarks y rendimiento

Los únicos resultados publicados son métricas de validación, obtenidas en la misma partición que sirvió para seleccionar el checkpoint y ajustar la temperatura. El autor advierte explícitamente que no estiman rendimiento independiente y que la partición de test no ha sido evaluada. No se han publicado resultados en la información disponible para MMLU, HumanEval, GSM8K ni ningún otro benchmark estándar, que por otra parte no aplican a esta tarea.

| Metrica (validacion) | Valor |
|---|---:|
| Accuracy | 63,05 % |
| Macro F1 | 58,94 % |
| Balanced accuracy | 58,11 % |

Advertencias del propio autor que condicionan la lectura de la tabla: la partición de validación participó en la selección del checkpoint y en el ajuste de la temperatura; los resultados provienen de una única semilla (42) y no establecen variación entre semillas de entrenamiento; y las puntuaciones de distintas recetas de adaptación no constituyen una ablación causal controlada. En `validation_metrics.json` se incluyen además métricas por clase, matrices de confusión e intervalos bootstrap de carácter exploratorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 92.891.143 parámetros, el checkpoint ocupa aproximadamente 0,35 GB en FP32 y 0,18 GB en FP16. Una inferencia por lotes pequeños de imágenes de 224 x 224 se mantiene holgadamente por debajo de 1-2 GB de VRAM en FP32, incluyendo activaciones y buffers de trabajo.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 sirven sobradamente. Las GPU de datacenter solo tienen sentido por agregación de throughput, no por requisito de memoria.
- Cabe en GPU de consumo: sí, en toda la gama actual, desde una GTX 1650 de 4 GB en adelante. También es viable en CPU, tal y como contempla la documentación de instalación del repositorio.
- Opciones de despliegue: la vía documentada es la CLI de FireRisk Bench (`firerisk predict`), que carga el checkpoint `best.pt` con `torch.load(..., weights_only=True)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Tampoco se describe exportación a ONNX, TorchScript ni TensorRT.
- Detalle operativo relevante: la predicción no descarga el dataset FireRisk, pero sí descarga el backbone fijado en la primera carga, incluso para la versión completa, porque el constructor actual parte de la arquitectura preentrenada. Las cargas posteriores pueden reutilizar esa caché. En CPU hay que seguir `docs/installation.md` del repositorio.
- Latencia y throughput: no disponibles. La información proporcionada no incluye mediciones de latencia ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de resultados comparables publicados en la información proporcionada para otros clasificadores de peligro de incendio sobre las mismas siete clases, partición o métrica. La tabla siguiente recoge únicamente lo que puede afirmarse con los datos disponibles; las celdas sin datos verificables se marcan como no disponibles en lugar de estimarse.

| Modelo | Parametros | Contexto / entrada | Rendimiento comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yunusserhat/firerisk-siglip2-base | 92.891.143 | 224 x 224 px, 7 clases | Accuracy validación 63,05 %, macro F1 58,94 % (no independiente) | GPL v3 (ajuste y clasificador), Apache 2.0 el backbone original | HuggingFace y FireRisk Bench |
| Backbone `timm/vit_base_patch16_siglip_224.v2_webli` sin ajustar | No disponible en la información proporcionada | 224 x 224 px | No disponible | Apache 2.0 | timm / HuggingFace |
| Otras recetas de adaptación sobre FireRisk | No disponible | No disponible | El autor advierte que no forman una ablación causal controlada | No disponible | No disponible |

No se identifican en la información disponible alternativas de la misma categoría con métricas publicadas sobre esta partición concreta.

## Limitaciones y advertencias

- Naturaleza del artefacto: son pesos iniciales de desarrollo, de una sola semilla (42) y una sola época seleccionada (época 7). No deben tratarse como un modelo validado para producción.
- La partición de test no ha sido evaluada y la de validación se usó tanto para seleccionar el checkpoint como para ajustar la temperatura. Las métricas de validación están, por tanto, optimistamente sesgadas.
- Las probabilidades de clase no representan una probabilidad calibrada de ocurrencia futura de incendio. El propio autor lo indica de forma explícita.
- No es un detector de incendios activos. No debe emplearse para alerta temprana, respuesta ante emergencias ni toma de decisiones operativas de extinción.
- Sesgos y generalización: el espejo del dataset carece de coordenadas, marcas temporales e identificadores de escena, y la transferencia geográfica y temporal no ha sido establecida. Los cambios en la adquisición de imágenes y la ambigüedad de etiquetas limitan la interpretación de los resultados.
- Riesgo de solapamiento entre particiones: la auditoría de duplicados solo detectó 0 coincidencias exactas de píxeles, lo que no excluye imágenes cercanas o solapadas entre particiones ni solapamiento desconocido con los datos de preentrenamiento del backbone.
- La reproducibilidad del entrenamiento es incompleta: los artefactos no identifican un commit de Git recuperable y el entrenamiento se realizó con un árbol de trabajo con cambios sin confirmar.
- Licencia: las aportaciones del ajuste fino y el clasificador están bajo GPL v3, lo que impone obligaciones de copyleft en caso de redistribución o integración en obras derivadas. El backbone original conserva Apache 2.0 y requiere atribución. La release congelada no redistribuye los pesos del backbone sin modificar.
- La licencia del dataset figura como desconocida. La publicación del código o del modelo no otorga licencia sobre las imágenes de entrenamiento utilizadas.
- Restricciones de uso comercial: además de las obligaciones de la GPL v3, la condición de pesos de desarrollo no evaluados y la licencia desconocida del dataset hacen desaconsejable cualquier uso comercial sin una revisión legal y una validación independiente previas.
- Integración limitada: no existe checkpoint compatible con `AutoModel` ni `pipeline` de Transformers, lo que obliga a usar FireRisk Bench o a reimplementar la arquitectura `VisionClassifier` para cargar los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunusserhat/firerisk-siglip2-base
- Repositorio FireRisk Bench: https://github.com/yunusserhat/firerisk
- Dataset de entrenamiento: https://huggingface.co/datasets/blanchon/FireRisk
- Backbone base: https://huggingface.co/timm/vit_base_patch16_siglip_224.v2_webli
- Busqueda web: no se han encontrado resultados relevantes. Las consultas realizadas devolvieron exclusivamente contenido no relacionado con el modelo, sin papers, blogs, repositorios ni demos adicionales que puedan citarse.
