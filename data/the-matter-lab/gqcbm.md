# the-matter-lab/GQCBM

## Resumen

G-QCBM (Generative Quantum Circuit Born Machine) es un conjunto de checkpoints entrenados que acompañan el artículo *Learning Quantum Circuit Structure for Born Machines with a Generative Transformer*, obra de Nakamura, Chang y colaboradores del grupo the-matter-lab. No se trata de un modelo de lenguaje al uso, sino de un modelo generativo de tipo transformer entrenado para proponer la estructura de circuitos cuánticos que representan distribuciones de probabilidad mediante máquinas de Born (Born machines). El repositorio publicado en Hugging Face contiene exclusivamente los pesos del transformer político y los mejores circuitos encontrados (`best_ops`, `best_theta`) junto con sus valores de divergencia KL.

El problema que resuelve es el del diseño automático de circuitos cuánticos paramétricos: en lugar de que un humano especifique a mano la topología de puertas, un transformer aprende a generar secuencias de operaciones cuánticas cuya distribución de salida se aproxima a una distribución objetivo. Esto es relevante porque el espacio de circuitos crece de forma combinatoria con el número de qubits y profundidad, y los métodos de búsqueda exhaustiva o heurísticas clásicas escalan mal.

El repositorio ocupa aproximadamente 0,5 GB y está bajo licencia MIT. No se especifican arquitectura concreta del transformer, número de parámetros ni longitud de contexto en la información disponible; los checkpoints se distribuyen como ficheros `.pt` de PyTorch, no como safetensors ni GGUF, lo que refleja su naturaleza de artefacto de investigación más que de modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer generativo (política) para generación de circuitos cuánticos; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (diccionario con política, `config`, `best_ops`, `best_theta`, `best_kl`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer generativo que actúa como política: genera secuencias de operaciones de puerta cuántica (`best_ops`) y ángulos de rotación (`best_theta`) que definen un circuito. El circuito resultante se evalúa como máquina de Born, es decir, la distribución de probabilidad de sus salidas cuánticas se compara con una distribución objetivo mediante divergencia KL (`best_kl`). El entrenamiento se realizó sobre configuraciones de circuitos de pocos qubits; los logs publicados hacen referencia explícita a un valor de referencia para una Gaussiana con n=5 qubits (job 39630 con cinco semillas y una repetición posterior, job 796452, que produjo `seed_5q_{42,123}_rerun.pt`).

No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; al tratarse de un modelo generativo de estructuras discretas, es probable que el entrenamiento sea de tipo supervisado o por refuerzo sobre recompensas de fidelidad, pero esto no se confirma en la model card. La innovación principal es el uso de un transformer para aprender la estructura del circuito en lugar de optimizar solo los parámetros de un ansatz fijo.

## Capacidades

- Generación de estructuras de circuitos cuánticos: produce secuencias de puertas y ángulos a partir de una distribución objetivo.
- Evaluación de la calidad del circuito generado mediante divergencia KL frente a la distribución de referencia.
- Aprendizado de representaciones de máquinas de Born: modela distribuciones de probabilidad sobre estados cuánticos.
- Reproducibilidad: cada checkpoint está mapeado en `REPRODUCE.md` a la figura o tabla correspondiente y al script de trabajo que lo entrenó.
- Verificación de integridad: `MANIFEST.sha256` permite comprobar la integridad de todos los ficheros descargados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en aprendizaje automático para computación cuántica: usar los checkpoints como punto de partida para reproducir los resultados del artículo y comparar con nuevos métodos de generación de circuitos.
- Diseño automático de ansatz para algoritmos variacionales: el transformer propone topologías de circuito que luego pueden refinarse con optimizadores clásicos (por ejemplo, COBYLA o SPSA) en lugar de partir de un ansatz hardware-efficient fijo.
- Aproximación de distribuciones objetivo con máquinas de Born: generar circuitos cuya distribución de salida se ajuste a una distribución conocida, útil en estudios de sampling cuántico y modelado generativo cuántico.
- Benchmarking de generadores de circuitos: comparar el KL alcanzado por G-QCBM con el de métodos de búsqueda evolutiva o de optimización directa de parámetros en problemas de n=5 qubits y similares.
- Docencia y divulgación: los checkpoints y logs permiten ilustrar cómo un modelo generativo clásico aprende estructura cuántica, con un caso de referencia concreto (Gaussiana de 5 qubits) reproducible paso a paso.
- Extensión a nuevos objetivos: reentrenar o afinar la política sobre distribuciones distintas a la Gaussiana de referencia para estudiar la generalización del enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona un valor de referencia de KL para una Gaussiana con n=5 qubits, sin cifras numéricas explícitas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (0,5 GB) sugiere que los checkpoints caben holgadamente en GPUs de consumo, pero no se especifica el tamaño del transformer ni su precisión.
- GPU recomendadas: no disponible; al tratarse de un transformer de investigación de pequeño tamaño, es probable que una GPU consumer (RTX 3060 o superior) sea suficiente, pero esto no se confirma.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repo, pero no confirmado.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt`); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G-QCBM | Transformer generador de circuitos cuánticos | no disponible | no disponible | MIT | Hugging Face + GitHub |
| Modelos de lenguaje comparables | no aplica | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generadores de circuitos cuánticos basados en transformers) en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts en lenguaje natural ni soporta conversación.
- Los checkpoints están ligados a las configuraciones experimentales del artículo; generalizar a otras distribuciones objetivo o a números de qubits distintos puede requerir reentrenamiento.
- El valor de referencia documentado se limita a n=5 qubits con una Gaussiana; no hay evidencia publicada de escalado a sistemas mayores.
- Riesgo de sobreajuste a la distribución de entrenamiento: la divergencia KL reportada (`best_kl`) es específica del objetivo usado en cada checkpoint.
- Los logs publicados tienen rutas de clúster, cuentas y particiones reemplazadas por marcadores de posición, lo que puede dificultar la reproducción exacta del entorno de ejecución.
- Licencia MIT permite uso comercial, pero al ser un artefacto de investigación no hay garantías de idoneidad para producción.
- No hay información sobre sesgos (no aplica en el sentido lingüístico), pero sí sobre limitaciones de validez científica fuera del régimen estudiado.

## Enlaces

- Hugging Face: https://huggingface.co/the-matter-lab/GQCBM
- Repositorio de código: https://github.com/the-matter-lab/GQCBM
- Artículo de referencia: *Learning Quantum Circuit Structure for Born Machines with a Generative Transformer* (Nakamura, Chang, et al.); enlace directo no disponible en la información proporcionada.
