# sugiv/tiny-clm-qwen3-1.7b-lora

## Resumen

Tiny CLM es un conjunto de adaptadores LoRA (PEFT) sobre el modelo Qwen3-1.7B, publicado por el usuario sugiv, que reproduce a pequeña escala el mecanismo de aprendizaje por refuerzo descrito en el artículo *Context Language Models* (Shao et al., arXiv 2609.37725, CC BY 4.0). No es un modelo de propósito general: enseña al modelo base a gestionar su propia ventana de contexto de 2.048 tokens mediante cinco acciones discretas (OFFLOAD, GREP, NOTE, ANSWER y READY) dentro de una tarea sintética de tipo KV Store.

El entrenamiento sigue un esquema de GRPO por pasos con una ventaja de eficiencia condicionada al éxito (*success-gated efficiency advantage*, w_eff 0.25), aplicado sobre un arranque en caliente de SFT. El repositorio publica adaptadores en formato safetensors bajo licencia Apache-2.0 y ocupa 4,0 GB, ya que incluye todos los checkpoints de las variantes de recompensa R1, R2 y R3 y de la ablación E5.

Su relevancia es fundamentalmente de investigación: es un artefacto reproducible, entrenable en una sola RTX 3090/4090, para estudiar cómo el diseño de la recompensa afecta a las políticas de gestión de contexto en modelos pequeños. No hay evidencia de uso en producción: el repositorio acumula 0 descargas y 0 "likes" desde su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3-1.7B) con adaptadores LoRA sobre todas las capas lineales (r 32, alpha 64) |
| Parametros totales | 1.700 millones aproximadamente en el modelo base; los adaptadores LoRA anaden un subconjunto entrenable cuyo recuento exacto no se publica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens gestionados activamente por la politica en la tarea KV Store; el modelo base Qwen3-1.7B soporta 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (los adaptadores se guardan en bf16; no se publican versiones GGUF ni pre-cuantizadas) |
| Idiomas soportados | no disponible (la model card del adaptador no declara idiomas; el entrenamiento se realiza sobre una tarea sintetica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA; el modelo base debe descargarse por separado) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-1.7B, un transformer decoder-only de 1.700 millones de parametros. La intervencion es puramente LoRA: rango 32, alpha 64, aplicado a todas las capas lineales y guardado en bf16, de modo que los pesos base permanecen intactos y congelados.

El entrenamiento se divide en dos fases. Primero un arranque en caliente por SFT (la ejecucion completa `e2_sft` alcanza 213 pasos y ronda el 100 % de precision en la tarea; el checkpoint usado por los experimentos de RL es `e2_cal/adapter_step8`, seleccionado por una regla de calibracion). Despues se aplica GRPO por pasos con 4 prompts x 8 rollouts por paso, 40 pasos, learning rate 5e-5, KL 0.01 con estimador k3 respecto al adaptador de arranque en caliente, clipping [0.2, 0.28], truncated importance sampling, dynamic sampling y media de tokens por trayectoria. Los rollouts se generan con vLLM 0.30 a temperatura 0.7 y todo el entrenamiento cabe en una unica RTX 3090/4090.

La innovacion tecnica es la funcion de recompensa: frente a R1 (solo recompensa de resultado) y R3 (penalizacion de coste ingenua, sin gating), R2 anade una ventaja de eficiencia condicionada al exito con w_eff 0.25, de modo que el ahorro de contexto solo se premia cuando la respuesta es correcta. La ablacion E5 entrena la misma recompensa R1 unicamente sobre la transcripcion final. El entorno de la tarea requiere que el modelo emita acciones OFFLOAD, GREP, NOTE, ANSWER y READY para administrar sus 2.048 tokens de contexto, y los prompts deben renderizarse con el renderer del proyecto (ChatML con thinking desactivado).

## Capacidades

- Gestion explicita del propio contexto mediante cinco acciones: OFFLOAD (descargar informacion de la ventana), GREP (recuperarla), NOTE, ANSWER y READY.
- Razonamiento por pasos sobre una tarea sintetica de KV Store con restriccion de ventana de 2.048 tokens.
- Politica de descarga temprana ("offload immediately") en las ejecuciones que escapan del plateau del arranque en caliente, descrita en la model card como favorable a la cache.
- Seleccion de checkpoint por validacion: cada ejecucion incluye `ckpt_best`, `adapter_latest`, `adapter_step0` y una copia congelada de referencia (`*/ref/`) usada como referencia KL.
- No se documentan capacidades de tool calling general, function calling, agentes genericos, vision, audio ni modo thinking; el propio renderer del proyecto desactiva el thinking.
- Capacidades multilingues: no disponibles.
- Generacion de texto libre, codigo o matematicas: no evaluadas ni documentadas.

## Casos de uso

- Reproduccion del articulo Context Language Models: cargar los adaptadores junto con `env/render.py` y `eval/run_eval.py` del repositorio de codigo para verificar el claim de RL (GRPO por pasos con ventaja de eficiencia condicionada al exito) sobre el entorno KV Store de 2.048 tokens.
- Estudio de diseno de recompensas: comparar directamente los checkpoints R1 (`e3_r1_s{0,1,2}`), R2 (`e3_r2_s{0,1,2}`) y R3 (`e3_r3_s{0,1,2}`) para medir como el gating por exito evita que la penalizacion de coste degrade la precision.
- Ablacion sobre la senal de recompensa: usar las ejecuciones E5 (`e5_final_s{0,1,2}`) para analizar que cambia en la politica aprendida cuando solo se recompensa la transcripcion final frente al proceso completo.
- Prototipo de politicas de memoria para agentes: el adaptador aprende cuando emitir OFFLOAD para liberar contexto y cuando GREP para recuperarlo, y sirve como punto de partida conceptual para agentes que operan con ventanas fijas y cache de KV.
- Medir el impacto de la politica de contexto en el coste de inferencia: dado que las mejores ejecuciones adoptan una politica cache-friendly, el adaptador permite instrumentar con vLLM como varia el prefill/decodificacion segun el comportamiento aprendido.
- Fine-tuning adicional: al ser un adaptador LoRA (r 32, alpha 64, todas las capas lineales) se puede continuar el entrenamiento sobre otros entornos o tareas de gestion de contexto sin tocar los pesos base de Qwen3-1.7B.
- Docencia y divulgacion: ejemplo compacto y ejecutable en una sola GPU de consumo de RL aplicado a decisiones discretas de gestion de contexto, con pre-registro y resultados publicados por el autor.

## Benchmarks y rendimiento

No se publican resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). Los unicos datos disponibles proceden de la tarea sintetica del propio proyecto:

| Condicion | Metrica | Resultado |
|---|---|---|
| SFT completo (`e2_sft/adapter`) | Precision en la tarea KV Store | ~100 % (no usado para RL) |
| `e3_r1_s0`, `e3_r1_s2`, `e3_r2_s2`, `e3_r3_s1`, `e3_r3_s2`, `e5_final_s0`, `e5_final_s1` | Precision en test con presion >= 2x | >= 0,99 |
| Resto de ejecuciones de RL | Precision en test | No superan el plateau del arranque en caliente (valor numerico no disponible) |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: la model card indica explicitamente una unica RTX 3090/4090 para los 40 pasos de GRPO, con rollouts generados por vLLM 0.30.
- Tamano del repositorio: 4,0 GB, porque incluye todos los adaptadores de las distintas ejecuciones mas las copias congeladas de referencia.
- Inferencia en bf16: el modelo base de 1,7B ocupa aproximadamente 3,4 GB de pesos; los adaptadores LoRA anaden una fraccion adicional no cuantificada en la model card.
- GPU de consumo: cabe en cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) manteniendo el modelo base en bf16. No se publican adaptadores pre-cuantizados a 8 o 4 bits.
- CPU: teoricamente posible con llama.cpp u Ollama, pero requeriria fusionar el adaptador con el modelo base y convertirlo a GGUF; no se ofrecen pesos GGUF ni instrucciones oficiales.
- Opciones de despliegue: transformers + peft es la ruta oficial descrita en la model card (especificando `subfolder` para elegir ejecucion y checkpoint); vLLM 0.30 es la version usada durante el entrenamiento; TGI, llama.cpp y Ollama no estan documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny CLM (adaptador sobre Qwen3-1.7B) | 1,7B + LoRA r 32 | 2.048 tokens gestionados (32.768 en la base) | Gestion de contexto en tarea KV Store | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3-1.7B (modelo base, sin adaptador) | 1,7B | 32.768 tokens | Proposito general | Apache-2.0 | HuggingFace |
| Otros adaptadores de gestion de contexto de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada otros adaptadores comparables de gestion de contexto, ni datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de investigacion: el adaptador esta entrenado exclusivamente para un entorno sintetico de KV Store con acciones predefinidas; su comportamiento fuera de ese entorno no ha sido evaluado.
- Volumen de entrenamiento muy reducido: 40 pasos de GRPO con 4 prompts x 8 rollouts por paso, lo que implica un riesgo alto de sobreajuste al entorno y a los prompts de entrenamiento.
- Formato de prompt obligatorio: los prompts deben construirse con el renderer del proyecto (ChatML con thinking desactivado). Usar el chat template estandar de Qwen3 puede degradar o invalidar la politica aprendida.
- Seleccion de checkpoint critica: el repositorio contiene muchas variantes (`e2_cal`, `e2_sft`, `e3_r1/r2/r3`, `e5_final`, `pilot`, `pilot2`); cargar una carpeta distinta de `ckpt_best` o de las ejecuciones que escapan del plateau cambia el comportamiento de forma sustancial.
- Precision en la tarea: solo siete ejecuciones superan el plateau con >= 0,99 de precision en test a presion >= 2x; el resto queda en el nivel del arranque en caliente. No se publican los valores exactos del resto.
- Idiomas: no declarados; el entrenamiento se realiza sobre una tarea sintetica, por lo que no hay garantia de comportamiento multilingue.
- Alucinacion: no evaluada fuera del entorno de entrenamiento; no hay datos al respecto.
- Sesgos: no evaluados ni documentados en la informacion disponible.
- Licencia: los adaptadores son Apache-2.0, igual que el modelo base Qwen3-1.7B, por lo que el uso comercial esta permitido. El metodo subyacente procede de Shao et al., arXiv 2609.37725, publicado bajo CC BY 4.0, por lo que se debe citar el articulo.
- Madurez: 0 descargas y 0 "likes"; no existe evidencia de validacion por terceros ni de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sugiv/tiny-clm-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Articulo: Context Language Models, Shao et al., 2026 (CC BY 4.0): https://arxiv.org/abs/2609.37725
- Repositorio de codigo del proyecto: no disponible (la model card lo menciona como "project repository" con `README.md`, `PREREGISTRATION.md`, `RESULTS.md`, `env/render.py` y `eval/run_eval.py`, pero no incluye la URL)
- Demo: no disponible
