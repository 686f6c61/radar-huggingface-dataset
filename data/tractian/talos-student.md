# tractian/talos-student

## Resumen

Talos student es un clasificador de decisiones de 4,85 millones de parámetros desarrollado por Tractian, destilado del modelo Talos-0.8B, que decide si una petición emitida por un agente debe permitirse, cachearse, diferirse o denegarse antes de que llegue a un sistema de control industrial (Modbus, OPC-UA). No es un modelo generativo ni tiene interfaz de texto libre: trabaja sobre un vocabulario cerrado de 248 símbolos con tokens marcadores por pregunta y diez cabezas de salida, y su función es la de juez auxiliar dentro de la pasarela `talos-proxy`.

La relevancia del modelo está en su envelope de despliegue: 5 MB en ONNX con cuantización int8 dinámica, aproximadamente 5 ms por petición en un único hilo de CPU de portátil. Eso permite ejecutar la comprobación semántica dentro del propio gateway industrial, en el borde de la planta y sin GPU, algo inviable con el profesor de 0,8B. El modelo solo puede endurecer el veredicto de las reglas deterministas que se ejecutan antes que él; nunca puede relajarlas.

La evaluación publicada cubre 15.593 peticiones de un conjunto de test retenido con una familia de planta y personas sintéticas no vistas en entrenamiento: 97,2% de peticiones maliciosas detectadas, 0,73% de peticiones legítimas bloqueadas por error y una precisión del 92,2% en la clasificación de las cuatro acciones. Los datos de entrenamiento son sintéticos y no se han publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 6 capas, anchura 256, 8 cabezas de atención, con 10 cabezas de salida específicas por pregunta |
| Parámetros totales | 4,85 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Vocabulario cerrado de 248 símbolos con tokens marcadores por pregunta; no existe ventana de contexto de texto libre |
| Tipos de cuantización | int8 dinámica (cuantización ONNX) |
| Idiomas soportados | Inglés (etiqueta `en` del autor); sin interfaz de texto libre, por lo que el soporte multilingüe no es aplicable |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), archivo `student.int8.onnx`; requiere `vocab.json` y `heads.json` en el mismo directorio |
| Pipeline declarado | `text-classification` |
| Tamaño del artefacto | ~5 MB (repositorio de 0,0 GB según HuggingFace) |
| Latencia declarada | ~5 ms por petición, un solo hilo, CPU de portátil |

## Arquitectura y entrenamiento

El modelo es un encoder transformer compacto de 6 capas y 256 dimensiones con 8 cabezas de atención, adaptado a un vocabulario cerrado de 248 símbolos que incluye tokens marcadores por pregunta, y rematado con diez cabezas de salida. La forma de salida es calibrada y de vocabulario cerrado: el modelo no genera texto, sino que produce la distribución de las cuatro acciones (allow, cache, defer, deny) junto con señal de confianza. El entrenamiento combina destilación de conocimiento desde las distribuciones por pregunta de Talos-0.8B con las etiquetas del oráculo, seguida de escalado de temperatura por cabeza y un umbral de abstención conformal, lo que permite la categoría "defer" y acota estadísticamente el riesgo de decidir con baja confianza.

El corpus de entrenamiento es sintético e idéntico al del profesor, y no está publicado. La exportación se hace a ONNX opset 17 con cuantización int8 dinámica; los archivos `vocab.json` y `heads.json` son obligatorios junto al binario, y el repositorio incluye además `provenance.json`. La integración prevista es `talos-proxy --weights <dir>` o la clase `OnnxJudge("<dir>")` desde Python, siempre detrás de las reglas deterministas de la pasarela, que se ejecutan primero y cuyo veredicto el modelo solo puede endurecer.

## Capacidades

- Clasificación de peticiones de agentes en cuatro acciones discretas: allow, cache, defer y deny.
- Detección de peticiones maliciosas o fuera de política sobre peticiones dirigidas a sistemas de control industrial (OT).
- Identificación de agentes con comportamiento anómalo, con un AUROC de 0,991 en el conjunto de evaluación.
- Calibración de confianza por cabeza y abstención conformal, que habilita la acción "defer" cuando la confianza es insuficiente.
- Funcionamiento sin mapa de registros: mantiene tasas de detección del 97,5% con un 1,23% de bloqueos erróneos cuando no se dispone de register map.
- Inferencia en CPU pura, un solo hilo, ~5 ms por petición, apta para bucles de decisión en el borde.
- Ejecución local y offline, sin dependencia de servicios externos.
- No soporta tool calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio; la model card excluye explícitamente una interfaz de texto.

## Casos de uso

- Pasarela de control industrial: desplegar `talos-proxy` delante de un PLC o broker OPC-UA para que cada petición de un agente LLM pase por las reglas deterministas y, después, por el juez neuronal, que puede degradar la acción a deny o defer. Los 5 ms por petición permiten mantener el modelo en la ruta crítica sin añadir latencia perceptible.
- Gateways de planta sin GPU: con 5 MB de artefacto y ejecución en un hilo de CPU, el modelo cabe en gateways industriales modestos y en equipos ARM, donde un modelo de 0,8B no sería desplegable.
- Cascada de decisión con el profesor: usar el estudiante como primer filtro para todas las peticiones y escalar a Talos-0.8B únicamente los casos con confianza por debajo del umbral (el 15% de las peticiones quedan por debajo de p=0,9), reduciendo el coste computacional agregado.
- Monitorización de agentes autónomos: registrar la distribución de acciones y la confianza por agente para detectar derivas de comportamiento; el AUROC de 0,991 sobre agentes mal comportados lo hace utilizable como señal de alerta temprana en un SOC industrial.
- Entornos air-gapped: plantas con redes aisladas donde no se puede llamar a una API externa; el modelo se descarga con `talos-pull` en `./weights` y opera completamente en local.
- Auditoría y trazabilidad de decisiones: combinado con `provenance.json` y el registro de la pasarela, permite reconstruir por qué una petición fue denegada o diferida, algo necesario en cumplimiento de seguridad de sistemas industriales.
- Filtrado previo en laboratorios de pruebas de agentes: evaluar lotes de peticiones sintéticas contra el juez para calibrar políticas antes de habilitar un agente en producción, con throughput derivado de ~200 peticiones por segundo por hilo en CPU de portátil.

## Benchmarks y rendimiento

Resultado declarado en la model card (model-index): precisión de clasificación de 4 acciones = 0,922 sobre el conjunto sintético retenido "Talos run5 held-out plant family and personas" (no publicado; métrica no verificada de forma independiente).

Comparación estudiante frente a profesor sobre el mismo test retenido de 15.593 peticiones con familia de planta y personas no vistas:

| Métrica | Student (int8) | Teacher (0,8B) |
|---|---|---|
| Peticiones maliciosas detectadas | 97,2% | 98,2% |
| Peticiones legítimas bloqueadas por error | 0,73% | 0,58% |
| Sin register map: detectadas / bloqueadas por error | 97,5% / 1,23% | 98,1% / 0,97% |
| Precisión de 4 acciones | 92,2% | 93,6% |
| Precisión cuando confía (p ≥ 0,9) | 97,9% (85% de las peticiones) | 99,0% (80%) |
| AUROC de agentes mal comportados | 0,991 | 0,992 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es evaluable en esas tareas al no tener interfaz de texto libre.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo está pensado para CPU. El artefacto ocupa ~5 MB y el consumo de RAM es del orden de decenas de MB incluyendo vocabulario y cabezas.
- GPU recomendadas: ninguna. No se documenta ni se requiere aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica; el despliegue objetivo es CPU de portátil y gateways industriales.
- Opciones de despliegue: ONNX Runtime vía `OnnxJudge("<dir>")` en Python, o el binario `talos-proxy --weights <dir>`; descarga de artefactos con `talos-pull`. vLLM, TGI, llama.cpp y Ollama no son aplicables porque el modelo no es generativo.
- Latencia: ~5 ms por petición en un solo hilo de CPU de portátil (dato del autor). Throughput derivado: en torno a 200 peticiones por segundo por hilo, antes de contabilizar el coste de las reglas deterministas de la pasarela.
- Almacenamiento: los cuatro archivos (`student.int8.onnx`, `vocab.json`, `heads.json`, `provenance.json`) caben holgadamente en cualquier dispositivo de borde.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión 4 acciones | Maliciosas detectadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Talos student (int8 ONNX) | 4,85 M | No aplica (vocabulario cerrado) | 92,2% | 97,2% | Apache 2.0 | HuggingFace (`tractian/talos-student`) |
| Talos-0.8B (profesor) | 0,8 B | No disponible | 93,6% | 98,2% | No disponible en la información | Referenciado en la model card; no se confirma su publicación |
| Otros clasificadores de políticas para agentes | No disponible | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas públicas comparables en la información disponible |

La comparación relevante es contra su propio profesor: el estudiante pierde 1,0 punto de detección de peticiones maliciosas y 1,4 puntos de precisión de 4 acciones, a cambio de reducir el tamaño en más de dos órdenes de magnitud y eliminar la necesidad de GPU. No se dispone de datos sobre modelos de terceros con la misma función (juicio de peticiones de agentes contra sistemas OT).

## Limitaciones y advertencias

- No es un sistema de seguridad ni un mecanismo de autenticación; la model card lo excluye explícitamente. Solo puede endurecer el veredicto de las reglas deterministas, nunca relajarlo.
- No dispone de interfaz de texto: no admite prompts en lenguaje natural y solo procesa entradas en su vocabulario cerrado de 248 símbolos con marcadores por pregunta.
- Tasa de fuga del 2,8% de peticiones maliciosas en el conjunto de test; un 0,73% de peticiones legítimas se bloquean por error. Con peticiones de baja confianza, la cobertura cuando confía baja al 85% de los casos.
- Los datos de entrenamiento son sintéticos y no publicados, y el conjunto de evaluación tampoco es público: los resultados no son reproducibles de forma independiente y la métrica del model-index figura como no verificada.
- El rendimiento se mide sobre una familia de planta y personas sintéticas retenidas; no hay evidencia publicada de generalización a plantas reales, protocolos distintos de Modbus/OPC-UA ni distribuciones de tráfico reales.
- Sesgos conocidos: no se documentan análisis de sesgo; al operar sobre un vocabulario y un generador sintético, pueden existir sesgos de distribución hacia los patrones de petición usados en la destilación.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de calibración: la confianza reportada depende del escalado de temperatura y del umbral conformal, que deben validarse sobre datos propios antes de confiar en la categoría defer.
- La etiqueta de idioma es `en` y el modelo está pensado para ese dominio; no hay soporte declarado para otras lenguas.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se documentan restricciones adicionales de uso.
- Requiere que `vocab.json` y `heads.json` acompañen al binario; un despliegue con solo el archivo ONNX fallará o producirá salidas incorrectas.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son de 2026-10-22: conviene verificar la vigencia y el soporte del proyecto antes de adoptarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tractian/talos-student
- Repositorio de código, proxy y documentación: https://github.com/tractian/talos
- No se han encontrado en la búsqueda web papers, blogs ni demos adicionales relevantes para este modelo; los resultados devueltos por la búsqueda no guardan relación con Talos y se han descartado.
