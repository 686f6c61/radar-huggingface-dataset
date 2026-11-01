# Thox-ai/ThoxMesh-32B

## Resumen

ThoxMesh-32B es un paquete de configuración publicado por Thox-ai sobre los pesos de Qwen3-32B, un transformer denso de 32.000 millones de parámetros desarrollado originalmente por Alibaba Qwen. THOX no ha entrenado ni ajustado los pesos: su aportación consiste en un perfil de sistema (Modelfile para Ollama), un manifiesto de versión y un paquete de conocimiento en formato JSONL con ocho entradas públicas verificadas. El repositorio de HuggingFace contiene únicamente esos artefactos de empaquetado; los pesos reales se descargan del modelo base fijado.

El modelo se presenta como el escalón denso de la familia THOX Mesh, pensado como línea base de un solo nodo para comparaciones posteriores con ThoxMesh-30B-A3B (una variante MoE). Su caso de uso declarado es la inferencia local en estaciones de trabajo con Ollama, con un tag por defecto de 20 GB y una recomendación de 48 a 64 GB de memoria de sistema para trabajar con contexto amplio.

Es relevante ahora por dos motivos: por un lado, ilustra una práctica creciente de distribución de "paquetes de configuración" sobre modelos abiertos, donde el valor añadido está en el perfil de sistema y el retrieval local, no en el entrenamiento; por otro, su estado de publicación es explícitamente incompleto. La evaluación figura como PENDING y el listado en el espacio de nombres de Ollama aún no estaba disponible en la fecha de la información (31 de octubre de 2026), por lo que cualquier afirmación de rendimiento carece por ahora de respaldo medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-32B) |
| Parametros totales | 32B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el autor recomienda 48-64 GB de memoria de sistema para contexto comodo) |
| Tipos de cuantizacion | No disponible; el tag por defecto de Ollama ocupa 20 GB |
| Idiomas soportados | Ingles (segun la model card y los tags del repositorio) |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | No se distribuyen pesos en el repositorio; se publican Modelfile, manifest.json y thox-knowledge-v0.1.jsonl. Los pesos se obtienen via Ollama desde el tag fijado qwen3:32b |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B: un transformer denso de 32.000 millones de parámetros. THOX no aporta cambios arquitectónicos ni ha realizado entrenamiento alguno; la model card lo declara de forma explícita ("No training"). La personalización consiste en un perfil de sistema definido en el Modelfile (profiles/SYSTEM-mesh.txt) y un paquete de conocimiento versionado, THOX Knowledge Pack v0.1, que contiene ocho entradas públicas verificadas en formato JSONL para recuperación local.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF o DPO. Tampoco se describen innovaciones técnicas propias: el pin del digest upstream se registra en tiempo de construcción, aunque la model card indica que debe añadirse al repositorio antes del push público. El manifiesto (manifest.json, 329 bytes) fija la versión del perfil y del paquete de conocimiento.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3-32B.
- Recuperación local sobre el THOX Knowledge Pack v0.1 (ocho entradas JSONL), integrada mediante el perfil de sistema.
- Ejecución local con Ollama, tanto desde el modelo publicado como construyendo desde el repositorio con `ollama create`.
- Comportamiento "THOX-aware" en chat cuando se usa junto con el perfil de sistema incluido.
- Capacidad de operar como línea base de referencia (baseline) para comparaciones de un solo nodo frente a la variante MoE de la familia.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito. La model card no las menciona.
- El enrutamiento de peticiones MeshStack es una función del runtime THOX, no del modelo: la salida de enrutamiento es advisory y el runtime autoriza y ejecuta.

## Casos de uso

- Inferencia local en estación de trabajo: el modelo se ejecuta con Ollama en una máquina de gama alta, con 48-64 GB de memoria de sistema recomendados para trabajar con contexto amplio. Es adecuado para entornos donde los datos no deben salir del equipo.
- Línea base de evaluación: sirve como referencia densa de un solo nodo (latencia, tokens por segundo, memoria) frente a la que medir los resultados de configuraciones multi-nodo o de la variante MoE ThoxMesh-30B-A3B.
- Chat con conocimiento curado: el THOX Knowledge Pack v0.1 permite respuestas ancladas a ocho entradas públicas verificadas, útil en dominios acotados donde se prefiere retrieval local a conocimiento paramétrico.
- Pruebas de integración con el runtime THOX: el paquete permite validar el perfil de sistema y el manifiesto antes de desplegar configuraciones MeshStack más complejas.
- Reproducibilidad de despliegues: el Modelfile fija la base upstream, de modo que un equipo puede reconstruir exactamente la misma configuración a partir del repositorio, algo útil para auditoría interna.
- Prototipado de asistentes internos en inglés: al ser un modelo denso de 32B con licencia Apache-2.0, puede desplegarse sin fricción legal en herramientas internas de documentación o soporte en inglés.
- Docencia y experimentación: la separación clara entre pesos (Qwen) y configuración (THOX) lo convierte en un ejemplo didáctico de empaquetado de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación está PENDING y que, antes de cualquier afirmación de rendimiento, se requieren un smoke test en el host de construcción, comprobaciones de grounding y la medición de la línea base de un solo nodo (latencia, tokens por segundo, memoria).

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada; el tag por defecto de Ollama ocupa 20 GB, lo que sugiere una cuantización de aproximadamente 4-5 bits para los 32B parámetros.
- Memoria de sistema: el autor recomienda entre 48 y 64 GB para trabajar con contexto cómodo.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, un modelo de 32B en cuantización de ~20 GB encaja en GPUs de 24 GB (RTX 4090, A10G, L4) y con holgura en A100 40/80 GB y H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 (24 GB) con la cuantización por defecto; no confirmado por el autor.
- Opciones de despliegue: Ollama es el método documentado (modelo publicado o construcción local con `ollama create`). No se mencionan vLLM, llama.cpp, TGI ni otros backends.
- Latencia y throughput: no disponibles; forman parte de la evaluación pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| ThoxMesh-32B | 32B | Densa (Qwen3-32B) | No disponible | Apache-2.0 | Empaquetado publicado; evaluación pendiente |
| Qwen/Qwen3-32B | 32B | Densa | No disponible en la informacion | Apache-2.0 | Modelo base upstream, publicado |
| ThoxMesh-30B-A3B | 30B totales (activos no disponibles) | MoE | No disponible | No disponible en la informacion | Variante MoE de la misma familia; el enrutamiento MeshStack es el modo verificado segun su card |

La comparación relevante es con el propio Qwen3-32B: ThoxMesh-32B no modifica los pesos, por lo que su rendimiento intrínseco debería coincidir con el del base, y la diferencia se limita al perfil de sistema y al paquete de conocimiento. Frente a ThoxMesh-30B-A3B, la distinción es arquitectónica (densa frente a MoE) y de rol (línea base de un nodo frente a enrutamiento multi-nodo).

## Limitaciones y advertencias

- Evaluación pendiente: no existe ninguna medición publicada de latencia, throughput, memoria ni calidad para esta configuración. Cualquier uso en producción parte sin datos de respaldo.
- Publicación incompleta: en la fecha indicada, el listado en el espacio de nombres de Ollama y la evaluación medida estaban en curso; hasta entonces hay que construir el modelo desde el repositorio.
- Sin entrenamiento propio: THOX no ha ajustado los pesos, de modo que los sesgos y las alucinaciones son los del Qwen3-32B subyacente, no los de un modelo específicamente alineado para esta distribución.
- Idioma: solo se declara inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Enrutamiento no autónomo: la salida de enrutamiento es advisory; el runtime THOX es quien autoriza y ejecuta. El modelo por sí solo no realiza inferencia distribuida.
- Paquete de conocimiento mínimo: ocho entradas JSONL constituyen una base de retrieval muy reducida; no debe confundirse con un corpus de dominio amplio.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar el aviso de Apache. Los elementos propios de THOX (perfil de sistema, paquete de conocimiento, empaquetado) se rigen por la misma licencia según la card.
- Trazabilidad: el pin del digest upstream se registra en tiempo de construcción, pero la card señala que debe añadirse al repositorio antes del push público; conviene verificar la integridad de la base antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Thox-ai/ThoxMesh-32B
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Modelo relacionado de la familia (MoE): https://huggingface.co/Thox-ai/ThoxMesh-30B-A3B (referenciado en la model card)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
