# wy8edhuh/DeepSeek-R1-Distill-Qwen-7B-Abliterated-Q5_K_M-GGUF

## Resumen

Este modelo es una conversión a formato GGUF (cuantización Q5_K_M) del checkpoint `DuoNeural/DeepSeek-R1-Distill-Qwen-7B-Abliterated`, una variante del conocido `DeepSeek-R1-Distill-Qwen-7B` de DeepSeek a la que se le ha aplicado la técnica de *abliteration* (eliminación de la negativa a responder). El resultado es un modelo de razonamiento de 7.600 millones de parámetros que conserva las capacidades de cadena de pensamiento del original pero sin los filtros de seguridad que bloquean ciertos contenidos. Está pensado para desarrolladores que necesitan un modelo de razonamiento potente, ejecutable en hardware modesto y sin restricciones de contenido, con licencia MIT que permite uso comercial.

La relevancia actual radica en que combina dos tendencias: los modelos de razonamiento destilados (como la serie R1 de DeepSeek) y la personalización mediante *abliteration* para eliminar el rechazo. Al estar cuantizado en GGUF, puede ejecutarse con llama.cpp, Ollama o LM Studio en GPUs de consumo o incluso en CPU, lo que lo hace accesible para prototipado y despliegues ligeros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (según modelo base DeepSeek-R1-Distill-Qwen-7B) |
| Tipos de cuantizacion | Q5_K_M (GGUF) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `DeepSeek-R1-Distill-Qwen-7B` es un destilado de DeepSeek-R1, un modelo de razonamiento con cadena de pensamiento, entrenado sobre la arquitectura Qwen2.5-7B. DeepSeek utilizó destilación a partir de las salidas de R1 para transferir las capacidades de razonamiento a un modelo más pequeño y eficiente. La variante abliterada de DuoNeural aplica una técnica de *abliteration* que identifica y elimina las direcciones en el espacio de activaciones responsables de la negativa a responder, manteniendo el resto de capacidades intactas. Finalmente, este checkpoint se convirtió a GGUF con cuantización Q5_K_M mediante llama.cpp, lo que reduce el tamaño del archivo a 5,4 GB y permite su ejecución en entornos con recursos limitados.

No se dispone de información detallada sobre el dataset de entrenamiento de la abliteración ni sobre el proceso exacto de destilación, más allá de lo publicado por DeepSeek para la serie R1.

## Capacidades

- Razonamiento y cadena de pensamiento: hereda del modelo original la capacidad de generar pasos intermedios de razonamiento antes de dar una respuesta final, útil para problemas complejos de lógica, matemáticas y ciencia.
- Generación de texto: produce texto coherente y fluido en inglés, con buena comprensión de instrucciones.
- Generación de código: puede escribir y depurar código en varios lenguajes, aunque su rendimiento exacto no está documentado en esta versión.
- Matemáticas: resuelve problemas aritméticos y algebraicos con razonamiento paso a paso.
- Sin filtros de contenido: al estar abliterado, no rechaza peticiones sobre temas sensibles (violencia, sexualidad, etc.), lo que lo hace útil para investigación en seguridad o generación creativa sin restricciones.
- Multilingüe limitado: aunque la model card indica solo inglés, el modelo base Qwen2.5 soporta múltiples idiomas; no se garantiza su calidad en otros idiomas.

## Casos de uso

- Generación de código en entornos de desarrollo: el modelo puede integrarse en pipelines de CI/CD para autocompletar o revisar código, aprovechando su razonamiento para detectar errores lógicos. Su tamaño permite ejecutarlo en una GPU de gama media.
- Asistentes de razonamiento para investigación: útil para explorar problemas matemáticos o científicos donde se requiere una explicación paso a paso, sin las restricciones de seguridad que podrían limitar ciertas preguntas.
- Chatbots sin moderación: para prototipos de asistentes conversacionales donde se necesita libertad total de contenido, como en juegos de rol o simulaciones de personajes.
- Análisis de datos y extracción de información: puede procesar documentos largos (hasta 128k tokens) y extraer conclusiones razonadas, aunque su rendimiento en tareas de extracción no está benchmarkeado.
- Educación y tutoría: explicar conceptos complejos con razonamiento detallado, útil para plataformas de aprendizaje automático.
- Investigación en alineación y seguridad: al ser un modelo sin rechazo, sirve como banco de pruebas para estudiar comportamientos no deseados y desarrollar técnicas de mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta versión abliterada y cuantizada. El modelo original `DeepSeek-R1-Distill-Qwen-7B` tiene resultados conocidos (por ejemplo, en MMLU, HumanEval y GSM8K), pero no se han verificado para esta variante. Se recomienda consultar la ficha del modelo base para obtener referencias, aunque la abliteración y la cuantización pueden alterar ligeramente el rendimiento.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q5_K_M ocupa 5,4 GB. Con overhead de contexto (por ejemplo, 4k tokens) se necesitan aproximadamente 6-7 GB de VRAM para inferencia en GPU.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3070/4060, RTX 3060 12GB, o superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, LM Studio, o cualquier runtime compatible con GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no se dispone de mediciones específicas. En una RTX 4090 se espera una velocidad de generación de decenas de tokens por segundo, pero depende de la longitud de contexto y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Particularidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B (original) | 7,6 B | 128k | MIT | safetensors | Con filtros de seguridad, razonamiento |
| Este modelo (abliterado Q5_K_M) | 7,6 B | 128k | MIT | GGUF | Sin rechazo, cuantizado |
| Llama-3.1-8B-Instruct | 8 B | 128k | Llama 3.1 | safetensors/GGUF | Modelo generalista, con moderación |
| Qwen2.5-7B-Instruct | 7,6 B | 128k | Apache 2.0 | safetensors/GGUF | Base de este modelo, sin razonamiento especial |

La principal diferencia con el original es la eliminación del rechazo y la cuantización. Frente a Llama-3.1-8B, este modelo ofrece razonamiento explícito pero menos versatilidad en tareas generales. Qwen2.5-7B-Instruct es su base, pero sin el entrenamiento de razonamiento de DeepSeek.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de razonamiento, puede generar cadenas de pensamiento plausibles pero incorrectas. La abliteración no corrige sesgos subyacentes del modelo base.
- Riesgo de contenido inapropiado: al no tener filtros de seguridad, puede producir contenido ofensivo, violento o sexualmente explícito. No es adecuado para aplicaciones orientadas al público general sin moderación adicional.
- Idioma: la model card solo garantiza inglés; el rendimiento en otros idiomas puede ser deficiente.
- Cuantización: la cuantización Q5_K_M introduce una ligera pérdida de precisión respecto al modelo en FP16, aunque suele ser mínima.
- Licencia MIT: permite uso comercial y modificación, pero el usuario es responsable del contenido generado.
- Contexto largo: aunque el modelo base soporta 128k, la abliteración y la cuantización pueden afectar la estabilidad en ventanas muy largas; se recomienda probar.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/wy8edhuh/DeepSeek-R1-Distill-Qwen-7B-Abliterated-Q5_K_M-GGUF
- Modelo base abliterado (DuoNeural): https://huggingface.co/DuoNeural/DeepSeek-R1-Distill-Qwen-7B-Abliterated
- Modelo original DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Herramienta GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
