# trdthg/buddy-whisper

## Resumen

trdthg/buddy-whisper es un repositorio de artefactos compilados de forma cruzada para RISC-V (riscv64) con extensión `.rax`, generados para el runtime `buddy-cli` del proyecto buddy-mlir. No se trata de una publicación de pesos en formato estándar ni de un modelo entrenado por el autor: el repositorio contiene una única variante (`base`) empaquetada como `riscv64/base/whisper-base.rax`, que se ejecuta con el comando `./buddy-cli --model riscv64/<variant>/whisper-<variant>.rax`. El tamaño del repositorio es de aproximadamente 0,3 GB y no se declara licencia, idiomas soportados ni pipeline en los metadatos de HuggingFace.

El nombre del artefacto apunta a la variante `base` del modelo Whisper de OpenAI, un sistema de reconocimiento automático de voz (ASR) con arquitectura transformer encoder-decoder entrenado sobre audio débilmente supervisado a gran escala. No obstante, la model card de este repositorio no documenta parámetros, ventana de contexto, composición del dataset ni proceso de entrenamiento, por lo que todos esos datos se marcan como no disponibles.

La relevancia de este repositorio es fundamentalmente de infraestructura: demuestra un flujo de compilación de un modelo de IA hasta un binario ejecutable en arquitecturas RISC-V mediante una cadena basada en MLIR. Es útil para quien trabaja en despliegue de modelos en hardware embebido o en compiladores de aprendizaje profundo, no para quien busca un checkpoint reentrenable o afinable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio. El artefacto es un paquete compilado (`.rax`) para el runtime `buddy-cli`; el nombre indica que corresponde a Whisper en su variante `base` |
| Parametros totales | No disponible (no declarado en la model card ni en los metadatos) |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el artefacto se distribuye como binario compilado, no como pesos cuantizables por el usuario) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `.rax` (paquete compilado para riscv64 ejecutable con `buddy-cli`); no se incluyen safetensors, GGUF ni ONNX |
| Variantes incluidas | `base` (`riscv64/base/whisper-base.rax`) |
| Tamano del repositorio | 0,3 GB |
| Runtime de destino | `buddy-cli` (proyecto buddy-mlir) |
| Arquitectura de destino | riscv64 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-15 |

## Arquitectura y entrenamiento

La model card no describe ninguna arquitectura de red, dato de entrenamiento ni técnica de optimización. Se limita a listar la variante disponible y el comando de ejecución. Lo único verificable es el formato de entrega: un paquete `.rax` compilado de forma cruzada para riscv64, pensado para ser consumido por `buddy-cli`. Esto implica que la cadena de herramientas ha transformado un grafo de modelo (presumiblemente derivado de Whisper `base`) en código o bytecode ejecutable sobre RISC-V, probablemente a través de una ruta de compilación basada en MLIR propia de buddy-mlir.

Como contexto externo, no confirmado por este repositorio, Whisper es un modelo encoder-decoder de tipo transformer con atención sobre espectrogramas Mel, entrenado con supervisión débil sobre cientos de miles de horas de audio y orientado a transcripción y traducción de voz. La variante `base` es una de las más pequeñas de la familia. Cualquier afirmación sobre número de parámetros, ventana de audio o número de tokens de entrenamiento correspondiente a este artefacto concreto queda sin verificar: no se declara ningún proceso de RLHF, DPO ni ajuste supervisado específico del autor, y no se documenta ninguna innovación técnica adicional más allá del propio empaquetado para RISC-V.

## Capacidades

- Reconocimiento automático de voz: la única capacidad inferible del nombre del artefacto es la transcripción de audio, asumiendo que el binario reproduce fielmente el comportamiento del modelo Whisper `base`. La model card no lo confirma explícitamente.
- Traducción de voz a texto: no disponible (no se documenta si la variante empaquetada conserva la cabeza de traducción multilingüe).
- Multilingüismo: no disponible (no se declaran idiomas soportados ni si se trata de una variante `.en`).
- Marcas de tiempo a nivel de palabra o segmento: no disponible.
- Tool calling / function calling: no soportado (no es una capacidad de un modelo ASR y no se documenta integración alguna).
- Uso como agente o razonamiento multi-paso: no aplica.
- Generación de texto, código o matemáticas: no aplica.
- Capacidades de visión o audio-vision: no disponible.
- Ejecución en CPU RISC-V: capacidad derivada del formato de entrega, condicionada a que el runtime `buddy-cli` y el hardware de destino funcionen correctamente.
- Ajuste fino o reentrenamiento: no disponible (el repositorio distribuye un binario compilado, no pesos entrenables).

## Casos de uso

- Transcripción de voz en dispositivos embebidos RISC-V: el artefacto está compilado específicamente para riscv64 y se ejecuta con `buddy-cli`, por lo que encajaría en placas o SoC con esa ISA donde no se dispone de Python ni de GPUs. Requiere validar previamente la precisión real del binario.
- Evaluación de cadenas de compilación de IA (MLIR): sirve como caso de prueba reproducible para medir si buddy-mlir genera código correcto y eficiente para un modelo de audio conocido, comparando la salida con la del modelo original.
- Investigación en inferencia en el borde (edge inference): permite estudiar consumo de memoria, latencia y precisión de Whisper `base` en hardware de muy bajas prestaciones, sin depender de CUDA.
- Interfaces de voz locales con requisito de privacidad: un asistente de dictado o de comandos por voz que procese el audio íntegramente en el dispositivo, sin enviar datos a la nube, siempre que el binario ofrezca la calidad mínima necesaria.
- Docencia y demostraciones de compilación cruzada de modelos: el repositorio es un ejemplo compacto (0,3 GB) de cómo se empaqueta un modelo para una ISA no convencional, útil en cursos de compiladores o de sistemas embebidos.
- Integración en pipelines de accesibilidad: subtitulado local de audio para aplicaciones de asistencia, sujeto a verificación de la precisión y de los idiomas soportados por la variante empaquetada.
- Pruebas de regresión del runtime `buddy-cli`: uso del artefacto como entrada fija para comprobar que nuevas versiones del runtime no rompen la ejecución de modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de WER (word error rate), latencia, throughput ni comparaciones con otras implementaciones. Tampoco se declaran los conjuntos de evaluación empleados.

## Requisitos de hardware

- VRAM: no aplica. El artefacto está compilado para riscv64 y se ejecuta con `buddy-cli`, un runtime orientado a CPU; no se documenta ruta de ejecución en GPU.
- GPU recomendadas: no disponible (no se declara soporte CUDA, ROCm ni Metal).
- CPU de destino: riscv64 exclusivamente. No hay indicios de que el paquete `.rax` sea portable a x86-64 o ARM sin recompilación.
- Encaje en hardware de consumo: el repositorio ocupa 0,3 GB, un tamaño compatible con memoria de sistemas embebidos, pero el consumo real en ejecución no está documentado.
- Opciones de despliegue: únicamente `buddy-cli` según la model card (`./buddy-cli --model riscv64/<variant>/whisper-<variant>.rax`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, CTranslate2 ni ONNX Runtime.
- Latencia y throughput: no disponible.
- Memoria RAM necesaria en ejecución: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden del conocimiento general de la familia Whisper y no se han verificado en este repositorio; se marcan como referencia externa.

| Modelo | Formato de entrega | Parametros | Ventana de audio | Licencia | Plataforma de ejecucion |
|---|---|---|---|---|---|
| trdthg/buddy-whisper (`base`) | `.rax` compilado para riscv64 | No disponible | No disponible | No disponible | `buddy-cli` sobre RISC-V |
| openai/whisper-base (referencia externa) | safetensors / PyTorch | ~74 M (dato de referencia, no verificado aqui) | 30 s (dato de referencia) | MIT (dato de referencia) | PyTorch sobre CPU/GPU |
| whisper.cpp (referencia externa) | GGML / GGUF | Segun variante (tiny a large) | 30 s (dato de referencia) | MIT (dato de referencia) | CPU/GPU en x86-64, ARM y otros |
| faster-whisper / CTranslate2 (referencia externa) | Modelo optimizado en CTranslate2 | Segun variante | 30 s (dato de referencia) | MIT (dato de referencia) | CPU y GPU |

No se dispone de benchmarks comparativos entre este artefacto y las alternativas anteriores, por lo que no es posible afirmar nada sobre su precisión relativa.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación. Sin licencia explícita, el uso en producción entraña riesgo legal.
- Trazabilidad del modelo base insuficiente: no consta de qué checkpoint exacto de Whisper se partió, ni si se aplicaron transformaciones, cuantizaciones o podas antes de la compilación.
- Artefacto binario opaco: al distribuirse como `.rax` compilado, no es inspeccionable ni modificable con las herramientas habituales de HuggingFace, y no permite ajuste fino.
- Plataforma restringida: solo riscv64 con `buddy-cli`; no hay ruta documentada para x86-64, ARM, CUDA ni otros runtimes.
- Ausencia total de métricas: sin WER ni evaluaciones publicadas, no se puede estimar la calidad de transcripción real del binario.
- Riesgo de divergencia numérica: la compilación cruzada y cualquier optimización aplicada pueden alterar ligeramente las salidas respecto al modelo original.
- Alucinación: los modelos de la familia Whisper tienden a generar texto plausible en segmentos de silencio, ruido o audio ininteligible; en ausencia de validación específica, este riesgo no puede descartarse.
- Idiomas no especificados: se desconoce si el artefacto conserva capacidades multilingües o si está limitado al inglés.
- Sesgos: no hay ninguna evaluación de sesgos demográficos, acústicos o lingüísticos para este artefacto; los sesgos del modelo base subyacente se heredarían sin cuantificar.
- Madurez del proyecto: cero descargas y cero likes en el momento de la consulta, y la fecha de creación registrada (2026-09-15) indica que se trata de una publicación reciente y sin validación por parte de la comunidad.
- Advertencia sobre la búsqueda: los resultados de búsqueda web obtenidos no guardan relación con el modelo (corresponden a documentación de Google Maps), por lo que no aportan información adicional ni fuentes verificables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/trdthg/buddy-whisper
- Proyecto buddy-mlir (runtime `buddy-cli`): no disponible en la informacion proporcionada; debe localizarse en el repositorio oficial del proyecto buddy-mlir.
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las referencias devueltas corresponden a documentación de Google Maps y no estan relacionadas con el modelo.
