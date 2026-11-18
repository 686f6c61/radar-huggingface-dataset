# xinyunsunshine/invar-kuka-stirring-20261117

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de despliegue de políticas de robótica para una tarea concreta de manipulación: remover con una cuchara en un cuenco pequeño con un brazo KUKA equipado con una mano Sharpa. Lo publica el usuario `xinyunsunshine` bajo el identificador `invar-kuka-stirring-20261117` y lo etiqueta como `robotics`, `kuka` y `stirring`. El paquete incluye seis políticas estudiante seleccionadas (checkpoints `student_ema.pt`), tres codificadores visuales (DINO, INVAR y CAIP), código de inferencia portátil, mapeos de referencia de observaciones y acciones, configuraciones y registros de evaluación. El snapshot es del 17 de noviembre de 2026.

El modelo resuelve un problema muy específico: ejecutar una política de control visual para remover en sentido horario con radio de 30 mm, partiendo de una posición alta del brazo y con una cuchara estándar. La entrada es una imagen RGB de una cámara de cabeza calibrada (`Bx3x90x160`) más una máscara de cuchara (`Bx1x90x160`) y un vector de propriocepción de 87 dimensiones. La salida es un vector de acción de 29 dimensiones (7 canales KUKA + 22 canales Sharpa), con horizonte H=1. No requiere vídeo objetivo, condicionamiento humano, pose de objeto rastreado ni profesor en inferencia.

Es relevante para investigadores en robótica porque documenta con detalle un pipeline de destilación de políticas (profesor → estudiante con EMA), selección de checkpoints bajo condiciones limpias y con aumento de dominio visual (DR), y ofrece contratos de entrada/salida explícitos. Sin embargo, el autor advierte que no se ha validado en robot físico y que el paquete es inferencia de modelo, no un controlador listo para ejecutar en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de robótica con codificador visual (DINO, INVAR o CAIP) y cabeza de acción; `architecture_version=2`; no es transformer de lenguaje ni MoE |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 90x160 y vector de propriocepción 87D; colas de acción/propriocepción de longitud 3 |
| Tipos de cuantización | no disponible (checkpoints `.pt` de PyTorch, no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`student_ema.pt`); codificadores `.pth`; no TorchScript ni ONNX |

## Arquitectura y entrenamiento

El paquete contiene seis políticas estudiante seleccionadas a partir de entrenamiento con destilación desde un profesor (receta `v5 teacher recipe`), con pesos EMA (`student_ema.pt`). Los seis checkpoints corresponden a tres codificadores visuales (DINO, INVAR, CAIP) y dos condiciones de selección (limpia y con aumento de dominio visual), aunque el autor aclara que no son dos políticas entrenadas por separado, sino selecciones independientes por condición de evaluación. DINO e INVAR completaron 200.000 actualizaciones; CAIP es una selección interina hasta 80.000 actualizaciones. Las políticas DINO están fine-tuned, mientras que INVAR y CAIP usan backbones congelados cuyos pesos se omiten deliberadamente de los ficheros de política y deben cargarse por separado desde `encoders/{dino,invar,caip}.pth`.

La entrada visual es una imagen RGB de cámara de cabeza calibrada en float [0,1] de forma `Bx3x90x160` más una máscara de cuchara `Bx1x90x160`; el codificador aplica su propio preprocesado (no se debe aplicar normalización ImageNet o CLIP externamente; CAIP redimensiona internamente a 256x256). La propriocepción es un vector de 87 dimensiones en orden canónico de articulaciones: 29 posiciones normalizadas en [-1,1], 29 velocidades articulares y 29 objetivos de posición previamente comandados en radianes. La salida es un vector de acción de profesor recortado de 29 dimensiones (7 KUKA + 22 Sharpa) con H=1; no son ángulos articulares y el adaptador de robot debe implementar el mapeo, escalado, suavizado, orden y límites. El entrenamiento incluye física aleatorizada, ruido de pose de cámara y de inicio de cuchara, máscaras y retardo de cámara de 6±1 pasos de control a 60 Hz. El aumento de dominio visual está activado en DINO y CAIP y desactivado en INVAR.

## Capacidades

- Control visual de manipulación robótica para una única tarea: remover en sentido horario con radio de 30 mm en un cuenco pequeño, con inicio de brazo alto y cuchara estándar.
- Inferencia sin vídeo objetivo, sin condicionamiento humano, sin pose de objeto rastreado y sin profesor.
- Carga de checkpoints con validación de SHA256 del codificador fijado y carga estricta de `payload['model']`.
- Ejecución de comprobación de inferencia offline en CPU con datos ficticios (`load_policy.py`), sin E/S de robot.
- Tres variantes de codificador visual intercambiables (DINO fine-tuned; INVAR y CAIP congelados).
- Soporte de selección de checkpoint por condición (limpia o DR visual).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking; es una política de control específica de tarea.

## Casos de uso

- Evaluación de destilación profesor-estudiante en robótica: comparar los seis checkpoints (DINO/INVAR/CAIP × limpio/DR) bajo el mismo contrato de entrada/salida para medir el efecto del codificador visual y del aumento de dominio en la selección de política.
- Reproducción de inferencia offline: usar `load_policy.py` con `--checkpoint` y `--encoder` para verificar que el checkpoint y el codificador coinciden y que la arquitectura se carga sin modificar la configuración almacenada.
- Integración en un pipeline de control propio: el adaptador de robot implementa el mapeo de acción, escalado, suavizado, orden de articulaciones y límites a partir de `reference/action_utils.py`, mientras `load_policy.py` no realiza E/S de robot.
- Estudio del retardo de cámara y colas: el paquete documenta un retardo de 6±1 pasos a 60 Hz y colas de acción/propriocepción de longitud 3, lo que permite calibrar el pipeline físico frente a la latencia de captura, segmentación y transporte.
- Comparación de codificadores congelados frente a fine-tuned: INVAR y CAIP usan backbones congelados (pesos separados), mientras DINO está fine-tuned pero su constructor requiere el codificador DINO original para validación de hash e inicialización.
- Base para migración de cargador de vídeo objetivo: `DEPLOYMENT_MIGRATION.md` describe cómo sustituir el cargador de vídeo objetivo en el pipeline de despliegue.
- Verificación de integridad del paquete: `sha256sum -c SHA256SUMS` tras la descarga para validar los ficheros descargados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que `loader_validation.json` comprueba existencia de checkpoint, configuración, formato de estado e inferencia ficticia en CPU, pero que no se ha realizado validación en robot físico de estos checkpoints sin objetivo. La grabación en robot real de una política DINO condicionada por objetivo de 60k es una política distinta y no establece éxito en hardware para estos ficheros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 2,0 GB e incluye seis políticas y tres codificadores, pero no se documenta el consumo por checkpoint.
- GPU recomendadas: no disponible; el autor solo menciona una comprobación de inferencia ficticia en CPU.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: `load_policy.py` con PyTorch, instalando las versiones de `configs/inference_versions.json` y `requirements.txt`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles; se documenta un retardo de cámara de entrenamiento/evaluación de 6±1 pasos de control a 60 Hz y colas de longitud 3.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de robótica comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se ha validado en robot físico: el paquete proporciona inferencia de modelo, no un controlador listo para ejecutar en hardware.
- La tarea es única y muy restringida: un cuenco pequeño, remover en sentido horario con radio de 30 mm, inicio de brazo alto y cuchara estándar.
- La salida no son ángulos articulares: el adaptador de robot debe implementar mapeo, escalado, suavizado, orden de articulaciones y límites; usar las acciones en bruto como objetivos articulares es incorrecto.
- No se debe aplicar normalización ImageNet o CLIP externamente; el codificador aplica su propio preprocesado.
- No se debe poner `DINO config.dino_freeze=True` antes de cargar: hay que preservar la arquitectura y configuración almacenadas.
- INVAR y CAIP requieren pesos de codificador separados; los backbones congelados se omiten deliberadamente de los ficheros de política.
- El retardo de cámara y las colas deben ajustarse a la latencia física medida; no se deben añadir colas a ciegas sobre la latencia física.
- La selección de CAIP es interina hasta 80.000 actualizaciones, frente a las 200.000 de DINO e INVAR.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial.
- No hay información sobre sesgos, alucinación o limitaciones de idioma porque no es un modelo de lenguaje.
- La grabación en robot real de la política DINO condicionada por objetivo de 60k no establece éxito en hardware para estos checkpoints sin objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/xinyunsunshine/invar-kuka-stirring-20261117
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
