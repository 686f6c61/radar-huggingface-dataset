# stijnvandoornum/Ternary-Bonsai-2-27B-OpenVINO

## Resumen

Ternary Bonsai 2 27B OpenVINO es una conversión experimental del checkpoint ternario (Q2_0) del modelo Prism ML Ternary Bonsai 2 27B, empaquetada como grafos OpenVINO para ejecución en CPU e Intel GPU. El autor, stijnvandoornum, no entrena ni cuantiza de nuevo: parte del fichero GGUF original `Ternary-Bonsai-2-27B-Q2_0.gguf` (revisión `839bd57`) y traduce sus pesos de dos bits, con sus escalas de grupo originales, a un conjunto de grafos layerwise que incluyen transformadas de Hadamard y vectores de signo explícitos. El resultado ocupa aproximadamente 7,7 GB en disco.

El paquete no es un modelo listo para producción: es una implementación de viabilidad con un runner propio en Python, sin compatibilidad con OpenVINO GenAI ni con `from_pretrained()` de Optimum. Se compone de un grafo de embeddings, 64 grafos de capas decodificadoras y 16 shards de proyección de vocabulario, y solo admite entrada de texto, lote de tamaño uno y un token por llamada de inferencia. El modelo base pertenece a la familia Qwen3.5 según las etiquetas del repositorio, aunque la model card no detalla parámetros totales ni longitud de contexto.

Su relevancia es acotada pero real: demuestra que un transformer de gran tamaño con pesos ternarios puede exportarse a OpenVINO y producir la misma predicción que el runtime llama.cpp original en una prueba corta, lo que abre la puerta a inferencia de modelos de 27B en hardware Intel sin GPUs de gama alta, a costa de una latencia muy elevada y de un soporte funcional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5; detalles no disponibles) |
| Parametros totales | 27B (según nombre del modelo; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria Q2_0 (2 bits con escalas de grupo), sin recuantización adicional |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (scripts de conversión); licencia y avisos del modelo Prism original incluidos en `LICENSE` y `NOTICE.txt` |
| Formato de pesos | Grafos OpenVINO (IR) layerwise, con pesos empaquetados en `u2`; origen GGUF |
| Tamano del repositorio | 7,7 GB |
| Entrada soportada | Solo texto (sin visión) |
| Batch size | 1 |
| Tokens por llamada | 1 |
| Compatibilidad | Runner Python propio; sin OpenVINO GenAI ni Optimum `from_pretrained()` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5, según las etiquetas del repositorio, con pesos ternarios Q2_0 agrupados y escalas de grupo. La conversión no altera la cuantización: mantiene los pesos en dos bits y añade en los grafos las transformadas de Hadamard y los vectores de signo necesarios para reproducir la semántica del checkpoint original. La implementación sigue las operaciones y el layout empaquetado del fork de llama.cpp de Prism ML.

El repositorio no documenta datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO; esa información correspondería al modelo base de Prism ML, no a esta conversión. La innovación técnica aquí es de despliegue: exportación layerwise para reducir el pico de memoria (se carga y compila una capa cada vez), empaquetado de embeddings en bytes con desempaquetado explícito de la fila seleccionada (un `Gather` directo sobre tabla `u2` devolvía ceros en el backend CPU probado) y proyección de vocabulario fragmentada en 16 shards.

La validación es limitada: comprobaciones independientes en PyTorch para las capas reales 0 y 3 durante tres tokens sucesivos, incluido estado recurrente y KV-cache, y coincidencia del siguiente token con el modelo Q2_0 original de Prism en llama.cpp para el prompt `The capital of France is` → ` Paris` (token 11751), con una diferencia absoluta máxima de 0,048624 en las top-20 log-probabilidades de referencia. No se han validado prompts largos, conversaciones extendidas, generación de múltiples tokens con el modelo completo ni ejecución completa en GPU.

## Capacidades

- Generación de texto autoregresiva mediante decodificación greedy sobre un prompt de completación en bruto.
- Razonamiento y conocimiento general heredados del modelo base (no evaluados en esta conversión).
- Sin soporte de tool calling ni function calling documentado.
- Sin soporte de agentes ni razonamiento multi-paso documentado.
- Sin modo thinking ni capacidades especiales documentadas.
- Solo texto: la entrada de visión no está soportada.
- Multilingüismo: no disponible en la información proporcionada.
- El runner no aplica automáticamente la plantilla de chat; el tokenizador y la plantilla se toman de la release MLX de Prism.

## Casos de uso

- Evaluación de viabilidad de pesos ternarios en OpenVINO: reproducir el siguiente token del checkpoint original en CPU Intel para verificar la fidelidad numérica de la exportación antes de invertir en un port completo.
- Investigación sobre cuantización extrema: estudiar cómo se comportan pesos de 2 bits con escalas de grupo y transformadas de Hadamard en el grafo de OpenVINO, comparando log-probabilidades con el runtime llama.cpp.
- Pruebas de despliegue en hardware Intel sin GPU dedicada: ejecutar un modelo de 27B en CPU o Intel UHD con un consumo de almacenamiento de 7,7 GB, adecuado para entornos con memoria limitada.
- Desarrollo de tooling de exportación: reutilizar los scripts de conversión y el validador de capas decodificadoras como base para portar otros checkpoints GGUF a grafos OpenVINO.
- Docencia y demostraciones: ilustrar el pipeline completo de un modelo ternario (GGUF → grafos IR → inferencia) con un caso reproducible y un `validation.json` con medidas exactas.
- Pruebas de regresión numérica: usar el par de referencia (prompt corto, token esperado, diferencia máxima en top-20) como test unitario en pipelines de CI para conversiones de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento es una prueba de humo en CPU: prompt de cinco tokens más generación del siguiente token en 10,7 minutos en la máquina de validación, incluyendo compilación. El autor indica explícitamente que no es una medida de decodificación en estado estacionario.

## Requisitos de hardware

- Almacenamiento: aproximadamente 7,7 GB de pesos en disco.
- VRAM/RAM: no se especifica un mínimo; el diseño layerwise carga y compila una capa cada vez para reducir el pico de memoria, por lo que el requisito dominante es RAM del sistema más el grafo de una capa.
- GPU: la opción `--device GPU` es experimental; se probó una proyección real con pesos `u2` en CPU y en Intel UHD. No se ha establecido la estabilidad en GPU en el sistema del autor.
- GPU de consumo: no hay datos de ejecución completa en RTX 4090, A100 ni H100; el foco del paquete es CPU Intel e iGPU.
- Despliegue: runner propio `run_bonsai.py` con OpenVINO; no compatible con vLLM, llama.cpp, Ollama ni TGI en este formato. El checkpoint original en GGUF sí puede ejecutarse con el fork de llama.cpp de Prism ML.
- Latencia: 10,7 minutos para prompt de cinco tokens más un token generado en CPU, incluyendo compilación; sin datos de throughput en estado estacionario.
- Estabilidad: los procesos de test de proyección aislados mostraron fallos de apagado tras las comprobaciones numéricas; el exportador completo y el validador de capas terminaron limpiamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-OpenVINO (este) | 27B (según nombre) | no disponible | Ternaria Q2_0 | Apache-2.0 (scripts); ver LICENSE del base | Grafos OpenVINO layerwise, runner Python propio |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B (según nombre) | no disponible | Ternaria Q2_0 | ver LICENSE del repositorio original | GGUF, fork de llama.cpp de Prism ML |
| Release MLX de Prism (tokenizador y plantilla) | no disponible | no disponible | no disponible | no disponible | MLX |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Exportación experimental: no es un servidor optimizado y el propio autor la describe como implementación de viabilidad.
- Sin compatibilidad con OpenVINO GenAI ni con Optimum `from_pretrained()`; requiere el runner incluido.
- Solo texto: sin visión, sin audio y sin otras modalidades.
- Batch size 1 y un token por llamada de inferencia; no apto para serving concurrente.
- El runner no aplica la plantilla de chat automáticamente; hay que gestionarla desde el código llamante.
- Validación muy limitada: solo dos capas reales en PyTorch, un prompt corto y un token generado con el modelo completo; sin pruebas de prompts largos ni conversaciones multi-turno.
- Estabilidad en GPU no establecida; los tests de proyección aislados mostraron fallos de apagado.
- Diferencias numéricas esperables frente a llama.cpp por la cuantización de activaciones en ese runtime (máximo 0,048624 en top-20 log-probabilidades en la prueba realizada).
- Riesgo de alucinación y sesgos: no evaluados en esta conversión; deben asumirse los del modelo base.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Licencia: los scripts de conversión son Apache-2.0, pero el uso del modelo está sujeto a la licencia y avisos del checkpoint Prism original incluidos en el repositorio; verificar antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stijnvandoornum/Ternary-Bonsai-2-27B-OpenVINO
- Modelo base en Hugging Face: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Fork de llama.cpp de Prism ML: https://github.com/PrismML-Eng/llama.cpp
