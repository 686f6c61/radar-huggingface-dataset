# uub336/Qwen3.8-27B-pi-mlx-4bit

## Resumen
El repositorio `uub336/Qwen3.8-27B-pi-mlx-4bit` es una conversión a formato MLX y cuantización de 4 bits de un modelo de 27.356.728.560 parámetros (unos 27,36 mil millones) con capacidad declarada de entrada imagen-texto y uso conversacional. Lo publica el usuario uub336 en HuggingFace, sin model card sustantiva, sin licencia declarada y sin métricas de evaluación publicadas en la información disponible. El nombre sugiere un origen en la familia Qwen (el tag `qwen3_5` apunta a la arquitectura declarada por el autor), pero no se documenta cuál es el modelo base exacto, su proceso de entrenamiento ni sus pesos originales.

Su interés práctico es acotado pero concreto: se trata de un artefacto de pesos ya convertido a MLX, un framework de Apple para ejecución en Apple Silicon, y comprimido a 4 bits, lo que reduce el requisito de memoria hasta unos 16 GB. Eso permite plantear inferencia local de un modelo de escala 27B en equipos con memoria unificada, algo fuera del alcance de una GPU de consumo con pesos en FP16 (unos 55 GB).

La contrapartida es la falta de trazabilidad: sin licencia, sin ficha técnica, sin benchmarks y con un único idioma declarado (inglés), el repositorio debe tratarse como material experimental. Esta ficha recoge únicamente lo verificable en los metadatos del repositorio y marca explícitamente como "no disponible" todo lo que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `qwen3_5` sugiere familia Qwen, sin confirmar) |
| Parámetros totales | 27.356.728.560 (≈27,36 mil millones) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (según nombre del repositorio y tag `4-bit`); no se documentan otras |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX; tamaño del repositorio 16,1 GB |
| Biblioteca | mlx |
| Pipeline declarado | image-text-to-text |
| Modalidad de entrada | imagen + texto (según pipeline declarado) |
| Fecha de creación | 2026-10-05T15:21:09Z |
| Última actualización | 2026-10-05T15:23:56Z (2 minutos después de la creación) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
No hay información publicada sobre la arquitectura interna más allá del tag `qwen3_5`, que apunta a un transformer de la familia Qwen. Tampoco se documenta si se trata de una variante densa o de mezcla de expertos (MoE): el número total de parámetros (27,36 B) se corresponde con la suma almacenada en los safetensors, pero no se indica el reparto entre parámetros activos y totales, dato imprescindible para estimar el coste real por token en una arquitectura MoE.

Respecto al entrenamiento, el repositorio no aporta número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones técnicas. La única información de proceso es la propia conversión: los pesos se han transformado al formato MLX y cuantizado a 4 bits, con un tamaño final de repositorio de 16,1 GB coherente con esa compresión. La model card se limita a los campos de metadatos (`language: en`, `library_name: mlx`, `pipeline_tag: image-text-to-text`).

## Capacidades
- Generación de texto conversacional: el tag `conversational` y el pipeline declarado indican uso en diálogo multi-turno.
- Procesamiento de imagen y texto: el pipeline `image-text-to-text` implica entrada multimodal (imagen junto con instrucciones textuales), típicamente descripción, respuesta a preguntas sobre la imagen o extracción de información visual.
- Ejecución local en Apple Silicon mediante MLX, con pesos ya cuantizados a 4 bits.
- Idioma: únicamente inglés declarado en los metadatos.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible.
- Rendimiento en código, matemáticas o visión medido con benchmarks: no disponible.

## Casos de uso
- Inferencia local en Mac para tareas multimodales: los pesos en 4 bits ocupan alrededor de 16 GB, de modo que un equipo Apple Silicon con memoria unificada suficiente puede ejecutar el modelo sin depender de la nube ni de GPUs dedicadas, usando MLX como runtime.
- Prototipado de asistentes que reciben imágenes: dado el pipeline `image-text-to-text`, sirve para experimentar con flujos de pregunta-respuesta sobre capturas, diagramas o fotografías antes de decidir si se migra a un modelo con licencia y soporte documentados.
- Descripción automática de imágenes en un pipeline interno de catalogación: se puede generar texto asociado a cada imagen de un repositorio local y revisarlo manualmente, siempre que el uso previsto no dependa de una licencia que el repositorio no declara.
- Evaluación comparativa de cuantización: el artefacto permite medir la degradación de un modelo de 27B al pasar a 4 bits frente a sus equivalentes en 8 bits o FP16, útil para decidir el punto de equilibrio entre memoria y calidad en despliegues en Apple Silicon.
- Extracción de información estructurada a partir de documentos escaneados con instrucciones en inglés: el modelo recibe la imagen y una consigna textual, y devuelve el contenido solicitado en formato de texto.
- Base para experimentación académica en multimodalidad: al no existir métricas publicadas, el repositorio sirve como punto de partida para reproducir evaluaciones propias sobre tareas de visión-lenguaje.
- Despliegue como servicio interno de bajo coste: con 16,1 GB de pesos, un único nodo con memoria unificada puede alojar el modelo para un grupo reducido de usuarios, sin necesidad de clúster.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (cálculo aritmético a partir de 27,36 B de parámetros, sin incluir caché KV ni overhead del runtime):
  - 4 bits: ≈14-16 GB (el repositorio ocupa 16,1 GB).
  - 8 bits: ≈28 GB.
  - FP16: ≈55 GB.
- Apple Silicon: al tratarse de pesos MLX, el destino natural son equipos con memoria unificada. Un Mac con 16 GB resulta insuficiente o muy justo al sumar el contexto; 24-32 GB es el rango razonable para 4 bits; 64 GB o más permite margen para contextos largos y otras aplicaciones en paralelo.
- GPU NVIDIA: los pesos MLX no se cargan directamente en CUDA. Para A100 (40/80 GB), H100 (80 GB) o RTX 4090 (24 GB) habría que convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar), algo no documentado en el repositorio.
- En GPU de consumo: 24 GB (RTX 4090, RTX 3090) bastarían para 4 bits tras la conversión de formato; el FP16 queda fuera del alcance de cualquier GPU de consumo actual salvo multi-GPU.
- Opciones de despliegue: MLX y `mlx-lm` para texto, y el ecosistema MLX-VLM para modelos de visión-lenguaje; llama.cpp, Ollama o vLLM requerirían una conversión previa no incluida en el repositorio.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares
No disponible. El repositorio no identifica su modelo base, no declara licencia y no publica evaluaciones, por lo que no es posible establecer una comparación verificable con alternativas de la misma escala (por ejemplo, modelos densos de 27B o variantes cuantizadas de la familia Qwen). Cualquier tabla comparativa requeriría primero confirmar la procedencia de los pesos.

## Limitaciones y advertencias
- Ausencia de licencia: el repositorio no declara licencia alguna, lo que impide determinar si el uso comercial está permitido. En la práctica, esto desaconseja su uso en producción hasta que se aclare la situación legal de los pesos originales.
- Falta de model card: no hay información sobre el modelo base, los datos de entrenamiento, los procesos de alineación ni las limitaciones conocidas por el autor.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de error, por lo que no hay base para estimar la fiabilidad de sus respuestas.
- Cobertura de idiomas: solo se declara inglés. El rendimiento en castellano no está documentado y podría degradarse de forma significativa.
- Cuantización de 4 bits: la compresión agresiva suele degradar tareas sensibles a la precisión numérica, como matemáticas, código o razonamiento de varios pasos. No se publican comparativas frente a los pesos originales.
- Contexto desconocido: al no especificarse la longitud de contexto soportada, no se puede planificar su uso en tareas de documento largo sin una prueba previa.
- Trazabilidad dudosa: el repositorio se creó y actualizó con dos minutos de diferencia, sin histórico de versiones ni documentación de la conversión a MLX, y cuenta con cero descargas y cero interacciones.
- Incompatibilidad de formato: los pesos MLX no son directamente utilizables en el stack CUDA (vLLM, TGI, TensorRT-LLM) sin una conversión adicional.
- El nombre del modelo (`Qwen3.8-27B-pi`) no se corresponde con ningún identificador oficial conocido de la familia Qwen, lo que refuerza la necesidad de verificar la procedencia antes de reutilizarlo.
- La búsqueda web realizada no devolvió documentación técnica sobre este repositorio; los resultados obtenidos no guardan relación con el modelo.

## Enlaces
- HuggingFace: https://huggingface.co/uub336/Qwen3.8-27B-pi-mlx-4bit
- Model card: no disponible (el README solo contiene metadatos)
- Paper, blog o repositorio del autor: no disponible
- Demos o espacios asociados: no disponible
- Nota: la búsqueda web no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a sitios sin relación con el contenido técnico.
