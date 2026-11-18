# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step243

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step243 es un checkpoint de ajuste supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El entrenamiento se ha orientado a seguridad (safety tuning) mediante destilación desde un modelo profesor de mayor tamano (Qwen3.8-27B) sobre una mezcla de ocho fuentes de datos, combinando ejemplos benignos y ejemplos de comportamiento danino. El resultado es un modelo de 4.659.865.088 parametros (~4,66 mil millones) con pipeline image-text-to-text, lo que indica que conserva la torre de vision del modelo base.

La relevancia de esta publicacion es doble. Por un lado, documenta con inusual detalle el proceso de entrenamiento (numero de actualizaciones del optimizador, batch global, tasas de aprendizaje, semilla, revision exacta del modelo base y del profesor), lo que facilita la reproducibilidad. Por otro lado, es un checkpoint intermedio: solo se completaron 243 de las 728 actualizaciones previstas del optimizador, por lo que no representa el resultado final de la campana de entrenamiento. La model card no declara ninguna puntuacion de evaluacion.

El modelo se distribuye con licencia Apache-2.0, pesos en safetensors para transformers y una ventana de secuencia de entrenamiento de 32.768 tokens. Es un artefacto adecuado para experimentacion e investigacion en alineamiento y seguridad, no para despliegues en produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-4B-Base; incluye torre de vision y pesos MTP (multi-token prediction) heredados del base |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (longitud maxima de secuencia usada en entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en BF16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (738 tensores en el export de Hugging Face), mas configuracion y assets de tokenizer/processor |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base en la revision `1001bb4d826a52d1f399e183466143f4da7b741b`. Se trata de una arquitectura transformer multimodal: el pipeline declarado es image-text-to-text y la model card confirma que los pesos de vision y los pesos MTP se conservan intactos del modelo base, sin ajuste. Solo se han entrenado los tensores de texto. El export verificado cubre 306 tensores nativos de texto con conversion inversa exacta y comprobacion de finitud de pesos, ademas de las 738 claves y formas del formato Hugging Face.

El entrenamiento es una destilacion SFT desde Qwen/Qwen3.8-27B (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) sobre 46.558 trayectorias de profesor aceptadas, con 2 epocas planificadas, batch global de 128, BF16, semilla 42, learning rate pico de 1e-5 y minimo de 2e-6, con un 10 % de warmup. La funcion de perdida cubre tanto el razonamiento como la respuesta del profesor (`cot_and_answer`). La mezcla de datos combina ocho fuentes: STAR-1, STAR-Benign, AgentAlign harmful, AgentAlign benign, CodeSafetyBench, Magicoder, Difficult Advice y WildJailbreak benign. Se seleccionaron todas las trayectorias completas validas y se excluyeron los ejemplos que excedian el contexto. El estudiante se entrena con la plantilla de chat nativa del base y el mensaje de sistema `You are a helpful assistant.`, sin anadir la politica del profesor al contexto. El checkpoint publicado corresponde a la actualizacion 243 de 728 (iteracion nativa 242) de la ejecucion `qwen35-base-mixture8-wildjailbreak-2ep6ckpt-sft-native-20261115-v5-01`.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat nativa del modelo base.
- Razonamiento encadenado (chain-of-thought): el entrenamiento incluye las trazas de razonamiento del profesor, por lo que el modelo aprende a producir pasos intermedios antes de la respuesta.
- Procesamiento de imagen y texto (image-text-to-text), heredado de la torre de vision del base, aunque dicha torre no se ha ajustado.
- Comportamiento orientado a seguridad: la mezcla incluye datos de rechazo y de conducta benigna (WildJailbreak benign, STAR-Benign, AgentAlign benign) junto con ejemplos adversarios.
- Generacion de codigo, dado que la mezcla incorpora CodeSafetyBench y Magicoder.
- Capacidad de seguir instrucciones con mensaje de sistema.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponible en la informacion proporcionada, aunque la presencia de AgentAlign sugiere datos de ese dominio.
- Capacidades multilingues: no disponible.
- Modo thinking explicito: no disponible como funcionalidad declarada; el modelo emite razonamiento por efecto del entrenamiento, no por un modo conmutable documentado.

## Casos de uso

- Investigacion en alineamiento y seguridad: el checkpoint sirve como punto de comparacion intermedio (paso 243 de 728) para estudiar como evoluciona el comportamiento de rechazo y la utilidad a lo largo del entrenamiento SFT.
- Filtrado y moderacion de contenido en prototipos: el modelo puede clasificar o reescribir respuestas potencialmente daninas en un pipeline de pre-produccion, aprovechando los datos de AgentAlign harmful y WildJailbreak de su entrenamiento.
- Generacion de codigo asistida con supervision de seguridad: al haberse entrenado con CodeSafetyBench y Magicoder, es util para experimentar con asistentes de programacion que senalan practicas inseguras en el codigo generado.
- Destilacion y estudio de mezclas de datos: la model card documenta con precision las ocho fuentes y los hiperparametros, lo que permite reproducir o ablacionar la receta en un entorno de investigacion.
- Evaluacion de robustez frente a jailbreaks: util como sujeto de pruebas en bancos de red teaming para medir la eficacia del safety tuning con datos benignos de WildJailbreak.
- Prototipado de asistentes multimodales ligeros: con ~4,66 mil millones de parametros y soporte image-text-to-text, permite montar demos de pregunta-respuesta sobre imagenes en una sola GPU, aceptando que la torre de vision no ha sido ajustada.
- Analisis de trazas de razonamiento: al haberse entrenado sobre `cot_and_answer`, es adecuado para estudiar la calidad y fidelidad de cadenas de razonamiento generadas por destilacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara explicitamente que no afirma ninguna puntuacion de evaluacion.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,3 GB solo para pesos (coincide con el tamano del repo), mas overhead de activaciones y cache KV; en la practica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en FP8/INT8 (si se cuantiza por cuenta propia, no hay versiones publicadas): en torno a 5-6 GB de pesos.
- VRAM estimada en INT4 (cuantizacion propia): en torno a 3 GB de pesos; requiere generar el GGUF o AWQ uno mismo, ya que el repositorio no los incluye.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o inferencia con contexto largo (32.768 tokens); L40S o RTX 6000 Ada para servicio; RTX 4090 (24 GB) para inferencia en BF16 con contexto reducido.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion a 8 o 4 bits, en tarjetas de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Despliegue: transformers es la via soportada de forma nativa (el repo es compatible con endpoints). vLLM, TGI, llama.cpp u Ollama requeririan conversion previa y no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8 (este) | ~4,66 B | 32.768 tokens (entrenamiento) | Apache-2.0 | Checkpoint intermedio (243/728), multimodal, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | ~4,66 B | no disponible | Apache-2.0 (heredada) | Modelo base sin ajuste de seguridad; referencia directa |
| Qwen/Qwen3.8-27B (profesor) | ~27 B (estimado por el nombre) | no disponible | no disponible | Profesor usado para destilacion; mayor coste de inferencia |
| Alternativas de safety tuning de ~4 B | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros checkpoints comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint intermedio: solo se completaron 243 de las 728 actualizaciones del optimizador, por lo que el ajuste esta incompleto y el comportamiento puede ser inestable o inconsistente.
- Ausencia total de evaluacion: no hay benchmarks, ni mediciones de tasa de rechazo, ni pruebas de utilidad; cualquier uso en produccion exige una evaluacion propia.
- La torre de vision no se ha ajustado: las capacidades multimodales provienen del base y no han recibido safety tuning, por lo que pueden responder a entradas visuales adversarias sin las salvaguardas del texto.
- Los pesos MTP tampoco se han ajustado, lo que puede producir discrepancias si se usa decodificacion especulativa con esos cabezales.
- Riesgo de alucinacion: inherente a los modelos destilados de razonamiento; las trazas `cot_and_answer` pueden contener pasos plausibles pero incorrectos.
- Sesgos: no documentados; la mezcla de datos incluye fuentes de seguridad y codigo, pero no se describe su composicion demografica ni linguistica.
- Idiomas: no declarados; el entrenamiento usa la plantilla de chat nativa con un mensaje de sistema en ingles, lo que sugiere un sesgo hacia el ingles sin confirmacion.
- Licencia Apache-2.0 permisiva para uso comercial, pero el autor no ofrece garantias y el estado intermedio del checkpoint desaconseja su uso comercial directo.
- El repositorio excluye estado del optimizador, RNG, credenciales y logs, de modo que no es posible reanudar el entrenamiento desde este checkpoint.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-lr1e-5-step243
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
