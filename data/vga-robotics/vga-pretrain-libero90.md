# vga-robotics/vga-pretrain-libero90

## Resumen

VGA Pretrain LIBERO90 es un checkpoint de preentrenamiento para robótica de manipulación desarrollado por vga-robotics. Se trata de la columna vertebral (backbone) de un modelo Vision-Geometry-Action (VGA) entrenado desde cero sobre las 90 tareas del conjunto LIBERO-90, con 10 demostraciones por tarea (900 trayectorias en total). El modelo combina un tronco Transformer compacto con un experto de acciones basado en flow-matching, e incorpora sesgos inductivos geométricos tridimensionales como rayos de cámara de Plücker de 6 dimensiones y supervisión de profundidad cuantizada.

La relevancia de este checkpoint radica en su función como inicialización para ajuste fino posterior, tanto con pocos ejemplos (few-shot) como con el conjunto completo de datos, en tareas de manipulación robótica. Su diseño prioriza la eficiencia: el checkpoint ocupa aproximadamente 32,3 MB y contiene unos 14,5 millones de parámetros entrenables, lo que lo hace adecuado para entornos con recursos limitados.

No se dispone de información sobre la licencia, los idiomas soportados ni resultados de benchmarks en la documentación proporcionada. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y su tamaño declarado es de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compacto (tronco de 4 capas, 6 cabezas, dimensión 384) + experto de acciones con flow-matching de 4 capas |
| Parametros totales | Aproximadamente 14,5 M entrenables (según model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (condicionamiento lingüístico mediante embeddings de texto SigLIP a nivel de palabra, 32 tokens) |
| Licencia | No disponible |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo se compone de un tronco Transformer compacto con dimensión de 384, 4 capas y 6 cabezas de atención, acoplado a un experto de acciones de 4 capas que genera trayectorias mediante flow-matching. Incorpora tres sesgos inductivos geométricos: rayos de cámara de Plücker de 6 dimensiones, supervisión de profundidad cuantizada en la parte media del tronco (con gradientes desconectados) y suavidad de prefijo en 4 pasos decrecientes. El condicionamiento lingüístico se realiza mediante embeddings de texto SigLIP a nivel de palabra, limitados a 32 tokens.

El preentrenamiento se llevó a cabo durante 30.000 pasos con un tamaño de lote de 64, lo que equivale a 1.920.000 muestras, empleando un muestreo jerárquico equilibrado por episodios. El entrenamiento se realizó desde cero sobre las 90 tareas de LIBERO-90, con 10 demostraciones por tarea (900 trayectorias). No se dispone de información sobre el uso de RLHF, DPO ni sobre la composición detallada del dataset más allá de lo indicado.

## Capacidades

- Generación de acciones de manipulación robótica condicionadas por lenguaje e imágenes, mediante flow-matching.
- Percepción visual con sesgos geométricos tridimensionales (rayos de Plücker y profundidad cuantizada).
- Condicionamiento lingüístico a nivel de palabra mediante embeddings SigLIP (hasta 32 tokens).
- Preentrenamiento multi-tarea sobre 90 tareas de manipulación, lo que permite inicializar ajustes finos posteriores.
- Soporte para ajuste fino con pocos ejemplos (few-shot) o con el conjunto completo de datos.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales adicionales (audio, vídeo).

## Casos de uso

- Inicialización para ajuste fino en tareas de manipulación LIBERO: el checkpoint sirve como punto de partida para entrenar políticas específicas con pocas demostraciones (por ejemplo, 5 shots y 6.000 pasos), reduciendo el coste de entrenamiento desde cero.
- Investigación en aprendizaje por imitación: permite estudiar cómo los sesgos geométricos (rayos de Plücker, profundidad) afectan a la generalización en tareas de manipulación con un modelo de apenas 14,5 M de parámetros.
- Prototipado en robótica de bajo coste: al ocupar unos 32,3 MB, puede desplegarse en hardware con recursos limitados para experimentos de laboratorio.
- Evaluación comparativa de arquitecturas VLA: sirve como línea base compacta frente a modelos de mayor tamaño en experimentos controlados sobre LIBERO-90.
- Ajuste fino multi-tarea con equilibrio de episodios: el muestreo jerárquico empleado en el preentrenamiento facilita experimentos de transferencia entre las 90 tareas.
- Docencia y formación: su tamaño reducido y su definición autocontenida (`vga.py` y utilidades incluidas) lo hacen adecuado para cursos prácticos sobre vision-language-action y flow-matching.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con aproximadamente 14,5 M de parámetros y un checkpoint de 32,3 MB, la huella de memoria es muy reducida (del orden de decenas o pocos cientos de MB según el lote y las entradas visuales).
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no se confirma en la documentación.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se especifica.
- Opciones de despliegue: el autor proporciona un script `vga.py` para entrenamiento y ajuste fino; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial; es necesario contactar con el autor antes de emplearlo en producción.
- El modelo está preentrenado exclusivamente sobre LIBERO-90 (90 tareas, 900 trayectorias), lo que limita su generalización a dominios de manipulación distintos.
- El condicionamiento lingüístico se restringe a 32 tokens a nivel de palabra mediante SigLIP, lo que puede limitar instrucciones largas o complejas.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real no está validado de forma independiente.
- El repositorio presenta 0 descargas y 0 likes, y su tamaño declarado es de 0.0 GB, lo que sugiere que los pesos podrían no estar disponibles o que el repositorio está incompleto.
- No se dispone de información sobre sesgos, riesgo de alucinación en el contexto robótico ni limitaciones idiomáticas.
- Al ser un checkpoint de preentrenamiento, no es un modelo listo para producción sin un ajuste fino previo.

## Enlaces

- Hugging Face: https://huggingface.co/vga-robotics/vga-pretrain-libero90
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
