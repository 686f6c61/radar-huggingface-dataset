# viperdevAI/Viperfish-Sunlight-1.5B

## Resumen

Viperfish Sunlight 1.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por viperdevAI, especializado en la generación de código Swift y SwiftUI. Forma parte de la familia Viperfish de modelos de pesos abiertos, siendo la variante más pequeña, disenada para ejecutarse en equipos con Apple Silicon y tan solo 8 GB de memoria unificada. El modelo base es un transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros totales.

La relevancia de este modelo radica en su especialización vertical: mientras que el modelo base es un generador de código generalista, Sunlight ha sido entrenado mediante LoRA sobre 6.164 archivos fuente de Swift y SwiftUI extraidos de The Stack v1 (dedup), con el objetivo de mejorar el rendimiento en la generación de interfaces declarativas para el ecosistema Apple. El repositorio distribuye únicamente la build MLX en cuantización 4-bit (aproximadamente 840 MB), pensada para su uso con la librería mlx-lm en macOS.

El modelo no está pensado como sustituto generalista del base: el autor documenta explícitamente una regresión en Python (HumanEval cae del 67,7 % al 56,1 %) a cambio de una mejora sustancial en SwiftUI (de 16 a 31 aciertos sobre 60 prompts). Es, por tanto, una herramienta de nicho para desarrolladores de apps Apple que priorizan la generación de vistas SwiftUI sobre la versatilidad multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino mediante LoRA sobre Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | 4-bit (MLX); unica build publicada en este repositorio |
| Idiomas soportados | en (ingles); entrenado para codigo Swift/SwiftUI |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (build MLX 4-bit); repositorio de 0,9 GB |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5, y se especializa mediante un adaptador LoRA de rango 8, escala 20 y 16 capas, entrenado durante 6.164 pasos con batch size 1, longitud de secuencia 1024 y learning rate 5e-5 con decaimiento coseno. El adaptador se ha fusionado (fused) en la base cuantizada a 4-bit para producir la build MLX distribuida en este repositorio.

Los datos de entrenamiento consisten en 6.164 archivos fuente de Swift y SwiftUI extraidos de The Stack v1 (dedup). No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. El autor advierte que los datos eran código fuente crudo y no conversaciones, lo que explica que el modelo a menudo detenga la generación sin cerrar el bloque de código final y que las respuestas largas puedan extenderse en exceso. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de código Swift y, de forma destacada, de vistas SwiftUI (el benchmark propio del autor muestra una mejora de 16 a 31 aciertos sobre 60 prompts respecto al base).
- Generación de código Swift "plano" con una mejora marginal (de 13 a 14 sobre 33 prompts).
- Generación de texto y conversación en inglés, heredada del modelo base instruct.
- Capacidad residual de generación de código en otros lenguajes (incluido Python), aunque con regresión documentada.
- No se documenta soporte de tool calling / function calling en la model card.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al inglés según el campo `language` del repositorio.

## Casos de uso

- Generación de vistas SwiftUI en el IDE: el modelo puede producir estructuras declarativas (contadores, botones, listas, navegación) a partir de una descripción en lenguaje natural, lo que acelera el prototipado de interfaces en Xcode sobre un Mac de 8 GB.
- Asistencia de código en proyectos de apps Apple: integrado en un flujo de autocompletado o chat dentro de Xcode, el modelo sugiere implementaciones de componentes SwiftUI y corrige idioms obsoletos, siempre que el desarrollador compile y revise la salida.
- Aprendizaje y docencia de SwiftUI: al ser un modelo pequeño y ejecutable localmente, sirve para generar ejemplos didácticos de vistas y modificadores que el estudiante puede compilar inmediatamente con `swiftc`.
- Prototipado rápido en dispositivos con recursos limitados: su build 4-bit de ~840 MB permite desplegarlo en un MacBook con 8 GB de memoria unificada sin GPU dedicada, útil para demos offline o entornos sin conectividad.
- Migración de UIKit a SwiftUI: el modelo puede proponer equivalentes declarativos de vistas imperativas, aunque el autor advierte de posibles APIs inventadas, por lo que requiere revisión humana.
- Generación de snippets para documentación técnica: dado su enfoque en código fuente crudo, puede producir ejemplos de código Swift para guías y artículos, con la salvedad de que conviene validar la compilación antes de publicar.
- Filtrado y clasificación de código Swift: aunque no está entrenado específicamente para ello, su especialización en el dominio permite usarlo como generador de variantes o como base para tareas de completado en pipelines internos de revisión de código.

## Benchmarks y rendimiento

| Modelo | SwiftUI (60 prompts) | Swift plano (33 prompts) | HumanEval (164) |
|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (4-bit) | 16 | 13 | 67,7 % (111) |
| Viperfish Sunlight 1.5B | 31 | 14 | 56,1 % (92) |

Los benchmarks de Swift y SwiftUI son propios del autor y evalúan si el código generado compila con `swiftc`; HumanEval es el benchmark estándar de Python. El propio autor advierte que los conjuntos de prompts son pequeños y propios, por lo que los resultados deben tratarse como indicativos y no definitivos.

## Requisitos de hardware

- VRAM/memoria estimada: la build 4-bit MLX ocupa aproximadamente 840 MB, por lo que cabe holgadamente en 8 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) con al menos 8 GB de memoria unificada; el modelo está empaquetado para MLX, no para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y 8 GB o más; no se distribuye build GGUF ni CUDA en este repositorio.
- Opciones de despliegue: mlx-lm (librería oficial del repositorio); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para esta build concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viperfish Sunlight 1.5B | 1.543.714.304 | no disponible | Swift / SwiftUI | Apache-2.0 | Hugging Face (MLX 4-bit) |
| Qwen2.5-Coder-1.5B-Instruct | 1.500 millones (aprox., segun modelo base) | no disponible en la informacion | Codigo generalista | Apache-2.0 | Hugging Face |
| Viperfish Twilight 3B | no disponible | no disponible | no disponible | no disponible | Mencionado en viperfish.dev |
| Viperfish Midnight 7B | no disponible | no disponible | no disponible | no disponible | Mencionado en viperfish.dev |

La comparación más directa es con su modelo base, Qwen2.5-Coder-1.5B-Instruct: Sunlight mejora SwiftUI (31 frente a 16) y Swift plano (14 frente a 13), pero empeora en Python (56,1 % frente a 67,7 % en HumanEval). Las variantes Twilight 3B, Midnight 7B y Hadal 14B de la misma familia se mencionan en la model card, pero no se aportan especificaciones ni benchmarks en la información disponible.

## Limitaciones y advertencias

- Regresión en Python: HumanEval cae de 67,7 % a 56,1 %; no es adecuado como modelo generalista de código.
- Datos de entrenamiento de código fuente crudo, no conversacional: el modelo a menudo termina sin cerrar el bloque de código final y las respuestas largas pueden divagar.
- Es un modelo de 1,5B: se esperan errores, APIs inventadas e idioms de SwiftUI desactualizados; siempre hay que compilar y revisar el código generado.
- Entrenado solo con Swift y SwiftUI: puede no generalizar a otros lenguajes.
- Los benchmarks del autor son propios y con conjuntos de prompts pequeños; los números son indicativos, no definitivos.
- Idiomas: solo inglés documentado; no se garantiza un buen rendimiento en castellano ni en otros idiomas.
- Licencia Apache-2.0: permite uso comercial, pero los datos de entrenamiento provienen de The Stack v1 y están sujetos a las licencias upstream de los archivos originales, que no se redistribuyen en el repositorio.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: elevado en APIs y modificadores de SwiftUI, según advierte el propio autor.
- Disponibilidad limitada: build únicamente MLX 4-bit; sin GGUF, sin CUDA y sin versiones en otros formatos en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/viperdevAI/Viperfish-Sunlight-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- Dataset The Stack v1 (dedup): https://huggingface.co/datasets/bigcode/the-stack
- Sitio de la familia Viperfish: https://viperfish.dev
