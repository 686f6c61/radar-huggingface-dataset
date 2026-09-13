# ukuwzi/qweble-9b

## Resumen

qweble-9b es un modelo de lenguaje compacto orientado al razonamiento practico, desarrollado por el usuario ukuwzi a partir del modelo base Qwen/Qwen3.5-9B. Se trata de un ajuste fino mediante LoRA con supervisión (SFT) sobre un conjunto filtrado de 1.000 trazas de razonamiento procedentes de "Fable 5.1", con el objetivo de que el modelo produzca respuestas mas deliberadas y paso a paso en tareas de programacion, depuracion, diseno de algoritmos y planificacion multi-paso. El resultado es un derivado de 8.953.803.264 parametros (unos 8,95 mil millones) distribuido en 4 bits y con un tamano de repositorio de 5,1 GB.

Su relevancia actual radica en su enfoque "local-first": esta pensado para ejecutarse en hardware de Apple Silicon mediante MLX, ademas de ser compatible con runtimes de tipo GGUF como Ollama o llama.cpp. El autor lo posiciona explicitamente como una herramienta de experimentacion y desarrollo cotidiano, no como sustituto de modelos frontera de mayor tamano. La ventana de contexto del modelo base no se documenta en la informacion proporcionada; si se conoce que el entrenamiento uso secuencias de 1.024 tokens, aunque las trazas de origen promediaban unos 30.000 tokens antes del filtrado.

El modelo se publica bajo licencia Apache 2.0, esta etiquetado como apto para generacion de texto y conversacion, y solo declara soporte para ingles. No se han publicado resultados de benchmarks ni detalles completos de la arquitectura interna mas alla de su dependencia del modelo Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5 (etiqueta `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95 mil millones) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (MLX 4-bit para entrenamiento e inferencia; se menciona GGUF 4-bit) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria MLX) y GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que qweble-9b es un ajuste fino del modelo base Qwen/Qwen3.5-9B, concretamente sobre el checkpoint cuantizado `mlx-community/Qwen3.5-9B-MLX-4bit`. El metodo empleado es LoRA con ajuste supervisado (SFT): rango de LoRA 8, aplicado en 2 capas (atencion y MLP), 3.000 pasos de entrenamiento, tasa de aprendizaje `1e-4`, batch size de 1 con acumulacion de gradiente de 8 y precision de entrenamiento en 4 bits. El entrenamiento se realizo en un Apple M4 Pro con 24 GB de memoria unificada, lo que confirma la orientacion del proyecto hacia hardware de consumo de Apple.

El conjunto de datos de destilacion es `MoreThought/Fable-5.1-Max-Reasoning-Filtered-1000x`, compuesto por 1.000 trazas de razonamiento filtradas que suman aproximadamente 30 millones de tokens. Durante el entrenamiento la longitud de secuencia se limito a 1.024 tokens, muy por debajo de la longitud media de las trazas originales (~30.000 tokens), lo que constituye un caveat importante sobre la cobertura real del formato de razonamiento largo. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ni innovaciones arquitectonicas propias mas alla de la destilacion supervisada.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento paso a paso orientado a explicar decisiones intermedias.
- Explicacion e implementacion de algoritmos.
- Diagnostico de errores (debugging) y propuesta de correcciones.
- Descomposicion de tareas complejas en pasos manejables.
- Analisis de compromisos (trade-offs) en decisiones de implementacion.
- Redaccion de planes tecnicos.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso explicito: solo parcialmente, mediante trazas de razonamiento destiladas; no se confirma soporte formal de agentes.
- Capacidades multilingues: limitadas al ingles segun las etiquetas del repositorio.
- Modo "thinking" formal, vision o audio: no documentado.

## Casos de uso

- Asistente de programacion local: el modelo puede generar y explicar funciones en Python y otros lenguajes, mostrando el razonamiento intermedio, lo que resulta util para desarrolladores que quieren entender la solucion y no solo el resultado.
- Depuracion asistida: dado un fragmento de codigo con errores, el modelo puede diagnosticar causas probables y proponer correcciones justificadas paso a paso, gracias a su ajuste sobre trazas de razonamiento.
- Diseno de algoritmos y analisis de complejidad: adecuado para discutir enfoques alternativos, estimar coste computacional y comparar implementaciones, tal como se ejemplifica en su propia guia de inicio con el problema del subpalindromo mas largo.
- Planificacion tecnica de proyectos: util para descomponer tareas de ingenieria en subtareas y borradores de planes, ya que el ajuste refuerza la generacion de pasos ordenados.
- Prototipado en Apple Silicon: al estar empaquetado para MLX, permite experimentar con un modelo de ~9B en 4 bits directamente en un Mac, sin depender de GPU dedicada ni de servicios en la nube.
- Educacion y autoaprendizaje: puede usarse como tutor de conceptos de programacion, explicando el "por que" de cada decision, siempre que el usuario verifique las respuestas.
- Integracion en flujos de desarrollo offline o con requisitos de privacidad: al ejecutarse localmente mediante MLX u Ollama, permite trabajar con codigo sensible sin enviarlo a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,1 GB en 4 bits, por lo que la inferencia requiere aproximadamente 5-6 GB de memoria dedicada o unificada, mas el overhead del runtime y del contexto.
- GPU recomendadas: no se especifican oficialmente; por tamano, una GPU con 8 GB o mas de VRAM deberia ser suficiente en 4 bits.
- Compatibilidad con GPU de consumo: si, cabe en tarjetas de consumo con 8-12 GB (por ejemplo, serie RTX 3060/4060 en adelante) y en equipos Apple Silicon con memoria unificada suficiente, como el M4 Pro de 24 GB usado para el entrenamiento.
- Opciones de despliegue: MLX y `mlx-lm` como ruta nativa en Apple Silicon; Ollama mediante un paquete del modelo; llama.cpp/GGUF dado que se menciona formato GGUF 4-bit; la ruta de Transformers solo es valida con un checkpoint compatible, ya que los ficheros GGUF no se cargan con `AutoModelForCausalLM`.
- Latencia y throughput estimados: no disponible.
- Hardware de entrenamiento documentado: Apple M4 Pro, 24 GB de memoria unificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| qweble-9b | ~8,95 mil millones | No disponible | Safetensors (MLX 4-bit) y GGUF | Apache 2.0 | Destilado de razonamiento sobre Qwen3.5-9B; solo ingles; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | No disponible en la informacion | No disponible | No disponible | No disponible | Modelo base del que deriva qweble-9b; no se aportan especificaciones en la informacion recibida |
| mlx-community/Qwen3.5-9B-MLX-4bit | ~9B (por nombre) | No disponible | MLX 4-bit | No disponible | Checkpoint cuantizado usado como punto de partida del ajuste LoRA |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables dentro de la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El propio autor advierte que el razonamiento debe tratarse como un borrador de trabajo y no como garantia de correccion: hay que verificar codigo, calculos, citas y recomendaciones sensibles para la seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- Sesgos conocidos: no documentados; al derivar de un modelo base y de un dataset de trazas concretos, puede heredar sesgos de ambas fuentes.
- Limitacion idiomatica: soporte declarado unicamente en ingles, lo que limita su uso en castellano u otros idiomas.
- Limitacion de contexto: la longitud de secuencia de entrenamiento fue de 1.024 tokens frente a trazas originales de ~30.000 tokens, lo que puede reducir el rendimiento en cadenas de razonamiento muy largas respecto a lo que el modelo base permitiria.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del dataset de destilacion, no detalladas aqui.
- Volumen de adopcion muy bajo: 0 descargas y 1 "like" en el momento de la consulta, lo que implica escasa validacion por parte de la comunidad.
- Para produccion: la ausencia de benchmarks, de pruebas de robustez y de soporte de tool calling documentado hace recomendable evaluar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ukuwzi/qweble-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint base cuantizado: https://huggingface.co/mlx-community/Qwen3.5-9B-MLX-4bit
- Dataset de destilacion: https://huggingface.co/datasets/MoreThought/Fable-5.1-Max-Reasoning-Filtered-1000x
- Logo del modelo: https://cdn-uploads.huggingface.co/production/uploads/6a403bd87128770517ab7180/JYclQ4kuoE5kWYe9fJpo3.png
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
