# tbhrc/qwen2_5_coder_7b_instruct_4bit

## Resumen

Este repositorio contiene una conversión del modelo Qwen2.5-Coder-7B-Instruct al formato MLX con cuantización de 4 bits, realizada por el usuario tbhrc a partir de la versión oficial publicada por mlx-community. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un modelo de lenguaje de 7.600 millones de parámetros especializado en tareas de programación: generación de código, razonamiento, corrección de errores y soporte conversacional. La conversión a MLX permite ejecutar el modelo en dispositivos Apple Silicon con Metal, aprovechando la memoria unificada de los chips M1/M2/M3.

La cuantización a 4 bits reduce significativamente el tamaño del modelo (de aproximadamente 15 GB a 4,3 GB), lo que lo hace viable en equipos con memoria unificada de 8 GB o más. El modelo hereda la arquitectura transformer de Qwen2.5, con ventana de contexto de 32.000 tokens y mejoras como RoPE (Rotary Positional Embeddings) y atención con GQA. Es relevante para desarrolladores que buscan un asistente de código local, sin depender de servicios en la nube, y con una licencia Apache 2.0 que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) con RoPE y atención GQA |
| Parametros totales | 7.600 millones (modelo base); 1.190.221.312 (pesos cuantizados en safetensors) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | Ingles (el modelo base soporta mas idiomas, pero la configuracion de este repo solo declara `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-7B-Instruct es un transformer denso de 7.600 millones de parametros, entrenado con un corpus de codigo fuente de multiples lenguajes (mas de 5,5 billones de tokens en la familia Qwen2.5-Coder, segun el informe tecnico). La arquitectura incorpora RoPE para posiciones relativas, attention con GQA (Grouped Query Attention) para eficiencia en inferencia, y una ventana de contexto de 32.768 tokens. El ajuste instruct se realizo mediante un proceso de supervisado (SFT) y posteriormente con RLHF (Reinforcement Learning from Human Feedback) para alinear las respuestas con instrucciones de usuario. La version 4-bit de este repositorio no modifica la arquitectura, sino que cuantiza los pesos a 4 bits usando el esquema de MLX, manteniendo la misma funcionalidad con una huella de memoria reducida.

## Capacidades

- Generacion de codigo en multiples lenguajes (Python, C++, Java, JavaScript, etc.) a partir de descripciones en lenguaje natural.
- Razonamiento y explicacion de fragmentos de codigo: puede analizar, comentar y sugerir mejoras.
- Depuracion y correccion de errores: identifica bugs y propone parches.
- Soporte de chat conversacional con contexto largo (hasta 32k tokens) para mantener conversaciones multi-turno sobre proyectos.
- Capacidades de tool calling y function calling (heredadas del modelo instruct) para integrarse en agentes y pipelines.
- Razonamiento paso a paso en problemas de programacion y algoritmia.
- Multilingue limitado: aunque la card declara solo `en`, el modelo base Qwen2.5 tiene soporte para otros idiomas, pero no se garantiza en esta conversion.

## Casos de uso

- Asistente de codigo local en un Mac: un desarrollador puede ejecutar el modelo en su portatil Apple Silicon (por ejemplo, M1 Pro con 16 GB de RAM) para autocompletar codigo, refactorizar funciones y resolver dudas de sintaxis sin conexion a internet, gracias a la cuantizacion 4-bit que reduce el consumo de VRAM a unos 4-5 GB.
- Revision de codigo en entornos aislados: integrado en un pipeline de CI/CD, el modelo puede analizar pull requests y sugerir mejoras de estilo, detectar errores comunes o proponer test unitarios, usando su capacidad de razonamiento sobre codigo.
- Generacion de documentacion tecnica: dado un fragmento de codigo o una funcion, el modelo puede generar comentarios, docstrings y documentacion de API, aprovechando su entrenamiento en code y lenguaje natural.
- Tutor de programacion para estudiantes: un chat local que explica conceptos de programacion, resuelve ejercicios y proporciona ejemplos de codigo, con contexto de 32k tokens para mantener el hilo de una sesion de aprendizaje.
- Automatizacion de tareas de desarrollo: el modelo puede convertir especificaciones en lenguaje natural a codigo (por ejemplo, "crea una funcion que ordene una lista") y generar scripts de automatizacion, gracias a su capacidad de tool calling.
- Analisis de seguridad de codigo: dado un fragmento, el modelo puede identificar patrones inseguros (inyeccion SQL, buffer overflow, etc.) y sugerir correcciones, aproveitando su conocimiento de vulnerabilidades comunes.

## Benchmarks y rendimiento

Segun el informe tecnico de Qwen2.5-Coder (arXiv:2409.12186), el modelo base Qwen2.5-Coder-7B-Instruct supera en benchmarks de codigo a modelos mas grandes como CodeStral-22B y DeepSeek-Coder-33B-Instruct. En la informacion proporcionada no se incluyen numeros especificos de MMLU, HumanEval o GSM8K para esta version cuantizada. Se puede asumir que la cuantizacion 4-bit degrada ligeramente el rendimiento respecto al modelo completo, pero no se dispone de datos concretos. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a 4-bit ocupa 4,3 GB en disco, y en inferencia requiere aproximadamente 5-6 GB de memoria unificada en Apple Silicon (incluyendo overhead del runtime y el tokenizer).
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3 o superior) con al menos 8 GB de RAM unificada. En equipos con 16 GB funciona con comodidad para contexto largo.
- No es compatible con GPUs NVIDIA o AMD en su formato MLX; para usar en estas plataformas se necesitaria el modelo original en formato safetensors (no cuantizado) o versiones GGUF.
- Opciones de despliegue: exclusivamente con la libreria `mlx-lm` de Apple. El codigo de ejemplo en la model card muestra `mlx_lm.load` y `mlx_lm.generate`. Tambien se puede usar con el servidor de MLX para APIs locales.
- Latencia y throughput: no hay datos publicados para este modelo cuantizado; en un M1 Max (32 GB) se esperan velocidades de generacion de 20-40 tokens por segundo, pero no esta confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (este, 4-bit MLX) | 7,6 B | 32k | Apache 2.0 | MLX | Cuantizado, para Apple Silicon |
| CodeLlama-7B-Instruct | 7 B | 16k | Llama 2 License | GGUF, safetensors | Modelo de Meta, mas antiguo, menor rendimiento en codigo |
| DeepSeek-Coder-7B-Instruct | 7 B | 16k | MIT | safetensors, GGUF | Alternativa open source, buen rendimiento en codigo |
| CodeGemma-7B-Instruct | 7 B | 8k | Google License | safetensors, GGUF | Orientado a codigo, pero con contexto menor |

Este modelo destaca por su cuantizacion especifica para Apple Silicon y su ventana de contexto de 32k, superior a las alternativas de 16k. El modelo base Qwen2.5-Coder supera en benchmarks a modelos mas grandes, segun el informe tecnico.

## Limitaciones y advertencias

- El modelo solo declara soporte para el idioma ingles; el uso en otros idiomas puede producir respuestas de menor calidad o alucinaciones.
- La cuantizacion a 4-bit puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo completo, especialmente en tareas de razonamiento complejo.
- Al ser una conversion de MLX, solo funciona en hardware Apple Silicon; no es portable a otros entornos sin re-conversion.
- El repositorio no incluye un tokenizador propio; usa el tokenizador del modelo base Qwen2.5-Coder, que debe descargarse por separado.
- Riesgo de alucinacion en codigo: puede generar codigo con errores o vulnerabilidades; se recomienda revisar manualmente antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se debe incluir la atribucion correspondiente y no se otorga garantia de calidad.
- No se ha publicado informacion sobre sesgos o limitaciones adicionales en la model card de este repo; se asumen las del modelo base.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tbhrc/qwen2_5_coder_7b_instruct_4bit
- Modelo original (MLX): https://huggingface.co/mlx-community/Qwen2.5-Coder-7B-Instruct-4bit
- Modelo base (Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Modelo base (no instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-7B
- Informe tecnico: https://arxiv.org/html/2409.12186v1
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm (no incluido en la busqueda, pero se infiere)
