# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E3-step180

## Resumen

Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E3-step180 es un checkpoint de ajuste fino supervisado (SFT) orientado a seguridad sobre el modelo multimodal Qwen/Qwen3.5-4B, publicado por el usuario thkim0305-SNU. El modelo conserva la arquitectura del base (pipeline image-text-to-text, 4.659.865.088 parametros segun safetensors) y se distribuye con licencia Apache 2.0 en formato safetensors compatible con transformers.

El entrenamiento parte de la revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base y utiliza 7.655 trayectorias completas de profesor procedentes de los datasets UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915, supervisando razonamiento, respuesta y token EOS. Se trata de un experimento de safety tuning con hiperparametros concretos: learning rate 1e-5, 180 actualizaciones de optimizador, epoca 3 de 4 y batch global de 128.

Su relevancia es acotada: es un checkpoint de investigacion con 13 descargas y 0 likes en el momento de la consulta, sin puntuaciones de evaluacion declaradas por el autor. Resulta util como referencia reproducible de un pipeline de SFT con exportacion verificada a safetensors, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen3.5-4B, un transformer multimodal con torre de vision y modulo MTP (multi-token prediction). Segun la model card, todos los tensores de texto entrenados se exportan desde el checkpoint nativo, mientras que los tensores de vision y los tensores MTP no entrenados se conservan del modelo base fijado; el MTP no fue entrenado. La verificacion de conversion incluye la conversion inversa exacta de cada tensor de texto nativo, comprobaciones de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

El entrenamiento es un SFT con 7.655 trayectorias completas de profesor de STAR-1 y STAR-Benign, supervisando razonamiento, respuesta y EOS. Cada ejecucion de learning rate parte de forma independiente del modelo base original y no se anade ningun "teacher Spec" al contexto del estudiante. Hiperparametros declarados: learning rate 1e-5, 180 actualizaciones de optimizador (iteracion nativa 179, base cero), epoca 3/4 y batch global 128. La ejecucion de origen es `qwen35-star-slime-sft-4ep-b128-pro6000-gpu01-20261106-v3`. No se detalla la composicion exacta de tokens ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de vision conservada del base.
- Salidas con traza de razonamiento supervisada durante el SFT (reasoning, answer y EOS).
- Ajuste orientado a seguridad sobre trayectorias de STAR-1 y STAR-Benign.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en safety tuning: el checkpoint sirve como punto de comparacion reproducible para estudiar el efecto de 180 pasos de SFT con lr 1e-5 sobre el comportamiento de seguridad de Qwen3.5-4B.
- Reproduccion de experimentos: los hiperparametros, la revision base y el identificador de ejecucion permiten replicar el entrenamiento y contrastar resultados con otras ejecuciones del mismo barrido de learning rates.
- Evaluacion de alineacion en modelos multimodales: al conservar la torre de vision, permite analizar como afecta el SFT de seguridad a entradas imagen-texto.
- Generacion de trayectorias de razonamiento: util para estudiar formatos de supervision que incluyen razonamiento, respuesta y EOS en un solo objetivo.
- Base para experimentos de destilacion: las 7.655 trayectorias de profesor de STAR-1 y STAR-Benign documentadas permiten disenar variantes de destilacion con otros presupuestos de pasos.
- Validacion de pipelines de exportacion: la verificacion de las 738 claves y formas de tensores lo convierte en un caso de prueba para tooling de conversion de checkpoints nativos a safetensors.
- Prototipado interno de asistentes multimodales con requisitos de seguridad: solo en entornos controlados y tras evaluacion propia, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirman puntuaciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parametros), mas overhead de activaciones y cache KV; en la practica, 12-16 GB en funcion de la longitud de contexto.
- Cuantizacion a 8 bits: entorno a 5 GB de pesos; a 4 bits, entorno a 2,5-3 GB, mas overhead. No se ofrecen variantes cuantizadas en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegue con contexto largo y concurrencia; RTX 4090 (24 GB) suficiente para inferencia en BF16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion, en tarjetas de 8-12 GB; el limite practico lo marca la torre de vision y la longitud de contexto.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para serving; llama.cpp/Ollama solo si se generan conversiones GGUF propias, no incluidas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-SFT-STAR (este) | 4,66 B | no disponible | imagen-texto | Apache 2.0 | Checkpoint SFT de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | 4 B (aprox.) | no disponible | imagen-texto | Apache 2.0 (segun este repo) | Modelo original sin ajuste de seguridad; referencia directa |
| Alternativas de safety tuning multimodales de ~4 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No se han publicado evaluaciones: la model card no afirma ninguna puntuacion, por lo que no hay evidencia cuantitativa de mejora en seguridad frente al base.
- Riesgo de alucinacion y de degradacion de capacidades tras el SFT: sin benchmarks no puede descartarse una perdida de rendimiento en tareas generales.
- Sesgos: no documentados; el modelo hereda los del base Qwen3.5-4B y los de las trayectorias de profesor de STAR-1 y STAR-Benign.
- Idiomas soportados no declarados: no hay garantia de comportamiento multilingue mas alla del base.
- Longitud de contexto no especificada: no debe asumirse la del base sin verificacion.
- El MTP no fue entrenado y los tensores de vision se conservan del base; el ajuste afecta solo a los tensores de texto.
- Trazas de razonamiento supervisadas: pueden filtrar contenido del profesor y requerir filtrado en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; se recomienda evaluacion propia antes de cualquier despliegue.
- Repositorio de muy baja adopcion (13 descargas, 0 likes) y sin mantenimiento declarado.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-SFT-STAR-lr1e-5-E3-step180
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
