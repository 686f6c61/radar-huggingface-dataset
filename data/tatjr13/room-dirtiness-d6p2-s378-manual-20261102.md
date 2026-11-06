# tatjr13/room-dirtiness-d6p2-s378-manual-20261102

## Resumen

Room Dirtiness D6 seed378 + P2 es un detector de objetos de cinco clases derivado de `manako/Detect-room-dirtiness-detection`, orientado a identificar suciedad en entornos de interior. Las clases que detecta son derrame de liquidos, papelera, residuos, moho y manchas. El autor lo publica como una revision de prueba ("trial revision") y advierte explicitamente de que la evaluacion local no establece un ranking oficial ni emisiones oficiales.

El modelo se distribuye exclusivamente como grafo ONNX congelado, sin pesos en safetensors ni GGUF, y el repositorio ocupa 0.0 GB en el momento de la consulta, lo que sugiere que los artefactos no estan disponibles publicamente o el repositorio esta vacio. La model card describe el entrenamiento sobre 90 imagenes originales publicas revisadas y 357 anotaciones, con 190 epocas, semilla 378, batch-normalization congelada, sin mosaico y optimizador SGD.

La relevancia de esta ficha es limitada: se trata de un experimento de un autor individual, sin descargas ni likes, sin licencia declarada y sin benchmarks publicados. Se documenta aqui por completitud, pero no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos; se sirve como grafo ONNX congelado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se menciona el grafo ONNX congelado) |
| Idiomas soportados | no disponible (no aplica; tarea de vision) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del detector. Se sabe que se inicializa a partir de pesos de un detector publico del organizador (`manako/Detect-room-dirtiness-detection`) y que el artefacto servido es un grafo ONNX congelado denominado D6. El entrenamiento se realizo sobre 90 imagenes originales publicas revisadas, con 357 anotaciones, entrada de 640 pixeles, 190 epocas, semilla 378, batch-normalization congelada, sin mosaico y optimizador SGD.

Las etiquetas combinan revision humana y evidencia de predicciones publicas revisadas; el autor aclara que no se reclaman como ground truth privado del organizador. La capa de servicio, denominada P2, es una politica autocontenida que retiene las detecciones nativas y anade alternativas de menor rango para la clase de derrame de liquido sobre las detecciones de mancha, con deduplicacion por solapamiento especifica por clase. No hay reglas especificas por fotograma. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo por otra parte ajeno a un detector de vision.

## Capacidades

- Deteccion de objetos en cinco clases: derrame de liquido, papelera, residuos, moho y mancha.
- Entrada de imagen a 640 pixeles segun la configuracion de entrenamiento.
- Salida mediante grafo ONNX congelado, apta para inferencia en runtime ONNX.
- Politica de post-proceso P2: retencion de detecciones nativas y anadido de alternativas de derrame de liquido para detecciones de mancha.
- Deduplicacion por solapamiento especifica por clase en el post-proceso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un detector visual, no un modelo generativo.
- No se documentan capacidades de vision adicionales (segmentacion, captioning, VQA).

## Casos de uso

- Monitorizacion de limpieza en interiores: el detector puede procesar imagenes de habitaciones para localizar residuos, papeleras, manchas, moho y derrames, y activar avisos al personal de limpieza.
- Inspeccion de moho en viviendas: la clase de moho permite senalar regiones sospechosas en imagenes de paredes o superficies para revision humana posterior.
- Deteccion de derrames de liquido en suelos: la politica P2 anade alternativas de derrame sobre detecciones de mancha, util para priorizar la retirada de liquidos resbaladizos.
- Auditoria de estado de habitaciones en alquiler vacacional: procesar fotos de check-out para verificar que no quedan residuos ni manchas antes de la siguiente entrada.
- Pre-filtrado en pipelines de vision: usar el grafo ONNX como primera etapa para descartar imagenes limpias y reducir el coste de revision manual.
- Prototipado en entornos ONNX Runtime: al ser un grafo ONNX congelado, sirve para experimentar con post-procesos y deduplicacion por clase en un runtime estandar.
- Investigacion sobre etiquetado debil: el autor documenta que las etiquetas combinan revision humana y predicciones publicas revisadas, lo que lo hace util como caso de estudio de entrenamiento con evidencia mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion local no establece ranking oficial ni emisiones oficiales, y no aporta metricas (mAP, precision, recall) ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un detector a 640 pixeles servido en ONNX, el consumo depende de la arquitectura subyacente, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecucion en CPU y en GPU, pero no hay datos de rendimiento.
- Opciones de despliegue: ONNX Runtime es el runtime natural dado el formato; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Room Dirtiness D6 seed378 + P2 | no disponible | no aplica | sin benchmarks publicados | no disponible | ONNX, 0 descargas |
| `manako/Detect-room-dirtiness-detection` (modelo base) | no disponible | no aplica | no disponible | no disponible | referenciado como origen de los pesos |
| Alternativas genericas de deteccion (YOLO, DETR) | variable | no aplica | benchmarks publicos en COCO | variable | amplia |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El autor califica explicitamente el modelo como revision de prueba y advierte de que la evaluacion local no establece ranking ni emisiones oficiales.
- Las etiquetas no se reclaman como ground truth privado del organizador; combinan revision humana con predicciones publicas revisadas, lo que introduce ruido y posibles sesgos de confirmacion.
- El conjunto de entrenamiento es muy reducido: 90 imagenes y 357 anotaciones, insuficiente para generalizar a dominios visuales distintos.
- No hay licencia declarada, por lo que el uso comercial queda sin marco legal claro.
- El repositorio ocupa 0.0 GB y no registra descargas ni likes; no se confirma que los artefactos ONNX esten realmente disponibles.
- No se documentan sesgos conocidos, pero un dataset tan pequeno probablemente sobrerrepresenta las condiciones de las 90 imagenes originales.
- Riesgo de alucinacion entendido como falsos positivos: la politica P2 anade alternativas de derrame de liquido sobre detecciones de mancha, lo que puede incrementar falsos positivos de esa clase.
- No apto para produccion sin una evaluacion independiente con datos propios.

## Enlaces

- Hugging Face: https://huggingface.co/tatjr13/room-dirtiness-d6p2-s378-manual-20261102
- Modelo base referenciado: https://huggingface.co/manako/Detect-room-dirtiness-detection
