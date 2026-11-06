# xmaxmex/Yolov9-medic-EPI

## Resumen

Yolov9-medic-EPI es un modelo de detección de objetos basado en la arquitectura YOLOv9, especializado en la identificación en tiempo real de Equipos de Protección Individual (EPI) en entornos industriales y corporativos. Lo publica el usuario xmaxmex en Hugging Face como un fine-tuning del checkpoint LibreYOLO9t del proyecto LibreYOLO, una implementación abierta de YOLOv9. El modelo resuelve un problema acotado pero crítico en seguridad laboral: verificar de forma automática si un trabajador lleva casco, chaleco, gafas, guantes y botas, y emitir alertas cuando no se cumple la normativa.

El modelo detecta seis clases (casco, chaleco, gafas, guante, bota y "sin EPI"), lo que permite no solo inventariar el equipamiento presente sino también señalar el incumplimiento de forma explícita. Se ha entrenado sobre el dataset público EPI-1ytmd de Roboflow y declara métricas de validación de mAP@0.50 del 96,14 % y mAP@0.50:0.95 del 83,04 %, cifras que, si se confirman en producción, lo sitúan como una opción razonable para despliegues de videovigilancia de seguridad.

Su relevancia actual radica en la combinación de tres factores: licencia MIT (uso comercial sin restricciones relevantes), pesos en formato .pt listos para inferencia y un dominio de aplicación muy concreto donde los modelos generalistas rinden peor. El repositorio, sin embargo, es de tamaño mínimo (0,0 GB según Hugging Face) y no incluye documentación técnica detallada sobre el entrenamiento, de modo que la ficha debe leerse con las cautelas propias de un modelo con escasa trazabilidad publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv9 (detector de objetos de una etapa), fine-tuning de LibreYOLO/LibreYOLO9t |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican pesos .pt; no se documentan exportaciones a ONNX, TensorRT o FP16/INT8) |
| Idiomas soportados | no disponible (modelo de visión sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch, best.pt) |

## Arquitectura y entrenamiento

El modelo parte de la familia YOLOv9, un detector de objetos de una sola etapa que combina un backbone convolucional con un cuello de agregación de características multiescala y una cabeza de predicción densa. La innovación característica de YOLOv9 es el uso de Programmable Gradient Information (PGI) y del módulo GELAN (Generalized Efficient Layer Aggregation Network), diseñados para mitigar la pérdida de información en las conexiones profundas y mejorar la eficiencia de parámetros. El fine-tuning se ha realizado sobre LibreYOLO9t, la variante "t" (tiny) del proyecto LibreYOLO, lo que implica un modelo de tamaño reducido orientado a inferencia en tiempo real.

No se dispone de información publicada sobre el número de épocas, la resolución de entrada, el tamaño del conjunto de entrenamiento, el balance de clases ni las técnicas de aumento de datos aplicadas. El dataset de origen es EPI-1ytmd, exportado desde Roboflow Universe bajo licencia MIT, con seis clases anotadas. Tampoco se documenta si hubo ajuste fino con pesos congelados, destilación o búsqueda de hiperparámetros. Esta ausencia de detalle sobre el proceso de entrenamiento es la principal laguna técnica del repositorio.

## Capacidades

- Detección de objetos en imágenes en tiempo real, con seis clases específicas de equipamiento de protección individual.
- Identificación de la clase "sem-EPI", pensada para disparar alertas automáticas de incumplimiento de seguridad.
- Localización con cajas delimitadoras (bounding boxes) por instancia detectada, apta para conteo y seguimiento.
- Inferencia sobre fotogramas individuales de vídeo o imágenes estáticas, adecuada para pipelines de videovigilancia.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes.
- No dispone de capacidades multilingües ni de procesamiento de audio.
- No se documentan capacidades de segmentación, pose estimation ni detección de objetos fuera de las seis clases entrenadas.

## Casos de uso

- Control de acceso a zonas de obra: al integrar el modelo en la cámara de entrada, se puede verificar en cada fotograma si el operario lleva casco y chaleco antes de permitir el paso, usando la clase "sem-EPI" como disparador de una alerta o bloqueo.
- Auditoría automatizada de seguridad en planta: procesar imágenes periódicas de los puestos de trabajo y generar informes de cumplimiento por turno, contando instancias de cada clase detectada.
- Videovigilancia en tiempo real con alertas: desplegar el modelo sobre un flujo de vídeo y emitir notificaciones cuando se detecte "sem-EPI" durante más de N fotogramas consecutivos, reduciendo falsos positivos por parpadeo.
- Verificación previa a la entrada en almacenes o muelles de carga: comprobar gafas, guantes y botas en la cámara de acceso para cumplir con la normativa interna de seguridad.
- Análisis retrospectivo de incidentes: procesar el archivo de vídeo de una jornada para localizar momentos en los que un trabajador aparecía sin el equipamiento requerido, apoyando la investigación de accidentes.
- Integración en sistemas de gestión de seguridad (SGS) o plataformas de EHS: exponer el modelo como servicio de inferencia que consuma el sistema corporativo para generar métricas de cumplimiento por área.
- Formación y concienciación: usar las detecciones para mostrar al personal, en pantallas de planta, el estado de cumplimiento en tiempo real y reforzar hábitos seguros.

## Benchmarks y rendimiento

El autor publica las siguientes métricas en el conjunto de validación del dataset EPI-1ytmd:

| Metrica | Valor |
|---|---|
| mAP@0.50 | 96,14 % |
| mAP@0.50:0.95 | 83,04 % |
| mAP@0.75 | 88,80 % |

No se han publicado resultados comparativos con otros modelos en la información disponible, ni desglose por clase, ni curvas precisión-recuperación, ni latencias medidas. Las cifras corresponden exclusivamente al conjunto de validación declarado por el autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; al tratarse de una variante "tiny" de YOLOv9, se espera un consumo moderado, pero el repositorio no documenta el número de parámetros ni el tamaño del tensor de pesos.
- GPU recomendadas: no disponibles en la información publicada. Por la naturaleza del modelo (YOLOv9-t), es razonable esperar buen rendimiento en GPU de consumo, pero no se aportan datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada por el autor; sin datos de parámetros no puede afirmarse con rigor.
- Opciones de despliegue: el repositorio solo incluye pesos en formato .pt (best.pt), por lo que el despliegue natural es PyTorch con la interfaz de LibreYOLO. No se documentan exportaciones a ONNX, TensorRT, OpenVINO, vLLM, llama.cpp, Ollama ni TGI (estas dos últimas no aplican a un detector de objetos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yolov9-medic-EPI | no disponible | imagen (resolución no documentada) | mAP@0.50 96,14 % en validación propia | MIT | Hugging Face (repo mínimo) |
| YOLOv9-t (LibreYOLO9t, base) | no disponible | imagen | no disponible en esta ficha | según LibreYOLO | GitHub LibreYOLO |
| Alternativas de detección de EPI | no disponible | imagen | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con otros detectores de EPI o con variantes de YOLOv9 de mayor tamaño. Cualquier comparación numérica requeriría evaluar los modelos sobre el mismo conjunto de validación, algo que no se ha publicado.

## Limitaciones y advertencias

- Trazabilidad limitada: el repositorio no documenta el proceso de entrenamiento (épocas, resolución, aumentos de datos, balance de clases), lo que dificulta reproducir o auditar el modelo.
- Métricas no verificadas: los valores de mAP provienen únicamente de la model card del autor y no han sido contrastados de forma independiente.
- Sesgo de dominio: el modelo se ha entrenado sobre un dataset concreto (EPI-1ytmd) y puede degradarse ante cambios de iluminación, ángulos de cámara, uniformes, colores de EPI o condiciones meteorológicas no representadas.
- Riesgo de falsos negativos en la clase "sem-EPI": una detección fallida de incumplimiento puede tener consecuencias de seguridad; se recomienda validación humana o umbrales conservadores antes de automatizar sanciones o bloqueos.
- Sesgos demográficos potencialmente no documentados: al no publicarse la composición del dataset, no puede descartarse un rendimiento desigual entre personas según complexión, género o vestimenta.
- Sin capacidades lingüísticas: no puede generar informes ni razonar sobre las detecciones; requiere un componente externo para la capa de decisión y alertas.
- Formato único de pesos: solo se publican .pt, sin exportaciones optimizadas para despliegue en edge o servidores de inferencia de alto rendimiento.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset de origen (EPI-1ytmd en Roboflow) y del proyecto LibreYOLO para confirmar la compatibilidad en producción.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xmaxmex/Yolov9-medic-EPI
- Pesos del modelo: https://huggingface.co/xmaxmex/Yolov9-medic-EPI/blob/main/best.pt
- Dataset de origen (Roboflow Universe): https://universe.roboflow.com/tcc-plqda/epi-1ytmd/dataset/2
- Proyecto LibreYOLO (GitHub): https://github.com/LibreYOLO/libreyolo
- Modelo base LibreYOLO9t: https://huggingface.co/LibreYOLO/LibreYOLO9t
