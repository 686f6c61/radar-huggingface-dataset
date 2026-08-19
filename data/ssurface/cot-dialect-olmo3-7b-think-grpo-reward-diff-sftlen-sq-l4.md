# ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l4` es un adaptador LoRA de 0,2 GB desarrollado por ssurface que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para producir cadenas de pensamiento ultracompactas en un "dialecto" de nivel L4 (asignaciones encadenadas con punto y coma). Se trata de una **ablación de diseño de recompensa**, no de un modelo principal: el mismo nivel L4 entrenado con una recompensa estándar está publicado como `ssurface/cot-dialect-olmo3-7b-think-grpo-l4`. El objetivo de esta variante es permitir que la comparación de recompensas descrita en el paper pueda reproducirse de forma independiente.

El adaptador se entrena con GRPO sobre el modelo SFT fusionado para el nivel L4 (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), usando una función de recompensa que pondera al cuadrado la corrección y la desviación de longitud. El resultado es un modelo que resuelve problemas de GSM8K con una precisión del 66,4% en el test, generando cadenas de razonamiento de unos 41 caracteres de mediana. Está pensado exclusivamente para investigación en compresión de cadenas de pensamiento y no para uso productivo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Olmo-3-7B-Think) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (~10M estimados, no verificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65K (modelo base, segun fuentes externas) |
| Tipos de cuantizacion | No disponible (adaptador en bf16, safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es `allenai/Olmo-3-7B-Think`, un transformer de 7B parametros preentrenado en Dolma 3 y postentrenado para razonamiento largo. Sobre este, el autor entrena primero un modelo SFT para el nivel L4 de compresion de cadena de pensamiento, usando 6976 ejemplos de GSM8K reexpresados por un modelo profesor. Posteriormente aplica GRPO sobre el modelo SFT fusionado con una funcion de recompensa compuesta por tres terminos: `correctness_sq` (correccion con peso cuadratico), `format` (estructura obligatoria `thinking... response` + `#### <answer>`) y `sft_length_sq` (desviacion de longitud al cuadrado). La perdida es de tipo DAPO, con 8 generaciones por prompt, batch 64, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL 0.0. El adaptador LoRA tiene r=16 y alpha=32, y se entreno en una unica NVIDIA A100 80GB.

Una nota tecnica relevante: el entrenamiento se realizo con `transformers` stock y atencion `sdpa`, no con kernels fusionados, porque el autor verifico que la ruta fusionada producia adaptadores con matrices `lora_B` identicamente nulas. Todos los adaptadores publicados fueron validados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico sobre problemas de palabras (GSM8K) con cadenas de pensamiento comprimidas en un dialecto de nivel L4 (ejemplo: `K=18*2.5;D=8*4;T=K+D->T=77`).
- Generacion de texto en ingles con formato estructurado de respuesta (`thinking` + `response` + `#### <answer>`).
- No soporta tool calling, ni agentes, ni vision, ni audio.
- No es multilingue: solo ingles.
- Capacidad limitada a razonamiento aritmetico de nivel escolar; no generaliza a otras tareas de razonamiento fuera del dominio de entrenamiento.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: este adaptador sirve para reproducir el experimento de ablacion de recompensa descrito en el paper "Chain-of-Thought Compression Dialects", comparando el efecto de la recompensa `sft_length_sq` frente a la estandar.
- Evaluacion de disenos de recompensa en RLHF/GRPO: permite aislar el impacto de ponderar al cuadrado la correccion y la longitud, util para disenar funciones de recompensa en otros proyectos.
- Estudio de trade-off entre precision y longitud de razonamiento: al comparar este modelo con el principal L4, se puede medir como afecta la recompensa a la calidad final.
- Generacion de datos sinteticos de razonamiento comprimido: el modelo puede producir ejemplos de cadenas de pensamiento cortas para entrenar otros modelos o para analisis de compresion.
- Benchmarking de metodos de decodificacion: al ser un modelo pequeno (7B) y con salidas muy cortas, es util para probar tecnicas de decodificacion o evaluacion de razonamiento.
- Educacion y divulgacion: como ejemplo practico de como la eleccion de recompensa altera el comportamiento de un modelo de razonamiento, util en cursos de RL y LLM.

## Benchmarks y rendimiento

El unico resultado publicado es el siguiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 66,4% |

Condiciones: decodificacion greedy, single-turn, sin ejemplos, sin self-consistency. No se han publicado resultados comparativos con el modelo principal L4 ni con el modelo base en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB, pero debe cargarse sobre el modelo base Olmo-3-7B-Think (7B parametros) en bf16, lo que requiere aproximadamente 14 GB de VRAM solo para el modelo base.
- Con cuantizacion Q4_K_M del modelo base, la VRAM minima estimada es de unos 5 GB, segun datos publicados para el SFT equivalente.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), RTX 4090 (24 GB), o cualquier GPU con al menos 16 GB de VRAM para inferencia en bf16.
- Despliegue: transformers + PEFT (carga del adaptador y fusion), vLLM con soporte LoRA, o llama.cpp si se convierte el modelo fusionado a GGUF.
- Latencia: al generar cadenas de solo ~41 caracteres, la inferencia es rapida; el throughput dependera del hardware y de la implementacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para el modelo principal `ssurface/cot-dialect-olmo3-7b-think-grpo-l4` ni para el modelo base Olmo-3-7B-Think en la informacion proporcionada. Por tanto, no es posible realizar una comparativa cuantitativa fiable. Cualitativamente, este adaptador es una variante de ablacion y se espera que rinda peor que el modelo principal del mismo nivel, como indica el propio autor.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas con palabras (GSM8K); no generaliza a otras tareas de razonamiento.
- La precision cae con la dificultad del problema, especialmente en los niveles de compresion mas agresivos.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensa y puede ser peor que el modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l4` y fusionarlo; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de ~2,7 pp).
- No soporta otros idiomas ni capacidades multimodales.
- Licencia Apache 2.0, sin restricciones de uso comercial conocidas, pero su utilidad en produccion es nula dado su proposito de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-l4
- Modelo SFT necesario: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Paper (cita en la model card): "Chain-of-Thought Compression Dialects" de Anatolii Frolov (2026)
