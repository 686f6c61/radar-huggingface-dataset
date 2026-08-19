# ssurface/cot-dialect-qwen3-4b-instruct-grpo-lenpass-l4

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-lenpass-l4` es un adaptador LoRA que transforma el modelo Qwen/Qwen3-4B-Instruct-2507 en un razonador capaz de operar en el "dialecto" de compresion de cadena de pensamiento de nivel L4, caracterizado por asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). Forma parte de la familia de investigacion "Chain-of-Thought Compression Dialects" del autor ssurface, que estudia como comprimir el razonamiento interno de los modelos hasta 33 veces (de 532 caracteres de mediana en L1 a 16 en L5).

Este adaptador concreto es una **ablacion** del diseno de recompensas, no uno de los modelos principales de la coleccion. Se entreno con GRPO bajo una variante de recompensa `lenpass` para permitir que la comparacion de diseno de recompensas del articulo pueda reproducirse de forma independiente. El modelo principal para este nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4`.

El adaptador se entreno sobre 6976 ejemplos de GSM8K re-expresados a nivel L4 por un modelo profesor, con una mediana de longitud de cadena de 41 caracteres dentro de la etiqueta `thinking`. El entrenamiento se realizo con `trl.GRPOTrainer` sobre un unico NVIDIA A100 de 80 GB. No fue evaluado por separado: existe como artefacto de entrenamiento para la cuadricula de ablaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Qwen/Qwen3-4B-Instruct-2507 (Transformer denso) |
| Parametros totales | no disponible (adaptador ~0.1 GB; modelo base 4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador en bf16) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO sobre el modelo SFT fusionado del nivel L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`), no sobre el base sin ajustar. La funcion de recompensa combina cuatro componentes: `correctness` (ponderada por el numero de pasos de la solucion dorada, de modo que los problemas mas dificiles valen mas), `format` (exige un bloque `thinking` y `response` seguido de `#### <respuesta>`), `length` (recompensa graduada que empuja la cadena hacia la longitud objetivo del nivel) y `gdpo` (normaliza cada recompensa dentro del grupo antes de sumarlas, evitando que un componente domine). Se usa loss tipo dapo, 8 generaciones por prompt, batch de 64 con acumulacion 1, maximo de 256 tokens de completado, learning rate de 1e-05 y coeficiente KL de 0.

Un detalle tecnico destacable: el entrenamiento se realizo con `transformers` estandar y atencion `sdpa`, no con kernels fusionados, porque la ruta fusionada producia adaptadores con matrices `lora_B` todas a cero (matematicamente inertes aunque cargaban sin error). Todos los adaptadores de la coleccion fueron verificados con `lora_B != 0` antes de publicarse; 13 que fallaron esa comprobacion fueron retenidos.

## Capacidades

- Razonamiento matematico en formato comprimido: resuelve problemas de palabras aritmeticas usando cadenas de pensamiento ultracompactas de nivel L4 (asignaciones encadenadas con punto y coma).
- Generacion de texto conversacional: hereda las capacidades del modelo base Qwen3-4B-Instruct-2507 fuera del prompt de activacion del dialecto.
- Razonamiento con compresion controlada: el prompt de activacion es `Solve this using Level 4 (Shorthand). Problem: {problema}`.
- No soporta tool calling, vision ni audio (no documentado en la informacion disponible).
- No dispone de modo thinking hibrido ni de capacidades multilingues adicionales mas alla de las del base.

## Casos de uso

- Reproduccion de experimentos de ablacion: permite re-ejecutar la comparacion de diseno de recompensas del articulo sin depender de las afirmaciones del autor, ya que el adaptador se publico explicitamente con ese fin.
- Investigacion en compresion de cadenas de pensamiento: util para estudiar como la compresion del razonamiento interno afecta a la precision en problemas matematicos, comparando los niveles L1-L5 de la familia.
- Evaluacion de robustez del razonamiento comprimido: sirve para medir la degradacion de precision cuando la cadena de pensamiento se acorta drasticamente (de 532 a 41 caracteres de mediana).
- Comparacion de metodos GRPO: como artefacto de referencia para contrastar variantes de recompensa (en este caso `lenpass`) frente a las del modelo principal del mismo nivel.
- Estudio de artefactos de entrenamiento: investigacion sobre por que ciertas configuraciones de kernels fusionados producen adaptadores inertes (matrices `lora_B` a cero), un problema relevante para pipelines de RLHF.
- Educacion en RLHF/GRPO: ejemplo didactico de como disenar recompensas multicomponente con normalizacion `gdpo` y loss `dapo` sobre un modelo de tamano medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este adaptador "no fue evaluado por separado" y que existe como artefacto de entrenamiento para la cuadricula de ablaciones; los niveles con numeros publicados son los del conjunto principal de la coleccion.

## Requisitos de hardware

- El adaptador LoRA ocupa ~0.1 GB; la carga adicional en memoria sobre el modelo base es minima.
- El modelo base Qwen3-4B-Instruct-2507 en bf16 ocupa aproximadamente 8 GB de VRAM, por lo que cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3060 (12 GB) con cuantizacion del base.
- Entrenamiento: se realizo con 1x NVIDIA A100 de 80 GB, aunque un adaptador LoRA de r=16 sobre un base de 4B podria entrenarse con menos recursos.
- Despliegue: compatible con el stack de HuggingFace (`transformers` + `peft`); para servidores se puede fusionar el adaptador y servir con vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-l4` | LoRA sobre Qwen3-4B | 4B | no disponible | apache-2.0 | Modelo principal del nivel L4, con benchmarks publicados |
| `cot-dialect-qwen3-4b-instruct-grpo-lenpass-l4` | LoRA sobre Qwen3-4B | 4B | no disponible | apache-2.0 | Ablacion de recompensa `lenpass`, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | Denso | 4B | no disponible | apache-2.0 | Modelo base sin compresion de cadena de pensamiento |

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en problemas de matematicas con palabras (GSM8K); no generaliza fuera de ese dominio.
- La precision cae con la dificultad del problema, y de forma mas acusada en los niveles comprimidos.
- Es un artefacto de ablacion: fue entrenado para responder a una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Requiere apilarse sobre el modelo SFT fusionado (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`); cargarlo directamente sobre el base no reproduce los resultados.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales estan dentro del ruido (intervalo de confianza del 95% de ~2.7 puntos porcentuales con n=1317 y ~4.4 con n=500).
- El uso del adaptador requiere el prompt especifico de activacion del nivel L4.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta pensado para produccion; es un artefacto de investigacion con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-lenpass-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo SFT del nivel L4 (requerido para apilar): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
