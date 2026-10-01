# XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-if

## Resumen

DN-MOPD-Qwen3.5-2B-teacher-if es un ajuste fino de Qwen/Qwen3.5-2B publicado por el usuario XINLI1997 como parte del trabajo *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation* (arXiv:2609.35347). No es un modelo de proposito general: es el **experto en seguimiento de instrucciones (IF)** que actua como profesor congelado dentro de un esquema de destilacion multi-profesor on-policy. El paper entrena tres expertos del mismo tamano (matematicas, codigo e IF) y hace que estudiantes de 2B aprendan de ellos; esta ficha corresponde unicamente al experto IF.

Tecnicamente es un modelo denso de 2.213.241.664 parametros (2,2B) en bfloat16, derivado por fine-tuning del modelo base Qwen3.5-2B con GRPO sobre prompts de instruction-following con recompensa verificable, sin termino KL ni de entropia. La etiqueta de pipeline es `image-text-to-text` y el encoder de vision se hereda del modelo base, pero tanto el entrenamiento como la evaluacion del paper se hicieron solo con texto y en formato de chat **non-thinking** (`enable_thinking=False`).

Su relevancia es doble. Por un lado, es un artefacto de investigacion: permite reproducir la receta de destilacion y sirve como generador de datos de alta calidad en IF para destilar hacia modelos mas pequenos. Por otro lado, su utilidad practica fuera del pipeline de destilacion es limitada: es un especialista de un solo dominio y, segun los propios datos del paper, puntua por debajo del modelo inicial en matematicas (15,6 frente a 17,6) y por debajo en codigo en el modelo base solo en el agregado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (clase `Qwen3_5ForConditionalGeneration`, familia Qwen3.5); el encoder de vision se hereda del modelo base |
| Parametros totales | 2.213.241.664 (2,2B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de vLLM de la model card configura `max_model_len=32768` y la evaluacion del paper genera hasta 16.384 tokens nuevos |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en bfloat16 (no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (la misma que el modelo base) |
| Formato de pesos | safetensors (bfloat16), exportados desde el checkpoint de entrenamiento FSDP; `config.json`, tokenizer y `chat_template.jinja` sin cambios respecto al modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y conserva su estructura completa, incluido el encoder de vision, aunque este no se entreno ni se evaluo. El checkpoint exportado usa la clase `Qwen3_5ForConditionalGeneration` en bfloat16 y **omite los 15 tensores de multi-token prediction (`mtp.*`)** del modelo base; en consecuencia, la decodificacion especulativa basada en MTP no esta disponible con estos pesos. El resto de tensores mantiene los nombres y las formas del modelo base, y la decodificacion ordinaria no se ve afectada (las evaluaciones del paper se hicieron exactamente con estos ficheros).

El entrenamiento es GRPO sobre prompts de instruction-following con una recompensa verificable, sin termino KL ni de entropia, durante 400 actualizaciones (ejecuciones limitadas a ese maximo) con semilla 42. El batching usa 128 prompts por rollout y 8 respuestas por prompt, lo que da 256 respuestas por paso de optimizador; el muestreo dinamico descarta grupos de prompts sin variacion de recompensa, con un maximo de 8 lotes de generacion por rollout. Los limites de longitud son 2.048 tokens de prompt y 8.192 tokens de respuesta, con temperatura 1,0. El optimizador es Adam con learning rate 1e-6 constante tras 10 actualizaciones de warm-up, betas (0,9; 0,98), weight decay 0,1 y recorte de gradiente 1,0. Las recetas completas y los scripts de lanzamiento estan en `recipes/qwen3.5/` del repositorio de codigo.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat no-thinking; es el formato con el que fue entrenado y evaluado.
- Seguimiento estricto de instrucciones: es la unica capacidad para la que fue optimizado, con 52,8 puntos agregados en IFEval/IFBench (precision estricta de prompt, avg@16), frente a 43,3 del modelo inicial.
- Generacion de codigo y resolucion de problemas matematicos de forma residual (12,5 en LiveCodeBench v5/v6 y 15,6 en AIME25/AIME26), pero como especialista no es competitivo en esos dominios.
- Produccion de texto con formato controlado y respuestas verificables, aprovechable para sintesis de datos de entrenamiento con recompensa.
- Capacidades multimodales: el encoder de vision se hereda del modelo base, pero no fueron entrenadas ni evaluadas; no deben asumirse.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking: explicitamente fuera del alcance; el modelo se entreno y evaluo con `enable_thinking=False`.
- Capacidades multilingues: no evaluadas; la model card declara unicamente ingles y advierte que otros idiomas no se evaluaron mas alla del comportamiento del modelo base.

## Casos de uso

- Destilacion on-policy hacia estudiantes de 2B: es su proposito original. Se usa congelado como profesor que genera rollouts sobre los mismos prompts que el estudiante, aportando la senal de dominio IF dentro del esquema DN-MOPD.
- Generacion de datos sinteticos de instruction-following: con temperatura 1,0 y hasta 16.384 tokens de salida permite producir grandes volumenes de respuestas etiquetadas para ajuste supervisado o preferencias, filtrando despues con la recompensa verificable.
- Ajuste por preferencias y RLAIF: al haber sido entrenado con GRPO y recompensa verificable, es adecuado como generador de candidatos que un modelo de recompensa puntue, en lugar de recurrir a anotacion humana.
- Evaluacion comparativa de profesores: sirve como linea base de dominio IF en experimentos de destilacion multi-profesor, para medir la brecha entre profesor y estudiante antes y despues del entrenamiento.
- Asistente de instrucciones en ingles con contexto largo: con `max_model_len=32768` configurado en vLLM puede gestionar conversaciones multi-turno largas o documentos extensos cuando la tarea es puramente de seguimiento de instrucciones y formato.
- Prototipado e investigacion en una sola GPU: con 2,2B parametros y pesos bfloat16 de ~4,4 GB puede desplegarse localmente (vLLM o transformers) para experimentos de destilacion, ablaciones y pruebas de recetas sin infraestructura dedicada.
- Componente de un ensemble de especialistas: combinado con los expertos de matematicas y codigo del mismo paper, puede enrutarse por dominio, reservando este checkpoint para las consultas de instruccion y formato.

## Benchmarks y rendimiento

Datos de la Tabla 2 del paper (Qwen3.5-2B). Cada dominio promedia sus dos tareas: AIME25/AIME26, LiveCodeBench v5/v6 e IFEval/IFBench. Puntuaciones en porcentaje, semilla de entrenamiento 42, limite de evaluacion de 16.384 tokens, plantilla de chat non-thinking, temperatura 1,0, top-p 1,0 y semilla de generacion 42. AIME: avg@64; LiveCodeBench v5/v6 (167/175 problemas disjuntos): avg@6; IFEval/IFBench: precision estricta de prompt, avg@16; Total: media de las seis puntuaciones de tarea.

| Modelo | Matematicas | Codigo | IF | Total |
|---|:---:|:---:|:---:|:---:|
| DN-MOPD-Qwen3.5-2B-teacher-if (experto IF) | 15,6 | 12,5 | 52,8 | 27,0 |
| Estudiante inicial (Qwen3.5-2B) | 17,6 | 11,3 | 43,3 | 24,0 |

No se han publicado en la informacion disponible mas resultados de benchmarks (MMLU, HumanEval u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,4 GB solo para pesos en bfloat16 (dato coherente con el tamano del repositorio); a ello hay que sumar cache KV y activaciones, que crecen con la longitud de contexto. En cuantizacion de 8 bits serian ~2,2 GB y en 4 bits ~1,1 GB, aunque **no se distribuyen pesos cuantizados** de este checkpoint.
- GPU recomendadas: no hay recomendaciones oficiales en la model card. Para el pipeline del paper se uso vLLM 0.18.0; una A100 o H100 permite lotes grandes y contextos de 32k sin fragmentar, mientras que una RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con margen amplio.
- Cabe en GPU de consumo: si. Con ~4,4 GB de pesos en bfloat16 entra en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090), dejando el resto de VRAM para cache KV.
- Opciones de despliegue: vLLM (version usada en el paper: 0.18.0), con `max_model_len=32768` y `chat_template_kwargs={"enable_thinking": False}`; y transformers, que requiere `transformers>=5` para Qwen3.5 (el entorno de entrenamiento del paper uso 5.12.1) con `AutoModelForImageTextToText`. No se documentan en la model card otras opciones (llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponibles. La decodificacion especulativa basada en MTP no es posible con este checkpoint al haberse omitido los tensores `mtp.*`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Matematicas | Codigo | IF | Total | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-2B-teacher-if | 2,2B | no disponible (ejemplo vLLM: 32.768) | 15,6 | 12,5 | 52,8 | 27,0 | Apache-2.0 | HuggingFace (6 descargas, 0 likes a fecha de la ficha) |
| Qwen3.5-2B (estudiante inicial y modelo base) | 2,2B (mismo `base_model`) | no disponible | 17,6 | 11,3 | 43,3 | 24,0 | Apache-2.0 | HuggingFace, mantenido por el equipo Qwen |
| Expertos de matematicas y codigo del mismo paper | 2,2B (mismo tamano segun la model card) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | No incluidos en la informacion proporcionada |

Frente a modelos de 2B de otras familias (Llama, Gemma, Phi) no se dispone de datos comparables en la informacion proporcionada, por lo que no se incluye comparacion.

## Limitaciones y advertencias

- Es un especialista de un unico dominio. El propio autor advierte que rinde por debajo del modelo inicial en matematicas (15,6 frente a 17,6) y que solo fue entrenado para instruction-following.
- Entrenado con respuestas de como maximo 8.192 tokens y evaluado unicamente en modo non-thinking; el modo thinking no fue evaluado.
- Las entradas multimodales no fueron entrenadas ni evaluadas, pese a que la etiqueta de pipeline sea `image-text-to-text` y el encoder de vision se herede del modelo base.
- Idiomas: solo ingles declarado. El comportamiento en otros idiomas no se evaluo mas alla de lo que haga el modelo base.
- Comportamiento de seguridad no evaluado: no hay datos de alineamiento de seguridad especificos para este checkpoint.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el entrenamiento con recompensa verificable en IF reduce errores de formato, no necesariamente de contenido factual.
- La omision de los 15 tensores `mtp.*` desactiva la decodificacion especulativa basada en MTP; conviene tenerlo en cuenta al planificar latencia en produccion.
- Licencia Apache-2.0, la misma del modelo base, por lo que no anade restricciones de uso comercial mas alla de las del propio Qwen3.5-2B; conviene revisar igualmente los terminos del modelo base.
- Adopcion practica muy baja: 6 descargas y 0 likes en el momento de redactar esta ficha. Es un artefacto de investigacion, no un modelo con soporte o mantenimiento orientado a produccion.
- Dependencia de version: Qwen3.5 requiere `transformers>=5`; entornos con versiones anteriores no podran cargar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-if
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper (arXiv): https://arxiv.org/abs/2609.35347
- Pagina del proyecto: https://lixin.ai/DN-MOPD
- Codigo: https://github.com/LiXin97/DN-MOPD
- Recetas de entrenamiento Qwen3.5: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Licencia (Apache-2.0): https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-if/blob/main/LICENSE
