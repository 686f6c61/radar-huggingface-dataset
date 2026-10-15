# zhw1111/skillhelix-qwen3-v5cards-sft

## Resumen

SkillHelix Qwen3-14B v5cards-sft es un ajuste fino supervisado (SFT) de Qwen3-14B realizado por el usuario zhw1111 sobre un corpus de 577 filas de demostraciones generadas por un modelo profesor que utiliza una biblioteca de funciones denominada «v5 App library». El objetivo del proyecto es especializar un modelo de 14 800 millones de parámetros en la resolución de tareas mediante llamadas a una API de funciones concreta, con una ventana de entrenamiento de 32 768 tokens y una plantilla de chat ChatML sin etiquetas de razonamiento.

El repositorio publicado no contiene los pesos del modelo. Según la model card, el checkpoint campeón (checkpoint-225, época 9 de un plan de 10) no se ha subido, y lo que se distribuye son los ficheros de entrenamiento, los datos, las bibliotecas de funciones (v5 con 74 funciones y v6 con 68) y los scripts. Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para inferencia.

Su relevancia es acotada: no hay resultados en benchmarks estándar ni pesos descargables, pero documenta un experimento completo de SFT de parámetros completos sobre Qwen3-14B con evaluación interna (dev y test_normal) y una configuración de entrenamiento detallada, lo que resulta útil para quien quiera reproducir o auditar la receta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, heredada de Qwen/Qwen3-14B |
| Parámetros totales | Aproximadamente 14 800 millones (heredado del modelo base) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32 768 tokens (cutoff declarado en el entrenamiento) |
| Tipos de cuantización | No disponible: el repositorio no publica pesos ni versiones cuantizadas |
| Idiomas soportados | No disponible en el repositorio; el modelo base Qwen3-14B declara soporte multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible: los pesos del checkpoint campeón no se han publicado. El repositorio (0,1 GB) contiene datos, código, bibliotecas y archivos comprimidos |

## Arquitectura y entrenamiento

La base es Qwen3-14B, un transformer denso decoder-only de aproximadamente 14 800 millones de parámetros. El ajuste se realizó con LLaMA-Factory y parámetros completos (full-parameter SFT), con tasa de aprendizaje 1e-6 con decaimiento coseno, batch efectivo de 24, longitud de corte de 32 768 tokens y semilla 17. Se utilizó la plantilla `qwen3_nothink`, y la plantilla servida final es ChatML plano, sin etiquetas de pensamiento. El plan de entrenamiento fue de 10 épocas.

Los datos constan de 577 filas: 519 demostraciones de resolución generadas por un modelo profesor que operaba con la biblioteca v5, más 58 filas de revisión de primera tarea. Los datos están identificados en `data/teacher_demos_v5/sft_data_v3` con el prefijo de hash sha256 `ad4a0da2...`. Las filas de revisión se supervisan por completo mediante una modificación de una línea en el fichero `supervised.py` de LLaMA-Factory, incluida en `training/llamafactory_patch/`. Se seleccionaron tres candidatos por menor pérdida media de entrenamiento por época más el último: checkpoint-200, checkpoint-225 y checkpoint-240.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3-14B.
- Llamada a funciones (tool calling) sobre una biblioteca concreta: el entrenamiento se centró en 74 funciones de la biblioteca v5 y existe una v6 con 68 funciones.
- Ejecución de tareas multi-paso con revisión: 58 de las 577 filas de entrenamiento son de revisión de la primera tarea, lo que apunta a un flujo de trabajo con comprobación intermedia.
- Generación de código orientada a API: los scripts de resolución invocan funciones de la biblioteca en lugar de producir código libre.
- Modo de razonamiento explícito: no disponible. La plantilla servida es ChatML plano sin etiquetas `think`.
- Capacidades de visión o audio: no disponibles.
- Capacidades multilingües específicas de este ajuste: no disponibles; el corpus de entrenamiento es pequeño y está dominado por demostraciones en inglés y código.

## Casos de uso

- Automatización de agentes con API cerrada: un agente que debe resolver tareas invocando exclusivamente las 74 funciones de la biblioteca v5, donde el modelo ha sido entrenado para seleccionar la función correcta y construir sus argumentos.
- Investigación en destilación de demostraciones: reproducción del pipeline completo (profesor, datos, SFT, evaluación) para estudiar cuánto conocimiento de una API concreta se transfiere con 519 demostraciones.
- Evaluación de recetas de SFT de parámetros completos: el repositorio documenta hiperparámetros, parches y criterios de selección de checkpoint, útil como referencia metodológica.
- Generación de código contra una biblioteca interna: adaptación a entornos corporativos con SDK propietarios, donde el modelo aprende a llamar a funciones en lugar de improvisar código.
- Construcción de arneses de evaluación tipo examen: el proyecto incluye exámenes SAGE nativos con contexto de 32k, temperatura 0 y 40 pasos, replicables para medir agentes.
- Punto de partida para RL posterior: el repositorio incluye `archives/rl_sage_lora_b3` con código, activos de biblioteca y rollouts de prueba sobre tareas de entrenamiento.
- Auditoría de artefactos de entrenamiento: análisis de sesgos de dataset y de la supervisión de filas de revisión mediante el parche de LLaMA-Factory.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta evaluaciones internas del proyecto, con el examen SAGE nativo, contexto de 32 768 tokens, temperatura 0 y 40 pasos:

| Evaluación | Configuración | Resultado |
|---|---|---|
| Dev sobre biblioteca v5 | checkpoint-200 / 225 / 240 | 34 / 35 / 35 sobre 57 |
| Dev del campeón (checkpoint-225) | 3 ejecuciones | 35, 31, 38 |
| test_normal | ejecución 3 | 84, 81 sobre 168 |

El checkpoint campeón seleccionado fue el 225 (época 9), resolviéndose el empate a favor del más temprano. Estas cifras no son comparables con benchmarks públicos, ya que dependen de la biblioteca de funciones y del examen propietario del proyecto.

## Requisitos de hardware

Las siguientes cifras son estimaciones para un modelo denso de ~14,8B parámetros, condicionadas a que los pesos se publiquen finalmente (actualmente no están disponibles, por lo que no es posible desplegar el modelo):

- VRAM estimada en FP16/BF16: en torno a 28-32 GB.
- VRAM estimada en INT8: en torno a 15-17 GB.
- VRAM estimada en 4 bits (GPTQ, AWQ o GGUF Q4): en torno a 9-11 GB.
- GPU de centro de datos: A100 40 GB o 80 GB, H100 80 GB para FP16 con margen de contexto.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar FP16 con cuantización parcial o INT8; una RTX 4080 de 16 GB requiere 4 bits.
- Configuraciones multi-GPU: 2x RTX 4090 o 2x A6000 para FP16 con lotes grandes.
- Opciones de despliegue previstas: vLLM, TGI, SGLang, llama.cpp y Ollama, siempre que se liberen pesos en safetensors o GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones y no existen pesos con los que medirlas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad de pesos | Notas |
|---|---|---|---|---|---|
| SkillHelix Qwen3-14B v5cards-sft | ~14,8B (denso) | 32 768 tokens (entrenamiento) | Apache 2.0 | No: solo datos, código y bibliotecas | Especializado en la biblioteca v5 mediante SFT |
| Qwen/Qwen3-14B | ~14,8B (denso) | No detallado en la información disponible | Apache 2.0 | Sí, en HuggingFace | Modelo base de este ajuste |
| Qwen2.5-14B-Instruct | ~14,7B (denso) | No detallado en la información disponible | Apache 2.0 (según su propia ficha) | Sí, en HuggingFace | Alternativa de la misma escala, sin especialización en tool calling |
| Llama-3.1-8B-Instruct | ~8B (denso) | No detallado en la información disponible | Licencia comunitaria de Meta | Sí, en HuggingFace | Menor tamaño; comparación solo orientativa |

Los datos de contexto, parámetros y licencia de los modelos comparados deben verificarse en sus fichas oficiales; aquí se indican a título orientativo y se marcan como no disponibles cuando la información proporcionada no los detalla.

## Limitaciones y advertencias

- Los pesos no están publicados: el repositorio no permite ejecutar el modelo. Solo contiene ficheros de entrenamiento, datos y bibliotecas.
- El checkpoint campeón (checkpoint-225) no se ha subido, según declara la propia model card.
- Corpus de entrenamiento muy reducido (577 filas) para un modelo de 14,8B: riesgo elevado de sobreajuste a la biblioteca v5 y de olvido catastrófico de capacidades generales.
- Sin benchmarks públicos: las únicas métricas son internas (dev y test_normal) y no permiten comparación con alternativas.
- Sin evaluación de sesgos ni de seguridad publicada.
- Sin modo de razonamiento explícito: la plantilla servida es ChatML plano, sin etiquetas `think`, por lo que no se aprovecha el modo de pensamiento del modelo base.
- Riesgo de alucinación en la invocación de funciones: el modelo puede generar llamadas a funciones inexistentes o con argumentos mal formados, especialmente fuera de la distribución de la biblioteca v5.
- Idiomas soportados no documentados en el repositorio; la especialización parece limitada al inglés y a código.
- Idioma y registro del corpus no verificables: no se detalla la composición lingüística de las 577 filas.
- Los registros de examen no se incluyen en el repositorio público, lo que dificulta la auditoría independiente de las puntuaciones.
- La licencia del modelo profesor utilizado para generar las demostraciones no se especifica, lo que puede afectar a la redistribución de los datos derivados.
- La licencia Apache 2.0 se declara a nivel de repositorio; conviene verificar que se aplica también al modelo base Qwen3-14B y a los datos de destilación.
- Fecha declarada de creación y actualización: 2026-10-15, tal como figura en la ficha de HuggingFace.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/zhw1111/skillhelix-qwen3-v5cards-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- LLaMA-Factory (framework de entrenamiento citado en la model card): https://github.com/hiyouga/LLaMA-Factory
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos no guardan ninguna relación con él y se omiten. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al proyecto SkillHelix.
