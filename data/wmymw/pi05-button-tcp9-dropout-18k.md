# wmymw/pi05-button-tcp9-dropout-18k

## Resumen

π₀.₅ TCP9 Dropout 18k (wmymw/pi05-button-tcp9-dropout-18k) es un checkpoint de política robótica publicado por el usuario wmymw en Hugging Face. Se presenta como un artefacto de inferencia para el modelo π₀.₅ (pi-zero-point-five) dentro del entorno OpenPI, orientado a control de un brazo robótico mediante predicción de poses absolutas a partir de observaciones visuales y de estado. El repositorio ocupa 16,3 GB y contiene un bundle listo para servir por WebSocket, con pesos y un fichero `scores.json` que permite seleccionar automáticamente el step de menor MSE.

El modelo resuelve una tarea concreta de manipulación: dado un estado de 9 dimensiones (posición xyz del tcp_tip en el marco Base más las dos primeras columnas de la matriz de rotación) y tres cámaras RGB (frontal, de muñeca y cenital), devuelve 30 acciones de 9 dimensiones correspondientes a poses absolutas desnormalizadas. La nomenclatura del identificador ("button-tcp9-dropout-18k") sugiere un entrenamiento centrado en pulsar un botón, con un horizonte de 18k pasos y regularización por dropout, aunque la model card no documenta estos detalles.

La relevancia es acotada y práctica: se trata de un checkpoint de investigación para replicar un experimento de imitación, no de un modelo de propósito general. La model card está íntegramente en chino y describe el protocolo de servicio, el preprocesado de imágenes y el contrato de la API, pero omite arquitectura, datos de entrenamiento, licencia y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere familia π₀.₅ / OpenPI, sin detalle en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como LLM; entrada multimodal estado 9D + 3 imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (bundle OpenPI con `serve_policy.py` y `scores.json`; el repo pesa 16,3 GB) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna, el número de parámetros ni la composición del dataset. El identificador y la referencia a OpenPI permiten situarlo en la familia π₀.₅, un modelo de política visuomotora (visión-lenguaje-acción) entrenado por imitación, pero la ficha del autor no aporta detalles sobre el backbone, el mecanismo de atención ni la estrategia de fusión multimodal. Tampoco se documenta si hubo RLHF, DPO u otro tipo de ajuste posterior.

Los únicos datos de entrenamiento deducibles del nombre y la configuración son: un horizonte de acción de 30 pasos, un vector de estado de 9 dimensiones (xyz + dos columnas de rotación), tres vistas de cámara y una tarea de "button" (pulsar un botón). El sufijo "dropout-18k" apunta a 18 000 pasos de entrenamiento con dropout, pero no se especifica la tasa ni la política de aumento de datos. El preprocesado es explícito: recorte de columnas [80,560) para la cámara de muñeca, [0,480) para frontal y cenital, y redimensionado bilineal con Pillow a 224×224 antes de la inferencia.

## Capacidades

- Predicción de acciones robóticas: devuelve 30 poses absolutas de 9 dimensiones (xyz + 6 componentes de rotación) desnormalizadas.
- Fusión multimodal de tres cámaras RGB (frontal, muñeca, cenital) más un vector de estado de 9 dimensiones.
- Servicio de inferencia por WebSocket mediante `WebsocketClientPolicy` de `openpi_client`.
- Selección automática del checkpoint de menor MSE a partir de `scores.json`.
- Preprocesado de imagen integrado en el servidor (recorte y escalado a 224×224).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: es un modelo de política, no un LLM conversacional.
- No se documentan capacidades de visión general (VQA, OCR) ni de audio.

## Casos de uso

- Replicación de experimentos de imitación en robótica: el bundle permite levantar un servidor de política en minutos y comparar el step óptimo según MSE, lo que facilita reproducir el resultado del autor antes de entrenar variantes.
- Pulsación de botones en entornos de laboratorio: el modelo está entrenado específicamente para esta tarea y devuelve poses absolutas, por lo que puede integrarse en una celda de test con un brazo de 6-7 ejes y tres cámaras calibradas.
- Evaluación de políticas visuomotoras: sirve como baseline para medir el efecto de cambios en el preprocesado (recortes, resolución) o en la representación del estado (xyz + rotación) sobre el MSE de las acciones.
- Prototipado de pipelines de teleoperación asistida: el cliente puede enviar frames en tiempo real y recibir acciones para un bucle de control supervisado, con el servidor aislado en 127.0.0.1 y acceso vía túnel SSH.
- Docencia e investigación en aprendizaje por imitación: el contrato de la API (estado 9D + tres imágenes → 30×9 acciones) es un ejemplo claro de interfaz política-robot para prácticas de laboratorio.
- Integración en sistemas de captura de datos: al devolver predicciones sin controlar el brazo, puede usarse para generar trayectorias candidatas y compararlas con las humanas antes de ejecutar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que `scores.json` contiene valores de MSE por step para elegir el mejor checkpoint, pero no se transcriben cifras ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo pesa 16,3 GB, lo que sugiere que los pesos en precisión original podrían requerir del orden de 16-20 GB de VRAM, pero no se confirma el formato ni la precisión.
- GPU recomendadas: no disponible. Por tamaño del bundle, una GPU con 24 GB (RTX 4090, A10G, L4) o superior (A100, H100) es un punto de partida razonable, pero no está verificado.
- ¿Cabe en GPU de consumo? No confirmado; probablemente sí en RTX 4090 (24 GB) si los pesos caben en memoria, pero no hay datos oficiales.
- Opciones de despliegue: el autor proporciona `serve_policy.py` con servidor WebSocket en el puerto 8000 y cliente `WebsocketClientPolicy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas visuomotoras (por ejemplo, otras variantes de π₀.₅, ACT, Diffusion Policy o RT-2), ni datos de rendimiento que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- Es un checkpoint de investigación de un usuario individual, sin revisión por pares ni documentación de sesgos, datos de entrenamiento o protocolo de evaluación.
- El modelo devuelve predicciones de pose pero no controla el brazo: cualquier bucle de control real requiere capas de seguridad, límites de par y paradas de emergencia externas.
- El preprocesado está fijado en el servidor (recortes y escalado a 224×224); cambios en la calibración de cámaras o en la resolución de entrada pueden degradar gravemente las predicciones.
- La representación del estado (xyz + dos columnas de la matriz de rotación) es una convención concreta; usar otra convención invalida el modelo.
- Riesgo de sobreajuste a la tarea "button" y al entorno de entrenamiento; no hay evidencia de generalización a otras tareas u objetos.
- No se documentan sesgos demográficos ni de otro tipo, pero al ser un modelo visuomotor puede heredar sesgos de los datos de demostración (iluminación, texturas, posiciones de cámara).
- El servidor se enlaza a 127.0.0.1 por defecto; exponerlo en red requiere túneles SSH y medidas adicionales de seguridad.
- No apto para uso como LLM: no genera texto, no responde preguntas y no soporta instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wmymw/pi05-button-tcp9-dropout-18k
- Repositorio OpenPI (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Paper de π₀.₅: no disponible en la información proporcionada
- Blog o demo del autor: no disponible
