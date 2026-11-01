# Thox-ai/ThoxMesh-30B-A3B

## Resumen

ThoxMesh-30B-A3B es un empaquetado configurado por el proyecto THOX sobre los pesos de Qwen3-30B-A3B, un modelo Mixture-of-Experts (MoE) de 30.500 millones de parámetros totales con aproximadamente 3.300 millones activos por token. THOX no ha entrenado los pesos: su aportación consiste en un perfil de sistema (system profile), un paquete de conocimiento versionado (THOX Knowledge Pack v0.1) y una política de enrutamiento, distribuidos como un Modelfile de Ollama y un manifiesto de versión. El repositorio de HuggingFace contiene únicamente esos artefactos de empaquetado (Modelfile, manifest.json y un JSONL de conocimiento de 4,6 KB), no los pesos.

El modelo está pensado para inferencia local en una estación de trabajo con Ollama, con una etiqueta por defecto de 19 GB y una recomendación de 24 GB o más de memoria. Su uso previsto es el chat con reconocimiento de conceptos THOX, la explicación de conceptos de MeshStack y la generación de recomendaciones de enrutamiento. Es relevante como ejemplo de patrón "configuration-derived": publicar una capa de configuración y conocimiento sobre un modelo base abierto sin modificar sus pesos, lo que simplifica la trazabilidad y la licencia pero limita la mejora real de capacidades.

La evaluación del modelo está declarada como pendiente por el propio autor: no se ha ejecutado ningún benchmark THOX sobre esta configuración, y las cifras de rendimiento del Qwen3 original pertenecen a Qwen, no a THOX. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), heredada de Qwen3-30B-A3B |
| Parametros totales | 30.500 millones (30B) |
| Parametros activos | Aproximadamente 3.300 millones (3B) por token |
| Longitud de contexto | No disponible en la informacion proporcionada (corresponde a la del modelo base Qwen3-30B-A3B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; la etiqueta por defecto de Ollama ocupa 19 GB |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen3 es multilingue, pero esta ficha solo declara ingles |
| Licencia | Apache-2.0 (heredada de Qwen3) |
| Formato de pesos | Modelfile de Ollama que referencia el tag base `qwen3:30b-a3b`; no se distribuyen pesos en el repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-30B-A3B: un transformer con capas MoE de 30.500 millones de parámetros totales y unos 3.300 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. THOX no ha realizado ningún entrenamiento ni ajuste fino: el repositorio lo declara explícitamente ("no training"). La personalización se limita a un perfil de sistema incluido en el Modelfile (`profiles/SYSTEM-mesh.txt`) y a un paquete de conocimiento de 8 entradas públicas verificadas en formato JSONL (`thox-knowledge-v0.1.jsonl`), pensado para recuperación local en tiempo de ejecución, con identificadores de fuente y fechas de revisión.

No hay datos sobre número de tokens de entrenamiento, composición del dataset ni técnicas de alineación (RLHF/DPO) en la información proporcionada; esos detalles corresponden al modelo base y no se documentan aquí. La innovación destacable no es arquitectónica sino de empaquetado: separar la capa de configuración y conocimiento de los pesos, de modo que el modelo se reconstruye localmente a partir de un pin del modelo base y un perfil versionado. El pin de revisión upstream (digest de Ollama) se registra en tiempo de construcción según la model card.

## Capacidades

- Generación de texto conversacional en inglés mediante el modelo base Qwen3-30B-A3B.
- Respuestas contextualizadas sobre conceptos THOX y MeshStack gracias al perfil de sistema y al paquete de conocimiento inyectado.
- Recomendaciones de enrutamiento (routing recommendations) dentro del ecosistema THOX; el runtime valida disponibilidad, política, recursos y permisos antes de ejecutar.
- Recuperación local del Knowledge Pack v0.1 en tiempo de ejecución (8 entradas verificadas).
- Comportamiento de rechazo a fabricar topología (refusal-to-fabricate-topology), contemplado en el plan de evaluación del autor aunque no verificado todavía.
- Capacidades heredadas del modelo base Qwen3-30B-A3B (razonamiento, código, matemáticas, tool calling): no documentadas ni evaluadas en esta configuración por THOX.
- No realiza inferencia distribuida: MeshStack enruta peticiones completas a un nodo capaz de ejecutar el modelo entero; el particionado de un modelo entre nodos no es una capacidad verificada.

## Casos de uso

- Chat local con reconocimiento de THOX: el modelo responde sobre conceptos del ecosistema THOX apoyándose en el perfil de sistema y el Knowledge Pack, ejecutándose íntegramente en una estación de trabajo con Ollama.
- Explicación de conceptos de MeshStack: útil para que desarrolladores nuevos en el stack consulten definiciones y flujos sin salir de la máquina local.
- Asistente de recomendaciones de enrutamiento: sugiere a qué nodo dirigir una petición; el runtime THOX valida después la disponibilidad y los permisos antes de ejecutar.
- Despliegue local-first con requisitos de privacidad: al no enviar datos a la nube y ejecutarse con Ollama, encaja en entornos donde los datos no pueden salir de la estación de trabajo.
- Base para construir variantes configuradas: el patrón Modelfile + knowledge pack permite a un equipo crear su propio perfil de sistema y paquete de conocimiento sobre el mismo modelo base sin reentrenar.
- Prototipado de asistentes de dominio acotado: con solo 8 entradas de conocimiento, sirve para validar el flujo de recuperación local antes de escalar el pack.
- Evaluación comparativa de configuraciones: al fijar el modelo base y variar solo el perfil y el pack, permite aislar el efecto de la capa de configuración en pruebas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la evaluación como PENDING e indica que las cifras del Qwen3 original pertenecen a Qwen y no son resultados de THOX. El plan de evaluación pendiente incluye preguntas de humo de fábrica, comprobaciones de fundamentación contra el Knowledge Pack v0.1, pruebas de rechazo a fabricar topología y medición de throughput y memoria en un solo nodo.

## Requisitos de hardware

- VRAM/memoria estimada: la etiqueta por defecto de Ollama ocupa 19 GB; el autor recomienda planificar 24 GB o más de memoria.
- GPU recomendadas: no especificadas en la información proporcionada; por el tamaño de la etiqueta (19 GB), requiere GPU con al menos 24 GB de VRAM para ejecución íntegra en GPU.
- GPU de consumo: cabe en tarjetas con 24 GB de VRAM o más (por ejemplo, gama RTX xx90 de 24 GB), aunque el autor no confirma modelos concretos.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thoxmesh-30b-a3b` o construcción local con `ollama create` a partir del Modelfile). No se documentan otras opciones como vLLM, llama.cpp o TGI para esta configuración.
- Latencia y throughput: no disponibles; la medición de throughput y memoria en un solo nodo está pendiente según la model card.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxMesh-30B-A3B | 30,5B / ~3,3B (MoE) | No disponible | Apache-2.0 | Repositorio de empaquetado en HF; modelo en Ollama pendiente de publicación | Configuración derivada, sin entrenamiento propio; evaluación pendiente |
| Qwen3-30B-A3B (base) | 30,5B / ~3,3B (MoE) | No disponible en esta ficha | Apache-2.0 | Pesos publicados por Qwen | Modelo base upstream; dispone de benchmarks propios de Qwen |
| Alternativas MoE de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada para una comparación numérica |

## Limitaciones y advertencias

- Sin recuperación activa, el modelo no dispone de hechos THOX más allá de los de su entrenamiento base; el conocimiento está limitado al pack suministrado.
- La evaluación está pendiente: no hay evidencia publicada de calidad, fundamentación ni rendimiento para esta configuración.
- No realiza inferencia distribuida; el enrutamiento es una recomendación que el runtime debe validar.
- El repositorio no contiene pesos: depende de un pin del modelo base y de la disponibilidad del tag de Ollama correspondiente.
- Idioma declarado únicamente inglés; el soporte multilingüe del modelo base no está verificado en esta configuración.
- Riesgo de alucinación inherente al modelo base, no mitigado por entrenamiento específico; el pack de conocimiento es muy reducido (8 entradas).
- Licencia Apache-2.0: permite uso comercial, pero exige conservar el aviso de Apache y los pesos siguen siendo de Qwen; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se rigen por la misma licencia según la model card.
- El estado de publicación en Ollama y la evaluación medida están pendientes según la propia model card (fecha de release declarada: 2026-10-31).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Thox-ai/ThoxMesh-30B-A3B
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-30B-A3B
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
