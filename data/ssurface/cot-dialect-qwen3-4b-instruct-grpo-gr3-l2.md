# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l2

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l2` es un adaptador LoRA de 0,1 GB que se apila sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` para inducir un "dialecto" de compresión de cadena de pensamiento de nivel L2. El adaptador forma parte de una colección de investigación sobre compresión de razonamiento (Chain-of-Thought Compression Dialects) publicada por el autor ssurface. Su propósito concreto es servir como artefacto de ablación para estudiar el impacto del diseño de la función de recompensa en el entrenamiento con GRPO, en concreto la variante de reescalado multiplicativo `gr3`.

El modelo fue entrenado sobre 6950 ejemplos de GSM8K reexpresados por un modelo profesor a nivel L2 (prosa comprimida con pasos en viñetas), con una mediana de longitud de cadena de 140 caracteres dentro de la etiqueta `thinking`. No fue evaluado de forma independiente: se publica únicamente como pieza del grid de ablación, de modo que la comparación de diseño de recompensas del artículo pueda reproducirse. Para usar el adaptador correctamente hay que cargarlo primero sobre el modelo SFT fusionado (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l2`) y después aplicar este adaptador GRPO, no directamente sobre el base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) + adaptador LoRA |
| Parametros totales | 4B (modelo base) + adaptador LoRA (r=16, alpha=32) |
| Parametros activos | no disponible (adaptador LoRA, no MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion del adaptador) |
| Tipos de cuantizacion | safetensors (bf16 en el ejemplo de uso) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo transformer de 4 000 millones de parametros con atencion sdpa. El entrenamiento se realizo en dos fases: primero un modelo SFT de nivel L2 (no incluido en este repo) y despues una etapa de refuerzo con GRPO sobre el modelo SFT fusionado. La configuracion de GRPO usa `trl.GRPOTrainer` con `transformers` estandar, 8 generaciones por prompt, batch 64x1, max completion de 256 tokens, learning rate 1e-05, coeficiente KL beta 0.0 y loss tipo dapo.

La funcion de recompensa combina tres componentes: `correctness` (basada en el recuento de pasos de la solucion dorada, de modo que los problemas mas dificiles valen mas), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`) y `gr3`, un reescalado multiplicativo de la recompensa positiva combinada con un suelo de 0.3. La innovacion tecnica destacable es la verificacion de que el adaptador no es inerte: se comprobo que `lora_B != 0` antes de publicar, descartando 13 adaptadores que fallaron esa comprobacion. El entrenamiento se ejecuto en una unica NVIDIA A100 80GB.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel L2 (prosa comprimida o pasos en viñetas).
- Generacion de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507.
- Soporte de tool calling y function calling: no documentado en la informacion del adaptador; depende del modelo base.
- Soporte de agentes y multi-step reasoning: no documentado especificamente para este adaptador.
- Capacidades multilingues: limitadas al ingles segun la metadata del modelo.
- Capacidades especiales: el adaptador modifica el estilo de razonamiento, produciendo cadenas de pensamiento mucho mas cortas (mediana de 140 caracteres frente a 532 en L1).

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: este adaptador permite reproducir el experimento de ablacion del diseño de recompensa `gr3` comparandolo con el modelo principal `grpo-l2` y con el SFT base, para aislar el efecto del reescalado multiplicativo.
- Evaluacion de robustez de GRPO con recompensas compuestas: util para estudiar como el componente `correctness` ponderado por pasos afecta al rendimiento en problemas de dificultad variable.
- Generacion de razonamientos concisos para problemas de palabras: el nivel L2 produce explicaciones de 140 caracteres de mediana, adecuadas para entornos donde se requieren respuestas breves y estructuradas.
- Benchmarking de dialectos de compresion: permite medir la degradacion de precision al pasar de L1 (prosa extensa) a L2 (viñetas) en el mismo modelo base.
- Validacion de pipelines de entrenamiento con PEFT: el adaptador sirve como ejemplo de carga secuencial de dos adaptadores (SFT + GRPO) sobre un modelo base.
- Control de calidad de adaptadores LoRA: la verificacion `lora_B != 0` documentada en la model card es un caso de estudio para detectar adaptadores inertes que cargan sin error pero no aportan capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este adaptador "no fue evaluado por separado" y que los niveles con numeros reportados son los del conjunto principal de la coleccion. Se menciona una precision con intervalo de confianza del 95% de aproximadamente ±2,7 puntos porcentuales para n=1317 y ±4,4 para n=500, pero sin cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA de 0,1 GB se carga sobre el modelo base de 4B en bf16, que requiere aproximadamente 8-10 GB de VRAM en funcion de la longitud de contexto y el batch. Con cuantizacion de 4 bits del modelo base, puede reducirse a unos 4-5 GB.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), H100, RTX 4090 (24 GB), RTX 3090 (24 GB) o GPUs consumer con al menos 8 GB para el modelo base en bf16.
- Compatibilidad con GPU consumer: si, siempre que se cuantice el modelo base (por ejemplo, con bitsandbytes o GGUF) para caber en 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF) o directamente con `transformers` + `peft` cargando el adaptador sobre el modelo fusionado.
- Latencia y throughput: no disponibles; dependen del modelo base y del hardware. El adaptador en si anade una sobrecarga minima al ser LoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-gr3-l2` (este) | 4B + LoRA | no disponible | GRPO con recompensa gr3 | apache-2.0 | Ablacion, no evaluado |
| `cot-dialect-qwen3-4b-instruct-grpo-l2` | 4B + LoRA | no disponible | GRPO con recompensa estandar | apache-2.0 | Modelo principal del nivel L2 |
| `cot-dialect-qwen3-4b-instruct-sft-l2` | 4B + LoRA | no disponible | SFT sobre GSM8K L2 | apache-2.0 | Modelo SFT base para apilar el GRPO |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | no disponible | Instruct | apache-2.0 | Modelo base sin adaptador |

La comparativa se limita a la propia familia de adaptadores, ya que no se dispone de datos de rendimiento publicados para este artefacto. El proposito del modelo es aislar el efecto de la recompensa `gr3` frente a la recompensa estandar del modelo `grpo-l2`.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre problemas de palabras matematicas (GSM8K); no se recomienda su uso fuera de ese dominio sin validacion previa.
- La precision cae con la dificultad del problema, especialmente en los niveles comprimidos como L2.
- Es un artefacto de ablacion: fue entrenado para responder a una pregunta concreta sobre diseño de recompensas y puede ser peor que el modelo principal del mismo nivel.
- No fue evaluado por separado; los numeros reportados en la coleccion corresponden a otros modelos del conjunto.
- Requiere apilarse sobre el modelo SFT fusionado (`sft-l2`), no directamente sobre el base; cargarlo sobre `Qwen3-4B-Instruct-2507` sin el paso intermedio no reproducira los resultados esperados.
- Entrenado con una unica semilla (salvo que el nombre del repo indique lo contrario); diferencias de unos pocos puntos porcentuales estan dentro del ruido estadistico.
- Solo soporta ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion en razonamientos comprimidos: la brevedad del dialecto L2 puede favorecer respuestas incorrectas si el modelo no tiene suficiente margen para el calculo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3-l2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l2
- Modelo principal del nivel L2: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l2
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Cita del articulo (sin URL publica disponible en la informacion proporcionada):

```bibtex
@misc{cot-compression-dialects,
  title  = {Chain-of-Thought Compression Dialects},
  author = {Frolov, Anatolii},
  year   = {2026}
}
```
