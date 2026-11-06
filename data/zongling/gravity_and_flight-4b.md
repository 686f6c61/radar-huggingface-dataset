# zongling/Gravity_and_Flight-4B

## Resumen

Gravity & Flight 4B es un modelo vision-language especializado en teledeteccion (remote sensing) desarrollado por el usuario zongling, construido mediante ajuste fino supervisado sobre Qwen/Qwen3.5-4B. El modelo se presenta como un sistema de razonamiento fundamentado en evidencia ("evidence-grounded reasoning") para el analisis de imagenes de satelite y aeronaves, combinando un enfoque de Evidence-of-Thought en el ajuste fino con un metodo de optimizacion por refuerzo denominado Relational Transfer Policy Optimization.

La propuesta tecnica del modelo se articula en torno a dos conceptos: "Gravity", que ancla las afirmaciones visuales a la imagen concreta, y "Flight", que verifica como el razonamiento utiliza esas observaciones y se adapta a contextos relacionados. El pipeline declarado es image-text-to-text, con entrada de una imagen y una pregunta en inferencia.

Es relevante senalar que, en el momento de redactar esta ficha, el repositorio oficial no contiene los pesos del modelo. Segun la model card, se trata de un repositorio reservado para una publicacion futura, y tanto los pesos como el dataset completo se liberaran por etapas tras la aceptacion del paper asociado. La unica informacion practica disponible son tres demostraciones de Stage 1 y tres ejemplos de pares de imagenes de Stage 2 en el dataset preview.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4B (heredados del modelo base Qwen/Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no se han publicado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un modelo base de 4.000 millones de parametros, y se especializa mediante un proceso de post-entrenamiento en dos fases descritas en la model card: un ajuste fino supervisado denominado Evidence-of-Thought (EoT) y una optimizacion por refuerzo llamada Relational Transfer Policy Optimization (RTPO). La arquitectura concreta del componente visual, la longitud de contexto efectiva y la composicion exacta del dataset de entrenamiento no se detallan en la informacion disponible.

El enfoque "Gravity and Flight" separa dos habilidades: el anclaje de las afirmaciones visuales a la evidencia presente en la imagen (Gravity) y la verificacion de como el razonamiento utiliza esas observaciones, incluyendo la transferencia a contextos visuales relacionados (Flight). El entrenamiento se orienta a tareas de teledeteccion de grano fino, donde la precision en la localizacion y descripcion de objetos es critica. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como DPO o decodificacion especulativa.

## Capacidades

- Razonamiento visual fundamentado en evidencia para imagenes de teledeteccion.
- Descripcion y analisis de imagenes de satelite y aeronaves de grano fino.
- Generacion de texto a partir de imagen y pregunta (image-text-to-text).
- Razonamiento multi-paso orientado a verificar el uso de observaciones visuales.
- Capacidad de transferencia relacional entre contextos visuales relacionados (Stage 2, pares de imagenes).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Analisis de imagenes de satelite para identificacion de infraestructuras: el modelo puede recibir una imagen y una pregunta concreta y generar una respuesta fundamentada en la evidencia visual, aprovechando su entrenamiento especifico en teledeteccion.
- Monitorizacion de cambios en pares de imagenes: los ejemplos de Stage 2 sugieren capacidad para comparar contextos visuales relacionados, util en deteccion de cambios urbanos o agricolas.
- Anotacion asistida de datasets geoespaciales: el modelo puede generar descripciones y razonamientos que sirvan como borrador para etiquetado humano en proyectos de cartografia.
- Verificacion de afirmaciones visuales: el componente "Gravity" permite comprobar si una conclusion esta respaldada por la imagen, util en auditoria de informes geoespaciales.
- Investigacion academica en vision-language para teledeteccion: sirve como punto de partida para experimentos de post-entrenamiento con RL en dominios especializados.
- Educacion y formacion en analisis de imagenes: el modelo puede explicar su razonamiento paso a paso sobre una imagen, util en entornos docentes.
- Evaluacion de tecnicas de razonamiento fundamentado: el enfoque EoT + RTPO es replicable como referencia metodologica en otros dominios visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 4B en precision completa se requieren aproximadamente 8-10 GB, y en cuantizacion de 4 bits podria situarse en torno a 3-4 GB, aunque estos valores son estimaciones genericas no confirmadas por el autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamano, un modelo de 4B podria caber en GPUs consumer con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; los pesos no se han publicado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gravity & Flight 4B | 4B | no disponible | no disponible | Pesos no publicados |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible | no disponible | Disponible en Hugging Face |
| Otros modelos vision-language para teledeteccion | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria. El modelo base Qwen/Qwen3.5-4B es la referencia directa mas proxima, pero no se han publicado comparaciones de rendimiento entre ambos en la informacion disponible.

## Limitaciones y advertencias

- Los pesos del modelo no estan publicados; el repositorio es solo una reserva para una release futura.
- No hay paquete de inferencia ni instrucciones de uso disponibles.
- La licencia no esta especificada, lo que impide evaluar el uso comercial.
- El modelo solo declara soporte para ingles.
- El dominio esta restringido a teledeteccion; su rendimiento fuera de ese ambito es desconocido.
- No se han publicado benchmarks, por lo que no es posible verificar las capacidades declaradas.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto: no disponible.
- Para produccion, no se recomienda su uso hasta que se publiquen pesos, licencia y evaluaciones.

## Enlaces

- Hugging Face: https://huggingface.co/zongling/Gravity_and_Flight-4B
- Web del proyecto: https://z0ngl1ng.github.io/Gravity-and-Flight/
- GitHub: https://github.com/Z0ngL1ng/Gravity-and-Flight
- Notas de investigacion: https://github.com/Z0ngL1ng/Gravity-and-Flight/blob/main/docs/RESEARCH.md
- Dataset preview: https://huggingface.co/datasets/zongling/Gravity_and_Flight-2K
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
