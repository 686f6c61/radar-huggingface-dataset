# XuejiFang/LeWAM

## Resumen

LeWAM es un modelo de robótica orientado a la generación de acciones (policy) desarrollado por XuejiFang (Hakim), investigador de doctorado conjunto en el MAPLE Lab de Westlake y la Universidad de Zhejiang. El modelo aprende acciones de robot y dinámica visual directamente en el espacio de embeddings de JEPA, sin depender de un backbone de difusión de vídeo preentrenado, lo que lo diferencia de buena parte de los enfoques recientes de políticas de difusión. Su modelo base es `facebook/ijepa_vith14_22k`, y el repositorio incluye el predictor LeWAM, el codificador de visión I-JEPA-Huge congelado, el scheduler y las estadísticas de acciones de RoboTwin.

La pieza central es un predictor de difusión que genera 32 acciones de robot por llamada de inferencia, usando 10 pasos de denoising por defecto. Esto lo sitúa en la familia de políticas con *action chunking*, adecuadas para control de manipulación donde se predice un horizonte de acciones en lugar de una única acción por paso. La comparación controlada de codificadores visuales congelados realizada por los autores concluye que I-JEPA-Huge es el más eficaz para la generación de acciones entre los evaluados.

El repositorio ocupa 4,1 GB y se distribuye en formato safetensors con integración en la librería `diffusers` mediante `LeWAMPipeline`. Se trata de un modelo de investigación con muy baja adopción pública (8 descargas y 0 *likes* en el momento de la consulta), sin resultados de benchmarks publicados en la información disponible y con una licencia del repositorio principal no especificada, lo que condiciona cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de difusión sobre espacio de embeddings JEPA; codificador de vision I-JEPA-Huge (ViT-H/14) congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible para el repositorio principal; el codificador I-JEPA-Huge incluido se distribuye bajo CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | safetensors |
| Modelo base | facebook/ijepa_vith14_22k |
| Pipeline / libreria | diffusers:LeWAMPipeline |
| Tarea declarada | robotics (generacion de acciones para manipulacion) |
| Acciones por llamada de inferencia | 32 |
| Pasos de denoising por defecto | 10 |
| Tamano del repositorio | 4,1 GB |
| Benchmark de evaluacion | RoboTwin (estadisticas de acciones incluidas) |
| Fecha de creacion / actualizacion | 2026-09-23 / 2026-09-23 |

## Arquitectura y entrenamiento

LeWAM combina dos componentes: un codificador visual congelado I-JEPA-Huge (`facebook/ijepa_vith14_22k`, arquitectura ViT-H/14) y un predictor de difusión entrenado que opera en el espacio de embeddings de dicho codificador. La innovación declarada por los autores es precisamente evitar un backbone de difusión de vídeo preentrenado: en lugar de generar píxeles o vídeo y derivar después las acciones, el modelo aprende simultáneamente las acciones de robot y la dinámica visual en el espacio latente de JEPA. Según el repositorio de GitHub, la comparación controlada de codificadores visuales congelados identifica I-JEPA-Huge como el más eficaz para la generación de acciones entre los evaluados.

El mecanismo de generación es de tipo difusión: el predictor produce 32 acciones por llamada aplicando 10 pasos de denoising por defecto, lo que configura una política de *action chunking* con horizonte fijo. El repositorio incluye el scheduler y las estadísticas de acciones de RoboTwin necesarias para normalizar y desnormalizar las predicciones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO (en un modelo de robótica estos últimos serían, en todo caso, poco habituales). Tampoco se detalla el número total de parámetros del predictor de difusión ni la configuración exacta de sus capas.

## Capacidades

- Predicción de acciones de robot: genera bloques de 32 acciones por llamada de inferencia, con 10 pasos de denoising por defecto.
- Aprendizaje de dinámica visual: modela la evolución visual en el espacio de embeddings de JEPA, lo que habilita su uso como modelo de mundo latente.
- Manipulación robótica evaluada en RoboTwin: el repositorio incluye las estadísticas de acciones de dicho benchmark y el código de inferencia para su evaluación.
- Uso con codificador visual congelado: se apoya en I-JEPA-Huge (ViT-H/14), incluido en el propio repositorio.
- Integración con `diffusers`: expone `LeWAMPipeline`, lo que permite reutilizar tooling de schedulers y pesos en ese ecosistema.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión por prompt en lenguaje natural, tool calling, function calling ni capacidades de agente multi-paso, según la información disponible.
- No se documentan capacidades multilingües ni modos especiales como *thinking mode*, audio o visión generalista.

## Casos de uso

- Manipulación bimanual en simulación con RoboTwin: el modelo se evalúa directamente sobre este benchmark, de modo que su uso natural es generar secuencias de 32 acciones para tareas de manipulación en el simulador, aprovechando las estadísticas de acciones incluidas en el repositorio.
- Control robótico con action chunking: al predecir 32 acciones por inferencia en lugar de una sola, reduce la frecuencia de llamadas al modelo y amortigua el coste de cómputo por paso de control, algo útil en lazos de control donde la latencia de política es crítica.
- Modelado de mundo latente para planificación: como el modelo aprende dinámica visual en el espacio de JEPA, puede emplearse para simular *rollouts* en el espacio de embeddings y comparar trayectorias candidatas antes de ejecutar una acción en el robot real.
- Investigación sobre codificadores visuales congelados: el repositorio documenta una comparación controlada de encoders, por lo que sirve como banco de pruebas para estudiar qué representaciones visuales preentrenadas funcionan mejor para generación de acciones.
- Fine-tuning para tareas de manipulación propias: partiendo de los pesos publicados y del pipeline de `diffusers`, un equipo puede adaptar el predictor a un conjunto de demostraciones propio, manteniendo el codificador I-JEPA-Huge congelado.
- Evaluación comparativa de políticas de difusión sin backbone de vídeo: al prescindir de un modelo de difusión de vídeo preentrenado, es un punto de referencia útil para medir cuánto aporta realmente ese preentrenamiento frente al aprendizaje directo en el espacio JEPA.
- Prototipado académico en robótica: con un repositorio de 4,1 GB y pesos en safetensors, permite reproducir experimentos de manipulación en un entorno de laboratorio con recursos de GPU moderados, siempre que se respete la restricción no comercial del codificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el repositorio únicamente indican que la evaluación se realiza sobre RoboTwin y que existe una comparación controlada de codificadores visuales congelados en la que I-JEPA-Huge resultó el más eficaz, pero no se proporcionan cifras de éxito, tasas de completion ni métricas numéricas.

| Benchmark | Resultado | Notas |
|---|---|---|
| RoboTwin | no disponible | Se menciona como entorno de evaluacion, sin cifras publicadas en la informacion disponible |
| Comparacion de codificadores visuales | no disponible | Los autores afirman que I-JEPA-Huge es el mas eficaz, sin datos numericos |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los pesos ocupan 4,1 GB en safetensors, por lo que la inferencia en precisión de 16 bits debería requerir del orden de 6 a 10 GB de VRAM, cantidad a la que hay que sumar el estado del scheduler y los buffers de activaciones del predictor de difusión. Es una estimación derivada del tamano del repositorio, no un dato confirmado por los autores.
- GPU recomendadas: no disponible. Por tamano, el modelo es plausible en GPUs de gama alta de consumo (por ejemplo, RTX 4090 o RTX 3090) y en GPUs de datacenter (A100, H100), pero no hay recomendaciones oficiales.
- GPU de consumo: sí, previsiblemente cabe en GPUs con 12 GB o más de VRAM, aunque el dato no está confirmado.
- Opciones de despliegue: la vía documentada es la librería `diffusers` con `LeWAMPipeline` y el código de inferencia del repositorio de GitHub (`XuejiFang/LeWAM`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de acciones.
- Latencia y throughput: no disponible. El único dato relacionado es que cada llamada de inferencia ejecuta 10 pasos de denoising y produce 32 acciones.

## Comparativa con modelos similares

La información disponible no incluye comparativas numéricas con otras políticas robóticas. La comparación publicada por los autores se limita a codificadores visuales congelados (con I-JEPA-Huge como ganador), no a modelos completos.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeWAM | no disponible | 32 acciones por inferencia, 10 pasos de denoising | no disponible | no disponible (encoder incluido bajo CC BY-NC 4.0) | HuggingFace y GitHub |
| Politicas de difusion con backbone de video preentrenado | no disponible | no disponible | no disponible | no disponible | no disponible |
| Codificadores visuales alternativos evaluados por los autores | no disponible | no aplica | I-JEPA-Huge declarado el mas eficaz | no disponible | no disponible |

## Limitaciones y advertencias

- Adopción muy baja: 8 descargas y 0 *likes* en el momento de la consulta, lo que implica escasa validación por parte de terceros.
- Ausencia de benchmarks publicados: no hay métricas de éxito en RoboTwin ni en otros entornos, por lo que el rendimiento real es desconocido.
- Licencia del repositorio principal no especificada: no se puede confirmar si el uso comercial está permitido. Además, el codificador I-JEPA-Huge incluido está bajo CC BY-NC 4.0, lo que restringe explícitamente el uso comercial del conjunto.
- Dependencia de un codificador congelado: el rendimiento queda condicionado a las representaciones de I-JEPA-Huge, y cualquier redistribución debe respetar la licencia de dicho componente.
- Sesgos: no disponible. No se documenta ningún análisis de sesgo, y en robótica estos se manifiestan como sesgos de distribución de datos (tareas, objetos, morfologías) más que como sesgos lingüísticos.
- Riesgo de alucinación: no aplica en el sentido habitual de modelos de lenguaje, pero sí existe riesgo de predicciones de acción no válidas o inseguras cuando el estado observado queda fuera de la distribución de entrenamiento.
- Limitación de horizonte: la predicción está fijada en bloques de 32 acciones, lo que puede resultar insuficiente para tareas de horizonte largo y obliga a re-planificar.
- Alcance restringido: es un modelo específico de manipulación robótica evaluado en RoboTwin; no es un modelo de propósito general ni soporta entradas en lenguaje natural.
- Caveat para producción: la combinación de licencia incierta, encoder no comercial, ausencia de métricas y baja adopción desaconseja su uso en sistemas en producción sin una evaluación propia exhaustiva y una revisión legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XuejiFang/LeWAM
- Repositorio de GitHub con el código de inferencia: https://github.com/XuejiFang/LeWAM
- Modelo base (codificador de vision I-JEPA): https://huggingface.co/facebook/ijepa_vith14_22k
- Perfil del autor en GitHub: https://github.com/xuejifang
- Repositorio FocusDiT del mismo autor: https://github.com/XuejiFang/FocusDiT
