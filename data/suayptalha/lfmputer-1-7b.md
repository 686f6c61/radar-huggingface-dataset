# suayptalha/LFMputer-1.7B

## Resumen

LFMputer-1.7B es un modelo experimental de generación de texto creado por el desarrollador suayptalha a partir de un fine-tuning de LiquidAI/LFM3-1.7B. Su rasgo distintivo es que integra, dentro de la propia pila de capas del decodificador, un "ordenador compilado": un circuito RV32 de pesos fijos, RAM tensorial direccionable de 8 MiB, un puente de memoria y diez instalaciones de cómputo analítico. El objetivo es dotar al modelo de memoria explícita y capacidad de cálculo determinista, en lugar de depender únicamente de los pesos neuronales para razonar y aritmética.

La arquitectura completa consta de 39 capas: 15 capas de máquina (control del ordenador, 11 bloques de cómputo, RAM y ficheros, puente de memoria y analítica) preceden a las 24 capas de lenguaje preentrenadas de LFM3. Durante la generación de texto las capas de máquina son transparentes; durante la ejecución del "ordenador", el estado computacional avanza sin pasar por el backbone de lenguaje. Es un proyecto de carácter investigador, con pocas descargas (445) y muy reciente, relevante como exploración de la línea "model-as-computer" iniciada por proyectos como Qwenputer.

Requiere código personalizado (`custom_code`) y un runtime propio incluido en el repositorio, por lo que no funciona con los pipelines estándar de HuggingFace. El modelo base LFM3 de LiquidAI emplea arquitecturas híbridas con capas de atención y convolución corta, y este fine-tune conserva esa organización en las capas de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador híbrido: 15 capas de máquina (CPU RV32 de pesos fijos + RAM + analítica) + 24 capas de lenguaje LFM3 (atención/convolución corta) |
| Parametros totales | 1.749.392.808 (≈1,75 B, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión mixta, sin cuantización publicada) |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (other, consulta el enlace LICENSE para términos exactos) |
| Formato de pesos | safetensors (un único fichero de ~3,54 GB, repo de 3,6 GB) |

## Arquitectura y entrenamiento

El decodificador completo se organiza en 39 posiciones: la capa 0 actúa como control del ordenador (embedding de entrada, imágenes de programa y boot); las capas 1–11 ejecutan el cómputo mediante 11 bloques que implementan 18 etapas de circuito ordenadas (siete combinan ramas de memoria y feed-forward, una solo memoria y tres solo feed-forward); la capa 12 gestiona RAM y ficheros (descodificación de direcciones, caché de 256 palabras, MMIO de 256 bytes, ficheros versionados); la capa 13 es el puente de memoria que transfiere 32 KiB entre bancos de trabajo de la CPU y la RAM direccionable; la capa 14 aloja diez instalaciones de cómputo analítico acotado; y las capas 15–38 son los bloques preentrenados de LFM3.

Los bloques de máquina replican la organización "operador → residual" y "FFN con puerta → residual" de LFM3, pero con operadores especializados: normalización identidad en lugar de RMSNorm, activación ReLU en lugar de SiLU, proyecciones dispersas ordenadas en lugar de mapas densos, y memoria recurrente de direccionamiento duro en lugar de atención softmax o convolución corta. La RAM se direcciona mediante atención dura de dos niveles sobre claves binarias, con celdas mutables que soportan lectura, escritura y compare-and-swap, además de una línea de retardo convolucional (anchura 7, latencia de seis ciclos) para temporización de peticiones. No se ha publicado información sobre el proceso de entrenamiento del fine-tuning (tokens, dataset, RLHF/DPO); el backbone LFM3-1.7B es obra de LiquidAI.

## Capacidades

- Generación de texto conversacional en inglés mediante las 24 capas de lenguaje LFM3.
- Ejecución de programas compilados sobre un circuito RV32 de pesos fijos, con imágenes de programa incluidas en el fichero de pesos.
- Cálculo aritmético determinista mediante instalaciones analíticas (por ejemplo, la herramienta "calc" para multiplicaciones grandes, como se muestra en el ejemplo del README).
- Memoria explícita y persistente: 8 MiB de espacio de direcciones lógico, con lectura, escritura, compare-and-swap, caché de 256 palabras con contabilidad de aciertos/fallos y MMIO.
- Ficheros versionados mapeados en vistas de RAM y estado de sesión mutable separable de los pesos fijos del modelo.
- Ejecución por fases (chat vs. máquina) gestionada por un runtime propio con llamadas tipadas y formateo de resultados.
- No hay evidencia de soporte de vision, audio, tool calling estándar ni agentes multi-step más allá del mecanismo propio de programas del modelo.

## Casos de uso

- Cálculo aritmético exacto: el modelo puede delegar multiplicaciones y operaciones numéricas en las instalaciones analíticas (p. ej. "calc"), evitando los errores típicos de la aritmética neuronal en LLMs pequeños.
- Investigación en arquitecturas "modelo-como-ordenador": sirve como banco de pruebas para estudiar cómo integrar cómputo simbólico y memoria direccionable dentro de un transformer.
- Experimentación con memoria explícita persistente: el estado de sesión mutable permite probar flujos donde el modelo escribe y lee datos estructurados en RAM tensorial entre turnos.
- Prototipado de agentes con estado: la combinación de ficheros versionados y puente de memoria permite simular programas con estado persistente a lo largo de una conversación.
- Estudio de ejecución de instrucciones mediante operaciones tensoriales: útil para investigadores interesados en emular CPUs con pesos de red fijos sin ejecución simbólica externa.
- Chatbot conversacional en inglés: como fine-tune de LFM3-1.7B, mantiene la capacidad de diálogo del modelo base para uso general, aunque sin garantías de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación ("Evaluation") y una comparación con Qwenputer, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otras métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa ~3,54 GB en precisión mixta; con estado de runtime, cachés y activaciones, una GPU con 8 GB de VRAM debería ser suficiente en principio (estimación, dato oficial no disponible).
- GPU recomendadas: cualquier GPU moderna de consumo con soporte CUDA (RTX 3060, RTX 4060 o superiores); no se requieren aceleradores de centro de datos dado el tamaño (~1,75 B de parámetros).
- Cabe en GPUs de consumo: sí, al ser un modelo de 1,7 B con pesos de ~3,5 GB; también debería ejecutarse en CPU con tiempo de respuesta mayor (no hay datos de rendimiento en CPU).
- Opciones de despliegue: únicamente mediante el runtime propio incluido en el repositorio (`modeling_lfmputer.py`, `chat.py` con PyTorch y `requirements.txt`). No es compatible con vLLM, llama.cpp, Ollama ni TGI al requerir `custom_code` y una arquitectura no estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFMputer-1.7B | 1,75 B | Híbrido máquina+LFM3 (39 capas) | no disponible | lfm1.0 (other) | HuggingFace, runtime propio |
| LiquidAI/LFM3-1.7B (modelo base) | ~1,7 B | Híbrido atención/convolución (LFM3) | no disponible | Licencia LiquidAI (lfm) | HuggingFace |
| Qwenputer (inspiración, base Qwen3.5-4B) | ~4 B | Decodificador con ordenador integrado | no disponible | no disponible | HuggingFace (divagr1925) |

Comparado con su modelo base, LFMputer añade las 15 capas de máquina y memoria explícita a cambio de un mayor consumo de memoria y la dependencia de un runtime no estándar. Frente a Qwen3.5-4B-Qwenputer, LFMputer es más pequeño y usa un backbone LFM3 híbrido en lugar de un transformer denso convencional.

## Limitaciones y advertencias

- Proyecto experimental con tracción mínima (445 descargas, 2 likes): no hay comunidad ni validación amplia de su calidad.
- Requiere `trust_remote_code` / código personalizado: ejecutar código de terceros implica riesgos de seguridad; revisa `modeling_lfmputer.py` antes de usarlo en producción.
- Sin benchmarks publicados: no hay forma objetiva de evaluar su calidad en lenguaje frente al modelo base.
- Idioma limitado al inglés; no hay soporte declarado para castellano ni otros idiomas.
- Longitud de contexto no documentada.
- Sin cuantizaciones publicadas (no hay GGUF ni versiones INT4/INT8), lo que limita el despliegue en hardware modesto.
- Licencia "other" (lfm1.0): revisa el fichero LICENSE antes de cualquier uso comercial, ya que hereda las restricciones de la licencia de LiquidAI.
- Los 8 MiB de RAM son capacidad lógica del espacio de direcciones; el uso real de memoria incluye pesos, cachés y estado del runtime.
- Riesgo de alucinación típico de un modelo de 1,7 B en tareas de lenguaje; el cómputo analítico solo cubre las operaciones implementadas en sus instalaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suayptalha/LFMputer-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Inspiración del proyecto (Qwenputer): https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Configuración del decodificador: https://huggingface.co/suayptalha/LFMputer-1.7B/blob/main/decoder_config.json
- Licencia: https://huggingface.co/suayptalha/LFMputer-1.7B/blob/main/LICENSE
- Autor: https://huggingface.co/suayptalha
- Paper, blog o demo: no disponible
