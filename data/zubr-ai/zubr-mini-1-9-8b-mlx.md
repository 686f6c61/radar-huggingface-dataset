# Zubr-AI/zubr-mini-1.9-8b-mlx

## Resumen

Zubr-mini-1.9-8b-mlx es un ajuste fino (finetune) del modelo Mistral Ministral-3-8B-Instruct-2512, publicado por el usuario Zubr-AI en Hugging Face. Se distribuye en formato MLX, el framework de Apple para ejecutar modelos de aprendizaje automatico de forma nativa en chips de la serie M (M1, M2, M3, M4), lo que lo orienta a inferencia local en hardware Apple Silicon. El modelo conserva la etiqueta de pipeline `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base.

La relevancia de esta ficha es limitada: se trata de un modelo con cero descargas y un unico "like" en el momento de la consulta, publicado en noviembre de 2026, y del que no se han documentado detalles de entrenamiento, datos utilizados ni resultados de evaluacion. La model card publica unicamente metadatos (licencia, idiomas, modelo base), sin seccion de descripcion tecnica, benchmarks ni instrucciones de uso.

Por tanto, esta ficha recoge los datos verificables disponibles y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. El lector debe tratar cualquier afirmacion sobre calidad o rendimiento con cautela y remitirse al modelo base (Ministral-3-8B-Instruct) para obtener referencias de rendimiento conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Mistral Ministral-3-8B-Instruct; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 8B (segun el nombre del modelo y el modelo base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato MLX; el repo pesa 8,9 GB, compatible con pesos en precision reducida, sin detalle) |
| Idiomas soportados | ru, be, en, es, fr, de, nl, ja, it, pl, da, ro, el, uk, br, ar, fa, tr, bn, id, hi, ne, pa, ta, te, zh, pt, ga, uz, tg, tk, lt, sr, bg, sv, fi, ca, gl, is, mr, kn, kk, bs, he, ur, cy, rm, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (libreria `zubr-mlx`); modelo base en GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo mas alla de que deriva de `mistralai/Ministral-3-8B-Instruct-2512-GGUF`. El nombre y el tamano del repositorio (8,9 GB) son coherentes con un transformer denso de aproximadamente 8.000 millones de parametros convertido a formato MLX, pero el autor no detalla ni la configuracion de capas, ni el tipo de atencion, ni si se ha aplicado alguna modificacion estructural.

Tampoco hay datos sobre el proceso de ajuste fino: se desconoce el volumen de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO o SFT, y que objetivos concretos perseguia el ajuste. La unica informacion tecnica explicita es la libreria de publicacion (`zubr-mlx`), que indica una conversion al ecosistema MLX de Apple para ejecucion local en Apple Silicon.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Instruct.
- Procesamiento de imagen y texto (`image-text-to-text` segun la etiqueta de pipeline), presumiblemente heredado del modelo base multimodal; sin confirmacion en la model card.
- Cobertura multilingue amplia: 49 idiomas declarados, con especial presencia de lenguas eslavas (ru, be, uk, pl, bg, sr, etc.) y europeas occidentales.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX permite ejecutar el modelo de forma nativa en chips M1/M2/M3/M4 sin depender de CUDA, adecuado para prototipado y uso personal en estaciones de trabajo Apple.
- Traduccion y generacion multilingue: la cobertura declarada de 49 idiomas, con enfasis en lenguas eslavas y europeas, lo hace util para tareas de traduccion o redaccion en esos idiomas, siempre que se valide la calidad real por idioma.
- Asistentes conversacionales de escritorio: al ejecutarse en local, puede integrarse en aplicaciones de chat sin enviar datos a la nube, lo que resulta relevante para entornos con requisitos de privacidad.
- Procesamiento de documentos con imagen y texto: la etiqueta `image-text-to-text` sugiere uso potencial en tareas de descripcion de imagenes o respuesta a preguntas sobre capturas y documentos escaneados, pendiente de validacion empirica.
- Experimentacion e investigacion: como finetune comunitario de un modelo Mistral, sirve para estudiar el efecto del ajuste fino y comparar comportamiento frente al modelo base.
- Educacion y demos tecnicas: su licencia Apache 2.0 y su tamano de 8B lo hacen manejable para talleres y demostraciones de despliegue local en macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 8,9 GB, por lo que se requiere al menos esa cantidad de memoria unificada libre; en la practica, se recomienda un Mac con 16 GB o mas para margen de contexto y overhead.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para GPU NVIDIA ni AMD en su formato actual.
- Cabe en equipos de consumo: si, en Mac con 16 GB o mas de memoria unificada; en configuraciones de 8 GB puede ser ajustado.
- Opciones de despliegue: el ecosistema MLX de Apple (libreria `mlx`, `mlx-lm`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zubr-mini-1.9-8b-mlx | 8B | no disponible | Apache 2.0 | MLX | Finetune comunitario, sin benchmarks publicados |
| mistralai/Ministral-3-8B-Instruct-2512 | 8B | no disponible en esta ficha | no disponible | GGUF (y otros) | Modelo base oficial de Mistral; referencia de rendimiento |
| Mistral 7B Instruct | 7B | 32k (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar con amplia adopcion |

La comparacion se limita a parametros y licencia, ya que no hay datos de rendimiento del modelo Zubr. Para evaluar calidad conviene remitirse a las evaluaciones publicadas del modelo base Ministral-3-8B-Instruct.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay model card descriptiva, ni datos de entrenamiento, ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Riesgo de alucinacion desconocido: al no haber evaluaciones, no se puede acotar el comportamiento del modelo en tareas factuales.
- Sesgos no documentados: el autor no informa sobre sesgos de genero, etnicos, linguisticos o culturales.
- Cobertura multilingue declarada pero no verificada: los 49 idiomas listados no implican calidad homogenea; conviene validar cada idioma de interes.
- Restricciones de plataforma: el formato MLX limita su uso a hardware Apple Silicon; no es portable a GPU NVIDIA sin conversion previa.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el finetune cumple las condiciones del modelo base y que no incorpora datos con restricciones adicionales.
- Madurez: cero descargas y un unico "like" en el momento de la consulta indican que es un modelo sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zubr-AI/zubr-mini-1.9-8b-mlx
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-GGUF
- Framework MLX (Apple): https://github.com/ml-explore/mlx
- Documentacion de Mistral AI: https://docs.mistral.ai/
