# XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-math

## Resumen

DN-MOPD-Qwen3.5-2B-teacher-math es un ajuste fino de Qwen/Qwen3.5-2B desarrollado por Xin Li (usuario XINLI1997) que actua como experto congelado en matematicas dentro del metodo DN-MOPD (Domain-Normalized Multi-Teacher On-Policy Distillation), presentado en el articulo arXiv:2609.35347. No es un modelo pensado para uso general directo: es una de las tres piezas docentes del mismo tamano (matematicas, codigo e instrucciones) que se emplean para destilar conocimiento sobre estudiantes Qwen3.5 de 2B, 4B y 9B. El modelo se entreno con GRPO sobre indicaciones de matematicas con recompensa verificable, partiendo del modelo base y sin congelar nada mas que el modelo base en la fase de destilacion.

La arquitectura corresponde a la clase Qwen3_5ForConditionalGeneration, un transformer multimodal (pipeline image-text-to-text) con vision encoder heredado del modelo base, aunque el entrenamiento y la evaluacion de este checkpoint se hicieron solo con texto. El checkpoint pesa 2.213.241.664 parametros en bfloat16 (repo de 4,4 GB) y se exporta en formato Hugging Face, omitiendo los 15 tensores de prediccion multi-token (mtp.*) del modelo base, por lo que la decodificacion especulativa basada en MTP no esta disponible.

Su relevancia es metodologica mas que de producto: sirve como referencia reproducible de un profesor especializado de 2B, con receta de entrenamiento publica (scripts en recipes/qwen3.5) y evaluacion en el articulo. En la tabla 2 del paper, este profesor de matematicas obtiene 22,1 % en la media de AIME25/AIME26, frente al 17,6 % del estudiante inicial Qwen3.5-2B, a costa de una ligera caida en codigo (13,4 % frente a 11,3 %). El modelo esta pensado para el formato de chat sin modo pensamiento (enable_thinking=False).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal image-text-to-text, clase de Qwen3.5) |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | no aplica (no se indica que sea MoE; el checkpoint es denso) |
| Longitud de contexto | no disponible en la ficha; la configuracion de vLLM usada en el paper fija max_model_len=32768 y la evaluacion genera hasta 16.384 tokens |
| Tipos de cuantizacion | no disponible (los pesos se publican en bfloat16; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | en (solo ingles declarado; el resto de idiomas del modelo base no se evaluaron) |
| Licencia | apache-2.0 (la misma del modelo base) |
| Formato de pesos | safetensors (formato Hugging Face, bfloat16, exportado desde el checkpoint FSDP de entrenamiento) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-2B y mantiene su arquitectura: un transformer multimodal (Qwen3_5ForConditionalGeneration) con vision encoder que se conserva intacto respecto al base. La ficha es explicita en que el entrenamiento y la evaluacion usaron unicamente texto, por lo que las capacidades de vision no se entrenaron ni se midieron en este derivado. El checkpoint se exporta sin los 15 tensores mtp.* (multi-token prediction) del modelo base; el resto de tensores conserva nombres y formas originales, y config.json, tokenizer y chat_template.jinja son los del base sin modificar.

El entrenamiento es un GRPO puro sobre indicaciones de matematicas con recompensa verificable, sin termino KL ni de entropia. Los hiperparametros documentados son: 128 indicaciones por rollout, 8 respuestas por indicacion, 256 respuestas por paso de optimizador, muestreo dinamico que descarta grupos de indicaciones sin variacion en la recompensa (como maximo 8 lotes de generacion por rollout), longitud de indicacion <= 2.048 tokens, longitud de respuesta <= 8.192 tokens y temperatura 1.0. El optimizador es Adam con learning rate 1e-6 constante tras 10 actualizaciones de calentamiento, betas (0,9; 0,98), weight decay 0,1 y recorte de gradiente de 1,0. El entrenamiento se limito a 400 actualizaciones con semilla 42. La innovacion tecnica relevante (normalizacion por dominio del feedback a nivel de token en la destilacion multi-profesor) reside en el metodo DN-MOPD, no en este checkpoint aislado.

## Capacidades

- Generacion de texto y razonamiento matematico: resolucion de problemas aritmeticos, algebraicos y de competicion (AIME25/AIME26 en la evaluacion del paper), con salida en formato \boxed{} cuando se solicita.
- Generacion de codigo: capacidad residual del modelo base, aunque el ajuste la desplaza parcialmente hacia matematicas (13,4 % de media en LiveCodeBench v5/v6 en la tabla del paper).
- Seguimiento de instrucciones: mantiene el rendimiento de tareas IF del base (44,7 % de media en IFEval/IFBench en el paper).
- Formato de chat sin modo pensamiento: el modelo se entreno y evaluo con enable_thinking=False; el modo pensamiento no se valido.
- Capacidades multimodales: el vision encoder existe en el checkpoint (pipeline image-text-to-text), pero no se entreno ni evaluo con imagenes en este derivado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Multilingue: no evaluado; solo se declara ingles.

## Casos de uso

- Profesor congelado en pipelines de destilacion: su proposito nativo es generar respuestas de referencia y log-ratios a nivel de token sobre las que un estudiante Qwen3.5-2B aprende, con la normalizacion por dominio descrita en DN-MOPD.
- Reproduccion de resultados academicos: permite replicar la fila "Math expert" de la tabla 2 del paper usando la receta de recipes/qwen3.5 y las semillas indicadas (42).
- Generacion de datos sinteticos de matematicas: puede producir soluciones candidatas con recompensa verificable para ampliar datasets de entrenamiento de modelos pequenos.
- Evaluacion comparativa de destilacion multi-profesor: sirve como linea base de un especialista de 2B frente al estudiante inicial y frente a los otros dos profesores (codigo e IF) del mismo tamano.
- Pruebas de infraestructura de inferencia: con 2,21 B de parametros, es util para validar configuraciones de vLLM (0.18.0 en el paper), plantillas de chat con enable_thinking=False y limites de generacion de hasta 16.384 tokens.
- Prototipado de tutores de matematicas de bajo coste en ingles: al caber en GPUs de consumo, permite desplegar un asistente de ejercicios matematicos sin acceso a modelos mayores, aceptando su menor robustez fuera de dominio.
- Investigacion sobre especializacion frente a generalidad: su tabla de resultados cuantifica el intercambio entre ganancia en matematicas y perdida en otras tareas, util para estudiar compromisos de entrenamiento RL por dominio.

## Benchmarks y rendimiento

Datos de la tabla 2 del paper (Qwen3.5-2B; cada dominio promedia sus dos tareas: AIME25/AIME26, LiveCodeBench v5/v6, IFEval/IFBench). Porcentajes con semilla de entrenamiento 42, limite de evaluacion de 16.384 tokens, plantilla sin modo pensamiento, temperatura 1.0, top-p 1.0 y semilla de generacion 42. AIME: avg@64. LiveCodeBench v5/v6 (167/175 problemas disjuntos): avg@6. IFEval/IFBench: exactitud estricta de indicacion, avg@16. Total: media de las seis puntuaciones de tarea.

| Modelo | Math | Code | IF | Total |
|---|---:|---:|---:|---:|
| DN-MOPD-Qwen3.5-2B-teacher-math (experto en matematicas) | 22,1 | 13,4 | 44,7 | 26,7 |
| Estudiante inicial (Qwen3.5-2B) | 17,6 | 11,3 | 43,3 | 24,0 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales para este checkpoint.

## Requisitos de hardware

- VRAM para inferencia: los pesos en bfloat16 ocupan aproximadamente 4,4 GB (2,21 B de parametros). Con cache KV para contextos largos, una estimacion razonable es de 6 a 10 GB en bf16 segun la longitud de contexto; no hay cifras oficiales de VRAM en la informacion disponible.
- GPU de consumo: cabe holgadamente en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs de 8 GB es probable que quepa con cuantizacion, pero no se publican pesos cuantizados.
- GPU de centro de datos: A100, H100, L40S y similares no son necesarias por tamano, aunque el paper uso vLLM 0.18.0 para las evaluaciones a gran escala (avg@64 en AIME).
- Formatos de despliegue documentados: vLLM (con max_model_len=32768 y chat_template_kwargs con enable_thinking=False) y transformers >= 5 (el entorno de entrenamiento del paper uso 5.12.1, con AutoModelForImageTextToText).
- Opciones no documentadas: no hay instrucciones ni artefactos para llama.cpp, Ollama, TGI ni cuantizaciones GGUF en la informacion disponible. La decodificacion especulativa basada en MTP no esta disponible por la omision de los tensores mtp.*.
- Latencia y throughput: no disponibles. Los parametros de generacion documentados son temperatura 1.0, top-p 1.0, max_tokens 16384 y seed 42.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Math / Code / IF / Total, tabla 2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-2B-teacher-math | 2,21 B | no disponible (vLLM del paper: 32768) | 22,1 / 13,4 / 44,7 / 26,7 | apache-2.0 | pesos safetensors en Hugging Face; endpoint en FriendliAI |
| Qwen3.5-2B (modelo base, estudiante inicial) | 2 B (dato del paper) | no disponible | 17,6 / 11,3 / 43,3 / 24,0 | apache-2.0 | Hugging Face (Qwen/Qwen3.5-2B) |
| DN-MOPD-Qwen3.5-2B (estudiante destilado) | 2 B (dato del paper) | no disponible | no disponible en la informacion proporcionada | apache-2.0 | Hugging Face (XINLI1997/DN-MOPD-Qwen3.5-2B) |
| Otros profesores del pool (code, IF) de 2B | 2 B (dato del paper) | no disponible | no disponible en la informacion proporcionada | apache-2.0 (presumible, no confirmado) | no localizados en la busqueda web |

## Limitaciones y advertencias

- Especialista de dominio unico: sus mejoras se concentran en matematicas; en codigo la variacion es pequena (13,4 frente a 11,3) y el resto de capacidades no mejora.
- Modo pensamiento no validado: el modelo se entreno y evaluo en formato sin pensamiento (enable_thinking=False); activar thinking mode puede degradar la calidad de forma no medida.
- Modalidad multimodal no entrenada: aunque el checkpoint incluya vision encoder, no hay evidencia de rendimiento con imagenes; se desconoce su comportamiento real fuera de texto.
- Idiomas: solo se declara ingles y no se evaluaron otros idiomas; el soporte multilingue del base no esta garantizado en este derivado.
- Sin decodificacion especulativa MTP: los tensores mtp.* se omitieron en la exportacion, por lo que no se puede usar esa aceleracion; la decodificacion ordinaria no se ve afectada.
- Riesgo de alucinacion: no hay evaluacion de seguridad ni de tasas de alucinacion en la informacion disponible; como modelo de razonamiento matematico pequeno (2B), es esperable que produzca cadenas erroneas en problemas fuera de su distribucion de entrenamiento, aunque no se cuantifica.
- Comportamiento de seguridad no evaluado: la ficha indica explicitamente que no se midio mas alla del modelo base.
- Longitudes de entrenamiento limitadas: respuestas de como maximo 8.192 tokens durante el entrenamiento, lo que acota el tipo de problemas vistos.
- Licencia: apache-2.0, sin restricciones adicionales conocidas para uso comercial, heredada del modelo base.
- Trazabilidad: creado y actualizado el 2026-10-01, con 11 descargas y 0 likes; la adopcion publica es practicamente nula, lo que limita la validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-math
- Articulo (arXiv): https://arxiv.org/abs/2609.35347
- Pagina del proyecto DN-MOPD: https://lixin.ai/DN-MOPD/
- Repositorio de codigo: https://github.com/LiXin97/DN-MOPD
- Recetas de entrenamiento (Qwen3.5): https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Estudiante DN-MOPD-Qwen3.5-2B: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B
- Dataset DN-MOPD-Data: https://huggingface.co/datasets/XINLI1997/DN-MOPD-Data
- Endpoint en FriendliAI: https://friendli.ai/models/XINLI1997/DN-MOPD-Qwen3.5-2B
