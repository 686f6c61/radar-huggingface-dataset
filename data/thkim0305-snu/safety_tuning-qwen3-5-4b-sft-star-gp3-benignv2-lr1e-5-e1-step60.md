# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E1-step60

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E1-step60 es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario thkim0305-SNU. Se trata de un artefacto de investigación orientado al alineamiento de seguridad: el nombre indica que proviene de una ejecución de entrenamiento denominada STAR GP3 / benign-v2, con un ritmo de aprendizaje de 1e-5 y un total de 60 actualizaciones del optimizador completadas (índice de checkpoint nativo 59, correspondiente a la época 1).

El modelo conserva la arquitectura multimodal del Qwen3.5-4B original (etiqueta `qwen3_5` y pipeline `image-text-to-text`), pero el repositorio se publica con pipeline declarado `text-generation` y contiene únicamente los pesos de inferencia en formato safetensors junto con los assets del tokenizador. No incluye estados del optimizador ni registros de entrenamiento, que permanecen en el almacenamiento original del autor.

Su relevancia es acotada y experimental: se trata de un checkpoint intermedio de una campaña de safety tuning, con cero descargas y cero likes en el momento de la consulta, y sin model card detallada más allá de los metadatos de la ejecución. Resulta útil como referencia para reproducir o auditar el proceso de SFT, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), etiqueta `qwen3_5`; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 (4,66 mil millones, segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,66 mil millones de parametros con soporte multimodal entrada imagen-texto segun las etiquetas del repositorio. Sobre esa base se aplica un ajuste fino supervisado (SFT) dentro de la ejecucion identificada como `qwen35-star-gp3-benignv2-sft-lr1e5-4ep-gpu0123-20261112-v1`, cuyo checkpoint de origen es `iter_0000059`. El checkpoint publicado corresponde a la epoca 1, con 60 actualizaciones del optimizador completadas y una tasa de aprendizaje de 1e-5.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset (mas alla de las etiquetas `gp3` y `benignv2`, que sugieren un conjunto orientado a comportamiento benigno y seguridad), ni sobre el uso de RLHF, DPO u otras tecnicas de alineamiento posteriores. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El export a Hugging Face se realizo bajo el identificador `qwen35-gp3-benignv2-sft-lr1e5-epoch1-nine-eval-pro6000-gpu0-20261112-v1`, lo que indica que existio una evaluacion intermedia durante el entrenamiento.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento de entrada imagen-texto heredado del modelo base Qwen3.5-4B (etiqueta `image-text-to-text`).
- Ajuste orientado a seguridad: el entrenamiento SFT con datos `benignv2` busca favorecer respuestas benignas y reducir comportamientos no deseados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Auditoria de safety tuning: el checkpoint permite inspeccionar el efecto de 60 pasos de SFT con tasa 1e-5 sobre el modelo base, comparando respuestas antes y despues del ajuste en un conjunto de prompts sensibles.
- Investigacion sobre alineamiento: util como punto intermedio en una curva de entrenamiento para estudiar como evoluciona el comportamiento benigno a lo largo de las epocas.
- Evaluacion de robustez: serviria para medir la tasa de respuestas seguras frente a prompts adversarios y contrastarla con el modelo base sin ajustar.
- Reproducibilidad experimental: al documentarse el checkpoint de origen y los hiperparametros (epoca, paso, learning rate), facilita la replicacion del pipeline de SFT en entornos de investigacion.
- Prototipado de asistentes conversacionales con moderacion: en un entorno controlado, se puede desplegar via transformers para probar flujos de dialogo con un sesgo hacia respuestas benignas.
- Experimentos multimodales ligeros: al heredar la etiqueta image-text-to-text, permite probar tareas de descripcion de imagen o respuesta a preguntas visuales en hardware de gama media, siempre con validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda reservar 12-16 GB.
- Cuantizacion a 8 bits: en torno a 5-6 GB de pesos; a 4 bits, en torno a 3 GB, aunque el repositorio no publica variantes cuantizadas y habria que generarlas.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16.
- GPU de consumo: cabe en tarjetas con 12 GB o mas en fp16 con cuidado en la longitud de contexto; en 8 GB requeriria cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), potencialmente vLLM o TGI al ser compatible con endpoints, y llama.cpp/Ollama si se generan pesos GGUF (no incluidos).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E1-step60 | 4,66 B | no disponible | Apache 2.0 | Checkpoint SFT intermedio, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (modelo base) | 4,66 B | no disponible | Apache 2.0 (segun repositorio derivado) | Referencia sin ajuste de seguridad; capacidades completas del original |
| Alternativas de ~4B orientadas a seguridad | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos comparables en la busqueda realizada |

## Limitaciones y advertencias

- Checkpoint intermedio: solo 60 pasos de optimizador y epoca 1; no representa el resultado final de la campana de entrenamiento y puede presentar un alineamiento incompleto.
- Ausencia de benchmarks: no hay metricas publicadas de seguridad, utilidad ni calidad, por lo que su comportamiento real no esta validado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; el SFT de seguridad no elimina las alucinaciones factuales.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, puede heredar los sesgos del modelo base y de los datos de ajuste.
- Idiomas: no se declara soporte multilingue; se desconoce el comportamiento fuera del idioma o idiomas de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las condiciones del modelo base Qwen3.5-4B.
- Produccion: no recomendado sin evaluacion previa de seguridad y calidad; es un artefacto de investigacion con cero descargas y sin comunidad de validacion.
- El repositorio no incluye estados del optimizador ni registros de entrenamiento, lo que limita la reproduccion exacta del proceso.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-gp3-benignv2-lr1e-5-E1-step60
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
